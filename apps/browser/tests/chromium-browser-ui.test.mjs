import test from 'node:test';
import assert from 'node:assert/strict';
import { ChromiumBrowserUI, validateDelegationEvent, validateDelegationCommand, zoomLevel } from '../chrome/ChromiumBrowserUI.sys.mjs';
import { CEFEngineAdapter, CEFHostConnection, CEF_VERSION, CHROMIUM_VERSION, BLANK_IDENTITY } from '../chrome/CEFEngineAdapter.sys.mjs';

// Visibly controlled fixtures for the Chromium browser-UI delegation. They never
// count as Chromium rendering, Zen UI screenshots or E1/E2 evidence.
const tick = () => new Promise(resolve => setImmediate(resolve));
const settle = async () => { for (let i = 0; i < 8; i++) await tick(); };
const TARGET = { tab_id: 'tab-a', engine: 'chromium', engine_instance: 'host-instance', native_target_id: '7',
  identity: BLANK_IDENTITY, document_generation: 3, navigation_generation: 3, private_mode: false };
const NEXT = { ...TARGET, document_generation: 4, navigation_generation: 4 };

class Element {
  constructor(localName) { this.localName = localName; this.attributes = new Map(); this.children = []; this.listeners = new Map();
    this.dataset = {}; this.hidden = false; this.textContent = ''; this.className = ''; this.state = 'closed'; this.parentNode = null; }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  removeAttribute(key) { this.attributes.delete(key); }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null; }
  addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(handler); }
  dispatch(type, event = {}) { for (const handler of this.listeners.get(type) ?? []) handler({ target: this, ...event }); }
  get lastChild() { return this.children.at(-1) ?? null; }
  getBoundingClientRect() { return { left: 10, top: 20, width: 800, height: 600 }; }
  openPopupAtScreen(x, y) { this.state = 'open'; this.openedAt = [x, y]; }
  hidePopup() { this.state = 'closed'; this.dispatch('popuphidden'); }
  item(action) { return this.children.find(child => child.dataset.action === action); }
}

const Ci = { nsIPrompt: { MODAL_TYPE_TAB: 2, MODAL_TYPE_CONTENT: 3 },
  nsIFilePicker: { modeOpen: 0, modeSave: 1, modeGetFolder: 2, modeOpenMultiple: 3, returnOK: 0, returnCancel: 1, returnReplace: 2,
    filterAll: 1, filterImages: 8, filterAudio: 256, filterVideo: 512 } };

function harness({ sendFails = false, permissions = new Map() } = {}) {
  const sent = [], timers = [], dialogs = [], shown = [], opened = [], notices = [], firefox = [], navigations = [], pickers = [];
  const store = new Map(permissions), downloads = [], zoomCalls = [];
  const doc = { elements: new Map(), documentElement: new Element('html'),
    createXULElement: name => new Element(name), createElementNS: (_ns, name) => new Element(name),
    getElementById(id) { return this.elements.get(id) ?? null; } };
  const popupSet = new Element('popupset'); doc.elements.set('mainPopupSet', popupSet);
  const zoomButton = new Element('toolbarbutton'); doc.elements.set('urlbar-zoom-button', zoomButton);
  const notifications = [];
  const box = { PRIORITY_INFO_MEDIUM: 5, getNotificationWithValue: value => notifications.find(item => item.value === value) ?? null,
    removeNotification(item) { notifications.splice(notifications.indexOf(item), 1); },
    async appendNotification(value, options, buttons) { const item = { value, ...options, buttons }; notifications.push(item); return item; } };
  const record = { tab: { id: 'tab-a' }, browser: { id: 'hidden-gecko-browser' }, overlay: new Element('div'), target: TARGET,
    loading: { can_go_back: true, can_go_forward: false }, latestURL: 'https://site.example/page' };
  const other = { browser: { id: 'plain-gecko-browser' } };
  const win = {
    document: doc, mozInnerScreenX: 100, mozInnerScreenY: 50,
    setTimeout: (fn, ms) => { const timer = { fn, ms, cleared: false }; timers.push(timer); return timer; },
    clearTimeout: timer => { if (timer) timer.cleared = true; },
    gBrowser: { selectedBrowser: record.browser, getNotificationBox: () => box, isFindBarInitialized: () => false },
    FullZoom: { enlarge: browser => zoomCalls.push(['enlarge', browser]), reduce: browser => zoomCalls.push(['reduce', browser]),
      reset: browser => zoomCalls.push(['reset', browser]), setZoom: (value, browser) => zoomCalls.push(['setZoom', value, browser]),
      resetScalingZoom: () => zoomCalls.push(['resetScalingZoom']) },
    ZoomManager: { zoomValues: [0.5, 0.9, 1, 1.1, 1.2, 1.5, 2] },
    addEventListener() {}, removeEventListener() {},
  };
  const originalFullZoom = { ...win.FullZoom };
  const services = {
    Ci, now: () => harness.now,
    Services: { prefs: { getBoolPref: (_name, fallback) => fallback, getIntPref: (_name, fallback) => fallback },
      strings: { createBundle() { throw new Error('no bundles in node'); } },
      scriptSecurityManager: { createContentPrincipal: uri => ({ origin: uri.spec }) }, io: { newURI: spec => ({ spec }) } },
    openDialog(_record, args) {
      let resolve; const closed = new Promise(yes => { resolve = yes; });
      const dialog = { args, aborted: false, close: result => resolve({ ...args, ...result }), abort() { this.aborted = true; resolve({ ...args, ok: false, promptAborted: true, buttonNumClicked: 1 }); } };
      dialogs.push(dialog); return { closed, abort: () => dialog.abort() };
    },
    popupNotifications: { show(browser, id, message, anchor, main, secondary, options) {
      const notification = { browser, id, message, anchor, main, secondary, options, removed: false,
        remove() { this.removed = true; options.eventCallback?.('removed'); } };
      shown.push(notification); return notification;
    } },
    permissionStore: { get: async (origin, name) => store.get(`${origin}|${name}`) ?? null,
      set: async (origin, name, decision) => { store.set(`${origin}|${name}`, decision); } },
    filePicker: () => { const picker = { filters: [], init(...args) { this.init = args; }, appendFilter(...args) { this.filters.push(args); },
      appendFilters(value) { this.filters.push([value]); }, open(callback) { this.callback = callback; } }; pickers.push(picker); return picker; },
    clipboard: { copyString: value => opened.push(['clipboard', value]) },
    search: { name: 'DuckDuckGo', submission: terms => ({ url: `https://duckduckgo.com/?q=${encodeURIComponent(terms)}`, postData: null }) },
    downloadTarget: async name => `/Volumes/AxioSozoBuild/test-downloads/${name}`,
    registerDownload: async options => { const saver = { options, events: [], update(event) { this.events.push(event); }, detach() { this.detached = true; } };
      downloads.push(saver); return saver; },
  };
  const send = (rec, method, fields, target) => {
    sent.push({ method, fields, target });
    return sendFails ? Promise.reject(new Error('STALE_CEF_TARGET')) : Promise.resolve({ status: 'success' });
  };
  const ui = new ChromiumBrowserUI(win, { send, target: rec => rec.target, records: () => [record], services,
    hooks: { openTab: (rec, url, background) => opened.push(['tab', url, background]), openInFirefox: rec => firefox.push(rec),
      navigate: (rec, action) => navigations.push(action), contentElement: rec => rec.overlay, currentURL: rec => rec.latestURL,
      notice: (rec, message) => notices.push(message), focusContent: () => {} } });
  const prompt = (kind, details, id = 'prompt-1', target = record.target) =>
    ui.handle(record, validateDelegationEvent({ event: 'prompt', version: 1, target, prompt_id: id, kind, details, timeout_ms: 120000 }));
  return { ui, win, record, other, sent, timers, dialogs, shown, opened, notices, firefox, navigations, pickers, store, downloads,
    zoomCalls, notifications, popupSet, zoomButton, prompt, originalFullZoom };
}
harness.now = 1_000_000;

