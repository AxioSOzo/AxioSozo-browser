/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Zen-side WebKit on macOS: platform/availability, the WKWebView host identity, the
// engine-surface-v1 path through EngineStreamHost (endpoint stand-in) and the pipe
// fallback, presenter surface binding and macOS key routing. Every packet and endpoint
// here is a visibly scripted fixture: none of it is WebKit rendering, Zen E1/E2 or
// screenshot evidence (the real host is tested in .github/workflows/macos-webkit-host.yml).
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";

const { EngineStreamHost, validateStreamSurface } = await import("../chrome/EngineStreamClient.sys.mjs");
const webkit = await import("../chrome/WebKitEngineAdapter.sys.mjs");
const { WebKitPresenter, macKeyboardRoute, macStreamKey, MAC_KEYS, linuxKeyboardRoute } = await import("../chrome/WebKitPresenter.sys.mjs");
const { installWebKitEngine } = await import("../chrome/WebKitEngineControls.sys.mjs");
const { WebKitEngineAdapter, webkitProfile, webkitPlatform, webkitBinaryPath, validWebKitSessionRuntime, webkitHostEnvironment,
  webkitAvailability, validateWebKitMacReady, WEBKIT_MAC_PRIVATE_SPI, WEBKIT_MAC_RENDER_PATH_SURFACE, WEBKIT_MAC_RENDER_PATH_PIPE } = webkit;

const origin = "http://127.0.0.1:41231";
const token = "cd".repeat(32);
const instance = "webkit-mac-instance";
const pending = { tab_id: "tab-1", engine_instance: instance, identity: origin, document_generation: 1, navigation_generation: 1, private_mode: false };
const timers = { setTimeout, clearTimeout };
const tick = (n = 4) => new Promise(resolve => { const step = left => left ? setImmediate(() => step(left - 1)) : resolve(); step(n); });
const ROOT = "/Volumes/AxioSozoBuild";
const BINARY = `${ROOT}/webkit/AxioWebKitMacHost`;

function packet(kind, metadata, pixels = new Uint8Array(0)) {
  const text = new TextEncoder().encode(JSON.stringify(metadata)), data = new Uint8Array(16 + text.length + pixels.length);
  const view = new DataView(data.buffer); view.setUint32(0, 0x41584346); view.setUint16(4, 1); view.setUint16(6, kind);
  view.setUint32(8, text.length); view.setUint32(12, pixels.length); data.set(text, 16); data.set(pixels, 16 + text.length);
  return data;
}
class Pipe {
  chunks = new Uint8Array(); pending = []; closed = false;
  read(n) { return new Promise((resolve, reject) => { this.pending.push({ n, resolve, reject }); this.flush(); }); }
  push(bytes) { const joined = new Uint8Array(this.chunks.length + bytes.length); joined.set(this.chunks); joined.set(bytes, this.chunks.length); this.chunks = joined; this.flush(); }
  flush() {
    while (this.pending.length) {
      const next = this.pending[0];
      if (this.chunks.length < next.n) { if (this.closed) { this.pending.shift(); next.reject(new Error("EOF")); continue; } return; }
      this.pending.shift(); const out = this.chunks.slice(0, next.n); this.chunks = this.chunks.slice(next.n); next.resolve(out.buffer);
    }
  }
  close() { this.closed = true; this.flush(); }
}

