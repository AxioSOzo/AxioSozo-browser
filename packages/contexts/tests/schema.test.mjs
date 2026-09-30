/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContextsError, validateHostPattern, validateBaseUrl, validateWebUrl, stripQueryAndFragment, validateContextMetadata, validateProject, validateManifest,
  validateContextStore, validateDetectionDraft, validateSiteRule, validateRuleStore, validateLedger, validateLedgerRecord,
  validateEvaluation, validateSuppression, newRule, DEFAULT_RULE_STORE, DEFAULT_LEDGER, DEFAULT_CONTEXT_STORE, EFFECTS, OUTCOMES, REASON_CODES,
} from '../src/index.mjs';
import { UUID_A, UUID_B, rule, manifest } from './samples.mjs';

const context = (over = {}) => ({ version: 1, workspace_uuid: UUID_A, type: 'personal', organization_uuid: null, project_id: null, engine_preference: null, updated_at: 1, ...over });
const project = (over = {}) => ({ version: 1, id: 'p_abcd1234', root: '/Volumes/Work/app', manifest: manifest(), manifest_state: 'none', context_uuid: null, trusted: false, created_at: 1, updated_at: 2, ...over });
const throwsCode = (fn, code, path) => assert.throws(fn, e => e instanceof ContextsError && e.code === code && (path === undefined || e.path === path), `${code} ${path ?? ''}`);

test('host patterns: valid forms are normalized, the rest rejected', () => {
  for (const [input, out] of [['x.com', 'x.com'], ['*.x.com', '*.x.com'], ['X.Com', 'x.com'], ['localhost', 'localhost'], ['127.0.0.1', '127.0.0.1'],
    ['xn--bcher-kva.de', 'xn--bcher-kva.de'], ['a-b.example.co.uk', 'a-b.example.co.uk'], [`${'a'.repeat(63)}.com`, `${'a'.repeat(63)}.com`]]) {
    assert.equal(validateHostPattern(input), out);
  }
  const long = Array(64).fill('abc').join('.');
  for (const bad of ['', '*', '*.com', '*.*.x.com', 'x.com:80', 'x.com/path', '-x.com', 'x-.com', 'a..b', '.x.com', 'x.com.', ' x.com',
    '*.1.2.3', '1.2.3', '999.1.1.1', 'foo.123', `${'a'.repeat(64)}.com`, long, 'bücher.de', 'KK.com', 'x_y.com', 'user@x.com', null, 7]) {
    throwsCode(() => validateHostPattern(bad), 'INVALID_HOST_PATTERN');
  }
  assert.ok(long.length > 253);
});

test('base URLs: normalized origin + prefix, no userinfo/query/fragment', () => {
  assert.equal(validateBaseUrl('http://localhost:5173'), 'http://localhost:5173/');
  assert.equal(validateBaseUrl('http://localhost:5173/'), 'http://localhost:5173/');
  assert.equal(validateBaseUrl('https://Example.COM:443/app/'), 'https://example.com/app');
  assert.equal(validateBaseUrl('https://example.com/a/b//'), 'https://example.com/a/b');
  assert.equal(validateBaseUrl('HTTPS://bücher.de/x'), 'https://xn--bcher-kva.de/x');
  assert.equal(validateBaseUrl('http://[::1]:3000'), 'http://[::1]:3000/');
  for (const bad of ['https://u:p@x.com', 'https://u@x.com', 'https://:@x.com', 'https://x.com?', 'https://x.com/?a=1', 'https://x.com/#a', 'https://x.com#',
    'ftp://x.com', 'javascript:alert(1)', 'http:x.com', 'http:/x.com', 'http://x.com\\evil', 'http://x.com/a b', 'x.com', '', `https://x.com/${'a'.repeat(2048)}`,
    'file:///etc/passwd', 'http://', 'https://x.com@evil.com', 42]) {
    throwsCode(() => validateBaseUrl(bad), 'INVALID_URL');
  }
});

test('web URLs refuse queries, fragments and userinfo', () => {
  assert.equal(validateWebUrl('https://x.com/a/b'), 'https://x.com/a/b');
  assert.equal(validateWebUrl('http://localhost:8080'), 'http://localhost:8080/');
  for (const bad of ['https://x.com/a?b=1', 'https://x.com/?', 'https://x.com?a', 'https://x.com/a#b', 'https://token@x.com/', 'https://a:b@x.com/', 'data:text/html,hi', 'https://x.com/\ta'])
    throwsCode(() => validateWebUrl(bad), 'INVALID_URL');
  assert.equal(stripQueryAndFragment('https://x.com/a?b=1#c'), 'https://x.com/a');
  assert.equal(stripQueryAndFragment('https://x.com#c'), 'https://x.com');
  assert.equal(stripQueryAndFragment('not a url?x'), 'not a url?x');
});

