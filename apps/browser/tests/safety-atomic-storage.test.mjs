import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createSafetyAtomicStorage, SAFETY_STORE_CAP, SAFETY_STORE_LEAF } from '../chrome/SafetyAtomicStorage.sys.mjs';
import { JsonStore } from '../chrome/JsonStore.sys.mjs';
import * as core from '../../../packages/contexts/src/safety-choice.mjs';
import { createSafetyOwnerSchema } from '../chrome/SafetyOwner.sys.mjs';
const root = '/synthetic-owned/axiosozo', path = `${root}/${SAFETY_STORE_LEAF}`;
const missing = () => Object.assign(new Error('SYNTHETIC_MISSING'), { name: 'NotFoundError' });
function fixture() {
  const f = { calls: [], bytes: null, rootInfo: { type: 'directory', permissions: 0o700 }, leafInfo: null, readError: null, writeError: null,
    mkdirError: null, wrongAck: false, written: null, onWrite: null };
  const io = {
    async stat(p) { f.calls.push(['stat', p]); if (p === root) return f.rootInfo; if (p !== path) throw new Error('UNEXPECTED_PATH'); if (!f.leafInfo) throw missing(); return f.leafInfo; },
    async makeDirectory(p, options) { f.calls.push(['mkdir', p, options]); if (f.mkdirError) throw f.mkdirError; },
    async read(p, options) { f.calls.push(['read', p, options]); if (f.readError) throw f.readError; return f.bytes; },
    async writeUTF8(p, text, options) { f.calls.push(['write', p, options]); if (f.writeError) throw f.writeError; f.written = text; await f.onWrite?.(); return f.wrongAck ? 0 : new TextEncoder().encode(text).byteLength; },
  };
  f.storage = createSafetyAtomicStorage({ io, paths: { join: (r, n) => `${r}/${n}` }, root, rootAssurance: 'CANONICAL_PRIVATE_STABLE' });
  return f;
}
test('construction is inert, rejects untrusted/relative roots, and owns one closed leaf', () => {
  const f = fixture(); assert.equal(f.calls.length, 0); assert.equal(f.storage.path, path);
  for (const invalid of ['~/synthetic', '/synthetic/../other', '/', '/synthetic/']) assert.throws(() => createSafetyAtomicStorage({ io: {}, paths: {}, root: invalid }), /INVALID_SAFETY_STORAGE/);
});
test('explicit provisioning requests private mode and verifies existing directory permissions', async () => {
  const f = fixture(); await f.storage.provisionRoot();
  assert.deepEqual(f.calls, [['mkdir', root, { createAncestors: false, ignoreExisting: true, permissions: 0o700 }], ['stat', root]]);
  f.rootInfo.permissions = 0o755; await assert.rejects(f.storage.provisionRoot(), /SAFETY_STORAGE_ROOT_UNVERIFIED/);
});
test('missing closed leaf under verified root returns null without reading other files', async () => {
  const f = fixture(); assert.equal(await f.storage.read(), null); assert.deepEqual(f.calls, [['stat', root], ['stat', path]]);
});
test('bounded regular-file read decodes exact fatal UTF-8 and parses through JsonStore', async () => {
  const f = fixture(), schema = createSafetyOwnerSchema(core), text = JSON.stringify(schema.empty);
  f.bytes = new TextEncoder().encode(text); f.leafInfo = { type: 'regular', size: f.bytes.byteLength };
  const store = new JsonStore({ storage: f.storage, validate: schema.validate, empty: schema.empty }); assert.deepEqual(await store.load(), schema.empty);
  assert.deepEqual(f.calls.at(-1), ['read', path, { maxBytes: SAFETY_STORE_CAP + 1 }]);
});
test('nonregular/broken-symlink metadata and known oversize leaves never reach content read', async () => {
  for (const leafInfo of [{ type: 'other', size: -1 }, { type: 'directory', size: -1 }, { type: 'regular', size: SAFETY_STORE_CAP + 1 }]) {
    const f = fixture(); f.leafInfo = leafInfo; await assert.rejects(f.storage.read()); assert.equal(f.calls.some(c => c[0] === 'read'), false);
  }
});
test('read failure after regular-file stat is surfaced even if named NotFoundError', async () => {
  const f = fixture(); f.leafInfo = { type: 'regular', size: 1 }; f.readError = missing(); await assert.rejects(f.storage.read(), { name: 'NotFoundError' });
});
test('growth after stat and invalid UTF-8 fail without accepting an empty document', async () => {
  const f = fixture(); f.leafInfo = { type: 'regular', size: 1 }; f.bytes = new Uint8Array(SAFETY_STORE_CAP + 1);
  await assert.rejects(f.storage.read(), /STORE_TOO_LARGE/); f.bytes = new Uint8Array([0xff]); await assert.rejects(f.storage.read(), /INVALID_STORE/);
});
test('write ACK requests same-directory overwrite with file flushing and exact UTF-8 byte count', async () => {
  const f = fixture(); await f.storage.write('synthetic-å');
  assert.deepEqual(f.calls, [['stat', root], ['write', path, { tmpPath: `${path}.tmp`, mode: 'overwrite', flush: true }]]);
  assert.equal(f.storage.assurance, 'ATOMIC_FLUSHED'); f.wrongAck = true; await assert.rejects(f.storage.write('synthetic'), /SAFETY_STORE_ACK_MISMATCH/);
});
test('write failures are not swallowed and JsonStore retains its last acknowledged record', async () => {
  const f = fixture(), schema = createSafetyOwnerSchema(core), store = new JsonStore({ storage: f.storage, validate: schema.validate, empty: schema.empty });
  await store.load(); f.writeError = new Error('SYNTHETIC_WRITE_FAILURE'); await assert.rejects(store.update(d => ({ ...d, sequence: 1 })), /SYNTHETIC_WRITE_FAILURE/);
  assert.equal((await store.load()).sequence, 0); assert.equal(f.written, null);
});
test('corrupt owner data never causes an overwrite through the composed store', async () => {
  const f = fixture(), schema = createSafetyOwnerSchema(core); f.bytes = new TextEncoder().encode('{bad'); f.leafInfo = { type: 'regular', size: f.bytes.byteLength };
  const store = new JsonStore({ storage: f.storage, validate: schema.validate, empty: schema.empty }); await assert.rejects(store.update(d => d), /INVALID_STORE/);
  assert.equal(f.calls.some(c => c[0] === 'write'), false);
});

test('native byte views from another realm remain valid bounded UTF-8 input', async () => {
  const f = fixture(); f.bytes = vm.runInNewContext('new Uint8Array([123,125])'); f.leafInfo = { type: 'regular', size: 2 };
  assert.equal(await f.storage.read(), '{}');
});
