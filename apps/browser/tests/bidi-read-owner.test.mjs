import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createGeckoBiDiReadSession as createReader, createBiDiAllocationBudget } from '../chrome/GeckoBiDiReadSession.sys.mjs';
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const rejects = (promise, code) => assert.rejects(promise, error => error.code === code);
const PNG = 'synthetic-base64';
function tab() {
  return { url: 'http://127.0.0.1:3000/fixture', document_id: '123',
    browsingContext: { isContent: true, parent: null, isDiscarded: false, usePrivateBrowsing: false,
      currentWindowGlobal: { innerWindowId: '123', isCurrentGlobal: true, isClosed: false,
        documentURI: { spec: 'http://127.0.0.1:3000/fixture' } } } };
}
function fixture(options = {}) {
  const counts = { created: 0, destroyed: 0, executed: 0, manager: 0 };
  class WebDriverSession {
    static SESSION_FLAG_BIDI = 'bidi';
    constructor() { counts.created++; options.construct?.(); }
    execute() { counts.executed++; return options.execute?.() ?? Promise.resolve({ data: PNG }); }
    destroy() { counts.destroyed++; return options.destroy?.(); }
  }
  const modules = { WebDriverSession, hasActiveWebDriverSession: () => false,
    getNavigableManager: () => { counts.manager++; return options.manager?.() ?? Promise.resolve({ getIdForBrowsingContext: () => 'native-id' }); },
    RemoteAgent: { enabled: false, running: false, allowSystemAccess: false },
    Marionette: { enabled: false, running: false } };
  const reader = (extra = {}) => createReader({ loadModules: async () => modules, allocationBudget: createBiDiAllocationBudget(),
    setTimer: setTimeout, clearTimer: clearTimeout, ...extra });
  return { modules, counts, reader };
}
const ownership = [
  ['RemoteAgent.enabled', (m, value) => { m.RemoteAgent.enabled = value; }],
  ['RemoteAgent.running', (m, value) => { m.RemoteAgent.running = value; }],
  ['RemoteAgent.allowSystemAccess', (m, value) => { m.RemoteAgent.allowSystemAccess = value; }],
  ['Marionette.enabled', (m, value) => { m.Marionette.enabled = value; }],
  ['Marionette.running', (m, value) => { m.Marionette.running = value; }],
  ['hasActiveWebDriverSession', (m, value) => { m.hasActiveWebDriverSession = () => value; }],
];
for (const [name, set] of ownership) for (const value of [undefined, null, 0, '', 'false']) {
  test(`unknown ${name} ${String(value)} refuses before allocation or tracking`, async () => {
    const f = fixture(); set(f.modules, value); let claims = 0;
    const reader = f.reader({ allocationBudget: { claim() { claims++; }, quarantine() { return true; } } });
    await rejects(reader.capture(tab()), 'UNAVAILABLE');
    assert.equal(claims, 0); assert.deepEqual(f.counts, { created: 0, destroyed: 0, executed: 0, manager: 0 });
    assert.equal(await reader.close(), true);
  });
}
test('ownership predicate reentrant close cannot allocate', async () => {
  const f = fixture(); let reader;
  f.modules.hasActiveWebDriverSession = () => { reader.close(); return false; };
  reader = f.reader(); await rejects(reader.capture(tab()), 'NOT_APPROVED');
  assert.equal(f.counts.created, 0); assert.equal(await reader.close(), true);
});
test('allocation callback reentrant close cannot construct', async () => {
  const f = fixture(); let reader; let claims = 0;
  reader = f.reader({ allocationBudget: { claim() { claims++; reader.close(); }, quarantine() { return true; } } });
  await rejects(reader.capture(tab()), 'NOT_APPROVED');
  assert.equal(claims, 1); assert.equal(f.counts.created, 0); assert.equal(await reader.close(), true);
});
test('late native owner returned by reentrant constructor is retained and destroyed', async () => {
  const disposal = deferred(); let reader;
  const f = fixture({ construct: () => reader.close(), destroy: () => disposal.promise }); reader = f.reader();
  await rejects(reader.capture(tab()), 'NOT_APPROVED');
  let closed = false; const receipt = reader.close().then(value => { closed = true; return value; });
  await tick(); assert.equal(closed, false); assert.equal(f.counts.destroyed, 1); assert.equal(f.counts.executed, 0);
  disposal.resolve(); assert.equal(await receipt, true);
});
for (const point of ['manager', 'execute']) test(`native agents starting during ${point} refuse command or publication`, async () => {
  const wait = deferred(); const f = fixture({ [point]: () => wait.promise }); const reader = f.reader();
  const capture = reader.capture(tab()); await tick(); f.modules.RemoteAgent.running = true;
  wait.resolve(point === 'manager' ? { getIdForBrowsingContext: () => 'native-id' } : { data: PNG });
  await rejects(capture, 'UNAVAILABLE'); assert.equal(f.counts.executed, point === 'manager' ? 0 : 1);
  assert.equal(f.counts.destroyed, 1); assert.equal(await reader.close(), true);
});
test('throwing destroy retains exact owner for explicit retry', async () => {
  let fail = true; const f = fixture({ destroy: () => { if (fail) throw new Error('synthetic failure'); } }); const reader = f.reader();
  await rejects(reader.capture(tab()), 'UNAVAILABLE'); assert.equal(f.counts.destroyed, 1);
  await rejects(reader.close(), 'UNAVAILABLE'); assert.equal(f.counts.destroyed, 2);
  fail = false; assert.equal(await reader.close(), true); assert.equal(f.counts.destroyed, 3);
  assert.equal(await reader.close(), true); assert.equal(f.counts.destroyed, 3);
  await rejects(reader.capture(tab()), 'NOT_APPROVED');
});
test('async destruction suppresses screenshot and true close until settled', async () => {
  const disposal = deferred(); const f = fixture({ destroy: () => disposal.promise }); const reader = f.reader();
  let published = false; const capture = reader.capture(tab()).then(value => { published = true; return value; });
  await tick(); assert.equal(published, false); assert.equal(f.counts.destroyed, 1);
  const rejectedCapture = rejects(capture, 'NOT_APPROVED'); let closed = false;
  const receipt = reader.close().then(value => { closed = true; return value; }); await rejectedCapture;
  await tick(); assert.equal(closed, false); disposal.resolve(); assert.equal(await receipt, true); assert.equal(published, false);
});
test('rejected async destroy is retained for retry and cannot publish', async () => {
  let fail = true; const f = fixture({ destroy: () => fail ? Promise.reject(new Error('synthetic rejection')) : Promise.resolve() }); const reader = f.reader();
  await rejects(reader.capture(tab()), 'UNAVAILABLE'); assert.equal(f.counts.destroyed, 1);
  fail = false; assert.equal(await reader.close(), true); assert.equal(f.counts.destroyed, 2);
});
test('ignored close cancels immediately, observes failures, and permits explicit retry', async () => {
  const wait = deferred(); let fail = true; const f = fixture({ execute: () => wait.promise,
    destroy: () => { if (fail) throw new Error('synthetic failure'); } }); const reader = f.reader();
  const events = []; const unhandled = error => events.push(error); process.on('unhandledRejection', unhandled);
  try {
    const capture = reader.capture(tab()); await tick(); reader.close(); await rejects(capture, 'NOT_APPROVED'); await tick();
    assert.equal(f.counts.destroyed, 1); assert.deepEqual(events, []); fail = false;
    let closed = false; const receipt = reader.close().then(value => { closed = true; return value; }); await tick();
    assert.equal(closed, false); assert.equal(f.counts.destroyed, 2);
    wait.resolve({ data: PNG }); assert.equal(await receipt, true); assert.deepEqual(events, []);
  } finally { process.removeListener('unhandledRejection', unhandled); }
});
test('cancelled command remains busy and close pending until its late settlement', async () => {
  const wait = deferred(); const f = fixture({ execute: () => wait.promise }); const reader = f.reader();
  const abort = new AbortController(); const capture = reader.capture(tab(), { signal: abort.signal }); await tick();
  abort.abort(); await rejects(capture, 'NOT_APPROVED'); await rejects(reader.capture(tab()), 'BUSY');
  let closed = false; const receipt = reader.close().then(value => { closed = true; return value; }); await tick(); assert.equal(closed, false);
  wait.reject(new Error('late native failure')); assert.equal(await receipt, true); assert.equal(f.counts.destroyed, 1);
});
test('timed out command keeps cleanup pending instead of attesting native cancellation', async () => {
  const wait = deferred(); const f = fixture({ execute: () => wait.promise }); let expire;
  const reader = f.reader({ setTimer: fn => { expire = fn; return 1; }, clearTimer() {} });
  const capture = reader.capture(tab()); await tick(); expire(); await rejects(capture, 'TIMEOUT');
  await rejects(reader.capture(tab()), 'BUSY'); let closed = false;
  const receipt = reader.close().then(value => { closed = true; return value; }); await tick(); assert.equal(closed, false);
  wait.resolve({ data: PNG }); assert.equal(await receipt, true); assert.equal(f.counts.destroyed, 1);
});
test('close during loading waits for exact late acquisition guard', async () => {
  const wait = deferred(); const f = fixture(); const reader = f.reader({ loadModules: () => wait.promise });
  const capture = reader.capture(tab()); let closed = false;
  const receipt = reader.close().then(value => { closed = true; return value; }); await rejects(capture, 'NOT_APPROVED');
  await tick(); assert.equal(closed, false); wait.resolve(f.modules); assert.equal(await receipt, true); assert.equal(f.counts.created, 0);
});
test('failed timer teardown is retained and retried only by explicit close', async () => {
  let fail = true; let clears = 0; const f = fixture(); const reader = f.reader({ setTimer: () => 7,
    clearTimer: () => { clears++; if (fail) throw new Error('synthetic timer failure'); } });
  await rejects(reader.capture(tab()), 'UNAVAILABLE'); assert.equal(clears, 1); assert.equal(f.counts.destroyed, 1);
  fail = false; assert.equal(await reader.close(), true); assert.equal(clears, 2); assert.equal(f.counts.destroyed, 1);
});
test('constructor uncertainty blocks positive close and replacement owners sharing the budget', async () => {
  const budget = createBiDiAllocationBudget(); const broken = fixture({ construct: () => { throw new Error('partial constructor'); } });
  const reader = broken.reader({ allocationBudget: budget }); await rejects(reader.capture(tab()), 'UNAVAILABLE');
  await rejects(reader.close(), 'UNAVAILABLE'); await rejects(reader.close(), 'UNAVAILABLE'); assert.equal(broken.counts.destroyed, 0);
  const replacement = fixture(); await rejects(replacement.reader({ allocationBudget: budget }).capture(tab()), 'UNAVAILABLE');
  assert.equal(replacement.counts.created, 0);
  assert.throws(() => budget.claim(tab().browsingContext.currentWindowGlobal), error => error.code === 'UNAVAILABLE');
});
test('claim-only allocation injection refuses rather than silently allowing replacement uncertainty', () => {
  assert.throws(() => createReader({ allocationBudget: { claim() {} } }), /allocationBudget/);
});
// Rebind only the four fixed native import specifiers to native-shaped in-memory
// modules. This exercises the otherwise unexported trusted default loader; no
// browser, listener, dynamic provider, or content script is executed.
const original = await readFile(new URL('../chrome/GeckoBiDiReadSession.sys.mjs', import.meta.url), 'utf8');
let defaultSerial = 0;
for (const enabled of [undefined, false, true, null, 0]) test(`trusted native loader normalization ${String(enabled)} remains closed`, async () => {
  const f = fixture(); const nativeMarionette = { _enabled: enabled, server: null,
    get enabled() { return this._enabled; }, get running() { return !!this.server && this.server.alive; } };
  const key = `__nativeReadFixture${++defaultSerial}`;
  globalThis[key] = { session: f.modules, remote: { RemoteAgent: f.modules.RemoteAgent }, marionette: { Marionette: nativeMarionette },
    manager: { NavigableManager: { getIdForBrowsingContext: () => 'native-id' } } };
  let source = original;
  for (const [specifier, slot] of [
    ['chrome://remote/content/shared/webdriver/Session.sys.mjs', 'session'],
    ['chrome://remote/content/components/RemoteAgent.sys.mjs', 'remote'],
    ['chrome://remote/content/components/Marionette.sys.mjs', 'marionette'],
    ['chrome://remote/content/shared/NavigableManager.sys.mjs', 'manager'],
  ]) {
    const needle = `import('${specifier}')`; assert.equal(source.split(needle).length, 2);
    source = source.replace(needle, `Promise.resolve(globalThis['${key}'].${slot})`);
  }
  try {
    const native = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
    const reader = native.createGeckoBiDiReadSession({ setTimer: setTimeout, clearTimer: clearTimeout });
    if (enabled === undefined || enabled === false) {
      assert.deepEqual(await reader.capture(tab()), { data_base64: PNG }); assert.equal(f.counts.created, 1);
      // Facade getters remain live: a later dynamic start is refused.
      nativeMarionette._enabled = true; await assert.rejects(reader.capture(tab()), error => error.code === 'UNAVAILABLE');
    } else { await assert.rejects(reader.capture(tab()), error => error.code === 'UNAVAILABLE'); assert.equal(f.counts.created, 0); }
    assert.equal(await reader.close(), true);
  } finally { delete globalThis[key]; }
});

