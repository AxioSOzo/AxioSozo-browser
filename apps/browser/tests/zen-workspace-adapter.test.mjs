import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ZenWorkspaceAdapter, ZEN_ADAPTER_CONTRACT, ZEN_SIDEBAR } from "../chrome/ZenWorkspaceAdapter.sys.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";

// Synthetic Zen window model (support/fake-zen.mjs). These tests cover the
// adapter seam only; they are not evidence of a running Zen window.
const A = "11111111-1111-4111-8111-111111111111";
const B = "{22222222-2222-4222-8222-222222222222}";

function tab(attributes) {
  return { getAttribute: name => attributes[name] ?? null };
}

test("lists workspaces with name, icon and default container; private windows have none", () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home", icon: "🏠", containerTabId: 0, theme: {} },
    { uuid: B, name: "BV", icon: "", containerTabId: 2 }, { uuid: "not-a-uuid", name: "x" }] });
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.deepEqual(adapter.listWorkspaces(), [
    { uuid: A, name: "Home", icon: "🏠", containerTabId: 0 },
    { uuid: B, name: "BV", icon: "", containerTabId: 2 }]);
  assert.equal(adapter.activeWorkspaceUuid(), A);
  assert.equal(adapter.containerForWorkspace(B), 2);
  assert.equal(adapter.containerForWorkspace("missing"), 0);
  assert.equal(adapter.containerLabel(2), "Work");
  assert.equal(adapter.containerLabel(0), null);
  assert.equal(adapter.isAuthoritative(), true);
  const priv = new ZenWorkspaceAdapter(fakeZenWindow({ spaces: [{ uuid: A, name: "Incognito" }], isPrivate: true }).window);
  assert.equal(priv.isPrivateWindow(), true);
  assert.deepEqual(priv.listWorkspaces(), []);
  assert.equal(priv.activeWorkspaceUuid(), null);
  assert.equal(priv.isAuthoritative(), false);
  assert.equal(priv.workspaceForTab(tab({ "zen-workspace-id": A })), null);
  const unsynced = new ZenWorkspaceAdapter(fakeZenWindow({ spaces: [{ uuid: A, name: "Local" }], disabled: true }).window);
  assert.equal(unsynced.isAuthoritative(), false);
});

test("unknown private state is treated as private", () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }] });
  delete f.window.PrivateBrowsingUtils;
  assert.equal(new ZenWorkspaceAdapter(f.window).isPrivateWindow(), true);
});

test("tab workspace uses Zen's attribute; essentials follow the active space", () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }, { uuid: B, name: "BV" }], active: B });
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.equal(adapter.workspaceForTab(tab({ "zen-workspace-id": A })), A);
  assert.equal(adapter.workspaceForTab(tab({ "zen-essential": "true" })), B);
  assert.equal(adapter.workspaceForTab(tab({})), null);
  assert.equal(adapter.workspaceForTab(tab({ "zen-workspace-id": "../evil" })), null);
  assert.equal(adapter.workspaceForTab(null), null);
});

test("onChange reports created, renamed (incl. container), deleted and switched; dispose detaches", async () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home", containerTabId: 0 }] });
  const adapter = new ZenWorkspaceAdapter(f.window);
  const changes = [];
  const unsubscribe = adapter.onChange(change => changes.push(change));
  f.setSpaces([{ uuid: A, name: "Home" }, { uuid: B, name: "BV" }]);
  f.window.dispatch("ZenWorkspaceDataChanged");
  f.mutate(B, { name: "AxioSozo BV" });
  f.window.dispatch("ZenWorkspacesUIUpdate");
  f.mutate(B, { containerTabId: 2 });
  f.window.dispatch("ZenWorkspaceDataChanged");
  await f.zen.changeWorkspaceWithID(B);
  f.setSpaces([{ uuid: A, name: "Home" }]);
  f.window.dispatch("ZenWorkspacesUIUpdate");
  f.window.dispatch("ZenWorkspacesUIUpdate"); // no duplicate deletion
  assert.deepEqual(changes, [
    { kind: "created", uuid: B }, { kind: "renamed", uuid: B }, { kind: "renamed", uuid: B },
    { kind: "switched", uuid: B }, { kind: "deleted", uuid: B }]);
  unsubscribe();
  adapter.onChange(() => { throw new Error("listener failure must not break Zen"); });
  f.setSpaces([]);
  const originalError = console.error; console.error = () => {};
  try { f.window.dispatch("ZenWorkspacesUIUpdate"); } finally { console.error = originalError; }
  adapter.dispose();
  assert.equal(f.changeListeners.length, 0);
  assert.equal(f.listeners.get("ZenWorkspaceDataChanged").size, 0);
  assert.deepEqual(adapter.listWorkspaces(), []);
});

