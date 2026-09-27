/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { allowedFixtureURL, validFixtureOrigin } from "./CEFEngineAdapter.sys.mjs";
import { transferableGeckoURL } from "./CEFPresenter.sys.mjs";

const LIMITATIONS = "Local GET fixture only. Experimental: automatic Chromium control, IME, clipboard, native accessibility, downloads and permissions are unavailable.";
// F6 gate (contexts-api-v1 §4). Default false; the lead owns the pref default.
export const ENGINE_PREFERENCE_PREF = "axiosozo.engine.preferences.enabled";
const PREFERENCE_REASON = /^[a-z][a-z0-9_]{0,31}$/u;
const WEB_LIMITATIONS = "Chromium tabs use their own persistent Chromium profile, separate from Firefox. IME, native accessibility, downloads, extensions and site permissions are not integrated yet.";

/**
 * Engine switching in browser chrome; no website event listener. Web mode puts
 * the switch in Zen's own tab menu and address bar. The fixture probe keeps an
 * explicit toolbar action for its owned test page.
 */
export function installEngineProbeControls(win, gecko, { Presenter, onEngineChange = () => {},
  onTargetEvent = () => {}, onFailure = () => {} } = {}) {
  const origin = win.Services.env.get("AXIOSOZO_ENGINE_FIXTURE_ORIGIN");
  const fixtureMode = win.Services.env.get("AXIOSOZO_ENGINE_PROBE") === "1";
  if (fixtureMode ? !validFixtureOrigin(origin) : win.Services.env.get("AXIOSOZO_ENGINE_SWITCHING") !== "1") return null;
  const browsingMode = fixtureMode ? "fixture" : "web";
  const limitations = fixtureMode ? LIMITATIONS : WEB_LIMITATIONS;
  const toolbar = win.document.getElementById("nav-bar-customization-target");
  if ((fixtureMode && !toolbar) || typeof Presenter !== "function") return null;
  const button = fixtureMode ? win.document.createXULElement("toolbarbutton") : null;
  if (button) button.id = "axiosozo-engine-probe";
  let presenter = null;
  let pending = false;
  let disposed = false;
  let state = { engine: "gecko", experimental: false, version: null, fixtureOnly: false };
  let failure = null;
  let targetEvents = 0;
  const cefOwners = new Set();

  function refreshOwners() {
    if (pending) return; // Keep both old/new logical targets blocked during transition.
    cefOwners.clear();
    const native = presenter?.diagnostics();
    for (const tabId of native?.ownedTabIds ?? []) cefOwners.add(tabId);
    if (native?.engine === "chromium" && native.target?.tab_id) cefOwners.add(native.target.tab_id);
  }

  function updateButton() {
    if (!button) return;
    const label = pending ? "Switching engine…" : state.engine === "chromium"
      ? (fixtureMode ? "Return to Gecko" : "Experimental Chromium · switch to Firefox")
      : (fixtureMode ? "Test Chromium · fixture only" : "Firefox · try experimental Chromium");
    // Only this presenter-owned, bounded diagnostic belongs in the tooltip.
    // Native errors remain separate and take precedence above the limitation.
    const scaleReason = state.engine === "chromium" && typeof state.reason === "string"
      && /^CEF render scale capped at [1-4](?:\.(?:25|5|75))?× for this window size$/u.test(state.reason)
      ? state.reason + ". " : "";
    button.setAttribute("label", label);
    button.setAttribute("aria-label", label + ". " + limitations);
    button.setAttribute("tooltiptext", (failure ? failure + ". " : "") + scaleReason + limitations);
    button.setAttribute("engine", state.engine === "chromium" ? "chromium" : "gecko");
    button.disabled = pending || disposed;
  }
  function failed(error) {
    refreshOwners();
    failure = /^[A-Z0-9_]{1,96}$/u.test(error?.message) ? error.message : "CEF_PROBE_FAILED";
    updateButton();
    onFailure(error);
  }
  function getPresenter() {
    if (!presenter) presenter = new Presenter(win, gecko, {
      browsingMode,
      onEngineChange(next) { if (!disposed) { state = { ...next }; refreshOwners(); updateButton(); onEngineChange(next); } },
      // Retained Gecko action authority ends before any asynchronous switch work.
      onSwitchStart(tabId) { if (typeof tabId === "string") cefOwners.add(tabId); },
      onTargetEvent(event) { if (!disposed) { targetEvents++; onTargetEvent(event); } },
      onFailure: failed,
    });
    return presenter;
  }
  async function switchEngine(engine) {
    if (disposed) throw new Error("ENGINE_PROBE_DISPOSED");
    if (pending) throw new Error("ENGINE_SWITCH_IN_PROGRESS");
    pending = true; failure = null; updateButton();
    try {
      if (engine === "gecko") return await presenter?.switchToGecko();
      const tab = win.gBrowser.selectedTab;
      const record = tab && gecko.find(tab.linkedBrowser);
      const target = record && gecko.target(record);
      // Reject before constructing any presenter or changing browser commands.
      // The presenter and native host independently validate again at dispatch.
      if (!target || typeof target.tab_id !== "string" || target.private_mode
          || (fixtureMode && (target.identity !== origin || !allowedFixtureURL(tab.linkedBrowser.currentURI.spec, origin)))) {
        throw new Error(fixtureMode ? "CEF_LOCAL_FIXTURE_ONLY" : "CEF_PRIVATE_OR_UNKNOWN_TAB");
      }
      cefOwners.add(target.tab_id); // Invalidate retained Gecko action authority before any async work.
      const switchedTarget = await getPresenter().switchToChromium(tab);
      if (disposed) throw new Error("ENGINE_PROBE_DISPOSED");
      return switchedTarget;
    } catch (error) {
      failed(error);
      throw error;
    } finally {
      pending = false; refreshOwners(); updateButton();
    }
  }
  let lastPreference = null;
  function preferenceEnabled() {
    try { return win.Services.prefs?.getBoolPref?.(ENGINE_PREFERENCE_PREF, false) === true; }
    catch { return false; }
  }
  /**
   * F6 engine-preference hook (contexts-api-v1 §5). Resolves, never rejects. It
   * reuses the explicit per-tab switch, so every native, private and URL check
   * of that switch still applies; on any failure the Firefox tab is kept.
   */
  async function applyPreference(tab, engine, options) {
    let reason = null;
    try { reason = options?.reason; } catch {}
    const requested = engine === "firefox" || engine === "chromium" ? engine : null;
    const result = (applied, error) => {
      const outcome = error ? { applied, engine: requested, error } : { applied, engine: requested };
      lastPreference = { ...outcome, reason: typeof reason === "string" && PREFERENCE_REASON.test(reason) ? reason : null };
      return Object.freeze(outcome);
    };
    try {
      if (!requested) return result(false, "INVALID_ENGINE");
      if (!preferenceEnabled()) return result(false, "DISABLED");
      // Only the daily web switch applies preferences; the fixture probe stays manual.
      if (disposed || fixtureMode || !presenter || typeof presenter.setTabEngine !== "function") return result(false, "UNAVAILABLE");
      if (win.PrivateBrowsingUtils?.isWindowPrivate?.(win)) return result(false, "PRIVATE");
      const browser = tab?.linkedBrowser;
      const record = browser && gecko.find(browser);
      const target = record && gecko.target(record);
      if (!target || typeof target.tab_id !== "string") return result(false, "UNKNOWN_TAB");
      if (target.private_mode) return result(false, "PRIVATE");
      if (pending || presenter.pending) return result(false, "PENDING");
      const current = presenter.engineOf(tab) === "chromium" ? "chromium" : "firefox";
      if (current === engine) return result(false); // already in the preferred engine
      if (engine === "chromium") {
        // Only a credential-free HTTP(S) page without POST data moves across;
        // about:, chrome:, file: and other privileged pages always stay in Firefox.
        if (!transferableGeckoURL(browser)) return result(false, "UNSUPPORTED_URL");
      }
      pending = true; failure = null; updateButton();
      if (engine === "chromium") cefOwners.add(target.tab_id); // before any async work
      try {
        await presenter.setTabEngine(tab, engine === "chromium" ? "chromium" : "gecko");
      } catch (error) {
        failed(error);
        return result(false, error?.message === "ENGINE_SWITCH_CANCELLED" ? "CANCELLED" : "SWITCH_FAILED");
      } finally {
        pending = false; refreshOwners(); updateButton();
      }
      if (disposed) return result(false, "UNAVAILABLE");
      // A switch counts only when the presenter now reports the requested engine.
      if ((presenter.engineOf(tab) === "chromium" ? "chromium" : "firefox") !== engine) return result(false, "SWITCH_FAILED");
      return result(true);
    } catch {
      return result(false, "UNAVAILABLE");
    }
  }
  const command = event => {
    if (!event.isTrusted) return;
    switchEngine(state.engine === "chromium" ? "gecko" : "chromium").catch(() => {});
  };
  if (button) {
    button.addEventListener("command", command);
    toolbar.appendChild(button);
    updateButton();
  } else getPresenter(); // restores Chromium tabs and installs the tab menu and badge
  return Object.freeze({
    switchToChromium: () => switchEngine("chromium"),
    switchToGecko: () => switchEngine("gecko"),
    setTabEngine: (tab, engine) => getPresenter().setTabEngine(tab, engine),
    applyEnginePreference: (tab, engine, options) => applyPreference(tab, engine, options),
    engineOf: tab => presenter?.engineOf(tab) ?? "gecko",
    isGeckoTargetActive: target => target?.engine === "gecko" && typeof target.tab_id === "string" && !cefOwners.has(target.tab_id),
    currentPage: (tab = win.gBrowser.selectedTab) => {
      const native = presenter?.currentPage(tab);
      if (native) return native;
      const tracked = tab && gecko.find(tab.linkedBrowser);
      const target = tracked && gecko.target(tracked);
      return !target || target.private_mode ? null : { url:tab.linkedBrowser.currentURI.spec,
        title:tab.label || "", engine:"gecko", tabId:target.tab_id };
    },
    navigate: (url, options = {}) => presenter?.navigate(url, options) ?? Promise.resolve(false),
    focus: () => presenter?.focus() ?? false,
    diagnostics: () => ({ version: 1, enabled: true, pending, disposed, failure, targetEvents,
      activeEngine: state.engine, fixtureOrigin: fixtureMode ? origin : null, browsingMode, restrictions: limitations,
      automatedChromiumControl: "unsupported", cefOwnedTabIds: [...cefOwners],
      enginePreferences: { enabled: preferenceEnabled(), last: lastPreference },
      native: presenter?.diagnostics() ?? { engine: "gecko" } }),
    async dispose() {
      if (disposed) return;
      disposed = true;
      button?.removeEventListener("command", command); button?.remove();
      await presenter?.dispose();
      cefOwners.clear();
    },
  });
}
