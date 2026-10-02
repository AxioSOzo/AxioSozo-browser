import assert from 'node:assert/strict';
import test from 'node:test';
import { hookConfig, hookInvocation, bridgeConfig, bridgeInvocation, validateBoundSocketPath } from '../src/agent-config.mjs';
import { ContextsError } from '../src/errors.mjs';
import { resolveSocketPath } from '../../agent-bridge/src/channel.mjs';

const SOCKET = '/Volumes/AxioSozoBuild/workstation/p4c-test/gecko/.a/s';
const NOTIFY = '/Volumes/T9/Code/AxioSozo-browser-workstation/tools/axiosozo-notify';
const NODE = '/Volumes/AxioSozoBuild/toolchains/zen/node/bin/node';
const BRIDGE = '/Volumes/T9/Code/AxioSozo-browser-workstation/packages/agent-bridge/bin/axiosozo-agent-bridge.mjs';
const input = { notifyPath: NOTIFY, socketPath: SOCKET, nodePath: NODE, bridgePath: BRIDGE };
const invalid = path => error => error instanceof ContextsError && error.code === 'INVALID_INPUT' && error.path === path;
const codexNotify = snippet => JSON.parse(/^notify = (.+)\n$/u.exec(snippet)?.[1] ?? 'null');

// Fake provider/native argv dispatch: only data is inspected. Neither env,
// sh, notify, bridge, a provider client, nor a socket is executed here.
function fakeHookLaunch(argv, json) {
  assert.equal(argv[0], '/usr/bin/env');
  assert(argv[1].startsWith('AXIOSOZO_AGENT_SOCKET='));
  assert.equal(argv[2], '/bin/sh');
  assert(!argv.includes('-c'));
  return { env: { AXIOSOZO_AGENT_SOCKET: argv[1].slice('AXIOSOZO_AGENT_SOCKET='.length) },
    command: argv[2], args: [...argv.slice(3), ...(json === undefined ? [] : [json])] };
}

test('Claude hooks use provider exec-form args bound to the verified socket for all supported events', () => {
  const config = JSON.parse(hookConfig({ agent: 'claude-code', ...input }));
  assert.deepEqual(Object.keys(config), ['hooks']);
  assert.deepEqual(Object.keys(config.hooks), ['Stop', 'Notification', 'UserPromptSubmit']);
  for (const [event, groups] of Object.entries(config.hooks)) {
    assert.equal(groups.length, 1); assert.deepEqual(Object.keys(groups[0]), ['hooks']);
    const hook = groups[0].hooks[0];
    assert.deepEqual(hook, { type: 'command', command: '/usr/bin/env',
      args: [`AXIOSOZO_AGENT_SOCKET=${SOCKET}`, '/bin/sh', NOTIFY, 'claude-code', event], timeout: 5 });
    assert.deepEqual(fakeHookLaunch([hook.command, ...hook.args]), {
      env: { AXIOSOZO_AGENT_SOCKET: SOCKET }, command: '/bin/sh', args: [NOTIFY, 'claude-code', event] });
  }
});

test('Codex notify preserves appended JSON after literal socket assignment and fixed script interpreter', () => {
  const argv = codexNotify(hookConfig({ agent: 'codex', ...input }));
  assert.deepEqual(argv, ['/usr/bin/env', `AXIOSOZO_AGENT_SOCKET=${SOCKET}`, '/bin/sh', NOTIFY, 'codex']);
  const payload = JSON.stringify({ type: 'agent-turn-complete', cwd: '/project', 'last-assistant-message': 'done' });
  assert.deepEqual(fakeHookLaunch(argv, payload), { env: { AXIOSOZO_AGENT_SOCKET: SOCKET }, command: '/bin/sh', args: [NOTIFY, 'codex', payload] });
});

