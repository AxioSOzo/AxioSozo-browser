import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdirSync, mkdtempSync, writeFileSync, symlinkSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { liveBroker, liveProfile } from '../src/live.mjs';
import { sandboxArtifacts } from '../src/sandbox.mjs';
import { providerBuildRoot } from '../src/storage.mjs';

for (const helperPolicy of [false, true]) test(`Actual live profile denies outside content/configuration/shell with helpers ${helperPolicy ? 'allowed' : 'denied'}`, async t => {
  const directory = mkdtempSync(path.join(providerBuildRoot(), 'live-policy-fixture-'));
  const workspace = path.join(directory, 'workspace'), outside = path.join(directory, 'outside');
  for (const suffix of ['workspace', 'outside', 'outside/.codex', 'outside/.claude']) mkdirSync(path.join(directory, suffix), { recursive: true, mode: 0o700 });
  writeFileSync(path.join(workspace, 'input.txt'), 'fixture');
  for (const suffix of ['secret.txt', '.codex/config.toml', '.claude/settings.json', '.mcp.json', 'AGENTS.md']) writeFileSync(path.join(outside, suffix), 'fixture');
  symlinkSync(path.join(outside, 'secret.txt'), path.join(workspace, 'escape.txt'));
  let connections = 0;
  const server = createServer(socket => { connections++; socket.end(); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const executable = sandboxArtifacts()['sandbox-probe'];
    const profile = liveProfile({ executable, runDirectory: workspace, ...(helperPolicy ? { officialHome: directory } : {}) });
    const child = spawn(liveBroker(), ['3000', profile, executable, 'probe', workspace, outside, String(server.address().port)],
      { cwd: workspace, shell: false, env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe', 'pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = ''; child.stdout.on('data', bytes => { stdout += bytes; }); child.stderr.on('data', bytes => { stderr += bytes; });
    const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
    assert.equal(code, 0, stderr);
    const result = JSON.parse(stdout.trim());
    assert.equal(result.allowed_read, 0); assert.equal(result.allowed_write, 0); assert.equal(result.network, 0); assert.equal(connections, 1);
    for (const key of ['outside_read', 'outside_write', 'symlink_read', 'codex_config', 'claude_hooks', 'mcp_config', 'instructions', 'shell']) assert([1, 13].includes(result[key]), `${key}: ${result[key]}`);
    if (helperPolicy) assert.equal(result.fork, 0); else assert([1, 13].includes(result.fork));
    assert.equal(existsSync(path.join(workspace, 'hook-marker.txt')), false);
    assert.equal(existsSync(path.join(outside, 'should-not-exist.txt')), false);
    // sandbox-exec/macOS may reuse descriptor 3 for another system socket when
    // networking is admitted. The dedicated identity test below checks that it
    // is not the supervisor's private liveness socket.
    assert.throws(() => process.kill(result.pid, 0), /ESRCH/); assert.throws(() => process.kill(child.pid, 0), /ESRCH/);
    t.diagnostic(JSON.stringify({ ...result, label: 'TEST_FIXTURE', actual_provider_started: false }));
  } finally { server.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('Live runtime never inherits the supervisors private liveness socket even if fd 3 is reused', async () => {
  const directory = mkdtempSync(path.join(providerBuildRoot(), 'liveness-fixture-'));
  let child;
  try {
    const executable = sandboxArtifacts()['sandbox-probe'];
    child = spawn(liveBroker(), ['5000', liveProfile({ executable, runDirectory: directory }), executable, 'hold'],
      { cwd: directory, shell: false, env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe', 'pipe', 'pipe', 'pipe'] });
    child.stderr.resume();
    const exited = new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
    const record = await new Promise((resolve, reject) => {
      let data = ''; child.stdout.on('data', bytes => { data += bytes; if (data.includes('\n')) resolve(JSON.parse(data.split('\n')[0])); });
      child.once('close', () => reject(new Error('Fixture exited before descriptor inspection')));
    });
    const socketName = pid => {
      const result = spawnSync('/usr/sbin/lsof', ['-a', '-p', String(pid), '-d', '3', '-F', 'ftn'], { encoding: 'utf8', timeout: 2000 });
      assert([0, 1].includes(result.status)); return result.stdout.split('\n').find(line => line.startsWith('n')) ?? null;
    };
    const parentSocket = socketName(child.pid); assert(parentSocket);
    assert.notEqual(socketName(record.pid), parentSocket);
    child.stdio[3].end(); assert.equal(await exited, 137);
  } finally { if (child && child.exitCode === null) child.stdio[3].end(); rmSync(directory, { recursive: true, force: true }); }
});

for (const trigger of ['leader-exit', 'parent-close']) test(`Scoped helper policy reaps the exact owned process group after ${trigger}`, async t => {
  const directory = mkdtempSync(path.join(providerBuildRoot(), 'helper-tree-fixture-'));
  try {
    const executable = sandboxArtifacts()['sandbox-probe'];
    // The probe is the only fixture executable. We never execute security or
    // touch a Keychain during this test of the production helper policy.
    const profile = liveProfile({ executable, runDirectory: directory, officialHome: directory, network: false });
    const child = spawn(liveBroker(), ['3000', profile, executable, 'tree', executable, trigger === 'leader-exit' ? 'exit' : 'hold'],
      { cwd: directory, shell: false, env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe', 'pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = ''; const records = [];
    child.stdout.on('data', bytes => {
      stdout += bytes;
      while (stdout.includes('\n')) { const split = stdout.indexOf('\n'); records.push(JSON.parse(stdout.slice(0, split))); stdout = stdout.slice(split + 1); }
      if (trigger === 'parent-close' && records.some(record => record.helper_pid)) child.stdio[3].end();
    });
    child.stderr.on('data', bytes => { stderr += bytes; });
    const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
    assert.equal(code, trigger === 'leader-exit' ? 0 : 137, stderr);
    const leader = records.find(record => record.helper_pid); assert(leader);
    for (const pid of [leader.pid, leader.helper_pid, child.pid]) {
      let gone = false;
      for (let attempt = 0; attempt < 100; attempt++) { try { process.kill(pid, 0); } catch (error) { if (error.code === 'ESRCH') { gone = true; break; } throw error; } await delay(20); }
      assert(gone, `Owned process ${pid} remained`);
    }
    t.diagnostic(JSON.stringify({ trigger, leader_pid: leader.pid, helper_pid: leader.helper_pid, no_orphans: true, actual_provider_started: false }));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
