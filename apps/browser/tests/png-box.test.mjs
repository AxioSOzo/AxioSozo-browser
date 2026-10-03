import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32, deflateSync, inflateSync } from 'node:zlib';
import { parseViewportPng, fitViewportPngBox } from '../chrome/ViewportPngFormat.sys.mjs';
import { createGeckoViewportPngBox } from '../chrome/GeckoViewportPngBox.sys.mjs';
import { createAgentViewportCapture } from '../chrome/AgentViewportCapture.sys.mjs';
import { AgentToolError } from '../chrome/GeckoBiDiReadSession.sys.mjs';
const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function chunk(type, data = Buffer.alloc(0)) {
  const body = Buffer.concat([Buffer.from(type), data]); const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length); body.copy(result, 4); result.writeUInt32BE(crc32(body), data.length + 8); return result;
}
function ihdr(width = 1, height = 1, { bitDepth = 8, colorType = 6, compression = 0, filter = 0, interlace = 0 } = {}) {
  const data = Buffer.alloc(13); data.writeUInt32BE(width); data.writeUInt32BE(height, 4);
  data[8] = bitDepth; data[9] = colorType; data[10] = compression; data[11] = filter; data[12] = interlace;
  return chunk('IHDR', data);
}
function png(width = 1, height = 1, options = {}) {
  const channels = options.colorType === 2 ? 3 : 4;
  const pixels = Buffer.alloc((width * channels + 1) * height);
  const compressed = options.compressed ?? deflateSync(pixels);
  const ids = options.split ? [chunk('IDAT', compressed.subarray(0, options.split)), chunk('IDAT', compressed.subarray(options.split))]
    : [chunk('IDAT', compressed)];
  return Buffer.concat([SIG, ihdr(width, height, options), ...(options.before ?? []), ...ids, ...(options.after ?? []), chunk('IEND')]).toString('base64');
}
const rejects = (promise, code) => assert.rejects(promise, error => error instanceof AgentToolError && error.code === code);
const throws = (call, code = 'UNAVAILABLE') => assert.throws(call, error => error instanceof AgentToolError && error.code === code);
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function image(data_base64 = png(), more = {}) { return Object.freeze({ mime: 'image/png', data_base64, ...more }); }
function sized(source, max_width, max_height, max_bytes = 1048576) {
  const parsed = parseViewportPng(source); const desired = fitViewportPngBox({ ...parsed, max_width, max_height });
  return image(source, { width: parsed.width, height: parsed.height, decodedBytes: parsed.decodedBytes,
    max_width, max_height, max_bytes, target_width: desired.width, target_height: desired.height });
}
function nativeFixture(overrides = {}) {
  const calls = { load: 0, decode: 0, scale: [], reader: 0, close: 0, rawClose: 0, read: [] };
  const ctx = { calls, encoded: null, stream: null };
  const images = {
    decodeImageFromArrayBuffer(buffer, mime) {
      calls.decode++; assert.equal(mime, 'image/png');
      if (overrides.decode) return overrides.decode(ctx, buffer);
      const bytes = Buffer.from(buffer); const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), channels = bytes[25] === 2 ? 3 : 4;
      let offset = 8; const parts = [];
      while (offset < bytes.length) { const length = bytes.readUInt32BE(offset); if (bytes.toString('ascii', offset + 4, offset + 8) === 'IDAT') parts.push(bytes.subarray(offset + 8, offset + 8 + length)); offset += length + 12; }
      return { width, height, channels, compressed: Buffer.concat(parts) };
    },
    encodeScaledImage(container, mime, width, height) {
      calls.scale.push({ width, height }); assert.equal(mime, 'image/png');
      if (overrides.scale) return overrides.scale(ctx, container, width, height);
      // Model ImageLib's SYNC_DECODE: actual malformed pixel data fails even
      // when metadata width/height were available. This uses Node's real zlib.
      const count = (container.width * container.channels + 1) * container.height;
      const pixels = inflateSync(container.compressed, { maxOutputLength: count });
      assert.equal(pixels.length, count);
      const output = overrides.output ? overrides.output(ctx, width, height) : png(width, height);
      ctx.encoded = Buffer.from(output, 'base64').toString('binary');
      ctx.stream = { close() { calls.rawClose++; if (overrides.rawClose) return overrides.rawClose(ctx); } };
      return ctx.stream;
    },
  };
  const tools = {
    images,
    createReader() {
      calls.reader++;
      if (overrides.createReader) return overrides.createReader(ctx);
      let read = false;
      return {
        setInputStream(stream) { assert.equal(stream, ctx.stream); if (overrides.bind) return overrides.bind(ctx); },
        available() { return overrides.available ? overrides.available(ctx, read) : read ? 0 : ctx.encoded.length; },
        readBytes(length) { calls.read.push(length); read = true; return overrides.read ? overrides.read(ctx, length) : ctx.encoded; },
        close() { calls.close++; if (overrides.close) return overrides.close(ctx); ctx.stream.close(); },
      };
    },
  };
  const owner = createGeckoViewportPngBox({ loadTools: () => { calls.load++; return overrides.load ? overrides.load(ctx, tools) : tools; } });
  return { owner, calls, ctx, tools };
}

