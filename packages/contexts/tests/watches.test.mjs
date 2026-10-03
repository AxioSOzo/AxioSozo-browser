/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ContextsError } from '../src/errors.mjs';
import { utf8Length } from '../src/schema.mjs';
import { createBudget, takeBudget, nextCheckpoint } from '../src/checkpoints.mjs';
import { DecisionProvider, validateWatchRequest } from '../../provider-host/src/decision.mjs';
import { DEFAULT_WATCH_STORE, WATCH_STORE_VERSION, WATCH_LIMITS, WATCH_OBSERVATIONS, sanitizeWatchUrl,
  validateWatch, validateWatchStore, createWatch, saveWatch, removeWatch, effectiveWatchObservation,
  nextWatchDueAt, watchCheckDue, markWatchChecked, buildWatchRequest, prepareWatchCheck, applyWatchResult } from '../src/watches.mjs';

const NOW = 1790000000000;
const ALLOWED = Object.freeze({ consentGranted: true, isPrivate: false, isBlocked: false, indicatorVisible: true });
const choices = () => [{ id: 'finished', label: 'Finished' }, { id: 'running', label: 'Running' }];
const watch = (overrides = {}) => createWatch({ id: 'w_build', projectId: 'p_harbor', url: 'https://fixture.example/build',
  question: 'Has the synthetic build finished?', outcomes: choices(), now: NOW, userCreated: true, consent: true,
  observation: 'address', ...overrides });
const observation = (overrides = {}) => ({ url: 'https://fixture.example/build', title: 'Synthetic build', ...overrides });
const request = (w = watch(), extra = {}) => buildWatchRequest({ watch: w, observation: observation(), requestId: 'watch_1', now: NOW,
  ...ALLOWED, ...extra });
const attempt = (w = watch(), extra = {}) => prepareWatchCheck({ watch: w, observation: observation(), requestId: 'watch_1', now: NOW,
  budget: createBudget(), ...ALLOWED, ...extra });
const reply = (r, overrides = {}) => ({ version: 1, request_id: r.request_id, choice_set: 'watch_v1', context_version: 'watch-1',
  outcome: 'finished', reason: 'validated', data_sent: true, authority: 'suggestion_only', action_authorized: false,
  provider: r.provider, confidence: 0.9, ...(r.provider === 'openai' ? { shape_status: 'UNVERIFIED_SHAPE' } : {}), model: r.provider === 'jev' ? 'jev-1.13.0' : 'gpt-6-luna', ...overrides });
const apply = (a, overrides = {}) => applyWatchResult({ watch: a.watch, request: a.request, result: reply(a.request), revision: a.revision,
  startedAt: a.started_at, now: NOW + 100, ...ALLOWED, ...overrides });
const bad = (fn, path) => assert.throws(fn, e => e instanceof ContextsError && e.code.startsWith('INVALID_') && (!path || e.path === path));
const clone = value => JSON.parse(JSON.stringify(value));
function png({ width = 1, height = 1, bytes = 33 } = {}) {
  const data = Buffer.alloc(bytes);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(data);
  data.writeUInt32BE(13, 8); data.write('IHDR', 12); data.writeUInt32BE(width, 16); data.writeUInt32BE(height, 20);
  return { mime: 'image/png', width, height, data_base64: data.toString('base64') };
}

test('strict frozen v1 watch store; explicit user creation and safe defaults', () => {
  assert.equal(WATCH_STORE_VERSION, 1);
  assert.deepEqual(WATCH_OBSERVATIONS, ['none', 'address', 'outline', 'screen']);
  assert.deepEqual(validateWatchStore(DEFAULT_WATCH_STORE), { version: 1, watches: [] });
  const w = createWatch({ id: 'w_build', projectId: 'p_harbor', url: 'https://fixture.example/build', question: 'Ready?',
    outcomes: choices(), now: NOW, userCreated: true });
  assert.equal(w.consent, false); assert.equal(w.observation, 'none'); assert.equal(w.provider, 'jev');
  assert.equal(w.schedule.interval_minutes, 5); assert.equal(w.schedule.last_checked_at, null); assert.equal(w.latest_result, null);
  assert.equal(w.created_by, 'user'); assert.equal(w.revision, 1);
  for (const value of [w, w.outcomes, w.outcomes[0], w.schedule, validateWatchStore({ version: 1, watches: [w] }).watches]) assert(Object.isFrozen(value));
  bad(() => watch({ userCreated: false }), '$.userCreated'); bad(() => watch({ userCreated: undefined }), '$.userCreated');
});

