import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { CEFEngineAdapter, CEF_VERSION, CHROMIUM_VERSION, readAXCF,
  validateCEFTarget, validateSurface, fitCEFRenderSurface, validCEFSessionRuntime, validCEFRoot,
  validateCEFInput, allowedFixtureURL, allowedWebURL } from '../chrome/CEFEngineAdapter.sys.mjs';
import { CEFPresenter, bgraToRGBA, keyboardRoute, cefKey, transferableGeckoURL } from '../chrome/CEFPresenter.sys.mjs';

// All packets in this file are visibly controlled protocol fixtures. They never
// count as Chromium rendering, an engine integration, or screenshot evidence.
const origin = 'http://127.0.0.1:41231';
const pending = { tab_id:'fixture-tab', engine_instance:'fixture-instance', identity:origin,
  document_generation:1, navigation_generation:1, private_mode:false };
const full = { ...pending, engine:'chromium', native_target_id:'1' };
const token = 'ab'.repeat(32);
const timers = { setTimeout, clearTimeout };
const tick = () => new Promise(resolve => setImmediate(resolve));
const otherRealmBuffer = buffer => runInNewContext('Uint8Array.from(bytes).buffer', { bytes:[...new Uint8Array(buffer)] });
const frame = (target=full,id=1) => ({ version:1,target,frame_id:id,width:2,height:2,stride:8,device_scale:1,format:'BGRA8' });
function packet(kind, metadata, pixels = new Uint8Array(0)) {
  const text = new TextEncoder().encode(JSON.stringify(metadata)), data = new Uint8Array(16 + text.length + pixels.length);
  const view = new DataView(data.buffer); view.setUint32(0,0x41584346); view.setUint16(4,1); view.setUint16(6,kind);
  view.setUint32(8,text.length); view.setUint32(12,pixels.length); data.set(text,16); data.set(pixels,16+text.length);
  return data;
}
class Pipe {
  chunks = new Uint8Array(); pending = []; closed = false; reads = [];
  read(n) { this.reads.push(n); return new Promise((resolve,reject) => { this.pending.push({n,resolve,reject}); this.flush(); }); }
  push(bytes) { const joined = new Uint8Array(this.chunks.length+bytes.length); joined.set(this.chunks);joined.set(bytes,this.chunks.length);this.chunks=joined;this.flush(); }
  flush() {
    while(this.pending.length) {
      const next=this.pending[0];
      if(this.chunks.length<next.n) { if(this.closed){this.pending.shift();next.reject(new Error('EOF'));continue;} return; }
      this.pending.shift();const result=this.chunks.slice(0,next.n);this.chunks=this.chunks.slice(next.n);next.resolve(result.buffer);
    }
  }
  close(){this.closed=true;this.flush();}
}
function fixture({autoFrame=true,overrideReady={},manualHistory=false,historyRace=false,nativeInputError=null,
  nativeResizeUnsupported=false,holdInput=false,transformRead=buffer=>buffer,browsingMode='fixture',createStatus=200}={}) {
  const pipe = new Pipe(), writes=[], rendered=[], failures=[], events=[];
  let finished, current=full, frameID=1;
  const exit = new Promise(resolve => { finished=resolve; });
  const event = value => { if(value.event==='navigation')current=value.target;pipe.push(packet(1,{version:1,...value})); };
  const sendFrame = (target=current,id=frameID++) => pipe.push(packet(2,frame(target,id),new Uint8Array(16)));
  const process = { stdout:{read:async count=>transformRead(await pipe.read(count))}, wait:()=>exit,
    kill:async()=>{pipe.close();finished({exitCode:-15});},
    stdin:{close:async()=>{pipe.close();finished({exitCode:0});},write:async text=>{
      const command=JSON.parse(text);writes.push(command);
      if(command.method==='hello') event({event:'ready',cef:CEF_VERSION,chromium:CHROMIUM_VERSION,
        runtime_cef:CEF_VERSION.split('+')[0],runtime_chromium:CHROMIUM_VERSION,platform:'macosarm64',sandbox_configured:true,
        engine_instance:pending.engine_instance,render_path:'native-osr-bgra',capabilities:{fixture_only:browsingMode==='fixture',devtools:false,private_mode:false,ime:false,accessibility:false,
          ...(browsingMode==='web'?{edit:true,visibility:true,permissions:false,downloads:false,popups:false,accessibility:false}:{})},...overrideReady});
      else if(command.method==='frame_ack'||command.method==='ax_ack') return;
      else if(command.method==='create') {
        event({event:'accepted',request_id:command.request_id});
        event({event:'created',request_id:command.request_id,target:current});
        event({event:'completed',request_id:command.request_id,status:'success',target:current});
        event({event:'url',url:command.url,target:current});
        event({event:'load',http_status:createStatus,restored_from_history:false,target:current});
        if(autoFrame)sendFrame();
      } else if(command.method==='navigate') {
        event({event:'accepted',request_id:command.request_id,target:current});
        current={...current,document_generation:current.document_generation+1,navigation_generation:current.navigation_generation+1};
        event({event:'navigation',target:current});event({event:'url',url:command.url,target:current});event({event:'load',http_status:200,restored_from_history:false,target:current});
        event({event:'completed',request_id:command.request_id,status:'success',target:current});
      } else if(historyRace&&command.method==='back') {
        event({event:'accepted',request_id:command.request_id,target:current});
        current={...current,document_generation:current.document_generation+1,navigation_generation:current.navigation_generation+1};
        event({event:'navigation',target:current});event({event:'url',url:origin+'/engine.html',target:current});
        event({event:'load',http_status:0,restored_from_history:true,target:current});
        event({event:'completed',request_id:command.request_id,status:'success',target:current});sendFrame();
      } else if(command.method==='key'&&nativeInputError) {
        if(historyRace)assert.notEqual(command.target.document_generation,current.document_generation);
        event({event:'error',request_id:command.request_id,code:nativeInputError,target:current});
      } else if(command.method==='key'&&holdInput) {
        event({event:'accepted',request_id:command.request_id,target:current});
      } else if(command.method==='resize'&&nativeResizeUnsupported) {
        event({event:'accepted',request_id:command.request_id,target:current});
        event({event:'completed',request_id:command.request_id,status:'unsupported',reason:'surface_limit',target:current});
      } else if(manualHistory&&['back','forward'].includes(command.method)) {
        event({event:'accepted',request_id:command.request_id,target:current});
      } else if(command.method==='close'||command.method==='shutdown') {
        event({event:'accepted',request_id:command.request_id,target:current});
        event({event:'closed',target:current});event({event:'completed',request_id:command.request_id,status:'success',target:current});
        finished({exitCode:0});pipe.close();
      } else {
        event({event:'accepted',request_id:command.request_id,target:current});
        event({event:'completed',request_id:command.request_id,status:'success',target:current});
      }
    }} };
  const adapter=new CEFEngineAdapter(process,{token,pendingTarget:pending,timers,deadline:1000,browsingMode,
    onFrame:(meta,pixels)=>rendered.push({meta,pixels}),onFailure:error=>failures.push(error),onEvent:value=>events.push(value)});
  return {adapter,pipe,writes,rendered,failures,events,sendFrame,event};
}

