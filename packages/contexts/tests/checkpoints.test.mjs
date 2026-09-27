/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ContextsError, createBudget, takeBudget, nextCheckpoint, buildSiteRuleRequest, DEFAULT_HOURLY_BUDGET } from '../src/index.mjs';
import { rule } from './samples.mjs';

const NOW = 1790000000000;
const input = (over = {}) => ({
  rule: rule(), contextType: 'personal', checkpoint: 'commit', elapsed: { today_ms: 540000, foreground_session_ms: 120000 },
  observation: { url: 'https://x.com/home?ref=secret#frag', title: '  Home /\n X  ', outline: [{ kind: 'heading', text: 'For you' }, { kind: 'link', text: 'Notifications' }, { kind: 'label', text: 'Search' }] },
  requestId: 'req_1', now: NOW, ...over,
});
const bad = fn => assert.throws(fn, e => e instanceof ContextsError && e.code === 'INVALID_INPUT');
const REQUEST_KEYS = ['version', 'request_id', 'choice_set', 'context_version', 'deadline_ms', 'state'];

test('rolling-hour budget', () => {
  let budget = createBudget();
  for (let i = 0; i < DEFAULT_HOURLY_BUDGET; i++) { const r = takeBudget(budget, { now: NOW + i * 1000 }); assert.equal(r.ok, true); budget = r.budget; }
  assert.equal(takeBudget(budget, { now: NOW + 60000 }).ok, false);
  assert.equal(takeBudget(budget, { now: NOW + 3600000 }).ok, true, 'the first call left the window');
  assert.equal(takeBudget(budget, { now: NOW + 3600000 }).budget.calls.length, 30, '29 still in the window plus this call');
  assert.equal(takeBudget(createBudget(), { now: NOW, limit: 0 }).ok, false, 'budget 0 never calls');
  const small = takeBudget(takeBudget(createBudget(), { now: NOW, limit: 2 }).budget, { now: NOW + 1, limit: 2 });
  assert.deepEqual([small.ok, takeBudget(small.budget, { now: NOW + 2, limit: 2 }).ok], [true, false]);
  assert.ok(Object.isFrozen(budget.calls));
  bad(() => takeBudget(budget, { now: NOW, limit: 31 }));
  bad(() => takeBudget({}, { now: NOW }));
  bad(() => takeBudget(budget, {}));
});

test('checkpoints fire only for foreground, non-private tabs', () => {
  assert.equal(nextCheckpoint({ lastAt: null, now: NOW, foreground: true, isPrivate: false }), true);
  assert.equal(nextCheckpoint({ lastAt: NOW - 299999, now: NOW, foreground: true, isPrivate: false }), false);
  assert.equal(nextCheckpoint({ lastAt: NOW - 300000, now: NOW, foreground: true, isPrivate: false }), true);
  assert.equal(nextCheckpoint({ lastAt: NOW - 60000, intervalMinutes: 1, now: NOW, foreground: true, isPrivate: false }), true);
  assert.equal(nextCheckpoint({ lastAt: null, now: NOW, foreground: false, isPrivate: false }), false);
  assert.equal(nextCheckpoint({ lastAt: null, now: NOW, foreground: true, isPrivate: true }), false);
  assert.equal(nextCheckpoint({ lastAt: null, now: NOW, foreground: true }), false, 'unknown privacy fails closed');
  bad(() => nextCheckpoint({ now: NOW, intervalMinutes: 31, foreground: true, isPrivate: false }));
  bad(() => nextCheckpoint({ now: NOW, intervalMinutes: 0, foreground: true, isPrivate: false }));
  bad(() => nextCheckpoint({ foreground: true, isPrivate: false }));
});