test('watch URL sanitization strips credentials/query/fragment before storage or wire use', () => {
  const raw = 'https://synthetic-user:synthetic-pass@FIXTURE.example:443/build?synthetic-token=abc#private';
  assert.equal(sanitizeWatchUrl(raw), 'https://fixture.example/build');
  assert.equal(watch({ url: raw }).url, 'https://fixture.example/build');
  const r = request(watch({ url: raw }), { observation: observation({ url: raw }) });
  assert.deepEqual(r.state.observation.address, { origin: 'https://fixture.example', path: '/build', title: 'Synthetic build' });
  assert(!JSON.stringify(r).includes('synthetic-token')); assert(!JSON.stringify(r).includes('synthetic-pass'));
  for (const url of ['file:///tmp/fixture', 'about:blank', 'javascript:fake()', '/relative', 'https://fixture.example/bad\npath',
    'https://fixture.example/a b', 'https://fixture.example/' + 'x'.repeat(2049)]) bad(() => sanitizeWatchUrl(url), '$.url');
  assert.equal(sanitizeWatchUrl('http://localhost:4173/build?a=1'), 'http://localhost:4173/build');
  assert.equal(sanitizeWatchUrl('http://[::1]:4173/build#a'), 'http://[::1]:4173/build');
});

test('unknown record and nested keys, provenance, ids, outcome constraints, and caps are rejected', () => {
  const edits = [
    w => { w.extra = true; }, w => { w.created_by = 'agent'; }, w => { w.version = 2; }, w => { w.id = 'watch-1'; },
    w => { w.project_id = 'bad'; }, w => { w.revision = 0; }, w => { w.question = ''; }, w => { w.question = 'q'.repeat(501); },
    w => { w.question = 'Ready?\n'; }, w => { w.outcomes = [w.outcomes[0]]; },
    w => { w.outcomes = Array.from({ length: 7 }, (_, i) => ({ id: `c${i}`, label: 'x' })); },
    w => { w.outcomes[0].id = 'unknown'; }, w => { w.outcomes[1].id = w.outcomes[0].id; },
    w => { w.outcomes[0].id = 'A'; }, w => { w.outcomes[0].label = ''; }, w => { w.outcomes[0].label = 'x'.repeat(81); },
    w => { w.outcomes[0].label = 'a\tb'; }, w => { w.outcomes[0].selector = '#fixture'; },
    w => { w.schedule.extra = true; }, w => { w.schedule.interval_minutes = 0; }, w => { w.schedule.interval_minutes = 31; },
    w => { w.consent = 1; }, w => { w.enabled = 'yes'; }, w => { w.observation = 'full'; }, w => { w.provider = 'other'; },
    w => { w.updated_at = NOW - 1; }, w => { w.created_at = -1; }, w => { w.schedule.last_checked_at = NOW + 1; },
  ];
  for (const edit of edits) { const w = clone(watch()); edit(w); bad(() => validateWatch(w)); }
  assert.doesNotThrow(() => watch({ question: '😀'.repeat(250), outcomes: Array.from({ length: 6 }, (_, i) => ({ id: `c${i}`, label: '😀'.repeat(40) })) }));
  bad(() => watch({ question: '😀'.repeat(251) }));
  bad(() => validateWatchStore({ version: 1, watches: [watch(), watch()] }));
  bad(() => validateWatchStore({ version: 1, watches: [], extra: true }));
  bad(() => validateWatchStore({ version: 2, watches: [] }));
  bad(() => validateWatchStore({ version: 1, watches: Array.from({ length: 257 }, (_, i) => watch({ id: `w_ab${i.toString().padStart(4, '0')}` })) }));
});

