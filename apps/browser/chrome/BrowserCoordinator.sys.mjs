/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

const MAX_FRAME = 65536;
const TARGET_KEYS = ["tab_id", "engine", "engine_instance", "native_target_id", "identity",
  "document_generation", "navigation_generation", "private_mode"];
const sameTarget = (a, b) => TARGET_KEYS.every(key => a?.[key] === b?.[key]);

function snapshot(target) {
  if (!target || Object.keys(target).length !== TARGET_KEYS.length
      || !["gecko", "chromium"].includes(target.engine)
      || typeof target.private_mode !== "boolean"
      || typeof target.identity !== "string" || !target.identity.length || target.identity.length > 4096
      || /[\u0000-\u001f\u007f]/u.test(target.identity)) throw new Error("INVALID_TARGET");
  for (const key of ["tab_id", "engine_instance", "native_target_id"]) {
    if (typeof target[key] !== "string" || !/^[a-zA-Z0-9_:/.-]{1,128}$/u.test(target[key])) throw new Error("INVALID_TARGET");
  }
  for (const key of ["document_generation", "navigation_generation"]) {
    if (!Number.isSafeInteger(target[key]) || target[key] < 0) throw new Error("INVALID_TARGET");
  }
  return Object.freeze(Object.fromEntries(TARGET_KEYS.map(key => [key, target[key]])));
}

/** A parent-owned stdio policy channel. Nothing in this class opens a web listener. */
export class PolicyBridge {
  #process;
  #token;
  #session;
  #pending = new Map();
  #targets = new Map();
  #sequence = 0;
  #queue = Promise.resolve();
  #ended = false;
  #timers;
  #deadline;
  #now;

  constructor(process, { token, session, timers, deadline = 5000, now }) {
    if (!/^[a-f0-9]{64}$/u.test(token) || !/^[a-zA-Z0-9-]{1,128}$/u.test(session)) throw new Error("INVALID_BOOTSTRAP");
    if (typeof now !== "function") throw new Error("MONOTONIC_CLOCK_REQUIRED");
    this.#process = process;
    this.#token = token;
    this.#session = session;
    this.#timers = timers;
    this.#deadline = deadline;
    this.#now = now;
    this.status = "starting";
  }

  async connect() {
    this.#read().catch(() => this.#fail("COORDINATOR_PROTOCOL_FAILURE"));
    // Drain diagnostics without logging input, targets, credentials or tokens.
    this.#drainErrors().catch(() => {});
    this.#process.wait().then(() => this.#fail("COORDINATOR_EXITED"), () => this.#fail("COORDINATOR_EXITED"));
    await this.#process.stdin.write(JSON.stringify({ version: 1, token: this.#token, session_id: this.#session }) + "\n");
    const reply = await this.#request({ method: "capabilities" });
    if (reply.status !== "completed" || reply.result?.transport !== "inherited_stdio") {
      this.#fail("COORDINATOR_HANDSHAKE_REJECTED");
      throw new Error("COORDINATOR_HANDSHAKE_REJECTED");
    }
    this.status = "connected";
    return this;
  }

  async #drainErrors() {
    if (!this.#process.stderr) return;
    let total = 0;
    for (;;) {
      const chunk = await this.#process.stderr.readString();
      if (!chunk) return;
      total += chunk.length;
      if (total > MAX_FRAME) {
        this.#fail("COORDINATOR_DIAGNOSTIC_LIMIT");
        return;
      }
    }
  }

