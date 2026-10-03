/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 8: the AxioSozoAgentCapture child privacy lease, on injected
// native-shaped nodes, shadow roots, a recording MutationObserver and fixed
// native facts. Proves the conservative scope, observer-before-walk order,
// permanent invalidation, host→root identity, the begin/recheck/release
// protocol with its truthful `retained` answer, and exact MutationObserver
// cleanup ownership. The child's readback checks are literal-false point
// checks only; the parent's observer (agent-capture-runtime) is what proves
// preference ordering. Not evidence of Gecko's native mutation ordering,
// parser batching, Xrays or a real capture; root's ordinary-profile gate owns
// that proof.
import test from "node:test";
import assert from "node:assert/strict";
import { AgentCaptureChild, AGENT_CAPTURE_MESSAGES, CAPTURE_DENIED_ELEMENTS, CAPTURE_SCOPE_LIMITS, READBACK_PREF,
  captureFacts, createCaptureLeaseKeeper, readReadbackPref, scanCaptureScope } from "../chrome/AgentCaptureChild.sys.mjs";
import { AgentCaptureParent } from "../chrome/AgentCaptureParent.sys.mjs";

const HTML_NS = "http://www.w3.org/1999/xhtml";
const TOKEN = n => `cl_${String(n).padStart(32, "0")}`;

class FakeNode {
  constructor(type, log) { this.nodeType = type; this.parent = null; this.kids = []; this.log = log; }
  get firstChild() { this.log?.push(["walk", this]); return this.kids[0] ?? null; }
  get nextSibling() { const siblings = this.parent?.kids; return siblings ? siblings[siblings.indexOf(this) + 1] ?? null : null; }
  append(...nodes) { for (const node of nodes) { node.remove(); node.parent = this; this.kids.push(node); } return this; }
  remove() { if (this.parent) { this.parent.kids.splice(this.parent.kids.indexOf(this), 1); this.parent = null; } }
}
class FakeElement extends FakeNode {
  constructor(name, { ns = HTML_NS, attrs = {}, log } = {}) {
    super(1, log); this.localName = name; this.namespaceURI = ns; this.attrs = new Map(Object.entries(attrs));
    this.isContentEditable = false; this.openOrClosedShadowRoot = null;
  }
  hasAttribute(name) { return this.attrs.has(name); }
}
class FakeRoot extends FakeNode {
  constructor(host, { mode = "closed", ua = false, log } = {}) { super(11, log); this.host = host; this.mode = mode; this.ua = ua; }
  isUAWidget() { if (this.ua === "throw") throw new Error("x"); return this.ua; }
}

/** `control.observeFails`: observe() throws after the observer exists;
 * `control.disconnectFails`: disconnect() throws and stays connected. */
function observerClass(created, control) {
  return class FakeObserver {
    constructor(callback) { this.callback = callback; this.targets = []; this.pending = []; this.disconnected = false; this.disconnects = 0; created.push(this); }
    observe(target, options) {
      if (control.observeFails) throw new Error("observe failed");
      this.targets.push(target); this.options = options; target.log?.push(["observe", target]);
    }
    takeRecords() { const records = this.pending; this.pending = []; return records; }
    disconnect() { this.disconnects++; if (control.disconnectFails) throw new Error("disconnect failed"); this.disconnected = true; }
    record(type = "childList") { if (!this.disconnected) this.pending.push({ type }); }
    deliver() { const records = this.takeRecords(); if (records.length) this.callback(records, this); }
  };
}
const HELD = Object.freeze({ ok: true, retained: true }), CLEAN = Object.freeze({ ok: false, retained: false });

/** A clean static document: html > head, body > main > h1, p, button, a
 * component host with a closed author root holding text only. */