test('AXCF is big endian, rejects dangerous lengths before metadata/pixel allocation', async()=>{
  for(const [offset,value] of [[8,8193],[12,33554433]]){
    const pipe=new Pipe(),data=packet(2,frame(),new Uint8Array(16));new DataView(data.buffer).setUint32(offset,value);pipe.push(data);
    await assert.rejects(readAXCF(pipe),/INVALID_AXCF_LENGTH/);assert.deepEqual(pipe.reads,[16]);
  }
  const pipe=new Pipe(),data=packet(2,frame(),new Uint8Array(16));new DataView(data.buffer).setUint16(4,1,true);pipe.push(data);
  await assert.rejects(readAXCF(pipe),/INVALID_AXCF_HEADER/);
});

test('AXCF accepts genuine cross-realm header, metadata and pixel ArrayBuffers',async()=>{
  const pipe=new Pipe();pipe.push(packet(2,frame(),Uint8Array.from({length:16},(_,i)=>i)));
  const result=await readAXCF({read:async count=>otherRealmBuffer(await pipe.read(count))});
  assert.equal(result.kind,2);assert.deepEqual(result.metadata,frame());
  assert.equal(result.pixels instanceof ArrayBuffer,false);
  assert.deepEqual([...new Uint8Array(result.pixels)],Array.from({length:16},(_,i)=>i));
});

test('AXCF rejects forged buffers at every boundary and non-ArrayBuffer header storage',async()=>{
  for(const [stage,reason] of [[1,'HEADER'],[2,'METADATA'],[3,'PIXELS']]){
    const pipe=new Pipe();pipe.push(packet(2,frame(),new Uint8Array(16)));let reads=0;
    await assert.rejects(readAXCF({read:async count=>{
      const buffer=await pipe.read(count);
      return ++reads===stage?{byteLength:buffer.byteLength,[Symbol.toStringTag]:'ArrayBuffer'}:buffer;
    }}),new RegExp('TRUNCATED_AXCF_'+reason));
    assert.equal(reads,stage);
  }
  for(const header of [new Uint8Array(16),new SharedArrayBuffer(16)]){
    await assert.rejects(readAXCF({read:async()=>header}),/TRUNCATED_AXCF_HEADER/);
  }
});

test('adapter completes its full controlled lifecycle with cross-realm pipe buffers',async()=>{
  const f=fixture({transformRead:otherRealmBuffer});
  await f.adapter.connect();await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
  assert.equal(f.adapter.status,'active');assert.equal(f.rendered.length,1);
  await f.adapter.close();assert.equal(f.adapter.status,'closed');assert.equal(f.failures.length,0);
});

test('reader diagnostics preserve only fixed parser codes and redact arbitrary exceptions',async()=>{
  const f=fixture({transformRead:buffer=>{const bytes=new Uint8Array(buffer);bytes[0]=0;return buffer;}});
  await assert.rejects(f.adapter.connect(),/^Error: INVALID_AXCF_HEADER$/);
  assert.equal(f.failures[0].message,'INVALID_AXCF_HEADER');
  for(const message of ['private payload '+token,'UNKNOWN_INTERNAL_CODE']){
    const untrusted=fixture({transformRead:()=>{throw new Error(message);}});
    await assert.rejects(untrusted.adapter.connect(),/^Error: CEF_PROTOCOL_OR_EOF$/);
    assert.equal(untrusted.failures[0].message,'CEF_PROTOCOL_OR_EOF');
  }
});

test('a presenter exception is classified without leaking its message or masking Gecko fallback',async()=>{
  const f=fixture();await f.adapter.connect();
  f.adapter.onFrame=()=>{throw new Error('private frame details '+token);};
  await assert.rejects(f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1}),
    {message:'CEF_FRAME_PRESENTATION_FAILED'});
  assert.equal(f.adapter.status,'failed');
  assert.equal(f.failures.at(-1).message,'CEF_FRAME_PRESENTATION_FAILED');
  assert.equal(f.adapter.readPhase,'frame_present');
});

test('native request errors expose only the exact stale mapping or a generic code',async()=>{
  for(const code of ['stale_target','navigation_in_progress','private payload '+token]){
    const f=fixture({nativeInputError:code});await f.adapter.connect();
    await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
    await assert.rejects(f.adapter.input(f.adapter.target,'key',{
      type:'up',native_key_code:0x37,windows_key_code:91,modifiers:0,text:''
    }),{message:code==='stale_target'?'STALE_CEF_TARGET':'CEF_ACTION_FAILED'});
    assert.equal(f.adapter.status,'active');assert.equal(f.failures.length,0);
    await f.adapter.close();
  }
});

test('a 40-key burst is serialized to eight in-flight commands while preserving every input',async()=>{
  const f=fixture({holdInput:true});await f.adapter.connect();
  await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
  const key={type:'char',native_key_code:0,windows_key_code:65,modifiers:0,text:'a'};
  const requests=Array.from({length:40},()=>f.adapter.input(f.adapter.target,'key',key));
  await tick();
  assert.equal(f.writes.filter(value=>value.method==='key').length,8);
  for(let completed=0;completed<40;completed++){
    const sent=f.writes.filter(value=>value.method==='key');
    assert.ok(sent.length-completed<=8,'native response queue stays below its 64-event bound');
    assert.ok(sent[completed],'queued input eventually receives one dispatch');
    f.event({event:'completed',request_id:sent[completed].request_id,status:'success',target:f.adapter.target});
    await tick();
  }
  assert.deepEqual((await Promise.all(requests)).map(value=>value.status),Array(40).fill('success'));
  assert.equal(f.writes.filter(value=>value.method==='key').length,40);
  assert.equal(f.failures.length,0);await f.adapter.close();
});

