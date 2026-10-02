/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// decision-v1 site-rule and watch requests from chrome: the on-demand provider host is the only
// network client and the only holder of the Keychain key. Chrome never sees the key.
const CHOICE_SET = "site_rule_v1";
const DECISION_TYPES = Object.freeze({
  site_rule_v1: Object.freeze({ choiceSet: "site_rule_v1", contextVersion: "site-rule-1", method: "decision/site_rule", neutral: "none" }),
  watch_v1: Object.freeze({ choiceSet: "watch_v1", contextVersion: "watch-1", method: "decision/watch", neutral: "unknown" }),
});
const PROVIDER_MODELS = Object.freeze({ jev: "jev-1.13.0", openai: "gpt-6-luna" });
const PROVIDERS = Object.freeze(["jev", "openai"]);
const OUTCOMES = Object.freeze(["none", "nudge", "suggest_leave", "pause_site"]);
const REASON_CODES = Object.freeze(["drift", "on_task", "off_context", "unclear"]);
export const DECISION_REASONS = Object.freeze(["validated", "disabled", "cancelled", "timeout", "BLOCKED_AUTH", "HTTP_ERROR",
  "NETWORK_ERROR", "KEYCHAIN_ERROR", "malformed_output", "budget_exhausted", "INVALID_INPUT", "IMAGE_UNSUPPORTED", "UNVERIFIED_SHAPE", "NOT_AUTHORIZED", "HOST_UNAVAILABLE"]);
const RESULT_KEYS = Object.freeze(["version", "request_id", "choice_set", "context_version", "outcome", "reason_code",
  "reason", "data_sent", "authority", "action_authorized", "model", "provider", "confidence", "shape_status"]);
const MAX_LINE = 73728; // provider-host HOST_LIMITS.lineBytes
const MAX_SCREEN_LINE = 1677721; // provider-host HOST_LIMITS.screenLineBytes
const MAX_FRAME = 1024 * 1024;
const MAX_DEADLINE_MS = 30000;
const REPLY_GRACE_MS = 2000;
const CANCEL_GRACE_MS = 1000;
const CLOSE_GRACE_MS = 1000;
const REQUEST_ID = /^[A-Za-z0-9_.:-]{1,160}$/u;
function absolute(value) { return typeof value === "string" && value.startsWith("/") && !/[\u0000-\u001f]/u.test(value); }
function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  return { spawn: options => Subprocess.call(options),
    timers: ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs"), now: () => Date.now(),
    env: name => Services.env.get(name), uuid: () => Services.uuid.generateUUID().toString().replace(/[{}]/gu, "") };
}
function decisionType(request) {
  return typeof request?.choice_set === "string" && Object.hasOwn(DECISION_TYPES, request.choice_set)
    ? DECISION_TYPES[request.choice_set] : null;
}
function requestProvider(request) {
  return request?.provider === undefined ? "jev" : PROVIDERS.includes(request.provider) ? request.provider : null;
}
function neutral(request, reason, dataSent = false) {
  const type = decisionType(request) ?? DECISION_TYPES.site_rule_v1;
  const provider = requestProvider(request);
  const requestId = typeof request?.request_id === "string" && REQUEST_ID.test(request.request_id) ? request.request_id : null;
  return Object.freeze({ version: 1, request_id: requestId, choice_set: type.choiceSet, context_version: type.contextVersion,
    outcome: type.neutral, ...(type.choiceSet === CHOICE_SET ? { reason_code: null } : {}),
    reason, data_sent: dataSent, authority: "suggestion_only", action_authorized: false, provider, confidence: null,
    ...(provider === "openai" ? { shape_status: "UNVERIFIED_SHAPE" } : {}) });
}

// This inexpensive gate keeps plainly unsupported input from spawning a host; the host
// still owns full decision-v1 validation, including PNG, address and state-size checks.
function requestShape(request) {
  const type = decisionType(request);
  if (!request || typeof request !== "object" || Array.isArray(request) || !type || request.version !== 1
    || request.context_version !== type.contextVersion || !requestProvider(request)
    || typeof request.request_id !== "string" || !REQUEST_ID.test(request.request_id)
    || !["address", "outline", "screen"].includes(request.state?.observation?.level)) return null;
  if (type.choiceSet === CHOICE_SET) {
    const effects = request.state?.rule?.effects;
    if (!Array.isArray(effects) || effects.length < 1 || effects.length > 3
      || effects.some(effect => effect === "none" || !OUTCOMES.includes(effect))
      || new Set(effects).size !== effects.length) return null;
  } else {
    const watch = request.state?.watch;
    if (!watch || typeof watch.id !== "string" || !/^w_[a-z0-9]{4,32}$/u.test(watch.id)
      || typeof watch.question !== "string" || watch.question.length < 1 || watch.question.length > 500
      || !Array.isArray(watch.outcomes) || watch.outcomes.length < 2 || watch.outcomes.length > 6) return null;
    const ids = new Set();
    for (const item of watch.outcomes) {
      if (!item || typeof item.id !== "string" || !/^[a-z][a-z0-9_]{0,31}$/u.test(item.id)
        || item.id === "unknown" || ids.has(item.id) || typeof item.label !== "string"
        || item.label.length < 1 || item.label.length > 80 || /[\u0000-\u001f\u007f]/u.test(item.label)) return null;
      ids.add(item.id);
    }
  }
  return type;
}

