/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { installEngineTabMenu } from "./EngineTabMenu.sys.mjs";
import { launchCEF, allowedFixtureURL, allowedWebURL, fitCEFRenderSurface, CHROMIUM_VERSION, BLANK_IDENTITY,
  RENDER_PATH_PIPE, WHEEL_PHASES, surfaceTargetId } from "./CEFEngineAdapter.sys.mjs";
import { ChromiumBrowserUI } from "./ChromiumBrowserUI.sys.mjs";
import { sharedChromiumAccessibility } from "./ChromiumAccessibility.sys.mjs";

const MAX_CEF_TABS = 24;
// Window changes after which the display refresh class is re-checked.
const DISPLAY_EVENTS = ["resize", "sizemodechange", "activate"];
const XHTML = "http://www.w3.org/1999/xhtml";
// Persisted with Zen's own session so a Chromium tab restores as a Chromium tab.
const ENGINE_ATTRIBUTE = "axiosozo-engine";
const ENGINE_VALUE = "axiosozo-engine";
const URL_VALUE = "axiosozo-chromium-url";
const TITLE_VALUE = "axiosozo-chromium-title";
// Firefox's own error-page favicons (toolkit/content/aboutNetError.mjs).
const ERROR_ICONS = { certificate_error: "chrome://global/skin/icons/warning.svg", load_failed: "chrome://global/skin/icons/info.svg" };
// Tab state Gecko's hidden about:blank browser would otherwise overwrite.
const TAB_STATE = ["image", "busy", "progress"];

