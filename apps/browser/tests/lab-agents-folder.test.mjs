/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Lab "agents-folder": agent sessions as tabs of a Zen live folder "Agents"
// per space. Every Zen name it uses is checked against the pinned Zen source;
// the folder controller and the window part run against a stand-in for Zen's
// live-folder manager (tests/support/lab-presence-fakes.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import "./support/chrome-modules.mjs";
import { labContext } from "./support/lab-harness.mjs";
import { SPACE_A, SPACE_B, doneSession, fakeAdapter, fakeAgents, fakeServices, fakeZenLiveFolders, presenceWindow, project, session, settle }
  from "./support/lab-presence-fakes.mjs";

const { AGENTS_FOLDER_ICON, AGENTS_FOLDER_LABEL, AGENTS_FOLDER_TYPE, PUSH_INTERVAL_MS, ZEN_TOUCHPOINTS, ZEN_MODULES, agentsProviderClass,
  createFolderController, splitItemId } = await import("../chrome/lab/agents-folder/live-folder.sys.mjs");
const { installAgentsFolder, liveItemOf, liveItemsBySpace, STATE_ATTRIBUTE, FOLDER_STYLESHEET } = await import("../chrome/lab/agents-folder/agents-folder.sys.mjs");
const { createPresenceHub } = await import("../chrome/lab/presence/hub.sys.mjs");
const { agentIcon } = await import("../chrome/lab/presence/icons.sys.mjs");

const ZEN = new URL("../../../upstream/zen/", import.meta.url);
const itemTabs = h => h.gBrowser.tabs.filter(tab => tab.hasAttribute("zen-live-folder-item-id"));
const itemTab = (h, id) => itemTabs(h).find(tab => tab.getAttribute("zen-live-folder-item-id").endsWith(`:${id}`)) ?? null;

// ---------------------------------------------------------------- Zen, as pinned

test("every Zen name the Agents folder uses is in the pinned Zen source", { skip: !existsSync(ZEN) && "upstream/zen is not checked out" }, () => {
  assert.ok(ZEN_TOUCHPOINTS.length >= 25);
  for (const { name, source, needle } of ZEN_TOUCHPOINTS) {
    const file = new URL(source, ZEN);
    assert.ok(existsSync(file), `${name}: ${source} exists`);
    assert.ok(readFileSync(file, "utf8").includes(needle), `${name}: "${needle}" in ${source}`);
  }
  assert.deepEqual(ZEN_MODULES, { manager: "resource:///modules/zen/ZenLiveFoldersManager.sys.mjs", provider: "resource:///modules/zen/ZenLiveFolder.sys.mjs" });
  assert.equal(AGENTS_FOLDER_ICON, "chrome://browser/skin/zen-icons/selectable/terminal.svg");
});

test("our provider type sits on Zen's base: its items are what was published for its space, and it serializes like Zen's own", async () => {
  class Base { constructor({ id, manager, state }) { Object.assign(this, { id, manager, state: { ...state } }); } }
  const published = { [SPACE_A]: [{ id: "lab-1" }] };
  const Provider = agentsProviderClass(Base, space => published[space] ?? []);
  assert.equal(Provider.type, AGENTS_FOLDER_TYPE);
  const provider = new Provider({ id: "f1", manager: null, state: { space: SPACE_A, interval: PUSH_INTERVAL_MS } });
  assert.ok(provider instanceof Base);
  assert.deepEqual(await provider.fetchItems(), [{ id: "lab-1" }]);
  assert.deepEqual(provider.options, []);
  assert.deepEqual(provider.serialize(), { state: { space: SPACE_A, interval: PUSH_INTERVAL_MS } });
  assert.deepEqual(await new Provider({ id: "f2", manager: null, state: {} }).fetchItems(), []);
  assert.deepEqual(splitItemId("1696-12:lab-00ab12"), { folderId: "1696-12", itemId: "lab-00ab12" });
  assert.deepEqual(splitItemId("f:ext-claude-code-0a1b2c3d-1111"), { folderId: "f", itemId: "ext-claude-code-0a1b2c3d-1111" });
  for (const bad of [null, "", "lab-1", ":lab-1", "f:github#12", "f:pull/1"]) assert.equal(splitItemId(bad), null, String(bad));
});

