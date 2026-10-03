/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 9: the shared decision runtime of the real AxioSozoServices: one
// process budget at the published rule-store limit, one sending router whose
// beforeSending is the host's only constructor hook, retained leases revoked at
// every policy invalidation, and window closure that closes nothing shared.
// Synthetic storage, clock, windows and provider host; no real profile, host
// process, provider or network. Not evidence of a running browser.
import test from "node:test";
import assert from "node:assert/strict";
import { contextsCoreAvailable } from "./support/chrome-modules.mjs";
import { fakeZenWindow } from "./support/fake-zen.mjs";

const skip = contextsCoreAvailable ? false : "packages/contexts/src/index.mjs is absent";
const { AxioSozoServices } = skip ? {} : await import("../chrome/AxioSozoServices.sys.mjs");
const { ZenWorkspaceAdapter } = await import("../chrome/ZenWorkspaceAdapter.sys.mjs");
const core = skip ? {} : await import("../../../packages/contexts/src/index.mjs");

const HOME = "11111111-1111-4111-8111-111111111111";
const settle = async (rounds = 12) => { for (let i = 0; i < rounds; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };

function rulesFile(hourly) {
  return JSON.stringify({ ...core.DEFAULT_RULE_STORE, jev: { ...core.DEFAULT_RULE_STORE.jev, hourly_budget: hourly } });
}

function harness({ hourly = 7, readGate = null, failReads = 0, shutdownOwner = "registered" } = {}) {
  const files = new Map([["site-rules.json", rulesFile(hourly)]]);
  const reads = { count: 0, fail: failReads };
  const writes = { fail: 0 };
  const writeGates = [];
  const storageFor = name => ({
    read: async () => {
      if (name === "site-rules.json") {
        reads.count++;
        if (reads.fail > 0) { reads.fail--; throw new Error("synthetic read failure"); }
        if (readGate) await readGate.promise;
      }
      return files.get(name) ?? null;
    },
    write: async text => {
      const gate = name === "site-rules.json" ? writeGates.shift() : null;
      if (gate) await gate.promise;
      if (name === "site-rules.json" && writes.fail > 0) { writes.fail--; throw new Error("synthetic write failure"); }
      files.set(name, text);
    },
  });
  let now = Date.UTC(2026, 9, 3, 12);
  const shutdown = [];
  const host = { factory: 0, calls: [], options: [], closed: 0, hook: null, hold: null, afterSend: null, reply: null };
  let serial = 0;
  // The process shutdown owner: registered, absent, or refusing the decisions' registration.
  const onShutdown = shutdownOwner === "missing" ? undefined : (fn, label) => {
    if (shutdownOwner === "throws" && label === "AxioSozo: close decisions") throw new Error("shutdown phase already passed");
    shutdown.push({ fn, label });
  };
  const services = new AxioSozoServices({
    storageFor, clock: () => now, randomId: prefix => `${prefix}fixture${++serial}`,
    timers: { setTimeout: () => 0, clearTimeout: () => {} },
    onShutdown,
    createDecisionHost: ({ onSending, ...rest }) => {
      host.factory++;
      host.hook = onSending;
      host.extra = Object.keys(rest);
      const decide = async (request, options) => {
        host.calls.push(request);
        host.options.push(Object.keys(options ?? {}));
        if (host.hold) await host.hold.promise;
        try { onSending({ request_id: request.request_id, level: request.state.observation.level }); }
        catch { return { reason: "cancelled", data_sent: false, request_id: request.request_id }; }
        // Sent: the provider's answer is still on its way.
        if (host.afterSend) await host.afterSend.promise;
        return host.reply ?? { reason: "validated", data_sent: true, request_id: request.request_id };
      };
      decide.close = async () => { host.closed++; };
      decide.diagnostics = () => ({ running: false, closed: host.closed > 0 });
      return decide;
    },
  });
  const zen = fakeZenWindow({ spaces: [{ uuid: HOME, name: "Home", containerTabId: 0 }] });
  const unregister = services.registerWindow(zen.window, new ZenWorkspaceAdapter(zen.window));
  /** The next rule-store writes wait for `gates` (null: that write is not held). */
  const holdWrites = (...gates) => writeGates.push(...gates.map(gate => gate ?? null));
  return { services, files, reads, writes, host, shutdown, zen, unregister, holdWrites, advance: ms => { now += ms; } };
}

const request = (id = "req_fixture1", level = "address") => ({ version: 1, request_id: id, choice_set: "site_rule_v1",
  context_version: "site-rule-1", deadline_ms: Date.UTC(2026, 9, 3, 12, 0, 20), state: { observation: { level } } });

async function ready(h) {
  const runtime = h.services.getDecisionRuntime();
  await settle();
  return runtime;
}

test("initial authority is unready at limit 0; the first runtime call hydrates the complete rule store; one frozen interface", { skip }, async () => {
  const h = harness({ hourly: 7 });
  assert.deepEqual(h.services.getDecisionPolicySnapshot(), { revision: 0, limit: 0, ready: false });
  assert.ok(Object.isFrozen(h.services.getDecisionPolicySnapshot()));
  assert.equal(h.reads.count, 0, "nothing is read before the runtime is asked for");
  const runtime = h.services.getDecisionRuntime();
  assert.equal(runtime.budget.limit(), 0, "never the default 30 while unready");
  assert.equal(runtime.budget.reserve().ok, false);
  await settle();
  const snapshot = h.services.getDecisionPolicySnapshot();
  assert.deepEqual([snapshot.ready, snapshot.limit], [true, 7]);
  assert.ok(snapshot.revision > 0);
  assert.equal(h.services.getDecisionRuntime(), runtime, "the same frozen interface every call");
  assert.ok(Object.isFrozen(runtime));
  assert.deepEqual(Object.keys(runtime).sort(), ["budget", "decide", "diagnostics", "registerLease"]);
  assert.equal(runtime.budget.limit(), 7);
  assert.equal(h.host.factory, 0, "no provider host until an admitted request");
  for (const name of ["router", "close", "beforeSending", "host", "leases"]) assert.equal(runtime[name], undefined, name);
  const diagnostics = runtime.diagnostics();
  assert.deepEqual([diagnostics.created, diagnostics.ready, diagnostics.limit, diagnostics.leases, diagnostics.host_created], [true, true, 7, 0, false]);
});

test("a failed read publishes nothing; the next revalidation (another window's runtime call) publishes the complete store", { skip }, async () => {
  const h = harness({ hourly: 4, failReads: 1 });
  const runtime = h.services.getDecisionRuntime();
  await settle();
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit()], [false, 0]);
  assert.throws(() => runtime.registerLease({ requestId: "req_a1", level: "address", beforeSending: () => true }), { code: "POLICY_UNAVAILABLE" });
  h.services.getDecisionRuntime();
  await settle();
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit()], [true, 4]);
});

