/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 7: the registered ConsoleErrors actor pair, the process owner
// (ConsoleErrorsNativeRuntime) and the frozen RAM facade, wired over a
// synthetic Gecko: windows, tabs, browsers, browsing contexts, window globals,
// both actor halves joined by a structured-clone "IPC" (setImmediate), a
// content process's ConsoleAPI storage and script console, and documents and
// notifications with recording getters. The real child logic, parent, owner,
// AgentTabRegistry and ConsoleErrorsService run on top. No Gecko, actor IPC,
// engine, helper, provider or process is executed: this is not evidence of
// real actor timing, real privacy behaviour, rendering or the clipboard.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./support/chrome-modules.mjs";
import { Document, makeEvent } from "./support/mini-dom.mjs";

const { createConsoleErrorsNativeRuntime, getConsoleErrorsNativeRuntime, currentNativeNavigationId, watchNativeNavigation,
  createConsoleEngineOf, registerConsoleErrorsActor, CONSOLE_ACTOR_OPTIONS, CONSOLE_QUERY_MS, CHOOSER_NOTIFICATION, CHOOSER_NOTICE,
  consolePlace } = await import("../chrome/ConsoleErrorsNativeRuntime.sys.mjs");
const { createConsoleErrorsChildClass, CONSOLE_ACTOR, CONSOLE_MESSAGES, CONSOLE_CHILD_LIMITS, consoleCaptureSource }
  = await import("../chrome/ConsoleErrorsChild.sys.mjs");
const { ConsoleErrorsParent } = await import("../chrome/ConsoleErrorsParent.sys.mjs");
const { getConsoleErrorsService } = await import("../chrome/ConsoleErrorsService.sys.mjs");
const { installAgentHandoff, currentNavigationId, HANDOFF_ACTOR, HANDOFF_NOTIFICATION, HANDOFF_KEY } = await import("../chrome/AgentHandoffRuntime.sys.mjs");
const { inspectHandoffDocument, HANDOFF_MESSAGES } = await import("../chrome/AgentHandoffChild.sys.mjs");

const XHTML = "http://www.w3.org/1999/xhtml";
const WS = "{11111111-1111-4111-8111-111111111111}";
const WS2 = "{22222222-2222-4222-8222-222222222222}";
const PAGE = "http://localhost:5173/settings";
const PROJECTS = [
  { id: "p_harbor1", root: "/synthetic/harbor-suite", context_uuid: WS, container: { user_context_id: null },
    manifest: { name: "Harbor Suite", environments: [{ name: "local", base_url: "http://localhost:5173" }] } },
  { id: "p_inkline1", root: "/synthetic/inkline", context_uuid: WS, container: { user_context_id: null },
    manifest: { name: "Inkline", environments: [{ name: "local", base_url: "http://localhost:4000" }] } },
];
const settle = async (rounds = 24) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setImmediate(resolve)); };
const deepFreeze = value => { if (value && typeof value === "object") { for (const child of Object.values(value)) deepFreeze(child); Object.freeze(value); } return value; };
const PAYLOAD = /^(api:(arguments|filename|lineNumber)|script:(errorMessage|sourceName|lineNumber))$/u;
const FORBIDDEN = /^(api:(stacktrace|styles)|script:(exception|stack)|title|selection|value|cache)$/u;

let pageSerial = 0, innerSerial = 100;

function manualTimers(clock) {
  const pending = new Map();
  let next = 0;
  return { pending,
    setTimeout(fn, ms) { const id = ++next; pending.set(id, { fn, at: clock.now + ms }); return id; },
    clearTimeout(id) { pending.delete(id); },
    runDue() {
      for (;;) {
        const due = [...pending].filter(([, timer]) => timer.at <= clock.now).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) return;
        pending.delete(due[0]);
        due[1].fn();
      }
    } };
}

/** The chrome-only native authority of AxioSozoServices, controllable. */
function fakeServices({ projects = PROJECTS } = {}) {
  let epoch = 0, published = null, owner = null;
  const listeners = new Set(), normal = new Set(), roots = new Map(), events = [];
  const notify = phase => { for (const listener of [...listeners]) listener(Object.freeze({ phase, revision: epoch })); };
  const services = {
    normal, roots, events, calls: { prepare: 0, capture: 0 }, projects: deepFreeze(structuredClone(projects)),
    get owner() { return owner; },
    isNormalWindow: window => normal.has(window),
    async prepareNativeProjectAuthority() {
      services.calls.prepare++;
      if (published) return true;
      epoch++;
      published = Object.freeze({ revision: epoch, projects: services.projects });
      notify("settled");
      return true;
    },
    readNativeProjectSnapshot: () => published,
    captureNativeProjectAuthority({ window, project_id } = {}) {
      services.calls.capture++;
      if (!published || !normal.has(window)) return null;
      const record = published.projects.find(item => item.id === project_id);
      if (!record || roots.get(record.root) === false) return null;
      const captured = published;
      return Object.freeze({ id: project_id, root: record.root, revision: captured.revision,
        check: () => published === captured && normal.has(window) && roots.get(record.root) !== false });
    },
    onNativeProjectAuthority(callback) { listeners.add(callback); return () => listeners.delete(callback); },
    registerNativeBrowserOwner(value) {
      owner = value;
      const off = value.service.onChange(event => events.push(event));
      return () => { off(); owner = null; };
    },
    invalidate() { epoch++; published = null; notify("invalidated"); },
    async settle() { await services.prepareNativeProjectAuthority(); },
    // The same projects published again: values come back, the epoch does not.
    republish() { services.invalidate(); return services.prepareNativeProjectAuthority(); },
  };
  return services;
}

function fakePopups() {
  const shown = [];
  const api = { shown,
    show(browser, id, message, anchor, mainAction, secondaryActions, options) {
      const existing = api.get(id, browser);
      if (existing) api.remove(existing);
      const notification = { id, browser, message, anchor, mainAction, secondaryActions, options, removed: false };
      shown.push(notification);
      options?.eventCallback?.("showing"); options?.eventCallback?.("shown");
      return notification;
    },
    remove(notification) { if (!notification || notification.removed) return; notification.removed = true; notification.options?.eventCallback?.("removed"); },
    get: (id, browser) => shown.find(item => item.id === id && (!browser || item.browser === browser) && !item.removed) ?? null,
    getNotification: (id, browser) => api.get(id, browser),
    click(notification, isTrusted = true) { notification.mainAction.callback({ checkboxChecked: false, source: "button", event: { isTrusted } }); api.remove(notification); },
  };
  return api;
}

function eventTarget() {
  const listeners = new Map();
  return { listeners,
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    dispatch(type, event) { for (const fn of [...(listeners.get(type) ?? [])]) fn({ type, ...event }); } };
}

/** One content process: its ConsoleAPI storage and script console. */
function contentProcess(world, name) {
  const process = { name, apiListeners: new Set(), scriptListeners: new Set() };
  process.storage = {
    addLogEventListener(listener, principal) { assert.equal(principal?.system, true); process.apiListeners.add(listener); },
    removeLogEventListener(listener) { process.apiListeners.delete(listener); },
    getEvents() { world.reads.push("cache"); throw new Error("the console cache is never replayed"); },
  };
  process.console = { registerListener(listener) { process.scriptListeners.add(listener); }, unregisterListener(listener) { process.scriptListeners.delete(listener); } };
  process.Child = createConsoleErrorsChildClass({ Base: class {}, clock: () => world.clock.now, timers: world.timers,
    getStorage: () => process.storage, getSystemPrincipal: () => ({ system: true }), getScriptConsole: () => process.console,
    asScriptError: message => (message?.isScriptError === true ? message : null), generateQI: names => names });
  process.emit = event => { for (const listener of [...process.apiListeners]) listener(event); };
  process.log = error => { for (const listener of [...process.scriptListeners]) listener.observe(error); };
  return process;
}

function world({ engine = "gecko", engineOf = null, projects = PROJECTS, securityDelayMs = 0, attach = true } = {}) {
  const clock = { now: 1_800_000_000_000 };
  const w = { clock, reads: [], messages: [], hooks: {} };
  w.timers = manualTimers(clock);
  w.web = contentProcess(w, "web");
  w.inProcess = contentProcess(w, "parent");
  w.services = fakeServices({ projects });
  w.popups = fakePopups();
  const document = new Document();
  document.createXULElement = tag => document.createElement(tag);
  const popupset = document.createElement("popupset"); popupset.id = "mainPopupSet";
  document.documentElement.append(popupset);
  const progress = new Set(), tabContainer = eventTarget(), windowEvents = eventTarget();
  const tabs = [];
  const window = { closed: false, document, PopupNotifications: w.popups, addEventListener: windowEvents.addEventListener,
    removeEventListener: windowEvents.removeEventListener };
  window.gBrowser = { tabs, selectedTab: null, tabContainer,
    get selectedBrowser() { return this.selectedTab?.linkedBrowser ?? null; },
    getTabForBrowser: browser => tabs.find(tab => tab.linkedBrowser === browser) ?? null,
    addTabsProgressListener: listener => progress.add(listener), removeTabsProgressListener: listener => progress.delete(listener) };
  const adapterListeners = new Set();
  // Like ZenWorkspaceAdapter.switchTo: whether the space is active afterwards.
  // `refuse` models Zen not activating it; `landOn` a switch that ends in
  // another space while still answering true (a race the caller must catch).
  w.adapter = { private: false, active: WS, switches: [], refuse: false, landOn: null,
    isPrivateWindow() { return this.private; }, workspaceForTab: tab => tab?.workspace ?? null,
    activeWorkspaceUuid() { return this.active; },
    async switchTo(uuid) {
      this.switches.push(uuid);
      await w.hooks.switching?.();
      if (this.refuse) return false;
      if (this.landOn) { this.active = this.landOn; return true; }
      this.active = uuid;
      return this.active === uuid;
    },
    onChange(callback) { adapterListeners.add(callback); return () => adapterListeners.delete(callback); },
    emit(change) { for (const callback of [...adapterListeners]) callback(change); } };
  Object.assign(w, { window, document, tabs, progress, tabContainer, windowEvents });
  w.services.normal.add(window);
  w.engineOf = engineOf ?? (() => w.engine);
  w.engine = engine;
  w.owner = createConsoleErrorsNativeRuntime({ services: w.services, clock: () => clock.now, timers: w.timers, registerActor: () => true,
    isWindowActive: () => w.active !== false, elapsed: () => clock.now, securityDelayMs });
  if (attach) w.detach = w.owner.attachWindow(window, { adapter: w.adapter, engineOf: tab => w.engineOf(tab) });
  w.navigate = (page, { sameDocument = false, url = page.browser.currentURI.spec } = {}) => {
    if (sameDocument) {
      page.browser.currentURI = { spec: url };
      page.global.documentURI = { spec: url };
    } else load(w, page, url);
    for (const listener of [...progress]) listener.onLocationChange?.(page.browser, { isTopLevel: true }, null, { spec: url }, sameDocument ? 1 : 0);
  };
  w.advance = async ms => { clock.now += ms; w.timers.runDue(); await settle(); };
  w.project = (id = "p_harbor1") => w.owner.service.readProject({ window, project_id: id });
  w.dispose = () => { w.owner.dispose(); };
  return w;
}

