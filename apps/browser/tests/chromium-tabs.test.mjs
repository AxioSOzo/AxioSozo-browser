import test from 'node:test';
import assert from 'node:assert/strict';
import { CEFEngineAdapter, CEFHostConnection, CEF_VERSION, CHROMIUM_VERSION, BLANK_IDENTITY } from '../chrome/CEFEngineAdapter.sys.mjs';
import { CEFPresenter, keyboardRoute } from '../chrome/CEFPresenter.sys.mjs';

// Visibly controlled protocol fixtures for one shared web host. They never count
// as Chromium rendering, an engine integration, or screenshot evidence.
const token = 'cd'.repeat(32);
const timers = { setTimeout, clearTimeout };
const tick = () => new Promise(resolve => setImmediate(resolve));
const settle = async () => { for (let i = 0; i < 6; i++) await tick(); };
function packet(kind, metadata, pixels = new Uint8Array(0)) {
  const text = new TextEncoder().encode(JSON.stringify(metadata)), data = new Uint8Array(16 + text.length + pixels.length);
  const view = new DataView(data.buffer); view.setUint32(0, 0x41584346); view.setUint16(4, 1); view.setUint16(6, kind);
  view.setUint32(8, text.length); view.setUint32(12, pixels.length); data.set(text, 16); data.set(pixels, 16 + text.length);
  return data;
}
class Pipe {
  chunks = new Uint8Array(); pending = []; closed = false;
  read(n) { return new Promise((resolve, reject) => { this.pending.push({ n, resolve, reject }); this.flush(); }); }
  push(bytes) { const joined = new Uint8Array(this.chunks.length + bytes.length); joined.set(this.chunks); joined.set(bytes, this.chunks.length); this.chunks = joined; this.flush(); }
  flush() {
    while (this.pending.length) {
      const next = this.pending[0];
      if (this.chunks.length < next.n) { if (this.closed) { this.pending.shift(); next.reject(new Error('EOF')); continue; } return; }
      this.pending.shift(); const result = this.chunks.slice(0, next.n); this.chunks = this.chunks.slice(next.n); next.resolve(result.buffer);
    }
  }
  close() { this.closed = true; this.flush(); }
}

