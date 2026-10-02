import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { providerBuildRoot } from '../src/storage.mjs';
import { MacKeychain } from '../src/keychain.mjs';

function artifact(name) {
  assert.equal(process.platform, 'darwin'); assert.equal(process.arch, 'arm64');
  const base = providerBuildRoot(); const manifest = JSON.parse(readFileSync(path.join(base, 'native-build.json')));
  const binary = path.join(base, name); assert.equal(realpathSync(binary), binary);
  const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
  assert.equal(manifest.artifacts[name].binary_sha256, hash(binary));
  assert.equal(manifest.artifacts[name].source_sha256, hash(fileURLToPath(new URL('../native/keychain.m', import.meta.url))));
  if (name === 'keychain-negative') assert.equal(manifest.artifacts[name].define, 'AXIOSOZO_KEYCHAIN_NEGATIVE_TEST=1');
  return binary;
}
function run(name, operation, input = '', extra = []) {
  const result = spawnSync(artifact(name), [operation, ...extra], { shell: false, input, timeout: 5000,
    env: { PATH: '/usr/bin:/bin', LANG: 'C' }, encoding: 'utf8', maxBuffer: 8192 });
  assert.equal(result.error, undefined); assert.equal(result.signal, null); assert.equal(result.stdout, '');
  assert.throws(() => process.kill(result.pid, 0), { code: 'ESRCH' });
  return result;
}

test('Production helper rejects malformed inputs before any SecItem operation', t => {
  for (const input of ['', 'short', 'synthetic\nkey', 'synthetic\rkey', 'synthetic\0key', 'x'.repeat(4097)]) {
    const result = run('keychain', 'store', input); assert.equal(result.status, 2); assert.equal(result.stderr, '');
  }
  const unknown = run('keychain', 'invalid-operation'); assert.equal(unknown.status, 1); assert.equal(unknown.stderr, '');
  t.diagnostic('TEST_FIXTURE: six invalid store inputs and unknown operation; no credentials or SecItem call');
});

test('Actual Keychain query with an empty search list returns missing without output', t => {
  const result = run('keychain-negative', 'read'); assert.equal(result.status, 44, result.stderr);
  assert.match(result.stderr, /TEST_FIXTURE keychain_status=-25300 search_list=empty/);
  t.diagnostic(result.stderr.trim());
});

test('Presence check with an empty search list reports missing without any output', t => {
  const result = run('keychain-negative', 'exists'); assert.equal(result.status, 44, result.stderr);
  assert.match(result.stderr, /TEST_FIXTURE keychain_status=-25300 search_list=empty/);
  t.diagnostic(result.stderr.trim());
});

test('Actual malformed Keychain query returns errSecParam without fallback', t => {
  const result = run('keychain-negative', 'invalid-query'); assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /TEST_FIXTURE keychain_status=-50 search_list=empty/);
  t.diagnostic(result.stderr.trim());
});

test('Negative Keychain build cannot store or delete any item', () => {
  assert.equal(run('keychain-negative', 'store', 'synthetic-nonsecret-input').status, 2);
  assert.equal(run('keychain-negative', 'remove').status, 2);
});

test('Production JS adapter handles native missing/error results without a plaintext fallback', async () => {
  const keychain = new MacKeychain(artifact('keychain-negative'));
  assert.equal(await keychain.read(), null);
  assert.equal(await keychain.exists(), false);
  await assert.rejects(keychain.store('synthetic-nonsecret-input'), { code: 'KEYCHAIN_ERROR' });
  await assert.rejects(keychain.remove(), { code: 'KEYCHAIN_ERROR' });
});

test('Provider selector: only jev/openai are accepted, before any SecItem call; OpenAI presence is its own item', t => {
  for (const extra of [['anthropic'], ['openai', 'extra'], ['']]) {
    const result = run('keychain', 'exists', '', extra); assert.equal(result.status, 2); assert.equal(result.stderr, '');
  }
  for (const provider of ['jev', 'openai']) {
    const invalid = run('keychain', 'store', 'short', [provider]); assert.equal(invalid.status, 2); assert.equal(invalid.stderr, '');
  }
  const openai = run('keychain-negative', 'exists', '', ['openai']); assert.equal(openai.status, 44, openai.stderr);
  assert.match(openai.stderr, /TEST_FIXTURE keychain_status=-25300 search_list=empty/);
  const read = run('keychain-negative', 'read', '', ['openai']); assert.equal(read.status, 44, read.stderr);
  t.diagnostic('TEST_FIXTURE: selector rejected without SecItem; OpenAI item missing in an empty search list');
});

test('Production JS adapter for the OpenAI item handles missing/error results without a plaintext fallback', async () => {
  const keychain = new MacKeychain(artifact('keychain-negative'), 'openai');
  assert.equal(await keychain.read(), null);
  assert.equal(await keychain.exists(), false);
  await assert.rejects(keychain.store('synthetic-nonsecret-input'), { code: 'KEYCHAIN_ERROR' });
  await assert.rejects(keychain.remove(), { code: 'KEYCHAIN_ERROR' });
});