test('buildSiteRuleRequest: exact decision-v1 shape', () => {
  const req = buildSiteRuleRequest(input());
  assert.deepEqual(req, {
    version: 1, request_id: 'req_1', choice_set: 'site_rule_v1', context_version: 'site-rule-1', deadline_ms: NOW + 30000,
    state: {
      rule: { id: 'r_7f3a', instruction: rule().instruction, effects: ['nudge', 'suggest_leave', 'pause_site'] },
      context_type: 'personal', checkpoint: 'commit', elapsed: { today_ms: 540000, foreground_session_ms: 120000 },
      observation: { level: 'outline', address: { origin: 'https://x.com', path: '/home', title: 'Home / X' },
        outline: [{ id: 'o1', kind: 'heading', text: 'For you' }, { id: 'o2', kind: 'link', text: 'Notifications' }, { id: 'o3', kind: 'label', text: 'Search' }] },
    },
  });
  assert.deepEqual(Object.keys(req), REQUEST_KEYS);
  assert.ok(Object.isFrozen(req.state.observation.outline[0]));
  assert.doesNotMatch(JSON.stringify(req), /secret|frag/);
  assert.equal(buildSiteRuleRequest(input({ timeoutMs: 5000 })).deadline_ms, NOW + 5000);
});

test('buildSiteRuleRequest returns null when nothing may be sent', () => {
  assert.equal(buildSiteRuleRequest(input({ rule: rule({ observation: 'none' }) })), null);
  assert.equal(buildSiteRuleRequest(input({ rule: rule({ effects: [] }) })), null);
  assert.equal(buildSiteRuleRequest(input({ rule: rule({ enabled: false }) })), null);
  assert.equal(buildSiteRuleRequest(input({ observation: { url: 'https://y.com/', title: '' } })), null);
  for (const url of ['about:blank', 'file:///etc/passwd', 'moz-extension://x/y', 'not a url', undefined]) assert.equal(buildSiteRuleRequest(input({ observation: { url, title: '' } })), null, String(url));
});

test('address level and the sensitive cap never include an outline', () => {
  const address = buildSiteRuleRequest(input({ rule: rule({ observation: 'address' }) }));
  assert.deepEqual(Object.keys(address.state.observation), ['level', 'address']);
  const bank = rule({ match: { hosts: ['*.ing.nl'] } });
  const capped = buildSiteRuleRequest(input({ rule: bank, observation: { url: 'https://mijn.ing.nl/accounts?iban=NL00', title: 'Accounts', outline: [{ kind: 'label', text: 'IBAN' }] } }));
  assert.equal(capped.state.observation.level, 'address');
  assert.equal('outline' in capped.state.observation, false);
  assert.equal(capped.state.observation.address.path, '/accounts');
  const raised = buildSiteRuleRequest(input({ rule: { ...bank, observation_raised_hosts: ['*.ing.nl'] }, observation: { url: 'https://mijn.ing.nl/', title: '', outline: [{ kind: 'label', text: 'IBAN' }] } }));
  assert.equal(raised.state.observation.level, 'outline');
});