test("switching and opening tabs go through Zen; only http(s) without credentials", async () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }, { uuid: B, name: "BV", containerTabId: 2 }] });
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.equal(await adapter.switchTo(B), true);
  assert.equal(await adapter.switchTo("33333333-3333-4333-8333-333333333333"), false);
  await adapter.openTab("https://example.test/path", { workspaceUuid: A });
  await adapter.openTab("https://example.test/b", { workspaceUuid: B });
  assert.deepEqual(f.opened.map(({ principal, ...rest }) => rest),
    [{ url: "https://example.test/path", where: "tab", workspace: A }, { url: "https://example.test/b", where: "tab", workspace: B }]);
  // L2: an untrusted web link, never the system principal; the container follows the workspace.
  assert.deepEqual(f.opened.map(entry => [entry.principal.kind, entry.principal.isSystemPrincipal, entry.principal.originAttributes.userContextId]),
    [["null", false, 0], ["null", false, 2]]);
  for (const bad of ["javascript:alert(1)", "file:///etc/passwd", "about:config", "https://u:p@example.test/", "not a url"]) {
    await assert.rejects(adapter.openTab(bad), /INVALID_URL/);
  }
  assert.equal(f.opened.length, 2);
  // A principal factory that ever returned the system principal is refused.
  f.window.Services.scriptSecurityManager.createNullPrincipal = () => ({ isSystemPrincipal: true });
  await assert.rejects(adapter.openTab("https://example.test/c"), /UNSAFE_PRINCIPAL/);
  assert.equal(f.opened.length, 2);
});

// gBrowser.addTab as pinned Zen applies it to an explicit, non-external
// container (Tabbrowser patch + getContextIdIfNeeded): the tab keeps it, its
// non-lazy browser has a browsing context with those origin attributes at
// once, and a foreground tab is selected unless setSelectedTab vetoes it.
// `browser` replaces the new tab's browser (e.g. an unattached one).
function tabbrowser(f, { override = null, veto = false, browser = null } = {}) {
  const added = [], removed = [];
  f.window.gBrowser.addTab = (url, options) => {
    added.push({ url, options, active: f.zen.activeWorkspace });
    const id = override ?? options.userContextId;
    const tab = { url, userContextId: id, linkedBrowser: browser ?? { browsingContext: { originAttributes: { userContextId: id } } } };
    if (!options.inBackground && !veto) f.window.gBrowser.selectedTab = tab;
    return tab;
  };
  f.window.gBrowser.removeTab = tab => removed.push(tab);
  return { added, removed };
}

test("project-container tabs: explicit container, matching null principal, not external, in the explicit Zen space", async () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }, { uuid: B, name: "BV", containerTabId: 2 }] });
  const tb = tabbrowser(f);
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.deepEqual(await adapter.openTab("https://vercel.com/team/harbor", { workspaceUuid: B, userContextId: 40 }), { selected: true });
  assert.equal(tb.added.length, 1);
  assert.equal(f.window.gBrowser.selectedTab.url, "https://vercel.com/team/harbor");
  const [{ url, options, active }] = tb.added;
  assert.equal(url, "https://vercel.com/team/harbor");
  assert.equal(active, B, "switched to the project's space first");
  assert.deepEqual(Object.keys(options).sort(), ["fromExternal", "inBackground", "skipRoute", "triggeringPrincipal", "userContextId", "zenWorkspaceId"]);
  assert.equal(options.userContextId, 40);
  assert.equal(options.fromExternal, false);
  assert.equal(options.inBackground, false);
  assert.equal(options.skipRoute, true, "Zen space routing cannot move it elsewhere");
  assert.equal(options.zenWorkspaceId, B);
  assert.deepEqual([options.triggeringPrincipal.kind, options.triggeringPrincipal.isSystemPrincipal, options.triggeringPrincipal.originAttributes],
    ["null", false, { userContextId: 40 }]);
  assert.equal(f.opened.length, 0, "no openWebLinkIn and no DOM attribute writes");
  // The space default (a shared site) is explicit too.
  await adapter.openTab("https://github.com/acme/harbor", { workspaceUuid: B, userContextId: 2 });
  assert.equal(tb.added[1].options.userContextId, 2);
  assert.deepEqual(tb.added[1].options.triggeringPrincipal.originAttributes, { userContextId: 2 });
});

