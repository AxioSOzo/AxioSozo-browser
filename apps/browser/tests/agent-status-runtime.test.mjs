/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 4: the agent presenter of one synthetic normal window. The
// window notification box, tabs, services and the handoff runtime's
// navigation tracker are in-memory fakes or the actual modules over fakes.
// Not evidence of Gecko notification rendering, focus or VoiceOver.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { Document } from "./support/mini-dom.mjs";

const { installAgentStatus, approvalMessage, statusMessage, APPROVAL_NOTIFICATION, STATUS_NOTIFICATION } = await import("../chrome/AgentStatusRuntime.sys.mjs");
const { installAgentHandoff, currentNavigationId } = await import("../chrome/AgentHandoffRuntime.sys.mjs");

const flush = async (rounds = 60) => { for (let i = 0; i < rounds; i++) await Promise.resolve(); };
const PAGE = "http://localhost:5173/settings";

function fakeBox() {
  const notifications = [];
  return {
    PRIORITY_INFO_LOW: 1, PRIORITY_INFO_HIGH: 3, notifications,
    async appendNotification(type, spec, buttons) {
      const notification = { type, label: spec.label, priority: spec.priority, buttons, eventCallback: spec.eventCallback, removed: false };
      notifications.push(notification);
      return notification;
    },
    removeNotification(notification) {
      if (!notification || notification.removed) return;
      notification.removed = true;
      notification.eventCallback?.("removed");
    },
    click(notification, index, isTrusted = true) {
      const keep = notification.buttons[index].callback(notification, notification.buttons[index], {}, { isTrusted });
      if (!keep) this.removeNotification(notification);
    },
    dismiss(notification) { notification.eventCallback?.("dismissed"); this.removeNotification(notification); },
    live(type) { return notifications.filter(item => item.type === type && !item.removed); },
  };
}

function fixture({ privateWindow = false, engine = undefined } = {}) {
  const document = new Document();
  document.createXULElement = tag => document.createElement(tag);
  const listeners = new Map();
  const box = fakeBox();
  const window = { document, closed: false, gNotificationBox: box,
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) };
  const principal = { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true, privateBrowsingId: 0, userContextId: 7,
    origin: "http://localhost:5173^userContextId=7" };
  const global = { isClosed: false, isCurrentGlobal: true, innerWindowId: 21, documentPrincipal: principal, documentURI: { spec: PAGE } };
  const context = { usePrivateBrowsing: false, parent: null, currentWindowGlobal: global, originAttributes: { userContextId: 7 } };
  context.top = context;
  const browser = { browserId: 9, permanentKey: {}, frameLoader: {}, browsingContext: context, currentURI: { spec: PAGE }, reloads: 0,
    reload() { this.reloads++; } };
  // Native nodes name their window through Node.documentGlobal (Node.webidl); there is no ownerGlobal.
  const tab = { documentGlobal: window, closing: false, isConnected: true, linkedBrowser: browser };
  const front = { documentGlobal: window, closing: false, isConnected: true, linkedBrowser: { browserId: 3, permanentKey: {}, frameLoader: {} } };
  const progress = [];
  const state = { normal: true, target: null, project: { id: "p_harbor1", root: "/Volumes/Synthetic/harbor-suite" }, checks: true,
    engine: "gecko", veto: false, shownBrowser: null, duringLookup: null };
  // Like Tabbrowser: Zen may veto a selection; the selected browser is the tabbrowser's own.
  let selectedTab = front;
  window.gBrowser = { get selectedTab() { return selectedTab; }, set selectedTab(value) { if (!state.veto) selectedTab = value; },
    get selectedBrowser() { return state.shownBrowser ?? selectedTab.linkedBrowser; },
    tabs: [front, tab], tabContainer: document.createElement("tabs"),
    getTabForBrowser: () => null, addTabsProgressListener: listener => progress.push(listener), removeTabsProgressListener: () => {} };
  const calls = [];
  let presenter = null, unregistered = 0;
  const services = {
    isNormalWindow: candidate => candidate === window && state.normal,
    registerAgentPresenter: (candidate, value) => {
      calls.push(["register", candidate === window]);
      presenter = value;
      return () => { unregistered++; presenter = null; };
    },
    activateAgentPresenter: candidate => { calls.push(["activate", candidate === window]); return true; },
    agentReturnTarget: projectId => { calls.push(["target", projectId]); return state.target; },
    captureHandoffAuthority: async args => {
      calls.push(["authority", args.url, args.userContextId]);
      state.duringLookup?.();
      return { project: state.project, check: () => state.checks };
    },
    rememberAgentReturnTarget: () => true,
  };
  const adapter = { isPrivateWindow: () => privateWindow, workspaceForTab: () => null };
  const opened = [];
  const status = installAgentStatus(window, { services, adapter, openOverview: fragment => opened.push(fragment),
    engineOf: engine === undefined ? candidate => (candidate === tab ? state.engine : "gecko") : engine, timers: { setTimeout: () => 1, clearTimeout() {} } });
  // The handoff runtime of the same window keeps the navigation identity.
  const handoff = installAgentHandoff(window, { services, adapter, registerActor: () => true, timers: { setTimeout: () => 1, clearTimeout() {} } });
  return { window, box, tab, front, browser, global, state, calls, opened, status, handoff, listeners, progress,
    get presenter() { return presenter; }, get unregistered() { return unregistered; },
    dispose: () => { status.dispose(); handoff.dispose(); } };
}
const view = { agent: "claude-code", project_id: "p_harbor1", project_name: "Harbor Suite" };
const record = (state = "done", id = "as_0123456789abcdef") => ({ id, agent: "codex", state, title: "Agent finished", at: 1 });

