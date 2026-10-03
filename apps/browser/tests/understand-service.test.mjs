import nativeTest from "node:test";
const test = (name, run) => nativeTest(name, { timeout: 2000 }, run);
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import "./support/chrome-modules.mjs";
const { createUnderstandService, createOfflineUnderstandService, SERVICE_LIMITS } = await import("../chrome/UnderstandService.sys.mjs");
import { createUnderstandTransport } from "../chrome/ProviderUnderstand.sys.mjs";

const BASE = "/Volumes/AxioSozoBuild/workstation/gui-fixtures/understand-0123456789abcdef0123456789abcdef/projects";
const ROOT = `${BASE}/harbor`, OTHER = `${BASE}/inkline`;
const clone = value => JSON.parse(JSON.stringify(value));
const doc = () => ({ version: 1, product: "Synthetic project document.", apps: [], domains: [], services: [],
  start: [{ label: "Fixture", command: "npm run synthetic-only", cwd: null }], risks: [] });
const manifest = name => ({ version: 1, name, kind: "web", environments: [], services: [], surfaces: [] });
const brief = () => ({ version: 1, cli: "codex", generated_at: 500, accepted: false, document: doc() });
const record = (id = "p_harbor", root = ROOT) => core.upgradeProject({ version: 1, id, root, manifest: manifest("Harbor"),
  manifest_state: "external", context_uuid: null, trusted: false, created_at: 100, updated_at: 200 });
const ok = request => ({ version: 1, request_id: request.request_id, kind: "brief", cli: request.cli,
  status: "ok", reason: null, document: doc(), data_sent: true, duration_ms: 12 });
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const tick = async (count = 30) => { for (let i = 0; i < count; i++) await Promise.resolve(); };
function fakeClock() {
  let at = 1000, id = 0; const tasks = new Map();
  return { now: () => at, timers: { setTimeout(fn, ms) { tasks.set(++id, { fn, due: at + ms }); return id; }, clearTimeout(id) { tasks.delete(id); } },
    advance(ms) { const target = at + ms; for (;;) { const next = [...tasks].filter(([, t]) => t.due <= target).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break; at = next[1].due; tasks.delete(next[0]); next[1].fn(); } at = target; }, count: () => tasks.size };
}
function harness({ production = false, priorBrief = false, opener, io = {}, commitOverride, onState } = {}) {
  const time = fakeClock(), projects = new Map([["p_harbor", { binding: { id: "p_harbor", revision: 1, canonicalRoot: ROOT }, record: record() }],
    ["p_inkline", { binding: { id: "p_inkline", revision: 1, canonicalRoot: OTHER }, record: record("p_inkline", OTHER) }]]);
  if (priorBrief) projects.get("p_harbor").record = core.validateProject({ ...record(), brief: brief() });
  const counts = { lookups: 0, admission: 0, opens: 0, close: 0, commits: 0, snapshots: 0, accepts: 0 };
  const calls = [], cancels = [], states = [], writes = [], disk = new Map(); let sequence = 0, beforeCommit = null, permit = true;
  const transport = { request(method, params, options) {
    if (method === "understand/available") return Promise.resolve({ clis: [{ cli: "codex", path: "/fixed/private/node", version: "synthetic-1" }] });
    const wait = deferred(); calls.push({ method, params, options, ...wait }); return wait.promise;
  }, cancel(params) { cancels.push(params); return Promise.resolve({ cancelled: true }); }, close() { counts.close++; return Promise.resolve(); } };
  const lookupSnapshot = id => { counts.lookups++; return projects.get(id); };
  const rootAdmission = root => { counts.admission++; return permit && [ROOT, OTHER].includes(root); };
  const projectSnapshot = id => clone(projects.get(id));
  let tail = Promise.resolve();
  const commitProject = commitOverride ?? (args => {
    const operation = tail.then(async () => {
      if (beforeCommit) await beforeCommit(args);
      const latest = projectSnapshot(args.binding.id), next = args.mutate(latest);
      counts.commits++;
      projects.set(args.binding.id, { binding: { ...latest.binding, revision: latest.binding.revision + 1 }, record: next });
      return { committed: true, snapshot: projectSnapshot(args.binding.id) };
    });
    tail = operation.catch(() => {}); return operation;
  });
  const manifestIO = {
    async snapshot(root, { admit }) {
      counts.snapshots++; assert.equal(admit(), true);
      if (io.snapshot) return io.snapshot(root, { admit }, disk);
      const found = disk.get(root);
      return { rootIdentity: { device: "1", inode: "2" }, directoryIdentity: found ? { device: "1", inode: "3" } : null,
        target: found ? { identity: { device: "1", inode: "4" }, digest: found.digest, size: 123, mode: 0o644 } : null,
        manifest: found?.manifest ?? null };
    }, async accept(payload, options) {
      counts.accepts++; assert.equal(options.admit(), true); writes.push(clone(payload));
      if (io.accept) return io.accept(payload, options, disk);
      disk.set(payload.root, { manifest: clone(payload.manifest), digest: "b".repeat(64) });
      return { path: `${payload.root}/.axiosozo/project.json`, digest: "b".repeat(64), committed: true };
    },
  };
  const deps = { core, lookupSnapshot, rootAdmission, commitProject, manifestIO, uuid: () => `service_uuid_${String(++sequence).padStart(8, "0")}`,
    clock: time.now, timers: time.timers, onState(owner, state) { states.push({ owner, state }); onState?.(owner, state); } };
  const openRuntime = async options => { counts.opens++; return opener ? opener(options, transport) : { transport, projectRoots: [ROOT, OTHER] }; };
  const api = production ? createUnderstandService(deps) : createOfflineUnderstandService(deps, { openRuntime });
  const owner = api.createOwner({ current: () => true });
  return { api, owner, deps, counts, calls, cancels, states, writes, disk, time, transport, projects,
    beforeCommit(fn) { beforeCommit = fn; }, permit(value) { permit = value; },
    bump(id = "p_harbor", change = {}) { const old = projects.get(id); projects.set(id, { binding: { ...old.binding, revision: old.binding.revision + 1, ...change }, record: old.record }); },
    resolve(index = 0) { calls[index].resolve(ok(calls[index].params)); }, read(alias = owner, id = "p_harbor") { return api.read(alias, { projectId: id, cli: "codex" }); },
    preview(alias = owner) { return api.preview(alias, { projectId: "p_harbor" }); },
    accept(token, alias = owner, edits = { name: "Confirmed" }) { return api.accept(alias, { projectId: "p_harbor", token, edits, confirmed: true }); } };
}

