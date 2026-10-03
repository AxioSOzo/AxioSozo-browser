// Preparation only. Pure ownership/lease sequencing; no native collection or UI.
// Integration changes only these two paths to adjacent ./ imports.
import { AgentToolError } from './GeckoBiDiReadSession.sys.mjs';
import { inspectViewportPng } from './GeckoAgentTools.sys.mjs';
const fail = code => { throw new AgentToolError(code); };
const TAB = /^t_[1-9][0-9]{0,14}$/;
const RAW_BYTES = 2_097_152;
const PIXELS = 33_554_432;
const DIMENSION = 16_384;
const PARAMS = new Set(['tab_id', 'expected', 'purpose', 'max_width', 'max_height', 'max_bytes']);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const CODES = new Set(['INVALID_PARAMS', 'UNKNOWN_TAB', 'PRIVATE', 'BLOCKED_CATEGORY',
  'UNAVAILABLE', 'NOT_APPROVED', 'BUSY', 'TIMEOUT', 'TOO_LARGE']);
const codeError = error => error instanceof AgentToolError && CODES.has(error.code) ? error : new AgentToolError('UNAVAILABLE');

function parameters(value) {
  try { return dataParameters(value); }
  catch (error) { if (error instanceof AgentToolError) throw error; fail('INVALID_PARAMS'); }
}
function dataParameters(value) {
  if (!record(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail('INVALID_PARAMS');
  const fields = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(fields).some(key => !PARAMS.has(key) || !('value' in fields[key]))) fail('INVALID_PARAMS');
  const get = key => fields[key]?.value;
  const expected = get('expected');
  const tab_id = get('tab_id');
  if (typeof tab_id !== 'string' || !TAB.test(tab_id) || !record(expected) || !Object.isFrozen(expected)
      || Object.getOwnPropertyDescriptor(expected, 'tab_id')?.value !== tab_id) fail('INVALID_PARAMS');
  const purpose = get('purpose');
  if (!['bridge', 'handoff', 'decision'].includes(purpose)) fail('INVALID_PARAMS');
  const tight = purpose !== 'bridge';
  const limits = { max_width: tight ? 1280 : 1920, max_height: tight ? 1280 : DIMENSION,
    max_bytes: tight ? 1_048_576 : RAW_BYTES };
  const result = { tab_id, expected, purpose };
  for (const key of Object.keys(limits)) {
    const provided = get(key);
    const fallback = key === 'max_width' ? 1280 : limits[key];
    const limit = provided === undefined ? fallback : provided;
    const minimum = key === 'max_width' && !tight ? 64 : 1;
    if (!Number.isInteger(limit) || limit < minimum || limit > limits[key]) fail('INVALID_PARAMS');
    result[key] = limit;
  }
  return Object.freeze(result);
}
function method(value, name) {
  const fn = record(value) && Object.getOwnPropertyDescriptor(value, name)?.value;
  if (typeof fn !== 'function') fail('UNAVAILABLE');
  return fn;
}
function png(data, decode) {
  const dimensions = inspectViewportPng(data, decode);
  if (dimensions.width * dimensions.height > PIXELS) fail('TOO_LARGE');
  return Object.freeze({ mime: 'image/png', data_base64: data, ...dimensions });
}
function target(image, request) {
  const scale = Math.min(1, request.max_width / image.width, request.max_height / image.height);
  return Object.freeze({ width: Math.max(1, Math.floor(image.width * scale)),
    height: Math.max(1, Math.floor(image.height * scale)) });
}

/**
 * Privileged one-shot read orchestration. All authority and native effects are
 * injected. The caller must retain this owner until close() resolves true.
 * releaseReadLease(commit:true) MUST synchronously validate and retire the child
 * lease before replying literal true. A cleanup receipt is not capture authority.
 */
export function createAgentViewportCapture({
  isActive, beginReadLease, validateReadLease, releaseReadLease,
  createNativeReadSession, validatePng, resizePng = null,
  setTimer, clearTimer, timeoutMs = 10_000, cleanupTimeoutMs = 1_000,
  decode = globalThis.atob,
} = {}) {
  for (const fn of [isActive, beginReadLease, validateReadLease, releaseReadLease,
    createNativeReadSession, validatePng, setTimer, clearTimer, decode]) {
    if (typeof fn !== 'function') throw new TypeError('trusted callback required');
  }
  if (resizePng !== null && typeof resizePng !== 'function') throw new TypeError('resizePng');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000
      || !Number.isInteger(cleanupTimeoutMs) || cleanupTimeoutMs < 1 || cleanupTimeoutMs > 5_000) throw new TypeError('timeouts');
  const operations = new Set();
  let closed = false;

  function cancel(op, code) {
    if (op.cancelCode !== null || op.finished) return;
    op.cancelCode = code;
    op.controller.abort();
    op.rejectCancel(new AgentToolError(code));
  }
  function active(op) {
    try { return isActive(op.request.expected, op.request) === true; }
    catch { fail('UNAVAILABLE'); }
  }
  function parent(op) {
    if (op.cancelCode !== null) fail(op.cancelCode);
    if (closed || op.finished || op.authorityRetired || !active(op)) fail('NOT_APPROVED');
  }
  function publication(op) {
    // This is an immutable-image commit receipt, never a reusable read lease.
    if (op.cancelCode !== null) fail(op.cancelCode);
    if (closed || op.finished || !op.authorityRetired
        || !active(op)) fail('NOT_APPROVED');
  }
  function forget(op) {
    if (op.finished && op.pending.size === 0 && (!op.reader || op.reader.retired)
        && (!op.lease || op.lease.retired)) operations.delete(op);
  }
  function clear(timer) {
    if (timer === undefined) return;
    try { clearTimer(timer); }
    catch { closed = true; fail('UNAVAILABLE'); }
  }
  async function bounded(promise) {
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimer(() => reject(new AgentToolError('UNAVAILABLE')), cleanupTimeoutMs);
    });
    try { return await Promise.race([promise, deadline]); }
    finally { clear(timer); }
  }
  function track(op, call, acquire) {
    const token = {};
    op.pending.add(token);
    let raw;
    try { raw = Promise.resolve(call()); }
    catch (error) { raw = Promise.reject(error); }
    const observed = raw.then(value => {
      op.pending.delete(token);
      if (acquire) acquire(value);
      // A cancelled acquisition still owns any late resource. Retire it, never
      // use it. Cleanup failure leaves the exact operation in operations.
      if (op.finished && acquire) void cleanup(op, false).catch(() => {});
      forget(op);
      return value;
    }, error => {
      op.pending.delete(token);
      forget(op);
      throw codeError(error);
    });
    observed.catch(() => {});
    return Promise.race([observed, op.cancelled]);
  }
  async function checkpoint(op) {
    parent(op);
    if (!op.lease || op.lease.retired) fail('UNAVAILABLE');
    const valid = await track(op, () => validateReadLease(op.lease.value, op.request, { signal: op.controller.signal }));
    parent(op);
    if (valid !== true || op.lease.retired) fail('UNAVAILABLE');
  }
  async function step(op, call, acquire) {
    await checkpoint(op);
    parent(op); // No authority cached across the checkpoint promise reaction.
    const value = await track(op, call, acquire);
    await checkpoint(op);
    return value;
  }
  function retirement(op, resource, commit, retry) {
    if (!resource || resource.retired) return Promise.resolve(true);
    if (resource.attempt?.pending) return resource.attempt.promise;
    if (resource.attempt && !retry && resource.attempt.commit === commit) return resource.attempt.promise;
    const attempt = { commit, pending: true, promise: null };
    resource.attempt = attempt;
    let result;
    try {
      result = resource === op.reader ? method(resource.value, 'close').call(resource.value)
        : releaseReadLease(resource.value, op.request,
          commit ? { commit: true, signal: op.controller.signal } : { commit: false });
    } catch (error) { result = Promise.reject(error); }
    attempt.promise = Promise.resolve(result).then(receipt => {
      if (resource === op.reader ? receipt !== undefined && receipt !== true : receipt !== true) fail('UNAVAILABLE');
      resource.retired = true;
      if (resource === op.lease) op.authorityRetired = true;
      attempt.pending = false;
      forget(op);
      return true;
    }, error => { throw codeError(error); }).catch(error => {
      attempt.pending = false;
      forget(op);
      throw codeError(error);
    });
    attempt.promise.catch(() => {});
    return attempt.promise;
  }
  async function cleanup(op, retry) {
    // No authority checks or capture work are performed during disposal. Failed
    // and pending attempts remain owned; an explicit close may retry failures.
    const attempts = [retirement(op, op.reader, false, retry), retirement(op, op.lease, false, retry)];
    await bounded(Promise.all(attempts));
    forget(op);
  }
  function state() {
    let leases = 0, readers = 0, pending = 0;
    for (const op of operations) {
      if (op.lease && !op.lease.retired) leases++;
      if (op.reader && !op.reader.retired) readers++;
      pending += op.pending.size;
    }
    return Object.freeze({ closed, busy: operations.size !== 0, pending_operations: pending,
      retained_leases: leases, retained_readers: readers, cleanup_incomplete: operations.size !== 0 });
  }

  return Object.freeze({
    getState: state,
    async close() {
      closed = true;
      const owned = [...operations];
      for (const op of owned) cancel(op, 'NOT_APPROVED');
      const results = await Promise.allSettled(owned.map(op => cleanup(op, true)));
      if (results.some(result => result.status !== 'fulfilled') || operations.size !== 0) fail('UNAVAILABLE');
      return true;
    },
    async captureViewport(params, { signal } = {}) {
      const request = parameters(params);
      if (closed || signal?.aborted) fail('NOT_APPROVED');
      if (operations.size !== 0) fail('BUSY');
      const op = { request, controller: new AbortController(), cancelCode: null, cancelled: null,
        rejectCancel: null, pending: new Set(), reader: null, lease: null,
        authorityRetired: false, finished: false };
      op.cancelled = new Promise((_, reject) => { op.rejectCancel = reject; });
      op.cancelled.catch(() => {});
      operations.add(op);
      let timer;
      let committed = false;
      const aborted = () => cancel(op, 'NOT_APPROVED');
      try {
        parent(op);
        signal?.addEventListener('abort', aborted, { once: true });
        if (signal?.aborted) aborted();
        timer = setTimer(() => cancel(op, 'TIMEOUT'), timeoutMs);
        parent(op);
        const lease = await track(op, () => beginReadLease(request, { signal: op.controller.signal }), value => {
          if (record(value)) op.lease = { value, retired: false, attempt: null };
        });
        parent(op);
        if (!record(lease) || !op.lease) fail('UNAVAILABLE');
        await checkpoint(op);
        const reader = await step(op, () => createNativeReadSession(request, { signal: op.controller.signal }), value => {
          if (record(value)) op.reader = { value, retired: false, attempt: null };
        });
        method(reader, 'close');
        const capture = method(reader, 'capture');
        const capabilities = Object.getOwnPropertyDescriptor(reader, 'capabilities')?.value;
        const capability = name => record(capabilities) && Object.getOwnPropertyDescriptor(capabilities, name)?.value;
        if (capability('viewportScreenshot') !== true || capability('act') !== false || capability('open') !== false) fail('UNAVAILABLE');
        let raw = await step(op, () => capture.call(reader, request.expected, { signal: op.controller.signal }));
        let image = png(Object.getOwnPropertyDescriptor(raw ?? {}, 'data_base64')?.value, decode);
        const validate = async () => {
          const valid = await step(op, () => validatePng(image, { signal: op.controller.signal }));
          if (valid !== true) fail('UNAVAILABLE');
        };
        await validate();
        const desired = target(image, request);
        if (image.width > request.max_width || image.height > request.max_height || image.decodedBytes > request.max_bytes) {
          if (resizePng === null) fail('TOO_LARGE');
          raw = await step(op, () => resizePng(Object.freeze({ ...image,
            max_width: request.max_width, max_height: request.max_height, max_bytes: request.max_bytes,
            target_width: desired.width, target_height: desired.height }), { signal: op.controller.signal }));
          image = png(Object.getOwnPropertyDescriptor(raw ?? {}, 'data_base64')?.value, decode);
          if (image.width !== desired.width || image.height !== desired.height) fail('TOO_LARGE');
          await validate();
        }
        if (image.width > request.max_width || image.height > request.max_height || image.decodedBytes > request.max_bytes) fail('TOO_LARGE');
        await checkpoint(op);
        parent(op);
        // Retire the owned reader before committing; observers remain active
        // while an asynchronous close is pending.
        await track(op, () => bounded(retirement(op, op.reader, false, false)));
        await checkpoint(op);
        parent(op);
        const receipt = await track(op, () => bounded(retirement(op, op.lease, true, false)));
        if (receipt !== true) fail('UNAVAILABLE');
        const completedTimer = timer;
        timer = undefined;
        clear(completedTimer);
        signal?.removeEventListener('abort', aborted);
        if (signal?.aborted) cancel(op, 'NOT_APPROVED');
        publication(op); // Synchronous final parent check; no following await.
        committed = true;
        return Object.freeze({ mime: 'image/png', width: image.width, height: image.height,
          data_base64: image.data_base64 });
      } catch (error) {
        if (op.cancelCode !== null) fail(op.cancelCode);
        // A rejected native promise also crosses an await boundary. Check the
        // exact parent before selecting any returned error code.
        if (closed || signal?.aborted || !active(op)) fail('NOT_APPROVED');
        throw codeError(error);
      } finally {
        op.finished = true;
        signal?.removeEventListener('abort', aborted);
        let timerError;
        try { clear(timer); } catch (error) { timerError = error; }
        if (!committed) {
          try { await cleanup(op, false); } catch { /* exact owners stay retained */ }
        }
        forget(op);
        if (timerError) throw timerError;
      }
    },
  });
}