function makePrincipal(url, context, over = {}) {
  return { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true, privateBrowsingId: context.originAttributes.privateBrowsingId,
    userContextId: context.originAttributes.userContextId, origin: URL.parse(url)?.origin ?? "null",
    schemeIs: scheme => URL.parse(url)?.protocol === `${scheme}:`, ...over };
}

/** A tab with a current top-level http(s) document and its actor pair. */
function openTab(w, { url = PAGE, process = w.web, workspace = WS, select = true, userContextId = 0 } = {}) {
  // Native nodes name their window through Node.documentGlobal (Node.webidl); there is no ownerGlobal.
  const tab = { documentGlobal: w.window, closing: false, isConnected: true, workspace, linkedBrowser: null, serial: ++pageSerial };
  const browser = { browserId: 1000 + pageSerial, permanentKey: {}, documentGlobal: w.window, currentURI: { spec: url } };
  const context = { parent: null, isContent: true, isDiscarded: false, usePrivateBrowsing: false,
    originAttributes: { privateBrowsingId: 0, userContextId }, embedderElement: browser, currentWindowGlobal: null };
  context.top = context;
  browser.frameLoader = { ownerElement: browser, browsingContext: context };
  browser.browsingContext = context;
  tab.linkedBrowser = browser;
  w.tabs.push(tab);
  if (select) w.window.gBrowser.selectedTab = tab;
  const page = { tab, browser, context, process, w };
  load(w, page, url);
  return page;
}

/** A new document (a new WindowGlobal and actor pair); the old one is destroyed. */
function load(w, page, url) {
  const old = page.global;
  if (old) {
    old.isCurrentGlobal = false;
    old.isClosed = true;
    page.parent?.didDestroy(); page.child?.didDestroy();
  }
  const global = { innerWindowId: ++innerSerial, isClosed: false, isCurrentGlobal: true, browsingContext: page.context,
    documentPrincipal: makePrincipal(url, page.context), documentURI: { spec: url }, failedChannel: null, actors: new Map(),
    getExistingActor(name) { return this.actors.get(name) ?? null; },
    getActor(name) {
      if (name === HANDOFF_ACTOR) return handoffActor(w, page, this);
      if (name !== CONSOLE_ACTOR || !/^https?:/u.test(this.documentURI.spec) || this.isClosed) throw new Error("NotSupportedError");
      return this.actors.get(name) ?? pair(w, page, this);
    } };
  page.global = global;
  page.context.currentWindowGlobal = global;
  page.browser.currentURI = { spec: url };
  page.state = { inputs: [], active: null };
  const state = page.state;
  page.document = {
    get documentURI() { w.reads.push("documentURI"); return global.documentURI.spec; },
    get nodePrincipal() { w.reads.push("nodePrincipal"); return global.documentPrincipal; },
    get activeElement() { w.reads.push("activeElement"); return state.active; },
    querySelectorAll(selector) { w.reads.push(`querySelectorAll:${selector}`); if (state.throws) throw new Error("gone"); return state.inputs; },
    get title() { w.reads.push("title"); return "Synthetic settings"; },
    getSelection() { w.reads.push("selection"); return { rangeCount: 0, isCollapsed: true }; },
  };
  page.documentOf = new WeakMap([[global, page.document]]);
  pair(w, page, global);
}

/** Both halves of the ConsoleErrors actor for one window global. */
function pair(w, page, global) {
  const parent = new ConsoleErrorsParent();
  const child = new page.process.Child();
  const document = page.document;
  const childManager = { get isClosed() { return global.isClosed; }, get isCurrentGlobal() { return global.isCurrentGlobal; },
    get innerWindowId() { return global.innerWindowId; } };
  const childContext = { parent: null, get isContent() { return page.context.isContent; }, get isDiscarded() { return page.context.isDiscarded; },
    get usePrivateBrowsing() { return page.context.usePrivateBrowsing; }, get originAttributes() { return page.context.originAttributes; } };
  childContext.top = childContext;
  Object.defineProperties(child, {
    manager: { value: childManager }, browsingContext: { value: childContext },
    document: { get() { w.reads.push("document"); return document; } },
    docShell: { get() { return { failedChannel: global.failedChannel }; } },
  });
  const ipc = run => new Promise((resolve, reject) => setImmediate(() => {
    try { resolve(structuredClone(run())); } catch (error) { reject(error); }
  }));
  child.sendQuery = (name, data) => { w.messages.push(["child", name]); return ipc(() => parent.receiveMessage({ name, data: structuredClone(data) })); };
  child.sendAsyncMessage = (name, data) => {
    w.messages.push(["child", name]);
    const copy = structuredClone(data);
    setImmediate(() => { if (!global.isClosed) (w.hooks.offerTo?.(page) ?? parent).receiveMessage({ name, data: copy }); });
  };
  parent.manager = global;
  parent.browsingContext = page.context;
  parent.sendQuery = (name, data) => {
    w.messages.push(["parent", name]);
    w.hooks.query?.(page, data);
    return new Promise((resolve, reject) => setImmediate(() => {
      try {
        if (w.hooks.dropQuery) return;
        let reply = child.receiveMessage({ name, data: structuredClone(data) });
        w.hooks.replied?.(page, reply);
        reply = structuredClone(reply);
        resolve(w.hooks.reply ? w.hooks.reply(reply, page) : reply);
      } catch (error) { reject(error); }
    }));
  };
  parent.sendAsyncMessage = (name, data) => {
    w.messages.push(["parent", name]);
    const copy = structuredClone(data);
    setImmediate(() => { if (!global.isClosed) child.receiveMessage({ name, data: copy }); });
  };
  global.actors.set(CONSOLE_ACTOR, parent);
  page.parent = parent;
  page.child = child;
  child.handleEvent({ type: "DOMContentLoaded" });
  return parent;
}

/** The handoff actor of a global: the actual AgentHandoffChild logic. */
function handoffActor(w, page, global) {
  return { async sendQuery(message, data) {
    const document = page.documentOf.get(global);
    const manager = { isClosed: global.isClosed, isCurrentGlobal: global.isCurrentGlobal, innerWindowId: global.innerWindowId };
    const answer = inspectHandoffDocument({ manager, browsingContext: page.context, document }, data,
      message === HANDOFF_MESSAGES.PRECHECK ? "precheck" : "capture");
    return structuredClone(answer);
  } };
}

function apiEvent(page, { level = "error", args = ["Synthetic failure"], filename = page.browser.currentURI.spec, line = 7, at,
  inner = page.global.innerWindowId, priv = false, chromeContext = false, addonId = "" } = {}) {
  const w = page.w;
  const target = { ID: "synthetic", innerID: inner, level, private: priv, chromeContext, addonId, timeStamp: at ?? w.clock.now,
    filename, lineNumber: line, arguments: args, functionName: "" };
  for (const name of ["stacktrace", "styles"]) Object.defineProperty(target, name, { get() { w.reads.push(`api:${name}`); return []; } });
  const watched = new Set(["arguments", "filename", "lineNumber", "stacktrace", "styles"]);
  const proxy = new Proxy(target, {
    getOwnPropertyDescriptor(object, key) { if (watched.has(key)) w.reads.push(`api:${String(key)}`); return Reflect.getOwnPropertyDescriptor(object, key); },
    get(object, key, receiver) { if (watched.has(key)) w.reads.push(`api:${String(key)}`); return Reflect.get(object, key, receiver); },
  });
  target.wrappedJSObject = proxy;
  return { proxy, target };
}

function scriptError(page, { flags = 0, message = "TypeError: booking is undefined", source = page.browser.currentURI.spec, line = 3, at,
  inner = page.global.innerWindowId, priv = false, chrome = false, category = "content javascript" } = {}) {
  const w = page.w;
  const fields = { flags, timeStamp: at ?? w.clock.now, innerWindowID: inner, isFromPrivateWindow: priv, isFromChromeContext: chrome, category };
  const error = { isScriptError: true, fields };
  for (const key of Object.keys(fields)) Object.defineProperty(error, key, { get: () => fields[key] });
  const payload = { errorMessage: message, sourceName: source, lineNumber: line };
  for (const [key, value] of Object.entries(payload)) Object.defineProperty(error, key, { get() { w.reads.push(`script:${key}`); return value; } });
  for (const key of ["exception", "stack"]) Object.defineProperty(error, key, { get() { w.reads.push(`script:${key}`); return null; } });
  return error;
}

