/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free verified hook configuration; no provider configuration is read or changed.
import { hookConfig } from "./contexts/agent-config.mjs";
import { agentSocketPaths, parseAgentStatOutput } from "./AgentChannelConfig.sys.mjs";
import { readAgentPipe } from "./AgentPipeBytes.sys.mjs";

export const AGENT_NOTIFY_SHA256 = "b9113d90b227093d2e31890a1963d1d8b67446b88fa413b02bfc9621d28ff6c3";
const LIMIT = 64 * 1024;
const unavailable = () => Object.assign(new Error("AGENT_HOOK_CONFIG_UNAVAILABLE"), { code: "AGENT_HOOK_CONFIG_UNAVAILABLE" });
const metadata = value => value && ["regular", "directory"].includes(value.kind)
  && Number.isSafeInteger(value.uid) && value.uid >= 0
  && Number.isSafeInteger(value.nlink) && value.nlink >= 1
  && Number.isSafeInteger(value.mode) && value.mode >= 0 && value.mode <= 0o7777
  && Number.isSafeInteger(value.size) && value.size >= 0
  && typeof value.device === "string" && /^[0-9]+$/u.test(value.device)
  && typeof value.inode === "string" && /^[0-9]+$/u.test(value.inode);
const same = (left, right) => metadata(left) && metadata(right)
  && ["kind", "uid", "nlink", "mode", "size", "device", "inode"].every(key => left[key] === right[key]);
const invoke = callback => Promise.resolve().then(callback);

// This function never installs, changes provider configuration, connects or
// executes the notifier. Only an explicit trusted service request calls it.
// Runtime is a privileged second-argument test seam, never actor request data.
export async function buildNativeAgentHookConfig({ agent, socketPath } = {}, runtime) {
  // Validate agent/socket data before native imports, metadata reads or timers.
  // This dry pure construction does not emit or use a fallback socket.
  hookConfig({ agent, socketPath, notifyPath: "/fixed/axiosozo-notify.sh" });
  let timer = null, expired = false;
  try {
    runtime ??= nativeRuntime();
    if (["env", "verifyFile", "ownUid", "exactMetadata", "sha256"].some(key => typeof runtime[key] !== "function")
      || typeof runtime.timers?.setTimeout !== "function" || typeof runtime.timers?.clearTimeout !== "function") throw unavailable();
    const root = runtime.env("AXIOSOZO_STATIC_READER_ROOT") || runtime.env("AXIOSOZO_BUILD_ROOT");
    const directory = agentSocketPaths(root).helperDirectory; // Existing admitted storage-root policy.
    const notifyPath = `${directory}/axiosozo-notify-${AGENT_NOTIFY_SHA256}.sh`;
    const assertLive = () => { if (expired) throw unavailable(); };
    const stop = new Promise((_, reject) => {
      timer = runtime.timers.setTimeout(() => { expired = true; reject(unavailable()); }, 3000);
    });
    const verify = async () => {
      const uid = await runtime.ownUid();
      assertLive();
      if (!Number.isSafeInteger(uid) || uid < 0) throw unavailable();
      const inspect = async (path, options, admission) => {
        assertLive();
        if (await runtime.verifyFile(path, options) !== true) throw unavailable();
        assertLive();
        const value = await runtime.exactMetadata(path);
        assertLive();
        if (!metadata(value) || !admission(value)) throw unavailable();
        return Object.freeze({ ...value });
      };
      const ownedRoot = value => value.kind === "directory" && value.uid === uid && !(value.mode & 0o022);
      const privateParent = value => value.kind === "directory" && value.uid === uid && value.mode === 0o700;
      const script = value => value.kind === "regular" && value.uid === uid && value.nlink === 1
        && value.mode === 0o400 && value.size > 0 && value.size <= LIMIT;
      const priorRoot = await inspect(root, { directory: true }, ownedRoot);
      const priorParent = await inspect(directory, { directory: true }, privateParent);
      const priorScript = await inspect(notifyPath, {}, script);
      const digest = await runtime.sha256(notifyPath);
      assertLive();
      if (digest !== AGENT_NOTIFY_SHA256) throw unavailable();
      if (!same(priorRoot, await inspect(root, { directory: true }, ownedRoot))
        || !same(priorParent, await inspect(directory, { directory: true }, privateParent))
        || !same(priorScript, await inspect(notifyPath, {}, script))) throw unavailable();
      assertLive();
      return hookConfig({ agent, socketPath, notifyPath });
    };
    return await Promise.race([verify(), stop]);
  } catch { throw unavailable(); }
  finally { expired = true; if (timer !== null) runtime?.timers?.clearTimeout(timer); }
}

