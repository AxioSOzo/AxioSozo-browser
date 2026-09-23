import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
import { PolicyBridge } from '../chrome/BrowserCoordinator.sys.mjs';

const binary = process.env.AXIOSOZO_CORE_BINARY;
const available = binary && existsSync(binary);
const timers = { setTimeout, clearTimeout };
const target = () => ({ tab_id: randomUUID(), engine: 'gecko', engine_instance: randomUUID(),
  native_target_id: '42', identity: 'http://127.0.0.1:8123', document_generation: 1,
  navigation_generation: 1, private_mode: false });

// Adapts real Node-owned pipes to the audited Firefox Subprocess API shape.
// This exercises the Rust executable and chrome channel, never a mocked policy peer.
async function connect({ now = () => performance.now() } = {}) {
  const child = spawn(binary, [], { env: { PATH: '/usr/bin:/bin', AXIOSOZO_BOOTSTRAP_MODE: 'stdin-v1' }, stdio: 'pipe' });
  const exited = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (exitCode, signal) => resolve({ exitCode, signal }));
  });
  const readPipe = stream => {
    stream.setEncoding('utf8');
    const iterator = stream[Symbol.asyncIterator]();
    return { readString: async () => { const part = await iterator.next(); return part.done ? '' : part.value; } };
  };
  const writes = [];
  const owned = {
    stdout: readPipe(child.stdout), stderr: readPipe(child.stderr),
    stdin: {
      write: data => new Promise((resolve, reject) => {
        writes.push(data);
        child.stdin.write(data, error => error ? reject(error) : resolve());
      }),
      close: () => { child.stdin.end(); return Promise.resolve(); },
    },
    wait: () => exited,
    kill: async (timeout = 300) => {
      child.kill('SIGTERM');
      const timer = setTimeout(() => child.kill('SIGKILL'), timeout);
      try { return await exited; } finally { clearTimeout(timer); }
    },
  };
  child.stdin.on('error', () => {}); // write callback/channel owns error propagation.
  const bridge = new PolicyBridge(owned, { token: randomBytes(32).toString('hex'), session: randomUUID(), timers, now });
  try { await bridge.connect(); } catch (error) { await owned.kill(); throw error; }
  return { bridge, child, owned, writes };
}

test('real coordinator registers browser-issued identity and authorizes one checked dispatch', { skip: !available }, async () => {
  const { bridge, child } = await connect();
  try {
    const current = target();
    await bridge.synchronize(current);
    let called = 0;
    const result = await bridge.execute(current, 'reload', checked => {
      assert.deepEqual(checked, current);
      called++;
      return { status: 'accepted', fixture: 'engine-dispatch-only' };
    });
    assert.equal(result.status, 'accepted');
    assert.equal(called, 1);
    await bridge.synchronize({ ...current, navigation_generation: 2 });
    await assert.rejects(bridge.execute(current, 'reload', () => called++), /TARGET_SYNC_REJECTED/);
    assert.equal(called, 1);
  } finally {
    await bridge.dispose();
    assert.notEqual(child.exitCode, undefined);
    assert.throws(() => process.kill(child.pid, 0), { code: 'ESRCH' });
  }
});

test('private targets never reach native registry and invalid generations cannot lose precision', { skip: !available }, async () => {
  const { bridge, writes } = await connect();
  try {
    const privateTarget = { ...target(), private_mode: true, identity: 'https://private-fixture.invalid' };
    await assert.rejects(bridge.synchronize(privateTarget), /PRIVATE_TARGET_EXCLUDED/);
    assert.equal(writes.join('').includes('private-fixture'), false);
    assert.throws(() => bridge.synchronize({ ...target(), navigation_generation: 2 ** 53 }), /INVALID_TARGET/);
  } finally { await bridge.dispose(); }
});

test('native exit disables channel without replay and fresh connection has independent identity', { skip: !available }, async () => {
  const { bridge, owned } = await connect();
  const current = target();
  await bridge.synchronize(current);
  await owned.kill();
  let calls = 0;
  await assert.rejects(bridge.execute(current, 'navigate', () => calls++), /COORDINATOR_UNAVAILABLE/);
  assert.equal(calls, 0);
  await bridge.dispose();
  const fresh = await connect();
  try {
    await fresh.bridge.synchronize(current);
    assert.equal(fresh.bridge.status, 'connected');
    assert.equal(calls, 0);
  } finally { await fresh.bridge.dispose(); }
});

test('a grant that expires during chrome scheduling never reaches engine dispatch', { skip: !available }, async () => {
  let clock = 0;
  const { bridge } = await connect({ now: () => { clock += 1500; return clock; } });
  try {
    let calls = 0;
    await assert.rejects(bridge.execute(target(), 'reload', () => calls++), /GRANT_EXPIRED_BEFORE_DISPATCH/);
    assert.equal(calls, 0);
  } finally { await bridge.dispose(); }
});
