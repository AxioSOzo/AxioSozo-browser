// TEST FIXTURES ONLY: every fetch is a fake and every key store is synthetic. No network,
// Keychain or provider client is touched. The OpenAI adapter is UNVERIFIED_SHAPE: these tests
// prove its gates and its fixture-only behaviour, not compatibility with any real API.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { crc32 } from 'node:zlib';
import { DecisionProvider, DECISION_PROVIDERS, JEV_ENDPOINT, JEV_MODEL, OPENAI_DECISIONS, SITE_RULE_REASON_CRITERIA, UNVERIFIED_SHAPE,
  WATCH_UNKNOWN_CRITERION, validateSiteRuleRequest, validateWatchRequest } from '../src/decision.mjs';
import { HOST_LIMITS, ProviderHost, serveStdio } from '../src/host.mjs';

function chunk(type, data) {
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([length, body, crc]);
}
/** A structurally valid PNG header (signature, IHDR, IEND) with optional padding bytes. */
function png(width = 640, height = 400, padding = 0) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr),
    ...(padding ? [chunk('tEXt', Buffer.alloc(padding, 0x61))] : []), chunk('IEND', Buffer.alloc(0))]);
}
const screen = (overrides = {}) => ({ mime: 'image/png', width: 640, height: 400, data_base64: png().toString('base64'), ...overrides });
const address = { origin: 'https://example.test', path: '/status', title: 'Status' };
const siteState = (observation = { level: 'address', address }) => ({
  rule: { id: 'r_7f3a', instruction: 'Nudge me when I drift.', effects: ['nudge'] }, context_type: 'personal', checkpoint: 'commit',
  elapsed: { today_ms: 1000, foreground_session_ms: 1000 }, observation });
const siteRequest = (overrides = {}) => ({ version: 1, request_id: 'req_1', choice_set: 'site_rule_v1', context_version: 'site-rule-1',
  deadline_ms: Date.now() + 1000, state: siteState(), ...overrides });
const watchState = (observation = { level: 'address', address }) => ({
  watch: { id: 'w_build', question: 'Is the deploy finished?', outcomes: [{ id: 'finished', label: 'Deploy finished' }, { id: 'running', label: 'Still running' }] },
  observation });
const watchRequest = (overrides = {}) => ({ version: 1, request_id: 'watch_1', choice_set: 'watch_v1', context_version: 'watch-1',
  deadline_ms: Date.now() + 1000, state: watchState(), ...overrides });
const answer = (value, keys, confidence = 0.95, withProbabilities = true) => ({ type: 'choice', choice: value, confidence,
  ...(withProbabilities ? { probabilities: Object.fromEntries(keys.map(key => [key, key === value ? 1 : 0])) } : {}) });

function harness({ respond, jevKey = 'synthetic-jev-key', openaiKey = 'synthetic-openai-key', fixture = false } = {}) {
  const calls = []; const reads = { jev: 0, openai: 0 };
  const instance = new DecisionProvider({
    keyStore: { read: async () => { reads.jev++; return jevKey; } },
    openaiKeyStore: { read: async () => { reads.openai++; return openaiKey; } },
    unverifiedOpenAIFixture: fixture,
    fetchImpl: async (url, options) => { calls.push({ url, options }); return respond(url, options); } });
  return { instance, calls, reads };
}
const jevSiteBody = (outcome = 'nudge', confidence = 0.95) => ({ model: JEV_MODEL, answers: {
  site_rule: answer(outcome, ['none', 'nudge'], confidence), reason: answer('drift', Object.keys(SITE_RULE_REASON_CRITERIA)) } });

test('Providers declare capabilities; Jev has no image input; OpenAI is UNVERIFIED_SHAPE and NOT_AUTHORIZED live', () => {
  assert.deepEqual(DECISION_PROVIDERS.jev.capabilities, { image: false });
  assert.deepEqual(DECISION_PROVIDERS.openai.capabilities, { image: true });
  assert.equal(DECISION_PROVIDERS.openai.shape_status, UNVERIFIED_SHAPE); assert.equal(OPENAI_DECISIONS.live, 'NOT_AUTHORIZED');
});

