/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { CONTEXT_TYPES, deepFreeze, isPlainObject, utf8Length, validateSiteRule } from './schema.mjs';
import { effectiveObservation } from './rules.mjs';

// Jev checkpoint pacing, the rolling-hour budget and the decision-v1
// `site_rule_v1` request builder. Chrome enforces these; the provider host
// re-validates the request strictly and never normalizes it.

export const DEFAULT_INTERVAL_MINUTES = 5;
export const DEFAULT_HOURLY_BUDGET = 30;
export const MAX_DEADLINE_MS = 30000;
export const OUTLINE_KINDS = Object.freeze(['heading', 'link', 'label']);
const HOUR_MS = 3600000, DAY_MS = 86400000, STATE_BYTES = 65536, SCREEN_STATE_BYTES = 1572864;
const SCREEN_BYTES = 1048576, SCREEN_SIDE = 1280;
const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LIMITS = Object.freeze({ instruction: 2000, title: 256, path: 2048, outlineItems: 200, outlineText: 200 });
const bad = (path, message) => { throw new ContextsError('INVALID_INPUT', `${path}: ${message}`, path); };
const epoch = (v, path) => { if (!Number.isSafeInteger(v) || v < 0) bad(path, 'expected epoch ms'); return v; };

export const createBudget = () => deepFreeze({ calls: [] });

// Rolling hour: a call is allowed while fewer than `limit` calls happened in (now − 1 h, now].
export function takeBudget(budget, { now, limit = DEFAULT_HOURLY_BUDGET } = {}) {
  epoch(now, '$.now');
  if (!Number.isInteger(limit) || limit < 0 || limit > DEFAULT_HOURLY_BUDGET) bad('$.limit', 'expected 0–30');
  if (!Array.isArray(budget?.calls) || !budget.calls.every(Number.isSafeInteger)) bad('$.budget', 'expected { calls: epoch ms[] }');
  const calls = budget.calls.filter(t => t > now - HOUR_MS && t <= now);
  if (calls.length >= limit) return Object.freeze({ ok: false, budget: deepFreeze({ calls }) });
  return Object.freeze({ ok: true, budget: deepFreeze({ calls: [...calls, now] }) });
}

// Whether an interval checkpoint is due. Background tabs and private windows never are.
export function nextCheckpoint({ lastAt = null, intervalMinutes = DEFAULT_INTERVAL_MINUTES, now, foreground, isPrivate } = {}) {
  epoch(now, '$.now');
  if (!Number.isInteger(intervalMinutes) || intervalMinutes < 1 || intervalMinutes > 30) bad('$.intervalMinutes', 'expected 1–30');
  if (foreground !== true || isPrivate !== false) return false;
  if (lastAt === null) return true;
  epoch(lastAt, '$.lastAt');
  return now - lastAt >= intervalMinutes * 60000;
}

// Length limits in the host are UTF-16 code units; never split a surrogate pair.
const clipUnits = (s, max) => { if (s.length <= max) return s; const out = s.slice(0, max); return /[\ud800-\udbff]$/.test(out) ? out.slice(0, -1) : out; };
const collapse = s => s.replace(/[\u0000-\u001f\u007f]/gu, ' ').replace(/\s+/gu, ' ').trim();
const duration = (v, path) => { if (!Number.isFinite(v) || v < 0) bad(path, 'expected a non-negative duration'); return Math.min(DAY_MS, Math.round(v)); };

