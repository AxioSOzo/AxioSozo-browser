/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// decision-v1 `site_rule_v1` from chrome: the on-demand provider host is the only
// network client and the only holder of the Keychain key. Chrome never sees the key.
const CHOICE_SET = "site_rule_v1";
const CONTEXT_VERSION = "site-rule-1";
const JEV_MODEL = "jev-1.13.0";
const OUTCOMES = Object.freeze(["none", "nudge", "suggest_leave", "pause_site"]);
const REASON_CODES = Object.freeze(["drift", "on_task", "off_context", "unclear"]);
export const DECISION_REASONS = Object.freeze(["validated", "disabled", "cancelled", "timeout", "BLOCKED_AUTH", "HTTP_ERROR",
  "NETWORK_ERROR", "KEYCHAIN_ERROR", "malformed_output", "budget_exhausted", "INVALID_INPUT", "HOST_UNAVAILABLE"]);
const RESULT_KEYS = Object.freeze(["version", "request_id", "choice_set", "context_version", "outcome", "reason_code",
  "reason", "data_sent", "authority", "action_authorized", "model"]);
const MAX_LINE = 73728; // provider-host HOST_LIMITS.lineBytes
const MAX_FRAME = 1024 * 1024;
const MAX_DEADLINE_MS = 30000;
const REPLY_GRACE_MS = 2000;
const CANCEL_GRACE_MS = 1000;
const REQUEST_ID = /^[A-Za-z0-9_.:-]{1,160}$/u;
function absolute(value) { return typeof value === "string" && value.startsWith("/") && !/[\u0000-\u001f]/u.test(value); }
function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  return { spawn: options => Subprocess.call(options),
    timers: ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs"), now: () => Date.now(),
    env: name => Services.env.get(name), uuid: () => Services.uuid.generateUUID().toString().replace(/[{}]/gu, "") };
}
function neutral(request, reason, dataSent = false) {
  const requestId = typeof request?.request_id === "string" && REQUEST_ID.test(request.request_id) ? request.request_id : null;
  return Object.freeze({ version: 1, request_id: requestId, choice_set: CHOICE_SET, context_version: CONTEXT_VERSION,
    outcome: "none", reason_code: null, reason, data_sent: dataSent, authority: "suggestion_only", action_authorized: false });
}

/** Re-validates a host reply against the request; returns a fresh frozen copy or null. */
export function validateDecisionResult(result, request) {
  const effects = Array.isArray(request?.state?.rule?.effects) ? request.state.rule.effects : [];
  if (!result || typeof result !== "object" || Array.isArray(result) || !Object.keys(result).every(key => RESULT_KEYS.includes(key))) return null;
  const ok = result.version === 1 && result.request_id === request.request_id && result.choice_set === CHOICE_SET
    && result.context_version === CONTEXT_VERSION && OUTCOMES.includes(result.outcome)
    && (result.outcome === "none" || effects.includes(result.outcome) && result.reason === "validated" && result.data_sent === true)
    && (result.reason_code === null || REASON_CODES.includes(result.reason_code) && result.outcome !== "none")
    && DECISION_REASONS.includes(result.reason) && typeof result.data_sent === "boolean"
    && result.authority === "suggestion_only" && result.action_authorized === false
    && (result.model === undefined || result.model === JEV_MODEL);
  if (!ok) return null;
  const copy = {};
  for (const key of RESULT_KEYS) if (result[key] !== undefined) copy[key] = result[key];
  return Object.freeze(copy);
}

/**
 * contexts-api-v1 §3.5 `decide(request, { signal })`. Starts the provider host only
 * when called, reuses it until the host reports idle, and never rejects: every
 * failure resolves to outcome `none`. `onSending({ request_id, level })` runs before
 * the request leaves chrome; if it throws, nothing is sent. When a request was
 * handed to the host but no valid reply arrived, `data_sent` is conservatively true.
 */
