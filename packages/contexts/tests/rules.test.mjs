/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContextsError, hostMatches, ruleMatches, rulesFor, evaluateDeterministic, applyJevOutcome, effectiveObservation, isSensitiveHost,
  insideAllowedHours, suppress, activeSuppressions, SENSITIVE_HOSTS, SENSITIVE_HOSTS_VERSION, OVERRIDE_DELAY_MS, validateEvaluation, validateSiteRule,
} from '../src/index.mjs';
import { UUID_A, UUID_B, rule } from './samples.mjs';

const NOW = 1790000000000;
const at = (hh, mm = 0, weekday = 3) => ({ day: '2026-09-30', minutes: hh * 60 + mm, weekday });
const evaluate = (r, extra = {}) => evaluateDeterministic({ rule: r, usageTodayMs: 0, local: at(12), contextUuid: UUID_A, suppressions: [], now: NOW, ...extra });
const effect = (r, extra) => { const e = evaluate(r, extra); return [e.effect, e.reason_code]; };

test('hostMatches: exact hosts and subdomain-only wildcards', () => {
  assert.equal(hostMatches('x.com', 'x.com'), true);
  assert.equal(hostMatches('x.com', 'X.COM.'), true);
  assert.equal(hostMatches('x.com', 'www.x.com'), false);
  assert.equal(hostMatches('*.x.com', 'www.x.com'), true);
  assert.equal(hostMatches('*.x.com', 'a.b.x.com'), true);
  assert.equal(hostMatches('*.x.com', 'x.com'), false);
  assert.equal(hostMatches('*.x.com', 'evilx.com'), false);
  assert.equal(hostMatches('*.x.com', 'x.com.evil.org'), false);
  assert.equal(hostMatches('x.com', 'x.com.evil.org'), false);
  assert.equal(hostMatches('', ''), false);
  assert.equal(hostMatches(null, 'x.com'), false);
});

test('ruleMatches and rulesFor: enabled, host and context selector', () => {
  const r = validateSiteRule(rule());
  assert.equal(ruleMatches(r, { host: 'x.com', contextUuid: UUID_A, contextType: 'personal' }), true);
  assert.equal(ruleMatches(r, { host: 'y.com', contextUuid: UUID_A, contextType: 'personal' }), false);
  assert.equal(ruleMatches(rule({ enabled: false }), { host: 'x.com', contextType: 'personal' }), false);
  const scoped = rule({ contexts: { types: ['organization'], workspaces: [UUID_B] } });
  assert.equal(ruleMatches(scoped, { host: 'x.com', contextUuid: UUID_A, contextType: 'organization' }), true);
  assert.equal(ruleMatches(scoped, { host: 'x.com', contextUuid: UUID_B, contextType: 'personal' }), true);
  assert.equal(ruleMatches(scoped, { host: 'x.com', contextUuid: UUID_A, contextType: 'personal' }), false);
  assert.equal(ruleMatches(scoped, { host: 'x.com', contextUuid: null, contextType: 'project' }), false);
  const list = rulesFor([rule(), rule({ id: 'r_other', match: { hosts: ['y.com'] } }), scoped], { host: 'www.x.com', contextUuid: UUID_A, contextType: 'personal' });
  assert.deepEqual(list.map(x => x.id), ['r_7f3a']);
  assert.deepEqual(rulesFor(null, {}), []);
});

test('deterministic: daily limit → pause_site, else nudge, else none', () => {
  const limit = 15 * 60000;
  assert.deepEqual(effect(rule(), { usageTodayMs: limit - 1 }), ['none', null]);
  assert.deepEqual(effect(rule(), { usageTodayMs: limit }), ['pause_site', 'daily_limit_reached']);
  assert.deepEqual(effect(rule({ effects: ['nudge'] }), { usageTodayMs: limit }), ['nudge', 'daily_limit_reached']);
  assert.deepEqual(effect(rule({ effects: ['suggest_leave'] }), { usageTodayMs: limit }), ['none', null]);
  assert.deepEqual(effect(rule({ effects: [] }), { usageTodayMs: limit }), ['none', null]);
  assert.deepEqual(effect(rule({ limits: { daily_minutes: null, allowed_hours: null } }), { usageTodayMs: 10 * limit }), ['none', null]);
  assert.deepEqual(effect(rule({ enabled: false }), { usageTodayMs: limit }), ['none', null]);
  const e = evaluate(rule(), { usageTodayMs: limit });
  assert.deepEqual(e, validateEvaluation(e));
  assert.equal(e.source, 'deterministic');
  assert.ok(Object.isFrozen(e));
  assert.deepEqual(evaluate(rule(), { usageTodayMs: limit }), e, 'same input, same output');
});

