/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Pure about:axiosozo model for Plan 4 step 1: what static detection found
// (workstation-v1 §1) shown as text, and readable error texts. Uses the core's
// synthetic expected drafts (harbor-suite, inkline); no reference repository.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as M from "../chrome/overview/overview-model.mjs";

const expected = name => JSON.parse(readFileSync(new URL(`../../../packages/contexts/tests/expected/${name}.json`, import.meta.url), "utf8"));

test("detection summary: services, native and mobile apps, domains and agent presence from a v2 draft", () => {
  const summary = M.detectionSummary(expected("harbor-suite"));
  assert.deepEqual(summary.integrations.map(item => item.name).slice(0, 3), ["Vercel", "Convex", "Clerk"]);
  assert.ok(summary.integrations.every(item => item.url === null || item.url.startsWith("https://")));
  assert.ok(summary.integrations.find(item => item.id === "convex").sources.includes("convex/"));
  assert.deepEqual(summary.platforms.map(item => item.label),
    ["Desktop (Tauri) · Harbor Suite", "macOS · HarborMac", "iOS · HarborMobile", "Android · mobile-app"]);
  assert.deepEqual(summary.configuredDomains.map(item => item.host),
    ["harborsuite.app", "www.harborsuite.app", "docs.harborsuite.app", "api.harborsuite.app"]);
  assert.deepEqual(summary.documentedDomains, []);
  assert.deepEqual(summary.agents, ["AGENTS.md", "CLAUDE.md", ".claude", "2 agent worktrees"]);
  assert.equal(summary.empty, false);
});

test("detection summary keeps documented domains apart so the page can mark them unconfirmed", () => {
  const draft = expected("inkline");
  const summary = M.detectionSummary(draft);
  const docs = draft.domains.filter(domain => domain.origin === "docs").map(domain => domain.host);
  assert.ok(docs.length >= 1 && summary.configuredDomains.length >= 1, "inkline has both kinds");
  assert.deepEqual(summary.documentedDomains.map(item => item.host), docs);
  assert.ok(summary.configuredDomains.every(item => !docs.includes(item.host)));
  assert.match(M.DOCUMENTED_DOMAIN_NOTE, /found in docs, unconfirmed/iu);
  const synthetic = M.detectionSummary({ domains: [
    { host: "app.synthetic.dev", origin: "vercel_json", source: "vercel.json redirects[].destination", confirmed: false },
    { host: "api.synthetic.dev", origin: "docs", source: "docs/production/domains.md", confirmed: false }] });
  assert.deepEqual(synthetic.configuredDomains, [{ host: "app.synthetic.dev", source: "vercel.json redirects[].destination" }]);
  assert.deepEqual(synthetic.documentedDomains, [{ host: "api.synthetic.dev", source: "docs/production/domains.md" }]);
});

