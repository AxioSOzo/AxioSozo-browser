/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

import { readAgentPipe } from "./AgentPipeBytes.sys.mjs";
import { createOwnedSocketSpawn } from "./AgentOwnedSocketSpawn.sys.mjs";

// Configuration is privileged chrome data only. No actor, project manifest,
// pref, PATH lookup, profile content or provider configuration supplies paths.
export const AGENT_SOCKET_SHA256 = "21d6bb75004e134f189bc0d58cafbd3c109c0b97edb1ecef05b908913a7645e7";
export const AGENT_SOCKET_PYTHON = "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11";
const VOLUME = "/Volumes/AxioSozoBuild";
const RESERVED = new Set(["zen", "toolchains", "cargo-home", "cargo-target", "caches", "runtime", "tmp",
  "cef", "providers", "logs", "release", "diag", "diagnostics", "gui-fixtures"]);
const OPERATIONS = new Set(["uid", "lstat", "mkdir", "probe", "remove", "lock"]);
const encoder = new TextEncoder();
const unavailable = () => Object.assign(new Error("EXACT_SOCKET_METADATA_UNAVAILABLE"), { code: "EXACT_SOCKET_METADATA_UNAVAILABLE" });
const absolute = value => typeof value === "string" && value.startsWith("/") && !value.endsWith("/")
  && !value.includes("//") && !/[\u0000-\u001f\u007f-\u009f]/u.test(value)
  && !value.split("/").some(part => part === "." || part === "..");

export function agentSocketPaths(root) {
  const suffix = typeof root === "string" && root.startsWith(`${VOLUME}/`) ? root.slice(VOLUME.length + 1) : null;
  if (root !== VOLUME && !(suffix !== null && /^[a-z0-9][a-z0-9-]{0,39}$/u.test(suffix) && !RESERVED.has(suffix))) throw unavailable();
  return Object.freeze({ interpreter: AGENT_SOCKET_PYTHON,
    helperPath: `${root}/contexts/agent-socket-${AGENT_SOCKET_SHA256}.py`,
    helperDirectory: `${root}/contexts` });
}

export function agentProfileSocketPath(profilePath) {
  if (!absolute(profilePath)) throw unavailable();
  // Each profile owns a separate private namespace. Keep the fixed suffix
  // short; neither hashes nor aliases can shorten an overlong ProfD prefix.
  const socketPath = `${profilePath}/.a/s`;
  if (encoder.encode(socketPath).length > 100) throw unavailable();
  return socketPath;
}

const metadata = value => value && ["regular", "directory"].includes(value.kind)
  && Number.isSafeInteger(value.uid) && value.uid >= 0
  && Number.isSafeInteger(value.nlink) && value.nlink >= 1
  && Number.isSafeInteger(value.mode) && value.mode >= 0 && value.mode <= 0o7777
  && Number.isSafeInteger(value.size) && value.size >= 0
  && typeof value.device === "string" && /^[0-9]+$/u.test(value.device)
  && typeof value.inode === "string" && /^[0-9]+$/u.test(value.inode);
const same = (left, right) => metadata(left) && metadata(right)
  && ["kind", "uid", "nlink", "mode", "size", "device", "inode"].every(key => left[key] === right[key]);

// Apple stat defaults to lstat; deliberately omit -L. Numeric-only fields
// avoid locale/type labels and never interpret shell syntax or path output.
export function parseAgentStatOutput(output) {
  const match = typeof output === "string" && /^([0-9]+):([0-9]+):([0-7]+):([0-9]+):([0-9]+):([0-9]+)\n?$/u.exec(output);
  if (!match) throw unavailable();
  const rawMode = Number.parseInt(match[3], 8);
  const kind = (rawMode & 0o170000) === 0o100000 ? "regular" : (rawMode & 0o170000) === 0o40000 ? "directory" : null;
  const value = { kind, uid: Number(match[1]), nlink: Number(match[2]), mode: rawMode & 0o7777,
    size: Number(match[4]), device: match[5], inode: match[6] };
  if (!Number.isSafeInteger(rawMode) || rawMode > 0o177777 || !metadata(value)) throw unavailable();
  return Object.freeze(value);
}

async function deadline(runtime, callback) {
  let timer = null, expired = false;
  const stop = new Promise((_, reject) => {
    timer = runtime.timers.setTimeout(() => { expired = true; reject(unavailable()); }, 3000);
  });
  try {
    return await Promise.race([(async () => {
      const result = await callback(() => expired);
      if (expired) throw unavailable();
      return result;
    })(), stop]);
  } finally { runtime.timers.clearTimeout(timer); }
}

