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

test("context rows expose organization and project links only for project contexts", () => {
  const contexts = [
    { uuid: "{aaaaaaaa-0000-0000-0000-000000000001}", name: "BV", type: "organization" },
    { uuid: "{aaaaaaaa-0000-0000-0000-000000000002}", name: "App", type: "project" },
    { uuid: "{aaaaaaaa-0000-0000-0000-000000000003}", name: "Me", type: "personal" },
  ];
  const rows = M.contextRows(contexts, [{ id: "p_abcd", manifest: { name: "App repo" } }]);
  assert.deepEqual(rows.map(row => row.showLinks), [false, true, false]);
  assert.deepEqual(rows[1].organizationOptions, [{ uuid: contexts[0].uuid, name: "BV" }]);
  assert.deepEqual(rows[1].projectOptions, [{ id: "p_abcd", name: "App repo" }]);
  assert.deepEqual(rows[0].organizationOptions, []);
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
