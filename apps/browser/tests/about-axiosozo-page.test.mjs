/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Runs the real about:axiosozo page script (overview/about-axiosozo.mjs) on the
// real page HTML inside a small Node DOM (support/mini-dom.mjs) with a fake
// window.AxioSozoOverview. Checks the three sections, deep links, the
// add-project review and the Jev key form. Synthetic: not evidence of Gecko
// rendering, layout, VoiceOver or light/dark appearance.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Node, parseHtml, makeEvent } from "./support/mini-dom.mjs";

const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const DRAFT = JSON.parse(readFileSync(new URL("../../../packages/contexts/tests/expected/tauri-plus-web.json", import.meta.url), "utf8"));
const HOME = "{11111111-1111-4111-8111-111111111111}";
const BV = "{22222222-2222-4222-8222-222222222222}";
const SECRET = "synthetic-jev-key-0000";
let serial = 0;

const flush = async (rounds = 6) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };

async function loadPage({ hash = "", projects = [], handlers = {}, containers = {} } = {}) {
  const document = parseHtml(HTML);
  const calls = [];
  const subscribers = [];
  const state = { projects: [...projects], containers };
  const contexts = [
    { uuid: HOME, name: "Home", icon: "", type: "personal", organization_uuid: null, project_id: null, container: 0 },
    { uuid: BV, name: "Acme BV", icon: "", type: "organization", organization_uuid: null, project_id: null, container: 1, container_label: "Work" }];
  const defaults = {
    getOverviewFlags: () => ({ contexts: true, enginePreferences: false, jevKeyEntry: true }),
    activeContext: () => ({ uuid: HOME }),
    listContexts: () => contexts,
    listProjects: () => state.projects,
    listRules: () => [], getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    usageSummary: () => [], listOrphans: () => [], needsAttention: () => [],
    serviceStatus: () => [],
    getJevKeyStatus: () => ({ id: "jev", label: "Jev", state: "needs-key", state_label: "No key stored", detail: "No Jev key is stored.",
      key: "missing", key_entry_enabled: true }),
    getProviderStatus: () => ({ version: 1, discovery: "ok", discovery_error: null, model_turns_verified: false, providers: [
      { id: "codex", label: "Codex", state: "unverified", state_label: "Installed · not yet verified", detail: "Installed (0.157.1).", version: "0.157.1", expected_version: "0.157.1" },
      { id: "claude-code", label: "Claude Code", state: "not-installed", state_label: "Not installed", detail: "The official Claude Code client was not found." },
      { id: "antigravity", label: "Antigravity", state: "unknown", state_label: "Status unknown", detail: "Could not read installation metadata." },
      { id: "jev", label: "Jev", state: "needs-key", state_label: "No key stored", detail: "No Jev key is stored.", key: "missing", key_entry_enabled: true }] }),
    // Like AxioSozoServices.projectHome: the stored record without its container mapping.
    getProjectHome: ({ id }) => {
      const stored = state.projects.find(project => project.id === id);
      if (!stored) throw { code: "UNKNOWN_PROJECT", message: "UNKNOWN_PROJECT" };
      const { container: _mapping, ...project } = structuredClone(stored);
      const space = contexts.find(context => context.uuid === project.context_uuid);
      return { version: 1, project, space: space ? { uuid: space.uuid, name: space.name } : null,
        container: state.containers?.[id] ?? { state: "pending" }, agent_activity: null, console_errors: null };
    },
    pickFolder: () => "/synthetic/domo-cortex",
    detect: () => DRAFT,
    confirmProject: ({ root, manifest, contextUuid }) => {
      const project = { version: 1, id: "p_domo1", root, manifest, manifest_state: "none", context_uuid: contextUuid, trusted: false, created_at: 1, updated_at: 1 };
      state.projects = [...state.projects, project];
      return project;
    },
    storeJevKey: () => ({ id: "jev", label: "Jev", state: "key-stored", state_label: "Key stored", detail: "A Jev key is stored in the macOS Keychain.", key: "stored", key_entry_enabled: true }),
  };
  const api = {
    async request(name, params) {
      calls.push([name, JSON.parse(JSON.stringify(params ?? {}))]);
      const handler = handlers[name] ?? defaults[name];
      if (!handler) throw { code: "UNKNOWN_METHOD", message: name };
      return handler(params ?? {});
    },
    subscribe(callback) { subscribers.push(callback); return () => {}; },
  };
  const windowListeners = new Map();
  const location = { hash };
  Object.assign(globalThis, {
    document, Node, location,
    window: { AxioSozoOverview: api, addEventListener: (type, fn) => windowListeners.set(type, fn) },
    history: { replaceState: (_state, _title, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") },
  });
  await import(`../chrome/overview/about-axiosozo.mjs?page=${++serial}`);
  await flush();
  const navigate = async next => { location.hash = next; windowListeners.get("hashchange")?.(); await flush(); };
  return { document, calls, state, location, navigate, text: () => document.body.textContent };
}

const visibleView = document => document.querySelectorAll("section.view").filter(section => !section.hidden).map(section => section.dataset.view);
const byText = (root, tag, text) => root.querySelectorAll(tag).find(node => node.textContent.trim() === text);

test("three sections only; the first run guide is the Projects empty state; every space is listed", async () => {
  const page = await loadPage();
  const { document } = page;
  assert.deepEqual(document.querySelectorAll(".views a").map(a => [a.getAttribute("href"), a.textContent]),
    [["#projects", "Projects"], ["#rules", "Site rules"], ["#ai", "AI & keys"]]);
  assert.deepEqual(visibleView(document), ["projects"]);
  assert.ok(document.getElementById("guide-heading"), "first-run guidance folds into Projects");
  // Spaces without projects are one quiet row each, never an empty group box.
  const spaces = document.querySelector(".other-spaces");
  assert.equal(spaces.querySelector("h3").textContent, "Your spaces");
  assert.deepEqual(spaces.querySelectorAll(".row-title").map(node => node.textContent), ["Homethis window", "Acme BV"]);
  assert.equal(document.querySelectorAll(".space-group").length, 0);
  assert.deepEqual(spaces.querySelectorAll("button.ghost").map(button => button.getAttribute("aria-label")),
    ["Add a project to Home", "Add a project to Acme BV"]);
  assert.deepEqual(spaces.querySelectorAll(".menu-items button").map(button => button.textContent),
    ["Switch to Home", "Space type…", "Switch to Acme BV", "Space type…"], "switching and the space type stay reachable, behind …");
  assert.equal(document.getElementById("projects-body").hasAttribute("aria-busy"), false);
  assert.equal(page.calls.some(([name]) => name === "getProviderStatus"), false, "no provider discovery until AI & keys is opened");
  assert.ok(page.calls.some(([name]) => name === "getJevKeyStatus"));
  for (const view of ["#rules", "#ai", "#projects"]) {
    await page.navigate(view);
    assert.doesNotMatch(document.body.textContent, /\bnull\b|\bundefined\b|\[object /u, view);
  }
});

test("Site rules carry their own screen time; the busiest sites follow, with Add rule", async () => {
  const rule = { version: 1, id: "r_xcom1", enabled: true, match: { hosts: ["x.com"] }, contexts: "all", instruction: "Post, then leave.",
    limits: { daily_minutes: 15, allowed_hours: null }, observation: "none", observation_raised_hosts: [], effects: ["nudge"], override: "confirm",
    agents: { access: "none", instruction: "" }, created_at: 1, updated_at: 1 };
  const page = await loadPage({ hash: "#rules", handlers: {
    listRules: () => [rule],
    usageSummary: ({ days }) => [{ host: "x.com", context_uuid: null, total_ms: (days === 1 ? 20 : 70) * 60_000, by_day: {} },
      { host: "news.example", context_uuid: HOME, total_ms: 30 * 60_000, by_day: {} }] } });
  const card = page.document.getElementById("rule-r_xcom1");
  assert.match(card.querySelector(".usage-line").textContent, /^Today 20 min of 15 min · 7 days 1 h 10 min$/u);
  assert.ok(card.querySelector(".usage-line").hasAttribute("data-over"));
  const rows = page.document.querySelectorAll("#usage-list .usage-row");
  assert.deepEqual(rows.map(row => [row.querySelector(".row-title").textContent, row.querySelector("button").textContent]),
    [["x.com", "Rule"], ["news.example", "Add rule"]]);
  rows[1].querySelector("button").click();
  await flush();
  assert.equal(page.document.getElementById("sheet").open, true);
  assert.equal(page.document.getElementById("sheet-body").querySelector("textarea").value, "news.example");
});

test("old hashes redirect; #ai loads provider status with honest labels", async () => {
  const page = await loadPage({ hash: "#settings" });
  assert.equal(page.location.hash, "#ai");
  assert.deepEqual(visibleView(page.document), ["ai"]);
  assert.deepEqual(page.document.querySelectorAll("#provider-list .card-title").map(title => title.textContent),
    ["CodexInstalled · not yet verified", "Claude CodeNot installed", "AntigravityStatus unknown"]);
  assert.match(page.document.getElementById("providers-summary").textContent, /no assistant was started/u);
  await page.navigate("#time");
  assert.equal(page.location.hash, "#rules");
  assert.deepEqual(visibleView(page.document), ["rules"]);
  await page.navigate("#home");
  assert.deepEqual(visibleView(page.document), ["projects"]);
});

test("Jev key: explicit Store clears the field at once, crosses once, is never echoed; errors show fixed text", async () => {
  let fail = null;
  const page = await loadPage({ hash: "#ai", handlers: { storeJevKey: () => { if (fail) throw fail; return {
    id: "jev", label: "Jev", state: "key-stored", state_label: "Key stored", detail: "A Jev key is stored in the macOS Keychain.", key: "stored", key_entry_enabled: true }; } } });
  const { document } = page;
  const input = document.getElementById("jev-key");
  assert.equal(input.type, "password");
  assert.equal(input.getAttribute("autocomplete"), "off");
  input.value = SECRET;
  input.dispatchEvent(makeEvent("input"));
  await flush();
  assert.equal(page.calls.some(([name]) => name === "storeJevKey"), false, "typing sends nothing");
  byText(document, "button", "Store key").click();
  assert.equal(input.value, "", "cleared before the request completes");
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "storeJevKey"), [["storeJevKey", { key: SECRET }]]);
  assert.match(document.getElementById("jev-card").textContent, /Key stored/u);
  assert.ok(byText(document, "button", "Remove key…"), "a stored key can be removed");
  fail = { code: "KEYCHAIN_REFUSED", message: "storeJevKey failed (KEYCHAIN_REFUSED)" };
  const again = document.getElementById("jev-key");
  again.value = SECRET;
  again.dispatchEvent(makeEvent("keydown", { key: "Enter" }));
  await flush();
  assert.match(document.getElementById("jev-key-error").textContent, /The macOS Keychain refused the change/u);
  again.value = "short";
  byText(document, "button", "Store key").click();
  await flush();
  assert.match(document.getElementById("jev-key-error").textContent, /8–4096 characters/u);
  assert.equal(page.calls.filter(([name]) => name === "storeJevKey").length, 2, "an invalid key is never sent");
  assert.doesNotMatch(document.body.textContent, new RegExp(SECRET, "u"));
  assert.ok(document.querySelectorAll("input").every(node => node.value !== SECRET));
});

test("add project: review sheet with the current space, environments per app, production URL, then where it lives", async () => {
  const page = await loadPage();
  const { document } = page;
  document.getElementById("add-project").click();
  await flush();
  assert.equal(document.getElementById("sheet").open, true);
  const sheet = document.getElementById("sheet-body");
  assert.equal(sheet.querySelector("h2").textContent, "Review project");
  const space = sheet.querySelectorAll("select").find(select => select.querySelector("option")?.textContent.startsWith("No space"));
  assert.equal(space.value, HOME, "defaults to the space this window shows");
  assert.deepEqual(space.querySelectorAll("option").map(o => o.textContent),
    ["No space (not in the sidebar)", "Home (personal) · this window", "Acme BV (organization)"]);
  assert.deepEqual(sheet.querySelectorAll(".env-group h4").map(h4 => h4.textContent), ["Desktop app (desktop)", "App web"]);
  assert.deepEqual(sheet.querySelectorAll(".review-row .env-url").slice(0, 2).map(input => input.value), ["http://localhost:1420", "http://localhost:5173"]);
  assert.ok(sheet.querySelectorAll(".tag.guess").some(tag => tag.textContent === "guessed"), "the Vite default port is marked guessed");
  assert.match(sheet.textContent, /Shown in the sidebarRepositorygithub\.comMove to More/u, "only the repository is shown");
  assert.match(sheet.textContent, /More \(behind … in the sidebar\): 4Issues.*Vercel \(synthetic-web\)vercel\.com/u, "issues, CI, releases and the Vercel dashboard go behind …");
  // Detection v2 preview: services and apps as plain text, no links before the project exists.
  const findings = sheet.querySelector("fieldset.findings");
  assert.equal(findings.querySelector("legend").textContent, "Also found in the folder");
  assert.deepEqual(findings.querySelectorAll("dt").map(dt => dt.textContent), ["Services", "Apps"]);
  assert.deepEqual(findings.querySelectorAll("dd .tag").map(tag => tag.textContent), ["Vercel", "Desktop (Tauri) · Tauri Plus Web"]);
  assert.equal(findings.querySelectorAll("button").length, 0);
  const production = sheet.querySelectorAll("input").find(input => input.getAttribute("placeholder") === "https://example.com");
  production.value = "https://domo.example";
  production.dispatchEvent(makeEvent("input"));
  byText(sheet, "button", "Add environment").click();
  const added = sheet.querySelectorAll(".env-group .review-row").at(-1);
  const [name, url] = added.querySelectorAll("input").filter(input => input.type !== "checkbox");
  name.value = "staging"; name.dispatchEvent(makeEvent("input"));
  url.value = "http://localhost:5180"; url.dispatchEvent(makeEvent("input"));
  byText(document.getElementById("sheet"), "button", "Add project").click();
  await flush();
  const [, params] = page.calls.find(([method]) => method === "confirmProject");
  assert.equal(params.root, "/synthetic/domo-cortex");
  assert.equal(params.contextUuid, HOME);
  assert.equal(params.manifest.version, 2);
  assert.deepEqual(params.manifest.environments.map(env => [env.app ?? null, env.name, env.base_url]), [
    ["desktop", "local", "http://localhost:1420"], ["web", "local", "http://localhost:5173"],
    ["web", "staging", "http://localhost:5180"], ["web", "production", "https://domo.example"]]);
  assert.ok(params.manifest.services.some(service => service.port === 5180), "a new local environment gets a dev server for its dot");
  assert.equal(document.getElementById("sheet").open, false);
  const placement = document.getElementById("placement");
  assert.equal(placement.hidden, false);
  assert.match(placement.textContent, /Tauri Plus Web was added to the space Home\. It is in that space's sidebar/u);
  byText(placement, "button", "Switch to Home").click();
  await flush();
  assert.deepEqual(page.calls.at(-1), ["openContext", { uuid: HOME }]);
  assert.ok(document.getElementById("project-p_domo1"), "the new project card is listed under its space");
});

// P2: one synthetic v2 project with its own container, a detected service and
// an account label the user typed earlier.
const HARBOR = { version: 2, id: "p_harbor1", root: "/synthetic/harbor", manifest_state: "none", context_uuid: HOME, trusted: false,
  created_at: 1, updated_at: 1,
  manifest: { version: 1, name: "Harbor", kind: "web", environments: [{ name: "local", base_url: "http://localhost:5101" }], services: [], surfaces: [] },
  detected: { at: 1, integrations: [{ id: "vercel", name: "Vercel", dashboard_url: "https://vercel.com/dashboard", sources: ["vercel.json"] }],
    platforms: [], domains: [], agents: { files: [], dirs: [], worktrees: 0 } },
  container: { user_context_id: 40 }, shared_sites: { hosts: ["github.com", "*.github.com"], confirmed: false },
  accounts: [{ key: "vercel", label: "work Google" }], brief: null };

function harborPage(extra = {}, { hash = "#project=p_harbor1" } = {}) {
  let state;
  const update = (id, change) => { state.projects = state.projects.map(project => (project.id === id ? change(project) : project)); return state.projects.find(p => p.id === id); };
  const pagePromise = loadPage({ hash, projects: [structuredClone(HARBOR)], containers: { p_harbor1: { state: "own", name: "Harbor", color: "cyan" } }, handlers: {
    listProjectContainers: () => [{ project_id: "p_harbor1", state: "own", name: "Harbor", color: "cyan" }],
    openProjectUrl: () => ({ opened: true, container: "project" }),
    setAccountLabel: ({ projectId, key, label }) => update(projectId, project => ({ ...project,
      accounts: [...project.accounts.filter(account => account.key !== key), ...(label === null ? [] : [{ key, label }])] })),
    setSharedSites: ({ projectId, hosts, confirmed }) => update(projectId, project => ({ ...project, shared_sites: { hosts, confirmed } })),
    ...extra } });
  return pagePromise.then(page => { state = page.state; return page; });
}
const homeSectionOf = (document, key) => document.getElementById("project-home").querySelector(`[data-section="${key}"]`);

test("P2: the home shows the own container in Firefox's colour, typed account labels and unconfirmed shared sites", async () => {
  const page = await harborPage();
  const accounts = homeSectionOf(page.document, "accounts");
  assert.equal(accounts.querySelector("h3").textContent, "Services and sign-ins");
  const line = accounts.querySelector(".container-line");
  assert.equal(line.textContent, "Own container");
  assert.equal(line.getAttribute("data-state"), "own");
  assert.match(accounts.textContent, /Links on this page open in it, so Harbor keeps its own sign-ins\. Firefox tabs only\. Chromium tabs do not have per-project sign-ins yet\./u);
  assert.deepEqual(line.querySelector(".container-mark").className.split(" "), ["container-mark", "identity-color-cyan"]);
  assert.equal(line.querySelector(".container-mark").getAttribute("aria-hidden"), "true");
  assert.deepEqual(accounts.querySelectorAll(".service-rows .row").map(row => [row.querySelector(".row-title").textContent, row.querySelector(".row-detail").textContent]),
    [["Vercel", "Account: work Google"]]);
  assert.equal(accounts.querySelector(".fact-text").textContent, "Not shared yet. Suggested: github.com, *.github.com");
  assert.equal(accounts.querySelector('[data-focus-key="project:p_harbor1:accounts"]').getAttribute("aria-label"), "Accounts for Harbor");
  assert.doesNotMatch(page.document.getElementById("project-home").textContent, /\b40\b|user_context/u, "no container ID is shown");
  assert.ok(page.document.querySelector('link[href="chrome://browser/content/usercontext/usercontext.css"]'), "Firefox's own colours");
  // The list card carries the same colour on its tile.
  await page.navigate("#projects");
  const tile = page.document.getElementById("project-p_harbor1").querySelector(".project-tile");
  assert.deepEqual([tile.className, tile.textContent, tile.getAttribute("aria-hidden")], ["project-tile identity-color-cyan", "H", "true"]);
});

test("P2: every project link on the home goes through the container router, never a plain openUrl", async () => {
  const page = await harborPage({ openProjectUrl: ({ url }) => ({ opened: true, container: url.includes("vercel") ? "off" : "project" }) });
  const home = page.document.getElementById("project-home");
  const button = label => home.querySelectorAll("button").find(node => node.getAttribute("aria-label") === label);
  button("Open Local at localhost:5101").click();
  await flush();
  button("Open the Vercel dashboard").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "openProjectUrl" || name === "openUrl"), [
    ["openProjectUrl", { projectId: "p_harbor1", url: "http://localhost:5101" }],
    ["openProjectUrl", { projectId: "p_harbor1", url: "https://vercel.com/dashboard" }]]);
  assert.match(page.document.getElementById("status").textContent, /containers are off/u, "a link without its container says so");
});