test("a live item: the session's title and state line, the agent's mark, the project's local page or its home", () => {
  const item = { id: "lab-1", state: "needs_you", title: "Harbor · fix the retry button", subtitle: "Claude Code · needs you", projectId: "p_harbor",
    spaceUuid: SPACE_A, session: session({ state: "needs_you" }) };
  assert.deepEqual({ ...liveItemOf(item, project()) }, { id: "lab-1", title: "Harbor · fix the retry button", subtitle: "Claude Code · needs you",
    icon: agentIcon("claude-code", "needs_you"), url: "http://localhost:5173/" });
  assert.equal(liveItemOf(item, project({ local: null })).url, "about:axiosozo#project=p_harbor");
  const bySpace = liveItemsBySpace([item, { ...item, id: "lab-2", spaceUuid: SPACE_B }, { ...item, id: "lab-3", spaceUuid: null }], () => project());
  assert.deepEqual([...bySpace.keys()], [SPACE_A, SPACE_B]);
  assert.deepEqual(bySpace.get(SPACE_A).map(entry => entry.id), ["lab-1"]);
});

// ---------------------------------------------------------------- the folders

function setup({ sessions = [], projects = [project(), project({ id: "p_atlas", name: "Atlas", root: "/synthetic/atlas", space: SPACE_B, local: "http://localhost:3000" })],
  restored = true, turnedOff = () => true } = {}) {
  const h = presenceWindow();
  h.addTab({ url: "https://news.example/", label: "News" });
  const zen = fakeZenLiveFolders(h);
  if (restored) zen.restored.resolve();
  const controller = createFolderController(zen, { restoreWaitMs: 50 });
  const agents = fakeAgents(sessions);
  const services = fakeServices(projects);
  const adapter = fakeAdapter();
  const hub = createPresenceHub();
  const ctx = labContext(h.window, { id: "agents-folder", agents, services, adapter });
  const handle = installAgentsFolder(h.window, ctx, { hub, folders: controller, turnedOff });
  return { h, zen, controller, agents, services, adapter, hub, ctx, handle };
}
const synced = async t => { await settle(); await t.controller.whenSynced(); await settle(); };

test("each space with agent sessions gets one Agents folder; each session is a lazy tab with its title, state line, mark and page", async () => {
  const run = session();
  const t = setup({ sessions: [run] });
  assert.equal(t.zen.manager.registry.get(AGENTS_FOLDER_TYPE)?.type, AGENTS_FOLDER_TYPE, "our type is in Zen's registry");
  await synced(t);
  assert.equal(t.zen.folders.size, 1);
  const [{ options, folder }] = t.h.window.gZenFolders.created;
  assert.deepEqual(options, { label: AGENTS_FOLDER_LABEL, isLiveFolder: true, collapsed: false, workspaceId: SPACE_A });
  assert.equal(folder.icon, AGENTS_FOLDER_ICON, "Zen's own terminal icon");
  const provider = t.zen.manager.liveFolders.get(folder.id);
  assert.equal(provider.constructor.type, AGENTS_FOLDER_TYPE);
  assert.equal(provider.started, true);
  assert.equal(provider.state.interval, PUSH_INTERVAL_MS, "pushed, not polled");
  assert.ok(t.zen.manager.saves >= 1);
  const tab = itemTab(t.h, run.id);
  assert.ok(tab);
  assert.equal(tab.getAttribute("zen-live-folder-item-id"), `${folder.id}:${run.id}`);
  assert.equal(tab.label, "Harbor · fix the retry button");
  assert.equal(tab.getAttribute("zen-show-sublabel"), "Claude Code · working: editing index.html");
  assert.equal(tab.getAttribute("image"), agentIcon("claude-code", "working"));
  assert.equal(tab.pendingUrl, "http://localhost:5173/", "the project's local page, loaded only when opened");
  assert.equal(tab.linkedPanel, "", "a lazy tab");
  assert.equal(tab.getAttribute(STATE_ATTRIBUTE), "working");
  assert.equal(tab.getAttribute("aria-description"), "Claude Code is working. Claude Code · working: editing index.html");
  assert.ok(t.h.document.l10n && t.h.l10n.some(([, args]) => args.tabSubtitle === "Claude Code · working: editing index.html"));
  // Another space's project: its own folder.
  const atlas = t.agents.emit(session({ projectId: "p_atlas", projectName: "Atlas", projectRoot: "/synthetic/atlas" }));
  await synced(t);
  assert.equal(t.zen.folders.size, 2);
  assert.equal(t.controller.folderFor(SPACE_B), t.h.window.gZenFolders.created[1].folder.id);
  assert.equal(itemTab(t.h, atlas.id).pendingUrl, "http://localhost:3000/");
  t.ctx.turnOff();
});

