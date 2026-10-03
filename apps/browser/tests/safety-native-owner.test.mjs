import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafetyNativeOwnerRegistry } from '../chrome/SafetyNativeOwner.sys.mjs';
import { createSafetyAtomicStorage } from '../chrome/SafetyAtomicStorage.sys.mjs';
import { JsonStore } from '../chrome/JsonStore.sys.mjs';
import * as core from '../../../packages/contexts/src/safety-choice.mjs';
import { createSafetyOwner, createSafetyOwnerSchema } from '../chrome/SafetyOwner.sys.mjs';
import { createSafetyPreferenceFactory } from '../chrome/SafetyPreferenceFactory.sys.mjs';
import { createSafetyPreferences } from '../chrome/SafetyPreferences.sys.mjs';
import { prefFixture } from './safety-fakes.mjs';
let sequence = 0;
const missing = () => Object.assign(new Error('SYNTHETIC_MISSING'), { result: 'synthetic-missing', name: 'NotFoundError' });
function fixture() {
  const profile = `/synthetic-native-${++sequence}/profile`, root = `${profile}/axiosozo-safety`;
  const f = { profile, root, calls: [], parent: true, shutdown: false, quit: false, lockTime: 0,
    entries: new Map([[profile, { type: 'directory', permissions: 0o700 }]]), bytes: null, onMkdir: null, onWrite: null, wrongAck: false };
  const files = path => {
    const entry = () => { const value = f.entries.get(path); if (!value) throw missing(); return value; };
    return { path, isSymlink: () => entry().symlink === true, isDirectory: () => entry().type === 'directory',
      isFile: () => entry().type === 'regular', get permissions() { return entry().permissions; },
      clone: () => ({ path, normalize() { this.path = entry().canonical ?? path; } }) };
  };
  const io = {
    async makeDirectory(path, options) { f.calls.push(['mkdir', path, options]); await f.onMkdir?.();
      if (!f.entries.has(path)) f.entries.set(path, { type: 'directory', permissions: 0o700 }); },
    async stat(path) { f.calls.push(['stat', path]); const value = f.entries.get(path); if (!value) throw missing(); return { ...value, size: f.bytes?.length ?? 0 }; },
    async read(path, options) { f.calls.push(['read', path, options]); return f.bytes; },
    async writeUTF8(path, text, options) { f.calls.push(['write', path, options]); await f.onWrite?.();
      f.bytes = new TextEncoder().encode(text); f.entries.set(path, { type: 'regular', permissions: 0o644 });
      return f.wrongAck ? 0 : f.bytes.length; },
  };
  const deps = { gate: { parent: () => f.parent, profileDir: () => f.profile, lockTime: () => f.lockTime,
    shuttingDown: () => f.shutdown, attemptingQuit: () => f.quit }, files, isMissing: e => e?.result === 'synthetic-missing', io,
    paths: { join: (p, name) => `${p}/${name}` }, createStorage: createSafetyAtomicStorage };
  f.registry = createSafetyNativeOwnerRegistry(deps); f.second = () => createSafetyNativeOwnerRegistry(deps);
  return f;
}
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
const close = lease => lease.close(() => true);
test('constructor has no filesystem/native probe work', () => { const f = fixture(); assert.deepEqual(f.calls, []); });
test('closed profile child and exact private provisioning with missing journal', async () => {
  const f = fixture(), lease = await f.registry.acquire();
  assert.equal(lease.storage.path, `${f.root}/safety-owner.json`); assert.equal(lease.assertExclusiveWriter(), true);
  assert.deepEqual(f.calls[0], ['mkdir', f.root, { createAncestors: false, ignoreExisting: true, permissions: 0o700 }]);
  assert.equal(await lease.run(() => lease.storage.read()), null); await close(lease);
});
test('independent registries reserve the same journal before provisioning await', async () => {
  const f = fixture(), wait = deferred(); f.onMkdir = () => wait.promise;
  const acquiring = f.registry.acquire(); await assert.rejects(f.second().acquire(), /SAFETY_WRITER_BUSY/);
  wait.resolve(); const lease = await acquiring; await close(lease);
});
test('parent/profile native probe and shutdown gates deny before provisioning', async () => {
  for (const change of [f => { f.parent = false; }, f => { f.shutdown = true; }, f => { f.quit = true; },
    f => { f.lockTime = NaN; }, f => { f.entries.get(f.profile).canonical = '/different-profile'; }]) {
    const f = fixture(); change(f); await assert.rejects(f.registry.acquire()); assert.equal(f.calls.length, 0);
  }
});
test('root symlink, ancestor alias, loose directory mode and special root deny', async () => {
  for (const metadata of [{ type: 'directory', permissions: 0o700, symlink: true },
    { type: 'directory', permissions: 0o700, canonical: '/different/root' },
    { type: 'directory', permissions: 0o755 }, { type: 'regular', permissions: 0o700 }]) {
    const f = fixture(); f.entries.set(f.root, metadata); await assert.rejects(f.registry.acquire()); assert.equal(f.calls.length, 0);
  }
});
test('journal or fixed temp symlink/nonregular metadata blocks admission', async () => {
  for (const leaf of ['safety-owner.json', 'safety-owner.json.tmp']) for (const metadata of [{ type: 'regular', symlink: true }, { type: 'directory' }]) {
    const f = fixture(); f.entries.set(`${f.root}/${leaf}`, metadata); await assert.rejects(f.registry.acquire());
    assert.equal(f.calls.some(c => c[0] === 'write' || c[0] === 'read'), false);
  }
});
test('preparation failure releases its reservation without deleting files', async () => {
  const f = fixture(); f.onMkdir = () => { throw new Error('SYNTHETIC_MKDIR_FAILURE'); };
  await assert.rejects(f.registry.acquire()); f.onMkdir = null; const lease = await f.second().acquire(); await close(lease);
});
test('file flush/UTF8 byte ACK is preserved and wrong receipt is propagated', async () => {
  const f = fixture(), lease = await f.registry.acquire(); await lease.run(() => lease.storage.write('fixture-å'));
  assert.deepEqual(f.calls.find(c => c[0] === 'write'), ['write', `${f.root}/safety-owner.json`,
    { tmpPath: `${f.root}/safety-owner.json.tmp`, mode: 'overwrite', flush: true }]);
  f.wrongAck = true; await assert.rejects(lease.run(() => lease.storage.write('fixture')), /SAFETY_STORE_ACK_MISMATCH/); await close(lease);
});
test('lease revocation after a storage await surfaces uncertainty instead of ACK', async () => {
  const f = fixture(), lease = await f.registry.acquire(); f.onWrite = () => f.registry.revoke();
  await assert.rejects(lease.run(() => lease.storage.write('fixture')), /SAFETY_WRITER_LEASE_LOST/);
  assert.equal(lease.assertExclusiveWriter(), false); assert.ok(f.bytes); await close(lease);
});
test('changed profile, mode or temp replacement blocks later journal work', async () => {
  for (const change of [f => { f.profile = '/other-profile'; }, f => { f.entries.get(f.root).permissions = 0o755; },
    f => { f.entries.set(`${f.root}/safety-owner.json.tmp`, { type: 'regular', symlink: true }); }]) {
    const f = fixture(), lease = await f.registry.acquire(); change(f);
    await assert.rejects(lease.run(() => lease.storage.write('fixture'))); assert.equal(f.calls.some(c => c[0] === 'write'), false); await close(lease);
  }
});
test('close waits pending operation and rejects new calls before replacement', async () => {
  const f = fixture(), lease = await f.registry.acquire(), wait = deferred(); const task = lease.run(() => wait.promise);
  const closing = close(lease); await assert.rejects(lease.run(() => 1), /SAFETY_OWNER_CLOSED/);
  await assert.rejects(f.second().acquire(), /SAFETY_WRITER_BUSY/); wait.resolve(); await task; await closing;
  const replacement = await f.second().acquire(); assert.equal(lease.assertExclusiveWriter(), false); await close(replacement);
});
test('failed observer cleanup retains writer token until explicit close retry', async () => {
  const f = fixture(), lease = await f.registry.acquire(); await assert.rejects(lease.close(() => false), /SAFETY_NATIVE_CLEANUP_REQUIRED/);
  await assert.rejects(f.second().acquire(), /SAFETY_WRITER_BUSY/); await lease.close(() => true);
  const replacement = await f.second().acquire(); await close(replacement);
});

