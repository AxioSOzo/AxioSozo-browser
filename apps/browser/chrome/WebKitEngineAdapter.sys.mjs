/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// WebKit (WPE, Linux) as an out-of-process engine of a Zen tab: the WebKit fixture
// profile of contracts/engine-stream-v1.md (§8, deltas §8.1) on top of the
// engine-neutral EngineStreamClient. Fixture mode only: the host loads nothing but
// the loopback GET fixture, and general web mode is not offered (docs/CAPABILITY_MATRIX.md).
import { EngineStreamHost, EngineStreamTarget, validFixtureOrigin } from "./EngineStreamClient.sys.mjs";
import { memfdFramesWanted, memfdProcReadable, frameWorkerWanted, frameWorkersUsable } from "./EngineFrameSurface.sys.mjs";
import { SpareHost, prewarmWanted, PREWARM_STARTUP_DELAY_MS, PREWARM_AFTER_CLOSE_MS } from "./EngineHostSpare.sys.mjs";
import { validateDelegationEvent, validateDelegationCommand } from "./ChromiumBrowserUI.sys.mjs";

// upstreams.lock.json `webkit` (Debian 13 packages); a test keeps these equal to the lockfile.
export const WEBKIT_VERSION = "2.48.3";
export const LIBWPE_VERSION = "1.16.2";
export const WPEBACKEND_FDO_VERSION = "1.16.0";
export const WEBKIT_RENDER_PATH = "wpe-fdo-shm-bgra";
/** Pref that enables the WebKit fixture engine (default false; Linux only). */
export const WEBKIT_ENABLED_PREF = "axiosozo.engines.webkit.enabled";
/**
 * Reserved for general WebKit web browsing. It enables nothing: web mode stays
 * unavailable until dialogs, permissions, downloads and TLS UI exist and a current
 * WebKit release is pinned (ADR 004). Reading it only reports that refusal.
 */
export const WEBKIT_WEB_PREF = "axiosozo.engines.webkit.web.enabled";
export const WEBKIT_HOST_NAME = "AxioWebKitHost";
// §8.1 row 11: cursors derived from WebKit hit tests.
const CURSORS = new Set(["default", "pointer", "text"]);
// §8.2 browser UI: the element's computed CSS cursor keyword.
export const CSS_CURSORS = new Set(["default", "none", "context-menu", "help", "pointer", "progress", "wait", "cell",
  "crosshair", "text", "vertical-text", "alias", "copy", "move", "no-drop", "not-allowed", "grab", "grabbing", "e-resize",
  "n-resize", "ne-resize", "nw-resize", "s-resize", "se-resize", "sw-resize", "w-resize", "ew-resize", "ns-resize",
  "nesw-resize", "nwse-resize", "col-resize", "row-resize", "all-scroll", "zoom-in", "zoom-out"]);
