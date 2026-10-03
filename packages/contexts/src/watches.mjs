/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { deepFreeze, isPlainObject, isProjectId, utf8Length } from './schema.mjs';
import { isSensitiveHost } from './rules.mjs';
import { DEFAULT_INTERVAL_MINUTES, DEFAULT_HOURLY_BUDGET, MAX_DEADLINE_MS, OUTLINE_KINDS, takeBudget } from './checkpoints.mjs';

export const WATCH_STORE_VERSION = 1;
export const WATCH_OBSERVATIONS = Object.freeze(['none', 'address', 'outline', 'screen']);
export const WATCH_PROVIDERS = Object.freeze(['jev', 'openai']);
export const WATCH_LIMITS = Object.freeze({ records: 256, question: 500, label: 80, outcomesMin: 2, outcomesMax: 6,
  url: 2048, title: 256, path: 2048, outlineItems: 200, outlineText: 200, stateBytes: 65536,
  screenStateBytes: 1572864, imageBytes: 1048576, imageSide: 1280, confidence: 0.8 });
export const WATCH_RESULT_REASONS = Object.freeze(['validated', 'disabled', 'cancelled', 'timeout', 'BLOCKED_AUTH',
  'HTTP_ERROR', 'NETWORK_ERROR', 'KEYCHAIN_ERROR', 'malformed_output', 'budget_exhausted', 'INVALID_INPUT',
  'HOST_UNAVAILABLE', 'IMAGE_UNSUPPORTED', 'UNVERIFIED_SHAPE', 'NOT_AUTHORIZED']);
export const DEFAULT_WATCH_STORE = deepFreeze({ version: WATCH_STORE_VERSION, watches: [] });
const WATCH_KEYS = Object.freeze(['version', 'id', 'project_id', 'created_by', 'revision', 'url', 'question', 'outcomes', 'observation',
  'provider', 'consent', 'enabled', 'schedule', 'latest_result', 'created_at', 'updated_at']);
const WATCH_ID = /^w_[a-z0-9]{4,32}$/u, OUTCOME_ID = /^[a-z][a-z0-9_]{0,31}$/u;
const REQUEST_ID = /^[A-Za-z0-9_.:-]{1,160}$/u, CONTROLS = /[\u0000-\u001f\u007f]/u;
const bad = (path, message, code = 'INVALID_WATCH') => { throw new ContextsError(code, `${path}: ${message}`, path); };
function shape(v, required, optional, path) {
  if (!isPlainObject(v)) bad(path, 'expected a plain object');
  for (const key of Object.keys(v)) if (!required.includes(key) && !optional.includes(key)) bad(`${path}.${key}`, 'unknown key');
  for (const key of required) if (!Object.hasOwn(v, key)) bad(`${path}.${key}`, 'missing required key');
}
function units(v, min, max, path, controls = false) {
  if (typeof v !== 'string' || v.length < min || v.length > max || (controls && CONTROLS.test(v))) bad(path, 'invalid string');
  return v;
}
function epoch(v, path) { if (!Number.isSafeInteger(v) || v < 0) bad(path, 'expected epoch ms'); return v; }
function flag(v, path) { if (typeof v !== 'boolean') bad(path, 'expected a boolean'); return v; }
function member(v, values, path) { if (!values.includes(v)) bad(path, 'invalid member'); return v; }
function interval(v, path) { if (!Number.isInteger(v) || v < 1 || v > 30) bad(path, 'expected 1–30'); return v; }
function confidence(v, path) {
  if (v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 1)) bad(path, 'expected null or 0–1');
  return v;
}
const checked = (value, pattern, path) => { if (typeof value !== 'string' || !pattern.test(value)) bad(path, 'invalid identifier'); return value; };

