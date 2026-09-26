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
  document.documentElement.toggleAttribute("axiosozo-minimal-ui", Services.prefs.getBoolPref("axiosozo.minimal-ui", true));
  const adapter = new GeckoEngineAdapter(window);
  const badge = document.createXULElement("toolbarbutton");
  badge.id = "axiosozo-engine-indicator";
  badge.setAttribute("label", "Firefox");
  badge.setAttribute("tooltiptext", "Firefox engine · Open browser settings");
  badge.setAttribute("aria-label", "Active engine Firefox; open browser settings");
  badge.setAttribute("engine", "gecko");
  badge.addEventListener("command", () => openProviderSettings(window));
  document.getElementById("nav-bar-customization-target").appendChild(badge);
  const engineProbe = installEngineProbeControls(window, adapter, {
    Presenter: CEFPresenter,
    onEngineChange(state) {
      const label = state.engine === "chromium" ? `Experimental Chromium ${state.version}` : "Firefox";
      badge.setAttribute("label", label);
      badge.setAttribute("aria-label", label + "; open browser settings");
      badge.setAttribute("tooltiptext", label + " · Open browser settings");
      badge.setAttribute("engine", state.engine === "chromium" ? "chromium" : "gecko");
    },
    onFailure: () => console.error("AxioSozo Chromium switch unavailable; Firefox tab retained"),
  });
  const experience = installBrowserExperience(window, { engineProbe });
  // Browser startup performs no provider discovery and starts no model client.
  // The optional privileged-action coordinator is also created only on demand.
  let coordinator = null; let coordinatorStarting = null; let disposed = false;
  const ensureCoordinator = () => {
    if (disposed) return Promise.reject(new Error("WINDOW_CLOSED"));
    if (coordinator) return Promise.resolve(coordinator);
    if (!coordinatorStarting) coordinatorStarting = attachCoordinator(window, adapter, {
      isTargetActive: target => engineProbe?.isGeckoTargetActive(target) ?? true,
    }).then(connection => { coordinator = connection; return connection; })
      .finally(() => { coordinatorStarting = null; });
    return coordinatorStarting;
  };
  window.AxioSozo = Object.freeze({ version: 3, engine: adapter, engineProbe, experience, ensureCoordinator,
    get coordinator() { return coordinator; } });
  window.addEventListener("unload", () => {
    disposed = true; experience.dispose();
    engineProbe?.dispose().catch(() => {});
    adapter.dispose();
  }, { once: true });

}
window.addEventListener("MozBeforeInitialXULLayout", () => { initialize().catch(console.error); }, { once: true });
