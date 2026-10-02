/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

import { createOwnedSocketLease } from "./AgentSocketLease.sys.mjs";

const unavailable = () => Object.assign(new Error("EXACT_SOCKET_METADATA_UNAVAILABLE"), { code: "EXACT_SOCKET_METADATA_UNAVAILABLE" });
const invoke = callback => Promise.resolve().then(callback);

// Own a pending native spawn before its handle or protocol acknowledgement
// exists. Cancellation before beginSpawn proves no child was launched; after
// beginSpawn only actual spawn rejection or the original lease's owned exit
// receipt can prove release. Deadline, kill and pipe-close results cannot.
export function createOwnedSocketSpawn(timers) {
  let state = "idle", cancelled = false, acknowledged = false, acquired = false, usable = true;
  let lease = null, releasing = null, readyResolve, lostResolve;
  const releaseObservers = new Set();
  const ready = new Promise(resolve => { readyResolve = resolve; });
  const lost = new Promise(resolve => { lostResolve = resolve; });
  const completeWithoutChild = () => {
    state = "none";
    readyResolve();
    lostResolve();
    notifyReleased();
  };
  const released = () => state === "none" || lease?.released === true;
  const notifyReleased = () => {
    if (!released()) return;
    for (const callback of releaseObservers) { try { callback(lease?.exitReceipt !== null && lease?.exitReceipt !== undefined); } catch {} }
    releaseObservers.clear();
  };
  const attemptRelease = async () => {
    cancelled = true;
    acknowledged = false;
    lostResolve();
    if (state === "idle") completeWithoutChild();
    if (released()) return;
    let timer;
    const deadline = new Promise((_, reject) => { timer = timers.setTimeout(() => reject(unavailable()), 1000); });
    try {
      await Promise.race([(async () => {
        await ready;
        if (lease) await lease.release();
        if (!released()) throw unavailable();
        notifyReleased();
      })(), deadline]);
    } finally { timers.clearTimeout(timer); }
  };
  const owner = Object.freeze({
    get cancelled() { return cancelled; },
    get held() { return acknowledged && usable && lease?.held === true && !cancelled; },
    get released() { return released(); },
    get exitReceipt() { return lease?.exitReceipt ?? null; },
    lost,
    ownershipDiagnostics: () => Object.freeze({ pending_spawn: state === "pending", handle_seen: state === "child", owned_handle: state === "child" && !released(),
      acknowledged, acquired, released: released(), owned_exit_receipt: lease?.exitReceipt !== null && lease?.exitReceipt !== undefined }),
    observeReleased(callback) {
      if (typeof callback !== "function") throw unavailable();
      releaseObservers.add(callback);
      notifyReleased();
    },
    beginSpawn() {
      if (state !== "idle" || cancelled) return false;
      state = "pending";
      return true;
    },
    spawnRejected() {
      // The caller invokes this only after the actual owned native call
      // rejects, or after admission fails without invoking that call.
      if (state === "idle" || state === "pending") completeWithoutChild();
    },
    adoptProcess(process) {
      if (state !== "pending") throw unavailable();
      state = "child";
      lease = createOwnedSocketLease(process, timers);
      lease.lost.then(() => { usable = false; lostResolve(); notifyReleased(); }, () => { usable = false; lostResolve(); notifyReleased(); });
      readyResolve();
      // A late handle remains owned even if the caller's watchdog already
      // returned. Start cleanup, retain this owner until positive receipt.
      if (cancelled) void lease.release().catch(() => {});
    },
    acknowledge(process) {
      if (cancelled || state !== "child" || lease?.held !== true) throw unavailable();
      acknowledged = true;
      acquired = true;
      // A native proxy may become unusable before raw Process.wait resolves.
      void invoke(() => process.wait()).then(() => { usable = false; lostResolve(); }, () => { usable = false; lostResolve(); });
      return owner;
    },
    release() {
      if (released()) return Promise.resolve();
      if (releasing) return releasing;
      const attempt = attemptRelease();
      releasing = attempt;
      attempt.then(() => { if (releasing === attempt) releasing = null; }, () => { if (releasing === attempt) releasing = null; });
      return attempt;
    },
  });
  return owner;
}

// Direct injected subprocesses have no separate guard deadline. Publication
// happens immediately after their actual spawn promise yields its own handle.
export function beginOwnedSocketCall(Subprocess, options, timers) {
  const owner = createOwnedSocketSpawn(timers);
  const process = (async () => {
    if (!owner.beginSpawn()) throw unavailable();
    let child;
    try { child = await Subprocess.call(options); }
    catch (cause) { owner.spawnRejected(); throw cause; }
    owner.adoptProcess(child);
    if (owner.cancelled) throw unavailable();
    return child;
  })();
  process.catch(() => {});
  return Object.freeze({ owner, process });
}
