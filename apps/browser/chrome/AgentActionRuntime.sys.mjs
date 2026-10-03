/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The P4 act tools (page.click, page.type, tabs.navigate) and tabs.open
// (Plan 4 step 8, agent-channel-v1 §4.2), composed around the root's pure
// AgentActBoundary. Every capability flag below is a literal false: each
// method is UNAVAILABLE before any confirmation or effect until root accepts
// its actual native gates and evidence. No preference, environment variable,
// page or agent payload can turn one on; root changes the literal itself.
//
// What this module owns, for root review:
// - the fixed, Claude-authored BiDi function declarations (FIXED_ACTION_SOURCES)
//   and their exact validation; agent input is bounded scalar data, never source;
// - the visible confirmation: one Zen-native doorhanger on the target tab naming
//   the agent, the action and its target as inert text, with "Allow once" and
//   "Deny", a 60-second denial, Escape/keyboard operation and focus return.
//   Only a trusted Allow resolves true. It then keeps one private receipt bound
//   to Core's own request AbortSignal, session, method and params, the exact
//   registry-issued descriptor and its original project authority; the
//   boundary consumes it once immediately before dispatch, and fresh metadata
//   with equal visible fields never stands in for that original binding;
// - revocation, navigation, project changes and window close drop pending
//   prompts and receipts at once: future and undispatched work never runs. A
//   dispatched effect may complete or stay uncertain; nothing is retried or
//   rolled back;
// - the private native owner per request: a fresh listener-free WebDriver BiDi
//   session, constructed only while RemoteAgent, Marionette, system access and
//   every other WebDriver session are each literally off, and only after the
//   original request, approval, abort signal and issued native target were
//   admitted. Native navigation tracking (NavigableManager/UserContextManager)
//   is not even imported before that admission. Every owned command dispatch
//   reads the five RemoteAgent/Marionette/system-access facts afresh, each
//   literally false, and this request's own live ownership; the global
//   active-session predicate is the initial guard only, because the owner's
//   own session is registered from construction on. A constructor that throws
//   or a destroy that fails or answers anything but its native void
//   quarantines the shared process allocation budget for good; such an owner
//   never reports a positive close;
// - the one-use child gate (AgentActionChild) and created-tab ownership for
//   tabs.open: an allocation tracker installed before create records each tab
//   that opens with its original state, and marks it touched for good on any
//   native tab event for it (selected, deselected, pinned, unpinned, moved,
//   shown, hidden, closed, discarded) or any multi-selection change, whose
//   tab is unknown. Only the exact tab the create reply names, never touched
//   and still in that original never-navigated blank state, may be closed, and
//   only its actual removal is a receipt. Any other opened tab is never
//   attributed or touched; after URL navigation the tab is only ever adopted
//   into the shared registry. The pure boundary orders every cleanup: pending
//   command, then the exact target, then the owner.
import { createAgentActBoundary, ACT_BOUNDARY_SANDBOX, ACT_BOUNDARY_LIMITS } from "./AgentActBoundary.sys.mjs";
import { AgentToolError } from "./GeckoBiDiReadSession.sys.mjs";
import { AGENT_ACTION_ACTOR, AGENT_ACTION_MESSAGES, ACTION_GATE_NAME, ACTION_TOKEN } from "./AgentActionChild.sys.mjs";
import { currentNativeNavigationId, watchNativeNavigation } from "./ConsoleErrorsNativeRuntime.sys.mjs";

// Literal false until root accepts each capability's native proof.
export const ACTION_CAPABILITIES = Object.freeze({ click: false, type: false, navigate: false, open: false });
export const ACTION_CONFIRM_MS = 60_000;
export const ACTION_NOTIFICATION = "axiosozo-agent-action";
export const ACT_METHODS = Object.freeze(["page.click", "page.type", "tabs.navigate", "tabs.open"]);
// Pinned tabbrowser events dispatched on a tab (bubbling to its container):
// each one marks a tracked created tab touched for good. Group, split-view and
// workspace changes arrive as TabMove.
export const TAB_TOUCH_EVENTS = Object.freeze(["TabSelect", "TabPinned", "TabUnpinned", "TabMove", "TabShow", "TabHide",
  "TabClose", "TabBrowserDiscarded"]);
export const AGENT_ACTION_ACTOR_OPTIONS = Object.freeze({
  parent: Object.freeze({ esModuleURI: "chrome://browser/content/axiosozo/AgentActionParent.sys.mjs" }),
  child: Object.freeze({ esModuleURI: "chrome://browser/content/axiosozo/AgentActionChild.sys.mjs" }),
  allFrames: false, includeChrome: false, messageManagerGroups: Object.freeze(["browsers"]),
  matches: Object.freeze(["http://*/*", "https://*/*"]), safeForUntrustedWebProcess: true,
});