function world({ url = "http://localhost:4450/agent-tools" } = {}) {
  const log = [], observers = [];
  const make = (name, options = {}) => new FakeElement(name, { log, ...options });
  const document = new FakeNode(9, log);
  Object.assign(document, { contentType: "text/html", designMode: "off", documentURI: url,
    nodePrincipal: { isSystemPrincipal: false, isNullPrincipal: false, isContentPrincipal: true, privateBrowsingId: 0 } });
  const doctype = new FakeNode(10, log);
  const html = make("html"), head = make("head"), body = make("body"), main = make("main");
  const button = make("button"), host = make("div");
  const root = new FakeRoot(host, { log });
  host.openOrClosedShadowRoot = root;
  root.append(Object.assign(make("p"), {}), new FakeNode(3, log));
  main.append(make("h1").append(new FakeNode(3, log)), make("p").append(new FakeNode(3, log)), button, host, new FakeNode(8, log));
  html.append(head.append(make("title"), make("style")), body.append(main, make("script")));
  document.append(doctype, html);
  document.documentElement = html;
  const context = { usePrivateBrowsing: false, originAttributes: { privateBrowsingId: 0 }, parent: null, isContent: true, isDiscarded: false, children: [] };
  context.top = context;
  const global = { isClosed: false, isCurrentGlobal: true, browsingContext: context };
  const control = { observeFails: false, disconnectFails: false };
  const window = { document, innerWidth: 1200, innerHeight: 800, devicePixelRatio: 2, windowUtils: { isInModalState: () => false },
    MutationObserver: observerClass(observers, control) };
  // The readback preference, read at each point check; nothing observes it here.
  const prefs = { value: false, reads: 0 };
  const readPref = () => { prefs.reads++; return typeof prefs.value === "function" ? prefs.value() : prefs.value; };
  const scope = { document, window, browsingContext: context, windowGlobal: global };
  const className = value => (value === document ? "HTMLDocument" : null);
  const keeper = createCaptureLeaseKeeper({ read: () => scope, readPref, className });
  return { log, observers, make, document, html, body, main, button, host, root, context, global, window, prefs, scope, keeper, control,
    readPref, get observer() { return observers.at(-1); } };
}

test("a clean static document is admitted: the document is observed before the walk and every root before its subtree", () => {
  const w = world();
  assert.deepEqual(w.keeper.begin(TOKEN(1)), HELD);
  assert.equal(w.observers.length, 1);
  assert.deepEqual(w.observer.targets, [w.document, w.root]);
  assert.deepEqual(w.observer.options, { childList: true, attributes: true, characterData: true, subtree: true, chromeOnlyNodes: true });
  const order = w.log.map(([kind, node]) => `${kind}:${node === w.document ? "document" : node === w.root ? "root" : "other"}`);
  assert.equal(order[0], "observe:document", "the document observer exists before any node is read");
  assert.ok(order.indexOf("observe:root") < order.indexOf("walk:root"), "a root is observed before its subtree is walked");
  assert.equal(w.keeper.recheck(TOKEN(1)), true);
  assert.deepEqual(w.keeper.release(TOKEN(1), true), { released: true, committed: true });
  assert.equal(w.observer.disconnected, true);
  assert.equal(w.keeper.recheck(TOKEN(1)), false, "a retired lease never validates again");
  assert.deepEqual(w.keeper.release(TOKEN(1), false), { released: true, committed: false }, "cleanup of a retired token is idempotent");
  assert.deepEqual(w.keeper.begin(TOKEN(1)), CLEAN, "a retired token is never reused");
  assert.deepEqual(w.keeper.begin(TOKEN(2)), HELD, "a new token after retirement");
});

test("native facts refuse before any observer is created or any node read", () => {
  const cases = [
    ["private context", w => { w.context.usePrivateBrowsing = true; }],
    ["private origin attributes", w => { w.context.originAttributes.privateBrowsingId = 1; }],
    ["private principal", w => { w.document.nodePrincipal.privateBrowsingId = 1; }],
    ["system principal", w => { w.document.nodePrincipal.isSystemPrincipal = true; }],
    ["null principal", w => { w.document.nodePrincipal.isNullPrincipal = true; }],
    ["no content principal", w => { w.document.nodePrincipal.isContentPrincipal = undefined; }],
    ["closed global", w => { w.global.isClosed = true; }],
    ["not current", w => { w.global.isCurrentGlobal = false; }],
    ["foreign global", w => { w.global.browsingContext = {}; }],
    ["subframe context", w => { w.context.parent = {}; }],
    ["discarded", w => { w.context.isDiscarded = true; }],
    ["a child browsing context (frame)", w => { w.context.children = [{}]; }],
    ["unknown children", w => { w.context.children = undefined; }],
    ["replaced document", w => { w.window.document = {}; }],
    ["not text/html", w => { w.document.contentType = "application/xhtml+xml"; }],
    ["XML document class", w => { w.keeper = createCaptureLeaseKeeper({ read: () => w.scope, readPref: () => false, className: () => "XMLDocument" }); }],
    ["designMode", w => { w.document.designMode = "on"; }],
    ["file URL", w => { w.document.documentURI = "file:///synthetic/page.html"; }],
    ["about URL", w => { w.document.documentURI = "about:neterror?e=x"; }],
    ["credentials", w => { w.document.documentURI = "http://user:pw@localhost:4450/"; }],
    ["modal state", w => { w.window.windowUtils.isInModalState = () => true; }],
    ["unknown modal state", w => { w.window.windowUtils.isInModalState = () => { throw new Error("x"); }; }],
    ["readback on", w => { w.prefs.value = true; }],
    ["readback unknown", w => { w.prefs.value = null; }],
    ["readback not a boolean", w => { w.prefs.value = "false"; }],
    ["readback unreadable", w => { w.prefs.value = () => { throw new Error("x"); }; }],
    ["wide viewport", w => { w.window.innerWidth = 8193; }],
    ["huge area", w => { w.window.innerWidth = 4097; w.window.innerHeight = 4097; }],
    ["no ratio", w => { w.window.devicePixelRatio = NaN; }],
  ];
  for (const [name, setup] of cases) {
    const w = world();
    setup(w);
    assert.deepEqual(w.keeper.begin(TOKEN(1)), CLEAN, `${name}: refused, and positively nothing retained`);
    assert.equal(w.observers.length, 0, `${name}: no observer`);
    assert.equal(w.log.length, 0, `${name}: no node read`);
    assert.deepEqual(w.keeper.release(TOKEN(1), false), { released: true, committed: false }, `${name}: releasable at once`);
  }
});