test('Provider defaults to jev, may be named explicitly, and an unknown provider is INVALID_INPUT without any call', async () => {
  for (const extra of [{}, { provider: 'jev' }]) {
    const h = harness({ respond: async () => Response.json(jevSiteBody()) });
    const result = await h.instance.decide(siteRequest(extra));
    assert.equal(result.provider, 'jev'); assert.equal(result.outcome, 'nudge'); assert.equal(result.confidence, 0.95);
    assert.equal(h.calls[0].url, JEV_ENDPOINT); assert.equal(h.reads.openai, 0);
  }
  for (const provider of ['anthropic', '', null, 1, '__proto__']) {
    const h = harness({ respond: async () => assert.fail('no fetch') });
    const result = await h.instance.decide(siteRequest({ provider }));
    assert.equal(result.reason, 'INVALID_INPUT'); assert.equal(result.provider, null); assert.equal(result.confidence, null);
    assert.equal(h.calls.length + h.reads.jev + h.reads.openai, 0);
  }
});

test('A screen request to Jev is IMAGE_UNSUPPORTED with zero Keychain reads and zero network calls', async () => {
  const h = harness({ respond: async () => assert.fail('no fetch') });
  const site = await h.instance.decide(siteRequest({ state: siteState({ level: 'screen', address, screen: screen() }) }));
  assert.deepEqual(site, { version: 1, request_id: 'req_1', choice_set: 'site_rule_v1', context_version: 'site-rule-1', outcome: 'none',
    reason_code: null, reason: 'IMAGE_UNSUPPORTED', data_sent: false, authority: 'suggestion_only', action_authorized: false, provider: 'jev', confidence: null });
  const watch = await h.instance.decide(watchRequest({ provider: 'jev', state: watchState({ level: 'screen', address, screen: screen(), outline: [{ id: 'o1', kind: 'heading', text: 'Deploys' }] }) }));
  assert.equal(watch.outcome, 'unknown'); assert.equal(watch.reason, 'IMAGE_UNSUPPORTED'); assert.equal(watch.data_sent, false);
  assert.equal(h.calls.length, 0); assert.equal(h.reads.jev, 0);
});

test('Screen observation validation: PNG signature, IHDR matches declared size ≤ 1280, decoded ≤ 1 MiB, exact keys', () => {
  const ok = siteRequest({ state: siteState({ level: 'screen', address, screen: screen() }) });
  assert.doesNotThrow(() => validateSiteRuleRequest(ok));
  const big = png(1280, 1280, 1048576 - png().length - 12);
  assert(big.length <= 1048576 && big.length > 1040000);
  assert.doesNotThrow(() => validateSiteRuleRequest(siteRequest({ state: siteState({ level: 'screen', address, screen: screen({ width: 1280, height: 1280, data_base64: big.toString('base64') }) }) })));
  const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(60)]);
  const cases = {
    'not a PNG': screen({ data_base64: jpeg.toString('base64') }),
    'jpeg mime': screen({ mime: 'image/jpeg' }),
    'width over 1280': screen({ width: 1281, data_base64: png(1281, 400).toString('base64') }),
    'height zero': screen({ height: 0 }),
    'declared size differs from IHDR': screen({ width: 641 }),
    'decoded over 1 MiB': screen({ width: 1280, height: 1280, data_base64: png(1280, 1280, 1048576).toString('base64') }),
    'bad base64': screen({ data_base64: '!!!!' }),
    'base64 with whitespace': screen({ data_base64: `${png().toString('base64').slice(0, 8)}\n${png().toString('base64').slice(8)}` }),
    'empty data': screen({ data_base64: '' }),
    'unknown screen key': { ...screen(), url: 'https://example.test' },
    'missing data': (({ data_base64, ...rest }) => rest)(screen()),
  };
  for (const [name, value] of Object.entries(cases)) {
    assert.throws(() => validateSiteRuleRequest(siteRequest({ state: siteState({ level: 'screen', address, screen: value }) })), { code: 'INVALID_INPUT' }, name);
    assert.throws(() => validateWatchRequest(watchRequest({ state: watchState({ level: 'screen', address, screen: value }) })), { code: 'INVALID_INPUT' }, name);
  }
  assert.throws(() => validateSiteRuleRequest(siteRequest({ state: siteState({ level: 'address', address, screen: screen() }) })), { code: 'INVALID_INPUT' }, 'screen on address level');
  assert.throws(() => validateSiteRuleRequest(siteRequest({ state: siteState({ level: 'outline', address, outline: [], screen: screen() }) })), { code: 'INVALID_INPUT' }, 'screen on outline level');
  assert.throws(() => validateSiteRuleRequest(siteRequest({ state: siteState({ level: 'screen', address }) })), { code: 'INVALID_INPUT' }, 'screen level without image');
});

