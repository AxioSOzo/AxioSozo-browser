/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// No native imports, DOM, process creation or filesystem access.
// Gecko InputPipe.read() with no arguments returns ArrayBuffer; only an empty
// raw buffer means EOF. A nonempty UTF-8 lead-byte chunk can decode to "".
export class SubprocessUtf8Error extends Error {
  constructor(code) { super(code); this.name = "SubprocessUtf8Error"; this.code = code; }
}
const fault = code => new SubprocessUtf8Error(code);
const bufferLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
function rawLength(value) {
  try { return Reflect.apply(bufferLength, value, []); } catch { throw fault("INVALID_PIPE_BYTES"); }
}

/**
 * read() -> { text, byteLength, bytes: Uint8Array } | null (real raw EOF).
 * maxBytes is an optional aggregate raw-byte cap, including BOM/newline bytes.
 * onBytes(bytes) is synchronous, must return undefined and runs BEFORE decode;
 * throwing stops this reader. It supports a caller's per-frame byte budget.
 * Call read serially; concurrent reads reject. After failure, reads keep failing.
 * The owner closes/terminates its process to release a pending native read.
 */
export function createSubprocessUtf8Reader(pipe, { maxBytes = null, onBytes = null } = {}) {
  if (typeof pipe?.read !== "function") throw fault("INVALID_PIPE");
  if (maxBytes !== null && (!Number.isSafeInteger(maxBytes) || maxBytes < 0)) throw fault("INVALID_LIMIT");
  if (onBytes !== null && typeof onBytes !== "function") throw fault("INVALID_OBSERVER");
  const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
  let total = 0, reading = false, ended = false, failed = false, failure;
  async function read() {
    if (failed) throw failure;
    if (reading) throw fault("CONCURRENT_READ");
    if (ended) return null;
    reading = true;
    try {
      let buffer;
      try { buffer = await pipe.read(); } catch { throw fault("PIPE_READ_FAILED"); }
      let bytes;
      try {
        rawLength(buffer); // Native brand-check; no caller accessors or toStringTag.
        bytes = new Uint8Array(buffer);
      } catch { throw fault("INVALID_PIPE_BYTES"); }
      if (bytes.byteLength === 0) {
        try { decoder.decode(); } catch { throw fault("INVALID_UTF8"); }
        ended = true;
        return null;
      }
      total += bytes.byteLength;
      if (!Number.isSafeInteger(total) || maxBytes !== null && total > maxBytes) throw fault("OUTPUT_LIMIT");
      if (onBytes) {
        const returned = onBytes(bytes);
        if (returned !== undefined) {
          // Rejected async observers must not leak an unhandled rejection.
          if (returned && typeof returned.then === "function") Promise.resolve(returned).catch(() => {});
          throw fault("INVALID_OBSERVER");
        }
      }
      let text;
      try { text = decoder.decode(bytes, { stream: true }); } catch { throw fault("INVALID_UTF8"); }
      return Object.freeze({ text, byteLength: bytes.byteLength, bytes });
    } catch (error) { failed = true; failure = error; throw error; }
    finally { reading = false; }
  }
  return Object.freeze({ read, get bytesRead() { return total; } });
}
