/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Synthetic pieces for the agent presence experiments (agents-folder,
// agents-on-rows, proof-tab) under Node: a ctx.agents view whose sessions the
// test moves through their states, a Zen-like window on mini-dom (tabs with
// Zen's sublabel, lazy tabs, selection, closing, progress listeners, l10n),
// and a stand-in for Zen's live-folder manager that behaves like
// src/zen/live-folders/ZenLiveFoldersManager.sys.mjs for what the experiment
// uses (registry, items by id, dismissed items, folders per space). Test-only;
// not evidence of Gecko or Zen behaviour.
import { Document, Element, Node, makeEvent } from "./mini-dom.mjs";

// mini-dom lacks a few DOM methods the chrome code uses.
if (!Node.prototype.after) {
  Node.prototype.after = function after(...nodes) {
    const parent = this.parentNode;
    const siblings = parent.childNodes;
    let at = siblings.indexOf(this) + 1;
    for (const node of nodes) { node.remove(); siblings.splice(at++, 0, node); node.parentNode = parent; }
  };
  Node.prototype.before = function before(...nodes) {
    const parent = this.parentNode;
    const siblings = parent.childNodes;
    let at = siblings.indexOf(this);
    for (const node of nodes) { node.remove(); siblings.splice(at++, 0, node); node.parentNode = parent; }
  };
  Object.defineProperty(Node.prototype, "isConnected", { get() { let node = this; while (node.parentNode) node = node.parentNode; return node === this.ownerDocument; } });
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() { return this._rect ?? { x: 0, y: 0, left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }; };
}

export const SPACE_A = "{11111111-1111-4111-8111-111111111111}";
export const SPACE_B = "{22222222-2222-4222-8222-222222222222}";
export const HARBOR_ROOT = "/synthetic/harbor";

/** A project as AxioSozoServices lists it. */
export function project({ id = "p_harbor", name = "Harbor", root = HARBOR_ROOT, space = SPACE_A, local = "http://localhost:5173" } = {}) {
  return { version: 2, id, root, context_uuid: space, container: { user_context_id: null },
    manifest: { version: 3, name, services: [], environments: local ? [{ name: "production", base_url: "https://harbor.example" }, { name: "local", base_url: local }] : [] } };
}

let serial = 0;
/** A ctx.agents session snapshot. */
export function session(overrides = {}) {
  const now = overrides.updatedAt ?? Date.now();
  return Object.freeze({ id: `lab-${(++serial).toString(16).padStart(6, "0")}`, origin: "browser", source: "browser", client: "claude-code",
    clientLabel: "Claude Code", sessionId: "11111111-2222-4333-8444-555555555555", projectId: "p_harbor", projectRoot: HARBOR_ROOT,
    projectName: "Harbor", title: "fix the retry button", state: "working", step: "Editing index.html", summary: null, reason: null,
    stopping: false, mayEdit: true, startedAt: now - 1000, updatedAt: now, endedAt: null, costUsd: null, durationMs: null, rateLimit: null,
    files: null, canStop: true, canResume: true, ...overrides });
}

/** A finished run that changed index.html. */
export const doneSession = (overrides = {}) => session({ state: "done", step: null, summary: "Fixed the retry handler.", canStop: false,
  endedAt: Date.now(), costUsd: 0.001, durationMs: 3600,
  files: { changed: [{ path: "index.html", status: "M", byRun: true }], byRun: ["index.html"], already: 0, summary: "1 file changed, 1 insertion(+), 1 deletion(-)" },
  ...overrides });

/** ctx.agents for one experiment: list/get/subscribe/watchExternal and the hand-overs, recorded. */
export function fakeAgents(initial = []) {
  const sessions = new Map(initial.map(item => [item.id, item]));
  const listeners = new Set();
  const calls = { watch: 0, released: 0, dismiss: [], stop: [], continue: [], openIn: [], start: [], targets: [] };
  let startResult = null;
  const agents = {
    calls, sessions,
    list: () => [...sessions.values()],
    get: id => sessions.get(id) ?? null,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    watchExternal() { calls.watch++; let done = false; return () => { if (!done) { done = true; calls.released++; } }; },
    dismiss(id) { calls.dismiss.push(id); return true; },
    async stop(id) { calls.stop.push(id); return sessions.get(id) ?? null; },
    async continueInTerminal(id, { trigger } = {}) {
      calls.continue.push({ id, trusted: trigger?.isTrusted === true });
      if (agents.failContinue) throw Object.assign(new Error("NOT_RESUMABLE"), { code: "NOT_RESUMABLE", reason: agents.failContinue });
      return { ok: true, target: "terminal" };
    },
    async openIn(target, options = {}) { calls.openIn.push({ target, ...options, trusted: options.trigger?.isTrusted === true }); return { ok: true, target }; },
    async handoverTargets(options) { calls.targets.push(options); return [{ target: "terminal", label: "Terminal", available: true }, { target: "claude-resume", label: "Claude", available: agents.claudeApp === true }]; },
    async startTask(request) {
      calls.start.push({ ...request, trusted: request.trigger?.isTrusted === true });
      if (agents.failStart) throw Object.assign(new Error("BUSY"), { code: "BUSY", reason: agents.failStart });
      const started = startResult ?? session({ state: "starting", step: null, projectId: "p_harbor" });
      sessions.set(started.id, started);
      return started;
    },
    /** The next startTask returns this snapshot. */
    willStart(snapshot) { startResult = snapshot; },
    /** A session changed (or appeared): every subscriber hears it, as the service tells them. */
    emit(snapshot) { sessions.set(snapshot.id, snapshot); for (const listener of [...listeners]) listener({ type: "changed", session: snapshot }); return snapshot; },
    remove(id) { sessions.delete(id); for (const listener of [...listeners]) listener({ type: "removed", id }); },
    listenerCount: () => listeners.size,
    failContinue: null, failStart: null, claudeApp: false,
  };
  return agents;
}

/** AxioSozoServices as the presence experiments use it: listProjects, on("projects"), projectHome. */
export function fakeServices(projects = [project()], { consoleErrors = null } = {}) {
  const listeners = new Map();
  const services = {
    projects, consoleErrors, homes: [],
    async listProjects() { return services.projects; },
    on(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); return () => listeners.get(name).delete(callback); },
    emit(name) { for (const callback of [...(listeners.get(name) ?? [])]) callback({ name }); },
    async projectHome({ id }) { services.homes.push(id); return { version: 1, project: services.projects.find(item => item.id === id), console_errors: services.consoleErrors }; },
    listenerCount: () => [...listeners.values()].reduce((sum, set) => sum + set.size, 0),
  };
  return services;
}