const menuDetails = (overrides = {}) => ({ x: 40, y: 30, type_flags: 1, link_url: '', source_url: '', frame_url: '', selection_text: '',
  link_text: '', editable: false, edit_flags: 0, media_type: 'none', media_flags: 0, misspelled_word: '', suggestions: [], spellcheck: false, ...overrides });
const dialogDetails = (overrides = {}) => ({ dialog_type: 'alert', origin_url: 'https://site.example/', message: 'Hello', default_text: '', ...overrides });

test('context menu is a Zen menupopup at the pointer; page actions stay in Chromium, the reply is single use', async () => {
  const h = harness();
  h.prompt('context_menu', menuDetails({ link_url: 'https://example.org/next', link_text: 'next page', selection_text: 'selected words', type_flags: 21 }));
  await settle();
  const menu = h.popupSet.children[0];
  assert.equal(menu.localName, 'menupopup'); assert.deepEqual(menu.openedAt, [150, 100], 'screen point = content origin + CEF x/y');
  assert.equal(menu.item('open_link_new_tab').getAttribute('data-l10n-id'), 'main-context-menu-open-link-new-tab');
  assert.equal(menu.item('copy').getAttribute('data-l10n-id'), 'text-action-copy');
  assert.equal(menu.item('inspect').getAttribute('disabled'), 'true', 'devtools are unsupported, not faked');
  assert.match(menu.item('search').getAttribute('label'), /DuckDuckGo/u);
  menu.item('copy').dispatch('command'); menu.hidePopup(); await settle();
  assert.deepEqual(h.sent, [{ method: 'context_menu_command', fields: { prompt_id: 'prompt-1', command: 'copy', index: 0 }, target: TARGET }]);
  menu.item('save_link').dispatch('command'); await settle();
  assert.equal(h.sent.length, 1, 'a second choice for the same prompt sends nothing');
});

test('local menu actions close the native menu with dismiss; Open Link in New Tab opens Chromium; hiding dismisses', async () => {
  const h = harness();
  h.prompt('context_menu', menuDetails({ link_url: 'https://example.org/next', type_flags: 5 }));
  await settle();
  h.popupSet.children[0].item('open_link_new_tab').dispatch('command'); await settle();
  assert.deepEqual(h.sent.map(item => item.fields.command), ['dismiss']);
  assert.deepEqual(h.opened, [['tab', 'https://example.org/next', true]]);
  h.prompt('context_menu', menuDetails(), 'prompt-2'); await settle();
  const page = h.popupSet.children.at(-1);
  assert.equal(page.item('back').getAttribute('data-l10n-id'), 'main-context-menu-back-mac');
  assert.equal(page.item('forward').getAttribute('disabled'), 'true');
  page.item('back').dispatch('command'); await settle();
  assert.deepEqual(h.navigations, ['back']);
  h.prompt('context_menu', menuDetails({ editable: true, edit_flags: 8 | 16, misspelled_word: 'teh', suggestions: ['the', 'ten'] }), 'prompt-3'); await settle();
  const editable = h.popupSet.children.at(-1);
  assert.equal(editable.item('cut').getAttribute('disabled'), 'true'); assert.equal(editable.item('paste').getAttribute('disabled'), null);
  editable.children.filter(child => child.dataset.action === 'spelling')[1].dispatch('command'); await settle();
  assert.deepEqual(h.sent.at(-1).fields, { prompt_id: 'prompt-3', command: 'spelling', index: 1 });
  h.prompt('context_menu', menuDetails(), 'prompt-4'); await settle();
  h.popupSet.children.at(-1).hidePopup(); await settle();
  assert.deepEqual(h.sent.at(-1).fields, { prompt_id: 'prompt-4', command: 'dismiss', index: 0 });
});

test('host timeout or navigation closes the menu without a reply; a replayed prompt_id opens nothing', async () => {
  const h = harness();
  h.prompt('context_menu', menuDetails()); await settle();
  const menu = h.popupSet.children[0];
  h.prompt('context_menu', menuDetails()); await settle();
  assert.equal(h.popupSet.children.length, 1, 'duplicate prompt_id is ignored');
  h.ui.handle(h.record, { event: 'prompt_closed', prompt_id: 'prompt-1', reason: 'timeout', target: TARGET });
  assert.equal(menu.parentNode, null); assert.equal(h.sent.length, 0);
  h.prompt('context_menu', menuDetails(), 'prompt-2'); await settle();
  h.ui.handle(h.record, { event: 'navigation', target: NEXT });
  assert.equal(h.popupSet.children.length, 0); assert.equal(h.sent.length, 0);
});

