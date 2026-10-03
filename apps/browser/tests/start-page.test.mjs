/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// P6 (experimental, axiosozo.home.enabled off by default): the start page on
// the real about:axiosozo HTML and script in support/mini-dom.mjs with a fake
// window.AxioSozoOverview. #home is the start page only while the actor reports
// the flag on; otherwise it stays the old link to Projects. It shows what needs
// you, agents, projects and watches from existing guarded reads only, with
// unavailable parts said so; no feed, news or shortcuts, and nothing started.
// Synthetic: not evidence of Gecko rendering, light/dark or VoiceOver.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Node, parseHtml, makeEvent } from "./support/mini-dom.mjs";

const M = await import("../chrome/overview/overview-model.mjs");
const HTML = readFileSync(new URL("../chrome/overview/about-axiosozo.html", import.meta.url), "utf8");
const flush = async (rounds = 10) => { for (let i = 0; i < rounds; i++) await new Promise(resolve => setTimeout(resolve, 0)); };
let serial = 0;

const MANIFEST = { version: 1, name: "Harbor Suite", kind: "web", environments: [{ name: "local", base_url: "http://localhost:5173" }],
  services: [{ name: "Web dev server", url: "http://localhost:5173/", port: 5173 }], surfaces: [] };
const HARBOR = { version: 2, id: "p_harbor1", root: "/Volumes/Synthetic/harbor", manifest: MANIFEST, manifest_state: "none", context_uuid: null,
  trusted: false, created_at: 1, updated_at: 2, detected: null, container: { user_context_id: null }, shared_sites: { hosts: [], confirmed: false }, accounts: [], brief: null };
const INKLINE = { ...HARBOR, id: "p_inkline1", root: "/Volumes/Synthetic/inkline", manifest: { ...MANIFEST, name: "Inkline", services: [] } };
const WATCH = { version: 1, id: "w_fixture1", project_id: "p_harbor1", created_by: "user", revision: 1, url: "https://status.example/deploy",
  question: "Is the deploy finished?", outcomes: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }], observation: "address", provider: "jev",
  consent: true, enabled: true, schedule: { interval_minutes: 5, last_checked_at: 2000 }, created_at: 1000, updated_at: 2000,
  latest_result: { request_id: "wreq_fixture1", checked_at: 2000, outcome: "unknown", reason: "NOT_AUTHORIZED", confidence: null, data_sent: false, provider: "jev" } };
const record = (patch = {}) => ({ version: 1, id: "as_0123456789abcdef", agent: "claude-code", state: "done", title: "Booking flow fixed",
  at: Date.now() - 5 * 60_000, project_path: "/Volumes/Synthetic/harbor", ...patch });

