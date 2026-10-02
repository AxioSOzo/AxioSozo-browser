/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free browser-owned agent-channel-v1 controller. Effects, approvals,
// clocks, project snapshots, hook parsing, and tab safety metadata are injected.
// Error messages are machine codes; chrome owns all human-facing presentation.

export const CHANNEL_LIMITS = Object.freeze({
  clientLineBytes: 262144, browserLineBytes: 4194304, connections: 8,
  outstanding: 16, idleMs: 600000, approvalMs: 55000,
  actionApprovalMs: 60000, readMs: 30000, actionMs: 14000,
  reportsPerMinute: 30, screenshotBytes: 2097152,
});
export const CHANNEL_METHODS = Object.freeze([
  "tabs.list", "tabs.active", "project.info", "console.errors",
  "tabs.screenshot", "tabs.open", "tabs.navigate", "page.click", "page.type",
]);
const ACTIONS = new Set(["tabs.navigate", "page.click", "page.type"]);
const CODES = new Set([
  "NOT_APPROVED", "UNKNOWN_METHOD", "INVALID_PARAMS", "UNKNOWN_TAB", "PRIVATE",
  "BLOCKED_CATEGORY", "NOT_IN_PROJECT", "NO_PROJECT", "DENIED", "UNAVAILABLE",
  "TOO_LARGE", "TIMEOUT", "BUSY",
]);
// Event-only lifecycle reasons never replace the existing wire/close codes.
export const CHANNEL_SESSION_REASONS = Object.freeze({
  DENIED: "DENIED", TIMEOUT: "TIMEOUT", READ_EOF: "READ_EOF",
  REVOKED: "REVOKED", STOPPED: "STOPPED", DISCONNECTED: "DISCONNECTED",
  REPORT_COMPLETE: "REPORT_COMPLETE", INVALID_PARAMS: "INVALID_PARAMS",
  TOO_LARGE: "TOO_LARGE", UNAVAILABLE: "UNAVAILABLE",
});
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });
const object = value => !!value && typeof value === "object" && !Array.isArray(value);
const controls = /[\u0000-\u001f\u007f-\u009f]/u;
const length = value => [...value].length;
const text = (value, max, min = 1) => typeof value === "string" &&
  length(value) >= min && length(value) <= max && !controls.test(value);
const exact = (value, allowed, required = allowed) => object(value) &&
  Object.keys(value).every(key => allowed.includes(key)) &&
  required.every(key => Object.hasOwn(value, key));
const safePath = value => typeof value === "string" && value.startsWith("/") &&
  value.length > 1 && value.length <= 4096 && !controls.test(value) &&
  !value.split("/").some(part => part === "." || part === "..");
