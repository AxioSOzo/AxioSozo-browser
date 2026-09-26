/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { launchCEF, allowedFixtureURL, allowedWebURL, fitCEFRenderSurface, CHROMIUM_VERSION } from "./CEFEngineAdapter.sys.mjs";

const MAX_CEF_TABS = 4;
const BLANK_IDENTITY = "https://axiosozo.invalid";
/** A switch is not authority to replay POST results or URL-carried secrets. */
export function transferableGeckoURL(browser) {
  const value = browser.currentURI?.spec;
  if (!allowedWebURL(value) || value === "about:blank") return null;
  const url = new URL(value);
  if (url.search || url.hash) return null;
  try {
    // This is the pinned parent-process nsISHEntry, never serialized session
    // history or page content. Only inspect the presence of POST data.
    const entry = browser.browsingContext?.activeSessionHistoryEntry;
    if (!entry || entry.URI?.spec !== value || entry.postData !== null) return null;
    return value;
  } catch { return null; }
}

// Verified against Xcode 26 HIToolbox/Events.h. Physical codes are independent
// from event.key text, so the renderer receives both layout and key information.
const MAC_KEYS = {
  KeyA:0x00, KeyS:0x01, KeyD:0x02, KeyF:0x03, KeyH:0x04, KeyG:0x05,
  KeyZ:0x06, KeyX:0x07, KeyC:0x08, KeyV:0x09, KeyB:0x0b, KeyQ:0x0c,
  KeyW:0x0d, KeyE:0x0e, KeyR:0x0f, KeyY:0x10, KeyT:0x11, Digit1:0x12,
  Digit2:0x13, Digit3:0x14, Digit4:0x15, Digit6:0x16, Digit5:0x17,
  Equal:0x18, Digit9:0x19, Digit7:0x1a, Minus:0x1b, Digit8:0x1c,
  Digit0:0x1d, BracketRight:0x1e, KeyO:0x1f, KeyU:0x20, BracketLeft:0x21,
  KeyI:0x22, KeyP:0x23, Enter:0x24, KeyL:0x25, KeyJ:0x26, Quote:0x27,
  KeyK:0x28, Semicolon:0x29, Backslash:0x2a, Comma:0x2b, Slash:0x2c,
  KeyN:0x2d, KeyM:0x2e, Period:0x2f, Tab:0x30, Space:0x31,
  Backquote:0x32, Backspace:0x33, Escape:0x35, MetaRight:0x36, MetaLeft:0x37,
  ShiftLeft:0x38, CapsLock:0x39, AltLeft:0x3a, ControlLeft:0x3b,
  ShiftRight:0x3c, AltRight:0x3d, ControlRight:0x3e,
  Home:0x73, PageUp:0x74, Delete:0x75, End:0x77, PageDown:0x79,
  ArrowLeft:0x7b, ArrowRight:0x7c, ArrowDown:0x7d, ArrowUp:0x7e,
};
export function cefModifiers(event) {
  return (event.getModifierState?.("CapsLock") ? 1 : 0) | (event.shiftKey ? 2 : 0)
    | (event.ctrlKey ? 4 : 0) | (event.altKey ? 8 : 0) | (event.metaKey ? 128 : 0)
    | ((event.buttons & 1) ? 16 : 0) | ((event.buttons & 4) ? 32 : 0) | ((event.buttons & 2) ? 64 : 0);
}
export function keyboardRoute(event, { editing = false } = {}) {
  if (event.isComposing || event.key === "Dead" || event.key === "Process") return "unsupported";
  const key = event.key.toLowerCase();
  if (event.metaKey && ["c", "v", "x", "a", "z"].includes(key)) return editing ? "edit" : "unsupported";
  if ((event.metaKey && ["l", "r", "t", "w", "n", "q", ",", "[", "]", "arrowleft", "arrowright"].includes(key))
      || (event.ctrlKey && key === "tab") || /^F\d{1,2}$/u.test(event.key)) return "chrome";
  return Object.hasOwn(MAC_KEYS, event.code) ? "cef" : "unsupported";
}
export function cefKey(event, type) {
  if (keyboardRoute(event) !== "cef") throw new Error("UNSUPPORTED_KEY");
  return { type, native_key_code: MAC_KEYS[event.code], windows_key_code: Math.min(255, event.keyCode || 0),
    modifiers: cefModifiers(event), text: event.key.length <= 2 ? event.key : "" };
}
export function bgraToRGBA(buffer) {
  // AXCF read() gives this presenter its own ArrayBuffer. Convert that buffer
  // in place: a 5K capped frame is ~33 MiB, so allocating a second pixel copy
  // for every paint needlessly amplifies main-thread memory pressure.
  const rgba = new Uint8ClampedArray(buffer);
  for (let i = 0; i < rgba.length; i += 4) {
    const blue = rgba[i], green = rgba[i + 1], red = rgba[i + 2], alpha = rgba[i + 3];
    // CEF paints premultiplied BGRA; canvas ImageData takes unpremultiplied RGBA.
    const scale = alpha && alpha !== 255 ? 255 / alpha : 1;
    rgba[i] = red * scale; rgba[i + 1] = green * scale;
    rgba[i + 2] = blue * scale; rgba[i + 3] = alpha;
  }
  return rgba;
}

