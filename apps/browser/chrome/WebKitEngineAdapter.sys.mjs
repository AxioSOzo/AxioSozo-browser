/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// WebKit as an out-of-process engine of a Zen tab: the WebKit fixture profile of
// contracts/engine-stream-v1.md (§8, deltas §8.1) on top of the engine-neutral
// EngineStreamClient. Linux: WPE WebKit (pinned Debian packages), BGRA pipe frames.
// macOS: system WebKit in the WKWebView host (native/webkit-host/mac), frames over
// engine-surface-v1 into the engine-view component's canvas, BGRA pipe as the labelled
// fallback (ADR 004 "macOS"). Fixture mode only: the host loads nothing but the
// loopback GET fixture, and general web mode is not offered (docs/CAPABILITY_MATRIX.md).
import { EngineStreamHost, EngineStreamTarget, validFixtureOrigin } from "./EngineStreamClient.sys.mjs";
import { memfdFramesWanted, memfdProcReadable, frameWorkerWanted, frameWorkersUsable } from "./EngineFrameSurface.sys.mjs";
import { validateDelegationEvent, validateDelegationCommand } from "./ChromiumBrowserUI.sys.mjs";

// upstreams.lock.json `webkit` (Debian 13 packages); a test keeps these equal to the lockfile.
export const WEBKIT_VERSION = "2.48.3";
export const LIBWPE_VERSION = "1.16.2";
export const WPEBACKEND_FDO_VERSION = "1.16.0";
export const WEBKIT_RENDER_PATH = "wpe-fdo-shm-bgra";
// macOS WKWebView host (native/webkit-host/mac/host_mac.mm) render paths.
export const WEBKIT_MAC_RENDER_PATH_SURFACE = "wkwebview-snapshot-iosurface";
export const WEBKIT_MAC_RENDER_PATH_PIPE = "wkwebview-snapshot-bgra";
export const WEBKIT_MAC_HOST_NAME = "AxioWebKitMacHost";
/** The private WebKit SPI the macOS host may call, exactly (reported in `ready.private_spi`). */
export const WEBKIT_MAC_PRIVATE_SPI = Object.freeze(["_setWindowOcclusionDetectionEnabled:", "_setOverrideDeviceScaleFactor:"]);
const SURFACE_SERVICE_CONTRACT = "@axiosozo.nl/engine-surface-service;1";
/** Pref that enables the WebKit fixture engine (default false; Linux and macOS arm64). */
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
const MAC_READY_FIELDS = ["engine", "webkit_port", "webkit", "runtime_webkit", "platform", "sandbox_configured", "sandbox",
  "process_model", "capture", "private_spi", "render_path", "engine_instance", "capabilities"];
// Capabilities the Zen side relies on being exactly this (anything web-like must be off).
const REQUIRED_CAPABILITIES = {
  surface: false, external_begin_frame: false, fixture_only: true, devtools: false, private_mode: false,
  persistent_profile: false, open_in_tab: false, popups: false, downloads: false, permissions: false,
  javascript_dialogs: false, file_dialogs: false, http_auth: false, media_capture: false,
  key_verdict: false, ime: false, pinch: false, accessibility: false, multi_target: true,
};

/**
 * The WebKit host platform of this Gecko build (Services.appinfo OS / XPCOMABI); null where
 * no host exists. Linux: `ready.platform` itself. macOS: "macos-arm64" (system WebKit;
 * `ready.platform` adds the OS version, e.g. "macos-15.7-arm64").
 */
export function webkitPlatform(os, abi) {
  const cpu = typeof abi === "string" ? abi.split("-")[0] : "";
  // The macOS host is built and tested for Apple silicon only (macos-webkit-host.yml).
  if (os === "Darwin") return cpu === "aarch64" ? "macos-arm64" : null;
  if (os !== "Linux") return null;
  // Only x86_64 Debian packages are pinned (upstreams.lock.json webkit.platform).
  return cpu === "x86_64" ? "linux-x86_64" : null;
}
const isMac = platform => platform === "macos-arm64";

/**
 * macOS WKWebView host identity. System WebKit is not pinned (it updates with macOS),
 * so its bundle version is only shape-checked and reported; the rest is exact.
 */
