/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Zen-side WebKit engine: engine-stream-v1 client (WebKit fixture profile), presenter
// and three-engine controls. Every packet here is a visibly scripted protocol fixture:
// none of it is WebKit rendering, Zen E1/E2 or screenshot evidence.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import "./support/chrome-modules.mjs";

const stream = await import("../chrome/EngineStreamClient.sys.mjs");
const webkit = await import("../chrome/WebKitEngineAdapter.sys.mjs");
const { WebKitPresenter, linuxKeyboardRoute, streamKey, XKB_KEYS, bgraToRGBA, editAction } = await import("../chrome/WebKitPresenter.sys.mjs");
const { installWebKitEngine } = await import("../chrome/WebKitEngineControls.sys.mjs");
const { installEngineTabs } = await import("../chrome/EngineTabs.sys.mjs");
const { isEngineAvailable } = await import("../chrome/EngineRegistry.sys.mjs");
const engineAvailabilityOf = win => isEngineAvailable("chromium", win);
const { EngineStreamHost, readStreamPacket, validateStreamInput, allowedFixtureURL, fitStreamSurface } = stream;
const { WebKitEngineAdapter, webkitProfile, validateWebKitReady, webkitHostEnvironment, validWebKitSessionRuntime,
  webkitBinaryPath, WEBKIT_VERSION, LIBWPE_VERSION, WPEBACKEND_FDO_VERSION } = webkit;

const origin = "http://127.0.0.1:41231";
const token = "cd".repeat(32);
const instance = "webkit-fixture-instance";
const pending = { tab_id: "tab-1", engine_instance: instance, identity: origin, document_generation: 1, navigation_generation: 1, private_mode: false };
const timers = { setTimeout, clearTimeout };
const tick = (n = 4) => new Promise(resolve => { const step = left => left ? setImmediate(() => step(left - 1)) : resolve(); step(n); });

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

export function readyEvent(overrides = {}, capabilities = {}) {
  return { event: "ready", engine: "webkit", webkit_port: "wpe", webkit: WEBKIT_VERSION, runtime_webkit: WEBKIT_VERSION,
    libwpe: LIBWPE_VERSION, wpebackend_fdo: WPEBACKEND_FDO_VERSION, platform: "linux-x86_64", sandbox_configured: true,
    sandbox: "bubblewrap", process_model: "multi-process", render_path: "wpe-fdo-shm-bgra", engine_instance: instance,
    capabilities: { surface: false, external_begin_frame: false, frame_rate: 60, observe: true, navigate: true, back: true,
      forward: true, reload: true, stop: true, close: true, input: true, edit: true, visibility: true, cursor: true,
      multi_target: true, max_targets: 32, persistent_profile: false, open_in_tab: false, devtools: false, ime: false,
      ime_commit: true, key_verdict: false, wheel_phases: true, pinch: false, frame_rate_command: true, private_mode: false,
      fixture_only: true, permissions: false, downloads: false, popups: false, accessibility: false, file_dialogs: false,
      javascript_dialogs: false, heartbeat_interval_ms: 1000, context_menu: false, http_auth: false, find: false, zoom: false,
      popup_blocked: false, media_capture: false, favicon: false, text_input: false, frame_damage: true, ...capabilities },
    ...overrides };
}

