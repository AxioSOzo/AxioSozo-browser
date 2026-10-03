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

// P6 (Plan 4): the facts the start-page gate reads on every new-tab command.
// Each lookup that fails or is unknown denies (the gate turns it into null).
function aiWindowActive() {
  const { AIWindow } = ChromeUtils.importESModule("moz-src:///browser/components/aiwindow/ui/modules/AIWindow.sys.mjs");
  if (typeof AIWindow?.isAIWindowActive !== "function") throw new Error("AI_WINDOW_UNKNOWN");
  const active = AIWindow.isAIWindowActive(window);
  return typeof active === "boolean" ? active : null;
}
// Firefox's own default new-tab page only: this window's native default URL,
// AboutNewTab's process value and its override flag, and the separate pref an
// extension's chrome_url_overrides sets (ext-url-overrides.js). A pref of the
// wrong type throws (unknown denies); an absent one is the native false.
const NEW_TAB_EXTENSION_CONTROLLED = "browser.newtab.extensionControlled";
function defaultNewTabPage() {
  const { AboutNewTab } = ChromeUtils.importESModule("resource:///modules/AboutNewTab.sys.mjs");
  return window.BROWSER_NEW_TAB_URL === "about:newtab" && AboutNewTab.newTabURL === "about:newtab"
    && AboutNewTab.newTabURLOverridden === false && Services.prefs.getBoolPref(NEW_TAB_EXTENSION_CONTROLLED, false) === false;
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
async function installContexts({ engineProbe, aboutRegistered, alive }) {
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
  // This window's own registration succeeded (it ends with the disposers).
  const registered = typeof unregister === "function";
  if (unregister) disposers.push(unregister);
  // Zen's own readiness promise must exist and fulfil. The adapter's
  // whenReady() also resolves when that promise is missing, so a registered
  // window with populated fields is not, by itself, a ready one.
  let readiness;
  try { readiness = window.gZenWorkspaces?.promiseInitialized; } catch { readiness = undefined; }
  const knownReadiness = typeof readiness?.then === "function";
  let workspacesReady = false;
  try {
    await zen.whenReady();
    if (knownReadiness) { await readiness; workspacesReady = true; }
    else console.error("AxioSozo: Zen workspace readiness is unknown");
  } catch (error) { console.error("AxioSozo: Zen workspaces not ready", error); }

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
  // P5 console errors (Plan 4 step 7): one process owner of the shared tab
  // registry, the RAM console facade and the ConsoleErrors actor, created on
  // the first window and shared by every later one. It starts no endpoint,
  // provider or Understand facade. A normal window is attached after its
  // registration and Zen readiness, before Send to agent is installed.
  const normalWindow = !!guarded("arrival privacy check", () => zen.isPrivateWindow() === false);
  // Decisions (Plan 4 step 9): the services' one process runtime (budget,
  // sending router, lazily started provider host), the same frozen interface
  // for every normal window. A window never builds a host or a budget of its
  // own, and closing it closes neither.
  const decisions = normalWindow ? guarded("decision runtime", () => services.getDecisionRuntime()) : null;
  const consoleModule = optionalModule("ConsoleErrorsNativeRuntime.sys.mjs");
  const consoleOwner = consoleModule ? guarded("console errors", () => servicesModule.processSingleton("console-errors-native",
    () => consoleModule.createConsoleErrorsNativeRuntime({ services }))) : null;
  if (consoleOwner && normalWindow) {
    // Its own engine authority: the probe handle's actual answer, or Gecko only
    // when the native environment proves switching and the probe are off.
    const consoleEngineOf = consoleModule.createConsoleEngineOf({ window, engineProbe, env: () => Services.env });
    const detach = guarded("console errors window", () => consoleOwner.attachWindow(window, { adapter: zen, engineOf: consoleEngineOf }));
    if (typeof detach === "function") disposers.push(detach);
    runtime.consoleErrors = () => consoleOwner.diagnostics();
  }
  // P4 browser tools (Plan 4 step 8): one process owner on that same console
  // owner and registry, created with the first window and shared by every
  // later one. It installs the agent tools into the channel but starts no
  // endpoint (Settings alone does), captures nothing and acts on nothing. A
  // normal window attaches its action confirmations and navigation watch.
  const bridgeModule = consoleOwner ? optionalModule("AgentBridgeRuntime.sys.mjs") : null;
  const bridge = bridgeModule ? guarded("agent tools", () => servicesModule.processSingleton("agent-bridge",
    () => bridgeModule.createAgentBridgeRuntime({ services, nativeOwner: consoleOwner }))) : null;
  if (bridge && normalWindow) {
    const detach = guarded("agent tools window", () => bridge.attachWindow(window, { adapter: zen }));
    if (typeof detach === "function") disposers.push(detach);
    runtime.agentTools = () => bridge.getState();
  }
  const installers = [
    ["DevLoop.sys.mjs", "installDevLoop", { services, adapter: zen, openSettings: openProjectSettings,
      consoleErrors: consoleOwner?.service ?? null }],
    ["SiteRuleRuntime.sys.mjs", "installSiteRuleRuntime", { services, adapter: zen, decisions }],
    ["EnginePreference.sys.mjs", "installEnginePreference", { services, adapter: zen, engineProbe }],
  ];
  // P1 arrival: one native "keep as project?" notification for a localhost
  // page served from a new folder. P3 agents: this window presents agent
  // requests and status (the endpoint itself stays off until Settings turns it
  // on), and offers Send to agent on its own tabs. Normal windows only;
  // unknown privacy counts as private and installs nothing.
  if (normalWindow) {
    installers.push(["ProjectArrivalRuntime.sys.mjs", "installProjectArrival", { services, adapter: zen, openOverview }]);
    // The engine a tab shows, read only (no engine file is involved here).
    const engineOf = tab => engineProbe?.engineOf(tab) ?? "gecko";
    installers.push(["AgentStatusRuntime.sys.mjs", "installAgentStatus", { services, adapter: zen, openOverview, engineOf }]);
    installers.push(["AgentHandoffRuntime.sys.mjs", "installAgentHandoff", { services, adapter: zen, engineOf, nativeOwner: consoleOwner }]);
  }
  for (const [file, name, options] of installers) {
    const module = optionalModule(file);
    const installed = guarded(name, () => module?.[name]?.(window, options));
    if (installed && typeof installed.dispose === "function") disposers.push(() => installed.dispose());
    if (typeof installed?.diagnostics === "function") runtime[name] = installed.diagnostics;
  }
  // Read-only runtime counters for GUI evidence (e.g. Jev decideCalls, provider host state).
  if (typeof decisions?.diagnostics === "function") runtime.decisionHost = () => decisions.diagnostics();
  // Understand (Plan 4 step 6): counts only. Reading them creates no facade and
  // starts nothing; this window's owners end with its registration above, and
  // the shared facade closes once at profile shutdown, never per window.
  if (typeof services.getUnderstandDiagnostics === "function") runtime.understand = () => services.getUnderstandDiagnostics();
  // P7 safety: counts only; reading them acquires nothing.
  if (typeof services.getSafetyDiagnostics === "function") runtime.safety = () => services.getSafetyDiagnostics();
  // Watches (Plan 4 §4): the one process schedule starts after the first
  // admitted normal window: its own registration succeeded, the services
  // still hold it as a registered normal window, and it is live and actually
  // ready. Later windows reuse it and closing a window stops nothing.
  // Production checks stay NOT_AUTHORIZED.
  if (registered && normalWindow && workspacesReady && alive() && typeof services.startWatchScheduler === "function"
    && guarded("watch schedule admission", () => services.isNormalWindow(window)) === true) {
    guarded("watch schedule", () => services.startWatchScheduler());
  }
  if (typeof services.getWatchDiagnostics === "function") runtime.watches = () => services.getWatchDiagnostics();
  // P6: this window's start-page gate for the ordinary new-tab command, only
  // after Zen's workspaces actually became ready. It reads the flag and every
  // window fact again on each command; disposing it at unload ends this
  // window's gate only.
  const startPage = aboutRegistered && normalWindow && workspacesReady && alive() && typeof servicesModule.createStartPageGate === "function"
    ? guarded("start page", () => servicesModule.createStartPageGate({ window, services, prefs: Services.prefs, aboutRegistered,
      authority: () => zen.isAuthoritative() === true,
      isPrivate: () => {
        if (window.PrivateBrowsingUtils?.permanentPrivateBrowsing !== false) return true;
        return zen.isPrivateWindow();
      },
      isAIWindow: aiWindowActive, defaultNewTab: defaultNewTabPage }))
    : null;
  if (startPage) disposers.push(() => startPage.dispose());
  return { disposers, services, zen, runtime, startPage };
}

// Loaded only by ZenPreloadedScripts in the trusted browser window.
// Zen owns the visible frontend. The only additions are a tab-menu engine
// switch and an address-bar badge on Chromium tabs; no shortcut is taken over.
async function initialize() {
  if (!Services.prefs.getBoolPref("axiosozo.foundation.enabled", true)) return;
  // This window's lifetime starts before the first await: a close during any
  // await below ends it, and nothing is installed or published afterwards.
  let disposed = false;
  window.addEventListener("unload", () => { disposed = true; }, { once: true });
  const aboutRegistered = registerOverview();
  await window.gZenStartup.promiseInitialized;
  if (disposed) return;
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
  let coordinator = null; let coordinatorStarting = null;
  const ensureCoordinator = () => {
    if (disposed) return Promise.reject(new Error("WINDOW_CLOSED"));
    if (coordinator) return Promise.resolve(coordinator);
    if (!coordinatorStarting) coordinatorStarting = attachCoordinator(window, adapter, {
      isTargetActive: target => engineProbe?.isGeckoTargetActive(target) ?? true,
    }).then(connection => { coordinator = connection; return connection; })
      .finally(() => { coordinatorStarting = null; });
    return coordinatorStarting;
  };
  let contexts = { disposers: [], services: null, zen: null, runtime: {}, startPage: null };
  // P6: browser-commands.js asks this for the ordinary new-tab command only. It
  // synchronously answers "about:axiosozo#home" or null; until this window's
  // gate is installed, after unload, and whenever window.AxioSozo is no longer
  // this very object (a newer owner), it is always null. It never removes or
  // replaces that newer owner.
  let startPage = null;
  let owner = null;
  const startPageForNewTab = () => {
    const gate = disposed || window.AxioSozo !== owner ? null : startPage;
    if (!gate) return null;
    try { return gate.check() === "about:axiosozo#home" ? "about:axiosozo#home" : null; } catch { return null; }
  };
  owner = Object.freeze({ version: 5, engine: adapter, engineProbe, ensureCoordinator, startPageForNewTab,
    get coordinator() { return coordinator; },
    // Diagnostics for GUI evidence (stored context types, container identities).
    get contexts() { return Object.freeze({ services: contexts.services, workspaces: contexts.zen,
      diagnostics: () => Object.fromEntries(Object.entries(contexts.runtime ?? {}).map(([name, read]) => {
        try { return [name, JSON.parse(JSON.stringify(read()))]; } catch { return [name, null]; }
      })) }); } });
  window.AxioSozo = owner;
  const disposeContexts = () => {
    for (const dispose of contexts.disposers.splice(0).reverse()) {
      try { dispose(); } catch (error) { console.error("AxioSozo: dispose failed", error); }
    }
  };
  window.addEventListener("unload", () => {
    disposed = true; probeSheet?.remove();
    startPage = null;
    disposeContexts();
    engineTabs?.dispose();
    spaceSwitcher?.dispose();
    engineProbe?.dispose().catch(() => {});
    adapter.dispose();
  }, { once: true });
  try {
    contexts = await installContexts({ engineProbe, aboutRegistered, alive: () => !disposed });
    // A late installation never publishes a gate after unload; its disposer ends it.
    if (disposed) disposeContexts();
    else startPage = contexts.startPage ?? null;
  } catch (error) { console.error("AxioSozo: contexts unavailable", error); }
}
window.addEventListener("MozBeforeInitialXULLayout", () => { initialize().catch(console.error); }, { once: true });
