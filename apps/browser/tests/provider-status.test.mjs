// TEST FIXTURES ONLY: discovery, runtimes and the Keychain helper are fakes. No process, Keychain,
// provider client or network. Keys are invented placeholders.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildProviderStatus, clientStatus, jevStatus, decisionKeyEntry, getProviderStatus, getDecisionKeyStatus,
  storeDecisionKeyAndReport, removeDecisionKeyAndReport, keychainErrorText, STATES, STATE_LABELS, SIGN_IN,
  SIGN_IN_LABELS, LIVE_VERSIONS, DECISION_PROVIDERS, DECISION_CALLS,
} from '../chrome/ProviderStatus.sys.mjs';
import { validateDiscovery } from '../chrome/ProviderSettings.sys.mjs';
import { DECISION_KEY_CODES, DECISION_KEY_PREFS, decisionKeyStatus, storeDecisionKey, removeDecisionKey } from '../chrome/ProviderKeys.sys.mjs';
import { createDecisionKeyFixtureRuntime, KEY_FIXTURE_SHA256 } from '../chrome/DecisionKeyFixtureRuntime.sys.mjs';
import { discover } from '../../../packages/provider-host/src/discovery.mjs';
import { LIVE_VERSIONS as HOST_LIVE_VERSIONS } from '../../../packages/provider-host/src/live.mjs';

const SECRET = 'synthetic-key-not-real-0123';

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
const prefs = values => ({ getBoolPref: (name, fallback) => (Object.hasOwn(values, name) ? values[name] : fallback) });
const ENABLED = prefs({ [DECISION_KEY_PREFS.jev]: true, [DECISION_KEY_PREFS.openai]: true });
// The privileged surface's authority as tests mint it; production surfaces mint their own.
const ACTIVE = () => true;
const ticks = async (count = 20) => { for (let i = 0; i < count; i++) await new Promise(resolve => setImmediate(resolve)); };

// In-memory helper behind the real ProviderKeys: per-provider presence markers only.
function fakeKeychain({ onSpawn, exit } = {}) {
  const items = new Set(); const argv = []; const stdin = []; const factory = [];
  const runtime = () => ({
    env: name => (name === 'AXIOSOZO_BUILD_ROOT' ? '/Volumes/AxioSozoBuild/workstation' : ''),
    timers: { setTimeout, clearTimeout },
    verifyHelper: async command => command === '/Volumes/AxioSozoBuild/workstation/providers/keychain',
    async spawn(options) {
      argv.push(options.arguments);
      onSpawn?.(options);
      const [operation, provider = 'jev'] = options.arguments;
      let closed, input = ''; const done = new Promise(resolve => { closed = resolve; });
      const empty = { readString: async () => '' };
      return { stdout: empty, stderr: empty, kill: async () => {},
        stdin: { write: async value => { input += value; stdin.push(value); }, close: async () => closed() },
        async wait() {
          await done;
          if (exit) return { exitCode: exit };
          if (operation === 'exists') return { exitCode: items.has(provider) ? 0 : 44 };
          if (operation === 'remove') return { exitCode: items.delete(provider) ? 0 : 44 };
          if (!input) return { exitCode: 1 }; // like the helper: no input stores nothing
          items.add(provider); return { exitCode: 0 };
        } };
    } });
  const keys = { status: decisionKeyStatus, store: storeDecisionKey, remove: removeDecisionKey,
    runtime: async ({ signal }) => { factory.push(signal); return runtime(); } };
  return { items, argv, stdin, factory, keys };
}
// Recording fakes for the adapter alone (`authority` records what each step received).
function keyOps({ key = 'missing', error = null, storeError = null, removeError = null, runtime = async () => ({ fake: true }) } = {}) {
  const calls = [], authority = [];
  const seen = (step, options) => authority.push([step, options.signal, options.isActive]);
  return { calls, authority, keys: {
    runtime: async options => { seen('runtime', options); calls.push(['runtime', options.signal]); return runtime(options); },
    status: async (provider, options) => { seen('status', options); calls.push(['status', provider, options.runtime]); return { provider, key_entry_enabled: true, key, error }; },
    store: async (provider, secret, options) => { seen('store', options); calls.push(['store', provider, secret.length, options.runtime]); if (storeError) throw storeError; key = 'stored'; },
    remove: async (provider, options) => { seen('remove', options); calls.push(['remove', provider, options.runtime]); if (removeError) throw removeError; key = 'missing'; },
  } };
}