test("only a normal window presents: it registers once, with its own functions, and becomes current when focused", async () => {
  const hidden = fixture({ privateWindow: true });
  assert.equal(hidden.presenter, null, "a private window never registers");
  hidden.dispose();
  const f = fixture();
  try {
    for (const name of ["isNormal", "requestApproval", "onStatus"]) assert.equal(Object.hasOwn(f.presenter, name), true, name);
    assert.equal(f.presenter.isNormal(), true);
    f.state.normal = false;
    assert.equal(f.presenter.isNormal(), false, "unknown or private now: not eligible");
    f.state.normal = true;
    const activations = f.calls.filter(([name]) => name === "activate").length;
    f.listeners.get("activate")();
    assert.equal(f.calls.filter(([name]) => name === "activate").length, activations + 1);
  } finally { f.dispose(); }
  assert.equal(f.unregistered, 1);
  assert.equal(f.listeners.has("activate"), false);
});

test("approval: one notification with Allow and Deny; only a trusted Allow grants", async () => {
  const f = fixture();
  try {
    const allowed = f.presenter.requestApproval(view, { signal: new AbortController().signal });
    await flush();
    const [notification] = f.box.live(APPROVAL_NOTIFICATION);
    assert.deepEqual([notification.label, notification.buttons.map(button => button.label)],
      ["Claude Code in Harbor Suite wants to use this browser.", ["Allow for this session", "Deny"]]);
    f.box.click(notification, 0);
    assert.equal(await allowed, true);
    assert.equal(notification.removed, true);
    for (const act of [n => f.box.click(n, 0, false), n => f.box.click(n, 1), n => f.box.dismiss(n)]) {
      const asked = f.presenter.requestApproval(view, { signal: new AbortController().signal });
      await flush();
      act(f.box.live(APPROVAL_NOTIFICATION).at(-1));
      assert.equal(await asked, false);
    }
    assert.equal(f.status.diagnostics().allowed, 1);
  } finally { f.dispose(); }
});

test("approval: abort (expiry, revocation, shutdown) removes the prompt and a late click cannot grant; teardown denies", async () => {
  const f = fixture();
  try {
    const controller = new AbortController();
    const asked = f.presenter.requestApproval(view, { signal: controller.signal });
    await flush();
    const notification = f.box.live(APPROVAL_NOTIFICATION)[0];
    controller.abort();
    assert.equal(await asked, false);
    assert.equal(notification.removed, true);
    notification.buttons[0].callback(notification, notification.buttons[0], {}, { isTrusted: true });
    assert.equal(f.status.diagnostics().allowed, 0);
    const pending = f.presenter.requestApproval(view, { signal: new AbortController().signal });
    await flush();
    f.status.dispose();
    assert.equal(await pending, false);
    assert.deepEqual(f.box.live(APPROVAL_NOTIFICATION), []);
    const aborted = new AbortController(); aborted.abort();
    assert.equal(await f.presenter?.requestApproval?.(view, { signal: aborted.signal }) ?? false, false);
  } finally { f.dispose(); }
});

