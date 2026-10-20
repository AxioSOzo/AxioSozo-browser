/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Presents a WebKit target inside a Zen tab, in Zen's own content area: a chrome
// <canvas> over the tab's browserStack, fed with the host's BGRA pipe frames
// (only the damaged rectangle is converted and uploaded). Zen's tab, address bar
// and back/forward/reload controls are routed to the tab's engine. Fixture mode
// only: the tab's Gecko document stays loaded underneath and is shown again on any
// failure, crash or switch back. Privileged chrome only; nothing is injected into
// any page.
import { launchWebKit, WEBKIT_VERSION } from "./WebKitEngineAdapter.sys.mjs";
import { allowedFixtureURL, validFixtureOrigin, fitStreamSurface } from "./EngineStreamClient.sys.mjs";
import { EngineFrameSurface, convertBGRAInPlace, convertBGRARect, NativeFrame, presentNativeFrame,
  nativeFallbackFrame, nativeFramePNG, representNativeFrame, isNativeFrame } from "./EngineFrameSurface.sys.mjs";
import { WebKitBrowserUI } from "./WebKitBrowserUI.sys.mjs";

const XHTML = "http://www.w3.org/1999/xhtml";
const MAX_WEBKIT_TABS = 8;
export const ENGINE_ATTRIBUTE = "axiosozo-engine";

// XKB hardware keycodes (evdev + 8) by KeyboardEvent.code: the physical key the
// WebKit host passes to libwpe as `hardware_key_code` (§8.1 row 6). Layout and
// keysym come from `text` or windows_key_code, never from this table.
export const XKB_KEYS = Object.freeze({
  Escape: 9, Digit1: 10, Digit2: 11, Digit3: 12, Digit4: 13, Digit5: 14, Digit6: 15, Digit7: 16, Digit8: 17,
  Digit9: 18, Digit0: 19, Minus: 20, Equal: 21, Backspace: 22, Tab: 23, KeyQ: 24, KeyW: 25, KeyE: 26, KeyR: 27,
  KeyT: 28, KeyY: 29, KeyU: 30, KeyI: 31, KeyO: 32, KeyP: 33, BracketLeft: 34, BracketRight: 35, Enter: 36,
  ControlLeft: 37, KeyA: 38, KeyS: 39, KeyD: 40, KeyF: 41, KeyG: 42, KeyH: 43, KeyJ: 44, KeyK: 45, KeyL: 46,
  Semicolon: 47, Quote: 48, Backquote: 49, ShiftLeft: 50, Backslash: 51, KeyZ: 52, KeyX: 53, KeyC: 54, KeyV: 55,
  KeyB: 56, KeyN: 57, KeyM: 58, Comma: 59, Period: 60, Slash: 61, ShiftRight: 62, NumpadMultiply: 63, AltLeft: 64,
  Space: 65, CapsLock: 66, F1: 67, F2: 68, F3: 69, F4: 70, F5: 71, F6: 72, F7: 73, F8: 74, F9: 75, F10: 76,
  Numpad7: 79, Numpad8: 80, Numpad9: 81, NumpadSubtract: 82, Numpad4: 83, Numpad5: 84, Numpad6: 85, NumpadAdd: 86,
  Numpad1: 87, Numpad2: 88, Numpad3: 89, Numpad0: 90, NumpadDecimal: 91, IntlBackslash: 94, F11: 95, F12: 96,
  NumpadEnter: 104, ControlRight: 105, NumpadDivide: 106, AltRight: 108, Home: 110, ArrowUp: 111, PageUp: 112,
  ArrowLeft: 113, ArrowRight: 114, End: 115, ArrowDown: 116, PageDown: 117, Insert: 118, Delete: 119,
  MetaLeft: 133, MetaRight: 134, ContextMenu: 135,
});
// Ctrl chords that edit or move within page text stay with the page.
const PAGE_CHORDS = new Set(["arrowleft", "arrowright", "arrowup", "arrowdown", "backspace", "delete", "home", "end"]);
const EDIT_KEYS = { c: "copy", x: "cut", v: "paste", a: "select_all" };

/** engine-stream-v1 modifier bits (cef-v1 EVENTFLAG). */
export function streamModifiers(event) {
  return (event.getModifierState?.("CapsLock") ? 1 : 0) | (event.shiftKey ? 2 : 0)
    | (event.ctrlKey ? 4 : 0) | (event.altKey ? 8 : 0) | (event.metaKey ? 128 : 0)
    | ((event.buttons & 1) ? 16 : 0) | ((event.buttons & 4) ? 32 : 0) | ((event.buttons & 2) ? 64 : 0);
}

/**
 * Linux key routing without key verdicts (§8.1 row 5): Zen keeps its own
 * shortcuts (Ctrl/Alt/Super chords, F-keys, Ctrl+Tab), editing chords go to the
 * engine's edit command, every other physical key to the page. A printable key
 * this table does not know (another layout) is committed as text.
 */
export function linuxKeyboardRoute(event) {
  if (event.isComposing || event.key === "Dead" || event.key === "Process") return "unsupported";
  const key = String(event.key ?? "").toLowerCase();
  if (event.ctrlKey && !event.altKey && !event.metaKey && (Object.hasOwn(EDIT_KEYS, key) || key === "z" || key === "y")) return "edit";
  if ((event.ctrlKey || event.altKey || event.metaKey) && !(event.ctrlKey && !event.altKey && !event.metaKey && PAGE_CHORDS.has(key))) return "chrome";
  if (/^F\d{1,2}$/u.test(event.key)) return "chrome";
  if (Object.hasOwn(XKB_KEYS, event.code)) return "page";
  return event.key?.length === 1 ? "text" : "unsupported";
}
/**
 * With browser UI (§8.2) Zen owns exactly the chords its own window binds, as Gecko
 * reserves them for the browser: a <key> in the window's keysets (accel = Ctrl on Linux)
 * or an F-key Zen binds. Every other chord and F-key goes to the page, like in a Gecko tab.
 */