/** A scripted stand-in for AxioWebKitHost following engine-stream-v1 §8 (frames 2x2, damage on). */
function fakeHost({ ready = readyEvent(), frameDamage = true, exitCode = 0 } = {}) {
  const pipe = new Pipe(), writes = [];
  let finish, current = null, frameId = 1, lastFrame = null;
  const exit = new Promise(resolve => { finish = resolve; });
  const event = value => pipe.push(packet(1, { version: 1, ...value }));
  const tab = (value, target = current) => event({ ...value, target });
  const frame = (damage = null, target = current) => {
    const metadata = { version: 1, target, frame_id: frameId++, width: 2, height: 2, stride: 8, device_scale: 1, format: "BGRA8" };
    if (frameDamage) metadata.damage = damage ?? [[0, 0, 2, 2]];
    lastFrame = metadata;
    pipe.push(packet(2, metadata, new Uint8Array(16).fill(0xff)));
  };
  const advance = () => {
    current = { ...current, document_generation: current.document_generation + 1, navigation_generation: current.navigation_generation + 1 };
    tab({ event: "navigation" });
  };
  const process = {
    pid: 4242, stdout: { read: n => pipe.read(n) }, stderr: { read: async () => new ArrayBuffer(0) }, wait: () => exit,
    kill: async () => { pipe.close(); finish({ exitCode: -15 }); },
    stdin: {
      close: async () => { pipe.close(); finish({ exitCode }); },
      write: async text => {
        const command = JSON.parse(text); writes.push(command);
        if (command.method === "hello") { event(ready); return; }
        if (command.method === "frame_ack") return;
        if (command.method === "shutdown") { event({ event: "accepted", request_id: command.request_id }); event({ event: "completed", request_id: command.request_id, status: "success" }); setImmediate(() => { pipe.close(); finish({ exitCode: 0 }); }); return; }
        event({ event: "accepted", request_id: command.request_id });
        if (command.method === "create") {
          current = { ...command.target, engine: "webkit", native_target_id: "7" };
          tab({ event: "created", request_id: command.request_id });
          event({ event: "completed", request_id: command.request_id, status: "success" });
          tab({ event: "url", url: command.url }); tab({ event: "title", title: "AxioSozo fixture" });
          tab({ event: "load", http_status: 200, restored_from_history: false });
          tab({ event: "loading", loading: false, can_go_back: false, can_go_forward: false });
          frame();
        } else if (command.method === "navigate") {
          advance(); tab({ event: "url", url: command.url }); tab({ event: "load", http_status: 200, restored_from_history: false });
          tab({ event: "loading", loading: false, can_go_back: true, can_go_forward: false });
          event({ event: "completed", request_id: command.request_id, status: "success" }); frame();
        } else if (command.method === "back") {
          // §8.1 row 12: WebKit's back/forward cache restores with the cached 200.
          advance(); tab({ event: "url", url: origin + "/engine.html" }); tab({ event: "load", http_status: 200, restored_from_history: true });
          event({ event: "completed", request_id: command.request_id, status: "success" }); frame();
        } else event({ event: "completed", request_id: command.request_id, status: "success" });
      },
    },
  };
  return { process, writes, event, tab, frame, pipe, finish, get current() { return current; }, get lastFrame() { return lastFrame; },
    crash: code => { pipe.close(); finish({ exitCode: code }); } };
}

async function connected(options = {}) {
  const fake = fakeHost(options);
  const failures = [], frames = [], events = [];
  const host = new EngineStreamHost(fake.process, { profile: webkitProfile(), token, instance, identity: origin, timers,
    frameDamage: options.frameDamage ?? true, requestPrefix: "wk", onFailure: error => failures.push(error.message) });
  await host.connect();
  const adapter = new WebKitEngineAdapter(host, { pendingTarget: pending, onFrame: (m, p) => frames.push({ m, p }),
    onEvent: e => events.push(e), onFailure: error => failures.push("target:" + error.message) });
  return { fake, host, adapter, failures, frames, events };
}

test("the adapter's WebKit pins are the lockfile's", () => {
  const lock = JSON.parse(readFileSync(new URL("../../../upstreams.lock.json", import.meta.url))).webkit;
  assert.equal(WEBKIT_VERSION, lock.version);
  assert.equal(LIBWPE_VERSION, lock.libwpe.version);
  assert.equal(WPEBACKEND_FDO_VERSION, lock.wpebackend_fdo.version);
  assert.equal(lock.platform, "linux-x86_64");
});

test("hello, ready identity, create and first frame follow the WebKit profile", async () => {
  const f = await connected();
  const hello = f.fake.writes[0];
  assert.deepEqual(Object.keys(hello).sort(), ["engine_instance", "fixture_origin", "frame_damage", "method", "token", "version"]);
  assert.equal(hello.frame_damage, true);
  assert.equal(f.host.ready.webkit, WEBKIT_VERSION);
  const target = await f.adapter.create(origin + "/engine.html", { width: 2, height: 2, device_scale: 1 });
  assert.equal(target.engine, "webkit"); assert.equal(target.native_target_id, "7");
  assert.equal(f.frames.length, 1);
  assert.equal("damage" in f.frames[0].m, false, "the first presented frame is whole");
  await tick();
  const ack = f.fake.writes.find(command => command.method === "frame_ack");
  assert.deepEqual(ack.target, target); assert.equal(ack.frame_id, 1);
  assert.match(f.fake.writes[1].request_id, /^wk-\d+$/u);
  assert.equal(f.adapter.capabilities().engine, "webkit");
  f.fake.frame([[1, 0, 1, 2]]); await tick();
  assert.deepEqual(f.frames[1].m.damage, [[1, 0, 1, 2]], "later frames keep their damage rectangle");
  await f.adapter.close();
  assert.equal(f.host.status, "closed");
  assert.ok(f.fake.writes.some(command => command.method === "shutdown"));
});

