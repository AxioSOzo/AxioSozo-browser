/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Exact filesystem facts must come from a privileged POSIX backend, never
// from IOUtils.stat's "other" bucket or nsIFile.isSpecial(). See README.md.
const encoder = new TextEncoder();
const fail = code => { throw Object.assign(new Error(code), { code }); };
const same = (a, b) => !!a && !!b && a.kind === b.kind && a.uid === b.uid &&
  a.device === b.device && a.inode === b.inode;
const exactInfo = value => value === null || value &&
  ["socket", "directory", "regular", "symlink", "other"].includes(value.kind) &&
  Number.isSafeInteger(value.uid) && value.uid >= 0 && Number.isSafeInteger(value.mode) &&
  value.mode >= 0 && typeof value.device === "string" && typeof value.inode === "string";

export function validateAgentSocketPath(path) {
  if (typeof path !== "string" || !path.startsWith("/") || path.endsWith("/") ||
      path.includes("//") || /[\u0000-\u001f\u007f-\u009f]/u.test(path) ||
      path.split("/").some(part => part === "." || part === "..") ||
      encoder.encode(path).length > 100) fail("INVALID_SOCKET_PATH");
  return path;
}

/**
 * backend: exactAvailable:true, uid(), lstat(path), mkdir(path,0700),
 * acquireLock(path,parentIdentity)-> {held:true,lost:Promise,release()},
 * probeUnix(path)-> {state:"live"} | {state:"refused", rawErrno:"ECONNREFUSED"},
 * removeSocketIfMatches(path,identity,parentIdentity)->boolean.
 * lstat MUST NOT follow symlinks and MUST return raw UID/type/dev/inode/mode.
 * removal MUST revalidate the identity and the protected parent and never
 * remove anything except that exact socket. Probe MUST NOT send any data.
 */
