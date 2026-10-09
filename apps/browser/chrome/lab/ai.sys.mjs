/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The Lab's one way to ask the user's own AI client for an answer:
//
//   const { text, json, costUsd, durationMs, rateLimit } = await ctx.ai.runTurn({
//     client: "claude-code",          // optional: "claude-code" | "codex" | "auto" (default: Claude Code
//                                     //   when it is ready, else Codex); "antigravity" is UNSUPPORTED
//     prompt: "What is wrong here?",  // plain text, at most 32 KB (UTF-8)
//     image,                          // optional { type: "image/png" | "image/jpeg", data: ArrayBuffer | Uint8Array }
//     json,                           // optional JSON Schema object: the answer must be JSON (returned parsed)
//     model,                          // optional alias ("haiku", "sonnet"); Claude defaults to "haiku"
//     cwd,                            // optional: a known project's root, read only (Claude or Codex)
//     signal: ctx.signal,             // optional AbortSignal: Stop, or the experiment being turned off
//     onText: text => card.setBody(text), // optional: the answer so far, while it streams
//     timeoutMs,                      // optional, 1 s to 5 min (default 2 min)
//   });
//   const statuses = await ctx.ai.clientStatus({ check: true }); // see clients.sys.mjs
//
// One turn, one answer: no conversation is kept. It runs only because the
// user did something (an experiment never calls it on its own), never in a
// private window, and it fails with one fixed code (LabAiError.code, see
// AI_ERRORS; aiErrorText gives the calm sentence to show, and error.reason a
// more precise one when the client said why: "Claude Code is out of its
// 5-hour limit until 23:30.").
//
// The backend (createCliAiBackend) runs the client directly, as documented by
// each client, with no tools and nothing it can change:
//   Claude Code  claude -p, stream-json in and out, --tools "" (or Read/Glob/
//                Grep in plan mode for a project's cwd), --json-schema,
//                --no-session-persistence, --safe-mode, no MCP servers,
//                --permission-prompts none, model haiku. The image travels
//                as a base64 block on stdin: nothing is written to disk.
//                cwd: an empty private folder under the profile.
//   Codex        codex exec --json -s read-only --ephemeral --ignore-user-config
//                --skip-git-repo-check -C <empty folder> [-i <png>]
//                [--output-schema <file>]: the image and schema are 0600 files
//                in a 0700 per-run folder under the profile, removed when it ends.
//   Antigravity  never: its tools cannot be turned off (a custom agent's
//                `tools: []` is ignored in 1.3.2), so it is refused with
//                UNSUPPORTED; ctx.agents uses it for real agent tasks only.
// Stop: Claude gets its interrupt control request, then stdin closes, then
// SIGTERM; Codex and Antigravity get SIGINT to their process group.

import { CLIENT_IDS, CLIENT_LABELS as LABELS, answerArgs, isModel } from "./clients.sys.mjs";
import { base64, oneLine, randomHex, startSupervised, trimSlashes } from "./process.sys.mjs";
import { eventsOf, failureText, rateLimitText } from "./streams.sys.mjs";

export const AI_CLIENTS = CLIENT_IDS;
export const CLIENT_LABELS = LABELS;
/** The host's prompt limit (ProviderConversation MAX_PROMPT). */
export const MAX_PROMPT_BYTES = 32768;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const IMAGE_TYPES = Object.freeze(["image/png", "image/jpeg"]);
export const DEFAULT_TIMEOUT_MS = 120000;
export const MAX_TIMEOUT_MS = 300000;
/** "auto" tries these, in this order (Antigravity cannot be held to "no tools"). */
export const AUTO_CLIENTS = Object.freeze(["claude-code", "codex"]);
export const AI_ERRORS = Object.freeze([
  "INVALID_REQUEST", // the experiment asked for something malformed (a bug there)
  "AI_NOT_CONNECTED", // no backend is connected to the Lab (tests; a build without it)
  "CLIENT_UNAVAILABLE", // that client is not installed, failed its check, or needs the user to sign in
  "UNSUPPORTED", // the client cannot do this (an image, a folder or a JSON answer)
  "PRIVATE_WINDOW",
  "ABORTED", // the signal fired: the user stopped, or the experiment was turned off
  "TIMEOUT",
  "TURN_FAILED", // the client ended the turn with a failure (a rate limit, its service, …)
  "INVALID_OUTPUT", // a JSON answer was asked for and none came back
]);

