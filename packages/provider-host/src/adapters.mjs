import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { defaultProviderContinuationIdentity } from '../vendor/t3/identity.ts';
import { JsonLineTransport } from './transport.mjs';
import { DRIVERS, routes, discover } from './discovery.mjs';
import { ProviderError, requireValue, object, id, prompt, matchesSchema, exactKeys } from './validation.mjs';

const schema = JSON.parse(readFileSync(new URL('../schemas/codex-0.155.1.json', import.meta.url), 'utf8'));
function textChunk(value) {
  requireValue(typeof value === 'string' && Buffer.byteLength(value) <= 65536, 'INVALID_PROTOCOL', 'Invalid streamed text');
  return value;
}
export function codexRequest(method, params) {
  const request = { id: 1, method, params };
  requireValue(matchesSchema(request, schema.definitions.ClientRequest, schema), 'INVALID_PROTOCOL', 'Request does not match installed Codex 0.155.1 schema');
  return { method, params };
}

// This is a provider protocol adapter, never an authorization service. Trusted
// coordinator assigns every browser/session/turn ID; model text stays data.
export class ProviderAdapter extends EventEmitter {
  #transport; #binding; #seen = new Set(); #active = null; #uncertain = false; #closed = false;
  constructor(driver, transport, { instance_id, account_identity, session_id, fixture = false }) {
    super(); requireValue(DRIVERS.includes(driver), 'UNSUPPORTED', 'Unknown provider driver');
    for (const [name, value] of Object.entries({ instance_id, account_identity, session_id })) id(value, name);
    this.driver = driver; this.fixture = fixture; this.native_session_id = null; this.#transport = transport;
    this.#binding = Object.freeze({ driver, instance_id, account_identity, session_id,
      continuation_key: defaultProviderContinuationIdentity({ driverKind: driver, instanceId: instance_id }).continuationKey });
    this.capabilities = Object.freeze({ stream: true, interrupt: true, continuation: driver === 'codex',
      approval: driver === 'codex' ? 'deny-only' : 'unsupported', automatic_browser_control: false,
      shell: false, filesystem: false, live_verified: false });
    transport.on('message', message => { try { this.#receive(message); } catch { this.#terminal('uncertain', 'INVALID_PROTOCOL'); void transport.close(); } });
    transport.on('terminated', () => { if (this.#active) this.#terminal('uncertain', 'PROCESS_EXIT'); });
  }
  get binding() { return this.#binding; }
  get active() { return this.#active && { ...this.#active }; }
  get pid() { return this.#transport.child.pid; }
  #event(type, fields = {}) {
    const event = { version: 1, event_id: randomUUID(), label: this.fixture ? 'TEST_FIXTURE' : 'EXPERIMENTAL_LIVE', driver: this.driver,
      ...this.#binding, request_id: this.#active?.request_id ?? null, turn_id: this.#active?.turn_id ?? null, type, ...fields };
    this.emit('event', Object.freeze(event)); return event;
  }
  async connect() {
    requireValue(!this.#closed, 'PIPE_CLOSED', 'Session closed');
    if (this.driver === 'codex') {
      const init = codexRequest('initialize', { clientInfo: { name: 'axiosozo_dev', version: '0.1.0', title: 'AxioSozo development' } });
      await this.#transport.request(init.method, init.params);
      this.#transport.send({ method: 'initialized', params: {} });
      const start = codexRequest('thread/start', { ephemeral: true, approvalPolicy: 'untrusted', sandbox: 'read-only' });
      const result = await this.#transport.request(start.method, start.params, { mutating: true });
      this.native_session_id = id(result?.thread?.id, 'native_session_id');
    }
    return this.#event('connected', { status: 'accepted', native_session_id: this.native_session_id });
  }
  async start(input) {
    exactKeys(input, ['version', 'request_id', 'session_id', 'turn_id', 'instance_id', 'account_identity', 'text']);
    requireValue(input.version === 1, 'INVALID_INPUT', 'Unsupported provider schema version');
    for (const field of ['request_id', 'session_id', 'turn_id', 'instance_id', 'account_identity']) id(input[field], field);
    for (const field of ['session_id', 'instance_id', 'account_identity']) requireValue(input[field] === this.#binding[field], 'INSTANCE_MISMATCH', 'Session cannot migrate to another instance/account');
    requireValue(!this.#active && !this.#uncertain && !this.#closed, 'SESSION_BUSY', 'Session is busy, uncertain, or closed');
    prompt(input.text); this.#active = { request_id: input.request_id, turn_id: input.turn_id, native_turn_id: null };
    try {
      if (this.driver === 'codex') {
        const message = codexRequest('turn/start', { threadId: this.native_session_id, input: [{ type: 'text', text: input.text, text_elements: [] }] });
        const result = await this.#transport.request(message.method, message.params, { mutating: true });
        if (this.#active) this.#active.native_turn_id = id(result?.turn?.id, 'native_turn_id');
      } else if (this.driver === 'claude-code') {
        this.#transport.send({ type: 'user', message: { role: 'user', content: input.text }, session_id: this.native_session_id ?? '', parent_tool_use_id: null });
      } else {
        this.#transport.send({ event: 'user', message: { content: input.text } });
      }
      return { version: 1, request_id: input.request_id, session_id: input.session_id, turn_id: input.turn_id, status: 'accepted' };
    } catch (error) { this.#terminal(error.code === 'UNCERTAIN' ? 'uncertain' : 'failed', error.code); throw error; }
  }
  #bindNative(nativeId) {
    id(nativeId, 'native_session_id');
    requireValue(!this.native_session_id || this.native_session_id === nativeId, 'INSTANCE_MISMATCH', 'Provider changed native session identity');
    this.native_session_id = nativeId;
  }
  #terminal(status, reason) {
    if (!this.#active) return;
    if (status === 'uncertain') this.#uncertain = true;
    this.#event('turn_finished', { status, ...(reason ? { reason } : {}) }); this.#active = null;
  }
  #receive(message) {
    // Only deduplicate real source event IDs. Repeated text chunks are valid.
    const eventId = message.uuid ?? message.event_id;
    if (eventId !== undefined) {
      id(eventId, 'event_id'); if (this.#seen.has(eventId)) return;
      requireValue(this.#seen.size < 10000, 'EVENT_LIMIT', 'Session event limit reached'); this.#seen.add(eventId);
    }
    if (this.driver === 'codex') {
      if (message.id !== undefined && message.method) {
        this.#event('approval', { status: 'unsupported', reason: 'BROWSER_MODE_DENIES_PROVIDER_TOOLS', native_request_id: message.id });
        if (['item/commandExecution/requestApproval', 'item/fileChange/requestApproval'].includes(message.method)) this.#transport.send({ id: message.id, result: { decision: 'decline' } });
        else this.#transport.send({ id: message.id, error: { code: -32601, message: 'Unsupported in browser mode' } });
        return;
      }
      const p = message.params;
      requireValue(typeof message.method === 'string' && object(p), 'INVALID_PROTOCOL', 'Invalid Codex notification');
      if (p.threadId !== undefined) this.#bindNative(p.threadId);
      if (message.method === 'turn/started' && this.#active) this.#active.native_turn_id = id(p.turn?.id, 'native_turn_id');
      if (p.turnId !== undefined && this.#active?.native_turn_id) requireValue(p.turnId === this.#active.native_turn_id, 'INVALID_PROTOCOL', 'Native turn mismatch');
      if (message.method === 'item/agentMessage/delta' && this.#active) {
        requireValue(p.threadId === this.native_session_id && p.turnId === this.#active.native_turn_id, 'INVALID_PROTOCOL', 'Unbound streamed text');
        this.#event('text_delta', { text: textChunk(p.delta) });
      }
      if (message.method === 'turn/completed') {
        requireValue(p.threadId === this.native_session_id && p.turn?.id === this.#active?.native_turn_id, 'INVALID_PROTOCOL', 'Terminal turn mismatch');
        const statuses = { completed: 'completed', interrupted: 'cancelled', failed: 'failed' };
        this.#terminal(statuses[p.turn?.status] ?? 'uncertain');
      }
    } else if (this.driver === 'claude-code') {
      if (message.session_id) this.#bindNative(message.session_id);
      if (message.type === 'stream_event' && message.event?.type === 'content_block_delta' && message.event.delta?.type === 'text_delta' && this.#active) {
        requireValue(message.session_id === this.native_session_id, 'INVALID_PROTOCOL', 'Unbound Claude text');
        this.#event('text_delta', { text: textChunk(message.event.delta.text) });
      }
      if (message.type === 'control_request') {
        this.#event('approval', { status: 'unsupported', reason: 'BROWSER_MODE_DENIES_PROVIDER_TOOLS' });
        this.#transport.send({ type: 'control_response', response: { subtype: 'error', request_id: message.request_id, error: 'Provider tools unavailable in browser mode' } });
      }
      if (message.type === 'result') {
        requireValue(message.session_id === this.native_session_id && typeof message.is_error === 'boolean' && typeof message.subtype === 'string', 'INVALID_PROTOCOL', 'Unbound Claude result');
        this.#terminal(message.subtype === 'success' && !message.is_error ? 'completed' : 'failed');
      }
    } else {
      const p = message.event === 'step_update' ? message.step_update : message.event === 'result' ? message.result : message;
      requireValue(object(p), 'INVALID_PROTOCOL', 'Invalid Antigravity event');
      if (p.conversation_id) this.#bindNative(p.conversation_id);
      if (message.event === 'step_update' && p.step_type === 'agent_response' && typeof p.text_delta === 'string' && this.#active) {
        requireValue(p.conversation_id === this.native_session_id, 'INVALID_PROTOCOL', 'Unbound Antigravity text');
        this.#event('text_delta', { text: textChunk(p.text_delta) });
      }
      if (message.event === 'step_update' && p.step_type === 'tool') this.#event('unsupported', { reason: 'AGY_TOOLS_CANNOT_BE_AUTHORIZED_BY_STREAM_OBSERVATION' });
      if (message.event === 'result') {
        requireValue(p.conversation_id === this.native_session_id, 'INVALID_PROTOCOL', 'Unbound Antigravity result');
        this.#terminal(({ SUCCESS: 'completed', CANCELED: 'cancelled', INTERRUPTED: 'cancelled', ERROR: 'failed', INVALID: 'failed' })[p.status] ?? 'uncertain');
      }
    }
  }
  async interrupt({ session_id, turn_id }) {
    requireValue(session_id === this.#binding.session_id && turn_id === this.#active?.turn_id, 'INSTANCE_MISMATCH', 'Cancellation target mismatch');
    if (this.driver === 'codex') {
      const message = codexRequest('turn/interrupt', { threadId: this.native_session_id, turnId: this.#active.native_turn_id });
      await this.#transport.request(message.method, message.params);
    } else this.#transport.child.kill('SIGINT');
    // Confirmation is the terminal event; SIGINT delivery is not completion.
    return { version: 1, session_id, turn_id, status: 'accepted' };
  }
  async resume(binding) {
    for (const field of ['instance_id', 'account_identity', 'session_id']) requireValue(binding[field] === this.#binding[field], 'INSTANCE_MISMATCH', 'Continuation belongs to the original instance/account');
    requireValue(!this.#active && !this.#uncertain && !this.#closed && !this.#transport.closed, 'UNCERTAIN', 'Reconnect requires reconciliation; mutating turns are never replayed');
    if (!this.capabilities.continuation) return { status: 'unsupported' };
    const message = codexRequest('thread/resume', { threadId: this.native_session_id });
    const result = await this.#transport.request(message.method, message.params, { mutating: true });
    this.#bindNative(result?.thread?.id);
    return { status: 'accepted', native_session_id: this.native_session_id };
  }
  async close() { this.#closed = true; return this.#transport.close(); }
}

export async function createFixtureAdapter(driver, binding, options = {}) {
  requireValue(DRIVERS.includes(driver), 'UNSUPPORTED', 'Unknown provider');
  const peer = fileURLToPath(new URL('../fixtures/peer.mjs', import.meta.url));
  const child = spawn(process.execPath, [peer, driver, options.behavior ?? 'normal'], {
    cwd: fileURLToPath(new URL('../fixtures/', import.meta.url)), shell: false,
    env: { PATH: '/usr/bin:/bin', LANG: 'en_US.UTF-8' }, stdio: ['pipe', 'pipe', 'pipe'],
  });
  const adapter = new ProviderAdapter(driver, new JsonLineTransport(child, options), { ...binding, fixture: true });
  try { await adapter.connect(); return adapter; } catch (error) { await adapter.close(); throw error; }
}

export function livePreflight(driver, { authorized = false, authenticated = false, searchPath } = {}) {
  requireValue(DRIVERS.includes(driver), 'UNSUPPORTED', 'Unknown provider');
  const metadata = discover({ searchPath }).find(item => item.driver === driver);
  const version = `${metadata.version_status}: installed ${metadata.client_version ?? 'unknown'}, pinned fixture ${routes[driver].pinned_version ?? 'unknown'}; actual client protocol UNTESTED`;
  const failure = (code, message) => Object.assign(new ProviderError(code, `${version}. ${message}`), {
    version_status: metadata.version_status, client_version: metadata.client_version,
    fixture_version: routes[driver].pinned_version, protocol_status: 'UNTESTED',
  });
  if (!authorized || !authenticated) throw failure('BLOCKED_AUTH', 'Separate live-test authorization and verified official-client authentication are required; no client was launched');
  if (!metadata.installed) throw failure('BLOCKED_ENV', 'CLIENT_NOT_INSTALLED; no client was launched');
  if (metadata.version_status !== 'PINNED_METADATA_MATCH') throw failure('BLOCKED_ENV', 'Exact client version has not been audited against the pinned protocol; no client was launched');
  // This release intentionally has no live process launcher: disabling tools
  // in a prompt or observing approval events cannot sandbox hooks and MCP.
  throw failure('BLOCKED_ENV', `Live ${routes[driver].protocol} requires a proven actual-client OS process boundary; no client was launched`);
}
