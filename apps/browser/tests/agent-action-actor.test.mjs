/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 8: the AxioSozoAgentAction child, on injected native-shaped
// documents, elements, shadow roots and a fake WebDriver BiDi message-handler
// registry. Proves read-only admission, the exact one-use effect-time gate
// (original document, approved URL, password history, target and destination),
// lookup-only installation into the request's own sandbox realm, and revocation.
// Every act/open capability stays a literal false in the product; this is not
// evidence of Gecko's Xrays, Cu.exportFunction, BiDi realms or a real effect.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { ACT_BOUNDARY_SANDBOX } from "../chrome/AgentActBoundary.sys.mjs";
import { AgentActionChild, AGENT_ACTION_MESSAGES, ACTION_GATE_NAME, ACTION_SCOPE_LIMITS, actionDocumentFacts, createActionGate,
  passwordFree, safeActionTarget } from "../chrome/AgentActionChild.sys.mjs";

const { AgentActionParent } = await import("../chrome/AgentActionParent.sys.mjs");

const HTML_NS = "http://www.w3.org/1999/xhtml";
const URL_A = "http://localhost:4450/agent-tools?mode=type";
const TOKEN = n => `ag_${String(n).padStart(32, "0")}`;

class FakeNode {
  constructor(type) { this.nodeType = type; this.parent = null; this.kids = []; }
  get firstChild() { return this.kids[0] ?? null; }
  get nextSibling() { const siblings = this.parent?.kids; return siblings ? siblings[siblings.indexOf(this) + 1] ?? null : null; }
  append(...nodes) { for (const node of nodes) { node.parent = this; this.kids.push(node); } return this; }
}
function world() {
  const document = new FakeNode(9);
  Object.assign(document, { documentURI: URL_A, designMode: "off",
    nodePrincipal: { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true, privateBrowsingId: 0 } });
  const make = (name, props = {}) => {
    const node = new FakeNode(1);
    const attrs = new Map(Object.entries(props.attrs ?? {}));
    Object.assign(node, { localName: name, namespaceURI: HTML_NS, ownerDocument: document, isConnected: true, isContentEditable: false,
      openOrClosedShadowRoot: null, disabled: false, readOnly: false, ...props });
    node.hasAttribute = key => attrs.has(key);
    node.getAttribute = key => attrs.get(key) ?? null;
    node.getRootNode = () => { let current = node; while (current.parent) current = current.parent; return current; };
    node.closest = selector => { for (let current = node; current?.nodeType === 1; current = current.parent) if (current.localName === selector) return current; return null; };
    return node;
  };
  const body = make("body");
  const button = make("button");
  const text = make("input", { type: "text", hasBeenTypePassword: false });
  const area = make("textarea");
  body.append(button, text, area);
  document.append(make("html").append(body));
  const context = { usePrivateBrowsing: false, originAttributes: { privateBrowsingId: 0 }, parent: null, isContent: true, children: [] };
  context.top = context;
  const global = { isClosed: false, isCurrentGlobal: true, browsingContext: context };
  const window = { document, windowUtils: { isInModalState: () => false } };
  const scope = { document, window, browsingContext: context, windowGlobal: global };
  return { document, make, body, button, text, area, context, global, window, scope };
}

test("admission: normal, current, top-level, credential-free http(s) at exactly the approved URL", () => {
  const w = world();
  assert.ok(actionDocumentFacts(w.scope, URL_A));
  for (const [name, change, url = URL_A] of [
    ["another URL", () => {}, "http://localhost:4450/agent-tools?mode=clean"],
    ["a same-document route change", w2 => { w2.document.documentURI = `${URL_A}#later`; }],
    ["private", w2 => { w2.context.usePrivateBrowsing = true; }], ["private principal", w2 => { w2.document.nodePrincipal.privateBrowsingId = 1; }],
    ["not current", w2 => { w2.global.isCurrentGlobal = false; }], ["closed", w2 => { w2.global.isClosed = true; }],
    ["subframe", w2 => { w2.context.parent = {}; }], ["frames", w2 => { w2.context.children = [{}]; }],
    ["replaced document", w2 => { w2.window.document = {}; }], ["designMode", w2 => { w2.document.designMode = "on"; }],
    ["modal", w2 => { w2.window.windowUtils.isInModalState = () => true; }], ["system principal", w2 => { w2.document.nodePrincipal.isSystemPrincipal = true; }],
    ["credentials", w2 => { w2.document.documentURI = "http://a:b@localhost:4450/"; }, "http://a:b@localhost:4450/"],
    ["file", w2 => { w2.document.documentURI = "file:///x"; }, "file:///x"],
  ]) {
    const fresh = world();
    change(fresh);
    assert.equal(actionDocumentFacts(fresh.scope, url), null, name);
  }
});

