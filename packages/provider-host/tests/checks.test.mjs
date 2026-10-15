// Pure parts of the capability check (checks.mjs) and the loopback stand-in model. No client,
// broker, network beyond 127.0.0.1, credential or Keychain is involved. The checks against the
// real installed clients live in checks.os.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { startFakeModel } from '../src/fake-model.mjs';
import { checkClient, codexCheckLoop, describeCheck, rejectedOption, verifyRequests, MARKERS, OWN_INSTRUCTIONS, CHECK_REASONS, CHECK_STATUSES, SIGN_IN_STATES } from '../src/checks.mjs';
import { ProviderAdapter, claudeFailureReason } from '../src/adapters.mjs';

test('the option a client refused is read from its own error text, for every parser we know', () => {
  assert.equal(rejectedOption('Error loading config.toml: unknown configuration field `features.goals` in -c/--config override'), 'features.goals');
  assert.equal(rejectedOption("error: unexpected argument '--strict-config' found\n\n  tip: …"), '--strict-config');
  assert.equal(rejectedOption("error: invalid value 'read-only' for '--sandbox <SANDBOX_MODE>'"), '--sandbox');
  assert.equal(rejectedOption("error: unknown option '--permission-prompts'"), '--permission-prompts');
  assert.equal(rejectedOption("error: option '--permission-prompts <target>' argument 'none' is invalid. Allowed choices are host."), '--permission-prompts');
  assert.equal(rejectedOption('Error loading config.toml: invalid type: boolean `false`, expected struct UpdatePlanToolConfig'), 'a setting value');
  for (const nothing of ['', 'Reconnecting... 2/5', null, undefined]) assert.equal(rejectedOption(nothing), null);
});

test('request inspection: tools, leaked customizations and missing own instructions are refusals', () => {
  const clean = { kind: 'responses', tools: [], markers: [OWN_INSTRUCTIONS] };
  assert.equal(verifyRequests([clean], 'responses', { needsOwnInstructions: true }), null);
  assert.deepEqual(verifyRequests([], 'responses'), { status: 'error', reason_code: 'CHECK_FAILED', reason_detail: 'no model request reached the check' });
  assert.deepEqual(verifyRequests([{ ...clean, tools: ['exec_command', 'write_stdin'] }], 'responses'),
    { status: 'incompatible', reason_code: 'TOOLS_NOT_DISABLED', reason_detail: 'exec_command, write_stdin' });
  assert.deepEqual(verifyRequests([{ ...clean, markers: [OWN_INSTRUCTIONS, MARKERS.skill, MARKERS.project] }], 'responses'),
    { status: 'incompatible', reason_code: 'INSTRUCTIONS_NOT_ISOLATED', reason_detail: 'skill, project' });
  assert.deepEqual(verifyRequests([{ ...clean, markers: [] }], 'responses', { needsOwnInstructions: true }),
    { status: 'incompatible', reason_code: 'OPTION_REJECTED', reason_detail: 'model_instructions_file' });
  const many = ['a', 'b', 'c', 'd', 'e', 'f'];
  assert.equal(verifyRequests([{ kind: 'messages', tools: many, markers: [] }], 'messages').reason_detail, 'a, b, c, d and 2 more');
});

test('loopback stand-in answers both APIs, records shape facts only and never keeps headers', async () => {
  const fake = await startFakeModel({ reply: 'AXIOSOZO_CHECK_OK', markers: ['PLANTED'] });
  try {
    const responses = await fetch(`http://127.0.0.1:${fake.port}/v1/responses`, { method: 'POST', headers: { authorization: 'Bearer synthetic-not-real' },
      body: JSON.stringify({ tools: [{ type: 'function', name: 'exec_command' }, { type: 'namespace', name: 'ns', tools: [{ name: 'a' }] }], input: 'PLANTED text' }) });
    const body = await responses.text();
    assert.match(body, /response\.output_text\.delta/u); assert.match(body, /AXIOSOZO_CHECK_OK/u); assert.match(body, /response\.completed/u);
    const messages = await fetch(`http://127.0.0.1:${fake.port}/v1/messages?beta=true`, { method: 'POST', body: JSON.stringify({ model: 'm', tools: [] }) });
    assert.match(await messages.text(), /content_block_delta[\s\S]*message_stop/u);
    assert.equal((await fetch(`http://127.0.0.1:${fake.port}/v1/models`)).status, 404);
    assert.deepEqual(fake.requests.map(request => [request.kind, request.tools, request.markers]),
      [['responses', ['exec_command', 'ns:a'], ['PLANTED']], ['messages', [], []], ['other', [], []]]);
    assert(!JSON.stringify(fake.requests).includes('synthetic-not-real'), 'headers are not recorded');
  } finally { await fake.close(); }
});

