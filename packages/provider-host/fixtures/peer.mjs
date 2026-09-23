// TEST_FIXTURE ONLY. No provider credentials, network, filesystem tools or MCP.
import readline from 'node:readline';
const [driver, behavior = 'normal'] = process.argv.slice(2);
const native = 'fixture-native-session'; let turn = 0; let pending;
const send = message => process.stdout.write(`${JSON.stringify(message)}\n`);
const finish = cancelled => {
  if (!pending) return;
  const id = pending; pending = null;
  if (driver === 'codex') send({ method: 'turn/completed', params: { threadId: native, turn: { id, status: cancelled ? 'interrupted' : 'completed' } } });
  if (driver === 'claude-code') send({ type: 'result', uuid: `result-${id}`, subtype: cancelled ? 'error_during_execution' : 'success', is_error: cancelled, session_id: native });
  if (driver === 'antigravity') send({ event: 'result', result: { conversation_id: native, status: cancelled ? 'INTERRUPTED' : 'SUCCESS', response: 'fixture hello' } });
};
function run() {
  const id = `native-turn-${++turn}`; pending = id;
  if (driver === 'codex') send({ method: 'turn/started', params: { threadId: native, turn: { id } } });
  if (driver === 'claude-code') send({ type: 'system', subtype: 'init', session_id: native, uuid: `init-${id}` });
  if (driver === 'antigravity') send({ event: 'init', conversation_id: native, init: { tools: [], permission_mode: 'request-review' } });
  if (behavior === 'crash') { setTimeout(() => process.exit(7), 20); return id; }
  if (behavior === 'malformed') { process.stdout.write('{broken\n'); return id; }
  if (behavior === 'oversized') { process.stdout.write('x'.repeat(1100000)); return id; }
  const delta = driver === 'codex' ? { method: 'item/agentMessage/delta', params: { threadId: native, turnId: id, itemId: 'fixture-item', delta: 'hello' } }
    : driver === 'claude-code' ? { type: 'stream_event', uuid: `delta-${id}`, session_id: native, event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hello' } } }
    : { event: 'step_update', step_update: { conversation_id: native, step_index: turn, state: 'ACTIVE', step_type: 'agent_response', text_delta: 'hello' } };
  setTimeout(() => {
    send(delta);
    if (behavior === 'duplicate') send(delta);
    if (behavior === 'approval' && driver === 'codex') send({ id: 'approval-1', method: 'item/commandExecution/requestApproval', params: { threadId: native, turnId: id } });
    if (behavior !== 'hold') setTimeout(() => finish(false), 10);
  }, 10);
  return id;
}
process.on('SIGINT', () => finish(true));
process.on('SIGTERM', () => process.exit(0));
const lines = readline.createInterface({ input: process.stdin });
lines.on('line', line => {
  const m = JSON.parse(line);
  if (driver === 'codex') {
    if (m.method === 'initialize') send({ id: m.id, result: { userAgent: 'TEST_FIXTURE' } });
    if (m.method === 'thread/start') send({ id: m.id, result: { thread: { id: native } } });
    if (m.method === 'thread/resume') send({ id: m.id, result: { thread: { id: m.params.threadId } } });
    if (m.method === 'turn/start') { const id = run(); send({ id: m.id, result: { turn: { id } } }); }
    if (m.method === 'turn/interrupt') { send({ id: m.id, result: {} }); setTimeout(() => finish(true), 10); }
    if (m.id === 'approval-1' && m.result?.decision !== 'decline') process.exit(9);
  } else if (m.type === 'user' || m.event === 'user') run();
});
lines.on('close', () => process.exit(0));
