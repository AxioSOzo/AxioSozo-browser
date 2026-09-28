/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./support/chrome-modules.mjs";
import { createFakeWindow, createFakeAdapter, createFakeServices, createClock, flushMicrotasks, project, context,
  WORKSPACE_A, WORKSPACE_B, NS_ERROR_UNKNOWN_HOST } from "./dev-loop-harness.test.mjs";

const core = await import("../../../packages/contexts/src/index.mjs");
const { installDevLoop, WAIT_BACKOFF_MS, WAIT_MAX_ATTEMPTS, RUNTIME_STYLESHEET, WPL } = await import("../chrome/DevLoop.sys.mjs");

const WEB = { name: "web", url: "http://localhost:5173/", port: 5173 };
function setup({ privateWindow = false, statuses = null, contexts = null, probe = null, services: serviceList = [WEB], prefs = {} } = {}) {
  const h = createFakeWindow({ privateWindow, prefs });
  // The real adapter resolves Zen's <zen-workspace id=uuid>; DevLoop never looks it up itself.
  const adapter = createFakeAdapter({ privateWindow, elements: uuid => h.document.getElementById(uuid) });
  const p = project({ services: serviceList });
  const services = createFakeServices(core, {
    projects: [p],
    contexts: contexts ?? [context(WORKSPACE_A, "project", { project_id: p.id }), context(WORKSPACE_B, "personal")],
    statuses: { [p.id]: statuses ?? [{ ...WEB, status: "down", checked_at: 0 }] },
  });
  const clock = createClock();
  const loop = installDevLoop(h.window, { services, adapter, core, timers: clock.timersApi, clock: clock.fn,
    ...(probe ? { probe } : {}) });
  const pill = () => h.document.getElementById("axiosozo-env-pill");
  const menu = () => h.document.getElementById("axiosozo-env-menu");
  const overlay = tab => h.stackOf(tab).querySelector(".axiosozo-waiting");
  return { h, adapter, services, clock, loop, pill, menu, overlay, project: p };
}

test("environment pill appears only on URLs of a declared project environment", async () => {
  const t = setup();
  const tab = t.h.addTab({ url: "about:blank" });
  await flushMicrotasks();
  assert.equal(t.pill().hidden, true);
  t.h.commit(tab, "http://localhost:5173/app/settings?tab=2#billing");
  await flushMicrotasks();
  assert.equal(t.pill().hidden, false);
  assert.equal(t.pill().querySelector(".axiosozo-env-pill-label").textContent, "local");
  assert.equal(t.pill().getAttribute("data-environment"), "local");
  assert.equal(t.pill().localName, "button", "a real button: keyboard and VoiceOver reachable");
  assert.equal(t.pill().getAttribute("aria-haspopup"), "menu");
  assert.match(t.pill().getAttribute("aria-label"), /^Webapp: local environment, 1 of 1 services not running\. Switch environment$/u);
  assert.equal(t.pill().parentNode.id, "page-action-buttons");
  for (const url of ["https://unrelated.example/app", "http://localhost:3000/", "about:preferences", "file:///tmp/x.html"]) {
    t.h.commit(tab, url);
    await flushMicrotasks();
    assert.equal(t.pill().hidden, true, url);
  }
  t.h.commit(tab, "https://preview.webapp.example/");
  await flushMicrotasks();
  assert.equal(t.pill().hidden, false);
  assert.equal(t.pill().getAttribute("data-environment"), "preview");
  // Selecting another tab updates the pill for that tab.
  t.h.addTab({ url: "https://news.example/" });
  await flushMicrotasks();
  assert.equal(t.pill().hidden, true);
  t.h.select(tab);
  await flushMicrotasks();
  assert.equal(t.pill().hidden, false);
  t.loop.dispose();
});

