/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Child side of the AxioSozoAgentCapture JSWindowActor (Plan 4 step 8, P4).
// It keeps at most one privacy lease for its own current top-level document
// and answers exactly three parent queries: begin, recheck and release. It
// never captures, serializes or returns page content. Every reply is a
// correlated yes/no; the image itself is made in the parent by genuine
// WebDriver BiDi and never passes through this actor.
//
// A lease admits only a conservative static scope: a non-private, current,
// top-level text/html HTMLDocument without any form field, editable content,
// embedded frame or child browsing context, UA widget, native control family,
// non-HTML element or unknown node kind, inside fixed traversal limits. Native
// getters are read through Xrays only: no page getter, coercion or script
// runs and no field value is read (fields are refused by their tag alone).
//
// One MutationObserver watches the document and every author shadow root
// (open or closed) from before the walk descends into it, and every host's
// exact shadow root identity (null included) is kept. A delivered or pending
// record, a new or changed root, any changed scope, viewport, document or
// window global, a modal state, pagehide, or a readback preference that is not
// literally false at a check invalidates the lease for good. It never rescans
// to accept a clean final tree as a new baseline. This is privacy metadata for
// genuine BiDi, not an automation protocol: there is no selector, evaluation
// or screenshot message.
//
// The readback preference here is a conservative point check only. These
// checks alone cannot prove that it did not change and change back between
// them. The native capture is made by the parent's root BiDi module, whose
// own (parent) preference governs readback; AgentCaptureRuntime observes that
// preference for the whole operation, and that observation is what proves
// the ordering. No preference observer is registered in this process.
//
// BEGIN answers whether this child still retains anything for the token:
// `retained:false` with a refusal is a positive statement that nothing was
// allocated or that it was released again; `retained:true` with a refusal
// means a MutationObserver could not be disconnected and stays owned here
// until RELEASE disconnects it or the actor is destroyed.

export const AGENT_CAPTURE_ACTOR = "AxioSozoAgentCapture";
export const AGENT_CAPTURE_MESSAGES = Object.freeze({
  BEGIN: "AxioSozoAgentCapture:Begin",
  RECHECK: "AxioSozoAgentCapture:Recheck",
  RELEASE: "AxioSozoAgentCapture:Release",
});
// Proposed for root review (step8-capture-proof/design.md). Root freezes them.
export const CAPTURE_SCOPE_LIMITS = Object.freeze({ nodes: 4096, roots: 128, depth: 32, side: 16_384, pixels: 33_554_432 });
export const READBACK_PREF = "remote.screenshot.use_readback";
export const LEASE_TOKEN = /^cl_[0-9a-f]{32}$/u;

const HTML_NS = "http://www.w3.org/1999/xhtml";
const ELEMENT = 1, TEXT = 3, COMMENT = 8, DOCTYPE = 10;
// Fields (all types, hidden and former password inputs included), embedded
// frames, and native control families whose internal trees are unproved.
export const CAPTURE_DENIED_ELEMENTS = Object.freeze(["input", "textarea", "select", "option", "optgroup", "datalist", "output", "keygen",
  "iframe", "frame", "frameset", "object", "embed", "fencedframe", "portal", "applet",
  "audio", "video", "marquee", "details", "summary", "meter", "progress"]);
const DENIED_ELEMENTS = new Set(CAPTURE_DENIED_ELEMENTS);
const OBSERVE = Object.freeze({ childList: true, attributes: true, characterData: true, subtree: true, chromeOnlyNodes: true });
const RETIRED_TOKENS = 32;

class ScopeRefusal extends Error {
  constructor(reason) { super(reason); this.reason = reason; }
}
const refuse = reason => { throw new ScopeRefusal(reason); };

function chromeClassName(value) {
  try { return globalThis.ChromeUtils.getClassName(value); } catch { return null; }
}