/** ZenWorkspaceAdapter as the experiments use it. */
export function fakeAdapter({ active = SPACE_A, spaces = [SPACE_A, SPACE_B] } = {}) {
  const updates = new Set();
  const adapter = {
    active,
    isPrivateWindow: () => false,
    activeWorkspaceUuid: () => adapter.active,
    listWorkspaces: () => spaces.map(uuid => ({ uuid, name: uuid === SPACE_A ? "Work" : "Home", containerTabId: uuid === SPACE_A ? 0 : 3 })),
    workspaceForTab: tab => tab?.getAttribute?.("zen-workspace-id") ?? null,
    containerForWorkspace: uuid => (uuid === SPACE_B ? 3 : 0),
    onUpdate(callback) { updates.add(callback); return () => updates.delete(callback); },
    switchTo(uuid) { adapter.active = uuid; for (const callback of [...updates]) callback(); },
    updateCount: () => updates.size,
  };
  return adapter;
}

/** Listener sets that honour { signal }, like the DOM. */
function listenerMap() {
  const map = new Map();
  return {
    map,
    add(type, fn, options) {
      const signal = options && typeof options === "object" ? options.signal ?? null : null;
      if (signal?.aborted) return;
      if (!map.has(type)) map.set(type, new Set());
      map.get(type).add(fn);
      signal?.addEventListener("abort", () => map.get(type)?.delete(fn), { once: true });
    },
    remove(type, fn) { map.get(type)?.delete(fn); },
    fire(type, event) { for (const fn of [...(map.get(type) ?? [])]) fn(event); },
    count: () => [...map.values()].reduce((sum, set) => sum + set.size, 0),
  };
}