/** A native web host that serves several targets, as stream.inc does. */
function sharedHost({ capabilities = {}, holdNavigation = false } = {}) {
  const pipe = new Pipe(), writes = [], targets = new Map(), held = new Map();
  let creating = false;
  let finished, frameId = 1, nativeId = 1;
  const exit = new Promise(resolve => { finished = resolve; });
  const event = value => pipe.push(packet(1, { version: 1, ...value }));
  const frame = (tabId, target = targets.get(tabId)) => pipe.push(packet(2, { version: 1, target, frame_id: frameId++,
    width: 2, height: 2, stride: 8, device_scale: 1, format: 'BGRA8' }, new Uint8Array(16)));
  const process = { stdout: { read: count => pipe.read(count) }, wait: () => exit,
    kill: async () => { pipe.close(); finished({ exitCode: -15 }); },
    stdin: { close: async () => { pipe.close(); finished({ exitCode: 0 }); }, write: async text => {
      const command = JSON.parse(text); writes.push(command);
      if (command.method === 'hello') return event({ event: 'ready', cef: CEF_VERSION, chromium: CHROMIUM_VERSION,
        runtime_cef: CEF_VERSION.split('+')[0], runtime_chromium: CHROMIUM_VERSION, platform: 'macosarm64', sandbox_configured: true,
        engine_instance: 'host-instance', render_path: 'native-osr-bgra', capabilities: { fixture_only: false, devtools: false,
          private_mode: false, ime: false, edit: true, visibility: true, permissions: false, downloads: false, popups: false,
          accessibility: false, multi_target: true, stop: true, cursor: true, persistent_profile: true, open_in_tab: true, ...capabilities } });
      if (command.method === 'frame_ack') return;
      if (command.method === 'shutdown') {
        event({ event: 'accepted', request_id: command.request_id });
        for (const [tabId, target] of targets) { event({ event: 'closed', target }); targets.delete(tabId); }
        event({ event: 'completed', request_id: command.request_id, status: 'success' });
        finished({ exitCode: 0 }); pipe.close(); return;
      }
      const tabId = command.target.tab_id;
      if (command.method === 'create') {
        // Like stream.inc: one asynchronous creation at a time, live tab_ids unique.
        if (creating || targets.has(tabId)) return event({ event: 'error', request_id: command.request_id, code: 'invalid_lifecycle' });
        creating = true;
        event({ event: 'accepted', request_id: command.request_id });
        await new Promise(resolve => setTimeout(resolve, 5));
        creating = false;
        const target = { ...command.target, engine: 'chromium', native_target_id: String(nativeId++) };
        targets.set(tabId, target);
        event({ event: 'created', request_id: command.request_id, target });
        event({ event: 'completed', request_id: command.request_id, status: 'success' });
        event({ event: 'url', url: command.url, target }); event({ event: 'load', http_status: 0, restored_from_history: false, target });
        return frame(tabId);
      }
      if (command.method === 'close') {
        const target = targets.get(tabId); targets.delete(tabId);
        event({ event: 'accepted', request_id: command.request_id });
        event({ event: 'closed', target }); event({ event: 'completed', request_id: command.request_id, status: 'success' });
        // As on_before_close: a navigation still loading completes after the close.
        for (const request_id of held.get(tabId) ?? []) event({ event: 'completed', request_id, status: 'failed' });
        held.delete(tabId);
        return;
      }
      if (command.method === 'navigate' && holdNavigation) {
        // Accepted, then silent: the page (or a Keychain prompt) is still loading.
        held.set(tabId, [...(held.get(tabId) ?? []), command.request_id]);
        return event({ event: 'accepted', request_id: command.request_id });
      }
      if (command.method === 'navigate') {
        const target = { ...targets.get(tabId) };
        target.document_generation++; target.navigation_generation++; targets.set(tabId, target);
        event({ event: 'accepted', request_id: command.request_id });
        event({ event: 'navigation', target }); event({ event: 'url', url: command.url, target });
        event({ event: 'load', http_status: 200, restored_from_history: false, target });
        event({ event: 'completed', request_id: command.request_id, status: 'success' });
        return frame(tabId);
      }
      event({ event: 'accepted', request_id: command.request_id });
      event({ event: 'completed', request_id: command.request_id, status: 'success' });
    } } };
  const host = new CEFHostConnection(process, { token, instance: 'host-instance', identity: BLANK_IDENTITY, timers,
    deadline: 1000, browsingMode: 'web', shared: true });
  return { host, writes, targets, event, frame };
}
const pending = tabId => ({ tab_id: tabId, engine_instance: 'host-instance', identity: BLANK_IDENTITY,
  document_generation: 1, navigation_generation: 1, private_mode: false });
function attach(host, tabId) {
  const seen = { frames: 0, events: [], failures: [] };
  const adapter = new CEFEngineAdapter(host, { pendingTarget: pending(tabId), onFrame: () => { seen.frames++; },
    onEvent: value => seen.events.push(value), onFailure: error => seen.failures.push(error.message) });
  return { adapter, seen };
}

test('one web host serves several tabs, routing each event and frame to its own target', async () => {
  const f = sharedHost(); await f.host.connect();
  const first = attach(f.host, 'tab-a'), second = attach(f.host, 'tab-b');
  await first.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  await second.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  assert.equal(f.writes.filter(item => item.method === 'hello').length, 1, 'one native process');
  await first.adapter.navigate(first.adapter.target, 'https://example.com/');
  await settle();
  assert.equal(first.seen.frames, 2); assert.equal(second.seen.frames, 1);
  assert.equal(first.adapter.target.document_generation, 2); assert.equal(second.adapter.target.document_generation, 1);
  assert.ok(first.seen.events.some(value => value.url === 'https://example.com/'));
  assert.ok(!second.seen.events.some(value => value.url === 'https://example.com/'));
  // Closing one tab closes only its target; the host keeps serving the other.
  await first.adapter.close();
  assert.equal(f.writes.filter(item => item.method === 'close').length, 1);
  assert.equal(f.writes.some(item => item.method === 'shutdown'), false);
  assert.equal(first.adapter.status, 'closed'); assert.equal(second.adapter.status, 'active');
  await second.adapter.navigate(second.adapter.target, 'https://example.org/'); await settle();
  assert.equal(second.seen.frames, 2);
  await f.host.shutdown(); assert.equal(second.adapter.status, 'closed'); assert.deepEqual(second.seen.failures, []);
});

