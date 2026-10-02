import test from "node:test";
import assert from "node:assert/strict";
import { createProjectReader } from "../chrome/ProjectReader.sys.mjs";

const ROOT = "/synthetic/project";
const ROOT_ID = { device: "0", inode: "4294967297" };
const FILE_ID = { device: "11", inode: "18446744073709551615" };
const META = { type: "regular", size: 3, identity: FILE_ID };
const ROOT_META = { type: "directory", size: 256, identity: ROOT_ID };
const REQ = { root: ROOT, relative: "package.json", expectedRoot: ROOT_ID };
const READ = { ...REQ, expectedFile: FILE_ID, maxBytes: 262145 };
const LIST = { ...REQ, relative: "", expectedDirectory: ROOT_ID, limit: 512 };
const timers = { setTimeout, clearTimeout };
const never = () => new Promise(() => {});
const flush = async () => { for (let n = 0; n < 30; n++) await Promise.resolve(); };
const encoded = value => ({ encoding: "base64", data: Buffer.from(value).toString("base64"), identity: FILE_ID });
function virtualTimers() {
  let now = 0, next = 0;
  const jobs = new Map();
  return {
    setTimeout(fn, delay) { const id = ++next; jobs.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { jobs.delete(id); },
    advance(delay) {
      now += delay;
      for (const [id, job] of [...jobs].sort((a, b) => a[1].at - b[1].at)) {
        if (job.at <= now && jobs.delete(id)) job.fn();
      }
    },
    get pending() { return jobs.size; },
  };
}
function fakeProcess(answer, options = {}) {
  const events = [];
  const stream = chunks => ({
    async readString() { events.push("read"); return chunks.shift() ?? null; },
    async close(force) { events.push(["pipe-close", force]); },
  });
  return {
    events,
    stdin: { async close(force) { events.push(["stdin-close", force]); } },
    stdout: stream(options.stdout ?? [JSON.stringify(answer)]),
    stderr: stream(options.stderr ?? []),
    async wait() { events.push("wait"); return { exitCode: options.exitCode ?? 0 }; },
    async kill(signal) { events.push(["kill", signal]); },
  };
}
function harness(answer = { ok: true, result: ROOT_META }, options = {}) {
  const calls = [], process = options.process ?? fakeProcess(answer, options);
  const reader = createProjectReader({ configuredTrusted: true, interpreter: "/trusted/python3",
    helperPath: "/product/helpers/project_reader.py", Subprocess: { async call(value) { calls.push(value); return process; } },
    timers, ...options.configuration });
  return { reader, calls, process };
}
const rejects = (promise, code = "READ_CONTAINMENT_UNAVAILABLE") => assert.rejects(promise, error => error.code === code);

test("missing explicit trust gates all methods without process startup", async () => {
  let calls = 0;
  const reader = createProjectReader({ interpreter: "/trusted/python3", helperPath: "/product/reader.py",
    Subprocess: { call() { calls++; } }, timers });
  assert.equal(reader.exactAvailable, false);
  for (const [method, input] of [["rootMetadata", ROOT], ["fileMetadata", REQ], ["presenceMetadata", REQ],
    ["readContained", READ], ["listContained", LIST]]) await rejects(reader[method](input));
  assert.equal(calls, 0);
  assert.equal(Object.isFrozen(reader), true);
});

test("invalid trusted paths or resource bounds stay unavailable", async () => {
  for (const configuration of [{ interpreter: "python3" }, { helperPath: "/product/../reader.py" },
    { helperPath: "/product//reader.py" }, { interpreter: "/trusted/python3\n" }, { timeoutMs: 0 },
    { timeoutMs: 3001 }, { outputBytes: 524289 }, { outputBytes: 0 }, { timers: {} }, { Subprocess: {} }]) {
    const { reader, calls } = harness(undefined, { configuration });
    assert.equal(reader.exactAvailable, false);
    await rejects(reader.rootMetadata(ROOT));
    assert.equal(calls.length, 0);
  }
});

test("fixed isolated command closes stdin and captures stderr", async () => {
  const { reader, calls, process } = harness(undefined, { stderr: ["private diagnostics"] });
  const result = await reader.rootMetadata(ROOT);
  assert.deepEqual(result, ROOT_META);
  assert.deepEqual(calls, [{ command: "/trusted/python3",
    arguments: ["-I", "-S", "-B", "/product/helpers/project_reader.py", "metadata", JSON.stringify({ root: ROOT })],
    environment: { LANG: "C", LC_ALL: "C", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" },
    environmentAppend: false, stderr: "pipe", workdir: "/" }]);
  assert.deepEqual(process.events[0], ["stdin-close", undefined]);
  assert.equal(process.events.filter(event => event === "wait").length, 1);
  assert.equal(process.events.some(event => Array.isArray(event) && event[0] === "kill"), false);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.identity), true);
});

