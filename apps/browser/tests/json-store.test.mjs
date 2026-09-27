import test from "node:test";
import assert from "node:assert/strict";
import { JsonStore, JsonStoreError, profileStorage, MAX_STORE_BYTES } from "../chrome/JsonStore.sys.mjs";

function memoryStorage(initial = null) {
  let text = initial; let failing = false; const writes = [];
  return { read: async () => text, write: async value => { if (failing) throw new Error("disk full"); writes.push(value); text = value; },
    setFailing(value) { failing = value; }, get text() { return text; }, writes };
}

// Stand-in validator with the contexts-core behaviour: frozen normalized copy, unknown keys rejected.
function validate(doc) {
  if (!doc || doc.version !== 1 || !Array.isArray(doc.items) || Object.keys(doc).some(key => !["version", "items"].includes(key))
    || doc.items.some(item => typeof item !== "string")) {
    const error = new Error("INVALID_TEST_DOC"); error.code = "INVALID_TEST_DOC"; throw error;
  }
  return Object.freeze({ version: 1, items: Object.freeze([...doc.items]) });
}
const empty = { version: 1, items: [] };

test("missing file yields the validated empty doc without writing", async () => {
  const storage = memoryStorage();
  const store = new JsonStore({ storage, validate, empty });
  assert.deepEqual(await store.load(), empty);
  assert.ok(Object.isFrozen(await store.load()));
  assert.equal(storage.writes.length, 0);
});

test("updates are serialized, validated before write and survive a reload", async () => {
  const storage = memoryStorage();
  const store = new JsonStore({ storage, validate, empty });
  await Promise.all(["a", "b", "c"].map(item => store.update(doc => ({ ...doc, items: [...doc.items, item] }))));
  assert.deepEqual((await store.load()).items, ["a", "b", "c"]);
  assert.equal(storage.writes.length, 3);
  assert.ok(storage.text.endsWith("\n"));
  const reloaded = new JsonStore({ storage, validate, empty });
  assert.deepEqual((await reloaded.load()).items, ["a", "b", "c"]);
  // An invalid result is rejected before anything is written.
  await assert.rejects(store.update(doc => ({ ...doc, items: [...doc.items, 42] })), /INVALID_TEST_DOC/);
  await assert.rejects(store.update(doc => ({ ...doc, extra: true })), /INVALID_TEST_DOC/);
  assert.equal(storage.writes.length, 3);
  assert.deepEqual((await store.load()).items, ["a", "b", "c"]);
  // Returning the same document is a no-op.
  await store.update(doc => doc);
  assert.equal(storage.writes.length, 3);
});

test("a failed write leaves file and memory unchanged; the queue keeps working", async () => {
  const storage = memoryStorage();
  const store = new JsonStore({ storage, validate, empty });
  await store.update(doc => ({ ...doc, items: ["kept"] }));
  storage.setFailing(true);
  await assert.rejects(store.update(doc => ({ ...doc, items: [...doc.items, "lost"] })), /disk full/);
  await assert.rejects(store.update(() => { throw new Error("mutator refused"); }), /mutator refused/);
  storage.setFailing(false);
  assert.deepEqual((await store.load()).items, ["kept"]);
  await store.update(doc => ({ ...doc, items: [...doc.items, "next"] }));
  assert.deepEqual(JSON.parse(storage.text).items, ["kept", "next"]);
});

test("a corrupt or invalid file is never overwritten", async () => {
  for (const text of ["{not json", JSON.stringify({ version: 2, items: [] }), JSON.stringify({ version: 1, items: [], x: 1 })]) {
    const storage = memoryStorage(text);
    const store = new JsonStore({ storage, validate, empty });
    await assert.rejects(store.load(), error => error.code === "INVALID_STORE");
    await assert.rejects(store.update(() => empty), error => error.code === "INVALID_STORE");
    assert.equal(storage.text, text);
    assert.equal(storage.writes.length, 0);
  }
});

test("an oversized store is invalid, never parsed and never overwritten", async () => {
  const big = JSON.stringify({ version: 1, items: [] }) + " ".repeat(MAX_STORE_BYTES);
  const storage = memoryStorage(big);
  const store = new JsonStore({ storage, validate: doc => { throw new Error("must not be parsed or validated"); }, empty });
  await assert.rejects(store.load(), error => error.code === "INVALID_STORE" && /STORE_TOO_LARGE/u.test(error.message));
  await assert.rejects(store.update(() => empty), error => error.code === "INVALID_STORE");
  assert.equal(storage.writes.length, 0);
  // A storage that refuses to read past the cap is mapped to INVALID_STORE too.
  const capped = { read: async () => { throw new JsonStoreError("STORE_TOO_LARGE"); }, write: async () => { throw new Error("never written"); } };
  const cappedStore = new JsonStore({ storage: capped, validate, empty });
  await assert.rejects(cappedStore.update(() => empty), error => error.code === "INVALID_STORE");
});

test("profileStorage writes atomically under <profile>/axiosozo and rejects escaping names", async () => {
  const calls = [];
  const files = new Map();
  const reads = [];
  const io = {
    async read(path, options) {
      reads.push(options);
      if (!files.has(path)) { const error = new Error("missing"); error.name = "NotFoundError"; throw error; }
      return new Uint8Array(Buffer.from(files.get(path)).subarray(0, options.maxBytes));
    },
    async makeDirectory(path, options) { calls.push(["mkdir", path, options]); },
    async writeUTF8(path, text, options) { calls.push(["write", path, options]); files.set(path, text); },
  };
  globalThis.PathUtils = { join: (...parts) => parts.join("/"), profileDir: "/synthetic/profile" };
  try {
    const storage = profileStorage("contexts.json", { io });
    assert.equal(storage.path, "/synthetic/profile/axiosozo/contexts.json");
    assert.equal(await storage.read(), null);
    await storage.write("{}\n");
    assert.equal(await storage.read(), "{}\n");
    assert.deepEqual(calls, [
      ["mkdir", "/synthetic/profile/axiosozo", { ignoreExisting: true, createAncestors: true, permissions: 0o700 }],
      ["write", "/synthetic/profile/axiosozo/contexts.json", { tmpPath: "/synthetic/profile/axiosozo/contexts.json.tmp" }]]);
    for (const bad of ["../prefs.js", "/etc/passwd", "a//b", "", ".hidden", "x.tmp", "UPPER.json", "a/../b"]) {
      assert.throws(() => profileStorage(bad, { io }), /INVALID_STORE_PATH/, bad);
    }
    const failing = profileStorage("x.json", { io: { ...io, read: async () => { throw new Error("EACCES"); } } });
    await assert.rejects(failing.read(), /EACCES/);
    assert.ok(reads.every(options => options.maxBytes === MAX_STORE_BYTES + 1), "reads are bounded");
    const large = profileStorage("large.json", { io: { ...io, read: async (_path, options) => new Uint8Array(options.maxBytes) } });
    await assert.rejects(large.read(), error => error.code === "STORE_TOO_LARGE");
    const badUtf8 = profileStorage("bad.json", { io: { ...io, read: async () => new Uint8Array([0xff, 0xfe]) } });
    await assert.rejects(badUtf8.read(), error => error.code === "INVALID_STORE");
  } finally {
    delete globalThis.PathUtils;
  }
});