test('a document-level violation ends only that tab; framing or identity errors end the host', async () => {
  const f = sharedHost(); await f.host.connect();
  const first = attach(f.host, 'tab-a'), second = attach(f.host, 'tab-b');
  await first.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  await second.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  f.event({ event: 'url', url: 'file:///etc/passwd', target: f.targets.get('tab-a') }); await settle();
  assert.equal(first.adapter.status, 'failed'); assert.deepEqual(first.seen.failures, ['INVALID_CEF_URL']);
  assert.equal(second.adapter.status, 'active'); assert.equal(f.host.status, 'connected');
  assert.ok(f.writes.some(item => item.method === 'close' && item.target.tab_id === 'tab-a'), 'native target is closed');
  f.frame('tab-b', { ...f.targets.get('tab-b'), engine_instance: 'someone-else' }); await settle();
  assert.equal(f.host.status, 'failed'); assert.equal(second.adapter.status, 'failed');
  assert.deepEqual(second.seen.failures, ['FOREIGN_CEF_TARGET']);
});

test('a shared host requires native multi-target isolation and a persistent separate profile', async () => {
  for (const missing of [{ multi_target: false }, { persistent_profile: false }, { open_in_tab: false }]) {
    const f = sharedHost({ capabilities: missing });
    await assert.rejects(f.host.connect(), /UNVERIFIED_CEF_RUNTIME/);
  }
});

test('navigation waits for slow sites (or a first Keychain approval) without timing out the engine', async () => {
  const f = sharedHost({ holdNavigation: true }); await f.host.connect();
  const tab = attach(f.host, 'tab-a');
  await tab.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  const navigation = tab.adapter.navigate(tab.adapter.target, 'https://slow.example/');
  navigation.catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 1300)); // past the 1s action deadline
  assert.equal(tab.adapter.status, 'active'); assert.equal(f.host.status, 'connected');
  assert.deepEqual(tab.seen.failures, []);
  // Other actions still have a deadline: an unanswered focus request is a stuck target.
  const focus = tab.adapter.focus(tab.adapter.target, true);
  assert.equal((await focus).status, 'success');
  await f.host.shutdown();
});

test('Zen shortcuts stay with the browser over Chromium; text chords reach the page', () => {
  const base = { code: 'KeyA', keyCode: 65, metaKey: true, ctrlKey: false, altKey: false, shiftKey: false, buttons: 0 };
  for (const key of ['t', 'w', 'l', '1', 'f', '=', ',', 'k']) assert.equal(keyboardRoute({ ...base, key }), 'chrome', key);
  assert.equal(keyboardRoute({ ...base, key: 'ArrowLeft', code: 'ArrowLeft' }), 'cef');
  assert.equal(keyboardRoute({ ...base, key: 'Backspace', code: 'Backspace' }), 'cef');
  assert.equal(keyboardRoute({ ...base, key: 'v' }, { editing: true }), 'edit');
  assert.equal(keyboardRoute({ ...base, metaKey: false, ctrlKey: true, key: 'Tab', code: 'Tab' }), 'chrome');
  assert.equal(keyboardRoute({ ...base, metaKey: false, key: 'a' }), 'cef');
});

