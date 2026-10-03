/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 8: AgentBridgeRuntime, the one process owner of the P4 tools,
// over the actual AgentTabRegistry, GeckoAgentTools, AgentCaptureRuntime and
// AgentActionRuntime with native-shaped fake windows/tabs/globals, a fake
// Step 7 console owner and fake Services. Proves the exact six-function
// composite, approved-request title metadata, Step 7 console composition,
// literal-false capture/act gates, the retained-owner lifecycle, the process
// released-session bound and the one shared allocation budget. Cleanup tests
// enable capture through a test-only tools wrapper and run the root reader
// over injected native-shaped modules. No Gecko, channel socket, BiDi,
// provider or GUI is involved.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";

const { createAgentBridgeRuntime, CAPTURE_ENABLED, AGENT_BRIDGE_METHODS, sanitizeTitle, MAX_TITLE, RELEASED_SESSIONS_MAX } = await import("../chrome/AgentBridgeRuntime.sys.mjs");
const { createGeckoAgentTools } = await import("../chrome/GeckoAgentTools.sys.mjs");
const { createAgentActionRuntime } = await import("../chrome/AgentActionRuntime.sys.mjs");
const { createAgentCaptureRuntime } = await import("../chrome/AgentCaptureRuntime.sys.mjs");
const { AgentTabRegistry } = await import("../chrome/AgentTabRegistry.sys.mjs");
const { AgentToolError, createBiDiAllocationBudget, createGeckoBiDiReadSession } = await import("../chrome/GeckoBiDiReadSession.sys.mjs");
const { AGENT_CAPTURE_MESSAGES } = await import("../chrome/AgentCaptureChild.sys.mjs");
const { ACT_METHODS } = await import("../chrome/AgentActionRuntime.sys.mjs");

