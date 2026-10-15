// TEST FIXTURES ONLY: fixtures/codex-exec/fake-codex.mjs stands in for `codex exec --json`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CodexExecAdapter, appendTranscript, composeCodexPrompt, readCodexExecEvent, CODEX_TRANSCRIPT_BYTES } from '../src/codex-exec.mjs';

const fake = fileURLToPath(new URL('../fixtures/codex-exec/fake-codex.mjs', import.meta.url));
const binding = { instance_id: 'instance-a', account_identity: 'account-a', session_id: 'session-a' };
function adapter(modes) {
  const queue = [...modes]; const spawned = [];
  const plan = { spawn: () => {
    const child = spawn(process.execPath, [fake, queue.shift() ?? 'ok'], { env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe', 'pipe', 'pipe'] });
    spawned.push(child); return child;
  } };
  return { instance: new CodexExecAdapter(plan, binding), spawned };
}
let sequence = 0;
async function turn(instance, text = 'Question?') {
  const events = []; const turnId = `turn-${++sequence}`;
  const done = new Promise(resolve => instance.on('event', function listener(event) {
    if (event.turn_id !== turnId) return;
    events.push(event); if (event.type === 'turn_finished') { instance.off('event', listener); resolve(event); }
  }));
  const accepted = await instance.start({ version: 1, ...binding, request_id: `request-${turnId}`, turn_id: turnId, text });
  assert.equal(accepted.status, 'accepted');
  return { turnId, events, done };
}
const text = events => events.filter(event => event.type === 'text_delta').map(event => event.text).join('');

test('reader keeps only the documented core and ignores everything else', () => {
  assert.deepEqual(readCodexExecEvent({ type: 'thread.started', thread_id: 't' }), { kind: 'thread', thread_id: 't' });
  assert.deepEqual(readCodexExecEvent({ type: 'item.completed', item: { type: 'agent_message', text: 'hi', extra: 1 } }), { kind: 'text', text: 'hi' });
  assert.deepEqual(readCodexExecEvent({ type: 'turn.completed', usage: {} }), { kind: 'completed' });
  for (const ignored of [{ type: 'error', message: 'Reconnecting... 1/5' }, { type: 'turn.started' }, { type: 'axiosozo.future' }, { type: 'item.completed', item: { type: 'error', message: 'x' } },
    { type: 'item.updated', item: { type: 'agent_message', text: 'partial' } }, { type: 'item.completed', item: { type: 'reasoning', text: 'x' } }, {}, null, [], { type: 7 }]) {
    assert.deepEqual(readCodexExecEvent(ignored), { kind: 'ignore' }, JSON.stringify(ignored));
  }
  assert.deepEqual(readCodexExecEvent({ type: 'item.started', item: { type: 'command_execution' } }), { kind: 'tool', item_type: 'command_execution' });
  assert.deepEqual(readCodexExecEvent({ type: 'turn.failed', error: { message: 'usage limit reached' } }), { kind: 'failed', reason: 'RATE_LIMITED' });
  assert.deepEqual(readCodexExecEvent({ type: 'turn.failed', error: { message: '401 Unauthorized' } }), { kind: 'failed', reason: 'PROVIDER_AUTH' });
  assert.deepEqual(readCodexExecEvent({ type: 'turn.failed' }), { kind: 'failed', reason: 'PROVIDER_ERROR' });
});

test('a turn streams the agent message, completes, and later turns carry a bounded transcript', async () => {
  const { instance } = adapter(['ok', 'echo']);
  try {
    assert.equal((await instance.connect()).type, 'connected');
    const first = await turn(instance, 'First question');
    assert.equal((await first.done).status, 'completed'); assert.equal(text(first.events), 'hello');
    assert(first.events.every(event => event.label === 'EXPERIMENTAL_LIVE' && event.session_id === 'session-a' && event.driver === 'codex'));
    const second = await turn(instance, 'Second question');
    assert.equal((await second.done).status, 'completed');
    const prompt = text(second.events);
    assert.match(prompt, /^Earlier in this conversation/u); assert.match(prompt, /User: First question\n\nAssistant: hello/u);
    assert.match(prompt, /New question:\nSecond question$/u);
    assert.equal(instance.capabilities.continuation, false); assert.deepEqual(await instance.resume(binding), { status: 'unsupported' });
  } finally { await instance.close(); }
  assert.equal(composeCodexPrompt([], 'alone'), 'alone');
  let history = [];
  for (let index = 0; index < 50; index++) history = appendTranscript(history, `q${index}`, 'a'.repeat(2000));
  assert(Buffer.byteLength(JSON.stringify(history)) <= CODEX_TRANSCRIPT_BYTES);
  assert.equal(history.at(-1).user, 'q49', 'the newest turn is kept'); assert(history.length < 50, 'the oldest turns are dropped');
  assert.deepEqual(appendTranscript([], 'q', 'x'.repeat(CODEX_TRANSCRIPT_BYTES)), [], 'a single oversized turn is not carried');
});

test('several agent messages are joined; unknown events and fields never break a turn', async () => {
  const { instance } = adapter(['two']);
  try { const one = await turn(instance); assert.equal((await one.done).status, 'completed'); assert.equal(text(one.events), 'first\n\nsecond'); }
  finally { await instance.close(); }
});

for (const [mode, status, reason] of [['rate', 'failed', 'RATE_LIMITED'], ['auth', 'failed', 'PROVIDER_AUTH'], ['exit', 'uncertain', 'PROCESS_EXIT'],
  ['tool', 'failed', 'PROVIDER_TOOLS_ENABLED'], ['malformed', 'uncertain', 'MALFORMED_MESSAGE']]) {
  test(`${mode}: the turn ends ${status} (${reason}) with a fixed reason and the process is reaped`, async () => {
    const { instance, spawned } = adapter([mode]);
    try {
      const one = await turn(instance); const finished = await one.done;
      assert.equal(finished.status, status);
      if (mode !== 'malformed') assert.equal(finished.reason, reason); else assert.match(finished.reason, /PROCESS_EXIT|INVALID_PROTOCOL|MALFORMED_MESSAGE/u);
      if (status === 'uncertain') await assert.rejects(turn(instance), { code: 'SESSION_BUSY' }, 'uncertain sessions are not reused');
    } finally { await instance.close(); }
    await new Promise(resolve => setTimeout(resolve, 50));
    assert(spawned.every(child => child.exitCode !== null || child.signalCode !== null), 'owned process reaped');
  });
}

test('Stop ends the running turn as cancelled; the next turn starts a fresh process', async () => {
  const { instance, spawned } = adapter(['hold', 'ok']);
  try {
    const one = await turn(instance);
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.equal((await instance.interrupt({ session_id: 'session-a', turn_id: one.turnId })).status, 'accepted');
    const cancelled = await one.done; assert.equal(cancelled.status, 'cancelled'); assert.equal(cancelled.reason, undefined);
    const two = await turn(instance); assert.equal((await two.done).status, 'completed');
    assert.equal(spawned.length, 2);
    await assert.rejects(instance.interrupt({ session_id: 'session-a', turn_id: 'not-running' }), { code: 'INSTANCE_MISMATCH' });
  } finally { await instance.close(); }
});

test('binding, busy and migration rules match the other adapters', async () => {
  const { instance } = adapter(['hold']);
  try {
    await assert.rejects(instance.start({ version: 1, ...binding, instance_id: 'other', request_id: 'r', turn_id: 't', text: 'x' }), { code: 'INSTANCE_MISMATCH' });
    await assert.rejects(instance.start({ version: 1, ...binding, request_id: 'r', turn_id: 't', text: '' }), { code: 'INVALID_INPUT' });
    await assert.rejects(instance.start({ version: 1, ...binding, request_id: 'r', turn_id: 't', text: 'x', extra: 1 }), { code: 'INVALID_INPUT' });
    const one = await turn(instance);
    await assert.rejects(turn(instance), { code: 'SESSION_BUSY' });
    await instance.interrupt({ session_id: 'session-a', turn_id: one.turnId }); await one.done;
  } finally { await instance.close(); }
});