test('local backstop timer closes a prompt when the host cannot report its timeout', async () => {
  const h = harness();
  h.prompt('dialog', dialogDetails()); await settle();
  const timer = h.timers.find(item => item.ms === 121000);
  assert.ok(timer); timer.fn(); await settle();
  assert.equal(h.dialogs[0].aborted, true); assert.equal(h.sent.length, 0, 'the host answers its own timeout (deny)');
});

test('alert/confirm/prompt use Firefox content-modal prompts with the Chromium origin; results reply once', async () => {
  const h = harness();
  h.prompt('dialog', dialogDetails({ dialog_type: 'prompt', message: 'Name?', default_text: 'Wout' })); await settle();
  const dialog = h.dialogs[0];
  assert.equal(dialog.args.promptType, 'prompt'); assert.equal(dialog.args.modalType, 3, 'MODAL_TYPE_CONTENT like Gecko content prompts');
  assert.equal(dialog.args.title, 'The page at site.example says:'); assert.equal(dialog.args.value, 'Wout');
  assert.deepEqual(dialog.args.promptPrincipal, { origin: 'https://site.example' });
  dialog.close({ ok: true, value: 'Ada' }); await settle();
  assert.deepEqual(h.sent[0], { method: 'dialog_reply', fields: { prompt_id: 'prompt-1', accept: true, text: 'Ada' }, target: TARGET });
  h.prompt('dialog', dialogDetails({ dialog_type: 'confirm' }), 'prompt-2'); await settle();
  harness.now += 60000;
  h.dialogs[1].close({ ok: false }); await settle();
  assert.deepEqual(h.sent[1].fields, { prompt_id: 'prompt-2', accept: false, text: '' });
});

test("Firefox's abuse protection: rapid dialogs offer to block; once blocked they are refused unseen until navigation", async () => {
  const h = harness();
  h.prompt('dialog', dialogDetails()); await settle();
  h.dialogs[0].close({ ok: true }); await settle();
  harness.now += 1000;
  h.prompt('dialog', dialogDetails(), 'prompt-2'); await settle();
  assert.equal(h.dialogs[1].args.promptType, 'alertCheck');
  assert.equal(h.dialogs[1].args.checkLabel, 'Don’t allow site.example to prompt you again');
  h.dialogs[1].close({ ok: true, checked: true }); await settle();
  h.prompt('dialog', dialogDetails(), 'prompt-3'); await settle();
  assert.equal(h.dialogs.length, 2, 'no third dialog is shown');
  assert.deepEqual(h.sent.at(-1).fields, { prompt_id: 'prompt-3', accept: false, text: '' });
  h.ui.handle(h.record, { event: 'navigation', target: NEXT }); h.record.target = NEXT;
  h.prompt('dialog', dialogDetails(), 'prompt-4', NEXT); await settle();
  assert.equal(h.dialogs.length, 3, 'a new document may show dialogs again');
  harness.now += 60000;
});

test('beforeunload uses Firefox strings; Leave accepts, Stay or abort keeps the page', async () => {
  const h = harness();
  h.prompt('before_unload', { dialog_type: 'beforeunload', is_reload: false }); await settle();
  assert.equal(h.dialogs[0].args.promptType, 'confirmEx'); assert.equal(h.dialogs[0].args.button0Label, 'Leave page');
  h.dialogs[0].close({ buttonNumClicked: 0 }); await settle();
  assert.deepEqual(h.sent[0].fields, { prompt_id: 'prompt-1', accept: true, text: '' });
  h.prompt('before_unload', { dialog_type: 'beforeunload', is_reload: true }, 'prompt-2'); await settle();
  h.dialogs[1].close({ buttonNumClicked: 1 }); await settle();
  assert.deepEqual(h.sent[1].fields, { prompt_id: 'prompt-2', accept: false, text: '' });
});

test('production tab dialog path: Firefox PromptUtils contract (propBagToObject(bag, obj) returns nothing)', async () => {
  // E1 2026-09-30: the alert closed in Zen but no dialog_reply was ever sent,
  // because the one-argument propBagToObject threw inside closedPromise.then().
  // These fakes follow toolkit/modules/PromptUtils.sys.mjs and commonDialog.js.
  const PromptUtils = {
    objectToPropBag(obj) { const map = new Map(Object.entries(obj)); return { map,
      getProperty(name) { if (!map.has(name)) throw new Error('NS_ERROR_FAILURE'); return map.get(name); },
      setProperty(name, value) { map.set(name, value); } }; },
    propBagToObject(bag, obj) { for (const name in obj) obj[name] = bag.getProperty(name); },
  };
  const opened = [];
  const record = { tab: { id: 'tab-a' }, browser: { id: 'hidden-gecko-browser' }, overlay: new Element('div'), target: TARGET };
  const win = { document: { elements: new Map(), getElementById() { return null; } }, setTimeout: () => ({}), clearTimeout() {},
    addEventListener() {}, removeEventListener() {},
    gBrowser: { selectedBrowser: record.browser, getTabDialogBox: browser => ({ open(url, options, bag) {
      let close; const closedPromise = new Promise(resolve => { close = resolve; });
      const dialog = { aborted: false, abort() { this.aborted = true; bag.setProperty('promptAborted', true); close(); } };
      opened.push({ browser, url, options, bag, accept(fields) { for (const [key, value] of Object.entries(fields)) bag.setProperty(key, value); close(); } });
      return { dialog, closedPromise };
    } }) } };
  const sent = [];
  const ui = new ChromiumBrowserUI(win, { send: (_rec, method, fields, target) => { sent.push({ method, fields, target }); return Promise.resolve({ status: 'success' }); },
    target: rec => rec.target, records: () => [record],
    services: { Ci, now: () => harness.now, importModule: url => (url.endsWith('PromptUtils.sys.mjs') ? { PromptUtils } : null),
      Services: { prefs: { getBoolPref: (_n, fallback) => fallback, getIntPref: (_n, fallback) => fallback },
        strings: { createBundle() { throw new Error('no bundles in node'); } },
        scriptSecurityManager: { createContentPrincipal: uri => ({ origin: uri.spec }) }, io: { newURI: spec => ({ spec }) } } } });
  const ask = (kind, details, id) => ui.handle(record, validateDelegationEvent({ event: 'prompt', version: 1, target: TARGET, prompt_id: id, kind, details, timeout_ms: 120000 }));
  ask('dialog', dialogDetails(), 'prompt-1'); await settle();
  assert.equal(opened[0].url, 'chrome://global/content/commonDialog.xhtml');
  assert.equal(opened[0].browser, record.browser);
  assert.equal(opened[0].bag.getProperty('ok'), false, 'the result keys are in the bag with safe defaults');
  opened[0].accept({ ok: true }); await settle();
  assert.deepEqual(sent, [{ method: 'dialog_reply', fields: { prompt_id: 'prompt-1', accept: true, text: '' }, target: TARGET }]);
  harness.now += 60000;
  ask('dialog', dialogDetails({ dialog_type: 'prompt', default_text: 'x' }), 'prompt-2'); await settle();
  opened[1].accept({ ok: true, value: 'typed' }); await settle();
  assert.deepEqual(sent[1].fields, { prompt_id: 'prompt-2', accept: true, text: 'typed' });
  harness.now += 60000;
  ask('auth', { origin: 'https://site.example', host: 'site.example', port: 443, realm: 'r', scheme: 'basic', is_proxy: false }, 'prompt-3'); await settle();
  opened[2].accept({ ok: true, user: 'u', pass: 'p' }); await settle();
  assert.deepEqual(sent[2].fields, { prompt_id: 'prompt-3', accept: true, username: 'u', password: 'p' });
});

