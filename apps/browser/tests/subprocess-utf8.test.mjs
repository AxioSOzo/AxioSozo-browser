// Synthetic raw-pipe fixtures only: no child process, profile or provider.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createSubprocessUtf8Reader } from '../chrome/SubprocessUtf8.sys.mjs';
const raw = values => Uint8Array.from(values).buffer;
function pipe(values) {
  const chunks = [...values]; let calls = 0;
  return { get calls() { return calls; }, read(...args) {
    assert.deepEqual(args, [], 'Use the unsized native read API'); calls++;
    return Promise.resolve(chunks.length ? chunks.shift() : new ArrayBuffer(0));
  } };
}

test('every split of 2/3/4-byte UTF-8 preserves empty decoded prefixes and exact raw counts', async () => {
  for (const text of ['¢', '€', '😀']) {
    const bytes = new TextEncoder().encode(text);
    for (let split = 1; split < bytes.length; split++) {
      const p = pipe([bytes.slice(0, split).buffer, bytes.slice(split).buffer]);
      const reader = createSubprocessUtf8Reader(p, { maxBytes: bytes.length });
      const first = await reader.read(); assert(first !== null); assert.equal(first.text, '');
      assert.equal(first.byteLength, split); assert.equal(reader.bytesRead, split);
      assert.equal((await reader.read()).text, text); assert.equal(reader.bytesRead, bytes.length);
      assert.equal(await reader.read(), null); assert.equal(await reader.read(), null); assert.equal(p.calls, 3);
    }
    const reader = createSubprocessUtf8Reader(pipe([...bytes].map(byte => raw([byte]))));
    let decoded = '';
    for (let i = 0; i < bytes.length; i++) decoded += (await reader.read()).text;
    assert.equal(decoded, text); assert.equal(await reader.read(), null);
  }
});
test('raw BOM and newline bytes count, and BOM remains visible to callers', async () => {
  const bytes = [0xef, 0xbb, 0xbf, 0x41, 0x0a];
  const reader = createSubprocessUtf8Reader(pipe([raw(bytes)]), { maxBytes: bytes.length });
  assert.equal((await reader.read()).text, '\ufeffA\n'); assert.equal(reader.bytesRead, 5);
  let observed = 0;
  const limited = createSubprocessUtf8Reader(pipe([raw(bytes)]), { maxBytes: 4, onBytes() { observed++; } });
  await assert.rejects(limited.read(), { code: 'OUTPUT_LIMIT' }); assert.equal(observed, 0);
});
test('raw limits reject before decode/observer even while a code point has no decoded text', async () => {
  let observed = 0;
  const hidden = createSubprocessUtf8Reader(pipe([raw([0xf0, 0x9f, 0x98])]), { maxBytes: 2, onBytes() { observed++; } });
  await assert.rejects(hidden.read(), { code: 'OUTPUT_LIMIT' }); assert.equal(hidden.bytesRead, 3); assert.equal(observed, 0);
  const exact = createSubprocessUtf8Reader(pipe([raw([0xf0, 0x9f]), raw([0x98, 0x80])]), { maxBytes: 4 });
  assert.equal((await exact.read()).text, ''); assert.equal((await exact.read()).text, '😀'); assert.equal(await exact.read(), null);
  for (const chunks of [[raw([0x41, 0x42, 0x43])], [raw([0x41, 0x42]), raw([0x43])]]) {
    const capped = createSubprocessUtf8Reader(pipe(chunks), { maxBytes: 2 });
    if (chunks.length === 2) assert.equal((await capped.read()).text, 'AB');
    await assert.rejects(capped.read(), { code: 'OUTPUT_LIMIT' });
  }
});
test('malformed UTF-8 fails without replacement characters; incomplete EOF fails during flush', async () => {
  const malformed = createSubprocessUtf8Reader(pipe([raw([0xe2]), raw([0x28])]));
  assert.equal((await malformed.read()).text, ''); await assert.rejects(malformed.read(), { code: 'INVALID_UTF8' });
  await assert.rejects(malformed.read(), { code: 'INVALID_UTF8' });
  const incomplete = createSubprocessUtf8Reader(pipe([raw([0x41]), raw([0xe2, 0x82])]));
  assert.equal((await incomplete.read()).text, 'A'); assert.equal((await incomplete.read()).text, '');
  await assert.rejects(incomplete.read(), { code: 'INVALID_UTF8' });
  const fresh = createSubprocessUtf8Reader(pipe([]), { maxBytes: 0 }); assert.equal(await fresh.read(), null);
});
test('only real ArrayBuffer chunks pass native brand validation without caller accessors', async () => {
  assert.throws(() => createSubprocessUtf8Reader({ readString() {} }), { code: 'INVALID_PIPE' });
  let accessed = 0;
  const spoof = {};
  Object.defineProperty(spoof, Symbol.toStringTag, { get() { accessed++; return 'ArrayBuffer'; } });
  Object.defineProperty(spoof, 'byteLength', { get() { accessed++; return 0; } });
  Object.defineProperty(spoof, 'length', { get() { accessed++; return 1; } });
  const detached = new ArrayBuffer(1); structuredClone(detached, { transfer: [detached] });
  for (const value of [spoof, detached, new Uint8Array([65]), 'A', null]) {
    await assert.rejects(createSubprocessUtf8Reader(pipe([value])).read(), { code: 'INVALID_PIPE_BYTES' });
  }
  assert.equal(accessed, 0);
  const foreign = vm.runInNewContext('new Uint8Array([65]).buffer');
  assert.equal((await createSubprocessUtf8Reader(pipe([foreign])).read()).text, 'A');
});
test('observer throws, including falsy values, permanently stop raw reads', async () => {
  for (const thrown of [undefined, null, false, 0, '', new Error('Synthetic observer')]) {
    const p = pipe([raw([65]), raw([66])]);
    const reader = createSubprocessUtf8Reader(p, { onBytes() { throw thrown; } });
    for (let i = 0; i < 2; i++) {
      let rejected = false;
      try { await reader.read(); } catch (error) { rejected = true; assert.equal(error, thrown); }
      assert.equal(rejected, true);
    }
    assert.equal(p.calls, 1);
  }
  const asynchronous = createSubprocessUtf8Reader(pipe([raw([65])]), { onBytes: async () => {} });
  await assert.rejects(asynchronous.read(), { code: 'INVALID_OBSERVER' });
});
test('concurrent reads reject without consuming another chunk and pipe failures normalize diagnostics', async () => {
  let resolve, calls = 0;
  const reader = createSubprocessUtf8Reader({ read() { calls++; return new Promise(done => { resolve = done; }); } });
  const pending = reader.read(); await assert.rejects(reader.read(), { code: 'CONCURRENT_READ' });
  assert.equal(calls, 1); resolve(raw([65])); assert.equal((await pending).text, 'A');
  const broken = createSubprocessUtf8Reader({ read() { throw new Error('SYNTHETIC_PRIVATE_PATH'); } });
  await assert.rejects(broken.read(), error => error.code === 'PIPE_READ_FAILED' && error.message === 'PIPE_READ_FAILED');
});