test("password history: current and former password fields, unknown history, frames and closed roots refuse; values are never read", () => {
  const clean = world();
  Object.defineProperty(clean.text, "value", { get() { throw new Error("a field value was read"); } });
  assert.equal(passwordFree(clean.document), true);
  for (const [name, change] of [
    ["a password field", w => w.body.append(w.make("input", { type: "password", hasBeenTypePassword: true }))],
    ["a former password field", w => { w.text.hasBeenTypePassword = true; }],
    ["unknown history", w => { w.text.hasBeenTypePassword = undefined; }],
    ["an iframe", w => w.body.append(w.make("iframe"))],
    ["an object", w => w.body.append(w.make("object"))],
    ["a password in a closed root", w => {
      const host = w.make("div"), root = new FakeNode(11);
      root.isUAWidget = () => false; root.append(w.make("input", { type: "password", hasBeenTypePassword: true }));
      host.openOrClosedShadowRoot = root; w.body.append(host);
    }],
    ["a UA widget root", w => { const host = w.make("div"), root = new FakeNode(11); root.isUAWidget = () => true; host.openOrClosedShadowRoot = root; w.body.append(host); }],
    ["over the node limit", w => { for (let i = 0; i < ACTION_SCOPE_LIMITS.nodes; i++) w.body.append(new FakeNode(3)); }],
  ]) {
    const w = world();
    change(w);
    assert.equal(passwordFree(w.document), false, name);
  }
});

test("targets: plain light-DOM click targets and ordinary text fields only; never custom, customized, password, credential or disabled", () => {
  const w = world();
  assert.equal(safeActionTarget("page.click", w.button, w.document), true);
  assert.equal(safeActionTarget("page.type", w.text, w.document), true);
  assert.equal(safeActionTarget("page.type", w.area, w.document), true);
  assert.equal(safeActionTarget("tabs.navigate", null, w.document), true);
  assert.equal(safeActionTarget("tabs.navigate", w.button, w.document), false);
  const cases = [
    ["click a field", "page.click", w.text], ["type into a button", "page.type", w.button], ["no target", "page.click", null],
    ["custom element", "page.click", (() => { const node = w.make("agent-card"); w.body.append(node); return node; })()],
    ["customized built-in", "page.click", (() => { const node = w.make("button", { attrs: { is: "fancy-button" } }); w.body.append(node); return node; })()],
    ["inside a label", "page.click", (() => { const label = w.make("label"), node = w.make("span"); label.append(node); w.body.append(label); return node; })()],
    ["in a shadow root", "page.click", (() => { const root = new FakeNode(11), node = w.make("button"); root.append(node); return node; })()],
    ["another document", "page.click", Object.assign(w.make("button"), { ownerDocument: {} })],
    ["disconnected", "page.click", Object.assign(w.make("button"), { isConnected: false })],
    ["editable", "page.click", Object.assign(w.make("div"), { isContentEditable: true })],
    ["SVG", "page.click", Object.assign(w.make("a"), { namespaceURI: "http://www.w3.org/2000/svg" })],
    ["a password field", "page.type", w.make("input", { type: "password", hasBeenTypePassword: true })],
    ["a former password field", "page.type", w.make("input", { type: "text", hasBeenTypePassword: true })],
    ["a checkbox", "page.type", w.make("input", { type: "checkbox", hasBeenTypePassword: false })],
    ["a number field", "page.type", w.make("input", { type: "number", hasBeenTypePassword: false })],
    ["disabled", "page.type", w.make("input", { type: "text", hasBeenTypePassword: false, disabled: true })],
    ["read-only", "page.type", w.make("textarea", { readOnly: true })],
    ["credential hint", "page.type", w.make("input", { type: "text", hasBeenTypePassword: false, attrs: { autocomplete: "current-password" } })],
    ["one-time code", "page.type", w.make("input", { type: "text", hasBeenTypePassword: false, attrs: { autocomplete: "one-time-code" } })],
    ["unknown method", "page.submit", w.button],
  ];
  for (const [name, method, target] of cases) {
    if (target?.parent === null && target.localName && !["in a shadow root"].includes(name)) w.body.append(target);
    assert.equal(safeActionTarget(method, target, w.document), false, name);
  }
});

