/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free decision-provider Keychain operations. Only fixed codes and presence
// leave this module. It never reads an item or launches a provider client.
export const DECISION_KEY_PROVIDERS = Object.freeze(["jev", "openai"]);
export const DECISION_KEY_PREFS = Object.freeze({
  jev: "axiosozo.jev.keyEntry.enabled", openai: "axiosozo.openai.keyEntry.enabled",
});
export const DECISION_KEY_CODES = Object.freeze(["INVALID_PROVIDER", "KEY_ENTRY_DISABLED", "INVALID_KEY",
  "KEYCHAIN_HELPER_UNAVAILABLE", "KEYCHAIN_REFUSED", "HELPER_TIMEOUT", "HELPER_OUTPUT_LIMIT", "SETTINGS_CLOSED"]);
export const DECISION_KEY_LIMITS = Object.freeze({ minBytes: 8, maxBytes: 4096, operationMs: 5000, cleanupMs: 1000, outputBytes: 16384 });
const VOLUME = "/Volumes/AxioSozoBuild";
const RESERVED_ROOTS = Object.freeze(["zen", "toolchains", "cargo-home", "cargo-target", "caches", "runtime", "tmp",
  "cef", "providers", "logs", "release", "diag", "diagnostics", "gui-fixtures"]);
const CONTROL = /[\u0000-\u001f\u007f]/u;
const BUFFER_BYTES = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
// Pinned Gecko SubprocessConstants.ERROR_END_OF_FILE.
const NATIVE_END_OF_FILE = 0xff7a0001;

export class ProviderKeyError extends Error {
  constructor(code) { super(code); this.name = "ProviderKeyError"; this.code = code; }
}
function requireValue(ok, code) { if (!ok) throw new ProviderKeyError(code); }
function validProvider(provider) {
  requireValue(DECISION_KEY_PROVIDERS.includes(provider), "INVALID_PROVIDER");
  return provider;
}
export function decisionKeyEntryEnabled(provider, prefs = globalThis.Services?.prefs) {
  validProvider(provider);
  try { return prefs?.getBoolPref(DECISION_KEY_PREFS[provider], false) === true; } catch { return false; }
}
export function validateDecisionKey(secret) {
  if (typeof secret !== "string" || CONTROL.test(secret)) return false;
  const bytes = new TextEncoder().encode(secret).length;
  return bytes >= DECISION_KEY_LIMITS.minBytes && bytes <= DECISION_KEY_LIMITS.maxBytes;
}
// Privileged synchronous authority only. A page cannot supply this callback.
function surfaceCurrent(signal, isActive) {
  try { return !signal?.aborted && (isActive === undefined || typeof isActive === "function" && isActive() === true); }
  catch { return false; }
}
function requireCurrent(signal, isActive) {
  requireValue(surfaceCurrent(signal, isActive), "SETTINGS_CLOSED");
}
function helperPath(runtime) {
  const staticRoot = runtime.env("AXIOSOZO_STATIC_READER_ROOT");
  // Native env values are strings. Any explicit malformed test/runtime value
  // also fails validation rather than falling back to another namespace.
  const root = staticRoot === undefined || staticRoot === null || staticRoot === ""
    ? runtime.env("AXIOSOZO_BUILD_ROOT") : staticRoot;
  const suffix = typeof root === "string" && root.startsWith(`${VOLUME}/`) ? root.slice(VOLUME.length + 1) : null;
  requireValue(root === VOLUME || suffix !== null && /^[a-z0-9][a-z0-9-]{0,39}$/u.test(suffix)
    && !RESERVED_ROOTS.includes(suffix), "KEYCHAIN_HELPER_UNAVAILABLE");
  return `${root}/providers/keychain`;
}
function nativeRuntime() {
  // Synthetic native launches must supply an admitted fake runtime explicitly.
  // Scrubbing BUILD_ROOT alone is insufficient when STATIC_READER_ROOT exists.
  requireValue(Services.env.get("AXIOSOZO_SYNTHETIC_TEST") !== "1", "KEYCHAIN_HELPER_UNAVAILABLE");
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  return { spawn: options => Subprocess.call(options),
    timers: ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs"),
    env: name => Services.env.get(name),
    verifyHelper(command) {
      const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      file.initWithPath(command);
      if (!file.exists() || file.isSymlink()) return false;
      file.normalize();
      return file.path === command && file.isFile();
    } };
}