// Fixed function declarations, run by standard script.callFunction in the
// request's own private sandbox. Each effect calls the one-use privileged gate
// synchronously and performs its single effect directly after it.
export const FIXED_ACTION_SOURCES = Object.freeze({
  captureDocument: `function () { "use strict"; return document; }`,
  click: `function (original, url, selector) {
  "use strict";
  const gate = globalThis.${ACTION_GATE_NAME};
  if (typeof gate !== "function") return false;
  const target = original.querySelector(selector);
  if (gate(original, url, target, "page.click") !== true) return false;
  target.click();
  return true;
}`,
  type: `function (original, url, selector, text) {
  "use strict";
  const gate = globalThis.${ACTION_GATE_NAME};
  if (typeof gate !== "function") return false;
  const target = original.querySelector(selector);
  if (gate(original, url, target, "page.type") !== true) return false;
  target.value = text;
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}`,
  navigate: `function (original, url, destination) {
  "use strict";
  const gate = globalThis.${ACTION_GATE_NAME};
  if (typeof gate !== "function") return false;
  if (gate(original, url, null, "tabs.navigate", destination) !== true) return false;
  original.location.assign(destination);
  return true;
}`,
});
const SOURCE_KEYS = Object.freeze(["captureDocument", "click", "type", "navigate"]);
/** Exactly the pinned declarations, for a known method. */
export function validateActionSources(method, sources) {
  try {
    return ACT_METHODS.includes(method) && !!sources && Object.isFrozen(sources)
      && SOURCE_KEYS.every(key => Object.getOwnPropertyDescriptor(sources, key)?.value === FIXED_ACTION_SOURCES[key]);
  } catch { return false; }
}

const fail = code => { throw new AgentToolError(code); };
const ref = value => value !== null && (typeof value === "object" || typeof value === "function");
const SESSION = /^s_[0-9a-f]{16}$/u;
const AGENT_NAMES = Object.freeze({ "claude-code": "Claude Code", codex: "Codex", other: "An agent" });
// Every field of an issued binding a confirmation was given for.
const BINDING_FIELDS = Object.freeze(["tab_id", "url", "document_id", "project_id", "engine", "userContextId", "binding_token",
  "route_revision", "project_revision"]);
const promiseThen = Promise.prototype.then;
/** Literal false only; a genuine rejected promise is observed, never assimilated. */
const literalFalse = value => {
  if (value === false) return true;
  try { promiseThen.call(value, () => {}, () => {}); } catch {}
  return false;
};
const oneLine = (value, max) => {
  const text = typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f-\u009f\u{202a}-\u{202e}\u{2066}-\u{2069}]+/gu, " ").trim() : "";
  const points = [...text];
  return points.length > max ? `${points.slice(0, max - 1).join("")}…` : text;
};
/** Host and path only, never a query, fragment or credentials. */
export function actionPlace(url) {
  const parsed = typeof url === "string" ? URL.parse(url) : null;
  return parsed ? oneLine(`${parsed.host}${parsed.pathname.replace(/\/+$/u, "")}`, 120) || "this page" : "this page";
}

/**
 * The doorhanger sentence; "<>" is replaced by PopupNotifications with the
 * agent's name. Everything is text: selectors, typed text and URLs are never
 * markup, links or evaluated.
 */
export function actionConfirmationMessage({ method, params = {}, url } = {}) {
  const place = actionPlace(url);
  switch (method) {
    case "page.click": return `<> wants to click “${oneLine(params.selector, 120)}” on ${place}.`;
    case "page.type": return `<> wants to type “${oneLine(params.text, 80)}” into “${oneLine(params.selector, 120)}” on ${place}. What is there now is replaced.`;
    case "tabs.navigate": return `<> wants to open ${actionPlace(params.url)} in this tab, leaving ${place}.`;
    default: return null;
  }
}
export const agentDisplayName = agent => AGENT_NAMES[Object.hasOwn(AGENT_NAMES, agent) ? agent : "other"];

/** The concrete request as one canonical key: fixed field order per method. */
function requestKey(method, params) {
  const fields = { "page.click": ["tab_id", "selector"], "page.type": ["tab_id", "selector", "text"], "tabs.navigate": ["tab_id", "url"] }[method];
  return fields ? JSON.stringify([method, ...fields.map(name => (typeof params?.[name] === "string" ? params[name] : null))]) : null;
}

/**
 * One window's confirmations: a doorhanger on the target tab's browser.
 * present(request, { signal, browser }) resolves literal true only for a
 * trusted Allow once while nothing was cancelled. Deny, Escape, dismissal,
 * 60 s, abort and dispose resolve false; a late click cannot allow.
 */