export class LabAiError extends Error {
  constructor(code, message = code, { reason = null } = {}) {
    super(message);
    this.name = "LabAiError";
    this.code = AI_ERRORS.includes(code) ? code : "TURN_FAILED";
    /** A calm, more precise sentence when the client said why (or null). */
    this.reason = typeof reason === "string" && reason ? reason : null;
  }
}

/** One calm sentence for a failed turn, for the experiment's own UI (error.reason is more precise when set). */
export function aiErrorText(code, client = null) {
  const name = CLIENT_LABELS[client] ?? "The assistant";
  switch (code) {
    case "AI_NOT_CONNECTED": return "AI is not connected to the Lab in this build. Nothing was sent.";
    case "CLIENT_UNAVAILABLE": return `${name} is not available on this Mac right now. Nothing was sent.`;
    case "UNSUPPORTED": return `${name} cannot do this here. Nothing was sent.`;
    case "PRIVATE_WINDOW": return "AI is never used in private windows.";
    case "ABORTED": return "Stopped.";
    case "TIMEOUT": return `${name} took too long to answer. Try again.`;
    case "INVALID_OUTPUT": return `${name} answered in a form this experiment cannot use. Try again.`;
    case "INVALID_REQUEST": return "This experiment asked for something it cannot do. Nothing was sent.";
    default: return `${name} could not finish. Try again.`;
  }
}

const invalid = why => new LabAiError("INVALID_REQUEST", `runTurn: ${why}`);
const CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const isPlainObject = value => !!value && typeof value === "object" && !Array.isArray(value)
  && Object.prototype.toString.call(value) === "[object Object]";
const byteLength = text => new TextEncoder().encode(text).length;

/** { type, data: Uint8Array } from an experiment's image, or null when it is not one. */
export function normalizeImage(image) {
  // Bytes may come from another global (a chrome window's canvas or a test
  // sandbox), where instanceof fails: recognise them by their class and copy
  // them into this module's own Uint8Array.
  const tag = Object.prototype.toString.call(image?.data);
  const data = tag === "[object Uint8Array]" ? new Uint8Array(image.data)
    : tag === "[object ArrayBuffer]" ? new Uint8Array(image.data) : null;
  if (!isPlainObject(image) || !IMAGE_TYPES.includes(image.type) || !data || !data.byteLength || data.byteLength > MAX_IMAGE_BYTES) return null;
  return Object.freeze({ type: image.type, data });
}

/** The request as the backend gets it, or LabAiError INVALID_REQUEST. */
export function normalizeTurnRequest(request) {
  if (!isPlainObject(request)) throw invalid("the request is an object");
  const known = new Set(["client", "prompt", "image", "cwd", "json", "signal", "onText", "timeoutMs", "model"]);
  for (const key of Object.keys(request)) if (!known.has(key)) throw invalid(`unknown field "${key}"`);
  const { client = "auto", prompt, image = null, cwd = null, json = null, signal = null, onText = null, timeoutMs = DEFAULT_TIMEOUT_MS,
    model = null } = request;
  if (client !== "auto" && !AI_CLIENTS.includes(client)) throw invalid("client is auto, claude-code, codex or antigravity");
  if (typeof prompt !== "string" || !prompt.trim() || CONTROLS.test(prompt)) throw invalid("prompt is plain, non-empty text");
  if (byteLength(prompt) > MAX_PROMPT_BYTES) throw invalid("prompt is at most 32 KB");
  let picture = null;
  if (image !== null) {
    picture = normalizeImage(image);
    if (!picture) throw invalid("image is { type: image/png or image/jpeg, data } up to 8 MB");
  }
  if (cwd !== null && (typeof cwd !== "string" || !cwd.startsWith("/") || cwd.length > 4096 || CONTROLS.test(cwd) || cwd.includes("\n")
    || cwd.split("/").includes(".."))) throw invalid("cwd is an absolute folder");
  if (json !== null && !isPlainObject(json)) throw invalid("json is a JSON Schema object");
  if (model !== null && !isModel(model)) throw invalid("model is a model alias such as haiku or sonnet");
  if (signal !== null && (typeof signal?.aborted !== "boolean" || typeof signal.addEventListener !== "function")) throw invalid("signal is an AbortSignal");
  if (onText !== null && typeof onText !== "function") throw invalid("onText is a function");
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > MAX_TIMEOUT_MS) throw invalid("timeoutMs is 1000 to 300000");
  return Object.freeze({ client, prompt, image: picture, cwd, json, signal, onText, timeoutMs, model });
}

