import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { serializeManifest } from '../../../packages/contexts/src/manifest.mjs';
import './support/chrome-modules.mjs';
const { acceptanceSnapshot, createManifestAcceptance, createNativeManifestAcceptIO, manifestAcceptPaths,
  MANIFEST_ACCEPT_PYTHON, MANIFEST_ACCEPT_SHA256 } = await import('../chrome/ProjectManifestAccept.sys.mjs');

const ROOT = '/Volumes/AxioSozoBuild/workstation/manifest-accept-fixtures/owned-test/harbor-suite';
const ID = { device: '1', inode: '2' };
const DIR = { device: '1', inode: '3' };
const TARGET = { identity: { device: '1', inode: '4' }, digest: 'a'.repeat(64), size: 123, mode: 0o644 };
const BASE = { version: 2, name: 'Harbor Suite', kind: 'web', environments: [{ name: 'local', app: 'web', base_url: 'http://127.0.0.1:44123/' }], services: [], surfaces: [] };
const copy = value => JSON.parse(JSON.stringify(value));
const empty = () => ({ rootIdentity: ID, directoryIdentity: null, target: null, manifest: null });
const existing = () => ({ rootIdentity: ID, directoryIdentity: DIR, target: TARGET, manifest: copy(BASE) });
const written = () => ({ path: `${ROOT}/.axiosozo/project.json`, digest: 'b'.repeat(64), committed: true });
const settles = async (n = 20) => { for (let i = 0; i < n; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
function harness(overrides = {}) {
  let permitted = true, now = 1000, sequence = 0;
  const writes = [];
  const io = { snapshot: async () => empty(), accept: async (payload, { admit }) => { assert.equal(admit(), true); writes.push(copy(payload)); return written(); }, ...overrides };
  const controller = createManifestAcceptance({ io, rootAdmission: root => root === ROOT && permitted, clock: () => now, newToken: () => `one_use_token_${String(++sequence).padStart(8, '0')}` });
  return { controller, writes, preview: () => controller.preview({ root: ROOT, baseManifest: BASE, guard: () => permitted }),
    revoke() { permitted = false; }, advance(ms) { now += ms; } };
}
function timers() {
  const active = new Map(); let id = 0;
  return { setTimeout(fn, ms) { active.set(++id, { fn, ms }); return id; }, clearTimeout(key) { active.delete(key); },
    run(ms) { const item = [...active].find(([, v]) => v.ms === ms); assert.ok(item, `missing ${ms}ms deadline`); active.delete(item[0]); item[1].fn(); }, active };
}
function runtime({ response = { ok: true, result: empty() }, call, verifyFile, sha256 } = {}) {
  const events = [], timer = timers();
  let output = new TextEncoder().encode(typeof response === 'string' ? response : JSON.stringify(response)).buffer;
  const child = { stdin: { async write(input) { events.push(['write', input]); }, async close(force) { events.push(['stdin.close', force]); } },
    stdout: { async read() { const value = output; output = new ArrayBuffer(0); return value; }, async close() { events.push(['stdout.close']); } },
    stderr: { async read() { return new ArrayBuffer(0); }, async close() { events.push(['stderr.close']); } },
    async wait() { events.push(['wait']); return { exitCode: 0 }; }, async kill(value) { events.push(['kill', value]); } };
  const rt = { env: key => key === 'AXIOSOZO_BUILD_ROOT' ? '/Volumes/AxioSozoBuild/workstation' : '', timers: timer,
    verifyFile: verifyFile ?? (async () => true), sha256: sha256 ?? (async () => MANIFEST_ACCEPT_SHA256),
    Subprocess: { call: async options => { events.push(['call', options]); return call ? call(child) : child; } } };
  return { rt, events, child, timers: timer, io: createNativeManifestAcceptIO({ runtime: rt }) };
}

test('hash pins the exact helper candidate', async () => {
  const bytes = await readFile(new URL('../../../tools/axiosozo-manifest/manifest_accept.py', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), MANIFEST_ACCEPT_SHA256);
});
test('snapshot accepts core serialization with v2 app key order', () => {
  const manifest = JSON.parse(serializeManifest(BASE));
  assert.deepEqual(acceptanceSnapshot({ ...existing(), manifest }).manifest, manifest);
});
test('snapshot refuses actual URL normalization drift and unknown fields', () => {
  const source = existing(); source.manifest.environments[0].base_url = 'http://127.0.0.1:44123';
  assert.throws(() => acceptanceSnapshot(source), { code: 'NONCANONICAL_MANIFEST' });
  assert.throws(() => acceptanceSnapshot({ ...empty(), actor_root: ROOT }), { code: 'WRITE_CONTAINMENT_UNAVAILABLE' });
});
test('one-use confirmation dispatches only schema validated manifest and privileged snapshot', async () => {
  const h = harness();
  const preview = await h.preview();
  assert.deepEqual(Object.keys(preview).sort(), ['manifest', 'token']);
  const result = await h.controller.accept({ token: preview.token, edits: { name: 'Harbor Desktop', kind: 'desktop' } });
  assert.equal(result.committed, true);
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].manifest.name, 'Harbor Desktop');
  assert.deepEqual(h.writes[0].manifest.environments, BASE.environments);
  assert.deepEqual(h.writes[0].expected, { rootIdentity: ID, directoryIdentity: null, target: null });
  await assert.rejects(h.controller.accept({ token: preview.token, edits: { name: 'Replay' } }), { code: 'STALE_ACCEPTANCE' });
});
test('existing manifest is the source of all unchanged fields', async () => {
  const snap = existing(); snap.manifest.surfaces.push({ name: 'Harbor Docs', kind: 'docs', url: 'https://docs.harbor.invalid/' });
  const h = harness({ snapshot: async () => snap });
  const p = await h.preview();
  await h.controller.accept({ token: p.token, edits: { kind: 'desktop' } });
  assert.deepEqual(h.writes[0].manifest.surfaces, snap.manifest.surfaces);
});
test('brief and arbitrary environment edits are refused and consume token', async () => {
  for (const edits of [{ brief: { document: {} } }, { environments: [] }, {}, { name: 'sk-syntheticcredentials123456789' }]) {
    const h = harness(); const p = await h.preview();
    await assert.rejects(h.controller.accept({ token: p.token, edits }));
    assert.equal(h.writes.length, 0);
    await assert.rejects(h.controller.accept({ token: p.token, edits: { name: 'Retry' } }), { code: 'STALE_ACCEPTANCE' });
  }
});
test('root denial refuses before snapshot', async () => {
  let reads = 0; const h = harness({ snapshot: async () => { reads++; return empty(); } });
  h.revoke(); await assert.rejects(h.preview(), { code: 'STALE_ACCEPTANCE' }); assert.equal(reads, 0);
});
test('revocation while snapshot is pending cannot admit a token', async () => {
  const wait = deferred(); const h = harness({ snapshot: () => wait.promise });
  const result = h.preview(); h.revoke(); wait.resolve(empty());
  await assert.rejects(result, { code: 'STALE_ACCEPTANCE' }); assert.equal(h.writes.length, 0);
});
test('expired and invalidated tokens are refused before native write', async () => {
  const h = harness(); const p = await h.preview(); h.advance(120000);
  await assert.rejects(h.controller.accept({ token: p.token, edits: { name: 'Late' } }), { code: 'STALE_ACCEPTANCE' });
  const q = await h.preview(); h.controller.invalidate();
  await assert.rejects(h.controller.accept({ token: q.token, edits: { name: 'Invalidated' } }), { code: 'STALE_ACCEPTANCE' });
  assert.equal(h.writes.length, 0);
});
test('pending cap is enforced', async () => {
  const h = harness(); for (let i = 0; i < 32; i++) await h.preview();
  await assert.rejects(h.preview(), { code: 'BUSY' });
});
test('invalidated in-flight accepted dispatch needs its live guard to revoke', async () => {
  const wait = deferred(); const h = harness({ accept: () => wait.promise });
  const p = await h.preview(); const result = h.controller.accept({ token: p.token, edits: { name: 'Accepted' } });
  h.controller.invalidate(); wait.resolve(written());
  assert.equal((await result).committed, true);
});
test('guard revocation after native commit reports uncertainty without retry', async () => {
  const wait = deferred(); const h = harness({ accept: () => wait.promise });
  const p = await h.preview(); const result = h.controller.accept({ token: p.token, edits: { name: 'Accepted' } });
  h.revoke(); wait.resolve(written());
  await assert.rejects(result, { code: 'WRITE_OUTCOME_UNKNOWN', committed: true });
});
test('malformed native success is uncertain', async () => {
  const h = harness({ accept: async () => ({ path: '/unrelated/target', digest: 'b'.repeat(64), committed: true }) });
  const p = await h.preview();
  await assert.rejects(h.controller.accept({ token: p.token, edits: { name: 'Accepted' } }), { code: 'WRITE_OUTCOME_UNKNOWN', committed: null });
});
test('fixed namespace refuses arbitrary helper roots', () => {
  for (const root of ['/tmp/fake', '/Volumes/AxioSozoBuild/zen', '/Volumes/AxioSozoBuild/workstation/nested', '/Volumes/AxioSozoBuild/../tmp']) assert.throws(() => manifestAcceptPaths(root));
  assert.equal(manifestAcceptPaths('/Volumes/AxioSozoBuild/workstation').interpreter, MANIFEST_ACCEPT_PYTHON);
});
test('native transport pins selectors, sanitized environment, stdin body and cwd', async () => {
  const h = runtime(); const result = await h.io.snapshot(ROOT, { admit: () => true });
  assert.deepEqual(result, empty());
  const options = h.events.find(e => e[0] === 'call')[1];
  assert.equal(options.command, MANIFEST_ACCEPT_PYTHON);
  assert.deepEqual(options.arguments, ['-I', '-S', '-B', manifestAcceptPaths('/Volumes/AxioSozoBuild/workstation').helperPath, 'snapshot']);
  assert.deepEqual(options.environment, { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' });
  assert.equal(options.environmentAppend, false); assert.equal(options.workdir, '/');
  assert.deepEqual(JSON.parse(h.events.find(e => e[0] === 'write')[1]), { root: ROOT });
  assert.equal(h.timers.active.size, 0);
});
test('hash mismatch and unknown admission cause no spawn', async () => {
  const h = runtime({ sha256: async () => 'c'.repeat(64) });
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), { code: 'WRITE_CONTAINMENT_UNAVAILABLE', committed: false });
  assert.equal(h.events.length, 0);
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => Promise.resolve(true) }), { code: 'STALE_ACCEPTANCE' });
});
test('late verification deadline never launches a child', async () => {
  const verify = deferred(); const h = runtime({ verifyFile: () => verify.promise });
  const result = h.io.snapshot(ROOT, { admit: () => true });
  h.timers.run(4000);
  await assert.rejects(result, { code: 'WRITE_CONTAINMENT_UNAVAILABLE', committed: false });
  verify.resolve(true); await settles(); assert.equal(h.events.length, 0);
});
test('late child after deadline is killed before pipe closes and reaped', async () => {
  const spawn = deferred(); const h = runtime({ call: () => spawn.promise });
  const result = h.io.snapshot(ROOT, { admit: () => true });
  await settles(); assert.equal(h.events[0][0], 'call'); h.timers.run(4000);
  await assert.rejects(result, { code: 'WRITE_CONTAINMENT_UNAVAILABLE', committed: null });
  spawn.resolve(h.child); await settles(40);
  assert.ok(h.events.some(e => e[0] === 'kill')); assert.ok(h.events.some(e => e[0] === 'wait'));
  assert.ok(h.events.findIndex(e => e[0] === 'kill') < h.events.findIndex(e => e[0] === 'stdin.close'));
  assert.equal(h.events.some(e => e[0] === 'write'), false);
});
test('revoked pending stdin write gets no normal EOF and kill precedes forced close', async () => {
  const write = deferred(); let permitted = true; const h = runtime();
  h.child.stdin.write = async () => { h.events.push(['write']); await write.promise; };
  const result = h.io.snapshot(ROOT, { admit: () => permitted }); await settles();
  assert.ok(h.events.some(e => e[0] === 'write')); permitted = false; write.resolve();
  await assert.rejects(result, { code: 'WRITE_OUTCOME_UNKNOWN', committed: null });
  assert.equal(h.events.some(e => e[0] === 'stdin.close' && e[1] !== true), false);
  assert.ok(h.events.findIndex(e => e[0] === 'kill') < h.events.findIndex(e => e[0] === 'stdin.close'));
});
test('failed kill never closes live helper input', async () => {
  let permitted = true; const write = deferred(); const h = runtime();
  h.child.stdin.write = async () => { h.events.push(['write']); await write.promise; };
  h.child.kill = async () => { h.events.push(['kill']); throw new Error('synthetic kill failure'); };
  const result = h.io.snapshot(ROOT, { admit: () => permitted }); await settles(); permitted = false; write.resolve();
  await assert.rejects(result, { code: 'WRITE_OUTCOME_UNKNOWN', committed: null });
  assert.equal(h.events.some(e => e[0] === 'stdin.close'), false);
});
test('helper fixed refusal keeps committed flag and raw unknown errors are hidden', async () => {
  const h = runtime({ response: { ok: false, error: 'MANIFEST_CHANGED', committed: false } });
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), { code: 'MANIFEST_CHANGED', committed: false });
  const bad = runtime({ response: { ok: false, error: 'arbitrary synthetic text', committed: false } });
  await assert.rejects(bad.io.snapshot(ROOT, { admit: () => true }), { code: 'WRITE_CONTAINMENT_UNAVAILABLE', committed: null });
});
test('oversized native output is bounded and owned child killed', async () => {
  const h = runtime({ response: 'x'.repeat(100 * 1024) });
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), { code: 'WRITE_CONTAINMENT_UNAVAILABLE', committed: null });
  assert.ok(h.events.some(e => e[0] === 'kill'));
});

