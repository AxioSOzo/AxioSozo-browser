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
// Project links that need a new tab go to services.openProjectUrl (the
// container router); this fake records them.
function routed(services) {
  services.calls.openProjectUrl = [];
  services.openProjectUrl = async args => { services.calls.openProjectUrl.push(args); return { opened: true, container: "project" }; };
  return services;
}
function setup({ privateWindow = false, statuses = null, contexts = null, probe = null, services: serviceList = [WEB], prefs = {} } = {}) {
  const h = createFakeWindow({ privateWindow, prefs });
  // The real adapter resolves Zen's <zen-workspace id=uuid>; DevLoop never looks it up itself.
  const adapter = createFakeAdapter({ privateWindow, elements: uuid => h.document.getElementById(uuid) });
  const p = project({ services: serviceList });
  const services = routed(createFakeServices(core, {
    projects: [p],
    contexts: contexts ?? [context(WORKSPACE_A, "project", { project_id: p.id }), context(WORKSPACE_B, "personal")],
    statuses: { [p.id]: statuses ?? [{ ...WEB, status: "down", checked_at: 0 }] },
  }));
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
  await flushMicrotasks();
  assert.deepEqual(t.services.calls.openProjectUrl.map(c => [c.window === t.h.window, c.projectId, c.url, c.contextUuid]),
    [[true, t.project.id, "https://preview.webapp.example/", WORKSPACE_A]], "no open preview tab: a new one, routed by the service");
  assert.equal(t.h.opened.length, 0, "the runtime never creates a project tab itself");
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
  const services = routed(createFakeServices(core, { projects: [domo], statuses: { p_domo: [
    { name: "Tauri dev server", url: "http://localhost:1420/", port: 1420, status: "down", checked_at: 1 },
    { name: "Vite dev server", url: "http://localhost:5173/", port: 5173, status: "up", checked_at: 1 }] } }));
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
  await flushMicrotasks();
  assert.deepEqual(services.calls.openProjectUrl.map(c => [c.projectId, c.url]), [["p_domo", "http://localhost:1420/"]],
    "another app of the project opens as a routed project link");
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
  const services = routed(createFakeServices(core, { projects: [p] }));
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
  await flushMicrotasks();
  assert.equal(services.calls.openProjectUrl.at(-1).url, "https://github.com/acme/webapp/actions");
  menu.dispatch("command", { target: items[2] });
  assert.deepEqual(settings, [[p.id, { edit: true }]]);
  menu.dispatch("command", { target: items[3] });
  await flushMicrotasks();
  assert.deepEqual(services.calls.updateProject, [[p.id, { context_uuid: null }]]);
  assert.equal(folders(h), null, "the project left this space");
  loop.dispose();
});

// ---- P2: project containers in the runtime ---------------------------------------------
// A v2 project whose own container is 40; the adapter reports Firefox's identities
// and each tab's loaded container. Synthetic: no cookie, account or real tab.
const IDENTITIES = { 40: { userContextId: 40, name: "Webapp", color: "cyan", icon: "briefcase" },
  7: { userContextId: 7, name: "Personal", color: "orange", icon: "fingerprint" } };
function containerSetup({ privateWindow = false, container = 40, containers = true } = {}) {
  const h = createFakeWindow({ privateWindow, prefs: { "privacy.userContext.enabled": containers } });
  const adapter = Object.assign(createFakeAdapter({ privateWindow, elements: uuid => h.document.getElementById(uuid) }), {
    containerForWorkspace: uuid => (uuid === WORKSPACE_B ? 2 : 0),
    containerIdentity: id => IDENTITIES[id] ?? null,
    tabUserContextId: tab => tab.userContextId,
  });
  const p = core.validateProject({ ...core.upgradeProject(project({ services: [WEB] })), container: { user_context_id: container } });
  const services = routed(createFakeServices(core, { projects: [p], statuses: { [p.id]: [{ ...WEB, status: "up", checked_at: 0 }] } }));
  const loop = installDevLoop(h.window, { services, adapter, core, timers: createClock().timersApi, clock: () => 0 });
  return { h, adapter, services, loop, project: p,
    pill: () => h.document.getElementById("axiosozo-env-pill"), menu: () => h.document.getElementById("axiosozo-env-menu"),
    mark: () => h.document.getElementById("axiosozo-env-pill").querySelector(".axiosozo-env-pill-container") };
}

