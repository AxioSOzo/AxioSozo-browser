/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 8: AgentActionRuntime around the root's pure AgentActBoundary,
// with the actual AgentTabRegistry, native-shaped fake windows/tabs, a fake
// PopupNotifications, fake remote-agent modules and fake action actors. Every
// act/open capability is a literal false in the product: the first tests prove
// UNAVAILABLE before any prompt, remote load or owner. The rest drive the
// runtime's own callbacks through a test-only boundary stand-in, or through the
// actual pure boundary with a test-only capability wrapper, to prove strict
// automation facts, admission before native tracking, receipts bound to the
// issued binding, owner quarantine, created-tab attribution and cleanup order.
// None of this is native effect, privacy or cleanup evidence.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";

const { createAgentActionRuntime, ACTION_CAPABILITIES, FIXED_ACTION_SOURCES, ACT_METHODS, validateActionSources,
  automationOff, agentsOff, nativeMarionetteFacts, TAB_TOUCH_EVENTS } = await import("../chrome/AgentActionRuntime.sys.mjs");
const { createAgentActBoundary, ACT_BOUNDARY_SANDBOX } = await import("../chrome/AgentActBoundary.sys.mjs");
const { AGENT_ACTION_ACTOR, AGENT_ACTION_MESSAGES, ACTION_GATE_NAME } = await import("../chrome/AgentActionChild.sys.mjs");
const { AgentTabRegistry } = await import("../chrome/AgentTabRegistry.sys.mjs");
const { AgentToolError } = await import("../chrome/GeckoBiDiReadSession.sys.mjs");

