// TEST FIXTURES ONLY: the understand runner launches only the fake CLI scripts in
// fixtures/understand/ through the explicit test-only `testOnlyLaunch` option. The real Claude
// Code and Codex CLIs are never launched (live use is NOT_AUTHORIZED).
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ProviderHost } from '../src/host.mjs';
import { BRIEF_SCHEMA, claudeUnderstandArgs, codexUnderstandArgs, ERROR_EXPLANATION_SCHEMA, pickSetupCli, SETUP_MODELS, SETUP_SCHEMA,
  understandArgs, understandEnvironment, understandPrompt, UnderstandRunner, UNDERSTAND_KINDS, UNDERSTAND_LIVE,
  validateBrief, validateDocument, validateErrorExplanation, validateSetup, validateUnderstandRequest } from '../src/understand.mjs';

const fixture = name => fileURLToPath(new URL(`../fixtures/understand/${name}.mjs`, import.meta.url));
const launch = (claude, codex = claude) => ({ 'claude-code': { command: process.execPath, prefix: [fixture(claude)] },
  codex: { command: process.execPath, prefix: [fixture(codex)] } });
const roots = [];
function projectRoot() { const root = mkdtempSync(path.join(tmpdir(), 'understand-')); roots.push(root); return root; }
test.after(() => { for (const root of roots) rmSync(root, { recursive: true, force: true }); });
const fastLimits = { minTimeoutMs: 20 };
const errorsInput = { url: 'http://localhost:5173/checkout', errors: [{ level: 'error', text: 'TypeError: x is undefined', source: 'http://localhost:5173/src/main.ts', line: 12 }] };
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
async function gone(pid) { for (let i = 0; i < 100 && alive(pid); i++) await new Promise(resolve => setTimeout(resolve, 10)); return !alive(pid); }
async function pidsIn(root) {
  const file = path.join(root, 'fixture-pids.json');
  for (let i = 0; i < 200 && !existsSync(file); i++) await new Promise(resolve => setTimeout(resolve, 10));
  return JSON.parse(readFileSync(file, 'utf8'));
}

test('Read-only argument arrays are fixed arrays, never shell strings', () => {
  for (const kind of ['brief', 'explain_errors']) {
    const args = claudeUnderstandArgs(kind);
    assert(args.every(arg => typeof arg === 'string'));
    assert.deepEqual(args.slice(0, 3), ['--print', '--output-format', 'json']);
    const mode = args.indexOf('--permission-mode'); assert.equal(args[mode + 1], 'plan');
    assert.equal(args[args.indexOf('--permission-prompts') + 1], 'none');
    assert.equal(args[args.indexOf('--tools') + 1], 'Read,Glob,Grep');
    for (const flag of ['--safe-mode', '--restricted', '--strict-mcp-config', '--disable-slash-commands', '--no-chrome', '--no-session-persistence']) assert(args.includes(flag), flag);
    const denied = args.slice(args.indexOf('--disallowedTools') + 1, args.indexOf('--strict-mcp-config'));
    assert.deepEqual(denied, ['Bash', 'Edit', 'Write', 'NotebookEdit', 'WebFetch', 'WebSearch', 'mcp__*', 'Read(.env*)', 'Read(**/.env*)', 'Edit(.env*)']);
    const settings = JSON.parse(args[args.indexOf('--settings') + 1]);
    assert.equal(settings.disableAllHooks, true); assert(settings.permissions.deny.includes('Read(.env*)'));
    assert.equal(JSON.parse(args[args.indexOf('--json-schema') + 1]).additionalProperties, false);
    assert(!args.some(arg => arg === '-p' || arg.includes('dangerously') || arg === 'bypassPermissions'));
  }
  assert.deepEqual(codexUnderstandArgs(), ['exec', '--sandbox', 'read-only', '--ephemeral', '--skip-git-repo-check', '--ignore-user-config', '--ignore-rules',
    '-c', 'approval_policy="never"', '-c', 'web_search="disabled"', '-']);
  assert.equal(UNDERSTAND_LIVE, 'NOT_AUTHORIZED');
});

