// Preparation only. ImageLib byte processing, no DOM/canvas/document or capture.
import { AgentToolError } from './GeckoBiDiReadSession.sys.mjs';
import { parseViewportPng, fitViewportPngBox, VIEWPORT_PNG_LIMITS } from './ViewportPngFormat.sys.mjs';
const fail = code => { throw new AgentToolError(code); };
const record = value => value !== null && typeof value === 'object';
const safeError = error => error instanceof AgentToolError && ['NOT_APPROVED', 'TOO_LARGE', 'INVALID_PARAMS', 'BUSY', 'UNAVAILABLE'].includes(error.code)
  ? error : new AgentToolError('UNAVAILABLE');
function data(image, name, optional = false) {
  const field = record(image) && Object.getOwnPropertyDescriptor(image, name);
  if (!field && optional) return undefined;
  if (!field || !('value' in field)) fail('INVALID_PARAMS');
  return field.value;
}

/**
 * Injection-compatible validatePng and resizePng for AgentViewportCapture.
 * loadTools returns trusted {images:imgITools, createReader:nsIBinaryInputStream}.
 * Native image/stream methods are synchronous. Loading may be async; all native
 * methods are called only after a live signal/owner check. No native defaults.
 */
export function createGeckoViewportPngBox({ loadTools, decode = globalThis.atob,
  encode = globalThis.btoa } = {}) {
  if (![loadTools, decode, encode].every(fn => typeof fn === 'function')) throw new TypeError('trusted PNG callbacks');
  const retained = new Set();
  let closed = false, busy = false;
  const live = signal => { if (closed || signal?.aborted) fail('NOT_APPROVED'); };
  function retire(claim) {
    if (!retained.has(claim)) return;
    const owned = claim.bound ? claim.reader : claim.stream;
    const result = owned.close();
    if (result !== undefined && result !== true) fail('UNAVAILABLE');
    retained.delete(claim);
  }
  function nativeDimensions(container, expected) {
    if (!container || container.width !== expected.width || container.height !== expected.height) fail('UNAVAILABLE');
  }
  function synchronous(value) {
    if (value && typeof value.then === 'function') fail('UNAVAILABLE');
    return value;
  }
  function nativeEncode(tools, container, width, height, cap, signal) {
    live(signal);
    const stream = synchronous(tools.images.encodeScaledImage(container, 'image/png', width, height));
    if (!record(stream)) fail('UNAVAILABLE');
    const claim = { stream, reader: null, bound: false };
    retained.add(claim);
    try {
      live(signal);
      claim.reader = synchronous(tools.createReader());
      if (!record(claim.reader)) fail('UNAVAILABLE');
      synchronous(claim.reader.setInputStream(stream));
      claim.bound = true;
      const length = synchronous(claim.reader.available());
      if (!Number.isInteger(length) || length < 57 || length > cap) fail('TOO_LARGE');
      const binary = synchronous(claim.reader.readBytes(length));
      if (typeof binary !== 'string' || binary.length !== length || synchronous(claim.reader.available()) !== 0) fail('UNAVAILABLE');
      for (let index = 0; index < binary.length; index++) if (binary.charCodeAt(index) > 255) fail('UNAVAILABLE');
      live(signal);
      const encoded = encode(binary);
      const parsed = parseViewportPng(encoded, { decode, maxBytes: cap });
      if (parsed.width !== width || parsed.height !== height) fail('UNAVAILABLE');
      // Native decoded dimensions are independent of the returned IHDR claims.
      const actual = synchronous(tools.images.decodeImageFromArrayBuffer(parsed.bytes.buffer, 'image/png'));
      nativeDimensions(actual, parsed);
      live(signal);
      return encoded;
    } finally {
      // Positive actual close completion only. A failed close retains the exact
      // stream/reader for explicit owner.close retry; no image result escapes.
      retire(claim);
    }
  }
  async function process(image, resize, { signal } = {}) {
    live(signal);
    if (busy) fail('BUSY');
    if (retained.size !== 0) fail('UNAVAILABLE');
    if (data(image, 'mime') !== 'image/png') fail('INVALID_PARAMS');
    const parsed = parseViewportPng(data(image, 'data_base64'), { decode });
    for (const key of ['width', 'height', 'decodedBytes']) {
      const claimed = data(image, key, true);
      if (claimed !== undefined && claimed !== parsed[key]) fail('INVALID_PARAMS');
    }
    let desired = { width: parsed.width, height: parsed.height }, cap = VIEWPORT_PNG_LIMITS.bytes;
    if (resize) {
      const max_width = data(image, 'max_width'), max_height = data(image, 'max_height');
      cap = data(image, 'max_bytes');
      if (!Number.isInteger(cap) || cap < 1 || cap > VIEWPORT_PNG_LIMITS.bytes) fail('INVALID_PARAMS');
      desired = fitViewportPngBox({ width: parsed.width, height: parsed.height, max_width, max_height });
      if (data(image, 'target_width') !== desired.width || data(image, 'target_height') !== desired.height) fail('INVALID_PARAMS');
    }
    busy = true;
    try {
      const tools = await loadTools();
      live(signal);
      if (typeof tools?.images?.decodeImageFromArrayBuffer !== 'function'
          || typeof tools?.images?.encodeScaledImage !== 'function' || typeof tools?.createReader !== 'function') fail('UNAVAILABLE');
      const container = synchronous(tools.images.decodeImageFromArrayBuffer(parsed.bytes.buffer, 'image/png'));
      nativeDimensions(container, parsed);
      live(signal);
      // Even validation performs a same-size encode: imgTools forces SYNC_DECODE
      // of actual pixels. Metadata width/height alone never proves pixel decode.
      const output = nativeEncode(tools, container, desired.width, desired.height, cap, signal);
      live(signal);
      return resize ? Object.freeze({ data_base64: output }) : true;
    } catch (error) { live(signal); throw safeError(error); }
    finally { busy = false; }
  }
  return Object.freeze({
    validatePng: (image, options) => process(image, false, options),
    resizePng: (image, options) => process(image, true, options),
    close() {
      closed = true;
      let failed = false;
      for (const claim of [...retained]) { try { retire(claim); } catch { failed = true; } }
      if (failed || busy || retained.size !== 0) fail('UNAVAILABLE');
      return true;
    },
    getState: () => Object.freeze({ closed, busy, retained_streams: retained.size, cleanup_incomplete: busy || retained.size !== 0 }),
  });
}
