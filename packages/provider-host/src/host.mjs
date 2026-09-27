import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { StringDecoder } from 'node:string_decoder';
import { exactKeys, id, object, prompt, ProviderError, requireValue } from './validation.mjs';
import { DRIVERS } from './discovery.mjs';

// lineBytes fits a 64 KiB decision-v1 state plus its envelope.
export const HOST_LIMITS = Object.freeze({ lineBytes: 73728, outputBytes: 4 * 1024 * 1024,
  requests: 1024, concurrentRequests: 8, turnMs: 120000, idleMs: 120000, decisionsPerHour: 30 });
const HOUR_MS = 3600000;

// One process-owned channel, one immutable provider session. The caller is trusted
// browser chrome; this is not an HTTP service or a web-content/native-messaging API.
export class ProviderHost extends EventEmitter {
  #factory; #session = null; #opening = false; #closed = false; #seen = new Set();
  #pending = new Set(); #turnTimer; #idleTimer; #outputBytes = 0; #closePromise; #openingPromise; #closing;
  #createDecider; #decider = null; #decisions = new Map(); #deciding = 0; #sent = []; #now;
  constructor({ createAdapter, createDecisionProvider = null, limits = HOST_LIMITS, now = Date.now }) {
    super(); this.#factory = createAdapter; this.#createDecider = createDecisionProvider; this.#now = now;
    this.limits = { ...HOST_LIMITS, ...limits };
    this.#armIdle();
  }
  #send(value) {
    if (!this.#closed) this.emit('message', { version: 1, ...value });
  }
  #armIdle() {
    clearTimeout(this.#idleTimer);
    if (this.#closed) return;
    this.#idleTimer = setTimeout(() => {
      if (this.#deciding) { this.#armIdle(); return; }
      this.#send({ event: { version: 1, type: 'host_idle', session_id: this.#session?.binding.session_id ?? null } });
      void this.close();
    }, this.limits.idleMs);
    this.#idleTimer.unref?.();
  }
  #event(event) {
    if (event.type === 'text_delta') {
      this.#outputBytes += Buffer.byteLength(event.text);
      if (this.#outputBytes > this.limits.outputBytes) {
        void this.#stop('OUTPUT_LIMIT'); return;
      }
    }
    if (event.type === 'turn_finished') {
      clearTimeout(this.#turnTimer); this.#armIdle();
    }
    this.#send({ event });
  }
  async #stop(reason) {
    const session = this.#session;
    if (!session) return;
    // A deadline is not successful cancellation. Reap the owned process and let
    // the adapter emit the uncertain terminal result before dropping the binding.
    this.#send({ event: { version: 1, type: 'session_error', session_id: session.binding.session_id, turn_id: session.active?.turn_id ?? null, reason } });
    await this.#release(session);
  }
  async #release(session) {
    if (this.#closing) return this.#closing;
    this.#closing = (async () => {
      try { await session.close(); }
      finally { if (this.#session === session) this.#session = null; clearTimeout(this.#turnTimer); this.#armIdle(); }
    })();
    try { await this.#closing; } finally { this.#closing = null; }
  }
  async handle(request) {
    let requestId = null;
    try {
      exactKeys(request, ['version', 'id', 'method', 'params']);
      requireValue(request.version === 1, 'INVALID_INPUT', 'Unsupported host protocol version');
      requestId = id(request.id, 'request id');
      requireValue(!this.#closed, 'PIPE_CLOSED', 'Provider host is closed');
      requireValue(!this.#seen.has(requestId), 'DUPLICATE_REQUEST', 'Request IDs cannot be replayed');
      requireValue(this.#seen.size < this.limits.requests, 'REQUEST_LIMIT', 'Start a new provider session');
      this.#seen.add(requestId);
      requireValue(this.#pending.size < this.limits.concurrentRequests, 'BACKPRESSURE', 'Too many outstanding requests');
      this.#pending.add(requestId);
      requireValue(object(request.params), 'INVALID_INPUT', 'Request params must be an object');
      const result = await this.#dispatch(request.method, request.params, requestId);
      this.#send({ id: requestId, result });
    } catch (error) {
      // Never forward provider stderr, auth payloads, arbitrary subprocess errors,
      // or paths. Our typed errors contain fixed, actionable host diagnostics.
      this.#send({ id: requestId, error: { code: error instanceof ProviderError ? error.code : 'HOST_ERROR',
        message: error instanceof ProviderError ? error.message : 'Provider host failed; close and retry the session' } });
    } finally { this.#pending.delete(requestId); }
  }
  // Defense in depth behind the browser's own budget: a rolling hour per host process.
  #takeBudget() {
    const now = this.#now(); this.#sent = this.#sent.filter(at => now - at < HOUR_MS);
    if (this.#sent.length >= this.limits.decisionsPerHour) return false;
    this.#sent.push(now); return true;
  }
  async #decide(params) {
    requireValue(this.#createDecider, 'UNSUPPORTED', 'Decisions are unavailable in this host');
    this.#decider ??= this.#createDecider();
    const controller = new AbortController(); const requestId = typeof params.request_id === 'string' ? params.request_id : null;
    const tracked = requestId !== null && !this.#decisions.has(requestId);
    if (tracked) this.#decisions.set(requestId, controller);
    this.#deciding++; clearTimeout(this.#idleTimer);
    try { return await this.#decider.decideSiteRule(params, { signal: controller.signal, allowSend: () => !this.#closed && this.#takeBudget() }); }
    finally {
      if (tracked) this.#decisions.delete(requestId);
      if (--this.#deciding === 0 && !this.#session?.active && !this.#opening) this.#armIdle();
    }
  }
  async #dispatch(method, params, requestId) {
    // Decisions need no provider session and never start a provider client.
    if (method === 'decision/site_rule') return this.#decide(params);
    if (method === 'decision/cancel') {
      exactKeys(params, ['request_id']); id(params.request_id, 'request_id');
      const controller = this.#decisions.get(params.request_id); controller?.abort();
      return { status: controller ? 'cancelling' : 'not_found', request_id: params.request_id };
    }
    if (method === 'session/open') {
      exactKeys(params, ['driver', 'instance_id', 'session_id']);
      requireValue(DRIVERS.includes(params.driver), 'UNSUPPORTED', 'Unknown provider driver');
      id(params.instance_id, 'instance_id'); id(params.session_id, 'session_id');
      requireValue(!this.#session && !this.#opening && !this.#closing, 'SESSION_BUSY', 'This host already owns a session');
      this.#opening = true; clearTimeout(this.#idleTimer);
      try {
        this.#openingPromise = this.#factory(params.driver, { instance_id: params.instance_id,
          session_id: params.session_id, account_identity: `official-client-${randomUUID()}` });
        const adapter = await this.#openingPromise;
        if (this.#closed) { await adapter.close(); throw new ProviderError('PIPE_CLOSED', 'Browser closed during provider startup'); }
        this.#session = adapter;
        adapter.on('event', event => this.#event(event));
        return { status: 'accepted', session_id: params.session_id, driver: params.driver,
          label: adapter.fixture ? 'TEST_FIXTURE' : 'EXPERIMENTAL_LIVE', capabilities: adapter.capabilities };
      } finally { this.#opening = false; this.#openingPromise = null; this.#armIdle(); }
    }
    requireValue(this.#session && params.session_id === this.#session.binding.session_id,
      'INSTANCE_MISMATCH', 'Request does not belong to this provider session');
    if (method === 'turn/start') {
      exactKeys(params, ['session_id', 'turn_id', 'text']); id(params.turn_id, 'turn_id'); prompt(params.text);
      requireValue(!this.#session.active, 'SESSION_BUSY', 'A provider turn is already running');
      clearTimeout(this.#idleTimer); this.#outputBytes = 0;
      this.#turnTimer = setTimeout(() => { void this.#stop('TURN_DEADLINE'); }, this.limits.turnMs);
      const turnTimer = this.#turnTimer;
      try {
        const { instance_id, session_id, account_identity } = this.#session.binding;
        return await this.#session.start({ version: 1, instance_id, session_id, account_identity,
          request_id: requestId, turn_id: params.turn_id, text: params.text });
      } catch (error) { if (this.#turnTimer === turnTimer) { clearTimeout(turnTimer); this.#armIdle(); } throw error; }
    }
    if (method === 'turn/cancel') {
      exactKeys(params, ['session_id', 'turn_id']); id(params.turn_id, 'turn_id');
      return this.#session.interrupt(params);
    }
    if (method === 'session/close') {
      exactKeys(params, ['session_id']);
      const session = this.#session;
      await this.#release(session);
      return { status: 'closed', session_id: params.session_id };
    }
    throw new ProviderError('UNSUPPORTED', 'Unknown provider host method');
  }
  async close() {
    if (this.#closePromise) return this.#closePromise;
    this.#closed = true; clearTimeout(this.#turnTimer); clearTimeout(this.#idleTimer);
    for (const controller of this.#decisions.values()) controller.abort();
    this.#closePromise = (async () => {
      if (this.#openingPromise) {
        try { const adapter = await this.#openingPromise; await adapter.close(); } catch { /* Failed startup already reaps its child. */ }
      }
      if (this.#session) { await this.#session.close(); this.#session = null; }
      this.emit('closed');
    })();
    return this.#closePromise;
  }
}

export async function serveStdio({ createAdapter, createDecisionProvider, input = process.stdin, output = process.stdout, limits }) {
  const host = new ProviderHost({ createAdapter, createDecisionProvider, limits });
  const decoder = new StringDecoder('utf8'); let buffer = '';
  let resolveDone;
  const done = new Promise(resolve => { resolveDone = resolve; });
  host.on('message', message => {
    const line = `${JSON.stringify(message)}\n`;
    if (Buffer.byteLength(line) > HOST_LIMITS.lineBytes * 2 || output.writableLength > HOST_LIMITS.lineBytes * 16) { void host.close(); return; }
    output.write(line);
  });
  host.once('closed', () => { input.pause(); input.removeListener('data', read); input.destroy(); resolveDone(); });
  function read(chunk) {
    buffer += decoder.write(chunk);
    for (;;) {
      const newline = buffer.indexOf('\n');
      if (newline === -1) break;
      const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
      if (Buffer.byteLength(line) > HOST_LIMITS.lineBytes) { void host.close(); return; }
      let request;
      try { request = JSON.parse(line); } catch { void host.close(); return; }
      void host.handle(request);
    }
    if (Buffer.byteLength(buffer) > HOST_LIMITS.lineBytes) void host.close();
  }
  input.on('data', read); input.once('end', () => { void host.close(); });
  input.once('error', () => { void host.close(); }); output.once('error', () => { void host.close(); });
  const stop = () => { void host.close(); };
  process.once('SIGTERM', stop); process.once('SIGINT', stop);
  await done;
  process.removeListener('SIGTERM', stop); process.removeListener('SIGINT', stop);
}
