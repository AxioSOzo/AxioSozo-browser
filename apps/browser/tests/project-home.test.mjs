/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 3: the project list and the project home (about:axiosozo#project=<id>).
// Runs the real page script on the real HTML in support/mini-dom.mjs with a
// fake window.AxioSozoOverview whose getProjectHome mirrors
// AxioSozoServices.projectHome (stored record without its container mapping).
// Fixtures are synthetic, shaped like a multi-app Bun monorepo and a web plus
// native desktop project; every name is invented. Not evidence of Gecko
// rendering, layout, light/dark appearance or VoiceOver.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Node, parseHtml, makeEvent } from "./support/mini-dom.mjs";

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const HOME = "{11111111-1111-4111-8111-111111111111}";
const WORK = "{33333333-3333-4333-8333-333333333333}";
let serial = 0;
const flush = async (rounds = 8) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// Identity checks on DOM nodes; assert.equal would print the whole node graph on failure.
const same = (actual, expected, message) => assert.ok(actual === expected, message ?? "not the expected node");

const HARBOR = {
  version: 2, id: "p_harbor1", root: "/Volumes/Synthetic/harbor-suite", manifest_state: "none", context_uuid: WORK, trusted: false,
  created_at: 1, updated_at: 2,
  manifest: { version: 2, name: "Harbor Suite", kind: "web",
    environments: [
      { app: "web", name: "production", base_url: "https://app.harborsuite.dev" },
      { app: "web", name: "local", base_url: "http://localhost:5173" },
      { app: "web", name: "preview", base_url: "https://preview.harborsuite.dev" },
      { app: "admin", name: "local", base_url: "http://localhost:5174" },
      { app: "desktop", name: "local", base_url: "http://localhost:1420" }],
    services: [
      { app: "web", name: "web dev server", url: "http://localhost:5173/", port: 5173 },
      { app: "admin", name: "admin dev server", url: "http://localhost:5174/", port: 5174 },
      { app: "desktop", name: "desktop dev server", url: "http://localhost:1420/", port: 1420 }],
    surfaces: [
      { name: "Repository", url: "https://github.com/synthetic-org/harbor-suite", kind: "repository" },
      { name: "Issues", url: "https://github.com/synthetic-org/harbor-suite/issues", kind: "issues" },
      { name: "Vercel (web)", url: "https://vercel.com/synthetic-org/harbor-web", kind: "hosting" }] },
  detected: { at: Date.UTC(2026, 9, 1, 12), integrations: [
    { id: "vercel", name: "Vercel", dashboard_url: "https://vercel.com/dashboard", sources: ["vercel.json"] },
    { id: "convex", name: "Convex", dashboard_url: "https://dashboard.convex.dev", sources: ["convex.json"] },
    { id: "clerk", name: "Clerk", dashboard_url: "https://dashboard.clerk.com", sources: ["package.json#dependencies"] }],
  platforms: [{ kind: "tauri", name: "Harbor Desktop", path: "apps/desktop", source: "apps/desktop/src-tauri/tauri.conf.json" },
    { kind: "ios", name: "HarborMobile", path: "apps/mobile/ios", source: "apps/mobile/ios" }],
  domains: [{ host: "app.harborsuite.dev", origin: "vercel_json", source: "vercel.json", confirmed: false },
    { host: "status.harborsuite.dev", origin: "docs", source: "docs/ops/domains.md", confirmed: false }],
  agents: { files: ["AGENTS.md", "CLAUDE.md"], dirs: [".claude", ".agent-worktrees"], worktrees: 3 } },
  container: { user_context_id: 41 }, shared_sites: { hosts: ["github.com", "*.github.com"], confirmed: false },
  accounts: [{ key: "vercel", label: "work Google" }], brief: null,
};
const INKLINE = {
  ...HARBOR, id: "p_inkline1", root: "/Volumes/Synthetic/inkline",
  manifest: { version: 1, name: "Inkline", kind: "desktop", environments: [{ name: "local", base_url: "http://localhost:4000" }],
    services: [{ name: "Dev server", url: "http://localhost:4000/", port: 4000 }], surfaces: [] },
  detected: null, container: { user_context_id: null }, accounts: [], shared_sites: { hosts: ["github.com"], confirmed: true },
};
const BRIEF = { version: 1, cli: "claude-code", generated_at: Date.UTC(2026, 9, 2), accepted: false, document: { version: 1,
  product: "A booking suite for small harbours, with a customer web app, an admin app and a desktop console.",
  apps: [{ name: "web", kind: "web", path: "apps/web", summary: "Customer bookings" }],
  domains: [{ host: "api.harborsuite.dev", purpose: "API" }], services: [{ name: "Convex", purpose: "backend" }],
  start: [{ label: "Web", command: "bun run dev --filter web", cwd: "apps/web" }], risks: ["Payments are not tested end to end."] } };

const READS = new Set(["getOverviewFlags", "activeContext", "listContexts", "listProjects", "listProjectContainers", "getProjectHome",
  "serviceStatus", "listRules", "getJevSettings", "usageSummary", "listOrphans", "needsAttention", "getJevKeyStatus"]);

async function loadPage({ hash = "#projects", projects = [HARBOR, INKLINE], handlers = {}, home = {} } = {}) {
  const document = parseHtml(HTML);
  const calls = [];
  const subscribers = [];
  const state = { projects: projects.map(project => structuredClone(project)) };
  const contexts = [
    { uuid: HOME, name: "Home", icon: "", type: "personal", organization_uuid: null, project_id: null, container: 0 },
    { uuid: WORK, name: "Work", icon: "", type: "organization", organization_uuid: null, project_id: null, container: 2, container_label: "Work" }];
  const containers = { p_harbor1: { state: "own", name: "Harbor Suite", color: "purple" }, p_inkline1: { state: "pending" } };
  const defaults = {
    getOverviewFlags: () => ({ contexts: true, enginePreferences: false, jevKeyEntry: true }),
    activeContext: () => ({ uuid: WORK }),
    listContexts: () => contexts,
    listProjects: () => state.projects,
    listProjectContainers: () => state.projects.map(project => ({ project_id: project.id, ...(containers[project.id] ?? { state: "pending" }) })),
    getProjectHome: ({ id }) => {
      const stored = state.projects.find(project => project.id === id);
      if (!stored) throw { code: "UNKNOWN_PROJECT", message: "UNKNOWN_PROJECT" };
      const { container: _mapping, ...project } = structuredClone(stored);
      const space = contexts.find(context => context.uuid === project.context_uuid);
      return { version: 1, project, space: space ? { uuid: space.uuid, name: space.name } : null,
        container: containers[id] ?? { state: "pending" }, agent_activity: null, console_errors: null, ...home };
    },
    serviceStatus: ({ projectId }) => (projectId === "p_harbor1" ? [
      { name: "web dev server", url: "http://localhost:5173/", port: 5173, status: "up", checked_at: 1 },
      { name: "admin dev server", url: "http://localhost:5174/", port: 5174, status: "down", checked_at: 1 },
      { name: "desktop dev server", url: "http://localhost:1420/", port: 1420, status: "unknown", checked_at: 1 }] : []),
    listRules: () => [], getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    usageSummary: () => [], listOrphans: () => [], needsAttention: () => [],
    getJevKeyStatus: () => ({ id: "jev", label: "Jev", state: "needs-key", state_label: "No key stored", detail: "No Jev key is stored.", key: "missing", key_entry_enabled: true }),
    openProjectUrl: () => ({ opened: true, container: "project", selected: true }),
  };
  const api = {
    async request(name, params) {
      calls.push([name, JSON.parse(JSON.stringify(params ?? {}))]);
      const handler = handlers[name] ?? defaults[name];
      if (!handler) throw { code: "UNKNOWN_METHOD", message: name };
      return handler(params ?? {}, state);
    },
    // Like AboutAxioSozoChild: subscribe returns unsubscribe. This fake keeps
    // delivering after unsubscribe, so the page's own lifetime guard is tested.
    subscribe(callback) { subscribers.push(callback); subscriptions.made++; return () => { subscriptions.ended++; }; },
  };
  const subscriptions = { made: 0, ended: 0 };
  const listeners = new Map();
  const location = { hash };
  Object.assign(globalThis, {
    document, Node, location,
    window: { AxioSozoOverview: api, addEventListener: (type, fn) => listeners.set(type, fn) },
    history: { replaceState: (_state, _title, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") },
  });
  await import(`../chrome/overview/about-axiosozo.mjs?home=${++serial}`);
  await flush();
  const navigate = async next => { location.hash = next; listeners.get("hashchange")?.(); await flush(); };
  const emit = async name => { for (const callback of subscribers) callback({ name }); await sleep(150); await flush(); };
  const $ = id => document.getElementById(id);
  const section = key => $("project-home").querySelector(`[data-section="${key}"]`);
  const button = (root, label) => root.querySelectorAll("button").find(node => node.getAttribute("aria-label") === label || node.textContent === label);
  // What the fake service would answer now (throws its refusal), and window events such as pagehide.
  const answer = id => defaults.getProjectHome({ id });
  const fire = async (type, event = {}) => { listeners.get(type)?.(event); await flush(); };
  // Synchronous delivery: a service event exactly between two page steps.
  const emitNow = name => { for (const callback of subscribers) callback({ name }); };
  return { document, calls, state, location, navigate, emit, emitNow, $, section, button, answer, fire, subscriptions };
}

const homeCalls = page => page.calls.filter(([name]) => name === "getProjectHome");

// getProjectHome answers held until the test settles them, in any order.
function heldHomes() {
  const queue = [];
  return {
    queue,
    handler: ({ id }) => new Promise((resolve, reject) => queue.push({ id, resolve, reject })),
    refuse: (index, code) => queue[index].reject({ code, message: code }),
  };
}
const statusChecks = (page, id = "p_harbor1") => page.calls.filter(([name, params]) => name === "serviceStatus" && params.projectId === id).length;

test("list: projects grouped under their Zen space; named cards link straight to their home", async () => {
  const page = await loadPage();
  const group = page.document.querySelector(".space-group");
  assert.equal(group.querySelector(".group-name").textContent, "Workthis window");
  assert.equal(group.querySelector(".group-meta").textContent, "2 projects in this space's sidebar");
  assert.equal(group.querySelector("ul.project-list").getAttribute("aria-labelledby"), group.querySelector("h3").id);
  const card = page.$("project-p_harbor1");
  assert.equal(card.getAttribute("aria-labelledby"), "project-title-p_harbor1");
  const link = card.querySelector("h4 a.project-link");
  assert.deepEqual([link.textContent, link.getAttribute("href")], ["Harbor Suite", "#project=p_harbor1"]);
  assert.equal(card.querySelector(".project-sub").textContent, "Web project/Volumes/Synthetic/harbor-suite");
  assert.deepEqual(card.querySelectorAll(".project-facts .fact").map(fact => fact.textContent),
    ["1 running, 1 not running, 1 could not be checked", "Apps: web, admin, desktop", "Services: Vercel, Convex, Clerk"]);
  assert.equal(card.querySelector(".fact").getAttribute("data-tone"), "warn", "one server down among running ones");
  assert.deepEqual(card.querySelector(".project-tile").className, "project-tile identity-color-purple");
  assert.equal(page.$("project-p_inkline1").querySelector(".project-tile").className, "project-tile", "no own container yet: a neutral tile");
  // Spaces without projects are a quiet row, with adding still one click away.
  assert.equal(page.document.querySelector(".other-spaces h3").textContent, "Spaces without projects");
  assert.deepEqual(page.document.querySelectorAll(".other-spaces .row-title").map(node => node.textContent), ["Home"]);
  assert.equal(homeCalls(page).length, 0, "the list never asks for a home");
});

test("route lifecycle: #project=<id> shows that home, another id replaces it, back returns focus to the card", async () => {
  const page = await loadPage();
  const checks = () => page.calls.filter(([name, params]) => name === "serviceStatus" && params.projectId === "p_harbor1").length;
  const before = checks();
  await page.navigate("#project=p_harbor1");
  assert.equal(page.$("projects-list").hidden, true);
  assert.equal(page.$("project-home").hidden, false);
  assert.deepEqual(homeCalls(page), [["getProjectHome", { id: "p_harbor1" }]], "the page names the project id only");
  assert.equal(checks(), before + 1, "opening a home checks its local servers once");
  assert.equal(page.$("home-title").textContent, "Harbor Suite");
  same(page.document.activeElement, page.$("home-title"), "focus lands on the home's title");
  assert.equal(page.$("project-home").getAttribute("aria-labelledby"), "home-title");
  assert.deepEqual(page.$("project-home").querySelectorAll(".crumbs a, .crumbs span").map(node => node.textContent), ["Projects", "/", "Harbor Suite"]);
  assert.equal(page.$("project-home").querySelector(".crumbs a").getAttribute("href"), "#projects");
  assert.equal(page.document.querySelector('.views a[aria-current="page"]').dataset.view, "projects", "a home is part of Projects");
  assert.equal(page.$("project-home").querySelector(".home-sub").textContent, "Web projectSpace: Work");
  assert.equal(page.$("project-home").querySelector(".home-folder").textContent, "/Volumes/Synthetic/harbor-suite");
  assert.deepEqual(page.$("project-home").querySelectorAll("section.home-section h3").map(h3 => h3.textContent),
    ["Environments and links", "Services and sign-ins", "Activity", "About this project"]);
  for (const section of page.$("project-home").querySelectorAll("section.home-section")) {
    assert.equal(page.$(section.getAttribute("aria-labelledby"))?.localName, "h3");
  }
  await page.navigate("#project=p_inkline1");
  assert.equal(page.$("home-title").textContent, "Inkline");
  assert.deepEqual(homeCalls(page).at(-1), ["getProjectHome", { id: "p_inkline1" }]);
  await page.navigate("#projects");
  assert.equal(page.$("projects-list").hidden, false);
  assert.equal(page.$("project-home").hidden, true);
  assert.equal(page.$("project-home").children.length, 0);
  same(page.document.activeElement, page.$("project-p_inkline1").querySelector("a.project-link"), "back: focus returns to the card");
  // Other views and old hashes keep working.
  await page.navigate("#rules");
  assert.equal(page.$("view-projects").hidden, true);
  await page.navigate("#home");
  assert.equal(page.location.hash, "#projects");
  assert.equal(page.$("projects-list").hidden, false);
});

test("unknown, malformed, removed and private: a calm way back, never a path, a container or another project", async () => {
  const unknown = await loadPage({ hash: "#project=p_gone1" });
  const problem = unknown.$("project-home").querySelector(".home-problem");
  assert.equal(problem.querySelector("h2").textContent, "This project is not here anymore");
  assert.equal(problem.querySelector("a").getAttribute("href"), "#projects");
  assert.doesNotMatch(unknown.$("project-home").textContent, /\/Volumes|Harbor|Inkline|user_context|\bnull\b|undefined/u);

  const malformed = await loadPage({ hash: "#project=..%2F..%2Fetc" });
  assert.equal(malformed.$("projects-list").hidden, false, "an invalid id is just the list");
  assert.equal(homeCalls(malformed).length, 0);
  await malformed.navigate("#project=/Volumes/Synthetic/harbor-suite");
  await malformed.navigate("#project=41");
  assert.equal(homeCalls(malformed).length, 0, "a folder or a container number is never a route");
  for (const hash of ["#project=p_harbor1=extra", "#project=p_harbor1%3Dextra", "#project=p_harbor1=/"]) {
    await malformed.navigate(hash);
    assert.equal(malformed.$("projects-list").hidden, false, hash);
    assert.equal(malformed.$("project-home").hidden, true, hash);
  }
  assert.equal(homeCalls(malformed).length, 0, "a valid id with a tail is not that project's home");
  await malformed.navigate("#project=p_harbor1");
  assert.deepEqual(homeCalls(malformed), [["getProjectHome", { id: "p_harbor1" }]], "the exact route still works");

  const removed = await loadPage({ hash: "#project=p_harbor1" });
  assert.equal(removed.$("home-title").textContent, "Harbor Suite");
  removed.state.projects = removed.state.projects.filter(project => project.id !== "p_harbor1");
  await removed.emit("projects");
  assert.equal(removed.$("home-title").textContent, "This project is not here anymore", "removed elsewhere while open");

  const priv = await loadPage({ hash: "#project=p_harbor1", handlers: {
    getProjectHome: () => { throw { code: "PRIVATE_WINDOW", message: "getProjectHome: project homes are not shown in private windows" }; } } });
  assert.equal(priv.$("home-title").textContent, "Project homes open in normal windows");
  assert.doesNotMatch(priv.$("project-home").textContent, /getProjectHome|PRIVATE_WINDOW/u, "no raw codes or messages");
});

test("untrusted text from labels, detection and the brief is shown as text, never markup", async () => {
  const hostile = "<img src=x onerror=alert(1)>";
  const project = { ...structuredClone(HARBOR), manifest: { ...HARBOR.manifest, name: `Harbor ${hostile}` },
    accounts: [{ key: "vercel", label: `<b>${hostile}</b>` }, { key: "linear.app", label: hostile }],
    detected: { ...HARBOR.detected, integrations: [{ id: "convex", name: hostile, dashboard_url: "javascript:alert(1)", sources: [hostile] }],
      platforms: [{ kind: "ios", name: hostile, path: "", source: hostile }],
      domains: [{ host: "status.harborsuite.dev", origin: "docs", source: hostile, confirmed: false }] },
    brief: { ...BRIEF, document: { ...BRIEF.document, product: hostile, risks: [hostile], start: [{ label: hostile, command: hostile, cwd: null }] } } };
  const page = await loadPage({ hash: "#project=p_harbor1", projects: [project] });
  const home = page.$("project-home");
  assert.equal(home.querySelectorAll("img, b").length, 0);
  assert.equal(page.$("home-title").textContent, `Harbor ${hostile}`);
  assert.equal(home.querySelector(".home-lede").textContent, hostile);
  assert.match(page.section("accounts").textContent, /Account: <b><img src=x onerror=alert\(1\)><\/b>/u);
  assert.match(page.section("about").textContent, /iOS · <img src=x onerror=alert\(1\)>/u);
  assert.ok(!page.section("accounts").querySelectorAll("button").some(node => /Convex/u.test(node.getAttribute("aria-label") ?? "")),
    "a dashboard link only from a web address the detection gave");
  await page.navigate("#projects");
  assert.equal(page.document.querySelectorAll("#projects-body img, #projects-body b").length, 0);
  assert.equal(page.$("project-p_harbor1").querySelector("a.project-link").textContent, `Harbor ${hostile}`);
});

test("nothing is confirmed, shared or written by looking: docs and brief domains stay unconfirmed; only reads happen", async () => {
  const page = await loadPage({ hash: "#project=p_harbor1", projects: [{ ...structuredClone(HARBOR), brief: BRIEF }, INKLINE] });
  const about = page.section("about");
  const facts = Object.fromEntries(about.querySelectorAll("dl dt").map(dt => [dt.textContent, dt.parentNode.children[dt.parentNode.children.indexOf(dt) + 1]]));
  assert.equal(facts["From docs"].textContent, "status.harborsuite.devunconfirmed");
  assert.equal(facts["From docs"].querySelectorAll("a, button").length, 0, "documented domains are not links");
  assert.equal(facts.Domains.querySelectorAll("a, button").length, 0);
  const briefDomains = about.querySelector(".brief").querySelectorAll("li").find(li => li.textContent.startsWith("api.harborsuite.dev"));
  assert.equal(briefDomains.textContent, "api.harborsuite.dev — API unconfirmed");
  assert.match(page.section("accounts").querySelector(".fact-text").textContent, /^Not shared yet\. Suggested: github\.com/u);
  assert.match(about.textContent, /AxioSozo shows these commands; it never runs them\./u);
  assert.match(about.textContent, /Written by Claude Code on .+\. Not accepted into the project file\./u);
  assert.deepEqual([...new Set(page.calls.map(([name]) => name))].filter(name => !READS.has(name)), [], "loading the list and a home only reads");
  assert.deepEqual(page.calls.filter(([name]) => name === "serviceStatus").map(([, params]) => params.projectId).sort(),
    ["p_harbor1", "p_inkline1"], "local servers: one check per project when the page opens, the home included");
});

test("every link on the home goes through the project's container router; statuses are only what was checked", async () => {
  const page = await loadPage({ hash: "#project=p_harbor1" });
  const open = page.section("open");
  const rows = open.querySelectorAll(".env-block").map(block => [block.getAttribute("aria-label"),
    block.querySelectorAll(".env-row").map(row => [row.querySelector(".env-name").textContent, row.querySelector(".env-address").textContent,
      row.querySelector(".env-status").textContent])]);
  assert.deepEqual(rows, [
    ["App web", [["Local", "localhost:5173", "Running"], ["Preview", "preview.harborsuite.dev", "Not checked"], ["Production", "app.harborsuite.dev", "Not checked"]]],
    ["App admin", [["Local", "localhost:5174", "Not running"]]],
    ["App desktop", [["Local", "localhost:1420", "Could not check"]]]]);
  assert.match(open.querySelector(".footnote").textContent, /Preview and production addresses are never contacted\./u);
  for (const row of open.querySelectorAll(".env-row")) {
    const target = row.querySelector("button.env-open");
    same(page.$(target.getAttribute("aria-describedby")), row.querySelector(".env-status"), "the status describes its button");
    target.click();
  }
  for (const node of open.querySelectorAll("button.link-open")) node.click();
  for (const node of page.section("accounts").querySelectorAll("button").filter(node => /dashboard$/u.test(node.getAttribute("aria-label") ?? ""))) node.click();
  await flush();
  assert.equal(page.calls.filter(([name]) => name === "openUrl").length, 0, "never a plain openUrl");
  assert.deepEqual(page.calls.filter(([name]) => name === "openProjectUrl").map(([, params]) => [params.projectId, params.url]), [
    ...["http://localhost:5173", "https://preview.harborsuite.dev", "https://app.harborsuite.dev", "http://localhost:5174", "http://localhost:1420",
      "https://github.com/synthetic-org/harbor-suite", "https://github.com/synthetic-org/harbor-suite/issues", "https://vercel.com/synthetic-org/harbor-web",
      "https://vercel.com/dashboard", "https://dashboard.convex.dev", "https://dashboard.clerk.com"].map(url => ["p_harbor1", url])]);
  assert.deepEqual(open.querySelectorAll("button.link-open").map(node => node.getAttribute("aria-label")), [
    "Open Repository (repository) at github.com/synthetic-org/harbor-suite", "Open Issues (issues) at github.com/synthetic-org/harbor-suite/issues",
    "Open Vercel (web) (hosting) at vercel.com/synthetic-org/harbor-web"]);
  assert.equal(open.querySelector("details.more-links summary").textContent, "More links (2)");
  const checks = page.calls.filter(([name]) => name === "serviceStatus").length;
  page.button(open, "Check the local servers of Harbor Suite again").click();
  await flush();
  assert.equal(page.calls.filter(([name]) => name === "serviceStatus").length, checks + 1);
  assert.match(page.$("status").textContent, /1 local server is not running in Harbor Suite\./u);
});

test("from the home: Edit opens the editor; the project file is written only after an explicit confirmation; re-reading keeps labels", async () => {
  const page = await loadPage({ hash: "#project=p_harbor1", handlers: {
    writeManifest: ({ projectId }) => ({ path: `/Volumes/Synthetic/${projectId}/.axiosozo/project.json` }),
    refreshProjectDetection: ({ id }, state) => {
      state.projects = state.projects.map(project => (project.id === id ? { ...project, detected: { ...project.detected, at: Date.UTC(2026, 9, 2, 9) } } : project));
      return state.projects.find(project => project.id === id);
    } } });
  const home = page.$("project-home");
  page.button(home, "Edit Harbor Suite").click();
  await flush();
  assert.equal(page.$("sheet-body").querySelector("h2").textContent, "Edit Harbor Suite");
  page.button(page.$("sheet"), "Cancel").click();
  assert.deepEqual(home.querySelector(".home-actions .menu-items").querySelectorAll("button").map(node => node.textContent),
    ["Read folder again", "Save as .axiosozo/project.json…", "Switch to Work", "Remove project…"]);
  page.button(home, "Save as .axiosozo/project.json…").click();
  await flush();
  assert.equal(page.$("confirm-dialog").open, true);
  assert.match(page.$("confirm-message").textContent, /writes \.axiosozo\/project\.json in \/Volumes\/Synthetic\/harbor-suite/u);
  page.$("confirm-cancel").click();
  await flush();
  assert.equal(page.calls.filter(([name]) => name === "writeManifest").length, 0, "cancelled: nothing written");
  page.button(home, "Save as .axiosozo/project.json…").click();
  await flush();
  page.$("confirm-accept").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "writeManifest"), [["writeManifest", { projectId: "p_harbor1" }]]);
  page.button(page.section("about"), "Read folder again").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "refreshProjectDetection"), [["refreshProjectDetection", { id: "p_harbor1" }]]);
  assert.match(page.section("about").textContent, /Folder read on/u);
  assert.match(page.section("accounts").textContent, /Account: work Google/u, "labels survive a re-read");
  assert.match(page.section("accounts").querySelector(".fact-text").textContent, /^Not shared yet/u);
});

