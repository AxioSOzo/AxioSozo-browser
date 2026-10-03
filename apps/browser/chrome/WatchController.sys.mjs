/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { DEFAULT_WATCH_STORE, validateWatch, validateWatchStore, saveWatch, removeWatch,
  sanitizeWatchUrl, effectiveWatchObservation, watchCheckDue, nextWatchDueAt,
  markWatchChecked, prepareWatchCheck, applyWatchResult } from './contexts/watches.mjs';
import { takeBudget } from './contexts/checkpoints.mjs';
import { validateDecisionResult } from './ProviderDecision.sys.mjs';

const ID = /^w_[a-z0-9]{4,32}$/u, REQUEST_ID = /^[A-Za-z0-9_.:-]{1,160}$/u;
const COMMON = ['scope_epoch', 'context_id', 'context_registered', 'context_normal',
  'project_id', 'project_updated_at', 'root_revision', 'container_id', 'container_generation',
  'consent_granted', 'is_private', 'is_blocked', 'url_allowed'];
const CODES = new Set(['INVALID_INPUT', 'INVALID_CLOCK', 'INVALID_STORE', 'STORAGE_ERROR', 'cancelled', 'timeout',
  'ADMISSION_DENIED', 'HOST_UNAVAILABLE', 'malformed_output', 'budget_exhausted', 'INVALID_BUDGET_ADAPTER']);
const DOCUMENT = ['browsing_context_id', 'inner_window_id', 'complete_top_document',
  'document_url', 'is_error_document', 'channel_status', 'failed_channel_status',
  'password_clear', 'subframes_safe'];
function errorCode(error, fallback) {
  try { const d = Object.getOwnPropertyDescriptor(error, 'code'); return d && Object.hasOwn(d, 'value') && CODES.has(d.value) ? d.value : fallback; }
  catch { return fallback; }
}
const fail = code => { const error = new Error(code); error.code = code; throw error; };
const int = value => Number.isSafeInteger(value) && value >= 0;
const positive = value => int(value) && value > 0;
const token = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,160}$/u.test(value);
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

