/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Tolerant readers of the clients' documented machine output, one parsed JSON
// line at a time, into a few plain events the Lab understands. They key only
// on the small documented core and ignore every other type and field, so a
// client update that adds events (Claude's rate_limit_event, thinking_tokens
// or session_title_changed; Codex's non-fatal "error" notices) changes nothing:
//
//   Claude Code  `claude -p --output-format stream-json`: type/subtype,
//                session_id, assistant content blocks (text, tool_use), result
//                (subtype, is_error, result, structured_output, total_cost_usd,
//                duration_ms, permission_denials, terminal_reason),
//                rate_limit_event, control_response.
//   Codex        `codex exec --json`: thread.started, turn.started,
//                turn.completed, turn.failed, item.started/item.completed
//                (agent_message, command_execution, file_change, reasoning, …),
//                error (a notice: reconnects are not fatal).
//   Antigravity  `agy -p --output-format stream-json`: init, step_update, result.
//
// Events (each a frozen object with `kind`):
//   { kind: "init", sessionId, model? }
//   { kind: "step", text }               one line for "what it is doing now"
//   { kind: "files", paths }             files a tool says it edited or wrote
//   { kind: "text", text, delta? }       the agent's own words: a whole message, or
//                                        (delta: true, Antigravity) the next piece of one
//   { kind: "rate_limit", limit }        { status, type, utilization, resetsAt }
//   { kind: "notice", text }             a non-fatal note (Codex reconnecting)
//   { kind: "control", requestId, ok }   Claude's answer to our interrupt
//   { kind: "result", ok, text, structured, costUsd, durationMs, denials,
//     reason, aborted, usage }           the run's end, as the client says it
import { basename, oneLine } from "./process.sys.mjs";

const isObject = value => !!value && typeof value === "object" && !Array.isArray(value);
const str = value => (typeof value === "string" ? value : null);
const num = value => (typeof value === "number" && Number.isFinite(value) ? value : null);
const ev = value => Object.freeze(value);

/** Parses one output line as a JSON object, or null (a blank, garbled or non-object line). */
export function parseJsonLine(line) {
  if (typeof line !== "string" || !line.trim().startsWith("{")) return null;
  try { const value = JSON.parse(line); return isObject(value) ? value : null; } catch { return null; }
}

// ---- step lines ------------------------------------------------------------------------------

const quoted = text => `“${oneLine(text, 40)}”`;
const fileOf = value => (typeof value === "string" && value ? basename(value) : null);

/** "Reading index.html", "Editing styles.css", "Running npm test": one calm line for a tool use. */
export function stepText(tool, input = {}) {
  const name = typeof tool === "string" ? tool : "";
  const args = isObject(input) ? input : {};
  const file = fileOf(args.file_path ?? args.path ?? args.notebook_path ?? args.AbsolutePath ?? args.TargetFile ?? args.file);
  switch (name) {
    case "Read": case "view_file": case "read_file": return file ? `Reading ${file}` : "Reading a file";
    case "Edit": case "MultiEdit": case "replace_file_content": case "multi_replace_file_content": case "edit_file":
      return file ? `Editing ${file}` : "Editing a file";
    case "Write": case "write_to_file": case "create_file": return file ? `Writing ${file}` : "Writing a file";
    case "NotebookEdit": return file ? `Editing ${file}` : "Editing a notebook";
    case "Glob": case "list_dir": case "find_by_name": return "Looking through the files";
    case "Grep": case "grep_search": case "codebase_search": {
      const pattern = str(args.pattern) ?? str(args.Query) ?? str(args.query);
      return pattern ? `Searching for ${quoted(pattern)}` : "Searching the code";
    }
    case "Bash": case "run_command": {
      const command = str(args.command) ?? str(args.CommandLine);
      return command ? `Running ${oneLine(command, 60)}` : "Running a command";
    }
    case "WebFetch": case "read_url_content": return "Reading a web page";
    case "WebSearch": case "search_web": return "Searching the web";
    case "TodoWrite": return "Planning the work";
    case "Task": case "Agent": return "Asking a helper agent";
    case "StructuredOutput": case "finish": return "Writing the answer";
    default: return name ? `Using ${oneLine(name, 40)}` : "Working";
  }
}

const EDIT_TOOLS = new Set(["Edit", "MultiEdit", "Write", "NotebookEdit", "replace_file_content", "multi_replace_file_content",
  "edit_file", "write_to_file", "create_file"]);