test('hook and bridge paths preserve shell metacharacters verbatim as arguments/data', () => {
  const values = { notifyPath: '/repo/a=b "quote" \'single\' `tick` $(touch nope); tools/notify',
    socketPath: '/profile/a=b "quote" \'single\' `tick` $(touch nope);/.a/s',
    nodePath: '/node/a=b "quote" \'single\' `tick` $(touch nope);',
    bridgePath: '/repo/a=b "quote" \'single\' `tick` $(touch nope);/bridge.mjs' };
  const hook = JSON.parse(hookConfig({ agent: 'claude-code', ...values })).hooks.Stop[0].hooks[0];
  assert.deepEqual(fakeHookLaunch([hook.command, ...hook.args]).args, [values.notifyPath, 'claude-code', 'Stop']);
  assert.equal(fakeHookLaunch([hook.command, ...hook.args]).env.AXIOSOZO_AGENT_SOCKET, values.socketPath);
  const argv = codexNotify(hookConfig({ agent: 'codex', ...values }));
  assert.equal(argv[3], values.notifyPath); assert.equal(argv[1], `AXIOSOZO_AGENT_SOCKET=${values.socketPath}`);
  const bridge = JSON.parse(bridgeConfig({ agent: 'claude-code', ...values })).mcpServers.axiosozo;
  assert.equal(bridge.command, values.nodePath); assert.equal(bridge.args[0], values.bridgePath);
  assert.equal(bridge.args.at(-1), values.socketPath);
  assert.equal(bridge.env.AXIOSOZO_AGENT_SOCKET, values.socketPath);
});

test('bridge configs bind both explicit --socket argv and env to the identical current endpoint', () => {
  const claude = JSON.parse(bridgeConfig({ agent: 'claude-code', ...input }));
  assert.deepEqual(claude, { mcpServers: { axiosozo: { type: 'stdio', command: NODE,
    args: [BRIDGE, '--agent', 'claude-code', '--socket', SOCKET], env: { AXIOSOZO_AGENT_SOCKET: SOCKET } } } });
  const codex = bridgeConfig({ agent: 'codex', ...input });
  const lines = codex.trimEnd().split('\n');
  assert.equal(lines[0], '[mcp_servers.axiosozo]');
  assert.equal(JSON.parse(lines[1].slice('command = '.length)), NODE);
  assert.deepEqual(JSON.parse(lines[2].slice('args = '.length)), [BRIDGE, '--agent', 'codex', '--socket', SOCKET]);
  assert.equal(JSON.parse(/^env = \{ AXIOSOZO_AGENT_SOCKET = (.+) \}$/u.exec(lines[3])[1]), SOCKET);
  assert.equal(lines[4], 'tool_timeout_sec = 90');
  const env = { AXIOSOZO_AGENT_SOCKET: SOCKET };
  assert.equal(resolveSocketPath(env, '/wrong-home'), SOCKET);
});

test('socket binding is mandatory: missing/invalid paths never fall back to home defaults', () => {
  for (const value of [undefined, null, '', '/', 'relative', '/a/', '/a//s', '/a/./s', '/a/../s',
    '/a\ns', '/a\rs', '/a\0s', '/a\u007fs', '/a\u0080s', '/a\u009fs', '/a\ud800s', '/a\udc00s']) {
    assert.throws(() => hookConfig({ agent: 'codex', notifyPath: NOTIFY, socketPath: value }), invalid('$.socketPath'));
    assert.throws(() => bridgeConfig({ agent: 'claude-code', ...input, socketPath: value }), invalid('$.socketPath'));
  }
});

test('socket paths are measured by UTF-8 bytes, with exact 100-byte boundary and Unicode roundtrip', () => {
  const boundary = '/' + 'é'.repeat(49) + 's';
  assert.equal(new TextEncoder().encode(boundary).length, 100);
  assert.equal(validateBoundSocketPath(boundary), boundary);
  assert.equal(codexNotify(hookConfig({ agent: 'codex', ...input, socketPath: boundary }))[1], `AXIOSOZO_AGENT_SOCKET=${boundary}`);
  assert.throws(() => validateBoundSocketPath(boundary + 'x'), invalid('$.socketPath'));
  assert.throws(() => validateBoundSocketPath('/' + 'é'.repeat(50)), invalid('$.socketPath'));
  assert.equal(validateBoundSocketPath('/profile/🐈/.a/s'), '/profile/🐈/.a/s');
});