test("a session's new state is written onto its tab in place: sublabel, colour attribute, its mark while not opened", async () => {
  const run = session();
  const t = setup({ sessions: [run] });
  await synced(t);
  const tab = itemTab(t.h, run.id);
  t.agents.emit(session({ ...run, state: "needs_you", step: null, reason: "Claude Code wanted to go further (writing outside.txt). Continue in Terminal to decide." }));
  await synced(t);
  assert.equal(itemTab(t.h, run.id), tab, "the same tab: Zen only adds and removes by id");
  assert.equal(tab.getAttribute("zen-show-sublabel"), "Claude Code · needs you");
  assert.deepEqual(tab.querySelector(".zen-tab-sublabel").l10nArgs, { tabSubtitle: "Claude Code · needs you" });
  assert.equal(tab.getAttribute(STATE_ATTRIBUTE), "needs_you");
  assert.equal(tab.getAttribute("image"), agentIcon("claude-code", "needs_you"));
  assert.equal(t.ctx.toasts.length, 1, "needs you: one toast");
  assert.equal(t.ctx.toasts[0].title, "Claude Code needs you in Harbor");
  // Opened: its page shows its own icon; the line still follows.
  t.h.select(tab);
  t.h.commit(tab);
  t.agents.emit(doneSession({ id: run.id }));
  await synced(t);
  assert.equal(tab.getAttribute("zen-show-sublabel"), "Claude Code · done: Fixed the retry handler");
  assert.equal(tab.getAttribute("image"), agentIcon("claude-code", "needs_you"), "an opened tab's icon is left to its page");
  assert.equal(t.ctx.toasts.length, 1, "done never interrupts");
  t.ctx.turnOff();
});

test("opening an item shows its page with the result card over it, once the page is there; Reload is for that page", async () => {
  const run = doneSession();
  const t = setup({ sessions: [run] });
  await synced(t);
  const tab = itemTab(t.h, run.id);
  t.h.select(tab);
  await settle();
  assert.equal(t.h.document.querySelector(".axiosozo-presence-card"), null, "not before its page loaded: it would close on the first navigation");
  t.h.commit(tab);
  await settle();
  const card = t.h.document.querySelector(".axiosozo-presence-card");
  assert.ok(card);
  assert.equal(card.parentNode, tab.linkedBrowser.parentNode, "over the page");
  assert.equal(card.querySelector(".axiosozo-lab-card-title").textContent, "Harbor · fix the retry button");
  assert.deepEqual(card.querySelectorAll("button").map(node => node.textContent).filter(text => text), ["Dismiss", "Continue in Terminal", "Reload page"],
    "the item's tab shows the project's page: Reload is for it, on a click only");
  assert.deepEqual(t.h.reloads, []);
  // Selecting it again when loaded: the card at once.
  t.h.select(t.h.gBrowser.tabs[0]);
  t.h.select(tab);
  await settle();
  assert.ok(t.h.document.querySelector(".axiosozo-presence-card"));
  t.ctx.turnOff();
});

test("closing an item dismisses it until a later phase; Zen's own removals are no dismissal", async () => {
  const run = session();
  const t = setup({ sessions: [run] });
  await synced(t);
  t.h.close(itemTab(t.h, run.id));
  await synced(t);
  assert.equal(itemTab(t.h, run.id), null);
  assert.equal(t.hub.isHidden(t.agents.get(run.id)), true);
  assert.deepEqual(t.agents.calls.dismiss, [], "a working run is not cleared from ctx.agents");
  assert.equal(t.zen.folders.size, 0, "its folder had nothing left: gone");
  // It comes back when it finishes (Zen's own record of the close does not keep it away).
  const done = t.agents.emit(doneSession({ id: run.id }));
  await synced(t);
  assert.ok(itemTab(t.h, run.id), "the result comes back");
  t.h.close(itemTab(t.h, run.id));
  await synced(t);
  assert.deepEqual(t.agents.calls.dismiss, [done.id], "a finished run started here is cleared from ctx.agents too");
  // A session removed by ctx.agents: its tab goes, nothing is dismissed.
  const other = t.agents.emit(session());
  await synced(t);
  t.agents.remove(other.id);
  await synced(t);
  assert.equal(itemTab(t.h, other.id), null);
  assert.equal(t.hub.isHidden(other), false);
  t.ctx.turnOff();
});

test("a folder the user deleted is not recreated in that space while the experiment stays on", async () => {
  const run = session();
  const t = setup({ sessions: [run] });
  await synced(t);
  const id = t.controller.folderFor(SPACE_A);
  t.zen.manager.deleteFolder(id); // Zen's own folder delete (TabGroupRemoved → deleteFolder)
  t.agents.emit(session({ ...run, step: "Reading index.html" }));
  t.agents.emit(session());
  await synced(t);
  assert.equal(t.zen.folders.size, 0);
  assert.equal(t.controller.diagnostics().userRemoved, 1);
  t.ctx.turnOff();
});

