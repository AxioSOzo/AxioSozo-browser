/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 8: the conditions root's ordinary-profile native gate relies on,
// checked with injected native modules and owners only. Automation coexistence
// refuses before any allocation: every fact must be literally false, and the
// action owner admits the request before its lazy native tracking import (a
// counted navigation()); window ownership is Node.documentGlobal
// (never ownerGlobal); the registry's original issued descriptor, not a clone,
// carries capture authority; the actual AgentChannelService accepts exactly the
// six-function composite; capture and every act/open flag are literal false
// with no preference or environment activation. Unit results are not native
// proof: no Gecko, Marionette, RemoteAgent, socket, MCP or GUI is involved.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./support/chrome-modules.mjs";

const { createAgentBridgeRuntime, CAPTURE_ENABLED, AGENT_BRIDGE_METHODS } = await import("../chrome/AgentBridgeRuntime.sys.mjs");
const { createAgentCaptureRuntime } = await import("../chrome/AgentCaptureRuntime.sys.mjs");
const actionModule = await import("../chrome/AgentActionRuntime.sys.mjs");
const { ACTION_CAPABILITIES } = actionModule;
const { createGeckoAgentTools } = await import("../chrome/GeckoAgentTools.sys.mjs");
const { createAgentChannelService } = await import("../chrome/AgentChannelService.sys.mjs");
const { createGeckoBiDiReadSession, createBiDiAllocationBudget, AgentToolError } = await import("../chrome/GeckoBiDiReadSession.sys.mjs");
const { AgentTabRegistry } = await import("../chrome/AgentTabRegistry.sys.mjs");

