/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 4: Send to agent in one synthetic browser window. The window,
// tab, browser, browsing context, window global, PopupNotifications, clipboard
// helper and services are in-memory fakes; the content side is the actual
// AgentHandoffChild logic over a synthetic document with recording getters,
// and the actual pure AgentHandoff core runs in between. Not evidence of Gecko
// key handling, doorhanger rendering, actor IPC or the system clipboard.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { Document, makeEvent } from "./support/mini-dom.mjs";
import { inspectHandoffDocument, HANDOFF_MESSAGES } from "../chrome/AgentHandoffChild.sys.mjs";

const { installAgentHandoff, HANDOFF_KEY, HANDOFF_MENU_ITEM, HANDOFF_NOTIFICATION, HANDOFF_RESULT_NOTIFICATION, currentNavigationId }
  = await import("../chrome/AgentHandoffRuntime.sys.mjs");
const { watchNativeNavigation } = await import("../chrome/ConsoleErrorsNativeRuntime.sys.mjs");

const XHTML = "http://www.w3.org/1999/xhtml";
const PAGE = "http://localhost:5173/settings?token=secret#tab";
const PROJECT = Object.freeze({ id: "p_harbor1", root: "/Volumes/Synthetic/harbor-suite" });
const flush = async (rounds = 80) => { for (let i = 0; i < rounds; i++) await Promise.resolve(); };

function browserDocument() {
  const document = new Document();
  document.createXULElement = tag => document.createElement(tag);
  const root = document.documentElement;
  const popupset = document.createElement("popupset"); popupset.id = "mainPopupSet";
  const keyset = document.createElement("keyset"); keyset.id = "mainKeyset";
  const menu = document.createElement("menupopup"); menu.id = "contentAreaContextMenu";
  const screenshot = document.createElement("menuitem"); screenshot.id = "context-take-screenshot";
  const separator = document.createElement("menuseparator"); separator.id = "context-sep-screenshots";
  menu.append(screenshot, separator);
  root.append(keyset, popupset, menu);
  return document;
}

function fakePopups() {
  const shown = [];
  const api = {
    shown,
    show(browser, id, message, anchor, mainAction, secondaryActions, options) {
      const existing = api.getNotification(id, browser);
      if (existing) api.remove(existing);
      const notification = { id, browser, message, anchor, mainAction, secondaryActions, options, removed: false };
      shown.push(notification);
      options?.eventCallback?.("showing");
      options?.eventCallback?.("shown");
      return notification;
    },
    remove(notification) {
      if (!notification || notification.removed) return;
      notification.removed = true;
      notification.options?.eventCallback?.("removed");
    },
    getNotification: (id, browser) => shown.find(item => item.id === id && item.browser === browser && !item.removed) ?? null,
    // As PopupNotifications._onButtonEvent: the action runs with the click, then the notification is removed.
    click(notification, isTrusted = true) { notification.mainAction.callback({ checkboxChecked: false, source: "button", event: { isTrusted } }); api.remove(notification); },
    cancel(notification) { notification.secondaryActions[0].callback({ source: "button", event: { isTrusted: true } }); api.remove(notification); },
  };
  return api;
}

function fixture({ url = PAGE, title = "Synthetic settings", selection = "render failed\r\nat line 2", collapsed = false, inputs = [],
  engine = "gecko", authority = PROJECT, privateWindow = false, workspace = "{11111111-1111-4111-8111-111111111111}",
  fixtureEnv = false, securityDelayMs = 0, native = null } = {}) {
  const document = browserDocument();
  const popups = fakePopups();
  const reads = [], queries = [], copies = [], targets = [], listeners = [], events = new Map();
  const state = { normal: true, authorityChecks: 0, failCheckAt: null, authority, captureHook: null, sendQuery: null, busy: false,
    fixtureEnv, factory: null, windowActive: true, elapsed: 0 };
  const factoryCalls = [];
  const content = { title, selection, collapsed, inputs };
  const principal = { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true, privateBrowsingId: 0, userContextId: 0,
    origin: URL.parse(url)?.origin ?? "about:blank" };
  const global = { isClosed: false, isCurrentGlobal: true, innerWindowId: 11, documentPrincipal: principal, documentURI: { spec: url } };
  const context = { usePrivateBrowsing: false, parent: null, currentWindowGlobal: global, originAttributes: { userContextId: 0 } };
  context.top = context;
  const browser = { browserId: 5, permanentKey: {}, frameLoader: {}, browsingContext: context, currentURI: { spec: url }, focused: 0,
    focus() { this.focused++; } };
  const tabContainer = document.createElement("tabs");
  const window = { document, closed: false, PopupNotifications: popups, gContextMenu: null };
  // Native nodes name their window through Node.documentGlobal (Node.webidl); there is no ownerGlobal.
  const tab = { documentGlobal: window, closing: false, isConnected: true, linkedBrowser: browser, workspace };
  const otherTab = { documentGlobal: window, closing: false, isConnected: true, linkedBrowser: { browserId: 6, permanentKey: {}, frameLoader: {} } };
  // The tabbrowser's own selected browser; a test can change it alone, without any event.
  let browserOverride = null;
  window.gBrowser = {
    selectedTab: tab, get selectedBrowser() { return browserOverride ?? this.selectedTab.linkedBrowser; }, tabs: [tab, otherTab], tabContainer,
    getTabForBrowser: candidate => [tab, otherTab].find(item => item.linkedBrowser === candidate) ?? null,
    addTabsProgressListener: listener => listeners.push(listener),
    removeTabsProgressListener: listener => { const index = listeners.indexOf(listener); if (index >= 0) listeners.splice(index, 1); },
  };
  // The page: the actual child logic over a synthetic document of this global.
  function contentDocument() {
    const doc = {};
    const node = { ownerDocument: doc };
    Object.defineProperties(doc, {
      documentURI: { get: () => global.documentURI.spec },
      nodePrincipal: { get: () => ({ ...principal, schemeIs: scheme => new URL(global.documentURI.spec).protocol === `${scheme}:` }) },
      title: { get: () => { reads.push("title"); return content.title; } },
      activeElement: { get: () => null },
    });
    doc.querySelectorAll = () => content.inputs;
    doc.getSelection = () => ({ rangeCount: content.collapsed ? 0 : 1, isCollapsed: content.collapsed,
      getRangeAt: () => ({ startContainer: node, endContainer: node }), toString: () => { reads.push("selection"); return content.selection; } });
    return doc;
  }
  global.getActor = name => ({
    async sendQuery(message, data) {
      queries.push([name, message, data]);
      if (state.sendQuery) return state.sendQuery(message, data);
      const answer = inspectHandoffDocument({ manager: global, browsingContext: context, document: contentDocument() }, data,
        message === HANDOFF_MESSAGES.PRECHECK ? "precheck" : "capture");
      if (message === HANDOFF_MESSAGES.CAPTURE) state.captureHook?.();
      return structuredClone(answer);
    },
  });
  const authorityFor = project => ({ project, name: project ? "Harbor Suite" : null,
    check: () => {
      state.authorityChecks++;
      state.onCheck?.(state.authorityChecks);
      return state.failCheckAt === null || state.authorityChecks < state.failCheckAt;
    } });
  const services = {
    isNormalWindow: candidate => candidate === window && state.normal,
    captureHandoffAuthority: async ({ window: candidate, tab: target, url: address, userContextId }) => {
      if (candidate !== window || target !== tab || address !== url || userContextId !== 0) throw Object.assign(new Error("X"), { code: "INVALID_INPUT" });
      if (state.busy) throw Object.assign(new Error("PROJECT_CHANGED"), { code: "PROJECT_CHANGED" });
      return authorityFor(state.authority);
    },
    rememberAgentReturnTarget: target => { targets.push(target); return true; },
    on: (name, callback) => { events.set(name, callback); return () => events.delete(name); },
    ...(native ? { captureNativeProjectAuthority: args => native.capture(args) } : {}),
  };
  const adapter = { isPrivateWindow: () => privateWindow, workspaceForTab: target => target.workspace ?? null };
  const timers = { setTimeout: () => 1, clearTimeout: () => {} };
  let serial = 0;
  const runtime = installAgentHandoff(window, { services, adapter, engineOf: () => engine, timers, clock: () => 1_700_000_000_000,
    ...(native ? { nativeOwner: native.owner } : {}),
    clipboardHelper: { copyString: text => copies.push(text) }, registerActor: () => true,
    requestId: () => `hf_${(++serial).toString(16).padStart(16, "0")}`,
    // Synthetic-agent seams: privileged flags and the root factory, both fakes here.
    fixtureRequested: () => state.fixtureEnv,
    createTerminalFixture: options => {
      factoryCalls.push(options);
      if (!state.factory) throw Object.assign(new Error("TERMINAL_FIXTURE_UNAVAILABLE"), { code: "TERMINAL_FIXTURE_UNAVAILABLE" });
      return state.factory(options);
    },
    isWindowActive: () => state.windowActive, securityDelayMs, elapsed: () => state.elapsed });
  const key = () => document.getElementById(HANDOFF_KEY.id);
  const press = async (isTrusted = true) => { key().dispatchEvent(makeEvent("command", { isTrusted })); await flush(); };
  const compose = () => popups.getNotification(HANDOFF_NOTIFICATION, browser);
  const result = () => popups.getNotification(HANDOFF_RESULT_NOTIFICATION, browser);
  const navigate = (sameDocument = false) => { for (const listener of [...listeners]) listener.onLocationChange(browser, { isTopLevel: true }, null, null, sameDocument ? 1 : 0); };
  const copy = async (isTrusted = true) => { popups.click(compose(), isTrusted); await flush(); };
  return { window, document, tab, otherTab, browser, global, principal, popups, reads, queries, copies, targets, state, content, events,
    runtime, services, key, press, compose, result, navigate, copy, tabContainer, listeners, factoryCalls,
    setSelectedBrowser: value => { browserOverride = value; },
    fixtureButton: () => document.getElementById("axiosozo-handoff-fixture"),
    sendToFixture: async (isTrusted = true) => {
      document.getElementById("axiosozo-handoff-fixture").dispatchEvent(makeEvent("command", { isTrusted }));
      await flush();
    },
    template: () => document.getElementById(`${HANDOFF_NOTIFICATION}-notification`),
    textarea: () => document.getElementById("axiosozo-handoff-task"), checkbox: () => document.getElementById("axiosozo-handoff-selection") };
}