/**
 * A Zen-like browser window on mini-dom: gBrowser with tabs (Zen's
 * .zen-tab-sublabel inside each), lazy tabs (no linkedPanel until selected),
 * selection, closing, progress listeners, setIcon, reloadTab and addTab;
 * document.l10n.setArgs; Services.prefs; the sidebar's navigator-toolbox.
 */
export function presenceWindow({ prefs = {}, hasFocus = true } = {}) {
  const document = new Document();
  const root = document.documentElement;
  const toolbox = new Element(document, "vbox");
  toolbox.id = "navigator-toolbox";
  toolbox._rect = { x: 0, y: 0, left: 0, top: 0, width: 240, height: 800, right: 240, bottom: 800 };
  root.append(toolbox);
  const panels = new Element(document, "tabpanels");
  root.append(panels);
  const windowListeners = listenerMap();
  const tabListeners = listenerMap();
  const progress = new Set();
  const l10n = [];
  const reloads = [];
  const icons = [];
  const added = [];
  let focused = hasFocus;
  document.l10n = { setArgs(element, args) { l10n.push([element, args]); element.l10nArgs = args; } };
  document.hasFocus = () => focused;
  let nextPanel = 1;

  function makeTab({ url = "about:blank", label = "Tab", workspace = SPACE_A, lazy = false, userContextId = 0 } = {}) {
    const stack = new Element(document, "stack");
    stack.className = "browserStack";
    stack._rect = { x: 0, y: 0, left: 0, top: 0, width: 1000, height: 700, right: 1000, bottom: 700 };
    const browser = new Element(document, "browser");
    browser.currentURI = { spec: lazy ? "about:blank" : url };
    browser._rect = stack._rect;
    browser.fullZoom = 1;
    browser.reload = () => reloads.push(tab);
    stack.append(browser);
    panels.append(stack);
    const tab = new Element(document, "tab");
    tab.className = "tabbrowser-tab";
    const labelBox = new Element(document, "vbox");
    labelBox.className = "tab-label-container";
    const sublabel = new Element(document, "label");
    sublabel.className = "zen-tab-sublabel";
    labelBox.append(sublabel);
    tab.append(labelBox);
    Object.assign(tab, { linkedBrowser: browser, label, userContextId, closing: false, lastAccessed: 0, linkedPanel: lazy ? "" : `panel-${nextPanel++}`,
      pendingUrl: lazy ? url : null });
    if (workspace) tab.setAttribute("zen-workspace-id", workspace);
    return tab;
  }

  const gBrowser = {
    tabs: [], selectedTab: null,
    get selectedBrowser() { return gBrowser.selectedTab?.linkedBrowser ?? null; },
    tabContainer: {
      addEventListener: (type, fn, options) => tabListeners.add(type, fn, options),
      removeEventListener: (type, fn) => tabListeners.remove(type, fn),
    },
    addTabsProgressListener: listener => progress.add(listener),
    removeTabsProgressListener: listener => progress.delete(listener),
    getTabForBrowser: browser => gBrowser.tabs.find(tab => tab.linkedBrowser === browser) ?? null,
    setIcon(tab, icon) { icons.push([tab, icon]); tab.setAttribute("image", icon); },
    reloadTab(tab) { reloads.push(tab); },
    addTab(url, options = {}) {
      const tab = makeTab({ url, workspace: options.zenWorkspaceId ?? SPACE_A, userContextId: options.userContextId ?? 0 });
      added.push({ url, options, tab });
      gBrowser.tabs.push(tab);
      if (!options.inBackground) harness.select(tab);
      return tab;
    },
    removeTab(tab) { harness.close(tab); },
  };

  const window = {
    document, gBrowser, innerWidth: 1200, innerHeight: 800, devicePixelRatio: 2,
    AbortController: globalThis.AbortController,
    DOMRect: class { constructor(x, y, width, height) { Object.assign(this, { x, y, width, height }); } },
    // Unref'd, so a test that failed before turning its experiment off does not keep Node waiting.
    setTimeout: (fn, ms) => { const timer = globalThis.setTimeout(fn, ms); timer.unref?.(); return timer; },
    clearTimeout: id => globalThis.clearTimeout(id),
    addEventListener: (type, fn, options) => windowListeners.add(type, fn, options),
    removeEventListener: (type, fn) => windowListeners.remove(type, fn),
    Services: {
      prefs: { getBoolPref: (name, fallback) => (name in prefs ? prefs[name] : fallback) },
      scriptSecurityManager: { createNullPrincipal: attrs => ({ isSystemPrincipal: false, isNullPrincipal: true, originAttributes: { ...attrs } }) },
      startup: { shuttingDown: false },
    },
  };

  const harness = {
    window, document, gBrowser, prefs, l10n, reloads, icons, added, progress, toolbox,
    tabListenerCount: () => tabListeners.count(), windowListenerCount: () => windowListeners.count(),
    setFocus(value) { focused = value; },
    /** A tab already open (loaded unless lazy), selected unless select is false. */
    addTab(options = {}) {
      const tab = makeTab(options);
      gBrowser.tabs.push(tab);
      tabListeners.fire("TabOpen", { type: "TabOpen", target: tab });
      if (options.select !== false || !gBrowser.selectedTab) harness.select(tab);
      return tab;
    },
    /** Selecting a lazy tab inserts its browser and starts its load, as Firefox does; the load commits with commit(). */
    select(tab) {
      gBrowser.selectedTab = tab;
      tab.lastAccessed = Date.now();
      if (!tab.linkedPanel) tab.linkedPanel = `panel-${nextPanel++}`;
      tabListeners.fire("TabSelect", makeEvent("TabSelect", { target: tab }));
    },
    /** The tab's top-level page changed (a load, a reload, a navigation). */
    commit(tab, url = tab.pendingUrl ?? tab.linkedBrowser.currentURI.spec, flags = 0) {
      tab.pendingUrl = null;
      tab.linkedBrowser.currentURI = { spec: url };
      for (const listener of [...progress]) listener.onLocationChange?.(tab.linkedBrowser, { isTopLevel: true }, null, { spec: url }, flags);
    },
    close(tab) {
      if (!gBrowser.tabs.includes(tab)) return;
      tab.closing = true;
      tabListeners.fire("TabClose", makeEvent("TabClose", { target: tab }));
      gBrowser.tabs.splice(gBrowser.tabs.indexOf(tab), 1);
      tab.linkedBrowser.parentNode?.remove();
      tab.remove();
      if (gBrowser.selectedTab === tab) gBrowser.selectedTab = gBrowser.tabs[0] ?? null;
    },
    fireWindow(type) { windowListeners.fire(type, { type }); },
    makeTab,
  };
  return harness;
}