test('malformed native response with revoked guard remains unknown commit', async () => {
  const wait = deferred(); const h = harness({ accept: () => wait.promise });
  const p = await h.preview(); const result = h.controller.accept({ token: p.token, edits: { name: 'Accepted' } });
  h.revoke(); wait.resolve({ arbitrary: 'malformed' });
  await assert.rejects(result, { code: 'WRITE_OUTCOME_UNKNOWN', committed: null });
});

test('invalid clock cannot create non-expiring acceptance lease', async () => {
  for (const now of [NaN, -1, Number.MAX_SAFE_INTEGER]) {
    const controller = createManifestAcceptance({ io: { snapshot: async () => empty(), accept: async () => written() }, rootAdmission: () => true, clock: () => now, newToken: () => 'synthetic_token_12345678' });
    await assert.rejects(controller.preview({ root: ROOT, baseManifest: BASE, guard: () => true }), { code: 'INVALID_TIME' });
  }
});


// Raw Gecko InputPipe contract: no length argument, ArrayBuffer-only chunks,
// and exactly a zero-byte ArrayBuffer at EOF.
const rawBytes = text => new TextEncoder().encode(text);
const rawBuffer = bytes => Uint8Array.from(bytes).buffer;
function rawChunks(h, name, chunks) {
  let index = 0;
  h.child[name].read = async (...args) => {
    assert.deepEqual(args, [], 'raw read must not request a fixed length');
    h.events.push([`${name}.read`]);
    return index < chunks.length ? chunks[index++] : new ArrayBuffer(0);
  };
  h.child[name].readString = () => { throw new Error('readString must never be used'); };
}
const unknownTransport = { code: 'WRITE_CONTAINMENT_UNAVAILABLE', committed: null };