test('full static RGB/RGBA framing and contiguous split IDATs have independently generated CRCs', () => {
  for (const colorType of [2, 6]) {
    const parsed = parseViewportPng(png(7, 11, { colorType, split: 3 }));
    assert.equal(parsed.width, 7); assert.equal(parsed.height, 11); assert.equal(parsed.colorType, colorType); assert.equal(parsed.chunkCount, 4);
    assert.ok(Object.isFrozen(parsed));
  }
});

test('optional sRGB and DisplayP3 cICP is unique, pre-IDAT and narrowly validated', () => {
  for (const primaries of [1, 12]) assert.equal(parseViewportPng(png(1, 1, { before: [chunk('cICP', Buffer.from([primaries, 13, 0, 1]))] })).chunkCount, 4);
  const good = chunk('cICP', Buffer.from([1, 13, 0, 1]));
  for (const options of [{ before: [good, good] }, { after: [good] }, { before: [chunk('cICP', Buffer.from([1, 13, 0]))] },
    { before: [chunk('cICP', Buffer.from([1, 16, 0, 1]))] }, { before: [chunk('cICP', Buffer.from([1, 13, 1, 1]))] }]) throws(() => parseViewportPng(png(1, 1, options)));
});

test('unique first IHDR, actual IEND, no trailing bytes and complete lengths are mandatory', () => {
  const valid = Buffer.from(png(), 'base64');
  const failures = [Buffer.concat([SIG, chunk('IDAT', Buffer.from([1])), ihdr(), chunk('IEND')]),
    Buffer.concat([SIG, ihdr(), ihdr(), chunk('IDAT', Buffer.from([1])), chunk('IEND')]),
    valid.subarray(0, -12), valid.subarray(0, -1), Buffer.concat([valid, Buffer.from([0])]),
    Buffer.concat([valid, chunk('IEND')]), Buffer.concat([SIG, ihdr(), chunk('IDAT'), chunk('IEND')]),
    Buffer.concat([valid.subarray(0, -12), chunk('IEND', Buffer.from([0]))])];
  for (const bytes of failures) throws(() => parseViewportPng(bytes.toString('base64')));
  const declared = Buffer.from(valid); declared.writeUInt32BE(0xffffffff, 33); throws(() => parseViewportPng(declared.toString('base64')));
});

test('CRC of every allowed chunk is checked, including IDAT and IEND', () => {
  const valid = Buffer.from(png(1, 1, { before: [chunk('cICP', Buffer.from([1, 13, 0, 1]))] }), 'base64');
  let offset = 8;
  while (offset < valid.length) { const broken = Buffer.from(valid); const length = valid.readUInt32BE(offset); broken[offset + 8 + length] ^= 1;
    throws(() => parseViewportPng(broken.toString('base64'))); offset += 12 + length; }
});

test('unknown critical/ancillary, reserved-bit, palette/metadata and all APNG chunks refuse', () => {
  for (const type of ['ABCD', 'abCD', 'abcD', 'PLTE', 'tEXt', 'iCCP', 'deBG', 'acTL', 'fcTL', 'fdAT', 'A1CD']) {
    throws(() => parseViewportPng(png(1, 1, { before: [chunk(type, Buffer.from([1]))] })));
  }
});

test('allowed format is8bit RGB/RGBA noninterlaced default filter/compression only', () => {
  for (const options of [{ bitDepth: 16 }, { bitDepth: 4 }, { colorType: 0 }, { colorType: 3 }, { colorType: 4 },
    { colorType: 1 }, { compression: 1 }, { filter: 1 }, { interlace: 1 }]) throws(() => parseViewportPng(png(1, 1, options)));
  throws(() => parseViewportPng(Buffer.concat([SIG, ihdr(1, 1).subarray(0, -1)]).toString('base64')));
});

test('raw dimensions/pixels/bytes and chunk count cap before any native load', async () => {
  for (const dimensions of [[0, 1], [1, 16385], [16384, 16384]]) {
    const source = Buffer.concat([SIG, ihdr(...dimensions), chunk('IDAT', Buffer.from([1])), chunk('IEND')]).toString('base64');
    throws(() => parseViewportPng(source), 'TOO_LARGE');
    const f = nativeFixture(); await rejects(f.owner.validatePng(image(source)), 'TOO_LARGE'); assert.equal(f.calls.load, 0);
  }
  const parts = [SIG, ihdr(), ...Array.from({ length: 1023 }, () => chunk('IDAT', Buffer.from([1]))), chunk('IEND')];
  throws(() => parseViewportPng(Buffer.concat(parts).toString('base64')), 'TOO_LARGE');
  const huge = 'A'.repeat(4 * Math.ceil(2097152 / 3) + 4); let decoded = 0;
  throws(() => parseViewportPng(huge, { decode() { decoded++; return ''; } }), 'TOO_LARGE'); assert.equal(decoded, 0);
});