test("project-container tabs refuse private windows, bad IDs, unsafe principals and a space that did not open", async () => {
  const priv = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }], isPrivate: true });
  const privTb = tabbrowser(priv);
  await assert.rejects(new ZenWorkspaceAdapter(priv.window).openTab("https://example.test/", { userContextId: 40 }), { code: "PRIVATE_WINDOW" });
  assert.equal(privTb.added.length, 0);
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }, { uuid: B, name: "BV" }] });
  const tb = tabbrowser(f);
  const adapter = new ZenWorkspaceAdapter(f.window);
  for (const id of [-1, 1.5, "40", null, 4294967295, 4294967296]) {
    await assert.rejects(adapter.openTab("https://example.test/", { userContextId: id }), { code: "INVALID_CONTAINER" }, String(id));
  }
  for (const bad of ["javascript:alert(1)", "file:///etc/passwd", "https://u:p@example.test/"]) {
    await assert.rejects(adapter.openTab(bad, { userContextId: 40 }), { code: "INVALID_URL" });
  }
  const manager = f.window.Services.scriptSecurityManager;
  const original = manager.createNullPrincipal;
  for (const fake of [() => ({ isSystemPrincipal: true, isNullPrincipal: false, originAttributes: { userContextId: 40 } }),
    () => ({ isSystemPrincipal: false, isNullPrincipal: true, originAttributes: { userContextId: 0 } }),
    () => ({ isSystemPrincipal: false, isNullPrincipal: false, originAttributes: { userContextId: 40 } }), () => null]) {
    manager.createNullPrincipal = fake;
    await assert.rejects(adapter.openTab("https://example.test/", { userContextId: 40 }), { code: "UNSAFE_PRINCIPAL" });
  }
  manager.createNullPrincipal = original;
  await assert.rejects(adapter.openTab("https://example.test/", { workspaceUuid: "33333333-3333-4333-8333-333333333333", userContextId: 40 }),
    { code: "WORKSPACE_UNAVAILABLE" });
  await assert.rejects(adapter.openTab("https://example.test/", { userContextId: 40, verify: () => { throw Object.assign(new Error("PROJECT_CHANGED"), { code: "PROJECT_CHANGED" }); } }),
    { code: "PROJECT_CHANGED" });
  assert.equal(tb.added.length, 0, "every refusal happens before a tab exists");
  delete f.window.gBrowser.addTab;
  await assert.rejects(adapter.openTab("https://example.test/", { userContextId: 40 }), { code: "NO_TABBROWSER" });
});

test("a tab that did not get its container, or has no live browsing context, is closed and reported; nothing else is touched", async () => {
  for (const [options, label] of [[{ override: 0 }, "default instead of 40"], [{ browser: {} }, "no browsing context"],
    [{ browser: { browsingContext: null } }, "destroyed browser"], [{ browser: { browsingContext: { originAttributes: {} } } }, "no userContextId"],
    [{ browser: { browsingContext: { originAttributes: { userContextId: 0 } } } }, "live context in another container"]]) {
    const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }] });
    const other = { url: "https://other.example/" };
    f.window.gBrowser.selectedTab = other;
    const tb = tabbrowser(f, options);
    const adapter = new ZenWorkspaceAdapter(f.window);
    await assert.rejects(adapter.openTab("https://example.test/", { userContextId: 40 }), { code: "CONTAINER_MISMATCH" }, label);
    assert.equal(tb.removed.length, 1, label);
    assert.equal(tb.removed[0].url, "https://example.test/", "only the tab it opened");
  }
});

test("Firefox may keep the current tab in front: the owned tab stays open and is reported unselected", async () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }] });
  const other = { url: "https://other.example/" };
  f.window.gBrowser.selectedTab = other;
  const tb = tabbrowser(f, { veto: true });
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.deepEqual(await adapter.openTab("https://example.test/", { userContextId: 40 }), { selected: false });
  assert.equal(tb.added.length, 1);
  assert.deepEqual(tb.removed, [], "neither the new tab nor any other is closed");
  assert.equal(f.window.gBrowser.selectedTab, other, "and the selection is not forced");
  // A window with a modal dialog is refused before any tab exists.
  f.window.document.documentElement = { hasAttribute: name => name === "window-modal-open" };
  await assert.rejects(adapter.openTab("https://example.test/", { userContextId: 40 }), { code: "WINDOW_BUSY" });
  assert.equal(tb.added.length, 1);
});