test('split Unicode lead-only chunks are decoded through raw EOF without truncation', async () => {
  const result = existing();
  result.manifest.name = 'Harbor Café ☕ 🎨';
  const bytes = rawBytes(JSON.stringify({ ok: true, result }));
  const h = runtime();
  rawChunks(h, 'stdout', [...bytes].map(byte => rawBuffer([byte])));
  assert.deepEqual(await h.io.snapshot(ROOT, { admit: () => true }), result);
  assert.equal(h.events.filter(event => event[0] === 'stdout.read').length, bytes.length + 1);
  assert.equal(h.timers.active.size, 0);
});

test('discarded stderr is strictly decoded across split Unicode chunks', async () => {
  const h = runtime();
  rawChunks(h, 'stderr', [...rawBytes('synthetic Café ☕ 🎨')].map(byte => rawBuffer([byte])));
  assert.deepEqual(await h.io.snapshot(ROOT, { admit: () => true }), empty());
});

test('malformed stdout UTF-8 refuses rather than JSON replacement', async () => {
  for (const invalid of [[0x80], [0xc0, 0xaf], [0xed, 0xa0, 0x80], [0xf4, 0x90, 0x80, 0x80], [0xe2, 0x28, 0xa1]]) {
    const h = runtime();
    const prefix = rawBytes('{"ok":true,"result":{"synthetic":"');
    const suffix = rawBytes('"}}');
    rawChunks(h, 'stdout', [rawBuffer([...prefix, ...invalid, ...suffix])]);
    await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), unknownTransport);
    assert.ok(h.events.some(event => event[0] === 'kill'));
    assert.equal(h.timers.active.size, 0);
  }
});

