import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ProviderHost, serveStdio } from '../src/host.mjs';
import { createFixtureAdapter } from '../src/adapters.mjs';

const open = { version: 1, id: 'open', method: 'session/open', params: { driver: 'codex', instance_id: 'instance-a', session_id: 'session-a' } };
const start = { version: 1, id: 'start', method: 'turn/start', params: { session_id: 'session-a', turn_id: 'turn-a', text: 'hello' } };
const wait = (host, predicate) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { host.off('message', listener); reject(new Error('Host timed out')); }, 3000);
  function listener(message) { if (predicate(message)) { clearTimeout(timer); host.off('message', listener); resolve(message); } }
  host.on('message', listener);
});

test('Host opens lazily, streams actual child protocol, binds identity and closes owned child', async () => {
  let launches = 0, adapter;
  const host = new ProviderHost({ createAdapter: async (...args) => { launches++; adapter = await createFixtureAdapter(...args); return adapter; } });
  const messages = []; host.on('message', message => messages.push(message));
  try {
    assert.equal(launches, 0);
    await host.handle(open); assert.equal(launches, 1);
    const completed = wait(host, m => m.event?.type === 'turn_finished');
    await host.handle(start); assert.equal((await completed).event.status, 'completed');
    assert.equal(messages.find(m => m.id === 'start').result.status, 'accepted');
    assert.equal(messages.filter(m => m.event?.type === 'text_delta').map(m => m.event.text).join(''), 'hello');
    assert(messages.filter(m => m.event).every(m => m.event.session_id === 'session-a'));
    await host.handle({ ...start, id: 'wrong-session', params: { ...start.params, session_id: 'session-b' } });
    assert.equal(messages.at(-1).error.code, 'INSTANCE_MISMATCH');
    await host.handle(start); assert.equal(messages.at(-1).error.code, 'DUPLICATE_REQUEST');
  } finally { await host.close(); }
  assert.throws(() => process.kill(adapter.pid, 0), /ESRCH/);
});

test('Host cancels a pending turn and remains responsive while a request is running', async () => {
  const host = new ProviderHost({ createAdapter: (driver, binding) => createFixtureAdapter(driver, binding, { behavior: 'hold' }) });
  try {
    await host.handle(open);
    const delta = wait(host, m => m.event?.type === 'text_delta'); await host.handle(start); await delta;
    const terminal = wait(host, m => m.event?.type === 'turn_finished');
    await host.handle({ version: 1, id: 'cancel', method: 'turn/cancel', params: { session_id: 'session-a', turn_id: 'turn-a' } });
    assert.equal((await terminal).event.status, 'cancelled');
  } finally { await host.close(); }
});

test('Host deadline kills and reaps a held provider without reporting completed', async () => {
  let adapter;
  const host = new ProviderHost({ createAdapter: async (driver, binding) => adapter = await createFixtureAdapter(driver, binding, { behavior: 'hold' }), limits: { turnMs: 80 } });
  try {
    await host.handle(open); const terminal = wait(host, m => m.event?.type === 'turn_finished');
    await host.handle(start); assert.equal((await terminal).event.status, 'uncertain');
    await host.close(); assert.throws(() => process.kill(adapter.pid, 0), /ESRCH/);
  } finally { await host.close(); }
});

test('Unknown fields cannot grant shell, executable, cwd, environment or credentials', async () => {
  let launches = 0;
  const host = new ProviderHost({ createAdapter: () => { launches++; } });
  const messages = []; host.on('message', message => messages.push(message));
  try {
    for (const field of ['executable', 'cwd', 'env', 'token', 'account_identity']) {
      await host.handle({ ...open, id: field, params: { ...open.params, [field]: 'untrusted' } });
      assert.equal(messages.at(-1).error.code, 'INVALID_INPUT');
    }
    assert.equal(launches, 0);
  } finally { await host.close(); }
});

test('Malformed/oversized JSONL and EOF close host without starting clients', async () => {
  for (const bytes of ['{bad}\n', 'x'.repeat(73729), '']) {
    let launches = 0; const input = new PassThrough(), output = new PassThrough();
    const serving = serveStdio({ input, output, createAdapter: () => { launches++; } });
    input.end(bytes); await serving; assert.equal(launches, 0);
  }
});

test('Closing browser during provider startup reaps the newly connected child', async () => {
  let resolveStart, adapter;
  const gate = new Promise(resolve => { resolveStart = resolve; });
  const host = new ProviderHost({ createAdapter: async (driver, binding) => {
    adapter = await createFixtureAdapter(driver, binding); await gate; return adapter;
  } });
  const opening = host.handle(open);
  const closing = host.close(); resolveStart(); await opening; await closing;
  assert.throws(() => process.kill(adapter.pid, 0), /ESRCH/);
});

test('Actual stdio host exits cleanly at idle even when browser stdin remains open', async () => {
  const child = spawn(process.execPath, [fileURLToPath(new URL('../fixtures/host-peer.mjs', import.meta.url)), '--idle-test'],
    { env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe', 'pipe', 'pipe'], shell: false });
  child.stdin.on('error', () => {}); child.stderr.resume(); let data = '';
  child.stdout.on('data', bytes => { data += bytes; });
  const timer = setTimeout(() => child.kill('SIGKILL'), 3000);
  try {
    const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
    assert.equal(code, 0); assert.equal(JSON.parse(data.trim()).event.type, 'host_idle');
  } finally { clearTimeout(timer); if (child.exitCode === null) child.kill('SIGKILL'); }
});
