/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free record/cache logic. Only the privileged service may supply detector
// results, window/tab provenance, token generation or container assignment.
// Actor-facing mutations never accept roots, detector fields or container IDs.
export const PROJECT_STATE_LIMITS = Object.freeze({ snapshots: 32, offers: 32,
  snapshotTtlMs: 300000, offerTtlMs: 120000, entryBytes: 262144 });
export class ProjectRecordError extends Error {
  constructor(code) { super(code); this.name = "ProjectRecordError"; this.code = code; }
}
const fail = code => { throw new ProjectRecordError(code); };
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const keys = (value, allowed, required = allowed) => {
  if (!plain(value) || Object.keys(value).some(key => !allowed.includes(key))
    || required.some(key => !Object.hasOwn(value, key))) fail("INVALID_INPUT");
};
const pathValue = path => typeof path === "string" && path.startsWith("/") && path.length > 1 && path.length <= 4096
  && !/[\u0000-\u001f\u007f]/u.test(path) && !path.split("/").some(part => part === "." || part === "..");
const tokenValue = token => typeof token === "string" && /^[A-Za-z0-9_-]{32,128}$/u.test(token);
const tabValue = tab => (Number.isSafeInteger(tab) && tab > 0)
  || (typeof tab === "string" && /^[A-Za-z0-9_.:-]{1,160}$/u.test(tab));
const cap = (value, fallback) => Number.isSafeInteger(value) && value >= 1 ? Math.min(value, fallback) : fallback;
const bytes = value => { const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > PROJECT_STATE_LIMITS.entryBytes ? Infinity : new TextEncoder().encode(text).byteLength; };
const urlValue = value => {
  if (typeof value !== "string" || value.length > 65536) fail("INVALID_URL");
  let url;
  try { url = new URL(value); } catch { fail("INVALID_URL"); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) fail("INVALID_URL");
  return url.href;
};