/** A minimal Zen window with real-shaped tab, URL bar and session hooks. */
function zenWindow() {
  const listeners = new Map(), opened = [], custom = new Map(), launched = [];
  const element = () => ({ style: {}, children: [], handlers: new Map(), attributes: new Map(), hidden: false,
    setAttribute(key, value) { this.attributes.set(key, value); }, removeAttribute(key) { this.attributes.delete(key); },
    getAttribute(key) { return this.attributes.get(key) ?? null; }, hasAttribute(key) { return this.attributes.has(key); },
    toggleAttribute(key, value) { if (value) this.attributes.set(key, ''); else this.attributes.delete(key); },
    appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); },
    addEventListener(type, handler) { this.handlers.set(type, handler); }, removeEventListener(type) { this.handlers.delete(type); },
    focus() {}, hasPointerCapture: () => false, setPointerCapture() {}, releasePointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 2, height: 2 }), getContext: () => ({ putImageData() {} }) });
  const makeTab = (id, spec) => {
    const stack = { ...element(), classList: { contains: value => value === 'browserStack' } };
    const browser = { style: { visibility: '' }, parentNode: stack, currentURI: { spec }, getBoundingClientRect: () => ({ width: 2, height: 2 }),
      loads: [], loadURI(uri) { this.loads.push(uri.spec); this.currentURI = { spec: uri.spec }; },
      browsingContext: { activeSessionHistoryEntry: { URI: { spec }, postData: null } } };
    stack.appendChild(browser);
    const tab = { ...element(), id, linkedBrowser: browser, label: id, isConnected: true };
    return tab;
  };
  const first = makeTab('first', 'https://example.com/start');
  const tabs = [first];
  const root = element();
  const win = {
    Services: { env: { get: () => '' }, io: { newURI: spec => ({ spec }) },
      scriptSecurityManager: { getSystemPrincipal: () => ({ system: true }) } },
    performance, devicePixelRatio: 1, queueMicrotask, setTimeout, clearTimeout,
    document: { hidden: false, documentElement: root, createElementNS: () => element(),
      addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) },
    ImageData: class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } },
    ResizeObserver: class { observe() {} disconnect() {} }, getComputedStyle: () => ({ position: 'static' }),
    requestAnimationFrame: callback => queueMicrotask(callback),
    gBrowser: { selectedTab: first, get selectedBrowser() { return this.selectedTab.linkedBrowser; }, tabs,
      tabContainer: { addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) },
      updateTitlebar() {}, setTabTitle(tab) { tab.label = tab.id; },
      addTrustedTab(url, options) { const tab = makeTab(`tab-${tabs.length + 1}`, url); tabs.push(tab);
        if (!options.inBackground) win.gBrowser.selectedTab = tab; return tab; } },
    SessionStore: { getCustomTabValue: (tab, key) => custom.get(`${tab.id}:${key}`) ?? '',
      setCustomTabValue: (tab, key, value) => custom.set(`${tab.id}:${key}`, value),
      deleteCustomTabValue: (tab, key) => custom.delete(`${tab.id}:${key}`) },
    BrowserUtils: { whereToOpenLink: () => 'current' },
    BrowserCommands: { back() {}, forward() {}, reload() {}, reloadSkipCache() {}, stop() {} },
    UpdateBackForwardCommands() {},
    gURLBar: { focused: false, uris: [], setURI(value) { this.uris.push(value?.uri?.spec ?? null); }, view: { close() {} } },
    openTrustedLinkIn(url, where, params) { opened.push({ url, where, params }); },
  };
  const gecko = { find: browser => ({ browser }), target: record => ({ tab_id: `gecko-${tabs.find(tab => tab.linkedBrowser === record.browser).id}`,
    engine: 'gecko', engine_instance: 'gecko', identity: 'https://example.com', private_mode: false }), resolve() {} };
  const launch = async (_win, callbacks) => {
    const adapter = { target: { tab_id: callbacks.tabId, engine: 'chromium', native_target_id: '1' }, surface: { width: 2, height: 2, device_scale: 1 },
      calls: [], allowedURL: url => /^https?:|^about:blank$/u.test(url),
      async create(url) { this.calls.push(['create', url]); callbacks.onFrame({ width: 2, height: 2, frame_id: 1 }, new ArrayBuffer(16)); return this.target; },
      async navigate(_target, url) { this.calls.push(['navigate', url]); callbacks.onEvent({ event: 'url', url }); return { status: 'success' }; },
      async back() { this.calls.push(['back']); return { status: 'success' }; },
      async reload() { this.calls.push(['reload']); return { status: 'success' }; },
      async stop() { this.calls.push(['stop']); return { status: 'success' }; },
      async visibility() { return { status: 'success' }; }, async focus() { return { status: 'success' }; },
      async resize() { return { status: 'success' }; }, async input() { return { status: 'success' }; },
      async close() { this.calls.push(['close']); } };
    launched.push({ callbacks, adapter });
    return adapter;
  };
  const select = tab => { win.gBrowser.selectedTab = tab; listeners.get('TabSelect')(); };
  return { win, gecko, launch, launched, listeners, opened, custom, tabs, first, makeTab, select };
}

test('a tab switched to Chromium releases its Firefox page, carries its address and is remembered', async () => {
  const z = zenWindow();
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web' });
  await presenter.switchToChromium(z.first); await settle();
  const { adapter } = z.launched[0];
  assert.deepEqual(adapter.calls.slice(0, 2), [['create', 'about:blank'], ['navigate', 'https://example.com/start']]);
  assert.deepEqual(z.first.linkedBrowser.loads, ['about:blank'], 'the Firefox document is released, not kept hidden');
  assert.equal(z.first.getAttribute('axiosozo-engine'), 'chromium');
  assert.equal(z.custom.get('first:axiosozo-engine'), 'chromium');
  assert.equal(z.custom.get('first:axiosozo-chromium-url'), 'https://example.com/start');
  z.launched[0].callbacks.onEvent({ event: 'url', url: 'https://example.com/next?page=2' });
  assert.equal(z.custom.get('first:axiosozo-chromium-url'), 'https://example.com/next?page=2');
  await presenter.switchToGecko();
  assert.deepEqual(z.first.linkedBrowser.loads, ['about:blank', 'https://example.com/next?page=2']);
  assert.equal(z.first.getAttribute('axiosozo-engine'), null); assert.equal(z.custom.size, 0);
  assert.deepEqual(adapter.calls.at(-1), ['close']);
  await presenter.dispose();
});