test('Claude provider placeholder syntax cannot silently rewrite socket or executable paths', () => {
  for (const key of ['socketPath', 'notifyPath', 'nodePath', 'bridgePath']) {
    const path = `/a/\${CLAUDE_PROJECT_DIR}/${key}`;
    if (key === 'socketPath' || key === 'notifyPath') {
      assert.throws(() => hookConfig({ agent: 'claude-code', ...input, [key]: path }), invalid(`$.${key}`));
    }
    if (key !== 'notifyPath') {
      assert.throws(() => bridgeConfig({ agent: 'codex', ...input, [key]: path }), invalid(`$.${key}`));
    }
  }
  for (const placeholder of ['${CLAUDE_PLUGIN_ROOT}', '${CLAUDE_PLUGIN_DATA}', '${user_config.any}', '${unknown}']) {
    assert.throws(() => validateBoundSocketPath(`/a/${placeholder}/s`), invalid('$.socketPath'));
  }
});

test('trusted script/node/bridge paths require lexical canonicality and no controls/unpaired surrogates', () => {
  for (const path of ['relative', '/', '/a/', '/a//b', '/a/../b', '/a/./b', '/a\nb', '/a\ud800b', '/a\u0080b', '/' + 'x'.repeat(4096)]) {
    assert.throws(() => hookConfig({ agent: 'codex', ...input, notifyPath: path }), invalid('$.notifyPath'));
    assert.throws(() => bridgeConfig({ agent: 'codex', ...input, nodePath: path }), invalid('$.nodePath'));
    assert.throws(() => bridgeConfig({ agent: 'claude-code', ...input, bridgePath: path }), invalid('$.bridgePath'));
  }
});

test('pure invocation records are deeply frozen and event/agent allowlists are narrow', () => {
  const hook = hookInvocation({ agent: 'claude-code', event: 'Stop', ...input });
  const bridge = bridgeInvocation({ agent: 'codex', ...input });
  assert(Object.isFrozen(hook)); assert(Object.isFrozen(hook.args));
  assert(Object.isFrozen(bridge)); assert(Object.isFrozen(bridge.args)); assert(Object.isFrozen(bridge.env));
  for (const agent of ['other', 'cursor', undefined, null]) {
    assert.throws(() => hookConfig({ agent, ...input }), invalid('$.agent'));
    assert.throws(() => bridgeConfig({ agent, ...input }), invalid('$.agent'));
  }
  for (const event of ['SubagentStop', 'SessionStart', 'StopFailure', 'Stop;touch', undefined]) {
    assert.throws(() => hookInvocation({ agent: 'claude-code', event, ...input }), invalid('$.event'));
  }
  assert.throws(() => hookInvocation({ agent: 'codex', event: 'Stop', ...input }), invalid('$.event'));
});

test('fresh invocation for a changed endpoint has no cached or default socket binding', () => {
  const newer = SOCKET.replace('p4c-test', 'p4c-new');
  const first = hookConfig({ agent: 'codex', ...input });
  const second = hookConfig({ agent: 'codex', ...input, socketPath: newer });
  assert.equal(codexNotify(first)[1], `AXIOSOZO_AGENT_SOCKET=${SOCKET}`);
  assert.equal(codexNotify(second)[1], `AXIOSOZO_AGENT_SOCKET=${newer}`);
  assert(!second.includes('.axiosozo/run'));
  assert.equal(bridgeInvocation({ agent: 'claude-code', ...input, socketPath: newer }).args.at(-1), newer);
});