test("ready from an unpinned, web-capable or sandbox-less host is refused", async () => {
  for (const ready of [readyEvent({ webkit: "2.50.0", runtime_webkit: "2.50.0" }), readyEvent({ platform: "linux-aarch64" }),
    readyEvent({}, { fixture_only: false }), readyEvent({}, { downloads: true }), readyEvent({ sandbox: "none" }),
    readyEvent({ cef: "x" }), readyEvent({}, { frame_damage: false }), readyEvent({}, { key_verdict: true })]) {
    const fake = fakeHost({ ready });
    const host = new EngineStreamHost(fake.process, { profile: webkitProfile(), token, instance, identity: origin, timers, frameDamage: true });
    await assert.rejects(host.connect(), /UNVERIFIED_ENGINE_RUNTIME/u);
  }
  assert.throws(() => validateWebKitReady(readyEvent({ render_path: "native-osr-bgra" }), { frameDamage: true }), /UNVERIFIED_WEBKIT_RUNTIME/u);
});

test("navigation advances both generations, stale input is refused, back accepts the cached 200 restore", async () => {
  const f = await connected();
  const first = await f.adapter.create(origin + "/engine.html", { width: 2, height: 2, device_scale: 1 });
  await f.adapter.navigate(first, origin + "/engine.html?page=2");
  const second = f.adapter.target;
  assert.equal(second.document_generation, 2); assert.equal(second.navigation_generation, 2);
  assert.throws(() => f.adapter.input(first, "key", { type: "down", native_key_code: 9, windows_key_code: 27, modifiers: 0, text: "" }), /STALE_ENGINE_TARGET/u);
  // key down without a verdict completes plainly (§8.1 row 5).
  assert.deepEqual(await f.adapter.input(second, "key", { type: "down", native_key_code: 38, windows_key_code: 65, modifiers: 0, text: "a" }),
    { status: "success", reason: undefined, target: second });
  await f.adapter.input(second, "ime_commit_text", { text: "é" });
  assert.throws(() => f.adapter.input(second, "ime_commit_text", { text: "é", replacement_range: { start: 0, end: 0 } }), /INVALID_ENGINE_IME/u);
  assert.equal((await f.adapter.back(second)).status, "success");
  assert.equal(f.adapter.target.document_generation, 3);
  assert.equal(f.events.filter(e => e.event === "load").at(-1).restored_from_history, true);
  assert.equal(f.adapter.allowedURL("http://127.0.0.1:41231/other.html"), false);
  assert.deepEqual(await f.adapter.navigate(f.adapter.target, "https://example.com/"), { status: "unsupported", reason: "FIXTURE_ONLY" });
  assert.deepEqual(f.failures, []);
  await f.adapter.close();
});

test("frames of an old generation are not presented and the next frame after navigation is whole", async () => {
  const f = await connected();
  const first = await f.adapter.create(origin + "/engine.html", { width: 2, height: 2, device_scale: 1 });
  await f.adapter.navigate(first, origin + "/engine.html?page=2");
  await tick();
  const before = f.frames.length;
  f.fake.frame([[0, 0, 1, 1]], first); // late frame labelled with the old generation
  await tick();
  assert.equal(f.frames.length, before, "the old-generation frame is not presented");
  assert.ok(f.fake.writes.some(command => command.method === "frame_ack" && command.target.document_generation === 1), "but its credit is released");
  f.fake.frame([[0, 0, 1, 1]]); await tick();
  assert.equal("damage" in f.frames.at(-1).m, false, "after a skipped frame the next one is whole");
  assert.equal(f.frames.at(-1).m.target.document_generation, 2);
  f.fake.frame([[0, 0, 1, 1]]); await tick();
  assert.deepEqual(f.frames.at(-1).m.damage, [[0, 0, 1, 1]]);
  await f.adapter.close();
});

test("a history restore without a pending back/forward ends the target; cursor kinds are WebKit's", async () => {
  const f = await connected();
  await f.adapter.create(origin + "/engine.html", { width: 2, height: 2, device_scale: 1 });
  f.fake.tab({ event: "cursor", cursor: "pointer" }); await tick();
  assert.equal(f.events.at(-1).cursor, "pointer");
  f.fake.tab({ event: "cursor", cursor: "grab" }); await tick();
  assert.ok(f.failures.includes("INVALID_ENGINE_CURSOR"));
  const g = await connected();
  await g.adapter.create(origin + "/engine.html", { width: 2, height: 2, device_scale: 1 });
  g.fake.tab({ event: "load", http_status: 200, restored_from_history: true }); await tick();
  assert.ok(g.failures.includes("INVALID_ENGINE_HISTORY_RESTORE"));
});