test("one trusted shortcut opens the doorhanger after a privacy precheck; untrusted commands do nothing", async () => {
  const f = fixture();
  try {
    await f.press(false);
    assert.deepEqual([f.queries.length, f.popups.shown.length], [0, 0], "a synthetic event opens nothing");
    await f.press();
    assert.deepEqual(f.queries.map(([name, message, data]) => [name, message, data]),
      [["AxioSozoHandoff", HANDOFF_MESSAGES.PRECHECK, { url: PAGE, inner_window_id: 11 }]]);
    assert.deepEqual(f.reads, [], "opening reads no title and no selected text");
    const doorhanger = f.compose();
    assert.deepEqual([doorhanger.message, doorhanger.options.name, doorhanger.anchor], ["Copy <> for an agent", "localhost:5173/settings", null]);
    assert.deepEqual([doorhanger.mainAction.label, doorhanger.secondaryActions.map(action => action.label)], ["Copy for agent", ["Cancel"]]);
    assert.equal(doorhanger.secondaryActions[0].disableSecurityDelay, true, "Cancel is never delayed; Copy keeps the clickjacking delay");
    assert.equal(doorhanger.mainAction.disableSecurityDelay, undefined);
    assert.equal(f.textarea().getAttribute("aria-labelledby"), "axiosozo-handoff-task-label");
    assert.equal(f.document.activeElement, f.textarea(), "focus moves into the task field");
    assert.deepEqual([f.checkbox().checked, f.checkbox().disabled], [true, false]);
    assert.match(f.document.getElementById("axiosozo-handoff-content").textContent, /Project folder: \/Volumes\/Synthetic\/harbor-suite \(Harbor Suite\)/u);
    assert.match(f.document.getElementById("axiosozo-handoff-content").textContent, /Screenshots, console errors and opening Claude Code or Codex directly are not in this build yet\./u);
  } finally { f.runtime.dispose(); }
});

test("Copy: the trusted click sends one exact request through the core; the clipboard gets the bounded context; the return target is native", async () => {
  const f = fixture();
  try {
    await f.press();
    f.textarea().value = "Fix the\r\nsettings form";
    await f.copy();
    assert.equal(f.copies.length, 1);
    const context = JSON.parse(f.copies[0]);
    assert.deepEqual(context, { version: 1, request_id: "hf_0000000000000001", created_at: 1_700_000_000_000,
      project: PROJECT, page: { url: "http://localhost:5173/settings", title: "Synthetic settings", selection: "render failed\nat line 2", screen: null },
      console_errors: [], task: "Fix the\nsettings form" });
    assert.deepEqual(f.targets, [{ project_id: "p_harbor1", tab_id: "t_5", navigation_id: "w11.n0", user_context_id: 0 }]);
    assert.match(f.result().message, /^Copied for your agent\./u);
    assert.equal(f.browser.focused > 0, true, "focus returns to the page");
    const captures = f.queries.filter(([, message]) => message === HANDOFF_MESSAGES.CAPTURE);
    assert.deepEqual(captures.map(([, , data]) => data), [{ url: PAGE, inner_window_id: 11, include_selection: true }]);
    // A replayed click on the finished doorhanger does nothing: its session is gone.
    f.popups.shown.find(item => item.id === HANDOFF_NOTIFICATION).mainAction.callback({ event: { isTrusted: true } });
    await flush();
    assert.equal(f.copies.length, 1);
    await f.press(); await f.copy();
    assert.equal(f.copies.length, 2, "a second copy needs a second trusted command");
    assert.equal(JSON.parse(f.copies[1]).request_id, "hf_0000000000000002");
  } finally { f.runtime.dispose(); }
});

