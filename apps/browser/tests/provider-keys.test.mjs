// TEST FIXTURES ONLY: no subprocess, Keychain, provider clients, or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DECISION_KEY_PREFS, DECISION_KEY_LIMITS, decisionKeyEntryEnabled, validateDecisionKey,
  storeDecisionKey, removeDecisionKey, decisionKeyPresence, decisionKeyStatus } from '../chrome/ProviderKeys.sys.mjs';

const tick = async () => { for (let n = 0; n < 4; n++) await new Promise(resolve => setImmediate(resolve)); };
const prefLog = [];
const prefs = values => ({ getBoolPref: (name, fallback) => { prefLog.push([name, fallback]); return values[name] ?? fallback; } });
const enabled = prefs({ [DECISION_KEY_PREFS.jev]: true, [DECISION_KEY_PREFS.openai]: true });

function fixture({ exitCode = 0, stdout = [], stderr = [], hanging = false, spawnFailure = false,
  helperValid = true, deferredSpawn = false, writeFailure = false } = {}) {
  const calls = [], input = [], checks = [], timers = new Map(), reads = [], pipeCloses = [];
  let serial = 0, killed = 0, closed = 0, waited = 0, releaseSpawn;
  let exitResolve;
  const exit = hanging ? new Promise(resolve => { exitResolve = resolve; }) : Promise.resolve({ exitCode });
  const pipe = (values, name) => ({ close: async force => { pipeCloses.push([name, force]); while (reads.length) reads.shift()(null); }, readString: async () => {
    if (values.length) return values.shift();
    if (!hanging) return null;
    return await new Promise(resolve => reads.push(resolve));
  } });
  const child = {
    stdout: pipe([...stdout], "stdout"), stderr: pipe([...stderr], "stderr"),
    stdin: { write: async text => { input.push(text); if (writeFailure) throw new Error('synthetic-private-stdin-error'); },
      close: async force => { closed++; pipeCloses.push(["stdin", force]); } },
    kill: async () => { killed++; while (reads.length) reads.shift()(null); exitResolve?.({ exitCode: -9 }); },
    wait: () => { waited++; return exit; },
  };
  const runtime = {
    env: name => name === 'AXIOSOZO_BUILD_ROOT' ? '/Volumes/AxioSozoBuild/workstation' : 'synthetic-env-must-not-propagate',
    verifyHelper: async command => { checks.push(command); return helperValid; },
    spawn: async options => {
      calls.push(options); if (spawnFailure) throw new Error('synthetic-secret-in-spawn-error');
      if (deferredSpawn) return await new Promise(resolve => { releaseSpawn = () => resolve(child); });
      return child;
    },
    timers: { setTimeout: (fn, ms) => { const id = ++serial; timers.set(id, { fn, ms }); return id; }, clearTimeout: id => timers.delete(id) },
  };
  return { runtime, calls, input, checks, timers, pipeCloses, release: () => releaseSpawn(), killed: () => killed, closed: () => closed, waited: () => waited };
}
const code = expected => error => error.code === expected && error.message === expected;

const originalFetch = globalThis.fetch;
test.beforeEach(() => { globalThis.fetch = () => assert.fail('key helper has no network path'); });
test.afterEach(() => { globalThis.fetch = originalFetch; });

test('provider-specific prefs fail closed without a typed true value', async () => {
  prefLog.length = 0;
  for (const provider of ['jev', 'openai']) {
    assert.equal(decisionKeyEntryEnabled(provider, enabled), true);
    assert.deepEqual(prefLog.at(-1), [DECISION_KEY_PREFS[provider], false]);
    for (const preference of [prefs({}), prefs({ [DECISION_KEY_PREFS[provider]]: false }),
      prefs({ [DECISION_KEY_PREFS[provider]]: 'true' }), null, { getBoolPref: () => { throw new Error('unavailable'); } }]) {
      const f = fixture();
      await assert.rejects(storeDecisionKey(provider, 'synthetic-key-12345', { runtime: f.runtime, prefs: preference }), code('KEY_ENTRY_DISABLED'));
      assert.equal(f.calls.length + f.checks.length + f.input.length, 0);
    }
  }
});

