import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../../../packages/contexts/src/safety-choice.mjs';
import { createSafetyPreferences } from '../chrome/SafetyPreferences.sys.mjs';
import { JsonStore } from '../chrome/JsonStore.sys.mjs';
import { createSafetyPreferenceFactory } from '../chrome/SafetyPreferenceFactory.sys.mjs';
import { createSafetyOwner, createSafetyOwnerSchema } from '../chrome/SafetyOwner.sys.mjs';
import { prefFixture } from './safety-fakes.mjs';
import { SAFETY_STORE_CAP } from '../chrome/SafetyAtomicStorage.sys.mjs';
const URI = 'network.trr.uri', MODE = 'network.trr.mode', FAMILY = core.FAMILY_DOH_URI, OTHER = 'https://resolver.example/dns-query';
const choose = { checked: true, userConfirmed: true, now: 10 };
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
function fixture() {
  const prefs = prefFixture(), schema = createSafetyOwnerSchema(core), events = [], writes = [];
  const disk = { raw: null, readFail: false, writes: 0, onWrite: null, lease: true, nativeFactories: 0, nativeCalls: 0, recoveryCallback: null, nativeOverride: null };
  const storage = {
    async read() { if (disk.readFail) throw new Error('SYNTHETIC_READ_FAILURE'); return disk.raw; },
    async write(text) {
      disk.writes++; const doc = JSON.parse(text); events.push(`STORE_${doc.pending?.phase ?? 'TERMINAL'}`); writes.push(doc);
      if (disk.onWrite) await disk.onWrite({ text, doc, count: disk.writes, commit() { disk.raw = text; } });
      else disk.raw = text;
    },
  };
  function makeStore() { return new JsonStore({ storage, validate: schema.validate, empty: schema.empty }); }
  const shared = createSafetyPreferenceFactory({ nativeCreate: createSafetyPreferences, prefs: prefs.prefs, dns: { clearCache(value) { prefs.cache.push(value); prefs.onCache?.(prefs.cache.length); } } });
  function createPreferences(options, registry = shared) {
    disk.nativeFactories++;
    const adapter = registry.create(options);
    return Object.freeze({ snapshot: () => adapter.snapshot(),
      compareAndApply(expected, mutations) { disk.nativeCalls++; events.push('NATIVE_COMPARE'); return disk.nativeOverride ? disk.nativeOverride(adapter, expected, mutations) : adapter.compareAndApply(expected, mutations); },
      diagnostics: () => adapter.diagnostics(), resolveRecovery: request => { events.push('NATIVE_RESOLVE'); return adapter.resolveRecovery(request); }, dispose: () => adapter.dispose() });
  }
  const ownerOptions = { core, createPreferences, storageAssurance: 'ATOMIC_FLUSHED', assertExclusiveWriter: () => disk.lease, cleanupPreferences: shared.cleanup };
  const store = makeStore(), owner = createSafetyOwner({ ...ownerOptions, store });
  return { prefs, schema, disk, events, writes, owner, store, recreate: ({ crashed = false } = {}) => {
    if (!crashed) return createSafetyOwner({ ...ownerOptions, store: makeStore() });
    // Simulate a dead process: its native factory lifetime no longer exists.
    const replacement = createSafetyPreferenceFactory({ nativeCreate: createSafetyPreferences, prefs: prefs.prefs, dns: { clearCache() {} } });
    return createSafetyOwner({ ...ownerOptions, createPreferences: options => createPreferences(options, replacement), cleanupPreferences: replacement.cleanup, store: makeStore() });
  }, createPreferences, ownerOptions, shared };
}
function partial(f) {
  f.prefs.beforeWrite = ({ name, operation }) => { if (name === MODE || (name === URI && operation === 'clear')) throw new Error('SYNTHETIC_PARTIAL_FAILURE'); };
}
const resolve = (owner, sequence, outcome = 'ACCEPTED') => owner.resolve({ sequence, outcome, userConfirmed: true });

