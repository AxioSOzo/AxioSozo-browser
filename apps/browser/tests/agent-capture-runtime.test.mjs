/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 8: AgentCaptureRuntime's native privacy/ownership callbacks over
// the actual AgentTabRegistry, the actual AgentViewportCapture orchestration
// and injected native-shaped windows, tabs, window globals, child actors, BiDi
// readers and PNG boxes. Capture stays disabled in the product (literal
// CAPTURE_ENABLED false); these fakes exercise the composed seam only. The
// parent preference observer here is what refuses false→true→false between
// awaits; this is fake ordering, not proof of native preference propagation.
// No Gecko, actor, BiDi session, ImageLib or GUI is involved.
import test from "node:test";
import assert from "node:assert/strict";
import { AgentTabRegistry } from "../chrome/AgentTabRegistry.sys.mjs";
import { AGENT_CAPTURE_ACTOR_OPTIONS, createAgentCaptureRuntime, getAgentCaptureRuntime, observeReadbackPref } from "../chrome/AgentCaptureRuntime.sys.mjs";
import { AGENT_CAPTURE_ACTOR, AGENT_CAPTURE_MESSAGES } from "../chrome/AgentCaptureChild.sys.mjs";
import { AgentCaptureParent } from "../chrome/AgentCaptureParent.sys.mjs";
import { AgentToolError, createBiDiAllocationBudget } from "../chrome/GeckoBiDiReadSession.sys.mjs";