/** Ready pages (authorized through their actors), the clock moved past every floor. */
async function ready(w) { await settle(); w.clock.now += 5; }
async function emit(page, options) { const event = apiEvent(page, options); page.process.emit(event.proxy); await settle(); return event; }
async function log(page, options) { const error = scriptError(page, options); page.process.log(error); await settle(); return error; }
const count = (w, id = "p_harbor1") => w.project(id)?.count ?? null;
const payloadReads = w => w.reads.filter(read => PAYLOAD.test(read));
const forbiddenReads = w => w.reads.filter(read => FORBIDDEN.test(read));
const inputs = (page, list) => { page.state.inputs = list; };
const PASSWORD = Object.freeze({ localName: "input", namespaceURI: XHTML, hasBeenTypePassword: true });

function run(name, body, options) {
  test(name, async () => {
    const w = world(options);
    try { await body(w); } finally { w.dispose(); }
  });
}

// ---------------------------------------------------------------- registration and module shape

test("registration: fixed actor, top-level http(s) only, untrusted web processes allowed, in-process included, once per process", () => {
  assert.equal(CONSOLE_ACTOR, "ConsoleErrors");
  assert.deepEqual(CONSOLE_MESSAGES, { AUTHORIZE: "ConsoleErrors:Authorize", OFFER: "ConsoleErrors:Offer", CAPTURE: "ConsoleErrors:Capture",
    RESTART: "ConsoleErrors:Restart", STOP: "ConsoleErrors:Stop" });
  assert.deepEqual([CONSOLE_ACTOR_OPTIONS.allFrames, CONSOLE_ACTOR_OPTIONS.includeChrome, CONSOLE_ACTOR_OPTIONS.safeForUntrustedWebProcess],
    [false, false, true]);
  assert.deepEqual(CONSOLE_ACTOR_OPTIONS.matches, ["http://*/*", "https://*/*"]);
  assert.equal(CONSOLE_ACTOR_OPTIONS.remoteTypes, undefined, "no remote type filter: in-process documents use the same child");
  assert.equal(CONSOLE_ACTOR_OPTIONS.parent.esModuleURI, "chrome://browser/content/axiosozo/ConsoleErrorsParent.sys.mjs");
  assert.equal(CONSOLE_ACTOR_OPTIONS.child.esModuleURI, "chrome://browser/content/axiosozo/ConsoleErrorsChild.sys.mjs");
  assert.deepEqual(Object.keys(CONSOLE_ACTOR_OPTIONS.child.events), ["DOMDocElementInserted", "DOMContentLoaded", "pageshow"]);
  const calls = [];
  const chrome = { registerWindowActor: (name, options) => calls.push([name, options]) };
  registerConsoleErrorsActor(chrome); registerConsoleErrorsActor(chrome);
  assert.deepEqual(calls, [["ConsoleErrors", CONSOLE_ACTOR_OPTIONS]]);
  assert.ok(CONSOLE_QUERY_MS <= 1000);
  assert.deepEqual([CONSOLE_CHILD_LIMITS.perSecond, CONSOLE_CHILD_LIMITS.perDocument, CONSOLE_CHILD_LIMITS.pendingMs], [20, 500, 500]);
  // No parent Services.console route, no cache replay, no in-process skip.
  for (const file of ["ConsoleErrorsNativeRuntime.sys.mjs", "ConsoleErrorsParent.sys.mjs"]) {
    const source = readFileSync(new URL(`../chrome/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /registerListener|addLogEventListener|getEvents|Services\.console/u, file);
  }
  const child = readFileSync(new URL("../chrome/ConsoleErrorsChild.sys.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(child, /contentWindow\.|isInProcess|getEvents|toString\(|JSON\.stringify/u, "no in-process skip, cache or serialization of live input");
});

test("the owner is created explicitly, once; the accessor never creates one; dispose closes registry and facade", async () => {
  assert.equal(getConsoleErrorsNativeRuntime(), null);
  assert.throws(() => createConsoleErrorsNativeRuntime({ services: {} }), { code: "INVALID_DEPENDENCIES" });
  const w = world();
  assert.equal(getConsoleErrorsNativeRuntime(), w.owner);
  assert.equal(getConsoleErrorsService(), w.owner.service);
  assert.throws(() => createConsoleErrorsNativeRuntime({ services: fakeServices(), timers: w.timers }), { code: "OWNER_EXISTS" });
  for (const name of ["captures", "begin", "complete", "lease", "permit"]) assert.equal(w.owner[name], undefined, name);
  assert.ok(Object.isFrozen(w.owner));
  await ready(w);
  const diagnostics = w.owner.diagnostics();
  assert.ok(Object.values(diagnostics).every(value => typeof value === "number" || typeof value === "boolean"), "counts only");
  w.dispose(); w.dispose();
  assert.deepEqual([getConsoleErrorsNativeRuntime(), getConsoleErrorsService(), w.services.owner], [null, null, null]);
  assert.equal(w.owner.diagnostics().disposed, true);
  assert.equal(w.owner.authorizeActor({}).enabled, false);
  const again = world();
  try { assert.equal(getConsoleErrorsNativeRuntime(), again.owner, "a new owner after disposal, never the old one"); } finally { again.dispose(); }
});

const AUTHORIZE_STAGES = ["disposed", "manager", "context", "window", "tab", "register", "facade"];
const AUTHORIZE_FIELDS = ["authorize_calls", "authorize_errors", ...AUTHORIZE_STAGES.map(stage => `authorize_refused_${stage}`)];
const authorizeCounts = w => {
  const all = w.owner.diagnostics();
  return Object.fromEntries(["authorized", ...AUTHORIZE_FIELDS].map(name => [name, all[name]]));
};
/** The counters one direct readiness request moved, nothing else. */
function authorizeDelta(w, actor) {
  const before = authorizeCounts(w);
  const grant = w.owner.authorizeActor(actor);
  const after = authorizeCounts(w);
  return { grant, moved: Object.fromEntries(Object.keys(after).filter(name => after[name] !== before[name]).map(name => [name, after[name] - before[name]])) };
}

run("readiness diagnostics: each refusal is counted at the one existing gate that refused it; answers and order unchanged", async w => {
  const page = openTab(w);
  page.tab.key = page.browser.permanentKey;
  await ready(w);
  const settled = authorizeCounts(w);
  assert.ok(settled.authorize_calls >= 1 && settled.authorized === settled.authorize_calls, "the real readiness requests were all granted");
  assert.ok(AUTHORIZE_FIELDS.every(name => Number.isSafeInteger(settled[name])), "fixed integer fields");
  const granted = authorizeDelta(w, page.parent);
  assert.equal(granted.grant.enabled, true);
  assert.deepEqual(granted.moved, { authorized: 1, authorize_calls: 1 });
  const cases = [
    ["manager", () => { page.global.isCurrentGlobal = false; }, () => { page.global.isCurrentGlobal = true; }],
    ["manager", () => { page.global.actors.set(CONSOLE_ACTOR, {}); }, () => { page.global.actors.set(CONSOLE_ACTOR, page.parent); }],
    ["context", () => { page.context.usePrivateBrowsing = true; }, () => { page.context.usePrivateBrowsing = false; }],
    ["context", () => { page.context.currentWindowGlobal = {}; }, () => { page.context.currentWindowGlobal = page.global; }],
    ["window", () => { w.services.normal.delete(w.window); }, () => { w.services.normal.add(w.window); }],
    ["window", () => { w.adapter.private = true; }, () => { w.adapter.private = false; }],
    ["tab", () => { page.tab.closing = true; }, () => { page.tab.closing = false; }],
    ["tab", () => { page.tab.isConnected = false; }, () => { page.tab.isConnected = true; }],
    ["tab", () => { page.browser.permanentKey = null; }, () => { page.browser.permanentKey = page.tab.key; }],
    ["register", () => { w.engine = "unknown"; }, () => { w.engine = "gecko"; }],
  ];
  for (const [stage, change, undo] of cases) {
    change();
    const { grant, moved } = authorizeDelta(w, page.parent);
    undo();
    assert.equal(grant.enabled, false, stage);
    assert.deepEqual(moved, { authorize_calls: 1, [`authorize_refused_${stage}`]: 1 }, stage);
  }
  // An exception inside a gate: refused at that gate, also counted as an error.
  const browsingContext = Object.getOwnPropertyDescriptor(page.global, "browsingContext");
  Object.defineProperty(page.global, "browsingContext", { configurable: true, get() { throw new Error("gone"); } });
  const thrown = authorizeDelta(w, page.parent);
  Object.defineProperty(page.global, "browsingContext", browsingContext);
  assert.deepEqual([thrown.grant.enabled, thrown.moved], [false, { authorize_calls: 1, authorize_refused_context: 1, authorize_errors: 1 }]);
  // Owner gates passed, the facade refused (no project for this page).
  const other = openTab(w, { url: "http://localhost:9999/unrelated" });
  await settle();
  const facade = authorizeDelta(w, other.parent);
  assert.deepEqual([facade.grant.enabled, facade.moved], [false, { authorize_calls: 1, authorize_refused_facade: 1 }]);
  assert.equal(w.owner.diagnostics().actors >= 2, true, "the facade stage is after the owner tracks the actor");
  // Not an actor, or a destroyed one: the first gate.
  assert.deepEqual(authorizeDelta(w, null).moved, { authorize_calls: 1, authorize_refused_disposed: 1 });
  w.owner.actorDestroyed(page.parent);
  assert.deepEqual(authorizeDelta(w, page.parent).moved, { authorize_calls: 1, authorize_refused_disposed: 1 });
  // Every request ends in exactly one outcome.
  const total = authorizeCounts(w);
  assert.equal(total.authorized + AUTHORIZE_STAGES.reduce((sum, stage) => sum + total[`authorize_refused_${stage}`], 0), total.authorize_calls);
  // Counts only: fixed names, integers and the disposed flag; nothing of a
  // page, tab, project or exception can be kept.
  const diagnostics = w.owner.diagnostics();
  assert.ok(Object.isFrozen(diagnostics));
  assert.ok(Object.entries(diagnostics).every(([name, value]) => (name === "disposed" ? typeof value === "boolean" : Number.isSafeInteger(value))));
  assert.ok(AUTHORIZE_FIELDS.every(name => Object.hasOwn(diagnostics, name)));
  assert.doesNotMatch(JSON.stringify(diagnostics), /localhost|unrelated|p_harbor|"t_\d|gone|synthetic/u);
});

test("readiness diagnostics saturate at a fixed ceiling", () => {
  const w = world({ attach: false });
  try {
    for (let i = 0; i < 1_000_010; i++) w.owner.authorizeActor(null);
    const counts = authorizeCounts(w);
    assert.deepEqual([counts.authorize_calls, counts.authorize_refused_disposed, counts.authorized], [1_000_000, 1_000_000, 0]);
    assert.equal(w.owner.authorizeActor(null).enabled, false, "the answer never depends on a counter");
  } finally { w.dispose(); }
});

run("native document window: Node.documentGlobal binds embedder and tab to their window; foreign, missing or ownerGlobal-only nodes grant nothing", async w => {
  const page = openTab(w);
  await ready(w);
  assert.ok(!("ownerGlobal" in page.tab) && !("ownerGlobal" in page.browser), "native-shaped nodes: no ownerGlobal");
  assert.ok(authorizeCounts(w).authorized >= 1, "the real readiness request was granted");
  assert.equal(w.owner.authorizeActor(page.parent).enabled, true);
  // The embedder's window (ownerForActor's window gate), then the tab's own (its tab gate).
  for (const [node, stage] of [[page.browser, "window"], [page.tab, "tab"]]) {
    for (const [label, change] of [
      ["a foreign window", () => { node.documentGlobal = { gBrowser: w.window.gBrowser }; }],
      ["no document window", () => { delete node.documentGlobal; }],
      ["the obsolete ownerGlobal only", () => { delete node.documentGlobal; node.ownerGlobal = w.window; }],
    ]) {
      change();
      const { grant, moved } = authorizeDelta(w, page.parent);
      delete node.ownerGlobal; node.documentGlobal = w.window;
      assert.deepEqual([grant.enabled, moved], [false, { authorize_calls: 1, [`authorize_refused_${stage}`]: 1 }], `${stage}: ${label}`);
    }
  }
  // End to end: a tab known only through ownerGlobal is never collected from or read,
  // and the registry drops its binding (it is not a live tab of this window).
  const inventory = () => w.owner.registry.withConsoleInventory(entries => entries.map(entry => entry.tab_id));
  const [before] = inventory();
  delete page.tab.documentGlobal; page.tab.ownerGlobal = w.window;
  await emit(page);
  assert.equal(count(w) ?? 0, 0, "nothing offered, leased or retained");
  assert.throws(() => w.owner.service.readTab({ window: w.window, tab: page.tab }));
  assert.deepEqual(inventory(), [], "the ownerGlobal-only tab's binding is retired");
  // The real native field again: only the owner's own restart path admits it, under a fresh binding.
  delete page.tab.ownerGlobal; page.tab.documentGlobal = w.window;
  await w.services.republish();
  await ready(w);
  const after = inventory();
  assert.equal(after.length, 1);
  assert.notEqual(after[0], before, "a fresh registry ID, never the retired one");
  await emit(page);
  assert.equal(count(w), 1, "the same native tab with its documentGlobal is collected again");
});

test("GUI fixture page: a finite passive sequence of fixed errors and warnings, nothing networked, no initial password or embedded focus", () => {
  const html = readFileSync(new URL("./fixtures/console-project.html", import.meta.url), "utf8");
  const schedule = JSON.parse(/<script type="application\/json" id="passive-schedule">([\s\S]*?)<\/script>/u.exec(html)[1]);
  assert.equal(schedule.length, 13);
  assert.deepEqual([schedule.filter(entry => entry.level === "error").length, schedule.filter(entry => entry.level === "warning").length], [7, 6]);
  assert.ok(schedule[0].at >= 5000, "starts at least 5 s after load");
  assert.ok(schedule.at(-1).at <= 60000, "ends by 60 s");
  schedule.forEach((entry, index) => {
    assert.deepEqual(Object.keys(entry), ["at", "level", "text"]);
    assert.ok(Number.isSafeInteger(entry.at), entry.text);
    if (index) assert.ok(entry.at - schedule[index - 1].at >= 1250, "spaced at least 1.25 s");
    assert.match(entry.text, /^AXIOSOZO-STEP7-PASSIVE (error \d of 7|warning \d of 6): [a-z ]+$/u);
  });
  assert.equal(new Set(schedule.map(entry => entry.text)).size, 13, "distinct fixed markers");
  const passive = /\/\/ passive:start([\s\S]*?)\/\/ passive:end/u.exec(html)[1];
  assert.deepEqual([...passive.matchAll(/console\.(\w+)/gu)].map(match => match[1]).sort(), ["error", "warn"], "only console.error and console.warn");
  assert.match(passive, /addEventListener\("load", [\s\S]*\{ once: true \}\)/u, "once per loaded document");
  const active = html.replace(/<!--[\s\S]*?-->/gu, ""); // the licence header and documentation aside
  assert.doesNotMatch(active, /setInterval|fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|import\(|https?:\/\/|localStorage|indexedDB|document\.cookie/u,
    "no interval, network, storage or absolute URL");
  assert.match(html, /Content-Security-Policy" content="default-src 'none';[^"]*connect-src 'none'/u);
  assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/u, "an inline icon: no implicit /favicon.ico load");
  const markup = html.slice(0, html.indexOf("<script"));
  assert.doesNotMatch(markup, /<iframe|<input|autofocus|type="password"/u, "initially no frame, field or focus");
  assert.match(html, /Automatic messages \(no user action\)/u);
  assert.match(html, /Manual cases \(only when the user clicks or presses a button\)/u);
});

// ---------------------------------------------------------------- ordinary capture

run("an ordinary normal page: offer, exact challenge, gated child copy, retained in RAM; no parent password fact", async w => {
  const page = openTab(w);
  await ready(w);
  w.reads.length = 0;
  await emit(page, { args: ["Booking failed:", 42, true, { secret: "never" }, null, undefined, Symbol("s"), 10n] });
  assert.equal(count(w), 1);
  const [message] = w.owner.service.readTab({ window: w.window, tab_id: w.owner.ownerForTab(w.window, page.tab).tab_id }).messages;
  assert.deepEqual([message.level, message.text, message.source, message.line], ["error", "Booking failed: 42 true", PAGE, 7]);
  assert.deepEqual(w.project(), { count: 1, recent: [{ level: "error", text: "Booking failed: 42 true" }] });
  // The child's gate ran on its own document right before the copy; nothing else of the page was read.
  const gate = w.reads.indexOf("querySelectorAll:input"), copy = w.reads.indexOf("api:arguments");
  assert.ok(gate >= 0 && copy > gate, "password gate before payload");
  assert.deepEqual(forbiddenReads(w), [], "no title, selection, value, stack, style or cache");
  const policy = w.owner.readPolicy({ window: w.window, tab: page.tab });
  assert.equal(Object.hasOwn(policy, "password_risk"), false, "the parent has no password fact at all");
  assert.equal(policy.navigation_id, `w${page.global.innerWindowId}.n0`);
  assert.deepEqual(w.messages.filter(([, name]) => name === CONSOLE_MESSAGES.OFFER || name === CONSOLE_MESSAGES.CAPTURE).map(([side, name]) => [side, name]),
    [["child", CONSOLE_MESSAGES.OFFER], ["parent", CONSOLE_MESSAGES.CAPTURE]]);
  assert.deepEqual(w.services.events, [{ name: "console" }], "name-only event");
  // A script error of the same document, a warning, a little later.
  await w.advance(10);
  await log(page, { flags: 1, message: "Deprecated API", line: 9 });
  assert.deepEqual(w.project().recent.map(item => [item.level, item.text]), [["warning", "Deprecated API"], ["error", "Booking failed: 42 true"]]);
});

run("ConsoleAPI objects, getters, styles, stacks and the cache stay unread; only own primitive arguments are copied", async w => {
  const page = openTab(w);
  await ready(w);
  const touched = [];
  const hostile = { get value() { touched.push("getter"); return "x"; }, toString() { touched.push("toString"); return "x"; } };
  const args = ["Visible", hostile, [1, 2]];
  Object.defineProperty(args, "3", { get() { touched.push("index getter"); return "hidden"; }, enumerable: true });
  await emit(page, { args });
  assert.deepEqual(w.project().recent, [{ level: "error", text: "Visible" }]);
  assert.deepEqual(touched, []);
  assert.deepEqual(forbiddenReads(w), []);
  await emit(page, { args: [{ only: "objects" }, null, undefined] });
  assert.equal(count(w), 1, "no primitive text: nothing retained");
});

run("sources: userinfo, query and fragment stripped; privileged, file, data and oversized sources refused; controls cleansed", async w => {
  assert.equal(consoleCaptureSource("https://user:pw@example.test/app.js?token=1#L3"), "https://example.test/app.js");
  assert.equal(consoleCaptureSource(""), "");
  for (const value of ["file:///Users/x/app.js", "moz-extension://abc/app.js", "data:text/javascript,1", "blob:http://x/y", "chrome://browser/x.js",
    "debugger eval code", `http://example.test/${"a".repeat(3000)}`, "http://example.test/‮evil.js", 42, null]) {
    assert.equal(consoleCaptureSource(value), null, String(value).slice(0, 40));
  }
  const page = openTab(w);
  await ready(w);
  await emit(page, { filename: "http://user:pw@localhost:5173/app.js?key=secret#x", args: ["safe\u0000‮ text"] });
  const [message] = w.owner.service.readTab({ window: w.window, tab_id: w.owner.ownerForTab(w.window, page.tab).tab_id }).messages;
  assert.deepEqual([message.source, message.text], ["http://localhost:5173/app.js", "safe   text"]);
  await w.advance(1000);
  await emit(page, { filename: "file:///etc/passwd" });
  await w.advance(1000);
  await log(page, { source: "moz-extension://abc/background.js" });
  assert.equal(count(w), 1, "refused sources are not retained");
});

// ---------------------------------------------------------------- privacy before payload

run("private, unknown, stale and non-top-level documents: refused before any document, URI or log read", async w => {
  const page = openTab(w);
  await ready(w);
  for (const [label, change, undo] of [
    ["private context", () => { page.context.usePrivateBrowsing = true; }, () => { page.context.usePrivateBrowsing = false; }],
    ["unknown privacy", () => { page.context.originAttributes = {}; }, () => { page.context.originAttributes = { privateBrowsingId: 0, userContextId: 0 }; }],
    ["stale global", () => { page.global.isCurrentGlobal = false; }, () => { page.global.isCurrentGlobal = true; }],
  ]) {
    change();
    w.reads.length = 0;
    await emit(page);
    assert.deepEqual(w.reads.filter(read => read === "document" || read === "documentURI" || PAYLOAD.test(read)), [], label);
    assert.equal(count(w) ?? 0, 0, label);
    undo();
  }
  // Notification flags: private, chrome, add-on, other document, other level, before the floor.
  w.reads.length = 0;
  for (const options of [{ priv: true }, { chromeContext: true }, { addonId: "x@y" }, { inner: 9 }, { level: "log" }, { at: 1 }]) await emit(page, options);
  await log(page, { priv: true }); await log(page, { chrome: true }); await log(page, { flags: 8 }); await log(page, { category: "CSS Parser" });
  assert.deepEqual(w.reads.filter(read => read === "document" || PAYLOAD.test(read)), []);
  assert.equal(w.messages.filter(([, name]) => name === CONSOLE_MESSAGES.OFFER).length, 0, "no offer at all");
  // A private document never gets readiness: no document read, no authorize.
  const priv = openTab(w, { url: "http://localhost:5173/other" });
  priv.context.usePrivateBrowsing = true;
  const before = w.messages.length;
  w.reads.length = 0;
  priv.child.handleEvent({ type: "pageshow" });
  await settle();
  assert.deepEqual([w.reads, w.messages.slice(before)], [[], []]);
});

for (const [label, prepare] of [
  ["a password field", page => inputs(page, [PASSWORD])],
  ["a field that was ever a password", page => inputs(page, [{ ...PASSWORD, type: "text" }])],
  ["focus in an opaque frame", page => { page.state.active = { localName: "iframe" }; }],
  ["too many inputs to check", page => inputs(page, { length: 5000 })],
  ["an exception while checking", page => { page.state.throws = true; }],
]) {
  run(`capture-time password gate: ${label} refuses before any payload getter`, async w => {
    const page = openTab(w);
    await ready(w);
    prepare(page);
    w.reads.length = 0;
    await emit(page);
    await w.advance(1000);
    await log(page);
    assert.equal(count(w), 0);
    assert.deepEqual(payloadReads(w), []);
    assert.ok(w.reads.includes("activeElement"), "the actual gate ran");
    assert.equal(w.messages.filter(([, name]) => name === CONSOLE_MESSAGES.CAPTURE).length, 2, "challenged, then refused by the child");
    assert.deepEqual([w.owner.diagnostics().leases, w.owner.diagnostics().accepted], [2, 0]);
  });
}

run("password appearing before the child's capture refuses; after the scalar copy the past record stays", async w => {
  const page = openTab(w);
  await ready(w);
  w.hooks.query = target => inputs(target, [PASSWORD]); // between the offer and the challenge
  await emit(page);
  assert.equal(count(w), 0);
  assert.deepEqual(payloadReads(w), []);
  inputs(page, []);
  w.hooks.query = null;
  w.hooks.replied = target => inputs(target, [PASSWORD]); // after the copy, before the parent retains it
  await w.advance(1000);
  await emit(page, { args: ["Captured before the field appeared"] });
  assert.deepEqual(w.project().recent, [{ level: "error", text: "Captured before the field appeared" }],
    "an immutable past capture; the parent reads no DOM at delivery");
  w.hooks.replied = null;
  await w.advance(1000);
  await emit(page, { args: ["After"] });
  assert.equal(count(w), 1, "the next capture checks the actual risk again");
});

// ---------------------------------------------------------------- provenance and one use

run("only the exact awaited query on the original actor completes; unsolicited, forged or copied replies retain nothing", async w => {
  const page = openTab(w);
  const other = openTab(w, { url: "http://localhost:4000/board" });
  await ready(w);
  const packet = { v: 1, document_id: String(page.global.innerWindowId), navigation_token: "n_1", observed_at: w.clock.now, level: "error",
    text: "forged", source: "", line: 1 };
  page.parent.receiveMessage({ name: CONSOLE_MESSAGES.CAPTURE, data: { v: 1, lease_id: "cl_1", offer_id: "co_1", packet } });
  page.parent.receiveMessage({ name: "ConsoleErrors:Packet", data: packet });
  w.owner.handleOffer({ manager: page.global, sendQuery: () => assert.fail("an unregistered object gets no query") }, () => packet);
  await settle();
  assert.equal(count(w), 0);
  // An offer arriving through another tab's actor: that actor's own child has no such offer.
  w.hooks.offerTo = () => other.parent;
  await emit(page);
  w.hooks.offerTo = null;
  assert.deepEqual([count(w), count(w, "p_inkline1")], [0, 0]);
  // Tampered replies: wrong lease, offer, document, token or time, extra fields, a risk claim.
  for (const tamper of [reply => ({ ...reply, lease_id: "cl_999999" }), reply => ({ ...reply, offer_id: "co_x" }),
    reply => ({ ...reply, packet: { ...reply.packet, document_id: "1" } }), reply => ({ ...reply, packet: { ...reply.packet, navigation_token: "n_9" } }),
    reply => ({ ...reply, packet: { ...reply.packet, observed_at: reply.packet.observed_at + 1 } }),
    reply => ({ ...reply, password_risk: false }), reply => ({ ...reply, packet: { ...reply.packet, captured: true } })]) {
    w.hooks.reply = reply => (reply.packet ? tamper(reply) : reply);
    await w.advance(1000);
    await emit(page);
  }
  w.hooks.reply = null;
  assert.equal(count(w), 0);
  // The same challenge twice: the child consumed its offer, so a replay copies nothing.
  let challenge = null;
  w.hooks.query = (_target, data) => { challenge = data; };
  await w.advance(1000);
  await emit(page, { args: ["Once"] });
  w.hooks.query = null;
  assert.equal(count(w), 1);
  w.reads.length = 0;
  const replay = page.child.receiveMessage({ name: CONSOLE_MESSAGES.CAPTURE, data: challenge });
  assert.deepEqual([replay.packet, payloadReads(w)], [null, []]);
});

run("expiry, query rejection, destruction and navigation during the query cancel it; late replies never retain", async w => {
  const page = openTab(w);
  await ready(w);
  w.hooks.dropQuery = true; // the child never answers
  await emit(page);
  await w.advance(CONSOLE_QUERY_MS);
  assert.equal(w.owner.diagnostics().queries, 0, "timed out and released");
  w.hooks.dropQuery = false;
  // A reply that arrives after the deadline is dropped.
  let release;
  w.hooks.query = () => { const held = new Promise(resolve => { release = resolve; }); w.hooks.reply = async reply => { await held; return reply; }; };
  await w.advance(1000);
  await emit(page);
  w.clock.now += CONSOLE_QUERY_MS + 1;
  w.timers.runDue();
  release();
  await settle();
  assert.equal(count(w), 0);
  w.hooks.query = null; w.hooks.reply = null;
  // Destroyed while waiting.
  w.hooks.query = target => { target.parent.didDestroy(); };
  await w.advance(1000);
  await emit(page);
  w.hooks.query = null;
  assert.equal(count(w), 0);
  assert.equal(w.owner.authorizeActor(page.parent).enabled, false, "a destroyed actor is never current again");
});

for (const [label, change] of [
  ["the browser ID", page => { page.browser.browserId += 1; }],
  ["the frame loader", page => { page.browser.frameLoader = { ownerElement: page.browser, browsingContext: page.context }; }],
  ["the principal", page => { page.global.documentPrincipal = makePrincipal(PAGE, page.context); }],
  ["the container", page => { page.context.originAttributes = { privateBrowsingId: 0, userContextId: 3 }; page.global.documentPrincipal = makePrincipal(PAGE, page.context); }],
  ["the space", page => { page.tab.workspace = WS2; page.w.adapter.emit({ kind: "switched", uuid: WS2 }); }],
  ["the project root", page => { page.w.services.roots.set("/synthetic/harbor-suite", false); }],
  ["the global epoch (values come back)", page => { page.w.services.republish(); }],
  ["the engine", page => { page.w.engine = "chromium"; }],
  ["the selected document (same-document navigation)", page => { page.w.navigate(page, { sameDocument: true, url: `${PAGE}#tab` }); }],
]) {
  run(`a change of ${label} while the query is out refuses retention`, async w => {
    const page = openTab(w);
    await ready(w);
    let changed = 0;
    w.hooks.replied = (target, reply) => { if (reply?.packet) { changed++; change(target); } };
    await emit(page);
    const { leases, accepted } = w.owner.diagnostics();
    assert.deepEqual([changed, leases, accepted], [1, 1, 0], "the child copied, the parent refused to retain");
    assert.equal(count(w) ?? 0, 0);
  });
}

run("a native denial after the await leaves the reply's fields unread by the parent", async w => {
  const page = openTab(w);
  await ready(w);
  const touched = [];
  w.hooks.replied = (target, reply) => { if (reply?.packet) target.context.usePrivateBrowsing = true; };
  w.hooks.reply = reply => new Proxy(reply, {
    get(object, key, receiver) { touched.push(String(key)); return Reflect.get(object, key, receiver); },
    getOwnPropertyDescriptor(object, key) { touched.push(String(key)); return Reflect.getOwnPropertyDescriptor(object, key); },
    ownKeys(object) { touched.push("ownKeys"); return Reflect.ownKeys(object); },
  });
  await emit(page);
  // Promise resolution looks up `then` on any resolved object (a real query reply too); no field is read.
  assert.deepEqual([touched.filter(key => key !== "then"), w.owner.diagnostics().accepted], [[], 0], "private now: the packet was never inspected");
});

// ---------------------------------------------------------------- limits and the held reference

run("one held notification at most; it is released after 500 ms without a challenge; extras are dropped, not queued", async w => {
  const page = openTab(w);
  await ready(w);
  const offers = () => w.messages.filter(([, name]) => name === CONSOLE_MESSAGES.OFFER).length;
  w.hooks.dropQuery = true;
  await emit(page, { args: ["first"] });
  for (let i = 0; i < 3; i++) await emit(page, { args: [`extra ${i}`] });
  assert.equal(offers(), 1, "one offer while one is held");
  await w.advance(CONSOLE_CHILD_LIMITS.pendingMs + 1);
  await emit(page, { args: ["the child released its reference"] });
  assert.equal(offers(), 2, "the held notification was dropped after 500 ms");
  assert.equal(count(w), 0, "the parent's own lease for this tab is still out: refused, nothing read");
  await w.advance(CONSOLE_QUERY_MS);
  w.hooks.dropQuery = false;
  await emit(page, { args: ["after release"] });
  assert.deepEqual(w.project().recent.map(item => item.text), ["after release"]);
  assert.deepEqual(payloadReads(w).filter(read => read === "api:arguments").length, 1, "only the captured one was read");
});

run("child budget: 20 a second and 500 a document, kept across same-document navigation and relinking; a new document starts afresh", async w => {
  const page = openTab(w);
  await ready(w);
  const offers = () => w.messages.filter(([, name]) => name === CONSOLE_MESSAGES.OFFER).length;
  for (let i = 0; i < 25; i++) await emit(page, { args: [`burst ${i}`] });
  assert.equal(count(w), 20, "the 21st and later in the same second are dropped before any payload");
  w.navigate(page, { sameDocument: true, url: `${PAGE}#next` });
  await settle();
  w.clock.now += 5;
  const before = offers();
  await emit(page, { args: ["same second, same document"] });
  assert.equal(offers(), before, "same-document navigation keeps the budget");
  await w.services.republish(); // the project unlinked and linked again
  await settle();
  w.clock.now += 5;
  await emit(page, { args: ["same second, relinked"] });
  assert.equal(offers(), before, "relinking keeps it too");
  let total = 20;
  while (total < CONSOLE_CHILD_LIMITS.perDocument) {
    await w.advance(1000);
    for (let i = 0; i < 20 && total < CONSOLE_CHILD_LIMITS.perDocument; i++, total++) {
      page.process.emit(apiEvent(page, { args: [`n${total}`] }).proxy);
      await settle(4);
    }
  }
  await w.advance(1000);
  const capped = offers();
  await emit(page, { args: ["beyond the document cap"] });
  assert.equal(offers(), capped, "500 a document");
  w.navigate(page, { url: "http://localhost:5173/fresh" });
  await ready(w);
  await emit(page, { args: ["a new document"] });
  assert.deepEqual(w.project().recent.map(item => item.text), ["a new document"], "cleared on navigation; a new global has its own budget");
});

// ---------------------------------------------------------------- navigation identity

run("navigation: the counter moves first, console state clears, subscribers hear it, readiness restarts; one counter for all", async w => {
  const page = openTab(w);
  await ready(w);
  await emit(page);
  assert.equal(count(w), 1);
  const order = [];
  const unwatch = w.owner.onNativeNavigation(w.window, browser => order.push(["subscriber", currentNativeNavigationId(w.window, browser), count(w)]));
  const handoffWatch = watchNativeNavigation(w.window, () => order.push(["watcher"]));
  const id = currentNativeNavigationId(w.window, page.browser);
  assert.equal(id, `w${page.global.innerWindowId}.n0`);
  assert.equal(currentNavigationId(w.window, page.browser), id, "the handoff module's name is the same identity");
  w.navigate(page, { sameDocument: true, url: `${PAGE}?tab=2` });
  assert.deepEqual(order, [["subscriber", `w${page.global.innerWindowId}.n1`, 0], ["watcher"]], "rotated once and cleared before subscribers");
  assert.equal(w.progress.size, 1, "a single progress listener for the owner and every subscriber");
  await settle();
  assert.ok(w.messages.some(([side, name]) => side === "parent" && name === CONSOLE_MESSAGES.RESTART));
  w.clock.now += 5;
  await emit(page, { args: ["after the pushState"] });
  assert.deepEqual(w.project().recent.map(item => item.text), ["after the pushState"]);
  unwatch(); handoffWatch();
  assert.equal(currentNativeNavigationId({ untracked: true }, page.browser), null);
  w.detach(); w.detach();
  assert.equal(currentNativeNavigationId(w.window, page.browser), null, "an untracked window has no identity");
  assert.equal(w.progress.size, 0);
});

run("remote and in-process documents use the same child path; a forwarded copy is never captured twice", async w => {
  const remote = openTab(w);
  const local = openTab(w, { url: "http://localhost:5173/local", process: w.inProcess });
  await ready(w);
  const error = scriptError(remote, { message: "Remote failure" });
  w.web.log(error);
  // Gecko forwards remote script errors to the parent process without their inner window ID.
  w.inProcess.log(scriptError(remote, { message: "Remote failure", inner: 0 }));
  await settle();
  await w.advance(1000);
  await log(local, { message: "In-process failure" });
  await w.advance(1000);
  await emit(local, { args: ["In-process console.error"] });
  const tab = page => w.owner.service.readTab({ window: w.window, tab_id: w.owner.ownerForTab(w.window, page.tab).tab_id }).messages.map(item => item.text);
  assert.deepEqual(tab(remote), ["Remote failure"]);
  assert.deepEqual(tab(local), ["In-process failure", "In-process console.error"]);
  assert.equal(count(w), 3, "each message exactly once");
});

// ---------------------------------------------------------------- authority lifecycle

run("project invalidation stops children and clears retention; a settled publication restarts them; budgets survive", async w => {
  const page = openTab(w);
  await ready(w);
  await emit(page);
  assert.equal(count(w), 1);
  w.services.invalidate();
  assert.equal(w.project(), null, "nothing is readable while authority is withdrawn");
  await settle();
  assert.ok(w.messages.some(([side, name]) => side === "parent" && name === CONSOLE_MESSAGES.STOP));
  await emit(page, { args: ["while invalid"] });
  await w.services.settle();
  await ready(w);
  assert.equal(count(w), 0, "invalidation cleared what was retained");
  await emit(page, { args: ["after settle"] });
  assert.deepEqual(w.project().recent.map(item => item.text), ["after settle"]);
});

run("tab close forgets the tab; detaching one window leaves another window's tabs alone", async w => {
  const page = openTab(w);
  await ready(w);
  await emit(page);
  // A second window of the same process, attached to the same owner, then detached twice.
  const document = new Document(); document.createXULElement = tag => document.createElement(tag);
  const sibling = { closed: false, document, PopupNotifications: fakePopups(), addEventListener() {}, removeEventListener() {},
    gBrowser: { tabs: [], selectedTab: null, tabContainer: eventTarget(), getTabForBrowser: () => null,
      addTabsProgressListener() {}, removeTabsProgressListener() {} } };
  w.services.normal.add(sibling);
  const detach = w.owner.attachWindow(sibling, { adapter: { isPrivateWindow: () => false, workspaceForTab: () => null }, engineOf: () => "gecko" });
  assert.equal(w.owner.diagnostics().windows, 2);
  detach(); detach();
  assert.equal(w.owner.diagnostics().windows, 1);
  assert.equal(count(w), 1, "the other window's records stay");
  page.tab.closing = true;
  w.tabContainer.dispatch("TabClose", { target: page.tab });
  assert.equal(count(w), 0);
});

// ---------------------------------------------------------------- engine authority

test("console engine authority: probe handle answers only when settled; without one, Gecko only with switching and probe proven off", () => {
  const window = { gBrowser: null };
  const global = { isCurrentGlobal: true, isClosed: false };
  const browser = { browsingContext: { currentWindowGlobal: global } };
  const tab = { documentGlobal: window, closing: false, linkedBrowser: browser };
  window.gBrowser = { getTabForBrowser: candidate => (candidate === browser ? tab : null) };
  const env = values => () => ({ get: name => values[name] });
  const off = { webModeEnabled: () => false };
  for (const [values, expected] of [[{ AXIOSOZO_ENGINE_SWITCHING: "0", AXIOSOZO_ENGINE_PROBE: "0" }, "gecko"],
    [{ AXIOSOZO_ENGINE_SWITCHING: "", AXIOSOZO_ENGINE_PROBE: "" }, "gecko"],
    [{ AXIOSOZO_ENGINE_SWITCHING: "1", AXIOSOZO_ENGINE_PROBE: "" }, null], [{ AXIOSOZO_ENGINE_SWITCHING: "0", AXIOSOZO_ENGINE_PROBE: "1" }, null],
    [{ AXIOSOZO_ENGINE_SWITCHING: "yes", AXIOSOZO_ENGINE_PROBE: "0" }, null], [{ AXIOSOZO_ENGINE_PROBE: "0" }, null]]) {
    assert.equal(createConsoleEngineOf({ window, env: env(values), ...off })(tab), expected, JSON.stringify(values));
  }
  assert.equal(createConsoleEngineOf({ window, env: () => ({ get() { throw new Error("no env"); } }), ...off })(tab), null);
  assert.equal(createConsoleEngineOf({ window, env: () => null, ...off })(tab), null);
  assert.equal(createConsoleEngineOf({ window, ...off })(tab), null, "no environment reader: nothing is proven");
  const disabled = env({ AXIOSOZO_ENGINE_SWITCHING: "0", AXIOSOZO_ENGINE_PROBE: "0" });
  assert.equal(createConsoleEngineOf({ window, env: disabled, webModeEnabled: () => true })(tab), null, "EngineRegistry disagrees");
  assert.equal(createConsoleEngineOf({ window, env: disabled, webModeEnabled: () => { throw new Error("x"); } })(tab), null);
  // Stale, replaced or private-looking ownership despite disabled mode.
  assert.equal(createConsoleEngineOf({ window, env: disabled, ...off })({ ...tab, linkedBrowser: { browsingContext: browser.browsingContext } }), null);
  assert.equal(createConsoleEngineOf({ window, env: disabled, ...off })({ ...tab, documentGlobal: {} }), null, "a foreign window");
  assert.equal(createConsoleEngineOf({ window, env: disabled, ...off })({ ...tab, documentGlobal: null }), null, "no document window");
  // The obsolete ownerGlobal name is no native field: it alone proves nothing.
  const { documentGlobal: _native, ...stale } = tab;
  window.gBrowser.getTabForBrowser = candidate => (candidate === browser ? stale : null);
  assert.equal(createConsoleEngineOf({ window, env: disabled, ...off })({ ...stale, ownerGlobal: window }), null, "ownerGlobal alone");
  window.gBrowser.getTabForBrowser = candidate => (candidate === browser ? tab : null);
  global.isCurrentGlobal = false;
  assert.equal(createConsoleEngineOf({ window, env: disabled, ...off })(tab), null);
  global.isCurrentGlobal = true;
  // With a probe handle: its actual answer, never a disabled-mode fallback.
  const probe = (engine, state = { pending: false, disposed: false }) => ({ diagnostics: () => state,
    engineOf: () => { if (engine instanceof Error) throw engine; return engine; } });
  for (const [handle, expected] of [[probe("gecko"), "gecko"], [probe("chromium"), "chromium"], [probe("webkit"), null], [probe(undefined), null],
    [probe(new Error("x")), null], [probe("gecko", { pending: true, disposed: false }), null], [probe("gecko", { pending: false, disposed: true }), null],
    [probe("gecko", null), null]]) {
    assert.equal(createConsoleEngineOf({ window, engineProbe: handle, env: disabled, ...off })(tab), expected);
  }
});

const environment = values => () => ({ get: name => values[name] ?? "" });
const ENGINE_CASES = [
  ["switching and probe proven off, no probe handle", w => createConsoleEngineOf({ window: w.window, webModeEnabled: () => false,
    env: environment({ AXIOSOZO_ENGINE_SWITCHING: "0", AXIOSOZO_ENGINE_PROBE: "0" }) }), 1],
  ["switching enabled without a probe handle", w => createConsoleEngineOf({ window: w.window, webModeEnabled: () => false,
    env: environment({ AXIOSOZO_ENGINE_SWITCHING: "1", AXIOSOZO_ENGINE_PROBE: "0" }) }), 0],
  ["a pending probe handle", w => createConsoleEngineOf({ window: w.window,
    engineProbe: { diagnostics: () => ({ pending: true, disposed: false }), engineOf: () => "gecko" } }), 0],
  ["an actual Chromium result", w => createConsoleEngineOf({ window: w.window,
    engineProbe: { diagnostics: () => ({ pending: false, disposed: false }), engineOf: () => "chromium" } }), 0],
];
for (const [label, factory, retained] of ENGINE_CASES) {
  test(`capture through the console engine callback: ${label}`, async () => {
    let callback = () => null;
    const w = world({ engineOf: tab => callback(tab) });
    try {
      callback = factory(w);
      const page = openTab(w);
      await ready(w);
      await emit(page);
      assert.equal(count(w) ?? 0, retained);
      if (label.includes("Chromium")) assert.throws(() => w.owner.service.readTab({ window: w.window, tab: page.tab }), { code: "UNAVAILABLE" });
    } finally { w.dispose(); }
  });
}

// ---------------------------------------------------------------- "Send errors to agent…": native chooser

/** The selected about:axiosozo tab of a project home, and its origin predicate as AboutAxioSozoParent builds it. */
function aboutHome(w) {
  const browser = { browsingContext: null, currentURI: { spec: "about:axiosozo#project=p_harbor1" }, documentGlobal: w.window };
  const tab = { documentGlobal: w.window, closing: false, isConnected: true, linkedBrowser: browser, workspace: WS };
  w.tabs.push(tab);
  w.window.gBrowser.selectedTab = tab;
  const origin = { current: true, asked: [] };
  const originCurrent = ({ requireSelected = true } = {}) => {
    origin.asked.push(requireSelected);
    return origin.current && (!requireSelected || w.window.gBrowser.selectedTab === tab);
  };
  return { tab, browser, origin, originCurrent, actor: { browsingContext: { embedderElement: browser } } };
}
const chooser = w => w.popups.get(CHOOSER_NOTIFICATION);
const notice = w => w.popups.get(CHOOSER_NOTICE);
const radios = w => w.document.getElementById(`${CHOOSER_NOTIFICATION}-tabs`)?.children ?? [];

run("the chooser lists only this project's tabs with retained messages, by host and path; a trusted choice opens the composer once", async w => {
  const harbor = openTab(w), other = openTab(w, { url: "http://localhost:5173/board", select: false });
  openTab(w, { url: "http://localhost:4000/editor", select: false });
  await ready(w);
  await emit(harbor);
  await log(other, { flags: 1, message: "Slow" });
  await w.advance(1000);
  await emit(other, { args: ["Broken"] });
  const opened = [];
  const unregister = w.owner.registerHandoffComposer(w.window, { openConsoleComposer: args => opened.push(args) });
  const home = aboutHome(w);
  w.reads.length = 0;
  assert.equal(w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent }), true);
  const shown = chooser(w);
  assert.deepEqual([shown.browser, shown.message, shown.options.name, shown.mainAction.label, shown.secondaryActions.map(action => action.label)],
    [home.browser, "Send console errors of <> to an agent", "Harbor Suite", "Open tab", ["Cancel"]]);
  assert.deepEqual(radios(w).map(radio => radio.getAttribute("label")),
    ["localhost:5173/board · 1 error and 1 warning", "localhost:5173/settings · 1 error"], "errors first; host and path, never a title");
  assert.equal(radios(w)[0].getAttribute("selected"), "true");
  assert.deepEqual(w.reads.filter(read => read === "title" || PAYLOAD.test(read)), [], "listing reads no page data");
  assert.deepEqual(opened, [], "showing the chooser opens nothing");
  w.popups.click(shown, false);
  await settle();
  assert.deepEqual(opened, [], "an untrusted click chooses nothing");
  w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent });
  const again = chooser(w);
  radios(w)[0].removeAttribute("selected");
  radios(w)[1].setAttribute("selected", "true");
  w.popups.click(again);
  await settle();
  assert.equal(w.window.gBrowser.selectedTab, harbor.tab, "the chosen existing tab is selected");
  assert.equal(opened.length, 1);
  assert.deepEqual([opened[0].tab, opened[0].project_id, opened[0].authority.check(), opened[0].descriptor.tab_id],
    [harbor.tab, "p_harbor1", true, w.owner.ownerForTab(w.window, harbor.tab).tab_id]);
  assert.ok(home.origin.asked.includes(false), "after the switch the origin must stay current, not selected");
  again.mainAction.callback({ event: { isTrusted: true } });
  await settle();
  assert.equal(opened.length, 1, "one use");
  unregister();
});

