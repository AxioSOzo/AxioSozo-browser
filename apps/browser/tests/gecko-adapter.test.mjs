import test from 'node:test';
import assert from 'node:assert/strict';
import { GeckoEngineAdapter } from '../chrome/GeckoEngineAdapter.sys.mjs';

function fixture() {
  let sequence = 0;
  const events = [];
  const calls = [];
  const listeners = new Map();
  const browser = { browsingContext: { id: 42 }, contentPrincipal: { origin: 'http://127.0.0.1:8910' }, currentURI: { spec: 'http://127.0.0.1:8910/' }, webProgress: { isLoadingDocument: false },
    canGoBack: false, canGoForward: true, loadURI: uri => calls.push(['navigate', uri.spec]), goForward: () => calls.push(['forward']), reload: () => calls.push(['reload']) };
  const tab = { linkedBrowser: browser, label: 'SYNTHETIC TEST FIXTURE', private: false };
  const win = { Services: { io: { newURI: value => { const url = new URL(value); return { scheme: url.protocol.slice(0, -1), spec: url.href }; } }, scriptSecurityManager: { getSystemPrincipal: () => 'test principal' } },
    PrivateBrowsingUtils: { isBrowserPrivate: () => tab.private },
    Ci: { nsIWebProgressListener: { LOCATION_CHANGE_SAME_DOCUMENT: 1, STATE_IS_NETWORK: 2, STATE_START: 4 } },
    gBrowser: { tabs: [tab], tabContainer: { addEventListener: (type, listener) => listeners.set(type, listener), removeEventListener: type => listeners.delete(type) },
      addTabsProgressListener: listener => { win.progress = listener; }, removeTabsProgressListener: () => { win.progress = null; },
      removeTab: selected => calls.push(['close', selected]), addTab: () => tab } };
  const adapter = new GeckoEngineAdapter(win, { uuid: () => `browser-issued-${++sequence}`, emit: event => events.push(event) });
  return { adapter, win, tab, browser, events, calls, listeners, target: () => adapter.target(adapter.find(browser)) };
}

test('target ids are minted by browser and stale identity/generation/instance cannot act', () => {
  const f = fixture();
  const original = f.target();
  assert.equal(original.native_target_id, '42');
  for (const field of ['engine_instance', 'identity', 'document_generation', 'navigation_generation', 'private_mode']) {
    assert.throws(() => f.adapter.reload({ ...original, [field]: 'forged' }), /STALE_TARGET/);
  }
  assert.throws(() => f.adapter.reload({ ...original, tab_id: 'invented' }), /UNKNOWN_TARGET/);
  assert.deepEqual(f.calls, []);
});

test('navigation acceptance differs from event completion; loading invalidates old target', () => {
  const f = fixture(); const original = f.target();
  assert.deepEqual(f.adapter.navigate(original, 'https://example.invalid/'), { status: 'accepted' });
  assert.equal(f.events.length, 0);
  assert.throws(() => f.adapter.reload(original), /STALE_TARGET/);
  f.win.progress.onStateChange(f.browser, { isTopLevel: true }, null, 6);
  assert.throws(() => f.adapter.reload(original), /STALE_TARGET/);
  assert.equal(f.events[0].type, 'loading');
  assert.equal(f.target().navigation_generation, 3);
});

test('private tabs never emit title or URL; content and forged schemes are rejected', () => {
  const f = fixture(); f.tab.private = true;
  f.win.progress.onLocationChange(f.browser, { isTopLevel: true }, null, null, 0);
  assert.equal(f.events.length, 0);
  for (const url of ['file:///etc/passwd', 'chrome://browser/content/browser.xhtml', 'javascript:alert(1)', 'about:config']) {
    assert.throws(() => f.adapter.navigate(f.target(), url), /UNSUPPORTED_SCHEME/);
  }
  assert.deepEqual(f.calls, []);
});

test('same-document and subframe navigation preserve document identity', () => {
  const f = fixture();
  f.win.progress.onLocationChange(f.browser, { isTopLevel: false }, null, null, 0);
  f.win.progress.onLocationChange(f.browser, { isTopLevel: true }, null, null, 1);
  assert.equal(f.target().document_generation, 1);
  f.win.progress.onLocationChange(f.browser, { isTopLevel: true }, null, null, 0);
  assert.equal(f.target().document_generation, 2);
});

test('principal change before progress events invalidates grants and forms a valid target transition', () => {
  const f = fixture();
  const original = f.target();
  f.browser.contentPrincipal.origin = 'about:certerror';
  const warning = f.target();
  assert.equal(warning.identity, 'about:certerror');
  assert.equal(warning.document_generation, original.document_generation + 1);
  assert.equal(warning.navigation_generation, original.navigation_generation + 1);
  assert.deepEqual(f.target(), warning);
  assert.throws(() => f.adapter.reload(original), /STALE_TARGET/);
  f.win.progress.onLocationChange(f.browser, { isTopLevel: true }, null, null, 0);
  assert.equal(f.target().document_generation, warning.document_generation + 1);
});

test('unsupported operations are honest; failed engine switching keeps the original tab', () => {
  const f = fixture();
  assert.equal(f.adapter.back(f.target()).status, 'unsupported');
  assert.equal(f.adapter.switchEngine(f.target(), 'chromium').status, 'unsupported');
  assert.equal(f.adapter.developerTools(f.target()).status, 'unsupported');
  assert.equal(f.adapter.tabs.size, 1);
  assert.deepEqual(f.calls, []);
  assert.equal(f.adapter.forward(f.target()).status, 'accepted');
  f.adapter.dispose();
  assert.equal(f.win.progress, null);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.adapter.tabs.size, 0);
});

test('lazy restored tabs are tracked without a principal and get a target once loaded', () => {
  const f = fixture();
  const lazy = { linkedBrowser: { browsingContext: null, contentPrincipal: undefined, currentURI: { spec: 'about:blank' } }, label: 'Restored', private: false };
  const record = f.adapter.track(lazy);
  assert.equal(f.adapter.loaded(record), false);
  assert.throws(() => f.adapter.target(record), /TARGET_NOT_LOADED/);
  f.listeners.get('TabAttrModified')({ type: 'TabAttrModified', target: lazy });
  assert.equal(f.events.length, 0);
  Object.assign(lazy.linkedBrowser, { browsingContext: { id: 7 }, contentPrincipal: { origin: 'https://example.invalid' } });
  const target = f.adapter.target(record);
  assert.equal(target.identity, 'https://example.invalid');
  assert.equal(target.native_target_id, '7');
});