test('construction is inert and requires explicit storage ACK and exclusive-writer contracts', () => {
  const f = fixture(); assert.equal(f.disk.writes, 0); assert.equal(f.disk.nativeFactories, 0);
  assert.throws(() => createSafetyOwner({ ...f.ownerOptions, store: f.store, storageAssurance: undefined }), /INVALID_SAFETY_OWNER_ADAPTER/);
  assert.throws(() => createSafetyOwner({ ...f.ownerOptions, store: f.store, assertExclusiveWriter: undefined }), /INVALID_SAFETY_OWNER_ADAPTER/);
});
test('confirmation is required before any store or native access', async () => {
  const f = fixture(); await assert.rejects(f.owner.choose({ ...choose, userConfirmed: false }), /SAFETY_CONFIRMATION_REQUIRED/);
  assert.equal(f.disk.writes, 0); assert.equal(f.disk.nativeFactories, 0);
});
test('durable intent precedes native preferences and terminal ACK precedes the result', async () => {
  const f = fixture(), result = await f.owner.choose(choose);
  assert.deepEqual(f.events, ['STORE_INTENT', 'NATIVE_COMPARE', 'STORE_TERMINAL']);
  assert.equal(result.code, 'APPLIED'); assert.equal(result.changed, true); assert.equal(result.blocked, false); assert.equal(result.status.active, true);
  assert.equal(result.sequence, 1); assert.equal(f.owner.diagnostics().document.pending, null);
  assert.equal(f.writes[0].pending.expected.prefs[URI].value, ''); assert.equal(f.prefs.users.get(URI), FAMILY);
});
test('failed pre-intent ACK causes zero native preference writes and blocks later choices', async () => {
  const f = fixture(); f.disk.onWrite = () => { throw new Error('SYNTHETIC_INTENT_FAILURE'); };
  const result = await f.owner.choose(choose);
  assert.equal(result.code, 'RECOVERY_REQUIRED'); assert.equal(result.reason, 'STORE_WRITE_FAILED'); assert.equal(result.changed, false);
  assert.equal(f.disk.nativeCalls, 0); assert.equal(f.prefs.writes().length, 0);
  await f.owner.choose({ ...choose, now: 11 }); assert.equal(f.disk.nativeCalls, 0);
  assert.equal(f.owner.diagnostics().document.pending.phase, 'INTENT');
});
test('native recovery is retained synchronously and persisted before returning a partial result', async () => {
  const f = fixture(); partial(f); const result = await f.owner.choose(choose);
  assert.deepEqual(f.events, ['STORE_INTENT', 'NATIVE_COMPARE', 'STORE_RECOVERY']);
  assert.equal(result.code, 'RECOVERY_REQUIRED'); assert.equal(result.changed, true); assert.deepEqual(result.applied_fields, [URI]);
  assert.equal(result.actual.prefs[URI].value, FAMILY); assert.equal(result.actual.prefs[MODE].value, 0); assert.equal(result.status.active, false);
  assert.equal(f.writes.at(-1).pending.recovery.sequence, result.sequence); assert.equal(f.owner.diagnostics().last_acknowledged.pending.phase, 'RECOVERY');
});
test('terminal persistence failure blocks without reapplying native writes', async () => {
  const f = fixture(); f.disk.onWrite = ({ count, commit }) => { if (count === 2) throw new Error('SYNTHETIC_TERMINAL_FAILURE'); commit(); };
  const result = await f.owner.choose(choose); assert.equal(result.code, 'RECOVERY_REQUIRED'); assert.equal(result.changed, true); assert.equal(result.status.active, true);
  assert.equal(f.disk.nativeCalls, 1); assert.equal(JSON.parse(f.disk.raw).pending.phase, 'INTENT');
  await f.owner.choose({ ...choose, now: 12 }); assert.equal(f.disk.nativeCalls, 1);
  f.disk.onWrite = ({ commit }) => commit(); const resolved = await resolve(f.owner, result.sequence);
  assert.equal(resolved.code, 'RESOLVED'); assert.equal(resolved.state.owned, null); assert.equal(f.disk.nativeCalls, 1);
});
test('persisted partial recovery rehydrates and cannot mutate before exact-sequence resolution', async () => {
  const f = fixture(); partial(f); const first = await f.owner.choose(choose), recreated = f.recreate();
  const startup = await recreated.initialize(); assert.equal(startup.code, 'RECOVERY_REQUIRED'); assert.equal(startup.reason, 'STARTUP_UNCERTAIN');
  assert.equal(startup.changed, true); assert.deepEqual(startup.applied_fields, [URI]);
  const count = f.prefs.writes().length; await recreated.choose({ ...choose, now: 20 }); assert.equal(f.prefs.writes().length, count);
  await assert.rejects(resolve(recreated, first.sequence - 1), /SAFETY_RESOLUTION_REQUIRED/);
  await assert.rejects(resolve(recreated, first.sequence + 1), /SAFETY_SEQUENCE_MISMATCH/);
  f.prefs.external(URI, OTHER); f.prefs.external(MODE, 5);
  const outcome = await resolve(recreated, first.sequence, 'EXTERNAL_CHANGED');
  assert.equal(outcome.code, 'RESOLVED'); assert.equal(f.prefs.users.get(URI), OTHER); assert.equal(f.prefs.users.get(MODE), 5); assert.equal(f.prefs.writes().length, count);
});
test('resolution intent ACK precedes native clear and terminal ACK precedes owner unblock', async () => {
  const f = fixture(); partial(f); const result = await f.owner.choose(choose); f.events.length = 0;
  const resolved = await resolve(f.owner, result.sequence);
  assert.deepEqual(f.events, ['STORE_RESOLUTION_INTENT', 'NATIVE_RESOLVE', 'STORE_TERMINAL']);
  assert.equal(resolved.blocked, false); assert.equal(resolved.state.owned, null); assert.equal(f.prefs.users.get(URI), FAMILY);
});
test('successful operations preserve high-water sequences before a later native failure', async () => {
  const f = fixture(); const first = await f.owner.choose(choose); assert.equal(first.sequence, 1);
  const disabled = await f.owner.choose({ checked: false, userConfirmed: true, now: 20 }); assert.equal(disabled.sequence, 2);
  partial(f); const failed = await f.owner.choose({ ...choose, now: 30 }); assert.equal(failed.sequence, 3);
  assert.equal(f.owner.diagnostics().document.pending.recovery.sequence, 3);
  await assert.rejects(resolve(f.owner, 1), /SAFETY_SEQUENCE_MISMATCH/);
});
test('user setting drift while intent is awaited prevents native writes and releases stale ownership', async () => {
  const f = fixture(); f.disk.onWrite = ({ count, commit }) => { commit(); if (count === 1) { f.prefs.external(URI, OTHER); f.prefs.external(MODE, 5); } };
  const result = await f.owner.choose(choose);
  assert.equal(result.code, 'PREFS_CHANGED'); assert.equal(result.blocked, false); assert.equal(f.prefs.writes().length, 0);
  assert.equal(f.prefs.users.get(URI), OTHER); assert.equal(f.prefs.users.get(MODE), 5); assert.equal(result.state.owned, null);
});
test('state/result is checked against actual preferences after terminal persistence await', async () => {
  const f = fixture(); f.disk.onWrite = ({ count, commit }) => { commit(); if (count === 2) { f.prefs.external(URI, OTHER); f.prefs.external(MODE, 5); } };
  const result = await f.owner.choose(choose);
  assert.equal(result.code, 'PREFS_CHANGED'); assert.equal(result.status.active, false); assert.equal(result.status.owned, false);
  assert.equal(result.actual.prefs[URI].value, OTHER); assert.equal(f.prefs.writes().length, 2);
});
test('newer settings during resolution await reject stale RESTORED without overwriting them', async () => {
  const f = fixture(); partial(f); const result = await f.owner.choose(choose);
  f.prefs.users.delete(URI); // Synthetic external restore to the original default, no owned write.
  f.disk.onWrite = ({ doc, commit }) => { commit(); if (doc.pending?.phase === 'RESOLUTION_INTENT') { f.prefs.external(URI, OTHER); f.prefs.external(MODE, 5); } };
  const before = f.prefs.writes().length, outcome = await resolve(f.owner, result.sequence, 'RESTORED');
  assert.equal(outcome.code, 'RECOVERY_REQUIRED'); assert.equal(outcome.reason, 'RESOLUTION_REJECTED');
  assert.equal(f.events.includes('NATIVE_RESOLVE'), false); assert.equal(f.prefs.users.get(URI), OTHER); assert.equal(f.prefs.users.get(MODE), 5); assert.equal(f.prefs.writes().length, before);
  assert.equal(JSON.parse(f.disk.raw).pending.phase, 'RESOLUTION_INTENT');
});
test('failed resolution-intent ACK never clears native recovery', async () => {
  const f = fixture(); partial(f); const first = await f.owner.choose(choose); f.events.length = 0;
  f.disk.onWrite = () => { throw new Error('SYNTHETIC_RESOLUTION_INTENT_FAILURE'); };
  const result = await resolve(f.owner, first.sequence);
  assert.equal(result.code, 'RECOVERY_REQUIRED'); assert.equal(result.reason, 'STORE_WRITE_FAILED'); assert.equal(f.events.includes('NATIVE_RESOLVE'), false);
});
test('failed terminal resolution ACK keeps owner blocked even after native clear', async () => {
  const f = fixture(); partial(f); const first = await f.owner.choose(choose);
  f.disk.onWrite = ({ doc, commit }) => { if (!doc.pending) throw new Error('SYNTHETIC_FINAL_FAILURE'); commit(); };
  const result = await resolve(f.owner, first.sequence); assert.equal(result.code, 'RECOVERY_REQUIRED');
  assert.equal(f.owner.diagnostics().document.pending.phase, 'RESOLUTION_INTENT');
  const compareCalls = f.disk.nativeCalls; await f.owner.choose({ ...choose, now: 20 }); assert.equal(f.disk.nativeCalls, compareCalls);
  const recreated = f.recreate(); assert.equal((await recreated.initialize()).code, 'RECOVERY_REQUIRED');
});
test('callback failure still leaves the already-acknowledged intent and actual changes visible', async () => {
  const f = fixture(); partial(f);
  const callbackFactory = createSafetyPreferenceFactory({ nativeCreate: createSafetyPreferences, prefs: f.prefs.prefs, dns: { clearCache() {} } });
  const options = { ...f.ownerOptions, cleanupPreferences: callbackFactory.cleanup, createPreferences({ onRecoveryRequired, ...rest }) {
    return callbackFactory.create({ ...rest, onRecoveryRequired(report) { onRecoveryRequired(report); throw new Error('SYNTHETIC_CALLBACK_FAILURE'); } });
  } };
  const owner = createSafetyOwner({ ...options, store: f.store }), result = await owner.choose(choose);
  assert.equal(result.code, 'RECOVERY_REQUIRED'); assert.equal(result.changed, true); assert.equal(owner.diagnostics().document.pending.recovery.writes.length, 1);
  assert.equal(JSON.parse(f.disk.raw).pending.phase, 'RECOVERY');
});
test('corrupt/unavailable storage is never overwritten and never permits native mutation', async () => {
  for (const corrupt of [true, false]) {
    const f = fixture(); if (corrupt) f.disk.raw = '{invalid'; else f.disk.readFail = true;
    const result = await f.owner.choose(choose); assert.equal(result.code, 'STORE_UNAVAILABLE'); assert.equal(result.blocked, true);
    assert.equal(f.disk.writes, 0); assert.equal(f.disk.nativeCalls, 0);
  }
});
test('credential/OHTTP presence and policy locks block changes without persisting protected values', async () => {
  for (const setup of [f => f.prefs.users.set('network.trr.credentials', 'synthetic-secret'), f => f.prefs.users.set('network.trr.ohttp.uri', 'synthetic-protected'), f => f.prefs.locks.add(URI)]) {
    const f = fixture(); setup(f); const result = await f.owner.choose(choose);
    assert.equal(f.prefs.writes().length, 0); assert.equal(f.disk.nativeCalls, 0); assert.equal(f.disk.writes, 0);
    assert.equal(JSON.stringify(result).includes('synthetic-secret'), false); assert.equal(JSON.stringify(result).includes('synthetic-protected'), false);
  }
});
test('schema rejects malformed journals, unknown fields, getters and mismatched safety plans', async () => {
  const f = fixture(); partial(f); await f.owner.choose(choose); const doc = JSON.parse(f.disk.raw);
  for (const mutate of [d => d.pending.sequence++, d => d.pending.mutations[0].name = 'network.trr.credentials', d => d.pending.mutations.push({ name: MODE, operation: 'set', value: 2 }),
    d => d.pending.next_state.checked = false, d => d.pending.recovery.writes[0].previous.value = OTHER,
    d => d.pending.recovery.writes[0].name = MODE, d => d.pending.extra = 'unknown', d => d.pending.phase = 'INTENT']) {
    const invalid = structuredClone(doc); mutate(invalid); assert.throws(() => f.schema.validate(invalid));
  }
  const getter = structuredClone(doc); let called = false;
  Object.defineProperty(getter.pending, 'sequence', { enumerable: true, get() { called = true; return 1; } });
  assert.throws(() => f.schema.validate(getter)); assert.equal(called, false);
});
test('sole-writer loss during awaited intent blocks all native preference writes', async () => {
  const f = fixture(); f.disk.onWrite = ({ commit }) => { commit(); f.disk.lease = false; };
  const result = await f.owner.choose(choose); assert.equal(result.code, 'RECOVERY_REQUIRED'); assert.equal(f.disk.nativeCalls, 0); assert.equal(f.prefs.writes().length, 0);
});
test('declining an unowned first-run offer persists only state and accesses no preferences', async () => {
  const f = fixture(); const result = await f.owner.choose({ checked: false, userConfirmed: true, now: 1 });
  assert.equal(result.code, 'UNCHANGED'); assert.equal(result.state.first_run_completed, true); assert.equal(result.state.checked, false);
  assert.equal(f.disk.nativeFactories, 0); assert.equal(f.prefs.writes().length, 0); assert.deepEqual(f.events, ['STORE_TERMINAL']);
});
test('busy barrier holds queued choices until the current terminal ACK', async () => {
  const f = fixture(), gate = deferred(), entered = deferred();
  f.disk.onWrite = async ({ count, commit }) => { commit(); if (count === 2) { entered.resolve(); await gate.promise; } };
  const first = f.owner.choose(choose); await entered.promise;
  const second = f.owner.choose({ checked: false, userConfirmed: true, now: 20 }); await Promise.resolve();
  assert.equal(f.disk.nativeCalls, 1); gate.resolve(); assert.equal((await first).code, 'APPLIED'); assert.equal((await second).code, 'RESTORED');
  assert.equal(f.disk.nativeCalls, 2);
});
test('crash before native call leaves durable INTENT uncertain even when prefs match the old snapshot', async () => {
  const f = fixture(), never = deferred(), entered = deferred();
  f.disk.onWrite = async ({ count, commit }) => { commit(); if (count === 1) { entered.resolve(); await never.promise; } };
  void f.owner.choose(choose); await entered.promise;
  const recreated = f.recreate({ crashed: true }), startup = await recreated.initialize(); assert.equal(startup.code, 'RECOVERY_REQUIRED'); assert.equal(startup.changed, false);
  assert.equal(f.disk.nativeCalls, 0); assert.equal(startup.unknown_fields.length, 2);
  await recreated.choose({ ...choose, now: 20 }); assert.equal(f.disk.nativeCalls, 0);
  f.disk.onWrite = ({ commit }) => commit(); assert.equal((await resolve(recreated, startup.sequence, 'RESTORED')).code, 'RESOLVED');
  assert.equal(f.prefs.writes().length, 0);
});
test('crash after partial native writes before recovery save leaves INTENT uncertain without adopting ownership', async () => {
  const f = fixture(), never = deferred(), entered = deferred(); partial(f);
  f.disk.onWrite = async ({ count, commit }) => { if (count === 2) { entered.resolve(); await never.promise; } else commit(); };
  void f.owner.choose(choose); await entered.promise;
  const recreated = f.recreate({ crashed: true }), startup = await recreated.initialize(); assert.equal(startup.code, 'RECOVERY_REQUIRED'); assert.equal(startup.changed, true);
  assert.deepEqual(startup.applied_fields, []); assert.deepEqual(startup.unknown_fields, [URI, MODE]);
  const writes = f.prefs.writes().length; f.prefs.external(MODE, 5); f.disk.onWrite = ({ commit }) => commit();
  const result = await resolve(recreated, startup.sequence); assert.equal(result.code, 'RESOLVED'); assert.equal(result.state.owned, null);
  assert.equal(f.prefs.users.get(MODE), 5); assert.equal(f.prefs.writes().length, writes);
});