test('Claude fake: brief over stdin, minimal env, project cwd, exact argv, normalized strict document', async () => {
  const root = projectRoot(); const runner = new UnderstandRunner({ testOnlyLaunch: launch('claude-ok') });
  const result = await runner.run({ request_id: 'u1', kind: 'brief', cli: 'claude-code', project_root: root });
  assert.equal(result.status, 'ok'); assert.equal(result.reason, null); assert.equal(result.data_sent, true);
  assert.deepEqual(Object.keys(result), ['version', 'request_id', 'kind', 'cli', 'status', 'reason', 'document', 'data_sent', 'duration_ms']);
  assert.equal(result.document.product, 'Synthetic shop for testing.'); assert.equal(result.document.domains[0].host, 'shop.example.test');
  const record = JSON.parse(readFileSync(path.join(root, 'fixture-record.json'), 'utf8'));
  assert.deepEqual(record.argv, claudeUnderstandArgs('brief'));
  // macOS CoreFoundation adds __CF_USER_TEXT_ENCODING inside the child itself; nothing else may appear.
  assert.deepEqual(Object.keys(record.env).filter(key => key !== '__CF_USER_TEXT_ENCODING').sort(), ['HOME', 'LANG', 'PATH', 'TERM']);
  assert.equal(record.env.TERM, 'dumb'); assert(!Object.keys(record.env).some(key => key.startsWith('AXIOSOZO_')));
  assert.deepEqual(Object.keys(understandEnvironment()).sort(), ['HOME', 'LANG', 'PATH', 'TERM']);
  assert.equal(record.cwd, realpathSync(root));
  assert.equal(record.prompt, understandPrompt('brief'));
  assert.match(record.prompt, /Read-only/); assert.match(record.prompt, /\.env/); assert.match(record.prompt, /exactly one JSON object/);
  const text = await new UnderstandRunner({ testOnlyLaunch: launch('claude-result-text') }).run({ request_id: 'u2', kind: 'brief', cli: 'claude-code', project_root: root });
  assert.equal(text.status, 'ok');
});

test('Codex fake: explain_errors embeds the console errors as untrusted data and returns the explanation', async () => {
  const root = projectRoot(); const runner = new UnderstandRunner({ testOnlyLaunch: launch('codex-ok') });
  const result = await runner.run({ request_id: 'u3', kind: 'explain_errors', cli: 'codex', project_root: root, input: errorsInput, timeout_ms: 10000 });
  assert.equal(result.status, 'ok'); assert.equal(result.document.items[0].where, 'src/config.ts');
  const record = JSON.parse(readFileSync(path.join(root, 'fixture-record.json'), 'utf8'));
  assert.deepEqual(record.argv, codexUnderstandArgs());
  assert.match(record.prompt, /untrusted data/); assert(record.prompt.includes(JSON.stringify(errorsInput)));
});

test('Failures: non-zero exit, invalid JSON and unknown keys never return a document or stderr', async () => {
  const root = projectRoot();
  const failed = await new UnderstandRunner({ testOnlyLaunch: launch('claude-error') }).run({ request_id: 'f1', kind: 'brief', cli: 'claude-code', project_root: root });
  assert.equal(failed.status, 'failed'); assert.equal(failed.reason, 'EXIT_NONZERO'); assert.equal(failed.document, null); assert.equal(failed.data_sent, true);
  assert(!JSON.stringify(failed).includes('synthetic-secret-looking-stderr'));
  for (const [name, cli] of [['invalid-json', 'claude-code'], ['invalid-json', 'codex'], ['extra-key', 'codex']]) {
    const result = await new UnderstandRunner({ testOnlyLaunch: launch(name) }).run({ request_id: `f_${name}`, kind: 'brief', cli, project_root: root });
    assert.equal(result.status, 'invalid_output', name); assert.equal(result.reason, 'SCHEMA_MISMATCH'); assert.equal(result.document, null);
  }
});

test('stdout over 256 KiB is invalid_output and the CLI is killed', async () => {
  const runner = new UnderstandRunner({ testOnlyLaunch: launch('flood') });
  const started = Date.now();
  const result = await runner.run({ request_id: 'flood', kind: 'brief', cli: 'codex', project_root: projectRoot(), timeout_ms: 10000 });
  assert.equal(result.status, 'invalid_output'); assert.equal(result.reason, 'OUTPUT_LIMIT'); assert.equal(result.document, null);
  assert(Date.now() - started < 5000);
});