/** `ready` of native/webkit-host/mac/host_mac.mm (shape copied from a macos-webkit-host run). */
function macReady({ surface = true, beginFrames = true, rate = 60 } = {}, overrides = {}, capabilities = {}) {
  return { event: "ready", engine: "webkit", webkit_port: "wkwebview", webkit: "20621.3.11.11.3", runtime_webkit: "20621.3.11.11.3",
    platform: "macos-15.7-arm64", sandbox_configured: true, sandbox: "macos-webkit-xpc", process_model: "multi-process",
    capture: "wkwebview-snapshot", private_spi: [...WEBKIT_MAC_PRIVATE_SPI],
    render_path: surface ? WEBKIT_MAC_RENDER_PATH_SURFACE : WEBKIT_MAC_RENDER_PATH_PIPE, engine_instance: instance,
    capabilities: { surface, external_begin_frame: surface && beginFrames, frame_rate: rate, observe: true, navigate: true, back: true,
      forward: true, reload: true, stop: true, close: true, input: true, edit: true, visibility: true, cursor: false,
      multi_target: true, max_targets: 32, persistent_profile: false, open_in_tab: false, devtools: false, ime: false,
      ime_commit: true, key_verdict: false, wheel_phases: false, pinch: false, frame_rate_command: true, private_mode: false,
      fixture_only: true, permissions: false, downloads: false, popups: false, accessibility: false, file_dialogs: false,
      javascript_dialogs: false, heartbeat_interval_ms: 1000, context_menu: false, http_auth: false, find: false, zoom: false,
      popup_blocked: false, media_capture: false, favicon: false, text_input: false, frame_damage: false,
      // The shared core (stream_core.hpp) reports the Linux pipe features; macOS never negotiates them.
      damage_payload: false, frame_transport: "pipe", ...capabilities },
    ...overrides };
}

/** Stand-in for nsIAxioEngineEndpoint (apps/browser/native/engine-view): records every call. */
function fakeEndpoint({ externalBeginFrames = true } = {}) {
  const calls = [];
  let tokenTaken = false;
  return { calls, serviceName: "dev.axiosozo.surface." + "a".repeat(32), externalBeginFrames, listener: null,
    expectHostPid(pid) { calls.push(["expectHostPid", pid, tokenTaken]); },
    takeToken() { if (tokenTaken) throw new Error("token taken"); tokenTaken = true; calls.push(["takeToken"]); return "ef".repeat(32); },
    bindElement(element, id, document, navigation) { calls.push(["bindElement", element, id, document, navigation]); },
    setTargetGenerations(id, document, navigation) { calls.push(["setTargetGenerations", id, document, navigation]); },
    unbindTarget(id) { calls.push(["unbindTarget", id]); },
    setTargetVisible(id, visible) { calls.push(["setTargetVisible", id, visible]); },
    getTargetStats() { return { presented: 3, released: 2 }; },
    close() { calls.push(["close"]); } };
}

/** A scripted WKWebView host in surface mode: JSON events only, frames "arrive" via onTargetGeometry. */
function fakeMacHost({ ready = macReady(), endpoint = null } = {}) {
  const pipe = new Pipe(), writes = [];
  let finish, current = null;
  const exit = new Promise(resolve => { finish = resolve; });
  const event = value => pipe.push(packet(1, { version: 1, ...value }));
  const tab = (value, target = current) => event({ ...value, target });
  const geometry = (w = 4, h = 4, scale = 2) => endpoint?.listener.onTargetGeometry(7, w * scale, h * scale, w, h, scale);
  const process = {
    pid: 5151, stdout: { read: n => pipe.read(n) }, stderr: { read: async () => new ArrayBuffer(0) }, wait: () => exit,
    kill: async () => { pipe.close(); finish({ exitCode: -15 }); },
    stdin: {
      close: async () => { pipe.close(); finish({ exitCode: 0 }); },
      write: async text => {
        const command = JSON.parse(text); writes.push(command);
        if (command.method === "hello") { event(ready); return; }
        if (command.method === "shutdown") {
          event({ event: "accepted", request_id: command.request_id }); event({ event: "completed", request_id: command.request_id, status: "success" });
          setImmediate(() => { pipe.close(); finish({ exitCode: 0 }); }); return;
        }
        event({ event: "accepted", request_id: command.request_id });
        if (command.method === "create") {
          current = { ...command.target, engine: "webkit", native_target_id: "7" };
          tab({ event: "created", request_id: command.request_id });
          event({ event: "completed", request_id: command.request_id, status: "success" });
          tab({ event: "url", url: command.url });
          tab({ event: "load", http_status: 200, restored_from_history: false });
          if (endpoint) setImmediate(() => geometry());
          else pipe.push(packet(2, { version: 1, target: current, frame_id: 1, width: 8, height: 8, stride: 32, device_scale: 2, format: "BGRA8" },
            new Uint8Array(256).fill(0xff)));
        } else if (command.method === "navigate") {
          current = { ...current, document_generation: current.document_generation + 1, navigation_generation: current.navigation_generation + 1 };
          tab({ event: "navigation" }); tab({ event: "url", url: command.url }); tab({ event: "load", http_status: 200, restored_from_history: false });
          event({ event: "completed", request_id: command.request_id, status: "success" });
        } else event({ event: "completed", request_id: command.request_id, status: "success" });
      },
    },
  };
  return { process, writes, event, tab, geometry, pipe, finish, get current() { return current; } };
}