test('unknown providers never read prefs, resolve paths, or spawn a helper', async () => {
  for (const provider of ['', '__proto__', 'constructor', 'other', null, 1, undefined]) {
    const preference = { getBoolPref: () => assert.fail('unknown provider reads no prefs') }; const f = fixture();
    assert.throws(() => decisionKeyEntryEnabled(provider, preference), code('INVALID_PROVIDER'));
    for (const operation of [() => storeDecisionKey(provider, 'synthetic-key-12345', { runtime: f.runtime, prefs: preference }),
      () => removeDecisionKey(provider, { runtime: f.runtime }), () => decisionKeyPresence(provider, { runtime: f.runtime }),
      () => decisionKeyStatus(provider, { runtime: f.runtime, prefs: preference })]) await assert.rejects(operation(), code('INVALID_PROVIDER'));
    assert.equal(f.calls.length + f.checks.length + f.input.length, 0);
  }
});

test('store sends synthetic secrets only on stdin with fixed provider selector and minimal environment', async () => {
  for (const provider of ['jev', 'openai']) {
    const f = fixture({ stdout: ['synthetic-output-secret'], stderr: ['synthetic-stderr-secret'] }); const secret = `synthetic-${provider}-key`;
    assert.equal(await storeDecisionKey(provider, secret, { runtime: f.runtime, prefs: enabled }), undefined);
    assert.deepEqual(f.calls, [{ command: '/Volumes/AxioSozoBuild/workstation/providers/keychain',
      arguments: provider === 'jev' ? ['store'] : ['store', 'openai'], environmentAppend: false,
      environment: { PATH: '/usr/bin:/bin', LANG: 'C' }, stderr: 'pipe' }]);
    assert.deepEqual(f.input, [secret]); assert(!JSON.stringify(f.calls).includes(secret));
    assert.equal(f.timers.size, 0); assert(f.closed() >= 1 && f.killed() >= 1 && f.waited() >= 1);
  }
});

test('key validation uses UTF-8 byte boundaries and rejects C0/DEL without spawning', async () => {
  for (const secret of ['é'.repeat(4), 'a'.repeat(4096), 'é'.repeat(2048)]) assert.equal(validateDecisionKey(secret), true);
  for (const secret of ['short', '', 'é'.repeat(2049), 'a'.repeat(4097), 'synthetic\nkey', 'synthetic\0key', 'synthetic\tkey', 'synthetic\x7fkey', 7, null]) {
    assert.equal(validateDecisionKey(secret), false); const f = fixture();
    await assert.rejects(storeDecisionKey('jev', secret, { runtime: f.runtime, prefs: enabled }), code('INVALID_KEY'));
    assert.equal(f.calls.length + f.input.length + f.checks.length, 0);
  }
});

test('only canonical reviewed project build roots produce the fixed helper path', async () => {
  for (const root of ['/tmp/build', '/Volumes/DevStorage/workstation', '/Volumes/AxioSozoBuild/../other',
    '/Volumes/AxioSozoBuild/workstation/../other', '/Volumes/AxioSozoBuild/workstation/nested', '/Volumes/AxioSozoBuild//workstation',
    '/Volumes/AxioSozoBuild/workstation/', '/Volumes/AxioSozoBuild/providers', '/Volumes/AxioSozoBuild/toolchains',
    '/Volumes/AxioSozoBuild/Workstation', '/Volumes/AxioSozoBuild/workstation\n', 'relative', '', null]) {
    const f = fixture(); f.runtime.env = () => root;
    await assert.rejects(decisionKeyPresence('jev', { runtime: f.runtime }), code('KEYCHAIN_HELPER_UNAVAILABLE'));
    assert.equal(f.calls.length + f.checks.length, 0);
  }
  const f = fixture(); f.runtime.env = () => '/Volumes/AxioSozoBuild';
  assert.equal(await decisionKeyPresence('jev', { runtime: f.runtime }), 'stored');
  assert.equal(f.calls[0].command, '/Volumes/AxioSozoBuild/providers/keychain');
  for (const helperValid of [false, null, 'true']) {
    const missing = fixture({ helperValid });
    await assert.rejects(removeDecisionKey('openai', { runtime: missing.runtime }), code('KEYCHAIN_HELPER_UNAVAILABLE'));
    assert.equal(missing.calls.length, 0);
  }
});

