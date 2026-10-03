/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Which AI providers are connected, in one honest status model shared by the
// Settings window (providers-settings.xhtml) and about:axiosozo ("AI & keys").
//
// Inputs are installation metadata only (provider-host `discover`: no client is
// executed, no sign-in is checked) and Keychain *presence* checks for the
// decision-provider keys (ProviderKeys `exists`: an exit status, never the
// secret). Nothing here starts a provider client, opens login UI or calls Jev or
// OpenAI. Model turns through this browser have not been verified yet, so no
// client is ever reported `ready`; product decision calls are NOT_AUTHORIZED, so
// a stored key is never reported ready either.

import { discoverForSettings } from "./ProviderSettings.sys.mjs";
import { DECISION_KEY_CODES, DECISION_KEY_PREFS, DECISION_KEY_PROVIDERS, decisionKeyEntryEnabled, decisionKeyStatus,
  removeDecisionKey, storeDecisionKey, validateDecisionKey } from "./ProviderKeys.sys.mjs";
import { createNativeDecisionKeyFixtureRuntime } from "./KeyFixtureNativeConfig.sys.mjs";

/** Exact client versions the live routes accept (packages/provider-host/src/live.mjs LIVE_VERSIONS). */
export const LIVE_VERSIONS = Object.freeze({ codex: "0.157.1", "claude-code": "2.1.283" });
export const JEV_MODEL = "jev-1.13.0";
export const DECISION_PROVIDERS = DECISION_KEY_PROVIDERS;
/** Product decision calls in this build (decision-v1: the browser host disables live authorization). */
export const DECISION_CALLS = "NOT_AUTHORIZED";
export const OPENAI_SHAPE_STATUS = "UNVERIFIED_SHAPE";

export const STATES = Object.freeze(["ready", "unverified", "not-installed", "unavailable", "needs-key",
  "key-stored", "disabled", "unknown"]);
/** Short user-facing label per state. */
export const STATE_LABELS = Object.freeze({
  ready: "Ready",
  unverified: "Installed · not yet verified",
  "not-installed": "Not installed",
  unavailable: "Unavailable in this build",
  "needs-key": "No key stored",
  "key-stored": "Key stored",
  disabled: "Turned off",
  unknown: "Status unknown",
});
export const SIGN_IN = Object.freeze(["handled-by-client-on-first-question", "codex-login-once", "api-key",
  "not-applicable"]);
export const SIGN_IN_LABELS = Object.freeze({
  "handled-by-client-on-first-question": "Uses your existing Claude Code sign-in. It is checked by the official client when you send your first question.",
  "codex-login-once": "Sign in once with the official Codex client for this browser (the command is shown in Provider settings). It is checked when you send your first question.",
  "api-key": "Uses an API key stored in the macOS Keychain.",
  "not-applicable": "No sign-in applies.",
});
const LABELS = Object.freeze({ codex: "Codex", "claude-code": "Claude Code", antigravity: "Antigravity", jev: "Jev", openai: "OpenAI" });
const CLIENTS = Object.freeze(["codex", "claude-code", "antigravity"]);
const NOT_VERIFIED = "A real answer through this browser has not been verified yet.";

function entry(fields) {
  return Object.freeze({ verified: false, ...fields, state_label: STATE_LABELS[fields.state] });
}

/** One official-client provider from validated discovery (ProviderSettings.validateDiscovery), or null. */
export function clientStatus(driver, provider) {
  const label = LABELS[driver];
  const base = { id: driver, label, route: "official-client", expected_version: LIVE_VERSIONS[driver] ?? null };
  if (!provider) {
    return entry({ ...base, installed: null, version: null, sign_in: "not-applicable", state: "unknown",
      detail: `Could not read installation metadata for ${label}. No client was started.` });
  }
  const version = provider.client_version ?? null;
  if (!provider.installed) {
    return entry({ ...base, installed: false, version: null, sign_in: "not-applicable", state: "not-installed",
      detail: `The official ${label} client was not found. Install it to ask ${label} questions; browsing does not need it.` });
  }
  if (driver === "antigravity") {
    return entry({ ...base, installed: true, version, sign_in: "not-applicable", state: "unavailable",
      detail: "Installed, but unavailable in this build: Antigravity startup and tool isolation have not been verified. Use Codex or Claude Code." });
  }
  if (version !== LIVE_VERSIONS[driver]) {
    return entry({ ...base, installed: true, version, sign_in: "not-applicable", state: "unavailable",
      detail: version
        ? `Installed version ${version}; this build works only with ${label} ${LIVE_VERSIONS[driver]}, so questions will be refused until the versions match.`
        : `Installed, but its version could not be read from installation metadata; this build works only with ${label} ${LIVE_VERSIONS[driver]}.` });
  }
  const sign_in = driver === "codex" ? "codex-login-once" : "handled-by-client-on-first-question";
  return entry({ ...base, installed: true, version, sign_in, state: "unverified",
    detail: `Installed (${version}). ${SIGN_IN_LABELS[sign_in]} ${NOT_VERIFIED}` });
}