test("an untrusted Copy click copies nothing and ends the session", async () => {
  const f = fixture();
  try {
    await f.press();
    await f.copy(false);
    assert.deepEqual([f.copies.length, f.queries.length], [0, 1]);
    assert.equal(f.compose(), null);
    assert.deepEqual(f.reads, []);
  } finally { f.runtime.dispose(); }
});

test("unticking the selection: no selected text is read and none is copied; no selection means the opt-in is disabled", async () => {
  const f = fixture();
  try {
    await f.press();
    f.checkbox().checked = false;
    await f.copy();
    assert.deepEqual(f.reads, ["title"]);
    assert.equal(JSON.parse(f.copies[0]).page.selection, null);
    const g = fixture({ collapsed: true });
    try {
      await g.press();
      assert.deepEqual([g.checkbox().checked, g.checkbox().disabled], [false, true]);
      assert.match(g.checkbox().getAttribute("label"), /nothing is selected/u);
    } finally { g.runtime.dispose(); }
  } finally { f.runtime.dispose(); }
});

test("a page with a password field is refused at the precheck: no doorhanger, nothing read, nothing copied", async () => {
  const f = fixture({ inputs: [{ localName: "input", namespaceURI: XHTML, hasBeenTypePassword: true }] });
  try {
    await f.press();
    assert.equal(f.compose(), null);
    assert.match(f.result().message, /password field/u);
    assert.deepEqual([f.reads, f.copies], [[], []]);
  } finally { f.runtime.dispose(); }
});

test("sensitive sites, non-web pages, Chromium tabs and private windows are refused before any content query", async () => {
  for (const [options, pattern] of [[{ url: "https://accounts.google.com/signin" }, /sensitive sites/u], [{ url: "about:preferences" }, /Only web pages/u],
    [{ engine: "chromium" }, /Chromium/u], [{ url: "https://user:pw@localhost:5173/" }, /Only web pages/u]]) {
    const f = fixture(options);
    try {
      await f.press();
      assert.deepEqual([f.queries.length, f.compose()], [0, null]);
      assert.match(f.result().message, pattern);
    } finally { f.runtime.dispose(); }
  }
  const hidden = fixture({ privateWindow: true });
  assert.equal(hidden.key(), null, "a private window gets no shortcut at all");
  assert.equal(hidden.document.getElementById(HANDOFF_MENU_ITEM), null);
  hidden.runtime.dispose();
  const unknown = fixture();
  try {
    unknown.state.normal = false;
    await unknown.press();
    assert.deepEqual([unknown.queries.length, unknown.compose()], [0, null], "a window the services no longer know as normal is refused");
  } finally { unknown.runtime.dispose(); }
});

test("navigation, including a same-document one, ends the session; the old doorhanger cannot copy", async () => {
  for (const sameDocument of [false, true]) {
    const f = fixture();
    try {
      await f.press();
      const doorhanger = f.compose();
      f.navigate(sameDocument);
      assert.equal(doorhanger.removed, true);
      doorhanger.mainAction.callback({ event: { isTrusted: true } });
      await flush();
      assert.deepEqual(f.copies, []);
      assert.equal(currentNavigationId(f.window, f.browser), "w11.n1");
    } finally { f.runtime.dispose(); }
  }
});

test("navigation while capturing discards the capture; nothing is copied and the change is said calmly", async () => {
  const f = fixture();
  try {
    await f.press();
    f.state.captureHook = () => { f.global.documentURI.spec = "http://localhost:5173/next"; f.browser.currentURI.spec = "http://localhost:5173/next"; };
    await f.copy();
    assert.deepEqual(f.copies, []);
    assert.match(f.result().message, /The page changed before it was copied/u);
    assert.deepEqual(f.targets, []);
  } finally { f.runtime.dispose(); }
});

test("a process swap (new frameLoader), another principal, container or space while copying discards everything", async () => {
  for (const change of [f => { f.browser.frameLoader = {}; }, f => { f.principal.origin = "http://localhost:5174"; },
    f => { f.principal.userContextId = 3; }, f => { f.tab.workspace = "{22222222-2222-4222-8222-222222222222}"; },
    f => { f.global.innerWindowId = 12; }]) {
    const f = fixture();
    try {
      await f.press();
      f.state.captureHook = () => change(f);
      await f.copy();
      assert.deepEqual([f.copies, f.targets], [[], []]);
      assert.match(f.result().message, /The page changed before it was copied/u);
    } finally { f.runtime.dispose(); }
  }
});

test("while the capture awaits, another selected tab or browser without any TabSelect delivery discards everything", async () => {
  for (const change of [f => { f.window.gBrowser.selectedTab = f.otherTab; }, f => { f.setSelectedBrowser(f.otherTab.linkedBrowser); },
    f => { f.setSelectedBrowser({ ...f.browser }); }]) {
    const f = fixture();
    try {
      await f.press();
      f.state.captureHook = () => change(f); // no lifecycle event is delivered
      await f.copy();
      assert.deepEqual([f.copies, f.targets], [[], []], "the clipboard stays untouched");
      assert.equal(f.reads.includes("title"), true, "the page answered; only chrome's own rebinding refused it");
    } finally { f.runtime.dispose(); }
  }
});

test("the final copy boundary itself rechecks the selected tab, selected browser and frameLoader synchronously", async () => {
  // The fifth authority check is the last describe's, after its own tab checks
  // and immediately before the clipboard write: the change lands in between.
  for (const change of [f => { f.window.gBrowser.selectedTab = f.otherTab; }, f => { f.setSelectedBrowser(f.otherTab.linkedBrowser); },
    f => { f.browser.frameLoader = {}; }]) {
    const f = fixture();
    try {
      await f.press();
      const before = f.state.authorityChecks;
      f.state.onCheck = count => { if (count === before + 5) change(f); };
      await f.copy();
      assert.deepEqual([f.copies, f.targets], [[], []]);
      assert.equal(f.state.authorityChecks, before + 5, "refused at the tab guard, before the authority check and the copy");
    } finally { f.runtime.dispose(); }
  }
});

test("only a known live tab with its native permanentKey and frameLoader is offered; unknown state reads nothing", async () => {
  for (const change of [f => { f.tab.closing = undefined; }, f => { f.tab.isConnected = undefined; }, f => { f.tab.closing = true; },
    f => { delete f.browser.permanentKey; }, f => { f.browser.frameLoader = null; }]) {
    const f = fixture();
    try {
      change(f);
      await f.press();
      assert.deepEqual([f.queries.length, f.compose(), f.copies.length], [0, null, 0]);
    } finally { f.runtime.dispose(); }
  }
});