export function installActionConfirmations(window, { timers }) {
  const pending = new Set();
  let disposed = false;
  function present({ agent, method, params, url }, { signal, browser } = {}) {
    return new Promise(resolve => {
      const manager = window?.PopupNotifications;
      const message = actionConfirmationMessage({ method, params, url });
      if (disposed || !manager || !message || !browser || !signal || signal.aborted) { resolve(false); return; }
      let opener = null;
      try { opener = window.document.activeElement; } catch { opener = null; }
      const entry = { browser, notification: null, timer: null, settled: false, finish: null };
      const finish = allowed => {
        if (entry.settled) return;
        entry.settled = true;
        pending.delete(entry);
        signal.removeEventListener("abort", onAbort);
        try { timers.clearTimeout(entry.timer); } catch {}
        try { if (entry.notification) manager.remove(entry.notification); } catch {}
        // Keyboard focus goes back where it was before the doorhanger.
        try { if (opener?.isConnected && window.document.activeElement !== opener) opener.focus(); } catch {}
        resolve(allowed === true && !disposed && !signal.aborted);
      };
      const onAbort = () => finish(false);
      entry.finish = finish;
      pending.add(entry);
      signal.addEventListener("abort", onAbort, { once: true });
      try {
        entry.timer = timers.setTimeout(() => finish(false), ACTION_CONFIRM_MS);
        entry.notification = manager.show(browser, ACTION_NOTIFICATION, message, null,
          { label: "Allow once", accessKey: "A", callback: ({ event } = {}) => { finish(event?.isTrusted === true); } },
          [{ label: "Deny", accessKey: "D", callback: () => finish(false) }],
          { name: agentDisplayName(agent), persistence: 0, removeOnDismissal: true, hideClose: true, autofocus: true,
            eventCallback: state => { if (state === "removed" || state === "dismissed") finish(false); } });
      } catch { finish(false); }
      if (entry.settled && entry.notification) { try { manager.remove(entry.notification); } catch {} }
    });
  }
  return Object.freeze({
    present,
    cancelFor(browser) { for (const entry of [...pending]) if (entry.browser === browser) entry.finish(false); },
    cancelAll() { for (const entry of [...pending]) entry.finish(false); },
    dispose() { disposed = true; for (const entry of [...pending]) entry.finish(false); },
    get pending() { return pending.size; },
  });
}

/** The pinned native Marionette singleton leaves its enabled flag undefined
 * only in its never-enabled startup state; that source-defined value alone
 * reads as false. Running and every other value are read fresh, unchanged. */
export function nativeMarionetteFacts(marionette) {
  return Object.freeze({
    get enabled() { const enabled = marionette.enabled; return enabled === undefined ? false : enabled; },
    get running() { return marionette.running; },
  });
}

async function loadRemoteModules() {
  const [session, remote, marionette] = await Promise.all([
    import("chrome://remote/content/shared/webdriver/Session.sys.mjs"),
    import("chrome://remote/content/components/RemoteAgent.sys.mjs"),
    import("chrome://remote/content/components/Marionette.sys.mjs"),
  ]);
  return { WebDriverSession: session.WebDriverSession, hasActiveWebDriverSession: session.hasActiveWebDriverSession,
    RemoteAgent: remote.RemoteAgent, Marionette: nativeMarionetteFacts(marionette.Marionette),
    // Importing these constructs native tracking singletons: called only after
    // automation and the request's own authority were admitted.
    navigation: async () => {
      const [navigable, contexts] = await Promise.all([import("chrome://remote/content/shared/NavigableManager.sys.mjs"),
        import("chrome://remote/content/shared/UserContextManager.sys.mjs")]);
      return { NavigableManager: navigable.NavigableManager, UserContextManager: contexts.UserContextManager };
    } };
}

/** The five agent and system-access facts, read fresh, each literally false;
 * anything missing, unknown, thrown or asynchronous refuses. Checked again
 * immediately before every owned command dispatch. */
export function agentsOff(modules) {
  try {
    const { RemoteAgent, Marionette } = modules ?? {};
    if (!ref(RemoteAgent) || !ref(Marionette)) return false;
    return literalFalse(RemoteAgent.enabled) && literalFalse(RemoteAgent.running) && literalFalse(RemoteAgent.allowSystemAccess)
      && literalFalse(Marionette.enabled) && literalFalse(Marionette.running);
  } catch { return false; }
}
/** Admission before tracking and construction: the five facts, and no other
 * WebDriver session active yet. */
export function automationOff(modules) {
  try {
    const { WebDriverSession, hasActiveWebDriverSession } = modules ?? {};
    if (typeof WebDriverSession !== "function" || typeof hasActiveWebDriverSession !== "function") return false;
    return agentsOff(modules) && literalFalse(hasActiveWebDriverSession());
  } catch { return false; }
}