test("production denial precedes all project/admission/runtime/state work", async () => {
  const s = harness({ production: true });
  const value = await s.read(s.owner, "p_unknown");
  assert.equal(value.reason, "NOT_AUTHORIZED"); assert.equal(value.document, null); assert.equal(value.data_sent, false);
  assert.deepEqual(await s.api.state(s.owner, { projectId: "p_unknown" }), { authorization: "NOT_AUTHORIZED", mode: "PRODUCTION", clis: [], jobs: [] });
  assert.deepEqual(await s.api.available(s.owner, { projectId: "p_unknown" }), { authorization: "NOT_AUTHORIZED", clis: [] });
  assert.equal(s.counts.lookups, 0); assert.equal(s.counts.admission, 0); assert.equal(s.counts.opens, 0);
  assert.equal(s.states.length, 0); assert.equal(s.time.count(), 0);
  assert.throws(() => createUnderstandService({ ...s.deps, openRuntime() { throw Error("must not call"); } }), { code: "INVALID_DEPENDENCIES" });
  await s.api.close(); assert.equal(s.counts.close, 0);
});

test("owner aliases cannot be supplied as actor clones or strings; inputs stay primitive/closed", async () => {
  const s = harness();
  for (const fake of [{}, clone(s.owner), "owner"]) await assert.rejects(s.read(fake), { code: "OWNER_REVOKED" });
  for (const extra of [{ root: ROOT }, { revision: 1 }, { runtime: {} }, { testOnlyAllowRun: true }, { input: {} }])
    await assert.rejects(s.api.read(s.owner, { projectId: "p_harbor", cli: "codex", ...extra }), { code: "INVALID_PARAMS" });
  await assert.rejects(s.api.read(s.owner, { projectId: { toString() { return "p_harbor"; } }, cli: "codex" }), { code: "INVALID_PARAMS" });
  assert.equal(s.counts.opens, 0); await s.api.close();
});

