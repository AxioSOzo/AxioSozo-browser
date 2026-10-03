import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { manifest } from "../../../packages/contexts/tests/samples.mjs";
import "./support/chrome-modules.mjs";
const { createAgentChannelService, AGENT_SERVICE_LIMITS } = await import("../chrome/AgentChannelService.sys.mjs");

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

const bridge = options => fixture({ ...options, deps: { buildBridgeConfig({agent,socketPath}) {
  return JSON.stringify({agent,socketPath}); }, ...options?.deps } });
test('bridge constructor/default off cannot call generator or native admission', async () => {
  let calls=0;const f=bridge({deps:{buildBridgeConfig(){calls++;}}});
  await assert.rejects(f.service.getBridgeConfig('codex'),{code:'ENDPOINT_UNAVAILABLE'});
  assert.equal(calls,0);assert.equal(f.calls.length,0);await close(f);
});
test('bridge allowlist is literal and rejects before any generator call', async () => {
  let calls=0;const f=bridge({deps:{buildBridgeConfig(){calls++;}}});await f.start();
  for(const agent of ['other','claude','Codex',null,{},()=> 'codex'])
    await assert.rejects(f.service.getBridgeConfig(agent),{code:'INVALID_INPUT'});
  assert.equal(calls,0);await close(f);
});
test('listening bridge generation receives only verified agent/socket binding', async () => {
  const inputs=[];const f=bridge({deps:{buildBridgeConfig(input){inputs.push(input);return 'literal verified snippet';}}});await f.start();
  assert.equal(await f.service.getBridgeConfig('claude-code'),'literal verified snippet');
  assert.deepEqual(inputs,[{agent:'claude-code',socketPath:'/synthetic/profd/.a/s'}]);
  assert.equal(f.servers.length,1);assert.equal(f.service.listSessions().length,0);
  assert.equal(JSON.parse(await f.service.getHookConfig('codex')).socketPath,'/synthetic/profd/.a/s');await close(f);
});
test('absent bridge builder is CONFIG_UNAVAILABLE while existing hooks still work', async () => {
  const f=fixture();await f.start();await assert.rejects(f.service.getBridgeConfig('codex'),{code:'CONFIG_UNAVAILABLE'});
  assert.equal(JSON.parse(await f.service.getHookConfig('codex')).agent,'codex');await close(f);
});
test('bridge disable in the first microtask performs zero builder calls', async () => {
  let calls=0;const f=bridge({deps:{buildBridgeConfig(){calls++;return 'snippet';}}});await f.start();
  const pending=f.service.getBridgeConfig('codex');const refused=assert.rejects(pending,{code:'ENDPOINT_UNAVAILABLE'});
  await f.service.setEnabled(false);await refused;assert.equal(calls,0);await close(f);
});
test('bridge disable/re-enable ABA discards old same-path snippet', async () => {
  const late=deferred();const f=bridge({deps:{buildBridgeConfig:()=>late.promise}});await f.start();
  const pending=f.service.getBridgeConfig('codex');const refused=assert.rejects(pending,{code:'ENDPOINT_UNAVAILABLE'});
  await flush();await f.service.setEnabled(false);await f.service.setEnabled(true);late.resolve('old same-path binding');await refused;
  assert.equal(f.servers.length,2);await close(f);
});
test('actual endpoint stop/lost listening rejects pending bridge snippet', async () => {
  const late=deferred();const f=bridge({deps:{buildBridgeConfig:()=>late.promise}});await f.start();
  const pending=f.service.getBridgeConfig('codex');const refused=assert.rejects(pending,{code:'ENDPOINT_UNAVAILABLE'});
  await flush();f.servers[0].close();await flush();late.resolve('stale endpoint');await refused;await close(f);
});
test('shutdown abort rejects hanging bridge verification and drops late success', async () => {
  const late=deferred();const f=bridge({deps:{buildBridgeConfig:()=>late.promise}});await f.start();
  const pending=f.service.getBridgeConfig('codex');const refused=assert.rejects(pending,{code:'ENDPOINT_UNAVAILABLE'});
  await flush();await f.service.close();await refused;late.resolve('after shutdown');await flush();assert.equal(f.clock.timers.size,0);
});
test('bridge captures exact immutable path and refuses a mutable injected config swap', async () => {
  const config={socketPath:'/synthetic/profd/.a/s',exactPosixBackend:{}};const late=deferred();
  const f=bridge({deps:{createNativeConfiguration:async()=>config,buildBridgeConfig:()=>late.promise}});await f.start();
  const pending=f.service.getBridgeConfig('codex');const refused=assert.rejects(pending,{code:'ENDPOINT_UNAVAILABLE'});
  await flush();config.socketPath='/synthetic/changed/.a/s';late.resolve('old socket');await refused;await close(f);
});
test('bridge bounds UTF-8 bytes and refuses malformed/empty generated output', async () => {
  for(const value of [null,{},'',42,'x'.repeat(AGENT_SERVICE_LIMITS.configBytes+1),'🎨'.repeat(AGENT_SERVICE_LIMITS.configBytes/4+1)]){
    const f=bridge({deps:{buildBridgeConfig:async()=>value}});await f.start();
    await assert.rejects(f.service.getBridgeConfig('codex'),{code:'CONFIG_UNAVAILABLE'});await close(f);
  }
  const f=bridge({deps:{buildBridgeConfig:async()=> 'x'.repeat(AGENT_SERVICE_LIMITS.configBytes)}});await f.start();
  assert.equal((await f.service.getBridgeConfig('codex')).length,AGENT_SERVICE_LIMITS.configBytes);await close(f);
});
test('bridge deadline remains bounded and late output cannot revive it', async () => {
  const late=deferred();const f=bridge({deps:{buildBridgeConfig:()=>late.promise}});await f.start();
  const pending=f.service.getBridgeConfig('codex');const refused=assert.rejects(pending,{code:'TIMEOUT'});
  await flush();await f.clock.tick(AGENT_SERVICE_LIMITS.nativeConfigMs);await refused;late.resolve('late');await flush();await close(f);
});
test('bridge private generator exceptions become a fixed configuration error', async () => {
  const f=bridge({deps:{buildBridgeConfig(){throw Error('invented private diagnostic');}}});await f.start();
  await assert.rejects(f.service.getBridgeConfig('codex'),e=>e.code==='CONFIG_UNAVAILABLE'&&e.message===e.code);await close(f);
});

