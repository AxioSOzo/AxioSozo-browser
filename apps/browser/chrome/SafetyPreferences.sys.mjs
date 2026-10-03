/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// DOM-free Gecko preference adapter. All platform services are injected;
// importing or constructing this module performs no preference or DNS access.
const URI = 'network.trr.uri', MODE = 'network.trr.mode', NAMES = Object.freeze([URI, MODE]);
const GUARDS = Object.freeze(['credentials_user_value', 'credentials_locked', 'bootstrap_user_value', 'bootstrap_locked', 'bootstrap_nonempty',
  'ohttp_enabled', 'ohttp_user_value', 'ohttp_locked', 'ohttp_uri_user_value', 'ohttp_uri_locked']);
const META = Object.freeze({ credentials: 'network.trr.credentials', bootstrap: 'network.trr.bootstrapAddr',
  ohttp: 'network.trr.use_ohttp', ohttp_uri: 'network.trr.ohttp.uri' });
const REASONS = Object.freeze(['PREFS_CHANGED', 'REENTRANT_PREF_CHANGE', 'PREF_WRITE_FAILED', 'PREF_TYPE_MISMATCH',
  'UNSUPPORTED_SAFETY_PREF', 'SAFETY_ADAPTER_DISPOSED', 'PREF_LOCKED', 'CACHE_FLUSH_FAILED']);
const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v));
function frozen(v) { if (v && typeof v === 'object') { for (const k of Object.keys(v)) frozen(v[k]); Object.freeze(v); } return v; }
function failure(code) { const e = new Error(code); e.code = code; return e; }
function keys(v, names) {
  if (!plain(v)) throw failure('INVALID_SAFETY_PREFS');
  const own = Object.getOwnPropertyDescriptors(v), actual = Reflect.ownKeys(own);
  if (actual.length !== names.length || !names.every(k => Object.hasOwn(own, k) && Object.hasOwn(own[k], 'value'))) throw failure('INVALID_SAFETY_PREFS');
}
function safeUri(v) {
  if (typeof v !== 'string' || v.length > 2048 || /[\u0000-\u001f\u007f]/u.test(v)) return false;
  if (v === '' || v === ' ') return true;
  try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password && !u.search && !u.hash; } catch { return false; }
}
const validValue = (name, v) => name === URI ? safeUri(v) : Number.isInteger(v) && v >= 0 && v <= 5;
function descriptor(v, name) {
  keys(v, ['value', 'has_user_value', 'locked']);
  if (!validValue(name, v.value) || typeof v.has_user_value !== 'boolean' || typeof v.locked !== 'boolean') throw failure('INVALID_SAFETY_PREFS');
  return { value: v.value, has_user_value: v.has_user_value, locked: v.locked };
}
function validateSnapshot(v) {
  keys(v, ['prefs', 'guards']); keys(v.prefs, NAMES); keys(v.guards, GUARDS);
  const prefs = Object.fromEntries(NAMES.map(n => [n, descriptor(v.prefs[n], n)]));
  if (!GUARDS.every(k => typeof v.guards[k] === 'boolean')) throw failure('INVALID_SAFETY_PREFS');
  return frozen({ prefs, guards: Object.fromEntries(GUARDS.map(k => [k, v.guards[k]])) });
}
const eqPref = (a, b) => a.value === b.value && a.has_user_value === b.has_user_value && a.locked === b.locked;
const eqSnapshot = (a, b) => NAMES.every(n => eqPref(a.prefs[n], b.prefs[n])) && GUARDS.every(k => a.guards[k] === b.guards[k]);
function validateMutations(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 2) throw failure('INVALID_SAFETY_MUTATIONS');
  const names = new Set();
  return items.map(v => {
    keys(v, Object.getOwnPropertyDescriptor(v ?? {}, 'operation')?.value === 'set' ? ['name', 'operation', 'value'] : ['name', 'operation']);
    if (!NAMES.includes(v.name) || names.has(v.name) || !['set', 'clear'].includes(v.operation) || (v.operation === 'set' && !validValue(v.name, v.value))) throw failure('INVALID_SAFETY_MUTATIONS');
    names.add(v.name); return v.operation === 'set' ? { name: v.name, operation: 'set', value: v.value } : { name: v.name, operation: 'clear' };
  });
}

