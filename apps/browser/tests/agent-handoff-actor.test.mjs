/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 4: the AxioSozoHandoff actor. The child's answer is computed
// from synthetic native facts (manager, browsing context, this.document with
// recording getters); the parent exposes no receiver; chrome validates and
// rebinds every answer. Not evidence of Gecko actor dispatch, Xray behaviour or
// process isolation.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { inspectHandoffDocument, handoffLine, handoffProse, handoffPasswordRisk, HANDOFF_MESSAGES, AgentHandoffChild,
  AxioSozoHandoffChild } from "../chrome/AgentHandoffChild.sys.mjs";
import { AgentHandoffParent, AxioSozoHandoffParent } from "../chrome/AgentHandoffParent.sys.mjs";

const { validateHandoffReply, HANDOFF_ACTOR, HANDOFF_ACTOR_OPTIONS, registerHandoffActor } = await import("../chrome/AgentHandoffRuntime.sys.mjs");

const XHTML = "http://www.w3.org/1999/xhtml";
const URL_ = "http://localhost:5173/settings?token=secret#tab";
const input = (password, extra = {}) => ({ localName: "input", namespaceURI: XHTML, hasBeenTypePassword: password, ...extra });

function page({ url = URL_, title = "Synthetic settings", inputs = [], active = null, selection = "render failed", ranges = 1, collapsed = false,
  principal = {}, foreignRange = false } = {}) {
  const reads = [];
  const document = {};
  const node = { ownerDocument: document };
  const other = { ownerDocument: {} };
  const nodePrincipal = { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true, privateBrowsingId: 0,
    schemeIs: scheme => new URL(url).protocol === `${scheme}:`, ...principal };
  Object.defineProperties(document, {
    documentURI: { get() { reads.push("uri"); return url; } },
    nodePrincipal: { get() { reads.push("principal"); return nodePrincipal; } },
    title: { get() { reads.push("title"); return title; } },
    activeElement: { get() { reads.push("active"); return active; } },
  });
  document.querySelectorAll = selector => { reads.push(`query:${selector}`); return inputs; };
  document.getSelection = () => {
    reads.push("selection");
    return { rangeCount: ranges, isCollapsed: collapsed,
      getRangeAt: () => ({ startContainer: node, endContainer: foreignRange ? other : node }),
      toString: () => { reads.push("selection-text"); return selection; } };
  };
  return { document, reads };
}
function actor(document, { inner = 7, current = true, closed = false, subframe = false } = {}) {
  const context = { parent: subframe ? {} : null };
  context.top = subframe ? {} : context;
  return { manager: { isClosed: closed, isCurrentGlobal: current, innerWindowId: inner }, browsingContext: context, document };
}
const precheck = { url: URL_, inner_window_id: 7 };
const capture = include => ({ url: URL_, inner_window_id: 7, include_selection: include });
const collected = reads => reads.filter(name => ["title", "selection-text"].includes(name));

test("precheck answers privacy facts only: no title and no selected text are read", () => {
  const p = page();
  assert.deepEqual(inspectHandoffDocument(actor(p.document), precheck, "precheck"),
    { ok: true, url: URL_, inner_window_id: 7, password_risk: false, has_selection: true });
  assert.deepEqual(collected(p.reads), []);
  const none = page({ collapsed: true });
  assert.equal(inspectHandoffDocument(actor(none.document), precheck, "precheck").has_selection, false);
});

test("capture reads the title, and the selection only when the user opted in", () => {
  const without = page();
  assert.deepEqual(inspectHandoffDocument(actor(without.document), capture(false), "capture"),
    { ok: true, url: URL_, inner_window_id: 7, password_risk: false, title: "Synthetic settings", selection: null });
  assert.deepEqual(collected(without.reads), ["title"], "the selected text is never read without the opt-in");
  const withText = page({ selection: "line one\r\nline\u0007 two\ttab" });
  assert.equal(inspectHandoffDocument(actor(withText.document), capture(true), "capture").selection, "line one\nline two\ttab");
  const huge = page({ selection: `${"a".repeat(16383)}😀tail`, title: `x\u0000y ${"t".repeat(600)}` });
  const answer = inspectHandoffDocument(actor(huge.document), capture(true), "capture");
  assert.equal(answer.selection.length, 16383, "cut before a surrogate pair, never inside it");
  assert.equal(answer.title.length, 512);
  assert.equal(answer.title.startsWith("x y "), true);
});

