/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Which AI providers are connected, in one honest status model shared by the
// Settings window (providers-settings.xhtml) and about:axiosozo ("AI & keys").
//
// Inputs are installation metadata only (provider-host `discover`: no client is
// executed, no sign-in is checked) and a Keychain *presence* check for the Jev
// key (helper `exists`: an exit status, never the secret). Nothing here starts
// a provider client, opens login UI or contacts Jev. Model turns through this
// browser have not been verified yet, so no client is ever reported `ready`.

import { discoverForSettings, jevKeyEntryEnabled, jevKeyPresence, storeJevKey as storeKey,
  removeJevKey as removeKey } from "./ProviderSettings.sys.mjs";

/** Exact client versions the live routes accept (packages/provider-host/src/live.mjs LIVE_VERSIONS). */
export const LIVE_VERSIONS = Object.freeze({ codex: "0.157.1", "claude-code": "2.1.283" });
export const JEV_MODEL = "jev-1.13.0";

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
const LABELS = Object.freeze({ codex: "Codex", "claude-code": "Claude Code", antigravity: "Antigravity", jev: "Jev" });
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

/**
 * Jev status. `key` is the presence result: "stored" | "missing" | null (not checked),
 * `keyError` a fixed KEYCHAIN_CODES code when the check failed.
 */
export function jevStatus({ keyEntryEnabled, key = null, keyError = null }) {
  const base = { id: "jev", label: LABELS.jev, route: "api-key", installed: null, version: JEV_MODEL,
    expected_version: JEV_MODEL, sign_in: "api-key", key_entry_enabled: keyEntryEnabled === true };
  const off = base.key_entry_enabled ? "" : " Adding a key is turned off in this build (axiosozo.jev.keyEntry.enabled).";
  if (key === "stored") {
    return entry({ ...base, key: "stored", state: "key-stored",
      detail: `A Jev key is stored in the macOS Keychain. Jev is called only when consent is on and a site rule allows it. Calls with this key have not been verified in this build.${off}` });
  }
  if (key === "missing") {
    return base.key_entry_enabled
      ? entry({ ...base, key: "missing", state: "needs-key",
        detail: "No Jev key is stored. Add one to let site rules ask Jev; it is kept only in the macOS Keychain. Browsing and site rules work without it." })
      : entry({ ...base, key: "missing", state: "disabled",
        detail: "Jev key entry is turned off in this build (axiosozo.jev.keyEntry.enabled) and no key is stored, so no Jev calls are made." });
  }
  if (keyError === "KEYCHAIN_HELPER_UNAVAILABLE") {
    return entry({ ...base, key: "unavailable", state: "unavailable",
      detail: "Keychain helper not available in this build. A Jev key cannot be stored, removed or checked here." });
  }
  return entry({ ...base, key: "unknown", state: "unknown",
    detail: "Could not check the macOS Keychain for a Jev key (the Keychain may be locked, or this build's Keychain helper predates the presence check)." });
}

/** Pure: the complete model from validated discovery (or null) and the Jev key presence. */
export function buildProviderStatus({ discovery = null, discoveryError = null, jev }) {
  const providers = CLIENTS.map(driver => clientStatus(driver, discovery?.find(item => item.driver === driver) ?? null));
  return Object.freeze({
    version: 1,
    discovery: discovery ? "ok" : "unavailable",
    discovery_error: discovery ? null : discoveryError ?? "DISCOVERY_FAILED",
    model_turns_verified: false,
    providers: Object.freeze([...providers, jevStatus(jev)]),
  });
}

const FIXED_CODE = /^[A-Z][A-Z0-9_]{2,80}$/u;
const codeOf = error => FIXED_CODE.test(error?.message ?? "") ? error.message : null;

async function presence(ops, runtime, signal) {
  try { return { key: await ops.presence(runtime, signal), keyError: null }; }
  catch (error) { return { key: null, keyError: codeOf(error) ?? "KEYCHAIN_HELPER_UNAVAILABLE" }; }
}
const defaultOps = { discover: discoverForSettings, presence: jevKeyPresence, store: storeKey, remove: removeKey };

/** Jev entry only (no discovery). Never rejects. */
export async function getJevKeyStatus({ runtime, prefs, signal, ops = defaultOps } = {}) {
  return jevStatus({ keyEntryEnabled: jevKeyEntryEnabled(prefs), ...await presence(ops, runtime, signal) });
}

/** Metadata discovery plus Jev key presence. Never rejects; never starts a client or calls Jev. */
export async function getProviderStatus({ runtime, prefs, signal, ops = defaultOps } = {}) {
  const discovered = (async () => {
    try { return { discovery: await ops.discover(runtime, signal) }; }
    catch (error) { return { discovery: null, discoveryError: codeOf(error) ?? "DISCOVERY_FAILED" }; }
  })();
  const [found, key] = await Promise.all([discovered, presence(ops, runtime, signal)]);
  return buildProviderStatus({ ...found, jev: { keyEntryEnabled: jevKeyEntryEnabled(prefs), ...key } });
}

/** Explicit user action. Stores the key via the helper's stdin, drops the reference and returns
 * the refreshed Jev entry (never the key). Rejects with a fixed code only. */
export async function storeJevKeyAndReport(secret, { runtime, prefs, signal, ops = defaultOps } = {}) {
  try { await ops.store(secret, runtime, signal, prefs); }
  catch (error) { throw new Error(codeOf(error) ?? "KEYCHAIN_HELPER_UNAVAILABLE"); }
  finally { secret = ""; }
  return getJevKeyStatus({ runtime, prefs, signal, ops });
}

/** Explicit user action. Removes the stored key and returns the refreshed Jev entry. */
export async function removeJevKeyAndReport({ runtime, prefs, signal, ops = defaultOps } = {}) {
  try { await ops.remove(runtime, signal); }
  catch (error) { throw new Error(codeOf(error) ?? "KEYCHAIN_HELPER_UNAVAILABLE"); }
  return getJevKeyStatus({ runtime, prefs, signal, ops });
}

/** User-facing sentence for a Keychain action failure code. */
export function keychainErrorText(code) {
  switch (code) {
    case "INVALID_KEY": return "Key not stored. Enter a key of 8–4096 characters on one line.";
    case "JEV_KEY_ENTRY_DISABLED": return "Jev key entry is turned off in this build.";
    case "KEYCHAIN_HELPER_UNAVAILABLE": return "Keychain helper not available in this build. Nothing was stored.";
    case "KEYCHAIN_REFUSED": return "The macOS Keychain refused the change. Unlock the Keychain and try again.";
    case "HELPER_TIMEOUT": return "The macOS Keychain did not respond in time. Nothing was confirmed.";
    case "PRIVATE_WINDOW": return "Keys cannot be changed from a private window.";
    default: return "The Keychain change did not complete.";
  }
}