const SESSION = "s_0000000000000001";
const SIX = ["confirmAction", "executeMethod", "getTab", "isMethodAvailable", "listTabs", "releaseSession"];
const tick = () => new Promise(resolve => setImmediate(resolve));
const settle = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await tick(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const rejects = (promise, code) => assert.rejects(promise, error => error instanceof AgentToolError && error.code === code);
const deepFreeze = value => { if (value && typeof value === "object") { for (const child of Object.values(value)) deepFreeze(child); Object.freeze(value); } return value; };
const viewOf = (project_id = "p_harbor1", session = SESSION) => deepFreeze({ session, project_id,
  client: { name: "agent-bridge", agent: "codex", version: "1" }, state: "approved" });
function manualTimers() {
  let next = 0; const entries = new Map();
  return { setTimeout(fn, ms) { const id = ++next; entries.set(id, { fn, ms }); return id; }, clearTimeout(id) { entries.delete(id); }, get size() { return entries.size; } };
}

function nativeWorld() {
  let inner = 100, browsers = 0;
  const w = { revision: 1, authority: true, windows: new Set(), active: null };
  w.window = ({ private: priv = false } = {}) => {
    const tabs = [], progress = new Set();
    const win = { closed: false, private: priv, document: { hidden: false }, windowState: 1, STATE_MINIMIZED: 2, devicePixelRatio: 2, progress,
      gBrowser: { tabs, selectedTab: null, get selectedBrowser() { return this.selectedTab?.linkedBrowser ?? null; },
        getTabForBrowser: browser => tabs.find(tab => tab.linkedBrowser === browser) ?? null,
        addTabsProgressListener: listener => progress.add(listener), removeTabsProgressListener: listener => progress.delete(listener),
        tabContainer: { addEventListener() {}, removeEventListener() {} } },
      addEventListener() {}, removeEventListener() {} };
    w.windows.add(win); w.active ??= win;
    return win;
  };
  w.load = (tab, url, title = "Agent tools") => {
    const browser = tab.linkedBrowser, context = browser.browsingContext, previous = context.currentWindowGlobal;
    if (previous) { previous.isCurrentGlobal = false; previous.isClosed = true; }
    context.currentWindowGlobal = { innerWindowId: ++inner, isCurrentGlobal: true, isClosed: false, failedChannel: null, documentURI: { spec: url },
      documentTitle: title, browsingContext: context, actors: new Map(),
      getActor(name) { if (!this.actors.has(name) && w.makeActor) this.actors.set(name, w.makeActor(this, name)); return this.actors.get(name) ?? null; },
      getExistingActor(name) { return this.actors.get(name) ?? null; },
      documentPrincipal: { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true,
        privateBrowsingId: context.originAttributes.privateBrowsingId, userContextId: context.originAttributes.userContextId } };
    browser.currentURI = { spec: url };
  };
  // The capture child: answers its closed begin/recheck/release protocol.
  w.makeActor = global => ({ manager: global, sendQuery(name, data) {
    if (name === AGENT_CAPTURE_MESSAGES.RELEASE) return Promise.resolve({ v: 1, token: data.token, released: true, committed: data.commit });
    if (name === AGENT_CAPTURE_MESSAGES.BEGIN) return Promise.resolve({ v: 1, token: data.token, ok: true, retained: true });
    return Promise.resolve({ v: 1, token: data.token, ok: true });
  } });
  w.navigate = (tab, url, title) => {
    w.load(tab, url, title);
    for (const listener of tab.documentGlobal.progress) listener.onLocationChange(tab.linkedBrowser, { isTopLevel: true });
  };
  w.tab = (win, { url = "http://localhost:4450/agent-tools", title, select = true } = {}) => {
    const browser = { browserId: ++browsers, permanentKey: {}, docShellIsActive: true, fullZoom: 1, getBoundingClientRect: () => ({ width: 1200, height: 800 }) };
    const context = { isContent: true, parent: null, isDiscarded: false, usePrivateBrowsing: win.private, overrideDPPX: 0, children: [],
      originAttributes: { privateBrowsingId: win.private ? 1 : 0, userContextId: 0 }, embedderElement: browser };
    context.top = context;
    Object.assign(browser, { browsingContext: context, frameLoader: { ownerElement: browser, browsingContext: context } });
    const tab = { documentGlobal: win, closing: false, isConnected: true, linkedBrowser: browser };
    w.load(tab, url, title);
    win.gBrowser.tabs.push(tab);
    if (select) win.gBrowser.selectedTab = tab;
    return tab;
  };
  w.registry = new AgentTabRegistry({
    isPrivateWindow: win => (w.windows.has(win) ? win.private : null), isWindowRegistered: win => w.windows.has(win),
    isWindowClosed: win => win.closed, isTabLive: (tab, win) => tab.documentGlobal === win && !tab.closing && tab.isConnected,
    getBrowser: (tab, win) => (win.gBrowser.getTabForBrowser(tab.linkedBrowser) === tab ? tab.linkedBrowser : null),
    isPrivateBrowser: browser => browser.browsingContext.usePrivateBrowsing,
    getBrowserIdentity: browser => ({ nativeBrowserId: browser.browserId, permanentKey: browser.permanentKey, browsingContext: browser.browsingContext,
      frameLoader: browser.frameLoader, frameLoaderOwner: browser.frameLoader.ownerElement, frameLoaderContext: browser.frameLoader.browsingContext }),
    getContextState: context => ({ isContent: true, top: context.top, isDiscarded: false, private: context.usePrivateBrowsing,
      privateBrowsingId: context.originAttributes.privateBrowsingId, userContextId: context.originAttributes.userContextId, embedder: context.embedderElement }),
    getCurrentDocument: context => context.currentWindowGlobal,
    getDocumentState: global => ({ browsingContext: global.browsingContext, isCurrentGlobal: global.isCurrentGlobal, isClosed: global.isClosed,
      failedChannel: null, document_id: global.innerWindowId, principal: global.documentPrincipal, isSystemPrincipal: false, isNullPrincipal: false,
      privateBrowsingId: global.documentPrincipal.privateBrowsingId, userContextId: global.documentPrincipal.userContextId }),
    getDocumentURL: (global, browser) => (global.documentURI.spec === browser.currentURI.spec ? global.documentURI.spec : null),
    getTitle: () => "", getEngine: tab => tab.engine ?? "gecko",
    isActiveTab: (tab, win) => w.active === win && win.gBrowser.selectedTab === tab,
    getRoute: () => ({ contextUuid: null, revision: 0 }), getProjectRevision: () => w.revision,
    matchProject: facts => ({ project_id: facts.url.startsWith("http://localhost:4450/") ? "p_harbor1" : null, ambiguous: false, revision: w.revision }),
    classifyHost: host => ({ sensitive: host === "bank.example" }),
  });
  return w;
}

function fixture({ createTools = createGeckoAgentTools, createAction = createAgentActionRuntime, createCapture = createAgentCaptureRuntime, approved = true,
  allocationBudget = createBiDiAllocationBudget() } = {}) {
  const w = nativeWorld();
  const win = w.window();
  const tab = w.tab(win, { title: "Harbor\u0007 Suite\u{202e} — Home" });
  const id = w.registry.register(tab, win);
  const timers = manualTimers();
  const toolDeps = [], consoleReads = [];
  const services = {
    approved: new Set(approved ? [SESSION] : []), installed: [], listeners: new Set(), bridge: null, refuseInstall: false,
    registerAgentBridge(owner) { services.bridge = owner; return () => { if (services.bridge === owner) services.bridge = null; }; },
    installAgentBridgeTools(tools) { if (services.refuseInstall) throw Object.assign(new Error("closed"), { code: "CLOSED" }); services.installed.push(tools); return true; },
    isApprovedBridgeSession: value => services.approved.has(value),
    agentBridgeProject: value => (value === "p_harbor1" ? deepFreeze({ project_id: "p_harbor1", name: "Harbor Suite", root: "/synthetic/harbor",
      apps: [{ app: null, environments: [{ name: "local", base_url: "http://localhost:4450/" }] }], integrations: [] }) : null),
    isNormalWindow: value => w.windows.has(value) && value.private === false && value.closed === false,
    readNativeProjectSnapshot: () => ({ revision: w.revision, projects: [{ id: "p_harbor1", container: null }] }),
    captureNativeProjectAuthority: ({ project_id }) => (w.authority && project_id === "p_harbor1"
      ? { id: project_id, root: "/synthetic/harbor", revision: w.revision, check: () => w.authority } : null),
    onNativeProjectAuthority(callback) { services.listeners.add(callback); return () => services.listeners.delete(callback); },
  };
  const nativeOwner = {
    registry: w.registry,
    readResult: () => ({ count: 1, messages: [{ level: "error", text: "Synthetic failure", source: "", line: 4294967295, at: 5 }] }),
    service: { readTab: owner => { consoleReads.push(owner); return nativeOwner.readResult(); } },
    ownerForTab(window, value, { expected } = {}) {
      const tab_id = w.registry.register(value, window);
      if (!tab_id) return null;
      if (expected !== undefined && w.registry.withTrusted(tab_id, trusted => trusted.tab === value && trusted.window === window, { expected }) !== true) return null;
      return Object.freeze({ window, tab_id, tab: value, windowGlobal: value.linkedBrowser.browsingContext.currentWindowGlobal });
    },
  };
  const runtime = createAgentBridgeRuntime({ services, nativeOwner, timers, allocationBudget,
    createTools: deps => { toolDeps.push(deps); return createTools(deps); }, createAction, createCapture });
  return { w, win, tab, id, timers, services, nativeOwner, runtime, toolDeps, consoleReads, allocationBudget, tools: () => services.installed.at(-1) };
}
const live = () => new AbortController().signal;
const sessionId = n => `s_${(0x1000 + n).toString(16).padStart(16, "0")}`;
function png(width, height) {
  const bytes = Buffer.alloc(33); Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
  bytes.writeUInt32BE(13, 8); bytes.write("IHDR", 12); bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20);
  return bytes.toString("base64");
}

