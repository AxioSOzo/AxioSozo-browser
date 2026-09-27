/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { GeckoEngineAdapter } from "chrome://browser/content/axiosozo/GeckoEngineAdapter.sys.mjs";
import { attachCoordinator } from "chrome://browser/content/axiosozo/BrowserCoordinator.sys.mjs";
import { CEFPresenter } from "chrome://browser/content/axiosozo/CEFPresenter.sys.mjs";
import { installEngineProbeControls } from "chrome://browser/content/axiosozo/EngineProbeControls.sys.mjs";

const AXIOSOZO = "chrome://browser/content/axiosozo/";

// Contexts modules (Handoff 3) load into the shared system global so that
// AxioSozoServices is one process-wide instance. Each is optional: a missing
// or failing module is logged and skipped, and ordinary browsing continues.
function optionalModule(file) {
  try { return ChromeUtils.importESModule(AXIOSOZO + file); }
  catch (error) { console.error(`AxioSozo: ${file} unavailable`, error); return null; }
}

function guarded(label, install) {
  try { return install() ?? null; }
  catch (error) { console.error(`AxioSozo: ${label} failed`, error); return null; }
}

function neutralDecision(request, reason) {
  return { version: 1, request_id: typeof request?.request_id === "string" ? request.request_id : null,
    choice_set: "site_rule_v1", context_version: "site-rule-1", outcome: "none", reason_code: null,
    reason, data_sent: false, authority: "suggestion_only", action_authorized: false };
}

// F1–F6, gated by axiosozo.contexts.enabled. Returns disposers in install order.
async function installContexts({ engineProbe }) {
  const disposers = [];
  const runtime = {};
  if (!Services.prefs.getBoolPref("axiosozo.contexts.enabled", true)) return { disposers, services: null, zen: null, runtime };
  const adapterModule = optionalModule("ZenWorkspaceAdapter.sys.mjs");
  const servicesModule = optionalModule("AxioSozoServices.sys.mjs");
  if (!adapterModule || !servicesModule) return { disposers, services: null, zen: null, runtime };
  const zen = new adapterModule.ZenWorkspaceAdapter(window);
  disposers.push(() => zen.dispose());
  const services = guarded("services", () => servicesModule.AxioSozoServices.get());
  if (!services) return { disposers, services: null, zen, runtime };
  const unregister = guarded("window registration", () => services.registerWindow(window, zen));
  if (unregister) disposers.push(unregister);
  await zen.whenReady().catch(error => console.error("AxioSozo: Zen workspaces not ready", error));

  // ── about:axiosozo and its actor (overview workstream). Both calls are
  // idempotent per process inside AboutAxioSozo.sys.mjs, so every window may call them.
  const about = optionalModule("AboutAxioSozo.sys.mjs");
  const aboutRegistered = !!guarded("about:axiosozo registration", () => about?.registerAboutAxioSozo());
  guarded("overview actor registration", () => about?.registerOverviewActor());
  const openOverview = aboutRegistered ? () => window.switchToTabHavingURI("about:axiosozo", true) : null;

  // ── F1: context type in Zen's workspace menu (services workstream).
  const menuModule = optionalModule("ContextMenuContexts.sys.mjs");
  const menu = guarded("context menu", () => menuModule?.installContextTypeMenu(window, { services, adapter: zen, openOverview }));
  if (menu) disposers.push(() => menu.dispose());

  // ── Runtime workstream installers (contexts-api-v1 §3.5), each { dispose() }.
  const decisionModule = optionalModule("ProviderDecision.sys.mjs");
  const hostDecide = decisionModule
    ? guarded("decision provider", () => servicesModule.processSingleton("decide", () => decisionModule.createDecide()))
    : null;
  // Never rejects: any failure is the neutral outcome (decision-v1).
  const decide = async (request, options = {}) => {
    if (!hostDecide) return neutralDecision(request, "HOST_UNAVAILABLE");
    try { return await hostDecide(request, options); } catch { return neutralDecision(request, "HOST_UNAVAILABLE"); }
  };
  const installers = [
    ["DevLoop.sys.mjs", "installDevLoop", { services, adapter: zen }],
    ["SiteRuleRuntime.sys.mjs", "installSiteRuleRuntime", { services, adapter: zen, decide }],
    ["EnginePreference.sys.mjs", "installEnginePreference", { services, adapter: zen, engineProbe }],
  ];
  for (const [file, name, options] of installers) {
    const module = optionalModule(file);
    const installed = guarded(name, () => module?.[name]?.(window, options));
    if (installed && typeof installed.dispose === "function") disposers.push(() => installed.dispose());
    if (typeof installed?.diagnostics === "function") runtime[name] = installed.diagnostics;
  }
  // Read-only runtime counters for GUI evidence (e.g. Jev decideCalls, provider host state).
  if (typeof hostDecide?.diagnostics === "function") runtime.decisionHost = hostDecide.diagnostics;
  return { disposers, services, zen, runtime };
}

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
  let contexts = { disposers: [], services: null, zen: null, runtime: {} };
  window.AxioSozo = Object.freeze({ version: 5, engine: adapter, engineProbe, ensureCoordinator,
    get coordinator() { return coordinator; },
    // Diagnostics for GUI evidence (stored context types, container identities).
    get contexts() { return Object.freeze({ services: contexts.services, workspaces: contexts.zen,
      diagnostics: () => Object.fromEntries(Object.entries(contexts.runtime ?? {}).map(([name, read]) => {
        try { return [name, JSON.parse(JSON.stringify(read()))]; } catch { return [name, null]; }
      })) }); } });
  const disposeContexts = () => {
    for (const dispose of contexts.disposers.splice(0).reverse()) {
      try { dispose(); } catch (error) { console.error("AxioSozo: dispose failed", error); }
    }
  };
  window.addEventListener("unload", () => {
    disposed = true; probeSheet?.remove();
    disposeContexts();
    engineProbe?.dispose().catch(() => {});
    adapter.dispose();
  }, { once: true });
  try {
    contexts = await installContexts({ engineProbe });
    if (disposed) disposeContexts();
  } catch (error) { console.error("AxioSozo: contexts unavailable", error); }
}
window.addEventListener("MozBeforeInitialXULLayout", () => { initialize().catch(console.error); }, { once: true });
