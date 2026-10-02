import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeTerminalHandoffFixture, terminalHandoffFixturePaths, createTerminalPolicyVerifier,
  TERMINAL_HANDOFF_SHA256, TERMINAL_HANDOFF_FAKE_SHA256 } from '../chrome/TerminalHandoffConfig.sys.mjs';
import { TERMINAL_HANDOFF_PYTHON } from '../chrome/TerminalHandoff.sys.mjs';
import { buildHandoffContext } from '../chrome/AgentHandoff.sys.mjs';
const identity='e'.repeat(32), root=`/Volumes/AxioSozoBuild/workstation/handoff-terminal/config-${identity}`;
const profile=`/Volumes/AxioSozoBuild/workstation/runtime/1234567890abcdef/plan4-handoff-${identity}/gecko`;
const paths=terminalHandoffFixturePaths(root,profile), policyHash='d'.repeat(64);
const unavailable=e=>e.code==='TERMINAL_FIXTURE_UNAVAILABLE'&&e.message==='TERMINAL_FIXTURE_UNAVAILABLE';
const receipt=()=>({version:1,status:'verified',policy_sha256:policyHash,fixture_sha256:TERMINAL_HANDOFF_FAKE_SHA256});
const context=()=>buildHandoffContext({request_id:'hf_0123456789abcdef',created_at:1000,
 tab:{tab_id:'t_1',navigation_id:'n1',url:'http://localhost:8212/',is_private:false,blocked_category:false,password_risk:false,
 project:{id:'p_harbor',root:paths.projectsRoot+'/harbor-suite'}},task:'Synthetic fixture',
 capture:{tab_id:'t_1',navigation_id:'n1',url:'http://localhost:8212/',title:'Fixture',selection:null,screen:null,console_errors:[]}},
 {isSensitiveHost:()=>({sensitive:false})});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fake(){
 const env={AXIOSOZO_SYNTHETIC_TEST:'1',AXIOSOZO_HANDOFF_GUI_FIXTURE:'1',AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT:root};
 const calls=[],checks=[],hashes=[],verifications=[];let prof=profile;
 const native={env:name=>env[name],profilePath:()=>prof,timers:{setTimeout,clearTimeout},
  verifyFile:async(path,options)=>{checks.push({path,options});return true;},
  sha256:async path=>{hashes.push(path);return path===paths.helper?TERMINAL_HANDOFF_SHA256:path===paths.fixture?TERMINAL_HANDOFF_FAKE_SHA256:policyHash;},
  verifyPolicy:async control=>{verifications.push(control);assert.equal(control.isActive(),true);return receipt();},
  spawn:async options=>{calls.push(options);let read=false;return {stdin:{write:async()=>{},close:async()=>{}},
   stdout:{read:async(...args)=>{assert.deepEqual(args, []);if(read)return new ArrayBuffer(0);read=true;return new TextEncoder().encode(JSON.stringify({version:1,status:'handed_off',agent:'fake',may_have_launched:true,launch_id:'a'.repeat(32)})).buffer;}},
   stderr:{read:async()=>new ArrayBuffer(0)},wait:async()=>({exitCode:0}),kill:async()=>{}};}};
 return{native,env,calls,checks,hashes,verifications,profile:value=>{prof=value;}};
}
const request=(fixture,patch={})=>({agent:'claude-code',context:context(),test_only:true,configuration:fixture.testOnlyLaunch,...patch});
test('absent fixture root disables fixture without files or processes even under SYN1',async()=>{
 for(const absent of [undefined,null,'']){const f=fake();f.env.AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT=absent;
 assert.equal(await createNativeTerminalHandoffFixture({runtime:f.native}),null);assert.equal(f.calls.length+f.checks.length+f.verifications.length,0);}
});
test('only exact synthetic config UUID and matching owned profile are admitted',async()=>{
 for(const patch of [{AXIOSOZO_SYNTHETIC_TEST:'0'},{AXIOSOZO_HANDOFF_GUI_FIXTURE:'0'},
 {AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT:root+'/nested'},{AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT:root.replace('workstation/','zen/')},
 {AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT:root.replace(identity,'E'.repeat(32))}]){
 const f=fake();Object.assign(f.env,patch);await assert.rejects(createNativeTerminalHandoffFixture({runtime:f.native}),unavailable);assert.equal(f.calls.length,0);}
 const f=fake();f.profile('/Users/synthetic/Library/profile');await assert.rejects(createNativeTerminalHandoffFixture({runtime:f.native}),unavailable);
 assert.equal(f.checks.length+f.calls.length,0);
});
test('factory pins interpreter, private helper and fixture hashes plus policy receipt',async()=>{
 const f=fake();const fixture=await createNativeTerminalHandoffFixture({runtime:f.native});
 assert.deepEqual(fixture.testOnlyLaunch,{helper:paths.helper,policy:paths.policy,mode:'terminal'});
 assert(Object.isFrozen(fixture.testOnlyLaunch));assert(f.checks.some(x=>x.path===TERMINAL_HANDOFF_PYTHON&&x.options.executable));
 assert(f.checks.some(x=>x.path===paths.helper&&x.options.mode===0o400&&x.options.links===1));
 assert(f.checks.some(x=>x.path===paths.fixture&&x.options.mode===0o600));
 assert.equal(f.verifications.length,1);assert.equal(f.calls.length,0);fixture.close();
});
test('metadata and hash results must be literal correct values',async()=>{
 for(const kind of ['truthy','mode','helper','fixture','policy','receipt']){const f=fake();
 if(kind==='truthy')f.native.verifyFile=async()=> 'true';else if(kind==='mode')f.native.verifyFile=async()=>false;
 else if(kind==='receipt')f.native.verifyPolicy=async()=>({...receipt(),extra:'refused'});
 else{const original=f.native.sha256;f.native.sha256=async path=>path===paths[kind]?'0'.repeat(64):original(path);}
 await assert.rejects(createNativeTerminalHandoffFixture({runtime:f.native}),unavailable);assert.equal(f.calls.length,0);}
});
test('launch can only dispatch the fixed fake policy and never a real target',async()=>{
 const f=fake();const fixture=await createNativeTerminalHandoffFixture({runtime:f.native});
 const r=await fixture.terminal.launch(request(fixture));assert.equal(r.status,'handed_off');assert.equal(r.agent,'fake');
 assert.equal(f.calls.length,1);assert.deepEqual(f.calls[0],{command:TERMINAL_HANDOFF_PYTHON,
 arguments:['-I','-S','-B',paths.helper,'--gui-policy',paths.policy,policyHash],environmentAppend:false,environment:{PATH:'/usr/bin:/bin',LANG:'C'},stderr:'pipe',workdir:'/'});
 const before=f.verifications.length;
 assert.equal((await fixture.terminal.launch(request(fixture,{test_only:false}))).reason,'NOT_AUTHORIZED');
 assert.equal(f.verifications.length,before);assert.equal(f.calls.length,1);fixture.close();
});
test('alternate caller configuration is rejected before native verification',async()=>{
 const f=fake();const fixture=await createNativeTerminalHandoffFixture({runtime:f.native});const before=f.verifications.length;
 for(const config of [{...fixture.testOnlyLaunch,helper:'/other/helper'},{...fixture.testOnlyLaunch,policy:'/other/policy'},
 {...fixture.testOnlyLaunch,mode:'headless'},{...fixture.testOnlyLaunch,command:'/bin/sh'}]){
 assert.equal((await fixture.terminal.launch(request(fixture,{configuration:config}))).reason,'INVALID_POLICY');}
 assert.equal(f.verifications.length,before);assert.equal(f.calls.length,0);fixture.close();
});
test('policy changes, profile changes or disabled flags cannot fall back to a real launcher',async()=>{
 for(const change of ['profile','root','flag','policy']){const f=fake();const fixture=await createNativeTerminalHandoffFixture({runtime:f.native});
 if(change==='profile')f.profile(profile.replace(identity,'b'.repeat(32)));else if(change==='root')f.env.AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT='';
 else if(change==='flag')f.env.AXIOSOZO_SYNTHETIC_TEST='0';else f.native.sha256=async()=> '0'.repeat(64);
 const result=await fixture.terminal.launch(request(fixture));assert.equal(result.reason,'INVALID_POLICY');assert.equal(f.calls.length,0);fixture.close();}
});
test('constructor deadline prevents late verification from exposing fixture',async()=>{
 const f=fake();let callback,release;f.native.timers={setTimeout:fn=>{callback=fn;return 1;},clearTimeout:()=>{}};
 f.native.verifyFile=()=>new Promise(resolve=>{release=resolve;});const pending=createNativeTerminalHandoffFixture({runtime:f.native});
 await tick();callback();await assert.rejects(pending,unavailable);release(true);await tick();assert.equal(f.verifications.length+f.calls.length,0);
});
test('constructor abort and admission identity change prevent late verifier dispatch',async()=>{
 for(const change of ['abort','profile','flag']){const f=fake(),controller=new AbortController();let release;
 f.native.verifyFile=()=>new Promise(resolve=>{release=resolve;});const pending=createNativeTerminalHandoffFixture({runtime:f.native,signal:controller.signal});await tick();
 if(change==='abort')controller.abort();else if(change==='profile')f.profile('/foreign');else f.env.AXIOSOZO_HANDOFF_GUI_FIXTURE='0';
 release(true);await assert.rejects(pending,unavailable);assert.equal(f.calls.length+f.verifications.length,0);}
});
test('cancelled or timed-out launch cannot spawn after policy verification resolves late',async()=>{
 for(const action of ['abort','close']){const f=fake();const fixture=await createNativeTerminalHandoffFixture({runtime:f.native});let release;
 f.native.verifyFile=()=>new Promise(resolve=>{release=resolve;});const controller=new AbortController();
 const pending=fixture.terminal.launch(request(fixture,{signal:controller.signal}));await tick();if(action==='abort')controller.abort();else fixture.close();
 assert.equal((await pending).reason,'CANCELLED');release(true);await tick();assert.equal(f.calls.length,0);fixture.close();}
});
test('admission is rechecked at dispatch even after initial launch verification',async()=>{
 const f=fake();let checks=0;
 const original=f.native.verifyPolicy;f.native.verifyPolicy=async control=>{checks++;const value=await original(control);if(checks===3)f.env.AXIOSOZO_HANDOFF_GUI_FIXTURE='0';return value;};
 const fixture=await createNativeTerminalHandoffFixture({runtime:f.native});
 const result=await fixture.terminal.launch(request(fixture));assert.equal(result.reason,'SPAWN_FAILED');assert.equal(f.calls.length,0);fixture.close();
});
function verifierNative({output=JSON.stringify(receipt()),exitCode=0,delayedSpawn=null,hangRead=false}={}){
 const calls=[];let read=false;
 const child={stdin:{close:async force=>{calls.push('close');calls.push({pipe:'stdin',force});}},stdout:{close:async force=>{calls.push({pipe:'stdout',force});},read:async(...args)=>{assert.deepEqual(args, []);calls.push('stdout-read');if(hangRead)return new Promise(()=>{});if(read)return new ArrayBuffer(0);read=true;return new TextEncoder().encode(output).buffer;}},
 stderr:{close:async force=>{calls.push({pipe:'stderr',force});},read:async(...args)=>{assert.deepEqual(args, []);calls.push('stderr-read');return new ArrayBuffer(0);}},wait:async()=>({exitCode}),kill:async timeout=>{calls.push('kill');calls.push({killTimeout:timeout});}};
 const native={timers:{setTimeout,clearTimeout},spawn:async options=>{calls.push(options);if(delayedSpawn)await delayedSpawn;return child;}};
 return{native,calls,child};
}
test('native policy verifier only runs fixed metadata operation and tiny strict receipts',async()=>{
 const f=verifierNative();assert.deepEqual(await createTerminalPolicyVerifier(f.native,paths)(),receipt());
 assert.deepEqual(f.calls[0].arguments,['-I','-S','-B',paths.helper,'--verify-policy',paths.policy]);
 assert.equal(f.calls[0].command,TERMINAL_HANDOFF_PYTHON);assert(!f.calls[0].arguments.includes('--policy'));
});
test('native policy verifier refuses malformed, leaking, oversized or unsuccessful receipts',async()=>{
 for(const options of [{output:'raw error'},{output:JSON.stringify({...receipt(),secret:'refused'})},{output:'a'.repeat(1025)},
 {exitCode:1},{output:JSON.stringify({...receipt(),fixture_sha256:'a'.repeat(64)})}]){
 const f=verifierNative(options);await assert.rejects(createTerminalPolicyVerifier(f.native,paths)(),unavailable);assert(f.calls.includes('kill'));}
});
test('metadata verifier cancellation terminates only its late owned child before I/O',async()=>{
 let release;const delayedSpawn=new Promise(resolve=>{release=resolve;});const f=verifierNative({delayedSpawn}),controller=new AbortController();
 const pending=createTerminalPolicyVerifier(f.native,paths)({signal:controller.signal});await tick();controller.abort();await assert.rejects(pending,unavailable);
 release();await tick();assert(f.calls.includes('kill'));assert(f.calls.includes('close'));
});
test('metadata verifier deadline is bounded even when native read never resolves',async()=>{
 const f=verifierNative({hangRead:true}),timers=[];f.native.timers={setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout:()=>{}};
 const pending=createTerminalPolicyVerifier(f.native,paths)();await tick();assert.equal(timers[0].delay,3000);timers[0].fn();
 await assert.rejects(pending,unavailable);assert(f.calls.includes('kill'));
});

