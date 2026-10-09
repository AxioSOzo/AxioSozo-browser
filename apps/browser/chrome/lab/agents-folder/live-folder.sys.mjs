/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The Agents folders as real Zen live folders (one per space that has agent
// sessions), process-wide. Every Zen touchpoint of the experiment is here and
// in ZEN_TOUCHPOINTS, which a test checks against the pinned Zen source
// (upstream/zen), so a Zen update that renames one fails a test instead of
// failing quietly in the browser.
//
// How it uses Zen's machinery (src/zen/live-folders, notes/lab/zen-live-folders.md):
//  - registers its own provider type ("axiosozo-agents") in the manager's
//    public registry, a subclass of Zen's nsZenLiveFolderProvider whose
//    fetchItems() returns the agent sessions of its space;
//  - creates a folder the way the manager does for its own types
//    (gZenFolders.createFolder with isLiveFolder, Zen's own "terminal" icon),
//    and pushes: every change calls the provider's refresh() rather than
//    waiting for Zen's interval (set to a day, as a fallback only);
//  - Zen then does the rest natively: lazy pinned tabs with title, sublabel
//    and icon, closing a tab dismisses its item, sync to other windows and
//    persistence. A folder Zen restored before our type was registered (the
//    next start) is adopted again (adoptSyncedFolder); an empty folder is
//    deleted; a folder the user deleted is not recreated in that space until
//    the experiment is turned on again;
//  - turned off: every Agents folder is deleted and the type unregistered.
// Zen only adds and removes items by id; changes of a shown item (its state)
// are written onto its tabs by each window (agents-folder.sys.mjs).

export const AGENTS_FOLDER_TYPE = "axiosozo-agents";
export const AGENTS_FOLDER_LABEL = "Agents";
// One of Zen's own folder icons (its selectable set), as Zen's GitHub folders use logo-github.svg.
export const AGENTS_FOLDER_ICON = "chrome://browser/skin/zen-icons/selectable/terminal.svg";
// Updates are pushed; Zen's own timer only runs as a fallback, once a day.
export const PUSH_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const RESTORE_WAIT_MS = 10000;
export const ZEN_MODULES = Object.freeze({
  manager: "resource:///modules/zen/ZenLiveFoldersManager.sys.mjs",
  provider: "resource:///modules/zen/ZenLiveFolder.sys.mjs",
});
const ITEM_ID = /^(?:lab|ext)-[A-Za-z0-9-]{1,120}$/u;

/** Every Zen name this experiment relies on, with the file of upstream/zen that must contain it. */
export const ZEN_TOUCHPOINTS = Object.freeze([
  { name: "manager module", source: "src/zen/live-folders/moz.build", needle: "\"ZenLiveFoldersManager.sys.mjs\"" },
  { name: "provider module", source: "src/zen/live-folders/moz.build", needle: "\"ZenLiveFolder.sys.mjs\"" },
  { name: "manager singleton", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "export const ZenLiveFoldersManager = new nsZenLiveFoldersManager();" },
  { name: "provider base", source: "src/zen/live-folders/ZenLiveFolder.sys.mjs", needle: "export class nsZenLiveFolderProvider {" },
  { name: "provider constructor", source: "src/zen/live-folders/ZenLiveFolder.sys.mjs", needle: "constructor({ id, manager, state }) {" },
  { name: "provider refresh", source: "src/zen/live-folders/ZenLiveFolder.sys.mjs", needle: "async refresh() {" },
  { name: "provider start", source: "src/zen/live-folders/ZenLiveFolder.sys.mjs", needle: "start(checkDelay = true) {" },
  { name: "registry", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "this.registry = new Map();" },
  { name: "live folders", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "this.liveFolders = new Map();" },
  { name: "dismissed items", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "this.dismissedItems = new Set();" },
  { name: "restored", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "stateRestored = Promise.withResolvers();" },
  { name: "manager window", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "return lazy.ZenWindowSync.firstSyncedWindow;" },
  { name: "adopt", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "async adoptSyncedFolder(id, { type, state } = {}) {" },
  { name: "delete", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "deleteFolder(id, deleteFolder = true) {" },
  { name: "save", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "saveState(soon = true) {" },
  { name: "serialize", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "data: liveFolder.serialize()," },
  { name: "item shape", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "lazyTabTitle: item.title," },
  { name: "item subtitle", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "tab.setAttribute(\"zen-show-sublabel\", item.subtitle);" },
  { name: "item id attribute", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "\"zen-live-folder-item-id\"," },
  { name: "item composite id", source: "src/zen/live-folders/ZenLiveFoldersManager.sys.mjs", needle: "return `${folderId}:${itemId}`;" },
  { name: "create folder", source: "src/zen/folders/ZenFolders.mjs", needle: "createFolder(tabs = [], options = {}) {" },
  { name: "folder space option", source: "src/zen/folders/ZenFolders.mjs", needle: "options.workspaceId" },
  { name: "live folder option", source: "src/zen/folders/ZenFolders.mjs", needle: "folder.isLiveFolder = options.isLiveFolder;" },
  { name: "folder icon", source: "src/zen/folders/ZenFolders.mjs", needle: "setFolderUserIcon(group, icon) {" },
  { name: "folders of all spaces", source: "src/zen/spaces/ZenSpaceManager.mjs", needle: "get allTabGroups() {" },
  { name: "sublabel label", source: "src/browser/components/tabbrowser/content/tab-js.patch", needle: "class=\"zen-tab-sublabel\"" },
  { name: "sublabel text", source: "locales/en-US/browser/browser/zen-vertical-tabs.ftl", needle: "*[other] { $tabSubtitle }" },
  { name: "terminal icon", source: "src/browser/themes/shared/zen-icons/jar.inc.mn", needle: "skin/classic/browser/zen-icons/selectable/terminal.svg" },
]);

/** Zen's live-folder manager and provider base, from the running browser. */
export function loadZenLiveFolders() {
  const { ZenLiveFoldersManager } = ChromeUtils.importESModule(ZEN_MODULES.manager);
  const { nsZenLiveFolderProvider } = ChromeUtils.importESModule(ZEN_MODULES.provider);
  return { manager: ZenLiveFoldersManager, Base: nsZenLiveFolderProvider };
}

/** Our provider type on Zen's base: its items are whatever was last published for its space. */
export function agentsProviderClass(Base, itemsFor) {
  return class AxioSozoAgentsLiveFolder extends Base {
    static type = AGENTS_FOLDER_TYPE;
    async fetchItems() { return itemsFor(this.state?.space ?? null); }
    // Zen's folder menu keeps its own refresh; no options of ours.
    get options() { return []; }
    serialize() { return { state: this.state }; }
  };
}

/** Splits Zen's "<folder id>:<item id>"; null when it is no item id of ours. */
export function splitItemId(composite) {
  if (typeof composite !== "string") return null;
  const at = composite.indexOf(":");
  if (at < 1) return null;
  const folderId = composite.slice(0, at), itemId = composite.slice(at + 1);
  return ITEM_ID.test(itemId) ? { folderId, itemId } : null;
}

/**
 * The process-wide controller. `zen`: { manager, Base }. Windows attach()
 * while the experiment runs in them and publish() what to show per space
 * ({ space → [{ id, title, subtitle, icon, url }] }) with the spaces that
 * exist; the controller makes Zen's folders match, one sync at a time.
 */
export function createFolderController({ manager, Base }, { clock = () => Date.now(), timers = globalThis, restoreWaitMs = RESTORE_WAIT_MS } = {}) {
  const ProviderClass = agentsProviderClass(Base, space => [...(published.get(space) ?? [])]);
  let published = new Map(); // space → items
  let spaces = new Set();
  const folders = new Map(); // space → folder id
  const deleting = new Set(); // folder ids we delete (not the user)
  const userRemoved = new Set(); // spaces whose folder the user deleted
  const syncedListeners = new Set();
  let refs = 0;
  let ready = null;
  let chain = Promise.resolve();
  let queued = false;
  let generation = 0;

  const ours = provider => provider?.constructor?.type === AGENTS_FOLDER_TYPE;
  const zenWindow = () => { try { return manager.window ?? null; } catch { return null; } };

  function waitForRestore() {
    let timer = null;
    const timeout = new Promise(resolve => { timer = timers.setTimeout(resolve, restoreWaitMs); });
    return Promise.race([Promise.resolve(manager.stateRestored?.promise), timeout]).finally(() => { try { timers.clearTimeout(timer); } catch {} });
  }

  /** Folders already there: ours that Zen restored itself, and ones it restored as plain folders before our type existed. */
  async function adopt() {
    for (const [id, provider] of manager.liveFolders ?? []) {
      if (!ours(provider)) continue;
      const space = provider.state?.space ?? null;
      if (space && (!folders.has(space) || folders.get(space) === id)) folders.set(space, id);
      else { deleting.add(id); try { manager.deleteFolder(id); } catch {} } // a second folder for one space
    }
    let groups = [];
    try { groups = [...(zenWindow()?.gZenWorkspaces?.allTabGroups ?? [])]; } catch { groups = []; }
    for (const folder of groups) {
      if (!folder?.isLiveFolder || manager.liveFolders?.has(folder.id)) continue;
      const tabs = [...(folder.tabs ?? [])];
      const mine = tabs.some(tab => splitItemId(tab?.getAttribute?.("zen-live-folder-item-id"))?.folderId === folder.id);
      if (!mine) continue;
      const space = folder.getAttribute?.("zen-workspace-id") ?? null;
      if (!space || folders.has(space)) { deleting.add(folder.id); try { await folder.delete?.(); } catch {} continue; }
      try {
        await manager.adoptSyncedFolder(folder.id, { type: AGENTS_FOLDER_TYPE, state: { space, interval: PUSH_INTERVAL_MS, lastFetched: clock(), options: {} } });
        if (manager.liveFolders?.has(folder.id)) folders.set(space, folder.id);
      } catch (error) { console.error("AxioSozo Lab: an Agents folder could not be adopted", error); }
    }
  }

  function createFolder(window, space) {
    const folder = window.gZenFolders.createFolder([], { label: AGENTS_FOLDER_LABEL, isLiveFolder: true, collapsed: false, workspaceId: space });
    try { window.gZenFolders.setFolderUserIcon(folder, AGENTS_FOLDER_ICON); } catch {}
    const provider = new ProviderClass({ id: folder.id, manager, state: { space, interval: PUSH_INTERVAL_MS, lastFetched: clock(), options: {} } });
    manager.liveFolders.set(folder.id, provider);
    provider.start();
    try { manager.saveState(); } catch {}
    folders.set(space, folder.id);
    return folder.id;
  }

  function deleteFolder(space) {
    const id = folders.get(space);
    folders.delete(space);
    if (!id) return;
    deleting.add(id);
    try { manager.deleteFolder(id); } catch (error) { console.error("AxioSozo Lab: an Agents folder was not deleted", error); }
  }

  async function syncOnce(run) {
    await ready;
    if (run !== generation || !refs) return;
    const window = zenWindow();
    if (!window?.gZenFolders) return;
    // A folder that is gone and that we did not delete: the user deleted it.
    for (const [space, id] of [...folders]) {
      if (manager.liveFolders?.has(id)) continue;
      folders.delete(space);
      if (!deleting.has(id)) userRemoved.add(space);
    }
    for (const space of [...folders.keys()]) if (!(published.get(space)?.length) || !spaces.has(space)) deleteFolder(space);
    for (const [space, items] of published) {
      if (!items.length || userRemoved.has(space) || !spaces.has(space)) continue;
      let id = folders.get(space);
      try { id ??= createFolder(window, space); } catch (error) { console.error("AxioSozo Lab: an Agents folder could not be created", error); continue; }
      const provider = manager.liveFolders.get(id);
      if (!provider) continue;
      // The hub decides what is dismissed; Zen's own record of a closed item must not keep it away.
      for (const item of items) manager.dismissedItems?.delete?.(`${id}:${item.id}`);
      try { await provider.refresh(); } catch (error) { console.error("AxioSozo Lab: an Agents folder did not update", error); }
      if (run !== generation) return;
    }
    // Zen adds new tabs to a folder on the next tick; tell the windows after that.
    await new Promise(resolve => timers.setTimeout(resolve, 0));
    for (const listener of [...syncedListeners]) { try { listener(); } catch (error) { console.error("AxioSozo Lab: Agents folder listener failed", error); } }
  }

  function schedule() {
    if (queued || !refs) return;
    queued = true;
    const run = generation;
    chain = chain.then(() => { queued = false; return syncOnce(run); }).catch(error => console.error("AxioSozo Lab: Agents folders not synced", error));
  }

  function teardown() {
    generation++;
    for (const space of [...folders.keys()]) deleteFolder(space);
    for (const [id, provider] of [...(manager.liveFolders ?? [])]) if (ours(provider)) { deleting.add(id); try { manager.deleteFolder(id); } catch {} }
    try { if (manager.registry?.get(AGENTS_FOLDER_TYPE) === ProviderClass) manager.registry.delete(AGENTS_FOLDER_TYPE); } catch {}
    published = new Map();
    spaces = new Set();
    userRemoved.clear();
    deleting.clear();
    ready = null;
  }

  return Object.freeze({
    /** A window runs the experiment. The first one registers the type and adopts what Zen restored. */
    attach() {
      refs++;
      if (refs === 1) {
        generation++;
        manager.registry.set(AGENTS_FOLDER_TYPE, ProviderClass);
        ready = waitForRestore().then(adopt).catch(error => console.error("AxioSozo Lab: Agents folders not adopted", error));
      }
    },
    /** A window stops. The last one deletes every folder when `teardown` (turned off, not quitting). */
    detach({ teardown: remove = false } = {}) {
      if (!refs) return;
      refs--;
      if (refs) return;
      if (remove) teardown();
      else {
        // A window closed or the browser quits: Zen keeps the folders; the next window adopts them again.
        generation++;
        ready = null;
        folders.clear();
        deleting.clear();
      }
    },
    publish(bySpace, { spaces: known = [] } = {}) {
      published = new Map([...(bySpace ?? new Map())].map(([space, items]) => [space, [...items]]));
      spaces = new Set(known);
      schedule();
    },
    onSynced(listener) { syncedListeners.add(listener); return () => syncedListeners.delete(listener); },
    /** Whether a folder id is one of ours. */
    isOurs: folderId => [...folders.values()].includes(folderId) || ours(manager.liveFolders?.get(folderId)),
    /** Whether an item is in what was last published (a tab of it closing is then the user's dismissal). */
    isPublished(itemId) { for (const items of published.values()) if (items.some(item => item.id === itemId)) return true; return false; },
    folderFor: space => folders.get(space) ?? null,
    whenSynced: () => chain,
    diagnostics: () => ({ refs, folders: folders.size, userRemoved: userRemoved.size, registered: manager.registry?.get(AGENTS_FOLDER_TYPE) === ProviderClass }),
  });
}

let shared = null;
/** The process's controller over the real Zen modules (created on first use). */
export function sharedFolderController() {
  shared ??= createFolderController(loadZenLiveFolders(), {
    timers: ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs"),
  });
  return shared;
}
