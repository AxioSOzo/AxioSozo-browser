/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 8: the visible act confirmation (AgentActionRuntime), a
// Zen-native doorhanger on the target tab, against a fake PopupNotifications
// and manual timers. Proves inert text, Allow once only for a trusted click,
// Deny/Escape/dismissal/60 s/abort/teardown as denial, no late allowance and
// focus return. Every act capability stays a literal false in the product, so
// no doorhanger is ever shown there; this is not evidence of Gecko UI,
// keyboard handling in a real panel or VoiceOver.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";

const { installActionConfirmations, actionConfirmationMessage, actionPlace, agentDisplayName, ACTION_CONFIRM_MS, ACTION_NOTIFICATION } =
  await import("../chrome/AgentActionRuntime.sys.mjs");

const tick = () => new Promise(resolve => setImmediate(resolve));
function fixture() {
  let next = 0;
  const timers = new Map();
  const shown = [];
  const opener = { isConnected: true, focus() { window.document.activeElement = opener; } };
  const window = { document: { activeElement: opener }, PopupNotifications: {
    show(browser, id, message, anchor, main, secondary, options) {
      const notification = { browser, id, message, anchor, main, secondary, options, removed: false };
      shown.push(notification);
      window.document.activeElement = { isConnected: true, panel: true };
      options.eventCallback?.("shown");
      return notification;
    },
    remove(notification) { notification.removed = true; },
  } };
  const clock = { setTimeout(fn, ms) { const id = ++next; timers.set(id, { fn, ms }); return id; }, clearTimeout(id) { timers.delete(id); } };
  const confirmations = installActionConfirmations(window, { timers: clock });
  const browser = { name: "target" };
  const request = (method = "page.click", params = { tab_id: "t_1", selector: "#agent-click" }) => ({ agent: "claude-code", method, params,
    url: "http://localhost:4450/agent-tools?mode=clean#top" });
  return { window, shown, timers, opener, confirmations, browser, request,
    fire(ms) { for (const [id, entry] of [...timers]) if (entry.ms === ms) { timers.delete(id); entry.fn(); } } };
}

test("the doorhanger names the agent, the action and its target as inert text; host and path only", () => {
  assert.equal(actionConfirmationMessage({ method: "page.click", params: { selector: "#agent-click" }, url: "http://localhost:4450/agent-tools?mode=clean#x" }),
    "<> wants to click “#agent-click” on localhost:4450/agent-tools.");
  assert.equal(actionConfirmationMessage({ method: "page.type", params: { selector: "#agent-text", text: `line one\nline two <b>${"é".repeat(90)}` },
    url: "https://user:secret@localhost:4450/agent-tools?mode=type" }),
  `<> wants to type “line one line two <b>${"é".repeat(58)}…” into “#agent-text” on localhost:4450/agent-tools. What is there now is replaced.`);
  assert.equal(actionConfirmationMessage({ method: "tabs.navigate", params: { url: "http://localhost:4450/agent-tools?mode=navigated&token=abc" },
    url: "http://localhost:4450/agent-tools?mode=clean" }), "<> wants to open localhost:4450/agent-tools in this tab, leaving localhost:4450/agent-tools.");
  assert.equal(actionConfirmationMessage({ method: "tabs.open", params: { url: "http://localhost:4450/" } }), null, "open has no extra prompt");
  assert.equal(actionConfirmationMessage({ method: "page.click", params: { selector: "a\u{202e}b\u0000c" }, url: "x" }), "<> wants to click “a b c” on this page.");
  assert.equal(actionPlace("not a url"), "this page");
  assert.deepEqual(["claude-code", "codex", "other", "evil"].map(agentDisplayName), ["Claude Code", "Codex", "An agent", "An agent"]);
});

test("Allow once resolves literal true only for a trusted click; the notification is the target tab's doorhanger", async () => {
  const f = fixture();
  const controller = new AbortController();
  const answer = f.confirmations.present(f.request(), { signal: controller.signal, browser: f.browser });
  const [notification] = f.shown;
  assert.equal(notification.browser, f.browser);
  assert.equal(notification.id, ACTION_NOTIFICATION);
  assert.equal(notification.message, "<> wants to click “#agent-click” on localhost:4450/agent-tools.");
  assert.deepEqual([notification.main.label, notification.main.accessKey], ["Allow once", "A"]);
  assert.deepEqual(notification.secondary.map(action => [action.label, action.accessKey]), [["Deny", "D"]]);
  assert.deepEqual({ ...notification.options, eventCallback: undefined }, { name: "Claude Code", persistence: 0, removeOnDismissal: true,
    hideClose: true, autofocus: true, eventCallback: undefined });
  notification.main.callback({ event: { isTrusted: true } });
  assert.equal(await answer, true);
  assert.equal(notification.removed, true);
  assert.equal(f.window.document.activeElement, f.opener, "focus returns where it was");
  notification.secondary[0].callback();
  assert.equal(f.timers.size, 0, "its 60-second timer is gone");
});