test('checkClient never rejects; a missing client is not-installed without starting anything', async () => {
  for (const driver of ['codex', 'claude-code', 'antigravity']) {
    const entry = await checkClient(driver, { searchPath: '' });
    assert.deepEqual([entry.status, entry.installed, entry.version, entry.sign_in, entry.checked_at], ['not-installed', false, null, 'not-applicable', null]);
    assert(Object.isFrozen(entry)); assert.match(describeCheck(entry), /is not installed\.$/u);
  }
  await assert.rejects(checkClient('gemini'), { code: 'UNSUPPORTED' });
  assert(CHECK_STATUSES.includes('incompatible') && CHECK_REASONS.includes('OPTION_REJECTED') && SIGN_IN_STATES.includes('needs-sign-in'));
});

test('describeCheck names the client, version and exact reason', () => {
  const base = { driver: 'claude-code', version: '2.1.300', status: 'incompatible', dropped_options: [] };
  assert.equal(describeCheck({ ...base, reason_code: 'OPTION_REJECTED', reason_detail: '--permission-prompts' }),
    'Claude Code 2.1.300 changed an option Ask AI uses (--permission-prompts); AxioSozo needs an update for this version. Nothing was sent.');
  assert.match(describeCheck({ ...base, driver: 'codex', version: '0.170.0', reason_code: 'TOOLS_NOT_DISABLED', reason_detail: 'exec_command' }), /^Codex 0\.170\.0 offers the model tools Ask AI cannot turn off \(exec_command\)/u);
  assert.equal(describeCheck({ ...base, driver: 'codex', version: '0.162.0', status: 'compatible', reason_code: null, dropped_options: ['features.goals'] }),
    'Codex 0.162.0 · checked: it accepts the options Ask AI uses and offers the model no tools (no longer knows features.goals).');
});

// A synthetic transport for the Claude adapter: no process.
function fakeTransport() {
  const transport = new EventEmitter(); transport.sent = []; transport.child = { pid: 1, kill() {} };
  transport.send = message => transport.sent.push(message); transport.close = async () => {}; transport.closed = false; transport.diagnostic = '';
  return transport;
}
const claudeBinding = { instance_id: 'instance-a', account_identity: 'account-a', session_id: 'session-a', liveOptions: { cwd: '/synthetic' } };
async function claudeTurn(messages) {
  const transport = fakeTransport(); const adapter = new ProviderAdapter('claude-code', transport, claudeBinding);
  const events = []; adapter.on('event', event => events.push(event));
  await adapter.start({ version: 1, instance_id: 'instance-a', account_identity: 'account-a', session_id: 'session-a', request_id: 'r', turn_id: 't', text: 'Q' });
  for (const message of messages) transport.emit('message', message);
  return events;
}
const init = fields => ({ type: 'system', subtype: 'init', session_id: 'native-1', tools: [], mcp_servers: [], ...fields });

test('Claude: the client\'s own init report must show no tools and no MCP servers; unknown events are ignored', async () => {
  for (const bad of [{ tools: ['Bash'] }, { mcp_servers: [{ name: 'x', status: 'connected' }] }, { tools: 'all' }]) {
    const events = await claudeTurn([init(bad)]);
    assert.deepEqual(events.map(event => [event.type, event.status, event.reason]), [['turn_finished', 'uncertain', 'PROVIDER_TOOLS_ENABLED']], JSON.stringify(bad));
  }
  const ok = await claudeTurn([init({ future_field: 1 }), { type: 'rate_limit_event', rate_limit_info: {} }, { type: 'system', subtype: 'thinking_tokens' },
    { type: 'stream_event', session_id: 'native-1', event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'OK' } } },
    { type: 'result', subtype: 'success', is_error: false, session_id: 'native-1', result: 'OK', terminal_reason: 'completed', future: [] }]);
  assert.deepEqual(ok.map(event => [event.type, event.text ?? event.status]), [['text_delta', 'OK'], ['turn_finished', 'completed']]);
});

