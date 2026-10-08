/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Which AI providers are connected, in one honest status model shared by the
// Settings window (providers-settings.xhtml) and about:axiosozo ("AI & keys").
//
// Official clients (Codex, Claude Code, Antigravity) are described from the provider
// host's capability check (`cli.mjs clients`, ProviderSettings.checkClientsForSettings):
// the installed client is run offline in the browser sandbox against a loopback stand-in
// model, so nothing is sent to a provider and no sign-in page opens. There is no version
// pin: any version that passes is "checked"; one that changed an option we use is
// "incompatible" and says which. When the check cannot run, installation metadata alone
// is shown ("not checked yet"). Decision-provider keys are Keychain *presence* checks
// (ProviderKeys `exists`: an exit status, never the secret). Nothing is reported `ready`:
// a model answer through this browser is not claimed by a check.

import { checkClientsForSettings, discoverForSettings } from "./ProviderSettings.sys.mjs";
import { DECISION_KEY_CODES, DECISION_KEY_PREFS, DECISION_KEY_PROVIDERS, decisionKeyEntryEnabled, decisionKeyStatus,
  removeDecisionKey, storeDecisionKey, validateDecisionKey } from "./ProviderKeys.sys.mjs";
import { createNativeDecisionKeyFixtureRuntime } from "./KeyFixtureNativeConfig.sys.mjs";

export const JEV_MODEL = "jev-1.13.0";
export const DECISION_PROVIDERS = DECISION_KEY_PROVIDERS;
/** Product decision calls in this build (decision-v1: the browser host disables live authorization). */
export const DECISION_CALLS = "NOT_AUTHORIZED";
export const OPENAI_SHAPE_STATUS = "UNVERIFIED_SHAPE";

export const STATES = Object.freeze(["ready", "checked", "needs-sign-in", "unverified", "not-installed", "incompatible",
  "unavailable", "needs-key", "key-stored", "disabled", "unknown"]);
/** Generic label per state; official clients get a specific label (with name and version) instead. */
export const STATE_LABELS = Object.freeze({
  ready: "Ready",
  checked: "Checked",
  "needs-sign-in": "Needs sign-in",
  unverified: "Installed · not checked yet",
  "not-installed": "Not installed",
  incompatible: "Changed an option we use",
  unavailable: "Unavailable in this build",
  "needs-key": "No key stored",
  "key-stored": "Key stored",
  disabled: "Turned off",
  unknown: "Status unknown",
});
export const SIGN_IN = Object.freeze(["client-sign-in", "needs-client-sign-in", "unsupported-account", "api-key", "not-applicable"]);
export const SIGN_IN_LABELS = Object.freeze({
  "client-sign-in": "Uses your existing sign-in in the official client. AxioSozo never opens a sign-in page or reads your credentials.",
  "needs-client-sign-in": "The official client is not signed in. Sign in there (in Terminal); AxioSozo never opens a sign-in page or reads your credentials.",
  "unsupported-account": "The official client is signed in with an account type Ask AI does not support.",
  "api-key": "Uses an API key stored in the macOS Keychain.",
  "not-applicable": "No sign-in applies.",
});
const LABELS = Object.freeze({ codex: "Codex", "claude-code": "Claude Code", antigravity: "Antigravity", jev: "Jev", openai: "OpenAI" });
const CLIENTS = Object.freeze(["codex", "claude-code", "antigravity"]);
const SIGN_IN_COMMANDS = Object.freeze({ codex: "run `codex login` in Terminal", "claude-code": "run `claude` in Terminal and sign in" });
const NOTHING_SENT = "Nothing was sent to a provider for this check.";

function entry(fields) {
  return Object.freeze({ verified: false, ...fields, state_label: fields.state_label ?? STATE_LABELS[fields.state] });
}
const named = (label, version) => (version ? `${label} ${version}` : label);
const isCheck = provider => typeof provider?.status === "string" && "sign_in" in provider && "reason_code" in provider;