test("Deny, an untrusted click, dismissal, Escape removal, 60 s, abort and teardown all deny; a late click cannot allow", async () => {
  const cases = [
    ["deny", (f, n) => n.secondary[0].callback()],
    ["untrusted click", (f, n) => n.main.callback({ event: { isTrusted: false } })],
    ["no event", (f, n) => n.main.callback()],
    ["dismissed", (f, n) => n.options.eventCallback("dismissed")],
    ["removed (Escape)", (f, n) => n.options.eventCallback("removed")],
    ["60 seconds", f => f.fire(ACTION_CONFIRM_MS)],
    ["abort", (f, n, controller) => controller.abort()],
    ["navigation of this browser", f => f.confirmations.cancelFor(f.browser)],
    ["every prompt", f => f.confirmations.cancelAll()],
    ["window teardown", f => f.confirmations.dispose()],
  ];
  for (const [name, settle] of cases) {
    const f = fixture();
    const controller = new AbortController();
    const answer = f.confirmations.present(f.request(), { signal: controller.signal, browser: f.browser });
    const [notification] = f.shown;
    settle(f, notification, controller);
    assert.equal(await answer, false, name);
    assert.equal(notification.removed, true, name);
    notification.main.callback({ event: { isTrusted: true } });
    await tick();
    assert.equal(await answer, false, `${name}: a late Allow changes nothing`);
    assert.equal(f.confirmations.pending, 0);
  }
});

test("other browsers keep their prompt; nothing is shown without a manager, a known method, a browser or a live signal", async () => {
  const f = fixture();
  const first = new AbortController(), second = new AbortController();
  const mine = f.confirmations.present(f.request(), { signal: first.signal, browser: f.browser });
  const other = f.confirmations.present(f.request(), { signal: second.signal, browser: { name: "other" } });
  f.confirmations.cancelFor(f.browser);
  assert.equal(await mine, false);
  assert.equal(f.confirmations.pending, 1);
  f.shown[1].main.callback({ event: { isTrusted: true } });
  assert.equal(await other, true);
  const aborted = new AbortController(); aborted.abort();
  assert.equal(await f.confirmations.present(f.request(), { signal: aborted.signal, browser: f.browser }), false);
  assert.equal(await f.confirmations.present(f.request("tabs.open", { url: "http://localhost:4450/" }), { signal: new AbortController().signal, browser: f.browser }), false);
  assert.equal(await f.confirmations.present(f.request(), { signal: new AbortController().signal }), false);
  assert.equal(f.shown.length, 2);
  const bare = installActionConfirmations({ document: {} }, { timers: { setTimeout: () => 1, clearTimeout() {} } });
  assert.equal(await bare.present(f.request(), { signal: new AbortController().signal, browser: f.browser }), false);
  f.confirmations.dispose();
  assert.equal(await f.confirmations.present(f.request(), { signal: new AbortController().signal, browser: f.browser }), false);
});

// ---------------------------------------------------------------- what an Allow once is bound to

const { createAgentActionRuntime, ACT_METHODS } = await import("../chrome/AgentActionRuntime.sys.mjs");
const { AgentTabRegistry } = await import("../chrome/AgentTabRegistry.sys.mjs");
const SESSION = "s_0000000000000001";
const settle = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await tick(); };

/** One normal window and tab over the actual registry; `epoch` models the
 * native project authority, which any invalidation moves for good. */
