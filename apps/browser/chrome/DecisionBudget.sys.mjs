/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// One trusted process owner, injected into every decision consumer. No platform,
// provider, timer, persistence or UI capability is obtained by this module.
export const DEFAULT_DECISION_HOURLY_LIMIT = 30;
export const DECISION_BUDGET_HOUR_MS = 3600000;
const epoch = value => Number.isSafeInteger(value) && value >= 0;
const frozenBudget = calls => Object.freeze({ calls: Object.freeze([...calls]) });

export class DecisionBudgetError extends Error {
  constructor(code) { super(code); this.name = 'DecisionBudgetError'; this.code = code; }
}
const fail = code => { throw new DecisionBudgetError(code); };
const invalid = () => fail('INVALID_BUDGET_ADAPTER');

// Consume a rejected canonical native Promise without reading arbitrary `then`.
// Foreign/tampered thenables remain invalid; do not execute their capabilities.
const nativePromise = Promise, nativePromiseProto = Promise.prototype, nativeThen = Promise.prototype.then;
const nativeSpecies = Object.getOwnPropertyDescriptor(Promise, Symbol.species)?.get;
function consumeNativePromise(value) {
  try {
    if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== nativePromiseProto
      || Object.getOwnPropertyDescriptor(value, 'constructor')
      || Object.getOwnPropertyDescriptor(nativePromiseProto, 'constructor')?.value !== nativePromise
      || Object.getOwnPropertyDescriptor(nativePromise, Symbol.species)?.get !== nativeSpecies) return;
    Reflect.apply(nativeThen, value, [() => {}, () => {}]);
  } catch { /* Invalid exotic adapters receive no further capability calls. */ }
}

// Closed passive records: do not execute a getter while validating candidates.
function record(value, allowed, required = allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) invalid();
  const keys = Reflect.ownKeys(value);
  if (keys.some(key => typeof key !== 'string' || !allowed.includes(key))
    || required.some(key => !keys.includes(key))) invalid();
  const result = Object.create(null);
  for (const key of keys) {
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (!d || !Object.hasOwn(d, 'value') || !d.enumerable) invalid();
    result[key] = d.value;
  }
  return result;
}
function copyBudget(value) {
  const { calls } = record(value, ['calls']);
  if (!Array.isArray(calls) || Object.getPrototypeOf(calls) !== Array.prototype || calls.length > 30
    || Reflect.ownKeys(calls).length !== calls.length + 1) invalid();
  const copy = [];
  for (let i = 0; i < calls.length; i++) {
    const d = Object.getOwnPropertyDescriptor(calls, String(i));
    if (!d || !Object.hasOwn(d, 'value') || !d.enumerable || !epoch(d.value)) invalid();
    copy.push(d.value);
  }
  return frozenBudget(copy);
}
function synchronousValue(value) {
  consumeNativePromise(value);
  // A value is otherwise opaque. Reject thenables without executing `then`.
  if (!value || typeof value !== 'object' && typeof value !== 'function') return;
  let object = value;
  for (let depth = 0; object; depth++) {
    if (depth > 8 || Object.getOwnPropertyDescriptor(object, 'then')) invalid();
    object = Object.getPrototypeOf(object);
  }
}

/**
 * Trusted constructor inputs only. getLimit must synchronously return the
 * current configured integer 0..30; omission alone uses the default 30.
 * snapshot() returns immutable history; limit() reads current authority.
 * transact(fn) calls fn(budget, {now,limit}) and commits its {budget,value}
 * synchronously. It allows expiry and at most one new call, never a refund.
 * The owner stamps a new call at its own transaction-entry time. fn's returned
 * value is opaque; any value.budget is a proposal, not authoritative history.
 * reserve() is the site-rule convenience: {ok,budget,reason}, without options.
 */
export function createDecisionBudget(options = {}) {
  let config;
  try { config = record(options, ['clock', 'getLimit', 'initialBudget'], []); }
  catch { invalid(); }
  const clock = Object.hasOwn(config, 'clock') ? config.clock : () => Date.now();
  const getLimit = Object.hasOwn(config, 'getLimit') ? config.getLimit : () => DEFAULT_DECISION_HOURLY_LIMIT;
  if (typeof clock !== 'function' || typeof getLimit !== 'function') invalid();
  let budget;
  try { budget = Object.hasOwn(config, 'initialBudget') ? copyBudget(config.initialBudget) : frozenBudget([]); }
  catch { invalid(); }
  let busy = false, readingLimit = false, ceiling = null, highWater = null;
  const snapshot = () => budget;
  function readClock() {
    let at;
    try { at = clock(); } catch { invalid(); }
    if (!epoch(at)) { consumeNativePromise(at); invalid(); }
    if (highWater !== null && at < highWater) fail('CLOCK_ROLLBACK');
    highWater = at;
    return at;
  }
  function limit() {
    if (readingLimit) invalid();
    readingLimit = true;
    try {
      const value = getLimit();
      if (!Number.isInteger(value) || value < 0 || value > DEFAULT_DECISION_HOURLY_LIMIT) { consumeNativePromise(value); invalid(); }
      return ceiling === null ? value : Math.min(value, ceiling);
    } catch { invalid(); }
    finally { readingLimit = false; }
  }
  function transact(mutator) {
    if (busy || readingLimit || typeof mutator !== 'function') invalid();
    busy = true;
    try {
      const at = readClock();
      if (budget.calls.some(time => time > at)) fail('CLOCK_ROLLBACK');
      ceiling = limit();
      const base = frozenBudget(budget.calls.filter(time => time > at - DECISION_BUDGET_HOUR_MS));
      const frame = Object.freeze({ now: at, limit: ceiling });
      const result = mutator(base, frame);
      consumeNativePromise(result);
      const proposal = record(result, ['budget', 'value']);
      synchronousValue(proposal.value);
      const next = copyBudget(proposal.budget);
      // Prefix equality preserves duplicate reservations as well as their order.
      if (next.calls.length < base.calls.length || next.calls.length > base.calls.length + 1
        || base.calls.some((time, i) => time !== next.calls[i])) invalid();
      const added = next.calls.length === base.calls.length + 1;
      if (added && (next.calls.at(-1) > at || next.calls.at(-1) <= at - DECISION_BUDGET_HOUR_MS)) invalid();
      readClock(); // rollback during an injected callback also forbids commit
      const currentLimit = limit(); // current authority may have fallen in fn
      if (added && base.calls.length >= currentLimit) fail('budget_exhausted');
      budget = added ? frozenBudget([...base.calls, at]) : base;
      return proposal.value;
    } finally { ceiling = null; busy = false; }
  }
  function reserve() {
    try {
      const ok = transact((base, frame) => ({
        budget: base.calls.length < frame.limit ? frozenBudget([...base.calls, frame.now]) : base,
        value: base.calls.length < frame.limit,
      }));
      return Object.freeze({ ok, budget, reason: ok ? null : 'budget_exhausted' });
    } catch (error) {
      if (error instanceof DecisionBudgetError && ['budget_exhausted', 'CLOCK_ROLLBACK'].includes(error.code))
        return Object.freeze({ ok: false, budget, reason: error.code });
      throw error;
    }
  }
  return Object.freeze({ snapshot, limit, transact, reserve });
}