  async #read() {
    let buffered = "";
    for (;;) {
      const chunk = await this.#process.stdout.readString();
      if (!chunk) {
        this.#fail("COORDINATOR_EOF");
        return;
      }
      buffered += chunk;
      for (;;) {
        const newline = buffered.indexOf("\n");
        if (newline < 0) break;
        if (newline > MAX_FRAME) throw new Error("OVERSIZED_RESPONSE");
        const line = buffered.slice(0, newline);
        if (new TextEncoder().encode(line).length + 1 > MAX_FRAME) throw new Error("OVERSIZED_RESPONSE");
        buffered = buffered.slice(newline + 1);
        const reply = JSON.parse(line);
        if (Object.keys(reply).length !== 5 || reply.version !== 1 || reply.session_id !== this.#session
            || !["completed", "authorized", "rejected", "shutdown"].includes(reply.status)
            || !reply.result || typeof reply.result !== "object" || Array.isArray(reply.result)) throw new Error("INVALID_RESPONSE");
        const pending = this.#pending.get(reply.request_id);
        if (!pending) throw new Error("UNKNOWN_RESPONSE");
        this.#pending.delete(reply.request_id);
        this.#timers.clearTimeout(pending.timer);
        pending.resolve(reply);
      }
      if (new TextEncoder().encode(buffered).length > MAX_FRAME) throw new Error("OVERSIZED_RESPONSE");
    }
  }

  #request(body) {
    if (this.#ended) return Promise.reject(new Error("COORDINATOR_UNAVAILABLE"));
    const request_id = `chrome-${++this.#sequence}`;
    const frame = JSON.stringify({ version: 1, request_id, session_id: this.#session, token: this.#token, body }) + "\n";
    if (new TextEncoder().encode(frame).length > MAX_FRAME) return Promise.reject(new Error("REQUEST_TOO_LARGE"));
    return new Promise((resolve, reject) => {
      const timer = this.#timers.setTimeout(() => this.#fail("COORDINATOR_TIMEOUT_UNCERTAIN"), this.#deadline);
      this.#pending.set(request_id, { resolve, reject, timer });
      this.#process.stdin.write(frame).catch(() => this.#fail("COORDINATOR_WRITE_FAILED"));
    });
  }

  #serialize(operation) {
    const current = this.#queue.then(operation);
    this.#queue = current.catch(() => {});
    return current;
  }

  async #synchronize(target) {
    if (target.private_mode) throw new Error("PRIVATE_TARGET_EXCLUDED");
    const previous = this.#targets.get(target.tab_id);
    if (previous && sameTarget(previous, target)) return;
    const body = previous ? { method: "update_target", previous, target } : { method: "register_target", target };
    const reply = await this.#request(body);
    if (reply.status !== "completed" || !sameTarget(reply.result, target)) {
      // Only a fixed-shape policy code may enter the development log. Never
      // include the target, URL, native diagnostic or bootstrap secret.
      const reason = reply.status === "rejected" && /^[a-z_]{1,64}$/u.test(reply.result?.reason ?? "")
        ? reply.result.reason.toUpperCase() : "UNKNOWN";
      throw new Error(`TARGET_SYNC_REJECTED_${reason}`);
    }
    this.#targets.set(target.tab_id, target);
  }

  synchronize(target) {
    const current = snapshot(target);
    return this.#serialize(() => this.#synchronize(current));
  }

  closeTarget(target) {
    const current = snapshot(target);
    return this.#serialize(async () => {
      if (!this.#targets.has(current.tab_id)) return;
      await this.#synchronize(current);
      const reply = await this.#request({ method: "close_target", target: current });
      if (reply.status !== "completed") throw new Error("TARGET_CLOSE_REJECTED");
      this.#targets.delete(current.tab_id);
    });
  }

  /** resolveAndExecute must revalidate the engine's live target immediately. */
  execute(target, scope, resolveAndExecute) {
    const current = snapshot(target);
    if (!["observe", "navigate", "back", "forward", "reload", "close", "devtools"].includes(scope)) return Promise.reject(new Error("UNSUPPORTED_SCOPE"));
    return this.#serialize(async () => {
      await this.#synchronize(current);
      // Start the local deadline before the grant RPC: transport and event-loop
      // delays can only shorten the lifetime, never extend native authorization.
      const expiresLocally = this.#now() + 1000;
      const issued = await this.#request({ method: "grant", target: current, scopes: [scope], ttl_ms: 1000 });
      if (issued.status !== "completed" || !sameTarget(issued.result.target, current)) throw new Error("GRANT_REJECTED");
      const accepted = await this.#request({ method: "authorize", target: current, scope, grant_id: issued.result.id });
      if (accepted.status !== "authorized" || accepted.result.executed !== false
          || !sameTarget(accepted.result.target, current) || accepted.result.scope !== scope) throw new Error("AUTHORIZATION_REJECTED");
      if (!Number.isFinite(expiresLocally) || this.#now() >= expiresLocally) throw new Error("GRANT_EXPIRED_BEFORE_DISPATCH");
      return resolveAndExecute(current);
    });
  }

  #fail(reason) {
    if (this.#ended) return;
    this.#ended = true;
    this.status = "unavailable";
    for (const item of this.#pending.values()) {
      this.#timers.clearTimeout(item.timer);
      item.reject(new Error(reason));
    }
    this.#pending.clear();
    this.#targets.clear();
    this.#process.stdin.close().catch(() => {});
    this.#process.kill(300).catch(() => {});
  }

  async dispose() {
    if (!this.#ended) {
      try { await this.#request({ method: "shutdown" }); } catch { /* no replay */ }
    }
    this.#fail("COORDINATOR_CLOSED");
    await this.#process.wait();
  }
}

