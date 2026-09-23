/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { GeckoEngineAdapter } from "chrome://browser/content/axiosozo/GeckoEngineAdapter.sys.mjs";
import { attachCoordinator } from "chrome://browser/content/axiosozo/BrowserCoordinator.sys.mjs";
import { openProviderSettings } from "chrome://browser/content/axiosozo/ProviderSettings.sys.mjs";
import { CEFPresenter } from "chrome://browser/content/axiosozo/CEFPresenter.sys.mjs";
import { installEngineProbeControls } from "chrome://browser/content/axiosozo/EngineProbeControls.sys.mjs";
import { installBrowserExperience } from "chrome://browser/content/axiosozo/BrowserExperience.sys.mjs";

// Loaded only by ZenPreloadedScripts in the trusted browser window.
async function initialize() {
  await window.gZenStartup.promiseInitialized;
  if (!Services.prefs.getBoolPref("axiosozo.foundation.enabled", true)) return;
  const adapter = new GeckoEngineAdapter(window);
  const badge = document.createXULElement("toolbarbutton");
  badge.id = "axiosozo-engine-indicator";
  badge.setAttribute("label", "Gecko · Dev");
  badge.setAttribute("tooltiptext", "Gecko development engine · Open provider settings");
  badge.setAttribute("aria-label", "Active engine Gecko; open provider settings");
  badge.addEventListener("command", () => openProviderSettings(window));
  document.getElementById("nav-bar-customization-target").appendChild(badge);
  const engineProbe = installEngineProbeControls(window, adapter, {
    Presenter: CEFPresenter,
    onEngineChange(state) {
      const label = state.engine === "chromium" ? `Chromium ${state.version} · Experimental` : "Gecko · Dev";
      badge.setAttribute("label", label);
      badge.setAttribute("aria-label", label + "; open provider settings");
      badge.setAttribute("tooltiptext", label + " · Open provider settings");
    },
    onFailure: () => console.error("AxioSozo Chromium fixture probe unavailable; Gecko tab retained"),
  });
  const experience = installBrowserExperience(window, { engineProbe });
  // Intentionally no second URL bar, global content script, or model input channel.
  let coordinator = null;
  window.AxioSozo = Object.freeze({ version: 2, engine: adapter, engineProbe, experience,
    get coordinator() { return coordinator; } });
  window.addEventListener("unload", () => {
    experience.dispose();
    engineProbe?.dispose().catch(() => {});
    adapter.dispose();
  }, { once: true });
  attachCoordinator(window, adapter, {
    isTargetActive: target => engineProbe?.isGeckoTargetActive(target) ?? true,
  }).then(connection => { coordinator = connection; }).catch(error => {
    // Log only our bounded error codes. Subprocess exceptions can include paths
    // or untrusted output, and must never expose the bootstrapped IPC token.
    const code = /^[A-Z][A-Z0-9_]{2,80}$/u.test(error?.message ?? "")
      ? error.message : "UNCLASSIFIED_ATTACH_FAILURE";
    console.error(`AxioSozo coordinator unavailable (${code}); normal browsing remains available`);
  });
}
window.addEventListener("MozBeforeInitialXULLayout", () => { initialize().catch(console.error); }, { once: true });