test('saturated bounded input fails closed instead of dropping a key release',async()=>{
  const f=fixture({holdInput:true});await f.adapter.connect();
  await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
  const key={type:'up',native_key_code:0,windows_key_code:65,modifiers:0,text:'a'};
  const requests=[];
  for(let i=0;i<73;i++){
    const result=f.adapter.input(f.adapter.target,'key',key);
    result.catch(()=>{});requests.push(result);
  }
  const settled=await Promise.allSettled(requests);
  assert.equal(f.adapter.status,'failed');
  assert.equal(f.failures.at(-1).message,'CEF_INPUT_BACKPRESSURE');
  assert.ok(settled.every(value=>value.status==='rejected'));
  assert.ok(f.writes.filter(value=>value.method==='key').length<=8);
});

test('queued input bound to an old document is rejected before first native dispatch',async()=>{
  const f=fixture({holdInput:true});await f.adapter.connect();
  await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
  const old=f.adapter.target,key={type:'char',native_key_code:0,windows_key_code:65,modifiers:0,text:'a'};
  const inputs=Array.from({length:10},()=>f.adapter.input(old,'key',key));
  for(const promise of inputs)promise.catch(()=>{});
  await tick();assert.equal(f.writes.filter(value=>value.method==='key').length,8);
  await f.adapter.navigate(old,origin+'/engine.html?page=2');
  const next=f.adapter.target;
  for(const sent of f.writes.filter(value=>value.method==='key')) {
    f.event({event:'error',request_id:sent.request_id,code:'stale_target',target:next});
    await tick();
  }
  const outcomes=await Promise.allSettled(inputs);
  assert.ok(outcomes.every(value=>value.status==='rejected'&&value.reason.message==='STALE_CEF_TARGET'));
  assert.equal(f.writes.filter(value=>value.method==='key').length,8,'two queued mutations were never sent or retried');
  assert.equal(f.adapter.status,'active');await f.adapter.close();
});

test('invalid geometry, target or UTF8 is rejected before reading binary payload',async()=>{
  for(const changed of [{stride:9},{width:4097},{target:{...full,private_mode:true}},{frame_id:Number.MAX_SAFE_INTEGER+1},{format:'PNG'}]){
    const pipe=new Pipe();pipe.push(packet(2,{...frame(),...changed},new Uint8Array(16)));
    await assert.rejects(readAXCF(pipe));assert.equal(pipe.reads.length,2);
  }
  const pipe=new Pipe(),data=packet(1,{version:1,event:'ready'});data[16]=255;pipe.push(data);await assert.rejects(readAXCF(pipe));
});

test('fixture restrictions reject lookalike hosts, credentials, schemes and arbitrary methods',()=>{
  for(const url of ['https://127.0.0.1:41231/engine.html','http://127.0.0.1:41231@evil.test/engine.html',origin+'/engine.html?post=1',origin+'/../secret','file:///engine.html'])assert.equal(allowedFixtureURL(url,origin),false);
  assert.equal(allowedFixtureURL(origin+'/engine.html?page=2',origin),true);
  assert.throws(()=>validateSurface({width:4096,height:4096,device_scale:2}),/UNSUPPORTED/);
  assert.throws(()=>validateCEFTarget({...full,document_generation:NaN}),/INVALID/);
  assert.throws(()=>validateCEFTarget({...full,extra:true}),/INVALID/);
});

test('web mode is explicitly negotiated and permits only web URLs or the inert start page',async()=>{
  for(const url of ['file:///secret','javascript:alert(1)','https://user:password@example.com/','https://example.com/\nsecret','data:text/html,hi']) {
    assert.equal(allowedWebURL(url),false);
  }
  for(const url of ['http://example.com/','https://example.com/path?q=hello#part','about:blank']) assert.equal(allowedWebURL(url),true);
  const f=fixture({browsingMode:'web'});await f.adapter.connect();
  assert.equal(f.writes[0].browsing_mode,'web');assert.equal(f.adapter.capabilities().fixture_only,false);
  await f.adapter.create('https://example.com/',{width:2,height:2,device_scale:1});
  await f.adapter.navigate(f.adapter.target,'https://other.example/path?q=explicit');
  assert.equal(f.adapter.status,'active');
  assert.equal((await f.adapter.navigate(f.adapter.target,'file:///secret')).status,'unsupported');
  await f.adapter.visibility(f.adapter.target,false);await f.adapter.edit(f.adapter.target,'paste');
  assert.throws(()=>f.adapter.edit(f.adapter.target,'arbitrary'),/INVALID_EDIT_ACTION/);
  assert.throws(()=>f.adapter.visibility(f.adapter.target,'false'),/INVALID_VISIBILITY/);
  assert.deepEqual(f.writes.filter(value=>['edit','visibility'].includes(value.method)).map(value=>[value.method,value.action??value.visible]),[['visibility',false],['edit','paste']]);
  await f.adapter.close();
});

test('web loads accept HTTP error documents and exact blank while requiring full negotiated safeguards',async()=>{
  for(const [url,status] of [['https://example.com/missing',404],['about:blank',0]]) {
    const f=fixture({browsingMode:'web',createStatus:status});await f.adapter.connect();
    await f.adapter.create(url,{width:2,height:2,device_scale:1});assert.equal(f.rendered.length,1);await f.adapter.close();
  }
  const f=fixture({browsingMode:'web',overrideReady:{capabilities:{fixture_only:false,edit:true,visibility:true,devtools:false,private_mode:false,ime:false}}});
  await assert.rejects(f.adapter.connect(),/UNVERIFIED_CEF_RUNTIME/);
});

test('web same-document loads revoke old targets and accept only a committed same origin',async()=>{
  for(const destination of ['https://example.com/path#anchor','https://other.example/']) {
    const f=fixture({browsingMode:'web'});await f.adapter.connect();
    await f.adapter.create('https://example.com/path',{width:2,height:2,device_scale:1});
    const previous=f.adapter.target, next={...previous,document_generation:2,navigation_generation:2};
    f.event({event:'navigation',target:next});f.event({event:'url',url:destination,target:next});
    f.event({event:'load',http_status:0,restored_from_history:false,same_document:true,target:next});f.sendFrame(next,2);
    await tick();await tick();
    assert.throws(()=>f.adapter.resolve(previous),/STALE_CEF_TARGET/);
    if(destination.startsWith('https://example.com/')) { assert.equal(f.rendered.length,2);await f.adapter.close(); }
    else assert.equal(f.adapter.status,'failed');
  }
});

