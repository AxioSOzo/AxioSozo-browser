import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { createUnderstand, makeBriefRecord, withProjectBrief, prepareBriefAcceptance,
  validateUnderstandResult, validateErrorsInput, sameProjectBinding, UNDERSTAND_LIMITS } from "../chrome/Understand.sys.mjs";

const document = () => ({ version: 1, product: "Synthetic checkout tool.",
  apps: [{ name: "Harbor", kind: "web", path: "apps/harbor", summary: "Checkout." }],
  domains: [{ host: "harbor.example.test", purpose: "Fixture." }],
  services: [{ name: "Fixture DB", purpose: "Synthetic only." }],
  start: [{ label: "Run", command: "npm run dev", cwd: "apps/harbor" }], risks: ["Synthetic risk."] });
const binding = () => ({ id: "p_harbor", revision: 2, canonicalRoot: "/synthetic/harbor" });
const ok = request => ({ version: 1, request_id: request.request_id, kind: request.kind, cli: request.cli,
  status: "ok", reason: null, document: document(), data_sent: true, duration_ms: 12 });
const terminal = (request, status, reason, data_sent = false) => ({ ...ok(request), status, reason, document: null, data_sent });
function clock() {
  let at = 1000, sequence = 0; const tasks = new Map();
  return { now: () => at, timers: { setTimeout(fn, ms) { const id = ++sequence; tasks.set(id, { fn, due: at + ms }); return id; },
    clearTimeout(id) { tasks.delete(id); } },
    advance(ms) { const end = at + ms; for (;;) {
      const next = [...tasks.entries()].filter(([, t]) => t.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break; at = next[1].due; tasks.delete(next[0]); next[1].fn();
    } at = end; }, count: () => tasks.size };
}
const tick = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
function setup(extra = {}) {
  const time = clock(), calls = [], states = [], cancels = []; let closed = 0, project = binding();
  const runtime = { request(method, params, options) {
    let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; });
    calls.push({ method, params, options, resolve, reject }); return promise;
  }, cancel(params) { cancels.push(params); return Promise.resolve({ cancelled: true }); },
  close() { closed++; return Promise.resolve(); } };
  const api = createUnderstand({ runtime, lookupProject: () => project, core, onState: state => states.push(state),
    timers: time.timers, now: time.now, uuid: () => "fixture", testOnlyAllowRun: true, authorizeContext: () => true, ...extra });
  return { api, time, calls, states, cancels, runtime, setProject(value) { project = value; }, closed: () => closed };
}
const run = s => s.api.run({ projectId: "p_harbor", cli: "codex", timeoutMs: 10000 });
const manifest = () => ({ version: 1, name: "Harbor", kind: "web", environments: [], services: [], surfaces: [] });
const project = () => ({ version: 1, id: "p_harbor", root: "/synthetic/harbor", manifest: manifest(), manifest_state: "external",
  context_uuid: null, trusted: false, created_at: 100, updated_at: 200 });

test("Product default blocks before runtime, discovery and indicator dispatch", async () => {
  const s = setup({ testOnlyAllowRun: false });
  const done = await run(s);
  assert.equal(done.result.status, "unavailable"); assert.equal(done.result.reason, "NOT_AUTHORIZED");
  assert.equal(done.result.data_sent, false); assert.equal(done.result.document, null);
  assert.equal(s.calls.length, 0); assert.equal(s.states.length, 0); assert.equal(s.time.count(), 0);
  assert(Object.isFrozen(done.binding));
});

