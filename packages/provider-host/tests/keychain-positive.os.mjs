import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { providerBuildRoot } from '../src/storage.mjs';

test('Synthetic Keychain add/read/replace/delete is scoped to one new private T9 keychain', t => {
  assert.equal(process.platform, 'darwin'); assert.equal(process.arch, 'arm64');
  const base = providerBuildRoot(); const binary = path.join(base, 'keychain-positive');
  const manifest = JSON.parse(readFileSync(path.join(base, 'keychain-positive-build.json')));
  const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
  assert.equal(manifest.version, 1); assert.equal(manifest.fixture_only, true); assert.equal(realpathSync(binary), binary);
  assert.equal(manifest.binary_sha256, hash(binary));
  assert.equal(manifest.source_sha256, hash(fileURLToPath(new URL('../native/keychain-positive.m', import.meta.url))));
  const runs = path.join(base, 'keychain-runs'); mkdirSync(runs, { recursive: true, mode: 0o700 });
  const directory = mkdtempSync(path.join(runs, 'positive-'));
  assert.equal(realpathSync(directory), directory); assert.equal(statSync(directory).mode & 0o077, 0);
  let record;
  try {
    const result = spawnSync(binary, [directory], { shell: false, timeout: 10000, killSignal: 'SIGKILL', maxBuffer: 32768,
      env: { PATH: '/usr/bin:/bin', LANG: 'C', TMPDIR: `${directory}/` }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    assert.equal(result.error, undefined); assert.equal(result.signal, null);
    assert.throws(() => process.kill(result.pid, 0), { code: 'ESRCH' });
    record = JSON.parse(result.stdout); t.diagnostic(JSON.stringify({ ...record, binary_sha256: manifest.binary_sha256, source_sha256: manifest.source_sha256 }));
    assert.equal(result.status, 0, `Native status ${result.status}: ${JSON.stringify(record)}; stderr=${result.stderr}`);
    assert.equal(record.label, 'TEST_FIXTURE'); assert.equal(record.status, 'PASS');
    // Security.framework Boolean is UInt8; NSNumber serializes its exact false value as 0.
    assert.equal(record.interaction_allowed, 0); assert.equal(record.default_keychain_apis_called, false);
    assert.equal(record.search_list_mutation_apis_called, false); assert.equal(record.key_data_logged, false); assert.equal(record.network_used, false);
    assert.equal(record.first_read_matches, true); assert.equal(record.replacement_read_matches, true);
    assert.deepEqual(record.steps.map(step => [step.operation, step.status]), [
      ['disable_interaction', 0], ['read_process_interaction_setting', 0], ['create_private_keychain', 0],
      ['update_absent_scoped_item', -25300], ['add_scoped_item', 0], ['read_scoped_item', 0],
      ['replace_scoped_item', 0], ['read_replaced_scoped_item', 0], ['delete_scoped_item', 0],
      ['verify_scoped_item_absent', -25300], ['lock_private_keychain', 0],
    ]);
  } finally {
    // Never SecKeychainDelete or search-list mutation; only this fresh directory.
    rmSync(directory, { recursive: true, force: true });
    assert.equal(existsSync(directory), false); t.diagnostic('TEST_FIXTURE: fresh private keychain directory removed after native child exit');
  }
});