test('context metadata', () => {
  const v = validateContextMetadata(context());
  assert.ok(Object.isFrozen(v));
  assert.deepEqual(validateContextMetadata(context({ type: 'project', organization_uuid: UUID_B, project_id: 'p_abcd', engine_preference: 'chromium' })).organization_uuid, UUID_B);
  assert.equal(validateContextMetadata(context({ workspace_uuid: '11111111-2222-4333-8444-555555555555' })).workspace_uuid, '11111111-2222-4333-8444-555555555555');
  throwsCode(() => validateContextMetadata(context({ extra: 1 })), 'INVALID_CONTEXT', '$.extra');
  // Projects may live in any space: project_id is no longer tied to type project (store v2 keeps it as a deprecated mirror).
  assert.equal(validateContextMetadata(context({ type: 'personal', project_id: 'p_abcd' })).project_id, 'p_abcd');
  throwsCode(() => validateContextMetadata(context({ type: 'personal', organization_uuid: UUID_B })), 'INVALID_CONTEXT');
  throwsCode(() => validateContextMetadata(context({ type: 'project', organization_uuid: UUID_A })), 'INVALID_CONTEXT', '$.organization_uuid');
  throwsCode(() => validateContextMetadata(context({ workspace_uuid: '{11111111-2222-4333-8444-555555555555' })), 'INVALID_CONTEXT', '$.workspace_uuid');
  throwsCode(() => validateContextMetadata(context({ type: 'team' })), 'INVALID_CONTEXT', '$.type');
  throwsCode(() => validateContextMetadata(context({ version: 2 })), 'INVALID_CONTEXT', '$.version');
  throwsCode(() => validateContextMetadata(context({ updated_at: 1.5 })), 'INVALID_CONTEXT', '$.updated_at');
  throwsCode(() => validateContextMetadata(context({ engine_preference: 'webkit' })), 'INVALID_CONTEXT');
  assert.equal(validateContextMetadata(context({ engine_preference: 'gecko' })).engine_preference, 'gecko');
  assert.equal(validateContextMetadata(context({ engine_preference: 'firefox' })).engine_preference, 'gecko', 'deprecated read alias normalizes to gecko');
  assert.equal(validateContextMetadata(context({ engine_preference: 'chromium' })).engine_preference, 'chromium');
  throwsCode(() => validateContextMetadata(context({ engine_preference: 'Firefox' })), 'INVALID_CONTEXT', '$.engine_preference');
  throwsCode(() => validateContextMetadata(context({ engine_preference: '__proto__' })), 'INVALID_CONTEXT', '$.engine_preference');
  const missing = context(); delete missing.engine_preference;
  throwsCode(() => validateContextMetadata(missing), 'INVALID_CONTEXT', '$.engine_preference');
  throwsCode(() => validateContextMetadata([]), 'INVALID_CONTEXT');
  throwsCode(() => validateContextMetadata(Object.assign(Object.create({ inherited: 1 }), context())), 'INVALID_CONTEXT');
});