test("Actor request cannot choose a folder, revision or arbitrary method", () => {
  const s = setup();
  for (const params of [ { projectId: "p_harbor", cli: "codex", root: "/other" },
    { projectId: "p_harbor", cli: "codex", project_root: "/other" },
    { projectId: "p_harbor", cli: "codex", revision: 1 },
    { projectId: "p_harbor", cli: "bash" },
    { projectId: "p_harbor", cli: "codex", timeoutMs: 9999 },
    { projectId: "p_harbor", cli: "codex", input: {} } ]) assert.throws(() => s.api.run(params));
  s.setProject({ ...binding(), canonicalRoot: "/synthetic/../secret" }); assert.throws(() => run(s), { code: "INVALID_PROJECT" });
  s.setProject({ ...binding(), id: "p_other" }); assert.throws(() => run(s), { code: "INVALID_PROJECT" });
  assert.equal(s.calls.length, 0);
});

test("Fake run derives root from trusted lookup and persists strict numeric timestamp", async () => {
  const s = setup(); const pending = run(s); assert.equal(s.calls.length, 1);
  const call = s.calls[0]; assert.equal(call.method, "understand/run");
  assert.equal(call.params.project_root, "/synthetic/harbor"); assert(Object.isFrozen(call.params));
  assert.equal(call.options.maxOutputBytes, 262144); assert.equal(call.options.timeoutMs, 10000);
  call.resolve(JSON.stringify(ok(call.params))); const done = await pending;
  assert.equal(done.result.status, "ok"); assert.equal(s.time.count(), 0);
  assert.deepEqual(s.states.map(item => item.state), ["queued", "running", "complete"]);
  const record = makeBriefRecord(done, binding(), { core, now: 2000 });
  assert.equal(record.generated_at, 2000); assert.equal(record.accepted, false);
  const stored = withProjectBrief(project(), record, { core, now: 2001 });
  assert.equal(stored.version, 2); assert.equal(stored.updated_at, 2001); assert.deepEqual(stored.brief, record);
  assert.equal(project().version, 1); assert(Object.isFrozen(record.document.apps));
});

test("One active request and four queued, full queue returns busy without dispatch", async () => {
  const s = setup(); const jobs = Array.from({ length: 5 }, () => run(s));
  assert.equal(s.calls.length, 1); assert.deepEqual(s.api.diagnostics(), { running: 1, queued: 4, closed: false, live: "NOT_AUTHORIZED" });
  const full = await run(s); assert.equal(full.result.reason, "QUEUE_FULL"); assert.equal(full.result.data_sent, false);
  for (let i = 0; i < 5; i++) { s.calls[i].resolve(ok(s.calls[i].params)); await jobs[i]; }
  assert.equal(s.calls.length, 5); assert.equal(s.time.count(), 0);
});

test("Queued cancellation never dispatches; active cancel defeats a late success", async () => {
  const s = setup(), controller = new AbortController();
  const first = run(s); const second = s.api.run({ projectId: "p_harbor", cli: "codex" }, { signal: controller.signal });
  controller.abort(); const queued = await second;
  assert.equal(queued.result.status, "cancelled"); assert.equal(queued.result.data_sent, false); assert.equal(s.calls.length, 1);
  const id = s.calls[0].params.request_id; assert.deepEqual(s.api.cancel(id), { cancelled: true });
  await tick(); assert.deepEqual(s.cancels, [{ request_id: id }]);
  s.calls[0].resolve(ok(s.calls[0].params)); const active = await first;
  assert.equal(active.result.status, "cancelled"); assert.equal(active.result.document, null); assert.equal(active.result.data_sent, true);
  assert.equal(s.time.count(), 0);
});

test("Cancellation preserves trustworthy false data_sent from host terminal result", async () => {
  const s = setup(); const pending = run(s); s.api.cancel(s.calls[0].params.request_id);
  s.calls[0].resolve(terminal(s.calls[0].params, "cancelled", "CANCELLED", false));
  const done = await pending; assert.equal(done.result.data_sent, false); assert.equal(done.result.status, "cancelled");
});