test("switching environment keeps path, query and fragment in the same tab", async () => {
  const t = setup();
  const tab = t.h.addTab({ url: "http://localhost:5173/app/settings?tab=2#billing" });
  await flushMicrotasks();
  t.pill().click();
  assert.equal(t.menu().openedWith, t.pill());
  assert.equal(t.pill().getAttribute("aria-expanded"), "true");
  const items = t.menu().querySelectorAll("menuitem");
  assert.deepEqual(items.filter(i => i.hasAttribute("data-environment")).map(i => i.getAttribute("data-environment")),
    ["local", "preview", "production"], "local → preview → production order");
  const local = items.find(i => i.getAttribute("data-environment") === "local");
  assert.equal(local.getAttribute("checked"), "true");
  assert.equal(local.getAttribute("disabled"), "true");
  const status = items.find(i => i.hasAttribute("data-status"));
  assert.equal(status.getAttribute("label"), "web (port 5173): not running", "service status has a text alternative in the menu");
  const production = items.find(i => i.getAttribute("data-environment") === "production");
  t.menu().dispatch("command", { target: production });
  assert.deepEqual(t.h.opened.map(o => [o.url, o.where, o.web]), [["https://webapp.example/app/settings?tab=2#billing", "current", true]]);
  // L2: a manifest-derived URL loads with a null principal in the tab's container, never the system principal.
  const { triggeringPrincipal, targetBrowser } = t.h.opened[0].options;
  assert.deepEqual([triggeringPrincipal.kind, triggeringPrincipal.isSystemPrincipal, triggeringPrincipal.originAttributes], ["null", false, { userContextId: 0 }]);
  assert.equal(targetBrowser, tab.linkedBrowser);
  t.menu().hidePopup();
  assert.equal(t.pill().getAttribute("aria-expanded"), "false");
  t.h.commit(tab, "https://webapp.example/app/settings?tab=2#billing");
  await flushMicrotasks();
  assert.equal(t.pill().getAttribute("data-environment"), "production");
  assert.equal(t.loop.switchEnvironment("preview"), "https://preview.webapp.example/app/settings?tab=2#billing");
  assert.equal(t.loop.switchEnvironment("staging"), null, "unknown environments never navigate");
  assert.equal(t.h.opened.length, 2);
  t.loop.dispose();
});

const folders = h => h.document.getElementById("axiosozo-project-folders");
const blocks = h => folders(h)?.querySelectorAll(".axiosozo-project-block") ?? [];
const blockFor = (h, id) => blocks(h).find(b => b.getAttribute("data-project-id") === id) ?? null;
const rowsOf = block => block.querySelectorAll(".axiosozo-project-link").map(li => li.children[0]);

test("project folder sits right under the space header of the active space and follows switches", async () => {
  const t = setup({ statuses: [{ ...WEB, status: "up", checked_at: 1 }] });
  await flushMicrotasks();
  const workspace = t.h.document.getElementById(WORKSPACE_A);
  const header = workspace.querySelector(".zen-current-workspace-indicator");
  assert.equal(folders(t.h).parentNode, workspace);
  assert.equal(folders(t.h).previousElementSibling, header, "anchored after Zen's (possibly hidden) space header");
  assert.equal(folders(t.h).getAttribute("role"), "group");
  const block = blockFor(t.h, t.project.id);
  const toggle = block.querySelector(".axiosozo-project-toggle");
  assert.equal(toggle.localName, "button");
  assert.equal(toggle.getAttribute("aria-expanded"), "false", "no open tab: collapsed, one quiet row");
  assert.equal(block.querySelector(".axiosozo-project-body").hidden, true);
  assert.equal(block.querySelector(".axiosozo-project-name").textContent, "Webapp");
  // One dot per local environment plus production; dots are decorative, the label carries the status.
  assert.deepEqual(block.querySelector(".axiosozo-project-summary").querySelectorAll(".axiosozo-status-dot").map(d => d.getAttribute("data-status")),
    ["up", "remote"]);
  assert.match(toggle.getAttribute("aria-label"), /^Webapp, 1 of 1 local server running, production not checked\. Expand project$/u);
  toggle.click();
  await flushMicrotasks();
  const opened = blockFor(t.h, t.project.id);
  assert.equal(opened.querySelector(".axiosozo-project-toggle").getAttribute("aria-expanded"), "true");
  assert.deepEqual(rowsOf(opened).map(b => [b.getAttribute("data-kind"), b.querySelector(".axiosozo-project-link-label").textContent]),
    [["environment", "local"], ["environment", "preview"], ["environment", "production"], ["more", "More"]]);
  assert.match(rowsOf(opened)[0].getAttribute("aria-label"), /^local, localhost:5173, running$/u);
  t.adapter.active = WORKSPACE_B;
  t.adapter.emit({ kind: "switched", uuid: WORKSPACE_B });
  await flushMicrotasks();
  assert.equal(folders(t.h), null, "a space without projects shows nothing");
  t.adapter.active = WORKSPACE_A;
  t.adapter.emit({ kind: "switched", uuid: WORKSPACE_A });
  await flushMicrotasks();
  assert.equal(folders(t.h)?.parentNode, workspace);
  const css = readFileSync(new URL("../chrome/axiosozo-runtime.css", import.meta.url), "utf8");
  assert.match(css, /:root\[zen-compact-mode="true"\] \.axiosozo-project-folders \{ display: none; \}/u);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[^}]*axiosozo-project/u);
  t.loop.dispose();
  assert.equal(folders(t.h), null);
});

