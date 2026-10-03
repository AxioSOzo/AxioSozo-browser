// DOM-free, in-process Firefox 156 WebDriver BiDi screenshot adapter.
// This never starts RemoteAgent, a network listener or a WebSocket connection.
export class AgentToolError extends Error {
  constructor(code) { super(code); this.name = 'AgentToolError'; this.code = code; }
}
const fail = (code) => { throw new AgentToolError(code); };

function nativeTimers() {
  // Gecko system ES modules have no Window timer globals.
  const timers = globalThis.ChromeUtils?.importESModule('resource://gre/modules/Timer.sys.mjs');
  if (typeof timers?.setTimeout !== 'function' || typeof timers?.clearTimeout !== 'function') fail('UNAVAILABLE');
  return timers;
}
const nativeSetTimer = (callback, delay) => nativeTimers().setTimeout(callback, delay);
const nativeClearTimer = (timer) => nativeTimers().clearTimeout(timer);

// Firefox 156 leaves per-session content handlers until the document is gone.
// Bound that upstream retention explicitly; do not pretend destroy cleans them.
export function createBiDiAllocationBudget({ perDocument = 16, perProcess = 128 } = {}) {
  if (!Number.isInteger(perDocument) || perDocument < 1 || perDocument > 16
      || !Number.isInteger(perProcess) || perProcess < 1 || perProcess > 128) throw new TypeError('allocation limits');
  const counts = new WeakMap();
  let total = 0;
  let quarantined = false;
  return Object.freeze({
    claim(document) {
      if (quarantined) fail('UNAVAILABLE');
      if (!document || typeof document !== 'object') fail('UNAVAILABLE');
      const count = counts.get(document) ?? 0;
      if (count >= perDocument || total >= perProcess) fail('UNAVAILABLE');
      // Count before construction so a partially failed native constructor also
      // consumes a slot. No titles, URLs, images or session IDs are retained.
      counts.set(document, count + 1);
      total++;
    },
    // Construction uncertainty cannot be reset by replacing a reader owner.
    quarantine() { quarantined = true; return true; },
  });
}
const processAllocationBudget = createBiDiAllocationBudget();

async function loadGeckoModules() {
  const [session, remote, marionette] = await Promise.all([
    import('chrome://remote/content/shared/webdriver/Session.sys.mjs'),
    import('chrome://remote/content/components/RemoteAgent.sys.mjs'),
    import('chrome://remote/content/components/Marionette.sys.mjs'),
  ]);
  return {
    WebDriverSession: session.WebDriverSession,
    hasActiveWebDriverSession: session.hasActiveWebDriverSession,
    // The singleton starts tracking on import: load it only after ownership gates
    // pass and the owned WebDriverSession has initialized its own tracking.
    getNavigableManager: async () => (await import('chrome://remote/content/shared/NavigableManager.sys.mjs')).NavigableManager,
    RemoteAgent: remote.RemoteAgent,
    // This pinned singleton leaves _enabled undefined only in its never-enabled
    // startup state. Normalize that source-defined state here, never in the
    // general injected ownership gate. Read fresh facts on every request.
    Marionette: Object.freeze({
      get enabled() {
        const enabled = marionette.Marionette.enabled;
        return enabled === undefined ? false : enabled;
      },
      get running() { return marionette.Marionette.running; },
    }),
  };
}

function contentContext(tab) {
  const bc = tab?.browsingContext;
  if (!bc || bc.isContent !== true || bc.parent !== null || bc.isDiscarded !== false) fail('UNAVAILABLE');
  if (bc.usePrivateBrowsing !== false) fail('PRIVATE');
  const global = bc.currentWindowGlobal;
  if (!global || global.isClosed !== false || global.isCurrentGlobal !== true) fail('UNAVAILABLE');
  if (String(global.innerWindowId) !== tab.document_id || global.documentURI?.spec !== tab.url) fail('UNKNOWN_TAB');
  return bc;
}

/**
 * One owned BiDi session per screenshot. No listener or borrowed session.
 * close() cancels synchronously and returns an observed Promise<true> only
 * after the exact retained operation and owned root destruction settle.
 * It does not attest cleanup of upstream per-document content handlers.
 */