test("scope refusals: every field, frame and unproved control, editable content, foreign namespaces, UA roots and bounds", () => {
  const refuse = (name, setup) => {
    const w = world();
    setup(w);
    assert.deepEqual(w.keeper.begin(TOKEN(1)), CLEAN, name);
    assert.equal(w.observer.disconnected, true, `${name}: its observer is released`);
    assert.equal(w.keeper.state().active, false);
  };
  for (const tag of CAPTURE_DENIED_ELEMENTS) refuse(tag, w => w.main.append(w.make(tag)));
  for (const tag of ["input", "iframe", "textarea"]) refuse(`${tag} in a closed root`, w => w.root.append(w.make(tag)));
  refuse("contenteditable attribute", w => w.main.append(w.make("div", { attrs: { contenteditable: "false" } })));
  refuse("editable element", w => { w.button.isContentEditable = true; });
  refuse("unknown editability", w => { w.button.isContentEditable = undefined; });
  refuse("SVG", w => w.main.append(w.make("svg", { ns: "http://www.w3.org/2000/svg" })));
  refuse("MathML", w => w.main.append(w.make("math", { ns: "http://www.w3.org/1998/Math/MathML" })));
  refuse("no namespace", w => w.main.append(w.make("div", { ns: null })));
  refuse("UA widget root", w => { w.root.ua = true; });
  refuse("unknown UA state", w => { w.root.ua = "throw"; });
  refuse("root of another host", w => { w.root.host = w.button; });
  refuse("unknown root mode", w => { w.root.mode = "user-agent"; });
  refuse("CDATA", w => w.main.append(new FakeNode(4)));
  refuse("processing instruction", w => w.main.append(new FakeNode(7)));
  refuse("nested doctype", w => w.main.append(new FakeNode(10)));
  refuse("node limit", w => { for (let i = 0; i < CAPTURE_SCOPE_LIMITS.nodes; i++) w.main.append(new FakeNode(3)); });
  refuse("root limit", w => {
    for (let i = 0; i < CAPTURE_SCOPE_LIMITS.roots; i++) {
      const host = w.make("span"); host.openOrClosedShadowRoot = new FakeRoot(host); w.main.append(host);
    }
  });
  refuse("depth limit", w => { let parent = w.main; for (let i = 0; i < CAPTURE_SCOPE_LIMITS.depth; i++) { const child = w.make("div"); parent.append(child); parent = child; } });
  const deep = world();
  let parent = deep.main;
  for (let i = 0; i < CAPTURE_SCOPE_LIMITS.depth - 4; i++) { const child = deep.make("div"); parent.append(child); parent = child; }
  assert.deepEqual(deep.keeper.begin(TOKEN(1)), HELD, "within the depth limit");
});

