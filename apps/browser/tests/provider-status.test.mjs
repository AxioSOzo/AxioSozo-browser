// TEST FIXTURES ONLY: discovery and Keychain are fakes. No process, Keychain, provider client or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildProviderStatus, clientStatus, jevStatus, getProviderStatus, getJevKeyStatus, storeJevKeyAndReport,
  removeJevKeyAndReport, keychainErrorText, STATES, STATE_LABELS, SIGN_IN, SIGN_IN_LABELS, LIVE_VERSIONS,
} from '../chrome/ProviderStatus.sys.mjs';
import { validateDiscovery } from '../chrome/ProviderSettings.sys.mjs';
import { discover } from '../../../packages/provider-host/src/discovery.mjs';
import { LIVE_VERSIONS as HOST_LIVE_VERSIONS } from '../../../packages/provider-host/src/live.mjs';

// Real discovery output shape with an empty PATH (nothing installed), then adjusted like metadata would be.
function discovery(overrides = {}) {
  const raw = { version: 1, providers: discover({ searchPath: '' }) };
  for (const item of raw.providers) {
    const change = overrides[item.driver];
    if (!change) continue;
    Object.assign(item, { installed: true, executable: `/synthetic/${item.driver}`, status: 'BLOCKED_AUTH', ...change });
    item.version_status = !item.client_version || !item.route.pinned_version ? 'UNTESTED'
      : item.client_version === item.route.pinned_version ? 'PINNED_METADATA_MATCH' : 'VERSION_MISMATCH';
  }
  return validateDiscovery(raw);
}
const prefs = value => ({ getBoolPref: (_name, fallback) => value === undefined ? fallback : value });
function ops({ discovered = discovery(), key = 'missing', keyError = null, storeError = null, removeError = null } = {}) {
  const calls = [];
  return { calls,
    discover: async () => { calls.push('discover'); if (discovered instanceof Error) throw discovered; return discovered; },
    presence: async () => { calls.push('presence'); if (keyError) throw new Error(keyError); return key; },
    store: async (secret, _runtime, _signal, p) => { calls.push(['store', secret.length, p !== undefined]); if (storeError) throw new Error(storeError); key = 'stored'; },
    remove: async () => { calls.push('remove'); if (removeError) throw new Error(removeError); key = 'missing'; } };
}

test('chrome live-version table matches the provider host LIVE_VERSIONS exactly', () => {
  assert.deepEqual(LIVE_VERSIONS, HOST_LIVE_VERSIONS);
});

test('vocabulary is closed and every state and sign-in value has a user-facing string', () => {
  assert.deepEqual(STATES, ['ready', 'unverified', 'not-installed', 'unavailable', 'needs-key', 'key-stored', 'disabled', 'unknown']);
  for (const state of STATES) assert.equal(typeof STATE_LABELS[state], 'string');
  for (const value of SIGN_IN) assert.equal(typeof SIGN_IN_LABELS[value], 'string');
});