test("without a space header the folder falls back to the top of the workspace element", async () => {
  const h = createFakeWindow();
  const adapter = createFakeAdapter({ elements: uuid => h.document.getElementById(uuid) });
  delete adapter.workspaceHeader;
  const p = project();
  const services = createFakeServices(core, { projects: [p] });
  const loop = installDevLoop(h.window, { services, adapter, core, timers: createClock().timersApi, clock: () => 0 });
  await flushMicrotasks();
  assert.equal(h.document.getElementById(WORKSPACE_A).children[0], folders(h));
  loop.dispose();
});

test("a manually opened localhost tab links to its project: pill, active folder, aria-current", async () => {
  const t = setup();
  await flushMicrotasks();
  // 127.0.0.1 is the same host as the declared localhost (loopback alias).
  const tab = t.h.addTab({ url: "http://127.0.0.1:5173/board" });
  await flushMicrotasks();
  assert.equal(t.pill().hidden, false);
  assert.equal(t.pill().getAttribute("data-environment"), "local");
  const block = blockFor(t.h, t.project.id);
  assert.ok(block.hasAttribute("data-active"));
  assert.equal(block.querySelector(".axiosozo-project-toggle").getAttribute("aria-expanded"), "true", "the active project starts expanded");
  assert.equal(rowsOf(block)[0].getAttribute("aria-current"), "true");
  t.h.commit(tab, "https://unrelated.example/");
  await flushMicrotasks();
  assert.equal(blockFor(t.h, t.project.id).querySelector(".axiosozo-project-toggle").getAttribute("aria-expanded"), "false");
  t.loop.dispose();
});

test("folder rows select an open tab of that environment in this space before opening a new one", async () => {
  const t = setup();
  await flushMicrotasks();
  blockFor(t.h, t.project.id).querySelector(".axiosozo-project-toggle").click();
  await flushMicrotasks();
  const row = label => rowsOf(blockFor(t.h, t.project.id)).find(b => b.getAttribute("aria-label").startsWith(`${label},`));
  const other = t.h.addTab({ url: "http://localhost:5173/app/settings", workspace: WORKSPACE_B, select: false });
  const local = t.h.addTab({ url: "http://127.0.0.1:5173/app/settings", select: false });
  t.h.addTab({ url: "https://docs.example/" });
  await flushMicrotasks();
  row("local").click();
  assert.equal(t.h.gBrowser.selectedTab, local, "the local tab in this space (via its loopback alias), not the one in another space");
  assert.notEqual(t.h.gBrowser.selectedTab, other);
  assert.equal(t.h.opened.length, 0);
  row("preview").click();
  assert.deepEqual(t.h.opened.map(o => [o.url, o.where]), [["https://preview.webapp.example/", "tab"]], "no open preview tab: a new one");
  t.loop.dispose();
});