test("a write invalidates before its first await: new unready revision, every lease revoked, listeners told; only its settling hydrates", { skip }, async () => {
  const h = harness({ hourly: 7 });
  const runtime = await ready(h);
  const before = h.services.getDecisionPolicySnapshot();
  const one = runtime.registerLease({ requestId: "req_one1", level: "address", beforeSending: () => true });
  const two = runtime.registerLease({ requestId: "req_two1", level: "address", beforeSending: () => true });
  assert.deepEqual(Object.keys(one).sort(), ["revoke", "signal"]);
  const seen = [];
  h.services.subscribeDecisionPolicyInvalidation(snapshot => seen.push({ ...snapshot, leases: [one.signal.aborted, two.signal.aborted] }));
  const write = h.services.setJevSettings({ hourly_budget: 2 });
  // Synchronously, before the write's first await:
  const during = h.services.getDecisionPolicySnapshot();
  assert.deepEqual([during.ready, during.limit], [false, 0]);
  assert.ok(during.revision > before.revision, "a new revision, never reused");
  assert.deepEqual([one.signal.aborted, two.signal.aborted], [true, true], "every retained lease revoked synchronously");
  assert.deepEqual(seen, [{ ...during, leases: [true, true] }], "listeners heard it after the revocation");
  assert.equal(runtime.budget.reserve().ok, false, "nothing is reserved while unready");
  await write;
  await settle();
  const after = h.services.getDecisionPolicySnapshot();
  assert.deepEqual([after.ready, after.limit], [true, 2], "the reduced limit, from the complete written store");
  assert.ok(after.revision > during.revision);
  assert.equal(runtime.budget.limit(), 2);
});

