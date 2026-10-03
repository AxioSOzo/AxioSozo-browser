/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { validateManifest } from './contexts/schema.mjs';
import { serializeManifest } from './contexts/manifest.mjs';
import { createSubprocessUtf8Reader } from './SubprocessUtf8.sys.mjs';

const encoder = new TextEncoder();
// Pinned Gecko SubprocessConstants.ERROR_END_OF_FILE.
const NATIVE_END_OF_FILE = 0xff7a0001;
const CAP = 65536;
const fail = (code, committed = false) => Object.assign(new Error(code), { code, committed });
const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const exact = (v, keys) => plain(v) && Reflect.ownKeys(v).length === keys.length
  && keys.every(k => Object.hasOwn(Object.getOwnPropertyDescriptor(v, k) ?? {}, 'value'));
const identity = v => exact(v, ['device', 'inode']) && typeof v.device === 'string' && /^(?:0|[1-9][0-9]{0,19})$/u.test(v.device)
  && typeof v.inode === 'string' && /^[1-9][0-9]{0,19}$/u.test(v.inode);
const rootPath = v => typeof v === 'string' && v.startsWith('/') && v !== '/' && !v.endsWith('/') && !v.includes('//')
  && !v.includes('\\') && !/[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u.test(v) && encoder.encode(v).length <= 4096
  && !v.split('/').some(p => p === '.' || p === '..');
const digest = v => typeof v === 'string' && /^[a-f0-9]{64}$/u.test(v);
const clone = v => JSON.parse(JSON.stringify(v));
const freeze = v => { if (v && typeof v === 'object') { for (const item of Object.values(v)) freeze(item); Object.freeze(v); } return v; };
const equivalent = (left, right) => left === right || Array.isArray(left) && Array.isArray(right)
  && left.length === right.length && left.every((v, i) => equivalent(v, right[i]))
  || plain(left) && plain(right) && Object.keys(left).length === Object.keys(right).length
  && Object.keys(left).every(k => Object.hasOwn(right, k) && equivalent(left[k], right[k]));
const live = fn => { if (typeof fn !== 'function' || fn() !== true) throw fail('STALE_ACCEPTANCE'); };

export function acceptanceSnapshot(value) {
  if (!exact(value, ['rootIdentity', 'directoryIdentity', 'target', 'manifest']) || !identity(value.rootIdentity)
    || value.directoryIdentity !== null && !identity(value.directoryIdentity)
    || value.target !== null && (!identity(value.directoryIdentity) || !exact(value.target, ['identity', 'digest', 'size', 'mode'])
      || !identity(value.target.identity) || !digest(value.target.digest) || !Number.isSafeInteger(value.target.size)
      || value.target.size < 0 || value.target.size > CAP || !Number.isSafeInteger(value.target.mode)
      || value.target.mode < 0 || value.target.mode > 0o777 || (value.target.mode & 0o133) !== 0)
    || (value.target === null) !== (value.manifest === null)) throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
  if (value.manifest !== null) {
    const serialized = serializeManifest(value.manifest);
    if (encoder.encode(serialized).length > CAP) throw fail('TOO_LARGE');
    // Refuse normalization drift: only name/kind may change on disk.
    const normalized = validateManifest(value.manifest);
    if (!equivalent(normalized, value.manifest)) throw fail('NONCANONICAL_MANIFEST');
  }
  return freeze(clone(value));
}

/** Privileged, DOM-free one-use admission controller. Actor receives only
 * token/manifest, never root identities, hashes, filesystem methods, or paths.
 * The service supplies rootAdmission and a live binding/revision guard. */
export function createManifestAcceptance({ io, rootAdmission, clock, newToken, maxPending = 32, ttlMs = 120000 } = {}) {
  if (typeof io?.snapshot !== 'function' || typeof io?.accept !== 'function' || typeof rootAdmission !== 'function'
    || typeof clock !== 'function' || typeof newToken !== 'function' || !Number.isSafeInteger(maxPending)
    || maxPending < 1 || maxPending > 32 || !Number.isSafeInteger(ttlMs) || ttlMs < 1 || ttlMs > 120000) throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
  const pending = new Map();
  const nowValue = () => { const now = clock(); if (!Number.isSafeInteger(now) || now < 0) throw fail('INVALID_TIME'); return now; };
  const prune = () => { const now = nowValue(); for (const [token, item] of pending) if (now >= item.expires) pending.delete(token); };
  const admitted = (root, guard) => () => rootAdmission(root) === true && guard() === true;
  return Object.freeze({
    async preview({ root, baseManifest, guard } = {}) {
      if (!rootPath(root) || typeof guard !== 'function') throw fail('INVALID_PARAMS');
      const base = validateManifest(baseManifest);
      if (encoder.encode(serializeManifest(base)).length > CAP) throw fail('TOO_LARGE');
      const admit = admitted(root, guard);
      live(admit);
      const snap = acceptanceSnapshot(await io.snapshot(root, { admit }));
      live(admit);
      prune();
      if (pending.size >= maxPending) throw fail('BUSY');
      const token = newToken();
      if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/u.test(token) || pending.has(token)) throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
      const manifest = snap.manifest ?? base;
      const expires = nowValue() + ttlMs;
      if (!Number.isSafeInteger(expires)) throw fail('INVALID_TIME');
      pending.set(token, { root, snap, manifest, admit, expires });
      return Object.freeze({ token, manifest: validateManifest(manifest) });
    },
    async accept({ token, edits } = {}) {
      prune();
      const item = typeof token === 'string' ? pending.get(token) : null;
      if (!item) throw fail('STALE_ACCEPTANCE');
      pending.delete(token); // Any attempt consumes the confirmation lease.
      live(item.admit);
      if (!plain(edits) || Reflect.ownKeys(edits).length < 1 || Reflect.ownKeys(edits).some(k => !['name', 'kind'].includes(k)
        || !Object.hasOwn(Object.getOwnPropertyDescriptor(edits, k) ?? {}, 'value'))) throw fail('INVALID_PARAMS');
      const manifest = validateManifest({ ...item.manifest, ...edits });
      if (encoder.encode(serializeManifest(manifest)).length > CAP) throw fail('TOO_LARGE');
      const expected = { rootIdentity: item.snap.rootIdentity, directoryIdentity: item.snap.directoryIdentity, target: item.snap.target };
      const result = await io.accept({ root: item.root, expected: clone(expected), manifest: clone(manifest) }, { admit: item.admit });
      // A successful native commit cannot be undone on later consent revocation.
      // The service must reconcile by reinspecting, rather than blind retrying.
      if (!exact(result, ['path', 'digest', 'committed']) || result.path !== `${item.root}/.axiosozo/project.json`
        || !digest(result.digest) || result.committed !== true) throw fail('WRITE_OUTCOME_UNKNOWN', null);
      try { live(item.admit); } catch { throw fail('WRITE_OUTCOME_UNKNOWN', true); }
      return Object.freeze({ ...result });
    },
    invalidate() { pending.clear(); },
  });
}