test("unknown root/static manifest and denied owner fail before offline factory", async () => {
  const s = harness(); s.permit(false);
  await assert.rejects(s.read(), { code: "INVALID_PROJECT" }); assert.equal(s.counts.opens, 0);
  s.permit(true); s.projects.get("p_harbor").binding.canonicalRoot = OTHER;
  await assert.rejects(s.read(), { code: "INVALID_PROJECT" }); assert.equal(s.counts.opens, 0);
  let current = true; const owner = s.api.createOwner({ current: () => current }); current = false;
  await assert.rejects(s.read(owner), { code: "OWNER_REVOKED" }); assert.equal(s.counts.opens, 0); await s.api.close();
});

test("successful brief is validated and committed once under guard before success reply", async () => {
  const s = harness(), pending = s.read(); await tick(); assert.equal(s.calls.length, 1);
  assert.equal(s.calls[0].params.project_root, ROOT); assert(Object.isFrozen(s.calls[0].params));
  assert.equal(s.counts.commits, 0); s.resolve(); const result = await pending;
  assert.equal(result.status, "ok"); assert.equal(s.counts.commits, 1);
  const saved = s.projects.get("p_harbor"); assert.equal(saved.binding.revision, 2);
  assert.equal(saved.record.brief.generated_at, 1000); assert.equal(saved.record.brief.accepted, false);
  assert.deepEqual(saved.record.brief.document, doc()); assert(Object.isFrozen(saved.record));
  assert.equal(JSON.stringify(result).includes(ROOT), false); await s.api.close(); assert.equal(s.counts.close, 1);
});

test("one process controller across owners exposes only owner state and cancellation", async () => {
  const s = harness(), other = s.api.createOwner({ current: () => true });
  const first = s.read(), second = s.read(other, "p_inkline"); await tick();
  const a = await s.api.state(s.owner, { projectId: "p_harbor" }), b = await s.api.state(other, { projectId: "p_inkline" });
  assert.deepEqual(a.jobs.map(j => j.state), ["running"]); assert.deepEqual(b.jobs.map(j => j.state), ["queued"]);
  assert.equal(s.counts.opens, 1);
  assert.deepEqual(s.api.cancel(other, { projectId: "p_harbor", requestId: a.jobs[0].request_id }), { cancelled: false });
  assert.deepEqual(s.api.cancel(other, { projectId: "p_inkline", requestId: b.jobs[0].request_id }), { cancelled: true });
  assert.equal((await second).status, "cancelled"); assert.equal(s.calls.length, 1);
  s.resolve(); assert.equal((await first).status, "ok"); await s.api.close();
});

test("startup requests share capacity and full queue launches no extra factory", async () => {
  const opening = deferred(), s = harness({ opener: () => opening.promise });
  const pending = Array.from({ length: 5 }, () => s.read()); await tick();
  const full = await s.read(); assert.equal(full.reason, "QUEUE_FULL"); assert.equal(full.data_sent, false);
  assert.equal(s.counts.opens, 1); opening.resolve({ transport: s.transport, projectRoots: [ROOT, OTHER] }); await tick();
  assert.equal(s.calls.length, 1); assert.equal(s.api.diagnostics().queued, 4);
  s.resolve(); await pending[0]; // The commit changes revision, cancelling old queued bindings.
  if (s.calls.length > 1) s.resolve(1); // The already active second fake must send its terminal reply.
  for (const value of await Promise.all(pending.slice(1))) assert.equal(value.reason, "STALE_PROJECT");
  await s.api.close();
});

test("active cancellation acknowledgement cannot publish a late valid brief", async () => {
  const s = harness({ priorBrief: true }), prior = clone(s.projects.get("p_harbor").record.brief), pending = s.read(); await tick();
  assert.deepEqual(s.api.cancel(s.owner, { projectId: "p_harbor", requestId: s.calls[0].params.request_id }), { cancelled: true });
  await tick(); assert.equal(s.cancels.length, 1); s.resolve(); const result = await pending;
  assert.equal(result.status, "cancelled"); assert.equal(result.document, null); assert.equal(result.data_sent, true);
  assert.deepEqual(s.projects.get("p_harbor").record.brief, prior); assert.equal(s.counts.commits, 0); await s.api.close();
});

