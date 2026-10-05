/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free privileged Gecko stdio adapter. Browser production runs remain
// NOT_AUTHORIZED. Offline tests inject fixed native or fake runtimes.
import { createSubprocessUtf8Reader, SubprocessUtf8Error } from "./SubprocessUtf8.sys.mjs";

export const TRANSPORT_LIMITS = Object.freeze({ requestBytes: 73728, frameBytes: 262144 + 4096,
  resultBytes: 262144, stderrBytes: 16384, pending: 6, startupMs: 5000, closeGraceMs: 1000, killWaitMs: 1000,
  cancelGraceMs: 1000, pipeCloseGraceMs: 1000, replyGraceMs: 1000, defaultRunMs: 180000, maxRunMs: 300000,
  requestsPerHost: 1024 });
const METHODS = Object.freeze(["understand/run", "understand/cancel", "understand/available"]);
const ID = /^[A-Za-z0-9_.:-]{1,160}$/u;
const CODE = /^[A-Z][A-Z0-9_]{2,80}$/u;
const bytes = text => new TextEncoder().encode(text).byteLength;
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const keys = (value, required, optional = []) => plain(value)
  && required.every(key => Object.hasOwn(value, key))
  && Object.keys(value).every(key => required.includes(key) || optional.includes(key));
const absolute = value => typeof value === "string" && value.startsWith("/")
  && !/[\u0000-\u001f\u007f]/u.test(value) && !value.includes("\\") && !value.split("/").includes("..");
export class UnderstandTransportError extends Error {
  constructor(code) { super(code); this.name = "UnderstandTransportError"; this.code = code; }
}
const fault = code => new UnderstandTransportError(code);
function requireValue(condition, code = "INVALID_INPUT") { if (!condition) throw fault(code); }
function authorityActive(isActive) {
  try { return isActive === undefined || typeof isActive === "function" && isActive() === true; } catch { return false; }
}
function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  return { spawn({ isActive, ...options }) {
      requireValue(authorityActive(isActive), "CANCELLED");
      return Subprocess.call(options); // Strip the chrome-private callback before Gecko.
    },
    timers: ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs"),
    env: name => Services.env.get(name), uuid: () => Services.uuid.generateUUID().toString().replace(/[{}]/gu, "") };
}
function validateParams(method, params) {
  if (method === "understand/available") { requireValue(keys(params, [])); return; }
  if (method === "understand/cancel") { requireValue(keys(params, ["request_id"]) && typeof params.request_id === "string" && ID.test(params.request_id)); return; }
  requireValue(keys(params, ["request_id", "kind", "cli", "project_root"], ["input", "timeout_ms"])
    && typeof params.request_id === "string" && ID.test(params.request_id)
    && ["brief", "explain_errors", "setup"].includes(params.kind) && ["claude-code", "codex"].includes(params.cli)
    && absolute(params.project_root) && params.project_root !== "/"
    && (params.kind === "explain_errors" ? Object.hasOwn(params, "input") : !Object.hasOwn(params, "input"))
    && (params.timeout_ms === undefined || Number.isSafeInteger(params.timeout_ms)
      && params.timeout_ms >= 10000 && params.timeout_ms <= TRANSPORT_LIMITS.maxRunMs));
  // Filesystem checks and the complete console-error schema remain authoritative
  // in provider-host. The privileged caller supplies project_root; webpages cannot.
}

/**
 * Owns a dedicated provider-host process, never a conversation/provider session.
 * request resolves the host result; typed transport/envelope faults reject. For
 * run faults, error.data_sent reflects the adapter's own write-attempt evidence:
 * false before a write attempt, conservatively true thereafter. Host diagnostic
 * text and fields cannot supply or override it. Startup
 * has its own 5 s bound; the request deadline begins after startup and includes 1 s
 * reply grace. Queue wait at provider-host is not covered separately by this adapter:
 * callers that use its queue must supply an appropriate request timeout (max 300 s).
 * The staged browser controller serializes its runs and imposes its own deadline.
 *
 * Abort of a sent run requests cancellation and retains the original pending entry
 * until its terminal reply or host retirement. Retirement blocks host replacement
 * until bounded cleanup has finished. EOF/process exit settles every pending call.
 * A hostile process that ignores stdin closure, kill, or wait cannot be proven reaped;
 * cleanup still attempts kill and stops waiting after the bounded fallback.
 */