test("projects live in any space; more than three fold into an overflow row, active ones first", async () => {
  const h = createFakeWindow();
  const adapter = createFakeAdapter({ active: WORKSPACE_B, elements: uuid => h.document.getElementById(uuid) });
  const list = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"].map((name, i) => project({ id: `p_${name.toLowerCase()}`, name, space: WORKSPACE_B,
    environments: [{ name: "local", base_url: `http://localhost:${4000 + i}` }] }));
  const services = createFakeServices(core, { projects: list, contexts: [context(WORKSPACE_A, "project"), context(WORKSPACE_B, "personal")] });
  const loop = installDevLoop(h.window, { services, adapter, core, timers: createClock().timersApi, clock: () => 0 });
  h.addTab({ url: "http://localhost:4004/", workspace: WORKSPACE_B });
  await flushMicrotasks();
  assert.deepEqual(blocks(h).map(b => b.querySelector(".axiosozo-project-name").textContent), ["Epsilon", "Alpha", "Beta"],
    "a personal space holds projects; the one with an open tab comes first");
  const overflow = folders(h).querySelector(".axiosozo-project-overflow");
  assert.equal(overflow.textContent, "2 more projects");
  assert.equal(overflow.getAttribute("aria-expanded"), "false");
  overflow.click();
  await flushMicrotasks();
  assert.equal(blocks(h).length, 5);
  assert.equal(folders(h).querySelector(".axiosozo-project-overflow").textContent, "Show fewer projects");
  assert.ok(blocks(h).slice(1).every(b => b.querySelector(".axiosozo-project-toggle").getAttribute("aria-expanded") === "false"),
    "inactive projects stay collapsed");
  loop.dispose();
});

test("multi-app projects: rows grouped per app, pill names the app, switching stays in the app", async () => {
  const h = createFakeWindow();
  const adapter = createFakeAdapter({ elements: uuid => h.document.getElementById(uuid) });
  const domo = project({ id: "p_domo", name: "Domo Cortex",
    environments: [{ name: "local", app: "desktop", base_url: "http://localhost:1420" },
      { name: "local", app: "web", base_url: "http://localhost:5173" },
      { name: "production", app: "web", base_url: "https://domo.example" }],
    services: [{ name: "Tauri dev server", app: "desktop", url: "http://localhost:1420/", port: 1420 },
      { name: "Vite dev server", app: "web", url: "http://localhost:5173/", port: 5173 }] });
  const services = createFakeServices(core, { projects: [domo], statuses: { p_domo: [
    { name: "Tauri dev server", url: "http://localhost:1420/", port: 1420, status: "down", checked_at: 1 },
    { name: "Vite dev server", url: "http://localhost:5173/", port: 5173, status: "up", checked_at: 1 }] } });
  const loop = installDevLoop(h.window, { services, adapter, core, timers: createClock().timersApi, clock: () => 0 });
  const tab = h.addTab({ url: "http://localhost:5173/boards/7?q=1" });
  await flushMicrotasks();
  const pill = h.document.getElementById("axiosozo-env-pill");
  assert.equal(pill.querySelector(".axiosozo-env-pill-label").textContent, "web · local");
  const block = blockFor(h, "p_domo");
  assert.deepEqual(block.querySelector(".axiosozo-project-summary").querySelectorAll(".axiosozo-status-dot").map(d => d.getAttribute("data-status")),
    ["down", "up", "remote"], "desktop down (grey), web up (green), production never contacted");
  assert.deepEqual(block.querySelectorAll(".axiosozo-project-app").map(li => li.textContent), ["desktop", "web"]);
  pill.click();
  const menu = h.document.getElementById("axiosozo-env-menu");
  const items = menu.querySelectorAll("menuitem");
  assert.deepEqual(items.filter(i => i.hasAttribute("data-environment")).map(i => i.getAttribute("label")),
    ["web · local · localhost:5173", "web · production · domo.example"]);
  assert.deepEqual(items.filter(i => i.hasAttribute("data-open-url")).map(i => i.getAttribute("data-open-url")), ["http://localhost:1420"]);
  menu.dispatch("command", { target: items.find(i => i.getAttribute("data-environment") === "production") });
  assert.equal(h.opened.at(-1).url, "https://domo.example/boards/7?q=1");
  assert.equal(h.opened.at(-1).where, "current");
  menu.dispatch("command", { target: items.find(i => i.getAttribute("data-open-url")) });
  assert.deepEqual([h.opened.at(-1).url, h.opened.at(-1).where], ["http://localhost:1420/", "tab"]);
  assert.equal(loop.switchEnvironment("production"), "https://domo.example/boards/7?q=1", "implicit: the current app");
  assert.equal(tab.linkedBrowser.currentURI.spec, "http://localhost:5173/boards/7?q=1");
  loop.dispose();
});

