import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafetyPreferences } from '../chrome/SafetyPreferences.sys.mjs';
import { applySafetyChoice, DEFAULT_SAFETY_STATE, FAMILY_DOH_URI, safetyStatus } from '../../../packages/contexts/src/safety-choice.mjs';

const URI = 'network.trr.uri', MODE = 'network.trr.mode';
const FAMILY = 'https://family.cloudflare-dns.com/dns-query';
const OTHER = 'https://resolver.example/dns-query';
const declared = [URI, MODE];
function fixture() {
  const defaults = new Map([[URI, ''], [MODE, 0], ['network.trr.credentials', ''],
    ['network.trr.use_ohttp', false], ['network.trr.ohttp.uri', '']]);
  const users = new Map(), locks = new Set(), observers = new Set(), log = [], cache = [], reports = [];
  let writeCount = 0;
  const f = { defaults, users, locks, observers, log, cache, reports, beforeWrite: null, afterWrite: null,
    onCache: null, onRead: null, failDefault: false, onRecovery: null };
  function effective(n) { return locks.has(n) || !users.has(n) ? defaults.get(n) : users.get(n); }
  function typed(n, type, defaultOnly = false) {
    log.push({ method: `get${type}`, name: n, defaultOnly });
    if (n === 'network.trr.credentials' || n === 'network.trr.ohttp.uri') throw new Error('FORBIDDEN_SECRET_READ');
    f.onRead?.(n, defaultOnly);
    if (defaultOnly && f.failDefault) throw new Error('DEFAULT_READ_FAILED');
    const v = defaultOnly ? defaults.get(n) : effective(n);
    if (typeof v !== type) throw new Error('WRONG_TYPE');
    return v;
  }
  function prefType(n, defaultOnly = false) {
    const v = defaultOnly ? defaults.get(n) : effective(n);
    return typeof v === 'string' ? 32 : typeof v === 'number' && Number.isInteger(v) ? 64 : typeof v === 'boolean' ? 128 : 0;
  }
  function notify(n) { for (const o of [...observers]) o.observe(null, 'nsPref:changed', n); }
  function write(n, operation, value, external = false) {
    if (!external) { writeCount++; log.push({ method: 'write', name: n, operation, value }); f.beforeWrite?.({ name: n, operation, value, count: writeCount }); }
    const before = effective(n), had = users.has(n);
    // Model pinned Gecko's nonsticky user-slot normalization, including hidden locked writes.
    if (operation === 'clear' || value === defaults.get(n)) users.delete(n); else users.set(n, value);
    if (!locks.has(n) && (before !== effective(n) || had !== users.has(n))) notify(n);
    if (!external) f.afterWrite?.({ name: n, operation, value, count: writeCount });
  }
  const prefs = {
    getPrefType: n => prefType(n), getStringPref: n => typed(n, 'string'), getIntPref: n => typed(n, 'number'), getBoolPref: n => typed(n, 'boolean'),
    prefHasUserValue(n) { log.push({ method: 'hasUser', name: n }); return users.has(n); },
    prefIsLocked(n) { log.push({ method: 'locked', name: n }); return locks.has(n); },
    setStringPref: (n, v) => write(n, 'set', v), setIntPref: (n, v) => write(n, 'set', v), clearUserPref: n => write(n, 'clear'),
    getDefaultBranch(root) {
      assert.equal(root, '');
      return { getPrefType: n => prefType(n, true), getStringPref: n => typed(n, 'string', true), getIntPref: n => typed(n, 'number', true) };
    },
    addObserver(root, observer, weak) { assert.equal(root, 'network.trr.'); assert.equal(weak, false); observers.add(observer); },
    removeObserver(root, observer) { assert.equal(root, 'network.trr.'); observers.delete(observer); },
  };
  const dns = { clearCache(includeTrr) { assert.equal(includeTrr, true); cache.push(includeTrr); f.onCache?.(cache.length); } };
  f.prefs = prefs; f.adapter = createSafetyPreferences({ prefs, dns, onRecoveryRequired(report) {
    reports.push(report); return f.onRecovery ? f.onRecovery(report) : true;
  } });
  f.external = (n, v) => write(n, 'set', v, true);
  f.lock = n => { locks.add(n); notify(n); };
  f.writes = () => log.filter(v => v.method === 'write');
  f.batch = () => f.adapter.compareAndApply(f.adapter.snapshot(), [{ name: URI, operation: 'set', value: FAMILY }, { name: MODE, operation: 'set', value: 3 }]);
  return f;
}
function applied(f) { assert.equal(f.users.get(URI), FAMILY); assert.equal(f.users.get(MODE), 3); }
function restored(f) { assert.equal(f.users.has(URI), false); assert.equal(f.users.has(MODE), false); }