/** Literal false only; a missing, non-boolean or unreadable preference is null. */
export function readReadbackPref(prefs = globalThis.Services?.prefs) {
  try { return prefs.getPrefType(READBACK_PREF) === prefs.PREF_BOOL ? prefs.getBoolPref(READBACK_PREF) : null; }
  catch { return null; }
}

/**
 * Native facts of the actor's own document, privacy and currentness first.
 * `scope`: { document, window, browsingContext, windowGlobal } read live from
 * the actor. Null for anything unknown, private, stale or out of scope.
 */
export function captureFacts(scope, { readPref = readReadbackPref, className = chromeClassName, limits = CAPTURE_SCOPE_LIMITS } = {}) {
  try {
    const { document, window, browsingContext: context, windowGlobal: global } = scope ?? {};
    if (!document || !window || !context || !global) return null;
    if (context.usePrivateBrowsing !== false || context.originAttributes?.privateBrowsingId !== 0) return null;
    if (global.isClosed !== false || global.isCurrentGlobal !== true || global.browsingContext !== context) return null;
    if (context.parent !== null || context.top !== context || context.isContent !== true || context.isDiscarded !== false) return null;
    // Embedded frames are refused rather than claimed: no native child at all.
    if (context.children?.length !== 0) return null;
    if (window.document !== document) return null;
    const principal = document.nodePrincipal;
    if (!principal || principal.isSystemPrincipal !== false || principal.isNullPrincipal !== false
      || principal.isContentPrincipal !== true || principal.privateBrowsingId !== 0) return null;
    if (document.contentType !== "text/html" || className(document) !== "HTMLDocument" || document.designMode !== "off") return null;
    const spec = document.documentURI;
    const url = typeof spec === "string" && spec.length <= 8192 ? URL.parse(spec) : null;
    if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    if (window.windowUtils?.isInModalState() !== false) return null;
    if (readPref() !== false) return null;
    const width = window.innerWidth, height = window.innerHeight, ratio = window.devicePixelRatio;
    if (![width, height, ratio].every(value => Number.isFinite(value) && value > 0)) return null;
    const deviceWidth = Math.ceil(width * ratio), deviceHeight = Math.ceil(height * ratio);
    if (deviceWidth > limits.side || deviceHeight > limits.side || deviceWidth * deviceHeight > limits.pixels) return null;
    return Object.freeze({ document, window, context, global, principal, spec, root: document.documentElement, width, height, ratio });
  } catch { return null; }
}

const sameFacts = (a, b) => !!a && !!b
  && ["document", "window", "context", "global", "principal", "spec", "root", "width", "height", "ratio"].every(key => a[key] === b[key]);

/**
 * One bounded synchronous walk of the document and every shadow root. With
 * `observe`, each newly met root is observed before the walk descends into
 * it. With `baseline` (a recheck), every element must already be known with
 * the identical shadow root; nothing new is adopted.
 */
export function scanCaptureScope(facts, { limits = CAPTURE_SCOPE_LIMITS, observe = null, baseline = null } = {}) {
  const hosts = new Map(), roots = [];
  let count = 0;
  function children(parent, depth) {
    for (let node = parent.firstChild; node; node = node.nextSibling) {
      if (++count > limits.nodes) refuse("NODE_LIMIT");
      const type = node.nodeType;
      if (type === TEXT || type === COMMENT) continue;
      if (type === DOCTYPE) { if (parent !== facts.document) refuse("UNKNOWN_NODE"); continue; }
      if (type !== ELEMENT) refuse("UNKNOWN_NODE");
      element(node, depth + 1);
    }
  }
  function element(node, depth) {
    if (depth > limits.depth) refuse("DEPTH_LIMIT");
    if (node.namespaceURI !== HTML_NS) refuse("NAMESPACE");
    const name = node.localName;
    if (typeof name !== "string" || DENIED_ELEMENTS.has(name)) refuse("SCOPE");
    if (node.isContentEditable !== false || node.hasAttribute("contenteditable") !== false) refuse("EDITABLE");
    const root = node.openOrClosedShadowRoot ?? null;
    if (baseline && (!baseline.has(node) || baseline.get(node) !== root)) refuse("CHANGED");
    hosts.set(node, root);
    if (root) {
      if (roots.length >= limits.roots) refuse("ROOT_LIMIT");
      if (root.isUAWidget() !== false || root.host !== node || !["open", "closed"].includes(root.mode)) refuse("UA_WIDGET");
      roots.push(root);
      observe?.(root);
      children(root, depth);
    }
    children(node, depth);
  }
  children(facts.document, 0);
  if (baseline && hosts.size !== baseline.size) refuse("CHANGED");
  return { hosts, roots, count };
}