test('chrome live-version table matches the provider host LIVE_VERSIONS exactly', () => {
  assert.deepEqual(LIVE_VERSIONS, HOST_LIVE_VERSIONS);
});

test('vocabulary is closed and every state and sign-in value has a user-facing string', () => {
  assert.deepEqual(STATES, ['ready', 'unverified', 'not-installed', 'unavailable', 'needs-key', 'key-stored', 'disabled', 'unknown']);
  for (const state of STATES) assert.equal(typeof STATE_LABELS[state], 'string');
  for (const value of SIGN_IN) assert.equal(typeof SIGN_IN_LABELS[value], 'string');
  assert.deepEqual(DECISION_PROVIDERS, ['jev', 'openai']);
  assert.equal(DECISION_CALLS, 'NOT_AUTHORIZED');
});

test('nothing installed: three clients not-installed; decision keys are not part of discovery', () => {
  const model = buildProviderStatus({ discovery: discovery() });
  assert.equal(model.version, 1); assert.equal(model.discovery, 'ok'); assert.equal(model.model_turns_verified, false);
  assert.deepEqual(model.providers.map(item => [item.id, item.state]), [
    ['codex', 'not-installed'], ['claude-code', 'not-installed'], ['antigravity', 'not-installed']]);
  for (const item of model.providers) {
    assert.equal(item.verified, false); assert.notEqual(item.state, 'ready'); assert(STATES.includes(item.state));
    assert.equal(item.state_label, STATE_LABELS[item.state]); assert(Object.isFrozen(item));
    assert(!/\/synthetic\//.test(JSON.stringify(item)), 'no executable paths in the status model');
  }
  assert.deepEqual(model.providers.map(item => [item.installed, item.route, item.sign_in]),
    [[false, 'official-client', 'not-applicable'], [false, 'official-client', 'not-applicable'], [false, 'official-client', 'not-applicable']]);
  // A caller that still passes the legacy single Jev input gets it appended.
  assert.deepEqual(buildProviderStatus({ discovery: discovery(), jev: { keyEntryEnabled: true, key: 'missing' } }).providers.at(-1).state, 'needs-key');
});

test('installed audited clients are unverified with sign-in handled by the official client', () => {
  const found = discovery({ codex: { client_version: '0.160.0' }, 'claude-code': { client_version: '2.1.283' } });
  const codex = clientStatus('codex', found[0]); const claude = clientStatus('claude-code', found[1]);
  assert.deepEqual([codex.installed, codex.version, codex.state, codex.sign_in, codex.route], [true, '0.160.0', 'unverified', 'codex-login-once', 'official-client']);
  assert.deepEqual([claude.installed, claude.version, claude.state, claude.sign_in], [true, '2.1.283', 'unverified', 'handled-by-client-on-first-question']);
  assert.equal(claude.state_label, 'Installed · not yet verified');
  assert.match(claude.detail, /first question/); assert.match(claude.detail, /not been verified/);
  assert.match(codex.detail, /Sign in once with the official Codex client/);
});

test('version mismatch, unreadable version and Antigravity are unavailable, not unverified', () => {
  const found = discovery({ codex: { client_version: '0.158.0' }, 'claude-code': { client_version: null }, antigravity: { client_version: null } });
  const [codex, claude, agy] = found.map(item => clientStatus(item.driver, item));
  assert.equal(codex.state, 'unavailable'); assert.equal(codex.version, '0.158.0'); assert.match(codex.detail, /0\.160\.0/);
  assert.equal(claude.state, 'unavailable'); assert.equal(claude.version, null); assert.match(claude.detail, /could not be read/);
  assert.equal(agy.state, 'unavailable'); assert.equal(agy.installed, true); assert.match(agy.detail, /not been verified/);
});

test('Codex 0.160.0 alone is compatible and stays unverified; 0.157.1, future, prerelease and unreadable versions are unavailable', () => {
  assert.deepEqual(LIVE_VERSIONS, { codex: '0.160.0', 'claude-code': '2.1.283' });
  const model = buildProviderStatus({ discovery: discovery({ codex: { client_version: '0.160.0' } }) });
  const codex = model.providers.find(item => item.id === 'codex');
  assert.equal(model.model_turns_verified, false);
  assert.deepEqual([codex.version, codex.expected_version, codex.state, codex.verified, codex.sign_in],
    ['0.160.0', '0.160.0', 'unverified', false, 'codex-login-once']);
  assert.match(codex.detail, /Sign in once with the official Codex client/); assert.match(codex.detail, /not been verified/);
  for (const version of ['0.157.1', '0.161.0', '1.0.0', '0.160.0-alpha.1', null]) {
    const refused = clientStatus('codex', discovery({ codex: { client_version: version } })[0]);
    assert.deepEqual([refused.installed, refused.version, refused.state, refused.verified, refused.sign_in],
      [true, version, 'unavailable', false, 'not-applicable'], String(version));
    assert.match(refused.detail, /this build works only with Codex 0\.160\.0/, String(version));
  }
});

test('discovery failure is unknown (installed null), never not-installed', () => {
  const model = buildProviderStatus({ discovery: null, discoveryError: 'PROVIDER_HOST_UNAVAILABLE' });
  assert.equal(model.discovery, 'unavailable'); assert.equal(model.discovery_error, 'PROVIDER_HOST_UNAVAILABLE');
  assert(model.providers.every(item => item.state === 'unknown' && item.installed === null));
});

test('decision-key entries: stored, missing, turned off, helper unavailable and unknown; never ready', () => {
  for (const provider of ['jev', 'openai']) {
    const label = provider === 'jev' ? 'Jev' : 'OpenAI';
    const stored = decisionKeyEntry({ provider, key_entry_enabled: true, key: 'stored', error: null });
    assert.deepEqual([stored.id, stored.label, stored.route, stored.sign_in, stored.key, stored.state, stored.can_store, stored.can_remove, stored.calls],
      [provider, label, 'api-key', 'api-key', 'stored', 'key-stored', true, true, 'NOT_AUTHORIZED']);
    assert.match(stored.detail, /has not been used or checked: decision calls are not available in this build/u);
    assert.equal(stored.shape_status, provider === 'openai' ? 'UNVERIFIED_SHAPE' : null);
    if (provider === 'openai') assert.match(stored.detail, /OpenAI's decision format is not verified/u);
    const missing = decisionKeyEntry({ provider, key_entry_enabled: true, key: 'missing' });
    assert.deepEqual([missing.state, missing.state_label, missing.can_store, missing.can_remove], ['needs-key', 'No key stored', true, false]);
    assert.match(missing.detail, /optional/u);
    // Entry off: storing is refused, but a stored key can still be removed.
    const off = decisionKeyEntry({ provider, key_entry_enabled: false, key: 'missing' });
    assert.deepEqual([off.state, off.state_label, off.can_store, off.can_remove], ['disabled', 'Turned off', false, false]);
    assert.match(off.detail, new RegExp(DECISION_KEY_PREFS[provider].replaceAll('.', '\\.'), 'u'));
    const offStored = decisionKeyEntry({ provider, key_entry_enabled: false, key: 'stored' });
    assert.deepEqual([offStored.state, offStored.can_store, offStored.can_remove], ['key-stored', false, true]);
    assert.match(offStored.detail, /you can still remove it/u);
    // A missing helper is `unavailable` with key `unknown`; it is never key:'unavailable'.
    const helper = decisionKeyEntry({ provider, key_entry_enabled: true, key: 'unknown', error: 'KEYCHAIN_HELPER_UNAVAILABLE' });
    assert.deepEqual([helper.state, helper.key, helper.error, helper.can_store, helper.can_remove], ['unavailable', 'unknown', 'KEYCHAIN_HELPER_UNAVAILABLE', false, false]);
    for (const code of ['KEYCHAIN_REFUSED', 'HELPER_TIMEOUT', 'HELPER_OUTPUT_LIMIT', 'SETTINGS_CLOSED']) {
      const unknown = decisionKeyEntry({ provider, key_entry_enabled: true, key: 'unknown', error: code });
      assert.deepEqual([unknown.state, unknown.error, unknown.can_store, unknown.can_remove], ['unknown', code, true, true], code);
    }
    // Only fixed codes survive; anything else is no code at all.
    assert.equal(decisionKeyEntry({ provider, key_entry_enabled: true, key: 'unknown', error: `bad ${SECRET} /path` }).error, null);
    for (const entry of [stored, missing, off, helper]) {
      assert(Object.isFrozen(entry)); assert.equal(entry.verified, false); assert.notEqual(entry.state, 'ready');
      assert.equal(entry.state_label, STATE_LABELS[entry.state]); assert.match(entry.detail, /^[A-Z].+\.$/u);
    }
  }
  assert.throws(() => decisionKeyEntry({ provider: 'anthropic', key: 'stored' }), /INVALID_PROVIDER/);
  // The legacy Jev entry is the same presentation.
  assert.deepEqual(jevStatus({ keyEntryEnabled: true, key: 'stored' }), decisionKeyEntry({ provider: 'jev', key_entry_enabled: true, key: 'stored' }));
  assert.equal(jevStatus({ keyEntryEnabled: true, keyError: 'KEYCHAIN_HELPER_UNAVAILABLE' }).state, 'unavailable');
});

test('getProviderStatus reads installation metadata only and never rejects', async () => {
  const calls = [];
  const model = await getProviderStatus({ ops: { discover: async () => { calls.push('discover'); return discovery(); } } });
  assert.deepEqual(calls, ['discover']); assert.equal(model.providers.length, 3);
  const degraded = await getProviderStatus({ ops: { discover: async () => { throw new Error('HELPER_TIMEOUT'); } } });
  assert.equal(degraded.discovery_error, 'HELPER_TIMEOUT');
  const odd = await getProviderStatus({ ops: { discover: async () => { throw new Error('spawn /secret/path failed'); } } });
  assert.equal(odd.discovery_error, 'DISCOVERY_FAILED'); assert(!JSON.stringify(odd).includes('/secret/path'));
});

test('every key operation admits its own runtime under the caller signal; a refused admission never falls back', async () => {
  const controller = new AbortController();
  const fake = keyOps({ key: 'stored' });
  const entry = await getDecisionKeyStatus('openai', { signal: controller.signal, prefs: ENABLED, isActive: ACTIVE, keys:fake.keys });
  assert.equal(entry.state, 'key-stored');
  assert.equal(fake.calls[0][0], 'runtime'); assert.equal(fake.calls[0][1], controller.signal);
  assert.deepEqual(fake.calls[1].slice(0, 2), ['status', 'openai']); assert.deepEqual(fake.calls[1][2], { fake: true });
  // No synthetic fixture requested (null): ProviderKeys gets no runtime and selects its own helper.
  const absent = keyOps({ runtime: async () => null });
  await getDecisionKeyStatus('jev', { prefs: ENABLED, isActive: ACTIVE, keys:absent.keys });
  assert.equal(absent.calls[1][2], undefined);
  // A requested but refused fixture is unavailable, and no key operation runs at all.
  const refused = keyOps({ runtime: async () => { throw new Error('KEYCHAIN_HELPER_UNAVAILABLE'); } });
  const unavailable = await getDecisionKeyStatus('jev', { prefs: ENABLED, isActive: ACTIVE, keys:refused.keys });
  assert.deepEqual([unavailable.state, unavailable.key, unavailable.error], ['unavailable', 'unknown', 'KEYCHAIN_HELPER_UNAVAILABLE']);
  assert.deepEqual(refused.calls.map(call => call[0]), ['runtime']);
  await assert.rejects(storeDecisionKeyAndReport('jev', SECRET, { prefs: ENABLED, isActive: ACTIVE, keys:refused.keys }), /^Error: KEYCHAIN_HELPER_UNAVAILABLE$/);
  await assert.rejects(removeDecisionKeyAndReport('jev', { prefs: ENABLED, isActive: ACTIVE, keys:refused.keys }), /^Error: KEYCHAIN_HELPER_UNAVAILABLE$/);
  assert(refused.calls.every(call => call[0] === 'runtime'), 'nothing but admission was attempted');
  // Closed before admission: nothing is admitted.
  controller.abort();
  const closed = keyOps();
  assert.equal((await getDecisionKeyStatus('jev', { signal: controller.signal, prefs: ENABLED, isActive: ACTIVE, keys:closed.keys })).error, 'SETTINGS_CLOSED');
  await assert.rejects(storeDecisionKeyAndReport('jev', SECRET, { signal: controller.signal, prefs: ENABLED, isActive: ACTIVE, keys:closed.keys }), /SETTINGS_CLOSED/);
  assert.deepEqual(closed.calls, []);
});

test('store is refused before any admission when entry is off, the pref is unreadable or the key is invalid', async () => {
  const cases = [
    ['jev', prefs({}), SECRET, 'KEY_ENTRY_DISABLED'],
    ['openai', prefs({ [DECISION_KEY_PREFS.jev]: true }), SECRET, 'KEY_ENTRY_DISABLED'],
    ['jev', { getBoolPref: () => { throw new Error('pref service failure'); } }, SECRET, 'KEY_ENTRY_DISABLED'],
    ['jev', prefs({ [DECISION_KEY_PREFS.jev]: 'true' }), SECRET, 'KEY_ENTRY_DISABLED'],
    ['jev', ENABLED, 'short', 'INVALID_KEY'],
    ['jev', ENABLED, 'line\nbreak-key', 'INVALID_KEY'],
    ['jev', ENABLED, 'nul\0key-12345', 'INVALID_KEY'],
    ['jev', ENABLED, 'x'.repeat(4097), 'INVALID_KEY'],
    ['jev', ENABLED, 'é'.repeat(2049), 'INVALID_KEY'],
    ['jev', ENABLED, 42, 'INVALID_KEY'],
    ['anthropic', ENABLED, SECRET, 'INVALID_PROVIDER'],
  ];
  for (const [provider, preferences, secret, code] of cases) {
    const fake = keyOps();
    await assert.rejects(storeDecisionKeyAndReport(provider, secret, { prefs: preferences, isActive: ACTIVE, keys: fake.keys }),
      error => error.message === code, `${provider} ${String(secret).slice(0, 12)}`);
    assert.deepEqual(fake.calls, [], 'no runtime admission and no helper');
  }
  // Exactly at the UTF-8 bounds: 8 and 4096 bytes are accepted.
  for (const secret of ['12345678', 'é'.repeat(2048)]) {
    const fake = keyOps();
    await storeDecisionKeyAndReport('jev', secret, { prefs: ENABLED, isActive: ACTIVE, keys:fake.keys });
    assert.deepEqual(fake.calls.map(call => call[0]), ['runtime', 'store', 'runtime', 'status']);
  }
  // Removal does not depend on the key-entry pref.
  const off = keyOps({ key: 'stored' });
  assert.equal((await removeDecisionKeyAndReport('jev', { prefs: prefs({}), isActive: ACTIVE, keys: off.keys })).state, 'disabled');
  assert.deepEqual(off.calls.map(call => call[0]), ['runtime', 'remove', 'runtime', 'status']);
});

test('store and remove report a refreshed entry from a second runtime, never the key; failures are fixed codes only', async () => {
  const fake = keyOps();
  const after = await storeDecisionKeyAndReport('openai', SECRET, { prefs: ENABLED, isActive: ACTIVE, keys:fake.keys });
  assert.equal(after.state, 'key-stored'); assert(!JSON.stringify(after).includes(SECRET));
  assert.deepEqual(fake.calls.map(call => call.slice(0, call[0] === 'store' ? 3 : 2)),
    [['runtime', undefined], ['store', 'openai', SECRET.length], ['runtime', undefined], ['status', 'openai']]);
  assert.notEqual(fake.calls[1][3], fake.calls[3][2], 'the refresh runs on its own freshly admitted runtime');
  const removed = await removeDecisionKeyAndReport('openai', { prefs: ENABLED, isActive: ACTIVE, keys:fake.keys });
  assert.equal(removed.state, 'needs-key');
  for (const code of DECISION_KEY_CODES.filter(code => code !== 'INVALID_PROVIDER')) {
    await assert.rejects(storeDecisionKeyAndReport('jev', SECRET, { prefs: ENABLED, isActive: ACTIVE, keys:keyOps({ storeError: Object.assign(new Error(code), { code }) }).keys }),
      error => error.message === code, code);
  }
  for (const failure of [new Error(`helper said ${SECRET}`), { code: `X${SECRET}` }, `raw ${SECRET}`]) {
    await assert.rejects(storeDecisionKeyAndReport('jev', SECRET, { prefs: ENABLED, isActive: ACTIVE, keys:keyOps({ storeError: failure }).keys }),
      error => error.message === 'KEYCHAIN_HELPER_UNAVAILABLE' && !JSON.stringify(error).includes(SECRET) && !error.stack.includes(SECRET));
  }
  await assert.rejects(removeDecisionKeyAndReport('jev', { prefs: ENABLED, isActive: ACTIVE, keys:keyOps({ removeError: new Error('KEYCHAIN_REFUSED') }).keys }), /KEYCHAIN_REFUSED/);
  await assert.rejects(removeDecisionKeyAndReport('nope', { prefs: ENABLED, isActive: ACTIVE, keys:keyOps().keys }), /INVALID_PROVIDER/);
});

test('with the real ProviderKeys: Jev and OpenAI are independent; replacing one keeps the other; the key reaches stdin only', async () => {
  const chain = fakeKeychain();
  const options = { prefs: ENABLED, isActive: ACTIVE, keys:chain.keys };
  const status = async provider => (await getDecisionKeyStatus(provider, options)).state;
  assert.deepEqual([await status('jev'), await status('openai')], ['needs-key', 'needs-key']);
  assert.equal((await storeDecisionKeyAndReport('jev', SECRET, options)).state, 'key-stored');
  assert.deepEqual([await status('jev'), await status('openai')], ['key-stored', 'needs-key']);
  await storeDecisionKeyAndReport('openai', 'synthetic-openai-key-0456', options);
  await storeDecisionKeyAndReport('jev', 'synthetic-replacement-0789', options);
  assert.deepEqual([await status('jev'), await status('openai')], ['key-stored', 'key-stored'], 'replacing Jev kept OpenAI');
  assert.equal((await removeDecisionKeyAndReport('jev', options)).state, 'needs-key');
  assert.deepEqual([await status('jev'), await status('openai')], ['needs-key', 'key-stored'], 'removing Jev kept OpenAI');
  assert.equal((await removeDecisionKeyAndReport('openai', options)).state, 'needs-key');
  assert.equal((await removeDecisionKeyAndReport('openai', options)).state, 'needs-key', 'a missing item counts as removed');
  assert.deepEqual(chain.stdin, [SECRET, 'synthetic-openai-key-0456', 'synthetic-replacement-0789'], 'only store writes, and only to stdin');
  assert(!JSON.stringify(chain.argv).includes('synthetic-'), 'never in argv');
  assert(chain.argv.every(args => ['exists', 'store', 'remove'].includes(args[0]) && (args.length === 1 || args[1] === 'openai')));
  assert.equal(chain.factory.length, chain.argv.length, 'one admitted runtime per helper operation');
});

test('with the real ProviderKeys: closing during admission or before the stdin write stores nothing', async () => {
  const controller = new AbortController();
  const late = fakeKeychain({ onSpawn: options => { if (options.arguments[0] === 'store') controller.abort(); } });
  await assert.rejects(storeDecisionKeyAndReport('jev', SECRET, { signal: controller.signal, prefs: ENABLED, isActive: ACTIVE, keys:late.keys }),
    error => error.message === 'SETTINGS_CLOSED');
  assert.deepEqual(late.stdin, [], 'the child started but never received the key');
  assert.equal(late.items.size, 0);
  const closing = new AbortController();
  const admission = fakeKeychain();
  admission.keys.runtime = async () => { closing.abort(); throw new Error('KEYCHAIN_HELPER_UNAVAILABLE'); };
  await assert.rejects(storeDecisionKeyAndReport('openai', SECRET, { signal: closing.signal, prefs: ENABLED, isActive: ACTIVE, keys:admission.keys }), /SETTINGS_CLOSED/);
  assert.deepEqual(admission.argv, []);
  // A refusing helper is KEYCHAIN_REFUSED; presence then reports unknown, never missing.
  const refusing = fakeKeychain({ exit: 1 });
  await assert.rejects(storeDecisionKeyAndReport('jev', SECRET, { prefs: ENABLED, isActive: ACTIVE, keys:refusing.keys }), /KEYCHAIN_REFUSED/);
  const unknown = await getDecisionKeyStatus('jev', { prefs: ENABLED, isActive: ACTIVE, keys:refusing.keys });
  assert.deepEqual([unknown.state, unknown.error], ['unknown', 'KEYCHAIN_REFUSED']);
});

test('Keychain failure texts are fixed sentences for every code', () => {
  for (const code of [...DECISION_KEY_CODES, 'JEV_KEY_ENTRY_DISABLED', 'BUSY', 'PRIVATE_WINDOW', 'NO_WINDOW', 'DOCUMENT_GONE', 'OTHER']) {
    assert.match(keychainErrorText(code), /^[A-Z].+\.$/);
  }
  assert.match(keychainErrorText('INVALID_KEY'), /8 to 4096 bytes/u);
  // These can follow the dispatch: never "nothing changed", never a rollback.
  for (const code of ['KEYCHAIN_HELPER_UNAVAILABLE', 'HELPER_TIMEOUT', 'HELPER_OUTPUT_LIMIT', 'SETTINGS_CLOSED', 'DOCUMENT_GONE', 'OTHER']) {
    assert.match(keychainErrorText(code), /could not be confirmed/u, code);
    assert.doesNotMatch(keychainErrorText(code), /Nothing was changed|rolled back|undone/u, code);
  }
});

// ---------------------------------------------------------------- surface authority (isActive)

test('the surface authority is required and must synchronously return literal true', async () => {
  for (const isActive of [undefined, null, 'yes', () => 'true', () => 1, async () => true, () => { throw new Error('gone'); }]) {
    const fake = keyOps({ key: 'stored' });
    const entry = await getDecisionKeyStatus('jev', { prefs: ENABLED, isActive, keys: fake.keys });
    assert.deepEqual([entry.key, entry.error], ['unknown', 'SETTINGS_CLOSED'], String(isActive));
    await assert.rejects(storeDecisionKeyAndReport('jev', SECRET, { prefs: ENABLED, isActive, keys: fake.keys }), /^Error: SETTINGS_CLOSED$/);
    await assert.rejects(removeDecisionKeyAndReport('jev', { prefs: ENABLED, isActive, keys: fake.keys }), /^Error: SETTINGS_CLOSED$/);
    assert.deepEqual(fake.calls, [], 'no admission and no key operation without a live surface');
  }
});

test('the same signal and isActive reach the factory and every key operation, including the refresh', async () => {
  const controller = new AbortController();
  const isActive = () => true;
  const fake = keyOps();
  await storeDecisionKeyAndReport('openai', SECRET, { signal: controller.signal, isActive, prefs: ENABLED, keys: fake.keys });
  await removeDecisionKeyAndReport('openai', { signal: controller.signal, isActive, prefs: ENABLED, keys: fake.keys });
  assert.deepEqual(fake.authority.map(([step]) => step), ['runtime', 'store', 'runtime', 'status', 'runtime', 'remove', 'runtime', 'status'],
    'a fresh runtime for each helper operation, the refresh included');
  assert(fake.authority.every(([, signal, callback]) => signal === controller.signal && callback === isActive));
});

test('revoked while the factory admits: ProviderStatus checks again after admission and dispatches nothing', async () => {
  let active = true;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  // A factory that ignores the callback: the adapter's own post-admission check must stop it.
  const fake = keyOps({ runtime: async () => { await gate; return { fake: true }; } });
  const pending = storeDecisionKeyAndReport('jev', SECRET, { prefs: ENABLED, isActive: () => active, keys: fake.keys });
  await ticks();
  active = false;
  release();
  await assert.rejects(pending, /^Error: SETTINGS_CLOSED$/);
  assert.deepEqual(fake.calls.map(call => call[0]), ['runtime'], 'no store and no refresh after revocation');
  const status = keyOps({ key: 'stored', runtime: async () => { active = false; return { fake: true }; } });
  active = true;
  const entry = await getDecisionKeyStatus('jev', { prefs: ENABLED, isActive: () => active, keys: status.keys });
  assert.deepEqual([entry.key, entry.error], ['unknown', 'SETTINGS_CLOSED']);
  assert.deepEqual(status.calls.map(call => call[0]), ['runtime']);
});

test('a surface revoked while admitting never reaches the production helper selection', async () => {
  const previous = { Services: globalThis.Services, ChromeUtils: globalThis.ChromeUtils };
  const touched = [];
  globalThis.Services = { env: { get: name => { touched.push(name); return undefined; } } };
  globalThis.ChromeUtils = { importESModule: url => { touched.push(url); throw new Error('no imports in this test'); } };
  try {
    let active = true;
    // No synthetic fixture requested (null): ProviderKeys would select the production helper itself.
    const keys = { status: decisionKeyStatus, store: storeDecisionKey, remove: removeDecisionKey,
      runtime: async () => { active = false; return null; } };
    await assert.rejects(storeDecisionKeyAndReport('jev', SECRET, { prefs: ENABLED, isActive: () => active, keys }), /^Error: SETTINGS_CLOSED$/);
    active = true;
    await assert.rejects(removeDecisionKeyAndReport('openai', { prefs: ENABLED, isActive: () => active, keys }), /^Error: SETTINGS_CLOSED$/);
    active = true;
    assert.equal((await getDecisionKeyStatus('jev', { prefs: ENABLED, isActive: () => active, keys })).error, 'SETTINGS_CLOSED');
    assert.deepEqual(touched, [], 'no environment read and no Subprocess import');
  } finally {
    for (const [name, value] of Object.entries(previous)) { if (value === undefined) delete globalThis[name]; else globalThis[name] = value; }
  }
});

// Root's real generic fixture runtime as the factory (fake native callbacks only):
// the surface authority must reach its internal dispatch seam, not only ProviderKeys.
function fixtureNative({ pauseAt = 0 } = {}) {
  const id = 'c'.repeat(32);
  const env = { AXIOSOZO_SYNTHETIC_TEST: '1', AXIOSOZO_KEY_GUI_FIXTURE_ROOT: `/Volumes/AxioSozoBuild/workstation/gui-fixtures/keys-${id}` };
  const profile = `/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c/plan4-keys-${id}/gecko`;
  const state = { present: new Set(), spawns: [], stdin: [], verified: 0, factories: 0, release: null };
  const native = {
    timers: { setTimeout, clearTimeout }, env: name => env[name], profilePath: () => profile,
    async verifyFile() {
      state.verified++;
      if (state.verified === pauseAt) await new Promise(resolve => { state.release = resolve; });
      return true;
    },
    sha256: async () => KEY_FIXTURE_SHA256,
    async spawn(options) {
      const [operation, provider = 'jev'] = options.arguments.slice(4);
      state.spawns.push([operation, provider]);
      let input = '', done; const exit = new Promise(resolve => { done = resolve; });
      const quiet = { readString: async () => null, close: async () => {} };
      return { stdout: quiet, stderr: quiet, kill: async () => {},
        stdin: { write: async value => { input = value; state.stdin.push(value); }, close: async () => {
          if (operation === 'store') { if (input) state.present.add(provider); done({ exitCode: input ? 0 : 2 }); }
          else if (operation === 'exists') done({ exitCode: state.present.has(provider) ? 0 : 44 });
          else done({ exitCode: state.present.delete(provider) ? 0 : 44 });
        } },
        wait: () => exit };
    },
  };
  const keys = { status: decisionKeyStatus, store: storeDecisionKey, remove: removeDecisionKey,
    // Forwards exactly what ProviderStatus hands the factory.
    runtime: options => { state.factories++; return createDecisionKeyFixtureRuntime(native, options); } };
  return { state, keys };
}

test('with the real fixture runtime: store, presence and removal per provider, one fresh admission per operation', async () => {
  const f = fixtureNative();
  const options = { prefs: ENABLED, isActive: ACTIVE, keys: f.keys };
  assert.equal((await storeDecisionKeyAndReport('jev', SECRET, options)).state, 'key-stored');
  assert.equal(f.state.factories, 2, 'the store and its refresh each admitted a new runtime');
  assert.equal((await getDecisionKeyStatus('openai', options)).state, 'needs-key', 'OpenAI is untouched');
  assert.equal((await removeDecisionKeyAndReport('jev', options)).state, 'needs-key');
  assert.deepEqual(f.state.spawns, [['store', 'jev'], ['exists', 'jev'], ['exists', 'openai'], ['remove', 'jev'], ['exists', 'jev']]);
  assert.deepEqual(f.state.stdin, [SECRET]);
});

test('with the real fixture runtime: revoked during admission, verification or the in-spawn admission, nothing is dispatched', async () => {
  // Six verifications per admission: the factory's (1-6), verifyHelper's (7-12), spawn's (13-18).
  for (const [operation, pauseAt] of [['remove', 3], ['remove', 9], ['remove', 15], ['store', 3], ['store', 9], ['store', 15]]) {
    const f = fixtureNative({ pauseAt });
    f.state.present.add('jev');
    let active = true;
    const options = { prefs: ENABLED, isActive: () => active, keys: f.keys };
    const pending = operation === 'store' ? storeDecisionKeyAndReport('jev', SECRET, options) : removeDecisionKeyAndReport('jev', options);
    for (let i = 0; i < 200 && !f.state.release; i++) await ticks(1);
    assert.ok(f.state.release, `paused at verification ${pauseAt}`);
    active = false;
    f.state.release();
    await assert.rejects(pending, error => error.message === 'SETTINGS_CLOSED', `${operation} at ${pauseAt}`);
    assert.deepEqual(f.state.spawns, [], `${operation} at ${pauseAt}: the fixed helper was never started`);
    assert.deepEqual(f.state.stdin, []);
    assert.ok(f.state.present.has('jev'), 'the stored marker is unchanged');
  }
});
