/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ContextsError, DEFAULT_LEDGER, localDay, recordForeground, usageFor, prune, summarize, exportLedger, clearLedger, validateLedger } from '../src/index.mjs';
import { UUID_A, UUID_B } from './samples.mjs';

const bad = fn => assert.throws(fn, e => e instanceof ContextsError && ['INVALID_INPUT', 'INVALID_LEDGER'].includes(e.code));
const build = entries => entries.reduce((l, [day, host, contextUuid, ms]) => recordForeground(l, { day, host, contextUuid, ms }), DEFAULT_LEDGER);

test('localDay formats and validates calendar dates', () => {
  assert.equal(localDay({ year: 2026, month: 9, day: 7 }), '2026-09-07');
  assert.equal(localDay({ year: 2028, month: 2, day: 29 }), '2028-02-29');
  for (const d of [{ year: 2026, month: 2, day: 29 }, { year: 2026, month: 0, day: 1 }, { year: 2026, month: 13, day: 1 }, { year: 2026, month: 4, day: 31 }, { year: 2026.5, month: 1, day: 1 }, {}]) bad(() => localDay(d));
});

test('recordForeground merges per (day, host, context) and clamps to 24 h', () => {
  let l = recordForeground(DEFAULT_LEDGER, { day: '2026-09-27', host: 'X.com', contextUuid: UUID_A, ms: 1500.4 });
  assert.deepEqual(l.records, [{ day: '2026-09-27', host: 'x.com', context_uuid: UUID_A, foreground_ms: 1500 }]);
  l = recordForeground(l, { day: '2026-09-27', host: 'x.com', contextUuid: UUID_A, ms: 500 });
  l = recordForeground(l, { day: '2026-09-27', host: 'x.com', ms: 7 });
  assert.deepEqual(l.records.map(r => [r.context_uuid, r.foreground_ms]), [[UUID_A, 2000], [null, 7]]);
  l = recordForeground(l, { day: '2026-09-27', host: 'x.com', contextUuid: UUID_A, ms: 90000000 });
  assert.equal(l.records[0].foreground_ms, 86400000);
  assert.deepEqual(recordForeground(l, { day: '2026-09-27', host: 'x.com', ms: 0 }), l, 'zero is a no-op');
  assert.ok(Object.isFrozen(l.records) && Object.isFrozen(l.records[0]));
  assert.equal(DEFAULT_LEDGER.records.length, 0, 'input not mutated');
  for (const args of [{ day: '2026-02-30', host: 'x.com', ms: 1 }, { day: '2026-09-27', host: 'x.com:443', ms: 1 }, { day: '2026-09-27', host: 'x.com', ms: -1 },
    { day: '2026-09-27', host: 'x.com', ms: Infinity }, { day: '2026-09-27', host: 'x.com', contextUuid: 'nope', ms: 1 }, { day: '2026-09-27', host: 'x.com/p', ms: 1 }]) {
    bad(() => recordForeground(DEFAULT_LEDGER, args));
  }
  bad(() => recordForeground({ version: 1, retention_days: 90, records: [{ day: 'x' }] }, { day: '2026-09-27', host: 'x.com', ms: 1 }));
});

test('usageFor is pattern-aware and context-selective', () => {
  const l = build([['2026-09-27', 'x.com', UUID_A, 1000], ['2026-09-27', 'm.x.com', UUID_A, 200], ['2026-09-27', 'x.com', UUID_B, 30],
    ['2026-09-27', 'x.com', null, 4], ['2026-09-26', 'x.com', UUID_A, 99999], ['2026-09-27', 'y.com', UUID_A, 5000]]);
  const day = '2026-09-27';
  assert.equal(usageFor(l, { day, hosts: ['x.com'] }), 1034);
  assert.equal(usageFor(l, { day, hosts: ['x.com', '*.x.com'] }), 1234);
  assert.equal(usageFor(l, { day, hosts: ['*.x.com'] }), 200);
  assert.equal(usageFor(l, { day, hosts: ['x.com', '*.x.com'], contextUuid: UUID_A }), 1200);
  assert.equal(usageFor(l, { day, hosts: ['x.com'], contextUuid: null }), 4);
  assert.equal(usageFor(l, { day, hosts: ['x.com', 'x.com'] }), 1034, 'a record counts once');
  assert.equal(usageFor(l, { day, hosts: [] }), 0);
  bad(() => usageFor(l, { day: 'today', hosts: [] }));
  bad(() => usageFor(l, { day }));
});

test('prune keeps retention_days days including today', () => {
  const l = build([['2026-06-29', 'old.com', null, 1], ['2026-06-30', 'edge.com', null, 1], ['2026-09-27', 'today.com', null, 1], ['2026-09-28', 'future.com', null, 1]]);
  assert.deepEqual(prune(l, { today: '2026-09-27' }).records.map(r => r.host), ['edge.com', 'today.com', 'future.com']);
  assert.deepEqual(prune({ ...l, retention_days: 1 }, { today: '2026-09-27' }).records.map(r => r.host), ['today.com', 'future.com']);
  assert.deepEqual(prune(l, { today: '2026-10-01' }).records.map(r => r.host), ['today.com', 'future.com']);
  assert.deepEqual(prune(l, { today: '2027-01-01' }).records, []);
  bad(() => prune(l, {}));
});

test('summarize groups by host and context over a day window', () => {
  const l = build([['2026-09-27', 'x.com', UUID_A, 100], ['2026-09-26', 'x.com', UUID_A, 50], ['2026-09-21', 'x.com', UUID_A, 7], ['2026-09-20', 'x.com', UUID_A, 1000],
    ['2026-09-27', 'y.com', null, 150], ['2026-09-27', 'a.com', null, 150]]);
  const s = summarize(l, { today: '2026-09-27', days: 7 });
  assert.deepEqual(s, [
    { host: 'x.com', context_uuid: UUID_A, total_ms: 157, by_day: { '2026-09-21': 7, '2026-09-26': 50, '2026-09-27': 100 } },
    { host: 'a.com', context_uuid: null, total_ms: 150, by_day: { '2026-09-27': 150 } },
    { host: 'y.com', context_uuid: null, total_ms: 150, by_day: { '2026-09-27': 150 } },
  ]);
  assert.ok(Object.isFrozen(s[0].by_day));
  assert.equal(summarize(l, { today: '2026-09-27', days: 1 }).length, 3);
  assert.deepEqual(summarize(DEFAULT_LEDGER, { today: '2026-09-27' }), []);
  bad(() => summarize(l, { today: '2026-09-27', days: 0 }));
});

test('export is stable JSON that validates; clear returns the default', () => {
  const a = build([['2026-09-27', 'y.com', null, 1], ['2026-09-26', 'x.com', UUID_A, 2]]);
  const b = build([['2026-09-26', 'x.com', UUID_A, 2], ['2026-09-27', 'y.com', null, 1]]);
  assert.equal(exportLedger(a), exportLedger(b));
  const parsed = JSON.parse(exportLedger(a));
  assert.deepEqual(validateLedger(parsed).records.map(r => r.host), ['x.com', 'y.com']);
  assert.ok(exportLedger(a).endsWith('}\n'));
  assert.equal(clearLedger(), DEFAULT_LEDGER);
  assert.deepEqual(clearLedger(), { version: 1, retention_days: 90, records: [] });
});