test("after a restart: a folder Zen restored without our type is adopted, and its stale items go", async () => {
  const h = presenceWindow();
  h.addTab({ url: "https://news.example/" });
  const zen = fakeZenLiveFolders(h);
  const orphan = zen.restoreOrphan({ space: SPACE_A, itemIds: ["lab-0000aa", "ext-claude-code-1234"] });
  const unrelated = zen.makeFolder({ label: "Reading", isLiveFolder: true, workspaceId: SPACE_A });
  const controller = createFolderController(zen, { restoreWaitMs: 50 });
  const run = session();
  const agents = fakeAgents([run]);
  const ctx = labContext(h.window, { id: "agents-folder", agents, services: fakeServices(), adapter: fakeAdapter() });
  installAgentsFolder(h.window, ctx, { hub: createPresenceHub(), folders: controller, turnedOff: () => true });
  zen.restored.resolve();
  await settle(); await controller.whenSynced(); await settle();
  assert.equal(zen.manager.liveFolders.get(orphan.id)?.constructor.type, AGENTS_FOLDER_TYPE, "adopted through adoptSyncedFolder");
  assert.equal(zen.manager.liveFolders.has(unrelated.id), false, "a folder that is not ours is left alone");
  assert.equal(h.window.gZenFolders.created.length, 0, "no second folder");
  assert.deepEqual(orphan.tabs.map(tab => tab.getAttribute("zen-live-folder-item-id")), [`${orphan.id}:${run.id}`], "stale items replaced by the live ones");
  ctx.turnOff();
  assert.equal(zen.folders.has(orphan.id), false);
});

test("turned off: every Agents folder deleted, our type unregistered, our attributes gone; a closing window keeps them", async () => {
  const run = session();
  const t = setup({ sessions: [run], turnedOff: () => false });
  await synced(t);
  const tab = itemTab(t.h, run.id);
  // A second window, then the first closes: the folders stay (Zen syncs them).
  const second = installAgentsFolder(t.h.window, labContext(t.h.window, { id: "agents-folder", agents: t.agents, services: t.services, adapter: t.adapter }),
    { hub: t.hub, folders: t.controller, turnedOff: () => true });
  t.handle.dispose();
  assert.equal(t.zen.folders.size, 1);
  assert.equal(t.controller.diagnostics().refs, 1);
  second.dispose();
  assert.equal(t.zen.folders.size, 0, "the last window, turned off: deleted");
  assert.equal(t.zen.manager.registry.has(AGENTS_FOLDER_TYPE), false);
  assert.equal(tab.hasAttribute(STATE_ATTRIBUTE), false);
  assert.equal(t.controller.diagnostics().registered, false);
  assert.deepEqual(t.h.document.prolog ?? [], []);
  t.ctx.turnOff();
  // Quitting (or the last window closing without turning it off): nothing deleted, Zen keeps them for next time.
  const q = setup({ sessions: [session()], turnedOff: () => false });
  await synced(q);
  q.ctx.turnOff();
  assert.equal(q.zen.folders.size, 1);
  assert.equal(q.zen.manager.registry.has(AGENTS_FOLDER_TYPE), true);
});

test("the last window closes without turning it off, a new one opens: the same folders are taken up again, none deleted", async () => {
  const run = session();
  const t = setup({ sessions: [run], turnedOff: () => false });
  await synced(t);
  const id = t.controller.folderFor(SPACE_A);
  t.ctx.turnOff(); // the window closes (the switch stays on)
  assert.equal(t.zen.folders.has(id), true);
  const ctx = labContext(t.h.window, { id: "agents-folder", agents: t.agents, services: t.services, adapter: t.adapter });
  installAgentsFolder(t.h.window, ctx, { hub: t.hub, folders: t.controller, turnedOff: () => true });
  await synced(t);
  assert.equal(t.controller.folderFor(SPACE_A), id, "adopted, not replaced");
  assert.deepEqual(t.zen.manager.deleted, []);
  assert.equal(t.h.window.gZenFolders.created.length, 1);
  assert.ok(itemTab(t.h, run.id));
  ctx.turnOff();
  assert.equal(t.zen.folders.has(id), false);
});

test("the folder's stylesheet colours only needs you (amber) and failed (red), readable as small text", () => {
  const css = readFileSync(new URL("../chrome/lab/agents-folder/agents-folder.css", import.meta.url), "utf8");
  assert.match(FOLDER_STYLESHEET, /lab\/agents-folder\/agents-folder\.css$/u);
  assert.match(css, /\[axiosozo-agent-state="needs_you"\]\[zen-show-sublabel\] \.tab-label-container \.zen-tab-sublabel/u);
  assert.match(css, /\[axiosozo-agent-state="failed"\]\[zen-show-sublabel\] \.tab-label-container \.zen-tab-sublabel/u);
  assert.equal((css.match(/color: light-dark/gu) ?? []).length, 2, "two colours, both meaningful");
  assert.match(css, /@media \(forced-colors: active\)/u);
});