// ---------------------------------------------------------------- decision keys

const aKey = (label, start = false) => `${start ? "A" : "a"}${/^[AEIOU]/u.test(label) ? "n" : ""} ${label} key`;
const UNKNOWN_REASONS = Object.freeze({
  KEYCHAIN_REFUSED: "The macOS Keychain refused the check; it may be locked.",
  HELPER_TIMEOUT: "The macOS Keychain did not respond in time.",
  HELPER_OUTPUT_LIMIT: "The Keychain helper answered unexpectedly.",
  SETTINGS_CLOSED: "The check was cancelled.",
});

function keyDetail(provider, state, entryOn, code) {
  const label = LABELS[provider];
  const pref = DECISION_KEY_PREFS[provider];
  switch (state) {
    case "key-stored": return `${aKey(label, true)} is stored in the macOS Keychain. It has not been used or checked: decision calls are not available in this build${
      provider === "openai" ? ", and OpenAI's decision format is not verified" : ""}.${
      entryOn ? "" : ` Adding or replacing a key is turned off (${pref}); you can still remove it.`}`;
    case "needs-key": return `No ${label} key is stored. A key is optional; browsing and site rules work without it. It is kept only in the macOS Keychain.`;
    case "disabled": return `No ${label} key is stored, and adding one is turned off in this build (${pref}).`;
    case "unavailable": return `The Keychain helper is not available in this build, so ${aKey(label)} cannot be stored, checked or removed here.`;
    default: return `Could not check the macOS Keychain for ${aKey(label)}. ${UNKNOWN_REASONS[code] ?? "Check again later."}`;
  }
}

/**
 * Presentation of one ProviderKeys.decisionKeyStatus answer
 * ({ provider, key_entry_enabled, key: stored|missing|unknown, error }). Storing is
 * gated by the provider's own key-entry pref; removal never is. A helper that is
 * unavailable is state `unavailable` with key `unknown`. Nothing is ever ready:
 * decision calls stay NOT_AUTHORIZED and OpenAI's shape stays UNVERIFIED_SHAPE.
 */
export function decisionKeyEntry({ provider, key_entry_enabled, key, error = null } = {}) {
  if (!DECISION_KEY_PROVIDERS.includes(provider)) throw new Error("INVALID_PROVIDER");
  const entryOn = key_entry_enabled === true;
  const presence = key === "stored" || key === "missing" ? key : "unknown";
  const code = presence === "unknown" && DECISION_KEY_CODES.includes(error) ? error : null;
  const helperMissing = code === "KEYCHAIN_HELPER_UNAVAILABLE";
  const state = presence === "stored" ? "key-stored" : presence === "missing" ? (entryOn ? "needs-key" : "disabled")
    : helperMissing ? "unavailable" : "unknown";
  return entry({ id: provider, label: LABELS[provider], route: "api-key", installed: null,
    version: provider === "jev" ? JEV_MODEL : null, expected_version: provider === "jev" ? JEV_MODEL : null,
    sign_in: "api-key", key_entry_enabled: entryOn, key: presence, error: code, state,
    can_store: entryOn && !helperMissing, can_remove: !helperMissing && presence !== "missing",
    calls: DECISION_CALLS, shape_status: provider === "openai" ? OPENAI_SHAPE_STATUS : null,
    detail: keyDetail(provider, state, entryOn, code) });
}

