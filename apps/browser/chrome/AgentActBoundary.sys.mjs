// Ignored preparation: pure ownership and standard BiDi parameter dispatch only.
// Every functionDeclaration is an opaque, trusted, fixed Claude-authored source.
import { AgentToolError } from './GeckoBiDiReadSession.sys.mjs';
const fail = code => { throw new AgentToolError(code); };
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const field = (value, name) => record(value) && Object.getOwnPropertyDescriptor(value, name)?.value;
const method = (value, name) => { const fn = field(value, name); if (typeof fn !== 'function') fail('UNAVAILABLE'); return fn; };
const points = (value, max) => {
  if (typeof value !== 'string') return false;
  let count = 0; for (const _point of value) if (++count > max) return false;
  return true;
};
const text = (value, max) => points(value,max) && value.length > 0 && !/[\u0000-\u001f\u007f-\u009f]/u.test(value);
const TAB = /^t_[1-9][0-9]{0,14}$/u, SESSION = /^s_[0-9a-f]{16}$/u;
const METHODS = Object.freeze({ 'page.click': 'click', 'page.type': 'type', 'tabs.navigate': 'navigate', 'tabs.open': 'open' });
const CODES = new Set(['INVALID_PARAMS','UNKNOWN_METHOD','NOT_APPROVED','DENIED','NO_PROJECT','NOT_IN_PROJECT',
  'PRIVATE','BLOCKED_CATEGORY','UNAVAILABLE','TIMEOUT','BUSY']);
const errorCode = error => error instanceof AgentToolError && CODES.has(error.code) ? error.code : 'UNAVAILABLE';
const promiseThen = Promise.prototype.then;
function truth(value) {
  if (value === true) return true;
  try { promiseThen.call(value, () => {}, () => {}); } catch {}
  return false;
}
function data(value, keys) {
  if (!record(value) || ![Object.prototype,null].includes(Object.getPrototypeOf(value))) fail('INVALID_PARAMS');
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(descriptors).some(key => !keys.includes(key) || !('value' in descriptors[key]))) fail('INVALID_PARAMS');
  return Object.fromEntries(Object.entries(descriptors).map(([key, descriptor]) => [key, descriptor.value]));
}
export class AgentActBoundaryError extends AgentToolError {
  constructor(code, dispatched = false) { super(code); this.effect_dispatched = dispatched; this.outcome_unknown = dispatched; }
}
export const ACT_BOUNDARY_SANDBOX = 'axiosozo-agent-act-v1';
export const ACT_BOUNDARY_LIMITS = Object.freeze({ timeoutMs: 10_000, cleanupMs: 1_000, revokedSessions: 4096 });

/**
 * Native gate readiness is not implemented here. beforeEffect proof MUST attest
 * that the fixed source invokes the exact one-shot privileged child gate in this
 * native context+sandbox, synchronously immediately before the native effect.
 */