test('Timeout kills the whole process group, including a grandchild', async () => {
  const root = projectRoot(); const runner = new UnderstandRunner({ testOnlyLaunch: launch('hang'), limits: fastLimits });
  const result = await runner.run({ request_id: 'slow', kind: 'brief', cli: 'claude-code', project_root: root, timeout_ms: 300 });
  assert.equal(result.status, 'timeout'); assert.equal(result.data_sent, true); assert(result.duration_ms >= 250);
  const pids = await pidsIn(root);
  assert(await gone(pids.child)); assert(await gone(pids.grandchild));
});

test('Queue: one running, at most four queued, then busy; cancel queued and running; close kills', async () => {
  const roots4 = Array.from({ length: 6 }, projectRoot);
  const runner = new UnderstandRunner({ testOnlyLaunch: launch('hang') });
  const runs = roots4.slice(0, 5).map((root, i) => runner.run({ request_id: `q${i}`, kind: 'brief', cli: 'codex', project_root: root }));
  const busy = await runner.run({ request_id: 'q5', kind: 'brief', cli: 'codex', project_root: roots4[5] });
  assert.equal(busy.status, 'busy'); assert.equal(busy.reason, 'QUEUE_FULL'); assert.equal(busy.data_sent, false);
  assert.equal(runner.active, 5);
  assert.throws(() => runner.run({ request_id: 'q1', kind: 'brief', cli: 'codex', project_root: roots4[1] }), { code: 'DUPLICATE_REQUEST' });
  assert.deepEqual(runner.cancel({ request_id: 'q3' }), { cancelled: true });
  const queued = await runs[3]; assert.equal(queued.status, 'cancelled'); assert.equal(queued.data_sent, false);
  const first = await pidsIn(roots4[0]);
  assert.deepEqual(runner.cancel({ request_id: 'q0' }), { cancelled: true });
  const cancelled = await runs[0]; assert.equal(cancelled.status, 'cancelled'); assert.equal(cancelled.data_sent, true);
  assert(await gone(first.child)); assert(await gone(first.grandchild));
  assert.deepEqual(runner.cancel({ request_id: 'missing' }), { cancelled: false });
  const second = await pidsIn(roots4[1]); // q1 started after q0 ended
  runner.close();
  const closed = await Promise.all([runs[1], runs[2], runs[4]]);
  assert.deepEqual(closed.map(r => [r.status, r.reason]), [['cancelled', 'HOST_CLOSED'], ['cancelled', 'HOST_CLOSED'], ['cancelled', 'HOST_CLOSED']]);
  assert(await gone(second.child)); assert(await gone(second.grandchild));
  assert.equal(existsSync(path.join(roots4[2], 'fixture-pids.json')), false);
});

test('Without the test-only launch, a real CLI is never started: NOT_AUTHORIZED, or not installed', async () => {
  const root = projectRoot(); let discoveries = 0;
  const installed = () => { discoveries++; return [{ driver: 'claude-code', installed: true, executable: fixture('claude-ok'), client_version: '2.1.283' },
    { driver: 'codex', installed: false, executable: null, client_version: null }, { driver: 'antigravity', installed: true, executable: '/synthetic/agy', client_version: null }]; };
  const runner = new UnderstandRunner({ discover: installed });
  const result = await runner.run({ request_id: 'live', kind: 'brief', cli: 'claude-code', project_root: root });
  assert.deepEqual(result, { version: 1, request_id: 'live', kind: 'brief', cli: 'claude-code', status: 'unavailable', reason: 'NOT_AUTHORIZED',
    document: null, data_sent: false, duration_ms: 0 });
  assert.equal(discoveries, 0); assert.equal(existsSync(path.join(root, 'fixture-record.json')), false);
  const authorized = new UnderstandRunner({ discover: installed, liveAuthorized: true });
  assert.equal((await authorized.run({ request_id: 'live2', kind: 'brief', cli: 'codex', project_root: root })).reason, 'CLI_NOT_INSTALLED');
  assert.deepEqual(runner.available(), { clis: [{ cli: 'claude-code', path: fixture('claude-ok'), version: '2.1.283' }] });
});

