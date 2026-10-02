/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

import { beginOwnedSocketCall } from "./AgentOwnedSocketSpawn.sys.mjs";

// Production-owned helper only, with a configured trusted interpreter/helper
// path. No PATH search, shell, user project scripts, site initialization or
// inherited provider credentials. Missing configuration stays unavailable.
const encoder = new TextEncoder();
const failure = code => Object.assign(new Error(code), { code });
const absolute = value => typeof value === "string" && value.startsWith("/") &&
  value.length <= 4096 && !/[\u0000-\u001f\u007f]/u.test(value) &&
  !value.split("/").some(part => part === "." || part === "..");
const OPERATIONS = new Set(["uid", "lstat", "mkdir", "probe", "remove"]);
const ERRORS = new Set(["INVALID_PARAMS", "INVALID_SOCKET_PATH", "SOCKET_PATH_BLOCKED", "SOCKET_IN_USE", "EXACT_SOCKET_METADATA_UNAVAILABLE"]);

export function createAgentSocketSubprocessBackend({
  configuredTrusted = false, interpreter, helperPath, Subprocess,
  timers, timeoutMs = 3000, outputBytes = 16384,
} = {}) {
  if (configuredTrusted !== true || !absolute(interpreter) || !absolute(helperPath) ||
      typeof Subprocess?.call !== "function" || typeof timers?.setTimeout !== "function" ||
      typeof timers?.clearTimeout !== "function") return null;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000 ||
      !Number.isSafeInteger(outputBytes) || outputBytes < 1 || outputBytes > 16384) return null;
  const spawnOptions = (operation, argument) => ({
    command: interpreter, arguments: ["-I", "-S", "-B", helperPath, operation, argument],
    environment: { LANG: "C", LC_ALL: "C", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" },
    environmentAppend: false, stderr: "ignore", workdir: "/",
  });
  const retainedLocks = new Set();
  const ownedLocks = new Set();
  let ownedExitReceipts = 0, noChildReceipts = 0, leaseAcquired = 0, acquiredExitReceipts = 0;
  const call = async (operation, payload) => {
    if (!OPERATIONS.has(operation)) throw failure("INVALID_PARAMS");
    const argument = JSON.stringify(payload);
    if (encoder.encode(argument).length > 16384) throw failure("INVALID_PARAMS");
    let process = null, expired = false, timer;
    const stopped = new Promise((_, reject) => {
      timer = timers.setTimeout(() => {
        expired = true;
        if (process) process.kill(0).catch(() => {});
        reject(failure("EXACT_SOCKET_METADATA_UNAVAILABLE"));
      }, timeoutMs);
    });
    const execute = async () => {
      process = await Subprocess.call(spawnOptions(operation, argument));
      if (expired) { await process.kill(0); throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE"); }
      await process.stdin.close();
      let output = "", size = 0;
      for (;;) {
        const chunk = await process.stdout.readString();
        if (!chunk) break;
        size += encoder.encode(chunk).length;
        if (size > outputBytes) { await process.kill(0); throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE"); }
        output += chunk;
      }
      const result = await process.wait();
      if (result.exitCode !== 0) throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE");
      let value;
      try { value = JSON.parse(output); } catch { throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE"); }
      if (!value || typeof value !== "object" || Array.isArray(value)) throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE");
      if (value.ok !== true) throw failure(ERRORS.has(value.error) ? value.error : "EXACT_SOCKET_METADATA_UNAVAILABLE");
      if (!Object.hasOwn(value, "result")) throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE");
      return value.result;
    };
    try { return await Promise.race([execute(), stopped]); }
    finally { timers.clearTimeout(timer); }
  };
  const acquireLock = async (path, parent) => {
    if (retainedLocks.size) throw failure("CLEANUP_INCOMPLETE");
    const options = spawnOptions("lock", JSON.stringify({ path, parent }));
    // The native admission guard supplies an owner before its own watchdog
    // can reject. Direct fake runtimes own their actual spawn promise here.
    const acquisition = typeof Subprocess.beginOwnedCall === "function"
      ? Subprocess.beginOwnedCall(options) : beginOwnedSocketCall(Subprocess, options, timers);
    const owner = acquisition.owner;
    ownedLocks.add(owner);
    owner.observeReleased(actualExit => {
      ownedLocks.delete(owner);
      if (actualExit) { ownedExitReceipts++; if (owner.ownershipDiagnostics().acquired) acquiredExitReceipts++; }
      else noChildReceipts++;
    });
    let timer, expired = false;
    const timedOut = new Promise((_, reject) => {
      timer = timers.setTimeout(() => {
        expired = true;
        reject(failure("EXACT_SOCKET_METADATA_UNAVAILABLE"));
      }, timeoutMs);
    });
    const start = async () => {
      const process = await acquisition.process;
      if (expired || owner.cancelled) throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE");
      let output = "";
      while (!output.includes("\n")) {
        const chunk = await process.stdout.readString();
        if (!chunk) throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE");
        output += chunk;
        if (encoder.encode(output).length > outputBytes) throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE");
      }
      let response;
      try { response = JSON.parse(output); } catch { throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE"); }
      if (response?.ok !== true || response.result !== true)
        throw failure(ERRORS.has(response?.error) ? response.error : "EXACT_SOCKET_METADATA_UNAVAILABLE");
      if (expired || owner.cancelled) throw failure("EXACT_SOCKET_METADATA_UNAVAILABLE");
      const lock = owner.acknowledge(process);
      leaseAcquired++;
      return lock;
    };
    try { return await Promise.race([start(), timedOut]); }
    catch (cause) {
      try { await owner.release(); }
      catch { retainedLocks.add(owner); throw failure("CLEANUP_INCOMPLETE"); }
      throw cause;
    }
    finally { timers.clearTimeout(timer); }
  };
  return Object.freeze({
    exactAvailable: true,
    uid: () => call("uid", {}),
    lstat: path => call("lstat", { path }),
    mkdir: (path, mode) => call("mkdir", { path, mode }),
    probeUnix: path => call("probe", { path }),
    removeSocketIfMatches: (path, identity, parent) => call("remove", { path, identity, parent }),
    acquireLock,
    get hasRetainedCleanup() { return retainedLocks.size !== 0; },
    ownershipDiagnostics() {
      const owners = [...ownedLocks].map(owner => owner.ownershipDiagnostics());
      const pendingSpawns = owners.filter(owner => owner.pending_spawn).length;
      const ownedHandles = owners.filter(owner => owner.owned_handle).length;
      const exitReceipts = ownedExitReceipts + owners.filter(owner => owner.owned_exit_receipt).length;
      return Object.freeze({ retained_locks: retainedLocks.size, pending_spawns: pendingSpawns,
        owned_handles: ownedHandles, acknowledged_locks: owners.filter(owner => owner.acknowledged && !owner.released).length,
        owned_exit_receipts: exitReceipts, no_child_receipts: noChildReceipts,
        helper_spawned: owners.filter(owner => owner.handle_seen).length + ownedExitReceipts, helper_wait_completed: exitReceipts,
        helper_outstanding: ownedHandles + pendingSpawns, lease_acquired: leaseAcquired,
        lease_exit_receipts: acquiredExitReceipts + owners.filter(owner => owner.acquired && owner.owned_exit_receipt).length,
        lease_outstanding: owners.filter(owner => owner.acquired && !owner.released).length });
    },
    retainedCleanupLocks: () => Object.freeze([...retainedLocks]),
    async cleanupRetainedLocks(locks) {
      await Promise.allSettled(locks.filter(lock => retainedLocks.has(lock)).map(async lock => {
        await lock.release();
        if (lock.released !== true) throw failure("CLEANUP_INCOMPLETE");
        retainedLocks.delete(lock);
      }));
      if (retainedLocks.size) throw failure("CLEANUP_INCOMPLETE");
    },
  });
}
