// Preparation only. Immutable PNG byte framing and numeric sizing; no native/UI effects.
import { AgentToolError } from './GeckoBiDiReadSession.sys.mjs';
const fail = code => { throw new AgentToolError(code); };
export const VIEWPORT_PNG_LIMITS = Object.freeze({ bytes: 2_097_152, dimension: 16_384,
  pixels: 33_554_432, chunks: 1024 });
const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const CRC_TABLE = new Uint32Array(256);
for (let value = 0; value < 256; value++) {
  let crc = value;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  CRC_TABLE[value] = crc >>> 0;
}
function crc32(bytes, start, end) {
  let crc = 0xffffffff;
  for (let index = start; index < end; index++) crc = CRC_TABLE[(crc ^ bytes[index]) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
const u32 = (bytes, index) => bytes[index] * 0x1000000 + bytes[index + 1] * 0x10000
  + bytes[index + 2] * 0x100 + bytes[index + 3];
function base64Bytes(data, decode, maxBytes) {
  if (typeof data !== 'string' || data.length === 0 || data.length > 4 * Math.ceil(maxBytes / 3)
      || data.length % 4 !== 0) fail('TOO_LARGE');
  const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
  for (let index = 0; index < data.length - padding; index++) {
    const value = data.charCodeAt(index);
    if (!((value >= 65 && value <= 90) || (value >= 97 && value <= 122)
        || (value >= 48 && value <= 57) || value === 43 || value === 47)) fail('UNAVAILABLE');
  }
  const size = data.length / 4 * 3 - padding;
  if (size > maxBytes) fail('TOO_LARGE');
  if ((padding === 2 && (BASE64.indexOf(data.at(-3)) & 15) !== 0)
      || (padding === 1 && (BASE64.indexOf(data.at(-2)) & 3) !== 0)) fail('UNAVAILABLE');
  let binary;
  try { binary = decode(data); } catch { fail('UNAVAILABLE'); }
  if (typeof binary !== 'string' || binary.length !== size) fail('UNAVAILABLE');
  const bytes = new Uint8Array(size);
  for (let index = 0; index < size; index++) {
    const value = binary.charCodeAt(index);
    if (value > 255) fail('UNAVAILABLE');
    bytes[index] = value;
  }
  return bytes;
}

/**
 * Entire bounded framing, not only IHDR. Initial native viewport scope is static
 * 8-bit RGB/RGBA, non-interlaced, default compression/filter; optional sRGB/P3
 * cICP before contiguous IDATs. All other metadata, palette/HDR/APNG and unknown
 * chunks refuse. ImageLib must additionally decode actual pixels/dimensions.
 */
export function parseViewportPng(data, { decode = globalThis.atob,
  maxBytes = VIEWPORT_PNG_LIMITS.bytes, maxChunks = VIEWPORT_PNG_LIMITS.chunks } = {}) {
  if (typeof decode !== 'function' || !Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > VIEWPORT_PNG_LIMITS.bytes
      || !Number.isInteger(maxChunks) || maxChunks < 3 || maxChunks > VIEWPORT_PNG_LIMITS.chunks) throw new TypeError('PNG limits');
  const bytes = base64Bytes(data, decode, maxBytes);
  if (bytes.length < 57 || SIGNATURE.some((value, index) => bytes[index] !== value)) fail('UNAVAILABLE');
  let offset = 8, chunks = 0, width, height, colorType, dataBytes = 0, dataSeen = false, cicp = false;
  while (offset < bytes.length) {
    if (++chunks > maxChunks) fail('TOO_LARGE');
    if (bytes.length - offset < 12) fail('UNAVAILABLE');
    const length = u32(bytes, offset);
    if (length > bytes.length - offset - 12) fail('UNAVAILABLE');
    let type = '';
    for (let index = offset + 4; index < offset + 8; index++) {
      const character = bytes[index];
      if (!((character >= 65 && character <= 90) || (character >= 97 && character <= 122))) fail('UNAVAILABLE');
      type += String.fromCharCode(character);
    }
    if (bytes[offset + 6] < 65 || bytes[offset + 6] > 90) fail('UNAVAILABLE');
    const start = offset + 8, end = start + length;
    if (crc32(bytes, offset + 4, end) !== u32(bytes, end)) fail('UNAVAILABLE');
    if (chunks === 1 && type !== 'IHDR') fail('UNAVAILABLE');
    if (type === 'IHDR') {
      if (chunks !== 1 || length !== 13) fail('UNAVAILABLE');
      width = u32(bytes, start); height = u32(bytes, start + 4); colorType = bytes[start + 9];
      if (width < 1 || height < 1 || width > VIEWPORT_PNG_LIMITS.dimension || height > VIEWPORT_PNG_LIMITS.dimension
          || width * height > VIEWPORT_PNG_LIMITS.pixels) fail('TOO_LARGE');
      if (bytes[start + 8] !== 8 || ![2, 6].includes(colorType) || bytes[start + 10] !== 0
          || bytes[start + 11] !== 0 || bytes[start + 12] !== 0) fail('UNAVAILABLE');
    } else if (type === 'cICP') {
      if (cicp || dataSeen || length !== 4 || ![1, 12].includes(bytes[start])
          || bytes[start + 1] !== 13 || bytes[start + 2] !== 0 || bytes[start + 3] !== 1) fail('UNAVAILABLE');
      cicp = true;
    } else if (type === 'IDAT') {
      dataSeen = true; dataBytes += length;
    } else if (type === 'IEND') {
      if (!dataSeen || dataBytes === 0 || length !== 0 || end + 4 !== bytes.length) fail('UNAVAILABLE');
      return Object.freeze({ width, height, decodedBytes: bytes.length, bitDepth: 8, colorType,
        chunkCount: chunks, bytes });
    } else {
      // Unknown critical AND ancillary types refuse. This is a native viewport
      // format allowlist, never a generic PNG reader with metadata passthrough.
      fail('UNAVAILABLE');
    }
    offset = end + 4;
  }
  fail('UNAVAILABLE'); // Missing IEND.
}

export function fitViewportPngBox({ width, height, max_width, max_height }) {
  if (![width, height, max_width, max_height].every(Number.isInteger)
      || width < 1 || height < 1 || width > VIEWPORT_PNG_LIMITS.dimension || height > VIEWPORT_PNG_LIMITS.dimension
      || width * height > VIEWPORT_PNG_LIMITS.pixels || max_width < 1 || max_width > 1920
      || max_height < 1 || max_height > VIEWPORT_PNG_LIMITS.dimension) fail('INVALID_PARAMS');
  const scale = Math.min(1, max_width / width, max_height / height);
  return Object.freeze({ width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)) });
}
