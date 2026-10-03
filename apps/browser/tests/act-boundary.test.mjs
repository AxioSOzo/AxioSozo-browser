// Fake-only standard parameter/ownership tests. These source tokens are not JS.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentActBoundary, AgentActBoundaryError, ACT_BOUNDARY_SANDBOX } from '../chrome/AgentActBoundary.sys.mjs';
const SOURCES=Object.freeze({captureDocument:'OPAQUE_CLAUDE_DOCUMENT_SOURCE',click:'OPAQUE_CLAUDE_CLICK_SOURCE',
  type:'OPAQUE_CLAUDE_TYPE_SOURCE',navigate:'OPAQUE_CLAUDE_NAVIGATE_SOURCE'});
const SESSION=Object.freeze({session:'s_0000000000000001',project_id:'p_shaped',state:'approved'});
const EXPECTED=Object.freeze({tab_id:'t_1',url:'https://synthetic.invalid/',document_id:'7',private:false,
  engine:'gecko',project_id:'p_shaped',userContextId:2,binding_token:'b_1'});
const PARAMETERS=Object.freeze({'page.click':{tab_id:'t_1',selector:'#synthetic-action'},
  'page.type':{tab_id:'t_1',selector:'.synthetic-input',text:'Plain synthetic\ntext'},
  'tabs.navigate':{tab_id:'t_1',url:'https://synthetic.invalid/next'},'tabs.open':{url:'https://synthetic.invalid/new'}});
const METHODS=Object.keys(PARAMETERS), tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve,reject; const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const rejected=(promise,code,dispatched)=>assert.rejects(promise,error=>error.code===code
  && (dispatched===undefined || error.effect_dispatched===dispatched));
function timers(){let next=0;const entries=new Map();return {
  setTimer(fn,ms){const id=++next;entries.set(id,{fn,ms});return id;},clearTimer(id){entries.delete(id);},
  fire(ms){for(const [id,entry]of [...entries])if(entry.ms===ms){entries.delete(id);entry.fn();}},get size(){return entries.size;}};}
const captured=()=>({type:'success',realm:'native-realm-1',result:{type:'node',handle:'root-document-1'}});
const completed=()=>({type:'success',realm:'native-realm-1',result:{type:'boolean',value:true}});
function fixture(overrides={}){
  const clock=timers(),external=new AbortController(),calls=[];
  const counts={factory:0,proof:0,confirmation:0,close:0,begin:0,reconcile:0,mint:0,blank:0,adopt:0,closeTarget:0};
  const f={clock,external,calls,counts,current:true,freeze:true,expected:EXPECTED,claim:Object.freeze({opaque:true}),allocationLease:Object.freeze({opaqueAllocation:true}),createdContext:'new-native-context'};
  const invoke=(key,args,normal)=>{counts[key]++;return overrides[key]?overrides[key](f,...args):normal();};
  const owner=Object.freeze({execute(module,command,params){calls.push({module,command,params});
    if(overrides.execute)return overrides.execute(f,module,command,params);
    if(command==='create')return {context:f.createdContext};
    if(command==='navigate')return {navigation:null,url:params.url};
    return params.functionDeclaration===SOURCES.captureDocument?captured():completed();},
    close(){return invoke('close',[],()=>true);}});
  f.owner=owner;
  const deps={capabilities:Object.freeze({click:true,type:true,navigate:true,open:true}),sources:SOURCES,
    validateSources:(method,sources)=>overrides.sources?overrides.sources(f,method,sources):f.freeze,
    isActive:(expected,request)=>overrides.active?overrides.active(f,expected,request):f.current&&expected===f.expected,
    isSensitiveHost:()=>false,
    createOwner:(request,context)=>invoke('factory',[request,context],()=>{f.request=request;f.context=context;return owner;}),
    validateDocumentProof:(value,request,context)=>invoke('proof',[value,request,context],()=>{assert.equal(value,owner);return true;}),
    consumeConfirmation:(request,options)=>invoke('confirmation',[request,options],()=>{assert.equal(options.signal,external.signal);return true;}),
    beginCreatedTarget:(value,request)=>invoke('begin',[value,request],()=>{assert.equal(value,owner);return f.allocationLease;}),
    reconcileCreatedTarget:(lease,value,request)=>invoke('reconcile',[lease,value,request],()=>{assert.equal(lease,f.allocationLease);assert.equal(value,owner);return true;}),
    claimCreatedTarget:(value,context,request)=>invoke('mint',[value,context,request],()=>{assert.equal(value,owner);assert.equal(context,f.createdContext);return f.claim;}),
    isCreatedTargetBlank:(claim,request)=>invoke('blank',[claim,request],()=>{assert.equal(claim,f.claim);return true;}),
    adoptCreatedTarget:(claim,request)=>invoke('adopt',[claim,request],()=>{assert.equal(claim,f.claim);return {tab_id:'t_2'};}),
    closeCreatedTarget:(claim,request)=>invoke('closeTarget',[claim,request],()=>{assert.equal(claim,f.claim);return true;}),
    setTimer:clock.setTimer,clearTimer:clock.clearTimer,timeoutMs:5000,cleanupMs:100,...overrides.deps};
  f.boundary=createAgentActBoundary(deps);f.deps=deps;
  f.run=(method='page.click',params=PARAMETERS[method],session=SESSION,options={})=>f.boundary.executeMethod(method,params,session,
    {expected:f.expected,context:'owned-native-context',userContext:'owned-native-user-context',signal:external.signal,...options});
  return f;
}
async function expire(f){for(let i=0;i<5;i++){await tick();f.clock.fire(100);}}