test("removing from the home asks first, then goes back to the list", async () => {
  const page = await loadPage({ hash: "#project=p_harbor1", handlers: {
    removeProject: ({ id }, state) => { state.projects = state.projects.filter(project => project.id !== id); return { removed: true }; } } });
  page.button(page.$("project-home"), "Remove project…").click();
  await flush();
  assert.match(page.$("confirm-title").textContent, /^Remove Harbor Suite\?$/u);
  assert.match(page.$("confirm-message").textContent, /folder and any \.axiosozo\/project\.json in it are not touched/u);
  page.$("confirm-accept").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "removeProject"), [["removeProject", { id: "p_harbor1" }]]);
  assert.equal(page.location.hash, "#projects");
  await page.navigate("#projects");
  same(page.$("project-p_harbor1"), null);
  assert.ok(page.$("project-p_inkline1"));
});

test("step seams: the home shows reported agent activity, console errors and a stored brief only when they exist", async () => {
  const quiet = await loadPage({ hash: "#project=p_harbor1" });
  const activity = quiet.section("activity");
  assert.equal(activity.className, "home-section quiet");
  assert.match(activity.textContent, /Agents cannot report to AxioSozo yet; status reporting is not part of this build\./u);
  assert.match(activity.textContent, /Console errors are not collected in this build\./u);
  assert.match(activity.textContent, /In the folder: AGENTS\.md, CLAUDE\.md, \.claude, 3 agent worktrees\. These show the folder is set up for agents, not that one is running\./u);
  assert.match(quiet.section("about").querySelector(".brief.absent").textContent, /No brief yet\. .*not available in this build\./u);
  same(quiet.$("project-home").querySelector(".home-lede"), null, "no brief, no product line");

  const now = Date.now();
  const record = (over = {}) => ({ version: 1, id: "as_0123456789abcdef", project_path: "/Volumes/Synthetic/harbor-suite", agent: "claude-code",
    state: "needs_input", title: "Approve the schema change?", at: now - 5 * 60_000, session: null, ...over });
  const busy = await loadPage({ hash: "#project=p_harbor1", projects: [{ ...structuredClone(HARBOR), brief: BRIEF }], home: {
    agent_activity: { records: [record(), record({ id: "as_1111111111111111", project_path: "/Volumes/Synthetic/other", title: "Someone else's work" })] },
    console_errors: { count: 2, recent: [{ level: "error", text: "TypeError: booking is undefined" }] } } });
  assert.deepEqual(busy.$("project-home").querySelectorAll("section.home-section h3").map(h3 => h3.textContent),
    ["Environments and links", "Activity", "Services and sign-ins", "About this project"], "activity moves up when it has news");
  const items = busy.section("activity").querySelectorAll(".activity-list li").map(li => li.textContent);
  assert.deepEqual(items, ["Needs youClaude Code: Approve the schema change?5 min ago", "errorTypeError: booking is undefined"]);
  assert.doesNotMatch(busy.section("activity").textContent, /Someone else's work/u, "another folder's agents are not this project's");
  assert.match(busy.section("activity").textContent, /2 console errors in this project's tabs/u);
  assert.equal(busy.$("project-home").querySelector(".home-lede").textContent, BRIEF.document.product);
  assert.deepEqual(busy.section("about").querySelectorAll(".brief h5").map(h5 => h5.textContent),
    ["Apps", "How to start", "Services", "Domains it mentions", "Known risks"]);
});

test("keyboard and names: menus move with arrow keys, every control has a name, the heading outline holds", async () => {
  const page = await loadPage({ hash: "#project=p_harbor1" });
  const home = page.$("project-home");
  const menu = home.querySelector(".home-actions details.menu");
  assert.equal(menu.querySelector("summary").getAttribute("aria-label"), "More for Harbor Suite");
  assert.equal(menu.querySelector(".menu-items").getAttribute("role"), "menu");
  menu.querySelector("summary").click();
  const items = menu.querySelectorAll("button");
  items[0].focus();
  menu.dispatchEvent(makeEvent("keydown", { key: "ArrowDown" }));
  same(page.document.activeElement, items[1]);
  menu.dispatchEvent(makeEvent("keydown", { key: "End" }));
  same(page.document.activeElement, items.at(-1));
  menu.dispatchEvent(makeEvent("keydown", { key: "ArrowDown" }));
  same(page.document.activeElement, items[0], "wraps around");
  menu.dispatchEvent(makeEvent("keydown", { key: "ArrowUp" }));
  same(page.document.activeElement, items.at(-1));
  menu.dispatchEvent(makeEvent("keydown", { key: "Escape" }));
  assert.equal(menu.open, false);
  same(page.document.activeElement, menu.querySelector("summary"));
  for (const control of home.querySelectorAll("button, a, summary")) {
    const name = control.getAttribute("aria-label") ?? control.textContent.trim();
    assert.ok(name, `${control.localName}.${control.className} has a name`);
  }
  for (const icon of home.querySelectorAll("svg, .dot, .project-tile, .container-mark")) assert.equal(icon.getAttribute("aria-hidden"), "true");
  assert.deepEqual(home.querySelectorAll("h2, h3").map(node => node.localName), ["h2", "h3", "h3", "h3", "h3"]);
  // The skip link moves focus without leaving the home.
  page.document.querySelector(".skip-link").dispatchEvent(makeEvent("click"));
  assert.equal(page.location.hash, "#project=p_harbor1");
  same(page.document.activeElement, page.$("main"));
});

test("same-project answers out of order: only the latest request publishes, success or refusal", async () => {
  // An older success never undoes a newer refusal (the project was removed meanwhile).
  const held = heldHomes();
  const removed = await loadPage({ handlers: { getProjectHome: held.handler } });
  await removed.navigate("#project=p_harbor1");
  const older = removed.answer("p_harbor1");
  await removed.emit("projects");
  assert.deepEqual(held.queue.map(entry => entry.id), ["p_harbor1", "p_harbor1"]);
  removed.state.projects = removed.state.projects.filter(project => project.id !== "p_harbor1");
  held.refuse(1, "UNKNOWN_PROJECT");
  await flush();
  assert.equal(removed.$("home-title").textContent, "This project is not here anymore");
  const checks = statusChecks(removed);
  held.queue[0].resolve(older);
  await flush();
  assert.equal(removed.$("home-title").textContent, "This project is not here anymore", "the removed record never comes back");
  assert.doesNotMatch(removed.$("project-home").textContent, /Harbor Suite|\/Volumes/u);
  assert.equal(statusChecks(removed), checks, "a stale answer starts no check");

  // An older answer with older data, or an older refusal, never replaces a newer success.
  const held2 = heldHomes();
  const page = await loadPage({ handlers: { getProjectHome: held2.handler } });
  await page.navigate("#project=p_harbor1");
  const before = page.answer("p_harbor1");
  page.state.projects = page.state.projects.map(project => (project.id === "p_harbor1"
    ? { ...project, accounts: [{ key: "vercel", label: "personal Google" }] } : project));
  await page.emit("projects");
  await page.emit("projects");
  assert.equal(held2.queue.length, 3);
  held2.queue[2].resolve(page.answer("p_harbor1"));
  await flush();
  assert.match(page.section("accounts").textContent, /Account: personal Google/u);
  held2.queue[0].resolve(before);
  held2.refuse(1, "UNKNOWN_PROJECT");
  await flush();
  assert.equal(page.$("home-title").textContent, "Harbor Suite");
  assert.match(page.section("accounts").textContent, /Account: personal Google/u, "older data never replaces newer");
  assert.doesNotMatch(page.section("accounts").textContent, /work Google/u);
});

test("route away and back, and a hidden page: answers of an earlier visit publish no state, focus or check", async () => {
  const held = heldHomes();
  const page = await loadPage({ handlers: { getProjectHome: held.handler } });
  const initialChecks = statusChecks(page);
  await page.navigate("#project=p_harbor1");
  await page.navigate("#projects");
  const focused = page.document.activeElement;
  held.queue[0].resolve(page.answer("p_harbor1"));
  await flush();
  assert.equal(page.$("project-home").children.length, 0, "nothing renders into the hidden home");
  assert.equal(page.$("project-home").hidden, true);
  same(page.document.activeElement, focused, "focus does not move");
  assert.equal(statusChecks(page), initialChecks, "no check for a home that is not shown");

  // A → list → A: the first visit's late refusal does not replace the second visit's home.
  await page.navigate("#project=p_harbor1");
  await page.navigate("#projects");
  await page.navigate("#project=p_harbor1");
  assert.equal(held.queue.length, 3);
  held.queue[2].resolve(page.answer("p_harbor1"));
  await flush();
  assert.equal(page.$("home-title").textContent, "Harbor Suite");
  same(page.document.activeElement, page.$("home-title"), "the current visit takes focus once");
  assert.equal(statusChecks(page), initialChecks + 1, "exactly one check, for the current visit");
  held.refuse(1, "UNKNOWN_PROJECT");
  await flush();
  assert.equal(page.$("home-title").textContent, "Harbor Suite");
  assert.equal(statusChecks(page), initialChecks + 1);

  // A hidden page publishes nothing late; shown again from the cache, it asks afresh.
  await page.emit("projects");
  assert.equal(held.queue.length, 4);
  await page.fire("pagehide");
  page.state.projects = page.state.projects.map(project => (project.id === "p_harbor1"
    ? { ...project, accounts: [{ key: "vercel", label: "personal Google" }] } : project));
  held.queue[3].resolve(page.answer("p_harbor1"));
  await flush();
  assert.match(page.section("accounts").textContent, /Account: work Google/u, "the answer that arrived while hidden is dropped");
  await page.fire("pageshow", { persisted: true });
  assert.equal(held.queue.length, 5);
  held.queue[4].resolve(page.answer("p_harbor1"));
  await flush();
  assert.match(page.section("accounts").textContent, /Account: personal Google/u);
});

test("local server checks out of order: the latest answer is shown, and only it ends 'Checking…'", async () => {
  const pending = [];
  const answer = status => [{ name: "web dev server", url: "http://localhost:5173/", port: 5173, status, checked_at: 1 }];
  const page = await loadPage({ hash: "#project=p_harbor1", handlers: {
    serviceStatus: ({ projectId }) => (projectId === "p_harbor1" ? new Promise(resolve => pending.push(resolve)) : []) } });
  pending.splice(0).forEach(resolve => resolve(answer("up")));
  await flush();
  const local = () => page.section("open").querySelector(".env-status").textContent;
  assert.equal(local(), "Running");
  const again = () => page.button(page.section("open"), "Check the local servers of Harbor Suite again").click();
  again();
  await flush();
  again();
  await flush();
  assert.equal(pending.length, 2);
  assert.equal(local(), "Running", "the last answer stays while checking");
  pending[0](answer("down"));
  await flush();
  assert.equal(local(), "Running", "the older check's answer is not shown");
  pending[1](answer("unknown"));
  await flush();
  assert.equal(local(), "Could not check", "the latest answer, as it is");
  await page.navigate("#projects");
  const fact = page.$("project-p_harbor1").querySelector(".fact");
  assert.deepEqual([fact.textContent, fact.getAttribute("data-tone")], ["1 could not be checked, 2 not checked yet", "unknown"],
    "the card keeps a failed check apart from never checked");
});

test("a project that changed while it was read is asked for once more; a second change says so calmly", async () => {
  const held = heldHomes();
  const page = await loadPage({ handlers: { getProjectHome: held.handler } });
  await page.navigate("#project=p_harbor1");
  held.refuse(0, "PROJECT_CHANGED");
  await flush();
  assert.equal(held.queue.length, 1);
  assert.match(page.$("project-home").textContent, /Loading project…/u, "no refusal shown before the retry");
  await sleep(200);
  assert.equal(held.queue.length, 2, "one retry");
  held.queue[1].resolve(page.answer("p_harbor1"));
  await flush();
  assert.equal(page.$("home-title").textContent, "Harbor Suite");

  await page.emit("projects");
  held.refuse(2, "PROJECT_CHANGED");
  await sleep(200);
  held.refuse(3, "PROJECT_CHANGED");
  await flush();
  assert.equal(page.$("home-title").textContent, "This project is changing");
  assert.equal(page.$("project-home").querySelector(".home-problem a").getAttribute("href"), "#projects");
  await sleep(200);
  assert.equal(held.queue.length, 4, "never more than one retry");

  // A retry that is due after the route moved on is not made.
  await page.navigate("#project=p_inkline1");
  held.refuse(4, "PROJECT_CHANGED");
  await flush();
  await page.navigate("#projects");
  await sleep(200);
  assert.equal(held.queue.length, 5);
});

for (const event of ["projects", "contexts"]) {
  test(`a ${event} event voids the home answer on its way at once; the one reload publishes the current home and its one check`, async () => {
    const held = heldHomes();
    const page = await loadPage({ handlers: { getProjectHome: held.handler } });
    await page.navigate("#project=p_harbor1");
    const older = page.answer("p_harbor1");
    const checks = statusChecks(page);
    const focused = page.document.activeElement;
    page.state.projects = page.state.projects.map(project => (project.id === "p_harbor1"
      ? { ...project, accounts: [{ key: "vercel", label: "personal Google" }] } : project));
    // The event arrives, then the older answer, both before the reload is due.
    page.emitNow(event);
    held.queue[0].resolve(older);
    await flush();
    same(page.$("home-title"), null, "the older answer is not shown");
    assert.match(page.$("project-home").textContent, /Loading project…/u);
    same(page.document.activeElement, focused, "focus does not move");
    assert.equal(statusChecks(page), checks, "no check from the voided answer");
    // A second event joins the queued reload; it voids nothing new but asks only once.
    page.emitNow(event);
    await sleep(150);
    await flush();
    assert.equal(held.queue.length, 2, "one reload for both events");
    held.queue[1].resolve(page.answer("p_harbor1"));
    await flush();
    assert.equal(page.$("home-title").textContent, "Harbor Suite");
    assert.match(page.section("accounts").textContent, /Account: personal Google/u);
    assert.doesNotMatch(page.section("accounts").textContent, /work Google/u);
    same(page.document.activeElement, page.$("home-title"), "this visit's first home takes focus");
    assert.equal(statusChecks(page), checks + 1, "the visit's one check, made by the reissued request");
  });
}

test("held list reads: a list answering late never replaces a newer one, nor asks for a home", async () => {
  const lists = [];
  let holdLists = false;
  const held = heldHomes();
  const page = await loadPage({ handlers: { getProjectHome: held.handler,
    listProjects: (_params, state) => (holdLists ? new Promise(resolve => lists.push(resolve)) : state.projects) } });
  await page.navigate("#project=p_harbor1");
  held.queue[0].resolve(page.answer("p_harbor1"));
  await flush();
  const before = structuredClone(page.state.projects);
  holdLists = true;
  page.emitNow("projects");
  await sleep(150);
  page.state.projects = page.state.projects.map(project => (project.id === "p_harbor1"
    ? { ...project, manifest: { ...project.manifest, name: "Harbor Suite Renamed" } } : project));
  page.emitNow("projects");
  await sleep(150);
  assert.equal(lists.length, 2, "two list reads in flight");
  assert.equal(held.queue.length, 1, "no home asked for while the lists are out");
  lists[1](structuredClone(page.state.projects));
  await flush();
  assert.equal(held.queue.length, 2, "the latest list asks for the home once");
  lists[0](before);
  await flush();
  assert.equal(held.queue.length, 2, "the older list asks for nothing");
  held.queue[1].resolve(page.answer("p_harbor1"));
  await flush();
  assert.equal(page.$("home-title").textContent, "Harbor Suite Renamed");
  await page.navigate("#projects");
  assert.equal(page.$("project-p_harbor1").querySelector("a.project-link").textContent, "Harbor Suite Renamed", "the older list was not kept");
});

test("pagehide: a queued reload, events after it and a pending retry ask for nothing while hidden; a restored page reads afresh", async () => {
  const held = heldHomes();
  const page = await loadPage({ handlers: { getProjectHome: held.handler } });
  const fresh = page.calls.length;
  await page.fire("pageshow", { persisted: false });
  await sleep(20);
  assert.equal(page.calls.length, fresh, "an ordinary pageshow changes nothing");
  assert.equal(page.subscriptions.made, 1);
  await page.navigate("#project=p_harbor1");
  held.queue[0].resolve(page.answer("p_harbor1"));
  await flush();
  const titleNode = page.$("home-title");
  assert.equal(page.subscriptions.made, 1);
  // A reload queued just before the hide, and events on the far side of it.
  page.emitNow("projects");
  await page.fire("pagehide");
  assert.equal(page.subscriptions.ended, 1, "events are unsubscribed while hidden");
  const atHide = page.calls.length;
  page.emitNow("projects");
  page.emitNow("contexts");
  await sleep(200);
  await flush();
  assert.deepEqual(page.calls.slice(atHide), [], "nothing is asked while hidden: no list, home or check");
  same(page.$("home-title"), titleNode, "the shown home is left as it was, not re-rendered");
  // Changes made while the page was in the back/forward cache are read on restore.
  page.state.projects = page.state.projects.map(project => (project.id === "p_harbor1"
    ? { ...project, accounts: [{ key: "vercel", label: "personal Google" }] } : project));
  const checks = statusChecks(page);
  await page.fire("pageshow", { persisted: true });
  assert.equal(page.subscriptions.made, 2, "listening again");
  assert.ok(page.calls.slice(atHide).some(([name]) => name === "listProjects"), "read afresh");
  assert.equal(held.queue.length, 2, "one home request for the restore");
  held.queue[1].resolve(page.answer("p_harbor1"));
  await flush();
  assert.match(page.section("accounts").textContent, /Account: personal Google/u);
  assert.equal(statusChecks(page), checks + 1, "local servers checked again, once");
  // Back to normal: events reload again.
  page.emitNow("projects");
  await sleep(150);
  await flush();
  assert.equal(held.queue.length, 3);
});

test("pagehide with a retry pending, or during the first load: nothing continues hidden; the restore finishes the load", async () => {
  // A PROJECT_CHANGED retry that is due after the hide is not made.
  const held = heldHomes();
  const page = await loadPage({ handlers: { getProjectHome: held.handler } });
  await page.navigate("#project=p_harbor1");
  held.refuse(0, "PROJECT_CHANGED");
  await flush();
  await page.fire("pagehide");
  await sleep(200);
  assert.equal(held.queue.length, 1, "no retry while hidden");
  await page.fire("pageshow", { persisted: true });
  assert.equal(held.queue.length, 2, "the restore asks once");
  held.queue[1].resolve(page.answer("p_harbor1"));
  await flush();
  assert.equal(page.$("home-title").textContent, "Harbor Suite");

  // Hidden while the first load is still out: it stops there; the restore draws and checks.
  const lists = [];
  let holdLists = true;
  const early = await loadPage({ hash: "#project=p_harbor1", handlers: {
    listProjects: (_params, state) => (holdLists ? new Promise(resolve => lists.push(() => resolve(state.projects))) : state.projects) } });
  assert.equal(lists.length, 1);
  await early.fire("pagehide");
  const atHide = early.calls.length;
  lists[0]();
  await sleep(50);
  await flush();
  assert.deepEqual(early.calls.slice(atHide), [], "the late list starts nothing: no containers, home or check");
  assert.equal(early.$("projects-body").getAttribute("aria-busy"), "true", "nothing was drawn while hidden");
  assert.match(early.$("project-home").textContent, /Loading project…/u);
  holdLists = false;
  await early.fire("pageshow", { persisted: true });
  await flush();
  assert.equal(early.$("home-title").textContent, "Harbor Suite");
  assert.equal(early.$("projects-body").hasAttribute("aria-busy"), false);
  assert.deepEqual(homeCalls(early), [["getProjectHome", { id: "p_harbor1" }]]);
  assert.equal(early.calls.slice(atHide).filter(([name]) => name === "listProjectContainers").length, 1, "the restore reads containers once");
  assert.equal(statusChecks(early), 1, "one check when the load finishes");
  same(early.document.activeElement, early.$("home-title"), "the home opened by the address takes focus once shown");
});

test("a list read superseded by a newer one asks for no containers; a fresh page loads normally", async () => {
  // Control: an ordinary page reads the list, then its containers, once each.
  const control = await loadPage();
  assert.deepEqual(control.calls.filter(([name]) => name === "listProjects" || name === "listProjectContainers").map(([name]) => name),
    ["listProjects", "listProjectContainers"]);
  assert.ok(control.$("project-p_harbor1"));
  // Two list reads out at once: the older one, answering last, asks for nothing more.
  const lists = [];
  let holdLists = false;
  const page = await loadPage({ handlers: {
    listProjects: (_params, state) => (holdLists ? new Promise(resolve => lists.push(() => resolve(state.projects))) : state.projects) } });
  holdLists = true;
  page.emitNow("projects");
  await sleep(150);
  page.emitNow("projects");
  await sleep(150);
  assert.equal(lists.length, 2);
  const containers = () => page.calls.filter(([name]) => name === "listProjectContainers").length;
  const before = containers();
  lists[1]();
  await flush();
  assert.equal(containers(), before + 1, "the newer read goes on to its containers");
  lists[0]();
  await flush();
  assert.equal(containers(), before + 1, "the older read stops before its containers");
});

// Like native Element.replaceChildren/append, the test DOM turns a null or
// undefined argument into a "null"/"undefined" text node; the real home showed
// "null" between its header and first section when the project had no brief.
const strayText = root => {
  const found = [];
  const walk = node => { for (const child of node.childNodes) { if (child.data !== undefined) { if (/^\s*(null|undefined|false)\s*$/u.test(child.data)) found.push(child.data); } else walk(child); } };
  walk(root);
  return found;
};

test("a home without a brief shows no 'null': only the breadcrumb, header and sections; a brief shows its product line unchanged", async () => {
  const page = await loadPage({ hash: "#project=p_harbor1" });
  const home = page.$("project-home");
  assert.equal(page.$("home-title").textContent, "Harbor Suite");
  assert.deepEqual(home.childNodes.map(node => node.localName ?? `text:${node.data}`), ["nav", "header", "section", "section", "section", "section"],
    "no text node between the header and the first section");
  assert.deepEqual(strayText(home), []);
  assert.doesNotMatch(home.textContent, /\bnull\b|\bundefined\b/u);
  same(home.querySelector(".home-lede"), null);

  const withBrief = await loadPage({ hash: "#project=p_harbor1", projects: [{ ...structuredClone(HARBOR), brief: BRIEF }, INKLINE] });
  const briefHome = withBrief.$("project-home");
  assert.deepEqual(briefHome.childNodes.map(node => node.localName ?? `text:${node.data}`), ["nav", "header", "p", "section", "section", "section", "section"]);
  assert.equal(briefHome.querySelector(".home-lede").textContent, BRIEF.document.product, "the product line, exactly as stored");
  assert.deepEqual(strayText(briefHome), []);
});

test("no optional part anywhere on the page renders as 'null' or 'undefined' text", async () => {
  // A project in no space (placement without a switch button), the list, a home and a rule editor with no spaces.
  const loose = { ...structuredClone(INKLINE), id: "p_loose1", context_uuid: null, manifest: { ...INKLINE.manifest, name: "Loose" } };
  const page = await loadPage({ projects: [HARBOR, loose], handlers: { listContexts: () => [] } });
  assert.deepEqual(strayText(page.document.body), [], "the list");
  await page.navigate("#project=p_loose1");
  assert.equal(page.$("home-title").textContent, "Loose");
  assert.deepEqual(strayText(page.document.body), [], "a home with no space, brief or services");
  await page.navigate("#rules");
  page.$("add-rule").click();
  await flush();
  const outline = page.$("sheet-body").querySelectorAll("input").find(input => input.getAttribute("name") === "observation" && input.value === "outline");
  outline.click();
  await flush();
  assert.deepEqual(strayText(page.document.body), [], "the rule editor with no spaces and no hosts yet");
});