/** The root's actual GeckoBiDiReadSession over injected native-shaped remote
 * modules: `destroy` is the owned session's native destroy result. */
function readerModules() {
  const m = { loads: 0, constructed: 0, destroyed: 0, destroy: () => undefined };
  class WebDriverSession {
    static SESSION_FLAG_BIDI = "bidi";
    constructor() { m.constructed++; }
    execute() { return Promise.resolve({ data: png(2400, 1600) }); }
    destroy() { m.destroyed++; return m.destroy(); }
  }
  m.modules = Object.freeze({ WebDriverSession, hasActiveWebDriverSession: () => false,
    getNavigableManager: async () => ({ getIdForBrowsingContext: () => "ctx-1" }),
    RemoteAgent: Object.freeze({ enabled: false, running: false, allowSystemAccess: false }), Marionette: Object.freeze({ enabled: false, running: false }) });
  return m;
}
/** The actual capture runtime with fake child actors and PNG boxes, the root
 * reader above and an owned readback observer; the process budget is the
 * bridge's own. Capture itself is enabled only by a test-only tools wrapper. */
function captureWith(remote) {
  const c = { boxes: [], observers: new Set() };
  c.create = deps => createAgentCaptureRuntime({ ...deps, registerActor: () => true, readPref: () => false,
    observePref: callback => {
      const observer = () => callback();
      c.observers.add(observer);
      return Object.freeze({ registered: true, remove: () => { c.observers.delete(observer); return true; } });
    },
    randomToken: (() => { let n = 0; return () => `cl_${String(++n).padStart(32, "0")}`; })(),
    createReadSession: readerDeps => createGeckoBiDiReadSession({ ...readerDeps, loadModules: async () => { remote.loads++; return remote.modules; } }),
    createPngBox: () => {
      const box = { closes: 0, closeResult: true, validatePng: async () => true,
        resizePng: async image => ({ data_base64: png(image.target_width, image.target_height) }),
        close: () => { box.closes++; return box.closeResult; }, getState: () => ({}) };
      c.boxes.push(box);
      return box;
    } });
  return c;
}
const captureEnabledForTest = deps => createGeckoAgentTools({ ...deps, captureEnabled: true });

/** Native-shaped action remote modules and a recording boundary stand-in. */
function actionWith() {
  const a = { executed: [], deps: null, constructed: 0, behavior: { constructorThrows: false, destroy: () => undefined } };
  class WebDriverSession {
    static SESSION_FLAG_BIDI = "bidi";
    constructor() { a.constructed++; if (a.behavior.constructorThrows) throw new Error("constructor"); }
    destroy() { return a.behavior.destroy(); }
  }
  const remote = { WebDriverSession, hasActiveWebDriverSession: () => false,
    RemoteAgent: { enabled: false, running: false, allowSystemAccess: false }, Marionette: { enabled: false, running: false },
    navigation: async () => ({ NavigableManager: { getIdForBrowsingContext: () => "ctx-1" } }) };
  a.create = deps => createAgentActionRuntime({ ...deps, loadRemote: async () => remote, registerActor: () => {},
    createBoundary: boundaryDeps => {
      a.deps = boundaryDeps;
      return Object.freeze({ isMethodAvailable: method => ACT_METHODS.includes(method), getCapabilities: () => ({}),
        getState: () => ({ busy: false, pending_operations: 0, retained_created_targets: 0, effect_dispatched: false, cleanup_incomplete: false }),
        executeMethod: async (method, params, session, options) => { a.executed.push({ method, params, options }); return {}; },
        releaseSession: async () => true, close: async () => true });
    } });
  return a;
}

