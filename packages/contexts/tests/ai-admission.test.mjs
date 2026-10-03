import test from 'node:test';
import assert from 'node:assert/strict';
import { aiAdmission } from '../src/ai-admission.mjs';
const document = () => ({ isPrivate: false, policyBlocked: false, userAuthorized: true, consentGranted: true,
  topLevel: true, isCurrentGlobal: true, loadComplete: true, browsingContextId: 7, expectedBrowsingContextId: 7,
  innerWindowId: 13, expectedInnerWindowId: 13, url: 'https://synthetic.example/page?test=1', channelStatus: 0,
  failedChannelStatus: null, isErrorPage: false, observation: 'address', subframesVerifiedSafe: false });
test('current authorized public address and top-level outline are admitted', () => {
  assert.deepEqual(aiAdmission(document()), { allowed: true, reason: 'ADMITTED' });
  assert.equal(aiAdmission({ ...document(), observation: 'outline', subframesVerifiedSafe: true }).allowed, true);
  assert.equal(Object.isFrozen(aiAdmission(document())), true);
});
test('private, blocked and missing metadata always deny before observation', () => {
  for (const change of [{ isPrivate: true }, { isPrivate: undefined }, { policyBlocked: true }, { policyBlocked: undefined }])
    assert.equal(aiAdmission({ ...document(), ...change }).allowed, false);
  assert.equal(aiAdmission(null).allowed, false); assert.equal(aiAdmission({ ...document(), pageText: 'synthetic' }).reason, 'INVALID_METADATA');
});
test('consent, authorization and observation are required', () => {
  for (const change of [{ userAuthorized: false }, { consentGranted: false }, { observation: 'none' }, { observation: 'invalid' }])
    assert.equal(aiAdmission({ ...document(), ...change }).allowed, false);
});
test('stale identities, BFCache and incomplete loads cannot be observed', () => {
  for (const change of [{ innerWindowId: 14 }, { browsingContextId: 8 }, { innerWindowId: 0 }, { isCurrentGlobal: false },
    { topLevel: false }, { loadComplete: false }]) assert.equal(aiAdmission({ ...document(), ...change }).allowed, false);
});
test('all failed/unknown channels and browser error documents deny without classification', () => {
  for (const change of [{ channelStatus: 1 }, { channelStatus: undefined }, { failedChannelStatus: 0 }, { failedChannelStatus: 2152398878 },
    { failedChannelStatus: undefined }, { isErrorPage: true }, { isErrorPage: undefined }])
    assert.equal(aiAdmission({ ...document(), ...change }).allowed, false);
  // A retained successful-looking attempted HTTP(S) URI cannot hide the error document.
  assert.equal(aiAdmission({ ...document(), url: 'https://blocked.example/', isErrorPage: true }).reason, 'ERROR_DOCUMENT');
});
test('internal error URLs, credential URLs and nonweb schemes are never admitted', () => {
  for (const url of ['about:blocked?u=https%3A%2F%2Fsynthetic.example', 'about:neterror', 'file:///synthetic', 'https://user:synthetic@synthetic.example/'])
    assert.equal(aiAdmission({ ...document(), url }).allowed, false);
});
test('outline and screen observation require verified included frame subtree metadata', () => {
  assert.equal(aiAdmission({ ...document(), observation: 'outline' }).reason, 'SUBFRAMES_UNVERIFIED');
  assert.equal(aiAdmission({ ...document(), observation: 'screen' }).reason, 'SUBFRAMES_UNVERIFIED');
  assert.equal(aiAdmission({ ...document(), observation: 'screen', subframesVerifiedSafe: true }).allowed, true);
});
test('missing individual privileged metadata fields fail closed', () => {
  const required = ['isPrivate', 'policyBlocked', 'userAuthorized', 'consentGranted', 'topLevel', 'isCurrentGlobal', 'loadComplete',
    'browsingContextId', 'expectedBrowsingContextId', 'innerWindowId', 'expectedInnerWindowId', 'url', 'channelStatus', 'failedChannelStatus', 'isErrorPage', 'observation'];
  for (const key of required) { const m = document(); delete m[key]; assert.equal(aiAdmission(m).allowed, false, key); }
});

test('inherited metadata, getters, proxies and URL conversion hooks cannot be admitted', () => {
  assert.equal(aiAdmission(Object.create(document())).allowed, false);
  const getter = { ...document() }; let called = false;
  Object.defineProperty(getter, 'isPrivate', { enumerable: true, get() { called = true; return false; } });
  assert.equal(aiAdmission(getter).allowed, false); assert.equal(called, false);
  const hook = { ...document(), url: { toString() { called = true; return 'https://synthetic.example/'; } } };
  assert.equal(aiAdmission(hook).allowed, false); assert.equal(called, false);
  assert.equal(aiAdmission(new Proxy(document(), { ownKeys() { throw new Error('SYNTHETIC'); } })).allowed, false);
});
