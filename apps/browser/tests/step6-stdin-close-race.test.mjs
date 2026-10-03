// Injected fakes only: no child process, filesystem fixture, profile or provider.
import test from 'node:test';
import assert from 'node:assert/strict';
import './support/chrome-modules.mjs';
const base = new URL('../chrome/', import.meta.url);
const { runUnderstandFixtureMetadata, UNDERSTAND_METADATA_ID, UNDERSTAND_FIXTURE_LIMITS }
  = await import(new URL('NativeUnderstandFixtureRuntime.sys.mjs', base));
const { createNativeManifestAcceptIO, MANIFEST_ACCEPT_SHA256 }
  = await import(new URL('ProjectManifestAccept.sys.mjs', base));
const EOF = 0xff7a0001;
const eofError = () => Object.assign(new Error('synthetic native pipe closed'), { errorCode: EOF });
const unknown = { code: 'WRITE_CONTAINMENT_UNAVAILABLE', committed: null };
const root = '/Volumes/AxioSozoBuild/workstation/manifest-accept-fixtures/owned-test/harbor-suite';
const empty = () => ({ rootIdentity: { device: '1', inode: '2' }, directoryIdentity: null, target: null, manifest: null });
const manifest = { version: 2, name: 'Harbor Suite', kind: 'web', environments: [
  { name: 'local', app: 'web', base_url: 'http://127.0.0.1:44123/' }], services: [], surfaces: [] };
const encoder = new TextEncoder();
const raw = text => encoder.encode(text).buffer;
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const tick = async (count = 48) => { for (let i = 0; i < count; i++) await Promise.resolve(); };
const observed = promise => promise.then(value => ({ value }), error => ({ error }));
function timers() {
  const active = new Map(); let next = 0;
  return { active, setTimeout(fn, ms) { active.set(++next, { fn, ms }); return next; },
    clearTimeout(id) { active.delete(id); },
    has(ms) { return [...active.values()].some(row => row.ms === ms); },
    run(ms) { const row = [...active].find(([, value]) => value.ms === ms); assert.ok(row, `missing ${ms}ms timer`);
      active.delete(row[0]); row[1].fn(); } };
}
function pipe(events, name, chunks) {
  let index = 0;
  return { async read(...args) { assert.deepEqual(args, [], 'only zero raw bytes may signal EOF');
    events.push([`${name}.read`]); const next = index < chunks.length ? chunks[index++] : new ArrayBuffer(0);
    if (next instanceof Error) throw next; return await next; },
    readString() { throw Error('text-prefix EOF fallback is prohibited'); },
    async close(force) { events.push([`${name}.close`, force]); } };
}
function childHarness({ closeError = eofError(), writeError = null, stdout = [], stderr = [], waitResult = { exitCode: 0 }, waitPromise } = {}) {
  const events = [], timer = timers();
  const child = { stdin: {
    async write(input) { events.push(['write', input]); if (writeError) throw writeError; },
    async close(force) { events.push(['stdin.close', force]); if (force !== true && closeError) throw closeError; },
  }, stdout: pipe(events, 'stdout', stdout), stderr: pipe(events, 'stderr', stderr),
    async wait() { events.push(['wait']); return waitPromise ? await waitPromise : waitResult; },
    async kill(grace) { events.push(['kill', grace]); } };
  return { events, timer, child };
}
function metadata(options = {}) {
  const h = childHarness({ stdout: [raw('501\n')], ...options });
  h.active = true;
  h.runtime = { timers: h.timer, async spawn(opts) { h.events.push(['spawn', opts]); return h.child; } };
  h.run = (opts = {}) => runUnderstandFixtureMetadata(h.runtime, UNDERSTAND_METADATA_ID, ['-u'],
    { isActive: () => h.active, ...opts });
  return h;
}
function acceptance({ response = { ok: true, result: empty() }, stdout, ...options } = {}) {
  const h = childHarness({ stdout: stdout ?? [raw(typeof response === 'string' ? response : JSON.stringify(response))], ...options });
  h.active = true;
  h.runtime = { timers: h.timer, env: key => key === 'AXIOSOZO_BUILD_ROOT' ? '/Volumes/AxioSozoBuild/workstation' : '',
    verifyFile: async () => true, sha256: async () => MANIFEST_ACCEPT_SHA256,
    Subprocess: { async call(opts) { h.events.push(['spawn', opts]); return h.child; } } };
  h.io = createNativeManifestAcceptIO({ runtime: h.runtime });
  h.run = () => h.io.snapshot(root, { admit: () => h.active });
  return h;
}
async function expire(h, outcome, ms) {
  await tick(); h.timer.run(ms); await tick();
  if (h.timer.has(250)) { h.timer.run(250); await tick(); }
  if (h.timer.has(500)) { h.timer.run(500); await tick(); }
  return await outcome;
}
function clean(h) { assert.equal(h.timer.active.size, 0); assert.ok(h.events.some(row => row[0] === 'wait'));
  assert.ok(h.events.some(row => row[0] === 'stdout.close')); assert.ok(h.events.some(row => row[0] === 'stderr.close')); }