/** The file a tool use edits or writes, or null. */
export function editedFile(tool, input) {
  if (!EDIT_TOOLS.has(tool) || !isObject(input)) return null;
  const path = str(input.file_path) ?? str(input.notebook_path) ?? str(input.path) ?? str(input.TargetFile) ?? str(input.AbsolutePath);
  return path && path.startsWith("/") ? path : null;
}

// ---- Claude Code ------------------------------------------------------------------------------

/** Claude's rate_limit_info as { status, type, utilization, resetsAt (ms) }, or null. */
export function claudeRateLimit(info) {
  if (!isObject(info)) return null;
  const utilization = num(info.utilization) ?? num(info.unifiedWindows?.five_hour?.utilization);
  const resets = num(info.resetsAt);
  return Object.freeze({ status: str(info.status) ?? "unknown", type: str(info.rateLimitType) ?? "five_hour",
    utilization: utilization === null ? null : Math.max(0, Math.min(1, utilization)), resetsAt: resets === null ? null : resets * 1000 });
}

/** The events in one Claude Code stream-json object ([] for anything not in the core). */
export function claudeEvents(message) {
  if (!isObject(message)) return [];
  const type = message.type;
  if (type === "system") {
    if (message.subtype === "init") return [ev({ kind: "init", sessionId: str(message.session_id), model: str(message.model) })];
    return [];
  }
  if (type === "assistant" && isObject(message.message) && Array.isArray(message.message.content)) {
    // A helper agent's own messages (parent_tool_use_id set) are not the run's words.
    if (message.parent_tool_use_id) return [];
    const events = [];
    for (const block of message.message.content) {
      if (!isObject(block)) continue;
      if (block.type === "text" && typeof block.text === "string" && block.text.trim()) events.push(ev({ kind: "text", text: block.text }));
      else if (block.type === "tool_use" && typeof block.name === "string") {
        events.push(ev({ kind: "step", text: stepText(block.name, block.input) }));
        const file = editedFile(block.name, block.input);
        if (file) events.push(ev({ kind: "files", paths: Object.freeze([file]) }));
      }
    }
    return events;
  }
  if (type === "rate_limit_event") {
    const limit = claudeRateLimit(message.rate_limit_info);
    return limit ? [ev({ kind: "rate_limit", limit })] : [];
  }
  if (type === "control_response" && isObject(message.response)) {
    return [ev({ kind: "control", requestId: str(message.response.request_id), ok: message.response.subtype === "success" })];
  }
  if (type === "result") {
    const denials = Array.isArray(message.permission_denials)
      ? message.permission_denials.filter(isObject).map(item => Object.freeze({ tool: str(item.tool_name) ?? "a tool",
        step: stepText(item.tool_name, item.tool_input) })).slice(0, 8) : [];
    const aborted = message.terminal_reason === "aborted_streaming" || message.terminal_reason === "aborted";
    const subtype = str(message.subtype) ?? "";
    const isError = message.is_error === true || (subtype !== "" && subtype !== "success");
    return [ev({ kind: "result", ok: !isError, text: str(message.result) ?? "",
      structured: message.structured_output === undefined ? null : message.structured_output,
      costUsd: num(message.total_cost_usd), durationMs: num(message.duration_ms), sessionId: str(message.session_id),
      denials: Object.freeze(denials), reason: isError ? subtype || "error" : null, aborted, usage: null })];
  }
  return [];
}

// ---- Codex ----------------------------------------------------------------------------------------

function codexItem(item, completed) {
  if (!isObject(item)) return [];
  switch (item.type) {
    case "agent_message":
      return completed && typeof item.text === "string" && item.text.trim() ? [ev({ kind: "text", text: item.text })] : [];
    case "reasoning": return completed ? [] : [ev({ kind: "step", text: "Thinking" })];
    case "command_execution":
      return completed ? [] : [ev({ kind: "step", text: typeof item.command === "string" ? `Running ${oneLine(codexCommand(item.command), 60)}` : "Running a command" })];
    case "file_change": {
      const paths = Array.isArray(item.changes) ? item.changes.map(change => str(change?.path)).filter(path => path?.startsWith("/")) : [];
      const events = [];
      if (!completed) events.push(ev({ kind: "step", text: paths.length ? `Editing ${paths.map(basename).slice(0, 3).join(", ")}` : "Editing files" }));
      else if (paths.length && item.status !== "failed") events.push(ev({ kind: "files", paths: Object.freeze(paths) }));
      return events;
    }
    case "web_search": return completed ? [] : [ev({ kind: "step", text: "Searching the web" })];
    case "mcp_tool_call": return completed ? [] : [ev({ kind: "step", text: typeof item.tool === "string" ? `Using ${oneLine(item.tool, 40)}` : "Using a tool" })];
    case "todo_list": return completed ? [] : [ev({ kind: "step", text: "Planning the work" })];
    case "error": return typeof item.message === "string" ? [ev({ kind: "notice", text: oneLine(item.message, 200) })] : [];
    default: return [];
  }
}

