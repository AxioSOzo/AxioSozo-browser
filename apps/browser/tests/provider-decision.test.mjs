// TEST FIXTURES ONLY: a fake subprocess stands in for the provider host. No process, Keychain or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecide, validateDecisionResult } from '../chrome/ProviderDecision.sys.mjs';

const NOW = 1790000000000;
const tick = async (n = 3) => { for (let i = 0; i < n; i++) await new Promise(resolve => setImmediate(resolve)); };
const request = (overrides = {}) => ({ version: 1, request_id: 'req_1', choice_set: 'site_rule_v1', context_version: 'site-rule-1', deadline_ms: NOW + 5000,
  state: { rule: { id: 'r_7f3a', instruction: 'Nudge me if I drift into the feed.', effects: ['nudge'] }, context_type: 'personal', checkpoint: 'commit',
    elapsed: { today_ms: 1000, foreground_session_ms: 1000 }, observation: { level: 'address', address: { origin: 'https://x.com', path: '/home', title: 'Home' } } }, ...overrides });
const valid = params => ({ version: 1, request_id: params.request_id, choice_set: 'site_rule_v1', context_version: 'site-rule-1', outcome: 'nudge',
  reason_code: 'drift', reason: 'validated', data_sent: true, authority: 'suggestion_only', action_authorized: false, model: 'jev-1.13.0' });
const neutral = (reason, data_sent, request_id = 'req_1') => ({ version: 1, request_id, choice_set: 'site_rule_v1', context_version: 'site-rule-1',
  outcome: 'none', reason_code: null, reason, data_sent, authority: 'suggestion_only', action_authorized: false });

function fixture({ respond = (frame, child) => { if (frame.method === 'decision/site_rule') child.push({ version: 1, id: frame.id, result: valid(frame.params) }); }, env = {}, onSending } = {}) {
  const calls = [], frames = [], timers = new Map(), children = [], log = [];
  let sequence = 0;
  function makeChild() {
    const readers = [], chunks = []; let exited = false, finish, killed = 0;
    const exit = new Promise(resolve => { finish = resolve; });
    const child = { frames: [], killed: () => killed,
      push(value) { const chunk = typeof value === 'string' ? value : JSON.stringify(value) + '\n'; if (readers.length) readers.shift()(chunk); else chunks.push(chunk); },
      exit() { exited = true; while (readers.length) readers.shift()(null); finish({ exitCode: 0 }); } };
    child.api = {
      stdout: { readString: () => chunks.length ? Promise.resolve(chunks.shift()) : exited ? Promise.resolve(null) : new Promise(resolve => readers.push(resolve)) },
      stderr: { readString: async () => null },
      stdin: { write: async text => { const frame = JSON.parse(text); log.push(`write:${frame.method}`); frames.push(frame); child.frames.push(frame); respond(frame, child); }, close: async () => {} },
      wait: () => exit, kill: async () => { killed++; child.exit(); },
    };
    return child;
  }
  const runtime = {
    uuid: () => `id-${++sequence}`, now: () => NOW,
    env: key => ({ AXIOSOZO_PROVIDER_NODE: '/runtime/node', AXIOSOZO_PROVIDER_HOST: '/project/packages/provider-host/cli.mjs',
      AXIOSOZO_BUILD_ROOT: '/Volumes/AxioSozoBuild', AXIOSOZO_PROVIDER_HOME: '/Users/someone', ...env })[key] || '',
    timers: { setTimeout: (fn, ms) => { const id = ++sequence; timers.set(id, { fn, ms }); return id; }, clearTimeout: id => timers.delete(id) },
    spawn: async options => { calls.push(options); const child = makeChild(); children.push(child); return child.api; },
  };
  const sending = [];
  const decide = createDecide({ runtime, onSending: onSending ?? (info => { log.push('onSending'); sending.push(info); }) });
  return { decide, calls, frames, timers, children, log, sending, runtime };
}