// ---- the CLI backend -----------------------------------------------------------------------------

const UNSUPPORTED_KEYWORDS = new Set(["maxLength", "minLength", "pattern", "format", "minimum", "maximum", "exclusiveMinimum",
  "exclusiveMaximum", "multipleOf", "maxItems", "minItems", "uniqueItems", "default", "examples", "$schema", "$id", "title"]);

/**
 * A JSON Schema in Codex's strict form (--output-schema): every object lists
 * all its properties as required and allows no others; length, range and
 * count keywords are dropped (the experiment checks those itself).
 */
export function strictSchema(schema) {
  if (Array.isArray(schema)) return schema.map(strictSchema);
  if (!isPlainObject(schema)) return schema;
  const out = {};
  for (const [key, value] of Object.entries(schema)) {
    if (UNSUPPORTED_KEYWORDS.has(key)) continue;
    if (key === "properties" && isPlainObject(value)) out.properties = Object.fromEntries(Object.entries(value).map(([name, item]) => [name, strictSchema(item)]));
    else if (["items", "anyOf", "oneOf", "allOf", "not", "additionalItems"].includes(key)) out[key] = strictSchema(value);
    else if (key === "$defs" || key === "definitions") out[key] = Object.fromEntries(Object.entries(value ?? {}).map(([name, item]) => [name, strictSchema(item)]));
    else out[key] = value;
  }
  if (out.type === "object" || isPlainObject(out.properties)) {
    out.properties ??= {};
    out.required = Object.keys(out.properties);
    out.additionalProperties = false;
  }
  return out;
}

/** Claude Code's stream-json user message: the image (base64) and the text. */
export function claudeUserMessage(text, image = null) {
  const content = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: image.type, data: base64(image.data) } });
  content.push({ type: "text", text });
  return `${JSON.stringify({ type: "user", message: { role: "user", content } })}\n`;
}

/** Claude Code's interrupt (it answers with control_response, then ends the turn as aborted). */
export const claudeInterrupt = requestId => `${JSON.stringify({ type: "control_request", request_id: requestId, request: { subtype: "interrupt" } })}\n`;

const parseJson = text => {
  if (typeof text !== "string" || !text.trim()) return null;
  const trimmed = text.trim().replace(/^```(?:json)?\s*/u, "").replace(/\s*```$/u, "");
  try { const value = JSON.parse(trimmed); return value && typeof value === "object" ? value : null; } catch { return null; }
};
const imageName = image => (image.type === "image/jpeg" ? "image.jpg" : "image.png");

/**
 * The real backend: runs the user's client for one answer.
 *   runtime: process.sys.mjs runtime ({ spawn, timers, clock })
 *   discovery: clients.sys.mjs discovery; scratch: process.sys.mjs scratch
 *   environment: the clients' environment
 *   projects: { find(root) → Promise<{ id, root, name } | null> } (known project roots)
 */
