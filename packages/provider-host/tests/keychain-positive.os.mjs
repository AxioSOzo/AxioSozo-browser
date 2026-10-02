import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, existsSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { providerBuildRoot } from '../src/storage.mjs';

function fixtureBuild() {
  assert.equal(process.platform, 'darwin'); assert.equal(process.arch, 'arm64');
  const base = providerBuildRoot(); const binary = path.join(base, 'keychain-positive');
  const manifest = JSON.parse(readFileSync(path.join(base, 'keychain-positive-build.json')));
  const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
  assert.equal(manifest.version, 1); assert.equal(manifest.fixture_only, true); assert.equal(realpathSync(binary), binary);
  assert.equal(manifest.binary_sha256, hash(binary));
  assert.equal(manifest.source_sha256, hash(fileURLToPath(new URL('../native/keychain-positive.m', import.meta.url))));
  return { base, binary, manifest };
}

function spawnFixture(binary, args, temporary) {
  const result = spawnSync(binary, args, { shell: false, timeout: 10000, killSignal: 'SIGKILL', maxBuffer: 32768,
    env: { PATH: '/usr/bin:/bin', LANG: 'C', TMPDIR: `${temporary}/` }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const diagnostic = `Native status ${result.status}; signal=${result.signal}; stderr=${result.stderr}`;
  assert.equal(result.error, undefined, diagnostic); assert.equal(result.signal, null, diagnostic);
  assert.throws(() => process.kill(result.pid, 0), { code: 'ESRCH' });
  return { result, diagnostic };
}

function fixtureRuns(base) {
  const runs = path.join(base, 'keychain-runs'); mkdirSync(runs, { recursive: true, mode: 0o700 });
  assert.equal(realpathSync(runs), runs);
  return runs;
}

test('Native fixture path policy accepts only volume-root or one nonreserved named build root', () => {
  const { base, binary } = fixtureBuild();
  const volume = '/Volumes/AxioSozoBuild';
  const fixture = 'providers/keychain-runs/positive-A1b2C3';
  const valid = [`${volume}/${fixture}`, `${volume}/workstation/${fixture}`,
    `${volume}/0/${fixture}`, `${volume}/${'a'.repeat(40)}/${fixture}`];
  const reserved = ['zen', 'toolchains', 'cargo-home', 'cargo-target', 'caches', 'runtime', 'tmp',
    'cef', 'providers', 'logs', 'release', 'diag', 'diagnostics', 'gui-fixtures'];
  const invalid = [
    `${volume}-spoof/${fixture}`, `${volume}/workstation-spoof/../workstation/${fixture}`,
    `${volume}/workstation/nested/${fixture}`, `${volume}/./${fixture}`, `${volume}//${fixture}`,
    `${volume}/../AxioSozoBuild/${fixture}`, `Volumes/AxioSozoBuild/${fixture}`,
    `${volume}/Workstation/${fixture}`, `${volume}/work_station/${fixture}`, `${volume}/-workstation/${fixture}`,
    `${volume}/${'a'.repeat(41)}/${fixture}`, `${volume}/workstation/providers/keychain-runs/positive-`,
    `${volume}/${fixture}/child`, `${volume}/${fixture}/`, `${volume}/${fixture}.keychain`,
    `${volume}/workstation/providers/keychain-runs/positive-${'a'.repeat(65)}`,
    ...reserved.map(name => `${volume}/${name}/${fixture}`),
  ];
  for (const directory of valid) {
    const { result, diagnostic } = spawnFixture(binary, ['--validate-path', directory], base);
    assert.equal(result.status, 0, `${directory}: ${diagnostic}`);
    assert.equal(result.stdout, ''); assert.equal(result.stderr, '');
  }
  for (const directory of invalid) {
    const { result, diagnostic } = spawnFixture(binary, ['--validate-path', directory], base);
    assert.equal(result.status, 64, `${directory}: ${diagnostic}`);
    assert.equal(result.stdout, ''); assert.match(result.stderr, /TEST_FIXTURE: rejected/);
  }
});

test('Native fixture rejects symlinks, nonprivate permissions, nonexistent paths and existing keychain entries before Keychain APIs', () => {
  const { base, binary } = fixtureBuild(); const runs = fixtureRuns(base);
  const directory = mkdtempSync(path.join(runs, 'positive-'));
  const link = `${directory}Alias`; const dangling = `${directory}Dangling`;
  const invoke = (args, status) => {
    const { result, diagnostic } = spawnFixture(binary, args, directory);
    assert.equal(result.status, status, diagnostic); assert.equal(result.stdout, '');
    if (status) assert.match(result.stderr, /TEST_FIXTURE: rejected/);
    else assert.equal(result.stderr, '');
  };
  try {
    invoke(['--validate-directory', directory], 0);
    symlinkSync(directory, link); invoke(['--validate-directory', link], 64); invoke([link], 64);
    symlinkSync(`${directory}Missing`, dangling); invoke(['--validate-directory', dangling], 64);
    invoke(['--validate-directory', `${directory}Missing`], 64);
    invoke(['--validate-directory', `${runs}/../keychain-runs/${path.basename(directory)}`], 64);
    chmodSync(directory, 0o755); invoke(['--validate-directory', directory], 64); invoke([directory], 64);
    chmodSync(directory, 0o700);
    const collision = path.join(directory, 'axiosozo-synthetic.keychain');
    writeFileSync(collision, 'synthetic fixture collision', { mode: 0o600 }); invoke([directory], 64);
    rmSync(collision); symlinkSync(path.join(directory, 'nonexistent'), collision); invoke([directory], 64);
    rmSync(collision); invoke(['--validate-directory', directory], 0);
  } finally {
    rmSync(link, { force: true }); rmSync(dangling, { force: true });
    rmSync(directory, { recursive: true, force: true });
  }
});

test('Synthetic Keychain add/read/replace/delete is scoped to one new private T9 keychain', t => {
  const { base, binary, manifest } = fixtureBuild(); const runs = fixtureRuns(base);
  const directory = mkdtempSync(path.join(runs, 'positive-'));
  assert.equal(realpathSync(directory), directory); assert.equal(statSync(directory).mode & 0o077, 0);
  let record;
  try {
    const { result, diagnostic } = spawnFixture(binary, [directory], directory);
    t.diagnostic(diagnostic);
    assert.notEqual(result.stdout.trim(), '', `${diagnostic}; missing native JSON report`);
    try { record = JSON.parse(result.stdout); }
    catch { assert.fail(`${diagnostic}; malformed native JSON report`); }
    t.diagnostic(JSON.stringify({ ...record, binary_sha256: manifest.binary_sha256, source_sha256: manifest.source_sha256 }));
    assert.equal(result.status, 0, `${diagnostic}; ${JSON.stringify(record)}`);
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