const invoke = callback => Promise.resolve().then(callback);
async function cleanupProcess(timers, process, kill = true) {
  if (!process) return;
  let timer;
  const jobs = [process.stdin, process.stdout, process.stderr]
    .filter(pipe => typeof pipe?.close === "function").map(pipe => invoke(() => pipe.close(true)));
  if (kill && typeof process.kill === "function") jobs.push(invoke(() => process.kill(0)));
  if (typeof process.wait === "function") jobs.push(invoke(() => process.wait()));
  const stop = new Promise(resolve => { timer = timers.setTimeout(resolve, 500); });
  try { await Promise.race([Promise.allSettled(jobs), stop]); }
  finally { timers.clearTimeout(timer); }
}

async function ownHelperProcess(runtime, process) {
  if (typeof process?.stdin?.close !== "function" || typeof process?.stdout?.readString !== "function"
    || typeof process?.stderr?.read !== "function" || typeof process?.kill !== "function"
    || typeof process?.wait !== "function") {
    await cleanupProcess(runtime.timers, process);
    throw unavailable();
  }
  let cleanupPromise = null, waitPromise = null, stderrFailed = false, rejectStopped;
  const stopped = new Promise((_, reject) => { rejectStopped = reject; });
  stopped.catch(() => {});
  const cleanup = kill => {
    cleanupPromise ??= cleanupProcess(runtime.timers, process, kill);
    // Every forced request settles the stop signal, even if normal-exit
    // cleanup(false) started first or already finished. Pending pipe calls
    // must not retain a closed/exited lock child indefinitely.
    return kill ? cleanupPromise.then(() => rejectStopped(unavailable())) : cleanupPromise;
  };
  const pipeOperation = async callback => {
    try { return await Promise.race([invoke(callback), stopped]); }
    catch { await cleanup(true); throw unavailable(); }
  };
  // Helper stderr is privately drained/discarded for its whole lifetime;
  // no inherited terminal/chrome output and no unbounded accumulation.
  void readAgentPipe(process.stderr, { limit: 512, keep: false })
    .catch(async () => { stderrFailed = true; await cleanup(true); });
  return Object.freeze({
    stdin: Object.freeze({ close: force => pipeOperation(() => process.stdin.close(force)) }),
    stdout: Object.freeze({ readString: (...args) => pipeOperation(() => process.stdout.readString(...args)) }),
    kill: () => cleanup(true),
    waitForOwnedExit: () => invoke(() => process.wait()),
    async retryOwnedCleanup() {
      // Every explicit retry operates on this same retained raw child handle.
      await cleanupProcess(runtime.timers, process, true);
      rejectStopped(unavailable());
    },
    wait() {
      return waitPromise ??= (async () => {
        let exited = false;
        try {
          const status = await Promise.race([invoke(() => process.wait()), stopped]); exited = true;
          if (stderrFailed) throw unavailable();
          return status;
        } finally {
          // Publish lock-child loss immediately. Delaying the wait result
          // for pipe cleanup would falsely keep lease.held true after flock
          // has already been released by the kernel.
          void cleanup(!exited).catch(() => {});
        }
      })();
    },
  });
}

