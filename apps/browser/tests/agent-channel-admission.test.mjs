import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../../../packages/contexts/src/index.mjs';
import { createNativeAgentChannelConfiguration, agentSocketPaths, AGENT_SOCKET_SHA256 } from '../chrome/AgentChannelConfig.sys.mjs';
import { createAgentChannelService } from '../chrome/AgentChannelService.sys.mjs';

const refused = error => error.code === 'EXACT_SOCKET_METADATA_UNAVAILABLE';
const flush = async () => { for (let i = 0; i < 80; i++) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
class Clock {
  at = 0; id = 0; jobs = new Map();
  setTimeout = (fn, ms) => { const id = ++this.id; this.jobs.set(id, { fn, at: this.at + ms }); return id; };
  clearTimeout = id => this.jobs.delete(id);
  async tick(ms) {
    const end = this.at + ms;
    for (;;) {
      const next = [...this.jobs].filter(([, job]) => job.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.at = next[1].at; this.jobs.delete(next[0]); next[1].fn(); await flush();
    }
    this.at = end; await flush();
  }
}
const ROOT = '/Volumes/AxioSozoBuild/workstation', PROFILE = ROOT + '/p4c-test/gecko', PATHS = agentSocketPaths(ROOT);
const options = () => ({ command: PATHS.interpreter, arguments: ['-I', '-S', '-B', PATHS.helperPath, 'uid', '{}'],
  environment: { LANG: 'C', LC_ALL: 'C', PYTHONNOUSERSITE: '1', PYTHONDONTWRITEBYTECODE: '1' },
  environmentAppend: false, stderr: 'ignore', workdir: '/' });
function fakeChild({ stderr = [] } = {}) {
  const closed = []; let kills = 0, waits = 0, read = false;
  return { closed, get kills() { return kills; }, get waits() { return waits; },
    stdin: { async close(force) { closed.push(['stdin', force]); } },
    stdout: { async readString() { if (read) return ''; read = true; return '{"ok":true,"result":501}\n'; }, async close(force) { closed.push(['stdout', force]); } },
    stderr: { async read() { return (stderr.shift() ?? new Uint8Array()).buffer; }, async close(force) { closed.push(['stderr', force]); } },
    async wait() { waits++; return { exitCode: 0 }; }, async kill(signal) { assert.equal(signal, 0); kills++; } };
}
function fixture() {
  const clock = new Clock(), calls = [], files = new Map();
  for (const [path, kind, mode, inode] of [[PATHS.interpreter, 'regular', 0o755, '1'], [PATHS.helperPath, 'regular', 0o400, '2'],
    [PATHS.helperDirectory, 'directory', 0o700, '3'], [PROFILE, 'directory', 0o700, '4']])
    files.set(path, { kind, uid: 501, nlink: kind === 'directory' ? 2 : 1, mode, size: 100, device: '7', inode });
  const runtime = { timers: clock, env: () => ROOT, profileDirectory: () => PROFILE, ownUid: async () => 501,
    verifyFile: async path => files.has(path), exactMetadata: async path => ({ ...files.get(path) }),
    sha256: async () => AGENT_SOCKET_SHA256,
    Subprocess: { async call(value) { calls.push(value); return fakeChild(); } } };
  let guarded;
  const createBackend = value => { guarded = value.Subprocess; return { exactAvailable: true }; };
  return { runtime, createBackend, files, calls, clock, get guarded() { return guarded; } };
}

test('assembled guard re-verifies every helper dispatch and admits only fixed argv/environment', async () => {
  const f = fixture(); await createNativeAgentChannelConfiguration(f);
  const child = await f.guarded.call(options()); await child.wait(); await flush();
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].stderr, 'pipe');
  assert.deepEqual(f.calls[0].arguments, options().arguments);
  for (const mutate of [v => v.command = '/usr/bin/python3', v => v.arguments[2] = '-c', v => v.arguments[3] = '/untrusted/helper.py',
    v => v.arguments[4] = 'exec', v => v.arguments.push('extra'), v => v.arguments[5] = 'x'.repeat(16385),
    v => v.environmentAppend = true, v => v.environment.PATH = '/untrusted', v => v.environment.LANG = 'en',
    v => v.workdir = ROOT, v => v.stderr = 'pipe']) {
    const value = options(); mutate(value); await assert.rejects(f.guarded.call(value), refused);
  }
  assert.equal(f.calls.length, 1); assert.equal(f.clock.jobs.size, 0);
});

test('assembled guard refuses installation changed after factory admission without a second spawn', async () => {
  for (const [path, field, value] of [[PATHS.helperPath, 'nlink', 2], [PATHS.helperPath, 'uid', 0], [PATHS.helperDirectory, 'mode', 0o755],
    [PATHS.interpreter, 'mode', 0o644], [PROFILE, 'mode', 0o755]]) {
    const f = fixture(); await createNativeAgentChannelConfiguration(f); f.files.get(path)[field] = value;
    await assert.rejects(f.guarded.call(options()), refused); assert.equal(f.calls.length, 0); assert.equal(f.clock.jobs.size, 0);
  }
});