test("any delivered or pending record invalidates for good; the observer is disconnected and nothing is rebaselined", () => {
  const pending = world();
  assert.deepEqual(pending.keeper.begin(TOKEN(1)), HELD);
  pending.observer.record("attributes");
  assert.equal(pending.keeper.recheck(TOKEN(1)), false);
  assert.equal(pending.observer.disconnected, true);
  assert.equal(pending.keeper.recheck(TOKEN(1)), false, "a later clean tree does not restore it");
  assert.deepEqual(pending.keeper.release(TOKEN(1), true), { released: true, committed: false }, "an invalid lease is retired, never committed");

  const delivered = world();
  assert.deepEqual(delivered.keeper.begin(TOKEN(1)), HELD);
  delivered.observer.record();
  delivered.observer.deliver();
  assert.equal(delivered.keeper.recheck(TOKEN(1)), false);

  const during = world();
  // A record that arrives during the begin walk itself refuses the lease.
  const original = during.button;
  Object.defineProperty(original, "openOrClosedShadowRoot", { get() { during.observer.record(); return null; } });
  assert.deepEqual(during.keeper.begin(TOKEN(1)), CLEAN);
  assert.equal(during.observer.disconnected, true);
});

test("host→root identity: a new closed root on a known host, a replaced root or a new element refuse even without a record", () => {
  const attached = world();
  assert.deepEqual(attached.keeper.begin(TOKEN(1)), HELD);
  attached.button.openOrClosedShadowRoot = new FakeRoot(attached.button);
  assert.equal(attached.keeper.recheck(TOKEN(1)), false, "a persistent new root changes retained identity");

  const replaced = world();
  assert.deepEqual(replaced.keeper.begin(TOKEN(1)), HELD);
  replaced.host.openOrClosedShadowRoot = new FakeRoot(replaced.host);
  assert.equal(replaced.keeper.recheck(TOKEN(1)), false);

  const inserted = world();
  assert.deepEqual(inserted.keeper.begin(TOKEN(1)), HELD);
  inserted.main.append(inserted.make("p"));
  assert.equal(inserted.keeper.recheck(TOKEN(1)), false);

  const transient = world();
  assert.deepEqual(transient.keeper.begin(TOKEN(1)), HELD);
  // A password added and removed in an existing closed root: the final tree is
  // identical, the observer's records are what refuse it.
  const field = transient.make("input"); transient.root.append(field); transient.observer.record(); field.remove(); transient.observer.record();
  assert.equal(transient.keeper.recheck(TOKEN(1)), false);
});

test("viewport, document, global, privacy, modal and readback changes after begin invalidate the lease", () => {
  for (const [name, change] of [["viewport", w => { w.window.innerHeight = 801; }], ["ratio", w => { w.window.devicePixelRatio = 1; }],
    ["document element", w => { w.document.documentElement = w.make("html"); }], ["url", w => { w.document.documentURI += "#x"; }],
    ["global", w => { w.global.isCurrentGlobal = false; }], ["private", w => { w.context.usePrivateBrowsing = true; }],
    ["frame", w => { w.context.children = [{}]; }], ["modal", w => { w.window.windowUtils.isInModalState = () => true; }],
    ["readback", w => { w.prefs.value = true; }], ["principal", w => { w.document.nodePrincipal = { ...w.document.nodePrincipal }; }]]) {
    const w = world();
    assert.deepEqual(w.keeper.begin(TOKEN(1)), HELD, name);
    change(w);
    assert.equal(w.keeper.recheck(TOKEN(1)), false, name);
    assert.equal(w.observer.disconnected, true, name);
  }
});

test("one active lease per document; wrong tokens grant nothing; pagehide and destruction retire", () => {
  const w = world();
  assert.deepEqual(w.keeper.begin(TOKEN(1)), HELD);
  assert.deepEqual(w.keeper.begin(TOKEN(1)), { ok: false, retained: true }, "its own token again: refused, the lease is still retained");
  assert.deepEqual(w.keeper.begin(TOKEN(2)), CLEAN, "busy: never replaced; nothing was allocated for the second token");
  assert.equal(w.observers.length, 1);
  assert.equal(w.keeper.recheck(TOKEN(2)), false);
  assert.deepEqual(w.keeper.release(TOKEN(2), true), { released: true, committed: false }, "a token that allocated nothing releases at once, never commits");
  assert.equal(w.keeper.recheck(TOKEN(1)), true);
  w.keeper.invalidate();
  assert.equal(w.keeper.recheck(TOKEN(1)), false);
  w.keeper.destroy();
  assert.deepEqual(w.keeper.release(TOKEN(1), false), { released: true, committed: false });
  for (const token of ["cl_1", `cl_${"G".repeat(32)}`, 7, null, `xx_${"0".repeat(32)}`]) assert.deepEqual(world().keeper.begin(token), CLEAN);
});