test('a dialog for a navigated-away document is aborted and its late result is never sent', async () => {
  const h = harness();
  h.prompt('dialog', dialogDetails({ dialog_type: 'confirm' })); await settle();
  h.ui.handle(h.record, { event: 'navigation', target: NEXT });
  assert.equal(h.dialogs[0].aborted, true);
  await settle(); assert.equal(h.sent.length, 0);
});

test('a reply rejected as stale by the adapter leaves no UI behind', async () => {
  const h = harness({ sendFails: true });
  h.prompt('dialog', dialogDetails()); await settle();
  h.dialogs[0].close({ ok: true }); await settle();
  assert.equal(h.sent.length, 1);
  h.dialogs[0].close({ ok: true }); await settle();
  assert.equal(h.sent.length, 1);
});

test('permissions: Firefox doorhanger for the Chromium origin, decisions remembered in a Chromium-only store', async () => {
  const h = harness();
  h.prompt('permission', { origin: 'https://maps.example', permissions: ['geolocation'] }); await settle();
  const doorhanger = h.shown[0];
  assert.equal(doorhanger.anchor, 'geo-notification-icon'); assert.equal(doorhanger.browser, h.record.browser);
  assert.equal(doorhanger.message, 'Allow <> to access your location?'); assert.equal(doorhanger.options.name, 'maps.example');
  doorhanger.main.callback({ checkboxChecked: true }); doorhanger.remove(); await settle();
  assert.deepEqual(h.sent.map(item => item.fields), [{ prompt_id: 'prompt-1', decision: 'allow' }]);
  assert.equal(h.store.get('https://maps.example|geolocation'), 'allow');
  h.prompt('permission', { origin: 'https://maps.example', permissions: ['geolocation'] }, 'prompt-2'); await settle();
  assert.equal(h.shown.length, 1, 'remembered: no second doorhanger');
  assert.deepEqual(h.sent.at(-1).fields, { prompt_id: 'prompt-2', decision: 'allow' });
  h.prompt('permission', { origin: 'https://other.example', permissions: ['notifications'] }, 'prompt-3'); await settle();
  h.shown[1].secondary[0].callback({ checkboxChecked: false }); await settle();
  assert.deepEqual(h.sent.at(-1).fields, { prompt_id: 'prompt-3', decision: 'deny' });
  assert.equal(h.store.has('https://other.example|notifications'), false, 'unchecked: not remembered');
  h.prompt('permission', { origin: 'https://other.example', permissions: ['clipboard'] }, 'prompt-4'); await settle();
  h.shown[2].remove(); await settle();
  assert.deepEqual(h.sent.at(-1).fields, { prompt_id: 'prompt-4', decision: 'dismiss' });
  h.prompt('permission', { origin: 'https://other.example', permissions: ['clipboard'] }, 'prompt-5'); await settle();
  h.ui.handle(h.record, { event: 'prompt_closed', prompt_id: 'prompt-5', reason: 'withdrawn', target: TARGET });
  assert.equal(h.shown[3].removed, true); assert.equal(h.sent.length, 4, 'a withdrawn request is not answered by Zen');
});

test('camera/microphone are refused natively with a clear notice', () => {
  const h = harness();
  assert.equal(h.ui.handle(h.record, { event: 'error', code: 'media_capture_unavailable', target: TARGET }), true);
  assert.match(h.notices[0], /Camera, microphone/u);
});