export function zenOwnsShortcut(event, keys) {
  const key = String(event.key ?? "");
  for (const entry of keys) {
    if (entry.key ? entry.key.toLowerCase() !== key.toLowerCase() : entry.keyCode !== event.keyCode) continue;
    const want = new Set(entry.modifiers);
    const accel = want.has("accel") || want.has("control");
    if (want.has("any")) return true;
    // A key element without "shift" still matches shifted symbols the layout needs (Ctrl++).
    const shiftOk = want.has("shift") === !!event.shiftKey || (!want.has("shift") && entry.key && entry.key.toUpperCase() === entry.key.toLowerCase());
    if (accel === !!event.ctrlKey && want.has("alt") === !!event.altKey && (want.has("meta") || want.has("os")) === !!event.metaKey && shiftOk) return true;
  }
  return false;
}
/** The window's key elements, read once per window (keysets do not change while a tab is open). */
export function windowShortcuts(document) {
  const keys = [];
  for (const element of document?.querySelectorAll?.("keyset key") ?? []) {
    if (element.getAttribute("disabled") === "true") continue;
    const key = element.getAttribute("key") || "", code = element.getAttribute("keycode") || "";
    const keyCode = code ? (globalThis.KeyboardEvent?.["DOM_" + code] ?? null) : null;
    if (!key && !keyCode) continue;
    keys.push({ key, keyCode, modifiers: (element.getAttribute("modifiers") || "").split(/[\s,]+/u).filter(Boolean) });
  }
  return keys;
}
// Gecko's own feel for a mouse-wheel notch (smooth scroll on): pixels per line, animation length.
export const WHEEL_LINE_PIXELS = 19;
export const WHEEL_SMOOTH_MS = 150;
/** Splits a notch delta over the animation: the cumulative distance after `t` ms (ease-out). */
export function smoothWheelProgress(total, t, duration = WHEEL_SMOOTH_MS) {
  const x = Math.min(1, Math.max(0, t / duration));
  return Math.round(total * (1 - (1 - x) ** 3)) || 0;
}
const PROXY_STYLE = "position:absolute;left:0;top:0;width:2px;height:1em;margin:0;padding:0;border:0;"
  + "opacity:0;pointer-events:none;resize:none;overflow:hidden;background:transparent;color:transparent;"
  + "caret-color:transparent;outline:none;white-space:pre";
export function editAction(event) {
  const key = String(event.key).toLowerCase();
  if (key === "z") return event.shiftKey ? "redo" : "undo";
  if (key === "y") return "redo";
  return EDIT_KEYS[key];
}
export function streamKey(event, type) {
  return { type, native_key_code: XKB_KEYS[event.code], windows_key_code: Math.min(255, event.keyCode || 0),
    modifiers: streamModifiers(event), text: event.key.length <= 2 ? event.key : "" };
}

/**
 * Premultiplied BGRA (host memory order) to unpremultiplied RGBA for ImageData.
 * With `rect` only that rectangle is converted, into a new buffer of its size.
 */
export function bgraToRGBA(buffer, width, rect = null) {
  if (!rect) return convertBGRAInPlace(buffer, width);
  const [x, y, w, h] = rect;
  return convertBGRARect(buffer, width, x, y, new Uint8ClampedArray(w * h * 4), w, 0, 0, w, h);
}

const NOTICES = {
  navigation_denied: "WebKit tabs only open the local test page for now.",
  popup_denied: "A pop-up was blocked.", download_denied: "Downloads aren't supported in WebKit tabs yet.",
  permission_denied: "This page asked for a permission WebKit tabs can't grant yet.",
  javascript_dialog_unavailable: "This page tried to show a dialog, which WebKit tabs don't support yet.",
  file_dialog_unavailable: "File uploads aren't supported in WebKit tabs yet.",
};