/** Re-validates a host reply against the request; returns a fresh frozen copy or null. */
export function validateDecisionResult(result, request) {
  const type = requestShape(request), provider = requestProvider(request);
  if (!type || !result || typeof result !== "object" || Array.isArray(result)) return null;
  const site = type.choiceSet === CHOICE_SET;
  const allowedKeys = RESULT_KEYS.filter(key => (site || key !== "reason_code") && (provider === "openai" || key !== "shape_status"));
  const required = ["version", "request_id", "choice_set", "context_version", "outcome", "reason", "data_sent", "authority", "action_authorized",
    ...(site ? ["reason_code"] : [])];
  if (!required.every(key => Object.hasOwn(result, key)) || !Object.keys(result).every(key => allowedKeys.includes(key))) return null;
  // The original Jev site-rule contract had neither additive field. Preserve that
  // exact legacy shape while normalizing every returned result to the new shape.
  const legacy = site && provider === "jev" && !Object.hasOwn(result, "provider") && !Object.hasOwn(result, "confidence");
  if (!legacy && (!Object.hasOwn(result, "provider") || result.provider !== provider || !Object.hasOwn(result, "confidence"))) return null;
  const confidence = legacy ? null : result.confidence;
  if (confidence !== null && !(typeof confidence === "number" && Number.isFinite(confidence) && confidence >= 0 && confidence <= 1)) return null;
  const isNeutral = result.outcome === type.neutral;
  const outcomes = site ? request.state.rule.effects : request.state.watch.outcomes.map(item => item.id);
  const ok = result.version === 1 && result.request_id === request.request_id && result.choice_set === type.choiceSet
    && result.context_version === type.contextVersion && (isNeutral || outcomes.includes(result.outcome))
    && DECISION_REASONS.includes(result.reason) && typeof result.data_sent === "boolean"
    && result.authority === "suggestion_only" && result.action_authorized === false
    && (result.model === undefined || result.model === PROVIDER_MODELS[provider])
    && (provider !== "openai" || result.shape_status === "UNVERIFIED_SHAPE")
    && (result.reason !== "UNVERIFIED_SHAPE" || provider === "openai")
    && (result.reason === "validated" ? result.data_sent === true && (legacy || confidence !== null) : isNeutral && confidence === null)
    && (isNeutral || result.reason === "validated" && result.data_sent === true && (legacy || confidence >= 0.8))
    && (!site || result.reason_code === null || REASON_CODES.includes(result.reason_code) && !isNeutral);
  if (!ok) return null;
  const copy = {};
  for (const key of allowedKeys) if (result[key] !== undefined) copy[key] = result[key];
  copy.provider = provider; copy.confidence = confidence;
  return Object.freeze(copy);
}

/**
 * contexts-api-v1 §3.5 `decide(request, { signal })`. Starts the provider host only
 * when called, reuses it until the host reports idle, and never rejects: every
 * failure resolves to the choice set's neutral outcome (`none` or `unknown`). `onSending({ request_id, level })` runs before
 * the request leaves chrome; if it throws, nothing is sent. When a request was
 * handed to the host but no valid reply arrived, `data_sent` is conservatively true.
 */