test('presence only uses exists, reports missing, and returns frozen status with no output text', async () => {
  for (const provider of ['jev', 'openai']) for (const exitCode of [0, 44]) {
    const f = fixture({ exitCode, stdout: ['synthetic-secret-never-returned'] });
    assert.equal(await decisionKeyPresence(provider, { runtime: f.runtime }), exitCode === 0 ? 'stored' : 'missing');
    assert.deepEqual(f.calls[0].arguments, provider === 'jev' ? ['exists'] : ['exists', 'openai']);
    assert.deepEqual(f.input, []);
    const status = await decisionKeyStatus(provider, { runtime: f.runtime, prefs: enabled });
    assert.deepEqual(status, { provider, key_entry_enabled: true, key: exitCode === 0 ? 'stored' : 'missing', error: null });
    assert(Object.isFrozen(status)); assert(!JSON.stringify(status).includes('synthetic-secret'));
  }
});

test('remove is permitted with missing/disabled prefs and missing items are already removed', async () => {
  for (const provider of ['jev', 'openai']) for (const exitCode of [0, 44]) {
    const f = fixture({ exitCode });
    assert.equal(await removeDecisionKey(provider, { runtime: f.runtime, prefs: prefs({}) }), undefined);
    assert.deepEqual(f.calls[0].arguments, provider === 'jev' ? ['remove'] : ['remove', 'openai']);
    assert.deepEqual(f.input, []); assert.equal(f.timers.size, 0);
  }
});

test('helper refusals and raw spawn/pipe errors become fixed codes without exposing text', async () => {
  for (const [options, expected] of [[{ exitCode: 1 }, 'KEYCHAIN_REFUSED'], [{ exitCode: 44 }, 'KEYCHAIN_REFUSED'],
    [{ spawnFailure: true }, 'KEYCHAIN_HELPER_UNAVAILABLE'], [{ writeFailure: true }, 'KEYCHAIN_HELPER_UNAVAILABLE']]) {
    const f = fixture(options);
    await assert.rejects(storeDecisionKey('jev', 'synthetic-key-12345', { runtime: f.runtime, prefs: enabled }), code(expected));
    assert.equal(f.timers.size, 0);
    if (!options.spawnFailure) assert(f.killed() >= 1 && f.closed() >= 1 && f.waited() >= 1);
  }
  const f = fixture({ spawnFailure: true });
  assert.deepEqual(await decisionKeyStatus('openai', { runtime: f.runtime, prefs: enabled }),
    { provider: 'openai', key_entry_enabled: true, key: 'unknown', error: 'KEYCHAIN_HELPER_UNAVAILABLE' });
});

test('combined helper output is byte capped, discarded, and the child is reaped', async () => {
  const f = fixture({ stdout: ['界'.repeat(3000)], stderr: ['界'.repeat(3000)] });
  await assert.rejects(decisionKeyPresence('jev', { runtime: f.runtime }), code('HELPER_OUTPUT_LIMIT'));
  assert.equal(f.timers.size, 0); assert(f.killed() >= 1 && f.waited() >= 1);
});

test('timeout kills and reaps owned helper; cancellation sends no secret after startup abort', async () => {
  const f = fixture({ hanging: true }); const pending = decisionKeyPresence('jev', { runtime: f.runtime }); await tick();
  [...f.timers.values()].find(timer => timer.ms === DECISION_KEY_LIMITS.operationMs).fn();
  await assert.rejects(pending, code('HELPER_TIMEOUT')); assert.equal(f.timers.size, 0); assert(f.killed() >= 1 && f.waited() >= 1);
  const controller = new AbortController(); const g = fixture(); const spawn = g.runtime.spawn;
  g.runtime.spawn = async options => { const child = await spawn(options); controller.abort(); return child; };
  await assert.rejects(storeDecisionKey('openai', 'synthetic-key-12345', { runtime: g.runtime, prefs: enabled, signal: controller.signal }), code('SETTINGS_CLOSED'));
  assert.deepEqual(g.input, []); assert.equal(g.timers.size, 0); assert(g.killed() >= 1 && g.waited() >= 1);
});

test('pre-abort causes no path checks or child; in-flight abort reaps helper and removes listeners', async () => {
  const first = new AbortController(); first.abort(); const f = fixture();
  await assert.rejects(removeDecisionKey('jev', { runtime: f.runtime, signal: first.signal }), code('SETTINGS_CLOSED'));
  assert.equal(f.calls.length + f.checks.length, 0);
  const second = new AbortController(); const g = fixture({ hanging: true });
  const pending = decisionKeyPresence('jev', { runtime: g.runtime, signal: second.signal }); await tick(); second.abort();
  await assert.rejects(pending, code('SETTINGS_CLOSED')); assert.equal(g.timers.size, 0);
  const before = g.killed(); second.abort(); await tick(); assert.equal(g.killed(), before);
});