run("the chooser refuses an origin that is not current or selected, and says so when no tab has errors or projects change", async w => {
  openTab(w);
  await ready(w);
  const home = aboutHome(w);
  const request = () => w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent });
  home.origin.current = false;
  assert.equal(request(), false);
  home.origin.current = true;
  for (const project_id of ["p_x", "../p_harbor1", undefined]) {
    assert.equal(w.owner.requestProjectErrorChooser({ window: w.window, project_id, aboutActor: home.actor, originCurrent: home.originCurrent }), false);
  }
  assert.equal(w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: true }), false,
    "a Boolean is not a predicate");
  assert.equal(w.popups.shown.length, 0);
  assert.equal(request(), false);
  assert.equal(notice(w).message, "No tab of <> in this window has console errors right now.");
  w.services.invalidate();
  assert.equal(request(), false);
  assert.equal(notice(w).message, "Your projects are changing, so no tab was chosen. Try again in a moment.");
  assert.equal(chooser(w), null);
});

for (const [label, change, noticeShown] of [
  ["projects change while it is open", w => w.services.invalidate(), false],
  ["the project home navigates", (w, home) => { for (const listener of [...w.progress]) listener.onLocationChange(home.browser, { isTopLevel: true }); }, false],
  ["the chosen tab navigates before the choice", (w, _home, page) => w.navigate(page, { sameDocument: true, url: `${PAGE}#moved` }), true],
  ["the origin is no longer current", (_w, home) => { home.origin.current = false; }, false],
  ["the window is detached", w => w.detach(), false],
]) {
  run(`the chooser launches nothing when ${label}`, async w => {
    const page = openTab(w);
    await ready(w);
    await emit(page);
    const opened = [];
    w.owner.registerHandoffComposer(w.window, { openConsoleComposer: args => opened.push(args) });
    const home = aboutHome(w);
    w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent });
    const shown = chooser(w);
    change(w, home, page);
    shown.mainAction.callback({ event: { isTrusted: true } });
    await settle();
    assert.deepEqual(opened, []);
    assert.equal(w.window.gBrowser.selectedTab, home.tab, "the project home stays selected");
    assert.equal(!!notice(w), noticeShown);
  });
}

