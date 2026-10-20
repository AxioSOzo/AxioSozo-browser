/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Three-engine switching for a window: Gecko, Chromium (EngineProbeControls with
// CEFPresenter) and WebKit (WebKitPresenter). Returns an object with the same
// surface as installEngineProbeControls(), so startup hands it to the tab glyph,
// the engine preference, the coordinator authority check and every other reader in
// place of the Chromium probe. Returns null where WebKit cannot run at all (macOS,
// other platforms, no WebKit host configured): then nothing in the window changes.
import { WebKitPresenter } from "./WebKitPresenter.sys.mjs";
import { webkitPlatform, webkitAvailabilityFor, webkitWebModeRequested, WEBKIT_VERSION } from "./WebKitEngineAdapter.sys.mjs";
import { normalizeEngineId, isEngineAvailable, engineAvailability, engineLabel, CHROMIUM_FIXTURE_LINEUP } from "./EngineRegistry.sys.mjs";
import { installEngineTabMenu } from "./EngineTabMenu.sys.mjs";
import { allowedFixtureURL } from "./EngineStreamClient.sys.mjs";
import { ensureRuntimeStylesheet } from "./DevLoop.sys.mjs";

const XHTML = "http://www.w3.org/1999/xhtml";
const XUL_TOOLBARBUTTON = "toolbarbutton";
export const CONTROLS_ATTRIBUTE = "axiosozo-webkit-controls";
// User-facing reasons for failure codes (the indicator tooltip and the tab menu).
export const FAILURE_REASONS = Object.freeze({
  WEBKIT_LOCAL_FIXTURE_ONLY: "WebKit runs only the local test page for now",
  WEBKIT_PRIVATE_OR_UNKNOWN_TAB: "WebKit is not available in private windows",
  WEBKIT_TAB_LIMIT: "Too many WebKit tabs are open",
  WEBKIT_RUNTIME_UNAVAILABLE: "The WebKit engine is not installed",
  ENGINE_SWITCH_IN_PROGRESS: "Another engine switch is still running",
  UNVERIFIED_ENGINE_RUNTIME: "The installed WebKit engine is not the verified version",
  WEBKIT_PAGE_LOAD_FAILED: "The page could not be loaded in WebKit",
});

export function installWebKitEngine(win, gecko, { chromium = null, Presenter = WebKitPresenter, onFailure = () => {} } = {}) {
  const services = win?.Services;
  let platform = null;
  try { platform = webkitPlatform(services?.appinfo?.OS, services?.appinfo?.XPCOMABI); } catch {}
  let configured = "";
  try { configured = services?.env?.get?.("AXIOSOZO_WEBKIT_BINARY") ?? ""; } catch {}
  if (!platform || !configured || !win?.gBrowser) return null;
  let presenter = null;
  let pending = false;
  let disposed = false;
  let failure = null;
  const owners = new Set(); // Gecko targets whose action authority WebKit holds (pending or active)
  const cleanups = [];
  // Over the fixture-mode Chromium probe, Chromium is the third engine for the local test page.
  let chromiumMode = null;
  try { chromiumMode = chromium?.diagnostics?.()?.browsingMode ?? null; } catch {}
  if (chromiumMode === "fixture") {
    win[CHROMIUM_FIXTURE_LINEUP] = true;
    cleanups.push(() => { delete win[CHROMIUM_FIXTURE_LINEUP]; });
  }

  function refreshOwners() {
    if (pending) return;
    owners.clear();
    for (const tabId of presenter?.owners() ?? []) owners.add(tabId);
  }
  function getPresenter() {
    presenter ??= new Presenter(win, gecko, {
      onEngineChange: () => { refreshOwners(); updateIndicator(); },
      onSwitchStart: tabId => { if (typeof tabId === "string") owners.add(tabId); },
      onFailure: error => { failure = /^[A-Z0-9_]{1,96}$/u.test(error?.message) ? error.message : "WEBKIT_FAILED"; onFailure(error); updateIndicator(); },
      // The "Try again in WebKit" button of the stopped notice on the preserved Firefox tab.
      onRetry: tab => (tab === win.gBrowser.selectedTab ? switchTo("webkit", tab) : Promise.resolve(null)),
    });
    return presenter;
  }
  const engineOf = tab => {
    if (presenter?.engineOf(tab) === "webkit") return "webkit";
    return normalizeEngineId(chromium?.engineOf(tab)) ?? "gecko";
  };

  // The engine indicator, inside the address bar before the site identity (as Chromium's
  // badge): "WebKit" while the selected tab runs in WebKit, a click returns it to Firefox.
  // Without an identity box (other layouts) it is a toolbar chip.
  const root = win.document.documentElement;
  root?.setAttribute?.(CONTROLS_ATTRIBUTE, "true");
  cleanups.push(() => root?.removeAttribute?.(CONTROLS_ATTRIBUTE));
  try { cleanups.push(ensureRuntimeStylesheet(win.document)); } catch {}
  const identity = win.document.getElementById?.("identity-box");
  const toolbar = win.document.getElementById?.("nav-bar-customization-target");
  const indicator = identity ? win.document.createElementNS(XHTML, "button")
    : (toolbar ? win.document.createXULElement(XUL_TOOLBARBUTTON) : null);
  function updateIndicator() {
    if (!indicator) return;
    const tab = win.gBrowser.selectedTab;
    const active = engineOf(tab) === "webkit";
    indicator.hidden = !active && !pending;
    const label = pending ? "Switching…" : "WebKit";
    indicator.setAttribute("label", label);
    if (identity) indicator.textContent = label;
    const reason = failure ? (FAILURE_REASONS[failure] ?? failure) + ". " : "";
    const tip = `${reason}WebKit ${WEBKIT_VERSION} (experimental, local test page only). Click to open this tab in Firefox.`;
    indicator.setAttribute(identity ? "title" : "tooltiptext", tip);
    indicator.setAttribute("aria-label", pending ? "Switching engine" : `WebKit engine, experimental. Open this tab in Firefox`);
    indicator.setAttribute("engine", "webkit");
    indicator.toggleAttribute("pending", pending);
    indicator.disabled = pending || disposed;
  }
  if (indicator) {
    indicator.id = "axiosozo-webkit-indicator";
    indicator.hidden = true;
    const command = event => {
      if (!event.isTrusted) return;
      event.stopPropagation(); // never the identity popup or the address bar
      switchTo("gecko").catch(() => {});
    };
    const type = identity ? "click" : "command";
    indicator.addEventListener(type, command);
    if (identity) identity.before(indicator); else toolbar.appendChild(indicator);
    cleanups.push(() => { indicator.removeEventListener(type, command); indicator.remove(); });
    const select = () => updateIndicator();
    win.gBrowser.tabContainer.addEventListener("TabSelect", select);
    cleanups.push(() => win.gBrowser.tabContainer.removeEventListener("TabSelect", select));
  }

  /** Moves the selected tab (or `tab`, which must be selected for WebKit) to `engine`. */
  async function switchTo(engine, tab = win.gBrowser.selectedTab) {
    const wanted = normalizeEngineId(engine);
    if (disposed) throw new Error("ENGINE_PROBE_DISPOSED");
    if (!wanted) throw new Error("UNKNOWN_ENGINE");
    if (pending || presenter?.pending) throw new Error("ENGINE_SWITCH_IN_PROGRESS");
    const from = engineOf(tab);
    if (from === wanted) return null;
    if (wanted !== "gecko" && !isEngineAvailable(wanted, win)) throw new Error("ENGINE_UNAVAILABLE");
    if (tab !== win.gBrowser.selectedTab && wanted === "webkit") throw new Error("WEBKIT_SELECTED_TAB_ONLY");
    pending = true; failure = null; updateIndicator();
    try {
      // Leave the current out-of-process engine first; the Gecko tab is the hub.
      const selected = tab === win.gBrowser.selectedTab;
      if (from === "webkit") await presenter.switchToGecko(tab);
      else if (from === "chromium") await (selected ? chromium.switchToGecko() : chromium.setTabEngine(tab, "gecko"));
      if (wanted === "webkit") return await getPresenter().switchToWebKit(tab);
      if (wanted === "chromium") {
        if (!chromium) throw new Error("ENGINE_UNAVAILABLE");
        return await (selected ? chromium.switchToChromium() : chromium.setTabEngine(tab, "chromium"));
      }
      return null;
    } catch (error) {
      failure = /^[A-Z0-9_]{1,96}$/u.test(error?.message) ? error.message : "ENGINE_SWITCH_FAILED";
      throw error;
    } finally {
      pending = false; refreshOwners(); updateIndicator();
    }
  }

  // Zen's tab context menu: "Open in" with every available engine (latest installer wins).
  // Per tab: WebKit is offered only where it can run, otherwise disabled with the reason.
  const availability = (tab, id) => {
    if (id !== "webkit" || engineOf(tab) === "webkit") return null;
    if (tab !== win.gBrowser.selectedTab) return { available: false, reason: "Select the tab first" };
    const origin = (() => { try { return services?.env?.get?.("AXIOSOZO_ENGINE_FIXTURE_ORIGIN") ?? ""; } catch { return ""; } })();
    if (!allowedFixtureURL(tab.linkedBrowser?.currentURI?.spec, origin)) return { available: false, reason: FAILURE_REASONS.WEBKIT_LOCAL_FIXTURE_ONLY };
    return null;
  };
  const menu = installEngineTabMenu(win, { engineOf, setTabEngine: (tab, id) => switchTo(id, tab), onFailure, availability });
  if (menu) cleanups.push(() => menu.dispose());
  updateIndicator();

  return Object.freeze({
    switchTo,
    switchToWebKit: () => switchTo("webkit"),
    switchToChromium: () => switchTo("chromium"),
    switchToGecko: () => switchTo("gecko"),
    setTabEngine: (tab, engine) => switchTo(engine, tab),
    async applyEnginePreference(tab, engine, options) {
      // WebKit is fixture-only: a context preference never moves a tab into it.
      if (normalizeEngineId(engine) === "webkit") return Object.freeze({ applied: false, engine, error: "UNAVAILABLE" });
      if (engineOf(tab) === "webkit") return Object.freeze({ applied: false, engine, error: "PENDING" });
      return chromium?.applyEnginePreference(tab, engine, options) ?? Object.freeze({ applied: false, engine, error: "UNAVAILABLE" });
    },
    engineOf,
    isGeckoTargetActive: target => target?.engine === "gecko" && typeof target.tab_id === "string" && !owners.has(target.tab_id)
      && (chromium ? chromium.isGeckoTargetActive(target) : true),
    currentPage: (tab = win.gBrowser.selectedTab) => presenter?.currentPage(tab) ?? chromium?.currentPage(tab) ?? (() => {
      const tracked = tab && gecko.find(tab.linkedBrowser);
      const target = tracked && gecko.target(tracked);
      return !target || target.private_mode ? null : { url: tab.linkedBrowser.currentURI.spec, title: tab.label || "", engine: "gecko", tabId: target.tab_id };
    })(),
    navigate: (url, options = {}) => presenter?.active ? presenter.navigate(url, options) : (chromium?.navigate(url, options) ?? Promise.resolve(false)),
    focus: () => presenter?.active ? presenter.focus() : (chromium?.focus() ?? false),
    /** Privileged diagnostic only (GUI evidence): the presented WebKit pixels. */
    captureWebKitFrame: () => { if (!presenter) throw new Error("NO_VERIFIED_WEBKIT_FIXTURE_FRAME"); return presenter.captureFixtureFrame(); },
    diagnostics() {
      const chromiumState = chromium?.diagnostics() ?? null;
      const tab = win.gBrowser.selectedTab;
      return { version: 1, enabled: true, tabSwitch: true, pending: pending || !!chromiumState?.pending || !!presenter?.pending,
        disposed, failure, browsingMode: chromiumState?.browsingMode ?? "fixture", activeEngine: engineOf(tab),
        engines: ["gecko", "chromium", "webkit"].map(id => ({ id, label: engineLabel(id), ...engineAvailability(id, win) })),
        webkit: { ...webkitAvailabilityFor(win), webModeRequested: webkitWebModeRequested(win), webMode: "unavailable",
          native: presenter?.diagnostics() ?? { engine: "gecko" } },
        webkitOwnedTabIds: [...owners],
        enginePreferences: chromiumState?.enginePreferences ?? { enabled: false, last: null },
        chromium: chromiumState, native: presenter?.active ? presenter.diagnostics() : (chromiumState?.native ?? { engine: "gecko" }) };
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
      await presenter?.dispose();
      owners.clear();
      await chromium?.dispose();
    },
  });
}