function validateRecovery(value) {
  keys(value, ['code', 'sequence', 'reason', 'external_change', 'cache_uncertain', 'writes']);
  if (value.code !== 'RECOVERY_REQUIRED' || !Number.isSafeInteger(value.sequence) || value.sequence < 1 || !REASONS.includes(value.reason)
    || typeof value.external_change !== 'boolean' || typeof value.cache_uncertain !== 'boolean' || !Array.isArray(value.writes) || value.writes.length > 2) throw failure('INVALID_SAFETY_RECOVERY');
  const names = new Set();
  const writes = value.writes.map(w => {
    keys(w, ['name', 'previous', 'applied', 'visibility']);
    if (!NAMES.includes(w.name) || names.has(w.name) || !['known', 'unknown'].includes(w.visibility)) throw failure('INVALID_SAFETY_RECOVERY');
    names.add(w.name);
    const copy = d => { keys(d, ['value', 'has_user_value']); if (!validValue(w.name, d.value) || typeof d.has_user_value !== 'boolean') throw failure('INVALID_SAFETY_RECOVERY'); return { value: d.value, has_user_value: d.has_user_value }; };
    return { name: w.name, previous: copy(w.previous), applied: copy(w.applied), visibility: w.visibility };
  });
  return frozen({ code: 'RECOVERY_REQUIRED', sequence: value.sequence, reason: value.reason, external_change: value.external_change, cache_uncertain: value.cache_uncertain, writes });
}
export function createSafetyPreferences({ prefs, dns, onRecoveryRequired, pendingRecovery = null, recoverySequence = 0 } = {}) {
  const required = ['getPrefType', 'getStringPref', 'getIntPref', 'getBoolPref', 'prefHasUserValue', 'prefIsLocked',
    'setStringPref', 'setIntPref', 'clearUserPref', 'getDefaultBranch', 'addObserver', 'removeObserver'];
  if (!required.every(k => typeof prefs?.[k] === 'function') || typeof dns?.clearCache !== 'function' || typeof onRecoveryRequired !== 'function') throw failure('INVALID_SAFETY_ADAPTER');
  if (!Number.isSafeInteger(recoverySequence) || recoverySequence < 0) throw failure('INVALID_SAFETY_RECOVERY');
  let busy = false, recovery = pendingRecovery === null ? null : validateRecovery(pendingRecovery),
    sequence = Math.max(recoverySequence, recovery?.sequence ?? 0), disposed = false, retainedObserver = null;
  let last = frozen({ code: recovery ? 'RECOVERY_REQUIRED' : 'IDLE', changed: recovery?.writes.length > 0 });
  function read(name, branch = prefs) {
    if (branch.getPrefType(name) !== (name === MODE ? 64 : 32)) throw failure('PREF_TYPE_MISMATCH');
    // No default-value argument: getter failure/wrong type must be observable.
    const value = name === MODE ? branch.getIntPref(name) : branch.getStringPref(name);
    if (!validValue(name, value)) throw failure('UNSUPPORTED_SAFETY_PREF');
    return { value, has_user_value: branch === prefs && prefs.prefHasUserValue(name), locked: prefs.prefIsLocked(name) };
  }
  function snapshot() {
    if (disposed) throw failure('SAFETY_ADAPTER_DISPOSED');
    const values = Object.fromEntries(NAMES.map(n => [n, read(n)])), guards = {};
    for (const [key, name] of Object.entries(META)) {
      guards[`${key}_user_value`] = prefs.prefHasUserValue(name);
      guards[`${key}_locked`] = prefs.prefIsLocked(name);
    }
    // Credential string is NEVER read. The metadata guard relies on the
    // checksum-pinned empty default; non-user unlocked default overrides are
    // outside what presence/lock metadata can detect.
    if (prefs.getPrefType(META.credentials) !== 32 || prefs.getPrefType(META.ohttp_uri) !== 32
      || prefs.getPrefType(META.ohttp) !== 128) throw failure('PREF_TYPE_MISMATCH');
    // Pinned Gecko does not declare a bootstrapAddr default. A genuinely
    // absent optional preference is empty; an unknown/wrong configured type
    // is never hidden behind an optional getter fallback.
    const bootstrapType = prefs.getPrefType(META.bootstrap);
    if (bootstrapType !== 32 && !(bootstrapType === 0 && !guards.bootstrap_user_value && !guards.bootstrap_locked)) throw failure('PREF_TYPE_MISMATCH');
    guards.bootstrap_nonempty = bootstrapType === 32 && prefs.getStringPref(META.bootstrap) !== '';
    guards.ohttp_enabled = prefs.getBoolPref(META.ohttp);
    return validateSnapshot({ prefs: values, guards });
  }
  const fresh = () => snapshot();
  function setDescriptor(name, wanted) {
    if (prefs.prefIsLocked(name)) throw failure('PREF_LOCKED');
    if (!wanted.has_user_value) prefs.clearUserPref(name);
    else if (name === MODE) prefs.setIntPref(name, wanted.value);
    else prefs.setStringPref(name, wanted.value);
  }
  function emitRecovery(reason, journal, external, cacheUncertain) {
    const report = frozen({ code: 'RECOVERY_REQUIRED', sequence: ++sequence, reason, external_change: external, cache_uncertain: cacheUncertain,
      writes: journal.slice(0, 2).map(entry => ({ name: entry.name,
        previous: { value: entry.before.value, has_user_value: entry.before.has_user_value },
        applied: { value: entry.after.value, has_user_value: entry.after.has_user_value }, visibility: entry.visibility ?? 'known' })) });
    // Retain before invoking the mandatory owner callback, even if reporting
    // fails. Further writes are blocked until the owner explicitly resolves.
    recovery = report; last = frozen({ code: 'RECOVERY_REQUIRED', changed: report.writes.length > 0 });
    try { if (onRecoveryRequired(report) !== true) throw failure('RECOVERY_REPORT_NOT_ACKNOWLEDGED'); }
    catch { throw failure('RECOVERY_REPORT_FAILED'); }
  }
  function releaseObserver() {
    if (retainedObserver === null) return true;
    try { prefs.removeObserver('network.trr.', retainedObserver); retainedObserver = null; return true; } catch { return false; }
  }
  function compareAndApply(expectedInput, mutationsInput) {
    if (disposed || busy || recovery !== null) return false;
    if (sequence === Number.MAX_SAFE_INTEGER) { last = frozen({ code: 'RECOVERY_SEQUENCE_EXHAUSTED', changed: false }); return false; }
    // Keep at most one failed cleanup handle; an inactive callback cannot grow
    // a journal, and no new writes register another observer until it is removed.
    if (!releaseObserver()) { last = frozen({ code: 'OBSERVER_CLEANUP_REQUIRED', changed: false }); return false; }
    const expected = validateSnapshot(expectedInput), mutations = validateMutations(mutationsInput);
    if (GUARDS.some(k => expected.guards[k]) || NAMES.some(n => expected.prefs[n].locked)) { last = frozen({ code: 'PREF_UNAVAILABLE', changed: false }); return false; }
    let tx = { active: true, step: null, external: false, touched: new Set() }, journal = [], current = expected, cacheUncertain = false;
    const observer = { observe(_subject, topic, name) {
      if (!tx.active || topic !== 'nsPref:changed') return;
      const step = tx.step;
      // Inspect actual state, do not suppress all notifications during a setter.
      // Ordering is unspecified; nested writes can arrive before our own event.
      if (step && name === step.name && !step.seen) {
        let observed;
        try { observed = read(name); } catch { observed = null; }
        if (observed && !observed.locked && observed.value === step.wanted.value
          && (step.wanted.has_user_value || !observed.has_user_value)) { step.seen = true; return; }
      }
      tx.external = true; tx.touched.add(name);
    } };
    busy = true;
    try {
      if (!eqSnapshot(fresh(), expected)) { last = frozen({ code: 'PREFS_CHANGED', changed: false }); return false; }
      retainedObserver = observer; prefs.addObserver('network.trr.', observer, false);
      if (!eqSnapshot(fresh(), expected)) throw failure('PREFS_CHANGED');
      for (const mutation of mutations) {
        if (tx.external || !eqSnapshot(fresh(), current)) throw failure('REENTRANT_PREF_CHANGE');
        const before = current.prefs[mutation.name];
        const wanted = mutation.operation === 'set' ? { value: mutation.value, has_user_value: true, locked: false }
          : { ...read(mutation.name, prefs.getDefaultBranch('')), has_user_value: false, locked: false };
        const step = { name: mutation.name, wanted, seen: false }; tx.step = step;
        let writeError = null;
        try { setDescriptor(mutation.name, wanted); } catch (e) { writeError = e; }
        let after;
        try { after = read(mutation.name); } catch { after = null; }
        // Record before trusting callbacks or success return. A setter can
        // throw after writing or normalize its user slot to the default.
        if (after && after.value === wanted.value && !after.locked && !tx.touched.has(mutation.name) && !eqPref(before, after)) journal.push({ name: mutation.name, before: { ...before }, after: { ...after } });
        else if (!after || after.locked) journal.push({ name: mutation.name, before: { ...before }, after: { ...wanted }, visibility: 'unknown' });
        tx.step = null;
        const intended = { prefs: { ...current.prefs, [mutation.name]: wanted }, guards: current.guards };
        if (writeError) throw failure('PREF_WRITE_FAILED');
        if (tx.external || !after || !eqPref(after, wanted) || !eqSnapshot(fresh(), intended)) throw failure('REENTRANT_PREF_CHANGE');
        current = validateSnapshot(intended);
      }
      if (tx.external || !eqSnapshot(fresh(), current)) throw failure('REENTRANT_PREF_CHANGE');
      try { dns.clearCache(true); } catch { cacheUncertain = true; throw failure('CACHE_FLUSH_FAILED'); }
      // Cache clearing/service callbacks may themselves reenter preference code.
      if (tx.external || !eqSnapshot(fresh(), current)) throw failure('REENTRANT_PREF_CHANGE');
      last = frozen({ code: 'APPLIED', changed: true }); return true;
    } catch (e) {
      let reason = 'PREF_WRITE_FAILED';
      try { if (REASONS.includes(e?.code)) reason = e.code; } catch { /* Native error metadata is not part of the reporting contract. */ }
      const remaining = [...journal];
      // A newer user/policy config is a coherent pair. Do not merge an old
      // resolver/mode back into it; report residual owned writes instead.
      if (!tx.external) {
        for (let i = remaining.length - 1; i >= 0; i--) {
          const entry = remaining[i]; let at;
          try { at = read(entry.name); } catch { entry.visibility = 'unknown'; continue; }
          if (at.locked || entry.visibility === 'unknown' || !eqPref(at, entry.after)) { entry.visibility = at.locked ? 'unknown' : entry.visibility; continue; }
          if (tx.external) break;
          let wanted;
          try { wanted = entry.before.has_user_value ? { ...entry.before, locked: false }
            : { ...read(entry.name, prefs.getDefaultBranch('')), has_user_value: false, locked: false }; }
          catch { entry.visibility = 'unknown'; continue; }
          tx.step = { name: entry.name, wanted, seen: false };
          try { setDescriptor(entry.name, wanted); } catch { /* Verify even a setter that throws after restoration. */ }
          tx.step = null;
          try { if (eqPref(read(entry.name), wanted)) remaining.splice(i, 1); } catch { entry.visibility = 'unknown'; }
        }
      }
      // Do not report a user's distinct current value as our owned residue.
      const residue = remaining.filter(entry => {
        try { const at = read(entry.name); return at.locked || entry.visibility === 'unknown' || eqPref(at, entry.after); }
        catch { entry.visibility = 'unknown'; return true; }
      });
      if (journal.length) { try { dns.clearCache(true); } catch { cacheUncertain = true; } }
      if (residue.length || cacheUncertain) emitRecovery(reason, residue, tx.external, cacheUncertain);
      else last = frozen({ code: reason, changed: false });
      return false;
    } finally {
      tx.active = false; tx.step = null;
      releaseObserver();
      busy = false;
    }
  }
  return Object.freeze({ snapshot, compareAndApply,
    diagnostics: () => frozen({ last, recovery, sequence }),
    resolveRecovery({ acknowledged, sequence: expectedSequence, resolution } = {}) {
      if (acknowledged !== true || !['RESTORED', 'ACCEPTED', 'EXTERNAL_CHANGED'].includes(resolution)) throw failure('RECOVERY_ACK_REQUIRED');
      if (busy || recovery === null || expectedSequence !== recovery.sequence) throw failure('RECOVERY_SEQUENCE_MISMATCH');
      // Resolution makes no writes. The owner must first persist/report its
      // decision; read actual current prefs rather than infer success from a catch.
      const actual = snapshot();
      if (resolution === 'RESTORED' && recovery.writes.some(w => actual.prefs[w.name].locked
        || actual.prefs[w.name].value !== w.previous.value || actual.prefs[w.name].has_user_value !== w.previous.has_user_value)) throw failure('RECOVERY_NOT_RESTORED');
      if (resolution === 'EXTERNAL_CHANGED' && recovery.writes.some(w => actual.prefs[w.name].locked
        || (actual.prefs[w.name].value === w.applied.value && actual.prefs[w.name].has_user_value === w.applied.has_user_value))) throw failure('RECOVERY_NOT_EXTERNAL');
      const resolved = recovery.sequence; recovery = null; last = frozen({ code: 'RECOVERY_RESOLVED', changed: false });
      return frozen({ resolved: true, sequence: resolved, resolution, actual });
    },
    dispose() { disposed = true; releaseObserver(); },
  });
}