const tick = () => new Promise(resolve => setImmediate(resolve));
const settle = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await tick(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const rejects = (promise, codes) => assert.rejects(promise, error => error instanceof AgentToolError && [].concat(codes).includes(error.code));
function png(width, height) {
  const bytes = Buffer.alloc(33); Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
  bytes.writeUInt32BE(13, 8); bytes.write("IHDR", 12); bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(height, 20);
  return bytes.toString("base64");
}
function manualTimers() {
  let next = 0; const entries = new Map();
  return { setTimeout(fn, ms) { const id = ++next; entries.set(id, { fn, ms }); return id; }, clearTimeout(id) { entries.delete(id); },
    fire(ms) { for (const [id, entry] of [...entries]) if (entry.ms === ms) { entries.delete(id); entry.fn(); } }, get size() { return entries.size; } };
}

/** Native-shaped normal windows and tabs; documents are replaced on navigation. */
function nativeWorld() {
  let inner = 100, browsers = 0;
  const w = { revision: 1, authority: true, snapshot: true, windows: new Set(), active: null, actors: [], queries: [], behavior: {} };
  w.window = ({ private: priv = false } = {}) => {
    const tabs = [];
    const win = { closed: false, private: priv, document: { hidden: false }, windowState: 1, STATE_MINIMIZED: 2, devicePixelRatio: 2,
      gBrowser: { tabs, selectedTab: null, get selectedBrowser() { return this.selectedTab?.linkedBrowser ?? null; },
        getTabForBrowser: browser => tabs.find(tab => tab.linkedBrowser === browser) ?? null } };
    w.windows.add(win); w.active ??= win;
    return win;
  };
  w.load = (tab, url) => {
    const browser = tab.linkedBrowser, context = browser.browsingContext;
    const previous = context.currentWindowGlobal;
    if (previous) { previous.isCurrentGlobal = false; previous.isClosed = true; }
    const global = { innerWindowId: ++inner, isCurrentGlobal: true, isClosed: false, failedChannel: null, documentURI: { spec: url },
      documentTitle: "Agent tools", browsingContext: context, actors: new Map(),
      documentPrincipal: { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true,
        privateBrowsingId: context.originAttributes.privateBrowsingId, userContextId: context.originAttributes.userContextId },
      getActor(name) { if (!this.actors.has(name)) this.actors.set(name, w.makeActor(this, name)); return this.actors.get(name); },
      getExistingActor(name) { return this.actors.get(name) ?? null; } };
    context.currentWindowGlobal = global;
    browser.currentURI = { spec: url };
    return global;
  };
  w.tab = (win, { url = "http://localhost:4450/agent-tools", userContextId = 0, select = true } = {}) => {
    const browser = { browserId: ++browsers, permanentKey: {}, docShellIsActive: true, fullZoom: 1, getBoundingClientRect: () => ({ width: 1200, height: 800 }) };
    const context = { isContent: true, parent: null, isDiscarded: false, usePrivateBrowsing: win.private, overrideDPPX: 0, children: [],
      originAttributes: { privateBrowsingId: win.private ? 1 : 0, userContextId }, embedderElement: browser };
    context.top = context;
    Object.assign(browser, { browsingContext: context, frameLoader: { ownerElement: browser, browsingContext: context } });
    const tab = { documentGlobal: win, closing: false, isConnected: true, linkedBrowser: browser };
    w.load(tab, url);
    win.gBrowser.tabs.push(tab);
    if (select) win.gBrowser.selectedTab = tab;
    return tab;
  };
  w.makeActor = global => {
    const actor = { manager: global, sent: [], sendQuery(name, data) {
      actor.sent.push([name, data]); w.queries.push([name, data]);
      const behave = w.behavior[name];
      if (behave) return behave(data, actor);
      if (name === AGENT_CAPTURE_MESSAGES.RELEASE) return Promise.resolve({ v: 1, token: data.token, released: true, committed: data.commit });
      if (name === AGENT_CAPTURE_MESSAGES.BEGIN) return Promise.resolve({ v: 1, token: data.token, ok: true, retained: true });
      return Promise.resolve({ v: 1, token: data.token, ok: true });
    } };
    w.actors.push(actor);
    return actor;
  };
  const registry = new AgentTabRegistry({
    isPrivateWindow: win => (w.windows.has(win) ? win.private : null),
    isWindowRegistered: win => w.windows.has(win),
    isWindowClosed: win => win.closed,
    isTabLive: (tab, win) => tab.documentGlobal === win && tab.closing === false && tab.isConnected === true,
    getBrowser: (tab, win) => (win.gBrowser.getTabForBrowser(tab.linkedBrowser) === tab ? tab.linkedBrowser : null),
    isPrivateBrowser: browser => browser.browsingContext.usePrivateBrowsing,
    getBrowserIdentity: browser => ({ nativeBrowserId: browser.browserId, permanentKey: browser.permanentKey, browsingContext: browser.browsingContext,
      frameLoader: browser.frameLoader, frameLoaderOwner: browser.frameLoader.ownerElement, frameLoaderContext: browser.frameLoader.browsingContext }),
    getContextState: context => ({ isContent: context.isContent, top: context.top, isDiscarded: context.isDiscarded, private: context.usePrivateBrowsing,
      privateBrowsingId: context.originAttributes.privateBrowsingId, userContextId: context.originAttributes.userContextId, embedder: context.embedderElement }),
    getCurrentDocument: context => context.currentWindowGlobal,
    getDocumentState: global => ({ browsingContext: global.browsingContext, isCurrentGlobal: global.isCurrentGlobal, isClosed: global.isClosed,
      failedChannel: global.failedChannel, document_id: global.innerWindowId, principal: global.documentPrincipal,
      isSystemPrincipal: global.documentPrincipal.isSystemPrincipal, isNullPrincipal: global.documentPrincipal.isNullPrincipal,
      privateBrowsingId: global.documentPrincipal.privateBrowsingId, userContextId: global.documentPrincipal.userContextId }),
    getDocumentURL: (global, browser) => (global.documentURI.spec === browser.currentURI.spec ? global.documentURI.spec : null),
    getTitle: () => "",
    getEngine: () => "gecko",
    isActiveTab: (tab, win) => w.active === win && win.gBrowser.selectedTab === tab,
    getRoute: () => ({ contextUuid: null, revision: 0 }),
    getProjectRevision: () => w.revision,
    matchProject: facts => ({ project_id: facts.url.startsWith("http://localhost:4450/") ? "p_harbor1" : null, ambiguous: false, revision: w.revision }),
    classifyHost: () => ({ sensitive: false }),
  });
  w.registry = registry;
  w.services = {
    isNormalWindow: win => w.windows.has(win) && win.private === false && win.closed === false,
    readNativeProjectSnapshot: () => (w.snapshot ? { revision: w.revision, projects: [] } : null),
    captureNativeProjectAuthority: ({ project_id }) => (w.authority && project_id === "p_harbor1"
      ? { id: project_id, root: "/synthetic/harbor", revision: w.revision, check: () => w.authority } : null),
  };
  return w;
}

function fixture(options = {}) {
  const w = nativeWorld();
  const win = w.window();
  const tab = w.tab(win, options.tab);
  const id = w.registry.register(tab, win);
  const timers = manualTimers();
  const readers = [], boxes = [], registered = [];
  // This (parent) process's readback preference as nsIPrefBranch keeps its
  // observers: removing one that was never added succeeds, as natively.
  // `addFails`: addObserver throws (after registering when `addRegisters`);
  // `observeThrows`: the injected observation itself throws, leaving no handle.
  const pref = { value: false, observers: new Set(), added: 0, removed: 0, addFails: false, addRegisters: false, removeFails: false, observeThrows: false,
    set(value) { pref.value = value; for (const observer of [...pref.observers]) observer(); },
    flip() { pref.set(true); pref.set(false); } };
  const branch = {
    addObserver(name, observer) {
      assert.equal(name, "remote.screenshot.use_readback");
      if (pref.addFails && !pref.addRegisters) throw new Error("observer registration failed");
      pref.observers.add(observer); pref.added++;
      if (pref.addFails) throw new Error("registered, then failed");
    },
    removeObserver(name, observer) { if (pref.removeFails) throw new Error("removal failed"); if (pref.observers.delete(observer)) pref.removed++; },
  };
  const observePref = callback => {
    if (pref.observeThrows) throw new Error("unknown registration");
    return observeReadbackPref(callback, branch);
  };
  const budget = createBiDiAllocationBudget();
  const runtime = createAgentCaptureRuntime({ registry: w.registry, services: w.services, timers, allocationBudget: budget,
    registerActor: () => { registered.push(AGENT_CAPTURE_ACTOR); return true; },
    readPref: () => (typeof pref.value === "function" ? pref.value() : pref.value), observePref,
    randomToken: (() => { let n = 0; return () => `cl_${String(++n).padStart(32, "0")}`; })(),
    createReadSession: deps => {
      const reader = { deps, captured: [], closed: 0, capabilities: Object.freeze({ viewportScreenshot: true, act: false, open: false }),
        capture: (native, { signal } = {}) => { reader.captured.push({ native, signal }); return options.capture ? options.capture(native) : Promise.resolve({ data_base64: png(2400, 1600) }); },
        // The root reader's own receipt: a Promise of literal true.
        close() { reader.closed++; return options.readerClose ? options.readerClose(reader) : Promise.resolve(true); } };
      readers.push(reader);
      return reader;
    },
    createPngBox: deps => {
      if (options.pngThrows?.()) throw new Error("PNG tools unavailable");
      const box = { deps, validated: 0, resized: [], closeResult: options.pngCloseResult ?? true,
        validatePng: async () => { box.validated++; options.validate?.(); return true; },
        resizePng: async image => { box.resized.push(image); options.resize?.(); return { data_base64: png(image.target_width, image.target_height) }; },
        close: () => { if (box.closeResult === "throw") throw new AgentToolError("UNAVAILABLE"); return box.closeResult; },
        getState: () => ({}) };
      boxes.push(box);
      return box;
    },
    ...options.deps });
  const issued = () => w.registry.metadata(id);
  return { w, win, tab, id, timers, readers, boxes, registered, pref, budget, runtime, issued };
}
const contextFor = (active = () => true) => Object.freeze({ signal: new AbortController().signal, requestSignal: null,
  session: Object.freeze({ session: "s_0000000000000001", project_id: "p_harbor1", state: "approved" }), isActive: active });
const requestFor = (expected, extra = {}) => Object.freeze({ tab_id: expected.tab_id, expected, purpose: "bridge", max_width: 1280, max_height: 16384, max_bytes: 2097152, ...extra });
const messages = f => f.w.queries.map(([name]) => name.split(":")[1]);

test("the actor is registered on the first capture owner only; its options are the fixed top-level http(s) tab scope", () => {
  const f = fixture();
  assert.equal(getAgentCaptureRuntime(), f.runtime);
  const expected = f.runtime.getCaptureExpected(f.issued());
  assert.ok(expected);
  assert.equal(f.runtime.isCaptureCurrent(expected, requestFor(expected)), true);
  assert.deepEqual(f.registered, [], "reading authority registers nothing");
  f.runtime.createCaptureOwner(requestFor(expected), contextFor());
  assert.deepEqual(f.registered, [AGENT_CAPTURE_ACTOR]);
  assert.deepEqual(AGENT_CAPTURE_ACTOR_OPTIONS.matches, ["http://*/*", "https://*/*"]);
  assert.equal(AGENT_CAPTURE_ACTOR_OPTIONS.allFrames, false);
  assert.equal(AGENT_CAPTURE_ACTOR_OPTIONS.includeChrome, false);
  assert.deepEqual(AGENT_CAPTURE_ACTOR_OPTIONS.child.events, { pagehide: { createActor: false } });
});

test("expected: the registry's own issued descriptor of the trusted binding; clones, copies and other requests refuse", () => {
  const f = fixture();
  const tab = f.issued();
  const expected = f.runtime.getCaptureExpected(tab);
  assert.ok(Object.isFrozen(expected));
  assert.equal(expected.binding_token, tab.binding_token);
  assert.equal(expected.title, "", "the registry's own title stays empty");
  assert.ok(f.w.registry.metadata(f.id, { expected }), "it is registry-issued");
  const request = requestFor(expected);
  assert.equal(f.runtime.isCaptureCurrent(expected, request), true);
  const clone = Object.freeze({ ...expected });
  assert.equal(f.runtime.isCaptureCurrent(clone, requestFor(clone)), false, "a frozen clone is not the issued object");
  assert.equal(f.runtime.isCaptureCurrent(expected, requestFor(clone)), false);
  assert.equal(f.runtime.isCaptureCurrent(expected, { ...request, tab_id: "t_999" }), false, "a request for another tab");
  assert.equal(f.runtime.isCaptureCurrent(expected, null), false);
  const sanitized = Object.freeze({ tab_id: tab.tab_id, url: tab.url, title: "", active: true, project_id: tab.project_id, engine: "gecko",
    private: false, document_id: tab.document_id, userContextId: 0 });
  assert.equal(f.runtime.getCaptureExpected(sanitized), null, "a sanitized Core copy is never issued authority");
});

test("currentness: navigation, window close, tab transfer, privacy, container, project and documentGlobal all refuse at once", () => {
  const cases = [
    ["navigation to a new document", f => f.w.load(f.tab, "http://localhost:4450/agent-tools?mode=navigated")],
    ["window closed", f => { f.win.closed = true; }],
    ["window no longer registered", f => { f.w.windows.delete(f.win); }],
    ["tab closing", f => { f.tab.closing = true; }],
    ["tab moved to another window", f => { const other = f.w.window(); f.tab.documentGlobal = other; }],
    ["documentGlobal missing, ownerGlobal misleading", f => { f.tab.ownerGlobal = f.win; delete f.tab.documentGlobal; }],
    ["documentGlobal throws", f => { Object.defineProperty(f.tab, "documentGlobal", { get() { throw new Error("x"); } }); }],
    ["private browsing", f => { f.tab.linkedBrowser.browsingContext.usePrivateBrowsing = true; }],
    ["container changed", f => { f.tab.linkedBrowser.browsingContext.originAttributes.userContextId = 7; }],
    ["project authority withdrawn", f => { f.w.authority = false; }],
    ["global no longer current", f => { f.tab.linkedBrowser.browsingContext.currentWindowGlobal.isCurrentGlobal = false; }],
    ["runtime closed", f => { f.runtime.close(); }],
  ];
  for (const [name, change] of cases) {
    const f = fixture();
    const expected = f.runtime.getCaptureExpected(f.issued());
    const request = requestFor(expected);
    assert.equal(f.runtime.isCaptureCurrent(expected, request), true, name);
    change(f);
    assert.equal(f.runtime.isCaptureCurrent(expected, request), false, name);
  }
  const loose = fixture({ tab: { url: "http://localhost:9999/elsewhere" } });
  const expected = loose.runtime.getCaptureExpected(loose.issued());
  assert.equal(expected.project_id, null);
  assert.equal(loose.runtime.isCaptureCurrent(expected, requestFor(expected)), true, "a project-less tab needs the same settled publication");
  loose.w.snapshot = false;
  assert.equal(loose.runtime.isCaptureCurrent(expected, requestFor(expected)), false);
});

test("a composed owner: begin, rechecks around every native step, reader closed before the terminal commit, frozen PNG", async () => {
  const f = fixture();
  const expected = f.runtime.getCaptureExpected(f.issued());
  const request = requestFor(expected);
  const owner = f.runtime.createCaptureOwner(request, contextFor());
  assert.deepEqual(Object.keys(owner).sort(), ["captureViewport", "close"]);
  const signal = new AbortController().signal;
  const image = await owner.captureViewport(request, { signal });
  assert.deepEqual({ ...image, data_base64: undefined }, { mime: "image/png", width: 1280, height: 853, data_base64: undefined });
  assert.ok(Object.isFrozen(image));
  const sequence = messages(f);
  assert.equal(sequence[0], "Begin");
  assert.equal(sequence.at(-1), "Release");
  assert.equal(f.w.queries.at(-1)[1].commit, true, "the last query is the terminal commit");
  assert.ok(sequence.filter(name => name === "Recheck").length >= 6, "child checkpoints bracket reader, capture, validation and resize");
  const [reader] = f.readers;
  assert.equal(reader.closed, 1, "the owned reader is closed before the commit");
  assert.equal(typeof reader.deps.setTimer, "function");
  assert.equal(typeof reader.deps.clearTimer, "function");
  assert.equal(typeof reader.deps.allocationBudget.claim, "function", "the process budget is shared, never the reader's default");
  const native = reader.captured[0].native;
  assert.deepEqual(Object.keys(native).sort(), ["browsingContext", "document_id", "url"]);
  assert.equal(native.browsingContext, f.tab.linkedBrowser.browsingContext);
  assert.equal(native.document_id, expected.document_id);
  assert.equal(f.boxes[0].resized[0].target_width, 1280);
  assert.equal(await owner.close(), true);
  assert.equal(f.runtime.getState().cleanup_incomplete, false);
});

test("a child refusal that positively retained nothing ends at once: no reader, capture, PNG work or RELEASE", async () => {
  const f = fixture();
  f.w.behavior[AGENT_CAPTURE_MESSAGES.BEGIN] = data => Promise.resolve({ v: 1, token: data.token, ok: false, retained: false });
  const expected = f.runtime.getCaptureExpected(f.issued());
  const request = requestFor(expected);
  const owner = f.runtime.createCaptureOwner(request, contextFor());
  await rejects(owner.captureViewport(request), ["UNAVAILABLE", "NOT_APPROVED"]);
  assert.equal(f.readers.length, 0);
  assert.equal(f.boxes[0].validated, 0);
  assert.equal(f.boxes[0].resized.length, 0);
  assert.deepEqual(messages(f), ["Begin"], "nothing to release");
  assert.equal(f.runtime.getState().unknown_leases, 0, "no parent record is stranded");
  assert.equal(await owner.close(), true);
  assert.ok(f.runtime.createCaptureOwner(requestFor(f.runtime.getCaptureExpected(f.issued())), contextFor()), "the next owner is admitted");
});

test("ok:false alone is never cleanup proof: retained, inconsistent or malformed answers stay owned until an exact RELEASE or the actor's destruction", async () => {
  for (const [name, answer] of [["retained by the child", { ok: false, retained: true }], ["the old shape without retained", { ok: false }],
    ["ok but nothing retained", { ok: true, retained: false }], ["a non-boolean retained", { ok: false, retained: 0 }],
    ["an extra field", { ok: false, retained: false, extra: 1 }]]) {
    const f = fixture();
    const release = deferred();
    f.w.behavior[AGENT_CAPTURE_MESSAGES.BEGIN] = data => Promise.resolve({ v: 1, token: data.token, ...answer });
    f.w.behavior[AGENT_CAPTURE_MESSAGES.RELEASE] = () => release.promise;
    const { owner, result } = await attempt(f);
    await rejects(result, ["UNAVAILABLE", "NOT_APPROVED"]);
    assert.deepEqual(messages(f), ["Begin", "Release"], `${name}: an exact RELEASE is owed`);
    assert.equal(f.w.queries[1][1].commit, false);
    assert.equal(f.runtime.getState().unknown_leases, 1, `${name}: still owned`);
    assert.throws(() => f.runtime.createCaptureOwner(requestFor(f.runtime.getCaptureExpected(f.issued())), contextFor()),
      error => error.code === "UNAVAILABLE", `${name}: a new token cannot bypass it`);
    assert.equal(f.readers.length, 0);
    release.resolve({ v: 1, token: f.w.queries[0][1].token, released: true, committed: false });
    await settle();
    assert.equal(f.runtime.getState().unknown_leases, 0, `${name}: the positive RELEASE retires it`);
    assert.equal(await owner.close(), true);
  }

  // A RELEASE that cannot confirm keeps it; runtime.close retries exactly; the
  // actual actor destruction is the other receipt.
  const f = fixture();
  let confirm = false;
  f.w.behavior[AGENT_CAPTURE_MESSAGES.BEGIN] = data => Promise.resolve({ v: 1, token: data.token, ok: false, retained: true });
  f.w.behavior[AGENT_CAPTURE_MESSAGES.RELEASE] = data => Promise.resolve({ v: 1, token: data.token, released: confirm, committed: false });
  const { owner, result } = await attempt(f);
  await rejects(result, ["UNAVAILABLE", "NOT_APPROVED"]);
  await settle();
  assert.equal(f.runtime.getState().unknown_leases, 1, "released:false is not a receipt");
  assert.equal(await owner.close(), true, "the composed owner itself closed");
  assert.equal(await f.runtime.close(), false, "the unknown lease keeps the runtime open");
  confirm = true;
  assert.equal(await f.runtime.close(), true, "an explicit retry");
  assert.deepEqual(messages(f).filter(kind => kind === "Release").length, 3, "one RELEASE per attempt, nothing else");

  const destroyed = fixture();
  destroyed.w.behavior[AGENT_CAPTURE_MESSAGES.BEGIN] = data => Promise.resolve({ v: 1, token: data.token, ok: false, retained: true });
  destroyed.w.behavior[AGENT_CAPTURE_MESSAGES.RELEASE] = data => Promise.resolve({ v: 1, token: data.token, released: false, committed: false });
  const second = await attempt(destroyed);
  await rejects(second.result, ["UNAVAILABLE", "NOT_APPROVED"]);
  await settle();
  assert.equal(destroyed.runtime.getState().unknown_leases, 1);
  destroyed.runtime.actorDestroyed(destroyed.w.actors[0]);
  assert.equal(destroyed.runtime.getState().unknown_leases, 0, "the exact actor's destruction retires it");
});

test("a failed recheck or a refused commit publishes no image; the lease is retired with commit:false", async () => {
  const recheck = fixture();
  let count = 0;
  recheck.w.behavior[AGENT_CAPTURE_MESSAGES.RECHECK] = data => Promise.resolve({ v: 1, token: data.token, ok: ++count < 3 });
  const expected = recheck.runtime.getCaptureExpected(recheck.issued());
  const request = requestFor(expected);
  const owner = recheck.runtime.createCaptureOwner(request, contextFor());
  await rejects(owner.captureViewport(request), ["UNAVAILABLE", "NOT_APPROVED"]);
  assert.deepEqual(recheck.w.queries.at(-1), [AGENT_CAPTURE_MESSAGES.RELEASE, { v: 1, token: recheck.w.queries[0][1].token, commit: false }]);
  assert.equal(await owner.close(), true);

  const commit = fixture();
  commit.w.behavior[AGENT_CAPTURE_MESSAGES.RELEASE] = data => Promise.resolve({ v: 1, token: data.token, released: true, committed: false });
  const issued = commit.runtime.getCaptureExpected(commit.issued());
  const value = requestFor(issued);
  const second = commit.runtime.createCaptureOwner(value, contextFor());
  await rejects(second.captureViewport(value), "UNAVAILABLE");
  assert.equal(commit.readers[0].closed, 1);
  assert.equal(await second.close(), true);
  assert.equal(commit.runtime.getState().live_leases, 0);
});

test("navigation, a background tab, readback or an oversized viewport between steps refuse before any image", async () => {
  for (const [name, change] of [
    ["navigation during capture", f => f.w.load(f.tab, "http://localhost:4450/agent-tools?mode=type")],
    ["another tab selected", f => { f.win.gBrowser.selectedTab = f.w.tab(f.win); }],
    ["readback preference", f => { f.pref.value = true; }],
    ["a viewport override", f => { f.tab.linkedBrowser.browsingContext.overrideDPPX = 3; }],
    ["an oversized viewport", f => { f.tab.linkedBrowser.getBoundingClientRect = () => ({ width: 9000, height: 9000 }); }],
    ["a hidden window", f => { f.win.document.hidden = true; }],
  ]) {
    const f = fixture({ capture: async () => { change(f); return { data_base64: png(2400, 1600) }; } });
    const expected = f.runtime.getCaptureExpected(f.issued());
    const request = requestFor(expected);
    const owner = f.runtime.createCaptureOwner(request, contextFor());
    await rejects(owner.captureViewport(request), ["NOT_APPROVED", "UNAVAILABLE"]);
    assert.equal(f.w.queries.some(([kind, data]) => kind === AGENT_CAPTURE_MESSAGES.RELEASE && data.commit === true), false, name);
    assert.equal(await owner.close(), true, name);
  }
  const before = fixture();
  before.win.gBrowser.selectedTab = before.w.tab(before.win);
  const expected = before.runtime.getCaptureExpected(before.w.registry.metadata(before.id));
  const request = requestFor(expected);
  const owner = before.runtime.createCaptureOwner(request, contextFor());
  await rejects(owner.captureViewport(request), "NOT_APPROVED");
  assert.deepEqual(before.w.queries, [], "a background tab never reaches the child");
});

test("the caller's own context predicate is required at every parent checkpoint", async () => {
  const f = fixture();
  let allowed = 4;
  const expected = f.runtime.getCaptureExpected(f.issued());
  const request = requestFor(expected);
  const owner = f.runtime.createCaptureOwner(request, contextFor(() => allowed-- > 0));
  await rejects(owner.captureViewport(request), ["NOT_APPROVED", "UNAVAILABLE"]);
  assert.equal(f.readers.length <= 1, true);
  assert.equal(f.w.queries.some(([, data]) => data.commit === true), false);
});

test("actor destruction retires its leases positively; a destroyed actor's capture never publishes", async () => {
  const f = fixture();
  const hold = deferred();
  f.w.behavior[AGENT_CAPTURE_MESSAGES.RECHECK] = () => hold.promise;
  const expected = f.runtime.getCaptureExpected(f.issued());
  const request = requestFor(expected);
  const owner = f.runtime.createCaptureOwner(request, contextFor());
  const capture = owner.captureViewport(request);
  await settle();
  const [actor] = f.w.actors;
  // The parent actor relays only its own destruction to the installed runtime.
  assert.doesNotThrow(() => new AgentCaptureParent().didDestroy(), "an unrelated actor retires nothing");
  assert.equal(f.runtime.getState().live_leases, 1);
  getAgentCaptureRuntime().actorDestroyed(actor);
  hold.reject(new Error("actor destroyed"));
  await rejects(capture, ["UNAVAILABLE", "NOT_APPROVED"]);
  assert.equal(await owner.close(), true, "retired by destruction, not by a timer");
  assert.equal(f.runtime.getState().live_leases, 0);
});

test("a begin whose answer is late stays owned and is retired after the timeout; a lost begin blocks new owners until retired", async () => {
  const late = fixture();
  const answer = deferred();
  late.w.behavior[AGENT_CAPTURE_MESSAGES.BEGIN] = () => answer.promise;
  const expected = late.runtime.getCaptureExpected(late.issued());
  const request = requestFor(expected);
  const owner = late.runtime.createCaptureOwner(request, contextFor());
  const capture = owner.captureViewport(request);
  await settle();
  late.timers.fire(10_000);
  await rejects(capture, "TIMEOUT");
  answer.resolve({ v: 1, token: late.w.queries[0][1].token, ok: true, retained: true });
  await settle();
  assert.deepEqual(late.w.queries.at(-1), [AGENT_CAPTURE_MESSAGES.RELEASE, { v: 1, token: late.w.queries[0][1].token, commit: false }]);
  assert.equal(late.readers.length, 0, "a late lease is never used");

  const lost = fixture();
  const release = deferred();
  lost.w.behavior[AGENT_CAPTURE_MESSAGES.BEGIN] = () => Promise.reject(new Error("no reply"));
  lost.w.behavior[AGENT_CAPTURE_MESSAGES.RELEASE] = () => release.promise;
  const issued = lost.runtime.getCaptureExpected(lost.issued());
  const first = lost.runtime.createCaptureOwner(requestFor(issued), contextFor());
  await rejects(first.captureViewport(requestFor(issued)), ["UNAVAILABLE", "NOT_APPROVED"]);
  assert.equal(lost.runtime.getState().unknown_leases, 1);
  assert.throws(() => lost.runtime.createCaptureOwner(requestFor(issued), contextFor()), error => error.code === "UNAVAILABLE");
  release.resolve({ v: 1, token: lost.w.queries[0][1].token, released: true, committed: false });
  await settle();
  assert.equal(lost.runtime.getState().unknown_leases, 0);
  assert.ok(lost.runtime.createCaptureOwner(requestFor(issued), contextFor()));
});

test("owner close is literal true only when both composed owners closed; failures stay owned and retry", async () => {
  const f = fixture();
  const expected = f.runtime.getCaptureExpected(f.issued());
  const request = requestFor(expected);
  const owner = f.runtime.createCaptureOwner(request, contextFor());
  f.boxes[0].closeResult = "throw";
  assert.equal(await owner.close(), false);
  assert.equal(f.runtime.getState().owners, 1);
  assert.equal(await f.runtime.close(), false, "process close keeps the failed owner");
  assert.throws(() => f.runtime.createCaptureOwner(request, contextFor()), error => error.code === "UNAVAILABLE", "closed for new capture");
  f.boxes[0].closeResult = undefined;
  assert.equal(await owner.close(), false, "undefined is not a receipt");
  f.boxes[0].closeResult = true;
  assert.equal(await f.runtime.close(), true, "an explicit retry closes it");
  assert.equal(f.runtime.getState().cleanup_incomplete, false);
});

// ---------------------------------------------------------------- parent readback observation

/** A fixture whose injected hooks may reach the fixture itself. */
function held(options) {
  const box = {};
  const wrap = fn => (fn ? (...args) => fn(box.f, ...args) : undefined);
  box.f = fixture({ ...options, capture: wrap(options.capture), validate: wrap(options.validate), resize: wrap(options.resize),
    readerClose: wrap(options.readerClose) });
  return box.f;
}
async function attempt(f, { signal } = {}) {
  const expected = f.runtime.getCaptureExpected(f.issued());
  const request = requestFor(expected);
  const owner = f.runtime.createCaptureOwner(request, contextFor());
  return { owner, request, result: owner.captureViewport(request, { signal }) };
}

test("readback false→true→false between any awaited capture, PNG, resize, reader-close or terminal boundary never publishes", async () => {
  const phases = {
    capture: { capture: async f => { f.pref.flip(); return { data_base64: png(2400, 1600) }; } },
    validation: { validate: f => { if (f.boxes[0].validated === 1) f.pref.flip(); } },
    resize: { resize: f => f.pref.flip() },
    "reader close": { readerClose: f => { f.pref.flip(); return Promise.resolve(true); } },
  };
  for (const [name, options] of Object.entries(phases)) {
    const f = held(options);
    const { owner, result } = await attempt(f);
    await rejects(result, ["NOT_APPROVED", "UNAVAILABLE"]);
    assert.equal(f.pref.value, false, `${name}: the preference is false again`);
    assert.equal(f.w.queries.some(([kind, data]) => kind === AGENT_CAPTURE_MESSAGES.RELEASE && data.commit === true), false, `${name}: no commit`);
    assert.equal(await owner.close(), true, name);
    assert.equal(f.pref.observers.size, 0, `${name}: its observer is gone`);
  }
  // During the terminal commit itself: the child commits, the parent still refuses publication.
  const terminal = fixture();
  terminal.w.behavior[AGENT_CAPTURE_MESSAGES.RELEASE] = data => {
    if (data.commit) terminal.pref.flip();
    return Promise.resolve({ v: 1, token: data.token, released: true, committed: data.commit });
  };
  const { owner, result } = await attempt(terminal);
  await rejects(result, "NOT_APPROVED");
  assert.equal(await owner.close(), true);
});

test("unchanged false publishes; the parent observer exists from owner creation through the terminal commit and is removed once", async () => {
  const f = fixture();
  let duringCommit = null;
  f.w.behavior[AGENT_CAPTURE_MESSAGES.RELEASE] = data => {
    if (data.commit) duringCommit = f.pref.observers.size;
    return Promise.resolve({ v: 1, token: data.token, released: true, committed: data.commit });
  };
  const { owner, result } = await attempt(f);
  assert.equal(f.pref.added, 1);
  const image = await result;
  assert.equal(image.mime, "image/png");
  assert.equal(duringCommit, 1, "still observed while the child commits");
  assert.equal(f.pref.observers.size, 1, "kept until the owner closes");
  assert.equal(await owner.close(), true);
  assert.equal(await owner.close(), true);
  assert.deepEqual([f.pref.added, f.pref.removed, f.pref.observers.size], [1, 1, 0]);
});

test("an initially true, missing, non-boolean or unreadable preference, or a failed registration, refuses the owner; its exact removal leaves nothing", () => {
  for (const [name, setup] of [["initially true", f => { f.pref.value = () => { f.readFirst = f.pref.observers.size === 1; return true; }; }],
    ["missing", f => { f.pref.value = null; }], ["not a boolean", f => { f.pref.value = 0; }],
    ["unreadable", f => { f.pref.value = () => { throw new Error("x"); }; }],
    ["registration throws", f => { f.pref.addFails = true; }],
    ["registration throws after registering", f => { f.pref.addFails = true; f.pref.addRegisters = true; }]]) {
    const f = fixture();
    const expected = f.runtime.getCaptureExpected(f.issued());
    setup(f);
    assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), error => error.code === "UNAVAILABLE", name);
    if (name === "initially true") assert.equal(f.readFirst, true, "observed before the first value is trusted");
    assert.equal(f.pref.observers.size, 0, `${name}: the exact observer is gone`);
    assert.deepEqual([f.runtime.getState().owners, f.runtime.getState().readback_observers, f.boxes.length], [0, 0, 0], `${name}: nothing kept, no PNG owner`);
    Object.assign(f.pref, { value: false, addFails: false, addRegisters: false });
    assert.ok(f.runtime.createCaptureOwner(requestFor(expected), contextFor()), `${name}: nothing blocks the next owner`);
  }
});