/** Legacy single Jev entry. `key` is "stored" | "missing" | null (not known), `keyError` a fixed code. */
export function jevStatus({ keyEntryEnabled, key = null, keyError = null } = {}) {
  return decisionKeyEntry({ provider: "jev", key_entry_enabled: keyEntryEnabled === true, key, error: keyError });
}

/**
 * Pure: the clients from validated discovery (or null). Decision keys are separate
 * (getDecisionKeyStatus); `jev` is the legacy single-entry input, kept for callers
 * that still pass one.
 */
export function buildProviderStatus({ discovery = null, discoveryError = null, jev = null } = {}) {
  const providers = CLIENTS.map(driver => clientStatus(driver, discovery?.find(item => item.driver === driver) ?? null));
  return Object.freeze({
    version: 1,
    discovery: discovery ? "ok" : "unavailable",
    discovery_error: discovery ? null : discoveryError ?? "DISCOVERY_FAILED",
    model_turns_verified: false,
    providers: Object.freeze(jev ? [...providers, jevStatus(jev)] : providers),
  });
}

const FIXED_CODE = /^[A-Z][A-Z0-9_]{2,80}$/u;
const codeOf = error => FIXED_CODE.test(error?.message ?? "") ? error.message : null;
/** Only ProviderKeys' fixed codes leave a key operation; anything else is the helper being unavailable. */
const keyCode = error => DECISION_KEY_CODES.includes(error?.code) ? error.code
  : DECISION_KEY_CODES.includes(error?.message) ? error.message : "KEYCHAIN_HELPER_UNAVAILABLE";
// A surface that closed meanwhile is the cause, whatever step refused (the fixture
// runtime reports its own refusal as an unavailable helper).
const outcome = (error, signal, isActive) => (surfaceActive(signal, isActive) ? keyCode(error) : "SETTINGS_CLOSED");
const defaultOps = Object.freeze({ discover: discoverForSettings });
// The privileged surface's choices only: never actor or page data.
const defaultKeyOps = Object.freeze({ runtime: createNativeDecisionKeyFixtureRuntime, status: decisionKeyStatus,
  store: storeDecisionKey, remove: removeDecisionKey });

/** Installation metadata only. Never rejects; never starts a client. */
export async function getProviderStatus({ runtime, signal, ops = defaultOps } = {}) {
  try { return buildProviderStatus({ discovery: await ops.discover(runtime, signal) }); }
  catch (error) { return buildProviderStatus({ discovery: null, discoveryError: codeOf(error) ?? "DISCOVERY_FAILED" }); }
}

function requireProvider(provider) {
  if (!DECISION_KEY_PROVIDERS.includes(provider)) throw new Error("INVALID_PROVIDER");
}

/**
 * The calling surface's authority: its own AbortSignal and one synchronous
 * isActive() minted by that privileged surface (the about:axiosozo actor or the
 * Settings dialog), never by page data. Required for every key operation here;
 * anything but a literal true is a closed surface.
 */
function surfaceActive(signal, isActive) {
  try { return !signal?.aborted && typeof isActive === "function" && isActive() === true; }
  catch { return false; }
}

/**
 * One freshly admitted runtime for exactly one helper operation. The factory
 * gets the same signal and isActive and checks them itself; this checks them
 * before and again after its asynchronous admission. null (no synthetic fixture
 * requested) lets ProviderKeys select the production helper itself, which it
 * refuses in a synthetic process or for a closed surface. A refused admission
 * never falls back to another helper.
 */
async function admit(keys, signal, isActive) {
  if (!surfaceActive(signal, isActive)) throw new Error("SETTINGS_CLOSED");
  let runtime;
  try { runtime = await keys.runtime({ signal, isActive }); }
  catch { throw new Error(surfaceActive(signal, isActive) ? "KEYCHAIN_HELPER_UNAVAILABLE" : "SETTINGS_CLOSED"); }
  if (!surfaceActive(signal, isActive)) throw new Error("SETTINGS_CLOSED");
  return runtime ?? undefined;
}