export const MANIFEST_ACCEPT_PYTHON = '/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11';
export const MANIFEST_ACCEPT_SHA256 = '53b0768151ec6ac403fa5ef3e8119dd25ee6c569e5db55acdc60580e3772df86';
const RESERVED = new Set(['zen', 'toolchains', 'cargo-home', 'cargo-target', 'caches', 'runtime', 'tmp', 'cef', 'providers', 'logs', 'release', 'diag', 'diagnostics', 'gui-fixtures']);
const ERRORS = new Set(['INVALID_PARAMS', 'INVALID_MANIFEST', 'MANIFEST_SECRET', 'TOO_LARGE', 'DIRECTORY_REFUSED', 'MANIFEST_REFUSED',
  'IDENTITY_CHANGED', 'MANIFEST_CHANGED', 'UNCONFIRMED_FIELDS', 'WRITE_FAILED', 'BUSY', 'WRITE_OUTCOME_UNKNOWN',
  'WRITE_CONTAINMENT_UNAVAILABLE', 'WRITE_CONTAINMENT_REFUSED']);
export function manifestAcceptPaths(root) {
  const suffix = typeof root === 'string' && root.startsWith('/Volumes/AxioSozoBuild/') ? root.slice('/Volumes/AxioSozoBuild/'.length) : null;
  if (root !== '/Volumes/AxioSozoBuild' && (suffix === null || !/^[a-z0-9][a-z0-9-]{0,39}$/u.test(suffix) || RESERVED.has(suffix))) throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
  return Object.freeze({ interpreter: MANIFEST_ACCEPT_PYTHON, helperPath: `${root}/contexts/manifest-accept-${MANIFEST_ACCEPT_SHA256}.py` });
}
function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule('resource://gre/modules/Subprocess.sys.mjs');
  const timers = ChromeUtils.importESModule('resource://gre/modules/Timer.sys.mjs');
  return { Subprocess, timers, env: name => Services.env.get(name),
    verifyFile(path, { executable = false, privateParent = false } = {}) {
      const file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile);
      file.initWithPath(path);
      if (!file.exists() || file.isSymlink() || !file.isFile()) return false;
      file.normalize();
      if (file.path !== path || !file.isReadable() || executable && !file.isExecutable() || (file.permissions & 0o022) !== 0) return false;
      if (!executable && ((file.permissions & 0o777) !== 0o400 || file.fileSize > 128 * 1024)) return false;
      if (privateParent && (!file.parent.isDirectory() || file.parent.isSymlink() || (file.parent.permissions & 0o777) !== 0o700)) return false;
      return true;
    }, sha256: path => IOUtils.computeHexDigest(path, 'sha256'),
  };
}

