/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The one process owner of console collection (Plan 4 step 7, P5). It holds
// the shared AgentTabRegistry, the RAM facade (ConsoleErrorsService) and that
// facade's private capture controller, and supplies the facade's trusted
// native facts: registered normal windows, the actual tab, browser and current
// window global of a registered ConsoleErrors actor, the engine a tab shows,
// its space, the settled project snapshot of AxioSozoServices and the shared
// navigation counter. It never reads a page title, form value or selection;
// documents are inspected only by the registered child (ConsoleErrorsChild)
// behind its own capture-time password gate.
//
// Nothing here sends anything. Retained messages change RAM and a name-only
// console event. The explicit "Send errors to agent" path opens a native tab
// chooser for a project home, and a trusted choice only selects the existing
// tab and opens the existing manual composer (AgentHandoffRuntime) with
// console errors ticked; copying still needs its own trusted click.
//
// Navigation identity "w<innerWindowId>.n<count>" (same-document changes
// included) lives here: one tabs progress listener and one counter per
// browser window, shared with AgentStatusRuntime and the handoff runtime.
import * as defaultCore from "./contexts/index.mjs";
import { AgentTabRegistry } from "./AgentTabRegistry.sys.mjs";
import { createConsoleErrorsService, setConsoleErrorsService } from "./ConsoleErrorsService.sys.mjs";
import { CONSOLE_ACTOR, CONSOLE_MESSAGES } from "./ConsoleErrorsChild.sys.mjs";
import { chromiumWebModeEnabled } from "./EngineRegistry.sys.mjs";

// Pinned JSActorOptions: safeForUntrustedWebProcess defaults to false, so a
// web-process child needs it explicitly. No remoteTypes filter: in-process
// documents use the same registered child as remote ones. Top-level http(s)
// documents of tabbrowser browsers only.
export const CONSOLE_ACTOR_OPTIONS = Object.freeze({
  parent: Object.freeze({ esModuleURI: "chrome://browser/content/axiosozo/ConsoleErrorsParent.sys.mjs" }),
  child: Object.freeze({ esModuleURI: "chrome://browser/content/axiosozo/ConsoleErrorsChild.sys.mjs",
    events: Object.freeze({ DOMDocElementInserted: Object.freeze({}), DOMContentLoaded: Object.freeze({}), pageshow: Object.freeze({}) }) }),
  allFrames: false, includeChrome: false, messageManagerGroups: Object.freeze(["browsers"]),
  matches: Object.freeze(["http://*/*", "https://*/*"]), safeForUntrustedWebProcess: true,
});
// A capture query is answered within this or dropped (the facade's lease lives 1000 ms).
export const CONSOLE_QUERY_MS = 800;
export const CHOOSER_NOTIFICATION = "axiosozo-console-errors";
export const CHOOSER_NOTICE = "axiosozo-console-errors-notice";
const MAX_TABS = 2048;
const MAX_URL = 8192;
// Readiness diagnostics: fixed stage counts only, each saturating here.
const DIAGNOSTIC_CEILING = 1_000_000;
const AUTHORIZE_STAGES = Object.freeze(["disposed", "manager", "context", "window", "tab", "register", "facade"]);
const PROJECT = /^p_[a-z0-9]{4,32}$/u;
const DISABLED = Object.freeze({ enabled: false });
const CANCELLED = Symbol("cancelled");
const freeze = Object.freeze;
const ref = value => value !== null && (typeof value === "object" || typeof value === "function");
const own = (object, name) => {
  if (!ref(object)) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(object, name);
  return descriptor && Object.hasOwn(descriptor, "value") ? descriptor.value : undefined;
};
const oneLine = (value, max) => (typeof value === "string"
  ? [...value.replace(/[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩]+/gu, " ").trim()].slice(0, max).join("") : "");

// ---- shared navigation identity -------------------------------------------------
// window → { refs, phase, subscribers, listener }; browser → top-level location
// changes counted since its window was first tracked in this process.
const TRACKERS = new WeakMap();
const NAVIGATIONS = new WeakMap();

function tracker(window) {
  const existing = TRACKERS.get(window);
  if (existing) return existing;
  const gBrowser = window?.gBrowser;
  if (typeof gBrowser?.addTabsProgressListener !== "function") return null;
  const entry = { refs: 0, phase: null, subscribers: new Set(), gBrowser, listener: null };
  entry.listener = { onLocationChange(browser, webProgress) { if (webProgress?.isTopLevel) rotate(entry, browser); } };
  gBrowser.addTabsProgressListener(entry.listener);
  TRACKERS.set(window, entry);
  return entry;
}
function release(window, entry) {
  if (--entry.refs > 0 || TRACKERS.get(window) !== entry) return;
  TRACKERS.delete(window);
  try { entry.gBrowser.removeTabsProgressListener(entry.listener); } catch {}
}
/** Counter first; then the owner clears console state; then subscribers (a
 * handoff ends its session); then the owner restarts readiness. */
function rotate(entry, browser) {
  NAVIGATIONS.set(browser, (NAVIGATIONS.get(browser) ?? 0) + 1);
  const phase = entry.phase;
  try { phase?.before(browser); } catch {}
  for (const callback of [...entry.subscribers]) { try { callback(browser); } catch {} }
  try { phase?.after(browser); } catch {}
}

/** "w<innerWindowId>.n<count>" for the browser's current document while its
 * window is tracked, else null. */
export function currentNativeNavigationId(window, browser) {
  try {
    if (!TRACKERS.has(window)) return null;
    const inner = browser?.browsingContext?.currentWindowGlobal?.innerWindowId;
    if (!Number.isSafeInteger(inner) || inner < 1) return null;
    return `w${inner}.n${NAVIGATIONS.get(browser) ?? 0}`;
  } catch { return null; }
}

/** Chrome-only: `callback(browser)` after each top-level location change of a
 * tab of `window`, through the same single listener and counter. Returns
 * unsubscribe, or null when the window has no tabbrowser. The process owner's
 * onNativeNavigation is the same subscription for an attached window. */
