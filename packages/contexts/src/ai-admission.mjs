/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Data-only admission for a CURRENT top-level Gecko document; the caller
// supplies privileged browser/load metadata; page content cannot supply it.
const KEYS = Object.freeze(['isPrivate', 'policyBlocked', 'userAuthorized', 'consentGranted', 'topLevel', 'isCurrentGlobal', 'loadComplete',
  'browsingContextId', 'expectedBrowsingContextId', 'innerWindowId', 'expectedInnerWindowId', 'url', 'channelStatus',
  'failedChannelStatus', 'isErrorPage', 'observation', 'subframesVerifiedSafe']);
const verdict = (allowed, reason) => Object.freeze({ allowed, reason });
const identity = v => Number.isSafeInteger(v) && v > 0;
export function aiAdmission(input) {
  let metadata;
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input)
      || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) return verdict(false, 'INVALID_METADATA');
    const descriptors = Object.getOwnPropertyDescriptors(input), names = Reflect.ownKeys(descriptors);
    if (names.length !== KEYS.length || names.some(k => typeof k !== 'string' || !KEYS.includes(k))
      || KEYS.some(k => !Object.hasOwn(descriptors, k) || !Object.hasOwn(descriptors[k], 'value'))) return verdict(false, 'INVALID_METADATA');
    // Copy passive own values once; getters, inherited metadata and URL
    // conversion hooks cannot change the admitted document during validation.
    metadata = Object.fromEntries(KEYS.map(k => [k, descriptors[k].value]));
  } catch { return verdict(false, 'INVALID_METADATA'); }
  if (metadata.isPrivate !== false) return verdict(false, 'PRIVATE_OR_UNKNOWN');
  if (metadata.policyBlocked !== false) return verdict(false, 'BLOCKED_OR_UNKNOWN');
  if (metadata.userAuthorized !== true || metadata.consentGranted !== true) return verdict(false, 'NOT_AUTHORIZED');
  if (metadata.topLevel !== true || metadata.isCurrentGlobal !== true || metadata.loadComplete !== true) return verdict(false, 'LOAD_UNVERIFIED');
  if (!identity(metadata.browsingContextId) || metadata.browsingContextId !== metadata.expectedBrowsingContextId
    || !identity(metadata.innerWindowId) || metadata.innerWindowId !== metadata.expectedInnerWindowId) return verdict(false, 'STALE_DOCUMENT');
  if (metadata.isErrorPage !== false) return verdict(false, 'ERROR_DOCUMENT');
  // Unknown-host alone does not prove a family category block. Deny every
  // failed channel/error document instead of assigning categories to pages.
  if (metadata.failedChannelStatus !== null || metadata.channelStatus !== 0) return verdict(false, 'FAILED_OR_UNKNOWN_CHANNEL');
  if (!['address', 'outline', 'screen'].includes(metadata.observation)) return verdict(false, 'OBSERVATION_DISABLED');
  if (['outline', 'screen'].includes(metadata.observation) && metadata.subframesVerifiedSafe !== true) return verdict(false, 'SUBFRAMES_UNVERIFIED');
  if (typeof metadata.url !== 'string' || metadata.url.length > 2048 || /[\u0000-\u0020\u007f]/u.test(metadata.url)) return verdict(false, 'UNSUPPORTED_URL');
  let page;
  try { page = new URL(metadata.url); } catch { return verdict(false, 'UNSUPPORTED_URL'); }
  if (!['http:', 'https:'].includes(page.protocol) || page.username || page.password) return verdict(false, 'UNSUPPORTED_URL');
  return verdict(true, 'ADMITTED');
}