test("tab and identity readers report Firefox's own state and nothing they cannot confirm", () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }] });
  const identities = { 40: { userContextId: 40, public: true, name: "Harbor Suite", icon: "briefcase", color: "cyan" },
    41: { userContextId: 41, public: false, name: "userContextIdInternal.thumbnail", icon: "", color: "" },
    42: { userContextId: 7, public: true, name: "Mismatch", icon: "briefcase", color: "blue" } };
  f.window.ContextualIdentityService = {
    getPublicIdentityFromId: id => identities[id],
    getUserContextLabel: id => identities[id]?.name ?? "",
  };
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.deepEqual(adapter.containerIdentity(40), { userContextId: 40, name: "Harbor Suite", color: "cyan", icon: "briefcase" });
  for (const id of [0, 41, 42, 99, -1, 4294967295, "40"]) assert.equal(adapter.containerIdentity(id), null, String(id));
  const tab = (id, live) => ({ userContextId: id, linkedBrowser: live === undefined ? {} : { browsingContext: { originAttributes: { userContextId: live } } } });
  assert.equal(adapter.tabUserContextId(tab(40, 40)), 40);
  assert.equal(adapter.tabUserContextId(tab(0, 0)), 0, "the default container of a loaded tab");
  assert.equal(adapter.tabUserContextId(tab(0)), null, "a lazy or unattached browser: the attribute alone is not trusted");
  assert.equal(adapter.tabUserContextId({ userContextId: 0, linkedBrowser: { browsingContext: null } }), null, "a destroyed browser");
  assert.equal(adapter.tabUserContextId({ userContextId: 40 }), null, "no browser at all");
  assert.equal(adapter.tabUserContextId(tab(40, 0)), null, "disagreement is unknown, never guessed");
  assert.equal(adapter.tabUserContextId(tab(40, "40")), null);
  const throwing = { userContextId: 40, linkedBrowser: { get browsingContext() { throw new Error("dead object"); } } };
  assert.equal(adapter.tabUserContextId(throwing), null);
  for (const id of [undefined, -1, 1.5, 4294967295]) assert.equal(adapter.tabUserContextId(tab(id, id)), null);
  assert.equal(adapter.tabUserContextId(null), null);
});

test("menu target mirrors Zen: clicked space icon, else the active space", () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "Home" }, { uuid: B, name: "BV" }], active: A });
  f.window.elements.zenWorkspaceMoreActions = { id: "zenWorkspaceMoreActions" };
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.equal(adapter.workspaceMenu().id, "zenWorkspaceMoreActions");
  const button = { getAttribute: name => (name === "zen-workspace-id" ? B : null) };
  assert.equal(adapter.workspaceForMenuEvent({ explicitOriginalTarget: { closest: () => button } }), B);
  const stranger = { getAttribute: () => "44444444-4444-4444-8444-444444444444" };
  assert.equal(adapter.workspaceForMenuEvent({ explicitOriginalTarget: { closest: () => stranger } }), A);
  assert.equal(adapter.workspaceForMenuEvent({}), A);
  f.window.elements[B] = { localName: "zen-workspace" };
  assert.equal(adapter.workspaceElement(B).localName, "zen-workspace");
  assert.equal(adapter.workspaceElement("zenWorkspaceMoreActions"), null, "only workspace UUIDs are looked up");
});

test("ZEN_ADAPTER_CONTRACT names exist in the pinned Zen source", t => {
  const upstream = fileURLToPath(new URL("../../../upstream/zen/", import.meta.url));
  if (!existsSync(upstream + "src/zen/spaces/ZenSpaceManager.mjs")) {
    t.skip("upstream/zen is absent: run `./dev setup` (or scripts/zen.py) to fetch the pinned Zen source; contract not checked");
    return;
  }
  const cache = new Map();
  const missing = [];
  for (const entry of ZEN_ADAPTER_CONTRACT) {
    assert.ok(entry.name && entry.source && entry.needle, JSON.stringify(entry));
    if (!cache.has(entry.source)) cache.set(entry.source, existsSync(upstream + entry.source) ? readFileSync(upstream + entry.source, "utf8") : null);
    const text = cache.get(entry.source);
    if (text === null || !text.includes(entry.needle)) missing.push(`${entry.name} (${entry.source})`);
  }
  assert.deepEqual(missing, [], "Zen changed an API the adapter relies on; update ZenWorkspaceAdapter.sys.mjs only");
  // The adapter must be the only chrome module that names Zen workspace globals.
  const chrome = new URL("../chrome/", import.meta.url);
  for (const file of ["AxioSozoServices.sys.mjs", "ContextMenuContexts.sys.mjs", "JsonStore.sys.mjs", "SpaceSwitcher.sys.mjs"]) {
    const text = readFileSync(new URL(file, chrome), "utf8");
    assert.doesNotMatch(text, /gZenWorkspaces|zenWorkspaceMoreActions|zen-workspace-id|ZenWorkspace(DataChanged|sUIUpdate)/u, file);
  }
});

