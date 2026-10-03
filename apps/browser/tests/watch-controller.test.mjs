import test from 'node:test';
import assert from 'node:assert/strict';
import './support/chrome-modules.mjs';
const { createWatchController, passiveCopy } = await import('../chrome/WatchController.sys.mjs');
import { createWatch, validateWatchStore, DEFAULT_WATCH_STORE } from '../../../packages/contexts/src/watches.mjs';
import { JsonStore } from '../chrome/JsonStore.sys.mjs';
import { validateWatchRequest } from '../../../packages/provider-host/src/decision.mjs';

const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const flush = async () => { for (let i = 0; i < 70; i++) await Promise.resolve(); };
function makeWatch(overrides = {}) {
  return createWatch({ id: 'w_demo1', projectId: 'p_12345678', url: 'https://example.test/status?secret=synthetic',
    question: 'Is the synthetic fixture ready?', outcomes: [{ id: 'ready', label: 'Ready' }, { id: 'waiting', label: 'Waiting' }],
    now: 90000, userCreated: true, observation: 'address', consent: true, ...overrides });
}
function fixture({ liveAuthorized = true, watch = makeWatch(), watches = [watch], raw = null, hourlyLimit = 30, timeoutMs = 30000, omitAuthorization = false } = {}) {
  const f = { at: 100000, events: [], writes: 0, disk: raw ?? JSON.stringify({ version: 1, watches }), timers: new Map(), timerSeq: 0,
    budget: { calls: [] }, reservations: 0, budgetReads: 0, admissionReads: 0, visible: true, handles: [], leases: [],
    openGate: null, captureGate: null, showGate: null, resultGate: null, closeGate: null, writeGate: null, failWrites: false,
    closeFails: false, hideFails: false, failProvider: false, resultOverride: null, duringBudget: null,
    pre: { scope_epoch: 1, context_id: 'normal_fixture', context_registered: true, context_normal: true,
      project_id: watch.project_id, project_updated_at: 90000, root_revision: 1, container_id: 42, container_generation: 1,
      consent_granted: true, is_private: false, is_blocked: false, url_allowed: true },
    document: { browsing_context_id: 100, inner_window_id: 200, complete_top_document: true, document_url: watch.url,
      is_error_document: false, channel_status: 0, failed_channel_status: null, password_clear: true, subframes_safe: true } };
  f.storage = { read: async () => f.disk, write: async text => {
    f.events.push(['write']); if (f.writeGate) await f.writeGate.promise;
    if (f.failWrites || f.failAfterWrites !== undefined && f.writes >= f.failAfterWrites) throw new Error('synthetic write failure'); f.disk = text; f.writes++;
  } };
  f.store = new JsonStore({ storage: f.storage, validate: validateWatchStore, empty: DEFAULT_WATCH_STORE });
  f.timerApi = { setTimeout(fn, delay) { const id = ++f.timerSeq; f.timers.set(id, { fn, due: f.at + delay }); return id; }, clearTimeout(id) { f.timers.delete(id); } };
  f.advance = async ms => {
    f.at += ms;
    for (let count = 0; count < 30; count++) {
      const ready = [...f.timers.entries()].filter(([, timer]) => timer.due <= f.at).sort((a, b) => a[1].due - b[1].due)[0];
      if (!ready) break;
      f.timers.delete(ready[0]); ready[1].fn(); await flush();
      if (count === 29) throw new Error('timer loop');
    }
    await flush();
  };
  f.controller = createWatchController({ store: f.store, clock: () => { if (f.throwClock) throw new Error('synthetic clock failure'); return f.at; }, requestId: () => `fixture:${++f.requestSeq}`,
    timers: f.timerApi, ...(omitAuthorization ? {} : { liveAuthorized }), hourlyLimit, timeoutMs,
    budget: { limit() { return f.liveHourlyLimit ?? hourlyLimit; }, snapshot() { f.budgetReads++; return structuredClone(f.budget); }, transact(mutator) {
      if (f.duringBudget) f.duringBudget();
      const next = mutator(structuredClone(f.budget)); f.budget = next.budget; f.reservations++; return next.value;
    } },
    admission: { read({ handle }) { f.admissionReads++; return { ...f.pre, ...(handle ? f.document : {}) }; } },
    tabs: {
      async open(spec, { signal }) { f.events.push(['open', spec, signal]); if (f.openGate) await f.openGate.promise;
        const handle = { number: f.handles.length + 1 }; f.handles.push(handle); return handle; },
      async capture(handle, spec, { signal }) { f.events.push(['capture', spec.level, spec.witness, signal]); if (f.captureGate) await f.captureGate.promise;
        // Trusted synthetic adapter atomically verifies the witness before extracting fixture data.
        if (spec.witness.inner_window_id !== f.document.inner_window_id || f.document.password_clear !== true) throw Object.assign(new Error('cancelled'), { code: 'cancelled' });
        if (f.captureOverride) return f.captureOverride;
        return { witness: { ...f.pre, ...f.document }, observation: { url: watch.url, title: 'Synthetic status',
          ...(spec.level !== 'address' ? { outline: [{ kind: 'heading', text: 'Synthetic fixture' }] } : {}),
          ...(spec.level === 'screen' ? { screen: f.screen } : {}) } }; },
      async close(handle) { f.events.push(['close', handle.number]); if (f.closeGate) await f.closeGate.promise;
        if (f.closeFails) throw new Error('synthetic close failure'); }
    },
    indicator: {
      async show(spec) { f.events.push(['show', spec]); if (f.showGate) await f.showGate.promise;
        const lease = { number: f.leases.length + 1 }; f.leases.push(lease); return lease; },
      isVisible() { return f.visible; },
      async hide(lease, disclosure) { f.events.push(['hide', lease.number, disclosure]); if (f.hideFails) throw new Error('synthetic hide failure'); }
    },
    async decide(request, { signal }) {
      f.events.push(['decide', request, signal]);
      // This models createDecide's CONSTRUCTOR onSending hook, never a decide option.
      f.controller.beforeSending({ request_id: request.request_id, level: request.state.observation.level });
      validateWatchRequest(request, f.at);
      if (f.failProvider) throw new Error('synthetic transport failure after handoff');
      if (f.resultGate) return f.resultGate.promise;
      return f.resultOverride ?? reply(request);
    }
  });
  f.requestSeq = 0;
  f.begin = async () => { const promise = f.controller.run({ id: watch.id }); await flush(); return { promise }; };
  f.doc = () => JSON.parse(f.disk);
  return f;
}
function reply(request, changes = {}) {
  return { version: 1, request_id: request.request_id, choice_set: 'watch_v1', context_version: 'watch-1',
    outcome: 'ready', reason: 'validated', data_sent: true, authority: 'suggestion_only', action_authorized: false,
    provider: request.provider, confidence: 0.9, ...(request.provider === 'openai' ? { shape_status: 'UNVERIFIED_SHAPE' } : {}), ...changes };
}
const events = (f, name) => f.events.filter(item => item[0] === name);
const request = f => events(f, 'decide')[0][1];

