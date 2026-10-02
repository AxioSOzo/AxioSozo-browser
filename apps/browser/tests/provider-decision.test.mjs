// TEST FIXTURES ONLY: a fake subprocess stands in for the provider host. No process, Keychain or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecide, validateDecisionResult } from '../chrome/ProviderDecision.sys.mjs';
import { DecisionProvider } from '../../../packages/provider-host/src/decision.mjs';

const NOW = 1790000000000;
const tick = async (n = 3) => { for (let i = 0; i < n; i++) await new Promise(resolve => setImmediate(resolve)); };
const request = (overrides = {}) => ({ version: 1, request_id: 'req_1', choice_set: 'site_rule_v1', context_version: 'site-rule-1', deadline_ms: NOW + 5000,
  state: { rule: { id: 'r_7f3a', instruction: 'Nudge me if I drift into the feed.', effects: ['nudge'] }, context_type: 'personal', checkpoint: 'commit',
    elapsed: { today_ms: 1000, foreground_session_ms: 1000 }, observation: { level: 'address', address: { origin: 'https://x.com', path: '/home', title: 'Home' } } }, ...overrides });
const valid = params => ({ version: 1, request_id: params.request_id, choice_set: 'site_rule_v1', context_version: 'site-rule-1', outcome: 'nudge',
  reason_code: 'drift', reason: 'validated', data_sent: true, authority: 'suggestion_only', action_authorized: false, model: 'jev-1.13.0', provider: 'jev', confidence: 0.95 });
const neutral = (reason, data_sent, request_id = 'req_1') => ({ version: 1, request_id, choice_set: 'site_rule_v1', context_version: 'site-rule-1',
  outcome: 'none', reason_code: null, reason, data_sent, authority: 'suggestion_only', action_authorized: false, provider: 'jev', confidence: null });