export function validateWebKitMacReady(value, { surface = false, externalBeginFrames = false, frameRate = null, frameDamage = false } = {}) {
  const capabilities = value?.capabilities;
  const version = /^[0-9]{1,6}(?:\.[0-9]{1,6}){1,5}$/u;
  if (value?.engine !== "webkit" || value.webkit_port !== "wkwebview" || !version.test(value.webkit ?? "")
      || value.runtime_webkit !== value.webkit || !/^macos-[0-9]{2}\.[0-9]{1,2}-arm64$/u.test(value.platform ?? "")
      || value.sandbox_configured !== true || value.sandbox !== "macos-webkit-xpc" || value.process_model !== "multi-process"
      || value.capture !== "wkwebview-snapshot" || !Array.isArray(value.private_spi)
      || value.private_spi.length !== WEBKIT_MAC_PRIVATE_SPI.length || value.private_spi.some((name, i) => name !== WEBKIT_MAC_PRIVATE_SPI[i])
      || value.render_path !== (surface ? WEBKIT_MAC_RENDER_PATH_SURFACE : WEBKIT_MAC_RENDER_PATH_PIPE)
      || !capabilities || typeof capabilities !== "object") throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  for (const [name, expected] of Object.entries({ ...REQUIRED_CAPABILITIES, surface, external_begin_frame: surface && externalBeginFrames })) {
    if (capabilities[name] !== expected) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  }
  // Surface frames carry Mach dirty rects; pipe damage exists only for the pipe fallback.
  // damage_payload and memfd frames are Linux pipe features (engine-stream-v1 §6.2/§6.3).
  // The WKWebView scaffold has no §8.2 browser UI: Zen never asks, and it must not be offered.
  if ((capabilities.damage_payload ?? false) !== false || (capabilities.frame_transport ?? "pipe") !== "pipe" || "memfd" in capabilities
      || (capabilities.browser_ui ?? false) !== false) {
    throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  }
  if ((capabilities.frame_damage ?? false) !== (!surface && frameDamage === true) || typeof capabilities.ime_commit !== "boolean"
      || ![60, 120].includes(capabilities.frame_rate) || (surface && capabilities.frame_rate !== frameRate)) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  return true;
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
    engine: "webkit", readyFields: isMac(platform) ? MAC_READY_FIELDS : READY_FIELDS,
    cursors: browserUI ? CSS_CURSORS : CURSORS, imeLimit: 1024,
    // §8.1 row 12: a back/forward-cache restore reports the cached 200 or 0.
    restoreStatuses: Object.freeze([0, 200]),
    validateReady: (value, options) => isMac(platform) ? validateWebKitMacReady(value, options)
      : validateWebKitReady(value, { frameDamage: options.frameDamage, damagePayload: options.damagePayload, platform, browserUI }),
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

// macOS: the project volume, or one named build root directly inside it (as the CEF path).
const MAC_BUILD_ROOT = /^\/Volumes\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?$/u;
const validRoot = (root, platform) => isMac(platform) ? typeof root === "string" && MAC_BUILD_ROOT.test(root) : validLinuxRoot(root);

/**
 * The only host executable Zen spawns, in the build root: Linux `webkit/AxioWebKitHost`
 * (`native/webkit-host/probe.py setup`), macOS `webkit/AxioWebKitMacHost` (`native/webkit-host/mac/build.sh`).
 */
export function webkitBinaryPath(root, platform = "linux-x86_64") {
  if (!validRoot(root, platform)) return null;
  return `${root}/webkit/${isMac(platform) ? WEBKIT_MAC_HOST_NAME : WEBKIT_HOST_NAME}`;
}

/** `<root>/runtime/<project-id>/<session>` whose Gecko profile is `<session>/gecko` (as the CEF path). */
export function validWebKitSessionRuntime(root, session, geckoProfile, platform = "linux-x86_64") {
  if (!validRoot(root, platform) || typeof session !== "string" || typeof geckoProfile !== "string") return false;
  const prefix = `${root}/runtime/`;
  if (!session.startsWith(prefix)) return false;
  const parts = session.slice(prefix.length).split("/");
  return parts.length === 2 && /^[0-9a-f]{16}$/u.test(parts[0]) && /^[A-Za-z0-9-]{1,64}$/u.test(parts[1])
    && geckoProfile === `${session}/gecko`;
}

/**
 * The complete host environment: nothing inherited (no tokens, display, bus or personal
 * paths). macOS keeps exactly PATH and TMPDIR, like the CEF host there.
 */
export function webkitHostEnvironment(profile, platform = "linux-x86_64") {
  if (isMac(platform)) return { PATH: "/usr/bin:/bin:/usr/sbin:/sbin", TMPDIR: `${profile}/tmp` };
  return { PATH: "/usr/bin:/bin:/usr/sbin:/sbin", HOME: profile, TMPDIR: `${profile}/tmp`, LANG: "C.UTF-8" };
}

/**
 * The Gecko engine-view component (apps/browser/native/engine-view), or null when this
 * build or test has none. Null selects the labelled BGRA pipe fallback.
 */
export function webkitSurfaceService() {
  try {
    const factory = globalThis.Cc?.[SURFACE_SERVICE_CONTRACT];
    const iface = globalThis.Ci?.nsIAxioEngineSurfaceService;
    return factory && iface ? factory.getService(iface) : null;
  } catch { return null; }
}
/** Hello `frame_rate` from Gecko's vsync source: 120 on ProMotion, otherwise 60. */
export function webkitSurfaceFrameRate(service) {
  let rate = 60;
  try { rate = Number(service?.displayRefreshRate); } catch {}
  return rate >= 100 ? 120 : 60;
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
  const platform = webkitPlatform(os, abi);
  if (!platform) return no(os === "Darwin" ? "WebKit is available on Apple silicon Macs only" : "WebKit is not available on this platform yet");
  if (!readPref(prefs, WEBKIT_ENABLED_PREF)) return no("WebKit is not enabled in this browser");
  const root = env("AXIOSOZO_BUILD_ROOT"), binary = webkitBinaryPath(root, platform);
  if (!binary || env("AXIOSOZO_WEBKIT_BINARY") !== binary) return no("The WebKit engine is not installed");
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
  /** The host's negotiated render path (ready.render_path). */
  get renderPath() { return this.host?.ready?.render_path ?? WEBKIT_RENDER_PATH; }
  /** The WebKit version this tab runs: pinned WPE on Linux, the system WebKit bundle on macOS. */
  get webkitVersion() { return this.host?.ready?.webkit ?? WEBKIT_VERSION; }
  get browserUI() { return this.host.capabilities?.browser_ui === true; }
  capabilities() {
    return Object.freeze({ version: 1, engine: "webkit", navigation: true, observation: ["url", "title", "loading"],
      content_capture: false, developer_tools: false, fixture_only: true, private_mode: false, ime: this.inputFeatures.ime,
      ime_commit: this.inputFeatures.imeCommit, browser_ui: this.browserUI, render_path: this.renderPath, experimental: true });
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
 * Start a private WebKit host for one Zen tab and attach it. Fixture mode only;
 * every path and the fixture origin are re-validated here, at the spawn.
 */
export async function launchWebKit(win, { tabId, origin, onEvent, onFrame, onFailure, frameDamage = true,
  damagePayload = frameDamage, frameTransport = null, browserUI = true, element = null, onGeometry = () => {} }) {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const platform = webkitPlatform(Services.appinfo.OS, Services.appinfo.XPCOMABI);
  const env = name => Services.env.get(name);
  const root = env("AXIOSOZO_BUILD_ROOT"), session = env("AXIOSOZO_SESSION_RUNTIME"), command = env("AXIOSOZO_WEBKIT_BINARY");
  if (!platform || !webkitAvailabilityFor(win).available || command !== webkitBinaryPath(root, platform)
      || !validWebKitSessionRuntime(root, session, Services.dirsvc.get("ProfD", Ci.nsIFile).path, platform)
      || origin !== env("AXIOSOZO_ENGINE_FIXTURE_ORIGIN") || !validFixtureOrigin(origin)
      || typeof tabId !== "string" || !/^[a-zA-Z0-9_:/.-]{1,128}$/u.test(tabId)) {
    throw new Error("WEBKIT_RUNTIME_UNAVAILABLE");
  }
  const instance = "webkit-" + Services.uuid.generateUUID().toString().replace(/[{}]/gu, "");
  // A fresh private profile per host (§7), removed when the process exits.
  const profile = `${session}/${instance}`;
  await IOUtils.makeDirectory(profile, { permissions: 0o700, createAncestors: false, ignoreExisting: false });
  await IOUtils.makeDirectory(`${profile}/tmp`, { permissions: 0o700, createAncestors: false, ignoreExisting: false });
  const random = Cc["@mozilla.org/security/random-generator;1"].getService(Ci.nsIRandomGenerator).generateRandomBytes(32);
  const token = [...random].map(value => value.toString(16).padStart(2, "0")).join("");
  // macOS GPU surface path (engine-surface-v1): the endpoint exists before the host is
  // spawned, so the host connects before WebKit starts. Without the engine-view component
  // (or without a canvas to bind) this build uses the BGRA pipe fallback, and says so.
  const service = isMac(platform) && element ? webkitSurfaceService() : null;
  let endpoint = null;
  // Internal pacing (no BEGIN_FRAME): the host snapshots on its own frame_rate clock. Measured on
  // macos-15 (run 39344367832): 56 fps internal vs 32 fps with external ticks at 60 Hz (ADR 004).
  try { endpoint = service?.createEndpoint(false) ?? null; } catch { endpoint = null; }
  if (isMac(platform) && !endpoint) {
    console.warn("AXIOSOZO_WEBKIT_RENDER_PATH", JSON.stringify({ renderPath: WEBKIT_MAC_RENDER_PATH_PIPE,
      reason: service ? "surface_endpoint_failed" : "surface_service_unavailable" }));
  }
  let process;
  try {
    process = await Subprocess.call({ command, arguments: ["--stream", profile, profile],
      environmentAppend: false, environment: webkitHostEnvironment(profile, platform), stderr: "pipe" });
  } catch (error) {
    try { endpoint?.close(); } catch {}
    await IOUtils.remove(profile, { recursive: true }).catch(() => {});
    throw error;
  }
  const cleanup = () => IOUtils.remove(profile, { recursive: true });
  process.wait().then(cleanup, cleanup).catch(() => {});
  // engine-stream-v1 §6.3 memfd frames are a Linux pipe feature: pref/default, and only when this
  // child's /proc/<pid>/fd is readable; otherwise the pipe. macOS never negotiates them (nor asks
  // /proc, which would latch the process-wide memfd fallback) and never starts a frame worker.
  const transport = isMac(platform) ? "pipe"
    : frameTransport ?? (memfdFramesWanted() && await memfdProcReadable(process.pid) ? "memfd" : "pipe");
  if (transport === "memfd" && frameWorkerWanted()) await frameWorkersUsable();
  // §8.2 browser UI (Zen-drawn dialogs, menus, find, zoom, clipboard, IME): Linux hosts only; the
  // macOS WKWebView scaffold answers browser_ui:false, so macOS never asks.
  const host = new EngineStreamHost(process, { profile: webkitProfile({ platform, browserUI: browserUI && !isMac(platform) }),
    token, instance, identity: origin,
    // Surface frames carry Mach dirty rects, so pipe damage exists only without the endpoint.
    // Rectangle-only payloads (engine-stream-v1 §6.2) are a Linux pipe feature; macOS never asks.
    timers, frameDamage: endpoint ? false : frameDamage, damagePayload: !isMac(platform) && damagePayload, requestPrefix: "wk",
    frameTransport: transport,
    surface: endpoint ? { endpoint, service, frameRate: webkitSurfaceFrameRate(service) } : null });
  try { await host.connect(); }
  catch (error) { await host.shutdown().catch(() => {}); throw error; }
  return new WebKitEngineAdapter(host, { pendingTarget: { tab_id: tabId, engine_instance: instance, identity: origin,
    document_generation: 1, navigation_generation: 1, private_mode: false }, onEvent, onFrame, onFailure,
    element: endpoint ? element : null, onGeometry });
}
