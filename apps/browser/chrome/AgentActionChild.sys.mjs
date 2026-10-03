/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Child side of the AxioSozoAgentAction JSWindowActor (Plan 4 step 8, P4 act
// tools). It never clicks, types, navigates or opens anything. It answers
// three fixed parent queries for its own current top-level document:
//
// - admit: read-only native admission before a document is bound (normal,
//   current, top-level, credential-free http(s), no child browsing context,
//   no current or former password field anywhere in the walked trees);
// - install: a one-use privileged check function, exported into the exact
//   private BiDi sandbox of the request's own native WebDriver session and
//   realm (looked up, never created). The fixed, Claude-authored effect source
//   (AgentActionRuntime) calls it synchronously immediately before its one
//   effect; nothing awaits or runs page code in between;
// - revoke: retires that check for good.
//
// The check compares the original Document, the exact approved URL, the
// current window global, privacy, frames, password history and the concrete
// target, then consumes itself. It reads no field value: fields are judged by
// tag, type and chrome-only password history only. Page code cannot reach the
// sandbox, the check or this actor. Unknown facts refuse. All of this stays
// unused until root accepts native proof and enables an act capability.
import { ACT_BOUNDARY_SANDBOX } from "./AgentActBoundary.sys.mjs";

export const AGENT_ACTION_ACTOR = "AxioSozoAgentAction";
export const AGENT_ACTION_MESSAGES = Object.freeze({
  ADMIT: "AxioSozoAgentAction:Admit",
  INSTALL: "AxioSozoAgentAction:Install",
  REVOKE: "AxioSozoAgentAction:Revoke",
});
// The exact sandbox global name the fixed sources call; never page-visible.
export const ACTION_GATE_NAME = "axiosozoActGate";
export const ACTION_TOKEN = /^ag_[0-9a-f]{32}$/u;
export const ACTION_SCOPE_LIMITS = Object.freeze({ nodes: 4096, roots: 128, depth: 32 });
const HTML_NS = "http://www.w3.org/1999/xhtml";
const METHODS = new Set(["page.click", "page.type", "tabs.navigate"]);
// Plain targets with native behaviour only; fields, labels, frames and
// custom or customized elements are refused.
const CLICK_TARGETS = new Set(["a", "button", "div", "span", "p", "li", "img"]);
const TEXT_TYPES = new Set(["text", "search", "url", "email", "tel"]);
const CREDENTIAL_HINT = /password|one-time-code|cc-|webauthn/iu;
const FRAMES = new Set(["iframe", "frame", "frameset", "object", "embed", "fencedframe", "portal", "applet"]);

/** Normal, current, top-level, credential-free http(s) at exactly `url`. */
export function actionDocumentFacts({ document, window, browsingContext: context, windowGlobal: global } = {}, url) {
  try {
    if (!document || !window || !context || !global || window.document !== document) return null;
    if (context.usePrivateBrowsing !== false || context.originAttributes?.privateBrowsingId !== 0) return null;
    if (global.isClosed !== false || global.isCurrentGlobal !== true || global.browsingContext !== context) return null;
    if (context.parent !== null || context.top !== context || context.isContent !== true || context.children?.length !== 0) return null;
    const principal = document.nodePrincipal;
    if (!principal || principal.isSystemPrincipal !== false || principal.isNullPrincipal !== false
      || principal.isContentPrincipal !== true || principal.privateBrowsingId !== 0) return null;
    const spec = document.documentURI;
    const parsed = typeof spec === "string" && spec.length <= 8192 ? URL.parse(spec) : null;
    if (!parsed || !["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || spec !== url) return null;
    if (document.designMode !== "off" || window.windowUtils?.isInModalState() !== false) return null;
    return { document, window, context, global, principal, spec };
  } catch { return null; }
}

/** One bounded walk (document and every shadow root): false for any frame,
 * any input that is or ever was a password field, or an unknown/over-limit
 * tree. Values are never read. */
export function passwordFree(document, limits = ACTION_SCOPE_LIMITS) {
  let count = 0, roots = 0;
  const walk = (parent, depth) => {
    for (let node = parent.firstChild; node; node = node.nextSibling) {
      if (++count > limits.nodes) return false;
      if (node.nodeType !== 1) continue;
      if (depth >= limits.depth) return false;
      const name = node.localName;
      if (node.namespaceURI === HTML_NS && FRAMES.has(name)) return false;
      if (node.namespaceURI === HTML_NS && name === "input" && (node.hasBeenTypePassword !== false || node.type === "password")) return false;
      const root = node.openOrClosedShadowRoot ?? null;
      if (root) {
        if (++roots > limits.roots || root.isUAWidget() !== false) return false;
        if (!walk(root, depth + 1)) return false;
      }
      if (!walk(node, depth + 1)) return false;
    }
    return true;
  };
  try { return walk(document, 0); } catch { return false; }
}

/** The concrete target of one approved effect, judged without its value. */
export function safeActionTarget(method, target, document) {
  try {
    if (method === "tabs.navigate") return target === null;
    if (!target || target.nodeType !== 1 || target.namespaceURI !== HTML_NS || target.isConnected !== true
      || target.ownerDocument !== document || target.getRootNode() !== document) return false;
    const name = target.localName;
    // Custom and customized built-in elements can redefine behaviour.
    if (name.includes("-") || target.hasAttribute("is") || target.isContentEditable !== false) return false;
    if (method === "page.click") return CLICK_TARGETS.has(name) && !target.closest("label");
    if (method !== "page.type" || target.disabled !== false || target.readOnly !== false) return false;
    if (CREDENTIAL_HINT.test(target.getAttribute("autocomplete") ?? "")) return false;
    if (name === "textarea") return true;
    return name === "input" && target.hasBeenTypePassword === false && TEXT_TYPES.has(target.type);
  } catch { return false; }
}

/**
 * The one-use check for one request. `read()` returns the live native scope.
 * Bound to its original document, URL, method, selector and destination; the
 * fixed source passes only the original document handle, the URL, the
 * resolved target and the destination it was given.
 */
export function createActionGate({ read, original, url, method, destination = null }) {
  let used = false, revoked = false;
  const check = (document, approvedUrl, target, kind, next = null) => {
    if (used || revoked) return false;
    used = true; // One attempt, successful or not.
    try {
      if (kind !== method || document !== original || approvedUrl !== url || (method === "tabs.navigate" && next !== destination)) return false;
      const facts = actionDocumentFacts(read(), url);
      if (!facts || facts.document !== original || !passwordFree(original)) return false;
      return safeActionTarget(method, target, original);
    } catch { return false; }
  };
  return Object.freeze({ check, revoke: () => { revoked = true; }, get used() { return used; }, get revoked() { return revoked; } });
}

const shaped = (data, fields) => !!data && typeof data === "object" && data.v === 1 && typeof data.token === "string"
  && ACTION_TOKEN.test(data.token) && Object.keys(data).length === fields.length && fields.every(name => Object.hasOwn(data, name));

const Base = globalThis.JSWindowActorChild ?? class {};

export class AgentActionChild extends Base {
  #gates = new Map();

  #scope() {
    return { document: this.document, window: this.contentWindow, browsingContext: this.browsingContext, windowGlobal: this.manager };
  }

  receiveMessage(message) {
    const data = message?.data;
    switch (message?.name) {
      case AGENT_ACTION_MESSAGES.ADMIT: {
        if (!shaped(data, ["v", "token", "url"])) return null;
        const facts = actionDocumentFacts(this.#scope(), data.url);
        return { v: 1, token: data.token, ok: !!facts && passwordFree(facts.document) };
      }
      case AGENT_ACTION_MESSAGES.INSTALL:
        if (!shaped(data, ["v", "token", "session", "realm", "method", "url", "destination"])) return null;
        return { v: 1, token: data.token, installed: this.#install(data) };
      case AGENT_ACTION_MESSAGES.REVOKE: {
        if (!shaped(data, ["v", "token"])) return null;
        this.#gates.get(data.token)?.revoke();
        this.#gates.delete(data.token);
        return { v: 1, token: data.token, revoked: true };
      }
      default:
        return null;
    }
  }

  /** Only the request's own existing session handler and realm; the realm must
   * be its named sandbox in this browsing context. Nothing is created here. */
  #install({ token, session, realm, method, url, destination }) {
    try {
      if (this.#gates.size || !METHODS.has(method) || typeof session !== "string" || typeof realm !== "string"
        || (method === "tabs.navigate") !== (typeof destination === "string")) return false;
      const facts = actionDocumentFacts(this.#scope(), url);
      if (!facts || !passwordFree(facts.document)) return false;
      const frame = this.manager.getExistingActor("MessageHandlerFrame");
      const handler = frame?._registry?.getExistingMessageHandler(session);
      if (!handler) return false;
      const found = handler.getRealm({ realmId: realm });
      const info = found?.getInfo();
      if (!found || found.isSandbox !== true || info?.sandbox !== ACT_BOUNDARY_SANDBOX || info.context !== this.browsingContext) return false;
      const sandbox = found.globalObject;
      const gate = createActionGate({ read: () => this.#scope(), original: facts.document, url, method,
        destination: method === "tabs.navigate" ? destination : null });
      Cu.exportFunction(gate.check, sandbox, { defineAs: ACTION_GATE_NAME });
      this.#gates.set(token, gate);
      return true;
    } catch { return false; }
  }

  didDestroy() {
    for (const gate of this.#gates.values()) gate.revoke();
    this.#gates.clear();
  }
}

export { AgentActionChild as AxioSozoAgentActionChild };
