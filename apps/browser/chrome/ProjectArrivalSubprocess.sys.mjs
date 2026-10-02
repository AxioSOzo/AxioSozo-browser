/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free fixed-operation native adapter. No page/actor supplies any path,
// executable, environment or process cwd. The trusted build root is admitted
// once and the exact private helper is checksum-verified before every call.
export const ARRIVAL_LSOF_SHA256 = "eaf010c92576c1aae64d5e1d216de0ae85db312866bc8c808cef981df16136b2";
export const ARRIVAL_LSOF_PYTHON = "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11";
const VOLUME = "/Volumes/AxioSozoBuild";
const RESERVED = new Set(["zen", "toolchains", "cargo-home", "cargo-target", "caches", "runtime", "tmp",
  "cef", "providers", "logs", "release", "diag", "diagnostics", "gui-fixtures"]);
const ENV = Object.freeze({ PATH: "/usr/bin:/bin:/usr/sbin", LANG: "C", LC_ALL: "C" });
const refused = () => Object.assign(new Error("ARRIVAL_SUBPROCESS_UNAVAILABLE"), { code: "ARRIVAL_SUBPROCESS_UNAVAILABLE" });
const value = (object, key) => object && typeof object === "object" ? Object.getOwnPropertyDescriptor(object, key)?.value : undefined;
const decimal = (text, maximum, minimum = 0) => typeof text === "string" && /^(?:0|[1-9][0-9]{0,9})$/u.test(text)
  && Number.isSafeInteger(Number(text)) && Number(text) >= minimum && Number(text) <= maximum;

export function arrivalSubprocessPaths(root) {
  const suffix = typeof root === "string" && root.startsWith(`${VOLUME}/`) ? root.slice(VOLUME.length + 1) : null;
  if (root !== VOLUME && !(suffix !== null && /^[a-z0-9][a-z0-9-]{0,39}$/u.test(suffix) && !RESERVED.has(suffix))) throw refused();
  return Object.freeze({ interpreter: ARRIVAL_LSOF_PYTHON,
    helperPath: `${root}/contexts/arrival-lsof-${ARRIVAL_LSOF_SHA256}.py` });
}

// This exact parser mirrors packages/contexts/src/arrival.mjs. It refuses
// alternate selectors and requires the owner's literal UID argument; Python
// independently checks that UID against os.getuid before spawning anything.
export function arrivalSubprocessOperation(options) {
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["command", "arguments", "environmentAppend", "environment", "stderr"].includes(key))
    || value(options, "environmentAppend") !== false || value(options, "stderr") !== "pipe") throw refused();
  const environment = value(options, "environment");
  if (!environment || typeof environment !== "object" || Array.isArray(environment)
    || Object.keys(environment).length !== 3 || Object.keys(ENV).some(key => value(environment, key) !== ENV[key])) throw refused();
  const args = value(options, "arguments");
  if (!Array.isArray(args) || Object.getOwnPropertyNames(args).some(key => key !== "length" && !/^(?:0|[1-9][0-9]*)$/u.test(key))
    || args.length > 10 || Array.from({ length: args.length }, (_, i) => value(args, String(i))).some(arg => typeof arg !== "string")) throw refused();
  const command = value(options, "command");
  if (command === "/usr/bin/id" && args.length === 1 && value(args, "0") === "-u") return Object.freeze({ command: "id" });
  if (command !== "/usr/sbin/lsof") throw refused();
  const list = Array.from({ length: args.length }, (_, i) => value(args, String(i)));
  if (list.length === 8 && list[0] === "-nP" && list[1] === "-a" && list[2].startsWith("-iTCP:")
    && decimal(list[2].slice(6), 65535, 1) && list[3] === "-sTCP:LISTEN" && list[4] === "-F" && list[5] === "pun"
    && list[6] === "-u" && decimal(list[7], 4294967295)) {
    return Object.freeze({ command: "lsof", operation: "listen", number: list[2].slice(6), uid: list[7] });
  }
  if (list.length === 10 && list[0] === "-nP" && list[1] === "-a" && list[2] === "-p"
    && decimal(list[3], 2147483647, 1) && list[4] === "-d" && list[5] === "cwd" && list[6] === "-F"
    && list[7] === "pn" && list[8] === "-u" && decimal(list[9], 4294967295)) {
    return Object.freeze({ command: "lsof", operation: "cwd", number: list[3], uid: list[9] });
  }
  throw refused();
}