const rootPath = value => safePath(value) ? value.replace(/\/+$/u, "") : null;
const error = code => Object.assign(new Error(code), { code });
const freeze = value => {
  if (object(value) || Array.isArray(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};

export function projectForPath(projects, path) {
  if (!safePath(path)) return null;
  // Pick the narrowest known root so nested projects cannot inherit another's
  // container or act authority merely because they appear later in the store.
  let match = null, size = 0;
  for (const project of Array.isArray(projects) ? projects : []) {
    const root = rootPath(project?.root);
    if (!root || typeof project.id !== "string") continue;
    if ((path === root || path.startsWith(`${root}/`)) && root.length > size) {
      match = project;
      size = root.length;
    }
  }
  return match;
}

function hello(message) {
  return exact(message, ["v", "type", "client", "cwd", "pid"]) && message.v === 1 &&
    message.type === "hello" && exact(message.client, ["name", "agent", "version"]) &&
    ["axiosozo-notify", "agent-bridge"].includes(message.client.name) &&
    ["claude-code", "codex", "other"].includes(message.client.agent) &&
    text(message.client.version, 32) && safePath(message.cwd) &&
    Number.isSafeInteger(message.pid) && message.pid > 0;
}

export function validateChannelParams(method, params) {
  if (!object(params)) return false;
  switch (method) {
    case "tabs.list": case "tabs.active": case "project.info": return exact(params, []);
    case "console.errors": return exact(params, ["tab_id"]) && tabId(params.tab_id);
    case "tabs.screenshot": return exact(params, ["tab_id", "max_width"], ["tab_id"]) &&
      tabId(params.tab_id) && (!Object.hasOwn(params, "max_width") ||
        Number.isInteger(params.max_width) && params.max_width >= 64 && params.max_width <= 1920);
    case "tabs.open": return exact(params, ["url"]) && webUrl(params.url);
    case "tabs.navigate": return exact(params, ["tab_id", "url"]) &&
      tabId(params.tab_id) && webUrl(params.url);
    case "page.click": return exact(params, ["tab_id", "selector"]) &&
      tabId(params.tab_id) && text(params.selector, 512);
    case "page.type": return exact(params, ["tab_id", "selector", "text"]) &&
      tabId(params.tab_id) && text(params.selector, 512) &&
      typeof params.text === "string" && length(params.text) <= 4096 && !params.text.includes("\0");
    default: return false;
  }
}
const tabId = value => typeof value === "string" && /^t_[0-9]{1,15}$/u.test(value);
function webUrl(value) {
  if (typeof value !== "string" || value.length > 8192 || controls.test(value)) return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

function projectInfo(project) {
  if (!project) return null;
  const groups = new Map();
  for (const env of project.manifest?.environments ?? []) {
    if (!webUrl(env.base_url)) continue;
    const app = typeof env.app === "string" ? env.app : null;
    if (!groups.has(app)) groups.set(app, []);
    groups.get(app).push({ name: env.name, base_url: env.base_url });
  }
  // Deliberately construct this shape; never serialize the profile project
  // object, which includes account labels and other profile-local metadata.
  return {
    project_id: project.id, name: String(project.manifest?.name ?? "").slice(0, 160), root: project.root,
    apps: [...groups].slice(0, 32).map(([app, environments]) => ({ app, environments: environments.slice(0, 32) })),
    integrations: (Array.isArray(project.detected?.integrations) ? project.detected.integrations : [])
      .slice(0, 16).map(value => ({ id: value.id, name: value.name })),
  };
}

/**
 * `transport`: write(Uint8Array) -> promise/void; close(reason) -> void.
 * `runtime`: now, setTimeout, clearTimeout, randomHex (exactly 16 hex),
 * getProjects (synchronous), parseHookEvent, onStatus, requestApproval,
 * confirmAction, listTabs/getTab, isSensitiveHost, executeMethod.
 * onSessionClosed(sessionView,reason) releases session-owned BiDi resources.
 * onStateChange(event) optionally observes immutable, machine-only lifecycle
 * snapshots. Session events include the current deeply frozen sessions array;
 * callback throws/rejections cannot change controller outcomes.
 * isMethodAvailable(method) optionally gates unavailable effects before UI.
 * The runtime MUST use Firefox chrome APIs / WebDriver BiDi internals, and
 * cancel effects on AbortSignal. This module never interprets a selector.
 */
export class AgentChannelController {
  #runtime;
  #sessions = new Map();
  #reports = [];
  #stopping = false;
  constructor(runtime) {
    for (const key of ["now", "setTimeout", "clearTimeout", "randomHex", "getProjects", "parseHookEvent"])
      if (typeof runtime?.[key] !== "function") throw error("UNAVAILABLE");
    this.#runtime = runtime;
  }
  get sessions() {
    return freeze([...this.#sessions.values()].map(session => this.#view(session, true)));
  }
  accept(transport) {
    if (!transport || typeof transport.write !== "function" || typeof transport.close !== "function")
      throw error("UNAVAILABLE");
    if (this.#stopping) {
      transport.close("UNAVAILABLE");
      return null;
    }
    if (this.#sessions.size >= CHANNEL_LIMITS.connections) {
      transport.close("BUSY");
      return null;
    }
    const id = `s_${this.#runtime.randomHex()}`;
    if (!/^s_[0-9a-f]{16}$/u.test(id) || this.#sessions.has(id)) {
      transport.close("UNAVAILABLE");
      return null;
    }
    const session = {
      id, transport, state: "hello", reason: null, hello: null, projectId: null,
      buffer: new Uint8Array(0), readEnded: false, closed: false,
      jobs: new Set(), outstanding: new Map(), writes: Promise.resolve(),
      abort: new AbortController(), approvalTimer: null, idleTimer: null,
    };
    this.#sessions.set(id, session);
    this.#touch(session);
    this.#notify(session);
    return Object.freeze({
      session: id,
      receive: chunk => this.#receive(session, chunk),
      end: () => this.#end(session),
      disconnect: () => this.#close(session, "UNAVAILABLE", CHANNEL_SESSION_REASONS.DISCONNECTED),
    });
  }
  revoke(id) {
    const session = this.#sessions.get(id);
    if (!session) return false;
    this.#close(session, "NOT_APPROVED", CHANNEL_SESSION_REASONS.REVOKED);
    return true;
  }
  stop() {
    if (this.#stopping) return;
    this.#stopping = true;
    try {
      for (const session of [...this.#sessions.values()])
        this.#close(session, "UNAVAILABLE", CHANNEL_SESSION_REASONS.STOPPED);
    } finally { this.#stopping = false; }
  }
  #view(session, includeReason = false) {
    return freeze({ session: session.id, project_id: session.projectId,
      client: session.hello ? { ...session.hello.client } : null, state: session.state,
      ...(includeReason ? { reason: session.reason } : {}) });
  }
  #notify(session) {
    const event = freeze({ kind: "session", ...this.#view(session, true), sessions: this.sessions });
    try { Promise.resolve(this.#runtime.onStateChange?.(event)).catch(() => {}); } catch {}
  }
  #transition(session, state, reason = null) {
    session.state = state;
    session.reason = reason;
    this.#notify(session);
  }
  #touch(session) {
    this.#runtime.clearTimeout(session.idleTimer);
    session.idleTimer = this.#runtime.setTimeout(() => this.#close(session, "TIMEOUT"), CHANNEL_LIMITS.idleMs);
  }
  #receive(session, chunk) {
    if (session.closed || session.readEnded) return;
    if (!(chunk instanceof Uint8Array)) return this.#close(session, "INVALID_PARAMS");
    this.#touch(session);
    let start = 0;
    while (start < chunk.length && !session.closed) {
      const newline = chunk.indexOf(10, start);
      const end = newline < 0 ? chunk.length : newline;
      const piece = chunk.subarray(start, end);
      if (session.buffer.length + piece.length > CHANNEL_LIMITS.clientLineBytes)
        return this.#close(session, "TOO_LARGE");
      const bytes = new Uint8Array(session.buffer.length + piece.length);
      bytes.set(session.buffer);
      bytes.set(piece, session.buffer.length);
      session.buffer = bytes;
      if (newline < 0) return;
      session.buffer = new Uint8Array(0);
      let message;
      try { message = JSON.parse(decoder.decode(bytes)); }
      catch { return this.#close(session, "INVALID_PARAMS"); }
      if (!object(message)) return this.#close(session, "INVALID_PARAMS");
      // Dispatch synchronously before processing the next complete line.
      // Never block a coalesced hello+hook behind a write or approval wait.
      let job;
      try { job = this.#message(session, message); }
      catch { return this.#close(session, "UNAVAILABLE"); }
      if (job) {
        session.jobs.add(job);
        job.finally(() => session.jobs.delete(job)).catch(() => {});
      }
      start = newline + 1;
    }
  }
  async #end(session) {
    if (session.closed || session.readEnded) return;
    session.readEnded = true;
    if (session.buffer.length) return this.#close(session, "INVALID_PARAMS");
    // A read EOF is distinct from a full disconnect. In particular macOS nc
    // can finish writing hello+hook before it reads any browser response.
    // Complete lines already received must finish before socket shutdown.
    await Promise.allSettled([...session.jobs]);
    await session.writes;
    this.#close(session, "UNAVAILABLE", CHANNEL_SESSION_REASONS.READ_EOF);
  }
  #message(session, message) {
    if (session.state === "hello") {
      if (!hello(message)) return this.#close(session, "INVALID_PARAMS");
      session.hello = freeze(message);
      session.projectId = projectForPath(this.#runtime.getProjects(), message.cwd)?.id ?? null;
      this.#transition(session, message.client.name === "axiosozo-notify" ? "hook" : "pending");
      // A synchronous observer may revoke/stop while handling this transition.
      if (session.closed) return;
      this.#send(session, { v: 1, type: "welcome", session: session.id,
        project_id: session.projectId, approval: session.state === "hook" ? "not_required" : "pending" });
      if (session.state === "pending") this.#approval(session);
      return;
    }
    if (session.state === "hook") {
      this.#transition(session, "reporting");
      if (session.closed) return;
      return this.#hook(session, message);
    }
    if (session.hello.client.name !== "agent-bridge") return this.#close(session, "INVALID_PARAMS");
    if (!exact(message, ["v", "id", "method", "params"]) || message.v !== 1 ||
        !Number.isSafeInteger(message.id) || message.id < 0 || typeof message.method !== "string")
      return this.#close(session, "INVALID_PARAMS");
    if (session.outstanding.has(message.id)) return this.#close(session, "INVALID_PARAMS");
    if (session.outstanding.size >= CHANNEL_LIMITS.outstanding)
      return this.#replyError(session, message.id, "BUSY");
    if (session.state !== "approved") return this.#replyError(session, message.id, "NOT_APPROVED");
    if (!CHANNEL_METHODS.includes(message.method)) return this.#replyError(session, message.id, "UNKNOWN_METHOD");
    if (!validateChannelParams(message.method, message.params))
      return this.#replyError(session, message.id, "INVALID_PARAMS");
    if (this.#runtime.isMethodAvailable?.(message.method) === false)
      return this.#replyError(session, message.id, "UNAVAILABLE");
    const abort = new AbortController();
    session.outstanding.set(message.id, abort);
    return this.#request(session, message, abort).finally(() => session.outstanding.delete(message.id));
  }
  #approval(session) {
    const settle = (granted, deniedReason = CHANNEL_SESSION_REASONS.DENIED) => {
      if (session.closed || session.state !== "pending") return;
      this.#runtime.clearTimeout(session.approvalTimer);
      const approved = granted === true && !session.readEnded;
      this.#transition(session, approved ? "approved" : "denied", approved ? null :
        session.readEnded ? CHANNEL_SESSION_REASONS.READ_EOF : deniedReason);
      if (session.closed) return;
      if (!approved) session.abort.abort();
      if (session.closed) return;
      this.#send(session, { v: 1, type: "approval", granted: approved });
    };
    session.approvalTimer = this.#runtime.setTimeout(
      () => settle(false, CHANNEL_SESSION_REASONS.TIMEOUT), CHANNEL_LIMITS.approvalMs);
    try {
      Promise.resolve(this.#runtime.requestApproval?.(this.#view(session), {
        cwd: session.hello.cwd, signal: session.abort.signal,
      })).then(settle, () => settle(false));
    } catch { settle(false); }
  }
  async #hook(session, message) {
    let matched = false;
    if (exact(message, ["v", "type", "source", "event", "cwd", "payload"]) &&
        message.v === 1 && message.type === "hook" && safePath(message.cwd)) {
      const now = this.#runtime.now();
      this.#reports = this.#reports.filter(at => at > now - 60000);
      let record = null;
      try {
        record = this.#runtime.parseHookEvent({ source: message.source, event: message.event,
          cwd: message.cwd, payload: message.payload, now, id: `as_${this.#runtime.randomHex()}` });
      } catch {}
      const project = record && projectForPath(this.#runtime.getProjects(), record.project_path);
      if (project && this.#reports.length < CHANNEL_LIMITS.reportsPerMinute && typeof this.#runtime.onStatus === "function") {
        // Reserve before awaiting the callback so coalesced clients cannot
        // exceed the global budget while persistence or notification waits.
        this.#reports.push(now);
        try { await this.#runtime.onStatus(record, project.id); matched = true; } catch {}
      }
    }
    await this.#send(session, { v: 1, type: "ack", matched });
    // Write errors do not cancel a status record already parsed and accepted.
    this.#close(session, "UNAVAILABLE", CHANNEL_SESSION_REASONS.REPORT_COMPLETE);
  }
  #replyError(session, id, code) {
    return this.#send(session, { v: 1, id, error: { code, message: code } });
  }
  #send(session, message) {
    if (session.closed) return Promise.resolve();
    let bytes;
    try { bytes = encoder.encode(`${JSON.stringify(message)}\n`); }
    catch { this.#close(session, "UNAVAILABLE"); return Promise.resolve(); }
    if (bytes.length - 1 > CHANNEL_LIMITS.browserLineBytes) {
      if (Number.isSafeInteger(message.id)) return this.#replyError(session, message.id, "TOO_LARGE");
      this.#close(session, "TOO_LARGE"); return Promise.resolve();
    }
    session.writes = session.writes.then(() => {
      if (!session.closed) return session.transport.write(bytes);
    }).catch(() => {
      // nc can fully disconnect after sending a one-shot report. Keep
      // processing buffered hook lines even when writing welcome fails.
      if (session.hello?.client.name !== "axiosozo-notify") this.#close(session, "UNAVAILABLE");
    });
    return session.writes;
  }
  #close(session, reason, eventReason = reason) {
    if (session.closed) return;
    session.closed = true;
    session.state = "closed";
    session.reason = eventReason;
    session.abort.abort();
    for (const abort of session.outstanding.values()) abort.abort();
    this.#runtime.clearTimeout(session.idleTimer);
    this.#runtime.clearTimeout(session.approvalTimer);
    this.#sessions.delete(session.id);
    this.#notify(session);
    try { session.transport.close(reason); } catch {}
    try { Promise.resolve(this.#runtime.onSessionClosed?.(this.#view(session), reason)).catch(() => {}); } catch {}
  }
  #timed(effect, timeoutMs, abort, code = "TIMEOUT") {
    return new Promise((resolve, reject) => {
      let finished = false;
      const done = (fn, value) => {
        if (finished) return;
        finished = true;
        this.#runtime.clearTimeout(timer);
        abort.signal.removeEventListener("abort", cancelled);
        fn(value);
      };
      const cancelled = () => done(reject, error("NOT_APPROVED"));
      const timer = this.#runtime.setTimeout(() => {
        done(reject, error(code));
        abort.abort();
      }, timeoutMs);
      if (abort.signal.aborted) return cancelled();
      abort.signal.addEventListener("abort", cancelled, { once: true });
      Promise.resolve().then(() => {
        if (abort.signal.aborted) throw error("NOT_APPROVED");
        return effect();
      }).then(value => done(resolve, value), cause => done(reject, cause));
    });
  }
  #tab(session, id, action = false) {
    const tab = this.#runtime.getTab?.(id);
    if (!tab || tab.tab_id !== id) throw error("UNKNOWN_TAB");
    // Missing private/safety metadata is never interpreted as permission.
    if (tab.private === true) throw error("PRIVATE");
    if (tab.private !== false || typeof this.#runtime.isSensitiveHost !== "function") throw error("UNAVAILABLE");
    if (!webUrl(tab.url)) throw error("BLOCKED_CATEGORY");
    if (this.#runtime.isSensitiveHost(new URL(tab.url).hostname)) throw error("BLOCKED_CATEGORY");
    if (tab.engine !== "gecko") throw error("UNAVAILABLE");
    if (action) {
      const project = this.#runtime.getProjects().find(value => value.id === session.projectId);
      if (!project) throw error("NO_PROJECT");
      if (tab.project_id !== project.id) throw error("NOT_IN_PROJECT");
    }
    return tab;
  }
  #publicTab(tab) {
    if (!tabId(tab?.tab_id) || tab.private !== false || typeof this.#runtime.isSensitiveHost !== "function") return null;
    let url;
    try { url = new URL(tab.url); } catch { return null; }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
        this.#runtime.isSensitiveHost(url.hostname) || !["gecko", "chromium"].includes(tab.engine)) return null;
    return { tab_id: tab.tab_id, url: tab.url, title: String(tab.title ?? "").slice(0, 4096),
      active: tab.active === true, project_id: typeof tab.project_id === "string" ? tab.project_id : null, engine: tab.engine };
  }
  async #request(session, message, abort) {
    const { id, method, params } = message;
    try {
      let result;
      if (method === "project.info") {
        result = projectInfo(this.#runtime.getProjects().find(project => project.id === session.projectId));
      } else if (method === "tabs.list" || method === "tabs.active") {
        if (typeof this.#runtime.listTabs !== "function" || typeof this.#runtime.isSensitiveHost !== "function") throw error("UNAVAILABLE");
        const tabs = this.#runtime.listTabs().map(tab => this.#publicTab(tab)).filter(Boolean);
        result = method === "tabs.list" ? tabs : tabs.find(tab => tab.active) ?? null;
      } else {
        const action = ACTIONS.has(method);
        let tab = params.tab_id ? this.#tab(session, params.tab_id, action) : null;
        if (method === "tabs.open") {
          if (typeof this.#runtime.isSensitiveHost !== "function") throw error("UNAVAILABLE");
          if (this.#runtime.isSensitiveHost(new URL(params.url).hostname)) throw error("BLOCKED_CATEGORY");
        }
        if (method === "tabs.navigate" && this.#runtime.isSensitiveHost(new URL(params.url).hostname)) throw error("BLOCKED_CATEGORY");
        if (action) {
          if (session.readEnded || typeof this.#runtime.confirmAction !== "function") throw error("DENIED");
          const before = freeze({ tab_id: tab.tab_id, url: tab.url, project_id: tab.project_id,
            engine: tab.engine, document_id: tab.document_id ?? null });
          const allowed = await this.#timed(() => this.#runtime.confirmAction(
            freeze({ session: this.#view(session), method, params: { ...params }, tab: before }), { signal: abort.signal }
          ), CHANNEL_LIMITS.actionApprovalMs, abort, "DENIED");
          if (allowed !== true || session.readEnded) throw error("DENIED");
          tab = this.#tab(session, params.tab_id, true);
          if (tab.url !== before.url || (tab.document_id ?? null) !== before.document_id || session.state !== "approved") throw error("DENIED");
        }
        if (typeof this.#runtime.executeMethod !== "function") throw error("UNAVAILABLE");
        result = await this.#timed(() => this.#runtime.executeMethod(method, freeze({ ...params }),
          this.#view(session), { tab, signal: abort.signal }), action ? CHANNEL_LIMITS.actionMs : CHANNEL_LIMITS.readMs, abort);
        if (method === "tabs.screenshot") result = screenshot(result, params.max_width ?? 1280);
        if (method === "console.errors") result = consoleErrors(result);
        if (method === "tabs.open" && (!exact(result, ["tab_id"]) || !tabId(result.tab_id))) throw error("UNAVAILABLE");
      }
      if (!session.closed && session.state === "approved" && !abort.signal.aborted)
        await this.#send(session, { v: 1, id, result: result ?? null });
    } catch (cause) {
      const code = CODES.has(cause?.code) ? cause.code : "UNAVAILABLE";
      if (!session.closed) await this.#replyError(session, id, code);
    }
  }
}

function screenshot(value, maxWidth) {
  if (!exact(value, ["mime", "width", "height", "data_base64"]) || value.mime !== "image/png" ||
      !Number.isSafeInteger(value.width) || value.width < 1 || value.width > maxWidth ||
      !Number.isSafeInteger(value.height) || value.height < 1 || value.height > 32768 ||
      typeof value.data_base64 !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(value.data_base64))
    throw error("UNAVAILABLE");
  const size = value.data_base64.length / 4 * 3 - (value.data_base64.endsWith("==") ? 2 : value.data_base64.endsWith("=") ? 1 : 0);
  if (size > CHANNEL_LIMITS.screenshotBytes) throw error("TOO_LARGE");
  // PNG signature must be present; the effect adapter owns real image capture.
  if (!value.data_base64.startsWith("iVBORw0KGgo")) throw error("UNAVAILABLE");
  return { ...value };
}
function consoleErrors(value) {
  if (!object(value) || !Number.isSafeInteger(value.count) || value.count < 0 || !Array.isArray(value.messages)) throw error("UNAVAILABLE");
  return { count: value.count, messages: value.messages.slice(-50).filter(item => object(item) &&
    ["error", "warning"].includes(item.level) && Number.isSafeInteger(item.at) && item.at >= 0)
    .map(item => ({ level: item.level, text: String(item.text ?? "").slice(0, 1000),
      source: String(item.source ?? "").slice(0, 1000), line: Number.isSafeInteger(item.line) && item.line >= 0 ? item.line : 0, at: item.at })) };
}