test("host exit codes 70 and 76 end every target with a fixed code", async () => {
  for (const code of [70, 76]) {
    const f = await connected();
    await f.adapter.create(origin + "/engine.html", { width: 2, height: 2, device_scale: 1 });
    f.fake.crash(code); await tick(8);
    assert.equal(f.host.status, "failed");
    assert.equal(f.adapter.status, "failed");
    assert.ok(f.failures.some(failure => failure === `target:ENGINE_EXIT_${code}` || failure === `ENGINE_EXIT_${code}` || /PROTOCOL_OR_EOF/u.test(failure)), JSON.stringify(f.failures));
  }
});

test("framing: damage outside the frame, a foreign engine and oversized lengths are rejected", async () => {
  const read = async (metadata, damage = true) => {
    const pipe = new Pipe();
    pipe.push(packet(2, metadata, new Uint8Array(16)));
    return readStreamPacket(pipe, { engine: "webkit", identity: origin, damage });
  };
  const target = { ...pending, engine: "webkit", native_target_id: "7" };
  const base = { version: 1, target, frame_id: 1, width: 2, height: 2, stride: 8, device_scale: 1, format: "BGRA8" };
  assert.equal((await read({ ...base, damage: [[0, 0, 2, 2]] })).kind, 2);
  await assert.rejects(read({ ...base, damage: [[1, 1, 2, 2]] }), /INVALID_AXCF_FRAME/u);
  await assert.rejects(read({ ...base, damage: [[0, 0, 1, 1], [1, 1, 1, 1]] }), /INVALID_AXCF_FRAME/u);
  await assert.rejects(read(base), /INVALID_AXCF_FRAME/u, "negotiated damage is required");
  await assert.rejects(read({ ...base, target: { ...target, engine: "chromium" } }), /INVALID_AXCF_FRAME/u);
  await assert.rejects(read({ ...base, damage: [[0, 0, 2, 2]] }, false), /INVALID_AXCF_FRAME/u, "unnegotiated damage key");
  assert.throws(() => validateStreamInput("pinch", { x: 0, y: 0 }, { width: 2, height: 2 }), /INVALID_ENGINE_INPUT/u);
  assert.throws(() => validateStreamInput("wheel", { x: 0, y: 0, modifiers: 0, delta_x: 0, delta_y: 5000 }, { width: 2, height: 2 }), /INVALID_ENGINE_WHEEL/u);
  assert.equal(allowedFixtureURL(origin + "/engine.html?page=2", origin), true);
  assert.equal(allowedFixtureURL(origin + "/engine.html#x", origin), false);
  assert.deepEqual(fitStreamSurface({ width: 2000, height: 2000, device_scale: 2 }), { width: 2000, height: 2000, device_scale: 1.25 });
  assert.deepEqual(fitStreamSurface({ width: 800, height: 600, device_scale: 2 }), { width: 800, height: 600, device_scale: 2 });
});

test("launch inputs: host path, session runtime and environment are fixed", () => {
  assert.equal(webkitBinaryPath("/home/runner/axiosozo-build"), "/home/runner/axiosozo-build/webkit/AxioWebKitHost");
  assert.equal(webkitBinaryPath("/proc/self"), null);
  assert.equal(webkitBinaryPath("relative"), null);
  const root = "/b/root", session = `${root}/runtime/0123456789abcdef/gui-1234`;
  assert.equal(validWebKitSessionRuntime(root, session, `${session}/gecko`), true);
  assert.equal(validWebKitSessionRuntime(root, session, `${session}/other`), false);
  assert.equal(validWebKitSessionRuntime(root, `${root}/runtime/x/../y`, `${root}/runtime/x/../y/gecko`), false);
  assert.deepEqual(webkitHostEnvironment("/p"), { PATH: "/usr/bin:/bin:/usr/sbin:/sbin", HOME: "/p", TMPDIR: "/p/tmp", LANG: "C.UTF-8" });
  assert.equal("WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS" in webkitHostEnvironment("/p"), false);
});

