import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { manifest } from "../../../packages/contexts/tests/samples.mjs";
import { createAgentChannelService, channelSensitiveHost, AGENT_SERVICE_LIMITS } from "../chrome/AgentChannelService.sys.mjs";

const encode = value => new TextEncoder().encode(JSON.stringify(value) + "\n");
const flush = async () => { for (let i = 0; i < 50; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
class Clock {
  at = 1000000; next = 0; timers = new Map();
  now = () => this.at;
  setTimeout = (fn, ms) => { const id = ++this.next; this.timers.set(id, { fn, at: this.at + ms }); return id; };
  clearTimeout = id => this.timers.delete(id);
  async tick(ms) {
    const end = this.at + ms;
    for (;;) {
      const next = [...this.timers].filter(([,value]) => value.at <= end).sort((a,b) => a[1].at-b[1].at)[0];
      if (!next) break;
      this.at = next[1].at; this.timers.delete(next[0]); next[1].fn(); await flush();
    }
    this.at = end; await flush();
  }
}
const project = (id = "p_harbor", root = "/synthetic/harbor") => ({ version: 1, id, root,
  manifest: manifest({ name: id, environments: [{ name: "local", base_url: "http://localhost:4450/" }] }),
  manifest_state: "none", context_uuid: null, trusted: false, created_at: 1, updated_at: 2 });
const hello = (name = "agent-bridge", cwd = "/synthetic/harbor") => ({ v: 1, type: "hello",
  client: { name, agent: "claude-code", version: "1" }, cwd, pid: 123 });
const hook = (payload = {}, event = "Stop", cwd = "/synthetic/harbor") => ({ v: 1, type: "hook", source: "claude-code", event, cwd, payload });

function fixture(options = {}) {
  const clock = new Clock(), events = [], calls = [], servers = [], approvals = [], notifications = [], connections = [];
  let projects = [project()], counter = 0, currentController;
  const locks = [];
  const runtime = {
    paths: {
      prepare: async path => {
        calls.push(["prepare", path]); if (options.prepareError) throw Object.assign(new Error(), { code: options.prepareError });
        const lost = deferred(); locks.push(lost); const claim = { path, lock: { lost: lost.promise } };
        return options.prepare ? options.prepare(claim) : claim;
      },
      verifyBound: async claim => { calls.push(["verify"]); return options.verify ? options.verify(claim) : claim; },
      cleanup: async claim => { calls.push(["cleanup", claim.path]); if (options.cleanup) return options.cleanup(claim); },
    },
    file: path => ({ path }),
    createServerSocket() {
      const server = { listener: null, closed: false,
        initWithFilename(file, mode, backlog) { calls.push(["bind", file.path, mode, backlog]); },
        asyncListen(listener) { this.listener = listener; calls.push(["listen"]); },
        close() { this.closed = true; calls.push(["close"]); this.listener?.onStopListening(); },
      }; servers.push(server); return server;
    },
    openConnection(socket, controller) { currentController = controller; socket.connection = controller.accept(socket.transport); },
  };
  const deps = {
    loadProjects: () => projects, validateProject: core.validateProject, validateStatusRecord: core.validateStatusRecord,
    parseHookEvent: core.parseHookEvent, now: clock.now, timers: { setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout },
    randomHex: () => (++counter).toString(16).padStart(16, "0"), isSensitiveHost: core.isSensitiveHost,
    createNativeConfiguration: async controls => { calls.push(["native", controls]); return { socketPath: "/synthetic/profd/.a/s", exactPosixBackend: { verified: true } }; },
    createTransportRuntime: config => { calls.push(["transport", config]); return runtime; },
    buildHookConfig: ({agent, socketPath}) => { calls.push(["config", agent, socketPath]); return JSON.stringify({agent, socketPath}); },
    onChange: event => events.push(event), ...options.deps,
  };
  const service = createAgentChannelService(deps);
  function register(name = "normal", normal = () => true, extra = {}) {
    const key = {}, unregister = service.registerPresenter(key, {
      isNormal: normal,
      requestApproval(view, controls) { const d = deferred(); approvals.push({ name, view, controls, ...d }); return d.promise; },
      onStatus(record) { notifications.push({ name, record }); }, ...extra,
    });
    return { key, unregister };
  }
  function connect() {
    const messages = [], closes = [], transport = {
      write: bytes => messages.push(JSON.parse(new TextDecoder().decode(bytes))), close: code => closes.push(code),
    };
    const socket = { transport, close: code => closes.push(code) };
    servers.at(-1).listener.onSocketAccepted(servers.at(-1), socket);
    const c = { ...socket.connection, messages, closes }; connections.push(c); return c;
  }
  async function start() { await service.initialize(); return service.setEnabled(true); }
  async function approved(cwd) {
    const c = connect(); c.receive(encode(hello("agent-bridge", cwd))); await flush();
    approvals.at(-1).resolve(true); await flush(); return c;
  }
  return { service, deps, clock, events, calls, servers, locks, approvals, notifications, connections, register, connect, start, approved,
    setProjects: value => { projects = value; }, controller: () => currentController };
}
async function close(f) { await f.service.close(); assert.equal(f.clock.timers.size, 0); }

test("constructor and initialization remain explicitly off and perform no native admission", async () => {
  const f = fixture(); assert.equal(f.service.getEndpointState().enabled, false);
  assert.equal(f.calls.length, 0); await f.service.initialize();
  assert.equal(f.service.getProjectCacheState().state, "ready"); assert.equal(f.calls.length, 0);
  await f.service.setEnabled(false); assert.equal(f.calls.length, 0);
  await assert.rejects(f.service.getHookConfig("codex"), e => e.code === "ENDPOINT_UNAVAILABLE"); await close(f);
});
test("explicit enable composes actual controller/endpoint and shares one listener across presenters", async () => {
  const f = fixture(); f.register("one"); f.register("two");
  await f.start(); await f.service.setEnabled(true);
  assert.equal(f.servers.length, 1); assert.equal(f.calls.filter(c => c[0] === "native").length, 1);
  assert.equal(f.service.getEndpointState().state, "listening");
  assert.deepEqual(f.calls.find(c => c[0] === "bind").slice(2), [0o600, 8]);
  assert.equal(f.service.getEndpointState().methods.every(m => m.available === false), true);
  assert.equal(JSON.parse(await f.service.getHookConfig("claude-code")).socketPath, "/synthetic/profd/.a/s"); await close(f);
});
test("project cache is frozen, bounded, and fails closed for invalid or duplicate authority", async () => {
  const f = fixture(); const source = [project()]; f.setProjects(source); await f.service.initialize();
  source[0].root = "/elsewhere"; assert.equal(f.service.getProjects()[0].root, "/synthetic/harbor");
  assert.equal(Object.isFrozen(f.service.getProjects()[0].manifest), true);
  for (const values of [[project(), project()], [project("p_other", "/synthetic/harbor"), project()], [{bad:true}], Array(129).fill(project())]) {
    f.setProjects(values); await f.service.refreshProjects(); assert.equal(f.service.getProjects().length, 0);
    assert.equal(f.service.getProjectCacheState().state, "unavailable");
  }
  await f.service.setEnabled(true); assert.equal(f.calls.some(c => c[0] === "native"), false); await close(f);
});
test("reversed project reads cannot restore an old snapshot after a newer refresh", async () => {
  const first = deferred(), second = deferred(); let reads = 0;
  const f = fixture({deps:{loadProjects: () => (++reads === 1 ? first.promise : second.promise)}});
  const old = f.service.initialize(); await flush(); const newer = f.service.refreshProjects(); await flush();
  second.resolve([project("p_inkline", "/synthetic/inkline")]); await newer;
  first.resolve([project()]); await old;
  assert.deepEqual(f.service.getProjects().map(p => p.id), ["p_inkline"]); await close(f);
});
test("a hanging project loader is bounded and cannot admit a native endpoint", async () => {
  const f = fixture({deps:{loadProjects: () => new Promise(() => {})}});
  const init = f.service.initialize(); await flush(); await f.clock.tick(AGENT_SERVICE_LIMITS.projectLoadMs); await init;
  assert.equal(f.service.getProjectCacheState().reason, "TIMEOUT");
  const enabled = f.service.setEnabled(true); await flush(); await f.clock.tick(AGENT_SERVICE_LIMITS.projectLoadMs); await enabled;
  assert.equal(f.calls.some(c => c[0] === "native"), false); await close(f);
});
test("most-recent private or unknown presenter never receives approval", async () => {
  const f = fixture(); f.register("normal"); f.register("private", () => false); f.register("unknown", () => undefined);
  await f.start(); const c = await f.approved();
  assert.deepEqual(f.approvals.map(v => v.name), ["normal"]); assert.equal(f.service.listSessions()[0].state, "approved");
  assert.equal(c.messages.at(-1).granted, true); await close(f);
});
test("private-only and unknown-project bridge sessions are denied without a prompt", async () => {
  const f = fixture(); f.register("private", () => false); await f.start();
  for (const cwd of ["/synthetic/harbor", "/synthetic/elsewhere"]) {
    const c = f.connect(); c.receive(encode(hello("agent-bridge", cwd))); await flush();
    assert.equal(c.messages.at(-1).granted, false);
  }
  assert.equal(f.approvals.length, 0); await close(f);
});
test("presenter closure settles denial, aborts presentation, and ignores late allow", async () => {
  const f = fixture(), p = f.register(); await f.start();
  const c = f.connect(); c.receive(encode(hello())); await flush(); p.unregister(); await flush();
  assert.equal(f.approvals[0].controls.signal.aborted, true); assert.equal(c.messages.at(-1).granted, false);
  f.approvals[0].resolve(true); await flush(); assert.equal(f.service.listSessions()[0].state, "denied"); await close(f);
});
test("native presenter privacy drift is checked again after an answer", async () => {
  let normal = true; const f = fixture(); f.register("normal", () => normal); await f.start();
  const c = f.connect(); c.receive(encode(hello())); await flush(); normal = false;
  f.approvals[0].resolve(true); await flush(); assert.equal(c.messages.at(-1).granted, false); await close(f);
});
test("approval expiry emits immutable authoritative denial and late allow cannot grant", async () => {
  const f = fixture(); f.register(); await f.start(); const c = f.connect(); c.receive(encode(hello())); await flush();
  await f.clock.tick(55000); assert.equal(c.messages.at(-1).granted, false);
  assert.equal(f.approvals[0].controls.signal.aborted, true);
  assert.equal(f.events.some(e => e.kind === "session" && e.state === "denied" && e.reason === "TIMEOUT"), true);
  f.approvals[0].resolve(true); await flush(); assert.equal(f.service.listSessions()[0].state, "denied");
  for (const event of f.events) assert.equal(Object.isFrozen(event), true); await close(f);
});
test("session revocation is restricted to current project association and aborts its presenter", async () => {
  const f = fixture(); f.register(); await f.start(); const c = await f.approved();
  assert.equal(f.service.revokeSession("p_elsewhere", c.session), false);
  assert.equal(f.service.revokeSession("p_harbor", c.session), true);
  assert.equal(f.service.listSessions().length, 0); assert.equal(f.approvals[0].controls.signal.aborted, true);
  assert.equal(f.events.some(e => e.kind === "session" && e.state === "closed" && e.reason === "REVOKED"), true); await close(f);
});
test("synchronous invalidation revokes stale sessions before any asynchronous mutation refresh", async () => {
  const f = fixture(); f.register(); await f.start(); const c = await f.approved();
  const before = f.service.getProjectCacheState().generation; f.service.invalidateProjects();
  assert.equal(f.service.getProjects().length, 0); assert.equal(f.service.listSessions().length, 0);
  assert.equal(c.closes.length, 1); assert.ok(f.service.getProjectCacheState().generation > before);
  f.setProjects([]); await f.service.refreshProjects(); assert.equal(f.service.getProjectCacheState().state, "ready"); await close(f);
});
test("real parser status payload cwd selects nested projects and stale unknown paths ack false", async () => {
  const f = fixture(); f.setProjects([project(), project("p_nested", "/synthetic/harbor/nested")]); f.register(); await f.start();
  const c = f.connect(); c.receive(new Uint8Array([...encode(hello("axiosozo-notify")), ...encode(hook({cwd:"/synthetic/harbor/nested/app", transcript:"DO_NOT_RETAIN"}))]));
  await c.end(); assert.equal(c.messages.at(-1).matched, true);
  assert.equal(f.service.listActivity("p_nested")[0].history[0].project_path, "/synthetic/harbor/nested");
  assert.equal(JSON.stringify(f.service.listActivity()).includes("DO_NOT_RETAIN"), false);
  const wrong = f.connect(); wrong.receive(encode(hello("axiosozo-notify"))); wrong.receive(encode(hook({cwd:"/synthetic/harbor-other"}))); await wrong.end();
  assert.equal(wrong.messages.at(-1).matched, false); await close(f);
});
test("parsed status acceptance does not wait for notification UI and survives observer rejection", async () => {
  const f = fixture(); f.register("normal", () => true, {onStatus: () => new Promise(() => {})}); await f.start();
  const c = f.connect(); c.receive(encode(hello("axiosozo-notify"))); c.receive(encode(hook())); await c.end();
  assert.equal(c.messages.at(-1).matched, true); assert.equal(f.service.listActivity().length, 1); await close(f);
});
test("status receipt after synchronous invalidation cannot retain removed project authority", async () => {
  const f = fixture(); f.register(); await f.start(); const c = f.connect(); c.receive(encode(hello("axiosozo-notify")));
  f.service.invalidateProjects(); c.receive(encode(hook())); await c.end();
  assert.equal(f.service.listActivity().length, 0); assert.equal(f.notifications.length, 0); await close(f);
});
test("normal hosts use the required boolean wrapper while unavailable and object mistakes fail closed", async () => {
  assert.equal(channelSensitiveHost(core.isSensitiveHost, "localhost"), false);
  assert.equal(channelSensitiveHost(core.isSensitiveHost, "ing.nl"), true);
  for (const policy of [null, () => false, () => ({}), () => {throw Error();}]) assert.equal(channelSensitiveHost(policy, "localhost"), true);
  const f = fixture(); f.register(); await f.start();
  f.service.installTools({isMethodAvailable: method => method === "tabs.list", listTabs: () => [{tab_id:"t_1",url:"http://localhost:4450/",title:"Fixture",active:true,project_id:"p_harbor",engine:"gecko",private:false}]});
  const c = await f.approved(); c.receive(encode({v:1,id:1,method:"tabs.list",params:{}})); await flush();
  assert.equal(c.messages.at(-1).result.length, 1); await close(f);
});
test("Step8 methods stay unavailable before effects or act confirmation", async () => {
  const f = fixture(); f.register(); await f.start(); const c = await f.approved();
  c.receive(encode({v:1,id:1,method:"page.click",params:{tab_id:"t_1",selector:"button"}})); await flush();
  assert.equal(c.messages.at(-1).error.code, "UNAVAILABLE"); assert.equal(f.approvals.length, 1); await close(f);
});
test("rapid enable-disable-reenable waits for native admission cancellation and starts only the newest listener", async () => {
  const pending = deferred(); let factoryCalls = 0, lateClosed = 0;
  const f = fixture({deps:{createNativeConfiguration: () => ++factoryCalls === 1 ? pending.promise : {socketPath:"/synthetic/profd/.a/s",exactPosixBackend:{verified:true}}}});
  await f.service.initialize(); const first = f.service.setEnabled(true); await flush();
  const disabled = f.service.setEnabled(false), newest = f.service.setEnabled(true); await flush();
  await first; await disabled; await newest;
  pending.resolve({close: () => {lateClosed++;}}); await flush();
  assert.equal(lateClosed, 1); assert.equal(f.servers.length, 1); assert.equal(f.service.getEndpointState().state, "listening"); await close(f);
});
test("startup path failures preserve their machine state after owned cleanup and allow explicit retry", async () => {
  const opts = {prepareError:"SOCKET_IN_USE"}, f = fixture(opts); await f.start();
  assert.equal(f.service.getEndpointState().state, "in_use"); assert.equal(f.service.getEndpointState().reason, "SOCKET_IN_USE");
  opts.prepareError = null; await f.service.setEnabled(true); assert.equal(f.service.getEndpointState().state, "listening"); await close(f);
});
test("listener and lock loss invalidate sessions and publish endpoint failure", async () => {
  for (const loss of ["listener", "lock"]) {
    const f = fixture(); f.register(); await f.start(); const c = await f.approved();
    if (loss === "listener") f.servers.at(-1).listener.onStopListening(); else f.locks[0].resolve();
    await flush(); assert.equal(c.closes.length, 1); assert.equal(f.service.listSessions().length, 0);
    assert.equal(f.service.getEndpointState().state, "unavailable");
    assert.equal(f.service.getEndpointState().reason, loss === "listener" ? "LISTENER_STOPPED" : "SOCKET_LOCK_LOST");
    assert.equal(f.events.some(e => e.kind === "endpoint" && e.state === "unavailable"), true); await close(f);
  }
});
test("hanging owned cleanup blocks re-enable rather than rebinding before the lifetime lock releases", async () => {
  const held = deferred(), opts = {cleanup: () => held.promise}, f = fixture(opts); await f.start();
  const disabled = f.service.setEnabled(false); await flush(); await f.clock.tick(AGENT_SERVICE_LIMITS.cleanupMs); await disabled;
  assert.equal(f.service.getEndpointState().reason, "CLEANUP_INCOMPLETE");
  const retry = f.service.setEnabled(true); await flush(); await f.clock.tick(AGENT_SERVICE_LIMITS.cleanupMs); await retry;
  assert.equal(f.servers.length, 1); held.resolve(); await flush(); opts.cleanup = null;
  await f.service.setEnabled(true); assert.equal(f.servers.length, 2); await close(f);
});
test("disable and process close abort pending prompts, remove owned listener, and prohibit further factories", async () => {
  const f = fixture(); f.register(); await f.start(); const c = f.connect(); c.receive(encode(hello())); await flush();
  await f.service.setEnabled(false); assert.equal(f.approvals[0].controls.signal.aborted, true);
  assert.equal(f.servers[0].closed, true); assert.equal(c.closes.length, 1); assert.equal(f.service.getEndpointState().state, "disabled");
  await close(f); await assert.rejects(f.service.setEnabled(true), e => e.code === "CLOSED");
  assert.equal(f.calls.filter(c => c[0] === "native").length, 1);
});

test("never-resolving native path preparation is cancelled and cleanup uncertainty blocks replacement binding", async () => {
  const pending = deferred(), opts = {prepare: () => pending.promise}, f = fixture(opts);
  await f.service.initialize(); const enabled = f.service.setEnabled(true); await flush();
  const disabled = f.service.setEnabled(false); await flush();
  await f.clock.tick(AGENT_SERVICE_LIMITS.cleanupMs * 2); await enabled; await disabled;
  assert.equal(f.service.diagnostics().cleanupBlocked, true); assert.equal(f.servers.length, 0);
  pending.resolve({path:"/synthetic/profd/.a/s",lock:{lost:new Promise(() => {})}}); await flush();
  assert.equal(f.calls.filter(c => c[0] === "cleanup").length, 1); assert.equal(f.calls.some(c => c[0] === "bind"), false);
  opts.prepare = null; await f.service.setEnabled(true); assert.equal(f.servers.length, 1); await close(f);
});
test("native verify stall closes the owned listener promptly and forbids late binding reuse", async () => {
  const pending = deferred(), opts = {verify: () => pending.promise}, f = fixture(opts);
  await f.service.initialize(); const enabled = f.service.setEnabled(true); await flush();
  const closed = f.service.close(); await flush();
  await f.clock.tick(AGENT_SERVICE_LIMITS.cleanupMs * 2); await enabled; const receipt = await closed;
  assert.equal(receipt.reason, "CLEANUP_INCOMPLETE"); assert.equal(f.servers.length, 1);
  assert.equal(f.servers[0].closed, true); // before delayed verification resolves
  const claim = {path:"/synthetic/profd/.a/s",lock:{lost:new Promise(() => {})}};
  pending.resolve(claim); await flush(); assert.equal(f.servers[0].closed, true);
  assert.equal(f.calls.some(c => c[0] === "listen"), false); assert.equal(f.clock.timers.size, 0);
});
test("native startup deadline fails closed rather than leaving an infinite enabled transition", async () => {
  const pending = deferred(), f = fixture({prepare: () => pending.promise});
  await f.service.initialize(); const enabled = f.service.setEnabled(true); await flush();
  await f.clock.tick(AGENT_SERVICE_LIMITS.endpointStartMs + AGENT_SERVICE_LIMITS.cleanupMs); await enabled;
  assert.equal(f.service.getEndpointState().reason, "CLEANUP_INCOMPLETE");
  pending.resolve({path:"/synthetic/profd/.a/s",lock:{lost:new Promise(() => {})}}); await flush(); await close(f);
});
test("async rejecting service observers cannot break native or status outcomes", async () => {
  const f = fixture({deps:{onChange: async () => {throw Error("observer");}}});
  f.service.onChange(async () => {throw Error("listener");}); f.register(); await f.start(); const c = await f.approved();
  assert.equal(c.messages.at(-1).granted, true);
  const n = f.connect(); n.receive(encode(hello("axiosozo-notify"))); n.receive(encode(hook())); await n.end();
  assert.equal(n.messages.at(-1).matched, true); await flush(); await close(f);
});

test("late verified cleanup of an explicitly disabled endpoint restores disabled state", async () => {
  const held = deferred(), opts = {cleanup: () => held.promise}, f = fixture(opts); await f.start();
  const disabled = f.service.setEnabled(false); await flush(); await f.clock.tick(AGENT_SERVICE_LIMITS.cleanupMs); await disabled;
  assert.equal(f.service.getEndpointState().reason, "CLEANUP_INCOMPLETE"); held.resolve(); await flush();
  assert.equal(f.service.getEndpointState().enabled, false); assert.equal(f.service.getEndpointState().state, "disabled");
  assert.equal(f.service.getEndpointState().reason, null); opts.cleanup = null; await close(f);
});
test("configuration ownership closes exactly once after admission failure, staleness, and normal stop", async () => {
  for (const mode of ["invalid", "runtime_failure", "stale", "normal"]) {
    let closes = 0; const pending = deferred();
    const config = {socketPath:"/synthetic/profd/.a/s",exactPosixBackend:{verified:true},close:()=>{closes++;}};
    if (mode === "invalid") delete config.exactPosixBackend;
    const f = fixture({deps:{createNativeConfiguration:()=>mode === "stale" ? pending.promise : config,
      ...(mode === "runtime_failure" ? {createTransportRuntime:()=>{throw Error();}} : {})}});
    await f.service.initialize(); const start = f.service.setEnabled(true); await flush();
    if (mode === "stale") { pending.resolve(config); const disable = f.service.setEnabled(false); await start; await disable; }
    else { await start; await f.service.setEnabled(false); }
    assert.equal(closes, 1, mode); await close(f); assert.equal(closes, 1, mode);
  }
});

test("process close cancels its own hanging cache watchdog and leaves a closed empty snapshot", async () => {
  const pending = deferred(), f = fixture({deps:{loadProjects:()=>pending.promise}});
  const init = f.service.initialize(); await flush(); await f.service.close(); await init;
  assert.equal(f.clock.timers.size, 0); assert.equal(f.service.getProjectCacheState().state, "closed");
  assert.equal(f.service.getProjectCacheState().count, 0); assert.equal(f.service.getProjects().length, 0);
  pending.resolve([project()]); await flush(); assert.equal(f.service.getProjects().length, 0);
});

test("activity observers that revoke cache or endpoint authority suppress subsequent status presentation", async () => {
  for (const mode of ["invalidate", "disable"]) {
    let f, triggered = false, disabling;
    f = fixture({deps:{onChange:event=>{
      if (event.kind === "activity" && !triggered) {
        triggered = true;
        if (mode === "invalidate") f.service.invalidateProjects(); else disabling = f.service.setEnabled(false);
      }
    }}});
    f.register(); await f.start(); const c = f.connect();
    c.receive(encode(hello("axiosozo-notify"))); c.receive(encode(hook())); await c.end();
    if (disabling) await disabling;
    assert.equal(triggered, true); assert.equal(f.notifications.length, 0); await close(f);
  }
});
test("rejected owned lock cleanup prevents rebind until an explicit retry proves successful release", async () => {
  let failCleanup = true, attempts = 0;
  const f = fixture({cleanup:()=>{attempts++; if (failCleanup) throw Error("refused");}}); await f.start();
  await f.service.setEnabled(false); assert.equal(f.service.getEndpointState().reason, "CLEANUP_INCOMPLETE");
  await f.service.setEnabled(true); assert.equal(f.servers.length, 1);
  assert.equal(f.calls.filter(c=>c[0] === "native").length, 1); assert.ok(attempts >= 2);
  failCleanup = false; await f.service.setEnabled(true); assert.equal(f.servers.length, 2);
  assert.equal(f.service.diagnostics().cleanupBlocked, false); await close(f);
});


test("enablement publishes no disabled constructor snapshot before its first listening state", async () => {
  const f = fixture(); await f.service.initialize();
  const begin = f.events.length; await f.service.setEnabled(true);
  assert.deepEqual(f.events.slice(begin).filter(e=>e.kind === "endpoint").map(e=>e.state), ["starting", "listening"]);
  await close(f);
});
test("status that expires during its snapshot never presents a null latest record", async () => {
  let current = 1000000, reads = 0, advanceAt = Infinity;
  const f = fixture({deps:{now:()=>{if (++reads === advanceAt) current += 86400001; return current;}}});
  f.register(); await f.start();
  f.service.onChange(event=>{if(event.kind === "activity") advanceAt = reads + 1;});
  const c = f.connect(); c.receive(encode(hello("axiosozo-notify"))); c.receive(encode(hook())); await c.end();
  assert.equal(c.messages.at(-1).matched, true); assert.equal(f.notifications.length, 0);
  assert.equal(f.service.listActivity().length, 0); await close(f);
});


test("async hook verification cannot publish a stale binding after disable and re-enable", async () => {
  const verified = deferred();
  const f = fixture({ deps: { buildHookConfig: () => verified.promise } });
  await f.start();
  const snippet = f.service.getHookConfig("codex");
  const refused = assert.rejects(snippet, e => e.code === "ENDPOINT_UNAVAILABLE");
  await flush(); await f.service.setEnabled(false); await f.service.setEnabled(true);
  verified.resolve("old socket configuration"); await refused; await close(f);
});

test("hook verification is bounded and rejects malformed or oversized output", async () => {
  for (const result of [null, {}, "x".repeat(AGENT_SERVICE_LIMITS.configBytes + 1)]) {
    const f = fixture({ deps: { buildHookConfig: async () => result } });
    await f.start(); await assert.rejects(f.service.getHookConfig("codex"), e => e.code === "CONFIG_UNAVAILABLE");
    await close(f);
  }
  const f = fixture({ deps: { buildHookConfig: () => new Promise(() => {}) } });
  await f.start(); const pending = f.service.getHookConfig("codex");
  const refused = assert.rejects(pending, e => e.code === "TIMEOUT");
  await flush(); await f.clock.tick(AGENT_SERVICE_LIMITS.nativeConfigMs); await refused; await close(f);
});


test("diagnostics preserve terminal owned receipts without repeating cleanup or native admission", async () => {
  let waited = 0, reads = 0;
  const f = fixture({ deps: { createNativeConfiguration: async () => ({
    socketPath: "/synthetic/profd/.a/s", exactPosixBackend: {},
    close: async () => { waited = 1; },
    ownershipDiagnostics: () => { reads++; return { native_config_verified: true,
      lock_helpers: { helper_spawned: 1, helper_wait_completed: waited, helper_outstanding: 1 - waited } }; },
  }) } });
  await f.start();
  assert.equal(f.service.diagnostics().ownership.active, true);
  await f.service.setEnabled(false);
  const calls = f.calls.length, beforeReads = reads;
  const first = f.service.diagnostics().ownership;
  assert.equal(first.active, false);
  assert.equal(first.configuration.lock_helpers.helper_wait_completed, 1);
  assert.equal(first.configuration.lock_helpers.helper_outstanding, 0);
  assert.strictEqual(f.service.diagnostics().ownership, first);
  assert.equal(reads, beforeReads); assert.equal(f.calls.length, calls);
  await close(f);
});