function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const verifyFile = (path, { executable = false, directory = false } = {}) => {
    const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    file.initWithPath(path);
    if (!file.exists() || file.isSymlink() || !(directory ? file.isDirectory() : file.isFile())) return false;
    file.normalize();
    if (file.path !== path || !file.isReadable() || executable && !file.isExecutable()) return false;
    return (file.permissions & 0o022) === 0;
  };
  const systemCall = async (command, args) => {
    // These fixed, OS-owned system paths are the bootstrap trust anchors.
    // They are never subjected to the product helper's nlink=1 rule.
    if (!["/usr/bin/stat", "/usr/bin/id"].includes(command) || !verifyFile(command, { executable: true })) throw unavailable();
    let process = null, expired = false, exited = false, timer = null;
    const stop = new Promise((_, reject) => {
      timer = timers.setTimeout(() => {
        expired = true;
        reject(unavailable());
      }, 1000);
    });
    const execute = async () => {
      const candidate = await Subprocess.call({ command, arguments: args, environment: { LANG: "C", LC_ALL: "C" },
        environmentAppend: false, stderr: "pipe", workdir: "/" });
      if (expired) { void cleanupProcess(timers, candidate).catch(() => {}); throw unavailable(); }
      process = candidate;
      if (typeof process?.stdin?.close !== "function" || typeof process?.stdout?.read !== "function"
        || typeof process?.stderr?.read !== "function" || typeof process?.kill !== "function"
        || typeof process?.wait !== "function") throw unavailable();
      await process.stdin.close();
      if (expired) throw unavailable();
      const drain = (pipe, keep) => readAgentPipe(pipe, { limit: 512, keep,
        assertLive: () => { if (expired) throw unavailable(); } });
      const [output] = await Promise.all([drain(process.stdout, true), drain(process.stderr, false)]);
      const status = await process.wait();
      if (expired) throw unavailable();
      exited = true;
      if (status?.exitCode !== 0) throw unavailable();
      return output;
    };
    try { return await Promise.race([execute(), stop]); }
    catch { throw unavailable(); }
    finally { expired = true; timers.clearTimeout(timer); await cleanupProcess(timers, process, !exited); }
  };
  return { Subprocess, timers, env: name => Services.env.get(name), verifyFile,
    profileDirectory() { return Services.dirsvc.get("ProfD", Ci.nsIFile).path; },
    async ownUid() {
      const output = await systemCall("/usr/bin/id", ["-u"]);
      if (!/^[0-9]+\n?$/u.test(output)) throw unavailable();
      const uid = Number(output.trim());
      if (!Number.isSafeInteger(uid) || uid < 0) throw unavailable();
      return uid;
    },
    async exactMetadata(path) {
      return parseAgentStatOutput(await systemCall("/usr/bin/stat", ["-f", "%u:%l:%p:%z:%d:%i", "--", path]));
    },
    sha256: path => IOUtils.computeHexDigest(path, "sha256"),
  };
}

