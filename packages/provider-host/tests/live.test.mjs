import test from 'node:test';
import assert from 'node:assert/strict';
import { codexRequest } from '../src/adapters.mjs';
import { claudeArguments, codexArguments, liveMetadata, liveProfile, runtimeEnvironment } from '../src/live.mjs';

test('Current exact Codex schema admits scoped chat and rejects environment grants', () => {
  const params = { ephemeral: true, approvalPolicy: 'never', sandbox: 'read-only', cwd: '/synthetic/workspace', environments: [], dynamicTools: [] };
  assert.equal(codexRequest('thread/start', params, { current: true }).method, 'thread/start');
  for (const altered of [{ ...params, environments: [{ type: 'local', cwd: '/' }] }, { ...params, dynamicTools: [{ name: 'shell' }] }, { ...params, additionalAuthority: true }]) {
    assert.throws(() => codexRequest('thread/start', altered, { current: true }), { code: 'INVALID_PROTOCOL' });
  }
  assert.equal(codexRequest('account/read', { refreshToken: false }, { current: true }).method, 'account/read');
  assert.equal(codexRequest('initialize', { clientInfo: { name: 'axiosozo', version: '0.1.0' }, capabilities: { experimentalApi: true } }, { current: true }).method, 'initialize');
});

test('Live client environment never forwards inherited credentials, endpoints or loader hooks', () => {
  const env = runtimeEnvironment('claude-code', { runDirectory: '/synthetic/runtime', officialHome: '/Users/synthetic' });
  for (const key of ['NODE_OPTIONS', 'DYLD_INSERT_LIBRARIES', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_BASE_URL', 'CLAUDE_CODE_OAUTH_TOKEN', 'CODEX_HOME']) assert.equal(env[key], undefined);
  assert.equal(env.HOME, '/Users/synthetic'); assert.equal(env.ENABLE_CLAUDEAI_MCP_SERVERS, 'false');
  assert.equal(env.CLAUDE_CODE_TMPDIR, '/synthetic/runtime/tmp');
});

test('Live profiles scope runtime/auth paths and never permit shells or personal profile directories', () => {
  const profile = liveProfile({ executable: '/synthetic/provider', runDirectory: '/synthetic/runtime', officialHome: '/Users/synthetic' });
  assert(profile.includes('(allow process-fork)'));
  assert(profile.includes('(literal "/usr/bin/security")'));
  assert(profile.includes('(global-name "com.apple.SecurityServer")'));
  assert(profile.includes('(global-name "com.apple.securityd.xpc")'));
  assert(!profile.includes('login.keychain-db'));
  assert(!profile.includes('com.apple.security.plist'));
  assert(liveProfile({ executable: '/synthetic/provider', runDirectory: '/synthetic/runtime' }).includes('(deny process-fork)'));
  assert(profile.includes('(literal "/synthetic/provider")'));
  assert(profile.includes('(literal "/Users/synthetic/.claude/.credentials.json")'));
  assert(!profile.includes('(subpath "/Users/synthetic")'));
  assert(!profile.includes('"/bin/sh"'));
  assert.throws(() => liveProfile({ executable: '/synthetic/provider\n(allow default)', runDirectory: '/synthetic/runtime' }), { code: 'INVALID_INPUT' });
});

test('Production argv disables ambient integrations without permission bypass flags', () => {
  const claude = claudeArguments(), codex = codexArguments();
  assert(claude.includes('--safe-mode') && claude.includes('--restricted') && claude.includes('--strict-mcp-config'));
  assert.equal(claude[claude.indexOf('--tools') + 1], '');
  assert(!claude.some(value => value.includes('dangerously')));
  assert(codex.includes('features.hooks=false') && codex.includes('features.shell_tool=false'));
  assert(!codex.some(value => value.includes('danger-full-access')));
});

test('Missing and unsupported live clients fail before launch', () => {
  assert.throws(() => liveMetadata('codex', { searchPath: '' }), { code: 'BLOCKED_ENV' });
  assert.throws(() => liveMetadata('claude-code', { searchPath: '' }), { code: 'BLOCKED_ENV' });
  assert.throws(() => liveMetadata('antigravity', { searchPath: '' }), { code: 'ANTIGRAVITY_PROTOCOL_UNSUPPORTED' });
});
