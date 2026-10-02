/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// DOM-free, constructor-scoped fake Terminal gate; no product-agent launch.
import { createTerminalHandoff, TERMINAL_HANDOFF_PYTHON } from "./TerminalHandoff.sys.mjs";
import { createSubprocessUtf8Reader } from "./SubprocessUtf8.sys.mjs";
export const TERMINAL_HANDOFF_SHA256 = "082dba3a2f91febe98d77cbb57112fc710ab2267949ee1a1e9479f8afdb79986";
export const TERMINAL_HANDOFF_FAKE_SHA256 = "aab2d96322dc34dce456713d7a67efeb47709b003736ae057434c53c417f036d";
const BUILD = "/Volumes/AxioSozoBuild/workstation";
const BASE = `${BUILD}/handoff-terminal`;
const ENV = Object.freeze({ PATH: "/usr/bin:/bin", LANG: "C" });
const unavailable = () => Object.assign(new Error("TERMINAL_FIXTURE_UNAVAILABLE"), { code: "TERMINAL_FIXTURE_UNAVAILABLE" });
const get = (object, key) => object && typeof object === "object" ? Object.getOwnPropertyDescriptor(object, key)?.value : undefined;
const exact = (object, keys) => object && typeof object === "object" && !Array.isArray(object)
  && Object.keys(object).length === keys.length && keys.every(key => Object.hasOwn(object, key));
const closeStdin = child => { try { Promise.resolve(child?.stdin?.close(true)).catch(() => {}); } catch {} };
const closePipes = child => {
  for (const name of ["stdin", "stdout", "stderr"]) {
    try { Promise.resolve(child?.[name]?.close(true)).catch(() => {}); } catch {}
  }
};
const kill = child => { try { Promise.resolve(child?.kill(0)).catch(() => {}); } catch {} };
const wait = child => { try { return Promise.resolve(child?.wait()).catch(() => {}); } catch { return Promise.resolve(); } };

export function terminalHandoffFixturePaths(root, profile) {
  const match = typeof root === "string" && new RegExp(`^${BASE}/config-([0-9a-f]{32})$`, "u").exec(root);
  if (!match || typeof profile !== "string"
      || !new RegExp(`^${BUILD}/runtime/[0-9a-f]{16}/plan4-handoff-${match[1]}/gecko$`, "u").test(profile)) throw unavailable();
  return Object.freeze({ root, profile, interpreter: TERMINAL_HANDOFF_PYTHON,
    helper: `${root}/terminal-handoff-${TERMINAL_HANDOFF_SHA256}.py`, policy: `${root}/policy.json`,
    fixture: `${root}/fixture.py`, projectsRoot: `${BUILD}/gui-fixtures/handoff-${match[1]}/projects` });
}

// This verifier may only be created with paths derived above by trusted chrome.
// The Python metadata operation independently verifies UID, link count, private
// modes, the hash-named helper, fixed fixture and synthetic project scope. Gecko
// nsIFile lacks UID/nlink; its checks alone are deliberately insufficient.
export function createTerminalPolicyVerifier(native, paths) {
  return async function verifyPolicy({ signal, isActive = () => true } = {}) {
    let child = null, stopped = false, timer, rejectStop;
    const cleanups = new WeakMap();
    const cleanup = owned => {
      if (!owned || typeof owned !== "object") return Promise.resolve();
      if (cleanups.has(owned)) return cleanups.get(owned);
      // These are forced pipe closes: Gecko otherwise waits for pending reads.
      // Never await a stuck close/kill primitive. Reaping has one fixed 500ms cap,
      // including children that resolve after the caller has already timed out.
      closePipes(owned); kill(owned);
      let cleanupTimer;
      const finished = Promise.race([wait(owned), new Promise(resolve => {
        cleanupTimer = native.timers.setTimeout(resolve, 500);
      })]).finally(() => native.timers.clearTimeout(cleanupTimer));
      cleanups.set(owned, finished); return finished;
    };
    const active = () => { if (stopped || signal?.aborted || isActive() !== true) throw unavailable(); };
    const stop = () => { stopped = true; cleanup(child); rejectStop(unavailable()); };
    const deadline = new Promise((_, reject) => { rejectStop = reject; timer = native.timers.setTimeout(stop, 3000); });
    signal?.addEventListener("abort", stop, { once: true });
    const work = (async () => {
      active();
      const spawned = await native.spawn({ command: paths.interpreter,
        arguments: ["-I", "-S", "-B", paths.helper, "--verify-policy", paths.policy],
        environmentAppend: false, environment: { ...ENV }, stderr: "pipe", workdir: "/" });
      child = spawned;
      try { active(); } catch { await cleanup(child); throw unavailable(); }
      closeStdin(child);
      let output = "";
      const stdout = createSubprocessUtf8Reader(child.stdout, { maxBytes: 1024 });
      const stderrReader = createSubprocessUtf8Reader(child.stderr, { maxBytes: 16384 });
      const stderr = (async () => {
        for (;;) { const chunk = await stderrReader.read(); active(); if (chunk === null) break; }
      })().catch(() => { stop(); });
      for (;;) {
        const chunk = await stdout.read(); active(); if (chunk === null) break;
        output += chunk.text;
      }
      const result = await child.wait(); active(); await stderr; active();
      const receipt = JSON.parse(output);
      if (result.exitCode !== 0 || !exact(receipt, ["version", "status", "policy_sha256", "fixture_sha256"])
          || receipt.version !== 1 || receipt.status !== "verified" || !/^[0-9a-f]{64}$/u.test(receipt.policy_sha256)
          || receipt.fixture_sha256 !== TERMINAL_HANDOFF_FAKE_SHA256) throw unavailable();
      return Object.freeze({ ...receipt });
    })();
    try { return await Promise.race([work, deadline]); }
    catch { throw unavailable(); }
    finally {
      stopped = true; native.timers.clearTimeout(timer); signal?.removeEventListener("abort", stop);
      await cleanup(child);
      // A late spawn is still owned by work. It receives the same forced-pipe,
      // kill(0), bounded-reap cleanup before any metadata read can begin.
    }
  };
}

