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
    onSwitchStart = () => {}, onTargetEvent = () => {} } = {}) {
    this.window = win; this.gecko = geckoAdapter; this.launch = launch;
    this.onEngineChange = onEngineChange; this.onFailure = onFailure; this.onSwitchStart = onSwitchStart;
    this.onTargetEvent = onTargetEvent;
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
  focus() { if (!this.active) return false; this.active.canvas.focus(); return true; }

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
    const record = { tab, browser, stack, overlay, canvas, originalTarget, committed: false, adapter: null,
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
      const target = await record.adapter.create(url, this.#surface(record));
      this.gecko.resolve(originalTarget); // the Gecko tab did not navigate while WebKit started
      if (this.disposed || this.pending !== record || this.window.gBrowser.selectedTab !== tab) throw new Error("ENGINE_SWITCH_CANCELLED");
      this.pending = null; this.records.set(tab, record); record.committed = true;
      browser.style.visibility = "hidden"; overlay.style.display = "block";
      if (typeof browser.docShellIsActive === "boolean") browser.docShellIsActive = false;
      tab.setAttribute?.(ENGINE_ATTRIBUTE, "webkit");
      this.#input(record);
      record.observer = new this.window.ResizeObserver(() => this.#resize(record));
      record.observer.observe(stack);
      this.#visibility(record);
      canvas.focus();
      this.#indicator(); this.#syncChrome(record);
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
  #listen(record, type, handler, options) {
    record.canvas.addEventListener(type, handler, options);
    record.listeners.push(() => record.canvas.removeEventListener(type, handler, options));
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
  #input(record) {
    for (const type of ["pointerdown", "pointerup", "pointermove"]) this.#listen(record, type, event => {
      if (!event.isTrusted || !record.committed || record.resizePending) return;
      if (type === "pointerdown") { record.canvas.focus(); record.canvas.setPointerCapture?.(event.pointerId); }
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
      }
    });
    this.#listen(record, "wheel", event => {
      if (!event.isTrusted) return;
      event.preventDefault(); // never scroll Zen or start a history swipe over the view
      if (!record.committed || record.resizePending) return;
      const scale = event.deltaMode === 1 ? 20 : (event.deltaMode === 2 ? record.adapter.surface.height : 1);
      const position = this.#point(record, event);
      // engine-stream-v1 wheel sign (cef-v1): negative delta_y scrolls down.
      if (record.wheel && record.wheel.fields.modifiers !== position.modifiers) this.#flushWheel(record);
      record.wheel ??= { fields: position, x: 0, y: 0 };
      record.wheel.fields = position; record.wheel.x -= event.deltaX * scale; record.wheel.y -= event.deltaY * scale;
      if (!record.wheelScheduled) {
        record.wheelScheduled = true;
        this.window.requestAnimationFrame(() => { record.wheelScheduled = false; this.#flushWheel(record); });
      }
    }, { passive: false });
    for (const [name, type] of [["keydown", "down"], ["keyup", "up"]]) this.#listen(record, name, event => {
      if (!event.isTrusted || !record.committed) return;
      const route = linuxKeyboardRoute(event);
      if (route === "chrome") return; // Zen's shortcuts work over WebKit exactly as over Firefox
      event.preventDefault(); event.stopPropagation();
      if (route === "edit") { if (type === "down") this.#action(record, target => record.adapter.edit(target, editAction(event))); return; }
      if (route === "text") {
        if (type === "down" && record.adapter.inputFeatures.imeCommit) this.#send(record, "ime_commit_text", { text: event.key });
        return;
      }
      if (route === "unsupported") { this.#indicator("This experimental engine has no IME bridge yet"); return; }
      const fields = streamKey(event, type);
      this.#send(record, "key", fields);
      if (type === "down" && !event.ctrlKey && !event.altKey && !event.metaKey) {
        if (event.key.length <= 2) this.#send(record, "key", { ...fields, type: "char" });
        else if (event.key === "Enter") this.#send(record, "key", { ...fields, type: "char", text: "\r" });
      }
    });
    this.#listen(record, "focus", () => { record.contentFocused = true; this.#action(record, target => record.adapter.focus(target, true)); });
    this.#listen(record, "blur", () => { record.contentFocused = false; this.#action(record, target => record.adapter.focus(target, false)); });
    this.#listen(record, "compositionstart", event => { event.preventDefault(); this.#indicator("IME composition is unsupported in WebKit tabs yet"); });
    this.#listen(record, "contextmenu", event => event.preventDefault());
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