test('store saves require user action, advance revision even at equal timestamps and clear old results', () => {
  const w = watch(); let store = saveWatch(DEFAULT_WATCH_STORE, { watch: w, now: NOW, userCreated: true });
  assert.equal(store.watches[0].revision, 1);
  const a = attempt(store.watches[0]); const result = apply(a);
  store = validateWatchStore({ version: 1, watches: [result] });
  const changed = { ...result, question: 'Is the next synthetic build finished?' };
  store = saveWatch(store, { watch: changed, now: NOW + 100, userCreated: true });
  assert.equal(store.watches[0].revision, 2); assert.equal(store.watches[0].latest_result, null);
  assert.equal(store.watches[0].schedule.last_checked_at, null); assert.equal(store.watches[0].created_at, NOW);
  store = saveWatch(store, { watch: store.watches[0], now: NOW + 100, userCreated: true });
  assert.equal(store.watches[0].revision, 3);
  bad(() => saveWatch(store, { watch: w, now: NOW + 99, userCreated: true }));
  bad(() => saveWatch(store, { watch: w, now: NOW + 200 }));
  assert.deepEqual(removeWatch(store, w.id), DEFAULT_WATCH_STORE);
  assert.deepEqual(removeWatch(store, 'w_other'), store);
});

test('a watch has deterministic hidden-tab scheduling without weakening the foreground site-rule gate', () => {
  const w = watch(); assert.equal(nextWatchDueAt({ watch: w, now: NOW, ...ALLOWED }), NOW);
  assert.equal(watchCheckDue({ watch: w, now: NOW, ...ALLOWED }), true);
  assert.equal(nextCheckpoint({ now: NOW, foreground: false, isPrivate: false }), false);
  const checked = markWatchChecked(w, { now: NOW });
  assert.equal(nextWatchDueAt({ watch: checked, now: NOW, ...ALLOWED }), NOW + 300000);
  assert.equal(watchCheckDue({ watch: checked, now: NOW + 299999, ...ALLOWED }), false);
  assert.equal(watchCheckDue({ watch: checked, now: NOW + 300000, ...ALLOWED }), true);
  assert.equal(nextWatchDueAt({ watch: checked, now: NOW - 1, ...ALLOWED }), null);
  bad(() => markWatchChecked(checked, { now: NOW - 1 }), '$.now');
  bad(() => nextWatchDueAt({ watch: w, ...ALLOWED }), '$.now');
  const near = watch({ now: Number.MAX_SAFE_INTEGER, intervalMinutes: 30 });
  assert.equal(nextWatchDueAt({ watch: markWatchChecked(near, { now: Number.MAX_SAFE_INTEGER }), now: Number.MAX_SAFE_INTEGER, ...ALLOWED }), null);
});

test('missing/live revoked consent, private/blocked/unknown eligibility, disabled observation and indicator never produce a request', () => {
  const disabled = [watch({ consent: false }), watch({ observation: 'none' }), watch({ enabled: false })];
  for (const w of disabled) { assert.equal(request(w), null); assert.equal(watchCheckDue({ watch: w, now: NOW, ...ALLOWED }), false); }
  for (const flags of [{ consentGranted: false }, { consentGranted: undefined }, { isPrivate: true }, { isPrivate: undefined },
    { isBlocked: true }, { isBlocked: undefined }, { indicatorVisible: false }, { indicatorVisible: undefined }]) {
    assert.equal(request(watch(), flags), null);
    const a = attempt(watch(), flags); assert.equal(a.request, null); assert.deepEqual(a.budget.calls, []); assert.equal(a.watch.schedule.last_checked_at, null);
  }
  assert.equal(buildWatchRequest({ watch: watch(), now: NOW }), null);
});

