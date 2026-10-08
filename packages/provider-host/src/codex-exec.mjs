// Ask AI over `codex exec --json`: one confined Codex process per turn, prompt on stdin,
// JSONL events on stdout. Chosen over `codex app-server` because exec is Codex's documented
// non-interactive surface, it is the only Codex entry point with --ignore-user-config (so the
// user's own sign-in can be used without their config.toml, MCP servers or hooks), its flags
// are validated by the client itself (clap + --strict-config), and a process per turn gives a
// strictly bounded lifecycle. The protocol we read is the small documented core:
// thread.started, item.completed{agent_message}, turn.completed, turn.failed. Anything else,
// including new event types, new fields and the non-fatal `error` (reconnect) events, is ignored.
//
// Exec answers arrive as whole messages (no token streaming). Exec keeps no state between
// turns (--ephemeral), so the adapter carries a short, bounded transcript of this session in
// the next prompt instead; nothing is written to the user's Codex history.
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { defaultProviderContinuationIdentity } from '../vendor/t3/identity.ts';
import { JsonLineTransport } from './transport.mjs';
import { exactKeys, id, object, prompt, ProviderError, requireValue } from './validation.mjs';

export const CODEX_TRANSCRIPT_BYTES = 24 * 1024;
const CHUNK = 16 * 1024;
// Item types that mean the model used a tool. With the checked argv Codex offers none; seeing
// one anyway stops the turn rather than trusting it.
const TOOL_ITEMS = new Set(['command_execution', 'file_change', 'mcp_tool_call', 'web_search', 'collab_tool_call',
  'dynamic_tool_call', 'image_generation', 'image_view']);

function failureReason(message) {
  const text = typeof message === 'string' ? message.slice(0, 2000) : '';
  if (/usage limit|rate.?limit|too many requests|\b429\b|quota/iu.test(text)) return 'RATE_LIMITED';
  if (/\b401\b|\b403\b|unauthori[sz]ed|not logged in|log ?in|sign ?in|authenticat|refresh token/iu.test(text)) return 'PROVIDER_AUTH';
  return 'PROVIDER_ERROR';
}

/** Pure and tolerant: one parsed `codex exec --json` line → what Ask AI needs from it. */
export function readCodexExecEvent(message) {
  if (!object(message) || typeof message.type !== 'string') return { kind: 'ignore' };
  if (message.type === 'thread.started') return { kind: 'thread', thread_id: typeof message.thread_id === 'string' ? message.thread_id : null };
  if (message.type === 'turn.completed') return { kind: 'completed' };
  if (message.type === 'turn.failed') return { kind: 'failed', reason: failureReason(message.error?.message) };
  if (message.type === 'item.started' || message.type === 'item.updated' || message.type === 'item.completed') {
    const item = message.item;
    if (!object(item) || typeof item.type !== 'string') return { kind: 'ignore' };
    if (item.type === 'agent_message' && message.type === 'item.completed' && typeof item.text === 'string') return { kind: 'text', text: item.text };
    if (TOOL_ITEMS.has(item.type)) return { kind: 'tool', item_type: item.type };
  }
  return { kind: 'ignore' };
}

/** Adds one finished turn and drops the oldest turns until the transcript fits `limit` bytes. */
export function appendTranscript(history, user, assistant, limit = CODEX_TRANSCRIPT_BYTES) {
  const next = [...history, { user, assistant }];
  while (next.length && Buffer.byteLength(JSON.stringify(next)) > limit) next.shift();
  return next;
}

/** The prompt for the next turn: earlier turns of this session as context, newest last. */
export function composeCodexPrompt(history, text) {
  if (!history.length) return text;
  const earlier = history.map(turn => `User: ${turn.user}\n\nAssistant: ${turn.assistant}`).join('\n\n');
  return `Earlier in this conversation (context only, oldest first):\n\n${earlier}\n\nNew question:\n${text}`;
}