test('manifest and project', () => {
  const m = validateManifest(manifest());
  assert.equal(m.environments[0].base_url, 'http://localhost:5173/');
  assert.ok(Object.isFrozen(m.environments[0]));
  throwsCode(() => validateManifest(manifest({ commands: [] })), 'INVALID_MANIFEST', '$.commands');
  throwsCode(() => validateManifest(manifest({ environments: [{ name: 'local', base_url: 'http://a.com' }, { name: 'local', base_url: 'http://b.com' }] })), 'INVALID_MANIFEST', '$.environments[1]');
  throwsCode(() => validateManifest(manifest({ environments: Array.from({ length: 17 }, (_, i) => ({ name: `e${i}`, base_url: 'http://a.com' })) })), 'INVALID_MANIFEST');
  throwsCode(() => validateManifest(manifest({ environments: [{ name: 'Prod', base_url: 'http://a.com' }] })), 'INVALID_MANIFEST');
  throwsCode(() => validateManifest(manifest({ name: 'a\u0007b' })), 'INVALID_MANIFEST', '$.name');
  throwsCode(() => validateManifest(manifest({ name: 'x'.repeat(81) })), 'INVALID_MANIFEST', '$.name');
  assert.equal(validateManifest(manifest({ name: '😀'.repeat(80) })).name.length, 160, 'lengths count code points');
  throwsCode(() => validateManifest(manifest({ services: [{ name: 'a', url: 'http://localhost/', port: 0 }] })), 'INVALID_MANIFEST');
  throwsCode(() => validateManifest(manifest({ services: [{ name: 'a', url: 'http://localhost/', port: 65536 }] })), 'INVALID_MANIFEST');
  throwsCode(() => validateManifest(manifest({ surfaces: [{ name: 'a', url: 'https://u:p@x.com/', kind: 'repository' }] })), 'INVALID_MANIFEST', '$.surfaces[0].url');
  throwsCode(() => validateManifest(manifest({ surfaces: [{ name: 'a', url: 'https://x.com/', kind: 'wiki' }] })), 'INVALID_MANIFEST');
  const p = validateProject(project());
  assert.equal(p.trusted, false);
  throwsCode(() => validateProject(project({ trusted: true })), 'INVALID_PROJECT', '$.trusted');
  throwsCode(() => validateProject(project({ root: 'relative/path' })), 'INVALID_PROJECT', '$.root');
  throwsCode(() => validateProject(project({ root: '/a\u0000b' })), 'INVALID_PROJECT', '$.root');
  throwsCode(() => validateProject(project({ manifest_state: 'unknown' })), 'INVALID_PROJECT');
  throwsCode(() => validateProject(project({ manifest: manifest({ kind: 'game' }) })), 'INVALID_PROJECT', '$.manifest.kind');
  throwsCode(() => validateProject(project({ id: 'p_AB' })), 'INVALID_PROJECT', '$.id');
});

test('context store rejects duplicates', () => {
  assert.deepEqual(validateContextStore(DEFAULT_CONTEXT_STORE), DEFAULT_CONTEXT_STORE);
  const store = { version: 1, contexts: [context(), context({ workspace_uuid: UUID_B })], projects: [project()] };
  assert.equal(validateContextStore(store).contexts.length, 2);
  throwsCode(() => validateContextStore({ ...store, contexts: [context(), context()] }), 'INVALID_CONTEXT_STORE', '$.contexts[1]');
  throwsCode(() => validateContextStore({ ...store, projects: [project(), project()] }), 'INVALID_CONTEXT_STORE', '$.projects[1]');
});

test('detection draft validation', () => {
  const draft = { version: 1, name: 'x', kind: 'web', kind_source: { source: 'default', guess: true }, environments: [], services: [], surfaces: [],
    frameworks: [], files_read: [], refused: [{ path: '.env', reason: 'not_allowlisted' }], warnings: [] };
  assert.equal(validateDetectionDraft(draft).refused[0].reason, 'not_allowlisted');
  throwsCode(() => validateDetectionDraft({ ...draft, manifest_state: 'external' }), 'INVALID_DRAFT');
  throwsCode(() => validateDetectionDraft({ ...draft, refused: [{ path: 'x', reason: 'because' }] }), 'INVALID_DRAFT');
  throwsCode(() => validateDetectionDraft({ ...draft, warnings: ['w'.repeat(257)] }), 'INVALID_DRAFT');
  throwsCode(() => validateDetectionDraft({ ...draft, environments: [{ name: 'local', base_url: 'http://localhost:1/' }] }), 'INVALID_DRAFT');
});

