/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { allowedFixtureURL, validFixtureOrigin } from "./CEFEngineAdapter.sys.mjs";

const LIMITATIONS = "Local GET fixture only. Experimental: automatic Chromium control, IME, clipboard, native accessibility, downloads and permissions are unavailable.";

/** Explicit development action in browser chrome; no website event listener. */
export function installEngineProbeControls(win, gecko, { Presenter, onEngineChange = () => {},
  onTargetEvent = () => {}, onFailure = () => {} } = {}) {
  const origin = win.Services.env.get("AXIOSOZO_ENGINE_FIXTURE_ORIGIN");
  if (win.Services.env.get("AXIOSOZO_ENGINE_PROBE") !== "1" || !validFixtureOrigin(origin)) return null;
  const toolbar = win.document.getElementById("nav-bar-customization-target");
  if (!toolbar || typeof Presenter !== "function") return null;
  const button = win.document.createXULElement("toolbarbutton");
  button.id = "axiosozo-engine-probe";
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
    if (native?.engine === "chromium" && native.target?.tab_id) cefOwners.add(native.target.tab_id);
  }

  function updateButton() {
    const label = pending ? "Engine probe running…" : state.engine === "chromium"
      ? "Return to Gecko" : "Test Chromium · fixture only";
    // Only this presenter-owned, bounded diagnostic belongs in the tooltip.
    // Native errors remain separate and take precedence above the limitation.
    const scaleReason = state.engine === "chromium" && typeof state.reason === "string"
      && /^CEF render scale capped at [1-4](?:\.(?:25|5|75))?× for this window size$/u.test(state.reason)
      ? state.reason + ". " : "";
    button.setAttribute("label", label);
    button.setAttribute("aria-label", label + ". " + LIMITATIONS);
    button.setAttribute("tooltiptext", (failure ? failure + ". " : "") + scaleReason + LIMITATIONS);
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
      onEngineChange(next) { if (!disposed) { state = { ...next }; refreshOwners(); updateButton(); onEngineChange(next); } },
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
      if (!target || typeof target.tab_id !== "string" || target.private_mode || target.identity !== origin
          || !allowedFixtureURL(tab.linkedBrowser.currentURI.spec, origin)) throw new Error("CEF_LOCAL_FIXTURE_ONLY");
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
  const command = event => {
    if (!event.isTrusted) return;
    switchEngine(state.engine === "chromium" ? "gecko" : "chromium").catch(() => {});
  };
  button.addEventListener("command", command);
  toolbar.appendChild(button);
  updateButton();
  return Object.freeze({
    switchToChromium: () => switchEngine("chromium"),
    switchToGecko: () => switchEngine("gecko"),
    isGeckoTargetActive: target => target?.engine === "gecko" && typeof target.tab_id === "string" && !cefOwners.has(target.tab_id),
    diagnostics: () => ({ version: 1, enabled: true, pending, disposed, failure, targetEvents,
      activeEngine: state.engine, fixtureOrigin: origin, restrictions: LIMITATIONS,
      automatedChromiumControl: "unsupported", cefOwnedTabIds: [...cefOwners],
      native: presenter?.diagnostics() ?? { engine: "gecko" } }),
    async dispose() {
      if (disposed) return;
      disposed = true;
      button.removeEventListener("command", command); button.remove();
      await presenter?.dispose();
      cefOwners.clear();
    },
  });
}