function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  return { Subprocess, timers, env: name => Services.env.get(name),
    verifyFile(path, { executable = false, privateParent = false } = {}) {
      const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      file.initWithPath(path);
      if (!file.exists() || file.isSymlink() || !file.isFile()) return false;
      file.normalize();
      if (file.path !== path || !file.isReadable() || executable && !file.isExecutable()) return false;
      if ((file.permissions & 0o022) !== 0 || !executable && ((file.permissions & 0o777) !== 0o400 || file.fileSize > 128 * 1024)) return false;
      if (privateParent && (!file.parent.isDirectory() || file.parent.isSymlink() || (file.parent.permissions & 0o777) !== 0o700)) return false;
      return true;
    },
    sha256: path => IOUtils.computeHexDigest(path, "sha256"),
  };
}

export async function createNativeProjectArrivalSubprocess({ runtime } = {}) {
  let deadlineTimer, stopped = false;
  try {
    runtime ??= nativeRuntime();
    if (typeof runtime.env !== "function" || typeof runtime.verifyFile !== "function" || typeof runtime.sha256 !== "function"
      || typeof runtime.Subprocess?.call !== "function" || typeof runtime.timers?.setTimeout !== "function"
      || typeof runtime.timers?.clearTimeout !== "function") throw refused();
    const paths = arrivalSubprocessPaths(runtime.env("AXIOSOZO_STATIC_READER_ROOT") || runtime.env("AXIOSOZO_BUILD_ROOT"));
    const verified = async () => {
      if (await runtime.verifyFile(paths.interpreter, { executable: true }) !== true
        || await runtime.verifyFile(paths.helperPath, { privateParent: true }) !== true
        || await runtime.sha256(paths.helperPath) !== ARRIVAL_LSOF_SHA256
        || await runtime.verifyFile(paths.helperPath, { privateParent: true }) !== true || stopped) throw refused();
    };
    const deadline = new Promise((_, reject) => {
      deadlineTimer = runtime.timers.setTimeout(() => { stopped = true; reject(refused()); }, 3000);
    });
    await Promise.race([verified(), deadline]);
    const call = async options => {
      const operation = arrivalSubprocessOperation(options);
      // Also verify for id calls: no discovery starts with an unavailable helper.
      // Verification is bounded by createProjectArrival's existing 3s session.
      // It does not read a project/profile or a caller-supplied file.
      const checked = (async () => {
        if (await runtime.verifyFile(paths.helperPath, { privateParent: true }) !== true
          || await runtime.sha256(paths.helperPath) !== ARRIVAL_LSOF_SHA256
          || await runtime.verifyFile(paths.helperPath, { privateParent: true }) !== true) throw refused();
      })();
      let timer;
      try {
        await Promise.race([checked, new Promise((_, reject) => { timer = runtime.timers.setTimeout(() => reject(refused()), 3000); })]);
      } finally { runtime.timers.clearTimeout(timer); }
      return runtime.Subprocess.call({ command: operation.command === "id" ? "/usr/bin/id" : paths.interpreter,
        arguments: operation.command === "id" ? ["-u"] : ["-I", "-S", "-B", paths.helperPath, operation.operation, operation.number, operation.uid],
        environmentAppend: false, environment: { ...ENV }, stderr: "pipe", workdir: "/" });
    };
    return Object.freeze({ call });
  } catch { throw refused(); }
  finally { stopped = true; if (deadlineTimer !== undefined) runtime?.timers?.clearTimeout(deadlineTimer); }
}