test("P2: account editor: labels the user types per service or site, sent one by one; bad sites are refused locally", async () => {
  const page = await harborPage();
  const { document } = page;
  byText(homeSectionOf(document, "accounts"), "button", "Edit accounts…").click();
  await flush();
  const sheet = document.getElementById("sheet-body");
  assert.equal(sheet.querySelector("h2").textContent, "Accounts for Harbor");
  assert.match(sheet.textContent, /never reads accounts, cookies or passwords from pages/u);
  const [vercel] = sheet.querySelectorAll("input.account-label");
  assert.deepEqual([vercel.value, vercel.getAttribute("aria-label"), vercel.getAttribute("maxlength")], ["work Google", "Account for Vercel", "80"]);
  vercel.value = "personal Google"; vercel.dispatchEvent(makeEvent("input"));
  byText(sheet, "button", "Add a site").click();
  const site = sheet.querySelector("input.account-site");
  assert.equal(document.activeElement, site, "focus moves to the new row");
  site.value = "not a site!"; site.dispatchEvent(makeEvent("input"));
  const label = sheet.querySelectorAll("input.account-label").at(-1);
  label.value = "Work Microsoft"; label.dispatchEvent(makeEvent("input"));
  byText(document.getElementById("sheet"), "button", "Save").click();
  await flush();
  assert.match(sheet.querySelector(".errors").textContent, /is not a site/u);
  assert.equal(page.calls.filter(([name]) => name === "setAccountLabel").length, 0, "nothing is sent while a row is invalid");
  site.value = "Linear.app"; site.dispatchEvent(makeEvent("input"));
  byText(document.getElementById("sheet"), "button", "Save").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "setAccountLabel"), [
    ["setAccountLabel", { projectId: "p_harbor1", key: "vercel", label: "personal Google" }],
    ["setAccountLabel", { projectId: "p_harbor1", key: "linear.app", label: "Work Microsoft" }]]);
  assert.equal(document.getElementById("sheet").open, false);
  assert.deepEqual(homeSectionOf(document, "accounts").querySelectorAll(".service-rows .row").map(row => row.textContent),
    ["VercelAccount: personal GoogleDashboard", "linear.appAccount: Work Microsoft"], "the home reads the saved labels back");
});

