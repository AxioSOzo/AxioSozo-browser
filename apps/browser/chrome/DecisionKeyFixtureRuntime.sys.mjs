// DOM-free trusted runtime for the fixed synthetic key-presence fixture.
// Only trusted callers use this seam; it never selects a real Keychain helper.
export const KEY_FIXTURE_SHA256 = "82e11f794ab48cd0b29a28e65a560e876dca88406c3fc8d96fc851c300365d71";
export const KEY_FIXTURE_PYTHON = "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11";
export const KEY_FIXTURE_BUILD_ROOT = "/Volumes/AxioSozoBuild/workstation";
const BASE = `${KEY_FIXTURE_BUILD_ROOT}/gui-fixtures`;
const PROFILE_BASE = `${KEY_FIXTURE_BUILD_ROOT}/runtime/e626697ad91fe95c`;
const VIRTUAL_COMMAND = `${KEY_FIXTURE_BUILD_ROOT}/providers/keychain`;
const ROOT_RE = /^keys-([0-9a-f]{32})$/u;
const unavailable = () => Object.assign(new Error("KEYCHAIN_HELPER_UNAVAILABLE"), { code: "KEYCHAIN_HELPER_UNAVAILABLE" });
const surfaceActive = isActive => {
  try { return isActive === undefined || typeof isActive === "function" && isActive() === true; }
  catch { return false; }
};
const argsAllowed = args => Array.isArray(args) && (args.length === 1 || args.length === 2)
  && ["exists", "store", "remove"].includes(args[0])
  && (args.length === 1 || ["jev", "openai"].includes(args[1]));

export function decisionKeyFixturePaths(root, profile) {
  if (typeof root !== "string" || !root.startsWith(`${BASE}/`)) throw unavailable();
  const match = ROOT_RE.exec(root.slice(BASE.length + 1));
  if (!match || profile !== `${PROFILE_BASE}/plan4-keys-${match[1]}/gecko`) throw unavailable();
  return Object.freeze({ root, profile, interpreter: KEY_FIXTURE_PYTHON,
    helper: `${root}/key-helper-${KEY_FIXTURE_SHA256}.py`, virtualCommand: VIRTUAL_COMMAND });
}

/**
 * Privileged native environment only; never accept this object from an actor.
 * Required callbacks: env, profilePath, verifyFile, sha256, spawn, and timers.
 * verifyFile must use canonical/type/UID/private-mode checks. The installer
 * separately admits mounted APFS storage. Optional signal belongs to the trusted
 * settings surface; cancellation never comes from page-controlled parameters.
 * A runtime admits one operation at a time. Create separate runtimes for parallel
 * provider status operations. Absent requested root returns null, including SYN1.
 */