test("owner abort cancels its work and another owner continues", async () => {
  const s = harness(), signal = new AbortController(), a = s.api.createOwner({ current: () => true, signal: signal.signal });
  const first = s.read(a), second = s.read(s.owner, "p_inkline"); await tick();
  const rejected = assert.rejects(first, { code: "OWNER_REVOKED" }); signal.abort(); s.resolve(); await rejected; await tick();
  assert.equal(s.calls.length, 2); s.resolve(1); assert.equal((await second).status, "ok");
  assert.equal(s.counts.opens, 1); await s.api.close(); assert.equal(s.counts.close, 1);
});

test("revision invalidation and reused revision reject old completion", async () => {
  const s = harness({ priorBrief: true }), pending = s.read(); await tick();
  s.api.invalidateProject("p_harbor"); s.resolve(); const result = await pending;
  assert.equal(result.reason, "STALE_PROJECT"); assert.equal(result.document, null); assert.equal(s.counts.commits, 0); await s.api.close();
});

test("queued serialized mutation checks latest revision inside write", async () => {
  const gate = deferred(), s = harness({ priorBrief: true }); s.beforeCommit(() => gate.promise);
  const pending = s.read(); await tick(); s.resolve(); await tick(); s.bump(); gate.resolve();
  const result = await pending; assert.equal(result.reason, "STALE_PROJECT"); assert.equal(s.counts.commits, 0);
  assert.deepEqual(s.projects.get("p_harbor").record.brief, brief()); await s.api.close();
});

test("commit callback must invoke guarded mutator and publish a new matching revision", async () => {
  const s = harness({ commitOverride: async () => ({ committed: true, snapshot: { binding: { id: "p_harbor", revision: 2, canonicalRoot: ROOT }, record: record() } }) });
  const pending = s.read(); await tick(); s.resolve(); await assert.rejects(pending, { code: "BRIEF_SAVE_FAILED" });
  assert.equal(s.projects.get("p_harbor").record.brief, null); await s.api.close();
});

test("schema failure preserves cached brief without persistence callback", async () => {
  const s = harness({ priorBrief: true }), pending = s.read(); await tick();
  s.calls[0].resolve({ ...ok(s.calls[0].params), document: { ...doc(), root: ROOT } });
  const result = await pending; assert.equal(result.status, "invalid_output"); assert.equal(result.document, null);
  assert.equal(s.counts.commits, 0); assert.deepEqual(s.projects.get("p_harbor").record.brief, brief()); await s.api.close();
});

test("metadata is owner/root guarded and strips native executable paths", async () => {
  const s = harness(); await s.api.state(s.owner, { projectId: "p_harbor" }); assert.equal(s.counts.opens, 0);
  const value = await s.api.available(s.owner, { projectId: "p_harbor" });
  assert.deepEqual(value, { authorization: "NOT_AUTHORIZED", clis: [{ cli: "codex", version: "synthetic-1" }] });
  assert.equal(JSON.stringify(value).includes("/fixed"), false); await s.api.close();
});

test("late runtime after startup timeout is closed once and cannot launch requests", async () => {
  const gate = deferred(), s = harness({ opener: () => gate.promise }); const pending = s.read(); const rejected = assert.rejects(pending, { code: "UNDERSTAND_UNAVAILABLE" });
  await tick(); s.time.advance(SERVICE_LIMITS.startupMs); await rejected;
  gate.resolve({ transport: s.transport, projectRoots: [ROOT] }); await tick();
  assert.equal(s.counts.close, 1); assert.equal(s.calls.length, 0);
  await assert.rejects(s.read(), { code: "UNDERSTAND_UNAVAILABLE" }); assert.equal(s.counts.opens, 1); await s.api.close();
});

test("close aborts pending admission and retires a late returned runtime", async () => {
  const gate = deferred(), s = harness({ opener: ({ signal }) => { assert.equal(signal.aborted, false); return gate.promise; } });
  const pending = s.read(), rejected = assert.rejects(pending, { code: "UNDERSTAND_UNAVAILABLE" }); await tick();
  await s.api.close(); await rejected; assert.equal(s.time.count(), 0);
  gate.resolve({ transport: s.transport, projectRoots: [ROOT] }); await tick(); assert.equal(s.counts.close, 1); assert.equal(s.calls.length, 0);
});

test("malformed admitted runtime is closed rather than falling back", async () => {
  const s = harness({ opener: (_options, transport) => ({ transport, projectRoots: [ROOT], extra: true }) });
  await assert.rejects(s.read(), { code: "UNDERSTAND_UNAVAILABLE" }); assert.equal(s.counts.close, 1); assert.equal(s.calls.length, 0); await s.api.close();
});