/**
 * Zen's live folders, for what the Agents folder uses: a manager with a
 * public registry, liveFolders and dismissedItems; a provider base with
 * start/stop/refresh; gZenFolders.createFolder/setFolderUserIcon and
 * gZenWorkspaces.allTabGroups on `h.window`. Fetch results become lazy
 * pinned tabs in their folder one tick later, as Zen adds them.
 */
export function fakeZenLiveFolders(h) {
  const folders = new Map(); // id → folder
  let nextFolder = 1;
  class Base {
    constructor({ id, manager, state }) { this.id = id; this.manager = manager; this.state = { ...state }; this.started = false; }
    start() { this.started = true; }
    stop() { this.started = false; }
    async refresh() {
      let items = null;
      try { items = await this.fetchItems(); } catch { items = null; }
      if (items) this.manager.onLiveFolderFetch(this, items);
      return items;
    }
  }
  const restored = Promise.withResolvers();
  const manager = {
    registry: new Map(), liveFolders: new Map(), dismissedItems: new Set(), stateRestored: restored, saves: 0, deleted: [],
    get window() { return h.window; },
    saveState() { manager.saves++; },
    async adoptSyncedFolder(id, { type, state } = {}) {
      await restored.promise;
      if (manager.liveFolders.has(id)) return;
      const Provider = manager.registry.get(type);
      if (!Provider || !state) return;
      const provider = new Provider({ id, manager, state: { interval: 1800000, lastFetched: 0, options: {}, ...state } });
      manager.liveFolders.set(id, provider);
      provider.start();
      manager.saveState();
    },
    deleteFolder(id, remove = true) {
      const provider = manager.liveFolders.get(id);
      if (!provider) return false;
      provider.stop();
      manager.liveFolders.delete(id);
      manager.deleted.push(id);
      if (remove) folders.get(id)?.delete();
      manager.saveState();
      return true;
    },
    onLiveFolderFetch(provider, items) {
      const folder = folders.get(provider.id);
      if (!folder) return;
      const ids = new Set(items.map(item => `${provider.id}:${item.id}`));
      for (const tab of [...folder.tabs]) if (!ids.has(tab.getAttribute("zen-live-folder-item-id"))) { folder.tabs.splice(folder.tabs.indexOf(tab), 1); h.close(tab); }
      const present = new Set(folder.tabs.map(tab => tab.getAttribute("zen-live-folder-item-id")));
      const fresh = [];
      for (const item of items) {
        const id = `${provider.id}:${item.id}`;
        if (present.has(id) || manager.dismissedItems.has(id)) continue;
        const tab = h.makeTab({ url: item.url, label: item.title, workspace: folder.getAttribute("zen-workspace-id"), lazy: true });
        tab.pinned = true;
        h.gBrowser.setIcon(tab, item.icon);
        tab.setAttribute("zen-live-folder-item-id", id);
        if (item.subtitle) {
          tab.setAttribute("zen-show-sublabel", item.subtitle);
          h.document.l10n.setArgs(tab.querySelector(".zen-tab-sublabel"), { tabSubtitle: item.subtitle });
        }
        h.gBrowser.tabs.push(tab);
        fresh.push(tab);
      }
      setTimeout(() => { folder.tabs.push(...fresh); }, 0);
    },
  };
  // Zen's own TabClose handling: a closed item is dismissed for good.
  h.gBrowser.tabContainer.addEventListener("TabClose", event => {
    const id = event.target.getAttribute("zen-live-folder-item-id");
    if (!id) return;
    for (const folder of folders.values()) { const at = folder.tabs.indexOf(event.target); if (at >= 0) folder.tabs.splice(at, 1); }
    manager.dismissedItems.add(id);
  });
  function makeFolder({ id = `${Date.now()}-${nextFolder++}`, label, isLiveFolder, workspaceId }) {
    const folder = new Element(h.document, "zen-folder");
    Object.assign(folder, { id, label, isLiveFolder: !!isLiveFolder, tabs: [], icon: null, collapsed: false,
      async delete() { folders.delete(id); for (const tab of [...folder.tabs]) h.close(tab); folder.tabs.length = 0; } });
    folder.setAttribute("zen-workspace-id", workspaceId);
    folders.set(id, folder);
    return folder;
  }
  h.window.gZenFolders = {
    created: [],
    createFolder(tabs = [], options = {}) { const folder = makeFolder(options); h.window.gZenFolders.created.push({ options, folder }); return folder; },
    setFolderUserIcon(folder, icon) { folder.icon = icon; },
  };
  h.window.gZenWorkspaces = { get allTabGroups() { return [...folders.values()]; } };
  return { manager, Base, folders, restored, makeFolder,
    /** Zen restored a folder of ours from the last session before our type existed (plain folder, its tabs). */
    restoreOrphan({ space, itemIds = [] } = {}) {
      const folder = makeFolder({ label: "Agents", isLiveFolder: true, workspaceId: space });
      for (const itemId of itemIds) {
        const tab = h.makeTab({ url: "http://localhost:5173/", label: "old", workspace: space, lazy: true });
        tab.setAttribute("zen-live-folder-item-id", `${folder.id}:${itemId}`);
        h.gBrowser.tabs.push(tab);
        folder.tabs.push(tab);
      }
      return folder;
    },
  };
}

/** Waits for promise jobs and Node's timers of 0 ms to settle. */
export async function settle(rounds = 4) {
  for (let i = 0; i < rounds; i++) {
    for (let j = 0; j < 20; j++) await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