async function surfaceHost({ ready, beginFrames = true, rate = 60 } = {}) {
  const endpoint = fakeEndpoint({ externalBeginFrames: beginFrames });
  const fake = fakeMacHost({ ready: ready ?? macReady({ surface: true, beginFrames, rate }), endpoint });
  const failures = [], geometries = [], events = [];
  const host = new EngineStreamHost(fake.process, { profile: webkitProfile({ platform: "macos-arm64" }), token, instance, identity: origin,
    timers, requestPrefix: "wk", heartbeatTimeout: 1e9, onFailure: error => failures.push(error.message),
    surface: { endpoint, service: { name: "service" }, frameRate: rate } });
  return { endpoint, fake, host, failures, geometries, events };
}
const canvas = { tagName: "canvas" };

test("macOS arm64 is a WebKit platform with its own host, build root, session runtime and environment", () => {
  assert.equal(webkitPlatform("Darwin", "aarch64-gcc3"), "macos-arm64");
  assert.equal(webkitPlatform("Darwin", "x86_64-gcc3"), null, "no Intel Mac host is built or tested");
  assert.equal(webkitPlatform("Linux", "x86_64-gcc3"), "linux-x86_64", "Linux unchanged");
  assert.equal(webkitBinaryPath(ROOT, "macos-arm64"), BINARY);
  assert.equal(webkitBinaryPath(`${ROOT}/workstation`, "macos-arm64"), `${ROOT}/workstation/webkit/AxioWebKitMacHost`);
  assert.equal(webkitBinaryPath("/home/user/build", "macos-arm64"), null, "macOS build roots live on the project volume");
  assert.equal(webkitBinaryPath("/Volumes/../etc", "macos-arm64"), null);
  assert.equal(webkitBinaryPath("/home/user/build"), "/home/user/build/webkit/AxioWebKitHost", "Linux default unchanged");
  const session = `${ROOT}/runtime/0123456789abcdef/main`;
  assert.equal(validWebKitSessionRuntime(ROOT, session, `${session}/gecko`, "macos-arm64"), true);
  assert.equal(validWebKitSessionRuntime(ROOT, session, `${session}/other`, "macos-arm64"), false);
  assert.deepEqual(webkitHostEnvironment("/p", "macos-arm64"), { PATH: "/usr/bin:/bin:/usr/sbin:/sbin", TMPDIR: "/p/tmp" },
    "macOS host environment: exactly PATH and TMPDIR");
  const prefs = { getBoolPref: (name, fallback) => (name === "axiosozo.engines.webkit.enabled" ? true : fallback) };
  const env = values => name => values[name] ?? "";
  const base = { AXIOSOZO_BUILD_ROOT: ROOT, AXIOSOZO_WEBKIT_BINARY: BINARY, AXIOSOZO_ENGINE_FIXTURE_ORIGIN: origin };
  assert.deepEqual(webkitAvailability({ os: "Darwin", abi: "aarch64-gcc3", prefs, env: env(base) }), { available: true, reason: null, fixtureOnly: true });
  assert.equal(webkitAvailability({ os: "Darwin", abi: "aarch64-gcc3", prefs, env: env({ ...base, AXIOSOZO_WEBKIT_BINARY: "" }) }).reason,
    "The WebKit engine is not installed");
  assert.equal(webkitAvailability({ os: "Darwin", abi: "aarch64-gcc3", prefs: { getBoolPref: () => false }, env: env(base) }).reason,
    "WebKit is not enabled in this browser");
  assert.equal(webkitAvailability({ os: "Darwin", abi: "aarch64-gcc3", prefs, env: env({ ...base, AXIOSOZO_ENGINE_FIXTURE_ORIGIN: "" }) }).reason,
    "WebKit runs only the local test page for now");
});