test("Timeout and unresponsive cancellation retire transport before the next queued run", async () => {
  const s = setup(); const first = run(s), second = run(s);
  s.time.advance(10000); await tick(); assert.equal(s.calls[0].options.signal.aborted, true);
  s.time.advance(1000); const a = await first, b = await second; await tick();
  assert.equal(a.result.status, "timeout"); assert.equal(a.result.data_sent, true);
  assert.equal(b.result.reason, "HOST_CLOSED"); assert.equal(b.result.data_sent, false);
  assert.equal(s.calls.length, 1); assert.equal(s.closed(), 1); assert.equal(s.api.diagnostics().closed, true);
  s.calls[0].resolve(ok(s.calls[0].params)); await tick(); assert.equal(s.time.count(), 0);
});

test("Close settles queued jobs immediately and active job within bounded grace", async () => {
  const s = setup(); const active = run(s), queued = run(s); await s.api.close();
  assert.equal((await queued).result.reason, "HOST_CLOSED");
  s.time.advance(1000); assert.equal((await active).result.reason, "HOST_CLOSED");
  assert.equal(s.api.diagnostics().closed, true); assert.equal(s.time.count(), 0);
});

test("Synchronous indicator cancellation cannot start a fake run", async () => {
  const controller = new AbortController();
  const s = setup({ onState: state => { if (state.state === "running") controller.abort(); } });
  const pending = s.api.run({ projectId: "p_harbor", cli: "codex" }, { signal: controller.signal });
  s.time.advance(1000); const done = await pending;
  assert.equal(done.result.data_sent, false); assert.equal(s.calls.length, 0); assert.equal(done.result.status, "cancelled");
  assert.equal(s.api.diagnostics().closed, false); assert.equal(s.cancels.length, 0);
  const next = run(s); s.calls[0].resolve(ok(s.calls[0].params));
  assert.equal((await next).result.status, "ok"); assert.equal(s.time.count(), 0);
});

test("Project root, revision changes or removal discard success and queued work", async () => {
  for (const changed of [{ ...binding(), revision: 3 }, { ...binding(), canonicalRoot: "/synthetic/other" }, null]) {
    const s = setup(); const first = run(s), queued = run(s); s.setProject(changed);
    s.calls[0].resolve(ok(s.calls[0].params)); const a = await first, b = await queued;
    assert.equal(a.result.reason, "STALE_PROJECT"); assert.equal(a.result.document, null);
    assert.equal(b.result.reason, "STALE_PROJECT"); assert.equal(s.calls.length, 1);
  }
});

test("Explicit invalidation cancels active project and discards its queued jobs", async () => {
  const s = setup(); const first = run(s), second = run(s); s.api.invalidateProject("p_harbor");
  assert.equal((await second).result.reason, "STALE_PROJECT");
  s.calls[0].resolve(ok(s.calls[0].params)); assert.equal((await first).result.reason, "STALE_PROJECT");
});

test("Output cap is UTF-8 bytes; invalid JSON, unknown/missing/bad binding fields reject", async () => {
  const s = setup(); const pending = run(s); s.calls[0].resolve("界".repeat(90000));
  assert.equal((await pending).result.reason, "OUTPUT_LIMIT");
  const s2 = setup(); const p2 = run(s2); s2.calls[0].resolve("bad json"); assert.equal((await p2).result.reason, "SCHEMA_MISMATCH");
  const request = { request_id: "r1", kind: "brief", cli: "codex" };
  for (const patch of [{ request_id: "r2" }, { kind: "explain_errors" }, { cli: "claude-code" },
    { extra: true }, { data_sent: false }, { reason: "CANCELLED" }, { duration_ms: -1 }, { duration_ms: Infinity },
    { status: "timeout", reason: "TIMEOUT" }, { status: "unavailable", reason: "NOT_AUTHORIZED", document: null, data_sent: true }]) {
    assert.equal(validateUnderstandResult({ ...ok(request), ...patch }, request, { core, now: 100 }), null);
  }
  const absent = ok(request); delete absent.reason; assert.equal(validateUnderstandResult(absent, request, { core }), null);
});