test("Linux keys: XKB hardware codes, Zen keeps Ctrl shortcuts, editing chords go to the engine", () => {
  const key = (code, k, extra = {}) => ({ code, key: k, keyCode: 0, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, buttons: 0, ...extra });
  assert.equal(XKB_KEYS.Escape, 9); assert.equal(XKB_KEYS.ArrowLeft, 113); assert.equal(XKB_KEYS.Tab, 23); assert.equal(XKB_KEYS.KeyA, 38);
  assert.equal(linuxKeyboardRoute(key("KeyA", "a")), "page");
  assert.equal(linuxKeyboardRoute(key("KeyT", "t", { ctrlKey: true })), "chrome");
  assert.equal(linuxKeyboardRoute(key("KeyL", "l", { ctrlKey: true })), "chrome");
  assert.equal(linuxKeyboardRoute(key("Tab", "Tab", { ctrlKey: true })), "chrome");
  assert.equal(linuxKeyboardRoute(key("F5", "F5")), "chrome");
  assert.equal(linuxKeyboardRoute(key("ArrowLeft", "ArrowLeft", { ctrlKey: true })), "page", "word moves stay in the page");
  assert.equal(linuxKeyboardRoute(key("KeyC", "c", { ctrlKey: true })), "edit");
  assert.equal(editAction(key("KeyZ", "Z", { ctrlKey: true, shiftKey: true })), "redo");
  assert.equal(linuxKeyboardRoute(key("", "ß")), "text");
  assert.equal(linuxKeyboardRoute(key("KeyA", "a", { isComposing: true })), "unsupported");
  assert.deepEqual(streamKey(key("KeyA", "a", { keyCode: 65, shiftKey: true }), "down"),
    { type: "down", native_key_code: 38, windows_key_code: 65, modifiers: 2, text: "a" });
});

test("BGRA conversion of only the damaged rectangle", () => {
  const pixels = new Uint8Array([1, 2, 3, 255, 4, 5, 6, 255, 7, 8, 9, 255, 10, 11, 12, 255]).buffer; // 2x2
  assert.deepEqual([...bgraToRGBA(pixels.slice(0), 2, [1, 1, 1, 1])], [12, 11, 10, 255]);
  assert.deepEqual([...bgraToRGBA(pixels.slice(0), 2)].slice(0, 4), [3, 2, 1, 255]);
});

// ---- Presenter (fixture-only canvas in Zen's content area) -----------------------------
function presenterFixture() {
  const listeners = new Map(), observers = [], loads = [], puts = [];
  const element = () => ({ style: {}, children: [], handlers: new Map(), attributes: new Map(),
    setAttribute(k, v) { this.attributes.set(k, v); }, appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null; },
    addEventListener(type, handler) { this.handlers.set(type, handler); }, removeEventListener(type) { this.handlers.delete(type); },
    focus() { this.focused = true; }, hasPointerCapture: () => false, setPointerCapture() {}, releasePointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 2, height: 2 }),
    getContext: () => ({ putImageData: (data, x, y, dx = 0, dy = 0, dw = data.width, dh = data.height) => puts.push({ width: dw, height: dh, x: x + dx, y: y + dy }) }), toDataURL: () => "data:image/png;base64,AAAA" });
  const stack = { ...element(), classList: { contains: value => value === "browserStack" } };
  const browser = { style: { visibility: "" }, parentNode: stack, currentURI: { spec: origin + "/engine.html" },
    getBoundingClientRect: () => ({ width: 2, height: 2 }), loadURI: uri => loads.push(uri.spec), focus() {} };
  stack.children.push(browser);
  const attrs = new Map();
  const tab = { linkedBrowser: browser, label: "fixture", isConnected: true, setAttribute: (k, v) => attrs.set(k, v),
    removeAttribute: k => attrs.delete(k), getAttribute: k => attrs.get(k) ?? null, toggleAttribute() {} };
  const root = element(); root.toggleAttribute = () => {};
  const original = () => "original";
  const win = { Services: { env: { get: name => (name === "AXIOSOZO_ENGINE_FIXTURE_ORIGIN" ? origin : "") },
      io: { newURI: spec => ({ spec }) }, scriptSecurityManager: { getSystemPrincipal: () => ({}) } },
    performance, devicePixelRatio: 1, queueMicrotask,
    document: { hidden: false, documentElement: root, createElementNS: () => element(),
      addEventListener: (t, fn) => listeners.set(t, fn), removeEventListener: t => listeners.delete(t) },
    ImageData: class { constructor(data, width, height) { Object.assign(this, { data, width, height }); } },
    ResizeObserver: class { constructor(callback) { observers.push(callback); } observe() {} disconnect() {} },
    getComputedStyle: () => ({ position: "static" }), requestAnimationFrame: callback => queueMicrotask(callback),
    setTimeout, clearTimeout,
    gBrowser: { selectedTab: tab, selectedBrowser: browser, tabContainer: { addEventListener: (t, fn) => listeners.set(t, fn), removeEventListener: t => listeners.delete(t) },
      updateTitlebar() {}, setTabTitle: () => "gecko-title", _setTabLabel: (t, label) => { t.label = label; } },
    BrowserCommands: { back: original, forward: original, reload: original },
    UpdateBackForwardCommands: original, gURLBar: { focused: false, setURI() {}, view: { close() {} } },
    openTrustedLinkIn: original };
  let geckoTarget = { ...pending, tab_id: "gecko-tab", engine: "gecko", engine_instance: "gecko-window", native_target_id: "3" };
  const gecko = { find: () => ({}), target: () => geckoTarget, resolve: value => { if (value !== geckoTarget) throw new Error("STALE_TARGET"); } };
  let live = null;
  const launch = async (_win, callbacks) => {
    const f = fakeHost();
    const host = new EngineStreamHost(f.process, { profile: webkitProfile(), token, instance, identity: origin, timers, frameDamage: true, requestPrefix: "wk" });
    await host.connect();
    live = { fake: f, host, adapter: new WebKitEngineAdapter(host, { pendingTarget: { ...pending, tab_id: callbacks.tabId },
      onFrame: callbacks.onFrame, onEvent: callbacks.onEvent, onFailure: callbacks.onFailure }) };
    return live.adapter;
  };
  return { win, gecko, launch, tab, browser, stack, puts, loads, attrs, listeners, original,
    get live() { return live; }, mutate: () => { geckoTarget = { ...geckoTarget, document_generation: 9 }; } };
}