export function createDecide({ runtime, onSending = () => {} } = {}) {
  let host = null, starting = null, closed = false;
  const calls = new Set();
  const retire = (owned, reason) => {
    if (!owned) return Promise.resolve();
    if (owned.retired) return owned.retirement ?? Promise.resolve();
    owned.retired = true; if (host === owned) host = null;
    const { child } = owned;
    // wait() reports exit; Gecko worker disposal also waits for every pipe.
    // Force close all pipes even when a reader stopped with buffered output.
    owned.retirement = Promise.allSettled([
      () => child.stdin.close(true), () => child.stdout?.close?.(true), () => child.stderr?.close?.(true),
      () => child.kill(1000), () => child.wait(),
    ].map(action => Promise.resolve().then(action)));
    for (const settle of owned.pending.values()) settle(null, reason);
    owned.pending.clear();
    return owned.retirement;
  };
  async function read(owned) {
    let buffer = "";
    for (;;) {
      const chunk = await owned.child.stdout.readString();
      if (!chunk) return;
      buffer += chunk; if (new TextEncoder().encode(buffer).length > MAX_FRAME) throw new Error("PROVIDER_OUTPUT_LIMIT");
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        const frame = JSON.parse(line);
        if (frame?.version !== 1) throw new Error("INVALID_PROVIDER_FRAME");
        if (typeof frame.id === "string") owned.pending.get(frame.id)?.(frame);
        else if (frame.event?.type === "host_idle") void retire(owned, "HOST_UNAVAILABLE");
      }
    }
  }
  async function spawn() {
    const node = runtime.env("AXIOSOZO_PROVIDER_NODE"); const path = runtime.env("AXIOSOZO_PROVIDER_HOST");
    if (!absolute(node) || !absolute(path) || !path.endsWith("/packages/provider-host/cli.mjs")) throw new Error("PROVIDER_HOST_UNAVAILABLE");
    const environment = { PATH: "/usr/bin:/bin", LANG: "C" };
    if (absolute(runtime.env("AXIOSOZO_BUILD_ROOT"))) environment.AXIOSOZO_BUILD_ROOT = runtime.env("AXIOSOZO_BUILD_ROOT");
    const child = await runtime.spawn({ command: node, arguments: [path, "serve"], environmentAppend: false, environment, stderr: "pipe" });
    const owned = { child, pending: new Map(), retired: false, retirement: null };
    if (closed) { void retire(owned, "cancelled"); throw new Error("CLOSED"); }
    read(owned).then(() => retire(owned, "HOST_UNAVAILABLE"), () => retire(owned, "HOST_UNAVAILABLE"));
    (async () => { while (await child.stderr?.readString()) { /* discarded */ } })()
      .catch(() => retire(owned, "HOST_UNAVAILABLE"));
    Promise.resolve().then(() => child.wait()).then(() => retire(owned, "HOST_UNAVAILABLE"), () => retire(owned, "HOST_UNAVAILABLE"));
    return owned;
  }
  function releaseStartup(call) {
    const startup = call.startup;
    if (!startup) return;
    startup.waiters.delete(call); call.startup = null;
    if (!startup.settled && startup.waiters.size === 0) {
      startup.abandoned = true;
      if (starting === startup) starting = null;
    }
  }
  async function ensureHost(call) {
    if (host && !host.retired) return host;
    if (!starting) {
      const startup = { promise: null, waiters: new Set(), abandoned: false, settled: false };
      starting = startup;
      startup.promise = spawn().then(owned => {
        startup.settled = true;
        if (closed || startup.abandoned || startup.waiters.size === 0 || owned.retired) {
          void retire(owned, closed ? "cancelled" : "HOST_UNAVAILABLE"); throw new Error("STARTUP_ABANDONED");
        }
        host = owned; return owned;
      }).finally(() => { startup.settled = true; if (starting === startup) starting = null; });
    }
    const startup = starting; startup.waiters.add(call); call.startup = startup;
    try { return await startup.promise; } finally { releaseStartup(call); }
  }
  async function decide(request, { signal } = {}) {
    try {
      if (closed || signal?.aborted) return neutral(request, "cancelled");
      const type = requestShape(request);
      if (!type) return neutral(request, "INVALID_INPUT");
      runtime ??= nativeRuntime();
      if (!Number.isSafeInteger(request.deadline_ms) || request.deadline_ms - runtime.now() > MAX_DEADLINE_MS) return neutral(request, "INVALID_INPUT");
      if (request.deadline_ms <= runtime.now()) return neutral(request, "timeout");
      const id = runtime.uuid();
      let line;
      try { line = JSON.stringify({ version: 1, id, method: type.method, params: request }) + "\n"; } catch { return neutral(request, "INVALID_INPUT"); }
      const lineLimit = request.state.observation.level === "screen" ? MAX_SCREEN_LINE : MAX_LINE;
      if (new TextEncoder().encode(line).length > lineLimit) return neutral(request, "INVALID_INPUT");
      return await new Promise(resolve => {
        const call = { active: true, startup: null, close: null };
        let owned = null, timer = null, graceTimer = null, handedOff = false, abortRequested = false, deadlineExpired = false;
        function settle(frame, failure, dataSent = handedOff) {
          if (!call.active) return;
          call.active = false; calls.delete(call); releaseStartup(call);
          owned?.pending.delete(id); runtime.timers.clearTimeout(timer); runtime.timers.clearTimeout(graceTimer);
          signal?.removeEventListener("abort", onAbort);
          if (!frame) { resolve(neutral(request, abortRequested || signal?.aborted ? "cancelled" : failure, dataSent)); return; }
          if (frame.error) { resolve(neutral(request, abortRequested || signal?.aborted ? "cancelled" : frame.error.code === "INVALID_INPUT" ? "INVALID_INPUT" : "HOST_UNAVAILABLE")); return; }
          const validated = validateDecisionResult(frame.result, request);
          if (abortRequested || signal?.aborted) {
            resolve(neutral(request, "cancelled", validated ? validated.data_sent : handedOff)); return;
          }
          // Reply grace permits accurate disclosure, never a late effect/status.
          if (validated && validated.outcome !== type.neutral && (deadlineExpired || runtime.now() >= request.deadline_ms)) {
            resolve(neutral(request, "timeout", validated.data_sent)); return;
          }
          resolve(validated ?? neutral(request, "malformed_output", handedOff));
        }
        const onAbort = () => {
          if (!call.active || abortRequested) return;
          abortRequested = true;
          if (!handedOff) { settle(null, "cancelled", false); return; }
          Promise.resolve().then(() => owned.child.stdin.write(JSON.stringify({ version: 1, id: runtime.uuid(), method: "decision/cancel", params: { request_id: request.request_id } }) + "\n")).catch(() => {});
          runtime.timers.clearTimeout(graceTimer);
          graceTimer = runtime.timers.setTimeout(() => settle(null, "cancelled"), CANCEL_GRACE_MS);
        };
        const onDeadline = () => {
          runtime.timers.clearTimeout(timer); timer = null;
          if (!call.active || abortRequested) return;
          deadlineExpired = true;
          if (!handedOff) { settle(null, "timeout", false); return; }
          runtime.timers.clearTimeout(graceTimer);
          graceTimer = runtime.timers.setTimeout(() => {
            settle(null, "timeout", true); void retire(owned, "HOST_UNAVAILABLE");
          }, REPLY_GRACE_MS);
        };
        call.close = () => { abortRequested = true; settle(null, "cancelled", handedOff); };
        calls.add(call);
        // The entire lifetime is covered, including a hung shared spawn/indicator.
        timer = runtime.timers.setTimeout(onDeadline, Math.max(0, request.deadline_ms - runtime.now()));
        signal?.addEventListener("abort", onAbort, { once: true });
        if (signal?.aborted) { onAbort(); return; }
        (async () => {
          if (runtime.now() >= request.deadline_ms) { settle(null, "timeout", false); return; }
          try { owned = await ensureHost(call); }
          catch { settle(null, closed ? "cancelled" : "HOST_UNAVAILABLE", false); return; }
          if (!call.active) return;
          if (closed || signal?.aborted) { onAbort(); return; }
          if (runtime.now() >= request.deadline_ms) { settle(null, "timeout", false); return; }
          try { await onSending({ request_id: request.request_id, level: request.state.observation.level }); }
          catch { settle(null, "cancelled", false); return; }
          if (!call.active) return;
          if (closed || signal?.aborted) { onAbort(); return; }
          if (runtime.now() >= request.deadline_ms) { settle(null, "timeout", false); return; }
          if (owned.retired) { settle(null, "HOST_UNAVAILABLE", false); return; }
          owned.pending.set(id, settle);
          handedOff = true;
          try {
            Promise.resolve(owned.child.stdin.write(line)).catch(() => {
              settle(null, "HOST_UNAVAILABLE", true); void retire(owned, "HOST_UNAVAILABLE");
            });
          } catch { settle(null, "HOST_UNAVAILABLE", true); void retire(owned, "HOST_UNAVAILABLE"); }
        })().catch(() => settle(null, "HOST_UNAVAILABLE"));
      });
    } catch { return neutral(request, "HOST_UNAVAILABLE"); }
  }
  async function close() {
    closed = true;
    for (const call of [...calls]) call.close();
    if (starting) { starting.abandoned = true; starting = null; }
    const owned = host;
    if (!owned) return;
    let timer;
    try {
      await Promise.race([retire(owned, "cancelled"), new Promise(resolve => {
        timer = runtime.timers.setTimeout(resolve, CLOSE_GRACE_MS);
      })]);
    } finally { runtime.timers.clearTimeout(timer); }
  }
  return Object.freeze(Object.assign(decide, { close, diagnostics: () => ({ running: Boolean(host && !host.retired), closed }) }));
}