test("Profile schema rejects host-looser paths, duplicate domains and control chars", () => {
  const request = { request_id: "r1", kind: "brief", cli: "codex" };
  for (const mutate of [doc => { doc.apps[0].path = "."; }, doc => { doc.apps[0].path = "a//b"; },
    doc => { doc.domains.push({ ...doc.domains[0] }); }, doc => { doc.domains[0].host = "999.999.999.999"; },
    doc => { doc.product = "bad\u0081text"; }, doc => { doc.extra = "extra"; }]) {
    const reply = ok(request); mutate(reply.document); assert.equal(validateUnderstandResult(reply, request, { core, now: 100 }), null);
  }
});

test("Brief persistence rejects stale completion without mutating prior record", async () => {
  const s = setup(); const pending = run(s); s.calls[0].resolve(ok(s.calls[0].params)); const done = await pending;
  const record = makeBriefRecord(done, binding(), { core, now: 2000 });
  const original = withProjectBrief(project(), record, { core, now: 2001 });
  assert.throws(() => makeBriefRecord(done, { ...binding(), revision: 3 }, { core, now: 2002 }), { code: "STALE_PROJECT" });
  assert.throws(() => withProjectBrief(original, { ...record, extra: true }, { core, now: 2002 }));
  assert.deepEqual(original.brief, record);
});

test("Explain errors use URL stripped sources and enforce input byte cap before runtime", async () => {
  const s = setup();
  const input = { url: "http://localhost:4173/main", errors: [{ level: "error", text: "Fixture error", source: "http://localhost:4173/main.js?private=1#x", line: 12 }] };
  const pending = s.api.run({ projectId: "p_harbor", kind: "explain_errors", cli: "codex", input });
  assert.equal(s.calls[0].params.input.errors[0].source, "http://localhost:4173/main.js");
  s.calls[0].resolve({ ...ok(s.calls[0].params), document: { version: 1, summary: "Synthetic cause.",
    items: [{ error: "Fixture error", likely_cause: "Fixture only.", where: "src/main.ts" }] } });
  const done = await pending; assert.equal(done.result.status, "ok");
  assert.throws(() => makeBriefRecord(done, binding(), { core, now: 1000 }), { code: "STALE_PROJECT" });
  const large = { ...input, errors: Array.from({ length: 50 }, () => ({ ...input.errors[0], text: "界".repeat(1000) })) };
  assert.throws(() => s.api.run({ projectId: "p_harbor", kind: "explain_errors", cli: "codex", input: large }), { code: "OUTPUT_LIMIT" });
  assert.equal(s.calls.length, 1);
  for (const bad of [{ ...input, url: "http://localhost:4173/main?key=x" },
    { ...input, errors: [{ ...input.errors[0], source: "file:///secret" }] },
    { ...input, errors: [{ ...input.errors[0], source: ".env.local" }] }]) assert.throws(() => validateErrorsInput(bad));
});

test("Metadata discovery is a bounded, strict metadata-only request", async () => {
  const s = setup({ testOnlyAllowRun: false }); const pending = s.api.available();
  assert.equal(s.calls[0].method, "understand/available"); assert.deepEqual(s.calls[0].params, {});
  s.calls[0].resolve({ clis: [{ cli: "codex", path: "/synthetic/bin/codex", version: null }] });
  assert.deepEqual(await pending, { clis: [{ cli: "codex", path: "/synthetic/bin/codex", version: null }] });
  assert.equal(s.time.count(), 0);
  for (const bad of [{ clis: [{ cli: "codex", path: "codex", version: null }] },
    { clis: [{ cli: "codex", path: "/synthetic/bin/codex", version: null, auth: true }] }]) {
    const again = s.api.available(); s.calls.at(-1).resolve(bad); assert.deepEqual(await again, { clis: [] });
  }
});