test('address requests match the watched page, are frozen, and conform to provider-host watch-1', () => {
  const r = request(); assert.deepEqual(r.state.watch, { id: 'w_build', question: 'Has the synthetic build finished?', outcomes: choices() });
  assert.equal(r.choice_set, 'watch_v1'); assert.equal(r.context_version, 'watch-1'); assert.equal(r.deadline_ms, NOW + 30000);
  for (const item of [r, r.state, r.state.watch, r.state.watch.outcomes, r.state.observation.address]) assert(Object.isFrozen(item));
  assert.doesNotThrow(() => validateWatchRequest(r, NOW));
  for (const url of ['https://other.example/build', 'https://fixture.example/other', 'about:blank']) assert.equal(request(watch(), { observation: observation({ url }) }), null);
  assert.equal(request(watch(), { observation: observation({ url: 'https://fixture.example/build?q=discard#discard' }) }).state.observation.address.path, '/build');
  bad(() => request(watch(), { requestId: 'bad id' }), '$.requestId'); bad(() => request(watch(), { timeoutMs: 30001 }), '$.timeoutMs');
  bad(() => request(watch(), { now: Number.MAX_SAFE_INTEGER }), '$.timeoutMs');
});

test('outline normalization assigns opaque ids, strips controls, caps units and keeps state under 64 KiB', () => {
  const raw = [{ id: 'page-dom-id', kind: 'heading', text: ' A\n\t B ' }, { kind: 'input', text: 'synthetic-secret' },
    { kind: 'link', text: 'x'.repeat(199) + '😀' }, { kind: 'label', text: '\u0000\u007f  C ' }, { kind: 'heading', text: '   ' },
    ...Array.from({ length: 300 }, () => ({ kind: 'heading', text: '😀'.repeat(100) }))];
  const r = request(watch({ observation: 'outline' }), { observation: observation({ title: ' T\n '.repeat(300), outline: raw }) });
  const obs = r.state.observation;
  assert.deepEqual(obs.outline[0], { id: 'o1', kind: 'heading', text: 'A B' });
  assert.equal(obs.outline[1].text, 'x'.repeat(199)); assert.equal(obs.outline[2].text, 'C');
  assert(obs.outline.length <= 200); assert(obs.address.title.length <= 256); assert(utf8Length(JSON.stringify(r.state)) <= 65536);
  assert(!JSON.stringify(r).includes('page-dom-id')); assert(!JSON.stringify(r).includes('synthetic-secret'));
  assert.doesNotThrow(() => validateWatchRequest(r, NOW));
});

test('sensitive outlines and screens cap to address and drop payload even when image input is invalid', () => {
  for (const host of ['example.bank', 'login.gov', 'accounts.google.com', 'sub.ing.nl', 'nhs.uk', '1password.com']) {
    for (const level of ['outline', 'screen']) {
      const w = watch({ url: `https://${host}/build`, observation: level, provider: 'openai' });
      assert.equal(effectiveWatchObservation(w, host.toUpperCase()), 'address');
      const r = request(w, { observation: observation({ url: w.url, outline: [{ kind: 'heading', text: 'excluded' }], screen: 'invalid image never inspected' }) });
      assert.equal(r.state.observation.level, 'address'); assert.deepEqual(Object.keys(r.state.observation), ['level', 'address']);
      assert.doesNotThrow(() => validateWatchRequest(r, NOW));
    }
  }
  assert.equal(effectiveWatchObservation(watch({ observation: 'screen' }), 'other.example'), 'none');
});