async function loadPage({ hash = "#home", flags = { home: true }, handlers = {}, homes = {} } = {}) {
  const document = parseHtml(HTML);
  const calls = [], subscribers = [];
  const state = { flags: { contexts: true, enginePreferences: false, jevKeyEntry: true, ...flags } };
  const defaults = {
    getOverviewFlags: () => ({ ...state.flags }),
    activeContext: () => ({ uuid: null }), listContexts: () => [], listProjects: () => [structuredClone(HARBOR), structuredClone(INKLINE)],
    listProjectContainers: () => [], listRules: () => [], usageSummary: () => [], listOrphans: () => [],
    getJevSettings: () => ({ consent: false, interval_minutes: 5, hourly_budget: 30 }),
    needsAttention: () => [{ kind: "service_down", title: "Web dev server is not responding", detail: "Harbor Suite · http://localhost:5173/",
      target: { type: "project", id: "p_harbor1" } }],
    serviceStatus: ({ projectId }) => (projectId === "p_harbor1" ? [{ name: "Web dev server", url: "http://localhost:5173/", port: 5173, status: "down", checked_at: 1 }] : []),
    listWatches: () => [structuredClone(WATCH)],
    getWatchStatus: () => ({ closed: false, scheduled: false, loaded: true, busy: false, phase: null, cleanup_required: false, recovery_required: false,
      retry_allowed: false, pending_disclosure: false, last: null, last_error: null, residual: null }),
    getProjectHome: ({ id }) => {
      if (Object.hasOwn(homes, id) && homes[id] instanceof Error) throw { code: "PROJECT_CHANGED" };
      const project = id === "p_harbor1" ? HARBOR : INKLINE;
      const { container: _c, ...stored } = structuredClone(project);
      return { version: 1, project: stored, space: null, container: { state: "pending" },
        agent_activity: homes[id] ?? { records: [], reporting: true, sessions: [] }, console_errors: null };
    },
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
  const listeners = new Map();
  const location = { hash };
  Object.assign(globalThis, {
    document, Node, location,
    window: { AxioSozoOverview: api, addEventListener: (type, fn) => listeners.set(type, fn) },
    history: { replaceState: (_s, _t, url) => { location.hash = url; } },
    CSS: { escape: value => String(value).replace(/["\\]/g, "\\$&") },
  });
  await import(`../chrome/overview/about-axiosozo.mjs?start=${++serial}`);
  await flush();
  const $ = id => document.getElementById(id);
  const navigate = async next => { location.hash = next; listeners.get("hashchange")?.(); await flush(); };
  const emit = async name => { for (const callback of subscribers) callback({ name }); await new Promise(resolve => setTimeout(resolve, 130)); await flush(); };
  return { document, calls, state, location, $, navigate, emit, names: () => calls.map(([name]) => name),
    visible: () => document.querySelectorAll("section.view").filter(section => !section.hidden).map(section => section.dataset.view),
    section: key => $("start-page").querySelector(`[data-section="${key}"]`) };
}

test("routes: #home is the start page only with the flag; every existing deep link keeps its meaning", () => {
  assert.deepEqual(M.routeFromHash("#home", { home: true }), { view: "home" });
  assert.deepEqual(M.routeFromHash("#home"), { view: "projects", legacy: true }, "flag off: the old Projects link");
  assert.deepEqual(M.routeFromHash("#home", { home: false }), { view: "projects", legacy: true });
  for (const [hash, route] of [["#projects", { view: "projects" }], ["#rules", { view: "rules" }], ["#ai", { view: "ai" }],
    ["#settings", { view: "ai", legacy: true }], ["#time", { view: "rules", legacy: true }], ["#project=p_harbor1", { view: "projects", project: "p_harbor1" }],
    ["#edit-project=p_harbor1", { view: "projects", project: "p_harbor1", edit: true }], ["#rule=r_abcd", { view: "rules", rule: "r_abcd" }]]) {
    assert.deepEqual(M.routeFromHash(hash, { home: true }), route, hash);
  }
  assert.deepEqual([M.isHomeHash("#home"), M.isHomeHash("#%68ome"), M.isHomeHash("#home=1"), M.isHomeHash("#homes")], [true, true, false, false]);
});

test("flag on: the start page shows what needs you, agents, projects and watches, with its own link first in the views", async () => {
  const page = await loadPage({ homes: { p_harbor1: { records: [record()], reporting: true, sessions: [] } } });
  assert.deepEqual(page.visible(), ["home"]);
  const links = page.document.querySelectorAll(".views a");
  assert.deepEqual(links.map(link => [link.getAttribute("href"), link.firstChild.textContent]), [["#home", "Start"], ["#projects", "Projects"], ["#rules", "Site rules"], ["#ai", "AI & keys"]]);
  assert.equal(links[1].querySelector(".count").textContent, "1", "the Projects attention count stays where it was");
  assert.equal(page.document.querySelector('.views a[aria-current="page"]').dataset.view, "home");
  const root = page.$("start-page");
  assert.equal(root.hasAttribute("aria-busy"), false);
  assert.equal(page.$("start-heading").textContent, "Start");
  assert.deepEqual(root.querySelectorAll("section.start-section h3").map(h3 => h3.firstChild.textContent ?? h3.textContent),
    ["What needs you", "Agents", "Projects", "Watches"]);
  for (const section of root.querySelectorAll("section.start-section")) assert.equal(page.$(section.getAttribute("aria-labelledby"))?.localName, "h3");
  assert.match(page.section("needs").textContent, /Web dev server is not responding/u);
  assert.equal(page.section("needs").querySelector("a").getAttribute("href"), "#project=p_harbor1");
  assert.match(page.section("agents").textContent, /DoneHarbor Suite: Claude Code, Booking flow fixed5 min ago/u);
  const projects = page.section("projects").querySelectorAll("a.start-link");
  assert.deepEqual(projects.map(link => [link.textContent, link.getAttribute("href")]), [["Harbor Suite", "#project=p_harbor1"], ["Inkline", "#project=p_inkline1"]]);
  assert.equal(root.querySelector(".project-link"), null, "never the project card's stretched link");
  assert.match(page.section("projects").textContent, /Local server not running/u);
  const watch = page.section("watches").querySelector("li.watch-row");
  assert.equal(watch.id, "start-watch-w_fixture1", "its own ids: the project home's row keeps watch-<id>");
  assert.equal(page.document.getElementById("watch-w_fixture1"), null);
  assert.match(watch.textContent, /Is the deploy finished\?/u);
  assert.match(watch.textContent, /Harbor Suite/u, "names its project");
  assert.match(watch.querySelector(".watch-result").textContent, /^Not checked: live checks are not authorized in this build/u);
  assert.equal(page.section("watches").querySelectorAll("button").length, 0, "watches are changed on their project's page only");
  assert.match(page.section("watches").textContent, /Live checks are not authorized in this build/u);
  assert.doesNotMatch(root.textContent, /\bnull\b|\bundefined\b|\[object /u);
  assert.doesNotMatch(root.textContent, /\b(news|feed|trending|top sites|shortcut)/iu, "no feed, news or shortcuts");
});

test("start page links are bounded to their own text and keep a visible focus ring; the card-only stretched rules never reach them", () => {
  const css = readFileSync(new URL("../chrome/overview/about-axiosozo.css", import.meta.url), "utf8");
  const rules = selector => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gu)].filter(([, selectors]) => selectors.split(",").some(item => item.includes(selector)))
    .map(([, selectors, body]) => [selectors.trim(), body.trim()]);
  const own = rules(".start-link");
  assert.ok(own.some(([selectors, body]) => /\.start-link:focus-visible/u.test(selectors) && /outline:\s*var\(--focus-outline\)/u.test(body)), "a visible focus ring");
  for (const [selectors, body] of own) {
    assert.doesNotMatch(body, /position:\s*absolute|inset:|outline:\s*none/u, `${selectors}: no stretched hit area, no hidden focus`);
    assert.doesNotMatch(selectors, /::after|::before/u);
  }
  // The stretched ::after and the suppressed focus belong to project cards only.
  for (const [selectors] of rules(".project-link")) assert.doesNotMatch(selectors, /\.start/u, selectors);
  const page = readFileSync(new URL("../chrome/overview/about-axiosozo.mjs", import.meta.url), "utf8");
  const start = page.slice(page.indexOf("function renderStartPage()"), page.indexOf("function renderHomeLink()"));
  assert.doesNotMatch(start, /project-link/u);
  assert.match(start, /class: "row-title start-link"/u);
});

test("the start page only reads; it starts no endpoint, provider, Understand read, key check or safety owner", async () => {
  const page = await loadPage();
  const READS = new Set(["getOverviewFlags", "activeContext", "listContexts", "listProjects", "listProjectContainers", "listRules", "getJevSettings",
    "usageSummary", "listOrphans", "needsAttention", "serviceStatus", "listWatches", "getWatchStatus", "getProjectHome"]);
  assert.deepEqual([...new Set(page.names())].filter(name => !READS.has(name)), []);
  assert.deepEqual(page.calls.filter(([name]) => name === "getProjectHome").map(([, params]) => params.id).sort(), ["p_harbor1", "p_inkline1"],
    "each project's own guarded home, by id only");
});

test("unavailable parts say so; nothing is guessed", async () => {
  const page = await loadPage({ homes: { p_harbor1: new Error("changing"), p_inkline1: null },
    handlers: { listWatches: () => { throw { code: "PRIVATE_WINDOW" }; }, needsAttention: () => [] } });
  assert.equal(page.section("needs").textContent.trim().endsWith("Nothing needs you right now."), true);
  assert.equal(page.section("agents").querySelector("p").textContent, M.AGENTS_UNAVAILABLE);
  assert.equal(page.section("watches").querySelector("p").textContent, "Watches cannot be shown right now.");
  const blocked = await loadPage({ handlers: { getWatchStatus: () => ({ closed: false, scheduled: false, loaded: true, busy: false, phase: null,
    cleanup_required: true, recovery_required: false, retry_allowed: true, pending_disclosure: false, last: null, last_error: null, residual: null }) } });
  assert.match(blocked.section("needs").textContent, /A watch needs you/u);
});

test("flag off: #home stays the old link to Projects; no Start link; before admission the route waits for the flags", async () => {
  const off = await loadPage({ flags: { home: false } });
  assert.equal(off.location.hash, "#projects");
  assert.deepEqual(off.visible(), ["projects"]);
  assert.equal(off.document.querySelector('.views a[data-view="home"]'), null);
  assert.ok(!off.names().includes("getProjectHome"), "no start-page reads");
  // Before the actor admitted the page, #home is not redirected: the flags are not known yet.
  let release;
  const held = new Promise(resolve => { release = resolve; });
  const waiting = await loadPage({ handlers: { getOverviewFlags: () => held.then(() => ({ contexts: true, home: true })) } });
  assert.equal(waiting.location.hash, "#home");
  assert.deepEqual(waiting.visible(), ["home"]);
  assert.ok(waiting.$("start-page").hasAttribute("aria-busy"));
  release();
  await flush(20);
  assert.deepEqual([waiting.location.hash, waiting.visible()], ["#home", ["home"]]);
  assert.equal(waiting.$("start-heading").textContent, "Start");
});

test("an open start page is not navigated away when the flag is later turned off; its link and other views still work", async () => {
  const page = await loadPage();
  page.state.flags.home = false; // the pref turned off while this tab is open
  await page.emit("projects");
  await page.emit("watches");
  assert.deepEqual([page.location.hash, page.visible()], ["#home", ["home"]]);
  await page.navigate("#rules");
  assert.deepEqual(page.visible(), ["rules"]);
  await page.navigate("#home");
  assert.deepEqual(page.visible(), ["home"], "this page keeps the flags it was admitted with");
  page.$("start-page").querySelector('a[data-focus-key="start:project:p_harbor1"]').dispatchEvent(makeEvent("click"));
  await page.navigate("#project=p_harbor1");
  assert.deepEqual(page.visible(), ["projects"]);
  assert.equal(page.$("project-home").hidden, false);
});