// Data-only inputs: reject getters, symbols, sparse/extended arrays and non-JSON
// prototypes without evaluating any accessor. Trusted adapters are not input data.
export function passiveCopy(value) {
  let nodes = 0, units = 0;
  function copy(v) {
    if (++nodes > 20000) fail('INVALID_INPUT');
    if (v === null || typeof v === 'boolean') return v;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') { units += v.length; if (units > 16 * 1024 * 1024) fail('INVALID_INPUT'); return v; }
    if (!v || typeof v !== 'object') fail('INVALID_INPUT');
    const array = Array.isArray(v), proto = Object.getPrototypeOf(v);
    if (array ? proto !== Array.prototype : proto !== Object.prototype && proto !== null) fail('INVALID_INPUT');
    const keys = Reflect.ownKeys(v), out = array ? [] : {};
    if (keys.some(key => typeof key !== 'string')) fail('INVALID_INPUT');
    if (array && (v.length > 20000 || keys.length !== v.length + 1)) fail('INVALID_INPUT');
    for (const key of keys) {
      if (array && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(v, key);
      if (!descriptor || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable
        || key === '__proto__' || (array && !/^(0|[1-9][0-9]*)$/u.test(key))) fail('INVALID_INPUT');
      out[key] = copy(descriptor.value);
    }
    return out;
  }
  return copy(value);
}
function exact(value, keys) {
  const copy = passiveCopy(value);
  if (!copy || Array.isArray(copy) || typeof copy !== 'object'
    || Object.keys(copy).length !== keys.length || keys.some(key => !Object.hasOwn(copy, key))) fail('INVALID_INPUT');
  return copy;
}
// Trusted caller capability only; page run input remains the closed {id} record.
function runSignal(options) {
  if (options === undefined) return null;
  if (!options || typeof options !== 'object' || Array.isArray(options)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(options))) fail('INVALID_INPUT');
  const keys = Reflect.ownKeys(options);
  if (keys.length === 0) return null;
  if (keys.length !== 1 || keys[0] !== 'signal') fail('INVALID_INPUT');
  const descriptor = Object.getOwnPropertyDescriptor(options, 'signal');
  if (!descriptor || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) fail('INVALID_INPUT');
  const signal = descriptor.value;
  if (signal === undefined || signal === null) return null;
  if (typeof signal !== 'object' || typeof signal.aborted !== 'boolean'
    || typeof signal.addEventListener !== 'function' || typeof signal.removeEventListener !== 'function') fail('INVALID_INPUT');
  return signal;
}
function budgetCopy(value) {
  const copy = exact(value, ['calls']);
  if (!Array.isArray(copy.calls) || copy.calls.length > 30 || !copy.calls.every(int)) fail('INVALID_INPUT');
  return freeze(copy);
}
function snapshot(raw, watch, hidden, level) {
  const s = exact(raw, hidden ? [...COMMON, ...DOCUMENT] : COMMON);
  if (!int(s.scope_epoch) || !token(s.context_id) || s.context_registered !== true || s.context_normal !== true
    || s.project_id !== watch.project_id || !int(s.project_updated_at) || !positive(s.root_revision)
    || !positive(s.container_id) || s.container_id > 4294967294 || !positive(s.container_generation)
    || s.consent_granted !== true || s.is_private !== false || s.is_blocked !== false || s.url_allowed !== true) fail('ADMISSION_DENIED');
  if (hidden && (!positive(s.browsing_context_id) || !positive(s.inner_window_id) || s.complete_top_document !== true
    || s.is_error_document !== false || s.channel_status !== 0 || s.failed_channel_status !== null
    || s.password_clear !== true || typeof s.subframes_safe !== 'boolean'
    || (level !== 'address' && s.subframes_safe !== true)
    || sanitizeWatchUrl(s.document_url) !== watch.url || new URL(s.document_url).username || new URL(s.document_url).password)) fail('ADMISSION_DENIED');
  return freeze(s);
}
function commonEqual(a, b) { return COMMON.every(key => a[key] === b[key]); }
function documentEqual(a, b) {
  return commonEqual(a, b) && a.browsing_context_id === b.browsing_context_id && a.inner_window_id === b.inner_window_id;
}
function eligible(watch) { return watch.enabled && watch.consent && watch.observation !== 'none'; }
function wireFailure(watch, requestId, reason, sent = false) {
  return freeze({ version: 1, request_id: requestId, choice_set: 'watch_v1', context_version: 'watch-1',
    outcome: 'unknown', reason, data_sent: sent, authority: 'suggestion_only', action_authorized: false,
    provider: watch.provider, confidence: null, ...(watch.provider === 'openai' ? { shape_status: 'UNVERIFIED_SHAPE' } : {}) });
}

