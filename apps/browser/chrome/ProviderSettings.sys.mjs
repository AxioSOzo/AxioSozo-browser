/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { clientStatus, getDecisionKeyStatus, keychainErrorText, removeDecisionKeyAndReport,
  storeDecisionKeyAndReport } from "./ProviderStatus.sys.mjs";
import { DECISION_KEY_PROVIDERS, validateDecisionKey } from "./ProviderKeys.sys.mjs";
const SETTINGS_URI = "chrome://browser/content/axiosozo/providers-settings.xhtml";
const PREF = "axiosozo.providers.instances.v1";
const DRIVERS = Object.freeze(["codex", "claude-code", "antigravity"]);
const LABELS = Object.freeze({ codex: "Codex", "claude-code": "Claude Code", antigravity: "Antigravity" });
const KEY_LABELS = Object.freeze({ jev: "Jev", openai: "OpenAI" });
const KEY_WORKING = Object.freeze({ check: "Checking…", store: "Storing…", remove: "Removing…" });
// The outcome of these failures is uncertain, so presence is read again.
const KEY_RECHECK = new Set(["KEYCHAIN_HELPER_UNAVAILABLE", "KEYCHAIN_REFUSED", "HELPER_TIMEOUT", "HELPER_OUTPUT_LIMIT"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const dialogs = new WeakMap(); // browser window → its settings dialog
const owners = new WeakMap(); // settings dialog → the browser window that opened it
const authorizedWindows = new WeakSet();
function requireValue(condition, code) { if (!condition) throw new Error(code); }
function text(value, maximum = 4096) {
  return typeof value === "string" && value.length <= maximum && !/[\u0000-\u001f\u007f]/u.test(value);
}

/** Installation metadata is untrusted data. It can never enable a live capability. */
export function validateDiscovery(value) {
  requireValue(value?.version === 1 && Array.isArray(value.providers) && value.providers.length === 3, "INVALID_DISCOVERY");
  const seen = new Set();
  const providers = value.providers.map(item => {
    requireValue(item && DRIVERS.includes(item.driver) && !seen.has(item.driver), "INVALID_DISCOVERY");
    seen.add(item.driver);
    requireValue(item.version === 1 && typeof item.installed === "boolean"
      && item.auth_status === "unknown" && item.status === (item.installed ? "BLOCKED_AUTH" : "BLOCKED_ENV")
      && (item.executable === null || text(item.executable))
      && (item.client_version === null || text(item.client_version, 64))
      && (item.version_source === null || text(item.version_source, 64)), "INVALID_DISCOVERY");
    requireValue(item.capabilities?.discovery === true && item.capabilities.live_verified === false
      && item.capabilities.automatic_browser_control === false && item.capabilities.shell === false
      && item.capabilities.filesystem === false, "INVALID_CAPABILITY_CLAIM");
    requireValue(text(item.route?.protocol, 128) && Array.isArray(item.blockers)
      && item.blockers.length <= 8 && item.blockers.every(blocker => /^[A-Z_]{1,80}$/u.test(blocker)), "INVALID_DISCOVERY");
    requireValue(item.route.pinned_version === null || text(item.route.pinned_version, 64), "INVALID_DISCOVERY");
    const expectedVersion = !item.client_version || !item.route.pinned_version ? "UNTESTED"
      : item.client_version === item.route.pinned_version ? "PINNED_METADATA_MATCH" : "VERSION_MISMATCH";
    requireValue(item.version_status === expectedVersion && item.protocol_status === "UNTESTED", "INVALID_VERSION_CLAIM");
    return Object.freeze({ driver: item.driver, installed: item.installed, executable: item.executable,
      client_version: item.client_version, version_source: item.version_source, protocol: item.route.protocol,
      fixture_version: item.route.pinned_version, version_status: item.version_status, protocol_status: "UNTESTED",
      status: item.status, auth_status: "unknown", live_verified: false, automatic_browser_control: false });
  });
  return Object.freeze(DRIVERS.map(driver => providers.find(item => item.driver === driver)));
}

/** Only nonsecret instance configuration belongs in the isolated dev profile. */
export class ProviderInstances {
  constructor(prefs, uuid) { this.prefs = prefs; this.uuid = uuid; }
  state() {
    let stored;
    try { stored = JSON.parse(this.prefs.getStringPref(PREF, '{"version":1,"instances":[]}')); }
    catch { throw new Error("INVALID_INSTANCE_CONFIG"); }
    const legacy = stored?.version === 1 && Object.keys(stored).length === 2;
    const current = stored?.version === 2 && Object.keys(stored).length === 5;
    requireValue((legacy || current) && Array.isArray(stored.instances)
      && stored.instances.length <= 12, "INVALID_INSTANCE_CONFIG");
    const seen = new Set();
    const instances = Object.freeze(stored.instances.map(item => {
      requireValue(item && Object.keys(item).length === 3 && UUID.test(item.instance_id)
        && !seen.has(item.instance_id) && DRIVERS.includes(item.driver)
        && text(item.label, 64) && item.label.trim().length > 0, "INVALID_INSTANCE_CONFIG");
      seen.add(item.instance_id);
      return Object.freeze({ instance_id: item.instance_id, driver: item.driver, label: item.label });
    }));
    const enabledIds = legacy ? [] : stored.enabledIds;
    const defaultId = legacy ? null : stored.defaultId;
    const fallbackIds = legacy ? [] : stored.fallbackIds;
    requireValue(Array.isArray(enabledIds) && enabledIds.length <= 12
      && enabledIds.every(id => seen.has(id)) && new Set(enabledIds).size === enabledIds.length
      && (defaultId === null || enabledIds.includes(defaultId))
      && Array.isArray(fallbackIds) && fallbackIds.length <= 11
      && fallbackIds.every(id => enabledIds.includes(id) && id !== defaultId)
      && new Set(fallbackIds).size === fallbackIds.length, "INVALID_INSTANCE_CONFIG");
    return Object.freeze({ instances, enabledIds: Object.freeze([...enabledIds]), defaultId,
      fallbackIds: Object.freeze([...fallbackIds]) });
  }
  list() { return this.state().instances; }
  #save({ instances, enabledIds, defaultId, fallbackIds }) {
    this.prefs.setStringPref(PREF, JSON.stringify({ version: 2, instances, enabledIds, defaultId, fallbackIds }));
  }
  add(driver, label) {
    requireValue(DRIVERS.includes(driver) && text(label, 64) && label.trim().length > 0, "INVALID_INSTANCE_INPUT");
    const state = this.state(); const { instances } = state; requireValue(instances.length < 12, "INSTANCE_LIMIT");
    const instance_id = this.uuid();
    requireValue(UUID.test(instance_id) && !instances.some(item => item.instance_id === instance_id), "INVALID_INSTANCE_ID");
    const item = Object.freeze({ instance_id, driver, label: label.trim() });
    this.#save({ ...state, instances: [...instances, item] }); return item;
  }
  remove(instanceId) {
    requireValue(UUID.test(instanceId), "INVALID_INSTANCE_ID");
    const state = this.state(); requireValue(state.instances.some(item => item.instance_id === instanceId), "UNKNOWN_INSTANCE");
    this.#save({ instances: state.instances.filter(item => item.instance_id !== instanceId),
      enabledIds: state.enabledIds.filter(id => id !== instanceId),
      defaultId: state.defaultId === instanceId ? null : state.defaultId,
      fallbackIds: state.fallbackIds.filter(id => id !== instanceId) });
  }
  setEnabled(instanceId, enabled) {
    requireValue(typeof enabled === "boolean", "INVALID_INSTANCE_INPUT");
    const state = this.state(); requireValue(state.instances.some(item => item.instance_id === instanceId), "UNKNOWN_INSTANCE");
    const enabledIds = enabled ? [...new Set([...state.enabledIds, instanceId])]
      : state.enabledIds.filter(id => id !== instanceId);
    this.#save({ ...state, enabledIds, defaultId: enabledIds.includes(state.defaultId) ? state.defaultId : null,
      fallbackIds: state.fallbackIds.filter(id => enabledIds.includes(id)) });
  }
  setDefault(instanceId) {
    const state = this.state();
    requireValue(instanceId === null || state.enabledIds.includes(instanceId), "DEFAULT_PROVIDER_DISABLED");
    this.#save({ ...state, defaultId: instanceId,
      fallbackIds: state.fallbackIds.filter(id => id !== instanceId) });
  }
  setFallback(instanceIds) {
    const state = this.state();
    requireValue(Array.isArray(instanceIds) && instanceIds.length <= 11
      && instanceIds.every(id => state.enabledIds.includes(id) && id !== state.defaultId)
      && new Set(instanceIds).size === instanceIds.length, "INVALID_FALLBACK_ORDER");
    this.#save({ ...state, fallbackIds: [...instanceIds] });
  }
}