test('engine switch carries the visible web address of a GET page, never POST results or non-web pages',()=>{
  const browser={currentURI:{spec:'https://example.com/page'},browsingContext:{activeSessionHistoryEntry:{URI:{spec:'https://example.com/page'},postData:null}}};
  assert.equal(transferableGeckoURL(browser),'https://example.com/page');
  for(const url of ['https://example.com/search?q=zen','https://example.com/page#section']) {
    browser.currentURI.spec=url;browser.browsingContext.activeSessionHistoryEntry.URI.spec=url;
    assert.equal(transferableGeckoURL(browser),url);
  }
  for(const url of ['https://user:pw@example.com/','about:blank','about:preferences','file:///secret']) {
    browser.currentURI.spec=url;browser.browsingContext.activeSessionHistoryEntry.URI.spec=url;
    assert.equal(transferableGeckoURL(browser),null);
  }
  browser.currentURI.spec='https://example.com/page';browser.browsingContext.activeSessionHistoryEntry.URI.spec=browser.currentURI.spec;
  browser.browsingContext.activeSessionHistoryEntry.postData={};assert.equal(transferableGeckoURL(browser),null);
  browser.browsingContext.activeSessionHistoryEntry.postData=null;browser.browsingContext.activeSessionHistoryEntry.URI.spec='https://example.com/older';
  assert.equal(transferableGeckoURL(browser),null);
  delete browser.browsingContext;assert.equal(transferableGeckoURL(browser),null);
});

test('fullscreen scale selection keeps logical geometry and the bounded BGRA frame',()=>{
  assert.deepEqual(fitCEFRenderSurface({width:1000,height:700,device_scale:2}),
    {width:1000,height:700,device_scale:2});
  const fullScreen=fitCEFRenderSurface({width:2560,height:1440,device_scale:2});
  assert.deepEqual(fullScreen,{width:2560,height:1440,device_scale:1.5});
  assert.ok(Math.ceil(fullScreen.width*fullScreen.device_scale)*Math.ceil(fullScreen.height*fullScreen.device_scale)*4<=33554432);
  assert.throws(()=>fitCEFRenderSurface({width:4096,height:4096,device_scale:2}),/UNSUPPORTED_SURFACE/);
  assert.throws(()=>fitCEFRenderSurface({width:0,height:700,device_scale:2}),/INVALID_SURFACE/);
});

test('CEF runtime must be the owned session of the actual Gecko profile',()=>{
  const root='/Volumes/AxioSozoBuild', session=root+'/runtime/0123456789abcdef/engine-probe-abcdef0123456789';
  assert.equal(validCEFSessionRuntime(root,session,session+'/gecko'),true);
  for(const [candidate,gecko] of [
    [session,root+'/runtime/0123456789abcdef/other/gecko'],
    [root+'/runtime/cef-old',root+'/runtime/cef-old/gecko'],
    [root+'/runtime/0123456789abcdef/../other',session+'/gecko'],
    ['/Volumes/DevStorage/runtime/0123456789abcdef/development','/Volumes/DevStorage/runtime/0123456789abcdef/development/gecko']
  ]) assert.equal(validCEFSessionRuntime(root,candidate,gecko),false);
  const sub=root+'/workstation', subSession=sub+'/runtime/0123456789abcdef/development';
  assert.equal(validCEFSessionRuntime(sub,subSession,subSession+'/gecko'),true);
  assert.equal(validCEFSessionRuntime(sub+'/nested',sub+'/nested/runtime/0123456789abcdef/development',sub+'/nested/runtime/0123456789abcdef/development/gecko'),false);
});

test('a sub build root shares the volume-root CEF host only',()=>{
  const volume='/Volumes/AxioSozoBuild';
  assert.equal(validCEFRoot(volume,volume),true);
  assert.equal(validCEFRoot(volume+'/workstation',volume),true);
  for(const [root,cef] of [[volume+'/workstation',volume+'/workstation'],[volume,volume+'/workstation'],
    [volume+'/workstation','/Volumes/DevStorage'],['/Volumes/AxioSozoBuildX/workstation',volume],
    [volume+'/a/b',volume],[volume+'/..',volume],[volume,''],[volume,undefined]])
    assert.equal(validCEFRoot(root,cef),false,`${root} ${cef}`);
});

test('unsupported native resize restores the previous authorized geometry',async()=>{
  const f=fixture({nativeResizeUnsupported:true});await f.adapter.connect();
  await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
  const result=await f.adapter.resize(f.adapter.target,{width:3,height:3,device_scale:1});
  assert.equal(result.status,'unsupported');
  assert.deepEqual(f.adapter.surface,{width:2,height:2,device_scale:1});
  await f.adapter.close();
});

test('input cannot override auth/envelope or use stale coordinates',()=>{
  const key={type:'char',native_key_code:0,windows_key_code:65,modifiers:0,text:'a'};
  for(const fields of [{...key,token:'forged'},{...key,method:'shutdown'},{...key,text:'x'.repeat(5)},{...key,modifiers:-1}])assert.throws(()=>validateCEFInput('key',fields,{width:2,height:2}));
  assert.deepEqual(validateCEFInput('key',key,{width:2,height:2}),key);
  assert.throws(()=>validateCEFInput('wheel',{x:3,y:0,modifiers:0,delta_x:0,delta_y:-1},{width:2,height:2}));
});

test('header version alone cannot establish actual runtime identity',async()=>{
  const f=fixture({overrideReady:{runtime_chromium:'999.0.0.0'}});
  await assert.rejects(f.adapter.connect());assert.equal(f.rendered.length,0);assert.equal(f.failures.length,1);
});

test('create acceptance and load cannot commit presentation before a live frame arrives',async()=>{
  const f=fixture({autoFrame:false});await f.adapter.connect();let committed=false;
  const creation=f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1}).then(()=>{committed=true;});
  await tick();assert.equal(committed,false);assert.equal(f.rendered.length,0);
  f.sendFrame();await creation;assert.equal(committed,true);assert.equal(f.rendered.length,1);
  await f.adapter.close();assert.equal(f.adapter.status,'closed');
});