export function watchNativeNavigation(window, callback) {
  if (typeof callback !== "function") return null;
  const entry = tracker(window);
  if (!entry) return null;
  entry.refs++;
  entry.subscribers.add(callback);
  let done = false;
  return () => { if (done) return; done = true; entry.subscribers.delete(callback); release(window, entry); };
}

function trackOwnerPhase(window, phase) {
  const entry = tracker(window);
  if (!entry) return null;
  entry.refs++;
  entry.phase = phase;
  let done = false;
  return () => { if (done) return; done = true; if (entry.phase === phase) entry.phase = null; release(window, entry); };
}

// ---- registration and engine --------------------------------------------------------
let actorRegistered = false;
/** Registers the actor once per process (the parent propagates it). */
export function registerConsoleErrorsActor(chromeUtils = globalThis.ChromeUtils) {
  if (actorRegistered) return true;
  chromeUtils.registerWindowActor(CONSOLE_ACTOR, CONSOLE_ACTOR_OPTIONS);
  actorRegistered = true;
  return true;
}

const DISABLED_FLAG = new Set(["0", ""]);
/**
 * The engine a tab shows, for console collection only: "gecko", "chromium"
 * or null (unavailable). With the window's engine probe handle, only its
 * actual engineOf() result while it is neither pending nor disposed. Without
 * one, Gecko only when fresh reads of the privileged environment prove both
 * AXIOSOZO_ENGINE_SWITCHING and AXIOSOZO_ENGINE_PROBE disabled ("0" or the
 * absent-value ""), EngineRegistry agrees, and the tab's current Gecko
 * browser and window global are its own. Nothing defaults to Gecko.
 */
export function createConsoleEngineOf({ window, engineProbe = null, env = null, webModeEnabled = chromiumWebModeEnabled } = {}) {
  return tab => {
    try {
      if (engineProbe) {
        const state = engineProbe.diagnostics();
        if (!state || state.pending !== false || state.disposed !== false) return null;
        const engine = engineProbe.engineOf(tab);
        return engine === "gecko" || engine === "chromium" ? engine : null;
      }
      const variables = typeof env === "function" ? env() : null;
      if (!variables || typeof variables.get !== "function") return null;
      const switching = variables.get("AXIOSOZO_ENGINE_SWITCHING"), probe = variables.get("AXIOSOZO_ENGINE_PROBE");
      if (typeof switching !== "string" || typeof probe !== "string" || !DISABLED_FLAG.has(switching) || !DISABLED_FLAG.has(probe)) return null;
      if (typeof webModeEnabled === "function" && webModeEnabled(window) !== false) return null;
      if (!tab || tab.documentGlobal !== window || tab.closing !== false) return null;
      const browser = tab.linkedBrowser, global = browser?.browsingContext?.currentWindowGlobal;
      if (!browser || window.gBrowser?.getTabForBrowser(browser) !== tab || !global || global.isCurrentGlobal !== true || global.isClosed !== false) return null;
      return "gecko";
    } catch { return null; }
  };
}

/** Host and path of a page for a native caption, never its query or fragment. */
export function consolePlace(url) {
  const parsed = typeof url === "string" ? URL.parse(url) : null;
  if (!parsed) return "a tab";
  return oneLine(`${parsed.host}${parsed.pathname.replace(/\/+$/u, "")}`, 120) || "a tab";
}
/** "2 errors and 1 warning" (counts only). */
export function consoleCountText({ errors = 0, warnings = 0 } = {}) {
  const part = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return [errors ? part(errors, "error") : null, warnings ? part(warnings, "warning") : null].filter(Boolean).join(" and ") || "no errors";
}

let installed = null;
/** The installed process owner, or null; never creates one. */
export const getConsoleErrorsNativeRuntime = () => installed;

function chromeTimers() {
  const { setTimeout, clearTimeout } = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  return { setTimeout, clearTimeout };
}

/**
 * Creates the process owner (AxioSozoStartup: processSingleton("console-errors-native")).
 * `services`: AxioSozoServices with its chrome-only native authority methods.
 * Injected for tests: core, clock, timers, registerActor, isWindowActive(window),
 * elapsed(), securityDelayMs, allocateId.
 */
