// Only native-shaped fake raw pipes. No process, provider, Terminal or profile.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTerminalHandoff } from '../chrome/TerminalHandoff.sys.mjs';
import { createTerminalPolicyVerifier, terminalHandoffFixturePaths, TERMINAL_HANDOFF_FAKE_SHA256 } from '../chrome/TerminalHandoffConfig.sys.mjs';
import { buildHandoffContext } from '../chrome/AgentHandoff.sys.mjs';
const encode=value=>new TextEncoder().encode(value);
const raw=values=>Uint8Array.from(values).buffer;
const buffer=value=>typeof value==='string'?encode(value).buffer:value;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const success=JSON.stringify({version:1,status:'handed_off',agent:'fake',may_have_launched:true,launch_id:'a'.repeat(32)});
const policySuccess=JSON.stringify({version:1,status:'verified',policy_sha256:'d'.repeat(64),fixture_sha256:TERMINAL_HANDOFF_FAKE_SHA256});
const identity='e'.repeat(32);
const paths=terminalHandoffFixturePaths(`/Volumes/AxioSozoBuild/workstation/handoff-terminal/config-${identity}`,
 `/Volumes/AxioSozoBuild/workstation/runtime/1234567890abcdef/plan4-handoff-${identity}/gecko`);
const unavailable=e=>e.code==='TERMINAL_FIXTURE_UNAVAILABLE'&&e.message==='TERMINAL_FIXTURE_UNAVAILABLE';
const context=()=>buildHandoffContext({request_id:'hf_0123456789abcdef',created_at:1000,
 tab:{tab_id:'t_1',navigation_id:'n1',url:'http://localhost:8212/',is_private:false,blocked_category:false,password_risk:false,
 project:{id:'p_harbor',root:paths.projectsRoot+'/harbor-suite'}},task:'Synthetic fixture',
 capture:{tab_id:'t_1',navigation_id:'n1',url:'http://localhost:8212/',title:'Fixture',selection:null,screen:null,console_errors:[]}},
 {isSensitiveHost:()=>({sensitive:false})});
const request=signal=>({agent:'claude-code',test_only:true,signal,context:context(),configuration:{helper:paths.helper,policy:paths.policy,mode:'terminal'}});
function fakePipe(values,calls,name){
 const chunks=[...values];let count=0;
 return {get count(){return count;},read(...args){assert.deepEqual(args,[]);count++;calls.push(name+'-read');
  if(chunks.length){const value=chunks.shift();if(typeof value==='function')return value();return Promise.resolve(buffer(value));}
  return Promise.resolve(new ArrayBuffer(0));},
 readString(){throw Error('Decoded-only read must never be used');},close:async force=>{calls.push({pipe:name,force});}};
}
function native({stdout=[success],stderr=[],wait=async()=>({exitCode:0}),delayedSpawn=null}={}){
 const calls=[],writes=[];
 const child={stdout:fakePipe(stdout,calls,'stdout'),stderr:fakePipe(stderr,calls,'stderr'),
 stdin:{write:async value=>writes.push(value),close:async force=>{calls.push({pipe:'stdin',force});}},
 wait:()=>{calls.push('wait');return wait();},kill:async delay=>{calls.push({killDelay:delay});}};
 const runtime={timers:{setTimeout,clearTimeout},spawn:async options=>{calls.push(options);if(delayedSpawn)await delayedSpawn;return child;}};
 return{runtime,calls,writes,child};
}
const launch=(f,signal)=>createTerminalHandoff({runtime:f.runtime,verifyConfiguration:()=>true}).launch(request(signal));
const verify=(f,signal)=>createTerminalPolicyVerifier(f.runtime,paths)({signal});
const facadeUncertain=r=>{assert.equal(r.reason,'LAUNCH_UNCERTAIN');assert.equal(r.may_have_launched,true);};
const killed=f=>assert(f.calls.some(value=>typeof value==='object'&&Object.hasOwn(value,'killDelay')));
const allClosed=f=>{for(const name of ['stdin','stdout','stderr'])assert(f.calls.some(value=>value?.pipe===name&&value.force===true));};
const split=bytes=>[...bytes].map(byte=>raw([byte]));