async function cleanup(runtime, child, kill = true) {
  if (!child) return;
  let timer = null;
  const jobs = [child.stdin, child.stdout, child.stderr].filter(pipe => typeof pipe?.close === "function")
    .map(pipe => invoke(() => pipe.close(true)));
  if (kill && typeof child.kill === "function") jobs.push(invoke(() => child.kill(0)));
  if (typeof child.wait === "function") jobs.push(invoke(() => child.wait()));
  const stop = new Promise(resolve => { timer = runtime.timers.setTimeout(resolve, 500); });
  try { await Promise.race([Promise.allSettled(jobs), stop]); }
  finally { runtime.timers.clearTimeout(timer); }
}

// Existing pinned id/stat pattern only; no script interpreter, shell command,
// provider executable, profile/config read, PATH discovery or ctypes/ABI seam.
function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const runtime = { timers };
  const verifyFile = (path, { executable = false, directory = false } = {}) => {
    if (typeof path !== "string" || !path.startsWith("/") || path.endsWith("/") || path.includes("//")
      || path.split("/").some(part => part === "." || part === "..")) return false;
    // Refuse observed symlink ancestors as well as the final entry.
    let prefix = "";
    for (const part of path.split("/").slice(1)) {
      prefix += "/" + part;
      const ancestor = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      ancestor.initWithPath(prefix);
      if (!ancestor.exists() || ancestor.isSymlink() || prefix !== path && !ancestor.isDirectory()) return false;
    }
    const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    file.initWithPath(path);
    if (!(directory ? file.isDirectory() : file.isFile()) || !file.isReadable()
      || executable && !file.isExecutable()) return false;
    file.normalize();
    return file.path === path && !(file.permissions & 0o022);
  };
  const systemCall = async (command, args) => {
    if (!["/usr/bin/id", "/usr/bin/stat"].includes(command) || !verifyFile(command, { executable: true })) throw unavailable();
    let child = null, timer = null, expired = false, exited = false;
    const stop = new Promise((_, reject) => {
      timer = timers.setTimeout(() => { expired = true; reject(unavailable()); }, 1000);
    });
    const assertLive = () => { if (expired) throw unavailable(); };
    const execute = async () => {
      const owned = await Subprocess.call({ command, arguments: args,
        environment: { LANG: "C", LC_ALL: "C" }, environmentAppend: false, stderr: "pipe", workdir: "/" });
      if (expired) { await cleanup(runtime, owned); throw unavailable(); }
      child = owned;
      if (typeof child?.stdin?.close !== "function" || typeof child?.stdout?.read !== "function"
        || typeof child?.stderr?.read !== "function" || typeof child?.kill !== "function"
        || typeof child?.wait !== "function") throw unavailable();
      await child.stdin.close();
      assertLive();
      const [output] = await Promise.all([
        readAgentPipe(child.stdout, { limit: 512, keep: true, assertLive }),
        readAgentPipe(child.stderr, { limit: 512, keep: false, assertLive }),
      ]);
      const status = await child.wait();
      assertLive();
      exited = true;
      if (status?.exitCode !== 0) throw unavailable();
      return output;
    };
    try { return await Promise.race([execute(), stop]); }
    catch { throw unavailable(); }
    finally { expired = true; timers.clearTimeout(timer); await cleanup(runtime, child, !exited); }
  };
  return {
    timers, verifyFile, env: name => Services.env.get(name),
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