test("the child's readback checks are literal-false point checks; alone they cannot see false→true→false between two checks", () => {
  const w = world();
  assert.deepEqual(w.keeper.begin(TOKEN(1)), HELD);
  const reads = w.prefs.reads;
  assert.ok(reads >= 2, "read at begin, before and after the walk");
  // A change and its return entirely between two point checks: the child has
  // nothing that saw it. The parent observer is what refuses this ordering.
  w.prefs.value = true; w.prefs.value = false;
  assert.equal(w.keeper.recheck(TOKEN(1)), true, "a point check alone cannot attest the ordering");
  assert.ok(w.prefs.reads > reads, "recheck read it again");
  // A non-false value at any check invalidates for good.
  w.prefs.value = true;
  assert.equal(w.keeper.recheck(TOKEN(1)), false);
  w.prefs.value = false;
  assert.equal(w.keeper.recheck(TOKEN(1)), false, "never rebaselined");
  assert.deepEqual(w.keeper.release(TOKEN(1), true), { released: true, committed: false });
});

test("a refusal after the observer was allocated reports exactly what remains; uncertain cleanup stays owned and blocks every new token", () => {
  // Setup fails after the MutationObserver exists: disconnected, nothing retained.
  const clean = world();
  clean.control.observeFails = true;
  assert.deepEqual(clean.keeper.begin(TOKEN(1)), CLEAN);
  assert.deepEqual([clean.observers.length, clean.observer.disconnected], [1, true]);
  assert.deepEqual(clean.keeper.release(TOKEN(1), false), { released: true, committed: false });

  // The same failure with a disconnect that throws: owned, and said so.
  const w = world();
  w.control.observeFails = true;
  w.control.disconnectFails = true;
  assert.deepEqual(w.keeper.begin(TOKEN(1)), { ok: false, retained: true }, "allocated and not provably disconnected");
  assert.equal(w.keeper.state().cleanup_uncertain, 1);
  w.control.observeFails = false;
  assert.deepEqual(w.keeper.begin(TOKEN(2)), CLEAN, "a new token cannot bypass the earlier observer; it allocated nothing itself");
  assert.equal(w.observers.length, 1, "no second observer");
  assert.deepEqual(w.keeper.begin(TOKEN(1)), { ok: false, retained: true }, "the uncertain token itself still reports what it holds");
  assert.deepEqual(w.keeper.release(TOKEN(1), false), { released: false, committed: false }, "an unknown disconnect is never a release");
  w.control.disconnectFails = false;
  assert.deepEqual(w.keeper.release(TOKEN(1), true), { released: true, committed: false }, "the exact retry disconnects it; never a commit");
  assert.deepEqual([w.observer.disconnected, w.keeper.state().cleanup_uncertain], [true, 0]);
  assert.deepEqual(w.keeper.begin(TOKEN(3)), HELD, "a new token once nothing is owed");

  // A held lease whose disconnect fails at release or destruction stays owned too.
  w.control.disconnectFails = true;
  assert.deepEqual(w.keeper.release(TOKEN(3), true), { released: false, committed: false }, "never committed while connected");
  w.keeper.destroy();
  assert.equal(w.keeper.state().cleanup_uncertain, 1, "destruction keeps what it could not disconnect");
  w.control.disconnectFails = false;
  w.keeper.destroy();
  assert.deepEqual([w.keeper.state().cleanup_uncertain, w.observer.disconnected], [0, true]);
});

test("pure scanner: baseline identity and counts; scope facts read the readback preference literally", () => {
  const w = world();
  const facts = captureFacts(w.scope, { readPref: () => false, className: () => "HTMLDocument" });
  const first = scanCaptureScope(facts);
  assert.equal(first.roots.length, 1);
  assert.equal(first.hosts.get(w.host), w.root);
  assert.equal(first.hosts.get(w.button), null, "a host without a root is retained as null");
  assert.equal(scanCaptureScope(facts, { baseline: first.hosts }).count, first.count);
  const prefs = (type, value) => ({ PREF_BOOL: 128, getPrefType: () => type, getBoolPref: () => value });
  assert.equal(readReadbackPref(prefs(128, false)), false);
  assert.equal(readReadbackPref(prefs(128, true)), true);
  assert.equal(readReadbackPref(prefs(0, false)), null, "a missing preference is unknown");
  assert.equal(readReadbackPref({ getPrefType: () => { throw new Error("x"); } }), null);
  assert.equal(READBACK_PREF, "remote.screenshot.use_readback");
});