test("status: started stays silent; needs you, done and failed show one calm line, replaced by the newer one", async () => {
  const f = fixture();
  try {
    f.presenter.onStatus({ project_id: "p_harbor1", project_name: "Harbor Suite", record: record("started") });
    await flush();
    assert.deepEqual(f.box.live(STATUS_NOTIFICATION), []);
    f.presenter.onStatus({ project_id: "p_harbor1", project_name: "Harbor <b>Suite</b>", record: record("needs_input", "as_1111111111111111") });
    await flush();
    const [first] = f.box.live(STATUS_NOTIFICATION);
    assert.deepEqual([first.label, first.priority, first.buttons.map(button => button.label)],
      ["Harbor <b>Suite</b>: Codex needs you.", f.box.PRIORITY_INFO_LOW, ["Go to project"]], "plain text, never markup");
    f.presenter.onStatus({ project_id: "p_harbor1", project_name: "Harbor Suite", record: record("needs_input", "as_1111111111111111") });
    f.presenter.onStatus({ project_id: "p_harbor1", project_name: "Harbor Suite", record: record("done", "as_2222222222222222") });
    await flush();
    assert.deepEqual(f.box.live(STATUS_NOTIFICATION).map(item => item.label), ["Harbor Suite: Codex is done."]);
    assert.equal(first.removed, true);
    assert.equal(statusMessage({ project_name: "X", record: { state: "failed", agent: "claude-code" } }), "X: Claude Code failed.");
    assert.equal(approvalMessage({ agent: "gpt", project_name: "\u0000" }), "An agent in a project wants to use this browser.");
  } finally { f.dispose(); }
});

test("Go to project reloads the remembered tab only while its document, navigation, container and project still match", async () => {
  const f = fixture();
  try {
    const go = async (isTrusted = true) => {
      f.presenter.onStatus({ project_id: "p_harbor1", project_name: "Harbor Suite", record: record("done", `as_${String(Math.random()).slice(2, 18).padEnd(16, "0")}`) });
      await flush();
      f.box.click(f.box.live(STATUS_NOTIFICATION).at(-1), 0, isTrusted);
      await flush();
    };
    const navigation = currentNavigationId(f.window, f.browser);
    assert.equal(navigation, "w21.n0");
    f.state.target = { project_id: "p_harbor1", tab_id: "t_9", navigation_id: navigation, user_context_id: 7 };
    await go(false);
    assert.deepEqual([f.browser.reloads, f.opened], [0, []], "an untrusted click does nothing");
    await go();
    assert.deepEqual([f.browser.reloads, f.window.gBrowser.selectedTab === f.tab, f.opened], [1, true, []]);
    // The page moved on (same-document navigation): the project home opens instead.
    f.progress[0].onLocationChange(f.browser, { isTopLevel: true }, null, null, 1);
    await go();
    assert.deepEqual([f.browser.reloads, f.opened], [1, ["#project=p_harbor1"]]);
    f.state.target = { ...f.state.target, navigation_id: currentNavigationId(f.window, f.browser) };
    f.state.project = { id: "p_other1", root: "/Volumes/Synthetic/other" };
    await go();
    assert.deepEqual([f.browser.reloads, f.opened.length], [1, 2], "another project now: home, no reload");
    f.state.project = { id: "p_harbor1", root: "/Volumes/Synthetic/harbor-suite" };
    f.state.target = { ...f.state.target, user_context_id: 8 };
    await go();
    assert.deepEqual([f.browser.reloads, f.opened.length], [1, 3], "another container: home");
    f.state.target = null;
    await go();
    assert.deepEqual([f.browser.reloads, f.opened.length], [1, 4], "no target: home");
  } finally { f.dispose(); }
});