test('assembled guard reconstructs immutable dispatch after caller mutates options during proof', async () => {
  const f = fixture(); await createNativeAgentChannelConfiguration(f); const proof = deferred();
  f.runtime.sha256 = () => proof.promise;
  const value = options(), pending = f.guarded.call(value); await flush();
  value.command = '/untrusted/python'; value.arguments[3] = '/untrusted/helper'; value.arguments[5] = 'different';
  value.environment.PATH = '/untrusted'; value.environment.LANG = 'different';
  proof.resolve(AGENT_SOCKET_SHA256); const child = await pending; await child.wait(); await flush();
  assert.deepEqual(f.calls[0], { ...options(), stderr: 'pipe' }); assert.equal(f.clock.jobs.size, 0);
});

test('assembled guard owns late-spawned child cleanup and never publishes its handle after expiry', async () => {
  const f = fixture(); await createNativeAgentChannelConfiguration(f); const spawn = deferred();
  f.runtime.Subprocess.call = () => spawn.promise;
  const pending = f.guarded.call(options()), rejected = assert.rejects(pending, refused); await flush(); await f.clock.tick(3000); await rejected;
  const child = fakeChild(); spawn.resolve(child); await flush();
  assert.equal(child.kills, 1); assert.equal(child.waits, 1);
  assert.deepEqual(child.closed, [['stdin', true], ['stdout', true], ['stderr', true]]); assert.equal(f.clock.jobs.size, 0);
});

test('assembled helper lifetime stderr refuses 513 raw bytes privately and closes the exact child', async () => {
  const f = fixture(); await createNativeAgentChannelConfiguration(f);
  const child = fakeChild({ stderr: [new Uint8Array([0xe2]), new Uint8Array(512)] });
  f.runtime.Subprocess.call = async () => child;
  const owned = await f.guarded.call(options()); await flush(); await assert.rejects(owned.wait(), refused); await flush();
  assert.equal(child.kills, 1); assert.equal(child.closed.filter(([, force]) => force === true).length, 3);
  assert.equal(f.clock.jobs.size, 0);
});

test('assembled contexts public exports require exact binding and agree with product bridge argv', () => {
  assert.equal(typeof core.hookConfig, 'function'); assert.equal(typeof core.bridgeConfig, 'function');
  assert.throws(() => core.hookConfig({ agent: 'codex', notifyPath: '/owned/notify' }), e => e.code === 'INVALID_INPUT' && e.path === '$.socketPath');
  const socketPath = PROFILE + '/.a/s';
  const hook = JSON.parse(core.hookConfig({ agent: 'claude-code', notifyPath: '/owned/notify', socketPath }));
  const bridge = JSON.parse(core.bridgeConfig({ agent: 'claude-code', nodePath: '/owned/node', bridgePath: '/owned/bridge', socketPath }));
  assert.equal(hook.hooks.Stop[0].hooks[0].args[0], 'AXIOSOZO_AGENT_SOCKET=' + socketPath);
  assert.equal(bridge.mcpServers.axiosozo.args.at(-1), socketPath); assert.equal(bridge.mcpServers.axiosozo.env.AXIOSOZO_AGENT_SOCKET, socketPath);
});

test('assembled service uses public pure hook export with only its currently listening native binding', async () => {
  const clock = new Clock(); let socketPath = PROFILE + '/.a/s';
  const service = createAgentChannelService({ loadProjects: () => [], validateProject: core.validateProject,
    validateStatusRecord: core.validateStatusRecord, parseHookEvent: core.parseHookEvent, now: () => clock.at,
    randomHex: () => '0123456789abcdef', isSensitiveHost: core.isSensitiveHost, timers: clock,
    createNativeConfiguration: async () => ({ socketPath, exactPosixBackend: {} }),
    createTransportRuntime: () => ({ file: path => ({ path }), openConnection() {}, paths: {
      async prepare(path) { const lock = { held: true, lost: new Promise(() => {}), async release() { this.held = false; } }; return { path, lock }; },
      async verifyBound(claim) { return claim; }, async cleanup(claim) { await claim.lock.release(); return false; } },
      createServerSocket: () => ({ initWithFilename(_file, mode) { assert.equal(mode, 0o600); }, asyncListen() {}, close() {} }) }),
    buildHookConfig: ({ agent, socketPath: current }) => core.hookConfig({ agent, notifyPath: '/owned/notify', socketPath: current }) });
  await service.initialize(); await assert.rejects(service.getHookConfig('codex'), e => e.code === 'ENDPOINT_UNAVAILABLE');
  await service.setEnabled(true); const first = await service.getHookConfig('claude-code');
  assert.equal(JSON.parse(first).hooks.Stop[0].hooks[0].args[0], 'AXIOSOZO_AGENT_SOCKET=' + socketPath);
  await service.setEnabled(false); await assert.rejects(service.getHookConfig('codex'), e => e.code === 'ENDPOINT_UNAVAILABLE');
  socketPath = ROOT + '/p4c-second/gecko/.a/s'; await service.setEnabled(true);
  const second = await service.getHookConfig('claude-code'); assert.notEqual(second, first);
  assert.equal(JSON.parse(second).hooks.Stop[0].hooks[0].args[0], 'AXIOSOZO_AGENT_SOCKET=' + socketPath);
  await service.close(); assert.equal(clock.jobs.size, 0);
});
