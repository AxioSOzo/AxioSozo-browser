/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The single module that touches Zen APIs (contexts-api-v1 §3.1, handoff §2.6).
// Every Zen global, method, event, attribute and element id relied upon is
// listed in ZEN_ADAPTER_CONTRACT; `zen-workspace-adapter.test.mjs` checks each
// entry against the pinned Zen source so an upstream rename fails in one place.
// The adapter never writes Zen's workspace store.

const SPACES = "src/zen/spaces/ZenSpaceManager.mjs";
const POPUPS = "src/browser/base/content/zen-panels/popups.inc";

export const ZEN_ADAPTER_CONTRACT = Object.freeze([
  { name: "window.gZenWorkspaces", source: SPACES, needle: "window.gZenWorkspaces = new nsZenWorkspaces()" },
  { name: "gZenWorkspaces.promiseInitialized", source: SPACES, needle: "promiseInitialized = new Promise(" },
  { name: "gZenWorkspaces.getWorkspaces", source: SPACES, needle: "getWorkspaces(lieToMe = false) {" },
  { name: "gZenWorkspaces.getWorkspaceFromId", source: SPACES, needle: "getWorkspaceFromId(id) {" },
  { name: "gZenWorkspaces.activeWorkspace", source: SPACES, needle: "get activeWorkspace() {" },
  { name: "gZenWorkspaces.privateWindowOrDisabled", source: SPACES, needle: "get privateWindowOrDisabled() {" },
  { name: "gZenWorkspaces.workspaceEnabled", source: SPACES, needle: "get workspaceEnabled() {" },
  { name: "gZenWorkspaces.workspaceElement", source: SPACES, needle: "workspaceElement(workspaceId) {" },
  { name: "workspace section <zen-workspace>", source: "src/zen/spaces/ZenSpace.mjs", needle: "customElements.define(\"zen-workspace\"" },
  { name: "gZenWorkspaces.changeWorkspaceWithID", source: SPACES, needle: "async changeWorkspaceWithID(workspaceID, ...args) {" },
  { name: "gZenWorkspaces.addChangeListeners", source: SPACES, needle: "addChangeListeners(" },
  { name: "gZenWorkspaces.removeChangeListeners", source: SPACES, needle: "removeChangeListeners(func) {" },
  { name: "change listener payload { workspace }", source: SPACES, needle: "await func({ workspace, onInit });" },
  { name: "workspace.uuid/name/icon/containerTabId", source: SPACES, needle: "containerTabId,\n    };" },
  { name: "event ZenWorkspaceDataChanged", source: SPACES, needle: "new CustomEvent(\"ZenWorkspaceDataChanged\")" },
  { name: "event ZenWorkspacesUIUpdate", source: SPACES, needle: "new CustomEvent(\"ZenWorkspacesUIUpdate\"" },
  { name: "tab attribute zen-workspace-id", source: SPACES, needle: "tab.getAttribute(\"zen-workspace-id\")" },
  { name: "tab attribute zen-essential", source: SPACES, needle: "tab.getAttribute(\"zen-essential\") === \"true\"" },
  { name: "menu target toolbarbutton[zen-workspace-id]", source: SPACES, needle: "event.explicitOriginalTarget?.closest(\"toolbarbutton\")" },
  { name: "popup #zenWorkspaceMoreActions", source: POPUPS, needle: "<menupopup id=\"zenWorkspaceMoreActions\">" },
  { name: "menu #context_zenWorkspacesOpenInContainerTab", source: POPUPS, needle: "<menu id=\"context_zenWorkspacesOpenInContainerTab\"" },
  { name: "window.gZenStartup", source: "src/zen/common/modules/ZenStartup.mjs", needle: "window.gZenStartup = new ZenStartup();" },
  { name: "gZenStartup.promiseInitialized", source: "src/zen/common/modules/ZenStartup.mjs", needle: "promiseInitialized = new Promise(" },
]);

const UUID = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/u;