test('base64 padding bits, alphabet, size and binary decoder result are checked', () => {
  for (const data of ['AAAA===', 'AAAA\n', 'AAA_', 'AB==', 'AAB=', 'AAA=AAAA', 'AAAA====']) assert.throws(() => parseViewportPng(data));
  const source = png(); throws(() => parseViewportPng(source, { decode: () => '\u0100'.repeat(Buffer.from(source, 'base64').length) }));
  throws(() => parseViewportPng(source, { decode: () => '' }));
});

test('boxing uses both sides, preserves no upscale, and permits portrait output below64', () => {
  assert.deepEqual(fitViewportPngBox({ width: 100, height: 4000, max_width: 1280, max_height: 1280 }), { width: 32, height: 1280 });
  assert.deepEqual(fitViewportPngBox({ width: 17, height: 23, max_width: 1280, max_height: 1280 }), { width: 17, height: 23 });
  assert.deepEqual(fitViewportPngBox({ width: 4000, height: 100, max_width: 1280, max_height: 1280 }), { width: 1280, height: 32 });
});

test('validation forces same-size SYNC_DECODE encoder and checks actual input/output decode dimensions', async () => {
  const f = nativeFixture(); assert.equal(await f.owner.validatePng(image(png(7, 11))), true);
  assert.equal(f.calls.decode, 2); assert.deepEqual(f.calls.scale, [{ width: 7, height: 11 }]); assert.equal(f.calls.close, 1);
  assert.equal(f.owner.getState().retained_streams, 0);
  const g = nativeFixture({ decode: () => ({ width: 2, height: 1 }) });
  await rejects(g.owner.validatePng(image()), 'UNAVAILABLE'); assert.equal(g.calls.scale.length, 0);
  const h = nativeFixture({ decode: (ctx, buffer) => ({ width: ctx.calls.decode === 2 ? 2 : Buffer.from(buffer).readUInt32BE(16), height: 1,
    channels: 4, compressed: deflateSync(Buffer.alloc(5)) }) });
  await rejects(h.owner.validatePng(image()), 'UNAVAILABLE'); assert.equal(h.calls.close, 1);
});

test('CRC-correct framing with corrupted compressed pixels fails native full decode', async () => {
  const source = png(1, 1, { compressed: Buffer.from([1, 2, 3, 4]) });
  assert.equal(parseViewportPng(source).width, 1); const f = nativeFixture();
  await rejects(f.owner.validatePng(image(source)), 'UNAVAILABLE'); assert.equal(f.calls.scale.length, 1); assert.equal(f.calls.reader, 0);
});

test('both exact target dimensions are passed to ImageLib for tall and wide screens', async () => {
  for (const [width, height] of [[100, 4000], [4000, 100]]) {
    const f = nativeFixture(); const input = sized(png(width, height), 1280, 1280); const result = await f.owner.resizePng(input);
    const parsed = parseViewportPng(result.data_base64);
    assert.equal(parsed.width, input.target_width); assert.equal(parsed.height, input.target_height);
    assert.ok(parsed.width <= 1280 && parsed.height <= 1280 && parsed.decodedBytes <= 1048576);
    assert.deepEqual(f.calls.scale, [{ width: input.target_width, height: input.target_height }]); assert.equal(f.calls.close, 1);
  }
});

test('forged targets, upscale, claimed dimensions and accessor facts cause no native load', async () => {
  for (const changes of [{ target_width: 1281 }, { target_height: 1281 }, { width: 999 }, { decodedBytes: 9 }, { max_bytes: 2097153 }]) {
    const f = nativeFixture(); await rejects(f.owner.resizePng(Object.freeze({ ...sized(png(100, 4000), 1280, 1280), ...changes })), 'INVALID_PARAMS'); assert.equal(f.calls.load, 0);
  }
  const f = nativeFixture(); let reads = 0; const source = { mime: 'image/png', get data_base64() { reads++; return png(); } };
  await rejects(f.owner.validatePng(source), 'INVALID_PARAMS'); assert.equal(reads, 0); assert.equal(f.calls.load, 0);
});