test("P2: shared-sites editor offers the suggestions and shares only after the user turns sharing on", async () => {
  const page = await harborPage();
  const { document } = page;
  byText(homeSectionOf(document, "accounts"), "button", "Review…").click();
  await flush();
  const sheet = document.getElementById("sheet-body");
  assert.equal(sheet.querySelector("h2").textContent, "Shared sites for Harbor");
  const hosts = sheet.querySelector("textarea");
  assert.equal(hosts.value, "github.com\n*.github.com");
  const share = sheet.querySelector('input[name="share-sites"]');
  assert.equal(share.checked, false, "suggestions are not shared yet");
  byText(sheet, "button", "Use the suggested sites").click();
  assert.equal(hosts.value.split("\n").length, 8);
  byText(document.getElementById("sheet"), "button", "Save").click();
  await flush();
  assert.deepEqual(page.calls.filter(([name]) => name === "setSharedSites").at(-1)[1].confirmed, false, "saving the list alone shares nothing");
  assert.match(homeSectionOf(document, "accounts").querySelector(".fact-text").textContent, /^Not shared yet\. Suggested: github\.com/u);
  byText(homeSectionOf(document, "accounts"), "button", "Review…").click();
  await flush();
  document.getElementById("sheet-body").querySelector('input[name="share-sites"]').click();
  byText(document.getElementById("sheet"), "button", "Save").click();
  await flush();
  const [, params] = page.calls.filter(([name]) => name === "setSharedSites").at(-1);
  assert.equal(params.confirmed, true);
  assert.equal(params.hosts.length, 8);
  const accounts = homeSectionOf(document, "accounts");
  assert.match(accounts.querySelector(".fact-text").textContent, /^Shared with the space: github\.com/u);
  assert.match(accounts.querySelector(".shared-line").textContent, /These use the sign-ins of Home\./u);
  assert.equal(byText(accounts, "button", "Edit…").getAttribute("aria-label"), "Shared sites of Harbor");
});