/** Firefox's tab label for a page without a title: its address without the scheme. */
export function addressLabel(url) {
  if (!transferableURL(url)) return "";
  let text = url;
  try { text = decodeURI(url); } catch {}
  return text.replace(/^https?:\/\//u, "");
}

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
/**
 * The fixed shortcut heuristic. With a host that reports key verdicts, surface
 * mode instead offers every non-reserved key to the page first and returns the
 * unconsumed ones to Zen (the remote-tab reply model); `native` marks a key
 * whose macOS keyCode the engine-view component supplied.
 */
export function keyboardRoute(event, { editing = false, native = false } = {}) {
  if (event.isComposing || event.key === "Dead" || event.key === "Process") return "unsupported";
  const key = event.key.toLowerCase();
  if (event.metaKey && ["c", "v", "x", "a", "z"].includes(key)) return editing ? "edit" : "unsupported";
  // Every other ⌘ shortcut (new tab, close, find, tab numbers, zoom, Zen's own
  // commands) belongs to the browser, exactly as over a Firefox page.
  if ((event.metaKey && !PAGE_CHORDS.has(key)) || (event.ctrlKey && ["tab", "pageup", "pagedown"].includes(key))
      || /^F\d{1,2}$/u.test(event.key)) return "chrome";
  return Object.hasOwn(MAC_KEYS, event.code) || native ? "cef" : "unsupported";
}
export function cefKey(event, type) {
  if (keyboardRoute(event) !== "cef") throw new Error("UNSUPPORTED_KEY");
  return { type, native_key_code: MAC_KEYS[event.code], windows_key_code: Math.min(255, event.keyCode || 0),
    modifiers: cefModifiers(event), text: event.key.length <= 2 ? event.key : "" };
}
/** Pipe fallback only: surface mode never touches pixels in JS. */
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

// Component phase names (NSEventPhase) as cef-v1 wheel/pinch phase values.
export function wheelPhase(name) {
  if (name === "mayBegin") return "may_begin";
  return WHEEL_PHASES.has(name) ? name : "none";
}
const EDIT_ACTIONS = { c:"copy", x:"cut", v:"paste", a:"select_all" };
const editAction = event => event.key.toLowerCase() === "z" ? (event.shiftKey ? "redo" : "undo") : EDIT_ACTIONS[event.key.toLowerCase()];
// Transparent proxy editor: focusable (so Gecko enables the IME) but never visible.
const PROXY_STYLE = "position:absolute;left:0;top:0;width:2px;height:1em;margin:0;padding:0;border:0;"
  + "opacity:0;pointer-events:none;resize:none;overflow:hidden;background:transparent;color:transparent;"
  + "caret-color:transparent;outline:none;white-space:pre";

const PAGE_ERRORS = {
  certificate_error: ["Your connection isn't private",
    "Chromium could not verify this site's certificate and did not load it. Firefox can show you the details."],
  load_failed: ["This page couldn't be loaded", "Check the address and your connection, then try again."],
  render_process_terminated: ["This page stopped working", "Reload to try again. Anything you entered may be lost."],
  engine_failed: ["Chromium stopped", "The Chromium engine for this tab stopped. Reload to start it again."],
};
// Tab titles of Firefox's own error pages (Fluent ids from toolkit/neterror and
// browser/aboutTabCrashed), so a Chromium tab labels itself like a Firefox tab
// in the same situation instead of showing Chromium's internal error title.
const NET_ERROR = "toolkit/neterror/netError.ftl";
const ERROR_TITLES = {
  certificate_error: [NET_ERROR, "certerror-page-title", "Warning: Potential Security Risk Ahead"],
  load_failed: [NET_ERROR, "neterror-page-title", "Problem loading page"],
  render_process_terminated: ["browser/aboutTabCrashed.ftl", "crashed-title", "Tab crash reporter"],
  engine_failed: ["browser/aboutTabCrashed.ftl", "crashed-title", "Tab crash reporter"],
};
// Attributes with which the address bar shows it is not describing the current page.
const URLBAR_EDIT_ATTRIBUTES = ["breakout-extend", "zen-floating-urlbar", "usertyping", "searchmode", "persistsearchterms"];
const NOTICES = {
  permission_denied: "This site asked for a permission Chromium tabs can't grant yet.",
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
    this.restoreURLs = new WeakMap(); this.restoreTitles = new WeakMap();
    this.onTabClose = event => {
      const record = this.records.get(event.target) || (event.target === this.pending?.tab ? this.pending : null);
      if (record) this.#remove(record, { keepEngine: true }).then(() => this.#indicator(this.active)).catch(onFailure);
    };
    this.onTabAttrModified = event => {
      const record = this.records.get(event.target);
      if (!record) return;
      try { this.#assertNoActiveMedia(record.tab); }
      catch (error) { this.#revert(record, error); return; }
      // The hidden Firefox browser's own load (about:blank) clears the icon and
      // throbber; the tab keeps showing its Chromium page's state.
      const changed = event.detail?.changed ?? TAB_STATE;
      if (changed.includes("image")) this.#applyIcon(record);
      if (changed.includes("busy") || changed.includes("progress")) this.#syncBusy(record);
    };
    this.onTabSelect = () => {
      for (const record of this.records.values()) this.#visibility(record);
      this.#indicator(this.active);
      if (this.active) {
        this.#syncChrome(this.active); this.#resize(this.active);
        if (!this.window.gURLBar.focused) this.#focusContent(this.active);
      } else this.#activateIfMarked(this.window.gBrowser.selectedTab);
    };
    this.onTabRestored = event => this.#adoptRestoredTab(event.target);
    // Lazily restored tabs are set up (SSTabRestoring) long before they load (SSTabRestored).
    this.onTabRestoring = event => this.#labelRestoredTab(event.target);
    win.gBrowser.tabContainer.addEventListener("TabClose", this.onTabClose);
    win.gBrowser.tabContainer.addEventListener("TabSelect", this.onTabSelect);
    win.gBrowser.tabContainer.addEventListener("TabAttrModified", this.onTabAttrModified);
    win.gBrowser.tabContainer.addEventListener("SSTabRestored", this.onTabRestored);
    win.gBrowser.tabContainer.addEventListener("SSTabRestoring", this.onTabRestoring);
    this.onVisibilityChange = () => {
      // Gecko's own handler runs first, then reapply ownership after it may
      // reactivate the retained document when the window becomes visible.
      this.window.queueMicrotask(() => {
        if (!this.disposed) for (const record of this.records.values()) this.#visibility(record);
      });
    };
    win.document.addEventListener?.("visibilitychange", this.onVisibilityChange);
    // A window moved to, resized on or fullscreened onto another display may
    // change its refresh class (ProMotion 120 Hz <-> 60 Hz). Gecko has no window
    // move event; these, the scale watch and tab selection re-check the rate.
    this.onDisplayChange = () => { if (!this.disposed) this.#syncFrameRate(this.active); };
    for (const type of DISPLAY_EVENTS) win.addEventListener?.(type, this.onDisplayChange);
    try {
      this.#installCommands(); this.#installStyle(); this.#watchScale();
      if (this.browsingMode === "web") { this.#installTabMenu(); this.#installBadge(); this.#installBrowserUI(); }
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
    container.removeEventListener("SSTabRestoring", this.onTabRestoring);
    this.window.document.removeEventListener?.("visibilitychange", this.onVisibilityChange);
    for (const type of DISPLAY_EVENTS) this.window.removeEventListener?.(type, this.onDisplayChange);
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
    if (this.active === record) this.#focusContent(record);
    return true;
  }
  focus() {
    if (!this.active) return false;
    this.#focusContent(this.active); return true;
  }
  /** Page focus: the IME proxy editor while the page's editable is focused, else the engine view. */
  #focusContent(record) {
    (record.ime?.active ?? record.canvas)?.focus?.();
  }
  /**
   * Zen and Firefox return focus to the page with gBrowser.selectedBrowser.focus()
   * (urlbar Escape and close, tab switch). The hidden Gecko browser of a Chromium
   * tab cannot take focus, so this browser's focus() moves it to the engine view.
   */
  #redirectBrowserFocus(record) {
    const browser = record.browser, presenter = this;
    record.priorBrowserFocus = Object.getOwnPropertyDescriptor(browser, "focus") ?? null;
    record.browserFocus = function focus() { presenter.#focusContent(record); };
    try { browser.focus = record.browserFocus; } catch { record.browserFocus = null; }
  }
  #restoreBrowserFocus(record) {
    const browser = record.browser;
    if (!record.browserFocus || browser.focus !== record.browserFocus) return;
    if (record.priorBrowserFocus) Object.defineProperty(browser, "focus", record.priorBrowserFocus);
    else delete browser.focus;
    record.browserFocus = null;
  }
  /** A move to a display with another scale (Retina <-> 1×) resizes the native surface. */
  #watchScale() {
    const query = this.window.matchMedia?.(`(resolution: ${this.window.devicePixelRatio}dppx)`);
    if (!query?.addEventListener) return;
    const changed = () => {
      query.removeEventListener("change", changed); this.scaleWatch = null;
      if (this.disposed) return;
      if (this.active) { this.#resize(this.active); this.#syncFrameRate(this.active); }
      this.#watchScale();
    };
    query.addEventListener("change", changed);
    this.scaleWatch = () => query.removeEventListener("change", changed);
    if (!this.scaleWatchHook) {
      this.scaleWatchHook = true;
      this.restoreHooks.push(() => { this.scaleWatch?.(); this.scaleWatch = null; });
    }
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
      this.restoreURLs.delete(tab); this.restoreTitles.delete(tab);
      for (const key of [ENGINE_VALUE, URL_VALUE, TITLE_VALUE]) { try { store?.deleteCustomTabValue(tab, key); } catch {} }
    }
  }
  #rememberURL(tab, url) {
    const value = transferableURL(url);
    if (!value) return;
    this.restoreURLs.set(tab, value);
    try { this.#session()?.setCustomTabValue(tab, URL_VALUE, value); } catch {}
  }
  /** The page title, so a restored Chromium tab is labelled before its engine starts. */
  #rememberTitle(tab, title) {
    if (typeof title !== "string" || !title || this.restoreTitles.get(tab) === title) return;
    this.restoreTitles.set(tab, title);
    try { this.#session()?.setCustomTabValue(tab, TITLE_VALUE, title); } catch {}
  }
  #labelRestoredTab(tab) {
    if (this.browsingMode !== "web" || !tab || this.records.has(tab)) return;
    let engine = null, title = null;
    try { engine = this.#session()?.getCustomTabValue(tab, ENGINE_VALUE); title = this.#session()?.getCustomTabValue(tab, TITLE_VALUE); } catch {}
    if (engine !== "chromium" || typeof title !== "string" || !title) return;
    this.restoreTitles.set(tab, title);
    this.#setTabLabel(tab, title);
  }
  #adoptRestoredTab(tab) {
    if (this.browsingMode !== "web" || !tab || this.records.has(tab)) return;
    let engine = null, url = null;
    try { engine = this.#session()?.getCustomTabValue(tab, ENGINE_VALUE); url = this.#session()?.getCustomTabValue(tab, URL_VALUE); } catch {}
    if (engine !== "chromium") return;
    tab.setAttribute?.(ENGINE_ATTRIBUTE, "chromium");
    if (transferableURL(url)) this.restoreURLs.set(tab, url);
    this.#labelRestoredTab(tab);
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
    if (engine !== "chromium" && engine !== "gecko") throw new Error("ENGINE_UNAVAILABLE"); // only these two have presenters
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
      /* Chromium permission doorhangers (ChromiumBrowserUI) anchor in #notification-popup-box. */
      [axiosozo-cef-active] #identity-box:not(:has(> #notification-popup-box:not([hidden]))),
      [axiosozo-cef-active] #identity-box > :not(#notification-popup-box),
      [axiosozo-cef-active] :is(#tracking-protection-icon-container, #trust-icon-container,
        #reader-mode-button, #translations-button, #pageActionButton, #star-button-box) { display:none !important; }
      #axiosozo-engine-badge { display:none; align-items:center; gap:5px; margin-inline:4px 2px; padding:1px 8px;
        border:0; border-radius:999px; background:color-mix(in srgb, #1a73e8 16%, transparent); color:inherit;
        font:inherit; font-size:11px; font-weight:600; white-space:nowrap; cursor:default; }
      [axiosozo-cef-active] #axiosozo-engine-badge[insecure] { display:inline-flex; }
      #axiosozo-engine-badge:hover { background:color-mix(in srgb, #1a73e8 26%, transparent); }
      #axiosozo-engine-badge:focus-visible { outline:2px solid var(--focus-outline-color, AccentColor); outline-offset:1px; }
      #urlbar:is([breakout-extend], [zen-floating-urlbar], [usertyping], [searchmode], [focused]) #axiosozo-engine-badge,
      :root[zen-has-empty-tab="true"] #axiosozo-engine-badge { display:none !important; }
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
  // >>> AxioSozo engine UI delegation: Chromium's context menus, dialogs, permissions,
  // file pickers, downloads, auth, certificate errors, pop-ups, find and zoom are
  // drawn by ChromiumBrowserUI with Firefox's own UI. Presenter surface: this
  // constructor, one call in #event, one in #removeOnce.
  #installBrowserUI() {
    this.ui = new ChromiumBrowserUI(this.window, {
      send: (record, method, fields, target) => record.adapter.reply(target, method, fields),
      target: record => record.adapter?.target ?? null,
      records: () => this.records.values(),
      hooks: {
        openTab: (record, url, background) => this.#openInNewTab(record, url, background),
        openInFirefox: record => this.#toGecko(record).catch(error => this.onFailure(error)),
        openInFirefoxTab: (url, postData) => this.window.openTrustedLinkIn(url, "tab", { postData, relatedToCurrent: true }),
        navigate: (record, action) => this.#action(record, target => record.adapter[action](target)),
        focusContent: record => this.#focusContent(record),
        contentElement: record => record.overlay,
        currentURL: record => record.latestURL,
        notice: (record, message) => this.#notice(record, message),
        failure: error => this.onFailure(error),
      },
    });
    this.restoreHooks.push(() => { this.ui?.dispose(); this.ui = null; });
  }
  // <<<
  #installTabMenu() {
    // List-driven by EngineRegistry: one "Open in <engine>" item, or an "Open in" submenu with more engines.
    const menu = installEngineTabMenu(this.window, { engineOf: tab => this.engineOf(tab),
      setTabEngine: (tab, engine) => this.setTabEngine(tab, engine), onFailure: error => this.onFailure(error) });
    if (menu) this.restoreHooks.push(() => menu.dispose());
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
    // The address bar changes state without a page event (new-tab bar, typing, search mode).
    let observer = null;
    try {
      const Observer = this.window.MutationObserver;
      if (Observer && this.window.gURLBar?.nodeType) {
        observer = new Observer(() => this.#updateBadge());
        observer.observe(this.window.gURLBar, { attributes: true, attributeFilter: [...URLBAR_EDIT_ATTRIBUTES, "pageproxystate", "focused"] });
        if (this.window.document.documentElement) observer.observe(this.window.document.documentElement, { attributes: true, attributeFilter: ["zen-has-empty-tab"] });
      }
    } catch { observer = null; }
    this.restoreHooks.push(() => { observer?.disconnect(); badge.removeEventListener("click", command); badge.remove(); this.badge = null; });
  }
  /**
   * True while the address bar describes the active Chromium tab's own page.
   * In Zen's new-tab/floating bar, while editing, typing or in search mode, the
   * bar describes something else and the badge must stay hidden.
   */
  #urlbarShowsPage() {
    const bar = this.window.gURLBar;
    if (!bar) return true;
    if (bar.focused || bar.searchMode || bar.getAttribute?.("pageproxystate") === "invalid") return false;
    for (const name of URLBAR_EDIT_ATTRIBUTES) if (bar.hasAttribute?.(name)) return false;
    return this.window.document.documentElement?.getAttribute?.("zen-has-empty-tab") !== "true";
  }
  #updateBadge(record = this.active) {
    if (!this.badge || !record || this.active !== record) return;
    const insecure = record.latestURL?.startsWith("http:") && this.#urlbarShowsPage();
    this.badge.toggleAttribute("insecure", !!insecure);
  }

  #visibility(record) {
    const visible = this.active === record && !this.window.document.hidden;
    if (typeof record.browser.docShellIsActive === "boolean") record.browser.docShellIsActive = false;
    if (record.visible !== visible) {
      record.visible = visible;
      record.a11y?.setVisible(record.a11yTarget, visible);
      // Surface mode also gates the endpoint's begin frames, fixture sessions included.
      if ((this.browsingMode === "web" || record.surfaceMode) && record.adapter?.target) {
        this.#action(record, target => record.adapter.visibility(target, visible));
      }
    }
    this.#syncFrameRate(record);
  }
  /**
   * cef-v1 `frame_rate`: a visible target follows its window's display refresh
   * class, read from the same vsync source as the hello rate. Sent only on a
   * change; hidden targets catch up when shown. The endpoint's begin frames
   * already follow Gecko's vsync interval (no endpoint setter exists).
   */
  #syncFrameRate(record) {
    const adapter = record?.adapter;
    if (!record?.committed || !record.visible || record.frameRatePending || !adapter?.target
        || typeof adapter.frameRate !== "function") return;
    const rate = adapter.displayFrameRate ?? null;
    if (rate === null || rate === adapter.appliedFrameRate) return;
    record.frameRatePending = true;
    let result = null;
    Promise.resolve().then(() => adapter.frameRate(adapter.target, rate)).then(value => { result = value; }, error => {
      // A navigation raced the command: the next display check retries. Anything
      // else is reported once and never blocks the page.
      if (error?.message !== "STALE_CEF_TARGET" && error?.message !== "CEF_UNAVAILABLE") console.warn("AXIOSOZO_CEF_FRAME_RATE", error?.message);
    }).finally(() => {
      record.frameRatePending = false;
      // The display may have changed again while this one was in flight.
      if (result?.status === "success" && !this.disposed && this.active === record) this.#syncFrameRate(record);
    });
  }
  #surface(record) {
    const rect = record.browser.getBoundingClientRect();
    // Surface mode: bounded only by 4096 px per dimension, unless the host still
    // enforces the pipe's 32 MiB (it answered surface_limit once).
    const surface = fitCEFRenderSurface({ width: Math.max(1, Math.floor(rect.width)), height: Math.max(1, Math.floor(rect.height)),
      device_scale: this.window.devicePixelRatio }, { maxBytes: record.surfaceMode && !record.hostByteCap ? Infinity : undefined });
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
      firstFrameAt:null, startedAt:this.window.performance.now(), clicks:{ time:0, x:0, y:0, count:1 },
      surfaceMode:false, native:null, hostByteCap:false, keyVerdicts:new Map(), keyDowns:new Map(),
      wheelRemainder:{ x:0, y:0 }, ime:null, title:this.browsingMode === "web" ? this.restoreTitles.get(tab) ?? "" : "",
      // The page keeps the icon it had (in Firefox, or restored by Zen's session) until Chromium reports its own.
      icon:this.browsingMode === "web" ? this.#currentIcon(tab) : null, errorIcon:null };
    let settle;
    record.settled = new Promise(resolve => { settle = resolve; });
    this.pending = record;
    this.onSwitchStart(originalTarget.tab_id);
    if (this.window.getComputedStyle(stack).position === "static") stack.style.position = "relative";
    stack.appendChild(overlay);
    try {
      record.adapter = await this.launch(this.window, { tabId:originalTarget.tab_id, origin, browsingMode:this.browsingMode,
        // Surface mode: the endpoint presents frames in this canvas; onFrame is the pipe fallback.
        element:canvas, onGeometry:geometry => this.#geometry(record, geometry),
        onFrame:(metadata, pixels) => this.#draw(record, metadata, pixels),
        onEvent:event => this.#event(record, event),
        onFailure:error => this.#failed(record, error) });
      if (this.disposed || this.pending !== record) throw new Error("ENGINE_SWITCH_CANCELLED");
      record.surfaceMode = record.adapter.surfaceMode === true;
      record.native = record.surfaceMode ? record.adapter.nativeInput ?? null : null;
      if (record.surfaceMode) {
        // A context-less canvas bound to the endpoint: one surface pixel per device
        // pixel, anchored top-left while a resize is in flight. No JS pixel work.
        canvas.setAttribute("moz-opaque", "");
        canvas.style.objectFit = "none"; canvas.style.objectPosition = "0 0";
      }
      const startURL = this.browsingMode === "web" ? "about:blank" : url;
      let target;
      try { target = await record.adapter.create(startURL, this.#surface(record)); }
      catch (error) {
        if (error.message !== "CEF_SURFACE_LIMIT" || !record.surfaceMode || record.hostByteCap) throw error;
        record.hostByteCap = true;
        target = await record.adapter.create(startURL, this.#surface(record));
      }
      this.gecko.resolve(originalTarget); // no navigation/identity change during asynchronous preparation
      this.#assertNoActiveMedia(tab);
      if (this.disposed || this.pending !== record || this.window.gBrowser.selectedTab !== tab) throw new Error("ENGINE_SWITCH_CANCELLED");
      this.pending = null; this.records.set(tab, record); record.committed = true;
      browser.style.visibility = "hidden"; overlay.style.display = "block";
      this.#input(record);
      this.#redirectBrowserFocus(record);
      record.observer = new this.window.ResizeObserver(() => this.#resize(record));
      record.observer.observe(stack);
      this.#attachAccessibility(record, target);
      this.#visibility(record);
      if (this.browsingMode === "web") {
        this.#markEngine(tab, "chromium", url);
        // The Firefox document is released; the tab now lives in Chromium.
        this.#loadInGecko(record, "about:blank");
        if (url) this.#action(record, current => record.adapter.navigate(current, url));
      }
      this.#applyIcon(record); this.#syncBusy(record);
      this.#focusContent(record); this.#indicator(record); this.#syncChrome(record);
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
  /**
   * Accessibility (docs/design/engine-accessibility.md): surface mode only, where the
   * engine-view a11y component exposes Chromium's tree under this canvas. Without the
   * component (pipe fallback) the canvas keeps its "not available" label.
   */
  #attachAccessibility(record, target) {
    if (!record.surfaceMode) return;
    let a11y = null, targetId;
    try { a11y = sharedChromiumAccessibility(); targetId = surfaceTargetId(target); } catch { return; }
    const adapter = record.adapter;
    const attached = a11y.attach({ targetId, canvas: record.canvas, focusContent: () => this.#focusContent(record),
      adapter: { accessibility: enabled => adapter.accessibility(enabled),
        axAction: (id, action, value) => adapter.axAction(id, action, value),
        axAck: (eventTarget, seq) => adapter.axAck(eventTarget, seq) } });
    if (!attached) return;
    record.a11y = a11y; record.a11yTarget = targetId;
    if (record.title) a11y.setTitle(targetId, record.title);
    this.#a11yViewport(record);
  }
  #a11yViewport(record) {
    if (!record.a11y) return;
    const logicalWidth = record.surfaceGeometry?.logicalWidth ?? record.adapter?.surface?.width;
    const logicalHeight = record.surfaceGeometry?.logicalHeight ?? record.adapter?.surface?.height;
    if (!logicalWidth || !logicalHeight) return;
    const bounds = record.canvas.getBoundingClientRect();
    record.a11y.setViewport(record.a11yTarget, { logicalWidth, logicalHeight,
      cssWidth: bounds.width || logicalWidth, cssHeight: bounds.height || logicalHeight });
  }
  /** Surface mode: the endpoint presented a first frame, or its size/scale changed. */
  #geometry(record, geometry) {
    if (this.disposed) return;
    // Logical size, so object-fit:none maps one surface pixel to one device pixel.
    if (record.canvas.width !== geometry.logicalWidth) record.canvas.width = geometry.logicalWidth;
    if (record.canvas.height !== geometry.logicalHeight) record.canvas.height = geometry.logicalHeight;
    record.surfaceGeometry = geometry;
    record.firstFrameAt ??= this.window.performance.now();
    this.#a11yViewport(record);
  }
  /** Pipe fallback only (no engine-view component): CPU BGRA frames drawn with putImageData. */
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
    if (event.event === "ax_tree_update" || event.event === "ax_location") {
      // Applied (and acknowledged) by the accessibility controller; an event for a
      // detached view still returns its flow-control credit to the host.
      if (!(record.a11y?.view(record.a11yTarget) && record.a11y.handleEvent(record.a11yTarget, event))) {
        record.adapter?.axAck(event.target, event.seq)?.catch?.(() => {});
      }
      return;
    }
    // The certificate error page is drawn by ChromiumBrowserUI; the tab title follows it here.
    if (event.event === "error" && !event.request_id && event.code === "certificate_error" && this.browsingMode === "web") {
      this.#errorTitle(record, "certificate_error"); this.#errorIcon(record, "certificate_error");
    }
    if (this.ui?.handle(record, event)) return; // AxioSozo engine UI delegation
    if (event.event === "url") {
      record.latestURL = event.url;
      if (record.committed && this.browsingMode === "web") this.#rememberURL(record.tab, event.url);
      // Firefox's throbber: "connecting" until the new document commits, then "loading".
      if (record.loading?.loading) { record.progress = true; this.#syncBusy(record); }
    }
    if (event.event === "title") {
      record.title = event.title; record.a11y?.setTitle(record.a11yTarget, event.title);
      if (record.committed && this.browsingMode === "web") this.#rememberTitle(record.tab, event.title);
    }
    if (event.event === "loading") {
      if (event.loading && !record.loading?.loading) record.progress = false;
      record.loading = event;
      this.#syncBusy(record);
    }
    if (event.event === "favicon") { record.icon = event.icon || null; this.#applyIcon(record); }
    if (event.event === "cursor") this.#cursor(record, event.cursor);
    if (event.event === "text_input") this.#textInput(record, event);
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
    // Page focus must be restated for each new document: a focus command that
    // crossed the navigation was rejected as stale (the first focus of a new tab
    // always is), and one sent while it started reached the old document's
    // widget. Without it Chromium never focuses page elements: no focus events,
    // no <select> popup (E1 2026-09-30).
    if (record.committed && event.event === "load" && record.contentFocused) {
      this.#action(record, target => record.adapter.focus(target, true));
    }
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
    this.#errorTitle(record, code);
    this.#errorIcon(record, code);
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
    if (this.#labelTitle(record)) this.#setLabel(record);
    this.window.gBrowser.updateTitlebar();
    this.window.UpdateBackForwardCommands(record.browser);
    // The explicit nsIURI updates address text; Gecko security UI is masked.
    const shown = record.latestURL === "about:blank" ? null : record.latestURL;
    if (!this.window.gURLBar.focused) {
      try { this.window.gURLBar.setURI(shown ? { uri:this.window.Services.io.newURI(shown) } : {}); } catch {}
    }
    this.#updateBadge(record);
  }
  /** The tab label: Firefox's error-page title while an error page shows, else the page title, else its address. */
  #labelTitle(record) { return record.errorTitle || record.title || addressLabel(record.latestURL); }
  #setLabel(record) { this.#setTabLabel(record.tab, this.#labelTitle(record)); }
  #setTabLabel(tab, title) {
    const gBrowser = this.window.gBrowser;
    if (typeof gBrowser._setTabLabel === "function") gBrowser._setTabLabel(tab, title);
    else tab.label = title;
  }
  // ---- Tab icon and throbber ---------------------------------------------------
  #currentIcon(tab) {
    try { return this.window.gBrowser.getIcon?.(tab) || null; } catch { return null; }
  }
  /** Shows the page's icon (or Firefox's error-page icon) through Zen's own setIcon. */
  #applyIcon(record) {
    const gBrowser = this.window.gBrowser;
    if (!record.committed || record.applyingIcon || typeof gBrowser.setIcon !== "function" || !record.tab.isConnected) return;
    const icon = record.errorIcon ?? record.icon ?? "";
    if ((this.#currentIcon(record.tab) ?? "") === icon && record.tab.hasAttribute?.("image") === !!icon) return;
    record.applyingIcon = true;
    try { gBrowser.setIcon(record.tab, icon); record.iconApplied = true; } catch (error) { this.onFailure(error); }
    finally { record.applyingIcon = false; }
  }
  /** Network and certificate errors show Firefox's error-page icon; a crashed page keeps its own. */
  #errorIcon(record, code) {
    record.errorIcon = ERROR_ICONS[code] ?? null;
    this.#applyIcon(record);
  }
  /** Firefox's tab throbber: busy while Chromium loads, progress once the new document commits. */
  #syncBusy(record) {
    if (!record.committed) return;
    const loading = !!record.loading?.loading;
    record.tab.toggleAttribute?.("busy", loading);
    record.tab.toggleAttribute?.("progress", loading && !!record.progress);
  }
  /** Sets (code) or clears (null) the error-page tab title; the next successful load restores the page title. */
  #errorTitle(record, code) {
    const before = record.errorTitle ?? null;
    record.errorTitle = code ? this.#localizedErrorTitle(code) : null;
    if (record.errorTitle === before) return;
    if (record.errorTitle) this.#setLabel(record);
    else if (record.title) this.#setLabel(record);
    else if (record.tab.isConnected) this.window.gBrowser.setTabTitle(record.tab);
    if (this.active === record) this.window.gBrowser.updateTitlebar();
  }
  #localizedErrorTitle(code) {
    const [resource, id, fallback] = ERROR_TITLES[code] ?? ERROR_TITLES.load_failed;
    try {
      this.l10nBundles ??= new Map();
      let bundle = this.l10nBundles.get(resource);
      if (!bundle) { bundle = new this.window.Localization([resource], true); this.l10nBundles.set(resource, bundle); }
      const value = bundle.formatValueSync(id);
      if (typeof value === "string" && value) return value;
    } catch {}
    return fallback;
  }
  #cursor(record, cursor) {
    // The adapter admits only CSS keywords; the component re-checks and never takes url().
    if (!record.native) { record.canvas.style.cursor = cursor; return; }
    try { record.native.setCursor(record.canvas, cursor); } catch {}
  }
  /** Resolves to the native result, or null when the operation failed (already reported). */
  #action(record, operation) {
    const target = record.adapter.target;
    return Promise.resolve().then(() => operation(target)).then(result => {
      if (result?.status === "unsupported") {
        if (!["NAVIGATION_SUPERSEDED", "NAVIGATION_CANCELLED", "history_boundary"].includes(result.reason)) {
          this.#indicator(record, result.reason || "Operation unsupported in fixture engine");
        }
      } else if (result && result.status === "failed" && this.browsingMode === "web") {
        // A failed navigation already reported its own page error.
      } else if (result && result.status !== "success") throw new Error("CEF_ACTION_FAILED");
      return result ?? null;
    }).catch(error => {
      if (!record.committed) return null;
      if (error.message === "STALE_CEF_TARGET") this.#indicator(record, "Input discarded after navigation");
      else if (error.message !== "CEF_UNAVAILABLE") this.#failed(record, error);
      return null;
    });
  }
  #resize(record) {
    if (!record.committed || this.active !== record) return;
    if (record.resizePending) { record.resizeDirty = true; return; }
    record.resizePending = true;
    record.nextPointer = null; // do not send a queued old-size move after resize begins
    record.pendingWheel = null;
    this.window.requestAnimationFrame(async () => {
      try {
        do {
          record.resizeDirty = false;
          if (!record.committed) return;
          const surface = this.#surface(record);
          if (JSON.stringify(surface) === JSON.stringify(record.adapter.surface)) continue;
          const result = await record.adapter.resize(record.adapter.target, surface);
          if (result?.status !== "success") {
            // A host that still applies the pipe's 32 MiB bound: step down once, then retry.
            if (record.surfaceMode && !record.hostByteCap && result?.status === "unsupported" && result.reason === "surface_limit") {
              record.hostByteCap = true; record.resizeDirty = true; continue;
            }
            throw new Error("UNSUPPORTED_SURFACE");
          }
          this.#indicator(record);
          this.#a11yViewport(record);
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
  #listen(record, type, handler, options) { this.#listenOn(record, record.canvas, type, handler, options); }
  #listenOn(record, element, type, handler, options) {
    element.addEventListener(type, handler, options);
    record.listeners.push(() => element.removeEventListener(type, handler, options));
  }
  #clickCount(record, event, position) {
    // Pipe fallback: pointer events carry no reliable click count; derive it like the OS does.
    const clicks = record.clicks, now = event.timeStamp ?? this.window.performance.now();
    const near = Math.abs(position.x - clicks.x) <= 4 && Math.abs(position.y - clicks.y) <= 4;
    clicks.count = near && now - clicks.time <= 500 ? Math.min(3, clicks.count + 1) : 1;
    Object.assign(clicks, { time:now, x:position.x, y:position.y });
    return clicks.count;
  }
  /** Native detail (NSEvent) of a trusted event during its dispatch, from the engine-view component. */
  #describe(record, event) {
    if (!record.native) return null;
    try {
      const value = record.native.describeNativeEvent(event);
      return value && typeof value === "object" ? value : null;
    } catch { return null; }
  }
  #send(record, method, fields) { return this.#action(record, target => record.adapter.input(target, method, fields)); }
  #point(record, event) {
    const bounds = record.canvas.getBoundingClientRect();
    return { x:Math.max(0, Math.min(record.adapter.surface.width, Math.floor(event.clientX - bounds.left))),
      y:Math.max(0, Math.min(record.adapter.surface.height, Math.floor(event.clientY - bounds.top))), modifiers:cefModifiers(event) };
  }
  #input(record) {
    // Gecko hit testing and focus decide the target (Zen overlays stay on top);
    // the component adds only what DOM events lose (docs/design/engine-view-gecko.md §7).
    this.#pointerInput(record);
    if (record.native) { this.#surfaceKeyboard(record); this.#surfaceFocus(record); }
    else this.#pipeKeyboard(record);
    // Chromium asks for its menu natively (run_context_menu); Zen draws it via ChromiumBrowserUI.
    this.#listen(record, "contextmenu", event => { event.preventDefault(); });
  }
  #pointerInput(record) {
    const send = (method, fields) => this.#send(record, method, fields);
    const point = event => this.#point(record, event);
    for (const type of ["pointerdown", "pointerup", "pointermove"]) this.#listen(record, type, event => {
      if (!event.isTrusted || !record.committed) return;
      if (type === "pointerdown" && !record.resizePending) { this.#focusContent(record); record.canvas.setPointerCapture(event.pointerId); }
      if (type === "pointerup" && record.canvas.hasPointerCapture(event.pointerId)) record.canvas.releasePointerCapture(event.pointerId);
      event.preventDefault();
      const position = point(event);
      let count = record.clicks.count;
      if (type === "pointerdown") {
        count = this.#clickCount(record, event, position);
        // The native click count (system double-click interval and slop) wins when known.
        const native = this.#describe(record, event);
        if (native?.kind === "mouse" && Number.isInteger(native.clickCount) && native.clickCount > 0) {
          count = record.clicks.count = Math.min(3, native.clickCount);
        }
      }
      const fields = { ...position, type:type === "pointermove" ? "move" : (type === "pointerdown" ? "down" : "up"),
        button:["left", "middle", "right"][Math.max(0, event.button)] || "left", click_count:count, mouse_leave:false };
      if (record.resizePending) {
        if (type === "pointerup") record.deferredPointerUp = fields;
        return;
      }
      if (type === "pointermove") {
        // Input still crosses the JSON pipe, so moves are coalesced to one per frame.
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
        // Keep order: pending scroll, then the last drag point, then the button.
        this.#flushWheel(record);
        if (record.nextPointer) { send("mouse", record.nextPointer); record.nextPointer = null; }
        send("mouse", fields);
      }
    });
    this.#listen(record, "pointerleave", event => {
      if (!event.isTrusted || !record.committed || record.resizePending) return;
      record.nextPointer = null;
      send("mouse", { ...point(event), type:"move", button:"left", click_count:1, mouse_leave:true });
    });
    this.#listen(record, "wheel", event => this.#wheel(record, event), { passive:false });
  }
  #wheel(record, event) {
    if (!event.isTrusted) return;
    // Stops Gecko scrolling ancestors and starting a history swipe over the view.
    event.preventDefault();
    if (record.resizePending || !record.committed) return;
    const features = record.adapter.inputFeatures ?? {};
    const native = this.#describe(record, event);
    const position = this.#point(record, event);
    if (native?.native === "magnify" && features.pinch) {
      this.#coalesce(record, "pinch", { ...position, phase:wheelPhase(native.phase) }, { magnification:Number(native.magnification) || 0 });
      return;
    }
    let dx, dy;
    if (native?.native === "scroll" && native.precise && Number.isFinite(native.scrollingDeltaX) && Number.isFinite(native.scrollingDeltaY)) {
      // Trackpad points as the NSEvent reported them (CEF's sign), without DOM multipliers.
      dx = native.scrollingDeltaX; dy = native.scrollingDeltaY;
    } else {
      const scale = event.deltaMode === 1 ? 20 : (event.deltaMode === 2 ? record.adapter.surface.height : 1);
      dx = -event.deltaX * scale; dy = -event.deltaY * scale;
    }
    const phases = features.wheelPhases ? { phase:wheelPhase(native?.phase), momentum_phase:wheelPhase(native?.momentumPhase),
      precise:!!native?.precise } : {};
    this.#coalesce(record, "wheel", { ...position, ...phases }, { delta_x:dx, delta_y:dy });
  }
  /** Sum wheel (or pinch) deltas per frame; a phase or modifier change flushes first. */
  #coalesce(record, method, fields, sums) {
    const key = JSON.stringify([method, fields.modifiers, fields.phase ?? null, fields.momentum_phase ?? null, fields.precise ?? null]);
    if (record.pendingWheel && record.pendingWheel.key !== key) this.#flushWheel(record);
    if (record.pendingWheel) {
      record.pendingWheel.fields = fields; // the latest position
      for (const [name, value] of Object.entries(sums)) record.pendingWheel.sums[name] += value;
    } else record.pendingWheel = { key, method, fields, sums:{ ...sums } };
    if (record.wheelScheduled) return;
    record.wheelScheduled = true;
    this.window.requestAnimationFrame(() => { record.wheelScheduled = false; this.#flushWheel(record); });
  }
  #flushWheel(record) {
    const pending = record.pendingWheel;
    record.pendingWheel = null;
    if (!pending || !record.committed || record.resizePending) return;
    if (pending.method === "pinch") {
      this.#send(record, "pinch", { ...pending.fields, magnification:Math.max(-10, Math.min(10, pending.sums.magnification)) });
      return;
    }
    // Keep sub-pixel remainders so slow precise scrolling is not lost to rounding.
    const remainder = record.wheelRemainder, limit = value => Math.max(-4096, Math.min(4096, value));
    const x = pending.sums.delta_x + remainder.x, y = pending.sums.delta_y + remainder.y;
    const delta_x = limit(Math.round(x)) || 0, delta_y = limit(Math.round(y)) || 0;
    remainder.x = Math.abs(x - delta_x) < 1 ? x - delta_x : 0; remainder.y = Math.abs(y - delta_y) < 1 ? y - delta_y : 0;
    const phased = pending.fields.phase !== undefined && (pending.fields.phase !== "none" || pending.fields.momentum_phase !== "none");
    if (!delta_x && !delta_y && !phased) return;
    this.#send(record, "wheel", { ...pending.fields, delta_x, delta_y });
  }
  /** BGRA pipe fallback: default-group listeners and the fixed shortcut heuristic. */
  #pipeKeyboard(record) {
    const send = (method, fields) => this.#send(record, method, fields);
    for (const [eventName, type] of [["keydown", "down"], ["keyup", "up"]]) this.#listen(record, eventName, event => {
      if (!event.isTrusted) return;
      const route = keyboardRoute(event, { editing:this.browsingMode === "web" });
      if (route === "chrome") return; // Zen's shortcuts work over Chromium exactly as over Firefox
      event.preventDefault(); event.stopPropagation();
      if (route === "edit") {
        if (type === "down") this.#action(record, target => record.adapter.edit(target, editAction(event)));
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
    this.#listen(record, "compositionstart", event => { event.preventDefault(); this.#indicator(record, "IME is unsupported in the experimental Chromium surface"); });
  }
  /**
   * Surface mode keys follow Firefox's remote-tab model (engine-view-gecko §7.2):
   * a system-group capture listener asks the component to hold every trusted key
   * that chrome has not reserved (⌘T, ⌘W, ⌘Q… stay with Zen), stops it before
   * Zen's key handlers, forwards it, and later hands unconsumed keys back so Zen
   * and menu shortcuts run exactly as over a Gecko tab. keydown is never
   * default-prevented, so the widget still runs the IME.
   */
  #surfaceKeyboard(record) {
    const web = this.browsingMode === "web";
    const handler = event => {
      if (!event.isTrusted || !record.committed) return;
      // IME-owned keys go through the widget into the proxy editor's composition.
      if (event.isComposing || event.keyCode === 229 || event.key === "Process" || event.key === "Dead") return;
      const features = record.adapter.inputFeatures ?? {};
      const native = this.#describe(record, event);
      const nativeCode = native?.kind === "key" && Number.isInteger(native.keyCode) ? native.keyCode : undefined;
      const route = keyboardRoute(event, { editing:web, native:nativeCode !== undefined });
      // Hosts without key verdicts: the fixed heuristic decides up front (labelled fallback).
      if (!features.keyVerdict && route === "chrome") return;
      let ticket = 0;
      try { ticket = record.native.holdKeyEvent(event); } catch { ticket = 0; }
      if (!ticket) return; // reserved by chrome, or our own reply: it proceeds as over a Gecko tab
      event.stopPropagation();
      // No default action (Tab focus move, space scroll, text insertion) while the page decides.
      if (event.type === "keypress") event.preventDefault();
      const finish = consumed => this.#finishKey(record, ticket, consumed);
      if (route === "edit") {
        if (event.type === "keydown") this.#action(record, target => record.adapter.edit(target, editAction(event)));
        finish(true);
        return;
      }
      const code = nativeCode ?? MAC_KEYS[event.code];
      if (route === "unsupported" || code === undefined) { finish(false); return; }
      const base = { native_key_code:code, windows_key_code:Math.min(255, event.keyCode || 0), modifiers:cefModifiers(event),
        text:event.key.length <= 2 ? event.key : "" };
      const verdict = promise => (features.keyVerdict
        ? promise.then(result => result !== null && result.reason !== "key_not_consumed")
        : Promise.resolve(true));
      if (event.type === "keydown") {
        record.keyDowns.set(event.code, base);
        const result = verdict(this.#send(record, "key", { ...base, type:"down" }));
        record.keyVerdicts.set(event.code, result);
        result.then(finish);
      } else if (event.type === "keypress") {
        const text = event.key === "Enter" ? "\r" : (event.key.length <= 2 ? event.key : "");
        if (text && !event.metaKey && !event.ctrlKey) {
          this.#send(record, "key", { ...(record.keyDowns.get(event.code) ?? base), type:"char", text });
        }
        // A keypress shares its keydown's verdict: ⌘L's keypress returns to Zen with it.
        (record.keyVerdicts.get(event.code) ?? Promise.resolve(true)).then(finish);
      } else {
        const down = record.keyVerdicts.get(event.code);
        record.keyVerdicts.delete(event.code); record.keyDowns.delete(event.code);
        this.#send(record, "key", { ...base, type:"up" });
        (down ?? Promise.resolve(true)).then(finish);
      }
    };
    for (const type of ["keydown", "keypress", "keyup"]) {
      this.#listenOn(record, record.overlay, type, handler, { capture:true, mozSystemGroup:true });
    }
  }
  #finishKey(record, ticket, consumed) {
    const finish = () => {
      // Replies are re-dispatched at the engine view, so Zen's handlers see them in the chrome document.
      const target = record.canvas.isConnected !== false ? record.canvas : this.window.document.documentElement;
      try { record.native.finishKeyEvent(ticket, consumed, target); } catch {}
    };
    // A consumed key is only released; an unconsumed one is replayed after the current dispatch.
    if (consumed) finish(); else this.window.setTimeout(finish, 0);
  }
  #contentElement(record, node) {
    return !!node && (node === record.canvas || node === record.ime?.text || node === record.ime?.password);
  }
  /** Page focus follows chrome focus of the engine view or its proxy editor, not moves between them. */
  #surfaceFocus(record) {
    this.#listenOn(record, record.overlay, "focusin", event => {
      if (!this.#contentElement(record, event.target) || record.contentFocused) return;
      record.contentFocused = true;
      this.#action(record, target => record.adapter.focus(target, true));
    });
    this.#listenOn(record, record.overlay, "focusout", event => {
      if (!this.#contentElement(record, event.target) || this.#contentElement(record, event.relatedTarget)) return;
      record.contentFocused = false;
      if (record.composing) { record.composing = false; this.#send(record, "ime_finish_composing", {}); }
      this.#action(record, target => record.adapter.focus(target, false));
    });
  }
  /**
   * IME (engine-view-gecko §7.3), only when the host announces `ime`: while the
   * page's editable has focus, a transparent proxy editor at its caret takes chrome
   * focus so Gecko drives the macOS IME against it; password fields use an
   * <input type=password> so secure event input turns on as for a Gecko field.
   */
  #textInput(record, event) {
    if (!record.native || !record.adapter.inputFeatures?.ime) return;
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
    Object.assign(element.style, { left:`${Math.round(event.caret_x)}px`, top:`${Math.round(event.caret_y)}px`,
      height:`${height}px`, fontSize:`${height}px`, lineHeight:`${height}px` });
    ime.active = element;
    if (hadFocus && focused !== element) element.focus();
  }
  #createIME(record) {
    const make = (tag, type) => {
      const element = this.#element(record.overlay, tag);
      if (type) element.setAttribute("type", type);
      element.setAttribute("aria-hidden", "true"); element.setAttribute("tabindex", "-1");
      element.setAttribute("autocomplete", "off"); element.setAttribute("spellcheck", "false");
      element.style.cssText = PROXY_STYLE;
      const clear = () => { element.value = ""; };
      this.#listenOn(record, element, "compositionstart", () => { record.composing = true; });
      this.#listenOn(record, element, "compositionupdate", event => {
        const text = String(event.data ?? "").slice(0, 256);
        this.#send(record, "ime_set_composition", { text, selection_start:text.length, selection_end:text.length });
      });
      this.#listenOn(record, element, "compositionend", event => {
        record.composing = false;
        const text = String(event.data ?? "").slice(0, 256);
        if (text) this.#send(record, "ime_commit_text", { text });
        else this.#send(record, "ime_cancel_composition", {});
      });
      // Text that arrives without keys (dictation, emoji and character viewer).
      this.#listenOn(record, element, "input", event => {
        if (event.isComposing) return;
        const text = String(event.data ?? "").slice(0, 256);
        if (!record.composing && text && ["insertText", "insertReplacementText"].includes(event.inputType)) {
          this.#send(record, "ime_commit_text", { text });
        }
        clear();
      });
      return element;
    };
    return { text:make("textarea"), password:make("input", "password"), active:null };
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
      const tab = args[0], record = presenter.records.get(tab);
      if (record && presenter.#labelTitle(record)) { presenter.#setLabel(record); return true; }
      // A Chromium tab that has not started yet (restored, or moved while in the background).
      const saved = !record && tab?.getAttribute?.(ENGINE_ATTRIBUTE) === "chromium" ? presenter.restoreTitles.get(tab) : null;
      if (saved) { presenter.#setTabLabel(tab, saved); return true; }
      return original.apply(this, args);
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
        presenter.#focusContent(record);
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
    this.ui?.forget(record); // AxioSozo engine UI delegation
    if (record.a11y) { record.a11y.detach(record.a11yTarget); record.a11y = null; }
    if (this.pending === record) this.pending = null;
    if (this.records.get(record.tab) === record) this.records.delete(record.tab);
    record.committed = false;
    record.observer?.disconnect();
    for (const remove of record.listeners) remove();
    record.listeners = [];
    record.pendingWheel = null; record.nextPointer = null;
    this.#restoreBrowserFocus(record);
    this.window.clearTimeout?.(record.noticeTimer);
    record.browser.style.visibility = record.priorVisibility;
    if (typeof record.priorDocShellIsActive === "boolean") {
      record.browser.docShellIsActive = this.window.gBrowser.shouldActivateDocShell?.(record.browser)
        ?? (this.window.gBrowser.selectedTab === record.tab && record.priorDocShellIsActive);
    }
    record.stack.style.position = record.priorPosition;
    record.overlay.remove();
    record.canvas.width = 1; record.canvas.height = 1;
    record.tab.toggleAttribute?.("busy", false); record.tab.toggleAttribute?.("progress", false);
    // Back in Firefox, Firefox's page sets its own icon. A kept engine keeps the
    // icon so Zen's session (and a closing window) remembers it.
    if (!keepEngine && record.iconApplied && record.tab.isConnected) {
      try { this.window.gBrowser.setIcon?.(record.tab, ""); } catch {}
    }
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
    if (!record) return { engine:"gecko", ownedTabIds:this.owners() };
    // Surface mode: frames never reach JS; the endpoint counts them (presented, composited, released…).
    const stats = record.surfaceMode ? record.adapter.surfaceStats?.() ?? null : null;
    return { engine:"chromium", version:CHROMIUM_VERSION, target:record.adapter.target,
      renderPath:record.adapter.renderPath ?? RENDER_PATH_PIPE, pipeFallback:!record.surfaceMode,
      frames:record.surfaceMode ? (Number.isFinite(stats?.presented) ? stats.presented : (record.firstFrameAt === null ? 0 : 1)) : record.displayedFrames,
      meanDrawMilliseconds:record.surfaceMode ? 0 : record.drawMilliseconds / record.displayedFrames,
      firstFrameMilliseconds:record.firstFrameAt - record.startedAt, lastFrameId:record.lastFrameId,
      surface:record.adapter.surface, surfaceGeometry:record.surfaceGeometry ?? null, surfaceStats:stats,
      renderScaleLimited:!!record.renderScaleLimited, inputFeatures:record.adapter.inputFeatures ?? null,
      fixtureOnly:this.browsingMode === "fixture", ownedTabIds:this.owners() };
  }
  captureFixtureFrame() {
    const record = this.active;
    // Surface frames never exist in chrome JS (drawSnapshot shows an empty canvas); use screencapture.
    if (record?.surfaceMode) throw new Error("CEF_SURFACE_CAPTURE_UNAVAILABLE");
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