test("P2 pill: a tab in the project's container shows Firefox's own colour and names the container", async () => {
  const t = containerSetup();
  t.h.addTab({ url: "http://localhost:5173/app", userContextId: 40 });
  await flushMicrotasks();
  assert.equal(t.mark().hidden, false);
  assert.deepEqual(t.mark().className.split(" "), ["axiosozo-status-dot", "axiosozo-env-pill-container", "identity-color-cyan"]);
  assert.deepEqual(Object.keys(t.mark().style), [], "colour comes from the stylesheet, not inline style");
  assert.equal(t.mark().getAttribute("aria-hidden"), "true", "the colour is decorative; the label says it");
  assert.equal(t.pill().getAttribute("data-container"), "fits");
  assert.equal(t.pill().getAttribute("aria-label"), "Webapp: local environment, in the Webapp container. Switch environment");
  t.pill().click();
  const items = t.menu().querySelectorAll("menuitem");
  assert.deepEqual([items[1].getAttribute("label"), items[1].getAttribute("disabled"), items[1].getAttribute("class"), items[1].getAttribute("data-usercontextid")],
    ["In the Webapp container", "true", "menuitem-iconic identity-icon-briefcase identity-color-cyan", "40"], "Firefox's container menu icon");
  assert.equal(t.menu().querySelector("[data-reopen]"), null);
  assert.equal(t.loop.diagnostics().pillContainer, "fits");
  const glyph = t.h.document.getElementById("axiosozo-project-folders").querySelector(".axiosozo-project-glyph");
  assert.ok(glyph.classList.contains("identity-color-cyan"), "the project block takes its container's colour");
  assert.deepEqual(Object.keys(glyph.style), []);
  t.loop.dispose();
});