const SESSION = "s_0000000000000001";
const rejects = (promise, code) => assert.rejects(promise, error => error instanceof AgentToolError && error.code === code);
const source = name => readFileSync(new URL(`../chrome/${name}`, import.meta.url), "utf8");
const tick = () => new Promise(resolve => setImmediate(resolve));
const settle = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await tick(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const view = Object.freeze({ session: SESSION, project_id: "p_harbor1", client: Object.freeze({ name: "agent-bridge", agent: "codex", version: "1" }), state: "approved" });
// Every value that is not the literal false; each is read through a fresh getter.
const STRICT = [["true", () => true], ["undefined", () => undefined], ["null", () => null], ["a string", () => "false"], ["zero", () => 0],
  ["a promise", () => Promise.resolve(false)], ["a thenable", () => ({ then: resolve => resolve(false) })], ["a throw", () => { throw new Error("unreadable"); }]];
const FACTS = ["remoteEnabled", "remoteRunning", "system", "marionetteEnabled", "marionetteRunning", "session"];

function nativeWorld() {
  let inner = 100, browsers = 0;
  const w = { revision: 1, windows: new Set(), active: null };
  w.window = () => {
    const tabs = [];
    const win = { closed: false, private: false, document: { hidden: false }, windowState: 1, STATE_MINIMIZED: 2, devicePixelRatio: 2,
      gBrowser: { tabs, selectedTab: null, get selectedBrowser() { return this.selectedTab?.linkedBrowser ?? null; },
        getTabForBrowser: browser => tabs.find(tab => tab.linkedBrowser === browser) ?? null,
        addTabsProgressListener() {}, removeTabsProgressListener() {}, tabContainer: { addEventListener() {}, removeEventListener() {} } } };
    w.windows.add(win); w.active ??= win;
    return win;
  };
  w.tab = win => {
    const browser = { browserId: ++browsers, permanentKey: {}, currentURI: { spec: "http://localhost:4450/agent-tools" }, docShellIsActive: true, fullZoom: 1,
      getBoundingClientRect: () => ({ width: 1200, height: 800 }) };
    const context = { isContent: true, parent: null, isDiscarded: false, usePrivateBrowsing: false, overrideDPPX: 0, children: [],
      originAttributes: { privateBrowsingId: 0, userContextId: 0 }, embedderElement: browser };
    context.top = context;
    context.currentWindowGlobal = { innerWindowId: ++inner, isCurrentGlobal: true, isClosed: false, documentURI: { spec: "http://localhost:4450/agent-tools" },
      browsingContext: context, documentPrincipal: { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true, privateBrowsingId: 0, userContextId: 0 } };
    Object.assign(browser, { browsingContext: context, frameLoader: { ownerElement: browser, browsingContext: context } });
    const tab = { documentGlobal: win, closing: false, isConnected: true, linkedBrowser: browser };
    win.gBrowser.tabs.push(tab); win.gBrowser.selectedTab = tab;
    return tab;
  };
  // Window ownership is read exactly as the Step 7 console owner reads it.
  w.registry = new AgentTabRegistry({
    isPrivateWindow: win => (w.windows.has(win) ? win.private : null), isWindowRegistered: win => w.windows.has(win), isWindowClosed: win => win.closed,
    isTabLive: (tab, win) => tab.documentGlobal === win && tab.closing === false && tab.isConnected === true,
    getBrowser: (tab, win) => (win.gBrowser.getTabForBrowser(tab.linkedBrowser) === tab ? tab.linkedBrowser : null),
    isPrivateBrowser: browser => browser.browsingContext.usePrivateBrowsing,
    getBrowserIdentity: browser => ({ nativeBrowserId: browser.browserId, permanentKey: browser.permanentKey, browsingContext: browser.browsingContext,
      frameLoader: browser.frameLoader, frameLoaderOwner: browser.frameLoader.ownerElement, frameLoaderContext: browser.frameLoader.browsingContext }),
    getContextState: context => ({ isContent: true, top: context.top, isDiscarded: false, private: false, privateBrowsingId: 0, userContextId: 0, embedder: context.embedderElement }),
    getCurrentDocument: context => context.currentWindowGlobal,
    getDocumentState: global => ({ browsingContext: global.browsingContext, isCurrentGlobal: global.isCurrentGlobal, isClosed: global.isClosed, failedChannel: null,
      document_id: global.innerWindowId, principal: global.documentPrincipal, isSystemPrincipal: false, isNullPrincipal: false, privateBrowsingId: 0, userContextId: 0 }),
    getDocumentURL: (global, browser) => (global.documentURI.spec === browser.currentURI.spec ? global.documentURI.spec : null),
    getTitle: () => "", getEngine: () => "gecko", isActiveTab: (tab, win) => w.active === win && win.gBrowser.selectedTab === tab,
    getRoute: () => ({ contextUuid: null, revision: 0 }), getProjectRevision: () => w.revision,
    matchProject: () => ({ project_id: "p_harbor1", ambiguous: false, revision: w.revision }), classifyHost: () => ({ sensitive: false }),
  });
  w.services = { isNormalWindow: win => w.windows.has(win) && !win.closed, readNativeProjectSnapshot: () => ({ revision: w.revision, projects: [] }),
    captureNativeProjectAuthority: ({ project_id }) => ({ id: project_id, root: "/synthetic/harbor", revision: w.revision, check: () => true }) };
  return w;
}

/** Injected native-shaped remote modules. Facts default to false and are read
 * fresh through getters over `values` (a function value is called on each
 * read); `action.navigation()` is the counted lazy native tracking import. */
function remoteModules(values = {}) {
  const constructed = [], counts = { loads: 0, navigation: 0 };
  const fact = key => (Object.hasOwn(values, key) ? (typeof values[key] === "function" ? values[key]() : values[key]) : false);
  class WebDriverSession { static SESSION_FLAG_BIDI = "bidi"; constructor() { constructed.push(this); } execute() { return Promise.resolve({ data: "" }); } destroy() {} }
  const shared = { WebDriverSession, hasActiveWebDriverSession: () => fact("session"),
    RemoteAgent: values.remote === null ? undefined
      : { get enabled() { return fact("remoteEnabled"); }, get running() { return fact("remoteRunning"); }, get allowSystemAccess() { return fact("system"); } },
    Marionette: values.marionette === null ? undefined
      : values.marionette ?? { get enabled() { return fact("marionetteEnabled"); }, get running() { return fact("marionetteRunning"); } } };
  return { constructed, counts, values,
    modules: async () => ({ ...shared, getNavigableManager: async () => ({ getIdForBrowsingContext: () => "ctx" }) }),
    action: { ...shared, navigation: async () => {
      counts.navigation++;
      if (values.navigationGate) await values.navigationGate;
      return { NavigableManager: { getIdForBrowsingContext: () => "ctx" } };
    } } };
}

/** The actual action runtime on the actual registry, with the remote modules
 * above and a boundary stand-in that only records what it was handed. */
function actionHarness(remote, { loadGate = null } = {}) {
  const w = nativeWorld();
  const win = w.window();
  const id = w.registry.register(w.tab(win), win);
  const approved = new Set([SESSION]);
  const claims = [], executed = [];
  let deps = null;
  const runtime = actionModule.createAgentActionRuntime({ registry: w.registry, services: w.services, isSessionActive: value => approved.has(value),
    timers: { setTimeout: () => 1, clearTimeout() {} }, allocationBudget: { claim: document => claims.push(document), quarantine: () => true },
    registerActor: () => {}, loadRemote: async () => { remote.counts.loads++; if (loadGate) await loadGate; return remote.action; },
    createBoundary: boundaryDeps => {
      deps = boundaryDeps;
      return Object.freeze({ isMethodAvailable: method => actionModule.ACT_METHODS.includes(method), getCapabilities: () => ({}),
        getState: () => ({ busy: false, pending_operations: 0, retained_created_targets: 0, effect_dispatched: false, cleanup_incomplete: false }),
        executeMethod: async (method, params, session, options) => { executed.push(options); return {}; },
        releaseSession: async () => true, close: async () => true });
    } });
  const copy = () => { const issued = w.registry.metadata(id); return Object.freeze({ tab_id: id, url: issued.url, project_id: issued.project_id, document_id: issued.document_id, engine: "gecko" }); };
  const click = (signal = new AbortController().signal) => runtime.executeMethod("page.click", { tab_id: id, selector: "#agent-click" }, view, { tab: copy(), signal });
  return { w, id, approved, claims, executed, runtime, click, deps: () => deps };
}

test("the genuine BiDi reader refuses any automation fact that is not literally false, or unknown modules, before any allocation", async () => {
  const cases = [...FACTS.flatMap(key => STRICT.map(([name, value]) => [`${key} = ${name}`, { [key]: value }])),
    ["unknown RemoteAgent", { remote: null }], ["unknown Marionette", { marionette: null }], ["all false", {}]];
  for (const [name, values] of cases) {
    const claims = [];
    const remote = remoteModules(values);
    const reader = createGeckoBiDiReadSession({ loadModules: remote.modules, setTimer: () => 1, clearTimer() {},
      allocationBudget: { claim: document => claims.push(document), quarantine: () => true } });
    const w = nativeWorld();
    const tab = w.tab(w.window());
    const native = { browsingContext: tab.linkedBrowser.browsingContext, document_id: "101", url: "http://localhost:4450/agent-tools" };
    if (name === "all false") {
      assert.deepEqual(await reader.capture(native), { data_base64: "" }, "the positive control reaches the owned session");
      assert.deepEqual([claims.length, remote.constructed.length], [1, 1]);
      continue;
    }
    await rejects(reader.capture(native), "UNAVAILABLE");
    assert.equal(claims.length, 0, `${name}: no allocation budget is consumed`);
    assert.equal(remote.constructed.length, 0, `${name}: no session is constructed`);
  }
});

test("the action owner admits only literal-false automation facts, before native tracking, budget, constructor or dispatch", async () => {
  const cases = [...FACTS.flatMap(key => STRICT.map(([name, value]) => [`${key} = ${name}`, { [key]: value }])),
    ["unknown RemoteAgent", { remote: null }], ["unknown Marionette", { marionette: null }]];
  for (const [name, values] of cases) {
    const remote = remoteModules(values);
    const h = actionHarness(remote);
    await rejects(h.click(), "UNAVAILABLE");
    assert.deepEqual([remote.counts.navigation, remote.constructed.length, h.claims.length, h.executed.length], [0, 0, 0, 0],
      `${name}: no native tracking, constructor, budget or dispatch`);
  }
  const remote = remoteModules();
  const h = actionHarness(remote);
  await h.click();
  assert.deepEqual([remote.counts.navigation, h.executed.length, remote.constructed.length, h.claims.length], [1, 1, 0, 0],
    "every fact false: admitted to the boundary; nothing constructed before its owner callback");
});

test("only the pinned native Marionette startup value reads as false, and only in the native loader", async () => {
  const startup = remoteModules({ marionette: actionModule.nativeMarionetteFacts({ enabled: undefined, running: false }) });
  const admitted = actionHarness(startup);
  await admitted.click();
  assert.deepEqual([startup.counts.navigation, admitted.executed.length], [1, 1], "the source-defined never-enabled state");
  for (const [name, marionette] of [["an injected undefined", { enabled: undefined, running: false }],
    ["native null", actionModule.nativeMarionetteFacts({ enabled: null, running: false })],
    ["native running unknown", actionModule.nativeMarionetteFacts({ enabled: undefined, running: undefined })],
    ["native enabled", actionModule.nativeMarionetteFacts({ enabled: true, running: false })]]) {
    const remote = remoteModules({ marionette });
    const h = actionHarness(remote);
    await rejects(h.click(), "UNAVAILABLE");
    assert.deepEqual([remote.counts.navigation, h.executed.length], [0, 0], name);
  }
  const code = source("AgentActionRuntime.sys.mjs");
  assert.equal(code.match(/nativeMarionetteFacts\(/gu).length, 2, "defined once and applied once");
  assert.match(code, /Marionette: nativeMarionetteFacts\(marionette\.Marionette\)/u, "applied to the native singleton in the loader");
});

test("an aborted, unapproved or revoked request never invokes the native tracking import, even while the remote modules load", async () => {
  const remote = remoteModules();
  const controller = new AbortController(); controller.abort();
  await rejects(actionHarness(remote).click(controller.signal), "NOT_APPROVED");
  const unapproved = actionHarness(remote);
  unapproved.approved.clear();
  await rejects(unapproved.click(), "NOT_APPROVED");
  assert.deepEqual([remote.counts.loads, remote.counts.navigation], [0, 0], "neither loads the remote modules");
  for (const [name, change] of [["revoked", h => h.approved.clear()], ["aborted", (h, c) => c.abort()],
    ["Marionette started", (h, c, r) => { r.values.marionetteRunning = true; }], ["a WebDriver session started", (h, c, r) => { r.values.session = true; }]]) {
    const gate = deferred();
    const r = remoteModules();
    const h = actionHarness(r, { loadGate: gate.promise });
    const signal = new AbortController();
    const pending = h.click(signal.signal);
    await settle();
    assert.equal(r.counts.loads, 1);
    change(h, signal, r);
    gate.resolve();
    await assert.rejects(pending, error => error instanceof AgentToolError, name);
    assert.deepEqual([r.counts.navigation, h.executed.length, r.constructed.length, h.claims.length], [0, 0, 0, 0], `${name}: no native tracking`);
  }
});

test("a fact that changes after the tracking import, or before construction, refuses before constructor or dispatch", async () => {
  for (const key of FACTS) {
    const gate = deferred();
    const r = remoteModules({ navigationGate: gate.promise });
    const h = actionHarness(r);
    const pending = h.click();
    await settle();
    assert.equal(r.counts.navigation, 1);
    r.values[key] = true;
    gate.resolve();
    await rejects(pending, "UNAVAILABLE");
    assert.deepEqual([h.executed.length, r.constructed.length, h.claims.length], [0, 0, 0], key);
  }
  const r = remoteModules();
  const h = actionHarness(r);
  await h.click();
  const request = { method: "page.click", params: { tab_id: h.id, selector: "#agent-click" }, expected: h.executed.at(-1).expected,
    session: Object.freeze({ session: SESSION, project_id: "p_harbor1", state: "approved" }) };
  r.values.remoteRunning = true;
  await rejects(h.deps().createOwner(request, { signal: new AbortController().signal }), "UNAVAILABLE");
  assert.deepEqual([h.claims.length, r.constructed.length], [0, 0], "refused before the budget claim");
  r.values.remoteRunning = false;
  const owner = await h.deps().createOwner(request, { signal: new AbortController().signal });
  assert.deepEqual([h.claims.length, r.constructed.length], [1, 1], "unchanged false: one claim, one owned session");
  assert.equal(await owner.close(), true);
});

test("one process BiDi retention budget is shared by capture and actions; a refused session leaves its slot unused", async () => {
  const w = nativeWorld();
  const win = w.window();
  const tab = w.tab(win);
  w.registry.register(tab, win);
  const seen = [];
  const budget = createBiDiAllocationBudget({ perDocument: 1, perProcess: 1 });
  createAgentBridgeRuntime({ services: { ...w.services, registerAgentBridge: () => () => {}, installAgentBridgeTools: () => true,
    isApprovedBridgeSession: () => false, agentBridgeProject: () => null, onNativeProjectAuthority: () => () => {} },
  nativeOwner: { registry: w.registry, service: { readTab: () => ({ count: 0, messages: [] }) }, ownerForTab: () => null },
  timers: { setTimeout: () => 1, clearTimeout() {} }, allocationBudget: budget,
  createCapture: deps => { seen.push(["capture", deps.allocationBudget]); return createAgentCaptureRuntime(deps); },
  createAction: deps => { seen.push(["action", deps.allocationBudget]); return actionModule.createAgentActionRuntime(deps); } });
  assert.deepEqual(seen, [["capture", budget], ["action", budget]]);
  const remote = remoteModules({ marionetteRunning: true });
  const refused = createGeckoBiDiReadSession({ loadModules: remote.modules, setTimer: () => 1, clearTimer() {}, allocationBudget: budget });
  await rejects(refused.capture({ browsingContext: tab.linkedBrowser.browsingContext, document_id: "101", url: "http://localhost:4450/agent-tools" }), "UNAVAILABLE");
  assert.doesNotThrow(() => budget.claim({}), "the single slot is still free");
});

test("window ownership is Node.documentGlobal: a missing or other documentGlobal refuses even when ownerGlobal looks right", () => {
  for (const [name, change, allowed] of [
    ["documentGlobal is the window; no ownerGlobal", () => {}, true],
    ["ownerGlobal points elsewhere and is ignored", (tab, win, other) => { tab.ownerGlobal = other; }, true],
    ["documentGlobal missing, ownerGlobal the window", (tab, win) => { delete tab.documentGlobal; tab.ownerGlobal = win; }, false],
    ["documentGlobal another window, ownerGlobal the window", (tab, win, other) => { tab.documentGlobal = other; tab.ownerGlobal = win; }, false],
    ["documentGlobal null", tab => { tab.documentGlobal = null; }, false],
    ["documentGlobal throws", tab => { Object.defineProperty(tab, "documentGlobal", { get() { throw new Error("x"); } }); }, false],
    ["the window closed", (tab, win) => { win.closed = true; }, false],
    ["the global no longer current", tab => { tab.linkedBrowser.browsingContext.currentWindowGlobal.isCurrentGlobal = false; }, false],
  ]) {
    const w = nativeWorld();
    const win = w.window(), other = w.window();
    const tab = w.tab(win);
    const id = w.registry.register(tab, win);
    const runtime = createAgentCaptureRuntime({ registry: w.registry, services: w.services, timers: { setTimeout: () => 1, clearTimeout() {} },
      allocationBudget: createBiDiAllocationBudget(), registerActor: () => true, readPref: () => false });
    const expected = runtime.getCaptureExpected(w.registry.metadata(id));
    const request = Object.freeze({ tab_id: id, expected });
    change(tab, win, other);
    assert.equal(runtime.isCaptureCurrent(expected, request), allowed, name);
  }
  for (const name of ["AgentBridgeRuntime.sys.mjs", "AgentCaptureRuntime.sys.mjs", "AgentActionRuntime.sys.mjs", "AgentCaptureChild.sys.mjs", "AgentActionChild.sys.mjs"]) {
    const code = source(name).replace(/\/\/.*$/gmu, "");
    assert.doesNotMatch(code, /ownerGlobal|ownerDocument\.defaultView/u, `${name} never uses ownerGlobal`);
  }
});

test("the original issued descriptor carries authority; a frozen clone or a sanitized copy never does", () => {
  const w = nativeWorld();
  const win = w.window();
  const id = w.registry.register(w.tab(win), win);
  const runtime = createAgentCaptureRuntime({ registry: w.registry, services: w.services, timers: { setTimeout: () => 1, clearTimeout() {} },
    allocationBudget: createBiDiAllocationBudget(), registerActor: () => true, readPref: () => false });
  const issued = w.registry.metadata(id);
  const expected = runtime.getCaptureExpected(issued);
  assert.equal(runtime.isCaptureCurrent(expected, { tab_id: id, expected }), true);
  const clone = Object.freeze(structuredClone(expected));
  assert.equal(w.registry.metadata(id, { expected: clone }), null);
  assert.equal(runtime.getCaptureExpected(clone), null);
  assert.equal(runtime.isCaptureCurrent(clone, { tab_id: id, expected: clone }), false);
  const { binding_token, project_revision, route_revision, ...sanitized } = issued;
  assert.ok(binding_token && Number.isSafeInteger(project_revision) && Number.isSafeInteger(route_revision));
  assert.equal(runtime.getCaptureExpected(Object.freeze(sanitized)), null);
});

function channel() {
  return createAgentChannelService({ loadProjects: async () => [], validateProject: value => value, validateStatusRecord: value => value,
    parseHookEvent: () => null, now: () => 1, randomHex: () => "0".repeat(16), isSensitiveHost: () => ({ sensitive: false }),
    createNativeConfiguration: () => { throw new Error("never started here"); }, createTransportRuntime: () => { throw new Error("never started here"); },
    timers: { setTimeout: () => 1, clearTimeout() {} } });
}

test("the actual AgentChannelService accepts exactly the six-function composite; the standalone owner and extra functions are refused", () => {
  const service = channel();
  const w = nativeWorld();
  const win = w.window();
  w.registry.register(w.tab(win), win);
  let installed = null, standalone = null;
  const services = { ...w.services, registerAgentBridge: () => () => {}, agentBridgeProject: () => null, onNativeProjectAuthority: () => () => {},
    isApprovedBridgeSession: id => service.isApprovedBridgeSession(id),
    installAgentBridgeTools: tools => { service.installTools(tools); installed = tools; return true; } };
  createAgentBridgeRuntime({ services, timers: { setTimeout: () => 1, clearTimeout() {} },
    nativeOwner: { registry: w.registry, service: { readTab: () => ({ count: 0, messages: [] }) }, ownerForTab: () => null },
    createTools: deps => (standalone = createGeckoAgentTools(deps)) });
  assert.deepEqual(Object.keys(installed).sort(), ["confirmAction", "executeMethod", "getTab", "isMethodAvailable", "listTabs", "releaseSession"]);
  assert.equal(Object.hasOwn(installed, "close"), false);
  assert.ok(Object.hasOwn(standalone, "close") && Object.hasOwn(standalone, "getState"), "the private owner stays outside the Service");
  const snapshot = service.getEndpointState();
  assert.equal(snapshot.enabled, false, "installing tools starts nothing");
  assert.equal(snapshot.methods.every(method => method.available === false), true, "while the endpoint is off nothing is offered");
  assert.equal(service.isApprovedBridgeSession(SESSION), false, "no approval exists");
  assert.throws(() => service.installTools({ ...installed, close: () => true }), error => error.code === "INVALID_RUNTIME");
  assert.throws(() => service.installTools(standalone), error => error.code === "INVALID_RUNTIME");
  assert.throws(() => service.installTools(Object.create(installed)), error => error.code === "INVALID_RUNTIME", "inherited functions");
  assert.doesNotThrow(() => service.installTools(installed));
});

test("capture and every act/open flag are literal false, with no preference, environment or page activation", () => {
  assert.equal(CAPTURE_ENABLED, false);
  assert.deepEqual(ACTION_CAPABILITIES, { click: false, type: false, navigate: false, open: false });
  const bridge = source("AgentBridgeRuntime.sys.mjs"), action = source("AgentActionRuntime.sys.mjs"), capture = source("AgentCaptureRuntime.sys.mjs");
  assert.match(bridge, /export const CAPTURE_ENABLED = false;/u);
  assert.match(bridge, /captureEnabled: CAPTURE_ENABLED,/u);
  assert.match(action, /export const ACTION_CAPABILITIES = Object\.freeze\(\{ click: false, type: false, navigate: false, open: false \}\);/u);
  assert.match(action, /capabilities: ACTION_CAPABILITIES,/u);
  for (const [name, code] of [["bridge", bridge], ["action", action], ["capture", capture]]) {
    for (const pattern of [/Services\.prefs/u, /Services\.env/u, /getBoolPref/u, /setBoolPref/u, /axiosozo\.[a-z]/u, /\.listen\(/u, /allowSystemAccess\s*=/u,
      /enabled\s*=\s*true/u, /captureEnabled:\s*true/u, /click:\s*true/u]) {
      assert.doesNotMatch(code, pattern, `${name}: ${pattern}`);
    }
  }
  const w = nativeWorld();
  const win = w.window();
  w.registry.register(w.tab(win), win);
  let tools = null;
  createAgentBridgeRuntime({ services: { ...w.services, registerAgentBridge: () => () => {}, installAgentBridgeTools: value => { tools = value; return true; },
    isApprovedBridgeSession: () => true, agentBridgeProject: () => null, onNativeProjectAuthority: () => () => {} },
  nativeOwner: { registry: w.registry, service: { readTab: () => ({ count: 0, messages: [] }) }, ownerForTab: () => null }, timers: { setTimeout: () => 1, clearTimeout() {} } });
  assert.deepEqual(AGENT_BRIDGE_METHODS.filter(method => tools.isMethodAvailable(method)), ["tabs.list", "tabs.active", "project.info", "console.errors"]);
});
