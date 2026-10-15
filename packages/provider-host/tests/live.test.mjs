import test from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, mkdirSync, realpathSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { claudeArguments, codexArguments, codexExecArguments, liveMetadata, liveProfile, runtimeEnvironment, resolveClient,
  resolveNativeClient, CODEX_HOME_DENIED, CODEX_DISABLED_FEATURES } from '../src/live.mjs';
import * as live from '../src/live.mjs';
import { parseReportedVersion } from '../src/launch.mjs';

test('No version pin is exported or consulted: acceptance is the capability check', () => {
  assert.equal(live.LIVE_VERSIONS, undefined);
  assert.deepEqual(Object.keys(live.LIVE_ROUTES), ['codex', 'claude-code']);
  assert.equal(live.LIVE_ROUTES.codex.protocol, 'codex-exec-jsonl');
});

test('Live client environment never forwards inherited credentials, endpoints or loader hooks', () => {
  const env = runtimeEnvironment('claude-code', { runDirectory: '/synthetic/runtime', officialHome: '/Users/synthetic' });
  for (const key of ['NODE_OPTIONS', 'DYLD_INSERT_LIBRARIES', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_BASE_URL', 'CLAUDE_CODE_OAUTH_TOKEN', 'CODEX_HOME']) assert.equal(env[key], undefined);
  assert.equal(env.HOME, '/Users/synthetic'); assert.equal(env.ENABLE_CLAUDEAI_MCP_SERVERS, 'false');
  assert.equal(env.CLAUDE_CODE_TMPDIR, '/synthetic/runtime/tmp');
  const codex = runtimeEnvironment('codex', { runDirectory: '/synthetic/runtime', codexHome: '/Users/synthetic/.codex', officialHome: '/Users/synthetic' });
  assert.equal(codex.CODEX_HOME, '/Users/synthetic/.codex');
  for (const key of ['OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL', 'NODE_OPTIONS']) assert.equal(codex[key], undefined);
});

test('Claude profile: Keychain path for the official client only, no shells, no personal directories', () => {
  const profile = liveProfile({ executable: '/synthetic/provider', runDirectory: '/synthetic/runtime', officialHome: '/Users/synthetic' });
  assert(profile.includes('(allow process-fork)'));
  assert(profile.includes('(literal "/usr/bin/security")'));
  assert(profile.includes('(global-name "com.apple.SecurityServer")'));
  assert(profile.includes('(global-name "com.apple.securityd.xpc")'));
  // Deliberate (9 Oct 2026): the official client's own Keychain sign-in needs the login
  // Keychain database file readable by /usr/bin/security inside the sandbox. Only that
  // literal file; never the Keychains directory or security preferences.
  assert(profile.includes('(literal "/Users/synthetic/Library/Keychains/login.keychain-db")'));
  assert(!profile.includes('(subpath "/Users/synthetic/Library/Keychains")'));
  assert(!profile.includes('com.apple.security.plist'));
  assert(profile.includes('(literal "/synthetic/provider")'));
  assert(profile.includes('(literal "/Users/synthetic/.claude/.credentials.json")'));
  assert(!profile.includes('(subpath "/Users/synthetic")'));
  assert(!profile.includes('"/bin/sh"') && !profile.includes('"/bin/zsh"'));
  assert(profile.includes('(allow network-outbound)') && profile.includes('com.apple.dnssd.service'));
  assert.throws(() => liveProfile({ executable: '/synthetic/provider\n(allow default)', runDirectory: '/synthetic/runtime' }), { code: 'INVALID_INPUT' });
  assert.throws(() => liveProfile({ executable: '/synthetic/provider', runDirectory: '/synthetic/runtime', network: 'everything' }), { code: 'INVALID_INPUT' });
});

test('Codex profile: own CODEX_HOME minus every customization file, no fork, no Keychain helper', () => {
  const profile = liveProfile({ executable: '/synthetic/codex', runDirectory: '/synthetic/runtime', codexHome: '/Users/synthetic/.codex' });
  assert(profile.includes('(deny process-fork)'));
  assert(!profile.includes('/usr/bin/security') && !profile.includes('securityd.xpc') && !profile.includes('login.keychain-db'));
  assert(profile.includes('(subpath "/Users/synthetic/.codex")'));
  for (const name of ['AGENTS.md', 'config.toml', 'hooks.json', 'skills', 'plugins', 'rules']) {
    assert(CODEX_HOME_DENIED.includes(name), name);
    assert(profile.includes(`(subpath "/Users/synthetic/.codex/${name}")`), name);
  }
  // The deny rule must follow the allow rule (the later rule wins in the seatbelt language).
  assert(profile.indexOf('(deny file-read-data file-write*') > profile.indexOf('(subpath "/Users/synthetic/.codex")'));
  assert(profile.includes('(global-name "com.apple.SecurityServer")'), 'TLS trust evaluation on the conversation');
  const offline = liveProfile({ executable: '/synthetic/codex', runDirectory: '/synthetic/runtime', codexHome: '/h', network: 'loopback' });
  assert(offline.includes('(allow network-outbound (remote ip "localhost:*"))') && !offline.includes('(allow network-outbound)\n'));
  assert(!offline.includes('dnssd') && !offline.includes('SecurityServer'));
  const none = liveProfile({ executable: '/synthetic/codex', runDirectory: '/synthetic/runtime', network: false });
  assert(!none.includes('network-outbound'));
});

test('Production argv disables ambient integrations without permission bypass flags', () => {
  const claude = claudeArguments();
  assert(claude.includes('--safe-mode') && claude.includes('--restricted') && claude.includes('--strict-mcp-config'));
  assert.equal(claude[claude.indexOf('--tools') + 1], '');
  assert(!claude.some(value => value.includes('dangerously')));
  const codex = codexExecArguments({ runDirectory: '/synthetic/run' });
  assert.deepEqual(codex.slice(0, 2), ['exec', '--json']);
  for (const flag of ['--ephemeral', '--ignore-user-config', '--ignore-rules', '--strict-config', '--skip-git-repo-check']) assert(codex.includes(flag), flag);
  assert.equal(codex[codex.indexOf('--sandbox') + 1], 'read-only');
  assert.equal(codex.at(-1), '-', 'prompt only on stdin');
  for (const feature of ['hooks', 'shell_tool', 'unified_exec', 'plugins', 'apps', 'unbounded_connection_retries']) {
    assert(CODEX_DISABLED_FEATURES.includes(feature)); assert(codex.includes(`features.${feature}=false`), feature);
  }
  assert(codex.includes('model_instructions_file="/synthetic/run/instructions.md"'));
  assert(codex.includes('mcp_servers={}') && codex.includes('project_doc_max_bytes=0'));
  assert(!codex.some(value => /dangerously|danger-full-access|-m$|--model/.test(value)), 'no bypass flags and no pinned model');
  assert(!codex.includes('app-server'));
  assert.deepEqual(codexArguments('/synthetic/run'), codex);
  // A key the installed Codex no longer knows can be dropped; extra args go before stdin.
  const dropped = codexExecArguments({ runDirectory: '/r', dropped: ['features.goals'], extra: ['-c', 'x=1'] });
  assert(!dropped.includes('features.goals=false')); assert.deepEqual(dropped.slice(-3), ['-c', 'x=1', '-']);
});

test('Reported versions are parsed from bounded --version output of any client', () => {
  assert.equal(parseReportedVersion('codex-cli 0.162.0\n'), '0.162.0');
  assert.equal(parseReportedVersion('2.1.295 (Claude Code)'), '2.1.295');
  assert.equal(parseReportedVersion('1.3.2'), '1.3.2');
  assert.equal(parseReportedVersion('codex-cli 0.163.0-alpha.2'), '0.163.0-alpha.2');
  assert.equal(parseReportedVersion('no version here'), null);
  assert.equal(parseReportedVersion(`${'x'.repeat(300)} 1.0.0`), null);
});

test('Missing clients and Antigravity fail before launch', () => {
  assert.throws(() => liveMetadata('codex', { searchPath: '' }), { code: 'BLOCKED_ENV' });
  assert.throws(() => liveMetadata('claude-code', { searchPath: '' }), { code: 'BLOCKED_ENV' });
  assert.throws(() => liveMetadata('antigravity', { searchPath: '' }), { code: 'ANTIGRAVITY_PROTOCOL_UNSUPPORTED' });
  assert.deepEqual(resolveClient('codex', { searchPath: '' }), { driver: 'codex', installed: false, metadata_version: null });
});

// Installation metadata only. The fixture executables are never launched.
test('Any Codex version resolves to its native executable (npm layout or direct binary); unsafe installs are refused', () => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'codex-live-metadata-')));
  try {
    const pkgRoot = path.join(root, 'node_modules/@openai/codex');
    const searchPath = path.join(root, 'bin');
    const nativeRoot = path.join(pkgRoot, `node_modules/@openai/codex-darwin-${process.arch}`);
    const triple = process.arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
    const executable = path.join(nativeRoot, 'vendor', triple, 'bin/codex');
    for (const directory of [path.join(pkgRoot, 'bin'), searchPath, path.dirname(executable)]) mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(pkgRoot, 'bin/codex.js'), '// metadata-only fixture, never executed', { mode: 0o700 });
    writeFileSync(executable, 'metadata-only native fixture, never executed', { mode: 0o700 });
    symlinkSync(path.join(pkgRoot, 'bin/codex.js'), path.join(searchPath, 'codex'));
    const wrapperVersion = version => writeFileSync(path.join(pkgRoot, 'package.json'), JSON.stringify({ name: '@openai/codex', version }));
    const nativeVersion = version => writeFileSync(path.join(nativeRoot, 'package.json'), JSON.stringify({ name: '@openai/codex', version: `${version}-darwin-${process.arch}` }));
    for (const version of ['0.160.0', '0.162.0', '0.163.0-alpha.2', '1.0.0']) {
      wrapperVersion(version); nativeVersion(version);
      const resolved = resolveClient('codex', { searchPath });
      assert.equal(resolved.installed, true); assert.equal(resolved.executable, executable); assert.equal(resolved.metadata_version, version);
      assert.deepEqual(Object.keys(resolved.fingerprint), ['path', 'dev', 'ino', 'size', 'mtime_ms']);
      assert.equal(resolveNativeClient('codex', liveMetadata('codex', { searchPath })), executable);
    }
    writeFileSync(path.join(nativeRoot, 'package.json'), JSON.stringify({ name: 'not-codex', version: '1.0.0-darwin-arm64' }));
    assert.throws(() => resolveClient('codex', { searchPath }), { code: 'BLOCKED_ENV' });
    nativeVersion('1.0.0'); chmodSync(executable, 0o777);
    assert.throws(() => resolveClient('codex', { searchPath }), { code: 'BLOCKED_ENV' }, 'writable by others');
    // A standalone native install (not the npm wrapper) is used as is.
    const direct = path.join(root, 'direct'); mkdirSync(direct);
    writeFileSync(path.join(direct, 'codex'), 'metadata-only fixture, never executed', { mode: 0o700 });
    assert.equal(resolveClient('codex', { searchPath: direct }).executable, path.join(direct, 'codex'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
