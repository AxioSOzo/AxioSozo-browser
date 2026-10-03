/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Child side of the ConsoleErrors JSWindowActor (Plan 4 step 7, P5). One
// instance per top-level http(s) document (a WindowGlobalChild); every fact
// comes from its own native manager, browsing context and `this.document`,
// never from contentWindow or page script.
//
// The protocol never lets a page decide anything:
// 1. Readiness: after a document event (or a parent Restart) the child asks
//    its parent once; the answer is metadata only and grants no future
//    password fact.
// 2. A native ConsoleAPI or nsIScriptError notification passes cheap native
//    gates first (this document's inner window, not private, not chrome,
//    error or warning, not before the readiness floor) and the shared budget
//    (20 a second, 500 a document). Nothing of its source, text, arguments,
//    stack, exception or styles is read. At most one raw notification is held,
//    for 500 ms; the parent gets only { v, offer_id, document_id, observed_at }.
// 3. Only the parent's exact challenge for that offer reads anything: the
//    pending reference is consumed, native facts and the event's metadata are
//    checked again, then the actual handoffPasswordRisk(this.document) gate,
//    then, in the same synchronous step, a bounded copy of primitives only.
//    The raw reference is dropped in `finally`, whatever happened.
// Remote and in-process documents use this same path; there is no parent
// Services.console observer and no ConsoleAPI cache replay.
import { consoleDocumentId, consoleNavigationToken, consolePrimitiveText, consoleWebURL, sanitizeConsoleText,
  MAX_CONSOLE_SOURCE } from "./ConsoleErrors.sys.mjs";
import { handoffPasswordRisk } from "./AgentHandoffChild.sys.mjs";

export const CONSOLE_ACTOR = "ConsoleErrors";
export const CONSOLE_MESSAGES = Object.freeze({
  AUTHORIZE: "ConsoleErrors:Authorize",
  OFFER: "ConsoleErrors:Offer",
  CAPTURE: "ConsoleErrors:Capture",
  RESTART: "ConsoleErrors:Restart",
  STOP: "ConsoleErrors:Stop",
});
// readiness: readiness requests one document may make in its lifetime
// (document events and parent restarts together); one is in flight at most.
export const CONSOLE_CHILD_LIMITS = Object.freeze({ perSecond: 20, perDocument: 500, pendingMs: 500, readiness: 256 });
const MAX_RAW_SOURCE = 16384;
const freeze = Object.freeze;
const own = (object, name) => {
  if (object === null || (typeof object !== "object" && typeof object !== "function")) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(object, name);
  return descriptor && Object.hasOwn(descriptor, "value") ? descriptor.value : undefined;
};
/** Own data fields of a structured-cloned message, exactly `keys`, or null. */
function exact(value, keys) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Object.keys(descriptors).length !== keys.length || keys.some(key => !descriptors[key] || !Object.hasOwn(descriptors[key], "value"))) return null;
  return Object.fromEntries(keys.map(key => [key, descriptors[key].value]));
}
const ID = /^[A-Za-z0-9_-]{1,64}$/u;
let offerSerial = 0;

/** A source as the packet may carry it: "" or a credential-free http(s) URL
 * without query or fragment, at most 2048 units; anything else (privileged,
 * internal, file, extension, data, blob, malformed, controls, oversized) is
 * refused rather than cut. */
export function consoleCaptureSource(value) {
  if (value === "") return "";
  if (typeof value !== "string" || value.length > MAX_RAW_SOURCE) return null;
  const url = consoleWebURL(value);
  if (!url) return null;
  url.username = ""; url.password = ""; url.search = ""; url.hash = "";
  return url.href.length <= MAX_CONSOLE_SOURCE ? url.href : null;
}
const lineOf = value => (Number.isInteger(value) && value >= 0 && value <= 0xffffffff ? value : 0);

/** Metadata of a ConsoleAPI event, read from own data properties only (no
 * getter, stack, styles or arguments), or null for anything but an error or
 * warning of a non-private, non-chrome, non-add-on window. */
export function consoleApiMetadata(event) {
  try {
    const level = own(event, "level"), at = own(event, "timeStamp"), inner = own(event, "innerID");
    if (own(event, "private") !== false || own(event, "chromeContext") !== false || own(event, "addonId") !== ""
      || (level !== "error" && level !== "warn") || !Number.isFinite(at) || at < 0
      || !Number.isSafeInteger(inner) || inner < 1) return null;
    return freeze({ kind: "api", inner, level, at });
  } catch { return null; }
}