test('site rules', () => {
  const r = validateSiteRule(rule({ match: { hosts: ['X.com', '*.x.com'] } }));
  assert.deepEqual(r.match.hosts, ['x.com', '*.x.com']);
  assert.ok(Object.isFrozen(r) && Object.isFrozen(r.match.hosts) && Object.isFrozen(r.limits));
  assert.throws(() => { r.enabled = false; }, TypeError);
  assert.equal(validateSiteRule(rule({ contexts: { types: ['organization'], workspaces: [UUID_A] } })).contexts.types[0], 'organization');
  assert.deepEqual(validateSiteRule(rule({ limits: { daily_minutes: null, allowed_hours: [{ start: '22:00', end: '02:00', days: [5, 6] }] } })).limits.allowed_hours[0].days, [5, 6]);
  const cases = [
    [{ extra: true }, '$.extra'], [{ id: 'r_7F3A' }, '$.id'], [{ id: 'rule1' }, '$.id'], [{ enabled: 'yes' }, '$.enabled'],
    [{ match: { hosts: [] } }, '$.match.hosts'], [{ match: { hosts: ['x.com', 'x.com'] } }, '$.match.hosts[1]'], [{ match: { hosts: ['x.com', 'X.COM'] } }, '$.match.hosts[1]'],
    [{ match: { hosts: Array.from({ length: 33 }, (_, i) => `h${i}.com`) } }, '$.match.hosts'], [{ match: { hosts: ['x.com'], paths: ['/'] } }, '$.match.paths'],
    [{ contexts: {} }, '$.contexts'], [{ contexts: 'some' }, '$.contexts'], [{ contexts: { types: [] } }, '$.contexts.types'],
    [{ contexts: { types: ['personal', 'personal'] } }, '$.contexts.types[1]'], [{ contexts: { tags: ['x'] } }, '$.contexts.tags'],
    [{ instruction: 'x'.repeat(2001) }, '$.instruction'], [{ limits: { daily_minutes: 0, allowed_hours: null } }, '$.limits.daily_minutes'],
    [{ limits: { daily_minutes: 1441, allowed_hours: null } }, '$.limits.daily_minutes'], [{ limits: { daily_minutes: 5 } }, '$.limits.allowed_hours'],
    [{ limits: { daily_minutes: null, allowed_hours: [] } }, '$.limits.allowed_hours'],
    [{ limits: { daily_minutes: null, allowed_hours: [{ start: '24:00', end: '01:00' }] } }, '$.limits.allowed_hours[0].start'],
    [{ limits: { daily_minutes: null, allowed_hours: [{ start: '9:00', end: '10:00' }] } }, '$.limits.allowed_hours[0].start'],
    [{ limits: { daily_minutes: null, allowed_hours: [{ start: '09:00', end: '10:00', days: [1, 1] }] } }, '$.limits.allowed_hours[0].days[1]'],
    [{ limits: { daily_minutes: null, allowed_hours: [{ start: '09:00', end: '10:00', days: [7] }] } }, '$.limits.allowed_hours[0].days[0]'],
    [{ limits: { daily_minutes: null, allowed_hours: [{ start: '09:00', end: '10:00', days: [] }] } }, '$.limits.allowed_hours[0].days'],
    [{ observation: 'full' }, '$.observation'], [{ observation_raised_hosts: ['bank.com'] }, '$.observation_raised_hosts[0]'],
    [{ effects: ['nudge', 'nudge'] }, '$.effects[1]'], [{ effects: ['block'] }, '$.effects[0]'], [{ effects: ['none'] }, '$.effects[0]'],
    [{ override: 'never' }, '$.override'], [{ agents: { access: 'all', instruction: '' } }, '$.agents.access'],
    [{ agents: { access: 'none' } }, '$.agents.instruction'], [{ created_at: -1 }, '$.created_at'], [{ version: 2 }, '$.version'],
  ];
  for (const [over, path] of cases) throwsCode(() => validateSiteRule(rule(over)), 'INVALID_RULE', path);
  assert.deepEqual(validateSiteRule(rule({ observation_raised_hosts: ['*.x.com'] })).observation_raised_hosts, ['*.x.com']);
});

test('rule store and defaults', () => {
  assert.deepEqual(validateRuleStore(DEFAULT_RULE_STORE), { version: 1, rules: [], jev: { consent: false, interval_minutes: 5, hourly_budget: 30 } });
  assert.ok(Object.isFrozen(DEFAULT_RULE_STORE.jev) && Object.isFrozen(DEFAULT_LEDGER.records));
  throwsCode(() => validateRuleStore({ ...DEFAULT_RULE_STORE, rules: [rule(), rule()] }), 'INVALID_RULE_STORE', '$.rules[1]');
  throwsCode(() => validateRuleStore({ ...DEFAULT_RULE_STORE, jev: { consent: true, interval_minutes: 0, hourly_budget: 5 } }), 'INVALID_RULE_STORE', '$.jev.interval_minutes');
  throwsCode(() => validateRuleStore({ ...DEFAULT_RULE_STORE, jev: { consent: true, interval_minutes: 5, hourly_budget: 31 } }), 'INVALID_RULE_STORE', '$.jev.hourly_budget');
  throwsCode(() => validateRuleStore({ ...DEFAULT_RULE_STORE, jev: { consent: 1, interval_minutes: 5, hourly_budget: 1 } }), 'INVALID_RULE_STORE', '$.jev.consent');
  assert.deepEqual(EFFECTS, ['nudge', 'suggest_leave', 'pause_site']);
  assert.deepEqual(OUTCOMES, ['none', 'nudge', 'suggest_leave', 'pause_site']);
  assert.equal(REASON_CODES.length, 6);
});

