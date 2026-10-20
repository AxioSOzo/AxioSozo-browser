/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Browser UI for WebKit tabs, drawn by Zen exactly as for Gecko and Chromium tabs
// (engine-stream-v1 §8.2). The WebKit host draws nothing: every UI request is a
// `prompt` event with cef-v1's delegation schema, so ChromiumBrowserUI renders
// context menus, JavaScript dialogs, beforeunload, permission doorhangers, the file
// picker, the findbar and the zoom indicator for WebKit tabs too. This module adds
// what only WebKit needs:
//  - <select> popups (`option_menu` prompts) as Zen menupopups;
//  - Zen's clipboard and the X11 PRIMARY selection (`clipboard_text`, `text_selection`
//    in bounded chunks; paste goes back as `paste_text`), because WebKit's pasteboard is
//    private to the sandboxed host;
//  - fixture-mode policy: permission decisions are never remembered (deny unless the
//    user explicitly allows, for this page only), downloads are refused with a notice.
// Nothing here is reachable from page content.

import { ChromiumBrowserUI } from "./ChromiumBrowserUI.sys.mjs";

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const MAX_TEXT = 36 * 1800;

export const NOTICES = Object.freeze({
  navigation_denied: "WebKit tabs only open the local test page for now.",
  popup_denied: "A pop-up was blocked.",
  download_denied: "Downloads aren't available in WebKit tabs yet. Open this page in Firefox to download.",
  permission_denied: "This page asked for a permission WebKit tabs can't grant.",
  media_capture_unavailable: "Camera, microphone and screen sharing aren't available in WebKit tabs. Open this page in Firefox to use them.",
  action_unavailable: "That isn't available in WebKit tabs yet.",
  prompt_limit: "This page asked for too many things at once; the extra requests were declined.",
  prompt_too_large: "A request from this page was too large to show and was declined.",
  text_too_large: "The selection is too large to copy from a WebKit tab.",
  javascript_dialog_unavailable: "This page tried to show a dialog, which this WebKit host doesn't support.",
  file_dialog_unavailable: "File uploads aren't supported by this WebKit host.",
  http_auth_unavailable: "This page asked for a sign-in, which WebKit tabs don't support yet.",
  certificate_error: "WebKit could not verify this site's certificate and did not load it.",
});

/** Fixture mode: nothing is remembered; the doorhanger always asks (the safe default is deny). */
export const FIXTURE_PERMISSION_STORE = Object.freeze({ get: async () => null, set: async () => {} });