function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const native = { timers, env: name => Services.env.get(name), profilePath: () => Services.dirsvc.get("ProfD", Ci.nsIFile).path,
    spawn: options => Subprocess.call(options), sha256: path => IOUtils.computeHexDigest(path, "sha256"),
    verifyFile(path, { directory = false, executable = false, mode, maxBytes } = {}) {
      const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile); file.initWithPath(path);
      if (!file.exists() || file.isSymlink() || (directory ? !file.isDirectory() : !file.isFile())) return false;
      file.normalize(); if (file.path !== path || !file.isReadable() || executable && !file.isExecutable()) return false;
      if (mode !== undefined && (file.permissions & 0o777) !== mode || maxBytes !== undefined && file.fileSize > maxBytes) return false;
      for (let parent = file; parent; parent = parent.parent) {
        if (parent.isSymlink() || (parent.permissions & 0o022) !== 0) return false;
      }
      return true;
    } };
  return native;
}

/**
 * Privileged constructor only. Absent fixture root returns null without checking
 * files. A requested but invalid fixture throws, so integration cannot fall back
 * to a production launcher. Real targets remain NOT_AUTHORIZED without this
 * explicit fake seam; no preference, actor path, PATH lookup or discovery exists.
 * isActive is a trusted synchronous chrome authority check, never actor data.
 */