function runtimeFixture() {
  const w = { revision: 1, epoch: 1, route: 0 };
  const shown = [];
  const browser = { browserId: 1, permanentKey: {} };
  const context = { isContent: true, parent: null, usePrivateBrowsing: false, originAttributes: { privateBrowsingId: 0, userContextId: 0 }, embedderElement: browser };
  context.top = context;
  const global = { innerWindowId: 7, isCurrentGlobal: true, isClosed: false, documentURI: { spec: "http://localhost:4450/agent-tools" }, browsingContext: context,
    documentPrincipal: { isSystemPrincipal: false, isNullPrincipal: false, privateBrowsingId: 0, userContextId: 0 } };
  context.currentWindowGlobal = global;
  Object.assign(browser, { browsingContext: context, frameLoader: { ownerElement: browser, browsingContext: context }, currentURI: { spec: global.documentURI.spec } });
  const win = { closed: false, document: { activeElement: null },
    PopupNotifications: { show(target, id, message, anchor, main, secondary) { const n = { main, secondary }; shown.push(n); return n; }, remove() {} },
    gBrowser: { getTabForBrowser: value => (value === browser ? tab : null) } };
  const tab = { documentGlobal: win, closing: false, isConnected: true, linkedBrowser: browser };
  const registry = new AgentTabRegistry({
    isPrivateWindow: () => false, isWindowRegistered: value => value === win, isWindowClosed: value => value.closed,
    isTabLive: (value, window) => value.documentGlobal === window, getBrowser: value => value.linkedBrowser, isPrivateBrowser: () => false,
    getBrowserIdentity: value => ({ nativeBrowserId: 1, permanentKey: value.permanentKey, browsingContext: value.browsingContext,
      frameLoader: value.frameLoader, frameLoaderOwner: value, frameLoaderContext: value.browsingContext }),
    getContextState: value => ({ isContent: true, top: value, isDiscarded: false, private: false, privateBrowsingId: 0,
      userContextId: value.originAttributes.userContextId, embedder: value.embedderElement }),
    getCurrentDocument: value => value.currentWindowGlobal,
    getDocumentState: value => ({ browsingContext: value.browsingContext, isCurrentGlobal: true, isClosed: false, failedChannel: null, document_id: value.innerWindowId,
      principal: value.documentPrincipal, isSystemPrincipal: false, isNullPrincipal: false, privateBrowsingId: 0, userContextId: value.documentPrincipal.userContextId }),
    getDocumentURL: value => value.documentURI.spec, getTitle: () => "", getEngine: () => "gecko", isActiveTab: () => true,
    getRoute: () => ({ contextUuid: null, revision: w.route }), getProjectRevision: () => w.revision,
    matchProject: () => ({ project_id: "p_harbor1", ambiguous: false, revision: w.revision }), classifyHost: () => ({ sensitive: false }),
  });
  const id = registry.register(tab, win);
  const services = { isNormalWindow: value => value === win && !value.closed, readNativeProjectSnapshot: () => ({ revision: w.revision }),
    captureNativeProjectAuthority: ({ project_id }) => { const epoch = w.epoch; return { id: project_id, root: "/synthetic/harbor", revision: w.revision, check: () => w.epoch === epoch }; } };
  let deps = null;
  const runtime = createAgentActionRuntime({ registry, services, nativeOwner: null, isSessionActive: value => value === SESSION,
    timers: { setTimeout: () => 1, clearTimeout() {} }, allocationBudget: { claim() {}, quarantine: () => true },
    // A test-only stand-in for an enabled boundary: it records nothing and never dispatches.
    createBoundary: value => { deps = value; return Object.freeze({ isMethodAvailable: method => ACT_METHODS.includes(method), getCapabilities: () => ({}),
      getState: () => ({}), executeMethod: async () => ({}), releaseSession: async () => true, close: async () => true }); } });
  runtime.attachWindow(win);
  const view = Object.freeze({ session: SESSION, project_id: "p_harbor1", client: Object.freeze({ agent: "codex" }), state: "approved" });
  const params = Object.freeze({ tab_id: id, selector: "#agent-click" });
  async function allow(signal) {
    const issued = registry.metadata(id);
    const tabCopy = Object.freeze({ tab_id: id, url: issued.url, project_id: issued.project_id, engine: "gecko", document_id: issued.document_id });
    const answer = runtime.confirmAction(Object.freeze({ session: view, method: "page.click", params, tab: tabCopy }), { signal });
    await settle();
    shown.at(-1).main.callback({ event: { isTrusted: true } });
    return answer;
  }
  const consume = (signal, expected = registry.metadata(id)) => deps.consumeConfirmation({ method: "page.click", params, expected,
    session: { session: SESSION, project_id: "p_harbor1", state: "approved" } }, { signal });
  return { w, registry, id, tab, context, global, runtime, allow, consume };
}

test("an Allow once is bound to the issued binding and project authority it was shown for; drift with equal visible fields denies", async () => {
  for (const [name, drift] of [
    ["a new binding token", f => f.registry.invalidate(f.id)],
    ["a project revision", f => { f.w.revision++; }],
    ["a project authority epoch", f => { f.w.epoch++; }],
    ["a route revision", f => { f.w.route++; }],
    ["a container change and back", f => {
      f.context.originAttributes.userContextId = 5; f.global.documentPrincipal.userContextId = 5; f.registry.metadata(f.id);
      f.context.originAttributes.userContextId = 0; f.global.documentPrincipal.userContextId = 0;
    }],
  ]) {
    const f = runtimeFixture();
    const signal = new AbortController().signal;
    assert.equal(await f.allow(signal), true, name);
    const before = f.registry.metadata(f.id);
    drift(f);
    const after = f.registry.metadata(f.id);
    if (after) assert.deepEqual([after.url, after.document_id, after.project_id], [before.url, before.document_id, before.project_id], name);
    assert.equal(f.consume(signal, after ?? before), false, name);
    assert.equal(f.runtime.getState().receipts, 0, `${name}: the receipt is gone`);
  }
  const f = runtimeFixture();
  const signal = new AbortController().signal;
  assert.equal(await f.allow(signal), true);
  assert.equal(f.consume(signal), true, "the unchanged exact binding allows one dispatch");
  assert.equal(f.consume(signal), false, "and only one");
});
