import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiscovery, ProviderInstances, discoverForSettings, storeJevKey, openProviderSettings } from '../../../apps/browser/chrome/ProviderSettings.sys.mjs';
import { discover } from '../src/discovery.mjs';

const discovery = () => ({ version: 1, providers: discover({ searchPath: '' }) });
function preferences() {
  let value; return { getStringPref: (_key, fallback) => value ?? fallback, setStringPref: (_key, next) => { value = next; }, value: () => value };
}
function runtime(output = JSON.stringify(discovery()), exitCode = 0) {
  const calls = []; let killed = 0; let closed = 0;
  const pipe = value => { let remaining = value; return { readString: async () => { const result = remaining; remaining = null; return result; } }; };
  return { calls, killed: () => killed, closed: () => closed, timers: { setTimeout, clearTimeout },
    env: key => ({ AXIOSOZO_PROVIDER_HOST: '/project/packages/provider-host/cli.mjs', AXIOSOZO_PROVIDER_NODE: '/runtime/node', AXIOSOZO_DISCOVERY_PATH: '/metadata/path' })[key] ?? '',
    spawn: async options => { calls.push(options); return { stdout: pipe(output), stderr: pipe(''), stdin: { write: async () => assert.fail('Discovery must have no stdin input'), close: async () => { closed++; } }, kill: async () => { killed++; }, wait: async () => ({ exitCode }) }; },
  };
}

test('Settings admit exactly the three real metadata routes and reject live capability claims', () => {
  const actual = validateDiscovery(discovery());
  assert.deepEqual(actual.map(item => item.driver), ['codex', 'claude-code', 'antigravity']);
  assert(actual.every(item => item.auth_status === 'unknown' && item.status === 'BLOCKED_ENV' && !item.live_verified));
  const dishonest = discovery(); dishonest.providers[0].capabilities.automatic_browser_control = true;
  assert.throws(() => validateDiscovery(dishonest), /INVALID_CAPABILITY_CLAIM/);
  const duplicate = discovery(); duplicate.providers[1] = duplicate.providers[0];
  assert.throws(() => validateDiscovery(duplicate), /INVALID_DISCOVERY/);
  const malformed = discovery(); malformed.providers[0].executable = 'path\nmarkup';
  assert.throws(() => validateDiscovery(malformed), /INVALID_DISCOVERY/);
  const invented = discovery(); invented.providers[0].protocol_status = 'PASS';
  assert.throws(() => validateDiscovery(invented), /INVALID_VERSION_CLAIM/);
});

test('Settings retain explicit version mismatch and reject a false metadata match', () => {
  const updated = discovery(); const codex = updated.providers[0];
  Object.assign(codex, { installed: true, executable: '/synthetic/codex', status: 'BLOCKED_AUTH', client_version: '0.156.1', version_status: 'VERSION_MISMATCH' });
  const result = validateDiscovery(updated)[0];
  assert.equal(result.client_version, '0.156.1'); assert.equal(result.fixture_version, '0.155.1');
  assert.equal(result.version_status, 'VERSION_MISMATCH'); assert.equal(result.protocol_status, 'UNTESTED');
  codex.version_status = 'PINNED_METADATA_MATCH'; assert.throws(() => validateDiscovery(updated), /INVALID_VERSION_CLAIM/);
});

