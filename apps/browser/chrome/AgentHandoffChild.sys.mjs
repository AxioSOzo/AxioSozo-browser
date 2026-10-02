/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Child side of the AxioSozoHandoff JSWindowActor (P3 "Send to agent",
// workstation-v1 §5.1). It runs in a web content process for a top-level
// http(s) document and only answers two bounded queries that trusted chrome
// sends after a trusted user action: a precheck (privacy facts only) and a
// capture (title and, when the user opted in, the document selection). It
// never sends anything on its own, never reaches subframes and never reads a
// form value. Every fact comes from native (Xray) getters of this.document,
// never from page script, and is checked against the exact window global,
// inner window and URL the parent captured. Unknown facts deny.

export const HANDOFF_MESSAGES = Object.freeze({
  PRECHECK: "AxioSozoHandoff:Precheck",
  CAPTURE: "AxioSozoHandoff:Capture",
});
export const HANDOFF_CHILD_LIMITS = Object.freeze({ title: 512, selection: 16384, inputs: 4096, ranges: 64, focusDepth: 32 });
const XHTML = "http://www.w3.org/1999/xhtml";
const deny = reason => ({ ok: false, reason });

/** One line of text: controls become spaces, unpaired surrogates U+FFFD, and
 * the result is cut to `max` UTF-16 units without splitting a pair. */
export function handoffLine(value, max = HANDOFF_CHILD_LIMITS.title) {
  if (typeof value !== "string") return "";
  return cut(wellFormed(value.slice(0, max * 2)).replace(/[\u0000-\u001f\u007f-\u009f]+/gu, " ").replace(/ {2,}/gu, " ").trim(), max);
}

/** Selected prose: line breaks and tabs kept (CRLF/CR become LF), other
 * controls dropped, unpaired surrogates U+FFFD, cut to `max` units. */
export function handoffProse(value, max = HANDOFF_CHILD_LIMITS.selection) {
  if (typeof value !== "string") return "";
  return cut(wellFormed(value.slice(0, max * 2)).replace(/\r\n?/gu, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/gu, ""), max);
}

function wellFormed(text) {
  return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/gu, "�");
}
function cut(text, max) {
  if (text.length <= max) return text;
  const end = /[\uD800-\uDBFF]/u.test(text[max - 1]) ? max - 1 : max;
  return text.slice(0, end);
}

/** An HTML input that is, or ever was, a password field. Anything unknown
 * about an HTML input counts as one. */
function passwordControl(element) {
  try {
    if (element?.localName !== "input" || element.namespaceURI !== XHTML) return false;
    return element.hasBeenTypePassword !== false;
  } catch { return true; }
}

// Focus inside one of these is in another document, which is never traversed:
// what is focused there cannot be told, so it counts as unknown.
const EMBEDDING = new Set(["iframe", "frame", "embed", "object", "fencedframe"]);

/** true / false, or null when it cannot be told within the bounds. The
 * focused element is followed into open and closed shadow roots; a focused
 * node still left when the depth bound is used up, or focus inside a frame,
 * embed or object, is unknown. Light DOM inputs of the top document are
 * checked without reading any value. */
export function handoffPasswordRisk(document) {
  try {
    let focused = document.activeElement;
    for (let depth = 0; focused; depth++) {
      if (depth >= HANDOFF_CHILD_LIMITS.focusDepth) return null;
      if (passwordControl(focused)) return true;
      if (EMBEDDING.has(focused.localName)) return null;
      const inner = focused.openOrClosedShadowRoot?.activeElement ?? null;
      if (!inner || inner === focused) break;
      focused = inner;
    }
    const inputs = document.querySelectorAll("input");
    if (!Number.isSafeInteger(inputs.length) || inputs.length > HANDOFF_CHILD_LIMITS.inputs) return null;
    for (let index = 0; index < inputs.length; index++) if (passwordControl(inputs[index])) return true;
    return false;
  } catch { return null; }
}

function selectionOf(document) {
  const selection = document.getSelection();
  if (!selection) return { has: false, ranges: 0, selection: null };
  const ranges = selection.rangeCount;
  if (!Number.isSafeInteger(ranges) || ranges < 0 || ranges > HANDOFF_CHILD_LIMITS.ranges) return null;
  // Only ranges of this very document: no other document, no subframe.
  for (let index = 0; index < ranges; index++) {
    const range = selection.getRangeAt(index);
    for (const node of [range.startContainer, range.endContainer]) {
      if (node !== document && node?.ownerDocument !== document) return null;
    }
  }
  return { has: ranges > 0 && selection.isCollapsed === false, ranges, selection };
}

/**
 * The whole answer for one query, synchronously (nothing on the page runs in
 * between). `actor` is { manager, browsingContext, document }; `data` is the
 * parent's { url, inner_window_id, include_selection? }. Privacy and current
 * document checks come before the title or the selection is touched.
 */
export function inspectHandoffDocument(actor, data, mode) {
  try {
    if (mode !== "precheck" && mode !== "capture") return deny("INVALID_REQUEST");
    if (!data || typeof data !== "object" || typeof data.url !== "string" || data.url.length > 8192
      || !Number.isSafeInteger(data.inner_window_id) || data.inner_window_id < 1) return deny("INVALID_REQUEST");
    if (mode === "capture" && typeof data.include_selection !== "boolean") return deny("INVALID_REQUEST");
    const manager = actor.manager, context = actor.browsingContext;
    if (!manager || manager.isClosed !== false || manager.isCurrentGlobal !== true || manager.innerWindowId !== data.inner_window_id)
      return deny("STALE_TAB");
    if (!context || context.parent !== null || context.top !== context) return deny("STALE_TAB");
    // this.document, never contentWindow: the window proxy can already point
    // at a newer document of the same browsing context.
    const document = actor.document;
    if (!document || document.documentURI !== data.url) return deny("STALE_TAB");
    const principal = document.nodePrincipal;
    if (!principal || principal.isSystemPrincipal !== false || principal.isNullPrincipal !== false
      || principal.isContentPrincipal !== true || principal.privateBrowsingId !== 0) return deny("PRIVATE");
    if (!(principal.schemeIs("http") || principal.schemeIs("https"))) return deny("INVALID_INPUT");
    const risk = handoffPasswordRisk(document);
    if (risk !== false) return { ok: true, url: data.url, inner_window_id: data.inner_window_id, password_risk: true };
    const found = selectionOf(document);
    if (!found) return deny("OBSERVATION_MISMATCH");
    if (mode === "precheck") {
      return { ok: true, url: data.url, inner_window_id: data.inner_window_id, password_risk: false, has_selection: found.has };
    }
    const title = handoffLine(document.title);
    const selection = data.include_selection && found.has ? handoffProse(found.selection.toString()) || null : null;
    return { ok: true, url: data.url, inner_window_id: data.inner_window_id, password_risk: false, title, selection };
  } catch { return deny("OBSERVATION_MISMATCH"); }
}

const Base = globalThis.JSWindowActorChild ?? class {};

export class AgentHandoffChild extends Base {
  receiveMessage(message) {
    const mode = message?.name === HANDOFF_MESSAGES.PRECHECK ? "precheck"
      : message?.name === HANDOFF_MESSAGES.CAPTURE ? "capture" : null;
    let document = null;
    try { document = this.document; } catch { document = null; }
    return inspectHandoffDocument({ manager: this.manager, browsingContext: this.browsingContext, document }, message?.data, mode);
  }
}

// JSWindowActor looks up `${actorName}Child` (ACTOR "AxioSozoHandoff").
export { AgentHandoffChild as AxioSozoHandoffChild };
