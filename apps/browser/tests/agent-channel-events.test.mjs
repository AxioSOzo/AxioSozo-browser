import test from "node:test";
import assert from "node:assert/strict";
import {
  AgentChannelController, CHANNEL_LIMITS, CHANNEL_SESSION_REASONS,
} from "../chrome/AgentChannelCore.sys.mjs";
import {
  AgentChannelEndpoint, CHANNEL_ENDPOINT_REASONS,
} from "../chrome/AgentChannelTransport.sys.mjs";

const encode = value => new TextEncoder().encode(`${JSON.stringify(value)}\n`);
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
class Clock {
  at = 1000000;
  next = 0;
  timers = new Map();
  now = () => this.at;
  setTimeout = (fn, wait) => {
    const id = ++this.next;
    this.timers.set(id, { at: this.at + wait, fn });
    return id;
  };
  clearTimeout = id => this.timers.delete(id);
  async tick(ms) {
    const end = this.at + ms;
    for (;;) {
      const next = [...this.timers].filter(([, timer]) => timer.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.at = next[1].at;
      this.timers.delete(next[0]);
      next[1].fn();
      await flush();
    }
    this.at = end;
    await flush();
  }
}
const hello = (name = "agent-bridge") => ({ v: 1, type: "hello",
  client: { name, agent: "claude-code", version: "1" }, cwd: "/synthetic/harbor", pid: 123 });
const hook = { v: 1, type: "hook", source: "manual", event: "done", cwd: "/synthetic/harbor", payload: {} };
function fixture(overrides = {}) {
  const clock = new Clock(), events = [], approvals = [], effects = [], statuses = [], closed = [];
  const projects = [{ id: "p_harbor", root: "/synthetic/harbor", manifest: { name: "Harbor", environments: [] },
    accounts: [{ label: "PRIVATE_PROFILE_LABEL" }] }];
  let sequence = 0;
  const runtime = {
    now: clock.now, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    randomHex: () => (++sequence).toString(16).padStart(16, "0"), getProjects: () => projects,
    parseHookEvent: () => ({ project_path: "/synthetic/harbor", state: "done", at: clock.at }),
    onStateChange: event => events.push(event), onStatus: record => statuses.push(record),
    requestApproval: (session, options) => {
      const pending = deferred();
      approvals.push({ session, options, ...pending });
      return pending.promise;
    },
    listTabs: () => [], isSensitiveHost: () => false,
    executeMethod: (_method, _params, _session, options) => {
      effects.push(options);
      return { tab_id: "t_2" };
    },
    onSessionClosed: (view, reason) => closed.push({ view, reason }),
    ...overrides,
  };
  const controller = new AgentChannelController(runtime);
  const connect = () => {
    const messages = [], closes = [];
    const connection = controller.accept({
      write: bytes => messages.push(JSON.parse(new TextDecoder().decode(bytes))),
      close: reason => closes.push(reason),
    });
    return connection ? { ...connection, messages, closes } : { messages, closes };
  };
  return { controller, runtime, clock, events, approvals, effects, statuses, closed, connect };
}
function assertFrozen(value) {
  if (value && typeof value === "object") {
    assert.equal(Object.isFrozen(value), true);
    for (const child of Object.values(value)) assertFrozen(child);
  }
}
async function approve(f) {
  const c = f.connect();
  c.receive(encode(hello()));
  f.approvals.at(-1).resolve(true);
  await flush();
  return c;
}
function endpointFixture({ controller = { stop() {} }, onStateChange, ...options } = {}) {
  const events = [], calls = [], servers = [], claims = [];
  let next = 0;
  const runtime = {
    file: path => ({ path }), openConnection: (socket, actual) => calls.push(["open", socket, actual]),
    paths: {
      async prepare(path) {
        calls.push(["prepare", path]);
        if (options.prepare) return options.prepare(path);
        const loss = deferred(), claim = { id: ++next, path, lock: { lost: loss.promise }, loss };
        claims.push(claim);
        return claim;
      },
      async verifyBound(claim) {
        calls.push(["verify", claim.id]);
        if (options.verifyBound) return options.verifyBound(claim);
        return claim;
      },
      async cleanup(claim) {
        calls.push(["cleanup", claim.id]);
        if (options.cleanup) return options.cleanup(claim);
      },
    },
    createServerSocket() {
      const server = {
        initWithFilename(file, mode, backlog) { calls.push(["bind", file.path, mode, backlog]); },
        asyncListen(listener) {
          server.listener = listener;
          calls.push(["listen"]);
          if (options.listen) options.listen(server);
        },
        close() { calls.push(["close", servers.indexOf(server)]); server.listener?.onStopListening(); },
      };
      servers.push(server);
      return server;
    },
  };
  const endpoint = new AgentChannelEndpoint({ runtime, controller,
    onStateChange: event => { events.push(event); return onStateChange?.(event); } });
  return { endpoint, runtime, events, calls, servers, claims };
}
const states = events => events.map(event => event.state);

test("controller publishes immutable hello/pending/approved/closed membership without profile data", async () => {
  const f = fixture(), c = f.connect();
  const initial = f.events[0];
  assert.equal(initial.kind, "session");
  assert.deepEqual(states(f.events), ["hello"]);
  assert.equal(initial.sessions.length, 1);
  c.receive(encode(hello()));
  assert.deepEqual(states(f.events), ["hello", "pending"]);
  f.approvals[0].resolve(true);
  await flush();
  assert.deepEqual(states(f.events), ["hello", "pending", "approved"]);
  c.receive(encode({ v: 1, id: 1, method: "tabs.list", params: {} }));
  await flush();
  assert.deepEqual(c.messages.at(-1), { v: 1, id: 1, result: [] });
  assert.equal(f.controller.revoke(c.session), true);
  assert.equal(f.events.at(-1).reason, CHANNEL_SESSION_REASONS.REVOKED);
  assert.deepEqual(f.events.at(-1).sessions, []);
  assert.equal(f.closed[0].reason, "NOT_APPROVED");
  assert.deepEqual(Object.keys(f.closed[0].view).sort(), ["client", "project_id", "session", "state"]);
  assert.equal(initial.sessions[0].state, "hello");
  assert.equal(f.events[1].sessions[0].state, "pending");
  for (const event of f.events) assertFrozen(event);
  assertFrozen(f.controller.sessions);
  assert.throws(() => initial.sessions.push({}), TypeError);
  assert.throws(() => f.events[1].client.agent = "other", TypeError);
  assert.equal(/PRIVATE_PROFILE_LABEL|cwd|pid|synthetic/.test(JSON.stringify(f.events)), false);
});

test("controller denial and approval expiry have different fixed reasons and suppress late grants", async () => {
  for (const mode of ["deny", "expiry"]) {
    const f = fixture(), c = f.connect();
    c.receive(encode(hello()));
    if (mode === "deny") { f.approvals[0].resolve(false); await flush(); }
    else await f.clock.tick(CHANNEL_LIMITS.approvalMs);
    assert.equal(f.events.at(-1).state, "denied");
    assert.equal(f.events.at(-1).reason, mode === "deny" ? "DENIED" : "TIMEOUT");
    assert.equal(f.approvals[0].options.signal.aborted, true);
    const eventCount = f.events.length;
    f.approvals[0].resolve(true);
    await flush();
    assert.equal(f.events.length, eventCount);
    c.receive(encode({ v: 1, id: 1, method: "tabs.open", params: { url: "http://localhost/" } }));
    await flush();
    assert.equal(c.messages.at(-1).error.code, "NOT_APPROVED");
    assert.equal(f.effects.length, 0);
    f.controller.stop();
  }
});

test("controller hook/reporting events drain complete report and ack before EOF closure", async () => {
  const status = deferred(), f = fixture({ onStatus: record => { f.statuses.push(record); return status.promise; } });
  const c = f.connect();
  c.receive(new Uint8Array([...encode(hello("axiosozo-notify")), ...encode(hook)]));
  const ended = c.end();
  await flush();
  assert.deepEqual(states(f.events), ["hello", "hook", "reporting"]);
  assert.equal(f.statuses.length, 1);
  assert.equal(c.closes.length, 0);
  status.resolve();
  await ended;
  assert.deepEqual(c.messages.map(message => message.type), ["welcome", "ack"]);
  assert.equal(c.messages.at(-1).matched, true);
  assert.equal(f.events.at(-1).state, "closed");
  assert.equal(f.events.at(-1).reason, "REPORT_COMPLETE");
  assert.equal(f.events.at(-1).sessions.length, 0);
  assert.deepEqual(c.closes, ["UNAVAILABLE"]);
});

test("controller EOF, disconnect, malformed input and idle expiry produce closed snapshots", async () => {
  for (const [mode, reason, wire] of [
    ["eof", "READ_EOF", "UNAVAILABLE"], ["disconnect", "DISCONNECTED", "UNAVAILABLE"],
    ["malformed", "INVALID_PARAMS", "INVALID_PARAMS"], ["idle", "TIMEOUT", "TIMEOUT"],
  ]) {
    const f = fixture(), c = f.connect();
    if (mode === "eof") await c.end();
    if (mode === "disconnect") c.disconnect();
    if (mode === "malformed") c.receive(new TextEncoder().encode("{invalid}\n"));
    if (mode === "idle") await f.clock.tick(CHANNEL_LIMITS.idleMs);
    assert.equal(f.events.at(-1).state, "closed");
    assert.equal(f.events.at(-1).reason, reason);
    assert.equal(f.events.at(-1).sessions.length, 0);
    assert.deepEqual(c.closes, [wire]);
  }
});

test("controller pending and reporting observer revocation prevents subsequent approval/status effects", async () => {
  for (const target of ["pending", "reporting"]) {
    const f = fixture({ onStateChange: event => {
      f.events.push(event);
      if (event.state === target) f.controller.revoke(event.session);
    } });
    const c = f.connect();
    c.receive(encode(hello(target === "pending" ? "agent-bridge" : "axiosozo-notify")));
    if (target === "reporting") c.receive(encode(hook));
    await flush();
    assert.equal(f.events.at(-1).state, "closed");
    assert.equal(f.events.at(-1).reason, "REVOKED");
    assert.equal(f.approvals.length, 0);
    assert.equal(f.statuses.length, 0);
    assert.equal(f.effects.length, 0);
  }
});

test("controller approved observer revocation prevents approval grant or tab effects", async () => {
  const f = fixture({ onStateChange: event => {
    f.events.push(event);
    if (event.state === "approved") f.controller.revoke(event.session);
  } });
  const c = f.connect();
  c.receive(encode(hello()));
  f.approvals[0].resolve(true);
  await flush();
  c.receive(encode({ v: 1, id: 1, method: "tabs.open", params: { url: "http://localhost/" } }));
  await flush();
  assert.deepEqual(states(f.events), ["hello", "pending", "approved", "closed"]);
  assert.equal(c.messages.some(message => message.type === "approval" && message.granted), false);
  assert.equal(f.effects.length, 0);
});

test("controller stop snapshots every removal and rejects callback-created replacement sessions", () => {
  const attempts = [];
  const f = fixture({ onStateChange: event => {
    f.events.push(event);
    if (event.state === "closed") {
      attempts.push(f.connect());
      f.controller.stop();
    }
  } });
  f.connect(); f.connect();
  f.controller.stop();
  assert.deepEqual(f.events.filter(event => event.state === "closed").map(event => event.sessions.length), [1, 0]);
  assert.equal(f.events.filter(event => event.reason === "STOPPED").length, 2);
  assert.equal(f.controller.sessions.length, 0);
  assert.deepEqual(attempts.map(attempt => attempt.closes), [["UNAVAILABLE"], ["UNAVAILABLE"]]);
  assert.equal(f.clock.timers.size, 0);
});

test("controller observer exceptions, rejecting promises and hostile thenables cannot alter lifecycle", async () => {
  for (const failure of [
    () => { throw new Error("observer"); },
    () => Promise.reject(new Error("observer")),
    () => ({ get then() { throw new Error("observer"); } }),
    () => new Promise(() => {}),
  ]) {
    const f = fixture({ onStateChange: failure }), c = await approve(f);
    assert.equal(f.controller.sessions[0].state, "approved");
    c.receive(encode({ v: 1, id: 1, method: "tabs.list", params: {} }));
    await flush();
    assert.deepEqual(c.messages.at(-1).result, []);
    f.controller.stop();
    await flush();
    assert.equal(f.controller.sessions.length, 0);
  }
});

test("endpoint emits authoritative immutable disabled/starting/listening/disabled snapshots", async () => {
  const f = endpointFixture();
  assert.deepEqual(f.events[0], { kind: "endpoint", state: "disabled", reason: null });
  const started = f.endpoint.start({ socketPath: "/owned/run/s" });
  assert.equal(f.endpoint.status.state, "starting");
  await started;
  assert.deepEqual(states(f.events), ["disabled", "starting", "listening"]);
  const listening = f.events.at(-1);
  assert.equal(listening.socketPath, "/owned/run/s");
  assert.throws(() => { f.endpoint.status = { state: "listening" }; }, TypeError);
  await f.endpoint.stop();
  assert.deepEqual(states(f.events), ["disabled", "starting", "listening", "disabled"]);
  assert.deepEqual(f.endpoint.status, { state: "disabled", reason: null });
  assert.equal(listening.state, "listening");
  for (const event of f.events) assertFrozen(event);
  assert.deepEqual(f.calls.filter(call => call[0] === "bind"), [["bind", "/owned/run/s", 0o600, 8]]);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});

test("endpoint refusal states use only fixed reasons without accepting arbitrary exception content", async () => {
  for (const [code, state, reason] of [
    ["SOCKET_IN_USE", "in_use", "SOCKET_IN_USE"],
    ["SOCKET_PATH_BLOCKED", "blocked", "SOCKET_PATH_BLOCKED"],
    ["EXACT_SOCKET_METADATA_UNAVAILABLE", "unavailable", "EXACT_SOCKET_METADATA_UNAVAILABLE"],
    ["PRIVATE_EXCEPTION_CONTENT", "unavailable", "UNAVAILABLE"],
  ]) {
    const f = endpointFixture({ prepare: () => { throw Object.assign(new Error(), { code }); } });
    await f.endpoint.start({ socketPath: "/owned/run/s" });
    assert.deepEqual(f.events.at(-1), { kind: "endpoint", state, reason });
    assert.equal(f.servers.length, 0);
  }
  const f = endpointFixture();
  await f.endpoint.start({ socketPath: "relative" });
  assert.deepEqual(f.events.at(-1), { kind: "endpoint", state: "blocked", reason: "INVALID_SOCKET_PATH" });
  assert.equal(f.calls.length, 0);
});

test("endpoint handles asynchronous listener loss and rejects stale listener sockets", async () => {
  const f = endpointFixture();
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  const listener = f.servers[0].listener;
  listener.onStopListening();
  await flush();
  assert.equal(f.endpoint.status.reason, CHANNEL_ENDPOINT_REASONS.LISTENER_STOPPED);
  assert.deepEqual(states(f.events), ["disabled", "starting", "listening", "unavailable"]);
  const closes = [];
  listener.onSocketAccepted(null, { close: code => closes.push(code) });
  assert.deepEqual(closes, [0x804b0002]);
  assert.equal(f.calls.filter(call => call[0] === "open").length, 0);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});

test("endpoint synchronous asyncListen failure cannot publish a false listening event", async () => {
  const f = endpointFixture({ listen: server => server.listener.onStopListening() });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  assert.deepEqual(states(f.events), ["disabled", "starting", "unavailable"]);
  assert.equal(f.endpoint.status.reason, "LISTENER_STOPPED");
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});

test("endpoint thrown asyncListen detaches before close and cleans the claim only once", async () => {
  const f = endpointFixture({ listen: () => { throw new Error("listen failed"); } });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  assert.deepEqual(states(f.events), ["disabled", "starting", "unavailable"]);
  assert.equal(f.endpoint.status.reason, "UNAVAILABLE");
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});

test("endpoint lock loss resolved or rejected closes listener and publishes one fixed unavailable event", async () => {
  for (const rejected of [false, true]) {
    const f = endpointFixture();
    await f.endpoint.start({ socketPath: "/owned/run/s" });
    if (rejected) f.claims[0].loss.reject(new Error("private lock detail"));
    else f.claims[0].loss.resolve();
    await flush();
    assert.equal(f.endpoint.status.state, "unavailable");
    assert.equal(f.endpoint.status.reason, "SOCKET_LOCK_LOST");
    assert.equal(f.events.filter(event => event.reason === "SOCKET_LOCK_LOST").length, 1);
    assert.equal(f.calls.filter(call => call[0] === "close").length, 1);
    assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  }
});

test("endpoint lock-loss cleanup barrier preserves a newer re-enable and ignores old callbacks", async () => {
  const cleanup = deferred();
  const f = endpointFixture({ cleanup: claim => claim.id === 1 ? cleanup.promise : undefined });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  const old = f.servers[0].listener;
  f.claims[0].loss.resolve();
  await flush();
  assert.equal(f.endpoint.status.reason, "SOCKET_LOCK_LOST");
  const next = f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  assert.equal(f.servers.length, 1);
  cleanup.resolve();
  await next;
  assert.equal(f.servers.length, 2);
  assert.equal(f.endpoint.status.state, "listening");
  const count = f.events.length;
  old.onStopListening();
  f.claims[0].loss.resolve();
  await flush();
  assert.equal(f.events.length, count);
  assert.equal(f.endpoint.status.state, "listening");
  await f.endpoint.stop();
});

test("endpoint disable/re-enable during prepare awaits claim cleanup before creating a successor", async () => {
  const prepared = deferred(), cleanup = deferred();
  const first = { id: 1, path: "/owned/run/s", lock: { lost: new Promise(() => {}) } };
  let call = 0;
  const f = endpointFixture({
    prepare: () => ++call === 1 ? prepared.promise : { id: 2, path: "/owned/run/s", lock: { lost: new Promise(() => {}) } },
    cleanup: claim => claim.id === 1 ? cleanup.promise : undefined,
  });
  const initial = f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  const stopped = f.endpoint.stop();
  const restarted = f.endpoint.start({ socketPath: "/owned/run/s" });
  prepared.resolve(first);
  await flush();
  assert.equal(f.servers.length, 0);
  assert.equal(call, 1);
  assert.equal(f.endpoint.status.state, "disabled");
  cleanup.resolve();
  await Promise.all([initial, stopped, restarted]);
  assert.equal(call, 2);
  assert.equal(f.servers.length, 1);
  assert.equal(f.endpoint.status.state, "listening");
  assert.deepEqual(states(f.events), ["disabled", "starting", "disabled", "starting", "listening"]);
  await f.endpoint.stop();
});

test("endpoint cancelled startup failure cannot overwrite disabled and a later disable supersedes pending enable", async () => {
  const prepared = deferred();
  const f = endpointFixture({ prepare: () => prepared.promise });
  const starting = f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  const stopped = f.endpoint.stop();
  const reenabled = f.endpoint.start({ socketPath: "/owned/run/s" });
  const stoppedAgain = f.endpoint.stop();
  prepared.reject(Object.assign(new Error(), { code: "SOCKET_PATH_BLOCKED" }));
  await Promise.all([starting, stopped, reenabled, stoppedAgain]);
  assert.deepEqual(states(f.events), ["disabled", "starting", "disabled"]);
  assert.equal(f.endpoint.status.state, "disabled");
  assert.equal(f.servers.length, 0);
});

test("endpoint starting observer disable prevents all path/server effects", async () => {
  let endpoint, stopped;
  const f = endpointFixture({ onStateChange: event => {
    if (event.state === "starting") stopped = endpoint.stop();
  } });
  endpoint = f.endpoint;
  await endpoint.start({ socketPath: "/owned/run/s" });
  await stopped;
  assert.deepEqual(states(f.events), ["disabled", "starting", "disabled"]);
  assert.equal(f.calls.length, 0);
});

test("endpoint disabled observer re-enable waits for cleanup and repeated stop does not recurse", async () => {
  let endpoint, next, armed = false;
  const cleanup = deferred();
  const f = endpointFixture({
    cleanup: claim => claim.id === 1 ? cleanup.promise : undefined,
    onStateChange: event => {
      if (event.state === "disabled" && armed) {
        armed = false;
        next = endpoint.start({ socketPath: "/owned/run/s" });
      }
    },
  });
  endpoint = f.endpoint;
  await endpoint.start({ socketPath: "/owned/run/s" });
  armed = true;
  const stopped = endpoint.stop();
  await flush();
  assert.equal(f.servers.length, 1);
  cleanup.resolve();
  await stopped; await next;
  assert.equal(endpoint.status.state, "listening");
  await endpoint.stop();
  const count = f.events.length;
  await endpoint.stop();
  assert.equal(f.events.length, count);
});

test("endpoint observer exceptions/rejections cannot prevent listen, lock cleanup or disable", async () => {
  for (const failure of [
    () => { throw new Error("observer"); },
    () => Promise.reject(new Error("observer")),
    () => ({ get then() { throw new Error("observer"); } }),
    () => new Promise(() => {}),
  ]) {
    const f = endpointFixture({ onStateChange: failure });
    await f.endpoint.start({ socketPath: "/owned/run/s" });
    assert.equal(f.endpoint.status.state, "listening");
    await f.endpoint.stop();
    await flush();
    assert.equal(f.endpoint.status.state, "disabled");
    assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  }
});

test("composed endpoint lock loss stops approved controller effects and reports matching immutable removals", async () => {
  const result = deferred();
  const f = fixture({ executeMethod: (_method, _params, _session, options) => {
    f.effects.push(options);
    return result.promise;
  } });
  const transport = endpointFixture({ controller: f.controller });
  await transport.endpoint.start({ socketPath: "/owned/run/s" });
  const c = await approve(f);
  c.receive(encode({ v: 1, id: 1, method: "tabs.open", params: { url: "http://localhost/" } }));
  await flush();
  assert.equal(f.effects.length, 1);
  transport.claims[0].loss.resolve();
  await flush();
  assert.equal(f.effects[0].signal.aborted, true);
  assert.equal(f.events.at(-1).reason, "STOPPED");
  assert.equal(f.events.at(-1).sessions.length, 0);
  assert.equal(transport.events.at(-1).reason, "SOCKET_LOCK_LOST");
  result.resolve({ tab_id: "t_2" });
  await flush();
  assert.equal(c.messages.some(message => message.id === 1), false);
  assertFrozen(f.events.at(-1));
  assertFrozen(transport.events.at(-1));
});


test("concurrent enables behind cleanup both await the successor final listening or refusal state", async () => {
  for (const refused of [false, true]) {
    const cleanup = deferred(), successor = deferred();
    let prepares = 0;
    const first = { id: 1, lock: { lost: new Promise(() => {}) } };
    const second = { id: 2, lock: { lost: new Promise(() => {}) } };
    const f = endpointFixture({ prepare: () => ++prepares === 1 ? first : successor.promise,
      cleanup: claim => claim.id === 1 ? cleanup.promise : undefined });
    await f.endpoint.start({ socketPath: "/owned/run/s" });
    const stopped = f.endpoint.stop();
    let oneDone = false, twoDone = false;
    const one = f.endpoint.start({ socketPath: "/owned/run/s" }).then(value => { oneDone = true; return value; });
    const two = f.endpoint.start({ socketPath: "/owned/run/s" }).then(value => { twoDone = true; return value; });
    cleanup.resolve();
    await flush();
    assert.equal(prepares, 2);
    assert.equal(oneDone, false);
    assert.equal(twoDone, false);
    assert.equal(f.endpoint.status.state, "starting");
    if (refused) successor.reject(Object.assign(new Error(), { code: "SOCKET_PATH_BLOCKED" }));
    else successor.resolve(second);
    const [, a, b] = await Promise.all([stopped, one, two]);
    assert.equal(a.state, refused ? "blocked" : "listening");
    assert.equal(b.state, a.state);
    await f.endpoint.stop();
  }
});

test("later disable wins over concurrent enables waiting for successor startup", async () => {
  const cleanup = deferred(), successor = deferred();
  let prepares = 0;
  const first = { id: 1, lock: { lost: new Promise(() => {}) } };
  const second = { id: 2, lock: { lost: new Promise(() => {}) } };
  const f = endpointFixture({ prepare: () => ++prepares === 1 ? first : successor.promise,
    cleanup: claim => claim.id === 1 ? cleanup.promise : undefined });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  const stopped = f.endpoint.stop();
  const one = f.endpoint.start({ socketPath: "/owned/run/s" });
  const two = f.endpoint.start({ socketPath: "/owned/run/s" });
  cleanup.resolve();
  await flush();
  const disabled = f.endpoint.stop();
  successor.resolve(second);
  const [, a, b] = await Promise.all([stopped, one, two, disabled]);
  assert.equal(a.state, "disabled");
  assert.equal(b.state, "disabled");
  assert.equal(f.endpoint.status.state, "disabled");
  assert.equal(f.servers.length, 1);
  assert.deepEqual(f.calls.filter(call => call[0] === "cleanup").map(call => call[1]), [1, 2]);
});

test("synchronous listener-stop followed by listen throw transfers cleanup exactly once", async () => {
  const f = endpointFixture({ listen: server => {
    server.listener.onStopListening();
    throw new Error("private listen detail");
  } });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  assert.equal(f.endpoint.status.reason, "LISTENER_STOPPED");
  assert.equal(f.calls.filter(call => call[0] === "close").length, 1);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  assert.equal(f.events.some(event => event.state === "listening"), false);
});

test("rejected shutdown cleanup remains owned, rejects stop and blocks rebind until explicit retry succeeds", async () => {
  let fail = true;
  const f = endpointFixture({ cleanup: () => {
    if (fail) throw new Error("private release failure");
    return false; // Replacement preservation may complete lock release.
  } });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  await assert.rejects(f.endpoint.stop(), { code: "CLEANUP_INCOMPLETE", message: "CLEANUP_INCOMPLETE" });
  assert.deepEqual(f.endpoint.status, { state: "unavailable", reason: "CLEANUP_INCOMPLETE" });
  const calls = f.calls.length;
  await assert.rejects(f.endpoint.start({ socketPath: "/owned/run/s" }), { code: "CLEANUP_INCOMPLETE" });
  assert.equal(f.calls.length, calls);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  fail = false;
  await f.endpoint.stop();
  assert.equal(f.endpoint.status.state, "disabled");
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 2);
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  assert.equal(f.endpoint.status.state, "listening");
  assert.equal(f.servers.length, 2);
  await f.endpoint.stop();
  assert.equal(JSON.stringify(f.events).includes("private release failure"), false);
});