test('construction is inert and recovery reporting is mandatory', () => {
  const f = fixture(); assert.equal(f.log.length, 0); assert.equal(f.cache.length, 0);
  assert.throws(() => createSafetyPreferences({ prefs: f.prefs, dns: { clearCache() {} } }), /INVALID_SAFETY_ADAPTER/);
});
test('snapshot is frozen and reads no credential or OHTTP URI string', () => {
  const f = fixture(), s = f.adapter.snapshot();
  assert.deepEqual(Object.keys(s.prefs), declared); assert.equal(Object.isFrozen(s.guards), true);
  assert.equal(Object.values(s.guards).some(Boolean), false);
  assert.equal(f.log.some(x => ['getstring', 'getnumber', 'getboolean'].includes(x.method) && ['network.trr.credentials', 'network.trr.ohttp.uri'].includes(x.name)), false);
  assert.throws(() => { s.prefs[URI].value = OTHER; }, TypeError);
});
test('wrong native types fail instead of being masked by optional defaults', () => {
  const f = fixture(); f.defaults.set(MODE, '0'); assert.throws(() => f.adapter.snapshot(), /PREF_TYPE_MISMATCH/); assert.equal(f.writes().length, 0);
});
test('complete batch mutates only URI and mode and clears the DNS cache with TRR', () => {
  const f = fixture(); assert.equal(f.batch(), true); applied(f);
  assert.deepEqual(f.writes().map(x => x.name), declared); assert.deepEqual(f.cache, [true]);
  assert.deepEqual(f.adapter.diagnostics().last, { code: 'APPLIED', changed: true }); assert.equal(f.observers.size, 0);
});
test('core requires explicit confirmation and unchecked first run performs no adapter access', () => {
  const f = fixture(); assert.throws(() => applySafetyChoice({ prefs: f.adapter, checked: true, now: 1 }), /explicit confirmation required/);
  const result = applySafetyChoice({ prefs: f.adapter, checked: false, userConfirmed: true, now: 1 });
  assert.equal(result.state.first_run_completed, true); assert.equal(result.changed, false); assert.equal(f.log.length, 0);
});
test('confirmed core choice owns the pair and disabling restores exact user-branch state', () => {
  const f = fixture(); f.users.set(URI, OTHER); f.users.set(MODE, 2);
  const enable = applySafetyChoice({ prefs: f.adapter, checked: true, userConfirmed: true, now: 10 });
  assert.equal(enable.changed, true); applied(f); assert.equal(safetyStatus(enable.state, f.adapter.snapshot()).owned, true);
  const disable = applySafetyChoice({ prefs: f.adapter, state: enable.state, checked: false, userConfirmed: true, now: 20 });
  assert.equal(disable.reason, 'RESTORED'); assert.equal(disable.state.owned, null); assert.equal(f.users.get(URI), OTHER); assert.equal(f.users.get(MODE), 2);
  assert.deepEqual(f.cache, [true, true]);
});
test('current policy locks, credential presence, bootstrap and OHTTP guards prevent mutation', () => {
  for (const setup of [f => f.locks.add(URI), f => f.users.set('network.trr.credentials', 'synthetic'),
    f => f.defaults.set('network.trr.bootstrapAddr', '192.0.2.1'), f => f.defaults.set('network.trr.use_ohttp', true),
    f => f.users.set('network.trr.ohttp.uri', 'synthetic')]) {
    const f = fixture(); setup(f); assert.equal(f.batch(), false); assert.equal(f.writes().length, 0);
  }
});
test('stale complete snapshots cannot write and undeclared mutations cannot write', () => {
  const f = fixture(), before = f.adapter.snapshot(); f.external(MODE, 5);
  assert.equal(f.adapter.compareAndApply(before, [{ name: URI, operation: 'set', value: FAMILY }]), false);
  assert.throws(() => f.adapter.compareAndApply(f.adapter.snapshot(), [{ name: 'unrelated.pref', operation: 'clear' }]), /INVALID_SAFETY_MUTATIONS/);
  assert.equal(f.writes().length, 0);
});
test('failure before the second write restores the first write without recovery residue', () => {
  const f = fixture(); f.beforeWrite = ({ name, operation }) => { if (name === MODE && operation === 'set') throw new Error('SYNTHETIC_WRITE_FAILURE'); };
  assert.equal(f.batch(), false); restored(f); assert.equal(f.reports.length, 0); assert.deepEqual(f.cache, [true]);
  assert.equal(f.adapter.diagnostics().last.changed, false);
});
test('setter throwing after writing is verified and both own fields are restored', () => {
  const f = fixture(); f.afterWrite = ({ name, operation }) => { if (name === MODE && operation === 'set') throw new Error('SYNTHETIC_POST_WRITE_FAILURE'); };
  assert.equal(f.batch(), false); restored(f); assert.equal(f.reports.length, 0); assert.deepEqual(f.cache, [true]);
});
test('failed rollback leaves an inspectable report and blocks writes until explicit acknowledgement', () => {
  const f = fixture(); f.beforeWrite = ({ name, operation }) => {
    if (name === MODE || (name === URI && operation === 'clear')) throw new Error('SYNTHETIC_FAILURE');
  };
  assert.equal(f.batch(), false); assert.equal(f.reports.length, 1);
  const report = f.adapter.diagnostics().recovery;
  assert.equal(report.code, 'RECOVERY_REQUIRED'); assert.equal(Object.isFrozen(report.writes[0].applied), true);
  assert.deepEqual(report.writes, [{ name: URI, previous: { value: '', has_user_value: false }, applied: { value: FAMILY, has_user_value: true }, visibility: 'known' }]);
  const writes = f.writes().length; assert.equal(f.batch(), false); assert.equal(f.writes().length, writes);
  assert.throws(() => f.adapter.resolveRecovery({ acknowledged: false }), /RECOVERY_ACK_REQUIRED/);
  assert.throws(() => f.adapter.resolveRecovery({ acknowledged: true, sequence: report.sequence - 1, resolution: 'ACCEPTED' }), /RECOVERY_SEQUENCE_MISMATCH/);
  f.external(URI, OTHER); assert.equal(f.adapter.resolveRecovery({ acknowledged: true, sequence: report.sequence, resolution: 'EXTERNAL_CHANGED' }).resolved, true);
  assert.equal(f.users.get(URI), OTHER); assert.equal(f.writes().length, writes); assert.equal(f.adapter.diagnostics().recovery, null);
});
test('recovery callback failure cannot erase the journal or unblock writes', () => {
  const f = fixture(); f.beforeWrite = ({ name, operation }) => { if (name === MODE || operation === 'clear') throw new Error('FAIL'); };
  f.onRecovery = () => false;
  assert.throws(() => f.batch(), /RECOVERY_REPORT_FAILED/);
  assert.equal(f.adapter.diagnostics().recovery.writes.length, 1); const count = f.writes().length;
  assert.equal(f.batch(), false); assert.equal(f.writes().length, count); assert.equal(f.observers.size, 0);
});
test('default getter failure during rollback reports unknown residue instead of dropping the journal', () => {
  const f = fixture(); f.afterWrite = ({ name }) => { if (name === URI) f.failDefault = true; };
  f.beforeWrite = ({ name }) => { if (name === MODE) throw new Error('FAIL'); };
  assert.equal(f.batch(), false); assert.equal(f.reports.length, 1);
  assert.equal(f.reports[0].writes[0].name, URI); assert.equal(f.reports[0].writes[0].visibility, 'unknown');
  assert.equal(f.users.get(URI), FAMILY); assert.equal(f.adapter.diagnostics().last.code, 'RECOVERY_REQUIRED');
});
test('a reentrant user mode choice is preserved as a coherent group and residual URI is reported', () => {
  const f = fixture(); f.afterWrite = ({ name, operation }) => { if (name === URI && operation === 'set') f.external(MODE, 5); };
  assert.equal(f.batch(), false); assert.equal(f.users.get(MODE), 5); assert.equal(f.users.get(URI), FAMILY);
  assert.equal(f.writes().length, 1); assert.equal(f.reports[0].external_change, true);
  assert.deepEqual(f.reports[0].writes.map(x => x.name), [URI]);
  f.external(URI, OTHER); f.adapter.resolveRecovery({ acknowledged: true, sequence: f.reports[0].sequence, resolution: 'EXTERNAL_CHANGED' }); assert.equal(f.users.get(URI), OTHER); assert.equal(f.users.get(MODE), 5);
});
test('a reentrant user URI choice is never reported as the adapter own value or overwritten', () => {
  const f = fixture(); f.afterWrite = ({ name, operation }) => { if (name === MODE && operation === 'set') f.external(URI, OTHER); };
  assert.equal(f.batch(), false); assert.equal(f.users.get(URI), OTHER); assert.equal(f.users.get(MODE), 3);
  assert.deepEqual(f.reports[0].writes.map(x => x.name), [MODE]); assert.equal(f.writes().length, 2);
});
test('reentrant policy lock reports hidden-value uncertainty without clearing locked user values', () => {
  const f = fixture(); f.afterWrite = ({ name, operation }) => { if (name === URI && operation === 'set') f.lock(URI); };
  assert.equal(f.batch(), false); assert.equal(f.users.get(URI), FAMILY); assert.equal(f.writes().length, 1);
  assert.equal(f.reports[0].writes[0].visibility, 'unknown'); assert.equal(f.adapter.snapshot().prefs[URI].locked, true);
});
test('preference changes reentered by cache clearing are detected and user settings remain intact', () => {
  const f = fixture(); f.onCache = count => { if (count === 1) f.external(MODE, 5); };
  assert.equal(f.batch(), false); assert.equal(f.users.get(MODE), 5); assert.equal(f.users.get(URI), FAMILY);
  assert.deepEqual(f.reports[0].writes.map(x => x.name), [URI]); assert.deepEqual(f.cache, [true, true]);
});
test('cache clearing failure restores preferences and separately reports cache uncertainty', () => {
  const f = fixture(); f.onCache = count => { if (count === 1) throw new Error('SYNTHETIC_CACHE_FAILURE'); };
  assert.equal(f.batch(), false); restored(f); assert.equal(f.reports[0].cache_uncertain, true); assert.deepEqual(f.reports[0].writes, []);
  assert.equal(f.adapter.diagnostics().last.code, 'RECOVERY_REQUIRED'); assert.deepEqual(f.cache, [true, true]);
});
test('Gecko default normalization is not falsely accepted as the core predicted user slot', () => {
  const f = fixture(); f.defaults.set(MODE, 3); f.users.set(MODE, 2);
  assert.equal(f.batch(), false); assert.equal(f.users.get(MODE), 2); assert.equal(f.users.has(URI), false); assert.equal(f.reports.length, 0);
});
test('restoration clears only owned user values and exposes a newer default without overwriting it', () => {
  const f = fixture(); const enable = applySafetyChoice({ prefs: f.adapter, checked: true, userConfirmed: true, now: 1 });
  assert.equal(enable.changed, true); f.defaults.set(URI, OTHER);
  const disable = applySafetyChoice({ prefs: f.adapter, state: enable.state, checked: false, userConfirmed: true, now: 2 });
  assert.equal(disable.changed, true); assert.equal(f.users.has(URI), false); assert.equal(f.adapter.snapshot().prefs[URI].value, OTHER);
});
test('reentrant adapter invocation is rejected and disposed adapters cannot mutate', () => {
  const f = fixture(); let nested;
  f.afterWrite = ({ name }) => { if (name === URI) nested = f.adapter.compareAndApply(f.adapter.snapshot(), [{ name: MODE, operation: 'set', value: 5 }]); };
  assert.equal(f.batch(), true); assert.equal(nested, false); applied(f);
  f.adapter.dispose(); assert.throws(() => f.adapter.snapshot(), /SAFETY_ADAPTER_DISPOSED/); assert.equal(f.adapter.compareAndApply({}, []), false);
});
test('post-write read failures retain a bounded non-secret unknown journal', () => {
  const f = fixture(); f.afterWrite = ({ name }) => { if (name === URI) f.onRead = n => { if (n === URI) throw new Error('SYNTHETIC_READ_FAILURE'); }; };
  assert.equal(f.batch(), false); const recovery = f.adapter.diagnostics().recovery;
  assert.equal(recovery.writes.length, 1); assert.equal(recovery.writes[0].visibility, 'unknown');
  assert.equal(JSON.stringify(recovery).includes('credentials'), false); assert.equal(JSON.stringify(recovery).includes('192.0.2.'), false);
});
test('the prior core catch alone cannot signal residual writes; separate owner report remains available', () => {
  const f = fixture(); f.beforeWrite = ({ name, operation }) => { if (name === MODE || operation === 'clear') throw new Error('FAIL'); };
  const result = applySafetyChoice({ prefs: f.adapter, state: DEFAULT_SAFETY_STATE, checked: true, userConfirmed: true, now: 1 });
  assert.equal(result.changed, false); assert.equal(result.state.owned, null);
  assert.equal(f.users.get(URI), FAMILY); assert.equal(f.reports[0].code, 'RECOVERY_REQUIRED');
  assert.equal(f.adapter.diagnostics().last.changed, true); assert.equal(FAMILY_DOH_URI, FAMILY);
});

