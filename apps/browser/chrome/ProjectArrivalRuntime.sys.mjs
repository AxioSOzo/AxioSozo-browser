/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// P1 arrival without a form (workstation-v1 §4), the browser side. When the
// selected tab of a normal window settles on a localhost / 127.0.0.1 / [::1]
// page, AxioSozoServices.offerArrival asks which of the user's own processes
// serves it and from which folder. A new folder gets one calm, Zen-native
// notification on that tab: "This is ~/Code/foo — keep as project?". "Keep as
// project" is the user's confirmation; the folder picker in about:axiosozo
// stays the fallback. A known repository/hosting URL or a registered folder
// shows nothing.
//
// The offer is an opaque one-use token held only in this chrome code. It is
// bound to the originating tab, its exact URL and this window, and invalidated
// by navigation, dismissal, tab close, expiry and window disposal. URL, tab and
// privacy always come from the browser itself, never from page content. Private
// windows install nothing; unknown privacy counts as private.
import * as defaultCore from "./contexts/index.mjs";
import { WPL, webURL, defaultTimers, prefEnabled, addTabsProgressListener } from "./DevLoop.sys.mjs";

export const NOTIFICATION_VALUE = "axiosozo-project-arrival";
export const RESULT_NOTIFICATION_VALUE = "axiosozo-project-arrival-result";
// A tab's URL must be stable this long before anything is asked (no storms
// from redirects, reloads or client-side routing).
export const ARRIVAL_SETTLE_MS = 600;
// The same tab and origin is not asked again within this time unless an offer
// was invalidated by navigation (then the new URL gets a fresh offer).
export const ARRIVAL_RECHECK_MS = 30000;
// Repository and hosting sites a registered project can be recognised on
// without starting any process (core.matchSurfaceForUrl).
const SURFACE_HOSTS = new Set(["github.com", "gitlab.com", "bitbucket.org", "vercel.com"]);
const INERT = Object.freeze({ dispose() {}, diagnostics: () => ({}) });

// Process-wide, session only: a folder dismissed with "Not now" is not offered
// again in any window until the browser restarts.
const SHARED = { dismissedRoots: new Set() };

/** The notification text. `displayRoot` is the folder with home shown as "~". */
export function arrivalMessage(displayRoot) {
  return `This is ${displayRoot} — keep as project?`;
}

/** Fixed texts for a failed "Keep as project"; never an error's own message. */
export function arrivalFailureMessage(code) {
  switch (code) {
    case "PROJECT_EXISTS": return "This folder is already a project in AxioSozo.";
    case "UNKNOWN_ARRIVAL": case "STALE_ARRIVAL": case "ARRIVAL_UNAVAILABLE":
      return "This offer is no longer valid because the page changed. You can still add the folder in AxioSozo.";
    case "ROOT_CHANGED": case "ROOT_NOT_DIRECTORY": case "ROOT_NOT_FOUND":
      return "The folder changed before it could be added. You can still add it in AxioSozo.";
    case "READ_CONTAINMENT_UNAVAILABLE":
      return "This build cannot read project folders safely, so nothing was read or added.";
    default: return "The folder could not be added. You can still add it in AxioSozo.";
  }
}

/** Pages that can lead to an offer: http(s) without credentials on a loopback
 * host, or a repository/hosting site a known project may match. */
export function arrivalCandidate(spec, core = defaultCore) {
  const url = webURL(spec);
  if (!url) return null;
  if (core.loopbackPort(url.href) !== null) return { url: url.href, origin: url.origin, loopback: true };
  return SURFACE_HOSTS.has(url.hostname) ? { url: url.href, origin: url.origin, loopback: false } : null;
}

/**
 * Installs arrival for one normal browser window.
 * `services`: AxioSozoServices (offerArrival, acceptArrival, discardArrival).
 * `adapter`: ZenWorkspaceAdapter (isPrivateWindow, workspaceForTab, activeWorkspaceUuid).
 * Optional: `openOverview(fragment)` for the follow-up buttons, `core`,
 * `timers`, `clock`, `shared` ({ dismissedRoots }), `settleMs`, `recheckMs`.
 */