test('stderr rejection is handled immediately while stdout is pending',async()=>{
 const f=verifierNative({hangRead:true});f.child.stderr.read=async()=>{throw Error('discarded native error');};
 await assert.rejects(createTerminalPolicyVerifier(f.native,paths)(),unavailable);assert(f.calls.includes('kill'));
});

function controlledTimers(native){
 const timers=new Map();let serial=0;
 native.timers={setTimeout:(fn,delay)=>{const id=++serial;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id)};
 return timers;
}
const closedAll=f=>{
 for(const pipe of ['stdin','stdout','stderr']) assert(f.calls.some(call=>call?.pipe===pipe&&call.force===true),pipe+' force-close');
 assert(f.calls.some(call=>call?.killTimeout===0));
};
test('timeout force-closes all owned pipes and caps a hanging reap at500ms',async()=>{
 const f=verifierNative({hangRead:true}),timers=controlledTimers(f.native);
 for(const name of ['stdin','stdout','stderr']) f.child[name].close=force=>{f.calls.push({pipe:name,force});return new Promise(()=>{});};
 f.child.kill=timeout=>{f.calls.push({killTimeout:timeout});return new Promise(()=>{});};f.child.wait=()=>new Promise(()=>{});
 const pending=createTerminalPolicyVerifier(f.native,paths)();await tick();
 [...timers.values()].find(timer=>timer.delay===3000).fn();await tick();closedAll(f);
 assert.equal([...timers.values()].filter(timer=>timer.delay===500).length,1);
 [...timers.values()].find(timer=>timer.delay===500).fn();await assert.rejects(pending,unavailable);assert.equal(timers.size,0);
});
test('late child cleanup force-closes all pipes, force-kills and bounds a stuck wait',async()=>{
 let release;const delayedSpawn=new Promise(resolve=>{release=resolve;});const f=verifierNative({delayedSpawn}),controller=new AbortController();
 const timers=controlledTimers(f.native);f.child.wait=()=>new Promise(()=>{});
 const pending=createTerminalPolicyVerifier(f.native,paths)({signal:controller.signal});await tick();controller.abort();
 await assert.rejects(pending,unavailable);assert.equal(timers.size,0);release();await tick();closedAll(f);
 assert(!f.calls.includes('stdout-read'));assert(!f.calls.includes('stderr-read'));
 assert.equal([...timers.values()].filter(timer=>timer.delay===500).length,1);
 [...timers.values()].find(timer=>timer.delay===500).fn();await tick();assert.equal(timers.size,0);
});
test('failed native close and kill primitives still deny and bound the owned wait',async()=>{
 const f=verifierNative({hangRead:true}),controller=new AbortController(),timers=controlledTimers(f.native);
 for(const name of ['stdin','stdout','stderr']) f.child[name].close=force=>{f.calls.push({pipe:name,force});throw Error('discarded close failure');};
 f.child.kill=timeout=>{f.calls.push({killTimeout:timeout});throw Error('discarded kill failure');};f.child.wait=()=>new Promise(()=>{});
 const pending=createTerminalPolicyVerifier(f.native,paths)({signal:controller.signal});await tick();controller.abort();await tick();closedAll(f);
 [...timers.values()].find(timer=>timer.delay===500).fn();await assert.rejects(pending,unavailable);assert.equal(timers.size,0);
});