// Matches the existing decision-v1 PNG admission checks without Node globals.
// Only the bounded 33-byte PNG header is decoded; the image is never rendered.
function screenObservation(value) {
  const path = '$.observation.screen';
  if (!isPlainObject(value) || Object.keys(value).length !== 4
    || !['mime', 'width', 'height', 'data_base64'].every(key => Object.prototype.hasOwnProperty.call(value, key))) bad(path, 'expected the fixed PNG fields');
  const { mime, width, height, data_base64: data } = value;
  const side = n => Number.isSafeInteger(n) && n >= 1 && n <= SCREEN_SIDE;
  if (mime !== 'image/png' || !side(width) || !side(height) || typeof data !== 'string'
    || data.length === 0 || data.length % 4 !== 0 || data.length > Math.ceil(SCREEN_BYTES / 3) * 4
    || !/^[A-Za-z0-9+/]+={0,2}$/u.test(data)) bad(path, 'invalid PNG fields');
  const bytes = data.length / 4 * 3 - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0);
  if (bytes < 33 || bytes > SCREEN_BYTES) bad(path, 'image exceeds its byte cap or lacks a PNG header');
  const header = [];
  for (let i = 0; i < 44; i += 4) {
    const bits = BASE64.indexOf(data[i]) * 262144 + BASE64.indexOf(data[i + 1]) * 4096
      + BASE64.indexOf(data[i + 2]) * 64 + BASE64.indexOf(data[i + 3]);
    header.push((bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
  }
  const uint32 = offset => header.slice(offset, offset + 4).reduce((n, byte) => n * 256 + byte, 0);
  if (![137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => header[i] === byte)
    || uint32(8) !== 13 || ![73, 72, 68, 82].every((byte, i) => header[12 + i] === byte)
    || uint32(16) !== width || uint32(20) !== height) bad(path, 'image is not the declared PNG');
  return { mime, width, height, data_base64: data };
}

// Builds a decision-v1 site_rule_v1 request, or null when nothing may be sent:
// rule disabled, no effects, not an http(s) page, host not covered by the rule,
// or effective observation level none. `observation` is { url, title, outline, screen };
// outline items are { kind, text }, with ids assigned here (o1, o2, ...).
// Screen follows decision-v1. Native capture is unavailable by default.
// `screenAvailable: true` is a trusted caller's opt-in only after normal-window,
// current-document, blocked-category and password-field capture gates pass;
// It grants neither provider consent nor live-call authorization.
export function buildSiteRuleRequest({ rule, contextType, checkpoint, elapsed, observation, requestId, now, timeoutMs = MAX_DEADLINE_MS, screenAvailable = false } = {}) {
  const r = validateSiteRule(rule);
  if (!CONTEXT_TYPES.includes(contextType)) bad('$.contextType', 'expected a context type');
  if (!['commit', 'interval'].includes(checkpoint)) bad('$.checkpoint', 'expected commit or interval');
  if (typeof requestId !== 'string' || !/^[A-Za-z0-9_.:-]{1,160}$/.test(requestId)) bad('$.requestId', 'invalid request id');
  epoch(now, '$.now');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_DEADLINE_MS) bad('$.timeoutMs', 'expected 1–30000');
  const today = duration(elapsed?.today_ms, '$.elapsed.today_ms'), session = duration(elapsed?.foreground_session_ms, '$.elapsed.foreground_session_ms');
  if (!r.enabled || r.effects.length === 0) return null;
  let u;
  try { u = new URL(typeof observation?.url === 'string' ? observation.url : ''); } catch { return null; }
  if (!['http:', 'https:'].includes(u.protocol)) return null;
  const level = effectiveObservation(r, u.hostname);
  if (level === 'none') return null;
  // Missing capture support or an image-incapable provider permits no request.
  if (level === 'screen' && (screenAvailable !== true || r.provider !== 'openai')) return null;
  const address = { origin: u.origin, path: clipUnits(u.pathname, LIMITS.path) || '/', title: clipUnits(collapse(typeof observation.title === 'string' ? observation.title : ''), LIMITS.title).trim() };
  const obs = { level, address };
  if (level === 'screen') obs.screen = screenObservation(observation.screen);
  if (level === 'outline') {
    const items = [];
    for (const item of Array.isArray(observation.outline) ? observation.outline : []) {
      if (items.length >= LIMITS.outlineItems) break;
      if (!OUTLINE_KINDS.includes(item?.kind) || typeof item.text !== 'string') continue;
      const text = clipUnits(collapse(item.text), LIMITS.outlineText).trim();
      if (text) items.push({ id: `o${items.length + 1}`, kind: item.kind, text });
    }
    obs.outline = items;
  }
  const state = {
    rule: { id: r.id, instruction: clipUnits(r.instruction, LIMITS.instruction), effects: [...r.effects] },
    context_type: contextType, checkpoint, elapsed: { today_ms: today, foreground_session_ms: session }, observation: obs,
  };
  const stateBytes = level === 'screen' ? SCREEN_STATE_BYTES : STATE_BYTES;
  while (obs.outline?.length && utf8Length(JSON.stringify(state)) > stateBytes) obs.outline.pop();
  if (utf8Length(JSON.stringify(state)) > stateBytes) bad('$.state', 'decision state exceeds its byte cap');
  return deepFreeze({ version: 1, request_id: requestId, choice_set: 'site_rule_v1', context_version: 'site-rule-1', deadline_ms: now + timeoutMs,
    ...(r.provider === undefined ? {} : { provider: r.provider }), state });
}
