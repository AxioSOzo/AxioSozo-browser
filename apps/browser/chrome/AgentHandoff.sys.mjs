/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// P3 handoff: data validation and dispatch only. Native tab observation,
// clipboard and terminal primitives are injected. This module has no DOM,
// chrome globals, timers, subprocess, filesystem or provider calls.
export const HANDOFF_LIMITS = Object.freeze({ url: 4096, title: 512, selection: 16384, task: 8192,
  errors: 50, errorText: 1000, imageBytes: 1048576, imageSide: 1280, totalBytes: 1572864 });
export const HANDOFF_REASONS = Object.freeze(["INVALID_INPUT", "INVALID_IMAGE", "TOO_LARGE", "PRIVATE", "BLOCKED_CATEGORY", "PASSWORD_RISK", "POLICY_UNAVAILABLE", "STALE_TAB", "OBSERVATION_MISMATCH", "CANCELLED", "DUPLICATE_REQUEST", "BUSY", "USER_ACTION_REQUIRED", "TERMINAL_UNAVAILABLE", "CLIPBOARD_UNAVAILABLE", "LAUNCH_UNCERTAIN", "UNVERIFIED_CAPABILITY", "NOT_AUTHORIZED", "NO_PROJECT", "HANDOFF_FAILED", "TIMEOUT", "SPAWN_FAILED", "INVALID_POLICY", "INVALID_REQUEST", "UNSAFE_PATH", "POLICY_CHANGED", "PROJECT_CHANGED", "PROJECT_DENIED", "EXPIRED", "DRIVER_FAILED", "LAUNCH_TIMEOUT", "HELPER_UNAVAILABLE"]);
export const HANDOFF_TARGETS = Object.freeze(["clipboard", "codex", "claude-code", "desktop"]);
const ID = /^hf_[0-9a-f]{16}$/u;
const TAB = /^t_[0-9]+$/u;
const PROJECT = /^p_[a-z0-9]{4,32}$/u;
const LINE_CONTROL = /[\u0000-\u001f\u007f-\u009f]/u;
const UNPAIRED_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
const PROSE_CONTROL = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/u;
const ENCODER = new TextEncoder();
const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const fail = code => { const error = new Error(code); error.code = code; throw error; };
const freeze = value => {
  if (value && typeof value === "object") { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
};
function object(value, keys, required = keys) {
  if (!value || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail("INVALID_INPUT");
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Object.keys(descriptors).some(key => !keys.includes(key) || !Object.hasOwn(descriptors[key], "value"))
    || required.some(key => !Object.hasOwn(descriptors, key))) fail("INVALID_INPUT");
  return value;
}
function text(value, cap, { prose = false, empty = true } = {}) {
  if (typeof value !== "string" || value.length > cap || (!empty && !value.length) || (prose ? PROSE_CONTROL : LINE_CONTROL).test(value) || UNPAIRED_SURROGATE.test(value)) fail("INVALID_INPUT");
  return value;
}
function absolute(value) {
  return typeof value === "string" && value.length > 1 && value.length <= HANDOFF_LIMITS.url && value.startsWith("/")
    && !LINE_CONTROL.test(value) && !value.includes("\\") && value.split("/").slice(1).every(part => part && part !== "." && part !== "..");
}
function epoch(value) { if (!Number.isSafeInteger(value) || value < 0) fail("INVALID_INPUT"); return value; }
export function handoffWebUrl(value) {
  text(value, HANDOFF_LIMITS.url, { empty: false });
  let url;
  try { url = new URL(value); } catch { fail("INVALID_INPUT"); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname) fail("INVALID_INPUT");
  url.search = ""; url.hash = "";
  return url.href;
}
function project(value) {
  if (value === null) return null;
  object(value, ["id", "root"]);
  if (typeof value.id !== "string" || !PROJECT.test(value.id) || !absolute(value.root)) fail("INVALID_INPUT");
  return { id: value.id, root: value.root };
}

/** Native-only descriptor. Unknown privacy facts and policy failures deny. */
export function handoffPolicy(tab, { isSensitiveHost } = {}) {
  try {
    object(tab, ["tab_id", "navigation_id", "url", "is_private", "blocked_category", "password_risk", "project"]);
    if (typeof tab.tab_id !== "string" || !TAB.test(tab.tab_id) || typeof tab.navigation_id !== "string" || !tab.navigation_id.length || tab.navigation_id.length > 160 || LINE_CONTROL.test(tab.navigation_id)) return "INVALID_INPUT";
    if (tab.is_private !== false) return "PRIVATE";
    if (tab.blocked_category !== false) return "BLOCKED_CATEGORY";
    if (tab.password_risk !== false) return "PASSWORD_RISK";
    const url = new URL(handoffWebUrl(tab.url));
    project(tab.project);
    if (typeof isSensitiveHost !== "function") return "POLICY_UNAVAILABLE";
    const category = isSensitiveHost(url.hostname);
    if (!category || typeof category.sensitive !== "boolean") return "POLICY_UNAVAILABLE";
    return category.sensitive ? "BLOCKED_CATEGORY" : null;
  } catch { return "INVALID_INPUT"; }
}
function image(screen) {
  if (screen === null) return null;
  object(screen, ["mime", "width", "height", "data_base64"]);
  const data = screen.data_base64;
  if (screen.mime !== "image/png" || ![screen.width, screen.height].every(side => Number.isSafeInteger(side) && side >= 1 && side <= HANDOFF_LIMITS.imageSide)
    || typeof data !== "string" || data.length < 44 || data.length % 4 !== 0 || data.length > Math.ceil(HANDOFF_LIMITS.imageBytes / 3) * 4
    || !/^[A-Za-z0-9+/]+={0,2}$/u.test(data)) fail("INVALID_IMAGE");
  const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
  const decodedBytes = data.length / 4 * 3 - padding;
  const last = BASE64.indexOf(data[data.length - padding - 1]);
  if (decodedBytes < 33 || decodedBytes > HANDOFF_LIMITS.imageBytes || (padding === 2 && (last & 15)) || (padding === 1 && (last & 3))) fail("INVALID_IMAGE");
  // Only a bounded header is decoded. The image is native screenshot output;
  // this validates type, size and dimensions, not pixel contents or PNG CRCs.
  const header = [];
  for (let offset = 0; header.length < 33; offset += 4) {
    const a = BASE64.indexOf(data[offset]), b = BASE64.indexOf(data[offset + 1]);
    const c = BASE64.indexOf(data[offset + 2]), d = BASE64.indexOf(data[offset + 3]);
    header.push(a << 2 | b >> 4);
    if (c >= 0) header.push((b & 15) << 4 | c >> 2);
    if (d >= 0) header.push((c & 3) << 6 | d);
  }
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  const number = offset => header[offset] * 16777216 + header[offset + 1] * 65536 + header[offset + 2] * 256 + header[offset + 3];
  if (!signature.every((byte, offset) => header[offset] === byte) || number(8) !== 13
    || String.fromCharCode(...header.slice(12, 16)) !== "IHDR" || number(16) !== screen.width || number(20) !== screen.height) fail("INVALID_IMAGE");
  return { mime: "image/png", width: screen.width, height: screen.height, data_base64: data };
}
function errors(values) {
  if (!Array.isArray(values) || values.length > HANDOFF_LIMITS.errors) fail("INVALID_INPUT");
  return values.map(value => {
    object(value, ["level", "text", "source", "line", "at"]);
    if (!["error", "warning"].includes(value.level)) fail("INVALID_INPUT");
    if (value.line !== null && (!Number.isSafeInteger(value.line) || value.line < 0 || value.line > 10000000)) fail("INVALID_INPUT");
    let source = null;
    if (value.source !== null) { try { source = handoffWebUrl(value.source); } catch { /* File/chrome/internal sources stay out. */ } }
    return { level: value.level, text: text(value.text, HANDOFF_LIMITS.errorText, { prose: true, empty: false }), source, line: value.line, at: epoch(value.at) };
  });
}
export function validateHandoffContext(value) {
  object(value, ["version", "request_id", "created_at", "project", "page", "console_errors", "task"]);
  if (value.version !== 1 || typeof value.request_id !== "string" || !ID.test(value.request_id)) fail("INVALID_INPUT");
  object(value.page, ["url", "title", "selection", "screen"]);
  const url = handoffWebUrl(value.page.url);
  if (url !== value.page.url) fail("INVALID_INPUT");
  const copy = { version: 1, request_id: value.request_id, created_at: epoch(value.created_at), project: project(value.project),
    page: { url, title: text(value.page.title, HANDOFF_LIMITS.title),
      selection: value.page.selection === null ? null : text(value.page.selection, HANDOFF_LIMITS.selection, { prose: true }), screen: image(value.page.screen) },
    console_errors: errors(value.console_errors), task: text(value.task, HANDOFF_LIMITS.task, { prose: true }) };
  if (ENCODER.encode(JSON.stringify(copy)).length > HANDOFF_LIMITS.totalBytes) fail("TOO_LARGE");
  return freeze(copy);
}

/** Privacy checked before any collected title, selection, errors or image is read. */
export function buildHandoffContext(input, { isSensitiveHost } = {}) {
  const reason = handoffPolicy(input?.tab, { isSensitiveHost });
  if (reason) fail(reason);
  object(input, ["request_id", "created_at", "tab", "task", "capture"]);
  object(input.capture, ["tab_id", "navigation_id", "url", "title", "selection", "screen", "console_errors"]);
  if (input.capture.tab_id !== input.tab.tab_id || input.capture.navigation_id !== input.tab.navigation_id || input.capture.url !== input.tab.url) fail("STALE_TAB");
  return validateHandoffContext({ version: 1, request_id: input.request_id, created_at: input.created_at, project: input.tab.project,
    page: { url: handoffWebUrl(input.tab.url), title: input.capture.title, selection: input.capture.selection, screen: input.capture.screen },
    console_errors: input.capture.console_errors, task: input.task });
}
export function serializeHandoffContext(value) {
  const serialized = JSON.stringify(validateHandoffContext(value), null, 2) + "\n";
  if (ENCODER.encode(serialized).length > HANDOFF_LIMITS.totalBytes) fail("TOO_LARGE");
  return serialized;
}
const result = (requestId, status, target, reason) => Object.freeze({ version: 1, request_id: requestId, status, target, reason });
function sameTab(before, after) {
  return after && before.tab_id === after.tab_id && before.navigation_id === after.navigation_id && before.url === after.url
    && JSON.stringify(before.project) === JSON.stringify(after.project);
}

/**
 * Service called by trusted chrome user actions, never directly by web content.
 * isUserRequest is a native caller's opaque, one-shot gesture authorization;
 * it must not accept an actor's self-reported boolean. All tab adapters are
 * chrome-owned and must exclude private/password data before collection.
 * terminal accepts a structured context; it owns fixed trusted argv and files.
 */
export function createHandoff({ tabs, isSensitiveHost, isUserRequest, clipboard, terminal, clock, testOnlyLaunch = null } = {}) {
  let closed = false;
  const pending = new Set();
  async function send(request, { signal } = {}) {
    let requestId = null, ownsPending = false;
    try {
      object(request, ["request_id", "tab_id", "task", "target", "include_selection", "include_screen", "include_console", "fallback_to_clipboard"],
        ["request_id", "tab_id", "task", "target"]);
      if (typeof request.request_id !== "string" || !ID.test(request.request_id) || (typeof request.tab_id !== "string" || !TAB.test(request.tab_id)) || !HANDOFF_TARGETS.includes(request.target)) fail("INVALID_INPUT");
      requestId = request.request_id;
      text(request.task, HANDOFF_LIMITS.task, { prose: true });
      for (const key of ["include_selection", "include_screen", "include_console", "fallback_to_clipboard"]) if (Object.hasOwn(request, key) && typeof request[key] !== "boolean") fail("INVALID_INPUT");
      if (closed || signal?.aborted) return result(requestId, "cancelled", null, "CANCELLED");
      if (pending.has(requestId)) return result(requestId, "failed", null, "DUPLICATE_REQUEST");
      if (pending.size >= 8) return result(requestId, "failed", null, "BUSY");
      pending.add(requestId); ownsPending = true;
      if (typeof isUserRequest !== "function" || await isUserRequest(request) !== true) return result(requestId, "denied", null, "USER_ACTION_REQUIRED");
      const active = () => !closed && !signal?.aborted;
      if (!active()) return result(requestId, "cancelled", null, "CANCELLED");
      const before = await tabs.describe(request.tab_id);
      if (!active()) return result(requestId, "cancelled", null, "CANCELLED");
      const policy = handoffPolicy(before, { isSensitiveHost });
      if (policy) return result(requestId, "denied", null, policy);
      if (before.tab_id !== request.tab_id) return result(requestId, "denied", null, "STALE_TAB");
      const capture = await tabs.capture(request.tab_id, { navigation_id: before.navigation_id,
        include_selection: request.include_selection ?? true, include_screen: request.include_screen ?? false,
        include_console: request.include_console ?? true, signal });
      if (!active()) return result(requestId, "cancelled", null, "CANCELLED");
      const after = await tabs.describe(request.tab_id);
      if (!active()) return result(requestId, "cancelled", null, "CANCELLED");
      const latestPolicy = handoffPolicy(after, { isSensitiveHost });
      if (latestPolicy) return result(requestId, "denied", null, latestPolicy);
      if (!sameTab(before, after)) return result(requestId, "denied", null, "STALE_TAB");
      // Recheck requested opt-ins rather than trusting a collector to omit them.
      object(capture, ["tab_id", "navigation_id", "url", "title", "selection", "screen", "console_errors"]);
      if ((request.include_selection === false && capture.selection !== null) || (request.include_screen !== true && capture.screen !== null)
        || (request.include_console === false && (!Array.isArray(capture.console_errors) || capture.console_errors.length))) fail("OBSERVATION_MISMATCH");
      const context = buildHandoffContext({ request_id: requestId, created_at: clock(), tab: after, task: request.task, capture }, { isSensitiveHost });
      let fallback = null;
      if (request.target !== "clipboard") {
        // Product agent launches stay gated. A test fixture is an injected
        // explicit launcher, never a pref, page-provided executable or PATH.
        if (["codex", "claude-code"].includes(request.target) && testOnlyLaunch && context.project) {
          if (typeof terminal?.launch !== "function") fallback = "TERMINAL_UNAVAILABLE";
          else {
            const launched = await terminal.launch({ agent: request.target, context, test_only: true, signal, configuration: testOnlyLaunch });
            if (launched?.status === "handed_off") return result(requestId, "handed_off", request.target, null);
            // A launcher must report whether an external session could exist.
            // Never duplicate an ambiguous launch by falling back to clipboard.
            if (launched?.may_have_launched !== false) return result(requestId, "failed", request.target, "LAUNCH_UNCERTAIN");
            fallback = HANDOFF_REASONS.includes(launched.reason) ? launched.reason : "TERMINAL_UNAVAILABLE";
          }
        } else fallback = request.target === "desktop" ? "UNVERIFIED_CAPABILITY" : context.project ? "NOT_AUTHORIZED" : "NO_PROJECT";
        if (request.fallback_to_clipboard === false) return result(requestId, "unavailable", request.target, fallback);
      }
      if (!active()) return result(requestId, "cancelled", null, "CANCELLED");
      const finalTab = await tabs.describe(request.tab_id);
      const finalPolicy = handoffPolicy(finalTab, { isSensitiveHost });
      if (finalPolicy) return result(requestId, "denied", null, finalPolicy);
      if (!sameTab(after, finalTab)) return result(requestId, "denied", null, "STALE_TAB");
      if (typeof clipboard?.write !== "function") return result(requestId, "failed", "clipboard", "CLIPBOARD_UNAVAILABLE");
      if (!active()) return result(requestId, "cancelled", null, "CANCELLED");
      await clipboard.write(serializeHandoffContext(context));
      return result(requestId, "copied", "clipboard", fallback);
    } catch (error) { return result(requestId, "failed", null, HANDOFF_REASONS.includes(error?.code) ? error.code : "HANDOFF_FAILED"); }
    finally { if (ownsPending) pending.delete(requestId); }
  }
  return Object.freeze({ send, close: () => { closed = true; }, diagnostics: () => Object.freeze({ closed, active: pending.size }) });
}