function composed(lease) {
  const nativeFixture = prefFixture(); nativeFixture.adapter.dispose();
  const schema = createSafetyOwnerSchema(core);
  const store = new JsonStore({ storage: lease.storage, validate: schema.validate, empty: schema.empty });
  const factory = createSafetyPreferenceFactory({ nativeCreate: createSafetyPreferences, prefs: nativeFixture.prefs, dns: { clearCache(value) { assert.equal(value, true); nativeFixture.cache.push(value); } } });
  const owner = createSafetyOwner({ core, store, createPreferences: factory.create, cleanupPreferences: factory.cleanup,
    storageAssurance: lease.storage.assurance, assertExclusiveWriter: lease.assertExclusiveWriter });
  return { nativeFixture, schema, store, factory, owner };
}
test('composed explicit decline has zero preference writes or DNS clearing', async () => {
  const f = fixture(), lease = await f.registry.acquire(), c = composed(lease);
  const result = await lease.run(() => c.owner.choose({ checked: false, userConfirmed: true, now: 10 }));
  assert.equal(result.blocked, false); assert.equal(c.nativeFixture.writes().length, 0); assert.equal(c.nativeFixture.cache.length, 0);
  assert.equal(c.nativeFixture.log.length, 0); await lease.close(c.factory.cleanup);
});
test('composed startup INTENT stays uncertain with zero preference replay', async () => {
  const f = fixture(), lease = await f.registry.acquire(), c = composed(lease);
  const plan = core.planSafetyChoice({ state: c.schema.empty.state, checked: true, userConfirmed: true, now: 20, snapshot: (() => { const adapter = c.factory.create({ onRecoveryRequired: () => false }); try { return adapter.snapshot(); } finally { adapter.dispose(); } })() });
  await lease.run(() => c.store.update(() => ({ version: 1, sequence: 1, state: c.schema.empty.state,
    pending: { phase: 'INTENT', sequence: 1, checked: true, confirmed_at: 20, expected: plan.expected,
      mutations: plan.mutations, next_state: plan.next_state, recovery: null, resolution: null } })));
  const result = await lease.run(() => c.owner.initialize());
  assert.equal(result.reason, 'STARTUP_UNCERTAIN'); assert.equal(result.code, 'RECOVERY_REQUIRED');
  assert.equal(result.blocked, true); assert.equal(c.nativeFixture.writes().length, 0); assert.equal(c.nativeFixture.cache.length, 0);
  await lease.close(c.factory.cleanup);
});
