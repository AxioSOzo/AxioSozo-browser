/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { launchCEF, allowedFixtureURL, allowedWebURL, fitCEFRenderSurface, CHROMIUM_VERSION, BLANK_IDENTITY } from "./CEFEngineAdapter.sys.mjs";

const MAX_CEF_TABS = 24;
const XHTML = "http://www.w3.org/1999/xhtml";
// Persisted with Zen's own session so a Chromium tab restores as a Chromium tab.
const ENGINE_ATTRIBUTE = "axiosozo-engine";
const ENGINE_VALUE = "axiosozo-engine";
const URL_VALUE = "axiosozo-chromium-url";

/** A page address that one engine may hand to the other on an explicit switch. */
export function transferableURL(value) {
  return allowedWebURL(value) && value !== "about:blank" ? value : null;
}

/**
 * The switch carries the visible address, as if the user retyped it. It never
 * replays POST results: the pinned parent-process nsISHEntry must match and
 * carry no POST data. Page content, cookies and history stay in their engine.
 */
export function transferableGeckoURL(browser) {
  const value = transferableURL(browser.currentURI?.spec);
  if (!value) return null;
  try {
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
// Command chords that edit or move within page text stay with the page.
const PAGE_CHORDS = new Set(["arrowleft", "arrowright", "arrowup", "arrowdown", "backspace", "delete", "home", "end"]);
export function cefModifiers(event) {
  return (event.getModifierState?.("CapsLock") ? 1 : 0) | (event.shiftKey ? 2 : 0)
    | (event.ctrlKey ? 4 : 0) | (event.altKey ? 8 : 0) | (event.metaKey ? 128 : 0)
    | ((event.buttons & 1) ? 16 : 0) | ((event.buttons & 4) ? 32 : 0) | ((event.buttons & 2) ? 64 : 0);
}
export function keyboardRoute(event, { editing = false } = {}) {
  if (event.isComposing || event.key === "Dead" || event.key === "Process") return "unsupported";
  const key = event.key.toLowerCase();
  if (event.metaKey && ["c", "v", "x", "a", "z"].includes(key)) return editing ? "edit" : "unsupported";
  // Every other ⌘ shortcut (new tab, close, find, tab numbers, zoom, Zen's own
  // commands) belongs to the browser, exactly as over a Firefox page.
  if ((event.metaKey && !PAGE_CHORDS.has(key)) || (event.ctrlKey && ["tab", "pageup", "pagedown"].includes(key))
      || /^F\d{1,2}$/u.test(event.key)) return "chrome";
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

const PAGE_ERRORS = {
  certificate_error: ["Your connection isn't private",
    "Chromium could not verify this site's certificate and did not load it. Firefox can show you the details."],
  load_failed: ["This page couldn't be loaded", "Check the address and your connection, then try again."],
  render_process_terminated: ["This page stopped working", "Reload to try again. Anything you entered may be lost."],
  engine_failed: ["Chromium stopped", "The Chromium engine for this tab stopped. Reload to start it again."],
};
const NOTICES = {
  permission_denied: "Chromium tabs can't grant site permissions yet.",
  download_denied: "Downloads aren't supported in Chromium tabs yet. Open this tab in Firefox to download.",
  popup_denied: "A pop-up was blocked.",
  file_dialog_unavailable: "File uploads aren't supported in Chromium tabs yet.",
  javascript_dialog_unavailable: "This page tried to show a dialog, which Chromium tabs don't support yet.",
  client_certificate_unavailable: "Client certificates aren't supported in Chromium tabs.",
  navigation_denied: "Chromium tabs only open web addresses.",
};

/**
 * Presents Chromium inside a Zen tab and routes Zen's own tab, address bar and
 * navigation controls to the tab's engine. Privileged chrome only; a CEF frame
 * is never injected into website DOM.
 */
export class CEFPresenter {
  constructor(win, geckoAdapter, { launch = launchCEF, onEngineChange = () => {},
    onTargetEvent = () => {}, onFailure = () => {}, onSwitchStart = () => {}, browsingMode = "fixture" } = {}) {
    this.window = win; this.gecko = geckoAdapter; this.launch = launch;
    this.onEngineChange = onEngineChange; this.onTargetEvent = onTargetEvent; this.onFailure = onFailure;
    this.onSwitchStart = onSwitchStart;
    this.browsingMode = browsingMode;
    this.records = new Map(); this.pending = null; this.disposed = false; this.restoreHooks = [];
    this.restoreURLs = new WeakMap();
    this.onTabClose = event => {
      const record = this.records.get(event.target) || (event.target === this.pending?.tab ? this.pending : null);
      if (record) this.#remove(record, { keepEngine: true }).then(() => this.#indicator(this.active)).catch(onFailure);
    };
    this.onTabAttrModified = event => {
      const record = this.records.get(event.target);
      if (!record) return;
      try { this.#assertNoActiveMedia(record.tab); }
      catch (error) { this.#revert(record, error); }
    };
    this.onTabSelect = () => {
      for (const record of this.records.values()) this.#visibility(record);
      this.#indicator(this.active);
      if (this.active) {
        this.#syncChrome(this.active); this.#resize(this.active);
        if (!this.window.gURLBar.focused) this.active.canvas.focus();
      } else this.#activateIfMarked(this.window.gBrowser.selectedTab);
    };
    this.onTabRestored = event => this.#adoptRestoredTab(event.target);
    win.gBrowser.tabContainer.addEventListener("TabClose", this.onTabClose);
    win.gBrowser.tabContainer.addEventListener("TabSelect", this.onTabSelect);
    win.gBrowser.tabContainer.addEventListener("TabAttrModified", this.onTabAttrModified);
    win.gBrowser.tabContainer.addEventListener("SSTabRestored", this.onTabRestored);
    this.onVisibilityChange = () => {
      // Gecko's own handler runs first, then reapply ownership after it may
      // reactivate the retained document when the window becomes visible.
      this.window.queueMicrotask(() => {
        if (!this.disposed) for (const record of this.records.values()) this.#visibility(record);
      });
    };
    win.document.addEventListener?.("visibilitychange", this.onVisibilityChange);
    try {
      this.#installCommands(); this.#installStyle();
      if (this.browsingMode === "web") { this.#installTabMenu(); this.#installBadge(); }
    } catch (error) {
      for (const restore of this.restoreHooks.reverse()) restore();
      this.#removeListeners();
      throw error;
    }
    if (this.browsingMode === "web") {
      for (const tab of win.gBrowser.tabs ?? []) this.#adoptRestoredTab(tab);
      this.window.queueMicrotask(() => this.#activateIfMarked(this.window.gBrowser.selectedTab));
    }
  }
  get active() { return this.records.get(this.window.gBrowser.selectedTab) ?? null; }
  get record() { return this.active; }
  #removeListeners() {
    const container = this.window.gBrowser.tabContainer;
    container.removeEventListener("TabClose", this.onTabClose);
    container.removeEventListener("TabSelect", this.onTabSelect);
    container.removeEventListener("TabAttrModified", this.onTabAttrModified);
    container.removeEventListener("SSTabRestored", this.onTabRestored);
    this.window.document.removeEventListener?.("visibilitychange", this.onVisibilityChange);
  }
  #assertNoActiveMedia(tab) {
    const sharing = this.window.gBrowser.getTabSharingState?.(tab);
    if (sharing?.camera || sharing?.microphone || sharing?.screen) throw new Error("CEF_ACTIVE_CAPTURE_MUST_STOP");
    if (tab.linkedBrowser.browsingContext?.mediaController?.isPlaying || tab.hasAttribute?.("soundplaying")) {
      throw new Error("CEF_ACTIVE_MEDIA_MUST_PAUSE");
    }
  }
  owners() {
    const owners = [...this.records.values()].map(record => record.originalTarget.tab_id);
    if (this.pending?.originalTarget && !owners.includes(this.pending.originalTarget.tab_id)) owners.push(this.pending.originalTarget.tab_id);
    return owners;
  }
  engineOf(tab) {
    return this.records.has(tab) || this.pending?.tab === tab || tab?.getAttribute?.(ENGINE_ATTRIBUTE) === "chromium" ? "chromium" : "gecko";
  }
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
    if (!["success", "unsupported"].includes(result.status) && result.reason !== "NAVIGATION_SUPERSEDED") throw new Error("CEF_NAVIGATION_FAILED");
    if (this.active === record) record.canvas.focus();
    return true;
  }
  focus() {
    if (!this.active) return false;
    this.active.canvas.focus(); return true;
  }

  // ---- Engine choice, persisted per tab -------------------------------------
  #session() { return this.window.SessionStore; }
  #markEngine(tab, engine, url = null) {
    const store = this.#session();
    if (engine === "chromium") {
      tab.setAttribute?.(ENGINE_ATTRIBUTE, "chromium");
      try { store?.setCustomTabValue(tab, ENGINE_VALUE, "chromium"); } catch {}
      this.#rememberURL(tab, url);
    } else {
      tab.removeAttribute?.(ENGINE_ATTRIBUTE);
      this.restoreURLs.delete(tab);
      try { store?.deleteCustomTabValue(tab, ENGINE_VALUE); store?.deleteCustomTabValue(tab, URL_VALUE); } catch {}
    }
  }
  #rememberURL(tab, url) {
    const value = transferableURL(url);
    if (!value) return;
    this.restoreURLs.set(tab, value);
    try { this.#session()?.setCustomTabValue(tab, URL_VALUE, value); } catch {}
  }
  #adoptRestoredTab(tab) {
    if (this.browsingMode !== "web" || !tab || this.records.has(tab)) return;
    let engine = null, url = null;
    try { engine = this.#session()?.getCustomTabValue(tab, ENGINE_VALUE); url = this.#session()?.getCustomTabValue(tab, URL_VALUE); } catch {}
    if (engine !== "chromium") return;
    tab.setAttribute?.(ENGINE_ATTRIBUTE, "chromium");
    if (transferableURL(url)) this.restoreURLs.set(tab, url);
    if (tab === this.window.gBrowser.selectedTab) this.#activateIfMarked(tab);
  }
  /** Chromium starts lazily, when its tab is first shown. */
  #activateIfMarked(tab) {
    if (this.disposed || this.browsingMode !== "web" || !tab || this.records.has(tab) || this.pending?.tab === tab
        || tab.getAttribute?.(ENGINE_ATTRIBUTE) !== "chromium") return;
    const previous = this.pending?.settled ?? Promise.resolve();
    previous.catch(() => {}).then(() => {
      if (this.disposed || this.window.gBrowser.selectedTab !== tab || this.records.has(tab) || this.pending) return;
      return this.switchToChromium(tab, { url: this.restoreURLs.get(tab) ?? null });
    }).catch(() => {});
  }
  /** The explicit per-tab switch behind the tab menu and the address-bar badge. */
  async setTabEngine(tab, engine) {
    if (engine === "chromium") {
      if (this.records.has(tab) || this.pending?.tab === tab) return;
      if (tab !== this.window.gBrowser.selectedTab) {
        // A background tab switches when it is next shown.
        this.#markEngine(tab, "chromium", transferableGeckoURL(tab.linkedBrowser));
        return;
      }
      await this.switchToChromium(tab);
      return;
    }
    const record = this.records.get(tab) || (this.pending?.tab === tab ? this.pending : null);
    if (record) await this.#toGecko(record);
    else this.#markEngine(tab, "gecko");
  }

  // ---- Browser chrome: style, tab menu and badge -------------------------------
  #installStyle() {
    // Gecko's identity and permission controls describe the blank Firefox
    // document, never the CEF page. The badge states Chromium's own security
    // state, and only when a page is not secure; Chromium tabs carry no tag.
    const root = this.window.document.documentElement;
    if (!root) return;
    const style = this.window.document.createElementNS(XHTML, "style");
    style.textContent = `
      [axiosozo-cef-active] :is(#identity-box, #tracking-protection-icon-container,
        #notification-popup-box, #reader-mode-button, #translations-button, #pageActionButton, #star-button-box) { display:none !important; }
      #axiosozo-engine-badge { display:none; align-items:center; gap:5px; margin-inline:4px 2px; padding:1px 8px;
        border:0; border-radius:999px; background:color-mix(in srgb, #1a73e8 16%, transparent); color:inherit;
        font:inherit; font-size:11px; font-weight:600; white-space:nowrap; cursor:default; }
      [axiosozo-cef-active] #axiosozo-engine-badge[insecure] { display:inline-flex; }
      #axiosozo-engine-badge:hover { background:color-mix(in srgb, #1a73e8 26%, transparent); }
      #axiosozo-engine-badge:focus-visible { outline:2px solid var(--focus-outline-color, AccentColor); outline-offset:1px; }
      #axiosozo-engine-badge[insecure] { background:color-mix(in srgb, #d93025 16%, transparent); }
      /* The Chromium tab marker is drawn by EngineTabs in axiosozo-runtime.css. */
      [data-axiosozo-cef] .axiosozo-cef-panel { position:absolute; inset:0; display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:10px; padding:32px; text-align:center;
        background:Canvas; color:CanvasText; font:14px/1.5 system-ui; }
      [data-axiosozo-cef] .axiosozo-cef-panel[hidden], [data-axiosozo-cef] .axiosozo-cef-notice[hidden] { display:none; }
      [data-axiosozo-cef] .axiosozo-cef-panel h1 { margin:0; font-size:20px; font-weight:600; }
      [data-axiosozo-cef] .axiosozo-cef-panel p { margin:0; max-width:34em; opacity:.8; }
      [data-axiosozo-cef] .axiosozo-cef-panel div { display:flex; gap:8px; margin-top:6px; }
      [data-axiosozo-cef] .axiosozo-cef-panel button { font:inherit; padding:5px 14px; border-radius:6px;
        border:1px solid color-mix(in srgb, CanvasText 25%, Canvas); background:Canvas; color:inherit; }
      [data-axiosozo-cef] .axiosozo-cef-panel button.primary { background:AccentColor; color:AccentColorText; border-color:transparent; }
      [data-axiosozo-cef] .axiosozo-cef-notice { position:absolute; inset-inline:0; inset-block-end:16px; margin:auto;
        width:max-content; max-width:80%; padding:6px 12px; border-radius:8px; background:color-mix(in srgb, CanvasText 85%, Canvas);
        color:Canvas; font:12px/1.4 system-ui; pointer-events:none; }`;
    root.appendChild(style);
    this.restoreHooks.push(() => { root.removeAttribute("axiosozo-cef-active"); style.remove(); });
  }
  #installTabMenu() {
    const menu = this.window.document.getElementById?.("tabContextMenu");
    if (!menu) return;
    const item = this.window.document.createXULElement("menuitem");
    item.id = "axiosozo-context-engine";
    const contextTab = () => this.window.TabContextMenu?.contextTab;
    // Firefox's MenuSectionLayout rearranges this menu on popupshowing and
    // rejects unknown items anywhere but the trailing (extensions) run. Keep
    // the item trailing while closed; place it by Reload Tab once arranged.
    const showing = event => {
      if (event.target !== menu) return;
      const tab = contextTab();
      const available = tab && !this.window.PrivateBrowsingUtils?.isWindowPrivate?.(this.window);
      item.hidden = !available;
      if (available) item.setAttribute("label", this.engineOf(tab) === "chromium" ? "Open in Firefox" : "Open in Chromium");
      const anchor = this.window.document.getElementById("context_reloadSelectedTabs")
        ?? this.window.document.getElementById("context_reloadTab");
      if (anchor?.parentNode === menu) anchor.after(item);
    };
    const hidden = event => { if (event.target === menu) menu.appendChild(item); };
    const command = () => {
      const tab = contextTab();
      if (tab) this.setTabEngine(tab, this.engineOf(tab) === "chromium" ? "gecko" : "chromium").catch(error => this.onFailure(error));
    };
    item.addEventListener("command", command);
    menu.addEventListener("popupshowing", showing);
    menu.addEventListener("popuphidden", hidden);
    menu.appendChild(item);
    this.restoreHooks.push(() => {
      menu.removeEventListener("popupshowing", showing); menu.removeEventListener("popuphidden", hidden); item.remove();
    });
  }
  #installBadge() {
    const identity = this.window.document.getElementById?.("identity-box");
    if (!identity) return;
    const badge = this.window.document.createElementNS(XHTML, "button");
    badge.id = "axiosozo-engine-badge";
    badge.textContent = "Not secure";
    badge.setAttribute("tooltiptext", "This page is not secure. Click to open it in Firefox for details.");
    badge.setAttribute("aria-label", "Not secure. Open in Firefox");
    const command = event => {
      event.stopPropagation();
      if (this.active) this.#toGecko(this.active).catch(error => this.onFailure(error));
    };
    badge.addEventListener("click", command);
    identity.before(badge);
    this.badge = badge;
    this.restoreHooks.push(() => { badge.removeEventListener("click", command); badge.remove(); this.badge = null; });
  }
  #updateBadge(record) {
    if (!this.badge || this.active !== record) return;
    const insecure = record.latestURL?.startsWith("http:");
    this.badge.toggleAttribute("insecure", !!insecure);
  }

  #visibility(record) {
    const visible = this.active === record && !this.window.document.hidden;
    if (typeof record.browser.docShellIsActive === "boolean") record.browser.docShellIsActive = false;
    if (record.visible === visible) return;
    record.visible = visible;
    if (this.browsingMode === "web" && record.adapter?.target) this.#action(record, target => record.adapter.visibility(target, visible));
  }
  #surface(record) {
    const rect = record.browser.getBoundingClientRect();
    const surface = fitCEFRenderSurface({ width: Math.max(1, Math.floor(rect.width)), height: Math.max(1, Math.floor(rect.height)),
      device_scale: this.window.devicePixelRatio });
    record.renderScaleLimited = surface.device_scale < this.window.devicePixelRatio;
    return surface;
  }
  #indicator(record, reason) {
    const active = record && this.window.gBrowser.selectedTab === record.tab && record.committed;
    const scaleNotice = active && record.renderScaleLimited
      ? `CEF render scale capped at ${record.adapter.surface.device_scale}× for this window size` : undefined;
    this.window.document.documentElement?.toggleAttribute("axiosozo-cef-active", !!active);
    if (active) this.#updateBadge(record);
    this.onEngineChange({ engine: active ? "chromium" : "gecko", experimental: !!active,
      version: active ? CHROMIUM_VERSION : null, fixtureOnly: !!active && this.browsingMode === "fixture", reason: reason ?? scaleNotice });
  }
  #element(parent, tag, className, text) {
    const node = this.window.document.createElementNS(XHTML, tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    parent?.appendChild(node);
    return node;
  }

  // ---- Switching -----------------------------------------------------------------
  async switchToChromium(tab = this.window.gBrowser.selectedTab, { url: requestedURL = null } = {}) {
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
      // Every web target starts inert, then navigates like a typed address, so
      // a slow site cannot time out creation and no document is replayed.
      url = transferableURL(requestedURL) || transferableGeckoURL(browser);
      origin = BLANK_IDENTITY;
    } else if (!allowedFixtureURL(url, origin)) throw new Error("CEF_LOCAL_FIXTURE_ONLY");
    // Tabbrowser.sys.mjs at the pinned revision owns browser -> browserStack -> browserContainer.
    const stack = browser.parentNode;
    if (!stack.classList.contains("browserStack")) throw new Error("UNSUPPORTED_ZEN_CONTENT_CONTAINER");
    const overlay = this.window.document.createElementNS(XHTML, "div");
    overlay.setAttribute("data-axiosozo-cef", this.browsingMode === "web" ? "web" : "experimental-fixture-only");
    overlay.style.cssText = "position:absolute;inset:0;display:none;z-index:1;background:#fff;overflow:hidden";
    const canvas = this.window.document.createElementNS(XHTML, "canvas");
    canvas.tabIndex = 0; canvas.setAttribute("role", "application");
    canvas.setAttribute("aria-label", "Chromium page. Native accessibility and IME are not available yet.");
    canvas.style.cssText = "display:block;width:100%;height:100%;outline:none";
    overlay.appendChild(canvas);
    const record = { tab, browser, stack, overlay, canvas, originalTarget, committed:false, adapter:null,
      priorVisibility:browser.style.visibility, priorPosition:stack.style.position, originalLabel:tab.label,
      priorDocShellIsActive:browser.docShellIsActive, pendingURL:this.browsingMode === "web" ? url : null,
      latestURL:this.browsingMode === "web" ? (url || "about:blank") : url, listeners:[], displayedFrames:0, drawMilliseconds:0,
      firstFrameAt:null, startedAt:this.window.performance.now(), clicks:{ time:0, x:0, y:0, count:1 } };
    let settle;
    record.settled = new Promise(resolve => { settle = resolve; });
    this.pending = record;
    this.onSwitchStart(originalTarget.tab_id);
    if (this.window.getComputedStyle(stack).position === "static") stack.style.position = "relative";
    stack.appendChild(overlay);
    try {
      record.adapter = await this.launch(this.window, { tabId:originalTarget.tab_id, origin, browsingMode:this.browsingMode,
        onFrame:(metadata, pixels) => this.#draw(record, metadata, pixels),
        onEvent:event => this.#event(record, event),
        onFailure:error => this.#failed(record, error) });
      if (this.disposed || this.pending !== record) throw new Error("ENGINE_SWITCH_CANCELLED");
      const target = await record.adapter.create(this.browsingMode === "web" ? "about:blank" : url, this.#surface(record));
      this.gecko.resolve(originalTarget); // no navigation/identity change during asynchronous preparation
      this.#assertNoActiveMedia(tab);
      if (this.disposed || this.pending !== record || this.window.gBrowser.selectedTab !== tab) throw new Error("ENGINE_SWITCH_CANCELLED");
      this.pending = null; this.records.set(tab, record); record.committed = true;
      browser.style.visibility = "hidden"; overlay.style.display = "block";
      this.#input(record);
      record.observer = new this.window.ResizeObserver(() => this.#resize(record));
      record.observer.observe(stack);
      this.#visibility(record);
      if (this.browsingMode === "web") {
        this.#markEngine(tab, "chromium", url);
        // The Firefox document is released; the tab now lives in Chromium.
        this.#loadInGecko(record, "about:blank");
        if (url) this.#action(record, current => record.adapter.navigate(current, url));
      }
      canvas.focus(); this.#indicator(record); this.#syncChrome(record);
      return target;
    } catch (error) {
      await this.#remove(record, { keepEngine: this.browsingMode === "web" && error.message === "ENGINE_SWITCH_CANCELLED" });
      // A tab closed or switched back while its engine was still launching: that
      // adapter arrived after removal and must still release its native target.
      if (!record.adapterReleased) await record.adapter?.close().catch(() => {});
      if (error.message !== "ENGINE_SWITCH_CANCELLED") {
        this.#markEngine(tab, "gecko");
        // A restored Chromium tab that cannot start opens its address in Firefox.
        if (this.browsingMode === "web" && url && browser.currentURI?.spec === "about:blank") this.#loadInGecko(record, url);
      }
      this.onFailure(error);
      throw error;
    } finally { settle(); }
  }
  #loadInGecko(record, url) {
    const browser = record.browser;
    if (typeof browser.loadURI !== "function") return;
    try {
      browser.loadURI(this.window.Services.io.newURI(url),
        { triggeringPrincipal: this.window.Services.scriptSecurityManager.getSystemPrincipal() });
    } catch (error) { this.onFailure(error); }
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
    if (event.event === "url") {
      record.latestURL = event.url;
      if (record.committed && this.browsingMode === "web") this.#rememberURL(record.tab, event.url);
    }
    if (event.event === "title") record.title = event.title;
    if (event.event === "loading") {
      record.loading = event;
      record.tab.toggleAttribute?.("busy", !!event.loading);
    }
    if (event.event === "cursor") record.canvas.style.cursor = event.cursor;
    // The page closed itself (window.close()); the tab explains and can reload.
    if (event.event === "closed" && record.committed && !record.removing && this.browsingMode === "web") this.#panel(record, "engine_failed");
    if (event.event === "open_url") this.#openInNewTab(record, event.url, event.background);
    if (event.event === "load") {
      const failed = this.browsingMode === "web" ? event.http_status < 0 : false;
      if (!failed) this.#panel(record, null);
    }
    if (event.event === "error" && !event.request_id) {
      if (["render_process_terminated", "load_failed", "certificate_error"].includes(event.code)) {
        if (this.browsingMode !== "web") { this.#revert(record, new Error("CEF_PAGE_LOAD_FAILED")); return; }
        this.#panel(record, event.code);
      } else if (NOTICES[event.code]) this.#notice(record, NOTICES[event.code]);
      if (["permission_denied", "download_denied", "popup_denied", "navigation_denied", "certificate_error"].includes(event.code)) {
        this.#indicator(this.active, "Unsupported Chromium operation blocked");
      }
    }
    this.onTargetEvent(event);
    if (record.committed && event.event === "navigation") { record.visible = undefined; this.#visibility(record); }
    if (record.committed) this.#syncChrome(record);
  }
  #openInNewTab(record, url, background) {
    const gBrowser = this.window.gBrowser;
    if (typeof gBrowser.addTrustedTab !== "function" || !transferableURL(url)) return;
    const tab = gBrowser.addTrustedTab("about:blank", { inBackground: background, relatedToCurrent: true,
      ownerTab: background ? null : record.tab, userContextId: record.tab.userContextId ?? 0 });
    this.#markEngine(tab, "chromium", url);
    if (gBrowser.selectedTab === tab) this.#activateIfMarked(tab);
  }
  /** Page-level failures stay inside the Chromium tab, like any browser's error page. */
  #panel(record, code) {
    // Chromium reports a refused certificate, then the cancelled load; keep the specific reason.
    if (code === "load_failed" && record.panelCode === "certificate_error") return;
    if (!record.panel) {
      if (!code) return;
      const panel = this.#element(record.overlay, "div", "axiosozo-cef-panel");
      panel.setAttribute("role", "alert");
      const title = this.#element(panel, "h1"), text = this.#element(panel, "p"), actions = this.#element(panel, "div");
      const retry = this.#element(actions, "button", "primary", "Try again");
      const firefox = this.#element(actions, "button", "", "Open in Firefox");
      retry.addEventListener("click", () => this.#retry(record));
      firefox.addEventListener("click", () => this.#toGecko(record).catch(error => this.onFailure(error)));
      record.panel = { panel, title, text, retry };
    }
    record.panel.panel.hidden = !code;
    record.canvas.style.visibility = code ? "hidden" : "";
    if (!code) { record.panelCode = null; return; }
    const [title, text] = PAGE_ERRORS[code] ?? PAGE_ERRORS.load_failed;
    record.panel.title.textContent = title; record.panel.text.textContent = text;
    record.panel.retry.textContent = code === "certificate_error" ? "Go back" : (code === "engine_failed" ? "Reload" : "Try again");
    record.panelCode = code;
  }
  #notice(record, message) {
    record.notice ??= this.#element(record.overlay, "div", "axiosozo-cef-notice");
    record.notice.setAttribute?.("role", "status");
    record.notice.textContent = message; record.notice.hidden = false;
    this.window.clearTimeout?.(record.noticeTimer);
    record.noticeTimer = this.window.setTimeout?.(() => { if (record.notice) record.notice.hidden = true; }, 4000);
  }
  #retry(record) {
    if (record.panelCode === "engine_failed") { this.#restart(record).catch(error => this.onFailure(error)); return; }
    const adapter = record.adapter;
    if (record.panelCode === "certificate_error" && record.loading?.can_go_back) this.#action(record, target => adapter.back(target));
    else if (record.panelCode === "render_process_terminated" || !transferableURL(record.latestURL)) this.#action(record, target => adapter.reload(target));
    else this.#action(record, target => adapter.navigate(target, record.latestURL));
  }
  async #restart(record) {
    const { tab, latestURL } = record;
    await this.#remove(record, { keepEngine: true });
    if (this.window.gBrowser.selectedTab === tab) await this.switchToChromium(tab, { url: latestURL });
  }
  #syncChrome(record) {
    if (this.active !== record) return;
    if (record.title) this.#setLabel(record);
    this.window.gBrowser.updateTitlebar();
    this.window.UpdateBackForwardCommands(record.browser);
    // The explicit nsIURI updates address text; Gecko security UI is masked.
    const shown = record.latestURL === "about:blank" ? null : record.latestURL;
    if (!this.window.gURLBar.focused) {
      try { this.window.gURLBar.setURI(shown ? { uri:this.window.Services.io.newURI(shown) } : {}); } catch {}
    }
    this.#updateBadge(record);
  }
  #setLabel(record) {
    const gBrowser = this.window.gBrowser;
    if (typeof gBrowser._setTabLabel === "function") gBrowser._setTabLabel(record.tab, record.title);
    else record.tab.label = record.title;
  }
  #action(record, operation) {
    const target = record.adapter.target;
    Promise.resolve().then(() => operation(target)).then(result => {
      if (result?.status === "unsupported") {
        if (!["NAVIGATION_SUPERSEDED", "NAVIGATION_CANCELLED", "history_boundary"].includes(result.reason)) {
          this.#indicator(record, result.reason || "Operation unsupported in fixture engine");
        }
      } else if (result && result.status === "failed" && this.browsingMode === "web") {
        // A failed navigation already reported its own page error.
      } else if (result && result.status !== "success") throw new Error("CEF_ACTION_FAILED");
    }).catch(error => {
      if (!record.committed) return;
      if (error.message === "STALE_CEF_TARGET") this.#indicator(record, "Input discarded after navigation");
      else if (error.message === "CEF_UNAVAILABLE") return;
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
  #clickCount(record, event, position) {
    // Pointer events carry no reliable click count; derive it like the OS does.
    const clicks = record.clicks, now = event.timeStamp ?? this.window.performance.now();
    const near = Math.abs(position.x - clicks.x) <= 4 && Math.abs(position.y - clicks.y) <= 4;
    clicks.count = near && now - clicks.time <= 500 ? Math.min(3, clicks.count + 1) : 1;
    Object.assign(clicks, { time:now, x:position.x, y:position.y });
    return clicks.count;
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
      const position = point(event);
      const count = type === "pointerdown" ? this.#clickCount(record, event, position) : record.clicks.count;
      const fields = { ...position, type:type === "pointermove" ? "move" : (type === "pointerdown" ? "down" : "up"),
        button:["left", "middle", "right"][Math.max(0, event.button)] || "left", click_count:count, mouse_leave:false };
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
    this.#listen(record, "pointerleave", event => {
      if (!event.isTrusted || !record.committed || record.resizePending) return;
      record.nextPointer = null;
      send("mouse", { ...point(event), type:"move", button:"left", click_count:1, mouse_leave:true });
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
      if (route === "chrome") return; // Zen's shortcuts work over Chromium exactly as over Firefox
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
      if (type === "down" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.key.length <= 2) send("key", { ...fields, type:"char" });
        else if (event.key === "Enter") send("key", { ...fields, type:"char", text:"\r" }); // newline in text areas
      }
    });
    this.#listen(record, "focus", () => this.#action(record, target => record.adapter.focus(target, true)));
    this.#listen(record, "blur", () => this.#action(record, target => record.adapter.focus(target, false)));
    this.#listen(record, "contextmenu", event => { event.preventDefault(); this.#indicator(record, "Chromium context menu is not integrated"); });
    this.#listen(record, "compositionstart", event => { event.preventDefault(); this.#indicator(record, "IME is unsupported in the experimental Chromium surface"); });
  }
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
        presenter.#indicator(record, "Opening history in a new tab is not supported for Chromium tabs yet"); return;
      }
      if (method === "reload" && record.panelCode) { presenter.#retry(record); return; }
      presenter.#action(record, target => record.adapter[method](target));
    });
    wrap(this.window.BrowserCommands, "stop", function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      presenter.#action(record, target => record.adapter.stop(target));
    }, { optional: true });
    wrap(this.window, "UpdateBackForwardCommands", function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      return original.call(this, { canGoBack:!!record.loading?.can_go_back,
        canGoForward:!!record.loading?.can_go_forward });
    });
    wrap(this.window.BrowserCommands, "reloadSkipCache", function(presenter, original, args) {
      const record = presenter.active;
      if (!record) return original.apply(this, args);
      presenter.#action(record, target => record.adapter.reload(target));
    });
    // The back-button history menu lists Firefox history; Chromium keeps its own.
    wrap(this.window, "FillHistoryMenu", function(presenter, original, args) {
      return presenter.active ? false : original.apply(this, args);
    }, { optional: true });
    wrap(this.window.BrowserCommands, "gotoHistoryIndex", function(presenter, original, args) {
      return presenter.active ? false : original.apply(this, args);
    }, { optional: true });
    wrap(this.window.gBrowser, "setTabTitle", function(presenter, original, args) {
      const record = presenter.records.get(args[0]);
      if (!record?.title) return original.apply(this, args);
      presenter.#setLabel(record);
      return true;
    }, { optional: true });
    // Typed addresses, searches, address-bar results, bookmarks and history all
    // reach openTrustedLinkIn. "current" in a Chromium tab loads in Chromium.
    wrap(this.window, "openTrustedLinkIn", function(presenter, original, args) {
      const [url, where, params = {}] = args;
      const record = where === "current"
        && presenter.#recordForBrowser(params?.targetBrowser ?? presenter.window.gBrowser.selectedBrowser);
      if (!record) return original.apply(this, args);
      if (!params?.postData && transferableURL(url) && record.adapter.allowedURL(url)) {
        presenter.window.gURLBar.view?.close?.({ elementPicked:true });
        record.latestURL = url; presenter.#panel(record, null);
        presenter.#action(record, target => record.adapter.navigate(target, url));
        record.canvas.focus();
        return undefined;
      }
      // Firefox-only destinations (about:, file:, POST searches) open in Firefox.
      return presenter.#toGecko(record, { load: false }).then(() => original.apply(this, args));
    }, { optional: this.browsingMode !== "web" });
  }
  async #failed(record, error) {
    if (this.browsingMode === "web" && record.committed) {
      // The tab stays a Chromium tab and explains itself; Reload starts a new target.
      record.adapterFailed = true;
      this.#panel(record, "engine_failed");
      this.onFailure(error);
      return;
    }
    await this.#revert(record, error);
  }
  async #revert(record, error) {
    await this.#remove(record);
    if (this.browsingMode === "web") this.#loadInGecko(record, transferableURL(record.latestURL) ?? "about:blank");
    this.#indicator(this.active, "Chromium stopped; Firefox tab preserved");
    this.onFailure(error);
  }
  async #remove(record, { keepEngine = false } = {}) {
    if (record.removing) return record.removing;
    record.removing = this.#removeOnce(record, keepEngine);
    return record.removing;
  }
  async #removeOnce(record, keepEngine) {
    if (this.pending === record) this.pending = null;
    if (this.records.get(record.tab) === record) this.records.delete(record.tab);
    record.committed = false;
    record.observer?.disconnect();
    for (const remove of record.listeners) remove();
    record.listeners = [];
    this.window.clearTimeout?.(record.noticeTimer);
    record.browser.style.visibility = record.priorVisibility;
    if (typeof record.priorDocShellIsActive === "boolean") {
      record.browser.docShellIsActive = this.window.gBrowser.shouldActivateDocShell?.(record.browser)
        ?? (this.window.gBrowser.selectedTab === record.tab && record.priorDocShellIsActive);
    }
    record.stack.style.position = record.priorPosition;
    record.overlay.remove();
    record.canvas.width = 1; record.canvas.height = 1;
    record.tab.toggleAttribute?.("busy", false);
    if (!keepEngine) this.#markEngine(record.tab, "gecko");
    if (record.tab.isConnected) this.window.gBrowser.setTabTitle(record.tab);
    if (this.window.gBrowser.selectedTab === record.tab) {
      this.window.gURLBar.setURI(); this.window.gBrowser.updateTitlebar();
      this.window.UpdateBackForwardCommands(record.browser);
    }
    record.adapterReleased = !!record.adapter;
    await record.adapter?.close().catch(() => {});
  }
  /** Return a tab to Firefox, carrying Chromium's current address across. */
  async #toGecko(record, { load = true } = {}) {
    const url = transferableURL(record.latestURL);
    await this.#remove(record);
    if (load && this.browsingMode === "web" && url) this.#loadInGecko(record, url);
    if (this.window.gBrowser.selectedTab === record.tab) {
      this.window.gURLBar.setURI(); this.window.gBrowser.updateTitlebar();
      this.window.UpdateBackForwardCommands(this.window.gBrowser.selectedBrowser);
      record.browser.focus?.();
    }
    this.#indicator(this.active);
  }
  async switchToGecko() {
    const record = this.active || (this.pending?.tab === this.window.gBrowser.selectedTab ? this.pending : null);
    if (!record) return;
    await this.#toGecko(record);
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
    this.#removeListeners();
    for (const restore of this.restoreHooks.reverse()) restore();
    // Window close keeps each tab's engine for session restore.
    await Promise.all([...this.records.values(), ...(this.pending ? [this.pending] : [])]
      .map(record => this.#remove(record, { keepEngine: true })));
  }
}