test('production authorization default performs only neutral persistence, no native/budget/provider work', async () => {
  const f = fixture({ liveAuthorized: false }); const result = await f.controller.run({ id: 'w_demo1' });
  assert.equal(result.code, 'NOT_AUTHORIZED'); assert.equal(result.data_sent, false); assert.equal(result.persisted, true);
  assert.equal(f.admissionReads, 0); assert.equal(f.budgetReads, 0); assert.equal(f.reservations, 0);
  assert.deepEqual(f.events.map(item => item[0]), ['write']);
  assert.equal(f.doc().watches[0].latest_result.reason, 'NOT_AUTHORIZED');
  assert.equal(f.doc().watches[0].schedule.last_checked_at, f.at);
});
test('factory omitting liveAuthorized stays closed', async () => {
  const f = fixture({ omitAuthorization: true });
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'NOT_AUTHORIZED');
});
test('disabled saved consent or observation creates no check, write, tab or request', async () => {
  for (const watch of [makeWatch({ consent: false }), makeWatch({ observation: 'none' }), makeWatch({ enabled: false })]) {
    const f = fixture({ watch }); assert.equal((await f.controller.run({ id: watch.id })).code, 'disabled');
    assert.equal(f.events.length, 0); assert.equal(f.writes, 0);
  }
});
test('validated fixture uses own project container, one shared reservation, scalar-only result and cleanup', async () => {
  const f = fixture(); const result = await f.controller.run({ id: 'w_demo1' });
  assert.equal(result.code, 'APPLIED'); assert.equal(result.data_sent, true); assert.equal(result.outcome, 'ready');
  assert.equal(events(f, 'open')[0][1].container_id, 42); assert.equal(f.reservations, 1); assert.equal(f.budget.calls.length, 1);
  assert.equal(events(f, 'close').length, 1); assert.equal(events(f, 'hide').length, 1);
  assert.equal(events(f, 'hide')[0][2].data_sent, true); assert.equal(f.controller.status().busy, false);
  assert.deepEqual(Object.keys(f.doc().watches[0].latest_result).sort(), ['checked_at', 'confidence', 'data_sent', 'outcome', 'provider', 'reason', 'request_id'].sort());
  assert.equal(f.disk.includes('Synthetic status'), false); assert.equal(request(f).state.observation.address.path, '/status');
  assert.equal(JSON.stringify(request(f)).includes('secret'), false);
});
test('provider neutral reply false disclosure is used exactly, even though decide was called', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  f.resultGate.resolve(reply(request(f), { outcome: 'unknown', reason: 'HTTP_ERROR', confidence: null, data_sent: false }));
  const result = await promise; assert.equal(result.data_sent, false); assert.equal(result.disclosure, 'confirmed');
  assert.equal(f.doc().watches[0].latest_result.data_sent, false); assert.equal(events(f, 'hide')[0][2].data_sent, false);
});
test('known pre-open privacy, context, consent, category and container facts all fail closed', async () => {
  for (const [field, value] of [['is_private', true], ['is_private', null], ['is_blocked', true], ['is_blocked', null],
    ['context_registered', false], ['context_normal', false], ['consent_granted', false], ['url_allowed', false],
    ['container_id', 0], ['container_generation', 0], ['root_revision', 0], ['project_id', 'p_87654321']]) {
    const f = fixture(); f.pre[field] = value; const result = await f.controller.run({ id: 'w_demo1' });
    assert.equal(result.code, 'ADMISSION_DENIED', field); assert.equal(events(f, 'open').length, 0, field);
    assert.equal(f.reservations, 0); assert.equal(f.writes, 0);
  }
});
test('hidden document/error/channel/password facts all fail before any capture', async () => {
  for (const [field, value] of [['is_error_document', true], ['channel_status', 42], ['failed_channel_status', 1],
    ['password_clear', false], ['complete_top_document', false], ['browsing_context_id', 0], ['inner_window_id', 0],
    ['document_url', 'https://other.test/status'], ['document_url', 'about:neterror'], ['document_url', 'https://secret:secret@example.test/status']]) {
    const f = fixture(); f.document[field] = value; const result = await f.controller.run({ id: 'w_demo1' });
    assert.ok(['ADMISSION_DENIED', 'INVALID_INPUT', 'HOST_UNAVAILABLE'].includes(result.code), field);
    assert.equal(events(f, 'capture').length, 0, field); assert.equal(events(f, 'close').length, 1, field);
    assert.equal(f.reservations, 0);
  }
});
test('pre-open metadata requires no existing page document or visible tab', async () => {
  const f = fixture(); assert.equal(Object.hasOwn(f.pre, 'inner_window_id'), false);
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'APPLIED');
});
test('sensitive watch is capped before capture, not just before transmission', async () => {
  const f = fixture({ watch: makeWatch({ url: 'https://ing.nl/status', observation: 'outline' }) });
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'APPLIED');
  assert.equal(events(f, 'capture')[0][1], 'address'); assert.equal(request(f).state.observation.level, 'address');
  assert.equal(Object.hasOwn(request(f).state.observation, 'outline'), false);
});
test('outline refuses unverified subframe safety before extracting data', async () => {
  const f = fixture({ watch: makeWatch({ observation: 'outline' }) }); f.document.subframes_safe = false;
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'ADMISSION_DENIED'); assert.equal(events(f, 'capture').length, 0);
});
test('screen on non-image provider performs no opening or capture', async () => {
  const f = fixture({ watch: makeWatch({ observation: 'screen', provider: 'jev' }) });
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'IMAGE_UNSUPPORTED'); assert.equal(events(f, 'open').length, 0);
});
test('indicator visibility is required before reserving or calling provider', async () => {
  const f = fixture(); f.visible = false;
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'ADMISSION_DENIED');
  assert.equal(f.reservations, 0); assert.equal(events(f, 'decide').length, 0); assert.equal(events(f, 'close').length, 1);
});
test('constructor onSending bridge rechecks current document at actual outbound handoff', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  f.document.inner_window_id++;
  assert.throws(() => f.controller.beforeSending({ request_id: request(f).request_id, level: 'address' }), /cancelled/u);
  f.resultGate.resolve(reply(request(f))); assert.equal((await promise).persisted, false);
});
test('shared budget exhaustion before opening records an attempt without observation', async () => {
  const f = fixture({ hourlyLimit: 1 }); f.budget = { calls: [f.at - 1] };
  const result = await f.controller.run({ id: 'w_demo1' }); assert.equal(result.code, 'budget_exhausted');
  assert.equal(f.doc().watches[0].schedule.last_checked_at, f.at); assert.equal(events(f, 'open').length, 0);
  assert.equal(f.reservations, 0); assert.equal(f.budget.calls.length, 1);
});
test('another checkpoint using budget between capture and reserve prevents a provider call', async () => {
  const f = fixture({ hourlyLimit: 1 }); f.duringBudget = () => { f.budget = { calls: [f.at] }; };
  const result = await f.controller.run({ id: 'w_demo1' }); assert.equal(result.code, 'budget_exhausted');
  assert.equal(events(f, 'decide').length, 0); assert.equal(f.budget.calls.length, 1);
  assert.equal(f.doc().watches[0].latest_result.reason, 'budget_exhausted');
});
test('future budget timestamps are preserved and suppress opening on clock rollback', async () => {
  const f = fixture(); f.budget = { calls: [f.at + 1000] };
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'CLOCK_ROLLBACK');
  assert.deepEqual(f.budget.calls, [f.at + 1000]); assert.equal(events(f, 'open').length, 0); assert.equal(f.writes, 0);
});
test('single in-flight has no queued second run', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'BUSY'); assert.equal(events(f, 'open').length, 1);
  f.resultGate.resolve(reply(request(f))); await promise;
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'NOT_DUE');
});
test('cancelled provider reply retains actual sent disclosure without storing a result', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  f.controller.cancel(); f.resultGate.resolve(reply(request(f), { reason: 'cancelled', outcome: 'unknown', confidence: null }));
  const result = await promise; assert.equal(result.code, 'cancelled'); assert.equal(result.data_sent, true);
  assert.equal(f.doc().watches[0].latest_result, null); assert.equal(events(f, 'hide')[0][2].data_sent, true);
});
test('watch deletion while request runs prevents resurrection', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  await f.controller.remove({ id: 'w_demo1', userCreated: true });
  f.resultGate.resolve(reply(request(f))); const result = await promise;
  assert.equal(result.persisted, false); assert.equal(result.data_sent, true); assert.deepEqual(f.doc().watches, []);
});
test('explicit edit increments revision and clears old result/attempt; old reply cannot overwrite', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  const edited = { ...f.doc().watches[0], question: 'Different synthetic fixture?' };
  const saved = await f.controller.save({ watch: edited, userCreated: true }); assert.equal(saved.revision, 2);
  f.resultGate.resolve(reply(request(f))); await promise;
  assert.equal(f.doc().watches[0].revision, 2); assert.equal(f.doc().watches[0].latest_result, null);
  assert.equal(f.doc().watches[0].question, edited.question); assert.equal(f.doc().watches[0].schedule.last_checked_at, null);
});
test('project/root/container/context generation drift while opening prevents capture and closes owned handle', async () => {
  for (const field of ['project_updated_at', 'root_revision', 'container_id', 'container_generation', 'scope_epoch']) {
    const f = fixture(); f.openGate = deferred(); const { promise } = await f.begin();
    f.pre[field]++; f.openGate.resolve(); await promise;
    assert.equal(events(f, 'capture').length, 0, field); assert.equal(events(f, 'close').length, 1, field); assert.equal(f.reservations, 0);
  }
});
test('navigation while capture waits rejects result before indicator, budget or provider', async () => {
  const f = fixture(); f.captureGate = deferred(); const { promise } = await f.begin();
  f.document.inner_window_id++; f.captureGate.resolve(); await promise;
  assert.equal(events(f, 'show').length, 0); assert.equal(events(f, 'decide').length, 0); assert.equal(f.reservations, 0);
});
test('private/blocked/password/consent drift while provider waits drops answer but retains sent disclosure', async () => {
  for (const [where, field, value] of [['pre', 'is_private', true], ['pre', 'is_blocked', true], ['pre', 'consent_granted', false],
    ['document', 'password_clear', false], ['document', 'failed_channel_status', 23], ['document', 'inner_window_id', 201]]) {
    const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
    f[where][field] = value; f.resultGate.resolve(reply(request(f))); const result = await promise;
    assert.equal(result.persisted, false, field); assert.equal(result.data_sent, true); assert.equal(f.doc().watches[0].latest_result, null);
  }
});
test('bounded cancellation of pending open keeps slot then cleans a late owned handle', async () => {
  const f = fixture(); f.openGate = deferred(); const { promise } = await f.begin();
  f.controller.cancel(); await f.advance(2000); const result = await promise;
  assert.equal(result.code, 'cancelled'); assert.equal(result.data_sent, false); assert.equal(f.controller.status().busy, true);
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'BUSY');
  f.openGate.resolve(); await flush(); assert.equal(events(f, 'close').length, 1); assert.equal(f.controller.status().busy, false);
});
test('bounded timeout of pending provider keeps conservative disclosure, then records actual false reply', async () => {
  const f = fixture({ timeoutMs: 1000 }); f.resultGate = deferred(); const { promise } = await f.begin();
  await f.advance(1000); await f.advance(2000); const timed = await promise;
  assert.equal(timed.code, 'timeout'); assert.equal(timed.data_sent, true); assert.equal(timed.disclosure, 'conservative');
  assert.equal(f.controller.status().busy, true);
  f.resultGate.resolve(reply(request(f), { reason: 'cancelled', outcome: 'unknown', confidence: null, data_sent: false }));
  await flush(); assert.equal(f.controller.status().last.data_sent, false); assert.equal(f.controller.status().last.disclosure, 'confirmed');
  assert.equal(f.doc().watches[0].latest_result, null); assert.equal(events(f, 'hide')[0][2].data_sent, false);
});
test('late indicator lease is retained and hidden after cancellation, never followed by provider', async () => {
  const f = fixture(); f.showGate = deferred(); const { promise } = await f.begin(); f.controller.cancel();
  await f.advance(2000); await promise; f.showGate.resolve(); await flush();
  assert.equal(events(f, 'hide').length, 1); assert.equal(events(f, 'decide').length, 0); assert.equal(f.reservations, 0);
});
test('failed cleanup is inspectable and blocks all new opening until explicit retry succeeds', async () => {
  const f = fixture(); f.closeFails = true; const result = await f.controller.run({ id: 'w_demo1' });
  assert.equal(result.code, 'CLEANUP_REQUIRED'); assert.equal(f.controller.status().cleanup_required, true);
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'CLEANUP_REQUIRED');
  f.closeFails = false; await f.controller.retryCleanup(); assert.equal(f.controller.status().busy, false);
  assert.equal(events(f, 'open').length, 1); assert.equal(events(f, 'hide').length, 1);
});
test('hung cleanup also leaves a bounded public timeout and occupied ownership slot', async () => {
  const f = fixture({ timeoutMs: 1000 }); f.closeGate = deferred(); const { promise } = await f.begin();
  assert.equal(f.controller.status().phase, 'cleanup'); await f.advance(1000); await f.advance(2000);
  assert.equal((await promise).code, 'timeout'); assert.equal(f.controller.status().busy, true);
  f.closeGate.resolve(); await flush(); assert.equal(f.controller.status().busy, false);
});
test('provider throws after handoff conservatively reports sent and never stores invented outcome', async () => {
  const f = fixture(); f.failProvider = true; const result = await f.controller.run({ id: 'w_demo1' });
  assert.equal(result.data_sent, true); assert.equal(result.disclosure, 'conservative'); assert.equal(result.outcome, 'unknown');
  assert.equal(f.doc().watches[0].latest_result, null);
});
test('malformed provider output cannot downgrade conservative handoff disclosure', async () => {
  const f = fixture(); f.resultOverride = { data_sent: false, outcome: 'ready', authority: 'execute' };
  const result = await f.controller.run({ id: 'w_demo1' }); assert.equal(result.code, 'malformed_output');
  assert.equal(result.data_sent, true); assert.equal(f.doc().watches[0].latest_result, null);
});
test('write failure before provider prevents outbound activity; reservation is conservatively retained', async () => {
  const f = fixture(); f.failWrites = true; const result = await f.controller.run({ id: 'w_demo1' });
  assert.equal(result.code, 'STORAGE_ERROR'); assert.equal(result.data_sent, false); assert.equal(events(f, 'decide').length, 0);
  assert.equal(f.reservations, 1); assert.equal(f.budget.calls.length, 1); assert.equal(f.doc().watches[0].latest_result, null);
});
test('result write failure preserves accurate disclosure and reports unsaved result', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin(); f.failWrites = true;
  f.resultGate.resolve(reply(request(f))); const result = await promise;
  assert.equal(result.code, 'STORAGE_ERROR'); assert.equal(result.data_sent, true); assert.equal(result.persisted, false);
  assert.equal(f.doc().watches[0].latest_result, null); assert.equal(events(f, 'hide')[0][2].data_sent, true);
});
test('corrupt persisted store never gets overwritten or causes opening', async () => {
  const f = fixture({ raw: '{broken' }); await assert.rejects(f.controller.run({ id: 'w_demo1' }), /INVALID_STORE/u);
  assert.equal(f.disk, '{broken'); assert.equal(f.writes, 0); assert.equal(events(f, 'open').length, 0);
});
test('closed CRUD rejects implicit creation and passive schema never runs getters', async () => {
  const f = fixture(); await assert.rejects(f.controller.save({ watch: makeWatch(), userCreated: false }), /INVALID_INPUT/u);
  await assert.rejects(f.controller.remove({ id: 'w_demo1', userCreated: false }), /INVALID_INPUT/u);
  await assert.rejects(f.controller.run({ id: 'w_demo1', isPrivate: false }), /INVALID_INPUT/u);
  let invoked = 0; const value = {}; Object.defineProperty(value, 'id', { get() { invoked++; return 'w_demo1'; }, enumerable: true });
  assert.throws(() => passiveCopy(value), /INVALID_INPUT/u); assert.equal(invoked, 0);
  assert.throws(() => passiveCopy([, 'synthetic']), /INVALID_INPUT/u); assert.equal(f.writes, 0);
});
test('dispose aborts owned work without closing shared provider service', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin(); f.controller.dispose();
  assert.equal(events(f, 'decide')[0][2].aborted, true);
  f.resultGate.resolve(reply(request(f))); assert.equal((await promise).persisted, false);
  assert.equal(f.controller.status().closed, true); await assert.rejects(f.controller.run({ id: 'w_demo1' }), /CLOSED/u);
});
test('scheduled default-gated watches use one timer and no automatic provider calls', async () => {
  const f = fixture({ liveAuthorized: false }); await f.controller.start(); assert.equal(f.timers.size, 1);
  await f.advance(1000); assert.equal(f.doc().watches[0].latest_result.reason, 'NOT_AUTHORIZED');
  assert.equal(events(f, 'open').length, 0); assert.equal(f.timers.size, 1);
  f.controller.stop(); assert.equal(f.timers.size, 0);
});
test('two due watches execute sequentially with no queue or overlapping hidden handle', async () => {
  const first = makeWatch(), second = makeWatch({ id: 'w_demo2' });
  const f = fixture({ liveAuthorized: false, watches: [first, second] }); await f.controller.start();
  await f.advance(1000); assert.equal(f.doc().watches.filter(w => w.latest_result).length, 1);
  await f.advance(1000); assert.equal(f.doc().watches.filter(w => w.latest_result).length, 2);
  assert.equal(f.timers.size, 1); f.controller.dispose();
});
test('denied scheduled admission backs off to a bounded one-minute metadata recheck', async () => {
  const f = fixture(); f.pre.is_private = true; await f.controller.start(); await f.advance(1000);
  const count = f.admissionReads; await f.advance(59000); assert.equal(f.admissionReads, count);
  await f.advance(1000); assert.ok(f.admissionReads > count); assert.equal(events(f, 'open').length, 0); f.controller.stop();
});

