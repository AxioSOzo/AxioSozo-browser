/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { clip, codePoints, deepFreeze, isPlainObject, own, utf8Length } from './schema.mjs';

// Agent status (workstation-v1 §5). Coding agents report through
// `axiosozo-notify` over the local channel; the raw hook payloads are turned
// into small status records here. Titles are fixed texts or the agent's own
// short notification, never a transcript. Time and ids are passed in.

export const STATUS_STATES = Object.freeze(['started', 'needs_input', 'done', 'failed']);
export const STATUS_AGENTS = Object.freeze(['claude-code', 'codex', 'other']);
export const HOOK_SOURCES = Object.freeze(['claude-code', 'codex', 'manual']);
export const MAX_HOOK_PAYLOAD_BYTES = 65536;
export const STATUS_KEEP_MS = 24 * 60 * 60 * 1000;
export const STATUS_HISTORY = 20;
const STATUS_ID = /^as_[0-9a-f]{16}$/;
const TITLE_MAX = 120;
const SESSION_MAX = 64;
const PATH_MAX = 4096;
const DEFAULT_TITLES = Object.freeze({ started: 'Agent started', needs_input: 'Agent needs input', done: 'Agent finished', failed: 'Agent failed' });
const CLAUDE_EVENTS = Object.freeze({ Stop: 'done', Notification: 'needs_input', UserPromptSubmit: 'started', SessionStart: 'started' });

const CONTROL = /[\u0000-\u001f\u007f-\u009f]/;
const fail = (path, message) => { throw new ContextsError('INVALID_STATUS', `${path}: ${message}`, path); };

// Whitespace and control characters collapse to single spaces; at most 120
// code points; "" when nothing printable is left.
const collapse = s => (typeof s === 'string' ? clip(s.slice(0, 8192).replace(/[\s\u0000-\u001f\u007f-\u009f]+/g, ' ').trim(), TITLE_MAX).trim() : '');
const absolutePath = p => (typeof p === 'string' && p.startsWith('/') && p.length <= PATH_MAX && !p.includes('\u0000') ? p : null);
const session = s => (typeof s === 'string' && s.length >= 1 && codePoints(s) <= SESSION_MAX && !CONTROL.test(s) ? s : null);

function payloadObject(payload) {
  let value = payload;
  try {
    if (typeof value === 'string') {
      if (utf8Length(value) > MAX_HOOK_PAYLOAD_BYTES) return null;
      value = JSON.parse(value);
    } else if (utf8Length(JSON.stringify(value) ?? '') > MAX_HOOK_PAYLOAD_BYTES) return null;
  } catch { return null; }
  return isPlainObject(value) ? value : null;
}

// One status record from a raw hook report, or null (ignored or malformed).
// Never throws.
export function parseHookEvent(input) {
  try {
    if (!isPlainObject(input)) return null;
    const { source, event, cwd, payload, now, id } = input;
    if (!Number.isSafeInteger(now) || now < 0 || typeof id !== 'string' || !STATUS_ID.test(id)) return null;
    const data = payloadObject(payload ?? {});
    if (!data) return null;
    let agent, state, title, path = absolutePath(cwd), sess = null;
    if (source === 'claude-code') {
      if (typeof event !== 'string' || !Object.hasOwn(CLAUDE_EVENTS, event)) return null; // SubagentStop and others are ignored
      agent = 'claude-code';
      state = CLAUDE_EVENTS[event];
      title = event === 'Notification' ? collapse(own(data, 'message')) || DEFAULT_TITLES.needs_input : DEFAULT_TITLES[state];
      path = absolutePath(own(data, 'cwd')) ?? path;
      sess = session(own(data, 'session_id'));
    } else if (source === 'codex') {
      if (own(data, 'type') !== 'agent-turn-complete') return null;
      agent = 'codex';
      state = 'done';
      title = collapse(own(data, 'last-assistant-message')) || DEFAULT_TITLES.done;
      path = absolutePath(own(data, 'cwd')) ?? path;
      sess = session(own(data, 'thread-id'));
    } else if (source === 'manual') {
      if (!STATUS_STATES.includes(event)) return null;
      agent = STATUS_AGENTS.includes(own(data, 'agent')) ? data.agent : 'other';
      state = event;
      title = collapse(own(data, 'title')) || DEFAULT_TITLES[state];
      sess = session(own(data, 'session'));
    } else return null;
    if (!path) return null;
    return validateStatusRecord({ version: 1, id, project_path: path, agent, state, title, at: now, session: sess });
  } catch { return null; }
}