test("P2: the list card keeps editing secondary but reachable: its menu opens the same editors", async () => {
  const page = await harborPage({}, { hash: "#projects" });
  const card = page.document.getElementById("project-p_harbor1");
  assert.deepEqual(card.querySelectorAll(".menu-items button").map(button => button.textContent),
    ["Edit project…", "Accounts…", "Shared sites…", "Read folder again", "Save as .axiosozo/project.json…", "Remove project…"]);
  assert.equal(card.querySelector("summary").getAttribute("aria-label"), "More for Harbor");
  byText(card, "button", "Accounts…").click();
  await flush();
  assert.equal(page.document.getElementById("sheet-body").querySelector("h2").textContent, "Accounts for Harbor");
  byText(page.document.getElementById("sheet"), "button", "Cancel").click();
  byText(card, "button", "Shared sites…").click();
  await flush();
  assert.equal(page.document.getElementById("sheet-body").querySelector("h2").textContent, "Shared sites for Harbor");
});

test("#add-project=<space> from the space menu preselects that space; #edit-project opens the editor", async () => {
  const page = await loadPage({ hash: `#add-project=${BV}` });
  await flush();
  assert.equal(page.location.hash, "#projects");
  assert.equal(page.calls.filter(([name]) => name === "pickFolder").length, 1);
  const sheet = page.document.getElementById("sheet-body");
  const space = sheet.querySelectorAll("select").find(select => select.querySelector("option")?.textContent.startsWith("No space"));
  assert.equal(space.value, BV);

  const project = { version: 1, id: "p_blog1", root: "/synthetic/blog", manifest_state: "none", context_uuid: HOME, trusted: false, created_at: 1, updated_at: 1,
    manifest: { version: 1, name: "Blog", kind: "web", environments: [{ name: "local", base_url: "http://localhost:4321" }],
      services: [{ name: "Dev server", url: "http://localhost:4321/", port: 4321 }], surfaces: [] } };
  const edit = await loadPage({ hash: "#edit-project=p_blog1", projects: [project] });
  assert.equal(edit.document.getElementById("sheet-body").querySelector("h2").textContent, "Edit Blog");
  assert.equal(edit.location.hash, "#project=p_blog1", "the editor opens over the project's home");
  assert.equal(edit.document.getElementById("project-home").hidden, false);
  assert.equal(edit.document.activeElement?.id, "sheet-title", "the home does not take focus from the open editor");
});
