import test from "node:test";
import assert from "node:assert/strict";
import { AgentChannelController, CHANNEL_LIMITS, projectForPath } from "../chrome/AgentChannelCore.sys.mjs";
import { parseHookEvent } from "../../../packages/contexts/src/agent-status.mjs";

const encode = value => new TextEncoder().encode(`${JSON.stringify(value)}\n`);
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(value => { resolve = value; }); return { promise, resolve }; };
class Clock {
  at = 1000000;
  next = 0;
  timers = new Map();
  now = () => this.at;
  setTimeout = (fn, wait) => { const id = ++this.next; this.timers.set(id, { at: this.at + wait, fn }); return id; };
  clearTimeout = id => this.timers.delete(id);
  async tick(ms) {
    const end = this.at + ms;
    for (;;) {
      const next = [...this.timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
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
function fixture(overrides = {}) {
  const clock = new Clock(), statuses = [], approvals = [], actions = [], effects = [];
  const projects = [{ id: "p_harbor", root: "/synthetic/harbor", manifest: {
    name: "Harbor", environments: [{ name: "local", base_url: "http://localhost:4450/", app: "web" }],
  }, accounts: [{ key: "github.com", label: "NEVER_EXPORT" }], detected: { integrations: [{ id: "convex", name: "Convex", sources: ["SECRET"] }] } }];
  const tabs = [{ tab_id: "t_1", url: "http://localhost:4450/", title: "Fixture", active: true,
    project_id: "p_harbor", engine: "gecko", private: false, document_id: "doc1", account: "NEVER_EXPORT" }];
  let sequence = 0;
  const runtime = {
    now: clock.now, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout,
    randomHex: () => (++sequence).toString(16).padStart(16, "0"), getProjects: () => projects, parseHookEvent,
    onStatus: (record, project) => statuses.push({ record, project }),
    requestApproval: (session, options) => { const pending = deferred(); approvals.push({ session, options, ...pending }); return pending.promise; },
    confirmAction: (action, options) => { const pending = deferred(); actions.push({ action, options, ...pending }); return pending.promise; },
    listTabs: () => tabs, getTab: id => tabs.find(tab => tab.tab_id === id),
    isSensitiveHost: host => host === "blocked.invalid",
    executeMethod: (method, params, session, options) => { effects.push({ method, params, session, options }); return { tab_id: "t_2" }; },
    ...overrides,
  };
  const controller = new AgentChannelController(runtime);
  const connections = [];
  const connect = (options = {}) => {
    const messages = [], closes = [];
    const endpoint = controller.accept({
      write(bytes) { if (options.brokenWrite) throw new Error(); messages.push(JSON.parse(new TextDecoder().decode(bytes))); },
      close(code) { closes.push(code); },
    });
    const connection = { ...endpoint, messages, closes };
    connections.push(connection);
    return connection;
  };
  return { controller, runtime, clock, projects, tabs, statuses, approvals, actions, effects, connect, connections };
}
const hello = (name = "agent-bridge", cwd = "/synthetic/harbor") => ({ v: 1, type: "hello",
  client: { name, agent: "claude-code", version: "1" }, cwd, pid: 123 });
const hook = (changes = {}) => ({ v: 1, type: "hook", source: "claude-code", event: "Stop", cwd: "/synthetic/harbor",
  payload: { cwd: "/synthetic/harbor", session_id: "opaque" }, ...changes });
const request = (connection, id, method = "tabs.list", params = {}) => connection.receive(encode({ v: 1, id, method, params }));
async function approved(f, cwd) {
  const c = f.connect(); c.receive(encode(hello("agent-bridge", cwd))); await flush();
  f.approvals.at(-1).resolve(true); await flush(); return c;
}

test('passive authority read accepts only primitive IDs and invokes no runtime callbacks',async()=>{
  const f=fixture();let callbacks=0;
  const c=f.connect();c.receive(encode(hello()));await flush();f.approvals.at(-1).resolve(true);await flush();
  f.runtime.onStateChange=()=>callbacks++;
  const coercible={toString(){assert.fail('ID coercion');}};
  for(const id of [null,{},coercible,new String(c.session),'',c.session+'x','s_'+ 'A'.repeat(16)])assert.equal(f.controller.isApprovedBridgeSession(id),false);
  assert.equal(f.controller.isApprovedBridgeSession(c.session),true);assert.equal(callbacks,0);f.controller.stop();
});
test('private checker refuses hello pending denied hook revoked and stopped states',async()=>{
  const f=fixture(),c=f.connect();assert.equal(f.controller.isApprovedBridgeSession(c.session),false);
  c.receive(encode(hello()));await flush();assert.equal(f.controller.isApprovedBridgeSession(c.session),false);
  f.approvals.at(-1).resolve(false);await flush();assert.equal(f.controller.isApprovedBridgeSession(c.session),false);
  const hookClient=f.connect();hookClient.receive(encode(hello('axiosozo-notify')));await flush();assert.equal(f.controller.isApprovedBridgeSession(hookClient.session),false);
  const granted=await approved(f);assert.equal(f.controller.isApprovedBridgeSession(granted.session),true);
  f.controller.revoke(granted.session);assert.equal(f.controller.isApprovedBridgeSession(granted.session),false);
  const stopped=await approved(f);f.controller.stop();assert.equal(f.controller.isApprovedBridgeSession(stopped.session),false);
});
test('null-project approved bridge sessions are valid independently of presentation filtering',async()=>{
  const f=fixture(),c=await approved(f,'/synthetic/outside');
  assert.equal(f.controller.sessions.find(s=>s.session===c.session).project_id,null);
  assert.equal(f.controller.isApprovedBridgeSession(c.session),true);f.controller.stop();
});
test('EOF while a genuine read job drains rejects authority despite approved public snapshot',async()=>{
  const late=deferred();const f=fixture({executeMethod:()=>late.promise}),c=await approved(f);
  request(c,1,'console.errors',{tab_id:'t_1'});await flush();const ending=c.end();
  assert.equal(f.controller.sessions.find(s=>s.session===c.session).state,'approved');
  assert.equal(f.controller.isApprovedBridgeSession(c.session),false);
  late.resolve([]);await ending;assert.equal(f.controller.sessions.length,0);
});
test('EOF before late approval cannot create capture authority',async()=>{
  const f=fixture(),c=f.connect();c.receive(encode(hello()));await flush();const ending=c.end();
  f.approvals.at(-1).resolve(true);await ending;assert.equal(f.controller.isApprovedBridgeSession(c.session),false);
});
test('synchronous approved-state observer revocation prevents authority publication',async()=>{
  let controller;const f=fixture({onStateChange:event=>{if(event.state==='approved')controller.revoke(event.session);}});controller=f.controller;
  const c=await approved(f);assert.equal(controller.isApprovedBridgeSession(c.session),false);assert.equal(controller.sessions.length,0);
});

test('list and active receive exact frozen approved view and request AbortSignal without wire extras',async()=>{
  const rows=[];let tabs;const f=fixture({listTabs:(view,controls)=>{rows.push({view,controls});return tabs;}});tabs=f.tabs;const c=await approved(f);
  request(c,1,'tabs.list',{});request(c,2,'tabs.active',{});await flush();
  assert.equal(rows.length,2);for(const {view,controls} of rows){
    assert.deepEqual(view,{session:c.session,project_id:'p_harbor',client:{name:'agent-bridge',agent:'claude-code',version:'1'},state:'approved'});
    assert(Object.isFrozen(view));assert(Object.isFrozen(view.client));assert.deepEqual(Object.keys(controls),['signal']);assert(controls.signal instanceof AbortSignal);assert.equal(controls.signal.aborted,false);
  }
  assert.notEqual(rows[0].controls.signal,rows[1].controls.signal);
  for(const message of c.messages.filter(v=>Object.hasOwn(v,'id')))assert.deepEqual(Object.keys(message).sort(),['id','result','v']);f.controller.stop();
});
test('getTab receives same live request signal and fresh frozen approved view before and after action approval',async()=>{
  const rows=[];let tab;const f=fixture({getTab:(id,view,controls)=>{rows.push({id,view,controls});return tab;}});tab=f.tabs[0];const c=await approved(f);
  request(c,1,'page.click',{tab_id:'t_1',selector:'button'});await flush();assert.equal(rows.length,1);
  assert.equal(rows[0].controls.signal,f.actions[0].options.signal);assert.equal(rows[0].controls.signal.aborted,false);
  f.actions[0].resolve(true);await flush();assert.equal(rows.length,2);assert.notEqual(rows[0].view,rows[1].view);
  for(const row of rows){assert.equal(row.id,'t_1');assert.equal(row.view.session,c.session);assert.equal(row.view.state,'approved');assert(Object.isFrozen(row.view));assert(Object.isFrozen(row.view.client));assert.deepEqual(Object.keys(row.controls),['signal']);}
  assert.equal(rows[0].controls.signal,rows[1].controls.signal);assert.equal(f.effects.length,1);f.controller.stop();
});
test('revocation while action approval waits aborts metadata context and prevents second native read',async()=>{
  const rows=[];let tab;const f=fixture({getTab:(id,view,controls)=>{rows.push({id,view,controls});return tab;}});tab=f.tabs[0];const c=await approved(f);
  request(c,1,'page.click',{tab_id:'t_1',selector:'button'});await flush();f.controller.revoke(c.session);
  assert.equal(rows[0].controls.signal.aborted,true);f.actions[0].resolve(true);await flush();assert.equal(rows.length,1);assert.equal(f.effects.length,0);
});
test('synchronous availability revocation is refused before any injected metadata read',async()=>{
  let controller,collections=0;const f=fixture({isMethodAvailable:()=>{controller.revoke(c.session);return true;},listTabs:()=>{collections++;return[];}});controller=f.controller;const c=await approved(f);
  request(c,1,'tabs.list',{});await flush();assert.equal(collections,0);assert.equal(controller.sessions.length,0);
});