test('construction is inert; the first decide starts the fixed host with a minimal environment and reuses it', async () => {
  const f = fixture(); assert.equal(f.calls.length, 0);
  const result = await f.decide(request());
  assert.deepEqual(result, valid(request())); assert(Object.isFrozen(result));
  assert.deepEqual(f.calls, [{ command: '/runtime/node', arguments: ['/project/packages/provider-host/cli.mjs', 'serve'], environmentAppend: false,
    environment: { PATH: '/usr/bin:/bin', LANG: 'C', AXIOSOZO_BUILD_ROOT: '/Volumes/AxioSozoBuild' }, stderr: 'pipe' }]);
  assert.deepEqual(f.frames[0], { version: 1, id: f.frames[0].id, method: 'decision/site_rule', params: request() });
  assert.deepEqual(f.log, ['onSending', 'write:decision/site_rule']); assert.deepEqual(f.sending, [{ request_id: 'req_1', level: 'address' }]);
  await f.decide(request({ request_id: 'req_2' })); assert.equal(f.calls.length, 1);
  assert.equal(f.timers.size, 0); await f.decide.close(); assert.equal(f.children[0].killed(), 1);
});

test('invalid or oversized requests resolve INVALID_INPUT without starting a host or signalling sending', async () => {
  const f = fixture();
  const none = request(); none.state.observation.level = 'none';
  const huge = request(); huge.state.rule.instruction = 'x'.repeat(80000);
  const cyclic = request(); cyclic.state.self = cyclic;
  for (const input of [null, 'text', { ...request(), choice_set: 'highlight_v1' }, request({ request_id: 'bad id' }), request({ request_id: 123 }), none, huge]) {
    const result = await f.decide(input); assert.equal(result.outcome, 'none'); assert.equal(result.reason, 'INVALID_INPUT'); assert.equal(result.data_sent, false);
  }
  assert.equal(f.frames.length, 0); assert.equal(f.sending.length, 0);
  assert.deepEqual(await f.decide(cyclic), neutral('INVALID_INPUT', false)); assert.equal(f.frames.length, 0);
  await f.decide.close();
});

test('missing host configuration and spawn failure never reject', async () => {
  const f = fixture({ env: { AXIOSOZO_PROVIDER_HOST: '/elsewhere/cli.mjs' } });
  assert.deepEqual(await f.decide(request()), neutral('HOST_UNAVAILABLE', false)); assert.equal(f.calls.length, 0); assert.equal(f.sending.length, 0);
  const g = fixture(); g.runtime.spawn = async () => { throw new Error('spawn failed /secret/path'); };
  assert.deepEqual(await g.decide(request()), neutral('HOST_UNAVAILABLE', false));
});

test('an onSending failure sends nothing', async () => {
  const f = fixture({ onSending: () => { throw new Error('indicator unavailable'); } });
  assert.deepEqual(await f.decide(request()), neutral('cancelled', false)); assert.equal(f.frames.length, 0); await f.decide.close();
});

test('host replies are re-validated: unlisted effects, authority claims, free text and extra keys become none', async () => {
  const mutations = [r => { r.outcome = 'pause_site'; }, r => { r.action_authorized = true; }, r => { r.authority = 'granted'; },
    r => { r.reason_code = 'You are scrolling'; }, r => { r.message = '<b>markup</b>'; }, r => { r.request_id = 'req_other'; },
    r => { r.model = 'jev-latest'; }, r => { r.reason = 'Something went wrong'; }, r => { r.outcome = 'none'; }, r => { r.data_sent = false; }];
  for (const mutate of mutations) {
    const f = fixture({ respond: (frame, child) => { const result = valid(frame.params); mutate(result); child.push({ version: 1, id: frame.id, result }); } });
    const result = await f.decide(request());
    assert.equal(result.outcome, 'none'); assert.equal(result.reason, 'malformed_output'); assert.equal(result.data_sent, true);
    assert.deepEqual(Object.keys(result), Object.keys(neutral('x', true))); await f.decide.close();
  }
  const quiet = fixture({ respond: (frame, child) => child.push({ version: 1, id: frame.id, result: { ...neutral('disabled', false), extra: 1 } }) });
  assert.deepEqual(await quiet.decide(request()), neutral('malformed_output', true)); await quiet.decide.close();
  assert.equal(validateDecisionResult({ ...neutral('budget_exhausted', false) }, request()).reason, 'budget_exhausted');
});