test("detection summary is safe on null, legacy and hostile snapshots", () => {
  for (const value of [null, undefined, {}, { integrations: "x", platforms: [null], domains: [{}], agents: { files: [1], dirs: null, worktrees: -1 } }]) {
    const summary = M.detectionSummary(value);
    assert.equal(summary.empty, true, JSON.stringify(value));
    assert.doesNotMatch(JSON.stringify(summary), /undefined|null,|\[object/u);
  }
  const hostile = M.detectionSummary({ integrations: [{ id: "x", name: "<img src=x onerror=1>", dashboard_url: "javascript:alert(1)", sources: [] }],
    platforms: [{ kind: "windows", name: "Nope" }], agents: { files: ["AGENTS.md"], dirs: [".agent-worktrees"], worktrees: 0 } });
  assert.deepEqual(hostile.integrations, [{ id: "x", name: "<img src=x onerror=1>", url: null, sources: [] }], "text, never a link to a non-web URL");
  assert.deepEqual(hostile.platforms, [], "unknown platform kinds are not shown");
  assert.deepEqual(hostile.agents, ["AGENTS.md", ".agent-worktrees"]);
  assert.deepEqual(M.detectionSummary({ agents: { files: [], dirs: [".agent-worktrees"], worktrees: 1 } }).agents, ["1 agent worktree"]);
});

test("the add-project review carries the findings of the draft; an edited project has none", () => {
  const review = M.draftToReview(expected("harbor-suite"), { contextUuid: null });
  assert.equal(review.findings.platforms.length, 4);
  assert.equal(review.findings.agents.length, 4);
  const project = { id: "p_synthetic1", context_uuid: null, manifest: { version: 1, name: "Synthetic", kind: "web",
    environments: [], services: [], surfaces: [] } };
  assert.equal(M.projectToReview(project).findings.empty, true);
});

test("P2 lists match the contexts core and Firefox's container colours", async () => {
  const core = await import("../../../packages/contexts/src/index.mjs");
  const { CONTAINER_COLOR_NAMES } = await import("../chrome/ProjectAccountRuntime.sys.mjs");
  assert.deepEqual([...M.DEFAULT_SHARED_SITES], [...core.DEFAULT_SHARED_SITES]);
  assert.deepEqual(M.INTEGRATION_NAMES, Object.fromEntries(core.INTEGRATIONS.map(item => [item.id, item.name])));
  assert.deepEqual([...M.CONTAINER_COLORS], [...CONTAINER_COLOR_NAMES]);
});

test("Sign-ins line: own container in its real colour, pending, off, unavailable; unknown leaves the row out", () => {
  assert.deepEqual(M.containerSummary({ project_id: "p_a1b2", state: "own", name: "Harbor Suite", color: "cyan" }),
    { state: "own", text: "Own container", name: "Harbor Suite", color: "cyan" });
  assert.equal(M.containerSummary({ state: "own", name: "X", color: "javascript:x" }).color, null);
  assert.match(M.containerSummary({ state: "pending" }).text, /made when you first open one of its links/u);
  assert.match(M.containerSummary({ state: "off" }).text, /Containers are off/u);
  assert.match(M.containerSummary({ state: "unavailable" }).text, /being reset/u);
  for (const info of [undefined, null, {}, { state: "constructor" }]) assert.equal(M.containerSummary(info), null);
});

test("shared sites: suggestions are listed as not shared until the user turns sharing on", () => {
  const legacy = M.sharedSites({ id: "p_a1b2" });
  assert.deepEqual([legacy.hosts, legacy.confirmed], [[...M.DEFAULT_SHARED_SITES], false], "a record without the field has the unconfirmed defaults");
  assert.equal(legacy.text, "Not shared yet. Suggested: github.com, *.github.com, gitlab.com and 5 more");
  assert.equal(M.sharedSites({ shared_sites: { hosts: ["github.com"], confirmed: true } }).text, "Shared with the space: github.com");
  assert.match(M.sharedSites({ shared_sites: { hosts: [], confirmed: true } }).text, /^None/u);
  assert.deepEqual(M.sharedSitesForm({ shared_sites: { hosts: ["github.com", "*.github.com"], confirmed: false } }),
    { hostsText: "github.com\n*.github.com", confirmed: false });
  assert.deepEqual(M.formToSharedSites({ hostsText: "GitHub.com\nhttps://gist.github.com/x, *.github.com github.com", confirmed: true }),
    { sites: { hosts: ["github.com", "gist.github.com", "*.github.com"], confirmed: true }, errors: [] });
  assert.deepEqual(M.formToSharedSites({ hostsText: "", confirmed: "yes" }), { sites: { hosts: [], confirmed: false }, errors: [] });
  assert.equal(M.formToSharedSites({ hostsText: "not a host!", confirmed: true }).sites, null);
  assert.match(M.formToSharedSites({ hostsText: Array.from({ length: 33 }, (_, i) => `s${i}.example`).join("\n") }).errors[0], /at most 32/u);
});

test("account rows: services found in the folder, then labelled sites; changes, removals and refusals", () => {
  const project = { detected: { integrations: [{ id: "convex" }, { id: "vercel" }, { id: "unknown" }] },
    accounts: [{ key: "stripe", label: "billing" }, { key: "*.atlassian.net", label: "Work Microsoft" }] };
  const rows = M.accountRows(project);
  assert.deepEqual(rows.map(row => [row.key, row.name, row.label, row.kind]), [
    ["vercel", "Vercel", "", "service"], ["convex", "Convex", "", "service"], ["stripe", "Stripe", "billing", "service"],
    ["*.atlassian.net", "*.atlassian.net", "Work Microsoft", "site"]]);
  rows[0].label = "  work Google ";
  rows[2].label = "";
  rows.push({ key: "Linear.app", name: "", label: "Personal", kind: "site", added: true }, { key: "", label: "", added: true });
  assert.deepEqual(M.accountChanges(rows, project), { changes: [
    { key: "vercel", label: "work Google" }, { key: "stripe", label: null }, { key: "linear.app", label: "Personal" }], errors: [] });
  assert.deepEqual(M.accountChanges(M.accountRows(project), project), { changes: [], errors: [] }, "nothing changed");
  const refuse = extra => M.accountChanges([...M.accountRows(project), ...extra], project);
  assert.match(refuse([{ key: "linear", label: "x", added: true }]).errors[0], /not a site/u, "a site has a dot, never an integration id");
  assert.match(refuse([{ key: "linear.app", label: "", added: true }]).errors[0], /Type the account/u);
  assert.match(refuse([{ key: "linear.app", label: "a\u0085b", added: true }]).errors[0], /one line/u);
  assert.match(refuse([{ key: "linear.app", label: "x".repeat(81), added: true }]).errors[0], /80 characters/u);
  assert.match(refuse([{ key: "*.Atlassian.net", label: "again", added: true }]).errors[0], /listed twice/u);
  const many = Array.from({ length: 31 }, (_, i) => ({ key: `s${i}.example`, label: "x", added: true }));
  assert.match(refuse(many).errors[0], /at most 32/u);
  assert.equal(refuse(many).changes, null);
});

test("a project link that did not get its own container says so", () => {
  assert.match(M.openedNote({ opened: true, container: "off" }), /containers are off/u);
  assert.match(M.openedNote({ opened: true, container: "private" }), /private window/u);
  assert.match(M.openedNote({ opened: true, container: "project", selected: false }), /new tab behind this one/u,
    "Firefox kept the current tab in front: said plainly, never claimed as shown");
  for (const container of ["project", "shared_site", undefined]) assert.equal(M.openedNote({ opened: true, container, selected: true }), null);
});

// ---------------------------------------------------------------- project home (Plan 4 step 3)

const SHOP = { version: 2, id: "p_shop1", root: "/Volumes/Synthetic/shop", manifest_state: "none", context_uuid: null,
  manifest: { version: 2, name: "Shop", kind: "web", surfaces: [],
    environments: [
      { app: "web", name: "production", base_url: "https://shop.example.dev" },
      { app: "web", name: "local", base_url: "http://localhost:5173" },
      { app: "web", name: "preview", base_url: "https://preview.shop.example.dev/app" },
      { app: "admin", name: "local", base_url: "http://127.0.0.1:5174" },
      { app: "desktop", name: "local", base_url: "http://localhost:1420" }],
    services: [
      { app: "web", name: "web dev server", url: "http://localhost:5173/", port: 5173 },
      { app: "admin", name: "admin dev server", url: "http://127.0.0.1:5174/", port: 5174 },
      { app: "desktop", name: "Tauri", url: "http://localhost:1420/", port: 1420 }] },
  detected: null, shared_sites: { hosts: [], confirmed: false }, accounts: [], brief: null };

test("home route: only a valid project id makes a home; anything else is the list", () => {
  assert.equal(M.homeHash("p_shop1"), "#project=p_shop1");
  for (const bad of ["../p_x", "/Volumes/Synthetic/shop", "P_SHOP1", "p_x", 40, null, undefined, "p_shop1#x"]) {
    assert.equal(M.homeHash(bad), "#projects", String(bad));
  }
  assert.equal(M.homeIdFromRoute(M.routeFromHash("#project=p_shop1")), "p_shop1");
  for (const hash of ["#projects", "#edit-project=p_shop1", "#rule=r_abcd", "#project=../x", "#project=%2FVolumes%2Fx", "#project=12", "#ai"]) {
    assert.equal(M.homeIdFromRoute(M.routeFromHash(hash)), null, hash);
  }
  assert.equal(M.homeIdFromRoute({ view: "rules", project: "p_shop1" }), null);
  assert.equal(M.homeIdFromRoute({ view: "projects", project: "/etc" }), null);
});

test("home environments: per app, local first and production last, with only honest statuses", () => {
  const statuses = [{ name: "web dev server", url: "http://localhost:5173/", port: 5173, status: "up" },
    { name: "admin dev server", url: "http://127.0.0.1:5174/", port: 5174, status: "down" }];
  const groups = M.homeEnvironments(SHOP, statuses);
  assert.deepEqual(groups.map(group => group.label), ["web", "admin", "desktop"]);
  assert.deepEqual(groups[0].rows.map(row => [row.label, row.address, row.status, row.statusText]), [
    ["Local", "localhost:5173", "up", "Running"],
    ["Preview", "preview.shop.example.dev/app", "remote", "Not checked"],
    ["Production", "shop.example.dev", "remote", "Not checked"]]);
  assert.deepEqual(groups[1].rows.map(row => [row.status, row.statusText]), [["down", "Not running"]]);
  assert.deepEqual(groups[2].rows.map(row => [row.status, row.statusText]), [["unchecked", "Not checked yet"]]);
  assert.equal(M.homeEnvironments(SHOP, [], { checking: true })[2].rows[0].statusText, "Checking…");
  assert.equal(groups[0].rows[0].openLabel, "Open web Local at localhost:5173");
  assert.match(M.STATUS_NOTE, /never contacted/u, "remote addresses are never claimed as checked");
  // A single-app project needs no app labels; a hostile or non-web address is left out.
  const single = M.homeEnvironments({ manifest: { environments: [{ name: "local", base_url: "http://localhost:3000" },
    { name: "evil", base_url: "javascript:alert(1)" }, { name: "creds", base_url: "https://u:p@x.example" }], services: [] } });
  assert.deepEqual(single.map(group => [group.label, group.rows.map(row => row.openLabel)]), [[null, ["Open Local at localhost:3000"]]]);
});

test("project card and local summary: labelled phrases from what is stored and checked", () => {
  const statuses = [{ name: "web dev server", url: "http://localhost:5173/", port: 5173, status: "up" },
    { name: "admin dev server", url: "http://127.0.0.1:5174/", port: 5174, status: "down" },
    { name: "Tauri", url: "http://localhost:1420/", port: 1420, status: "up" }];
  const card = M.projectCard(SHOP, { statuses, container: { project_id: "p_shop1", state: "own", name: "Shop", color: "purple" } });
  assert.deepEqual([card.name, card.monogram, card.href, card.color, card.kind, card.folder, card.inRepo],
    ["Shop", "S", "#project=p_shop1", "purple", "Web project", "/Volumes/Synthetic/shop", false]);
  assert.deepEqual(card.local, { tone: "warn", text: "2 of 3 local servers running" });
  assert.deepEqual(card.facts, [{ label: "Apps", text: "web, admin, desktop" }]);
  assert.deepEqual(M.localSummary(SHOP, []), { tone: "unknown", text: "Local servers not checked yet" });
  assert.deepEqual(M.localSummary(SHOP, statuses.slice(0, 1)), { tone: "unknown", text: "1 running, 2 not checked yet" });
  assert.deepEqual(M.localSummary(SHOP, statuses.slice(1, 2)), { tone: "down", text: "1 not running, 2 not checked yet" });
  assert.equal(M.localSummary({ manifest: { services: [{ url: "https://shop.example.dev/", port: 443 }] } }), null, "remote services are never summarized");
  assert.equal(M.projectCard(SHOP, { container: { state: "pending" } }).color, null);
  assert.equal(M.projectCard(SHOP, { container: { state: "own", color: "url(x)" } }).color, null);
  assert.deepEqual([M.monogram("  émile"), M.monogram("<img>"), M.monogram("—"), M.monogram("")], ["É", "I", "?", "?"]);
  assert.equal(M.displayAddress("https://user:pw@example.com/"), "", "never an address with credentials");
});

test("a check that could not tell is not 'not checked yet', not running and not down; per service and in summary", () => {
  const status = (name, url, port, value) => ({ name, url, port, status: value, checked_at: 1 });
  const web = status("web dev server", "http://localhost:5173/", 5173, "unknown");
  const admin = status("admin dev server", "http://127.0.0.1:5174/", 5174, "unknown");
  const desktop = status("Tauri", "http://localhost:1420/", 1420, "unknown");
  const single = { manifest: { environments: [{ name: "local", base_url: "http://localhost:5173" }], services: [{ name: "web dev server", url: "http://localhost:5173/", port: 5173 }] } };
  // One service: failed, never attempted, and the actual probe answers.
  assert.deepEqual(M.localSummary(single, [web]), { tone: "unknown", text: "Local server could not be checked" });
  assert.deepEqual(M.localSummary(single, []), { tone: "unknown", text: "Local server not checked yet" });
  assert.deepEqual(M.localSummary(single, [{ ...web, status: "up" }]), { tone: "up", text: "Local server running" });
  assert.deepEqual(M.localSummary(single, [{ ...web, status: "down" }]), { tone: "down", text: "Local server not running" });
  assert.deepEqual(M.localSummary(single, [{ ...web, status: "bogus" }]), { tone: "unknown", text: "Local server not checked yet" }, "an unknown value is no answer");
  assert.equal(M.environmentStatus(single, single.manifest.environments[0], [web]), "unknown");
  assert.equal(M.homeEnvironments(single, [web])[0].rows[0].statusText, "Could not check");
  // Several services: every mix keeps the four answers apart.
  assert.deepEqual(M.localSummary(SHOP, [web, admin, desktop]), { tone: "unknown", text: "Local servers could not be checked" });
  assert.deepEqual(M.localSummary(SHOP, [web]), { tone: "unknown", text: "1 could not be checked, 2 not checked yet" });
  assert.deepEqual(M.localSummary(SHOP, [{ ...web, status: "up" }, admin]), { tone: "unknown", text: "1 running, 1 could not be checked, 1 not checked yet" });
  assert.deepEqual(M.localSummary(SHOP, [{ ...web, status: "up" }, { ...admin, status: "down" }, desktop]),
    { tone: "warn", text: "1 running, 1 not running, 1 could not be checked" });
  assert.deepEqual(M.localSummary(SHOP, [{ ...web, status: "down" }, admin, desktop]), { tone: "down", text: "1 not running, 2 could not be checked" });
  for (const summary of [M.localSummary(SHOP, [web, admin, desktop]), M.localSummary(single, [web])]) {
    assert.doesNotMatch(summary.text, /running|not checked yet/u, "a failed check is never claimed as running, down or unattempted");
  }
});

test("the home route is exact: one valid id after decoding, nothing more; other hashes keep their parsing", () => {
  for (const hash of ["#project=p_synthetic1", "#project%3Dp_synthetic1", "project=p_synthetic1"]) {
    assert.deepEqual(M.routeFromHash(hash), { view: "projects", project: "p_synthetic1" }, hash);
    assert.equal(M.homeIdFromRoute(M.routeFromHash(hash)), "p_synthetic1", hash);
  }
  for (const hash of ["#project=p_synthetic1=extra", "#project=p_synthetic1%3Dextra", "#project=p_synthetic1=/", "#project=p_synthetic1/",
    "#project=p_synthetic1&x=1", "#project=p_synthetic1%0A", "#project=p_synthetic1 ", "#project=", "#project", "#project=p_x",
    "#project=P_SYNTHETIC1", "#project=%2FVolumes%2FT9%2FCode%2Fshop", "#project=40", "#project==p_synthetic1"]) {
    assert.deepEqual(M.routeFromHash(hash), { view: "projects" }, hash);
    assert.equal(M.homeIdFromRoute(M.routeFromHash(hash)), null, hash);
  }
  // Unrelated deep links keep their behaviour.
  assert.deepEqual(M.routeFromHash("#edit-project=p_synthetic1"), { view: "projects", project: "p_synthetic1", edit: true });
  assert.deepEqual(M.routeFromHash("#rule=r_abcd"), { view: "rules", rule: "r_abcd" });
  assert.deepEqual(M.routeFromHash("#add-project={11111111-1111-4111-8111-111111111111}"),
    { view: "projects", addTo: "{11111111-1111-4111-8111-111111111111}" });
  assert.deepEqual([M.routeFromHash("#rules"), M.routeFromHash("#settings")], [{ view: "rules" }, { view: "ai", legacy: true }]);
});

test("home services: fixed integration names with the user's own labels, then labelled sites; dashboards only from detection", () => {
  const project = { detected: { integrations: [
    { id: "convex", name: "Convex", dashboard_url: "https://dashboard.convex.dev", sources: ["convex/"] },
    { id: "unknown", name: "<img src=x onerror=alert(1)>", dashboard_url: "https://evil.example", sources: [] },
    { id: "vercel", name: "Vercel", dashboard_url: "javascript:alert(1)", sources: [] }] },
  accounts: [{ key: "stripe", label: "billing <b>bold</b>" }, { key: "*.atlassian.net", label: "Work Microsoft" }] };
  assert.deepEqual(M.homeServices(project).map(row => [row.name, row.account, row.url, row.found]), [
    ["Vercel", null, null, true], ["Convex", null, "https://dashboard.convex.dev", true],
    ["Stripe", "billing <b>bold</b>", null, false], ["*.atlassian.net", "Work Microsoft", null, false]]);
  assert.deepEqual(M.homeServices({}), []);
});

test("agent activity (step 4 seam): unavailable until reported; only valid records of this folder, newest first", () => {
  assert.deepEqual(M.homeAgentActivity(null), { state: "unavailable", text: M.AGENTS_UNAVAILABLE, items: [] });
  assert.deepEqual(M.homeAgentActivity({ records: "x" }).state, "unavailable");
  assert.deepEqual(M.homeAgentActivity({ records: [] }, { root: "/w/shop" }), { state: "empty", text: M.AGENTS_EMPTY, items: [] });
  const record = (over = {}) => ({ version: 1, id: "as_0123456789abcdef", project_path: "/w/shop/apps/web", agent: "codex",
    state: "done", title: "Agent finished", at: 1_000_000, session: null, ...over });
  const records = [record(), record({ id: "as_1111111111111111", agent: "claude-code", state: "needs_input", title: "Approve the migration?", at: 1_060_000 }),
    record({ id: "as_2222222222222222", project_path: "/w/shopping" }), record({ id: "as_3333333333333333", project_path: "/w/other" }),
    record({ id: "nope" }), record({ id: "as_4444444444444444", state: "hacked" }), record({ id: "as_5555555555555555", title: "two\nlines" }),
    record({ id: "as_6666666666666666", agent: "gpt" }), record({ id: "as_7777777777777777", title: "x".repeat(121) })];
  const activity = M.homeAgentActivity({ records }, { root: "/w/shop", now: 1_000_000 + 3_600_000 });
  assert.equal(activity.state, "list");
  assert.deepEqual(activity.items.map(item => [item.agent, item.stateText, item.title, item.ago]), [
    ["Claude Code", "Needs you", "Approve the migration?", "59 min ago"], ["Codex", "Done", "Agent finished", "1 h ago"]]);
  assert.match(M.AGENTS_UNAVAILABLE, /not part of this build/u);
  assert.match(M.PRESENCE_TEXT, /not that one is running/u, "agent files never read as a running agent");
});

test("console errors (step 7 seam) and the brief (step 6 seam): unavailable, empty or validated text", () => {
  assert.deepEqual(M.homeConsoleErrors(null), { state: "unavailable", text: M.ERRORS_UNAVAILABLE, count: null, items: [] });
  assert.equal(M.homeConsoleErrors({ count: -1 }).state, "unavailable");
  assert.equal(M.homeConsoleErrors({ count: 0, recent: [] }).state, "empty");
  const errors = M.homeConsoleErrors({ count: 7, recent: [{ level: "error", text: "TypeError: x\u0000 is undefined" }, { level: "warning", text: "Deprecated" },
    { level: "info", text: "y" }, { text: "" }, null, ...Array.from({ length: 4 }, (_, i) => ({ level: "error", text: `e${i}` }))] });
  assert.deepEqual([errors.state, errors.count, errors.text], ["list", 7, "7 console errors in this project's tabs"]);
  assert.deepEqual(errors.items.map(item => [item.level, item.text]), [["error", "TypeError: x is undefined"], ["warning", "Deprecated"],
    ["error", "y"], ["error", "e0"], ["error", "e1"]]);
  assert.equal(M.briefView(null), null);
  assert.equal(M.briefView({ version: 1, document: { version: 1, product: "" } }), null);
  const brief = M.briefView({ version: 1, cli: "codex", generated_at: 5, accepted: false, document: { version: 1, product: "A <b>shop</b>.",
    apps: [{ name: "web", kind: "web", path: "apps/web", summary: "Storefront" }, { name: 5 }],
    domains: [{ host: "shop.example.dev", purpose: "production" }], services: [{ name: "Stripe", purpose: "billing" }],
    start: [{ label: "Web", command: "bun run dev", cwd: "apps/web" }], risks: ["Payments untested"] } });
  assert.deepEqual([brief.product, brief.by, brief.accepted, brief.generatedAt], ["A <b>shop</b>.", "Codex", false, 5]);
  assert.deepEqual(brief.apps, [{ name: "web", kind: "web", summary: "Storefront" }]);
  assert.deepEqual(brief.start, [{ label: "Web", command: "bun run dev", cwd: "apps/web" }]);
  assert.deepEqual(brief.domains, [{ host: "shop.example.dev", purpose: "production" }]);
  assert.match(M.BRIEF_UNAVAILABLE, /not available in this build/u);
});

test("home facts, section order and problems", () => {
  assert.deepEqual(M.folderFacts({ root: "/w/shop", manifest_state: "written", detected: { at: 9 } }),
    { root: "/w/shop", projectFile: "Saved in .axiosozo/project.json", inRepo: true, lastRead: 9 });
  assert.deepEqual(M.folderFacts({ root: "/w/shop", manifest_state: "none", detected: null }).lastRead, null);
  assert.equal(M.folderFacts({ manifest_state: "external" }).projectFile, "Read from .axiosozo/project.json");
  const quiet = { agents: { state: "unavailable" }, errors: { state: "unavailable" } };
  assert.deepEqual(M.homeSections(quiet), ["open", "accounts", "activity", "about"], "nothing to show stays low on the page");
  assert.deepEqual(M.homeSections({ ...quiet, agents: { state: "list" } }), ["open", "activity", "accounts", "about"]);
  assert.match(M.homeProblem("UNKNOWN_PROJECT").title, /not here anymore/u);
  assert.match(M.homeProblem("PRIVATE_WINDOW").title, /normal windows/u);
  assert.equal(M.homeProblem("NO_WINDOW").title, "Open this page in a browser window");
  assert.equal(M.homeProblem("PROJECT_CHANGED").title, "This project is changing");
  assert.doesNotMatch(M.homeProblem("PROJECT_CHANGED").text, /opened/u, "not the link-opening sentence");
  assert.equal(M.homeProblem("CONTAINERS_UNAVAILABLE").text, M.errorMessage("CONTAINERS_UNAVAILABLE"));
  assert.match(M.homeProblem("WHATEVER").text, /Try again/u);
  for (const code of ["UNKNOWN_PROJECT", "PRIVATE_WINDOW", "NO_WINDOW", "x"]) {
    assert.doesNotMatch(JSON.stringify(M.homeProblem(code)), /\/Volumes|user_context|\bnull\b|undefined/u);
  }
});

test("error codes from detection, refresh and the actor read as sentences; unknown codes fall through", () => {
  for (const code of ["READ_CONTAINMENT_UNAVAILABLE", "ROOT_DENIED", "ROOT_CHANGED", "ROOT_NOT_FOUND", "PROJECT_EXISTS", "UNKNOWN_PROJECT",
    "PROJECT_CHANGED", "IDENTITY_UNAVAILABLE", "IDENTITY_RESET_PENDING", "CONTAINERS_UNAVAILABLE", "INVALID_HOST_PATTERN", "INVALID_INPUT", "INVALID_PROJECT"]) {
    assert.match(M.errorMessage(code), /^[A-Z].+\.$/u, code);
  }
  assert.match(M.errorMessage("READ_CONTAINMENT_UNAVAILABLE"), /nothing was read/u);
  assert.equal(M.errorMessage("SOMETHING_ELSE"), null);
  assert.equal(M.errorMessage("toString"), null);
  assert.equal(M.errorMessage(undefined), null);
});