/** A new turn selects one instance. Live admission remains separately gated. */
export function providerRoute(state, discovery, { failedInstanceId = null, mutating = false } = {}) {
  const fallbackIndex = state.fallbackIds.indexOf(failedInstanceId);
  const order = failedInstanceId === null ? [state.defaultId] :
    mutating || (failedInstanceId !== state.defaultId && fallbackIndex < 0)
      ? [] : state.fallbackIds.slice(fallbackIndex + 1);
  for (const id of order) {
    if (!id || !state.enabledIds.includes(id)) continue;
    const instance = state.instances.find(item => item.instance_id === id);
    const provider = discovery.find(item => item.driver === instance?.driver);
    if (provider?.live_verified && provider.status === "READY") return Object.freeze({ instance, provider });
  }
  return null;
}

function nativeRuntime() {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  return { spawn: options => Subprocess.call(options), timers, env: name => Services.env.get(name) };
}

// Metadata only: no stdin input, and only a zero exit is accepted. Key operations
// run through ProviderKeys, never here.
async function runOwned(runtime, command, args, { signal } = {}) {
  requireValue(text(command) && command.startsWith("/"), "INVALID_HELPER_PATH");
  if (signal?.aborted) throw new Error("SETTINGS_CLOSED");
  const child = await runtime.spawn({ command, arguments: args, environmentAppend: false,
    environment: { PATH: runtime.env("AXIOSOZO_DISCOVERY_PATH") || "/usr/bin:/bin", LANG: "C" }, stderr: "pipe" });
  let timeout = false; let cancelled = false;
  const stop = () => { child.kill(250).catch(() => {}); };
  const onAbort = () => { cancelled = true; stop(); };
  const timer = runtime.timers.setTimeout(() => { timeout = true; stop(); }, 5000);
  signal?.addEventListener("abort", onAbort, { once: true });
  async function collect(pipe, keep) {
    let output = ""; let size = 0;
    if (!pipe) return output;
    for (;;) {
      const chunk = await pipe.readString(); if (!chunk) return output;
      size += new TextEncoder().encode(chunk).length;
      requireValue(size <= 65536, "HELPER_OUTPUT_LIMIT");
      if (keep) output += chunk;
    }
  }
  try {
    if (signal?.aborted) onAbort();
    const [stdout, , result] = await Promise.all([collect(child.stdout, true), collect(child.stderr, false), child.wait(), child.stdin.close()]);
    requireValue(!cancelled, "SETTINGS_CLOSED"); requireValue(!timeout, "HELPER_TIMEOUT");
    requireValue(result.exitCode === 0, "HELPER_FAILED");
    return stdout;
  } finally {
    runtime.timers.clearTimeout(timer); signal?.removeEventListener("abort", onAbort);
    await child.stdin.close().catch(() => {});
    await child.kill(250).catch(() => {});
    await child.wait().catch(() => {});
  }
}

