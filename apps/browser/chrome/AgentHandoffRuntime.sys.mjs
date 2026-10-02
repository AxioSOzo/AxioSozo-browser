/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// P3 "Send to agent" in one normal browser window (workstation-v1 §5.1,
// AgentHandoff.sys.mjs). One shortcut (⌥⌘A) and one page context-menu item
// open a native doorhanger on the selected tab: a task, an explicit opt-in for
// the selected text, and "Copy for agent". Nothing about the page is read
// while a menu merely opens. The trusted command starts a session bound to
// the tab's native identity; the doorhanger's trusted Copy click admits the
// exact request object once (by object identity) and hands it to the pure
// handoff core with this session's tab, capture and clipboard adapters.
//
// Privacy and identity come from chrome only: the registered normal window,
// its tabbrowser's selected tab and selected browser (read directly, never
// inferred from events), the tab, its browser, permanentKey, frameLoader, top
// browsing context, current window global and inner window, content
// principal and origin, exact URL, container, space, engine and a navigation
// counter that also moves on same-document navigation. The content actor (AgentHandoffChild) answers two bounded read
// queries for that exact global; its answers are validated and rebound here.
// Project authority comes from AxioSozoServices.captureHandoffAuthority and is
// checked synchronously, together with the whole tab identity and the abort
// signal, immediately before nsIClipboardHelper.copyString, with no await in
// between. Navigation, tab switch or close, dismissal, project changes and
// window teardown end the session. Opening Claude Code, Codex or a desktop app
// is not offered: product launches are NOT_AUTHORIZED and desktop schemes
// unverified, so the explicit action is a clipboard copy. Screenshots and
// console errors are not collected in this build.
//
// Synthetic test agent (Plan 4 step 4 acceptance only): when the privileged
// environment of an owned synthetic browser asks for the fake Terminal fixture,
// the composer also shows "Send to synthetic test agent". Only showing it reads
// those environment flags; nothing is constructed or spawned. A fresh trusted
// click on it asks the root-owned factory (TerminalHandoffConfig) for its
// fixture, with this session's AbortSignal and an isActive() that is literally
// true only while this exact session is sending on its still-selected tab and
// browser, with every identity fact and the project authority unchanged. The
// factory's own adapter and configuration are the only ones handed to the pure
// core; the request never falls back to the clipboard, and an uncertain launch
// is reported as uncertain, never retried or copied. The fixture is closed on
// every outcome, cancellation and teardown.
import { createHandoff, HANDOFF_LIMITS } from "./AgentHandoff.sys.mjs";
import { HANDOFF_MESSAGES, handoffLine, handoffProse } from "./AgentHandoffChild.sys.mjs";
import * as defaultCore from "./contexts/index.mjs";
import { XHTML, defaultTimers, prefEnabled, addTabsProgressListener } from "./DevLoop.sys.mjs";

export const HANDOFF_ACTOR = "AxioSozoHandoff";
// Pinned JSActorOptions: safeForUntrustedWebProcess defaults to false, so a
// web-process child needs it explicitly. Top-level http(s) documents only.
export const HANDOFF_ACTOR_OPTIONS = Object.freeze({
  parent: Object.freeze({ esModuleURI: "chrome://browser/content/axiosozo/AgentHandoffParent.sys.mjs" }),
  child: Object.freeze({ esModuleURI: "chrome://browser/content/axiosozo/AgentHandoffChild.sys.mjs" }),
  allFrames: false, includeChrome: false, remoteTypes: Object.freeze(["web"]),
  matches: Object.freeze(["http://*/*", "https://*/*"]), safeForUntrustedWebProcess: true,
});
export const HANDOFF_KEY = Object.freeze({ id: "axiosozo-handoff-key", key: "A", modifiers: "accel,alt" });
export const HANDOFF_MENU_ITEM = "axiosozo-context-handoff";
export const HANDOFF_NOTIFICATION = "axiosozo-handoff";
export const HANDOFF_RESULT_NOTIFICATION = "axiosozo-handoff-result";
export const HANDOFF_QUERY_MS = 3000;
export const HANDOFF_DONE_MS = 8000;
const INERT = Object.freeze({ dispose() {}, diagnostics: () => ({}) });
const fail = code => { throw Object.assign(new Error(code), { code }); };

let actorRegistered = false;
/** Registers the actor once per process (the parent propagates it). */
export function registerHandoffActor(chromeUtils = globalThis.ChromeUtils) {
  if (actorRegistered) return true;
  chromeUtils.registerWindowActor(HANDOFF_ACTOR, HANDOFF_ACTOR_OPTIONS);
  actorRegistered = true;
  return true;
}

// ---- navigation identity (shared with AgentStatusRuntime) -------------------
// browser → top-level location changes seen since this process started
// tracking its window, same-document ones included. Only windows with a live
// tracker give an identity at all.
const NAVIGATIONS = new WeakMap();
const TRACKED = new WeakSet();

/** "w<innerWindowId>.n<count>" for the browser's current document, or null. */
export function currentNavigationId(window, browser) {
  try {
    if (!TRACKED.has(window)) return null;
    const inner = browser?.browsingContext?.currentWindowGlobal?.innerWindowId;
    if (!Number.isSafeInteger(inner) || inner < 1) return null;
    return `w${inner}.n${NAVIGATIONS.get(browser) ?? 0}`;
  } catch { return null; }
}

// ---- texts ---------------------------------------------------------------------

/** Why a page cannot be sent at all; fixed sentences, never a page string. */
export function handoffRefusalText(reason) {
  switch (reason) {
    case "NOT_WEB": return "Only web pages can be sent to an agent.";
    case "ENGINE": return "Pages shown in Chromium cannot be sent to an agent yet.";
    case "BLOCKED_CATEGORY": return "AxioSozo does not send pages of sensitive sites, such as banking, health or government sign-ins, to agents.";
    case "PASSWORD_RISK": return "This page has a password field, so it is not sent to agents.";
    case "PRIVATE": return "Pages in private windows are never sent to agents.";
    case "TOO_LARGE": return "This page's address is too long to send to an agent.";
    default: return "This page cannot be sent to an agent right now. Nothing was copied.";
  }
}

