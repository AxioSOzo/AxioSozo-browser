/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Data-only asynchronous owner. Core, native services/factory, persistence and
// sole-writer assertion are injected; importing/constructing performs no I/O.
const URI = 'network.trr.uri', MODE = 'network.trr.mode', NAMES = Object.freeze([URI, MODE]);
const OUTCOMES = Object.freeze(['RESTORED', 'ACCEPTED', 'EXTERNAL_CHANGED']);
const NATIVE_REASONS = Object.freeze(['PREFS_CHANGED', 'REENTRANT_PREF_CHANGE', 'PREF_WRITE_FAILED', 'PREF_TYPE_MISMATCH',
  'UNSUPPORTED_SAFETY_PREF', 'SAFETY_ADAPTER_DISPOSED', 'PREF_LOCKED', 'CACHE_FLUSH_FAILED']);
const error = code => { const e = new Error(code); e.code = code; return e; };
const fail = code => { throw error(code); };
function requestError(e, confirmationCode) {
  let code = 'INVALID_SAFETY_OWNER';
  try { if (e?.code === confirmationCode) code = confirmationCode; } catch {}
  return error(code);
}
const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v));
function freeze(v) { if (v && typeof v === 'object') { for (const k of Object.keys(v)) freeze(v[k]); Object.freeze(v); } return v; }
function passive(v, depth = 0) {
  if (depth > 16) fail('INVALID_SAFETY_OWNER');
  if (v === null || typeof v === 'boolean' || (typeof v === 'number' && Number.isSafeInteger(v)) || (typeof v === 'string' && v.length <= 2048)) return v;
  if (!v || typeof v !== 'object') fail('INVALID_SAFETY_OWNER');
  const d = Object.getOwnPropertyDescriptors(v), names = Reflect.ownKeys(d);
  if (Array.isArray(v)) {
    const length = d.length?.value;
    if (Object.getPrototypeOf(v) !== Array.prototype || !Number.isInteger(length) || length < 0 || length > 2 || names.length !== length + 1) fail('INVALID_SAFETY_OWNER');
    for (let i = 0; i < length; i++) if (!Object.hasOwn(d, String(i))) fail('INVALID_SAFETY_OWNER');
    const copy = [];
    for (let i = 0; i < length; i++) { const item = d[String(i)]; if (!Object.hasOwn(item, 'value')) fail('INVALID_SAFETY_OWNER'); copy.push(passive(item.value, depth + 1)); }
    return copy;
  }
  if (!plain(v) || names.length > 24) fail('INVALID_SAFETY_OWNER');
  const copy = Object.create(null);
  for (const n of names) { if (typeof n !== 'string' || !Object.hasOwn(d[n], 'value')) fail('INVALID_SAFETY_OWNER'); copy[n] = passive(d[n].value, depth + 1); }
  return copy;
}
function shape(v, names) {
  if (!plain(v)) fail('INVALID_SAFETY_OWNER');
  const d = Object.getOwnPropertyDescriptors(v), actual = Reflect.ownKeys(d);
  if (actual.length !== names.length || !names.every(k => Object.hasOwn(d, k) && Object.hasOwn(d[k], 'value'))) fail('INVALID_SAFETY_OWNER');
}
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const prefEqual = (a, b) => a.value === b.value && a.has_user_value === b.has_user_value && a.locked === b.locked;
const pairEqual = (a, b) => NAMES.every(n => prefEqual(a[n], b[n]));
const safeGuards = s => Object.values(s.guards).every(v => v === false);
const safeEpoch = n => Number.isSafeInteger(n) && n >= 0;
function validateMutations(items) {
  if (!Array.isArray(items) || items.length > 2) fail('INVALID_SAFETY_OWNER');
  const seen = new Set();
  return items.map(m => {
    shape(m, m.operation === 'set' ? ['name', 'operation', 'value'] : ['name', 'operation']);
    if (!NAMES.includes(m.name) || seen.has(m.name) || !['set', 'clear'].includes(m.operation)) fail('INVALID_SAFETY_OWNER');
    seen.add(m.name); return m.operation === 'set' ? { name: m.name, operation: 'set', value: m.value } : { name: m.name, operation: 'clear' };
  });
}
function copyRecovery(report, pending, core) {
  report = passive(report); shape(report, ['code', 'sequence', 'reason', 'external_change', 'cache_uncertain', 'writes']);
  if (report.code !== 'RECOVERY_REQUIRED' || report.sequence !== pending.sequence || !NATIVE_REASONS.includes(report.reason)
    || typeof report.external_change !== 'boolean' || typeof report.cache_uncertain !== 'boolean' || !Array.isArray(report.writes) || report.writes.length > 2) fail('INVALID_SAFETY_RECOVERY');
  const names = new Set();
  const writes = report.writes.map(w => {
    shape(w, ['name', 'previous', 'applied', 'visibility']);
    const mutation = pending.mutations.find(m => m.name === w.name);
    if (!mutation || names.has(w.name) || !['known', 'unknown'].includes(w.visibility)) fail('INVALID_SAFETY_RECOVERY');
    names.add(w.name);
    const descriptor = d => {
      shape(d, ['value', 'has_user_value']);
      if (typeof d.has_user_value !== 'boolean') fail('INVALID_SAFETY_RECOVERY');
      const candidate = { prefs: { ...pending.expected.prefs, [w.name]: { value: d.value, has_user_value: d.has_user_value, locked: false } }, guards: pending.expected.guards };
      const valid = core.validateSafetySnapshot(candidate).prefs[w.name];
      return { value: valid.value, has_user_value: valid.has_user_value };
    };
    const previous = descriptor(w.previous), applied = descriptor(w.applied), before = pending.expected.prefs[w.name];
    if (previous.value !== before.value || previous.has_user_value !== before.has_user_value
      || (mutation.operation === 'set' && applied.value !== mutation.value) || (mutation.operation === 'clear' && applied.has_user_value)) fail('INVALID_SAFETY_RECOVERY');
    return { name: w.name, previous, applied, visibility: w.visibility };
  });
  return freeze({ code: 'RECOVERY_REQUIRED', sequence: report.sequence, reason: report.reason,
    external_change: report.external_change, cache_uncertain: report.cache_uncertain, writes });
}
export function createSafetyOwnerSchema(core) {
  if (!['validateSafetyState', 'validateSafetySnapshot', 'planSafetyChoice'].every(k => typeof core?.[k] === 'function')) fail('INVALID_SAFETY_OWNER_CORE');
  function validate(value) {
    value = passive(value); shape(value, ['version', 'sequence', 'state', 'pending']);
    if (value.version !== 1 || !safeEpoch(value.sequence)) fail('INVALID_SAFETY_OWNER');
    const state = core.validateSafetyState(value.state); let pending = null;
    if (value.pending !== null) {
      const p = value.pending;
      shape(p, ['phase', 'sequence', 'checked', 'confirmed_at', 'expected', 'mutations', 'next_state', 'recovery', 'resolution']);
      if (!['INTENT', 'RECOVERY', 'RESOLUTION_INTENT'].includes(p.phase) || p.sequence !== value.sequence || p.sequence < 1
        || typeof p.checked !== 'boolean' || !safeEpoch(p.confirmed_at)) fail('INVALID_SAFETY_OWNER');
      const expected = p.expected === null ? null : core.validateSafetySnapshot(p.expected), mutations = validateMutations(p.mutations), next = core.validateSafetyState(p.next_state);
      if ((expected === null && mutations.length) || (p.recovery !== null && !mutations.length)) fail('INVALID_SAFETY_OWNER');
      const plan = core.planSafetyChoice({ state, checked: p.checked, userConfirmed: true, now: p.confirmed_at, ...(expected === null ? {} : { snapshot: expected }) });
      if (!equal(mutations, plan.mutations) || !equal(next, plan.next_state) || !equal(expected, plan.expected)) fail('INVALID_SAFETY_OWNER');
      pending = { phase: p.phase, sequence: p.sequence, checked: p.checked, confirmed_at: p.confirmed_at,
        expected, mutations, next_state: next, recovery: null, resolution: null };
      if (p.recovery !== null) pending.recovery = copyRecovery(p.recovery, pending, core);
      if (p.resolution !== null) {
        shape(p.resolution, ['outcome', 'actual']);
        if (!OUTCOMES.includes(p.resolution.outcome) || (p.resolution.actual === null && expected !== null)) fail('INVALID_SAFETY_OWNER');
        pending.resolution = { outcome: p.resolution.outcome, actual: p.resolution.actual === null ? null : core.validateSafetySnapshot(p.resolution.actual) };
      }
      if ((p.phase === 'INTENT' && (pending.recovery !== null || pending.resolution !== null))
        || (p.phase === 'RECOVERY' && pending.resolution !== null)
        || (p.phase === 'RESOLUTION_INTENT' && pending.resolution === null)) fail('INVALID_SAFETY_OWNER');
    }
    return freeze({ version: 1, sequence: value.sequence, state, pending });
  }
  return Object.freeze({ validate, empty: validate({ version: 1, sequence: 0, state: core.DEFAULT_SAFETY_STATE, pending: null }) });
}

