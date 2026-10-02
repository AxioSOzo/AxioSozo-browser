/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { UUID_A, manifest } from "../../../packages/contexts/tests/samples.mjs";
import { createStoreMigrationValidator } from "../chrome/ProjectStoreMigration.sys.mjs";

const validator = createStoreMigrationValidator({ core });
const context = (over = {}) => ({ version: 1, workspace_uuid: UUID_A, type: "personal",
  organization_uuid: null, project_id: null, engine_preference: null, updated_at: 29, ...over });
const v1Project = (id = "p_one1", over = {}) => ({ version: 1, id, root: `/Volumes/Synthetic/${id}`,
  manifest: manifest(), manifest_state: "none", context_uuid: null, trusted: false, created_at: 17, updated_at: 23, ...over });
const store = (version, projects = [], contexts = []) => ({ version, projects, contexts });
const copy = value => structuredClone(value);
const freeze = value => {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

// These assertions exercise version provenance in addition to core migration.
test("v1 source requires persistence after context links migrate to project records", () => {
  const raw = store(1, [v1Project()], [context({ project_id: "p_one1" })]);
  const result = validator.validateOriginalVersion(raw);
  assert.equal(result.needsPersistence, true);
  assert.equal(result.document.version, core.CONTEXT_STORE_VERSION);
  assert.equal(result.document.contexts[0].project_id, null);
  assert.equal(result.document.projects[0].context_uuid, UUID_A);
  assert.equal(result.document.projects[0].version, 2);
  assert.deepEqual(result.document.projects[0].shared_sites, { hosts: [...core.DEFAULT_SHARED_SITES], confirmed: false });
});

test("v2 source and legacy empty stores require persistence", () => {
  const raw = store(2, [v1Project("p_two2", { context_uuid: UUID_A })], [context({ project_id: "p_two2" })]);
  const result = validator.validateOriginalVersion(raw);
  assert.equal(result.needsPersistence, true);
  assert.equal(result.document.version, 3);
  assert.equal(result.document.projects[0].context_uuid, UUID_A);
  assert.equal(result.document.contexts[0].project_id, "p_two2");
  for (const version of [1, 2]) {
    const empty = validator.validateOriginalVersion(store(version));
    assert.equal(empty.needsPersistence, true);
    assert.deepEqual(empty.document, core.DEFAULT_CONTEXT_STORE);
  }
});

test("v3 source with v2 records and default document do not require persistence", () => {
  const original = core.upgradeProject(v1Project());
  const result = validator.validateOriginalVersion(store(3, [original]));
  assert.equal(result.needsPersistence, false);
  assert.deepEqual(result.document.projects[0], original);
  assert.equal(validator.validateOriginalVersion(core.DEFAULT_CONTEXT_STORE).needsPersistence, false);
});

test("mixed v3/v1 source requires persistence even though migrated document is v3", () => {
  const raw = store(3, [core.upgradeProject(v1Project("p_one1")), v1Project("p_two2")]);
  const result = validator.validateOriginalVersion(raw);
  assert.equal(result.needsPersistence, true);
  assert.equal(result.document.version, 3);
  assert.deepEqual(result.document.projects.map(project => project.version), [2, 2]);
  assert.equal(raw.projects[1].version, 1, "source provenance remains available");
  assert.equal(validator.validateOriginalVersion(result.document).needsPersistence, false);
});

test("migration never changes timestamps in contexts, v1 records or v2 records", () => {
  for (const version of [1, 2, 3]) {
    const record = version === 3 ? core.upgradeProject(v1Project()) : v1Project();
    const raw = store(version, [record], [context()]);
    const { document } = validator.validateOriginalVersion(raw);
    assert.equal(document.contexts[0].updated_at, 29);
    assert.equal(document.projects[0].created_at, 17);
    assert.equal(document.projects[0].updated_at, 23);
  }
  const { document } = validator.validateOriginalVersion(store(3, [core.upgradeProject(v1Project()), v1Project("p_two2", { created_at: 31, updated_at: 37 })]));
  assert.deepEqual(document.projects.map(project => [project.created_at, project.updated_at]), [[17, 23], [31, 37]]);
});

test("existing v2 profile metadata survives mixed-record migration", () => {
  const enriched = core.validateProject({ ...core.upgradeProject(v1Project()), container: { user_context_id: 7 },
    shared_sites: { hosts: ["github.com"], confirmed: true }, accounts: [{ key: "vercel", label: "Synthetic account" }],
    detected: { at: 41, integrations: [], platforms: [], domains: [], agents: { files: [], dirs: [], worktrees: 0 } } });
  const { document, needsPersistence } = validator.validateOriginalVersion(store(3, [enriched, v1Project("p_two2")]));
  assert.equal(needsPersistence, true);
  assert.deepEqual(document.projects[0], enriched);
});

test("valid frozen input stays untouched and migration output remains deeply frozen", () => {
  for (const raw of [store(1, [v1Project()], [context()]), store(2, [v1Project()], [context()]),
    store(3, [core.upgradeProject(v1Project()), v1Project("p_two2")]), store(3, [core.upgradeProject(v1Project())])]) {
    const before = copy(raw);
    const result = validator.validateOriginalVersion(freeze(raw));
    assert.deepEqual(raw, before);
    assert.ok(Object.isFrozen(result));
    assert.ok(Object.isFrozen(result.document));
    assert.ok(Object.isFrozen(result.document.projects));
    assert.ok(Object.isFrozen(result.document.projects[0].shared_sites.hosts));
    assert.throws(() => { result.document.projects[0].updated_at = 99; }, TypeError);
  }
});

test("invalid stores throw before a caller can mark persistence and preserve raw input", () => {
  const invalid = [store(4), { version: 2, contexts: [] }, store(3, [v1Project("p_bad1", { trusted: true })]),
    store(2, [v1Project(), v1Project()]), store(3, [{ ...core.upgradeProject(v1Project()), container: { user_context_id: 0 } }]),
    store(3, [null]), store(2, [core.upgradeProject(v1Project())]),
    store(3, [], [context({ project_id: "p_missing" })]), { ...store(3), extra: true }];
  for (const raw of invalid) {
    const before = copy(raw);
    let pending = false;
    assert.throws(() => {
      const result = validator.validateOriginalVersion(raw);
      pending = result.needsPersistence;
    }, error => error instanceof core.ContextsError && error.code === "INVALID_CONTEXT_STORE");
    assert.equal(pending, false);
    assert.deepEqual(raw, before);
  }
});

test("null and undefined are invalid inputs rather than missing-file defaults", () => {
  for (const raw of [null, undefined]) assert.throws(() => validator.validateOriginalVersion(raw),
    error => error instanceof core.ContextsError && error.code === "INVALID_CONTEXT_STORE");
});

test("core migration runs before provenance inspection; its output is returned unchanged", () => {
  const order = [], document = Object.freeze({ version: 3, projects: Object.freeze([]), contexts: Object.freeze([]) });
  const injected = createStoreMigrationValidator({ core: { CONTEXT_STORE_VERSION: 3,
    migrateContextStore(value) { order.push("validate"); assert.equal(value, raw); return document; } } });
  const raw = { get version() { order.push("version"); return 3; }, get projects() { order.push("projects"); return []; } };
  const result = injected.validateOriginalVersion(raw);
  assert.equal(result.document, document);
  assert.equal(result.needsPersistence, false);
  assert.deepEqual(order, ["validate", "version", "projects"]);
  const failure = new Error("validation failure");
  const rejects = createStoreMigrationValidator({ core: { migrateContextStore() { throw failure; } } });
  const hostile = new Proxy({}, { get() { throw new Error("provenance inspected before validation"); } });
  assert.throws(() => rejects.validateOriginalVersion(hostile), error => error === failure);
});


test("normalization in current-version records does not mark persistence", () => {
  const project = { ...core.upgradeProject(v1Project()), accounts: [{ key: "vercel", label: "  Synthetic account  " }] };
  const raw = store(3, [project], [context({ engine_preference: "firefox" })]);
  const { document, needsPersistence } = validator.validateOriginalVersion(raw);
  assert.equal(needsPersistence, false);
  assert.equal(document.projects[0].accounts[0].label, "Synthetic account");
  assert.equal(document.contexts[0].engine_preference, "gecko");
  assert.equal(raw.projects[0].accounts[0].label, "  Synthetic account  ");
  assert.equal(raw.contexts[0].engine_preference, "firefox");
});