test("startup failure plus rejected claim release publishes cleanup failure and never implicitly retries", async () => {
  let fail = true;
  const f = endpointFixture({
    verifyBound: () => { throw Object.assign(new Error(), { code: "SOCKET_PATH_BLOCKED" }); },
    cleanup: () => { if (fail) throw new Error("release failed"); },
  });
  const result = await f.endpoint.start({ socketPath: "/owned/run/s" });
  assert.equal(result.reason, "CLEANUP_INCOMPLETE");
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  await assert.rejects(f.endpoint.start({ socketPath: "/owned/run/s" }), { code: "CLEANUP_INCOMPLETE" });
  fail = false;
  await f.endpoint.stop();
  assert.equal(f.endpoint.status.state, "disabled");
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 2);
});

test("cancelled startup release failure is visible to the original stop and closes its server once", async () => {
  const verified = deferred();
  let fail = true;
  const f = endpointFixture({ verifyBound: () => verified.promise,
    cleanup: () => { if (fail) throw new Error("lock release failed"); } });
  const startup = f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  const stopped = f.endpoint.stop();
  verified.resolve(f.claims[0]);
  await startup;
  await assert.rejects(stopped, { code: "CLEANUP_INCOMPLETE" });
  assert.equal(f.endpoint.status.reason, "CLEANUP_INCOMPLETE");
  assert.equal(f.calls.filter(call => call[0] === "close").length, 1);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  fail = false;
  await f.endpoint.stop();
  assert.equal(f.endpoint.status.state, "disabled");
});