test("password controls deny before any title or selection read: focused, inside a shadow root, in the page, or unknown", () => {
  const shadowed = { localName: "div", namespaceURI: XHTML, openOrClosedShadowRoot: { activeElement: input(true) } };
  for (const options of [{ active: input(true) }, { active: shadowed }, { inputs: [input(false), input(true)] },
    { inputs: [input(undefined)] }, { inputs: Array.from({ length: 4097 }, () => input(false)) }]) {
    const p = page(options);
    for (const mode of ["precheck", "capture"]) {
      assert.deepEqual(inspectHandoffDocument(actor(p.document), mode === "capture" ? capture(true) : precheck, mode),
        { ok: true, url: URL_, inner_window_id: 7, password_risk: true });
    }
    assert.deepEqual(collected(p.reads), [], "nothing is collected on a page with a password field");
    assert.equal(p.reads.includes("selection"), false);
  }
  assert.equal(handoffPasswordRisk(page({ inputs: [input(false), { localName: "input", namespaceURI: "http://www.w3.org/2000/svg" }] }).document), false);
});

// A chain of `hosts` focused shadow hosts, each delegating focus into the next
// one's shadow root, ending in `leaf` (the 0-based depth of the leaf is `hosts`).
function focusChain(hosts, leaf) {
  let node = leaf;
  for (let index = 0; index < hosts; index++) {
    const inner = node;
    node = { localName: "div", namespaceURI: XHTML, openOrClosedShadowRoot: { activeElement: inner } };
  }
  return node;
}
const plain = (localName = "textarea") => ({ localName, namespaceURI: XHTML });
const deniedWithoutReads = (active, inputs = []) => {
  const p = page({ active, inputs });
  for (const [mode, data] of [["precheck", precheck], ["capture", capture(true)]]) {
    assert.deepEqual(inspectHandoffDocument(actor(p.document), data, mode), { ok: true, url: URL_, inner_window_id: 7, password_risk: true });
  }
  assert.deepEqual(collected(p.reads), [], "no title or selected text is read");
  assert.equal(p.reads.includes("selection"), false);
};

test("focus depth: a focused node left when the bound is used up is unknown and denies, whatever is at the leaf", () => {
  // The lead's reproduction: 33 nested focused hosts, a password field at the leaf, no light-DOM input.
  deniedWithoutReads(focusChain(33, input(true)));
  // One node past the bound denies even when the leaf is an ordinary field.
  deniedWithoutReads(focusChain(32, plain()));
  // Exactly at the bound: the leaf is the 32nd focused node and is checked.
  deniedWithoutReads(focusChain(31, input(true)));
  const ordinary = page({ active: focusChain(31, plain()) });
  assert.equal(inspectHandoffDocument(actor(ordinary.document), capture(false), "capture").password_risk, false);
  assert.deepEqual(collected(ordinary.reads), ["title"]);
});

test("focus inside a frame, embed or object is unknown and denies; its document is never touched", () => {
  for (const localName of ["iframe", "frame", "embed", "object", "fencedframe"]) {
    let touched = 0;
    const embedding = { localName, namespaceURI: XHTML };
    for (const name of ["contentDocument", "contentWindow", "getSVGDocument"]) {
      Object.defineProperty(embedding, name, { get() { touched++; return null; } });
    }
    deniedWithoutReads(embedding);
    deniedWithoutReads(focusChain(2, embedding), [input(false)]);
    assert.equal(touched, 0, `${localName}: nothing inside it is read`);
  }
});