test("the … row: secondary surfaces, Edit project… and Remove from space", async () => {
  const h = createFakeWindow();
  const adapter = createFakeAdapter({ elements: uuid => h.document.getElementById(uuid) });
  const p = project({ surfaces: [
    { name: "Repository", url: "https://github.com/acme/webapp", kind: "repository" },
    { name: "CI", url: "https://github.com/acme/webapp/actions", kind: "ci" },
    { name: "Vercel", url: "https://vercel.com/dashboard", kind: "hosting" }] });
  const services = createFakeServices(core, { projects: [p] });
  const settings = [];
  const loop = installDevLoop(h.window, { services, adapter, core, timers: createClock().timersApi, clock: () => 0,
    openSettings: (id, options) => settings.push([id, options]) });
  await flushMicrotasks();
  blockFor(h, p.id).querySelector(".axiosozo-project-toggle").click();
  await flushMicrotasks();
  const rows = rowsOf(blockFor(h, p.id));
  assert.deepEqual(rows.filter(b => b.getAttribute("data-kind") === "surface").map(b => b.querySelector(".axiosozo-project-link-label").textContent),
    ["Repository"], "only primary surfaces are rows");
  const more = rows.find(b => b.getAttribute("data-kind") === "more");
  assert.equal(more.getAttribute("aria-haspopup"), "menu");
  more.click();
  const menu = h.document.getElementById("axiosozo-project-more-menu");
  assert.equal(menu.openedWith, more);
  assert.equal(more.getAttribute("aria-expanded"), "true");
  const items = menu.querySelectorAll("menuitem");
  assert.deepEqual(items.map(i => i.getAttribute("label")),
    ["CI · github.com", "Vercel · vercel.com", "Edit project…", "Remove from space"]);
  menu.dispatch("command", { target: items[0] });
  assert.equal(h.opened.at(-1).url, "https://github.com/acme/webapp/actions");
  menu.dispatch("command", { target: items[2] });
  assert.deepEqual(settings, [[p.id, { edit: true }]]);
  menu.dispatch("command", { target: items[3] });
  await flushMicrotasks();
  assert.deepEqual(services.calls.updateProject, [[p.id, { context_uuid: null }]]);
  assert.equal(folders(h), null, "the project left this space");
  loop.dispose();
});

test("editing a project's environments re-links open tabs at once", async () => {
  const t = setup();
  const tab = t.h.addTab({ url: "http://localhost:5180/editor" });
  await flushMicrotasks();
  assert.equal(t.pill().hidden, true);
  t.services.projects = [{ ...t.project, manifest: { ...t.project.manifest,
    environments: [...t.project.manifest.environments, { name: "staging", base_url: "http://localhost:5180" }] } }];
  t.services.emit("projects");
  await flushMicrotasks();
  assert.equal(t.pill().hidden, false);
  assert.equal(t.pill().getAttribute("data-environment"), "staging");
  assert.ok(blockFor(t.h, t.project.id).hasAttribute("data-active"));
  assert.equal(tab.linkedBrowser.currentURI.spec, "http://localhost:5180/editor");
  t.loop.dispose();
});

test("service status refreshes only declared services on a bounded interval", async () => {
  const t = setup();
  await flushMicrotasks();
  const before = t.services.calls.serviceStatus;
  await t.clock.advance(30000);
  assert.equal(t.services.calls.serviceStatus, before + 1);
  // A "services" event right after a refresh is throttled (serviceStatus may emit it itself).
  t.services.emit("services");
  await flushMicrotasks();
  assert.equal(t.services.calls.serviceStatus, before + 1);
  t.h.document.hidden = true;
  await t.clock.advance(60000);
  assert.equal(t.services.calls.serviceStatus, before + 1, "no probing while the window is hidden");
  t.loop.dispose();
});