test('trusted constructor activity callback requires a literal true result',async()=>{
 for(const isActive of [null,false,{},()=>false,()=>0,()=>1,()=>"true",()=>{throw Error('revoked');}]){
  const f=fake();
  await assert.rejects(createNativeTerminalHandoffFixture({runtime:f.native,isActive}),unavailable);
  assert.equal(f.calls.length+f.checks.length+f.verifications.length,0);
 }
});
test('constructor authority revoked during metadata await never exposes a launcher',async()=>{
 const f=fake();let active=true,release;
 f.native.verifyFile=()=>new Promise(resolve=>{release=resolve;});
 const pending=createNativeTerminalHandoffFixture({runtime:f.native,isActive:()=>active});
 await tick();active=false;release(true);
 await assert.rejects(pending,unavailable);assert.equal(f.calls.length+f.verifications.length,0);
});
test('trusted activity revocation during launch verification prevents native spawn',async()=>{
 const f=fake();let active=true,release;
 const fixture=await createNativeTerminalHandoffFixture({runtime:f.native,isActive:()=>active});
 f.native.verifyFile=()=>new Promise(resolve=>{release=resolve;});
 const pending=fixture.terminal.launch(request(fixture));await tick();active=false;release(true);
 assert.equal((await pending).reason,'INVALID_POLICY');assert.equal(f.calls.length,0);fixture.close();
});
test('final dispatch admission rechecks synchronous trusted activity after policy await',async()=>{
 const f=fake();let active=true,verifications=0;
 const original=f.native.verifyPolicy;
 f.native.verifyPolicy=async control=>{
  const result=await original(control);
  if(++verifications===3)active=false;
  return result;
 };
 const fixture=await createNativeTerminalHandoffFixture({runtime:f.native,isActive:()=>active});
 const result=await fixture.terminal.launch(request(fixture));
 assert.equal(verifications,3);assert.equal(result.reason,'SPAWN_FAILED');
 assert.equal(f.calls.length,0);fixture.close();
});
test('activity revoked while native spawn resolves closes late child before context write',async()=>{
 const f=fake();let active=true,release,writeCount=0;const cleanup=[];
 const original=f.native.spawn;
 f.native.spawn=async options=>{
  const child=await original(options);
  child.stdin.write=async()=>{writeCount++;};
  for(const pipe of ['stdin','stdout','stderr'])child[pipe].close=async force=>{cleanup.push([pipe,force]);};
  child.kill=async timeout=>{cleanup.push(['kill',timeout]);};
  child.wait=async()=>{cleanup.push(['wait']);return {exitCode:0};};
  await new Promise(resolve=>{release=resolve;});return child;
 };
 const fixture=await createNativeTerminalHandoffFixture({runtime:f.native,isActive:()=>active});
 const pending=fixture.terminal.launch(request(fixture));await tick();assert.equal(typeof release,'function');
 active=false;release();assert.equal((await pending).reason,'SPAWN_FAILED');
 assert.equal(writeCount,0);assert.equal(f.calls.length,1);
 for(const pipe of ['stdin','stdout','stderr'])assert(cleanup.some(item=>item[0]===pipe&&item[1]===true));
 assert(cleanup.some(item=>item[0]==='kill'&&item[1]===0));assert(cleanup.some(item=>item[0]==='wait'));fixture.close();
});
test('authority ending after adoption but before facade context write sends no bytes',async()=>{
 const f=fake();let active=true,writes=0;const original=f.native.spawn;
 f.native.spawn=async options=>{
  const child=await original(options);const stdout=child.stdout;
  child.stdin.write=async()=>{writes++;};
  // A deterministic post-adoption invalidation, with no abort/tab event.
  Object.defineProperty(child,'stdout',{get(){active=false;return stdout;}});
  return child;
 };
 const fixture=await createNativeTerminalHandoffFixture({runtime:f.native,isActive:()=>active});
 const result=await fixture.terminal.launch(request(fixture));
 assert.equal(writes,0);assert.equal(result.reason,'LAUNCH_UNCERTAIN');
 assert.equal(result.may_have_launched,true);fixture.close();
});
