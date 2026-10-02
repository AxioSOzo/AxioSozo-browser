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