export function createAgentActBoundary({
  capabilities = {}, sources = null, validateSources = () => false,
  isActive, isSensitiveHost, consumeConfirmation = null,
  createOwner = null, validateDocumentProof = null,
  beginCreatedTarget = null, reconcileCreatedTarget = null,
  claimCreatedTarget = null, isCreatedTargetBlank = null,
  adoptCreatedTarget = null, closeCreatedTarget = null,
  setTimer, clearTimer, timeoutMs = ACT_BOUNDARY_LIMITS.timeoutMs, cleanupMs = ACT_BOUNDARY_LIMITS.cleanupMs,
} = {}) {
  if (![isActive,isSensitiveHost,setTimer,clearTimer,validateSources].every(fn => typeof fn === 'function')) throw new TypeError('trusted callbacks');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000
      || !Number.isInteger(cleanupMs) || cleanupMs < 1 || cleanupMs > 5_000) throw new TypeError('timeouts');
  const fixedSources = Object.freeze(Object.fromEntries(['captureDocument','click','type','navigate'].map(key => [key, field(sources,key)])));
  const sourceShape = record(sources) && Object.isFrozen(sources)
    && Object.values(fixedSources).every(value => typeof value === 'string' && value.length > 0 && value.length <= 65536 && !value.includes('\u0000'));
  const flags = Object.freeze(Object.fromEntries(Object.values(METHODS).map(key => [key, field(capabilities,key) === true])));
  const operations = new Set(), revoked = new Set();
  let closed = false;
  const depsReady = [createOwner,validateDocumentProof].every(fn => typeof fn === 'function');
  function available(name) {
    const key = Object.hasOwn(METHODS,name) ? METHODS[name] : null;
    if (closed || !key || !flags[key] || !depsReady || !sourceShape) return false;
    if (key === 'open' ? ![beginCreatedTarget,reconcileCreatedTarget,claimCreatedTarget,isCreatedTargetBlank,adoptCreatedTarget,closeCreatedTarget].every(fn => typeof fn === 'function')
      : typeof consumeConfirmation !== 'function') return false;
    let approved = false;
    try { approved = truth(validateSources(name,fixedSources)); } catch {}
    return approved && !closed;
  }
  function url(value) {
    if (!text(value,8192) || value.length > 8192) fail('INVALID_PARAMS'); // Core webUrl bounds UTF16 units.
    let parsed; try { parsed = new URL(value); } catch { fail('INVALID_PARAMS'); }
    if (!['http:','https:'].includes(parsed.protocol) || parsed.username || parsed.password) fail('BLOCKED_CATEGORY');
    let blocked = true; try { blocked = isSensitiveHost(parsed.hostname) !== false; } catch {}
    if (blocked) fail('BLOCKED_CATEGORY');
    return value;
  }
  function request(name, input, session, options) {
    if (typeof name !== 'string' || !Object.hasOwn(METHODS,name)) fail('UNKNOWN_METHOD');
    const keys = name === 'tabs.open' ? ['url'] : name === 'tabs.navigate' ? ['tab_id','url']
      : name === 'page.type' ? ['tab_id','selector','text'] : ['tab_id','selector'];
    const params = data(input,keys);
    if (name !== 'tabs.open' && (!TAB.test(params.tab_id ?? '') || !text(params.tab_id,32))) fail('INVALID_PARAMS');
    if (name === 'tabs.open' || name === 'tabs.navigate') url(params.url);
    else {
      if (!text(params.selector,512)) fail('INVALID_PARAMS');
      if (name === 'page.type' && (!points(params.text,4096) || params.text.includes('\u0000'))) fail('INVALID_PARAMS');
    }
    const expected = options.expected;
    if (!record(expected) || !Object.isFrozen(expected) || !TAB.test(field(expected,'tab_id') ?? '')) fail('UNAVAILABLE');
    if (field(expected,'private') !== false) fail('PRIVATE');
    if (field(expected,'engine') !== 'gecko' || !text(field(expected,'document_id'),128)) fail('UNAVAILABLE');
    url(field(expected,'url'));
    if (name !== 'tabs.open' && params.tab_id !== field(expected,'tab_id')) fail('INVALID_PARAMS');
    if (!record(session) || !SESSION.test(field(session,'session') ?? '') || field(session,'state') !== 'approved'
        || !(field(session,'project_id') === null || text(field(session,'project_id'),128))) fail('NOT_APPROVED');
    if (name !== 'tabs.open') {
      if (field(session,'project_id') === null) fail('NO_PROJECT');
      if (field(expected,'project_id') !== field(session,'project_id')) fail('NOT_IN_PROJECT');
    }
    if (!text(options.context,128) || name === 'tabs.open' && !text(options.userContext,128)) fail('UNAVAILABLE');
    if (!options.signal || typeof options.signal.addEventListener !== 'function' || typeof options.signal.removeEventListener !== 'function'
        || typeof options.signal.aborted !== 'boolean') fail('NOT_APPROVED');
    return Object.freeze({ method:name, params:Object.freeze(params), expected, context:options.context,
      userContext:name === 'tabs.open' ? options.userContext : null,
      session:Object.freeze({ session:field(session,'session'),project_id:field(session,'project_id'),state:'approved' }) });
  }
  function local(op) {
    if (op.cancelCode) fail(op.cancelCode);
    if (closed || op.signal.aborted || op.controller.signal.aborted || revoked.has(op.request.session.session)
        || field(op.sessionSource,'session') !== op.request.session.session
        || field(op.sessionSource,'project_id') !== op.request.session.project_id || field(op.sessionSource,'state') !== 'approved') fail('NOT_APPROVED');
  }
  function guard(op) {
    local(op);
    let current = false; try { current = truth(isActive(op.request.expected,op.request)); } catch {}
    if (!current) fail('NOT_APPROVED');
    local(op); // Reentrant injected predicates cannot return true after revoking.
  }
  function cancel(op,code) {
    if (op.finished || op.cancelCode) return;
    op.cancelCode = code; op.controller.abort(); op.rejectCancel(new AgentActBoundaryError(code,op.dispatched));
  }
  function forget(op) {
    if (op.finished && op.pending.size === 0 && (!op.owner || op.owner.retired) && (!op.created || op.created.retired)) operations.delete(op);
  }
  function clear(timer) {
    if (timer === undefined) return;
    try { clearTimer(timer); } catch { closed = true; for (const op of operations) cancel(op,'NOT_APPROVED'); fail('UNAVAILABLE'); }
  }
  async function bounded(promise) {
    let timer;
    const limit = new Promise((_,reject) => { timer = setTimer(() => reject(new AgentToolError('UNAVAILABLE')),cleanupMs); });
    try { return await Promise.race([promise,limit]); } finally { clear(timer); }
  }
  function track(op,call,acquire) {
    let settled; const token = {settled:new Promise(resolve => {settled=resolve;})}; op.pending.add(token);
    let raw; try { raw = Promise.resolve(call()); } catch (error) { raw = Promise.reject(error); }
    const observed = raw.then(value => {
      op.pending.delete(token); if (acquire) acquire(value);
      if ((op.cancelCode || op.finished || closed) && acquire) cleanup(op,false).catch(() => {});
      forget(op); return value;
    },error => { op.pending.delete(token); forget(op); throw new AgentToolError(errorCode(error)); });
    observed.catch(() => {}); observed.then(() => settled(true),() => settled(true));
    return Promise.race([observed,op.cancelled]);
  }
  function mint(op,retry) {
    const created = op.created;
    if (created.claim) return created.claim;
    if (created.mintFailed && !retry) fail('UNAVAILABLE');
    created.mintFailed = true;
    if (!text(created.context,128)) fail('UNAVAILABLE');
    const claim = claimCreatedTarget(op.owner.value,created.context,op.request);
    if (!record(claim) || !Object.isFrozen(claim)) { truth(claim); fail('UNAVAILABLE'); }
    created.claim = claim; created.mintFailed = false; return claim;
  }
  function retirement(op,resource,retry) {
    if (!resource || resource.retired) return Promise.resolve(true);
    if (resource.attempt?.pending || resource.attempt && !retry) return resource.attempt.promise;
    const attempt = {pending:true,promise:null}; resource.attempt = attempt;
    let raw;
    try {
      if (resource === op.created) {
        if (!text(resource.context,128)) raw = reconcileCreatedTarget(resource.allocationLease,op.owner.value,op.request);
        else {
          const claim = mint(op,retry);
          raw = resource.committed ? adoptCreatedTarget(claim,op.request) : closeCreatedTarget(claim,op.request);
        }
      } else raw = method(resource.value,'close').call(resource.value);
    } catch (error) { raw = Promise.reject(error); }
    attempt.promise = Promise.resolve(raw).then(receipt => {
      if (resource === op.created && resource.committed) {
        const tab_id = field(receipt,'tab_id');
        if (!TAB.test(tab_id ?? '') || Object.keys(receipt).some(key => key !== 'tab_id')) fail('UNAVAILABLE');
        resource.tab_id = tab_id;
      } else if (receipt !== true) fail('UNAVAILABLE');
      resource.retired = true; return true;
    }).catch(error => { throw new AgentToolError(errorCode(error)); }).finally(() => { attempt.pending = false; forget(op); });
    attempt.promise.catch(() => {}); return attempt.promise;
  }
  function cleanup(op,retry) {
    const job = (async () => {
      // Native commands may settle after cancellation. Keep owner usable until
      // exact late-created-target cleanup/adoption finishes; never close blindly.
      await Promise.all([...op.pending].map(token => token.settled));
      await retirement(op,op.created,retry);
      await retirement(op,op.owner,retry);
      forget(op); return true;
    })(); job.catch(() => {}); return bounded(job);
  }
  async function proof(op,phase,binding = null) {
    guard(op);
    const valid = await track(op,() => validateDocumentProof(op.owner.value,op.request,{signal:op.controller.signal,phase,binding}));
    guard(op); if (valid !== true) fail('UNAVAILABLE');
  }
  const callParams = (op,source,args,ownership) => Object.freeze({functionDeclaration:source,awaitPromise:false,userActivation:false,
    target:Object.freeze({context:op.request.context,sandbox:ACT_BOUNDARY_SANDBOX}),
    resultOwnership:ownership,serializationOptions:Object.freeze({maxDomDepth:0,maxObjectDepth:0,includeShadowTree:'none'}),arguments:Object.freeze(args)});
  function commit(op,confirmation) {
    let frozen = false; try { frozen = truth(validateSources(op.request.method,fixedSources)); } catch {}
    if (!frozen) fail('UNAVAILABLE'); guard(op);
    if (confirmation) {
      let approved = false; try { approved = truth(consumeConfirmation(op.request,{signal:op.signal})); } catch {}
      if (!approved) fail('DENIED'); guard(op);
    }
  }
  function native(op,module,command,params,kind) {
    const execute = method(op.owner.value,'execute');
    guard(op);
    return track(op,() => {
      guard(op); // Final synchronous parent commit; invocation follows directly.
      if (kind) op.dispatched = true;
      if (kind === 'create') op.created.createDispatched = true;
      if (kind === 'navigate-new') op.created.committed = true;
      return execute.call(op.owner.value,module,command,params);
    },kind === 'create' ? value => {
      op.created.raw=value; op.created.context=field(value,'context');
    } : null);
  }
  function stop(id,all) {
    if (all) closed = true;
    else {
      if (typeof id !== 'string' || !SESSION.test(id)) { const bad = Promise.reject(new AgentToolError('INVALID_PARAMS')); bad.catch(() => {}); return bad; }
      if (!revoked.has(id) && revoked.size >= ACT_BOUNDARY_LIMITS.revokedSessions) closed = true; else revoked.add(id);
    }
    const owned = [...operations].filter(op => closed || op.request.session.session === id);
    for (const op of owned) cancel(op,'NOT_APPROVED');
    const job = (async () => {
      const results = await Promise.allSettled(owned.map(op => cleanup(op,true)));
      if (results.some(result => result.status !== 'fulfilled') || [...operations].some(op => all || closed || op.request.session.session === id)) fail('UNAVAILABLE');
      return true;
    })(); job.catch(() => {}); return job;
  }
  return Object.freeze({
    isMethodAvailable:available,
    getCapabilities:() => Object.freeze(Object.fromEntries(Object.entries(METHODS).map(([name,key]) => [key,available(name)]))),
    getState:() => Object.freeze({closed,busy:operations.size !== 0,pending_operations:[...operations].reduce((n,op) => n+op.pending.size,0),
      retained_owners:[...operations].filter(op => op.owner && !op.owner.retired).length,
      retained_created_targets:[...operations].filter(op => op.created && !op.created.retired).length,
      effect_dispatched:[...operations].some(op => op.dispatched),cleanup_incomplete:operations.size !== 0}),
    releaseSession:id => stop(id,false),close:() => stop(null,true),
    async executeMethod(name,input,session,options = {}) {
      const value = request(name,input,session,options);
      if (closed || options.signal.aborted || revoked.has(value.session.session)) throw new AgentActBoundaryError('NOT_APPROVED');
      if (!available(name)) throw new AgentActBoundaryError('UNAVAILABLE');
      if (operations.size !== 0) throw new AgentActBoundaryError('BUSY');
      const op = {request:value,sessionSource:session,signal:options.signal,controller:new AbortController(),
        cancelCode:null,cancelled:null,rejectCancel:null,pending:new Set(),owner:null,created:null,dispatched:false,finished:false};
      op.cancelled = new Promise((_,reject) => {op.rejectCancel=reject;}); op.cancelled.catch(() => {}); operations.add(op);
      const aborted=()=>cancel(op,'NOT_APPROVED'); let timer,result,failure;
      try {
        op.signal.addEventListener('abort',aborted,{once:true}); if (op.signal.aborted) aborted();
        timer=setTimer(()=>cancel(op,'TIMEOUT'),timeoutMs); guard(op);
        const owner=await track(op,()=>createOwner(value,{signal:op.controller.signal,requestSignal:op.signal}),resource=>{
          if (resource !== null && (typeof resource === 'object' || typeof resource === 'function')) op.owner={value:resource,retired:false,attempt:null};
        });
        guard(op); method(owner,'execute'); method(owner,'close'); await proof(op,'beforeBinding');
        if (name === 'tabs.open') {
          // Retain the allocation record and track setup before callbacks can
          // synchronously revoke. Native create may allocate before rejecting.
          op.created={allocationLease:null,raw:null,context:null,claim:null,mintFailed:false,
            createDispatched:false,committed:false,retired:false,attempt:null,tab_id:null};
          await track(op,()=>{
            const lease=beginCreatedTarget(op.owner.value,value); op.created.allocationLease=lease;
            let promised=false; try {promiseThen.call(lease,()=>{},()=>{});promised=true;} catch {}
            if (promised || !record(lease) || !Object.isFrozen(lease)) fail('UNAVAILABLE');
            return true; // Never assimilate an opaque lease's arbitrary thenable.
          });
          commit(op,false);
          await native(op,'browsingContext','create',Object.freeze({type:'tab',background:true,referenceContext:value.context,userContext:value.userContext}),'create');
          guard(op); const claim=mint(op,false);
          let blank=false; try {blank=truth(isCreatedTargetBlank(claim,value));} catch {}
          if (!blank) fail('UNAVAILABLE'); guard(op); commit(op,false);
          await native(op,'browsingContext','navigate',Object.freeze({context:op.created.context,url:value.params.url,wait:'none'}),'navigate-new');
          // Once URL navigation is invoked, adoption replaces automatic close.
          await Promise.race([retirement(op,op.created,false),op.cancelled]); result=Object.freeze({tab_id:op.created.tab_id});
        } else {
          const captured=await native(op,'script','callFunction',callParams(op,fixedSources.captureDocument,[],'root'),null);
          guard(op);
          const remote=field(captured,'result'),handle=field(remote,'handle'),realm=field(captured,'realm');
          if (field(captured,'type')!=='success' || field(remote,'type')!=='node' || !text(handle,128) || !text(realm,128)) fail('UNAVAILABLE');
          await proof(op,'beforeEffect',Object.freeze({handle,realm,context:value.context,sandbox:ACT_BOUNDARY_SANDBOX}));
          const args=[Object.freeze({handle}),Object.freeze({type:'string',value:value.expected.url})];
          if (name === 'tabs.navigate') args.push(Object.freeze({type:'string',value:value.params.url}));
          else {
            args.push(Object.freeze({type:'string',value:value.params.selector}));
            if (name === 'page.type') args.push(Object.freeze({type:'string',value:value.params.text}));
          }
          const params=callParams(op,fixedSources[METHODS[name]],args,'none');
          commit(op,true);
          const reply=await native(op,'script','callFunction',params,'effect');
          if (field(reply,'type')!=='success' || field(reply,'realm')!==realm
            || field(field(reply,'result'),'type')!=='boolean' || field(field(reply,'result'),'value')!==true) fail('UNAVAILABLE');
          result=Object.freeze({});
        }
      } catch (error) { failure=new AgentActBoundaryError(op.cancelCode ?? errorCode(error),op.dispatched); }
      finally {
        op.finished=true; op.signal.removeEventListener('abort',aborted);
        try {clear(timer);} catch(error) {failure=new AgentActBoundaryError(errorCode(error),op.dispatched);}
        try {await cleanup(op,false);} catch(error) {if (!failure) failure=new AgentActBoundaryError(errorCode(error),op.dispatched);}
        forget(op);
      }
      if (op.cancelCode || closed || op.signal.aborted || revoked.has(value.session.session)) failure=new AgentActBoundaryError(op.cancelCode ?? 'NOT_APPROVED',op.dispatched);
      if (failure) throw failure;
      return result; // No post-dispatch rollback or atomic native cancel claim.
    },
  });
}