test("the WKWebView ready identity is exact: port, sandbox, capture, private SPI list, render path and surface capabilities", () => {
  assert.equal(validateWebKitMacReady(macReady(), { surface: true, externalBeginFrames: true, frameRate: 60 }), true);
  assert.equal(validateWebKitMacReady(macReady({ surface: false }), { surface: false }), true);
  const refuse = (ready, options = { surface: true, externalBeginFrames: true, frameRate: 60 }) =>
    assert.throws(() => validateWebKitMacReady(ready, options), /UNVERIFIED_WEBKIT_RUNTIME/u, JSON.stringify(options));
  refuse(macReady({}, { webkit_port: "wpe" }));
  refuse(macReady({}, { sandbox: "none" }));
  refuse(macReady({}, { sandbox_configured: false }));
  refuse(macReady({}, { private_spi: [...WEBKIT_MAC_PRIVATE_SPI, "_setDrawsBackground:"] }), undefined);
  refuse(macReady({}, { private_spi: [] }));
  refuse(macReady({}, { runtime_webkit: "1.0" }));
  refuse(macReady({}, { platform: "macos-15.7-x86_64" }));
  refuse(macReady({}, { webkit: "../../etc" }));
  refuse(macReady({ surface: false }));                                    // surface negotiated, pipe reported
  refuse(macReady(), { surface: false });                                   // pipe negotiated, surface reported
  refuse(macReady({ beginFrames: false }));                                 // begin frames mismatch
  refuse(macReady({ rate: 120 }));                                          // frame rate mismatch
  refuse(macReady({}, {}, { downloads: true }));
  refuse(macReady({}, {}, { fixture_only: false }));
  refuse(macReady({}, {}, { frame_damage: true }));
  assert.ok(true);
});

test("surface mode: the hello carries the endpoint's service and one-time token, never pipe damage; ready is checked", async () => {
  const f = await surfaceHost();
  await f.host.connect();
  const hello = f.fake.writes[0];
  assert.deepEqual(Object.keys(hello).sort(), ["engine_instance", "fixture_origin", "frame_rate", "method", "surface_begin_frames",
    "surface_service", "surface_token", "token", "version"]);
  assert.equal(hello.surface_service, f.endpoint.serviceName);
  assert.equal(hello.surface_token, "ef".repeat(32));
  assert.notEqual(hello.surface_token, hello.token);
  assert.equal(hello.frame_rate, 60);
  assert.deepEqual(f.endpoint.calls.slice(0, 2), [["expectHostPid", 5151, false], ["takeToken"]], "pid registered before the token leaves");
  assert.equal(f.host.surfaceMode, true);
  assert.throws(() => new EngineStreamHost(f.fake.process, { profile: webkitProfile({ platform: "macos-arm64" }), token, instance,
    identity: origin, timers, frameDamage: true, surface: { endpoint: fakeEndpoint(), frameRate: 60 } }), /INVALID_ENGINE_BOOTSTRAP/u);
  for (const ready of [macReady({ surface: false }), macReady({ rate: 120 }), macReady({ beginFrames: false })]) {
    const g = await surfaceHost({ ready });
    await assert.rejects(g.host.connect(), /UNVERIFIED_ENGINE_RUNTIME/u);
    assert.ok(g.endpoint.calls.some(call => call[0] === "close"), "a refused host closes its endpoint");
  }
});