test("the tab's own window is its native Node.documentGlobal: foreign, missing or ownerGlobal-only tabs are never offered", async () => {
  const valid = fixture();
  try {
    assert.ok(!("ownerGlobal" in valid.tab), "native-shaped tab: no ownerGlobal");
    await valid.press();
    assert.equal(valid.queries.length, 1, "a native tab of this window is prechecked");
    assert.ok(valid.compose(), "and offered");
  } finally { valid.runtime.dispose(); }
  for (const [label, change] of [
    ["a foreign window", f => { f.tab.documentGlobal = { gBrowser: f.window.gBrowser }; }],
    ["no document window", f => { delete f.tab.documentGlobal; }],
    ["the obsolete ownerGlobal only", f => { delete f.tab.documentGlobal; f.tab.ownerGlobal = f.window; }],
  ]) {
    const f = fixture();
    try {
      change(f);
      await f.press();
      assert.deepEqual([f.queries.length, f.compose(), f.copies.length, f.reads], [0, null, 0, []], label);
    } finally { f.runtime.dispose(); }
  }
});

test("the final clipboard guard checks project authority synchronously: a change just before the write copies nothing", async () => {
  const f = fixture();
  try {
    await f.press();
    const before = f.state.authorityChecks;
    // send(1), describe(2), capture(3), describe(4), describe(5); the sixth check is the clipboard guard's.
    f.state.failCheckAt = before + 6;
    await f.copy();
    assert.equal(f.state.authorityChecks, before + 6);
    assert.deepEqual(f.copies, []);
    assert.match(f.result().message, /projects were changing/u);
  } finally { f.runtime.dispose(); }
});

test("a project write while copying ends it at once; unknown authority at open is read again, and a different project is refused", async () => {
  const f = fixture();
  try {
    await f.press();
    f.state.captureHook = () => { f.state.failCheckAt = 1; f.events.get("projects")?.(); };
    await f.copy();
    assert.deepEqual(f.copies, []);
  } finally { f.runtime.dispose(); }
  const g = fixture();
  try {
    g.state.busy = true;
    await g.press();
    assert.match(g.document.getElementById("axiosozo-handoff-content").textContent, /read again when you copy/u);
    g.state.busy = false;
    await g.copy();
    assert.equal(JSON.parse(g.copies[0]).project.id, "p_harbor1", "read again at quiescence before the copy");
  } finally { g.runtime.dispose(); }
  const h = fixture();
  try {
    await h.press();
    h.state.failCheckAt = 1;
    h.state.authority = { id: "p_other1", root: "/Volumes/Synthetic/other" };
    await h.copy();
    assert.deepEqual(h.copies, []);
    assert.match(h.result().message, /projects were changing/u);
  } finally { h.runtime.dispose(); }
});

test("an unprojected page copies with project null; never an invented one", async () => {
  const f = fixture({ authority: null });
  try {
    await f.press();
    assert.match(f.document.getElementById("axiosozo-handoff-content").textContent, /belongs to no AxioSozo project/u);
    await f.copy();
    assert.equal(JSON.parse(f.copies[0]).project, null);
    assert.deepEqual(f.targets, [], "no project, no return target");
  } finally { f.runtime.dispose(); }
});

test("Cancel, Escape-equivalent removal, tab switch and tab close end the session without a copy", async () => {
  const f = fixture();
  try {
    await f.press();
    f.popups.cancel(f.compose());
    await flush();
    assert.equal(f.browser.focused > 0, true, "Cancel returns focus to the page");
    await f.press();
    f.window.gBrowser.selectedTab = f.otherTab;
    f.tabContainer.dispatchEvent(makeEvent("TabSelect"));
    assert.equal(f.compose(), null);
    f.window.gBrowser.selectedTab = f.tab;
    await f.press();
    f.state.captureHook = () => f.tabContainer.dispatchEvent(makeEvent("TabClose", { target: f.tab }));
    await f.copy();
    assert.deepEqual(f.copies, []);
    assert.equal(f.result(), null, "a cancelled copy needs no message");
  } finally { f.runtime.dispose(); }
});

test("the context menu reads nothing on opening, shows only for eligible pages, and its trusted command opens the doorhanger", async () => {
  const f = fixture();
  try {
    const menu = f.document.getElementById("contentAreaContextMenu");
    const item = f.document.getElementById(HANDOFF_MENU_ITEM);
    assert.equal(item.getAttribute("key"), HANDOFF_KEY.id);
    assert.equal(menu.children.indexOf(item), 1, "beside the native screenshot item");
    f.window.gContextMenu = { browser: f.browser };
    menu.dispatchEvent(makeEvent("popupshowing"));
    assert.deepEqual([item.hidden, f.queries.length, f.reads.length], [false, 0, 0]);
    item.dispatchEvent(makeEvent("command", { isTrusted: false }));
    await flush();
    assert.equal(f.queries.length, 0);
    item.dispatchEvent(makeEvent("command"));
    await flush();
    assert.notEqual(f.compose(), null);
    menu.dispatchEvent(makeEvent("popuphidden"));
    f.global.documentURI.spec = f.browser.currentURI.spec = "about:blank";
    menu.dispatchEvent(makeEvent("popupshowing"));
    assert.equal(item.hidden, true);
  } finally { f.runtime.dispose(); }
});

test("teardown removes the shortcut, the menu item, the doorhanger template and every listener; a pending session ends", async () => {
  const f = fixture();
  await f.press();
  const doorhanger = f.compose();
  assert.equal(f.listeners.length, 1);
  f.runtime.dispose();
  assert.equal(doorhanger.removed, true);
  for (const id of [HANDOFF_KEY.id, "axiosozo-handoff-keyset", HANDOFF_MENU_ITEM, `${HANDOFF_NOTIFICATION}-notification`]) {
    assert.equal(f.document.getElementById(id), null, id);
  }
  assert.deepEqual([f.listeners.length, f.events.size], [0, 0]);
  assert.equal(currentNavigationId(f.window, f.browser), null, "no identity without a live tracker");
  doorhanger.mainAction.callback({ event: { isTrusted: true } });
  await flush();
  assert.deepEqual(f.copies, []);
  f.runtime.dispose();
});

// ---------------------------------------------------------------- synthetic test agent (fake Terminal fixture)

const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
const HANDED_OFF = Object.freeze({ version: 1, status: "handed_off", agent: "fake", may_have_launched: true, launch_id: "0".repeat(32) });

/** A fake of the root factory's frozen result. Its launch mimics the real
 * fixture: it honours the abort signal and asks the session's isActive() at
 * the native dispatch, which is counted only when it actually happens. */
function fakeFixture(f, { launch = null, gate = null } = {}) {
  const record = { closes: 0, launches: [], dispatched: 0 };
  const testOnlyLaunch = Object.freeze({ helper: "/synthetic/handoff/terminal-handoff.py", policy: "/synthetic/handoff/policy.json", mode: "terminal" });
  const terminal = { async launch(input) {
    record.launches.push(input);
    if (gate) await gate.promise;
    if (input.signal?.aborted) return { version: 1, status: "unavailable", reason: "CANCELLED", may_have_launched: false };
    if (f.factoryCalls.at(-1).isActive() !== true) return { version: 1, status: "unavailable", reason: "INVALID_POLICY", may_have_launched: false };
    record.dispatched++;
    return launch ? launch(input) : HANDED_OFF;
  } };
  return { fixture: Object.freeze({ terminal, testOnlyLaunch, close: () => { record.closes++; } }), record };
}
const contentText = f => f.document.getElementById("axiosozo-handoff-content").textContent;

