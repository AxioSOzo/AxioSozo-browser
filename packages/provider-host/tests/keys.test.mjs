// TEST FIXTURES ONLY: synthetic key stores and a shell stand-in for the native helper
// (fixtures/keychain-fake.sh). The real macOS Keychain is never touched; no network call exists here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { ProviderHost } from '../src/host.mjs';
import { KEYCHAIN_PROVIDERS, MacKeychain, validKey } from '../src/keychain.mjs';

const fakeHelper = fileURLToPath(new URL('../fixtures/keychain-fake.sh', import.meta.url));
function syntheticStores({ failing = [] } = {}) {
  const items = new Map([['jev', 'synthetic-existing-jev-key']]); const log = [];
  const create = provider => ({
    exists: async () => { log.push(['exists', provider]); if (failing.includes(provider)) throw new Error('locked'); return items.has(provider); },
    store: async key => { log.push(['store', provider]); if (failing.includes(provider)) throw new Error('refused'); items.set(provider, key); },
    remove: async () => { log.push(['remove', provider]); if (failing.includes(provider)) throw new Error('refused'); return items.delete(provider); },
    read: async () => assert.fail('key entry never reads a key'),
  });
  return { create, items, log };
}
function host(options = {}) {
  const messages = []; let next = 0;
  const instance = new ProviderHost({ createAdapter: () => assert.fail('no client'), ...options });
  instance.on('message', m => messages.push(m));
  const call = async (method, params) => { const id = `k${++next}`; await instance.handle({ version: 1, id, method, params }); return messages.find(m => m.id === id); };
  return { instance, messages, call };
}
const originalFetch = globalThis.fetch;
test.beforeEach(() => { globalThis.fetch = () => assert.fail('key entry must never make a network call'); });
test.afterEach(() => { globalThis.fetch = originalFetch; });

test('keys/status reports presence only, per provider, with capabilities and shape status', async () => {
  const stores = syntheticStores(); const h = host({ createKeyStore: stores.create });
  try {
    const reply = await h.call('keys/status', {});
    assert.deepEqual(reply.result, { version: 1, providers: [
      { provider: 'jev', key: 'stored', capabilities: { image: false }, shape_status: 'DOCUMENTED' },
      { provider: 'openai', key: 'missing', capabilities: { image: true }, shape_status: 'UNVERIFIED_SHAPE' }] });
    assert(!JSON.stringify(h.messages).includes('synthetic-existing-jev-key'));
    assert.equal((await h.call('keys/status', { provider: 'jev' })).error.code, 'INVALID_INPUT');
  } finally { await h.instance.close(); }
  const locked = host({ createKeyStore: syntheticStores({ failing: ['openai'] }).create });
  try { assert.deepEqual((await locked.call('keys/status', {})).result.providers.map(p => p.key), ['stored', 'unknown']); }
  finally { await locked.instance.close(); }
});

test('keys/store writes each provider to its own item and never echoes the key', async () => {
  const stores = syntheticStores(); const h = host({ createKeyStore: stores.create });
  try {
    assert.deepEqual((await h.call('keys/store', { provider: 'openai', key: 'synthetic-openai-key-1' })).result, { provider: 'openai', key: 'stored' });
    assert.deepEqual((await h.call('keys/store', { provider: 'jev', key: 'synthetic-jev-key-2' })).result, { provider: 'jev', key: 'stored' });
    assert.equal(stores.items.get('openai'), 'synthetic-openai-key-1'); assert.equal(stores.items.get('jev'), 'synthetic-jev-key-2');
    assert.deepEqual((await h.call('keys/status', {})).result.providers.map(p => p.key), ['stored', 'stored']);
    assert(!JSON.stringify(h.messages).includes('synthetic-openai-key-1') && !JSON.stringify(h.messages).includes('synthetic-jev-key-2'));
  } finally { await h.instance.close(); }
});

test('keys/store rejects bad keys, providers and fields before touching the Keychain; failures use fixed codes', async () => {
  const stores = syntheticStores({ failing: ['openai'] }); const h = host({ createKeyStore: stores.create });
  try {
    for (const key of ['short', 'x'.repeat(4097), 'synthetic\nkey-123', 'synthetic\tkey-123', 7, null])
      assert.equal((await h.call('keys/store', { provider: 'jev', key })).error.code, 'INVALID_KEY');
    assert.equal((await h.call('keys/store', { provider: 'anthropic', key: 'synthetic-key-1234' })).error.code, 'INVALID_INPUT');
    assert.equal((await h.call('keys/store', { provider: 'jev', key: 'synthetic-key-1234', label: 'x' })).error.code, 'INVALID_INPUT');
    assert.deepEqual(stores.log, []);
    const refused = await h.call('keys/store', { provider: 'openai', key: 'synthetic-key-refused' });
    assert.deepEqual(refused.error, { code: 'KEYCHAIN_REFUSED', message: 'The macOS Keychain refused or could not store the key' });
    assert(!JSON.stringify(h.messages).includes('synthetic-key-refused') && !JSON.stringify(h.messages).includes('synthetic-key-1234'));
  } finally { await h.instance.close(); }
  assert(validKey('é'.repeat(4)) && !validKey('é'.repeat(2049)));
});

test('keys/remove deletes only the named provider item; missing counts as removed', async () => {
  const stores = syntheticStores(); const h = host({ createKeyStore: stores.create });
  try {
    assert.deepEqual((await h.call('keys/remove', { provider: 'openai' })).result, { provider: 'openai', key: 'missing' });
    assert.deepEqual((await h.call('keys/remove', { provider: 'jev' })).result, { provider: 'jev', key: 'missing' });
    assert.equal(stores.items.size, 0);
    assert.equal((await h.call('keys/remove', {})).error.code, 'INVALID_INPUT');
  } finally { await h.instance.close(); }
  const bare = host();
  try { for (const method of ['keys/status', 'keys/store', 'keys/remove']) assert.equal((await bare.call(method, {})).error.code, 'UNSUPPORTED'); }
  finally { await bare.instance.close(); }
});

test('MacKeychain keeps the Jev argv and selects the OpenAI item with a fixed second argument (fake helper)', { skip: process.platform !== 'darwin' }, async () => {
  assert.deepEqual(KEYCHAIN_PROVIDERS, ['jev', 'openai']);
  assert.throws(() => new MacKeychain(fakeHelper, 'anthropic'), { code: 'INVALID_INPUT' });
  const jev = new MacKeychain(fakeHelper); const openai = new MacKeychain(fakeHelper, 'openai');
  assert.equal(await jev.read(), 'argc=1 args=read');
  assert.equal(await openai.read(), null);
  assert.equal(await jev.exists(), true); assert.equal(await openai.exists(), false);
  await jev.store('synthetic-store-key-jev'); await openai.store('synthetic-store-key-openai');
  await assert.rejects(openai.store('synthetic-store-key-jev'), { code: 'KEYCHAIN_ERROR' });
  assert.throws(() => jev.store('bad\u0001key-1234'), { code: 'INVALID_INPUT' });
  assert.equal(await jev.remove(), true); assert.equal(await openai.remove(), false);
});