test('all capabilities default false and absence/malformed dependencies prevent native construction',async()=>{
  for(const deps of [{capabilities:{}},{sources:null},{createOwner:null},{validateDocumentProof:null},{validateSources:()=>false}]){
    const f=fixture({deps});assert.deepEqual(f.boundary.getCapabilities(),{click:false,type:false,navigate:false,open:false});
    for(const method of METHODS)await rejected(f.run(method),'UNAVAILABLE',false);
    assert.equal(f.counts.factory,0);assert.equal(f.calls.length,0);
  }
  const f=fixture();for(const values of [{setTimer:null},{clearTimer:undefined},{timeoutMs:0},{cleanupMs:5001}])
    assert.throws(()=>createAgentActBoundary({...f.deps,...values}),TypeError);
});
for(const method of ['page.click','page.type','tabs.navigate'])test(`${method} maps exactly one effect to context+sandbox root document handle`,async()=>{
  const phases=[];const f=fixture({proof:(_f,_owner,request,options)=>{phases.push(options);assert.equal(request.expected,EXPECTED);return true;}});
  assert.deepEqual(await f.run(method),{});assert.equal(f.counts.factory,1);assert.equal(f.counts.close,1);assert.equal(f.counts.confirmation,1);
  assert.equal(f.calls.length,2);assert.equal(f.calls[0].params.functionDeclaration,SOURCES.captureDocument);
  const first=f.calls[0],effect=f.calls[1];
  assert.deepEqual(first.params.target,{context:'owned-native-context',sandbox:ACT_BOUNDARY_SANDBOX});
  assert.equal(first.params.resultOwnership,'root');assert.equal(first.params.awaitPromise,false);assert.equal(first.params.userActivation,false);
  assert.deepEqual(first.params.serializationOptions,{maxDomDepth:0,maxObjectDepth:0,includeShadowTree:'none'});assert.deepEqual(first.params.arguments,[]);
  assert.equal(effect.module,'script');assert.equal(effect.command,'callFunction');assert.equal('realm'in effect.params.target,false);
  assert.equal(effect.params.resultOwnership,'none');assert.equal(effect.params.functionDeclaration,SOURCES[method.split('.').at(-1)]);
  assert.deepEqual(effect.params.arguments.slice(0,2),[{handle:'root-document-1'},{type:'string',value:EXPECTED.url}]);
  assert.equal(effect.params.arguments[2].value,method==='tabs.navigate'?PARAMETERS[method].url:PARAMETERS[method].selector);
  if(method==='page.type')assert.equal(effect.params.arguments[3].value,PARAMETERS[method].text);
  assert.deepEqual(phases.map(value=>value.phase),['beforeBinding','beforeEffect']);
  assert.deepEqual(phases[1].binding,{handle:'root-document-1',realm:'native-realm-1',context:'owned-native-context',sandbox:ACT_BOUNDARY_SANDBOX});
  assert.equal(f.context.requestSignal,f.external.signal);assert.notEqual(f.context.signal,f.external.signal);
  assert.equal(f.boundary.getState().busy,false);assert.equal(f.clock.size,0);
});
test('open uses standard background create and wait:none navigation, skips action confirmation and adopts',async()=>{
  const f=fixture();assert.deepEqual(await f.run('tabs.open'),{tab_id:'t_2'});
  assert.deepEqual(f.calls,[{module:'browsingContext',command:'create',params:{type:'tab',background:true,
    referenceContext:'owned-native-context',userContext:'owned-native-user-context'}},
    {module:'browsingContext',command:'navigate',params:{context:'new-native-context',url:PARAMETERS['tabs.open'].url,wait:'none'}}]);
  assert.equal(f.counts.begin,1);assert.equal(f.counts.reconcile,0);assert.equal(f.counts.confirmation,0);assert.equal(f.counts.blank,1);assert.equal(f.counts.adopt,1);assert.equal(f.counts.closeTarget,0);
  assert.equal(f.counts.close,1);assert.equal(f.boundary.getState().retained_created_targets,0);
});
test('strict parameters/project/private/source gates refuse before native effects',async()=>{
  const f=fixture();for(const [method,params,session,options,code]of [
    ['page.click',{...PARAMETERS['page.click'],source:'forbidden'},SESSION,{},'INVALID_PARAMS'],
    ['page.type',{...PARAMETERS['page.type'],text:'x'.repeat(4097)},SESSION,{},'INVALID_PARAMS'],
    ['tabs.navigate',{tab_id:'t_1',url:'file:///synthetic'},SESSION,{},'BLOCKED_CATEGORY'],
    ['page.click',PARAMETERS['page.click'],{...SESSION,project_id:null},{},'NO_PROJECT'],
    ['page.click',PARAMETERS['page.click'],{...SESSION,project_id:'p_other'},{},'NOT_IN_PROJECT'],
    ['page.click',PARAMETERS['page.click'],SESSION,{expected:Object.freeze({...EXPECTED,private:true})},'PRIVATE'],
  ])await rejected(f.run(method,params,session,options),code);
  assert.equal(f.counts.factory,0);assert.equal(f.calls.length,0);
  let getters=0;const params={tab_id:'t_1',get selector(){getters++;return '#synthetic';}};
  await rejected(f.run('page.click',params),'INVALID_PARAMS');assert.equal(getters,0);
});
for(const phase of ['beforeBinding','beforeEffect'])test(`missing ${phase} native proof prevents effect dispatch`,async()=>{
  const f=fixture({proof:(_f,_owner,_request,options)=>options.phase!==phase});
  await rejected(f.run(),'UNAVAILABLE',false);assert.equal(f.calls.length,phase==='beforeBinding'?0:1);
  assert.equal(f.counts.confirmation,0);assert.equal(f.counts.close,1);
});
test('doc remote value serialization is never traversed and malformed binding is refused',async()=>{
  let attributes=0;
  const f=fixture({execute:(_f,_m,_c,params)=>params.functionDeclaration===SOURCES.captureDocument?
    {type:'success',realm:'native-realm-1',result:{type:'node',handle:'root-document-1',get value(){attributes++;throw new Error('do not inspect');}}}:completed()});
  await f.run();assert.equal(attributes,0);
  const g=fixture({execute:()=>({type:'success',realm:'native-realm-1',result:{type:'node',sharedId:'not a root handle'}})});
  await rejected(g.run(),'UNAVAILABLE',false);assert.equal(g.calls.length,1);
});
test('realm replacement NoSuchHandle is a single uncertain dispatched failure, with no fallback/broadcast',async()=>{
  const f=fixture({execute:(_f,_m,_c,params)=>{if(params.functionDeclaration===SOURCES.captureDocument)return captured();throw new Error('NoSuchHandle');}});
  await rejected(f.run(),'UNAVAILABLE',true);assert.equal(f.calls.length,2);assert.equal(f.counts.confirmation,1);
  assert.equal(f.calls.every(call=>call.params.target.context==='owned-native-context'&&!('realm'in call.params.target)),true);
});
test('confirmation must be literal one-shot true bound to exact Core signal and immutable request',async()=>{
  for(const receipt of [false,undefined,{},Promise.resolve(true)]){
    const f=fixture({confirmation:(ctx,request,options)=>{assert.equal(options.signal,ctx.external.signal);assert.ok(Object.isFrozen(request));return receipt;}});
    await rejected(f.run(),'DENIED',false);assert.equal(f.calls.length,1);
  }
  const f=fixture({confirmation:ctx=>{ctx.boundary.releaseSession(SESSION.session);return true;}});
  await rejected(f.run(),'NOT_APPROVED',false);assert.equal(f.calls.length,1);
});
test('pending native gate proof cancelled before commit cannot dispatch, and late failure is consumed',async()=>{
  const pending=deferred();const f=fixture({proof:(_f,_owner,_request,options)=>options.phase==='beforeEffect'?pending.promise:true});
  const work=f.run();const failure=rejected(work,'NOT_APPROVED',false);await tick();f.external.abort();await expire(f);await failure;
  assert.equal(f.calls.length,1);assert.equal(f.boundary.getState().pending_operations,1);
  await rejected(f.run('tabs.open',PARAMETERS['tabs.open'],SESSION,{signal:new AbortController().signal}),'BUSY',false);
  pending.reject(new Error('late hidden text'));await tick();assert.equal(f.counts.close,1);assert.equal(f.boundary.getState().busy,false);
});
test('revocation after effect invocation cannot claim rollback and pending ownership blocks reuse',async()=>{
  const pending=deferred();const f=fixture({execute:(_f,_m,_c,params)=>params.functionDeclaration===SOURCES.captureDocument?captured():pending.promise});
  const work=f.run();const failure=rejected(work,'NOT_APPROVED',true);await tick();f.external.abort();await expire(f);await failure;
  assert.equal(f.calls.length,2);assert.equal(f.counts.close,0);assert.equal(f.boundary.getState().effect_dispatched,true);
  await rejected(f.run('tabs.open',PARAMETERS['tabs.open'],SESSION,{signal:new AbortController().signal}),'BUSY',false);
  pending.resolve(completed());await tick();assert.equal(f.counts.close,1);assert.equal(f.boundary.getState().busy,false);
});
test('timeout while factory pending retains and disposes exact late owner without any native call',async()=>{
  const pending=deferred();const f=fixture({factory:()=>pending.promise});const work=f.run();const failure=rejected(work,'TIMEOUT',false);await tick();
  f.clock.fire(5000);await expire(f);await failure;assert.equal(f.boundary.getState().pending_operations,1);
  pending.resolve(f.owner);await tick();assert.equal(f.counts.close,1);assert.equal(f.calls.length,0);assert.equal(f.boundary.getState().busy,false);
});
test('cancelled late open create performs guarded blank cleanup, never URL navigation',async()=>{
  const pending=deferred();const f=fixture({execute:(_f,_m,command)=>command==='create'?pending.promise:assert.fail('no navigation')});
  const work=f.run('tabs.open');const failure=rejected(work,'NOT_APPROVED',true);await tick();f.external.abort();await expire(f);await failure;
  assert.equal(f.counts.close,0);pending.resolve({context:f.createdContext});await tick();
  assert.equal(f.calls.length,1);assert.equal(f.counts.mint,1);assert.equal(f.counts.closeTarget,1);assert.equal(f.counts.adopt,0);
  assert.equal(f.counts.close,1);assert.equal(f.boundary.getState().busy,false);
});
test('blank target validation failure suppresses navigation and failed guarded cleanup retains claim+owner',async()=>{
  let permitted=false;const f=fixture({blank:()=>false,closeTarget:()=>permitted});
  await rejected(f.run('tabs.open'),'UNAVAILABLE',true);assert.equal(f.calls.length,1);assert.equal(f.counts.close,0);
  assert.equal(f.boundary.getState().retained_created_targets,1);await rejected(f.run(),'BUSY',false);
  permitted=true;assert.equal(await f.boundary.close(),true);assert.equal(f.counts.closeTarget,2);assert.equal(f.counts.close,1);
});
test('open navigation-dispatched errors never auto-close and committed claim persists until positive adoption',async()=>{
  let approved=false;const f=fixture({adopt:()=>approved?{tab_id:'t_2'}:false,
    execute:(ctx,_m,command)=>{if(command==='create')return {context:ctx.createdContext};throw new Error('possibly already navigated');}});
  await rejected(f.run('tabs.open'),'UNAVAILABLE',true);assert.equal(f.counts.closeTarget,0);assert.equal(f.counts.adopt,1);assert.equal(f.counts.close,0);
  assert.equal(f.boundary.getState().retained_created_targets,1);approved=true;assert.equal(await f.boundary.close(),true);
  assert.equal(f.counts.adopt,2);assert.equal(f.counts.closeTarget,0);assert.equal(f.counts.close,1);
});
test('failed claim mint keeps raw created context, retrying only on explicit close',async()=>{
  const f=fixture({mint:ctx=>{if(ctx.counts.mint===1)throw new Error('claim mint refused');return ctx.claim;}});
  await rejected(f.run('tabs.open'),'UNAVAILABLE',true);assert.equal(f.counts.mint,1);assert.equal(f.counts.close,0);
  assert.equal(f.boundary.getState().retained_created_targets,1);assert.equal(await f.boundary.close(),true);
  assert.equal(f.counts.mint,2);assert.equal(f.counts.closeTarget,1);assert.equal(f.counts.close,1);
});
test('literal owner close failure retains exact owner; explicit close retries and admission stays closed',async()=>{
  for(const receipt of [false,undefined,{},1]){
    const f=fixture({close:ctx=>ctx.counts.close===1?receipt:true});await rejected(f.run(),'UNAVAILABLE',true);
    assert.equal(f.boundary.getState().retained_owners,1);await rejected(f.run('tabs.open'),'BUSY',false);
    assert.equal(await f.boundary.close(),true);assert.equal(f.counts.close,2);await rejected(f.run(),'NOT_APPROVED',false);
  }
});
test('pending close is bounded/coalesced and no effect result publishes before true receipt',async()=>{
  const pending=deferred();const f=fixture({close:()=>pending.promise});const work=f.run();const failure=rejected(work,'UNAVAILABLE',true);
  await tick();await expire(f);await failure;const close=f.boundary.close();const failedClose=rejected(close,'UNAVAILABLE');await expire(f);await failedClose;
  assert.equal(f.counts.close,1);pending.resolve(true);await tick();assert.equal(await f.boundary.close(),true);assert.equal(f.counts.close,1);
});
test('ignored release Promise is observed and synchronous release cancels before native commit',async()=>{
  const pending=deferred(),unhandled=[];const listener=error=>unhandled.push(error);process.on('unhandledRejection',listener);
  try{
    const f=fixture({proof:()=>pending.promise,close:()=>false});const work=f.run();const failure=rejected(work,'NOT_APPROVED',false);await tick();
    f.boundary.releaseSession(SESSION.session);assert.equal(f.context.signal.aborted,true);await expire(f);await failure;
    pending.resolve(true);await tick();await tick();assert.deepEqual(unhandled,[]);assert.equal(f.calls.length,0);assert.equal(f.boundary.getState().retained_owners,1);
  }finally{process.off('unhandledRejection',listener);}
});
test('synchronous native create reentry cannot close owner before exact late-created cleanup',async()=>{
  const pending=deferred();const f=fixture({execute:(ctx,_m,command)=>{assert.equal(command,'create');ctx.boundary.releaseSession(SESSION.session);return pending.promise;}});
  const work=f.run('tabs.open');const failure=rejected(work,'NOT_APPROVED',true);await expire(f);await failure;
  assert.equal(f.counts.close,0);pending.resolve({context:f.createdContext});await tick();assert.equal(f.counts.closeTarget,1);assert.equal(f.counts.close,1);
});
test('strict rejecting Promise approval and arbitrary thenables cannot cause effects/unhandled rejection',async()=>{
  const unhandled=[];const listener=error=>unhandled.push(error);process.on('unhandledRejection',listener);let invoked=0;
  try{
    const f=fixture({active:()=>Promise.reject(new Error('hidden'))});await rejected(f.run(),'NOT_APPROVED',false);assert.equal(f.counts.factory,0);
    const g=fixture({confirmation:()=>({get then(){invoked++;throw new Error('must not run');}})});await rejected(g.run(),'DENIED',false);
    await tick();await tick();assert.deepEqual(unhandled,[]);assert.equal(invoked,0);
  }finally{process.off('unhandledRejection',listener);}
});
test('read-only state invokes no runtime callbacks and excludes private handles/params',async()=>{
  const pending=deferred();const f=fixture({proof:()=>pending.promise});const work=f.run();await tick();const counts={...f.counts};
  for(let i=0;i<20;i++)assert.ok(Object.isFrozen(f.boundary.getState()));assert.deepEqual(f.counts,counts);
  assert.deepEqual(Object.keys(f.boundary.getState()),['closed','busy','pending_operations','retained_owners','retained_created_targets','effect_dispatched','cleanup_incomplete']);
  pending.resolve(true);await work;
});
for(const reason of ['timeout','release'])test(`pending open adoption is bounded by ${reason}, exact claim/owner stay retained and coalesce`,async()=>{
  const pending=deferred();const f=fixture({adopt:()=>pending.promise});const work=f.run('tabs.open');
  const failure=rejected(work,reason==='timeout'?'TIMEOUT':'NOT_APPROVED',true);await tick();
  assert.equal(f.counts.adopt,1);assert.equal(f.calls.length,2);assert.equal(f.counts.close,0);
  if(reason==='timeout')f.clock.fire(5000);else f.boundary.releaseSession(SESSION.session);
  await expire(f);await failure;assert.equal(f.boundary.getState().retained_created_targets,1);assert.equal(f.boundary.getState().retained_owners,1);
  assert.equal(f.counts.closeTarget,0);const closing=f.boundary.close();const closeFailure=rejected(closing,'UNAVAILABLE');
  await expire(f);await closeFailure;assert.equal(f.counts.adopt,1);assert.equal(f.counts.close,0);
  pending.resolve({tab_id:'t_2'});await tick();assert.equal(f.counts.close,1);assert.equal(f.counts.closeTarget,0);
  assert.equal(await f.boundary.close(),true);assert.equal(f.boundary.getState().busy,false);assert.equal(f.counts.adopt,1);
});