export async function discoverForSettings(runtime = nativeRuntime(), signal) {
  const node = runtime.env("AXIOSOZO_PROVIDER_NODE"); const host = runtime.env("AXIOSOZO_PROVIDER_HOST");
  requireValue(text(host) && host.startsWith("/") && host.endsWith("/packages/provider-host/cli.mjs"), "PROVIDER_HOST_UNAVAILABLE");
  return validateDiscovery(JSON.parse(await runOwned(runtime, node, [host, "discover"], { signal })));
}

function addText(document, parent, tag, value, className) {
  const node = document.createElementNS("http://www.w3.org/1999/xhtml", tag);
  node.textContent = value; if (className) node.className = className; parent.append(node); return node;
}
/** Presentation only: tone never alters the verbatim status code text. */
function addBadge(document, parent, code) {
  const tone = /^BLOCKED/u.test(code) ? "blocked" : /MISMATCH/u.test(code) ? "warning" : "neutral";
  return addText(document, parent, "span", code, `badge ${tone}`);
}

export function initializeProviderSettings(win) {
  const document = win.document;
  const owner = owners.get(win);
  requireValue(authorizedWindows.has(win) && owner && document.documentURI === SETTINGS_URI
    && document.nodePrincipal.isSystemPrincipal, "UNTRUSTED_SETTINGS_SURFACE");
  const controller = new win.AbortController(); const runtime = nativeRuntime();
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule("resource://gre/modules/PrivateBrowsingUtils.sys.mjs");
  const store = new ProviderInstances(Services.prefs, () => Services.uuid.generateUUID().toString().replace(/[{}]/gu, ""));
  const byId = id => document.getElementById(id); let busy = false;
  win.addEventListener("unload", () => {
    controller.abort();
    authorizedWindows.delete(win); owners.delete(win);
    for (const provider of DECISION_KEY_PROVIDERS) byId(`${provider}-key`).value = "";
  }, { once: true });
  // Key authority of this dialog, read live: still this registered, open settings
  // document with the system principal, opened by the same browser window that is
  // still open, still this dialog's owner and explicitly not private. ProviderStatus,
  // the fixture factory and ProviderKeys check it before every helper step and
  // immediately before a key is written. Once false it stays false.
  let keysRevoked = false;
  const keysActive = () => {
    if (keysRevoked) return false;
    try {
      keysRevoked = !(!controller.signal.aborted && authorizedWindows.has(win) && owners.get(win) === owner
        && dialogs.get(owner) === win && win.closed === false && win.document === document
        && document.documentURI === SETTINGS_URI && document.nodePrincipal?.isSystemPrincipal === true
        && owner.closed === false && PrivateBrowsingUtils.isWindowPrivate(owner) === false);
    } catch { keysRevoked = true; }
    return !keysRevoked;
  };
  const status = message => { byId("settings-status").textContent = message; };
  function renderInstances() {
    const policy = store.state();
    const list = byId("instances"); list.replaceChildren();
    for (const instance of policy.instances) {
      const row = addText(document, list, "li", "", "instance");
      const summary = addText(document, row, "div", "", "instance-summary");
      addText(document, summary, "strong", instance.label, "instance-label");
      addText(document, summary, "span", LABELS[instance.driver], "instance-driver");
      addText(document, summary, "code", instance.instance_id, "instance-id");
      if (instance.driver === "codex") {
        const root = runtime.env("AXIOSOZO_BUILD_ROOT");
        if (text(root) && root.startsWith("/Volumes/")) {
          const profile = `${root}/providers/runtime/codex/${instance.instance_id}/codex-home`;
          // Display only a quoted, locally-derived command; never execute login from settings.
          const quoted = "'" + profile.replaceAll("'", "'\"'\"'") + "'";
          addText(document, summary, "span", "After the first Send prepares this separate browser profile, sign in once with the official Codex client:", "section-note");
          addText(document, summary, "code", `CODEX_HOME=${quoted} codex login`, "path");
        }
      }
      const controls = addText(document, row, "div", "", "instance-controls");
      const enabledLabel = addText(document, controls, "label", "", "instance-toggle");
      const enabled = addText(document, enabledLabel, "input", ""); enabled.type = "checkbox";
      enabled.checked = policy.enabledIds.includes(instance.instance_id);
      addText(document, enabledLabel, "span", "Enabled");
      enabled.addEventListener("change", () => {
        try { store.setEnabled(instance.instance_id, enabled.checked); renderInstances(); status("Default-provider preference saved. A client starts only when you send a question."); }
        catch { renderInstances(); status("Enabled status could not be saved."); }
      });
      const isDefault = policy.defaultId === instance.instance_id;
      const useDefault = addText(document, controls, "button", isDefault ? "Default" : "Set default", isDefault ? "small current" : "small");
      useDefault.type = "button"; useDefault.disabled = !enabled.checked || policy.defaultId === instance.instance_id;
      useDefault.addEventListener("click", () => {
        try { store.setDefault(instance.instance_id); renderInstances(); status("Default for new sessions saved. Existing sessions stay bound."); }
        catch { status("Default could not be changed."); }
      });
      /* Automatic replay stays off for conversations; preserve stored fallback preferences. */
      const fallbackIndex = policy.fallbackIds.indexOf(instance.instance_id);
      const fallback = addText(document, controls, "button", fallbackIndex >= 0 ? `Fallback ${fallbackIndex + 1} · remove` : "Add fallback",
        fallbackIndex >= 0 ? "small active" : "small");
      fallback.hidden = true; fallback.type = "button"; fallback.disabled = !enabled.checked || policy.defaultId === instance.instance_id;
      fallback.addEventListener("click", () => {
        try {
          store.setFallback(fallbackIndex >= 0 ? policy.fallbackIds.filter(id => id !== instance.instance_id)
            : [...policy.fallbackIds, instance.instance_id]);
          renderInstances(); status("Opt-in fallback order saved. Mutating actions are never replayed.");
        } catch { status("Fallback order could not be changed."); }
      });
      const remove = addText(document, row, "button", "Remove", "small remove"); remove.type = "button";
      remove.setAttribute("aria-label", `Remove configuration ${instance.label}`);
      remove.addEventListener("click", () => { try { store.remove(instance.instance_id); renderInstances(); status("Configuration removed."); } catch { status("Configuration could not be changed."); } });
    }
    byId("instances-empty").hidden = list.childElementCount > 0;
    byId("routing-summary").textContent = policy.defaultId
      ? `Default: ${policy.instances.find(item => item.instance_id === policy.defaultId)?.label}. Automatic fallback is off. Select a provider in Ask AI to start a conversation.`
      : "Select a provider in Ask AI. No default configuration is needed.";
  }
  async function refresh() {
    if (busy) return; busy = true; byId("refresh").disabled = true; status("Reading installation metadata…");
    byId("providers").setAttribute("aria-busy", "true");
    try {
      const providers = await discoverForSettings(runtime, controller.signal);
      if (controller.signal.aborted) return;
      const list = byId("providers"); list.replaceChildren();
      for (const provider of providers) {
        const row = addText(document, list, "section", "", provider.installed ? "provider" : "provider missing");
        const head = addText(document, row, "div", "", "provider-head");
        addText(document, head, "h3", LABELS[provider.driver]);
        if (provider.installed) addText(document, head, "span", provider.client_version ?? "version unknown", provider.client_version ? "version" : "version unknown");
        addText(document, head, "span", provider.installed ? "Installed" : "Client not found", "install-state");
        if (provider.executable) addText(document, row, "code", provider.executable, "path");
        // Same status model as about:axiosozo (ProviderStatus.sys.mjs).
        const model = clientStatus(provider.driver, provider);
        const facts = addText(document, row, "dl", "", "facts");
        const fact = (term, build) => { addText(document, facts, "dt", term); build(addText(document, facts, "dd", "")); };
        fact("Status", dd => {
          addText(document, dd, "span", model.state_label, `badge ${model.state === "unavailable" || model.state === "unknown" ? "warning" : "neutral"}`);
          addText(document, dd, "span", ` ${model.detail}`);
        });
        fact("Connection", dd => addText(document, dd, "span", provider.driver === "antigravity"
          ? "Unavailable in this build — Antigravity startup and tool isolation have not been verified. Select Codex or Claude Code."
          : provider.installed ? "Connection is attempted when you Send. Client compatibility, authentication and the security boundary are checked then."
            : "Install the official client before sending a question."));
        fact("Authentication", dd => addText(document, dd, "span", "Not checked by installation discovery."));
        fact("Browser actions", dd => addText(document, dd, "span", "Unavailable. AI receives only your question and any page reference you explicitly share."));
        const fixture = addText(document, row, "details", "", "fixture-details");
        addText(document, fixture, "summary", "Older offline fixture metadata");
        addText(document, fixture, "p", "This comparison describes the offline test fixture, not live client compatibility. Live connection results appear in Ask AI after you Send.", "section-note");
        const metadata = addText(document, fixture, "p", "", "section-note");
        addBadge(document, metadata, provider.version_status);
        addText(document, metadata, "span", ` fixture version ${provider.fixture_version ?? "not pinned"}; live protocol not checked during discovery.`);
        addText(document, fixture, "code", provider.protocol, "path");
      }
      status("Metadata refreshed. No provider client was started.");
    } catch (error) {
      if (!controller.signal.aborted) {
        const code = /^[A-Z][A-Z0-9_]{2,80}$/u.test(error?.message ?? "") ? error.message : "DISCOVERY_FAILED";
        status(`Discovery unavailable (${code}). No provider client was started.`);
        const list = byId("providers"); list.replaceChildren();
        addText(document, list, "p", "Installation metadata could not be read. ", "placeholder error");
        addBadge(document, list.firstChild, code);
        console.error(`AxioSozo provider discovery ${code}`);
      }
    }
    finally { busy = false; if (!controller.signal.aborted) { byId("refresh").disabled = false; byId("providers").removeAttribute("aria-busy"); } }
  }
  byId("browser-preferences").addEventListener("click", () => {
    win.opener.openTrustedLinkIn("about:preferences#privacy", "tab"); win.close();
  });
  byId("browser-addons").addEventListener("click", () => {
    win.opener.openTrustedLinkIn("about:addons", "tab"); win.close();
  });
  byId("refresh").addEventListener("click", refresh);
  byId("instance-form").addEventListener("submit", event => {
    event.preventDefault();
    try { store.add(byId("driver").value, byId("instance-name").value); byId("instance-name").value = ""; renderInstances(); status("Local configuration saved. Authentication remains unknown."); }
    catch { status("Configuration was not saved. Use a name of 1–64 characters; at most 12 configurations are supported."); }
  });
  // Decision keys, per provider: presence only. A typed key is read once, cleared at
  // once and goes only to the Keychain helper's stdin. Every operation admits its own
  // runtime under this dialog's signal and keysActive (ProviderStatus); the metadata
  // runtime above is never used for keys. Storing never turns on consent or calls a provider.
  const keys = new Map(DECISION_KEY_PROVIDERS.map(provider => [provider, { entry: null, busy: null }]));
  const keyNode = (provider, part) => byId(`${provider}-${part}`);
  const keyOptions = () => ({ signal: controller.signal, isActive: keysActive, prefs: Services.prefs });
  function renderKey(provider) {
    const { entry, busy } = keys.get(provider);
    const label = KEY_LABELS[provider]; const stored = entry?.key === "stored";
    const badge = keyNode(provider, "state");
    badge.textContent = busy ? KEY_WORKING[busy] : entry?.state_label ?? KEY_WORKING.check;
    badge.className = `badge ${!busy && (entry?.state === "unavailable" || entry?.state === "unknown") ? "warning" : "neutral"}`;
    keyNode(provider, "detail").textContent = entry?.detail ?? "";
    keyNode(provider, "section").setAttribute("aria-busy", busy ? "true" : "false");
    keyNode(provider, "label").textContent = stored ? `Replace the ${label} key` : `${label} API key`;
    // Storing follows the provider's key-entry pref; removal never does. While an
    // operation runs the controls keep focus (aria-disabled) and ignore presses.
    const input = keyNode(provider, "key"), store = keyNode(provider, "store"), remove = keyNode(provider, "remove");
    input.disabled = !entry?.can_store; input.readOnly = !!busy;
    store.disabled = !entry?.can_store; remove.disabled = !entry?.can_remove;
    store.textContent = stored ? "Replace key" : "Store key";
    store.setAttribute("aria-label", `${stored ? "Replace" : "Store"} key for ${label}`);
    remove.setAttribute("aria-label", `Remove key for ${label}`);
    for (const button of [store, remove]) {
      if (busy) button.setAttribute("aria-disabled", "true"); else button.removeAttribute("aria-disabled");
    }
  }
  async function checkKey(provider) {
    const slot = keys.get(provider);
    slot.busy = "check"; renderKey(provider);
    try { slot.entry = await getDecisionKeyStatus(provider, keyOptions()); } catch { /* entry stays as it was */ }
    finally { slot.busy = null; }
    if (!controller.signal.aborted) renderKey(provider);
  }
  /** Keeps keyboard focus in the provider's form when the focused control becomes unavailable. */
  function keepKeyFocus(provider, focused) {
    if (!focused?.disabled) return;
    const next = [keyNode(provider, "key"), keyNode(provider, "store"), keyNode(provider, "remove")].find(node => !node.disabled);
    (next ?? keyNode(provider, "title")).focus();
  }
  async function keyAction(provider, kind, run) {
    const slot = keys.get(provider); const error = keyNode(provider, "error");
    const focused = document.activeElement;
    error.textContent = ""; slot.busy = kind; renderKey(provider);
    let code = null;
    try { slot.entry = await run(); } catch (failure) { code = failure?.message ?? null; }
    finally { slot.busy = null; }
    if (controller.signal.aborted) return;
    const label = KEY_LABELS[provider];
    if (code) { error.textContent = keychainErrorText(code); status(error.textContent); }
    else status(kind === "store"
      ? `${label} key stored in the macOS Keychain. It will not be shown again. Nothing was sent and consent did not change.`
      : `${label} key removed from the macOS Keychain.`);
    renderKey(provider);
    keepKeyFocus(provider, focused);
    if (KEY_RECHECK.has(code)) await checkKey(provider);
  }
  for (const provider of DECISION_KEY_PROVIDERS) {
    keyNode(provider, "form").addEventListener("submit", event => {
      event.preventDefault();
      const slot = keys.get(provider);
      if (slot.busy || controller.signal.aborted) return;
      const input = keyNode(provider, "key"); let secret = input.value; input.value = "";
      if (!slot.entry?.can_store || !keysActive()) { secret = ""; return; }
      if (!validateDecisionKey(secret)) {
        secret = ""; keyNode(provider, "error").textContent = keychainErrorText("INVALID_KEY"); return;
      }
      keyAction(provider, "store", async () => {
        try { return await storeDecisionKeyAndReport(provider, secret, keyOptions()); } finally { secret = ""; }
      }).catch(() => {});
    });
    keyNode(provider, "remove").addEventListener("click", () => {
      const slot = keys.get(provider);
      if (slot.busy || !slot.entry?.can_remove || !keysActive()) return;
      keyAction(provider, "remove", () => removeDecisionKeyAndReport(provider, keyOptions())).catch(() => {});
    });
    checkKey(provider).catch(() => {});
  }
  byId("close").addEventListener("click", () => win.close());
  try { renderInstances(); } catch {
    const invalid = byId("instances-empty"); invalid.className = "placeholder error";
    invalid.textContent = "Saved instance configuration is invalid; it was preserved for recovery.";
  }
  status("Provider clients start only when you send a question from Ask AI.");
}