// ---------------------------------------------------------------- observer ownership: setup orphans and attached watches

test("a refused preference whose observer cannot be removed is a retained orphan; it blocks new owners even once the preference is false", async () => {
  const f = fixture();
  const expected = f.runtime.getCaptureExpected(f.issued());
  f.pref.value = true;
  f.pref.removeFails = true;
  assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), error => error.code === "UNAVAILABLE");
  assert.deepEqual([f.runtime.getState().orphan_observers, f.pref.observers.size], [1, 1]);
  const [orphaned] = f.pref.observers;
  f.pref.value = false;
  assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), error => error.code === "UNAVAILABLE", "the orphan blocks");
  assert.deepEqual([f.pref.added, f.boxes.length], [1, 0], "no second observer, no PNG owner");
  f.pref.removeFails = false;
  const owner = f.runtime.createCaptureOwner(requestFor(expected), contextFor());
  assert.deepEqual([f.pref.removed, f.runtime.getState().orphan_observers, f.pref.added], [1, 0, 2], "the admission retried the exact orphan once, then observed afresh");
  assert.doesNotThrow(() => orphaned(), "a late notification of the removed orphan is inert");
  const image = await owner.captureViewport(requestFor(expected));
  assert.equal(image.mime, "image/png", "the new owner's own observer saw nothing");
  assert.equal(await owner.close(), true);
  assert.equal(await f.runtime.close(), true);
});