test("Metadata timeout aborts request and retires unresponsive transport", async () => {
  const s = setup(); const pending = s.api.available(); s.time.advance(5000); await tick();
  assert.deepEqual(await pending, { clis: [] }); assert.equal(s.calls[0].options.signal.aborted, true);
  assert.equal(s.api.diagnostics().closed, true); assert.equal(s.closed(), 1);
});

test("Manifest acceptance changes only explicitly confirmed name/kind at fixed path", () => {
  const brief = core.validateBriefRecord({ version: 1, cli: "codex", generated_at: 1000, accepted: false, document: document() });
  const original = manifest();
  const params = { binding: binding(), current: binding(), brief, manifest: original,
    confirmed: { name: "Harbor renamed", kind: "desktop", confirmed: true }, path: "/synthetic/harbor/.axiosozo/project.json" };
  const plan = prepareBriefAcceptance(params, { core });
  assert.equal(plan.manifest.name, "Harbor renamed"); assert.equal(plan.manifest.kind, "desktop");
  assert.equal(plan.brief.accepted, false); assert.deepEqual(plan.manifest.services, original.services);
  assert(!Object.hasOwn(plan.manifest, "brief")); assert(!JSON.stringify(plan.manifest).includes("Synthetic checkout"));
  assert.throws(() => prepareBriefAcceptance({ ...params, path: "/synthetic/other/.axiosozo/project.json" }, { core }), { code: "UNSAFE_MANIFEST_PATH" });
  assert.throws(() => prepareBriefAcceptance({ ...params, current: { ...binding(), revision: 3 } }, { core }), { code: "STALE_PROJECT" });
  assert.throws(() => prepareBriefAcceptance({ ...params, confirmed: { ...params.confirmed, confirmed: false } }, { core }), { code: "NOT_CONFIRMED" });
  assert.throws(() => prepareBriefAcceptance({ ...params, confirmed: { ...params.confirmed, command: "delete" } }, { core }));
});

test("Trusted normal-window context authorization fails closed and is rechecked after queueing", async () => {
  const denied = setup({ authorizeContext: () => false });
  assert.equal((await run(denied)).result.reason, "NOT_AUTHORIZED"); assert.equal(denied.calls.length, 0);
  let normal = true; const s = setup({ authorizeContext: () => normal });
  const active = run(s), queued = run(s); normal = false;
  s.calls[0].resolve(ok(s.calls[0].params));
  assert.equal((await active).result.reason, "STALE_PROJECT"); assert.equal((await queued).result.reason, "STALE_PROJECT");
  assert.equal(s.calls.length, 1);
});

test("Runtime-provided oversized or cyclic result values fail without retaining documents", async () => {
  const oversized = setup(); const first = run(oversized); oversized.calls[0].resolve({ extra: "界".repeat(90000) });
  assert.equal((await first).result.reason, "OUTPUT_LIMIT");
  const cyclic = setup(); const second = run(cyclic); const reply = {}; reply.self = reply; cyclic.calls[0].resolve(reply);
  assert.equal((await second).result.reason, "SCHEMA_MISMATCH");
});

test("Bounded persistence permits a maximum-size valid Unicode brief", () => {
  const request = { request_id: "r1", kind: "brief", cli: "codex" };
  const large = { version: 1, product: "🧪".repeat(600),
    apps: Array.from({ length: 16 }, () => ({ name: "🧪".repeat(64), kind: "web", path: "🧪".repeat(200), summary: "🧪".repeat(200) })),
    domains: Array.from({ length: 32 }, (_, i) => ({ host: `s${i}.example.test`, purpose: "🧪".repeat(120) })),
    services: Array.from({ length: 16 }, () => ({ name: "🧪".repeat(64), purpose: "🧪".repeat(120) })),
    start: Array.from({ length: 8 }, () => ({ label: "🧪".repeat(64), command: "🧪".repeat(200), cwd: "🧪".repeat(200) })),
    risks: Array.from({ length: 8 }, () => "🧪".repeat(200)) };
  const completion = { version: 1, binding: binding(), result: { ...ok(request), document: large } };
  assert(makeBriefRecord(completion, binding(), { core, now: 1000 }));
  assert(new TextEncoder().encode(JSON.stringify(large)).byteLength > 65536);
});