test('file picker: nsIFilePicker in the Zen window; only picked paths return; late results are discarded', async () => {
  const h = harness();
  h.prompt('file_dialog', { mode: 'open_multiple', title: '', default_name: '', filters: [{ filter: 'image/*', extensions: ['.png', '.jpg'], description: 'Images' }] });
  await settle();
  const picker = h.pickers[0];
  assert.equal(picker.init[2], Ci.nsIFilePicker.modeOpenMultiple);
  assert.deepEqual(picker.filters, [['Images', '*.png;*.jpg'], [Ci.nsIFilePicker.filterAll]]);
  picker.files = [{ path: '/Users/test/a.png' }, { path: '/Users/test/b.jpg' }];
  picker.callback(Ci.nsIFilePicker.returnOK); await settle();
  assert.deepEqual(h.sent[0].fields, { prompt_id: 'prompt-1', paths: ['/Users/test/a.png', '/Users/test/b.jpg'] });
  h.prompt('file_dialog', { mode: 'open', title: 'Upload', default_name: '', filters: [] }, 'prompt-2'); await settle();
  h.pickers[1].callback(Ci.nsIFilePicker.returnCancel); await settle();
  assert.deepEqual(h.sent[1].fields, { prompt_id: 'prompt-2', paths: [] });
  h.prompt('file_dialog', { mode: 'save', title: '', default_name: 'report.csv', filters: [] }, 'prompt-3'); await settle();
  assert.equal(h.pickers[2].defaultString, 'report.csv');
  h.ui.handle(h.record, { event: 'navigation', target: NEXT });
  h.pickers[2].file = { path: '/Users/test/report.csv' }; h.pickers[2].callback(Ci.nsIFilePicker.returnOK); await settle();
  assert.equal(h.sent.length, 2, 'a picker that outlived its page sends nothing');
});

test('downloads: saved under Firefox download settings, shown in the downloads panel, controlled by target', async () => {
  const h = harness();
  h.prompt('download', { download_id: 42, suggested_name: 'report.pdf', url: 'https://files.example/report.pdf', mime_type: 'application/pdf', total_bytes: 2048 });
  await settle();
  assert.deepEqual(h.sent[0].fields, { prompt_id: 'prompt-1', path: '/Volumes/AxioSozoBuild/test-downloads/report.pdf' });
  const saver = h.downloads[0];
  assert.equal(saver.options.contentType, 'application/pdf');
  // A navigation does not cancel an accepted download.
  h.ui.handle(h.record, { event: 'navigation', target: NEXT }); h.record.target = NEXT;
  h.ui.handle(h.record, validateDelegationEvent({ event: 'download_updated', download_id: 42, state: 'in_progress', received_bytes: 1024, total_bytes: 2048, speed: 10, paused: false }));
  assert.equal(saver.events[0].received_bytes, 1024);
  await saver.options.control('pause');
  assert.deepEqual(h.sent.at(-1), { method: 'download_control', fields: { download_id: 42, action: 'pause' }, target: NEXT });
  h.ui.forget(h.record); assert.equal(saver.detached, true);
});

test('Firefox Download integration: pause keeps the native download, resume continues it, cancel removes it', async () => {
  const h = harness();
  const controls = [], added = [];
  function DownloadSaver() {}
  class DownloadError extends Error { constructor(properties) { super(properties?.message); } }
  function Download() {}
  Download.prototype.start = function() { this.attempt = this.saver.execute((current, total, partial) => { this.progress = [current, total, partial]; }); return this.attempt; };
  const modules = {
    'resource://gre/modules/Downloads.sys.mjs': { Downloads: { PUBLIC: 'public', getList: async () => ({ add: async download => added.push(download) }) } },
    'resource://gre/modules/DownloadCore.sys.mjs': { Download, DownloadSaver, DownloadError,
      DownloadSource: { fromSerializable: value => ({ ...value }) }, DownloadTarget: { fromSerializable: value => ({ ...value }) } },
  };
  const ui = new ChromiumBrowserUI(h.win, { send: (_record, method, fields) => { controls.push([method, fields]); return Promise.resolve({ status: 'success' }); },
    target: record => record.target, services: { Ci, importModule: url => modules[url], downloadTarget: async () => '/tmp-not-used/x.bin',
      Services: { prefs: { getBoolPref: (_n, f) => f, getIntPref: (_n, f) => f } } } });
  ui.handle(h.record, { event: 'prompt', target: TARGET, prompt_id: 'prompt-9', kind: 'download', timeout_ms: 600000,
    details: { download_id: 5, suggested_name: 'x.bin', url: 'https://files.example/x.bin', mime_type: '', total_bytes: -1 } });
  await settle();
  const download = added[0];
  assert.equal(download.saver.toSerializable(), null, 'never persisted or re-fetched by Firefox');
  ui.handle(h.record, { event: 'download_updated', download_id: 5, state: 'in_progress', received_bytes: 10, total_bytes: -1, speed: 1, paused: false });
  assert.deepEqual(download.progress, [10, -1, true]);
  download.saver.cancel(); await assert.rejects(download.attempt);
  assert.deepEqual(controls.at(-1), ['download_control', { download_id: 5, action: 'pause' }]);
  const resumed = download.start(); await settle();
  assert.deepEqual(controls.at(-1), ['download_control', { download_id: 5, action: 'resume' }]);
  ui.handle(h.record, { event: 'download_updated', download_id: 5, state: 'complete', received_bytes: 20, total_bytes: 20, speed: 0, paused: false });
  await resumed;
  assert.deepEqual(download.progress, [20, 20, false]);
  await download.saver.removeData();
  assert.notDeepEqual(controls.at(-1)[1].action, 'cancel', 'a finished download is never cancelled');
  ui.dispose();
});

test('HTTP auth uses Firefox’s tab-modal login prompt; credentials go only to the prompt that asked', async () => {
  const h = harness();
  h.prompt('auth', { origin: 'https://intranet.example', host: 'intranet.example', port: 443, is_proxy: false, realm: 'Staff', scheme: 'basic' });
  await settle();
  const dialog = h.dialogs[0];
  assert.equal(dialog.args.promptType, 'promptUserAndPass'); assert.equal(dialog.args.modalType, 2);
  assert.equal(dialog.args.authOrigin, 'https://intranet.example'); assert.equal(dialog.args.user, '');
  dialog.close({ ok: true, user: 'ada', pass: 'synthetic-secret' }); await settle();
  assert.deepEqual(h.sent[0].fields, { prompt_id: 'prompt-1', accept: true, username: 'ada', password: 'synthetic-secret' });
  h.prompt('auth', { origin: 'http://proxy.example:8080', host: 'proxy.example', port: 8080, is_proxy: true, realm: 'r', scheme: 'basic' }, 'prompt-2');
  await settle();
  assert.equal(h.dialogs[1].args.isInsecureAuth, true);
  h.dialogs[1].close({ ok: false, user: 'x', pass: 'y' }); await settle();
  assert.deepEqual(h.sent[1].fields, { prompt_id: 'prompt-2', accept: false, username: '', password: '' });
});

