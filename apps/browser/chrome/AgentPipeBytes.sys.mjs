/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

const unavailable = () => Object.assign(new Error("EXACT_SOCKET_METADATA_UNAVAILABLE"), { code: "EXACT_SOCKET_METADATA_UNAVAILABLE" });
const bufferLength = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
// Native InputPipe.read() returns ArrayBuffer; zero bytes is actual EOF.
// Never use decoded readString()==="" as EOF: a nonempty UTF-8 prefix can
// decode to an empty string. stderr is counted/discarded as raw bytes.
export async function readAgentPipe(pipe, { limit = 512, keep = false, assertLive = () => {} } = {}) {
  if (typeof pipe?.read !== "function" || !Number.isSafeInteger(limit) || limit < 1 || limit > 512) throw unavailable();
  let output = "", size = 0;
  for (;;) {
    const buffer = await pipe.read();
    assertLive();
    let bytes;
    try {
      Reflect.apply(bufferLength, buffer, []); // Real ArrayBuffer brand, including another realm.
      bytes = new Uint8Array(buffer);
    } catch { throw unavailable(); }
    if (bytes.byteLength === 0) break;
    size += bytes.byteLength;
    if (size > limit) throw unavailable();
    if (keep) {
      // Only numeric Apple id/stat stdout is retained. Its protocol is ASCII,
      // so non-ASCII output is refused rather than interpreted/repaired.
      if (bytes.some(value => value > 0x7f)) throw unavailable();
      output += String.fromCharCode(...bytes);
    }
  }
  return output;
}