test("an observation that fails without its exact removal stays owned for good: no PNG owner, every new owner refused, close never positive", async () => {
  const f = fixture();
  const expected = f.runtime.getCaptureExpected(f.issued());
  f.pref.observeThrows = true;
  assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), error => error.code === "UNAVAILABLE");
  assert.deepEqual([f.runtime.getState().orphan_observers, f.boxes.length], [1, 0], "retained before registration was attempted");
  f.pref.observeThrows = false;
  assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), error => error.code === "UNAVAILABLE");
  assert.equal(f.pref.added, 0);
  assert.equal(await f.runtime.close(), false, "an unknown registration is never reported as cleaned");
  assert.equal(f.runtime.getState().cleanup_incomplete, true);
});

test("a PNG factory that throws leaves the already-registered observer a setup orphan, removed now or retained while removal fails", async () => {
  let fail = true;
  const f = fixture({ pngThrows: () => fail });
  const expected = f.runtime.getCaptureExpected(f.issued());
  assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), /PNG tools unavailable/u);
  assert.deepEqual([f.pref.added, f.pref.removed, f.runtime.getState().readback_observers], [1, 1, 0], "observed first, then removed exactly");
  f.pref.removeFails = true;
  assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), /PNG tools unavailable/u);
  assert.deepEqual([f.runtime.getState().orphan_observers, f.pref.observers.size], [1, 1]);
  fail = false;
  assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), error => error.code === "UNAVAILABLE", "blocked by the orphan");
  assert.equal(await f.runtime.close(), false);
  f.pref.removeFails = false;
  assert.equal(await f.runtime.close(), true, "close retires the orphan on its own");
  assert.equal(f.pref.observers.size, 0);
});