test('stale frames release their exact credit without rendering or authorizing action',async()=>{
  const f=fixture();await f.adapter.connect();await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
  const original=f.adapter.target;await f.adapter.navigate(original,origin+'/engine.html?page=2');
  assert.throws(()=>f.adapter.resolve(original),/STALE/);
  f.sendFrame(original,2);f.sendFrame(f.adapter.target,3);await tick();await tick();
  assert.equal(f.rendered.length,2);assert.equal(f.rendered.at(-1).meta.frame_id,3);
  const ack=f.writes.find(item=>item.method==='frame_ack'&&item.frame_id===2);assert.deepEqual(ack.target,original);
  await f.adapter.close();
});

test('HTTP0 renders only for an explicit history request to a known committed fixture URL',async()=>{
  for(const variant of ['unsolicited','unknown-url','valid']){
    const f=fixture({manualHistory:true});await f.adapter.connect();await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
    let history;
    if(variant!=='unsolicited')history=f.adapter.back(f.adapter.target).catch(()=>{});
    await tick();
    if(variant==='unknown-url')f.event({event:'url',url:origin+'/engine.html?page=2',target:full});
    f.event({event:'load',http_status:0,restored_from_history:true,target:full});f.sendFrame(full,2);
    await tick();await tick();
    if(variant==='valid'){
      assert.equal(f.rendered.length,2);assert.equal(f.failures.length,0);
      const request=f.writes.find(value=>value.method==='back');
      f.event({event:'completed',request_id:request.request_id,status:'success',target:full});await history;
      await f.adapter.close();
    }else{assert.equal(f.rendered.length,1);assert.equal(f.adapter.status,'failed');if(history)await history;}
  }
});

test('foreign and future frame targets fail closed, never migrate or retry',async()=>{
  for(const changed of [{engine_instance:'other-instance'},{document_generation:999}]){
    const f=fixture();await f.adapter.connect();await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
    f.sendFrame({...f.adapter.target,...changed},2);await tick();await tick();
    assert.equal(f.adapter.status,'failed');assert.equal(f.rendered.length,1);
    assert.equal(f.writes.filter(item=>item.method==='create').length,1);
  }
});

test('native BGRA conversion handles premultiplied alpha; browser shortcuts stay in chrome',()=>{
  const frameBytes=Uint8Array.of(10,20,30,255,0,64,128,128).buffer;
  const rgba=bgraToRGBA(frameBytes);
  assert.equal(rgba.buffer,frameBytes,'large paints reuse their owned transport buffer');
  assert.deepEqual([...rgba],[30,20,10,255,255,128,0,128]);
  const crossRealm=otherRealmBuffer(Uint8Array.of(10,20,30,255).buffer);
  assert.deepEqual([...bgraToRGBA(crossRealm)],[30,20,10,255]);
  const event={key:'a',code:'KeyA',keyCode:65,metaKey:false,ctrlKey:false,altKey:false,shiftKey:false,buttons:0};
  assert.equal(keyboardRoute({...event,key:'l',metaKey:true}),'chrome');
  assert.equal(keyboardRoute({...event,key:'c',metaKey:true}),'unsupported');
  assert.equal(keyboardRoute({...event,isComposing:true}),'unsupported');
  assert.equal(cefKey(event,'down').native_key_code,0);
});

function presenterFixture() {
  const listeners=new Map(), nodes=[], observers=[], opened=[], navigations=[];
  let geometry={width:2,height:2};
  const element=()=>({style:{},children:[],handlers:new Map(),setAttribute(){},appendChild(child){this.children.push(child);child.parentNode=this;},
    remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(child=>child!==this);},
    addEventListener(type,handler){this.handlers.set(type,handler);},removeEventListener(type){this.handlers.delete(type);},
    focus(){},hasPointerCapture:()=>false,setPointerCapture(){},releasePointerCapture(){},
    getBoundingClientRect:()=>({left:0,top:0,...geometry}),getContext:()=>({putImageData(){}})});
  const stack={...element(),classList:{contains:value=>value==='browserStack'}};
  const browser={style:{visibility:''},parentNode:stack,currentURI:{spec:origin+'/engine.html'},getBoundingClientRect:()=>geometry};
  const tab={linkedBrowser:browser,label:'SYNTHETIC PROTOCOL FIXTURE',isConnected:true};
  let geckoTarget={...full,engine:'gecko',engine_instance:'gecko-fixture'};
  const original=()=>{};
  const root=element();root.attributes=new Map();root.toggleAttribute=(key,value)=>{if(value)root.attributes.set(key,'');else root.attributes.delete(key);};root.removeAttribute=key=>root.attributes.delete(key);
  const win={Services:{env:{get:()=>origin},io:{newURI:spec=>({spec})}},performance,devicePixelRatio:1,queueMicrotask,
    document:{hidden:false,documentElement:root,createElementNS:()=>{const node=element();nodes.push(node);return node;},
      addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)},
    ImageData:class{constructor(data,width,height){Object.assign(this,{data,width,height});}},
    ResizeObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){}},getComputedStyle:()=>({position:'static'}),
    requestAnimationFrame:callback=>queueMicrotask(callback),
    gBrowser:{selectedTab:tab,selectedBrowser:browser,tabContainer:{addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)},
      updateTitlebar(){},setTabTitle(){}},
    BrowserUtils:{whereToOpenLink:()=> 'current'},
    BrowserCommands:{back:original,forward:original,reload:original,reloadSkipCache:original},
    UpdateBackForwardCommands:original,
    gURLBar:{focused:false,setURI(){},handleNavigation:original,view:{close(){}}},
    openTrustedLinkIn(url,where,params){opened.push({url,where,params});},
  };
  const gecko={find:()=>({}),target:()=>geckoTarget,resolve:value=>{assert.deepEqual(value,geckoTarget);}};
  let settle, hooks, closeCount=0;
  const resizeCalls=[], inputCalls=[], visibilityCalls=[], editCalls=[], launchCalls=[];
  const ready=new Promise((resolve,reject)=>{settle={resolve,reject};});
  const launch=async(_win,callbacks)=>{
    hooks=callbacks;launchCalls.push(callbacks);
    return {target:{...full,tab_id:callbacks.tabId},surface:{width:2,height:2,device_scale:1},create:url=>{callbacks.startURL=url;return ready;},
      allowedURL:allowedWebURL,visibility:async(_target,visible)=>{visibilityCalls.push({tabId:callbacks.tabId,visible});return {status:'success'};},
      edit:async(_target,action)=>{editCalls.push(action);return {status:'success'};},
      resize(_target,surface){resizeCalls.push(surface);this.surface=surface;return Promise.resolve({status:'success'});},
      input(_target,method,fields){inputCalls.push({method,fields});return Promise.resolve({status:'success'});},
      navigate:async(_target,url)=>{navigations.push({tabId:callbacks.tabId,url});return {status:'success'};},
      back:async()=>({status:'success'}),reload:async()=>({status:'success'}),stop:async()=>({status:'success'}),
      close:async()=>{closeCount++;}};
  };
  return {win,gecko,launch,stack,browser,tab,listeners,original,nodes,settle,resizeCalls,inputCalls,visibilityCalls,editCalls,launchCalls,opened,navigations,
    addTab:()=>{const nextStack={...element(),classList:{contains:value=>value==='browserStack'}};
      const nextBrowser={...browser,style:{visibility:''},parentNode:nextStack};
      return {linkedBrowser:nextBrowser,label:'SECOND FIXTURE',isConnected:true};},
    setGeometry:value=>{geometry=value;},triggerResize:()=>observers.at(-1).callback(),
    mutate:()=>{geckoTarget={...geckoTarget,document_generation:2};},
    paint:()=>hooks.onFrame(frame(),new ArrayBuffer(16)),get closeCount(){return closeCount;}};
}