test("synthetic agent: an ordinary browser shows no test action and never asks the factory; Copy stays the default", async () => {
  const f = fixture();
  try {
    await f.press();
    assert.equal(f.fixtureButton(), null);
    assert.doesNotMatch(contentText(f), /synthetic/u);
    await f.copy();
    assert.deepEqual([f.copies.length, f.factoryCalls.length], [1, 0]);
  } finally { f.runtime.dispose(); }
  const g = fixture({ fixtureEnv: true });
  try {
    await g.press();
    const button = g.fixtureButton();
    assert.deepEqual([button.getAttribute("label"), button.getAttribute("accesskey"), button.getAttribute("aria-describedby")],
      ["Send to synthetic test agent", "S", "axiosozo-handoff-fixture-note"]);
    assert.match(g.document.getElementById("axiosozo-handoff-fixture-note").textContent, /synthetic test agent, not Claude Code or Codex/u);
    assert.equal(g.compose().mainAction.label, "Copy for agent", "Copy stays the doorhanger's default action");
    assert.equal(g.factoryCalls.length, 0, "showing the composer constructs nothing");
    await g.copy();
    assert.deepEqual([g.copies.length, g.factoryCalls.length], [1, 0], "Copy in a synthetic browser still only copies");
  } finally { g.runtime.dispose(); }
});

test("synthetic agent: one fresh trusted click asks the factory once; only its own adapter and configuration reach the core", async () => {
  const f = fixture({ fixtureEnv: true });
  try {
    const opened = deferred();
    const { fixture: owned, record } = fakeFixture(f);
    f.state.factory = async options => { await opened.promise; return owned; };
    await f.press();
    f.textarea().value = "Check the form";
    await f.sendToFixture(false);
    assert.equal(f.factoryCalls.length, 0, "a synthetic event requests nothing");
    await f.sendToFixture();
    assert.equal(f.factoryCalls.length, 1);
    const [options] = f.factoryCalls;
    assert.deepEqual(Object.keys(options).sort(), ["isActive", "signal"], "no runtime, path or page value");
    assert.equal(options.isActive(), true, "literally true while this session sends on its unchanged tab");
    // Pending: visible, accurate, duplicates blocked.
    assert.equal(f.fixtureButton().getAttribute("label"), "Sending to synthetic test agent…");
    assert.equal(f.fixtureButton().getAttribute("aria-disabled"), "true");
    assert.equal(f.template().hasAttribute("mainactiondisabled"), true, "Copy is blocked while it is pending");
    await f.sendToFixture();
    f.compose().mainAction.callback({ event: { isTrusted: true } });
    await flush();
    assert.deepEqual([f.factoryCalls.length, f.copies.length], [1, 0]);
    opened.resolve();
    await flush();
    assert.equal(record.launches.length, 1);
    const [launch] = record.launches;
    assert.equal(launch.configuration, owned.testOnlyLaunch, "exactly the factory's frozen configuration");
    assert.deepEqual([launch.agent, launch.test_only, launch.signal === options.signal], ["codex", true, true]);
    assert.deepEqual([launch.context.project, launch.context.page.url, launch.context.task], [PROJECT, "http://localhost:5173/settings", "Check the form"]);
    assert.deepEqual([launch.context.page.screen, launch.context.console_errors], [null, []], "screens and console stay off");
    assert.equal(record.dispatched, 1);
    assert.deepEqual([f.copies.length, record.closes], [0, 1], "never copied; the fixture closed after its answer");
    assert.equal(f.result().message, "The synthetic test agent received this page in Terminal. It may still be working there.");
    assert.deepEqual(f.targets, [{ project_id: "p_harbor1", tab_id: "t_5", navigation_id: "w11.n0", user_context_id: 0 }]);
    const counts = f.runtime.diagnostics();
    assert.deepEqual([counts.handed_off, counts.copied, counts.fixture_requests], [1, 0, 1], "a hand-off is not counted as a copy");
    assert.equal(f.compose(), null);
    assert.equal(f.template().hasAttribute("mainactiondisabled"), false);
  } finally { f.runtime.dispose(); }
});

test("synthetic agent: absent or invalid admission is said as unavailable; nothing launches, copies or falls back", async () => {
  for (const factory of [async () => null, async () => { throw Object.assign(new Error("TERMINAL_FIXTURE_UNAVAILABLE"), { code: "TERMINAL_FIXTURE_UNAVAILABLE" }); },
    async () => ({ terminal: { launch: () => HANDED_OFF }, testOnlyLaunch: {}, close() {} }) /* not the factory's frozen object */]) {
    const f = fixture({ fixtureEnv: true });
    try {
      f.state.factory = factory;
      await f.press();
      await f.sendToFixture();
      assert.deepEqual([f.factoryCalls.length, f.copies.length, f.targets.length], [1, 0, 0]);
      assert.equal(f.result().message, "The synthetic test agent is not available here. Nothing was sent.");
      assert.equal(f.runtime.diagnostics().fixture_unavailable, 1);
    } finally { f.runtime.dispose(); }
  }
});

test("synthetic agent: a navigation, swap without an event, frameLoader or project change during the factory await closes it unused", async () => {
  const changes = [["navigation", f => f.navigate(true), /was cancelled/u],
    ["selected tab", f => { f.window.gBrowser.selectedTab = f.otherTab; }, /page changed/u],
    ["selected browser", f => f.setSelectedBrowser(f.otherTab.linkedBrowser), /page changed/u],
    ["frameLoader", f => { f.browser.frameLoader = {}; }, /page changed/u],
    ["project", f => { f.state.failCheckAt = f.state.authorityChecks + 1; }, /projects were changing/u]];
  for (const [name, change, said] of changes) {
    const f = fixture({ fixtureEnv: true });
    try {
      const opened = deferred();
      const { fixture: owned, record } = fakeFixture(f);
      f.state.factory = async () => { await opened.promise; return owned; };
      await f.press();
      await f.sendToFixture();
      change(f);
      assert.equal(f.factoryCalls[0].isActive(), false, `${name}: inactive before any dispatch`);
      opened.resolve();
      await flush();
      assert.deepEqual([record.launches.length, record.dispatched, record.closes, f.copies.length], [0, 0, 1, 0], name);
      const shown = f.popups.shown.filter(item => item.id === HANDOFF_RESULT_NOTIFICATION).at(-1);
      assert.match(shown.message, said, name);
    } finally { f.runtime.dispose(); }
  }
});

