// Synthetic callbacks and pipe objects only; no native host, provider, profile or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecisionSendingRouter, DecisionSendingError } from '../chrome/DecisionSendingRouter.sys.mjs';
import { createDecide } from '../chrome/ProviderDecision.sys.mjs';
const NOW = 1790000000000;
const denied = (fn, code = 'cancelled') => assert.throws(fn, error => error instanceof DecisionSendingError && error.code === code);
const info = (request_id, level = 'address') => ({ request_id, level });
const register = (router, requestId, beforeSending = () => true, level = 'address') => router.register({ requestId, level, beforeSending });

test('one constructor router addresses only the exact private request owner', () => {
  const router = createDecisionSendingRouter(), seen = [];
  const a = register(router, 'site:windowA', value => { seen.push(['a', value]); return true; });
  const b = register(router, 'site:windowB', value => { seen.push(['b', value]); return true; });
  const watch = register(router, 'watch:check1', value => { seen.push(['watch', value]); return true; });
  assert.equal(router.beforeSending(info('site:windowA')), true); assert.equal(seen.length, 1); assert.equal(seen[0][0], 'a');
  assert.equal(router.beforeSending(info('watch:check1')), true); assert.equal(seen.length, 2); assert.equal(seen[1][0], 'watch');
  assert(Object.isFrozen(seen[0][1])); assert.equal(b.signal.aborted, false);
  a.revoke(); assert.equal(a.signal.aborted, true); assert.equal(b.signal.aborted, false); assert.equal(watch.signal.aborted, false);
  router.close(); assert.equal(b.signal.aborted, true); assert.equal(watch.signal.aborted, true);
});

test('unknown, wrong level, duplicate and revoked handoffs never call a guard', () => {
  const router = createDecisionSendingRouter(); let called = 0;
  const lease = register(router, 'watch:owned', () => { called++; return true; }, 'outline');
  denied(() => router.beforeSending(info('watch:unknown', 'outline'))); denied(() => router.beforeSending(info('watch:owned')));
  assert.equal(called, 0); denied(() => register(router, 'watch:owned'), 'REQUEST_ID_CONFLICT');
  assert.equal(router.beforeSending(info('watch:owned', 'outline')), true);
  denied(() => router.beforeSending(info('watch:owned', 'outline'))); assert.equal(called, 1);
  lease.revoke(); lease.revoke(); denied(() => router.beforeSending(info('watch:owned', 'outline'))); assert.equal(called, 1);
});

test('lease revocation is idempotent and cannot revoke a replacement registration', () => {
  const router = createDecisionSendingRouter(); const first = register(router, 'site:reused'); first.revoke();
  const replacement = register(router, 'site:reused'); first.revoke();
  assert.equal(replacement.signal.aborted, false); assert.equal(router.beforeSending(info('site:reused')), true); router.close();
});

test('revocation or replacement during synchronous admission prevents that send', () => {
  const router = createDecisionSendingRouter(); let lease;
  lease = register(router, 'site:current', () => { lease.revoke(); register(router, 'site:current'); return true; });
  denied(() => router.beforeSending(info('site:current'))); assert.equal(lease.signal.aborted, true);
  assert.equal(router.beforeSending(info('site:current')), true); router.close();
});

test('nontrue, throwing and asynchronous guards deny synchronous admission', () => {
  for (const guard of [() => false, () => undefined, () => 1, () => { throw new Error('fixed synthetic denial'); }, async () => true]) {
    const router = createDecisionSendingRouter(); register(router, 'watch:guard', guard);
    denied(() => router.beforeSending(info('watch:guard'))); router.close();
  }
});

test('reentrant guard cannot authorize itself twice', () => {
  const router = createDecisionSendingRouter(); let called = 0;
  register(router, 'watch:nested', () => { called++; denied(() => router.beforeSending(info('watch:nested'))); return true; });
  assert.equal(router.beforeSending(info('watch:nested')), true); assert.equal(called, 1);
  denied(() => router.beforeSending(info('watch:nested'))); router.close();
});

test('closed router aborts only retained leases and rejects new registration', () => {
  const router = createDecisionSendingRouter(); const one = register(router, 'site:one'), two = register(router, 'watch:two');
  router.close(); router.close(); assert.equal(one.signal.aborted, true); assert.equal(two.signal.aborted, true);
  denied(() => register(router, 'site:three')); denied(() => router.beforeSending(info('site:one')));
});

test('registration and hook inputs are passive closed records, with no callback from request options', () => {
  const router = createDecisionSendingRouter(); let getters = 0;
  denied(() => router.register({ requestId: 'site:one', level: 'address', get beforeSending() { getters++; return () => true; } }), 'INVALID_INPUT');
  denied(() => router.register({ requestId: 'site:one', level: 'address', beforeSending: () => true, actor: true }), 'INVALID_INPUT');
  register(router, 'site:one');
  denied(() => router.beforeSending({ request_id: 'site:one', get level() { getters++; return 'address'; } }));
  denied(() => router.beforeSending({ ...info('site:one'), beforeSending: () => true })); assert.equal(getters, 0); router.close();
});