test("ordinary focus is fine: a text field, a button, the body or nothing focused", () => {
  for (const active of [plain("textarea"), plain("button"), plain("body"), input(false, { type: "text" }), null,
    focusChain(3, plain("input-like-span"))]) {
    const p = page({ active, inputs: [input(false)] });
    const answer = inspectHandoffDocument(actor(p.document), capture(true), "capture");
    assert.deepEqual([answer.ok, answer.password_risk, answer.selection], [true, false, "render failed"]);
  }
});

test("stale documents are refused before any read: not current, closed, another inner window, a subframe or a changed URL", () => {
  for (const [options, data] of [[{ current: false }, precheck], [{ closed: true }, precheck], [{ inner: 8 }, precheck],
    [{ subframe: true }, precheck], [{}, { ...precheck, url: "http://localhost:5173/settings?token=secret#other" }]]) {
    const p = page();
    assert.deepEqual(inspectHandoffDocument(actor(p.document, options), data, "precheck"), { ok: false, reason: "STALE_TAB" });
    assert.deepEqual(collected(p.reads), []);
    assert.equal(p.reads.includes("query:input"), false);
  }
});

test("system, null, private and non-web principals are refused; malformed requests are refused", () => {
  for (const principal of [{ isSystemPrincipal: true }, { isNullPrincipal: true }, { isContentPrincipal: false }, { privateBrowsingId: 1 }]) {
    assert.deepEqual(inspectHandoffDocument(actor(page({ principal }).document), precheck, "precheck"), { ok: false, reason: "PRIVATE" });
  }
  const file = page({ url: "file:///synthetic/page.html" });
  assert.deepEqual(inspectHandoffDocument(actor(file.document), { url: "file:///synthetic/page.html", inner_window_id: 7 }, "precheck"),
    { ok: false, reason: "INVALID_INPUT" });
  for (const [data, mode] of [[null, "precheck"], [{ url: URL_ }, "precheck"], [{ url: URL_, inner_window_id: 0 }, "precheck"],
    [{ url: URL_, inner_window_id: 7 }, "capture"], [precheck, "screenshot"]]) {
    assert.deepEqual(inspectHandoffDocument(actor(page().document), data, mode), { ok: false, reason: "INVALID_REQUEST" });
  }
});

test("only ranges of this very document count; an unbounded selection is refused", () => {
  assert.deepEqual(inspectHandoffDocument(actor(page({ foreignRange: true }).document), capture(true), "capture"), { ok: false, reason: "OBSERVATION_MISMATCH" });
  assert.deepEqual(inspectHandoffDocument(actor(page({ ranges: 65 }).document), precheck, "precheck"), { ok: false, reason: "OBSERVATION_MISMATCH" });
});

test("the child reads this.document, never a content window that may already show a newer document", () => {
  const current = page(), newer = page({ title: "Newer document" });
  const child = new AgentHandoffChild();
  Object.assign(child, actor(current.document));
  child.contentWindow = { document: newer.document };
  const answer = child.receiveMessage({ name: HANDOFF_MESSAGES.CAPTURE, data: capture(false) });
  assert.equal(answer.title, "Synthetic settings");
  assert.deepEqual(newer.reads, []);
  assert.deepEqual(child.receiveMessage({ name: "AxioSozoHandoff:Copy", data: capture(true) }), { ok: false, reason: "INVALID_REQUEST" });
  assert.equal(AxioSozoHandoffChild, AgentHandoffChild);
});

test("the parent side exposes no receiver: nothing from content can copy, authorize or start anything", () => {
  const parent = new AgentHandoffParent();
  for (const name of ["AxioSozoHandoff:Copy", "AxioSozoHandoff:Authorize", HANDOFF_MESSAGES.CAPTURE, "AxioSozoHandoff:Send"]) {
    assert.equal(parent.receiveMessage({ name, data: { request_id: "hf_0123456789abcdef", user_request: true } }), undefined);
  }
  assert.deepEqual(Object.getOwnPropertyNames(AgentHandoffParent.prototype).sort(), ["constructor", "receiveMessage"]);
  assert.equal(AxioSozoHandoffParent, AgentHandoffParent);
});