test("synthetic agent: the same changes while the native dispatch awaits make isActive false before dispatch", async () => {
  for (const change of [f => { f.window.gBrowser.selectedTab = f.otherTab; }, f => f.setSelectedBrowser({ ...f.browser }),
    f => { f.browser.frameLoader = {}; }, f => { f.state.failCheckAt = f.state.authorityChecks + 1; }, f => f.navigate()]) {
    const f = fixture({ fixtureEnv: true });
    try {
      const dispatching = deferred();
      const { fixture: owned, record } = fakeFixture(f, { gate: dispatching });
      f.state.factory = async () => owned;
      await f.press();
      await f.sendToFixture();
      assert.equal(record.launches.length, 1, "the launch is waiting at its dispatch");
      change(f);
      dispatching.resolve();
      await flush();
      assert.deepEqual([record.dispatched, record.closes, f.copies.length, f.targets.length], [0, 1, 0, 0]);
    } finally { f.runtime.dispose(); }
  }
});

test("synthetic agent: Cancel, dismissal, tab close and teardown close the fixture; a late factory answer is closed unused", async () => {
  const late = fixture({ fixtureEnv: true });
  try {
    const opened = deferred();
    const { fixture: owned, record } = fakeFixture(late);
    late.state.factory = async () => { await opened.promise; return owned; };
    await late.press();
    await late.sendToFixture();
    const signal = late.factoryCalls[0].signal;
    late.popups.cancel(late.compose());
    await flush();
    assert.equal(signal.aborted, true);
    assert.equal(late.browser.focused > 0, true, "an ordinary cancel returns focus to the page");
    opened.resolve();
    await flush();
    assert.deepEqual([record.launches.length, record.closes, late.copies.length], [0, 1, 0]);
    assert.equal(late.result().message, "Sending to the synthetic test agent was cancelled. Nothing was sent.");
  } finally { late.runtime.dispose(); }
  for (const stop of [f => f.popups.remove(f.compose()), f => f.tabContainer.dispatchEvent(makeEvent("TabClose", { target: f.tab })),
    f => f.runtime.dispose()]) {
    const f = fixture({ fixtureEnv: true });
    try {
      const dispatching = deferred();
      const { fixture: owned, record } = fakeFixture(f, { gate: dispatching });
      f.state.factory = async () => owned;
      await f.press();
      await f.sendToFixture();
      stop(f);
      assert.equal(record.closes, 1, "closed at once");
      dispatching.resolve();
      await flush();
      assert.deepEqual([record.dispatched, f.copies.length, f.targets.length], [0, 0, 0]);
    } finally { f.runtime.dispose(); }
  }
});

test("synthetic agent: an uncertain launch is said as uncertain and never copied; unavailable and cancelled stay distinct", async () => {
  const outcomes = [[{ version: 1, status: "failed" }, /not certain whether the synthetic test agent started/u, "launch_uncertain"],
    [{ version: 1, status: "unavailable", reason: "SPAWN_FAILED", may_have_launched: false }, /not available here\. Nothing was sent\./u, "fixture_unavailable"],
    [{ version: 1, status: "unavailable", reason: "CANCELLED", may_have_launched: false }, /was cancelled\. Nothing was sent\./u, "cancelled"]];
  for (const [answer, said, counter] of outcomes) {
    const f = fixture({ fixtureEnv: true });
    try {
      const { fixture: owned, record } = fakeFixture(f, { launch: () => answer });
      f.state.factory = async () => owned;
      await f.press();
      await f.sendToFixture();
      assert.deepEqual([record.dispatched, record.closes, f.copies.length, f.targets.length], [1, 1, 0, 0]);
      assert.match(f.result().message, said);
      assert.doesNotMatch(f.result().message, /\/|helper|stderr|Error/u, "no path, output or exception text");
      assert.equal(f.runtime.diagnostics()[counter], 1);
    } finally { f.runtime.dispose(); }
  }
});

test("synthetic agent: early clicks, a background window and an unprojected page request nothing", async () => {
  const f = fixture({ fixtureEnv: true, securityDelayMs: 500 });
  try {
    f.state.factory = async () => fakeFixture(f).fixture;
    f.state.elapsed = 1000;
    await f.press();
    f.state.elapsed = 1300;
    await f.sendToFixture();
    assert.equal(f.factoryCalls.length, 0, "inside the doorhanger's click delay");
    f.state.elapsed = 1600;
    f.state.windowActive = false;
    await f.sendToFixture();
    assert.equal(f.factoryCalls.length, 0, "not in the active window");
    f.state.windowActive = true;
    await f.sendToFixture();
    assert.equal(f.factoryCalls.length, 1);
  } finally { f.runtime.dispose(); }
  const loose = fixture({ fixtureEnv: true, authority: null });
  try {
    await loose.press();
    assert.equal(loose.fixtureButton().disabled, true);
    assert.match(loose.document.getElementById("axiosozo-handoff-fixture-note").textContent, /only takes pages of an AxioSozo project/u);
    await loose.sendToFixture();
    assert.equal(loose.factoryCalls.length, 0);
    await loose.copy();
    assert.equal(loose.copies.length, 1, "Copy for agent still works on an unprojected page");
  } finally { loose.runtime.dispose(); }
});

test("synthetic agent with the actual root factory and terminal adapter: the session's isActive guards the real dispatch", async () => {
  // Only the native seam is a fake: in-memory metadata, digests and children; no process starts.
  const { createNativeTerminalHandoffFixture, terminalHandoffFixturePaths, TERMINAL_HANDOFF_SHA256, TERMINAL_HANDOFF_FAKE_SHA256 }
    = await import("../chrome/TerminalHandoffConfig.sys.mjs");
  const identity = "e".repeat(32), policy = "d".repeat(64);
  const root = `/Volumes/AxioSozoBuild/workstation/handoff-terminal/config-${identity}`;
  const profile = `/Volumes/AxioSozoBuild/workstation/runtime/1234567890abcdef/plan4-handoff-${identity}/gecko`;
  const paths = terminalHandoffFixturePaths(root, profile);
  const receipt = { version: 1, status: "verified", policy_sha256: policy, fixture_sha256: TERMINAL_HANDOFF_FAKE_SHA256 };
  const nativeFake = ({ spawnGate = null, onSpawn = null } = {}) => {
    const record = { spawns: [], writes: 0, kills: 0 };
    const native = { env: name => ({ AXIOSOZO_SYNTHETIC_TEST: "1", AXIOSOZO_HANDOFF_GUI_FIXTURE: "1", AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT: root })[name],
      profilePath: () => profile, timers: { setTimeout, clearTimeout }, verifyFile: async () => true,
      sha256: async path => (path === paths.helper ? TERMINAL_HANDOFF_SHA256 : path === paths.fixture ? TERMINAL_HANDOFF_FAKE_SHA256 : policy),
      verifyPolicy: async control => { assert.equal(control.isActive(), true); return { ...receipt }; },
      spawn: async options => {
        record.spawns.push(options.arguments[4]);
        onSpawn?.();
        if (spawnGate) await spawnGate.promise;
        let read = false;
        return { stdin: { write: async () => { record.writes++; }, close: async () => {} },
          stdout: { read: async () => { if (read) return new ArrayBuffer(0); read = true;
            return new TextEncoder().encode(JSON.stringify({ version: 1, status: "handed_off", agent: "fake", may_have_launched: true, launch_id: "a".repeat(32) })).buffer; } },
          stderr: { read: async () => new ArrayBuffer(0) }, wait: async () => ({ exitCode: 0 }), kill: async () => { record.kills++; } };
      } };
    return { native, record };
  };
  const run = async (native, change = null) => {
    const f = fixture({ fixtureEnv: true, authority: { id: "p_harbor1", root: `${paths.projectsRoot}/harbor-suite` } });
    f.state.factory = options => createNativeTerminalHandoffFixture({ runtime: native, ...options });
    try {
      await f.press();
      await f.sendToFixture();
      change?.(f);
      for (let i = 0; i < 20; i++) { await new Promise(resolve => setImmediate(resolve)); }
      // The outcome is said on whichever browser is selected now.
      return { copies: f.copies, targets: f.targets,
        message: f.popups.shown.filter(item => item.id === HANDOFF_RESULT_NOTIFICATION).at(-1)?.message ?? null };
    } finally { f.runtime.dispose(); }
  };
  const clean = nativeFake();
  const delivered = await run(clean.native);
  assert.deepEqual([clean.record.spawns, clean.record.writes, delivered.copies.length], [["--gui-policy"], 1, 0]);
  assert.equal(delivered.message, "The synthetic test agent received this page in Terminal. It may still be working there.");
  assert.equal(delivered.targets.length, 1);
  const gate = deferred();
  const swapped = nativeFake({ spawnGate: gate });
  const refused = await run(swapped.native, f => { f.setSelectedBrowser(f.otherTab.linkedBrowser); gate.resolve(); });
  assert.deepEqual([swapped.record.spawns.length, swapped.record.writes, refused.copies.length, refused.targets.length], [1, 0, 0, 0],
    "the late child is never given the context once the selection changed without any event");
  assert.equal(swapped.record.kills > 0, true, "the root fixture killed its own late child");
  assert.equal(refused.message, "The page changed before it was sent. Nothing was sent.");
});