test('The raised 1.5 MiB state cap applies only to screen requests', () => {
  const pad = 'x'.repeat(200);
  const outline = Array.from({ length: 200 }, (_, i) => ({ id: `o${i}`, kind: 'link', text: pad }));
  const withOutline = level => siteRequest({ state: { ...siteState({ level, address, outline, ...(level === 'screen' ? { screen: screen() } : {}) }),
    rule: { id: 'r_7f3a', instruction: 'y'.repeat(2000), effects: ['nudge'] } } });
  // ~43 KiB of outline fits both caps; a large image alone pushes only screen requests past 64 KiB.
  assert.doesNotThrow(() => validateSiteRuleRequest(withOutline('outline')));
  const large = png(1280, 1280, 500000).toString('base64');
  const request = siteRequest({ state: siteState({ level: 'screen', address, outline, screen: screen({ width: 1280, height: 1280, data_base64: large }) }) });
  assert(Buffer.byteLength(JSON.stringify(request.state)) > 65536);
  assert.doesNotThrow(() => validateSiteRuleRequest(request));
});

test('OpenAI is refused with UNVERIFIED_SHAPE in the product configuration: no Keychain read, no fetch', async () => {
  const h = harness({ respond: async () => assert.fail('no fetch') });
  for (const input of [siteRequest({ provider: 'openai' }), siteRequest({ provider: 'openai', state: siteState({ level: 'screen', address, screen: screen() }) }),
    watchRequest({ provider: 'openai' })]) {
    const result = await h.instance.decide(input);
    assert.equal(result.reason, UNVERIFIED_SHAPE); assert.equal(result.provider, 'openai'); assert.equal(result.shape_status, UNVERIFIED_SHAPE);
    assert.equal(result.data_sent, false); assert.equal(result.confidence, null); assert.equal(result.action_authorized, false);
    assert(['none', 'unknown'].includes(result.outcome));
  }
  assert.equal(h.calls.length, 0); assert.equal(h.reads.openai, 0); assert.equal(h.reads.jev, 0);
});

test('OpenAI fixture route: own key, own endpoint, image moved out of state, probabilities optional, confidence reported', async () => {
  const h = harness({ fixture: true, respond: async () => Response.json({ model: OPENAI_DECISIONS.model, answers: { site_rule: answer('nudge', [], 0.91, false) } }) });
  const image = png().toString('base64');
  const result = await h.instance.decide(siteRequest({ provider: 'openai', state: siteState({ level: 'screen', address, screen: screen({ data_base64: image }) }) }));
  assert.deepEqual(result, { version: 1, request_id: 'req_1', choice_set: 'site_rule_v1', context_version: 'site-rule-1', outcome: 'nudge',
    reason_code: null, reason: 'validated', data_sent: true, authority: 'suggestion_only', action_authorized: false,
    provider: 'openai', confidence: 0.91, shape_status: UNVERIFIED_SHAPE, model: OPENAI_DECISIONS.model });
  assert.equal(h.reads.jev, 0); assert.equal(h.reads.openai, 1);
  const [{ url, options }] = h.calls; const sent = JSON.parse(options.body);
  assert.equal(url, OPENAI_DECISIONS.endpoint); assert.equal(options.redirect, 'error');
  assert.equal(options.headers.Authorization, 'Bearer synthetic-openai-key'); assert(!options.body.includes('synthetic-'));
  assert.deepEqual(sent.images, [{ mime_type: 'image/png', data_base64: image }]);
  assert.deepEqual(sent.state.observation.screen, { mime: 'image/png', width: 640, height: 400 });
  assert.equal(sent.model, OPENAI_DECISIONS.model); assert.deepEqual(Object.keys(sent.questions), ['site_rule', 'reason']);
  // Text-only requests carry no images key.
  const text = harness({ fixture: true, respond: async () => Response.json({ answers: { site_rule: answer('none', [], 0.99, false) } }) });
  assert.equal((await text.instance.decide(siteRequest({ provider: 'openai' }))).outcome, 'none');
  assert.equal(Object.hasOwn(JSON.parse(text.calls[0].options.body), 'images'), false);
});