test('nothing installed: three clients not-installed, Jev needs a key; nothing is ever ready or verified', () => {
  const model = buildProviderStatus({ discovery: discovery(), jev: { keyEntryEnabled: true, key: 'missing' } });
  assert.equal(model.version, 1); assert.equal(model.discovery, 'ok'); assert.equal(model.model_turns_verified, false);
  assert.deepEqual(model.providers.map(item => [item.id, item.state]), [
    ['codex', 'not-installed'], ['claude-code', 'not-installed'], ['antigravity', 'not-installed'], ['jev', 'needs-key']]);
  for (const item of model.providers) {
    assert.equal(item.verified, false); assert.notEqual(item.state, 'ready'); assert(STATES.includes(item.state));
    assert.equal(item.state_label, STATE_LABELS[item.state]); assert(Object.isFrozen(item));
    assert(!/\/synthetic\//.test(JSON.stringify(item)), 'no executable paths in the status model');
  }
  assert.deepEqual(model.providers.slice(0, 3).map(item => [item.installed, item.route, item.sign_in]),
    [[false, 'official-client', 'not-applicable'], [false, 'official-client', 'not-applicable'], [false, 'official-client', 'not-applicable']]);
});

test('installed audited clients are unverified with sign-in handled by the official client', () => {
  const found = discovery({ codex: { client_version: '0.157.1' }, 'claude-code': { client_version: '2.1.283' } });
  const codex = clientStatus('codex', found[0]); const claude = clientStatus('claude-code', found[1]);
  assert.deepEqual([codex.installed, codex.version, codex.state, codex.sign_in, codex.route], [true, '0.157.1', 'unverified', 'codex-login-once', 'official-client']);
  assert.deepEqual([claude.installed, claude.version, claude.state, claude.sign_in], [true, '2.1.283', 'unverified', 'handled-by-client-on-first-question']);
  assert.equal(claude.state_label, 'Installed · not yet verified');
  assert.match(claude.detail, /first question/); assert.match(claude.detail, /not been verified/);
  assert.match(codex.detail, /Sign in once with the official Codex client/);
});

test('version mismatch, unreadable version and Antigravity are unavailable, not unverified', () => {
  const found = discovery({ codex: { client_version: '0.158.0' }, 'claude-code': { client_version: null }, antigravity: { client_version: null } });
  const [codex, claude, agy] = found.map(item => clientStatus(item.driver, item));
  assert.equal(codex.state, 'unavailable'); assert.equal(codex.version, '0.158.0'); assert.match(codex.detail, /0\.157\.1/);
  assert.equal(claude.state, 'unavailable'); assert.equal(claude.version, null); assert.match(claude.detail, /could not be read/);
  assert.equal(agy.state, 'unavailable'); assert.equal(agy.installed, true); assert.match(agy.detail, /not been verified/);
});

test('discovery failure is unknown (installed null), never not-installed', () => {
  const model = buildProviderStatus({ discovery: null, discoveryError: 'PROVIDER_HOST_UNAVAILABLE', jev: { keyEntryEnabled: true, key: 'stored' } });
  assert.equal(model.discovery, 'unavailable'); assert.equal(model.discovery_error, 'PROVIDER_HOST_UNAVAILABLE');
  assert(model.providers.slice(0, 3).every(item => item.state === 'unknown' && item.installed === null));
  assert.equal(model.providers[3].state, 'key-stored');
});

test('Jev states: stored, missing, kill switch, helper unavailable and unreadable', () => {
  const stored = jevStatus({ keyEntryEnabled: true, key: 'stored' });
  assert.deepEqual([stored.id, stored.route, stored.sign_in, stored.key, stored.state, stored.version, stored.installed],
    ['jev', 'api-key', 'api-key', 'stored', 'key-stored', 'jev-1.13.0', null]);
  assert.match(stored.detail, /not been verified/);
  assert.equal(jevStatus({ keyEntryEnabled: true, key: 'missing' }).state, 'needs-key');
  const off = jevStatus({ keyEntryEnabled: false, key: 'missing' });
  assert.equal(off.state, 'disabled'); assert.equal(off.state_label, 'Turned off'); assert.equal(off.key_entry_enabled, false);
  const offStored = jevStatus({ keyEntryEnabled: false, key: 'stored' });
  assert.equal(offStored.state, 'key-stored'); assert.match(offStored.detail, /turned off/);
  const helper = jevStatus({ keyEntryEnabled: true, keyError: 'KEYCHAIN_HELPER_UNAVAILABLE' });
  assert.deepEqual([helper.state, helper.key], ['unavailable', 'unavailable']);
  assert.match(helper.detail, /Keychain helper not available in this build/);
  const refused = jevStatus({ keyEntryEnabled: true, keyError: 'KEYCHAIN_REFUSED' });
  assert.deepEqual([refused.state, refused.key], ['unknown', 'unknown']);
});

test('getProviderStatus combines metadata discovery and key presence and never rejects', async () => {
  const fake = ops({ key: 'stored' });
  const model = await getProviderStatus({ prefs: prefs(undefined), ops: fake });
  assert.deepEqual(fake.calls.sort(), ['discover', 'presence']);
  assert.equal(model.providers[3].state, 'key-stored'); assert.equal(model.providers[3].key_entry_enabled, true);
  const failing = ops({ discovered: new Error('HELPER_TIMEOUT'), keyError: 'KEYCHAIN_HELPER_UNAVAILABLE' });
  const degraded = await getProviderStatus({ prefs: prefs(false), ops: failing });
  assert.equal(degraded.discovery_error, 'HELPER_TIMEOUT'); assert.equal(degraded.providers[3].state, 'unavailable');
  const odd = await getProviderStatus({ prefs: prefs(true), ops: ops({ discovered: new Error('spawn /secret/path failed'), keyError: 'weird /path' }) });
  assert.equal(odd.discovery_error, 'DISCOVERY_FAILED'); assert.equal(odd.providers[3].state, 'unavailable');
  assert(!JSON.stringify(odd).includes('/secret/path') && !JSON.stringify(odd).includes('/path'));
});

test('store and remove report the refreshed Jev entry, never the key, and fail with fixed codes only', async () => {
  const secret = 'synthetic-key-not-real-0123';
  const fake = ops();
  const after = await storeJevKeyAndReport(secret, { prefs: prefs(true), ops: fake });
  assert.equal(after.state, 'key-stored'); assert(!JSON.stringify(after).includes(secret));
  assert.deepEqual(fake.calls, [['store', secret.length, true], 'presence']);
  const removed = await removeJevKeyAndReport({ prefs: prefs(true), ops: fake });
  assert.equal(removed.state, 'needs-key');
  await assert.rejects(storeJevKeyAndReport(secret, { ops: ops({ storeError: 'INVALID_KEY' }) }), /^Error: INVALID_KEY$/);
  await assert.rejects(storeJevKeyAndReport(secret, { ops: ops({ storeError: `bad ${secret}` }) }),
    error => error.message === 'KEYCHAIN_HELPER_UNAVAILABLE' && !error.message.includes(secret));
  await assert.rejects(removeJevKeyAndReport({ ops: ops({ removeError: 'KEYCHAIN_REFUSED' }) }), /KEYCHAIN_REFUSED/);
  assert.equal((await getJevKeyStatus({ prefs: prefs(true), ops: ops({ key: 'missing' }) })).state, 'needs-key');
});

test('Keychain failure texts are fixed sentences', () => {
  for (const code of ['INVALID_KEY', 'JEV_KEY_ENTRY_DISABLED', 'KEYCHAIN_HELPER_UNAVAILABLE', 'KEYCHAIN_REFUSED', 'HELPER_TIMEOUT', 'PRIVATE_WINDOW', 'OTHER']) {
    assert.match(keychainErrorText(code), /^[A-Z].+\.$/);
  }
  assert.equal(keychainErrorText('KEYCHAIN_HELPER_UNAVAILABLE'), 'Keychain helper not available in this build. Nothing was stored.');
});
