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

// about:axiosozo and its actor (overview workstream). Both calls are idempotent
// per process inside AboutAxioSozo.sys.mjs, so every window may call them. This
// runs before Zen restores the session: a restored, selected about:axiosozo tab
// loads immediately and would otherwise hit an unregistered about module.
function registerOverview() {
  if (!Services.prefs.getBoolPref("axiosozo.contexts.enabled", true)) return false;
  const about = optionalModule("AboutAxioSozo.sys.mjs");
  const registered = !!guarded("about:axiosozo registration", () => about?.registerAboutAxioSozo());
  guarded("overview actor registration", () => about?.registerOverviewActor());
  return registered;
}

// Tabs that loaded about:axiosozo before registration show a malformed-URI
// error page; load them again now that the module exists.
function reloadFailedOverviewTabs() {
  for (const tab of window.gBrowser?.tabs ?? []) {
    const browser = tab.linkedBrowser;
    if (browser?.currentURI?.spec.startsWith("about:axiosozo") &&
        browser.documentURI?.spec.startsWith("about:neterror")) browser.reload();
  }
}

// A plain Tools menu entry; AxioSozo takes no shortcut and adds no toolbar button.
function installToolsEntry(openOverview) {
  const popup = document.getElementById("menu_ToolsPopup");
  if (!popup) return null;
  const item = document.createXULElement("menuitem");
  item.id = "axiosozo-tools-home";
  item.setAttribute("label", "AxioSozo");
  const command = event => { if (event.isTrusted) openOverview(); };
  item.addEventListener("command", command);
  const separator = document.createXULElement("menuseparator");
  popup.prepend(item, separator);
  return () => { item.removeEventListener("command", command); item.remove(); separator.remove(); };
}

// The first normal window of a new profile opens AxioSozo once, beside the
// restored tabs, so a first-time user sees what was added and where it lives.
const INTRODUCED_PREF = "axiosozo.home.introduced";
function introduceOnce(openOverview, zen) {
  if (Services.prefs.getBoolPref(INTRODUCED_PREF, false) || !zen.isAuthoritative()) return;
  Services.prefs.setBoolPref(INTRODUCED_PREF, true);
  openOverview("#projects");
}

// F1–F6, gated by axiosozo.contexts.enabled. Returns disposers in install order.
async function installContexts({ engineProbe, aboutRegistered }) {
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

  // Reuses an open AxioSozo tab; a #fragment selects a view or item inside it.
  const openOverview = aboutRegistered ? (fragment = "") => window.switchToTabHavingURI(`about:axiosozo${fragment}`, true,
    { ignoreFragment: "whenComparingAndReplace" }) : null;
  // "Edit project…" in the sidebar opens the project's edit sheet; otherwise its card.
  const openProjectSettings = openOverview
    ? (id, { edit = false } = {}) => openOverview(edit ? `#edit-project=${id}` : `#project=${id}`) : null;
  if (aboutRegistered) guarded("overview tab recovery", () => reloadFailedOverviewTabs());
  if (openOverview) {
    const entry = guarded("tools menu entry", () => installToolsEntry(openOverview));
    if (entry) disposers.push(entry);
    guarded("first-run introduction", () => introduceOnce(openOverview, zen));
  }

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
    ["DevLoop.sys.mjs", "installDevLoop", { services, adapter: zen, openSettings: openProjectSettings }],
    ["SiteRuleRuntime.sys.mjs", "installSiteRuleRuntime", { services, adapter: zen, decide }],
    ["EnginePreference.sys.mjs", "installEnginePreference", { services, adapter: zen, engineProbe }],
  ];
  // P1 arrival: one native "keep as project?" notification for a localhost
  // page served from a new folder. P3 agents: this window presents agent
  // requests and status (the endpoint itself stays off until Settings turns it
  // on), and offers Send to agent on its own tabs. Normal windows only;
  // unknown privacy counts as private and installs nothing.
  if (guarded("arrival privacy check", () => zen.isPrivateWindow() === false)) {
    installers.push(["ProjectArrivalRuntime.sys.mjs", "installProjectArrival", { services, adapter: zen, openOverview }]);
    // The engine a tab shows, read only (no engine file is involved here).
    const engineOf = tab => engineProbe?.engineOf(tab) ?? "gecko";
    installers.push(["AgentStatusRuntime.sys.mjs", "installAgentStatus", { services, adapter: zen, openOverview, engineOf }]);
    installers.push(["AgentHandoffRuntime.sys.mjs", "installAgentHandoff", { services, adapter: zen, engineOf }]);
  }
  for (const [file, name, options] of installers) {
    const module = optionalModule(file);
    const installed = guarded(name, () => module?.[name]?.(window, options));
    if (installed && typeof installed.dispose === "function") disposers.push(() => installed.dispose());
    if (typeof installed?.diagnostics === "function") runtime[name] = installed.diagnostics;
  }
  // Read-only runtime counters for GUI evidence (e.g. Jev decideCalls, provider host state).
  if (typeof hostDecide?.diagnostics === "function") runtime.decisionHost = hostDecide.diagnostics;
  // Understand (Plan 4 step 6): counts only. Reading them creates no facade and
  // starts nothing; this window's owners end with its registration above, and
  // the shared facade closes once at profile shutdown, never per window.
  if (typeof services.getUnderstandDiagnostics === "function") runtime.understand = () => services.getUnderstandDiagnostics();
  return { disposers, services, zen, runtime };
}

// Loaded only by ZenPreloadedScripts in the trusted browser window.
// Zen owns the visible frontend. The only additions are a tab-menu engine
// switch and an address-bar badge on Chromium tabs; no shortcut is taken over.
async function initialize() {
  if (!Services.prefs.getBoolPref("axiosozo.foundation.enabled", true)) return;
  const aboutRegistered = registerOverview();
  await window.gZenStartup.promiseInitialized;
  const adapter = new GeckoEngineAdapter(window);
  // Per-tab engine switching in `./dev` and `./dev web-probe`; the fixture probe
  // (`./dev engine-probe`) adds its own explicit toolbar action.
  const engineProbe = installEngineProbeControls(window, adapter, {
    Presenter: CEFPresenter,
    onFailure: () => console.error("AxioSozo Chromium switch unavailable; Firefox tab retained"),
  });
  // The engine glyph on hovered tabs; the selected tab's glyph is the switch.
  const engineTabs = engineProbe ? guarded("engine tabs", () => optionalModule("EngineTabs.sys.mjs")?.installEngineTabs(window, { engineProbe })) : null;
  // Bottom space switcher; axiosozo.ui.spaceSwitcher.enabled=false is stock Zen.
  const spaceSwitcher = guarded("space switcher", () => optionalModule("SpaceSwitcher.sys.mjs")?.installSpaceSwitcher(window));
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
    engineTabs?.dispose();
    spaceSwitcher?.dispose();
    engineProbe?.dispose().catch(() => {});
    adapter.dispose();
  }, { once: true });
  try {
    contexts = await installContexts({ engineProbe, aboutRegistered });
    if (disposed) disposeContexts();
  } catch (error) { console.error("AxioSozo: contexts unavailable", error); }
}
window.addEventListener("MozBeforeInitialXULLayout", () => { initialize().catch(console.error); }, { once: true });