test('presenter initialization restores all wrappers/listeners when an audited API is absent',()=>{
  const f=presenterFixture();delete f.win.UpdateBackForwardCommands;
  assert.throws(()=>new CEFPresenter(f.win,f.gecko),/UNSUPPORTED_BROWSER_API/);
  assert.equal(f.win.BrowserCommands.back,f.original);assert.equal(f.win.BrowserCommands.reload,f.original);
  assert.equal(f.listeners.size,0);
});

test('failed candidate or a changed Gecko document cannot hide/delete the original tab',async()=>{
  for(const changed of [false,true]) {
    const f=presenterFixture(),presenter=new CEFPresenter(f.win,f.gecko,{launch:f.launch});
    const switchResult=presenter.switchToChromium();await tick();
    assert.equal(f.browser.style.visibility,'');assert.equal(presenter.record,null);
    if(changed){f.mutate();f.paint();f.settle.resolve(full);}else f.settle.reject(new Error('SYNTHETIC CANDIDATE FAILURE'));
    await assert.rejects(switchResult);assert.equal(f.browser.style.visibility,'');
    assert.equal(f.stack.children.length,0);assert.equal(f.closeCount,1);assert.equal(f.win.gBrowser.selectedTab,f.tab);
    await presenter.dispose();
  }
});

test('controlled presenter fixture commits only after adapter proof, then restores Gecko ownership',async()=>{
  const f=presenterFixture(),presenter=new CEFPresenter(f.win,f.gecko,{launch:f.launch});
  const result=presenter.switchToChromium();await tick();assert.equal(presenter.record,null);
  f.paint();f.settle.resolve(full);await result;assert.equal(f.browser.style.visibility,'hidden');
  assert.equal(presenter.diagnostics().frames,1);assert.equal(f.win.gBrowser.selectedTab,f.tab);
  await presenter.switchToGecko();assert.equal(f.browser.style.visibility,'');assert.equal(f.closeCount,1);
  await presenter.dispose();assert.equal(f.listeners.size,0);assert.equal(f.win.BrowserCommands.back,f.original);
});

test('presenter survives fullscreen-sized resize and restores Retina on window shrink',async()=>{
  const f=presenterFixture(), indicators=[];
  const presenter=new CEFPresenter(f.win,f.gecko,{launch:f.launch,onEngineChange:value=>indicators.push(value)});
  const switching=presenter.switchToChromium();await tick();f.paint();f.settle.resolve(full);await switching;
  f.win.devicePixelRatio=2;f.setGeometry({width:2560,height:1440});f.triggerResize();await tick();await tick();
  assert.equal(presenter.diagnostics().engine,'chromium');
  assert.deepEqual(f.resizeCalls.at(-1),{width:2560,height:1440,device_scale:1.5});
  assert.equal(presenter.diagnostics().renderScaleLimited,true);
  assert.match(indicators.at(-1).reason,/render scale capped at 1.5/);
  f.setGeometry({width:1000,height:700});f.triggerResize();await tick();await tick();
  assert.deepEqual(f.resizeCalls.at(-1),{width:1000,height:700,device_scale:2});
  assert.equal(presenter.diagnostics().renderScaleLimited,false);
  assert.equal(f.browser.style.visibility,'hidden');
  await presenter.dispose();assert.equal(f.closeCount,1);
});

test('input during a pending resize cannot use mismatched native coordinates; pointer-up is released later',async()=>{
  const f=presenterFixture(),presenter=new CEFPresenter(f.win,f.gecko,{launch:f.launch});
  const switching=presenter.switchToChromium();await tick();f.paint();f.settle.resolve(full);await switching;
  const adapter=presenter.record.adapter,originalResize=adapter.resize.bind(adapter);
  let releaseResize;
  adapter.resize=(target,surface)=>new Promise(resolve=>{releaseResize=()=>originalResize(target,surface).then(resolve);});
  f.win.devicePixelRatio=2;f.setGeometry({width:2560,height:1440});f.triggerResize();await tick();
  const canvas=presenter.record.canvas;
  canvas.handlers.get('pointerup')({isTrusted:true,pointerId:1,clientX:2500,clientY:1400,
    button:0,detail:1,buttons:0,preventDefault(){}});
  canvas.handlers.get('wheel')({isTrusted:true,clientX:2500,clientY:1400,
    deltaMode:0,deltaX:0,deltaY:120,buttons:0,preventDefault(){}});
  assert.equal(f.inputCalls.length,0);
  releaseResize();await tick();await tick();
  assert.equal(f.inputCalls.length,1);
  assert.equal(f.inputCalls[0].method,'mouse');assert.equal(f.inputCalls[0].fields.type,'up');
  assert.ok(f.inputCalls[0].fields.x<=adapter.surface.width);
  assert.equal(presenter.diagnostics().engine,'chromium');
  await presenter.dispose();
});

