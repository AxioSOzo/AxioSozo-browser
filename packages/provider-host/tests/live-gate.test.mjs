// Synthetic fixtures only: injected fake stores and fetch, no Keychain or provider clients.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DecisionProvider, DIAGNOSTIC_STATE, JEV_MODEL, OPENAI_DECISIONS, UNVERIFIED_SHAPE, DECISION_REASONS } from '../src/decision.mjs';
import { ProviderHost } from '../src/host.mjs';

const now = 1800000000000;
const observation = () => ({ level: 'address', address: { origin: 'https://fixture.example.test', path: '/status', title: 'Synthetic status' } });
function request(kind = 'site_rule', provider) {
  return { version: 1, request_id: `fixture_${kind}_${provider ?? 'default'}`, choice_set: `${kind}_v1`, context_version: kind === 'watch' ? 'watch-1' : 'site-rule-1',
    deadline_ms: now + 1000,
    state: kind === 'watch' ? { watch: { id: 'w_gate', question: 'Is the synthetic build done?', outcomes: [{ id: 'done', label: 'Done' }, { id: 'running', label: 'Running' }] }, observation: observation() }
      : { rule: { id: 'r_gate', instruction: 'Nudge if I drift.', effects: ['nudge'] }, context_type: 'project', checkpoint: 'commit', elapsed: { today_ms: 0, foreground_session_ms: 0 }, observation: observation() },
    ...(provider ? { provider } : {}) };
}
const diagnostic = () => ({ version: 1, request_id: 'fixture_diagnostic', context_version: 'synthetic-1', deadline_ms: now + 1000, state: DIAGNOSTIC_STATE });
const answer = (value, choices) => ({ type: 'choice', choice: value, confidence: 0.95, probabilities: Object.fromEntries(choices.map(key => [key, key === value ? 1 : 0])) });
const diagnosticAnswer = () => ({ model: JEV_MODEL, answers: { diagnostic: answer('inspect_engine', ['no_op', 'inspect_engine', 'unknown']) } });
function harness(options = {}, respond = () => assert.fail('blocked fetch must never run')) {
  const calls = { jev: 0, openai: 0, fetch: 0, budget: 0 };
  const instance = new DecisionProvider({ keyStore: { read: async () => { calls.jev++; return 'synthetic-jev-key'; } },
    openaiKeyStore: { read: async () => { calls.openai++; return 'synthetic-openai-key'; } },
    fetchImpl: async (...args) => { calls.fetch++; return respond(...args); }, now: () => now, ...options });
  const decide = input => instance.decide(input, { allowSend: () => { calls.budget++; return true; } });
  return { instance, calls, decide };
}
function zeroCalls(h) { assert.deepEqual(h.calls, { jev: 0, openai: 0, fetch: 0, budget: 0 }); }
function blocked(result, kind, provider = 'jev') {
  assert.equal(result.reason, 'NOT_AUTHORIZED'); assert.equal(result.outcome, kind === 'site_rule' ? 'none' : 'unknown');
  assert.equal(result.provider, provider); assert.equal(result.data_sent, false); assert.equal(result.confidence, null);
  assert.equal(result.authority, 'suggestion_only'); assert.equal(result.action_authorized, false);
  if (provider === 'openai') assert.equal(result.shape_status, UNVERIFIED_SHAPE);
  if (kind === 'site_rule') assert.equal(result.reason_code, null);
}