test('Request validation: project root, kind/cli, input shape, timeout bounds, unknown keys', () => {
  const root = projectRoot(); const home = projectRoot();
  const base = { request_id: 'v1', kind: 'brief', cli: 'claude-code', project_root: root };
  assert.equal(validateUnderstandRequest(base, { home }).timeout_ms, 180000);
  assert.equal(validateUnderstandRequest({ ...base, kind: 'setup', cli: 'codex' }, { home }).input, undefined);
  const cases = {
    'root slash': { ...base, project_root: '/' },
    'home': { ...base, project_root: home },
    'relative': { ...base, project_root: 'project' },
    'missing': { ...base, project_root: path.join(root, 'nope') },
    'file': { ...base, project_root: fileURLToPath(import.meta.url) },
    'unknown kind': { ...base, kind: 'chat' },
    'unknown cli': { ...base, cli: 'antigravity' },
    'input on brief': { ...base, input: errorsInput },
    'input on setup': { ...base, kind: 'setup', input: errorsInput },
    'null input on setup': { ...base, kind: 'setup', input: null },
    'no input on explain': { ...base, kind: 'explain_errors' },
    'url with query': { ...base, kind: 'explain_errors', input: { ...errorsInput, url: 'https://x.test/a?token=1' } },
    'url with fragment': { ...base, kind: 'explain_errors', input: { ...errorsInput, url: 'https://x.test/a#b' } },
    'file url': { ...base, kind: 'explain_errors', input: { ...errorsInput, url: 'file:///etc/passwd' } },
    'too many errors': { ...base, kind: 'explain_errors', input: { ...errorsInput, errors: Array(51).fill(errorsInput.errors[0]) } },
    'text over 1000': { ...base, kind: 'explain_errors', input: { ...errorsInput, errors: [{ ...errorsInput.errors[0], text: 'x'.repeat(1001) }] } },
    'unknown error key': { ...base, kind: 'explain_errors', input: { ...errorsInput, errors: [{ ...errorsInput.errors[0], stack: 'x' }] } },
    'bad level': { ...base, kind: 'explain_errors', input: { ...errorsInput, errors: [{ ...errorsInput.errors[0], level: 'fatal' }] } },
    'timeout under 10 s': { ...base, timeout_ms: 9999 },
    'timeout over 300 s': { ...base, timeout_ms: 300001 },
    'unknown key': { ...base, executable: '/bin/sh' },
    'env key': { ...base, env: { TOKEN: 'x' } },
    'bad request id': { ...base, request_id: 'bad id' },
  };
  for (const [name, params] of Object.entries(cases)) assert.throws(() => validateUnderstandRequest(params, { home }), { code: 'INVALID_INPUT' }, name);
});

test('Strict document validators reject unknown keys, over-cap strings, bad hosts and unsafe paths', async () => {
  const { BRIEF, EXPLANATION } = await import('../fixtures/understand/common.mjs');
  const brief = () => JSON.parse(JSON.stringify(BRIEF));
  assert.equal(validateBrief(brief()).product, 'Synthetic shop for testing.');
  const bad = {
    'version 2': b => { b.version = 2; }, 'extra key': b => { b.owner = 'x'; }, 'missing key': b => { delete b.risks; },
    'product over 600': b => { b.product = 'p'.repeat(601); }, 'empty product': b => { b.product = '   '; },
    'too many apps': b => { b.apps = Array(17).fill(b.apps[0]); }, 'bad app kind': b => { b.apps[0].kind = 'game'; },
    'absolute path': b => { b.apps[0].path = '/etc'; }, 'parent path': b => { b.apps[0].path = 'apps/../../x'; }, 'home path': b => { b.apps[0].path = '~/x'; },
    'host with scheme': b => { b.domains[0].host = 'https://shop.test'; }, 'host with port': b => { b.domains[0].host = 'shop.test:443'; },
    'host with space': b => { b.domains[0].host = 'shop test'; }, 'too many domains': b => { b.domains = Array(33).fill(b.domains[0]); },
    'command over 200': b => { b.start[0].command = 'c'.repeat(201); }, 'too many start': b => { b.start = Array(9).fill(b.start[0]); },
    'risk not string': b => { b.risks = [1]; }, 'too many risks': b => { b.risks = Array(9).fill('r'); },
    'control char in name': b => { b.apps[0].name = 'we\u0007b'; }, 'newline in name': b => { b.apps[0].name = 'we\nb'; },
    'extra app key': b => { b.apps[0].secret = 'x'; }, 'service purpose over 120': b => { b.services[0].purpose = 's'.repeat(121); },
  };
  for (const [name, mutate] of Object.entries(bad)) { const b = brief(); mutate(b); assert.throws(() => validateBrief(b), { code: 'INVALID_OUTPUT' }, name); }
  assert.deepEqual(validateErrorExplanation(EXPLANATION), EXPLANATION);
  for (const doc of [{ ...EXPLANATION, extra: 1 }, { ...EXPLANATION, items: Array(11).fill(EXPLANATION.items[0]) },
    { ...EXPLANATION, summary: 's'.repeat(401) }, { ...EXPLANATION, items: [{ ...EXPLANATION.items[0], where: '/abs' }] }, null, []])
    assert.throws(() => validateErrorExplanation(doc), { code: 'INVALID_OUTPUT' });
});