test("Linux pipe features (damage_payload, memfd frames) never combine with macOS surface mode", async () => {
  const profile = webkitProfile({ platform: "macos-arm64" });
  for (const options of [{ damagePayload: true }, { frameTransport: "memfd" }, { frameDamage: true, damagePayload: true }]) {
    assert.throws(() => new EngineStreamHost(fakeMacHost().process, { profile, token, instance, identity: origin, timers, ...options,
      surface: { endpoint: fakeEndpoint(), frameRate: 60 } }), /INVALID_ENGINE_BOOTSTRAP/u, JSON.stringify(options));
  }
  const refuse = (capabilities, options) =>
    assert.throws(() => validateWebKitMacReady(macReady(options, {}, capabilities), options), /UNVERIFIED_WEBKIT_RUNTIME/u, JSON.stringify(capabilities));
  for (const options of [{ surface: true, externalBeginFrames: true, frameRate: 60 }, { surface: false, frameDamage: true }]) {
    refuse({ damage_payload: true }, options);
    refuse({ frame_transport: "memfd" }, options);
    refuse({ memfd: { fd: 3, slot_bytes: 1024, slots: 2 } }, options);
  }
  // The pipe fallback still works with frame damage only; its hello asks for nothing else.
  assert.equal(validateWebKitMacReady(macReady({ surface: false }, {}, { frame_damage: true }), { surface: false, frameDamage: true }), true);
  const fake = fakeMacHost({ ready: macReady({ surface: false }) });
  const host = new EngineStreamHost(fake.process, { profile, token, instance, identity: origin, timers, frameDamage: false,
    requestPrefix: "wk", heartbeatTimeout: 1e9 });
  await host.connect();
  assert.deepEqual(Object.keys(fake.writes[0]).sort(), ["engine_instance", "fixture_origin", "method", "token", "version"]);
  assert.equal(host.frameTransport, "pipe");
  await host.shutdown();
});

test("surface mode: create binds the canvas, load confirms generations after chrome saw them, geometry is the first frame", async () => {
  const f = await surfaceHost();
  await f.host.connect();
  const events = [], geometries = [];
  const adapter = new WebKitEngineAdapter(f.host, { pendingTarget: pending, element: canvas,
    onEvent: event => events.push([event.event, f.endpoint.calls.length]), onGeometry: geometry => geometries.push(geometry),
    onFrame: () => { throw new Error("no pipe frames in surface mode"); } });
  assert.equal(adapter.surfaceMode, true);
  assert.equal(adapter.maxSurfaceBytes, Infinity);
  // 1800x1200 at 2x is 3600x2400 BGRA (34.6 MB): over the pipe cap, inside the IOSurface bound.
  assert.deepEqual(validateStreamSurface({ width: 1800, height: 1200, device_scale: 2 }, { maxBytes: adapter.maxSurfaceBytes }),
    { width: 1800, height: 1200, device_scale: 2 });
  const target = await adapter.create(origin + "/engine.html", { width: 4, height: 4, device_scale: 2 });
  assert.equal(target.native_target_id, "7");
  const bind = f.endpoint.calls.find(call => call[0] === "bindElement");
  assert.deepEqual(bind, ["bindElement", canvas, 7, 1, 1]);
  assert.deepEqual(geometries, [{ width: 8, height: 8, logicalWidth: 4, logicalHeight: 4, scale: 2 }]);
  assert.equal(adapter.renderPath, WEBKIT_MAC_RENDER_PATH_SURFACE);
  assert.equal(adapter.webkitVersion, "20621.3.11.11.3");
  // Navigation: the endpoint holds frames of generation 2 until chrome processed url + load.
  await adapter.navigate(target, origin + "/engine.html?page=2");
  await tick();
  const confirm = f.endpoint.calls.findIndex(call => call[0] === "setTargetGenerations" && call[2] === 2 && call[3] === 2);
  assert.ok(confirm > 0, JSON.stringify(f.endpoint.calls));
  const load = events.findLast(([name]) => name === "load");
  assert.ok(load[1] <= confirm, "load reached chrome before the endpoint was allowed to show the new document");
  // Visibility gates begin frames first, then tells the host (which stops snapshotting).
  await adapter.visibility(adapter.target, false);
  assert.deepEqual(f.endpoint.calls.findLast(call => call[0] === "setTargetVisible"), ["setTargetVisible", 7, false]);
  assert.ok(f.fake.writes.some(command => command.method === "visibility" && command.visible === false));
  assert.deepEqual(adapter.surfaceStats(), { presented: 3, released: 2 });
  await assert.rejects(f.host.request("frame_ack", { frame_id: 1 }, adapter.target, { acknowledge: true }), /UNEXPECTED_ENGINE_FRAME/u,
    "a JSON frame_ack is never sent in surface mode");
  await adapter.close();
  assert.ok(f.endpoint.calls.some(call => call[0] === "close"), "closing the host closes the endpoint (and all its bindings)");
  assert.equal(f.host.status, "closed");
});