test('screen requests require image-capable provider, strict PNG dimensions, caps and canonical base64', () => {
  const image = png(), w = watch({ observation: 'screen', provider: 'openai' });
  const r = request(w, { observation: observation({ screen: image, outline: [{ kind: 'heading', text: 'Build' }] }) });
  assert.equal(r.state.observation.screen.data_base64, image.data_base64); assert.equal(r.state.observation.level, 'screen');
  assert.doesNotThrow(() => validateWatchRequest(r, NOW));
  assert.equal(request(watch({ observation: 'screen' }), { observation: observation({ screen: image }) }), null);
  const invalid = [{ ...image, extra: true }, { ...image, mime: 'image/jpeg' }, { ...image, width: 1281 }, { ...image, height: 0 },
    { ...image, width: 2 }, { ...image, data_base64: image.data_base64.slice(1) }, { ...image, data_base64: '!!!!' },
    { ...image, data_base64: Buffer.alloc(33).toString('base64') }, png({ bytes: 1048577 })];
  for (const screen of invalid) bad(() => request(w, { observation: observation({ screen }) }));
  assert.doesNotThrow(() => validateWatchRequest(request(w, { observation: observation({ screen: png({ width: 1280, height: 1280 }) }) }), NOW));
  const atCap = request(w, { observation: observation({ screen: png({ bytes: WATCH_LIMITS.imageBytes }),
    outline: Array.from({ length: 200 }, () => ({ kind: 'heading', text: '😀'.repeat(100) })) }) });
  assert(utf8Length(JSON.stringify(atCap.state)) <= WATCH_LIMITS.screenStateBytes);
  assert.doesNotThrow(() => validateWatchRequest(atCap, NOW));
});

test('watch checks reserve the shared rolling-hour budget once and advance schedule even if exhausted', () => {
  let budget = createBudget();
  for (let i = 0; i < 29; i++) budget = takeBudget(budget, { now: NOW + i }).budget;
  const a = attempt(watch(), { now: NOW + 30, budget });
  assert(a.request); assert.equal(a.budget.calls.length, 30); assert.equal(a.watch.schedule.last_checked_at, NOW + 30);
  assert.equal(takeBudget(a.budget, { now: NOW + 31 }).ok, false);
  const b = attempt(watch({ id: 'w_next1' }), { now: NOW + 31, budget: a.budget });
  assert.equal(b.request, null); assert.equal(b.budget.calls.length, 30); assert.equal(b.watch.schedule.last_checked_at, NOW + 31);
  assert.equal(b.revision, null); assert.equal(b.started_at, null);
  assert.equal(attempt(a.watch, { now: NOW + 31, budget: a.budget }).request, null);
  assert.equal(attempt(watch(), { hourlyLimit: 0 }).request, null);
  assert.equal(prepareWatchCheck({ watch: watch(), observation: observation(), requestId: 'watch_1', now: NOW + 3600031,
    budget: a.budget, ...ALLOWED }).budget.calls.length, 1);
});

test('clock rollback cannot discard future shared-budget calls and reopen watch sending', () => {
  const future = deepFrozenBudget([NOW + 1000]);
  const a = attempt(watch(), { budget: future }); assert.equal(a.request, null); assert.deepEqual(a.budget.calls, [NOW + 1000]);
  assert.equal(a.watch.schedule.last_checked_at, null);
  bad(() => attempt(watch(), { budget: { calls: [-1] } })); bad(() => attempt(watch(), { budget: { calls: [], extra: true } }));
  bad(() => attempt(watch(), { hourlyLimit: 31 }));
});
function deepFrozenBudget(calls) { return Object.freeze({ calls: Object.freeze(calls) }); }

test('bounded current validated results store only scalar metadata and never observation/image payloads', () => {
  const a = attempt(); const current = apply(a);
  assert.equal(current.latest_result.outcome, 'finished'); assert.equal(current.latest_result.checked_at, NOW + 100);
  assert.equal(current.latest_result.confidence, 0.9); assert.equal(current.latest_result.data_sent, true);
  assert.deepEqual(Object.keys(current.latest_result), ['request_id', 'checked_at', 'outcome', 'reason', 'confidence', 'data_sent', 'provider']);
  assert(!JSON.stringify(current).includes('Synthetic build')); assert(Object.isFrozen(current.latest_result));
  assert.equal(current.revision, a.watch.revision);
  assert.deepEqual(validateWatchStore({ version: 1, watches: [current] }).watches[0], current);
});