test('OpenAI fixture route fails closed: low confidence, unlisted choice, wrong model, bad probabilities, no key', async () => {
  const run = async (body, key) => harness({ fixture: true, openaiKey: key, respond: async () => Response.json(body) }).instance.decide(siteRequest({ provider: 'openai' }));
  const low = await run({ answers: { site_rule: answer('nudge', [], 0.5, false) } });
  assert.equal(low.outcome, 'none'); assert.equal(low.reason, 'validated'); assert.equal(low.confidence, 0.5);
  for (const body of [{ answers: { site_rule: answer('pause_site', [], 0.99, false) } }, { model: 'gpt-other', answers: { site_rule: answer('nudge', [], 0.99, false) } },
    { answers: { site_rule: { ...answer('nudge', [], 0.99, false), probabilities: { none: 0.5 } } } }, { answers: { site_rule: { ...answer('nudge', [], 0.99, false), type: 'text' } } }, {}]) {
    const result = await run(body);
    assert.equal(result.reason, 'malformed_output'); assert.equal(result.outcome, 'none'); assert.equal(result.confidence, null);
  }
  const h = harness({ fixture: true, openaiKey: null, respond: async () => assert.fail('no fetch without key') });
  const off = await h.instance.decide(siteRequest({ provider: 'openai' }));
  assert.equal(off.reason, 'disabled'); assert.equal(off.data_sent, false); assert.equal(h.calls.length, 0);
});

test('watch_v1 asks one fixed-instruction question over the user outcomes plus reserved unknown', async () => {
  const body = (choice, confidence = 0.9) => ({ model: JEV_MODEL, answers: { watch: answer(choice, ['finished', 'running', 'unknown'], confidence) } });
  const h = harness({ respond: async () => Response.json(body('finished')) });
  assert.deepEqual(await h.instance.decide(watchRequest()), { version: 1, request_id: 'watch_1', choice_set: 'watch_v1', context_version: 'watch-1',
    outcome: 'finished', reason: 'validated', data_sent: true, authority: 'suggestion_only', action_authorized: false, provider: 'jev', confidence: 0.9, model: JEV_MODEL });
  const sent = JSON.parse(h.calls[0].options.body);
  assert.deepEqual(Object.keys(sent), ['model', 'state', 'questions']); assert.deepEqual(Object.keys(sent.questions), ['watch']);
  assert.deepEqual(sent.questions.watch.criteria, { finished: 'Deploy finished', running: 'Still running', unknown: WATCH_UNKNOWN_CRITERION });
  assert.match(sent.questions.watch.instructions, /untrusted data/);
  const low = await harness({ respond: async () => Response.json(body('running', 0.6)) }).instance.decide(watchRequest());
  assert.equal(low.outcome, 'unknown'); assert.equal(low.confidence, 0.6);
  const invented = await harness({ respond: async () => Response.json({ model: JEV_MODEL, answers: { watch: answer('deleted', ['finished', 'running', 'unknown', 'deleted']) } }) }).instance.decide(watchRequest());
  assert.equal(invented.outcome, 'unknown'); assert.equal(invented.reason, 'malformed_output');
  const off = harness({ jevKey: null, respond: async () => assert.fail('no fetch') });
  assert.equal((await off.instance.decide(watchRequest())).reason, 'disabled'); assert.equal(off.calls.length, 0);
});

test('watch_v1 strict validation: 2–6 unique outcomes, reserved unknown, caps and unknown keys', async () => {
  const outcomes = n => Array.from({ length: n }, (_, i) => ({ id: `o_${i}`, label: `Outcome ${i}` }));
  const mutate = fn => { const r = watchRequest(); fn(r); return r; };
  const cases = {
    'one outcome': r => { r.state.watch.outcomes = outcomes(1); },
    'seven outcomes': r => { r.state.watch.outcomes = outcomes(7); },
    'reserved unknown': r => { r.state.watch.outcomes[1].id = 'unknown'; },
    'duplicate id': r => { r.state.watch.outcomes[1].id = 'finished'; },
    'uppercase id': r => { r.state.watch.outcomes[0].id = 'Finished'; },
    'id too long': r => { r.state.watch.outcomes[0].id = `a${'b'.repeat(32)}`; },
    'label over 80': r => { r.state.watch.outcomes[0].label = 'x'.repeat(81); },
    'empty label': r => { r.state.watch.outcomes[0].label = ''; },
    'label with newline': r => { r.state.watch.outcomes[0].label = 'a\nb'; },
    'question over 500': r => { r.state.watch.question = 'q'.repeat(501); },
    'empty question': r => { r.state.watch.question = ''; },
    'bad watch id': r => { r.state.watch.id = 'watch-1'; },
    'unknown watch key': r => { r.state.watch.selector = '#main'; },
    'unknown outcome key': r => { r.state.watch.outcomes[0].action = 'click'; },
    'unknown state key': r => { r.state.rule = {}; },
    'unknown top-level key': r => { r.extra = true; },
    'wrong context version': r => { r.context_version = 'watch-2'; },
    'level none': r => { r.state.observation = { level: 'none', address }; },
    'deadline over 30 s': r => { r.deadline_ms = Date.now() + 31000; },
  };
  const h = harness({ respond: async () => assert.fail('no fetch') });
  for (const [name, fn] of Object.entries(cases)) {
    const input = mutate(fn);
    assert.throws(() => validateWatchRequest(input), { code: 'INVALID_INPUT' }, name);
    const result = await h.instance.decide(input);
    assert.equal(result.outcome, 'unknown', name); assert.equal(result.reason, 'INVALID_INPUT', name);
  }
  assert.equal(h.calls.length + h.reads.jev, 0);
  assert.doesNotThrow(() => validateWatchRequest(mutate(r => { r.state.watch.outcomes = outcomes(6); })));
});