test('deterministic: allowed hours with days and midnight wrap', () => {
  const hours = allowed => rule({ limits: { daily_minutes: null, allowed_hours: allowed } });
  const work = hours([{ start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] }]);
  assert.deepEqual(effect(work, { local: at(9, 0, 3) }), ['none', null]);
  assert.deepEqual(effect(work, { local: at(16, 59, 3) }), ['none', null]);
  assert.deepEqual(effect(work, { local: at(17, 0, 3) }), ['pause_site', 'outside_allowed_hours'], 'end is exclusive');
  assert.deepEqual(effect(work, { local: at(8, 59, 3) }), ['pause_site', 'outside_allowed_hours']);
  assert.deepEqual(effect(work, { local: at(12, 0, 0) }), ['pause_site', 'outside_allowed_hours'], 'Sunday is not listed');
  const night = hours([{ start: '22:00', end: '02:00', days: [5] }]);
  assert.deepEqual(effect(night, { local: at(23, 0, 5) }), ['none', null], 'Friday night');
  assert.deepEqual(effect(night, { local: at(1, 30, 6) }), ['none', null], 'continues into Saturday morning');
  assert.deepEqual(effect(night, { local: at(1, 30, 5) }), ['pause_site', 'outside_allowed_hours'], 'Friday 01:30 belongs to Thursday');
  assert.deepEqual(effect(night, { local: at(2, 0, 6) }), ['pause_site', 'outside_allowed_hours']);
  const sundayWrap = hours([{ start: '23:00', end: '01:00', days: [6] }]);
  assert.deepEqual(effect(sundayWrap, { local: at(0, 30, 0) }), ['none', null], 'Saturday window wraps into Sunday');
  assert.deepEqual(effect(hours([{ start: '08:00', end: '08:00' }]), { local: at(3, 0, 2) }), ['none', null], 'start == end covers the whole day');
  const two = hours([{ start: '07:00', end: '08:00' }, { start: '19:00', end: '20:30' }]);
  assert.deepEqual([effect(two, { local: at(7, 30) })[0], effect(two, { local: at(12) })[0], effect(two, { local: at(20, 29) })[0]], ['none', 'pause_site', 'none']);
  assert.equal(insideAllowedHours([{ start: '00:00', end: '23:59' }], { minutes: 1439, weekday: 1 }), false);
  const both = rule({ limits: { daily_minutes: 1, allowed_hours: [{ start: '09:00', end: '10:00' }] } });
  assert.deepEqual(effect(both, { usageTodayMs: 60000, local: at(12) }), ['pause_site', 'daily_limit_reached'], 'the daily limit reason wins');
});

test('deterministic: suppressions', () => {
  const limit = { usageTodayMs: 15 * 60000 };
  const s = suppress({ ruleId: 'r_7f3a', contextUuid: UUID_A, effect: 'pause_site', now: NOW });
  assert.equal(s.until, NOW + 15 * 60000);
  assert.deepEqual(effect(rule(), { ...limit, suppressions: [s] }), ['none', null]);
  assert.deepEqual(effect(rule(), { ...limit, suppressions: [s], now: s.until }), ['pause_site', 'daily_limit_reached'], 'expired at until');
  assert.deepEqual(effect(rule(), { ...limit, suppressions: [s], contextUuid: UUID_B }), ['pause_site', 'daily_limit_reached'], 'other context');
  assert.deepEqual(effect(rule(), { ...limit, suppressions: [{ ...s, rule_id: 'r_other' }] }), ['pause_site', 'daily_limit_reached']);
  const nudge = suppress({ ruleId: 'r_7f3a', contextUuid: UUID_A, effect: 'nudge', now: NOW });
  assert.equal(nudge.until, NOW + 5 * 60000);
  assert.deepEqual(effect(rule(), { ...limit, suppressions: [nudge] }), ['pause_site', 'daily_limit_reached'], 'a nudge suppression does not hide pause_site');
  assert.deepEqual(effect(rule({ effects: ['nudge'] }), { ...limit, suppressions: [nudge] }), ['none', null]);
  const noCtx = suppress({ ruleId: 'r_7f3a', contextUuid: null, effect: 'pause_site', now: NOW });
  assert.deepEqual(effect(rule(), { ...limit, suppressions: [noCtx], contextUuid: null }), ['none', null]);
  assert.equal(suppress({ ruleId: 'r_7f3a', effect: 'suggest_leave', now: NOW }).until, NOW + 15 * 60000);
  assert.deepEqual(activeSuppressions([s, nudge], NOW + 6 * 60000).map(x => x.effect), ['pause_site']);
  for (const bad of [{ ruleId: 'x', effect: 'nudge', now: 1 }, { ruleId: 'r_7f3a', effect: 'none', now: 1 }, { ruleId: 'r_7f3a', effect: 'nudge' }, { ruleId: 'r_7f3a', effect: 'nudge', now: 1, contextUuid: 'nope' }]) {
    assert.throws(() => suppress(bad), e => e instanceof ContextsError && e.code === 'INVALID_INPUT');
  }
  assert.equal(OVERRIDE_DELAY_MS, 10000);
});