test('newRule applies the contract defaults', () => {
  const r = newRule({ now: 5, id: 'r_abcd', hosts: ['example.com'] });
  assert.deepEqual(r, { version: 1, id: 'r_abcd', enabled: true, match: { hosts: ['example.com'] }, contexts: 'all', instruction: '',
    limits: { daily_minutes: null, allowed_hours: null }, observation: 'none', observation_raised_hosts: [], effects: ['nudge'], override: 'confirm',
    agents: { access: 'none', instruction: '' }, created_at: 5, updated_at: 5 });
  const draft = newRule({ now: 5, id: 'r_abcd' });
  assert.ok(Object.isFrozen(draft));
  throwsCode(() => validateSiteRule(draft), 'INVALID_RULE', '$.match.hosts');
  throwsCode(() => newRule({ now: 5, id: 'bad' }), 'INVALID_INPUT', '$.id');
  throwsCode(() => newRule({ id: 'r_abcd' }), 'INVALID_INPUT', '$.now');
  throwsCode(() => newRule({ now: 1, id: 'r_abcd', hosts: ['*'] }), 'INVALID_RULE');
});

test('ledger validation', () => {
  const rec = { day: '2026-09-27', host: 'x.com', context_uuid: UUID_A, foreground_ms: 1000 };
  assert.deepEqual(validateLedgerRecord(rec), rec);
  assert.equal(validateLedger({ ...DEFAULT_LEDGER, records: [rec, { ...rec, context_uuid: null }] }).records.length, 2);
  throwsCode(() => validateLedger({ ...DEFAULT_LEDGER, records: [rec, { ...rec }] }), 'INVALID_LEDGER', '$.records[1]');
  for (const [over, path] of [[{ day: '2026-02-30' }, '$.day'], [{ day: '2026-13-01' }, '$.day'], [{ day: '26-09-27' }, '$.day'], [{ host: 'X.com' }, '$.host'],
    [{ host: 'x.com:80' }, '$.host'], [{ host: 'h'.repeat(254) }, '$.host'], [{ foreground_ms: 86400001 }, '$.foreground_ms'], [{ foreground_ms: -1 }, '$.foreground_ms'],
    [{ context_uuid: 'x' }, '$.context_uuid'], [{ extra: 1 }, '$.extra']]) {
    throwsCode(() => validateLedgerRecord({ ...rec, ...over }), 'INVALID_LEDGER', path);
  }
  assert.equal(validateLedgerRecord({ ...rec, day: '2028-02-29' }).day, '2028-02-29');
  throwsCode(() => validateLedgerRecord({ ...rec, day: '2100-02-29' }), 'INVALID_LEDGER');
  throwsCode(() => validateLedger({ version: 1, records: [] }), 'INVALID_LEDGER', '$.retention_days');
  throwsCode(() => validateLedger({ ...DEFAULT_LEDGER, retention_days: 366 }), 'INVALID_LEDGER', '$.retention_days');
});

test('evaluation and suppression shapes', () => {
  assert.equal(validateEvaluation({ rule_id: 'r_abcd', effect: 'nudge', source: 'jev', reason_code: 'drift' }).effect, 'nudge');
  throwsCode(() => validateEvaluation({ rule_id: 'r_abcd', effect: 'none', source: 'jev', reason_code: 'drift' }), 'INVALID_EVALUATION');
  throwsCode(() => validateEvaluation({ rule_id: 'r_abcd', effect: 'block', source: 'jev', reason_code: null }), 'INVALID_EVALUATION');
  assert.equal(validateSuppression({ rule_id: 'r_abcd', context_uuid: null, effect: 'nudge', until: 5 }).until, 5);
  throwsCode(() => validateSuppression({ rule_id: 'r_abcd', context_uuid: null, effect: 'none', until: 5 }), 'INVALID_SUPPRESSION');
});