test('Host understand/* methods: available, run, cancel; host close kills; UNSUPPORTED without a runner', async () => {
  const root = projectRoot(); const messages = []; let next = 0;
  const host = new ProviderHost({ createAdapter: () => assert.fail('no client'),
    createUnderstandRunner: () => new UnderstandRunner({ testOnlyLaunch: launch('hang', 'codex-ok'), discover: () => [] }) });
  host.on('message', m => messages.push(m));
  const call = (method, params) => { const id = `u${++next}`; return host.handle({ version: 1, id, method, params }).then(() => messages.find(m => m.id === id)); };
  try {
    assert.deepEqual((await call('understand/available', {})).result, { clis: [] });
    assert.equal((await call('understand/run', { request_id: 'h1', kind: 'brief', cli: 'codex', project_root: root })).result.status, 'ok');
    assert.equal((await call('understand/run', { request_id: 'h2', kind: 'brief', cli: 'codex', project_root: '/' })).error.code, 'INVALID_INPUT');
    const running = call('understand/run', { request_id: 'h3', kind: 'brief', cli: 'claude-code', project_root: root });
    const pids = await pidsIn(root);
    assert.deepEqual((await call('understand/cancel', { request_id: 'h3' })).result, { cancelled: true });
    assert.equal((await running).result.status, 'cancelled');
    assert(await gone(pids.grandchild));
    rmSync(path.join(root, 'fixture-pids.json'));
    const closing = call('understand/run', { request_id: 'h4', kind: 'brief', cli: 'claude-code', project_root: root });
    const again = await pidsIn(root);
    await host.close(); await closing;
    assert(await gone(again.child)); assert(await gone(again.grandchild));
  } finally { await host.close(); }
  const bare = new ProviderHost({ createAdapter: () => {} }); const out = []; bare.on('message', m => out.push(m));
  try { await bare.handle({ version: 1, id: 'x', method: 'understand/available', params: {} }); assert.equal(out.at(-1).error.code, 'UNSUPPORTED'); }
  finally { await bare.close(); }
});

// ---------------------------------------------------------------------------------------
// setup kind
const CLAUDE_TAIL = ['--permission-mode', 'plan', '--permission-prompts', 'none', '--safe-mode', '--restricted', '--tools', 'Read,Glob,Grep',
  '--disallowedTools', 'Bash', 'Edit', 'Write', 'NotebookEdit', 'WebFetch', 'WebSearch', 'mcp__*', 'Read(.env*)', 'Read(**/.env*)', 'Edit(.env*)',
  '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
  '--settings', '{"disableAllHooks":true,"disableClaudeAiConnectors":true,"permissions":{"deny":["Read(.env*)","Read(**/.env*)","Edit(.env*)"]}}',
  '--disable-slash-commands', '--no-chrome', '--no-session-persistence', '--max-turns', '40'];
const CODEX_TAIL = ['--sandbox', 'read-only', '--ephemeral', '--skip-git-repo-check', '--ignore-user-config', '--ignore-rules',
  '-c', 'approval_policy="never"', '-c', 'web_search="disabled"', '-'];