test("acceptance preview exposes only token/manifest and confirms no AI document fields", async () => {
  const s = harness({ priorBrief: true }), existing = { ...manifest("Disk"), environments: [{ name: "local", base_url: "http://127.0.0.1:4173/" }] };
  s.disk.set(ROOT, { manifest: existing, digest: "a".repeat(64) });
  const preview = await s.preview(); assert.deepEqual(Object.keys(preview), ["token", "manifest"]);
  assert.equal(preview.manifest.name, "Disk"); assert.equal(JSON.stringify(preview).includes(ROOT), false);
  const done = await s.accept(preview.token, s.owner, { name: "Accepted", kind: "desktop" }); assert.deepEqual(done, { status: "ACCEPTED", committed: true, reason: null });
  assert.equal(s.writes.length, 1); assert.equal(s.writes[0].manifest.name, "Accepted"); assert.equal(s.writes[0].manifest.kind, "desktop");
  assert.deepEqual(s.writes[0].manifest.environments, existing.environments); assert.equal(JSON.stringify(s.writes).includes("synthetic-only"), false);
  assert.equal(s.projects.get("p_harbor").record.brief.accepted, true); assert.equal(s.projects.get("p_harbor").record.manifest_state, "written");
  await assert.rejects(s.accept(preview.token), { code: "STALE_ACCEPTANCE" }); await s.api.close();
});

test("another owner cannot consume a confirmation token", async () => {
  const s = harness({ priorBrief: true }), other = s.api.createOwner({ current: () => true }), p = await s.preview();
  await assert.rejects(s.accept(p.token, other), { code: "STALE_ACCEPTANCE" }); assert.equal(s.counts.accepts, 0);
  assert.equal((await s.accept(p.token)).status, "ACCEPTED"); await s.api.close();
});

test("bad edits/confirmation consume own token without invoking writer", async () => {
  const s = harness({ priorBrief: true });
  for (const changes of [{ edits: { brief: doc() } }, { confirmed: false }, { extra: true }]) {
    const p = await s.preview(); await assert.rejects(s.api.accept(s.owner, { projectId: "p_harbor", token: p.token, edits: { name: "New" }, confirmed: true, ...changes }));
    await assert.rejects(s.accept(p.token), { code: "STALE_ACCEPTANCE" });
  }
  assert.equal(s.counts.accepts, 0); await s.api.close();
});

test("expired and revised brief confirmation leases never reach writer", async () => {
  const s = harness({ priorBrief: true }), p = await s.preview(); s.time.advance(SERVICE_LIMITS.leaseMs);
  await assert.rejects(s.accept(p.token), { code: "STALE_ACCEPTANCE" });
  const next = await s.preview(); s.bump(); await assert.rejects(s.accept(next.token), { code: "STALE_ACCEPTANCE" });
  assert.equal(s.counts.accepts, 0); await s.api.close();
});

test("known refused native action preserves brief and allows a fresh preview", async () => {
  const s = harness({ priorBrief: true, io: { accept() { throw Object.assign(Error("private detail"), { code: "MANIFEST_CHANGED", committed: false }); } } });
  const p = await s.preview(); assert.deepEqual(await s.accept(p.token), { status: "REFUSED", committed: false, reason: "MANIFEST_CHANGED" });
  assert.equal(s.projects.get("p_harbor").record.brief.accepted, false); await s.preview(); await s.api.close();
});

test("uncertain dispatch blocks blind retry until fresh inspection; never marks accepted", async () => {
  let refuseInspection = false;
  const s = harness({ priorBrief: true, io: { accept() { refuseInspection = true; throw Object.assign(Error("private native data"), { code: "WRITE_OUTCOME_UNKNOWN", committed: null }); },
    snapshot() { if (refuseInspection) throw Error("private native data"); return { rootIdentity: { device: "1", inode: "2" }, directoryIdentity: null, target: null, manifest: null }; } } });
  const p = await s.preview(); assert.deepEqual(await s.accept(p.token), { status: "REINSPECTION_REQUIRED", committed: null, reason: "WRITE_OUTCOME_UNKNOWN" });
  await assert.rejects(s.preview(), { code: "MANIFEST_REINSPECTION_REQUIRED" }); assert.equal(s.counts.accepts, 1);
  refuseInspection = false; assert.equal((await s.api.reinspect(s.owner, { projectId: "p_harbor" })).status, "INSPECTED");
  assert.equal(s.projects.get("p_harbor").record.brief.accepted, false); await s.preview(); await s.api.close();
});

