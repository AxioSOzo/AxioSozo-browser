import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { createProjectRecords } from "../chrome/ProjectRecords.sys.mjs";

const draft = () => core.detectProject({ rootName: "synthetic-product", files: {
  "package.json": JSON.stringify({ name: "synthetic-product", dependencies: { "@clerk/backend": "1", vercel: "1" }, scripts: { dev: "vite --port 5199" } }),
  "vercel.json": JSON.stringify({ redirects: [{ destination: "https://app.synthetic-product.dev/" }] })
}, inventory: { listing: {}, present: { "AGENTS.md": "file", ".claude": "dir" } } });
const result = (root = "/fixture", extras = {}) => ({ root, canonicalRoot: root, detectedAt: 500, draft: draft(), manifestText: null, ...extras });
const manifest = () => core.draftToManifest(draft());
function harness(options = {}) {
  let time = 1000, serial = 0;
  const assigned = [];
  const model = createProjectRecords({ core, clock: () => time, newToken: () => `t_${String(++serial).padStart(30, "0")}`,
    browserContainerFor: async record => { assigned.push(record.id); assert.ok(Object.isFrozen(record)); return 12; }, ...options });
  const record = (root = "/fixture", extra = {}) => model.createRecord({ id: "p_abcd", root, canonicalRoot: root, manifest: manifest(), ...extra });
  return { model, record, assigned, advance: ms => { time += ms; } };
}
const code = expected => error => error.code === expected;
const proposal = (windowKey, extra = {}) => ({ root: "/fixture", canonicalRoot: "/fixture", tabId: 10,
  url: "http://localhost:5199/page?q=1#part", windowKey, isPrivate: false, ...extra });
const binding = (windowKey, extra = {}) => ({ tabId: 10, url: "http://localhost:5199/page?q=1#part", windowKey, isPrivate: false, ...extra });

test("creates validated v2 records from trusted cached detector evidence and canonical provenance", () => {
  const h = harness();
  h.model.rememberDetection(result("/picked/alias", { canonicalRoot: "/fixture" }));
  const record = h.model.createRecord({ id: "p_abcd", root: "/picked/alias", canonicalRoot: "/fixture", manifest: manifest() });
  assert.equal(record.version, 2);
  assert.equal(record.root, "/fixture");
  assert.equal(record.created_at, 1000);
  assert.equal(record.updated_at, 1000);
  assert.equal(record.detected.at, 500);
  assert.deepEqual(record.detected.integrations.map(x => x.id), ["vercel", "clerk"]);
  assert.equal(record.detected.domains[0].confirmed, false);
  assert.deepEqual(record.detected.agents, { files: ["AGENTS.md"], dirs: [".claude"], worktrees: 0 });
  assert.equal(record.container.user_context_id, null);
  assert.equal(record.shared_sites.confirmed, false);
  assert.deepEqual(record.accounts, []);
  assert.ok(Object.isFrozen(record) && Object.isFrozen(record.detected.integrations));
  assert.deepEqual(core.validateContextStore({ version: 3, contexts: [], projects: [record] }).projects, [record]);
  assert.ok(!Object.hasOwn(record.manifest, "detected"));
  assert.ok(!Object.hasOwn(record.manifest, "root"));
});

test("external manifest state requires canonical validated equality and never adopts invalid cached text", () => {
  const h = harness();
  h.model.rememberDetection(result("/fixture", { manifestText: JSON.stringify(manifest()) }));
  assert.equal(h.record().manifest_state, "external");
  assert.equal(h.record("/fixture", { manifest: { ...manifest(), name: "different" } }).manifest_state, "none");
  h.model.rememberDetection(result("/fixture", { manifestText: "{malformed" }));
  assert.equal(h.record().manifest_state, "none");
});

test("detector cache is copied, bounded and expires against the passed clock", () => {
  const h = harness({ maxSnapshots: 2, snapshotTtlMs: 20 });
  const input = JSON.parse(JSON.stringify(result("/one")));
  h.model.rememberDetection(input);
  input.draft.integrations[0].name = "mutated";
  assert.notEqual(h.model.detectionFor("/one", "/one").draft.integrations[0].name, "mutated");
  h.model.rememberDetection(result("/two"));
  h.model.rememberDetection(result("/three"));
  assert.equal(h.model.detectionFor("/one", "/one"), null);
  assert.ok(h.model.detectionFor("/two", "/two"));
  h.advance(20);
  assert.equal(h.model.detectionFor("/two", "/two"), null);
  assert.equal(h.record("/three").detected, null);
});

