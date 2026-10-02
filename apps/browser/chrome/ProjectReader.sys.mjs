/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Product-owned static reader only. Trust configuration is supplied by the
// privileged service, never a page, environment variable, or discovered PATH.
const encoder = new TextEncoder();
const MAX_READ_BYTES = 262145;
const MAX_OUTPUT_BYTES = 512 * 1024;
const MAX_STDERR_BYTES = 16 * 1024;
const CLEANUP_MS = 500;
const UNAVAILABLE = "READ_CONTAINMENT_UNAVAILABLE";
const ERRORS = new Set(["INVALID_PARAMS", "NOT_ALLOWLISTED", UNAVAILABLE,
  "READ_CONTAINMENT_REFUSED", "IDENTITY_CHANGED", "NOT_REGULAR_FILE", "TOO_LARGE", "NOT_FOUND"]);
const TYPES = new Set(["regular", "directory", "other"]);
const failure = code => Object.assign(new Error(code), { code });
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const keysAre = (value, keys) => plain(value) && Reflect.ownKeys(value).length === keys.length
  && keys.every(key => Object.hasOwn(value, key) && Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), "value"));
const textPath = value => typeof value === "string" && encoder.encode(value).length <= 4096
  && !/[\u0000-\u001f\u007f-\u009f]/u.test(value) && !value.split("/").some(part => part === "." || part === "..");
const absolute = value => textPath(value) && value.startsWith("/") && value !== "/"
  && !value.endsWith("/") && !value.includes("//");
const relative = (value, empty = false) => textPath(value) && (empty || value.length > 0)
  && !value.startsWith("/") && !value.endsWith("/") && !value.includes("//") && !value.includes("\\");
const identity = value => keysAre(value, ["device", "inode"])
  && typeof value.device === "string" && /^(?:0|[1-9][0-9]{0,19})$/u.test(value.device)
  && typeof value.inode === "string" && /^[1-9][0-9]{0,19}$/u.test(value.inode);
const sameIdentity = (left, right) => left.device === right.device && left.inode === right.inode;
const copyIdentity = value => Object.freeze({ device: value.device, inode: value.inode });
const metadataValue = value => keysAre(value, ["type", "size", "identity"]) && TYPES.has(value.type)
  && Number.isSafeInteger(value.size) && value.size >= 0 && identity(value.identity);
const copyMetadata = value => Object.freeze({ type: value.type, size: value.size, identity: copyIdentity(value.identity) });
const childName = value => typeof value === "string" && value.length > 0 && encoder.encode(value).length <= 255
  && value !== "." && value !== ".." && !value.startsWith("._") && !/[/\\\u0000-\u001f\u007f-\u009f]/u.test(value);
const invoke = fn => Promise.resolve().then(fn);

// Portable base64 decoding: no window, atob, Buffer, or provider dependency.
function decodeBase64(data, maxBytes) {
  if (typeof data !== "string" || data.length > Math.ceil(maxBytes / 3) * 4
      || data.length % 4 !== 0
      || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(data)) throw failure(UNAVAILABLE);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
  const size = data.length / 4 * 3 - padding;
  if (size > maxBytes) throw failure(UNAVAILABLE);
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (let index = 0; index < data.length; index += 4) {
    const a = alphabet.indexOf(data[index]), b = alphabet.indexOf(data[index + 1]);
    const c = data[index + 2] === "=" ? 0 : alphabet.indexOf(data[index + 2]);
    const d = data[index + 3] === "=" ? 0 : alphabet.indexOf(data[index + 3]);
    if (index === data.length - 4 && ((padding === 2 && (b & 15) !== 0) || (padding === 1 && (c & 3) !== 0))) throw failure(UNAVAILABLE);
    bytes[offset++] = (a << 2) | (b >> 4);
    if (offset < size) bytes[offset++] = ((b & 15) << 4) | (c >> 2);
    if (offset < size) bytes[offset++] = ((c & 3) << 6) | d;
  }
  return bytes;
}