export function createDecide({ runtime, onSending = () => {} } = {}) {
  let host = null, starting = null, closed = false;
  const retire = (owned, reason) => {
    if (!owned || owned.retired) return;
    owned.retired = true; if (host === owned) host = null;
    for (const settle of owned.pending.values()) settle(null, reason);
    owned.pending.clear();
    const { child } = owned;
    child.stdin.close().catch(() => {});
    child.kill(1000).catch(() => {}); child.wait().catch(() => {});
  };
  async function read(owned) {
    let buffer = "";
    for (;;) {
      const chunk = await owned.child.stdout.readString();
      if (!chunk) return;
      buffer += chunk; if (buffer.length > MAX_FRAME) throw new Error("PROVIDER_OUTPUT_LIMIT");
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        const frame = JSON.parse(line);
        if (frame?.version !== 1) throw new Error("INVALID_PROVIDER_FRAME");
        if (typeof frame.id === "string") owned.pending.get(frame.id)?.(frame);
        else if (frame.event?.type === "host_idle") retire(owned, "HOST_UNAVAILABLE");
      }
    }
  }
  async function spawn() {
    runtime ??= nativeRuntime();
    const node = runtime.env("AXIOSOZO_PROVIDER_NODE"); const path = runtime.env("AXIOSOZO_PROVIDER_HOST");
    if (!absolute(node) || !absolute(path) || !path.endsWith("/packages/provider-host/cli.mjs")) throw new Error("PROVIDER_HOST_UNAVAILABLE");
    // No HOME or provider credentials: the host only needs the build root to find the Keychain helper.
    const environment = { PATH: "/usr/bin:/bin", LANG: "C" };
    if (absolute(runtime.env("AXIOSOZO_BUILD_ROOT"))) environment.AXIOSOZO_BUILD_ROOT = runtime.env("AXIOSOZO_BUILD_ROOT");
    const child = await runtime.spawn({ command: node, arguments: [path, "serve"], environmentAppend: false, environment, stderr: "pipe" });
    const owned = { child, pending: new Map(), retired: false };
    if (closed) { retire(owned, "cancelled"); throw new Error("CLOSED"); }
    read(owned).then(() => retire(owned, "HOST_UNAVAILABLE"), () => retire(owned, "HOST_UNAVAILABLE"));
    // Host stderr is discarded, never shown or retained.
    (async () => { while (await child.stderr?.readString()) { /* discarded */ } })().catch(() => {});
    child.wait().then(() => retire(owned, "HOST_UNAVAILABLE"), () => retire(owned, "HOST_UNAVAILABLE"));
    return owned;
  }
  async function ensureHost() {
    if (host && !host.retired) return host;
    starting ??= spawn().then(owned => { host = owned; return owned; }).finally(() => { starting = null; });
    return starting;
  }
  async function decide(request, { signal } = {}) {
    try {
      if (closed || signal?.aborted) return neutral(request, "cancelled");
      // Cheap shape gate so an obviously invalid request never starts a host; the host validates fully.
      if (!request || typeof request !== "object" || request.choice_set !== CHOICE_SET
        || typeof request.request_id !== "string" || !REQUEST_ID.test(request.request_id)
        || !["address", "outline"].includes(request.state?.observation?.level)) return neutral(request, "INVALID_INPUT");
      let owned;
      try { owned = await ensureHost(); } catch { return neutral(request, closed ? "cancelled" : "HOST_UNAVAILABLE"); }
      const id = runtime.uuid();
      let line;
      try { line = JSON.stringify({ version: 1, id, method: "decision/site_rule", params: request }) + "\n"; } catch { return neutral(request, "INVALID_INPUT"); }
      if (new TextEncoder().encode(line).length > MAX_LINE) return neutral(request, "INVALID_INPUT");
      if (closed || signal?.aborted) return neutral(request, "cancelled");
      try { await onSending({ request_id: request.request_id, level: request.state.observation.level }); }
      catch { return neutral(request, "cancelled"); }
      if (closed || signal?.aborted) return neutral(request, "cancelled");
      if (owned.retired) return neutral(request, "HOST_UNAVAILABLE");
      return await new Promise(resolve => {
        let timer = null, graceTimer = null, done = false;
        const onAbort = () => {
          // Ask the host to abort the actual fetch, then briefly wait for its accurate data_sent.
          owned.child.stdin.write(JSON.stringify({ version: 1, id: runtime.uuid(), method: "decision/cancel", params: { request_id: request.request_id } }) + "\n").catch(() => {});
          graceTimer = runtime.timers.setTimeout(() => settle(null, "cancelled"), CANCEL_GRACE_MS);
        };
        function settle(frame, failure) {
          if (done) return; done = true;
          owned.pending.delete(id); runtime.timers.clearTimeout(timer); runtime.timers.clearTimeout(graceTimer);
          signal?.removeEventListener("abort", onAbort);
          if (!frame) { resolve(neutral(request, failure, true)); return; }
          if (frame.error) { resolve(neutral(request, frame.error.code === "INVALID_INPUT" ? "INVALID_INPUT" : "HOST_UNAVAILABLE")); return; }
          // An invalid reply is untrusted, including its data_sent claim: disclose conservatively.
          resolve(validateDecisionResult(frame.result, request) ?? neutral(request, "malformed_output", true));
        }
        owned.pending.set(id, settle);
        const deadline = Number.isSafeInteger(request.deadline_ms) ? request.deadline_ms - runtime.now() : MAX_DEADLINE_MS;
        timer = runtime.timers.setTimeout(() => { settle(null, "timeout"); retire(owned, "HOST_UNAVAILABLE"); },
          Math.min(Math.max(deadline, 0), MAX_DEADLINE_MS) + REPLY_GRACE_MS);
        signal?.addEventListener("abort", onAbort, { once: true });
        owned.child.stdin.write(line).catch(() => { if (!done) { done = true; owned.pending.delete(id); runtime.timers.clearTimeout(timer);
          signal?.removeEventListener("abort", onAbort); resolve(neutral(request, "HOST_UNAVAILABLE")); retire(owned, "HOST_UNAVAILABLE"); } });
      });
    } catch { return neutral(request, "HOST_UNAVAILABLE"); } // Only pre-write steps can throw here.
  }
  async function close() {
    closed = true;
    const owned = host ?? await starting?.catch(() => null);
    if (owned) { retire(owned, "cancelled"); await owned.child.wait().catch(() => {}); }
  }
  return Object.freeze(Object.assign(decide, { close, diagnostics: () => ({ running: Boolean(host && !host.retired), closed }) }));
}
