/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Trusted, DOM-free synthetic Understand fixture admission.
// Absent request imports no native process modules. A requested failure never
// falls back to production providers, PATH discovery or a different profile.
import { UNDERSTAND_FIXTURE_PYTHON, UNDERSTAND_FIXTURE_NODE,
  UNDERSTAND_FIXTURE_HELPER, UNDERSTAND_FIXTURE_INPUTS,
  UNDERSTAND_FIXTURE_BINARIES } from "./UnderstandFixturePins.sys.mjs";

export const UNDERSTAND_METADATA_ID = "/usr/bin/id";
export const UNDERSTAND_METADATA_STAT = "/usr/bin/stat";
export const UNDERSTAND_METADATA_HASH = "/usr/bin/openssl";
export const UNDERSTAND_METADATA_FORMAT = "%u %l %Op %z %d %i";
export const UNDERSTAND_FIXTURE_LIMITS = Object.freeze({ metadataMs: 1000,
  metadataBytes: 4096, cleanupMs: 500, admissionMs: 3000, hostStartupMs: 1000, hostKillGraceMs: 750, hostCleanupMs: 1000 });
const BUILD = "/Volumes/AxioSozoBuild/workstation";
const BASE = `${BUILD}/gui-fixtures`;
const PROFILE_BASE = `${BUILD}/runtime/e626697ad91fe95c`;
const ROOT_RE = /^\/Volumes\/AxioSozoBuild\/workstation\/gui-fixtures\/understand-([0-9a-f]{32})$/u;
const encoder = new TextEncoder();
// Pinned Gecko SubprocessConstants.ERROR_END_OF_FILE.
const NATIVE_END_OF_FILE = 0xff7a0001;
class UnderstandFixtureUnavailable extends Error {
  constructor() { super("UNDERSTAND_FIXTURE_UNAVAILABLE"); this.code = "UNDERSTAND_FIXTURE_UNAVAILABLE"; }
}
// Private classification: owner revocation does not retire the fixture lifetime.
class UnderstandOperationInactive extends UnderstandFixtureUnavailable {}
const unavailable = () => new UnderstandFixtureUnavailable();
const components = path => path.split("/").slice(1).map((_, i, parts) => "/" + parts.slice(0, i + 1).join("/"));
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
function requireAuthority(isActive) {
  try { if (typeof isActive === "function" && isActive() === true) return; }
  catch (error) { if (error instanceof UnderstandFixtureUnavailable) throw error; }
  throw new UnderstandOperationInactive();
}
function pinsValid() {
  if (UNDERSTAND_FIXTURE_PYTHON !== "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11"
      || UNDERSTAND_FIXTURE_NODE !== "/Volumes/AxioSozoBuild/toolchains/zen/node/bin/node"
      || !Array.isArray(UNDERSTAND_FIXTURE_INPUTS) || UNDERSTAND_FIXTURE_INPUTS.length < 2
      || UNDERSTAND_FIXTURE_INPUTS.length > 48 || !Array.isArray(UNDERSTAND_FIXTURE_BINARIES)
      || UNDERSTAND_FIXTURE_BINARIES.length !== 2) throw unavailable();
  const seen = new Set();
  for (const item of UNDERSTAND_FIXTURE_INPUTS) {
    if (!plain(item) || Object.keys(item).sort().join(",") !== "maxBytes,relative,sha256"
        || typeof item.relative !== "string" || !/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/u.test(item.relative)
        || item.relative.split("/").some(x => x === "." || x === "..") || seen.has(item.relative)
        || !/^[0-9a-f]{64}$/u.test(item.sha256) || !Number.isSafeInteger(item.maxBytes)
        || item.maxBytes < 1 || item.maxBytes > 2 * 1024 * 1024) throw unavailable();
    seen.add(item.relative);
  }
  if (!seen.has(UNDERSTAND_FIXTURE_HELPER) || !seen.has("policy.json")
      || !seen.has("packages/provider-host/cli.mjs")) throw unavailable();
  seen.clear();
  for (const item of UNDERSTAND_FIXTURE_BINARIES) {
    if (!plain(item) || Object.keys(item).sort().join(",") !== "maxBytes,path,sha256"
        || ![UNDERSTAND_FIXTURE_PYTHON, UNDERSTAND_FIXTURE_NODE].includes(item.path)
        || seen.has(item.path) || !/^[0-9a-f]{64}$/u.test(item.sha256)
        || !Number.isSafeInteger(item.maxBytes) || item.maxBytes < 1 || item.maxBytes > 256 * 1024 * 1024)
      throw unavailable();
    seen.add(item.path);
  }
}