test("a viewport factory that throws keeps the observer attached to the PNG owner until that owner closed positively", async () => {
  const throwing = { createViewportCapture: () => { throw new Error("viewport"); } };
  const f = fixture({ deps: throwing });
  const expected = f.runtime.getCaptureExpected(f.issued());
  assert.throws(() => f.runtime.createCaptureOwner(requestFor(expected), contextFor()), /viewport/u);
  await settle();
  assert.deepEqual([f.runtime.getState().owners, f.pref.observers.size], [0, 0], "a positive PNG close retires the partial owner at once");

  const failing = fixture({ deps: throwing, pngCloseResult: false });
  const issued = failing.runtime.getCaptureExpected(failing.issued());
  assert.throws(() => failing.runtime.createCaptureOwner(requestFor(issued), contextFor()), /viewport/u);
  await settle();
  assert.deepEqual([failing.runtime.getState().owners, failing.runtime.getState().orphan_observers, failing.pref.observers.size], [1, 0, 1],
    "attached, not an orphan: it stays while its PNG owner is open");
  assert.throws(() => failing.runtime.createCaptureOwner(requestFor(issued), contextFor()), error => error.code === "UNAVAILABLE", "a failed close blocks");
  assert.equal(await failing.runtime.close(), false);
  assert.equal(failing.pref.observers.size, 1, "close never removes an attached observer early");
  failing.boxes[0].closeResult = true;
  assert.equal(await failing.runtime.close(), true);
  assert.equal(failing.pref.observers.size, 0);
});