/** Presence of one provider's key, as a decisionKeyEntry. Never rejects for a known provider. */
export async function getDecisionKeyStatus(provider, { signal, isActive, prefs = globalThis.Services?.prefs, keys = defaultKeyOps } = {}) {
  requireProvider(provider);
  const key_entry_enabled = decisionKeyEntryEnabled(provider, prefs);
  let status;
  try {
    const runtime = await admit(keys, signal, isActive);
    status = await keys.status(provider, { runtime, signal, isActive, prefs });
  } catch (error) { status = { key: "unknown", error: outcome(error, signal, isActive) }; }
  // ProviderKeys reports a refused step as unknown presence; a closed surface is why.
  if (status?.key === "unknown" && !surfaceActive(signal, isActive)) status = { ...status, error: "SETTINGS_CLOSED" };
  return decisionKeyEntry({ ...status, key_entry_enabled, provider });
}

/**
 * Explicit user action. Refused before any fixture admission or helper process
 * when key entry is off or the key is invalid. The key goes only to the helper's
 * stdin (ProviderKeys, which rechecks isActive immediately before writing); the
 * reference is dropped on every path. Resolves with the refreshed entry, read
 * through a new runtime under the same authority (never the key); rejects with a
 * fixed code only. Storing never changes consent and calls no provider.
 */
export async function storeDecisionKeyAndReport(provider, secret, { signal, isActive, prefs = globalThis.Services?.prefs, keys = defaultKeyOps } = {}) {
  try {
    requireProvider(provider);
    if (!decisionKeyEntryEnabled(provider, prefs)) throw new Error("KEY_ENTRY_DISABLED");
    if (!validateDecisionKey(secret)) throw new Error("INVALID_KEY");
    const runtime = await admit(keys, signal, isActive);
    await keys.store(provider, secret, { runtime, signal, isActive, prefs });
  } catch (error) { throw new Error(outcome(error, signal, isActive)); }
  finally { secret = ""; }
  return getDecisionKeyStatus(provider, { signal, isActive, prefs, keys });
}

/** Explicit user action. Allowed while key entry is off. Resolves with the refreshed entry. */
export async function removeDecisionKeyAndReport(provider, { signal, isActive, prefs = globalThis.Services?.prefs, keys = defaultKeyOps } = {}) {
  try {
    requireProvider(provider);
    const runtime = await admit(keys, signal, isActive);
    await keys.remove(provider, { runtime, signal, isActive });
  } catch (error) { throw new Error(outcome(error, signal, isActive)); }
  return getDecisionKeyStatus(provider, { signal, isActive, prefs, keys });
}

/**
 * User-facing sentence for a key action failure code (overview-model.mjs keeps
 * the same sentences). Only refusals before any helper work say nothing changed.
 * A helper, timeout, output, cancel or page failure can follow the dispatch, so
 * those say the change could not be confirmed: never a rollback, never a retry.
 */
export function keychainErrorText(code) {
  switch (code) {
    case "INVALID_KEY": return "Key not stored. Paste the whole key on one line: 8 to 4096 bytes.";
    case "KEY_ENTRY_DISABLED":
    case "JEV_KEY_ENTRY_DISABLED": return "Key not stored. Adding a key is turned off in this build.";
    case "INVALID_PROVIDER": return "That provider is not supported. Nothing was changed.";
    case "KEYCHAIN_HELPER_UNAVAILABLE": return "The Keychain helper was not available or did not finish, so the change could not be confirmed.";
    case "KEYCHAIN_REFUSED": return "The macOS Keychain refused the change. Unlock the Keychain and try again.";
    case "HELPER_TIMEOUT": return "The macOS Keychain did not respond in time, so the change could not be confirmed.";
    case "HELPER_OUTPUT_LIMIT": return "The Keychain helper answered unexpectedly, so the change could not be confirmed.";
    case "SETTINGS_CLOSED": return "Cancelled before it finished, so the change could not be confirmed.";
    case "BUSY": return "A change to this key is still running. Wait for it to finish.";
    case "PRIVATE_WINDOW": return "Keys are managed from a normal window, never a private one.";
    case "NO_WINDOW": return "Open this page in a browser window first.";
    case "DOCUMENT_GONE": return "This page changed before the Keychain answered, so the change could not be confirmed. Check again.";
    default: return "The Keychain change could not be confirmed.";
  }
}