test("Gecko → WebKit presents in Zen's content area, uploads only damage, routes input and returns to Gecko", async () => {
  const f = presenterFixture();
  const changes = [];
  const presenter = new WebKitPresenter(f.win, f.gecko, { launch: f.launch, onEngineChange: state => changes.push(state.engine) });
  const target = await presenter.switchToWebKit();
  assert.equal(target.engine, "webkit");
  assert.equal(f.browser.style.visibility, "hidden", "the Gecko browser stays loaded but hidden");
  const overlay = f.stack.children.at(-1);
  assert.equal(overlay.attributes.get("data-axiosozo-engine-view"), "webkit");
  assert.equal(overlay.style.display, "block");
  assert.equal(presenter.engineOf(f.tab), "webkit");
  assert.equal(f.attrs.get("axiosozo-engine"), "webkit");
  assert.equal(f.tab.label, "AxioSozo fixture", "the tab label follows WebKit's title");
  assert.deepEqual(f.puts[0], { width: 2, height: 2, x: 0, y: 0 });
  f.live.fake.frame([[1, 1, 1, 1]]); await tick();
  assert.deepEqual(f.puts.at(-1), { width: 1, height: 1, x: 1, y: 1 }, "a damaged frame uploads its rectangle only");
  const diagnostics = presenter.diagnostics();
  assert.equal(diagnostics.engine, "webkit"); assert.equal(diagnostics.damageFrames, 1);
  assert.equal(diagnostics.uploadedPixels, 5); assert.equal(diagnostics.fullPixels, 8);
  // Typing: down + char with the XKB code; Ctrl+T stays with Zen.
  const canvas = overlay.children[0];
  const keyEvent = (extra = {}) => ({ isTrusted: true, code: "KeyX", key: "x", keyCode: 88, shiftKey: false, ctrlKey: false, altKey: false,
    metaKey: false, buttons: 0, preventDefault() {}, stopPropagation() {}, ...extra });
  canvas.handlers.get("keydown")(keyEvent());
  canvas.handlers.get("keydown")(keyEvent({ code: "KeyT", key: "t", ctrlKey: true }));
  canvas.handlers.get("pointerdown")({ isTrusted: true, clientX: 1, clientY: 1, button: 0, buttons: 1, pointerId: 1, preventDefault() {}, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false });
  canvas.handlers.get("wheel")({ isTrusted: true, clientX: 1, clientY: 1, deltaX: 0, deltaY: 40, deltaMode: 0, buttons: 0, preventDefault() {}, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false });
  await tick(8);
  const sent = f.live.fake.writes.filter(command => ["key", "mouse", "wheel"].includes(command.method));
  assert.deepEqual(sent.map(command => [command.method, command.type ?? null]), [["key", "down"], ["key", "char"], ["mouse", "down"], ["wheel", null]]);
  assert.equal(sent[0].native_key_code, XKB_KEYS.KeyX);
  assert.equal(sent[3].delta_y, -40, "engine-stream wheel sign");
  // Address-bar navigation to page 2 goes to WebKit; Back goes to WebKit.
  f.win.openTrustedLinkIn(origin + "/engine.html?page=2", "current", {});
  await tick(8);
  assert.equal(presenter.diagnostics().url, origin + "/engine.html?page=2");
  f.win.BrowserCommands.back(); await tick(8);
  assert.equal(presenter.diagnostics().target.document_generation, 3);
  f.win.openTrustedLinkIn(origin + "/engine.html?page=2", "current", {}); await tick(8);
  await presenter.switchToGecko();
  assert.equal(f.browser.style.visibility, "");
  assert.equal(f.stack.children.includes(overlay), false);
  assert.deepEqual(f.loads, [origin + "/engine.html?page=2"], "Gecko shows WebKit's address on return");
  assert.equal(presenter.engineOf(f.tab), "gecko");
  assert.equal(f.live.host.status, "closed");
  assert.equal(changes.at(-1), "gecko");
  await presenter.dispose();
  assert.equal(f.win.BrowserCommands.back, f.original);
});