run("a tab in another space: the space switches first, then the origin and target are checked again", async w => {
  const page = openTab(w, { workspace: WS2 });
  await ready(w);
  await emit(page);
  const opened = [];
  w.owner.registerHandoffComposer(w.window, { openConsoleComposer: args => opened.push(args) });
  const home = aboutHome(w);
  w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent });
  w.hooks.switching = async () => { home.origin.current = false; };
  w.popups.click(chooser(w));
  await settle();
  assert.deepEqual([w.adapter.switches, opened], [[WS2], []], "the origin went away during the switch: no launch");
  w.hooks.switching = null;
  home.origin.current = true;
  w.adapter.active = WS;
  w.window.gBrowser.selectedTab = home.tab;
  w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent });
  w.popups.click(chooser(w));
  await settle();
  assert.deepEqual([opened.length, w.window.gBrowser.selectedTab === page.tab, w.adapter.active], [1, true, WS2]);
});

for (const [label, setup, active] of [
  ["Zen does not activate the space (false)", w => { w.adapter.refuse = true; }, WS],
  ["the switch answers true but another space is active", w => { w.adapter.landOn = "{33333333-3333-4333-8333-333333333333}"; },
    "{33333333-3333-4333-8333-333333333333}"],
  ["the switch answers something other than literal true", w => { w.adapter.switchTo = async uuid => { w.adapter.switches.push(uuid); w.adapter.active = uuid; return "yes"; }; }, WS2],
]) {
  run(`a tab in another space: nothing is selected and no composer opens when ${label}`, async w => {
    const page = openTab(w, { workspace: WS2 });
    await ready(w);
    await emit(page);
    const opened = [];
    w.owner.registerHandoffComposer(w.window, { openConsoleComposer: args => opened.push(args) });
    const home = aboutHome(w);
    setup(w);
    w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent });
    w.popups.click(chooser(w));
    await settle();
    assert.deepEqual([w.adapter.switches, w.adapter.active], [[WS2], active]);
    assert.equal(w.window.gBrowser.selectedTab, home.tab, "the target tab is not selected");
    assert.deepEqual(opened, [], "no composer");
  });
}

