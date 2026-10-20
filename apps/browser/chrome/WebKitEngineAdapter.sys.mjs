/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// WebKit (WPE, Linux) as an out-of-process engine of a Zen tab: the WebKit fixture
// profile of contracts/engine-stream-v1.md (§8, deltas §8.1) on top of the
// engine-neutral EngineStreamClient. Fixture mode only: the host loads nothing but
// the loopback GET fixture, and general web mode is not offered (docs/CAPABILITY_MATRIX.md).
import { EngineStreamHost, EngineStreamTarget, validFixtureOrigin } from "./EngineStreamClient.sys.mjs";
import { MEMFD_FRAMES_PREF } from "./EngineFrameSurface.sys.mjs";

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

export function validateWebKitReady(value, { frameDamage = false, damagePayload = false, platform = "linux-x86_64" } = {}) {
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
  if ((capabilities.frame_damage ?? false) !== frameDamage || (capabilities.damage_payload ?? false) !== damagePayload
      || typeof capabilities.ime_commit !== "boolean"
      || ![60, 120].includes(capabilities.frame_rate)) throw new Error("UNVERIFIED_WEBKIT_RUNTIME");
  return true;
}

export function webkitProfile({ platform = "linux-x86_64" } = {}) {
  return Object.freeze({
    engine: "webkit", readyFields: READY_FIELDS, cursors: CURSORS, imeLimit: 1024,
    // §8.1 row 12: a back/forward-cache restore reports the cached 200 or 0.
    restoreStatuses: Object.freeze([0, 200]),
    validateReady: (value, { frameDamage, damagePayload }) => validateWebKitReady(value, { frameDamage, damagePayload, platform }),
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
  capabilities() {
    return Object.freeze({ version: 1, engine: "webkit", navigation: true, observation: ["url", "title", "loading"],
      content_capture: false, developer_tools: false, fixture_only: true, private_mode: false, ime: false,
      ime_commit: this.inputFeatures.imeCommit, render_path: WEBKIT_RENDER_PATH, experimental: true });
  }
}

/**
 * Start a private WebKit host for one Zen tab and attach it. Fixture mode only;
 * every path and the fixture origin are re-validated here, at the spawn.
 */
export async function launchWebKit(win, { tabId, origin, onEvent, onFrame, onFailure, frameDamage = true,
  damagePayload = frameDamage, frameTransport = null }) {
  const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
  const timers = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
  const platform = webkitPlatform(Services.appinfo.OS, Services.appinfo.XPCOMABI);
  const env = name => Services.env.get(name);
  const root = env("AXIOSOZO_BUILD_ROOT"), session = env("AXIOSOZO_SESSION_RUNTIME"), command = env("AXIOSOZO_WEBKIT_BINARY");
  if (!platform || !webkitAvailabilityFor(win).available || command !== webkitBinaryPath(root)
      || !validWebKitSessionRuntime(root, session, Services.dirsvc.get("ProfD", Ci.nsIFile).path)
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
  const host = new EngineStreamHost(process, { profile: webkitProfile({ platform }), token, instance, identity: origin,
    // Rectangle-only payloads (engine-stream-v1 §6.2): the pipe carries the damage, not the frame.
    timers, frameDamage, damagePayload, requestPrefix: "wk",
    // engine-stream-v1 §6.3 memfd frames: EXPERIMENTAL, off unless the pref is set (Linux only here).
    frameTransport: frameTransport ?? (Services.prefs.getBoolPref(MEMFD_FRAMES_PREF, false) ? "memfd" : "pipe") });
  try { await host.connect(); }
  catch (error) { await host.shutdown().catch(() => {}); throw error; }
  return new WebKitEngineAdapter(host, { pendingTarget: { tab_id: tabId, engine_instance: instance, identity: origin,
    document_generation: 1, navigation_generation: 1, private_mode: false }, onEvent, onFrame, onFailure });
}