export function createCliAiBackend({ runtime, discovery, scratch, environment, projects = null, newId = () => randomHex(8) }) {
  const clock = () => (typeof runtime.clock === "function" ? runtime.clock() : Date.now());

  async function pick(requested) {
    if (requested !== "auto") return requested;
    for (const id of AUTO_CLIENTS) {
      const status = await discovery.status(id, { check: true }).catch(() => null);
      if (status?.available && status.capabilities.includes("answer")) return id;
    }
    throw new LabAiError("CLIENT_UNAVAILABLE", "no client is ready", { reason: "Neither Claude Code nor Codex is ready on this Mac." });
  }

  async function runTurn(turn) {
    const client = await pick(turn.client);
    const name = CLIENT_LABELS[client];
    if (client === "antigravity") {
      throw new LabAiError("UNSUPPORTED", "antigravity", { reason: "Antigravity cannot answer without its tools, so the Lab uses it only for agent tasks." });
    }
    let launch;
    try { launch = await discovery.launch(client); }
    catch (error) { throw new LabAiError("CLIENT_UNAVAILABLE", `${client} is unavailable`, { reason: error?.status?.reason ?? error?.message }); }
    const capabilities = launch.status.capabilities;
    if (!capabilities.includes("answer")) throw new LabAiError("CLIENT_UNAVAILABLE", `${client} cannot answer`, { reason: launch.status.reason });
    if (turn.image && !capabilities.includes("image")) throw new LabAiError("UNSUPPORTED", "image", { reason: `${name} cannot take a picture here.` });
    if (turn.json && !capabilities.includes("schema")) throw new LabAiError("UNSUPPORTED", "json", { reason: `${name} cannot answer in a fixed form here.` });
    let root = null;
    if (turn.cwd !== null) {
      const project = await projects?.find?.(trimSlashes(turn.cwd)).catch(() => null);
      if (!project) throw new LabAiError("UNSUPPORTED", "cwd", { reason: "Only a project added to AxioSozo can be read." });
      root = project.root;
    }
    if (turn.signal?.aborted) throw new LabAiError("ABORTED");
    const run = await scratch.runDir(`a-${newId()}`);
    try {
      const imagePath = turn.image && client !== "claude-code" ? await run.write(imageName(turn.image), turn.image.data) : null;
      const schemaPath = turn.json && client === "codex"
        ? await run.write("schema.json", new TextEncoder().encode(JSON.stringify(strictSchema(turn.json)))) : null;
      const workdir = root ?? run.cwd;
      const args = answerArgs(client, { schema: turn.json, model: turn.model, cwd: workdir, readOnlyProject: !!root, prompt: turn.prompt,
        imagePath, schemaPath, imageDir: imagePath ? run.dir : null, timeoutMs: turn.timeoutMs });
      const texts = [];
      let result = null, limit = null, notice = "", model = null, handle = null, part;
      const started = clock();
      const onLine = line => {
        for (const event of eventsOf(client, line)) {
          if (event.kind === "init") model = event.model ?? model;
          else if (event.kind === "text") {
            if (event.delta && texts.length && part === (event.part ?? null)) texts[texts.length - 1] += event.text;
            else texts.push(event.text);
            part = event.delta ? event.part ?? null : undefined;
            // Claude sends whole messages, Antigravity pieces of one (deltas); Codex's last message is its answer.
            try { turn.onText?.(client === "codex" ? event.text : texts.join("\n\n")); } catch { /* The facade guards onText. */ }
          } else if (event.kind === "rate_limit") limit = event.limit;
          else if (event.kind === "notice") notice = event.text;
          else if (event.kind === "result") {
            result = event;
            if (client === "claude-code") handle?.closeInput();
          }
        }
      };
      handle = await startSupervised(runtime, { mode: client === "claude-code" ? "pipe" : "lease", firstSignal: client === "claude-code" ? "TERM" : "INT",
        command: launch.command, args: [...launch.prefix, ...args], workdir, environment, onLine })
        .catch(error => { throw new LabAiError("CLIENT_UNAVAILABLE", error?.code ?? "SPAWN_FAILED", { reason: `${name} could not be started.` }); });
      let aborted = false;
      const onAbort = () => {
        aborted = true;
        handle.stop({ beforeClose: client === "claude-code" ? () => handle.write(claudeInterrupt(`lab-int-${newId()}`)) : null });
      };
      turn.signal?.addEventListener("abort", onAbort, { once: true });
      if (turn.signal?.aborted) onAbort();
      if (client === "claude-code" && !aborted) {
        if (!(await handle.write(claudeUserMessage(turn.prompt, turn.image)))) handle.closeInput();
      }
      const finished = await handle.finished;
      turn.signal?.removeEventListener("abort", onAbort);
      if (aborted) throw new LabAiError("ABORTED");
      const rateLimit = rateLimitText(client, limit);
      if (result?.ok) {
        const text = client === "codex" ? (texts.at(-1) ?? "") : (result.text || texts.join("\n\n"));
        const json = turn.json ? (result.structured && typeof result.structured === "object" ? result.structured : parseJson(text)) : null;
        return Object.freeze({ client, text, json, model, costUsd: result.costUsd, durationMs: result.durationMs ?? Math.max(0, clock() - started),
          latencyMs: Math.max(0, clock() - started), rateLimit });
      }
      if (limit?.status === "rejected") throw new LabAiError("TURN_FAILED", "rate limited", { reason: rateLimit });
      const failure = failureText(client, { stderr: finished.stderr, notice, exitCode: finished.exitCode, reason: result?.reason ?? result?.text ?? "" });
      if (finished.outputError) throw new LabAiError("TURN_FAILED", finished.outputError, { reason: `${name} sent more than the Lab reads.` });
      throw new LabAiError(failure.code === "SIGN_IN" ? "CLIENT_UNAVAILABLE" : "TURN_FAILED", failure.code, { reason: failure.text });
    } finally {
      await run.remove();
    }
  }

  return Object.freeze({ connected: true, runTurn });
}