test('Claude failure results map to fixed reasons only', async () => {
  assert.equal(claudeFailureReason({ api_error_status: 429 }), 'RATE_LIMITED');
  assert.equal(claudeFailureReason({ api_error_status: 401 }), 'PROVIDER_AUTH');
  assert.equal(claudeFailureReason({ result: 'secret text' }), 'PROVIDER_ERROR');
  const events = await claudeTurn([init(), { type: 'result', subtype: 'error_during_execution', is_error: true, api_error_status: 429, session_id: 'native-1', result: 'limit' }]);
  assert.deepEqual(events.at(-1).reason, 'RATE_LIMITED'); assert.equal(events.at(-1).status, 'failed');
});

test('Codex check loop: a removed feature of ours is dropped and re-checked; required keys and flags are refusals', async () => {
  const known = ['features.goals', 'features.shell_tool', 'model_instructions_file'];
  const ok = { status: 'completed', answer: 'AXIOSOZO_CHECK_OK' };
  const clean = [{ kind: 'responses', tools: [], markers: [OWN_INSTRUCTIONS] }];
  const unknown = key => ({ outcome: { status: 'uncertain', reason: 'PROCESS_EXIT', answer: '' }, diagnostic: `Error loading config.toml: unknown configuration field \`${key}\` in -c/--config override`, requests: [] });
  const attempts = [];
  const tolerant = await codexCheckLoop({ known, attempt: async dropped => { attempts.push(dropped); return dropped.includes('features.goals') ? { outcome: ok, diagnostic: '', requests: clean } : unknown('features.goals'); } });
  assert.deepEqual(tolerant, { status: 'compatible', reason_code: null, reason_detail: null, dropped_options: ['features.goals'] });
  assert.deepEqual(attempts, [[], ['features.goals']]);
  // Dropping a key that kept a tool off is caught by the request inspection.
  const unsafe = await codexCheckLoop({ known, attempt: async dropped => (dropped.includes('features.shell_tool')
    ? { outcome: ok, diagnostic: '', requests: [{ kind: 'responses', tools: ['exec_command'], markers: [OWN_INSTRUCTIONS] }] } : unknown('features.shell_tool')) });
  assert.deepEqual([unsafe.status, unsafe.reason_code], ['incompatible', 'TOOLS_NOT_DISABLED']);
  assert.deepEqual(await codexCheckLoop({ known, attempt: async () => unknown('model_instructions_file') }),
    { status: 'incompatible', reason_code: 'OPTION_REJECTED', reason_detail: 'model_instructions_file' });
  assert.equal((await codexCheckLoop({ known, attempt: async () => unknown('features.not_ours') })).reason_detail, 'features.not_ours');
  const flag = await codexCheckLoop({ known, attempt: async () => ({ outcome: { status: 'uncertain', answer: '' }, diagnostic: "error: unexpected argument '--ignore-user-config' found", requests: [] }) });
  assert.deepEqual([flag.status, flag.reason_detail], ['incompatible', '--ignore-user-config']);
  const garbled = await codexCheckLoop({ known, attempt: async () => ({ outcome: { status: 'completed', answer: 'something else' }, diagnostic: '', requests: clean }) });
  assert.equal(garbled.reason_code, 'ANSWER_FORMAT_CHANGED');
  let rounds = 0;
  const endless = await codexCheckLoop({ known, attempt: async dropped => { rounds++; return unknown(known.filter(key => key !== 'model_instructions_file')[dropped.length] ?? 'model_instructions_file'); } });
  assert.equal(endless.reason_detail, 'model_instructions_file'); assert(rounds <= known.length + 1);
});