/** `/bin/zsh -lc "rg -n …"` → `rg -n …` (what the user would recognise). */
export function codexCommand(command) {
  const match = /^\/bin\/(?:zsh|bash|sh) -l?c (["'])([\s\S]*)\1$/u.exec(command.trim());
  return match ? match[2] : command;
}

/** The events in one `codex exec --json` object ([] for anything not in the core). */
export function codexEvents(message) {
  if (!isObject(message) || typeof message.type !== "string") return [];
  switch (message.type) {
    case "thread.started": return [ev({ kind: "init", sessionId: str(message.thread_id), model: null })];
    case "turn.started": return [ev({ kind: "step", text: "Thinking" })];
    case "item.started": return codexItem(message.item, false);
    case "item.updated": return [];
    case "item.completed": return codexItem(message.item, true);
    case "turn.completed": {
      const usage = isObject(message.usage) ? Object.freeze({ inputTokens: num(message.usage.input_tokens), outputTokens: num(message.usage.output_tokens) }) : null;
      return [ev({ kind: "result", ok: true, text: "", structured: null, costUsd: null, durationMs: null, sessionId: null,
        denials: Object.freeze([]), reason: null, aborted: false, usage })];
    }
    case "turn.failed": {
      const message_ = str(message.error?.message) ?? "";
      return [ev({ kind: "result", ok: false, text: message_, structured: null, costUsd: null, durationMs: null, sessionId: null,
        denials: Object.freeze([]), reason: oneLine(message_, 300) || "failed", aborted: false, usage: null })];
    }
    // Not fatal: "Reconnecting… 2/5", warnings. Only turn.failed or an exit without turn.completed fails a run.
    case "error": return typeof message.message === "string" ? [ev({ kind: "notice", text: oneLine(message.message, 200) })] : [];
    default: return [];
  }
}

// ---- Antigravity -----------------------------------------------------------------------------------

/** The events in one `agy -p --output-format stream-json` object. */
export function agyEvents(message) {
  if (!isObject(message) || typeof message.event !== "string") return [];
  if (message.event === "init") {
    return [ev({ kind: "init", sessionId: str(message.conversation_id) ?? str(message.init?.conversation_id), model: str(message.init?.model) })];
  }
  if (message.event === "step_update" && isObject(message.step_update)) {
    const step = message.step_update;
    const events = [];
    if (step.step_type === "tool" && step.state === "ACTIVE") {
      const tool = str(step.tool_name) ?? str(step.tool_info?.name) ?? "";
      if (tool && tool !== "finish") events.push(ev({ kind: "step", text: stepText(tool, step.tool_info?.parameters) }));
    }
    if (step.step_type === "tool" && step.state === "DONE") {
      const tool = str(step.tool_name) ?? str(step.tool_info?.name) ?? "";
      const file = editedFile(tool, step.tool_info?.parameters);
      if (file) events.push(ev({ kind: "files", paths: Object.freeze([file]) }));
    }
    // The answer arrives in pieces (several step updates of one step): each is a delta.
    if (step.step_type === "agent_response" && typeof step.text_delta === "string" && step.text_delta) {
      events.push(ev({ kind: "text", text: step.text_delta, delta: true, part: num(step.step_index) }));
    }
    return events;
  }
  if (message.event === "result" && isObject(message.result)) {
    const result = message.result;
    const ok = result.status === "SUCCESS";
    const seconds = num(result.duration_seconds);
    // What it wanted and was refused (headless, nobody can approve): { action: "command", display_name: "RunCommand" }.
    const denials = Array.isArray(result.denied_actions) ? result.denied_actions.filter(isObject).slice(0, 8).map(item => Object.freeze({
      tool: str(item.display_name) ?? str(item.action) ?? "an action",
      step: item.action === "command" ? "Running a command" : item.action === "edit" || item.action === "write" ? "Editing a file"
        : stepText(str(item.display_name) ?? "") })) : [];
    return [ev({ kind: "result", ok, text: str(result.response) ?? "", structured: result.structured_output === undefined ? null : result.structured_output,
      costUsd: null, durationMs: seconds === null ? null : Math.round(seconds * 1000), sessionId: str(result.conversation_id),
      denials: Object.freeze(denials), reason: ok ? null : oneLine(str(result.error?.message) ?? str(result.status) ?? "failed", 300), aborted: false, usage: null })];
  }
  return [];
}

export const STREAM_PARSERS = Object.freeze({ "claude-code": claudeEvents, codex: codexEvents, antigravity: agyEvents });

/** The events in one output line of `client` ([] for a line that is not part of the core). */
export function eventsOf(client, line) {
  const parse = STREAM_PARSERS[client];
  const message = parseJsonLine(line);
  return parse && message ? parse(message) : [];
}

// ---- calm sentences -------------------------------------------------------------------------------

const LABELS = Object.freeze({ "claude-code": "Claude Code", codex: "Codex", antigravity: "Antigravity" });
const clock = ms => {
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

/**
 * One calm sentence about a rate limit, or null when it is not worth saying:
 * "Claude Code is at 96 % of its 5-hour limit." / "Claude Code is out of its
 * 5-hour limit until 23:30."
 */
export function rateLimitText(client, limit) {
  if (!limit) return null;
  const name = LABELS[client] ?? "The assistant";
  const window = limit.type === "seven_day" ? "weekly" : limit.type === "five_hour" ? "5-hour" : "usage";
  if (limit.status === "rejected") return limit.resetsAt ? `${name} is out of its ${window} limit until ${clock(limit.resetsAt)}.` : `${name} is out of its ${window} limit for now.`;
  if (limit.utilization !== null && limit.utilization >= 0.8) return `${name} is at ${Math.round(limit.utilization * 100)} % of its ${window} limit.`;
  return null;
}

/**
 * Why a run ended without an answer, from what it printed (stderr tail and
 * the last notice), in one calm sentence; never the raw text.
 */
export function failureText(client, { stderr = "", notice = "", exitCode = null, reason = "" } = {}) {
  const name = LABELS[client] ?? "The assistant";
  const text = `${reason}\n${notice}\n${stderr}`;
  if (/not (?:logged|signed) in|need to (?:log|sign) in|(?:log|sign) ?in (?:is )?required|please (?:log|sign) in|\/login\b|codex login|authenticat|unauthori[sz]ed|\b401\b|invalid api key|credentials/iu.test(text)) {
    return { code: "SIGN_IN", text: `${name} needs you to sign in. Open ${name} and sign in there.` };
  }
  if (/rate.?limit|usage limit|\b429\b|quota|limit reached|too many requests|out of credits/iu.test(text)) {
    return { code: "RATE_LIMITED", text: `${name} has reached its usage limit for now.` };
  }
  if (/max.?budget|budget/iu.test(reason)) return { code: "BUDGET", text: `${name} stopped at the spending cap for this task.` };
  // Codex --strict-config: a setting we pass was renamed or removed in this version.
  const setting = /unknown configuration field [`'"]?([A-Za-z0-9_.-]+)/u.exec(text);
  if (setting) return { code: "CHANGED", text: `${name} changed a setting we use: ${setting[1]}` };
  if (/workspace not trusted|not trusted/iu.test(text)) return { code: "NOT_TRUSTED", text: `${name} does not trust this folder yet. Open it once in ${name} first.` };
  if (/ENOTFOUND|network|connect(?:ion)? (?:refused|reset|error)|offline|timed out|\b50[0-9]\b|overloaded/iu.test(text)) {
    return { code: "NETWORK", text: `${name} could not reach its service. Try again in a moment.` };
  }
  if (exitCode === 127 || /No such file or directory/u.test(stderr)) return { code: "MISSING", text: `${name} could not be started. Check that it is still installed.` };
  return { code: "FAILED", text: `${name} stopped without finishing.` };
}

/**
 * The agent's closing sentence for a result card: its last line when that
 * fits, else that line's last sentence; markdown links and code marks become
 * plain text ("Updated the price in [index.html](file://…#L9)." → "Updated
 * the price in index.html."); at most `max` characters.
 */
export function lastSentence(text, max = 120) {
  if (typeof text !== "string") return "";
  const plain = text.replace(/!?\[([^\]]*)\]\([^)]*\)/gu, "$1").replace(/`+/gu, "").replace(/\*\*|__/gu, "");
  const lines = plain.split(/\n+/u).map(line => line.replace(/^[\s>*#-]+/u, "").trim()).filter(Boolean);
  const last = lines.at(-1) ?? "";
  if ([...last].length <= max) return oneLine(last, max);
  const sentences = last.split(/(?<=[.!?]["”’)]*)\s+/u).map(item => item.trim()).filter(Boolean);
  return oneLine(sentences.at(-1) ?? last, max);
}