test('incomplete stdout UTF-8 is refused on raw EOF flush', async () => {
  const h = runtime();
  rawChunks(h, 'stdout', [rawBytes(JSON.stringify({ ok: true, result: empty() })).buffer, rawBuffer([0xf0, 0x9f])]);
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), unknownTransport);
  assert.ok(h.events.some(event => event[0] === 'kill'));
});

test('malformed and incomplete discarded stderr refuse with no raw text disclosure', async () => {
  for (const invalid of [[0xff], [0xe2], [0xf0, 0x9f]]) {
    const h = runtime();
    rawChunks(h, 'stderr', [rawBuffer([...rawBytes('invented sensitive fixture only '), ...invalid])]);
    await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), error => {
      assert.equal(error.code, unknownTransport.code);
      assert.equal(error.committed, null);
      assert.equal(error.message, unknownTransport.code);
      return true;
    });
    assert.ok(h.events.some(event => event[0] === 'kill'));
  }
});

test('only ArrayBuffer chunks are accepted, including at EOF', async () => {
  const spoof = { byteLength: 0, [Symbol.toStringTag]: 'ArrayBuffer' };
  const candidates = [null, '', undefined, new Uint8Array(0), new DataView(new ArrayBuffer(0)), spoof, new SharedArrayBuffer(0)];
  for (const candidate of candidates) {
    const h = runtime();
    rawChunks(h, 'stdout', [rawBytes(JSON.stringify({ ok: true, result: empty() })).buffer, candidate]);
    await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), unknownTransport);
  }
});