// ---- backend for this process ------------------------------------------------------------------

/** Until a backend is set (tests; a window that never asks). */
const NOT_CONNECTED = Object.freeze({
  connected: false,
  async runTurn() { throw new LabAiError("AI_NOT_CONNECTED", "No AI backend is connected to the Lab."); },
});
let backend = NOT_CONNECTED;

/**
 * Sets the process backend: an object with runTurn(turn) → Promise<{ text,
 * json?, … }>, where `turn` is a normalizeTurnRequest() result whose `signal`
 * already includes the timeout and `onText(textSoFar)` may be called while it
 * streams. It throws LabAiError (or an Error whose message is one of
 * AI_ERRORS). Returns a function that restores the previous backend (tests).
 * The Lab connects createCliAiBackend through platform.sys.mjs.
 */
export function setLabAiBackend(next) {
  if (typeof next?.runTurn !== "function") throw new TypeError("a Lab AI backend has runTurn(turn)");
  const previous = backend;
  backend = next;
  return () => { if (backend === next) backend = previous; };
}
export const labAiConnected = () => backend !== NOT_CONNECTED && backend.connected !== false;

// ---- facade -------------------------------------------------------------------------------------

const codeOf = error => (AI_ERRORS.includes(error?.code) ? error.code : AI_ERRORS.includes(error?.message) ? error.message : "TURN_FAILED");

function windowIsPrivate(window) {
  try {
    const { PrivateBrowsingUtils } = ChromeUtils.importESModule("resource://gre/modules/PrivateBrowsingUtils.sys.mjs");
    return PrivateBrowsingUtils.isWindowPrivate(window);
  } catch { return true; }
}

/**
 * The facade one window's experiments get as ctx.ai. `isPrivate()` is asked
 * on every turn (default: PrivateBrowsingUtils for `window`; unknown counts
 * as private). `getBackend` gives the backend (default: the process one set
 * with setLabAiBackend); `getStatus(options)` the clients' status
 * (clients.sys.mjs statuses; absent: every client "unchecked").
 */