/** Metadata of an nsIScriptError through its native getters only (never its
 * message, source, exception or stack), or null. CSS parser and loader
 * warnings are not console errors of the page's scripts. */
export function consoleScriptMetadata(error) {
  try {
    const flags = error.flags, at = error.timeStamp, inner = error.innerWindowID, category = error.category;
    if (error.isFromPrivateWindow !== false || error.isFromChromeContext !== false || (flags !== 0 && flags !== 1)
      || !Number.isFinite(at) || at < 0 || !Number.isSafeInteger(inner) || inner < 1
      || (typeof category === "string" && category.startsWith("CSS"))) return null;
    return freeze({ kind: "script", inner, level: flags === 1 ? "warn" : "error", at });
  } catch { return null; }
}
const sameMetadata = (a, b) => !!a && !!b && a.kind === b.kind && a.inner === b.inner && a.level === b.level && a.at === b.at;

/** The parent's readiness answer: { enabled: false } or exactly
 * { enabled: true, document_id, navigation_token, not_before }. */
function readinessOf(value) {
  const ready = exact(value, ["enabled", "document_id", "navigation_token", "not_before"]);
  if (!ready || ready.enabled !== true || typeof ready.document_id !== "string" || consoleDocumentId(ready.document_id) !== ready.document_id
    || !consoleNavigationToken(ready.navigation_token) || !Number.isSafeInteger(ready.not_before) || ready.not_before < 0) return null;
  return ready;
}
function challengeOf(value) {
  const challenge = exact(value, ["v", "lease_id", "offer_id", "document_id", "navigation_token", "not_before", "url"]);
  if (!challenge || challenge.v !== 1 || typeof challenge.lease_id !== "string" || !ID.test(challenge.lease_id)
    || typeof challenge.offer_id !== "string" || !ID.test(challenge.offer_id) || typeof challenge.document_id !== "string"
    || !consoleNavigationToken(challenge.navigation_token) || !Number.isSafeInteger(challenge.not_before) || challenge.not_before < 0
    || typeof challenge.url !== "string" || !consoleWebURL(challenge.url)) return null;
  return challenge;
}

/**
 * The actor class over injected natives, so Node tests run the exact logic
 * over synthetic managers, documents and notifications. `getStorage()` →
 * nsIConsoleAPIStorage, `getSystemPrincipal()`, `getScriptConsole()` →
 * nsIConsoleService, `asScriptError(message)` → nsIScriptError or null,
 * `generateQI(names)`, `timers`, `clock()` → epoch ms, `passwordRisk(document)`.
 */
