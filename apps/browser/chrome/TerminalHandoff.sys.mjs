/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { validateHandoffContext, HANDOFF_REASONS } from "./AgentHandoff.sys.mjs";
import { createSubprocessUtf8Reader } from "./SubprocessUtf8.sys.mjs";

// DOM-free Subprocess seam for the explicitly configured, reviewed fake
// Terminal helper. Product agents never reach this helper from the browser.
export const TERMINAL_HANDOFF_PYTHON = "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11";
const RECEIPT_BYTES = 16384;
const STDERR_BYTES = 16384;
const INPUT_BYTES = 2097152;
const DEADLINE_MS = 30000;
const CLEANUP_MS = 1500;
const absolute = path => typeof path === "string" && path.startsWith("/") && path.length > 1 && path.length <= 4096
  && !/[\u0000-\u001f\u007f-\u009f\\]/u.test(path) && path.split("/").slice(1).every(part => part && part !== "." && part !== "..");
const denied = (reason, mayHaveLaunched = false) => Object.freeze({ version: 1, status: "unavailable", reason, may_have_launched: mayHaveLaunched });
function closeStdin(child) { try { Promise.resolve(child?.stdin.close()).catch(() => {}); } catch { /* Closed. */ } }
function killOwned(child) { try { Promise.resolve(child?.kill(1000)).catch(() => {}); } catch { /* Exited. */ } }
function waitOwned(child) { try { return Promise.resolve(child.wait()).catch(() => {}); } catch { return Promise.resolve(); } }
function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  return { spawn: options => Subprocess.call(options), timers };
}
function receipt(text, exitCode) {
  let value;
  try { value = JSON.parse(text.trim()); } catch { return null; }
  if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1) return null;
  if (value.status === "handed_off") {
    if (exitCode !== 0 || value.agent !== "fake" || value.may_have_launched !== true || typeof value.launch_id !== "string" || !/^[0-9a-f]{32}$/u.test(value.launch_id)
      || Object.keys(value).length !== 5 || !Object.keys(value).every(key => ["version", "status", "agent", "may_have_launched", "launch_id"].includes(key))) return null;
    return Object.freeze({ ...value });
  }
  if (value.status === "denied" && exitCode !== 0 && typeof value.may_have_launched === "boolean" && HANDOFF_REASONS.includes(value.reason)
    && Object.keys(value).length === 4 && Object.keys(value).every(key => ["version", "status", "reason", "may_have_launched"].includes(key))) return denied(value.reason, value.may_have_launched);
  return null;
}

/**
 * verifyConfiguration({helper,policy,mode}) must be a native, no-follow owner /
 * canonical-path check of the packaged reviewed helper and a private policy
 * file. There is no permissive default, PATH or environment fallback. Only
 * trusted chrome constructor configuration reaches launch; never actor input.
 */