test("a cached selected folder cannot authorize a changed canonical target", () => {
  const h = harness();
  h.model.rememberDetection(result("/picked", { canonicalRoot: "/original" }));
  assert.throws(() => h.model.createRecord({ id: "p_abcd", root: "/picked", canonicalRoot: "/changed", manifest: manifest() }), code("ROOT_CHANGED"));
  assert.equal(h.model.detectionFor("/picked", "/original").canonicalRoot, "/original");
});

test("malformed or over-cap detector evidence is never added to the cache", () => {
  const h = harness();
  for (const invalid of [result("/bad", { detectedAt: 1001 }), result("/bad", { manifestText: "x".repeat(262145) }),
    { ...result("/bad"), arbitrary: true }, result("/bad", { draft: { ...draft(), version: 1 } })]) {
    assert.throws(() => h.model.rememberDetection(invalid));
    assert.equal(h.model.detectionFor("/bad", "/bad"), null);
  }
});

test("refresh changes only detected evidence and updated time", () => {
  const h = harness();
  let before = h.record();
  before = core.validateProject({ ...before, accounts: [{ key: "vercel", label: "Work Google" }],
    container: { user_context_id: 12 }, shared_sites: { hosts: ["github.com"], confirmed: true } });
  h.model.rememberDetection(result());
  h.advance(10);
  const refreshed = h.model.refreshedRecord(before, { root: "/fixture", canonicalRoot: "/fixture" });
  assert.equal(refreshed.updated_at, 1010);
  assert.equal(refreshed.created_at, before.created_at);
  for (const key of ["manifest", "container", "accounts", "shared_sites", "brief", "id", "root"]) assert.deepEqual(refreshed[key], before[key]);
  assert.throws(() => h.model.refreshedRecord(before, { root: "/fixture", canonicalRoot: "/elsewhere" }), code("ROOT_CHANGED"));
});

test("account labels are user supplied, normalized, replaceable and removable", () => {
  const h = harness();
  const original = h.record();
  let updated = h.model.withAccountLabel(original, { key: "vercel", label: "  Work Google  " });
  assert.deepEqual(updated.accounts, [{ key: "vercel", label: "Work Google" }]);
  updated = h.model.withAccountLabel(updated, { key: "vercel", label: "Personal Microsoft" });
  assert.equal(updated.accounts.length, 1);
  updated = h.model.withAccountLabel(updated, { key: "*.TEAM.Example.dev", label: "Manual label" });
  assert.equal(updated.accounts[1].key, "*.team.example.dev");
  updated = h.model.withAccountLabel(updated, { key: "vercel", label: null });
  assert.deepEqual(updated.accounts, [{ key: "*.team.example.dev", label: "Manual label" }]);
  assert.deepEqual(original.accounts, []);
  assert.throws(() => h.model.withAccountLabel(original, { key: "vercel", label: "secret\nline" }));
  assert.throws(() => h.model.withAccountLabel(original, { key: "vercel", label: "label", container: 99 }), code("INVALID_INPUT"));
});

test("shared-site confirmation is explicit and all patterns pass the core validator", () => {
  const h = harness();
  const original = h.record();
  const suggested = h.model.withSharedSites(original, { hosts: ["GITHUB.com"], confirmed: false });
  assert.deepEqual(suggested.shared_sites, { hosts: ["github.com"], confirmed: false });
  const confirmed = h.model.withSharedSites(suggested, { hosts: ["github.com"], confirmed: true });
  assert.equal(confirmed.shared_sites.confirmed, true);
  assert.equal(original.shared_sites.confirmed, false);
  for (const invalid of [{ hosts: ["https://github.com"], confirmed: true }, { hosts: ["github.com", "github.com"], confirmed: true },
    { hosts: [], confirmed: "true" }, { hosts: [], confirmed: false, arbitrary: true }]) assert.throws(() => h.model.withSharedSites(original, invalid));
});