test("surface mode failures: a pipe frame, surface_failed and endpoint host death end the host with fixed codes", async () => {
  {
    const f = await surfaceHost(); await f.host.connect();
    const adapter = new WebKitEngineAdapter(f.host, { pendingTarget: pending, element: canvas });
    await adapter.create(origin + "/engine.html", { width: 4, height: 4, device_scale: 2 });
    f.fake.pipe.push(packet(2, { version: 1, target: adapter.target, frame_id: 1, width: 1, height: 1, stride: 4, device_scale: 1, format: "BGRA8" },
      new Uint8Array(4)));
    await tick(8);
    assert.deepEqual(f.failures, ["UNEXPECTED_ENGINE_FRAME"]);
    assert.ok(f.endpoint.calls.some(call => call[0] === "close"));
  }
  {
    const f = await surfaceHost(); await f.host.connect();
    f.fake.event({ event: "error", code: "surface_failed", reason: "surface_invalid_release" });
    await tick(8);
    assert.deepEqual(f.failures, ["ENGINE_SURFACE_FAILED"]);
  }
  {
    const f = await surfaceHost(); await f.host.connect();
    f.endpoint.listener.onClosed("host-died");
    assert.deepEqual(f.failures, ["ENGINE_SURFACE_CLOSED"]);
    assert.equal(f.host.surfaceClosedReason, "host-died");
  }
  {
    // A surface create without a canvas to bind is refused before anything is sent.
    const f = await surfaceHost(); await f.host.connect();
    const adapter = new WebKitEngineAdapter(f.host, { pendingTarget: pending });
    await assert.rejects(adapter.create(origin + "/engine.html", { width: 4, height: 4, device_scale: 2 }), /INVALID_ENGINE_CREATE/u);
  }
});

test("macOS keys: kVK codes, Command shortcuts stay with Zen, Command+C/X/V/A/Z edit, Control and Option go to the page", () => {
  const key = (extra = {}) => ({ code: "KeyA", key: "a", keyCode: 65, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false,
    buttons: 0, getModifierState: () => false, ...extra });
  assert.equal(macKeyboardRoute(key()), "page");
  assert.equal(macStreamKey(key(), "down").native_key_code, 0x00, "kVK_ANSI_A");
  assert.equal(macStreamKey(key({ code: "Escape", key: "Escape", keyCode: 27 }), "down").native_key_code, 0x35);
  assert.equal(macStreamKey(key({ code: "ArrowLeft", key: "ArrowLeft", keyCode: 37 }), "down").native_key_code, 0x7B);
  assert.equal(MAC_KEYS.Tab, 0x30); assert.equal(MAC_KEYS.Enter, 0x24); assert.equal(MAC_KEYS.Backspace, 0x33);
  assert.equal(macKeyboardRoute(key({ code: "KeyC", key: "c", metaKey: true })), "edit");
  assert.equal(macKeyboardRoute(key({ code: "KeyZ", key: "z", metaKey: true, shiftKey: true })), "edit");
  assert.equal(macKeyboardRoute(key({ code: "KeyT", key: "t", metaKey: true })), "chrome", "Command+T opens a Zen tab");
  assert.equal(macKeyboardRoute(key({ code: "KeyL", key: "l", metaKey: true })), "chrome");
  assert.equal(macKeyboardRoute(key({ code: "Tab", key: "Tab", ctrlKey: true })), "chrome");
  assert.equal(macKeyboardRoute(key({ code: "F5", key: "F5" })), "chrome");
  assert.equal(macKeyboardRoute(key({ code: "KeyE", key: "e", ctrlKey: true })), "page", "Cocoa Control+E (end of line) stays with the page");
  assert.equal(macKeyboardRoute(key({ code: "KeyE", key: "´", altKey: true })), "page", "Option characters go to the page");
  assert.equal(macKeyboardRoute(key({ code: "", key: "é" })), "text");
  assert.equal(macKeyboardRoute(key({ isComposing: true })), "unsupported");
  assert.equal(linuxKeyboardRoute(key({ code: "KeyT", key: "t", ctrlKey: true })), "chrome", "Linux routing unchanged");
});