export function understandFixturePaths(root, profile) {
  const match = typeof root === "string" && ROOT_RE.exec(root);
  if (!match || profile !== `${PROFILE_BASE}/plan4-understand-${match[1]}/gecko`) throw unavailable();
  pinsValid();
  return Object.freeze({ root, profile, interpreter: UNDERSTAND_FIXTURE_PYTHON,
    node: UNDERSTAND_FIXTURE_NODE, helper: `${root}/${UNDERSTAND_FIXTURE_HELPER}`,
    virtualHost: `${root}/packages/provider-host/cli.mjs`,
    projectRoots: Object.freeze([`${root}/projects/harbor`, `${root}/projects/inkline`]) });
}

// Fixed source, with static trusted pins only. No caller-supplied code, filenames,
// digest or process flags enter this verifier. Descriptor traversal rejects every
// symlink. Each input is streamed and fstat-rechecked before its digest escapes.
export const UNDERSTAND_FIXTURE_HASH_CODE = `import hashlib,os,re,stat,sys\nPINS=${JSON.stringify(UNDERSTAND_FIXTURE_INPUTS)}\nBINS=${JSON.stringify(UNDERSTAND_FIXTURE_BINARIES)}\nif len(sys.argv)!=3:raise SystemExit(1)\nr,p=sys.argv[1:]\nm=re.fullmatch(r"/Volumes/AxioSozoBuild/workstation/gui-fixtures/understand-([0-9a-f]{32})",r)\nif not m or p!="/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c/plan4-understand-"+m[1]+"/gecko":raise SystemExit(1)\nu=os.getuid()\ndef parent(path):\n f=os.open("/",os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)\n try:\n  q=""\n  for c in path.split("/")[1:-1]:\n   q+="/"+c\n   n=os.open(c,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=f);os.close(f);f=n\n   s=os.fstat(f)\n   if s.st_uid not in (0,u) or stat.S_IMODE(s.st_mode)&0o022 and not s.st_mode&0o1000:raise SystemExit(1)\n   if (q==r or q.startswith(r+"/")) and (s.st_uid!=u or stat.S_IMODE(s.st_mode)!=0o700):raise SystemExit(1)\n  return f\n except:os.close(f);raise\ndef digest(path,limit,fixture):\n f=parent(path)\n try:\n  n=os.open(path.rsplit("/",1)[1],os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK,dir_fd=f)\n  try:\n   a=os.fstat(n)\n   if not stat.S_ISREG(a.st_mode) or a.st_nlink!=1 or not 0<a.st_size<=limit:raise SystemExit(1)\n   if fixture:\n    if a.st_uid!=u or stat.S_IMODE(a.st_mode)!=0o400:raise SystemExit(1)\n   elif a.st_uid not in (0,u) or stat.S_IMODE(a.st_mode)&0o022 or not stat.S_IMODE(a.st_mode)&0o111:raise SystemExit(1)\n   h=hashlib.sha256();size=0\n   while True:\n    b=os.read(n,65536)\n    if not b:break\n    size+=len(b)\n    if size>limit:raise SystemExit(1)\n    h.update(b)\n   z=os.fstat(n)\n   if size!=a.st_size or (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)!=(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns):raise SystemExit(1)\n   return h.hexdigest()\n  finally:os.close(n)\n finally:os.close(f)\nfor x in BINS:print(digest(x["path"],x["maxBytes"],False))\nfor x in PINS:print(digest(r+"/"+x["relative"],x["maxBytes"],True))\n`;

function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  return { env: name => Services.env.get(name),
    profilePath: () => Services.dirsvc.get("ProfD", Ci.nsIFile).path,
    timers: ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs"),
    clock: () => Date.now(), uuid: () => Services.uuid.generateUUID().toString().replace(/[{}]/gu, ""),
    spawn({ isActive = () => true, ...options }) {
      requireAuthority(isActive);
      return Subprocess.call(options); // Private callback is never a Gecko process option.
    },
    metadataCommandAvailable(path) {
      if (![UNDERSTAND_METADATA_ID, UNDERSTAND_METADATA_STAT, UNDERSTAND_METADATA_HASH].includes(path)) return false;
      for (const part of components(path)) {
        const file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        file.initWithPath(part);
        if (!file.exists() || file.isSymlink()) return false;
        file.normalize();
        if (file.path !== part || (file.permissions & 0o022) !== 0) return false;
        if (part === path ? !file.isFile() || !file.isExecutable() : !file.isDirectory()) return false;
      }
      return true;
    } };
}