function incompatibleLabel(label, version, check) {
  switch (check.reason_code) {
    case "OPTION_REJECTED": return `${label} changed an option we use (${check.reason_detail ?? "unknown option"})`;
    case "TOOLS_NOT_DISABLED": return `${named(label, version)} offers tools we cannot turn off`;
    case "INSTRUCTIONS_NOT_ISOLATED": return `${named(label, version)} would pass your own settings to Ask AI`;
    case "ANSWER_FORMAT_CHANGED": return `${named(label, version)} changed its answer format`;
    default: return `${named(label, version)} · not compatible`;
  }
}
function incompatibleWhy(label, check) {
  switch (check.reason_code) {
    case "OPTION_REJECTED": return `It no longer accepts ${check.reason_detail ?? "an option"}, which Ask AI needs`;
    case "TOOLS_NOT_DISABLED": return `With Ask AI's options it still offers the model tools (${check.reason_detail ?? "unknown"}), and Ask AI only uses ${label} without tools`;
    case "INSTRUCTIONS_NOT_ISOLATED": return `With Ask AI's options it still passes your own ${label} customizations (${check.reason_detail ?? "unknown"}) to the model`;
    case "ANSWER_FORMAT_CHANGED": return "AxioSozo could not read its answer";
    default: return "It did not pass the check";
  }
}
function unavailableDetail(driver, label, version, check) {
  switch (check.reason_code) {
    case "TOOLS_NOT_CONFINABLE": return `${named(label, version)} is installed, but Ask AI cannot use it: Antigravity has no option that turns off its tools (in a check it still offered the model 60 tools, including running commands and controlling a browser), and Ask AI only uses assistants without tools. Use Codex or Claude Code.`;
    case "MANAGED_POLICY": return `${label} is managed by an organisation policy, which can add hooks to every session. Ask AI supports personal ${label} installs only.`;
    case "UNSUPPORTED_PLATFORM": return "Ask AI currently needs macOS on Apple silicon.";
    case "BROKER_UNAVAILABLE": return `The browser sandbox for AI clients is not built in this browser, so ${label} cannot be used or checked.`;
    case "UNSUPPORTED_INSTALL": return `${label} is installed in a way AxioSozo cannot use: the program must be your own and not writable by other users.`;
    default: return `${label} cannot be used in this build.`;
  }
}

/** One official client from a validated capability check (ProviderSettings.validateClientChecks). */
function clientCheckStatus(driver, check) {
  const label = LABELS[driver]; const version = check.version ?? null;
  const base = { id: driver, label, route: "official-client", installed: check.installed, version, expected_version: null,
    check: check.status, checked_at: check.checked_at ?? null, reason_code: check.reason_code ?? null };
  switch (check.status) {
    case "not-installed":
      return entry({ ...base, installed: false, version: null, sign_in: "not-applicable", state: "not-installed",
        detail: `The official ${label} client was not found. Install it to ask ${label} questions; browsing does not need it.` });
    case "incompatible":
      return entry({ ...base, sign_in: "not-applicable", state: "incompatible", state_label: incompatibleLabel(label, version, check),
        detail: `${incompatibleWhy(label, check)}. Ask AI is off for ${named(label, version)} until AxioSozo is updated for it; ${label} itself keeps working outside the browser. ${NOTHING_SENT}` });
    case "unavailable":
      return entry({ ...base, sign_in: "not-applicable", state: "unavailable",
        state_label: driver === "antigravity" ? `${named(label, version)} · not usable for Ask AI` : STATE_LABELS.unavailable,
        detail: unavailableDetail(driver, label, version, check) });
    case "compatible": {
      const dropped = check.dropped_options?.length ? ` This version no longer has ${check.dropped_options.join(", ")}; it passed without ${check.dropped_options.length === 1 ? "it" : "them"}.` : "";
      const passed = `AxioSozo checked this ${label} install: it accepts the options Ask AI uses, offers the model no tools, and keeps your own ${label} settings, instructions and MCP servers out.${dropped} ${NOTHING_SENT}`;
      if (check.sign_in === "needs-sign-in") {
        return entry({ ...base, sign_in: "needs-client-sign-in", state: "needs-sign-in", state_label: `Needs sign-in in ${label}`,
          detail: `${named(label, version)} works with Ask AI but is not signed in: ${SIGN_IN_COMMANDS[driver]}, then check again. AxioSozo never opens a sign-in page or reads your credentials.` });
      }
      if (check.sign_in === "unsupported-account") {
        return entry({ ...base, sign_in: "unsupported-account", state: "unavailable", state_label: `${named(label, version)} · account not supported`,
          detail: `${named(label, version)} is signed in with an account type Ask AI does not support (it supports personal Pro and Max sign-in, not API keys, team or managed accounts).` });
      }
      return entry({ ...base, sign_in: "client-sign-in", state: "checked", state_label: `${named(label, version)} · checked`,
        detail: `${passed} ${check.sign_in === "signed-in" ? `Uses your existing ${label} sign-in.` : `Your ${label} sign-in is checked when you send a question.`} An answer through this browser is only shown once you ask.` });
    }
    default:
      return entry({ ...base, sign_in: "not-applicable", state: "unknown", state_label: `Could not check ${named(label, version)}`,
        detail: `The check of ${named(label, version)} did not finish. ${NOTHING_SENT} Check again from AI & keys or Provider settings.` });
  }
}