test('low confidence becomes unknown and every failure remains a non-authorizing status', () => {
  const a = attempt();
  assert.equal(apply(a, { result: reply(a.request, { confidence: 0.79 }) }).latest_result.outcome, 'unknown');
  for (const reason of ['NOT_AUTHORIZED', 'disabled', 'timeout', 'cancelled', 'IMAGE_UNSUPPORTED', 'HOST_UNAVAILABLE']) {
    const current = apply(a, { result: reply(a.request, { outcome: 'unknown', reason, confidence: null, data_sent: false }) });
    assert.equal(current.latest_result.outcome, 'unknown'); assert.equal(current.latest_result.data_sent, false); assert.equal(current.latest_result.reason, reason);
  }
});

test('malformed, mismatched, invented and authority-bearing replies cannot update a watch', () => {
  const a = attempt();
  const edits = [{ extra: true }, { version: 2 }, { request_id: 'wrong' }, { choice_set: 'site_rule_v1' }, { context_version: 'watch-2' },
    { provider: 'openai' }, { model: 'other' }, { shape_status: 'other' }, { reason_code: 'drift' }, { reason_code: null }, { shape_status: 'UNVERIFIED_SHAPE' }, { outcome: 'deleted' },
    { reason: 'timeout' }, { confidence: null }, { confidence: NaN }, { confidence: Infinity }, { confidence: 1.1 }, { data_sent: false },
    { authority: 'action' }, { action_authorized: true }];
  for (const edit of edits) assert.deepEqual(apply(a, { result: reply(a.request, edit) }), a.watch);
  assert.deepEqual(apply(a, { result: null }), a.watch);
});

test('revoked consent/private/blocked/disabled/cancelled context drops delayed answers', () => {
  const a = attempt();
  for (const flags of [{ consentGranted: false }, { consentGranted: undefined }, { isPrivate: true }, { isPrivate: undefined },
    { isBlocked: true }, { isBlocked: undefined }, { cancelled: true }]) assert.deepEqual(apply(a, flags), a.watch);
  for (const patch of [{ consent: false }, { enabled: false }, { observation: 'none' }]) {
    const current = validateWatch({ ...a.watch, ...patch }); assert.deepEqual(apply(a, { watch: current }), current);
  }
});

test('revision, page, outcome edits, stale/duplicate attempts and expired deadlines drop delayed answers', () => {
  const a = attempt(), first = apply(a);
  assert.deepEqual(apply(a, { watch: first, now: NOW + 200 }), first);
  assert.deepEqual(apply(a, { revision: a.revision + 1 }), a.watch);
  assert.deepEqual(apply(a, { startedAt: NOW + 1 }), a.watch);
  assert.deepEqual(apply(a, { now: a.request.deadline_ms }), a.watch);
  assert.deepEqual(apply(a, { now: NOW - 1 }), a.watch);
  const edited = saveWatch({ version: 1, watches: [a.watch] }, { watch: a.watch, now: NOW, userCreated: true }).watches[0];
  assert.deepEqual(apply(a, { watch: edited }), edited);
  for (const patch of [{ url: 'https://fixture.example/changed' }, { question: 'Another question?' }, { provider: 'openai' },
    { outcomes: [{ id: 'finished', label: 'A new meaning' }, choices()[1]] }]) {
    const w = validateWatch({ ...a.watch, ...patch }); assert.deepEqual(apply(a, { watch: w }), w);
  }
  const forged = clone(a.request); forged.state.observation.address.path = '/changed';
  assert.deepEqual(apply(a, { request: forged }), a.watch);
  const next = markWatchChecked(a.watch, { now: NOW + 300000 });
  assert.deepEqual(apply(a, { watch: next, now: NOW + 300100 }), next);
});

