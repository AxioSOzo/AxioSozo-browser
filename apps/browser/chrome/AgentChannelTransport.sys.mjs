/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

import { AgentUnixSocketPath, validateAgentSocketPath } from "./AgentUnixSocketPath.sys.mjs";
const ABORTED = 0x804b0002; // NS_BINDING_ABORTED; nsITransport.close requires a reason.
const ENDPOINT_CODES = new Set([
  "SOCKET_IN_USE", "SOCKET_PATH_BLOCKED", "INVALID_SOCKET_PATH",
  "EXACT_SOCKET_METADATA_UNAVAILABLE", "UNAVAILABLE",
]);
const failure = code => Object.assign(new Error(code), { code });
export const CHANNEL_ENDPOINT_REASONS = Object.freeze({
  LISTENER_STOPPED: "LISTENER_STOPPED", SOCKET_LOCK_LOST: "SOCKET_LOCK_LOST",
  SOCKET_IN_USE: "SOCKET_IN_USE", SOCKET_PATH_BLOCKED: "SOCKET_PATH_BLOCKED",
  INVALID_SOCKET_PATH: "INVALID_SOCKET_PATH",
  EXACT_SOCKET_METADATA_UNAVAILABLE: "EXACT_SOCKET_METADATA_UNAVAILABLE",
  CLEANUP_INCOMPLETE: "CLEANUP_INCOMPLETE", UNAVAILABLE: "UNAVAILABLE",
});

