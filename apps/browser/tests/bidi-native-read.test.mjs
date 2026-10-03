import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeckoBiDiReadSession as createNativeReadSession, createBiDiAllocationBudget } from '../chrome/GeckoBiDiReadSession.sys.mjs';

const createGeckoBiDiReadSession = (options = {}) => createNativeReadSession({ setTimer: setTimeout, clearTimer: clearTimeout, allocationBudget: createBiDiAllocationBudget(), ...options });
const tick = () => new Promise((resolve) => setImmediate(resolve));
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jVd8AAAAASUVORK5CYII=';

function tab(overrides = {}) {
  const result = { tab_id: 't_1', url: 'http://localhost:3000/app', title: 'Synthetic app', active: true,
    project_id: 'project1', userContextId: 2, engine: 'gecko', private: false, document_id: '123', ...overrides };
  result.browsingContext ??= { isContent: true, parent: null, isDiscarded: false, usePrivateBrowsing: false,
    currentWindowGlobal: { innerWindowId: result.document_id, isCurrentGlobal: true, isClosed: false, documentURI: { spec: result.url } } };
  return result;
}
function nativeFixture(overrides = {}) {
  const calls = [];
  let destroyed = 0;
  let created = 0;
  class WebDriverSession {
    static SESSION_FLAG_BIDI = 'bidi';
    constructor(caps, flags) { calls.push({ caps, flags: [...flags] }); created++; }
    async execute(module, command, params) { calls.push({ module, command, params }); return overrides.execute?.() ?? { data: PNG }; }
    destroy() { destroyed++; if (overrides.destroyThrows) throw new Error('synthetic cleanup failure'); }
  }
  const modules = { WebDriverSession, hasActiveWebDriverSession: () => false,
    getNavigableManager: async () => ({ getIdForBrowsingContext: () => 'native-uuid' }),
    RemoteAgent: { enabled: false, running: false, allowSystemAccess: false }, Marionette: { enabled: false, running: false } };
  return { modules, calls, counts: () => ({ created, destroyed }) };
}

const rejected = async (promise, code) => assert.rejects(promise, (error) => error.code === code);

test('real BiDi command shape uses viewport PNG, TLS validation and no socket capability', async () => {
  const native = nativeFixture();
  const reader = createGeckoBiDiReadSession({ loadModules: async () => native.modules });
  assert.deepEqual(await reader.capture(tab()), { data_base64: PNG });
  assert.deepEqual(native.calls, [
    { caps: { acceptInsecureCerts: false, unhandledPromptBehavior: 'ignore' }, flags: ['bidi'] },
    { module: 'browsingContext', command: 'captureScreenshot', params: { context: 'native-uuid', origin: 'viewport', format: { type: 'image/png' } } },
  ]);
  assert.deepEqual(native.counts(), { created: 1, destroyed: 1 });
});
for (const [label, mutate] of [
  ['existing WebDriver session', (m) => { m.hasActiveWebDriverSession = () => true; }],
  ['RemoteAgent running', (m) => { m.RemoteAgent.running = true; }],
  ['RemoteAgent enabled', (m) => { m.RemoteAgent.enabled = true; }],
  ['system access', (m) => { m.RemoteAgent.allowSystemAccess = true; }],
  ['Marionette running', (m) => { m.Marionette.running = true; }],
  ['Marionette enabled', (m) => { m.Marionette.enabled = true; }],
]) test(`native ownership refuses ${label} without constructing a session`, async () => {
  const native = nativeFixture(); mutate(native.modules);
  const reader = createGeckoBiDiReadSession({ loadModules: async () => native.modules });
  await rejected(reader.capture(tab()), 'UNAVAILABLE');
  assert.deepEqual(native.counts(), { created: 0, destroyed: 0 });
});
test('native context rejects private, stale and privileged contexts before session creation', async () => {
  for (const [change, code] of [
    [(t) => { t.browsingContext.usePrivateBrowsing = true; }, 'PRIVATE'],
    [(t) => { t.browsingContext.currentWindowGlobal.innerWindowId = 'different'; }, 'UNKNOWN_TAB'],
    [(t) => { t.browsingContext.isContent = false; }, 'UNAVAILABLE'],
    [(t) => { t.browsingContext.parent = {}; }, 'UNAVAILABLE'],
  ]) {
    const native = nativeFixture(); const value = tab(); change(value);
    await rejected(createGeckoBiDiReadSession({ loadModules: async () => native.modules }).capture(value), code);
    assert.equal(native.counts().created, 0);
  }
});
test('abort destroys owned native session and discards late screenshot', async () => {
  let resolve; const pending = new Promise((done) => { resolve = done; });
  const native = nativeFixture({ execute: () => pending });
  const reader = createGeckoBiDiReadSession({ loadModules: async () => native.modules });
  const controller = new AbortController(); const operation = reader.capture(tab(), { signal: controller.signal });
  await tick(); controller.abort(); await rejected(operation, 'NOT_APPROVED');
  resolve({ data: PNG }); await tick();
  assert.deepEqual(native.counts(), { created: 1, destroyed: 1 });
});
test('closing service rejects in-flight native capture immediately', async () => {
  const native = nativeFixture({ execute: () => new Promise(() => {}) });
  const reader = createGeckoBiDiReadSession({ loadModules: async () => native.modules });
  const operation = reader.capture(tab()); await tick(); reader.close();
  await rejected(operation, 'NOT_APPROVED');
  assert.equal(native.counts().destroyed, 1);
});
test('timeout tears down native session and overlapping captures are busy', async () => {
  let expire;
  const native = nativeFixture({ execute: () => new Promise(() => {}) });
  const reader = createGeckoBiDiReadSession({ loadModules: async () => native.modules, setTimer: (fn) => { expire = fn; return 1; }, clearTimer: () => {} });
  const pending = reader.capture(tab()); await tick();
  await rejected(reader.capture(tab()), 'BUSY'); expire(); await rejected(pending, 'TIMEOUT');
  assert.equal(native.counts().destroyed, 1);
});
test('revocation during module loading never constructs a native session', async () => {
  let finish;
  const native = nativeFixture(); const reader = createGeckoBiDiReadSession({ loadModules: () => new Promise((resolve) => { finish = resolve; }) });
  const pending = reader.capture(tab()); reader.close(); await rejected(pending, 'NOT_APPROVED');
  finish(native.modules); await tick(); assert.equal(native.counts().created, 0);
});
test('cleanup failure suppresses success and permanently closes the service', async () => {
  const native = nativeFixture({ destroyThrows: true });
  const reader = createGeckoBiDiReadSession({ loadModules: async () => native.modules });
  await rejected(reader.capture(tab()), 'UNAVAILABLE');
  await rejected(reader.capture(tab()), 'NOT_APPROVED');
});