test("Absent or structurally invalid project bindings never compare equal", () => {
  assert.equal(sameProjectBinding(undefined, undefined), false);
  assert.equal(sameProjectBinding({}, {}), false);
  assert.equal(sameProjectBinding({ id: "bad", revision: null, canonicalRoot: "/" }, { id: "bad", revision: null, canonicalRoot: "/" }), false);
  assert.equal(sameProjectBinding(binding(), binding()), true);
});

test("Relative console sources strip query and fragment; explanation locations remain strict relative paths", () => {
  const input = { url: "http://localhost:4173/", errors: [{ level: "error", text: "Fixture", source: "src/app.js?access_token=synthetic#private", line: 1 }] };
  assert.equal(validateErrorsInput(input).errors[0].source, "src/app.js");
  const request = { request_id: "r1", kind: "explain_errors", cli: "codex" };
  for (const where of ["https://example.test/app.js?access_token=synthetic#private", "./src/app.js", "src//app.js", ".", "../secret", ".env.local", "file:///secret", "c:/secret", "src/app.js?private=1"]) {
    const reply = { ...ok(request), document: { version: 1, summary: "Fixture.", items: [{ error: "Fixture.", likely_cause: "Fixture.", where }] } };
    assert.equal(validateUnderstandResult(reply, request, { core, now: 1000 }), null, where);
  }
});

test("Completion-state project revocation cannot dispatch a queued sibling halfway through the batch", async () => {
  let s, revoked = false;
  s = setup({ onState: state => {
    if (!revoked && state.state === "complete" && state.request_id === "fixture:1") {
      revoked = true; s.api.invalidateProject("p_harbor");
    }
  } });
  const a = run(s), b = run(s), c = run(s);
  s.calls[0].resolve(ok(s.calls[0].params));
  assert.equal((await a).result.status, "ok");
  assert.equal((await b).result.reason, "STALE_PROJECT"); assert.equal((await c).result.reason, "STALE_PROJECT");
  assert.equal(s.calls.length, 1); assert.equal(s.cancels.length, 0); assert.equal(s.time.count(), 0);
});

test("Queued-state recursive requests preserve the one-plus-four capacity invariant", async () => {
  let s, attempts = 0; const nested = [];
  s = setup({ onState: state => {
    if (state.state === "queued" && ++attempts < 8) nested.push(run(s));
  } });
  const first = run(s);
  assert.equal(s.calls.length, 1); assert.equal(s.api.diagnostics().queued, 4);
  assert.equal((await nested[0]).result.reason, "QUEUE_FULL");
  // Recursive pushes unwind deepest-first; resolve all five admitted jobs.
  for (let i = 0; i < 5; i++) { s.calls[i].resolve(ok(s.calls[i].params)); await tick(); }
  assert.equal((await first).result.status, "ok");
  assert.equal((await Promise.all(nested)).filter(done => done.result.status === "busy").length, 1);
  assert.equal(s.time.count(), 0);
});

test("Profile cap accounts for JSON-escaped schema-valid Unicode boundary strings", () => {
  const fill = count => "\ud800".repeat(count);
  const doc = { version: 1, product: fill(600),
    apps: Array.from({ length: 16 }, () => ({ name: fill(64), kind: "web", path: fill(200), summary: fill(200) })),
    domains: Array.from({ length: 32 }, (_, i) => ({ host: `${String(i).padStart(2, "0")}${"a".repeat(61)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`, purpose: fill(120) })),
    services: Array.from({ length: 16 }, () => ({ name: fill(64), purpose: fill(120) })),
    start: Array.from({ length: 8 }, () => ({ label: fill(64), command: fill(200), cwd: fill(200) })),
    risks: Array.from({ length: 8 }, () => fill(200)) };
  const request = { request_id: "r1", kind: "brief", cli: "claude-code" };
  const done = { version: 1, binding: binding(), result: { ...ok(request), document: doc } };
  assert(validateUnderstandResult(done.result, request, { core, now: 0 }));
  const record = makeBriefRecord(done, binding(), { core, now: 0 });
  assert(new TextEncoder().encode(JSON.stringify(record)).byteLength > 131072);
});