test('setup: kinds, exact argv with the cheapest model per CLI; brief and explain_errors argv unchanged', () => {
  assert.deepEqual(UNDERSTAND_KINDS, ['brief', 'explain_errors', 'setup']);
  assert.deepEqual(claudeUnderstandArgs('setup'), ['--print', '--model', 'claude-sonnet-5-5', '--output-format', 'json',
    '--json-schema', JSON.stringify(SETUP_SCHEMA), ...CLAUDE_TAIL]);
  assert.deepEqual(codexUnderstandArgs('setup'), ['exec', '-m', 'gpt-6-luna', '-c', 'model_reasoning_effort="low"', ...CODEX_TAIL]);
  assert.deepEqual(understandArgs('codex', 'setup'), codexUnderstandArgs('setup'));
  assert.deepEqual(understandArgs('claude-code', 'setup'), claudeUnderstandArgs('setup'));
  // Byte-identical to the pre-setup argv: no model flags for brief and explain_errors.
  assert.deepEqual(claudeUnderstandArgs('brief'), ['--print', '--output-format', 'json', '--json-schema', JSON.stringify(BRIEF_SCHEMA), ...CLAUDE_TAIL]);
  assert.deepEqual(claudeUnderstandArgs('explain_errors'), ['--print', '--output-format', 'json', '--json-schema', JSON.stringify(ERROR_EXPLANATION_SCHEMA), ...CLAUDE_TAIL]);
  for (const kind of ['brief', 'explain_errors']) {
    assert.deepEqual(codexUnderstandArgs(kind), ['exec', ...CODEX_TAIL]);
    assert.deepEqual(understandArgs('codex', kind), ['exec', ...CODEX_TAIL]);
  }
  assert.throws(() => codexUnderstandArgs('chat'), { code: 'INVALID_INPUT' });
  assert.throws(() => claudeUnderstandArgs('chat'), { code: 'INVALID_INPUT' });
  assert.deepEqual(SETUP_MODELS, { codex: { model: 'gpt-6-luna', args: ['-m', 'gpt-6-luna', '-c', 'model_reasoning_effort="low"'] },
    'claude-code': { model: 'claude-sonnet-5-5', args: ['--model', 'claude-sonnet-5-5'] }, antigravity: { model: 'gemini-3.8-flash-low', args: null } });
  assert(Object.isFrozen(SETUP_MODELS) && Object.isFrozen(SETUP_MODELS.codex) && Object.isFrozen(SETUP_MODELS.codex.args));
  assert(Object.isFrozen(SETUP_SCHEMA)); assert.equal(SETUP_SCHEMA.additionalProperties, false);
  assert.deepEqual(SETUP_SCHEMA.required, ['version', 'name', 'kind', 'kind_reason', 'icon', 'services']);
  assert.equal(UNDERSTAND_LIVE, 'NOT_AUTHORIZED');
});

test('setup: prompt keeps the marker, read-only rules and embeds SETUP_SCHEMA; no input section', () => {
  const prompt = understandPrompt('setup');
  assert(prompt.startsWith('AxioSozo understand request: setup.\n'));
  assert(prompt.includes(JSON.stringify(SETUP_SCHEMA)));
  assert.match(prompt, /Read-only/); assert.match(prompt, /\.env/); assert.match(prompt, /exactly one JSON object/);
  assert.match(prompt, /a browser or other native app is desktop/); assert.match(prompt, /256 KB/); assert.match(prompt, /exact command typed in a terminal/);
  assert(!prompt.includes('untrusted data'));
  assert.equal(understandPrompt('brief'), understandPrompt('brief', undefined));
  assert.throws(() => understandPrompt('chat'), { code: 'INVALID_INPUT' });
});

test('setup: pickSetupCli prefers Codex, then Claude Code, else null', () => {
  assert.equal(pickSetupCli(['claude-code', 'codex']), 'codex');
  assert.equal(pickSetupCli(['claude-code']), 'claude-code');
  assert.equal(pickSetupCli(['antigravity', 'codex']), 'codex');
  assert.equal(pickSetupCli(['antigravity']), null);
  assert.equal(pickSetupCli([]), null);
  assert.equal(pickSetupCli(null), null);
  assert.equal(pickSetupCli('codex'), null);
});