/** Experimental privileged presenter; a CEF frame is never injected into website DOM. */
export class CEFPresenter {
  constructor(win, geckoAdapter, { launch = launchCEF, onEngineChange = () => {},
    onTargetEvent = () => {}, onFailure = () => {}, browsingMode = "fixture" } = {}) {
    this.window = win; this.gecko = geckoAdapter; this.launch = launch;
    this.onEngineChange = onEngineChange; this.onTargetEvent = onTargetEvent; this.onFailure = onFailure;
    this.browsingMode = browsingMode;
    this.records = new Map(); this.pending = null; this.disposed = false; this.restoreHooks = [];
    this.onTabClose = event => {
      const record = this.records.get(event.target) || (event.target === this.pending?.tab ? this.pending : null);
      if (record) this.#remove(record).then(() => this.#indicator(this.active)).catch(onFailure);
    };
    this.onTabAttrModified = event => {
      const record = this.records.get(event.target);
      if (!record) return;
      try { this.#assertNoActiveMedia(record.tab); }
      catch (error) { this.#failed(record, error); }
    };
    this.onTabSelect = () => {
      for (const record of this.records.values()) this.#visibility(record);
      this.#indicator(this.active);
      if (this.active) { this.#syncChrome(this.active); this.#resize(this.active); }
    };
    win.gBrowser.tabContainer.addEventListener("TabClose", this.onTabClose);
    win.gBrowser.tabContainer.addEventListener("TabSelect", this.onTabSelect);
    win.gBrowser.tabContainer.addEventListener("TabAttrModified", this.onTabAttrModified);
    this.onVisibilityChange = () => {
      // Gecko's own handler runs first, then reapply ownership after it may
      // reactivate the retained document when the window becomes visible.
      this.window.queueMicrotask(() => {
        if (!this.disposed) for (const record of this.records.values()) this.#visibility(record);
      });
    };
    win.document.addEventListener?.("visibilitychange", this.onVisibilityChange);
    try { this.#installCommands(); this.#installIdentityMask(); }
    catch (error) {
      for (const restore of this.restoreHooks.reverse()) restore();
      win.gBrowser.tabContainer.removeEventListener("TabClose", this.onTabClose);
      win.gBrowser.tabContainer.removeEventListener("TabSelect", this.onTabSelect);
      win.gBrowser.tabContainer.removeEventListener("TabAttrModified", this.onTabAttrModified);
      win.document.removeEventListener?.("visibilitychange", this.onVisibilityChange);
      throw error;
    }
  }
  get active() { return this.records.get(this.window.gBrowser.selectedTab) ?? null; }
  #assertNoActiveMedia(tab) {
    const sharing = this.window.gBrowser.getTabSharingState?.(tab);
    if (sharing?.camera || sharing?.microphone || sharing?.screen) throw new Error("CEF_ACTIVE_CAPTURE_MUST_STOP");
    if (tab.linkedBrowser.browsingContext?.mediaController?.isPlaying || tab.hasAttribute?.("soundplaying")) {
      throw new Error("CEF_ACTIVE_MEDIA_MUST_PAUSE");
    }
  }
  get record() { return this.active; }
  owners() { return [...this.records.values()].map(record => record.originalTarget.tab_id); }
  currentPage(tab = this.window.gBrowser.selectedTab) {
    const record = this.records.get(tab);
    return record ? { url:record.latestURL, title:record.title || "", engine:"chromium", tabId:record.originalTarget.tab_id } : null;
  }
  async navigate(url, { postData } = {}) {
    const record = this.active;
    if (!record) return false;
    if (postData) throw new Error("CEF_POST_REPLAY_BLOCKED");
    if (!record.adapter.allowedURL(url)) throw new Error("CEF_UNSUPPORTED_URL");
    const result = await record.adapter.navigate(record.adapter.target, url);
    if (result.status !== "success") throw new Error("CEF_NAVIGATION_FAILED");
    if (this.active === record) record.canvas.focus();
    return true;
  }
  focus() {
    if (!this.active) return false;
    this.active.canvas.focus(); return true;
  }
  #installIdentityMask() {
    // Gecko's identity and permission controls describe the preserved document,
    // never the CEF page. Do not show its lock/permission status over Chromium.
    const root = this.window.document.documentElement;
    if (!root) return;
    const style = this.window.document.createElementNS("http://www.w3.org/1999/xhtml", "style");
    style.textContent = `[axiosozo-cef-active] :is(#identity-box, #tracking-protection-icon-container,
      #notification-popup-box, #reader-mode-button, #translations-button, #pageActionButton, #star-button-box) { display:none !important; }`;
    root.appendChild(style);
    this.restoreHooks.push(() => { root.removeAttribute("axiosozo-cef-active"); style.remove(); });
  }
  #visibility(record) {
    const visible = this.active === record && !this.window.document.hidden;
    if (typeof record.browser.docShellIsActive === "boolean") record.browser.docShellIsActive = false;
    if (record.visible === visible) return;
    record.visible = visible;
    if (this.browsingMode === "web") this.#action(record, target => record.adapter.visibility(target, visible));
  }
  #surface(record) {
    const rect = record.browser.getBoundingClientRect();
    const surface = fitCEFRenderSurface({ width: Math.floor(rect.width), height: Math.floor(rect.height),
      device_scale: this.window.devicePixelRatio });
    record.renderScaleLimited = surface.device_scale < this.window.devicePixelRatio;
    return surface;
  }
  #indicator(record, reason) {
    const active = record && this.window.gBrowser.selectedTab === record.tab && record.committed;
    const scaleNotice = active && record.renderScaleLimited
      ? `CEF render scale capped at ${record.adapter.surface.device_scale}× for this window size` : undefined;
    this.window.document.documentElement?.toggleAttribute("axiosozo-cef-active", !!active);
    this.onEngineChange({ engine: active ? "chromium" : "gecko", experimental: !!active,
      version: active ? CHROMIUM_VERSION : null, fixtureOnly: !!active && this.browsingMode === "fixture", reason: reason ?? scaleNotice });
  }
  async switchToChromium(tab = this.window.gBrowser.selectedTab) {
    if (this.disposed || this.pending) throw new Error("ENGINE_SWITCH_IN_PROGRESS");
    if (this.records.has(tab)) return this.records.get(tab).adapter.target;
    if (this.records.size >= MAX_CEF_TABS) throw new Error("CEF_TAB_LIMIT");
    this.#assertNoActiveMedia(tab);
    const browser = tab.linkedBrowser, tracked = this.gecko.find(browser);
    const originalTarget = tracked && this.gecko.target(tracked);
    let origin = this.window.Services.env.get("AXIOSOZO_ENGINE_FIXTURE_ORIGIN");
    let url = browser.currentURI.spec;
    if (!originalTarget || originalTarget.private_mode) throw new Error("CEF_PRIVATE_OR_UNKNOWN_TAB");
    if (this.browsingMode === "web") {
      url = transferableGeckoURL(browser) || "about:blank";
      origin = url === "about:blank" ? BLANK_IDENTITY : new URL(url).origin;
    } else if (!allowedFixtureURL(url, origin)) throw new Error("CEF_LOCAL_FIXTURE_ONLY");
    // Tabbrowser.sys.mjs at the pinned revision owns browser -> browserStack -> browserContainer.
    const stack = browser.parentNode;
    if (!stack.classList.contains("browserStack")) throw new Error("UNSUPPORTED_ZEN_CONTENT_CONTAINER");
    const overlay = this.window.document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    overlay.setAttribute("data-axiosozo-cef", this.browsingMode === "web" ? "experimental-web" : "experimental-fixture-only");
    overlay.style.cssText = "position:absolute;inset:0;display:none;z-index:1;background:#fff;overflow:hidden";
    const canvas = this.window.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    canvas.tabIndex = 0; canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "Chromium page. Native accessibility and IME unavailable. Use the engine switch to return to Firefox.");
    canvas.style.cssText = "display:block;width:100%;height:100%;outline:none";
    overlay.appendChild(canvas);
    const record = { tab, browser, stack, overlay, canvas, originalTarget, committed:false, adapter:null,
      priorVisibility:browser.style.visibility, priorPosition:stack.style.position, originalLabel:tab.label,
      priorDocShellIsActive:browser.docShellIsActive,
      latestURL:url, listeners:[], displayedFrames:0, drawMilliseconds:0, firstFrameAt:null, startedAt:this.window.performance.now() };
    this.pending = record;
    if (this.window.getComputedStyle(stack).position === "static") stack.style.position = "relative";
    stack.appendChild(overlay);
    try {
      record.adapter = await this.launch(this.window, { tabId:originalTarget.tab_id, origin, browsingMode:this.browsingMode,
        onFrame:(metadata, pixels) => this.#draw(record, metadata, pixels),
        onEvent:event => this.#event(record, event),
        onFailure:error => this.#failed(record, error) });
      if (this.disposed || this.pending !== record) throw new Error("ENGINE_SWITCH_CANCELLED");
      const target = await record.adapter.create(url, this.#surface(record));
      this.gecko.resolve(originalTarget); // no navigation/identity change during asynchronous preparation
      this.#assertNoActiveMedia(tab);
      if (this.disposed || this.pending !== record || this.window.gBrowser.selectedTab !== tab) throw new Error("ENGINE_SWITCH_CANCELLED");
      this.pending = null; this.records.set(tab, record); record.committed = true;
      browser.style.visibility = "hidden"; overlay.style.display = "block";
      this.#input(record);
      record.observer = new this.window.ResizeObserver(() => this.#resize(record));
      record.observer.observe(stack);
      this.#visibility(record);
      canvas.focus(); this.#indicator(record); this.#syncChrome(record);
      return target;
    } catch (error) {
      await this.#remove(record);
      this.onFailure(error);
      throw error;
    }
  }
  #draw(record, metadata, pixels) {
    if (this.disposed || (this.pending !== record && (this.active !== record || this.window.document.hidden))) return;
    const started = this.window.performance.now();
    if (record.canvas.width !== metadata.width) record.canvas.width = metadata.width;
    if (record.canvas.height !== metadata.height) record.canvas.height = metadata.height;
    const context = record.canvas.getContext("2d", { alpha:false });
    if (!context) throw new Error("CEF_CANVAS_UNAVAILABLE");
    context.putImageData(new this.window.ImageData(bgraToRGBA(pixels), metadata.width, metadata.height), 0, 0);
    record.displayedFrames++;
    record.drawMilliseconds += this.window.performance.now() - started;
    record.firstFrameAt ??= this.window.performance.now();
    record.lastFrameId = metadata.frame_id;
  }
  #event(record, event) {
    if (event.event === "url") record.latestURL = event.url;
    if (event.event === "title") record.title = event.title;
    if (event.event === "loading") record.loading = event;
    if (event.event === "error" && !event.request_id) {
      if (["render_process_terminated", "load_failed"].includes(event.code)) {
        this.#failed(record, new Error("CEF_PAGE_LOAD_FAILED")); return;
      }
      if (["permission_denied", "download_denied", "popup_denied", "navigation_denied", "certificate_error"].includes(event.code)) {
        this.#indicator(this.active, "Unsupported Chromium operation blocked");
      }
    }
    this.onTargetEvent(event);
    if (record.committed && event.event === "navigation") { record.visible = undefined; this.#visibility(record); }
    if (record.committed) this.#syncChrome(record);
  }
  #syncChrome(record) {
    if (this.active !== record) return;
    if (record.title) record.tab.label = record.title;
    this.window.gBrowser.updateTitlebar();
    this.window.UpdateBackForwardCommands(record.browser);
    // The explicit nsIURI updates address text; Gecko security UI is masked.
    if (!this.window.gURLBar.focused) this.window.gURLBar.setURI({ uri:this.window.Services.io.newURI(record.latestURL) });
  }
  #action(record, operation) {
    const target = record.adapter.target;
    Promise.resolve().then(() => operation(target)).then(result => {
      if (result?.status === "unsupported") this.#indicator(record, result.reason || "Operation unsupported in fixture engine");
      else if (result && result.status !== "success") throw new Error("CEF_ACTION_FAILED");
    }).catch(error => {
      if (!record.committed) return;
      if (error.message === "STALE_CEF_TARGET") this.#indicator(record, "Input discarded after navigation");
      else this.#failed(record, error);
    });
  }
  #resize(record) {
    if (!record.committed || this.active !== record) return;
    if (record.resizePending) { record.resizeDirty = true; return; }
    record.resizePending = true;
    record.nextPointer = null; // do not send a queued old-size move after resize begins
    this.window.requestAnimationFrame(async () => {
      try {
        do {
          record.resizeDirty = false;
          if (!record.committed) return;
          const surface = this.#surface(record);
          if (JSON.stringify(surface) === JSON.stringify(record.adapter.surface)) continue;
          const result = await record.adapter.resize(record.adapter.target, surface);
          if (result?.status !== "success") throw new Error("UNSUPPORTED_SURFACE");
          this.#indicator(record);
        } while (record.resizeDirty);
      } catch (error) {
        if (error.message === "STALE_CEF_TARGET" && record.committed) record.resizeDirty = true;
        else this.#failed(record, error);
      } finally {
        record.resizePending = false;
        if (record.resizeDirty && record.committed) this.#resize(record);
        else if (record.deferredPointerUp && record.committed) {
          const fields = record.deferredPointerUp;
          record.deferredPointerUp = null;
          this.#action(record, target => record.adapter.input(target, "mouse", {
            ...fields, x:Math.min(fields.x, record.adapter.surface.width),
            y:Math.min(fields.y, record.adapter.surface.height) }));
        }
      }
    });
  }
  #listen(record, type, handler, options) {
    record.canvas.addEventListener(type, handler, options);
    record.listeners.push(() => record.canvas.removeEventListener(type, handler, options));
  }
  #input(record) {
    const send = (method, fields) => this.#action(record, target => record.adapter.input(target, method, fields));
    const point = event => {
      const bounds = record.canvas.getBoundingClientRect();
      return { x:Math.max(0, Math.min(record.adapter.surface.width, Math.floor(event.clientX - bounds.left))),
        y:Math.max(0, Math.min(record.adapter.surface.height, Math.floor(event.clientY - bounds.top))), modifiers:cefModifiers(event) };
    };
    for (const type of ["pointerdown", "pointerup", "pointermove"]) this.#listen(record, type, event => {
      if (!event.isTrusted || !record.committed) return;
      if (type === "pointerdown" && !record.resizePending) { record.canvas.focus(); record.canvas.setPointerCapture(event.pointerId); }
      if (type === "pointerup" && record.canvas.hasPointerCapture(event.pointerId)) record.canvas.releasePointerCapture(event.pointerId);
      event.preventDefault();
      const fields = { ...point(event), type:type === "pointermove" ? "move" : (type === "pointerdown" ? "down" : "up"),
        button:["left", "middle", "right"][Math.max(0, event.button)] || "left", click_count:Math.max(1, Math.min(3, event.detail || 1)), mouse_leave:false };
      if (record.resizePending) {
        if (type === "pointerup") record.deferredPointerUp = fields;
        return;
      }
      if (type === "pointermove") {
        record.nextPointer = fields;
        if (!record.pointerPending) {
          record.pointerPending = true;
          this.window.requestAnimationFrame(() => {
            record.pointerPending = false;
            if (record.committed && !record.resizePending && record.nextPointer) send("mouse", record.nextPointer);
            record.nextPointer = null;
          });
        }
      } else {
        // Flush the last drag point before button-up; never send a stale
        // buttons-down move after releasing the native selection gesture.
        if (record.nextPointer) { send("mouse", record.nextPointer); record.nextPointer = null; }
        send("mouse", fields);
      }
    });
    this.#listen(record, "wheel", event => {
      if (!event.isTrusted) return;
      event.preventDefault();
      if (record.resizePending) return;
      const scale = event.deltaMode === 1 ? 20 : (event.deltaMode === 2 ? record.adapter.surface.height : 1);
      const limit = value => Math.max(-4096, Math.min(4096, Math.round(value)));
      send("wheel", { ...point(event), delta_x:limit(-event.deltaX * scale), delta_y:limit(-event.deltaY * scale) });
    }, { passive:false });
    for (const [eventName, type] of [["keydown", "down"], ["keyup", "up"]]) this.#listen(record, eventName, event => {
      if (!event.isTrusted) return;
      const route = keyboardRoute(event, { editing:this.browsingMode === "web" });
      if (route === "chrome") return; // URL bar/new tab/close/reload retain normal browser shortcuts
      event.preventDefault(); event.stopPropagation();
      if (route === "edit") {
        if (type === "down") {
          const action = { c:"copy", x:"cut", v:"paste", a:"select_all", z:event.shiftKey ? "redo" : "undo" }[event.key.toLowerCase()];
          this.#action(record, target => record.adapter.edit(target, action));
        }
        return;
      }
      if (route === "unsupported") { this.#indicator(record, "This experimental engine has no IME or clipboard bridge"); return; }
      const fields = cefKey(event, type); send("key", fields);
      if (type === "down" && !event.metaKey && !event.ctrlKey && !event.altKey && event.key.length <= 2) send("key", { ...fields, type:"char" });
    });
    this.#listen(record, "focus", () => this.#action(record, target => record.adapter.focus(target, true)));
    this.#listen(record, "blur", () => this.#action(record, target => record.adapter.focus(target, false)));
    this.#listen(record, "contextmenu", event => { event.preventDefault(); this.#indicator(record, "Chromium context menu is not integrated"); });
    this.#listen(record, "compositionstart", event => { event.preventDefault(); this.#indicator(record, "IME is unsupported in the experimental Chromium surface"); });
  }
  #installCommands() {
    const wrap = (owner, method, replacement) => {
      const original = owner?.[method];
      if (typeof original !== "function") throw new Error(`UNSUPPORTED_BROWSER_API_${method}`);
      const presenter = this;
      const wrapped = function(...args) { return replacement.call(this, presenter, original, args); };
      owner[method] = wrapped;
      this.restoreHooks.push(() => { if (owner[method] === wrapped) owner[method] = original; });
    };
    if (typeof this.window.gBrowser.shouldActivateDocShell === "function") {
      wrap(this.window.gBrowser, "shouldActivateDocShell", function(presenter, original, args) {
        if ([...presenter.records.values()].some(record => record.browser === args[0])) return false;
        return original.apply(this, args);
      });
    }
    for (const method of ["back", "forward", "reload"]) wrap(this.window.BrowserCommands, method, function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      const event = args[0];
      if (event && presenter.window.BrowserUtils.whereToOpenLink(event, false, true) !== "current") {
        presenter.#indicator(record, "Modified history navigation is unsupported in this fixture engine"); return;
      }
      presenter.#action(record, target => record.adapter[method](target));
    });
    wrap(this.window, "UpdateBackForwardCommands", function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      return original.call(this, { canGoBack:!!record.loading?.can_go_back,
        canGoForward:!!record.loading?.can_go_forward });
    });
    wrap(this.window.BrowserCommands, "reloadSkipCache", function(presenter, original, args) {
      if (!presenter.active) return original.apply(this, args);
      presenter.#indicator(presenter.active, "Cache-bypass reload is unsupported in this fixture engine");
    });
    wrap(this.window.gURLBar, "handleNavigation", function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      const value = this.value;
      if (presenter.browsingMode === "web" ? allowedWebURL(value) : allowedFixtureURL(value, record.originalTarget.identity)) {
        this.view.close({ elementPicked:true }); record.canvas.focus();
        presenter.#action(record, target => record.adapter.navigate(target, value));
        return;
      }
      // An explicit normal URL/search returns to the preserved Gecko tab, then
      // invokes the original audited URL-bar behavior. No URL/model text is code.
      return presenter.switchToGecko().then(() => { this.value = value; return original.apply(this, args); });
    });
  }
  async #failed(record, error) {
    await this.#remove(record);
    this.#indicator(this.active, "Chromium stopped; Firefox tab preserved");
    this.onFailure(error);
  }
  async #remove(record) {
    if (record.removing) return record.removing;
    record.removing = this.#removeOnce(record);
    return record.removing;
  }
  async #removeOnce(record) {
    if (this.pending === record) this.pending = null;
    if (this.records.get(record.tab) === record) this.records.delete(record.tab);
    record.committed = false;
    record.observer?.disconnect();
    for (const remove of record.listeners) remove();
    record.listeners = [];
    record.browser.style.visibility = record.priorVisibility;
    if (typeof record.priorDocShellIsActive === "boolean") {
      record.browser.docShellIsActive = this.window.gBrowser.shouldActivateDocShell?.(record.browser)
        ?? (this.window.gBrowser.selectedTab === record.tab && record.priorDocShellIsActive);
    }
    record.stack.style.position = record.priorPosition;
    record.overlay.remove();
    record.canvas.width = 1; record.canvas.height = 1;
    if (record.tab.isConnected) this.window.gBrowser.setTabTitle(record.tab);
    if (this.window.gBrowser.selectedTab === record.tab) {
      this.window.gURLBar.setURI(); this.window.gBrowser.updateTitlebar();
      this.window.UpdateBackForwardCommands(record.browser);
    }
    await record.adapter?.close().catch(() => {});
  }
  async switchToGecko() {
    const record = this.active || (this.pending?.tab === this.window.gBrowser.selectedTab ? this.pending : null);
    if (!record) return;
    await this.#remove(record);
    this.window.gURLBar.setURI(); this.window.gBrowser.updateTitlebar();
    this.window.UpdateBackForwardCommands(this.window.gBrowser.selectedBrowser);
    this.#indicator(this.active);
  }
  diagnostics() {
    const record = this.active;
    return record ? { engine:"chromium", version:CHROMIUM_VERSION, target:record.adapter.target,
      frames:record.displayedFrames, meanDrawMilliseconds:record.drawMilliseconds / record.displayedFrames,
      firstFrameMilliseconds:record.firstFrameAt - record.startedAt, lastFrameId:record.lastFrameId,
      surface:record.adapter.surface, renderScaleLimited:!!record.renderScaleLimited,
      fixtureOnly:this.browsingMode === "fixture", ownedTabIds:this.owners() } : { engine:"gecko", ownedTabIds:this.owners() };
  }
  captureFixtureFrame() {
    const record = this.active;
    if (!record || !record.displayedFrames || !allowedFixtureURL(record.latestURL, record.originalTarget.identity)) {
      throw new Error("NO_VERIFIED_CEF_FIXTURE_FRAME");
    }
    // Explicit diagnostic call in privileged chrome only, never a content API or
    // continuous page capture. The outer Zen window must be evidenced separately.
    return { png:record.canvas.toDataURL("image/png"), diagnostics:this.diagnostics() };
  }
  async dispose() {
    this.disposed = true;
    this.window.gBrowser.tabContainer.removeEventListener("TabClose", this.onTabClose);
    this.window.gBrowser.tabContainer.removeEventListener("TabSelect", this.onTabSelect);
    this.window.gBrowser.tabContainer.removeEventListener("TabAttrModified", this.onTabAttrModified);
    this.window.document.removeEventListener?.("visibilitychange", this.onVisibilityChange);
    for (const restore of this.restoreHooks.reverse()) restore();
    await Promise.all([...this.records.values(), ...(this.pending ? [this.pending] : [])].map(record => this.#remove(record)));
  }
}