test('native synchronous destroy reentry shares close promise and disposes once', async () => {
  const wait = deferred(); let reader, nested;
  const f = fixture({ execute: () => wait.promise, destroy: () => { nested = reader.close(); } }); reader = f.reader();
  const capture = reader.capture(tab()); await tick(); const receipt = reader.close();
  assert.equal(nested, receipt); await rejects(capture, 'NOT_APPROVED'); assert.equal(f.counts.destroyed, 1);
  assert.equal(reader.getState().pending_operations, 1); assert.equal(reader.getState().cleanup_incomplete, true);
  wait.resolve({ data: PNG }); assert.equal(await receipt, true);
  assert.deepEqual(reader.getState(), { closed: true, busy: false, pending_operations: 0, retained_owners: 0,
    pending_closes: 0, cleanup_incomplete: false, construction_uncertain: false });
});
test('failed destroy quarantines replacement budget even after native active map was cleared', async () => {
  const budget = createBiDiAllocationBudget(); let active = false; let fail = true;
  const old = fixture({ construct: () => { active = true; }, destroy: () => { active = false; if (fail) throw new Error('failure after map removal'); } });
  old.modules.hasActiveWebDriverSession = () => active;
  const reader = old.reader({ allocationBudget: budget }); await rejects(reader.capture(tab()), 'UNAVAILABLE');
  assert.equal(active, false); assert.equal(reader.getState().retained_owners, 1);
  const replacement = fixture(); await rejects(replacement.reader({ allocationBudget: budget }).capture(tab()), 'UNAVAILABLE');
  assert.equal(replacement.counts.created, 0); fail = false; assert.equal(await reader.close(), true);
  // Explicit owned cleanup succeeds; conservative native retention uncertainty
  // is not a permission to reset the process-owned allocation budget.
  await rejects(replacement.reader({ allocationBudget: budget }).capture(tab()), 'UNAVAILABLE');
  assert.equal(replacement.counts.created, 0);
});
test('failed abort listener removal prevents positive receipt until explicit retry', async () => {
  const f = fixture(); let fail = true; let removals = 0;
  const signal = { aborted: false, addEventListener() {}, removeEventListener() { removals++; if (fail) throw new Error('listener cleanup'); } };
  const reader = f.reader(); await rejects(reader.capture(tab(), { signal }), 'UNAVAILABLE');
  assert.equal(removals, 1); assert.equal(reader.getState().cleanup_incomplete, true);
  fail = false; assert.equal(await reader.close(), true); assert.equal(removals, 2); assert.equal(reader.getState().cleanup_incomplete, false);
});