test("a false or pending reader close keeps the attached observer through runtime.close; one positive retry removes it exactly once", async () => {
  for (const mode of ["false", "pending"]) {
    let calls = 0, release = null;
    const f = held({ readerClose: () => {
      calls++;
      if (mode === "pending" && calls === 1) return new Promise(resolve => { release = resolve; });
      return Promise.resolve(mode === "false" && calls <= 2 ? false : true);
    } });
    const { owner, result } = await attempt(f);
    if (mode === "pending") {
      // The bounded waits (before the commit, then the failed capture's own
      // disposal) end the request; the reader's close stays pending.
      await settle(); f.timers.fire(1_000); await settle(); f.timers.fire(1_000);
    }
    await rejects(result, ["UNAVAILABLE", "NOT_APPROVED"]);
    assert.deepEqual([f.runtime.getState().owners, f.pref.observers.size, f.pref.removed], [1, 1, 0], `${mode}: retained, still observed`);
    if (mode === "false") {
      assert.equal(await f.runtime.close(), false, "the reader still answers false");
      assert.deepEqual([f.pref.observers.size, f.pref.removed], [1, 0], "a failed owner close never removes its observer");
      assert.equal(await f.runtime.close(), true, "the explicit retry");
      assert.equal(calls, 3);
    } else {
      const closing = f.runtime.close();
      await settle();
      assert.deepEqual([f.pref.observers.size, f.pref.removed], [1, 0], "pending: the observer outlives the reader");
      release(true);
      assert.equal(await closing, true);
      assert.equal(calls, 1, "the same pending attempt, never a second close");
    }
    assert.deepEqual([f.pref.observers.size, f.pref.removed], [0, 1], `${mode}: removed exactly once, after the receipts`);
    assert.equal(await owner.close(), true);
    assert.equal(f.pref.removed, 1);
  }
});

