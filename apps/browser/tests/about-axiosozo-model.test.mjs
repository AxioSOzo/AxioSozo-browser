import assert from "node:assert/strict";
import { test } from "node:test";
import * as M from "../chrome/overview/overview-model.mjs";
import { validateSiteRule, validateManifest } from "../../../packages/contexts/src/schema.mjs";

const NOW = 1_790_000_000_000;
const UUID = "{11111111-2222-3333-4444-555555555555}";

test("host input is normalized to contract host patterns", () => {
  assert.deepEqual(M.parseHosts("x.com\n*.x.com, https://WWW.Example.test/path?q=1  x.com"),
    { hosts: ["x.com", "*.x.com", "www.example.test"], errors: [] });
  assert.equal(M.normalizeHost("bücher.example"), "xn--bcher-kva.example");
  assert.equal(M.normalizeHost("localhost"), "localhost");
  for (const bad of ["*", "*.com.", "127.0.0.1", "[::1]", "user:pw@x.com", "javascript:alert(1)", "-x.com", "x-.com"]) {
    assert.equal(M.normalizeHost(bad), null, bad);
  }
  assert.equal(M.parseHosts("").errors.length, 1);
  assert.equal(M.parseHosts("not a host!").errors.length, 1);
});

test("the handoff example rule round-trips through the editor form and passes the contract validator", () => {
  const rule = {
    version: 1, id: "r_7f3a", enabled: true, match: { hosts: ["x.com", "*.x.com"] }, contexts: "all",
    instruction: "I come here to post and answer mentions. If I drift into the feed, nudge me.",
    limits: { daily_minutes: 15, allowed_hours: null }, observation: "outline", observation_raised_hosts: [],
    effects: ["nudge", "suggest_leave", "pause_site"], override: "confirm", agents: { access: "none", instruction: "" },
    created_at: NOW - 1000, updated_at: NOW - 1000,
  };
  const form = M.ruleToForm(rule);
  const { rule: back, errors } = M.formToRule(form, { now: NOW, id: "r_unused" });
  assert.deepEqual(errors, []);
  assert.deepEqual(back, { ...rule, updated_at: NOW });
  validateSiteRule(back);
});