function request(id = 'site:host') {
  return { version: 1, request_id: id, choice_set: 'site_rule_v1', context_version: 'site-rule-1', deadline_ms: NOW + 5000,
    state: { rule: { id: 'r_7f3a', instruction: 'Synthetic instruction', effects: ['nudge'] }, context_type: 'personal', checkpoint: 'commit',
      elapsed: { today_ms: 0, foreground_session_ms: 0 }, observation: { level: 'address', address: { origin: 'https://example.test', path: '/status', title: 'Synthetic' } } } };
}
function fakeHost(router) {
  const f = { frames: [], queue: [], readers: [], timers: new Map(), seq: 0, ended: false };
  let end; const exit = new Promise(resolve => { end = resolve; });
  const child = {
    stdout: { readString: () => f.queue.length ? Promise.resolve(f.queue.shift()) : f.ended ? Promise.resolve(null) : new Promise(resolve => f.readers.push(resolve)),
      close: async () => { while (f.readers.length) f.readers.shift()(null); } },
    stderr: { readString: async () => null, close: async () => {} },
    stdin: { write(text) { const frame = JSON.parse(text); f.frames.push(frame);
      if (frame.method !== 'decision/site_rule') return;
      const value = JSON.stringify({ version: 1, id: frame.id, result: { version: 1, request_id: frame.params.request_id,
        choice_set: 'site_rule_v1', context_version: 'site-rule-1', outcome: 'nudge', reason_code: 'drift', reason: 'validated', data_sent: true,
        authority: 'suggestion_only', action_authorized: false, provider: 'jev', confidence: 0.9 } }) + '\n';
      if (f.readers.length) f.readers.shift()(value); else f.queue.push(value);
    }, close: async () => {} },
    wait: () => exit, kill: async () => { f.ended = true; while (f.readers.length) f.readers.shift()(null); end({ exitCode: 0 }); },
  };
  f.decide = createDecide({ onSending: router.beforeSending, runtime: { now: () => NOW, uuid: () => `fake:${++f.seq}`,
    env: key => ({ AXIOSOZO_PROVIDER_NODE: '/fake/node', AXIOSOZO_PROVIDER_HOST: '/fake/packages/provider-host/cli.mjs' })[key] ?? '',
    spawn: async () => child,
    timers: { setTimeout(fn) { const id = ++f.seq; f.timers.set(id, fn); return id; }, clearTimeout(id) { f.timers.delete(id); } },
  } });
  return f;
}

test('active provider constructor denies unknown requests even with forged per-request callback', async () => {
  const router = createDecisionSendingRouter(), host = fakeHost(router); let forged = 0;
  const result = await host.decide(request(), { onSending() { forged++; return true; } });
  assert.equal(result.reason, 'cancelled'); assert.equal(result.data_sent, false); assert.equal(forged, 0); assert.equal(host.frames.length, 0);
  router.close(); await host.decide.close();
});

test('active provider uses registered exact owner once; mapping stays owned until reply settlement', async () => {
  const router = createDecisionSendingRouter(), host = fakeHost(router); let calls = 0;
  const lease = register(router, 'site:host', () => { calls++; return true; });
  const result = await host.decide(request(), { signal: lease.signal });
  assert.equal(result.outcome, 'nudge'); assert.equal(result.data_sent, true); assert.equal(calls, 1); assert.equal(host.frames.length, 1);
  assert.equal(lease.signal.aborted, false); denied(() => register(router, 'site:host'), 'REQUEST_ID_CONFLICT');
  lease.revoke(); assert.equal(lease.signal.aborted, true); router.close(); await host.decide.close();
});

test('revoking in the hook continuation aborts before provider writes', async () => {
  const router = createDecisionSendingRouter(), host = fakeHost(router); let lease;
  lease = register(router, 'site:host', () => { queueMicrotask(() => lease.revoke()); return true; });
  const result = await host.decide(request(), { signal: lease.signal });
  assert.equal(result.reason, 'cancelled'); assert.equal(result.data_sent, false); assert.equal(host.frames.length, 0);
  assert.equal(lease.signal.aborted, true); router.close(); await host.decide.close();
});


test('rejected canonical native guard Promises are synchronously denied and handled', async () => {
  for (const guard of [async () => { throw new Error('fixed async fake'); }, () => Promise.reject(new Error('fixed rejected fake')),
    () => { const value = Promise.reject(new Error('fixed getter fake')); Object.defineProperty(value, 'then', { get() { throw new Error('then must not execute'); } }); return value; }]) {
    const router = createDecisionSendingRouter(); const lease = register(router, 'watch:async', guard);
    denied(() => router.beforeSending(info('watch:async'))); assert.equal(lease.signal.aborted, false);
    router.close();
  }
  await new Promise(resolve => setImmediate(resolve));
});