test('certificate errors show Firefox’s certerror content without any bypass; the follow-up load failure is absorbed', () => {
  const h = harness();
  assert.equal(h.ui.handle(h.record, { event: 'error', code: 'certificate_error', native_code: -201, target: TARGET }), true);
  const panel = h.record.overlay.children[0];
  assert.match(panel.className, /axiosozo-cef-certerror/u);
  assert.match(panel.children[1].textContent, /site\.example/u); assert.match(panel.children[2].textContent, /NET::ERR_CERT_DATE_INVALID/u);
  const buttons = panel.children[3].children;
  assert.equal(buttons.length, 2, 'Go back and Open in Firefox only: no exception button');
  assert.equal(h.ui.handle(h.record, { event: 'error', code: 'load_failed', native_code: -201, target: TARGET }), true);
  buttons[0].dispatch('click'); buttons[1].dispatch('click');
  assert.deepEqual(h.navigations, ['back']); assert.equal(h.firefox.length, 1);
  h.ui.handle(h.record, { event: 'load', http_status: 200, restored_from_history: false, target: TARGET });
  assert.equal(panel.hidden, true);
});

test("blocked pop-ups use Firefox's notification bar; allowing the site opens them as Chromium tabs", async () => {
  const h = harness();
  h.ui.handle(h.record, { event: 'popup_blocked', url: 'https://ads.example/one', target: TARGET }); await settle();
  h.ui.handle(h.record, { event: 'popup_blocked', url: 'https://ads.example/two', target: TARGET }); await settle();
  assert.equal(h.notifications.length, 1);
  assert.deepEqual(h.notifications[0].label, { 'l10n-id': 'popup-warning-message', 'l10n-args': { popupCount: 2 } });
  assert.equal(h.opened.length, 0, 'nothing opens unasked');
  h.notifications[0].buttons[0].callback(); await settle();
  assert.equal(h.store.get('https://site.example|popups'), 'allow');
  assert.deepEqual(h.opened.map(item => item[1]), ['https://ads.example/one', 'https://ads.example/two']);
  h.ui.handle(h.record, { event: 'popup_blocked', url: 'https://ads.example/three', target: TARGET }); await settle();
  assert.equal(h.opened.at(-1)[1], 'https://ads.example/three');
  h.ui.handle(h.record, { event: 'navigation', target: NEXT });
  assert.equal(h.notifications.length, 0);
});

test("Zen's findbar drives Chromium find through the tab's browser.finder and restores Firefox's finder", async () => {
  const h = harness();
  const findbar = { results: [], counts: [], onFindResult(data) { this.results.push(data); }, onMatchesCountResult(data) { this.counts.push(data); } };
  h.ui.handle(h.record, { event: 'title', title: 'x', target: TARGET });
  const finder = h.record.browser.finder;
  finder.addResultListener(findbar);
  finder.caseSensitive = true; finder.fastFind('zen'); await settle();
  assert.deepEqual(h.sent[0], { method: 'find', fields: { text: 'zen', forward: true, match_case: true, find_next: false }, target: TARGET });
  h.ui.handle(h.record, validateDelegationEvent({ event: 'find_result', identifier: 1, count: 3, active: 1, final: false }));
  assert.equal(findbar.results.length, 0, 'interim results are not reported');
  h.ui.handle(h.record, { event: 'find_result', identifier: 1, count: 3, active: 3, final: true });
  finder.findAgain('zen', false); await settle();
  h.ui.handle(h.record, { event: 'find_result', identifier: 2, count: 3, active: 1, final: true });
  assert.deepEqual(findbar.results.map(item => item.result), [0, 2], 'found, then wrapped');
  assert.deepEqual(findbar.counts.at(-1), { total: 3, current: 1, limit: 1000 });
  finder.fastFind('missing'); await settle();
  h.ui.handle(h.record, { event: 'find_result', identifier: 3, count: 0, active: 0, final: true });
  assert.equal(findbar.results.at(-1).result, 1);
  finder.onFindbarClose(); await settle();
  assert.deepEqual(h.sent.at(-1).fields, { clear_selection: false });
  h.ui.forget(h.record);
  assert.equal(Object.hasOwn(h.record.browser, 'finder'), false, "Firefox's own finder is back");
});

test("Firefox zoom commands zoom a Chromium tab and its URL-bar indicator; Gecko tabs keep Firefox's zoom", async () => {
  const h = harness();
  h.ui.handle(h.record, { event: 'title', title: 'x', target: TARGET });
  h.win.FullZoom.enlarge(h.record.browser); await settle();
  assert.equal(h.sent[0].method, 'zoom'); assert.ok(Math.abs(h.sent[0].fields.level - zoomLevel(1.1)) < 1e-9);
  assert.equal(h.zoomButton.hidden, false); assert.equal(h.zoomButton.getAttribute('label'), '110%');
  h.win.FullZoom.reduce(); h.win.FullZoom.reduce(); await settle();
  assert.ok(Math.abs(h.sent.at(-1).fields.level - zoomLevel(0.9)) < 1e-9);
  h.win.FullZoom.reset(h.record.browser); await settle();
  assert.equal(h.sent.at(-1).fields.level, 0); assert.equal(h.zoomButton.hidden, true);
  h.win.FullZoom.enlarge(h.other.browser);
  assert.deepEqual(h.zoomCalls, [['enlarge', h.other.browser]], 'a Gecko tab uses Firefox zoom');
  h.win.FullZoom.enlarge(h.record.browser); await settle();
  h.ui.handle(h.record, { event: 'load', http_status: 200, restored_from_history: false, target: TARGET }); await settle();
  assert.equal(h.sent.filter(item => item.method === 'zoom').length, 6, 'the level is reapplied after each load');
  h.ui.dispose();
  assert.equal(h.win.FullZoom.enlarge, h.originalFullZoom.enlarge, 'dispose restores FullZoom');
});

