// webkit-feel: the browser-UI profile of WebKit tabs (engine-stream-v1 §8.2), pure parts.
import test from "node:test";
import assert from "node:assert/strict";

import { validateWebKitUIEvent, validateWebKitUICommand, validateWebKitUIInput, validateWebKitReady, webkitProfile, CSS_CURSORS,
  WEBKIT_VERSION, LIBWPE_VERSION, WPEBACKEND_FDO_VERSION } from "../chrome/WebKitEngineAdapter.sys.mjs";
import { zenOwnsShortcut, smoothWheelProgress, WHEEL_SMOOTH_MS } from "../chrome/WebKitPresenter.sys.mjs";
import { TextChunks, NOTICES, FIXTURE_PERMISSION_STORE } from "../chrome/WebKitBrowserUI.sys.mjs";
import { engineNote, tabMenuModel } from "../chrome/EngineRegistry.sys.mjs";

const target = { tab_id: "t", engine: "webkit", engine_instance: "webkit-1", native_target_id: "1", identity: "http://127.0.0.1:8000",
  document_generation: 1, navigation_generation: 1, private_mode: false };
const prompt = (kind, details, extra = {}) => ({ version: 1, event: "prompt", target, prompt_id: "prompt-1", kind, timeout_ms: 300000, details, ...extra });

test("prompts use cef-v1's delegation schema; option menus have their own strict shape", () => {
  assert.ok(validateWebKitUIEvent(prompt("dialog", { dialog_type: "alert", origin_url: "http://127.0.0.1:8000/engine.html", message: "hi", default_text: "" })));
  assert.ok(validateWebKitUIEvent(prompt("before_unload", { dialog_type: "beforeunload", is_reload: false })));
  assert.ok(validateWebKitUIEvent(prompt("permission", { origin: "http://127.0.0.1:8000", permissions: ["notifications"] })));
  assert.ok(validateWebKitUIEvent(prompt("option_menu", { x: 1, y: 2, width: 100, height: 20,
    items: [{ label: "one", group: false, child: false, enabled: true, selected: true }] })));
  assert.throws(() => validateWebKitUIEvent(prompt("option_menu", { x: 1, y: 2, width: 100, height: 20, items: [{ label: "x" }] })));
  assert.throws(() => validateWebKitUIEvent(prompt("dialog", { dialog_type: "alert", origin_url: "javascript:1", message: "", default_text: "" })));
  // A fixture host never asks for downloads or HTTP credentials.
  assert.throws(() => validateWebKitUIEvent(prompt("download", { download_id: 1, suggested_name: "a", url: "", mime_type: "", total_bytes: 0 })));
  assert.throws(() => validateWebKitUIEvent(prompt("dialog", { dialog_type: "alert", origin_url: "", message: "", default_text: "" }, { prompt_id: "x-1" })));
});

test("favicon, text_input and chunked text events are bounded", () => {
  const event = (name, fields) => ({ version: 1, event: name, target, ...fields });
  assert.ok(validateWebKitUIEvent(event("favicon", { icon: "" })));
  assert.ok(validateWebKitUIEvent(event("favicon", { icon: "data:image/png;base64,iVBORw0KGgo=" })));
  assert.throws(() => validateWebKitUIEvent(event("favicon", { icon: "data:image/svg+xml,<svg/>" })));
  assert.throws(() => validateWebKitUIEvent(event("favicon", { icon: "data:image/png;base64," + "A".repeat(8000) })));
  assert.ok(validateWebKitUIEvent(event("text_input", { mode: "text", caret_x: 1, caret_y: 2, caret_width: 0, caret_height: 18 })));
  assert.throws(() => validateWebKitUIEvent(event("text_input", { mode: "secret", caret_x: 1, caret_y: 2, caret_width: 0, caret_height: 18 })));
  assert.ok(validateWebKitUIEvent(event("clipboard_text", { text: "abc", part: 1, parts: 1 })));
  assert.throws(() => validateWebKitUIEvent(event("clipboard_text", { text: "", part: 1, parts: 1 })));
  assert.throws(() => validateWebKitUIEvent(event("text_selection", { text: "a", part: 2, parts: 1 })));
  assert.throws(() => validateWebKitUIEvent(event("text_selection", { text: "x".repeat(1801), part: 1, parts: 1 })));
});

test("replies and input methods have exact fields", () => {
  assert.deepEqual(validateWebKitUICommand("option_menu_reply", { prompt_id: "prompt-3", index: -1 }), { prompt_id: "prompt-3", index: -1 });
  assert.throws(() => validateWebKitUICommand("option_menu_reply", { prompt_id: "prompt-3", index: 2000 }));
  assert.ok(validateWebKitUICommand("dialog_reply", { prompt_id: "prompt-3", accept: true, text: "" }));
  assert.ok(validateWebKitUICommand("find", { text: "needle", forward: true, match_case: false, find_next: false }));
  assert.throws(() => validateWebKitUICommand("download_reply", { prompt_id: "prompt-3", path: "/tmp/x" }), "not offered by WebKit");
  const surface = { width: 900, height: 650, device_scale: 1 };
  assert.deepEqual(validateWebKitUIInput("ime_set_composition", { text: "にほん", selection_start: 3, selection_end: 3 }, surface),
    { text: "にほん", selection_start: 3, selection_end: 3 });
  assert.throws(() => validateWebKitUIInput("ime_set_composition", { text: "ab", selection_start: 2, selection_end: 1 }, surface));
  assert.deepEqual(validateWebKitUIInput("paste_text", { text: "x", x: 10, y: 20 }, surface), { text: "x", x: 10, y: 20 });
  assert.throws(() => validateWebKitUIInput("paste_text", { text: "x", x: 1000, y: 20 }, surface));
  assert.equal(validateWebKitUIInput("key", {}, surface), null, "other methods fall through to the common validator");
});