export function createProjectReader({
  configuredTrusted = false, interpreter, helperPath, Subprocess, timers,
  timeoutMs = 3000, outputBytes = 400 * 1024,
} = {}) {
  const available = configuredTrusted === true && absolute(interpreter) && absolute(helperPath)
    && typeof Subprocess?.call === "function" && typeof timers?.setTimeout === "function"
    && typeof timers?.clearTimeout === "function" && Number.isSafeInteger(timeoutMs)
    && timeoutMs >= 1 && timeoutMs <= 3000 && Number.isSafeInteger(outputBytes)
    && outputBytes >= 1 && outputBytes <= MAX_OUTPUT_BYTES;
  const requireAvailable = () => { if (!available) throw failure(UNAVAILABLE); };
  const request = (value, keys, allowEmpty = false) => {
    if (!keysAre(value, keys) || !absolute(value.root) || !relative(value.relative, allowEmpty)
        || !identity(value.expectedRoot)) throw failure("INVALID_PARAMS");
    return { root: value.root, relative: value.relative, expectedRoot: { ...value.expectedRoot } };
  };
  async function call(operation, payload, cap = outputBytes) {
    requireAvailable();
    const argument = JSON.stringify(payload);
    if (encoder.encode(argument).length > 16384) throw failure("INVALID_PARAMS");
    let process = null, stopped = false, exited = false, waitPromise = null, timer;
    const assertLive = () => { if (stopped) throw failure(UNAVAILABLE); };
    const waitForExit = () => waitPromise ??= invoke(() => process.wait());
    const cleanup = async candidate => {
      if (!candidate) return;
      let cleanupTimer;
      const jobs = [candidate.stdin, candidate.stdout, candidate.stderr]
        .filter(pipe => typeof pipe?.close === "function")
        .map(pipe => invoke(() => pipe.close(true)));
      if (!exited && typeof candidate.kill === "function") jobs.push(invoke(() => candidate.kill(0)));
      if (typeof candidate.wait === "function") jobs.push(candidate === process ? waitForExit() : invoke(() => candidate.wait()));
      const deadline = new Promise(resolve => { cleanupTimer = timers.setTimeout(resolve, CLEANUP_MS); });
      try { await Promise.race([Promise.allSettled(jobs), deadline]); }
      finally { timers.clearTimeout(cleanupTimer); }
    };
    const deadline = new Promise((_, reject) => {
      timer = timers.setTimeout(() => { stopped = true; reject(failure(UNAVAILABLE)); }, timeoutMs);
    });
    const drain = async (pipe, limit, keep) => {
      let output = "", size = 0;
      for (;;) {
        const chunk = await pipe.readString();
        assertLive();
        if (chunk === null || chunk === "") break;
        if (typeof chunk !== "string") throw failure(UNAVAILABLE);
        size += encoder.encode(chunk).length;
        if (size > limit) throw failure(UNAVAILABLE);
        if (keep) output += chunk;
      }
      return output;
    };
    const execute = async () => {
      const candidate = await Subprocess.call({
        command: interpreter, arguments: ["-I", "-S", "-B", helperPath, operation, argument],
        environment: { LANG: "C", LC_ALL: "C", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" },
        environmentAppend: false, stderr: "pipe", workdir: "/",
      });
      if (stopped) { void cleanup(candidate).catch(() => {}); throw failure(UNAVAILABLE); }
      process = candidate;
      if (typeof process?.stdin?.close !== "function" || typeof process?.stdout?.readString !== "function"
          || typeof process?.stderr?.readString !== "function" || typeof process?.kill !== "function"
          || typeof process?.wait !== "function") throw failure(UNAVAILABLE);
      await process.stdin.close();
      assertLive();
      const [output] = await Promise.all([drain(process.stdout, cap, true), drain(process.stderr, MAX_STDERR_BYTES, false)]);
      assertLive();
      const status = await waitForExit();
      assertLive();
      exited = true;
      if (status?.exitCode !== 0) throw failure(UNAVAILABLE);
      let answer;
      try { answer = JSON.parse(output); } catch { throw failure(UNAVAILABLE); }
      if (keysAre(answer, ["ok", "error"]) && answer.ok === false) throw failure(ERRORS.has(answer.error) ? answer.error : UNAVAILABLE);
      if (!keysAre(answer, ["ok", "result"]) || answer.ok !== true) throw failure(UNAVAILABLE);
      return answer.result;
    };
    try { return await Promise.race([execute(), deadline]); }
    catch (cause) { throw failure(ERRORS.has(cause?.code) ? cause.code : UNAVAILABLE); }
    finally { stopped = true; timers.clearTimeout(timer); await cleanup(process); }
  }
  const readMetadata = async (operation, payload, rootOnly = false) => {
    let value;
    try { value = await call(operation, payload, Math.min(outputBytes, 4096)); }
    catch (cause) { if (cause.code === "NOT_FOUND") return null; throw cause; }
    if (!metadataValue(value) || (rootOnly && value.type !== "directory")) throw failure(UNAVAILABLE);
    return copyMetadata(value);
  };
  return Object.freeze({
    exactAvailable: available,
    async rootMetadata(root) {
      requireAvailable();
      if (!absolute(root)) throw failure("INVALID_PARAMS");
      return readMetadata("metadata", { root }, true);
    },
    async fileMetadata(value) {
      requireAvailable();
      return readMetadata("metadata", request(value, ["root", "relative", "expectedRoot"]));
    },
    async presenceMetadata(value) {
      requireAvailable();
      return readMetadata("presence", request(value, ["root", "relative", "expectedRoot"], true));
    },
    async readContained(value) {
      requireAvailable();
      const payload = request(value, ["root", "relative", "expectedRoot", "expectedFile", "maxBytes"]);
      if (!identity(value.expectedFile) || !Number.isSafeInteger(value.maxBytes)
          || value.maxBytes < 1 || value.maxBytes > MAX_READ_BYTES) throw failure("INVALID_PARAMS");
      Object.assign(payload, { expectedFile: { ...value.expectedFile }, maxBytes: value.maxBytes });
      const answer = await call("read", payload, Math.min(outputBytes, Math.ceil(value.maxBytes / 3) * 4 + 1024));
      if (!keysAre(answer, ["encoding", "data", "identity"]) || answer.encoding !== "base64"
          || !identity(answer.identity) || !sameIdentity(answer.identity, payload.expectedFile)) throw failure(UNAVAILABLE);
      return decodeBase64(answer.data, payload.maxBytes);
    },
    async listContained(value) {
      requireAvailable();
      const payload = request(value, ["root", "relative", "expectedRoot", "expectedDirectory", "limit"], true);
      if (!identity(value.expectedDirectory) || !Number.isSafeInteger(value.limit)
          || value.limit < 1 || value.limit > 512) throw failure("INVALID_PARAMS");
      Object.assign(payload, { expectedDirectory: { ...value.expectedDirectory }, limit: value.limit });
      const answer = await call("list", payload);
      if (!keysAre(answer, ["entries", "identity"]) || !identity(answer.identity)
          || !sameIdentity(answer.identity, payload.expectedDirectory) || !Array.isArray(answer.entries)
          || answer.entries.length > payload.limit || answer.entries.some(entry => !keysAre(entry, ["name", "type"])
            || !childName(entry.name) || !TYPES.has(entry.type))
          || new Set(answer.entries.map(entry => entry.name)).size !== answer.entries.length) throw failure(UNAVAILABLE);
      return Object.freeze({ entries: Object.freeze(answer.entries.map(entry => Object.freeze({ name: entry.name, type: entry.type }))),
        identity: copyIdentity(answer.identity) });
    },
  });
}