export class CodexExecAdapter extends EventEmitter {
  #plan; #binding; #active = null; #uncertain = false; #closed = false; #transport = null;
  #history = []; #answer = ''; #cancel = false; #finished = null;
  /** `plan.spawn()` starts one confined `codex exec` process (live.mjs / checks.mjs). */
  constructor(plan, { instance_id, account_identity, session_id, fixture = false }) {
    super();
    for (const [name, value] of Object.entries({ instance_id, account_identity, session_id })) id(value, name);
    this.#plan = plan; this.driver = 'codex'; this.fixture = fixture; this.native_session_id = null;
    this.#binding = Object.freeze({ driver: 'codex', instance_id, account_identity, session_id,
      continuation_key: defaultProviderContinuationIdentity({ driverKind: 'codex', instanceId: instance_id }).continuationKey });
    this.capabilities = Object.freeze({ stream: true, interrupt: true, continuation: false, approval: 'unsupported',
      automatic_browser_control: false, shell: false, filesystem: false, live_verified: false });
  }
  get binding() { return this.#binding; }
  get active() { return this.#active && { ...this.#active }; }
  get pid() { return this.#transport?.child.pid ?? null; }
  /** Sanitized stderr tail of the latest turn (fixed parsing in checks.mjs; never shown raw). */
  get diagnostic() { return this.#transport?.diagnostic ?? ''; }
  /** Resolves with the latest turn's terminal event (checks.mjs). */
  get finished() { return this.#finished; }
  #event(type, fields = {}) {
    const event = { version: 1, event_id: randomUUID(), label: this.fixture ? 'TEST_FIXTURE' : 'EXPERIMENTAL_LIVE', driver: 'codex',
      ...this.#binding, request_id: this.#active?.request_id ?? null, turn_id: this.#active?.turn_id ?? null, type, ...fields };
    this.emit('event', Object.freeze(event)); return event;
  }
  async connect() {
    requireValue(!this.#closed, 'PIPE_CLOSED', 'Session closed');
    return this.#event('connected', { status: 'accepted', native_session_id: null });
  }
  async start(input) {
    exactKeys(input, ['version', 'request_id', 'session_id', 'turn_id', 'instance_id', 'account_identity', 'text']);
    requireValue(input.version === 1, 'INVALID_INPUT', 'Unsupported provider schema version');
    for (const field of ['request_id', 'session_id', 'turn_id', 'instance_id', 'account_identity']) id(input[field], field);
    for (const field of ['session_id', 'instance_id', 'account_identity']) requireValue(input[field] === this.#binding[field], 'INSTANCE_MISMATCH', 'Session cannot migrate to another instance/account');
    requireValue(!this.#active && !this.#uncertain && !this.#closed, 'SESSION_BUSY', 'Session is busy, uncertain, or closed');
    prompt(input.text);
    const active = { request_id: input.request_id, turn_id: input.turn_id, native_turn_id: null, text: input.text };
    this.#active = active; this.#answer = ''; this.#cancel = false;
    let resolveFinished; this.#finished = new Promise(resolve => { resolveFinished = resolve; }); active.resolve = resolveFinished;
    let child;
    try { child = this.#plan.spawn(); }
    catch { this.#terminal(active, 'failed', 'SPAWN_FAILED'); throw new ProviderError('BLOCKED_ENV', 'Codex could not start in the browser sandbox'); }
    const transport = new JsonLineTransport(child, { timeoutMs: 15000 });
    this.#transport = transport;
    transport.on('message', message => { try { this.#receive(active, message); } catch { this.#terminal(active, 'uncertain', 'INVALID_PROTOCOL'); void transport.close(); } });
    transport.on('terminated', () => (this.#cancel ? this.#terminal(active, 'cancelled') : this.#terminal(active, 'uncertain', 'PROCESS_EXIT')));
    child.stdin.end(composeCodexPrompt(this.#history, input.text));
    return { version: 1, request_id: input.request_id, session_id: input.session_id, turn_id: input.turn_id, status: 'accepted' };
  }
  #receive(active, message) {
    if (this.#active !== active) return;
    const event = readCodexExecEvent(message);
    if (event.kind === 'thread') { active.native_turn_id = event.thread_id; this.native_session_id = event.thread_id; }
    else if (event.kind === 'text') {
      const text = this.#answer ? `\n\n${event.text}` : event.text;
      this.#answer += text;
      for (let offset = 0; offset < text.length; offset += CHUNK) this.#event('text_delta', { text: text.slice(offset, offset + CHUNK) });
    } else if (event.kind === 'tool') {
      this.#terminal(active, 'failed', 'PROVIDER_TOOLS_ENABLED'); void this.#transport?.close();
    } else if (event.kind === 'completed') {
      this.#remember(active.text, this.#answer);
      this.#terminal(active, this.#cancel ? 'cancelled' : 'completed');
    } else if (event.kind === 'failed') this.#terminal(active, this.#cancel ? 'cancelled' : 'failed', event.reason);
  }
  #remember(user, assistant) { this.#history = appendTranscript(this.#history, user, assistant); }
  #terminal(active, status, reason) {
    if (this.#active !== active) return;
    if (status === 'uncertain') this.#uncertain = true;
    const event = this.#event('turn_finished', { status, ...(reason ? { reason } : {}) });
    this.#active = null; active.resolve?.(event);
  }
  async interrupt({ session_id, turn_id }) {
    requireValue(session_id === this.#binding.session_id && turn_id === this.#active?.turn_id, 'INSTANCE_MISMATCH', 'Cancellation target mismatch');
    this.#cancel = true;
    // The broker turns SIGTERM into a bounded stop of the whole owned process group.
    this.#transport?.child.kill('SIGTERM');
    return { version: 1, session_id, turn_id, status: 'accepted' };
  }
  async resume(binding) {
    for (const field of ['instance_id', 'account_identity', 'session_id']) requireValue(binding[field] === this.#binding[field], 'INSTANCE_MISMATCH', 'Continuation belongs to the original instance/account');
    return { status: 'unsupported' };
  }
  async close() {
    this.#closed = true;
    if (this.#transport) await this.#transport.close();
  }
}
