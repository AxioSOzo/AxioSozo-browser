/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
const SETTINGS_URI = "chrome://browser/content/axiosozo/providers-settings.xhtml";
const PREF = "axiosozo.providers.instances.v1";
const DRIVERS = Object.freeze(["codex", "claude-code", "antigravity"]);
const LABELS = Object.freeze({ codex: "Codex", "claude-code": "Claude Code", antigravity: "Antigravity" });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const KEYCHAIN_SETTINGS_ENABLED = false; // Requires a separately verified Keychain storage round-trip.
const dialogs = new WeakMap();
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

async function runOwned(runtime, command, args, { input = "", signal } = {}) {
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
    const write = async () => { if (input) await child.stdin.write(input); await child.stdin.close(); };
    const [stdout, , result] = await Promise.all([collect(child.stdout, true), collect(child.stderr, false), child.wait(), write()]);
    requireValue(!cancelled, "SETTINGS_CLOSED"); requireValue(!timeout, "HELPER_TIMEOUT");
    requireValue(result.exitCode === 0, "HELPER_FAILED"); return stdout;
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

/** Deliberately gated: only explicit settings actions may ever reach Keychain. */
export async function storeJevKey(secret, runtime, signal) {
  requireValue(KEYCHAIN_SETTINGS_ENABLED, "KEYCHAIN_SETTINGS_NOT_VERIFIED");
  requireValue(text(secret) && secret.length >= 8, "INVALID_KEY");
  runtime ??= nativeRuntime();
  const root = runtime.env("AXIOSOZO_BUILD_ROOT");
  requireValue(text(root) && root.startsWith("/Volumes/"), "KEYCHAIN_HELPER_UNAVAILABLE");
  await runOwned(runtime, `${root}/providers/keychain`, ["store"], { input: secret, signal });
}

function addText(document, parent, tag, value, className) {
  const node = document.createElementNS("http://www.w3.org/1999/xhtml", tag);
  node.textContent = value; if (className) node.className = className; parent.append(node); return node;
}

export function initializeProviderSettings(win) {
  const document = win.document;
  requireValue(authorizedWindows.has(win) && document.documentURI === SETTINGS_URI
    && document.nodePrincipal.isSystemPrincipal, "UNTRUSTED_SETTINGS_SURFACE");
  const controller = new win.AbortController(); const runtime = nativeRuntime();
  const store = new ProviderInstances(Services.prefs, () => Services.uuid.generateUUID().toString().replace(/[{}]/gu, ""));
  const byId = id => document.getElementById(id); let busy = false;
  win.addEventListener("unload", () => { controller.abort(); byId("jev-key").value = ""; }, { once: true });
  const status = message => { byId("settings-status").textContent = message; };
  function renderInstances() {
    const policy = store.state();
    const list = byId("instances"); list.replaceChildren();
    for (const instance of policy.instances) {
      const row = addText(document, list, "li", "", "instance");
      const summary = addText(document, row, "div", "");
      addText(document, summary, "strong", `${instance.label} · ${LABELS[instance.driver]}`);
      addText(document, summary, "code", instance.instance_id);
      const controls = addText(document, row, "div", "", "instance-controls");
      const enabledLabel = addText(document, controls, "label", "", "instance-toggle");
      const enabled = addText(document, enabledLabel, "input", ""); enabled.type = "checkbox";
      enabled.checked = policy.enabledIds.includes(instance.instance_id);
      addText(document, enabledLabel, "span", "Enabled");
      enabled.addEventListener("change", () => {
        try { store.setEnabled(instance.instance_id, enabled.checked); renderInstances(); status("Local routing policy saved. Live route remains blocked until verified."); }
        catch { renderInstances(); status("Enabled status could not be saved."); }
      });
      const useDefault = addText(document, controls, "button", policy.defaultId === instance.instance_id ? "Default" : "Set default");
      useDefault.type = "button"; useDefault.disabled = !enabled.checked || policy.defaultId === instance.instance_id;
      useDefault.addEventListener("click", () => {
        try { store.setDefault(instance.instance_id); renderInstances(); status("Default for new sessions saved. Existing sessions stay bound."); }
        catch { status("Default could not be changed."); }
      });
      const fallbackIndex = policy.fallbackIds.indexOf(instance.instance_id);
      const fallback = addText(document, controls, "button", fallbackIndex >= 0 ? `Fallback ${fallbackIndex + 1} · remove` : "Add fallback");
      fallback.type = "button"; fallback.disabled = !enabled.checked || policy.defaultId === instance.instance_id;
      fallback.addEventListener("click", () => {
        try {
          store.setFallback(fallbackIndex >= 0 ? policy.fallbackIds.filter(id => id !== instance.instance_id)
            : [...policy.fallbackIds, instance.instance_id]);
          renderInstances(); status("Opt-in fallback order saved. Mutating actions are never replayed.");
        } catch { status("Fallback order could not be changed."); }
      });
      const remove = addText(document, row, "button", "Remove"); remove.type = "button";
      remove.setAttribute("aria-label", `Remove configuration ${instance.label}`);
      remove.addEventListener("click", () => { try { store.remove(instance.instance_id); renderInstances(); status("Configuration removed."); } catch { status("Configuration could not be changed."); } });
    }
    byId("instances-empty").hidden = list.childElementCount > 0;
    byId("routing-summary").textContent = policy.defaultId
      ? `Default: ${policy.instances.find(item => item.instance_id === policy.defaultId)?.label}. Fallback: ${policy.fallbackIds.length ? policy.fallbackIds.map(id => policy.instances.find(item => item.instance_id === id)?.label).join(" → ") : "off"}. Live access blocked.`
      : "No default provider. Browser assistance is off; normal browsing works.";
  }
  async function refresh() {
    if (busy) return; busy = true; byId("refresh").disabled = true; status("Reading installation metadata…");
    try {
      const providers = await discoverForSettings(runtime, controller.signal);
      if (controller.signal.aborted) return;
      const list = byId("providers"); list.replaceChildren();
      for (const provider of providers) {
        const row = addText(document, list, "section", "", "provider");
        addText(document, row, "h2", LABELS[provider.driver]);
        addText(document, row, "p", provider.installed ? `Installed · ${provider.client_version ?? "version unknown"}` : "Client not found");
        if (provider.executable) addText(document, row, "code", provider.executable);
        addText(document, row, "p", `Authentication unknown · ${provider.status}`, "status");
        addText(document, row, "p", `${provider.version_status} · pinned fixture ${provider.fixture_version ?? "unknown"} · client protocol UNTESTED`, "detail");
        addText(document, row, "p", `${provider.protocol} · live connection and browser control unverified`, "detail");
      }
      status("Metadata refreshed. No provider client was started.");
    } catch (error) {
      if (!controller.signal.aborted) {
        const code = /^[A-Z][A-Z0-9_]{2,80}$/u.test(error?.message ?? "") ? error.message : "DISCOVERY_FAILED";
        status(`Discovery unavailable (${code}). No provider client was started.`);
        console.error(`AxioSozo provider discovery ${code}`);
      }
    }
    finally { busy = false; if (!controller.signal.aborted) byId("refresh").disabled = false; }
  }
  byId("refresh").addEventListener("click", refresh);
  byId("instance-form").addEventListener("submit", event => {
    event.preventDefault();
    try { store.add(byId("driver").value, byId("instance-name").value); byId("instance-name").value = ""; renderInstances(); status("Local configuration saved. Authentication remains unknown."); }
    catch { status("Configuration was not saved. Use a name of 1–64 characters; at most 12 configurations are supported."); }
  });
  byId("jev-form").addEventListener("submit", async event => {
    event.preventDefault(); const input = byId("jev-key"); let secret = input.value; input.value = "";
    try { await storeJevKey(secret, runtime, controller.signal); status("Jev key stored in macOS Keychain."); }
    catch { status("Jev Keychain storage is not available in this development build."); }
    finally { secret = ""; }
  });
  byId("close").addEventListener("click", () => win.close());
  try { renderInstances(); } catch { byId("instances-empty").textContent = "Saved instance configuration is invalid; it was preserved for recovery."; }
  refresh();
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
  dialogs.set(browserWindow, win);
  const closeWithParent = () => { if (!win.closed) win.close(); };
  browserWindow.addEventListener("unload", closeWithParent, { once: true });
  win.addEventListener("unload", () => browserWindow.removeEventListener("unload", closeWithParent), { once: true });
  const initialize = () => initializeProviderSettings(win);
  if (win.document.readyState === "complete" && win.document.documentURI === SETTINGS_URI) initialize();
  else win.addEventListener("DOMContentLoaded", initialize, { once: true });
  return win;
}