// ---- Presenter on macOS (surface canvas) ------------------------------------------------
function macPresenterFixture({ surface = true } = {}) {
  const element = () => ({ style: {}, children: [], handlers: new Map(), attributes: new Map(), width: 300, height: 150,
    setAttribute(k, v) { this.attributes.set(k, v); }, appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null; },
    addEventListener(type, handler) { this.handlers.set(type, handler); }, removeEventListener(type) { this.handlers.delete(type); },
    focus() { this.focused = true; }, hasPointerCapture: () => false, setPointerCapture() {}, releasePointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 4, height: 4 }),
    getContext: () => { if (surface) throw new Error("surface canvases have no JS rendering context"); return { putImageData() {} }; },
    toDataURL: () => "data:," });
  const stack = { ...element(), classList: { contains: value => value === "browserStack" } };
  const browser = { style: { visibility: "" }, parentNode: stack, currentURI: { spec: origin + "/engine.html" },
    getBoundingClientRect: () => ({ width: 4, height: 4 }), loadURI() {}, focus() {} };
  stack.children.push(browser);
  const tab = { linkedBrowser: browser, label: "fixture", isConnected: true, setAttribute() {}, removeAttribute() {}, getAttribute: () => null, toggleAttribute() {} };
  const root = element(); root.toggleAttribute = () => {};
  const original = () => "original";
  const win = { Services: { appinfo: { OS: "Darwin", XPCOMABI: "aarch64-gcc3" },
      env: { get: name => ({ AXIOSOZO_ENGINE_FIXTURE_ORIGIN: origin, AXIOSOZO_BUILD_ROOT: ROOT, AXIOSOZO_WEBKIT_BINARY: BINARY })[name] ?? "" },
      prefs: { getBoolPref: (name, fallback) => (name === "axiosozo.engines.webkit.enabled" ? true : fallback) },
      io: { newURI: spec => ({ spec }) }, scriptSecurityManager: { getSystemPrincipal: () => ({}) } },
    performance, devicePixelRatio: 2, queueMicrotask,
    ImageData: class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } },
    document: { hidden: false, documentElement: root, createElementNS: () => element(), addEventListener() {}, removeEventListener() {},
      getElementById: () => null },
    ResizeObserver: class { observe() {} disconnect() {} }, getComputedStyle: () => ({ position: "static" }),
    requestAnimationFrame: callback => queueMicrotask(callback), setTimeout, clearTimeout,
    gBrowser: { selectedTab: tab, selectedBrowser: browser, tabContainer: { addEventListener() {}, removeEventListener() {} },
      updateTitlebar() {}, setTabTitle: () => "gecko-title", _setTabLabel: (t, label) => { t.label = label; } },
    BrowserCommands: { back: original, forward: original, reload: original },
    UpdateBackForwardCommands: original, gURLBar: { focused: false, setURI() {}, view: { close() {} } }, openTrustedLinkIn: original };
  const geckoTarget = { ...pending, tab_id: "gecko-tab", engine: "gecko", engine_instance: "gecko-window", native_target_id: "3" };
  const gecko = { find: () => ({}), target: () => geckoTarget, resolve: () => {} };
  let live = null;
  const launch = async (_win, callbacks) => {
    const endpoint = surface && callbacks.element ? fakeEndpoint() : null;
    const fake = fakeMacHost({ ready: macReady({ surface: !!endpoint }), endpoint });
    const host = new EngineStreamHost(fake.process, { profile: webkitProfile({ platform: "macos-arm64" }), token, instance, identity: origin,
      timers, requestPrefix: "wk", heartbeatTimeout: 1e9, surface: endpoint ? { endpoint, service: {}, frameRate: 60 } : null });
    await host.connect();
    live = { fake, host, endpoint, callbacks, adapter: new WebKitEngineAdapter(host, { pendingTarget: { ...pending, tab_id: callbacks.tabId },
      element: endpoint ? callbacks.element : null, onGeometry: callbacks.onGeometry, onFrame: callbacks.onFrame,
      onEvent: callbacks.onEvent, onFailure: callbacks.onFailure }) };
    return live.adapter;
  };
  return { win, gecko, launch, tab, browser, stack, get live() { return live; } };
}