/** Fixed native transport only. Each operation receives its privileged guard;
 * checks and child launch share a 4s deadline. No direct IOUtils fallback. */
export function createNativeManifestAcceptIO({ runtime } = {}) {
  runtime ??= nativeRuntime();
  if (typeof runtime.env !== 'function' || typeof runtime.verifyFile !== 'function' || typeof runtime.sha256 !== 'function'
    || typeof runtime.Subprocess?.call !== 'function' || typeof runtime.timers?.setTimeout !== 'function'
    || typeof runtime.timers?.clearTimeout !== 'function') throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
  const paths = manifestAcceptPaths(runtime.env('AXIOSOZO_STATIC_READER_ROOT') || runtime.env('AXIOSOZO_BUILD_ROOT'));
  async function call(operation, payload, { admit } = {}) {
    live(admit);
    const input = JSON.stringify(payload);
    if (encoder.encode(input).length > 131072) throw fail('TOO_LARGE');
    let child = null, stopped = false, dispatched = false, exited = false, timer, waitPromise;
    const assertLive = () => { if (stopped) throw fail('WRITE_CONTAINMENT_UNAVAILABLE', dispatched ? null : false); live(admit); };
    const wait = c => c === child ? waitPromise ??= Promise.resolve().then(() => c.wait()) : Promise.resolve().then(() => c.wait());
    const cleanup = async c => {
      if (!c) return;
      let killed = exited;
      const kill = !exited && typeof c.kill === 'function'
        ? Promise.resolve().then(() => c.kill(0)).then(() => { killed = true; }, () => {}) : Promise.resolve();
      let killTimer;
      try { await Promise.race([kill, new Promise(resolve => { killTimer = runtime.timers.setTimeout(resolve, 250); })]); }
      finally { runtime.timers.clearTimeout(killTimer); }
      // Failed or hanging kill must not deliver EOF to a live helper.
      const pipes = [killed ? c.stdin : null, c.stdout, c.stderr];
      const jobs = pipes.filter(p => typeof p?.close === 'function').map(p => Promise.resolve().then(() => p.close(true)));
      if (typeof c.wait === 'function') jobs.push(wait(c));
      let cleanupTimer;
      try { await Promise.race([Promise.allSettled(jobs), new Promise(resolve => { cleanupTimer = runtime.timers.setTimeout(resolve, 500); })]); }
      finally { runtime.timers.clearTimeout(cleanupTimer); }
    };
    const deadline = new Promise((_, reject) => { timer = runtime.timers.setTimeout(() => {
      stopped = true; reject(fail('WRITE_CONTAINMENT_UNAVAILABLE', dispatched ? null : false));
    }, 4000); });
    const drain = async (pipe, cap, keep) => {
      const reader = createSubprocessUtf8Reader(pipe, { maxBytes: cap });
      let output = '';
      for (;;) {
        const chunk = await reader.read();
        if (stopped) throw fail('WRITE_CONTAINMENT_UNAVAILABLE', dispatched ? null : false);
        if (chunk === null) return output;
        // A positive raw chunk may contain only a UTF-8 lead byte. Its empty
        // decoded text is not EOF; the reader retains it until the next chunk.
        if (keep) output += chunk.text;
      }
    };
    const execute = async () => {
      if (await runtime.verifyFile(paths.interpreter, { executable: true }) !== true) throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
      assertLive();
      if (await runtime.verifyFile(paths.helperPath, { privateParent: true }) !== true) throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
      assertLive();
      if (await runtime.sha256(paths.helperPath) !== MANIFEST_ACCEPT_SHA256) throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
      assertLive();
      if (await runtime.verifyFile(paths.helperPath, { privateParent: true }) !== true) throw fail('WRITE_CONTAINMENT_UNAVAILABLE');
      assertLive();
      dispatched = true;
      const candidate = await runtime.Subprocess.call({ command: paths.interpreter, arguments: ['-I', '-S', '-B', paths.helperPath, operation],
        environmentAppend: false, environment: { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C' }, stderr: 'pipe', workdir: '/' });
      if (stopped) { void cleanup(candidate); throw fail('WRITE_CONTAINMENT_UNAVAILABLE', null); }
      child = candidate;
      if (typeof child?.stdin?.write !== 'function' || typeof child?.stdin?.close !== 'function' || typeof child?.stdout?.read !== 'function'
        || typeof child?.stderr?.read !== 'function' || typeof child?.wait !== 'function' || typeof child?.kill !== 'function') throw fail('WRITE_CONTAINMENT_UNAVAILABLE', null);
      assertLive(); // No request body is sent if admission changed during spawn.
      await child.stdin.write(input);
      assertLive(); // The helper receives no EOF after a revoked pending write.
      // A helper that already exited may have had stdin removed by Gecko.
      // Only this close error is tolerated; write and response gates stay intact.
      try { await child.stdin.close(); }
      catch (error) { if (error?.errorCode !== NATIVE_END_OF_FILE) throw error; }
      const [output] = await Promise.all([drain(child.stdout, 96 * 1024, true), drain(child.stderr, 16 * 1024, false)]);
      const status = await wait(child);
      exited = true;
      if (stopped || status?.exitCode !== 0) throw fail('WRITE_CONTAINMENT_UNAVAILABLE', null);
      let answer;
      try { answer = JSON.parse(output); } catch { throw fail('WRITE_CONTAINMENT_UNAVAILABLE', null); }
      if (exact(answer, ['ok', 'error', 'committed']) && answer.ok === false && ERRORS.has(answer.error) && typeof answer.committed === 'boolean') throw fail(answer.error, answer.committed);
      if (!exact(answer, ['ok', 'result']) || answer.ok !== true) throw fail('WRITE_CONTAINMENT_UNAVAILABLE', null);
      return answer.result;
    };
    try { return await Promise.race([execute(), deadline]); }
    catch (cause) {
      if (cause?.code === 'STALE_ACCEPTANCE') throw fail(dispatched ? 'WRITE_OUTCOME_UNKNOWN' : cause.code, dispatched ? null : false);
      throw ERRORS.has(cause?.code) ? cause : fail('WRITE_CONTAINMENT_UNAVAILABLE', dispatched ? null : false);
    } finally { stopped = true; runtime.timers.clearTimeout(timer); await cleanup(child); }
  }
  return Object.freeze({
    snapshot: (root, options) => { if (!rootPath(root)) throw fail('INVALID_PARAMS'); return call('snapshot', { root }, options); },
    accept: (value, options) => {
      if (!exact(value, ['root', 'expected', 'manifest']) || !rootPath(value.root)) throw fail('INVALID_PARAMS');
      validateManifest(value.manifest);
      return call('accept', value, options);
    },
  });
}