test('latest result validators refuse payload expansion and unproven positive statuses', () => {
  const current = apply(attempt());
  for (const patch of [{ outline: [] }, { checked_at: NOW - 1 }, { checked_at: NOW + 101 }, { outcome: 'invented' },
    { confidence: 0.79 }, { reason: 'timeout' }, { data_sent: false }, { provider: 'other' }]) {
    bad(() => validateWatch({ ...current, latest_result: { ...current.latest_result, ...patch } }));
  }
});

test('watch source contains only relative imports and no Node, DOM, network, timers or ambient time', async () => {
  const source = await readFile(new URL('../src/watches.mjs', import.meta.url), 'utf8');
  for (const forbidden of [/['"]node:/u, /\bBuffer\b/u, /\bprocess\s*[.[]/u, /\bfetch\s*\(/u,
    /\b(?:setTimeout|setInterval|queueMicrotask|requestAnimationFrame)\s*\(/u, /\bDate\s*\.\s*now/u,
    /\bnew\s+Date\b/u, /\bMath\s*\.\s*random/u, /\b(?:window|document|navigator)\s*[.[]/u,
    /\b(?:Services|ChromeUtils|IOUtils|PathUtils|Components)\s*[.[]/u, /\bglobalThis\b/u]) assert(!forbidden.test(source), forbidden.toString());
  for (const match of source.matchAll(/\bfrom\s*['"]([^'"]+)['"]/gu)) assert.match(match[1], /^\.\/[a-z-]+\.mjs$/u);
});


test('actual DecisionProvider fixture results apply without inventing fields or sending real network/key reads', async () => {
  let calls = 0;
  const fake = new DecisionProvider({ now: () => NOW, keyStore: { read: async () => 'SYNTHETIC_TEST_KEY' },
    openaiKeyStore: { read: async () => assert.fail('UNVERIFIED_SHAPE precedes key reads') },
    fetchImpl: async (_url, options) => {
      calls++; const payload = JSON.parse(options.body);
      assert.equal(payload.state.watch.id, 'w_build');
      return Response.json({ model: 'jev-1.13.0', answers: { watch: { type: 'choice', choice: 'finished', confidence: 0.9,
        probabilities: { finished: 0.9, running: 0.1, unknown: 0 } } } });
    } });
  const a = attempt(); const actual = await fake.decideWatch(a.request);
  assert.equal(Object.hasOwn(actual, 'reason_code'), false); assert.equal(actual.outcome, 'finished');
  assert.equal(apply(a, { result: actual }).latest_result.outcome, 'finished');
  const off = new DecisionProvider({ now: () => NOW, keyStore: { read: async () => undefined }, fetchImpl: async () => assert.fail('disabled must not send') });
  const disabled = await off.decideWatch(a.request);
  assert.equal(apply(a, { result: disabled }).latest_result.reason, 'disabled');
  const openai = attempt(watch({ provider: 'openai' })); const blocked = await fake.decideWatch(openai.request);
  assert.equal(blocked.reason, 'UNVERIFIED_SHAPE'); assert.equal(blocked.data_sent, false);
  assert.equal(apply(openai, { result: blocked }).latest_result.reason, 'UNVERIFIED_SHAPE');
  assert.equal(calls, 1); // An injected fixture function, never the global network client.
});

test('explicit outcome edits are saveable after the previous result used an outcome that was removed', () => {
  const current = apply(attempt());
  assert.equal(current.latest_result.outcome, 'finished');
  const edited = { ...current, outcomes: [{ id: 'success', label: 'Success' }, { id: 'pending', label: 'Pending' }] };
  const saved = saveWatch({ version: 1, watches: [current] }, { watch: edited, now: NOW + 100, userCreated: true }).watches[0];
  assert.deepEqual(saved.outcomes, edited.outcomes); assert.equal(saved.latest_result, null);
  assert.equal(saved.schedule.last_checked_at, null); assert.equal(saved.revision, 2);
});