test("the gate is one attempt only, bound to its original document, URL, method and destination; revocation ends it", () => {
  const w = world();
  const gate = createActionGate({ read: () => w.scope, original: w.document, url: URL_A, method: "page.type" });
  assert.equal(gate.check(w.document, URL_A, w.text, "page.type"), true);
  assert.equal(gate.check(w.document, URL_A, w.text, "page.type"), false, "never twice");
  for (const [name, args] of [["another document", [{}, URL_A, w.text, "page.type"]], ["another URL", [w.document, `${URL_A}#x`, w.text, "page.type"]],
    ["another method", [w.document, URL_A, w.text, "page.click"]], ["an unsafe target", [w.document, URL_A, w.button, "page.type"]]]) {
    const one = createActionGate({ read: () => w.scope, original: w.document, url: URL_A, method: "page.type" });
    assert.equal(one.check(...args), false, name);
    assert.equal(one.check(w.document, URL_A, w.text, "page.type"), false, `${name}: a failed attempt consumes it`);
  }
  const replaced = createActionGate({ read: () => ({ ...w.scope, document: {} }), original: w.document, url: URL_A, method: "page.type" });
  assert.equal(replaced.check(w.document, URL_A, w.text, "page.type"), false, "the original document is no longer current");
  const history = createActionGate({ read: () => w.scope, original: w.document, url: URL_A, method: "page.type" });
  w.body.append(w.make("input", { type: "text", hasBeenTypePassword: true }));
  assert.equal(history.check(w.document, URL_A, w.text, "page.type"), false, "password history at effect time");
  const fresh = world();
  const navigate = createActionGate({ read: () => fresh.scope, original: fresh.document, url: URL_A, method: "tabs.navigate", destination: "http://localhost:4450/agent-tools?mode=navigated" });
  assert.equal(navigate.check(fresh.document, URL_A, null, "tabs.navigate", "http://localhost:4450/agent-tools?mode=opened"), false);
  const right = createActionGate({ read: () => fresh.scope, original: fresh.document, url: URL_A, method: "tabs.navigate", destination: "http://localhost:4450/agent-tools?mode=navigated" });
  assert.equal(right.check(fresh.document, URL_A, null, "tabs.navigate", "http://localhost:4450/agent-tools?mode=navigated"), true);
  const revoked = createActionGate({ read: () => fresh.scope, original: fresh.document, url: URL_A, method: "page.click" });
  revoked.revoke();
  assert.equal(revoked.check(fresh.document, URL_A, fresh.button, "page.click"), false);
  assert.equal(revoked.used, false, "a revoked gate is never attempted");
});

function actorFixture({ realmInfo, handler = true } = {}) {
  const w = world();
  const sandbox = {}, lookups = [], exported = [];
  const realm = { isSandbox: true, globalObject: sandbox, getInfo: () => realmInfo ?? { sandbox: ACT_BOUNDARY_SANDBOX, context: w.context } };
  const registry = { getExistingMessageHandler: id => { lookups.push(["handler", id]); return handler && id === "session-1" ? {
    getRealm: options => { lookups.push(["realm", options]); if (options.realmId !== "realm-1") throw new Error("NoSuchFrameError"); return realm; } } : undefined; } };
  w.global.getExistingActor = name => (name === "MessageHandlerFrame" ? { _registry: registry } : null);
  const actor = Object.assign(new AgentActionChild(), { document: w.document, contentWindow: w.window, browsingContext: w.context, manager: w.global });
  const restore = globalThis.Cu;
  globalThis.Cu = { exportFunction: (fn, target, options) => { exported.push({ target, options }); target[options.defineAs] = fn; } };
  const send = (name, data) => actor.receiveMessage({ name, data });
  const install = (overrides = {}) => send(AGENT_ACTION_MESSAGES.INSTALL, { v: 1, token: TOKEN(1), session: "session-1", realm: "realm-1",
    method: "page.type", url: URL_A, destination: null, ...overrides });
  return { w, sandbox, lookups, exported, actor, send, install, done: () => { globalThis.Cu = restore; } };
}