test('missing credential/OHTTP URI type metadata fails without reading either string', () => {
  for (const name of ['network.trr.credentials', 'network.trr.ohttp.uri']) {
    const f = fixture(); f.defaults.delete(name); assert.throws(() => f.adapter.snapshot(), /PREF_TYPE_MISMATCH/); assert.equal(f.writes().length, 0);
  }
});
test('failed observer cleanup retains one inactive handle and blocks registrations until retry succeeds', () => {
  const f = fixture(), original = f.prefs.removeObserver; let fail = true;
  f.prefs.removeObserver = (...args) => { if (fail) throw new Error('SYNTHETIC_CLEANUP_FAILURE'); return original(...args); };
  assert.equal(f.batch(), true); assert.equal(f.observers.size, 1);
  for (let i = 0; i < 20; i++) f.external(`network.trr.synthetic${i}`, i);
  const before = f.writes().length; assert.equal(f.batch(), false); assert.equal(f.writes().length, before); assert.equal(f.observers.size, 1);
  assert.equal(f.adapter.diagnostics().last.code, 'OBSERVER_CLEANUP_REQUIRED');
  fail = false; f.external(URI, OTHER); f.external(MODE, 5); assert.equal(f.batch(), true); assert.equal(f.observers.size, 0);
});
test('recovery requires matching sequence and an outcome consistent with actual settings', () => {
  const f = fixture(); f.beforeWrite = ({ name, operation }) => { if (name === MODE || operation === 'clear') throw new Error('FAIL'); };
  assert.equal(f.batch(), false); const sequence = f.reports[0].sequence;
  assert.throws(() => f.adapter.resolveRecovery({ acknowledged: true, sequence, resolution: 'RESTORED' }), /RECOVERY_NOT_RESTORED/);
  assert.throws(() => f.adapter.resolveRecovery({ acknowledged: true, sequence, resolution: 'EXTERNAL_CHANGED' }), /RECOVERY_NOT_EXTERNAL/);
  const accepted = f.adapter.resolveRecovery({ acknowledged: true, sequence, resolution: 'ACCEPTED' });
  assert.equal(accepted.actual.prefs[URI].value, FAMILY); assert.equal(f.users.get(URI), FAMILY);
  f.beforeWrite = null; f.external(URI, OTHER); f.external(MODE, 5);
  f.beforeWrite = ({ name, operation }) => { if (name === MODE || (name === URI && operation === 'set' && f.users.get(URI) === FAMILY)) throw new Error('FAIL_AGAIN'); };
  assert.equal(f.batch(), false); const second = f.adapter.diagnostics().recovery;
  assert.equal(second.sequence, sequence + 1);
  assert.throws(() => f.adapter.resolveRecovery({ acknowledged: true, sequence, resolution: 'ACCEPTED' }), /RECOVERY_SEQUENCE_MISMATCH/);
  assert.equal(f.adapter.diagnostics().recovery.sequence, second.sequence);
});
test('persisted recovery can rehydrate inertly and retain the write block after adapter recreation', () => {
  const f = fixture(); f.beforeWrite = ({ name, operation }) => { if (name === MODE || operation === 'clear') throw new Error('FAIL'); };
  assert.equal(f.batch(), false); const report = f.adapter.diagnostics().recovery, count = f.log.length;
  const recreated = createSafetyPreferences({ prefs: f.prefs, dns: { clearCache() { throw new Error('UNEXPECTED_DNS'); } }, onRecoveryRequired() { throw new Error('UNEXPECTED_REPORT'); }, pendingRecovery: JSON.parse(JSON.stringify(report)) });
  assert.equal(f.log.length, count); assert.equal(recreated.compareAndApply({}, []), false); assert.equal(recreated.diagnostics().recovery.sequence, report.sequence);
  assert.throws(() => createSafetyPreferences({ prefs: f.prefs, dns: { clearCache() {} }, onRecoveryRequired: () => true, pendingRecovery: { ...report, secret: 'synthetic' } }), /INVALID_SAFETY_PREFS/);
});
test('untrusted native exception text is mapped to fixed recovery codes', () => {
  const f = fixture(); f.beforeWrite = ({ name, operation }) => { if (name === MODE || operation === 'clear') { const e = new Error('synthetic arbitrary text'); e.code = 'arbitrary native detail'; throw e; } };
  assert.equal(f.batch(), false); assert.equal(f.reports[0].reason, 'PREF_WRITE_FAILED');
  assert.equal(JSON.stringify(f.reports[0]).includes('arbitrary'), false);
});