run("a tab in the active space needs no switch: the same space is checked, the tab selected and its composer opened", async w => {
  const page = openTab(w, { workspace: WS });
  await ready(w);
  await emit(page);
  const opened = [];
  w.owner.registerHandoffComposer(w.window, { openConsoleComposer: args => opened.push(args) });
  const home = aboutHome(w);
  w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent });
  w.popups.click(chooser(w));
  await settle();
  assert.deepEqual([w.adapter.switches, w.window.gBrowser.selectedTab === page.tab, opened.length], [[], true, 1]);
});

// ---------------------------------------------------------------- the existing manual composer

function handoff(w) {
  const copies = [], state = { authority: true, entry: null };
  const services = {
    isNormalWindow: window => w.services.normal.has(window),
    captureHandoffAuthority: async () => ({ project: { id: "p_harbor1", root: "/synthetic/harbor-suite" }, name: "Harbor Suite", check: () => state.authority }),
    captureNativeProjectAuthority: args => w.services.captureNativeProjectAuthority(args),
    rememberAgentReturnTarget: () => true, on: () => () => {},
  };
  // The real owner, with its composer registration observed (the owner itself is frozen).
  const nativeOwner = { ...w.owner, registerHandoffComposer: (window, value) => {
    state.entry = value.openConsoleComposer;
    return w.owner.registerHandoffComposer(window, value);
  } };
  let serial = 0;
  const runtime = installAgentHandoff(w.window, { services, adapter: w.adapter, engineOf: () => "gecko", nativeOwner,
    timers: { setTimeout: () => 1, clearTimeout() {} }, clock: () => 1_700_000_000_000, clipboardHelper: { copyString: text => copies.push(text) },
    registerActor: () => true, requestId: () => `hf_${(++serial).toString(16).padStart(16, "0")}`, isWindowActive: () => true,
    securityDelayMs: 0, elapsed: () => 0 });
  const compose = () => w.popups.get(HANDOFF_NOTIFICATION);
  const box = () => w.document.getElementById("axiosozo-handoff-console");
  const press = async () => { w.document.getElementById(HANDOFF_KEY.id).dispatchEvent(makeEvent("command")); await settle(); };
  const copy = async () => { w.popups.click(compose()); await settle(); };
  return { runtime, copies, state, compose, box, press, copy, last: () => JSON.parse(copies.at(-1)) };
}