let actorRegistered = false;
export function registerAgentActionActor(chromeUtils = globalThis.ChromeUtils) {
  if (actorRegistered) return true;
  chromeUtils.registerWindowActor(AGENT_ACTION_ACTOR, AGENT_ACTION_ACTOR_OPTIONS);
  actorRegistered = true;
  return true;
}
function defaultToken() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return `ag_${Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

let installed = null;
export const getAgentActionRuntime = () => installed;

/**
 * `registry`: the shared AgentTabRegistry; `services`: AxioSozoServices
 * (isNormalWindow, captureNativeProjectAuthority, readNativeProjectSnapshot);
 * `nativeOwner`: the Step 7 console owner (ownerForTab, for adopting an
 * opened tab into the shared registry); `isSessionActive(id)`: the bridge's
 * process-lifetime approved-session predicate; `timers`: trusted Timer.sys.mjs;
 * `allocationBudget`: the process BiDi retention budget shared with capture,
 * with its claim and quarantine. Injected for tests: createBoundary,
 * loadRemote, registerActor, randomToken, now.
 */
export function createAgentActionRuntime({ registry, services, nativeOwner, isSessionActive, timers, allocationBudget,
  createBoundary = createAgentActBoundary, loadRemote = loadRemoteModules, registerActor = registerAgentActionActor,
  randomToken = defaultToken, now = () => Date.now() } = {}) {
  if (typeof registry?.withTrusted !== "function" || typeof services?.isNormalWindow !== "function"
    || typeof isSessionActive !== "function" || typeof timers?.setTimeout !== "function" || typeof timers.clearTimeout !== "function"
    || typeof allocationBudget?.claim !== "function" || typeof allocationBudget.quarantine !== "function") {
    throw new TypeError("trusted action dependencies required");
  }
  let closed = false, quarantined = false;
  const presenters = new Map(); // registered normal window → its confirmations
  const receipts = new Map(); // Core request AbortSignal → one-use receipt
  const prompting = new WeakSet(); // Core request AbortSignals with a doorhanger showing
  const authorities = new WeakMap(); // issued expected → project authority
  const navigations = new WeakMap(); // admitted issued expected → its native navigation modules
  // Native owner states: `live` were handed to the boundary, which orders
  // their cleanup; `orphans` threw during construction and have no handle.
  const owners = new WeakMap(), live = new Set(), orphans = new Set();
  const trackers = new WeakMap(), claims = new WeakMap();
  const gates = new Set();

  const approved = id => { try { return SESSION.test(id ?? "") && isSessionActive(id) === true; } catch { return false; } };
  /** The shared budget refuses every later claim, for capture too. */
  function quarantine() {
    quarantined = true;
    try { allocationBudget.quarantine(); } catch { /* the uncertain state stays retained and visible */ }
  }
  function authorityFor(window, expected) {
    if (expected.project_id === null) {
      const revision = expected.project_revision;
      const check = () => { try { return services.readNativeProjectSnapshot()?.revision === revision; } catch { return false; } };
      return check() ? Object.freeze({ check }) : null;
    }
    let authority = null;
    try { authority = services.captureNativeProjectAuthority({ window, project_id: expected.project_id }); } catch { authority = null; }
    return authority?.id === expected.project_id && authority.revision === expected.project_revision ? authority : null;
  }
  /** The exact issued owner with its project authority, privacy first. */
  function currentOwner(trusted, expected, authority = authorities.get(expected)) {
    try {
      if (closed || !authority) return false;
      const { tab, window, browser, browsingContext: context, windowGlobal: global, descriptor } = trusted;
      if (context.usePrivateBrowsing !== false || context.originAttributes?.privateBrowsingId !== 0) return false;
      if (descriptor.private !== false || descriptor.engine !== "gecko" || BINDING_FIELDS.some(key => descriptor[key] !== expected[key])) return false;
      if (window.closed !== false || services.isNormalWindow(window) !== true || tab.documentGlobal !== window || tab.closing !== false
        || tab.linkedBrowser !== browser || window.gBrowser.getTabForBrowser(browser) !== tab) return false;
      if (browser.browsingContext !== context || context.currentWindowGlobal !== global || global.isCurrentGlobal !== true
        || global.isClosed !== false || String(global.innerWindowId) !== expected.document_id || global.documentURI?.spec !== expected.url
        || context.originAttributes?.userContextId !== expected.userContextId) return false;
      return authority.check() === true;
    } catch { return false; }
  }
  const projected = (expected, read, authority) => ref(expected) && typeof expected.tab_id === "string"
    ? registry.withTrusted(expected.tab_id, trusted => (currentOwner(trusted, expected, authority) ? read(trusted) : null), { expected }) : null;

  // ---- confirmations and one-use receipts -----------------------------------------------
  function drop(receipt) {
    if (receipts.get(receipt.signal) === receipt) receipts.delete(receipt.signal);
    receipt.signal.removeEventListener("abort", receipt.onAbort);
  }
  function dropWhere(match) { for (const receipt of [...receipts.values()]) if (match(receipt)) drop(receipt); }

  /** Core's confirmAction: literal true only for a trusted Allow once on an
   * available method; anything unavailable answers false before any prompt. */
  async function confirmAction(request, { signal } = {}) {
    try {
      const { session, method, params, tab } = request ?? {};
      if (closed || !boundary.isMethodAvailable(method) || method === "tabs.open" || !signal || signal.aborted
        || !approved(session?.session) || !ref(tab) || receipts.has(signal) || prompting.has(signal)) return false;
      const issued = registry.metadata?.(tab.tab_id) ?? null;
      if (!issued || issued.url !== tab.url || issued.document_id !== tab.document_id || issued.project_id !== tab.project_id) return false;
      let window = null;
      const target = registry.withTrusted(issued.tab_id, trusted => { window = trusted.window; return trusted.browser; }, { expected: issued });
      const authority = target ? authorityFor(window, issued) : null;
      const presenter = presenters.get(window);
      if (!target || !authority || !presenter || !projected(issued, () => true, authority)) return false;
      prompting.add(signal);
      let allowed;
      try { allowed = await presenter.present({ agent: session.client?.agent, method, params, url: issued.url }, { signal, browser: target }); }
      finally { prompting.delete(signal); }
      if (allowed !== true || closed || signal.aborted || !approved(session.session) || !projected(issued, () => true, authority)) return false;
      // The exact issued descriptor and its original authority stay private.
      const receipt = { signal, session: session.session, key: requestKey(method, params), expected: issued, authority,
        browser: target, window, expires: now() + ACTION_CONFIRM_MS, onAbort: null };
      receipt.onAbort = () => drop(receipt);
      signal.addEventListener("abort", receipt.onAbort, { once: true });
      receipts.set(signal, receipt);
      return true;
    } catch { return false; }
  }
  /** The boundary's synchronous consumption: the receipt is removed first,
   * whatever the outcome. True only when the fresh request carries the same
   * issued binding and the original binding and authority still hold now. */
  function consumeConfirmation(request, { signal } = {}) {
    const receipt = receipts.get(signal);
    if (!receipt) return false;
    drop(receipt);
    try {
      if (closed || signal.aborted || now() > receipt.expires || !approved(receipt.session) || request?.session?.session !== receipt.session
        || requestKey(request.method, request.params) !== receipt.key) return false;
      const fresh = request.expected, original = receipt.expected;
      if (!ref(fresh) || BINDING_FIELDS.some(key => fresh[key] !== original[key])) return false;
      return registry.withTrusted(original.tab_id, trusted => currentOwner(trusted, original, receipt.authority),
        { expected: original }) === true;
    } catch { return false; }
  }

  // ---- the native owner per request ------------------------------------------------------
  const reply = (value, token, fields) => ref(value) && value.v === 1 && value.token === token
    && Object.keys(value).length === fields.length && fields.every(name => Object.hasOwn(value, name));
  function token() {
    const value = randomToken();
    if (typeof value !== "string" || !ACTION_TOKEN.test(value)) fail("UNAVAILABLE");
    return value;
  }
  async function createOwner(request, { signal, requestSignal } = {}) {
    if (closed || signal?.aborted || requestSignal?.aborted) fail("NOT_APPROVED");
    // Only a target admitted before tracking started, for this exact request.
    const navigation = navigations.get(request?.expected);
    if (!navigation) fail("UNAVAILABLE");
    const modules = await loadRemote();
    const admitted = () => !closed && !signal?.aborted && !requestSignal?.aborted && approved(request.session?.session);
    if (!admitted()) fail("NOT_APPROVED");
    if (!automationOff(modules)) fail("UNAVAILABLE");
    const global = projected(request.expected, trusted => trusted.windowGlobal);
    if (!global) fail("NOT_APPROVED");
    // The slot is consumed even if construction fails afterwards.
    allocationBudget.claim(global);
    // Fresh facts immediately before the constructor; no await since the claim.
    if (!admitted() || !projected(request.expected, () => true)) fail("NOT_APPROVED");
    if (!automationOff(modules)) fail("UNAVAILABLE");
    const state = { session: null, request, navigation, tracker: null, closed: false, closing: null, uncertain: false };
    let session;
    try {
      session = new modules.WebDriverSession({ acceptInsecureCerts: false, unhandledPromptBehavior: "ignore" },
        new Set([modules.WebDriverSession.SESSION_FLAG_BIDI]));
    } catch {
      // It may have registered native resources before throwing, without a
      // handle to destroy: retained, quarantined, never positively closed.
      state.uncertain = true;
      orphans.add(state);
      quarantine();
      fail("UNAVAILABLE");
    }
    state.session = session;
    live.add(state);
    // The child gate actor exists only once a native owner does.
    try { registerActor(); } catch { /* its proof then refuses; the owner stays handed for cleanup */ }
    const owner = Object.freeze({
      // Every owned dispatch: this request still live and its owner open, and
      // the five agent/system facts fresh and literally false directly before
      // the native call. Cleanup never runs through here.
      execute: (module, command, params) => {
        if (state.closed || state.closing || !state.session || !admitted()) fail("NOT_APPROVED");
        if (!agentsOff(modules)) fail("UNAVAILABLE");
        return state.session.execute(module, command, params);
      },
      close: () => closeOwner(state),
    });
    owners.set(owner, state);
    return owner;
  }
  /** One coalesced attempt, published before any native destroy can reenter.
   * Literal true only after its gates, any created target and its native
   * session are positively retired. */
  function closeOwner(state) {
    if (state.closed) return Promise.resolve(true);
    if (state.closing) return state.closing;
    let settle;
    const attempt = new Promise(resolve => { settle = resolve; });
    state.closing = attempt;
    (async () => {
      // A created target the boundary has not retired or adopted keeps this
      // owner and its tracker: session teardown is never a target receipt.
      if (state.tracker && !state.tracker.stopped) return false;
      const revoked = await Promise.all([...gates].filter(gate => gate.state === state).map(retireGate));
      if (!revoked.every(Boolean) || state.uncertain) return false;
      if (state.session) {
        let result;
        try { result = state.session.destroy(); } catch { quarantine(); return false; }
        // Pinned native destroy is synchronous void; anything else is uncertain.
        if (result !== undefined) { literalFalse(result); quarantine(); return false; }
        state.session = null;
      }
      state.closed = true;
      live.delete(state);
      return true;
    })().then(value => settle(value === true), () => settle(false));
    attempt.then(() => { if (state.closing === attempt) state.closing = null; });
    return attempt;
  }
  async function retireGate(gate) {
    if (gate.retired) return true;
    if (gate.destroyed) { gate.retired = true; gates.delete(gate); return true; }
    try {
      const value = await gate.actor.sendQuery(AGENT_ACTION_MESSAGES.REVOKE, { v: 1, token: gate.token });
      if (reply(value, gate.token, ["v", "token", "revoked"]) && value.revoked === true) gate.retired = true;
    } catch { /* retired only by a positive answer or the actor's destruction */ }
    if (gate.destroyed) gate.retired = true;
    if (gate.retired) gates.delete(gate);
    return gate.retired;
  }

  async function validateDocumentProof(owner, request, { signal, phase, binding } = {}) {
    const state = owners.get(owner);
    if (!state || state.closed || state.request !== request || signal?.aborted) return false;
    const actor = projected(request.expected, trusted => trusted.windowGlobal.getActor(AGENT_ACTION_ACTOR));
    if (!ref(actor)) return false;
    const value = token();
    if (phase === "beforeBinding") {
      const answer = await actor.sendQuery(AGENT_ACTION_MESSAGES.ADMIT, { v: 1, token: value, url: request.expected.url });
      return reply(answer, value, ["v", "token", "ok"]) && answer.ok === true && !signal?.aborted && !!projected(request.expected, () => true);
    }
    if (phase !== "beforeEffect" || !ref(binding) || binding.context !== request.context || binding.sandbox !== ACT_BOUNDARY_SANDBOX
      || typeof binding.realm !== "string" || request.method === "tabs.open") return false;
    // Owned before the query: a late install is still revoked at close.
    const gate = { state, actor, token: value, retired: false, destroyed: false };
    gates.add(gate);
    const answer = await actor.sendQuery(AGENT_ACTION_MESSAGES.INSTALL, { v: 1, token: value, session: state.session.id,
      realm: binding.realm, method: request.method, url: request.expected.url,
      destination: request.method === "tabs.navigate" ? request.params.url : null });
    return reply(answer, value, ["v", "token", "installed"]) && answer.installed === true && !signal?.aborted
      && !!projected(request.expected, trusted => trusted.windowGlobal.getExistingActor(AGENT_ACTION_ACTOR) === actor);
  }

  // ---- tabs.open: created-target ownership -------------------------------------------------
  function stopTracking(tracker) {
    if (!tracker || tracker.stopped) return;
    tracker.stopped = true;
    for (const [target, type, listener] of tracker.listeners.splice(0)) { try { target.removeEventListener(type, listener); } catch {} }
    for (const unwatch of tracker.unwatch.splice(0)) { try { unwatch(); } catch {} }
  }
  /** Each tab that opens while tracked, with its state as it opens. */
  function opening(window, tab) {
    try {
      const browser = tab.linkedBrowser, context = browser?.browsingContext;
      if (!ref(browser) || !ref(context)) return { tab, unknown: true, touched: false };
      return { tab, browser, context, global: context.currentWindowGlobal, navigation: currentNativeNavigationId(window, browser), unknown: false, touched: false };
    } catch { return { tab, unknown: true, touched: false }; }
  }
  /** A native tab event: the tab it names (and, for a selection, the tab it
   * left) is touched for good. An event that names no tab, or whose tab cannot
   * be read, touches every tab the tracker has seen open so far. */
  function touch(tracker, event, unowned) {
    let tabs = null;
    if (!unowned) {
      try { tabs = [event.target, event.detail?.previousTab ?? null].filter(ref); } catch { tabs = null; }
    }
    for (const entry of tracker.opened) if (!tabs || tabs.includes(entry.tab)) entry.touched = true;
  }
  function beginCreatedTarget(owner, request) {
    const state = owners.get(owner);
    const window = state && !state.tracker && state.request === request ? projected(request.expected, trusted => trusted.window) : null;
    if (!window) fail("UNAVAILABLE");
    const tracker = { window, opened: [], listeners: [], installed: false, stopped: false, blind: false, unwatch: [] };
    state.tracker = tracker;
    const listen = (target, type, listener) => {
      // Owned before it is added: a throwing registration is still removed.
      tracker.listeners.push([target, type, listener]);
      target.addEventListener(type, listener);
    };
    const container = window.gBrowser.tabContainer;
    listen(container, "TabOpen", event => { if (!tracker.stopped && ref(event?.target)) tracker.opened.push(opening(window, event.target)); });
    // Tab events bubble from the tab to its container; TabMultiSelect is
    // dispatched on the tabbrowser itself and names no tab.
    try {
      for (const type of TAB_TOUCH_EVENTS) listen(container, type, event => { if (!tracker.stopped) touch(tracker, event, false); });
      listen(window.gBrowser, "TabMultiSelect", event => { if (!tracker.stopped) touch(tracker, event, true); });
    } catch { tracker.blind = true; }
    tracker.installed = true;
    const lease = Object.freeze(Object.create(null));
    trackers.set(lease, { tracker, state });
    return lease;
  }
  /** Never touched since it opened, while every tab event was heard, and
   * still exactly as it opened: the same browser, context and first window
   * global, never navigated, not selected, pinned or moved, still blank. */
  function untouched(original, window, tracker) {
    try {
      const { tab, browser, context, global, navigation } = original;
      return tracker?.blind === false && original.touched === false
        && original.unknown === false && tab.documentGlobal === window && tab.closing === false && tab.isConnected === true
        && tab.linkedBrowser === browser && browser.browsingContext === context && context.currentWindowGlobal === global
        && currentNativeNavigationId(window, browser) === navigation && browser.currentURI?.spec === "about:blank"
        && tab.selected === false && tab.pinned !== true && browser.canGoBack === false;
    } catch { return false; }
  }
  /** Positive no-allocation only from a complete tracker: installed before the
   * create command, never stopped, its normal window still live, and no tab
   * opened there while it watched. Any opened tab, this request's or anyone
   * else's, cannot be attributed here: it stays untouched and owned. */
  async function reconcileCreatedTarget(lease, owner, request) {
    const held = trackers.get(lease);
    if (!held || owners.get(owner) !== held.state || held.state.request !== request) return false;
    const tracker = held.tracker;
    if (tracker.installed !== true || tracker.stopped || tracker.opened.length !== 0) return false;
    try { if (tracker.window.closed !== false || services.isNormalWindow(tracker.window) !== true) return false; } catch { return false; }
    stopTracking(tracker);
    return true;
  }
  /** The exact tab the create reply names, by its native context only. */
  function claimCreatedTarget(owner, context, request) {
    const state = owners.get(owner), tracker = state?.tracker;
    const manager = state?.navigation?.NavigableManager;
    if (!tracker || tracker.stopped || state.request !== request || typeof manager?.getBrowsingContextById !== "function") fail("UNAVAILABLE");
    const browsingContext = manager.getBrowsingContextById(context);
    const browser = browsingContext?.embedderElement;
    const tab = browser ? tracker.window.gBrowser.getTabForBrowser(browser) : null;
    const original = tab ? tracker.opened.find(entry => entry.tab === tab) : null;
    if (!original || original.unknown || original.browser !== browser || original.context !== browsingContext
      || browsingContext.top !== browsingContext) fail("UNAVAILABLE");
    const claim = Object.freeze(Object.create(null));
    claims.set(claim, { original, window: tracker.window, state, removing: false });
    return claim;
  }
  const isCreatedTargetBlank = claim => {
    const entry = claims.get(claim);
    return !!entry && !entry.removing && untouched(entry.original, entry.window, entry.state.tracker);
  };
  /** Only the exact claimed tab, never touched; only its actual removal counts. */
  async function closeCreatedTarget(claim) {
    const entry = claims.get(claim);
    if (!entry) return false;
    const { tab, browser } = entry.original;
    if (!entry.removing) {
      if (entry.state.tracker?.stopped !== false || !untouched(entry.original, entry.window, entry.state.tracker)) return false;
      entry.removing = true;
      try { entry.window.gBrowser.removeTab(tab, { animate: false }); } catch { return false; }
    }
    let gone = false;
    try { gone = tab.isConnected === false && entry.window.gBrowser.getTabForBrowser(browser) !== tab; } catch { gone = false; }
    if (gone) stopTracking(entry.state.tracker);
    return gone;
  }
  /** Positive transfer only: the shared registry issues the tab's own ID once
   * it shows a normal Gecko http(s) document in the requested container. */
  function adoptCreatedTarget(claim, request) {
    const entry = claims.get(claim);
    if (!entry || typeof nativeOwner?.ownerForTab !== "function") return Promise.reject(new AgentToolError("UNAVAILABLE"));
    const container = entry.state.navigation?.UserContextManager?.getInternalIdById?.(request.userContext);
    const tab = entry.original.tab;
    const adopt = () => {
      try {
        const owned = nativeOwner.ownerForTab(entry.window, tab);
        const issued = owned ? registry.metadata(owned.tab_id) : null;
        return issued && issued.private === false && issued.engine === "gecko" && Number.isSafeInteger(container) && issued.userContextId === container
          ? Object.freeze({ tab_id: owned.tab_id }) : null;
      } catch { return null; }
    };
    const now = adopt();
    if (now) { stopTracking(entry.state.tracker); return Promise.resolve(now); }
    return new Promise(resolve => {
      const unwatch = watchNativeNavigation(entry.window, browser => {
        if (browser !== entry.original.browser) return;
        // The commit is observed first; registration follows on the same turn.
        Promise.resolve().then(() => { const value = adopt(); if (value) { stopTracking(entry.state.tracker); resolve(value); } });
      });
      if (typeof unwatch === "function") entry.state.tracker?.unwatch.push(unwatch);
    });
  }

  const boundary = createBoundary({
    capabilities: ACTION_CAPABILITIES, sources: FIXED_ACTION_SOURCES, validateSources: validateActionSources,
    isActive: (expected, request) => !closed && approved(request?.session?.session) && !!projected(expected, () => true),
    isSensitiveHost: host => registry.isSensitiveHost(host) !== false,
    consumeConfirmation, createOwner, validateDocumentProof,
    beginCreatedTarget, reconcileCreatedTarget, claimCreatedTarget, isCreatedTargetBlank, adoptCreatedTarget, closeCreatedTarget,
    setTimer: (fn, ms) => timers.setTimeout(fn, ms), clearTimer: id => timers.clearTimeout(id),
    timeoutMs: ACT_BOUNDARY_LIMITS.timeoutMs, cleanupMs: ACT_BOUNDARY_LIMITS.cleanupMs,
  });

  /** The issued target, its native BiDi context and navigation modules. The
   * original request, approval and signal, strict automation facts and the
   * issued native target are admitted before the navigation import, which
   * starts native tracking; all of it is checked again after every await. */
  async function resolveTarget(method, tab, session, signal) {
    const admitted = () => !closed && ref(signal) && signal.aborted === false && approved(session?.session);
    if (!admitted()) fail("NOT_APPROVED");
    const modules = await loadRemote();
    if (!admitted()) fail("NOT_APPROVED");
    if (!automationOff(modules)) fail("UNAVAILABLE");
    let expected;
    if (method === "tabs.open") expected = registry.listMetadata().find(value => value.active) ?? null;
    else {
      expected = ref(tab) ? registry.metadata(tab.tab_id) : null;
      if (expected && (expected.url !== tab.url || expected.document_id !== tab.document_id || expected.project_id !== tab.project_id)) expected = null;
    }
    if (!expected) fail("UNKNOWN_TAB");
    const window = registry.withTrusted(expected.tab_id, trusted => trusted.window, { expected });
    const authority = window ? authorityFor(window, expected) : null;
    if (!authority) fail("NOT_APPROVED");
    authorities.set(expected, authority);
    if (!projected(expected, () => true)) fail("NOT_APPROVED");
    const navigation = await modules.navigation();
    if (!admitted() || !projected(expected, () => true)) fail("NOT_APPROVED");
    if (!automationOff(modules)) fail("UNAVAILABLE");
    if (typeof navigation?.NavigableManager?.getIdForBrowsingContext !== "function") fail("UNAVAILABLE");
    const context = projected(expected, trusted => navigation.NavigableManager.getIdForBrowsingContext(trusted.browsingContext));
    if (typeof context !== "string" || !context) fail("UNAVAILABLE");
    navigations.set(expected, navigation);
    return { expected, context, navigation };
  }

  async function executeMethod(method, params, session, { tab = null, signal, userContextId = null } = {}) {
    if (closed || !boundary.isMethodAvailable(method)) fail("UNAVAILABLE");
    const { expected, context, navigation } = await resolveTarget(method, tab, session, signal);
    let userContext;
    if (method === "tabs.open") {
      userContext = Number.isSafeInteger(userContextId) ? navigation.UserContextManager?.getIdByInternalId?.(userContextId) : null;
      if (typeof userContext !== "string" || !userContext) fail("UNAVAILABLE");
    }
    return boundary.executeMethod(method, params, session, { expected, context, userContext, signal });
  }

  function releaseSession(id) {
    dropWhere(receipt => receipt.session === id);
    return boundary.releaseSession(id);
  }

  const runtime = Object.freeze({
    isMethodAvailable: method => !closed && boundary.isMethodAvailable(method),
    getCapabilities: () => boundary.getCapabilities(),
    confirmAction, executeMethod, releaseSession,
    attachWindow(window) {
      if (closed || presenters.has(window)) return () => {};
      const presenter = installActionConfirmations(window, { timers });
      presenters.set(window, presenter);
      return () => {
        if (presenters.get(window) !== presenter) return;
        presenters.delete(window);
        presenter.dispose();
        dropWhere(receipt => receipt.window === window);
      };
    },
    /** A top-level location change of this browser: its prompt and receipt end. */
    invalidateBrowser(window, browser) {
      presenters.get(window)?.cancelFor(browser);
      dropWhere(receipt => receipt.browser === browser);
    },
    /** Project authority moved: every prompt and receipt ends. */
    invalidateAll() {
      for (const presenter of presenters.values()) presenter.cancelAll();
      dropWhere(() => true);
    },
    actorDestroyed(actor) {
      for (const gate of gates) if (gate.actor === actor) gate.destroyed = true;
    },
    /** Revokes everything synchronously, then lets the boundary order its own
     * cleanup (pending command, exact target, owner). Construction orphans are
     * retired separately and never positively. Literal true only when nothing
     * native remains owned; a later call retries what failed. */
    async close() {
      closed = true;
      for (const presenter of presenters.values()) presenter.dispose();
      presenters.clear();
      dropWhere(() => true);
      let ordered = false;
      try { ordered = await boundary.close() === true; } catch { ordered = false; }
      const orphaned = await Promise.all([...orphans].map(closeOwner));
      const done = ordered && orphaned.every(Boolean) && live.size === 0 && orphans.size === 0;
      if (done && installed === runtime) installed = null;
      return done;
    },
    getState: () => {
      const state = boundary.getState();
      return Object.freeze({ closed, busy: state.busy, pending_operations: state.pending_operations,
        retained_owners: live.size + orphans.size, construction_uncertain: orphans.size, quarantined,
        retained_created_targets: state.retained_created_targets, effect_dispatched: state.effect_dispatched,
        receipts: receipts.size, prompts: [...presenters.values()].reduce((sum, presenter) => sum + presenter.pending, 0),
        cleanup_incomplete: state.cleanup_incomplete || live.size !== 0 || orphans.size !== 0 });
    },
  });
  installed = runtime;
  return runtime;
}