function fixture({ respond = (frame, child) => { if (frame.method === 'decision/site_rule') child.push({ version: 1, id: frame.id, result: valid(frame.params) }); }, env = {}, onSending } = {}) {
  const calls = [], frames = [], timers = new Map(), children = [], log = [];
  let sequence = 0;
  function makeChild() {
    const readers = [], chunks = []; let exited = false, finish, killed = 0; const pipeCloses = [];
    const exit = new Promise(resolve => { finish = resolve; });
    const child = { frames: [], pipeCloses, killed: () => killed,
      push(value) { const chunk = typeof value === 'string' ? value : JSON.stringify(value) + '\n'; if (readers.length) readers.shift()(chunk); else chunks.push(chunk); },
      exit() { exited = true; while (readers.length) readers.shift()(null); finish({ exitCode: 0 }); } };
    child.api = {
      stdout: { close: async force => { pipeCloses.push(["stdout", force]); while (readers.length) readers.shift()(null); }, readString: () => chunks.length ? Promise.resolve(chunks.shift()) : exited ? Promise.resolve(null) : new Promise(resolve => readers.push(resolve)) },
      stderr: { close: async force => { pipeCloses.push(["stderr", force]); }, readString: async () => null },
      stdin: { write: async text => { const frame = JSON.parse(text); log.push(`write:${frame.method}`); frames.push(frame); child.frames.push(frame); respond(frame, child); }, close: async force => { pipeCloses.push(["stdin", force]); } },
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
  assert.equal(f.calls.length, 0); assert.equal(f.frames.length, 0); assert.equal(f.sending.length, 0);
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
  const [timer] = [...f.timers.values()]; assert.equal(timer.ms, 5000);
  timer.fn(); await tick(); [...f.timers.values()].find(timer => timer.ms === 2000).fn();
  assert.deepEqual(await pending, neutral('timeout', true)); await tick();
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


const watchRequest = (overrides = {}) => ({ version: 1, request_id: 'watch_1', choice_set: 'watch_v1', context_version: 'watch-1', deadline_ms: NOW + 5000,
  state: { watch: { id: 'w_build', question: 'Has the build finished?', outcomes: [{ id: 'finished', label: 'Finished' }, { id: 'running', label: 'Running' }] },
    observation: { level: 'address', address: { origin: 'https://example.test', path: '/build', title: 'Build' } } }, ...overrides });
const watchReply = (params, overrides = {}) => ({ version: 1, request_id: params.request_id, choice_set: 'watch_v1', context_version: 'watch-1',
  outcome: 'finished', reason: 'validated', data_sent: true, authority: 'suggestion_only', action_authorized: false,
  provider: 'jev', confidence: 0.9, model: 'jev-1.13.0', ...overrides });
const watchNeutral = (params, reason, data_sent) => ({ version: 1, request_id: params.request_id, choice_set: 'watch_v1', context_version: 'watch-1',
  outcome: 'unknown', reason, data_sent, authority: 'suggestion_only', action_authorized: false, provider: 'jev', confidence: null });

test('legacy Jev site-rule results normalize missing additive fields without permitting partial new shapes', () => {
  const { provider, confidence, ...legacy } = valid(request());
  const normalized = validateDecisionResult(legacy, request());
  assert.deepEqual(normalized, { ...legacy, provider: 'jev', confidence: null });
  assert(Object.isFrozen(normalized));
  assert.equal(validateDecisionResult({ ...legacy, provider: 'jev' }, request()), null);
  assert.equal(validateDecisionResult({ ...legacy, confidence: 0.95 }, request()), null);
  assert.equal(validateDecisionResult(legacy, request({ provider: 'openai' })), null);
});

test('current provider replies enforce provider/model binding, confidence range and threshold', () => {
  for (const confidence of [null, NaN, Infinity, -0.1, 1.1, '0.95', 0.79])
    assert.equal(validateDecisionResult({ ...valid(request()), confidence }, request()), null);
  for (const extra of [{ provider: 'openai' }, { model: 'gpt-6-luna' }, { shape_status: 'DOCUMENTED' }, { provider: null }])
    assert.equal(validateDecisionResult({ ...valid(request()), ...extra }, request()), null);
  assert.equal(validateDecisionResult({ ...valid(request()), confidence: 0.8 }, request()).outcome, 'nudge');
  const low = { ...valid(request()), outcome: 'none', reason_code: null, confidence: 0.5 };
  assert.equal(validateDecisionResult(low, request()).confidence, 0.5);
  assert.equal(validateDecisionResult({ ...low, reason: 'disabled' }, request()), null);
});

test('OpenAI fixture-only neutral shape is understood without granting live authority', async () => {
  const input = request({ provider: 'openai' });
  const result = { ...neutral('UNVERIFIED_SHAPE', false), provider: 'openai', shape_status: 'UNVERIFIED_SHAPE' };
  assert.deepEqual(validateDecisionResult(result, input), result);
  assert.equal(validateDecisionResult(result, request()), null);
  assert.equal(validateDecisionResult({ ...result, shape_status: undefined }, input), null);
  assert.equal(validateDecisionResult({ ...result, model: 'jev-1.13.0' }, input), null);
  const f = fixture({ respond: (frame, child) => child.push({ version: 1, id: frame.id, result }) });
  assert.deepEqual(await f.decide(input), result); await f.decide.close();
});

test('watch results bind context and user choices, use unknown neutral and reject site-rule metadata', async () => {
  const input = watchRequest();
  assert.equal(validateDecisionResult(watchReply(input), input).outcome, 'finished');
  for (const extra of [{ outcome: 'pause_site' }, { context_version: 'site-rule-1' }, { reason_code: null }, { confidence: 0.5 }, { choice_set: 'site_rule_v1' }])
    assert.equal(validateDecisionResult(watchReply(input, extra), input), null);
  assert.equal(validateDecisionResult(watchReply(input, { outcome: 'unknown', confidence: 0.5 }), input).outcome, 'unknown');
  assert.equal(validateDecisionResult(watchNeutral(input, 'disabled', false), input).outcome, 'unknown');
  const f = fixture({ respond: (frame, child) => child.push({ version: 1, id: frame.id, result: watchReply(frame.params) }) });
  assert.equal((await f.decide(input)).outcome, 'finished');
  assert.equal(f.frames[0].method, 'decision/watch'); await f.decide.close();
});

test('watch and site-rule calls reuse one host; screen-only encoded line cap is enforced before spawn', async () => {
  const f = fixture({ respond: (frame, child) => child.push({ version: 1, id: frame.id, result: frame.method === 'decision/watch' ? watchReply(frame.params) : valid(frame.params) }) });
  await f.decide(request()); await f.decide(watchRequest()); assert.equal(f.calls.length, 1);
  const screen = request({ request_id: 'screen_1' });
  screen.state.observation = { ...screen.state.observation, level: 'screen', screen: { mime: 'image/png', width: 1280, height: 1280, data_base64: 'A'.repeat(100000) } };
  assert.equal((await f.decide(screen)).outcome, 'nudge');
  assert.equal(f.frames.at(-1).method, 'decision/site_rule');
  assert.equal(f.sending.at(-1).level, 'screen'); await f.decide.close();
  const tooLarge = request(); tooLarge.state.observation.level = 'screen';
  tooLarge.state.observation.screen = { data_base64: 'A'.repeat(1677721) };
  const normalMultibyte = request(); normalMultibyte.state.rule.instruction = '界'.repeat(26000);
  const g = fixture();
  for (const oversized of [tooLarge, normalMultibyte]) {
    assert.equal((await g.decide(oversized)).reason, 'INVALID_INPUT');
    assert.equal(g.calls.length + g.frames.length + g.sending.length, 0);
  }
});

test('unsupported envelopes, provider and watch shape gate cause zero subprocess activity', async () => {
  const badWatch = watchRequest(); badWatch.state.watch.outcomes[1].id = 'finished';
  const f = fixture();
  for (const input of [request({ version: 2 }), request({ provider: 'other' }), request({ context_version: 'site-rule-2' }),
    request({ deadline_ms: NOW + 31000 }), badWatch]) {
    assert.equal((await f.decide(input)).reason, 'INVALID_INPUT');
    assert.equal(f.calls.length + f.frames.length + f.sending.length, 0);
  }
  assert.equal((await f.decide(request({ deadline_ms: NOW - 1 }))).reason, 'timeout');
  assert.equal(f.calls.length + f.frames.length + f.sending.length, 0);
});

test('abort then late positive replies cannot return effects or watch status', async () => {
  for (const input of [request(), watchRequest()]) {
    let original;
    const f = fixture({ respond: (frame, child) => {
      if (frame.method === 'decision/cancel') child.push({ version: 1, id: original.id,
        result: input.choice_set === 'watch_v1' ? watchReply(input) : valid(input) });
      else original = frame;
    } });
    const controller = new AbortController();
    const pending = f.decide(input, { signal: controller.signal }); await tick(); controller.abort();
    const result = await pending;
    assert.equal(result.reason, 'cancelled'); assert.equal(result.data_sent, true);
    assert.equal(result.outcome, input.choice_set === 'watch_v1' ? 'unknown' : 'none');
    assert.equal(f.frames[1].method, 'decision/cancel'); assert.equal(f.timers.size, 0); await f.decide.close();
  }
});

test('abort during awaited outgoing indicator writes no decision request', async () => {
  const controller = new AbortController();
  const f = fixture({ onSending: async () => { controller.abort(); await tick(); } });
  assert.deepEqual(await f.decide(request(), { signal: controller.signal }), neutral('cancelled', false));
  assert.equal(f.frames.length, 0); assert.equal(f.timers.size, 0); await f.decide.close();
});

test('write rejection after handoff preserves conservative disclosure and reaps the owned host', async () => {
  const f = fixture({ respond: () => {} });
  const originalSpawn = f.runtime.spawn;
  f.runtime.spawn = async options => {
    const child = await originalSpawn(options); child.stdin.write = async () => { throw new Error('pipe rejected after possible bytes'); }; return child;
  };
  assert.deepEqual(await f.decide(request()), neutral('HOST_UNAVAILABLE', true));
  assert.equal(f.timers.size, 0); await tick(); assert.equal(f.children[0].killed(), 1); await f.decide.close();
});


test('NOT_AUTHORIZED produces an unsent neutral for both decision providers and choice sets', async () => {
  for (const input of [request(), watchRequest(), request({ provider: 'openai' }), watchRequest({ provider: 'openai' })]) {
    const result = { ...(input.choice_set === 'watch_v1' ? watchNeutral(input, 'NOT_AUTHORIZED', false) : neutral('NOT_AUTHORIZED', false)),
      provider: input.provider ?? 'jev', ...(input.provider === 'openai' ? { shape_status: 'UNVERIFIED_SHAPE' } : {}) };
    assert.deepEqual(validateDecisionResult(result, input), result);
    const f = fixture({ respond: (frame, child) => child.push({ version: 1, id: frame.id, result }) });
    assert.deepEqual(await f.decide(input), result); await f.decide.close();
  }
});

test('validator accepts actual current host decisions with synthetic injected key/fetch only', async () => {
  const pick = (choice, ids, confidence = 0.9) => ({ type: 'choice', choice, confidence,
    probabilities: Object.fromEntries(ids.map(id => [id, id === choice ? 1 : 0])) });
  let calls = 0;
  const provider = new DecisionProvider({ now: () => NOW, keyStore: { read: async () => 'synthetic-key-for-fixture' },
    openaiKeyStore: { read: async () => assert.fail('OpenAI gate must precede key reads') },
    fetchImpl: async (_url, options) => {
      calls++; const body = JSON.parse(options.body);
      return Response.json({ model: 'jev-1.13.0', answers: body.questions.watch
        ? { watch: pick('finished', ['finished', 'running', 'unknown']) } : { site_rule: pick('nudge', ['none', 'nudge']) } });
    } });
  for (const input of [request(), watchRequest(), request({ provider: 'openai' }), watchRequest({ provider: 'openai' })]) {
    const result = await provider.decide(input);
    assert.deepEqual(validateDecisionResult(result, input), result);
  }
  assert.equal(calls, 2); // Both are injected canned responses; OpenAI never reaches even the fake fetch.
});

test('abort during fake startup resolves unsent and never writes a decision frame', async () => {
  const controller = new AbortController(); const f = fixture();
  const originalSpawn = f.runtime.spawn;
  f.runtime.spawn = async options => { const child = await originalSpawn(options); controller.abort(); await tick(); return child; };
  assert.deepEqual(await f.decide(request(), { signal: controller.signal }), neutral('cancelled', false));
  assert.equal(f.frames.length + f.sending.length + f.timers.size, 0); await f.decide.close();
});

test('watch abort grace fallback and accurate unsent replies preserve unknown neutral', async () => {
  const input = watchRequest();
  const f = fixture({ respond: () => {} }); const controller = new AbortController();
  const pending = f.decide(input, { signal: controller.signal }); await tick(); controller.abort(); await tick();
  [...f.timers.values()].find(timer => timer.ms === 1000).fn();
  assert.deepEqual(await pending, watchNeutral(input, 'cancelled', true));
  assert.equal(f.timers.size, 0); await f.decide.close();
  let first;
  const g = fixture({ respond: (frame, child) => {
    if (frame.method === 'decision/cancel') child.push({ version: 1, id: first.id, result: watchNeutral(input, 'cancelled', false) }); else first = frame;
  } });
  const second = new AbortController(); const waiting = g.decide(input, { signal: second.signal }); await tick(); second.abort();
  assert.deepEqual(await waiting, watchNeutral(input, 'cancelled', false));
  assert.equal(g.timers.size, 0); await g.decide.close();
});


test('a spawn that never resolves is bounded by request abort and deadline before handoff', async () => {
  for (const mode of ['abort', 'timeout']) {
    const f = fixture(); f.runtime.spawn = async () => await new Promise(() => {});
    const controller = new AbortController(); const pending = f.decide(request(), { signal: controller.signal }); await tick();
    assert.equal(f.timers.size, 1);
    if (mode === 'abort') controller.abort(); else [...f.timers.values()][0].fn();
    assert.deepEqual(await pending, neutral(mode === 'abort' ? 'cancelled' : 'timeout', false));
    assert.equal(f.frames.length + f.sending.length + f.timers.size, 0);
    await f.decide.close(); assert.equal(f.decide.diagnostics().closed, true);
  }
});

test('a hung outgoing indicator is bounded before any decision write', async () => {
  for (const mode of ['abort', 'timeout', 'close']) {
    const f = fixture({ onSending: async () => await new Promise(() => {}) });
    const controller = new AbortController(); const pending = f.decide(request(), { signal: controller.signal }); await tick();
    if (mode === 'abort') controller.abort(); else if (mode === 'timeout') [...f.timers.values()][0].fn(); else await f.decide.close();
    assert.deepEqual(await pending, neutral(mode === 'timeout' ? 'timeout' : 'cancelled', false));
    assert.equal(f.frames.length + f.timers.size, 0); await f.decide.close();
  }
});

test('timed-out abandoned startup is reaped late and cannot replace a newer host', async () => {
  const f = fixture(); const spawn = f.runtime.spawn; let release;
  f.runtime.spawn = async options => {
    if (!release) return await new Promise(resolve => { release = async () => resolve(await spawn(options)); });
    return await spawn(options);
  };
  const pending = f.decide(request()); await tick(); [...f.timers.values()][0].fn();
  assert.deepEqual(await pending, neutral('timeout', false));
  assert.equal((await f.decide(request({ request_id: 'req_new' }))).outcome, 'nudge');
  await release(); await tick();
  assert.equal(f.children[1].killed(), 1); assert.equal(f.children[1].frames.length, 0);
  assert(f.children[1].pipeCloses.some(([name, force]) => name === 'stdout' && force === true));
  assert.equal(f.decide.diagnostics().running, true); await f.decide.close();
});

test('cancelled waiter does not abandon shared startup needed by another request', async () => {
  const f = fixture(); const spawn = f.runtime.spawn; let release;
  f.runtime.spawn = async options => await new Promise(resolve => { release = async () => resolve(await spawn(options)); });
  const controller = new AbortController(); const first = f.decide(request(), { signal: controller.signal });
  const second = f.decide(request({ request_id: 'req_other' })); await tick(); controller.abort();
  assert.deepEqual(await first, neutral('cancelled', false));
  await release(); assert.equal((await second).outcome, 'nudge');
  assert.equal(f.calls.length, 1); assert.equal(f.frames.length, 1); assert.equal(f.frames[0].params.request_id, 'req_other');
  assert.equal(f.children[0].killed(), 0); await f.decide.close();
});

test('close does not await unresolved startup and reaps the child if it arrives later', async () => {
  const f = fixture(); const spawn = f.runtime.spawn; let release;
  f.runtime.spawn = async options => await new Promise(resolve => { release = async () => resolve(await spawn(options)); });
  const pending = f.decide(request()); await tick(); await f.decide.close();
  assert.deepEqual(await pending, neutral('cancelled', false)); assert.equal(f.timers.size, 0);
  await release(); await tick(); assert.equal(f.children[0].killed(), 1); assert.equal(f.children[0].frames.length, 0);
  assert.equal(f.decide.diagnostics().running, false);
});

test('close is bounded when owned pipe/kill/wait APIs never finish, and tries all actions', async () => {
  const f = fixture(); const spawn = f.runtime.spawn; const attempts = [];
  f.runtime.spawn = async options => {
    const child = await spawn(options);
    for (const name of ['stdin', 'stdout', 'stderr']) child[name].close = async force => { attempts.push([name, force]); await new Promise(() => {}); };
    child.kill = async () => { attempts.push(['kill']); await new Promise(() => {}); };
    child.wait = async () => await new Promise(() => {});
    return child;
  };
  await f.decide(request()); const closing = f.decide.close(); await tick();
  assert.deepEqual(attempts.filter(([name]) => name !== 'kill'), [['stdin', true], ['stdout', true], ['stderr', true]]);
  [...f.timers.values()].find(timer => timer.ms === 1000).fn(); await closing;
  assert.equal(f.timers.size, 0); assert.equal(f.decide.diagnostics().running, false);
});

test('parser, output-limit and reader failures force-close all native pipes on retirement', async () => {
  for (const mode of ['malformed', 'oversized', 'reader']) {
    const f = fixture({ respond: (_frame, child) => {
      if (mode === 'malformed') child.push('{invalid\n');
      else if (mode === 'oversized') child.push('界'.repeat(400000));
    } });
    if (mode === 'reader') {
      const spawn = f.runtime.spawn;
      f.runtime.spawn = async options => { const child = await spawn(options); child.stdout.readString = async () => { await tick(); throw new Error('read failed'); }; return child; };
    }
    assert.deepEqual(await f.decide(request()), neutral('HOST_UNAVAILABLE', true)); await tick();
    for (const name of ['stdin', 'stdout', 'stderr']) assert(f.children[0].pipeCloses.some(([pipe, force]) => pipe === name && force === true));
    assert.equal(f.children[0].killed(), 1); await f.decide.close();
  }
});


test('deadline firing during cancellation does not extend the cancellation grace', async () => {
  const f = fixture({ respond: () => {} }); const controller = new AbortController();
  const pending = f.decide(request(), { signal: controller.signal }); await tick(); controller.abort(); await tick();
  const cancellation = [...f.timers.values()].find(timer => timer.ms === 1000);
  [...f.timers.values()].find(timer => timer.ms === 5000).fn();
  assert(![...f.timers.values()].some(timer => timer.ms === 2000)); cancellation.fn();
  assert.deepEqual(await pending, neutral('cancelled', true)); assert.equal(f.timers.size, 0); await f.decide.close();
});

test('wall-clock deadline is checked before write even when timer dispatch is delayed', async () => {
  let current = NOW;
  const f = fixture({ onSending: async () => { current = NOW + 6000; } }); f.runtime.now = () => current;
  assert.deepEqual(await f.decide(request()), neutral('timeout', false));
  assert.equal(f.frames.length + f.timers.size, 0); await f.decide.close();
});


test('original never-resolving spawn/indicator probe settles with real-clock abort and deadline', async () => {
  for (const waitAt of ['spawn', 'indicator']) for (const stopWith of ['abort', 'deadline']) {
    const f = fixture({ onSending: waitAt === 'indicator' ? async () => await new Promise(() => {}) : undefined });
    if (waitAt === 'spawn') f.runtime.spawn = async () => await new Promise(() => {});
    const timers = new Set(); f.runtime.now = () => Date.now();
    f.runtime.timers = {
      setTimeout: (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
      clearTimeout: id => { clearTimeout(id); timers.delete(id); },
    };
    const controller = new AbortController(); const pending = f.decide(request({ deadline_ms: Date.now() + 25 }), { signal: controller.signal });
    await tick(); if (stopWith === 'abort') controller.abort();
    let probe;
    try {
      const result = await Promise.race([pending, new Promise(resolve => { probe = setTimeout(() => resolve('STILL_PENDING'), 250); })]);
      assert.notEqual(result, 'STILL_PENDING'); assert.equal(result.reason, stopWith === 'abort' ? 'cancelled' : 'timeout');
      assert.equal(result.data_sent, false); assert.equal(f.frames.length, 0);
    } finally { clearTimeout(probe); await f.decide.close(); for (const timer of timers) clearTimeout(timer); }
    assert.equal(timers.size, 0);
  }
});


test('deadline reply grace cannot return late positive effects or watch statuses', async () => {
  for (const input of [request(), watchRequest()]) {
    let original; const f = fixture({ respond: frame => { original = frame; } });
    const pending = f.decide(input); await tick();
    [...f.timers.values()].find(timer => timer.ms === 5000).fn(); await tick();
    assert([...f.timers.values()].some(timer => timer.ms === 2000));
    f.children[0].push({ version: 1, id: original.id, result: input.choice_set === 'watch_v1' ? watchReply(input) : valid(input) });
    assert.deepEqual(await pending, input.choice_set === 'watch_v1' ? watchNeutral(input, 'timeout', true) : neutral('timeout', true));
    assert.equal(f.timers.size, 0); await f.decide.close();
  }
});

test('late positive replies fail closed by wall clock even before deadline timer dispatch', async () => {
  for (const input of [request(), watchRequest()]) {
    let original, current = NOW;
    const f = fixture({ respond: frame => { original = frame; } }); f.runtime.now = () => current;
    const pending = f.decide(input); await tick(); current = NOW + 6000;
    f.children[0].push({ version: 1, id: original.id, result: input.choice_set === 'watch_v1' ? watchReply(input) : valid(input) });
    assert.deepEqual(await pending, input.choice_set === 'watch_v1' ? watchNeutral(input, 'timeout', true) : neutral('timeout', true));
    assert.equal(f.timers.size, 0); await f.decide.close();
  }
});