test("synthetic agent: refused before anything for private, stale or password pages; the copy guards are unchanged", async () => {
  const hidden = fixture({ fixtureEnv: true, privateWindow: true });
  assert.equal(hidden.key(), null, "a private window offers nothing at all");
  hidden.runtime.dispose();
  const password = fixture({ fixtureEnv: true, inputs: [{ localName: "input", namespaceURI: XHTML, hasBeenTypePassword: true }] });
  try {
    await password.press();
    assert.deepEqual([password.compose(), password.fixtureButton()?.isConnected ?? null, password.factoryCalls.length], [null, null, 0]);
  } finally { password.runtime.dispose(); }
  const stale = fixture({ fixtureEnv: true });
  try {
    await stale.press();
    stale.browser.frameLoader = {};
    await stale.sendToFixture();
    assert.equal(stale.factoryCalls.length, 0, "a click on a composer whose tab changed requests nothing");
  } finally { stale.runtime.dispose(); }
});

// ---------------------------------------------------------------- superseded requests never replace newer feedback

const CANCELLED_TEXT = "Sending to the synthetic test agent was cancelled. Nothing was sent.";
const UNCERTAIN_TEXT = "It is not certain whether the synthetic test agent started. Check Terminal before you try again. Nothing was copied.";
const resultsSaid = f => f.popups.shown.filter(item => item.id === HANDOFF_RESULT_NOTIFICATION).map(item => item.message);

test("superseded: a cancelled old factory answering after a newer copy or hand-off never replaces that newer result", async () => {
  for (const newer of ["copy", "fixture"]) {
    const f = fixture({ fixtureEnv: true });
    try {
      const opened = deferred();
      const old = fakeFixture(f);
      f.state.factory = async () => { await opened.promise; return old.fixture; };
      await f.press();
      await f.sendToFixture();
      f.popups.cancel(f.compose()); // the old request is cancelled, its factory still pending
      await flush();
      const fresh = fakeFixture(f);
      f.state.factory = async () => fresh.fixture;
      await f.press();
      if (newer === "copy") await f.copy(); else await f.sendToFixture();
      const kept = f.result();
      const said = newer === "copy" ? /^Copied for your agent\./u : /^The synthetic test agent received this page in Terminal\./u;
      assert.match(kept.message, said);
      const before = f.runtime.diagnostics();
      opened.resolve(); // the old factory answers only now
      await flush();
      assert.equal(kept.removed, false, `${newer}: the newer result is not cleared`);
      assert.equal(f.result(), kept);
      assert.equal(resultsSaid(f).includes(CANCELLED_TEXT), false, "the old cancellation is never shown");
      assert.deepEqual([old.record.launches.length, old.record.closes], [0, 1], "the old fixture is closed exactly once, unused");
      assert.equal(f.runtime.diagnostics().superseded, before.superseded + 1, "still counted, only not shown");
    } finally { f.runtime.dispose(); }
  }
});

test("superseded: an old uncertain launch settling while a new composer is open leaves it alone, then is said once nothing newer shows", async () => {
  const f = fixture({ fixtureEnv: true });
  try {
    const dispatching = deferred();
    const old = { closes: 0, launches: 0 };
    const uncertain = Object.freeze({ testOnlyLaunch: Object.freeze({ helper: "/synthetic/h.py", policy: "/synthetic/p.json", mode: "terminal" }),
      close: () => { old.closes++; },
      terminal: { async launch() { old.launches++; await dispatching.promise; return { version: 1, status: "failed" }; } } });
    f.state.factory = async () => uncertain;
    await f.press();
    await f.sendToFixture();
    assert.equal(old.launches, 1, "the old request is in its launch");
    await f.press(); // a new composer: the old session ends, its launch is still settling
    const composer = f.compose();
    f.textarea().value = "newer task";
    f.textarea().focus();
    const focusBefore = f.browser.focused;
    dispatching.resolve();
    await flush();
    assert.equal(composer.removed, false, "the newer composer stays open");
    assert.equal(f.textarea().value, "newer task");
    assert.equal(f.document.activeElement, f.textarea(), "focus stays in the newer composer");
    assert.equal(f.browser.focused, focusBefore, "the page is not focused from under it");
    assert.equal(f.result(), null, "nothing is said over the newer composer");
    assert.equal(f.runtime.diagnostics().launch_uncertain, 1);
    assert.equal(old.closes, 1);
    // The newer session ends without a line of its own: the uncertainty is said now, once.
    f.popups.cancel(composer);
    await flush();
    assert.equal(f.result().message, UNCERTAIN_TEXT);
    assert.equal(resultsSaid(f).filter(text => text === UNCERTAIN_TEXT).length, 1);
  } finally { f.runtime.dispose(); }
});