test('Host decision/watch shares the decision budget and cancellation', async () => {
  const calls = []; const messages = [];
  const host = new ProviderHost({ createAdapter: () => assert.fail('no client'), limits: { decisionsPerHour: 1 },
    createDecisionProvider: () => new DecisionProvider({ keyStore: { read: async () => 'synthetic-jev-key' },
      fetchImpl: async () => { calls.push(1); return Response.json({ model: JEV_MODEL, answers: { watch: answer('running', ['finished', 'running', 'unknown']) } }); } }) });
  host.on('message', m => messages.push(m));
  try {
    await host.handle({ version: 1, id: 'a', method: 'decision/watch', params: watchRequest() });
    assert.equal(messages.at(-1).result.outcome, 'running');
    await host.handle({ version: 1, id: 'b', method: 'decision/site_rule', params: siteRequest() });
    assert.equal(messages.at(-1).result.reason, 'budget_exhausted'); assert.equal(calls.length, 1);
    await host.handle({ version: 1, id: 'c', method: 'decision/watch', params: { ...watchRequest({ request_id: 'w2' }), extra: 1 } });
    assert.equal(messages.at(-1).result.reason, 'INVALID_INPUT');
  } finally { await host.close(); }
});

test('stdio admits a line over 72 KiB only for a screen decision; other long lines close the host', async () => {
  const serve = async line => {
    const stdin = new PassThrough(), stdout = new PassThrough(); let text = '';
    stdout.on('data', c => { text += c; });
    const serving = serveStdio({ input: stdin, output: stdout, createAdapter: () => assert.fail('no client'),
      createDecisionProvider: () => new DecisionProvider({ keyStore: { read: async () => assert.fail('no Keychain read') }, fetchImpl: async () => assert.fail('no fetch') }) });
    stdin.write(line);
    for (let i = 0; i < 100 && !text.includes('\n'); i++) await new Promise(resolve => setTimeout(resolve, 5));
    stdin.end(); await serving; return text;
  };
  const image = png(1280, 1280, 600000).toString('base64');
  const screenLine = `${JSON.stringify({ version: 1, id: 's', method: 'decision/site_rule', params: siteRequest({ state: siteState({ level: 'screen', address, screen: screen({ width: 1280, height: 1280, data_base64: image }) }) }) })}\n`;
  assert(Buffer.byteLength(screenLine) > HOST_LIMITS.lineBytes && Buffer.byteLength(screenLine) <= HOST_LIMITS.screenLineBytes);
  const reply = JSON.parse((await serve(screenLine)).trim());
  assert.equal(reply.id, 's'); assert.equal(reply.result.reason, 'IMAGE_UNSUPPORTED');
  const longText = siteRequest({ state: siteState({ level: 'address', address: { ...address, title: 't'.repeat(200) } }) });
  longText.state.rule.instruction = 'x'.repeat(2000); longText.padding = 'p'.repeat(HOST_LIMITS.lineBytes);
  assert.equal(await serve(`${JSON.stringify({ version: 1, id: 'n', method: 'decision/site_rule', params: longText })}\n`), '');
  assert.equal(HOST_LIMITS.screenLineBytes, Math.floor(1.6 * 1024 * 1024));
});