test('default native factory imports Gecko system timers rather than Window globals', async () => {
  const prior = globalThis.ChromeUtils; const imports = []; const native = nativeFixture();
  globalThis.ChromeUtils = { importESModule: (uri) => { imports.push(uri); return { setTimeout, clearTimeout }; } };
  try {
    const reader = createNativeReadSession({ loadModules: async () => native.modules, allocationBudget: createBiDiAllocationBudget() });
    assert.deepEqual(await reader.capture(tab()), { data_base64: PNG });
    assert.deepEqual(imports, ['resource://gre/modules/Timer.sys.mjs', 'resource://gre/modules/Timer.sys.mjs']);
  } finally {
    if (prior === undefined) delete globalThis.ChromeUtils; else globalThis.ChromeUtils = prior;
  }
});
test('failed timer setup invalidates delayed module loading without leaking a native session', async () => {
  let finish; const native = nativeFixture();
  const reader = createGeckoBiDiReadSession({ setTimer: () => { throw new Error('synthetic timer failure'); },
    loadModules: () => new Promise((resolve) => { finish = resolve; }) });
  await rejected(reader.capture(tab()), 'UNAVAILABLE');
  finish(native.modules); await tick(); assert.equal(native.counts().created, 0);
});

test('native child-handler allocation is capped per unchanged document and across the process', async () => {
  const allocationBudget = createBiDiAllocationBudget({ perDocument: 2, perProcess: 3 });
  const native = nativeFixture(); const unchanged = tab();
  const capture = (value) => createGeckoBiDiReadSession({ allocationBudget, loadModules: async () => native.modules }).capture(value);
  await capture(unchanged); await capture(unchanged);
  await rejected(capture(unchanged), 'UNAVAILABLE');
  await capture(tab({ document_id: '456' }));
  await rejected(capture(tab({ document_id: '789' })), 'UNAVAILABLE');
  assert.deepEqual(native.counts(), { created: 3, destroyed: 3 });
});
test('native allocation budgets reject raised caps and count failed constructors conservatively', async () => {
  assert.throws(() => createBiDiAllocationBudget({ perDocument: 17 }));
  assert.throws(() => createBiDiAllocationBudget({ perProcess: 129 }));
  const allocationBudget = createBiDiAllocationBudget({ perDocument: 1, perProcess: 1 });
  const native = nativeFixture(); native.modules.WebDriverSession = class { static SESSION_FLAG_BIDI = 'bidi'; constructor() { throw new Error('synthetic partial constructor failure'); } };
  const options = { allocationBudget, loadModules: async () => native.modules };
  await rejected(createGeckoBiDiReadSession(options).capture(tab()), 'UNAVAILABLE');
  const clean = nativeFixture(); options.loadModules = async () => clean.modules;
  await rejected(createGeckoBiDiReadSession(options).capture(tab()), 'UNAVAILABLE');
  assert.equal(clean.counts().created, 0);
});