test("one exact six-function composite is installed; the standalone owners and their close/getState stay private", () => {
  const f = fixture();
  assert.equal(f.services.installed.length, 1);
  const tools = f.tools();
  assert.deepEqual(Object.keys(tools).sort(), SIX);
  for (const name of SIX) assert.equal(typeof Object.getOwnPropertyDescriptor(tools, name).value, "function", name);
  assert.ok(Object.isFrozen(tools));
  assert.equal(f.services.bridge, f.runtime);
  assert.deepEqual(Object.keys(f.runtime).sort(), ["attachWindow", "capabilities", "close", "detachWindow", "getState", "replace"]);
  const [deps] = f.toolDeps;
  assert.equal(deps.captureEnabled, false, "capture is passed as a literal false");
  assert.equal(CAPTURE_ENABLED, false);
  for (const name of ["getTabs", "getActiveTab", "getTab", "getProject", "getConsoleErrors", "isSensitiveHost", "isSessionActive",
    "getCaptureExpected", "isCaptureCurrent", "createCaptureOwner", "setTimer", "clearTimer"]) assert.equal(typeof deps[name], "function", name);
  deps.setTimer(() => {}, 5);
  assert.equal(f.timers.size, 1, "the trusted injected timers, never a global default");
  assert.equal(deps.isSensitiveHost("localhost"), false);
  assert.equal(deps.isSensitiveHost("bank.example"), true, "an explicit boolean: normal is literal false only");
});

test("availability: tab metadata, project and console reads only; screenshot, open and every act are unavailable with fixed reasons", () => {
  const f = fixture();
  const tools = f.tools();
  assert.deepEqual(AGENT_BRIDGE_METHODS.filter(method => tools.isMethodAvailable(method)), ["tabs.list", "tabs.active", "project.info", "console.errors"]);
  assert.equal(tools.isMethodAvailable("tabs.eval"), false);
  assert.deepEqual(f.runtime.capabilities().map(item => [item.method, item.available, item.reason]), [
    ["tabs.list", true, null], ["tabs.active", true, null], ["project.info", true, null], ["console.errors", true, null],
    ["tabs.screenshot", false, "CAPTURE_NOT_ENABLED"], ["tabs.open", false, "OPEN_NOT_ENABLED"],
    ["tabs.navigate", false, "ACT_NOT_ENABLED"], ["page.click", false, "ACT_NOT_ENABLED"], ["page.type", false, "ACT_NOT_ENABLED"]]);
});

test("titles: none without an approved request; the exact issued global's cached native title in a separate sanitized copy", () => {
  const f = fixture();
  const tools = f.tools();
  const issued = f.w.registry.metadata(f.id);
  assert.equal(issued.title, "", "the shared registry's own title stays empty");
  assert.equal(tools.listTabs()[0].title, "", "no request view: no title");
  assert.equal(tools.listTabs({ ...viewOf() }, { signal: live() })[0].title, "", "an unfrozen view is not Core's approved view");
  const aborted = new AbortController(); aborted.abort();
  assert.equal(tools.listTabs(viewOf(), { signal: aborted.signal })[0].title, "", "an aborted request");
  assert.equal(tools.listTabs(viewOf(), {})[0].title, "", "no request signal");
  assert.equal(tools.listTabs(viewOf("p_harbor1", "s_00000000000000ff"), { signal: live() })[0].title, "", "an unapproved session");
  const [titled] = tools.listTabs(viewOf(), { signal: live() });
  assert.equal(titled.title, "Harbor Suite — Home", "controls and bidi overrides become spaces, collapsed");
  assert.deepEqual(Object.keys(titled).sort(), ["active", "document_id", "engine", "private", "project_id", "tab_id", "title", "url", "userContextId"],
    "no binding token, revision or native handle reaches Core");
  assert.ok(Object.isFrozen(titled));
  assert.equal(f.w.registry.metadata(f.id).title, "", "nothing changed in the registry");
  assert.equal(issued.title, "");
  assert.equal(tools.getTab(f.id, viewOf(), { signal: live() }).title, "Harbor Suite — Home");
  assert.equal(tools.getTab(f.id).title, "");
  const global = f.tab.linkedBrowser.browsingContext.currentWindowGlobal;
  global.documentTitle = 42;
  assert.equal(tools.getTab(f.id, viewOf(), { signal: live() }).title, "", "a non-string native title is empty");
  global.documentTitle = "x".repeat(MAX_TITLE + 50);
  assert.equal(tools.listTabs(viewOf(), { signal: live() })[0].title.length, MAX_TITLE);
  assert.equal(sanitizeTitle(`${"a".repeat(MAX_TITLE - 1)}😀`).length, MAX_TITLE - 1, "a surrogate pair is never split");
});

test("reentrant revocation while the native title is read publishes no title", () => {
  const f = fixture();
  const global = f.tab.linkedBrowser.browsingContext.currentWindowGlobal;
  Object.defineProperty(global, "documentTitle", { configurable: true, get() { f.services.approved.clear(); return "Late title"; } });
  assert.equal(f.tools().listTabs(viewOf(), { signal: live() })[0].title, "");
  f.services.approved.add(SESSION);
  const controller = new AbortController();
  Object.defineProperty(global, "documentTitle", { configurable: true, get() { controller.abort(); return "Late title"; } });
  assert.equal(f.tools().getTab(f.id, viewOf(), { signal: controller.signal }).title, "");
});