let statusSerial = 0;
async function goOnce(f, isTrusted = true) {
  f.presenter.onStatus({ project_id: "p_harbor1", project_name: "Harbor Suite",
    record: record("done", `as_${(++statusSerial).toString(16).padStart(16, "0")}`) });
  await flush();
  f.box.click(f.box.live(STATUS_NOTIFICATION).at(-1), 0, isTrusted);
  await flush();
}
const remember = f => { f.state.target = { project_id: "p_harbor1", tab_id: "t_9", navigation_id: currentNavigationId(f.window, f.browser), user_context_id: 7 }; };

test("Go to project proves the tab's window through its native Node.documentGlobal; foreign, missing or ownerGlobal-only never reload", async () => {
  const valid = fixture();
  try {
    assert.ok(!("ownerGlobal" in valid.tab), "native-shaped tab: no ownerGlobal");
    remember(valid);
    await goOnce(valid);
    assert.deepEqual([valid.browser.reloads, valid.window.gBrowser.selectedTab === valid.tab, valid.opened], [1, true, []]);
  } finally { valid.dispose(); }
  for (const [label, change] of [
    ["a foreign window", f => { f.tab.documentGlobal = { gBrowser: f.window.gBrowser }; }],
    ["no document window", f => { delete f.tab.documentGlobal; }],
    ["the obsolete ownerGlobal only", f => { delete f.tab.documentGlobal; f.tab.ownerGlobal = f.window; }],
  ]) {
    const f = fixture();
    try {
      remember(f);
      change(f);
      await goOnce(f);
      assert.deepEqual([f.browser.reloads, f.window.gBrowser.selectedTab === f.front, f.opened], [0, true, ["#project=p_harbor1"]], label);
      assert.equal(f.calls.some(([name]) => name === "authority"), false, `${label}: nothing is looked up`);
    } finally { f.dispose(); }
  }
});

test("Go to project never selects or reloads a target that no longer shows Gecko, before or during the lookup", async () => {
  const f = fixture();
  try {
    remember(f);
    f.state.engine = "chromium"; // its hidden Gecko document is unchanged
    await goOnce(f);
    assert.deepEqual([f.browser.reloads, f.window.gBrowser.selectedTab === f.front, f.opened], [0, true, ["#project=p_harbor1"]]);
    assert.equal(f.calls.some(([name]) => name === "authority"), false, "nothing is looked up for a target that is not proven");
    f.state.engine = "gecko";
    f.state.duringLookup = () => { f.state.engine = "chromium"; };
    await goOnce(f);
    assert.deepEqual([f.browser.reloads, f.window.gBrowser.selectedTab === f.front, f.opened.length], [0, true, 2], "changed while awaited");
    f.state.duringLookup = () => { f.browser.frameLoader = {}; };
    f.state.engine = "gecko";
    await goOnce(f);
    assert.deepEqual([f.browser.reloads, f.opened.length], [0, 3], "another frameLoader is another document host");
  } finally { f.dispose(); }
  const unknown = fixture({ engine: null });
  try {
    remember(unknown);
    await goOnce(unknown);
    assert.deepEqual([unknown.browser.reloads, unknown.opened], [0, ["#project=p_harbor1"]], "without the engine seam nothing is proven");
  } finally { unknown.dispose(); }
});

test("a vetoed or different selection is never reloaded; the project home opens and the veto is counted", async () => {
  const f = fixture();
  try {
    remember(f);
    f.state.veto = true;
    await goOnce(f);
    assert.deepEqual([f.browser.reloads, f.window.gBrowser.selectedTab === f.front, f.opened], [0, true, ["#project=p_harbor1"]]);
    f.state.veto = false;
    f.state.shownBrowser = f.front.linkedBrowser; // selected, but the tabbrowser shows another browser
    await goOnce(f);
    assert.deepEqual([f.browser.reloads, f.opened.length], [0, 2]);
    assert.equal(f.status.diagnostics().vetoed, 2);
    f.state.shownBrowser = null;
    await goOnce(f);
    assert.deepEqual([f.browser.reloads, f.window.gBrowser.selectedTab === f.tab, f.opened.length], [1, true, 2], "proven: selected and reloaded once");
  } finally { f.dispose(); }
});