run("Send errors to agent: the chosen tab's composer has console errors ticked; only the trusted Copy includes them", async w => {
  const page = openTab(w);
  await ready(w);
  await emit(page, { args: ["TypeError: booking is undefined"], filename: "http://localhost:5173/app.js?v=2" });
  const h = handoff(w);
  try {
    const home = aboutHome(w);
    w.owner.requestProjectErrorChooser({ window: w.window, project_id: "p_harbor1", aboutActor: home.actor, originCurrent: home.originCurrent });
    w.popups.click(chooser(w));
    await settle();
    assert.ok(h.compose(), "the existing composer, on the chosen tab");
    assert.equal(h.compose().browser, page.browser);
    assert.deepEqual([h.box().checked, h.box().disabled, h.box().getAttribute("label")], [true, false, "Include this tab's console errors"]);
    assert.deepEqual(h.copies, [], "choosing copies nothing");
    w.reads.length = 0;
    await h.copy();
    assert.equal(h.copies.length, 1);
    const context = h.last();
    assert.deepEqual(context.console_errors.map(({ level, text, source, line }) => ({ level, text, source, line })),
      [{ level: "error", text: "TypeError: booking is undefined", source: "http://localhost:5173/app.js", line: 7 }]);
    assert.deepEqual(context.project, { id: "p_harbor1", root: "/synthetic/harbor-suite" });
    assert.ok(w.reads.indexOf("activeElement") < w.reads.indexOf("title"), "the child's password check before the title");
    assert.equal(h.runtime.diagnostics().console_included, 1);
  } finally { h.runtime.dispose(); }
});