test('event schema rejects malformed, oversized and unexpected delegation payloads', () => {
  const ok = { event: 'prompt', prompt_id: 'prompt-1', kind: 'dialog', details: dialogDetails(), timeout_ms: 1000 };
  assert.doesNotThrow(() => validateDelegationEvent(ok));
  for (const bad of [
    { ...ok, prompt_id: 'prompt-0' }, { ...ok, prompt_id: 'p-1' }, { ...ok, kind: 'devtools' }, { ...ok, timeout_ms: 999 },
    { ...ok, timeout_ms: 600001 }, { ...ok, details: { ...dialogDetails(), message: 'x'.repeat(3002) } },
    { ...ok, details: { ...dialogDetails(), extra: 1 } }, { ...ok, details: dialogDetails({ origin_url: 'file:///etc/passwd' }) },
    { ...ok, kind: 'permission', details: { origin: 'https://a.example/path', permissions: ['geolocation'] } },
    { ...ok, kind: 'permission', details: { origin: 'https://a.example', permissions: ['camera'] } },
    { ...ok, kind: 'permission', details: { origin: 'https://a.example', permissions: [] } },
    { ...ok, kind: 'file_dialog', details: { mode: 'open', title: '', default_name: '../../x', filters: [] } },
    { ...ok, kind: 'download', details: { download_id: 1, suggested_name: 'a/b', url: '', mime_type: '', total_bytes: 1 } },
    { ...ok, kind: 'context_menu', details: menuDetails({ link_url: 'javascript:alert(1)' }) },
    { ...ok, kind: 'context_menu', details: menuDetails({ suggestions: ['a', 'b', 'c', 'd', 'e', 'f'] }) },
    { event: 'prompt_closed', prompt_id: 'prompt-1', reason: 'whatever' },
    { event: 'popup_blocked', url: 'chrome://browser/content/browser.xhtml' },
    { event: 'download_updated', download_id: 1, state: 'done', received_bytes: 0, total_bytes: 0, speed: 0, paused: false },
    { event: 'find_result', identifier: 1, count: -1, active: 0, final: true },
  ]) assert.throws(() => validateDelegationEvent(bad), /INVALID_CEF_PROMPT/u, JSON.stringify(bad).slice(0, 120));
  assert.throws(() => validateDelegationCommand('dialog_reply', { prompt_id: 'prompt-1', accept: 'yes', text: '' }), /INVALID_CEF_REPLY/u);
  assert.throws(() => validateDelegationCommand('file_dialog_reply', { prompt_id: 'prompt-1', paths: ['relative/path'] }), /INVALID_CEF_REPLY/u);
  assert.throws(() => validateDelegationCommand('context_menu_command', { prompt_id: 'prompt-1', command: 'execute_script', index: 0 }), /INVALID_CEF_REPLY/u);
  assert.throws(() => validateDelegationCommand('shutdown', {}), /INVALID_CEF_REPLY/u);
});