/** Real Firefox Subprocess API, audited at the pinned Firefox revision. */
export async function connectNativeCoordinator({ now }) {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const command = Services.env.get("AXIOSOZO_COORDINATOR_BINARY");
  const root = Services.env.get("AXIOSOZO_BUILD_ROOT");
  if (!root || command !== `${root}/cargo-target/debug/browser-core`) throw new Error("COORDINATOR_BUILD_PATH_UNAVAILABLE");
  const bytes = Cc["@mozilla.org/security/random-generator;1"].getService(Ci.nsIRandomGenerator).generateRandomBytes(32);
  const token = [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
  const session = Services.uuid.generateUUID().toString().replace(/[{}]/gu, "");
  const process = await Subprocess.call({ command, arguments: [], environmentAppend: false,
    environment: { PATH: "/usr/bin:/bin", AXIOSOZO_BOOTSTRAP_MODE: "stdin-v1" }, stderr: "pipe" });
  const bridge = new PolicyBridge(process, { token, session, timers, now });
  try { return await bridge.connect(); } catch (error) { await bridge.dispose(); throw error; }
}

/** Attach the actual Gecko adapter registry; failures leave normal browsing intact. */
export async function attachCoordinator(win, adapter, { isTargetActive = () => true } = {}) {
  let disposed = false;
  let bridge = null;
  const previousEmit = adapter.emit;
  const onFailure = error => {
    const code = /^[A-Z][A-Z0-9_]{2,80}$/u.test(error?.message ?? "")
      ? error.message : "UNCLASSIFIED_SYNC_FAILURE";
    win.console.error(`AxioSozo target synchronization rejected (${code}); action not dispatched`);
  };
  const onUnload = () => {
    disposed = true;
    adapter.emit = previousEmit;
    bridge?.dispose().catch(onFailure);
  };
  win.addEventListener("unload", onUnload, { once: true });
  try {
    bridge = await connectNativeCoordinator({ now: () => win.performance.now() });
    if (disposed) {
      await bridge.dispose();
      throw new Error("BROWSER_WINDOW_CLOSED");
    }
    adapter.emit = event => {
      previousEmit(event);
      if (event.target.private_mode) return;
      const update = event.type === "closed" ? bridge.closeTarget(event.target) : bridge.synchronize(event.target);
      update.catch(onFailure);
    };
    for (const record of adapter.tabs.values()) {
      const target = adapter.target(record);
      if (!target.private_mode) await bridge.synchronize(target);
    }
    return Object.freeze({
      get status() { return bridge.status; },
      async execute(target, scope, ...args) {
        // The experimental CEF presenter retains its original Gecko tab. Until
        // explicit registry migration is verified, never operate that hidden tab.
        if (!isTargetActive(target)) throw new Error("INACTIVE_ENGINE_TARGET");
        return bridge.execute(target, scope, current => {
          // A navigation may have occurred while native authorization was pending.
          // The real engine registry is the final authority immediately at dispatch.
          adapter.resolve(current);
          if (!isTargetActive(current)) throw new Error("INACTIVE_ENGINE_TARGET");
          const action = { navigate: "navigate", back: "back", forward: "forward", reload: "reload",
            close: "close", devtools: "developerTools" }[scope];
          if (!action) return { status: "unsupported" };
          return adapter[action](current, ...args);
        });
      },
      dispose: async () => {
        win.removeEventListener("unload", onUnload);
        disposed = true;
        adapter.emit = previousEmit;
        await bridge.dispose();
      },
    });
  } catch (error) {
    win.removeEventListener("unload", onUnload);
    adapter.emit = previousEmit;
    await bridge?.dispose();
    throw error;
  }
}