test("superseded: an old uncertain launch waits behind a newer result and never clears it", async () => {
  const f = fixture({ fixtureEnv: true });
  try {
    const dispatching = deferred();
    const uncertain = Object.freeze({ testOnlyLaunch: Object.freeze({ helper: "/synthetic/h.py", policy: "/synthetic/p.json", mode: "terminal" }),
      close() {}, terminal: { async launch() { await dispatching.promise; return { version: 1, status: "failed" }; } } });
    f.state.factory = async () => uncertain;
    await f.press();
    await f.sendToFixture();
    await f.press();
    await f.copy();
    const copied = f.result();
    dispatching.resolve();
    await flush();
    assert.equal(copied.removed, false, "the newer copy result stays");
    assert.equal(resultsSaid(f).includes(UNCERTAIN_TEXT), false);
    f.popups.remove(copied); // dismissed, or its own timeout
    await flush();
    assert.equal(f.result().message, UNCERTAIN_TEXT, "said once nothing newer is on screen");
  } finally { f.runtime.dispose(); }
});

test("current session: a late cancellation and a late uncertainty are still said for the newest request", async () => {
  const f = fixture({ fixtureEnv: true });
  try {
    const dispatching = deferred();
    const uncertain = Object.freeze({ testOnlyLaunch: Object.freeze({ helper: "/synthetic/h.py", policy: "/synthetic/p.json", mode: "terminal" }),
      close() {}, terminal: { async launch() { await dispatching.promise; return { version: 1, status: "failed" }; } } });
    f.state.factory = async () => uncertain;
    await f.press();
    await f.sendToFixture();
    f.popups.cancel(f.compose()); // cancelled after its launch began: no newer session exists
    await flush();
    dispatching.resolve();
    await flush();
    assert.equal(f.result().message, UNCERTAIN_TEXT);
    assert.equal(f.runtime.diagnostics().superseded, 0);
  } finally { f.runtime.dispose(); }
});

// ---- Plan 4 step 7: console errors in the composer -------------------------------------
// A stand-in console owner over the real shared navigation counter: its RAM
// records per exact tab/document, its native project authority and the
// composer registration. The real owner is covered by console-errors-native.
function nativeOwnerFake() {
  const calls = { readHandoff: [], ownerForTab: 0, composers: [], unregistered: 0 };
  const state = { authority: true, records: [], throws: null };
  const authority = Object.freeze({ id: PROJECT.id, root: PROJECT.root, revision: 7, check: () => state.authority });
  const owner = {
    service: { readHandoff(args) {
      calls.readHandoff.push(args);
      if (state.throws) throw Object.assign(new Error(state.throws), { code: state.throws });
      return { tab_id: "t_44", document_id: args.document_id, navigation_id: args.navigation_id, url: args.url, console_errors: state.records };
    } },
    ownerForTab: (window, tab) => { calls.ownerForTab++; return { window, tab_id: "t_44", tab }; },
    registry: { withTrusted: (_id, callback) => callback({ tab: state.tab, window: state.window, descriptor: { project_id: PROJECT.id } }) },
    onNativeNavigation: (window, callback) => watchNativeNavigation(window, callback),
    registerHandoffComposer: (_window, value) => { calls.composers.push(value); return () => { calls.unregistered++; }; },
  };
  return { owner, calls, state, capture: () => authority };
}
const consoleBox = f => f.document.getElementById("axiosozo-handoff-console");

test("with the console owner: console errors are offered unticked; unticked copies none and reads none", async () => {
  const native = nativeOwnerFake();
  const f = fixture({ native });
  try {
    native.state.records = [{ level: "error", text: "Should not leave", source: "", line: 1, at: 5 }];
    await f.press();
    assert.deepEqual([consoleBox(f).checked, consoleBox(f).disabled, consoleBox(f).getAttribute("label")],
      [false, false, "Include this tab's console errors"]);
    assert.match(f.document.getElementById("axiosozo-handoff-content").textContent,
      /Screenshots and opening Claude Code or Codex directly are not in this build yet\./u);
    await f.copy();
    assert.deepEqual(JSON.parse(f.copies[0]).console_errors, []);
    assert.deepEqual([native.calls.readHandoff.length, native.calls.ownerForTab], [0, 0], "nothing of the console is read");
    assert.equal(native.calls.composers.length, 1, "the console entry is registered with the owner");
  } finally { f.runtime.dispose(); }
  assert.equal(native.calls.unregistered, 1, "and removed with the runtime");
});

test("ticked at the trusted Copy: the owner's records of exactly this tab and document, sanitized and bounded, under both authorities", async () => {
  const native = nativeOwnerFake();
  const f = fixture({ native });
  try {
    native.state.records = [
      { level: "error", text: "TypeError:\u0000 broken \uD800 surrogate", source: "http://localhost:5173/app.js", line: 12, at: 1000 },
      { level: "warning", text: "Deprecated", source: "", line: null, at: 1001 },
      { level: "info", text: "dropped", source: "", line: 1, at: 1002 },
      ...Array.from({ length: 60 }, (_, i) => ({ level: "error", text: `e${i}`, source: "", line: 1, at: 2000 + i }))];
    await f.press();
    consoleBox(f).checked = true;
    await f.copy();
    assert.equal(f.copies.length, 1);
    const [args] = native.calls.readHandoff;
    assert.deepEqual({ ...args, window: args.window === f.window, tab: args.tab === f.tab, windowGlobal: args.windowGlobal === f.global },
      { window: true, tab: true, windowGlobal: true, url: "http://localhost:5173/settings?token=secret#tab", document_id: "11",
        navigation_id: "w11.n0", project_id: PROJECT.id, project_root: PROJECT.root, project_revision: 7 });
    const errors = JSON.parse(f.copies[0]).console_errors;
    assert.equal(errors.length, 49, "at most 50 records of one tab; invalid ones dropped");
    assert.deepEqual(errors.slice(0, 2), [
      { level: "error", text: "TypeError: broken � surrogate", source: "http://localhost:5173/app.js", line: 12, at: 1000 },
      { level: "warning", text: "Deprecated", source: null, line: null, at: 1001 }]);
    assert.equal(f.runtime.diagnostics().console_included, 1);
  } finally { f.runtime.dispose(); }
});

for (const [label, change, text] of [
  ["the native console authority changes", native => { native.state.authority = false; }, /projects were changing/u],
  ["the owner refuses the read", native => { native.state.throws = "STALE_TAB"; }, /did not work|changed/u],
]) {
  test(`ticked console errors: nothing is copied when ${label}`, async () => {
    const native = nativeOwnerFake();
    const f = fixture({ native });
    try {
      await f.press();
      consoleBox(f).checked = true;
      change(native);
      await f.copy();
      assert.deepEqual(f.copies, []);
      assert.match(f.result().message, text);
    } finally { f.runtime.dispose(); }
  });
}

test("with the console owner, a page of no project cannot tick console errors, and a navigation still ends the session", async () => {
  const native = nativeOwnerFake();
  const f = fixture({ native, authority: null });
  try {
    await f.press();
    assert.deepEqual([consoleBox(f).checked, consoleBox(f).disabled], [false, true]);
    assert.match(consoleBox(f).getAttribute("label"), /pages of an AxioSozo project only/u);
    f.navigate(true);
    await flush();
    assert.equal(f.compose(), null, "the shared counter moved; the session ended");
    assert.equal(currentNavigationId(f.window, f.browser), "w11.n1");
  } finally { f.runtime.dispose(); }
});
