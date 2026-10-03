/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildSiteRuleRequest, validateSiteRule, validateRuleStore, newRule, DEFAULT_RULE_STORE, effectiveObservation } from '../src/index.mjs';
import { validateSiteRuleRequest } from '../../provider-host/src/decision.mjs';
import { rule } from './samples.mjs';

const NOW = 1790000000000;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+kKfkAAAAASUVORK5CYII=', 'base64');
const image = (bytes = PNG, over = {}) => ({ mime: 'image/png', width: 1, height: 1, data_base64: bytes.toString('base64'), ...over });
const input = (over = {}) => ({ rule: rule(), contextType: 'personal', checkpoint: 'commit',
  elapsed: { today_ms: 1, foreground_session_ms: 1 }, observation: { url: 'https://x.com/page?omitted=yes#fragment', title: 'Current page', screen: image() },
  requestId: 'req_policy', now: NOW, ...over });
const screenRule = (over = {}) => rule({ provider: 'openai', observation: 'screen', ...over });
const buildScreen = (over = {}) => buildSiteRuleRequest(input({ rule: screenRule(), screenAvailable: true, ...over }));
const invalid = action => assert.throws(action, { code: 'INVALID_INPUT', path: '$.observation.screen' });
const admit = request => { assert.ok(request); assert.doesNotThrow(() => validateSiteRuleRequest(structuredClone(request), NOW)); return request; };
function crc32(data) {
  let value = -1;
  for (const byte of data) { value ^= byte; for (let i = 0; i < 8; i++) value = value >>> 1 ^ (value & 1 ? 0xedb88320 : 0); }
  return (value ^ -1) >>> 0;
}
// A harmless tEXt chunk grows the invented PNG without altering its dimensions.
function paddedPng(size) {
  const text = Buffer.alloc(size - PNG.length - 12, 97);
  text[0] = 107; text[1] = 0;
  const type = Buffer.from('tEXt');
  const length = Buffer.alloc(4); length.writeUInt32BE(text.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([type, text])));
  return Buffer.concat([PNG.subarray(0, -12), length, type, text, crc, PNG.subarray(-12)]);
}

test('legacy v1 rules retain their exact normalized shape and Jev wire default', () => {
  const legacy = rule();
  assert.deepEqual(validateSiteRule(legacy), legacy);
  assert.equal(Object.hasOwn(validateSiteRule(legacy), 'provider'), false);
  const created = newRule({ now: NOW, id: 'r_newrule', hosts: ['x.com'] });
  assert.equal(created.observation, 'none'); assert.equal(Object.hasOwn(created, 'provider'), false);
  const request = admit(buildSiteRuleRequest(input()));
  assert.equal(Object.hasOwn(request, 'provider'), false);
  assert.equal(request.state.observation.level, 'outline');
});

test('explicit provider survives rule-store serialization and is per-rule, never an argument override', () => {
  for (const provider of ['jev', 'openai']) {
    const stored = validateRuleStore({ ...DEFAULT_RULE_STORE, rules: [rule({ provider })] });
    const restored = validateRuleStore(JSON.parse(JSON.stringify(stored)));
    assert.equal(restored.rules[0].provider, provider); assert.ok(Object.isFrozen(restored.rules[0]));
    const request = admit(buildSiteRuleRequest(input({ rule: restored.rules[0], provider: provider === 'jev' ? 'openai' : 'jev' })));
    assert.equal(request.provider, provider); assert.equal(Object.hasOwn(request.state.rule, 'provider'), false);
  }
  assert.equal(DEFAULT_RULE_STORE.jev.consent, false, 'selection never changes the existing consent default');
});

test('unknown or malformed provider is rejected by rule and rule-store validation', () => {
  for (const provider of [undefined, null, '', 'Jev', 'anthropic', 1, true, {}, [], '__proto__']) {
    assert.throws(() => validateSiteRule(rule({ provider })), { code: 'INVALID_RULE', path: '$.provider' });
    assert.throws(() => validateRuleStore({ ...DEFAULT_RULE_STORE, rules: [rule({ provider })] }), { code: 'INVALID_RULE_STORE', path: '$.rules[0].provider' });
  }
});

test('screen is explicit rule policy; rule storage never accepts an image payload', () => {
  assert.equal(validateSiteRule(screenRule()).observation, 'screen');
  assert.throws(() => validateSiteRule({ ...screenRule(), screen: image() }), { code: 'INVALID_RULE', path: '$.screen' });
  assert.throws(() => validateSiteRule({ ...screenRule(), screenAvailable: true }), { code: 'INVALID_RULE', path: '$.screenAvailable' });
});

test('all sensitive screen rules cap to address even after an explicit outline raise', () => {
  for (const host of ['mijn.ing.nl', 'agency.gov', 'accounts.google.com', 'www.nhs.uk', 'my.1password.com']) {
    const r = screenRule({ match: { hosts: [host] }, observation_raised_hosts: [host] });
    assert.equal(effectiveObservation(r, host), 'address', host);
    const request = admit(buildScreen({ rule: r, screenAvailable: false,
      observation: { url: `https://${host}/page`, title: 'Page', screen: { rejected: true } } }));
    assert.deepEqual(Object.keys(request.state.observation), ['level', 'address']);
    assert.equal(request.provider, 'openai');
  }
  assert.equal(effectiveObservation(screenRule(), 'x.com'), 'screen');
  assert.equal(effectiveObservation(screenRule(), 'outside.test'), 'none');
  const outline = rule({ match: { hosts: ['mijn.ing.nl'] }, observation_raised_hosts: ['mijn.ing.nl'] });
  assert.equal(effectiveObservation(outline, 'mijn.ing.nl'), 'outline', 'legacy outline override is preserved');
});

