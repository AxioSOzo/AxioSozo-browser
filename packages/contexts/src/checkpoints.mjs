/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { CONTEXT_TYPES, deepFreeze, utf8Length, validateSiteRule } from './schema.mjs';
import { effectiveObservation } from './rules.mjs';

// Jev checkpoint pacing, the rolling-hour budget and the decision-v1
// `site_rule_v1` request builder. Chrome enforces these; the provider host
// re-validates the request strictly and never normalizes it.

export const DEFAULT_INTERVAL_MINUTES = 5;
export const DEFAULT_HOURLY_BUDGET = 30;
export const MAX_DEADLINE_MS = 30000;
export const OUTLINE_KINDS = Object.freeze(['heading', 'link', 'label']);
const HOUR_MS = 3600000, DAY_MS = 86400000, STATE_BYTES = 65536;
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

// Builds a decision-v1 site_rule_v1 request, or null when nothing may be sent:
// rule disabled, no effects, not an http(s) page, host not covered by the rule,
// or effective observation level none. `observation` is { url, title, outline }
// where outline items are { kind, text }; ids are assigned here (o1, o2, …).
export function buildSiteRuleRequest({ rule, contextType, checkpoint, elapsed, observation, requestId, now, timeoutMs = MAX_DEADLINE_MS } = {}) {
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
  const address = { origin: u.origin, path: clipUnits(u.pathname, LIMITS.path) || '/', title: clipUnits(collapse(typeof observation.title === 'string' ? observation.title : ''), LIMITS.title).trim() };
  const obs = { level, address };
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
  while (obs.outline?.length && utf8Length(JSON.stringify(state)) > STATE_BYTES) obs.outline.pop();
  return deepFreeze({ version: 1, request_id: requestId, choice_set: 'site_rule_v1', context_version: 'site-rule-1', deadline_ms: now + timeoutMs, state });
}