test('spawn deadline is bounded and a child returned after timeout is reaped without writing secret', async () => {
  const f = fixture({ deferredSpawn: true });
  const pending = storeDecisionKey('jev', 'synthetic-key-12345', { runtime: f.runtime, prefs: enabled }); await tick();
  [...f.timers.values()].find(timer => timer.ms === DECISION_KEY_LIMITS.operationMs).fn();
  await assert.rejects(pending, code('HELPER_TIMEOUT')); assert.equal(f.timers.size, 0);
  f.release(); await tick(); assert.deepEqual(f.input, []); assert(f.killed() >= 1 && f.waited() >= 1); assert.equal(f.timers.size, 0);
});


test('native runtime initialization failures are normalized before reaching direct callers', async () => {
  const previous = globalThis.ChromeUtils;
  globalThis.ChromeUtils = { importESModule: () => { throw new Error('synthetic-private-initialization-error'); } };
  try {
    for (const operation of [() => storeDecisionKey('jev', 'synthetic-key-12345', { prefs: enabled }),
      () => removeDecisionKey('jev'), () => decisionKeyPresence('openai')])
      await assert.rejects(operation(), code('KEYCHAIN_HELPER_UNAVAILABLE'));
  } finally { if (previous === undefined) delete globalThis.ChromeUtils; else globalThis.ChromeUtils = previous; }
});

test('every cleanup action starts even when APIs fail and cleanup waiting has its own bound', async () => {
  const f = fixture(); const spawn = f.runtime.spawn; const actions = { close: 0, kill: 0, wait: 0 };
  f.runtime.spawn = async options => {
    const child = await spawn(options);
    child.stdin.close = async () => { actions.close++; throw new Error('synthetic-close-error'); };
    child.kill = async () => { actions.kill++; throw new Error('synthetic-kill-error'); };
    child.wait = () => { actions.wait++; return new Promise(() => {}); };
    return child;
  };
  let settled = false;
  const pending = removeDecisionKey('jev', { runtime: f.runtime });
  pending.then(() => { settled = true; }, () => { settled = true; });
  await tick();
  assert.equal(settled, false); assert(actions.close >= 2 && actions.kill >= 1 && actions.wait >= 2);
  [...f.timers.values()].find(timer => timer.ms === DECISION_KEY_LIMITS.cleanupMs).fn();
  await assert.rejects(pending, code('KEYCHAIN_HELPER_UNAVAILABLE'));
  assert.equal(settled, true); assert.equal(f.timers.size, 0);
});

test('late helper verification after timeout or abort cannot spawn or transmit a secret', async () => {
  for (const reason of ['timeout', 'abort']) {
    const f = fixture(); let verify;
    f.runtime.verifyHelper = async command => { f.checks.push(command); return await new Promise(resolve => { verify = resolve; }); };
    const controller = new AbortController();
    const pending = storeDecisionKey('openai', 'synthetic-key-12345', { runtime: f.runtime, prefs: enabled, signal: controller.signal });
    await tick();
    if (reason === 'abort') controller.abort(); else [...f.timers.values()].find(timer => timer.ms === DECISION_KEY_LIMITS.operationMs).fn();
    await assert.rejects(pending, code(reason === 'abort' ? 'SETTINGS_CLOSED' : 'HELPER_TIMEOUT'));
    verify(true); await tick(); assert.equal(f.calls.length + f.input.length, 0); assert.equal(f.timers.size, 0);
  }
});


test('output-cap and reader failures force-close every pipe even when killing rejects', async () => {
  for (const mode of ['limit', 'reader']) {
    const f = fixture({ stdout: mode === 'limit' ? ['界'.repeat(6000)] : [] }); const spawn = f.runtime.spawn;
    f.runtime.spawn = async options => {
      const child = await spawn(options);
      if (mode === 'reader') child.stdout.readString = async () => { throw new Error('synthetic-reader-error'); };
      child.kill = async () => { throw new Error('synthetic-kill-error'); };
      return child;
    };
    await assert.rejects(decisionKeyPresence('jev', { runtime: f.runtime }), code(mode === 'limit' ? 'HELPER_OUTPUT_LIMIT' : 'KEYCHAIN_HELPER_UNAVAILABLE'));
    for (const name of ['stdin', 'stdout', 'stderr']) assert(f.pipeCloses.some(([pipe, force]) => pipe === name && force === true));
    assert.equal(f.timers.size, 0);
  }
});