test('passive provider getter is never evaluated and cannot supply false disclosure', async () => {
  const f = fixture(); let reads = 0; const value = {};
  Object.defineProperty(value, 'data_sent', { enumerable: true, get() { reads++; return false; } }); f.resultOverride = value;
  const result = await f.controller.run({ id: 'w_demo1' }); assert.equal(reads, 0); assert.equal(result.code, 'malformed_output');
  assert.equal(result.data_sent, true); assert.equal(result.disclosure, 'conservative');
});
test('removal queued behind a result storage write leaves the durable store removed', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  f.writeGate = deferred(); f.resultGate.resolve(reply(request(f))); await flush();
  const removal = f.controller.remove({ id: 'w_demo1', userCreated: true }); await flush();
  f.writeGate.resolve(); await removal; const result = await promise;
  assert.equal(result.persisted, false); assert.equal(result.outcome, 'unknown'); assert.deepEqual(f.doc().watches, []);
});
test('current hidden privacy change during indicator await prevents reservation/handoff and cleans lease', async () => {
  const f = fixture(); f.showGate = deferred(); const { promise } = await f.begin();
  f.pre.is_private = true; f.showGate.resolve(); const result = await promise;
  assert.equal(result.persisted, false); assert.equal(f.reservations, 0); assert.equal(events(f, 'decide').length, 0);
  assert.equal(events(f, 'hide').length, 1); assert.equal(events(f, 'hide')[0][2].data_sent, false);
});
test('clock preceding stored update leaves the store unchanged and scheduling remains bounded', async () => {
  const f = fixture({ watch: makeWatch({ now: 200000 }) });
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'NOT_DUE'); assert.equal(f.writes, 0);
  await f.controller.start(); assert.equal(f.timers.size, 1); await f.advance(60000);
  assert.equal(f.writes, 0); assert.equal(f.timers.size, 1); f.controller.stop();
});

