// Real installed clients, offline: each runs under the actual sandbox broker against the
// loopback stand-in model (checks.mjs). No model call, no credential, no network beyond
// 127.0.0.1. Needs the provider broker (provider-host setup) and the clients on PATH;
// a missing client skips its cases. Run with:
//   /Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- node --test packages/provider-host/tests/checks.os.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { runCapabilityCheck } from '../src/checks.mjs';
import { resolveClient } from '../src/launch.mjs';

const clients = { codex: resolveClient('codex'), 'claude-code': resolveClient('claude-code') };
const dropConfig = key => args => { const index = args.findIndex(value => value.startsWith(`${key}=`)); return index > 0 ? [...args.slice(0, index - 1), ...args.slice(index + 1)] : args; };
const beforeStdin = extra => args => [...args.slice(0, -1), ...extra, '-'];

const cases = [
  ['codex', 'the Ask AI argv passes', args => args, { status: 'compatible' }],
  ['codex', 'shell tool left on is refused', dropConfig('features.shell_tool'), { status: 'incompatible', reason_code: 'TOOLS_NOT_DISABLED' }],
  ['codex', 'an unknown flag is refused by name', args => [args[0], '--axiosozo-unknown-flag', ...args.slice(1)], { status: 'incompatible', reason_code: 'OPTION_REJECTED', reason_detail: '--axiosozo-unknown-flag' }],
  ['codex', 'an unknown -c key is refused by --strict-config', beforeStdin(['-c', 'features.axiosozo_unknown=false']), { status: 'incompatible', reason_code: 'OPTION_REJECTED', reason_detail: 'features.axiosozo_unknown' }],
  ['codex', 'project instructions left on are refused', dropConfig('project_doc_max_bytes'), { status: 'incompatible', reason_code: 'INSTRUCTIONS_NOT_ISOLATED' }],
  ['claude-code', 'the Ask AI argv passes', args => args, { status: 'compatible' }],
  ['claude-code', 'default tools are refused', args => { const index = args.indexOf('--tools'); return [...args.slice(0, index + 1), 'default', ...args.slice(index + 2)].filter(value => value !== '--disallowedTools' && value !== '*'); }, { status: 'incompatible', reason_code: 'TOOLS_NOT_DISABLED' }],
  ['claude-code', 'an unknown flag is refused by name', args => ['--axiosozo-unknown-flag', ...args], { status: 'incompatible', reason_code: 'OPTION_REJECTED', reason_detail: '--axiosozo-unknown-flag' }],
  ['claude-code', 'an invalid choice is refused by option', args => args.map(value => (value === 'none' ? 'nobody' : value)), { status: 'incompatible', reason_code: 'OPTION_REJECTED', reason_detail: '--permission-prompts' }],
  ['claude-code', 'customizations left on are refused', args => args.filter(value => value !== '--safe-mode' && value !== '--restricted'), { status: 'incompatible', reason_code: 'INSTRUCTIONS_NOT_ISOLATED' }],
];

for (const [driver, name, transformArgs, expected] of cases) {
  test(`${driver}: ${name}`, { skip: !clients[driver].installed && `${driver} is not installed` }, async t => {
    const started = Date.now();
    const result = await runCapabilityCheck(driver, clients[driver], { transformArgs });
    for (const [key, value] of Object.entries(expected)) assert.equal(result[key], value, `${key}: ${JSON.stringify(result)}`);
    t.diagnostic(JSON.stringify({ ...result, ms: Date.now() - started, label: 'OFFLINE_CHECK', model_call: false }));
  });
}
