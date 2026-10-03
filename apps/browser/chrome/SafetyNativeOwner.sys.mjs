/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// DOM-free parent-process composition boundary. Native capabilities are injected;
// importing/constructing this registry performs no I/O or preference discovery.
export const SAFETY_DIRECTORY_LEAF = 'axiosozo-safety';
const WRITERS = new Map();
const fail = code => { const error = new Error(code); error.code = code; throw error; };
const absolute = path => typeof path === 'string' && path.length > 1 && path.length <= 4096
  && path.startsWith('/') && !path.endsWith('/') && !/[\u0000-\u001f\u007f]/u.test(path)
  && !path.split('/').slice(1).some(part => !part || part === '.' || part === '..');

/** gate: real parent/startup/profile/lifecycle facts, not a caller-selected path.
 * files(path): fresh nsIFile; isMissing: fixed native error-result comparison.
 * createStorage: reviewed createSafetyAtomicStorage; never profileStorage.
 * The process profile-lock protocol excludes cooperating Gecko instances, not
 * arbitrary same-UID tools. This is metadata admission, not an openat boundary.
 */
export function createSafetyNativeOwnerRegistry({ gate, files, isMissing, io, paths, createStorage } = {}) {
  if (!['parent', 'profileDir', 'lockTime', 'shuttingDown', 'attemptingQuit'].every(name => typeof gate?.[name] === 'function')
    || typeof files !== 'function' || typeof isMissing !== 'function' || typeof createStorage !== 'function'
    || typeof paths?.join !== 'function' || !['stat', 'read', 'writeUTF8', 'makeDirectory'].every(name => typeof io?.[name] === 'function'))
    fail('INVALID_SAFETY_NATIVE_OWNER');
  let revoked = false;
  function profile() {
    if (revoked || gate.parent() !== true || gate.shuttingDown() !== false || gate.attemptingQuit() !== false)
      fail('SAFETY_PROFILE_AUTHORITY_LOST');
    const lockTime = gate.lockTime();
    // Native replacedLockTime is a startup-lock existence probe, not a held-lock
    // boolean. Lifetime comes from normal startup and synchronous revocation.
    if (!Number.isSafeInteger(lockTime) || lockTime < 0) fail('SAFETY_PROFILE_AUTHORITY_LOST');
    const path = gate.profileDir();
    if (!absolute(path)) fail('SAFETY_PROFILE_UNVERIFIED');
    directory(path, false);
    return path;
  }
  function present(path) {
    const file = files(path);
    try { if (file.isSymlink() !== false) fail('SAFETY_PATH_UNVERIFIED'); }
    catch (error) { if (isMissing(error) === true) return null; throw error; }
    const canonical = file.clone(); canonical.normalize();
    if (canonical.path !== path) fail('SAFETY_PATH_UNVERIFIED');
    return file;
  }
  function directory(path, privateMode) {
    const file = present(path);
    if (!file || file.isDirectory() !== true || (privateMode && (file.permissions & 0o777) !== 0o700))
      fail('SAFETY_DIRECTORY_UNVERIFIED');
    return file;
  }
  function leaf(path) {
    const file = present(path);
    if (file && file.isFile() !== true) fail('SAFETY_LEAF_UNVERIFIED');
  }
  return Object.freeze({
    revoke() { revoked = true; },
    async acquire() {
      const profilePath = profile(), root = paths.join(profilePath, SAFETY_DIRECTORY_LEAF);
      if (root !== `${profilePath}/${SAFETY_DIRECTORY_LEAF}`) fail('SAFETY_PATH_UNVERIFIED');
      if (WRITERS.has(root)) fail('SAFETY_WRITER_BUSY');
      const token = {}; WRITERS.set(root, token); // reserve before the first await
      let closing = false, dead = false, closeTask = null;
      const pending = new Set();
      function held() {
        try { return !dead && WRITERS.get(root) === token && profile() === profilePath; } catch { return false; }
      }
      function check() { if (!held()) fail('SAFETY_WRITER_LEASE_LOST'); }
      function metadata() {
        check(); directory(root, true);
        leaf(`${root}/safety-owner.json`); leaf(`${root}/safety-owner.json.tmp`);
      }
      let storage;
      try {
        check();
        // Refuse an existing alias/non-directory before ignoreExisting can accept it.
        const existing = present(root);
        if (existing) directory(root, true);
        await io.makeDirectory(root, { createAncestors: false, ignoreExisting: true, permissions: 0o700 });
        metadata();
        const raw = createStorage({ io, paths, root, rootAssurance: 'CANONICAL_PRIVATE_STABLE' });
        if (raw?.assurance !== 'ATOMIC_FLUSHED' || raw.path !== `${root}/safety-owner.json`
          || typeof raw.read !== 'function' || typeof raw.write !== 'function') fail('INVALID_SAFETY_STORAGE');
        storage = Object.freeze({ assurance: raw.assurance, rootAssurance: raw.rootAssurance, path: raw.path,
          async read() { metadata(); const value = await raw.read(); check(); return value; },
          async write(text) { metadata(); await raw.write(text); check(); },
        });
      } catch (error) {
        dead = true; if (WRITERS.get(root) === token) WRITERS.delete(root); throw error;
      }
      function run(operation) {
        if (closing || dead) return Promise.reject(Object.assign(new Error('SAFETY_OWNER_CLOSED'), { code: 'SAFETY_OWNER_CLOSED' }));
        if (typeof operation !== 'function') return Promise.reject(new TypeError('operation'));
        const task = Promise.resolve().then(() => { check(); return operation(); });
        pending.add(task); task.then(() => pending.delete(task), () => pending.delete(task));
        return task;
      }
      function close(cleanup) {
        if (dead) return Promise.resolve(true);
        if (typeof cleanup !== 'function') return Promise.reject(new TypeError('cleanup'));
        closing = true;
        if (closeTask) return closeTask;
        closeTask = (async () => {
          await Promise.allSettled([...pending]);
          // Failed observer disposal retains reservation, even after shutdown.
          if (cleanup() !== true) fail('SAFETY_NATIVE_CLEANUP_REQUIRED');
          dead = true; if (WRITERS.get(root) === token) WRITERS.delete(root);
          return true;
        })();
        closeTask.catch(() => { closeTask = null; });
        return closeTask;
      }
      return Object.freeze({ storage, assertExclusiveWriter: held, run, close });
    },
  });
}