/** Reassembles `clipboard_text` / `text_selection` chunks (part 1..parts, in order). */
export class TextChunks {
  #parts = []; #expected = 0;
  /** Returns the whole text after the last part, else null. Out-of-order parts restart. */
  add({ text, part, parts }) {
    if (part === 1) { this.#parts = []; this.#expected = parts; }
    if (parts !== this.#expected || part !== this.#parts.length + 1) { this.#parts = []; this.#expected = 0; return null; }
    this.#parts.push(text);
    if (part < parts) return null;
    const whole = this.#parts.join("");
    this.#parts = []; this.#expected = 0;
    return whole.length <= MAX_TEXT ? whole : null;
  }
}

export class WebKitBrowserUI {
  #win; #send; #target; #records; #services; #states = new Map(); #disposed = false; #restore = [];
  /**
   * @param send     (record, method, fields, target) → Promise: one command for that exact target
   * @param target   record → current WebKit target
   * @param records  () → the window's WebKit records
   * @param hooks    ChromiumBrowserUI's presenter hooks plus `paste(record)`
   * @param services test seams (clipboard, chromium: ChromiumBrowserUI class)
   */
  constructor(win, { send, target, records = () => [], hooks = {}, services = {} }) {
    this.#win = win; this.#send = send; this.#target = target; this.#records = records; this.hooks = hooks; this.#services = services;
    const Chromium = services.ChromiumBrowserUI ?? ChromiumBrowserUI;
    this.chromium = new Chromium(win, {
      // Context-menu "Paste" reads Zen's clipboard here; the host only ever sees the text.
      send: (record, method, fields, issued) => {
        if (method === "context_menu_command" && fields.command === "paste") {
          this.hooks.paste?.(record);
          return send(record, method, { ...fields, command: "dismiss" }, issued);
        }
        return send(record, method, fields, issued);
      },
      target, records, hooks,
      services: { permissionStore: FIXTURE_PERMISSION_STORE, ...(services.chromiumServices ?? {}) },
    });
    // ChromiumBrowserUI names its menu for Chromium; the same menu over a WebKit page says WebKit.
    const relabel = event => {
      const popup = event.target;
      if (popup?.id !== "axiosozo-chromium-context-menu" || !this.#webkitMenuPending) return;
      this.#webkitMenuPending = false;
      popup.setAttribute("aria-label", "WebKit page context menu");
      popup.querySelector?.('[data-action="inspect"]')?.setAttribute("tooltiptext", "Developer tools aren't available for WebKit tabs yet");
    };
    win.document?.addEventListener?.("popupshowing", relabel, true);
    this.#restore.push(() => win.document?.removeEventListener?.("popupshowing", relabel, true));
  }
  #webkitMenuPending = false;
  #state(record) {
    let state = this.#states.get(record);
    if (!state) { state = { clipboard: new TextChunks(), selection: new TextChunks(), menu: null, prompts: new Map() }; this.#states.set(record, state); }
    return state;
  }

  /** Every event of a WebKit record passes here first. True when consumed. */
  handle(record, event) {
    if (this.#disposed || !record || !event) return false;
    const state = this.#state(record);
    switch (event.event) {
      case "prompt":
        if (event.kind === "option_menu") { this.#optionMenu(record, state, event); return true; }
        if (event.kind === "context_menu") this.#webkitMenuPending = true;
        return this.chromium.handle(record, event);
      case "prompt_closed":
        if (state.prompts.has(event.prompt_id)) { this.#closeLocal(state, event.prompt_id); return true; }
        return this.chromium.handle(record, event);
      case "clipboard_text": {
        const text = state.clipboard.add(event);
        if (text !== null) this.#clipboard().copyString(text);
        return true;
      }
      case "text_selection": {
        const text = state.selection.add(event);
        if (text !== null && this.#primarySupported()) this.#clipboard().copyStringToClipboard(text, this.#Ci.nsIClipboard.kSelectionClipboard);
        return true;
      }
      case "error":
        if (event.request_id) return false;
        if (Object.hasOwn(NOTICES, event.code)) { this.hooks.notice?.(record, NOTICES[event.code]); return true; }
        return false;
      case "navigation": case "closed":
        for (const id of [...state.prompts.keys()]) this.#closeLocal(state, id);
        return this.chromium.handle(record, event);
      default:
        return this.chromium.handle(record, event);
    }
  }
  forget(record) {
    const state = this.#states.get(record);
    if (state) for (const id of [...state.prompts.keys()]) this.#closeLocal(state, id);
    this.#states.delete(record);
    this.chromium.forget(record);
  }
  dispose() {
    if (this.#disposed) return;
    for (const record of [...this.#states.keys()]) this.forget(record);
    this.#disposed = true;
    for (const restore of this.#restore.splice(0).reverse()) { try { restore(); } catch {} }
    this.chromium.dispose();
  }
  command(record, method, fields) { return this.chromium.command(record, method, fields); }

  // ---- clipboard -----------------------------------------------------------------------
  get #Ci() { return this.#services.Ci ?? globalThis.Ci; }
  #clipboard() {
    return this.#services.clipboard ?? globalThis.Cc["@mozilla.org/widget/clipboardhelper;1"].getService(this.#Ci.nsIClipboardHelper);
  }
  #primarySupported() {
    if (this.#services.primary !== undefined) return this.#services.primary;
    try { return this.#win.Services.clipboard.isClipboardTypeSupported(this.#Ci.nsIClipboard.kSelectionClipboard); } catch { return false; }
  }
  /** Plain text from Zen's clipboard (`primary`: the X11 PRIMARY selection), or "". */
  readText({ primary = false } = {}) {
    if (this.#services.readText) return this.#services.readText({ primary });
    const Ci = this.#Ci, Cc = globalThis.Cc;
    if (primary && !this.#primarySupported()) return "";
    try {
      const transferable = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
      transferable.init(null);
      transferable.addDataFlavor("text/plain");
      const which = primary ? Ci.nsIClipboard.kSelectionClipboard : Ci.nsIClipboard.kGlobalClipboard;
      const clipboard = this.#win.Services.clipboard;
      try { clipboard.getData(transferable, which, this.#win.browsingContext?.currentWindowContext); }
      catch { clipboard.getData(transferable, which); }
      const data = {};
      transferable.getTransferData("text/plain", data);
      return data.value?.QueryInterface?.(Ci.nsISupportsString)?.data ?? "";
    } catch { return ""; }
  }

  // ---- <select> popups (option_menu) ----------------------------------------------------
  #closeLocal(state, id) {
    const prompt = state.prompts.get(id);
    if (!prompt) return;
    state.prompts.delete(id);
    prompt.answered = true;
    try { prompt.close(); } catch {}
  }
  #answer(record, state, prompt, index) {
    if (prompt.answered || state.prompts.get(prompt.id) !== prompt) return;
    this.#closeLocal(state, prompt.id);
    Promise.resolve().then(() => this.#send(record, "option_menu_reply", { prompt_id: prompt.id, index }, prompt.target)).catch(() => {});
  }
  #optionMenu(record, state, event) {
    if (state.prompts.has(event.prompt_id)) return;
    const doc = this.#win.document, details = event.details;
    const prompt = { id: event.prompt_id, target: event.target ?? this.#target(record), answered: false, close: () => {} };
    state.prompts.set(prompt.id, prompt);
    const popup = doc.createElementNS(XUL_NS, "menupopup");
    popup.id = "axiosozo-webkit-select-popup";
    popup.className = "axiosozo-select-popup";
    popup.setAttribute("aria-label", "Options");
    popup.setAttribute("consumeoutsideclicks", "true");
    let chosen = false, selected = null;
    details.items.forEach((item, index) => {
      if (item.group) {
        const caption = doc.createElementNS(XUL_NS, "menucaption");
        caption.setAttribute("label", item.label);
        popup.appendChild(caption);
        return;
      }
      const entry = doc.createElementNS(XUL_NS, "menuitem");
      entry.setAttribute("label", item.label || " ");
      entry.dataset.index = String(index);
      if (item.child) entry.classList.add("axiosozo-select-child");
      if (!item.enabled) entry.setAttribute("disabled", "true");
      if (item.selected) { entry.setAttribute("selected", "true"); selected = entry; }
      entry.addEventListener("command", () => { chosen = true; this.#answer(record, state, prompt, index); });
      popup.appendChild(entry);
    });
    popup.addEventListener("popupshown", () => { if (selected) popup.activeChild = selected; });
    popup.addEventListener("popuphidden", hidden => {
      if (hidden.target !== popup) return;
      popup.remove();
      if (!chosen) this.#answer(record, state, prompt, -1);
    });
    prompt.close = () => { chosen = true; if (["open", "showing"].includes(popup.state)) popup.hidePopup?.(); popup.remove(); };
    (doc.getElementById("mainPopupSet") ?? doc.documentElement).appendChild(popup);
    const anchor = this.hooks.contentElement?.(record);
    const rect = anchor?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
    const x = (this.#win.mozInnerScreenX ?? 0) + rect.left + details.x, y = (this.#win.mozInnerScreenY ?? 0) + rect.top + details.y;
    popup.style.minWidth = `${Math.max(1, details.width)}px`;
    if (typeof popup.openPopupAtScreenRect === "function") popup.openPopupAtScreenRect("after_start", x, y, details.width, details.height, false, false);
    else popup.openPopupAtScreen?.(Math.round(x), Math.round(y + details.height), false);
    state.menu = popup;
  }
}
