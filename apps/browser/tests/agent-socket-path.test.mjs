import test from "node:test";
import assert from "node:assert/strict";
import { AgentUnixSocketPath, validateAgentSocketPath } from "../chrome/AgentUnixSocketPath.sys.mjs";
import { AgentChannelEndpoint, createGeckoAgentTransportRuntime } from "../chrome/AgentChannelTransport.sys.mjs";
import { AgentChannelController } from "../chrome/AgentChannelCore.sys.mjs";
import { parseHookEvent } from "../../../packages/contexts/src/agent-status.mjs";
import { createAgentSocketSubprocessBackend } from "../chrome/AgentSocketSubprocess.sys.mjs";

const identity = (kind, inode, uid = 501, mode = kind === "directory" ? 0o700 : 0o600) => ({ kind, uid, mode, device: "7", inode });
function fakeFiles(changes = {}) {
  const files = new Map([["/owned", identity("directory", "1")], ["/owned/run", identity("directory", "2")]]);
  const calls = [];
  let sequence = 10, held = false;
  const backend = {
    exactAvailable: true, uid: async () => 501,
    lstat: async path => { calls.push(["lstat", path]); return files.has(path) ? { ...files.get(path) } : null; },
    mkdir: async (path, mode) => { calls.push(["mkdir", path, mode]); files.set(path, identity("directory", String(++sequence), 501, mode)); },
    probeUnix: async path => { calls.push(["probe", path]); return { state: "refused", rawErrno: "ECONNREFUSED" }; },
    removeSocketIfMatches: async (path, expected, parent) => {
      calls.push(["remove", path, expected, parent]);
      const current = files.get(path);
      if (!current || current.kind !== "socket" || current.inode !== expected.inode || current.uid !== expected.uid) return false;
      files.delete(path); return true;
    },
    acquireLock: async path => {
      calls.push(["lock", path]);
      if (held) throw Object.assign(new Error(), { code: "SOCKET_IN_USE" });
      held = true;
      let released = false;
      return { get held() { return held && !released; }, lost: new Promise(() => {}), release: async () => {
        if (!released) calls.push(["release-lock", path]); held = false; released = true;
      } };
    },
    ...changes,
  };
  return { backend, files, calls, paths: new AgentUnixSocketPath(backend) };
}
test("default and incomplete metadata backends are unavailable before mutation", async () => {
  await assert.rejects(() => new AgentUnixSocketPath().prepare("/owned/run/agent.sock"), { code: "EXACT_SOCKET_METADATA_UNAVAILABLE" });
  const f = fakeFiles({ exactAvailable: false });
  await assert.rejects(() => f.paths.prepare("/owned/run/agent.sock"), { code: "EXACT_SOCKET_METADATA_UNAVAILABLE" });
  assert.deepEqual(f.calls, []);
});
test("path validation counts UTF-8 bytes and rejects ambiguous absolute paths", () => {
  assert.equal(validateAgentSocketPath("/owned/run/agent.sock"), "/owned/run/agent.sock");
  for (const path of ["relative", "/owned/../agent.sock", "/owned//agent.sock", "/owned/", "/owned/\0a", `/${"🐙".repeat(25)}`])
    assert.throws(() => validateAgentSocketPath(path), { code: "INVALID_SOCKET_PATH" });
});
test("missing directories are individually created 0700 and bound socket is verified 0600", async () => {
  const f = fakeFiles(); f.files.delete("/owned/run");
  const claim = await f.paths.prepare("/owned/run/agent.sock");
  assert.deepEqual(f.calls.find(call => call[0] === "mkdir"), ["mkdir", "/owned/run", 0o700]);
  f.files.set(claim.path, identity("socket", "20"));
  const bound = await f.paths.verifyBound(claim); assert.equal(bound.socket.mode, 0o600);
  assert.equal(await f.paths.cleanup(bound), true); assert.equal(f.files.has(claim.path), false);
});
test("symlink/foreign/permissive parents and writable unstuck ancestors are refused", async () => {
  for (const [path, value] of [
    ["/owned/run", identity("symlink", "2")], ["/owned/run", identity("directory", "2", 502)],
    ["/owned/run", identity("directory", "2", 501, 0o755)], ["/owned", identity("directory", "1", 501, 0o777)],
    ["/owned", identity("directory", "1", 502, 0o755)],
  ]) {
    const f = fakeFiles(); f.files.set(path, value);
    await assert.rejects(() => f.paths.prepare("/owned/run/agent.sock"), { code: "SOCKET_PATH_BLOCKED" });
    assert.equal(f.calls.some(call => call[0] === "remove"), false);
  }
});
test("non-sockets, foreign sockets and permissive sockets are never probed or removed", async () => {
  for (const value of [identity("regular", "3"), identity("symlink", "3"), identity("other", "3"),
    identity("socket", "3", 502), identity("socket", "3", 501, 0o666)]) {
    const f = fakeFiles(); f.files.set("/owned/run/agent.sock", value);
    await assert.rejects(() => f.paths.prepare("/owned/run/agent.sock"), { code: "SOCKET_PATH_BLOCKED" });
    assert.equal(f.calls.some(call => ["probe", "remove"].includes(call[0])), false);
    assert.deepEqual(f.files.get("/owned/run/agent.sock"), value);
  }
});
test("live or ambiguous/EACCES Unix probe preserves existing socket", async () => {
  for (const [probe, code] of [[{ state: "live" }, "SOCKET_IN_USE"], [{ state: "refused" }, "SOCKET_PATH_BLOCKED"],
    [{ state: "refused", rawErrno: "EACCES" }, "SOCKET_PATH_BLOCKED"], [{ state: "unknown", rawErrno: "ENOENT" }, "SOCKET_PATH_BLOCKED"]]) {
    const f = fakeFiles({ probeUnix: async () => probe }); f.files.set("/owned/run/agent.sock", identity("socket", "3"));
    await assert.rejects(() => f.paths.prepare("/owned/run/agent.sock"), { code });
    assert.equal(f.calls.some(call => call[0] === "remove"), false); assert.equal(f.files.has("/owned/run/agent.sock"), true);
  }
});
test("only raw refused, same-owner/type/inode stale socket is removed", async () => {
  const f = fakeFiles(); f.files.set("/owned/run/agent.sock", identity("socket", "3"));
  await f.paths.prepare("/owned/run/agent.sock"); assert.equal(f.calls.filter(call => call[0] === "remove").length, 1);
  assert.equal(f.files.has("/owned/run/agent.sock"), false);
});
test("changed socket inode or parent after stale probe blocks removal", async () => {
  for (const change of ["socket", "parent", "parent-mode"]) {
    const f = fakeFiles({ probeUnix: async () => {
      if (change === "socket") f.files.set("/owned/run/agent.sock", identity("socket", "new"));
      if (change === "parent") f.files.set("/owned/run", identity("directory", "new"));
      if (change === "parent-mode") f.files.get("/owned/run").mode = 0o755;
      return { state: "refused", rawErrno: "ECONNREFUSED" };
    } });
    f.files.set("/owned/run/agent.sock", identity("socket", "3"));
    await assert.rejects(() => f.paths.prepare("/owned/run/agent.sock"), { code: "SOCKET_PATH_BLOCKED" });
    assert.equal(f.calls.some(call => call[0] === "remove"), false);
  }
});
test("lifetime lock excludes another product startup before any probe/bind and releases on failure", async () => {
  const f = fakeFiles(), claim = await f.paths.prepare("/owned/run/agent.sock");
  await assert.rejects(() => f.paths.prepare("/owned/run/agent.sock"), { code: "SOCKET_IN_USE" });
  assert.equal(f.calls.some(call => call[0] === "probe"), false);
  await f.paths.cleanup(claim); assert.equal(claim.lock.held, false);
  f.files.set("/owned/run/agent.sock", identity("regular", "3"));
  await assert.rejects(() => f.paths.prepare("/owned/run/agent.sock"), { code: "SOCKET_PATH_BLOCKED" });
  assert.equal(f.calls.filter(call => call[0] === "release-lock").length, 2);
});
test("cleanup preserves replacements and verifyBound rejects wrong owner/mode/type", async () => {
  const f = fakeFiles(), claim = await f.paths.prepare("/owned/run/agent.sock");
  for (const value of [identity("regular", "3"), identity("socket", "3", 502), identity("socket", "3", 501, 0o666)]) {
    f.files.set(claim.path, value); await assert.rejects(() => f.paths.verifyBound(claim), { code: "SOCKET_PATH_BLOCKED" });
  }
  f.files.set(claim.path, identity("socket", "3")); const bound = await f.paths.verifyBound(claim);
  f.files.set(claim.path, identity("regular", "new")); assert.equal(await f.paths.cleanup(bound), false);
  assert.equal(f.files.get(claim.path).kind, "regular");
});
function fakeEndpoint(paths) {
  const calls = [], controller = { stop: () => calls.push(["stop-controller"]) };
  const server = {
    initWithFilename(file, mode, backlog) { calls.push(["initWithFilename", file.path, mode, backlog]); paths.files.set(file.path, identity("socket", "40")); },
    asyncListen(listener) { calls.push(["listen"]); server.listener = listener; },
    close() { calls.push(["close"]); server.listener?.onStopListening(); },
  };
  const runtime = { paths: paths.paths, file: path => ({ path }), createServerSocket: () => server,
    openConnection: socket => calls.push(["connection", socket]) };
  return { calls, server, endpoint: new AgentChannelEndpoint({ runtime, controller }) };
}
test("endpoint binds only Unix filename and verifies permission before accepting; disabled kills listener", async () => {
  const f = fakeFiles(), n = fakeEndpoint(f);
  assert.equal((await n.endpoint.start({ socketPath: "/owned/run/agent.sock" })).state, "listening");
  assert.deepEqual(n.calls[0], ["initWithFilename", "/owned/run/agent.sock", 0o600, 8]);
  n.server.listener.onSocketAccepted(n.server, "fake-peer"); assert.deepEqual(n.calls.at(-1), ["connection", "fake-peer"]);
  await n.endpoint.start({ enabled: false }); assert.equal(n.endpoint.status.state, "disabled");
  assert.equal(f.files.has("/owned/run/agent.sock"), false);
});
test("endpoint missing exact metadata and live-instance states never create a listener", async () => {
  const f = fakeFiles({ exactAvailable: false }), n = fakeEndpoint(f);
  assert.equal((await n.endpoint.start({ socketPath: "/owned/run/agent.sock" })).reason, "EXACT_SOCKET_METADATA_UNAVAILABLE");
  assert.deepEqual(n.calls, []);
  const live = fakeFiles({ probeUnix: async () => ({ state: "live" }) }); live.files.set("/owned/run/agent.sock", identity("socket", "30"));
  const l = fakeEndpoint(live); assert.equal((await l.endpoint.start({ socketPath: "/owned/run/agent.sock" })).state, "in_use");
  assert.deepEqual(l.calls, []);
});
test("stop during async bind verification closes/removes only owned bound socket and never listens", async () => {
  const f = fakeFiles(), n = fakeEndpoint(f); const actual = f.paths.verifyBound.bind(f.paths);
  let release; f.paths.verifyBound = async claim => { await new Promise(resolve => { release = resolve; }); return actual(claim); };
  const starting = n.endpoint.start({ socketPath: "/owned/run/agent.sock" });
  for (let i = 0; i < 15 && !release; i++) await Promise.resolve();
  assert.equal(typeof release, "function"); const stopping = n.endpoint.stop(); release(); await stopping; await starting;
  assert.equal(n.calls.some(call => call[0] === "listen"), false); assert.equal(f.files.has("/owned/run/agent.sock"), false);
});
function fakeSubprocess(output = { ok: true, result: 501 }, options = {}) {
  const calls = [], killed = [];
  const Subprocess = { async call(request) {
    calls.push(request); let read = false;
    return { stdin: { close: async () => {} }, stdout: { readString: async () => {
      if (options.hang) return new Promise(() => {});
      if (read) return ""; read = true;
      return typeof output === "string" ? output : JSON.stringify(output);
    } }, wait: async () => ({ exitCode: options.exit ?? 0 }), kill: async flag => { killed.push(flag); } };
  } };
  const timers = { setTimeout, clearTimeout };
  return { calls, killed, backend: createAgentSocketSubprocessBackend({ configuredTrusted: true,
    interpreter: "/trusted/python3", helperPath: "/trusted/agent_socket.py", Subprocess, timers, timeoutMs: 30 }), Subprocess, timers };
}
test("POSIX subprocess backend uses fixed argv, isolated Python, no inherited credentials and trusted paths", async () => {
  const f = fakeSubprocess(); assert.equal(await f.backend.uid(), 501);
  assert.deepEqual(f.calls[0].arguments, ["-I", "-S", "-B", "/trusted/agent_socket.py", "uid", "{}"]);
  assert.equal(f.calls[0].command, "/trusted/python3"); assert.equal(f.calls[0].environmentAppend, false);
  assert.equal(f.calls[0].workdir, "/"); assert.equal(Object.hasOwn(f.calls[0].environment, "HOME"), false);
  assert.equal(createAgentSocketSubprocessBackend({ interpreter: "/trusted/python3", helperPath: "/trusted/agent_socket.py", Subprocess: f.Subprocess, timers: f.timers }), null);
  await f.backend.lstat("/owned/run/agent.sock");
  assert.deepEqual(f.calls.at(-1).arguments.slice(-2), ["lstat", '{"path":"/owned/run/agent.sock"}']);
});
test("POSIX subprocess backend caps output, time and helper failure without accepting ambiguous metadata", async () => {
  for (const [output, options] of [["x".repeat(16385), {}], ["invalid", {}], [{ ok: false, error: "EACCES" }, {}],
    [{ ok: true, result: 501 }, { exit: 1 }], [{ ok: true, result: 501 }, { hang: true }]]) {
    const f = fakeSubprocess(output, options);
    await assert.rejects(() => f.backend.uid(), { code: "EXACT_SOCKET_METADATA_UNAVAILABLE" });
    if (options.hang || typeof output === "string" && output.length > 16384) assert.deepEqual(f.killed, [0]);
  }
});
test("persistent POSIX lock helper keeps stdin open until release and reports lock contention", async () => {
  let finish, closed = false;
  const exited = new Promise(resolve => { finish = resolve; });
  const calls = [], Subprocess = { call: async options => {
    calls.push(options);
    return { stdout: { readString: async () => '{"ok":true,"result":true}\n' },
      stdin: { close: async () => { closed = true; finish({ exitCode: 0 }); } }, wait: () => exited, kill: async () => finish({ exitCode: 1 }) };
  } };
  const backend = createAgentSocketSubprocessBackend({ configuredTrusted: true, interpreter: "/trusted/python3", helperPath: "/trusted/helper.py",
    Subprocess, timers: { setTimeout, clearTimeout } });
  const lock = await backend.acquireLock("/owned/run/agent.sock", identity("directory", "2"));
  assert.equal(lock.held, true); assert.equal(closed, false); assert.equal(calls[0].arguments[4], "lock");
  await lock.release(); assert.equal(closed, true); assert.equal(lock.held, false); await lock.release();
  const denied = fakeSubprocess('{"ok":false,"error":"SOCKET_IN_USE"}\n');
  await assert.rejects(() => denied.backend.acquireLock("/owned/run/agent.sock", identity("directory", "2")), { code: "SOCKET_IN_USE" });
});
test("Gecko factory uses real API-shaped fakes, drains nc data at stop, and closes transports with a reason", async () => {
  const prior = Object.fromEntries(["Components", "ChromeUtils", "Services"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const pumps = [], writes = [], closed = [], statuses = [];
  const components = {
    classes: {
      "@mozilla.org/network/input-stream-pump;1": { createInstance: () => {
        const pump = { init(...args) { pump.arguments = args; }, asyncRead(listener) { pump.listener = listener; }, cancel() {} };
        pumps.push(pump); return pump;
      } },
      "@mozilla.org/binaryinputstream;1": { createInstance: () => ({ setInputStream(stream) { this.stream = stream; },
        readByteArray(size) { const result = this.stream.bytes.slice(0, size); this.stream.bytes = this.stream.bytes.slice(size); return result; } }) },
      "@mozilla.org/network/server-socket;1": { createInstance: () => ({ onlyUnix: true }) },
    }, interfaces: { nsITransport: { OPEN_UNBUFFERED: 2 } }, results: { NS_BINDING_ABORTED: 0x804b0002, NS_BASE_STREAM_WOULD_BLOCK: 0x80470007 },
  };
  const output = { QueryInterface() { return output; }, write(binary, count) { writes.push(binary); return count; }, close() {} };
  const socket = { openInputStream: () => ({ close() {} }), openOutputStream: flags => { assert.equal(flags, 2); return output; },
    close(reason) { assert.equal(reason, 0x804b0002); closed.push(reason); } };
  globalThis.Components = components;
  globalThis.Services = { tm: { currentThread: "fake-main-thread" } };
  globalThis.ChromeUtils = { generateQI: () => function () { return this; }, importESModule: () => { throw new Error("Unexpected Services import"); } };
  let next = 0;
  const controller = new AgentChannelController({ now: () => 1000000, setTimeout, clearTimeout,
    randomHex: () => (++next).toString(16).padStart(16, "0"), getProjects: () => [{ id: "p_fixture", root: "/synthetic/project" }],
    parseHookEvent, onStatus: record => statuses.push(record) });
  try {
    const runtime = createGeckoAgentTransportRuntime(); assert.equal(runtime.createServerSocket().onlyUnix, true);
    runtime.openConnection(socket, controller);
    assert.deepEqual(pumps[0].arguments.slice(1), [0, 0, false]);
    const hello = { v: 1, type: "hello", client: { name: "axiosozo-notify", agent: "other", version: "1" }, cwd: "/synthetic/project", pid: 123 };
    const hook = { v: 1, type: "hook", source: "manual", event: "done", cwd: "/synthetic/project", payload: { title: "Fixture 🐙" } };
    const stream = { bytes: [...new TextEncoder().encode(`${JSON.stringify(hello)}\n${JSON.stringify(hook)}\n`)] };
    pumps[0].listener.onDataAvailable(null, stream, 0, stream.bytes.length);
    pumps[0].listener.onStopRequest(null, components.results.NS_BINDING_ABORTED);
    for (let i = 0; i < 20; i++) await Promise.resolve();
    assert.equal(statuses.length, 1); assert.equal(statuses[0].title, "Fixture 🐙");
    assert.equal(writes.map(binary => JSON.parse(binary).type).join(","), "welcome,ack");
    assert.deepEqual(closed, [0x804b0002]);
  } finally {
    controller.stop();
    for (const [key, descriptor] of Object.entries(prior)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});
