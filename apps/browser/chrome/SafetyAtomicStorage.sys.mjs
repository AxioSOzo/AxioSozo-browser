/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Injected IOUtils adapter for one closed owner-store leaf. Construction is
// path computation only. The caller supplies an app-owned stable canonical
// directory, never an arbitrary page/user/provider path.
export const SAFETY_STORE_LEAF = 'safety-owner.json';
export const SAFETY_STORE_CAP = 65536;
const fail = code => { const e = new Error(code); e.code = code; throw e; };
export function createSafetyAtomicStorage({ io, paths, root, rootAssurance } = {}) {
  if (!['read', 'writeUTF8', 'stat', 'makeDirectory'].every(k => typeof io?.[k] === 'function') || typeof paths?.join !== 'function'
    || rootAssurance !== 'CANONICAL_PRIVATE_STABLE' || typeof root !== 'string' || root.length < 2 || root.length > 4096
    || !root.startsWith('/') || root.endsWith('/') || /[\u0000-\u001f\u007f]/u.test(root)
    || root.split('/').some(segment => segment === '.' || segment === '..')) fail('INVALID_SAFETY_STORAGE');
  const path = paths.join(root, SAFETY_STORE_LEAF), tmpPath = paths.join(root, `${SAFETY_STORE_LEAF}.tmp`);
  if (path !== `${root}/${SAFETY_STORE_LEAF}` || tmpPath !== `${root}/${SAFETY_STORE_LEAF}.tmp`) fail('INVALID_SAFETY_STORAGE_PATH');
  async function verifyRoot() {
    const info = await io.stat(root);
    if (info.type !== 'directory' || !Number.isInteger(info.permissions) || (info.permissions & 0o777) !== 0o700) fail('SAFETY_STORAGE_ROOT_UNVERIFIED');
  }
  async function provisionRoot() {
    // Existing directories are verified; ignoreExisting does not fix their mode.
    await io.makeDirectory(root, { createAncestors: false, ignoreExisting: true, permissions: 0o700 });
    await verifyRoot();
  }
  async function read() {
    await verifyRoot();
    let info;
    try { info = await io.stat(path); }
    catch (e) { if (e?.name === 'NotFoundError') return null; throw e; }
    if (info.type !== 'regular' || !Number.isSafeInteger(info.size) || info.size < 0) fail('INVALID_SAFETY_STORE_FILE');
    if (info.size > SAFETY_STORE_CAP) fail('STORE_TOO_LARGE');
    // After a successful regular-file stat, ANY read failure is propagated.
    // The read cap also protects against growth after stat.
    const bytes = await io.read(path, { maxBytes: SAFETY_STORE_CAP + 1 });
    if (!ArrayBuffer.isView(bytes) || Object.prototype.toString.call(bytes) !== '[object Uint8Array]' || bytes.byteLength > SAFETY_STORE_CAP) fail('STORE_TOO_LARGE');
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { fail('INVALID_STORE'); }
  }
  async function write(text) {
    if (typeof text !== 'string') fail('INVALID_SAFETY_STORE_TEXT');
    const byteLength = new TextEncoder().encode(text).byteLength;
    if (byteLength > SAFETY_STORE_CAP) fail('STORE_TOO_LARGE');
    await verifyRoot();
    // Same-directory temp => same-filesystem replacement under the trusted
    // stable-root contract. flush:true requests synchronized FILE writes;
    // the pinned implementation does not fsync the renamed parent directory.
    const written = await io.writeUTF8(path, text, { tmpPath, mode: 'overwrite', flush: true });
    if (written !== byteLength) fail('SAFETY_STORE_ACK_MISMATCH');
  }
  return Object.freeze({ assurance: 'ATOMIC_FLUSHED', rootAssurance: 'CANONICAL_PRIVATE_STABLE', path, read, write, provisionRoot });
}
