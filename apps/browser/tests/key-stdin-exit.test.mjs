// Injected raw Gecko pipes only. No native processes, keys, provider or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runKeyFixtureMetadata, KEY_METADATA_ID } from '../chrome/KeyFixtureNativeConfig.sys.mjs';
import { decisionKeyPresence, removeDecisionKey, storeDecisionKey } from '../chrome/ProviderKeys.sys.mjs';
const EOF = 0xff7a0001; // Pinned Gecko SubprocessConstants.ERROR_END_OF_FILE.
const tick = async () => { for (let i = 0; i < 4; i++) await new Promise(setImmediate); };
const code = expected => error => error.code === expected && error.message === expected;
const nativeError = errorCode => Object.assign(new Error('invented native pipe error'), { errorCode });
function fixture({ exitCode = 0, closeCode = EOF, writeFailure = false, readFailure = false,
  pausedOutput = false, waitPending = false, waitFailure = false } = {}) {
  const events = [], timers = new Map(), waiting = [];
  let serial = 0, released = !pausedOutput, stopped = false, resolveWait;
  const exit = waitPending ? new Promise(resolve => { resolveWait = resolve; }) : Promise.resolve({ exitCode });
  const pipe = name => {
    let sent = false;
    return {
      async read() {
        events.push(name + '.read');
        if (readFailure && name === 'stdout') throw nativeError(123);
        if (!released && !stopped) await new Promise(resolve => waiting.push(resolve));
        if (!sent && name === 'stdout') { sent = true; return new TextEncoder().encode('501\n').buffer; }
        return new ArrayBuffer(0);
      },
      async close(force) { events.push(name + '.close:' + force); while (waiting.length) waiting.shift()(); },
    };
  };
  const child = {
    stdout: pipe('stdout'), stderr: pipe('stderr'),
    stdin: {
      async write(value) { events.push('stdin.write'); assert.equal(value, 'synthetic-key-12345'); if (writeFailure) throw nativeError(EOF); },
      async close(force) { events.push('stdin.close:' + force); throw nativeError(closeCode); },
    },
    async wait() { events.push('wait'); if (waitFailure) throw nativeError(321); return exit; },
    async kill() { events.push('kill'); stopped = true; while (waiting.length) waiting.shift()(); resolveWait?.({ exitCode: -9 }); },
  };
  const runtime = {
    outputPipeMode: 'raw',
    env: name => name === 'AXIOSOZO_BUILD_ROOT' ? '/Volumes/AxioSozoBuild/workstation' : '',
    verifyHelper: async () => true,
    spawn: async () => { events.push('spawn'); return child; },
    timers: {
      setTimeout(fn, ms) { const id = ++serial; timers.set(id, { fn, ms }); return id; },
      clearTimeout(id) { timers.delete(id); },
    },
  };
  return { runtime, events, timers,
    release() { released = true; while (waiting.length) waiting.shift()(); },
    fire(ms) { const timer = [...timers.values()].find(item => item.ms === ms); assert(timer); timer.fn(); },
  };
}
function run(kind, f, extra = {}) {
  if (kind === 'metadata') return runKeyFixtureMetadata(f.runtime, KEY_METADATA_ID, ['-u'], extra);
  const options = { runtime: f.runtime, prefs: { getBoolPref: () => true }, ...extra };
  if (kind === 'store') return storeDecisionKey('openai', 'synthetic-key-12345', options);
  if (kind === 'remove') return removeDecisionKey('openai', options);
  return decisionKeyPresence('openai', options);
}
function cleaned(f) {
  for (const name of ['stdin', 'stdout', 'stderr']) assert(f.events.includes(name + '.close:true'));
  assert(f.events.includes('kill')); assert(f.events.filter(value => value === 'wait').length >= 2);
  assert.equal(f.timers.size, 0);
}
for (const kind of ['metadata', 'presence', 'store', 'remove']) {
  test(`${kind}: native stdin EOF after exit does not override valid output and wait`, async () => {
    const f = fixture({ pausedOutput: true }); let settled = false;
    const pending = run(kind, f); pending.then(() => { settled = true; }, () => { settled = true; });
    await tick(); assert.equal(settled, false, 'stdin EOF alone cannot authorize completion');
    f.release(); const result = await pending;
    assert.equal(result, kind === 'metadata' ? '501\n' : kind === 'presence' ? 'stored' : undefined);
    assert.equal(f.events.filter(value => value === 'stdin.write').length, kind === 'store' ? 1 : 0); cleaned(f);
  });
  test(`${kind}: other stdin errors still refuse despite exit zero`, async () => {
    const f = fixture({ closeCode: 123 });
    await assert.rejects(run(kind, f), code('KEYCHAIN_HELPER_UNAVAILABLE')); cleaned(f);
  });
  test(`${kind}: stdin EOF does not accept a failed child`, async () => {
    const f = fixture({ exitCode: 1 });
    await assert.rejects(run(kind, f), code(kind === 'metadata' ? 'KEYCHAIN_HELPER_UNAVAILABLE' : 'KEYCHAIN_REFUSED')); cleaned(f);
  });
  test(`${kind}: stdin EOF cannot bypass the deadline of a child still running`, async () => {
    const f = fixture({ waitPending: true }); const pending = run(kind, f);
    // Attach the rejection handler before advancing the injected timer.
    const rejected = assert.rejects(pending, code(kind === 'metadata' ? 'KEYCHAIN_HELPER_UNAVAILABLE' : 'HELPER_TIMEOUT'));
    await tick(); f.fire(kind === 'metadata' ? 1000 : 5000); await rejected; cleaned(f);
  });
}
test('a rejected key write is never tolerated as an already closed stdin', async () => {
  const f = fixture({ writeFailure: true });
  await assert.rejects(run('store', f), code('KEYCHAIN_HELPER_UNAVAILABLE')); cleaned(f);
});
test('missing presence and removal accept exit44 only after genuine EOF', async () => {
  for (const kind of ['presence', 'remove']) {
    const f = fixture({ exitCode: 44 });
    assert.equal(await run(kind, f), kind === 'presence' ? 'missing' : undefined); cleaned(f);
  }
  const f = fixture({ exitCode: 44 }); await assert.rejects(run('store', f), code('KEYCHAIN_REFUSED')); cleaned(f);
});
test('stdin EOF never masks a raw reader or wait failure', async () => {
  for (const kind of ['metadata', 'presence']) for (const option of ['readFailure', 'waitFailure']) {
    const f = fixture({ [option]: true });
    await assert.rejects(run(kind, f), code('KEYCHAIN_HELPER_UNAVAILABLE')); cleaned(f);
  }
});
test('stdin EOF keeps abort and current surface checks authoritative', async () => {
  for (const kind of ['metadata', 'presence', 'store', 'remove']) {
    const f = fixture({ waitPending: true }); const controller = new AbortController();
    const pending = run(kind, f, { signal: controller.signal, isActive: () => true });
    const rejected = assert.rejects(pending, code(kind === 'metadata' ? 'KEYCHAIN_HELPER_UNAVAILABLE' : 'SETTINGS_CLOSED'));
    await tick(); controller.abort(); await rejected; cleaned(f);
  }
});