test("file and presence metadata use fixed separate operations", async () => {
  for (const [method, operation] of [["fileMetadata", "metadata"], ["presenceMetadata", "presence"]]) {
    const { reader, calls } = harness({ ok: true, result: META });
    assert.deepEqual(await reader[method](REQ), META);
    assert.equal(calls[0].arguments[4], operation);
    assert.deepEqual(JSON.parse(calls[0].arguments[5]), REQ);
  }
});

test("metadata NOT_FOUND becomes null; read NOT_FOUND remains a refusal", async () => {
  for (const [method, input] of [["rootMetadata", ROOT], ["fileMetadata", REQ], ["presenceMetadata", REQ]]) {
    assert.equal(await harness({ ok: false, error: "NOT_FOUND" }).reader[method](input), null);
  }
  await rejects(harness({ ok: false, error: "NOT_FOUND" }).reader.readContained(READ), "NOT_FOUND");
});

test("strict request shapes reject extra, inherited, accessor and symbolic fields", async () => {
  const extraSymbol = { ...REQ, [Symbol("x")]: true };
  const accessor = { ...REQ }; Object.defineProperty(accessor, "root", { enumerable: true, get() { throw new Error("must not execute"); } });
  const hidden = { ...REQ }; Object.defineProperty(hidden, "unknown", { value: true });
  for (const input of [{ ...REQ, unknown: true }, Object.assign(Object.create({ unknown: true }), REQ),
    accessor, hidden, extraSymbol, [], null, { ...REQ, expectedRoot: { ...ROOT_ID, x: true } }]) {
    const { reader, calls } = harness();
    await rejects(reader.fileMetadata(input), "INVALID_PARAMS");
    assert.equal(calls.length, 0);
  }
});

test("paths reject traversal, noncanonical roots and control characters", async () => {
  const { reader, calls } = harness();
  for (const root of ["/", "relative", "/x/../project", "/x/./project", "/x//project", "/x/", "/x\u0080", "/x\n", "/" + "é".repeat(4096)]) {
    await rejects(reader.rootMetadata(root), "INVALID_PARAMS");
  }
  for (const path of ["", "/package.json", "a/../package.json", "a/./package.json", "a//package.json", "a/", "a\\package.json", "package.json\n"]) {
    await rejects(reader.fileMetadata({ ...REQ, relative: path }), "INVALID_PARAMS");
  }
  assert.equal(calls.length, 0);
});

test("exact decimal identities retain uint64 precision and reject coercion", async () => {
  const { reader, calls } = harness();
  for (const id of [{ device: 11, inode: "1" }, { device: "11", inode: 1 }, { device: "01", inode: "1" },
    { device: "1", inode: "0" }, { device: "1", inode: "-1" }, { device: "1", inode: "1e9" },
    { device: "1", inode: "1".repeat(21) }, { device: "1".repeat(21), inode: "1" }]) {
    await rejects(reader.fileMetadata({ ...REQ, expectedRoot: id }), "INVALID_PARAMS");
  }
  assert.equal(calls.length, 0);
});

test("read byte bounds and list limits cannot exceed fixed hard caps", async () => {
  const { reader, calls } = harness();
  for (const maxBytes of [0, -1, 262146, 1.5, "262145", NaN]) await rejects(reader.readContained({ ...READ, maxBytes }), "INVALID_PARAMS");
  for (const limit of [0, -1, 513, 1.5, "512", NaN]) await rejects(reader.listContained({ ...LIST, limit }), "INVALID_PARAMS");
  await rejects(reader.readContained({ ...READ, expectedFile: { ...FILE_ID, inode: "0" } }), "INVALID_PARAMS");
  await rejects(reader.listContained({ ...LIST, expectedDirectory: { ...ROOT_ID, device: "-1" } }), "INVALID_PARAMS");
  assert.equal(calls.length, 0);
});

