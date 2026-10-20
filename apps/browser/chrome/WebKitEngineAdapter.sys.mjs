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
  if ((capabilities.frame_damage ?? false) !== (!surface && frameDamage === true) || typeof capabilities.ime_commit !== "boolean"
      || ![60, 120].includes(capabilities.frame_rate) || (surface && capabilities.frame_rate !== frameRate)) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  return true;
}

export function validateWebKitReady(value, { frameDamage = false, platform = "linux-x86_64" } = {}) {
  const capabilities = value?.capabilities;
  if (value?.engine !== "webkit" || value.webkit_port !== "wpe" || value.webkit !== WEBKIT_VERSION
      || value.runtime_webkit !== WEBKIT_VERSION || value.libwpe !== LIBWPE_VERSION
      || value.wpebackend_fdo !== WPEBACKEND_FDO_VERSION || value.platform !== platform
      || value.sandbox_configured !== true || value.sandbox !== "bubblewrap" || value.process_model !== "multi-process"
      || value.render_path !== WEBKIT_RENDER_PATH || !capabilities || typeof capabilities !== "object") {
    throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  }
  for (const [name, expected] of Object.entries(REQUIRED_CAPABILITIES)) {
    if (capabilities[name] !== expected) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  }
  if ((capabilities.frame_damage ?? false) !== frameDamage || typeof capabilities.ime_commit !== "boolean"
      || ![60, 120].includes(capabilities.frame_rate)) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  return true;
}

export function webkitProfile({ platform = "linux-x86_64" } = {}) {
  return Object.freeze({
    engine: "webkit", readyFields: isMac(platform) ? MAC_READY_FIELDS : READY_FIELDS, cursors: CURSORS, imeLimit: 1024,
    // §8.1 row 12: a back/forward-cache restore reports the cached 200 or 0.
    restoreStatuses: Object.freeze([0, 200]),
    validateReady: (value, options) => isMac(platform) ? validateWebKitMacReady(value, options)
      : validateWebKitReady(value, { frameDamage: options.frameDamage, platform }),
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
  capabilities() {
    return Object.freeze({ version: 1, engine: "webkit", navigation: true, observation: ["url", "title", "loading"],
      content_capture: false, developer_tools: false, fixture_only: true, private_mode: false, ime: false,
      ime_commit: this.inputFeatures.imeCommit, render_path: this.renderPath, experimental: true });
  }
}

/**
 * Start a private WebKit host for one Zen tab and attach it. Fixture mode only;
 * every path and the fixture origin are re-validated here, at the spawn.
 */
export async function launchWebKit(win, { tabId, origin, onEvent, onFrame, onFailure, frameDamage = true, element = null,
  onGeometry = () => {} }) {
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
  const host = new EngineStreamHost(process, { profile: webkitProfile({ platform }), token, instance, identity: origin,
    timers, frameDamage: endpoint ? false : frameDamage, requestPrefix: "wk",
    surface: endpoint ? { endpoint, service, frameRate: webkitSurfaceFrameRate(service) } : null });
  try { await host.connect(); }
  catch (error) { await host.shutdown().catch(() => {}); throw error; }
  return new WebKitEngineAdapter(host, { pendingTarget: { tab_id: tabId, engine_instance: instance, identity: origin,
    document_generation: 1, navigation_generation: 1, private_mode: false }, onEvent, onFrame, onFailure,
    element: endpoint ? element : null, onGeometry });
}