test("Only trusted transport faults prove whether a run frame was handed off", async () => {
  for (const [name, value, expected] of [["UnderstandTransportError", false, false], ["UnderstandTransportError", true, true], ["Error", false, true]]) {
    const s = setup(); const pending = run(s); const error = new Error("HOST_UNAVAILABLE");
    error.name = name; error.code = "HOST_UNAVAILABLE"; error.data_sent = value; s.calls[0].reject(error);
    const done = await pending; assert.equal(done.result.status, "failed"); assert.equal(done.result.data_sent, expected);
  }
  const cancelled = setup(); const pending = run(cancelled); cancelled.api.cancel(cancelled.calls[0].params.request_id);
  const error = new Error("CANCELLED"); error.name = "UnderstandTransportError"; error.code = "CANCELLED"; error.data_sent = false;
  cancelled.calls[0].reject(error); const done = await pending;
  assert.equal(done.result.status, "cancelled"); assert.equal(done.result.data_sent, false);
});

test("queued and running observers cannot dispatch after owner/root/revision revocation", async () => {
  for (const phase of ["queued", "running"]) for (const change of ["owner", "root", "revision"]) {
    let current = binding(), normal = true;
    const s = setup({ lookupProject: () => current, authorizeContext: () => normal, onState: state => {
      if (state.state !== phase) return;
      if (change === "owner") normal = false;
      else current = { ...current, ...(change === "root" ? { canonicalRoot: "/synthetic/other" } : { revision: 3 }) };
    } });
    const done = await run(s);
    assert.equal(done.result.reason, "STALE_PROJECT", `${phase}/${change}`);
    assert.equal(done.result.data_sent, false); assert.equal(s.calls.length, 0); assert.equal(s.time.count(), 0);
  }
});
test("trusted run guard propagates root/revision/context and service epoch checks", async () => {
  let current = binding(), normal = true, epoch = 7;
  const s = setup({ lookupProject: () => current, authorizeContext: () => normal });
  const pending = s.api.run({ projectId: "p_harbor", cli: "codex" }, { isActive: () => epoch === 7 });
  const call = s.calls[0]; assert.equal(typeof call.options.isActive, "function"); assert.equal(call.options.isActive(), true);
  current = { ...binding(), revision: 3 }; assert.equal(call.options.isActive(), false);
  current = binding(); normal = false; assert.equal(call.options.isActive(), false);
  normal = true; epoch = 8; assert.equal(call.options.isActive(), false);
  call.resolve(ok(call.params)); const done = await pending;
  assert.equal(done.result.reason, "STALE_PROJECT"); assert.equal(done.result.document, null);
  assert.throws(() => s.api.run({ projectId: "p_harbor", cli: "codex", isActive: true }), { code: "INVALID_INPUT" });
});
test("metadata guard prevents initial work and drops a revoked owner's reply", async () => {
  let active = false; const s = setup();
  assert.deepEqual(await s.api.available({ isActive: () => active }), { clis: [] }); assert.equal(s.calls.length, 0);
  active = true; const pending = s.api.available({ isActive: () => active });
  const call = s.calls[0]; assert.equal(call.options.isActive(), true); active = false; assert.equal(call.options.isActive(), false);
  call.resolve({ clis: [{ cli: "codex", path: "/synthetic/bin/codex", version: null }] });
  assert.deepEqual(await pending, { clis: [] }); assert.equal(s.time.count(), 0);
});