export async function createNativeTerminalHandoffFixture({ runtime, signal, isActive = () => true } = {}) {
  let root;
  try { runtime ??= nativeRuntime(); root = runtime.env("AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT"); } catch { throw unavailable(); }
  if (root === undefined || root === null || root === "") return null;
  let closed = false;
  try {
    if (typeof isActive !== "function" || typeof runtime.env !== "function" || typeof runtime.profilePath !== "function" || typeof runtime.verifyFile !== "function"
        || typeof runtime.sha256 !== "function" || typeof runtime.spawn !== "function"
        || typeof runtime.timers?.setTimeout !== "function" || typeof runtime.timers?.clearTimeout !== "function") throw unavailable();
    const paths = terminalHandoffFixturePaths(root, runtime.profilePath());
    const configuration = Object.freeze({ helper: paths.helper, policy: paths.policy, mode: "terminal" });
    const policyVerifier = runtime.verifyPolicy ?? createTerminalPolicyVerifier(runtime, paths);
    const check = control => {
      if (closed || signal?.aborted || isActive() !== true || control?.signal?.aborted || control?.isActive && control.isActive() !== true
          || runtime.env("AXIOSOZO_SYNTHETIC_TEST") !== "1" || runtime.env("AXIOSOZO_HANDOFF_GUI_FIXTURE") !== "1"
          || runtime.env("AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT") !== paths.root || runtime.profilePath() !== paths.profile) throw unavailable();
    };
    async function admission(expectedDigest = null, control = {}) {
      let stopped = false, timer, rejectStop;
      const guard = () => { if (stopped) throw unavailable(); check(control); };
      const stop = () => { stopped = true; rejectStop(unavailable()); };
      const deadline = new Promise((_, reject) => { rejectStop = reject; timer = runtime.timers.setTimeout(stop, 3000); });
      signal?.addEventListener("abort", stop, { once: true }); control.signal?.addEventListener("abort", stop, { once: true });
      const work = (async () => {
        guard();
        for (const path of [BASE, paths.root, paths.profile]) {
          if (await runtime.verifyFile(path, { directory: true, mode: 0o700, canonical: true, uid: true }) !== true) throw unavailable(); guard();
        }
        if (await runtime.verifyFile(paths.interpreter, { executable: true, canonical: true, noWritableOthers: true }) !== true) throw unavailable(); guard();
        for (const [path, mode, maxBytes, digest] of [[paths.helper, 0o400, 65536, TERMINAL_HANDOFF_SHA256],
          [paths.fixture, 0o600, 65536, TERMINAL_HANDOFF_FAKE_SHA256], [paths.policy, 0o600, 32768, expectedDigest]]) {
          if (await runtime.verifyFile(path, { regular: true, canonical: true, uid: true, links: 1, mode, maxBytes }) !== true) throw unavailable(); guard();
          if (digest !== null && await runtime.sha256(path) !== digest) throw unavailable(); guard();
          if (await runtime.verifyFile(path, { regular: true, canonical: true, uid: true, links: 1, mode, maxBytes }) !== true) throw unavailable(); guard();
        }
        const receipt = await policyVerifier({ signal: control.signal ?? signal, isActive: () => { try { guard(); return true; } catch { return false; } } }); guard();
        if (!exact(receipt, ["version", "status", "policy_sha256", "fixture_sha256"]) || receipt.version !== 1 || receipt.status !== "verified"
            || !/^[0-9a-f]{64}$/u.test(receipt.policy_sha256) || receipt.fixture_sha256 !== TERMINAL_HANDOFF_FAKE_SHA256
            || expectedDigest !== null && receipt.policy_sha256 !== expectedDigest) throw unavailable();
        if (await runtime.sha256(paths.policy) !== receipt.policy_sha256) throw unavailable(); guard();
        return receipt.policy_sha256;
      })();
      try { const result = await Promise.race([work, deadline]); guard(); return result; }
      finally { stopped = true; runtime.timers.clearTimeout(timer); signal?.removeEventListener("abort", stop); control.signal?.removeEventListener("abort", stop); }
    }
    const policyDigest = await admission(); check();
    const dispatch = { timers: runtime.timers, async spawn(options, control) {
      if (!exact(options, ["command", "arguments", "environmentAppend", "environment", "stderr", "workdir"])
          || get(options, "command") !== paths.interpreter || get(options, "environmentAppend") !== false
          || get(options, "stderr") !== "pipe" || get(options, "workdir") !== "/"
          || JSON.stringify(get(options, "arguments")) !== JSON.stringify(["-I", "-S", "-B", paths.helper, "--policy", paths.policy])
          || !exact(get(options, "environment"), ["PATH", "LANG"]) || get(get(options, "environment"), "PATH") !== ENV.PATH
          || get(get(options, "environment"), "LANG") !== ENV.LANG) throw unavailable();
      await admission(policyDigest, control); check(control);
      const child = await runtime.spawn({ command: paths.interpreter, arguments: ["-I", "-S", "-B", paths.helper, "--gui-policy", paths.policy, policyDigest],
        environmentAppend: false, environment: { ...ENV }, stderr: "pipe", workdir: "/" });
      try { check(control); }
      catch {
        // A late spawn still belongs to this dispatch. Do not give the facade
        // a child whose stdin could receive context after trusted authority ends.
        closePipes(child); kill(child);
        let cleanupTimer;
        try { await Promise.race([wait(child), new Promise(resolve => {
          cleanupTimer = runtime.timers.setTimeout(resolve, 500);
        })]); } finally { runtime.timers.clearTimeout(cleanupTimer); }
        throw unavailable();
      }
      // The facade awaits this dispatch. Recheck at the actual context write
      // as well, including a revocation without a delivered window/tab event.
      return { stdin: { async write(value) {
        check(control); const result = await child.stdin.write(value); check(control); return result;
      }, close: (...args) => child.stdin.close(...args) },
      stdout: child.stdout, stderr: child.stderr,
      wait: (...args) => child.wait(...args), kill: (...args) => child.kill(...args) };
    } };
    const terminal = createTerminalHandoff({ runtime: dispatch, verifyConfiguration: async (candidate, control) => {
      if (!exact(candidate, ["helper", "policy", "mode"]) || get(candidate, "helper") !== paths.helper
          || get(candidate, "policy") !== paths.policy || get(candidate, "mode") !== "terminal") return false;
      await admission(policyDigest, control); check(control); return true;
    } });
    const closeFixture = () => { closed = true; terminal.close(); };
    signal?.addEventListener("abort", closeFixture, { once: true });
    return Object.freeze({ terminal, testOnlyLaunch: configuration, close: () => {
      closeFixture(); signal?.removeEventListener("abort", closeFixture);
    } });
  } catch { closed = true; throw unavailable(); }
}