// ---- adapter + shared host protocol -------------------------------------------------
function packet(metadata, pixels = new Uint8Array(0)) {
  const text = new TextEncoder().encode(JSON.stringify(metadata)), data = new Uint8Array(16 + text.length + pixels.length);
  const view = new DataView(data.buffer); view.setUint32(0, 0x41584346); view.setUint16(4, 1); view.setUint16(6, pixels.length ? 2 : 1);
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
/** A shared web host that issues prompts and enforces single-use replies like stream.inc. */
function promptHost() {
  const pipe = new Pipe(), writes = [], prompts = new Map(), targets = new Map();
  let finished; const exit = new Promise(resolve => { finished = resolve; });
  const event = value => pipe.push(packet({ version: 1, ...value }));
  const process = { stdout: { read: count => pipe.read(count) }, wait: () => exit, kill: async () => { pipe.close(); finished({ exitCode: -15 }); },
    stdin: { close: async () => { pipe.close(); finished({ exitCode: 0 }); }, write: async text => {
      const command = JSON.parse(text); writes.push(command);
      if (command.method === 'hello') return event({ event: 'ready', cef: CEF_VERSION, chromium: CHROMIUM_VERSION, runtime_cef: CEF_VERSION.split('+')[0],
        runtime_chromium: CHROMIUM_VERSION, platform: 'macosarm64', sandbox_configured: true, engine_instance: 'host-instance', render_path: 'native-osr-bgra',
        capabilities: { fixture_only: false, devtools: false, private_mode: false, ime: false, edit: true, visibility: true, permissions: true,
          downloads: true, popups: false, accessibility: false, multi_target: true, stop: true, cursor: true, persistent_profile: true, open_in_tab: true,
          context_menu: true, javascript_dialogs: true, file_dialogs: true, http_auth: true, find: true, zoom: true, media_capture: false } });
      if (command.method === 'shutdown') { event({ event: 'accepted', request_id: command.request_id }); event({ event: 'completed', request_id: command.request_id, status: 'success' }); finished({ exitCode: 0 }); pipe.close(); return; }
      if (command.method === 'create') {
        const target = { ...command.target, engine: 'chromium', native_target_id: '7' }; targets.set(target.tab_id, target);
        event({ event: 'accepted', request_id: command.request_id }); event({ event: 'created', request_id: command.request_id, target });
        event({ event: 'completed', request_id: command.request_id, status: 'success' });
        event({ event: 'url', url: command.url, target }); event({ event: 'load', http_status: 0, restored_from_history: false, target });
        return pipe.push(packet({ version: 1, target, frame_id: 1, width: 2, height: 2, stride: 8, device_scale: 1, format: 'BGRA8' }, new Uint8Array(16)));
      }
      if (command.method === 'frame_ack') return;
      const target = targets.get(command.target.tab_id);
      if (command.prompt_id !== undefined) {
        const prompt = prompts.get(command.prompt_id);
        if (!prompt || JSON.stringify(prompt.target) !== JSON.stringify(command.target)) return event({ event: 'error', request_id: command.request_id, code: 'stale_prompt' });
        prompts.delete(command.prompt_id); prompt.answer = command;
        event({ event: 'accepted', request_id: command.request_id });
        event({ event: 'prompt_closed', prompt_id: command.prompt_id, reason: 'answered', target });
        return event({ event: 'completed', request_id: command.request_id, status: 'success' });
      }
      event({ event: 'accepted', request_id: command.request_id }); event({ event: 'completed', request_id: command.request_id, status: 'success' });
    } } };
  const host = new CEFHostConnection(process, { token: 'ef'.repeat(32), instance: 'host-instance', identity: BLANK_IDENTITY,
    timers: { setTimeout, clearTimeout }, deadline: 1000, browsingMode: 'web', shared: true });
  const issue = (tabId, id, kind, details) => { const target = targets.get(tabId); prompts.set(id, { target });
    event({ event: 'prompt', prompt_id: id, kind, details, timeout_ms: 120000, target }); return prompts.get(id); };
  // Like invalidateNavigation(): page prompts close with the old target, then generations advance.
  const navigate = tabId => {
    for (const [id, prompt] of prompts) if (prompt.target.tab_id === tabId) { prompts.delete(id); event({ event: 'prompt_closed', prompt_id: id, reason: 'navigation', target: targets.get(tabId) }); }
    const target = { ...targets.get(tabId) }; target.document_generation++; target.navigation_generation++; targets.set(tabId, target);
    event({ event: 'navigation', target }); };
  return { host, writes, event, issue, navigate, targets, pipe };
}
async function attached() {
  const f = promptHost(); await f.host.connect();
  const seen = { events: [], failures: [] };
  const adapter = new CEFEngineAdapter(f.host, { pendingTarget: { tab_id: 'tab-a', engine_instance: 'host-instance', identity: BLANK_IDENTITY,
    document_generation: 1, navigation_generation: 1, private_mode: false }, onFrame: () => {}, onEvent: value => seen.events.push(value),
  onFailure: error => seen.failures.push(error.message) });
  adapter.create('about:blank', { width: 2, height: 2, device_scale: 1 }).catch(() => {});
  await settle();
  return { f, adapter, seen };
}

test('adapter: delegated capabilities are accepted; a prompt reply is bound to its target and single use', async () => {
  const { f, adapter, seen } = await attached();
  assert.equal(f.host.capabilities.permissions, true);
  const prompt = f.issue('tab-a', 'prompt-1', 'dialog', dialogDetails()); await settle();
  const issued = seen.events.find(item => item.event === 'prompt');
  assert.equal(issued.prompt_id, 'prompt-1');
  const result = await adapter.reply(issued.target, 'dialog_reply', { prompt_id: 'prompt-1', accept: true, text: '' });
  assert.equal(result.status, 'success'); assert.equal(prompt.answer.method, 'dialog_reply');
  // Duplicate reply: the host has forgotten the prompt and refuses it without ending the tab.
  await assert.rejects(adapter.reply(issued.target, 'dialog_reply', { prompt_id: 'prompt-1', accept: true, text: '' }), /CEF_ACTION_FAILED/u);
  assert.deepEqual(seen.failures, []); assert.equal(adapter.status, 'active');
  await f.host.shutdown();
});

test('adapter: after navigation a reply for the old document never reaches native; invalid replies are refused locally', async () => {
  const { f, adapter, seen } = await attached();
  f.issue('tab-a', 'prompt-1', 'permission', { origin: 'https://maps.example', permissions: ['geolocation'] }); await settle();
  const issued = seen.events.find(item => item.event === 'prompt');
  f.navigate('tab-a'); await settle();
  assert.ok(seen.events.some(item => item.event === 'prompt_closed' && item.reason === 'navigation'));
  const writes = f.writes.length;
  assert.throws(() => adapter.reply(issued.target, 'permission_reply', { prompt_id: 'prompt-1', decision: 'allow' }), /STALE_CEF_TARGET/u);
  assert.throws(() => adapter.reply(adapter.target, 'permission_reply', { prompt_id: 'prompt-1', decision: 'always' }), /INVALID_CEF_REPLY/u);
  assert.throws(() => adapter.reply(adapter.target, 'navigate', { url: 'https://evil.example/' }), /INVALID_CEF_REPLY/u);
  assert.equal(f.writes.length, writes, 'nothing was written');
  // A forged reply for a prompt that never existed is refused by the host.
  await assert.rejects(adapter.reply(adapter.target, 'permission_reply', { prompt_id: 'prompt-77', decision: 'allow' }), /CEF_ACTION_FAILED/u);
  assert.equal(adapter.status, 'active');
  await f.host.shutdown();
});

test('adapter: a malformed prompt ends only that tab; delegation events without a target end the host', async () => {
  const { f, adapter, seen } = await attached();
  f.event({ event: 'prompt', prompt_id: 'prompt-1', kind: 'permission', details: { origin: 'https://a.example', permissions: ['camera'] },
    timeout_ms: 1000, target: f.targets.get('tab-a') });
  await settle();
  assert.equal(adapter.status, 'failed'); assert.deepEqual(seen.failures, ['INVALID_CEF_PROMPT']);
  assert.equal(f.host.status, 'connected');
  f.event({ event: 'find_result', identifier: 1, count: 1, active: 1, final: true }); await settle();
  assert.equal(f.host.status, 'failed');
});

test('adapter: fixture sessions never accept delegation traffic', async () => {
  const pipe = new Pipe(); let finished; const exit = new Promise(resolve => { finished = resolve; });
  const process = { stdout: { read: count => pipe.read(count) }, wait: () => exit, kill: async () => finished({ exitCode: 0 }),
    stdin: { close: async () => finished({ exitCode: 0 }), write: async () => {} } };
  const adapter = new CEFEngineAdapter(process, { token: 'ab'.repeat(32), timers: { setTimeout, clearTimeout }, browsingMode: 'fixture',
    pendingTarget: { tab_id: 'fixture', engine_instance: 'i', identity: 'http://127.0.0.1:4000', document_generation: 1, navigation_generation: 1, private_mode: false } });
  adapter.target = { tab_id: 'fixture', engine: 'chromium', engine_instance: 'i', native_target_id: '1', identity: 'http://127.0.0.1:4000',
    document_generation: 1, navigation_generation: 1, private_mode: false };
  assert.deepEqual(await adapter.reply(adapter.target, 'zoom', { level: 1 }), { status: 'unsupported', reason: 'FIXTURE_ONLY' });
});
