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

test("error codes from detection, refresh and the actor read as sentences; unknown codes fall through", () => {
  for (const code of ["READ_CONTAINMENT_UNAVAILABLE", "ROOT_DENIED", "ROOT_CHANGED", "ROOT_NOT_FOUND", "PROJECT_EXISTS", "UNKNOWN_PROJECT"]) {
    assert.match(M.errorMessage(code), /^[A-Z].+\.$/u, code);
  }
  assert.match(M.errorMessage("READ_CONTAINMENT_UNAVAILABLE"), /nothing was read/u);
  assert.equal(M.errorMessage("SOMETHING_ELSE"), null);
  assert.equal(M.errorMessage("toString"), null);
  assert.equal(M.errorMessage(undefined), null);
});