test("private windows and unknown engines never list; every normal window shares one registry and one active tab; nothing reads a Chromium tab", async () => {
  const f = fixture();
  const other = f.w.window();
  const second = f.w.tab(other, { url: "http://localhost:9999/elsewhere", title: "Elsewhere" });
  f.w.registry.register(second, other);
  const hidden = f.w.window({ private: true });
  const secret = f.w.tab(hidden, { url: "http://localhost:4450/private" });
  assert.equal(f.w.registry.register(secret, hidden), null);
  const unknown = Object.assign(f.w.tab(other, { url: "http://localhost:4450/unknown", select: false }), { engine: "webkit" });
  assert.equal(f.w.registry.register(unknown, other), null, "an unknown engine is never treated as Gecko");
  const listed = f.tools().listTabs(viewOf(null), { signal: live() });
  assert.deepEqual(listed.map(tab => [tab.url, tab.title, tab.active, tab.project_id, tab.engine]), [
    ["http://localhost:4450/agent-tools", "Harbor Suite — Home", true, "p_harbor1", "gecko"],
    ["http://localhost:9999/elsewhere", "Elsewhere", false, null, "gecko"]]);
  // No listing is claimed for Chromium here: only that its console, capture
  // and actions are never read or used, whatever the registry answers.
  const chromium = Object.assign(f.w.tab(other, { url: "http://localhost:4450/chromium", title: "Chromium tab", select: false }), { engine: "chromium" });
  const chromiumId = f.w.registry.register(chromium, other);
  for (const method of ["console.errors", "tabs.screenshot"]) {
    await rejects(f.tools().executeMethod(method, { tab_id: chromiumId }, viewOf(null), { signal: live() }), "UNAVAILABLE");
  }
  assert.equal(f.consoleReads.length, 0, "a Chromium tab is never read");
  assert.equal(f.runtime.getState().capture.owners, 0);
});

test("console.errors: the exact issued descriptor, the Step 7 owner's own native tab owner and synchronous RAM readTab", async () => {
  const f = fixture();
  const tools = f.tools();
  const copy = tools.getTab(f.id, viewOf(), { signal: live() });
  const signal = live();
  const result = await tools.executeMethod("console.errors", Object.freeze({ tab_id: f.id }), viewOf(), { tab: copy, signal });
  assert.deepEqual(result, { count: 1, messages: [{ level: "error", text: "Synthetic failure", source: "", line: 4294967295, at: 5 }] });
  assert.equal(f.consoleReads.length, 1);
  const owner = f.consoleReads[0];
  assert.deepEqual(Object.keys(owner).sort(), ["tab", "tab_id", "window", "windowGlobal"]);
  assert.equal(owner.tab, f.tab);
  assert.equal(owner.window, f.win);
  assert.equal(owner.windowGlobal, f.tab.linkedBrowser.browsingContext.currentWindowGlobal);
  f.services.approved.clear();
  await rejects(tools.executeMethod("console.errors", { tab_id: f.id }, viewOf(), { signal: live() }), "NOT_APPROVED");
  f.services.approved.add(SESSION);
  const aborted = new AbortController(); aborted.abort();
  await rejects(tools.executeMethod("console.errors", { tab_id: f.id }, viewOf(), { signal: aborted.signal }), "NOT_APPROVED");
  f.nativeOwner.readResult = () => { throw Object.assign(new Error("STALE_TAB"), { code: "STALE_TAB" }); };
  await rejects(tools.executeMethod("console.errors", { tab_id: f.id }, viewOf(), { signal: live() }), "UNAVAILABLE");
  f.nativeOwner.readResult = () => ({ count: 1, messages: [{ level: "error", text: "x".repeat(1001), source: "", line: 0, at: 1 }] });
  await rejects(tools.executeMethod("console.errors", { tab_id: f.id }, viewOf(), { signal: live() }), "UNAVAILABLE");
});

test("screenshot, open and acts answer UNAVAILABLE before any capture, prompt or effect; confirmAction is literal false", async () => {
  const f = fixture();
  const tools = f.tools();
  const copy = tools.getTab(f.id, viewOf(), { signal: live() });
  await rejects(tools.executeMethod("tabs.screenshot", { tab_id: f.id }, viewOf(), { tab: copy, signal: live() }), "UNAVAILABLE");
  for (const [method, params] of [["page.click", { tab_id: f.id, selector: "#agent-click" }], ["page.type", { tab_id: f.id, selector: "#agent-text", text: "x" }],
    ["tabs.navigate", { tab_id: f.id, url: "http://localhost:4450/agent-tools?mode=navigated" }], ["tabs.open", { url: "http://localhost:4450/agent-tools?mode=opened" }]]) {
    await rejects(tools.executeMethod(method, params, viewOf(), { tab: copy, signal: live() }), "UNAVAILABLE");
    assert.equal(await tools.confirmAction(Object.freeze({ session: viewOf(), method, params, tab: copy }), { signal: live() }), false, method);
  }
  const state = f.runtime.getState();
  assert.equal(state.capture.owners, 0);
  assert.equal(state.action.prompts, 0);
  assert.equal(state.action.receipts, 0);
  assert.equal(state.action.retained_owners, 0);
});

test("releaseSession revokes at entry and returns an observed Promise; malformed IDs resolve false, never unhandled", async () => {
  const f = fixture();
  const tools = f.tools();
  const released = tools.releaseSession(SESSION, "REVOKED");
  assert.ok(released instanceof Promise);
  await rejects(tools.executeMethod("console.errors", { tab_id: f.id }, viewOf(), { signal: live() }), "NOT_APPROVED");
  assert.equal(await released, true);
  assert.equal(await tools.releaseSession("not-a-session"), false);
  assert.equal(f.runtime.getState().tools.released_sessions, 1);
});