test("async lock loss with rejected release reports cleanup failure without unhandled rejection", async () => {
  let fail = true;
  const f = endpointFixture({ cleanup: () => { if (fail) throw new Error("release failed"); } });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  f.claims[0].loss.resolve();
  await flush();
  assert.equal(f.endpoint.status.reason, "CLEANUP_INCOMPLETE");
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  await assert.rejects(f.endpoint.start({ socketPath: "/owned/run/s" }), { code: "CLEANUP_INCOMPLETE" });
  fail = false;
  await f.endpoint.stop();
  assert.equal(f.endpoint.status.state, "disabled");
});

test("controller shutdown failure still closes listener, reports unavailable and requires successful stop", async () => {
  let fail = true;
  const f = endpointFixture({ controller: { stop() { if (fail) throw new Error("controller failed"); } } });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  await assert.rejects(f.endpoint.stop(), { code: "UNAVAILABLE" });
  assert.equal(f.endpoint.status.reason, "UNAVAILABLE");
  assert.equal(f.calls.filter(call => call[0] === "close").length, 1);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  const count = f.calls.length;
  await assert.rejects(f.endpoint.start({ socketPath: "/owned/run/s" }), { code: "UNAVAILABLE" });
  assert.equal(f.calls.length, count);
  fail = false;
  await f.endpoint.stop();
  assert.equal(f.endpoint.status.state, "disabled");
});