test('caller request mutation across awaited load cannot change the captured choice', async () => {
  const f = fixture(), request = { ...choose }, resultPromise = f.owner.choose(request);
  request.checked = false; request.userConfirmed = false; request.now = 99;
  const result = await resultPromise; assert.equal(result.code, 'APPLIED'); assert.equal(result.state.checked, true); assert.equal(result.state.confirmed_at, 10);
});
test('caller resolution mutation across awaited save cannot change the recorded outcome', async () => {
  const f = fixture(); partial(f); const first = await f.owner.choose(choose); f.prefs.users.delete(URI);
  const gate = deferred(), entered = deferred();
  f.disk.onWrite = async ({ doc, commit }) => { commit(); if (doc.pending?.phase === 'RESOLUTION_INTENT') { entered.resolve(); await gate.promise; } };
  const request = { sequence: first.sequence, outcome: 'RESTORED', userConfirmed: true }, resultPromise = f.owner.resolve(request);
  await entered.promise; request.outcome = 'ACCEPTED'; request.sequence++; request.userConfirmed = false; gate.resolve();
  assert.equal((await resultPromise).code, 'RESOLVED'); assert.equal(f.writes.at(-2).pending.resolution.outcome, 'RESTORED');
});
test('unchanged MODE drift during a URI-only write is detected after the terminal ACK', async () => {
  const f = fixture(); f.prefs.users.set(MODE, 3);
  f.disk.onWrite = ({ count, commit }) => { commit(); if (count === 2) f.prefs.external(MODE, 5); };
  const result = await f.owner.choose(choose); assert.equal(result.code, 'PREFS_CHANGED'); assert.equal(result.status.active, false);
  assert.equal(result.state.owned, null); assert.equal(JSON.parse(f.disk.raw).state.owned, null);
});
test('clear-only restore drift during terminal save is detected without adopting user settings', async () => {
  const f = fixture(); await f.owner.choose(choose); const initialWrites = f.disk.writes;
  f.disk.onWrite = ({ count, commit }) => { commit(); if (count === initialWrites + 2) f.prefs.external(MODE, 5); };
  const result = await f.owner.choose({ checked: false, userConfirmed: true, now: 20 });
  assert.equal(result.code, 'PREFS_CHANGED'); assert.equal(result.state.owned, null); assert.equal(f.prefs.users.get(MODE), 5);
});
test('custom array prototypes cannot execute inherited validation or serialization hooks', async () => {
  const f = fixture(); partial(f); await f.owner.choose(choose); const doc = JSON.parse(f.disk.raw); let called = false;
  const proto = Object.create(Array.prototype); proto.map = () => { called = true; return []; }; proto.toJSON = () => { called = true; return []; };
  Object.setPrototypeOf(doc.pending.mutations, proto); assert.throws(() => f.schema.validate(doc), /INVALID_SAFETY_OWNER/); assert.equal(called, false);
});
test('repeated observer removal failures retain one shared handle and block new adapters', async () => {
  const f = fixture(), remove = f.prefs.prefs.removeObserver; let fail = true;
  f.prefs.prefs.removeObserver = (...args) => { if (fail) throw new Error('SYNTHETIC_CLEANUP_FAILURE'); return remove(...args); };
  const first = await f.owner.choose(choose); assert.equal(first.code, 'NATIVE_CLEANUP_REQUIRED'); assert.equal(first.blocked, true);
  assert.equal(f.prefs.observers.size, 1); const calls = f.disk.nativeCalls;
  for (let i = 0; i < 4; i++) await f.owner.choose({ ...choose, now: 20 + i });
  assert.equal(f.disk.nativeCalls, calls); assert.equal(f.prefs.observers.size, 1); assert.equal(f.shared.diagnostics().cleanup_pending, true);
  fail = false; const status = await f.owner.status(); assert.equal(status.blocked, false); assert.equal(f.prefs.observers.size, 0);
});