/** Called only from a user action in the trusted browser chrome. */
export function openProviderSettings(browserWindow) {
  requireValue(browserWindow.document.nodePrincipal.isSystemPrincipal, "UNTRUSTED_SETTINGS_CALLER");
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule("resource://gre/modules/PrivateBrowsingUtils.sys.mjs");
  if (PrivateBrowsingUtils.isWindowPrivate(browserWindow)) {
    Services.prompt.alert(browserWindow, "Provider settings", "Provider settings are unavailable in private windows.");
    return null;
  }
  const previous = dialogs.get(browserWindow);
  if (previous && !previous.closed) { previous.focus(); return previous; }
  const win = browserWindow.openDialog(SETTINGS_URI, "axiosozo-provider-settings", "chrome,centerscreen,resizable,width=720,height=760");
  authorizedWindows.add(win);
  owners.set(win, browserWindow);
  dialogs.set(browserWindow, win);
  const closeWithParent = () => { if (!win.closed) win.close(); };
  browserWindow.addEventListener("unload", closeWithParent, { once: true });
  win.addEventListener("unload", () => browserWindow.removeEventListener("unload", closeWithParent), { once: true });
  const initialize = () => initializeProviderSettings(win);
  if (win.document.readyState === "complete" && win.document.documentURI === SETTINGS_URI) initialize();
  else win.addEventListener("DOMContentLoaded", initialize, { once: true });
  return win;
}