test("Zen's address bar, bookmarks and history load in the Chromium tab; Firefox-only pages return to Firefox", async () => {
  const z = zenWindow();
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web' });
  await presenter.switchToChromium(z.first); await settle();
  const { adapter } = z.launched[0];
  z.win.openTrustedLinkIn('https://duckduckgo.com/?q=zen', 'current', { targetBrowser: z.first.linkedBrowser }); await settle();
  assert.deepEqual(adapter.calls.at(-1), ['navigate', 'https://duckduckgo.com/?q=zen']);
  assert.equal(z.opened.length, 0, 'the hidden Firefox browser never loads it');
  z.win.openTrustedLinkIn('https://example.com/', 'tab', {}); await settle();
  assert.equal(z.opened.at(-1).where, 'tab', 'new-tab loads keep Zen behaviour');
  z.win.openTrustedLinkIn('https://search.example/', 'current', { targetBrowser: z.first.linkedBrowser, postData: {} }); await settle();
  assert.equal(z.opened.at(-1).url, 'https://search.example/', 'POST searches load in Firefox');
  assert.equal(presenter.engineOf(z.first), 'gecko');
  await presenter.dispose();
});

test('toolbar commands drive Chromium; the Firefox history menu is withheld', async () => {
  const z = zenWindow();
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web' });
  await presenter.switchToChromium(z.first); await settle();
  const { adapter } = z.launched[0];
  z.win.BrowserCommands.back(); z.win.BrowserCommands.reload(); z.win.BrowserCommands.stop(); await settle();
  assert.deepEqual(adapter.calls.slice(-3), [['back'], ['reload'], ['stop']]);
  await presenter.dispose();
});

test('page errors stay inside the Chromium tab instead of switching engines', async () => {
  const z = zenWindow(), failures = [];
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web', onFailure: error => failures.push(error.message) });
  await presenter.switchToChromium(z.first); await settle();
  const { callbacks, adapter } = z.launched[0], record = presenter.active;
  callbacks.onEvent({ event: 'error', code: 'certificate_error', native_code: -202 });
  callbacks.onEvent({ event: 'error', code: 'load_failed', native_code: -202 });
  assert.equal(presenter.engineOf(z.first), 'chromium');
  assert.equal(record.panelCode, 'certificate_error', 'the specific reason is kept');
  assert.equal(record.panel.panel.hidden, false);
  callbacks.onEvent({ event: 'load', http_status: 200, restored_from_history: false });
  assert.equal(record.panel.panel.hidden, true); assert.equal(record.panelCode, null);
  callbacks.onFailure(new Error('CEF_CRASH_OUTCOME_UNCERTAIN')); await settle();
  assert.equal(record.panelCode, 'engine_failed'); assert.equal(presenter.engineOf(z.first), 'chromium');
  assert.deepEqual(failures, ['CEF_CRASH_OUTCOME_UNCERTAIN']);
  // Reload starts a fresh target at the tab's current address.
  z.win.BrowserCommands.reload(); await settle();
  assert.equal(z.launched.length, 2); assert.deepEqual(adapter.calls.at(-1), ['close']);
  assert.deepEqual(z.launched[1].adapter.calls.slice(0, 2), [['create', 'about:blank'], ['navigate', 'https://example.com/start']]);
  await presenter.dispose();
});

test('links that open a new tab open a new Chromium tab; background tabs start when shown', async () => {
  const z = zenWindow();
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web' });
  await presenter.switchToChromium(z.first); await settle();
  z.launched[0].callbacks.onEvent({ event: 'open_url', url: 'https://example.com/background', background: true }); await settle();
  const background = z.tabs[1];
  assert.equal(background.getAttribute('axiosozo-engine'), 'chromium'); assert.equal(z.launched.length, 1, 'no engine until shown');
  z.select(background); await settle();
  assert.equal(z.launched.length, 2);
  assert.deepEqual(z.launched[1].adapter.calls.slice(0, 2), [['create', 'about:blank'], ['navigate', 'https://example.com/background']]);
  z.select(z.first); await settle();
  z.launched[0].callbacks.onEvent({ event: 'open_url', url: 'https://example.com/foreground', background: false }); await settle();
  assert.equal(z.win.gBrowser.selectedTab, z.tabs[2]); assert.equal(z.launched.length, 3);
  await presenter.dispose();
});