test('a transport with readString only is refused before sending the request body', async () => {
  const h = runtime();
  delete h.child.stdout.read;
  h.child.stdout.readString = async () => '';
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), unknownTransport);
  assert.equal(h.events.some(event => event[0] === 'write'), false);
  assert.ok(h.events.some(event => event[0] === 'kill'));
});

test('stdout raw byte cap accepts the boundary and refuses the next byte', async () => {
  const json = JSON.stringify({ ok: true, result: empty() });
  const bytes = rawBytes(' '.repeat(96 * 1024 - rawBytes(json).byteLength) + json);
  const allowed = runtime();
  rawChunks(allowed, 'stdout', [bytes.buffer]);
  assert.deepEqual(await allowed.io.snapshot(ROOT, { admit: () => true }), empty());
  const denied = runtime();
  rawChunks(denied, 'stdout', [bytes.buffer, rawBuffer([0x20])]);
  await assert.rejects(denied.io.snapshot(ROOT, { admit: () => true }), unknownTransport);
  assert.ok(denied.events.some(event => event[0] === 'kill'));
});

test('stderr cap counts the raw BOM even if a decoder omits it from text', async () => {
  const prefix = [0xef, 0xbb, 0xbf];
  const allowed = runtime();
  rawChunks(allowed, 'stderr', [rawBuffer([...prefix, ...rawBytes('a'.repeat(16 * 1024 - prefix.length))])]);
  assert.deepEqual(await allowed.io.snapshot(ROOT, { admit: () => true }), empty());
  const denied = runtime();
  rawChunks(denied, 'stderr', [rawBuffer(prefix), rawBytes('a'.repeat(16 * 1024 - prefix.length + 1)).buffer]);
  await assert.rejects(denied.io.snapshot(ROOT, { admit: () => true }), unknownTransport);
  assert.ok(denied.events.some(event => event[0] === 'kill'));
});