export class WebKitPresenter {
  constructor(win, geckoAdapter, { launch = launchWebKit, onEngineChange = () => {}, onFailure = () => {},
    onSwitchStart = () => {}, onTargetEvent = () => {}, onRetry = null, BrowserUI = WebKitBrowserUI } = {}) {
    this.window = win; this.gecko = geckoAdapter; this.launch = launch;
    this.onEngineChange = onEngineChange; this.onFailure = onFailure; this.onSwitchStart = onSwitchStart;
    this.onTargetEvent = onTargetEvent; this.onRetry = onRetry; this.BrowserUI = BrowserUI; this.ui = null;
    this.records = new Map(); this.pending = null; this.disposed = false; this.restoreHooks = []; this.failures = [];
    const container = win.gBrowser.tabContainer;
    this.onTabClose = event => {
      const record = this.records.get(event.target) || (this.pending?.tab === event.target ? this.pending : null);
      if (record) this.#remove(record).catch(onFailure);
    };
    this.onTabSelect = () => {
      for (const record of this.records.values()) this.#visibility(record);
      this.#indicator();
      if (this.active) { this.#syncChrome(this.active); this.#resize(this.active); }
    };
    this.onVisibilityChange = () => win.queueMicrotask?.(() => {
      if (!this.disposed) for (const record of this.records.values()) this.#visibility(record);
    });
    container.addEventListener("TabClose", this.onTabClose);
    container.addEventListener("TabSelect", this.onTabSelect);
    win.document.addEventListener?.("visibilitychange", this.onVisibilityChange);
    this.restoreHooks.push(() => {
      container.removeEventListener("TabClose", this.onTabClose);
      container.removeEventListener("TabSelect", this.onTabSelect);
      win.document.removeEventListener?.("visibilitychange", this.onVisibilityChange);
    });
    try { this.#installCommands(); }
    catch (error) { for (const restore of this.restoreHooks.reverse()) restore(); throw error; }
  }
  get active() { return this.records.get(this.window.gBrowser.selectedTab) ?? null; }
  owners() {
    const owners = [...this.records.values()].map(record => record.originalTarget.tab_id);
    if (this.pending?.originalTarget && !owners.includes(this.pending.originalTarget.tab_id)) owners.push(this.pending.originalTarget.tab_id);
    return owners;
  }
  engineOf(tab) { return this.records.has(tab) || this.pending?.tab === tab ? "webkit" : "gecko"; }
  currentPage(tab = this.window.gBrowser.selectedTab) {
    const record = this.records.get(tab);
    return record ? { url: record.latestURL, title: record.title || "", engine: "webkit", tabId: record.originalTarget.tab_id } : null;
  }
  async navigate(url, { postData } = {}) {
    const record = this.active;
    if (!record) return false;
    if (postData || !record.adapter.allowedURL(url)) throw new Error("WEBKIT_FIXTURE_ONLY");
    await this.#action(record, target => record.adapter.navigate(target, url));
    return true;
  }
  focus() { if (!this.active) return false; this.#focusContent(this.active); return true; }
  /** Page focus: the IME proxy editor while the page's editable is focused, else the engine view. */
  #focusContent(record) { (record.ime?.active ?? record.canvas)?.focus?.(); }
  /** Diagnostics: the last browser-UI events and replies of a tab, with chrome-relative milliseconds. */
  #uiLog(record, name, detail) {
    (record.uiLog ??= []).push([name, detail, Math.round(this.window.performance?.now?.() ?? 0)]);
    if (record.uiLog.length > 24) record.uiLog.shift();
  }
  /** §8.2 browser UI, created with the first WebKit record whose host offers it. */
  #browserUI() {
    if (this.ui || this.disposed) return this.ui;
    this.ui = new this.BrowserUI(this.window, {
      send: (record, method, fields, target) => {
        this.#uiLog(record, method, fields?.accept ?? fields?.decision ?? fields?.index ?? null);
        return record.adapter.reply(target, method, fields);
      },
      target: record => record.adapter?.target ?? null,
      records: () => this.records.values(),
      hooks: {
        openTab: (record, url, background) => this.window.openTrustedLinkIn(url, background ? "tabshifted" : "tab", { relatedToCurrent: true }),
        openInFirefox: record => this.switchToGecko(record.tab).catch(error => this.onFailure(error)),
        openInFirefoxTab: (url, postData) => this.window.openTrustedLinkIn(url, "tab", { postData, relatedToCurrent: true }),
        navigate: (record, action) => this.#action(record, target => record.adapter[action](target)),
        focusContent: record => this.#focusContent(record),
        contentElement: record => record.overlay,
        currentURL: record => record.latestURL,
        notice: (record, message) => this.#notice(record, message),
        paste: record => this.#paste(record),
        failure: error => {
          this.uiFailures = [...(this.uiFailures ?? []), String(error?.message ?? error).slice(0, 120)].slice(-8);
          this.onFailure(error);
        },
      },
    });
    this.restoreHooks.push(() => { this.ui?.dispose(); this.ui = null; });
    return this.ui;
  }

  // ---- Switching ----------------------------------------------------------------
  /** Gecko → WebKit for the selected fixture tab. Resolves with the WebKit target once a frame is shown. */
  async switchToWebKit(tab = this.window.gBrowser.selectedTab) {
    if (this.disposed || this.pending) throw new Error("ENGINE_SWITCH_IN_PROGRESS");
    if (this.records.has(tab)) return this.records.get(tab).adapter.target;
    if (this.records.size >= MAX_WEBKIT_TABS) throw new Error("WEBKIT_TAB_LIMIT");
    if (this.window.PrivateBrowsingUtils?.isWindowPrivate?.(this.window)) throw new Error("WEBKIT_PRIVATE_OR_UNKNOWN_TAB");
    const browser = tab.linkedBrowser, tracked = this.gecko.find(browser);
    const originalTarget = tracked && this.gecko.target(tracked);
    const origin = this.window.Services.env.get("AXIOSOZO_ENGINE_FIXTURE_ORIGIN");
    const url = browser.currentURI?.spec;
    if (!originalTarget || originalTarget.private_mode || typeof originalTarget.tab_id !== "string") throw new Error("WEBKIT_PRIVATE_OR_UNKNOWN_TAB");
    if (!validFixtureOrigin(origin) || originalTarget.identity !== origin || !allowedFixtureURL(url, origin)) throw new Error("WEBKIT_LOCAL_FIXTURE_ONLY");
    const stack = browser.parentNode;
    if (!stack?.classList?.contains("browserStack")) throw new Error("UNSUPPORTED_ZEN_CONTENT_CONTAINER");
    const document = this.window.document;
    const overlay = document.createElementNS(XHTML, "div");
    overlay.setAttribute("data-axiosozo-engine-view", "webkit");
    overlay.style.cssText = "position:absolute;inset:0;display:none;z-index:1;background:#fff;overflow:hidden";
    const canvas = document.createElementNS(XHTML, "canvas");
    canvas.tabIndex = 0; canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "WebKit page (experimental, local test page only). Accessibility and IME are not available yet.");
    canvas.style.cssText = "display:block;width:100%;height:100%;outline:none";
    overlay.appendChild(canvas);
    this.#clearStoppedNotice(browser);
    const record = { tab, browser, stack, overlay, canvas, originalTarget, committed: false, adapter: null, priorIcon: this.#currentIcon(tab),
      priorVisibility: browser.style.visibility, priorPosition: stack.style.position,
      priorDocShellIsActive: browser.docShellIsActive, latestURL: url, title: "", loading: null, listeners: [],
      displayedFrames: 0, damageFrames: 0, supersededFrames: 0, frames: null, uploadedPixels: 0, fullPixels: 0, drawMilliseconds: 0,
      firstFrameAt: null, startedAt: this.window.performance.now(), clicks: { time: 0, x: 0, y: 0, count: 1 },
      wheel: null, cursor: "default", visible: undefined };
    this.pending = record;
    this.onSwitchStart(originalTarget.tab_id);
    this.#indicator();
    if (this.window.getComputedStyle(stack).position === "static") stack.style.position = "relative";
    stack.appendChild(overlay);
    try {
      record.adapter = await this.launch(this.window, { tabId: originalTarget.tab_id, origin,
        onFrame: (metadata, pixels) => this.#draw(record, metadata, pixels),
        onEvent: event => this.#event(record, event), onFailure: error => this.#revert(record, error) });
      if (this.disposed || this.pending !== record) throw new Error("ENGINE_SWITCH_CANCELLED");
      // §8.2: events of the first load (favicon, text_input) already use the browser-UI path.
      record.browserUI = record.adapter.browserUI === true;
      const target = await record.adapter.create(url, this.#surface(record));
      this.gecko.resolve(originalTarget); // the Gecko tab did not navigate while WebKit started
      if (this.disposed || this.pending !== record || this.window.gBrowser.selectedTab !== tab) throw new Error("ENGINE_SWITCH_CANCELLED");
      this.pending = null; this.records.set(tab, record); record.committed = true;
      browser.style.visibility = "hidden"; overlay.style.display = "block";
      if (typeof browser.docShellIsActive === "boolean") browser.docShellIsActive = false;
      tab.setAttribute?.(ENGINE_ATTRIBUTE, "webkit");
      if (record.browserUI) { this.#browserUI(); this.#redirectBrowserFocus(record); }
      this.#input(record);
      record.observer = new this.window.ResizeObserver(() => this.#resize(record));
      record.observer.observe(stack);
      this.#visibility(record);
      canvas.focus();
      this.#indicator(); this.#syncChrome(record);
      this.#applyIcon(record); // a favicon that arrived with the first load
      return target;
    } catch (error) {
      await this.#remove(record);
      this.#failure(error);
      throw error;
    }
  }
  /** WebKit → Gecko. The Gecko tab shows WebKit's current fixture address. */
  async switchToGecko(tab = this.window.gBrowser.selectedTab) {
    const record = this.records.get(tab) ?? (this.pending?.tab === tab ? this.pending : null);
    if (!record) return;
    const url = record.latestURL;
    await this.#remove(record);
    const origin = record.originalTarget.identity;
    if (allowedFixtureURL(url, origin) && record.browser.currentURI?.spec !== url) this.#loadInGecko(record, url);
    if (this.window.gBrowser.selectedTab === tab) record.browser.focus?.();
  }
  async setTabEngine(tab, engine) {
    if (engine === "webkit") return this.switchToWebKit(tab);
    if (engine === "gecko") return this.switchToGecko(tab);
    throw new Error("ENGINE_UNAVAILABLE");
  }
  #loadInGecko(record, url) {
    try {
      record.browser.loadURI(this.window.Services.io.newURI(url),
        { triggeringPrincipal: this.window.Services.scriptSecurityManager.getSystemPrincipal() });
    } catch (error) { this.onFailure(error); }
  }
  #failure(error) {
    const code = /^[A-Z0-9_]{1,96}$/u.test(error?.message) ? error.message : "WEBKIT_SWITCH_FAILED";
    this.failures.push(code);
    if (this.failures.length > 16) this.failures.shift();
    if (code !== "ENGINE_SWITCH_CANCELLED") this.onFailure(error);
  }
  /** Crash, protocol violation or host exit: the Gecko tab is shown again, unchanged. */
  async #revert(record, error) {
    // While a switch is pending, its own catch handles the failure (create() rejects).
    if (record.removing || !record.committed) return;
    await this.#remove(record);
    this.#failure(error);
    this.#indicator("WebKit stopped; Firefox tab preserved");
    this.#stoppedNotice(record, error);
  }
  /** Zen's notification bar on the preserved Firefox tab, with a way back into WebKit. */
  #stoppedNotice(record, error) {
    let box = null;
    try { box = this.window.gBrowser.getNotificationBox?.(record.browser); } catch {}
    if (!box?.appendNotification || record.tab.isConnected === false) return;
    const crashed = /^ENGINE_EXIT_|ENGINE_HOST_UNRESPONSIVE|ENGINE_UNEXPECTED_EXIT|ENGINE_PROTOCOL_OR_EOF|render_process/u.test(error?.message ?? "");
    const label = crashed ? "WebKit stopped working in this tab. The Firefox version of the page is shown instead."
      : "This page couldn't continue in WebKit. The Firefox version of the page is shown instead.";
    const buttons = this.onRetry ? [{ label: "Try again in WebKit", accessKey: "T",
      callback: () => { Promise.resolve(this.onRetry(record.tab)).catch(failure => this.onFailure(failure)); } }] : [];
    try {
      this.#clearStoppedNotice(record.browser);
      Promise.resolve(box.appendNotification("axiosozo-webkit-stopped",
        { label, priority: box.PRIORITY_WARNING_MEDIUM, image: "chrome://global/skin/icons/warning.svg" }, buttons)).catch(() => {});
    } catch {}
  }
  #clearStoppedNotice(browser) {
    try {
      const box = this.window.gBrowser.getNotificationBox?.(browser);
      const existing = box?.getNotificationWithValue?.("axiosozo-webkit-stopped");
      if (existing) box.removeNotification(existing);
    } catch {}
  }
  async #remove(record) {
    record.removing ??= this.#removeOnce(record);
    return record.removing;
  }
  async #removeOnce(record) {
    if (this.pending === record) this.pending = null;
    if (this.records.get(record.tab) === record) this.records.delete(record.tab);
    const wasCommitted = record.committed;
    record.committed = false;
    record.observer?.disconnect();
    for (const remove of record.listeners.splice(0)) remove();
    this.ui?.forget(record);
    this.#restoreBrowserFocus(record);
    record.wheelAnimation = null;
    if (record.iconApplied) { try { this.window.gBrowser.setIcon?.(record.tab, record.priorIcon ?? ""); } catch {} }
    this.window.clearTimeout?.(record.noticeTimer);
    record.browser.style.visibility = record.priorVisibility;
    if (typeof record.priorDocShellIsActive === "boolean") {
      record.browser.docShellIsActive = this.window.gBrowser.shouldActivateDocShell?.(record.browser)
        ?? (this.window.gBrowser.selectedTab === record.tab && record.priorDocShellIsActive);
    }
    record.stack.style.position = record.priorPosition;
    record.directComposite?.restore(); // perf: the panel's rounded clip comes back with Gecko
    record.overlay.remove();
    // A canvas whose control moved to a frame worker refuses a resize (and goes with the overlay).
    try { record.canvas.width = 1; record.canvas.height = 1; } catch {}
    record.tab.removeAttribute?.(ENGINE_ATTRIBUTE);
    record.tab.toggleAttribute?.("busy", false);
    if (wasCommitted && record.tab.isConnected !== false) {
      try { this.window.gBrowser.setTabTitle(record.tab); } catch {}
      if (this.window.gBrowser.selectedTab === record.tab) {
        try { this.window.gURLBar.setURI(); } catch {}
        this.window.gBrowser.updateTitlebar?.();
        this.window.UpdateBackForwardCommands?.(record.browser);
      }
    }
    this.#indicator();
    await record.adapter?.close().catch(() => {});
  }

  // ---- Presentation -------------------------------------------------------------
  #surface(record) {
    const rect = record.browser.getBoundingClientRect();
    const surface = fitStreamSurface({ width: Math.max(1, Math.floor(rect.width)), height: Math.max(1, Math.floor(rect.height)),
      device_scale: Math.min(4, Math.max(1, this.window.devicePixelRatio || 1)) });
    record.renderScaleLimited = surface.device_scale < (this.window.devicePixelRatio || 1);
    return surface;
  }
  /** EngineFrameSurface converts and uploads the damage at the next refresh tick (once per tick). */
  #draw(record, metadata, pixels) {
    if (this.disposed) return;
    const isPaintable = () => !this.disposed && (this.pending === record || (this.active === record && !this.window.document.hidden));
    const onPaint = paint => {
      if (paint.uploadedPixels < paint.framePixels) record.damageFrames++;
      record.uploadedPixels += paint.uploadedPixels; record.fullPixels += paint.framePixels;
      record.supersededFrames += paint.superseded;
      record.displayedFrames++; record.drawMilliseconds += paint.milliseconds;
      record.firstFrameAt ??= this.window.performance.now();
      record.lastFrameId = paint.frameId; record.frameUpload = paint.upload;
    };
    if (isNativeFrame(pixels)) {
      // Native receiver: the component presents the frame; nothing to convert here.
      const paint = presentNativeFrame(this.window, record, metadata, pixels, isPaintable(), onPaint);
      if (paint) { if (paint !== true) onPaint(paint); return; }
      const fallback = nativeFallbackFrame(metadata, pixels);
      if (!fallback) return;
      ({ metadata, pixels } = fallback);
    }
    // A frame that is not painted makes the next paint whole.
    record.frames ??= new EngineFrameSurface(this.window, record.canvas, { isPaintable, onPaint });
    record.frames.accept(metadata, pixels);
  }
  #event(record, event) {
    // Diagnostics: the last browser-UI events (names and kinds or codes only, never contents).
    if (!["heartbeat", "title", "url", "loading", "cursor"].includes(event.event)) {
      this.#uiLog(record, event.event, event.kind ?? event.code ?? event.reason ?? event.mode ?? null);
    }
    if (record.browserUI && event.event === "favicon") { record.icon = event.icon || null; this.#applyIcon(record); return; }
    if (record.browserUI && event.event === "text_input") { this.#textInput(record, event); return; }
    if (record.browserUI && this.ui?.handle(record, event)) return;
    if (event.event === "navigation" && record.ime) { record.ime.active = null; record.composing = false; }
    if (event.event === "url") record.latestURL = event.url || record.latestURL;
    if (event.event === "title") record.title = event.title;
    if (event.event === "loading") { record.loading = event; record.tab.toggleAttribute?.("busy", record.committed && event.loading); }
    if (event.event === "cursor") { record.cursor = event.cursor; record.canvas.style.cursor = event.cursor; }
    if (event.event === "error" && !event.request_id && NOTICES[event.code]) this.#notice(record, NOTICES[event.code]);
    if (event.event === "load" && event.http_status !== 200 && !event.restored_from_history && record.committed) {
      // A fixture page that fails to load ends the experiment; Firefox shows the page again.
      this.#revert(record, new Error("WEBKIT_PAGE_LOAD_FAILED"));
      return;
    }
    if (event.event === "closed" && record.committed && !record.removing) { this.#revert(record, new Error("WEBKIT_TARGET_CLOSED")); return; }
    this.onTargetEvent(event);
    if (record.committed && event.event === "navigation") { record.visible = undefined; this.#visibility(record); }
    if (record.committed && event.event === "load" && record.contentFocused) this.#action(record, target => record.adapter.focus(target, true));
    if (record.committed) this.#syncChrome(record);
  }
  #notice(record, message) {
    record.notice ??= record.overlay.appendChild(this.window.document.createElementNS(XHTML, "div"));
    record.notice.setAttribute("role", "status");
    record.notice.style.cssText = "position:absolute;inset-inline:0;inset-block-end:16px;margin:auto;width:max-content;max-width:80%;"
      + "padding:6px 12px;border-radius:8px;background:#202124;color:#fff;font:12px/1.4 system-ui;pointer-events:none";
    record.notice.textContent = message; record.notice.hidden = false;
    this.window.clearTimeout?.(record.noticeTimer);
    record.noticeTimer = this.window.setTimeout?.(() => { if (record.notice) record.notice.hidden = true; }, 4000);
  }
  #currentIcon(tab) { try { return this.window.gBrowser.getIcon?.(tab) || null; } catch { return null; } }
  /** The page's own icon (cef-v1 favicon rule) through Zen's setIcon, as for Gecko tabs. */
  #applyIcon(record) {
    const gBrowser = this.window.gBrowser;
    if (!record.committed || typeof gBrowser.setIcon !== "function" || record.tab.isConnected === false) return;
    const icon = record.icon ?? record.priorIcon ?? "";
    if ((this.#currentIcon(record.tab) ?? "") === icon) return;
    try { gBrowser.setIcon(record.tab, icon); record.iconApplied = true; } catch (error) { this.onFailure(error); }
  }
  /**
   * Zen returns focus to the page with gBrowser.selectedBrowser.focus() (address bar
   * Escape, tab switch). The hidden Gecko browser of a WebKit tab cannot take it.
   */
  #redirectBrowserFocus(record) {
    const browser = record.browser, presenter = this;
    record.priorBrowserFocus = Object.getOwnPropertyDescriptor(browser, "focus") ?? null;
    record.browserFocus = function focus() { presenter.#focusContent(record); };
    try { browser.focus = record.browserFocus; } catch { record.browserFocus = null; }
  }
  #restoreBrowserFocus(record) {
    if (!record.browserFocus || record.browser.focus !== record.browserFocus) return;
    if (record.priorBrowserFocus) Object.defineProperty(record.browser, "focus", record.priorBrowserFocus);
    else delete record.browser.focus;
    record.browserFocus = null;
  }
  #syncChrome(record) {
    if (this.active !== record) return;
    const gBrowser = this.window.gBrowser;
    const label = record.title || String(record.latestURL ?? "").replace(/^https?:\/\//u, "");
    if (label) {
      if (typeof gBrowser._setTabLabel === "function") gBrowser._setTabLabel(record.tab, label, { isContentTitle: !!record.title });
      else record.tab.label = label;
    }
    gBrowser.updateTitlebar?.();
    this.window.UpdateBackForwardCommands?.(record.browser);
    if (!this.window.gURLBar?.focused) {
      try { this.window.gURLBar.setURI(record.latestURL ? { uri: this.window.Services.io.newURI(record.latestURL) } : {}); } catch {}
    }
  }
  #indicator(reason) {
    const record = this.active;
    const engine = record?.committed ? "webkit" : (this.pending && this.pending.tab === this.window.gBrowser.selectedTab ? "pending" : "gecko");
    this.window.document.documentElement?.toggleAttribute?.("axiosozo-webkit-active", engine === "webkit");
    this.onEngineChange({ engine: engine === "webkit" ? "webkit" : "gecko", pending: engine === "pending",
      experimental: engine === "webkit", version: engine === "webkit" ? WEBKIT_VERSION : null, fixtureOnly: engine === "webkit",
      reason: reason ?? (record?.renderScaleLimited ? "WebKit render scale capped for this window size" : undefined) });
  }
  #visibility(record) {
    const visible = this.active === record && !this.window.document.hidden;
    if (typeof record.browser.docShellIsActive === "boolean" && record.committed) record.browser.docShellIsActive = false;
    if (record.visible === visible || !record.adapter?.target) return;
    record.visible = visible;
    if (visible) representNativeFrame(record); // a frame applied while hidden
    this.#action(record, target => record.adapter.visibility(target, visible));
  }
  /** Resolves to the host result, or null when it failed (already handled). */
  #action(record, operation) {
    return Promise.resolve().then(() => operation(record.adapter.target)).then(result => {
      if (result?.status === "unsupported" && !["NAVIGATION_SUPERSEDED", "history_boundary"].includes(result.reason)) {
        this.#indicator(`WebKit: ${result.reason || "unsupported"}`);
      } else if (result && !["success", "unsupported", "failed"].includes(result.status)) throw new Error("WEBKIT_ACTION_FAILED");
      return result ?? null;
    }).catch(error => {
      if (!record.committed) return null;
      if (error.message === "STALE_ENGINE_TARGET") this.#indicator("Input discarded after navigation");
      else if (error.message !== "ENGINE_UNAVAILABLE") this.#revert(record, error);
      return null;
    });
  }
  #resize(record) {
    if (!record.committed || this.active !== record) return;
    if (record.resizePending) { record.resizeDirty = true; return; }
    record.resizePending = true;
    this.window.requestAnimationFrame(async () => {
      try {
        do {
          record.resizeDirty = false;
          if (!record.committed) return;
          const surface = this.#surface(record);
          if (JSON.stringify(surface) === JSON.stringify(record.adapter.surface)) continue;
          const result = await record.adapter.resize(record.adapter.target, surface);
          if (result?.status !== "success") throw new Error("UNSUPPORTED_SURFACE");
        } while (record.resizeDirty);
      } catch (error) {
        if (error.message === "STALE_ENGINE_TARGET" && record.committed) record.resizeDirty = true;
        else if (record.committed) this.#revert(record, error);
      } finally {
        record.resizePending = false;
        if (record.resizeDirty && record.committed) this.#resize(record);
      }
    });
  }

  // ---- Input -----------------------------------------------------------------------
  #listen(record, type, handler, options) { this.#listenOn(record, record.canvas, type, handler, options); }
  #listenOn(record, element, type, handler, options) {
    element.addEventListener(type, handler, options);
    record.listeners.push(() => element.removeEventListener(type, handler, options));
  }
  #send(record, method, fields) { return this.#action(record, target => record.adapter.input(target, method, fields)); }
  #point(record, event) {
    const bounds = record.canvas.getBoundingClientRect(), surface = record.adapter.surface;
    return { x: Math.max(0, Math.min(surface.width, Math.floor(event.clientX - bounds.left))),
      y: Math.max(0, Math.min(surface.height, Math.floor(event.clientY - bounds.top))), modifiers: streamModifiers(event) };
  }
  #clickCount(record, event, position) {
    const clicks = record.clicks, now = event.timeStamp ?? this.window.performance.now();
    const near = Math.abs(position.x - clicks.x) <= 4 && Math.abs(position.y - clicks.y) <= 4;
    clicks.count = near && now - clicks.time <= 500 ? Math.min(3, clicks.count + 1) : 1;
    Object.assign(clicks, { time: now, x: position.x, y: position.y });
    return clicks.count;
  }
  #contentElement(record, node) { return !!node && (node === record.canvas || node === record.ime?.text || node === record.ime?.password); }
  /** Zen's clipboard text into the page's focused editable (`at`: middle-click point, PRIMARY). */
  #paste(record, { primary = false, at = null } = {}) {
    if (!record.committed || !this.ui) return;
    let text = this.ui.readText({ primary });
    if (!text) return;
    text = text.replace(/\r\n?/gu, "\n");
    // ≤ 4096 UTF-16 units per command, in order (the input queue keeps them with keys).
    for (let offset = 0, first = true; offset < text.length && offset < 65536; offset += 4096, first = false) {
      let end = Math.min(text.length, offset + 4096);
      if (end < text.length && /[\uD800-\uDBFF]/u.test(text[end - 1])) end--;
      this.#send(record, "paste_text", { text: text.slice(offset, end), ...(first && at ? at : {}) });
      offset = end - 4096;
    }
  }
  #keyHandler(record, type) {
    return event => {
      if (!event.isTrusted || !record.committed) return;
      // Keys the input method owns (composition, dead keys) reach the proxy editor untouched.
      if (record.browserUI && (event.isComposing || event.key === "Process" || event.key === "Dead") && event.target !== record.canvas) return;
      let route = linuxKeyboardRoute(event);
      if (record.browserUI && route === "chrome") {
        record.shortcuts ??= windowShortcuts(this.window.document);
        // tabbrowser's own chords (no <key> elements) and Alt+letter menu access stay Zen's.
        const tabChord = event.ctrlKey && ["Tab", "PageUp", "PageDown"].includes(event.key);
        if (!tabChord && !zenOwnsShortcut(event, record.shortcuts) && !(event.altKey && !event.ctrlKey && !event.metaKey && event.key.length === 1)) {
          route = Object.hasOwn(XKB_KEYS, event.code) ? "page" : "chrome";
        }
      }
      if (route === "chrome") return; // Zen's shortcuts work over WebKit exactly as over Firefox
      // A lone modifier reaches the page and Zen alike (as in a Gecko tab: Alt still toggles Zen's menus).
      const modifierOnly = record.browserUI && ["Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock"].includes(event.key);
      if (!modifierOnly) { event.preventDefault(); event.stopPropagation(); }
      if (route === "edit") {
        if (type !== "down") return;
        const action = editAction(event);
        if (record.browserUI && action === "paste") { this.#paste(record); return; }
        this.#action(record, target => record.adapter.edit(target, action));
        return;
      }
      if (route === "text") {
        if (type === "down" && record.adapter.inputFeatures.imeCommit) this.#send(record, "ime_commit_text", { text: event.key });
        return;
      }
      if (route === "unsupported") { if (!record.browserUI) this.#indicator("This experimental engine has no IME bridge yet"); return; }
      const fields = streamKey(event, type);
      this.#send(record, "key", fields);
      if (type === "down" && !event.ctrlKey && !event.altKey && !event.metaKey) {
        if (event.key.length <= 2) this.#send(record, "key", { ...fields, type: "char" });
        else if (event.key === "Enter") this.#send(record, "key", { ...fields, type: "char", text: "\r" });
      }
    };
  }
  #input(record) {
    for (const type of ["pointerdown", "pointerup", "pointermove"]) this.#listen(record, type, event => {
      if (!event.isTrusted || !record.committed || record.resizePending) return;
      if (type === "pointerdown") { this.#focusContent(record); record.canvas.setPointerCapture?.(event.pointerId); }
      if (type === "pointerup" && record.canvas.hasPointerCapture?.(event.pointerId)) record.canvas.releasePointerCapture(event.pointerId);
      event.preventDefault();
      const position = this.#point(record, event);
      const fields = { ...position, type: type === "pointermove" ? "move" : (type === "pointerdown" ? "down" : "up"),
        button: ["left", "middle", "right"][Math.max(0, event.button)] || "left",
        click_count: type === "pointerdown" ? this.#clickCount(record, event, position) : record.clicks.count, mouse_leave: false };
      if (type === "pointermove") {
        // Moves are coalesced to one per frame; buttons are sent at once, in order.
        record.nextPointer = fields;
        if (!record.pointerPending) {
          record.pointerPending = true;
          this.window.requestAnimationFrame(() => {
            record.pointerPending = false;
            if (record.committed && record.nextPointer) this.#send(record, "mouse", record.nextPointer);
            record.nextPointer = null;
          });
        }
      } else {
        this.#flushWheel(record);
        if (record.nextPointer) { this.#send(record, "mouse", record.nextPointer); record.nextPointer = null; }
        this.#send(record, "mouse", fields);
        // Linux middle-click paste of the PRIMARY selection into an editable, as in a Gecko tab.
        if (record.browserUI && type === "pointerup" && fields.button === "middle" && record.cursor === "text"
            && this.window.Services?.prefs?.getBoolPref?.("middlemouse.paste", true) !== false) {
          this.#paste(record, { primary: true, at: { x: position.x, y: position.y } });
        }
      }
    });
    this.#listen(record, "wheel", event => {
      if (!event.isTrusted) return;
      event.preventDefault(); // never scroll Zen or start a history swipe over the view
      if (!record.committed || record.resizePending) return;
      // Ctrl+wheel zooms the page, as Gecko's mousewheel.with_control.action does.
      if (record.browserUI && event.ctrlKey && !event.altKey && !event.metaKey && event.deltaY) {
        const zoom = this.window.FullZoom;
        if (event.deltaY < 0) zoom?.enlarge?.(); else zoom?.reduce?.();
        return;
      }
      const position = this.#point(record, event);
      // Notches (line/page deltas) scroll smoothly like Gecko; precise (pixel) deltas follow the hand.
      if (record.browserUI && event.deltaMode !== 0) {
        const unit = event.deltaMode === 1 ? WHEEL_LINE_PIXELS : record.adapter.surface.height;
        this.#smoothWheel(record, position, -event.deltaX * unit, -event.deltaY * unit);
        return;
      }
      const scale = event.deltaMode === 1 ? 20 : (event.deltaMode === 2 ? record.adapter.surface.height : 1);
      // engine-stream-v1 wheel sign (cef-v1): negative delta_y scrolls down.
      if (record.wheel && record.wheel.fields.modifiers !== position.modifiers) this.#flushWheel(record);
      record.wheel ??= { fields: position, x: 0, y: 0 };
      record.wheel.fields = position; record.wheel.x -= event.deltaX * scale; record.wheel.y -= event.deltaY * scale;
      if (!record.wheelScheduled) {
        record.wheelScheduled = true;
        this.window.requestAnimationFrame(() => { record.wheelScheduled = false; this.#flushWheel(record); });
      }
    }, { passive: false });
    this.#keyTargets(record, record.canvas);
    if (record.browserUI) {
      // Page focus follows chrome focus of the engine view or its proxy editor, not moves between them.
      this.#listenOn(record, record.overlay, "focusin", event => {
        if (!this.#contentElement(record, event.target) || record.contentFocused) return;
        record.contentFocused = true; this.#action(record, target => record.adapter.focus(target, true));
      });
      this.#listenOn(record, record.overlay, "focusout", event => {
        if (!this.#contentElement(record, event.target) || this.#contentElement(record, event.relatedTarget)) return;
        record.contentFocused = false;
        if (record.composing) { record.composing = false; this.#send(record, "ime_finish_composing", {}); }
        this.#action(record, target => record.adapter.focus(target, false));
      });
    } else {
      this.#listen(record, "focus", () => { record.contentFocused = true; this.#action(record, target => record.adapter.focus(target, true)); });
      this.#listen(record, "blur", () => { record.contentFocused = false; this.#action(record, target => record.adapter.focus(target, false)); });
    }
    this.#listen(record, "compositionstart", event => { event.preventDefault(); if (!record.browserUI) this.#indicator("IME composition is unsupported in WebKit tabs yet"); });
    this.#listen(record, "contextmenu", event => event.preventDefault());
  }
  #keyTargets(record, element) {
    for (const [name, type] of [["keydown", "down"], ["keyup", "up"]]) this.#listenOn(record, element, name, this.#keyHandler(record, type));
  }
  /** A notch: Gecko-like smooth scroll, cumulative distance eased over WHEEL_SMOOTH_MS, one wheel per frame. */
  #smoothWheel(record, position, dx, dy) {
    const now = this.window.performance.now();
    const running = record.wheelAnimation;
    // A new notch during an animation adds its distance to what is still left.
    const left = running ? { x: running.dx - running.sentX, y: running.dy - running.sentY } : { x: 0, y: 0 };
    const animation = record.wheelAnimation = { fields: position, start: now, dx: dx + left.x, dy: dy + left.y, sentX: 0, sentY: 0 };
    const step = () => {
      if (record.wheelAnimation !== animation || !record.committed) return;
      const t = this.window.performance.now() - animation.start;
      const x = smoothWheelProgress(animation.dx, t), y = smoothWheelProgress(animation.dy, t);
      const clamp = value => Math.max(-4096, Math.min(4096, value)) || 0;
      const delta_x = clamp(x - animation.sentX), delta_y = clamp(y - animation.sentY);
      animation.sentX += delta_x; animation.sentY += delta_y;
      if (delta_x || delta_y) this.#send(record, "wheel", { ...animation.fields, delta_x, delta_y });
      if (t < WHEEL_SMOOTH_MS) this.window.requestAnimationFrame(step);
      else if (record.wheelAnimation === animation) record.wheelAnimation = null;
    };
    this.window.requestAnimationFrame(step);
  }
  /**
   * IME (§8.2, `text_input`): while the page's editable has focus, a transparent proxy editor
   * at its caret takes chrome focus, so Gecko drives the system input method against it and
   * its composition goes to WebKit as preedit (shown underlined by WebKit), then committed.
   */
  #textInput(record, event) {
    const ime = record.ime ??= this.#createIME(record);
    const focused = this.window.document.activeElement;
    const hadFocus = this.#contentElement(record, focused);
    if (event.mode === "none") {
      ime.active = null;
      if (hadFocus && focused !== record.canvas) record.canvas.focus();
      return;
    }
    const element = event.mode === "password" ? ime.password : ime.text;
    const height = Math.max(1, Math.round(event.caret_height));
    Object.assign(element.style, { left: `${Math.round(event.caret_x)}px`, top: `${Math.round(event.caret_y)}px`,
      height: `${height}px`, fontSize: `${height}px`, lineHeight: `${height}px` });
    ime.active = element;
    if (hadFocus && focused !== element) element.focus();
  }
  #createIME(record) {
    const document = this.window.document;
    const make = (tag, type) => {
      const element = document.createElementNS(XHTML, tag);
      if (type) element.setAttribute("type", type);
      element.setAttribute("aria-hidden", "true"); element.setAttribute("tabindex", "-1");
      element.setAttribute("autocomplete", "off"); element.setAttribute("spellcheck", "false");
      element.style.cssText = PROXY_STYLE;
      record.overlay.appendChild(element);
      const clear = () => { element.value = ""; };
      this.#listenOn(record, element, "compositionstart", () => { record.composing = true; });
      this.#listenOn(record, element, "compositionupdate", event => {
        const text = String(event.data ?? "").slice(0, 1024);
        this.#send(record, "ime_set_composition", { text, selection_start: text.length, selection_end: text.length });
      });
      this.#listenOn(record, element, "compositionend", event => {
        record.composing = false;
        const text = String(event.data ?? "").slice(0, 1024);
        if (text) this.#send(record, "ime_commit_text", { text });
        else this.#send(record, "ime_cancel_composition", {});
        clear();
      });
      // Text that arrives without keys (emoji picker, on-screen keyboards).
      this.#listenOn(record, element, "input", event => {
        if (event.isComposing) return;
        const text = String(event.data ?? "").slice(0, 1024);
        if (!record.composing && text && ["insertText", "insertReplacementText"].includes(event.inputType)) this.#send(record, "ime_commit_text", { text });
        clear();
      });
      this.#keyTargets(record, element);
      return element;
    };
    record.listeners.push(() => { record.ime?.text.remove(); record.ime?.password.remove(); record.ime = null; });
    return { text: make("textarea"), password: make("input", "password"), active: null };
  }
  #flushWheel(record) {
    const pending = record.wheel;
    record.wheel = null;
    if (!pending || !record.committed) return;
    const clamp = value => Math.max(-4096, Math.min(4096, Math.round(value))) || 0;
    const delta_x = clamp(pending.x), delta_y = clamp(pending.y);
    if (delta_x || delta_y) this.#send(record, "wheel", { ...pending.fields, delta_x, delta_y });
  }

  // ---- Browser commands ----------------------------------------------------------------
  #recordForBrowser(browser) {
    for (const record of this.records.values()) if (record.browser === browser) return record;
    return null;
  }
  #installCommands() {
    const wrap = (owner, method, replacement, { optional = false } = {}) => {
      const original = owner?.[method];
      if (typeof original !== "function") {
        if (optional) return;
        throw new Error(`UNSUPPORTED_BROWSER_API_${method}`);
      }
      const presenter = this;
      const wrapped = function(...args) { return replacement.call(this, presenter, original, args); };
      owner[method] = wrapped;
      this.restoreHooks.push(() => { if (owner[method] === wrapped) owner[method] = original; });
    };
    const gBrowser = this.window.gBrowser, commands = this.window.BrowserCommands;
    wrap(gBrowser, "shouldActivateDocShell", function(presenter, original, args) {
      if (presenter.#recordForBrowser(args[0])) return false;
      return original.apply(this, args);
    }, { optional: true });
    for (const method of ["back", "forward", "reload"]) wrap(commands, method, function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      presenter.#action(record, target => record.adapter[method](target));
    });
    for (const [method, action] of [["stop", "stop"], ["reloadSkipCache", "reload"]]) wrap(commands, method, function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      presenter.#action(record, target => record.adapter[action](target));
    }, { optional: true });
    wrap(this.window, "UpdateBackForwardCommands", function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      return original.call(this, { canGoBack: !!record.loading?.can_go_back, canGoForward: !!record.loading?.can_go_forward });
    });
    wrap(this.window, "FillHistoryMenu", function(presenter, original, args) {
      return presenter.active ? false : original.apply(this, args);
    }, { optional: true });
    wrap(gBrowser, "setTabTitle", function(presenter, original, args) {
      const record = presenter.records.get(args[0]);
      if (record && record.committed && (record.title || record.latestURL)) { presenter.#syncChrome(record); return true; }
      return original.apply(this, args);
    }, { optional: true });
    // Typed addresses in a WebKit tab: fixture pages load in WebKit, anything else returns the tab to Firefox first.
    wrap(this.window, "openTrustedLinkIn", function(presenter, original, args) {
      const [url, where, params = {}] = args;
      const record = where === "current" && presenter.#recordForBrowser(params?.targetBrowser ?? presenter.window.gBrowser.selectedBrowser);
      if (!record) return original.apply(this, args);
      if (!params?.postData && record.adapter.allowedURL(url)) {
        presenter.window.gURLBar?.view?.close?.({ elementPicked: true });
        record.latestURL = url;
        presenter.#action(record, target => record.adapter.navigate(target, url));
        record.canvas.focus();
        return undefined;
      }
      return presenter.switchToGecko(record.tab).then(() => original.apply(this, args));
    }, { optional: true });
  }

  diagnostics() {
    const record = this.active;
    if (!record) return { engine: "gecko", ownedTabIds: this.owners(), failures: [...this.failures], pending: !!this.pending };
    return { engine: "webkit", version: WEBKIT_VERSION, target: record.adapter.target, renderPath: "wpe-fdo-shm-bgra", frameTransport: record.adapter.frameTransport ?? "pipe",
      memfdFallback: record.adapter.memfdFallback ?? null, frameUpload: record.frameUpload ?? null,
      nativeReceiver: record.nativeSink ? JSON.parse(record.nativeSink.statsJSON) : null, pipeFallback: true, frames: record.displayedFrames, damageFrames: record.damageFrames, supersededFrames: record.supersededFrames,
      uploadedPixels: record.uploadedPixels, fullPixels: record.fullPixels,
      meanDrawMilliseconds: record.displayedFrames ? record.drawMilliseconds / record.displayedFrames : 0,
      firstFrameMilliseconds: record.firstFrameAt === null ? null : record.firstFrameAt - record.startedAt,
      lastFrameId: record.lastFrameId ?? null, surface: record.adapter.surface, url: record.latestURL, title: record.title,
      loading: record.loading ? { loading: record.loading.loading, canGoBack: record.loading.can_go_back,
        canGoForward: record.loading.can_go_forward } : null,
      cursor: record.cursor, inputFeatures: record.adapter.inputFeatures, ready: record.adapter.host?.ready ?? null,
      renderScaleLimited: !!record.renderScaleLimited, fixtureOnly: true, ownedTabIds: this.owners(),
      browserUI: !!record.browserUI, uiLog: [...(record.uiLog ?? [])], uiFailures: [...(this.uiFailures ?? [])],
      focus: (active => active === record.canvas ? "canvas" : (record.overlay.contains?.(active) ? "proxy-" + active.localName : null))(
        this.window.document.activeElement),
      failures: [...this.failures], pending: !!this.pending };
  }
  /** Explicit diagnostic call in privileged chrome only: the presented WebKit pixels as PNG. */
  captureFixtureFrame() {
    const record = this.active;
    if (!record?.displayedFrames || !allowedFixtureURL(record.latestURL, record.originalTarget.identity)) throw new Error("NO_VERIFIED_WEBKIT_FIXTURE_FRAME");
    return { png: (record.nativeSink && nativeFramePNG(this.window, record.nativeSink)) || record.canvas.toDataURL("image/png"),
      diagnostics: this.diagnostics() };
  }
  async dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const restore of this.restoreHooks.reverse()) restore();
    this.restoreHooks = [];
    await Promise.all([...this.records.values(), ...(this.pending ? [this.pending] : [])].map(record => this.#remove(record)));
  }
}