function snapshotOf(workspace) {
  return {
    uuid: workspace.uuid,
    name: typeof workspace.name === "string" ? workspace.name : "",
    icon: typeof workspace.icon === "string" ? workspace.icon : "",
    containerTabId: Number.isSafeInteger(workspace.containerTabId) && workspace.containerTabId > 0
      ? workspace.containerTabId : 0,
  };
}

export class ZenWorkspaceAdapter {
  #window; #listeners = new Set(); #known = null; #disposed = false; #changeListener = null;
  #onData = () => this.#diff();

  constructor(window) {
    this.#window = window;
    window.addEventListener("ZenWorkspaceDataChanged", this.#onData);
    window.addEventListener("ZenWorkspacesUIUpdate", this.#onData);
    // Zen awaits each change listener; ours only records the switch.
    this.#changeListener = ({ workspace } = {}) => {
      this.#diff();
      if (workspace?.uuid) this.#emit({ kind: "switched", uuid: workspace.uuid });
    };
    this.#zen()?.addChangeListeners?.(this.#changeListener);
    this.#known = this.#snapshotMap();
  }

  #zen() {
    return this.#disposed ? null : this.#window.gZenWorkspaces ?? null;
  }

  /** True when this window carries the shared, synced workspace list. Private,
   * unsynced and popup windows have local stand-in spaces that are not contexts. */
  isAuthoritative() {
    const zen = this.#zen();
    if (!zen || this.isPrivateWindow()) return false;
    try { return zen.privateWindowOrDisabled === false; } catch { return false; }
  }