test('document/consent/root/container invalidation during result write clears only stale matching latest result', async () => {
  for (const [where, field, value] of [['document', 'inner_window_id', 201], ['pre', 'consent_granted', false],
    ['pre', 'root_revision', 2], ['pre', 'container_generation', 2]]) {
    const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
    f.writeGate = deferred(); f.resultGate.resolve(reply(request(f))); await flush();
    f[where][field] = value; f.writeGate.resolve(); const result = await promise;
    assert.equal(result.persisted, false, field); assert.equal(result.data_sent, true);
    assert.equal(f.doc().watches[0].latest_result, null, field); assert.equal(f.controller.status().recovery_required, false);
  }
});
test('failed stale-result compensation is reported and blocks new work, then preserves newer user edit', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  f.writeGate = deferred(); f.resultGate.resolve(reply(request(f))); await flush();
  f.pre.root_revision++; f.failAfterWrites = 2; f.writeGate.resolve(); const result = await promise;
  assert.equal(result.code, 'RECOVERY_REQUIRED'); assert.equal(result.data_sent, true);
  assert.equal(f.controller.status().recovery_required, true); assert.equal(f.controller.status().residual.request_id, request(f).request_id);
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'RECOVERY_REQUIRED');
  f.failAfterWrites = undefined;
  await f.controller.save({ watch: { ...f.doc().watches[0], question: 'Newer explicit fixture choice?' }, userCreated: true });
  await f.controller.retryCleanup(); assert.equal(f.controller.status().busy, false);
  assert.equal(f.doc().watches[0].revision, 2); assert.equal(f.doc().watches[0].question, 'Newer explicit fixture choice?');
  assert.equal(f.doc().watches[0].latest_result, null);
});
test('concurrent cleanup retries share one ownership cleanup and cannot orphan a subsequent job', async () => {
  const f = fixture(); f.closeFails = true; await f.controller.run({ id: 'w_demo1' });
  f.closeFails = false; f.closeGate = deferred(); const a = f.controller.retryCleanup(), b = f.controller.retryCleanup();
  await flush(); assert.equal(events(f, 'close').length, 2);
  f.closeGate.resolve(); await Promise.all([a, b]); assert.equal(events(f, 'hide').length, 1);
  await f.controller.save({ watch: f.doc().watches[0], userCreated: true });
  f.closeGate = null; f.resultGate = deferred(); const next = await f.begin();
  assert.equal(f.controller.status().busy, true); assert.equal(events(f, 'open').length, 2);
  f.resultGate.resolve(reply(events(f, 'decide')[1][1])); await next.promise; assert.equal(f.controller.status().busy, false);
});
test('invalid or throwing clock during provider completion cannot strand ownership or promise', async () => {
  for (const at of [NaN, -1]) {
    const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin(); f.at = at;
    f.resultGate.resolve(reply(request(f))); const result = await promise;
    assert.equal(result.code, 'INVALID_CLOCK'); assert.equal(f.controller.status().busy, false);
    assert.equal(f.controller.status().last_error, 'INVALID_CLOCK'); assert.equal(f.doc().watches[0].latest_result, null);
  }
});

