/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free Understand integration. All process/I/O boundaries are injected.
// Product runs fail closed before transport creation. The explicit test-only
// constructor seam is never passed by production Services or an actor.
export const UNDERSTAND_LIVE = "NOT_AUTHORIZED";
export const UNDERSTAND_LIMITS = Object.freeze({ queued: 4, minTimeoutMs: 10000,
  maxTimeoutMs: 300000, defaultTimeoutMs: 180000, outputBytes: 262144,
  metadataBytes: 8192, requestBytes: 73728, briefBytes: 262144, cancelGraceMs: 1000 });
const CLIS = Object.freeze(["claude-code", "codex"]);
const KINDS = Object.freeze(["brief", "explain_errors"]);
const RESULT_KEYS = Object.freeze(["version", "request_id", "kind", "cli", "status",
  "reason", "document", "data_sent", "duration_ms"]);
const REASONS = Object.freeze({ failed: ["SPAWN_FAILED", "EXIT_NONZERO", "CLI_REPORTED_ERROR", "HOST_CLOSED", "HOST_UNAVAILABLE"],
  cancelled: ["CANCELLED", "HOST_CLOSED", "STALE_PROJECT"], timeout: ["TIMEOUT"],
  unavailable: ["NOT_AUTHORIZED", "CLI_NOT_INSTALLED", "SPAWN_FAILED", "HOST_UNAVAILABLE"],
  invalid_output: ["OUTPUT_LIMIT", "SCHEMA_MISMATCH"], busy: ["QUEUE_FULL"] });
