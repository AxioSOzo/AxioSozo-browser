/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { GeckoEngineAdapter } from "chrome://browser/content/axiosozo/GeckoEngineAdapter.sys.mjs";
import { attachCoordinator } from "chrome://browser/content/axiosozo/BrowserCoordinator.sys.mjs";
import { CEFPresenter } from "chrome://browser/content/axiosozo/CEFPresenter.sys.mjs";
import { installEngineProbeControls } from "chrome://browser/content/axiosozo/EngineProbeControls.sys.mjs";

// Loaded only by ZenPreloadedScripts in the trusted browser window.
// Zen owns the visible frontend. The only additions are a tab-menu engine
// switch and an address-bar badge on Chromium tabs; no shortcut is taken over.
async function initialize() {
  await window.gZenStartup.promiseInitialized;
  if (!Services.prefs.getBoolPref("axiosozo.foundation.enabled", true)) return;
  const adapter = new GeckoEngineAdapter(window);
  // Per-tab engine switching in `./dev` and `./dev web-probe`; the fixture probe
  // (`./dev engine-probe`) adds its own explicit toolbar action.
  const engineProbe = installEngineProbeControls(window, adapter, {
    Presenter: CEFPresenter,
    onFailure: () => console.error("AxioSozo Chromium switch unavailable; Firefox tab retained"),
  });
  const fixtureProbe = engineProbe?.diagnostics().browsingMode === "fixture";
  const probeSheet = fixtureProbe ? document.createProcessingInstruction("xml-stylesheet",
    'href="chrome://browser/content/axiosozo/browser-experience.css" type="text/css"') : null;
  if (probeSheet) document.insertBefore(probeSheet, document.documentElement);
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
  window.AxioSozo = Object.freeze({ version: 4, engine: adapter, engineProbe, ensureCoordinator,
    get coordinator() { return coordinator; } });
  window.addEventListener("unload", () => {
    disposed = true; probeSheet?.remove();
    engineProbe?.dispose().catch(() => {});
    adapter.dispose();
  }, { once: true });
}
window.addEventListener("MozBeforeInitialXULLayout", () => { initialize().catch(console.error); }, { once: true });
