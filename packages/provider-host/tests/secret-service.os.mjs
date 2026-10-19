// Linux Secret Service helper (native/secret-service.c). TEST FIXTURES ONLY: synthetic
// keys, an unreachable bus, and a private D-Bus session with its own gnome-keyring in a
// temporary HOME. The user's session bus and keyrings are never contacted.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { providerBuildRoot } from '../src/storage.mjs';
import { MacKeychain, SecretServiceKeychain, platformKeychain } from '../src/keychain.mjs';

const NO_BUS = 'unix:path=/nonexistent/axiosozo-no-session-bus';
const which = name => spawnSync('/bin/sh', ['-c', `command -v ${name}`], { encoding: 'utf8' }).status === 0;

function artifact(name) {
  assert.equal(process.platform, 'linux');
  const base = providerBuildRoot(); const manifest = JSON.parse(readFileSync(path.join(base, 'native-build.json')));
  const binary = path.join(base, name); assert.equal(realpathSync(binary), binary);
  const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
  assert.equal(manifest.policy, 'linux-secret-service-no-provider-sandbox-v1');
  assert.equal(manifest.artifacts[name].binary_sha256, hash(binary));
  assert.equal(manifest.artifacts[name].source_sha256, hash(fileURLToPath(new URL('../native/secret-service.c', import.meta.url))));
  return binary;
}
function run(name, operation, input = '', extra = []) {
  const result = spawnSync(artifact(name), [operation, ...extra], { shell: false, input, timeout: 10000,
    env: { PATH: '/usr/bin:/bin', LANG: 'C', DBUS_SESSION_BUS_ADDRESS: NO_BUS }, encoding: 'utf8', maxBuffer: 8192 });
  assert.equal(result.error, undefined); assert.equal(result.signal, null); assert.equal(result.stdout, '');
  return result;
}

test('Helper rejects malformed input and selectors before any Secret Service call', t => {
  for (const input of ['', 'short', 'synthetic\nkey', 'synthetic\rkey', 'synthetic\0key', 'x'.repeat(4097)]) {
    const result = run('keychain', 'store', input); assert.equal(result.status, 2); assert.equal(result.stderr, '');
  }
  assert.equal(run('keychain', 'invalid-operation').status, 1);
  for (const extra of [['anthropic'], ['openai', 'extra'], ['']]) assert.equal(run('keychain', 'exists', '', extra).status, 2);
  t.diagnostic('TEST_FIXTURE: invalid inputs and selectors refused without a bus');
});

test('No Secret Service: every operation fails closed (exit 1), nothing on stdout, no fallback', t => {
  for (const [operation, input] of [['read', ''], ['exists', ''], ['store', 'synthetic-nonsecret-input'], ['remove', '']]) {
    for (const extra of [[], ['openai']]) assert.equal(run('keychain', operation, input, extra).status, 1, `${operation} ${extra}`);
  }
  t.diagnostic('TEST_FIXTURE: unreachable session bus refused for read/exists/store/remove (jev, openai)');
});

test('Negative fixture build never mutates and reports an unavailable service', () => {
  assert.equal(run('keychain-negative', 'store', 'synthetic-nonsecret-input').status, 2);
  assert.equal(run('keychain-negative', 'remove').status, 2);
  const read = run('keychain-negative', 'read'); assert.equal(read.status, 1);
  assert.match(read.stderr, /TEST_FIXTURE secret_service=unavailable/);
});

test('JS adapter: an unavailable Secret Service is KEYCHAIN_ERROR, never null or a plaintext fallback', async () => {
  const saved = process.env.DBUS_SESSION_BUS_ADDRESS; process.env.DBUS_SESSION_BUS_ADDRESS = NO_BUS;
  try {
    const store = platformKeychain(artifact('keychain'));
    assert.ok(store instanceof SecretServiceKeychain);
    assert.deepEqual(SecretServiceKeychain.environment(), { PATH: '/usr/bin:/bin', DBUS_SESSION_BUS_ADDRESS: NO_BUS,
      ...(process.env.XDG_RUNTIME_DIR ? { XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR } : {}) });
    await assert.rejects(store.read(), { code: 'KEYCHAIN_ERROR' });
    await assert.rejects(store.exists(), { code: 'KEYCHAIN_ERROR' });
    await assert.rejects(store.store('synthetic-nonsecret-input'), { code: 'KEYCHAIN_ERROR' });
    await assert.rejects(store.remove(), { code: 'KEYCHAIN_ERROR' });
    // async wrapper: MacKeychain refuses synchronously off macOS.
    await assert.rejects(async () => new MacKeychain(artifact('keychain')).read(), { code: 'BLOCKED_ENV' });
  } finally {
    if (saved === undefined) delete process.env.DBUS_SESSION_BUS_ADDRESS; else process.env.DBUS_SESSION_BUS_ADDRESS = saved;
  }
});

const roundTripTools = ['dbus-run-session', 'gnome-keyring-daemon'].filter(name => !which(name));
test('Private Secret Service round trip (own bus, own keyring, synthetic keys)', { skip: roundTripTools.length ? `missing ${roundTripTools.join(', ')}` : false }, t => {
  const base = path.join(providerBuildRoot(), 'secret-service-runs'); mkdirSync(base, { recursive: true, mode: 0o700 });
  const root = mkdtempSync(path.join(base, 'axiosozo-secret-'));
  try {
    const dirs = {};
    for (const name of ['home', 'run', 'data', 'config']) { dirs[name] = path.join(root, name); mkdirSync(dirs[name], { mode: 0o700 }); }
    const fixture = fileURLToPath(new URL('../fixtures/secret-service-session.mjs', import.meta.url));
    const result = spawnSync('dbus-run-session', ['--', process.execPath, fixture, artifact('keychain'), artifact('keychain-negative')], {
      env: { PATH: '/usr/bin:/bin', LANG: 'C', HOME: dirs.home, XDG_RUNTIME_DIR: dirs.run, XDG_DATA_HOME: dirs.data, XDG_CONFIG_HOME: dirs.config },
      encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, 0, result.stderr);
    const record = JSON.parse(result.stdout.trim().split('\n').pop());
    t.diagnostic(JSON.stringify(record));
    assert.deepEqual(record.steps, { exists_before: 44, read_before: 44, store: 0, exists_after: 0, read_after: 0,
      openai_exists: 44, openai_store: 0, openai_read_matches: true, negative_read: 44, remove: 0, read_removed: 44,
      remove_again: 44, openai_remove: 0 });
    assert.equal(record.read_matches, true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