export async function createDecisionKeyFixtureRuntime(native, { signal, isActive } = {}) {
  if (!surfaceActive(isActive)) throw unavailable();
  let requested;
  try { requested = native?.env?.("AXIOSOZO_KEY_GUI_FIXTURE_ROOT"); }
  catch { throw unavailable(); }
  if (requested === undefined || requested === null || requested === "") return null;
  try {
    if (native.env("AXIOSOZO_SYNTHETIC_TEST") !== "1"
        || typeof native.profilePath !== "function" || typeof native.verifyFile !== "function"
        || typeof native.sha256 !== "function" || typeof native.spawn !== "function"
        || typeof native.timers?.setTimeout !== "function" || typeof native.timers?.clearTimeout !== "function")
      throw unavailable();
    const paths = decisionKeyFixturePaths(requested, native.profilePath());
    const now = () => {
      const value = typeof native.clock === "function" ? native.clock() : Date.now();
      if (!Number.isFinite(value) || value < 0) throw unavailable();
      return value;
    };
    let ticket = null;
    const check = operation => {
      if (!surfaceActive(isActive) || signal?.aborted || native.env("AXIOSOZO_SYNTHETIC_TEST") !== "1"
          || native.env("AXIOSOZO_KEY_GUI_FIXTURE_ROOT") !== paths.root
          || native.profilePath() !== paths.profile
          || operation && (ticket !== operation || operation.state === "failed" || now() >= operation.deadline))
        throw unavailable();
    };
    async function admission(guard) {
      guard();
      for (const path of [BASE, paths.root, paths.profile]) {
        if (await native.verifyFile(path, { directory: true, canonical: true, uid: true, mode: 0o700 }) !== true)
          throw unavailable();
        guard();
      }
      if (await native.verifyFile(paths.interpreter, { executable: true, canonical: true, noWritableOthers: true }) !== true)
        throw unavailable();
      guard();
      if (await native.verifyFile(paths.helper, { canonical: true, uid: true, regular: true, links: 1, mode: 0o400, maxBytes: 65536 }) !== true)
        throw unavailable();
      guard();
      if (await native.sha256(paths.helper) !== KEY_FIXTURE_SHA256) throw unavailable();
      guard();
      if (await native.verifyFile(paths.helper, { canonical: true, uid: true, regular: true, links: 1, mode: 0o400, maxBytes: 65536 }) !== true)
        throw unavailable();
      guard();
    }
    async function boundedAdmission(operation = null) {
      check(operation);
      const remaining = operation ? Math.min(3000, operation.deadline - now()) : 3000;
      if (remaining <= 0) throw unavailable();
      let stopped = false, timer, rejectStop;
      const stop = () => { stopped = true; rejectStop(unavailable()); };
      const guard = () => { if (stopped) throw unavailable(); check(operation); };
      const deadline = new Promise((_, reject) => {
        rejectStop = reject;
        timer = native.timers.setTimeout(stop, remaining);
      });
      if (operation) operation.stop = stop;
      signal?.addEventListener("abort", stop, { once: true });
      try {
        if (signal?.aborted) stop();
        await Promise.race([admission(guard), deadline]);
        guard();
      } finally {
        stopped = true;
        if (operation?.stop === stop) operation.stop = null;
        native.timers.clearTimeout(timer);
        signal?.removeEventListener("abort", stop);
      }
    }
    await boundedAdmission();
    return Object.freeze({
      timers: native.timers,
      // This virtual root exists only in a private dependency. Native Services.env
      // keeps AXIOSOZO_BUILD_ROOT absent; providers/keychain is never executed.
      env: name => name === "AXIOSOZO_BUILD_ROOT" ? KEY_FIXTURE_BUILD_ROOT : "",
      async verifyHelper(command) {
        if (command !== paths.virtualCommand) return false;
        if (ticket && ["verifying", "verified", "spawning"].includes(ticket.state)) throw unavailable();
        const operation = { state: "verifying", deadline: now() + 4000, timer: null, stop: null };
        ticket = operation;
        operation.timer = native.timers.setTimeout(() => {
          operation.state = "failed";
          operation.stop?.();
        }, 4000);
        try {
          await boundedAdmission(operation);
          check(operation);
          operation.state = "verified";
          return true;
        } catch {
          operation.state = "failed";
          native.timers.clearTimeout(operation.timer);
          throw unavailable();
        }
      },
      async spawn(options) {
        if (options?.command !== paths.virtualCommand || !argsAllowed(options.arguments)
            || options.environmentAppend !== false || options.stderr !== "pipe"
            || Object.keys(options.environment ?? {}).sort().join(",") !== "LANG,PATH"
            || options.environment.LANG !== "C" || options.environment.PATH !== "/usr/bin:/bin") throw unavailable();
        const operation = ticket;
        if (!operation || operation.state !== "verified") throw unavailable();
        operation.state = "spawning";
        try {
          await boundedAdmission(operation);
          // Last synchronous guard, immediately before the fixed dispatch. No
          // stale verifier may start a child after timeout, abort or flag change.
          check(operation);
          operation.state = "dispatched";
          native.timers.clearTimeout(operation.timer);
          return await native.spawn({ command: paths.interpreter,
            arguments: ["-I", "-S", "-B", paths.helper, ...options.arguments],
            environmentAppend: false, environment: { LANG: "C" }, stderr: "pipe" });
        } catch {
          operation.state = "failed";
          native.timers.clearTimeout(operation.timer);
          throw unavailable();
        }
      },
    });
  } catch { throw unavailable(); }
}