test("replacement keeps the superseded standalone owner until its private close is literal true; screenshot and acts stay denied meanwhile", async () => {
  const closes = [];
  const createTools = deps => {
    const real = createGeckoAgentTools(deps);
    const index = closes.length;
    closes.push({ attempts: 0, gate: deferred() });
    return Object.freeze({ ...real, close: () => { closes[index].attempts++; real.close(); return index === 0 ? closes[index].gate.promise : real.close(); } });
  };
  const f = fixture({ createTools });
  const first = f.tools();
  f.runtime.replace();
  assert.equal(f.services.installed.length, 2);
  const second = f.tools();
  assert.notEqual(first, second);
  assert.equal(first.isMethodAvailable("tabs.list"), false, "the superseded projection is dead");
  assert.deepEqual(first.listTabs(viewOf(), { signal: live() }), []);
  await rejects(first.executeMethod("console.errors", { tab_id: f.id }, viewOf(), { signal: live() }), "UNAVAILABLE");
  assert.equal(f.runtime.getState().superseded, 1);
  assert.equal(second.isMethodAvailable("tabs.list"), true);
  assert.deepEqual(f.runtime.capabilities().filter(item => item.reason === "CLEANUP_PENDING").map(item => item.method),
    ["tabs.screenshot", "tabs.open", "tabs.navigate", "page.click", "page.type"]);
  await rejects(second.executeMethod("tabs.screenshot", { tab_id: f.id }, viewOf(), { signal: live() }), "UNAVAILABLE");
  closes[0].gate.resolve(false);
  await settle();
  assert.equal(f.runtime.getState().superseded, 1, "a failed receipt keeps it retained");
  closes[0].gate = deferred();
  const closing = f.runtime.close();
  closes[0].gate.resolve(true);
  assert.equal(await closing, true, "the explicit retry closes it");
  assert.equal(closes[0].attempts, 2);
  assert.equal(f.runtime.getState().superseded, 0);
});

test("process close installs inert tools synchronously, denies new work, awaits every owner and retries a failed close", async () => {
  let captureClose = false;
  const createCapture = deps => { const real = createAgentCaptureRuntime(deps); return Object.freeze({ ...real, close: async () => (captureClose ? real.close() : false) }); };
  const f = fixture({ createCapture });
  const attempt = f.runtime.close();
  const inert = f.tools();
  assert.equal(f.services.installed.length, 2, "revoked before any await");
  assert.deepEqual(Object.keys(inert).sort(), SIX);
  assert.equal(AGENT_BRIDGE_METHODS.some(method => inert.isMethodAvailable(method)), false);
  f.runtime.attachWindow(f.w.window(), { adapter: { isPrivateWindow: () => false } });
  assert.equal(f.runtime.getState().windows, 0, "no window attaches after close");
  assert.equal(await attempt, false);
  assert.equal(f.services.bridge, f.runtime, "a failed close keeps the owner registered");
  captureClose = true;
  assert.equal(await f.runtime.close(), true);
  assert.equal(f.services.bridge, null);
});

test("windows: one process owner, normal windows only; navigation and project changes end action prompts and receipts", () => {
  const calls = [];
  const createAction = deps => {
    const real = createAgentActionRuntime(deps);
    return Object.freeze({ ...real,
      attachWindow: window => { calls.push(["attach", window]); const detach = real.attachWindow(window); return () => { calls.push(["detach", window]); detach(); }; },
      invalidateBrowser: (window, browser) => { calls.push(["browser", window, browser]); real.invalidateBrowser(window, browser); },
      invalidateAll: () => { calls.push(["all"]); real.invalidateAll(); } });
  };
  const f = fixture({ createAction });
  const adapter = { isPrivateWindow: () => false };
  const detach = f.runtime.attachWindow(f.win, { adapter });
  assert.equal(f.runtime.attachWindow(f.win, { adapter }), detach, "idempotent per window");
  const hidden = f.w.window({ private: true });
  f.runtime.attachWindow(hidden, { adapter: { isPrivateWindow: () => true } });
  const other = f.w.window();
  const detachOther = f.runtime.attachWindow(other, { adapter });
  assert.equal(f.runtime.getState().windows, 2);
  assert.deepEqual(calls.filter(([kind]) => kind === "attach").map(([, window]) => window), [f.win, other]);
  f.w.navigate(f.tab, "http://localhost:4450/agent-tools?mode=navigated");
  assert.deepEqual(calls.at(-1), ["browser", f.win, f.tab.linkedBrowser]);
  for (const listener of f.services.listeners) listener({ phase: "settled", revision: 2 });
  assert.notDeepEqual(calls.at(-1), ["all"]);
  for (const listener of f.services.listeners) listener({ phase: "invalidated", revision: 3 });
  assert.deepEqual(calls.at(-1), ["all"]);
  detachOther();
  assert.equal(f.runtime.getState().windows, 1);
  assert.equal(f.win.progress.size, 1, "the closed window's watch is gone; this window keeps one shared listener");
  detach();
  assert.equal(f.win.progress.size, 0);
  assert.equal(f.tools().isMethodAvailable("tabs.list"), true, "closing a window never closes the process tools");
});