test("revocation after known disk commit leaves debt; new owner can reinspect and reconcile", async () => {
  const gate = deferred(), s = harness({ priorBrief: true, io: { async accept(payload, _options, disk) {
    disk.set(payload.root, { manifest: clone(payload.manifest), digest: "b".repeat(64) }); await gate.promise;
    return { path: `${payload.root}/.axiosozo/project.json`, digest: "b".repeat(64), committed: true };
  } } });
  const p = await s.preview(), pending = s.accept(p.token); await tick(); s.api.releaseOwner(s.owner); gate.resolve();
  assert.deepEqual(await pending, { status: "REINSPECTION_REQUIRED", committed: true, reason: "WRITE_OUTCOME_UNKNOWN" });
  assert.equal(s.projects.get("p_harbor").record.brief.accepted, false);
  const other = s.api.createOwner({ current: () => true }); assert.equal((await s.api.reinspect(other, { projectId: "p_harbor" })).status, "ACCEPTED");
  assert.equal(s.projects.get("p_harbor").record.brief.accepted, true); await s.api.close();
});

test("revised profile during native commit is preserved rather than accepted", async () => {
  const gate = deferred(), s = harness({ priorBrief: true, io: { async accept(payload, _options, disk) {
    disk.set(payload.root, { manifest: clone(payload.manifest), digest: "b".repeat(64) }); await gate.promise;
    return { path: `${payload.root}/.axiosozo/project.json`, digest: "b".repeat(64), committed: true };
  } } });
  const p = await s.preview(), pending = s.accept(p.token); await tick(); s.bump(); gate.resolve();
  const result = await pending; assert.equal(result.status, "CHANGED"); assert.equal(result.reason, "STALE_PROJECT");
  assert.equal(s.counts.commits, 0); assert.equal(s.projects.get("p_harbor").record.brief.accepted, false); await s.api.close();
});

test("known commit with changed inspected disk never marks accepted", async () => {
  const s = harness({ priorBrief: true, io: { accept(payload, _options, disk) {
    disk.set(payload.root, { manifest: manifest("Unrelated"), digest: "c".repeat(64) });
    return { path: `${payload.root}/.axiosozo/project.json`, digest: "b".repeat(64), committed: true };
  } } });
  const p = await s.preview(); assert.deepEqual(await s.accept(p.token), { status: "CHANGED", committed: true, reason: "MANIFEST_CHANGED" });
  assert.equal(s.counts.commits, 0); await s.api.close();
});

test("owner and lease counts are bounded and close revokes remaining leases", async () => {
  const s = harness({ priorBrief: true });
  for (let i = 1; i < SERVICE_LIMITS.owners; i++) s.api.createOwner({ current: () => true });
  assert.throws(() => s.api.createOwner({ current: () => true }), { code: "BUSY" });
  for (let i = 0; i < SERVICE_LIMITS.leases; i++) await s.preview();
  await assert.rejects(s.preview(), { code: "BUSY" }); await s.api.close();
  assert.equal(s.api.diagnostics().owners, 0); assert.equal(s.api.diagnostics().leases, 0);
});

test("preview publication race and concurrent reinspection refuse extra operations", async () => {
  const gate = deferred(); let hold = false;
  const s = harness({ priorBrief: true, io: { async snapshot() {
    if (hold) await gate.promise;
    return { rootIdentity: { device: "1", inode: "2" }, directoryIdentity: null, target: null, manifest: null };
  }, accept() { throw Object.assign(Error("unknown"), { committed: null, code: "WRITE_OUTCOME_UNKNOWN" }); } } });
  const p = await s.preview(); hold = true; const accepted = s.accept(p.token); await tick();
  await assert.rejects(s.preview(), { code: "BUSY" });
  await assert.rejects(s.api.reinspect(s.owner, { projectId: "p_harbor" }), { code: "BUSY" });
  gate.resolve(); assert.equal((await accepted).status, "INSPECTED"); await s.api.close();
});