test("a failed candidate, a non-fixture page or a crash keeps the Gecko tab", async () => {
  const f = presenterFixture();
  const failures = [];
  const presenter = new WebKitPresenter(f.win, f.gecko, { launch: async () => { throw new Error("WEBKIT_RUNTIME_UNAVAILABLE"); },
    onFailure: error => failures.push(error.message) });
  await assert.rejects(presenter.switchToWebKit(), /WEBKIT_RUNTIME_UNAVAILABLE/u);
  assert.equal(f.browser.style.visibility, ""); assert.equal(f.stack.children.length, 1);
  assert.deepEqual(failures, ["WEBKIT_RUNTIME_UNAVAILABLE"]);
  f.browser.currentURI = { spec: "https://example.com/" };
  await assert.rejects(presenter.switchToWebKit(), /WEBKIT_LOCAL_FIXTURE_ONLY/u);
  await presenter.dispose();

  const g = presenterFixture();
  const crash = new WebKitPresenter(g.win, g.gecko, { launch: g.launch, onFailure: error => failures.push(error.message) });
  await crash.switchToWebKit();
  g.live.fake.crash(76); await tick(12);
  assert.equal(g.browser.style.visibility, "", "Gecko shown again after the host died");
  assert.equal(crash.engineOf(g.tab), "gecko");
  assert.ok(failures.some(code => /ENGINE_EXIT_76|PROTOCOL_OR_EOF/u.test(code)), JSON.stringify(failures));
  await crash.dispose();

  const h = presenterFixture();
  const raced = new WebKitPresenter(h.win, h.gecko, { launch: async (...args) => { const adapter = await h.launch(...args); h.mutate(); return adapter; } });
  await assert.rejects(raced.switchToWebKit(), /STALE_TARGET/u, "the Gecko tab navigated while WebKit started");
  assert.equal(h.browser.style.visibility, ""); assert.equal(h.live.host.status, "closed");
  await raced.dispose();
});

// ---- Three-engine controls -------------------------------------------------------------------
function controlsWindow({ os = "Linux", enabled = true } = {}) {
  const f = presenterFixture();
  const root = "/b/root";
  f.win.Services.appinfo = { OS: os, XPCOMABI: "x86_64-gcc3" };
  f.win.Services.env.get = name => ({ AXIOSOZO_ENGINE_FIXTURE_ORIGIN: origin, AXIOSOZO_BUILD_ROOT: root,
    AXIOSOZO_WEBKIT_BINARY: `${root}/webkit/AxioWebKitHost` })[name] ?? "";
  f.win.Services.prefs = { getBoolPref: (name, fallback) => ({ "axiosozo.engines.webkit.enabled": enabled })[name] ?? fallback };
  f.win.document.getElementById = () => null;
  return f;
}

test("controls are not installed on macOS or without a WebKit host; on Linux they switch Gecko ↔ WebKit", async () => {
  assert.equal(installWebKitEngine(controlsWindow({ os: "Darwin" }).win, {}), null, "macOS is unchanged");
  const bare = controlsWindow(); bare.win.Services.env.get = () => "";
  assert.equal(installWebKitEngine(bare.win, {}), null);
  const f = controlsWindow();
  const chromiumCalls = [];
  const chromium = { engineOf: () => "gecko", isGeckoTargetActive: () => true, switchToGecko: async () => chromiumCalls.push("gecko"),
    switchToChromium: async () => chromiumCalls.push("chromium"), diagnostics: () => ({ browsingMode: "fixture", pending: false }),
    applyEnginePreference: async () => ({ applied: true }), currentPage: () => null, dispose: async () => chromiumCalls.push("dispose") };
  let controlsWindowPresenter = null;
  class Presenter extends WebKitPresenter { constructor(...args) { super(...args); controlsWindowPresenter = this; } }
  const controls = installWebKitEngine(f.win, f.gecko, { chromium, Presenter: class extends Presenter {
    constructor(win, gecko, options) { super(win, gecko, { ...options, launch: f.launch }); } } });
  assert.ok(controls);
  const state = controls.diagnostics();
  assert.equal(state.tabSwitch, true); assert.equal(state.pending, false); assert.equal(state.disposed, false);
  assert.deepEqual(state.engines.map(e => [e.id, e.available]), [["gecko", true], ["chromium", false], ["webkit", true]],
    "the Chromium probe is not in fixture mode (AXIOSOZO_ENGINE_PROBE unset)");
  await controls.switchTo("webkit");
  assert.equal(controls.engineOf(f.tab), "webkit");
  const geckoTarget = f.gecko.target();
  assert.equal(controls.isGeckoTargetActive(geckoTarget), false, "Gecko action authority is revoked while WebKit owns the tab");
  assert.deepEqual(await controls.applyEnginePreference(f.tab, "webkit"), { applied: false, engine: "webkit", error: "UNAVAILABLE" });
  assert.equal(controls.currentPage().engine, "webkit");
  await assert.rejects(controls.switchTo("chromium"), /ENGINE_UNAVAILABLE/u, "Chromium web mode is off here");
  assert.equal(controls.engineOf(f.tab), "webkit", "a refused switch keeps the tab where it is");
  await controls.switchTo("gecko");
  assert.equal(controls.engineOf(f.tab), "gecko");
  assert.equal(controls.isGeckoTargetActive(geckoTarget), true);
  assert.ok(controlsWindowPresenter);
  await controls.dispose();
  assert.deepEqual(chromiumCalls, ["dispose"]);
});

