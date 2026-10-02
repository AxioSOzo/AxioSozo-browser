import test from "node:test";
import assert from "node:assert/strict";
import { createOwnedSocketLease } from "../chrome/AgentSocketLease.sys.mjs";
import { createOwnedSocketSpawn, beginOwnedSocketCall } from "../chrome/AgentOwnedSocketSpawn.sys.mjs";
import { createAgentSocketSubprocessBackend } from "../chrome/AgentSocketSubprocess.sys.mjs";
import { AgentUnixSocketPath } from "../chrome/AgentUnixSocketPath.sys.mjs";
import { AgentChannelEndpoint } from "../chrome/AgentChannelTransport.sys.mjs";
import { createNativeAgentChannelConfiguration, agentSocketPaths, AGENT_SOCKET_SHA256 } from "../chrome/AgentChannelConfig.sys.mjs";
import { createAgentChannelService } from "../chrome/AgentChannelService.sys.mjs";

const incomplete = error => error.code === "CLEANUP_INCOMPLETE";
const unavailable = error => error.code === "EXACT_SOCKET_METADATA_UNAVAILABLE";
const flush = async () => { for (let i = 0; i < 100; i++) await Promise.resolve(); };
const hang = () => new Promise(() => {});
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
class Clock {
  at = 0; id = 0; jobs = new Map();
  setTimeout = (fn, ms) => { const id = ++this.id; this.jobs.set(id, { fn, at: this.at + ms }); return id; };
  clearTimeout = id => this.jobs.delete(id);
  async tick(ms) {
    const end = this.at + ms;
    for (;;) {
      const next = [...this.jobs].filter(([, job]) => job.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.at = next[1].at; this.jobs.delete(next[0]); next[1].fn(); await flush();
    }
    this.at = end; await flush();
  }
}
const identity = (kind = "directory", inode = "1", mode = kind === "directory" ? 0o700 : 0o600) => ({ kind, uid: 501, mode, device: "7", inode });
function childFixture({ ack = '{"ok":true,"result":true}\n', close = "reject", wait } = {}) {
  const exit = deferred(), counts = { close: 0, kill: 0, wait: 0, read: 0 };
  const child = { stdin: { close() { counts.close++; if (close === "reject") return Promise.reject(new Error("synthetic close failure"));
      if (close === "exit") exit.resolve({ exitCode: 0 }); return close === "hang" ? hang() : Promise.resolve(); } },
    stdout: { readString() { counts.read++; return ack === null ? hang() : Promise.resolve(ack); }, async close() {} },
    stderr: { read: hang, async close() {} },
    kill(signal) { assert.equal(signal, 0); counts.kill++; return Promise.resolve(); },
    wait() { counts.wait++; return wait ? wait() : exit.promise; } };
  return { child, exit, counts };
}
const backendFor = (clock, Subprocess) => createAgentSocketSubprocessBackend({ configuredTrusted: true,
  interpreter: "/trusted/python3", helperPath: "/trusted/helper.py", Subprocess, timers: clock });
function pathsFixture(lock, changes = {}) {
  const files = new Map([["/owned", identity()], ["/owned/run", identity("directory", "2")]]), calls = [];
  const backend = { exactAvailable: true, uid: async () => { calls.push("uid"); return 501; },
    lstat: async path => { calls.push("stat"); return files.get(path) ?? null; }, mkdir: async () => {},
    acquireLock: async () => { calls.push("acquire"); return lock; },
    probeUnix: async () => { calls.push("probe"); return { state: "live" }; },
    removeSocketIfMatches: async path => { calls.push("unlink"); files.delete(path); return true; }, ...changes };
  const paths = new AgentUnixSocketPath(backend);
  const runtime = { paths, file: path => ({ path }), openConnection() {}, createServerSocket() {
    calls.push("server"); return { initWithFilename(file, mode) { assert.equal(mode, 0o600); calls.push("bind"); files.set(file.path, identity("socket", "3")); },
      asyncListen() { calls.push("listen"); }, close() { calls.push("close-server"); } };
  } };
  const endpoint = new AgentChannelEndpoint({ runtime, controller: { stop() {} } });
  return { files, calls, paths, endpoint, runtime, backend };
}

test("post-acquire release failure retains an unbound claim, blocks reuse and reaches explicit Endpoint.stop", async () => {
  const clock = new Clock(), c = childFixture(), lock = createOwnedSocketLease(c.child, clock), f = pathsFixture(lock);
  f.files.set("/owned/run/s", identity("regular", "foreign"));
  const start = f.endpoint.start({ socketPath: "/owned/run/s" }); await flush(); await clock.tick(1000);
  assert.equal((await start).reason, "CLEANUP_INCOMPLETE");
  assert.equal(f.paths.ownershipDiagnostics().retained_preclaims, 1);
  assert.equal(f.calls.includes("server"), false); assert.equal(f.calls.includes("unlink"), false);
  const before = [...f.calls]; await assert.rejects(f.paths.prepare("/owned/run/s"), incomplete); assert.deepEqual(f.calls, before);
  await assert.rejects(f.endpoint.start({ socketPath: "/owned/run/s" }), incomplete);
  const stop = f.endpoint.stop(), rejected = assert.rejects(stop, incomplete); await flush(); await clock.tick(1000); await rejected;
  assert.equal(f.files.get("/owned/run/s").kind, "regular");
  c.exit.resolve({ exitCode: -9 }); await flush(); await f.endpoint.stop();
  assert.equal(f.endpoint.status.state, "disabled"); assert.equal(f.paths.hasRetainedCleanup, false);
  assert.equal(f.files.get("/owned/run/s").kind, "regular"); assert.equal(clock.jobs.size, 0);
});

test("a successful pre-claim release preserves the original refusal and does not retain a claim", async () => {
  const clock = new Clock(), c = childFixture({ close: "exit" }), f = pathsFixture(createOwnedSocketLease(c.child, clock));
  f.files.set("/owned/run/s", identity("socket", "external"));
  assert.equal((await f.endpoint.start({ socketPath: "/owned/run/s" })).reason, "SOCKET_IN_USE");
  assert.equal(f.paths.hasRetainedCleanup, false); await f.endpoint.stop();
  assert.equal(f.files.get("/owned/run/s").inode, "external"); assert.equal(f.calls.includes("unlink"), false);
});

test("a failure arising during an explicit stop is retained for the next stop, not retried in the same stop", async () => {
  const clock = new Clock(), c = childFixture(), lock = createOwnedSocketLease(c.child, clock), pause = deferred();
  const f = pathsFixture(lock, { lstat: async path => path === "/owned/run/s" ? pause.promise : identity("directory", path === "/owned" ? "1" : "2") });
  const start = f.endpoint.start({ socketPath: "/owned/run/s" }); await flush();
  const stop = f.endpoint.stop(), rejected = assert.rejects(stop, incomplete); pause.resolve(identity("regular", "external"));
  await flush(); await clock.tick(1000); await rejected; await start;
  assert.equal(c.counts.close, 1); assert.equal(f.paths.hasRetainedCleanup, true);
  c.exit.resolve({ exitCode: 0 }); await flush(); await f.endpoint.stop(); assert.equal(f.paths.hasRetainedCleanup, false);
});

test("pre-ack malformed reply retains the exact owned child after close and kill acknowledgements", async () => {
  const clock = new Clock(), c = childFixture({ ack: "invalid\n" }); let spawns = 0;
  const backend = backendFor(clock, { async call() { spawns++; return c.child; } });
  const pending = backend.acquireLock("/owned/run/s", identity()), rejected = assert.rejects(pending, incomplete);
  await flush(); await clock.tick(1000); await rejected;
  assert.equal(backend.hasRetainedCleanup, true); assert.equal(backend.ownershipDiagnostics().owned_exit_receipts, 0);
  assert(c.counts.kill > 0); await assert.rejects(backend.acquireLock("/owned/run/s", identity()), incomplete); assert.equal(spawns, 1);
  const snapshot = backend.retainedCleanupLocks(), cleanup = backend.cleanupRetainedLocks(snapshot), failed = assert.rejects(cleanup, incomplete);
  await flush(); await clock.tick(1000); await failed;
  c.exit.resolve({ exitCode: -9 }); await flush(); await backend.cleanupRetainedLocks(snapshot);
  assert.equal(backend.hasRetainedCleanup, false); assert.equal(backend.ownershipDiagnostics().owned_exit_receipts, 1); assert.equal(clock.jobs.size, 0);
  assert.equal(backend.ownershipDiagnostics().lease_exit_receipts, 0);
});

test("pre-ack EOF, oversized reply and helper error retain unresolved ownership; owned exit preserves each original error", async () => {
  for (const [ack, code] of [["", "EXACT_SOCKET_METADATA_UNAVAILABLE"], ["x".repeat(16385) + "\n", "EXACT_SOCKET_METADATA_UNAVAILABLE"],
    ['{"ok":false,"error":"SOCKET_IN_USE"}\n', "SOCKET_IN_USE"]]) {
    const clock = new Clock(), c = childFixture({ ack, close: "exit" }), backend = backendFor(clock, { async call() { return c.child; } });
    await assert.rejects(backend.acquireLock("/owned/run/s", identity()), { code });
    assert.equal(backend.hasRetainedCleanup, false); assert.equal(backend.ownershipDiagnostics().owned_exit_receipts, 1); assert.equal(clock.jobs.size, 0);
  }
});

test("pre-ack watchdog retains a hanging child through Endpoint.stop without any bind", async () => {
  const clock = new Clock(), c = childFixture({ ack: null }), backend = backendFor(clock, { async call() { return c.child; } });
  const f = pathsFixture(null, { acquireLock: backend.acquireLock, get hasRetainedCleanup() { return backend.hasRetainedCleanup; },
    retainedCleanupLocks: backend.retainedCleanupLocks, cleanupRetainedLocks: backend.cleanupRetainedLocks });
  // Object spread snapshots a getter; supply the real live getter explicitly.
  Object.defineProperty(f.backend, "hasRetainedCleanup", { get: () => backend.hasRetainedCleanup });
  const start = f.endpoint.start({ socketPath: "/owned/run/s" }); await flush(); await clock.tick(4000);
  assert.equal((await start).reason, "CLEANUP_INCOMPLETE"); assert.equal(f.calls.includes("bind"), false);
  const stop = f.endpoint.stop(), rejected = assert.rejects(stop, incomplete); await flush(); await clock.tick(1000); await rejected;
  c.exit.resolve({ exitCode: -9 }); await flush(); await f.endpoint.stop();
  assert.equal(f.endpoint.status.state, "disabled"); assert.equal(backend.hasRetainedCleanup, false); assert.equal(clock.jobs.size, 0);
});

test("pending raw spawn is retained after the watchdog; its late child is cleaned on the same owned handle", async () => {
  const clock = new Clock(), spawn = deferred(), c = childFixture(), backend = backendFor(clock, { call: () => spawn.promise });
  const pending = backend.acquireLock("/owned/run/s", identity()), rejected = assert.rejects(pending, incomplete);
  await flush(); await clock.tick(4000); await rejected;
  assert.equal(backend.ownershipDiagnostics().pending_spawns, 1); assert.equal(c.counts.kill, 0);
  spawn.resolve(c.child); await flush(); assert.equal(backend.ownershipDiagnostics().owned_handles, 1);
  assert.equal(c.counts.read, 0); assert(c.counts.close > 0); await clock.tick(1000);
  assert.equal(backend.hasRetainedCleanup, true); assert.equal(backend.ownershipDiagnostics().owned_exit_receipts, 0);
  c.exit.resolve({ exitCode: -9 }); await flush(); await backend.cleanupRetainedLocks(backend.retainedCleanupLocks());
  assert.equal(backend.ownershipDiagnostics().owned_exit_receipts, 1); assert.equal(clock.jobs.size, 0);
});

test("late actual spawn rejection proves no child, but deadline rejection alone does not", async () => {
  const clock = new Clock(), spawn = deferred(), backend = backendFor(clock, { call: () => spawn.promise });
  const pending = backend.acquireLock("/owned/run/s", identity()), rejected = assert.rejects(pending, incomplete);
  await flush(); await clock.tick(4000); await rejected;
  assert.deepEqual(backend.ownershipDiagnostics(), { retained_locks: 1, pending_spawns: 1, owned_handles: 0, acknowledged_locks: 0, owned_exit_receipts: 0, no_child_receipts: 0,
    helper_spawned: 0, helper_wait_completed: 0, helper_outstanding: 1, lease_acquired: 0, lease_exit_receipts: 0, lease_outstanding: 0 });
  spawn.reject(new Error("actual native spawn rejected")); await flush();
  assert.equal(backend.hasRetainedCleanup, true); await backend.cleanupRetainedLocks(backend.retainedCleanupLocks());
  assert.equal(backend.ownershipDiagnostics().no_child_receipts, 1); assert.equal(backend.ownershipDiagnostics().owned_exit_receipts, 0);
  assert.equal(clock.jobs.size, 0);
});

test("an indefinitely pending spawn remains owned through bounded retries and never starts another helper", async () => {
  const clock = new Clock(); let spawns = 0;
  const backend = backendFor(clock, { call() { spawns++; return hang(); } });
  const pending = backend.acquireLock("/owned/run/s", identity()), rejected = assert.rejects(pending, incomplete);
  await flush(); await clock.tick(4000); await rejected;
  for (let i = 0; i < 2; i++) {
    const retry = backend.cleanupRetainedLocks(backend.retainedCleanupLocks()), failed = assert.rejects(retry, incomplete);
    await flush(); await clock.tick(1000); await failed;
    assert.equal(backend.ownershipDiagnostics().helper_outstanding, 1);
    assert.equal(backend.ownershipDiagnostics().helper_wait_completed, 0);
    await assert.rejects(backend.acquireLock("/owned/run/s", identity()), incomplete);
  }
  assert.equal(spawns, 1); assert.equal(clock.jobs.size, 0);
});

test("only an issued retained snapshot can retry pre-claim cleanup; unrelated releases are never invoked", async () => {
  const clock = new Clock(), c = childFixture(), f = pathsFixture(createOwnedSocketLease(c.child, clock));
  f.files.set("/owned/run/s", identity("regular", "foreign"));
  const preparation = f.paths.prepare("/owned/run/s"), failed = assert.rejects(preparation, incomplete);
  await flush(); await clock.tick(1000); await failed;
  const before = c.counts.close; let foreign = 0;
  await assert.rejects(f.paths.cleanupRetained({ claims: [{ lock: { async release() { foreign++; } } }], locks: [] }), incomplete);
  assert.equal(c.counts.close, before); assert.equal(foreign, 0); assert.equal(f.paths.hasRetainedCleanup, true);
  c.exit.resolve({ exitCode: 0 }); await flush(); await f.paths.cleanupRetained(f.paths.retainedCleanupClaims());
  assert.equal(f.paths.hasRetainedCleanup, false); assert.equal(clock.jobs.size, 0);
});

test("provisional release before launch prevents launch and has no actual-exit receipt", async () => {
  const clock = new Clock(), owner = createOwnedSocketSpawn(clock); await owner.release();
  assert.equal(owner.beginSpawn(), false); assert.equal(owner.released, true); assert.equal(owner.exitReceipt, null);
  assert.equal(owner.ownershipDiagnostics().owned_exit_receipt, false); assert.equal(clock.jobs.size, 0);
});

test("rejected or malformed raw wait keeps a pre-ack owner unresolved even after usability loss", async () => {
  for (const wait of [() => Promise.reject(new Error("no receipt")), () => Promise.resolve({ exitCode: 0, extra: true })]) {
    const clock = new Clock(), c = childFixture({ wait }), acquisition = beginOwnedSocketCall({ async call() { return c.child; } }, {}, clock);
    await acquisition.process; await flush(); await assert.rejects(acquisition.owner.release(), unavailable);
    assert.equal(acquisition.owner.released, false); assert.equal(acquisition.owner.exitReceipt, null); assert.equal(clock.jobs.size, 0);
  }
});

function nativeFixture() {
  const clock = new Clock(), root = "/Volumes/AxioSozoBuild/workstation", profile = root + "/p4c-test/gecko", paths = agentSocketPaths(root);
  const files = new Map();
  for (const [path, kind, mode, inode] of [[paths.interpreter, "regular", 0o755, "1"], [paths.helperPath, "regular", 0o400, "2"],
    [paths.helperDirectory, "directory", 0o700, "3"], [profile, "directory", 0o700, "4"]])
    files.set(path, { kind, uid: 501, nlink: kind === "directory" ? 2 : 1, mode, size: 100, device: "7", inode });
  let spawns = 0; const c = childFixture();
  const runtime = { timers: clock, env: () => root, profileDirectory: () => profile, ownUid: async () => 501,
    verifyFile: async path => files.has(path), exactMetadata: async path => ({ ...files.get(path) }), sha256: async () => AGENT_SOCKET_SHA256,
    Subprocess: { async call() { spawns++; return c.child; } } };
  return { clock, runtime, c, files, paths, get spawns() { return spawns; } };
}

test("native guard watchdog publishes a late raw lock child to retained ownership before proxy construction", async () => {
  const f = nativeFixture(), config = await createNativeAgentChannelConfiguration({ runtime: f.runtime, createBackend: createAgentSocketSubprocessBackend });
  const spawn = deferred(); f.runtime.Subprocess.call = () => spawn.promise;
  const pending = config.exactPosixBackend.acquireLock("/owned/run/s", identity()), rejected = assert.rejects(pending, incomplete);
  await flush(); await f.clock.tick(4000); await rejected;
  assert.equal(config.ownershipDiagnostics().lock_helpers.pending_spawns, 1);
  spawn.resolve(f.c.child); await flush(); assert.equal(f.c.counts.read, 0); assert(f.c.counts.close > 0);
  await f.clock.tick(1000); assert.equal(config.ownershipDiagnostics().lock_helpers.owned_exit_receipts, 0);
  f.c.exit.resolve({ exitCode: -9 }); await flush(); await config.exactPosixBackend.cleanupRetainedLocks(config.exactPosixBackend.retainedCleanupLocks());
  assert.equal(config.ownershipDiagnostics().lock_helpers.owned_exit_receipts, 1); assert.equal(f.clock.jobs.size, 0);
});

test("native proof watchdog cannot spawn after cancellation and records no-child separately from owned exit", async () => {
  const f = nativeFixture(), config = await createNativeAgentChannelConfiguration({ runtime: f.runtime, createBackend: createAgentSocketSubprocessBackend });
  const proof = deferred(); f.runtime.sha256 = () => proof.promise;
  const pending = config.exactPosixBackend.acquireLock("/owned/run/s", identity()), rejected = assert.rejects(pending, unavailable);
  await flush(); await f.clock.tick(3000); await rejected;
  proof.resolve(AGENT_SOCKET_SHA256); await flush();
  assert.equal(f.spawns, 0); assert.equal(config.exactPosixBackend.hasRetainedCleanup, false);
  assert.equal(config.ownershipDiagnostics().lock_helpers.no_child_receipts, 1); assert.equal(config.ownershipDiagnostics().lock_helpers.owned_exit_receipts, 0); assert.equal(f.clock.jobs.size, 0);
});

test("native installed-helper mutation fails admission before spawn or retention", async () => {
  const f = nativeFixture(), config = await createNativeAgentChannelConfiguration({ runtime: f.runtime, createBackend: createAgentSocketSubprocessBackend });
  f.files.get(f.paths.helperPath).nlink = 2;
  await assert.rejects(config.exactPosixBackend.acquireLock("/owned/run/s", identity()), unavailable);
  assert.equal(f.spawns, 0); assert.equal(config.exactPosixBackend.hasRetainedCleanup, false); assert.equal(f.clock.jobs.size, 0);
});

test("categorical ownership diagnostics have no native effects and never count kill or close as exit", async () => {
  const f = nativeFixture(), config = await createNativeAgentChannelConfiguration({ runtime: f.runtime, createBackend: createAgentSocketSubprocessBackend });
  const lock = await config.exactPosixBackend.acquireLock("/owned/run/s", identity());
  const snapshot = { ...f.c.counts };
  for (let i = 0; i < 20; i++) {
    const diagnostic = config.ownershipDiagnostics(), value = diagnostic.lock_helpers;
    assert.equal(diagnostic.native_config_verified, true); assert.equal(value.owned_handles, 1); assert.equal(value.acknowledged_locks, 1); assert.equal(value.owned_exit_receipts, 0);
    assert.equal(value.helper_spawned, 1); assert.equal(value.helper_outstanding, 1); assert.equal(value.lease_acquired, 1); assert.equal(value.lease_outstanding, 1);
    assert(Object.isFrozen(value)); assert(Object.isFrozen(diagnostic)); assert.equal(JSON.stringify(value).includes("/"), false);
  }
  assert.deepEqual(f.c.counts, snapshot); assert.equal(f.spawns, 1);
  const release = lock.release(), rejected = assert.rejects(release, unavailable); await flush(); await f.clock.tick(1000); await rejected;
  assert(f.c.counts.kill > 0); assert.equal(config.ownershipDiagnostics().lock_helpers.owned_exit_receipts, 0);
  assert.equal(config.ownershipDiagnostics().lock_helpers.lease_outstanding, 1);
  f.c.exit.resolve({ exitCode: 0 }); await flush(); await lock.release(); assert.equal(config.ownershipDiagnostics().lock_helpers.owned_exit_receipts, 1);
  assert.equal(config.ownershipDiagnostics().lock_helpers.helper_outstanding, 0); assert.equal(config.ownershipDiagnostics().lock_helpers.lease_outstanding, 0);
  assert.equal(config.ownershipDiagnostics().lock_helpers.lease_exit_receipts, 1);
  await f.clock.tick(500); assert.equal(f.clock.jobs.size, 0);
});

test("service retains the original configuration after failed unbound cleanup and blocks replacement", async () => {
  const clock = new Clock(), c = childFixture(), f = pathsFixture(createOwnedSocketLease(c.child, clock));
  f.files.set("/owned/run/s", identity("regular", "external")); let factories = 0;
  const service = createAgentChannelService({ loadProjects: () => [], validateProject: value => value, validateStatusRecord: value => value,
    parseHookEvent: () => null, now: () => clock.at, randomHex: () => "0123456789abcdef", isSensitiveHost: () => false, timers: clock,
    createNativeConfiguration: async () => { factories++; return { socketPath: "/owned/run/s", exactPosixBackend: {} }; },
    createTransportRuntime: () => f.runtime });
  await service.initialize(); const enable = service.setEnabled(true); await flush(); await clock.tick(2000); await enable;
  assert.equal(service.getEndpointState().reason, "CLEANUP_INCOMPLETE");
  const again = service.setEnabled(true); await flush(); await clock.tick(1000); await again;
  assert.equal(factories, 1); assert.equal(f.calls.includes("bind"), false); assert.equal(f.paths.hasRetainedCleanup, true);
  c.exit.resolve({ exitCode: 0 }); await flush(); await service.setEnabled(false); await service.close();
  assert.equal(f.paths.hasRetainedCleanup, false); assert.equal(clock.jobs.size, 0);
});
