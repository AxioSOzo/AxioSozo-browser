/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { launchCEF, allowedFixtureURL, fitCEFRenderSurface, CHROMIUM_VERSION } from "./CEFEngineAdapter.sys.mjs";

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
export function keyboardRoute(event) {
  if (event.isComposing || event.key === "Dead" || event.key === "Process") return "unsupported";
  const key = event.key.toLowerCase();
  if (event.metaKey && ["c", "v", "x"].includes(key)) return "unsupported"; // clipboard is a separate unproven gate
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
    onTargetEvent = () => {}, onFailure = () => {} } = {}) {
    this.window = win; this.gecko = geckoAdapter; this.launch = launch;
    this.onEngineChange = onEngineChange; this.onTargetEvent = onTargetEvent; this.onFailure = onFailure;
    this.record = null; this.pending = null; this.disposed = false; this.restoreHooks = [];
    this.onTabClose = event => {
      if (event.target === this.record?.tab || event.target === this.pending?.tab) this.switchToGecko().catch(onFailure);
    };
    this.onTabSelect = () => {
      if (this.record) this.#indicator(this.record);
    };
    win.gBrowser.tabContainer.addEventListener("TabClose", this.onTabClose);
    win.gBrowser.tabContainer.addEventListener("TabSelect", this.onTabSelect);
    try { this.#installCommands(); }
    catch (error) {
      for (const restore of this.restoreHooks.reverse()) restore();
      win.gBrowser.tabContainer.removeEventListener("TabClose", this.onTabClose);
      win.gBrowser.tabContainer.removeEventListener("TabSelect", this.onTabSelect);
      throw error;
    }
  }
  get active() { return this.record && this.window.gBrowser.selectedTab === this.record.tab ? this.record : null; }
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
    this.onEngineChange({ engine: active ? "chromium" : "gecko", experimental: !!active,
      version: active ? CHROMIUM_VERSION : null, fixtureOnly: !!active, reason: reason ?? scaleNotice });
  }
  async switchToChromium(tab = this.window.gBrowser.selectedTab) {
    if (this.disposed || this.pending) throw new Error("ENGINE_SWITCH_IN_PROGRESS");
    if (this.record?.tab === tab) return this.record.adapter.target;
    if (this.record) await this.switchToGecko();
    const browser = tab.linkedBrowser, tracked = this.gecko.find(browser);
    const originalTarget = tracked && this.gecko.target(tracked);
    const origin = this.window.Services.env.get("AXIOSOZO_ENGINE_FIXTURE_ORIGIN");
    const url = browser.currentURI.spec;
    if (!originalTarget || originalTarget.private_mode || !allowedFixtureURL(url, origin)) throw new Error("CEF_LOCAL_FIXTURE_ONLY");
    // Tabbrowser.sys.mjs at the pinned revision owns browser -> browserStack -> browserContainer.
    const stack = browser.parentNode;
    if (!stack.classList.contains("browserStack")) throw new Error("UNSUPPORTED_ZEN_CONTENT_CONTAINER");
    const overlay = this.window.document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    overlay.setAttribute("data-axiosozo-cef", "experimental-fixture-only");
    overlay.style.cssText = "position:absolute;inset:0;display:none;z-index:1;background:#fff;overflow:hidden";
    const canvas = this.window.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    canvas.tabIndex = 0; canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "Experimental Chromium fixture. Native accessibility and IME unavailable. Use the engine switch to return to Gecko.");
    canvas.style.cssText = "display:block;width:100%;height:100%;outline:none";
    overlay.appendChild(canvas);
    const record = { tab, browser, stack, overlay, canvas, originalTarget, committed:false, adapter:null,
      priorVisibility:browser.style.visibility, priorPosition:stack.style.position, originalLabel:tab.label,
      latestURL:url, listeners:[], displayedFrames:0, drawMilliseconds:0, firstFrameAt:null, startedAt:this.window.performance.now() };
    this.pending = record;
    if (this.window.getComputedStyle(stack).position === "static") stack.style.position = "relative";
    stack.appendChild(overlay);
    try {
      record.adapter = await this.launch(this.window, { tabId:originalTarget.tab_id, origin,
        onFrame:(metadata, pixels) => this.#draw(record, metadata, pixels),
        onEvent:event => this.#event(record, event),
        onFailure:error => this.#failed(record, error) });
      if (this.disposed || this.pending !== record) throw new Error("ENGINE_SWITCH_CANCELLED");
      const target = await record.adapter.create(url, this.#surface(record));
      this.gecko.resolve(originalTarget); // no navigation/identity change during asynchronous preparation
      if (this.disposed || this.pending !== record || this.window.gBrowser.selectedTab !== tab) throw new Error("ENGINE_SWITCH_CANCELLED");
      this.pending = null; this.record = record; record.committed = true;
      browser.style.visibility = "hidden"; overlay.style.display = "block";
      this.#input(record);
      record.observer = new this.window.ResizeObserver(() => this.#resize(record));
      record.observer.observe(stack);
      canvas.focus(); this.#indicator(record); this.#syncChrome(record);
      return target;
    } catch (error) {
      await this.#remove(record);
      this.onFailure(error);
      throw error;
    }
  }
  #draw(record, metadata, pixels) {
    if (this.disposed || (this.record !== record && this.pending !== record)) return;
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
    this.onTargetEvent(event);
    if (record.committed) this.#syncChrome(record);
  }
  #syncChrome(record) {
    if (this.active !== record) return;
    if (record.title) record.tab.label = record.title;
    this.window.gBrowser.updateTitlebar();
    this.window.UpdateBackForwardCommands(record.browser);
    // Pinned UrlbarInputBase.setURI accepts an explicit nsIURI. Identity remains
    // the same loopback origin in this experiment; general HTTPS UI is unproven.
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
    if (!record.committed) return;
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
      const route = keyboardRoute(event);
      if (route === "chrome") return; // URL bar/new tab/close/reload retain normal browser shortcuts
      event.preventDefault(); event.stopPropagation();
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
      if (allowedFixtureURL(value, record.originalTarget.identity)) {
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
    this.#indicator(null, "Chromium stopped; Gecko tab preserved");
    this.onFailure(error);
  }
  async #remove(record) {
    if (this.pending === record) this.pending = null;
    if (this.record === record) this.record = null;
    record.committed = false;
    record.observer?.disconnect();
    for (const remove of record.listeners) remove();
    record.listeners = [];
    record.browser.style.visibility = record.priorVisibility;
    record.stack.style.position = record.priorPosition;
    record.overlay.remove();
    if (record.tab.isConnected) this.window.gBrowser.setTabTitle(record.tab);
    await record.adapter?.close().catch(() => {});
  }
  async switchToGecko() {
    const record = this.record || this.pending;
    if (!record) return;
    await this.#remove(record);
    this.window.gURLBar.setURI(); this.window.gBrowser.updateTitlebar();
    this.window.UpdateBackForwardCommands(this.window.gBrowser.selectedBrowser);
    this.#indicator(null);
  }
  diagnostics() {
    const record = this.record;
    return record ? { engine:"chromium", version:CHROMIUM_VERSION, target:record.adapter.target,
      frames:record.displayedFrames, meanDrawMilliseconds:record.drawMilliseconds / record.displayedFrames,
      firstFrameMilliseconds:record.firstFrameAt - record.startedAt, lastFrameId:record.lastFrameId,
      surface:record.adapter.surface, renderScaleLimited:!!record.renderScaleLimited } : { engine:"gecko" };
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
    for (const restore of this.restoreHooks.reverse()) restore();
    await this.switchToGecko();
  }
}