test('own-data snapshots ignore proxy value hooks when capturing a request', async () => {
  const f = fixture(); let gets = 0;
  const request = new Proxy({ ...choose }, { get(target, name) { gets++; return name === 'userConfirmed' ? false : target[name]; } });
  const result = await f.owner.choose(request); assert.equal(result.code, 'APPLIED'); assert.equal(gets, 0);
});

test('zero-mutation confirmation refreshes actual status after terminal save drift', async () => {
  const f = fixture(); f.prefs.users.set(URI, FAMILY); f.prefs.users.set(MODE, 3);
  f.disk.onWrite = ({ commit }) => { commit(); f.prefs.external(MODE, 5); };
  const result = await f.owner.choose(choose); assert.equal(result.code, 'PREFS_CHANGED'); assert.equal(result.actual.prefs[MODE].value, 5);
  assert.equal(result.status.active, false); assert.equal(f.disk.nativeCalls, 0); assert.equal(f.prefs.writes().length, 0);
});

test('RESTORED resolution releases original ownership if settings drift during its terminal save', async () => {
  const f = fixture(); await f.owner.choose(choose); const appliedState = f.owner.diagnostics().document.state;
  // Disable fails after a partial write; user restores the original owned pair.
  f.prefs.beforeWrite = ({ name, operation, value }) => { if (name === MODE || (name === URI && operation === 'set' && value === FAMILY)) throw new Error('SYNTHETIC_RESTORE_FAILURE'); };
  const failed = await f.owner.choose({ checked: false, userConfirmed: true, now: 20 });
  assert.equal(failed.code, 'RECOVERY_REQUIRED'); f.prefs.beforeWrite = null; f.prefs.external(URI, FAMILY); f.prefs.external(MODE, 3);
  f.disk.onWrite = ({ doc, commit }) => { commit(); if (!doc.pending && doc.state.owned !== null) f.prefs.external(MODE, 5); };
  const resolved = await resolve(f.owner, failed.sequence, 'RESTORED'); assert.equal(resolved.code, 'RESOLVED');
  assert.notEqual(appliedState.owned, null); assert.equal(resolved.state.owned, null); assert.equal(JSON.parse(f.disk.raw).state.owned, null);
  assert.equal(f.prefs.users.get(MODE), 5);
});
test('bounded storage can retain the largest plausible Unicode recovery and resolution records', async () => {
  const f = fixture(), uri = suffix => 'https://synthetic.example/' + suffix.repeat(2000);
  const previous = { [URI]: { value: uri('漢'), has_user_value: true, locked: false }, [MODE]: { value: 2, has_user_value: true, locked: false } };
  const applied = { [URI]: { value: FAMILY, has_user_value: true, locked: false }, [MODE]: { value: 3, has_user_value: true, locked: false } };
  f.disk.raw = JSON.stringify(f.schema.validate({ version: 1, sequence: 0, state: { version: 1, first_run_completed: true, checked: true, confirmed_at: 1, owned: { previous, applied } }, pending: null }));
  const expected = uri('界'); f.prefs.users.set(URI, expected); f.prefs.users.set(MODE, 5);
  f.prefs.beforeWrite = ({ name, value }) => { if (name === MODE || (name === URI && value === expected)) throw new Error('SYNTHETIC_FAILURE'); };
  const result = await f.owner.choose(choose); assert.equal(result.code, 'RECOVERY_REQUIRED');
  f.prefs.external(URI, uri('語')); const resolved = await resolve(f.owner, result.sequence, 'EXTERNAL_CHANGED'); assert.equal(resolved.code, 'RESOLVED');
  const resolution = f.writes.find(d => d.pending?.phase === 'RESOLUTION_INTENT'), bytes = new TextEncoder().encode(JSON.stringify(resolution, null, 2) + '\n').byteLength;
  assert.ok(bytes > 32768); assert.ok(bytes < SAFETY_STORE_CAP); assert.equal(SAFETY_STORE_CAP, 65536);
});