test('host envelope errors resolve none without data_sent', async () => {
  for (const [code, reason] of [['INVALID_INPUT', 'INVALID_INPUT'], ['BACKPRESSURE', 'HOST_UNAVAILABLE'], ['<script>', 'HOST_UNAVAILABLE']]) {
    const f = fixture({ respond: (frame, child) => child.push({ version: 1, id: frame.id, error: { code, message: 'x' } }) });
    assert.deepEqual(await f.decide(request()), neutral(reason, false)); await f.decide.close();
  }
});

test('host exit mid-request is conservatively disclosed and the next call starts a fresh host', async () => {
  const f = fixture({ respond: (frame, child) => { if (child.frames.length === 1 && f.children.length === 1) child.exit(); else child.push({ version: 1, id: frame.id, result: valid(frame.params) }); } });
  assert.deepEqual(await f.decide(request()), neutral('HOST_UNAVAILABLE', true));
  assert.equal((await f.decide(request({ request_id: 'req_2' }))).outcome, 'nudge'); assert.equal(f.calls.length, 2);
  await f.decide.close();
});

test('malformed host output retires the host', async () => {
  const f = fixture({ respond: (_frame, child) => child.push('{not json\n') });
  assert.deepEqual(await f.decide(request()), neutral('HOST_UNAVAILABLE', true)); await tick();
  assert.equal(f.children[0].killed(), 1); assert.equal(f.decide.diagnostics().running, false);
});

test('a silent host times out after the deadline plus grace and is reaped', async () => {
  const f = fixture({ respond: () => {} });
  const pending = f.decide(request()); await tick();
  const [timer] = [...f.timers.values()]; assert.equal(timer.ms, 5000 + 2000);
  timer.fn(); assert.deepEqual(await pending, neutral('timeout', true)); await tick();
  assert.equal(f.children[0].killed(), 1); assert.equal(f.timers.size, 0);
});

test('abort before start sends nothing; abort in flight asks the host to cancel the fetch', async () => {
  const f = fixture(); const early = new AbortController(); early.abort();
  assert.deepEqual(await f.decide(request(), { signal: early.signal }), neutral('cancelled', false)); assert.equal(f.calls.length, 0);
  const g = fixture({ respond: (frame, child) => {
    if (frame.method === 'decision/cancel') child.push({ version: 1, id: g.frames[0].id, result: neutral('cancelled', true) });
  } });
  const controller = new AbortController(); const pending = g.decide(request(), { signal: controller.signal }); await tick();
  controller.abort(); assert.deepEqual(await pending, neutral('cancelled', true));
  assert.deepEqual(g.frames[1], { version: 1, id: g.frames[1].id, method: 'decision/cancel', params: { request_id: 'req_1' } });
  const h = fixture({ respond: () => {} }); const silent = new AbortController();
  const waiting = h.decide(request(), { signal: silent.signal }); await tick(); silent.abort(); await tick();
  [...h.timers.values()].find(timer => timer.ms === 1000).fn();
  assert.deepEqual(await waiting, neutral('cancelled', true)); assert.equal(h.timers.size, 0);
  await g.decide.close(); await h.decide.close();
});

test('host_idle retires the host; close resolves pending calls and later calls never start a host', async () => {
  const f = fixture(); await f.decide(request());
  f.children[0].push({ version: 1, event: { version: 1, type: 'host_idle', session_id: null } }); await tick();
  assert.equal(f.children[0].killed(), 1);
  await f.decide(request({ request_id: 'req_2' })); assert.equal(f.calls.length, 2);
  const g = fixture({ respond: () => {} }); const pending = g.decide(request()); await tick();
  await g.decide.close(); assert.deepEqual(await pending, neutral('cancelled', true));
  assert.deepEqual(await g.decide(request()), neutral('cancelled', false)); assert.equal(g.calls.length, 1);
  await f.decide.close();
});