// §8.2: capabilities a browser-UI host turns on (everything else in REQUIRED_CAPABILITIES stays as is).
const BROWSER_UI_CAPABILITIES = {
  browser_ui: true, javascript_dialogs: true, context_menu: true, option_menu: true, permissions: true, file_dialogs: true,
  find: true, zoom: true, favicon: true, clipboard: true, ime: true, text_input: true, cursor_set: "css",
};
// §8.2 target events and their keys.
const UI_EVENTS = Object.freeze({
  prompt: ["prompt_id", "kind", "timeout_ms", "details"], prompt_closed: ["prompt_id", "reason"],
  find_result: ["identifier", "count", "active", "final"], favicon: ["icon"],
  text_input: ["mode", "caret_x", "caret_y", "caret_width", "caret_height"],
  clipboard_text: ["text", "part", "parts"], text_selection: ["text", "part", "parts"],
});
const isObject = value => !!value && typeof value === "object" && !Array.isArray(value);
const exactKeys = (value, keys) => isObject(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const uint = (value, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= 0 && value <= max;
const MAX_OPTION_ITEMS = 512;

/** `option_menu` prompt details (WebKit's <select> popup, §8.2). Throws on violation. */
export function validOptionMenu(details) {
  if (!exactKeys(details, ["x", "y", "width", "height", "items"]) || ![details.x, details.y, details.width, details.height].every(v => uint(v, 16384))
      || !Array.isArray(details.items) || details.items.length > MAX_OPTION_ITEMS
      || !details.items.every(item => exactKeys(item, ["label", "group", "child", "enabled", "selected"])
        && typeof item.label === "string" && item.label.length <= 256 && !item.label.includes("\0")
        && ["group", "child", "enabled", "selected"].every(key => typeof item[key] === "boolean"))) throw new Error("INVALID_WEBKIT_PROMPT");
  return true;
}

/** Strict check of one §8.2 event (prompts share cef-v1's delegation schema). Throws on violation. */
export function validateWebKitUIEvent(value) {
  const fail = () => { throw new Error("INVALID_WEBKIT_UI_EVENT"); };
  switch (value?.event) {
    case "prompt":
      if (value.kind === "option_menu") {
        if (!/^prompt-[1-9][0-9]{0,15}$/u.test(value.prompt_id ?? "") || !uint(value.timeout_ms, 600000) || value.timeout_ms < 1000) fail();
        try { validOptionMenu(value.details); } catch { fail(); }
        return value;
      }
      if (["download", "auth"].includes(value.kind)) fail(); // never offered by a fixture host
      try { validateDelegationEvent(value); } catch { fail(); }
      return value;
    case "prompt_closed": case "find_result":
      try { validateDelegationEvent(value); } catch { fail(); }
      return value;
    case "favicon":
      // cef-v1 rule: "" or a PNG data URL of at most 5400 bytes.
      if (value.icon !== "" && !(typeof value.icon === "string" && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/u.test(value.icon)
          && Math.floor((value.icon.length - 22) * 3 / 4) <= 5400)) fail();
      return value;
    case "text_input":
      if (!["none", "text", "password"].includes(value.mode)
          || ![value.caret_x, value.caret_y, value.caret_width, value.caret_height].every(v => uint(v, 16384))) fail();
      return value;
    case "clipboard_text": case "text_selection":
      if (typeof value.text !== "string" || !value.text.length || value.text.length > 1800 || !uint(value.parts, 36) || value.parts < 1
          || !uint(value.part, value.parts) || value.part < 1) fail();
      return value;
    default: fail();
  }
  return value;
}

const UI_COMMANDS = new Set(["context_menu_command", "dialog_reply", "permission_reply", "file_dialog_reply", "find", "stop_finding", "zoom"]);
/** Exact fields of a §8.2 command Zen sends (replies and find/zoom). Throws on violation. */
export function validateWebKitUICommand(method, fields) {
  if (method === "option_menu_reply") {
    if (!exactKeys(fields, ["prompt_id", "index"]) || !/^prompt-[1-9][0-9]{0,15}$/u.test(fields.prompt_id ?? "")
        || !Number.isInteger(fields.index) || fields.index < -1 || fields.index > 1023) throw new Error("INVALID_WEBKIT_REPLY");
    return { ...fields };
  }
  if (!UI_COMMANDS.has(method)) throw new Error("INVALID_WEBKIT_REPLY");
  try { return validateDelegationCommand(method, fields); } catch { throw new Error("INVALID_WEBKIT_REPLY"); }
}

/** §8.2 input methods: ordered with keys and pointer in the target's input queue. null: not one of them. */
export function validateWebKitUIInput(method, fields, surface) {
  const fail = () => { throw new Error("INVALID_ENGINE_IME"); };
  switch (method) {
    case "ime_set_composition":
      if (!exactKeys(fields, ["text", "selection_start", "selection_end"]) || typeof fields.text !== "string" || fields.text.length > 1024
          || !uint(fields.selection_start, fields.text.length) || !uint(fields.selection_end, fields.text.length)
          || fields.selection_start > fields.selection_end) fail();
      return { ...fields };
    case "ime_cancel_composition": case "ime_finish_composing":
      if (!exactKeys(fields, [])) fail();
      return {};
    case "paste_text": {
      const at = isObject(fields) && "x" in fields;
      if (!exactKeys(fields, at ? ["text", "x", "y"] : ["text"]) || typeof fields.text !== "string" || !fields.text.length
          || fields.text.length > 4096 || (at && !(surface && uint(fields.x, surface.width) && uint(fields.y, surface.height)))) fail();
      return { ...fields };
    }
    default: return null;
  }
}
const READY_FIELDS = ["engine", "webkit_port", "webkit", "runtime_webkit", "libwpe", "wpebackend_fdo", "platform",
  "sandbox_configured", "sandbox", "process_model", "render_path", "engine_instance", "capabilities"];
// Capabilities the Zen side relies on being exactly this (anything web-like must be off).
const REQUIRED_CAPABILITIES = {
  surface: false, external_begin_frame: false, fixture_only: true, devtools: false, private_mode: false,
  persistent_profile: false, open_in_tab: false, popups: false, downloads: false, permissions: false,
  javascript_dialogs: false, file_dialogs: false, http_auth: false, media_capture: false,
  key_verdict: false, ime: false, pinch: false, accessibility: false, multi_target: true,
};

/** `ready.platform` this Gecko build must see (Services.appinfo OS / XPCOMABI); null where no host is pinned. */
export function webkitPlatform(os, abi) {
  if (os !== "Linux") return null;
  const cpu = typeof abi === "string" ? abi.split("-")[0] : "";
  // Only x86_64 Debian packages are pinned (upstreams.lock.json webkit.platform).
  return cpu === "x86_64" ? "linux-x86_64" : null;
}

export function validateWebKitReady(value, { frameDamage = false, damagePayload = false, platform = "linux-x86_64", browserUI = false } = {}) {
  const capabilities = value?.capabilities;
  if (value?.engine !== "webkit" || value.webkit_port !== "wpe" || value.webkit !== WEBKIT_VERSION
      || value.runtime_webkit !== WEBKIT_VERSION || value.libwpe !== LIBWPE_VERSION
      || value.wpebackend_fdo !== WPEBACKEND_FDO_VERSION || value.platform !== platform
      || value.sandbox_configured !== true || value.sandbox !== "bubblewrap" || value.process_model !== "multi-process"
      || value.render_path !== WEBKIT_RENDER_PATH || !capabilities || typeof capabilities !== "object") {
    throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  }
  // §8.2: with browser UI negotiated, those capabilities must be on and everything else stays as required.
  const required = browserUI ? { ...REQUIRED_CAPABILITIES, ...BROWSER_UI_CAPABILITIES } : REQUIRED_CAPABILITIES;
  for (const [name, expected] of Object.entries(required)) {
    if (capabilities[name] !== expected) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  }
  if (!browserUI && capabilities.browser_ui === true) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  if ((capabilities.frame_damage ?? false) !== frameDamage || (capabilities.damage_payload ?? false) !== damagePayload
      || typeof capabilities.ime_commit !== "boolean"
      || ![60, 120].includes(capabilities.frame_rate)) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  return true;
}

export function webkitProfile({ platform = "linux-x86_64", browserUI = false } = {}) {
  return Object.freeze({
    engine: "webkit", readyFields: READY_FIELDS, cursors: browserUI ? CSS_CURSORS : CURSORS, imeLimit: 1024,
    // §8.1 row 12: a back/forward-cache restore reports the cached 200 or 0.
    restoreStatuses: Object.freeze([0, 200]),
    validateReady: (value, { frameDamage, damagePayload }) => validateWebKitReady(value, { frameDamage, damagePayload, platform, browserUI }),
    ...(browserUI ? { hello: Object.freeze({ browser_ui: true }), events: UI_EVENTS,
      validateCommand: validateWebKitUICommand, validateInput: validateWebKitUIInput } : {}),
  });
}

// Linux has no project volume: any absolute, normalized directory, never a kernel pseudo file system.
export function validLinuxRoot(root) {
  if (typeof root !== "string" || root.length > 1024 || !root.startsWith("/") || root === "/") return false;
  const parts = root.slice(1).split("/");
  return parts.every(part => /^[A-Za-z0-9._-]{1,255}$/u.test(part) && part !== "." && part !== "..")
    && !["proc", "sys", "dev"].includes(parts[0]);
}

/** The only host executable Zen spawns: what `native/webkit-host/probe.py setup` builds in the build root. */
export function webkitBinaryPath(root) {
  return validLinuxRoot(root) ? `${root}/webkit/${WEBKIT_HOST_NAME}` : null;
}

/** `<root>/runtime/<project-id>/<session>` whose Gecko profile is `<session>/gecko` (as the CEF path). */
export function validWebKitSessionRuntime(root, session, geckoProfile) {
  if (!validLinuxRoot(root) || typeof session !== "string" || typeof geckoProfile !== "string") return false;
  const prefix = `${root}/runtime/`;
  if (!session.startsWith(prefix)) return false;
  const parts = session.slice(prefix.length).split("/");
  return parts.length === 2 && /^[0-9a-f]{16}$/u.test(parts[0]) && /^[A-Za-z0-9-]{1,64}$/u.test(parts[1])
    && geckoProfile === `${session}/gecko`;
}

/** The complete host environment: nothing inherited (no tokens, display, bus or personal paths). */
export function webkitHostEnvironment(profile) {
  return { PATH: "/usr/bin:/bin:/usr/sbin:/sbin", HOME: profile, TMPDIR: `${profile}/tmp`, LANG: "C.UTF-8" };
}

function readPref(prefs, name) {
  try { return prefs?.getBoolPref?.(name, false) === true; } catch { return false; }
}

/**
 * {available, reason} for WebKit in this browser. `env(name)` reads Zen's environment.
 * Order: platform, enable pref, runtime installed, fixture page. Reasons are user-facing.
 */
export function webkitAvailability({ os, abi, prefs, env = () => "" }) {
  const no = reason => Object.freeze({ available: false, reason });
  if (os === "Darwin") return no("WebKit is not available on macOS yet");
  if (!webkitPlatform(os, abi)) return no("WebKit is not available on this platform yet");
  if (!readPref(prefs, WEBKIT_ENABLED_PREF)) return no("WebKit is not enabled in this browser");
  const root = env("AXIOSOZO_BUILD_ROOT");
  if (!webkitBinaryPath(root) || env("AXIOSOZO_WEBKIT_BINARY") !== webkitBinaryPath(root)) return no("The WebKit engine is not installed");
  if (!validFixtureOrigin(env("AXIOSOZO_ENGINE_FIXTURE_ORIGIN"))) return no("WebKit runs only the local test page for now");
  return Object.freeze({ available: true, reason: null, fixtureOnly: true });
}

/** The same check against a chrome window (Services lives on the window in chrome code). */
export function webkitAvailabilityFor(window) {
  const services = window?.Services;
  let os = null, abi = null;
  try { os = services?.appinfo?.OS ?? null; abi = services?.appinfo?.XPCOMABI ?? null; } catch {}
  return webkitAvailability({ os, abi, prefs: services?.prefs,
    env: name => { try { return services?.env?.get?.(name) ?? ""; } catch { return ""; } } });
}

/** Web mode is refused whatever the reserved pref says; diagnostics report what was asked. */
export function webkitWebModeRequested(window) { return readPref(window?.Services?.prefs, WEBKIT_WEB_PREF); }

/** One WebKit tab: an engine-stream target whose engine is "webkit". */
export class WebKitEngineAdapter extends EngineStreamTarget {
  get browserUI() { return this.host.capabilities?.browser_ui === true; }
  capabilities() {
    return Object.freeze({ version: 1, engine: "webkit", navigation: true, observation: ["url", "title", "loading"],
      content_capture: false, developer_tools: false, fixture_only: true, private_mode: false, ime: this.inputFeatures.ime,
      ime_commit: this.inputFeatures.imeCommit, browser_ui: this.browserUI, render_path: WEBKIT_RENDER_PATH, experimental: true });
  }
  acceptEvent(value) {
    // §8.2 events are schema-checked before they reach Zen's UI; a violation ends the tab.
    if (Object.hasOwn(UI_EVENTS, value?.event)) {
      try { validateWebKitUIEvent(value); } catch { this.fail("INVALID_ENGINE_EVENT"); return; }
    }
    super.acceptEvent(value);
  }
  /** ChromiumBrowserUI's `send`: one reply/command bound to `target` (a stale one is refused by the host). */
  reply(target, method, fields) { return this.extension(target, method, fields); }
}

/**
 * Warm spare host (EngineHostSpare.sys.mjs): one per Firefox process, held by the shared module
 * instance, started with launchWebKit's defaults (SPARE_OPTIONS). Returns whether a spare is (being) scheduled.
 */
let spare = null;
// launchWebKit's defaults (frame damage + damage payloads, transport by pref, §8.2 browser UI).
const SPARE_OPTIONS = Object.freeze({ frameDamage: true, damagePayload: true, frameTransport: null, browserUI: true });
const SHARED_MODULE = "chrome://browser/content/axiosozo/WebKitEngineAdapter.sys.mjs";
function sharedInstance() {
  try { return ChromeUtils.importESModule(SHARED_MODULE); } catch { return null; }
}
export function prewarmWebKitHost(win, delayMs = PREWARM_STARTUP_DELAY_MS) {
  const shared = sharedInstance();
  if (shared && shared.prewarmWebKitHost !== prewarmWebKitHost) return shared.prewarmWebKitHost(win, delayMs);
  const origin = Services.env.get("AXIOSOZO_ENGINE_FIXTURE_ORIGIN");
  if (!validFixtureOrigin(origin) || !webkitAvailabilityFor(win).available) return false;
  if (!prewarmWanted(Services.prefs)) { spare?.drop(); return false; }
  spare ??= new SpareHost(() => startWebKitHost(win, origin, SPARE_OPTIONS));
  spare.schedule(win, delayMs);
  return true;
}
/** The spare for a tab of `origin` started with these options, or null (then the caller starts a host). */
export async function takeWarmWebKitHost(origin, options) {
  const shared = sharedInstance();
  if (shared && shared.takeWarmWebKitHost !== takeWarmWebKitHost) return shared.takeWarmWebKitHost(origin, options);
  // Only a request with the spare's own options can use it.
  if (!spare || !prewarmWanted(Services.prefs) || Object.keys(SPARE_OPTIONS).some(key => options?.[key] !== SPARE_OPTIONS[key])) return null;
  return spare.take(host => !host.ended && host.status === "connected" && host.targetCount === 0 && host.identity === origin
    && host.frameDamage === true && host.damagePayload === true);
}
export function webkitSpareStats() {
  const shared = sharedInstance();
  if (shared && shared.webkitSpareStats !== webkitSpareStats) return shared.webkitSpareStats();
  return spare?.stats ?? null;
}

/**
 * Start a private WebKit host for one Zen tab and attach it. Fixture mode only;
 * every path and the fixture origin are re-validated here, at the spawn. A warm
 * spare (prewarmWebKitHost) is used when one is ready.
 */
export async function launchWebKit(win, { tabId, origin, onEvent, onFrame, onFailure, frameDamage = true,
  damagePayload = frameDamage, frameTransport = null, browserUI = true }) {
  if (typeof tabId !== "string" || !/^[a-zA-Z0-9_:/.-]{1,128}$/u.test(tabId) || !webkitAvailabilityFor(win).available) {
    throw new Error("WEBKIT_RUNTIME_UNAVAILABLE");
  }
  const options = { frameDamage, damagePayload, frameTransport, browserUI };
  const warm = await takeWarmWebKitHost(origin, options);
  const host = warm ?? await startWebKitHost(win, origin, options);
  const adapter = new WebKitEngineAdapter(host, { pendingTarget: { tab_id: tabId, engine_instance: host.instance, identity: origin,
    document_generation: 1, navigation_generation: 1, private_mode: false }, onEvent, onFrame, onFailure });
  const close = adapter.close.bind(adapter);
  adapter.close = async () => {
    try { await close(); } finally { try { prewarmWebKitHost(win, PREWARM_AFTER_CLOSE_MS); } catch {} }
  };
  adapter.warmHost = !!warm;
  return adapter;
}

/** One connected private WebKit host (no target yet). */
async function startWebKitHost(win, origin, { frameDamage, damagePayload, frameTransport, browserUI }) {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const platform = webkitPlatform(Services.appinfo.OS, Services.appinfo.XPCOMABI);
  const env = name => Services.env.get(name);
  const root = env("AXIOSOZO_BUILD_ROOT"), session = env("AXIOSOZO_SESSION_RUNTIME"), command = env("AXIOSOZO_WEBKIT_BINARY");
  if (!platform || !webkitAvailabilityFor(win).available || command !== webkitBinaryPath(root)
      || !validWebKitSessionRuntime(root, session, Services.dirsvc.get("ProfD", Ci.nsIFile).path)
      || origin !== env("AXIOSOZO_ENGINE_FIXTURE_ORIGIN") || !validFixtureOrigin(origin)) {
    throw new Error("WEBKIT_RUNTIME_UNAVAILABLE");
  }
  const instance = "webkit-" + Services.uuid.generateUUID().toString().replace(/[{}]/gu, "");
  // A fresh private profile per host (§7), removed when the process exits.
  const profile = `${session}/${instance}`;
  await IOUtils.makeDirectory(profile, { permissions: 0o700, createAncestors: false, ignoreExisting: false });
  await IOUtils.makeDirectory(`${profile}/tmp`, { permissions: 0o700, createAncestors: false, ignoreExisting: false });
  const random = Cc["@mozilla.org/security/random-generator;1"].getService(Ci.nsIRandomGenerator).generateRandomBytes(32);
  const token = [...random].map(value => value.toString(16).padStart(2, "0")).join("");
  let process;
  try {
    process = await Subprocess.call({ command, arguments: ["--stream", profile, profile],
      environmentAppend: false, environment: webkitHostEnvironment(profile), stderr: "pipe" });
  } catch (error) {
    await IOUtils.remove(profile, { recursive: true }).catch(() => {});
    throw error;
  }
  const cleanup = () => IOUtils.remove(profile, { recursive: true });
  process.wait().then(cleanup, cleanup).catch(() => {});
  const transport = frameTransport ?? (memfdFramesWanted() && await memfdProcReadable(process.pid) ? "memfd" : "pipe");
  if (transport === "memfd" && frameWorkerWanted()) await frameWorkersUsable();
  // §8.2 browser UI (Zen-drawn dialogs, menus, find, zoom, clipboard, IME): Linux hosts of this tree.
  const host = new EngineStreamHost(process, { profile: webkitProfile({ platform, browserUI }), token, instance, identity: origin,
    // Rectangle-only payloads (engine-stream-v1 §6.2): the pipe carries the damage, not the frame.
    timers, frameDamage, damagePayload, requestPrefix: "wk",
    // engine-stream-v1 §6.3 memfd frames (Linux only here): pref/default, and only when this child's
    // /proc/<pid>/fd is readable; otherwise the pipe.
    frameTransport: transport });
  try { await host.connect(); }
  catch (error) { await host.shutdown().catch(() => {}); throw error; }
  return host;
}
