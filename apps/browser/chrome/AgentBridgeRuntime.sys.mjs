/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The one process owner of the P4 browser tools (Plan 4 step 8, agent-channel
// -v1 §4). Created once by AxioSozoStartup through processSingleton("agent-
// bridge") on the Step 7 console owner, independently of the agent endpoint,
// which stays off until the explicit Settings action. It:
//
// - builds the root's standalone GeckoAgentTools on the console owner's shared
//   AgentTabRegistry (one registry, one owner, never one per window), the
//   Step 7 RAM console service (ownerForTab + readTab), the channel's trusted
//   isApprovedBridgeSession predicate and trusted Timer.sys.mjs timers;
// - installs one exact six-function composite into the channel: the read
//   baseline (projectAgentServiceTools) plus approved-request title metadata,
//   per-method availability and the separate action owner. The standalone
//   owners stay private here with their close/getState; About, content and
//   the wire never see them;
// - keeps every superseded standalone owner until its own close resolved
//   literal true, and denies screenshot and act methods while any superseded
//   cleanup is unresolved; shutdown revokes all sessions synchronously first;
// - keeps the released-session bound (4096 distinct IDs, then closed for good)
//   for the whole process, across every replacement, so a fresh standalone's
//   empty set never restores a released session or an exhausted owner. The
//   BiDi allocation budget is a separate bound, shared by capture and actions;
//   its quarantine is never reset either;
// - attaches each registered normal window: its action confirmations and one
//   navigation subscription on the shared Step 7 tracker.
//
// Capture is passed as the literal CAPTURE_ENABLED false, and every act/open
// capability is a literal false in AgentActionRuntime, until root accepts their
// actual ordinary-profile proof. Nothing here can be turned on by a
// preference, environment variable, page or agent request.
import { createGeckoAgentTools, projectAgentServiceTools } from "./GeckoAgentTools.sys.mjs";
import { AgentToolError, createBiDiAllocationBudget } from "./GeckoBiDiReadSession.sys.mjs";
import { createAgentCaptureRuntime } from "./AgentCaptureRuntime.sys.mjs";
import { createAgentActionRuntime, ACT_METHODS } from "./AgentActionRuntime.sys.mjs";
import { watchNativeNavigation } from "./ConsoleErrorsNativeRuntime.sys.mjs";

// Literal false until root accepts the native privacy evidence (step 8 gate).
export const CAPTURE_ENABLED = false;
export const AGENT_BRIDGE_METHODS = Object.freeze(["tabs.list", "tabs.active", "project.info", "console.errors",
  "tabs.screenshot", "tabs.open", "tabs.navigate", "page.click", "page.type"]);
export const MAX_TITLE = 4096;
// GeckoAgentTools' own bound, kept here for the whole process: a replacement
// standalone starts with an empty set and must never reset it.
export const RELEASED_SESSIONS_MAX = 4096;
const SESSION = /^s_[0-9a-f]{16}$/u;
const EMPTY = Object.freeze([]);
const ref = value => value !== null && (typeof value === "object" || typeof value === "function");
const fail = code => { throw new AgentToolError(code); };

/** A native title as one bounded line: controls and bidi overrides become
 * spaces; at most MAX_TITLE UTF-16 units, never a split surrogate pair. */
export function sanitizeTitle(value) {
  if (typeof value !== "string") return "";
  const text = value.replace(/[\u0000-\u001f\u007f-\u009f\u{202a}-\u{202e}\u{2066}-\u{2069}]+/gu, " ").replace(/\s+/gu, " ").trim();
  let out = "";
  for (const point of text) { if (out.length + point.length > MAX_TITLE) break; out += point; }
  return out;
}

const INERT_TOOLS = Object.freeze({
  isMethodAvailable: () => false, listTabs: () => EMPTY, getTab: () => null,
  executeMethod: () => Promise.reject(new AgentToolError("UNAVAILABLE")), confirmAction: () => false,
  releaseSession: () => Promise.resolve(true),
});

function chromeTimers() {
  const { setTimeout, clearTimeout } = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  return Object.freeze({ setTimeout, clearTimeout });
}

/**
 * `services`: AxioSozoServices (registerAgentBridge, installAgentBridgeTools,
 * isApprovedBridgeSession, agentBridgeProject, isNormalWindow, the native
 * project authority methods). `nativeOwner`: the existing Step 7 owner
 * (registry, service, ownerForTab). Injected for tests: timers, createTools,
 * createCapture, createAction, allocationBudget.
 */
export function createAgentBridgeRuntime({ services, nativeOwner, timers = null, createTools = createGeckoAgentTools,
  createCapture = createAgentCaptureRuntime, createAction = createAgentActionRuntime, allocationBudget = createBiDiAllocationBudget() } = {}) {
  for (const name of ["registerAgentBridge", "installAgentBridgeTools", "isApprovedBridgeSession", "agentBridgeProject",
    "isNormalWindow", "readNativeProjectSnapshot", "captureNativeProjectAuthority", "onNativeProjectAuthority"]) {
    if (typeof services?.[name] !== "function") throw new TypeError(`services.${name} required`);
  }
  const registry = nativeOwner?.registry;
  if (typeof registry?.withTrusted !== "function" || typeof registry.listMetadata !== "function" || typeof registry.metadata !== "function"
    || typeof nativeOwner.ownerForTab !== "function" || typeof nativeOwner.service?.readTab !== "function") throw new TypeError("console owner required");
  const clock = timers ?? chromeTimers();
  const setTimer = (fn, ms) => clock.setTimeout(fn, ms);
  const clearTimer = id => clock.clearTimeout(id);
  // Released session IDs for the whole process lifetime: every generation and
  // the action owner admit only IDs never released here. The 4097th distinct
  // release exhausts the tools for good; nothing here ever clears either.
  const released = new Set();
  let exhausted = false;
  const isSessionActive = id => {
    try { return !exhausted && SESSION.test(id ?? "") && !released.has(id) && services.isApprovedBridgeSession(id) === true; }
    catch { return false; }
  };

  let closed = false, closing = null, current = null, unsubscribe = null, unregister = null;
  const superseded = new Set(); // generations until their standalone close resolved true
  const windows = new Map();
  // One process capture and action owner, shared by every generation.
  const capture = createCapture({ registry, services, timers: clock, allocationBudget });
  const action = createAction({ registry, services, nativeOwner, isSessionActive, timers: clock, allocationBudget });

  /** Step 7 console read: the exact issued descriptor projected afresh, the
   * console owner's own native tab owner, then synchronous RAM readTab. */
  function readConsole(tab) {
    let result = null;
    const read = registry.withTrusted(tab?.tab_id, trusted => {
      const owner = nativeOwner.ownerForTab(trusted.window, trusted.tab, { expected: tab });
      if (!owner || owner.tab_id !== trusted.tab_id || owner.window !== trusted.window || owner.tab !== trusted.tab
        || owner.windowGlobal !== trusted.windowGlobal) return false;
      result = nativeOwner.service.readTab(owner);
      return true;
    }, { expected: tab });
    if (read !== true || !ref(result)) fail("UNAVAILABLE");
    return result;
  }

  function generation() {
    // The issued objects behind the baseline's own synchronous metadata calls,
    // kept for exactly one wrapper call; the baseline's copies carry no token.
    const issued = { list: null, tab: null };
    const standalone = createTools({
      getTabs: () => { const list = registry.listMetadata(); issued.list = list; return list; },
      getActiveTab: () => registry.listMetadata().find(tab => tab.active === true) ?? null,
      getTab: id => { const tab = registry.metadata(id); issued.tab = tab; return tab; },
      getProject: id => services.agentBridgeProject(id),
      getConsoleErrors: readConsole,
      isSensitiveHost: host => registry.isSensitiveHost(host) !== false,
      isSessionActive,
      captureEnabled: CAPTURE_ENABLED,
      getCaptureExpected: tab => capture.getCaptureExpected(tab),
      isCaptureCurrent: (expected, request) => capture.isCaptureCurrent(expected, request),
      createCaptureOwner: (request, context) => capture.createCaptureOwner(request, context),
      setTimer, clearTimer,
    });
    const baseline = projectAgentServiceTools(standalone);
    const gen = { standalone, baseline, issued, closing: null, retired: false, composite: null };
    gen.composite = composite(gen);
    return gen;
  }

  const live = gen => !closed && !exhausted && current === gen;
  const cleanupPending = () => superseded.size !== 0;

  /** Charged once per distinct ID, synchronously at release entry. */
  function charge(id) {
    if (typeof id !== "string" || !SESSION.test(id) || released.has(id) || exhausted) return;
    if (released.size >= RELEASED_SESSIONS_MAX) { exhaust(); return; }
    released.add(id);
  }
  /** Like the adapter's own 4097th release: every generation is denied now and
   * its in-flight work revoked; channel sessions stop after this call returns
   * (the release itself is running inside the channel's session close). */
  function exhaust() {
    exhausted = true;
    if (current) { const gen = current; current = null; superseded.add(gen); retire(gen).catch(() => {}); }
    Promise.resolve().then(() => { try { services.installAgentBridgeTools(INERT_TOOLS); } catch { /* channel closing */ } });
  }

  /** The frozen approved request view and its exact original AbortSignal,
   * approved now; anything else gets no title. */
  function approvedRequest(view, options) {
    const signal = options?.signal;
    if (!ref(view) || !Object.isFrozen(view) || typeof view.session !== "string" || !SESSION.test(view.session)
      || view.state !== "approved" || !ref(signal) || signal.aborted !== false) return null;
    return isSessionActive(view.session) ? Object.freeze({ session: view.session, signal }) : null;
  }
  /** Title only: the cached native title of the exact issued window global,
   * in a separate copy. The issued descriptor and the registry's own blank
   * title are never changed. */
  function titled(gen, copy, issued, request) {
    if (!request || !ref(copy) || !ref(issued) || issued.tab_id !== copy.tab_id) return copy;
    const title = registry.withTrusted(copy.tab_id, trusted => {
      const now = trusted.descriptor;
      if (["url", "document_id", "project_id", "userContextId", "engine"].some(key => now[key] !== copy[key])) return null;
      const value = trusted.windowGlobal.documentTitle;
      return typeof value === "string" ? value : null;
    }, { expected: issued });
    if (typeof title !== "string" || !live(gen) || request.signal.aborted || !isSessionActive(request.session)) return copy;
    return Object.freeze({ ...copy, title: sanitizeTitle(title) });
  }

  function composite(gen) {
    const { baseline, issued } = gen;
    return Object.freeze({
      isMethodAvailable(method) {
        if (!live(gen) || !AGENT_BRIDGE_METHODS.includes(method)) return false;
        if (ACT_METHODS.includes(method)) return !cleanupPending() && action.isMethodAvailable(method) === true;
        if (method === "tabs.screenshot" && cleanupPending()) return false;
        return baseline.isMethodAvailable(method) === true;
      },
      listTabs(view, options) {
        if (!live(gen)) return EMPTY;
        const request = approvedRequest(view, options);
        issued.list = null;
        let copies, list;
        try {
          copies = baseline.listTabs();
          list = new Map((issued.list ?? []).map(value => [value.tab_id, value]));
        } finally { issued.list = null; }
        if (!request) return copies;
        const result = copies.map(copy => titled(gen, copy, list.get(copy.tab_id), request));
        return live(gen) && !request.signal.aborted && isSessionActive(request.session) ? Object.freeze(result) : copies;
      },
      getTab(id, view, options) {
        if (!live(gen)) return null;
        const request = approvedRequest(view, options);
        issued.tab = null;
        let copy, tab;
        try { copy = baseline.getTab(id); tab = issued.tab; } finally { issued.tab = null; }
        return copy && request ? titled(gen, copy, tab, request) : copy;
      },
      executeMethod(method, params, view, options = {}) {
        if (!live(gen)) return Promise.reject(new AgentToolError("UNAVAILABLE"));
        if (ACT_METHODS.includes(method)) {
          if (cleanupPending() || action.isMethodAvailable(method) !== true) return Promise.reject(new AgentToolError("UNAVAILABLE"));
          const project = view?.project_id ? services.readNativeProjectSnapshot()?.projects?.find(item => item.id === view.project_id) : null;
          const userContextId = view?.project_id ? project?.container?.user_context_id ?? null : 0;
          return action.executeMethod(method, params, view, { tab: options.tab ?? null, signal: options.signal, userContextId });
        }
        if (method === "tabs.screenshot" && cleanupPending()) return Promise.reject(new AgentToolError("UNAVAILABLE"));
        // The original Core request signal, unchanged; Core's tab is not authority.
        return baseline.executeMethod(method, params, view, { signal: options.signal });
      },
      confirmAction(request, options) {
        if (!live(gen)) return false;
        return Promise.resolve(action.confirmAction(request, options)).then(value => value === true, () => false);
      },
      releaseSession(id, reason) {
        charge(id);
        const jobs = [baseline.releaseSession(id, reason), action.releaseSession(id)].map(job => Promise.resolve(job).then(value => value === true, () => false));
        const job = Promise.all(jobs).then(results => results.every(Boolean));
        job.catch(() => {});
        return job;
      },
    });
  }

  /** Awaited private close of a retired standalone owner; failures stay. */
  function retire(gen) {
    if (gen.retired) return Promise.resolve(true);
    if (gen.closing) return gen.closing;
    let result;
    try { result = gen.standalone.close(); } catch (error) { result = Promise.reject(error); }
    const attempt = Promise.resolve(result).then(value => value === true, () => false).then(done => {
      if (done) { gen.retired = true; superseded.delete(gen); }
      return done;
    }).finally(() => { gen.closing = null; });
    gen.closing = attempt;
    return attempt;
  }

  /** Installs a fresh generation; the previous one is revoked at once (its
   * close revokes synchronously at entry) and retained until it closed. */
  function replace() {
    if (closed || exhausted) fail("UNAVAILABLE");
    const previous = current;
    const next = generation();
    current = next;
    if (previous) { superseded.add(previous); retire(previous).catch(() => {}); }
    try { services.installAgentBridgeTools(next.composite); }
    catch (error) { current = null; superseded.add(next); retire(next).catch(() => {}); throw error; }
    return true;
  }

  function attachWindow(window, { adapter } = {}) {
    if (closed || !ref(window)) return () => {};
    const existing = windows.get(window);
    if (existing) return existing.detach;
    let normal = false;
    try { normal = services.isNormalWindow(window) === true && adapter?.isPrivateWindow() === false && window.closed === false; } catch { normal = false; }
    if (!normal) return () => {};
    const record = { window, cleanups: [], detach: null };
    record.detach = () => detachWindow(window);
    record.cleanups.push(action.attachWindow(window));
    // The shared Step 7 tracker: no second progress listener or counter.
    const unwatch = watchNativeNavigation(window, browser => action.invalidateBrowser(window, browser));
    if (typeof unwatch === "function") record.cleanups.push(unwatch);
    windows.set(window, record);
    return record.detach;
  }
  function detachWindow(window) {
    const record = windows.get(window);
    if (!record) return false;
    windows.delete(window);
    for (const cleanup of record.cleanups.splice(0).reverse()) { try { cleanup(); } catch {} }
    return true;
  }

  /** Shutdown: new work is denied and every channel session is revoked
   * synchronously, then each retained owner's own close is awaited. Literal
   * true only after every one of them resolved true; a later call retries. */
  function close() {
    if (closing) return closing;
    closed = true;
    try { services.installAgentBridgeTools(INERT_TOOLS); } catch { /* the channel is closing too */ }
    try { unsubscribe?.(); } catch {}
    unsubscribe = null;
    for (const window of [...windows.keys()]) detachWindow(window);
    if (current) { superseded.add(current); current = null; }
    const attempt = Promise.allSettled([...[...superseded].map(retire), Promise.resolve().then(() => action.close()),
      Promise.resolve().then(() => capture.close())]).then(results => {
      const done = results.every(result => result.status === "fulfilled" && result.value === true) && superseded.size === 0;
      if (done) { try { unregister?.(); } catch {} }
      return done;
    }).finally(() => { closing = null; });
    closing = attempt;
    return attempt;
  }

  function capabilities() {
    const gen = current;
    return Object.freeze(AGENT_BRIDGE_METHODS.map(method => {
      const available = !!gen && gen.composite.isMethodAvailable(method) === true;
      const reason = available ? null : closed ? "CLOSED" : exhausted ? "SESSIONS_EXHAUSTED" : cleanupPending() ? "CLEANUP_PENDING"
        : method === "tabs.screenshot" ? "CAPTURE_NOT_ENABLED" : method === "tabs.open" ? "OPEN_NOT_ENABLED"
          : ACT_METHODS.includes(method) ? "ACT_NOT_ENABLED" : "UNAVAILABLE";
      return Object.freeze({ method, available, reason });
    }));
  }

  const runtime = Object.freeze({
    attachWindow, detachWindow, replace, close, capabilities,
    /** Counts only: no titles, URLs, tokens, sessions or handles. */
    getState: () => Object.freeze({ closed, installed: !!current, superseded: superseded.size, windows: windows.size,
      released_sessions: released.size, sessions_exhausted: exhausted,
      tools: current?.standalone.getState() ?? null, capture: capture.getState(), action: action.getState() }),
  });

  unregister = services.registerAgentBridge(runtime);
  unsubscribe = services.onNativeProjectAuthority(event => { if (event?.phase === "invalidated") action.invalidateAll(); });
  // Without a channel the tools stay uninstalled; every method reports unavailable.
  try { replace(); } catch (error) { console.error("AxioSozo: agent tools not installed", error?.code ?? error); }
  return runtime;
}