test("a new rule from the editor is valid, uses the generated id and defaults to observation none", () => {
  const form = { ...M.emptyRuleForm(), hostsText: "news.example", dailyMinutes: "30",
    contextsMode: "selected", contextTypes: ["project", "personal"], contextWorkspaces: [UUID],
    windows: [{ start: "22:00", end: "07:00", days: [0, 6, 6] }, { start: "12:00", end: "13:00", days: [0, 1, 2, 3, 4, 5, 6] }] };
  const id = M.newRuleId(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
  assert.match(id, /^r_[a-z0-9]{12}$/);
  const { rule, errors } = M.formToRule(form, { now: NOW, id });
  assert.deepEqual(errors, []);
  assert.equal(rule.id, id);
  assert.equal(rule.observation, "none");
  assert.deepEqual(rule.effects, ["nudge"]);
  assert.deepEqual(rule.contexts, { types: ["personal", "project"], workspaces: [UUID] });
  assert.deepEqual(rule.limits, { daily_minutes: 30, allowed_hours: [
    { start: "22:00", end: "07:00", days: [0, 6] }, { start: "12:00", end: "13:00" }] });
  assert.equal(rule.created_at, NOW);
  validateSiteRule(rule);
});

test("raised observation hosts are kept only for outline and only for listed hosts", () => {
  const base = { ...M.emptyRuleForm(), hostsText: "bank.example\nother.example", raisedHosts: ["bank.example", "gone.example"] };
  const outline = M.formToRule({ ...base, observation: "outline" }, { now: NOW, id: "r_abcd" }).rule;
  assert.deepEqual(outline.observation_raised_hosts, ["bank.example"]);
  validateSiteRule(outline);
  const address = M.formToRule({ ...base, observation: "address" }, { now: NOW, id: "r_abcd" }).rule;
  assert.deepEqual(address.observation_raised_hosts, []);
});

test("the editor reports field errors instead of producing invalid rules", () => {
  const result = M.formToRule({ ...M.emptyRuleForm(), hostsText: "", dailyMinutes: "0", contextsMode: "selected",
    windows: [{ start: "25:00", end: "07:00", days: [] }, { start: "09:00", end: "09:00", days: [] }],
    instruction: "x".repeat(2001), override: "never" }, { now: NOW, id: "r_abcd" });
  assert.equal(result.rule, null);
  assert.deepEqual([...new Set(result.errors.map(error => error.field))].sort(),
    ["allowed_hours", "contexts", "daily_minutes", "hosts", "instruction", "override"]);
  assert.equal(M.formToRule({ ...M.emptyRuleForm(), hostsText: "x.com", dailyMinutes: "1441" }, { now: NOW, id: "r_abcd" }).rule, null);
  assert.equal(M.formToRule({ ...M.emptyRuleForm(), hostsText: "x.com", dailyMinutes: "12.5" }, { now: NOW, id: "r_abcd" }).rule, null);
});

test("agents settings are preserved but never widened by the editor", () => {
  const form = { ...M.emptyRuleForm(), hostsText: "x.com", agents: { access: "root", instruction: "hi" } };
  assert.deepEqual(M.formToRule(form, { now: NOW, id: "r_abcd" }).rule.agents, { access: "none", instruction: "hi" });
  const kept = { ...M.emptyRuleForm(), hostsText: "x.com", agents: { access: "read", instruction: "" } };
  assert.equal(M.formToRule(kept, { now: NOW, id: "r_abcd" }).rule.agents.access, "read");
});

test("Jev settings form enforces 1–30 minute intervals and a 0–30 hourly budget", () => {
  assert.deepEqual(M.jevToForm(null), { consent: false, intervalMinutes: "5", hourlyBudget: "30" });
  assert.deepEqual(M.formToJevPatch({ consent: true, intervalMinutes: "10", hourlyBudget: "0" }),
    { errors: [], patch: { consent: true, interval_minutes: 10, hourly_budget: 0 } });
  for (const [interval, budget] of [["0", "5"], ["31", "5"], ["5", "31"], ["x", "5"], ["5", "-1"]]) {
    assert.equal(M.formToJevPatch({ consent: true, intervalMinutes: interval, hourlyBudget: budget }).patch, null);
  }
});

const DRAFT = {
  version: 1, name: "fixture-vite", kind: "web", kind_source: { source: "package.json", guess: false },
  environments: [{ name: "local", base_url: "http://localhost:5173", source: "vite default", guess: true }],
  services: [{ name: "dev server", url: "http://localhost:5173/", port: 5173, source: "package.json scripts.dev", guess: false }],
  surfaces: [{ name: "Repository", url: "https://git.example.test/team/app", kind: "repository", source: ".git/config", guess: false }],
  frameworks: ["vite"], files_read: ["package.json", ".git/config"],
  refused: [{ path: "vite.config.ts", reason: "not_allowlisted" }], warnings: [],
};

test("Jev wording states exactly when Jev is called and what is sent (M2)", () => {
  // The three gates enforced by SiteRuleRuntime (consent, rule level/effects) and the provider host (Keychain key).
  assert.match(M.JEV_STATEMENT, /consent/u);
  assert.match(M.JEV_STATEMENT, /Jev key is stored in the macOS Keychain/u);
  assert.match(M.JEV_STATEMENT, /observation level above None and at least one effect/u);
  assert.match(M.JEV_STATEMENT, /off until you turn it on/u);
  for (const part of ["origin", "path", "never the query or fragment", "page title", "instruction", "effects", "context type",
    "today's time", "current visit", "outgoing-data indicator", "non-private"]) assert.ok(M.JEV_SENT_TEXT.includes(part), part);
  // Never claim "no calls" while a key may already be in the Keychain.
  for (const input of [{ keyEntryEnabled: false }, { keyEntryEnabled: true }, {}]) {
    assert.doesNotMatch(M.jevKeyNote(input), /no Jev calls are made/u, JSON.stringify(input));
    assert.match(M.jevKeyNote(input), /Keychain/u);
  }
  assert.match(M.jevKeyNote({ keyEntryEnabled: false }), /already stored in the macOS Keychain is still used/u);
  assert.match(M.jevKeyNote({ keyPresent: false }), /no Jev calls are made/u);
  assert.match(M.jevKeyNote({ keyPresent: true }), /is stored/u);
  assert.doesNotMatch(M.OBSERVATION_TEXT.outline, /When Jev is consulted: the address, plus/u, "outline is not sent in this build");
  assert.equal(M.jevToForm(null).consent, false, "consent defaults off");
});

test("service status text never promises remote checks (M1)", () => {
  assert.equal(M.serviceStatusText({ url: "http://localhost:5173/" }, "up"), "up");
  assert.equal(M.serviceStatusText({ url: "http://[::1]:5173/" }, "down"), "down");
  assert.equal(M.serviceStatusText({ url: "http://127.0.0.1:5173/" }, "unknown"), "not checked");
  assert.equal(M.serviceStatusText({ url: "https://shop.example/" }, "unknown"), "not checked (only services on this Mac are checked)");
  assert.match(M.SERVICES_HELP, /Remote services are never contacted/u);
});

test("service and surface addresses with a query or fragment are refused in the editor (L5)", () => {
  const review = M.draftToReview(DRAFT);
  review.services.push({ name: "api", url: "http://localhost:8787/?debug=1", port: "8787", source: "", guess: false });
  review.surfaces.push({ name: "CI", url: "https://ci.example.test/run#log", kind: "ci", source: "", guess: false });
  const { manifest, errors } = M.reviewToManifest(review);
  assert.equal(manifest, null);
  const messages = errors.map(error => error.message).join("\n");
  assert.match(messages, /Service 2: enter an http or https address without query or fragment/u);
  assert.match(messages, /Surface 2: enter an http or https address without query or fragment/u);
});


test("detection draft review keeps provenance and guess markers and yields a valid manifest", () => {
  const review = M.draftToReview(DRAFT);
  assert.equal(review.environments[0].guess, true);
  assert.equal(review.environments[0].source, "vite default");
  assert.equal(review.services[0].port, "5173");
  assert.deepEqual(review.filesRead, ["package.json", ".git/config"]);
  assert.deepEqual(review.refused, [{ path: "vite.config.ts", reason: "not_allowlisted" }]);
  assert.ok(M.REFUSAL_TEXT[review.refused[0].reason]);
  review.name = "  Fixture app  ";
  review.environments.push({ name: "production", base_url: "https://app.example.test/", source: "", guess: false });
  review.environments.push({ name: "", base_url: "", source: "", guess: false });
  review.surfaces.push({ name: "", url: "", kind: "other", source: "", guess: false });
  const { manifest, errors } = M.reviewToManifest(review);
  assert.deepEqual(errors, []);
  assert.deepEqual(manifest, {
    version: 1, name: "Fixture app", kind: "web",
    environments: [{ name: "local", base_url: "http://localhost:5173" }, { name: "production", base_url: "https://app.example.test" }],
    services: [{ name: "dev server", url: "http://localhost:5173/", port: 5173 }],
    surfaces: [{ name: "Repository", url: "https://git.example.test/team/app", kind: "repository" }],
  });
  validateManifest(manifest);
});

test("draft review rejects invalid edits instead of silently dropping them", () => {
  const review = M.draftToReview(DRAFT);
  review.name = "";
  review.kind = "game";
  review.environments.push({ name: "Local", base_url: "http://localhost:3000", source: "", guess: false });
  review.environments.push({ name: "local", base_url: "http://localhost:3000", source: "", guess: false });
  review.environments.push({ name: "staging", base_url: "http://u:p@localhost:3000", source: "", guess: false });
  review.environments.push({ name: "query", base_url: "http://localhost:3000/?a=1", source: "", guess: false });
  review.services.push({ name: "db", url: "http://localhost:5432", port: "70000", source: "", guess: false });
  review.surfaces.push({ name: "Docs", url: "file:///etc/passwd", kind: "docs", source: "", guess: false });
  const { manifest, errors } = M.reviewToManifest(review);
  assert.equal(manifest, null);
  const messages = errors.map(error => `${error.field}: ${error.message}`).join("\n");
  assert.match(messages, /name: /);
  assert.match(messages, /kind: /);
  assert.match(messages, /listed twice/);
  assert.match(messages, /Environment 2: use a lower-case name/);
  assert.match(messages, /Environment 4: enter an http/);
  assert.match(messages, /Environment 5: enter an http/);
  assert.match(messages, /port must be/);
  assert.match(messages, /Surface 2: enter an http/);
});

test("editing a confirmed project round-trips its manifest", () => {
  const manifest = { version: 1, name: "Lib", kind: "library", environments: [], services: [],
    surfaces: [{ name: "Registry", url: "https://registry.example.test/lib", kind: "package" }] };
  const review = M.projectToReview({ id: "p_abcd", manifest, context_uuid: UUID });
  assert.equal(review.contextUuid, UUID);
  assert.equal(review.surfaces[0].source, "confirmed");
  assert.deepEqual(M.reviewToManifest(review).manifest, manifest);
});

test("ledger views group per host/context and per day with readable durations", () => {
  assert.equal(M.formatDuration(0), "under 1 min");
  assert.equal(M.formatDuration(59_999), "under 1 min");
  assert.equal(M.formatDuration(15 * 60_000), "15 min");
  assert.equal(M.formatDuration(65 * 60_000), "1 h 05 min");
  assert.equal(M.formatDuration(120 * 60_000), "2 h");
  const summary = [
    { host: "x.com", context_uuid: UUID, total_ms: 30 * 60_000, by_day: { "2026-09-26": 10 * 60_000, "2026-09-27": 20 * 60_000 } },
    { host: "docs.example", context_uuid: null, total_ms: 45 * 60_000, by_day: [{ day: "2026-09-27", ms: 45 * 60_000 }] },
    { host: "gone.example", context_uuid: "{bbbbbbbb-0000-0000-0000-000000000000}", total_ms: 60_000, by_day: { "2026-09-25": 60_000 } },
  ];
  const rows = M.ledgerRows(summary, [{ uuid: UUID, name: "Work" }]);
  assert.deepEqual(rows.map(row => [row.host, row.contextName, row.totalText]),
    [["docs.example", "No space", "45 min"], ["x.com", "Work", "30 min"], ["gone.example", "Deleted space", "1 min"]]);
  assert.deepEqual(rows[1].days.map(day => day.day), ["2026-09-27", "2026-09-26"]);
  const days = M.ledgerDays(summary);
  assert.deepEqual(days.map(day => [day.day, day.totalText]), [["2026-09-27", "1 h 05 min"], ["2026-09-26", "10 min"], ["2026-09-25", "1 min"]]);
  assert.deepEqual(days[0].hosts.map(host => host.host), ["docs.example", "x.com"]);
  assert.equal(M.exportFileName({ year: 2026, month: 9, day: 7 }), "axiosozo-usage-2026-09-07.json");
  assert.equal(M.LEDGER_RETENTION_DAYS, 90);
});

test("attention items map to page actions and never to non-web URLs", () => {
  assert.deepEqual(M.attentionAction({ kind: "rule_limit_reached", target: "r_7f3a" }), { kind: "rule", id: "r_7f3a" });
  assert.deepEqual(M.attentionAction({ kind: "service_down", target: { project_id: "p_abcd" } }), { kind: "project", id: "p_abcd" });
  assert.deepEqual(M.attentionAction({ target: { url: "https://status.example.test/" } }), { kind: "url", url: "https://status.example.test/" });
  // The shape AxioSozoServices.needsAttention actually emits (found in the H3 GUI run: no buttons were shown).
  assert.deepEqual(M.attentionAction({ kind: "service_down", target: { type: "project", id: "p_izby1u1k0jwl", service: "Vite dev server" } }),
    { kind: "project", id: "p_izby1u1k0jwl" });
  assert.deepEqual(M.attentionAction({ kind: "rule_limit_reached", target: { type: "rule", id: "r_dbdjjkzvvgxr" } }),
    { kind: "rule", id: "r_dbdjjkzvvgxr" });
  assert.equal(M.attentionAction({ target: { type: "rule", id: "p_abcd" } }), null, "type and id must agree");
  for (const target of ["javascript:alert(1)", { url: "file:///etc" }, null, 42, { rule_id: "r_" }]) {
    assert.equal(M.attentionAction({ target }), null);
  }
});

test("the page model shares enum values with the contexts core", async () => {
  const core = await import("../../../packages/contexts/src/schema.mjs");
  for (const name of ["CONTEXT_TYPES", "PROJECT_KINDS", "SURFACE_KINDS", "EFFECTS", "OBSERVATIONS", "OVERRIDES", "AGENT_ACCESS"]) {
    assert.deepEqual([...M[name]], [...core[name]], name);
  }
  assert.deepEqual(Object.keys(M.REFUSAL_TEXT), [...core.REFUSAL_REASONS]);
});

const expectedDraft = async name => JSON.parse(await (await import("node:fs/promises")).readFile(
  new URL(`../../../packages/contexts/tests/expected/${name}.json`, import.meta.url), "utf8"));

test("add-project review, Domo-like: environments grouped per app, production URL on the web app, v2 manifest", async () => {
  const core = await import("../../../packages/contexts/src/index.mjs");
  const draft = await expectedDraft("tauri-plus-web");
  const review = M.draftToReview(draft, { contextUuid: UUID });
  assert.equal(review.contextUuid, UUID);
  assert.deepEqual(review.environments.map(row => [row.app, row.name, row.base_url, row.guess, row.enabled]),
    [["desktop", "local", "http://localhost:1420", false, true], ["web", "local", "http://localhost:5173", true, true]]);
  assert.deepEqual(M.environmentGroups(review).map(group => [group.app, group.label, group.rows.map(item => item.index)]),
    [["desktop", "Desktop app (desktop)", [0]], ["web", "App web", [1]]]);
  assert.deepEqual(review.surfaces.map(row => [row.name, row.prominence]),
    draft.surfaces.map(surface => [surface.name, surface.prominence]), "Shown/More follows the draft's prominence");
  // Untouched, the review gives the same manifest as the core (apart from base URL trailing slashes).
  const untouched = M.reviewToManifest(review).manifest;
  const reference = core.draftToManifest(draft);
  assert.equal(untouched.version, 2);
  assert.deepEqual(core.validateManifest(untouched).environments.map(env => [env.app, env.name, env.base_url.replace(/\/$/u, "")]),
    reference.environments.map(env => [env.app, env.name, env.base_url.replace(/\/$/u, "")]));
  assert.deepEqual(untouched.services.map(s => [s.app, s.name, s.port]), reference.services.map(s => [s.app, s.name, s.port]));
  assert.deepEqual(untouched.surfaces.map(s => [s.name, M.surfaceProminence(s)]),
    reference.surfaces.map(s => [s.name, core.surfaceProminence(s)]));
  // The optional Production URL lands on the web app, like core.draftToManifest(…, { production_url }).
  review.productionUrl = "https://domo.example/";
  const withProd = M.reviewToManifest(review).manifest;
  assert.deepEqual(withProd.environments.at(-1), { name: "production", base_url: "https://domo.example", app: "web" });
  assert.deepEqual(core.draftToManifest(draft, { production_url: "https://domo.example" }).environments.at(-1).app, "web");
  // Unticking the web app's local environment drops its service; editing the Tauri port moves its service.
  review.environments[1].enabled = false;
  review.environments[0].base_url = "http://localhost:1421";
  const edited = M.reviewToManifest(review).manifest;
  assert.deepEqual(edited.environments.map(env => [env.app, env.name]), [["desktop", "local"], ["web", "production"]]);
  assert.deepEqual(edited.services.map(s => [s.app, s.name, s.port, s.url]), [["desktop", "Tauri dev server", 1421, "http://localhost:1421/"]]);
  core.validateManifest(edited);
});

test("add-project review, RemoteRAL-like: + Add environment gets a dev server; guesses stay marked; bad production URL refused", async () => {
  const core = await import("../../../packages/contexts/src/index.mjs");
  const draft = await expectedDraft("npm-workspaces");
  const review = M.draftToReview(draft);
  assert.deepEqual(review.environments.map(row => [row.app, row.name, row.guess]), [[null, "local", true]]);
  assert.deepEqual(M.environmentGroups(review).map(group => group.label), [null], "one app: no group headings");
  review.environments.push({ app: null, name: "api", base_url: "http://localhost:8787", source: "", guess: false, enabled: true, servicePort: null });
  review.productionUrl = "https://remoteral.example";
  const { manifest, errors } = M.reviewToManifest(review);
  assert.deepEqual(errors, []);
  assert.equal(manifest.version, 1, "single-app manifests stay version 1");
  assert.deepEqual(manifest.environments.map(env => [env.name, env.base_url]),
    [["local", "http://localhost:5173"], ["api", "http://localhost:8787"], ["production", "https://remoteral.example"]]);
  assert.deepEqual(manifest.services.map(s => [s.name, s.port]), [["Vite dev server", 5173], ["Dev server", 8787]]);
  core.validateManifest(manifest);
  for (const bad of ["ftp://x.example", "https://x.example/?a=1", "https://u:p@x.example"]) {
    review.productionUrl = bad;
    const refused = M.reviewToManifest(review);
    assert.equal(refused.manifest, null, bad);
    assert.equal(refused.errors[0].field, "production_url");
  }
});

test("surfaces: Shown/More is written only where it differs from the kind's default; unticked ones are dropped", () => {
  const review = M.draftToReview({ ...DRAFT, surfaces: [
    { name: "Repository", url: "https://git.example.test/team/app", kind: "repository", prominence: "primary", source: "", guess: false },
    { name: "CI", url: "https://ci.example.test/app", kind: "ci", prominence: "secondary", source: "", guess: false },
    { name: "Issues", url: "https://git.example.test/team/app/issues", kind: "issues", prominence: "secondary", source: "", guess: false }] });
  review.surfaces[1].prominence = "primary";
  review.surfaces[2].enabled = false;
  const { manifest } = M.reviewToManifest(review);
  assert.equal(manifest.version, 2);
  assert.deepEqual(manifest.surfaces, [
    { name: "Repository", url: "https://git.example.test/team/app", kind: "repository" },
    { name: "CI", url: "https://ci.example.test/app", kind: "ci", prominence: "primary" }]);
  validateManifest(manifest);
});

test("projects are grouped by space (any type) and the page says where a new project lives", () => {
  const contexts = [
    { uuid: "{aaaaaaaa-0000-4000-8000-000000000001}", name: "Me", type: "personal" },
    { uuid: "{aaaaaaaa-0000-4000-8000-000000000002}", name: "BV", type: "organization" }];
  const projects = [
    { id: "p_aaaa", context_uuid: contexts[0].uuid, manifest: { name: "Domo" } },
    { id: "p_bbbb", context_uuid: contexts[0].uuid, manifest: { name: "Blog" } },
    { id: "p_cccc", context_uuid: null, manifest: { name: "Loose" } },
    { id: "p_dddd", context_uuid: "{deadbeef-0000-4000-8000-000000000000}", manifest: { name: "Orphaned" } }];
  const groups = M.projectGroups(contexts, projects);
  assert.deepEqual(groups.map(group => [group.context?.name ?? null, group.projects.map(p => p.id)]),
    [["Me", ["p_aaaa", "p_bbbb"]], ["BV", []], [null, ["p_cccc", "p_dddd"]]]);
  assert.match(M.placementMessage(projects[0], contexts), /^Domo was added to the space Me\. It is in that space's sidebar/u);
  assert.match(M.placementMessage(projects[2], contexts), /not to a space yet/u);
  assert.deepEqual(M.TYPE_LABELS, { personal: "Personal", organization: "Organization", project: "Project" });
});

test("deep links: three views, old hashes redirect, item links validated", () => {
  assert.deepEqual(M.VIEWS, ["projects", "rules", "ai"]);
  assert.deepEqual(M.routeFromHash("#ai"), { view: "ai" });
  assert.deepEqual(M.routeFromHash("#home"), { view: "projects", legacy: true });
  assert.deepEqual(M.routeFromHash("#time"), { view: "rules", legacy: true });
  assert.deepEqual(M.routeFromHash("#settings"), { view: "ai", legacy: true });
  assert.deepEqual(M.routeFromHash("#project=p_abcd"), { view: "projects", project: "p_abcd" });
  assert.deepEqual(M.routeFromHash("#edit-project=p_abcd"), { view: "projects", project: "p_abcd", edit: true });
  assert.deepEqual(M.routeFromHash(`#add-project=${UUID}`), { view: "projects", addTo: UUID });
  assert.deepEqual(M.routeFromHash(`#add-project=${encodeURIComponent(UUID)}`), { view: "projects", addTo: UUID }, "an encoded fragment works too");
  assert.deepEqual(M.routeFromHash("#rule=r_7f3a"), { view: "rules", rule: "r_7f3a" });
  for (const bad of ["", "#", "#project=../x", "#add-project=nope", "#rule=p_abcd", "#constructor", "#%E0%A4%A"]) {
    assert.equal(M.routeFromHash(bad).view, "projects", bad);
    assert.equal(Object.keys(M.routeFromHash(bad)).length, 1, bad);
  }
});

test("AI & keys: provider cards keep the honest labels; Jev key form rules; Keychain texts match ProviderStatus", async () => {
  const { buildProviderStatus, keychainErrorText } = await import("../chrome/ProviderStatus.sys.mjs");
  const status = buildProviderStatus({
    discovery: [{ driver: "codex", installed: true, client_version: "0.157.1" }, { driver: "claude-code", installed: false }],
    jev: { keyEntryEnabled: true, key: "missing" } });
  const cards = M.providerCards(status);
  assert.deepEqual(cards.map(card => [card.id, card.stateLabel, card.tone]), [
    ["codex", "Installed · not yet verified", "info"], ["claude-code", "Not installed", "off"],
    ["antigravity", "Status unknown", "unknown"], ["jev", "No key stored", "off"]]);
  assert.ok(cards.every(card => card.detail.length > 0));
  assert.ok(!cards.some(card => card.state === "ready"), "nothing is claimed ready");
  assert.match(M.providerSummary(status), /no assistant was started/u);
  const jev = cards.find(card => card.isJev);
  assert.deepEqual(M.jevKeyForm(jev), { enabled: true, reason: null, canRemove: false });
  assert.equal(M.jevKeyForm(jev, { isPrivate: true }).enabled, false);
  assert.equal(M.jevKeyForm({ ...jev, keyEntryEnabled: false }).enabled, false);
  assert.equal(M.jevKeyForm({ ...jev, key: "unavailable" }).enabled, false);
  assert.equal(M.jevKeyForm({ ...jev, key: "stored" }).canRemove, true);
  for (const code of ["INVALID_KEY", "JEV_KEY_ENTRY_DISABLED", "KEYCHAIN_HELPER_UNAVAILABLE", "KEYCHAIN_REFUSED", "HELPER_TIMEOUT", "PRIVATE_WINDOW", "OTHER"]) {
    assert.equal(M.keychainErrorText(code), keychainErrorText(code), code);
  }
  assert.deepEqual(M.checkJevKey("short"), { ok: false, code: "INVALID_KEY" });
  assert.deepEqual(M.checkJevKey("line\nbreak-key"), { ok: false, code: "INVALID_KEY" });
  assert.deepEqual(M.checkJevKey("synthetic-not-a-real-key"), { ok: true });
});

test("site rules show their own screen time; top sites are marked when a rule covers them", () => {
  const rule = { id: "r_7f3a", match: { hosts: ["x.com", "*.x.com"] }, limits: { daily_minutes: 15 } };
  const today = [{ host: "x.com", context_uuid: UUID, total_ms: 10 * 60_000 }, { host: "m.x.com", context_uuid: null, total_ms: 6 * 60_000 },
    { host: "notx.com", context_uuid: null, total_ms: 60 * 60_000 }];
  const week = [...today, { host: "x.com", context_uuid: null, total_ms: 51 * 60_000 }];
  const usage = M.ruleUsage(rule, { today, week });
  assert.equal(usage.text, "Today 16 min of 15 min · 7 days 1 h 07 min");
  assert.equal(usage.overLimit, true);
  assert.equal(M.hostMatches("*.x.com", "x.com"), false, "wildcards match subdomains only, like the core");
  assert.deepEqual(M.siteUsageRows(week, [rule], 2).map(row => [row.host, row.text, row.rule]),
    [["x.com", "1 h 01 min", "r_7f3a"], ["notx.com", "1 h", null]]);
});