async function keychainOperation(provider, operation, { runtime, signal, isActive, input = "" } = {}) {
  validProvider(provider);
  requireCurrent(signal, isActive);
  let command, nativeOutput;
  try {
    // Only trusted runtime dependencies may select their native raw pipe contract.
    nativeOutput = runtime === undefined || runtime === null || runtime.outputPipeMode === "raw";
    runtime ??= nativeRuntime(); command = helperPath(runtime);
  }
  catch { throw new ProviderKeyError("KEYCHAIN_HELPER_UNAVAILABLE"); }
  const args = provider === "jev" ? [operation] : [operation, provider];
  let child = null, failure = null, finished = false, cleanupTask = null, timer = null, rejectStop;
  const stopped = new Promise((_, reject) => { rejectStop = reject; });
  function stop(code) {
    if (failure || finished) return;
    failure = code; rejectStop(new ProviderKeyError(code));
  }
  const onAbort = () => stop("SETTINGS_CLOSED");
  function cleanup(owned) {
    if (cleanupTask) return cleanupTask;
    cleanupTask = (async () => {
      let cleanupTimer;
      try {
        // Start every ownership cleanup even if an individual pipe/child API fails.
        const actions = [() => owned.stdin.close(true), () => owned.stdout?.close?.(true), () => owned.stderr?.close?.(true),
          () => owned.kill(250), () => owned.wait()]
          .map(action => Promise.resolve().then(action).catch(() => {}));
        await Promise.race([Promise.all(actions), new Promise(resolve => {
          cleanupTimer = runtime.timers.setTimeout(resolve, DECISION_KEY_LIMITS.cleanupMs);
        })]);
      } finally { runtime.timers.clearTimeout(cleanupTimer); }
    })();
    return cleanupTask;
  }
  async function discard(pipe, size) {
    if (!pipe) return;
    for (;;) {
      let bytes;
      if (nativeOutput) {
        // Gecko readString can return "" for an incomplete UTF-8 sequence.
        // Discard native output without decoding; only an empty buffer is EOF.
        const chunk = await pipe.read();
        bytes = BUFFER_BYTES.call(chunk);
        if (bytes === 0) return;
      } else {
        // Explicit test runtimes retain their existing string-pipe contract.
        const chunk = await pipe.readString();
        if (!chunk) return;
        bytes = new TextEncoder().encode(chunk).length;
      }
      size.bytes += bytes;
      requireValue(size.bytes <= DECISION_KEY_LIMITS.outputBytes, "HELPER_OUTPUT_LIMIT");
    }
  }
  try {
    timer = runtime.timers.setTimeout(() => stop("HELPER_TIMEOUT"), DECISION_KEY_LIMITS.operationMs);
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) onAbort();
    const operationTask = (async () => {
      requireCurrent(signal, isActive);
      requireValue(typeof runtime.verifyHelper === "function" && await runtime.verifyHelper(command) === true,
        "KEYCHAIN_HELPER_UNAVAILABLE");
      if (failure || finished) throw new ProviderKeyError(failure ?? "SETTINGS_CLOSED");
      requireCurrent(signal, isActive);
      child = await runtime.spawn({ command, arguments: args, environmentAppend: false,
        environment: { PATH: "/usr/bin:/bin", LANG: "C" }, stderr: "pipe" });
      if (failure || finished || !surfaceCurrent(signal, isActive)) {
        await cleanup(child); throw new ProviderKeyError(failure ?? "SETTINGS_CLOSED");
      }
      const write = async () => {
        requireCurrent(signal, isActive);
        if (operation === "store") await child.stdin.write(input);
        input = "";
        // Successful writes remain mandatory. Gecko may close stdin itself on
        // exit before our close request arrives; only its EOF code is benign.
        // The surrounding wait, genuine output EOF, deadline and authority
        // checks still decide whether this operation succeeded.
        try { await child.stdin.close(); }
        catch (error) { if (!nativeOutput || error?.errorCode !== NATIVE_END_OF_FILE) throw error; }
      };
      const size = { bytes: 0 };
      const [, , result] = await Promise.all([discard(child.stdout, size), discard(child.stderr, size), child.wait(), write()]);
      if (failure) throw new ProviderKeyError(failure);
      requireCurrent(signal, isActive);
      requireValue(result?.exitCode === 0 || operation !== "store" && result?.exitCode === 44, "KEYCHAIN_REFUSED");
      return result.exitCode;
    })();
    return await Promise.race([operationTask, stopped]);
  } catch (error) {
    throw error instanceof ProviderKeyError ? error : new ProviderKeyError("KEYCHAIN_HELPER_UNAVAILABLE");
  } finally {
    finished = true; input = "";
    runtime.timers.clearTimeout(timer); signal?.removeEventListener("abort", onAbort);
    if (child) await cleanup(child);
  }
}

/** The caller must provide its trusted user-action/private-window admission. */
export async function storeDecisionKey(provider, secret, { runtime, signal, isActive, prefs = globalThis.Services?.prefs } = {}) {
  validProvider(provider);
  requireValue(decisionKeyEntryEnabled(provider, prefs), "KEY_ENTRY_DISABLED");
  requireValue(validateDecisionKey(secret), "INVALID_KEY");
  try { await keychainOperation(provider, "store", { runtime, signal, isActive, input: secret }); }
  finally { secret = ""; }
}

/** Removing an item stays possible while new key entry is disabled. */
export async function removeDecisionKey(provider, { runtime, signal, isActive } = {}) {
  await keychainOperation(provider, "remove", { runtime, signal, isActive });
}

/** Presence only. A missing item has helper exit 44; no item is ever read. */
export async function decisionKeyPresence(provider, { runtime, signal, isActive } = {}) {
  return await keychainOperation(provider, "exists", { runtime, signal, isActive }) === 0 ? "stored" : "missing";
}

/** Fixed data only; presentation and private-window admission belong to Claude. */
export async function decisionKeyStatus(provider, { runtime, signal, isActive, prefs = globalThis.Services?.prefs } = {}) {
  const key_entry_enabled = decisionKeyEntryEnabled(provider, prefs);
  try { return Object.freeze({ provider, key_entry_enabled, key: await decisionKeyPresence(provider, { runtime, signal, isActive }), error: null }); }
  catch (error) { return Object.freeze({ provider, key_entry_enabled, key: "unknown",
    error: error instanceof ProviderKeyError ? error.code : "KEYCHAIN_HELPER_UNAVAILABLE" }); }
}