test("a superseded or pending hydration never publishes; the latest complete one does", { skip }, async () => {
  const gate = deferred();
  const h = harness({ hourly: 9, readGate: gate });
  const runtime = h.services.getDecisionRuntime(); // hydration 1 holds on the read
  await settle();
  assert.equal(h.services.getDecisionPolicySnapshot().ready, false);
  const write = h.services.saveRule({ match: { hosts: ["a.test"] } }); // invalidates and queues behind the held read
  gate.resolve();
  await settle(4);
  assert.equal(h.services.getDecisionPolicySnapshot().ready, false, "the older hydration finished during a pending write: nothing published");
  await write;
  await settle();
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit()], [true, 9], "the settling write's own hydration publishes");
  // Two writes in flight: the first settling one does not publish while the second is pending.
  const files = h.files;
  const held = deferred();
  h.holdWrites(null, held);
  const first = h.services.setJevSettings({ hourly_budget: 3 });
  const second = h.services.setJevSettings({ hourly_budget: 5 });
  await first;
  await settle();
  assert.equal(h.services.getDecisionPolicySnapshot().ready, false, "still pending: unready");
  assert.equal(runtime.budget.limit(), 0);
  held.resolve();
  await second;
  await settle();
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit()], [true, 5]);
  assert.ok(files.get("site-rules.json").includes("\"hourly_budget\": 5"));
});

test("listeners: synchronous frozen snapshots, owned unsubscribe per registration, and a reentrant listener cannot restore authority", { skip }, async () => {
  const h = harness({ hourly: 6 });
  const runtime = await ready(h);
  const calls = [];
  const same = snapshot => calls.push(["same", snapshot.ready]);
  const offA = h.services.subscribeDecisionPolicyInvalidation(same);
  h.services.subscribeDecisionPolicyInvalidation(same);
  const reentrant = h.services.subscribeDecisionPolicyInvalidation(snapshot => {
    assert.ok(Object.isFrozen(snapshot));
    assert.equal(h.services.getDecisionPolicySnapshot(), snapshot, "the published unready snapshot itself");
    assert.throws(() => runtime.registerLease({ requestId: "req_reentry1", level: "address", beforeSending: () => true }), { code: "POLICY_UNAVAILABLE" });
    calls.push(["reentrant", snapshot.ready]);
    return true; // a return value grants nothing
  });
  offA();
  offA();
  await h.services.deleteRule("r_missing1").catch(() => {});
  assert.deepEqual(calls, [["same", false], ["reentrant", false]], "the other registration of the same callback stays");
  reentrant();
  await settle();
  // A rejected write is not authority: the cached older document never
  // comes back by itself; the next successful write publishes again.
  assert.equal(h.services.getDecisionPolicySnapshot().ready, false, "a failed write keeps the policy unready");
  await h.services.setJevSettings({ hourly_budget: 6 });
  await settle();
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit()], [true, 6], "a later successful write hydrates");
  assert.throws(() => h.services.subscribeDecisionPolicyInvalidation("not a function"), { code: "INVALID_CALLBACK" });
});

