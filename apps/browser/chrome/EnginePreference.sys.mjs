/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// F6 engine preference (HANDOFF_3 §5; contexts-api-v1 §4, §5). Behind
// `axiosozo.engine.preferences.enabled` (default false) until E1/E2 pass. When on,
// a context's `engine_preference` is applied once to each tab whose first http(s)
// page finishes loading in that context, through the CEF workstream's
// engineProbe.applyEnginePreference hook, which reuses the explicit per-tab switch
// and keeps the Firefox tab on any failure. Never in private windows. Per-site
// preferences are not part of M1 here: the context preference is the only source.
import { WPL, webURL, addTabsProgressListener } from "./DevLoop.sys.mjs";
import { normalizeEngineId, DEFAULT_ENGINE } from "./EngineRegistry.sys.mjs";

export const ENGINE_PREFERENCE_PREF = "axiosozo.engine.preferences.enabled";
export const PREFERENCE_REASON = "context_preference";
const INERT = Object.freeze({ dispose() {}, diagnostics: () => ({ enabled: false, reason: "UNAVAILABLE", attempts: [] }) });

export function enginePreferencesEnabled(window) {
  try { return window.Services?.prefs?.getBoolPref?.(ENGINE_PREFERENCE_PREF, false) === true; } catch { return false; }
}

/**
 * `services`: listContexts, on("contexts"). `adapter`: isPrivateWindow,
 * workspaceForTab. `engineProbe`: object from installEngineProbeControls, or null
 * when per-tab switching is off (treated as UNAVAILABLE: nothing is installed).
 */
export function installEnginePreference(window, { services, adapter, engineProbe } = {}) {
  if (!services || !adapter || !window?.gBrowser) return INERT;
  if (typeof engineProbe?.applyEnginePreference !== "function") return INERT; // switch unavailable
  if (adapter.isPrivateWindow()) return INERT;
  const gBrowser = window.gBrowser;
  const cleanups = [];
  let disposed = false;
  let contexts = [];
  const handled = new WeakSet(); // one automatic attempt per tab, so a manual switch back is respected
  const attempts = [];

  async function loadContexts() {
    try { const list = await services.listContexts(); contexts = Array.isArray(list) ? list : []; } catch { contexts = []; }
  }
  const loaded = loadContexts();

  async function apply(tab) {
    if (disposed || handled.has(tab) || !enginePreferencesEnabled(window)) return null;
    await loaded;
    if (disposed || handled.has(tab) || !enginePreferencesEnabled(window) || adapter.isPrivateWindow()) return null;
    const url = webURL(tab.linkedBrowser?.currentURI?.spec);
    if (!url) return null;
    const contextUuid = adapter.workspaceForTab(tab);
    // Registry id; the contract's `firefox` reads as `gecko`. Unknown values are ignored.
    const preference = contextUuid ? normalizeEngineId(contexts.find(context => context.uuid === contextUuid)?.engine_preference) : null;
    handled.add(tab);
    // The tab just loaded in the default engine, so that preference is already satisfied.
    if (!preference || preference === DEFAULT_ENGINE) return null;
    let result;
    try {
      result = await engineProbe.applyEnginePreference(tab, preference, { reason: PREFERENCE_REASON });
    } catch {
      result = { applied: false, engine: preference, error: "UNAVAILABLE" }; // the Firefox tab stays
    }
    const outcome = { applied: result?.applied === true, engine: preference, error: result?.applied === true ? null : result?.error ?? "SWITCH_FAILED" };
    attempts.push(outcome);
    if (attempts.length > 32) attempts.shift();
    return outcome;
  }

  const progress = {
    onStateChange(browser, webProgress, _request, flags, status) {
      // A finished, successful top-level load: the page is committed and its
      // session-history entry exists, which the switch needs to carry the address.
      if (!webProgress?.isTopLevel || !(flags & WPL.STATE_STOP) || !(flags & WPL.STATE_IS_WINDOW) || status !== 0) return;
      const tab = gBrowser.getTabForBrowser(browser);
      if (tab && !handled.has(tab) && webURL(browser.currentURI?.spec)) apply(tab).catch(() => {});
    },
  };
  cleanups.push(addTabsProgressListener(window, progress));
  cleanups.push(services.on("contexts", () => { loadContexts(); }));

  return Object.freeze({
    apply,
    diagnostics: () => ({ enabled: enginePreferencesEnabled(window), attempts: attempts.map(a => ({ ...a })) }),
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const cleanup of cleanups.reverse()) { try { cleanup?.(); } catch {} }
    },
  });
}