test('stale native keyup racing history back preserves the live CEF presentation without replay',async()=>{
  const ui=presenterFixture(),native=fixture({historyRace:true,nativeInputError:'stale_target'});
  const failures=[],indicators=[];
  const presenter=new CEFPresenter(ui.win,ui.gecko,{
    launch:async(_win,callbacks)=>{
      native.adapter.onFrame=callbacks.onFrame;native.adapter.onEvent=callbacks.onEvent;
      native.adapter.onFailure=callbacks.onFailure;
      return native.adapter.connect();
    },onFailure:error=>failures.push(error),onEngineChange:value=>indicators.push(value)
  });
  await presenter.switchToChromium();
  const originalTarget=native.adapter.target;
  ui.win.BrowserCommands.back();
  // Native back revokes the old document before its navigation event has been
  // consumed by chrome. A modifier keyup is already queued with that old target.
  presenter.record.canvas.handlers.get('keyup')({isTrusted:true,key:'Meta',code:'MetaLeft',
    keyCode:91,metaKey:false,ctrlKey:false,altKey:false,shiftKey:false,buttons:0,
    preventDefault(){},stopPropagation(){}});
  await tick();await tick();
  assert.equal(native.adapter.target.document_generation,originalTarget.document_generation+1);
  assert.equal(native.adapter.target.navigation_generation,originalTarget.navigation_generation+1);
  assert.throws(()=>native.adapter.resolve(originalTarget),/STALE_CEF_TARGET/);
  assert.equal(presenter.diagnostics().engine,'chromium');assert.equal(presenter.diagnostics().frames,2);
  assert.equal(ui.browser.style.visibility,'hidden');assert.equal(ui.win.gBrowser.selectedTab,ui.tab);
  assert.equal(native.writes.filter(value=>value.method==='key').length,1);
  assert.equal(native.writes.some(value=>value.method==='close'||value.method==='shutdown'),false);
  assert.equal(failures.length,0);
  assert.equal(indicators.at(-1).reason,'Input discarded after navigation');
  await presenter.dispose();
});

test('daily Chromium is lazy, retains per-tab surfaces, suspends hidden painting, and restores each Gecko owner',async()=>{
  const f=presenterFixture(),second=f.addTab();
  f.browser.docShellIsActive=true;second.linkedBrowser.docShellIsActive=false;
  const geckoTargets=new Map([[f.browser,{...full,engine:'gecko',tab_id:'first',engine_instance:'gecko-fixture'}],
    [second.linkedBrowser,{...full,engine:'gecko',tab_id:'second',engine_instance:'gecko-fixture'}]]);
  f.gecko.find=browser=>({browser});f.gecko.target=record=>geckoTargets.get(record.browser);f.gecko.resolve=target=>assert.ok([...geckoTargets.values()].includes(target));
  const presenter=new CEFPresenter(f.win,f.gecko,{launch:f.launch,browsingMode:'web'});
  assert.equal(f.launchCalls.length,0);
  const firstSwitch=presenter.switchToChromium();await tick();f.paint();f.settle.resolve(full);await firstSwitch;await tick();
  assert.equal(f.launchCalls[0].startURL,'about:blank','unverified old document is never replayed');
  assert.equal(f.launchCalls[0].origin,'https://axiosozo.invalid');
  assert.equal(f.browser.docShellIsActive,false);assert.ok(f.win.document.documentElement.attributes.has('axiosozo-cef-active'));
  f.win.gBrowser.selectedTab=second;f.win.gBrowser.selectedBrowser=second.linkedBrowser;f.listeners.get('TabSelect')();await tick();
  assert.equal(presenter.diagnostics().engine,'gecko');assert.deepEqual(presenter.owners(),['first']);
  assert.deepEqual(f.visibilityCalls.at(-1),{tabId:'first',visible:false});
  const firstRecord=presenter.records.get(f.tab),firstFrames=firstRecord.displayedFrames;
  f.launchCalls[0].onFrame(frame(),new ArrayBuffer(16));assert.equal(firstRecord.displayedFrames,firstFrames);
  await presenter.switchToChromium();await tick();assert.deepEqual(presenter.owners(),['first','second']);
  assert.equal(f.closeCount,0);assert.equal(f.browser.style.visibility,'hidden');assert.equal(second.linkedBrowser.style.visibility,'hidden');
  f.win.document.hidden=true;f.listeners.get('visibilitychange')();await tick();assert.deepEqual(f.visibilityCalls.at(-1),{tabId:'second',visible:false});
  await presenter.switchToGecko();assert.deepEqual(presenter.owners(),['first']);assert.equal(second.linkedBrowser.style.visibility,'');
  f.win.document.hidden=false;f.win.gBrowser.selectedTab=f.tab;f.win.gBrowser.selectedBrowser=f.browser;f.listeners.get('TabSelect')();await tick();
  assert.equal(presenter.diagnostics().engine,'chromium');assert.equal(f.launchCalls.length,2);
  const canvas=presenter.active.canvas;
  canvas.handlers.get('keydown')({isTrusted:true,key:'v',code:'KeyV',keyCode:86,metaKey:true,buttons:0,preventDefault(){},stopPropagation(){}});
  await tick();assert.deepEqual(f.editCalls,['paste']);assert.equal(f.inputCalls.length,0);
  await assert.rejects(presenter.navigate('https://example.com/',{postData:{}}),/CEF_POST_REPLAY_BLOCKED/);
  await presenter.dispose();assert.equal(f.closeCount,2);assert.equal(f.browser.docShellIsActive,true);
  assert.equal(f.listeners.size,0);assert.equal(f.win.document.documentElement.attributes.has('axiosozo-cef-active'),false);
});