export function createSafetyOwner({ core, createPreferences, store, storageAssurance, assertExclusiveWriter, cleanupPreferences } = {}) {
  const schema = createSafetyOwnerSchema(core);
  if (typeof core?.safetyStatus !== 'function' || typeof createPreferences !== 'function' || typeof store?.load !== 'function'
    || typeof store?.update !== 'function' || storageAssurance !== 'ATOMIC_FLUSHED' || typeof assertExclusiveWriter !== 'function' || typeof cleanupPreferences !== 'function') fail('INVALID_SAFETY_OWNER_ADAPTER');
  let durable = null, current = null, initializationFailure = null, initialized = false, cleanupBlocked = false, tail = Promise.resolve();
  function lease() { let held = false; try { held = assertExclusiveWriter() === true; } catch {} if (!held) fail('SAFETY_WRITER_LEASE_LOST'); }
  function serial(operation) {
    const task = tail.then(async () => { const output = await operation();
      return cleanupBlocked ? freeze({ ...output, code: current?.pending ? 'RECOVERY_REQUIRED' : 'NATIVE_CLEANUP_REQUIRED',
        reason: current?.pending ? output.reason : 'NATIVE_CLEANUP_REQUIRED', blocked: true, cleanup_blocked: true }) : output; });
    tail = task.catch(() => {}); return task;
  }
  function dispose(adapter) {
    if (!adapter) return;
    try { cleanupBlocked = adapter.dispose() !== true; } catch { cleanupBlocked = true; }
  }
  function factory(pending = current?.pending, callback = () => false, initialSequence = current?.sequence ?? 0) {
    if (cleanupPreferences() !== true) { cleanupBlocked = true; fail('SAFETY_NATIVE_CLEANUP_REQUIRED'); }
    cleanupBlocked = false;
    const adapter = createPreferences({ onRecoveryRequired: callback, pendingRecovery: pending?.recovery ?? null, recoverySequence: initialSequence });
    if (!['snapshot', 'compareAndApply', 'diagnostics', 'resolveRecovery', 'dispose'].every(k => typeof adapter?.[k] === 'function')) fail('INVALID_SAFETY_OWNER_NATIVE');
    return adapter;
  }
  function actual(adapter) { try { return core.validateSafetySnapshot(adapter.snapshot()); } catch { return null; } }
  function readCurrent() {
    let adapter;
    try { adapter = factory(); return actual(adapter); } catch { return null; } finally { dispose(adapter); }
  }
  function reconcile(state, observed) {
    return state.owned !== null && (!observed || !safeGuards(observed) || !pairEqual(state.owned.applied, observed.prefs))
      ? core.validateSafetyState({ ...state, owned: null }) : state;
  }
  async function write(next) {
    lease(); const normalized = schema.validate(next), previous = durable;
    const saved = await store.update(value => { lease(); if (!equal(schema.validate(value), previous)) fail('SAFETY_STORE_CHANGED'); return normalized; });
    // A store acknowledgement must identify this exact normalized document.
    if (!equal(schema.validate(saved), normalized)) fail('SAFETY_STORE_ACK_MISMATCH');
    durable = normalized; lease(); return normalized;
  }
  function result(reason, observed, expected = current?.pending?.expected ?? null, known = [], knownValues = null) {
    const pending = current?.pending ?? null;
    let status = null;
    try { if (current && observed) status = core.safetyStatus(current.state, observed); } catch {}
    const changed = expected === null ? false : observed === null ? null : !pairEqual(expected.prefs, observed.prefs);
    const own = pending?.recovery?.writes.filter(w => w.visibility === 'known').map(w => w.name) ?? known;
    const appliedFields = observed === null ? [] : own.filter(n => {
      const w = pending?.recovery?.writes.find(e => e.name === n);
      const mutation = pending?.mutations.find(m => m.name === n);
      const target = w?.applied ?? knownValues?.[n] ?? (mutation?.operation === 'set' ? { value: mutation.value, has_user_value: true } : null);
      return target && !observed.prefs[n].locked && observed.prefs[n].value === target.value && observed.prefs[n].has_user_value === target.has_user_value;
    });
    const unknownFields = pending ? (pending.recovery?.writes ?? pending.mutations).filter(m => !appliedFields.includes(m.name)).map(m => m.name) : [];
    return freeze({ code: pending ? 'RECOVERY_REQUIRED' : initializationFailure ?? reason, reason, blocked: pending !== null || initializationFailure !== null, cleanup_blocked: cleanupBlocked,
      sequence: current?.sequence ?? null, changed, applied_fields: appliedFields, unknown_fields: unknownFields,
      state: current?.state ?? null, actual: observed, status });
  }
  async function initializeInternal() {
    if (initialized) return;
    initialized = true;
    try { lease(); durable = schema.validate(await store.load()); lease(); current = durable; }
    catch { initializationFailure = 'STORE_UNAVAILABLE'; }
  }
  function pendingDocument(plan, request, sequence) {
    return schema.validate({ ...current, sequence, pending: { phase: 'INTENT', sequence, checked: request.checked, confirmed_at: request.now,
      expected: plan.expected, mutations: plan.mutations, next_state: plan.next_state, recovery: null, resolution: null } });
  }
  function nextSequence() { if (current.sequence === Number.MAX_SAFE_INTEGER) fail('SAFETY_SEQUENCE_EXHAUSTED'); return current.sequence + 1; }
  async function chooseInternal(request) {
    passive(request); shape(request, ['checked', 'userConfirmed', 'now']);
    if (typeof request.checked !== 'boolean' || request.userConfirmed !== true || !safeEpoch(request.now)) fail('SAFETY_CONFIRMATION_REQUIRED');
    await initializeInternal();
    if (initializationFailure) return result('STORE_UNAVAILABLE', null);
    if (current.pending) return result('UNRESOLVED_OPERATION', readCurrent());
    if (cleanupPreferences() !== true) { cleanupBlocked = true; return result('NATIVE_CLEANUP_REQUIRED', null); }
    cleanupBlocked = false; lease(); const sequence = nextSequence(), original = current;
    let adapter = null, observed = null, plan, retained = null, callbackFailed = false, applied = false;
    try {
      if (request.checked || original.state.owned !== null) {
        try { adapter = factory(null, report => {
          // Durable INTENT already exists. true acknowledges synchronous
          // immutable retention ONLY, never asynchronous report durability.
          try { retained = copyRecovery(report, current.pending, core); return true; } catch { callbackFailed = true; return false; }
        }, original.sequence); observed = actual(adapter); } catch {}
        if (observed === null) return result('PREF_READ_FAILED', null);
      }
      plan = core.planSafetyChoice({ state: original.state, checked: request.checked, userConfirmed: true, now: request.now,
        ...(observed === null ? {} : { snapshot: observed }) });
      if (!plan.mutations.length && equal(plan.next_state, original.state)) return result(plan.reason, observed, plan.expected);
      const intent = pendingDocument(plan, request, sequence);
      if (!plan.mutations.length) {
        const terminal = schema.validate({ version: 1, sequence, state: plan.next_state, pending: null });
        try { current = await write(terminal); } catch { current = intent; return result('STORE_WRITE_FAILED', adapter ? actual(adapter) : null, plan.expected); }
        if (!adapter) return result(plan.reason, null, plan.expected);
        let latest = actual(adapter);
        const unchangedAfterAck = observed !== null && latest !== null && equal(observed, latest);
        const reconciled = reconcile(current.state, latest);
        if (!equal(reconciled, current.state)) {
          try { current = await write({ ...current, state: reconciled }); latest = actual(adapter); }
          catch { current = intent; return result('STORE_WRITE_FAILED', actual(adapter), plan.expected); }
        }
        return result(unchangedAfterAck ? plan.reason : 'PREFS_CHANGED', latest, plan.expected);
      }
      current = intent;
      try { await write(intent); } catch { return result('STORE_WRITE_FAILED', actual(adapter), plan.expected); }
      // No native call may run until prewrite INTENT receives its storage ACK.
      try { lease(); applied = adapter.compareAndApply(plan.expected, plan.mutations) === true; } catch {}
      let diagnostics;
      try { diagnostics = adapter.diagnostics(); if (!retained && diagnostics.recovery) retained = copyRecovery(diagnostics.recovery, current.pending, core); } catch { callbackFailed = true; }
      observed = actual(adapter);
      if (retained || callbackFailed || (!applied && diagnostics?.last?.changed !== false)) {
        current = schema.validate({ ...current, pending: { ...current.pending, phase: 'RECOVERY', recovery: retained } });
        let reason = callbackFailed ? 'NATIVE_CALLBACK_FAILED' : 'NATIVE_RECOVERY';
        try { current = await write(current); } catch { reason = 'STORE_WRITE_FAILED'; }
        return result(reason, actual(adapter), plan.expected);
      }
      const state = reconcile(applied ? plan.next_state : original.state, observed);
      const terminal = schema.validate({ version: 1, sequence, state, pending: null });
      try { current = await write(terminal); }
      catch { current = schema.validate({ ...intent, pending: { ...intent.pending, phase: 'RECOVERY' } }); return result('STORE_WRITE_FAILED', actual(adapter), plan.expected, applied ? plan.mutations.map(m => m.name) : [], observed?.prefs); }
      let latest = actual(adapter);
      const unchangedAfterAck = observed !== null && latest !== null && equal(observed, latest);
      const reconciled = reconcile(current.state, latest);
      if (!equal(reconciled, current.state)) {
        try { current = await write({ ...current, state: reconciled }); latest = actual(adapter); }
        catch { current = schema.validate({ ...intent, pending: { ...intent.pending, phase: 'RECOVERY' } }); return result('STORE_WRITE_FAILED', actual(adapter), plan.expected, applied ? plan.mutations.map(m => m.name) : [], observed?.prefs); }
      }
      return result(applied ? (unchangedAfterAck ? plan.reason : 'PREFS_CHANGED') : 'PREFS_CHANGED', latest, plan.expected,
        applied ? plan.mutations.map(m => m.name) : [], observed?.prefs);
    } finally { dispose(adapter); }
  }
  function verifyResolution(pending, outcome, observed) {
    if (pending.expected === null) { if (outcome === 'EXTERNAL_CHANGED') fail('SAFETY_RESOLUTION_MISMATCH'); return; }
    if (!observed) fail('SAFETY_PREF_READ_FAILED');
    if (outcome === 'RESTORED' && !equal(observed, pending.expected)) fail('SAFETY_RESOLUTION_MISMATCH');
    if (outcome === 'EXTERNAL_CHANGED') {
      if (equal(observed, pending.expected)) fail('SAFETY_RESOLUTION_MISMATCH');
      if (pending.recovery && pending.recovery.writes.some(w => observed.prefs[w.name].locked
        || (observed.prefs[w.name].value === w.applied.value && observed.prefs[w.name].has_user_value === w.applied.has_user_value))) fail('SAFETY_RESOLUTION_MISMATCH');
    }
  }
  async function resolveInternal(request) {
    passive(request); shape(request, ['sequence', 'outcome', 'userConfirmed']);
    if (!safeEpoch(request.sequence) || request.sequence < 1 || !OUTCOMES.includes(request.outcome) || request.userConfirmed !== true) fail('SAFETY_RESOLUTION_REQUIRED');
    await initializeInternal();
    if (initializationFailure) return result('STORE_UNAVAILABLE', null);
    if (!current.pending || current.sequence !== request.sequence) fail('SAFETY_SEQUENCE_MISMATCH');
    const pending = current.pending; let adapter = null, observed = null;
    try {
      if (pending.expected !== null) { try { adapter = factory(); observed = actual(adapter); } catch {} }
      try { verifyResolution(pending, request.outcome, observed); } catch { return result('RESOLUTION_REJECTED', observed); }
      const resolutionIntent = schema.validate({ ...current, pending: { ...pending, phase: 'RESOLUTION_INTENT', resolution: { outcome: request.outcome, actual: observed } } });
      current = resolutionIntent;
      try { await write(resolutionIntent); } catch { return result('STORE_WRITE_FAILED', adapter ? actual(adapter) : null); }
      // Preferences may change while storage is awaited. Do not clear either
      // journal against the old snapshot, or overwrite the newer choice.
      observed = adapter ? actual(adapter) : null;
      try {
        lease(); verifyResolution(pending, request.outcome, observed);
        if (pending.recovery) observed = core.validateSafetySnapshot(adapter.resolveRecovery({ acknowledged: true, sequence: request.sequence, resolution: request.outcome }).actual);
      } catch { return result('RESOLUTION_REJECTED', observed); }
      // ACCEPTED/EXTERNAL_CHANGED never adopt uncertain preference ownership.
      const state = reconcile(request.outcome === 'RESTORED' ? current.state : core.validateSafetyState({ ...pending.next_state, owned: null }), observed);
      const terminal = schema.validate({ version: 1, sequence: request.sequence, state, pending: null });
      try { current = await write(terminal); } catch { return result('STORE_WRITE_FAILED', adapter ? actual(adapter) : null); }
      let latest = adapter ? actual(adapter) : null;
      const reconciled = reconcile(current.state, latest);
      if (!equal(reconciled, current.state)) {
        try { current = await write({ ...current, state: reconciled }); latest = adapter ? actual(adapter) : null; }
        catch { current = resolutionIntent; return result('STORE_WRITE_FAILED', adapter ? actual(adapter) : null); }
      }
      return result('RESOLVED', latest, pending.expected);
    } finally { dispose(adapter); }
  }
  async function statusInternal(startup) {
    await initializeInternal();
    let observed = initializationFailure ? null : readCurrent();
    // Observed external drift permanently releases old ownership; a later
    // same-value user choice must not resurrect an old rollback entitlement.
    // This writes metadata only, never preferences or an invented confirmation.
    if (!initializationFailure && current.pending === null && observed !== null) {
      const reconciled = reconcile(current.state, observed);
      if (!equal(reconciled, current.state)) {
        const next = schema.validate({ ...current, state: reconciled });
        try { current = await write(next); observed = readCurrent(); }
        catch { current = next; initializationFailure = 'STORE_UNAVAILABLE'; observed = readCurrent(); return result('STORE_WRITE_FAILED', observed); }
      }
    }
    return result(current?.pending ? (startup ? 'STARTUP_UNCERTAIN' : 'UNRESOLVED_OPERATION') : (startup ? 'INITIALIZED' : 'CURRENT'), observed);
  }
  return Object.freeze({
    initialize: () => serial(() => statusInternal(true)),
    choose(request) {
      let copy;
      try { request = passive(request); shape(request, ['checked', 'userConfirmed', 'now']);
        if (typeof request.checked !== 'boolean' || request.userConfirmed !== true || !safeEpoch(request.now)) fail('SAFETY_CONFIRMATION_REQUIRED');
        copy = freeze({ checked: request.checked, userConfirmed: true, now: request.now });
      } catch (e) { return Promise.reject(requestError(e, 'SAFETY_CONFIRMATION_REQUIRED')); }
      return serial(() => chooseInternal(copy));
    },
    resolve(request) {
      let copy;
      try { request = passive(request); shape(request, ['sequence', 'outcome', 'userConfirmed']);
        if (!safeEpoch(request.sequence) || request.sequence < 1 || !OUTCOMES.includes(request.outcome) || request.userConfirmed !== true) fail('SAFETY_RESOLUTION_REQUIRED');
        copy = freeze({ sequence: request.sequence, outcome: request.outcome, userConfirmed: true });
      } catch (e) { return Promise.reject(requestError(e, 'SAFETY_RESOLUTION_REQUIRED')); }
      return serial(() => resolveInternal(copy));
    },
    status: () => serial(() => statusInternal(false)),
    diagnostics: () => freeze({ document: current, last_acknowledged: durable, initialization_failure: initializationFailure, cleanup_blocked: cleanupBlocked }),
  });
}