test("a rejected write after a ready 30 stays unready at limit 0 (never the cached 30 or the attempted 0); revalidation waits for a successful write", { skip }, async () => {
  const h = harness({ hourly: 30 });
  const runtime = await ready(h);
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit()], [true, 30]);
  const lease = runtime.registerLease({ requestId: "req_before1", level: "address", beforeSending: () => true });
  h.writes.fail = 1;
  await assert.rejects(h.services.setJevSettings({ hourly_budget: 0 }));
  await settle();
  const after = h.services.getDecisionPolicySnapshot();
  assert.deepEqual([after.ready, after.limit, runtime.budget.limit(), lease.signal.aborted], [false, 0, 0, true], "unready, nothing reservable, the old lease revoked");
  assert.match(h.files.get("site-rules.json"), /"hourly_budget":\s*30\b/u, "the file still says 30");
  const reads = h.reads.count;
  for (let i = 0; i < 3; i++) assert.equal(h.services.getDecisionRuntime(), runtime, "another window's runtime call");
  await settle();
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit(), h.reads.count], [false, 0, reads],
    "no automatic rehydration of the old document");
  assert.throws(() => runtime.registerLease({ requestId: "req_after1", level: "address", beforeSending: () => true }), { code: "POLICY_UNAVAILABLE" });
  assert.equal(runtime.budget.reserve().ok, false);
  await h.services.setJevSettings({ hourly_budget: 12 });
  await settle();
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit()], [true, 12], "the next successful write is the authority");
});

test("a write that fails while a later one succeeds: the later success publishes only after both settle; an earlier failure after it does not block", { skip }, async () => {
  const h = harness({ hourly: 7 });
  const runtime = await ready(h);
  const held = deferred();
  h.holdWrites(held, null);
  h.writes.fail = 1;
  const failing = h.services.setJevSettings({ hourly_budget: 3 }).then(() => "ok", () => "rejected");
  const later = h.services.setJevSettings({ hourly_budget: 4 });
  held.resolve();
  assert.equal(await failing, "rejected");
  await later;
  await settle();
  assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit()], [true, 4], "the write that began after the failure publishes");
});

test("a positive answer that arrives after a policy write began is stale: neutral, and its data_sent disclosure is kept", { skip }, async () => {
  const h = harness({ hourly: 7 });
  const runtime = await ready(h);
  h.host.afterSend = deferred();
  const lease = runtime.registerLease({ requestId: "req_sent1", level: "address", beforeSending: () => true });
  const pending = runtime.decide(request("req_sent1"), { signal: lease.signal });
  await settle();
  assert.equal(h.host.calls.length, 1, "handed off and sent; the answer is pending");
  const held = deferred();
  h.holdWrites(held);
  const write = h.services.saveRule({ match: { hosts: ["c.test"] } });
  assert.equal(lease.signal.aborted, true, "the write revoked the lease synchronously");
  h.host.afterSend.resolve();
  const answer = await pending;
  assert.deepEqual([answer.reason, answer.outcome, answer.data_sent, answer.action_authorized], ["cancelled", "none", true, false],
    "the provider's validated answer is dropped; that data was sent is still disclosed");
  held.resolve();
  await write;
  await settle();
  // The same answer while nothing was written stays the provider's.
  h.host.afterSend = null;
  const fresh = runtime.registerLease({ requestId: "req_sent2", level: "address", beforeSending: () => true });
  assert.equal((await runtime.decide(request("req_sent2"), { signal: fresh.signal })).reason, "validated");
});

test("without a registered shutdown owner, decisions stay unavailable: never ready, no lease, no reservation and no host", { skip }, async () => {
  for (const shutdownOwner of ["missing", "throws"]) {
    const h = harness({ hourly: 7, shutdownOwner });
    const runtime = h.services.getDecisionRuntime();
    await settle();
    assert.deepEqual([h.services.getDecisionPolicySnapshot().ready, runtime.budget.limit(), h.reads.count], [false, 0, 0], `${shutdownOwner}: nothing hydrates`);
    assert.throws(() => runtime.registerLease({ requestId: "req_a1", level: "address", beforeSending: () => true }), { code: "POLICY_UNAVAILABLE" });
    assert.equal(runtime.budget.reserve().ok, false);
    assert.equal((await runtime.decide(request("req_a1"), { signal: new AbortController().signal })).reason, "cancelled");
    assert.equal(h.host.factory, 0, `${shutdownOwner}: no host, so no cleanup is ever guessed`);
    assert.equal(h.shutdown.some(entry => entry.label === "AxioSozo: close decisions"), false);
    assert.equal(runtime.diagnostics().host_created, false);
  }
});

