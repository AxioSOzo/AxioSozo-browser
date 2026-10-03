/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Trusted constructor-hook composition only. Never give this owner or its
// registration API to an actor, page, request options or persisted input.
const REQUEST_ID = /^[A-Za-z0-9_.:-]{1,160}$/u;
const LEVELS = new Set(['address', 'outline', 'screen']);
export class DecisionSendingError extends Error {
  constructor(code) { super(code); this.name = 'DecisionSendingError'; this.code = code; }
}
const fail = code => { throw new DecisionSendingError(code); };

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
function fields(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('INVALID_INPUT');
  const proto = Object.getPrototypeOf(value), names = Reflect.ownKeys(value);
  if (proto !== Object.prototype && proto !== null || names.length !== keys.length
    || names.some(key => !keys.includes(key))) fail('INVALID_INPUT');
  const copy = Object.create(null);
  for (const key of keys) {
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (!d || !Object.hasOwn(d, 'value') || !d.enumerable) fail('INVALID_INPUT');
    copy[key] = d.value;
  }
  return copy;
}

/**
 * register({requestId,level,beforeSending}) is called by trusted runtime code
 * for one exact site/window owner or watch controller, and returns {signal,revoke}.
 * Pass lease.signal to the shared host and forward the caller's cancellation to
 * lease.revoke. Retain the lease through the host's owned reply/cancellation
 * grace; revoke it in finally, or immediately when its owner becomes invalid.
 * beforeSending is the ONE createDecide CONSTRUCTOR hook. It calls only the
 * privately registered guard, synchronously, requires true, and denies unknown,
 * duplicate, revoked, mismatched or reentrant handoffs. No broadcast or fallback.
 */
export function createDecisionSendingRouter() {
  const entries = new Map();
  let closed = false;
  function register(input) {
    const { requestId, level, beforeSending: guard } = fields(input, ['requestId', 'level', 'beforeSending']);
    if (typeof requestId !== 'string' || !REQUEST_ID.test(requestId) || !LEVELS.has(level) || typeof guard !== 'function') fail('INVALID_INPUT');
    if (closed) fail('cancelled');
    if (entries.has(requestId)) fail('REQUEST_ID_CONFLICT');
    const controller = new AbortController();
    const entry = { requestId, level, guard, controller, live: true, running: false, authorized: false };
    const revoke = () => {
      if (!entry.live) return;
      entry.live = false;
      if (entries.get(requestId) === entry) entries.delete(requestId);
      controller.abort();
    };
    entry.revoke = revoke;
    entries.set(requestId, entry);
    return Object.freeze({ signal: controller.signal, revoke });
  }
  function beforeSending(input) {
    let v;
    try { v = fields(input, ['request_id', 'level']); } catch { fail('cancelled'); }
    const entry = entries.get(v.request_id);
    if (closed || !entry || !entry.live || entry.controller.signal.aborted || entry.level !== v.level
      || entry.running || entry.authorized) fail('cancelled');
    entry.running = true;
    try {
      const result = entry.guard(Object.freeze({ request_id: entry.requestId, level: entry.level }));
      if (result !== true) consumeNativePromise(result);
      if (result !== true || closed || !entry.live || entry.controller.signal.aborted
        || entries.get(entry.requestId) !== entry) fail('cancelled');
      entry.authorized = true;
      return true;
    } catch { fail('cancelled'); }
    finally { entry.running = false; }
  }
  function close() {
    if (closed) return;
    closed = true;
    for (const entry of entries.values()) entry.revoke();
  }
  return Object.freeze({ register, beforeSending, close });
}