test("private windows get no project folders and never probe (M1)", async () => {
  const probes = [];
  const t = setup({ privateWindow: true });
  await flushMicrotasks();
  assert.equal(folders(t.h), null);
  const tab = t.h.addTab({ url: "http://localhost:5173/app" });
  await flushMicrotasks();
  assert.equal(t.pill().hidden, false, "the pill is local data only");
  t.services.emit("services");
  await t.clock.advance(10 * 60000);
  t.h.fail(tab, "http://localhost:5173/app");
  await flushMicrotasks();
  assert.equal(t.overlay(tab).getAttribute("data-mode"), "manual", "no polling in a private window");
  await t.clock.advance(10 * 60000);
  assert.equal(t.services.calls.serviceStatus, 0, "no status request from a private window");
  assert.equal(t.loop.diagnostics().probes, 0);
  t.loop.dispose();

  const injected = setup({ privateWindow: true, probe: async target => { probes.push(target); return true; } });
  const other = injected.h.addTab({ url: "about:blank" });
  injected.h.fail(other, "http://localhost:5173/");
  await injected.clock.advance(60000);
  assert.deepEqual(probes, [], "an injected probe is never called from a private window either");
  injected.loop.dispose();
});

test("contexts kill switch installs nothing", async () => {
  const t = setup({ prefs: { "axiosozo.contexts.enabled": false } });
  await flushMicrotasks();
  assert.equal(t.pill(), null);
  assert.equal(t.h.document.prolog.length, 0);
  assert.equal(t.h.progressListeners.size, 0);
});

test("waiting overlay appears only for a refused declared local origin", async () => {
  const t = setup();
  const tab = t.h.addTab({ url: "about:blank" });
  const other = t.h.addTab({ url: "about:blank", select: false });
  // Undeclared local port, remote project origin, other error: neterror unchanged.
  t.h.fail(tab, "http://localhost:3000/");
  t.h.fail(tab, "https://webapp.example/");
  t.h.fail(tab, "http://localhost:5173/", NS_ERROR_UNKNOWN_HOST);
  t.h.fail(tab, "http://127.0.0.1:5173/"); // same port, but a different origin than the declared one
  await flushMicrotasks();
  assert.equal(t.overlay(tab), null);
  t.h.fail(tab, "http://localhost:5173/app?x=1");
  await flushMicrotasks();
  const overlay = t.overlay(tab);
  assert.ok(overlay, "chrome-owned overlay in the tab's browser stack");
  assert.equal(overlay.parentNode, t.h.stackOf(tab));
  assert.equal(overlay.getAttribute("role"), "region");
  assert.equal(overlay.querySelector("h1").textContent, "Waiting for web on port 5173…");
  assert.equal(overlay.querySelector(".axiosozo-waiting-cancel").localName, "button");
  assert.equal(overlay.getAttribute("data-mode"), "polling");
  assert.equal(t.h.stackOf(tab).style.position, "relative");
  assert.equal(t.overlay(other), null, "other tabs untouched");
  t.loop.dispose();
  assert.equal(t.overlay(tab), null);
});