export class AgentUnixSocketPath {
  #backend;
  #retainedClaims = new Set();
  #cleanupSnapshots = new WeakSet();
  constructor(backend = null) { this.#backend = backend; }
  get hasRetainedCleanup() { return this.#retainedClaims.size !== 0 || this.#backend?.hasRetainedCleanup === true; }
  ownershipDiagnostics() {
    return Object.freeze({ retained_preclaims: this.#retainedClaims.size, cleanup_pending: this.hasRetainedCleanup,
      backend: this.#backend?.ownershipDiagnostics?.() ?? null });
  }
  retainedCleanupClaims() {
    const snapshot = Object.freeze({ claims: Object.freeze([...this.#retainedClaims]),
      locks: this.#backend?.retainedCleanupLocks?.() ?? Object.freeze([]) });
    this.#cleanupSnapshots.add(snapshot);
    return snapshot;
  }
  async cleanupRetained(snapshot) {
    if (!this.#cleanupSnapshots.has(snapshot)) fail("CLEANUP_INCOMPLETE");
    await Promise.allSettled(snapshot.claims.filter(claim => this.#retainedClaims.has(claim))
      .map(claim => this.cleanup(claim)));
    if (typeof this.#backend?.cleanupRetainedLocks === "function") {
      try { await this.#backend.cleanupRetainedLocks(snapshot.locks); } catch {}
    }
    if (this.hasRetainedCleanup) fail("CLEANUP_INCOMPLETE");
  }
  #capable() {
    if (this.#backend?.exactAvailable !== true ||
        ["uid", "lstat", "mkdir", "probeUnix", "removeSocketIfMatches", "acquireLock"]
          .some(method => typeof this.#backend[method] !== "function"))
      fail("EXACT_SOCKET_METADATA_UNAVAILABLE");
  }
  async #stat(path) {
    const value = await this.#backend.lstat(path);
    if (!exactInfo(value)) fail("EXACT_SOCKET_METADATA_UNAVAILABLE");
    return value;
  }
  async prepare(path) {
    if (this.hasRetainedCleanup) fail("CLEANUP_INCOMPLETE");
    validateAgentSocketPath(path);
    this.#capable();
    const uid = await this.#backend.uid();
    if (!Number.isSafeInteger(uid) || uid < 0) fail("EXACT_SOCKET_METADATA_UNAVAILABLE");
    const parts = path.slice(1).split("/");
    const parentPath = path.slice(0, path.lastIndexOf("/")) || "/";
    let prefix = "", parent = null;
    for (const part of parts.slice(0, -1)) {
      prefix += `/${part}`;
      let info = await this.#stat(prefix);
      if (info === null) {
        await this.#backend.mkdir(prefix, 0o700);
        info = await this.#stat(prefix);
      }
      if (!info || info.kind !== "directory") fail("SOCKET_PATH_BLOCKED");
      if (info.uid !== uid && info.uid !== 0) fail("SOCKET_PATH_BLOCKED");
      // A world/group-writable ancestor without the sticky bit lets another
      // principal rename our private directory. Do not establish a listener.
      if ((info.mode & 0o022) && !(info.mode & 0o1000)) fail("SOCKET_PATH_BLOCKED");
      if (prefix === parentPath) {
        if (info.uid !== uid || (info.mode & 0o7777) !== 0o700) fail("SOCKET_PATH_BLOCKED");
        parent = info;
      }
    }
    // A socket directly under / never has the required private parent.
    if (!parent) fail("SOCKET_PATH_BLOCKED");
    // The lock remains held from before stale probing until listener close.
    // Without it another instance could go from bound to listening after our
    // refusal probe without changing the socket inode, defeating rechecks.
    const lock = await this.#backend.acquireLock(path, parent);
    const claim = Object.freeze({ path, parentPath, uid, parent: Object.freeze({ ...parent }), lock });
    try {
      if (lock?.held !== true || typeof lock.release !== "function") fail("EXACT_SOCKET_METADATA_UNAVAILABLE");
      const existing = await this.#stat(path);
      if (existing !== null) {
        if (existing.kind !== "socket" || existing.uid !== uid || (existing.mode & 0o7777) !== 0o600)
          fail("SOCKET_PATH_BLOCKED");
        const probe = await this.#backend.probeUnix(path);
        if (probe?.state === "live") fail("SOCKET_IN_USE");
        // Necko's NS_ERROR_CONNECTION_REFUSED also represents EACCES. Only a
        // backend preserving raw errno can establish a genuinely stale socket.
        if (probe?.state !== "refused" || probe.rawErrno !== "ECONNREFUSED") fail("SOCKET_PATH_BLOCKED");
        const afterProbe = await this.#stat(path);
        const afterParent = await this.#stat(parentPath);
        if (!same(existing, afterProbe) || !same(parent, afterParent) ||
            (afterParent.mode & 0o7777) !== 0o700 || lock.held !== true) fail("SOCKET_PATH_BLOCKED");
        if (!await this.#backend.removeSocketIfMatches(path, existing, parent)) fail("SOCKET_PATH_BLOCKED");
        if (await this.#stat(path) !== null) fail("SOCKET_PATH_BLOCKED");
      }
      if (lock.held !== true) fail("EXACT_SOCKET_METADATA_UNAVAILABLE");
      return claim;
    } catch (cause) {
      try { await this.cleanup(claim); }
      catch { this.#retainedClaims.add(claim); fail("CLEANUP_INCOMPLETE"); }
      throw cause;
    }
  }
  async verifyBound(claim) {
    this.#capable();
    if (claim.lock?.held !== true) fail("EXACT_SOCKET_METADATA_UNAVAILABLE");
    const parent = await this.#stat(claim.parentPath);
    const socket = await this.#stat(claim.path);
    if (!same(parent, claim.parent) || (parent.mode & 0o7777) !== 0o700 ||
        !socket || socket.kind !== "socket" || socket.uid !== claim.uid ||
        (socket.mode & 0o7777) !== 0o600) fail("SOCKET_PATH_BLOCKED");
    return Object.freeze({ ...claim, socket: Object.freeze({ ...socket }) });
  }
  async cleanup(claim) {
    try {
      if (!claim?.socket || claim.lock?.held !== true) return false;
      this.#capable();
      const parent = await this.#stat(claim.parentPath);
      const socket = await this.#stat(claim.path);
      if (!same(parent, claim.parent) || (parent.mode & 0o7777) !== 0o700 ||
          !same(socket, claim.socket) || (socket.mode & 0o7777) !== 0o600) return false;
      return await this.#backend.removeSocketIfMatches(claim.path, claim.socket, claim.parent);
    } finally {
      await claim?.lock?.release?.();
      this.#retainedClaims.delete(claim);
    }
  }
}