test('facade consumes a valid receipt byte-by-byte through genuine raw EOF',async()=>{
 const chunks=split(encode(success));const f=native({stdout:chunks});assert.equal((await launch(f)).status,'handed_off');
 assert.equal(f.child.stdout.count,chunks.length+1);assert.equal(f.child.stderr.count,1);assert.equal(f.writes.length,1);
});
test('policy verifier consumes a valid receipt byte-by-byte through genuine raw EOF',async()=>{
 const chunks=split(encode(policySuccess));const f=native({stdout:chunks});assert.equal((await verify(f)).status,'verified');
 assert.equal(f.child.stdout.count,chunks.length+1);assert.equal(f.child.stderr.count,1);allClosed(f);
});
test('every split Unicode stderr prefix is drained to actual EOF for both consumers',async()=>{
 for(const text of ['¢','€','😀']){const bytes=encode(text);
 for(let at=1;at<bytes.length;at++)for(const mode of ['facade','policy']){
  const chunks=[bytes.slice(0,at).buffer,bytes.slice(at).buffer];const f=native({stdout:[mode==='facade'?success:policySuccess],stderr:chunks});
  assert.equal((await(mode==='facade'?launch(f):verify(f))).status,mode==='facade'?'handed_off':'verified');
  assert.equal(f.child.stderr.count,3);
 }}
});
test('neither consumer acknowledges before a split Unicode stderr stream reaches EOF',async()=>{
 for(const mode of ['facade','policy']){
  let release,settled=false;const pendingBytes=new Promise(resolve=>{release=resolve;});
  const f=native({stdout:[mode==='facade'?success:policySuccess],stderr:[raw([0xf0]),()=>pendingBytes]});
  const pending=(mode==='facade'?launch(f):verify(f)).then(value=>{settled=true;return value;});await tick();
  assert.equal(settled,false);assert.equal(f.child.stderr.count,2);release(raw([0x9f,0x98,0x80]));
  assert.equal((await pending).status,mode==='facade'?'handed_off':'verified');assert.equal(f.child.stderr.count,3);
 }
});
test('valid facade receipt followed by incomplete or malformed UTF8 is uncertain at raw EOF',async()=>{
 for(const suffix of [[raw([0xe2])],[raw([0xe2,0x82])],[raw([0xf0,0x9f,0x98])],[raw([0xe2]),raw([0x28])],
 [raw([0xff])],[raw([0xc0,0xaf])]]){
  const f=native({stdout:[success,...suffix]});facadeUncertain(await launch(f));killed(f);
  assert(f.child.stdout.count>=2);assert(!f.calls.some(value=>value?.command==='/bin/sh'));
 }
});
test('valid policy receipt followed by incomplete or malformed UTF8 never verifies',async()=>{
 for(const suffix of [[raw([0xe2])],[raw([0xe2,0x82])],[raw([0xf0,0x9f,0x98])],[raw([0xe2]),raw([0x28])],
 [raw([0xff])],[raw([0xc0,0xaf])]]){
  const f=native({stdout:[policySuccess,...suffix]});await assert.rejects(verify(f),unavailable);killed(f);allClosed(f);
 }
});
test('malformed or incomplete stderr after dispatch remains uncertain with no second launch',async()=>{
 for(const chunks of [[raw([0xe2])],[raw([0xf0,0x9f,0x98])],[raw([0xe2]),raw([0x28])],[raw([0xff])]]){
  const f=native({stderr:chunks});facadeUncertain(await launch(f));killed(f);assert.equal(f.writes.length,1);
  assert.equal(f.calls.filter(value=>value?.command).length,1);
 }
});
test('policy malformed or incomplete stderr fails closed and closes all owned pipes',async()=>{
 for(const chunks of [[raw([0xe2])],[raw([0xf0,0x9f,0x98])],[raw([0xe2]),raw([0x28])],[raw([0xff])]]){
  const f=native({stdout:[policySuccess],stderr:chunks});await assert.rejects(verify(f),unavailable);killed(f);allClosed(f);
 }
});
test('facade receipt raw cap admits exact16384 bytes and denies16385',async()=>{
 const padding=' '.repeat(16384-encode(success).length);
 const f=native({stdout:[success,padding]});assert.equal((await launch(f)).status,'handed_off');
 const g=native({stdout:[success,padding+' ']});facadeUncertain(await launch(g));killed(g);
});
test('policy receipt raw cap admits exact1024 bytes and denies1025',async()=>{
 const padding=' '.repeat(1024-encode(policySuccess).length);
 const f=native({stdout:[policySuccess,padding]});assert.equal((await verify(f)).status,'verified');
 const g=native({stdout:[policySuccess,padding+' ']});await assert.rejects(verify(g),unavailable);killed(g);allClosed(g);
});
test('both raw stderr caps admit exactly16384 Unicode bytes and refuse16385',async()=>{
 const bytes=encode('😀'.repeat(4096));assert.equal(bytes.byteLength,16384);
 for(const mode of ['facade','policy']){
  const valid=native({stdout:[mode==='facade'?success:policySuccess],stderr:[bytes.slice(0,1).buffer,bytes.slice(1).buffer]});
  assert.equal((await(mode==='facade'?launch(valid):verify(valid))).status,mode==='facade'?'handed_off':'verified');
  const bad=native({stdout:[mode==='facade'?success:policySuccess],stderr:[bytes.buffer,raw([65])]});
  if(mode==='facade')facadeUncertain(await launch(bad));else await assert.rejects(verify(bad),unavailable);
  killed(bad);if(mode==='policy')allClosed(bad);
 }
});
test('decoded-only pipes are refused without readString fallback',async()=>{
 for(const mode of ['facade','policy']){
  let decoded=0;const f=native({stdout:[mode==='facade'?success:policySuccess]});
  f.child.stdout={readString:async()=>{decoded++;return mode==='facade'?success:policySuccess;},close:async force=>f.calls.push({pipe:'stdout',force})};
  if(mode==='facade')facadeUncertain(await launch(f));else await assert.rejects(verify(f),unavailable);
  assert.equal(decoded,0);killed(f);if(mode==='policy')allClosed(f);
 }
});
test('cancelled facade retains uncertainty while a raw Unicode sequence is pending',async()=>{
 let release;const pendingBytes=new Promise(resolve=>{release=resolve;});const controller=new AbortController();
 const f=native({stdout:[success,raw([0xf0]),()=>pendingBytes]});const pending=launch(f,controller.signal);await tick();controller.abort();
 facadeUncertain(await pending);killed(f);assert(f.calls.includes('wait'));release(raw([0x9f,0x98,0x80]));await tick();
 assert.equal(f.calls.filter(value=>value?.command).length,1);
});
test('cancelled raw policy reader force-closes owned pipes and caps hanging wait',async()=>{
 const f=native({stdout:[policySuccess,raw([0xe2]),()=>new Promise(()=>{})],wait:()=>new Promise(()=>{})}),controller=new AbortController();
 const timers=new Map();let serial=0;f.runtime.timers={setTimeout:(fn,ms)=>{const id=++serial;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};
 const pending=verify(f,controller.signal);await tick();controller.abort();await tick();allClosed(f);killed(f);
 const cleanup=[...timers.values()].find(timer=>timer.ms===500);assert(cleanup);cleanup.fn();
 await assert.rejects(pending,unavailable);assert.equal(timers.size,0);
});
test('cancelled late raw-policy child is reaped without starting any pipe read',async()=>{
 let release;const delayedSpawn=new Promise(resolve=>{release=resolve;});const f=native({delayedSpawn,stdout:[policySuccess]}),controller=new AbortController();
 const pending=verify(f,controller.signal);await tick();controller.abort();await assert.rejects(pending,unavailable);release();await tick();
 assert.equal(f.child.stdout.count+f.child.stderr.count,0);allClosed(f);killed(f);assert(f.calls.includes('wait'));
});
