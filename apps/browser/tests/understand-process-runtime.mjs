// REVIEWED TEST SEAM CANDIDATE. Only fixed owned offline fixture children run.
// Raw pipes model Gecko Subprocess: read() returns ArrayBuffer, zero bytes is EOF.
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import {
  understandFixturePaths, UNDERSTAND_METADATA_ID, UNDERSTAND_METADATA_STAT,
  UNDERSTAND_METADATA_HASH, UNDERSTAND_METADATA_FORMAT, UNDERSTAND_FIXTURE_HASH_CODE,
} from "../chrome/NativeUnderstandFixtureRuntime.sys.mjs";
import { UNDERSTAND_FIXTURE_INPUTS, UNDERSTAND_FIXTURE_BINARIES }
  from "../chrome/UnderstandFixturePins.sys.mjs";

const ROOT_RE = /^\/Volumes\/AxioSozoBuild\/workstation\/gui-fixtures\/understand-([0-9a-f]{32})$/u;
const PROFILE_BASE = "/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c";
const METADATA = [UNDERSTAND_METADATA_ID, UNDERSTAND_METADATA_STAT, UNDERSTAND_METADATA_HASH];
const PRIVATE_BASE = "/Volumes/AxioSozoBuild/workstation/gui-fixtures";
const unavailable = () => Object.assign(new Error("UNDERSTAND_FIXTURE_UNAVAILABLE"),
  { code: "UNDERSTAND_FIXTURE_UNAVAILABLE" });
const plain = x => x !== null && typeof x === "object" && !Array.isArray(x)
  && [Object.prototype, null].includes(Object.getPrototypeOf(x));
const keys = (x, expected) => plain(x) && Object.keys(x).sort().join(",") === [...expected].sort().join(",");
const equal = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
const requireValue = x => { if (!x) throw unavailable(); };
const components = path => path.split("/").slice(1).map((_, i, all) => "/" + all.slice(0, i + 1).join("/"));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const pidValid = pid => Number.isSafeInteger(pid) && pid > 1 && pid <= 2147483647 && pid !== process.pid;

export function fixtureProfileForRoot(root) {
  const match = typeof root === "string" && ROOT_RE.exec(root);
  requireValue(match);
  return `${PROFILE_BASE}/plan4-understand-${match[1]}/gecko`;
}
function privateDirectory(full) {
  const info = fs.lstatSync(full);
  requireValue(info.isDirectory() && !info.isSymbolicLink() && info.uid === process.getuid()
    && (info.mode & 0o7777) === 0o700 && fs.realpathSync(full) === full);
  return info;
}
function sameFile(a, b) {
  return ["dev", "ino", "uid", "mode", "nlink", "size", "mtimeMs", "ctimeMs"].every(key => a[key] === b[key]);
}