test("P2 runtime stylesheet: Firefox's container colour paints the marks; a hidden pill mark stays hidden", () => {
  const css = readFileSync(new URL("../chrome/axiosozo-runtime.css", import.meta.url), "utf8");
  // .axiosozo-status-dot sets display: inline-block, which would beat the UA [hidden] rule.
  assert.match(css, /#axiosozo-env-pill \.axiosozo-env-pill-container\[hidden\] \{ display: none; \}/u);
  assert.match(css, /#axiosozo-env-pill \.axiosozo-env-pill-container\[class\*="identity-color-"\] \{\s*background: var\(--identity-icon-color\);\s*border-color: transparent;\s*\}/u);
  assert.match(css, /\.axiosozo-project-glyph\[class\*="identity-color-"\] \{ fill: var\(--identity-icon-color\); fill-opacity: 1; \}/u);
  assert.doesNotMatch(css, /#[0-9a-f]{6}\b[^}]*identity/iu, "no copied container colours");
});

test("P2 pill: a project URL in another container is marked and offers a visible reopen; the tab is never reloaded", async () => {
  const t = containerSetup();
  const tab = t.h.addTab({ url: "http://localhost:5173/app?x=1#y", userContextId: 0 });
  await flushMicrotasks();
  assert.equal(t.mark().hidden, false);
  assert.deepEqual(t.mark().className.split(" "), ["axiosozo-status-dot", "axiosozo-env-pill-container"], "a ring: no container");
  assert.equal(t.pill().getAttribute("data-container"), "elsewhere");
  assert.match(t.pill().getAttribute("aria-label"), /^Webapp: local environment, not in the Webapp container\. Switch environment$/u);
  t.pill().click();
  const reopen = t.menu().querySelector("[data-reopen]");
  assert.equal(reopen.getAttribute("label"), "Reopen in the Webapp container");
  assert.equal(reopen.getAttribute("class"), "menuitem-iconic identity-icon-briefcase identity-color-cyan");
  t.menu().dispatch("command", { target: reopen });
  await flushMicrotasks();
  assert.deepEqual(t.services.calls.openProjectUrl.map(call => [call.projectId, call.url, call.contextUuid]),
    [[t.project.id, "http://localhost:5173/app?x=1#y", WORKSPACE_A]], "a new tab through the router");
  assert.deepEqual([tab.linkedBrowser.reloads, t.h.opened.length, tab.linkedBrowser.currentURI.spec], [0, 0, "http://localhost:5173/app?x=1#y"],
    "the old tab, its page and its cookies stay as they are");
  // A tab in some other container shows that container's colour.
  t.h.addTab({ url: "http://localhost:5173/other", userContextId: 7 });
  await flushMicrotasks();
  assert.ok(t.mark().classList.contains("identity-color-orange"));
  assert.equal(t.pill().getAttribute("data-container"), "elsewhere");
  t.loop.dispose();
});

test("P2: an environment switch stays in place only inside the right container; otherwise a routed new tab", async () => {
  const t = containerSetup();
  t.h.addTab({ url: "http://localhost:5173/a", userContextId: 40 });
  await flushMicrotasks();
  assert.equal(t.loop.switchEnvironment("production"), "https://webapp.example/a");
  assert.deepEqual(t.h.opened.map(o => [o.url, o.where, o.options.triggeringPrincipal.originAttributes.userContextId]),
    [["https://webapp.example/a", "current", 40]], "same container: in place, null principal in that container");
  t.h.addTab({ url: "http://localhost:5173/b", userContextId: 0 });
  await flushMicrotasks();
  assert.equal(t.loop.switchEnvironment("production"), "https://webapp.example/b");
  await flushMicrotasks();
  assert.equal(t.h.opened.length, 1, "never loaded into the default container's jar");
  assert.equal(t.services.calls.openProjectUrl.at(-1).url, "https://webapp.example/b");
  t.loop.dispose();
});

test("P2: the project block reuses only a tab that already has the link's container", async () => {
  const t = containerSetup();
  const wrong = t.h.addTab({ url: "http://localhost:5173/x", userContextId: 0 });
  t.h.addTab({ url: "https://docs.example/" });
  await flushMicrotasks();
  const row = label => rowsOf(blockFor(t.h, t.project.id)).find(button => button.getAttribute("aria-label").startsWith(`${label},`));
  row("local").click();
  await flushMicrotasks();
  assert.notEqual(t.h.gBrowser.selectedTab, wrong);
  assert.deepEqual(t.services.calls.openProjectUrl.map(call => call.url), ["http://localhost:5173/"]);
  const right = t.h.addTab({ url: "http://localhost:5173/y", userContextId: 40, select: false });
  await flushMicrotasks();
  row("local").click();
  assert.equal(t.h.gBrowser.selectedTab, right);
  assert.equal(t.services.calls.openProjectUrl.length, 1);
  t.loop.dispose();
});

test("P2: a project without its container yet offers to open it there; containers off and private windows stay as before", async () => {
  const pending = containerSetup({ container: null });
  pending.h.addTab({ url: "http://localhost:5173/", userContextId: 0 });
  await flushMicrotasks();
  assert.equal(pending.pill().getAttribute("data-container"), "elsewhere");
  pending.pill().click();
  const offer = pending.menu().querySelector("[data-reopen]");
  assert.deepEqual([offer.getAttribute("label"), offer.getAttribute("class")], ["Open in Webapp's own container", null]);
  pending.menu().dispatch("command", { target: offer });
  await flushMicrotasks();
  assert.equal(pending.services.calls.openProjectUrl.length, 1);
  pending.loop.dispose();

  const off = containerSetup({ containers: false });
  off.h.addTab({ url: "http://localhost:5173/a", userContextId: 0 });
  await flushMicrotasks();
  assert.equal(off.mark().hidden, true);
  assert.equal(off.pill().hasAttribute("data-container"), false);
  off.loop.switchEnvironment("production");
  assert.deepEqual(off.h.opened.map(o => o.where), ["current"], "containers off: in place, like before");
  off.loop.dispose();

  const priv = containerSetup({ privateWindow: true });
  priv.h.addTab({ url: "http://localhost:5173/a", userContextId: 0 });
  await flushMicrotasks();
  assert.equal(priv.mark().hidden, true);
  assert.equal(priv.pill().getAttribute("aria-label"), "Webapp: local environment. Switch environment");
  priv.loop.switchEnvironment("production");
  await flushMicrotasks();
  assert.deepEqual(priv.h.opened.map(o => o.where), ["current"]);
  assert.equal(priv.services.calls.openProjectUrl.length, 0, "private windows never route through project containers");
  priv.loop.dispose();
});

// ---- P2: menus act only for what they showed ------------------------------------------
// Alpha (own container 40) shares github.com with the space (default container
// 0) and has a CI surface there; Beta (own container 41) lives on another port.
const ALPHA_ID = "p_alpha1";
const BETA_ID = "p_beta1";
function alphaBeta({ shared = true } = {}) {
  const h = createFakeWindow({ prefs: { "privacy.userContext.enabled": true } });
  const identities = { ...IDENTITIES, 41: { userContextId: 41, name: "Beta", color: "orange", icon: "briefcase" } };
  const adapter = Object.assign(createFakeAdapter({ elements: uuid => h.document.getElementById(uuid) }), {
    containerForWorkspace: uuid => (uuid === WORKSPACE_B ? 2 : 0),
    containerIdentity: id => identities[id] ?? null,
    tabUserContextId: tab => tab.userContextId,
  });
  const alpha = (over = {}) => core.validateProject({ ...core.upgradeProject(project({ id: ALPHA_ID, name: "Alpha",
    environments: [{ name: "local", base_url: "http://localhost:5101" }, { name: "production", base_url: "https://alpha.example" }],
    surfaces: [{ name: "Repository", url: "https://github.com/acme/alpha", kind: "repository" },
      { name: "CI", url: "https://github.com/acme/alpha/actions", kind: "ci" }] })),
  container: { user_context_id: 40 }, shared_sites: { hosts: ["github.com"], confirmed: shared }, ...over });
  const beta = core.validateProject({ ...core.upgradeProject(project({ id: BETA_ID, name: "Beta",
    environments: [{ name: "local", base_url: "http://localhost:5102" }, { name: "production", base_url: "https://beta.example" }] })),
  container: { user_context_id: 41 } });
  const services = routed(createFakeServices(core, { projects: [alpha(), beta] }));
  const loop = installDevLoop(h.window, { services, adapter, core, timers: createClock().timersApi, clock: () => 0 });
  const replace = async list => { services.projects = list; services.emit("projects"); await flushMicrotasks(); };
  return { h, services, loop, alpha, beta, replace,
    pill: () => h.document.getElementById("axiosozo-env-pill"), menu: () => h.document.getElementById("axiosozo-env-menu"),
    more: () => h.document.getElementById("axiosozo-project-more-menu"),
    item: (popup, predicate) => popup.querySelectorAll("menuitem").find(predicate) };
}
const nothingHappened = (t, before) => {
  assert.equal(t.services.calls.openProjectUrl.length, 0, "no project link was routed");
  assert.equal(t.h.opened.length, 0, "no page was loaded in any tab");
  assert.equal(t.h.gBrowser.selectedTab, before, "no other tab was selected");
};

test("P2 menus: a pill menu shown for Alpha does nothing after another tab is selected", async () => {
  const t = alphaBeta();
  const alphaTab = t.h.addTab({ url: "http://localhost:5101/a", userContextId: 0 });
  await flushMicrotasks();
  t.pill().click();
  const reopen = t.item(t.menu(), item => item.hasAttribute("data-reopen"));
  const production = t.item(t.menu(), item => item.getAttribute("data-environment") === "production");
  assert.ok(reopen && production);
  const betaTab = t.h.addTab({ url: "http://localhost:5102/b", userContextId: 41 });
  await flushMicrotasks();
  assert.equal(t.menu().state, "closed", "the stale menu was closed");
  t.menu().dispatch("command", { target: reopen });
  t.menu().dispatch("command", { target: production });
  await flushMicrotasks();
  nothingHappened(t, betaTab);
  assert.equal(betaTab.linkedBrowser.currentURI.spec, "http://localhost:5102/b", "Beta's tab never got Alpha's switch");
  assert.equal(alphaTab.linkedBrowser.currentURI.spec, "http://localhost:5101/a");
  t.loop.dispose();
});

test("P2 menus: a pill menu does nothing after its tab navigated, closed another tab, or the window's runtime went away", async () => {
  const t = alphaBeta();
  const tab = t.h.addTab({ url: "http://localhost:5101/a", userContextId: 40 });
  await flushMicrotasks();
  t.pill().click();
  let production = t.item(t.menu(), item => item.getAttribute("data-environment") === "production");
  t.h.commit(tab, "http://localhost:5102/elsewhere");
  await flushMicrotasks();
  t.menu().dispatch("command", { target: production });
  await flushMicrotasks();
  nothingHappened(t, tab);
  assert.equal(tab.linkedBrowser.currentURI.spec, "http://localhost:5102/elsewhere");
  // Closing a tab makes the shown menu stale too.
  t.h.commit(tab, "http://localhost:5101/a");
  await flushMicrotasks();
  t.pill().click();
  production = t.item(t.menu(), item => item.getAttribute("data-environment") === "production");
  const spare = t.h.addTab({ url: "https://news.example/", select: false });
  t.h.gBrowser.removeTab(spare);
  t.menu().dispatch("command", { target: production });
  await flushMicrotasks();
  nothingHappened(t, tab);
  // A fresh menu acts.
  t.pill().click();
  t.menu().dispatch("command", { target: t.item(t.menu(), item => item.getAttribute("data-environment") === "production") });
  assert.deepEqual(t.h.opened.map(o => [o.url, o.where]), [["https://alpha.example/a", "current"]]);
  // After dispose nothing listens any more.
  t.pill().click();
  production = t.item(t.menu(), item => item.getAttribute("data-environment") === "production");
  const menu = t.menu();
  t.loop.dispose();
  menu.dispatch("command", { target: production });
  assert.equal(t.h.opened.length, 1);
});

// pushState, replaceState and fragment changes keep the document but change
// the address the pill's actions are bound to.
const OLD_ADDRESS = "http://localhost:5101/a?old=1#old";
const NEW_ADDRESS = "http://localhost:5101/b?new=2#new";
const pillItem = (t, action) => t.item(t.menu(), item => (action === "reopen" ? item.hasAttribute("data-reopen")
  : item.getAttribute("data-environment") === "production"));
const actedOn = t => ({ opened: t.h.opened.map(o => [o.url, o.where]), routed: t.services.calls.openProjectUrl.map(call => [call.projectId, call.url]) });

for (const action of ["production", "reopen"]) {
  // Production switches in place inside Alpha's container (40); Reopen is offered in the default one (0).
  const container = action === "reopen" ? 0 : 40;
  const fresh = action === "reopen" ? { opened: [], routed: [[ALPHA_ID, NEW_ADDRESS]] }
    : { opened: [["https://alpha.example/b?new=2#new", "current"]], routed: [] };

  test(`P2 menus: ${action} shown before a same-document address change does nothing; a fresh one keeps the new route`, async () => {
    const t = alphaBeta();
    const tab = t.h.addTab({ url: OLD_ADDRESS, userContextId: container });
    await flushMicrotasks();
    t.pill().click();
    const stale = pillItem(t, action);
    assert.ok(stale);
    t.h.sameDocument(tab, NEW_ADDRESS);
    await flushMicrotasks();
    assert.equal(t.menu().state, "closed", "the menu bound to the old address closed");
    t.menu().dispatch("command", { target: stale });
    await flushMicrotasks();
    nothingHappened(t, tab);
    assert.equal(tab.linkedBrowser.currentURI.spec, NEW_ADDRESS);
    t.pill().click();
    t.menu().dispatch("command", { target: pillItem(t, action) });
    await flushMicrotasks();
    assert.deepEqual(actedOn(t), fresh, "path, query and fragment of the current route are kept");
    t.loop.dispose();
  });

  test(`P2 menus: ${action} checks the tab's live address even before its location notification arrives`, async () => {
    const t = alphaBeta();
    const tab = t.h.addTab({ url: OLD_ADDRESS, userContextId: container });
    await flushMicrotasks();
    t.pill().click();
    const stale = pillItem(t, action);
    tab.linkedBrowser.currentURI = { spec: NEW_ADDRESS }; // moved on; no progress notification yet
    t.menu().dispatch("command", { target: stale });
    await flushMicrotasks();
    nothingHappened(t, tab);
    assert.equal(t.loop.switchEnvironment("production"), null, "no switch from an address the tab has left");
    assert.deepEqual(t.h.opened, []);
    // Opening the menu again shows it for the address the tab has now.
    t.pill().click();
    await flushMicrotasks();
    assert.equal(t.menu().state, "open");
    t.menu().dispatch("command", { target: pillItem(t, action) });
    await flushMicrotasks();
    assert.deepEqual(actedOn(t), fresh);
    t.loop.dispose();
  });
}

test("P2 menus: a same-document change of a background tab leaves the selected tab's menu alone", async () => {
  const t = alphaBeta();
  const background = t.h.addTab({ url: "http://localhost:5102/b?x=1", userContextId: 41, select: false });
  const tab = t.h.addTab({ url: OLD_ADDRESS, userContextId: 40 });
  await flushMicrotasks();
  t.pill().click();
  const production = pillItem(t, "production");
  t.h.sameDocument(background, "http://localhost:5102/b?x=2#y");
  await flushMicrotasks();
  assert.equal(t.menu().state, "open");
  t.menu().dispatch("command", { target: production });
  assert.deepEqual(actedOn(t), { opened: [["https://alpha.example/a?old=1#old", "current"]], routed: [] });
  assert.equal(t.h.gBrowser.selectedTab, tab);
  t.loop.dispose();
});

test("same-document notifications keep a connection-refusal wait as it was", async () => {
  const t = setup();
  const tab = t.h.addTab({ url: "about:blank" });
  t.h.fail(tab, "http://localhost:5173/app");
  await flushMicrotasks();
  const overlay = t.overlay(tab);
  assert.equal(overlay?.getAttribute("data-mode"), "polling");
  t.h.sameDocument(tab, "http://localhost:5173/app#retry");
  await flushMicrotasks();
  assert.equal(t.overlay(tab), overlay, "the wait over the same document stays");
  assert.equal(overlay.getAttribute("data-mode"), "polling");
  // A real navigation still ends it, as before.
  t.h.commit(tab, "https://docs.example/");
  await flushMicrotasks();
  assert.equal(t.overlay(tab), null);
  t.loop.dispose();
});

test("P2 menus: a More menu shown while sharing was on cannot reuse the space's tab after sharing is revoked", async () => {
  const t = alphaBeta();
  const shared = t.h.addTab({ url: "https://github.com/acme/alpha/actions/runs/1", userContextId: 0, select: false });
  const start = t.h.addTab({ url: "http://localhost:5101/a", userContextId: 40 });
  await flushMicrotasks();
  const openMore = () => {
    rowsOf(blockFor(t.h, ALPHA_ID)).find(button => button.getAttribute("data-kind") === "more").click();
    return t.item(t.more(), item => item.getAttribute("data-url") === "https://github.com/acme/alpha/actions");
  };
  // Control: with sharing confirmed, the open tab in the space's container fits.
  t.more().dispatch("command", { target: openMore() });
  assert.equal(t.h.gBrowser.selectedTab, shared);
  t.h.select(start);
  await flushMicrotasks();
  const stale = openMore();
  await t.replace([t.alpha({ shared_sites: { hosts: ["github.com"], confirmed: false } }), t.beta]);
  assert.equal(t.more().state, "closed");
  t.more().dispatch("command", { target: stale });
  await flushMicrotasks();
  nothingHappened(t, start);
  // A menu shown now decides by the current record: Alpha's own container, a new routed tab.
  t.more().dispatch("command", { target: openMore() });
  await flushMicrotasks();
  assert.equal(t.h.gBrowser.selectedTab, start, "the space's tab is not reused");
  assert.deepEqual(t.services.calls.openProjectUrl.map(call => [call.projectId, call.url]), [[ALPHA_ID, "https://github.com/acme/alpha/actions"]]);
  t.loop.dispose();
});

test("P2 menus: deletion or a new container mapping makes a shown More menu stale", async () => {
  for (const change of [t => [t.beta], t => [t.alpha({ container: { user_context_id: 42 } }), t.beta]]) {
    const t = alphaBeta();
    t.h.addTab({ url: "https://github.com/acme/alpha/actions/runs/1", userContextId: 0, select: false });
    const start = t.h.addTab({ url: "http://localhost:5101/a", userContextId: 40 });
    await flushMicrotasks();
    rowsOf(blockFor(t.h, ALPHA_ID)).find(button => button.getAttribute("data-kind") === "more").click();
    const surface = t.item(t.more(), item => item.getAttribute("data-url"));
    const remove = t.item(t.more(), item => item.getAttribute("data-action") === "remove");
    await t.replace(change(t));
    t.more().dispatch("command", { target: surface });
    t.more().dispatch("command", { target: remove });
    await flushMicrotasks();
    nothingHappened(t, start);
    assert.deepEqual(t.services.calls.updateProject, [], "no stale removal from the space");
    t.loop.dispose();
  }
});

test("P2: a project row kept from before a model change decides by the current record", async () => {
  const t = alphaBeta();
  const shared = t.h.addTab({ url: "https://github.com/acme/alpha/issues", userContextId: 0, select: false });
  const start = t.h.addTab({ url: "http://localhost:5101/a", userContextId: 40 });
  await flushMicrotasks();
  const repository = () => rowsOf(blockFor(t.h, ALPHA_ID)).find(button => button.getAttribute("aria-label").startsWith("Repository,"));
  const old = repository();
  old.click();
  assert.equal(t.h.gBrowser.selectedTab, shared, "control: sharing confirmed, the space's tab fits");
  t.h.select(start);
  await t.replace([t.alpha({ shared_sites: { hosts: ["github.com"], confirmed: false } }), t.beta]);
  assert.notEqual(repository(), old, "the block was rendered again");
  old.click();
  await flushMicrotasks();
  assert.equal(t.h.gBrowser.selectedTab, start, "the default-container tab is not reused after sharing was revoked");
  assert.deepEqual(t.services.calls.openProjectUrl.map(call => call.url), ["https://github.com/acme/alpha"]);
  await t.replace([t.beta]);
  old.click();
  await flushMicrotasks();
  assert.equal(t.services.calls.openProjectUrl.length, 1, "a deleted project's row does nothing");
  t.loop.dispose();
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
  t.h.fail(tab, "http://0.0.0.0:5173/"); // not a loopback alias of the declared origin
  t.h.fail(tab, "http://127.0.0.1:3000/"); // loopback alias, but an undeclared port
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

test("a typed loopback alias of the declared local origin waits too (it is linked to the project)", async () => {
  const t = setup();
  const tab = t.h.addTab({ url: "about:blank" });
  await flushMicrotasks();
  t.h.fail(tab, "http://127.0.0.1:5173/x");
  await flushMicrotasks();
  const overlay = t.overlay(tab);
  assert.ok(overlay, "127.0.0.1 is the same host as the declared localhost for linking and waiting");
  assert.equal(overlay.querySelector(".axiosozo-waiting-url").textContent, "127.0.0.1:5173/x");
  assert.equal(overlay.getAttribute("data-mode"), "polling");
  t.loop.dispose();
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

test("console errors (step 7): a small count beside the project's summary, said in words; the console event redraws it, keeping expansion and focus", async () => {
  const h = createFakeWindow();
  const adapter = createFakeAdapter({ elements: uuid => h.document.getElementById(uuid) });
  const p = project({ services: [WEB] });
  const other = project({ id: "p_other", name: "Other", environments: [{ name: "local", base_url: "http://localhost:4000" }] });
  const services = createFakeServices(core, { projects: [p, other], statuses: { [p.id]: [{ ...WEB, status: "up", checked_at: 1 }] } });
  let counts = [{ project_id: p.id, count: 3, errors: 2, warnings: 1, tabs: 1 }];
  const reads = [];
  const consoleErrors = { readCounts: args => { reads.push(args); if (counts instanceof Error) throw counts; return counts; } };
  const loop = installDevLoop(h.window, { services, adapter, core, timers: createClock().timersApi, clock: () => 0, consoleErrors });
  await flushMicrotasks();
  const badgeOf = id => blockFor(h, id)?.querySelector(".axiosozo-project-console") ?? null;
  const badge = badgeOf(p.id);
  assert.deepEqual([badge.textContent, badge.getAttribute("aria-hidden"), badge.getAttribute("data-level"), badge.getAttribute("title")],
    ["3", "true", "error", "2 console errors and 1 warning"]);
  assert.equal(badge.previousElementSibling.className, "axiosozo-project-summary", "right beside the summary dots");
  assert.match(blockFor(h, p.id).querySelector(".axiosozo-project-toggle").getAttribute("aria-label"),
    /^Webapp, 2 console errors and 1 warning, 1 of 1 local server running, production not checked\. Expand project$/u);
  assert.equal(badgeOf(other.id), null, "no messages, no count");
  assert.ok(reads.length > 0 && reads.every(args => args.window === h.window && Object.keys(args).length === 1), "this window only");
  const readsBefore = reads.length;
  blockFor(h, p.id).querySelector(".axiosozo-project-toggle").click();
  await flushMicrotasks();
  assert.equal(reads.length, readsBefore, "redrawing the folders reads no counts; only the console event does");
  blockFor(h, p.id).querySelector(".axiosozo-project-toggle").focus();
  counts = [{ project_id: p.id, count: 120, errors: 0, warnings: 120, tabs: 2 }];
  services.emit("console");
  await flushMicrotasks();
  const toggle = blockFor(h, p.id).querySelector(".axiosozo-project-toggle");
  assert.deepEqual([toggle.getAttribute("aria-expanded"), h.document.activeElement === toggle], ["true", true], "expansion and focus kept");
  assert.deepEqual([badgeOf(p.id).textContent, badgeOf(p.id).getAttribute("data-level"), badgeOf(p.id).getAttribute("title")],
    ["99+", "warning", "120 console warnings"]);
  for (const next of [[], null, new Error("unavailable")]) {
    counts = next;
    services.emit("console");
    await flushMicrotasks();
    assert.equal(badgeOf(p.id), null, String(next));
  }
  loop.dispose();
  assert.equal(services.listenerCount(), 0);
});

test("console counts are never read in a private window, and without the console facade the sidebar is as before", async () => {
  const reads = [];
  const consoleErrors = { readCounts: () => { reads.push(1); return [{ project_id: "p_webapp", count: 1, errors: 1, warnings: 0, tabs: 1 }]; } };
  const h = createFakeWindow({ privateWindow: true });
  const adapter = createFakeAdapter({ privateWindow: true, elements: uuid => h.document.getElementById(uuid) });
  const services = createFakeServices(core, { projects: [project()] });
  const loop = installDevLoop(h.window, { services, adapter, core, timers: createClock().timersApi, clock: () => 0, consoleErrors });
  services.emit("console");
  await flushMicrotasks();
  assert.equal(reads.length, 0);
  loop.dispose();
  const t = setup();
  await flushMicrotasks();
  assert.equal(blockFor(t.h, t.project.id).querySelector(".axiosozo-project-console"), null);
  t.loop.dispose();
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