test("disable promptly closes the exact bound starting server before deferred verification completes", async () => {
  const verified = deferred();
  const f = endpointFixture({ verifyBound: () => verified.promise });
  const startup = f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  assert.equal(f.calls.filter(call => call[0] === "bind").length, 1);
  assert.equal(f.calls.filter(call => call[0] === "close").length, 0);
  let stoppedDone = false;
  const stopped = f.endpoint.stop().then(() => { stoppedDone = true; });
  assert.equal(f.calls.filter(call => call[0] === "close").length, 1);
  await flush();
  assert.equal(stoppedDone, false);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 0);
  assert.equal(f.calls.filter(call => call[0] === "listen").length, 0);
  verified.resolve(f.claims[0]);
  await Promise.all([startup, stopped]);
  assert.equal(f.calls.filter(call => call[0] === "bind").length, 1);
  assert.equal(f.calls.filter(call => call[0] === "close").length, 1);
  assert.equal(f.calls.filter(call => call[0] === "listen").length, 0);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  assert.equal(f.endpoint.status.state, "disabled");
});

test("reentrant controller shutdown failure cannot leave a disabled snapshot while failure is latched", async () => {
  let endpoint, nested, stops = 0;
  const f = endpointFixture({ controller: { stop() {
    if (++stops === 1) {
      nested = endpoint.stop();
      nested.catch(() => {});
      throw new Error("outer shutdown failed");
    }
  } } });
  endpoint = f.endpoint;
  await endpoint.start({ socketPath: "/owned/run/s" });
  await assert.rejects(endpoint.stop(), { code: "UNAVAILABLE" });
  await assert.rejects(nested, { code: "UNAVAILABLE" });
  assert.deepEqual(endpoint.status, { state: "unavailable", reason: "UNAVAILABLE" });
  assert.equal(f.events.at(-1).reason, "UNAVAILABLE");
  await assert.rejects(endpoint.start({ socketPath: "/owned/run/s" }), { code: "UNAVAILABLE" });
  await endpoint.stop();
  assert.equal(endpoint.status.state, "disabled");
});