/**
 * The child's single lease, independent of the actor so it can be tested
 * with injected native-shaped objects. `read()` returns the live native scope.
 * Tokens are parent correlation only: they grant nothing here.
 */
export function createCaptureLeaseKeeper({ read, readPref = readReadbackPref, className = chromeClassName, limits = CAPTURE_SCOPE_LIMITS } = {}) {
  if (typeof read !== "function") throw new TypeError("read");
  let lease = null;
  const retired = [];
  // Retired leases whose MutationObserver could not be disconnected: the exact
  // observer stays here until a release or destruction disconnects it. While
  // any is here, no new token begins.
  const uncertain = new Map();
  const facts = () => captureFacts(read(), { readPref, className, limits });
  /** Literal true once this entry's own MutationObserver is disconnected. */
  function disconnect(entry) {
    if (!entry.observer) return true;
    try { entry.observer.disconnect(); } catch { return false; }
    entry.observer = null;
    return true;
  }
  function invalidate(entry) {
    if (!entry || entry.invalid) return;
    entry.invalid = true;
    // Stop retaining records; an invalid lease never becomes valid again. A
    // failed disconnect is retried when the lease is retired.
    disconnect(entry);
  }
  function remember(token) {
    if (retired.includes(token)) return;
    retired.push(token);
    if (retired.length > RETIRED_TOKENS) retired.shift();
  }
  /** Literal true once nothing of this entry remains here. */
  function retire(entry) {
    if (!entry) return false;
    if (!entry.retired) {
      entry.retired = true;
      entry.invalid = true;
      entry.hosts = null; entry.roots = null;
      if (lease === entry) lease = null;
    }
    if (!disconnect(entry)) { uncertain.set(entry.token, entry); return false; }
    uncertain.delete(entry.token);
    remember(entry.token);
    return true;
  }
  /** A refusal, with whether anything of this token is still retained here. A
   * token that allocated nothing is remembered, so a RELEASE of it answers
   * released:true at once. */
  function refused(token) {
    const retained = uncertain.has(token) || (!!lease && lease.token === token);
    if (!retained && token !== null) remember(token);
    return Object.freeze({ ok: false, retained });
  }
  const failed = entry => Object.freeze({ ok: false, retained: !retire(entry) });
  /** Pending records are read independently of callback delivery. */
  function drain(entry) {
    if (entry.invalid) return false;
    try { if (entry.observer.takeRecords().length !== 0) invalidate(entry); } catch { invalidate(entry); }
    return !entry.invalid;
  }
  function check(entry) {
    if (!entry || entry.invalid || entry.retired || !drain(entry)) return false;
    const now = facts();
    if (!sameFacts(entry.facts, now)) { invalidate(entry); return false; }
    try {
      const result = scanCaptureScope(now, { limits, baseline: entry.hosts });
      if (result.count !== entry.count || result.roots.length !== entry.roots.length
        || result.roots.some((root, index) => root !== entry.roots[index])) refuse("CHANGED");
    } catch { invalidate(entry); return false; }
    if (!drain(entry) || !sameFacts(entry.facts, facts())) { invalidate(entry); return false; }
    return !entry.invalid;
  }
  return Object.freeze({
    /** { ok, retained }: ok only with a held lease; a refusal says whether
     * anything of this token is still retained here. */
    begin(token) {
      if (typeof token !== "string" || !LEASE_TOKEN.test(token)) return refused(null);
      // One active lease per document: a busy keeper refuses, never replaces.
      // A new token never begins while an earlier observer is still owned.
      if (lease || uncertain.size !== 0 || retired.includes(token)) return refused(token);
      // Native facts and the literal-false preference point check come first:
      // a refusal here has allocated nothing.
      const first = facts();
      if (!first) return refused(token);
      const entry = { token, facts: first, observer: null, hosts: null, roots: null, count: 0, invalid: false, retired: false };
      lease = entry;
      try {
        // The document observer exists before the walk; each root's before its subtree.
        const observer = new first.window.MutationObserver(() => invalidate(entry));
        entry.observer = observer;
        observer.observe(first.document, OBSERVE);
        const result = scanCaptureScope(first, { limits, observe: root => observer.observe(root, OBSERVE) });
        entry.hosts = result.hosts; entry.roots = result.roots; entry.count = result.count;
      } catch { return failed(entry); }
      if (!drain(entry) || !sameFacts(first, facts())) return failed(entry);
      return Object.freeze({ ok: true, retained: true });
    },
    recheck(token) {
      return !!lease && lease.token === token && check(lease);
    },
    /** commit:true validates and retires in this one synchronous turn. An
     * invalid lease is retired too, but never committed; a lease whose
     * observer is still connected is neither released nor committed. */
    release(token, commit) {
      const entry = lease;
      if (entry && entry.token === token) {
        const committed = commit === true && check(entry);
        const released = retire(entry);
        return Object.freeze({ released, committed: committed && released });
      }
      const held = uncertain.get(token);
      if (held) return Object.freeze({ released: retire(held), committed: false });
      return Object.freeze({ released: retired.includes(token), committed: false });
    },
    invalidate() { invalidate(lease); },
    destroy() { retire(lease); for (const entry of [...uncertain.values()]) retire(entry); },
    state: () => Object.freeze({ active: !!lease, invalid: !!lease?.invalid, retired_tokens: retired.length, cleanup_uncertain: uncertain.size }),
  });
}