test('throwing clock at completion settles fixed failure and releases all owned resources', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin(); f.throwClock = true;
  f.resultGate.resolve(reply(request(f))); const result = await promise;
  assert.equal(result.code, 'INVALID_CLOCK'); assert.equal(f.controller.status().busy, false);
  assert.equal(events(f, 'close').length, 1); assert.equal(events(f, 'hide').length, 1);
});
test('screen uses exact bounded fake PNG data and preserves OpenAI unverified-shape neutral disclosure', async () => {
  const f = fixture({ watch: makeWatch({ observation: 'screen', provider: 'openai' }) });
  const png = Buffer.alloc(33); Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(png);
  png.writeUInt32BE(13, 8); png.write('IHDR', 12); png.writeUInt32BE(1, 16); png.writeUInt32BE(1, 20);
  f.screen = { mime: 'image/png', width: 1, height: 1, data_base64: png.toString('base64') };
  f.resultGate = deferred(); const { promise } = await f.begin();
  assert.equal(request(f).state.observation.level, 'screen'); assert.equal(events(f, 'capture')[0][1], 'screen');
  f.resultGate.resolve(reply(request(f), { outcome: 'unknown', reason: 'UNVERIFIED_SHAPE', confidence: null, data_sent: false }));
  const result = await promise; assert.equal(result.data_sent, false); assert.equal(result.reason, 'UNVERIFIED_SHAPE');
  assert.equal(f.disk.includes('data_base64'), false);
});
test('sensitive screen is capped to address before the trusted capture callback', async () => {
  const f = fixture({ watch: makeWatch({ url: 'https://nhs.uk/status', observation: 'screen', provider: 'openai' }) });
  assert.equal((await f.controller.run({ id: 'w_demo1' })).code, 'APPLIED');
  assert.equal(events(f, 'capture')[0][1], 'address'); assert.equal(Object.hasOwn(request(f).state.observation, 'screen'), false);
});
test('capture callback returned wrong document witness or excessive items cannot reserve or send', async () => {
  for (const variant of ['witness', 'items', 'extra']) {
    const f = fixture({ watch: makeWatch({ observation: 'outline' }) });
    f.captureOverride = { witness: { ...f.pre, ...f.document }, observation: { url: f.document.document_url, title: 'Synthetic', outline: [] } };
    if (variant === 'witness') f.captureOverride.witness.inner_window_id++;
    if (variant === 'items') f.captureOverride.observation.outline = Array.from({ length: 201 }, () => ({ kind: 'heading', text: 'Synthetic' }));
    if (variant === 'extra') f.captureOverride.observation.form_values = ['synthetic forbidden shape'];
    const result = await f.controller.run({ id: 'w_demo1' }); assert.equal(result.persisted, false);
    assert.equal(f.reservations, 0); assert.equal(events(f, 'decide').length, 0);
  }
});
test('indicator hide failure retains only its owned lease and explicit retries are idempotent', async () => {
  const f = fixture(); f.hideFails = true; const result = await f.controller.run({ id: 'w_demo1' });
  assert.equal(result.code, 'CLEANUP_REQUIRED'); assert.equal(events(f, 'close').length, 1);
  assert.equal(f.doc().watches[0].latest_result, null); f.hideFails = false;
  await f.controller.retryCleanup(); assert.equal(events(f, 'close').length, 1); assert.equal(f.controller.status().busy, false);
});
test('result accepted before cleanup is conditionally cleared if project binding changes during cleanup', async () => {
  const f = fixture(); f.closeGate = deferred(); const { promise } = await f.begin();
  assert.equal(f.doc().watches[0].latest_result.outcome, 'ready'); f.pre.root_revision++;
  f.closeGate.resolve(); const result = await promise;
  assert.equal(result.persisted, false); assert.equal(result.data_sent, true); assert.equal(f.doc().watches[0].latest_result, null);
});
test('passive malformed metadata getters are never a source of trusted admission', () => {
  let reads = 0; const invalid = {};
  Object.defineProperty(invalid, 'url_allowed', { get() { reads++; return true; }, enumerable: true });
  assert.throws(() => passiveCopy(invalid), /INVALID_INPUT/u); assert.equal(reads, 0);
});
test('recovery retry cannot overlap the original pending native cleanup', async () => {
  const f = fixture(); f.resultGate = deferred(); const { promise } = await f.begin();
  f.writeGate = deferred(); f.closeGate = deferred(); f.resultGate.resolve(reply(request(f))); await flush();
  f.pre.root_revision++; f.failAfterWrites = 2; f.writeGate.resolve(); await flush();
  assert.equal(f.controller.status().recovery_required, true); assert.equal(f.controller.status().retry_allowed, false);
  assert.equal(events(f, 'close').length, 1); f.failAfterWrites = undefined;
  await f.controller.retryCleanup(); assert.equal(events(f, 'close').length, 1);
  f.closeGate.resolve(); await promise; assert.equal(f.controller.status().retry_allowed, true);
  await f.controller.retryCleanup(); assert.equal(f.controller.status().busy, false); assert.equal(events(f, 'close').length, 1);
});
test('invalidation during hung cleanup clears matching persisted result without losing native ownership', async () => {
  const f = fixture(); f.closeGate = deferred(); const { promise } = await f.begin();
  assert.equal(f.doc().watches[0].latest_result.outcome, 'ready');
  f.controller.invalidate(); await flush(); assert.equal(f.doc().watches[0].latest_result, null);
  assert.equal(f.controller.status().busy, true); assert.equal(events(f, 'close').length, 1);
  await f.advance(2000); assert.equal((await promise).code, 'cancelled');
  f.closeGate.resolve(); await flush(); assert.equal(f.controller.status().busy, false);
});
test('deadline during hung cleanup clears latest result before a bounded timeout reply', async () => {
  const f = fixture({ timeoutMs: 1000 }); f.closeGate = deferred(); const { promise } = await f.begin();
  assert.equal(f.doc().watches[0].latest_result.outcome, 'ready');
  await f.advance(1000); assert.equal(f.doc().watches[0].latest_result, null);
  await f.advance(2000); const result = await promise; assert.equal(result.code, 'timeout'); assert.equal(result.data_sent, true);
  assert.equal(f.controller.status().busy, true); f.closeGate.resolve(); await flush(); assert.equal(f.controller.status().busy, false);
});