test("admitted ordinary project still refuses offline startup before factory", async () => {
  const s = harness(), ordinary = "/synthetic/ordinary";
  s.projects.set("p_harbor", { binding: { id: "p_harbor", revision: 1, canonicalRoot: ordinary }, record: core.validateProject({ ...record(), root: ordinary }) });
  let opened = 0;
  const api = createOfflineUnderstandService({ ...s.deps, rootAdmission: root => root === ordinary }, { openRuntime() { opened++; throw Error("must not call"); } });
  const owner = api.createOwner({ current: () => true });
  await assert.rejects(api.read(owner, { projectId: "p_harbor", cli: "codex" }), { code: "INVALID_PROJECT" });
  await assert.rejects(api.available(owner, { projectId: "p_harbor" }), { code: "INVALID_PROJECT" });
  assert.equal(opened, 0); await api.close(); await s.api.close();
});

test("success state remains persisting until guarded profile publication", async () => {
  const gate = deferred(), s = harness({ priorBrief: true }); s.beforeCommit(() => gate.promise);
  const pending = s.read(); await tick(); s.resolve(); await tick();
  const state = await s.api.state(s.owner, { projectId: "p_harbor" });
  assert.equal(state.jobs[0].state, "persisting"); assert.equal(state.jobs[0].status, null);
  assert.equal(s.projects.get("p_harbor").record.brief.generated_at, 500);
  gate.resolve(); assert.equal((await pending).status, "ok");
  assert.equal((await s.api.state(s.owner, { projectId: "p_harbor" })).jobs[0].status, "ok"); await s.api.close();
});

test("save failure yields a fixed failed state and preserves prior brief", async () => {
  const s = harness({ priorBrief: true, commitOverride: async () => { throw Error("private path /hidden/detail"); } });
  const pending = s.read(); await tick(); s.resolve();
  await assert.rejects(pending, error => error.code === "BRIEF_SAVE_FAILED" && error.message === "BRIEF_SAVE_FAILED");
  const state = await s.api.state(s.owner, { projectId: "p_harbor" });
  assert.equal(state.jobs[0].state, "complete"); assert.equal(state.jobs[0].status, "failed"); assert.equal(state.jobs[0].reason, "BRIEF_SAVE_FAILED");
  assert.deepEqual(s.projects.get("p_harbor").record.brief, brief()); await s.api.close();
});

test("terminal observer revocation cannot return a success document after saving", async () => {
  let s;
  s = harness({ onState(owner, state) { if (state.state === "complete" && state.status === "ok") s.api.releaseOwner(owner); } });
  const pending = s.read(); await tick(); s.resolve(); const result = await pending;
  assert.equal(result.status, "cancelled"); assert.equal(result.document, null); assert.equal(result.reason, "STALE_PROJECT");
  assert.equal(s.counts.commits, 1); // A valid guarded publication cannot be rolled back after observer revocation.
  await s.api.close();
});


for (const phase of ["queued", "running"]) test(`owner predicate revoked synchronously in ${phase} observer stops before runtime handoff`, async () => {
  let allowed = true, alias;
  const s = harness({ onState(owner, state) { if (owner === alias && state.state === phase) allowed = false; } });
  alias = s.api.createOwner({ current: () => allowed });
  await assert.rejects(s.read(alias), { code: "OWNER_REVOKED" });
  assert.equal(s.calls.length, 0); assert.equal(s.cancels.length, 0); assert.equal(s.counts.commits, 0);
  assert.equal(s.api.diagnostics().queued, 0); assert.equal(s.api.diagnostics().running, 0);
  const next = s.read(s.owner, "p_inkline"); await tick(); assert.equal(s.calls.length, 1);
  s.resolve(); assert.equal((await next).status, "ok"); assert.equal(s.counts.opens, 1); await s.api.close();
});

test("owner revoked during asynchronous shared admission dispatches no project request", async () => {
  const gate = deferred(); let current = true;
  const s = harness({ opener: () => gate.promise }), alias = s.api.createOwner({ current: () => current });
  const pending = s.read(alias), rejected = assert.rejects(pending, { code: "OWNER_REVOKED" }); await tick(); current = false;
  gate.resolve({ transport: s.transport, projectRoots: [ROOT, OTHER] }); await rejected;
  assert.equal(s.calls.length, 0); assert.equal(s.counts.commits, 0);
  const next = s.read(s.owner, "p_inkline"); await tick(); s.resolve(); assert.equal((await next).status, "ok"); await s.api.close();
});

