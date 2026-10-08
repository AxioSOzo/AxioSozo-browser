// TEST FIXTURE: a stand-in for `codex exec --json` (never a real client). Reads the prompt on
// stdin and prints JSONL events like Codex 0.162, plus unknown events/fields a newer Codex
// might add. Mode is argv[2].
const mode = process.argv[2] ?? 'ok';
const out = value => process.stdout.write(`${typeof value === 'string' ? value : JSON.stringify(value)}\n`);
let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  out({ type: 'thread.started', thread_id: '01a11d40-1b57-7ae3-be20-88aba51e566a' });
  out({ type: 'item.completed', item: { id: 'item_0', type: 'error', message: 'Failed to read global AGENTS.md instructions: Operation not permitted' } });
  out({ type: 'axiosozo.future_event', payload: { anything: true } });
  out({ type: 'turn.started', future_field: 1 });
  out({ type: 'error', message: 'Reconnecting... 2/5 (stream disconnected)' });
  if (mode === 'hold') { setInterval(() => {}, 1000); return; }
  if (mode === 'exit') process.exit(1);
  if (mode === 'malformed') { out('not json'); setInterval(() => {}, 1000); return; }
  if (mode === 'tool') { out({ type: 'item.started', item: { id: 'item_1', type: 'command_execution', command: 'ls', status: 'in_progress' } }); setInterval(() => {}, 1000); return; }
  if (mode === 'rate') { out({ type: 'turn.failed', error: { message: "You've hit your usage limit. Try again later." } }); process.exit(1); }
  if (mode === 'auth') { out({ type: 'turn.failed', error: { message: 'unexpected status 401 Unauthorized' } }); process.exit(1); }
  out({ type: 'item.started', item: { id: 'item_r', type: 'reasoning', text: '' } });
  const text = mode === 'echo' ? input : mode === 'two' ? 'first' : 'hello';
  out({ type: 'item.completed', item: { id: 'item_2', type: 'agent_message', text, future_field: { nested: true } } });
  if (mode === 'two') out({ type: 'item.completed', item: { id: 'item_3', type: 'agent_message', text: 'second' } });
  out({ type: 'turn.completed', usage: { input_tokens: 1, output_tokens: 1, future_tokens: 3 } });
});