export function installProjectArrival(window, { services, adapter, openOverview = null, core = defaultCore,
  timers = defaultTimers(window), clock = () => Date.now(), shared = SHARED,
  settleMs = ARRIVAL_SETTLE_MS, recheckMs = ARRIVAL_RECHECK_MS } = {}) {
  if (typeof services?.offerArrival !== "function" || typeof services?.acceptArrival !== "function"
    || typeof services?.discardArrival !== "function" || !adapter || !window?.gBrowser
    || !prefEnabled(window, "axiosozo.contexts.enabled", true)) return INERT;
  const normalWindow = () => { try { return adapter.isPrivateWindow() === false; } catch { return false; } };
  if (!normalWindow()) return INERT;
  const gBrowser = window.gBrowser;
  const Controller = window.AbortController ?? globalThis.AbortController;
  // tab → { timer, controller, offer, memo, result, navigation }. `navigation`
  // counts the tab's top-level location changes: a notification belongs to
  // the document it was asked for and is never shown on a later one.
  const states = new Map();
  const cleanups = [];
  let disposed = false;
  const diagnostics = { discoveries: 0, offers: 0, known: 0, accepted: 0, dismissed: 0, failed: 0, invalidated: 0 };

  const stateFor = tab => {
    let state = states.get(tab);
    if (!state) { state = { timer: null, controller: null, offer: null, memo: null, result: null, navigation: 0 }; states.set(tab, state); }
    return state;
  };
  const currentSpec = tab => { try { return tab?.linkedBrowser?.currentURI?.spec ?? null; } catch { return null; } };
  /** True while `tab` still shows the same document at `url` in this live,
   * normal window: same state, no location change since `navigation`. */
  const samePage = (tab, state, navigation, url) => !disposed && states.get(tab) === state
    && state.navigation === navigation && currentSpec(tab) === url && normalWindow();
  const discard = tab => { try { services.discardArrival({ window, tab }); } catch {} };
  const box = tab => { try { return gBrowser.getNotificationBox(tab.linkedBrowser); } catch { return null; } };
  const removeNotification = (tab, notification) => {
    if (!notification) return;
    try { box(tab)?.removeNotification(notification); } catch {}
  };

  function cancelPending(state) {
    if (state.timer !== null) { timers.clearTimeout(state.timer); state.timer = null; }
    state.controller?.abort();
    state.controller = null;
  }

  /** Ends the tab's offer: notification gone, token unusable and, when the
   * user already pressed Keep, the acceptance in flight revoked as well. */
  function invalidate(tab, { counted = true } = {}) {
    const state = states.get(tab);
    const offer = state?.offer;
    if (!offer) return;
    state.offer = null;
    offer.closed = true;
    if (offer.expiry !== null) timers.clearTimeout(offer.expiry);
    removeNotification(tab, offer.notification);
    discard(tab);
    if (counted) diagnostics.invalidated++;
  }

  function clearResult(tab) {
    const state = states.get(tab);
    if (!state?.result) return;
    const notification = state.result;
    state.result = null;
    removeNotification(tab, notification);
  }

  /** Asks once the selected tab's URL has settled; never for background tabs. */
  function schedule(tab) {
    if (disposed || !tab || tab !== gBrowser.selectedTab || !normalWindow()) return;
    const candidate = arrivalCandidate(currentSpec(tab), core);
    if (!candidate) return;
    const state = stateFor(tab);
    if (state.offer?.url === candidate.url) return;
    if (state.memo?.origin === candidate.origin && clock() - state.memo.at < recheckMs) return;
    cancelPending(state);
    state.timer = timers.setTimeout(() => {
      state.timer = null;
      discover(tab, candidate).catch(() => {});
    }, settleMs);
  }

  async function discover(tab, candidate) {
    if (disposed || tab !== gBrowser.selectedTab || currentSpec(tab) !== candidate.url || !normalWindow()) return;
    const state = stateFor(tab);
    const controller = new Controller();
    state.controller = controller;
    diagnostics.discoveries++;
    let result = null;
    try { result = await services.offerArrival({ window, tab, signal: controller.signal }); } catch { result = null; }
    if (state.controller === controller) state.controller = null;
    const stale = disposed || controller.signal.aborted || !states.has(tab) || currentSpec(tab) !== candidate.url;
    if (stale) {
      // Its token is bound to a URL the tab left. Discarding works per tab, so
      // it is skipped while a newer offer or question for this tab exists
      // (the stale token expires on its own and can never match again).
      if (result?.kind === "new" && !disposed && !state.offer && !state.controller) discard(tab);
      return;
    }
    state.memo = { origin: candidate.origin, at: clock(), outcome: result?.kind ?? "none" };
    if (result?.kind === "known") { diagnostics.known++; return; }
    if (result?.kind !== "new" || typeof result.token !== "string") return;
    // One notification per folder: dismissed this session, or already offered
    // in another tab of this window, means nothing new is shown.
    const elsewhere = [...states].some(([other, entry]) => other !== tab && entry.offer?.root === result.root);
    if (shared.dismissedRoots.has(result.root) || elsewhere) {
      state.memo.outcome = elsewhere ? "offered" : "dismissed";
      discard(tab);
      return;
    }
    await show(tab, candidate, result);
  }

  async function show(tab, candidate, result) {
    const state = stateFor(tab);
    const previous = state.offer;
    if (previous) {
      // Superseded locally only: a per-tab discard would also drop the token
      // that was just issued for this tab.
      state.offer = null;
      previous.closed = true;
      if (previous.expiry !== null) timers.clearTimeout(previous.expiry);
      removeNotification(tab, previous.notification);
    }
    clearResult(tab);
    const notifications = box(tab);
    const navigation = state.navigation;
    if (!notifications || !samePage(tab, state, navigation, candidate.url)) { discard(tab); return; }
    const offer = { token: result.token, url: candidate.url, origin: candidate.origin, root: result.root,
      navigation, notification: null, expiry: null, closed: false, accepting: false };
    state.offer = offer;
    const notification = await Promise.resolve().then(() => notifications.appendNotification(NOTIFICATION_VALUE, {
      label: arrivalMessage(result.displayRoot ?? result.root),
      priority: notifications.PRIORITY_INFO_MEDIUM,
      eventCallback: event => {
        if (event === "dismissed") dismiss(tab, offer);
        else if (event === "removed" && state.offer === offer && !offer.accepting) {
          // Removed by someone else (not a button, not our own navigation
          // handling): the offer ends and the tab may be asked again.
          invalidate(tab, { counted: false });
          state.memo = null;
          schedule(tab);
        }
      },
    }, [
      { label: "Keep as project", accessKey: "K", primary: true, callback: () => { keep(tab, offer).catch(() => {}); return false; } },
      { label: "Not now", accessKey: "N", callback: () => { dismiss(tab, offer); return false; } },
    ])).catch(() => null);
    offer.notification = notification;
    // The bar may arrive after the tab moved on, closed, or the window went
    // away; it is then removed at once and the token dropped.
    if (!notification || offer.closed || state.offer !== offer || !samePage(tab, state, offer.navigation, offer.url)) {
      removeNotification(tab, notification);
      if (state.offer === offer) { state.offer = null; offer.closed = true; discard(tab); }
      return;
    }
    // This module removes the offer itself when the URL changes; a reload of
    // the same URL keeps it (the token is bound to that exact URL).
    if ("persistence" in notification) notification.persistence = 1000;
    diagnostics.offers++;
    const remaining = Number.isSafeInteger(result.expiresAt) ? Math.max(0, result.expiresAt - clock()) : 0;
    offer.expiry = timers.setTimeout(() => { offer.expiry = null; if (state.offer === offer) invalidate(tab); }, remaining);
  }

  function dismiss(tab, offer) {
    const state = states.get(tab);
    if (!state || state.offer !== offer || offer.accepting) return;
    shared.dismissedRoots.add(offer.root);
    state.memo = { origin: offer.origin, at: clock(), outcome: "dismissed" };
    diagnostics.dismissed++;
    invalidate(tab, { counted: false });
  }

  async function keep(tab, offer) {
    const state = states.get(tab);
    if (!state || state.offer !== offer || offer.accepting || offer.closed) return;
    if (!samePage(tab, state, offer.navigation, offer.url)) { invalidate(tab); return; }
    offer.accepting = true;
    if (offer.expiry !== null) { timers.clearTimeout(offer.expiry); offer.expiry = null; }
    let project = null, code = null;
    try { project = await services.acceptArrival({ window, tab, token: offer.token }); }
    catch (error) { code = typeof error?.code === "string" ? error.code : null; }
    // Navigation, tab close and disposal close the offer (and revoke the
    // acceptance in the service). Whatever the answer, nothing about it is
    // shown on another document, in a closed tab or in a disposed window.
    if (offer.closed || !samePage(tab, state, offer.navigation, offer.url)) {
      if (state.offer === offer) invalidate(tab, { counted: false });
      return;
    }
    state.offer = null;
    offer.closed = true;
    removeNotification(tab, offer.notification);
    state.memo = { origin: offer.origin, at: clock(), outcome: project ? "known" : "failed" };
    if (project) diagnostics.accepted++; else diagnostics.failed++;
    await showResult(tab, state, offer, project, code);
  }

  /** One follow-up line after the user's choice, on the same document only;
   * it goes with the next navigation. */
  async function showResult(tab, state, offer, project, code) {
    const notifications = box(tab);
    const current = () => samePage(tab, state, offer.navigation, offer.url);
    if (!notifications || !current()) return;
    clearResult(tab);
    const name = typeof project?.manifest?.name === "string" ? project.manifest.name : null;
    const label = project ? `${name ?? "The folder"} is now a project in AxioSozo.` : arrivalFailureMessage(code);
    const buttons = [];
    if (openOverview && project && typeof project.id === "string") {
      buttons.push({ label: "Show project", accessKey: "S", callback: () => { openOverview(`#project=${project.id}`); return false; } });
    } else if (openOverview && code !== "READ_CONTAINMENT_UNAVAILABLE") {
      let space = null;
      try { space = adapter.workspaceForTab(tab) ?? adapter.activeWorkspaceUuid(); } catch { space = null; }
      buttons.push({ label: code === "PROJECT_EXISTS" ? "Show projects" : "Choose folder…", accessKey: "C",
        callback: () => { openOverview(code !== "PROJECT_EXISTS" && space ? `#add-project=${space}` : "#projects"); return false; } });
    }
    let notification = null;
    notification = await Promise.resolve().then(() => notifications.appendNotification(RESULT_NOTIFICATION_VALUE, {
      label, priority: project ? notifications.PRIORITY_INFO_LOW : notifications.PRIORITY_INFO_MEDIUM,
      eventCallback: event => { if (event === "removed" && notification && state.result === notification) state.result = null; },
    }, buttons)).catch(() => null);
    if (!notification || !current()) { removeNotification(tab, notification); return; }
    state.result = notification;
  }

  // ---- Wiring ------------------------------------------------------------------------------
  const progress = {
    onLocationChange(browser, webProgress, _request, _location, flags) {
      if (!webProgress?.isTopLevel) return;
      const tab = gBrowser.getTabForBrowser(browser);
      const state = tab && states.get(tab);
      if (state) {
        const sameDocument = !!(flags & WPL.LOCATION_CHANGE_SAME_DOCUMENT);
        cancelPending(state);
        // Any other URL, client-side routes included, ends the offer; a route
        // change keeps the tab eligible for a fresh offer for its new URL. A
        // reload of the same URL keeps an offer that is still a question, but
        // any location change revokes an acceptance already under way.
        const offer = state.offer;
        if (offer && (offer.accepting || offer.url !== currentSpec(tab))) {
          invalidate(tab);
          if (sameDocument) state.memo = null;
        } else if (offer) {
          offer.navigation = state.navigation + 1; // the same URL, reloaded, carries the offer
        }
        state.navigation++;
        if (!sameDocument) clearResult(tab); // belongs to the old page
      }
      if (tab && !(flags & WPL.LOCATION_CHANGE_ERROR_PAGE)) schedule(tab);
    },
  };
  cleanups.push(addTabsProgressListener(window, progress));

  const onTabSelect = () => {
    const selected = gBrowser.selectedTab;
    // Only the selected tab asks; a tab sent to the background stops asking
    // (an offer it already shows stays with it).
    for (const [tab, state] of states) if (tab !== selected) cancelPending(state);
    schedule(selected);
  };
  const onTabClose = event => {
    const tab = event.target;
    const state = states.get(tab);
    if (!state) return;
    cancelPending(state);
    // invalidate() discards when there is an offer; otherwise discard here,
    // so a token issued for this tab never outlives it.
    if (state.offer) invalidate(tab, { counted: false });
    else discard(tab);
    clearResult(tab);
    states.delete(tab);
  };
  gBrowser.tabContainer.addEventListener("TabSelect", onTabSelect);
  gBrowser.tabContainer.addEventListener("TabClose", onTabClose);
  cleanups.push(() => {
    gBrowser.tabContainer.removeEventListener("TabSelect", onTabSelect);
    gBrowser.tabContainer.removeEventListener("TabClose", onTabClose);
  });

  schedule(gBrowser.selectedTab);

  return Object.freeze({
    /** Counts only; no URLs, folders or tokens. */
    diagnostics: () => ({ ...diagnostics, pending: [...states.values()].filter(state => state.timer !== null || state.controller).length,
      offered: [...states.values()].filter(state => state.offer).length }),
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const [tab, state] of states) {
        cancelPending(state);
        invalidate(tab, { counted: false });
        clearResult(tab);
      }
      states.clear();
      try { services.discardArrival({ window }); } catch {}
      for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
    },
  });
}
