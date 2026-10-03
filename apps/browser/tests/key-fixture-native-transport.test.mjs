// Fake processes/raw pipes only. No subprocess, filesystem, profile, Keychain or provider.
import test from "node:test";
import assert from "node:assert/strict";
import { createNativeDecisionKeyFixtureRuntime, runKeyFixtureMetadata,
  KEY_METADATA_ID, KEY_METADATA_STAT, KEY_METADATA_FORMAT } from "../chrome/KeyFixtureNativeConfig.sys.mjs";
import { KEY_FIXTURE_SHA256, KEY_FIXTURE_PYTHON } from "../chrome/DecisionKeyFixtureRuntime.sys.mjs";
import { storeDecisionKey, removeDecisionKey, decisionKeyPresence, decisionKeyStatus,
  DECISION_KEY_LIMITS } from "../chrome/ProviderKeys.sys.mjs";
const raw=values=>Uint8Array.from(values).buffer;
const encoded=text=>new TextEncoder().encode(text).buffer;
const split=text=>Array.from(new TextEncoder().encode(text),byte=>raw([byte]));
const tick=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));};
const unavailable=error=>error.code==="KEYCHAIN_HELPER_UNAVAILABLE"&&error.message==="KEYCHAIN_HELPER_UNAVAILABLE";
const code=expected=>error=>error.code===expected&&error.message===expected;
const base="/Volumes/AxioSozoBuild/workstation/gui-fixtures";
const id="b".repeat(32),root=`${base}/keys-${id}`;
const profile=`/Volumes/AxioSozoBuild/workstation/runtime/e626697ad91fe95c/plan4-keys-${id}/gecko`;
const helper=`${root}/key-helper-${KEY_FIXTURE_SHA256}.py`;
const prefs={getBoolPref:()=>true};
function fakeTimers() {
  let serial=0;const pending=new Map();
  return {pending,setTimeout(fn,ms){const id=++serial;pending.set(id,{fn,ms});return id;},
    clearTimeout(id){pending.delete(id);},fire(ms){const entry=[...pending.values()].find(value=>value.ms===ms);assert(entry,`missing ${ms} timer`);entry.fn();}};
}
function fakeChild({stdout=[],stderr=[],hanging=false,exitCode=0,onWrite=null,onClose=null,
  readerFailure=false,killFailure=false,waitNever=false,closeFailure=false}={}) {
  const events=[],rawReads=[],stringReads=[];
  let resolveExit,finished=false;
  const exit=waitNever?new Promise(()=>{}):hanging?new Promise(resolve=>{resolveExit=resolve;}):Promise.resolve({exitCode});
  const pipe=(chunks,name)=>{
    const values=[...chunks],pending=[];
    return {
      read:async(...args)=>{
        assert.deepEqual(args,[]);rawReads.push(name);
        if(readerFailure&&name==="stdout")throw new Error("invented-private-reader-error");
        if(values.length)return values.shift();
        if(!hanging||finished)return new ArrayBuffer(0);
        return await new Promise(resolve=>pending.push(resolve));
      },
      readString:async()=>{stringReads.push(name);throw new Error("readString must not be used");},
      close:async force=>{events.push([name+".close",force]);while(pending.length)pending.shift()(new ArrayBuffer(0));
        if(closeFailure&&name==="stdout")throw new Error("invented-private-close-error");},
    };
  };
  const child={stdout:pipe(stdout,"stdout"),stderr:pipe(stderr,"stderr"),
    stdin:{write:async value=>{events.push(["stdin.write"]);onWrite?.(value);},
      close:async force=>{events.push(["stdin.close",force]);onClose?.(force);}},
    wait:()=>{events.push(["wait"]);return exit;},kill:async grace=>{
      events.push(["kill",grace]);finished=true;
      if(killFailure)throw new Error("invented-private-kill-error");
      resolveExit?.({exitCode:-9});
    },
  };
  return {child,events,rawReads,stringReads};
}
function processFixture(options={}) {
  const timers=fakeTimers(),owned=fakeChild(options),calls=[];let release;
  const native={timers,spawn:async config=>{calls.push(config);if(options.deferredSpawn)return await new Promise(resolve=>{release=()=>resolve(owned.child);});return owned.child;}};
  return {native,timers,owned,calls,release:()=>release()};
}
function cleanupStarted(f) {
  for(const name of ["stdin","stdout","stderr"])assert(f.events.some(([event,force])=>event===name+".close"&&force===true));
  assert(f.events.some(([event])=>event==="kill"));assert(f.events.some(([event])=>event==="wait"));
}
function admittedFixture(options={}) {
  const {flag="1",currentProfile=profile,helperOutput={},metadataStderr=[],deferredHelper=false}=options;
  const requested=Object.hasOwn(options,"requested")?options.requested:root;
  const timers=fakeTimers(),calls=[],children=[],present=new Set(),inputAccepted=[];let releaseHelper;
  const env={AXIOSOZO_KEY_GUI_FIXTURE_ROOT:requested,AXIOSOZO_SYNTHETIC_TEST:flag};
  function statRecord(path) {
    if(path===KEY_FIXTURE_PYTHON)return "0 1 100755 8192 42 63\n";
    if(path===helper)return "501 1 100400 8192 42 63\n";
    if([base,root,profile].includes(path))return "501 1 40700 0 42 63\n";
    return "0 1 40755 0 42 63\n";
  }
  const runtime={timers,clock:()=>0,env:name=>env[name],profilePath:()=>currentProfile,
    metadataCommandAvailable:path=>[KEY_METADATA_ID,KEY_METADATA_STAT].includes(path),
    spawn:async options=>{
      calls.push(options);let output;
      if(options.command===KEY_METADATA_ID)output="501\n";
      else if(options.command===KEY_METADATA_STAT)output=options.arguments.slice(2).map(statRecord).join("");
      else if(options.command===KEY_FIXTURE_PYTHON&&options.arguments.includes("-c"))output=KEY_FIXTURE_SHA256+"\n";
      else {
        assert.equal(options.command,KEY_FIXTURE_PYTHON);
        assert.deepEqual(options.arguments.slice(0,4),["-I","-S","-B",helper]);
        const operation=options.arguments[4],provider=options.arguments[5]??"jev";
        assert(["exists","store","remove"].includes(operation));assert(["jev","openai"].includes(provider));
        const result=operation==="exists"&&!present.has(provider)?44:0;
        const owned=fakeChild({...helperOutput,exitCode:result,
          onWrite:value=>{inputAccepted.push(value===`synthetic-gui-key-${provider}-plan4`);},
          onClose:force=>{if(force)return;if(operation==="store")present.add(provider);if(operation==="remove")present.delete(provider);},
        });
        children.push({kind:"helper",owned});
        if(deferredHelper)return await new Promise(resolve=>{releaseHelper=()=>resolve(owned.child);});
        return owned.child;
      }
      const owned=fakeChild({stdout:split(output),stderr:metadataStderr});
      children.push({kind:"metadata",owned});return owned.child;
    },
  };
  return {runtime,timers,calls,children,present,inputAccepted,env,releaseHelper:()=>releaseHelper()};
}