const tokenOf = data => {
  const fields = data && typeof data === "object" ? Object.keys(data) : null;
  return fields && data.v === 1 && typeof data.token === "string" && LEASE_TOKEN.test(data.token) ? data.token : null;
};

const Base = globalThis.JSWindowActorChild ?? class {};

export class AgentCaptureChild extends Base {
  #keeper = null;

  #lease() {
    this.#keeper ??= createCaptureLeaseKeeper({
      read: () => ({ document: this.document, window: this.contentWindow, browsingContext: this.browsingContext, windowGlobal: this.manager }),
    });
    return this.#keeper;
  }

  // Registered with createActor:false: only an existing actor hears it.
  handleEvent(event) {
    if (event?.type === "pagehide") this.#keeper?.invalidate();
  }

  receiveMessage(message) {
    const data = message?.data;
    const token = tokenOf(data);
    if (!token) return null;
    switch (message.name) {
      case AGENT_CAPTURE_MESSAGES.BEGIN: {
        if (Object.keys(data).length !== 2) return null;
        const result = this.#lease().begin(token);
        return { v: 1, token, ok: result.ok === true, retained: result.retained !== false };
      }
      case AGENT_CAPTURE_MESSAGES.RECHECK:
        if (Object.keys(data).length !== 2) return null;
        return { v: 1, token, ok: this.#keeper?.recheck(token) === true };
      case AGENT_CAPTURE_MESSAGES.RELEASE: {
        if (Object.keys(data).length !== 3 || typeof data.commit !== "boolean") return null;
        const result = this.#keeper?.release(token, data.commit) ?? { released: false, committed: false };
        return { v: 1, token, released: result.released === true, committed: result.committed === true };
      }
      default:
        return null;
    }
  }

  didDestroy() {
    this.#keeper?.destroy();
    this.#keeper = null;
  }
}

// JSWindowActor looks up `${actorName}Child` in esModuleURI.
export { AgentCaptureChild as AxioSozoAgentCaptureChild };