/** The calm line after a handoff; null when nothing needs saying (cancelled). */
export function handoffResultText(result) {
  if (result?.status === "copied") return { done: true, text: "Copied for your agent. Paste it into Claude Code, Codex or another agent." };
  if (result?.status === "cancelled" || result?.reason === "CANCELLED") return null;
  switch (result?.reason) {
    case "PRIVATE": case "BLOCKED_CATEGORY": case "PASSWORD_RISK": return { done: false, text: handoffRefusalText(result.reason) };
    case "STALE_TAB": case "OBSERVATION_MISMATCH": return { done: false, text: "The page changed before it was copied. Nothing was copied." };
    case "PROJECT_CHANGED": return { done: false, text: "Your projects were changing, so nothing was copied. Try again in a moment." };
    case "POLICY_UNAVAILABLE": return { done: false, text: "AxioSozo could not check this site, so nothing was copied." };
    case "TOO_LARGE": case "INVALID_INPUT": return { done: false, text: "This page or task is too large to copy for an agent. Nothing was copied." };
    case "TIMEOUT": return { done: false, text: "The page did not answer in time. Nothing was copied." };
    default: return { done: false, text: "Copying for your agent did not work. Nothing was copied." };
  }
}

/**
 * The calm line after "Send to synthetic test agent": fixed sentences that
 * keep a launch acknowledgement, an unavailable fixture, a cancellation and an
 * uncertain launch apart. `stale`: the page or project stopped matching while
 * it was being sent. Never a path, helper output or exception text.
 */
export function handoffFixtureResultText(result, { stale = false } = {}) {
  const reason = result?.reason;
  if (result?.status === "handed_off") {
    return { done: true, text: "The synthetic test agent received this page in Terminal. It may still be working there." };
  }
  if (reason === "LAUNCH_UNCERTAIN") {
    return { done: false, text: "It is not certain whether the synthetic test agent started. Check Terminal before you try again. Nothing was copied." };
  }
  if (result?.status === "cancelled" || reason === "CANCELLED") {
    return { done: false, text: "Sending to the synthetic test agent was cancelled. Nothing was sent." };
  }
  switch (reason) {
    case "PRIVATE": case "BLOCKED_CATEGORY": case "PASSWORD_RISK": return { done: false, text: handoffRefusalText(reason) };
    case "NO_PROJECT": return { done: false, text: "The synthetic test agent only takes pages of an AxioSozo project. Nothing was sent." };
    case "STALE_TAB": case "OBSERVATION_MISMATCH": return { done: false, text: "The page changed before it was sent. Nothing was sent." };
    case "PROJECT_CHANGED": return { done: false, text: "Your projects were changing, so nothing was sent. Try again in a moment." };
    case "TIMEOUT": return { done: false, text: "The synthetic test agent did not answer in time. Nothing was sent." };
    default: break;
  }
  if (stale) return { done: false, text: "The page changed before it was sent. Nothing was sent." };
  return { done: false, text: "The synthetic test agent is not available here. Nothing was sent." };
}

/** Privileged environment of an owned synthetic browser only; never a pref,
 * page, actor or input. Showing the action reads these flags and nothing else;
 * the full admission stays in the root factory, after the actual click. */
function syntheticFixtureRequested() {
  try {
    const env = globalThis.Services?.env;
    return env?.get("AXIOSOZO_SYNTHETIC_TEST") === "1" && env.get("AXIOSOZO_HANDOFF_GUI_FIXTURE") === "1"
      && typeof env.get("AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT") === "string" && env.get("AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT") !== "";
  } catch { return false; }
}

/** The root-owned native factory, loaded only after the explicit click. */
async function nativeTerminalFixture({ signal, isActive }) {
  const { createNativeTerminalHandoffFixture } = await import("./TerminalHandoffConfig.sys.mjs");
  return createNativeTerminalHandoffFixture({ signal, isActive });
}

const usableFixture = value => !!value && typeof value === "object" && Object.isFrozen(value) && typeof value.close === "function"
  && typeof value.terminal?.launch === "function" && !!value.testOnlyLaunch && typeof value.testOnlyLaunch === "object";

/** Host and path of the page for the doorhanger, never its query or fragment. */
export function handoffPlace(url) {
  const parsed = typeof url === "string" ? URL.parse(url) : null;
  if (!parsed) return "this page";
  const path = parsed.pathname.replace(/\/+$/u, "");
  return handoffLine(`${parsed.host}${path}`, 120) || "this page";
}

// ---- actor answers ---------------------------------------------------------------

const exactKeys = (value, keys) => !!value && typeof value === "object" && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

/**
 * Validates and rebinds one child answer to the query it answers. Refusals
 * keep only a fixed reason code; anything else unexpected is a mismatch.
 */
export function validateHandoffReply(reply, { mode, url, innerWindowId, includeSelection = false }) {
  if (reply?.ok === false && exactKeys(reply, ["ok", "reason"])) {
    fail(["STALE_TAB", "PRIVATE", "INVALID_INPUT"].includes(reply.reason) ? reply.reason : "OBSERVATION_MISMATCH");
  }
  if (reply?.ok !== true || reply.url !== url || reply.inner_window_id !== innerWindowId) fail("OBSERVATION_MISMATCH");
  if (reply.password_risk === true && exactKeys(reply, ["ok", "url", "inner_window_id", "password_risk"])) fail("PASSWORD_RISK");
  if (reply.password_risk !== false) fail("OBSERVATION_MISMATCH");
  if (mode === "precheck") {
    if (!exactKeys(reply, ["ok", "url", "inner_window_id", "password_risk", "has_selection"]) || typeof reply.has_selection !== "boolean")
      fail("OBSERVATION_MISMATCH");
    return Object.freeze({ has_selection: reply.has_selection });
  }
  if (!exactKeys(reply, ["ok", "url", "inner_window_id", "password_risk", "title", "selection"])
    || typeof reply.title !== "string" || reply.title.length > HANDOFF_LIMITS.title
    || !(reply.selection === null || (typeof reply.selection === "string" && reply.selection.length <= HANDOFF_LIMITS.selection))
    || (!includeSelection && reply.selection !== null)) fail("OBSERVATION_MISMATCH");
  return Object.freeze({ title: handoffLine(reply.title, HANDOFF_LIMITS.title),
    selection: reply.selection === null ? null : handoffProse(reply.selection, HANDOFF_LIMITS.selection) || null });
}