export function parseUnderstandFixtureStat(text, count) {
  if (typeof text !== "string" || encoder.encode(text).length > UNDERSTAND_FIXTURE_LIMITS.metadataBytes
      || !Number.isInteger(count) || count < 1 || count > 24 || !text.endsWith("\n")) throw unavailable();
  const lines = text.slice(0, -1).split("\n");
  if (lines.length !== count) throw unavailable();
  return lines.map(line => {
    const match = /^(0|[1-9][0-9]{0,9}) (0|[1-9][0-9]{0,9}) ([0-7]{5,7}) (0|[1-9][0-9]{0,15}) ([0-9]{1,20}) ([0-9]{1,20})$/u.exec(line);
    if (!match) throw unavailable();
    const [uid, links, mode, size] = [Number(match[1]), Number(match[2]), Number.parseInt(match[3], 8), Number(match[4])];
    if (![uid, links, mode, size].every(Number.isSafeInteger) || uid > 4294967295 || mode > 0o177777 || links < 1) throw unavailable();
    return Object.freeze({ uid, links, mode, size, device: match[5], inode: match[6] });
  });
}

/** One strictly allowlisted metadata child, capped and owned through late starts. */
export async function runUnderstandFixtureMetadata(runtime, command, args, { signal, paths, admittedPaths, isActive = () => true } = {}) {
  requireAuthority(isActive);
  const isId = command === UNDERSTAND_METADATA_ID && Array.isArray(args) && args.length === 1 && args[0] === "-u";
  const isStat = command === UNDERSTAND_METADATA_STAT && Array.isArray(args)
    && args.length >= 3 && args.length <= 26 && args[0] === "-f" && args[1] === UNDERSTAND_METADATA_FORMAT
    && admittedPaths instanceof Set && args.slice(2).every(path => admittedPaths.has(path));
  const isHash = command === UNDERSTAND_FIXTURE_PYTHON && Array.isArray(args) && args.length === 7
    && args.slice(0, 4).join(" ") === "-I -S -B -c" && args[4] === UNDERSTAND_FIXTURE_HASH_CODE
    && paths && args[5] === paths.root && args[6] === paths.profile
    && understandFixturePaths(paths.root, paths.profile).helper === paths.helper;
  const isBinaryHash = command === UNDERSTAND_METADATA_HASH && Array.isArray(args)
    && args.length === 5 && args.slice(0, 3).join(" ") === "dgst -sha256 -r"
    && args[3] === UNDERSTAND_FIXTURE_BINARIES[0].path && args[4] === UNDERSTAND_FIXTURE_BINARIES[1].path;
  if ((!isId && !isStat && !isHash && !isBinaryHash) || signal?.aborted) throw unavailable();
  let child = null, stopped = false, finished = false, timer, rejectStop, cleanupTask;
  const stopPromise = new Promise((_, reject) => { rejectStop = reject; });
  const stop = () => { if (!stopped && !finished) { stopped = true; rejectStop(unavailable()); } };
  function cleanup(owned) {
    if (cleanupTask) return cleanupTask;
    cleanupTask = (async () => {
      let deadline;
      try {
        const tasks = [() => owned.stdin?.close?.(true), () => owned.stdout?.close?.(true),
          () => owned.stderr?.close?.(true), () => owned.kill?.(250), () => owned.wait?.()]
          .map(action => Promise.resolve().then(action).catch(() => {}));
        await Promise.race([Promise.all(tasks), new Promise(resolve => {
          deadline = runtime.timers.setTimeout(resolve, UNDERSTAND_FIXTURE_LIMITS.cleanupMs);
        })]);
      } finally { runtime.timers.clearTimeout(deadline); }
    })();
    return cleanupTask;
  }
  async function collect(pipe, size, keep) {
    let output = "";
    if (typeof pipe?.read !== "function") throw unavailable();
    const decoder = keep ? new TextDecoder("utf-8", { fatal: true }) : null;
    for (;;) {
      const chunk = await pipe.read();
      if (!(chunk instanceof ArrayBuffer) && !ArrayBuffer.isView(chunk)) throw unavailable();
      const raw = chunk instanceof ArrayBuffer ? new Uint8Array(chunk)
        : new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      if (raw.byteLength === 0) { if (keep) output += decoder.decode(); return output; }
      size.bytes += raw.byteLength;
      if (size.bytes > UNDERSTAND_FIXTURE_LIMITS.metadataBytes) throw unavailable();
      if (keep) output += decoder.decode(raw, { stream: true });
    }
  }
  try {
    timer = runtime.timers.setTimeout(stop, UNDERSTAND_FIXTURE_LIMITS.metadataMs);
    signal?.addEventListener("abort", stop, { once: true });
    if (signal?.aborted) stop();
    const execute = (async () => {
      if (stopped || signal?.aborted) throw unavailable();
      requireAuthority(isActive);
      child = await runtime.spawn({ command, arguments: [...args], environmentAppend: false, isActive,
        environment: { LANG: "C", LC_ALL: "C", ...(isBinaryHash ? { OPENSSL_CONF: "/dev/null" } : {}) }, workdir: "/", stderr: "pipe" });
      if (stopped || finished || signal?.aborted) { await cleanup(child); throw unavailable(); }
      requireAuthority(isActive);
      const size = { bytes: 0 };
      // Gecko removes stdin on exit; a later close alone can report EOF.
      // Output EOF, actual exit status and live authority remain mandatory.
      const closeInput = Promise.resolve().then(() => child.stdin.close()).catch(error => {
        if (error?.errorCode !== NATIVE_END_OF_FILE) throw error;
      });
      const [output, , result] = await Promise.all([collect(child.stdout, size, true),
        collect(child.stderr, size, false), child.wait(), closeInput]);
      if (stopped || signal?.aborted || result?.exitCode !== 0) throw unavailable();
      requireAuthority(isActive);
      return output;
    })();
    return await Promise.race([execute, stopPromise]);
  } catch (error) { throw error instanceof UnderstandOperationInactive ? error : unavailable(); }
  finally {
    finished = true; runtime.timers.clearTimeout(timer); signal?.removeEventListener("abort", stop);
    if (child) await cleanup(child);
  }
}

