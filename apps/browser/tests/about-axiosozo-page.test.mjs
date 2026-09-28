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

async function loadPage({ hash = "", projects = [], handlers = {} } = {}) {
  const document = parseHtml(HTML);
  const calls = [];
  const subscribers = [];
  const state = { projects: [...projects] };
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
  assert.deepEqual(document.querySelectorAll(".space-group .space-name").map(h => h.textContent), ["Homethis window", "Acme BV"]);
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
});
