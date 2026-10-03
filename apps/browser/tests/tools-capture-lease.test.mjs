// Injected ownership tests only: no Gecko imports, actors, native sessions or UI.
import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32, deflateSync } from 'node:zlib';
import { createGeckoAgentTools, projectAgentServiceTools, AGENT_CAPTURE_LIMITS } from '../chrome/GeckoAgentTools.sys.mjs';
import { AgentToolError } from '../chrome/GeckoBiDiReadSession.sys.mjs';
import { createAgentViewportCapture } from '../chrome/AgentViewportCapture.sys.mjs';
import { createGeckoViewportPngBox } from '../chrome/GeckoViewportPngBox.sys.mjs';
import { parseViewportPng } from '../chrome/ViewportPngFormat.sys.mjs';
const SESSION = Object.freeze({ session: 's_0000000000000001', project_id: 'p_shaped', state: 'approved' });
const SECOND = Object.freeze({ session: 's_0000000000000002', project_id: null, state: 'approved' });
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const rejects = (promise, code) => assert.rejects(promise, error => error instanceof AgentToolError && error.code === code);
function header(width = 1, height = 1, bytes = 33) {
  const output = Buffer.alloc(bytes); Buffer.from([137,80,78,71,13,10,26,10]).copy(output);
  output.writeUInt32BE(13, 8); output.write('IHDR', 12); output.writeUInt32BE(width, 16); output.writeUInt32BE(height, 20);
  return output.toString('base64');
}
const image = (width = 1, height = 1, bytes = 33) => Object.freeze({ mime: 'image/png', width, height, data_base64: header(width, height, bytes) });
function timers() {
  let next = 0; const entries = new Map();
  return { setTimer(fn, ms) { const id = ++next; entries.set(id, { fn, ms }); return id; },
    clearTimer(id) { entries.delete(id); },
    fire(ms) { for (const [id, entry] of [...entries]) if (entry.ms === ms) { entries.delete(id); entry.fn(); } },
    get size() { return entries.size; } };
}
const descriptor = changes => Object.freeze({ tab_id: 't_1', url: 'https://synthetic.invalid/', title: 'Synthetic tab', active: true,
  project_id: 'p_shaped', private: false, engine: 'gecko', document_id: '7', userContextId: 2,
  binding_token: 'b_1', project_revision: 1, route_revision: 1, ...changes });
function fixture(overrides = {}) {
  const clock = timers(), records = [], owners = [];
  const calls = { tabs: 0, tab: 0, expected: 0, current: 0, factory: 0, capture: 0, close: 0, session: 0 };
  const f = { clock, records, owners, calls, expected: descriptor(), current: null, active: true, approved: true, image: image() };
  f.current = f.expected;
  const invoke = (key, args, fallback) => { calls[key]++; return overrides[key] ? overrides[key](f, ...args) : fallback(); };
  const deps = {
    getTabs: () => invoke('tabs', [], () => [f.current]), getActiveTab: () => f.current,
    getTab: id => invoke('tab', [id], () => id === f.current?.tab_id ? f.current : null),
    getProject: () => ({ project_id: 'p_shaped', name: 'Shaped', root: '/synthetic/shaped',
      apps: [{ app: null, environments: [{ name: 'dev', base_url: 'http://localhost:4450/' }] }], integrations: [] }),
    getConsoleErrors: () => ({ count: 1, messages: [{ level: 'error', text: 'Synthetic', source: '', line: 0xffffffff, at: Number.MAX_SAFE_INTEGER }] }),
    isSensitiveHost: () => false,
    isSessionActive: id => invoke('session', [id], () => f.approved),
    captureEnabled: true,
    getCaptureExpected: tab => invoke('expected', [tab], () => f.expected),
    isCaptureCurrent: (expected, request) => invoke('current', [expected, request], () => f.active && expected === f.expected
      && expected.url === f.current?.url && expected.document_id === f.current?.document_id
      && expected.project_id === f.current?.project_id && expected.userContextId === f.current?.userContextId
      && expected.binding_token === f.current?.binding_token && expected.route_revision === f.current?.route_revision),
    createCaptureOwner: (request, context) => invoke('factory', [request, context], () => {
      records.push({ request, context });
      const owner = Object.freeze({
        captureViewport(params, options) {
          assert.equal(params, request); assert.equal(options.signal, context.signal);
          return invoke('capture', [owner, request, context, options], () => f.image);
        },
        close() { return invoke('close', [owner, request, context], () => true); },
      });
      owners.push(owner); return owner;
    }),
    setTimer: clock.setTimer, clearTimer: clock.clearTimer, timeoutMs: 5000, cleanupTimeoutMs: 100,
    ...overrides.deps,
  };
  const tools = createGeckoAgentTools(deps);
  return Object.assign(f, { tools, deps, capture: (params = {}, options = {}, session = SESSION) =>
    tools.executeMethod('tabs.screenshot', { tab_id: f.current?.tab_id ?? 't_1', ...params }, session, options) });
}
async function expireCleanup(f) { for (let i = 0; i < 5; i++) { await tick(); f.clock.fire(100); } }