/** The returned object is a privileged test dependency, never an actor payload. */
export async function createNativeUnderstandFixtureRuntime({ runtime, signal, isActive = () => true } = {}) {
  let requested;
  try { requested = runtime ? runtime.env("AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT")
    : Services.env.get("AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT"); }
  catch { throw unavailable(); }
  if (requested === undefined || requested === null || requested === "") return null;
  try {
    if (typeof requested !== "string" || !ROOT_RE.test(requested)) throw unavailable();
    requireAuthority(isActive);
    runtime ??= nativeRuntime();
    if (typeof runtime.env !== "function" || typeof runtime.profilePath !== "function"
        || typeof runtime.spawn !== "function" || typeof runtime.uuid !== "function"
        || typeof runtime.timers?.setTimeout !== "function" || typeof runtime.timers?.clearTimeout !== "function"
        || runtime.metadataCommandAvailable?.(UNDERSTAND_METADATA_ID) !== true
        || runtime.metadataCommandAvailable?.(UNDERSTAND_METADATA_STAT) !== true
        || runtime.metadataCommandAvailable?.(UNDERSTAND_METADATA_HASH) !== true) throw unavailable();
    const paths = understandFixturePaths(requested, runtime.profilePath());
    const now = () => {
      const value = typeof runtime.clock === "function" ? runtime.clock() : Date.now();
      if (!Number.isFinite(value) || value < 0) throw unavailable();
      return value;
    };
    let admissionRunning = false, stoppedPermanently = false;
    const guard = () => {
      try {
        if (stoppedPermanently || signal?.aborted || runtime.env("AXIOSOZO_SYNTHETIC_TEST") !== "1"
            || runtime.env("AXIOSOZO_UNDERSTAND_GUI_FIXTURE") !== "1"
            || runtime.env("AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT") !== paths.root
            || runtime.profilePath() !== paths.profile) throw unavailable();
      } catch { stoppedPermanently = true; throw unavailable(); }
    };
    guard();
    const directories = new Set([BASE, paths.root, paths.profile, `${paths.root}/home`, ...paths.projectRoots]);
    const files = new Map(UNDERSTAND_FIXTURE_INPUTS.map(item => [`${paths.root}/${item.relative}`, item]));
    for (const file of files.keys()) for (const part of components(file).slice(0, -1)) {
      if (part.startsWith(`${paths.root}/`)) directories.add(part);
    }
    const commands = [UNDERSTAND_METADATA_ID, UNDERSTAND_METADATA_STAT, UNDERSTAND_METADATA_HASH];
    const leaves = new Set([...directories, ...files.keys(), ...UNDERSTAND_FIXTURE_BINARIES.map(item => item.path), ...commands]);
    const admittedPaths = new Set([...leaves].flatMap(components));
    async function admission(operationActive) {
      requireAuthority(operationActive);
      guard();
      if (stoppedPermanently || admissionRunning) throw unavailable();
      admissionRunning = true;
      const controller = new AbortController(), deadline = now() + UNDERSTAND_FIXTURE_LIMITS.admissionMs;
      let timer, stopped = false, rejectStop;
      const stopPromise = new Promise((_, reject) => { rejectStop = reject; });
      const stop = () => { if (!stopped) { stopped = true; controller.abort(); rejectStop(unavailable()); } };
      const check = () => { if (stopped || now() >= deadline) throw unavailable(); guard(); requireAuthority(operationActive); };
      const options = { signal: controller.signal, paths, admittedPaths, isActive: () => {
        check(); return true;
      } };
      try {
        timer = runtime.timers.setTimeout(stop, UNDERSTAND_FIXTURE_LIMITS.admissionMs);
        signal?.addEventListener("abort", stop, { once: true });
        if (signal?.aborted) stop();
        const verify = (async () => {
          check();
          const uidOutput = await runUnderstandFixtureMetadata(runtime, UNDERSTAND_METADATA_ID, ["-u"], options);
          check();
          if (!/^(0|[1-9][0-9]{0,9})\n$/u.test(uidOutput) || Number(uidOutput.trim()) > 4294967295) throw unavailable();
          const uid = Number(uidOutput.trim());
          check();
          const all = [...admittedPaths];
          const records = new Map();
          for (let offset = 0; offset < all.length; offset += 24) {
            check();
            const batch = all.slice(offset, offset + 24);
            const metadata = await runUnderstandFixtureMetadata(runtime, UNDERSTAND_METADATA_STAT,
              ["-f", UNDERSTAND_METADATA_FORMAT, ...batch], options);
            check();
            const infos = parseUnderstandFixtureStat(metadata, batch.length);
            batch.forEach((path, index) => records.set(path, infos[index]));
          }
          check();
          for (const [path, info] of records) {
            const kind = info.mode & 0o170000, mode = info.mode & 0o7777;
            if (files.has(path)) {
              if (kind !== 0o100000 || info.uid !== uid || info.links !== 1 || mode !== 0o400
                  || info.size < 1 || info.size > files.get(path).maxBytes) throw unavailable();
            } else if ([paths.interpreter, paths.node].includes(path)) {
              const pin = UNDERSTAND_FIXTURE_BINARIES.find(x => x.path === path);
              if (kind !== 0o100000 || ![0, uid].includes(info.uid) || info.links !== 1
                  || (mode & 0o022) !== 0 || (mode & 0o111) === 0 || info.size < 1 || info.size > pin.maxBytes)
                throw unavailable();
            } else if (commands.includes(path)) {
              if (kind !== 0o100000 || ![0, uid].includes(info.uid) || (mode & 0o022) !== 0
                  || (mode & 0o111) === 0 || info.size < 1) throw unavailable();
            } else if (kind !== 0o040000 || ![0, uid].includes(info.uid)
                || (mode & 0o022) !== 0 && (mode & 0o1000) === 0
                || directories.has(path) && (info.uid !== uid || mode !== 0o700)) throw unavailable();
          }
          const bootstrap = await runUnderstandFixtureMetadata(runtime, UNDERSTAND_METADATA_HASH,
            ["dgst", "-sha256", "-r", ...UNDERSTAND_FIXTURE_BINARIES.map(x => x.path)], options);
          check();
          const binaryLines = bootstrap.endsWith("\n") ? bootstrap.slice(0, -1).split("\n") : [];
          if (binaryLines.length !== UNDERSTAND_FIXTURE_BINARIES.length
              || binaryLines.some((line, index) => ![
                `${UNDERSTAND_FIXTURE_BINARIES[index].sha256} *${UNDERSTAND_FIXTURE_BINARIES[index].path}`,
                `${UNDERSTAND_FIXTURE_BINARIES[index].sha256}  ${UNDERSTAND_FIXTURE_BINARIES[index].path}`,
              ].includes(line))) throw unavailable();
          // Authenticate executable pathname identity before executing Python;
          // the OS hash seam must not permit a detected symlink or replacement
          // between the original metadata snapshot and interpreter dispatch.
          const executableParts = [...new Set([paths.interpreter, paths.node].flatMap(components))];
          for (let offset = 0; offset < executableParts.length; offset += 24) {
            check();
            const batch = executableParts.slice(offset, offset + 24);
            const metadata = await runUnderstandFixtureMetadata(runtime, UNDERSTAND_METADATA_STAT,
              ["-f", UNDERSTAND_METADATA_FORMAT, ...batch], options);
            check();
            const infos = parseUnderstandFixtureStat(metadata, batch.length);
            for (let index = 0; index < batch.length; index++) {
              const identity = value => [value.uid, value.mode, value.device, value.inode,
                ...([paths.interpreter, paths.node].includes(batch[index]) ? [value.links, value.size] : [])];
              if (JSON.stringify(identity(infos[index])) !== JSON.stringify(identity(records.get(batch[index])))) throw unavailable();
            }
          }
          check();
          const output = await runUnderstandFixtureMetadata(runtime, paths.interpreter,
            ["-I", "-S", "-B", "-c", UNDERSTAND_FIXTURE_HASH_CODE, paths.root, paths.profile], options);
          check();
          const hashes = [...UNDERSTAND_FIXTURE_BINARIES, ...UNDERSTAND_FIXTURE_INPUTS].map(x => x.sha256);
          if (output !== hashes.join("\n") + "\n") throw unavailable();
          // Repeat all metadata after hashing; freeze bytes only after its descriptor
          // checks, then refuse pathname replacement or mode changes before dispatch.
          for (let offset = 0; offset < all.length; offset += 24) {
            check();
            const batch = all.slice(offset, offset + 24);
            const metadata = await runUnderstandFixtureMetadata(runtime, UNDERSTAND_METADATA_STAT,
              ["-f", UNDERSTAND_METADATA_FORMAT, ...batch], options);
            check();
            const infos = parseUnderstandFixtureStat(metadata, batch.length);
            for (let index = 0; index < batch.length; index++) {
              const before = records.get(batch[index]), after = infos[index];
              const identity = value => [value.uid, value.mode, value.device, value.inode,
                ...(files.has(batch[index]) || [paths.interpreter, paths.node, ...commands].includes(batch[index])
                  ? [value.links, value.size] : [])];
              if (JSON.stringify(identity(after)) !== JSON.stringify(identity(before))) throw unavailable();
            }
          }
          check();
        })();
        await Promise.race([verify, stopPromise]);
        check();
      } catch (error) {
        if (!(error instanceof UnderstandOperationInactive)) stoppedPermanently = true;
        throw error instanceof UnderstandOperationInactive ? error : unavailable();
      }
      finally {
        stopped = true; controller.abort(); runtime.timers.clearTimeout(timer);
        signal?.removeEventListener("abort", stop); admissionRunning = false;
      }
    }
    await admission(isActive);
    requireAuthority(isActive);
    const adapted = {
      timers: runtime.timers, uuid: () => runtime.uuid(),
      env: name => name === "AXIOSOZO_PROVIDER_NODE" ? paths.node
        : name === "AXIOSOZO_PROVIDER_HOST" ? paths.virtualHost : "",
      async spawn(options) {
        const operationActive = options?.isActive === undefined ? (() => true) : options.isActive;
        requireAuthority(operationActive);
        guard();
        if (!plain(options) || Object.keys(options).filter(key => key !== "isActive").sort().join(",") !== "arguments,command,environment,environmentAppend,stderr"
            || options.command !== paths.node || !Array.isArray(options.arguments) || options.arguments.length !== 2
            || options.arguments[0] !== paths.virtualHost || options.arguments[1] !== "serve"
            || options.environmentAppend !== false || options.stderr !== "pipe" || !plain(options.environment)
            || Object.keys(options.environment).sort().join(",") !== "LANG,PATH"
            || options.environment.LANG !== "C" || options.environment.PATH !== "/usr/bin:/bin") throw unavailable();
        await admission(operationActive);
        guard();
        requireAuthority(operationActive);
        if (stoppedPermanently) throw unavailable();
        let child = null, deadlineTimer, finished = false, abandoned = false, rejectStop, cleanupTask;
        const stopPromise = new Promise((_, reject) => { rejectStop = reject; });
        const stop = () => {
          if (!finished && !abandoned) { abandoned = true; stoppedPermanently = true; rejectStop(unavailable()); }
        };
        function cleanup(owned) {
          if (cleanupTask) return cleanupTask;
          cleanupTask = (async () => {
            let timer;
            try {
              const tasks = [() => owned.stdin?.close?.(true), () => owned.stdout?.close?.(true),
                () => owned.stderr?.close?.(true), () => owned.kill?.(UNDERSTAND_FIXTURE_LIMITS.hostKillGraceMs), () => owned.wait?.()]
                .map(action => Promise.resolve().then(action).catch(() => {}));
              await Promise.race([Promise.all(tasks), new Promise(resolve => {
                timer = runtime.timers.setTimeout(resolve, UNDERSTAND_FIXTURE_LIMITS.hostCleanupMs);
              })]);
            } finally { runtime.timers.clearTimeout(timer); }
          })();
          return cleanupTask;
        }
        try {
          deadlineTimer = runtime.timers.setTimeout(stop, UNDERSTAND_FIXTURE_LIMITS.hostStartupMs);
          signal?.addEventListener("abort", stop, { once: true });
          const start = (async () => {
            guard();
            requireAuthority(operationActive);
            child = await runtime.spawn({ command: paths.interpreter, isActive: operationActive,
              arguments: ["-I", "-S", "-B", paths.helper, "host", paths.root, paths.profile],
              environmentAppend: false, environment: { LANG: "C", LC_ALL: "C",
                AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_UNDERSTAND_GUI_FIXTURE: "1",
                AXIOSOZO_UNDERSTAND_GUI_FIXTURE_ROOT: paths.root }, workdir: "/", stderr: "pipe" });
            try {
              guard();
              requireAuthority(operationActive);
              if (abandoned || finished || typeof child?.stdin?.write !== "function"
                  || typeof child.stdin.close !== "function" || typeof child.stdout?.read !== "function"
                  || typeof child.stderr?.read !== "function" || typeof child.wait !== "function"
                  || typeof child.kill !== "function") throw unavailable();
            }
            catch (error) { await cleanup(child); throw error instanceof UnderstandOperationInactive ? error : unavailable(); }
            return child;
          })();
          const owned = await Promise.race([start, stopPromise]);
          guard();
          requireAuthority(operationActive);
          const wait = Promise.resolve().then(() => owned.wait());
          const onLifetimeAbort = () => { stoppedPermanently = true; void cleanup(owned); };
          signal?.addEventListener("abort", onLifetimeAbort, { once: true });
          wait.then(() => signal?.removeEventListener("abort", onLifetimeAbort),
            () => signal?.removeEventListener("abort", onLifetimeAbort));
          return Object.freeze({ pid: owned.pid, stdout: owned.stdout, stderr: owned.stderr,
            wait: () => wait,
            // Never hard-kill the supervisor before its 500 ms finally can reap
            // the separate owned Node host group. Transport kill(0) is remapped.
            kill: () => owned.kill(UNDERSTAND_FIXTURE_LIMITS.hostKillGraceMs),
            stdin: Object.freeze({ close: force => owned.stdin.close(force), write(value) {
              try { guard(); } catch { stoppedPermanently = true; void cleanup(owned); throw unavailable(); }
              return owned.stdin.write(value);
            } }) });
        } catch (error) {
          if (!(error instanceof UnderstandOperationInactive)) stoppedPermanently = true;
          if (child) await cleanup(child);
          throw error instanceof UnderstandOperationInactive ? error : unavailable();
        }
        finally {
          finished = true; runtime.timers.clearTimeout(deadlineTimer); signal?.removeEventListener("abort", stop);
        }
      },
    };
    Object.defineProperties(adapted, { fixturePaths: { value: paths }, guard: { value: guard } });
    return Object.freeze(adapted);
  } catch { throw unavailable(); }
}