test("lock rejection during deferred verification is consumed and closes startup before any listen", async () => {
  const verified = deferred();
  const f = endpointFixture({ verifyBound: () => verified.promise });
  const startup = f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  f.claims[0].loss.reject(new Error("private pre-install loss"));
  await flush();
  assert.equal(f.endpoint.status.reason, "SOCKET_LOCK_LOST");
  assert.equal(f.calls.filter(call => call[0] === "close").length, 1);
  assert.equal(f.calls.filter(call => call[0] === "listen").length, 0);
  verified.resolve(f.claims[0]);
  await startup; await flush();
  assert.equal(f.events.some(event => event.state === "listening"), false);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});

test("cancelled startup consumes late lock rejection while retaining deferred cleanup", async () => {
  const verified = deferred(), cleanup = deferred();
  const f = endpointFixture({ verifyBound: () => verified.promise, cleanup: () => cleanup.promise });
  const startup = f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  const stopped = f.endpoint.stop();
  f.claims[0].loss.reject(new Error("cancelled process loss"));
  verified.resolve(f.claims[0]);
  await flush();
  assert.equal(f.endpoint.status.state, "disabled");
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
  cleanup.resolve();
  await Promise.all([startup, stopped]);
  assert.equal(f.events.some(event => event.state === "listening"), false);
});

