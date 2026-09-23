import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JsonLineTransport } from '../src/transport.mjs';

function peer() {
  return new JsonLineTransport(spawn(process.execPath, [fileURLToPath(new URL('../fixtures/peer.mjs', import.meta.url)), 'codex'], {
    shell: false, env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe', 'pipe', 'pipe'],
  }));
}
test('Transport timeout is distinct from a possibly mutating uncertain outcome, without retries', async () => {
  for (const mutating of [false, true]) {
    const transport = peer(); let writes = 0;
    const original = transport.child.stdin.write.bind(transport.child.stdin);
    transport.child.stdin.write = (...args) => { writes++; return original(...args); };
    try {
      await assert.rejects(transport.request('fixture/no-response', {}, { mutating, timeoutMs: 40 }), { code: mutating ? 'UNCERTAIN' : 'TIMEOUT' });
      assert.equal(writes, 1); assert.equal(transport.pendingCount, 0);
    } finally { await transport.close(); }
    assert.throws(() => process.kill(transport.child.pid, 0), /ESRCH/);
  }
});
test('Transport rejects queue overload and releases all pending requests on shutdown', async () => {
  const transport = peer(); const pending = [];
  for (let index = 0; index < 32; index++) pending.push(transport.request('fixture/no-response', {}, { timeoutMs: 300 }).catch(error => error.code));
  assert.throws(() => transport.request('fixture/no-response', {}), { code: 'BACKPRESSURE' });
  await transport.close(); assert.equal((await Promise.all(pending)).length, 32); assert.equal(transport.pendingCount, 0);
});