test("a late notification after publication invalidates the owner for good: it never publishes again", async () => {
  const f = fixture();
  const { owner, request, result } = await attempt(f);
  assert.equal((await result).mime, "image/png");
  f.pref.flip();
  await rejects(owner.captureViewport(request), ["NOT_APPROVED", "UNAVAILABLE"]);
  assert.equal(f.w.queries.filter(([, data]) => data.commit === true).length, 1, "the one earlier commit only");
  assert.equal(await owner.close(), true);
});

test("an observer that cannot be removed keeps the owner retained; an explicit retry closes it; late notifications are inert", async () => {
  const f = fixture();
  const { owner, result } = await attempt(f);
  await result;
  const [callback] = f.pref.observers;
  f.pref.removeFails = true;
  assert.equal(await owner.close(), false);
  assert.deepEqual([f.runtime.getState().owners, f.runtime.getState().readback_observers], [1, 1]);
  assert.equal(await f.runtime.close(), false);
  f.pref.removeFails = false;
  assert.equal(await owner.close(), true);
  assert.equal(await f.runtime.close(), true);
  assert.doesNotThrow(() => callback());
  assert.equal(f.runtime.getState().cleanup_incomplete, false);
});

// ---------------------------------------------------------------- the reader's own close receipt

test("a deferred reader close blocks the terminal commit; only its literal-true receipt lets the image publish", async () => {
  let release;
  const f = held({ readerClose: () => new Promise(resolve => { release = resolve; }) });
  const { owner, result } = await attempt(f);
  await settle();
  assert.equal(f.readers[0].closed, 1);
  assert.equal(f.w.queries.some(([, data]) => data.commit === true), false, "no commit while the reader is still closing");
  release(true);
  const image = await result;
  assert.equal(image.width, 1280);
  assert.equal(await owner.close(), true);
  assert.equal(f.readers[0].closed, 1, "a retired reader is not closed again");
});

