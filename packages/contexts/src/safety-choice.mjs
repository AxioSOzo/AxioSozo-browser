/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { deepFreeze, isPlainObject } from './schema.mjs';

export const FAMILY_DOH_URI = 'https://family.cloudflare-dns.com/dns-query';
export const FAMILY_DOH_MODE = 3;
export const SAFETY_STATE_VERSION = 1;
export const SAFETY_PREF_NAMES = Object.freeze(['network.trr.uri', 'network.trr.mode']);
export const SAFETY_GUARD_NAMES = Object.freeze(['credentials_user_value', 'credentials_locked', 'bootstrap_user_value',
  'bootstrap_locked', 'bootstrap_nonempty', 'ohttp_enabled', 'ohttp_user_value', 'ohttp_locked',
  'ohttp_uri_user_value', 'ohttp_uri_locked']);
export const DEFAULT_SAFETY_STATE = deepFreeze({ version: 1, first_run_completed: false, checked: true, confirmed_at: null, owned: null });
const bad = (path, message) => { throw new ContextsError('INVALID_SAFETY', `${path}: ${message}`, path); };
function shape(v, keys, path) {
  if (!isPlainObject(v)) bad(path, 'expected a plain object');
  for (const key of Object.keys(v)) if (!keys.includes(key)) bad(`${path}.${key}`, 'unknown key');
  for (const key of keys) if (!Object.hasOwn(v, key)) bad(`${path}.${key}`, 'missing key');
}
function flag(value, path) { if (typeof value !== 'boolean') bad(path, 'expected boolean'); return value; }
function epoch(value, path) { if (!Number.isSafeInteger(value) || value < 0) bad(path, 'expected epoch ms'); return value; }
function uri(value, path) {
  if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u001f\u007f]/u.test(value)) bad(path, 'invalid resolver URI');
  if (value === '' || value === ' ') return value;
  let parsed;
  try { parsed = new URL(value); } catch { bad(path, 'invalid resolver URI'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) bad(path, 'unsupported resolver URI');
  return value;
}
function pref(value, name, path) {
  shape(value, ['value', 'has_user_value', 'locked'], path);
  const data = name === 'network.trr.uri' ? uri(value.value, `${path}.value`) : value.value;
  if (name === 'network.trr.mode' && (!Number.isInteger(data) || data < 0 || data > 5)) bad(`${path}.value`, 'unsupported TRR mode');
  return { value: data, has_user_value: flag(value.has_user_value, `${path}.has_user_value`), locked: flag(value.locked, `${path}.locked`) };
}
function prefMap(value, path) {
  shape(value, SAFETY_PREF_NAMES, path);
  return Object.fromEntries(SAFETY_PREF_NAMES.map(name => [name, pref(value[name], name, `${path}.${name}`)]));
}
export function validateSafetySnapshot(value) {
  shape(value, ['prefs', 'guards'], '$.snapshot');
  shape(value.guards, SAFETY_GUARD_NAMES, '$.snapshot.guards');
  return deepFreeze({ prefs: prefMap(value.prefs, '$.snapshot.prefs'),
    guards: Object.fromEntries(SAFETY_GUARD_NAMES.map(key => [key, flag(value.guards[key], `$.snapshot.guards.${key}`)])) });
}
const prefEqual = (a, b) => a.value === b.value && a.has_user_value === b.has_user_value && a.locked === b.locked;
const mapEqual = (a, b) => SAFETY_PREF_NAMES.every(name => prefEqual(a[name], b[name]));
const familyActive = prefs => prefs['network.trr.uri'].value === FAMILY_DOH_URI && prefs['network.trr.mode'].value === FAMILY_DOH_MODE;
const safeGuards = guards => SAFETY_GUARD_NAMES.every(key => guards[key] === false);
export function validateSafetyState(value) {
  shape(value, ['version', 'first_run_completed', 'checked', 'confirmed_at', 'owned'], '$');
  if (value.version !== SAFETY_STATE_VERSION) bad('$.version', 'unsupported version');
  const completed = flag(value.first_run_completed, '$.first_run_completed'), checked = flag(value.checked, '$.checked');
  const at = value.confirmed_at === null ? null : epoch(value.confirmed_at, '$.confirmed_at');
  if ((!completed && (checked !== true || at !== null || value.owned !== null)) || (completed && at === null)) bad('$', 'inconsistent first-run state');
  let owned = null;
  if (value.owned !== null) {
    shape(value.owned, ['previous', 'applied'], '$.owned');
    owned = { previous: prefMap(value.owned.previous, '$.owned.previous'), applied: prefMap(value.owned.applied, '$.owned.applied') };
    if (!completed || !checked || !familyActive(owned.applied) || SAFETY_PREF_NAMES.some(name => owned.applied[name].locked || owned.previous[name].locked)
      || mapEqual(owned.previous, owned.applied)) bad('$.owned', 'invalid preference ownership');
  }
  return deepFreeze({ version: 1, first_run_completed: completed, checked, confirmed_at: at, owned });
}
export function safetyOffer(state = DEFAULT_SAFETY_STATE) {
  const input = validateSafetyState(state);
  return Object.freeze({ offer: !input.first_run_completed, checked: input.checked });
}
export function safetyStatus(state, snapshot) {
  const input = validateSafetyState(state), current = validateSafetySnapshot(snapshot);
  return Object.freeze({ offer: !input.first_run_completed, checked: input.checked, active: familyActive(current.prefs) && safeGuards(current.guards),
    owned: input.owned !== null && mapEqual(input.owned.applied, current.prefs) && safeGuards(current.guards) });
}
function mutation(name, desired) { return desired.has_user_value ? { name, operation: 'set', value: desired.value } : { name, operation: 'clear' }; }
function reconcileOwnership(state, current) {
  return state.owned !== null && (!mapEqual(state.owned.applied, current.prefs) || !safeGuards(current.guards))
    ? validateSafetyState({ ...state, owned: null }) : state;
}
function planResult(state, next, current, mutations, reason) {
  return deepFreeze({ state, next_state: next, expected: current, mutations, reason });
}
// Confirmation is the sole permission to prepare any preference mutation.
// Declining the first-run offer leaves all Gecko preferences untouched.
export function planSafetyChoice({ state = DEFAULT_SAFETY_STATE, snapshot, checked, userConfirmed, now } = {}) {
  const original = validateSafetyState(state); flag(checked, '$.checked'); epoch(now, '$.now');
  if (userConfirmed !== true) bad('$.userConfirmed', 'explicit confirmation required');
  if (original.confirmed_at !== null && now < original.confirmed_at) bad('$.now', 'clock moved backwards');
  if (!checked && original.owned === null) {
    const next = validateSafetyState({ version: 1, first_run_completed: true, checked: false, confirmed_at: now, owned: null });
    return planResult(original, next, null, [], 'UNCHANGED');
  }
  const current = validateSafetySnapshot(snapshot), input = reconcileOwnership(original, current);
  const complete = (selected, owned) => validateSafetyState({ version: 1, first_run_completed: true, checked: selected, confirmed_at: now, owned });
  if (!checked) {
    if (input.owned === null) return planResult(input, complete(false, null), current, [], original.owned === null ? 'UNCHANGED' : 'PREFS_CHANGED');
    // One resolver configuration is an ownership group. A Settings/policy edit
    // to either field releases the whole group; rollback never merges into it.
    const changes = SAFETY_PREF_NAMES.filter(name => !prefEqual(current.prefs[name], input.owned.previous[name]))
      .map(name => mutation(name, input.owned.previous[name]));
    // URI and mode form one guarded transaction; the adapter owns serialization
    // and recovery, including the default branch after clearing a user value.
    return planResult(input, complete(false, null), current, changes, 'RESTORED');
  }
  if (!safeGuards(current.guards)) return planResult(input, input, current, [], 'EXTERNAL_DOH_CONFIGURATION');
  if (SAFETY_PREF_NAMES.some(name => current.prefs[name].locked)) return planResult(input, input, current, [], 'PREF_LOCKED');
  const desired = { ...current.prefs };
  for (const name of SAFETY_PREF_NAMES) {
    const target = name === 'network.trr.uri' ? FAMILY_DOH_URI : FAMILY_DOH_MODE;
    if (current.prefs[name].value !== target) desired[name] = { value: target, has_user_value: true, locked: false };
  }
  const changes = SAFETY_PREF_NAMES.filter(name => !prefEqual(current.prefs[name], desired[name])).map(name => mutation(name, desired[name]));
  const previous = input.owned !== null && mapEqual(input.owned.applied, current.prefs) ? input.owned.previous : current.prefs;
  const owned = changes.length || (input.owned !== null && mapEqual(input.owned.applied, current.prefs)) ? { previous, applied: desired } : null;
  return planResult(input, complete(true, owned), current, changes, changes.length ? 'APPLIED' : 'UNCHANGED');
}
function sameSnapshot(a, b) { return mapEqual(a.prefs, b.prefs) && SAFETY_GUARD_NAMES.every(key => a.guards[key] === b.guards[key]); }
// Adapter contract:
// snapshot() returns only the two declared non-secret prefs and guard flags.
// compareAndApply(expected, mutations) is synchronous and returns true ONLY
// after the complete guarded batch succeeds. On false/throw it must restore
// the prior batch, preserve newer user/policy writes, and leave no owned edits.
// A production adapter requires serialized compare-before-write plus recovery;
// the fake unit adapter supplies that contract without real pref/profile I/O.
export function applySafetyChoice({ prefs, state = DEFAULT_SAFETY_STATE, checked, userConfirmed, now } = {}) {
  const input = validateSafetyState(state); flag(checked, '$.checked'); epoch(now, '$.now');
  if (userConfirmed !== true) bad('$.userConfirmed', 'explicit confirmation required');
  if (!checked && input.owned === null) {
    const plan = planSafetyChoice({ state: input, checked, userConfirmed, now });
    return Object.freeze({ state: plan.next_state, changed: false, reason: plan.reason });
  }
  if (typeof prefs?.snapshot !== 'function' || typeof prefs?.compareAndApply !== 'function') bad('$.prefs', 'missing injected preference adapter');
  if (input.confirmed_at !== null && now < input.confirmed_at) bad('$.now', 'clock moved backwards');
  let plan;
  try { plan = planSafetyChoice({ state: input, checked, userConfirmed, now, snapshot: prefs.snapshot() }); }
  catch { return Object.freeze({ state: validateSafetyState({ ...input, owned: null }), changed: false, reason: 'PREF_READ_FAILED' }); }
  if (!plan.mutations.length) return Object.freeze({ state: plan.next_state, changed: false, reason: plan.reason });
  // Re-check after planning so callers cannot apply a plan against a different
  // preference generation. The adapter then makes the final comparison.
  let latest;
  try { latest = validateSafetySnapshot(prefs.snapshot()); }
  catch { return Object.freeze({ state: validateSafetyState({ ...plan.state, owned: null }), changed: false, reason: 'PREF_READ_FAILED' }); }
  if (!sameSnapshot(latest, plan.expected)) return Object.freeze({ state: reconcileOwnership(plan.state, latest), changed: false, reason: 'PREFS_CHANGED' });
  const recoveredState = () => {
    try { return reconcileOwnership(plan.state, validateSafetySnapshot(prefs.snapshot())); }
    catch { return validateSafetyState({ ...plan.state, owned: null }); }
  };
  let applied;
  try { applied = prefs.compareAndApply(plan.expected, plan.mutations); } catch { return Object.freeze({ state: recoveredState(), changed: false, reason: 'PREF_WRITE_FAILED' }); }
  if (applied !== true) return Object.freeze({ state: recoveredState(), changed: false, reason: 'PREFS_CHANGED' });
  return Object.freeze({ state: plan.next_state, changed: true, reason: plan.reason });
}