test("project.info: the session project from the validated cache; a null-project session gets null", async () => {
  const f = fixture();
  const tools = f.tools();
  assert.deepEqual(await tools.executeMethod("project.info", {}, viewOf(), { signal: live() }), { project_id: "p_harbor1", name: "Harbor Suite",
    root: "/synthetic/harbor", apps: [{ app: null, environments: [{ name: "local", base_url: "http://localhost:4450/" }] }], integrations: [] });
  assert.equal(await tools.executeMethod("project.info", {}, viewOf(null), { signal: live() }), null);
});

// ---------------------------------------------------------------- process-lifetime bounds

test("the released-session bound spans every generation: 4096 distinct IDs, then the tools close for good", async () => {
  assert.equal(RELEASED_SESSIONS_MAX, 4096);
  const f = fixture();
  const first = f.tools();
  for (let n = 0; n < 2048; n++) first.releaseSession(sessionId(n), "REVOKED");
  f.runtime.replace();
  const second = f.tools();
  for (let n = 0; n < 16; n++) second.releaseSession(sessionId(n), "REVOKED");
  assert.equal(f.runtime.getState().released_sessions, 2048, "an ID released in an earlier generation is never charged twice");
  for (let n = 2048; n < 4096; n++) second.releaseSession(sessionId(n), "REVOKED");
  await settle();
  let state = f.runtime.getState();
  assert.deepEqual([state.released_sessions, state.sessions_exhausted, state.superseded], [4096, false, 0]);
  assert.ok(state.tools.released_sessions < 4096, "no single standalone reached its own bound: the bridge's process bound counts");
  second.releaseSession(sessionId(7), "REVOKED");
  assert.equal(f.runtime.getState().sessions_exhausted, false, "a repeated ID at the bound is idempotent");
  assert.equal(second.isMethodAvailable("tabs.list"), true);
  assert.equal(await f.tools().executeMethod("project.info", {}, viewOf(), { signal: live() }) !== null, true, "an approved session still reads");

  const exhausting = second.releaseSession(sessionId(4096), "REVOKED");
  assert.ok(exhausting instanceof Promise);
  state = f.runtime.getState();
  assert.deepEqual([state.released_sessions, state.sessions_exhausted, state.installed], [4096, true, false]);
  assert.equal(second.isMethodAvailable("tabs.list"), false, "denied synchronously at the next distinct release");
  assert.deepEqual(second.listTabs(viewOf(), { signal: live() }), []);
  await rejects(second.executeMethod("console.errors", { tab_id: f.id }, viewOf(), { signal: live() }), "UNAVAILABLE");
  assert.equal(f.toolDeps.at(-1).isSessionActive(SESSION), false, "even a still-approved session is no longer admitted");
  assert.deepEqual([...new Set(f.runtime.capabilities().map(item => `${item.available}:${item.reason}`))], ["false:SESSIONS_EXHAUSTED"]);
  await settle();
  const inert = f.tools();
  assert.deepEqual(Object.keys(inert).sort(), SIX);
  assert.equal(AGENT_BRIDGE_METHODS.some(method => inert.isMethodAvailable(method)), false, "the channel holds inert tools");
  const installs = f.services.installed.length;
  assert.throws(() => f.runtime.replace(), error => error instanceof AgentToolError && error.code === "UNAVAILABLE", "replacement cannot restore it");
  assert.equal(f.services.installed.length, installs);
  assert.deepEqual([...new Set(f.runtime.capabilities().map(item => item.reason))], ["SESSIONS_EXHAUSTED"]);
  assert.equal(await f.runtime.close(), true);
  state = f.runtime.getState();
  assert.deepEqual([state.released_sessions, state.sessions_exhausted], [4096, true], "close keeps both facts");
});

test("a pending or failed superseded close stays retained and resets neither the session bound nor the shared budget quarantine", async () => {
  const closes = [], budgets = [];
  const createTools = deps => {
    const real = createGeckoAgentTools(deps);
    const index = closes.length;
    closes.push({ attempts: 0, gate: deferred() });
    return Object.freeze({ ...real, close: () => { closes[index].attempts++; real.close(); return index === 0 ? closes[index].gate.promise : real.close(); } });
  };
  const f = fixture({ createTools,
    createCapture: deps => { budgets.push(deps.allocationBudget); return createAgentCaptureRuntime(deps); },
    createAction: deps => { budgets.push(deps.allocationBudget); return createAgentActionRuntime(deps); } });
  assert.deepEqual(budgets, [f.allocationBudget, f.allocationBudget], "capture and actions share the bridge's one process budget");
  const first = f.tools();
  for (let n = 0; n < 3000; n++) first.releaseSession(sessionId(n), "REVOKED");
  assert.equal(f.allocationBudget.quarantine(), true, "an uncertain native owner quarantined the shared budget");
  f.runtime.replace();
  const second = f.tools();
  for (let n = 3000; n < 4096; n++) second.releaseSession(sessionId(n), "REVOKED");
  assert.equal(f.runtime.getState().superseded, 1, "the old close is pending");
  closes[0].gate.resolve(false);
  await settle();
  assert.equal(f.runtime.getState().superseded, 1, "a failed close stays retained");
  f.runtime.replace();
  await settle();
  const third = f.tools();
  assert.deepEqual([f.runtime.getState().superseded, f.runtime.getState().released_sessions], [1, 4096], "neither replacement reset the count");
  assert.throws(() => f.allocationBudget.claim({}), error => error.code === "UNAVAILABLE", "nor the quarantine");
  third.releaseSession(sessionId(4096), "REVOKED");
  assert.equal(f.runtime.getState().sessions_exhausted, true);
  closes[0].gate = deferred();
  const closing = f.runtime.close();
  closes[0].gate.resolve(true);
  assert.equal(await closing, true, "the explicit retry retires the old owner");
  const state = f.runtime.getState();
  assert.deepEqual([state.superseded, state.released_sessions, state.sessions_exhausted], [0, 4096, true]);
  assert.throws(() => f.allocationBudget.claim({}), error => error.code === "UNAVAILABLE", "a successful old close never clears quarantine");
});