test("actor registration: top-level http(s) web documents only, explicitly safe for web processes, once per process", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(HANDOFF_ACTOR_OPTIONS)), {
    parent: { esModuleURI: "chrome://browser/content/axiosozo/AgentHandoffParent.sys.mjs" },
    child: { esModuleURI: "chrome://browser/content/axiosozo/AgentHandoffChild.sys.mjs" },
    allFrames: false, includeChrome: false, remoteTypes: ["web"], matches: ["http://*/*", "https://*/*"], safeForUntrustedWebProcess: true });
  assert.equal(HANDOFF_ACTOR_OPTIONS.child.events, undefined, "no page event creates the actor");
  const registered = [];
  const chromeUtils = { registerWindowActor: (name, options) => registered.push([name, options]) };
  registerHandoffActor(chromeUtils); registerHandoffActor(chromeUtils);
  assert.deepEqual(registered.map(([name]) => name), [HANDOFF_ACTOR]);
});

test("chrome rebinds every answer: exact keys, the asked URL and inner window, bounded text, no smuggled selection", () => {
  const bind = { url: URL_, innerWindowId: 7 };
  assert.deepEqual(validateHandoffReply({ ok: true, url: URL_, inner_window_id: 7, password_risk: false, has_selection: true }, { ...bind, mode: "precheck" }),
    { has_selection: true });
  const ok = { ok: true, url: URL_, inner_window_id: 7, password_risk: false, title: "T", selection: "S\r\nx" };
  assert.deepEqual(validateHandoffReply(ok, { ...bind, mode: "capture", includeSelection: true }), { title: "T", selection: "S\nx" });
  const refused = (reply, options, code) => assert.throws(() => validateHandoffReply(reply, { ...bind, ...options }), { code });
  refused({ ...ok }, { mode: "capture", includeSelection: false }, "OBSERVATION_MISMATCH");
  refused({ ...ok, url: "http://localhost:5173/other" }, { mode: "capture", includeSelection: true }, "OBSERVATION_MISMATCH");
  refused({ ...ok, inner_window_id: 8 }, { mode: "capture", includeSelection: true }, "OBSERVATION_MISMATCH");
  refused({ ...ok, extra: 1 }, { mode: "capture", includeSelection: true }, "OBSERVATION_MISMATCH");
  refused({ ...ok, title: "t".repeat(513) }, { mode: "capture", includeSelection: true }, "OBSERVATION_MISMATCH");
  refused({ ...ok, selection: "s".repeat(16385) }, { mode: "capture", includeSelection: true }, "OBSERVATION_MISMATCH");
  refused({ ...ok, password_risk: "no" }, { mode: "capture", includeSelection: true }, "OBSERVATION_MISMATCH");
  refused({ ok: true, url: URL_, inner_window_id: 7, password_risk: true }, { mode: "capture" }, "PASSWORD_RISK");
  refused({ ok: false, reason: "STALE_TAB" }, { mode: "precheck" }, "STALE_TAB");
  refused({ ok: false, reason: "<b>secret</b>" }, { mode: "precheck" }, "OBSERVATION_MISMATCH");
  refused(null, { mode: "precheck" }, "OBSERVATION_MISMATCH");
});

test("text normalization: one line titles, prose selections, well-formed UTF-16", () => {
  assert.equal(handoffLine("a\n\tb\u0085c   d"), "a b c d");
  assert.equal(handoffLine("x\ud800y"), "x�y");
  assert.equal(handoffProse("a\rb\r\nc\u0000d\u000be"), "a\nb\ncde");
  assert.equal(handoffProse("\udc00z"), "�z");
  assert.equal(handoffLine(42), "");
});