test('authoritative shared hourly limit reduction is read before opening on later explicit checks', async () => {
  const f = fixture(); f.liveHourlyLimit = 0;
  const result = await f.controller.run({ id: 'w_demo1' }); assert.equal(result.code, 'budget_exhausted');
  assert.equal(events(f, 'open').length, 0); assert.equal(f.budget.calls.length, 0); assert.equal(f.doc().watches[0].latest_result.data_sent, false);
});
test('live budget reduction during capture is honored by the synchronous shared reservation', async () => {
  const f = fixture(); f.captureGate = deferred(); const { promise } = await f.begin();
  f.liveHourlyLimit = 0; f.captureGate.resolve(); const result = await promise;
  assert.equal(result.code, 'budget_exhausted'); assert.equal(events(f, 'decide').length, 0); assert.equal(f.budget.calls.length, 0);
});


// Trusted run signals never enter the persisted/page {id} input.
function trackedRunSignal() {
  const owner = new AbortController(), signal = owner.signal;
  const add = signal.addEventListener.bind(signal), remove = signal.removeEventListener.bind(signal);
  const state = { adds: 0, removes: 0, listeners: new Set() };
  signal.addEventListener = (type, listener, options) => { if (type === 'abort') { state.adds++; state.listeners.add(listener); } return add(type, listener, options); };
  signal.removeEventListener = (type, listener, options) => { if (type === 'abort') { state.removes++; state.listeners.delete(listener); } return remove(type, listener, options); };
  return { owner, signal, state };
}
function countRunLoads(f) {
  const original = f.store.load.bind(f.store); let reads = 0;
  f.store.load = async () => { reads++; return original(); };
  return () => reads;
}
test('owned run already-aborted signal performs zero load/write/native/budget/timer work', async () => {
  const f = fixture({ liveAuthorized: false }), tracked = trackedRunSignal(), reads = countRunLoads(f);
  tracked.owner.abort();
  assert.deepEqual(await f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal }),
    { code: 'cancelled', watch_id: 'w_demo1', data_sent: false, disclosure: 'confirmed', persisted: false });
  assert.equal(reads(), 0); assert.equal(f.writes, 0); assert.equal(f.requestSeq, 0); assert.equal(f.admissionReads, 0);
  assert.equal(f.budgetReads, 0); assert.equal(f.reservations, 0); assert.equal(f.events.length, 0); assert.equal(f.timers.size, 0);
  assert.equal(tracked.state.adds, 0); assert.equal(f.controller.status().busy, false);
});
test('owned run aborted while initial load waits never starts after that load resolves', async () => {
  const f = fixture(), gate = deferred(), tracked = trackedRunSignal(); let reads = 0;
  f.store.load = async () => { reads++; return gate.promise; };
  const pending = f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal }); await flush();
  tracked.owner.abort(); gate.resolve(f.doc()); const result = await pending;
  assert.equal(result.code, 'cancelled'); assert.equal(result.data_sent, false); assert.equal(reads, 1);
  assert.equal(f.requestSeq, 0); assert.equal(f.events.length, 0); assert.equal(f.reservations, 0); assert.equal(f.timers.size, 0);
  assert.equal(tracked.state.adds, 0); assert.equal(f.controller.status().busy, false);
});
test('owned run BUSY caller installs no listener and its later abort leaves other provider work intact', async () => {
  const f = fixture(), tracked = trackedRunSignal(); f.resultGate = deferred(); const { promise } = await f.begin();
  const nativeSignal = events(f, 'decide')[0][2];
  assert.equal((await f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal })).code, 'BUSY');
  tracked.owner.abort(); assert.equal(nativeSignal.aborted, false); assert.equal(tracked.state.adds, 0);
  f.resultGate.resolve(reply(request(f))); assert.equal((await promise).code, 'APPLIED'); assert.equal(f.reservations, 1);
});
test('owned pending load that loses admission to another run cannot cancel that run', async () => {
  const f = fixture(), gate = deferred(), tracked = trackedRunSignal(), original = f.store.load.bind(f.store); let first = true;
  f.store.load = async () => { if (first) { first = false; return gate.promise; } return original(); };
  const old = f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal }); await flush();
  f.resultGate = deferred(); const { promise } = await f.begin(); const nativeSignal = events(f, 'decide')[0][2];
  tracked.owner.abort(); gate.resolve(f.doc()); assert.equal((await old).code, 'cancelled');
  assert.equal(nativeSignal.aborted, false); assert.equal(tracked.state.adds, 0);
  f.resultGate.resolve(reply(request(f))); assert.equal((await promise).code, 'APPLIED');
});
test('owned abort retains listener and slot through bounded public reply and late-open cleanup', async () => {
  const f = fixture(), tracked = trackedRunSignal(); f.openGate = deferred();
  const pending = f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal }); await flush();
  assert.equal(tracked.state.listeners.size, 1); tracked.owner.abort(); assert.equal(events(f, 'open')[0][2].aborted, true);
  await f.advance(2000); assert.equal((await pending).code, 'cancelled'); assert.equal(f.controller.status().busy, true);
  assert.equal(tracked.state.removes, 0); assert.equal(tracked.state.listeners.size, 1);
  f.openGate.resolve(); await flush(); assert.equal(events(f, 'close').length, 1); assert.equal(events(f, 'capture').length, 0);
  assert.equal(f.reservations, 0); assert.equal(f.controller.status().busy, false);
  assert.equal(tracked.state.removes, 1); assert.equal(tracked.state.listeners.size, 0);
});
test('owned provider abort preserves disclosure/reservation and listener through actual late cleanup', async () => {
  const f = fixture(), tracked = trackedRunSignal(); f.resultGate = deferred();
  const pending = f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal }); await flush();
  tracked.owner.abort(); await f.advance(2000); const early = await pending;
  assert.equal(early.data_sent, true); assert.equal(early.disclosure, 'conservative'); assert.equal(f.budget.calls.length, 1);
  assert.equal(tracked.state.listeners.size, 1); f.closeGate = deferred();
  f.resultGate.resolve(reply(request(f), { outcome: 'unknown', reason: 'cancelled', confidence: null, data_sent: false })); await flush();
  assert.equal(f.controller.status().phase, 'cleanup'); assert.equal(tracked.state.removes, 0);
  f.closeGate.resolve(); await flush(); assert.equal(tracked.state.removes, 1); assert.equal(tracked.state.listeners.size, 0);
  assert.equal(f.budget.calls.length, 1); assert.equal(f.doc().watches[0].latest_result, null);
  assert.equal(events(f, 'hide')[0][2].data_sent, false); assert.equal(f.controller.status().last.data_sent, false);
});
test('owned completed signal cannot cancel a later watch run after its exact listener is removed', async () => {
  const f = fixture(), old = trackedRunSignal(); await f.controller.run({ id: 'w_demo1' }, { signal: old.signal });
  assert.equal(old.state.removes, 1); assert.equal(old.state.listeners.size, 0);
  await f.controller.save({ watch: f.doc().watches[0], userCreated: true }); f.resultGate = deferred(); const { promise } = await f.begin();
  old.owner.abort(); assert.equal(events(f, 'decide')[1][2].aborted, false);
  f.resultGate.resolve(reply(events(f, 'decide')[1][1])); assert.equal((await promise).code, 'APPLIED');
});
test('owned cancellation records its fixed reason before internal abort callbacks reenter', async () => {
  const f = fixture(), tracked = trackedRunSignal(); f.resultGate = deferred();
  const pending = f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal }); await flush();
  events(f, 'decide')[0][2].addEventListener('abort', () => { f.controller.cancel(); f.controller.invalidate(); });
  tracked.owner.abort(); f.resultGate.resolve(reply(request(f))); assert.equal((await pending).code, 'cancelled');
  assert.equal(f.controller.status().last.reason, 'cancelled'); assert.equal(tracked.state.removes, 1);
});
test('owned run only accepts the trusted optional signal record and keeps page id schema closed', async () => {
  const f = fixture(), reads = countRunLoads(f); let getters = 0;
  const accessor = {}; Object.defineProperty(accessor, 'signal', { enumerable: true, get() { getters++; return new AbortController().signal; } });
  for (const options of [{ force: true }, { signal: null, now: 0 }, { signal: {} }, accessor])
    await assert.rejects(f.controller.run({ id: 'w_demo1' }, options), /INVALID_INPUT/u);
  await assert.rejects(f.controller.run({ id: 'w_demo1', signal: new AbortController().signal }), /INVALID_INPUT/u);
  assert.equal(getters, 0); assert.equal(reads(), 0); assert.equal(f.events.length, 0);
});
test('owned normal closed-production run removes listener after neutral persistence', async () => {
  const f = fixture({ liveAuthorized: false }), tracked = trackedRunSignal();
  assert.equal((await f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal })).code, 'NOT_AUTHORIZED');
  assert.equal(tracked.state.adds, 1); assert.equal(tracked.state.removes, 1); assert.equal(tracked.state.listeners.size, 0);
  assert.equal(f.admissionReads, 0); assert.equal(f.reservations, 0); assert.equal(events(f, 'open').length, 0);
});
test('settled shutdown joins closed-production pending persistence without inventing native work', async () => {
  const f = fixture({ liveAuthorized: false }); f.writeGate = deferred(); const { promise } = await f.begin();
  f.controller.dispose(); let done = false; const joined = f.controller.settled().then(value => { done = true; return value; });
  await flush(); assert.equal(done, false); assert.equal(f.controller.status().busy, true);
  f.writeGate.resolve(); const after = await joined; await promise;
  assert.equal(after.closed, true); assert.equal(after.busy, false); assert.equal(after.cleanup_required, false);
  assert.equal(f.admissionReads, 0); assert.equal(f.reservations, 0); assert.equal(events(f, 'open').length, 0);
});
test('settled stays pending after bounded public cancellation until late owned work cleans', async () => {
  const f = fixture(); f.openGate = deferred(); const { promise } = await f.begin(); f.controller.dispose();
  let done = false; const joined = f.controller.settled().then(value => { done = true; return value; });
  await f.advance(2000); await promise; assert.equal(done, false); assert.equal(f.controller.status().busy, true);
  f.openGate.resolve(); const after = await joined;
  assert.equal(after.closed, true); assert.equal(after.busy, false); assert.equal(events(f, 'close').length, 1);
});
test('settled reports retained failed cleanup honestly and joins an exact explicit retry', async () => {
  const f = fixture(); f.closeFails = true; await f.controller.run({ id: 'w_demo1' }); f.controller.dispose();
  const failed = await f.controller.settled(); assert.equal(failed.closed, true); assert.equal(failed.busy, true); assert.equal(failed.cleanup_required, true);
  f.closeFails = false; f.closeGate = deferred(); const retry = f.controller.retryCleanup(); let done = false;
  const joined = f.controller.settled().then(value => { done = true; return value; }); await flush(); assert.equal(done, false);
  f.closeGate.resolve(); const after = await joined; await retry; assert.equal(after.busy, false); assert.equal(after.cleanup_required, false);
});
test('settled work promise is published before an injected adapter can reenter', async () => {
  const f = fixture(); f.resultGate = deferred(); let joined = null, done = false;
  // Reenter immediately before registration, while the exact operation is owned.
  const tracked = trackedRunSignal(); const add = tracked.signal.addEventListener;
  tracked.signal.addEventListener = (...args) => { joined = f.controller.settled().then(value => { done = true; return value; }); return add(...args); };
  const pending = f.controller.run({ id: 'w_demo1' }, { signal: tracked.signal }); await flush();
  assert.ok(joined); assert.equal(done, false); f.controller.dispose(); f.resultGate.resolve(reply(request(f)));
  assert.equal((await joined).closed, true); await pending; assert.equal(done, true);
});
test('settled does not claim an unowned initial metadata load finished but dispose blocks later admission', async () => {
  const f = fixture(), gate = deferred(); f.store.load = () => gate.promise;
  const pending = f.controller.run({ id: 'w_demo1' }); await flush(); f.controller.dispose();
  const status = await f.controller.settled(); assert.equal(status.closed, true); assert.equal(status.busy, false);
  gate.resolve(f.doc()); await assert.rejects(pending, /CLOSED/u); assert.equal(f.events.length, 0); assert.equal(f.reservations, 0);
});