function randomRequestId() {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return `hf_${Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

const SAME = ["tab", "browser", "permanentKey", "frameLoader", "context", "global", "innerWindowId", "origin", "url", "userContextId",
  "workspace", "navigation", "browserId"];

/**
 * Installs Send to agent for one normal browser window.
 * `services`: AxioSozoServices (isNormalWindow, captureHandoffAuthority,
 * rememberAgentReturnTarget, on). `adapter`: ZenWorkspaceAdapter. Optional:
 * `engineOf(tab)` ("gecko" | "chromium"), `core`, `timers`, `clock`,
 * `clipboardHelper` (nsIClipboardHelper; tests), `registerActor`,
 * `requestId()` (tests). Synthetic test agent (native defaults; tests inject):
 * `fixtureRequested()` (privileged environment flags only),
 * `createTerminalFixture({ signal, isActive })` (the root factory),
 * `isWindowActive()`, `securityDelayMs` and `elapsed()` for the same
 * click-jacking delay Firefox applies to its own doorhanger buttons.
 */
export function installAgentHandoff(window, { services, adapter, engineOf = () => "gecko", core = defaultCore,
  timers = defaultTimers(window), clock = () => Date.now(), clipboardHelper = null, registerActor = registerHandoffActor,
  requestId = randomRequestId, fixtureRequested = syntheticFixtureRequested, createTerminalFixture = nativeTerminalFixture,
  isWindowActive = () => { try { return globalThis.Services?.focus?.activeWindow === window; } catch { return false; } },
  securityDelayMs = 500, elapsed = () => Date.now() } = {}) {
  if (typeof services?.isNormalWindow !== "function" || typeof services?.captureHandoffAuthority !== "function"
    || !adapter || !window?.gBrowser || !window.document || !prefEnabled(window, "axiosozo.contexts.enabled", true)) return INERT;
  try { if (adapter.isPrivateWindow() !== false) return INERT; } catch { return INERT; }
  try { registerActor(); } catch (error) { console.error("AxioSozo: handoff actor unavailable", error); return INERT; }
  const { document, gBrowser } = window;
  const Controller = window.AbortController ?? globalThis.AbortController;
  const cleanups = [];
  const admitted = new WeakMap(); // exact request object → its session, consumed once
  const diagnostics = { commands: 0, refused: 0, composed: 0, copied: 0, failed: 0, cancelled: 0,
    fixture_requests: 0, handed_off: 0, launch_uncertain: 0, fixture_unavailable: 0, superseded: 0 };
  let disposed = false, active = null, serial = 0, menuTab = null, resultTimer = null;
  // Feedback belongs to the newest session of this window (`newest`, id ===
  // serial). A request of an older session that settles late never replaces
  // newer feedback or touches a newer composer; only its uncertain launch is
  // still said, as `lateNotice`, once nothing newer is on screen.
  let newest = null, lateNotice = null;
  TRACKED.add(window);

  const sensitive = host => {
    try { const value = core.isSensitiveHost(host); return typeof value?.sensitive === "boolean" ? value.sensitive : true; }
    catch { return true; }
  };
  const refused = reason => ({ ok: false, reason });

  /** Synchronous native facts of `tab` in this window, or why not. */
  function sample(tab) {
    try {
      if (disposed || window.closed) return refused("UNAVAILABLE");
      if (services.isNormalWindow(window) !== true || adapter.isPrivateWindow() !== false) return refused("PRIVATE");
      // A known live tab only: connected, not closing, with its browser's own
      // native permanentKey and frameLoader. Anything unknown is refused.
      if (!tab || tab.ownerGlobal !== window || tab.closing !== false || tab.isConnected !== true) return refused("STALE_TAB");
      const browser = tab.linkedBrowser;
      const permanentKey = browser?.permanentKey, frameLoader = browser?.frameLoader;
      if (!permanentKey || typeof permanentKey !== "object" || !frameLoader || typeof frameLoader !== "object") return refused("STALE_TAB");
      const context = browser.browsingContext;
      if (!context) return refused("STALE_TAB");
      if (context.usePrivateBrowsing !== false) return refused("PRIVATE");
      if (context.parent || context.top !== context) return refused("STALE_TAB");
      let engine = null;
      try { engine = engineOf(tab); } catch { engine = null; }
      if (engine !== "gecko") return refused("ENGINE");
      const global = context.currentWindowGlobal;
      const innerWindowId = global?.innerWindowId;
      if (!global || global.isClosed !== false || global.isCurrentGlobal !== true || !Number.isSafeInteger(innerWindowId) || innerWindowId < 1)
        return refused("STALE_TAB");
      const principal = global.documentPrincipal;
      if (!principal || principal.isSystemPrincipal !== false || principal.isNullPrincipal !== false
        || principal.isContentPrincipal !== true) return refused("NOT_WEB");
      if (principal.privateBrowsingId !== 0) return refused("PRIVATE");
      const url = global.documentURI?.spec;
      const parsed = typeof url === "string" ? URL.parse(url) : null;
      if (!parsed || !["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) return refused("NOT_WEB");
      if (url !== browser.currentURI?.spec) return refused("STALE_TAB");
      if (url.length > HANDOFF_LIMITS.url) return refused("TOO_LARGE");
      const userContextId = principal.userContextId;
      if (!Number.isSafeInteger(userContextId) || userContextId < 0 || context.originAttributes?.userContextId !== userContextId)
        return refused("STALE_TAB");
      if (sensitive(parsed.hostname)) return refused("BLOCKED_CATEGORY");
      const navigation = currentNavigationId(window, browser);
      const browserId = browser.browserId;
      if (!navigation || !Number.isSafeInteger(browserId) || browserId < 1) return refused("STALE_TAB");
      let workspace;
      try { workspace = adapter.workspaceForTab(tab) ?? null; } catch { return refused("STALE_TAB"); }
      const origin = principal.origin;
      if (typeof origin !== "string") return refused("STALE_TAB");
      return { ok: true, facts: Object.freeze({ tab, browser, permanentKey, frameLoader,
        context, global, innerWindowId, origin, url, host: parsed.hostname, userContextId, workspace, navigation, browserId }) };
    } catch { return refused("STALE_TAB"); }
  }

  /** The selected tab and browser of this window, read from the tabbrowser
   * itself (never inferred from TabSelect delivery), are the session's own. */
  function selected(session) {
    try { return gBrowser.selectedTab === session.tab && gBrowser.selectedBrowser === session.browser; } catch { return false; }
  }

  /** The session still owns this window's handoff, its tab is still the
   * selected one, and every native identity fact is unchanged. */
  function live(session) {
    if (disposed || active !== session || session.controller.signal.aborted || session.phase === "ended" || !selected(session)) return false;
    const now = sample(session.tab);
    return now.ok && SAME.every(key => now.facts[key] === session.facts[key]);
  }

  function bounded(promise, signal) {
    return new Promise((resolve, reject) => {
      let timer = null;
      const done = (fn, value) => { timers.clearTimeout(timer); signal.removeEventListener("abort", abort); fn(value); };
      const abort = () => done(reject, Object.assign(new Error("CANCELLED"), { code: "CANCELLED" }));
      if (signal.aborted) { abort(); return; }
      signal.addEventListener("abort", abort, { once: true });
      timer = timers.setTimeout(() => done(reject, Object.assign(new Error("TIMEOUT"), { code: "TIMEOUT" })), HANDOFF_QUERY_MS);
      Promise.resolve(promise).then(value => done(resolve, value), error => done(reject, error));
    });
  }

  /** One bounded query to the content actor of the session's captured global. */
  async function query(session, mode, includeSelection = false) {
    if (!live(session)) fail("STALE_TAB");
    const { url, innerWindowId, global } = session.facts;
    const actor = global.getActor(HANDOFF_ACTOR);
    const data = { url, inner_window_id: innerWindowId };
    if (mode === "capture") data.include_selection = includeSelection;
    const reply = await bounded(actor.sendQuery(mode === "capture" ? HANDOFF_MESSAGES.CAPTURE : HANDOFF_MESSAGES.PRECHECK, data),
      session.controller.signal);
    // Rebound after the await: same session, tab and document, or nothing.
    if (!live(session)) fail("STALE_TAB");
    try { return validateHandoffReply(reply, { mode, url, innerWindowId, includeSelection }); }
    catch (error) { if (error.code === "PASSWORD_RISK") session.passwordRisk = true; throw error; }
  }

  // ---- doorhangers ------------------------------------------------------------------
  const popups = () => window.PopupNotifications ?? null;
  function removeNotification(notification) {
    if (!notification) return;
    try { popups()?.remove(notification); } catch {}
  }
  function clearResult() {
    if (resultTimer !== null) { timers.clearTimeout(resultTimer); resultTimer = null; }
    try { removeNotification(popups()?.getNotification(HANDOFF_RESULT_NOTIFICATION, gBrowser.selectedBrowser)); } catch {}
  }
  function showResult(browser, outcome) {
    if (!outcome || disposed) return;
    clearResult();
    let notification = null;
    try {
      notification = popups()?.show(browser, HANDOFF_RESULT_NOTIFICATION, outcome.text, null,
        { label: "OK", accessKey: "O", callback() {}, disableSecurityDelay: true }, null,
        { persistence: 0, removeOnDismissal: true, hideClose: true,
          // Once this line is gone, a deferred uncertain launch may be said.
          eventCallback: state => { if (state === "removed") Promise.resolve().then(offerLateNotice); } });
    } catch { notification = null; }
    if (notification && outcome.done) {
      resultTimer = timers.setTimeout(() => { resultTimer = null; removeNotification(notification); }, HANDOFF_DONE_MS);
    }
  }

  /** This session is still the newest one in this window. */
  const presentable = session => !disposed && session.id === serial;

  /** Says a superseded session's uncertain launch only when it replaces
   * nothing: no session open, the newest one settled, no handoff line shown. */
  function offerLateNotice() {
    if (!lateNotice || disposed || active !== null || (newest && !newest.settled)) return;
    try { if (popups()?.getNotification(HANDOFF_RESULT_NOTIFICATION, gBrowser.selectedBrowser)) return; } catch { return; }
    const notice = lateNotice;
    lateNotice = null;
    showResult(gBrowser.selectedBrowser, notice);
  }

  // The doorhanger's own content: a hidden <popupnotification> PopupNotifications
  // takes by id (the same mechanism as Firefox's own prompts) and returns after.
  const templateId = `${HANDOFF_NOTIFICATION}-notification`;
  let template = document.getElementById(templateId);
  if (!template) {
    template = document.createXULElement("popupnotification");
    template.id = templateId;
    template.hidden = true;
    const content = document.createXULElement("popupnotificationcontent");
    content.id = "axiosozo-handoff-content";
    content.setAttribute("orient", "vertical");
    template.append(content);
    (document.getElementById("mainPopupSet") ?? document.documentElement).append(template);
    cleanups.push(() => template.remove());
  }

  function composeContent(session) {
    const content = document.getElementById("axiosozo-handoff-content");
    if (!content) return null;
    const node = (tag, text, attrs = {}) => {
      const element = tag === "textarea" ? document.createElementNS(XHTML, "textarea") : document.createXULElement(tag);
      if (text !== undefined && tag === "description") element.textContent = text;
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      return element;
    };
    const label = node("label", undefined, { id: "axiosozo-handoff-task-label", value: "Task for the agent (optional)", control: "axiosozo-handoff-task" });
    const task = node("textarea", undefined, { id: "axiosozo-handoff-task", rows: "4", maxlength: String(HANDOFF_LIMITS.task),
      placeholder: "What should the agent do with this page?", "aria-labelledby": "axiosozo-handoff-task-label" });
    Object.assign(task.style, { boxSizing: "border-box", width: "100%", minWidth: "22em", resize: "vertical", font: "inherit", marginBlock: "2px 6px" });
    const hasSelection = session.precheck?.has_selection === true;
    const selection = node("checkbox", undefined, { id: "axiosozo-handoff-selection",
      label: hasSelection ? "Include the selected text" : "Include the selected text (nothing is selected)" });
    selection.checked = hasSelection;
    if (!hasSelection) selection.disabled = true;
    const project = session.authority?.project
      ? node("description", `Project folder: ${session.authority.project.root} (${session.authority.name})`)
      : node("description", session.authority ? "This page belongs to no AxioSozo project." : "The project is read again when you copy.");
    const included = node("description", "Also copied: the page title and its address, without query or fragment.");
    const route = node("description", "Screenshots, console errors and opening Claude Code or Codex directly are not in this build yet. Paste the copy into your agent.");
    for (const quiet of [project, included, route]) quiet.style.maxWidth = "28em";
    let fixture = null, fixtureNote = null;
    if (session.fixtureOffered) {
      // Owned synthetic test browsers only. Named as a test agent, never as a
      // real provider; Copy for agent stays the default and stays reachable.
      const unprojected = !!session.authority && !session.authority.project;
      fixtureNote = node("description", unprojected
        ? "Test build: the synthetic test agent only takes pages of an AxioSozo project."
        : "Test build: a synthetic test agent, not Claude Code or Codex, can receive this page in Terminal instead. Nothing is copied then.",
      { id: "axiosozo-handoff-fixture-note" });
      fixtureNote.style.maxWidth = "28em";
      fixtureNote.style.marginTop = "8px";
      fixture = node("button", undefined, { id: "axiosozo-handoff-fixture", label: "Send to synthetic test agent", accesskey: "S",
        "aria-describedby": "axiosozo-handoff-fixture-note" });
      fixture.style.alignSelf = "flex-start";
      if (unprojected) fixture.disabled = true;
      fixture.addEventListener("command", event => onFixture(session, event));
    }
    content.replaceChildren(label, task, selection, project, included, route, ...(fixture ? [fixtureNote, fixture] : []));
    return { task, selection, fixture };
  }

  /** The pending fixture request stays visible and accurate: the action says
   * it is sending, a second press and Copy are blocked, Cancel stays usable. */
  function showFixturePending(session) {
    const { fixture, task, selection } = session.fields;
    fixture?.setAttribute("label", "Sending to synthetic test agent…");
    fixture?.setAttribute("aria-disabled", "true");
    task.readOnly = true;
    selection.disabled = true;
    document.getElementById(templateId)?.toggleAttribute("mainactiondisabled", true);
  }

  function showCompose(session) {
    const fields = composeContent(session);
    const manager = popups();
    if (!fields || !manager) { end(session, "unavailable"); showResult(session.browser, handoffResultText({ status: "failed", reason: "HANDOFF_FAILED" })); return; }
    session.fields = fields;
    session.phase = "compose";
    diagnostics.composed++;
    try {
      session.notification = manager.show(session.browser, HANDOFF_NOTIFICATION, "Copy <> for an agent", null,
        { label: "Copy for agent", accessKey: "C", callback: ({ event } = {}) => { onCopy(session, event); } },
        [{ label: "Cancel", accessKey: "N", disableSecurityDelay: true, callback: () => { restoreFocus(session); end(session, "cancelled"); } }],
        { name: handoffPlace(session.facts.url), persistence: 0, removeOnDismissal: true, autofocus: true,
          eventCallback: state => {
            if (state === "shown" && session.phase === "compose") {
              if (session.shownAt === null) session.shownAt = elapsed();
              try { session.fields.task.focus(); } catch {}
            }
            // Dismissal, a tab switch or a location change removes the doorhanger.
            // A copy that already started finishes on its own; a pending
            // synthetic-agent request is not left running out of sight.
            if (state === "removed" && (session.phase === "compose" || (session.phase === "sending" && session.mode === "fixture"))) {
              end(session, "cancelled");
            }
          } });
    } catch (error) {
      console.error("AxioSozo: Send to agent could not open", error);
      end(session, "unavailable");
    }
  }

  function restoreFocus(session) {
    try { if (!disposed && gBrowser.selectedTab === session.tab) session.browser.focus(); } catch {}
  }

  // ---- the session ------------------------------------------------------------------
  function end(session, why) {
    if (!session || session.phase === "ended") return;
    // Nothing was sent yet: no later feedback is owed for this session.
    if (session.phase === "checking" || session.phase === "compose") session.settled = true;
    session.phase = "ended";
    session.controller.abort();
    closeFixture(session);
    if (session.request) admitted.delete(session.request);
    if (active === session) active = null;
    removeNotification(session.notification);
    // The shared composer template belongs to the newest session only.
    if (session.id === serial) document.getElementById(templateId)?.removeAttribute("mainactiondisabled");
    if (why === "cancelled") diagnostics.cancelled++;
    Promise.resolve().then(offerLateNotice);
  }

  /** The fixture this session owns, closed once; a launched Terminal session
   * itself belongs to the user and is not affected. */
  const closedFixtures = new WeakSet();
  function closeOwned(fixture) {
    if (!fixture || typeof fixture !== "object" || closedFixtures.has(fixture) || typeof fixture.close !== "function") return;
    closedFixtures.add(fixture);
    try { fixture.close(); } catch {}
  }
  function closeFixture(session) {
    const fixture = session.fixture;
    session.fixture = null;
    closeOwned(fixture);
  }

  async function start(facts) {
    // `mode`: "copy" or "fixture" once a trusted action chose it. The fixture
    // action is only offered in an owned synthetic browser (flags only here).
    let fixtureOffered = false;
    try { fixtureOffered = fixtureRequested() === true; } catch { fixtureOffered = false; }
    const session = { id: ++serial, tab: facts.tab, browser: facts.browser, facts, controller: new Controller(), phase: "checking",
      precheck: null, authority: null, passwordRisk: false, notification: null, fields: null, request: null,
      mode: null, fixtureOffered, fixture: null, shownAt: null, finished: false, settled: false };
    active = session;
    newest = session;
    // The exact request object the final Copy admits; its opt-ins and task
    // are set by that click only. Chrome-private, never sent anywhere.
    session.request = { request_id: requestId(), tab_id: `t_${facts.browserId}`, task: "", target: "clipboard",
      include_selection: false, include_screen: false, include_console: false, fallback_to_clipboard: true };
    session.tabId = session.request.tab_id;
    let precheck, authority = null;
    try {
      [precheck, authority] = await Promise.all([query(session, "precheck"),
        services.captureHandoffAuthority({ window, tab: facts.tab, url: facts.url, userContextId: facts.userContextId }).catch(() => null)]);
    } catch (error) {
      const stillHere = active === session && !session.controller.signal.aborted;
      end(session, "refused");
      // Nothing was read or copied yet; say why the page cannot be sent.
      if (stillHere) { diagnostics.refused++; showResult(facts.browser, { done: false, text: handoffRefusalText(error?.code) }); }
      return;
    }
    if (!live(session)) { end(session, "cancelled"); return; }
    session.precheck = precheck;
    session.authority = authority;
    showCompose(session);
  }

  function command(event, tab) {
    if (disposed || event?.isTrusted !== true) return;
    diagnostics.commands++;
    if (!tab || tab !== gBrowser.selectedTab || tab.linkedBrowser !== gBrowser.selectedBrowser) return;
    end(active, "cancelled");
    clearResult();
    const sampled = sample(tab);
    if (!sampled.ok) {
      diagnostics.refused++;
      try { showResult(tab.linkedBrowser, { done: false, text: handoffRefusalText(sampled.reason) }); } catch {}
      return;
    }
    start(sampled.facts).catch(() => {});
  }

  function onCopy(session, event) {
    // Only the user's own click on the doorhanger's button, for this session.
    if (event?.isTrusted !== true || session.phase !== "compose" || !live(session)) return;
    session.phase = "sending";
    session.mode = "copy";
    const task = handoffProse(String(session.fields.task.value ?? ""), HANDOFF_LIMITS.task);
    const include = session.precheck?.has_selection === true && session.fields.selection.checked === true;
    Object.assign(session.request, { task, include_selection: include });
    restoreFocus(session);
    send(session).catch(() => finish(session, { status: "failed", reason: "HANDOFF_FAILED" }));
  }

  function onFixture(session, event) {
    // A fresh trusted click (or keyboard activation) of this very button, in
    // this session's open composer, after Firefox's usual doorhanger delay
    // and in the active window. Nothing is requested otherwise.
    if (event?.isTrusted !== true || !session.fixtureOffered || session.phase !== "compose" || session.fields?.fixture?.disabled
      || !live(session)) return;
    if (securityDelayMs > 0 && (session.shownAt === null || elapsed() - session.shownAt < securityDelayMs)) return;
    let windowActive = false;
    try { windowActive = isWindowActive() === true; } catch { windowActive = false; }
    if (!windowActive) return;
    session.phase = "sending";
    session.mode = "fixture";
    diagnostics.fixture_requests++;
    const task = handoffProse(String(session.fields.task.value ?? ""), HANDOFF_LIMITS.task);
    const include = session.precheck?.has_selection === true && session.fields.selection.checked === true;
    // The same exact request object; a launch never falls back to a copy.
    Object.assign(session.request, { task, include_selection: include, target: "codex", fallback_to_clipboard: false });
    showFixturePending(session);
    sendFixture(session).catch(() => finishFixture(session, { status: "failed", reason: "HANDOFF_FAILED" }));
  }

  /** Validates the session's current tab against its captured identity. */
  function describe(session, tabId) {
    if (tabId !== session.tabId || !live(session) || session.phase !== "sending") fail("STALE_TAB");
    if (session.authority?.check() !== true) fail("PROJECT_CHANGED");
    const { facts } = session;
    return { tab_id: session.tabId, navigation_id: facts.navigation, url: facts.url, is_private: false,
      blocked_category: sensitive(facts.host), password_risk: session.passwordRisk !== false,
      project: session.authority.project ? { id: session.authority.project.id, root: session.authority.project.root } : null };
  }

  async function capture(session, tabId, options) {
    if (tabId !== session.tabId || options?.navigation_id !== session.facts.navigation) fail("STALE_TAB");
    if (options.include_screen === true || options.include_console === true) fail("OBSERVATION_MISMATCH");
    const include = options.include_selection === true;
    const answer = await query(session, "capture", include);
    if (session.authority?.check() !== true) fail("PROJECT_CHANGED");
    return { tab_id: session.tabId, navigation_id: session.facts.navigation, url: session.facts.url,
      title: answer.title, selection: include ? answer.selection : null, screen: null, console_errors: [] };
  }

  function clipboard() {
    try {
      return clipboardHelper ?? globalThis.Cc["@mozilla.org/widget/clipboardhelper;1"].getService(globalThis.Ci.nsIClipboardHelper);
    } catch { return null; }
  }

  /** Project authority from the open, or read again once at quiescence. A
   * different project than the one shown is refused, never swapped in.
   * null when it holds; otherwise the result that ends the request. */
  async function settleAuthority(session) {
    if (session.authority?.check() === true) return null;
    let authority;
    try { authority = await services.captureHandoffAuthority({ window, tab: session.tab, url: session.facts.url,
      userContextId: session.facts.userContextId }); } catch { authority = null; }
    if (!live(session) || session.phase !== "sending") return { status: "cancelled", reason: "CANCELLED" };
    if (!authority || (session.authority && authority.project?.id !== session.authority.project?.id)) return { status: "failed", reason: "PROJECT_CHANGED" };
    session.authority = authority;
    return null;
  }

  // One-shot: the exact request object, admitted by the trusted click, is
  // consumed here; an actor boolean or a request id grants nothing.
  const userRequestFor = session => request => {
    const owner = admitted.get(request);
    admitted.delete(request);
    return owner === session && session.phase === "sending" && live(session);
  };
  const tabsFor = session => ({ describe: async tabId => describe(session, tabId), capture: (tabId, options) => capture(session, tabId, options) });

  async function send(session) {
    const refusal = await settleAuthority(session);
    if (refusal) { finish(session, refusal); return; }
    const helper = clipboard();
    const handoff = createHandoff({
      tabs: tabsFor(session),
      isSensitiveHost: host => core.isSensitiveHost(host),
      isUserRequest: userRequestFor(session),
      clipboard: { write(text) {
        // Final guard, synchronous, with nothing awaited before the copy:
        // the session, the selected tab of this registered normal window, its
        // browser, permanentKey, frameLoader, top context, current global,
        // inner window, principal origin, URL, container, space, navigation,
        // then the project authority, then the copy itself.
        if (typeof text !== "string" || session.phase !== "sending" || session.controller.signal.aborted) fail("CANCELLED");
        if (gBrowser.selectedTab !== session.tab || gBrowser.selectedBrowser !== session.browser || !live(session)) fail("STALE_TAB");
        if (session.authority?.check() !== true) fail("PROJECT_CHANGED");
        if (!helper || typeof helper.copyString !== "function") fail("CLIPBOARD_UNAVAILABLE");
        helper.copyString(text);
      } },
      terminal: null, clock,
    });
    admitted.set(session.request, session);
    let result;
    try { result = await handoff.send(session.request, { signal: session.controller.signal }); }
    finally { handoff.close(); admitted.delete(session.request); }
    finish(session, result);
  }

  /** The native return target, only while the tab and project still hold. */
  function rememberReturn(session) {
    const project = session.authority?.project;
    if (!project || session.phase !== "sending" || !live(session) || session.authority.check() !== true) return;
    try { services.rememberAgentReturnTarget?.({ project_id: project.id, tab_id: session.tabId,
      navigation_id: session.facts.navigation, user_context_id: session.facts.userContextId }); } catch {}
  }

  function finish(session, result) {
    session.settled = true;
    if (session.phase === "ended" && result?.status !== "copied") { Promise.resolve().then(offerLateNotice); return; }
    const copied = result?.status === "copied";
    if (copied) {
      diagnostics.copied++;
      rememberReturn(session);
    } else if (result?.status === "cancelled") diagnostics.cancelled++;
    else diagnostics.failed++;
    // Only the newest session's own tab gets its line; an older one's is dropped.
    const showOn = presentable(session) && gBrowser.selectedTab === session.tab ? session.browser : null;
    if (!showOn && !presentable(session)) diagnostics.superseded++;
    end(session, copied ? "copied" : "finished");
    if (showOn) showResult(showOn, handoffResultText(result));
  }

  /** Literally true only while this session is sending to the fixture on its
   * still-selected tab and browser, with every identity fact and the project
   * authority unchanged. Never inferred from event delivery. */
  function fixtureActive(session) {
    return active === session && session.phase === "sending" && session.mode === "fixture" && !session.controller.signal.aborted
      && selected(session) && live(session) && session.authority?.check() === true;
  }

  /** Why a fixture request stopped without the user cancelling it. */
  function inactiveResult(session) {
    if (session.phase !== "sending" || session.controller.signal.aborted) return { status: "cancelled", reason: "CANCELLED" };
    if (!selected(session) || !live(session)) return { status: "failed", reason: "STALE_TAB" };
    return { status: "failed", reason: "PROJECT_CHANGED" };
  }

  /**
   * The explicit synthetic-agent request. The factory receives only this
   * session's AbortSignal and isActive(), and checks it around its own awaits
   * and immediately before the native dispatch and the context write; it is
   * also rechecked here after the factory and before the core runs. Only the
   * factory's own adapter and frozen configuration reach the core, and no
   * clipboard is given to it: nothing can be copied instead.
   */
  async function sendFixture(session) {
    const signal = session.controller.signal;
    const isActive = () => fixtureActive(session);
    const refusal = await settleAuthority(session);
    if (refusal) { finishFixture(session, refusal); return; }
    if (!isActive()) { finishFixture(session, inactiveResult(session)); return; }
    if (!session.authority.project) { finishFixture(session, { status: "unavailable", reason: "NO_PROJECT" }); return; }
    let fixture = null;
    try { fixture = await createTerminalFixture({ signal, isActive }); }
    catch { finishFixture(session, isActive() ? { status: "unavailable", reason: "TERMINAL_UNAVAILABLE" } : inactiveResult(session)); return; }
    try {
      // A fixture resolving after cancellation, teardown or any change is
      // closed unused; no other launcher is ever tried.
      if (fixture === null || !usableFixture(fixture)) {
        finishFixture(session, isActive() ? { status: "unavailable", reason: "TERMINAL_UNAVAILABLE" } : inactiveResult(session));
        return;
      }
      if (!isActive()) { finishFixture(session, inactiveResult(session)); return; }
      session.fixture = fixture;
      const handoff = createHandoff({ tabs: tabsFor(session), isSensitiveHost: host => core.isSensitiveHost(host),
        isUserRequest: userRequestFor(session), clipboard: null, terminal: fixture.terminal, clock, testOnlyLaunch: fixture.testOnlyLaunch });
      if (!isActive()) { handoff.close(); finishFixture(session, inactiveResult(session)); return; }
      admitted.set(session.request, session);
      let result;
      try { result = await handoff.send(session.request, { signal }); }
      finally { handoff.close(); admitted.delete(session.request); }
      finishFixture(session, result);
    } finally {
      if (session.fixture === fixture) session.fixture = null;
      closeOwned(fixture);
    }
  }

  function finishFixture(session, outcomeResult) {
    if (session.finished) return;
    session.finished = true;
    let result = outcomeResult;
    // A refusal at the factory's own dispatch check, without a user cancel,
    // is said as what changed: the page or the projects.
    if (result?.status === "unavailable" && !["NO_PROJECT", "CANCELLED"].includes(result.reason) && session.phase === "sending"
      && !fixtureActive(session)) result = inactiveResult(session);
    const handedOff = result?.status === "handed_off";
    const reason = result?.reason;
    // Only a launch acknowledgement: the synthetic agent may still be working.
    if (handedOff) { diagnostics.handed_off++; rememberReturn(session); }
    else if (reason === "LAUNCH_UNCERTAIN") diagnostics.launch_uncertain++;
    else if (result?.status === "cancelled" || reason === "CANCELLED") { if (session.phase !== "ended") diagnostics.cancelled++; }
    else diagnostics.fixture_unavailable++;
    const stale = !handedOff && session.phase === "sending" && !live(session);
    const outcome = handoffFixtureResultText(result, { stale });
    // The newest session says its outcome even if the user moved to another
    // tab. A superseded one never replaces newer feedback or moves focus away
    // from a newer composer; only its uncertain launch waits to be said.
    const current = presentable(session);
    const showOn = current ? gBrowser.selectedBrowser ?? null : null;
    const own = current && selected(session);
    if (!current) {
      diagnostics.superseded++;
      if (reason === "LAUNCH_UNCERTAIN" && !disposed) lateNotice = outcome;
    }
    session.settled = true;
    end(session, handedOff ? "handed_off" : "finished");
    if (own) restoreFocus(session);
    if (showOn) showResult(showOn, outcome);
    else Promise.resolve().then(offerLateNotice);
  }

  // ---- wiring -------------------------------------------------------------------------
  const keyset = document.createXULElement("keyset");
  keyset.id = "axiosozo-handoff-keyset";
  const key = document.createXULElement("key");
  key.id = HANDOFF_KEY.id;
  key.setAttribute("key", HANDOFF_KEY.key);
  key.setAttribute("modifiers", HANDOFF_KEY.modifiers);
  const onKey = event => command(event, gBrowser.selectedTab);
  key.addEventListener("command", onKey);
  keyset.append(key);
  const mainKeyset = document.getElementById("mainKeyset");
  if (mainKeyset?.parentNode) mainKeyset.parentNode.insertBefore(keyset, mainKeyset);
  else document.documentElement.append(keyset);
  cleanups.push(() => { key.removeEventListener("command", onKey); keyset.remove(); });

  const contextMenu = document.getElementById("contentAreaContextMenu");
  if (contextMenu) {
    const item = document.createXULElement("menuitem");
    item.id = HANDOFF_MENU_ITEM;
    item.setAttribute("label", "Send to Agent…");
    item.setAttribute("accesskey", "g");
    item.setAttribute("key", HANDOFF_KEY.id);
    item.hidden = true;
    // Opening the menu reads nothing from the page: only chrome's own facts.
    const onShowing = event => {
      if (event.target !== contextMenu) return;
      menuTab = null;
      let tab = null;
      try { tab = gBrowser.getTabForBrowser(window.gContextMenu?.browser) ?? null; } catch { tab = null; }
      const eligible = !!tab && tab === gBrowser.selectedTab && sample(tab).ok;
      menuTab = eligible ? tab : null;
      item.hidden = !eligible;
    };
    const onHidden = event => { if (event.target === contextMenu) menuTab = null; };
    const onCommand = event => command(event, menuTab);
    contextMenu.addEventListener("popupshowing", onShowing);
    contextMenu.addEventListener("popuphidden", onHidden);
    item.addEventListener("command", onCommand);
    const anchor = document.getElementById("context-sep-screenshots");
    if (anchor?.parentNode === contextMenu) contextMenu.insertBefore(item, anchor);
    else contextMenu.append(item);
    cleanups.push(() => {
      contextMenu.removeEventListener("popupshowing", onShowing);
      contextMenu.removeEventListener("popuphidden", onHidden);
      item.removeEventListener("command", onCommand);
      item.remove();
    });
  }

  cleanups.push(addTabsProgressListener(window, {
    onLocationChange(browser, webProgress) {
      if (!webProgress?.isTopLevel) return;
      NAVIGATIONS.set(browser, (NAVIGATIONS.get(browser) ?? 0) + 1);
      if (active?.browser === browser) end(active, "navigated");
    },
  }));
  const onTabSelect = () => { if (active && gBrowser.selectedTab !== active.tab) end(active, "cancelled"); };
  const onTabClose = event => { if (active && event.target === active.tab) end(active, "closed"); };
  gBrowser.tabContainer.addEventListener("TabSelect", onTabSelect);
  gBrowser.tabContainer.addEventListener("TabClose", onTabClose);
  cleanups.push(() => {
    gBrowser.tabContainer.removeEventListener("TabSelect", onTabSelect);
    gBrowser.tabContainer.removeEventListener("TabClose", onTabClose);
  });
  // A project write while copying ends it at once; the clipboard guard also
  // checks the same authority synchronously.
  if (typeof services.on === "function") {
    const offProjects = services.on("projects", () => {
      if (active?.phase === "sending" && active.authority?.check() !== true) end(active, "project");
    });
    if (typeof offProjects === "function") cleanups.push(offProjects);
  }

  return Object.freeze({
    /** Counts only; no URLs, titles, selections or tasks. */
    diagnostics: () => ({ ...diagnostics, active: active ? active.phase : null }),
    dispose() {
      if (disposed) return;
      end(active, "disposed");
      disposed = true;
      lateNotice = null;
      clearResult();
      TRACKED.delete(window);
      for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
    },
  });
}