test('output byte budget prevents oversized reads and output chunks/dimensions are revalidated', async () => {
  const large = nativeFixture({ available: (_ctx, read) => read ? 0 : 1048577 });
  await rejects(large.owner.resizePng(sized(png(100, 4000), 1280, 1280)), 'TOO_LARGE'); assert.deepEqual(large.calls.read, []); assert.equal(large.calls.close, 1);
  for (const output of [() => png(33, 1280), () => Buffer.concat([Buffer.from(png(32, 1280), 'base64'), Buffer.from([1])]).toString('base64'),
    () => { const bytes = Buffer.from(png(32, 1280), 'base64'); bytes.at(-1); bytes[bytes.length - 1] ^= 1; return bytes.toString('base64'); }]) {
    const f = nativeFixture({ output }); await rejects(f.owner.resizePng(sized(png(100, 4000), 1280, 1280)), 'UNAVAILABLE'); assert.equal(f.calls.close, 1);
  }
});

test('short reads, trailing available bytes and native decoder/encoder failures never return an image', async () => {
  for (const overrides of [{ read: ctx => ctx.encoded.slice(1) }, { available: (ctx, read) => read ? 1 : ctx.encoded.length },
    { decode: () => { throw new Error('native diagnostic hidden'); } }, { scale: () => { throw new Error('native diagnostic hidden'); } }]) {
    const f = nativeFixture(overrides); await rejects(f.owner.validatePng(image()), 'UNAVAILABLE');
  }
});

test('failed binary stream close retains exact ownership and explicit close retries', async () => {
  const f = nativeFixture({ close: ctx => { if (ctx.calls.close === 1) throw new Error('close failure'); ctx.stream.close(); } });
  await rejects(f.owner.validatePng(image()), 'UNAVAILABLE'); assert.equal(f.owner.getState().retained_streams, 1);
  await rejects(f.owner.validatePng(image()), 'UNAVAILABLE'); assert.equal(f.calls.load, 1);
  assert.equal(f.owner.close(), true); assert.equal(f.calls.close, 2); assert.equal(f.owner.getState().retained_streams, 0);
  await rejects(f.owner.validatePng(image()), 'NOT_APPROVED');
});

test('reader creation or binding failure still closes the exact raw stream', async () => {
  for (const overrides of [{ createReader: () => { throw new Error('constructor failed'); } }, { bind: () => { throw new Error('binding failed'); } }]) {
    const f = nativeFixture(overrides); await rejects(f.owner.validatePng(image()), 'UNAVAILABLE');
    assert.equal(f.calls.rawClose, 1); assert.equal(f.owner.getState().retained_streams, 0);
  }
});

test('abort/owner-close during async native service loading prevents all decode/scale effects', async () => {
  for (const action of ['abort', 'close']) {
    const loading = deferred(); const external = new AbortController(); const f = nativeFixture({ load: () => loading.promise });
    const work = f.owner.validatePng(image(), { signal: external.signal });
    if (action === 'abort') external.abort(); else throws(() => f.owner.close());
    loading.resolve(f.tools); await rejects(work, 'NOT_APPROVED'); assert.equal(f.calls.decode, 0); assert.equal(f.calls.reader, 0);
    assert.equal(f.owner.getState().busy, false); if (action === 'close') assert.equal(f.owner.close(), true);
  }
});

test('diagnostics are categorical and never read/decode/encode/close native resources', async () => {
  const f = nativeFixture(); const before = structuredClone(f.calls);
  for (let count = 0; count < 100; count++) assert.ok(Object.isFrozen(f.owner.getState())); assert.deepEqual(f.calls, before);
});

test('capture lease composes full PNG validation and boxing for decision/handoff while original bridge min remains64', async () => {
  for (const purpose of ['decision', 'handoff']) {
    const f = nativeFixture(); const expected = Object.freeze({ tab_id: 't_1' }); const lease = Object.freeze({ private: true }); let retired = false;
    const owner = createAgentViewportCapture({
      isActive: value => value === expected,
      beginReadLease: () => lease,
      validateReadLease: value => value === lease && !retired,
      releaseReadLease: () => { retired = true; return true; },
      createNativeReadSession: () => Object.freeze({ capabilities: Object.freeze({ viewportScreenshot: true, act: false, open: false }),
        capture: () => ({ data_base64: png(100, 4000) }), close() {} }),
      validatePng: f.owner.validatePng, resizePng: f.owner.resizePng, setTimer: setTimeout, clearTimer: clearTimeout,
    });
    const result = await owner.captureViewport({ tab_id: 't_1', expected, purpose });
    const parsed = parseViewportPng(result.data_base64); assert.equal(parsed.width, 32); assert.equal(parsed.height, 1280);
    assert.ok(parsed.decodedBytes <= 1048576); assert.ok(retired);
    await rejects(owner.captureViewport({ tab_id: 't_1', expected, purpose: 'bridge', max_width: 63 }), 'INVALID_PARAMS');
    assert.equal(await owner.close(), true); assert.equal(f.owner.close(), true);
  }
});