// createBackend is a test-only injection; ordinary native use imports the
// reviewed adjacent product module. The caller cannot configure helper paths.
export async function createNativeAgentChannelConfiguration({ runtime, createBackend } = {}) {
  try {
    runtime ??= nativeRuntime();
    if (["env", "verifyFile", "profileDirectory", "ownUid", "exactMetadata", "sha256"].some(name => typeof runtime[name] !== "function")
      || typeof runtime.Subprocess?.call !== "function" || typeof runtime.timers?.setTimeout !== "function"
      || typeof runtime.timers?.clearTimeout !== "function") throw unavailable();
    const paths = agentSocketPaths(runtime.env("AXIOSOZO_STATIC_READER_ROOT") || runtime.env("AXIOSOZO_BUILD_ROOT"));
    const profilePath = runtime.profileDirectory();
    const socketPath = agentProfileSocketPath(profilePath);
    let uid;
    const verify = async expired => {
      const inspect = async (path, options, admit) => {
        if (expired() || await runtime.verifyFile(path, options) !== true || expired()) throw unavailable();
        const value = await runtime.exactMetadata(path);
        if (!metadata(value) || !admit(value) || expired()) throw unavailable();
        return value;
      };
      const executable = value => value.kind === "regular" && value.uid === uid && value.nlink === 1
        && !(value.mode & 0o022) && !!(value.mode & 0o111);
      const helper = value => value.kind === "regular" && value.uid === uid && value.nlink === 1
        && value.mode === 0o400 && value.size <= 128 * 1024;
      const privateDirectory = value => value.kind === "directory" && value.uid === uid && value.mode === 0o700;
      const priorPython = await inspect(paths.interpreter, { executable: true }, executable);
      const priorParent = await inspect(paths.helperDirectory, { directory: true }, privateDirectory);
      const priorHelper = await inspect(paths.helperPath, {}, helper);
      const priorProfile = await inspect(profilePath, { directory: true }, privateDirectory);
      if (await runtime.sha256(paths.helperPath) !== AGENT_SOCKET_SHA256 || expired()) throw unavailable();
      if (!same(priorPython, await inspect(paths.interpreter, { executable: true }, executable))
        || !same(priorParent, await inspect(paths.helperDirectory, { directory: true }, privateDirectory))
        || !same(priorHelper, await inspect(paths.helperPath, {}, helper))
        || !same(priorProfile, await inspect(profilePath, { directory: true }, privateDirectory))) throw unavailable();
    };
    return await deadline(runtime, async expired => {
      uid = await runtime.ownUid();
      if (!Number.isSafeInteger(uid) || uid < 0 || expired()) throw unavailable();
      await verify(expired);
      createBackend ??= (await import("./AgentSocketSubprocess.sys.mjs")).createAgentSocketSubprocessBackend;
      if (expired() || typeof createBackend !== "function") throw unavailable();
      const admitOptions = options => {
          const args = options?.arguments;
          if (options?.command !== paths.interpreter || !Array.isArray(args) || args.length !== 6
            || args[0] !== "-I" || args[1] !== "-S" || args[2] !== "-B" || args[3] !== paths.helperPath
            || !OPERATIONS.has(args[4]) || typeof args[5] !== "string" || encoder.encode(args[5]).length > 16384
            || options.environmentAppend !== false || options.workdir !== "/" || options.stderr !== "ignore"
            || Object.keys(options.environment ?? {}).sort().join(",") !== "LANG,LC_ALL,PYTHONDONTWRITEBYTECODE,PYTHONNOUSERSITE"
            || options.environment.LANG !== "C" || options.environment.LC_ALL !== "C"
            || options.environment.PYTHONNOUSERSITE !== "1" || options.environment.PYTHONDONTWRITEBYTECODE !== "1") throw unavailable();
          return Object.freeze({ operation: args[4], argument: args[5] });
      };
      const beginOwnedCall = options => {
        const owner = createOwnedSocketSpawn(runtime.timers);
        const process = (async () => {
          let admitted;
          try { admitted = admitOptions(options); if (admitted.operation !== "lock") throw unavailable(); }
          catch (cause) { owner.spawnRejected(); throw cause; }
          return deadline(runtime, async launchExpired => {
            try { await verify(launchExpired); }
            catch (cause) { owner.spawnRejected(); throw cause; }
            if (launchExpired() || !owner.beginSpawn()) { owner.spawnRejected(); throw unavailable(); }
            let raw;
            try {
              raw = await runtime.Subprocess.call({ command: paths.interpreter,
                arguments: ["-I", "-S", "-B", paths.helperPath, admitted.operation, admitted.argument],
                environment: { LANG: "C", LC_ALL: "C", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" },
                environmentAppend: false, stderr: "pipe", workdir: "/" });
            } catch (cause) { owner.spawnRejected(); throw cause; }
            // Publish the exact raw child before proxy validation or any late
            // watchdog check. Retain raw wait separately from usability loss.
            owner.adoptProcess({ stdin: { close: force => raw.stdin.close(force) },
              wait: () => raw.wait(), waitForOwnedExit: () => raw.wait(),
              retryOwnedCleanup: () => cleanupProcess(runtime.timers, raw, true) });
            if (launchExpired() || owner.cancelled) throw unavailable();
            const owned = await ownHelperProcess(runtime, raw);
            if (launchExpired() || owner.cancelled) throw unavailable();
            return owned;
          });
        })();
        process.catch(() => {});
        return Object.freeze({ owner, process });
      };
      const guardedSubprocess = Object.freeze({
        beginOwnedCall,
        async call(options) {
          const { operation, argument } = admitOptions(options);
          // Lock acquisitions must use the retained owner API. Refuse an old
          // caller that would lose that owner when its deadline rejects.
          if (operation === "lock") throw unavailable();
          return deadline(runtime, async launchExpired => {
            await verify(launchExpired);
            if (launchExpired()) throw unavailable();
            // Reconstruct from admitted immutable strings. An options object
            // changed while metadata awaits cannot change the executable.
            const process = await runtime.Subprocess.call({ command: paths.interpreter,
              arguments: ["-I", "-S", "-B", paths.helperPath, operation, argument],
              environment: { LANG: "C", LC_ALL: "C", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" },
              environmentAppend: false, stderr: "pipe", workdir: "/" });
            // A spawn resolving after the watchdog must not leave a lock
            // child running when the backend never obtained its handle.
            if (launchExpired()) { await cleanupProcess(runtime.timers, process); throw unavailable(); }
            const owned = await ownHelperProcess(runtime, process);
            if (launchExpired()) { await owned.kill(0); throw unavailable(); }
            return owned;
          });
        },
      });
      const exactPosixBackend = createBackend({ configuredTrusted: true, ...paths,
        Subprocess: guardedSubprocess, timers: runtime.timers });
      if (exactPosixBackend?.exactAvailable !== true || expired()) throw unavailable();
      return Object.freeze({ socketPath, exactPosixBackend, paths,
        ownershipDiagnostics: () => Object.freeze({ native_config_verified: true,
          lock_helpers: exactPosixBackend.ownershipDiagnostics?.() ?? null }) });
    });
  } catch { throw unavailable(); }
}