const SESSION = "s_0000000000000001";
const URL_A = "http://localhost:4450/agent-tools?mode=clean";
const OPENED = "http://localhost:4450/agent-tools?mode=opened";
const tick = () => new Promise(resolve => setImmediate(resolve));
const settle = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await tick(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const rejects = (promise, code) => assert.rejects(promise, error => error instanceof AgentToolError && error.code === code);
const deepFreeze = value => { if (value && typeof value === "object") { for (const child of Object.values(value)) deepFreeze(child); Object.freeze(value); } return value; };
const viewOf = (project_id = "p_harbor1", session = SESSION) => deepFreeze({ session, project_id, client: { name: "agent-bridge", agent: "claude-code", version: "1" }, state: "approved" });

function nativeWorld() {
  let inner = 100, browsers = 0;
  // `epoch` models Services' native authority: any invalidation moves it for good.
  const w = { revision: 1, epoch: 1, authority: true, windows: new Set(), active: null, contexts: new Map(), routes: new Map(), queries: [], replies: {} };
  // Native-shaped event targets: listeners per [type, function], as the DOM keeps them.
  const target = () => {
    const listeners = new Set();
    return { listeners, failing: null,
      addEventListener(type, fn) { if (this.failing === type) throw new Error("listener refused"); listeners.add([type, fn]); },
      removeEventListener(type, fn) { for (const entry of listeners) if (entry[0] === type && entry[1] === fn) listeners.delete(entry); },
      dispatch(type, event) { for (const [kind, fn] of [...listeners]) if (kind === type) fn(event); },
      count(type) { return [...listeners].filter(([kind]) => type === undefined || kind === type).length; } };
  };
  w.window = () => {
    const tabs = [], shown = [], progress = new Set();
    const win = { closed: false, private: false, document: { activeElement: null }, shown, progress,
      PopupNotifications: { show(browser, id, message, anchor, main, secondary, options) { const n = { browser, message, main, secondary, options, removed: false }; shown.push(n); return n; },
        remove(n) { n.removed = true; } },
      gBrowser: { tabs, selectedTab: null, getTabForBrowser: browser => tabs.find(tab => tab.linkedBrowser === browser) ?? null,
        removeTab(tab) { if (w.removeTab) return w.removeTab(tab); w.event(win, "TabClose", tab); tab.closing = true; tab.isConnected = false; tabs.splice(tabs.indexOf(tab), 1); },
        addTabsProgressListener: listener => progress.add(listener), removeTabsProgressListener: listener => progress.delete(listener),
        tabContainer: target(), ...target() } };
    w.windows.add(win); w.active ??= win;
    return win;
  };
  /** A pinned tabbrowser event: tab events bubble to the container; TabMultiSelect is the tabbrowser's own. */
  w.event = (win, type, tab, detail = {}) => (type === "TabMultiSelect" ? win.gBrowser : win.gBrowser.tabContainer).dispatch(type, { type, target: tab, detail });
  /** Select a tab the way the native tabbrowser does: TabSelect on the new tab, naming the previous one. */
  w.select = (win, tab) => {
    const previous = win.gBrowser.selectedTab;
    if (previous) previous.selected = false;
    win.gBrowser.selectedTab = tab; tab.selected = true;
    w.event(win, "TabSelect", tab, { previousTab: previous });
  };
  w.pin = (win, tab, pinned) => { tab.pinned = pinned; w.event(win, pinned ? "TabPinned" : "TabUnpinned", tab); };
  w.load = (tab, url) => {
    const browser = tab.linkedBrowser, context = browser.browsingContext, previous = context.currentWindowGlobal;
    if (previous) { previous.isCurrentGlobal = false; previous.isClosed = true; }
    const global = { innerWindowId: ++inner, isCurrentGlobal: true, isClosed: false, failedChannel: null, documentURI: { spec: url }, browsingContext: context,
      documentPrincipal: { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true, privateBrowsingId: 0, userContextId: context.originAttributes.userContextId },
      actor: null, getActor(name) { this.actor ??= w.makeActor(this, name); return this.actor; }, getExistingActor() { return this.actor; } };
    context.currentWindowGlobal = global;
    browser.currentURI = { spec: url };
    return global;
  };
  w.navigate = (tab, url) => {
    w.load(tab, url);
    for (const listener of [...tab.documentGlobal.progress]) listener.onLocationChange(tab.linkedBrowser, { isTopLevel: true });
  };
  w.tab = (win, { url = URL_A, userContextId = 0, select = true } = {}) => {
    const browser = { browserId: ++browsers, permanentKey: {}, canGoBack: false };
    const context = { id: browser.browserId, isContent: true, parent: null, isDiscarded: false, usePrivateBrowsing: false, children: [],
      originAttributes: { privateBrowsingId: 0, userContextId }, embedderElement: browser };
    context.top = context;
    w.contexts.set(`ctx-${context.id}`, context);
    Object.assign(browser, { browsingContext: context, frameLoader: { ownerElement: browser, browsingContext: context } });
    const tab = { documentGlobal: win, closing: false, isConnected: true, linkedBrowser: browser, selected: false };
    w.load(tab, url);
    win.gBrowser.tabs.push(tab);
    if (select) { win.gBrowser.selectedTab = tab; tab.selected = true; }
    return tab;
  };
  w.opened = (win, tab) => w.event(win, "TabOpen", tab);
  w.makeActor = global => ({ manager: global, sendQuery(name, data) {
    w.queries.push([name, data]);
    if (w.replies[name]) return Promise.resolve(w.replies[name](data));
    if (name === AGENT_ACTION_MESSAGES.ADMIT) return Promise.resolve({ v: 1, token: data.token, ok: true });
    if (name === AGENT_ACTION_MESSAGES.INSTALL) return Promise.resolve({ v: 1, token: data.token, installed: true });
    return Promise.resolve({ v: 1, token: data.token, revoked: true });
  } });
  w.registry = new AgentTabRegistry({
    isPrivateWindow: win => (w.windows.has(win) ? win.private : null), isWindowRegistered: win => w.windows.has(win), isWindowClosed: win => win.closed,
    isTabLive: (tab, win) => tab.documentGlobal === win && !tab.closing && tab.isConnected,
    getBrowser: (tab, win) => (win.gBrowser.getTabForBrowser(tab.linkedBrowser) === tab ? tab.linkedBrowser : null),
    isPrivateBrowser: browser => browser.browsingContext.usePrivateBrowsing,
    getBrowserIdentity: browser => ({ nativeBrowserId: browser.browserId, permanentKey: browser.permanentKey, browsingContext: browser.browsingContext,
      frameLoader: browser.frameLoader, frameLoaderOwner: browser.frameLoader.ownerElement, frameLoaderContext: browser.frameLoader.browsingContext }),
    getContextState: context => ({ isContent: true, top: context.top, isDiscarded: false, private: false, privateBrowsingId: 0,
      userContextId: context.originAttributes.userContextId, embedder: context.embedderElement }),
    getCurrentDocument: context => context.currentWindowGlobal,
    getDocumentState: global => ({ browsingContext: global.browsingContext, isCurrentGlobal: global.isCurrentGlobal, isClosed: global.isClosed, failedChannel: null,
      document_id: global.innerWindowId, principal: global.documentPrincipal, isSystemPrincipal: false, isNullPrincipal: false, privateBrowsingId: 0,
      userContextId: global.documentPrincipal.userContextId }),
    getDocumentURL: (global, browser) => (global.documentURI.spec === browser.currentURI.spec ? global.documentURI.spec : null),
    getTitle: () => "", getEngine: () => "gecko", isActiveTab: (tab, win) => w.active === win && win.gBrowser.selectedTab === tab,
    getRoute: tab => ({ contextUuid: null, revision: w.routes.get(tab) ?? 0 }), getProjectRevision: () => w.revision,
    matchProject: facts => ({ project_id: facts.url.startsWith("http://localhost:4450/") ? "p_harbor1" : null, ambiguous: false, revision: w.revision }),
    classifyHost: () => ({ sensitive: false }),
  });
  w.services = { isNormalWindow: win => w.windows.has(win) && !win.closed,
    readNativeProjectSnapshot: () => ({ revision: w.revision, projects: [] }),
    captureNativeProjectAuthority: ({ project_id }) => {
      if (!w.authority) return null;
      const epoch = w.epoch;
      return { id: project_id, root: "/synthetic/harbor", revision: w.revision, check: () => w.authority && w.epoch === epoch };
    } };
  return w;
}

/** Native-shaped remote modules. Each automation fact is read fresh through a
 * getter over `facts`; `navigation()` is counted (its import starts tracking). */
function fakeRemote(world) {
  const sessions = [], counts = { navigation: 0, constructed: 0, activeChecks: 0 };
  const facts = { remoteEnabled: false, remoteRunning: false, system: false, marionetteEnabled: false, marionetteRunning: false, active: false };
  const behavior = { constructorThrows: false, destroy: null, execute: null };
  const read = key => (typeof facts[key] === "function" ? facts[key]() : facts[key]);
  class WebDriverSession {
    static SESSION_FLAG_BIDI = "bidi";
    constructor(capabilities, sessionFlags) {
      counts.constructed++;
      if (behavior.constructorThrows) { world.nativeSideEffects = (world.nativeSideEffects ?? 0) + 1; throw new Error("constructor"); }
      Object.assign(this, { capabilities, sessionFlags, id: `session-${sessions.length + 1}`, executed: [], destroyed: 0 });
      sessions.push(this);
    }
    execute(module, command, params) { this.executed.push([module, command, params]); return behavior.execute ? behavior.execute(this, module, command, params) : Promise.resolve({ type: "success" }); }
    destroy() { this.destroyed++; return behavior.destroy ? behavior.destroy(this) : undefined; }
  }
  const remote = { sessions, counts, facts, behavior, WebDriverSession, hasActiveWebDriverSession: () => { counts.activeChecks++; return read("active"); },
    RemoteAgent: { get enabled() { return read("remoteEnabled"); }, get running() { return read("remoteRunning"); }, get allowSystemAccess() { return read("system"); } },
    Marionette: { get enabled() { return read("marionetteEnabled"); }, get running() { return read("marionetteRunning"); } },
    navigationGate: null,
    async navigation() {
      counts.navigation++;
      if (remote.navigationGate) await remote.navigationGate;
      return { NavigableManager: { getIdForBrowsingContext: context => `ctx-${context.id}`, getBrowsingContextById: id => world.contexts.get(id) ?? null },
        UserContextManager: { getIdByInternalId: id => ({ 0: "default", 5: "uuid-5" })[id] ?? null, getInternalIdById: id => ({ default: 0, "uuid-5": 5 })[id] ?? null } };
    } };
  return remote;
}

/** `stand`: a boundary stand-in that only records; `capabilities`: a test-only
 * wrapper handing the actual pure boundary enabled flags. */
function fixture({ stand = false, capabilities = null } = {}) {
  const w = nativeWorld();
  const win = w.window();
  const tab = w.tab(win);
  const id = w.registry.register(tab, win);
  const timers = { setTimeout: () => 1, clearTimeout() {} };
  const approved = new Set([SESSION]);
  const remote = fakeRemote(w);
  const budget = { claims: [], quarantined: false, quarantines: 0,
    claim(document) { if (budget.quarantined) throw new AgentToolError("UNAVAILABLE"); budget.claims.push(document); },
    quarantine() { budget.quarantined = true; budget.quarantines++; return true; } };
  const counts = { loads: 0, actors: 0 };
  let now = 1_000, loadGate = null;
  const boundary = { deps: null, available: true, executed: [] };
  const createBoundary = deps => {
    boundary.deps = deps;
    if (capabilities) return createAgentActBoundary({ ...deps, capabilities });
    if (!stand) return createAgentActBoundary(deps);
    return Object.freeze({ isMethodAvailable: method => boundary.available && ACT_METHODS.includes(method),
      getCapabilities: () => ({}), getState: () => ({ busy: false, pending_operations: 0, retained_created_targets: 0, effect_dispatched: false, cleanup_incomplete: false }),
      executeMethod: async (method, params, session, options) => { boundary.executed.push({ method, params, session, options }); return {}; },
      releaseSession: async () => true, close: async () => true });
  };
  const nativeOwner = { ownerForTab(window, value) {
    const tab_id = w.registry.register(value, window);
    return tab_id ? Object.freeze({ window, tab_id, tab: value, windowGlobal: value.linkedBrowser.browsingContext.currentWindowGlobal }) : null;
  } };
  const runtime = createAgentActionRuntime({ registry: w.registry, services: w.services, nativeOwner, isSessionActive: value => approved.has(value),
    timers, allocationBudget: budget, createBoundary,
    loadRemote: async () => { counts.loads++; if (loadGate) await loadGate; return remote; },
    registerActor: () => { counts.actors++; }, randomToken: (() => { let n = 0; return () => `ag_${String(++n).padStart(32, "0")}`; })(), now: () => now });
  const copy = () => { const issued = w.registry.metadata(id); return Object.freeze({ tab_id: id, url: issued.url, project_id: issued.project_id, engine: "gecko", document_id: issued.document_id }); };
  return { w, win, tab, id, approved, remote, budget, counts, boundary, runtime, copy, advance: ms => { now += ms; },
    holdLoad(gate) { loadGate = gate; } };
}
const live = () => new AbortController().signal;
const click = f => ["page.click", { tab_id: f.id, selector: "#agent-click" }];
// The tracker's own listeners: TabOpen and every touch event on the container,
// TabMultiSelect on the tabbrowser.
const TRACKING = 1 + TAB_TOUCH_EVENTS.length + 1;
const tracking = f => f.win.gBrowser.tabContainer.count() + f.win.gBrowser.count();
/** Admits one click through the stand-in and returns the admitted request. */
async function admitted(f, method = "page.click", params = click(f)[1]) {
  await f.runtime.executeMethod(method, params, viewOf(), { tab: f.copy(), signal: live() });
  const { expected, context } = f.boundary.executed.at(-1).options;
  return { method, expected, context, params, session: { session: SESSION, project_id: "p_harbor1", state: "approved" } };
}

test("every act and open capability is a literal false: UNAVAILABLE before any prompt, remote module, actor or owner", async () => {
  assert.deepEqual(ACTION_CAPABILITIES, { click: false, type: false, navigate: false, open: false });
  assert.ok(Object.isFrozen(ACTION_CAPABILITIES));
  const f = fixture();
  assert.equal(f.boundary.deps.capabilities, ACTION_CAPABILITIES, "the frozen literal reaches the boundary unchanged");
  assert.equal(f.boundary.deps.sources, FIXED_ACTION_SOURCES);
  for (const name of ["isActive", "isSensitiveHost", "consumeConfirmation", "createOwner", "validateDocumentProof", "beginCreatedTarget",
    "reconcileCreatedTarget", "claimCreatedTarget", "isCreatedTargetBlank", "adoptCreatedTarget", "closeCreatedTarget", "setTimer", "clearTimer"]) {
    assert.equal(typeof f.boundary.deps[name], "function", name);
  }
  f.runtime.attachWindow(f.win);
  for (const method of ACT_METHODS) {
    assert.equal(f.runtime.isMethodAvailable(method), false, method);
    await rejects(f.runtime.executeMethod(method, {}, viewOf(), { tab: f.copy(), signal: live() }), "UNAVAILABLE");
    assert.equal(await f.runtime.confirmAction(Object.freeze({ session: viewOf(), method, params: { tab_id: f.id, selector: "#agent-click" }, tab: f.copy() }), { signal: live() }), false);
  }
  assert.deepEqual(f.runtime.getCapabilities(), { click: false, type: false, navigate: false, open: false });
  assert.equal(f.win.shown.length, 0, "no pointless confirmation");
  assert.deepEqual([f.counts.loads, f.remote.counts.navigation, f.counts.actors, f.remote.sessions.length, f.budget.claims.length], [0, 0, 0, 0, 0]);
  assert.throws(() => createAgentActionRuntime({ registry: f.w.registry, services: f.w.services, isSessionActive: () => true,
    timers: { setTimeout() {}, clearTimeout() {} }, allocationBudget: { claim() {} } }), TypeError, "a budget without quarantine is refused");
});

test("the fixed function declarations: one gate call immediately before one effect, no await, no evaluation, no value read", () => {
  assert.ok(Object.isFrozen(FIXED_ACTION_SOURCES));
  assert.equal(FIXED_ACTION_SOURCES.captureDocument, 'function () { "use strict"; return document; }');
  for (const [key, effect] of [["click", "target.click();"], ["type", "target.value = text;"], ["navigate", "original.location.assign(destination);"]]) {
    const source = FIXED_ACTION_SOURCES[key];
    assert.match(source, /^function \(original, url/u);
    const gate = source.indexOf(`globalThis.${ACTION_GATE_NAME}`), check = source.indexOf("gate(original, url"), at = source.indexOf(effect);
    assert.ok(gate > 0 && check > gate && at > check, key);
    assert.equal(source.split(effect).length, 2, `${key}: exactly one effect`);
    for (const forbidden of ["await", "eval", "Function(", "innerHTML", "fetch", "setTimeout", "Promise", "import"]) assert.equal(source.includes(forbidden), false, `${key}: ${forbidden}`);
  }
  assert.deepEqual(FIXED_ACTION_SOURCES.type.match(/\.value/gu), [".value"], "the text is written once, the old value never read");
  assert.equal(validateActionSources("page.click", FIXED_ACTION_SOURCES), true);
  assert.equal(validateActionSources("page.click", Object.freeze({ ...FIXED_ACTION_SOURCES })), true, "equal pinned strings");
  assert.equal(validateActionSources("page.click", { ...FIXED_ACTION_SOURCES }), false, "unfrozen");
  assert.equal(validateActionSources("page.click", Object.freeze({ ...FIXED_ACTION_SOURCES, click: `${FIXED_ACTION_SOURCES.click} ` })), false, "changed");
  assert.equal(validateActionSources("page.eval", FIXED_ACTION_SOURCES), false);
});

// ---------------------------------------------------------------- strict automation facts and admission order

const STRICT_VALUES = [["true", () => true], ["undefined", () => undefined], ["null", () => null], ["a string", () => "false"],
  ["zero", () => 0], ["a promise", () => Promise.resolve(false)], ["a thenable", () => ({ then: resolve => resolve(false) })],
  ["a throw", () => { throw new Error("unreadable"); }]];

test("each native automation fact must be literally false: anything else refuses before native tracking, budget or constructor", async () => {
  for (const key of ["remoteEnabled", "remoteRunning", "system", "marionetteEnabled", "marionetteRunning", "active"]) {
    for (const [name, value] of STRICT_VALUES) {
      const f = fixture({ stand: true });
      f.remote.facts[key] = value;
      await rejects(f.runtime.executeMethod(...click(f), viewOf(), { tab: f.copy(), signal: live() }), "UNAVAILABLE");
      assert.deepEqual([f.remote.counts.navigation, f.remote.counts.constructed, f.budget.claims.length, f.boundary.executed.length], [0, 0, 0, 0],
        `${key} = ${name}: no tracking, constructor, budget or dispatch`);
    }
  }
  for (const missing of [r => { r.RemoteAgent = undefined; }, r => { r.Marionette = null; }, r => { r.hasActiveWebDriverSession = undefined; },
    r => { r.WebDriverSession = undefined; }]) {
    const f = fixture({ stand: true });
    missing(f.remote);
    await rejects(f.runtime.executeMethod(...click(f), viewOf(), { tab: f.copy(), signal: live() }), "UNAVAILABLE");
    assert.equal(f.remote.counts.navigation, 0);
  }
});

test("only the pinned native Marionette startup value is normalized, in the native loader; an injected unknown stays unavailable", () => {
  assert.equal(nativeMarionetteFacts({ enabled: undefined, running: false }).enabled, false, "the source-defined never-enabled state");
  assert.equal(nativeMarionetteFacts({ enabled: true, running: false }).enabled, true);
  assert.equal(nativeMarionetteFacts({ enabled: null, running: false }).enabled, null, "only undefined is that state");
  assert.equal(nativeMarionetteFacts({ enabled: false, running: undefined }).running, undefined, "running is never normalized");
  const native = { enabled: undefined, running: false };
  const facts = nativeMarionetteFacts(native);
  native.enabled = true;
  assert.equal(facts.enabled, true, "read fresh, never cached");
  const modules = { WebDriverSession: class {}, hasActiveWebDriverSession: () => false,
    RemoteAgent: { enabled: false, running: false, allowSystemAccess: false }, Marionette: { enabled: undefined, running: false } };
  assert.equal(automationOff(modules), false, "an injected undefined is unknown");
  assert.equal(automationOff({ ...modules, Marionette: nativeMarionetteFacts({ enabled: undefined, running: false }) }), true);
});

test("an aborted, unapproved or revoked request never imports native tracking, even while the remote modules load", async () => {
  const aborted = fixture({ stand: true });
  const controller = new AbortController(); controller.abort();
  await rejects(aborted.runtime.executeMethod(...click(aborted), viewOf(), { tab: aborted.copy(), signal: controller.signal }), "NOT_APPROVED");
  const unapproved = fixture({ stand: true });
  unapproved.approved.clear();
  await rejects(unapproved.runtime.executeMethod(...click(unapproved), viewOf(), { tab: unapproved.copy(), signal: live() }), "NOT_APPROVED");
  assert.deepEqual([aborted.counts.loads, unapproved.counts.loads, aborted.remote.counts.navigation, unapproved.remote.counts.navigation], [0, 0, 0, 0]);
  for (const [name, change] of [["revoked", (f, c) => { f.approved.clear(); }], ["aborted", (f, c) => c.abort()],
    ["closed", f => { f.runtime.close(); }], ["a target that moved", f => { f.w.load(f.tab, "http://localhost:4450/agent-tools?mode=type"); }],
    ["automation started", f => { f.remote.facts.marionetteRunning = true; }]]) {
    const f = fixture({ stand: true });
    const gate = deferred();
    f.holdLoad(gate.promise);
    const signal = new AbortController();
    const pending = f.runtime.executeMethod(...click(f), viewOf(), { tab: f.copy(), signal: signal.signal });
    await settle();
    change(f, signal);
    gate.resolve();
    await assert.rejects(pending, error => error instanceof AgentToolError, name);
    assert.deepEqual([f.remote.counts.navigation, f.boundary.executed.length], [0, 0], `${name}: no native tracking, no dispatch`);
  }
});

test("a fact or authority that changes while native tracking loads refuses before constructor or dispatch", async () => {
  for (const [name, change] of [["Marionette now running", f => { f.remote.facts.marionetteRunning = true; }],
    ["a WebDriver session now active", f => { f.remote.facts.active = true; }], ["revoked", f => { f.approved.clear(); }],
    ["navigated", f => { f.w.load(f.tab, "http://localhost:4450/agent-tools?mode=type"); }], ["project changed", f => { f.w.epoch++; }]]) {
    const f = fixture({ stand: true });
    const gate = deferred();
    f.remote.navigationGate = gate.promise;
    const pending = f.runtime.executeMethod(...click(f), viewOf(), { tab: f.copy(), signal: live() });
    await settle();
    assert.equal(f.remote.counts.navigation, 1);
    change(f);
    gate.resolve();
    await assert.rejects(pending, error => error instanceof AgentToolError, name);
    assert.deepEqual([f.boundary.executed.length, f.remote.counts.constructed], [0, 0], name);
  }
});

test("the owner rechecks strict facts after loading and immediately before construction; refusals construct nothing", async () => {
  const f = fixture({ stand: true });
  const request = await admitted(f);
  for (const [key, value] of [["remoteEnabled", () => true], ["system", () => undefined], ["marionetteEnabled", () => "false"], ["active", () => Promise.resolve(false)]]) {
    const saved = f.remote.facts[key];
    f.remote.facts[key] = value;
    await rejects(f.boundary.deps.createOwner(request, { signal: live(), requestSignal: live() }), "UNAVAILABLE");
    f.remote.facts[key] = saved;
  }
  assert.deepEqual([f.budget.claims.length, f.remote.counts.constructed], [0, 0], "refused before the budget claim");
  // A fact that flips after the first check: the slot is consumed, nothing is built.
  let reads = 0;
  f.remote.facts.remoteRunning = () => ++reads > 1;
  await rejects(f.boundary.deps.createOwner(request, { signal: live(), requestSignal: live() }), "UNAVAILABLE");
  assert.deepEqual([f.budget.claims.length, f.remote.counts.constructed], [1, 0]);
  f.remote.facts.remoteRunning = false;
  await rejects(f.boundary.deps.createOwner({ ...request, expected: f.w.registry.metadata(f.id) }, { signal: live() }), "UNAVAILABLE",
    "a target that was never admitted before tracking has no owner");
  const owner = await f.boundary.deps.createOwner(request, { signal: live(), requestSignal: live() });
  assert.deepEqual(Object.keys(owner).sort(), ["close", "execute"]);
  const [session] = f.remote.sessions;
  assert.deepEqual(session.capabilities, { acceptInsecureCerts: false, unhandledPromptBehavior: "ignore" });
  assert.deepEqual([...session.sessionFlags], ["bidi"]);
  assert.equal(f.budget.claims.at(-1), f.tab.linkedBrowser.browsingContext.currentWindowGlobal, "the shared process budget, before construction");
  await owner.execute("script", "callFunction", { x: 1 });
  assert.deepEqual(session.executed, [["script", "callFunction", { x: 1 }]]);
  assert.equal(await owner.close(), true);
  assert.equal(f.counts.actors, 1);
});

// ---------------------------------------------------------------- quarantine and close ownership

test("a constructor that throws after native side effects is retained, quarantines the shared budget and never closes positively", async () => {
  const f = fixture({ stand: true });
  const request = await admitted(f);
  f.remote.behavior.constructorThrows = true;
  await rejects(f.boundary.deps.createOwner(request, { signal: live() }), "UNAVAILABLE");
  assert.equal(f.w.nativeSideEffects, 1, "modelled native registration before the throw");
  assert.deepEqual([f.budget.quarantined, f.runtime.getState().construction_uncertain, f.runtime.getState().quarantined], [true, 1, true]);
  assert.equal(f.runtime.getState().cleanup_incomplete, true);
  f.remote.behavior.constructorThrows = false;
  await rejects(f.boundary.deps.createOwner(request, { signal: live() }), "UNAVAILABLE", "the shared budget refuses a fresh owner");
  assert.equal(f.remote.counts.constructed, 1);
  assert.equal(await f.runtime.close(), false, "no positive receipt without a handle");
  assert.equal(await f.runtime.close(), false, "nor on retry");
});

test("a destroy that throws or answers anything but native void quarantines and keeps the exact owner for an explicit retry", async () => {
  for (const [name, destroy] of [["throws", () => { throw new Error("destroy"); }], ["false", () => false], ["a promise", () => Promise.resolve(true)],
    ["true", () => true]]) {
    const f = fixture({ stand: true });
    const request = await admitted(f);
    const owner = await f.boundary.deps.createOwner(request, { signal: live() });
    f.remote.behavior.destroy = destroy;
    assert.equal(await owner.close(), false, name);
    assert.deepEqual([f.budget.quarantined, f.runtime.getState().retained_owners], [true, 1], name);
    await rejects(f.boundary.deps.createOwner(request, { signal: live() }), "UNAVAILABLE", `${name}: the quarantine blocks a fresh owner`);
    f.remote.behavior.destroy = null;
    assert.equal(await owner.close(), true, `${name}: the retained handle is retired by an explicit retry`);
    assert.equal(f.remote.sessions[0].destroyed, 2);
    assert.equal(f.budget.quarantined, true, `${name}: the quarantine is never lifted`);
    assert.equal(await f.runtime.close(), true);
  }
});

test("close publishes its one attempt before native destroy can reenter; reentry observes it and destroys nothing twice", async () => {
  const f = fixture({ stand: true });
  const request = await admitted(f);
  const owner = await f.boundary.deps.createOwner(request, { signal: live() });
  let reentered = null;
  f.remote.behavior.destroy = () => { reentered = owner.close(); };
  const attempt = owner.close();
  assert.equal(await attempt, true);
  assert.equal(reentered, attempt, "the same published Promise");
  assert.equal(f.remote.sessions[0].destroyed, 1);
});

test("a pending or failed gate revocation keeps the owner; no success is fabricated; an explicit retry completes", async () => {
  const f = fixture({ stand: true });
  const request = await admitted(f, "page.type", { tab_id: f.id, selector: "#agent-text", text: "x" });
  const owner = await f.boundary.deps.createOwner(request, { signal: live() });
  assert.equal(await f.boundary.deps.validateDocumentProof(owner, request, { signal: live(), phase: "beforeEffect",
    binding: Object.freeze({ handle: "h", realm: "realm-1", context: request.context, sandbox: ACT_BOUNDARY_SANDBOX }) }), true);
  const revoke = deferred();
  f.w.replies[AGENT_ACTION_MESSAGES.REVOKE] = () => revoke.promise;
  const first = owner.close();
  assert.equal(owner.close(), first, "coalesced while pending");
  assert.equal(f.remote.sessions[0].destroyed, 0, "the session outlives an unrevoked gate");
  revoke.resolve({ v: 1, token: f.w.queries.at(-1)[1].token, revoked: false });
  assert.equal(await first, false);
  assert.equal(f.runtime.getState().retained_owners, 1);
  delete f.w.replies[AGENT_ACTION_MESSAGES.REVOKE];
  assert.equal(await owner.close(), true);
  assert.equal(f.remote.sessions[0].destroyed, 1);
});

// ---------------------------------------------------------------- receipts bound to the issued binding

test("a trusted Allow once keeps one receipt for Core's exact signal, session, params and target; it is consumed once", async () => {
  const f = fixture({ stand: true });
  const detach = f.runtime.attachWindow(f.win);
  const params = { tab_id: f.id, selector: "#agent-click" };
  const core = (signal, extra = {}) => f.runtime.confirmAction(Object.freeze({ session: viewOf(), method: "page.click", params, tab: f.copy(), ...extra }), { signal });
  const boundaryRequest = (overrides = {}) => ({ method: "page.click", params, expected: f.w.registry.metadata(f.id),
    session: { session: SESSION, project_id: "p_harbor1", state: "approved" }, ...overrides });
  const allow = async (signal, extra) => {
    const answer = core(signal, extra);
    await settle();
    f.win.shown.at(-1).main.callback({ event: { isTrusted: true } });
    return answer;
  };
  const signal = live();
  assert.equal(await allow(signal), true);
  assert.equal(f.win.shown.at(-1).message, "<> wants to click “#agent-click” on localhost:4450/agent-tools.");
  assert.equal(f.runtime.getState().receipts, 1);
  assert.equal(f.boundary.deps.consumeConfirmation(boundaryRequest(), { signal }), true);
  assert.equal(f.boundary.deps.consumeConfirmation(boundaryRequest(), { signal }), false, "one use");
  for (const [name, request, prepare] of [
    ["another session", () => boundaryRequest({ session: { session: "s_0000000000000002", project_id: "p_harbor1", state: "approved" } })],
    ["other params", () => boundaryRequest({ params: { tab_id: f.id, selector: "#other" } })],
    ["another method", () => boundaryRequest({ method: "page.type" })],
    ["another document", () => boundaryRequest({ expected: { ...f.w.registry.metadata(f.id), document_id: "999" } })],
    ["expired", () => boundaryRequest(), () => f.advance(60_001)],
    ["revoked session", () => boundaryRequest(), () => f.runtime.releaseSession(SESSION)],
    ["navigation", () => boundaryRequest(), () => f.runtime.invalidateBrowser(f.win, f.tab.linkedBrowser)],
    ["project change", () => boundaryRequest(), () => f.runtime.invalidateAll()],
  ]) {
    f.approved.add(SESSION);
    const each = live();
    assert.equal(await allow(each), true, name);
    prepare?.();
    assert.equal(f.boundary.deps.consumeConfirmation(request(), { signal: each }), false, name);
    assert.equal(f.runtime.getState().receipts, 0, `${name}: consumed either way`);
  }
  const other = live(), aborted = new AbortController();
  assert.equal(await allow(aborted.signal), true);
  aborted.abort();
  assert.equal(f.boundary.deps.consumeConfirmation(boundaryRequest(), { signal: aborted.signal }), false, "an aborted request");
  assert.equal(await allow(other), true);
  assert.equal(f.boundary.deps.consumeConfirmation(boundaryRequest(), { signal: live() }), false, "another signal is not the receipt");
  detach();
  assert.equal(f.boundary.deps.consumeConfirmation(boundaryRequest(), { signal: other }), false, "window teardown drops its receipts");
  assert.equal(f.runtime.getState().receipts, 0);
});

test("binding drift with equal visible fields denies before execute, without any invalidation event, and consumes the receipt", async () => {
  const drifts = [
    ["the binding token", f => f.w.registry.invalidate(f.id)],
    ["the project revision", f => { f.w.revision++; f.w.epoch++; }],
    ["the project authority epoch", f => { f.w.epoch++; }],
    ["the route revision", f => { f.w.routes.set(f.tab, 1); }],
    ["the container, and back again", f => {
      const context = f.tab.linkedBrowser.browsingContext;
      context.originAttributes.userContextId = 5; f.w.registry.metadata(f.id);
      context.originAttributes.userContextId = 0;
    }],
    ["the root authority, withdrawn then restored", f => { f.w.authority = false; f.w.registry.metadata(f.id); f.w.authority = true; f.w.epoch++; }],
  ];
  for (const [name, drift] of drifts) {
    const f = fixture({ stand: true });
    f.runtime.attachWindow(f.win);
    const signal = live();
    const answer = f.runtime.confirmAction(Object.freeze({ session: viewOf(), method: "page.click", params: click(f)[1], tab: f.copy() }), { signal });
    await settle();
    f.win.shown.at(-1).main.callback({ event: { isTrusted: true } });
    assert.equal(await answer, true, name);
    const visible = f.copy();
    drift(f);
    const fresh = f.w.registry.metadata(f.id);
    if (fresh) assert.deepEqual([fresh.url, fresh.document_id, fresh.project_id], [visible.url, visible.document_id, visible.project_id], `${name}: visible fields unchanged`);
    const request = { method: "page.click", params: click(f)[1], expected: fresh ?? visible, session: { session: SESSION, project_id: "p_harbor1", state: "approved" } };
    assert.equal(f.boundary.deps.consumeConfirmation(request, { signal }), false, name);
    assert.equal(f.runtime.getState().receipts, 0, `${name}: consumed`);
  }
  // Unchanged exact authority allows exactly one dispatch.
  const f = fixture({ stand: true });
  f.runtime.attachWindow(f.win);
  const signal = live();
  const answer = f.runtime.confirmAction(Object.freeze({ session: viewOf(), method: "page.click", params: click(f)[1], tab: f.copy() }), { signal });
  await settle();
  f.win.shown.at(-1).main.callback({ event: { isTrusted: true } });
  assert.equal(await answer, true);
  const request = { method: "page.click", params: click(f)[1], expected: f.w.registry.metadata(f.id), session: { session: SESSION, project_id: "p_harbor1", state: "approved" } };
  assert.equal(f.boundary.deps.consumeConfirmation(request, { signal }), true);
  assert.equal(f.boundary.deps.consumeConfirmation(request, { signal }), false);
});

test("no prompt for an unapproved session, a stale Core target, an unattached window, open, or a second prompt per request", async () => {
  const f = fixture({ stand: true });
  const params = { tab_id: f.id, selector: "#agent-click" };
  const ask = (extra = {}, signal = live()) => f.runtime.confirmAction(Object.freeze({ session: viewOf(), method: "page.click", params, tab: f.copy(), ...extra }), { signal });
  assert.equal(await ask(), false, "no presenter: the window is not attached");
  f.runtime.attachWindow(f.win);
  f.approved.clear();
  assert.equal(await ask(), false, "unapproved");
  f.approved.add(SESSION);
  assert.equal(await ask({ tab: { ...f.copy(), document_id: "1" } }), false, "stale target");
  assert.equal(await ask({ method: "tabs.open" }), false, "open has no extra prompt");
  assert.equal(f.win.shown.length, 0);
  const signal = live();
  const first = ask({}, signal);
  await settle();
  assert.equal(await ask({}, signal), false, "the same request cannot hold two prompts");
  assert.equal(f.win.shown.length, 1);
  f.win.shown[0].secondary[0].callback();
  assert.equal(await first, false, "Deny");
});

test("document proof: beforeBinding is read-only admission; beforeEffect installs the one-use gate in the exact owned realm", async () => {
  const f = fixture({ stand: true });
  const request = await admitted(f, "page.type", { tab_id: f.id, selector: "#agent-text", text: "x" });
  const owner = await f.boundary.deps.createOwner(request, { signal: live() });
  const prove = (phase, binding = null, value = request) => f.boundary.deps.validateDocumentProof(owner, value, { signal: live(), phase, binding });
  assert.equal(await prove("beforeBinding"), true);
  assert.deepEqual(f.w.queries.at(-1), [AGENT_ACTION_MESSAGES.ADMIT, { v: 1, token: f.w.queries.at(-1)[1].token, url: URL_A }]);
  const binding = Object.freeze({ handle: "h-1", realm: "realm-1", context: request.context, sandbox: ACT_BOUNDARY_SANDBOX });
  const before = f.w.queries.length;
  assert.equal(await prove("beforeEffect", { ...binding, context: "ctx-other" }), false);
  assert.equal(await prove("beforeEffect", { ...binding, sandbox: "page" }), false);
  assert.equal(await prove("beforeEffect", null), false);
  assert.equal(await prove("sometime"), false);
  assert.equal(f.w.queries.length, before, "refused before any child query");
  assert.equal(await prove("beforeEffect", binding), true);
  assert.deepEqual(f.w.queries.at(-1)[1], { v: 1, token: f.w.queries.at(-1)[1].token, session: "session-1", realm: "realm-1", method: "page.type",
    url: URL_A, destination: null });
  assert.equal(await prove("beforeEffect", binding, { ...request }), false, "another request object");
  f.w.replies[AGENT_ACTION_MESSAGES.INSTALL] = data => ({ v: 1, token: data.token, installed: true, extra: 1 });
  assert.equal(await prove("beforeEffect", binding), false, "an unexpected reply shape");
  assert.equal(await owner.close(), true);
  assert.equal(f.w.queries.filter(([name]) => name === AGENT_ACTION_MESSAGES.REVOKE).length, 2, "both installed gates are revoked at close");
  assert.equal(f.counts.actors, 1, "the actor is registered with the first native owner");
  assert.equal(AGENT_ACTION_ACTOR, "AxioSozoAgentAction");
});

// ---------------------------------------------------------------- created-tab attribution

async function openOwner(f) {
  await f.runtime.executeMethod("tabs.open", { url: OPENED }, viewOf(null), { signal: live(), userContextId: 0 });
  const { expected, context, userContext } = f.boundary.executed.at(-1).options;
  const request = { method: "tabs.open", expected, context, userContext, params: { url: OPENED }, session: { session: SESSION } };
  const owner = await f.boundary.deps.createOwner(request, { signal: live() });
  return { request, owner, lease: f.boundary.deps.beginCreatedTarget(owner, request) };
}

test("positive no-allocation needs a complete tracker that saw no tab open; an unrelated blank is never attributed or closed", async () => {
  const f = fixture({ stand: true });
  const quiet = await openOwner(f);
  assert.equal(tracking(f), TRACKING, "tracking starts before create");
  assert.equal(f.win.gBrowser.tabContainer.count("TabOpen"), 1);
  assert.equal(await f.boundary.deps.reconcileCreatedTarget(quiet.lease, quiet.owner, quiet.request), true);
  assert.equal(tracking(f), 0, "every owned listener is removed with the tracker");
  const busy = await openOwner(f);
  const unrelated = f.w.tab(f.win, { url: "about:blank", select: false });
  f.w.opened(f.win, unrelated);
  assert.equal(await f.boundary.deps.reconcileCreatedTarget(busy.lease, busy.owner, busy.request), false, "a rejected create plus someone else's blank tab");
  assert.equal(unrelated.closing, false, "never closed");
  assert.equal(tracking(f), TRACKING, "the tracker and its ownership stay");
  assert.equal(await busy.owner.close(), false, "session teardown is not a target receipt");
  const closedWindow = await openOwner(f);
  f.win.closed = true;
  assert.equal(await f.boundary.deps.reconcileCreatedTarget(closedWindow.lease, closedWindow.owner, closedWindow.request), false);
});

test("only the exact tab the create reply names, untouched since it opened, may be closed, and only its actual removal counts", async () => {
  const changes = [
    ["navigated", (f, tab) => f.w.navigate(tab, OPENED)],
    ["its document replaced, still blank", (f, tab) => { f.w.load(tab, "about:blank"); }],
    ["selected", (f, tab) => { tab.selected = true; }],
    ["pinned", (f, tab) => { tab.pinned = true; }],
    ["moved to another window", (f, tab) => { tab.documentGlobal = f.w.window(); }],
    ["given history", (f, tab) => { tab.linkedBrowser.canGoBack = true; }],
  ];
  for (const [name, change] of changes) {
    const f = fixture({ stand: true });
    const { request, owner } = await openOwner(f);
    const created = f.w.tab(f.win, { url: "about:blank", select: false });
    f.w.opened(f.win, created);
    const claim = f.boundary.deps.claimCreatedTarget(owner, `ctx-${created.linkedBrowser.browsingContext.id}`, request);
    assert.equal(f.boundary.deps.isCreatedTargetBlank(claim, request), true, name);
    change(f, created);
    assert.equal(f.boundary.deps.isCreatedTargetBlank(claim, request), false, name);
    assert.equal(await f.boundary.deps.closeCreatedTarget(claim, request), false, name);
    assert.equal(created.closing, false, `${name}: left alone`);
  }
  const f = fixture({ stand: true });
  const { request, owner } = await openOwner(f);
  const created = f.w.tab(f.win, { url: "about:blank", select: false });
  f.w.opened(f.win, created);
  assert.throws(() => f.boundary.deps.claimCreatedTarget(owner, `ctx-${f.tab.linkedBrowser.browsingContext.id}`, request), "a tab it did not see open");
  assert.throws(() => f.boundary.deps.claimCreatedTarget(owner, "ctx-unknown", request));
  const claim = f.boundary.deps.claimCreatedTarget(owner, `ctx-${created.linkedBrowser.browsingContext.id}`, request);
  let removals = 0;
  f.w.removeTab = () => { removals++; };
  assert.equal(await f.boundary.deps.closeCreatedTarget(claim, request), false, "removeTab returned, the tab is still there");
  assert.equal(await f.boundary.deps.closeCreatedTarget(claim, request), false);
  assert.equal(removals, 1, "never asked twice");
  f.w.removeTab = null;
  created.closing = true; created.isConnected = false; f.win.gBrowser.tabs.splice(f.win.gBrowser.tabs.indexOf(created), 1);
  assert.equal(await f.boundary.deps.closeCreatedTarget(claim, request), true, "the actual removal is the receipt");
  assert.equal(tracking(f), 0);
  assert.equal(await owner.close(), true);
});

// ---------------------------------------------------------------- the boundary orders cleanup

test("with create pending, process close waits for the boundary: tracker and session stay usable until the late exact result is retired", async () => {
  const f = fixture({ capabilities: { click: false, type: false, navigate: false, open: true } });
  const create = deferred();
  let created = null;
  f.remote.behavior.execute = (session, module, command) => {
    if (command === "create") { created = f.w.tab(f.win, { url: "about:blank", select: false }); f.w.opened(f.win, created); return create.promise; }
    return Promise.resolve({ type: "success" });
  };
  const opening = f.runtime.executeMethod("tabs.open", { url: OPENED }, viewOf(null), { signal: live(), userContextId: 0 });
  const outcome = opening.then(() => null, error => error);
  await settle();
  assert.ok(created, "create was dispatched");
  const closing = f.runtime.close();
  await settle();
  const [session] = f.remote.sessions;
  assert.equal(session.destroyed, 0, "the session outlives the pending command");
  assert.equal(tracking(f), TRACKING, "the tracker stays installed");
  assert.equal(f.runtime.getState().closed, true);
  let done = false;
  closing.then(() => { done = true; });
  await settle();
  assert.equal(done, false, "no optimistic close while the create is unknown");
  create.resolve({ context: `ctx-${created.linkedBrowser.browsingContext.id}` });
  assert.equal(await closing, true);
  const error = await outcome;
  assert.ok(error.code === "NOT_APPROVED" && error.effect_dispatched === true, "cancelled after dispatch: never a claim that nothing happened");
  assert.equal(created.closing, true, "the exact untouched blank it created was retired");
  assert.equal(session.destroyed, 1, "then the owner");
  assert.equal(tracking(f), 0);
});

test("after URL navigation the tab is only adopted: close waits for positive adoption and never closes it", async () => {
  const f = fixture({ capabilities: { click: false, type: false, navigate: false, open: true } });
  let created = null;
  f.remote.behavior.execute = (session, module, command) => {
    if (command === "create") { created = f.w.tab(f.win, { url: "about:blank", select: false }); f.w.opened(f.win, created);
      return Promise.resolve({ context: `ctx-${created.linkedBrowser.browsingContext.id}` }); }
    return Promise.resolve({ navigation: null, url: OPENED });
  };
  const opening = f.runtime.executeMethod("tabs.open", { url: OPENED }, viewOf(null), { signal: live(), userContextId: 0 });
  const outcome = opening.then(() => null, error => error);
  await settle();
  assert.deepEqual(f.remote.sessions[0].executed.map(([, command]) => command), ["create", "navigate"], "create, then the navigation of the new tab");
  const closing = f.runtime.close();
  await settle();
  let done = false;
  closing.then(() => { done = true; });
  await settle();
  assert.equal(done, false, "adoption is still owed");
  assert.equal(created.closing, false, "never closed after navigation");
  assert.equal(f.remote.sessions[0].destroyed, 0);
  f.w.navigate(created, OPENED);
  assert.equal(await closing, true);
  assert.equal((await outcome)?.effect_dispatched, true, "dispatched: its outcome is not claimed either way");
  assert.equal(created.closing, false);
  assert.ok(f.w.registry.list().some(tab => tab.url === OPENED), "adopted into the shared registry");
  assert.equal(f.remote.sessions[0].destroyed, 1);
});

test("a touched created tab is never retired: close stays false and its ownership is retained for an explicit retry", async () => {
  const f = fixture({ capabilities: { click: false, type: false, navigate: false, open: true } });
  const create = deferred();
  let created = null;
  f.remote.behavior.execute = (session, module, command) => {
    if (command === "create") { created = f.w.tab(f.win, { url: "about:blank", select: false }); f.w.opened(f.win, created); return create.promise; }
    return Promise.resolve({});
  };
  f.runtime.executeMethod("tabs.open", { url: OPENED }, viewOf(null), { signal: live(), userContextId: 0 }).catch(() => {});
  await settle();
  const closing = f.runtime.close();
  created.selected = true; // the user switched to it
  create.resolve({ context: `ctx-${created.linkedBrowser.browsingContext.id}` });
  assert.equal(await closing, false);
  assert.equal(created.closing, false);
  assert.deepEqual([f.runtime.getState().retained_created_targets, f.runtime.getState().retained_owners], [1, 1]);
  assert.equal(f.remote.sessions[0].destroyed, 0);
  assert.equal(await f.runtime.close(), false, "an explicit retry still cannot close a touched tab");
});

// ---------------------------------------------------------------- sticky touch from native tab events

const OPEN_ONLY = Object.freeze({ click: false, type: false, navigate: false, open: true });
/** tabs.open through the actual boundary, its native create held pending. */
async function pendingCreate(f, { signal = live() } = {}) {
  const create = deferred();
  const held = { created: null, create, removals: 0 };
  f.w.removeTab = () => { held.removals++; };
  f.remote.behavior.execute = (session, module, command) => {
    if (command === "create") { held.created = f.w.tab(f.win, { url: "about:blank", select: false }); f.w.opened(f.win, held.created); return create.promise; }
    return Promise.resolve({});
  };
  held.outcome = f.runtime.executeMethod("tabs.open", { url: OPENED }, viewOf(null), { signal, userContextId: 0 }).then(() => null, error => error);
  await settle();
  assert.ok(held.created, "create was dispatched");
  held.resolve = () => create.resolve({ context: `ctx-${held.created.linkedBrowser.browsingContext.id}` });
  return held;
}

test("a created blank touched while create is pending stays touched after its visible state returns: never removed, never a false retirement", async () => {
  const touches = [
    ["selected, then the original tab again", (f, tab) => { f.w.select(f.win, tab); f.w.select(f.win, f.tab); }],
    ["pinned, then unpinned", (f, tab) => { f.w.pin(f.win, tab, true); f.w.pin(f.win, tab, false); }],
    ["moved (a group, split view or workspace change)", (f, tab) => f.w.event(f.win, "TabMove", tab)],
    ["hidden, then shown", (f, tab) => { f.w.event(f.win, "TabHide", tab); f.w.event(f.win, "TabShow", tab); }],
    ["a multi-selection change, which names no tab", f => f.w.event(f.win, "TabMultiSelect", null)],
    ["a tab event whose tab cannot be read", f => f.win.gBrowser.tabContainer.dispatch("TabSelect", { type: "TabSelect", get target() { throw new Error("x"); } })],
  ];
  for (const ending of ["process close", "request cancelled"]) {
    for (const [name, touch] of touches) {
      const label = `${ending}: ${name}`;
      const f = fixture({ capabilities: OPEN_ONLY });
      const controller = new AbortController();
      const held = await pendingCreate(f, { signal: controller.signal });
      touch(f, held.created);
      assert.deepEqual([held.created.selected, held.created.pinned === true, f.win.gBrowser.selectedTab], [false, false, f.tab],
        `${label}: every visible fact is back as it opened`);
      const closing = ending === "process close" ? f.runtime.close() : (controller.abort(), null);
      held.resolve();
      if (closing) assert.equal(await closing, false, `${label}: no positive close`);
      else assert.equal((await held.outcome)?.code, "NOT_APPROVED", label);
      await settle();
      assert.deepEqual([held.removals, held.created.closing], [0, false], `${label}: never asked to remove`);
      const state = f.runtime.getState();
      assert.deepEqual([state.retained_created_targets, state.retained_owners, f.remote.sessions[0].destroyed], [1, 1, 0],
        `${label}: the target and its owner stay retained`);
      assert.equal(tracking(f), TRACKING, `${label}: the tracker keeps listening while it is owned`);
      assert.equal(await f.runtime.close(), false, `${label}: a retry cannot make it removable again`);
    }
  }
});

test("events naming other tabs do not touch the created blank; with every event heard, its exact removal is still the one receipt", async () => {
  const f = fixture({ capabilities: OPEN_ONLY });
  const held = await pendingCreate(f);
  f.w.removeTab = null;
  const other = f.w.tab(f.win, { url: URL_A, select: false });
  f.w.select(f.win, other);
  f.w.select(f.win, f.tab);
  f.w.pin(f.win, other, true);
  f.w.event(f.win, "TabMove", f.tab);
  const closing = f.runtime.close();
  held.resolve();
  assert.equal(await closing, true);
  assert.equal(held.created.closing, true, "the untouched exact blank was removed");
  assert.equal(tracking(f), 0, "every owned listener is removed with the tracker");
});

test("a touch listener that cannot be installed leaves the tracker unable to vouch for any tab: no automatic removal", async () => {
  const f = fixture({ capabilities: OPEN_ONLY });
  f.win.gBrowser.tabContainer.failing = "TabMove";
  const held = await pendingCreate(f);
  const closing = f.runtime.close();
  held.resolve();
  assert.equal(await closing, false);
  assert.deepEqual([held.removals, held.created.closing], [0, false]);
  assert.equal(f.runtime.getState().retained_created_targets, 1);
});

// ---------------------------------------------------------------- automation facts at every owned dispatch

/** Native-shaped replies of the standard commands; `hooks[step]` runs while
 * that command runs: capture (the document capture), effect, create, navigate. */
function standardReplies(f, hooks = {}) {
  const box = { created: null };
  f.remote.behavior.execute = (session, module, command, params) => {
    const step = command === "callFunction" ? (params.resultOwnership === "root" ? "capture" : "effect") : command;
    hooks[step]?.();
    if (command === "create") {
      box.created = f.w.tab(f.win, { url: "about:blank", select: false }); f.w.opened(f.win, box.created);
      return Promise.resolve({ context: `ctx-${box.created.linkedBrowser.browsingContext.id}` });
    }
    if (command === "navigate") return Promise.resolve({ navigation: null, url: OPENED });
    if (step === "capture") return Promise.resolve({ type: "success", realm: "realm-1", result: { type: "node", handle: "h-1" } });
    return Promise.resolve({ type: "success", realm: "realm-1", result: { type: "boolean", value: true } });
  };
  return box;
}
/** One Allow once, then the click through the actual boundary. */
async function allowedClick(f) {
  f.runtime.attachWindow(f.win);
  const signal = live();
  const params = click(f)[1];
  const answer = f.runtime.confirmAction(Object.freeze({ session: viewOf(), method: "page.click", params, tab: f.copy() }), { signal });
  await settle();
  f.win.shown.at(-1).main.callback({ event: { isTrusted: true } });
  assert.equal(await answer, true);
  return f.runtime.executeMethod("page.click", params, viewOf(), { tab: f.copy(), signal });
}
const commands = f => f.remote.sessions[0]?.executed.map(([, command, params]) => (command === "callFunction" ? (params.resultOwnership === "root" ? "capture" : "effect") : command)) ?? [];

test("an admitted click with all five facts false dispatches capture and effect; the global session predicate is not asked again", async () => {
  const f = fixture({ capabilities: { click: true, type: false, navigate: false, open: false } });
  standardReplies(f);
  let checks = null;
  f.w.replies[AGENT_ACTION_MESSAGES.ADMIT] = data => {
    // From construction on the owner's own session is a registered one.
    f.remote.facts.active = true; checks = f.remote.counts.activeChecks;
    return { v: 1, token: data.token, ok: true };
  };
  assert.deepEqual(await allowedClick(f), {});
  assert.deepEqual(commands(f), ["capture", "effect"]);
  assert.equal(f.remote.counts.activeChecks, checks, "not re-asked at either dispatch");
  assert.equal(agentsOff(f.remote), true);
});

test("a fact that changes during the document proof, the binding capture or the gate installation refuses the next dispatch: no effect", async () => {
  const points = [
    ["during the document proof", (f, flip) => { f.w.replies[AGENT_ACTION_MESSAGES.ADMIT] = data => { flip(); return { v: 1, token: data.token, ok: true }; }; return {}; }, []],
    ["during the binding capture", (f, flip) => ({ capture: flip }), ["capture"]],
    ["between gate installation and the effect", (f, flip) => {
      f.w.replies[AGENT_ACTION_MESSAGES.INSTALL] = data => { flip(); return { v: 1, token: data.token, installed: true }; }; return {};
    }, ["capture"]],
  ];
  const values = [["true", () => true], ["unknown", () => undefined], ["a throw", () => { throw new Error("unreadable"); }], ["a promise", () => Promise.resolve(false)]];
  for (const [point, install, expected] of points) {
    for (const key of ["remoteEnabled", "remoteRunning", "system", "marionetteEnabled", "marionetteRunning"]) {
      for (const [name, value] of values) {
        const label = `${point}: ${key} = ${name}`;
        const f = fixture({ capabilities: { click: true, type: false, navigate: false, open: false } });
        standardReplies(f, install(f, () => { f.remote.facts[key] = value; }));
        await assert.rejects(allowedClick(f), error => error instanceof AgentToolError && ["UNAVAILABLE", "NOT_APPROVED"].includes(error.code), label);
        assert.deepEqual(commands(f), expected, `${label}: nothing dispatched after the change`);
        assert.equal(f.remote.sessions[0].destroyed, 1, `${label}: the owner still closes`);
      }
    }
  }
});

test("a fact that changes while the new tab is created refuses its navigation; the blank is never navigated and stays owed", async () => {
  for (const key of ["remoteEnabled", "marionetteRunning", "system"]) {
    const f = fixture({ capabilities: OPEN_ONLY });
    const box = standardReplies(f, { create: () => { f.remote.facts[key] = true; } });
    f.runtime.executeMethod("tabs.open", { url: OPENED }, viewOf(null), { signal: live(), userContextId: 0 }).catch(() => {});
    await settle();
    assert.deepEqual(commands(f), ["create"], `${key}: no navigation dispatched`);
    assert.equal(box.created.linkedBrowser.currentURI.spec, "about:blank");
    assert.equal(box.created.closing, false, `${key}: the boundary had committed to navigating it, so it is never closed automatically`);
  }
});

test("the owner's dispatch also needs its own live request: aborted, revoked or closing owners dispatch nothing", async () => {
  for (const [name, end] of [["the boundary signal aborted", (f, c) => c.abort()], ["Core's request aborted", (f, c, r) => r.abort()],
    ["the session revoked", f => f.approved.clear()], ["the runtime closed", f => { f.runtime.close(); }]]) {
    const f = fixture({ stand: true });
    const request = await admitted(f);
    const controller = new AbortController(), core = new AbortController();
    const owner = await f.boundary.deps.createOwner(request, { signal: controller.signal, requestSignal: core.signal });
    end(f, controller, core);
    assert.throws(() => owner.execute("script", "callFunction", {}), error => error instanceof AgentToolError && error.code === "NOT_APPROVED", name);
    assert.deepEqual(f.remote.sessions[0].executed, [], name);
  }
  const f = fixture({ stand: true });
  const request = await admitted(f);
  const owner = await f.boundary.deps.createOwner(request, { signal: live() });
  const revoke = deferred();
  f.w.replies[AGENT_ACTION_MESSAGES.REVOKE] = () => revoke.promise;
  assert.equal(await f.boundary.deps.validateDocumentProof(owner, request, { signal: live(), phase: "beforeEffect",
    binding: Object.freeze({ handle: "h", realm: "realm-1", context: request.context, sandbox: ACT_BOUNDARY_SANDBOX }) }), true);
  const closing = owner.close();
  assert.throws(() => owner.execute("script", "callFunction", {}), error => error.code === "NOT_APPROVED", "while its close is pending");
  revoke.resolve({ v: 1, token: f.w.queries.at(-1)[1].token, revoked: true });
  assert.equal(await closing, true);
  assert.deepEqual(f.remote.sessions[0].executed, []);
});