// Persist only the page origin/path. Credentials, query strings and fragments
// are removed before the value can enter a watch record or decision request.
export function sanitizeWatchUrl(value) {
  units(value, 1, 8192, '$.url', true);
  if (/\s/u.test(value) || !/^https?:\/\//iu.test(value)) bad('$.url', 'expected an absolute http(s) URL');
  let url;
  try { url = new URL(value); } catch { bad('$.url', 'invalid URL'); }
  if (!['http:', 'https:'].includes(url.protocol)) bad('$.url', 'unsupported protocol');
  url.username = ''; url.password = ''; url.search = ''; url.hash = '';
  const out = url.href;
  if (out.length > WATCH_LIMITS.url || url.pathname.length > WATCH_LIMITS.path || !url.hostname) bad('$.url', 'URL exceeds its cap');
  return out;
}
function outcomes(value, path) {
  if (!Array.isArray(value) || value.length < WATCH_LIMITS.outcomesMin || value.length > WATCH_LIMITS.outcomesMax) bad(path, 'expected 2–6 outcomes');
  const seen = new Set();
  return value.map((item, i) => {
    const at = `${path}[${i}]`; shape(item, ['id', 'label'], [], at);
    const id = checked(item.id, OUTCOME_ID, `${at}.id`);
    if (id === 'unknown' || seen.has(id)) bad(`${at}.id`, 'reserved or duplicate outcome');
    seen.add(id);
    return { id, label: units(item.label, 1, WATCH_LIMITS.label, `${at}.label`, true) };
  });
}
function latest(value, choices, createdAt, updatedAt, path) {
  if (value === null) return null;
  shape(value, ['request_id', 'checked_at', 'outcome', 'reason', 'confidence', 'data_sent', 'provider'], [], path);
  const at = epoch(value.checked_at, `${path}.checked_at`);
  if (at < createdAt || at > updatedAt) bad(`${path}.checked_at`, 'outside record lifetime');
  const outcome = member(value.outcome, ['unknown', ...choices.map(x => x.id)], `${path}.outcome`);
  const reason = member(value.reason, WATCH_RESULT_REASONS, `${path}.reason`);
  const conf = confidence(value.confidence, `${path}.confidence`), sent = flag(value.data_sent, `${path}.data_sent`);
  if ((reason !== 'validated' && outcome !== 'unknown') || (reason === 'validated' && (conf === null || !sent))
    || (outcome !== 'unknown' && conf < WATCH_LIMITS.confidence)) bad(path, 'result does not justify its outcome');
  return { request_id: checked(value.request_id, REQUEST_ID, `${path}.request_id`), checked_at: at, outcome, reason,
    confidence: conf, data_sent: sent, provider: member(value.provider, WATCH_PROVIDERS, `${path}.provider`) };
}
export function validateWatch(value) {
  shape(value, WATCH_KEYS, [], '$');
  if (value.version !== 1 || value.created_by !== 'user') bad('$', 'unsupported record or provenance');
  if (!isProjectId(value.project_id)) bad('$.project_id', 'invalid project identifier');
  if (!Number.isSafeInteger(value.revision) || value.revision < 1) bad('$.revision', 'expected a positive revision');
  const createdAt = epoch(value.created_at, '$.created_at'), updatedAt = epoch(value.updated_at, '$.updated_at');
  if (updatedAt < createdAt) bad('$.updated_at', 'precedes creation');
  const choices = outcomes(value.outcomes, '$.outcomes');
  shape(value.schedule, ['interval_minutes', 'last_checked_at'], [], '$.schedule');
  const lastAt = value.schedule.last_checked_at === null ? null : epoch(value.schedule.last_checked_at, '$.schedule.last_checked_at');
  if (lastAt !== null && (lastAt < createdAt || lastAt > updatedAt)) bad('$.schedule.last_checked_at', 'outside record lifetime');
  return deepFreeze({ version: 1, id: checked(value.id, WATCH_ID, '$.id'), project_id: value.project_id, created_by: 'user', revision: value.revision,
    url: sanitizeWatchUrl(value.url), question: units(value.question, 1, WATCH_LIMITS.question, '$.question', true), outcomes: choices,
    observation: member(value.observation, WATCH_OBSERVATIONS, '$.observation'), provider: member(value.provider, WATCH_PROVIDERS, '$.provider'),
    consent: flag(value.consent, '$.consent'), enabled: flag(value.enabled, '$.enabled'),
    schedule: { interval_minutes: interval(value.schedule.interval_minutes, '$.schedule.interval_minutes'), last_checked_at: lastAt },
    latest_result: latest(value.latest_result, choices, createdAt, updatedAt, '$.latest_result'), created_at: createdAt, updated_at: updatedAt });
}
export function validateWatchStore(value) {
  shape(value, ['version', 'watches'], [], '$');
  if (value.version !== WATCH_STORE_VERSION || !Array.isArray(value.watches) || value.watches.length > WATCH_LIMITS.records) bad('$', 'invalid watch store', 'INVALID_WATCH_STORE');
  const watches = value.watches.map(validateWatch), ids = new Set();
  for (const watch of watches) { if (ids.has(watch.id)) bad('$.watches', 'duplicate watch id', 'INVALID_WATCH_STORE'); ids.add(watch.id); }
  return deepFreeze({ version: WATCH_STORE_VERSION, watches });
}
export function createWatch({ id, projectId, url, question, outcomes: choices, now, userCreated,
  observation = 'none', provider = 'jev', consent = false, enabled = true, intervalMinutes = DEFAULT_INTERVAL_MINUTES } = {}) {
  if (userCreated !== true) bad('$.userCreated', 'explicit user creation required');
  epoch(now, '$.now');
  return validateWatch({ version: 1, id, project_id: projectId, created_by: 'user', revision: 1, url, question, outcomes: choices,
    observation, provider, consent, enabled, schedule: { interval_minutes: intervalMinutes, last_checked_at: null },
    latest_result: null, created_at: now, updated_at: now });
}
// Save only explicit user edits, preserving creation time and invalidating old
// in-flight results even if two changes use the same millisecond timestamp.
export function saveWatch(store, { watch, now, userCreated } = {}) {
  const input = validateWatchStore(store); epoch(now, '$.now');
  shape(watch, WATCH_KEYS, [], '$');
  shape(watch.schedule, ['interval_minutes', 'last_checked_at'], [], '$.schedule');
  const next = validateWatch({ ...watch, latest_result: null, schedule: { ...watch.schedule, last_checked_at: null } });
  if (userCreated !== true) bad('$.userCreated', 'explicit user save required');
  const old = input.watches.find(item => item.id === next.id);
  if (old && (now < old.updated_at || old.revision === Number.MAX_SAFE_INTEGER)) bad('$.now', 'cannot advance watch revision');
  if (!old && now < next.created_at) bad('$.now', 'precedes creation');
  const saved = validateWatch({ ...next, revision: old ? old.revision + 1 : 1, created_at: old?.created_at ?? next.created_at,
    updated_at: now, schedule: { interval_minutes: next.schedule.interval_minutes, last_checked_at: null }, latest_result: null });
  return validateWatchStore({ version: WATCH_STORE_VERSION, watches: old ? input.watches.map(item => item.id === saved.id ? saved : item) : [...input.watches, saved] });
}
export function removeWatch(store, id) {
  const input = validateWatchStore(store); checked(id, WATCH_ID, '$.id');
  return validateWatchStore({ version: WATCH_STORE_VERSION, watches: input.watches.filter(item => item.id !== id) });
}

function eligible(watch, { consentGranted, isPrivate, isBlocked }) {
  return watch.created_by === 'user' && watch.enabled && watch.consent && watch.observation !== 'none'
    && consentGranted === true && isPrivate === false && isBlocked === false;
}
export function effectiveWatchObservation(watch, host) {
  const input = validateWatch(watch), expected = new URL(input.url).hostname;
  if (typeof host !== 'string' || host.toLowerCase().replace(/\.$/u, '') !== expected.toLowerCase().replace(/\.$/u, '')) return 'none';
  if (input.observation === 'none' || input.observation === 'address') return input.observation;
  return isSensitiveHost(host).sensitive ? 'address' : input.observation;
}
// Hidden watch tabs do not impersonate foreground site-rule checkpoints.
// The caller owns timers and hidden-tab creation in the project's container.
export function nextWatchDueAt({ watch, now, consentGranted, isPrivate, isBlocked } = {}) {
  const input = validateWatch(watch); epoch(now, '$.now');
  if (!eligible(input, { consentGranted, isPrivate, isBlocked }) || now < input.updated_at) return null;
  const lastAt = input.schedule.last_checked_at;
  if (lastAt === null) return now;
  const due = lastAt + input.schedule.interval_minutes * 60000;
  if (!Number.isSafeInteger(due)) return null;
  return due;
}
export function watchCheckDue(options = {}) { const due = nextWatchDueAt(options); return due !== null && due <= options.now; }
export function markWatchChecked(watch, { now } = {}) {
  const input = validateWatch(watch); epoch(now, '$.now');
  if (now < input.updated_at) bad('$.now', 'clock moved backwards');
  return validateWatch({ ...input, updated_at: now, schedule: { ...input.schedule, last_checked_at: now } });
}
const clip = (s, max) => { const out = s.slice(0, max); return /[\ud800-\udbff]$/u.test(out) ? out.slice(0, -1) : out; };
const collapse = s => s.replace(/[\u0000-\u001f\u007f]/gu, ' ').replace(/\s+/gu, ' ').trim();
function outlineOf(value) {
  const out = [];
  for (const item of Array.isArray(value) ? value : []) {
    if (out.length === WATCH_LIMITS.outlineItems) break;
    if (!OUTLINE_KINDS.includes(item?.kind) || typeof item.text !== 'string') continue;
    const text = clip(collapse(item.text), WATCH_LIMITS.outlineText).trim();
    if (text) out.push({ id: `o${out.length + 1}`, kind: item.kind, text });
  }
  return out;
}
const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function screenOf(value) {
  shape(value, ['mime', 'width', 'height', 'data_base64'], [], '$.observation.screen');
  const data = value.data_base64;
  if (value.mime !== 'image/png' || !Number.isSafeInteger(value.width) || value.width < 1 || value.width > WATCH_LIMITS.imageSide
    || !Number.isSafeInteger(value.height) || value.height < 1 || value.height > WATCH_LIMITS.imageSide || typeof data !== 'string'
    || !data.length || data.length % 4 !== 0 || data.length > Math.ceil(WATCH_LIMITS.imageBytes / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/u.test(data)) bad('$.observation.screen', 'invalid image');
  const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0, size = data.length / 4 * 3 - padding;
  if (size < 33 || size > WATCH_LIMITS.imageBytes || (padding === 2 && (BASE64.indexOf(data.at(-3)) & 15) !== 0)
    || (padding === 1 && (BASE64.indexOf(data.at(-2)) & 3) !== 0)) bad('$.observation.screen', 'invalid image size or encoding');
  const bytes = [];
  for (let i = 0; i < 44; i += 4) {
    const bits = BASE64.indexOf(data[i]) * 262144 + BASE64.indexOf(data[i + 1]) * 4096
      + BASE64.indexOf(data[i + 2]) * 64 + BASE64.indexOf(data[i + 3]);
    bytes.push((bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
  }
  const signature = [137, 80, 78, 71, 13, 10, 26, 10], uint32 = at => bytes[at] * 16777216 + bytes[at + 1] * 65536 + bytes[at + 2] * 256 + bytes[at + 3];
  if (!signature.every((v, i) => bytes[i] === v) || uint32(8) !== 13 || [73, 72, 68, 82].some((v, i) => bytes[i + 12] !== v)
    || uint32(16) !== value.width || uint32(20) !== value.height) bad('$.observation.screen', 'PNG header does not match declared image');
  return { mime: 'image/png', width: value.width, height: value.height, data_base64: data };
}

export function buildWatchRequest({ watch, observation, requestId, now, timeoutMs = MAX_DEADLINE_MS,
  consentGranted, isPrivate, isBlocked, indicatorVisible } = {}) {
  const input = validateWatch(watch); epoch(now, '$.now');
  if (!eligible(input, { consentGranted, isPrivate, isBlocked }) || indicatorVisible !== true || now < input.updated_at) return null;
  checked(requestId, REQUEST_ID, '$.requestId');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_DEADLINE_MS || !Number.isSafeInteger(now + timeoutMs)) bad('$.timeoutMs', 'expected safe 1–30000');
  let url;
  try { url = sanitizeWatchUrl(observation?.url); } catch { return null; }
  if (url !== input.url) return null;
  const page = new URL(url), level = effectiveWatchObservation(input, page.hostname);
  if (level === 'none' || (level === 'screen' && input.provider !== 'openai')) return null;
  const obs = { level, address: { origin: page.origin, path: page.pathname, title: clip(collapse(typeof observation.title === 'string' ? observation.title : ''), WATCH_LIMITS.title).trim() } };
  if (level === 'outline' || (level === 'screen' && Array.isArray(observation.outline))) obs.outline = outlineOf(observation.outline);
  if (level === 'screen') obs.screen = screenOf(observation.screen);
  const state = { watch: { id: input.id, question: input.question, outcomes: input.outcomes.map(item => ({ ...item })) }, observation: obs };
  const cap = level === 'screen' ? WATCH_LIMITS.screenStateBytes : WATCH_LIMITS.stateBytes;
  while (obs.outline?.length && utf8Length(JSON.stringify(state)) > cap) obs.outline.pop();
  if (utf8Length(JSON.stringify(state)) > cap) bad('$.observation', 'state exceeds cap');
  return deepFreeze({ version: 1, request_id: requestId, choice_set: 'watch_v1', context_version: 'watch-1', provider: input.provider,
    deadline_ms: now + timeoutMs, state });
}

// The same budget object belongs to site-rule and watch checks. A rollback
// must not discard future calls and reopen the budget; the caller can clamp
// its passed clock or defer scheduling until that clock catches up.
export function prepareWatchCheck({ budget, hourlyLimit = DEFAULT_HOURLY_BUDGET, ...options } = {}) {
  const watch = validateWatch(options.watch); epoch(options.now, '$.now');
  shape(budget, ['calls'], [], '$.budget');
  if (!Array.isArray(budget.calls) || !budget.calls.every(at => Number.isSafeInteger(at) && at >= 0)) bad('$.budget.calls', 'expected epoch ms[]');
  const budgetCopy = deepFreeze({ calls: [...budget.calls] });
  if (!Number.isInteger(hourlyLimit) || hourlyLimit < 0 || hourlyLimit > DEFAULT_HOURLY_BUDGET) bad('$.hourlyLimit', 'expected 0–30');
  const idle = { request: null, watch, budget: budgetCopy, revision: null, started_at: null };
  if (!watchCheckDue({ ...options, watch }) || budget.calls.some(at => at > options.now)) return deepFreeze(idle);
  const request = buildWatchRequest({ ...options, watch });
  if (!request) return deepFreeze(idle);
  const taken = takeBudget(budgetCopy, { now: options.now, limit: hourlyLimit });
  const attempted = markWatchChecked(watch, { now: options.now });
  return deepFreeze({ request: taken.ok ? request : null, watch: attempted, budget: taken.budget,
    revision: taken.ok ? watch.revision : null, started_at: taken.ok ? options.now : null });
}

function sameRequestWatch(request, watch) {
  const state = request?.state, target = state?.watch, address = state?.observation?.address, page = new URL(watch.url);
  return request?.version === 1 && request.choice_set === 'watch_v1' && request.context_version === 'watch-1'
    && request.provider === watch.provider && target?.id === watch.id && target.question === watch.question
    && Array.isArray(target.outcomes) && target.outcomes.length === watch.outcomes.length
    && target.outcomes.every((item, i) => item.id === watch.outcomes[i].id && item.label === watch.outcomes[i].label)
    && address?.origin === page.origin && address.path === page.pathname
    && state.observation.level === effectiveWatchObservation(watch, page.hostname);
}
function resultOf(result, request, watch) {
  shape(result, ['version', 'request_id', 'choice_set', 'context_version', 'outcome', 'reason', 'data_sent',
    'authority', 'action_authorized', 'provider', 'confidence'], ['model', 'shape_status'], '$.result');
  if (result.version !== 1 || result.request_id !== request.request_id || result.choice_set !== 'watch_v1' || result.context_version !== 'watch-1'
    || result.authority !== 'suggestion_only' || result.action_authorized !== false
    || result.provider !== watch.provider) bad('$.result', 'mismatched result');
  if (Object.hasOwn(result, 'model') && result.model !== (result.provider === 'jev' ? 'jev-1.13.0' : 'gpt-6-luna')) bad('$.result.model', 'mismatched model');
  if ((result.provider === 'openai' && result.shape_status !== 'UNVERIFIED_SHAPE')
    || (result.provider === 'jev' && Object.hasOwn(result, 'shape_status'))) bad('$.result.shape_status', 'mismatched shape status');
  const reason = member(result.reason, WATCH_RESULT_REASONS, '$.result.reason'), conf = confidence(result.confidence, '$.result.confidence');
  const sent = flag(result.data_sent, '$.result.data_sent'), choice = member(result.outcome, ['unknown', ...watch.outcomes.map(item => item.id)], '$.result.outcome');
  if (reason === 'validated' && (conf === null || !sent)) bad('$.result', 'missing validated answer');
  if (reason !== 'validated' && (choice !== 'unknown' || conf !== null)) bad('$.result.outcome', 'non-neutral failure');
  if (reason === 'UNVERIFIED_SHAPE' && result.provider !== 'openai') bad('$.result.reason', 'mismatched unverified provider');
  return { request_id: result.request_id, outcome: reason === 'validated' && conf >= WATCH_LIMITS.confidence ? choice : 'unknown',
    reason, confidence: conf, data_sent: sent, provider: result.provider };
}
// Runtime must additionally bind its private hidden tab's container/document
// generation, cancel its old check, and pass the current eligibility flags.
// This core never makes changes to a page or grants action authority.
export function applyWatchResult({ watch, request, result, revision, startedAt, now,
  consentGranted, isPrivate, isBlocked, cancelled = false } = {}) {
  const input = validateWatch(watch); epoch(now, '$.now'); epoch(startedAt, '$.startedAt');
  if (!eligible(input, { consentGranted, isPrivate, isBlocked }) || cancelled !== false || input.revision !== revision
    || now < input.updated_at || startedAt > now || input.schedule.last_checked_at !== startedAt
    || input.latest_result?.checked_at >= startedAt || !sameRequestWatch(request, input)
    || !Number.isSafeInteger(request.deadline_ms) || request.deadline_ms <= now || request.deadline_ms - startedAt > MAX_DEADLINE_MS) return input;
  let applied;
  try { applied = resultOf(result, request, input); } catch { return input; }
  return validateWatch({ ...input, updated_at: now, latest_result: { ...applied, checked_at: now } });
}