run("ordinary Send to agent: console errors offered unticked and copied only when ticked; a project change refuses the copy", async w => {
  const page = openTab(w);
  await ready(w);
  await emit(page);
  const h = handoff(w);
  try {
    await h.press();
    assert.deepEqual([h.box().checked, h.box().disabled], [false, false]);
    await h.copy();
    assert.deepEqual(h.last().console_errors, [], "unticked: include_console false stays empty");
    await h.press();
    h.box().checked = true;
    await h.copy();
    assert.deepEqual(h.last().console_errors.map(item => item.text), ["Synthetic failure"]);
    await h.press();
    h.box().checked = true;
    w.services.invalidate();
    await h.copy();
    assert.equal(h.copies.length, 2, "native authority withdrawn: nothing copied");
    assert.match(w.popups.get("axiosozo-handoff-result").message, /projects were changing/u);
  } finally { h.runtime.dispose(); }
});

run("the composer's console entry needs the selected tab, its issued descriptor and the same native authority; it never sends", async w => {
  const page = openTab(w);
  const other = openTab(w, { url: "http://localhost:5173/other", select: false });
  await ready(w);
  await emit(page);
  const h = handoff(w);
  try {
    assert.equal(typeof h.state.entry, "function", "registered with the owner, chrome-private");
    const descriptor = () => w.owner.registry.withTrusted(w.owner.ownerForTab(w.window, page.tab).tab_id, trusted => trusted.descriptor);
    const authority = () => w.services.captureNativeProjectAuthority({ window: w.window, project_id: "p_harbor1" });
    const issued = descriptor(), granted = authority();
    w.window.gBrowser.selectedTab = other.tab;
    assert.equal(h.state.entry({ tab: page.tab, descriptor: issued, project_id: "p_harbor1", authority: granted }), false, "not the selected tab");
    w.window.gBrowser.selectedTab = page.tab;
    assert.equal(h.state.entry({ tab: page.tab, descriptor: { ...issued }, project_id: "p_harbor1", authority: granted }), false, "a copied descriptor");
    assert.equal(h.state.entry({ tab: page.tab, descriptor: issued, project_id: "p_inkline1", authority: granted }), false, "another project");
    assert.equal(h.state.entry({ tab: page.tab, descriptor: issued, project_id: "p_harbor1", authority: granted }), true);
    await settle();
    assert.ok(h.compose(), "opened, nothing sent");
    w.popups.remove(h.compose());
    w.navigate(page, { sameDocument: true, url: `${PAGE}#moved` });
    assert.equal(h.state.entry({ tab: page.tab, descriptor: issued, project_id: "p_harbor1", authority: granted }), false, "the old descriptor after navigation");
    const fresh = descriptor();
    w.services.invalidate();
    assert.equal(granted.check(), false);
    assert.equal(h.state.entry({ tab: page.tab, descriptor: fresh, project_id: "p_harbor1", authority: granted }), false, "a revoked authority");
    assert.deepEqual(h.copies, []);
  } finally { h.runtime.dispose(); }
});