test('service approval predicate defaults false and validates primitive session IDs passively',async()=>{
  const f=fixture();for(const id of [null,{},new String('s_'+ '1'.repeat(16)),'s_'+ '1'.repeat(16)])assert.equal(f.service.isApprovedBridgeSession(id),false);
  assert.equal(f.calls.length,0);await close(f);
});
test('service approval predicate gates actual Core approval and immediate revocation',async()=>{
  const f=fixture();f.register();await f.start();const c=f.connect();
  c.receive(encode(hello()));await flush();assert.equal(f.service.isApprovedBridgeSession(c.session),false);
  f.approvals.at(-1).resolve(true);await flush();assert.equal(f.service.isApprovedBridgeSession(c.session),true);
  assert.equal(f.service.revokeSession('p_harbor',c.session),true);assert.equal(f.service.isApprovedBridgeSession(c.session),false);await close(f);
});
test('service approval predicate fails immediately at disable project invalidation or shutdown',async()=>{
  for(const revoke of [f=>f.service.setEnabled(false),f=>f.service.invalidateProjects(),f=>f.service.close()]){
    const f=fixture();f.register();await f.start();const c=await f.approved();assert.equal(f.service.isApprovedBridgeSession(c.session),true);
    const pending=revoke(f);assert.equal(f.service.isApprovedBridgeSession(c.session),false);await pending;await close(f);
  }
});
test('service preserves known-project approval policy and cannot grant null-project sessions',async()=>{
  const f=fixture();f.register();await f.start();const c=f.connect();c.receive(encode(hello('agent-bridge','/synthetic/outside')));await flush();
  assert.equal(f.approvals.length,0);assert.equal(f.controller().sessions.find(s=>s.session===c.session).project_id,null);
  assert.equal(f.service.isApprovedBridgeSession(c.session),false);assert.deepEqual(f.service.listSessions(),[]);await close(f);
});
test('service ignores copied sessions snapshots as authority and rechecks after accessor reentrancy',async()=>{
  const f=fixture();f.register();await f.start();const c=await f.approved();
  const controller=f.controller();controller.isApprovedBridgeSession=()=>{f.service.setEnabled(false);return true;};
  assert.equal(f.service.isApprovedBridgeSession(c.session),false);await close(f);
});
test('service refuses public approved state once EOF is draining an outstanding read',async()=>{
  const late=deferred();const f=fixture();f.register();await f.start();
  f.service.installTools({isMethodAvailable:()=>true,getTab:()=>({tab_id:'t_1',url:'http://localhost:4450/',project_id:'p_harbor',engine:'gecko',document_id:'doc1',private:false}),executeMethod:()=>late.promise});
  const c=await f.approved();c.receive(encode({v:1,id:1,method:'console.errors',params:{tab_id:'t_1'}}));await flush();const ending=c.end();
  assert.equal(f.controller().sessions.find(s=>s.session===c.session).state,'approved');assert.equal(f.service.isApprovedBridgeSession(c.session),false);
  late.resolve([]);await ending;await close(f);
});

test('bridge cache invalidation and same-cache refresh cannot revive an old generated binding',async()=>{
  const late=deferred();let calls=0;const f=bridge({deps:{buildBridgeConfig:()=>{calls++;return late.promise;}}});await f.start();
  const pending=f.service.getBridgeConfig('codex');const refused=assert.rejects(pending,{code:'ENDPOINT_UNAVAILABLE'});await flush();
  f.service.invalidateProjects();await assert.rejects(f.service.getBridgeConfig('codex'),{code:'ENDPOINT_UNAVAILABLE'});
  await f.service.refreshProjects();late.resolve('before cache invalidation');await refused;assert.equal(calls,1);await close(f);
});

test('service forwards frozen approved metadata context and exact request signal to installed tools',async()=>{
  const rows=[];const f=fixture();f.register();await f.start();
  f.service.installTools({isMethodAvailable:()=>true,listTabs:(...args)=>{rows.push(['list',...args]);return[];},getTab:(...args)=>{rows.push(['get',...args]);return{tab_id:'t_1',url:'http://localhost:4450/',engine:'gecko',project_id:'p_harbor',private:false};},executeMethod:()=>[]});
  const c=await f.approved();c.receive(encode({v:1,id:1,method:'tabs.list',params:{}}));c.receive(encode({v:1,id:2,method:'console.errors',params:{tab_id:'t_1'}}));await flush();
  assert.equal(rows.length,2);for(const row of rows){const view=row.at(-2),controls=row.at(-1);assert.equal(view.session,c.session);assert.equal(view.state,'approved');assert(Object.isFrozen(view));assert(controls.signal instanceof AbortSignal);assert.deepEqual(Object.keys(controls),['signal']);}
  assert.equal(rows[1][1],'t_1');await close(f);
});
