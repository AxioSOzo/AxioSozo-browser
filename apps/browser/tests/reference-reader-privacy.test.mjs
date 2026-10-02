import test from "node:test";
import assert from "node:assert/strict";
import { createNativeProjectReader, projectReaderPaths, PROJECT_READER_SHA256,
  PROJECT_READER_PYTHON } from "../chrome/ProjectReaderConfig.sys.mjs";
import { createProjectDetection } from "../chrome/ProjectDetection.sys.mjs";
import * as core from "../../../packages/contexts/src/index.mjs";

const BUILD = "/Volumes/AxioSozoBuild/workstation";
const ROOT = "/synthetic/reference";
const ROOT_ID = Object.freeze({ device: "11", inode: "100" });
const FILE_ID = Object.freeze({ device: "11", inode: "101" });
const ROOT_META = Object.freeze({ type: "directory", size: 64, identity: ROOT_ID });
const FILE_META = Object.freeze({ type: "regular", size: 3, identity: FILE_ID });
const request = (relative = ".git/config") => ({ root: ROOT, relative, expectedRoot: ROOT_ID });
const read = (relative = ".git/config") => ({ ...request(relative), expectedFile: FILE_ID, maxBytes: 64 });
const list = (relative = "") => ({ ...request(relative), expectedDirectory: ROOT_ID, limit: 16 });
const errorCode = code => error => error.code === code && error.message === code;

function fakeProcess(answer) {
  const lines = [JSON.stringify(answer)];
  return {
    stdin: { async close() {} },
    stdout: { async readString() { return lines.shift() ?? null; }, async close() {} },
    stderr: { async readString() { return null; }, async close() {} },
    async wait() { return { exitCode: 0 }; }, async kill() {},
  };
}
function harness(flags = {}, override = {}) {
  const children = [], verified = [], environmentNames = [];
  const environment = { AXIOSOZO_STATIC_READER_ROOT: BUILD, ...flags };
  const runtime = {
    timers: { setTimeout, clearTimeout },
    env(name) { environmentNames.push(name); return environment[name] ?? ""; },
    async verifyFile(path, options) { verified.push([path, options]); return true; },
    async sha256() { return PROJECT_READER_SHA256; },
    Subprocess: { async call(configuration) {
      children.push(configuration);
      const operation = configuration.arguments[4], payload = JSON.parse(configuration.arguments[5]);
      let answer;
      if (operation === "metadata") answer = { ok: true, result: payload.relative === undefined ? ROOT_META : FILE_META };
      else if (operation === "presence") answer = { ok: false, error: "NOT_FOUND" };
      else if (operation === "list") answer = { ok: true, result: { entries: [], identity: ROOT_ID } };
      else if (operation === "read") answer = { ok: true, result: { encoding: "base64", data: "e30K", identity: FILE_ID } };
      else assert.fail("Unexpected reader operation");
      return fakeProcess(answer);
    } },
    ...override,
  };
  return { runtime, children, verified, environmentNames };
}
const enabled = { AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_METADATA_NO_REMOTE_CONFIG: "1" };

test("fixed helper admission is unchanged and does not start children", async () => {
  const h = harness(enabled);
  const reader = await createNativeProjectReader({ runtime: h.runtime });
  assert.equal(reader.exactAvailable, true);
  assert.equal(Object.isFrozen(reader), true);
  assert.deepEqual(h.children, []);
  assert.deepEqual(h.verified, [[PROJECT_READER_PYTHON, { executable: true }],
    [projectReaderPaths(BUILD).helperPath, { privateParent: true }],
    [projectReaderPaths(BUILD).helperPath, { privateParent: true }]]);
  assert.deepEqual(h.environmentNames, ["AXIOSOZO_STATIC_READER_ROOT", "AXIOSOZO_SYNTHETIC_TEST", "AXIOSOZO_METADATA_NO_REMOTE_CONFIG"]);
});

test("both exact privileged flags are required; default Git metadata behavior is retained", async () => {
  for (const flags of [{}, { AXIOSOZO_SYNTHETIC_TEST: "1" }, { AXIOSOZO_METADATA_NO_REMOTE_CONFIG: "1" },
    { ...enabled, AXIOSOZO_SYNTHETIC_TEST: "true" }, { ...enabled, AXIOSOZO_METADATA_NO_REMOTE_CONFIG: "true" },
    { ...enabled, AXIOSOZO_SYNTHETIC_TEST: 1 }, { ...enabled, AXIOSOZO_METADATA_NO_REMOTE_CONFIG: "1 " }]) {
    const h = harness(flags), reader = await createNativeProjectReader({ runtime: h.runtime });
    assert.deepEqual(await reader.fileMetadata(request()), FILE_META);
    assert.equal(h.children.length, 1);
    assert.equal(JSON.parse(h.children[0].arguments[5]).relative, ".git/config");
  }
});