export function createConsoleErrorsChildClass({ Base, clock = () => Date.now(), timers, getStorage, getSystemPrincipal,
  getScriptConsole, asScriptError, generateQI, passwordRisk = handoffPasswordRisk } = {}) {
  return class ConsoleErrorsChildActor extends Base {
    #disposed = false;
    // Every Stop, Restart and destruction moves the generation: readiness
    // answers and offers of an earlier one change nothing.
    #generation = 0;
    #ready = null;
    #starting = false;
    #again = false;
    #attempts = 0;
    #budget = { at: null, recent: 0, total: 0 };
    #pending = null;
    #storage = null; #apiListener = null; #scriptConsole = null; #scriptListener = null;

    handleEvent(event) {
      const type = event?.type;
      if (type === "DOMDocElementInserted" || type === "DOMContentLoaded" || type === "pageshow") this.#requestReadiness();
    }

    receiveMessage(message) {
      switch (message?.name) {
        case CONSOLE_MESSAGES.CAPTURE: return this.#capture(message.data);
        case CONSOLE_MESSAGES.STOP: this.#stop(); return undefined;
        case CONSOLE_MESSAGES.RESTART: this.#stop(); this.#requestReadiness(); return undefined;
        default: return undefined;
      }
    }

    didDestroy() {
      this.#disposed = true;
      this.#stop();
    }

    /** Native top-level, current, non-private facts of this actor's own
     * window global, read before anything of its document. */
    #native() {
      try {
        const manager = this.manager, context = this.browsingContext;
        if (!manager || manager.isClosed !== false || manager.isCurrentGlobal !== true) return null;
        const inner = manager.innerWindowId;
        if (!Number.isSafeInteger(inner) || inner < 1) return null;
        if (!context || context.parent !== null || context.top !== context || context.isContent !== true || context.isDiscarded !== false
          || context.usePrivateBrowsing !== false || context.originAttributes?.privateBrowsingId !== 0) return null;
        return { manager, inner, document_id: String(inner) };
      } catch { return null; }
    }

    /** This document: a non-error http(s) document of a content, non-null,
     * non-system, non-private principal. Only after #native(). */
    #documentFacts() {
      try {
        if (this.docShell?.failedChannel) return null;
        const document = this.document;
        if (!document) return null;
        const principal = document.nodePrincipal;
        if (!principal || principal.isSystemPrincipal !== false || principal.isNullPrincipal !== false
          || principal.isContentPrincipal !== true || principal.privateBrowsingId !== 0
          || !(principal.schemeIs("http") || principal.schemeIs("https"))) return null;
        const url = consoleWebURL(document.documentURI);
        if (!url || url.username || url.password) return null;
        return { document, url: url.href };
      } catch { return null; }
    }

    async #requestReadiness() {
      if (this.#disposed || this.#ready) return;
      if (this.#starting) { this.#again = true; return; }
      if (this.#attempts >= CONSOLE_CHILD_LIMITS.readiness) return;
      const native = this.#native();
      if (!native || !this.#documentFacts()) return;
      this.#attempts++;
      this.#starting = true;
      this.#again = false;
      const generation = this.#generation;
      let answer = null;
      try { answer = await this.sendQuery(CONSOLE_MESSAGES.AUTHORIZE, { v: 1 }); } catch { answer = null; }
      if (generation !== this.#generation) return; // stopped meanwhile: that stop ended this attempt
      this.#starting = false;
      const ready = readinessOf(answer);
      const now = this.#native();
      if (!this.#disposed && ready && now && now.manager === native.manager && ready.document_id === now.document_id && this.#documentFacts()) {
        this.#ready = freeze({ ...ready, inner: now.inner, generation });
        this.#listen();
        return;
      }
      if (this.#again) this.#requestReadiness();
    }

    /** One ConsoleAPI and one script error listener per document at most. */
    #listen() {
      if (!this.#apiListener) {
        try {
          const storage = getStorage();
          // Console.cpp gives each event a wrappedJSObject self-reference.
          const listener = message => {
            const event = own(message, "wrappedJSObject") ?? message;
            this.#observe(consoleApiMetadata(event), event);
          };
          storage.addLogEventListener(listener, getSystemPrincipal());
          this.#storage = storage; this.#apiListener = listener;
        } catch { this.#storage = null; this.#apiListener = null; }
      }
      if (!this.#scriptListener) {
        try {
          const service = getScriptConsole();
          const listener = { QueryInterface: generateQI(["nsIConsoleListener"]), observe: message => {
            let error = null;
            try { error = asScriptError(message); } catch { error = null; }
            if (error) this.#observe(consoleScriptMetadata(error), error);
          } };
          service.registerListener(listener);
          this.#scriptConsole = service; this.#scriptListener = listener;
        } catch { this.#scriptConsole = null; this.#scriptListener = null; }
      }
    }

    #unlisten() {
      try { if (this.#apiListener) this.#storage?.removeLogEventListener(this.#apiListener); } catch {}
      try { if (this.#scriptListener) this.#scriptConsole?.unregisterListener(this.#scriptListener); } catch {}
      this.#storage = null; this.#apiListener = null; this.#scriptConsole = null; this.#scriptListener = null;
    }

    /** Shared budget of this document across script errors and ConsoleAPI,
     * charged before any payload exists; a clock that steps back refuses. */
    #charge() {
      const now = clock(), budget = this.#budget;
      if (!Number.isSafeInteger(now) || now < 0 || (budget.at !== null && now < budget.at)) return false;
      if (budget.at === null || now - budget.at >= 1000) { budget.at = now; budget.recent = 0; }
      if (budget.recent >= CONSOLE_CHILD_LIMITS.perSecond || budget.total >= CONSOLE_CHILD_LIMITS.perDocument) return false;
      budget.recent++; budget.total++;
      return true;
    }

    /** A native notification: cheap gates, budget, then at most one held
     * reference and a metadata-only offer. */
    #observe(meta, raw) {
      const ready = this.#ready;
      if (this.#disposed || !ready || !meta || meta.inner !== ready.inner || meta.at < ready.not_before) return;
      const native = this.#native();
      if (!native || native.inner !== ready.inner) return;
      if (!this.#charge() || this.#pending) return; // extras are dropped, never queued
      const now = clock();
      if (!Number.isSafeInteger(now)) return;
      const pending = { offer_id: `co_${++offerSerial}`, raw, meta, generation: this.#generation, created: now,
        deadline: now + CONSOLE_CHILD_LIMITS.pendingMs, timer: null };
      this.#pending = pending;
      try { pending.timer = timers.setTimeout(() => this.#release(pending), CONSOLE_CHILD_LIMITS.pendingMs); }
      catch { this.#release(pending); return; }
      try { this.sendAsyncMessage(CONSOLE_MESSAGES.OFFER, { v: 1, offer_id: pending.offer_id, document_id: ready.document_id, observed_at: meta.at }); }
      catch { this.#release(pending); }
    }

    /** Drops a held notification: never kept past its deadline, Stop, Restart or destruction. */
    #release(pending) {
      if (!pending) return;
      if (this.#pending === pending) this.#pending = null;
      try { if (pending.timer !== null) timers.clearTimeout(pending.timer); } catch {}
      pending.timer = null;
      pending.raw = null;
    }

    /** The parent's challenge for the one held offer. Everything below is one
     * synchronous step: no await, page callback or coercion between the
     * capture-time password gate and the primitive copy. */
    #capture(data) {
      const challenge = challengeOf(data);
      if (!challenge) return null;
      const refusal = freeze({ v: 1, lease_id: challenge.lease_id, offer_id: challenge.offer_id, packet: null });
      const pending = this.#pending;
      if (!pending || pending.offer_id !== challenge.offer_id) return refusal;
      let raw = pending.raw;
      this.#release(pending); // consumed once, whatever follows
      try {
        const ready = this.#ready;
        if (this.#disposed || !raw || !ready || pending.generation !== this.#generation || ready.generation !== this.#generation) return refusal;
        const now = clock();
        if (!Number.isSafeInteger(now) || now < pending.created || now > pending.deadline) return refusal;
        if (challenge.document_id !== ready.document_id || pending.meta.at < challenge.not_before) return refusal;
        const native = this.#native();
        if (!native || native.inner !== ready.inner) return refusal;
        const facts = this.#documentFacts();
        if (!facts || facts.url !== challenge.url) return refusal;
        // The notification object is not promised immutable: its metadata again.
        const again = pending.meta.kind === "api" ? consoleApiMetadata(raw) : consoleScriptMetadata(raw);
        if (!sameMetadata(again, pending.meta)) return refusal;
        if (passwordRisk(facts.document) !== false) return refusal;
        let text, source, line;
        if (pending.meta.kind === "api") {
          text = consolePrimitiveText(own(raw, "arguments"));
          source = consoleCaptureSource(own(raw, "filename"));
          line = lineOf(own(raw, "lineNumber"));
        } else {
          const message = raw.errorMessage;
          text = typeof message === "string" ? sanitizeConsoleText(message) : null;
          source = consoleCaptureSource(raw.sourceName);
          line = lineOf(raw.lineNumber);
        }
        if (typeof text !== "string" || !text.trim() || source === null) return refusal;
        return freeze({ v: 1, lease_id: challenge.lease_id, offer_id: challenge.offer_id, packet: freeze({ v: 1,
          document_id: ready.document_id, navigation_token: challenge.navigation_token, observed_at: pending.meta.at,
          level: pending.meta.level === "warn" ? "warning" : "error", text, source, line }) });
      } catch { return refusal; }
      finally { raw = null; }
    }

    #stop() {
      this.#generation++;
      this.#starting = false;
      this.#again = false;
      this.#ready = null;
      this.#release(this.#pending);
      this.#unlisten();
    }
  };
}

// The native actor. Timer.sys.mjs is loaded on the first held notification.
let timerModule = null;
const nativeTimers = Object.freeze({
  setTimeout: (fn, ms) => (timerModule ??= ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs")).setTimeout(fn, ms),
  clearTimeout: id => (timerModule ??= ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs")).clearTimeout(id),
});
const Base = globalThis.JSWindowActorChild ?? class {};
export class ConsoleErrorsChild extends createConsoleErrorsChildClass({
  Base,
  timers: nativeTimers,
  getStorage: () => Cc["@mozilla.org/consoleAPI-storage;1"].getService(Ci.nsIConsoleAPIStorage),
  getSystemPrincipal: () => Services.scriptSecurityManager.getSystemPrincipal(),
  getScriptConsole: () => Services.console,
  asScriptError: message => { try { return message.QueryInterface(Ci.nsIScriptError); } catch { return null; } },
  generateQI: names => ChromeUtils.generateQI(names),
}) {}