test("actor-controlled patch data cannot alter identities, provenance, brief or root authorization", () => {
  const h = harness();
  const original = h.record();
  for (const key of ["root", "id", "version", "container", "detected", "brief", "trusted", "canonicalRoot", "created_at", "updated_at", "context_uuid"]) {
    assert.throws(() => h.model.applyUserPatch(original, { [key]: null }), code("INVALID_INPUT"));
  }
  assert.throws(() => h.model.applyUserPatch(original, {}), code("INVALID_PROJECT_PATCH"));
  assert.throws(() => h.model.applyUserPatch(original, { accounts: [{ key: "vercel", label: "Manual", user_context_id: 99 }] }));
  assert.equal(original.container.user_context_id, null);
});

test("container assignment comes only from the injected browser owner and stays within Gecko bounds", async () => {
  const h = harness();
  const original = h.record();
  const updated = await h.model.withBrowserContainer(original);
  assert.deepEqual(h.assigned, ["p_abcd"]);
  assert.equal(updated.container.user_context_id, 12);
  assert.equal(original.container.user_context_id, null);
  for (const assigned of [0, -1, 4294967295, 4294967296, "12", undefined]) {
    const bad = harness({ browserContainerFor: () => assigned });
    await assert.rejects(bad.model.withBrowserContainer(bad.record()));
  }
  const max = harness({ browserContainerFor: () => 4294967294 });
  assert.equal((await max.model.withBrowserContainer(max.record())).container.user_context_id, 4294967294);
});

test("proposal tokens bind canonical root, exact tab URL and window identity and consume once", () => {
  const h = harness(), windowKey = {};
  const offered = h.model.issueArrival(proposal(windowKey));
  assert.ok(!offered.token.includes("fixture") && !offered.token.includes("localhost"));
  assert.ok(Object.isFrozen(offered));
  const inspected = h.model.inspectArrival(offered.token, binding(windowKey));
  assert.equal(inspected.root, "/fixture");
  assert.ok(!Object.hasOwn(inspected, "windowKey"));
  for (const invalid of [binding({}), binding(windowKey, { tabId: 11 }), binding(windowKey, { url: "http://localhost:5199/other" }),
    binding(windowKey, { url: "http://localhost:5199/page?q=2#part" })]) assert.throws(() => h.model.consumeArrival(offered.token, invalid), code("STALE_ARRIVAL"));
  assert.throws(() => h.model.consumeArrival(offered.token, binding(windowKey, { canonicalRoot: "/other" })), code("ROOT_CHANGED"));
  assert.throws(() => h.model.consumeArrival(offered.token, { ...binding(windowKey), root: "/arbitrary" }), code("INVALID_INPUT"));
  assert.equal(h.model.consumeArrival(offered.token, binding(windowKey, { canonicalRoot: "/fixture" })).canonicalRoot, "/fixture");
  assert.throws(() => h.model.consumeArrival(offered.token, binding(windowKey)), code("UNKNOWN_ARRIVAL"));
});

test("unknown/private contexts and credential/non-loopback URLs cannot authorize offers", () => {
  const h = harness(), windowKey = {};
  for (const invalid of [proposal(windowKey, { isPrivate: true }), proposal(windowKey, { isPrivate: undefined }), proposal(null),
    proposal(windowKey, { root: "/alias", canonicalRoot: "/fixture" }), proposal(windowKey, { url: "https://remote.product.dev/" }),
    proposal(windowKey, { url: "http://user:pass@localhost:5199/" })]) assert.throws(() => h.model.issueArrival(invalid));
  const offered = h.model.issueArrival(proposal(windowKey));
  assert.throws(() => h.model.consumeArrival(offered.token, binding(windowKey, { isPrivate: true })), code("INVALID_ARRIVAL_BINDING"));
});

