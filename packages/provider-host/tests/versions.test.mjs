import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, symlinkSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { discover, versionStatus } from '../src/discovery.mjs';
import { livePreflight } from '../src/adapters.mjs';

function fixture(codex, claude) {
  const root = mkdtempSync(fileURLToPath(new URL('../fixtures/version-', import.meta.url)));
  mkdirSync(`${root}/bin`); mkdirSync(`${root}/codex/bin`, { recursive: true }); mkdirSync(`${root}/claude/versions`, { recursive: true });
  const marker = `${root}/CLIENT_WAS_EXECUTED`;
  const malicious = file => { writeFileSync(file, `#!/bin/sh\ntouch '${marker}'\n`); chmodSync(file, 0o700); };
  malicious(`${root}/codex/bin/codex.js`); malicious(`${root}/claude/versions/${claude}`); malicious(`${root}/bin/agy`);
  writeFileSync(`${root}/codex/package.json`, JSON.stringify({ name: '@openai/codex', version: codex }));
  symlinkSync(`${root}/codex/bin/codex.js`, `${root}/bin/codex`); symlinkSync(`${root}/claude/versions/${claude}`, `${root}/bin/claude`);
  return { root, marker, searchPath: `${root}/bin` };
}

test('Exact pinned metadata is not a claim of actual client protocol compatibility', () => {
  const item = fixture('0.155.1', '2.1.278');
  try {
    const providers = discover(item);
    assert.deepEqual(providers.map(provider => provider.version_status), ['PINNED_METADATA_MATCH', 'PINNED_METADATA_MATCH', 'UNTESTED']);
    assert(providers.every(provider => provider.protocol_status === 'UNTESTED' && !provider.capabilities.live_verified));
    for (const driver of ['codex', 'claude-code']) assert.throws(() => livePreflight(driver, { ...item, authorized: true, authenticated: true }), error => error.code === 'BLOCKED_ENV' && error.version_status === 'PINNED_METADATA_MATCH' && /actual-client OS process boundary/.test(error.message));
    assert.equal(existsSync(item.marker), false);
  } finally { rmSync(item.root, { recursive: true }); }
});

test('Overnight metadata updates explicitly mismatch pinned versions without executing a client', () => {
  const item = fixture('0.156.1', '2.1.280');
  try {
    const providers = discover(item);
    assert.deepEqual(providers.map(provider => provider.client_version), ['0.156.1', '2.1.280', null]);
    for (const driver of ['codex', 'claude-code']) {
      const record = providers.find(provider => provider.driver === driver);
      assert.equal(record.version_status, 'VERSION_MISMATCH'); assert(record.blockers.includes('VERSION_MISMATCH'));
      assert.equal(record.protocol_status, 'UNTESTED'); assert.equal(record.auth_status, 'unknown');
      assert.throws(() => livePreflight(driver, item), error => error.code === 'BLOCKED_AUTH' && error.version_status === 'VERSION_MISMATCH');
      assert.throws(() => livePreflight(driver, { ...item, authorized: true, authenticated: true }), error => error.code === 'BLOCKED_ENV' && error.version_status === 'VERSION_MISMATCH' && /has not been audited/.test(error.message));
    }
    assert.equal(existsSync(item.marker), false);
  } finally { rmSync(item.root, { recursive: true }); }
});

test('Unknown, malformed and unpinned client versions stay untested and fail closed', () => {
  const item = fixture('unrecognised', 'not-a-version');
  try {
    const providers = discover(item);
    assert(providers.every(provider => provider.version_status === 'UNTESTED' && provider.blockers.includes('VERSION_UNTESTED')));
    assert(providers.every(provider => provider.version_source === null));
    for (const driver of ['codex', 'claude-code', 'antigravity']) assert.throws(() => livePreflight(driver, { ...item, authorized: true, authenticated: true }), error => error.code === 'BLOCKED_ENV' && error.version_status === 'UNTESTED');
    assert.equal(existsSync(item.marker), false);
  } finally { rmSync(item.root, { recursive: true }); }
});

test('Metadata discovery rejects oversized and redirected package metadata without executing a client', () => {
  const item = fixture('0.155.1', '2.1.278');
  const metadata = `${item.root}/codex/package.json`;
  try {
    writeFileSync(metadata, ' '.repeat(64 * 1024 + 1));
    let codex = discover(item)[0];
    assert.equal(codex.client_version, null);
    assert.equal(codex.version_source, null);
    assert.equal(codex.version_status, 'UNTESTED');

    rmSync(metadata);
    writeFileSync(`${item.root}/redirected.json`, JSON.stringify({ name: '@openai/codex', version: '0.155.1' }));
    symlinkSync(`${item.root}/redirected.json`, metadata);
    codex = discover(item)[0];
    assert.equal(codex.client_version, null);
    assert.equal(codex.version_source, null);
    assert.equal(codex.protocol_status, 'UNTESTED');
    assert.equal(existsSync(item.marker), false);
  } finally { rmSync(item.root, { recursive: true }); }
});

test('Prerelease/build metadata is never silently truncated into an exact version match', () => {
  for (const suffix of ['-beta.1', '+different-build']) {
    const item = fixture(`0.155.1${suffix}`, `2.1.278${suffix}`);
    try {
      const providers = discover(item);
      assert.equal(providers[0].client_version, `0.155.1${suffix}`);
      assert.equal(providers[1].client_version, `2.1.278${suffix}`);
      assert(providers.slice(0, 2).every(provider => provider.version_status === 'VERSION_MISMATCH'));
    } finally { rmSync(item.root, { recursive: true }); }
  }
  assert.equal(versionStatus('antigravity', '1.2.3'), 'UNTESTED');
  assert.throws(() => versionStatus('gemini', '1.2.3'), RangeError);
});