const ID = /^[A-Za-z0-9_.:-]{1,160}$/u;
const LINE_CONTROL = /[\u0000-\u001f\u007f]/u;
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
function fail(code) { const error = new Error(code); error.code = code; throw error; }
function required(value, keys) {
  if (!object(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) fail("INVALID_INPUT");
}
function allowed(value, keys) {
  if (!object(value) || Object.keys(value).some(key => !keys.includes(key))) fail("INVALID_INPUT");
}
function boundedJSON(value, maxBytes) {
  let text;
  try { text = JSON.stringify(value); } catch { fail("INVALID_INPUT"); }
  if (typeof text !== "string" || new TextEncoder().encode(text).byteLength > maxBytes) fail("OUTPUT_LIMIT");
  return JSON.parse(text);
}
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function absolute(value) {
  return typeof value === "string" && value.startsWith("/") && value.length <= 4096
    && !LINE_CONTROL.test(value) && !value.includes("\\")
    && value !== "/" && !value.endsWith("/")
    && !value.split("/").some((part, index) => index > 0 && (!part || part === "." || part === ".."));
}
function revision(value) { return typeof value === "string" && ID.test(value) || Number.isSafeInteger(value) && value >= 0; }
export function projectBinding(snapshot) {
  required(snapshot, ["id", "revision", "canonicalRoot"]);
  if (!ID.test(snapshot.id) || !revision(snapshot.revision) || !absolute(snapshot.canonicalRoot)) fail("INVALID_PROJECT");
  return freeze({ id: snapshot.id, revision: snapshot.revision, canonicalRoot: snapshot.canonicalRoot });
}
export function sameProjectBinding(a, b) {
  return object(a) && object(b) && typeof a.id === "string" && ID.test(a.id)
    && revision(a.revision) && absolute(a.canonicalRoot)
    && a.id === b.id && a.revision === b.revision && a.canonicalRoot === b.canonicalRoot;
}
function webUrl(value) {
  if (typeof value !== "string" || value.length > 2048 || LINE_CONTROL.test(value)) fail("INVALID_INPUT");
  let url; try { url = new URL(value); } catch { fail("INVALID_INPUT"); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash
      || value.includes("?") || value.includes("#")) fail("INVALID_INPUT");
  return url.href;
}
function source(value) {
  if (value === null) return null;
  if (typeof value !== "string" || value.length > 2048 || LINE_CONTROL.test(value)) fail("INVALID_INPUT");
  if (/^[a-z][a-z0-9+.-]*:/iu.test(value)) {
    let url; try { url = new URL(value); } catch { fail("INVALID_INPUT"); }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) fail("INVALID_INPUT");
    url.search = ""; url.hash = ""; return url.href;
  }
  const relative = value.split(/[?#]/u, 1)[0];
  if (relative.startsWith("/") || relative.startsWith("~") || relative.includes("\\")
      || relative.split("/").some(part => part === ".." || /^\.env/iu.test(part))) fail("INVALID_INPUT");
  return relative;
}
export function validateErrorsInput(value) {
  required(value, ["url", "errors"]);
  if (!Array.isArray(value.errors) || value.errors.length < 1 || value.errors.length > 50) fail("INVALID_INPUT");
  return freeze({ url: webUrl(value.url), errors: value.errors.map(error => {
    required(error, ["level", "text", "source", "line"]);
    if (!["error", "warning"].includes(error.level) || typeof error.text !== "string" || !error.text.trim()
        || error.text.length > 1000 || /[\u0000\u007f]/u.test(error.text)
        || error.line !== null && (!Number.isSafeInteger(error.line) || error.line < 0 || error.line > 10000000)) fail("INVALID_INPUT");
    return { level: error.level, text: error.text, source: source(error.source), line: error.line };
  }) });
}
function strictErrorsDocument(value) {
  required(value, ["version", "summary", "items"]);
  const text = (input, max) => {
    if (typeof input !== "string" || !input.trim() || input.trim().length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(input)) fail("INVALID_INPUT");
    return input.trim();
  };
  if (value.version !== 1 || !Array.isArray(value.items) || value.items.length > 10) fail("INVALID_INPUT");
  return { version: 1, summary: text(value.summary, 400), items: value.items.map(item => {
    required(item, ["error", "likely_cause", "where"]);
    let where = null;
    if (item.where !== null) {
      where = text(item.where, 200);
      const segments = where.split("/");
      if (LINE_CONTROL.test(where) || where.startsWith("/") || where.startsWith("~") || where.includes("\\")
          || where.includes("?") || where.includes("#") || /^[a-z][a-z0-9+.-]*:/iu.test(where)
          || segments.length > 16 || segments.some(part => !part || part === "." || part === ".." || /^\.env/iu.test(part))) fail("INVALID_INPUT");
    }
    return { error: text(item.error, 200), likely_cause: text(item.likely_cause, 400), where };
  }) };
}
function result(request, status, reason, dataSent = false, duration = 0) {
  return freeze({ version: 1, request_id: request.request_id, kind: request.kind, cli: request.cli,
    status, reason, document: null, data_sent: dataSent, duration_ms: duration });
}
/** Strict host result validation. Unknown keys/contradictory terminal states fail. */
export function validateUnderstandResult(value, request, { core, now = Date.now() } = {}) {
  try {
    value = boundedJSON(value, UNDERSTAND_LIMITS.outputBytes);
    required(value, RESULT_KEYS);
    if (value.version !== 1 || value.request_id !== request.request_id || value.kind !== request.kind || value.cli !== request.cli
        || typeof value.data_sent !== "boolean" || !Number.isSafeInteger(value.duration_ms) || value.duration_ms < 0
        || value.duration_ms > UNDERSTAND_LIMITS.maxTimeoutMs + 10000) return null;
    if (value.status === "ok") {
      if (value.reason !== null || value.data_sent !== true || value.document === null) return null;
      const document = request.kind === "brief"
        ? core.validateBriefRecord({ version: 1, cli: request.cli, generated_at: now, accepted: false,
          document: value.document }).document
        : strictErrorsDocument(value.document);
      return freeze({ ...value, document });
    }
    if (!REASONS[value.status]?.includes(value.reason) || value.document !== null
        || ["busy", "unavailable"].includes(value.status) && value.data_sent !== false) return null;
    return freeze(value);
  } catch { return null; }
}
/** Contract-compatible bounded profile record. No revision/root is persisted in the brief. */
export function makeBriefRecord(completion, current, { core, now = Date.now() } = {}) {
  if (!sameProjectBinding(completion?.binding, projectBinding(current)) || completion.result?.kind !== "brief"
      || completion.result?.status !== "ok" || completion.result?.reason !== null || completion.result?.data_sent !== true) fail("STALE_PROJECT");
  const validated = validateUnderstandResult(completion.result, {
    request_id: completion.result.request_id, kind: "brief", cli: completion.result.cli }, { core, now });
  if (!validated) fail("INVALID_BRIEF");
  return freeze(core.validateBriefRecord(boundedJSON({ version: 1, cli: validated.cli,
    generated_at: now, accepted: false, document: validated.document }, UNDERSTAND_LIMITS.briefBytes)));
}
/** Copy-and-validate profile mutation; the owner must commit under its revision lock. */
export function withProjectBrief(project, brief, { core, now = Date.now() } = {}) {
  if (!Number.isSafeInteger(now) || now < 0) fail("INVALID_INPUT");
  return core.validateProject({ ...core.upgradeProject(project), brief: core.validateBriefRecord(boundedJSON(brief, UNDERSTAND_LIMITS.briefBytes)),
    updated_at: now });
}
/**
 * Prepares an explicit name/kind acceptance only. Does not infer fields from an
 * AI document or perform I/O. A trusted no-follow/owned-root writer must consume
 * this plan under the same project revision lock, then mark accepted only after a successful write. The returned brief is unchanged.
 */
export function prepareBriefAcceptance({ binding, current, brief, manifest, confirmed, path }, { core } = {}) {
  binding = projectBinding(binding); current = projectBinding(current);
  if (!sameProjectBinding(binding, current)) fail("STALE_PROJECT");
  if (path !== `${binding.canonicalRoot}/.axiosozo/project.json`) fail("UNSAFE_MANIFEST_PATH");
  required(confirmed, ["name", "kind", "confirmed"]);
  if (confirmed.confirmed !== true) fail("NOT_CONFIRMED");
  const record = core.validateBriefRecord(boundedJSON(brief, UNDERSTAND_LIMITS.briefBytes));
  const original = core.validateManifest(manifest);
  const changed = core.validateManifest({ ...original, name: confirmed.name, kind: confirmed.kind });
  // Existing manifest serialization applies its no-secret/no-local-path checks.
  const manifestText = core.serializeManifest(changed);
  return freeze({ version: 1, binding, path, manifest: changed, manifestText, brief: record });
}
/**
 * Runtime seam: request(method, params, { signal, timeoutMs, maxOutputBytes, isActive }),
 * cancel({ request_id }), close(). request may return a JSON value or JSON text.
 * It must terminate/reap an owned child on abort/close; this controller additionally
 * imposes a deadline, grace and decoded JSON cap. No CLI shell command exists here.
 */
export function createUnderstand({ runtime = null, lookupProject, core, onState = () => {}, authorizeContext = () => false,
  timers = globalThis, now = () => Date.now(), uuid, testOnlyAllowRun = false } = {}) {
  if (typeof lookupProject !== "function" || typeof uuid !== "function" || !core?.validateBriefRecord) fail("INVALID_DEPENDENCIES");
  let closed = false, running = null, queue = [], sequence = 0, suspended = 0, pumping = false;
  const pending = new Map(), invalidating = new Map();
  const emit = state => {
    // State observers may synchronously enqueue, cancel or revoke projects.
    // Defer dispatch until the outer state transition is fully finished.
    suspended++;
    try { onState(freeze(state)); } catch { /* Indicators cannot alter trust. */ }
    finally { suspended--; }
  };
  const snapshot = projectId => {
    const value = projectBinding(lookupProject(projectId));
    if (value.id !== projectId) fail("INVALID_PROJECT");
    return value;
  };
  const current = binding => { try { return sameProjectBinding(binding, snapshot(binding.id)); } catch { return false; } };
  const allowedContext = (context, binding) => { try { return authorizeContext(context, binding) === true; } catch { return false; } };
  const authorityActive = isActive => { try { return isActive() === true; } catch { return false; } };
  const activeJob = job => !closed && !job.done && !job.stop && !job.signal?.aborted
    && current(job.binding) && allowedContext(job.context, job.binding) && authorityActive(job.isActive);
  function complete(job, value) {
    if (job.done) return;
    job.done = true; pending.delete(job.request.request_id);
    job.signal?.removeEventListener("abort", job.onAbort);
    timers.clearTimeout(job.timer); timers.clearTimeout(job.grace);
    if (running === job) running = null;
    emit({ request_id: job.request.request_id, project_id: job.binding.id, state: "complete", status: value.status, reason: value.reason,
      data_sent: value.data_sent });
    job.resolve(freeze({ version: 1, binding: job.binding, result: value }));
    pump();
  }
  function stop(job, status, reason) {
    if (job.done || job.stop) return;
    job.stop = { status, reason };
    if (running !== job || !job.handed) {
      // A synchronous running-indicator cancellation can happen before any
      // runtime call. It must neither cancel a nonexistent host request nor
      // retire a usable process or discard unrelated queued work.
      queue = queue.filter(item => item !== job);
      complete(job, result(job.request, status, reason)); return;
    }
    job.controller.abort();
    // Set fallback before invoking the asynchronous cancellation seam.
    job.grace = timers.setTimeout(() => {
      // A missing cancellation result makes the transport unusable. Retire it
      // before settling, so completing this job cannot dispatch a queued run.
      closed = true;
      complete(job, result(job.request, status, reason, job.handed, Math.max(0, now() - job.started)));
      for (const waiting of [...pending.values()]) complete(waiting, result(waiting.request, "cancelled", "HOST_CLOSED"));
      queue = [];
      Promise.resolve().then(() => runtime?.close?.()).catch(() => {});
    }, UNDERSTAND_LIMITS.cancelGraceMs);
    Promise.resolve().then(() => runtime?.cancel?.({ request_id: job.request.request_id })).catch(() => {});
  }
  async function execute(job) {
    if (!activeJob(job)) {
      complete(job, result(job.request, "cancelled", "STALE_PROJECT")); return;
    }
    running = job; job.started = now();
    emit({ request_id: job.request.request_id, project_id: job.binding.id, state: "running", data_sent: false });
    if (job.stop || job.done || closed) return;
    if (!activeJob(job)) { complete(job, result(job.request, "cancelled", "STALE_PROJECT")); return; }
    job.timer = timers.setTimeout(() => stop(job, "timeout", "TIMEOUT"), job.request.timeout_ms);
    let reply;
    try {
      if (!runtime?.request) throw new Error("HOST_UNAVAILABLE");
      job.handed = true;
      reply = await runtime.request("understand/run", job.request, { signal: job.controller.signal,
        timeoutMs: job.request.timeout_ms, maxOutputBytes: UNDERSTAND_LIMITS.outputBytes, isActive: () => activeJob(job) });
      if (typeof reply === "string") {
        if (new TextEncoder().encode(reply).byteLength > UNDERSTAND_LIMITS.outputBytes) fail("OUTPUT_LIMIT");
        try { reply = JSON.parse(reply); } catch { fail("SCHEMA_MISMATCH"); }
      }
      // Bound a test/runtime-provided value before schema validation as well.
      // The real JSONL adapter returns plain JSON, but the seam remains untrusted.
      try { reply = boundedJSON(reply, UNDERSTAND_LIMITS.outputBytes); }
      catch (error) { if (error?.code === "OUTPUT_LIMIT") throw error; fail("SCHEMA_MISMATCH"); }
    } catch (error) {
      if (job.done) return;
      // The owned transport can prove an early failure occurred before its
      // stdin-write attempt. Wire diagnostics cannot supply this annotation.
      const dataSent = error?.name === "UnderstandTransportError" && typeof error.data_sent === "boolean"
        ? error.data_sent : job.handed;
      if (job.stop) { complete(job, result(job.request, job.stop.status, job.stop.reason, dataSent, Math.max(0, now() - job.started))); return; }
      if (!activeJob(job)) { complete(job, result(job.request, "cancelled", "STALE_PROJECT", dataSent, Math.max(0, now() - job.started))); return; }
      const malformed = ["OUTPUT_LIMIT", "SCHEMA_MISMATCH"].includes(error?.code);
      complete(job, result(job.request, malformed ? "invalid_output" : "failed",
        malformed ? error.code : "HOST_UNAVAILABLE", dataSent, Math.max(0, now() - job.started))); return;
    }
    if (job.done) return;
    const validated = validateUnderstandResult(reply, job.request, { core, now: now() });
    // Aborted/stale requests cannot yield a document, including late valid replies.
    if (job.stop || !activeJob(job)) {
      complete(job, result(job.request, job.stop?.status ?? "cancelled", job.stop?.reason ?? "STALE_PROJECT",
        validated?.data_sent ?? job.handed, Math.max(0, now() - job.started))); return;
    }
    complete(job, validated ?? result(job.request, "invalid_output", "SCHEMA_MISMATCH", job.handed,
      Math.max(0, now() - job.started)));
  }
  function pump() {
    if (closed || running || suspended || pumping) return;
    pumping = true;
    try {
      while (!closed && !running && queue.length) {
        const next = queue.shift();
        void execute(next);
      }
    } finally { pumping = false; }
  }
  function run(params, { signal, context, isActive = () => true } = {}) {
    if (typeof isActive !== "function") fail("INVALID_INPUT");
    allowed(params, ["projectId", "kind", "cli", "input", "timeoutMs"]);
    const { projectId, kind = "brief", cli, timeoutMs = UNDERSTAND_LIMITS.defaultTimeoutMs } = params;
    if (typeof projectId !== "string" || !ID.test(projectId) || !KINDS.includes(kind) || !CLIS.includes(cli)
        || !Number.isSafeInteger(timeoutMs) || timeoutMs < UNDERSTAND_LIMITS.minTimeoutMs || timeoutMs > UNDERSTAND_LIMITS.maxTimeoutMs
        || (kind === "brief" ? Object.hasOwn(params, "input") : !Object.hasOwn(params, "input"))) fail("INVALID_INPUT");
    const binding = snapshot(projectId);
    const request_id = `${uuid()}:${++sequence}`;
    if (!ID.test(request_id)) fail("INVALID_DEPENDENCIES");
    const request = { request_id, kind, cli, project_root: binding.canonicalRoot, timeout_ms: timeoutMs };
    if (kind === "explain_errors") request.input = validateErrorsInput(params.input);
    freeze(request);
    // Reserve the maximum valid outer RPC id; the adapter must enforce this
    // exact cap again against its real serialized envelope before writing.
    boundedJSON({ version: 1, id: "x".repeat(160), method: "understand/run", params: request }, UNDERSTAND_LIMITS.requestBytes - 1);
    const immediate = (status, reason) => Promise.resolve(freeze({ version: 1, binding, result: result(request, status, reason) }));
    if (closed || signal?.aborted) return immediate("cancelled", closed ? "HOST_CLOSED" : "CANCELLED");
    if (testOnlyAllowRun !== true || !allowedContext(context, binding)) return immediate("unavailable", UNDERSTAND_LIVE);
    if (invalidating.has(projectId) || !current(binding) || !authorityActive(isActive)) return immediate("cancelled", "STALE_PROJECT");
    if (pending.size >= UNDERSTAND_LIMITS.queued + 1) return immediate("busy", "QUEUE_FULL");
    return new Promise(resolve => {
      const job = { binding, request, signal, context, isActive, resolve, controller: new AbortController(), done: false, stop: null,
        handed: false, timer: null, grace: null, started: 0, onAbort: null };
      job.onAbort = () => stop(job, "cancelled", "CANCELLED");
      signal?.addEventListener("abort", job.onAbort, { once: true });
      pending.set(request_id, job); queue.push(job);
      emit({ request_id, project_id: projectId, state: "queued", data_sent: false });
      // Indicator callbacks may synchronously abort their own request.
      if (signal?.aborted) stop(job, "cancelled", "CANCELLED");
      else if (!job.done && !activeJob(job)) stop(job, "cancelled", "STALE_PROJECT");
      pump();
    });
  }
  function cancel(requestId) {
    if (!ID.test(requestId)) return { cancelled: false };
    const job = pending.get(requestId);
    if (!job || job.done || job.stop) return { cancelled: false };
    stop(job, "cancelled", "CANCELLED"); return { cancelled: true };
  }
  async function available({ isActive = () => true } = {}) {
    if (typeof isActive !== "function") fail("INVALID_INPUT");
    const active = () => !closed && authorityActive(isActive);
    if (!active() || !runtime?.request) return freeze({ clis: [] });
    const controller = new AbortController();
    let deadline;
    try {
      const timeout = new Promise((_, reject) => { deadline = timers.setTimeout(() => {
        controller.abort(); void close(); reject(new Error("TIMEOUT"));
      }, 5000); });
      let raw = await Promise.race([runtime.request("understand/available", {}, {
        signal: controller.signal, timeoutMs: 5000, maxOutputBytes: UNDERSTAND_LIMITS.metadataBytes,
        isActive: () => active() && !controller.signal.aborted }), timeout]);
      if (!active()) return freeze({ clis: [] });
      if (typeof raw === "string") {
        if (new TextEncoder().encode(raw).byteLength > UNDERSTAND_LIMITS.metadataBytes) fail("OUTPUT_LIMIT");
        raw = JSON.parse(raw);
      }
      const value = boundedJSON(raw, UNDERSTAND_LIMITS.metadataBytes);
      required(value, ["clis"]);
      if (!Array.isArray(value.clis) || value.clis.length > 2) throw new Error("SCHEMA_MISMATCH");
      const seen = new Set();
      const clis = value.clis.map(item => {
        required(item, ["cli", "path", "version"]);
        if (!CLIS.includes(item.cli) || seen.has(item.cli) || !absolute(item.path)
            || item.version !== null && (typeof item.version !== "string" || item.version.length > 80 || LINE_CONTROL.test(item.version))) fail("INVALID_INPUT");
        seen.add(item.cli); return item;
      });
      return active() ? freeze({ clis }) : freeze({ clis: [] });
    } catch { return freeze({ clis: [] }); }
    finally { timers.clearTimeout(deadline); }
  }
  function invalidateProject(projectId) {
    suspended++;
    invalidating.set(projectId, (invalidating.get(projectId) ?? 0) + 1);
    try {
      for (const job of [...pending.values()]) if (job.binding.id === projectId) stop(job, "cancelled", "STALE_PROJECT");
    } finally {
      const depth = invalidating.get(projectId);
      if (depth > 1) invalidating.set(projectId, depth - 1); else invalidating.delete(projectId);
      suspended--;
      pump();
    }
  }
  async function close() {
    if (closed) return;
    closed = true;
    for (const job of [...pending.values()]) stop(job, "cancelled", "HOST_CLOSED");
    // Runtime owns subprocess reaping. Do not let an unresponsive backend
    // indefinitely hold browser shutdown; the owner must still reap its child.
    let timer;
    try {
      await Promise.race([Promise.resolve(runtime?.close?.()).catch(() => {}),
        new Promise(resolve => { timer = timers.setTimeout(resolve, UNDERSTAND_LIMITS.cancelGraceMs); })]);
    } finally { timers.clearTimeout(timer); }
  }
  return Object.freeze({ run, cancel, available, invalidateProject, close,
    diagnostics: () => freeze({ running: running ? 1 : 0, queued: queue.length, closed, live: UNDERSTAND_LIVE }) });
}