test("proposal capacity, clock expiry and teardown invalidate authorizations", () => {
  const h = harness({ maxOffers: 2, offerTtlMs: 20 }), windowKey = {}, other = {};
  const first = h.model.issueArrival(proposal(windowKey));
  const second = h.model.issueArrival(proposal(windowKey, { tabId: 11 }));
  const third = h.model.issueArrival(proposal(other, { tabId: 12 }));
  assert.throws(() => h.model.inspectArrival(first.token, binding(windowKey)), code("UNKNOWN_ARRIVAL"));
  h.model.discardTab(windowKey, 11);
  assert.throws(() => h.model.inspectArrival(second.token, binding(windowKey, { tabId: 11 })), code("UNKNOWN_ARRIVAL"));
  assert.equal(h.model.inspectArrival(third.token, binding(other, { tabId: 12 })).root, "/fixture");
  h.advance(20);
  assert.throws(() => h.model.inspectArrival(third.token, binding(other, { tabId: 12 })), code("UNKNOWN_ARRIVAL"));
  const fourth = h.model.issueArrival(proposal(windowKey));
  h.model.discardWindow(windowKey);
  assert.throws(() => h.model.inspectArrival(fourth.token, binding(windowKey)), code("UNKNOWN_ARRIVAL"));
});

test("a faulty token source cannot reissue an active or recently consumed token", () => {
  const h = harness({ newToken: () => "x".repeat(32) }), windowKey = {};
  const offered = h.model.issueArrival(proposal(windowKey));
  assert.throws(() => h.model.issueArrival(proposal(windowKey)), code("INVALID_TOKEN_SOURCE"));
  h.model.consumeArrival(offered.token, binding(windowKey));
  assert.throws(() => h.model.issueArrival(proposal(windowKey)), code("INVALID_TOKEN_SOURCE"));
  assert.throws(() => harness({ newToken: () => "/root-derived-token" }).model.issueArrival(proposal(windowKey)), code("INVALID_TOKEN_SOURCE"));
});


test("privileged browser assignment compares the currently stored identity before replacement", () => {
  const h = harness();
  const original = h.record();
  const assigned = h.model.withBrowserAssignedContainer(original, 12, { expectedUserContextId: null });
  assert.equal(assigned.container.user_context_id, 12);
  assert.equal(h.model.withBrowserAssignedContainer(assigned, 99, { expectedUserContextId: null }), null);
  assert.equal(h.model.withBrowserAssignedContainer(assigned, 99, { expectedUserContextId: 13 }), null);
  assert.equal(h.model.withBrowserAssignedContainer(assigned, 99, { expectedUserContextId: 12 }).container.user_context_id, 99);
  for (const id of [0, -1, 4294967295, 4294967296, "12"]) {
    assert.throws(() => h.model.withBrowserAssignedContainer(assigned, id, { expectedUserContextId: 12 }), code("INVALID_PROJECT"));
  }
  assert.throws(() => h.model.withBrowserAssignedContainer(assigned, 99, { expectedUserContextId: 4294967295 }), code("INVALID_INPUT"));
  const lastPublic = h.model.withBrowserAssignedContainer(assigned, 4294967294, { expectedUserContextId: 12 });
  assert.equal(lastPublic.container.user_context_id, 4294967294);
  assert.equal(h.model.withBrowserAssignedContainer(lastPublic, null, { expectedUserContextId: 4294967294 }).container.user_context_id, null);
  assert.throws(() => h.model.withBrowserAssignedContainer(assigned, 99, { expectedUserContextId: 12, actorAssigned: true }), code("INVALID_INPUT"));
  assert.equal(assigned.container.user_context_id, 12);
  const cleared = h.model.withBrowserAssignedContainer(assigned, null, { expectedUserContextId: 12 });
  assert.equal(cleared.container.user_context_id, null);
  assert.equal(h.model.withBrowserAssignedContainer(cleared, null, { expectedUserContextId: 12 }), null);
});


test("a stored reserved identity is rejected before browser assignment rather than silently repaired", async () => {
  const h = harness();
  const invalid = { ...h.record(), container: { user_context_id: 4294967295 } };
  await assert.rejects(h.model.withBrowserContainer(invalid), code("INVALID_PROJECT"));
  assert.deepEqual(h.assigned, []);
  assert.throws(() => h.model.withBrowserAssignedContainer(invalid, null, { expectedUserContextId: 4294967295 }), code("INVALID_PROJECT"));
});