test('setup: validateSetup normalizes the canned document and rejects unsafe or unknown shapes', async () => {
  const { SETUP } = await import('../fixtures/understand/common.mjs');
  const setup = () => JSON.parse(JSON.stringify(SETUP));
  const expected = { ...setup(), services: [{ ...SETUP.services[0], url: 'http://localhost:5173' }, SETUP.services[1]] };
  const valid = validateSetup(setup());
  assert.deepEqual(valid, expected);
  assert(Object.isFrozen(valid) && Object.isFrozen(valid.services) && valid.services.every(Object.isFrozen));
  assert.deepEqual(validateDocument('setup', setup()), expected);
  const good = {
    'name null': d => { d.name = null; }, 'trimmed name': d => { d.name = '  Harbor Suite  '; }, 'empty reason': d => { d.kind_reason = ''; },
    'icon null': d => { d.icon = null; }, 'icon svg upper': d => { d.icon = 'branding/Logo.SVG'; }, 'no services': d => { d.services = []; },
    'eight services': d => { d.services = Array(8).fill(d.services[1]); }, 'ipv4 https': d => { d.services[0].url = 'https://127.0.0.1:8443/app'; },
    'ipv6': d => { d.services[0].url = 'http://[::1]:3000'; }, 'desktop no url': d => { d.kind = 'desktop'; d.services[0] = { name: 'browser', kind: 'desktop', command: './dev', cwd: null, url: null }; },
    'duplicate names': d => { d.services[1].name = 'web'; },
  };
  for (const [name, mutate] of Object.entries(good)) { const d = setup(); mutate(d); assert.doesNotThrow(() => validateSetup(d), name); }
  const trimmed = setup(); trimmed.name = '  Harbor Suite  '; assert.equal(validateSetup(trimmed).name, 'Harbor Suite');
  const ipv6 = setup(); ipv6.services[0].url = 'http://[::1]:3000/'; assert.equal(validateSetup(ipv6).services[0].url, 'http://[::1]:3000');
  const pathUrl = setup(); pathUrl.services[0].url = 'http://LOCALHOST:5173/docs/'; assert.equal(validateSetup(pathUrl).services[0].url, 'http://localhost:5173/docs/');
  const bad = {
    'unknown key': d => { d.extra = 1; }, 'unknown service key': d => { d.services[0].env = 'x'; }, 'missing key': d => { delete d.icon; },
    'version 2': d => { d.version = 2; }, 'bad kind': d => { d.kind = 'api'; }, 'bad service kind': d => { d.services[0].kind = 'database'; },
    'empty name': d => { d.name = '  '; }, 'name over 80': d => { d.name = 'n'.repeat(81); }, 'name newline': d => { d.name = 'Har\nbor'; },
    'reason over 160': d => { d.kind_reason = 'r'.repeat(161); }, 'reason tab': d => { d.kind_reason = 'a\tb'; },
    'icon parent': d => { d.icon = 'apps/../icon.png'; }, 'icon dot env': d => { d.icon = '.env.png'; }, 'icon env segment': d => { d.icon = 'config/.ENV.local/icon.png'; },
    'icon wrong extension': d => { d.icon = 'apps/web/public/icon.gif'; }, 'icon no extension': d => { d.icon = 'apps/web/public/icon'; },
    'icon hidden segment': d => { d.icon = 'apps/.branding/icon.png'; }, 'icon hidden file': d => { d.icon = '.icon.png'; },
    'icon absolute': d => { d.icon = '/Users/x/icon.png'; }, 'icon home': d => { d.icon = '~/icon.png'; }, 'icon backslash': d => { d.icon = 'apps\\icon.png'; },
    'icon url': d => { d.icon = 'https://cdn.test/icon.png'; }, 'icon data': d => { d.icon = 'data:image/png;base64,AAAA.png'; },
    'icon query': d => { d.icon = 'icon.png?x'; }, 'icon fragment': d => { d.icon = 'icon.png#x'; }, 'icon empty segment': d => { d.icon = 'apps//icon.png'; },
    'icon dot segment': d => { d.icon = './icon.png'; }, 'icon too deep': d => { d.icon = `${'a/'.repeat(16)}icon.png`; }, 'icon over 200': d => { d.icon = `${'a'.repeat(197)}.png`; },
    'url non-loopback': d => { d.services[0].url = 'http://example.test:5173'; }, 'url lan': d => { d.services[0].url = 'http://192.168.1.2:5173'; },
    'url 0.0.0.0': d => { d.services[0].url = 'http://0.0.0.0:5173'; }, 'url without port': d => { d.services[0].url = 'http://localhost'; },
    'url default port': d => { d.services[0].url = 'http://localhost:80'; },
    'url query': d => { d.services[0].url = 'http://localhost:5173/?token=1'; }, 'url empty query': d => { d.services[0].url = 'http://localhost:5173/?'; },
    'url hash': d => { d.services[0].url = 'http://localhost:5173/#x'; }, 'url credentials': d => { d.services[0].url = 'http://u:p@localhost:5173'; },
    'url scheme': d => { d.services[0].url = 'ws://localhost:5173'; }, 'url file': d => { d.services[0].url = 'file:///etc/passwd'; },
    'url not url': d => { d.services[0].url = 'localhost:5173'; }, 'url over 200': d => { d.services[0].url = `http://localhost:5173/${'p'.repeat(180)}`; },
    'cwd absolute': d => { d.services[0].cwd = '/srv/app'; }, 'cwd parent': d => { d.services[0].cwd = '..'; }, 'cwd dot': d => { d.services[0].cwd = '.'; },
    'cwd trailing slash': d => { d.services[0].cwd = 'apps/web/'; }, 'cwd env': d => { d.services[0].cwd = '.env'; }, 'cwd scheme': d => { d.services[0].cwd = 'c:/x'; },
    'too many services': d => { d.services = Array(9).fill(d.services[1]); }, 'services not array': d => { d.services = {}; },
    'command newline': d => { d.services[0].command = 'pnpm dev\nrm -rf /'; }, 'command empty': d => { d.services[0].command = ' '; },
    'command over 200': d => { d.services[0].command = 'c'.repeat(201); }, 'service name over 64': d => { d.services[0].name = 's'.repeat(65); },
    'service null': d => { d.services[0] = null; }, 'name number': d => { d.name = 1; },
  };
  for (const [name, mutate] of Object.entries(bad)) { const d = setup(); mutate(d); assert.throws(() => validateSetup(d), { code: 'INVALID_OUTPUT' }, name); }
  for (const doc of [null, [], 'x']) assert.throws(() => validateSetup(doc), { code: 'INVALID_OUTPUT' });
  assert.throws(() => validateDocument('chat', setup()), { code: 'INVALID_INPUT' });
  assert.throws(() => validateBrief(setup()), { code: 'INVALID_OUTPUT' });
});