  /** Resolves once Zen has restored this window's workspaces. */
  whenReady() {
    return Promise.resolve(this.#zen()?.promiseInitialized).then(() => { this.#diff(); });
  }

  listWorkspaces() {
    const zen = this.#zen();
    if (!zen || this.isPrivateWindow()) return [];
    let spaces;
    try { spaces = zen.getWorkspaces(); } catch { return []; }
    if (!Array.isArray(spaces)) return [];
    return spaces.filter(space => space && typeof space.uuid === "string" && UUID.test(space.uuid))
      .map(snapshotOf);
  }

  activeWorkspaceUuid() {
    const zen = this.#zen();
    if (!zen || this.isPrivateWindow()) return null;
    const uuid = zen.activeWorkspace;
    return typeof uuid === "string" && UUID.test(uuid) ? uuid : null;
  }

  workspaceForTab(tab) {
    if (!tab?.getAttribute || this.isPrivateWindow()) return null;
    const uuid = tab.getAttribute("zen-workspace-id");
    if (uuid && UUID.test(uuid)) return uuid;
    // Essentials are shown in every space; attribute them to the active one.
    if (tab.getAttribute("zen-essential") === "true") return this.activeWorkspaceUuid();
    return null;
  }

  containerForWorkspace(uuid) {
    const found = this.listWorkspaces().find(space => space.uuid === uuid);
    return found ? found.containerTabId : 0;
  }

  /** Firefox container label for a userContextId; null for 0 or unknown. */
  containerLabel(userContextId) {
    if (!userContextId) return null;
    try {
      return this.#window.ContextualIdentityService?.getUserContextLabel(userContextId) || null;
    } catch { return null; }
  }

  isPrivateWindow() {
    const window = this.#window;
    try {
      if (window.PrivateBrowsingUtils) return window.PrivateBrowsingUtils.isWindowPrivate(window);
    } catch {}
    return true; // unknown means private: never record, never treat as a context
  }

  selectedTab() {
    return this.#window.gBrowser?.selectedTab ?? null;
  }

  /** Switches this window to a workspace through Zen's own API. */
  async switchTo(uuid) {
    const zen = this.#zen();
    if (!zen || !this.listWorkspaces().some(space => space.uuid === uuid)) return false;
    await zen.changeWorkspaceWithID(uuid);
    return this.activeWorkspaceUuid() === uuid;
  }

  /** Opens an http(s) URL in a new foreground tab of the given (or active) workspace.
   * The URL comes from a page or a repository manifest, so it loads like an
   * untrusted web link: openWebLinkIn with a null triggering principal (never
   * the system principal), carrying the workspace's container. */
  async openTab(url, { workspaceUuid = null } = {}) {
    const parsed = URL.parse(String(url));
    if (!parsed || !["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password)
      throw new Error("INVALID_URL");
    if (workspaceUuid && this.activeWorkspaceUuid() !== workspaceUuid) await this.switchTo(workspaceUuid);
    // Zen assigns the workspace and its default container to new tabs itself
    // (gZenWorkspaces.getContextIdIfNeeded); the principal carries the same container.
    const space = this.activeWorkspaceUuid();
    const userContextId = space ? this.containerForWorkspace(space) : 0;
    const triggeringPrincipal = this.#window.Services.scriptSecurityManager.createNullPrincipal({ userContextId });
    if (!triggeringPrincipal || triggeringPrincipal.isSystemPrincipal) throw new Error("UNSAFE_PRINCIPAL");
    this.#window.openWebLinkIn(parsed.href, "tab", { triggeringPrincipal });
    return true;
  }

  /** Zen's <zen-workspace> section for a space (DevLoop anchors its project block there). */
  workspaceElement(uuid) {
    const zen = this.#zen();
    if (!zen || typeof uuid !== "string" || !UUID.test(uuid) || this.isPrivateWindow()) return null;
    try { return zen.workspaceElement(uuid) ?? null; } catch { return null; }
  }

  // F1 menu seam: the menu module itself stays free of Zen names.
  workspaceMenu() {
    return this.#window.document?.getElementById("zenWorkspaceMoreActions") ?? null;
  }

  workspaceMenuAnchor() {
    return this.#window.document?.getElementById("context_zenWorkspacesOpenInContainerTab") ?? null;
  }

  /** Same target rule as Zen's own menu: the clicked space icon, else the active space. */
  workspaceForMenuEvent(event) {
    let target = null;
    try {
      target = event?.explicitOriginalTarget?.closest?.("toolbarbutton")
        ?? event?.target?.triggerNode?.closest?.("toolbarbutton") ?? null;
    } catch {}
    const uuid = target?.getAttribute?.("zen-workspace-id");
    if (uuid && this.listWorkspaces().some(space => space.uuid === uuid)) return uuid;
    return this.activeWorkspaceUuid();
  }

  onChange(callback) {
    if (typeof callback !== "function") throw new TypeError("callback");
    this.#listeners.add(callback);
    return () => this.#listeners.delete(callback);
  }

  #snapshotMap() {
    return new Map(this.listWorkspaces().map(space => [space.uuid, space]));
  }

  #diff() {
    if (this.#disposed) return;
    const previous = this.#known ?? new Map();
    const next = this.#snapshotMap();
    this.#known = next;
    for (const uuid of previous.keys()) if (!next.has(uuid)) this.#emit({ kind: "deleted", uuid });
    for (const [uuid, space] of next) {
      const before = previous.get(uuid);
      if (!before) this.#emit({ kind: "created", uuid });
      // "renamed" covers every visible workspace field: name, icon and default container.
      else if (before.name !== space.name || before.icon !== space.icon
        || before.containerTabId !== space.containerTabId) this.#emit({ kind: "renamed", uuid });
    }
  }

  #emit(change) {
    for (const listener of [...this.#listeners]) {
      try { listener(change); } catch (error) { console.error("AxioSozo workspace listener failed", error); }
    }
  }

  dispose() {
    if (this.#disposed) return;
    this.#window.removeEventListener("ZenWorkspaceDataChanged", this.#onData);
    this.#window.removeEventListener("ZenWorkspacesUIUpdate", this.#onData);
    try { this.#window.gZenWorkspaces?.removeChangeListeners?.(this.#changeListener); } catch {}
    this.#disposed = true;
    this.#listeners.clear();
  }
}