// Only initWithFilename is exposed. There is deliberately no TCP factory,
// socket port, HTTP fallback, or web-content entry point in this adapter.
// onStateChange receives immutable machine-only snapshots; observers do not
// own lifecycle state and their throws/rejections cannot interrupt shutdown.
export class AgentChannelEndpoint {
  #runtime;
  #controller;
  #onStateChange;
  #status = Object.freeze({ state: "disabled", reason: null });
  #server = null;
  #claim = null;
  #starting = null;
  #startingServer = null;
  #stopping = null;
  #generation = 0;
  #pendingClaims = new Set();
  #failedClaims = new Set();
  #cleanupRecords = new WeakMap();
  #disposingLocks = new WeakSet();
  #controllerStopFailed = false;
  #retainedCleanupFailed = false;
  constructor({ runtime, controller, onStateChange = null }) {
    this.#runtime = runtime;
    this.#controller = controller;
    this.#onStateChange = onStateChange;
    this.#publish(this.#status, this.#generation, true);
  }
  get status() { return this.#status; }
  ownershipDiagnostics() {
    return Object.freeze({ pending_claims: this.#pendingClaims.size, failed_claims: this.#failedClaims.size,
      retained_cleanup_failed: this.#retainedCleanupFailed, paths: this.#runtime.paths?.ownershipDiagnostics?.() ?? null });
  }
  #publish(status, generation = this.#generation, force = false) {
    if (generation !== this.#generation) return false;
    const changed = this.#status.state !== status.state || this.#status.reason !== status.reason ||
      this.#status.socketPath !== status.socketPath;
    if (!changed && !force) return true;
    this.#status = Object.freeze({ ...status });
    const event = Object.freeze({ kind: "endpoint", ...this.#status });
    try { Promise.resolve(this.#onStateChange?.(event)).catch(() => {}); } catch {}
    return generation === this.#generation;
  }
  #cleanup(claim, retryFailed = false) {
    const previous = this.#cleanupRecords.get(claim);
    if (previous && (previous.state !== "failed" || !retryFailed)) return previous.promise;
    // release() settles lock.lost too. A deliberate owned release must not
    // replace a startup refusal with a fictitious external lock-loss reason.
    if (claim.lock && typeof claim.lock === "object") this.#disposingLocks.add(claim.lock);
    const record = { state: "pending", promise: null };
    record.promise = Promise.resolve().then(() => this.#runtime.paths.cleanup(claim)).then(value => {
      record.state = "complete";
      this.#pendingClaims.delete(claim);
      this.#failedClaims.delete(claim);
      return value;
    }, () => {
      record.state = "failed";
      this.#failedClaims.add(claim);
      // A failed lock release remains owned even after listener shutdown. Do
      // not let a newer disabled snapshot conceal this unresolved resource.
      this.#publish({ state: "unavailable", reason: CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE });
      throw failure(CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE);
    });
    this.#cleanupRecords.set(claim, record);
    // Listener/lock callbacks do not await shutdown, but its rejection remains
    // observable by stop()/start() and must never become an unhandled promise.
    record.promise.catch(() => {});
    return record.promise;
  }
  async start({ enabled = true, socketPath } = {}) {
    if (!enabled) { await this.stop(); return this.status; }
    if (this.#stopping) {
      const generation = this.#generation;
      await this.#stopping;
      // Same-barrier enables join the successor; a later disable still wins.
      if (generation !== this.#generation) {
        if (!this.#stopping && this.status.state === "starting" && this.#starting) return this.#starting;
        return this.status;
      }
    }
    if (this.#failedClaims.size || this.#retainedCleanupFailed || this.#runtime.paths?.hasRetainedCleanup === true)
      throw failure(CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE);
    if (this.#controllerStopFailed) throw failure(CHANNEL_ENDPOINT_REASONS.UNAVAILABLE);
    if (this.#server) return this.status;
    if (this.#starting) return this.#starting;
    const generation = ++this.#generation;
    const starting = Promise.resolve().then(() => this.#start(socketPath, generation))
      .finally(() => { if (this.#starting === starting) this.#starting = null; });
    this.#starting = starting;
    this.#publish({ state: "starting", reason: null }, generation);
    return starting;
  }
  async #start(path, generation) {
    let server = null, claim = null, installed = false, serverClosed = false, startingServer = null;
    const closeServer = () => {
      if (!server || serverClosed) return;
      serverClosed = true;
      try { server.close(); } catch {}
    };
    try {
      if (generation !== this.#generation) return this.status;
      validateAgentSocketPath(path);
      if (typeof this.#runtime?.createServerSocket !== "function" ||
          typeof this.#runtime?.openConnection !== "function")
        throw failure("UNAVAILABLE");
      claim = await this.#runtime.paths.prepare(path);
      this.#pendingClaims.add(claim);
      // Observe process loss as soon as its owned claim reaches this endpoint,
      // including rejection during verification or a cancelled startup.
      const lock = claim.lock;
      if (lock.lost != null) {
        const lost = () => {
          if (generation === this.#generation && !this.#disposingLocks.has(lock))
            this.#beginStop({ state: "unavailable", reason: CHANNEL_ENDPOINT_REASONS.SOCKET_LOCK_LOST });
        };
        Promise.resolve(lock.lost).then(lost, lost).catch(() => {});
      }
      // Give an already-settled loss promise its admission boundary before bind.
      await Promise.resolve();
      if (generation !== this.#generation) { await this.#cleanup(claim); return this.status; }
      server = this.#runtime.createServerSocket();
      startingServer = { server, close: closeServer };
      this.#startingServer = startingServer;
      if (generation !== this.#generation) { closeServer(); await this.#cleanup(claim); return this.status; }
      server.initWithFilename(this.#runtime.file(path), 0o600, 8);
      if (generation !== this.#generation) { closeServer(); await this.#cleanup(claim); return this.status; }
      const verified = await this.#runtime.paths.verifyBound(claim);
      this.#pendingClaims.delete(claim);
      claim = verified;
      this.#pendingClaims.add(claim);
      if (generation !== this.#generation) {
        closeServer();
        await this.#cleanup(claim);
        return this.status;
      }
      if (this.#startingServer === startingServer) this.#startingServer = null;
      this.#claim = claim;
      this.#server = server;
      installed = true;
      const listener = {
        onSocketAccepted: (_server, socket) => {
          if (this.#server !== server || generation !== this.#generation || this.status.state !== "listening") {
            try { socket.close(ABORTED); } catch {} return;
          }
          try { this.#runtime.openConnection(socket, this.#controller); }
          catch { try { socket.close(ABORTED); } catch {} }
        },
        onStopListening: () => {
          if (this.#server === server && generation === this.#generation)
            this.#beginStop({ state: "unavailable", reason: CHANNEL_ENDPOINT_REASONS.LISTENER_STOPPED });
        },
      };
      if (this.#runtime.listenerQI) listener.QueryInterface = this.#runtime.listenerQI;
      server.asyncListen(listener);
      // Native asyncListen may synchronously report listener failure.
      if (this.#server !== server || generation !== this.#generation) return this.status;
      this.#publish({ state: "listening", reason: null, socketPath: path }, generation);
    } catch (cause) {
      // Once installed, a synchronous listener-stop callback may already own
      // closure/cleanup. Share its claim attempt rather than closing twice.
      if (!installed || this.#server === server) {
        if (installed) { this.#server = null; this.#claim = null; }
        closeServer();
      }
      if (claim) { try { await this.#cleanup(claim); } catch {} }
      if (this.#runtime.paths?.hasRetainedCleanup === true) {
        this.#retainedCleanupFailed = true;
        this.#publish({ state: "unavailable", reason: CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE });
      }
      if (this.#failedClaims.size || this.#retainedCleanupFailed || this.#controllerStopFailed || generation !== this.#generation) return this.status;
      const code = ENDPOINT_CODES.has(cause?.code) ? cause.code : "UNAVAILABLE";
      this.#publish({ state: code === "SOCKET_IN_USE" ? "in_use" :
        code === "SOCKET_PATH_BLOCKED" || code === "INVALID_SOCKET_PATH" ? "blocked" : "unavailable", reason: code }, generation);
    } finally {
      if (this.#startingServer === startingServer) this.#startingServer = null;
    }
    return this.status;
  }
  #beginStop(status, retryFailed = false) {
    const generation = ++this.#generation;
    const server = this.#server, startingServer = this.#startingServer;
    const starting = this.#starting, previous = this.#stopping;
    // Only a new explicit stop may retry a failure known when it was called.
    // Failures arising during this same stop remain visible to its caller.
    const retryClaims = retryFailed ? new Set(this.#failedClaims) : new Set();
    // Snapshot retained preparation failures now. A release first failing
    // during this stop is not retried until a later explicit stop.
    const retainedSnapshot = retryFailed ? this.#runtime.paths?.retainedCleanupClaims?.() : null;
    if (this.#runtime.paths?.hasRetainedCleanup === true) this.#retainedCleanupFailed = true;
    this.#server = null;
    this.#startingServer = null;
    this.#claim = null;
    const stopping = Promise.resolve().then(async () => {
      if (previous) { try { await previous; } catch {} }
      if (starting) { try { await starting; } catch {} }
      await Promise.allSettled([...this.#pendingClaims].map(claim => this.#cleanup(claim, retryClaims.has(claim))));
      if (this.#runtime.paths?.hasRetainedCleanup === true) {
        try {
          if (!retainedSnapshot) throw failure(CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE);
          await this.#runtime.paths.cleanupRetained(retainedSnapshot);
          this.#retainedCleanupFailed = this.#runtime.paths.hasRetainedCleanup === true;
        } catch {
          this.#retainedCleanupFailed = true;
          this.#publish({ state: "unavailable", reason: CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE });
          throw failure(CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE);
        }
      } else this.#retainedCleanupFailed = false;
      if (this.#retainedCleanupFailed) throw failure(CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE);
      if (this.#failedClaims.size) throw failure(CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE);
      if (this.#controllerStopFailed) throw failure(CHANNEL_ENDPOINT_REASONS.UNAVAILABLE);
      this.#publish(status, generation);
    }).finally(() => { if (this.#stopping === stopping) this.#stopping = null; });
    stopping.catch(() => {});
    // Install the barrier before controller/transport callbacks can re-enter.
    this.#stopping = stopping;
    try { this.#controller.stop(); if (generation === this.#generation) this.#controllerStopFailed = false; }
    catch {
      this.#controllerStopFailed = true;
      this.#publish({ state: "unavailable", reason: this.#failedClaims.size || this.#retainedCleanupFailed ?
        CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE : CHANNEL_ENDPOINT_REASONS.UNAVAILABLE });
    }
    // A bound startup owns its server before asynchronous metadata verification.
    // Close it promptly; leave its unverified path and cleanup barrier owned.
    startingServer?.close();
    if (server && server !== startingServer?.server) { try { server.close(); } catch {} }
    this.#publish(this.#failedClaims.size || this.#retainedCleanupFailed ?
      { state: "unavailable", reason: CHANNEL_ENDPOINT_REASONS.CLEANUP_INCOMPLETE } :
      this.#controllerStopFailed ? { state: "unavailable", reason: CHANNEL_ENDPOINT_REASONS.UNAVAILABLE } : status, generation);
    return stopping;
  }
  async stop() {
    await this.#beginStop({ state: "disabled", reason: null }, true);
  }
}

/**
 * Stock Gecko cannot supply exact lstat ownership/socket facts. Without a
 * verified POSIX backend this factory reports unavailable before creating
 * any directory or socket. Do not relax the metadata gate to enable it.
 * Node tests invoke this factory only with API-shaped fake Gecko globals.
 */
export function createGeckoAgentTransportRuntime({ exactPosixBackend = null } = {}) {
  const { classes: Cc, interfaces: Ci, results: Cr } = Components;
  const Services = globalThis.Services;
  if (!Services?.tm) throw Object.assign(new Error(), { code: "UNAVAILABLE" });
  return {
    paths: new AgentUnixSocketPath(exactPosixBackend),
    file(path) { const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile); file.initWithPath(path); return file; },
    createServerSocket() { return Cc["@mozilla.org/network/server-socket;1"].createInstance(Ci.nsIServerSocket); },
    listenerQI: ChromeUtils.generateQI(["nsIServerSocketListener"]),
    openConnection(socket, controller) {
      const input = socket.openInputStream(0, 0, 0);
      // Buffered output resolves on an intermediate pipe. Closing at hook EOF
      // could discard its unread bytes; write directly to the async socket.
      const output = socket.openOutputStream(Ci.nsITransport.OPEN_UNBUFFERED, 0, 0).QueryInterface(Ci.nsIAsyncOutputStream);
      const pump = Cc["@mozilla.org/network/input-stream-pump;1"].createInstance(Ci.nsIInputStreamPump);
      const pendingWrites = new Set();
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        for (const reject of pendingWrites) reject(new Error("UNAVAILABLE"));
        pendingWrites.clear();
        try { pump.cancel(Cr.NS_BINDING_ABORTED); } catch {}
        try { input.close(); } catch {}
        try { output.close(); } catch {}
        try { socket.close(Cr.NS_BINDING_ABORTED); } catch {}
      };
      const writable = () => new Promise((resolve, reject) => {
        if (closed) return reject(new Error("UNAVAILABLE"));
        const failed = cause => { pendingWrites.delete(failed); reject(cause); };
        pendingWrites.add(failed);
        try {
          output.asyncWait({
            QueryInterface: ChromeUtils.generateQI(["nsIOutputStreamCallback"]),
            onOutputStreamReady: () => { pendingWrites.delete(failed); resolve(); },
          }, 0, 0, Services.tm.currentThread);
        } catch (cause) { failed(cause); }
      });
      const connection = controller.accept({
        close,
        async write(bytes) {
          for (let offset = 0; offset < bytes.length;) {
            if (closed) throw new Error("UNAVAILABLE");
            const chunk = bytes.subarray(offset, Math.min(offset + 8192, bytes.length));
            let binary = "";
            for (const value of chunk) binary += String.fromCharCode(value);
            try {
              const written = output.write(binary, chunk.length);
              if (written > 0) offset += written;
              else await writable();
            } catch (cause) {
              if (cause.result !== Cr.NS_BASE_STREAM_WOULD_BLOCK) throw cause;
              await writable();
            }
          }
        },
      });
      if (!connection) { close(); return; }
      pump.init(input, 0, 0, false);
      pump.asyncRead({
        QueryInterface: ChromeUtils.generateQI(["nsIStreamListener", "nsIRequestObserver"]),
        onStartRequest() {},
        onDataAvailable(_request, stream, _offset, count) {
          try {
            const binary = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
            binary.setInputStream(stream);
            // Bound per-chunk allocations even when Necko supplies a larger
            // available count. Framing enforces the tighter per-line budget.
            let remaining = count;
            while (remaining > 0 && !closed) {
              const size = Math.min(remaining, 65536);
              connection.receive(Uint8Array.from(binary.readByteArray(size)));
              remaining -= size;
            }
          } catch { connection.disconnect(); }
        },
        onStopRequest() {
          // Includes clean EOF and reset after nc's one-shot write. A complete
          // buffered status hook must be processed regardless of this status.
          connection.end().catch(() => connection.disconnect());
        },
      });
    },
  };
}
