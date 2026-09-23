import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdirSync, mkdtempSync, writeFileSync, symlinkSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { launchSandboxProbe, sandboxArtifacts, offlineProfile } from '../src/sandbox.mjs';
import { providerBuildRoot } from '../src/storage.mjs';

function prepare() {
  const base = path.join(providerBuildRoot(), 'sandbox-runs'); mkdirSync(base, { recursive: true, mode: 0o700 });
  const root = mkdtempSync(path.join(base, 'native-proof-'));
  for (const name of ['workspace', 'outside', 'outside/.codex', 'outside/.claude']) mkdirSync(path.join(root, name), { recursive: true, mode: 0o700 });
  writeFileSync(path.join(root, 'workspace/input.txt'), 'synthetic allowed input');
  writeFileSync(path.join(root, 'outside/secret.txt'), 'synthetic forbidden input');
  writeFileSync(path.join(root, 'outside/.codex/config.toml'), 'hook = "synthetic-only"');
  writeFileSync(path.join(root, 'outside/.claude/settings.json'), '{"hooks":{"synthetic":"fixture-only"}}');
  writeFileSync(path.join(root, 'outside/.mcp.json'), '{"mcpServers":{"synthetic":{"command":"/bin/sh"}}}');
  writeFileSync(path.join(root, 'outside/AGENTS.md'), 'SYNTHETIC TEST: outside configuration must never load.');
  symlinkSync(path.join(root, 'outside/secret.txt'), path.join(root, 'workspace/escape.txt'));
  return root;
}
async function collect(child) {
  let stdout = '', stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; }); child.stderr.on('data', chunk => { stderr += chunk; });
  return new Promise((resolve, reject) => { child.on('error', reject); child.on('close', code => resolve({ code, stdout, stderr })); });
}
async function firstRecord(child) {
  return new Promise((resolve, reject) => {
    let buffer = ''; const timer = setTimeout(() => finish(new Error('Native sandbox fixture did not start')), 3000);
    const onData = chunk => { buffer += chunk; if (buffer.includes('\n')) { try { finish(null, JSON.parse(buffer.split('\n')[0])); } catch (error) { finish(error); } } };
    const onClose = code => finish(new Error(`Native sandbox fixture exited early: ${code}`));
    function finish(error, value) { clearTimeout(timer); child.stdout.off('data', onData); child.off('close', onClose); error ? reject(error) : resolve(value); }
    child.stdout.on('data', onData); child.once('close', onClose);
  });
}
async function assertGone(pid) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { process.kill(pid, 0); } catch (error) { if (error.code === 'ESRCH') return; throw error; }
    await delay(20);
  }
  assert.fail(`Owned PID ${pid} remained after cleanup`);
}

test('Native sandbox blocks external files, symlink escape, hooks/MCP config, shell, fork, and loopback networking', async t => {
  const runDirectory = prepare(); let connections = 0;
  const server = createServer(socket => { connections++; socket.end(); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const baseline = await collect(spawn(sandboxArtifacts()['sandbox-probe'], ['probe', path.join(runDirectory, 'workspace'), path.join(runDirectory, 'outside'), String(port)], { shell: false, env: { PATH: '/usr/bin:/bin' }, stdio: ['ignore', 'pipe', 'pipe'] }));
    assert.equal(baseline.code, 0); const unconfined = JSON.parse(baseline.stdout.trim());
    for (const field of ['allowed_read', 'allowed_write', 'outside_read', 'outside_write', 'symlink_read', 'codex_config', 'claude_hooks', 'mcp_config', 'instructions', 'shell', 'fork', 'network']) assert.equal(unconfined[field], 0, `Baseline must establish ${field} is possible`);
    assert.equal(connections, 1);
    rmSync(path.join(runDirectory, 'workspace/hook-marker.txt'));
    rmSync(path.join(runDirectory, 'outside/should-not-exist.txt'));
    const owned = launchSandboxProbe({ runDirectory, loopbackPort: port }); const confined = await owned.exit;
    assert.equal(confined.code, 0, confined.stderr); const result = JSON.parse(confined.stdout.trim());
    assert.equal(result.label, 'TEST_FIXTURE'); assert.equal(result.allowed_read, 0); assert.equal(result.allowed_write, 0);
    for (const field of ['outside_read', 'outside_write', 'symlink_read', 'codex_config', 'claude_hooks', 'mcp_config', 'instructions', 'shell', 'fork', 'network']) assert([1, 13].includes(result[field]), `${field} should be denied by macOS, got ${result[field]}`);
    assert.equal(result.lifetime_fd_hidden, true); assert.equal(connections, 1);
    assert.equal(existsSync(path.join(runDirectory, 'workspace/hook-marker.txt')), false);
    assert.equal(existsSync(path.join(runDirectory, 'outside/should-not-exist.txt')), false);
    await assertGone(result.pid); await assertGone(confined.broker_pid);
    t.diagnostic(JSON.stringify({ baseline: unconfined, confined: result, policy: confined.policy }));
  } finally { server.close(); rmSync(runDirectory, { recursive: true }); }
});

for (const trigger of ['cancel', 'deadline']) test(`Native supervisor reaps a SIGTERM-ignoring sandboxed process after ${trigger}`, async t => {
  const runDirectory = prepare(); let owned;
  try {
    owned = launchSandboxProbe({ runDirectory, mode: 'hold', deadlineMs: trigger === 'deadline' ? 1500 : 5000 });
    const record = await firstRecord(owned.child); assert.equal(record.lifetime_fd_hidden, true);
    const outcome = await (trigger === 'cancel' ? owned.close() : owned.exit);
    assert.equal(outcome.code, 137); assert.match(outcome.stderr, trigger === 'deadline' ? /reason=deadline/ : /reason=parent_closed/);
    await assertGone(record.pid); await assertGone(outcome.broker_pid);
    t.diagnostic(JSON.stringify({ trigger, child_pid: record.pid, broker_pid: outcome.broker_pid, code: outcome.code, no_orphans: true }));
  } finally { if (owned) await owned.close(); rmSync(runDirectory, { recursive: true }); }
});

test('Parent disappearance closes private liveness pipe and native supervisor reaps the remaining child', async t => {
  const runDirectory = prepare();
  try {
    const runner = spawn(process.execPath, [fileURLToPath(new URL('../fixtures/sandbox-parent-exit.mjs', import.meta.url)), runDirectory], {
      shell: false, env: { PATH: process.env.PATH, AXIOSOZO_BUILD_ROOT: process.env.AXIOSOZO_BUILD_ROOT ?? '/Volumes/AxioSozoBuild' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    const output = await collect(runner); assert.equal(output.code, 0, output.stderr);
    const record = JSON.parse(output.stdout.trim()); await assertGone(record.child_pid); await assertGone(record.broker_pid);
    t.diagnostic(JSON.stringify({ ...record, parent_exit: true, no_orphans: true }));
  } finally { rmSync(runDirectory, { recursive: true }); }
});

test('Sandbox broker rejects arbitrary scope and policy injection', () => {
  assert.throws(() => offlineProfile('/bad\npath', '/scope'), { code: 'INVALID_INPUT' });
  assert.throws(() => launchSandboxProbe({ runDirectory: process.cwd(), mode: 'shell' }), { code: 'INVALID_INPUT' });
  assert.throws(() => launchSandboxProbe({ runDirectory: process.cwd() }), { code: 'INVALID_INPUT' });
});