test("waiting polls the one declared port with backoff, then reloads once it answers", async () => {
  let status = "down";
  const t = setup({ statuses: () => [{ ...WEB, status, checked_at: 0 }] });
  const tab = t.h.addTab({ url: "about:blank" });
  await flushMicrotasks();
  const baseline = t.services.calls.serviceStatus;
  t.h.fail(tab, "http://localhost:5173/app");
  await flushMicrotasks();
  await t.clock.advance(WAIT_BACKOFF_MS[0] - 1);
  assert.equal(t.services.calls.serviceStatus, baseline, "first probe waits for the backoff");
  await t.clock.advance(1);
  assert.equal(t.services.calls.serviceStatus, baseline + 1);
  await t.clock.advance(WAIT_BACKOFF_MS[1]);
  assert.equal(t.services.calls.serviceStatus, baseline + 2);
  assert.equal(tab.linkedBrowser.reloads, 0);
  status = "up";
  await t.clock.advance(WAIT_BACKOFF_MS[2]);
  assert.equal(tab.linkedBrowser.reloads, 1, "reloads once the port answers");
  assert.equal(t.overlay(tab).getAttribute("data-mode"), "reloading");
  await t.clock.advance(60000);
  assert.equal(tab.linkedBrowser.reloads, 1, "no further polling while the reload is in flight");
  t.h.commit(tab, "http://localhost:5173/app");
  await flushMicrotasks();
  assert.equal(t.overlay(tab), null, "overlay removed when the page loads");
  assert.equal(t.h.stackOf(tab).style.position, "", "stack style restored");
  t.loop.dispose();
});

test("an injected probe receives exactly the refused origin and port", async () => {
  const probes = [];
  const t = setup({ probe: async target => { probes.push(target); return probes.length >= 2; } });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "http://localhost:5173/");
  await flushMicrotasks();
  await t.clock.advance(WAIT_BACKOFF_MS[0] + WAIT_BACKOFF_MS[1]);
  assert.deepEqual(probes, [{ url: "http://localhost:5173", port: 5173 }, { url: "http://localhost:5173", port: 5173 }]);
  assert.equal(tab.linkedBrowser.reloads, 1);
  t.loop.dispose();
});

test("polling stops on cancel, tab close, navigation and after the bounded attempts", async () => {
  // Cancel: neterror is shown again and polling stops.
  let t = setup();
  let tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "http://localhost:5173/");
  await flushMicrotasks();
  t.overlay(tab).querySelector(".axiosozo-waiting-cancel").click();
  assert.equal(t.overlay(tab), null);
  let calls = t.services.calls.serviceStatus;
  await t.clock.advance(120000);
  assert.equal(t.services.calls.serviceStatus, calls + 4, "only the 30 s project refresh remains");
  t.h.fail(tab, "http://localhost:5173/");
  await flushMicrotasks();
  assert.equal(t.overlay(tab), null, "a cancelled wait does not come back for the same address");
  t.loop.dispose();

  // Tab close.
  t = setup({ statuses: [] });
  tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "http://localhost:5173/");
  await flushMicrotasks();
  assert.ok(t.overlay(tab));
  t.h.gBrowser.removeTab(tab);
  assert.equal(t.clock.timers.size, 1, "only the status refresh interval is left");
  t.loop.dispose();

  // Navigation elsewhere.
  t = setup();
  tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "http://localhost:5173/");
  await flushMicrotasks();
  t.h.commit(tab, "https://docs.example/");
  await flushMicrotasks();
  assert.equal(t.overlay(tab), null);
  assert.equal(t.clock.timers.size, 1);
  t.loop.dispose();

  // Bounded: after WAIT_MAX_ATTEMPTS probes the overlay stops and offers Try again.
  t = setup();
  tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "http://localhost:5173/");
  await flushMicrotasks();
  calls = t.services.calls.serviceStatus;
  await t.clock.advance(WAIT_MAX_ATTEMPTS * 10000 + 60000);
  const overlay = t.overlay(tab);
  assert.equal(overlay.getAttribute("data-mode"), "stopped");
  assert.equal(overlay.querySelector(".axiosozo-waiting-retry").hidden, false);
  const probes = t.services.calls.serviceStatus - calls;
  assert.ok(probes >= WAIT_MAX_ATTEMPTS && probes <= WAIT_MAX_ATTEMPTS + 20, `bounded probes (${probes})`);
  overlay.querySelector(".axiosozo-waiting-retry").click();
  assert.equal(overlay.getAttribute("data-mode"), "polling");
  t.loop.dispose();
  assert.equal(t.clock.timers.size, 0, "dispose clears every timer");
});

