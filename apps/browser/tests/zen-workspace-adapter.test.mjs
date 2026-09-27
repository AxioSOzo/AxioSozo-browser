import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ZenWorkspaceAdapter, ZEN_ADAPTER_CONTRACT } from "../chrome/ZenWorkspaceAdapter.sys.mjs";
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
  for (const file of ["AxioSozoServices.sys.mjs", "ContextMenuContexts.sys.mjs", "JsonStore.sys.mjs"]) {
    const text = readFileSync(new URL(file, chrome), "utf8");
    assert.doesNotMatch(text, /gZenWorkspaces|zenWorkspaceMoreActions|zen-workspace-id|ZenWorkspace(DataChanged|sUIUpdate)/u, file);
  }
});