test("neighbourWorkspace follows Zen's wrap-around and natural-scroll prefs", () => {
  const C = "33333333-3333-4333-8333-333333333333";
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "A" }, { uuid: B, name: "B" }, { uuid: C, name: "C" }], active: A });
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.equal(adapter.neighbourWorkspace(1), B);
  assert.equal(adapter.neighbourWorkspace(-1), C, "wraps by default");
  assert.equal(adapter.neighbourWorkspace(0), null);
  f.zen.naturalScroll = true;
  assert.equal(adapter.neighbourWorkspace(1, { scroll: true }), C);
  assert.equal(adapter.neighbourWorkspace(1), B, "keys ignore natural scroll");
  f.zen.shouldWrapAroundNavigation = false;
  assert.equal(adapter.neighbourWorkspace(-1), null);
  const single = new ZenWorkspaceAdapter(fakeZenWindow({ spaces: [{ uuid: A, name: "A" }] }).window);
  assert.equal(single.neighbourWorkspace(1), null);
});

test("menu target marking, menu opening, header anchor and onUpdate", () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "A" }, { uuid: B, name: "B" }], active: A });
  const opened = [];
  f.window.elements.zenWorkspaceMoreActions = { openPopup: (...args) => opened.push(args) };
  const adapter = new ZenWorkspaceAdapter(f.window);
  const attrs = new Map();
  const element = { setAttribute: (k, v) => attrs.set(k, v) };
  assert.equal(adapter.markMenuTarget(element, B), true);
  assert.deepEqual(Object.fromEntries(attrs), { "zen-workspace-id": B, context: "zenWorkspaceMoreActions" });
  assert.equal(adapter.markMenuTarget(element, "../x"), false);
  assert.equal(adapter.openWorkspaceMenu(element, null), true);
  assert.deepEqual(opened[0].slice(0, 2), [element, "before_start"]);
  assert.equal(adapter.openWorkspaceMenu(null), false);
  const header = { id: "header" };
  f.window.elements[A] = { querySelector: selector => (selector === ZEN_SIDEBAR.spaceHeader ? header : null) };
  assert.equal(adapter.workspaceHeader(A), header);
  assert.equal(adapter.workspaceHeader(B), null);
  f.window.elements[ZEN_SIDEBAR.footToolbar] = { id: "foot" };
  assert.equal(adapter.sidebarFoot().id, "foot");
  let updates = 0;
  const off = adapter.onUpdate(() => updates++);
  f.window.dispatch("ZenWorkspacesUIUpdate"); // e.g. a reorder: no diff, still an update
  assert.equal(updates, 1);
  off();
  f.window.dispatch("ZenWorkspacesUIUpdate");
  assert.equal(updates, 1);
  adapter.onUpdate(() => updates++);
  adapter.dispose();
  f.window.dispatch("ZenWorkspacesUIUpdate");
  assert.equal(updates, 1);
});

test("Library/Downloads swap goes through CustomizableUI and is reversible", () => {
  const f = fakeZenWindow({ spaces: [{ uuid: A, name: "A" }] });
  const foot = [ZEN_SIDEBAR.libraryWidget, ZEN_SIDEBAR.spaceIcons];
  const where = id => (foot.includes(id) ? { area: ZEN_SIDEBAR.footToolbar, position: foot.indexOf(id) } : null);
  f.window.CustomizableUI = {
    getPlacementOfWidget: where,
    addWidgetToArea: (id, area, position) => { assert.equal(area, ZEN_SIDEBAR.footToolbar); foot.splice(position, 0, id); },
    removeWidgetFromArea: id => { if (foot.includes(id)) foot.splice(foot.indexOf(id), 1); },
  };
  const adapter = new ZenWorkspaceAdapter(f.window);
  assert.equal(adapter.replaceLibraryButton(), true);
  assert.deepEqual(foot, [ZEN_SIDEBAR.downloadsWidget, ZEN_SIDEBAR.spaceIcons]);
  assert.equal(adapter.replaceLibraryButton(), false, "idempotent");
  assert.equal(adapter.restoreLibraryButton(), true);
  assert.deepEqual(foot, [ZEN_SIDEBAR.libraryWidget, ZEN_SIDEBAR.spaceIcons]);
  assert.equal(adapter.restoreLibraryButton(), false);
  delete f.window.CustomizableUI;
  assert.equal(adapter.replaceLibraryButton(), false);
});