// These first two assertions fail against the untouched frozen inputs.
test('metadata close EOF does not mask genuine output EOF and zero owned exit', async () => {
  const h = metadata(); assert.equal(await h.run(), '501\n'); clean(h);
  assert.equal(h.events.filter(row => row[0] === 'spawn').length, 1);
  const opts = h.events.find(row => row[0] === 'spawn')[1];
  assert.equal(opts.command, '/usr/bin/id'); assert.deepEqual(opts.arguments, ['-u']);
  assert.equal(opts.environmentAppend, false); assert.deepEqual(opts.environment, { LANG: 'C', LC_ALL: 'C' });
});
test('manifest early typed refusal after successful write survives close EOF', async () => {
  const h = acceptance({ response: { ok: false, error: 'MANIFEST_CHANGED', committed: false } });
  await assert.rejects(h.run(), { code: 'MANIFEST_CHANGED', committed: false }); clean(h);
  assert.deepEqual(JSON.parse(h.events.find(row => row[0] === 'write')[1]), { root });
  assert.ok(h.events.findIndex(row => row[0] === 'write') < h.events.findIndex(row => row[0] === 'stdin.close'));
});
test('normal close success preserves metadata and manifest success', async () => {
  const a = metadata({ closeError: null }); assert.equal(await a.run(), '501\n'); clean(a);
  const b = acceptance({ closeError: null }); assert.deepEqual(await b.run(), empty()); clean(b);
});
test('numeric close EOF alone cannot replace metadata stdout EOF', async () => {
  const pending = deferred(); const h = metadata({ stdout: [raw('501\n'), pending.promise] });
  const outcome = observed(h.run()); const done = await expire(h, outcome, UNDERSTAND_FIXTURE_LIMITS.metadataMs);
  assert.equal(done.error?.code, 'UNDERSTAND_FIXTURE_UNAVAILABLE'); assert.equal(done.value, undefined); clean(h);
  pending.resolve(new ArrayBuffer(0)); await tick();
});
test('numeric close EOF alone cannot replace metadata stderr EOF', async () => {
  const pending = deferred(); const h = metadata({ stderr: [pending.promise] });
  const done = await expire(h, observed(h.run()), 1000);
  assert.equal(done.error?.code, 'UNDERSTAND_FIXTURE_UNAVAILABLE'); clean(h);
  pending.resolve(new ArrayBuffer(0)); await tick();
});
test('numeric close EOF alone cannot replace actual metadata wait', async () => {
  const wait = deferred(); const h = metadata({ waitPromise: wait.promise });
  const done = await expire(h, observed(h.run()), 1000);
  assert.equal(done.error?.code, 'UNDERSTAND_FIXTURE_UNAVAILABLE'); clean(h);
  wait.resolve({ exitCode: 0 }); await tick();
});
test('metadata nonzero or malformed wait remains unavailable despite close EOF', async () => {
  for (const waitResult of [{ exitCode: 1 }, { exitCode: '0' }, {}, null]) {
    const h = metadata({ waitResult }); await assert.rejects(h.run(), { code: 'UNDERSTAND_FIXTURE_UNAVAILABLE' }); clean(h);
  }
});
test('metadata close accepts only numeric native errorCode and hides other errors', async () => {
  for (const closeError of [Object.assign(Error('synthetic detail'), { errorCode: EOF + 1 }),
    Object.assign(Error('synthetic detail'), { errorCode: String(EOF) }),
    Object.assign(Error('synthetic detail'), { code: EOF }), Error('synthetic detail')]) {
    const h = metadata({ closeError }); await assert.rejects(h.run(), error => {
      assert.equal(error.code, 'UNDERSTAND_FIXTURE_UNAVAILABLE'); assert.equal(error.message, error.code); return true;
    }); clean(h);
  }
});
test('metadata authority revocation before actual wait completion discards output', async () => {
  const wait = deferred(); const h = metadata({ waitPromise: wait.promise });
  const outcome = observed(h.run()); await tick(); h.active = false; wait.resolve({ exitCode: 0 });
  assert.equal((await outcome).error?.code, 'UNDERSTAND_FIXTURE_UNAVAILABLE'); clean(h);
});
test('metadata already revoked authority performs zero child work', async () => {
  const h = metadata(); h.active = false;
  await assert.rejects(h.run(), { code: 'UNDERSTAND_FIXTURE_UNAVAILABLE' }); assert.deepEqual(h.events, []);
});
test('metadata real read EOF error is not a close exception', async () => {
  const h = metadata({ stdout: [eofError()] });
  await assert.rejects(h.run(), { code: 'UNDERSTAND_FIXTURE_UNAVAILABLE' }); clean(h);
});
test('metadata byte and invalid UTF-8 gates survive close EOF', async () => {
  for (const stdout of [[raw('x'.repeat(4097))], [new Uint8Array([0xe2]).buffer]]) {
    const h = metadata({ stdout }); await assert.rejects(h.run(), { code: 'UNDERSTAND_FIXTURE_UNAVAILABLE' }); clean(h);
  }
});
test('hanging metadata close retains deadline and owned cleanup', async () => {
  const close = deferred(); const h = metadata();
  h.child.stdin.close = async force => { h.events.push(['stdin.close', force]); if (force !== true) await close.promise; };
  const done = await expire(h, observed(h.run()), 1000);
  assert.equal(done.error?.code, 'UNDERSTAND_FIXTURE_UNAVAILABLE'); clean(h);
  close.reject(eofError()); await tick();
});
test('manifest write EOF and non-EOF failures remain unknown and never issue normal close', async () => {
  for (const writeError of [eofError(), Error('synthetic write failure')]) {
    const h = acceptance({ writeError });
    await assert.rejects(h.io.accept({ root, expected: empty(), manifest }, { admit: () => true }), unknown);
    assert.equal(h.events.some(row => row[0] === 'stdin.close' && row[1] !== true), false);
    assert.equal(h.events.some(row => row[0] === 'stdout.read'), false); clean(h);
  }
});
test('manifest non-EOF or string/code lookalike close remains unknown', async () => {
  for (const closeError of [Object.assign(Error('synthetic detail'), { errorCode: EOF + 1 }),
    Object.assign(Error('synthetic detail'), { errorCode: String(EOF) }),
    Object.assign(Error('synthetic detail'), { code: EOF }), Error('synthetic detail')]) {
    const h = acceptance({ closeError }); await assert.rejects(h.run(), unknown);
    assert.equal(h.events.some(row => row[0] === 'stdout.read'), false); clean(h);
  }
});
test('manifest close EOF requires genuine raw output EOF and drops late typed response', async () => {
  const pending = deferred(); const h = acceptance({ stdout: [raw(JSON.stringify({ ok: false, error: 'MANIFEST_CHANGED', committed: false })), pending.promise] });
  const done = await expire(h, observed(h.run()), 4000);
  assert.deepEqual({ code: done.error?.code, committed: done.error?.committed }, unknown); clean(h);
  pending.resolve(new ArrayBuffer(0)); await tick();
});
test('manifest close EOF requires actual zero wait and drops late success', async () => {
  const wait = deferred(); const h = acceptance({ waitPromise: wait.promise });
  const done = await expire(h, observed(h.run()), 4000);
  assert.deepEqual({ code: done.error?.code, committed: done.error?.committed }, unknown); clean(h);
  wait.resolve({ exitCode: 0 }); await tick();
});
test('manifest nonzero or malformed actual wait cannot admit typed success', async () => {
  for (const waitResult of [{ exitCode: 1 }, { exitCode: '0' }, {}, null]) {
    const h = acceptance({ waitResult }); await assert.rejects(h.run(), unknown); clean(h);
  }
});
test('manifest malformed or unknown typed response remains hidden despite close EOF', async () => {
  for (const response of ['', '{', { ok: false, error: 'synthetic secret detail', committed: false },
    { ok: false, error: 'MANIFEST_CHANGED', committed: false, extra: 1 }, { ok: true },
    { ok: true, result: empty(), extra: 1 }]) {
    const h = acceptance({ response }); await assert.rejects(h.run(), error => {
      assert.equal(error.code, unknown.code); assert.equal(error.committed, null); assert.equal(error.message, error.code); return true;
    }); clean(h);
  }
});
test('revoked pending manifest write gets no normal EOF, even when close would report EOF', async () => {
  const write = deferred(); const h = acceptance();
  h.child.stdin.write = async value => { h.events.push(['write', value]); await write.promise; };
  const outcome = observed(h.run()); await tick(); h.active = false; write.resolve();
  const done = await outcome; assert.equal(done.error?.code, 'WRITE_OUTCOME_UNKNOWN'); assert.equal(done.error?.committed, null);
  assert.equal(h.events.some(row => row[0] === 'stdin.close' && row[1] !== true), false);
  assert.ok(h.events.findIndex(row => row[0] === 'kill') < h.events.findIndex(row => row[0] === 'stdin.close')); clean(h);
});
test('hanging manifest close preserves deadline, unknown commit and forced cleanup', async () => {
  const close = deferred(); const h = acceptance();
  h.child.stdin.close = async force => { h.events.push(['stdin.close', force]); if (force !== true) await close.promise; };
  const done = await expire(h, observed(h.run()), 4000);
  assert.deepEqual({ code: done.error?.code, committed: done.error?.committed }, unknown); clean(h);
  close.reject(eofError()); await tick();
});
test('manifest valid split UTF-8 output remains gated by raw EOF after close EOF', async () => {
  const answer = { ok: false, error: 'MANIFEST_CHANGED', committed: false };
  const h = acceptance({ stdout: [...encoder.encode(JSON.stringify(answer))].map(byte => new Uint8Array([byte]).buffer) });
  await assert.rejects(h.run(), { code: 'MANIFEST_CHANGED', committed: false }); clean(h);
  assert.equal(h.events.filter(row => row[0] === 'stdout.read').length, encoder.encode(JSON.stringify(answer)).length + 1);
});
test('manifest real read failure and incomplete UTF-8 remain unavailable after close EOF', async () => {
  for (const stdout of [[eofError()], [new Uint8Array([0xe2]).buffer]]) {
    const h = acceptance({ stdout }); await assert.rejects(h.run(), unknown); clean(h);
  }
});
test('fixed-helper pre-read containment refusal keeps its exact false commit receipt', async () => {
  const h = acceptance({ response: { ok: false, error: 'WRITE_CONTAINMENT_REFUSED', committed: false } });
  await assert.rejects(h.run(), { code: 'WRITE_CONTAINMENT_REFUSED', committed: false }); clean(h);
  assert.equal(h.events.filter(row => row[0] === 'write').length, 1);
});
test('manifest positive Unicode response passes only after split raw UTF-8 is complete', async () => {
  const result = { rootIdentity: { device: '1', inode: '2' }, directoryIdentity: { device: '1', inode: '3' },
    target: { identity: { device: '1', inode: '4' }, digest: 'a'.repeat(64), size: 123, mode: 0o644 },
    manifest: { ...manifest, name: 'Harbor Café ☕ 🎨' } };
  const bytes = encoder.encode(JSON.stringify({ ok: true, result }));
  const h = acceptance({ stdout: [...bytes].map(byte => new Uint8Array([byte]).buffer) });
  assert.deepEqual(await h.run(), result); clean(h);
  assert.equal(h.events.filter(row => row[0] === 'stdout.read').length, bytes.length + 1);
});