test("read returns bounded Uint8Array from canonical base64 without browser globals", async () => {
  for (const bytes of [new Uint8Array(), new Uint8Array([0]), new Uint8Array([0, 255]),
    new Uint8Array([0, 128, 255]), Buffer.from("héllo"), Buffer.from("abcd")]) {
    const { reader, calls } = harness({ ok: true, result: encoded(bytes) });
    const result = await reader.readContained(READ);
    assert.equal(result instanceof Uint8Array, true);
    assert.deepEqual([...result], [...bytes]);
    assert.equal(calls[0].arguments[4], "read");
    assert.deepEqual(JSON.parse(calls[0].arguments[5]), READ);
  }
});

test("read supports maximum allowed bytes and refuses identity mismatch", async () => {
  const bytes = new Uint8Array(262145); bytes[262144] = 255;
  assert.deepEqual(await harness({ ok: true, result: encoded(bytes) }).reader.readContained(READ), bytes);
  await rejects(harness({ ok: true, result: { ...encoded("x"), identity: { ...FILE_ID, inode: "2" } } }).reader.readContained(READ));
});

test("read rejects malformed, noncanonical or excessive base64", async () => {
  for (const data of ["Zg", "Zg===", "Zg==\n", "Zh==", "Zm9=", "@@==", "====", "Zg==Zg==", 123]) {
    await rejects(harness({ ok: true, result: { ...encoded("x"), data } }).reader.readContained(READ));
  }
  await rejects(harness({ ok: true, result: encoded("four") }).reader.readContained({ ...READ, maxBytes: 3 }));
  for (const result of [{ ...encoded("x"), encoding: "utf8" }, { ...encoded("x"), extra: true },
    { encoding: "base64", data: "eA==" }, null]) await rejects(harness({ ok: true, result }).reader.readContained(READ));
});

test("list preserves bounded names and exact descriptor identity", async () => {
  const result = { entries: [{ name: "alpha", type: "directory" }, { name: "file.json", type: "regular" },
    { name: ".agents", type: "directory" }, { name: "héllo", type: "other" }], identity: ROOT_ID };
  const { reader, calls } = harness({ ok: true, result });
  const found = await reader.listContained(LIST);
  assert.deepEqual(found, result);
  assert.equal(Object.isFrozen(found.entries), true);
  assert.equal(Object.isFrozen(found.entries[0]), true);
  assert.equal(calls[0].arguments[4], "list");
  assert.deepEqual(JSON.parse(calls[0].arguments[5]), LIST);
});

test("list rejects unsafe names, duplicates, extra keys, types and excessive count", async () => {
  const values = [".", "..", "._fork", "a/b", "a\\b", "bad\n", "bad\u007f", "é".repeat(128)].map(name => ({ name, type: "directory" }));
  values.push({ name: "x", type: "symlink" }, { name: "x", type: "directory", extra: 1 });
  for (const entry of values) await rejects(harness({ ok: true, result: { entries: [entry], identity: ROOT_ID } }).reader.listContained(LIST));
  for (const result of [{ entries: [{ name: "x", type: "regular" }, { name: "x", type: "regular" }], identity: ROOT_ID },
    { entries: [], identity: FILE_ID }, { entries: [], identity: ROOT_ID, extra: true },
    { entries: [{ name: "x", type: "regular" }, { name: "y", type: "regular" }], identity: ROOT_ID }]) {
    await rejects(harness({ ok: true, result }).reader.listContained({ ...LIST, limit: 1 }));
  }
});

test("malformed metadata and unknown/error responses cannot establish capability", async () => {
  for (const result of [{ ...ROOT_META, extra: true }, { ...ROOT_META, size: -1 }, { ...ROOT_META, size: 1.5 },
    { ...ROOT_META, type: "symlink" }, { ...ROOT_META, identity: { ...ROOT_ID, inode: 1 } }, META, null]) {
    await rejects(harness({ ok: true, result }).reader.rootMetadata(ROOT));
  }
  for (const answer of [null, [], { ok: "true", result: ROOT_META }, { ok: true, result: ROOT_META, extra: true },
    { ok: false, error: "private/path/disclosure" }, { ok: false, error: "NOT_FOUND", result: null }]) {
    const error = await harness(answer).reader.rootMetadata(ROOT).catch(value => value);
    assert.equal(error.code, "READ_CONTAINMENT_UNAVAILABLE");
    assert.equal(error.message.includes("private"), false);
  }
  await rejects(harness({ ok: false, error: "IDENTITY_CHANGED" }).reader.fileMetadata(REQ), "IDENTITY_CHANGED");
});

