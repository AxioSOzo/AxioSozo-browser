import test from 'node:test';
import assert from 'node:assert/strict';
import { createTerminalHandoff } from '../chrome/TerminalHandoff.sys.mjs';
import { buildHandoffContext } from '../chrome/AgentHandoff.sys.mjs';
const context = () => buildHandoffContext({ request_id: 'hf_0123456789abcdef', created_at: 1000,
  tab: { tab_id: 't_1', navigation_id: 'nav1', url: 'http://localhost:8432/path', is_private: false, blocked_category: false, password_risk: false,
    project: { id: 'p_harbor', root: '/Volumes/T9/Code/harbor-suite' } }, task: '`$(touch /never)` task',
  capture: { tab_id: 't_1', navigation_id: 'nav1', url: 'http://localhost:8432/path', title: 'Fake page', selection: null, screen: null, console_errors: [] } },
  { isSensitiveHost: () => ({ sensitive: false }) });
const input = (extra = {}) => ({ agent: 'codex', context: context(), test_only: true,
  configuration: { helper: '/owned/terminal_handoff.py', policy: '/owned/private-policy.json' }, ...extra });
function fake({ output = JSON.stringify({ version: 1, status: 'handed_off', agent: 'fake', may_have_launched: true, launch_id: 'a'.repeat(32) }), exitCode = 0,
  writeFailure = false, delayedSpawn = null, hangRead = false } = {}) {
  const calls = [], writes = []; let read = false;
  const child = { stdin: { write: async data => { writes.push(data); if (writeFailure) throw Error('secret'); }, close: async () => { calls.push('close'); } },
    stdout: { read: async (...args) => { assert.deepEqual(args, []); if (hangRead) return new Promise(() => {}); if (read) return new ArrayBuffer(0); read = true; return new TextEncoder().encode(output).buffer; } },
    stderr: { read: async () => new ArrayBuffer(0) }, wait: async () => ({ exitCode }), kill: async () => { calls.push('kill'); } };
  const timers = { setTimeout, clearTimeout };
  const runtime = { timers, spawn: async options => { calls.push(options); if (delayedSpawn) await delayedSpawn; return child; } };
  return { runtime, calls, writes, child };
}
test('fake fixture uses fixed interpreter/argv and context stdin with no inherited environment', async () => {
  const f = fake(); const service = createTerminalHandoff({ runtime: f.runtime, verifyConfiguration: () => true });
  const receipt = await service.launch(input()); assert.equal(receipt.status, 'handed_off'); assert.equal(receipt.agent, 'fake');
  const spawn = f.calls[0]; assert.equal(spawn.command, '/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11'); assert.deepEqual(spawn.arguments, ['-I','-S','-B','/owned/terminal_handoff.py','--policy','/owned/private-policy.json']);
  assert.equal(spawn.environmentAppend, false); assert.deepEqual(spawn.environment, { PATH: '/usr/bin:/bin', LANG: 'C' });
  const request = JSON.parse(f.writes[0]); assert.equal(request.agent, 'fake'); assert.equal(request.live_authorized, false); assert.equal(request.context.task, '`$(touch /never)` task');
  assert(!spawn.arguments.some(arg => arg.includes('touch'))); assert.equal(service.diagnostics().active, 0);
});
test('live product, unverified policy and hostile paths cause zero spawn', async () => {
  for (const patch of [{ test_only: false }, { agent: 'other' }, { configuration: { helper: '/owned/../evil', policy: '/owned/policy' } },
    { configuration: { helper: '/owned/helper', policy: '/owned/policy', command: '/bad' } }]) {
    const f = fake(); const s = createTerminalHandoff({ runtime: f.runtime, verifyConfiguration: () => true }); assert.notEqual((await s.launch(input(patch))).status, 'handed_off'); assert.equal(f.calls.length, 0);
  }
  const f = fake(); const s = createTerminalHandoff({ runtime: f.runtime }); assert.equal((await s.launch(input())).reason, 'INVALID_POLICY'); assert.equal(f.calls.length, 0);
});
test('only a strict categorical receipt and matching success exit acknowledges the terminal', async () => {
  for (const output of ['secret\n', '{}', JSON.stringify({ version:1,status:'handed_off',agent:'codex',may_have_launched:true,launch_id:'a'.repeat(32) }),
    JSON.stringify({ version:1,status:'handed_off',agent:'fake',may_have_launched:true,launch_id:'a'.repeat(32), secret:'no' })]) {
    const f = fake({ output }); const s = createTerminalHandoff({ runtime:f.runtime, verifyConfiguration:()=>true }); const receipt = await s.launch(input());
    assert.equal(receipt.reason,'LAUNCH_UNCERTAIN'); assert.equal(receipt.may_have_launched,true); assert(f.calls.includes('kill'));
  }
  const f = fake({exitCode:1}); assert.equal((await createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>true}).launch(input())).reason,'LAUNCH_UNCERTAIN');
});
test('authoritative pre-launch denial permits fallback and arbitrary errors never do', async () => {
  const output = JSON.stringify({version:1,status:'denied',reason:'NOT_AUTHORIZED',may_have_launched:false});
  const f = fake({output,exitCode:1}); const r=await createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>true}).launch(input()); assert.equal(r.reason,'NOT_AUTHORIZED'); assert.equal(r.may_have_launched,false);
  const g=fake({output:JSON.stringify({version:1,status:'denied',reason:'secret stderr',may_have_launched:false}),exitCode:1});
  assert.equal((await createTerminalHandoff({runtime:g.runtime,verifyConfiguration:()=>true}).launch(input())).reason,'LAUNCH_UNCERTAIN');
});
test('partial write and excessive output are ambiguous and cancel only the owned helper', async () => {
  for (const options of [{writeFailure:true},{output:'x'.repeat(16385)}]) {
    const f=fake(options); const r=await createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>true}).launch(input());
    assert.equal(r.reason,'LAUNCH_UNCERTAIN'); assert.equal(r.may_have_launched,true); assert(f.calls.includes('kill'));
  }
});
test('abort while policy verification is pending does not spawn', async () => {
  let finish; const policy=new Promise(resolve=>{finish=resolve;}); const c=new AbortController(); const f=fake();
  const s=createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>policy}); const pending=s.launch(input({signal:c.signal})); c.abort(); finish(true);
  assert.equal((await pending).reason,'CANCELLED'); assert.equal(f.calls.length,0);
});
test('abort during spawn cleans up a late child before any context is sent', async () => {
  let finish; const spawn=new Promise(resolve=>{finish=resolve;}); const c=new AbortController(); const f=fake({delayedSpawn:spawn});
  const s=createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>true}); const pending=s.launch(input({signal:c.signal}));
  await new Promise(resolve=>setImmediate(resolve)); c.abort(); const r=await pending; assert.equal(r.reason,'CANCELLED'); assert.equal(r.may_have_launched,false);
  finish(); await new Promise(resolve=>setImmediate(resolve)); assert(f.calls.includes('kill')); assert.equal(f.writes.length,0);
});
test('closing after stdin transmission returns uncertainty and terminates owned helper', async () => {
  const f=fake({hangRead:true}); const s=createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>true}); const pending=s.launch(input());
  await new Promise(resolve=>setImmediate(resolve)); s.close(); const r=await pending; assert.equal(r.reason,'LAUNCH_UNCERTAIN'); assert.equal(r.may_have_launched,true); assert(f.calls.includes('kill'));
  assert.equal((await s.launch(input())).reason,'CANCELLED');
});