test("an uncertain action construction or destroy quarantines the one shared budget: fresh action and capture owners stay refused after replace()", async () => {
  for (const failure of ["constructor throws", "destroy answers false", "destroy throws"]) {
    const action = actionWith(), remote = readerModules(), capture = captureWith(remote);
    if (failure === "constructor throws") action.behavior.constructorThrows = true;
    else if (failure === "destroy answers false") action.behavior.destroy = () => false;
    else action.behavior.destroy = () => { throw new Error("destroy"); };
    const f = fixture({ createTools: captureEnabledForTest, createAction: action.create, createCapture: capture.create });
    const params = { tab_id: f.id, selector: "#agent-click" };
    const admit = async () => {
      await f.tools().executeMethod("page.click", params, viewOf(), { tab: f.tools().getTab(f.id), signal: live() });
      return { method: "page.click", params, expected: action.executed.at(-1).options.expected,
        session: Object.freeze({ session: SESSION, project_id: "p_harbor1", state: "approved" }) };
    };
    const request = await admit();
    if (failure === "constructor throws") await rejects(action.deps.createOwner(request, { signal: live() }), "UNAVAILABLE");
    else {
      const owner = await action.deps.createOwner(request, { signal: live() });
      assert.equal(await owner.close(), false, `${failure}: never a positive close`);
    }
    assert.equal(action.constructed, 1, failure);
    assert.equal(f.runtime.getState().action.quarantined, true, failure);
    assert.equal(f.runtime.getState().action.retained_owners, 1, `${failure}: the uncertain owner stays retained`);
    f.runtime.replace();
    await settle();
    assert.equal(f.runtime.getState().superseded, 0);
    const fresh = await admit();
    await rejects(action.deps.createOwner(fresh, { signal: live() }), "UNAVAILABLE");
    assert.equal(action.constructed, 1, `${failure}: a fresh action owner never reaches its constructor`);
    await rejects(f.tools().executeMethod("tabs.screenshot", { tab_id: f.id }, viewOf(), { signal: live() }), "UNAVAILABLE");
    assert.deepEqual([remote.loads, remote.constructed], [1, 0], `${failure}: the root reader ran to the same claim and refused there`);
    assert.throws(() => f.allocationBudget.claim({}), error => error.code === "UNAVAILABLE");
    assert.equal(f.runtime.getState().capture.owners, 0, "the refused capture owner closed");
  }
});

test("a superseded generation's cleanup stays pending until the exact reader and PNG receipts succeed; nothing is published", async () => {
  const remote = readerModules(), capture = captureWith(remote);
  const destroy = deferred();
  remote.destroy = () => destroy.promise; // the owned session's destroy is still settling
  const f = fixture({ createTools: captureEnabledForTest, createCapture: capture.create });
  const first = f.tools();
  const outcome = first.executeMethod("tabs.screenshot", { tab_id: f.id }, viewOf(), { signal: live() }).then(() => "published", error => error.code);
  await settle();
  assert.deepEqual([remote.constructed, remote.destroyed], [1, 1], "the reader holds its native session's destroy");
  assert.equal(capture.observers.size, 1, "the readback observer is held");
  const [box] = capture.boxes;
  box.closeResult = false;
  f.runtime.replace();
  const second = f.tools();
  await settle();
  assert.equal(f.runtime.getState().superseded, 1, "the reader's close receipt is pending");
  assert.deepEqual(f.runtime.capabilities().filter(item => item.reason === "CLEANUP_PENDING").map(item => item.method),
    ["tabs.screenshot", "tabs.open", "tabs.navigate", "page.click", "page.type"]);
  await rejects(second.executeMethod("tabs.screenshot", { tab_id: f.id }, viewOf(), { signal: live() }), "UNAVAILABLE");
  assert.equal(remote.constructed, 1, "no second reader session while cleanup is pending");
  destroy.resolve(undefined);
  await settle();
  assert.equal(await outcome, "NOT_APPROVED", "the cancelled screenshot publishes nothing");
  assert.equal(f.runtime.getState().superseded, 1, "the reader closed, but the PNG owner's receipt was false");
  assert.equal(f.runtime.getState().capture.owners, 1);
  assert.equal(capture.observers.size, 1, "the observer stays until both receipts are positive");
  box.closeResult = true;
  assert.equal(await f.runtime.close(), true, "the explicit retry retires it");
  assert.deepEqual([f.runtime.getState().superseded, f.runtime.getState().capture.owners, capture.observers.size], [0, 0, 0]);
  assert.deepEqual([remote.constructed, remote.destroyed], [1, 1], "the exact reader session was destroyed exactly once");
  assert.equal(box.closes, 2);
});