test('outline is filtered, collapsed, clipped and re-numbered', () => {
  const outline = [
    { kind: 'heading', text: '   ' }, { kind: 'password', text: 'hunter2' }, { kind: 'value', text: 'form value' }, { text: 'no kind' }, { kind: 'link', text: 42 }, null,
    { kind: 'link', text: '  a\n\tb   c  ' }, { kind: 'label', text: `x${'y'.repeat(300)}` }, { kind: 'heading', text: `${'z'.repeat(199)}😀tail` },
    { kind: 'heading', text: 'ctrl\u0000\u0007chars' }, { kind: 'link', text: `${'q'.repeat(199)} w` }, { kind: 'link', id: 'dom-id', text: 'keeps opaque id' },
  ];
  const items = buildSiteRuleRequest(input({ observation: { url: 'https://x.com/', title: 't', outline } })).state.observation.outline;
  assert.deepEqual(items.map(i => i.id), ['o1', 'o2', 'o3', 'o4', 'o5', 'o6']);
  assert.equal(items[0].text, 'a b c');
  assert.equal(items[1].text.length, 200);
  assert.equal(items[2].text, 'z'.repeat(199), 'a surrogate pair is never split');
  assert.equal(items[3].text, 'ctrl chars');
  assert.equal(items[4].text, 'q'.repeat(199), 'no trailing space after clipping');
  assert.deepEqual(items[5], { id: 'o6', kind: 'link', text: 'keeps opaque id' });
  for (const i of items) assert.equal(i.text, i.text.replace(/\s+/gu, ' ').trim());
  const many = Array.from({ length: 250 }, (_, i) => ({ kind: 'link', text: `item ${i}` }));
  const capped = buildSiteRuleRequest(input({ observation: { url: 'https://x.com/', title: '', outline: many } })).state.observation.outline;
  assert.deepEqual([capped.length, capped.at(-1).id, capped.at(-1).text], [200, 'o200', 'item 199']);
  const heavy = Array.from({ length: 200 }, () => ({ kind: 'label', text: '界'.repeat(200) }));
  const req = buildSiteRuleRequest(input({ observation: { url: 'https://x.com/', title: '界'.repeat(300), outline: heavy } }));
  assert.ok(Buffer.byteLength(JSON.stringify(req.state)) <= 65536);
  assert.ok(req.state.observation.outline.length > 50 && req.state.observation.outline.length < 200);
  assert.equal(req.state.observation.address.title.length, 256);
});

test('elapsed values are clamped integers; bad arguments throw', () => {
  const r = buildSiteRuleRequest(input({ elapsed: { today_ms: 1.6, foreground_session_ms: 10 * 86400000 } }));
  assert.deepEqual(r.state.elapsed, { today_ms: 2, foreground_session_ms: 86400000 });
  for (const over of [{ contextType: 'team' }, { checkpoint: 'scroll' }, { requestId: 'bad id' }, { requestId: 'x'.repeat(161) }, { now: -1 }, { timeoutMs: 30001 },
    { timeoutMs: 0 }, { elapsed: { today_ms: -1, foreground_session_ms: 0 } }, { elapsed: {} }]) {
    bad(() => buildSiteRuleRequest(input(over)));
  }
  assert.throws(() => buildSiteRuleRequest(input({ rule: { ...rule(), extra: 1 } })), e => e.code === 'INVALID_RULE');
});

test('requests pass the provider host strict validator (cross-package check)', async t => {
  let validateSiteRuleRequest;
  try { ({ validateSiteRuleRequest } = await import('../../provider-host/src/decision.mjs')); } catch { validateSiteRuleRequest = undefined; }
  if (typeof validateSiteRuleRequest !== 'function') { t.skip('provider-host validateSiteRuleRequest not available'); return; }
  const outline = [{ kind: 'heading', text: ' spaced\n out ' }, { kind: 'link', text: '😀'.repeat(150) }, ...Array.from({ length: 300 }, (_, i) => ({ kind: 'label', text: `L${i}` }))];
  const variants = [
    input(), input({ rule: rule({ observation: 'address' }) }), input({ checkpoint: 'interval', contextType: 'organization' }),
    input({ observation: { url: 'https://www.x.com/a%20b/c?x#y', title: 'x'.repeat(1000), outline } }),
    input({ rule: rule({ match: { hosts: ['xn--bcher-kva.example'] } }), observation: { url: 'https://Bücher.example/ä', title: 'IDN', outline } }),
    input({ observation: { url: `https://x.com/${'p'.repeat(5000)}`, title: '', outline: [] } }),
    input({ rule: rule({ instruction: '😀'.repeat(2000), effects: ['nudge'] }) }),
    input({ observation: { url: 'http://x.com:8080/', title: '\u0000', outline: Array.from({ length: 200 }, () => ({ kind: 'label', text: '界'.repeat(200) })) } }),
  ];
  for (const v of variants) {
    const req = buildSiteRuleRequest(v);
    assert.ok(req, 'request built');
    assert.doesNotThrow(() => validateSiteRuleRequest(structuredClone(req), NOW), JSON.stringify(req).slice(0, 200));
  }
});