test('active media or capture cannot hide behind Chromium, including capture that starts after commit',async()=>{
  for(const sharing of [{camera:true},{microphone:true},{screen:'Screen'}]) {
    const f=presenterFixture();f.win.gBrowser.getTabSharingState=()=>sharing;
    const presenter=new CEFPresenter(f.win,f.gecko,{launch:f.launch,browsingMode:'web'});
    await assert.rejects(presenter.switchToChromium(),/CEF_ACTIVE_CAPTURE_MUST_STOP/);
    assert.equal(f.launchCalls.length,0);await presenter.dispose();
  }
  const f=presenterFixture();let sharing={};f.win.gBrowser.getTabSharingState=()=>sharing;
  const presenter=new CEFPresenter(f.win,f.gecko,{launch:f.launch,browsingMode:'web'});
  const switching=presenter.switchToChromium();await tick();f.paint();f.settle.resolve(full);await switching;
  sharing={microphone:true};f.listeners.get('TabAttrModified')({target:f.tab});await tick();
  assert.equal(presenter.diagnostics().engine,'gecko');assert.equal(f.browser.style.visibility,'');assert.equal(f.closeCount,1);
  await presenter.dispose();
});

test('IME commands admit the optional cef-v1 fields only by name and within UTF-16 bounds',()=>{
  const surface={width:900,height:650},ime={ime:true};
  const base={text:'ka',selection_start:2,selection_end:2};
  assert.deepEqual(validateCEFInput('ime_set_composition',base,surface,ime),base);
  const full={...base,underlines:[{start:0,end:2,thick:true}],replacement_range:{start:3,end:3}};
  assert.deepEqual(validateCEFInput('ime_set_composition',full,surface,ime),full);
  for(const bad of [{...base,underlines:[{start:0,end:3,thick:true}]},{...base,underlines:[{start:1,end:0,thick:false}]},
    {...base,underlines:[{start:0,end:1}]},{...base,underlines:Array.from({length:17},()=>({start:0,end:1,thick:false}))},
    {...base,replacement_range:{start:2,end:1}},{...base,replacement_range:{start:-1,end:1}},{...base,replacement_range:{start:0}},
    {...base,relative_cursor_pos:0},{...base,selection_range:{start:0,end:0}}])
    assert.throws(()=>validateCEFInput('ime_set_composition',bad,surface,ime),/INVALID_CEF_IME/);
  assert.ok(validateCEFInput('ime_commit_text',{text:'日本',replacement_range:{start:0,end:2},relative_cursor_pos:-1},surface,ime));
  assert.throws(()=>validateCEFInput('ime_commit_text',{text:'x',relative_cursor_pos:1.5},surface,ime),/INVALID_CEF_IME/);
  assert.throws(()=>validateCEFInput('ime_commit_text',{text:'x',relative_cursor_pos:70000},surface,ime),/INVALID_CEF_IME/);
  assert.ok(validateCEFInput('ime_finish_composing',{keep_selection:true},surface,ime));
  assert.ok(validateCEFInput('ime_finish_composing',{},surface,ime));
  assert.throws(()=>validateCEFInput('ime_finish_composing',{keep_selection:1},surface,ime),/INVALID_CEF_IME/);
  assert.throws(()=>validateCEFInput('ime_cancel_composition',{keep_selection:true},surface,ime),/INVALID_CEF_IME/);
  // The copy is detached from the caller's nested objects.
  const copy=validateCEFInput('ime_set_composition',full,surface,ime);full.underlines[0].end=9;assert.equal(copy.underlines[0].end,2);
});

// Accessibility (docs/design/engine-accessibility.md §6, §8.3). Controlled packets only.
const AX_READY={capabilities:{fixture_only:true,devtools:false,private_mode:false,ime:false,accessibility:true,
  ax_actions:['press','focus','scroll_to','set_value','show_menu','increment','decrement']}};
const axUpdate=(target,extra={})=>({event:'ax_tree_update',target,seq:1,batch:1,reset:true,final:true,root:1,focus:0,px:2,
  events:[],truncated:false,nodes:[{id:1,role:'rootWebArea',b:[0,0,2,2],oc:0,kids:[]}],...extra});

test('ready must announce accessibility as a boolean, and its action list when true',async()=>{
  for(const capabilities of [{...AX_READY.capabilities,accessibility:undefined},{...AX_READY.capabilities,ax_actions:undefined},
    {...AX_READY.capabilities,accessibility:'yes'}]){
    const f=fixture({overrideReady:{capabilities}});
    await assert.rejects(f.adapter.connect());assert.equal(f.failures[0].message,'UNVERIFIED_CEF_RUNTIME');
  }
});

test('accessibility events are validated, delivered, and credited against their exact target',async()=>{
  const f=fixture({overrideReady:AX_READY});await f.adapter.connect();
  await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
  f.event(axUpdate(f.adapter.target));
  f.event({event:'ax_location',target:f.adapter.target,seq:2,nodes:[{id:1,b:[0,0,2,2],oc:0}]});
  await tick();await tick();
  assert.deepEqual(f.events.filter(item=>item.event.startsWith('ax_')).map(item=>item.event),['ax_tree_update','ax_location']);
  const enabled=await f.adapter.accessibility(true);assert.equal(enabled.status,'success');
  assert.deepEqual(f.writes.find(item=>item.method==='accessibility').enabled,true);
  await f.adapter.axAction(1,'set_value','typed');
  const action=f.writes.find(item=>item.method==='ax_action');
  assert.deepEqual([action.node_id,action.action,action.value],[1,'set_value','typed']);
  assert.throws(()=>f.adapter.axAction(1,'press','x'));
  assert.throws(()=>f.adapter.accessibility('on'));
  const original=f.adapter.target;
  await f.adapter.axAck(original,1);
  const ack=f.writes.find(item=>item.method==='ax_ack');assert.equal(ack.seq,1);assert.deepEqual(ack.target,original);
  assert.equal(f.failures.length,0);await f.adapter.close();
});

test('a malformed or unannounced accessibility event ends the tab with a fixed code',async()=>{
  for(const [overrideReady,mutate] of [[AX_READY,event=>({...event,nodes:[{...event.nodes[0],onclick:'x'}]})],
    [AX_READY,event=>({...event,nodes:[{...event.nodes[0],url:'javascript:alert(1)'}]})],
    [{},event=>event]]){
    const f=fixture({overrideReady});await f.adapter.connect();
    await f.adapter.create(origin+'/engine.html',{width:2,height:2,device_scale:1});
    if(!overrideReady.capabilities)assert.equal((await f.adapter.accessibility(true)).reason,'ACCESSIBILITY_UNSUPPORTED');
    f.event(mutate(axUpdate(f.adapter.target)));await tick();await tick();
    assert.equal(f.failures.at(-1)?.message,'INVALID_CEF_ACCESSIBILITY');
  }
});