/** All native work is injected; liveAuthorized defaults false and is immutable. */
export function createWatchController(options) {
  const allowed = ['store', 'clock', 'timers', 'requestId', 'budget', 'admission', 'tabs', 'indicator', 'decide',
    'liveAuthorized', 'hourlyLimit', 'timeoutMs', 'replyGraceMs'];
  if (!options || Object.keys(options).some(key => !allowed.includes(key))) fail('INVALID_INPUT');
  const { store, clock, timers, requestId, budget, admission, tabs, indicator, decide,
    liveAuthorized = false, hourlyLimit = 30, timeoutMs = 30000, replyGraceMs = 2000 } = options;
  for (const [object, methods] of [[store, ['load', 'update']], [timers, ['setTimeout', 'clearTimeout']],
    [budget, ['snapshot', 'transact', 'limit']], [admission, ['read']], [tabs, ['open', 'capture', 'close']],
    [indicator, ['show', 'isVisible', 'hide']]]) if (!object || methods.some(key => typeof object[key] !== 'function')) fail('INVALID_INPUT');
  if (typeof clock !== 'function' || typeof requestId !== 'function' || typeof decide !== 'function'
    || typeof liveAuthorized !== 'boolean' || !Number.isInteger(hourlyLimit) || hourlyLimit < 0 || hourlyLimit > 30
    || !positive(timeoutMs) || timeoutMs > 30000 || !int(replyGraceMs) || replyGraceMs > 2000) fail('INVALID_INPUT');
  let doc = DEFAULT_WATCH_STORE, loaded = false, epoch = 0, active = null, closed = false;
  let scheduled = false, scheduleTimer = null, armRevision = 0, deferUntil = 0, last = null, lastError = null;
  const now = () => { let at; try { at = clock(); } catch { fail('INVALID_CLOCK'); } if (!int(at)) fail('INVALID_CLOCK'); return at; };
  const limit = () => { const value = budget.limit(); if (!Number.isInteger(value) || value < 0 || value > 30) fail('INVALID_BUDGET_ADAPTER'); return Math.min(hourlyLimit, value); };
  const current = id => doc.watches.find(watch => watch.id === id);
  async function load() {
    try { doc = validateWatchStore(passiveCopy(await store.load())); loaded = true; return doc; }
    catch (error) { fail(errorCode(error, 'STORAGE_ERROR') === 'INVALID_STORE' ? 'INVALID_STORE' : 'STORAGE_ERROR'); }
  }
  function activeWatch(op) {
    const w = current(op.watch.id);
    if (closed || op.cancelled || op.epoch !== epoch || !w || w.revision !== op.watch.revision
      || w.project_id !== op.watch.project_id || !eligible(w)) fail('cancelled');
    if (now() >= op.deadline) fail('timeout');
    return w;
  }
  function guard(op) {
    const w = activeWatch(op);
    if (!op.pre) return w;
    const pre = snapshot(admission.read({ watch: w, handle: null }), w, false, op.level);
    if (!commonEqual(pre, op.pre)) fail('cancelled');
    if (op.handle !== null) {
      const live = snapshot(admission.read({ watch: w, handle: op.handle }), w, true, op.level);
      if (!commonEqual(live, op.pre) || (op.document && !documentEqual(live, op.document))) fail('cancelled');
      if (!op.document) op.document = live;
    }
    return activeWatch(op);
  }
  async function step(op, promise) { const value = await promise; guard(op); return value; }
  function disclosure(op) { return op.result ? { data_sent: op.result.data_sent, disclosure: 'confirmed' }
    : { data_sent: op.dispatched, disclosure: op.dispatched ? 'conservative' : 'confirmed' }; }
  function report(op, code, persisted = false) {
    const d = disclosure(op);
    return freeze({ code, watch_id: op.watch.id, request_id: op.id, outcome: code === 'APPLIED' ? op.applied?.latest_result?.outcome ?? 'unknown' : 'unknown',
      reason: code === 'APPLIED' ? op.result?.reason ?? null : code === 'ADMISSION_DENIED' || code === 'STALE' ? 'cancelled'
        : ['NOT_AUTHORIZED', 'disabled', 'timeout', 'cancelled', 'budget_exhausted', 'malformed_output', 'HOST_UNAVAILABLE', 'IMAGE_UNSUPPORTED', 'INVALID_INPUT'].includes(code) ? code : null,
      ...d, persisted, provider: op.watch.provider });
  }
  function cancel(code = 'cancelled', op = active) {
    if (!op || active !== op || op.cancelled) return;
    op.cancelled = true; op.abortReason = code; op.controller.abort();
    if (!op.recoveryRequired) void compensate(op).catch(() => {});
    // The host normally replies in its own cancellation grace. If it never
    // settles, retain the active slot/leases while returning bounded disclosure.
    op.cancelTimer = timers.setTimeout(() => op.resolvePublic(report(op, code)), replyGraceMs);
  }
  function invalidate() { epoch += 1; cancel(); return status(); }
  async function update(mutator) {
    let value;
    try { value = await store.update(raw => {
      const validated = validateWatchStore(passiveCopy(raw));
      const next = mutator(validated);
      return next === validated ? raw : validateWatchStore(passiveCopy(next));
    }); } catch (error) { fail(errorCode(error, 'STORAGE_ERROR')); }
    doc = validateWatchStore(passiveCopy(value)); loaded = true; return doc;
  }
  async function save(input) {
    const v = exact(input, ['watch', 'userCreated']);
    if (v.userCreated !== true) fail('INVALID_INPUT');
    const watch = validateWatch(v.watch); if (closed) fail('CLOSED');
    if (active?.watch.id === watch.id) invalidate();
    const value = await update(raw => saveWatch(raw, { watch, now: now(), userCreated: true }));
    deferUntil = 0; void arm(); return value.watches.find(item => item.id === watch.id);
  }
  async function remove(input) {
    const v = exact(input, ['id', 'userCreated']);
    if (!ID.test(v.id) || v.userCreated !== true) fail('INVALID_INPUT');
    if (closed) fail('CLOSED'); if (active?.watch.id === v.id) invalidate();
    const value = await update(raw => removeWatch(raw, v.id)); deferUntil = 0; void arm(); return value;
  }
  async function persistNeutral(op, reason) {
    op.result = wireFailure(op.watch, op.id, reason);
    let applied = false;
    await update(raw => {
      const w = raw.watches.find(item => item.id === op.watch.id);
      if (closed || op.cancelled || op.epoch !== epoch || !w || w.revision !== op.watch.revision || now() < w.updated_at) return raw;
      if (op.pre) guard(op);
      const at = now(), attempted = markWatchChecked(w, { now: at });
      const next = validateWatch({ ...attempted, latest_result: { request_id: op.id, checked_at: at, outcome: 'unknown',
        reason, confidence: null, data_sent: false, provider: w.provider } });
      applied = true; return { version: 1, watches: raw.watches.map(item => item.id === w.id ? next : item) };
    });
    if (op.pre) guard(op);
    return report(op, op.cancelled ? 'cancelled' : reason, applied && !op.cancelled);
  }
  async function cleanup(op) {
    op.phase = 'cleanup';
    if (op.handle !== null) { await tabs.close(op.handle); op.handle = null; }
    if (op.lease !== null) { await indicator.hide(op.lease, freeze({ request_id: op.id, reason: op.result?.reason ?? op.abortReason ?? 'cancelled', ...disclosure(op) })); op.lease = null; }
    op.cleanupRequired = false;
  }
  async function clearStaleResult(op) {
    op.phase = 'compensation';
    await update(raw => {
      const w = raw.watches.find(item => item.id === op.watch.id);
      // Never undo a newer user edit, removal, or a different completed request.
      if (!w || w.revision !== op.watch.revision || w.project_id !== op.watch.project_id
        || w.latest_result?.request_id !== op.id) return raw;
      const next = validateWatch({ ...w, latest_result: null });
      return { version: 1, watches: raw.watches.map(item => item.id === w.id ? next : item) };
    });
    op.resultAccepted = false; op.recoveryRequired = false;
  }
  function compensate(op) {
    if (!op.resultAccepted) return Promise.resolve();
    if (op.compensationPromise) return op.compensationPromise;
    op.compensationPromise = clearStaleResult(op).catch(error => {
      op.recoveryRequired = true; throw error;
    }).finally(() => { op.compensationPromise = null; });
    return op.compensationPromise;
  }
  async function work(op) {
    let final;
    try {
      if (op.runSignal) {
        op.runAbort = () => {
          if (op.runSignal.aborted === true && active === op && !op.finalized) cancel('cancelled', op);
        };
        op.runSignal.addEventListener('abort', op.runAbort);
        if (op.runSignal.aborted === true) op.runAbort();
        if (op.cancelled) fail('cancelled');
      }
      if (!liveAuthorized) { final = await persistNeutral(op, 'NOT_AUTHORIZED'); return final; }
      if (!eligible(op.watch)) { final = report(op, 'disabled'); return final; }
      op.level = effectiveWatchObservation(op.watch, new URL(op.watch.url).hostname);
      if (op.level === 'none' || op.level === 'screen' && op.watch.provider !== 'openai') { final = report(op, 'IMAGE_UNSUPPORTED'); return final; }
      op.pre = snapshot(admission.read({ watch: guard(op), handle: null }), op.watch, false, op.level);
      const before = budgetCopy(budget.snapshot());
      if (before.calls.some(at => at > now())) { final = report(op, 'CLOCK_ROLLBACK'); return final; }
      if (!takeBudget(before, { now: now(), limit: limit() }).ok) { final = await persistNeutral(op, 'budget_exhausted'); return final; }
      // Acquire before checking the epoch: even a cancelled late open result
      // belongs to this operation and must be closed in finally.
      guard(op); op.phase = 'opening';
      op.handle = await tabs.open(freeze({ watch_id: op.watch.id, project_id: op.watch.project_id,
        url: op.watch.url, container_id: op.pre.container_id, binding: op.pre }), { signal: op.controller.signal });
      if (op.handle === null || op.handle === undefined) fail('HOST_UNAVAILABLE');
      guard(op);
      op.phase = 'capture';
      const captured = await step(op, tabs.capture(op.handle, freeze({ level: op.level, witness: op.document }), { signal: op.controller.signal }));
      const obs = passiveCopy(captured);
      const keys = ['witness', 'observation']; exact(obs, keys);
      const witness = snapshot(obs.witness, op.watch, true, op.level);
      if (!documentEqual(witness, op.document)) fail('cancelled');
      if (!obs.observation || sanitizeWatchUrl(obs.observation.url) !== op.watch.url) fail('ADMISSION_DENIED');
      const obsKeys = op.level === 'address' ? ['url', 'title'] : op.level === 'outline' ? ['url', 'title', 'outline'] : ['url', 'title', 'outline', 'screen'];
      exact(obs.observation, obsKeys);
      if (op.level === 'outline' || op.level === 'screen') {
        if (!Array.isArray(obs.observation.outline) || obs.observation.outline.length > 200) fail('INVALID_INPUT');
        for (const item of obs.observation.outline) exact(item, ['kind', 'text']);
      }
      op.phase = 'indicator';
      op.lease = await indicator.show(freeze({ request_id: op.id, watch_id: op.watch.id, project_id: op.watch.project_id, level: op.level }), { signal: op.controller.signal });
      if (op.lease === null || op.lease === undefined) fail('ADMISSION_DENIED');
      guard(op);
      if (indicator.isVisible(op.lease, { request_id: op.id }) !== true) fail('ADMISSION_DENIED');
      await step(op, load());
      const started = now();
      // transact must invoke this callback and commit the returned budget
      // synchronously in the ONE process-wide owner used by site rules.
      const prepared = budget.transact(raw => {
        const w = guard(op);
        if (indicator.isVisible(op.lease, { request_id: op.id }) !== true) fail('ADMISSION_DENIED');
        guard(op);
        const value = prepareWatchCheck({ budget: budgetCopy(raw), hourlyLimit: limit(), watch: w,
          observation: obs.observation, requestId: op.id, now: started, timeoutMs: Math.max(1, op.deadline - started),
          consentGranted: true, isPrivate: false, isBlocked: false, indicatorVisible: true });
        guard(op); return freeze({ budget: value.budget, value });
      });
      if (!prepared || typeof prepared.then === 'function') fail('INVALID_BUDGET_ADAPTER');
      guard(op);
      if (!prepared.request) { final = await persistNeutral(op, 'budget_exhausted'); return final; }
      op.request = prepared.request; op.started = prepared.started_at;
      let marked = false;
      await step(op, update(raw => {
        const w = raw.watches.find(item => item.id === op.watch.id); guard(op);
        if (!w || w.revision !== op.watch.revision) return raw;
        marked = true; return { version: 1, watches: raw.watches.map(item => item.id === w.id ? prepared.watch : item) };
      }));
      if (!marked) fail('cancelled');
      guard(op);
      if (indicator.isVisible(op.lease, { request_id: op.id }) !== true) fail('ADMISSION_DENIED');
      guard(op); op.phase = 'provider'; op.dispatched = true;
      const rawResult = await decide(op.request, { signal: op.controller.signal });
      try { op.result = validateDecisionResult(passiveCopy(rawResult), op.request); } catch { op.result = null; }
      guard(op); await step(op, load());
      if (!op.result) fail('malformed_output');
      let applied = false;
      await step(op, update(raw => {
        const w = raw.watches.find(item => item.id === op.watch.id); guard(op);
        if (!w) return raw;
        const next = applyWatchResult({ watch: w, request: op.request, result: op.result, revision: op.watch.revision,
          startedAt: op.started, now: now(), consentGranted: true, isPrivate: false, isBlocked: false, cancelled: false });
        if (next.latest_result?.request_id !== op.id) return raw;
        applied = true; op.applied = next; op.resultAccepted = true;
        return { version: 1, watches: raw.watches.map(item => item.id === w.id ? next : item) };
      }));
      final = report(op, applied ? 'APPLIED' : 'STALE', applied);
    } catch (error) {
      const code = op.cancelled ? op.abortReason ?? 'cancelled' : errorCode(error, 'HOST_UNAVAILABLE');
      final = report(op, code);
      if (!['cancelled', 'timeout', 'ADMISSION_DENIED'].includes(code)) lastError = code;
    } finally {
      const checkPublication = () => {
        if (final?.code !== 'APPLIED') return;
        try { guard(op); } catch (error) { final = report(op, errorCode(error, 'cancelled')); }
      };
      const reconcile = async () => {
        if (final?.code === 'APPLIED' || !op.resultAccepted || op.recoveryRequired) return;
        try { await compensate(op); }
        catch { op.recoveryRequired = true; final = report(op, 'RECOVERY_REQUIRED'); }
      };
      checkPublication(); await reconcile();
      try { await cleanup(op); } catch { op.cleanupRequired = true; final = report(op, 'CLEANUP_REQUIRED'); }
      if (!op.cleanupRequired && op.cancelled) final = report(op, op.abortReason ?? 'cancelled');
      checkPublication(); await reconcile();
      if (op.recoveryRequired) final = report(op, 'RECOVERY_REQUIRED');
      if (op.runAbort) { op.runSignal.removeEventListener('abort', op.runAbort); op.runAbort = null; }
      op.finalized = true;
      timers.clearTimeout(op.deadlineTimer); timers.clearTimeout(op.cancelTimer);
      last = final ?? report(op, 'HOST_UNAVAILABLE');
      // A broken clock must never prevent public settlement/ownership release.
      if (!last.persisted && !closed) { try { deferUntil = Math.max(deferUntil, Math.min(Number.MAX_SAFE_INTEGER, now() + 60000)); } catch { lastError = 'INVALID_CLOCK'; } }
      if (!op.cleanupRequired && !op.recoveryRequired && active === op) active = null;
      op.resolvePublic(last); void arm();
    }
    return final;
  }
  async function run(input, options) {
    const v = exact(input, ['id']); if (!ID.test(v.id)) fail('INVALID_INPUT');
    const signal = runSignal(options);
    const cancelled = () => freeze({ code: 'cancelled', watch_id: v.id, data_sent: false, disclosure: 'confirmed', persisted: false });
    if (signal?.aborted === true) return cancelled();
    if (closed) fail('CLOSED'); if (active) return freeze({ code: active.recoveryRequired ? 'RECOVERY_REQUIRED' : active.cleanupRequired ? 'CLEANUP_REQUIRED' : 'BUSY' });
    await load();
    if (signal?.aborted === true) return cancelled();
    if (closed) fail('CLOSED'); if (active) return freeze({ code: 'BUSY' });
    const watch = current(v.id); if (!watch) return freeze({ code: 'NOT_FOUND' });
    const at = now();
    if (!eligible(watch)) return freeze({ code: 'disabled', watch_id: watch.id, data_sent: false });
    if (!watchCheckDue({ watch, now: at, consentGranted: true, isPrivate: false, isBlocked: false })) return freeze({ code: 'NOT_DUE', watch_id: watch.id, data_sent: false });
    const id = requestId(); if (!REQUEST_ID.test(id) || typeof id !== 'string' || !int(at + timeoutMs)) fail('INVALID_INPUT');
    const op = { watch, id, epoch, deadline: at + timeoutMs, controller: new AbortController(), cancelled: false,
      runSignal: signal, runAbort: null, work: null,
      pre: null, document: null, handle: null, lease: null, level: null, result: null, request: null,
      dispatched: false, phase: 'starting', cleanupRequired: false, recoveryRequired: false, resultAccepted: false, retryPromise: null, compensationPromise: null, finalized: false, deadlineTimer: null, cancelTimer: null };
    active = op;
    const result = new Promise(resolve => { let settled = false; op.resolvePublic = value => { if (!settled) { settled = true; resolve(value); } }; });
    // Publish the exact work Promise before any injected adapter can reenter.
    op.work = Promise.resolve().then(() => work(op));
    void op.work.catch(() => {});
    op.deadlineTimer = timers.setTimeout(() => {
      if (active !== op) return;
      op.abortReason = 'timeout'; op.cancelled = true; op.controller.abort();
      if (!op.recoveryRequired) void compensate(op).catch(() => {});
      op.cancelTimer = timers.setTimeout(() => op.resolvePublic(report(op, 'timeout')), replyGraceMs);
    }, timeoutMs);
    return result;
  }
  // Shutdown calls dispose() first. This joins exact owned work, not arbitrary
  // metadata/CRUD loads, and returns status rather than a cleanup-success ACK.
  async function settled() {
    const op = active;
    if (op) { await op.work; if (op.retryPromise) await op.retryPromise; }
    return status();
  }
  async function retryCleanup() {
    const op = active;
    if (!op || !op.finalized || !op.cleanupRequired && !op.recoveryRequired) return status();
    if (op.retryPromise) return op.retryPromise;
    op.retryPromise = (async () => {
      try {
        if (op.resultAccepted) await compensate(op);
        await cleanup(op);
        if (active === op) active = null;
        last = report(op, op.abortReason ?? 'cancelled'); void arm();
      } catch { last = report(op, op.recoveryRequired ? 'RECOVERY_REQUIRED' : 'CLEANUP_REQUIRED'); }
      finally { op.retryPromise = null; }
      return status();
    })();
    return op.retryPromise;
  }
  function beforeSending(input) {
    const v = exact(input, ['request_id', 'level']), op = active;
    if (!op || !op.request || v.request_id !== op.id || v.level !== op.level || !op.dispatched) fail('cancelled');
    guard(op);
    if (op.lease === null || indicator.isVisible(op.lease, { request_id: op.id }) !== true) fail('ADMISSION_DENIED');
    if (limit() === 0) fail('budget_exhausted');
    guard(op); return true;
  }
  function status() { return freeze({ closed, scheduled, loaded, busy: active !== null,
    phase: active?.phase ?? null, cleanup_required: active?.cleanupRequired ?? false,
    recovery_required: active?.recoveryRequired ?? false, retry_allowed: Boolean(active?.finalized && (active.cleanupRequired || active.recoveryRequired)), residual: active?.recoveryRequired ? { watch_id: active.watch.id, request_id: active.id, revision: active.watch.revision } : null,
    pending_disclosure: Boolean(active?.dispatched && !active.result), last, last_error: lastError }); }
  async function pulse() {
    if (closed || active) return status();
    await load(); if (closed || active) return status();
    const at = now();
    const due = doc.watches.filter(eligible).filter(watch => watchCheckDue({ watch, now: at, consentGranted: true, isPrivate: false, isBlocked: false }))
      .sort((a, b) => (a.schedule.last_checked_at ?? -1) - (b.schedule.last_checked_at ?? -1) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    if (due[0]) await run({ id: due[0].id });
    return status();
  }
  async function arm() {
    const revision = ++armRevision;
    timers.clearTimeout(scheduleTimer); scheduleTimer = null;
    if (!scheduled || closed || active) return;
    try {
      await load(); if (revision !== armRevision || !scheduled || closed || active) return;
      const at = now(), dues = doc.watches.filter(eligible).map(watch => nextWatchDueAt({ watch, now: at,
        consentGranted: true, isPrivate: false, isBlocked: false }) ?? (at < watch.updated_at ? watch.updated_at : null)).filter(due => due !== null);
      if (!dues.length) return;
      const delay = Math.max(1000, Math.min(60000, Math.max(Math.min(...dues) - at, deferUntil - at)));
      scheduleTimer = timers.setTimeout(() => {
        scheduleTimer = null;
        void pulse().catch(() => { lastError = 'STORAGE_ERROR'; }).finally(() => { void arm(); });
      }, delay);
    } catch { lastError = 'STORAGE_ERROR'; }
  }
  async function start() { if (closed) fail('CLOSED'); scheduled = true; await arm(); return status(); }
  function stop() { scheduled = false; armRevision += 1; timers.clearTimeout(scheduleTimer); scheduleTimer = null; return status(); }
  function dispose() { stop(); closed = true; invalidate(); return status(); }
  return Object.freeze({ load, save, remove, run, cancel: () => { cancel(); return status(); }, invalidate, pulse, start, stop, dispose, settled, retryCleanup, beforeSending, status });
}