test('abort and close immediately resolve a verification that never completes', async () => {
  for (const operation of ['abort', 'close']) {
    const f=fake(); const c=new AbortController(); const s=createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>new Promise(()=>{})});
    const pending=s.launch(input({signal:c.signal}));
    if (operation==='abort') c.abort(); else s.close();
    assert.equal((await pending).reason,'CANCELLED'); assert.equal(f.calls.length,0); assert.equal(s.diagnostics().active,0);
  }
});
test('verification timeout and fixture concurrency are bounded', async () => {
  const f=fake(); const timers=[]; f.runtime.timers={setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout:()=>{}};
  const s=createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>new Promise(()=>{})});
  const requests=Array.from({length:8},()=>s.launch(input())); assert.equal((await s.launch(input())).reason,'BUSY');
  assert(timers.every(timer=>timer.delay===30000)); timers.forEach(timer=>timer.fn());
  const receipts=await Promise.all(requests); assert(receipts.every(receipt=>receipt.reason==='TIMEOUT'&&receipt.may_have_launched===false)); assert.equal(f.calls.length,0);
});

test('a hanging stdin close never blocks failed-launch cleanup or late-spawn termination', async () => {
  const f=fake({writeFailure:true}); f.child.stdin.close=()=>new Promise(()=>{});
  const s=createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>true}); const receipt=await s.launch(input());
  assert.equal(receipt.reason,'LAUNCH_UNCERTAIN'); assert(f.calls.includes('kill')); assert.equal(s.diagnostics().active,0);
  let release; const spawn=new Promise(resolve=>{release=resolve;}); const g=fake({delayedSpawn:spawn});
  g.child.stdin.close=()=>new Promise(()=>{}); const controller=new AbortController();
  const t=createTerminalHandoff({runtime:g.runtime,verifyConfiguration:()=>true}); const pending=t.launch(input({signal:controller.signal}));
  await new Promise(resolve=>setImmediate(resolve)); controller.abort(); await pending; release();
  await new Promise(resolve=>setImmediate(resolve)); assert(g.calls.includes('kill')); assert.equal(g.writes.length,0);
});
test('owned wait cleanup has a bound even if the primitive never resolves', async () => {
  const f=fake({writeFailure:true}); const timers=[];
  f.child.wait=()=>new Promise(()=>{}); f.runtime.timers={setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout:()=>{}};
  const s=createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>true}); const pending=s.launch(input());
  await new Promise(resolve=>setImmediate(resolve)); assert(f.calls.includes('kill'));
  assert.equal(timers.at(-1).delay,1500); timers.at(-1).fn(); const receipt=await pending;
  assert.equal(receipt.reason,'LAUNCH_UNCERTAIN'); assert.equal(s.diagnostics().active,0);
});