test("without a declared service or probe the overlay waits for a manual retry", async () => {
  const t = setup({ services: [] });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "http://localhost:5173/");
  await flushMicrotasks();
  const overlay = t.overlay(tab);
  assert.equal(overlay.getAttribute("data-mode"), "manual");
  assert.equal(overlay.querySelector("h1").textContent, "Waiting for Webapp local server on port 5173…");
  await t.clock.advance(120000);
  assert.equal(t.services.calls.serviceStatus, 0, "nothing is probed");
  overlay.querySelector(".axiosozo-waiting-retry").click();
  assert.equal(tab.linkedBrowser.reloads, 1);
  t.loop.dispose();
});

test("a reload that is refused again resumes waiting, bounded by reload failures", async () => {
  const t = setup({ statuses: [{ ...WEB, status: "up", checked_at: 0 }] });
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "http://localhost:5173/");
  await flushMicrotasks();
  for (let i = 1; i <= 3; i++) {
    await t.clock.advance(WAIT_BACKOFF_MS[0]);
    assert.equal(tab.linkedBrowser.reloads, i);
    t.h.fail(tab, "http://localhost:5173/");
    await flushMicrotasks();
  }
  assert.equal(t.overlay(tab).getAttribute("data-mode"), "stopped", "stops auto-reloading after repeated refusals");
  await t.clock.advance(60000);
  assert.equal(tab.linkedBrowser.reloads, 3);
  t.loop.dispose();
});

test("dispose removes every addition and listener", async () => {
  const t = setup();
  t.h.addTab({ url: "http://localhost:5173/" });
  await flushMicrotasks();
  assert.equal(t.h.document.prolog[0].data, `href="${RUNTIME_STYLESHEET}" type="text/css"`);
  t.loop.dispose();
  assert.equal(t.pill(), null);
  assert.equal(t.menu(), null);
  assert.equal(folders(t.h), null);
  assert.equal(t.h.progressListeners.size, 0);
  assert.equal(t.h.gBrowser.tabContainer.listenerCount(), 0);
  assert.equal(t.services.listenerCount(), 0);
  assert.equal(t.adapter.listenerCount(), 0);
  assert.equal(t.h.document.prolog.length, 0);
  assert.equal(t.clock.timers.size, 0);
});

test("web progress flag values match nsIWebProgressListener.idl", () => {
  // LOCATION_CHANGE_ERROR_PAGE was 0x4 (that is LOCATION_CHANGE_RELOAD), so real
  // error pages were not recognized and reloads were (H3 GUI run).
  assert.equal(WPL.LOCATION_CHANGE_SAME_DOCUMENT, 0x1);
  assert.equal(WPL.LOCATION_CHANGE_ERROR_PAGE, 0x2);
  assert.equal(WPL.LOCATION_CHANGE_RELOAD, 0x4);
  assert.equal(WPL.STATE_START, 0x1);
  assert.equal(WPL.STATE_STOP, 0x10);
  assert.equal(WPL.STATE_IS_WINDOW, 0x80000);
});

test("waiting overlay appears on a fresh navigation whose error page commits after the refusal", async () => {
  // Real order: STATE_STOP (refused) while currentURI is still the previous page,
  // then the error page location change. The overlay must appear and survive it.
  const t = setup();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.commit(tab, "http://localhost:5174/elsewhere");
  await flushMicrotasks();
  const commitErrorPage = t.h.failBeforeLocation(tab, "http://localhost:5173/app/wait?y=2#w");
  await flushMicrotasks();
  assert.ok(t.overlay(tab), "overlay shown although currentURI still showed the previous page");
  commitErrorPage();
  await flushMicrotasks();
  assert.ok(t.overlay(tab), "the error page location change keeps the overlay");
  assert.equal(t.overlay(tab).getAttribute("data-mode"), "polling");
  t.loop.dispose();
});

test("a newer load that starts before the refusal is handled leaves neterror alone", async () => {
  const t = setup();
  const tab = t.h.addTab({ url: "about:blank" });
  await flushMicrotasks();
  t.h.failBeforeLocation(tab, "http://localhost:5173/app");
  // The user navigates elsewhere before onRefused finished its lookup.
  t.h.commit(tab, "https://unrelated.example/");
  await flushMicrotasks();
  assert.equal(t.overlay(tab), null);
  t.loop.dispose();
});