export function createGeckoBiDiReadSession({
  loadModules = loadGeckoModules,
  setTimer = nativeSetTimer,
  clearTimer = nativeClearTimer,
  timeoutMs = 10_000,
  allocationBudget = processAllocationBudget,
} = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) throw new TypeError('timeoutMs');
  if (typeof allocationBudget?.claim !== 'function' || typeof allocationBudget?.quarantine !== 'function') {
    throw new TypeError('allocationBudget');
  }
  let current = null;
  let closed = false;
  let generation = 0;
  let closing = null;

  function quarantine() {
    closed = true;
    try { allocationBudget.quarantine(); } catch { /* The exact owner remains retained. */ }
  }
  function controls(op, retry) {
    for (const key of ['timer', 'listener']) {
      const resource = op[key];
      if (!resource || resource.retired) continue;
      if (resource.failed && !retry) fail('UNAVAILABLE');
      try {
        if (key === 'timer') clearTimer(resource.value);
        else op.signal.removeEventListener('abort', resource.value);
        resource.retired = true;
        resource.failed = false;
      } catch {
        resource.failed = true;
        closed = true;
        fail('UNAVAILABLE');
      }
    }
  }
  function destroyOwned(op, retry) {
    if (!op.owner) return Promise.resolve(true);
    if (op.destroy?.pending || (op.destroy && !retry)) return op.destroy.promise;
    const attempt = { pending: true, promise: null };
    op.destroy = attempt;
    let resolveDisposal, rejectDisposal;
    const disposal = new Promise((resolve, reject) => { resolveDisposal = resolve; rejectDisposal = reject; });
    // Publish the coalesced promise before native destroy can reenter close via
    // its observer/handler notifications. Never expose a pending null promise.
    attempt.promise = disposal.then(receipt => {
      if (receipt !== undefined && receipt !== true) fail('UNAVAILABLE');
      op.owner = null;
      return true;
    }).catch(() => {
      quarantine(); // A native throw may follow removal from the session map.
      fail('UNAVAILABLE');
    }).finally(() => { attempt.pending = false; });
    attempt.promise.catch(() => {});
    // Pinned native destroy is synchronous void; retain an injected thenable
    // until it settles too. Neither a throw nor rejection releases the handle.
    try { resolveDisposal(op.owner.destroy()); }
    catch (error) { quarantine(); rejectDisposal(error); }
    return attempt.promise;
  }
  function forget(op) {
    if (current === op && op.flowDone && !op.owner && !op.constructionUncertain
        && (!op.timer || op.timer.retired) && (!op.listener || op.listener.retired)) current = null;
  }
  async function retire(op, retry) {
    const destruction = destroyOwned(op, retry);
    controls(op, retry);
    await destruction;
    if (op.constructionUncertain) fail('UNAVAILABLE');
    forget(op);
    return true;
  }
  function cancel(op, code) {
    if (op.cancelCode !== null) return;
    op.cancelCode = code;
    generation++;
    op.rejectCancel(new AgentToolError(code));
    // This may interrupt root work, but cannot prove the command settled.
    void destroyOwned(op, false).catch(() => {});
    try { controls(op, false); } catch { /* Retained for explicit close retry. */ }
  }
  function close() {
    closed = true;
    generation++;
    if (closing) return closing;
    let resolveClose, rejectClose;
    const receipt = new Promise((resolve, reject) => { resolveClose = resolve; rejectClose = reject; });
    closing = receipt;
    receipt.catch(() => {});
    const op = current;
    // Publish the close promise before cancellation invokes native destruction.
    // Recursive and ignored calls then share one already-observed attempt.
    if (op) cancel(op, 'NOT_APPROVED');
    const destruction = op ? destroyOwned(op, true) : Promise.resolve(true);
    const disposal = (async () => {
      if (op) {
        controls(op, true);
        await destruction;
        await op.rawSettled;
        await op.flowSettled;
        await retire(op, false);
        forget(op);
      }
      if (current !== null) fail('UNAVAILABLE');
      return true;
    })();
    disposal.then(value => { closing = null; resolveClose(value); }, () => {
      closing = null;
      rejectClose(new AgentToolError('UNAVAILABLE'));
    });
    return receipt;
  }

  return Object.freeze({
    capabilities: Object.freeze({ viewportScreenshot: true, act: false, open: false }),
    close,
    getState() {
      return Object.freeze({ closed, busy: current !== null,
        pending_operations: current && !current.operationSettled ? 1 : 0,
        retained_owners: current?.owner ? 1 : 0,
        pending_closes: current?.destroy?.pending ? 1 : 0,
        cleanup_incomplete: current !== null,
        construction_uncertain: current?.constructionUncertain === true });
    },
    async capture(tab, { signal } = {}) {
      if (closed || signal?.aborted) fail('NOT_APPROVED');
      if (current) fail('BUSY');
      const op = { epoch: generation, signal, cancelCode: null, rejectCancel: null,
        owner: null, destroy: null, timer: null, listener: null,
        constructionUncertain: false, operationSettled: false, flowDone: false, rawSettled: null, flowSettled: null };
      current = op;
      const assertLive = () => {
        if (closed || op.epoch !== generation || signal?.aborted) fail('NOT_APPROVED');
      };
      const cancelled = new Promise((_, reject) => { op.rejectCancel = reject; });
      cancelled.catch(() => {});
      const aborted = () => cancel(op, 'NOT_APPROVED');
      try {
        if (signal) {
          op.listener = { value: aborted, retired: false, failed: false };
          signal.addEventListener('abort', aborted, { once: true });
        }
        op.timer = { value: setTimer(() => cancel(op, 'TIMEOUT'), timeoutMs), retired: false, failed: false };
        if (op.cancelCode !== null) controls(op, false);
      } catch { cancel(op, 'UNAVAILABLE'); }
      const operation = (async () => {
        const modules = await loadModules();
        assertLive();
        const { WebDriverSession, hasActiveWebDriverSession, getNavigableManager, RemoteAgent, Marionette } = modules;
        if (typeof WebDriverSession !== 'function' || typeof hasActiveWebDriverSession !== 'function'
            || typeof getNavigableManager !== 'function' || !RemoteAgent || !Marionette) fail('UNAVAILABLE');
        const assertAgentsDisabled = () => {
          if (RemoteAgent.enabled !== false || RemoteAgent.running !== false || RemoteAgent.allowSystemAccess !== false
              || Marionette.enabled !== false || Marionette.running !== false) fail('UNAVAILABLE');
          assertLive();
        };
        assertAgentsDisabled();
        if (hasActiveWebDriverSession() !== false) fail('UNAVAILABLE');
        assertLive(); // Predicates and allocation hooks must not cache authority.
        const bc = contentContext(tab);
        assertLive();
        allocationBudget.claim(bc.currentWindowGlobal);
        assertLive();
        try {
          op.owner = new WebDriverSession({ acceptInsecureCerts: false, unhandledPromptBehavior: 'ignore' },
            new Set([WebDriverSession.SESSION_FLAG_BIDI]));
        } catch {
          // A native constructor may have installed global resources before it
          // threw, without returning a destroyable handle. Do not invent one.
          op.constructionUncertain = true;
          quarantine();
          fail('UNAVAILABLE');
        }
        assertLive();
        const NavigableManager = await getNavigableManager();
        assertAgentsDisabled();
        contentContext(tab);
        if (typeof NavigableManager?.getIdForBrowsingContext !== 'function') fail('UNAVAILABLE');
        const context = NavigableManager.getIdForBrowsingContext(bc);
        if (typeof context !== 'string' || !context || context.length > 128) fail('UNAVAILABLE');
        assertAgentsDisabled();
        const result = await op.owner.execute('browsingContext', 'captureScreenshot', {
          context, origin: 'viewport', format: { type: 'image/png' },
        });
        assertAgentsDisabled();
        contentContext(tab);
        if (!result || typeof result.data !== 'string') fail('UNAVAILABLE');
        return { data_base64: result.data };
      })();
      op.rawSettled = operation.then(() => { op.operationSettled = true; }, () => { op.operationSettled = true; });
      const finish = async (value, error) => {
        await retire(op, false);
        if (error) throw error instanceof AgentToolError ? error : new AgentToolError('UNAVAILABLE');
        assertLive();
        return value;
      };
      const flow = operation.then(value => finish(value, null), error => finish(null, error));
      op.flowSettled = flow.then(() => { op.flowDone = true; forget(op); }, () => { op.flowDone = true; forget(op); });
      flow.catch(() => {});
      return Promise.race([flow, cancelled]);
    },
  });
}