test('unknown create rejection retains exact pre-dispatch allocation lease and owner until literal reconciliation',async()=>{
  let receipt=false;const f=fixture({execute:(ctx,_module,command)=>{assert.equal(command,'create');assert.equal(ctx.counts.begin,1);throw new Error('allocated then rejected');},
    reconcile:(ctx,lease,owner,request)=>{assert.equal(lease,ctx.allocationLease);assert.equal(owner,ctx.owner);assert.equal(request,ctx.request);return receipt;}});
  await rejected(f.run('tabs.open'),'UNAVAILABLE',true);assert.equal(f.counts.reconcile,1);assert.equal(f.counts.close,0);
  assert.equal(f.boundary.getState().retained_created_targets,1);assert.equal(f.boundary.getState().retained_owners,1);
  await rejected(f.run(),'BUSY',false);receipt={};await rejected(f.boundary.close(),'UNAVAILABLE');assert.equal(f.counts.close,0);
  receipt=true;assert.equal(await f.boundary.close(),true);assert.equal(f.counts.reconcile,3);assert.equal(f.counts.close,1);
  assert.equal(f.counts.mint,0);assert.equal(f.counts.closeTarget,0);assert.equal(f.counts.adopt,0);
});
test('unknown create rejection permits owner close only after explicit trusted no-allocation reconciliation',async()=>{
  const f=fixture({execute:(_ctx,_module,command)=>{assert.equal(command,'create');return Promise.reject(new Error('no allocated target proven separately'));}});
  await rejected(f.run('tabs.open'),'UNAVAILABLE',true);assert.equal(f.counts.reconcile,1);assert.equal(f.counts.close,1);
  assert.equal(f.boundary.getState().busy,false);assert.equal(f.counts.closeTarget,0);
});
test('pending rejected-create reconciliation stays coalesced with exact lease and owner after bounded cleanup',async()=>{
  const pending=deferred();const f=fixture({execute:()=>{throw new Error('create uncertain');},reconcile:(ctx,lease,owner)=>{
    assert.equal(lease,ctx.allocationLease);assert.equal(owner,ctx.owner);return pending.promise;}});
  const work=f.run('tabs.open');const failure=rejected(work,'UNAVAILABLE',true);await tick();assert.equal(f.counts.reconcile,1);
  await expire(f);await failure;assert.equal(f.counts.close,0);assert.equal(f.boundary.getState().retained_created_targets,1);
  const closing=f.boundary.close();const closeFailure=rejected(closing,'UNAVAILABLE');await expire(f);await closeFailure;
  assert.equal(f.counts.reconcile,1);pending.resolve(true);await tick();assert.equal(f.counts.close,1);
  assert.equal(await f.boundary.close(),true);assert.equal(f.counts.reconcile,1);assert.equal(f.boundary.getState().busy,false);
});
test('allocation setup synchronous release captures exact lease before reconciliation and suppresses create',async()=>{
  const pending=deferred();const f=fixture({begin:ctx=>{ctx.boundary.releaseSession(SESSION.session);return ctx.allocationLease;},
    reconcile:(ctx,lease,owner)=>{assert.equal(lease,ctx.allocationLease);assert.equal(owner,ctx.owner);return pending.promise;}});
  const work=f.run('tabs.open');const failure=rejected(work,'NOT_APPROVED',false);await expire(f);await failure;
  assert.equal(f.calls.length,0);assert.equal(f.counts.reconcile,1);assert.equal(f.counts.close,0);
  assert.equal(f.boundary.getState().retained_created_targets,1);pending.resolve(true);await tick();assert.equal(f.counts.close,1);
  assert.equal(await f.boundary.close(),true);assert.equal(f.counts.reconcile,1);
});
test('open requires tracker/reconciliation and refuses a promised allocation lease before native create',async()=>{
  for(const deps of [{beginCreatedTarget:null},{reconcileCreatedTarget:null}]){
    const f=fixture({deps});assert.equal(f.boundary.isMethodAvailable('tabs.open'),false);await rejected(f.run('tabs.open'),'UNAVAILABLE',false);
    assert.equal(f.counts.factory,0);assert.equal(f.calls.length,0);
  }
  const f=fixture({begin:ctx=>Object.freeze(Promise.resolve(ctx.allocationLease)),reconcile:()=>false});
  await rejected(f.run('tabs.open'),'UNAVAILABLE',false);assert.equal(f.calls.length,0);assert.equal(f.counts.close,0);
  assert.equal(f.boundary.getState().retained_created_targets,1);
});
test('selector512 and text4096 limits count Unicode code points and preserve astral strings',async()=>{
  const selector='😀'.repeat(512),value='😀'.repeat(4096);const f=fixture();
  assert.deepEqual(await f.run('page.type',{tab_id:'t_1',selector,text:value}),{});
  assert.equal(f.calls[1].params.arguments[2].value,selector);assert.equal(f.calls[1].params.arguments[3].value,value);
  await rejected(f.run('page.click',{tab_id:'t_1',selector:selector+'😀'}),'INVALID_PARAMS');
  await rejected(f.run('page.type',{tab_id:'t_1',selector,text:value+'😀'}),'INVALID_PARAMS');
  await rejected(f.run('page.click',{tab_id:'t_1',selector:'synthetic\u0085'}),'INVALID_PARAMS');
  assert.equal(f.counts.factory,1);
});

test('astral destination URL preserves Core webUrl8192 UTF16 unit boundary',async()=>{
  const prefix='https://synthetic.invalid/';const count=8192-prefix.length;
  const destination=prefix+'a'.repeat(count%2)+'😀'.repeat(Math.floor(count/2));assert.equal(destination.length,8192);
  const f=fixture();assert.deepEqual(await f.run('tabs.navigate',{tab_id:'t_1',url:destination}),{});
  assert.equal(f.calls[1].params.arguments[2].value,destination);
  await rejected(f.run('tabs.navigate',{tab_id:'t_1',url:destination+'a'}),'INVALID_PARAMS');
  assert.equal(f.counts.factory,1);
});