test('Chromium tabs restore as Chromium tabs from Zen session data', async () => {
  const z = zenWindow();
  z.custom.set('first:axiosozo-engine', 'chromium'); z.custom.set('first:axiosozo-chromium-url', 'https://example.com/restored');
  z.first.linkedBrowser.currentURI = { spec: 'about:blank' };
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web' }); await settle();
  assert.equal(z.launched.length, 1);
  assert.deepEqual(z.launched[0].adapter.calls.slice(0, 2), [['create', 'about:blank'], ['navigate', 'https://example.com/restored']]);
  // Closing the window keeps the engine choice for the next session.
  await presenter.dispose();
  assert.equal(z.custom.get('first:axiosozo-engine'), 'chromium');
});

test('a background tab can be moved to Chromium from the tab menu without starting it', async () => {
  const z = zenWindow();
  const second = z.makeTab('second', 'https://example.org/'); z.tabs.push(second);
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web' });
  await presenter.setTabEngine(second, 'chromium');
  assert.equal(presenter.engineOf(second), 'chromium'); assert.equal(z.launched.length, 0);
  await presenter.setTabEngine(second, 'gecko');
  assert.equal(presenter.engineOf(second), 'gecko'); assert.equal(z.custom.size, 0);
  await presenter.dispose();
});

test('closing a tab while its page loads ends only that tab, even when native answers the load afterwards', async () => {
  const f = sharedHost({ holdNavigation: true }); await f.host.connect();
  const first = attach(f.host, 'tab-a'), second = attach(f.host, 'tab-b');
  await first.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  await second.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  first.adapter.navigate(first.adapter.target, 'https://slow.example/').catch(() => {});
  await settle();
  await first.adapter.close(); await settle();
  assert.equal(f.host.status, 'connected'); assert.equal(second.adapter.status, 'active');
  assert.deepEqual(second.seen.failures, []);
  await f.host.shutdown();
});

test('tabs created at the same moment (for example two restored windows) are queued, not refused', async () => {
  const f = sharedHost(); await f.host.connect();
  const tabs = ['tab-a', 'tab-b', 'tab-c'].map(id => attach(f.host, id));
  await Promise.all(tabs.map(tab => tab.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 })));
  assert.deepEqual(tabs.map(tab => tab.adapter.status), ['active', 'active', 'active']);
  await f.host.shutdown();
});

test('a tab that fails while being created leaves no native target and can start again', async () => {
  const f = sharedHost(); await f.host.connect();
  const first = attach(f.host, 'tab-a');
  const creation = first.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  creation.catch(() => {});
  first.adapter.fail('SYNTHETIC_TARGET_FAILURE');
  await settle(); await new Promise(resolve => setTimeout(resolve, 20)); await settle();
  assert.equal(f.host.status, 'connected');
  assert.equal(f.targets.has('tab-a'), false, 'the late native target was closed');
  const again = attach(f.host, 'tab-a');
  await again.adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 });
  assert.equal(again.adapter.status, 'active');
  await f.host.shutdown();
});

test('switching back while Chromium is still launching releases the late engine target', async () => {
  const z = zenWindow();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const presenter = new CEFPresenter(z.win, z.gecko, { browsingMode: 'web',
    launch: async (...args) => { await gate; return z.launch(...args); } });
  const switching = presenter.switchToChromium(z.first); switching.catch(() => {});
  await settle();
  await presenter.switchToGecko();
  release(); await assert.rejects(switching, /ENGINE_SWITCH_CANCELLED/); await settle();
  assert.deepEqual(z.launched[0].adapter.calls.at(-1), ['close']);
  assert.equal(presenter.engineOf(z.first), 'gecko');
  await presenter.dispose();
});

test('a page that closes itself leaves a reloadable Chromium tab, not a frozen one', async () => {
  const z = zenWindow();
  const presenter = new CEFPresenter(z.win, z.gecko, { launch: z.launch, browsingMode: 'web' });
  await presenter.switchToChromium(z.first); await settle();
  z.launched[0].callbacks.onEvent({ event: 'closed' });
  assert.equal(presenter.active.panelCode, 'engine_failed');
  await presenter.dispose();
});