test('observed Settings drift permanently releases ownership before a later same-value choice', async () => {
  const f = fixture(); await f.owner.choose(choose); f.prefs.external(MODE, 5);
  const status = await f.owner.status(); assert.equal(status.state.owned, null); assert.equal(JSON.parse(f.disk.raw).state.owned, null);
  f.prefs.external(MODE, 3); const before = f.prefs.writes().length;
  const disabled = await f.owner.choose({ checked: false, userConfirmed: true, now: 20 });
  assert.equal(disabled.changed, false); assert.equal(f.prefs.writes().length, before); assert.equal(f.prefs.users.get(MODE), 3);
});
test('startup Settings drift disowns only metadata and never restores user preferences', async () => {
  const f = fixture(); await f.owner.choose(choose); f.prefs.external(URI, OTHER); f.prefs.external(MODE, 5);
  const before = f.prefs.writes().length, status = await f.recreate().initialize();
  assert.equal(status.state.owned, null); assert.equal(JSON.parse(f.disk.raw).state.owned, null); assert.equal(f.prefs.writes().length, before);
  assert.equal(f.prefs.users.get(URI), OTHER); assert.equal(f.prefs.users.get(MODE), 5);
});

test('status disown-save failure refreshes actual metadata and blocks further writes', async () => {
  const f = fixture(); await f.owner.choose(choose); f.prefs.external(MODE, 5);
  f.disk.onWrite = () => { f.prefs.external(URI, OTHER); f.prefs.external(MODE, 2); throw new Error('SYNTHETIC_METADATA_FAILURE'); };
  const result = await f.owner.status(); assert.equal(result.code, 'STORE_UNAVAILABLE'); assert.equal(result.blocked, true);
  assert.equal(result.actual.prefs[URI].value, OTHER); assert.equal(result.actual.prefs[MODE].value, 2);
  const before = f.prefs.writes().length; await f.owner.choose({ ...choose, now: 20 }); assert.equal(f.prefs.writes().length, before);
});
test('untrusted request/lease failures expose only fixed error codes', async () => {
  const f = fixture(), invalid = new Proxy({ ...choose }, { ownKeys() { throw new Error('arbitrary synthetic detail'); } });
  await assert.rejects(f.owner.choose(invalid), { code: 'INVALID_SAFETY_OWNER', message: 'INVALID_SAFETY_OWNER' });
  const owner = createSafetyOwner({ ...f.ownerOptions, store: f.store, assertExclusiveWriter() { throw new Error('arbitrary lease detail'); } });
  assert.equal((await owner.choose(choose)).code, 'STORE_UNAVAILABLE'); assert.equal(f.disk.nativeCalls, 0);
});