test("stdout is capped in UTF8 bytes across chunks and malformed JSON is discarded", async () => {
  for (const options of [{ stdout: ["ééé"], configuration: { outputBytes: 5 } },
    { stdout: ["12", "34", "56"], configuration: { outputBytes: 5 } },
    { stdout: ["{private/path"] }, { stdout: [42] }, { stdout: [] }, { exitCode: 1 }]) {
    const { reader, process } = harness(undefined, options);
    await rejects(reader.rootMetadata(ROOT));
    assert.deepEqual(process.events.filter(event => Array.isArray(event) && event[0] === "pipe-close"), [["pipe-close", true], ["pipe-close", true]]);
  }
});

test("bounded stderr drain neither inherits nor exposes diagnostic content", async () => {
  const { reader, process } = harness(undefined, { stderr: ["secret:" + "x".repeat(16384)] });
  const error = await reader.rootMetadata(ROOT).catch(value => value);
  assert.equal(error.code, "READ_CONTAINMENT_UNAVAILABLE");
  assert.equal(error.message.includes("secret"), false);
  assert.equal(process.events.some(event => Array.isArray(event) && event[0] === "kill"), true);
});

test("reader error force-closes all output pipes", async () => {
  const process = fakeProcess({ ok: true, result: ROOT_META });
  process.stdout.readString = async () => { throw new Error("private/path"); };
  const { reader } = harness(undefined, { process });
  await rejects(reader.rootMetadata(ROOT));
  assert.deepEqual(process.events.filter(event => Array.isArray(event) && event[0] === "pipe-close"), [["pipe-close", true], ["pipe-close", true]]);
  assert.equal(process.events.some(event => Array.isArray(event) && event[0] === "kill"), true);
});

test("synchronous startup errors and invalid process capabilities become unavailable", async () => {
  for (const call of [() => { throw new Error("private credentials"); }, async () => ({}), async () => null]) {
    const reader = createProjectReader({ configuredTrusted: true, interpreter: "/trusted/python3", helperPath: "/product/reader.py", Subprocess: { call }, timers });
    await rejects(reader.rootMetadata(ROOT));
  }
});

for (const phase of ["startup", "stdin", "stdout", "stderr", "wait", "cleanup"]) {
  test("deadline and bounded cleanup settle when " + phase + " never resolves", async () => {
    const clock = virtualTimers(), process = fakeProcess({ ok: true, result: ROOT_META });
    if (phase === "stdin") process.stdin.close = never;
    if (phase === "stdout" || phase === "cleanup") process.stdout.readString = never;
    if (phase === "stderr") process.stderr.readString = never;
    if (phase === "wait" || phase === "cleanup") process.wait = never;
    if (phase === "cleanup") {
      process.kill = () => { process.events.push(["kill", 0]); return never(); };
      process.stdin.close = (() => { let first = true; return () => first ? (first = false, Promise.resolve()) : never(); })();
      process.stdout.close = never; process.stderr.close = never;
    }
    const { reader } = harness(undefined, { process, configuration: { timers: clock, timeoutMs: 3,
      ...(phase === "startup" ? { Subprocess: { call: never } } : {}) } });
    const result = reader.rootMetadata(ROOT).catch(error => error);
    await flush();
    clock.advance(3);
    await flush();
    clock.advance(500);
    await flush();
    assert.equal((await result).code, "READ_CONTAINMENT_UNAVAILABLE");
    assert.equal(clock.pending, 0);
    if (phase !== "startup") assert.equal(process.events.some(event => Array.isArray(event) && event[0] === "kill"), true);
  });
}

test("a process starting after the deadline is killed without reading content", async () => {
  const clock = virtualTimers(); let finishStartup;
  const process = fakeProcess({ ok: true, result: ROOT_META });
  const { reader } = harness(undefined, { process, configuration: { timers: clock, timeoutMs: 3,
    Subprocess: { call: () => new Promise(resolve => { finishStartup = resolve; }) } } });
  const result = reader.rootMetadata(ROOT).catch(error => error);
  await flush(); clock.advance(3); await flush();
  assert.equal((await result).code, "READ_CONTAINMENT_UNAVAILABLE");
  finishStartup(process); await flush(); clock.advance(500); await flush();
  assert.equal(process.events.some(event => Array.isArray(event) && event[0] === "kill"), true);
  assert.equal(process.events.includes("read"), false);
  assert.equal(clock.pending, 0);
});