test('synchronous destroy failure quarantines before replacement load reaction can allocate', async () => {
  const budget = createBiDiAllocationBudget(); const replacement = fixture(); let queued;
  const old = fixture({ destroy: () => {
    queued = replacement.reader({ allocationBudget: budget }).capture(tab());
    queued.catch(() => {});
    throw new Error('native failure after map removal and observer notification');
  } });
  await rejects(old.reader({ allocationBudget: budget }).capture(tab()), 'UNAVAILABLE');
  await rejects(queued, 'UNAVAILABLE'); assert.equal(replacement.counts.created, 0);
});

for (const field of ['isDiscarded', 'isClosed']) for (const state of [undefined, null, 0, '', 'false', true, 'missing']) {
  test(`native context ${field} ${String(state)} refuses before allocation or document identity/URL reads`, async () => {
    const value = tab(); const global = value.browsingContext.currentWindowGlobal;
    const target = field === 'isDiscarded' ? value.browsingContext : global;
    if (state === 'missing') delete target[field]; else target[field] = state;
    let identityReads = 0, urlReads = 0, claims = 0;
    Object.defineProperty(global, 'innerWindowId', { get() { identityReads++; return '123'; } });
    Object.defineProperty(global, 'documentURI', { get() { urlReads++; return { spec: value.url }; } });
    const budget = createBiDiAllocationBudget(); const f = fixture();
    const reader = f.reader({ allocationBudget: { claim(document) { claims++; budget.claim(document); }, quarantine: budget.quarantine } });
    await rejects(reader.capture(value), 'UNAVAILABLE');
    assert.equal(claims, 0); assert.equal(identityReads, 0); assert.equal(urlReads, 0);
    assert.deepEqual(f.counts, { created: 0, destroyed: 0, executed: 0, manager: 0 });
    assert.equal(await reader.close(), true);
  });
}
for (const field of ['isDiscarded', 'isClosed']) for (const point of ['manager', 'execute']) {
  test(`unknown ${field} after ${point} await refuses dispatch or screenshot publication`, async () => {
    const wait = deferred(); const f = fixture({ [point]: () => wait.promise }); const value = tab(); const reader = f.reader();
    const capture = reader.capture(value); await tick();
    const target = field === 'isDiscarded' ? value.browsingContext : value.browsingContext.currentWindowGlobal;
    target[field] = undefined;
    wait.resolve(point === 'manager' ? { getIdForBrowsingContext: () => 'native-id' } : { data: PNG });
    await rejects(capture, 'UNAVAILABLE'); assert.equal(f.counts.executed, point === 'manager' ? 0 : 1);
    assert.equal(f.counts.destroyed, 1); assert.equal(await reader.close(), true);
  });
}