for (const configuration of [{ captureEnabled: false }, { captureEnabled: undefined }, { captureEnabled: {} },
  { getCaptureExpected: null }, { isCaptureCurrent: {} }, { createCaptureOwner: null }, { createCaptureOwner: {} }]) {
  test(`capture configuration refuses before metadata or acquisition: ${Object.keys(configuration)[0]}=${String(Object.values(configuration)[0])}`, async () => {
    const f = fixture({ deps: configuration });
    assert.equal(f.tools.isMethodAvailable('tabs.screenshot'), false);
    await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(f.calls.tab, 0); assert.equal(f.calls.expected, 0); assert.equal(f.calls.factory, 0);
    assert.equal(await f.tools.close(), true);
  });
}
test('no native defaults and explicit trusted timers/budget bounds are mandatory', () => {
  const f = fixture();
  for (const deps of [{ setTimer: undefined }, { clearTimer: null }, { timeoutMs: 0 }, { timeoutMs: 30001 }, { cleanupTimeoutMs: 5001 }])
    assert.throws(() => createGeckoAgentTools({ ...f.deps, ...deps }), TypeError);
  const tools = createGeckoAgentTools({ ...f.deps, captureEnabled: undefined });
  assert.equal(tools.isMethodAvailable('tabs.screenshot'), false);
});
test('canonical wire parameters reject extra purpose/height/bytes, accessors and invalid IDs without effects', async () => {
  const f = fixture();
  for (const params of [{ purpose: 'decision' }, { max_height: 1 }, { max_bytes: 1 }, { expected: f.expected }, { tab_id: 't_0' },
    { tab_id: 't_01' }, { tab_id: 't_1000000000000000' }, { max_width: 63 }, { max_width: 1921 }]) {
    await rejects(f.capture(params), 'INVALID_PARAMS');
  }
  let getter = 0; const params = { tab_id: 't_1' };
  Object.defineProperty(params, 'max_width', { enumerable: true, get() { getter++; return 1280; } });
  await rejects(f.tools.executeMethod('tabs.screenshot', params, SESSION), 'INVALID_PARAMS');
  assert.equal(getter, 0); assert.equal(f.calls.tab, 0); assert.equal(f.calls.factory, 0);
});
test('each request carries exact issued expected, bridge bounds, original signal and isolated authority', async () => {
  const f = fixture(), firstAbort = new AbortController(), secondAbort = new AbortController();
  const expected1 = f.expected;
  assert.equal((await f.capture({ max_width: 64 }, { signal: firstAbort.signal })).width, 1);
  const first = f.records[0];
  assert.equal(first.request.expected, expected1); assert.equal(first.context.requestSignal, firstAbort.signal);
  assert.ok(Object.isFrozen(first.request)); assert.ok(Object.isFrozen(first.context)); assert.ok(Object.isFrozen(first.context.session));
  assert.equal(first.context.signal.aborted, false); assert.notEqual(first.context.signal, firstAbort.signal);
  assert.deepEqual(first.request, { tab_id: 't_1', expected: expected1, purpose: 'bridge', max_width: 64, max_height: 16384, max_bytes: 2097152 });
  assert.equal(first.context.isActive(expected1, first.request), false, 'finished owner cannot reuse request authority');
  f.expected = descriptor({ tab_id: 't_2', document_id: '8', binding_token: 'b_2' }); f.current = f.expected;
  await f.capture({ max_width: 1920 }, { signal: secondAbort.signal }, SECOND);
  const second = f.records[1];
  assert.notEqual(second.request, first.request); assert.notEqual(second.context.signal, first.context.signal);
  assert.equal(second.request.expected, f.expected); assert.equal(second.request.max_width, 1920); assert.equal(first.request.max_width, 64);
  assert.equal(second.context.requestSignal, secondAbort.signal); assert.equal(second.context.session.session, SECOND.session);
  assert.equal(first.request.expected, expected1); assert.equal(f.calls.close, 2); assert.equal(f.tools.getState().busy, false);
});
test('busy first session cannot be overwritten by second request bounds or descriptor', async () => {
  const pending = deferred(); const f = fixture({ capture: () => pending.promise }); const first = f.capture({ max_width: 64 }); await tick();
  await rejects(f.capture({ max_width: 1920 }, {}, SECOND), 'BUSY');
  assert.equal(f.calls.factory, 1); assert.equal(f.records[0].request.max_width, 64); assert.equal(f.records[0].context.session.session, SESSION.session);
  pending.resolve(image()); await first; assert.equal(f.tools.getState().busy, false);
});
test('frozen unissued clone and unknown current predicates refuse before capture owner acquisition', async () => {
  const f = fixture({ expected: ctx => Object.freeze({ ...ctx.expected }) });
  await rejects(f.capture(), 'NOT_APPROVED'); assert.equal(f.calls.factory, 0);
  for (const current of [false, undefined, {}, Promise.resolve(true)]) {
    const g = fixture({ current: () => current }); await rejects(g.capture(), 'NOT_APPROVED'); assert.equal(g.calls.factory, 0);
  }
});
test('initial stale/private/chromium/current binding failures cause no capture owner effects', async () => {
  for (const [changes, code] of [[{ private: true }, 'PRIVATE'], [{ engine: 'chromium' }, 'UNAVAILABLE'],
    [{ userContextId: 4294967295 }, 'UNAVAILABLE']]) {
    const f = fixture(); f.current = descriptor(changes); f.expected = f.current;
    await rejects(f.capture(), code); assert.equal(f.calls.factory, 0);
  }
  const f = fixture(); f.expected = descriptor({ document_id: '8' });
  await rejects(f.capture(), 'UNKNOWN_TAB'); assert.equal(f.calls.factory, 0);
});
test('capture descriptor must be frozen data and accessor methods never run as admission', async () => {
  const f = fixture({ expected: ctx => ({ ...ctx.expected }) });
  await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(f.calls.factory, 0);
  let getter = 0, close = 0;
  const owner = { close() { close++; return true; }, get captureViewport() { getter++; return () => image(); } };
  const g = fixture({ factory: () => owner }); await rejects(g.capture(), 'UNAVAILABLE');
  assert.equal(getter, 0); assert.equal(close, 1); assert.equal(g.tools.getState().busy, false);
});
test('malformed returned owner stays retained when own close receipt is unavailable', async () => {
  let getter = 0; const owner = { captureViewport() { throw new Error('must not run'); }, get close() { getter++; return () => true; } };
  const f = fixture({ factory: () => owner }); await rejects(f.capture(), 'UNAVAILABLE');
  assert.equal(getter, 0); assert.equal(f.tools.getState().retained_owners, 1);
  await rejects(f.capture(), 'BUSY'); await rejects(f.tools.close(), 'UNAVAILABLE'); assert.equal(getter, 0);
  Object.defineProperty(owner, 'close', { value: () => true }); assert.equal(await f.tools.close(), true);
});
test('async close is awaited before image publication and exact pending close is coalesced', async () => {
  const pending = deferred(); const f = fixture({ close: () => pending.promise }); let published = false;
  const work = f.capture().then(value => { published = true; return value; }); await tick();
  assert.equal(f.calls.close, 1); assert.equal(published, false); assert.equal(f.tools.getState().pending_closes, 1);
  await rejects(f.capture(), 'BUSY'); pending.resolve(true); await work;
  assert.equal(published, true); assert.equal(f.calls.close, 1); assert.equal(f.tools.getState().retained_owners, 0);
});
for (const receipt of [false, undefined, {}, 1]) {
  test(`owner disposal requires literal true, retaining ${String(receipt)} and retrying exact owner`, async () => {
    const f = fixture({ close: ctx => ctx.calls.close === 1 ? receipt : true });
    await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(f.calls.close, 1); assert.equal(f.tools.getState().retained_owners, 1);
    await rejects(f.capture({}, {}, SECOND), 'BUSY'); assert.equal(await f.tools.close(), true);
    assert.equal(f.calls.close, 2); assert.equal(f.tools.getState().busy, false); await rejects(f.capture(), 'NOT_APPROVED');
  });
}
test('close rejection retains exact resource; explicit session release retries disposal', async () => {
  const seen = [];
  const f = fixture({ close: (ctx, owner) => { seen.push(owner); if (ctx.calls.close === 1) throw new Error('not a receipt'); return true; } });
  await rejects(f.capture(), 'UNAVAILABLE'); assert.equal(await f.tools.releaseSession(SESSION.session), true);
  assert.equal(seen.length, 2); assert.equal(seen[0], seen[1]); assert.equal(f.tools.getState().busy, false);
  await rejects(f.capture(), 'NOT_APPROVED'); assert.equal((await f.capture({}, {}, SECOND)).width, 1);
});
test('release synchronously aborts owned authority, awaits exact disposal and suppresses pending image', async () => {
  const pending = deferred(), closing = deferred(), external = new AbortController();
  const f = fixture({ capture: () => pending.promise, close: () => closing.promise }); const work = f.capture({}, { signal: external.signal });
  const failure = rejects(work, 'NOT_APPROVED'); await tick();
  const record = f.records[0]; assert.equal(record.context.isActive(record.request.expected, record.request), true);
  const release = f.tools.releaseSession(SESSION.session); const releaseResult = release.then(() => true);
  assert.equal(record.context.signal.aborted, true); assert.equal(external.signal.aborted, false);
  assert.equal(record.context.isActive(record.request.expected, record.request), false); assert.equal(f.calls.close, 1);
  pending.resolve(image()); closing.resolve(true); assert.equal(await releaseResult, true); await failure;
  assert.equal(f.tools.getState().busy, false);
});
test('real synchronous release callback may ignore rejected Promise without losing failed owner', async () => {
  const pending = deferred(); let failClose = true; const unhandled = [];
  const handler = error => unhandled.push(error); process.on('unhandledRejection', handler);
  try {
    const f = fixture({ capture: () => pending.promise, close: () => failClose ? false : true });
    const wrapper = projectAgentServiceTools(f.tools); const work = f.capture(); const failure = rejects(work, 'NOT_APPROVED'); await tick();
    wrapper.releaseSession(SESSION.session); // Same non-awaited callback shape as Service/Core.
    assert.equal(f.records[0].context.signal.aborted, true);
    pending.resolve(image()); await failure; await tick(); await tick();
    assert.deepEqual(unhandled, []); assert.equal(f.tools.getState().retained_owners, 1);
    await rejects(f.capture({}, {}, SECOND), 'BUSY'); failClose = false; assert.equal(await f.tools.close(), true);
  } finally { process.off('unhandledRejection', handler); }
});
test('external cancellation reaches exact owner context and late capture stays retained until settlement', async () => {
  const pending = deferred(), external = new AbortController(); const f = fixture({ capture: () => pending.promise });
  const work = f.capture({}, { signal: external.signal }); const failure = rejects(work, 'NOT_APPROVED'); await tick();
  external.abort(); assert.equal(f.records[0].context.signal.aborted, true); await expireCleanup(f); await failure;
  assert.equal(f.tools.getState().pending_operations, 1); assert.equal(f.calls.close, 1);
  await rejects(f.capture({}, {}, SECOND), 'BUSY'); pending.resolve(image()); await tick();
  assert.equal(f.tools.getState().busy, false); assert.equal(f.calls.capture, 1);
});
test('timeout during factory acquisition retains late owner, closes without capture, and retries failure', async () => {
  const pending = deferred(); let closes = 0;
  const owner = Object.freeze({ captureViewport() { throw new Error('late owner must not capture'); }, close() { closes++; return closes > 1; } });
  const f = fixture({ factory: () => pending.promise }); const work = f.capture(); const failure = rejects(work, 'TIMEOUT'); await tick();
  f.clock.fire(5000); await expireCleanup(f); await failure;
  assert.equal(f.tools.getState().pending_operations, 1); await rejects(f.capture({}, {}, SECOND), 'BUSY');
  pending.resolve(owner); await tick(); assert.equal(closes, 1); assert.equal(f.tools.getState().retained_owners, 1);
  assert.equal(await f.tools.close(), true); assert.equal(closes, 2); assert.equal(f.tools.getState().busy, false);
});
test('release while factory pending waits boundedly, retains late owner and records real late disposal', async () => {
  const pending = deferred(), closing = deferred(); let closes = 0, captures = 0;
  const owner = Object.freeze({ captureViewport() { captures++; return image(); }, close() { closes++; return closing.promise; } });
  const f = fixture({ factory: () => pending.promise }); const work = f.capture(); const failure = rejects(work, 'NOT_APPROVED'); await tick();
  const release = f.tools.releaseSession(SESSION.session); const releaseFailure = rejects(release, 'UNAVAILABLE');
  await expireCleanup(f); await releaseFailure; await failure; assert.equal(f.tools.getState().pending_operations, 1);
  pending.resolve(owner); await tick(); assert.equal(captures, 0); assert.equal(closes, 1);
  const close = f.tools.close(); await tick(); assert.equal(closes, 1); closing.resolve(true);
  assert.equal(await close, true); assert.equal(f.tools.getState().busy, false);
});
test('pending disposal times out without repeating close or accepting a late false receipt', async () => {
  const pending = deferred(); let attempt = 0;
  const f = fixture({ close: () => ++attempt === 1 ? pending.promise : true }); const work = f.capture(); const failure = rejects(work, 'UNAVAILABLE');
  await tick(); await expireCleanup(f); await failure;
  const close = f.tools.close(); const closeFailure = rejects(close, 'UNAVAILABLE'); await expireCleanup(f); await closeFailure;
  assert.equal(attempt, 1); assert.equal(f.tools.getState().pending_closes, 1);
  pending.resolve(false); await tick(); assert.equal(f.tools.getState().retained_owners, 1);
  assert.equal(await f.tools.close(), true); assert.equal(attempt, 2);
});
test('global close permanently rejects work while owned pending acquisition remains quarantined', async () => {
  const pending = deferred(); let closes = 0;
  const f = fixture({ factory: () => pending.promise }); const work = f.capture(); const failure = rejects(work, 'NOT_APPROVED'); await tick();
  const close = f.tools.close(); const closeFailure = rejects(close, 'UNAVAILABLE');
  assert.equal(f.tools.getState().closed, true); assert.equal(f.tools.isMethodAvailable('tabs.list'), false);
  await expireCleanup(f); await closeFailure; await failure; await rejects(f.capture({}, {}, SECOND), 'NOT_APPROVED');
  assert.deepEqual(await f.tools.listTabs(), []); assert.equal(await f.tools.getTab('t_1'), null);
  pending.resolve(Object.freeze({ captureViewport: () => image(), close: () => { closes++; return true; } })); await tick();
  assert.equal(closes, 1); assert.equal(await f.tools.close(), true);
});
for (const changes of [{ url: 'https://synthetic.invalid/next' }, { document_id: '8' }, { userContextId: 3 },
  { project_id: 'p_other' }, { binding_token: 'b_2' }, { route_revision: 2 }]) {
  test(`binding change while asynchronous disposal is pending suppresses publication: ${Object.keys(changes)[0]}`, async () => {
    const pending = deferred(); const f = fixture({ close: () => pending.promise }); const work = f.capture(); await tick();
    f.current = descriptor(changes); pending.resolve(true); await rejects(work, 'NOT_APPROVED');
    assert.equal(f.tools.getState().retained_owners, 0);
  });
}
test('lost session after owner close rejects with no await following final authority predicate', async () => {
  const f = fixture({ close: ctx => { ctx.approved = false; return true; } });
  await rejects(f.capture(), 'NOT_APPROVED'); assert.equal(f.calls.close, 1); assert.equal(f.tools.getState().busy, false);
  const g = fixture(); const clear = g.deps.clearTimer;
  const tools = createGeckoAgentTools({ ...g.deps, clearTimer(id) { clear(id); g.approved = false; } });
  await rejects(tools.executeMethod('tabs.screenshot', { tab_id: 't_1' }, SESSION), 'NOT_APPROVED');
});
test('raw/cap result validation still enforces both dimensions, pixels and decoded bytes', async () => {
  for (const [raw, code] of [[image(1281, 1), 'TOO_LARGE'], [image(1, 16385), 'TOO_LARGE'],
    [image(1920, 16384), null], [image(16384, 16384), 'TOO_LARGE'], [image(1, 1, 2097153), 'TOO_LARGE'],
    [{ ...image(), width: 2 }, 'UNAVAILABLE'], [{ ...image(), mime: 'text/plain' }, 'UNAVAILABLE']]) {
    const f = fixture(); f.image = raw;
    if (code) await rejects(f.capture(), code); else assert.equal((await f.capture({ max_width: 1920 })).height, 16384);
    assert.equal(f.calls.close, 1); assert.equal(f.tools.getState().busy, false);
  }
});
test('metadata/project/console compatibility and six-function wrapper preserve data firewall', async () => {
  const f = fixture(); const tools = projectAgentServiceTools(f.tools);
  assert.deepEqual(Object.keys(tools), ['isMethodAvailable', 'listTabs', 'getTab', 'executeMethod', 'confirmAction', 'releaseSession']);
  assert.ok(Object.isFrozen(tools)); assert.equal('close' in tools, false); assert.equal('getState' in tools, false);
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(tools))) assert.equal(typeof descriptor.value, 'function');
  assert.equal((await tools.listTabs())[0].private, false); assert.equal((await tools.getTab('t_1')).userContextId, 2);
  assert.equal('binding_token' in await tools.getTab('t_1'), false); assert.equal(tools.confirmAction(), false);
  assert.equal((await tools.executeMethod('project.info', {}, SESSION)).apps[0].app, null);
  const console = await tools.executeMethod('console.errors', { tab_id: 't_1' }, SESSION);
  assert.equal(console.messages[0].line, 0xffffffff); assert.equal(console.messages[0].at, Number.MAX_SAFE_INTEGER);
  f.current = descriptor({ userContextId: 4294967295 }); assert.deepEqual(await tools.listTabs(), []); assert.equal(await tools.getTab('t_1'), null);
  await rejects(tools.executeMethod('console.errors', { tab_id: 't_1' }, SESSION), 'UNAVAILABLE');
  assert.equal(await f.tools.close(), true);
});
test('read-only diagnostics do not touch trusted callbacks or expose request handles', async () => {
  const pending = deferred(); const f = fixture({ capture: () => pending.promise }); const work = f.capture(); await tick();
  const before = { ...f.calls }; for (let i = 0; i < 50; i++) assert.ok(Object.isFrozen(f.tools.getState()));
  assert.deepEqual(f.calls, before); assert.deepEqual(Object.keys(f.tools.getState()), ['closed','busy','pending_operations','retained_owners','pending_closes','cleanup_incomplete','released_sessions']);
  pending.resolve(image()); await work;
});
test('late factory rejection and arbitrary native exception text are consumed without publication', async () => {
  const pending = deferred(); const f = fixture({ factory: () => pending.promise }); const work = f.capture(); const failure = rejects(work, 'TIMEOUT'); await tick();
  f.clock.fire(5000); await expireCleanup(f); await failure; pending.reject(new Error('arbitrary hidden text')); await tick();
  assert.equal(f.tools.getState().busy, false);
  const g = fixture({ capture: () => { throw new Error('arbitrary hidden text'); } }); await rejects(g.capture(), 'UNAVAILABLE');
});
function chunk(type, bytes) {
  const name = Buffer.from(type), output = Buffer.alloc(bytes.length + 12);
  output.writeUInt32BE(bytes.length); name.copy(output, 4); bytes.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([name,bytes])), bytes.length + 8); return output;
}
function validPng(width, height) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  const scanlines = Buffer.alloc(height * (1 + width * 3));
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(scanlines)), chunk('IEND', Buffer.alloc(0))]).toString('base64');
}
test('composes actual pure capture and full PNG box modules using only fake leases/readers/ImageLib', async () => {
  const f = fixture(), counters = { lease: 0, validation: 0, release: 0, commit: 0, nativeCapture: 0, encode: 0, streamClose: 0, ownerClose: 0 };
  const input = validPng(2000, 1000); const records = [];
  const tools = createGeckoAgentTools({ ...f.deps, createCaptureOwner(request, context) {
    records.push({ request, context }); const lease = Object.freeze({ synthetic: true }); let retired = false;
    const png = createGeckoViewportPngBox({ loadTools: async () => ({
      images: {
        decodeImageFromArrayBuffer(buffer) { const parsed = parseViewportPng(Buffer.from(buffer).toString('base64')); return { width: parsed.width, height: parsed.height }; },
        encodeScaledImage(_container, mime, width, height) {
          assert.equal(mime, 'image/png'); counters.encode++; const data = Buffer.from(validPng(width, height), 'base64').toString('binary');
          return { data, close() { counters.streamClose++; } };
        },
      },
      createReader() { let stream, consumed = false; return {
        setInputStream(value) { stream = value; }, available: () => consumed ? 0 : stream.data.length,
        readBytes(length) { assert.equal(length, stream.data.length); consumed = true; return stream.data; }, close() { stream.close(); },
      }; },
    }) });
    const capture = createAgentViewportCapture({ isActive: context.isActive,
      beginReadLease(value, options) { assert.equal(value.expected, request.expected); assert.equal(options.signal.aborted, false); counters.lease++; return lease; },
      validateReadLease(value) { assert.equal(value, lease); assert.equal(retired, false); counters.validation++; return true; },
      releaseReadLease(value, received, options) {
        assert.equal(value, lease); assert.equal(received.expected, request.expected); counters.release++;
        if (options.commit) counters.commit++; retired = true; return true;
      },
      createNativeReadSession(value) { assert.equal(value.expected, request.expected); return Object.freeze({
        capabilities: Object.freeze({ viewportScreenshot: true, act: false, open: false }),
        capture(expected) { assert.equal(expected, request.expected); counters.nativeCapture++; return { data_base64: input }; }, close() { return true; },
      }); }, validatePng: png.validatePng, resizePng: png.resizePng,
      setTimer: f.clock.setTimer, clearTimer: f.clock.clearTimer, timeoutMs: 5000, cleanupTimeoutMs: 100,
    });
    return Object.freeze({ captureViewport: capture.captureViewport,
      async close() { counters.ownerClose++; const result = await capture.close(); const pngResult = png.close(); return result === true && pngResult === true; } });
  } });
  const result = await tools.executeMethod('tabs.screenshot', { tab_id: 't_1', max_width: 640 }, SESSION);
  assert.equal(result.width, 640); assert.equal(result.height, 320); assert.equal(parseViewportPng(result.data_base64).width, 640);
  assert.equal(records[0].request.expected, f.expected); assert.equal(records[0].request.purpose, 'bridge');
  assert.equal(counters.lease, 1); assert.equal(counters.commit, 1); assert.equal(counters.nativeCapture, 1);
  assert.equal(counters.encode, 3); assert.equal(counters.streamClose, 3); assert.equal(counters.ownerClose, 1);
  assert.equal(tools.getState().cleanup_incomplete, false); assert.equal(f.clock.size, 0); assert.equal(await tools.close(), true);
});
test('Service metadata functions return synchronous own data; async callbacks are refused', () => {
  const f = fixture(); const wrapper = projectAgentServiceTools(f.tools);
  assert.equal(Array.isArray(wrapper.listTabs()), true); assert.equal(wrapper.getTab('t_1').tab_id, 't_1');
  assert.equal(typeof wrapper.getTab('t_1').then, 'undefined');
  const g = fixture({ deps: { getTabs: () => Promise.resolve([]), getTab: () => Promise.resolve(descriptor()) } });
  assert.throws(() => g.tools.listTabs(), error => error.code === 'UNAVAILABLE'); assert.equal(g.tools.getTab('t_1'), null);
});
test('project-scoped session cannot acquire capture owner for a different tab project', async () => {
  const f = fixture(); f.expected = descriptor({ project_id: 'p_other' }); f.current = f.expected;
  await rejects(f.capture(), 'NOT_IN_PROJECT'); assert.equal(f.calls.expected, 0); assert.equal(f.calls.factory, 0);
  assert.equal((await f.capture({}, {}, SECOND)).width, 1);
});
for (const disposition of ['release', 'close', 'abort']) {
  test(`current predicate reentrant ${disposition} cannot return true into a native effect`, async () => {
    const external = new AbortController(); let once = false;
    const f = fixture({ current: ctx => {
      if (!once) { once = true; if (disposition === 'release') ctx.tools.releaseSession(SESSION.session);
        else if (disposition === 'close') ctx.tools.close(); else external.abort(); }
      return true;
    } });
    await rejects(f.capture({}, { signal: external.signal }), 'NOT_APPROVED'); assert.equal(f.calls.factory, 0); assert.equal(f.calls.capture, 0);
  });
}
test('session predicate reentrant release cannot approve an operation', async () => {
  let first = true;
  const f = fixture({ session: ctx => { if (first) { first = false; ctx.tools.releaseSession(SESSION.session); } return true; } });
  await rejects(f.capture(), 'NOT_APPROVED'); assert.equal(f.calls.tab, 0); assert.equal(f.calls.factory, 0);
});
test('final current predicate may revoke after prior disposal without publishing its true return', async () => {
  let afterClear = false, released = false; const f = fixture({ current: ctx => {
    if (afterClear && !released) { released = true; ctx.tools.releaseSession(SESSION.session); }
    return true;
  } });
  // Trigger only the final guard by setting the flag when the operation timer is cleared.
  const precise = f.deps.clearTimer;
  f.tools = createGeckoAgentTools({ ...f.deps, clearTimer(id) { precise(id); if (f.calls.close > 0 && f.clock.size === 0) afterClear = true; } });
  await rejects(f.tools.executeMethod('tabs.screenshot', { tab_id: 't_1' }, SESSION), 'NOT_APPROVED');
  assert.equal(f.calls.close, 1); assert.equal(released, true); assert.equal(f.tools.getState().busy, false);
});
test('strict boolean authority consumes rejecting genuine promises without invoking thenables', async () => {
  const unhandled = []; const handler = error => unhandled.push(error); process.on('unhandledRejection', handler);
  try {
    for (const callback of ['current','session']) {
      const f = fixture({ [callback]: () => Promise.reject(new Error('hidden authority error')) });
      await rejects(f.capture(), 'NOT_APPROVED'); assert.equal(f.calls.factory, 0);
    }
    let read = 0;
    const thenable = { get then() { read++; throw new Error('arbitrary thenable must not run'); } };
    const f = fixture({ current: () => thenable }); await rejects(f.capture(), 'NOT_APPROVED');
    assert.equal(read, 0); await tick(); await tick(); assert.deepEqual(unhandled, []);
  } finally { process.off('unhandledRejection', handler); }
});
test('synchronous metadata refuses genuine promises and own thenables without invoking getters or methods', async () => {
  let calls = 0;
  const values = [{ get then() { calls++; throw new Error('then getter must not run'); } },
    { then() { calls++; } }];
  for (const thenable of values) {
    const descriptors = Object.getOwnPropertyDescriptors(thenable);
    const tab = Object.defineProperties({ ...descriptor() }, descriptors);
    const f = fixture({ deps: { getTabs: () => thenable, getTab: () => tab } });
    assert.throws(() => f.tools.listTabs(), error => error.code === 'UNAVAILABLE'); assert.equal(f.tools.getTab('t_1'), null);
  }
  assert.equal(calls, 0);
  const unhandled = []; const handler = error => unhandled.push(error); process.on('unhandledRejection', handler);
  try {
    const f = fixture({ deps: { getTabs: () => Promise.reject(new Error('hidden')), getTab: () => Promise.reject(new Error('hidden')) } });
    assert.throws(() => f.tools.listTabs(), error => error.code === 'UNAVAILABLE'); assert.equal(f.tools.getTab('t_1'), null);
    await tick(); await tick(); assert.deepEqual(unhandled, []);
  } finally { process.off('unhandledRejection', handler); }
});
