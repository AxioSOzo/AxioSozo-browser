// Pure dispatch for the user-approved agent channel. No UI or DOM manipulation.
import { AgentToolError } from './GeckoBiDiReadSession.sys.mjs';
const fail = (code) => { throw new AgentToolError(code); };
const TAB = /^t_[1-9][0-9]{0,14}$/;
const SESSION = /^s_[0-9a-f]{16}$/;
const READS = new Set(['tabs.list', 'tabs.active', 'project.info', 'console.errors', 'tabs.screenshot']);
const ACTS = new Set(['tabs.navigate', 'page.click', 'page.type']);
const PNG_BYTES_MAX = 2_097_152;
const PNG_DIMENSION_MAX = 16_384;
const RECORDS_MAX = 4096;
const MAX_PUBLIC_USER_CONTEXT_ID = 4294967294;
const text = (value, max) => typeof value === 'string' && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function webUrl(value, isSensitiveHost) {
  if (!text(value, 8192)) fail('INVALID_PARAMS');
  let url;
  try { url = new URL(value); } catch { fail('INVALID_PARAMS'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) fail('INVALID_PARAMS');
  if (isSensitiveHost(url.hostname) !== false) fail('BLOCKED_CATEGORY');
  return url;
}

function assertTab(tab, id, isSensitiveHost) {
  if (!object(tab) || tab.tab_id !== id || !TAB.test(id)) fail('UNKNOWN_TAB');
  if (tab.private !== false) fail('PRIVATE');
  webUrl(tab.url, isSensitiveHost);
  if (!text(tab.title, 4096) || typeof tab.active !== 'boolean'
      || !['gecko', 'chromium'].includes(tab.engine)
      || !text(tab.document_id, 128) || !tab.document_id
      || !Number.isInteger(tab.userContextId) || tab.userContextId < 0 || tab.userContextId > MAX_PUBLIC_USER_CONTEXT_ID
      || !(tab.project_id === null || text(tab.project_id, 128))) fail('UNAVAILABLE');
  return tab;
}
function snapshot(tab) {
  return Object.freeze({ tab_id: tab.tab_id, url: tab.url, title: tab.title, active: tab.active,
    project_id: tab.project_id, engine: tab.engine });
}
function binding(tab) {
  return { tab_id: tab.tab_id, url: tab.url, document_id: tab.document_id, project_id: tab.project_id,
    engine: tab.engine, userContextId: tab.userContextId };
}
function sameBinding(before, now) {
  return Object.keys(before).every((key) => before[key] === now[key]);
}
function validateParams(method, params) {
  if (!object(params) || ![Object.prototype, null].includes(Object.getPrototypeOf(params))) fail('INVALID_PARAMS');
  const descriptors = Object.getOwnPropertyDescriptors(params);
  const allowed = method === 'tabs.screenshot' ? ['tab_id', 'max_width']
    : method === 'console.errors' ? ['tab_id'] : [];
  if (Reflect.ownKeys(descriptors).some(key => !allowed.includes(key) || !('value' in descriptors[key]))) fail('INVALID_PARAMS');
  const result = Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.value]));
  if (allowed.includes('tab_id') && (typeof result.tab_id !== 'string' || !TAB.test(result.tab_id))) fail('INVALID_PARAMS');
  if ('max_width' in result && (!Number.isInteger(result.max_width) || result.max_width < 64 || result.max_width > 1920)) fail('INVALID_PARAMS');
  return Object.freeze(result);
}