export function createUnderstandTransport({ runtime = null } = {}) {
  let host = null, starting = null, closed = false, closePromise = null;
  const inflight = new Set(), retiring = new Set(), cancellations = new Map(), activeRunIds = new Set();
  const timer = (fn, ms) => runtime.timers.setTimeout(fn, ms);
  const clear = handle => { if (handle !== null && handle !== undefined) runtime.timers.clearTimeout(handle); };
  function bounded(promise, ms) {
    return new Promise(resolve => {
      let done = false;
      const finish = value => { if (done) return; done = true; clear(deadline); resolve(value); };
      const deadline = timer(() => finish(false), ms);
      Promise.resolve(promise).then(() => finish(true), () => finish(false));
    });
  }
  function settle(owned, entry, value, error) {
    if (entry.done) return;
    entry.done = true; owned.pending.delete(entry.id);
    clear(entry.timer); clear(entry.cancelTimer); entry.signal?.removeEventListener("abort", entry.onAbort);
    if (entry.method === "understand/run") cancellations.delete(entry.params.request_id);
    if (error) entry.reject(error); else entry.resolve(value);
  }
  async function cleanup(owned) {
    try {
      // Initiate stdin closure before waiting; serveStdio kills owned CLI groups.
      Promise.resolve().then(() => owned.child.stdin.close()).catch(() => {});
      if (await bounded(owned.wait, TRANSPORT_LIMITS.closeGraceMs)) return;
      Promise.resolve().then(() => owned.child.kill(0)).catch(() => {});
      await bounded(owned.wait, TRANSPORT_LIMITS.killWaitMs);
    } finally {
      // Gecko wait() reports process exit separately from worker pipe cleanup.
      // Descendants may hold these pipes open after exit. Force-close both so
      // pending native reads release, even when one close throws or hangs.
      const outputs = [owned.child.stdout, owned.child.stderr].map(pipe =>
        Promise.resolve().then(() => pipe?.close?.(true)).catch(() => {}));
      await bounded(Promise.allSettled(outputs), TRANSPORT_LIMITS.pipeCloseGraceMs);
    }
  }
  function retire(owned, code = "HOST_UNAVAILABLE") {
    if (!owned) return Promise.resolve();
    if (owned.retirePromise) return owned.retirePromise;
    owned.retired = true; clear(owned.exitTimer);
    if (host === owned) host = null;
    const promise = cleanup(owned).catch(() => {});
    owned.retirePromise = promise; retiring.add(promise);
    promise.finally(() => retiring.delete(promise));
    // New requests await retiring before starting a replacement, even if the
    // caller reacts to this rejection by immediately dispatching another job.
    for (const entry of [...owned.pending.values()]) settle(owned, entry, null, fault(code));
    return promise;
  }
  function receive(owned, line) {
    requireValue(bytes(line) <= TRANSPORT_LIMITS.frameBytes, "OUTPUT_LIMIT");
    if (!line.trim()) return;
    let frame;
    try { frame = JSON.parse(line); } catch { throw fault("INVALID_PROVIDER_FRAME"); }
    if (keys(frame, ["version", "event"]) && frame.version === 1
        && keys(frame.event, ["version", "type", "session_id"]) && frame.event.version === 1
        && frame.event.type === "host_idle" && frame.event.session_id === null) {
      void retire(owned); return;
    }
    const isResult = keys(frame, ["version", "id", "result"]);
    const isError = keys(frame, ["version", "id", "error"]);
    requireValue((isResult || isError) && frame.version === 1 && typeof frame.id === "string" && ID.test(frame.id), "INVALID_PROVIDER_FRAME");
    const entry = owned.pending.get(frame.id);
    requireValue(entry && !entry.done, "UNEXPECTED_PROVIDER_REPLY");
    if (isError) {
      requireValue(keys(frame.error, ["code", "message"]) && typeof frame.error.code === "string"
        && CODE.test(frame.error.code) && typeof frame.error.message === "string" && frame.error.message.length <= 1024,
      "INVALID_PROVIDER_FRAME");
      settle(owned, entry, null, fault(frame.error.code)); return; // Never forward diagnostic text.
    }
    requireValue(plain(frame.result), "INVALID_PROVIDER_FRAME");
    requireValue(bytes(JSON.stringify(frame.result)) <= entry.maxOutputBytes, "OUTPUT_LIMIT");
    if (entry.method === "understand/cancel") requireValue(keys(frame.result, ["cancelled"])
      && typeof frame.result.cancelled === "boolean", "INVALID_PROVIDER_FRAME");
    settle(owned, entry, frame.result);
  }
  function readFault(error) {
    if (error instanceof UnderstandTransportError) return error.code;
    if (error instanceof SubprocessUtf8Error) {
      if (error.code === "OUTPUT_LIMIT") return "OUTPUT_LIMIT";
      if (["INVALID_UTF8", "INVALID_PIPE_BYTES", "INVALID_OBSERVER"].includes(error.code)) return "INVALID_PROVIDER_FRAME";
    }
    return "HOST_UNAVAILABLE";
  }
  async function read(owned) {
    let buffer = "", frameBytes = 0;
    try {
      const reader = createSubprocessUtf8Reader(owned.child.stdout, { onBytes(raw) {
        // A raw read may contain several complete frames. Bound each line,
        // including its LF, before decoding; count incomplete UTF-8 bytes too.
        for (const byte of raw) {
          requireValue(++frameBytes <= TRANSPORT_LIMITS.frameBytes, "OUTPUT_LIMIT");
          if (byte === 0x0a) frameBytes = 0;
        }
      } });
      while (!owned.retired) {
        const chunk = await reader.read();
        if (chunk === null) {
          void retire(owned, buffer.length ? "INVALID_PROVIDER_FRAME" : "HOST_UNAVAILABLE"); return;
        }
        // Empty decoded text is a split UTF-8 prefix, never EOF.
        buffer += chunk.text;
        let newline;
        while (!owned.retired && (newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
          receive(owned, line);
        }
      }
    } catch (error) { void retire(owned, readFault(error)); }
  }
  async function drainStderr(owned) {
    try {
      const reader = createSubprocessUtf8Reader(owned.child.stderr, { maxBytes: TRANSPORT_LIMITS.stderrBytes });
      while (!owned.retired && await reader.read() !== null) { /* discard every decoded/raw chunk */ }
    } catch (error) { void retire(owned, readFault(error)); }
  }
  function own(child) {
    requireValue(typeof child?.stdin?.write === "function" && typeof child.stdin.close === "function"
      && typeof child.stdout?.read === "function" && typeof child.stdout.close === "function"
      && typeof child.stderr?.read === "function" && typeof child.stderr.close === "function" && typeof child.wait === "function"
      && typeof child.kill === "function", "HOST_UNAVAILABLE");
    const owned = { child, pending: new Map(), used: new Set(), retired: false, exited: false, retirePromise: null, exitTimer: null };
    owned.wait = Promise.resolve().then(() => child.wait());
    // Process exit can precede consumption of buffered stdout. Allow the reader
    // to consume complete replies, but bound a pipe held open by descendants.
    owned.wait.then(() => {
      owned.exited = true;
      if (!owned.retired) owned.exitTimer = timer(() => void retire(owned), TRANSPORT_LIMITS.closeGraceMs);
    },
      () => void retire(owned));
    void read(owned);
    void drainStderr(owned);
    return owned;
  }
  function invalidateStartup(generation, code) {
    if (!generation || generation.settled) return;
    generation.settled = true; generation.abandoned = true; clear(generation.timer);
    if (starting === generation) starting = null;
    generation.reject(fault(code));
  }
  function start(isActive) {
    requireValue(authorityActive(isActive), "CANCELLED");
    runtime ??= nativeRuntime();
    const node = runtime.env("AXIOSOZO_PROVIDER_NODE"), path = runtime.env("AXIOSOZO_PROVIDER_HOST");
    requireValue(absolute(node) && absolute(path) && path.endsWith("/packages/provider-host/cli.mjs"), "HOST_UNAVAILABLE");
    const environment = { PATH: "/usr/bin:/bin", LANG: "C" };
    const build = runtime.env("AXIOSOZO_BUILD_ROOT");
    if (absolute(build)) environment.AXIOSOZO_BUILD_ROOT = build;
    const generation = { waiting: 0, settled: false, abandoned: false, timer: null };
    generation.promise = new Promise((resolve, reject) => { generation.resolve = resolve; generation.reject = reject; });
    generation.timer = timer(() => invalidateStartup(generation, "STARTUP_TIMEOUT"), TRANSPORT_LIMITS.startupMs);
    starting = generation;
    Promise.resolve().then(() => {
      if (closed || generation.abandoned || !authorityActive(isActive)) throw fault("CANCELLED");
      return runtime.spawn({ command: node, arguments: [path, "serve"],
        ...(isActive === undefined ? {} : { isActive }),
        environmentAppend: false, environment, stderr: "pipe" });
    }).then(child => {
      let owned;
      try { owned = own(child); } catch {
        // Even a malformed injected child is an owned resource. Use the usable
        // methods to attempt cleanup rather than leaking it on startup failure.
        const partial = { child: { stdout: child?.stdout, stderr: child?.stderr, stdin: { close: () => child?.stdin?.close?.() },
          kill: timeout => child?.kill?.(timeout) }, pending: new Map(), retired: false,
          exitTimer: null, wait: typeof child?.wait === "function"
            ? Promise.resolve().then(() => child.wait()) : Promise.reject(fault("HOST_UNAVAILABLE")) };
        void retire(partial, "HOST_UNAVAILABLE");
        invalidateStartup(generation, "HOST_UNAVAILABLE"); return;
      }
      if (generation.abandoned || closed || starting !== generation || !authorityActive(isActive)) {
        void retire(owned, "CANCELLED"); invalidateStartup(generation, "CANCELLED"); return;
      }
      generation.settled = true; clear(generation.timer); starting = null;
      host = owned; generation.resolve(owned);
    }, error => invalidateStartup(generation, error?.code === "CANCELLED" ? "CANCELLED" : "HOST_UNAVAILABLE"));
    return generation;
  }
  function abortable(promise, signal) {
    if (!signal) return promise;
    if (signal.aborted) return Promise.reject(fault("CANCELLED"));
    return new Promise((resolve, reject) => {
      const onAbort = () => { signal.removeEventListener("abort", onAbort); reject(fault("CANCELLED")); };
      signal.addEventListener("abort", onAbort, { once: true });
      Promise.resolve(promise).then(value => { signal.removeEventListener("abort", onAbort); resolve(value); },
        error => { signal.removeEventListener("abort", onAbort); reject(error); });
      if (signal.aborted) onAbort();
    });
  }
  async function ensureHost(signal, isActive) {
    requireValue(authorityActive(isActive), "CANCELLED");
    requireValue(!closed, "HOST_CLOSED");
    while (retiring.size) {
      await abortable(Promise.allSettled([...retiring]), signal);
      requireValue(authorityActive(isActive), "CANCELLED");
    }
    requireValue(!closed, "HOST_CLOSED"); requireValue(!signal?.aborted, "CANCELLED");
    if (host && !host.retired && host.exited) {
      await retire(host); requireValue(authorityActive(isActive), "CANCELLED");
    }
    requireValue(!closed, "HOST_CLOSED"); requireValue(!signal?.aborted, "CANCELLED");
    if (host && !host.retired) return host;
    requireValue(authorityActive(isActive), "CANCELLED");
    const generation = starting ?? start(isActive);
    generation.waiting++;
    try { return await abortable(generation.promise, signal); }
    finally { if (--generation.waiting === 0 && !generation.settled) invalidateStartup(generation, "CANCELLED"); }
  }
  async function request(method, params, options = {}) {
    const disclosure = { attempted: false };
    try { return await dispatch(method, params, options, disclosure); }
    catch (error) {
      // Trusted local evidence only. Host diagnostic fields never set this flag.
      // Once a run write is attempted, delivery/provider contact is uncertain.
      if (method === "understand/run" && error instanceof UnderstandTransportError) error.data_sent = disclosure.attempted;
      throw error;
    }
  }
  async function dispatch(method, params, options, disclosure) {
    requireValue(METHODS.includes(method), "UNSUPPORTED");
    validateParams(method, params);
    requireValue(keys(options, [], ["signal", "timeoutMs", "maxOutputBytes", "isActive"]));
    const { signal, isActive } = options;
    requireValue(isActive === undefined || typeof isActive === "function");
    const operationActive = method === "understand/cancel" ? undefined : isActive;
    requireValue(authorityActive(operationActive), "CANCELLED");
    requireValue(signal === undefined || signal === null || typeof signal.addEventListener === "function"
      && typeof signal.removeEventListener === "function" && typeof signal.aborted === "boolean");
    const timeoutMs = options.timeoutMs ?? (method === "understand/run" ? params.timeout_ms ?? TRANSPORT_LIMITS.defaultRunMs : 5000);
    const maxOutputBytes = options.maxOutputBytes ?? TRANSPORT_LIMITS.resultBytes;
    requireValue(Number.isSafeInteger(timeoutMs) && timeoutMs >= (method === "understand/run" ? 10000 : 1)
      && timeoutMs <= TRANSPORT_LIMITS.maxRunMs && Number.isSafeInteger(maxOutputBytes)
      && maxOutputBytes >= 1 && maxOutputBytes <= TRANSPORT_LIMITS.resultBytes);
    requireValue(!closed, "HOST_CLOSED");
    requireValue(!signal?.aborted, "CANCELLED");
    requireValue(inflight.size < TRANSPORT_LIMITS.pending, "BACKPRESSURE");
    const token = {}; inflight.add(token); let activeId = null;
    try {
      // Snapshot before starting a process: getters/cycles/oversized input fail
      // before spawn; subsequent caller mutations cannot change the wire request.
      let snapshot;
      try { snapshot = JSON.parse(JSON.stringify(params)); } catch { throw fault("INVALID_INPUT"); }
      validateParams(method, snapshot);
      if (method === "understand/run") {
        requireValue(!activeRunIds.has(snapshot.request_id), "DUPLICATE_REQUEST");
        activeId = snapshot.request_id; activeRunIds.add(activeId);
      }
      requireValue(bytes(JSON.stringify({ version: 1, id: "x".repeat(160), method, params: snapshot })) <= TRANSPORT_LIMITS.requestBytes,
        "INVALID_INPUT");
      const owned = await ensureHost(signal, operationActive);
      requireValue(authorityActive(operationActive), "CANCELLED");
      if (signal?.aborted) { if (!owned.pending.size) void retire(owned, "CANCELLED"); throw fault("CANCELLED"); }
      requireValue(!closed && !owned.retired && !owned.exited, "HOST_CLOSED");
      if (owned.used.size >= TRANSPORT_LIMITS.requestsPerHost) { await retire(owned, "REQUEST_LIMIT"); throw fault("REQUEST_LIMIT"); }
      const id = runtime.uuid();
      requireValue(typeof id === "string" && ID.test(id) && !owned.used.has(id), "INVALID_REQUEST_ID");
      const line = JSON.stringify({ version: 1, id, method, params: snapshot }) + "\n";
      requireValue(bytes(line.slice(0, -1)) <= TRANSPORT_LIMITS.requestBytes, "INVALID_INPUT");
      owned.used.add(id);
      return await new Promise((resolve, reject) => {
        const entry = { id, method, params: snapshot, signal, maxOutputBytes, resolve, reject,
          done: false, handed: false, aborting: false, timer: null, cancelTimer: null, onAbort: null };
        entry.onAbort = () => {
          if (entry.done || entry.aborting) return;
          entry.aborting = true;
          if (!entry.handed) { settle(owned, entry, null, fault("CANCELLED")); return; }
          if (method !== "understand/run") { void retire(owned, "CANCELLED"); return; }
          entry.cancelTimer = timer(() => void retire(owned, "CANCELLED"), TRANSPORT_LIMITS.cancelGraceMs);
          // Shared with the controller's explicit cancel(): one cancel envelope.
          cancel({ request_id: snapshot.request_id }).catch(() => { if (!entry.done) void retire(owned, "CANCELLED"); });
        };
        owned.pending.set(id, entry);
        entry.timer = timer(() => void retire(owned, "TIMEOUT"), timeoutMs + TRANSPORT_LIMITS.replyGraceMs);
        signal?.addEventListener("abort", entry.onAbort, { once: true });
        if (signal?.aborted) entry.onAbort();
        if (entry.done) return;
        // Guard again at dispatch. No deferred writer may survive retirement or
        // send a run after a pre-write abort. Mark handed exactly at the call.
        if (owned.retired || closed || entry.done) return;
        if (!authorityActive(operationActive)) { settle(owned, entry, null, fault("CANCELLED")); return; }
        entry.handed = true; disclosure.attempted = true;
        try { Promise.resolve(owned.child.stdin.write(line)).catch(() => void retire(owned)); }
        catch { void retire(owned); }
      });
    } finally { inflight.delete(token); if (activeId !== null) activeRunIds.delete(activeId); }
  }
  function cancel(params) {
    validateParams("understand/cancel", params);
    const requestId = params.request_id;
    if (cancellations.has(requestId)) return cancellations.get(requestId);
    const active = host && !host.retired && [...host.pending.values()].find(entry =>
      entry.method === "understand/run" && entry.params.request_id === requestId && !entry.done && entry.handed);
    // An unsent or completed local run has no CLI to cancel. In particular,
    // the controller's startup-abort fallback must not start a replacement host.
    if (!active) return Promise.resolve({ cancelled: false });
    active.aborting = true;
    if (active.cancelTimer === null) {
      const owned = host;
      active.cancelTimer = timer(() => void retire(owned, "CANCELLED"), TRANSPORT_LIMITS.cancelGraceMs);
    }
    const promise = request("understand/cancel", { request_id: requestId }, { timeoutMs: 1000, maxOutputBytes: 1024 });
    cancellations.set(requestId, promise);
    promise.finally(() => {
      const active = host && [...host.pending.values()].some(entry => entry.method === "understand/run" && entry.params.request_id === requestId);
      if (!active && cancellations.get(requestId) === promise) cancellations.delete(requestId);
    }).catch(() => {});
    return promise;
  }
  function close() {
    if (closePromise) return closePromise;
    closed = true; invalidateStartup(starting, "HOST_CLOSED");
    if (host) void retire(host, "HOST_CLOSED");
    closePromise = Promise.allSettled([...retiring]).then(() => undefined);
    return closePromise;
  }
  return Object.freeze({ request, cancel, close });
}
