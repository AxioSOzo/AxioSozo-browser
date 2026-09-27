/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { DEFAULT_LEDGER, daysInMonth, deepFreeze, isCalendarDay, ledgerKey, validateLedger, validateLedgerRecord } from './schema.mjs';
import { hostMatches } from './rules.mjs';

// Usage ledger: local foreground time per host, per context, per local day.
// Never uploaded; private windows are never recorded (the caller's duty).

const DAY_MS = 86400000;
const bad = (path, message) => { throw new ContextsError('INVALID_INPUT', `${path}: ${message}`, path); };
const dayNumber = day => { const [y, m, d] = day.split('-').map(Number); return Date.UTC(y, m - 1, d) / DAY_MS; };
const requireDay = (day, path) => { if (!isCalendarDay(day)) bad(path, 'expected YYYY-MM-DD'); return day; };
const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;

export function localDay({ year, month, day } = {}) {
  if (!Number.isInteger(year) || year < 0 || year > 9999 || !Number.isInteger(month) || month < 1 || month > 12 ||
    !Number.isInteger(day) || day < 1 || day > daysInMonth(year, month)) bad('$', 'expected a calendar date');
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Adds foreground time to the (day, host, context) record, clamped to 24 h.
export function recordForeground(ledger, { day, host, contextUuid = null, ms } = {}) {
  const l = validateLedger(ledger);
  if (!Number.isFinite(ms) || ms < 0) bad('$.ms', 'expected a non-negative number');
  const add = Math.round(ms);
  const record = validateLedgerRecord({
    day: requireDay(day, '$.day'),
    host: typeof host === 'string' ? host.replace(/[A-Z]/g, c => c.toLowerCase()).replace(/\.$/, '') : host,
    context_uuid: contextUuid, foreground_ms: Math.min(add, DAY_MS),
  });
  if (add === 0) return l;
  const key = ledgerKey(record);
  const index = l.records.findIndex(r => ledgerKey(r) === key);
  const records = [...l.records];
  if (index < 0) records.push(record);
  else records[index] = validateLedgerRecord({ ...records[index], foreground_ms: Math.min(DAY_MS, records[index].foreground_ms + add) });
  return validateLedger({ ...l, records });
}

// Sum for one day over host patterns ("*.x.com" aware). contextUuid undefined
// sums every context; null selects records made outside any workspace.
export function usageFor(ledger, { day, hosts, contextUuid } = {}) {
  const l = validateLedger(ledger);
  requireDay(day, '$.day');
  if (!Array.isArray(hosts)) bad('$.hosts', 'expected host patterns');
  return l.records.reduce((sum, r) => r.day === day && (contextUuid === undefined || r.context_uuid === contextUuid) && hosts.some(p => hostMatches(p, r.host)) ? sum + r.foreground_ms : sum, 0);
}

// Keeps the last `retention_days` days including today (and any future-dated records).
export function prune(ledger, { today } = {}) {
  const l = validateLedger(ledger);
  const cutoff = dayNumber(requireDay(today, '$.today')) - l.retention_days;
  return validateLedger({ ...l, records: l.records.filter(r => dayNumber(r.day) > cutoff) });
}

// Totals over the last `days` days (today included), grouped by host and context,
// largest first. by_day maps "YYYY-MM-DD" → ms in ascending day order.
export function summarize(ledger, { today, days = 7 } = {}) {
  const l = validateLedger(ledger);
  if (!Number.isInteger(days) || days < 1 || days > 365) bad('$.days', 'expected 1–365');
  const end = dayNumber(requireDay(today, '$.today')), start = end - days + 1;
  const groups = new Map();
  for (const r of l.records) {
    const n = dayNumber(r.day);
    if (n < start || n > end) continue;
    const key = `${r.host}\u0000${r.context_uuid ?? ''}`;
    const g = groups.get(key) ?? { host: r.host, context_uuid: r.context_uuid, total_ms: 0, by_day: {} };
    g.total_ms += r.foreground_ms;
    g.by_day[r.day] = (g.by_day[r.day] ?? 0) + r.foreground_ms;
    groups.set(key, g);
  }
  const out = [...groups.values()].map(g => ({ ...g, by_day: Object.fromEntries(Object.entries(g.by_day).sort(([a], [b]) => cmp(a, b))) }));
  out.sort((a, b) => b.total_ms - a.total_ms || cmp(a.host, b.host) || cmp(a.context_uuid ?? '', b.context_uuid ?? ''));
  return deepFreeze(out);
}

// Stable JSON export: records sorted by day, host, context.
export function exportLedger(ledger) {
  const l = validateLedger(ledger);
  const records = [...l.records].sort((a, b) => cmp(a.day, b.day) || cmp(a.host, b.host) || cmp(a.context_uuid ?? '', b.context_uuid ?? ''));
  return `${JSON.stringify({ version: 1, retention_days: l.retention_days, records: records.map(r => ({ day: r.day, host: r.host, context_uuid: r.context_uuid, foreground_ms: r.foreground_ms })) }, null, 2)}\n`;
}

export const clearLedger = () => DEFAULT_LEDGER;