/** Decode only enough of the native PNG to validate its dimensions and cap. */
export function inspectViewportPng(data, decode = atob) {
  if (typeof data !== 'string' || !data.length || data.length > 4 * Math.ceil(PNG_BYTES_MAX / 3)
      || data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) fail('TOO_LARGE');
  let bytes;
  try { bytes = decode(data); } catch { fail('UNAVAILABLE'); }
  if (typeof bytes !== 'string' || bytes.length > PNG_BYTES_MAX) fail('TOO_LARGE');
  if (bytes.length < 33) fail('UNAVAILABLE');
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (sig.some((v, i) => bytes.charCodeAt(i) !== v) || bytes.slice(12, 16) !== 'IHDR') fail('UNAVAILABLE');
  const u32 = (offset) => ((bytes.charCodeAt(offset) * 0x1000000) + (bytes.charCodeAt(offset + 1) << 16)
    + (bytes.charCodeAt(offset + 2) << 8) + bytes.charCodeAt(offset + 3));
  if (u32(8) !== 13) fail('UNAVAILABLE');
  const width = u32(16);
  const height = u32(20);
  if (width < 1 || height < 1 || width > PNG_DIMENSION_MAX || height > PNG_DIMENSION_MAX) fail('TOO_LARGE');
  return { width, height, decodedBytes: bytes.length };
}

function sanitizeErrors(result) {
  if (!object(result) || !Number.isSafeInteger(result.count) || result.count < 0 || !Array.isArray(result.messages)
      || result.messages.length > 50) fail('UNAVAILABLE');
  const messages = result.messages.map((entry) => {
    if (!object(entry) || !['error', 'warning'].includes(entry.level)
        || typeof entry.text !== 'string' || entry.text.length > 1000
        || typeof entry.source !== 'string' || entry.source.length > 2048
        || !Number.isInteger(entry.line) || entry.line < 0 || entry.line > 0xffffffff
        || !Number.isSafeInteger(entry.at) || entry.at < 0) fail('UNAVAILABLE');
    return { level: entry.level, text: entry.text, source: entry.source, line: entry.line, at: entry.at };
  });
  return { count: result.count, messages };
}
function projectInfo(project) {
  if (project == null) return null;
  if (!object(project) || !text(project.project_id, 128) || !text(project.name, 256)
      || !text(project.root, 4096) || !project.root.startsWith('/')
      || !Array.isArray(project.apps) || project.apps.length > 64
      || !Array.isArray(project.integrations) || project.integrations.length > 64) fail('UNAVAILABLE');
  return {
    project_id: project.project_id, name: project.name, root: project.root,
    apps: project.apps.map((app) => {
      if (!object(app) || !(app.app === null || text(app.app, 128)) || !Array.isArray(app.environments) || app.environments.length > 64) fail('UNAVAILABLE');
      return { app: app.app, environments: app.environments.map((environment) => {
        if (!object(environment) || !text(environment.name, 128) || !text(environment.base_url, 8192)) fail('UNAVAILABLE');
        // Environment links are configuration metadata; sensitive hosts are not
        // navigated or observed by returning these project-owned values.
        let parsed;
        try { parsed = new URL(environment.base_url); } catch { fail('UNAVAILABLE'); }
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) fail('UNAVAILABLE');
        return { name: environment.name, base_url: environment.base_url };
      }) };
    }),
    integrations: project.integrations.map((integration) => {
      if (!object(integration) || !text(integration.id, 128) || !text(integration.name, 256)) fail('UNAVAILABLE');
      return { id: integration.id, name: integration.name };
    }),
  };
}

export const AGENT_CAPTURE_LIMITS = Object.freeze({ max_width: 1920, default_width: 1280,
  max_height: PNG_DIMENSION_MAX, max_bytes: PNG_BYTES_MAX, pixels: 33_554_432,
  released_sessions: 4096 });
const CAPTURE_CODES = new Set(['INVALID_PARAMS', 'UNKNOWN_TAB', 'PRIVATE', 'BLOCKED_CATEGORY',
  'UNAVAILABLE', 'NOT_APPROVED', 'NOT_IN_PROJECT', 'BUSY', 'TIMEOUT', 'TOO_LARGE']);
const safeError = error => error instanceof AgentToolError && CAPTURE_CODES.has(error.code)
  ? error : new AgentToolError('UNAVAILABLE');