export function validateStatusRecord(v) {
  if (!isPlainObject(v)) fail('$', 'expected an object');
  const allowed = ['version', 'id', 'project_path', 'agent', 'state', 'title', 'at', 'session'];
  for (const k of Object.keys(v)) if (!allowed.includes(k)) fail(`$.${k}`, 'unknown key');
  for (const k of allowed) if (!Object.hasOwn(v, k)) fail(`$.${k}`, 'missing required key');
  if (v.version !== 1) fail('$.version', 'expected 1');
  if (typeof v.id !== 'string' || !STATUS_ID.test(v.id)) fail('$.id', 'expected as_<16 hex>');
  if (absolutePath(v.project_path) === null || v.project_path.length < 2) fail('$.project_path', 'expected an absolute path');
  if (!STATUS_AGENTS.includes(v.agent)) fail('$.agent', `expected one of ${STATUS_AGENTS.join(', ')}`);
  if (!STATUS_STATES.includes(v.state)) fail('$.state', `expected one of ${STATUS_STATES.join(', ')}`);
  if (typeof v.title !== 'string' || codePoints(v.title) < 1 || codePoints(v.title) > TITLE_MAX || CONTROL.test(v.title)) fail('$.title', 'expected 1–120 characters without control characters');
  if (!Number.isSafeInteger(v.at) || v.at < 0) fail('$.at', 'expected a timestamp');
  if (v.session !== null && session(v.session) === null) fail('$.session', 'expected null or 1–64 characters without control characters');
  return deepFreeze({ version: 1, id: v.id, project_path: v.project_path, agent: v.agent, state: v.state, title: v.title, at: v.at, session: v.session });
}

// Per project: the latest record and up to 20 records newest first; records
// older than keepMs are dropped, invalid ones skipped. Projects with the most
// recent activity first. Equal times keep the later record first.
export function statusBoard(records, { now, keepMs = STATUS_KEEP_MS } = {}) {
  if (!Number.isSafeInteger(now) || now < 0) throw new ContextsError('INVALID_INPUT', '$.now: expected a timestamp', '$.now');
  if (!Number.isSafeInteger(keepMs) || keepMs < 0) throw new ContextsError('INVALID_INPUT', '$.keepMs: expected an integer ≥ 0', '$.keepMs');
  const groups = new Map();
  (Array.isArray(records) ? records : []).forEach((r, i) => {
    let rec;
    try { rec = validateStatusRecord(r); } catch { return; }
    if (rec.at < now - keepMs) return;
    const list = groups.get(rec.project_path) ?? [];
    list.push([rec, i]);
    groups.set(rec.project_path, list);
  });
  const board = [...groups.entries()].map(([project_path, list]) => {
    const history = list.sort(([a, i], [b, j]) => b.at - a.at || j - i).slice(0, STATUS_HISTORY).map(([r]) => r);
    return { project_path, latest: history[0], history };
  });
  board.sort((a, b) => b.latest.at - a.latest.at || (a.project_path < b.project_path ? -1 : 1));
  return deepFreeze(board);
}

// Copyable hook configuration that calls axiosozo-notify. The path is
// absolute and contains no quotes, backslashes or control characters, so it
// can be single-quoted for the hook's shell command and written as a TOML string.
export function hookConfig({ agent, notifyPath } = {}) {
  if (typeof notifyPath !== 'string' || !notifyPath.startsWith('/') || notifyPath.length < 2 || notifyPath.length > PATH_MAX ||
      /["'`\\]/.test(notifyPath) || CONTROL.test(notifyPath)) {
    throw new ContextsError('INVALID_INPUT', '$.notifyPath: expected an absolute path without quotes, backslashes or control characters', '$.notifyPath');
  }
  if (agent === 'claude-code') {
    const hook = event => [{ hooks: [{ type: 'command', command: `'${notifyPath}' claude-code ${event}` }] }];
    return `${JSON.stringify({ hooks: { Stop: hook('Stop'), Notification: hook('Notification'), UserPromptSubmit: hook('UserPromptSubmit') } }, null, 2)}\n`;
  }
  if (agent === 'codex') return `notify = ["${notifyPath}", "codex"]\n`;
  throw new ContextsError('INVALID_INPUT', '$.agent: expected claude-code or codex', '$.agent');
}