/**
 * One official client, from a validated capability check (preferred) or, when the check
 * could not run, from validated installation metadata (ProviderSettings.validateDiscovery).
 */
export function clientStatus(driver, provider) {
  const label = LABELS[driver];
  if (isCheck(provider)) return clientCheckStatus(driver, provider);
  const base = { id: driver, label, route: "official-client", expected_version: null, check: null, checked_at: null, reason_code: null };
  if (!provider) {
    return entry({ ...base, installed: null, version: null, sign_in: "not-applicable", state: "unknown",
      detail: `Could not read installation metadata for ${label}. No client was started.` });
  }
  const version = provider.client_version ?? null;
  if (!provider.installed) {
    return entry({ ...base, installed: false, version: null, sign_in: "not-applicable", state: "not-installed",
      detail: `The official ${label} client was not found. Install it to ask ${label} questions; browsing does not need it.` });
  }
  return entry({ ...base, installed: true, version, sign_in: "not-applicable", state: "unverified",
    detail: `Installed${version ? ` (${version})` : ""}. AxioSozo has not checked this ${label} yet; it checks it offline when you open AI & keys or before you send a question.` });
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
 * Pure: the clients from a validated capability check (`checks`) or, failing that, from
 * validated discovery. Decision keys are separate (getDecisionKeyStatus); `jev` is the
 * legacy single-entry input, kept for callers that still pass one.
 */
export function buildProviderStatus({ checks = null, checksError = null, discovery = null, discoveryError = null, jev = null } = {}) {
  const source = checks ?? discovery;
  const providers = CLIENTS.map(driver => clientStatus(driver, source?.find(item => item.driver === driver) ?? null));
  return Object.freeze({
    version: 1,
    discovery: source ? "ok" : "unavailable",
    discovery_error: source ? null : discoveryError ?? "DISCOVERY_FAILED",
    checks: checks ? "ok" : checksError ? "unavailable" : "not-run",
    checks_error: checks ? null : checksError,
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
const defaultOps = Object.freeze({ checks: checkClientsForSettings, discover: discoverForSettings });
// The privileged surface's choices only: never actor or page data.
const defaultKeyOps = Object.freeze({ runtime: createNativeDecisionKeyFixtureRuntime, status: decisionKeyStatus,
  store: storeDecisionKey, remove: removeDecisionKey });

/**
 * The offline capability check of the installed clients (cached per executable by the
 * provider host; `refresh` checks again), falling back to installation metadata when the
 * check cannot run. Never rejects; never sends anything to a provider.
 */
export async function getProviderStatus({ runtime, signal, ops = defaultOps, refresh = false } = {}) {
  let checksError = null;
  if (typeof ops.checks === "function") {
    try { return buildProviderStatus({ checks: await ops.checks(runtime, signal, { refresh: refresh === true }) }); }
    catch (error) { checksError = codeOf(error) ?? "CHECKS_FAILED"; }
  }
  try { return buildProviderStatus({ discovery: await ops.discover(runtime, signal), checksError }); }
  catch (error) { return buildProviderStatus({ discovery: null, discoveryError: codeOf(error) ?? "DISCOVERY_FAILED", checksError }); }
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