test("an already-rejected owned lock is observed before creating or binding a server", async () => {
  const f = endpointFixture({ prepare: () => ({ id: 1, lock: { lost: Promise.reject(new Error("lost")) } }) });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  assert.equal(f.endpoint.status.reason, "SOCKET_LOCK_LOST");
  assert.equal(f.servers.length, 0);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});

test("synchronous socket accept before listen commitment is rejected even if asyncListen then throws", async () => {
  const closes = [];
  const socket = { close: code => closes.push(code) };
  const f = endpointFixture({ listen: server => {
    server.listener.onSocketAccepted(null, socket);
    throw new Error("listen failed after uncommitted accept");
  } });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  assert.deepEqual(closes, [0x804b0002]);
  assert.equal(f.calls.filter(call => call[0] === "open").length, 0);
  assert.equal(f.endpoint.status.reason, "UNAVAILABLE");
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});


test("startup refusal cleanup settling owned lock loss retains the original blocked reason", async () => {
  const f = endpointFixture({
    verifyBound: () => { throw Object.assign(new Error(), { code: "SOCKET_PATH_BLOCKED" }); },
    cleanup: claim => { claim.loss.resolve(); },
  });
  const result = await f.endpoint.start({ socketPath: "/owned/run/s" });
  await flush();
  assert.deepEqual(result, { state: "blocked", reason: "SOCKET_PATH_BLOCKED" });
  assert.equal(f.endpoint.status.reason, "SOCKET_PATH_BLOCKED");
  assert.equal(f.events.some(event => event.reason === "SOCKET_LOCK_LOST"), false);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});

test("ordinary shutdown settling the owned release promise never reports external lock loss", async () => {
  const f = endpointFixture({ cleanup: claim => { claim.loss.resolve(); } });
  await f.endpoint.start({ socketPath: "/owned/run/s" });
  await f.endpoint.stop();
  await flush();
  assert.equal(f.endpoint.status.state, "disabled");
  assert.equal(f.events.some(event => event.reason === "SOCKET_LOCK_LOST"), false);
  assert.equal(f.calls.filter(call => call[0] === "cleanup").length, 1);
});