export function createConsoleErrorsNativeRuntime({ services, core = defaultCore, clock = () => Date.now(), timers = null,
  registerActor = registerConsoleErrorsActor, isWindowActive = null, elapsed = () => Date.now(), securityDelayMs = 500,
  allocateId = undefined } = {}) {
  for (const name of ["isNormalWindow", "prepareNativeProjectAuthority", "readNativeProjectSnapshot", "captureNativeProjectAuthority",
    "onNativeProjectAuthority", "registerNativeBrowserOwner"]) {
    if (typeof services?.[name] !== "function") throw Object.assign(new Error("INVALID_DEPENDENCIES"), { code: "INVALID_DEPENDENCIES" });
  }
  if (installed) throw Object.assign(new Error("OWNER_EXISTS"), { code: "OWNER_EXISTS" });
  const clockTimers = timers ?? chromeTimers();
  const windowActive = typeof isWindowActive === "function" ? isWindowActive
    : window => { try { return globalThis.Services?.focus?.activeWindow === window; } catch { return false; } };

  let disposed = false, activeWindow = null, routeSerial = 0, unsubscribeAuthority = null, unregisterOwner = null;
  const windows = new Map(); // registered normal window → its record
  const tabIds = new WeakMap(); // tab → registry ID last issued for it
  const idToTab = new Map(); // registry ID → { tab, window }
  const actors = new Set(); // parent actors this owner talked to; removed on destruction
  const destroyed = new WeakSet();
  const queries = new Set(); // outstanding capture queries
  const counters = { authorized: 0, offers: 0, leases: 0, accepted: 0, timeouts: 0, navigations: 0, invalidations: 0,
    settles: 0, restarts: 0, choosers: 0, chosen: 0, composers: 0, refused_choosers: 0,
    // Readiness requests (Authorize) and the one existing gate that refused each:
    // the authorize_refused_* stages sum with `authorized` to authorize_calls;
    // authorize_errors counts those refusals that were a caught exception.
    authorize_calls: 0, authorize_errors: 0,
    ...Object.fromEntries(AUTHORIZE_STAGES.map(stage => [`authorize_refused_${stage}`, 0])) };
  const tally = name => { if (counters[name] < DIAGNOSTIC_CEILING) counters[name]++; };
  // The gate of ownerForActor's latest refusal and whether it was an exception:
  // read by authorizeActor right after its own synchronous call, nothing else.
  let ownerStage = null, ownerError = false;

  const normalWindow = record => {
    try { return !disposed && windows.get(record.window) === record && record.window.closed === false
      && services.isNormalWindow(record.window) === true && record.adapter.isPrivateWindow() === false; } catch { return false; }
  };
  const recordOf = window => { const record = windows.get(window); return record && normalWindow(record) ? record : null; };
  const tabsOf = record => { try { return Array.from(record.window.gBrowser.tabs ?? []).slice(0, MAX_TABS); } catch { return []; } };
  const engineOf = (record, tab) => {
    try { const engine = record.engineOf(tab); return engine === "gecko" || engine === "chromium" ? engine : null; } catch { return null; }
  };
  const sensitive = host => {
    try { const value = core.isSensitiveHost(host); return typeof value?.sensitive === "boolean" ? value.sensitive : true; } catch { return true; }
  };

  /** Privacy, current and top-level facts of a tab's own browser and window
   * global, read before any document or URI fact. */
  function tabFacts(record, tab) {
    try {
      if (!tab || tab.documentGlobal !== record.window || tab.closing !== false || tab.isConnected !== true) return null;
      const browser = tab.linkedBrowser;
      if (!browser || record.window.gBrowser.getTabForBrowser(browser) !== tab) return null;
      const context = browser.browsingContext;
      if (!context || context.usePrivateBrowsing !== false || context.originAttributes?.privateBrowsingId !== 0) return null;
      if (context.parent !== null || context.top !== context || context.isContent !== true || context.isDiscarded !== false
        || context.embedderElement !== browser) return null;
      const global = context.currentWindowGlobal;
      if (!global || global.isClosed !== false || global.isCurrentGlobal !== true || global.browsingContext !== context) return null;
      const inner = global.innerWindowId, browserId = browser.browserId;
      if (!Number.isSafeInteger(inner) || inner < 1 || !Number.isSafeInteger(browserId) || browserId < 1
        || !ref(browser.permanentKey) || !ref(browser.frameLoader)) return null;
      return { tab, browser, context, global, inner, browserId, permanentKey: browser.permanentKey, frameLoader: browser.frameLoader };
    } catch { return null; }
  }
  const sameFacts = (a, b) => !!a && !!b && ["tab", "browser", "context", "global", "inner", "browserId", "permanentKey", "frameLoader"]
    .every(key => a[key] === b[key]);

  /** Document facts after tabFacts: content, non-error, credential-free http(s). */
  function documentFacts(facts) {
    try {
      const { global, browser, context } = facts;
      if (global.failedChannel) return null;
      const principal = global.documentPrincipal;
      if (!principal || principal.isSystemPrincipal !== false || principal.isNullPrincipal !== false
        || principal.isContentPrincipal !== true || principal.privateBrowsingId !== 0) return null;
      const userContextId = principal.userContextId;
      if (!Number.isSafeInteger(userContextId) || userContextId < 0 || context.originAttributes?.userContextId !== userContextId) return null;
      const spec = global.documentURI?.spec;
      if (typeof spec !== "string" || spec.length > MAX_URL || spec !== browser.currentURI?.spec) return null;
      const url = URL.parse(spec);
      if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
      return { url: url.href, userContextId, blocked: sensitive(url.hostname) };
    } catch { return null; }
  }

  /** The tab's space and a per-tab revision that moves whenever it changes. */
  function routeFor(record, tab) {
    if (!ref(tab)) return null;
    let contextUuid;
    try { contextUuid = record.adapter.workspaceForTab(tab) ?? null; } catch { return null; }
    if (contextUuid !== null && typeof contextUuid !== "string") return null;
    let entry = record.routes.get(tab), changed = false;
    if (!entry || entry.contextUuid !== contextUuid) {
      if (routeSerial >= Number.MAX_SAFE_INTEGER) return null;
      changed = !!entry;
      entry = freeze({ contextUuid, revision: ++routeSerial });
      record.routes.set(tab, entry);
    }
    return { route: entry, changed };
  }

  /** The settled project of a page: the same unambiguous URL and container
   * rules as AxioSozoServices.captureHandoffAuthority; a conflict is none. */
  function matchProject({ url, userContextId, contextUuid }, snapshot) {
    if (!snapshot) return null;
    const projects = snapshot.projects;
    let match = null;
    try { match = core.matchProjectForUrl(projects, url, { contextUuid: contextUuid ?? undefined }); } catch { return null; }
    const byUrl = match && !match.ambiguous ? projects.find(item => item.id === match.project_id) ?? null : null;
    const owners = userContextId > 0 ? projects.filter(item => item.container?.user_context_id === userContextId) : [];
    const byContainer = owners.length === 1 ? owners[0] : null;
    const conflict = !!byUrl && !!byContainer && byUrl !== byContainer;
    const found = conflict ? null : byUrl ?? byContainer;
    return freeze({ project_id: found?.id ?? null, ambiguous: conflict || (!found && match?.ambiguous === true), revision: snapshot.revision });
  }
  const snapshotNow = () => { try { return services.readNativeProjectSnapshot(); } catch { return null; } };

  // ---- the registry's required native callbacks ---------------------------------------
  const nativeRegistry = {
    isPrivateWindow: window => {
      const record = windows.get(window);
      if (!record) return null;
      try { const value = record.adapter.isPrivateWindow(); return typeof value === "boolean" ? value : null; } catch { return null; }
    },
    isWindowRegistered: window => {
      if (disposed || !windows.has(window)) return false;
      try { return services.isNormalWindow(window) === true ? true : null; } catch { return null; }
    },
    isWindowClosed: window => { try { return typeof window.closed === "boolean" ? window.closed : null; } catch { return null; } },
    isTabLive: (tab, window) => {
      try {
        if (tab.documentGlobal !== window || tab.closing === true || tab.isConnected === false) return false;
        return tab.closing === false && tab.isConnected === true ? true : null;
      } catch { return null; }
    },
    getBrowser: (tab, window) => {
      try { const browser = tab.linkedBrowser; return browser && window.gBrowser.getTabForBrowser(browser) === tab ? browser : null; } catch { return null; }
    },
    isPrivateBrowser: browser => {
      try { const value = browser.browsingContext?.usePrivateBrowsing; return typeof value === "boolean" ? value : null; } catch { return null; }
    },
    getBrowserIdentity: browser => {
      try {
        const frameLoader = browser.frameLoader;
        return { nativeBrowserId: browser.browserId, permanentKey: browser.permanentKey, browsingContext: browser.browsingContext,
          frameLoader, frameLoaderOwner: frameLoader?.ownerElement ?? null, frameLoaderContext: frameLoader?.browsingContext ?? null };
      } catch { return null; }
    },
    getContextState: context => {
      try {
        const attributes = context.originAttributes;
        return { isContent: context.isContent, top: context.top, isDiscarded: context.isDiscarded, private: context.usePrivateBrowsing,
          privateBrowsingId: attributes?.privateBrowsingId, userContextId: attributes?.userContextId, embedder: context.embedderElement };
      } catch { return null; }
    },
    getCurrentDocument: context => { try { return context.currentWindowGlobal ?? null; } catch { return null; } },
    getDocumentState: global => {
      try {
        const principal = global.documentPrincipal;
        return { browsingContext: global.browsingContext, isCurrentGlobal: global.isCurrentGlobal, isClosed: global.isClosed,
          failedChannel: global.failedChannel ?? null, document_id: global.innerWindowId, principal,
          isSystemPrincipal: principal?.isSystemPrincipal, isNullPrincipal: principal?.isNullPrincipal,
          privateBrowsingId: principal?.privateBrowsingId, userContextId: principal?.userContextId };
      } catch { return null; }
    },
    getDocumentURL: (global, browser) => {
      try { const spec = global.documentURI?.spec; return typeof spec === "string" && spec === browser.currentURI?.spec ? spec : null; } catch { return null; }
    },
    // Console admission never reads the page title: every refresh would
    // otherwise read it before the child's own password gate.
    getTitle: () => "",
    getEngine: tab => { const record = windows.get(tab?.documentGlobal); return record ? engineOf(record, tab) : null; },
    // One active tab for the whole process: the selected tab of the most recently active registered window.
    isActiveTab: (tab, window) => { try { return activeWindow === window && window.gBrowser.selectedTab === tab; } catch { return null; } },
    getRoute: (tab, window) => { const record = windows.get(window); return record ? routeFor(record, tab)?.route ?? null : null; },
    getProjectRevision: () => snapshotNow()?.revision ?? null,
    matchProject: facts => {
      const snapshot = snapshotNow();
      return snapshot && snapshot.revision === facts.project_revision ? matchProject(facts, snapshot) : null;
    },
    classifyHost: host => core.isSensitiveHost(host),
  };
  const registry = new AgentTabRegistry(nativeRegistry, { maxTabs: MAX_TABS, ...(allocateId ? { allocateId } : {}) });

  /** The registry's ID for this tab (its idempotent resolver), remembered for reverse lookups. */
  function register(record, tab) {
    let id = null;
    try { id = registry.register(tab, record.window); } catch { id = null; }
    if (!id) return null;
    const previous = tabIds.get(tab);
    if (previous && previous !== id) idToTab.delete(previous);
    tabIds.set(tab, id);
    idToTab.set(id, { tab, window: record.window });
    return id;
  }
  function forgetTab(tab) {
    const id = tabIds.get(tab);
    if (id) idToTab.delete(id);
    tabIds.delete(tab);
    try { registry.forget(tab); } catch {}
  }

  // ---- the facade's trusted dependencies ------------------------------------------------
  /** Fresh native policy facts; privacy, current and top-level first. */
  function readPolicy(owner) {
    const window = own(owner, "window");
    const deny = extra => freeze({ normal: false, private: true, current: false, top_level: false, engine: null, blocked_category: true, window, ...extra });
    const record = disposed ? null : recordOf(window);
    if (!record) return deny();
    let tab = own(owner, "tab");
    const tab_id = own(owner, "tab_id");
    if (tab === undefined) {
      const entry = idToTab.get(tab_id);
      tab = entry && entry.window === window && tabIds.get(entry.tab) === tab_id ? entry.tab : null;
    } else if (tab_id !== undefined && tabIds.get(tab) !== tab_id) tab = null;
    const facts = tab ? tabFacts(record, tab) : null;
    if (!facts) return deny({ normal: true });
    const stale = extra => freeze({ normal: true, private: false, current: false, top_level: true, engine: null, blocked_category: true, window, ...extra });
    const expected = own(owner, "windowGlobal");
    if (expected !== undefined && expected !== facts.global) return stale();
    const engine = engineOf(record, tab);
    if (engine !== "gecko") return stale({ current: true, engine });
    if (!sameFacts(facts, tabFacts(record, tab))) return stale();
    const document = documentFacts(facts);
    if (!document) return stale({ engine });
    if (document.blocked !== false) return stale({ current: true, engine, blocked_category: true });
    const route = routeFor(record, tab)?.route ?? null;
    const snapshot = snapshotNow();
    const match = snapshot ? matchProject({ url: document.url, userContextId: document.userContextId, contextUuid: route?.contextUuid ?? null }, snapshot) : null;
    const navigation_id = currentNativeNavigationId(window, facts.browser);
    // The same native browser, global and engine after those reads.
    if (!sameFacts(facts, tabFacts(record, tab)) || engineOf(record, tab) !== "gecko") return stale();
    return freeze({ normal: true, private: false, current: true, top_level: true, engine: "gecko", blocked_category: false, window,
      tab_id: tabIds.get(tab), tab, windowGlobal: facts.global, document_id: String(facts.inner), navigation_id, url: document.url,
      project_id: match?.project_id ?? null, project_revision: snapshot?.revision, route_revision: route?.revision });
  }

  /** The settled project authority (AxioSozoServices), also void once this
   * window's routes moved. */
  function readProjectAuthority({ window, project_id } = {}) {
    const record = recordOf(window);
    if (!record) return null;
    const generation = record.routeGeneration;
    let authority = null;
    try { authority = services.captureNativeProjectAuthority({ window, project_id }); } catch { authority = null; }
    if (!authority || typeof authority.check !== "function") return null;
    const check = () => {
      try { return !disposed && windows.get(window) === record && record.routeGeneration === generation && authority.check() === true; }
      catch { return false; }
    };
    return freeze({ id: authority.id, root: authority.root, revision: authority.revision, check });
  }

  /** The exact registered actor instance of this current global, not destroyed. */
  function isActorCurrent(actor, scope) {
    try {
      const { window, tab, windowGlobal, tab_id } = scope;
      if (disposed || !ref(actor) || destroyed.has(actor) || !recordOf(window)) return false;
      const manager = actor.manager;
      return manager === windowGlobal && manager.getExistingActor(CONSOLE_ACTOR) === actor && manager.isCurrentGlobal === true
        && manager.isClosed === false && manager.browsingContext?.currentWindowGlobal === manager
        && manager.browsingContext.embedderElement === tab.linkedBrowser && window.gBrowser.getTabForBrowser(tab.linkedBrowser) === tab
        && tab.documentGlobal === window && tabIds.get(tab) === tab_id;
    } catch { return false; }
  }

  const { service, captures } = createConsoleErrorsService({ clock,
    isNormalWindow: window => !!recordOf(window), readPolicy, readProjectAuthority, isActorCurrent,
    registry: { withTrusted: (...args) => registry.withTrusted(...args), withConsoleInventory: (...args) => registry.withConsoleInventory(...args) } });
  setConsoleErrorsService(service);

  // ---- actors ---------------------------------------------------------------------------
  /** The native tab of an installed actor, from its own manager: never message data. */
  function ownerForActor(actor) {
    ownerStage = "disposed"; ownerError = false;
    if (disposed || !ref(actor) || destroyed.has(actor)) return null;
    try {
      ownerStage = "manager";
      const manager = actor.manager;
      if (!manager || manager.getExistingActor(CONSOLE_ACTOR) !== actor || manager.isClosed !== false || manager.isCurrentGlobal !== true) return null;
      ownerStage = "context";
      const context = manager.browsingContext;
      if (!context || context.parent !== null || context.top !== context || context.usePrivateBrowsing !== false
        || context.originAttributes?.privateBrowsingId !== 0 || context.currentWindowGlobal !== manager) return null;
      ownerStage = "window";
      const browser = context.embedderElement;
      const record = recordOf(browser?.documentGlobal);
      if (!record) return null;
      ownerStage = "tab";
      const tab = record.window.gBrowser.getTabForBrowser(browser);
      const facts = tab && tab.linkedBrowser === browser ? tabFacts(record, tab) : null;
      if (!facts || facts.global !== manager) return null;
      ownerStage = "register";
      const tab_id = register(record, tab);
      if (!tab_id) return null;
      ownerStage = null;
      actors.add(actor);
      return freeze({ window: record.window, tab_id, tab, windowGlobal: manager });
    } catch { ownerError = true; return null; }
  }

  /** The native tab of `tab` in a registered normal window; `expected`, when
   * given, must still be the registry's own issued descriptor. */
  function ownerForTab(window, tab, { expected } = {}) {
    const record = disposed ? null : recordOf(window);
    const facts = record ? tabFacts(record, tab) : null;
    if (!facts) return null;
    const tab_id = register(record, tab);
    if (!tab_id) return null;
    if (expected !== undefined && registry.withTrusted(tab_id, trusted => trusted.tab === tab && trusted.window === window, { expected }) !== true) return null;
    return freeze({ window, tab_id, tab, windowGlobal: facts.global });
  }

  function authorizeActor(actor) {
    tally("authorize_calls");
    const owner = ownerForActor(actor);
    if (!owner) {
      tally(`authorize_refused_${ownerStage ?? "disposed"}`);
      if (ownerError) tally("authorize_errors");
      return DISABLED;
    }
    try {
      const grant = service.authorize(owner);
      if (grant?.enabled) counters.authorized++; else tally("authorize_refused_facade");
      return grant;
    } catch { tally("authorize_refused_facade"); tally("authorize_errors"); return DISABLED; }
  }

  function cancelQueries(match) {
    for (const query of [...queries]) if (match(query)) query.cancel();
  }

  /** One offer: the facade's gates and lease, then exactly one query on this
   * same actor; the awaited completion alone can complete the lease. */
  function handleOffer(actor, readOffer) {
    if (disposed || typeof readOffer !== "function") return;
    const owner = ownerForActor(actor);
    if (!owner) return;
    counters.offers++;
    let started = null;
    try { started = captures.begin(owner, actor, readOffer); } catch { started = null; }
    if (!started) return;
    counters.leases++;
    capture(owner, actor, started).catch(() => {});
  }

  async function capture(owner, actor, { lease, challenge }) {
    const query = { actor, tab: owner.tab, window: owner.window, started: clock(), timer: null, cancelled: false, cancel: null };
    const cancelled = new Promise(resolve => { query.cancel = () => { query.cancelled = true; resolve(CANCELLED); }; });
    queries.add(query);
    try {
      try { query.timer = clockTimers.setTimeout(() => { counters.timeouts++; query.cancel(); }, CONSOLE_QUERY_MS); }
      catch { query.cancel(); }
      let reply = CANCELLED;
      try {
        const answer = Promise.resolve(actor.sendQuery(CONSOLE_MESSAGES.CAPTURE, challenge)).then(value => value, () => CANCELLED);
        reply = await Promise.race([answer, cancelled]);
      } catch { reply = CANCELLED; }
      const took = clock() - query.started;
      // Timeout, rejection, navigation, destruction and invalidation cancel;
      // a reply that took too long is dropped, never completed late.
      if (reply === CANCELLED || query.cancelled || disposed || !(took >= 0 && took < CONSOLE_QUERY_MS)) return;
      queries.delete(query);
      const permit = captures.complete(lease, actor, () => reply);
      if (permit && service.acceptCapture(permit)) counters.accepted++;
    } finally {
      queries.delete(query);
      try { if (query.timer !== null) clockTimers.clearTimeout(query.timer); } catch {}
      try { captures.cancel(lease); } catch {}
    }
  }

  function actorDestroyed(actor) {
    if (!ref(actor)) return;
    destroyed.add(actor);
    actors.delete(actor);
    cancelQueries(query => query.actor === actor);
  }

  const send = (actor, name) => { try { actor.sendAsyncMessage(name, {}); return true; } catch { return false; } };

  /** Current http(s) documents of a window's own tabs get (or keep) their
   * actor and are asked to become ready again. Privacy first; nothing of a
   * page is read here. */
  function kick(record) {
    for (const tab of tabsOf(record)) {
      let actor = null;
      try {
        const context = tab.linkedBrowser?.browsingContext;
        if (!context || context.usePrivateBrowsing !== false) continue;
        const global = context.currentWindowGlobal;
        if (!global || global.isCurrentGlobal !== true) continue;
        actor = global.getActor(CONSOLE_ACTOR);
      } catch { continue; }
      if (!ref(actor) || destroyed.has(actor)) continue;
      actors.add(actor);
      if (send(actor, CONSOLE_MESSAGES.RESTART)) counters.restarts++;
    }
  }
  const refresh = () => { try { service.refresh(); } catch {} };

  // ---- windows ---------------------------------------------------------------------------
  function routeChanged(record) {
    if (windows.get(record.window) !== record) return;
    let changed = false;
    for (const tab of tabsOf(record)) if (routeFor(record, tab)?.changed) changed = true;
    if (!changed) return;
    record.routeGeneration++;
    refresh();
  }

  function navigationBefore(record, browser) {
    counters.navigations++;
    let tab = null;
    try { tab = record.window.gBrowser.getTabForBrowser(browser); } catch { tab = null; }
    if (tab) cancelQueries(query => query.tab === tab);
    const tab_id = tab ? tabIds.get(tab) : undefined;
    if (tab_id) {
      try { service.onNavigation({ window: record.window, tab_id }); } catch {}
      try { registry.invalidate(tab_id); } catch {}
    }
    if (record.chooser?.aboutBrowser === browser) closeChooser(record);
  }
  function navigationAfter(record, browser) {
    if (disposed || windows.get(record.window) !== record) return;
    let actor = null;
    try { actor = browser?.browsingContext?.currentWindowGlobal?.getExistingActor(CONSOLE_ACTOR) ?? null; } catch { actor = null; }
    if (ref(actor) && !destroyed.has(actor) && send(actor, CONSOLE_MESSAGES.RESTART)) counters.restarts++;
  }

  function attachWindow(window, { adapter, engineOf: engine } = {}) {
    if (disposed || !ref(window) || !adapter || typeof engine !== "function" || !window.gBrowser) return () => {};
    const existing = windows.get(window);
    if (existing) return existing.detach;
    let normal = false;
    try { normal = services.isNormalWindow(window) === true && adapter.isPrivateWindow() === false && window.closed === false; } catch { normal = false; }
    if (!normal) return () => {};
    const record = { window, adapter, engineOf: engine, routes: new WeakMap(), routeGeneration: 0, cleanups: [], composer: null,
      chooser: null, detach: null };
    record.detach = () => detachWindow(window);
    windows.set(window, record);
    const phase = trackOwnerPhase(window, { before: browser => navigationBefore(record, browser), after: browser => navigationAfter(record, browser) });
    if (phase) record.cleanups.push(phase);
    // Direct adapter listeners: Services suppresses switched events, and an
    // essential tab's space follows the active one.
    const onRoutes = () => routeChanged(record);
    for (const name of ["onChange", "onUpdate"]) {
      try { const off = typeof adapter[name] === "function" ? adapter[name](onRoutes) : null; if (typeof off === "function") record.cleanups.push(off); } catch {}
    }
    const tabs = window.gBrowser.tabContainer;
    const onClose = event => tabClosed(record, event?.target);
    const onAttribute = event => { if (routeFor(record, event?.target)?.changed) { record.routeGeneration++; refresh(); } };
    try {
      tabs?.addEventListener("TabClose", onClose);
      tabs?.addEventListener("TabAttrModified", onAttribute);
      record.cleanups.push(() => { tabs?.removeEventListener("TabClose", onClose); tabs?.removeEventListener("TabAttrModified", onAttribute); });
    } catch {}
    const onActivate = () => { if (windows.get(window) === record) activeWindow = window; };
    try { window.addEventListener?.("activate", onActivate); record.cleanups.push(() => window.removeEventListener?.("activate", onActivate)); } catch {}
    activeWindow ??= window;
    kick(record);
    refresh();
    return record.detach;
  }

  function tabClosed(record, tab) {
    if (!ref(tab) || windows.get(record.window) !== record) return;
    cancelQueries(query => query.tab === tab);
    forgetTab(tab);
    refresh();
  }

  function detachWindow(window) {
    const record = windows.get(window);
    if (!record) return false;
    closeChooser(record);
    record.composer = null;
    windows.delete(window);
    for (const cleanup of record.cleanups.splice(0).reverse()) { try { cleanup(); } catch {} }
    cancelQueries(query => query.window === window);
    try { registry.forgetWindow(window); } catch {}
    for (const [id, entry] of [...idToTab]) if (entry.window === window) { idToTab.delete(id); tabIds.delete(entry.tab); }
    if (activeWindow === window) activeWindow = null;
    if (!disposed) refresh();
    return true;
  }

  // ---- project authority -----------------------------------------------------------------
  function onAuthority(event) {
    if (disposed) return;
    if (event?.phase === "invalidated") {
      counters.invalidations++;
      try { service.invalidateProjects(); } catch {}
      cancelQueries(() => true);
      for (const record of windows.values()) closeChooser(record);
      for (const actor of [...actors]) send(actor, CONSOLE_MESSAGES.STOP);
      return;
    }
    if (event?.phase !== "settled") return;
    counters.settles++;
    for (const actor of [...actors]) ownerForActor(actor);
    refresh();
    for (const record of windows.values()) kick(record);
  }

  // ---- send errors to an agent: native chooser, then the existing composer ----------------
  function registerHandoffComposer(window, { openConsoleComposer } = {}) {
    const record = disposed ? null : windows.get(window);
    if (!record || typeof openConsoleComposer !== "function") return null;
    const composer = freeze({ openConsoleComposer });
    record.composer = composer;
    return () => { if (record.composer === composer) record.composer = null; };
  }

  const originNow = (originCurrent, requireSelected) => { try { return originCurrent({ requireSelected }) === true; } catch { return false; } };
  function projectName(project_id) {
    const record = snapshotNow()?.projects.find(item => item.id === project_id);
    return oneLine(record?.manifest?.name, 80) || "this project";
  }

  /** This window's tabs of the project with retained messages, from the
   * registry's issued descriptors; refs stay here, captions are host and path. */
  function candidatesFor(record, project_id) {
    const listed = registry.withTrustedList(entries => entries.filter(entry => entry.window === record.window
      && entry.descriptor.project_id === project_id && entry.descriptor.engine === "gecko" && entry.descriptor.private === false)
      .slice(0, 64).map(entry => ({ tab_id: entry.tab_id, tab: entry.tab, contextUuid: entry.contextUuid, descriptor: entry.descriptor })));
    if (!Array.isArray(listed)) return null;
    const out = [];
    for (const candidate of listed) {
      let result;
      try { result = service.readTab({ window: record.window, tab_id: candidate.tab_id }); } catch { continue; }
      if (!(result?.count > 0)) continue;
      const errors = result.messages.filter(message => message.level === "error").length;
      out.push(freeze({ ...candidate, count: result.count, errors, warnings: result.count - errors, place: consolePlace(candidate.descriptor.url) }));
    }
    return out.sort((a, b) => b.errors - a.errors || b.count - a.count);
  }

  function notice(record, browser, kind, name) {
    const text = {
      none: "No tab of <> in this window has console errors right now.",
      changing: "Your projects are changing, so no tab was chosen. Try again in a moment.",
      unavailable: "Console errors cannot be read right now, so no tab was chosen.",
      changed: "That tab or <> changed, so nothing was opened.",
    }[kind];
    counters.refused_choosers++;
    try {
      record.window.PopupNotifications?.show(browser, CHOOSER_NOTICE, text, null,
        { label: "OK", accessKey: "O", callback() {}, disableSecurityDelay: true }, null,
        { name, persistence: 0, removeOnDismissal: true, hideClose: true });
    } catch {}
  }

  function closeChooser(record, chooser = record.chooser) {
    if (!chooser || record.chooser !== chooser) return;
    record.chooser = null;
    chooser.consumed = true;
    try { record.window.PopupNotifications?.remove(chooser.notification); } catch {}
  }

  /** The chooser's content: a hidden <popupnotification> PopupNotifications
   * takes by id, like Firefox's own prompts (and Send to agent). */
  function chooserContent(record, candidates) {
    const document = record.window.document;
    const templateId = `${CHOOSER_NOTIFICATION}-notification`;
    let template = document.getElementById(templateId);
    if (!template) {
      template = document.createXULElement("popupnotification");
      template.id = templateId;
      template.hidden = true;
      const content = document.createXULElement("popupnotificationcontent");
      content.id = `${CHOOSER_NOTIFICATION}-content`;
      content.setAttribute("orient", "vertical");
      template.append(content);
      (document.getElementById("mainPopupSet") ?? document.documentElement).append(template);
      record.cleanups.push(() => template.remove());
    }
    const content = document.getElementById(`${CHOOSER_NOTIFICATION}-content`);
    const help = document.createXULElement("description");
    help.id = `${CHOOSER_NOTIFICATION}-help`;
    help.textContent = "Choose the tab. AxioSozo switches to it and opens Send to agent with its console errors selected. Nothing is copied until you choose Copy for agent.";
    help.style.maxWidth = "28em";
    const group = document.createXULElement("radiogroup");
    group.id = `${CHOOSER_NOTIFICATION}-tabs`;
    group.setAttribute("aria-label", "Tabs with console errors");
    group.setAttribute("aria-describedby", help.id);
    const radios = candidates.map((candidate, index) => {
      const radio = document.createXULElement("radio");
      radio.setAttribute("label", `${candidate.place} · ${consoleCountText(candidate)}`);
      radio.setAttribute("value", String(index));
      if (index === 0) radio.setAttribute("selected", "true");
      group.append(radio);
      return radio;
    });
    content.replaceChildren(help, group);
    return radios;
  }
  const chosenIndex = radios => radios.findIndex(radio => radio.getAttribute("selected") === "true");

  /** Opens the native chooser for a validated About project-home activation.
   * It grants nothing: no tab is selected and no composer opens until a
   * trusted choice in it. */
  function requestProjectErrorChooser({ window, project_id, aboutActor, originCurrent } = {}) {
    const record = disposed ? null : recordOf(window);
    if (!record || typeof originCurrent !== "function" || !PROJECT.test(project_id ?? "") || !originNow(originCurrent, true)) return false;
    let aboutBrowser = null;
    try { aboutBrowser = aboutActor.browsingContext.embedderElement ?? null; } catch { aboutBrowser = null; }
    if (!aboutBrowser || record.window.gBrowser.selectedBrowser !== aboutBrowser) return false;
    closeChooser(record);
    counters.choosers++;
    const name = projectName(project_id);
    let authority = null;
    try { authority = services.captureNativeProjectAuthority({ window, project_id }); } catch { authority = null; }
    if (!authority) { notice(record, aboutBrowser, "changing", name); return false; }
    const candidates = candidatesFor(record, project_id);
    if (!candidates) { notice(record, aboutBrowser, "unavailable", name); return false; }
    if (!candidates.length) { notice(record, aboutBrowser, "none", name); return false; }
    const manager = record.window.PopupNotifications;
    if (!manager || typeof record.window.document?.createXULElement !== "function") { notice(record, aboutBrowser, "unavailable", name); return false; }
    const chooser = { project_id, authority, candidates, originCurrent, aboutBrowser, name, radios: null, notification: null,
      consumed: false, shownAt: null };
    try {
      chooser.radios = chooserContent(record, candidates);
      record.chooser = chooser;
      chooser.notification = manager.show(aboutBrowser, CHOOSER_NOTIFICATION, "Send console errors of <> to an agent", null,
        { label: "Open tab", accessKey: "O", callback: ({ event } = {}) => { choose(record, chooser, event); } },
        [{ label: "Cancel", accessKey: "C", disableSecurityDelay: true, callback: () => closeChooser(record, chooser) }],
        { name, persistence: 0, removeOnDismissal: true, autofocus: true,
          eventCallback: state => {
            if (state === "shown" && chooser.shownAt === null) chooser.shownAt = elapsed();
            if (state === "removed" && record.chooser === chooser) { record.chooser = null; chooser.consumed = true; }
          } });
    } catch {
      if (record.chooser === chooser) record.chooser = null;
      return false;
    }
    return true;
  }

  /** The trusted choice: once, after the usual doorhanger delay, in the active window. */
  function choose(record, chooser, event) {
    if (event?.isTrusted !== true || chooser.consumed || record.chooser !== chooser || disposed || windows.get(record.window) !== record) return;
    if (securityDelayMs > 0 && (chooser.shownAt === null || elapsed() - chooser.shownAt < securityDelayMs)) return;
    let active = false;
    try { active = windowActive(record.window) === true; } catch { active = false; }
    if (!active) return;
    const candidate = chooser.candidates[chosenIndex(chooser.radios)] ?? null;
    closeChooser(record, chooser);
    if (!candidate) return;
    counters.chosen++;
    transfer(record, chooser, candidate).catch(() => {});
  }

  /** Selects the chosen existing tab (switching its space first if needed),
   * then asks this window's composer to open on it. Every step rechecks the
   * originating About document, the issued descriptor and the authority. */
  async function transfer(record, chooser, candidate) {
    const { originCurrent, authority, project_id } = chooser;
    const verify = () => {
      try {
        if (disposed || windows.get(record.window) !== record || !normalWindow(record) || authority.check() !== true) return false;
        return registry.withTrusted(candidate.tab_id, trusted => trusted.tab === candidate.tab && trusted.window === record.window
          && trusted.descriptor.project_id === project_id && trusted.descriptor.engine === "gecko"
          && trusted.descriptor.binding_token === candidate.descriptor.binding_token && tabFacts(record, candidate.tab) !== null,
        { expected: candidate.descriptor }) === true;
      } catch { return false; }
    };
    // A project home that is gone hears nothing; a changed target is said there.
    if (!originNow(originCurrent, true)) return;
    if (!verify()) { notice(record, chooser.aboutBrowser, "changed", chooser.name); return; }
    // From here the target is this tab; the About document must stay current, not selected.
    const activeSpace = () => { try { return record.adapter.activeWorkspaceUuid?.() ?? null; } catch { return undefined; } };
    // The tab's own space must be the window's active one (Zen shows only that space's tabs).
    const inSpace = () => !candidate.contextUuid || activeSpace() === candidate.contextUuid;
    if (!inSpace()) {
      // Zen's own switch; only a literal true with that space now active counts.
      let switched = false;
      try { switched = await record.adapter.switchTo(candidate.contextUuid); } catch { return; }
      if (switched !== true || !inSpace() || !originNow(originCurrent, false) || !verify()) return;
    }
    if (!inSpace() || !originNow(originCurrent, false) || !verify()) return;
    const gBrowser = record.window.gBrowser;
    try { gBrowser.selectedTab = candidate.tab; } catch { return; }
    if (gBrowser.selectedTab !== candidate.tab || gBrowser.selectedBrowser !== candidate.tab.linkedBrowser || !inSpace()
      || !originNow(originCurrent, false) || !verify()) return;
    const composer = record.composer;
    if (!composer) return;
    counters.composers++;
    try { composer.openConsoleComposer({ tab: candidate.tab, descriptor: candidate.descriptor, project_id, authority }); } catch {}
  }

  // ---- lifetime ---------------------------------------------------------------------------
  function onNativeNavigation(window, callback) {
    if (disposed || !windows.has(window)) return null;
    return watchNativeNavigation(window, callback);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    for (const window of [...windows.keys()]) detachWindow(window);
    cancelQueries(() => true);
    for (const actor of [...actors]) send(actor, CONSOLE_MESSAGES.STOP);
    actors.clear();
    idToTab.clear();
    try { unsubscribeAuthority?.(); } catch {}
    try { unregisterOwner?.(); } catch {}
    try { registry.close(); } catch {}
    try { service.dispose(); } catch {}
    if (installed === owner) installed = null;
  }

  const owner = freeze({
    registry, service,
    attachWindow, detachWindow, ownerForActor, ownerForTab, readPolicy, isActorCurrent, authorizeActor, handleOffer, actorDestroyed,
    onNativeNavigation, registerHandoffComposer, requestProjectErrorChooser, dispose,
    /** Counts only: no URLs, logs, titles, roots, IDs or tokens. */
    diagnostics: () => freeze({ disposed, windows: windows.size, actors: actors.size, queries: queries.size,
      choosers: [...windows.values()].filter(record => record.chooser).length, ...counters }),
  });

  installed = owner;
  try {
    try { registerActor(); } catch (error) { console.error("AxioSozo: console errors actor unavailable", error); }
    unregisterOwner = services.registerNativeBrowserOwner(owner);
    unsubscribeAuthority = services.onNativeProjectAuthority(onAuthority);
  } catch (error) {
    dispose();
    throw error;
  }
  Promise.resolve().then(() => (disposed ? false : services.prepareNativeProjectAuthority())).catch(() => {});
  return owner;
}
