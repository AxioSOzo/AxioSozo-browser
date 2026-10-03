// Pure injected fixtures only: no subprocess, profile, provider, preference or network operation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecisionBudget, DecisionBudgetError, DECISION_BUDGET_HOUR_MS as HOUR } from '../chrome/DecisionBudget.sys.mjs';
import { takeBudget } from '../../../packages/contexts/src/checkpoints.mjs';
import { createDecide } from '../chrome/ProviderDecision.sys.mjs';
import './support/chrome-modules.mjs';
const { createWatchController } = await import('../chrome/WatchController.sys.mjs');
import { createWatch, validateWatchStore } from '../../../packages/contexts/src/watches.mjs';

const NOW = 1790000000000;
const bad = (fn, code = 'INVALID_BUDGET_ADAPTER') => assert.throws(fn, error => error instanceof DecisionBudgetError && error.code === code);
const append = (base, at, value = 'reserved') => ({ budget: { calls: [...base.calls, at] }, value });
const flush = async () => { for (let i = 0; i < 100; i++) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

function ownerFixture({ limit = 30, initialBudget } = {}) {
  const f = { at: NOW, cap: limit, reads: 0 };
  f.owner = createDecisionBudget({ clock: () => f.at, getLimit: () => { f.reads++; return f.cap; },
    ...(initialBudget === undefined ? {} : { initialBudget }) });
  return f;
}

test('construction is inert; omitted limit alone defaults to thirty', () => {
  let reads = 0;
  const owner = createDecisionBudget({ clock: () => { reads++; return NOW; } });
  assert.equal(reads, 0); assert.equal(owner.limit(), 30);
  for (let i = 0; i < 30; i++) assert.equal(owner.reserve().ok, true);
  assert.equal(owner.reserve().reason, 'budget_exhausted'); assert.equal(owner.snapshot().calls.length, 30);
  assert.deepEqual(Object.keys(owner).sort(), ['limit', 'reserve', 'snapshot', 'transact']);
});

test('snapshot and initial history are immutable copies; duplicate calls count separately', () => {
  const raw = { calls: [NOW, NOW] }, f = ownerFixture({ limit: 3, initialBudget: raw });
  raw.calls.pop(); const snapshot = f.owner.snapshot();
  assert.deepEqual(snapshot.calls, [NOW, NOW]); assert(Object.isFrozen(snapshot)); assert(Object.isFrozen(snapshot.calls));
  assert.throws(() => snapshot.calls.push(NOW), TypeError);
  assert.equal(f.owner.reserve().ok, true); assert.equal(f.owner.reserve().ok, false);
});

test('actual configured zero, reductions and increases are read synchronously', () => {
  const f = ownerFixture({ limit: 0 }); assert.equal(f.owner.reserve().ok, false);
  f.cap = 2; assert.equal(f.owner.reserve().ok, true); assert.equal(f.owner.reserve().ok, true);
  f.cap = 1; assert.equal(f.owner.reserve().ok, false); assert.equal(f.owner.limit(), 1);
  f.cap = 3; assert.equal(f.owner.reserve().ok, true); assert.equal(f.owner.snapshot().calls.length, 3);
});

test('hour boundary expires only calls outside the rolling hour', () => {
  const f = ownerFixture({ limit: 2 }); f.owner.reserve(); f.at++; f.owner.reserve();
  f.at = NOW + HOUR - 1; assert.equal(f.owner.reserve().ok, false);
  f.at = NOW + HOUR; assert.equal(f.owner.reserve().ok, true);
  assert.deepEqual(f.owner.snapshot().calls, [NOW + 1, NOW + HOUR]);
});

test('future calls are retained and prohibit rollback reservations', () => {
  const f = ownerFixture({ initialBudget: { calls: [NOW + 100] } });
  const before = f.owner.snapshot(); assert.equal(f.owner.reserve().reason, 'CLOCK_ROLLBACK');
  assert.strictEqual(f.owner.snapshot(), before); f.at += 100;
  assert.equal(f.owner.reserve().ok, true); assert.deepEqual(f.owner.snapshot().calls, [NOW + 100, NOW + 100]);
  f.at--; assert.equal(f.owner.reserve().reason, 'CLOCK_ROLLBACK'); assert.equal(f.owner.snapshot().calls.length, 2);
});

test('high-water clock prevents reopening history after expiry then rollback', () => {
  const f = ownerFixture({ limit: 1 }); f.owner.reserve(); f.at += HOUR; f.cap = 0;
  assert.equal(f.owner.reserve().ok, false); assert.deepEqual(f.owner.snapshot().calls, []);
  f.at = NOW; f.cap = 1; assert.equal(f.owner.reserve().reason, 'CLOCK_ROLLBACK');
  assert.deepEqual(f.owner.snapshot().calls, []); f.at = NOW + HOUR;
  assert.equal(f.owner.reserve().ok, true);
});

test('rollback during transaction leaves history unchanged', () => {
  const f = ownerFixture(); const before = f.owner.snapshot();
  bad(() => f.owner.transact((base, frame) => { f.at--; return append(base, frame.now); }), 'CLOCK_ROLLBACK');
  assert.strictEqual(f.owner.snapshot(), before); f.at = NOW; assert.equal(f.owner.reserve().ok, true);
});

test('interleaved Promise jobs share one atomic thirty-call limit', async () => {
  const f = ownerFixture({ limit: 7 });
  const results = await Promise.all(Array.from({ length: 50 }, (_, index) => Promise.resolve().then(() => ({ consumer: index % 2 ? 'watch' : 'site', ...f.owner.reserve() }))));
  assert.equal(results.filter(result => result.ok).length, 7); assert.equal(f.owner.snapshot().calls.length, 7);
  assert(results.some(result => result.consumer === 'watch' && result.ok)); assert(results.some(result => result.consumer === 'site' && result.ok));
});

test('nested mutation fails before callback and cannot double spend', () => {
  const f = ownerFixture({ limit: 1 }); let nested = 0;
  const value = f.owner.transact((base, frame) => {
    assert.strictEqual(f.owner.snapshot().calls.length, 0); assert.equal(f.owner.limit(), 1);
    bad(() => f.owner.transact(() => { nested++; return append(base, frame.now); }));
    bad(() => f.owner.reserve()); return append(base, frame.now, 'outer');
  });
  assert.equal(value, 'outer'); assert.equal(nested, 0); assert.equal(f.owner.snapshot().calls.length, 1);
});

test('clock and limit callback reentrancy cannot obtain mutation authority', () => {
  let owner, invoked = 0;
  owner = createDecisionBudget({ clock: () => { bad(() => owner.reserve()); return NOW; },
    getLimit: () => { invoked++; bad(() => owner.reserve()); bad(() => owner.limit()); return 1; } });
  assert.equal(owner.reserve().ok, true); assert(invoked >= 2); assert.equal(owner.snapshot().calls.length, 1);
});

test('limit reduction during callback is checked before commit', () => {
  const f = ownerFixture({ limit: 2 }); f.owner.reserve(); const before = f.owner.snapshot();
  bad(() => f.owner.transact((base, frame) => { f.cap = 1; return append(base, frame.now); }), 'budget_exhausted');
  assert.strictEqual(f.owner.snapshot(), before); assert.equal(f.owner.reserve().ok, false);
});

test('entry ceiling prevents a reentrant increase from enlarging that transaction', () => {
  const f = ownerFixture({ limit: 1 }); f.owner.reserve();
  bad(() => f.owner.transact((base, frame) => { f.cap = 30; assert.equal(f.owner.limit(), 1); return append(base, frame.now); }), 'budget_exhausted');
  assert.equal(f.owner.reserve().ok, true); assert.equal(f.owner.snapshot().calls.length, 2);
});

test('candidate cannot refund, reorder, replace or append more than one current call', () => {
  const f = ownerFixture({ initialBudget: { calls: [NOW - 2, NOW - 1] } }); const before = f.owner.snapshot();
  for (const calls of [[], [NOW - 1], [NOW - 1, NOW - 2], [NOW - 2, NOW], [NOW - 2, NOW - 1, NOW, NOW], [NOW - 2, NOW - 1, NOW + 1], [NOW - 2, NOW - 1, NOW - HOUR]])
    bad(() => f.owner.transact(() => ({ budget: { calls }, value: null })));
  assert.strictEqual(f.owner.snapshot(), before);
});

test('callback throw or rejected asynchronous contract never commits', () => {
  const f = ownerFixture(); const before = f.owner.snapshot();
  assert.throws(() => f.owner.transact(() => { throw new Error('fixed fake failure'); }), /fixed fake failure/u);
  bad(() => f.owner.transact(async (base, frame) => append(base, frame.now)));
  bad(() => f.owner.transact((base, frame) => append(base, frame.now, Promise.resolve('later'))));
  const thenable = Object.create({ then() {} }); bad(() => f.owner.transact((base, frame) => append(base, frame.now, thenable)));
  assert.strictEqual(f.owner.snapshot(), before); assert.equal(f.owner.reserve().ok, true);
});

test('passive closed data validation never evaluates accessors', () => {
  let getter = 0; const getterBudget = { get calls() { getter++; return []; } };
  const accessorArray = []; Object.defineProperty(accessorArray, '0', { enumerable: true, get() { getter++; return NOW; } });
  for (const initialBudget of [getterBudget, { calls: accessorArray }, { calls: Array(1) }, { calls: [NOW], extra: true }, { calls: [NaN] }, { calls: [-1] }, { calls: Array(31).fill(NOW) }])
    bad(() => createDecisionBudget({ initialBudget }));
  bad(() => createDecisionBudget({ get clock() { getter++; return () => NOW; } }));
  const f = ownerFixture(); const candidate = { budget: { calls: [] }, get value() { getter++; return true; } };
  bad(() => f.owner.transact(() => candidate));
  const thenable = { get then() { getter++; return () => {}; } }; bad(() => f.owner.transact((base, frame) => append(base, frame.now, thenable)));
  assert.equal(getter, 0); assert.equal(f.owner.snapshot().calls.length, 0);
});

test('unreadable or invalid current limit never silently defaults', () => {
  for (const getLimit of [() => undefined, () => -1, () => 31, () => 1.5, () => Promise.resolve(1), () => { throw new Error('fixed'); }]) {
    const owner = createDecisionBudget({ clock: () => NOW, getLimit }); bad(() => owner.limit()); bad(() => owner.reserve()); assert.equal(owner.snapshot().calls.length, 0);
  }
  for (const clock of [() => -1, () => NaN, () => Promise.resolve(NOW), () => { throw new Error('fixed'); }])
    bad(() => createDecisionBudget({ clock }).reserve());
});

test('actual checkpoints adapter reserves once and failed dispatch has no refund path', () => {
  const f = ownerFixture({ limit: 1 });
  const taken = f.owner.transact((base, frame) => {
    const value = takeBudget(base, { now: frame.now, limit: f.owner.limit() }); return { budget: value.budget, value };
  });
  assert.equal(taken.ok, true); assert.equal(f.owner.reserve().ok, false);
  // A transport/cancellation result cannot remove the committed reservation.
  bad(() => f.owner.transact(() => ({ budget: { calls: [] }, value: 'cancelled' })));
  assert.equal(f.owner.snapshot().calls.length, 1); assert.equal(Object.hasOwn(f.owner, 'refund'), false);
});

test('older trusted checkpoint timestamp is stamped at owner reservation time', () => {
  const f = ownerFixture();
  const proposal = f.owner.transact(base => append(base, NOW - 5, { budget: { calls: [NOW - 5] } }));
  assert.equal(proposal.budget.calls[0], NOW - 5); assert.equal(f.owner.snapshot().calls[0], NOW);
});

// Actual ProviderDecision constructor hook with a synthetic pipe object. No OS child.
function fakeHost(onSending, { hold = false, failWrite = false } = {}) {
  const f = { frames: [], sending: [], queue: [], readers: [], exit: deferred(), ended: false, seq: 0, timers: new Map() };
  f.push = value => { const text = JSON.stringify(value) + '\n'; if (f.readers.length) f.readers.shift()(text); else f.queue.push(text); };
  f.reply = frame => f.push({ version: 1, id: frame.id, result: { version: 1, request_id: frame.params.request_id,
    choice_set: 'watch_v1', context_version: 'watch-1', outcome: 'ready', reason: 'validated', data_sent: true,
    authority: 'suggestion_only', action_authorized: false, provider: 'jev', confidence: 0.9 } });
  const child = {
    stdout: { readString: () => f.queue.length ? Promise.resolve(f.queue.shift()) : f.ended ? Promise.resolve(null) : new Promise(r => f.readers.push(r)), close: async () => { while (f.readers.length) f.readers.shift()(null); } },
    stderr: { readString: async () => null, close: async () => {} },
    stdin: { write: text => { const frame = JSON.parse(text); f.frames.push(frame); if (failWrite) throw new Error('fixed fake write failure'); if (!hold) f.reply(frame); }, close: async () => {} },
    wait: () => f.exit.promise,
    kill: async () => { f.ended = true; while (f.readers.length) f.readers.shift()(null); f.exit.resolve({ exitCode: 0 }); },
  };
  f.decide = createDecide({ onSending: info => { f.sending.push(info); return onSending(info); }, runtime: {
    now: () => NOW, uuid: () => `fake:${++f.seq}`,
    env: key => ({ AXIOSOZO_PROVIDER_NODE: '/fake/node', AXIOSOZO_PROVIDER_HOST: '/fake/packages/provider-host/cli.mjs' })[key] ?? '',
    timers: { setTimeout(fn) { const id = ++f.seq; f.timers.set(id, fn); return id; }, clearTimeout(id) { f.timers.delete(id); } },
    spawn: async () => child,
  } });
  return f;
}
function watchFixture(budget, { liveAuthorized = true, openGate = null, hold = false, failWrite = false } = {}) {
  const watch = createWatch({ id: 'w_shared1', projectId: 'p_12345678', url: 'https://example.test/status', question: 'Synthetic readiness?',
    outcomes: [{ id: 'ready', label: 'Ready' }, { id: 'waiting', label: 'Waiting' }], now: NOW - 1000, userCreated: true, observation: 'address', consent: true });
  const f = { doc: { version: 1, watches: [watch] }, events: [], timerSeq: 0, timers: new Map() };
  const pre = { scope_epoch: 1, context_id: 'normal_fake', context_registered: true, context_normal: true, project_id: watch.project_id,
    project_updated_at: NOW - 1000, root_revision: 1, container_id: 42, container_generation: 1,
    consent_granted: true, is_private: false, is_blocked: false, url_allowed: true };
  const document = { browsing_context_id: 10, inner_window_id: 20, complete_top_document: true, document_url: watch.url,
    is_error_document: false, channel_status: 0, failed_channel_status: null, password_clear: true, subframes_safe: true };
  f.host = fakeHost(info => f.controller.beforeSending(info), { hold, failWrite });
  f.controller = createWatchController({ budget, liveAuthorized, clock: () => NOW, requestId: () => 'watch:fake1',
    timers: { setTimeout(fn) { const id = ++f.timerSeq; f.timers.set(id, fn); return id; }, clearTimeout(id) { f.timers.delete(id); } },
    store: { load: async () => f.doc, update: async fn => { f.doc = validateWatchStore(fn(f.doc)); return f.doc; } },
    admission: { read: ({ handle }) => ({ ...pre, ...(handle ? document : {}) }) },
    tabs: { open: async () => { f.events.push('open'); if (openGate) await openGate.promise; return { owned: true }; },
      capture: async () => ({ witness: { ...pre, ...document }, observation: { url: watch.url, title: 'Synthetic' } }),
      close: async () => { f.events.push('close'); } },
    indicator: { show: async () => ({ owned: true }), isVisible: () => true, hide: async () => { f.events.push('hide'); } },
    decide: f.host.decide,
  });
  f.run = () => f.controller.run({ id: watch.id });
  f.close = async () => { await f.controller.dispose(); await f.host.decide.close(); };
  return f;
}

test('actual watch adapter shares owner with site rules and constructor handoff guard', async () => {
  const owner = createDecisionBudget({ clock: () => NOW, getLimit: () => 2 }); assert.equal(owner.reserve().ok, true);
  const f = watchFixture(owner); const result = await f.run();
  assert.equal(result.code, 'APPLIED'); assert.equal(result.data_sent, true); assert.equal(owner.snapshot().calls.length, 2);
  assert.equal(owner.reserve().ok, false); assert.equal(f.host.frames.length, 1);
  assert.deepEqual(f.host.sending, [{ request_id: 'watch:fake1', level: 'address' }]);
  assert.deepEqual(f.events, ['open', 'close', 'hide']); await f.close();
});

test('site reservation while watch opens wins the last shared slot', async () => {
  const owner = createDecisionBudget({ clock: () => NOW, getLimit: () => 1 }); const gate = deferred();
  const f = watchFixture(owner, { openGate: gate }); const running = f.run(); await flush();
  assert.deepEqual(f.events, ['open']); assert.equal(owner.reserve().ok, true); gate.resolve();
  const result = await running; assert.equal(result.code, 'budget_exhausted'); assert.equal(f.host.frames.length, 0);
  assert.equal(owner.snapshot().calls.length, 1); await f.close();
});

test('watch pending reply consumes a slot and uncertain write never refunds it', async () => {
  const owner = createDecisionBudget({ clock: () => NOW, getLimit: () => 1 }); const f = watchFixture(owner, { hold: true });
  const running = f.run(); await flush(); assert.equal(f.host.frames.length, 1);
  assert.equal(owner.reserve().ok, false); f.host.reply(f.host.frames[0]); assert.equal((await running).code, 'APPLIED'); await f.close();
  const second = createDecisionBudget({ clock: () => NOW, getLimit: () => 1 }); const broken = watchFixture(second, { failWrite: true });
  const result = await broken.run(); assert.equal(result.data_sent, true); assert.equal(result.outcome, 'unknown');
  assert.equal(second.snapshot().calls.length, 1); assert.equal(second.reserve().ok, false); await broken.close();
});

test('production watch authorization remains closed with zero budget/native/host work', async () => {
  const owner = createDecisionBudget({ clock: () => NOW }); let reads = 0;
  const budget = { snapshot() { reads++; return owner.snapshot(); }, limit() { reads++; return owner.limit(); }, transact(fn) { reads++; return owner.transact(fn); } };
  const f = watchFixture(budget, { liveAuthorized: false }); const result = await f.run();
  assert.equal(result.code, 'NOT_AUTHORIZED'); assert.equal(reads, 0); assert.equal(f.events.length, 0); assert.equal(f.host.frames.length, 0);
  assert.equal(owner.snapshot().calls.length, 0); await f.close();
});

test('per-request onSending cannot replace the trusted constructor hook', async () => {
  const owner = createDecisionBudget({ clock: () => NOW }); const f = watchFixture(owner); await f.controller.load();
  // Build an actual watch request using the trusted frozen core through a separate
  // controller, then reuse the recorded JSON against a constructor that denies it.
  const result = await f.run(); assert.equal(result.code, 'APPLIED'); const request = f.host.frames[0].params; await f.close();
  let forged = 0; const denied = fakeHost(() => { throw new Error('fixed trusted denial'); });
  const neutral = await denied.decide(request, { onSending() { forged++; return true; } });
  assert.equal(neutral.reason, 'cancelled'); assert.equal(neutral.data_sent, false); assert.equal(forged, 0);
  assert.equal(denied.sending.length, 1); assert.equal(denied.frames.length, 0); await denied.decide.close();
});


test('rejected canonical native Promise callbacks are denied without unhandled rejection', async () => {
  const fixed = () => Promise.reject(new Error('fixed rejected fake'));
  const f = ownerFixture(); const before = f.owner.snapshot();
  bad(() => f.owner.transact(async () => { throw new Error('fixed async fake'); }));
  bad(() => f.owner.transact(fixed));
  bad(() => f.owner.transact((base, frame) => append(base, frame.now, fixed())));
  bad(() => createDecisionBudget({ clock: fixed }).reserve());
  bad(() => createDecisionBudget({ clock: () => NOW, getLimit: fixed }).reserve());
  const promise = fixed(); Object.defineProperty(promise, 'then', { get() { throw new Error('then must not execute'); } });
  bad(() => f.owner.transact(() => promise));
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(f.owner.snapshot(), before); assert.equal(f.owner.reserve().ok, true);
});