test('screen construction denies missing or non-boolean availability and unsupported providers without inspecting the payload', () => {
  const observation = { url: 'https://x.com/', title: '' };
  Object.defineProperty(observation, 'screen', { get() { assert.fail('unavailable capture payload inspected'); } });
  assert.equal(buildSiteRuleRequest(input({ rule: screenRule(), observation })), null);
  for (const screenAvailable of [false, undefined, null, 1, 'true', {}]) assert.equal(buildScreen({ observation, screenAvailable }), null);
  for (const provider of ['jev', undefined]) {
    const r = screenRule(); if (provider === undefined) delete r.provider; else r.provider = provider;
    assert.equal(buildScreen({ rule: r, observation }), null);
  }
});

test('a trusted fake screen opt-in produces an exact, immutable host-valid request without retaining the caller object', () => {
  const supplied = image();
  const request = admit(buildScreen({ observation: { url: 'https://x.com/a?secret=omitted#fragment', title: '  Current\n page  ', screen: supplied, outline: [{ kind: 'heading', text: 'not collected for this seam' }] } }));
  assert.equal(request.provider, 'openai'); assert.equal(request.state.observation.level, 'screen');
  assert.deepEqual(request.state.observation.address, { origin: 'https://x.com', path: '/a', title: 'Current page' });
  assert.deepEqual(Object.keys(request.state.observation), ['level', 'address', 'screen']);
  assert.deepEqual(request.state.observation.screen, supplied);
  assert.notEqual(request.state.observation.screen, supplied); assert.ok(Object.isFrozen(request.state.observation.screen));
  assert.equal(Object.isFrozen(supplied), false);
  supplied.data_base64 = 'modified'; assert.equal(request.state.observation.screen.data_base64, PNG.toString('base64'));
  assert.doesNotMatch(JSON.stringify(request), /secret|fragment|not collected/);
});

test('address, outline, none and capped screen never smuggle or inspect supplied images', () => {
  const observation = { url: 'https://x.com/', title: '' };
  Object.defineProperty(observation, 'screen', { get() { assert.fail('image inspected outside screen permission'); } });
  for (const level of ['none', 'address', 'outline']) {
    const request = buildScreen({ rule: screenRule({ observation: level }), observation });
    if (level === 'none') assert.equal(request, null);
    else { admit(request); assert.equal(Object.hasOwn(request.state.observation, 'screen'), false); }
  }
  const bank = screenRule({ match: { hosts: ['mijn.ing.nl'] } });
  observation.url = 'https://mijn.ing.nl/';
  const capped = admit(buildScreen({ rule: bank, observation }));
  assert.equal(capped.state.observation.level, 'address');
});

test('PNG admission rejects exact-shape, mime, dimensions, base64, signature and IHDR failures', () => {
  const wrongSignature = Buffer.from(PNG); wrongSignature[0] = 0;
  const wrongLength = Buffer.from(PNG); wrongLength.writeUInt32BE(12, 8);
  const wrongType = Buffer.from(PNG); wrongType[12] = 0;
  const missing = image(); delete missing.height;
  const cases = [null, [], {}, missing, { ...image(), url: 'https://x.com' }, image(PNG, { mime: 'image/jpeg' }),
    image(PNG, { width: 0 }), image(PNG, { height: 1281 }), image(PNG, { width: 1.5 }), image(PNG, { width: 2 }),
    image(PNG, { data_base64: '' }), image(PNG, { data_base64: '!!!!' }), image(PNG, { data_base64: 7 }),
    image(PNG, { data_base64: PNG.toString('base64').slice(0, -1) }), image(PNG, { data_base64: PNG.toString('base64')+'\n' }),
    image(PNG, { data_base64: PNG.toString('base64')+'====' }), image(Buffer.alloc(32)), image(wrongSignature), image(wrongLength), image(wrongType)];
  for (const screen of cases) invalid(() => buildScreen({ observation: { url: 'https://x.com/', title: '', screen } }));
});

test('decoded one-MiB boundary uses the raised screen state cap; over-bound images fail', () => {
  const boundary = paddedPng(1048576); assert.equal(boundary.length, 1048576);
  const request = admit(buildScreen({ observation: { url: 'https://x.com/', title: '', screen: image(boundary) } }));
  const size = Buffer.byteLength(JSON.stringify(request.state)); assert.ok(size > 65536 && size <= 1572864);
  invalid(() => buildScreen({ observation: { url: 'https://x.com/', title: '', screen: image(paddedPng(1048577)) } }));
});

test('screen does not bypass disabled rule, unmatched host, empty effects, deadlines or HTTP-only admission', () => {
  for (const over of [{ enabled: false }, { effects: [] }, { match: { hosts: ['outside.test'] } }]) assert.equal(buildScreen({ rule: screenRule(over) }), null);
  for (const url of ['about:blank', 'file:///fixture', 'invalid']) assert.equal(buildScreen({ observation: { url, title: '', screen: image() } }), null);
  assert.throws(() => buildScreen({ timeoutMs: 30001 }), { code: 'INVALID_INPUT' });
  assert.equal(buildScreen({ timeoutMs: 1 }).deadline_ms, NOW+1);
});

test('additive persisted contract keeps provider optional and agrees with the package observation set', async () => {
  const schema = JSON.parse(await readFile(new URL('../../../contracts/site-rule-v1.schema.json', import.meta.url), 'utf8'));
  assert.deepEqual(schema.$defs.siteRule.properties.provider.enum, ['jev', 'openai']);
  assert.equal(schema.$defs.siteRule.properties.provider.default, 'jev');
  assert.equal(schema.$defs.siteRule.required.includes('provider'), false);
  assert.deepEqual(schema.$defs.observation.enum, ['none', 'address', 'outline', 'screen']);
});