export function createProjectRecords({ core, clock, newToken, browserContainerFor,
  maxSnapshots, maxOffers, snapshotTtlMs, offerTtlMs } = {}) {
  for (const name of ["upgradeProject", "validateProject", "validateManifest", "validateDetectionDraft", "assertNoSecrets", "parseManifest", "serializeManifest", "validateHostPattern", "validateAccountLabel", "loopbackPort"]) {
    if (typeof core?.[name] !== "function") throw new TypeError(`core.${name}`);
  }
  if (typeof clock !== "function" || typeof newToken !== "function") throw new TypeError("clock/newToken");
  const limits = { snapshots: cap(maxSnapshots, PROJECT_STATE_LIMITS.snapshots), offers: cap(maxOffers, PROJECT_STATE_LIMITS.offers),
    snapshotTtl: cap(snapshotTtlMs, PROJECT_STATE_LIMITS.snapshotTtlMs), offerTtl: cap(offerTtlMs, PROJECT_STATE_LIMITS.offerTtlMs) };
  const snapshots = new Map(), offers = new Map(), recentTokens = new Map();
  const now = () => { const value = clock(); if (!Number.isSafeInteger(value) || value < 0) fail("INVALID_TIME"); return value; };
  const expires = (at, ttl) => { const value = at + ttl; if (!Number.isSafeInteger(value)) fail("INVALID_TIME"); return value; };
  const prune = at => {
    for (const map of [snapshots, offers, recentTokens]) for (const [key, value] of map) if (value.expiresAt <= at) map.delete(key);
  };
  const insert = (map, key, value, capacity) => {
    map.delete(key); map.set(key, value);
    while (map.size > capacity) map.delete(map.keys().next().value);
  };

  function rememberDetection(result) {
    keys(result, ["root", "canonicalRoot", "detectedAt", "draft", "manifestText"]);
    const at = now(); prune(at);
    if (!pathValue(result.root) || !pathValue(result.canonicalRoot) || !Number.isSafeInteger(result.detectedAt)
      || result.detectedAt < 0 || result.detectedAt > at || (result.manifestText !== null && typeof result.manifestText !== "string")) fail("INVALID_DETECTION");
    const draft = core.validateDetectionDraft(result.draft);
    if (draft.version !== 3 || bytes(draft) > PROJECT_STATE_LIMITS.entryBytes
      || (result.manifestText !== null && bytes(result.manifestText) > PROJECT_STATE_LIMITS.entryBytes)) fail("INVALID_DETECTION");
    const value = Object.freeze({ root: result.root, canonicalRoot: result.canonicalRoot, detectedAt: result.detectedAt,
      draft, manifestText: result.manifestText, expiresAt: expires(at, limits.snapshotTtl) });
    insert(snapshots, result.root, value, limits.snapshots);
    return draft;
  }

  function detectionFor(root, canonicalRoot) {
    prune(now());
    const value = snapshots.get(root);
    if (!value) return null;
    if (value.canonicalRoot !== canonicalRoot) fail("ROOT_CHANGED");
    return value;
  }

  function createRecord(options) {
    keys(options, ["id", "root", "canonicalRoot", "manifest", "contextUuid"], ["id", "root", "canonicalRoot", "manifest"]);
    if (!pathValue(options.root) || !pathValue(options.canonicalRoot)) fail("INVALID_ROOT");
    const manifest = core.validateManifest(options.manifest); core.assertNoSecrets(manifest);
    const snapshot = detectionFor(options.root, options.canonicalRoot);
    let external = false;
    if (snapshot?.manifestText) {
      try { external = core.serializeManifest(core.parseManifest(snapshot.manifestText)) === core.serializeManifest(manifest); }
      catch { /* invalid external manifest is not adopted */ }
    }
    const at = now();
    const base = core.upgradeProject({ version: 1, id: options.id, root: options.canonicalRoot,
      manifest, manifest_state: external ? "external" : "none", context_uuid: options.contextUuid ?? null,
      trusted: false, created_at: at, updated_at: at });
    if (!snapshot) return base;
    const { integrations, platforms, domains, agents } = snapshot.draft;
    return core.validateProject({ ...base, detected: { at: snapshot.detectedAt, integrations, platforms, domains, agents } });
  }

  function refreshedRecord(record, { root, canonicalRoot }) {
    const existing = core.upgradeProject(record);
    if (canonicalRoot !== existing.root) fail("ROOT_CHANGED");
    const snapshot = detectionFor(root, canonicalRoot);
    if (!snapshot) fail("NO_DETECTION");
    const { integrations, platforms, domains, agents } = snapshot.draft;
    return core.validateProject({ ...existing, detected: { at: snapshot.detectedAt, integrations, platforms, domains, agents }, updated_at: now() });
  }

  function applyUserPatch(record, patch) {
    keys(patch, ["accounts", "shared_sites"], []);
    if (!Object.keys(patch).length) fail("INVALID_PROJECT_PATCH");
    return core.validateProject({ ...core.upgradeProject(record), ...patch, updated_at: now() });
  }
  function withAccountLabel(record, account) {
    keys(account, ["key", "label"]);
    const { key, label } = account;
    const existing = core.upgradeProject(record);
    const normalized = core.INTEGRATION_IDS.includes(key) ? key : core.validateHostPattern(key);
    const accounts = existing.accounts.filter(account => account.key !== normalized);
    if (label !== null) accounts.push({ key: normalized, label: core.validateAccountLabel(label) });
    return applyUserPatch(existing, { accounts });
  }
  function withSharedSites(record, sites) {
    keys(sites, ["hosts", "confirmed"]);
    return applyUserPatch(record, { shared_sites: sites });
  }
  function withBrowserAssignedContainer(record, userContextId, assignment) {
    keys(assignment, ["expectedUserContextId"]);
    const existing = core.upgradeProject(record);
    const expected = assignment.expectedUserContextId;
    if (expected !== null && (!Number.isSafeInteger(expected) || expected < 1 || expected > core.MAX_USER_CONTEXT_ID)) fail("INVALID_INPUT");
    if (existing.container.user_context_id !== expected) return null;
    return core.validateProject({ ...existing, container: { user_context_id: userContextId }, updated_at: now() });
  }
  async function withBrowserContainer(record) {
    if (typeof browserContainerFor !== "function") fail("CONTAINER_UNAVAILABLE");
    const existing = core.upgradeProject(record);
    // No actor parameter supplies an identity id; this callback is service-owned.
    const userContextId = await browserContainerFor(existing);
    return withBrowserAssignedContainer(existing, userContextId, { expectedUserContextId: existing.container.user_context_id });
  }

  function binding(value) {
    keys(value, ["tabId", "url", "windowKey", "isPrivate", "canonicalRoot"], ["tabId", "url", "windowKey", "isPrivate"]);
    if (value.isPrivate !== false || !tabValue(value.tabId) || (typeof value.windowKey !== "object" && typeof value.windowKey !== "function")
      || value.windowKey === null) fail("INVALID_ARRIVAL_BINDING");
    return { ...value, url: urlValue(value.url) };
  }
  function issueArrival(value) {
    keys(value, ["root", "canonicalRoot", "tabId", "url", "windowKey", "isPrivate"]);
    if (!pathValue(value.root) || !pathValue(value.canonicalRoot) || value.root !== value.canonicalRoot) fail("INVALID_ROOT");
    const verified = binding({ tabId: value.tabId, url: value.url, windowKey: value.windowKey, isPrivate: value.isPrivate });
    if (core.loopbackPort(verified.url) === null) fail("INVALID_URL");
    const at = now(); prune(at);
    const token = newToken();
    if (!tokenValue(token) || recentTokens.has(token)) fail("INVALID_TOKEN_SOURCE");
    const expiresAt = expires(at, limits.offerTtl);
    const offer = Object.freeze({ ...verified, root: value.root, canonicalRoot: value.canonicalRoot, issuedAt: at, expiresAt });
    insert(offers, token, offer, limits.offers);
    // Retain bounded replay/collision protection for recently consumed tokens.
    insert(recentTokens, token, Object.freeze({ expiresAt }), limits.offers * 4);
    return Object.freeze({ token, root: offer.root, expiresAt });
  }
  function inspectArrival(token, suppliedBinding) {
    prune(now());
    if (!tokenValue(token) || !offers.has(token)) fail("UNKNOWN_ARRIVAL");
    const verified = binding(suppliedBinding), offer = offers.get(token);
    if (offer.windowKey !== verified.windowKey || offer.tabId !== verified.tabId || offer.url !== verified.url) fail("STALE_ARRIVAL");
    if (verified.canonicalRoot !== undefined && verified.canonicalRoot !== offer.canonicalRoot) fail("ROOT_CHANGED");
    // The window capability is compared privately and is never returned to content.
    return Object.freeze({ root: offer.root, canonicalRoot: offer.canonicalRoot, url: offer.url,
      tabId: offer.tabId, issuedAt: offer.issuedAt, expiresAt: offer.expiresAt });
  }
  function consumeArrival(token, suppliedBinding) {
    const offer = inspectArrival(token, suppliedBinding);
    offers.delete(token); return offer;
  }
  function discardTab(windowKey, tabId) {
    for (const [token, offer] of offers) if (offer.windowKey === windowKey && offer.tabId === tabId) offers.delete(token);
  }
  function discardWindow(windowKey) {
    for (const [token, offer] of offers) if (offer.windowKey === windowKey) offers.delete(token);
  }
  return Object.freeze({ rememberDetection, detectionFor, createRecord, refreshedRecord, applyUserPatch,
    withAccountLabel, withSharedSites, withBrowserContainer, withBrowserAssignedContainer, issueArrival, inspectArrival, consumeArrival, discardTab, discardWindow });
}