/** Reads owned metadata receipts only; never reads a project or profile file. */
export function readFixtureProcessReceipts(root) {
  fixtureProfileForRoot(root);
  const rootInfo = privateDirectory(root), filename = `${root}/process-receipts.jsonl`;
  let fd;
  try {
    fd = fs.openSync(filename, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  try {
    const before = fs.fstatSync(fd);
    requireValue(before.isFile() && before.uid === process.getuid() && before.nlink === 1
      && (before.mode & 0o7777) === 0o600 && before.size >= 0 && before.size <= 65536);
    const raw = Buffer.alloc(before.size + 1);
    let size = 0;
    while (size < raw.length) {
      const n = fs.readSync(fd, raw, size, raw.length - size, null);
      if (n === 0) break;
      size += n;
    }
    const after = fs.fstatSync(fd), named = fs.lstatSync(filename), rootAfter = privateDirectory(root);
    requireValue(rootInfo.dev === rootAfter.dev && rootInfo.ino === rootAfter.ino);
    if (size !== before.size || !sameFile(before, after) || !sameFile(before, named))
      throw Object.assign(new Error("OWNED_FIXTURE_RECEIPT_CHANGED"), { code: "OWNED_FIXTURE_RECEIPT_CHANGED" });
    const text = new TextDecoder("utf-8", { fatal: true }).decode(raw.subarray(0, size));
    if (!text) return [];
    requireValue(text.endsWith("\n"));
    const lines = text.slice(0, -1).split("\n");
    requireValue(lines.length <= 256);
    return lines.map(line => {
      requireValue(Buffer.byteLength(line) <= 256);
      const row = JSON.parse(line);
      requireValue(keys(row, ["launcher_pid", "child_pid", "mode"])
        && pidValid(row.launcher_pid) && pidValid(row.child_pid)
        && row.launcher_pid !== row.child_pid && ["host", "cli"].includes(row.mode));
      return Object.freeze(row);
    });
  } finally { fs.closeSync(fd); }
}

export function processRuntime({ root, profile, syntheticFlag = "1", fixtureFlag = "1",
  callLog = [], receipt = [], testOnly = null } = {}) {
  requireValue(testOnly === null || keys(testOnly, ["spawn", "assertPrivateProfile"])
    && typeof testOnly.spawn === "function" && typeof testOnly.assertPrivateProfile === "function");
  const spawnProcess = testOnly?.spawn ?? spawn;
  const assertPrivateProfile = testOnly?.assertPrivateProfile ?? (full => { privateDirectory(full); return true; });
  const absent = root === undefined || root === null || root === "";
  requireValue(Array.isArray(callLog) && Array.isArray(receipt));
  requireValue(syntheticFlag === "1" && fixtureFlag === "1");
  if (absent) requireValue(profile === undefined || profile === null || profile === "");
  const paths = absent ? null : understandFixturePaths(root, profile);
  if (paths) requireValue(assertPrivateProfile(paths.profile) === true); // Metadata only, no profile contents.
  const environment = Object.freeze({ AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT: root,
    AXIOSOZO_SYNTHETIC_TEST: syntheticFlag, AXIOSOZO_UNDERSTAND_GUI_FIXTURE: fixtureFlag });
  const ownedHosts = new Map(), ownedHostSignals = new Map();
  const leaves = paths ? [PRIVATE_BASE, paths.root, paths.profile, `${paths.root}/home`, ...paths.projectRoots,
    ...UNDERSTAND_FIXTURE_INPUTS.map(x => `${paths.root}/${x.relative}`),
    ...UNDERSTAND_FIXTURE_BINARIES.map(x => x.path), ...METADATA] : [];
  const admittedPaths = new Set(leaves.flatMap(components));

  function classify(options) {
    requireValue(paths && keys(options, ["command", "arguments", "environmentAppend", "environment", "workdir", "stderr"])
      && typeof options.command === "string" && Array.isArray(options.arguments)
      && options.arguments.every(x => typeof x === "string") && options.environmentAppend === false
      && options.workdir === "/" && options.stderr === "pipe" && plain(options.environment));
    const args = options.arguments, command = options.command, env = options.environment;
    const id = command === UNDERSTAND_METADATA_ID && equal(args, ["-u"]);
    const stat = command === UNDERSTAND_METADATA_STAT && args.length >= 3 && args.length <= 26
      && args[0] === "-f" && args[1] === UNDERSTAND_METADATA_FORMAT && args.slice(2).every(x => admittedPaths.has(x));
    const binaries = command === UNDERSTAND_METADATA_HASH
      && equal(args, ["dgst", "-sha256", "-r", ...UNDERSTAND_FIXTURE_BINARIES.map(x => x.path)]);
    const inputs = command === paths.interpreter
      && equal(args, ["-I", "-S", "-B", "-c", UNDERSTAND_FIXTURE_HASH_CODE, paths.root, paths.profile]);
    const host = command === paths.interpreter
      && equal(args, ["-I", "-S", "-B", paths.helper, "host", paths.root, paths.profile]);
    requireValue(id || stat || binaries || inputs || host);
    if (host) requireValue(keys(env, ["LANG", "LC_ALL", "AXIOSOZO_SYNTHETIC_TEST", "AXIOSOZO_UNDERSTAND_GUI_FIXTURE", "AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT"])
      && env.LANG === "C" && env.LC_ALL === "C" && env.AXIOSOZO_SYNTHETIC_TEST === "1"
      && env.AXIOSOZO_UNDERSTAND_GUI_FIXTURE === "1" && env.AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT === paths.root);
    else requireValue(keys(env, binaries ? ["LANG", "LC_ALL", "OPENSSL_CONF"] : ["LANG", "LC_ALL"])
      && env.LANG === "C" && env.LC_ALL === "C" && (!binaries || env.OPENSSL_CONF === "/dev/null"));
    return host ? "host" : binaries ? "binary-hash" : inputs ? "input-hash" : id ? "uid" : "stat";
  }
  const runtime = Object.freeze({
    env: name => environment[name], profilePath: () => profile,
    timers: Object.freeze({ setTimeout, clearTimeout }), clock: () => Date.now(), uuid: randomUUID,
    metadataCommandAvailable(full) {
      if (!METADATA.includes(full)) return false;
      try {
        return components(full).every(part => {
          const info = fs.lstatSync(part);
          return !info.isSymbolicLink() && [0, process.getuid()].includes(info.uid)
            && (info.mode & 0o022) === 0 && fs.realpathSync(part) === part
            && (part === full ? info.isFile() && (info.mode & 0o111) !== 0 : info.isDirectory());
        });
      } catch { return false; }
    },
    async spawn(options) {
      // Private admission authority belongs to this operation, never the host lifetime.
      requireValue(plain(options));
      const descriptor = Object.getOwnPropertyDescriptor(options, "isActive");
      requireValue(!descriptor || Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function");
      const requireActive = () => {
        if (!descriptor) return;
        let result;
        try { result = descriptor.value(); } catch {}
        if (result === true) return;
        // The intrinsic brands genuine Promises; arbitrary thenables are never invoked.
        try { Promise.prototype.then.call(result, undefined, () => {}); } catch {}
        throw unavailable();
      };
      requireActive(); // Before classification or privileged endpoint checks.
      const nativeOptions = { ...options };
      delete nativeOptions.isActive;
      const kind = classify(nativeOptions);
      const entry = { kind, command: nativeOptions.command, arguments_count: nativeOptions.arguments.length,
        environment_keys: Object.keys(nativeOptions.environment).sort(), workdir: "/", shell: false, pid: null, kill_graces: [] };
      const command = nativeOptions.command, argumentsList = [...nativeOptions.arguments];
      const processOptions = { shell: false, cwd: "/",
        env: { ...nativeOptions.environment }, stdio: ["pipe", "pipe", "pipe"] };
      requireActive(); // No await or option construction may separate this from spawn.
      const child = spawnProcess(command, argumentsList, processOptions);
      callLog.push(entry);
      let exited = false, cleanupTimer = null, resolveExit, rejectExit;
      const writes = new Set();
      child.stdin.on("error", error => { for (const reject of writes) reject(error); writes.clear(); });
      const exit = new Promise((resolve, reject) => { resolveExit = resolve; rejectExit = reject; });
      exit.catch(() => {});
      child.on("error", error => { exited = true; clearTimeout(cleanupTimer); rejectExit(error); });
      child.on("exit", () => { ownedHosts.delete(child.pid); ownedHostSignals.delete(child.pid); });
      child.on("close", (code, signal) => {
        exited = true; clearTimeout(cleanupTimer); ownedHosts.delete(child.pid);
        receipt.push(Object.freeze({ pid: child.pid ?? null, kind, reaped: true, exit_code: code ?? -9, signal: signal ?? null }));
        resolveExit({ exitCode: code ?? -9 });
      });
      await new Promise((resolve, reject) => { child.once("spawn", resolve); child.once("error", reject); });
      entry.pid = child.pid;
      const pipe = stream => {
        const iterator = stream[Symbol.asyncIterator]();
        return Object.freeze({ async read() {
          const next = await iterator.next();
          if (next.done) return new ArrayBuffer(0);
          const raw = next.value;
          requireValue(Buffer.isBuffer(raw) || raw instanceof Uint8Array);
          // Buffer's backing slab may contain unrelated bytes. Return exact bytes.
          const copy = new Uint8Array(raw.byteLength); copy.set(raw);
          return copy.buffer;
        }, async close() { stream.destroy(); } });
      };
      const handle = Object.freeze({ pid: child.pid, stdout: pipe(child.stdout), stderr: pipe(child.stderr),
        stdin: Object.freeze({ write: value => new Promise((resolve, reject) => {
          requireValue(typeof value === "string" && Buffer.byteLength(value) <= 73729);
          writes.add(reject);
          try { child.stdin.write(value, error => { writes.delete(reject); error ? reject(error) : resolve(); }); }
          catch (error) { writes.delete(reject); reject(error); }
        }), async close(force) {
          if (force) child.stdin.destroy();
          else if (!child.stdin.writableEnded) child.stdin.end();
        } }), wait: () => exit, async kill(grace) {
          requireValue(Number.isInteger(grace) && grace >= 0 && grace <= 1000);
          entry.kill_graces.push(grace);
          if (exited) return;
          child.kill(grace === 0 ? "SIGKILL" : "SIGTERM");
          if (grace > 0) {
            clearTimeout(cleanupTimer);
            cleanupTimer = setTimeout(() => { if (!exited) child.kill("SIGKILL"); }, grace);
          }
        } });
      if (kind === "host") {
        ownedHosts.set(child.pid, handle);
        ownedHostSignals.set(child.pid, () => child.exitCode === null && child.signalCode === null && child.kill("SIGUSR1"));
      }
      return handle;
    },
  });

  async function waitForReceipt(predicate, { afterRecord = 0, timeoutMs = 4000 } = {}) {
    requireValue(paths && Number.isInteger(afterRecord) && afterRecord >= 0
      && Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 4000);
    const deadline = Date.now() + timeoutMs;
    do {
      let rows;
      try { rows = readFixtureProcessReceipts(paths.root); }
      catch (error) { if (error.code !== "OWNED_FIXTURE_RECEIPT_CHANGED") throw error; }
      const found = rows?.slice(afterRecord).find(predicate);
      if (found) return found;
      await delay(25);
    } while (Date.now() < deadline);
    throw new Error("OWNED_FIXTURE_RECEIPT_TIMEOUT");
  }
  async function closeOwnedHostInput() {
    requireValue(paths && ownedHosts.size === 1);
    await [...ownedHosts.values()][0].stdin.close();
  }
  async function crashOwnedNodeHost() {
    requireValue(paths && ownedHosts.size === 1);
    const launcher = [...ownedHosts.keys()][0], rows = readFixtureProcessReceipts(paths.root);
    const index = rows.findLastIndex(row => row.mode === "host" && row.launcher_pid === launcher);
    requireValue(index >= 0 && rows.slice(index + 1).some(row => row.mode === "cli")
      && !rows.slice(index + 1).some(row => row.mode === "host"));
    const host = rows[index];
    requireValue(!callLog.some(row => row.pid === host.child_pid));
    // Fixed host-only SIGUSR1 asks the Python helper to SIGKILL its owned
    // Popen Node child. Use the retained ChildProcess handle, never a global PID.
    // The signal capability retires on exit, even if inherited pipes remain open.
    requireValue(ownedHostSignals.get(launcher)?.() === true);
    return host;
  }
  async function waitForFixtureReaped({ afterRecord = 0, timeoutMs = 4000 } = {}) {
    requireValue(paths && Number.isInteger(afterRecord) && afterRecord >= 0
      && Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 4000);
    const deadline = Date.now() + timeoutMs;
    let rows, pids, alive;
    do {
      try { rows = readFixtureProcessReceipts(paths.root).slice(afterRecord); }
      catch (error) {
        if (error.code !== "OWNED_FIXTURE_RECEIPT_CHANGED") throw error;
        await delay(25); continue;
      }
      pids = [...new Set([...rows.flatMap(row => [row.launcher_pid, row.child_pid]),
        ...callLog.map(row => row.pid).filter(pidValid)])];
      alive = pids.filter(pid => {
        requireValue(pidValid(pid));
        try { process.kill(pid, 0); return true; }
        catch (error) { if (error.code === "ESRCH") return false; throw error; }
      });
      if (alive.length === 0) return { records: rows, pids, alive };
      await delay(25);
    } while (Date.now() < deadline);
    throw Object.assign(new Error("OWNED_FIXTURE_NOT_REAPED"), { alive });
  }
  async function closeOwnedHosts() {
    await Promise.all([...ownedHosts.values()].map(async child => {
      await child.stdin.close().catch(() => {});
      await child.kill(750).catch(() => {});
      await Promise.race([child.wait().catch(() => {}), delay(1000)]);
    }));
  }
  return Object.freeze({ runtime, environment, paths, callLog, receipt,
    readReceipts: () => { requireValue(paths); return readFixtureProcessReceipts(paths.root); },
    waitForReceipt, waitForFixtureReaped, closeOwnedHostInput, crashOwnedNodeHost, closeOwnedHosts });
}