test("ready: browser UI turns on exactly its capabilities, web-like ones stay off", () => {
  const base = { engine: "webkit", webkit_port: "wpe", webkit: WEBKIT_VERSION, runtime_webkit: WEBKIT_VERSION, libwpe: LIBWPE_VERSION,
    wpebackend_fdo: WPEBACKEND_FDO_VERSION, platform: "linux-x86_64", sandbox_configured: true, sandbox: "bubblewrap",
    process_model: "multi-process", render_path: "wpe-fdo-shm-bgra", engine_instance: "webkit-1" };
  const caps = { surface: false, external_begin_frame: false, fixture_only: true, devtools: false, private_mode: false,
    persistent_profile: false, open_in_tab: false, popups: false, downloads: false, permissions: false, javascript_dialogs: false,
    file_dialogs: false, http_auth: false, media_capture: false, key_verdict: false, ime: false, pinch: false, accessibility: false,
    multi_target: true, ime_commit: true, frame_rate: 60, browser_ui: false };
  assert.ok(validateWebKitReady({ ...base, capabilities: caps }));
  const ui = { ...caps, browser_ui: true, javascript_dialogs: true, context_menu: true, option_menu: true, permissions: true,
    file_dialogs: true, find: true, zoom: true, favicon: true, clipboard: true, ime: true, text_input: true, cursor_set: "css" };
  assert.ok(validateWebKitReady({ ...base, capabilities: ui }, { browserUI: true }));
  assert.throws(() => validateWebKitReady({ ...base, capabilities: ui }), "unasked browser UI is refused");
  assert.throws(() => validateWebKitReady({ ...base, capabilities: { ...ui, downloads: true } }, { browserUI: true }));
  assert.throws(() => validateWebKitReady({ ...base, capabilities: { ...ui, http_auth: true } }, { browserUI: true }));
  const profile = webkitProfile({ browserUI: true });
  assert.deepEqual(profile.hello, { browser_ui: true });
  assert.ok(profile.cursors.has("col-resize") && CSS_CURSORS.has("grab"));
  assert.equal(webkitProfile().hello, undefined, "hosts without browser UI keep the old hello");
});

test("Zen owns the chords its keysets bind; others reach the page", () => {
  const keys = [{ key: "t", keyCode: null, modifiers: ["accel"] }, { key: "T", keyCode: null, modifiers: ["accel", "shift"] },
    { key: "+", keyCode: null, modifiers: ["accel"] }, { key: "", keyCode: 116, modifiers: [] }];
  const ev = (key, mods = {}) => ({ key, keyCode: mods.keyCode ?? 0, ctrlKey: !!mods.ctrl, shiftKey: !!mods.shift, altKey: !!mods.alt, metaKey: false });
  assert.ok(zenOwnsShortcut(ev("t", { ctrl: true }), keys));
  assert.ok(zenOwnsShortcut(ev("T", { ctrl: true, shift: true }), keys));
  assert.ok(zenOwnsShortcut(ev("+", { ctrl: true, shift: true }), keys), "a shifted symbol still matches");
  assert.ok(zenOwnsShortcut(ev("F5", { keyCode: 116 }), keys));
  assert.ok(!zenOwnsShortcut(ev("Enter", { ctrl: true }), keys));
  assert.ok(!zenOwnsShortcut(ev("t", { ctrl: true, alt: true }), keys));
});

test("a notch scrolls its whole distance, eased over Gecko's smooth-scroll time", () => {
  assert.equal(smoothWheelProgress(-57, 0), 0);
  assert.equal(smoothWheelProgress(-57, WHEEL_SMOOTH_MS), -57);
  assert.equal(smoothWheelProgress(-57, WHEEL_SMOOTH_MS * 2), -57);
  const half = smoothWheelProgress(-57, WHEEL_SMOOTH_MS / 2);
  assert.ok(half < -28 && half > -57, "ease-out: more than half the distance at half the time");
});

test("text chunks reassemble in order and restart on a gap", async () => {
  const chunks = new TextChunks();
  assert.equal(chunks.add({ text: "ab", part: 1, parts: 2 }), null);
  assert.equal(chunks.add({ text: "cd", part: 2, parts: 2 }), "abcd");
  assert.equal(chunks.add({ text: "x", part: 2, parts: 2 }), null, "no part 1 first");
  assert.equal(chunks.add({ text: "x", part: 1, parts: 1 }), "x");
  assert.equal(await FIXTURE_PERMISSION_STORE.get("http://127.0.0.1:1", "notifications"), null, "fixture mode remembers nothing");
  assert.match(NOTICES.download_denied, /Firefox/u);
});

test("tab menu notes: experimental engines and fixture-only lineups say so", () => {
  const engine = { experimental: true, available: () => ({ available: true, fixtureOnly: true }) };
  assert.equal(engineNote({ engine, disabled: false, reason: null }, {}), "Experimental · test page only");
  assert.equal(engineNote({ engine, disabled: true, reason: "WebKit is not enabled in this browser" }, {}), "WebKit is not enabled in this browser");
  assert.equal(engineNote({ engine: { experimental: false, available: () => ({ available: true }) }, disabled: false }, {}), "");
  const window = { Services: { env: { get: name => (name === "AXIOSOZO_ENGINE_SWITCHING" ? "1" : "") }, prefs: { getBoolPref: () => false } } };
  assert.equal(tabMenuModel("gecko", window).items[0].note, "Experimental");
});