test('input getters and hidden unknown properties cannot execute during mutation validation', () => {
  const f = fixture(); let called = false;
  const mutation = { name: URI, get operation() { called = true; return 'set'; }, value: FAMILY };
  assert.throws(() => f.adapter.compareAndApply(f.adapter.snapshot(), [mutation]), /INVALID_SAFETY_PREFS/); assert.equal(called, false);
  const extra = { name: URI, operation: 'set', value: FAMILY }; Object.defineProperty(extra, 'hidden', { value: 'synthetic' });
  assert.throws(() => f.adapter.compareAndApply(f.adapter.snapshot(), [extra]), /INVALID_SAFETY_PREFS/); assert.equal(f.writes().length, 0);
});

test('pinned absent bootstrap default is allowed, while a wrongly typed configured bootstrap denies', () => {
  const f = fixture(); assert.equal(f.prefs.getPrefType('network.trr.bootstrapAddr'), 0);
  assert.equal(f.adapter.snapshot().guards.bootstrap_nonempty, false);
  assert.equal(f.log.some(x => x.method === 'getstring' && x.name === 'network.trr.bootstrapAddr'), false);
  f.defaults.set('network.trr.bootstrapAddr', 1); assert.throws(() => f.adapter.snapshot(), /PREF_TYPE_MISMATCH/);
});