test('deterministic: optional host/context re-check and input validation', () => {
  assert.deepEqual(effect(rule(), { usageTodayMs: 15 * 60000, host: 'y.com', contextType: 'personal' }), ['none', null]);
  assert.deepEqual(effect(rule(), { usageTodayMs: 15 * 60000, host: 'm.x.com', contextType: 'personal' }), ['pause_site', 'daily_limit_reached']);
  for (const extra of [{ local: undefined }, { local: { minutes: 1440, weekday: 1 } }, { local: { minutes: 1, weekday: 7 } }, { usageTodayMs: -1 }, { usageTodayMs: NaN }, { now: undefined }]) {
    assert.throws(() => evaluate(rule(), extra), e => e instanceof ContextsError && e.code === 'INVALID_INPUT');
  }
  assert.throws(() => evaluate({ ...rule(), effects: ['block'] }), e => e.code === 'INVALID_RULE');
});

test('Jev outcomes apply only when the rule lists them', () => {
  const r = rule({ effects: ['nudge'] });
  assert.deepEqual(applyJevOutcome(r, 'nudge', 'drift'), { rule_id: 'r_7f3a', effect: 'nudge', source: 'jev', reason_code: 'drift' });
  assert.deepEqual(applyJevOutcome(r, 'pause_site', 'drift'), { rule_id: 'r_7f3a', effect: 'none', source: 'jev', reason_code: null });
  assert.deepEqual(applyJevOutcome(r, 'nudge', 'daily_limit_reached').reason_code, null, 'deterministic codes are not Jev codes');
  assert.deepEqual(applyJevOutcome(r, 'nudge', 'free text').reason_code, null);
  assert.equal(applyJevOutcome(r, 'block', null).effect, 'none');
  assert.equal(applyJevOutcome(r, 'none', 'on_task').reason_code, null);
  assert.equal(applyJevOutcome(rule({ enabled: false }), 'nudge', 'drift').effect, 'none');
  assert.equal(applyJevOutcome(r, undefined).effect, 'none');
});

test('sensitive hosts are versioned data and cap observation at address', () => {
  assert.equal(SENSITIVE_HOSTS_VERSION, 'sensitive-hosts-v1');
  assert.equal(SENSITIVE_HOSTS.version, SENSITIVE_HOSTS_VERSION);
  assert.ok(Object.isFrozen(SENSITIVE_HOSTS.suffixes.banking));
  const cat = h => isSensitiveHost(h).category;
  assert.deepEqual(['irs.gov', 'www.gov.uk', 'mijn.belastingdienst.nl', 'www.kvk.nl', 'digid.nl', 'www.overheid.nl', 'army.mil', 'impots.gouv.fr', 'www.gob.mx', 'x.go.jp'].map(cat), Array(10).fill('government'));
  assert.deepEqual(['my.example.bank', 'mijn.ing.nl', 'www.bunq.com', 'www.paypal.com'].map(cat), Array(4).fill('banking'));
  assert.deepEqual(['accounts.google.com', 'login.microsoftonline.com', 'appleid.apple.com'].map(cat), Array(3).fill('identity'));
  assert.deepEqual(['my.1password.com', 'vault.bitwarden.com', 'pass.proton.me'].map(cat), Array(3).fill('password_manager'));
  assert.equal(cat('www.nhs.uk'), 'health');
  for (const h of ['x.com', 'government.example.com', 'gov.com', 'notgov', 'github.io', 'google.com', 'mail.google.com', 'proton.me', 'ingredients.nl', 'evilgov.uk', '']) {
    assert.deepEqual(isSensitiveHost(h), { sensitive: false, category: null }, h);
  }
  const bank = rule({ match: { hosts: ['*.ing.nl', 'x.com'] }, observation: 'outline' });
  assert.equal(effectiveObservation(bank, 'mijn.ing.nl'), 'address');
  assert.equal(effectiveObservation(bank, 'x.com'), 'outline');
  assert.equal(effectiveObservation(bank, 'y.com'), 'none', 'host not covered by the rule');
  assert.equal(effectiveObservation({ ...bank, observation_raised_hosts: ['*.ing.nl'] }, 'mijn.ing.nl'), 'outline');
  assert.equal(effectiveObservation({ ...bank, observation: 'address' }, 'mijn.ing.nl'), 'address');
  assert.equal(effectiveObservation({ ...bank, observation: 'none' }, 'x.com'), 'none');
  assert.throws(() => effectiveObservation({ ...bank, observation_raised_hosts: ['bank.com'] }, 'bank.com'), e => e.code === 'INVALID_RULE');
});