test("the presenter binds its canvas to the endpoint on macOS: logical size from geometry, no JS pixels, mac keys", async () => {
  const f = macPresenterFixture();
  const presenter = new WebKitPresenter(f.win, f.gecko, { launch: f.launch });
  const target = await presenter.switchToWebKit();
  assert.equal(target.engine, "webkit");
  const overlay = f.stack.children.at(-1), canvas = overlay.children[0];
  assert.equal(f.live.callbacks.element, canvas, "the overlay canvas is what the endpoint presents into");
  assert.ok(f.live.endpoint.calls.some(call => call[0] === "bindElement" && call[1] === canvas));
  assert.equal(canvas.attributes.get("moz-opaque"), "");
  assert.equal(canvas.style.objectFit, "none"); assert.equal(canvas.style.objectPosition, "0 0");
  assert.equal(canvas.width, 4, "canvas width = logical width from onTargetGeometry"); assert.equal(canvas.height, 4);
  const create = f.live.fake.writes.find(command => command.method === "create");
  assert.equal(create.device_scale, 2, "Retina scale reaches the host");
  const diagnostics = presenter.diagnostics();
  assert.equal(diagnostics.renderPath, WEBKIT_MAC_RENDER_PATH_SURFACE);
  assert.equal(diagnostics.pipeFallback, false);
  assert.equal(diagnostics.frames, 3, "surface frames are counted by the endpoint");
  assert.equal(diagnostics.version, "20621.3.11.11.3");
  assert.throws(() => presenter.captureFixtureFrame(), /WEBKIT_SURFACE_CAPTURE_UNAVAILABLE/u);
  const keyEvent = (extra = {}) => ({ isTrusted: true, code: "KeyX", key: "x", keyCode: 88, shiftKey: false, ctrlKey: false, altKey: false,
    metaKey: false, buttons: 0, getModifierState: () => false, preventDefault() {}, stopPropagation() {}, ...extra });
  canvas.handlers.get("keydown")(keyEvent());
  canvas.handlers.get("keydown")(keyEvent({ code: "KeyT", key: "t", metaKey: true }));
  canvas.handlers.get("keydown")(keyEvent({ code: "KeyC", key: "c", metaKey: true }));
  await tick(8);
  const sent = f.live.fake.writes.filter(command => ["key", "edit"].includes(command.method));
  assert.deepEqual(sent.map(command => [command.method, command.type ?? command.action]), [["key", "down"], ["key", "char"], ["edit", "copy"]]);
  assert.equal(sent[0].native_key_code, MAC_KEYS.KeyX, "kVK_ANSI_X, not an XKB code");
  await presenter.switchToGecko();
  assert.ok(f.live.endpoint.calls.some(call => call[0] === "close"));
  assert.equal(f.live.host.status, "closed");
  await presenter.dispose();
});

test("without the engine-view component the macOS presenter uses the labelled pipe fallback", async () => {
  const f = macPresenterFixture({ surface: false });
  const presenter = new WebKitPresenter(f.win, f.gecko, { launch: f.launch });
  await presenter.switchToWebKit();
  assert.equal(presenter.diagnostics().renderPath, WEBKIT_MAC_RENDER_PATH_PIPE);
  assert.equal(presenter.diagnostics().pipeFallback, true);
  await presenter.dispose();
});

test("the three-engine controls install on macOS arm64 when the WKWebView host is configured", async () => {
  const f = macPresenterFixture();
  f.win.gBrowser.tabContainer = { addEventListener() {}, removeEventListener() {} };
  const controls = installWebKitEngine(f.win, f.gecko, { Presenter: class extends WebKitPresenter {
    constructor(win, gecko, options) { super(win, gecko, { ...options, launch: f.launch }); } } });
  assert.ok(controls, "installed");
  assert.equal(controls.diagnostics().webkit.available, true);
  await controls.switchTo("webkit");
  assert.equal(controls.engineOf(f.tab), "webkit");
  await controls.switchTo("gecko");
  await controls.dispose();
  const intel = macPresenterFixture();
  intel.win.Services.appinfo.XPCOMABI = "x86_64-gcc3";
  assert.equal(installWebKitEngine(intel.win, intel.gecko, {}), null, "no host for Intel Macs: nothing changes");
  const missing = macPresenterFixture();
  missing.win.Services.env.get = () => "";
  assert.equal(installWebKitEngine(missing.win, missing.gecko, {}), null);
});