test("a false or rejected reader receipt keeps the exact reader owned; one explicit positive retry retires it exactly once", async () => {
  for (const failure of [() => Promise.resolve(false), () => Promise.reject(new Error("destroy failed")), () => Promise.resolve(undefined), () => undefined]) {
    let calls = 0;
    const f = held({ readerClose: () => (++calls === 1 ? failure() : Promise.resolve(true)) });
    const { owner, result } = await attempt(f);
    await rejects(result, "UNAVAILABLE");
    assert.equal(f.w.queries.some(([, data]) => data.commit === true), false);
    assert.equal(f.runtime.getState().owners, 1, "retained after a failed receipt");
    assert.equal(await owner.close(), true, "the owner's explicit close retries the same reader");
    assert.equal(calls, 2);
    assert.equal(await owner.close(), true);
    assert.equal(calls, 2, "exactly once");
  }
});

test("cancellation while the reader closes suppresses publication; the owner closes only after the late positive receipt", async () => {
  let release;
  const f = held({ readerClose: () => new Promise(resolve => { release = resolve; }) });
  const controller = new AbortController();
  const { owner, result } = await attempt(f, { signal: controller.signal });
  await settle();
  controller.abort();
  await settle();
  // The failed capture waits for its bounded disposal; the bound, not the reader, ends that wait.
  f.timers.fire(1_000);
  await rejects(result, "NOT_APPROVED");
  const closing = owner.close();
  await settle();
  assert.equal(f.runtime.getState().owners, 1, "still retained while the reader closes");
  release(true);
  assert.equal(await closing, true);
  assert.equal(f.w.queries.some(([, data]) => data.commit === true), false);
});