test('setup: Codex and Claude fakes run with model args and return the validated document', async () => {
  for (const [cli, name] of [['codex', 'codex-ok'], ['claude-code', 'claude-ok']]) {
    const root = projectRoot();
    const result = await new UnderstandRunner({ testOnlyLaunch: launch(name) }).run({ request_id: `s_${name}`, kind: 'setup', cli, project_root: root });
    assert.equal(result.status, 'ok', name); assert.equal(result.reason, null); assert.equal(result.kind, 'setup'); assert.equal(result.data_sent, true);
    assert.equal(result.document.name, 'Harbor Suite'); assert.equal(result.document.icon, 'apps/web/public/icon.png');
    assert.deepEqual(result.document.services.map(service => service.url), ['http://localhost:5173', null]);
    const record = JSON.parse(readFileSync(path.join(root, 'fixture-record.json'), 'utf8'));
    assert.deepEqual(record.argv, understandArgs(cli, 'setup'));
    assert.deepEqual(record.argv.slice(record.argv.indexOf(SETUP_MODELS[cli].args[0]), record.argv.indexOf(SETUP_MODELS[cli].args[0]) + SETUP_MODELS[cli].args.length), SETUP_MODELS[cli].args);
    assert.equal(record.prompt, understandPrompt('setup'));
  }
  const wrong = await new UnderstandRunner({ testOnlyLaunch: launch('extra-key') }).run({ request_id: 's_extra', kind: 'setup', cli: 'codex', project_root: projectRoot() });
  assert.equal(wrong.status, 'invalid_output'); assert.equal(wrong.reason, 'SCHEMA_MISMATCH'); assert.equal(wrong.document, null);
});

test('setup: without the test-only launch it stays NOT_AUTHORIZED and sends nothing', async () => {
  const root = projectRoot(); let discoveries = 0;
  const installed = () => { discoveries++; return [{ driver: 'codex', installed: true, executable: fixture('codex-ok'), client_version: '0.160.0' }]; };
  for (const cli of ['codex', 'claude-code']) {
    const result = await new UnderstandRunner({ discover: installed }).run({ request_id: `live_${cli}`, kind: 'setup', cli, project_root: root });
    assert.deepEqual(result, { version: 1, request_id: `live_${cli}`, kind: 'setup', cli, status: 'unavailable', reason: 'NOT_AUTHORIZED',
      document: null, data_sent: false, duration_ms: 0 });
  }
  assert.equal(discoveries, 0); assert.equal(existsSync(path.join(root, 'fixture-record.json')), false);
});