const dataMethod = (value, name) => {
  const fn = object(value) && Object.getOwnPropertyDescriptor(value, name)?.value;
  if (typeof fn !== 'function') fail('UNAVAILABLE');
  return fn;
};
const promiseThen = Promise.prototype.then;
const literalTrue = value => {
  if (value === true) return true;
  // Only genuine Promise internals are observed; arbitrary thenables are not run.
  try { promiseThen.call(value, () => {}, () => {}); } catch {}
  return false;
};
const metadata = tab => Object.freeze({ ...snapshot(tab), private: false,
  document_id: tab.document_id, userContextId: tab.userContextId });

/**
 * Pure dispatch. Capture has no native default. One exact request owns one
 * capture owner; only a literal successful close receipt retires that owner.
 * Keep the standalone object until awaited close() succeeds, even if Service
 * ignores a releaseSession Promise. No DOM, actor, input, listener or startup.
 */
export function createGeckoAgentTools({
  getTabs, getActiveTab, getTab, getProject, getConsoleErrors,
  isSensitiveHost, isSessionActive,
  captureEnabled = false, getCaptureExpected = null, isCaptureCurrent = null,
  createCaptureOwner = null, setTimer, clearTimer,
  timeoutMs = 10_000, cleanupTimeoutMs = 1_000,
} = {}) {
  for (const callback of [getTabs, getActiveTab, getTab, getProject, getConsoleErrors,
    isSensitiveHost, isSessionActive, setTimer, clearTimer]) {
    if (typeof callback !== 'function') throw new TypeError('trusted runtime callback required');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000
      || !Number.isInteger(cleanupTimeoutMs) || cleanupTimeoutMs < 1 || cleanupTimeoutMs > 5_000) throw new TypeError('timeouts');
  const canCapture = captureEnabled === true && [getCaptureExpected, isCaptureCurrent, createCaptureOwner]
    .every(callback => typeof callback === 'function');
  const operations = new Set(), released = new Set();
  let closed = false;
  const assertSession = (session, signal) => {
    let valid = false;
    try { valid = !closed && !signal?.aborted && object(session) && SESSION.test(session.session)
      && !released.has(session.session) && session.state === 'approved'
      && literalTrue(isSessionActive(session.session))
      && (session.project_id === null || text(session.project_id, 128)); }
    catch { /* unknown authority denies */ }
    if (!valid || closed || signal?.aborted || released.has(session.session) || session.state !== 'approved') fail('NOT_APPROVED');
  };
  const trackedTab = async id => assertTab(await getTab(id), id, isSensitiveHost);
  const safelyVisible = tab => {
    try { return assertTab(tab, tab?.tab_id, isSensitiveHost); }
    catch (error) { if (error instanceof AgentToolError) return null; throw error; }
  };
  function guard(op) {
    if (op.cancelCode !== null) fail(op.cancelCode);
    assertSession(op.session, op.signal);
    if (op.sessionSource.session !== op.session.session || op.sessionSource.project_id !== op.session.project_id
        || op.sessionSource.state !== 'approved') fail('NOT_APPROVED');
    if (op.controller.signal.aborted) fail('NOT_APPROVED');
    if (op.expected) {
      let current = false;
      try { current = literalTrue(isCaptureCurrent(op.expected, op.request)); }
      catch { /* registry failure denies */ }
      if (!current) fail('NOT_APPROVED');
      if (op.session.project_id !== null && op.expected.project_id !== op.session.project_id) fail('NOT_IN_PROJECT');
    }
    // Predicates may synchronously re-enter revocation. Finish without callbacks.
    if (op.cancelCode !== null) fail(op.cancelCode);
    if (closed || released.has(op.session.session) || op.signal?.aborted || op.controller.signal.aborted
        || op.sessionSource.session !== op.session.session || op.sessionSource.project_id !== op.session.project_id
        || op.sessionSource.state !== 'approved') fail('NOT_APPROVED');
  }
  function cancel(op, code) {
    if (op.cancelCode !== null || op.finished) return;
    op.cancelCode = code;
    op.controller.abort();
    op.rejectCancel(new AgentToolError(code));
  }
  function forget(op) {
    if (op.finished && op.pending.size === 0 && (!op.owner || op.owner.retired)) operations.delete(op);
  }
  function clear(timer) {
    if (timer === undefined) return;
    try { clearTimer(timer); }
    catch {
      closed = true;
      for (const op of operations) cancel(op, 'NOT_APPROVED');
      fail('UNAVAILABLE');
    }
  }
  async function bounded(promise) {
    let timer;
    const deadline = new Promise((_, reject) => { timer = setTimer(() => reject(new AgentToolError('UNAVAILABLE')), cleanupTimeoutMs); });
    try { return await Promise.race([promise, deadline]); }
    finally { clear(timer); }
  }
  function retire(op, retry) {
    const resource = op.owner;
    if (!resource || resource.retired) return Promise.resolve(true);
    if (resource.attempt?.pending || resource.attempt && !retry) return resource.attempt.promise;
    const attempt = { pending: true, promise: null };
    resource.attempt = attempt;
    let value;
    try { value = dataMethod(resource.value, 'close').call(resource.value); }
    catch (error) { value = Promise.reject(error); }
    attempt.promise = Promise.resolve(value).then(receipt => {
      if (receipt !== true) fail('UNAVAILABLE');
      resource.retired = true;
      return true;
    }).catch(error => { throw safeError(error); }).finally(() => {
      attempt.pending = false;
      forget(op);
    });
    attempt.promise.catch(() => {});
    return attempt.promise;
  }
  function cleanup(op, retry) {
    // The underlying job remains observed after its bounded wait times out.
    // Once acquisition settles, this same job retires any exact late owner.
    const job = (async () => {
      await retire(op, retry);
      await Promise.all([...op.pending].map(token => token.settled));
      await retire(op, false);
      forget(op);
      return true;
    })();
    job.catch(() => {});
    return bounded(job);
  }
  function track(op, call, acquiring = false) {
    guard(op);
    const token = { settled: null };
    op.pending.add(token);
    let raw;
    try { raw = Promise.resolve(call()); }
    catch (error) { raw = Promise.reject(error); }
    const observed = raw.then(value => {
      op.pending.delete(token);
      if (acquiring && value !== null && (typeof value === 'object' || typeof value === 'function')) {
        op.owner = { value, retired: false, attempt: null };
        if (op.finished || op.cancelCode !== null || closed) {
          const late = cleanup(op, false);
          late.catch(() => {});
        }
      }
      forget(op);
      return value;
    }, error => {
      op.pending.delete(token);
      forget(op);
      throw safeError(error);
    });
    observed.catch(() => {});
    token.settled = observed.then(() => true, () => true);
    return Promise.race([observed, op.cancelled]);
  }
  async function liveTab(op) {
    const now = assertTab(await track(op, () => getTab(op.bound.tab_id)), op.bound.tab_id, isSensitiveHost);
    guard(op);
    if (!sameBinding(op.bound, now)) fail('UNKNOWN_TAB');
    return now;
  }
  function disposal(id, all) {
    // Revocation is synchronous at entry, before the first disposal await.
    if (all) closed = true;
    else {
      if (typeof id !== 'string' || !SESSION.test(id)) {
        const invalid = Promise.reject(new AgentToolError('INVALID_PARAMS')); invalid.catch(() => {}); return invalid;
      }
      if (!released.has(id) && released.size >= AGENT_CAPTURE_LIMITS.released_sessions) closed = true;
      else released.add(id);
    }
    const owned = [...operations].filter(op => closed || op.session.session === id);
    for (const op of owned) cancel(op, 'NOT_APPROVED');
    const job = (async () => {
      const results = await Promise.allSettled(owned.map(op => cleanup(op, true)));
      if (results.some(result => result.status !== 'fulfilled')
          || [...operations].some(op => all || closed || op.session.session === id)) fail('UNAVAILABLE');
      return true;
    })();
    // Real Service/Core does not await this callback. Observe it here without
    // releasing the resources or translating a failed receipt into success.
    job.catch(() => {});
    return job;
  }
  function state() {
    let pending = 0, owners = 0, closing = 0;
    for (const op of operations) {
      pending += op.pending.size;
      if (op.owner && !op.owner.retired) {
        owners++;
        if (op.owner.attempt?.pending) closing++;
      }
    }
    return Object.freeze({ closed, busy: operations.size !== 0, pending_operations: pending,
      retained_owners: owners, pending_closes: closing, cleanup_incomplete: operations.size !== 0,
      released_sessions: released.size });
  }
  const synchronous = value => {
    let promise = false;
    try { promiseThen.call(value, () => {}, () => {}); promise = true; } catch {}
    if (promise || value !== null && (typeof value === 'object' || typeof value === 'function')
        && Object.getOwnPropertyDescriptor(value, 'then')) fail('UNAVAILABLE');
    return value;
  };
  const listTabs = () => {
    if (closed) return Object.freeze([]);
    const tabs = synchronous(getTabs());
    if (closed) return Object.freeze([]);
    if (!Array.isArray(tabs) || tabs.length > RECORDS_MAX) fail('TOO_LARGE');
    const visible = tabs.map(safelyVisible).filter(Boolean);
    if (new Set(visible.map(tab => tab.tab_id)).size !== visible.length) fail('UNAVAILABLE');
    return Object.freeze(visible.map(metadata));
  };
  const metadataTab = id => {
    if (closed) return null;
    let tab;
    try { tab = assertTab(synchronous(getTab(id)), id, isSensitiveHost); }
    catch (error) { if (error instanceof AgentToolError) return null; throw error; }
    return closed ? null : metadata(tab);
  };
  async function screenshot(params, session, signal) {
    if (!canCapture) fail('UNAVAILABLE');
    if (operations.size !== 0) fail('BUSY');
    const op = { session: Object.freeze({ session: session.session, project_id: session.project_id, state: 'approved' }),
      sessionSource: session, signal, controller: new AbortController(), cancelCode: null,
      cancelled: null, rejectCancel: null, pending: new Set(), owner: null, expected: null,
      request: null, bound: null, finished: false };
    op.cancelled = new Promise((_, reject) => { op.rejectCancel = reject; });
    op.cancelled.catch(() => {});
    operations.add(op);
    const aborted = () => cancel(op, 'NOT_APPROVED');
    let timer, result, failed = null;
    try {
      signal?.addEventListener('abort', aborted, { once: true });
      if (signal?.aborted) aborted();
      timer = setTimer(() => cancel(op, 'TIMEOUT'), timeoutMs);
      const tab = assertTab(await track(op, () => getTab(params.tab_id)), params.tab_id, isSensitiveHost);
      guard(op);
      if (tab.engine !== 'gecko') fail('UNAVAILABLE');
      if (op.session.project_id !== null && tab.project_id !== op.session.project_id) fail('NOT_IN_PROJECT');
      op.bound = binding(tab);
      const expected = await track(op, () => getCaptureExpected(tab));
      guard(op);
      if (!object(expected) || !Object.isFrozen(expected)
          || Reflect.ownKeys(Object.getOwnPropertyDescriptors(expected)).some(key => !('value' in Object.getOwnPropertyDescriptor(expected, key)))) fail('UNAVAILABLE');
      assertTab(expected, params.tab_id, isSensitiveHost);
      if (!sameBinding(op.bound, expected)) fail('UNKNOWN_TAB');
      op.expected = expected;
      op.request = Object.freeze({ tab_id: params.tab_id, expected, purpose: 'bridge',
        max_width: params.max_width ?? AGENT_CAPTURE_LIMITS.default_width,
        max_height: AGENT_CAPTURE_LIMITS.max_height, max_bytes: AGENT_CAPTURE_LIMITS.max_bytes });
      guard(op);
      const context = Object.freeze({ signal: op.controller.signal, requestSignal: signal ?? null, session: op.session,
        isActive: (issued, request) => {
          try {
            if (issued !== op.expected || !object(request) || ['tab_id', 'expected', 'purpose', 'max_width', 'max_height', 'max_bytes']
              .some(key => Object.getOwnPropertyDescriptor(request, key)?.value !== op.request[key])) return false;
            guard(op); return !op.finished;
          } catch { return false; }
        } });
      const owner = await track(op, () => createCaptureOwner(op.request, context), true);
      guard(op);
      dataMethod(owner, 'close');
      const capture = dataMethod(owner, 'captureViewport');
      await liveTab(op);
      const raw = await track(op, () => capture.call(owner, op.request, { signal: op.controller.signal }));
      guard(op);
      const field = name => object(raw) && Object.getOwnPropertyDescriptor(raw, name)?.value;
      if (field('mime') !== 'image/png') fail('UNAVAILABLE');
      const data_base64 = field('data_base64');
      const dimensions = inspectViewportPng(data_base64);
      if (field('width') !== dimensions.width || field('height') !== dimensions.height) fail('UNAVAILABLE');
      if (dimensions.width > op.request.max_width || dimensions.height > op.request.max_height
          || dimensions.decodedBytes > op.request.max_bytes
          || dimensions.width * dimensions.height > AGENT_CAPTURE_LIMITS.pixels) fail('TOO_LARGE');
      await liveTab(op);
      guard(op);
      await Promise.race([bounded(retire(op, false)), op.cancelled]);
      await liveTab(op);
      // No await follows this exact session/registry/signal check before return.
      guard(op);
      result = Object.freeze({ mime: 'image/png', width: dimensions.width,
        height: dimensions.height, data_base64 });
    } catch (error) {
      failed = safeError(error);
      if (op.cancelCode !== null) failed = new AgentToolError(op.cancelCode);
      else {
        try { guard(op); } catch (authority) { failed = safeError(authority); }
      }
    } finally {
      op.finished = true;
      signal?.removeEventListener('abort', aborted);
      try { clear(timer); } catch (error) { failed = safeError(error); }
      if (!result || failed) {
        try { await cleanup(op, false); } catch { /* exact operation remains owned */ }
      }
      forget(op);
    }
    if (failed) throw failed;
    guard(op); // Last synchronous publication check after timer/listener disposal.
    return result;
  }
  return Object.freeze({
    isMethodAvailable(method) { return !closed && READS.has(method) && (method !== 'tabs.screenshot' || canCapture); },
    listTabs, getTab: metadataTab, confirmAction: () => false,
    releaseSession: id => disposal(id, false), close: () => disposal(null, true), getState: state,
    async executeMethod(method, input, session, { signal } = {}) {
      assertSession(session, signal);
      if (ACTS.has(method) || method === 'tabs.open') fail('UNAVAILABLE');
      if (!READS.has(method)) fail('UNKNOWN_METHOD');
      const params = validateParams(method, input);
      if (method === 'tabs.screenshot') return screenshot(params, session, signal);
      if (method === 'tabs.list') {
        const tabs = await listTabs(); assertSession(session, signal); return tabs.map(snapshot);
      }
      if (method === 'tabs.active') {
        const active = await getActiveTab(); assertSession(session, signal);
        const tab = safelyVisible(active); return tab ? snapshot(tab) : null;
      }
      if (method === 'project.info') {
        if (session.project_id === null) return null;
        const project = await getProject(session.project_id); assertSession(session, signal);
        const projected = projectInfo(project);
        if (projected?.project_id !== session.project_id) fail('UNAVAILABLE');
        return projected;
      }
      const tab = await trackedTab(params.tab_id); assertSession(session, signal);
      if (tab.engine !== 'gecko') fail('UNAVAILABLE');
      const before = binding(tab);
      const result = await getConsoleErrors(tab);
      assertSession(session, signal);
      const now = await trackedTab(before.tab_id); assertSession(session, signal);
      if (!sameBinding(before, now)) fail('UNKNOWN_TAB');
      return sanitizeErrors(result);
    },
  });
}

/** Service accepts exactly these six own functions; shutdown owner stays private. */
export function projectAgentServiceTools(owner) {
  const names = ['isMethodAvailable', 'listTabs', 'getTab', 'executeMethod', 'confirmAction', 'releaseSession'];
  const functions = names.map(name => [name, dataMethod(owner, name)]);
  return Object.freeze(Object.fromEntries(functions.map(([name, fn]) => [name, (...args) => fn.call(owner, ...args)])));
}