test("enabled seam refuses Git config metadata and content before any child starts", async () => {
  const h = harness(enabled), reader = await createNativeProjectReader({ runtime: h.runtime });
  assert.equal(await reader.fileMetadata(request()), null);
  assert.equal(await reader.presenceMetadata(request()), null);
  await assert.rejects(reader.readContained(read()), errorCode("READ_CONTAINMENT_REFUSED"));
  await assert.rejects(reader.listContained(list(".git/config")), errorCode("READ_CONTAINMENT_REFUSED"));
  assert.deepEqual(h.children, []);
});

test("all allowed operations still use the pinned helper and original resource caps", async () => {
  const h = harness(enabled), reader = await createNativeProjectReader({ runtime: h.runtime });
  assert.deepEqual(await reader.rootMetadata(ROOT), ROOT_META);
  assert.deepEqual(await reader.fileMetadata(request("package.json")), FILE_META);
  assert.equal(await reader.presenceMetadata(request("docs")), null);
  assert.deepEqual([...await reader.readContained(read("package.json"))], [123, 125, 10]);
  assert.deepEqual(await reader.listContained(list()), { entries: [], identity: ROOT_ID });
  assert.equal(h.children.length, 5);
  for (const child of h.children) {
    assert.equal(child.command, PROJECT_READER_PYTHON);
    assert.deepEqual(child.arguments.slice(0, 4), ["-I", "-S", "-B", projectReaderPaths(BUILD).helperPath]);
    assert.equal(child.environmentAppend, false);
    assert.equal(child.workdir, "/");
  }
  const count = h.children.length;
  await assert.rejects(reader.readContained({ ...read("package.json"), maxBytes: 262146 }), errorCode("INVALID_PARAMS"));
  await assert.rejects(reader.listContained({ ...list(), limit: 513 }), errorCode("INVALID_PARAMS"));
  assert.equal(h.children.length, count);
});

test("no accessor can authorize or reveal a blocked path", async () => {
  const h = harness(enabled), reader = await createNativeProjectReader({ runtime: h.runtime });
  const badRelative = { ...request() };
  Object.defineProperty(badRelative, "relative", { enumerable: true, get() { assert.fail("Relative getter must not execute"); } });
  await assert.rejects(reader.fileMetadata(badRelative), errorCode("INVALID_PARAMS"));
  const badRoot = { ...request() };
  Object.defineProperty(badRoot, "root", { enumerable: true, get() { assert.fail("Blocked root getter must not execute"); } });
  assert.equal(await reader.fileMetadata(badRoot), null);
  const badRead = { ...read() };
  Object.defineProperty(badRead, "relative", { enumerable: true, get() { assert.fail("Read getter must not execute"); } });
  await assert.rejects(reader.readContained(badRead), errorCode("INVALID_PARAMS"));
  assert.deepEqual(h.children, []);
});

test("unsafe helper and checksum drift remain unavailable even with the seam enabled", async () => {
  for (const override of [{ verifyFile: async () => false }, { sha256: async () => "0".repeat(64) }]) {
    const h = harness(enabled, override);
    await assert.rejects(createNativeProjectReader({ runtime: h.runtime }), errorCode("READ_CONTAINMENT_UNAVAILABLE"));
    assert.deepEqual(h.children, []);
  }
});

function fakeFilesystem(alias = false) {
  const names = new Set([ROOT, `${ROOT}/package.json`, `${ROOT}/.git/config`]);
  return {
    join: (root, relative) => `${root}/${relative}`,
    basename: root => root.slice(root.lastIndexOf("/") + 1),
    async lstat(path) { return !names.has(path) ? null : { type: path === ROOT ? "directory" : "regular" }; },
    async stat(path) { return path === ROOT ? { type: "directory" } : null; },
    async realpath(path) {
      if (!names.has(path)) throw Error("NOT_FOUND");
      return alias && path === `${ROOT}/package.json` ? `${ROOT}/.git/config` : path;
    },
  };
}

test("native-factory detector reads package metadata while skipping Git config", async () => {
  const h = harness(enabled), reader = await createNativeProjectReader({ runtime: h.runtime });
  const detected = await createProjectDetection({ fs: fakeFilesystem(), reader, core, clock: () => 1 }).detect(ROOT);
  assert.equal(detected.canonicalRoot, ROOT);
  assert.ok(detected.draft.files_read.includes("package.json"));
  assert.equal(detected.draft.files_read.includes(".git/config"), false);
  assert.equal(h.children.some(child => JSON.parse(child.arguments[5]).relative === ".git/config"), false);
});

test("resolved alias into Git config is refused before helper metadata and reads", async () => {
  const h = harness(enabled), reader = await createNativeProjectReader({ runtime: h.runtime });
  const detected = await createProjectDetection({ fs: fakeFilesystem(true), reader, core, clock: () => 1 }).detect(ROOT);
  assert.equal(detected.draft.files_read.includes("package.json"), false);
  assert.equal(detected.draft.files_read.includes(".git/config"), false);
  assert.equal(h.children.some(child => JSON.parse(child.arguments[5]).relative === ".git/config"), false);
  assert.equal(h.children.some(child => child.arguments[4] === "read"), false);
});