export function createLabAi({ window = null, isPrivate = null, getBackend = () => backend, getStatus = null } = {}) {
  const privateNow = () => {
    try { return (isPrivate ? isPrivate() : windowIsPrivate(window)) !== false; } catch { return true; }
  };
  const Controller = window?.AbortController ?? globalThis.AbortController;
  const later = (fn, ms) => (window?.setTimeout ? window.setTimeout(fn, ms) : globalThis.setTimeout(fn, ms));
  const cancel = id => (window?.clearTimeout ? window.clearTimeout(id) : globalThis.clearTimeout(id));

  async function runTurn(request) {
    const turn = normalizeTurnRequest(request);
    if (privateNow()) throw new LabAiError("PRIVATE_WINDOW");
    if (turn.signal?.aborted) throw new LabAiError("ABORTED");
    const controller = new Controller();
    let reason = null;
    const stop = code => { if (!reason) { reason = code; controller.abort(); } };
    const onAbort = () => stop("ABORTED");
    turn.signal?.addEventListener("abort", onAbort, { once: true });
    const timer = later(() => stop("TIMEOUT"), turn.timeoutMs);
    let stopped;
    const aborted = new Promise((_, reject) => {
      stopped = () => reject(new LabAiError(reason ?? "ABORTED"));
      controller.signal.addEventListener("abort", stopped, { once: true });
    });
    aborted.catch(() => {});
    let streamed = "";
    const onText = turn.onText ? text => {
      if (reason || typeof text !== "string") return;
      streamed = text;
      try { turn.onText(text); } catch (error) { console.error("AxioSozo Lab: onText failed", error); }
    } : null;
    try {
      // After a stop the backend still ends its process and cleans up; its late failure is nobody's.
      const work = Promise.resolve().then(() => getBackend().runTurn(Object.freeze({ ...turn, signal: controller.signal, onText })));
      work.catch(() => {});
      const result = await Promise.race([work, aborted]);
      if (reason) throw new LabAiError(reason);
      const text = typeof result?.text === "string" ? result.text : streamed;
      let json = null;
      if (turn.json) {
        json = result?.json ?? null;
        if (json === null) { try { json = JSON.parse(text); } catch { json = null; } }
        if (json === null || typeof json !== "object") throw new LabAiError("INVALID_OUTPUT");
      }
      const number = value => (typeof value === "number" && Number.isFinite(value) ? value : null);
      return Object.freeze({ client: AI_CLIENTS.includes(result?.client) ? result.client : turn.client, text, json,
        model: typeof result?.model === "string" ? result.model : null, costUsd: number(result?.costUsd), durationMs: number(result?.durationMs),
        latencyMs: number(result?.latencyMs), rateLimit: typeof result?.rateLimit === "string" ? result.rateLimit : null });
    } catch (error) {
      if (error instanceof LabAiError) throw reason && error.code !== reason ? new LabAiError(reason) : error;
      throw new LabAiError(reason ?? codeOf(error), String(error?.message ?? error), { reason: typeof error?.reason === "string" ? error.reason : null });
    } finally {
      cancel(timer);
      turn.signal?.removeEventListener("abort", onAbort);
      controller.signal.removeEventListener("abort", stopped);
    }
  }

  /** Every client's status (clients.sys.mjs); check: true reads versions and checks options (no model call). */
  async function clientStatus({ check = false, force = false } = {}) {
    if (typeof getStatus !== "function") {
      return AI_CLIENTS.map(id => Object.freeze({ id, label: CLIENT_LABELS[id], state: "unchecked", available: false, version: null,
        executable: null, capabilities: Object.freeze([]), reason: "Not checked", checkedAt: null }));
    }
    return getStatus({ check: check === true, force: force === true });
  }

  return Object.freeze({ runTurn, clientStatus, clients: AI_CLIENTS,
    connected: () => getBackend() !== NOT_CONNECTED && getBackend().connected !== false });
}

/**
 * What leaves this Mac, in one line, to show before or while it is sent:
 * "Region image and page address go to Claude Code."
 */
export function outgoingText(client, { image = false, page = false, consoleErrors = false, note = false } = {}) {
  const parts = [image ? "region image" : null, page ? "page address" : null, consoleErrors ? "console errors" : null,
    note ? "your note" : null].filter(Boolean);
  const name = CLIENT_LABELS[client] ?? "your assistant";
  if (!parts.length) return `Your question goes to ${name}.`;
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
  const verb = parts.length === 1 && !/s$/u.test(list) ? "goes" : "go";
  return oneLine(`${list[0].toUpperCase()}${list.slice(1)} ${verb} to ${name}.`, 160);
}