test("install looks up only the request's existing session handler and realm, checks its sandbox and context, and exports one gate", () => {
  const f = actorFixture();
  try {
    assert.deepEqual(f.install(), { v: 1, token: TOKEN(1), installed: true });
    assert.deepEqual(f.lookups, [["handler", "session-1"], ["realm", { realmId: "realm-1" }]], "lookup by realm id; never by sandbox name");
    assert.equal(f.exported.length, 1);
    assert.equal(f.exported[0].target, f.sandbox);
    assert.deepEqual(f.exported[0].options, { defineAs: ACTION_GATE_NAME });
    const gate = f.sandbox[ACTION_GATE_NAME];
    assert.equal(f.install({ token: TOKEN(2) }).installed, false, "one gate per document at a time");
    assert.equal(gate(f.w.document, URL_A, f.w.text, "page.type"), true);
    assert.equal(gate(f.w.document, URL_A, f.w.text, "page.type"), false);
    assert.deepEqual(f.send(AGENT_ACTION_MESSAGES.REVOKE, { v: 1, token: TOKEN(1) }), { v: 1, token: TOKEN(1), revoked: true });
  } finally { f.done(); }
});

test("install refuses unknown sessions or realms, foreign sandboxes or contexts, bad shapes and unsafe documents", () => {
  for (const [name, setup, overrides] of [
    ["unknown session", null, { session: "session-2" }], ["unknown realm", null, { realm: "realm-9" }],
    ["no handler at all", { handler: false }, {}], ["another sandbox", { realmInfo: { sandbox: "page-sandbox", context: null } }, {}],
    ["the window realm", { realmInfo: { sandbox: undefined, context: null } }, {}], ["another URL", null, { url: "http://localhost:4450/other" }],
    ["unknown method", null, { method: "tabs.open" }], ["navigate without destination", null, { method: "tabs.navigate" }],
    ["destination for a click", null, { method: "page.click", destination: "http://localhost:4450/x" }],
  ]) {
    const f = actorFixture(setup ?? {});
    try {
      if (name === "another sandbox" || name === "the window realm") { /* realm info from setup */ }
      assert.equal(f.install(overrides).installed, false, name);
      assert.equal(f.exported.length, 0, name);
    } finally { f.done(); }
  }
  const unsafe = actorFixture();
  try {
    unsafe.w.body.append(unsafe.w.make("input", { type: "password", hasBeenTypePassword: true }));
    assert.equal(unsafe.install().installed, false);
    assert.deepEqual(unsafe.send(AGENT_ACTION_MESSAGES.ADMIT, { v: 1, token: TOKEN(3), url: URL_A }), { v: 1, token: TOKEN(3), ok: false });
    for (const data of [{ v: 1, token: TOKEN(3), url: URL_A, extra: 1 }, { v: 1, token: "x", url: URL_A }, null]) {
      assert.equal(unsafe.send(AGENT_ACTION_MESSAGES.ADMIT, data), null);
    }
    assert.equal(unsafe.send("AxioSozoAgentAction:Click", { v: 1, token: TOKEN(3) }), null, "there is no effect message");
  } finally { unsafe.done(); }
});

test("admit is read-only; destruction revokes the installed gate; the parent actor relays only its destruction", () => {
  const f = actorFixture();
  try {
    assert.deepEqual(f.send(AGENT_ACTION_MESSAGES.ADMIT, { v: 1, token: TOKEN(4), url: URL_A }), { v: 1, token: TOKEN(4), ok: true });
    assert.equal(f.exported.length, 0, "admission installs nothing");
    f.install();
    const gate = f.sandbox[ACTION_GATE_NAME];
    f.actor.didDestroy();
    assert.equal(gate(f.w.document, URL_A, f.w.text, "page.type"), false);
  } finally { f.done(); }
  const parent = new AgentActionParent();
  assert.equal(parent.receiveMessage({ name: AGENT_ACTION_MESSAGES.INSTALL, data: {} }), undefined);
  assert.doesNotThrow(() => parent.didDestroy());
});