test("owner lifetime reaches a pending runtime request signal before a deferred write", async () => {
  const s = harness(), pending = s.read(); await tick(); const call = s.calls[0];
  assert.equal(call.options.signal.aborted, false);
  const rejected = assert.rejects(pending, { code: "OWNER_REVOKED" }); s.api.releaseOwner(s.owner);
  assert.equal(call.options.signal.aborted, true); // Native raw transport must check this after each admission/start await.
  let writes = 0;
  if (!call.options.signal.aborted) writes++;
  call.resolve({ ...ok(call.params), status: "cancelled", reason: "CANCELLED", document: null, data_sent: false });
  await rejected; assert.equal(writes, 0); assert.equal(s.counts.commits, 0); await s.api.close();
});


// Actual staged JSONL transport, fake child only: owner/project facts must travel
// from the facade through the controller and survive delayed host admission.
function fakeRawChild(frames) {
  function pipe() {
    const queued = []; let pending = null, closed = false;
    return { read() {
      if (queued.length) return Promise.resolve(queued.shift());
      if (closed) return Promise.resolve(new ArrayBuffer(0));
      const wait = deferred(); pending = wait.resolve; return wait.promise;
    }, push(text) {
      const raw = new TextEncoder().encode(text).buffer;
      if (pending) { const resolve = pending; pending = null; resolve(raw); } else queued.push(raw);
    }, close() { closed = true; pending?.(new ArrayBuffer(0)); pending = null; return Promise.resolve(); } };
  }
  const stdout = pipe(), stderr = pipe(), exit = deferred();
  const stop = () => { exit.resolve({ exitCode: 0 }); return Promise.resolve(); };
  return { stdout, stderr, stdin: { close: stop, write(line) {
    const frame = JSON.parse(line); frames.push(frame);
    const result = frame.method === "understand/available"
      ? { clis: [{ cli: "codex", path: "/fixed/private/node", version: "synthetic-1" }] }
      : frame.method === "understand/cancel" ? { cancelled: true } : ok(frame.params);
    stdout.push(JSON.stringify({ version: 1, id: frame.id, result }) + "\n");
    return Promise.resolve();
  } }, wait: () => exit.promise, kill: stop };
}
for (const revoked of ["owner", "revision", "metadata-owner"]) test(`facade live authority reaches raw transport across delayed startup: ${revoked}`, async () => {
  const gate = deferred(), frames = []; let s, active = true, spawns = 0, wireId = 0;
  s = harness({ priorBrief: true, opener() {
    const transport = createUnderstandTransport({ runtime: {
      timers: s.time.timers,
      env: key => key === "AXIOSOZO_PROVIDER_NODE" ? "/fixed/node"
        : key === "AXIOSOZO_PROVIDER_HOST" ? "/fixed/packages/provider-host/cli.mjs" : "",
      uuid: () => `raw_uuid_${++wireId}`,
      async spawn(options) { spawns++; await gate.promise; return fakeRawChild(frames); },
    } });
    return { transport, projectRoots: [ROOT, OTHER] };
  } });
  const owner = s.api.createOwner({ current: () => active });
  const pending = revoked === "metadata-owner" ? s.api.available(owner, { projectId: "p_harbor" }) : s.read(owner);
  const rejection = revoked === "owner" ? assert.rejects(pending, { code: "OWNER_REVOKED" })
    : revoked === "metadata-owner" ? assert.rejects(pending, { code: "STALE_PROJECT" }) : null;
  await tick(); assert.equal(spawns, 1); assert.equal(frames.length, 0);
  if (revoked === "revision") s.bump(); else active = false;
  gate.resolve();
  if (rejection) await rejection;
  else { const result = await pending; assert.equal(result.reason, "STALE_PROJECT"); assert.equal(result.data_sent, false); assert.equal(result.document, null); }
  assert.equal(frames.length, 0); assert.equal(s.counts.commits, 0);
  assert.deepEqual(s.projects.get("p_harbor").record.brief, brief());
  const next = await s.read(s.owner, "p_inkline"); assert.equal(next.status, "ok");
  assert.equal(spawns, 2); assert.equal(frames.length, 1); assert.equal(frames[0].method, "understand/run");
  assert.equal(s.counts.opens, 1); await s.api.close(); assert.equal(s.time.count(), 0);
});