test('stdout cap counts raw split multibyte bytes before decoding', async () => {
  const h = runtime();
  // The final lead byte alone adds no text, but it still exceeds the byte cap.
  rawChunks(h, 'stdout', [rawBytes(' '.repeat(96 * 1024)).buffer, rawBuffer([0xe2])]);
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), unknownTransport);
  assert.ok(h.events.some(event => event[0] === 'kill'));
});

test('raw read failures preserve unknown dispatch and fixed machine error only', async () => {
  const h = runtime();
  h.child.stdout.read = async () => { throw new Error('invented private fixture failure'); };
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), error => {
    assert.equal(error.code, unknownTransport.code);
    assert.equal(error.committed, null);
    assert.equal(error.message, unknownTransport.code);
    return true;
  });
  const kill = h.events.findIndex(event => event[0] === 'kill');
  const forcedEOF = h.events.findIndex(event => event[0] === 'stdin.close' && event[1] === true);
  assert.ok(kill >= 0 && forcedEOF > kill);
});

test('pending raw read deadline kills the child and closes owned pipes', async () => {
  const read = deferred();
  const h = runtime();
  h.child.stdout.read = () => read.promise;
  const result = h.io.snapshot(ROOT, { admit: () => true });
  await settles(40);
  assert.ok(h.events.some(event => event[0] === 'stdin.close' && event[1] !== true));
  h.timers.run(4000);
  await assert.rejects(result, { code: 'WRITE_CONTAINMENT_UNAVAILABLE', committed: null });
  assert.ok(h.events.some(event => event[0] === 'kill'));
  assert.ok(h.events.some(event => event[0] === 'stdout.close'));
  assert.ok(h.events.some(event => event[0] === 'stderr.close'));
  assert.ok(h.events.some(event => event[0] === 'wait'));
  read.resolve(rawBytes(JSON.stringify({ ok: true, result: empty() })).buffer);
  await settles(40);
  assert.equal(h.timers.active.size, 0);
});


test('genuine ArrayBuffers from another realm use the native byte contract', async () => {
  const bytes = [...rawBytes(JSON.stringify({ ok: true, result: empty() }))];
  const buffer = vm.runInNewContext('Uint8Array.from(bytes).buffer', { bytes });
  const eof = vm.runInNewContext('new ArrayBuffer(0)');
  assert.equal(buffer instanceof ArrayBuffer, false);
  assert.equal(eof instanceof ArrayBuffer, false);
  const h = runtime();
  rawChunks(h, 'stdout', [buffer, eof]);
  assert.deepEqual(await h.io.snapshot(ROOT, { admit: () => true }), empty());
});

test('detached ArrayBuffer is refused rather than mistaken for EOF', async () => {
  const buffer = new ArrayBuffer(3);
  structuredClone(buffer, { transfer: [buffer] });
  assert.equal(buffer.byteLength, 0);
  const h = runtime();
  rawChunks(h, 'stdout', [rawBytes(JSON.stringify({ ok: true, result: empty() })).buffer, buffer]);
  await assert.rejects(h.io.snapshot(ROOT, { admit: () => true }), unknownTransport);
});