test('Settings persist only immutable generated instance identity, driver and nonsecret label', () => {
  const prefs = preferences(); let sequence = 0;
  const store = new ProviderInstances(prefs, () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`);
  const codex = store.add('codex', '  Work  '); const claude = store.add('claude-code', 'Personal');
  assert.equal(codex.label, 'Work'); assert.notEqual(codex.instance_id, claude.instance_id);
  assert.deepEqual(Object.keys(JSON.parse(prefs.value()).instances[0]), ['instance_id', 'driver', 'label']);
  assert.throws(() => { codex.driver = 'antigravity'; }, TypeError);
  assert.throws(() => store.add('gemini', 'Wrong driver'), /INVALID_INSTANCE_INPUT/);
  assert.throws(() => store.add('codex', 'bad\nlabel'), /INVALID_INSTANCE_INPUT/);
  store.remove(codex.instance_id); assert.deepEqual(store.list(), [claude]);
  assert.throws(() => store.remove(codex.instance_id), /UNKNOWN_INSTANCE/);
});

test('Corrupt or credential-bearing saved configuration fails closed and is preserved', () => {
  const prefs = preferences(); prefs.setStringPref('', '{"version":1,"instances":[],"api_key":"synthetic"}');
  const original = prefs.value(); const store = new ProviderInstances(prefs, () => 'unused');
  assert.throws(() => store.list(), /INVALID_INSTANCE_CONFIG/);
  assert.throws(() => store.add('codex', 'New'), /INVALID_INSTANCE_CONFIG/);
  assert.equal(prefs.value(), original);
});

test('Browser-owned discovery launches only fixed metadata command with no inherited environment', async () => {
  const fake = runtime(); const result = await discoverForSettings(fake);
  assert.equal(result.length, 3); assert.equal(fake.calls.length, 1);
  assert.deepEqual(fake.calls[0], { command: '/runtime/node', arguments: ['/project/packages/provider-host/cli.mjs', 'discover'], environmentAppend: false,
    environment: { PATH: '/metadata/path', LANG: 'C' }, stderr: 'pipe' });
  assert(fake.closed() >= 1); assert.equal(fake.killed(), 1);
});

test('Discovery output limits, nonzero exit and cancellation all remain failures', async () => {
  const oversized = runtime('x'.repeat(65537)); await assert.rejects(discoverForSettings(oversized), /HELPER_OUTPUT_LIMIT/); assert.equal(oversized.killed(), 1);
  const failed = runtime('', 78); await assert.rejects(discoverForSettings(failed), /HELPER_FAILED/); assert.equal(failed.killed(), 1);
  const controller = new AbortController(); controller.abort(); const cancelled = runtime();
  await assert.rejects(discoverForSettings(cancelled, controller.signal), /SETTINGS_CLOSED/); assert.equal(cancelled.calls.length, 0);
});

for (const trigger of ['timeout', 'abort']) test(`An active metadata subprocess is reaped after ${trigger}`, async () => {
  const fake = runtime(); const controller = new AbortController(); let killed = 0; let finish;
  const completion = new Promise(resolve => { finish = resolve; });
  fake.spawn = async () => {
    if (trigger === 'abort') queueMicrotask(() => controller.abort());
    return { stdin: { close: async () => {}, write: async () => assert.fail('No stdin data allowed') },
      stdout: { readString: async () => { await completion; return null; } }, stderr: null,
      wait: async () => { await completion; return { exitCode: -15 }; }, kill: async () => { killed++; finish(); } };
  };
  if (trigger === 'timeout') fake.timers = { setTimeout: callback => { queueMicrotask(callback); return 1; }, clearTimeout: () => {} };
  await assert.rejects(discoverForSettings(fake, controller.signal), trigger === 'timeout' ? /HELPER_TIMEOUT/ : /SETTINGS_CLOSED/);
  assert(killed >= 1);
});

test('Jev settings never access Keychain until native storage is explicitly verified', async () => {
  const fake = runtime(); await assert.rejects(storeJevKey('synthetic-key-not-real', fake), /KEYCHAIN_SETTINGS_NOT_VERIFIED/);
  assert.equal(fake.calls.length, 0);
});

test('Web callers and private windows cannot open persistent provider settings', () => {
  assert.throws(() => openProviderSettings({ document: { nodePrincipal: { isSystemPrincipal: false } } }), /UNTRUSTED_SETTINGS_CALLER/);
  const previousChrome = globalThis.ChromeUtils; const previousServices = globalThis.Services; let alerts = 0;
  try {
    globalThis.ChromeUtils = { importESModule: () => ({ PrivateBrowsingUtils: { isWindowPrivate: () => true } }) };
    globalThis.Services = { prompt: { alert: () => { alerts++; } } };
    assert.equal(openProviderSettings({ document: { nodePrincipal: { isSystemPrincipal: true } }, openDialog: () => assert.fail('Private window must not open settings') }), null);
    assert.equal(alerts, 1);
  } finally {
    if (previousChrome === undefined) delete globalThis.ChromeUtils; else globalThis.ChromeUtils = previousChrome;
    if (previousServices === undefined) delete globalThis.Services; else globalThis.Services = previousServices;
  }
});