/** The actual AgentCaptureChild on the fake world; Services.prefs offers no
 * observer methods at all, so any registration attempt would throw. */
function withActor(w, body) {
  const restore = { ChromeUtils: globalThis.ChromeUtils, Services: globalThis.Services };
  globalThis.ChromeUtils = { getClassName: value => (value === w.document ? "HTMLDocument" : null) };
  globalThis.Services = { prefs: { PREF_BOOL: 128, getPrefType: () => 128, getBoolPref: () => false,
    addObserver: () => { throw new Error("the child never observes the preference"); } } };
  try {
    const actor = Object.assign(new AgentCaptureChild(), { document: w.document, contentWindow: w.window, browsingContext: w.context, manager: w.global });
    body(actor, (name, data) => actor.receiveMessage({ name, data }));
  } finally { Object.assign(globalThis, restore); }
}

test("the actor's own teardown disconnects an uncertain refused observer and a held lease's observer", () => {
  const w = world();
  withActor(w, (actor, send) => {
    w.main.append(w.make("input"));
    w.control.disconnectFails = true;
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.BEGIN, { v: 1, token: TOKEN(7) }), { v: 1, token: TOKEN(7), ok: false, retained: true });
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.RELEASE, { v: 1, token: TOKEN(7), commit: false }), { v: 1, token: TOKEN(7), released: false, committed: false });
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.BEGIN, { v: 1, token: TOKEN(8) }), { v: 1, token: TOKEN(8), ok: false, retained: false },
      "blocked behind the owned observer, allocating nothing");
    w.control.disconnectFails = false;
    actor.didDestroy();
    assert.equal(w.observer.disconnected, true, "the actor's destruction disconnected the exact observer");
    assert.equal(w.observers.length, 1);
  });
  const held = world();
  withActor(held, (actor, send) => {
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.BEGIN, { v: 1, token: TOKEN(9) }), { v: 1, token: TOKEN(9), ok: true, retained: true });
    actor.didDestroy();
    assert.equal(held.observer.disconnected, true);
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.RECHECK, { v: 1, token: TOKEN(9) }), { v: 1, token: TOKEN(9), ok: false });
  });
});

test("the actor answers exactly three fixed queries with correlated yes/no only; pagehide and destruction end its lease", () => {
  const w = world();
  withActor(w, (actor, send) => {
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.BEGIN, { v: 1, token: TOKEN(5) }), { v: 1, token: TOKEN(5), ok: true, retained: true });
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.RECHECK, { v: 1, token: TOKEN(5) }), { v: 1, token: TOKEN(5), ok: true });
    for (const data of [{ v: 1, token: TOKEN(5), extra: 1 }, { v: 2, token: TOKEN(5) }, { v: 1, token: "x" }, null, "begin"]) {
      assert.equal(send(AGENT_CAPTURE_MESSAGES.RECHECK, data), null, JSON.stringify(data));
    }
    assert.equal(send(AGENT_CAPTURE_MESSAGES.RELEASE, { v: 1, token: TOKEN(5), commit: "yes" }), null);
    assert.equal(send("AxioSozoAgentCapture:Screenshot", { v: 1, token: TOKEN(5) }), null, "no other message exists");
    actor.handleEvent({ type: "pagehide" });
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.RECHECK, { v: 1, token: TOKEN(5) }), { v: 1, token: TOKEN(5), ok: false });
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.RELEASE, { v: 1, token: TOKEN(5), commit: true }), { v: 1, token: TOKEN(5), released: true, committed: false });
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.BEGIN, { v: 1, token: TOKEN(6) }), { v: 1, token: TOKEN(6), ok: true, retained: true });
    actor.didDestroy();
    assert.equal(w.observer.disconnected, true);
    assert.deepEqual(send(AGENT_CAPTURE_MESSAGES.RELEASE, { v: 1, token: TOKEN(6), commit: false }), { v: 1, token: TOKEN(6), released: false, committed: false },
      "a destroyed actor's keeper is gone; the parent retires by its own destruction notice");
  });
  // The parent actor relays only its destruction; it answers nothing.
  const parent = new AgentCaptureParent();
  assert.equal(parent.receiveMessage({ name: AGENT_CAPTURE_MESSAGES.BEGIN, data: { v: 1, token: TOKEN(1) } }), undefined);
  assert.doesNotThrow(() => parent.didDestroy());
});