test("native metadata continues split Unicode stdout and stderr until genuine raw EOF",async()=>{
  const f=processFixture({stdout:split("€😀\n"),stderr:split("stderr ¢€😀")});
  assert.equal(await runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"]),"€😀\n");
  assert.equal(f.owned.rawReads.filter(name=>name==="stdout").length,9);
  assert.deepEqual(f.owned.stringReads,[]);assert.equal(f.timers.pending.size,0);cleanupStarted(f.owned);
});
test("metadata shared raw cap accepts exactly 4096 bytes and rejects one additional stderr byte",async()=>{
  for(const extra of [0,1]) {
    const f=processFixture({stdout:[encoded("x".repeat(4092+extra))],stderr:split("😀")});
    if(extra)await assert.rejects(runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"]),unavailable);
    else assert.equal((await runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"])).length,4092);
    assert.deepEqual(f.owned.stringReads,[]);assert.equal(f.timers.pending.size,0);cleanupStarted(f.owned);
  }
});
test("metadata raw caps count undecoded lead bytes and BOM before decoding",async()=>{
  for(const output of [
    {stdout:[raw([0xf0,0x9f,0x98]),encoded("x".repeat(4094))]},
    {stdout:[encoded("x".repeat(4094))],stderr:[raw([0xef]),raw([0xbb]),raw([0xbf])]},
  ]) {
    const f=processFixture(output);await assert.rejects(runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"]),unavailable);
    assert.deepEqual(f.owned.stringReads,[]);assert.equal(f.timers.pending.size,0);cleanupStarted(f.owned);
  }
});
test("metadata malformed UTF8 and unfinished raw EOF in either stream refuse without diagnostic text",async()=>{
  for(const name of ["stdout","stderr"])for(const chunks of [[raw([0xe2]),raw([0x28])],[raw([0xe2,0x82])]]) {
    const f=processFixture({stdout:[encoded("501\n")],[name]:chunks});
    await assert.rejects(runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"]),unavailable);
    assert.deepEqual(f.owned.stringReads,[]);assert.equal(f.timers.pending.size,0);cleanupStarted(f.owned);
  }
});
test("metadata rejects nonraw and readString-only transports without fallback",async()=>{
  for(const value of [null,"",new Uint8Array(0),{byteLength:0}]) {
    const f=processFixture({stdout:[value]});await assert.rejects(runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"]),unavailable);
    assert.deepEqual(f.owned.stringReads,[]);cleanupStarted(f.owned);
  }
  const f=processFixture();delete f.owned.child.stdout.read;
  await assert.rejects(runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"]),unavailable);
  assert.deepEqual(f.owned.stringReads,[]);assert.equal(f.timers.pending.size,0);cleanupStarted(f.owned);
});
test("metadata timeout and abort force-close stalled raw readers and wait on their owned child",async()=>{
  for(const reason of ["timeout","abort"]) {
    const f=processFixture({stdout:[raw([0xe2])],hanging:true});const controller=new AbortController();
    const pending=runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"],{signal:controller.signal});await tick();
    assert.equal(f.owned.rawReads.filter(name=>name==="stdout").length,2);
    if(reason==="abort")controller.abort();else f.timers.fire(1000);
    await assert.rejects(pending,unavailable);cleanupStarted(f.owned);
    assert.equal(f.timers.pending.size,0);assert.deepEqual(f.owned.stringReads,[]);
  }
});
test("metadata child arriving after timeout is force-closed and waited without reading or input",async()=>{
  const f=processFixture({deferredSpawn:true,hanging:true});
  const pending=runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"]);await tick();f.timers.fire(1000);
  await assert.rejects(pending,unavailable);f.release();await tick();
  cleanupStarted(f.owned);assert.deepEqual(f.owned.rawReads,[]);
  assert.equal(f.owned.events.some(([event])=>event==="stdin.write"),false);assert.equal(f.timers.pending.size,0);
});
test("metadata cleanup starts every action and remains bounded when close kill and wait fail",async()=>{
  const f=processFixture({readerFailure:true,closeFailure:true,killFailure:true,waitNever:true});let settled=false;
  const pending=runKeyFixtureMetadata(f.native,KEY_METADATA_ID,["-u"]);
  pending.then(()=>{settled=true;},()=>{settled=true;});await tick();
  assert.equal(settled,false);cleanupStarted(f.owned);f.timers.fire(500);
  await assert.rejects(pending,unavailable);assert.equal(f.timers.pending.size,0);
});
test("metadata rejects arbitrary commands and unadmitted stat paths before spawn",async()=>{
  const f=processFixture();
  await assert.rejects(runKeyFixtureMetadata(f.native,"/usr/bin/security",["find-generic-password"]),unavailable);
  await assert.rejects(runKeyFixtureMetadata(f.native,KEY_METADATA_STAT,["-f",KEY_METADATA_FORMAT,"/invented/path"]),unavailable);
  assert.equal(f.calls.length,0);assert.equal(f.timers.pending.size,0);
});
test("native fixture default-off and invalid requests never dispatch or accept caller pipe mode",async()=>{
  for(const location of [undefined,null,""])for(const flag of [undefined,"0","1"]) {
    const f=admittedFixture({requested:location,flag});
    assert.equal(await createNativeDecisionKeyFixtureRuntime({runtime:f.runtime,outputPipeMode:"raw"}),null);
    assert.equal(f.calls.length,0);assert.equal(f.timers.pending.size,0);
  }
  for(const options of [{flag:"0"},{requested:root+"/nested"},{currentProfile:profile+"/nested"}]) {
    const f=admittedFixture(options);
    await assert.rejects(createNativeDecisionKeyFixtureRuntime({runtime:f.runtime,outputPipeMode:"raw"}),unavailable);
    assert.equal(f.calls.length,0);assert.equal(f.timers.pending.size,0);
  }
});
test("admitted native factory composes both raw provider flows with split Unicode metadata stderr",async()=>{
  const f=admittedFixture({metadataStderr:split("¢€😀")});
  for(const provider of ["jev","openai"]) {
    const fresh=async()=>{
      const runtime=await createNativeDecisionKeyFixtureRuntime({runtime:f.runtime,outputPipeMode:"string"});
      assert.equal(runtime.outputPipeMode,"raw");assert(Object.isFrozen(runtime));return runtime;
    };
    assert.equal(await decisionKeyPresence(provider,{runtime:await fresh()}),"missing");
    await storeDecisionKey(provider,`synthetic-gui-key-${provider}-plan4`,{runtime:await fresh(),prefs});
    assert.equal(await decisionKeyPresence(provider,{runtime:await fresh()}),"stored");
    await removeDecisionKey(provider,{runtime:await fresh()});
    const status=await decisionKeyStatus(provider,{runtime:await fresh(),prefs});
    assert.deepEqual(status,{provider,key_entry_enabled:true,key:"missing",error:null});
  }
  assert.deepEqual(f.inputAccepted,[true,true]);assert.equal(f.present.size,0);
  assert(f.calls.every(call=>call.command!=="/Volumes/AxioSozoBuild/workstation/providers/keychain"));
  assert(f.calls.every(call=>!JSON.stringify(call).includes("synthetic-gui-key")));
  assert(f.children.every(({owned})=>owned.stringReads.length===0));
  for(const {owned}of f.children)cleanupStarted(owned);assert.equal(f.timers.pending.size,0);
});
test("composed native fixture uses unchanged raw pipes and counts every split helper byte",async()=>{
  const f=admittedFixture({helperOutput:{stdout:[raw([0xe2]),raw([0x82,0xac]),new ArrayBuffer(DECISION_KEY_LIMITS.outputBytes-3)]}});
  const runtime=await createNativeDecisionKeyFixtureRuntime({runtime:f.runtime});
  assert.equal(await decisionKeyPresence("openai",{runtime}),"missing");
  const owned=f.children.findLast(child=>child.kind==="helper").owned;
  assert.equal(owned.rawReads.filter(name=>name==="stdout").length,4);
  assert.deepEqual(owned.stringReads,[]);cleanupStarted(owned);assert.equal(f.timers.pending.size,0);
});
test("composed native fixture enforces exact shared helper cap after a lead-only chunk",async()=>{
  const f=admittedFixture({helperOutput:{stdout:[raw([0xe2]),new ArrayBuffer(8191)],stderr:[new ArrayBuffer(8193)]}});
  const runtime=await createNativeDecisionKeyFixtureRuntime({runtime:f.runtime});
  await assert.rejects(decisionKeyPresence("jev",{runtime}),code("HELPER_OUTPUT_LIMIT"));
  const owned=f.children.findLast(child=>child.kind==="helper").owned;
  assert.deepEqual(owned.stringReads,[]);cleanupStarted(owned);assert.equal(f.timers.pending.size,0);
});
test("composed native helper timeout and abort clean raw readers without production fallback",async()=>{
  for(const reason of ["timeout","abort"]) {
    const f=admittedFixture({helperOutput:{stdout:[raw([0xe2])],hanging:true}});const controller=new AbortController();
    const runtime=await createNativeDecisionKeyFixtureRuntime({runtime:f.runtime,signal:controller.signal});
    const pending=decisionKeyPresence("openai",{runtime,signal:controller.signal});await tick();
    if(reason==="abort")controller.abort();else f.timers.fire(DECISION_KEY_LIMITS.operationMs);
    await assert.rejects(pending,code(reason==="abort"?"SETTINGS_CLOSED":"HELPER_TIMEOUT"));
    const owned=f.children.findLast(child=>child.kind==="helper").owned;
    assert.deepEqual(owned.stringReads,[]);cleanupStarted(owned);assert.equal(f.timers.pending.size,0);
    assert(f.calls.every(call=>call.command!=="/Volumes/AxioSozoBuild/workstation/providers/keychain"));
  }
});
test("trusted pipe marker accessor errors become fixed refusals before helper verification",async()=>{
  let touched=0;const runtime={env:()=>{touched++;return root;},verifyHelper:()=>{touched++;return true;},spawn:()=>{touched++;}};
  Object.defineProperty(runtime,"outputPipeMode",{get(){throw new Error("invented-private-mode-error");}});
  await assert.rejects(decisionKeyPresence("jev",{runtime}),unavailable);assert.equal(touched,0);
});


test("composed native helper arriving after timeout is cleaned before any stdin key write",async()=>{
  const f=admittedFixture({helperOutput:{hanging:true},deferredHelper:true});
  const runtime=await createNativeDecisionKeyFixtureRuntime({runtime:f.runtime});
  const pending=storeDecisionKey("jev","synthetic-gui-key-jev-plan4",{runtime,prefs});await tick();
  const owned=f.children.findLast(child=>child.kind==="helper").owned;
  f.timers.fire(DECISION_KEY_LIMITS.operationMs);await assert.rejects(pending,code("HELPER_TIMEOUT"));
  f.releaseHelper();await tick();
  cleanupStarted(owned);assert.deepEqual(owned.rawReads,[]);assert.deepEqual(f.inputAccepted,[]);
  assert.equal(owned.events.some(([event])=>event==="stdin.write"),false);assert.equal(f.timers.pending.size,0);
});


test("a requested fixture disappearing before generic admission refuses without a raw tag",async()=>{
  const f=admittedFixture();const original=f.runtime.env;let rootReads=0;
  f.runtime.env=name=>name==="AXIOSOZO_KEY_GUI_FIXTURE_ROOT"&&++rootReads>1?null:original(name);
  await assert.rejects(createNativeDecisionKeyFixtureRuntime({runtime:f.runtime}),unavailable);
  assert.equal(f.calls.length,0);assert.equal(f.timers.pending.size,0);
});

test('native factory checks privileged surface authority before environment or imports', async () => {
  for (const isActive of [false, null, () => false, () => 1, async () => true, () => { throw new Error('invented-error'); }]) {
    const runtime = { env() { assert.fail('revoked surface reads no environment'); } };
    await assert.rejects(createNativeDecisionKeyFixtureRuntime({ runtime, isActive }), unavailable);
  }
});

test('native factory forwards authority through internal remove admission to fixed dispatch', async () => {
  const f = admittedFixture(); let active = true, armed = false; const spawn = f.runtime.spawn;
  f.runtime.spawn = async options => {
    const child = await spawn(options);
    if (armed && options.command === KEY_FIXTURE_PYTHON && options.arguments.includes('-c')) active = false;
    return child;
  };
  const runtime = await createNativeDecisionKeyFixtureRuntime({ runtime: f.runtime, isActive: () => active });
  const command = '/Volumes/AxioSozoBuild/workstation/providers/keychain';
  assert.equal(await runtime.verifyHelper(command), true); f.present.add('openai'); armed = true;
  await assert.rejects(runtime.spawn({ command, arguments: ['remove', 'openai'], environmentAppend: false,
    environment: { PATH: '/usr/bin:/bin', LANG: 'C' }, stderr: 'pipe' }), unavailable);
  assert.equal(f.children.filter(child => child.kind === 'helper').length, 0);
  assert.equal(f.present.has('openai'), true); assert.equal(f.timers.pending.size, 0);
});