test("decide preflight: an unknown, mismatched, revoked or aborted lease answers neutral before any host exists, and spends no hook", { skip }, async () => {
  const h = harness({ hourly: 7 });
  const runtime = await ready(h);
  const guard = { calls: 0 };
  const lease = runtime.registerLease({ requestId: "req_fixture1", level: "address", beforeSending: () => { guard.calls++; return true; } });
  const neutral = async (req, signal) => (await runtime.decide(req, { signal })).reason;
  assert.equal(await neutral(request("req_unknown1"), lease.signal), "cancelled", "unknown request id");
  assert.equal(await neutral(request("req_fixture1", "outline"), lease.signal), "cancelled", "mismatched level");
  assert.equal(await neutral(request("req_fixture1"), new AbortController().signal), "cancelled", "another signal");
  assert.equal(await neutral(request("req_fixture1"), undefined), "cancelled", "no signal");
  assert.deepEqual([h.host.factory, guard.calls], [0, 0], "no host was created and no guard ran");
  const neutralReply = await runtime.decide(request("req_unknown1"), { signal: lease.signal });
  assert.deepEqual([neutralReply.outcome, neutralReply.data_sent, neutralReply.authority, neutralReply.action_authorized], ["none", false, "suggestion_only", false]);
  // The real hand-off: the host is created once with the router's hook; the preflight spent nothing.
  const answer = await runtime.decide(request("req_fixture1"), { signal: lease.signal });
  assert.equal(answer.reason, "validated");
  assert.deepEqual([h.host.factory, guard.calls, h.host.extra], [1, 1, []], "constructed once with onSending only; the hook ran the guard once");
  assert.deepEqual(h.host.options, [["signal"]], "no per-request onSending option");
  assert.throws(() => h.host.hook({ request_id: "req_fixture1", level: "address" }), { code: "cancelled" }, "the sending checkpoint is one-use");
  assert.throws(() => h.host.hook({ request_id: "req_unknown1", level: "address" }), { code: "cancelled" }, "never an unknown request");
  lease.revoke();
  assert.equal(await neutral(request("req_fixture1"), lease.signal), "cancelled", "revoked");
  const aborted = runtime.registerLease({ requestId: "req_abort1", level: "address", beforeSending: () => true });
  aborted.revoke();
  assert.equal(await neutral(request("req_abort1"), aborted.signal), "cancelled", "already aborted");
  assert.equal(h.host.calls.length, 1);
});

test("the router guard requires the caller's literal synchronous true and the captured policy before and after it", { skip }, async () => {
  const h = harness({ hourly: 7 });
  const runtime = await ready(h);
  for (const [label, guard] of [["false", () => false], ["truthy", () => 1], ["promise", () => Promise.resolve(true)], ["throws", () => { throw new Error("x"); }]]) {
    const id = `req_${label}1`;
    const lease = runtime.registerLease({ requestId: id, level: "address", beforeSending: guard });
    const answer = await runtime.decide(request(id), { signal: lease.signal });
    assert.equal(answer.reason, "cancelled", label);
    lease.revoke();
  }
  // The guard itself invalidates the policy (a reentrant write): the hand-off is refused after it.
  const id = "req_inside1";
  const lease = runtime.registerLease({ requestId: id, level: "address", beforeSending: () => { void h.services.setJevSettings({ consent: false }); return true; } });
  assert.equal((await runtime.decide(request(id), { signal: lease.signal })).reason, "cancelled");
});

