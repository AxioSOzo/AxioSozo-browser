import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { createOwnedSocketLease } from "../chrome/AgentSocketLease.sys.mjs";
import { createAgentSocketSubprocessBackend } from "../chrome/AgentSocketSubprocess.sys.mjs";
import { createNativeAgentChannelConfiguration, agentSocketPaths, AGENT_SOCKET_SHA256 } from "../chrome/AgentChannelConfig.sys.mjs";
import { AgentUnixSocketPath } from "../chrome/AgentUnixSocketPath.sys.mjs";
import { AgentChannelEndpoint } from "../chrome/AgentChannelTransport.sys.mjs";
import { createAgentChannelService } from "../chrome/AgentChannelService.sys.mjs";
import { readAgentPipe } from "../chrome/AgentPipeBytes.sys.mjs";

const unavailable = e => e.code === "EXACT_SOCKET_METADATA_UNAVAILABLE";
const incomplete = e => e.code === "CLEANUP_INCOMPLETE";
const flush = async () => { for (let i = 0; i < 70; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const hang = () => new Promise(() => {});
class Clock {
  at = 0; next = 0; jobs = new Map();
  setTimeout = (fn, ms) => { const id = ++this.next; this.jobs.set(id, { fn, at: this.at + ms }); return id; };
  clearTimeout = id => this.jobs.delete(id);
  async tick(ms) {
    const end = this.at + ms;
    for (;;) {
      const next = [...this.jobs].filter(([,v]) => v.at <= end).sort((a,b) => a[1].at-b[1].at)[0];
      if (!next) break;
      this.at = next[1].at; this.jobs.delete(next[0]); next[1].fn(); await flush();
    }
    this.at = end; await flush();
  }
}
function leaseFixture(overrides = {}) {
  const clock = new Clock(), exit = deferred(), counters = { closes: 0, kills: 0, waits: 0 };
  const child = { stdin: { async close() { counters.closes++; } },
    wait() { counters.waits++; return exit.promise; }, async kill(signal) { assert.equal(signal, 0); counters.kills++; }, ...overrides };
  const lease = createOwnedSocketLease(child, clock);
  return { clock, exit, child, counters, lease };
}

test("a failed stdin close cannot turn release retries into false positive cleanup", async () => {
  let closes = 0, kills = 0;
  const f = leaseFixture({ stdin: { close() { closes++; throw new Error("close failed"); } }, async kill() { kills++; } });
  const first = f.lease.release(); const firstError = assert.rejects(first, unavailable); await flush();
  assert.equal(f.lease.held, false); assert.equal(f.lease.released, false); await f.clock.tick(1000); await firstError;
  const retry = f.lease.release(); const retryError = assert.rejects(retry, unavailable); await flush();
  assert.equal(f.lease.released, false); await f.clock.tick(1000); await retryError;
  assert.equal(closes, 2); assert.equal(kills, 2); assert.equal(f.lease.exitReceipt, null);
  f.exit.resolve({ exitCode: -9 }); await flush(); await f.lease.release();
  assert.deepEqual(f.lease.exitReceipt, { exitCode: -9 }); assert.equal(f.lease.released, true);
});

test("concurrent pending releases share one attempt and receipt, never just a released flag", async () => {
  const f = leaseFixture(); const first = f.lease.release(), second = f.lease.release();
  assert.equal(first, second); await flush(); assert.equal(f.counters.closes, 1);
  await f.clock.tick(500); assert.equal(f.counters.kills, 1); assert.equal(f.lease.released, false);
  f.exit.resolve({ exitCode: 0 }); await first; await second;
  const count = f.counters.closes; await f.lease.release(); assert.equal(f.counters.closes, count);
  assert.equal(f.clock.jobs.size, 0);
});

test("rejected usability wait only invalidates held; independent owned receipt is required", async () => {
  const actual = deferred(); let closes = 0, cleanup = 0;
  const f = leaseFixture({ stdin: { async close() { closes++; } }, wait: async () => { throw new Error("proxy stopped"); },
    waitForOwnedExit: () => actual.promise, async retryOwnedCleanup() { cleanup++; } });
  await f.lease.lost; assert.equal(f.lease.held, false); assert.equal(f.lease.released, false);
  const first = f.lease.release(); const error = assert.rejects(first, unavailable); await f.clock.tick(1000); await error;
  assert.equal(closes, 1); assert.equal(cleanup, 1);
  actual.resolve({ exitCode: -9 }); await flush(); await f.lease.release();
  assert.equal(f.lease.released, true); assert.equal(f.clock.jobs.size, 0);
});

test("rejected actual wait can be retried on the same retained handle but never proves exit", async () => {
  const actual = deferred(); let waits = 0, cleanup = 0;
  const f = leaseFixture({ wait: () => (++waits < 3 ? Promise.reject(new Error("receipt unavailable")) : actual.promise),
    async kill() { cleanup++; } });
  await f.lease.lost; await assert.rejects(f.lease.release(), unavailable); await flush();
  assert.equal(f.lease.released, false);
  const retry = f.lease.release(); await flush(); actual.resolve({ exitCode: 0 }); await retry;
  assert.equal(f.lease.released, true); assert.equal(cleanup, 1); assert.equal(f.clock.jobs.size, 0);
});

test("owned wait receipt rejects malformed/non-own/accessor/array/noninteger results", async () => {
  let accessed = false;
  const accessor = {}; Object.defineProperty(accessor, "exitCode", { enumerable: true, get() { accessed = true; return 0; } });
  for (const value of [undefined, null, 0, {}, { exitCode: undefined }, { exitCode: "0" }, { exitCode: NaN }, { exitCode: 0.1 },
    { exitCode: 0, other: true }, { exitCode: 0, [Symbol("extra")]: true }, Object.defineProperty({ exitCode: 0 }, "extra", { value: true }),
    Object.assign([], { exitCode: 0 }), Object.create({ exitCode: 0 }), accessor]) {
    const f = leaseFixture({ wait: async () => value }); await f.lease.lost;
    await assert.rejects(f.lease.release(), unavailable); assert.equal(f.lease.released, false);
  }
  assert.equal(accessed, false);
});

test("actual owned exit is sufficient even when prior stdin close and kill rejected", async () => {
  const f = leaseFixture({ stdin: { async close() { throw new Error("close refused"); } }, async kill() { throw new Error("kill refused"); } });
  const pending = f.lease.release(); await flush(); f.exit.resolve({ exitCode: 17 }); await pending;
  assert.deepEqual(f.lease.exitReceipt, { exitCode: 17 }); assert(Object.isFrozen(f.lease.exitReceipt));
  assert.equal(f.clock.jobs.size, 0);
});

test("late close failure after owned receipt does not schedule new cleanup or signals", async () => {
  const close = deferred(); let cleanup = 0;
  const f = leaseFixture({ stdin: { close: () => close.promise }, async retryOwnedCleanup() { cleanup++; } });
  const released = f.lease.release(); await flush(); f.exit.resolve({ exitCode: 0 }); await released;
  close.reject(new Error("late close failure")); await flush();
  assert.equal(cleanup, 0); assert.equal(f.lease.released, true); assert.equal(f.clock.jobs.size, 0);
});

const info = (kind = "directory", inode = "1", mode = kind === "directory" ? 0o700 : 0o600) => ({ kind, uid: 501, mode, device: "7", inode });
function endpointFixture(lease) {
  const files = new Map([["/owned", info()], ["/owned/run", info("directory", "2")]]), calls = [], servers = [];
  const backend = { exactAvailable: true, uid: async () => 501,
    lstat: async path => files.get(path) ?? null, mkdir: async () => {}, acquireLock: async () => lease,
    probeUnix: async () => ({ state: "refused", rawErrno: "ECONNREFUSED" }),
    removeSocketIfMatches: async path => { calls.push("unlink"); files.delete(path); return true; } };
  const paths = new AgentUnixSocketPath(backend);
  const runtime = { paths, file: path => ({ path }), openConnection() {}, createServerSocket() {
    calls.push("server");
    const server = { initWithFilename(file) { calls.push("bind"); files.set(file.path, info("socket", "3")); },
      asyncListen(listener) { this.listener = listener; }, close() { calls.push("close"); this.listener?.onStopListening(); } };
    servers.push(server); return server;
  } };
  return { runtime, paths, calls, servers };
}

test("actual Unix cleanup and endpoint preserve unresolved helper ownership and block rebind", async () => {
  const f = leaseFixture({ stdin: { close: hang }, kill: hang });
  const n = endpointFixture(f.lease), endpoint = new AgentChannelEndpoint({ runtime: n.runtime, controller: { stop() {} } });
  assert.equal((await endpoint.start({ socketPath: "/owned/run/s" })).state, "listening");
  const stop = endpoint.stop(); const failed = assert.rejects(stop, incomplete); await flush(); await f.clock.tick(1000); await failed;
  assert.equal(endpoint.status.reason, "CLEANUP_INCOMPLETE");
  await assert.rejects(endpoint.start({ socketPath: "/owned/run/s" }), incomplete);
  assert.equal(n.calls.filter(c => c === "bind").length, 1); assert.equal(f.lease.released, false);
  const retry = endpoint.stop(); await flush(); f.exit.resolve({ exitCode: -9 }); await retry;
  assert.equal(endpoint.status.state, "disabled"); assert.equal(f.lease.released, true);
  assert.equal(f.clock.jobs.size, 0);
});

test("actual service keeps native configuration and blocks replacement until owned helper exit receipt", async () => {
  const f = leaseFixture({ stdin: { close: hang }, kill: hang }), n = endpointFixture(f.lease);
  let native = 0;
  const service = createAgentChannelService({ loadProjects: () => [], validateProject: value => value, validateStatusRecord: value => value,
    parseHookEvent: () => null, now: () => 0, randomHex: () => "0123456789abcdef", isSensitiveHost: () => false, timers: f.clock,
    createNativeConfiguration: async () => { native++; return { socketPath: "/owned/run/s", exactPosixBackend: {} }; },
    createTransportRuntime: () => n.runtime });
  await service.initialize(); await service.setEnabled(true); assert.equal(native, 1);
  const off = service.setEnabled(false); await flush(); await f.clock.tick(1000); await off;
  assert.equal(service.getEndpointState().reason, "CLEANUP_INCOMPLETE");
  const enable = service.setEnabled(true); await flush(); await f.clock.tick(1000); await enable;
  assert.equal(native, 1); assert.equal(n.calls.filter(c => c === "bind").length, 1);
  f.exit.resolve({ exitCode: 0 }); await flush(); await service.setEnabled(false);
  assert.equal(service.getEndpointState().state, "disabled"); await service.close();
  assert.equal(f.clock.jobs.size, 0);
});

function nativeFixture() {
  const clock = new Clock(), root = "/Volumes/AxioSozoBuild/workstation", profile = `${root}/p4c-test/gecko`, paths = agentSocketPaths(root);
  const make = (kind, mode, inode) => ({ kind, mode, uid: 501, nlink: kind === "directory" ? 2 : 1, size: 100, device: "7", inode });
  const files = new Map([[paths.interpreter, make("regular", 0o755, "1")], [paths.helperPath, make("regular", 0o400, "2")],
    [paths.helperDirectory, make("directory", 0o700, "3")], [profile, make("directory", 0o700, "4")]]);
  const actual = deferred(); let cleanup = 0, read = false;
  const child = { stdin: { close: hang }, stdout: { async readString() { if (read) return ""; read = true; return '{"ok":true,"result":true}\n'; }, close: hang },
    stderr: { read: hang, close: hang }, kill() { cleanup++; return hang(); }, wait: () => actual.promise };
  const runtime = { timers: clock, env: () => root, profileDirectory: () => profile, ownUid: async () => 501,
    verifyFile: async path => files.has(path), exactMetadata: async path => ({ ...files.get(path) }), sha256: async () => AGENT_SOCKET_SHA256,
    Subprocess: { async call() { return child; } } };
  return { clock, actual, runtime, paths, child, get cleanup() { return cleanup; } };
}

test("derived native proxy keeps actual exit receipt after bounded public wait rejects and retries owned cleanup", async () => {
  const f = nativeFixture();
  const config = await createNativeAgentChannelConfiguration({ runtime: f.runtime, createBackend: createAgentSocketSubprocessBackend });
  const lease = await config.exactPosixBackend.acquireLock("/owned/run/s", info());
  const first = lease.release(); const failed = assert.rejects(first, unavailable); await f.clock.tick(1000); await failed;
  assert.equal(lease.released, false); assert.equal(lease.held, false); await lease.lost;
  const before = f.cleanup; const retry = lease.release(); await flush(); await f.clock.tick(500);
  assert(f.cleanup > before); f.actual.resolve({ exitCode: -9 }); await retry; await flush();
  assert.equal(lease.released, true); assert.deepEqual(lease.exitReceipt, { exitCode: -9 });
  await f.clock.tick(500); assert.equal(f.clock.jobs.size, 0);
});

const bytesPipe = chunks => ({ read: async () => (chunks.shift() ?? new Uint8Array()).buffer,
  readString() { assert.fail("decoded read must not be used"); } });
test("raw stderr never treats nonempty incomplete UTF-8 bytes as EOF and counts the exact 512-byte cap", async () => {
  assert.equal(await readAgentPipe(bytesPipe([new Uint8Array([0xe2]), new Uint8Array([0x82, 0xac]), new Uint8Array(509)])), "");
  await assert.rejects(readAgentPipe(bytesPipe([new Uint8Array([0xe2]), new Uint8Array(512)])), unavailable);
});
test("raw metadata keeps only numeric ASCII, distinguishes true zero-byte EOF and refuses string-only adapters", async () => {
  assert.equal(await readAgentPipe(bytesPipe([new TextEncoder().encode("501"), new TextEncoder().encode("\n")]), { keep: true }), "501\n");
  await assert.rejects(readAgentPipe(bytesPipe([new Uint8Array([0xe2])]), { keep: true }), unavailable);
  await assert.rejects(readAgentPipe({ readString: async () => "" }), unavailable);
  await assert.rejects(readAgentPipe({ read: async () => null }), unavailable);
});

test("raw pipe brand check admits genuine cross-realm buffers and refuses views or spoofed buffers", async () => {
  const foreign = [runInNewContext("new Uint8Array([53, 48, 49, 10]).buffer"), runInNewContext("new ArrayBuffer(0)")];
  assert.equal(await readAgentPipe({ read: async () => foreign.shift() }, { keep: true }), "501\n");
  let accessed = false;
  const spoof = { get byteLength() { accessed = true; return 0; }, [Symbol.toStringTag]: "ArrayBuffer" };
  for (const value of [new Uint8Array(0), new DataView(new ArrayBuffer(0)), spoof]) {
    await assert.rejects(readAgentPipe({ read: async () => value }), unavailable);
  }
  assert.equal(accessed, false);
});

async function withNativeRawFixture({ stderrChunks, stdoutOverride, hanging = false } = {}, callback) {
  const f = nativeFixture(), calls = [], children = [];
  const files = new Map([
    [f.paths.interpreter, { kind: "regular", uid: 501, nlink: 1, mode: 0o755, size: 100, device: "7", inode: "1" }],
    [f.paths.helperPath, { kind: "regular", uid: 501, nlink: 1, mode: 0o400, size: 100, device: "7", inode: "2" }],
    [f.paths.helperDirectory, { kind: "directory", uid: 501, nlink: 2, mode: 0o700, size: 100, device: "7", inode: "3" }],
    ["/Volumes/AxioSozoBuild/workstation/p4c-test/gecko", { kind: "directory", uid: 501, nlink: 2, mode: 0o700, size: 100, device: "7", inode: "4" }],
    ["/usr/bin/id", { kind: "regular", uid: 0, nlink: 2, mode: 0o755 }],
    ["/usr/bin/stat", { kind: "regular", uid: 0, nlink: 2, mode: 0o755 }],
  ]);
  const Subprocess = { async call(options) {
    calls.push(options); assert.equal(options.environmentAppend, false); assert.equal(options.stderr, "pipe");
    assert.equal(options.workdir, "/"); assert.deepEqual(options.environment, { LANG: "C", LC_ALL: "C" });
    let output;
    if (options.command === "/usr/bin/id") { assert.deepEqual(options.arguments, ["-u"]); output = "501\n"; }
    else {
      assert.equal(options.command, "/usr/bin/stat");
      const [flag, format, separator, path] = options.arguments;
      assert.deepEqual([flag, format, separator], ["-f", "%u:%l:%p:%z:%d:%i", "--"]);
      const value = files.get(path); assert(value);
      const mode = value.mode | (value.kind === "regular" ? 0o100000 : 0o40000);
      output = `${value.uid}:${value.nlink}:${mode.toString(8)}:${value.size}:${value.device}:${value.inode}\n`;
    }
    const child = { closed: [], kills: 0, waits: 0 };
    const pipe = (name, chunks) => ({ read: hanging ? hang : bytesPipe(chunks).read,
      readString() { assert.fail("native metadata must use raw reads"); },
      close(force) { child.closed.push([name, force]); return hanging ? hang() : Promise.resolve(); } });
    child.stdin = { close(force) { child.closed.push(["stdin", force]); return hanging ? hang() : Promise.resolve(); } };
    child.stdout = pipe("stdout", stdoutOverride ? stdoutOverride(output) : [...output].map(char => new Uint8Array([char.charCodeAt(0)])));
    child.stderr = pipe("stderr", stderrChunks ? stderrChunks() : []);
    child.kill = signal => { assert.equal(signal, 0); child.kills++; return hanging ? hang() : Promise.resolve(); };
    child.wait = () => { child.waits++; return hanging ? hang() : Promise.resolve({ exitCode: 0 }); };
    children.push(child); return child;
  } };
  const names = ["ChromeUtils", "Services", "Cc", "Ci", "IOUtils"];
  const saved = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  try {
    globalThis.ChromeUtils = { importESModule(spec) {
      if (spec === "resource://gre/modules/Subprocess.sys.mjs") return { Subprocess };
      if (spec === "resource://gre/modules/Timer.sys.mjs") return f.clock;
      assert.fail(`Unexpected native import ${spec}`);
    } };
    globalThis.Services = { env: { get(name) { assert.equal(name, "AXIOSOZO_STATIC_READER_ROOT"); return "/Volumes/AxioSozoBuild/workstation"; } },
      dirsvc: { get(name) { assert.equal(name, "ProfD"); return { path: "/Volumes/AxioSozoBuild/workstation/p4c-test/gecko" }; } } };
    globalThis.Ci = { nsIFile: Symbol("nsIFile") };
    globalThis.Cc = { "@mozilla.org/file/local;1": { createInstance() {
      let path;
      return { initWithPath(value) { path = value; }, exists: () => files.has(path), isSymlink: () => false,
        isFile: () => files.get(path)?.kind === "regular", isDirectory: () => files.get(path)?.kind === "directory",
        normalize() {}, get path() { return path; }, isReadable: () => true,
        isExecutable: () => !!(files.get(path)?.mode & 0o111), get permissions() { return files.get(path)?.mode; } };
    } } };
    globalThis.IOUtils = { async computeHexDigest(path, algorithm) {
      assert.equal(path, f.paths.helperPath); assert.equal(algorithm, "sha256"); return AGENT_SOCKET_SHA256;
    } };
    await callback({ clock: f.clock, calls, children });
  } finally {
    for (const name of names) {
      if (saved.get(name)) Object.defineProperty(globalThis, name, saved.get(name)); else delete globalThis[name];
    }
  }
}

test("API-shaped native metadata counts partial UTF-8 stderr through raw EOF and never executes a helper", async () => {
  await withNativeRawFixture({ stderrChunks: () => [new Uint8Array([0xe2]), new Uint8Array([0x82, 0xac]), new Uint8Array(509)] }, async f => {
    const config = await createNativeAgentChannelConfiguration({ createBackend: () => ({ exactAvailable: true }) });
    assert.equal(config.socketPath, "/Volumes/AxioSozoBuild/workstation/p4c-test/gecko/.a/s");
    assert.equal(f.calls.length, 9); assert.equal(f.calls.filter(c => c.command === "/usr/bin/id").length, 1);
    assert.equal(f.calls.filter(c => c.command === "/usr/bin/stat").length, 8);
    assert(f.children.every(child => child.kills === 0 && child.waits === 2 && child.closed.length === 4));
    assert.equal(f.clock.jobs.size, 0);
  });
});

test("API-shaped native metadata refuses 513 raw stderr bytes despite empty decoded prefix and cleans owned child", async () => {
  await withNativeRawFixture({ stderrChunks: () => [new Uint8Array([0xe2]), new Uint8Array(512)] }, async f => {
    await assert.rejects(createNativeAgentChannelConfiguration({ createBackend: () => assert.fail("must not configure") }), unavailable);
    assert.equal(f.calls.length, 1); assert.equal(f.children[0].kills, 1); assert.equal(f.children[0].waits, 1);
    assert.equal(f.children[0].closed.filter(([, force]) => force === true).length, 3);
    assert.equal(f.clock.jobs.size, 0);
  });
});

test("API-shaped native numeric stdout refuses non-ASCII raw prefix and cleans owned child", async () => {
  await withNativeRawFixture({ stdoutOverride: () => [new Uint8Array([0xe2]), new TextEncoder().encode("501\n")] }, async f => {
    await assert.rejects(createNativeAgentChannelConfiguration({ createBackend: () => assert.fail("must not configure") }), unavailable);
    assert.equal(f.calls.length, 1); assert.equal(f.children[0].kills, 1); assert.equal(f.children[0].waits, 1);
    assert.equal(f.clock.jobs.size, 0);
  });
});

test("API-shaped raw metadata watchdog bounds owned cleanup even when every native operation hangs", async () => {
  await withNativeRawFixture({ hanging: true }, async f => {
    const pending = createNativeAgentChannelConfiguration({ createBackend: () => assert.fail("must not configure") });
    const failure = assert.rejects(pending, unavailable); await flush(); await f.clock.tick(1000);
    assert.equal(f.children[0].kills, 1); assert.equal(f.children[0].waits, 1);
    assert.equal(f.children[0].closed.filter(([, force]) => force === true).length, 3);
    await f.clock.tick(500); await failure; assert.equal(f.clock.jobs.size, 0);
  });
});