export function createTerminalHandoff({ runtime, verifyConfiguration } = {}) {
  let closed = false;
  const active = new Set();
  async function launch({ agent, context, test_only, signal, configuration } = {}) {
    if (closed || signal?.aborted) return denied("CANCELLED");
    if (test_only !== true || !["codex", "claude-code"].includes(agent)) return denied("NOT_AUTHORIZED");
    if (!configuration || typeof configuration !== "object" || Array.isArray(configuration)
      || Object.keys(configuration).some(key => !["helper", "policy", "mode"].includes(key))
      || !absolute(Object.getOwnPropertyDescriptor(configuration, "helper")?.value) || !absolute(Object.getOwnPropertyDescriptor(configuration, "policy")?.value) || !["terminal", "headless"].includes(Object.getOwnPropertyDescriptor(configuration, "mode")?.value ?? "terminal")) return denied("INVALID_POLICY");
    let normalized;
    try { normalized = validateHandoffContext(context); } catch { return denied("INVALID_INPUT"); }
    if (!normalized.project) return denied("NO_PROJECT");
    if (typeof verifyConfiguration !== "function") return denied("INVALID_POLICY");
    const config = Object.freeze({ helper: Object.getOwnPropertyDescriptor(configuration, "helper")?.value, policy: Object.getOwnPropertyDescriptor(configuration, "policy")?.value, mode: Object.getOwnPropertyDescriptor(configuration, "mode")?.value ?? "terminal" });
    if (active.size >= 8) return denied("BUSY");
    runtime ??= nativeRuntime();
    const input = JSON.stringify({ version: 1, agent: "fake", mode: config.mode, cwd: normalized.project.root, context: normalized,
      live_authorized: false, test_only: true }) + "\n";
    if (new TextEncoder().encode(input).length > INPUT_BYTES) return denied("TOO_LARGE");
    const owner = { child: null, ended: false, sent: false, stop: null };
    active.add(owner);
    let deadline = null, cleanupTimer = null, onAbort;
    let stopReason = null, stoppedResolve;
    const stopped = new Promise(resolve => { stoppedResolve = resolve; });
    const stop = reason => {
      if (owner.ended || stopReason) return;
      stopReason = reason;
      closeStdin(owner.child); killOwned(owner.child);
      stoppedResolve(denied(owner.sent ? "LAUNCH_UNCERTAIN" : reason, owner.sent));
    };
    owner.stop = stop;
    onAbort = () => stop("CANCELLED");
    signal?.addEventListener("abort", onAbort, { once: true });
    deadline = runtime.timers.setTimeout(() => stop("TIMEOUT"), DEADLINE_MS);
    if (signal?.aborted || closed) stop("CANCELLED");
    const work = (async () => {
      let child;
      try {
        try { if (await verifyConfiguration(config, { signal, isActive: () => !stopReason && !owner.ended && !closed && !signal?.aborted }) !== true) return denied("INVALID_POLICY"); } catch { return denied("INVALID_POLICY"); }
        if (stopReason || owner.ended || closed || signal?.aborted) return denied(stopReason ?? "CANCELLED");
        child = await runtime.spawn({ command: TERMINAL_HANDOFF_PYTHON, arguments: ["-I", "-S", "-B", config.helper, "--policy", config.policy],
          environmentAppend: false, environment: { PATH: "/usr/bin:/bin", LANG: "C" }, stderr: "pipe", workdir: "/" },
          { signal, isActive: () => !stopReason && !owner.ended && !closed && !signal?.aborted });
        owner.child = child;
        if (stopReason || closed || signal?.aborted) {
          closeStdin(child); killOwned(child); waitOwned(child);
          return denied("CANCELLED");
        }
        // Even a partial write may make the private helper create a session.
        owner.sent = true;
        const stdout = createSubprocessUtf8Reader(child.stdout, { maxBytes: RECEIPT_BYTES });
        const stderr = createSubprocessUtf8Reader(child.stderr, { maxBytes: STDERR_BYTES });
        const drainStderr = (async () => {
          for (;;) { if (await stderr.read() === null) break; /* Discarded. */ }
        })().catch(() => { stop("SPAWN_FAILED"); });
        await child.stdin.write(input);
        await child.stdin.close();
        let output = "";
        for (;;) {
          const chunk = await stdout.read();
          if (chunk === null) break;
          output += chunk.text;
        }
        const status = await child.wait();
        await drainStderr;
        return receipt(output, status.exitCode) ?? denied("LAUNCH_UNCERTAIN", true);
      } catch { return denied(owner.sent ? "LAUNCH_UNCERTAIN" : "SPAWN_FAILED", owner.sent); }
    })();
    try {
      const outcome = await Promise.race([work, stopped]);
      owner.ended = true;
      if (owner.child) {
        // Clean up only the helper process owned by this call. An acknowledged
        // Terminal session belongs to the user and continues independently.
        closeStdin(owner.child);
        if (outcome.status !== "handed_off") killOwned(owner.child);
        const cleanup = new Promise(resolve => { cleanupTimer = runtime.timers.setTimeout(resolve, CLEANUP_MS); });
        await Promise.race([waitOwned(owner.child), cleanup]);
      }
      return outcome;
    } finally {
      runtime.timers.clearTimeout(deadline); runtime.timers.clearTimeout(cleanupTimer);
      signal?.removeEventListener("abort", onAbort); active.delete(owner);
      // work handles and terminates any subprocess that resolves after a stop.
    }
  }
  return Object.freeze({ launch, close: () => { closed = true; for (const owner of active) owner.stop?.("CANCELLED"); },
    diagnostics: () => Object.freeze({ closed, active: active.size }) });
}