test("an invalidation while the host starts revokes the lease before the awaited hand-off", { skip }, async () => {
  const h = harness({ hourly: 7 });
  const runtime = await ready(h);
  h.host.hold = deferred();
  const guard = { calls: 0 };
  const lease = runtime.registerLease({ requestId: "req_held1", level: "address", beforeSending: () => { guard.calls++; return true; } });
  const pending = runtime.decide(request("req_held1"), { signal: lease.signal });
  await settle();
  assert.equal(h.host.calls.length, 1, "admitted into the host, which is still starting");
  const write = h.services.saveRule({ match: { hosts: ["b.test"] } });
  assert.equal(lease.signal.aborted, true, "revoked synchronously by the invalidation");
  h.host.hold.resolve();
  assert.equal((await pending).reason, "cancelled", "the hook refused the hand-off");
  assert.equal(guard.calls, 0, "the caller's guard never ran for a revoked lease");
  await write;
});

test("two windows share the one runtime; closing a window closes neither the host nor the router nor another owner's lease", { skip }, async () => {
  const h = harness({ hourly: 7 });
  const runtime = await ready(h);
  const other = fakeZenWindow({ spaces: [{ uuid: HOME, name: "Home", containerTabId: 0 }] });
  const unregisterOther = h.services.registerWindow(other.window, new ZenWorkspaceAdapter(other.window));
  assert.equal(h.services.getDecisionRuntime(), runtime, "the second window gets the same interface and budget");
  const lease = runtime.registerLease({ requestId: "req_window1", level: "address", beforeSending: () => true });
  assert.equal(runtime.budget.reserve().ok, true);
  unregisterOther();
  h.unregister();
  assert.equal(lease.signal.aborted, false, "a window's closure cancels no other owner's work");
  assert.equal((await runtime.decide(request("req_window1"), { signal: lease.signal })).reason, "validated");
  assert.equal(h.host.closed, 0, "the shared host stays open");
  assert.equal(runtime.budget.snapshot().calls.length, 1, "one process history");
  // Profile shutdown alone closes them, once.
  const close = h.shutdown.find(entry => entry.label === "AxioSozo: close decisions");
  assert.ok(close);
  const held = runtime.registerLease({ requestId: "req_late1", level: "address", beforeSending: () => true });
  await close.fn();
  await close.fn();
  assert.deepEqual([held.signal.aborted, h.host.closed, h.services.getDecisionPolicySnapshot().ready], [true, 1, false]);
  assert.throws(() => runtime.registerLease({ requestId: "req_after1", level: "address", beforeSending: () => true }), { code: "DECISIONS_CLOSED" });
  assert.equal((await runtime.decide(request("req_late1"), { signal: held.signal })).reason, "cancelled");
});

test("registration takes exactly requestId, level and a guard; a duplicate live id is refused", { skip }, async () => {
  const h = harness({ hourly: 7 });
  const runtime = await ready(h);
  for (const input of [{}, { requestId: "req_a1", level: "address" }, { requestId: "req_a1", level: "address", beforeSending: () => true, onSending: () => true },
    { requestId: "req_a1", level: "address", beforeSending: "true" }]) {
    assert.throws(() => runtime.registerLease(input), { code: "INVALID_INPUT" }, JSON.stringify(Object.keys(input)));
  }
  assert.throws(() => runtime.registerLease({ requestId: "../x", level: "address", beforeSending: () => true }));
  assert.throws(() => runtime.registerLease({ requestId: "req_a1", level: "none", beforeSending: () => true }));
  const lease = runtime.registerLease({ requestId: "req_a1", level: "address", beforeSending: () => true });
  assert.throws(() => runtime.registerLease({ requestId: "req_a1", level: "address", beforeSending: () => true }), { code: "REQUEST_ID_CONFLICT" });
  lease.revoke();
  const again = runtime.registerLease({ requestId: "req_a1", level: "address", beforeSending: () => true });
  lease.revoke(); // old cleanup never removes the newer registration
  assert.equal((await runtime.decide(request("req_a1"), { signal: again.signal })).reason, "validated");
});