for (const kind of ['site_rule', 'watch']) for (const provider of ['jev', 'openai']) {
  test(`Browser capability blocks ${provider} ${kind} before store, fetch and budget`, async () => {
    const h = harness({ liveAuthorized: false });
    blocked(await h.decide(request(kind, provider)), kind, provider); zeroCalls(h);
  });
}
test('Default Jev selection is blocked by the browser capability', async () => {
  const h = harness({ liveAuthorized: false });
  blocked(await h.decide(request()), 'site_rule'); zeroCalls(h);
});
test('OpenAI fixture permission cannot bypass the browser capability', async () => {
  const h = harness({ liveAuthorized: false, unverifiedOpenAIFixture: true });
  for (const kind of ['site_rule', 'watch']) blocked(await h.decide(request(kind, 'openai')), kind, 'openai');
  zeroCalls(h);
});
test('Strict validation runs before NOT_AUTHORIZED, and request fields cannot enable it', async () => {
  const h = harness({ liveAuthorized: false });
  for (const kind of ['site_rule', 'watch']) for (const provider of ['jev', 'openai']) {
    for (const mutate of [input => { input.liveAuthorized = true; }, input => { input.provider = 'unknown'; }, input => { input.deadline_ms = now + 31000; }, input => { input.state.observation.address.path = '/status?secret=1'; }]) {
      const input = request(kind, provider); mutate(input);
      const result = await h.decide(input);
      assert.equal(result.reason, 'INVALID_INPUT'); assert.equal(result.data_sent, false);
      assert.equal(result.outcome, kind === 'site_rule' ? 'none' : 'unknown');
    }
  }
  await assert.rejects(h.decide({ ...diagnostic(), extra: true }), { code: 'INVALID_INPUT' });
  zeroCalls(h);
});
test('Browser capability covers diagnostic requests after their strict validation', async () => {
  const h = harness({ liveAuthorized: false }); const result = await h.decide(diagnostic());
  assert.deepEqual(result, { version: 1, request_id: 'fixture_diagnostic', context_version: 'synthetic-1', outcome: 'unknown', reason: 'NOT_AUTHORIZED', data_sent: false, authority: 'diagnostic_only', action_authorized: false });
  zeroCalls(h);
});
test('Only literal true grants the host capability', async () => {
  for (const liveAuthorized of [false, null, 0, 1, 'true']) {
    const h = harness({ liveAuthorized }); blocked(await h.decide(request()), 'site_rule'); zeroCalls(h);
  }
});
test('Explicit authorized diagnostic uses the injected fake fetch', async () => {
  const h = harness({ liveAuthorized: true }, async () => Response.json(diagnosticAnswer()));
  const result = await h.decide(diagnostic());
  assert.equal(result.reason, 'validated'); assert.equal(result.outcome, 'inspect_engine'); assert.equal(result.action_authorized, false);
  assert.equal(h.calls.jev, 1); assert.equal(h.calls.fetch, 1); assert.equal(h.calls.openai, 0);
});
test('Legacy injected fake Jev path retains its default behavior', async () => {
  const h = harness({}, async () => Response.json({ model: JEV_MODEL, answers: { site_rule: answer('nudge', ['none', 'nudge']) } }));
  const result = await h.decide(request());
  assert.equal(result.reason, 'validated'); assert.equal(result.outcome, 'nudge'); assert.equal(result.confidence, 0.95);
  assert.deepEqual(h.calls, { jev: 1, openai: 0, fetch: 1, budget: 1 });
});
test('Legacy OpenAI canned fixture path retains its separate fake store and fetch', async () => {
  const h = harness({ unverifiedOpenAIFixture: true }, async () => Response.json({ model: OPENAI_DECISIONS.model, answers: { watch: answer('done', ['done', 'running', 'unknown']) } }));
  const result = await h.decide(request('watch', 'openai'));
  assert.equal(result.reason, 'validated'); assert.equal(result.outcome, 'done'); assert.equal(result.shape_status, UNVERIFIED_SHAPE);
  assert.deepEqual(h.calls, { jev: 0, openai: 1, fetch: 1, budget: 1 });
});
test('Decision host with the disabled browser factory returns neutral results despite zero budget', async () => {
  const h = harness({ liveAuthorized: false }); const messages = [];
  const host = new ProviderHost({ createAdapter: () => assert.fail('no provider client'), createDecisionProvider: () => h.instance, now: () => now, limits: { decisionsPerHour: 0 } });
  host.on('message', message => messages.push(message));
  try {
    let id = 0;
    for (const kind of ['site_rule', 'watch']) for (const provider of ['jev', 'openai']) {
      await host.handle({ version: 1, id: `host_${++id}`, method: `decision/${kind}`, params: request(kind, provider) });
      blocked(messages.at(-1).result, kind, provider);
    }
    assert.equal(messages.length, 4); zeroCalls(h);
  } finally { await host.close(); }
});
test('Decision reason list includes the fixed authorization failure', () => {
  assert(DECISION_REASONS.includes('NOT_AUTHORIZED'));
});
