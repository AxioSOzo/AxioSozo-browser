/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

const unavailable = () => Object.assign(new Error("EXACT_SOCKET_METADATA_UNAVAILABLE"), { code: "EXACT_SOCKET_METADATA_UNAVAILABLE" });
const invoke = callback => Promise.resolve().then(callback);

// Only the Process object returned by the owned spawn is used. A settled
// usability-loss signal, held=false, kill acknowledgement or close result is
// not an owned native Process.wait completion. No PID lookup/signalling is allowed.
export function createOwnedSocketLease(process, timers) {
  let held = true, receipt = null, waiting = null, releasing = null;
  const ownedWait = () => typeof process.waitForOwnedExit === "function" ? process.waitForOwnedExit() : process.wait();
  const observeExit = () => {
    if (receipt) return Promise.resolve(receipt);
    if (waiting) return waiting;
    const attempt = invoke(ownedWait).then(status => {
      held = false;
      const exitCode = status && typeof status === "object" && !Array.isArray(status)
        ? Object.getOwnPropertyDescriptor(status, "exitCode")?.value : undefined;
      if (!status || typeof status !== "object" || Reflect.ownKeys(status).length !== 1 || !Number.isSafeInteger(exitCode)) throw unavailable();
      receipt = Object.freeze({ exitCode });
      return receipt;
    }, () => { held = false; throw unavailable(); });
    waiting = attempt;
    attempt.then(() => { if (waiting === attempt) waiting = null; }, () => { if (waiting === attempt) waiting = null; });
    return attempt;
  };
  const initialExit = observeExit();
  initialExit.catch(() => {});
  const lost = (typeof process.waitForOwnedExit === "function" ? invoke(() => process.wait()) : initialExit)
    .then(() => { held = false; }, () => { held = false; });

  const attemptRelease = async () => {
    if (receipt) return;
    held = false;
    let grace = null, limit = null, cleanup = null;
    const forceOwnedCleanup = () => receipt ? Promise.resolve() : cleanup ??= invoke(() => typeof process.retryOwnedCleanup === "function"
      ? process.retryOwnedCleanup() : process.kill(0));
    const force = () => { void forceOwnedCleanup().catch(() => {}); };
    const deadline = new Promise((_, reject) => { limit = timers.setTimeout(() => { force(); reject(unavailable()); }, 1000); });
    grace = timers.setTimeout(force, 500);
    // A rejected/hanging close does not become a release receipt. It requests
    // cleanup on the retained handle while actual owned exit is observed.
    void invoke(() => process.stdin.close()).catch(force);
    try { await Promise.race([observeExit(), deadline]); }
    catch { force(); throw unavailable(); }
    finally { timers.clearTimeout(grace); timers.clearTimeout(limit); }
  };
  return Object.freeze({
    get held() { return held; }, lost,
    get released() { return receipt !== null; },
    get exitReceipt() { return receipt; },
    release() {
      if (receipt) return Promise.resolve();
      if (releasing) return releasing;
      const attempt = attemptRelease();
      releasing = attempt;
      attempt.then(() => { if (releasing === attempt) releasing = null; }, () => { if (releasing === attempt) releasing = null; });
      return attempt;
    },
  });
}