test("over the fixture-mode Chromium probe the controls offer three engines: Gecko → WebKit → Gecko → Chromium → Gecko", async () => {
  const f = controlsWindow();
  const env = f.win.Services.env.get;
  f.win.Services.env.get = name => (name === "AXIOSOZO_ENGINE_PROBE" ? "1" : env(name));
  let chromiumEngine = "gecko";
  const chromiumCalls = [];
  const chromium = { engineOf: () => chromiumEngine, isGeckoTargetActive: () => chromiumEngine === "gecko",
    switchToGecko: async () => { chromiumCalls.push("gecko"); chromiumEngine = "gecko"; },
    switchToChromium: async () => { chromiumCalls.push("chromium"); chromiumEngine = "chromium"; },
    diagnostics: () => ({ browsingMode: "fixture", pending: false }),
    applyEnginePreference: async () => ({ applied: false }), currentPage: () => null, dispose: async () => chromiumCalls.push("dispose") };
  const controls = installWebKitEngine(f.win, f.gecko, { chromium, Presenter: class extends WebKitPresenter {
    constructor(win, gecko, options) { super(win, gecko, { ...options, launch: f.launch }); } } });
  assert.deepEqual(controls.diagnostics().engines.map(e => [e.id, e.available, e.fixtureOnly ?? false]),
    [["gecko", true, false], ["chromium", true, true], ["webkit", true, true]]);
  await controls.switchTo("webkit");
  assert.equal(controls.engineOf(f.tab), "webkit");
  await controls.switchTo("gecko");
  await controls.switchTo("chromium");
  assert.equal(controls.engineOf(f.tab), "chromium");
  await controls.switchTo("webkit");
  assert.equal(controls.engineOf(f.tab), "webkit", "Chromium → WebKit leaves Chromium through the Gecko hub first");
  await controls.switchTo("gecko");
  assert.equal(controls.engineOf(f.tab), "gecko");
  assert.deepEqual(chromiumCalls, ["chromium", "gecko"]);
  await controls.dispose();
  assert.equal(engineAvailabilityOf(f.win), false, "dispose removes the lineup marker");
});

test("the tab glyph installs for the three-engine controls and cycles through switchTo", async () => {
  const listeners = new Map();
  const tab = { selected: true, closing: false, getAttribute: () => null, setAttribute() {}, removeAttribute() {}, hasAttribute: () => false, querySelector: () => null };
  const win = { document: { documentElement: { setAttribute() {}, removeAttribute() {} }, getElementById: () => ({}), querySelector: () => ({}),
      createElementNS: () => ({}), createProcessingInstruction: () => ({}), insertBefore() {} },
    gBrowser: { tabs: [tab], tabContainer: { addEventListener: (t, fn) => listeners.set(t, fn), removeEventListener() {} } } };
  const calls = [];
  const probe = { diagnostics: () => ({ browsingMode: "fixture", tabSwitch: true }), engineOf: () => "gecko", switchTo: async id => calls.push(id) };
  const tabs = installEngineTabs(win, { engineProbe: probe, timers: { setTimeout: () => 0, clearTimeout() {} } });
  assert.equal(tabs.diagnostics().enabled, true);
  assert.equal(installEngineTabs(win, { engineProbe: { diagnostics: () => ({ browsingMode: "fixture" }) } }).diagnostics().enabled, false,
    "the fixture probe alone keeps no tab glyph");
  tabs.dispose();
});
