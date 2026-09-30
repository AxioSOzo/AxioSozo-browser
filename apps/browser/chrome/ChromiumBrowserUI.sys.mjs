/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Browser UI for Chromium (CEF) tabs, drawn by Zen/Firefox exactly as for Gecko
// tabs. Chromium never draws browser UI: the native host turns each CEF UI
// callback into a `prompt` event carrying a host-issued prompt_id. This module
// renders it with Firefox's own UI (XUL context menu, content-modal prompts,
// PopupNotifications, nsIFilePicker, the downloads panel, the findbar and the
// zoom indicator) and answers once, bound to the exact target it was issued
// for. Timeouts, navigation, closing and host failure all end in the host's
// safe default (cancel/deny/stay). Nothing here is reachable from page content.
// Contract: contracts/cef-v1.md "Browser UI delegation".

import { JsonStore, profileStorage } from "./JsonStore.sys.mjs";

const PROMPT_ID = /^prompt-[1-9][0-9]{0,15}$/u;
const MAX_TIMEOUT = 600000;
const CONTEXT_ACTIONS = new Set(["dismiss", "copy", "cut", "paste", "select_all", "undo", "redo",
  "copy_image", "save_image", "save_link", "spelling", "add_to_dictionary"]);
const MEDIA_TYPES = new Set(["none", "image", "video", "audio", "canvas", "file", "plugin"]);
const FILE_MODES = { open: "modeOpen", open_multiple: "modeOpenMultiple", open_folder: "modeGetFolder", save: "modeSave" };
const CLOSE_REASONS = new Set(["timeout", "navigation", "closed", "reset", "withdrawn", "answered"]);
const DOWNLOAD_STATES = new Set(["in_progress", "complete", "canceled", "interrupted"]);
// [browser.properties key or null, English fallback, PopupNotifications anchor]
const PERMISSIONS = {
  geolocation: ["geolocation.shareWithSite4", "Allow %S to access your location?", "geo-notification-icon"],
  notifications: ["webNotifications.receiveFromSite3", "Allow %S to send notifications?", "web-notifications-notification-icon"],
  persistent_storage: ["persistentStorage.allowWithSite2", "Allow %S to store data in persistent storage?", "persistent-storage-notification-icon"],
  local_network: ["localNetwork.allowWithSite2", "%S wants to access apps and services on devices connected to your local network.", "local-network-notification-icon"],
  midi_sysex: [null, "Allow %S to access your MIDI devices?", "midi-notification-icon"],
  clipboard: [null, "Allow %S to see text and images copied to the clipboard?", "default-notification-icon"],
  storage_access: [null, "Allow %S to use its cookies on this site?", "default-notification-icon"],
  top_level_storage_access: [null, "Allow %S to use its cookies on this site?", "default-notification-icon"],
  local_fonts: [null, "Allow %S to use the fonts installed on your Mac?", "default-notification-icon"],
  idle_detection: [null, "Allow %S to know when you are actively using this device?", "default-notification-icon"],
  multiple_downloads: [null, "Allow %S to download multiple files?", "default-notification-icon"],
  keyboard_lock: [null, "Allow %S to capture your keyboard?", "default-notification-icon"],
  pointer_lock: [null, "Allow %S to hide and lock your pointer?", "default-notification-icon"],
  window_management: [null, "Allow %S to manage windows on all your displays?", "default-notification-icon"],
  file_system_access: [null, "Allow %S to edit files on your Mac?", "default-notification-icon"],
  sensors: [null, "Allow %S to use motion and light sensors?", "default-notification-icon"],
};
const CERT_ERRORS = { [-200]: "ERR_CERT_COMMON_NAME_INVALID", [-201]: "ERR_CERT_DATE_INVALID", [-202]: "ERR_CERT_AUTHORITY_INVALID",
  [-203]: "ERR_CERT_CONTAINS_ERRORS", [-204]: "ERR_CERT_NO_REVOCATION_MECHANISM", [-205]: "ERR_CERT_UNABLE_TO_CHECK_REVOCATION",
  [-206]: "ERR_CERT_REVOKED", [-207]: "ERR_CERT_INVALID", [-208]: "ERR_CERT_WEAK_SIGNATURE_ALGORITHM", [-210]: "ERR_CERT_NON_UNIQUE_NAME",
  [-211]: "ERR_CERT_WEAK_KEY", [-212]: "ERR_CERT_NAME_CONSTRAINT_VIOLATION", [-213]: "ERR_CERT_VALIDITY_TOO_LONG",
  [-214]: "ERR_CERTIFICATE_TRANSPARENCY_REQUIRED", [-215]: "ERR_CERT_SYMANTEC_LEGACY", [-217]: "ERR_CERT_KNOWN_INTERCEPTION_BLOCKED" };
const NOTICES = {
  media_capture_unavailable: "Camera, microphone and screen sharing aren't available in Chromium tabs yet. Open this tab in Firefox to use them.",
  prompt_limit: "This page asked for too many things at once; the extra requests were declined.",
  prompt_too_large: "A request from this page was too large to show and was declined.",
};
// nsITypeAheadFind result codes
const FIND_FOUND = 0, FIND_NOTFOUND = 1, FIND_WRAPPED = 2;

const isObject = value => !!value && typeof value === "object" && !Array.isArray(value);
const exact = (value, keys) => isObject(value) && Object.keys(value).length === keys.length && Object.keys(value).every(key => keys.includes(key));
const uint = (value, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= 0 && value <= max;
const text = (value, max) => typeof value === "string" && value.length <= max && !value.includes("\0");
const bool = value => typeof value === "boolean";
function webURL(value, { resource = false } = {}) {
  if (typeof value !== "string" || value.length > 4096 || /[\u0000- \u007f]/u.test(value)) return false;
  try {
    const url = new URL(value);
    if (resource && ["data:", "blob:"].includes(url.protocol)) return true;
    return ["http:", "https:"].includes(url.protocol) && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}
const optionalURL = (value, max = 2048) => value === "" || (text(value, max) && webURL(value, { resource: true }));
const webOrigin = value => webURL(value) && new URL(value).origin === value;
const fileName = (value, max = 256) => text(value, max) && !value.includes("/");

const DETAILS = {
  context_menu: value => exact(value, ["x", "y", "type_flags", "link_url", "source_url", "frame_url", "selection_text", "link_text",
    "editable", "edit_flags", "media_type", "media_flags", "misspelled_word", "suggestions", "spellcheck"])
    && uint(value.x, 16384) && uint(value.y, 16384) && uint(value.type_flags, 63)
    && optionalURL(value.link_url) && optionalURL(value.source_url) && optionalURL(value.frame_url, 1024)
    && text(value.selection_text, 257) && text(value.link_text, 129) && bool(value.editable) && uint(value.edit_flags, 511)
    && MEDIA_TYPES.has(value.media_type) && uint(value.media_flags, 8191) && text(value.misspelled_word, 65)
    && Array.isArray(value.suggestions) && value.suggestions.length <= 5 && value.suggestions.every(item => text(item, 64) && item)
    && bool(value.spellcheck),
  dialog: value => exact(value, ["dialog_type", "origin_url", "message", "default_text"])
    && ["alert", "confirm", "prompt"].includes(value.dialog_type) && optionalURL(value.origin_url)
    && text(value.message, 3001) && text(value.default_text, 1025),
  before_unload: value => exact(value, ["dialog_type", "is_reload"]) && value.dialog_type === "beforeunload" && bool(value.is_reload),
  permission: value => exact(value, ["origin", "permissions"]) && webOrigin(value.origin)
    && Array.isArray(value.permissions) && value.permissions.length > 0 && value.permissions.length <= 16
    && value.permissions.every(name => Object.hasOwn(PERMISSIONS, name)) && new Set(value.permissions).size === value.permissions.length,
  file_dialog: value => exact(value, ["mode", "title", "default_name", "filters"]) && Object.hasOwn(FILE_MODES, value.mode)
    && text(value.title, 129) && fileName(value.default_name) && Array.isArray(value.filters) && value.filters.length <= 16
    && value.filters.every(item => exact(item, ["filter", "extensions", "description"]) && text(item.filter, 65) && text(item.description, 65)
      && Array.isArray(item.extensions) && item.extensions.length <= 16 && item.extensions.every(ext => /^\.[^/\\;*\s]{1,15}$/u.test(ext))),
  download: value => exact(value, ["download_id", "suggested_name", "url", "mime_type", "total_bytes"]) && uint(value.download_id, 0xffffffff)
    && fileName(value.suggested_name) && optionalURL(value.url) && text(value.mime_type, 129)
    && Number.isSafeInteger(value.total_bytes) && value.total_bytes >= -1,
  auth: value => exact(value, ["origin", "host", "port", "is_proxy", "realm", "scheme"]) && optionalURL(value.origin)
    && text(value.host, 255) && value.host.length > 0 && uint(value.port, 65535) && bool(value.is_proxy)
    && text(value.realm, 151) && text(value.scheme, 33),
};

/** Strict schema for the delegation events a Chromium host may send. Throws on violation. */
export function validateDelegationEvent(value) {
  const fail = () => { throw new Error("INVALID_CEF_PROMPT"); };
  switch (value?.event) {
    case "prompt":
      if (!PROMPT_ID.test(value.prompt_id ?? "") || !Object.hasOwn(DETAILS, value.kind) || !uint(value.timeout_ms, MAX_TIMEOUT)
          || value.timeout_ms < 1000 || !DETAILS[value.kind](value.details)) fail();
      break;
    case "prompt_closed":
      if (!PROMPT_ID.test(value.prompt_id ?? "") || !CLOSE_REASONS.has(value.reason)) fail();
      break;
    case "download_updated":
      if (!uint(value.download_id, 0xffffffff) || !DOWNLOAD_STATES.has(value.state) || !uint(value.received_bytes) || !uint(value.speed)
          || !Number.isSafeInteger(value.total_bytes) || value.total_bytes < -1 || !bool(value.paused)) fail();
      break;
    case "find_result":
      if (!uint(value.identifier) || !uint(value.count) || !uint(value.active) || !bool(value.final)) fail();
      break;
    case "popup_blocked":
      if (!text(value.url, 2048) || !webURL(value.url)) fail();
      break;
    default: fail();
  }
  return value;
}

const COMMANDS = {
  context_menu_command: fields => CONTEXT_ACTIONS.has(fields.command) && uint(fields.index, 16),
  dialog_reply: fields => bool(fields.accept) && text(fields.text, 4096),
  permission_reply: fields => ["allow", "deny", "dismiss"].includes(fields.decision),
  file_dialog_reply: fields => Array.isArray(fields.paths) && fields.paths.length <= 64
    && fields.paths.every(path => text(path, 4096) && path.startsWith("/")),
  download_reply: fields => text(fields.path, 4096) && (fields.path === "" || fields.path.startsWith("/")),
  auth_reply: fields => bool(fields.accept) && text(fields.username, 1024) && text(fields.password, 1024),
  download_control: fields => uint(fields.download_id, 0xffffffff) && ["cancel", "pause", "resume"].includes(fields.action),
  find: fields => text(fields.text, 1024) && fields.text.length > 0 && bool(fields.forward) && bool(fields.match_case) && bool(fields.find_next),
  stop_finding: fields => bool(fields.clear_selection),
  zoom: fields => Number.isFinite(fields.level) && Math.abs(fields.level) <= 10,
};
const COMMAND_FIELDS = {
  context_menu_command: ["prompt_id", "command", "index"], dialog_reply: ["prompt_id", "accept", "text"],
  permission_reply: ["prompt_id", "decision"], file_dialog_reply: ["prompt_id", "paths"], download_reply: ["prompt_id", "path"],
  auth_reply: ["prompt_id", "accept", "username", "password"], download_control: ["download_id", "action"],
  find: ["text", "forward", "match_case", "find_next"], stop_finding: ["clear_selection"], zoom: ["level"],
};
/** Exact fields of each Zen→host delegation command. Throws on violation. */
export function validateDelegationCommand(method, fields) {
  if (!Object.hasOwn(COMMANDS, method) || !exact(fields, COMMAND_FIELDS[method])
      || (COMMAND_FIELDS[method][0] === "prompt_id" && !PROMPT_ID.test(fields.prompt_id ?? "")) || !COMMANDS[method](fields)) {
    throw new Error("INVALID_CEF_REPLY");
  }
  return { ...fields };
}

/** Chromium zoom level ↔ Firefox zoom factor (Chromium: factor = 1.2 ^ level). */
export const zoomLevel = factor => Math.log(factor) / Math.log(1.2);

// ---- Chromium-scoped site decisions (never Firefox's permission manager) -------
let sharedStore = null;
function defaultPermissionStore() {
  if (sharedStore) return sharedStore;
  const load = (async () => {
    const validate = doc => {
      if (!exact(doc, ["version", "origins"]) || doc.version !== 1 || !isObject(doc.origins)) throw new Error("INVALID_STORE");
      for (const [origin, entry] of Object.entries(doc.origins)) {
        if (!webOrigin(origin) || !isObject(entry)) throw new Error("INVALID_STORE");
        for (const [name, decision] of Object.entries(entry)) {
          if (!(Object.hasOwn(PERMISSIONS, name) || name === "popups") || !["allow", "deny"].includes(decision)) throw new Error("INVALID_STORE");
        }
      }
      return doc;
    };
    return new JsonStore({ storage: profileStorage("chromium/site-permissions.json"), validate, empty: { version: 1, origins: {} } });
  })();
  sharedStore = {
    async get(origin, name) {
      try { return (await (await load).load()).origins[origin]?.[name] ?? null; } catch { return null; }
    },
    async set(origin, name, decision) {
      const store = await load;
      await store.update(doc => ({ ...doc, origins: { ...doc.origins, [origin]: { ...doc.origins[origin], [name]: decision } } }));
    },
  };
  return sharedStore;
}

/** Firefox's DownloadSaver contract, driven by Chromium's own download. */
function chromiumSaverFactory(DownloadSaver, DownloadError) {
  function ChromiumSaver(control) {
    this.control = control; this.ended = null; this.paused = false; this.removed = false; this.deferred = null; this.progress = null;
  }
  ChromiumSaver.prototype = Object.create(DownloadSaver.prototype, { constructor: { value: ChromiumSaver } });
  Object.assign(ChromiumSaver.prototype, {
    execute(setProgressBytes) {
      this.progress = setProgressBytes;
      if (this.ended || this.removed) return Promise.reject(new DownloadError({ message: "Chromium download ended" }));
      // A restart after pause resumes the same native download; Firefox never re-fetches it.
      if (this.paused) { this.paused = false; this.control("resume"); }
      this.deferred = Promise.withResolvers();
      return this.deferred.promise;
    },
    // Firefox pauses by cancelling while keeping partial data, and cancels for
    // real with removePartialData(): pause here, cancel in removeData().
    cancel() {
      if (!this.ended && !this.paused) { this.paused = true; this.control("pause"); }
      this.deferred?.reject(new DownloadError({ message: "Download paused" })); this.deferred = null;
    },
    async removeData() {
      if (this.removed || this.ended === "complete") return;
      this.removed = true;
      if (!this.ended) this.control("cancel");
    },
    update(event) {
      if (event.state === "in_progress") { this.progress?.(event.received_bytes, event.total_bytes, true); return; }
      this.ended = event.state;
      if (event.state === "complete") { this.progress?.(event.received_bytes, event.received_bytes, false); this.deferred?.resolve(); }
      else this.deferred?.reject(new DownloadError({ message: `Chromium download ${event.state}` }));
      this.deferred = null;
    },
    detach() { if (!this.ended) this.update({ state: "interrupted" }); },
    toSerializable() { return null; }, // never persisted, never restarted by Firefox's own network stack
    getSha256Hash() { return null; },
    getSignatureInfo() { return null; },
    getRedirects() { return null; },
  });
  return ChromiumSaver;
}

/** A Firefox findbar backend (the browser.finder interface) for a Chromium tab. */
class ChromiumFinder {
  constructor(ui, record) {
    this.ui = ui; this.record = record; this.listeners = new Set();
    this.searchString = ""; this.caseSensitive = false; this.entireWord = false; this.matchDiacritics = false;
    this.pending = null; this.lastActive = 0; this.lastCount = 0; this.clipboardSearchString = "";
  }
  addResultListener(listener) { this.listeners.add(listener); }
  removeResultListener(listener) { this.listeners.delete(listener); }
  #notify(method, ...args) { for (const listener of [...this.listeners]) { try { listener[method]?.(...args); } catch {} } }
  #find(searchString, forward, findNext) {
    this.searchString = searchString;
    if (!searchString) { this.ui.command(this.record, "stop_finding", { clear_selection: true }); this.#notify("onMatchesCountResult", { total: 0, current: 0, limit: 1000 }); return; }
    this.pending = { searchString, forward, findNext };
    this.ui.command(this.record, "find", { text: searchString.slice(0, 1024), forward, match_case: !!this.caseSensitive, find_next: findNext });
  }
  fastFind(searchString) { this.#find(searchString, true, false); }
  findAgain(searchString, findBackwards) { this.#find(searchString || this.searchString, !findBackwards, true); }
  onResult(event) {
    if (!event.final || !this.pending) return;
    const { searchString, forward, findNext } = this.pending;
    let result = event.count ? FIND_FOUND : FIND_NOTFOUND;
    if (event.count && findNext && ((forward && event.active < this.lastActive) || (!forward && event.active > this.lastActive))) result = FIND_WRAPPED;
    this.lastActive = event.active; this.lastCount = event.count;
    this.#notify("onFindResult", { result, findBackwards: !forward, searchString, storeResult: findNext, linkURL: null, findAgain: findNext, drawOutline: false });
    this.#notify("onMatchesCountResult", { total: event.count, current: event.active, limit: 1000 });
  }
  requestMatchesCount() { this.#notify("onMatchesCountResult", { total: this.lastCount, current: this.lastActive, limit: 1000 }); }
  highlight() {} onHighlightAllChange() {} onModalHighlightChange() {} enableSelection() {} keyPress() {} onFindbarOpen() {}
  removeSelection() { this.ui.command(this.record, "stop_finding", { clear_selection: true }); }
  onFindbarClose() { this.pending = null; this.ui.command(this.record, "stop_finding", { clear_selection: false }); }
  focusContent() { this.ui.hooks.focusContent?.(this.record); }
  getInitialSelection() { this.#notify("onCurrentSelection", "", true); }
  setSearchStringToSelection() { return Promise.resolve({ searchString: "" }); }
  destroy() { this.listeners.clear(); }
}

export class ChromiumBrowserUI {
  #win; #send; #target; #records; #services; #states = new Map(); #restore = []; #disposed = false;
  /**
   * @param win       the Zen browser window
   * @param send      (record, method, fields, target) → Promise; issues one command for that exact target
   * @param target    record → the record's current Chromium target (or null)
   * @param records   () → iterable of the window's Chromium records (browser ↔ record lookup)
   * @param hooks     presenter actions: openTab, openInFirefox, navigate, focusContent, contentElement, currentURL, notice, failure
   * @param services  test seams; production defaults use Firefox's own modules
   */
  constructor(win, { send, target, records = () => [], hooks = {}, services = {} }) {
    if (typeof send !== "function" || typeof target !== "function") throw new TypeError("CHROMIUM_UI_ARGUMENTS");
    this.#win = win; this.#send = send; this.#target = target; this.#records = records;
    this.hooks = hooks; this.#services = services;
    this.#installZoom();
    // TabSelect bubbles to the window. Firefox's ZoomUI updates asynchronously for
    // the (blank) Gecko browser first; the Chromium tab's own level is applied after.
    const onSelect = () => { for (const delay of [0, 150]) this.#win.setTimeout?.(() => { if (!this.#disposed) this.#updateZoomUI(); }, delay); };
    win.addEventListener?.("TabSelect", onSelect);
    this.#restore.push(() => win.removeEventListener?.("TabSelect", onSelect));
  }

  // ---- services (Firefox defaults, injectable for tests) ---------------------------
  get #Ci() { return this.#services.Ci ?? globalThis.Ci; }
  get #Services() { return this.#services.Services ?? this.#win.Services ?? globalThis.Services; }
  #import(url) { return (this.#services.importModule ?? (value => globalThis.ChromeUtils.importESModule(value)))(url); }
  #store() { return this.#services.permissionStore ?? defaultPermissionStore(); }
  #prefBool(name, fallback) { try { return this.#Services.prefs.getBoolPref(name, fallback); } catch { return fallback; } }
  #prefInt(name, fallback) { try { return this.#Services.prefs.getIntPref(name, fallback); } catch { return fallback; } }
  #now() { return (this.#services.now ?? Date.now)(); }
  #string(key, args, fallback) {
    // Firefox's own localized strings where they exist; plain English otherwise.
    try {
      const bundle = this.#win.gNavigatorBundle;
      if (key && bundle) return args ? bundle.getFormattedString(key, args) : bundle.getString(key);
    } catch {}
    let index = 0;
    return args ? fallback.replace(/%(?:(\d)\$)?S/gu, (_, n) => args[n ? Number(n) - 1 : index++] ?? "") : fallback;
  }
  #bundleString(url, key, args, fallback) {
    try {
      const bundle = this.#Services.strings.createBundle(url);
      return args ? bundle.formatStringFromName(key, args) : bundle.GetStringFromName(key);
    } catch { return this.#string(null, args, fallback); }
  }

  #state(record) {
    let state = this.#states.get(record);
    if (!state) {
      state = { prompts: new Map(), dialog: { lastClosed: 0, disabled: false }, downloads: new Map(),
        blockedPopups: [], finder: null, restoreFinder: null, zoom: 1, cert: null };
      this.#states.set(record, state);
      this.#installFinder(record, state);
    }
    return state;
  }

  /** Called by the presenter for every event of a Chromium record. True when consumed. */
  handle(record, event) {
    if (this.#disposed || !record || !event) return false;
    const state = this.#state(record);
    switch (event.event) {
      case "prompt": this.#prompt(record, state, event); return true;
      case "prompt_closed": this.#closeLocal(state, event.prompt_id); return true;
      case "download_updated": state.downloads.get(event.download_id)?.update(event); return true;
      case "find_result": state.finder?.onResult(event); return true;
      case "popup_blocked": this.#popupBlocked(record, state, event.url).catch(error => this.hooks.failure?.(error)); return true;
      case "navigation":
        for (const [id, prompt] of state.prompts) if (prompt.kind !== "download") this.#closeLocal(state, id);
        state.dialog = { lastClosed: 0, disabled: false };
        state.blockedPopups = [];
        this.#removePopupBar(record);
        return false;
      case "load":
        this.#hideCertificateError(state);
        if (state.zoom !== 1) this.command(record, "zoom", { level: zoomLevel(state.zoom) });
        return false;
      case "closed":
        for (const id of [...state.prompts.keys()]) this.#closeLocal(state, id);
        return false;
      case "error":
        if (event.code === "certificate_error") return this.#certificateError(record, state, event);
        // Chromium reports the refused certificate, then the cancelled load.
        if (event.code === "load_failed" && state.cert && !state.cert.panel.hidden) return true;
        if (NOTICES[event.code]) { this.hooks.notice?.(record, NOTICES[event.code]); return true; }
        return false;
      default: return false;
    }
  }

  /** The record left this window (tab closed, engine switched, window closed). */
  forget(record) {
    const state = this.#states.get(record);
    if (!state) return;
    this.#states.delete(record);
    for (const id of [...state.prompts.keys()]) this.#closeLocal(state, id);
    for (const saver of state.downloads.values()) saver.detach?.();
    state.restoreFinder?.();
    state.cert?.panel.remove();
    this.#removePopupBar(record);
    if (this.#win.gBrowser?.selectedBrowser === record.browser) this.#updateZoomUI();
  }

  dispose() {
    if (this.#disposed) return;
    for (const record of [...this.#states.keys()]) this.forget(record);
    this.#disposed = true;
    for (const restore of this.#restore.reverse()) { try { restore(); } catch {} }
  }

  /** Non-prompt command for a record's current target (find, zoom, download control). */
  command(record, method, fields) {
    const target = this.#target(record);
    if (!target) return Promise.resolve(null);
    let validated;
    try { validated = validateDelegationCommand(method, fields); } catch (error) { return Promise.reject(error); }
    return Promise.resolve().then(() => this.#send(record, method, validated, target)).catch(() => null);
  }

  // ---- prompt bookkeeping: single use, bound to the issuing target -------------------
  #prompt(record, state, event) {
    const id = event.prompt_id;
    if (state.prompts.has(id)) return; // a replayed prompt_id never opens a second UI
    const prompt = { id, kind: event.kind, target: event.target ?? this.#target(record), answered: false, close: () => {} };
    state.prompts.set(id, prompt);
    // Local backstop in case the host cannot report its own timeout.
    prompt.timer = this.#win.setTimeout?.(() => this.#closeLocal(state, id), Math.min(event.timeout_ms, MAX_TIMEOUT) + 1000);
    const run = {
      context_menu: () => this.#contextMenu(record, state, prompt, event.details),
      dialog: () => this.#dialog(record, state, prompt, event.details),
      before_unload: () => this.#beforeUnload(record, state, prompt, event.details),
      permission: () => this.#permission(record, state, prompt, event.details),
      file_dialog: () => this.#fileDialog(record, state, prompt, event.details),
      download: () => this.#download(record, state, prompt, event.details),
      auth: () => this.#auth(record, state, prompt, event.details),
    }[event.kind];
    Promise.resolve().then(run).catch(error => {
      // Any local failure answers with the safe default instead of leaving the page waiting.
      this.hooks.failure?.(error);
      this.#answer(record, state, prompt, this.#denial(prompt.kind));
    });
  }
  #denial(kind) {
    return { context_menu: ["context_menu_command", { command: "dismiss", index: 0 }], dialog: ["dialog_reply", { accept: false, text: "" }],
      before_unload: ["dialog_reply", { accept: false, text: "" }], permission: ["permission_reply", { decision: "dismiss" }],
      file_dialog: ["file_dialog_reply", { paths: [] }], download: ["download_reply", { path: "" }],
      auth: ["auth_reply", { accept: false, username: "", password: "" }] }[kind];
  }
  /** Sends the one reply for a prompt. Later calls, and calls after it closed, do nothing. */
  #answer(record, state, prompt, [method, fields]) {
    if (prompt.answered || state.prompts.get(prompt.id) !== prompt) return Promise.resolve(false);
    prompt.answered = true;
    this.#closeLocal(state, prompt.id);
    let validated;
    try { validated = validateDelegationCommand(method, { prompt_id: prompt.id, ...fields }); }
    catch {
      // An unrepresentable answer (e.g. oversized) becomes the safe default.
      [method, fields] = this.#denial(prompt.kind);
      validated = validateDelegationCommand(method, { prompt_id: prompt.id, ...fields });
    }
    return Promise.resolve().then(() => this.#send(record, method, validated, prompt.target)).then(() => true, () => false);
  }
  #closeLocal(state, id) {
    const prompt = state.prompts.get(id);
    if (!prompt) return;
    state.prompts.delete(id);
    prompt.answered = true;
    this.#win.clearTimeout?.(prompt.timer);
    try { prompt.close(); } catch {}
  }
  #live(state, prompt) { return !prompt.answered && state.prompts.get(prompt.id) === prompt; }

  // ---- 1. context menu ----------------------------------------------------------------
  #contextMenu(record, state, prompt, details) {
    const doc = this.#win.document;
    const popup = doc.createXULElement("menupopup");
    popup.id = "axiosozo-chromium-context-menu";
    popup.setAttribute("aria-label", "Chromium page context menu");
    let chosen = false;
    const add = (l10n, label, action, { disabled = false, local = null, index = 0, args = null } = {}) => {
      const item = doc.createXULElement("menuitem");
      item.setAttribute("label", label);
      if (l10n) { item.setAttribute("data-l10n-id", l10n); if (args) item.setAttribute("data-l10n-args", JSON.stringify(args)); }
      if (disabled) item.setAttribute("disabled", "true");
      item.dataset.action = action;
      item.addEventListener("command", () => {
        chosen = true;
        if (local) { this.#answer(record, state, prompt, ["context_menu_command", { command: "dismiss", index: 0 }]); local(); }
        else this.#answer(record, state, prompt, ["context_menu_command", { command: action, index }]);
      });
      popup.appendChild(item);
      return item;
    };
    const separator = () => { if (popup.lastChild && popup.lastChild.localName !== "menuseparator") popup.appendChild(doc.createXULElement("menuseparator")); };
    const link = details.link_url, source = details.source_url, selection = details.selection_text;
    const edit = flag => (details.edit_flags & flag) !== 0;
    const onLink = !!link, onImage = details.media_type === "image" && !!source;
    const webLink = webURL(link) ? link : null;
    if (details.misspelled_word) {
      details.suggestions.forEach((word, index) => add(null, word, "spelling", { index }));
      if (!details.suggestions.length) add("text-action-spell-no-suggestions", "No Spelling Suggestions", "none", { disabled: true });
      add("text-action-spell-add-to-dictionary", "Add to Dictionary", "add_to_dictionary");
      separator();
    }
    if (onLink) {
      if (webLink) add("main-context-menu-open-link-new-tab", "Open Link in New Tab", "open_link_new_tab",
        { local: () => this.hooks.openTab?.(record, webLink, this.#prefBool("browser.tabs.loadInBackground", true)) });
      add("main-context-menu-save-link", "Save Link As…", "save_link");
      add("main-context-menu-copy-link-simple", "Copy Link", "copy_link", { local: () => this.#copy(link) });
      separator();
    }
    if (onImage) {
      add("main-context-menu-image-copy", "Copy Image", "copy_image");
      add("main-context-menu-image-copy-link", "Copy Image Link", "copy_image_link", { local: () => this.#copy(source) });
      add("main-context-menu-image-save-as", "Save Image As…", "save_image");
      separator();
    }
    if (details.editable) {
      add("text-action-undo", "Undo", "undo", { disabled: !edit(1) });
      add("text-action-redo", "Redo", "redo", { disabled: !edit(2) });
      separator();
      add("text-action-cut", "Cut", "cut", { disabled: !edit(4) });
      add("text-action-copy", "Copy", "copy", { disabled: !edit(8) });
      add("text-action-paste", "Paste", "paste", { disabled: !edit(16) });
      separator();
      add("text-action-select-all", "Select All", "select_all", { disabled: !edit(64) });
    } else if (selection) {
      add("text-action-copy", "Copy", "copy");
      add("text-action-select-all", "Select All", "select_all");
    } else if (!onLink && !onImage) {
      const loading = record.loading ?? {};
      add("main-context-menu-back-mac", "Back", "back", { disabled: !loading.can_go_back, local: () => this.hooks.navigate?.(record, "back") });
      add("main-context-menu-forward-mac", "Forward", "forward", { disabled: !loading.can_go_forward, local: () => this.hooks.navigate?.(record, "forward") });
      add("main-context-menu-reload-mac", "Reload", "reload", { local: () => this.hooks.navigate?.(record, "reload") });
      separator();
      add("text-action-select-all", "Select All", "select_all");
    }
    const searchTerms = (selection || (onLink ? details.link_text : "")).trim();
    if (searchTerms && !details.editable) {
      separator();
      const item = add(null, "Search the web", "search", { local: () => this.#search(record, searchTerms) });
      this.#searchLabel(searchTerms).then(label => { if (label) item.setAttribute("label", label); }).catch(() => {});
    }
    separator();
    add(null, "Open Page in Firefox", "open_in_firefox", { local: () => this.hooks.openInFirefox?.(record) });
    const inspect = add("main-context-menu-inspect", "Inspect", "inspect", { disabled: true });
    inspect.setAttribute("tooltiptext", "Developer tools aren't available for Chromium tabs yet");
    popup.addEventListener("popuphidden", event => {
      if (event.target !== popup) return;
      popup.remove();
      if (!chosen) this.#answer(record, state, prompt, ["context_menu_command", { command: "dismiss", index: 0 }]);
    });
    prompt.close = () => { chosen = true; if (popup.state === "open" || popup.state === "showing") popup.hidePopup?.(); popup.remove(); };
    (doc.getElementById("mainPopupSet") ?? doc.documentElement).appendChild(popup);
    const anchor = this.hooks.contentElement?.(record);
    const rect = anchor?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
    popup.openPopupAtScreen?.(Math.round((this.#win.mozInnerScreenX ?? 0) + rect.left + details.x),
      Math.round((this.#win.mozInnerScreenY ?? 0) + rect.top + details.y), true);
    state.contextMenu = popup;
  }
  #copy(value) {
    const helper = this.#services.clipboard
      ?? globalThis.Cc?.["@mozilla.org/widget/clipboardhelper;1"]?.getService(this.#Ci.nsIClipboardHelper);
    helper?.copyString(value);
  }
  async #engine() {
    if (this.#services.search) return this.#services.search;
    const { SearchService } = this.#import("moz-src:///toolkit/components/search/SearchService.sys.mjs");
    await SearchService.init?.();
    const engine = SearchService.defaultEngine;
    return { name: engine.name, submission: terms => {
      const submission = engine.getSubmission(terms);
      return { url: submission.uri.spec, postData: submission.postData ?? null };
    } };
  }
  async #searchLabel(terms) {
    const engine = await this.#engine();
    const shown = terms.length > 15 ? `${terms.slice(0, 15)}…` : terms;
    return this.#string("contextMenuSearch", [engine.name, shown], "Search %1$S for “%2$S”");
  }
  async #search(record, terms) {
    const { url, postData } = (await this.#engine()).submission(terms);
    // A GET result opens beside the page in Chromium; a POST engine opens in Firefox.
    if (!postData && webURL(url)) this.hooks.openTab?.(record, url, this.#prefBool("browser.search.context.loadInBackground", false));
    else this.hooks.openInFirefoxTab?.(url, postData);
  }

  // ---- 2. JavaScript dialogs --------------------------------------------------------
  #dialogsAbused(state) {
    // Firefox's rule (BrowsingContextGroup::DialogsAreBeingAbused): another dialog
    // within dom.successive_dialog_time_limit seconds offers to block further ones.
    const limit = this.#prefInt("dom.successive_dialog_time_limit", 3) * 1000;
    return state.dialog.lastClosed > 0 && this.#now() - state.dialog.lastClosed < limit;
  }
  #principal(origin) {
    try {
      const Services = this.#Services;
      return Services.scriptSecurityManager.createContentPrincipal(Services.io.newURI(origin), {});
    } catch { return null; }
  }
  async #dialog(record, state, prompt, details) {
    if (state.dialog.disabled) {
      // "Prevent this page from creating additional dialogs": answered as cancelled, never shown.
      await this.#answer(record, state, prompt, ["dialog_reply", { accept: false, text: "" }]);
      return;
    }
    const COMMON = "chrome://global/locale/commonDialogs.properties";
    const origin = webURL(details.origin_url) ? new URL(details.origin_url) : null;
    const abused = this.#dialogsAbused(state);
    const checkLabel = abused ? (origin
      ? this.#bundleString(COMMON, "ScriptDialogLabelContentPrincipal", [origin.host], "Don’t allow %S to prompt you again")
      : this.#bundleString(COMMON, "ScriptDialogLabelNullPrincipal", null, "Don’t allow this site to prompt you again")) : null;
    const type = details.dialog_type;
    const args = {
      promptType: abused && type !== "prompt" ? `${type}Check` : type,
      title: origin ? this.#bundleString(COMMON, "ScriptDlgHeading", [origin.host], "The page at %S says:")
        : this.#bundleString(COMMON, "ScriptDlgNullPrincipalHeading", null, "This page says:"),
      text: details.message, value: details.default_text, checkLabel, checked: false,
      modalType: this.#Ci?.nsIPrompt?.MODAL_TYPE_CONTENT ?? 3,
      promptPrincipal: origin ? this.#principal(origin.origin) : null,
    };
    const result = await this.#openDialog(record, state, prompt, args);
    if (!result) return;
    state.dialog.lastClosed = this.#now();
    if (abused && result.checked) state.dialog.disabled = true;
    await this.#answer(record, state, prompt, ["dialog_reply", { accept: !!result.ok, text: type === "prompt" && result.ok ? String(result.value ?? "").slice(0, 4096) : "" }]);
  }
  async #beforeUnload(record, state, prompt) {
    const DOM = "chrome://global/locale/dom/dom.properties";
    const args = {
      promptType: "confirmEx", inPermitUnload: true,
      title: this.#bundleString(DOM, "OnBeforeUnloadTitle", null, "Are you sure?"),
      text: this.#bundleString(DOM, "OnBeforeUnloadMessage2", null, "This page is asking you to confirm that you want to leave — information you’ve entered may not be saved."),
      button0Label: this.#bundleString(DOM, "OnBeforeUnloadLeaveButton", null, "Leave page"),
      button1Label: this.#bundleString(DOM, "OnBeforeUnloadStayButton", null, "Stay on page"),
      defaultButtonNum: 0, modalType: this.#Ci?.nsIPrompt?.MODAL_TYPE_CONTENT ?? 3,
    };
    const result = await this.#openDialog(record, state, prompt, args);
    if (!result) return;
    await this.#answer(record, state, prompt, ["dialog_reply", { accept: result.buttonNumClicked === 0 && !result.promptAborted, text: "" }]);
  }
  /** Firefox's tab/content-modal commonDialog over the tab, as content prompts use. */
  async #openDialog(record, state, prompt, args) {
    const opened = this.#services.openDialog
      ? this.#services.openDialog(record, args)
      : this.#tabDialog(record, args);
    prompt.close = () => opened.abort();
    const result = await opened.closed;
    return this.#live(state, prompt) ? result : null;
  }
  #tabDialog(record, args) {
    const { PromptUtils } = this.#import("resource://gre/modules/PromptUtils.sys.mjs");
    // As Prompter.sys.mjs does: every result key is in the bag with its safe
    // default, and propBagToObject(bag, obj) copies obj's keys back (it returns
    // nothing; E1 2026-09-30 found alerts never answered because of that).
    const result = { ok: false, value: "", checked: false, buttonNumClicked: 1, user: "", pass: "", ...args,
      openedWithTabDialog: true, promptAborted: false };
    const bag = PromptUtils.objectToPropBag(result);
    const box = this.#win.gBrowser.getTabDialogBox(record.browser);
    const { dialog, closedPromise } = box.open("chrome://global/content/commonDialog.xhtml",
      { features: "resizable=no", modalType: args.modalType }, bag);
    return { closed: closedPromise.then(() => { PromptUtils.propBagToObject(bag, result); return result; }), abort: () => dialog?.abort() };
  }

  // ---- 3. permissions -----------------------------------------------------------------
  async #permission(record, state, prompt, details) {
    const store = this.#store(), origin = details.origin;
    const remembered = await Promise.all(details.permissions.map(name => store.get(origin, name)));
    if (!this.#live(state, prompt)) return;
    if (remembered.includes("deny")) { await this.#answer(record, state, prompt, ["permission_reply", { decision: "deny" }]); return; }
    if (remembered.every(value => value === "allow")) { await this.#answer(record, state, prompt, ["permission_reply", { decision: "allow" }]); return; }
    const first = details.permissions[0];
    const [key, fallback, anchor] = PERMISSIONS[first];
    const host = new URL(origin).host;
    const message = details.permissions.length === 1 ? this.#string(key, ["<>"], fallback.replace("%S", "<>"))
      : `Allow <> to use: ${details.permissions.map(name => name.replaceAll("_", " ")).join(", ")}?`;
    const remember = checked => checked ? Promise.all(details.permissions.map(name => store.set(origin, name, checked))).catch(() => {}) : null;
    const notifications = this.#services.popupNotifications ?? this.#win.PopupNotifications;
    const notification = notifications.show(record.browser, `axiosozo-chromium-${prompt.id}`, message, anchor, {
      label: this.#string("geolocation.allow", null, "Allow"), accessKey: this.#string("geolocation.allow.accesskey", null, "A"),
      callback: ({ checkboxChecked } = {}) => { remember(checkboxChecked && "allow"); this.#answer(record, state, prompt, ["permission_reply", { decision: "allow" }]); },
    }, [{
      label: this.#string("geolocation.block", null, "Block"), accessKey: this.#string("geolocation.block.accesskey", null, "B"),
      callback: ({ checkboxChecked } = {}) => { remember(checkboxChecked && "deny"); this.#answer(record, state, prompt, ["permission_reply", { decision: "deny" }]); },
    }], {
      name: host, persistent: true, hideClose: true,
      checkbox: { label: this.#string("geolocation.remember", null, "Remember this decision"), checked: false, show: true },
      eventCallback: topic => {
        if (topic === "removed") this.#answer(record, state, prompt, ["permission_reply", { decision: "dismiss" }]);
      },
    });
    prompt.close = () => notification?.remove?.();
  }

  // ---- 4. file picker ---------------------------------------------------------------
  #fileDialog(record, state, prompt, details) {
    const Ci = this.#Ci;
    const picker = this.#services.filePicker?.() ?? globalThis.Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
    const mode = Ci.nsIFilePicker[FILE_MODES[details.mode]];
    picker.init(this.#win.browsingContext, details.title || "", mode);
    for (const filter of details.filters) {
      if (filter.extensions.length) picker.appendFilter(filter.description || filter.filter, filter.extensions.map(ext => `*${ext}`).join(";"));
      else if (filter.filter === "image/*") picker.appendFilters(Ci.nsIFilePicker.filterImages);
      else if (filter.filter === "audio/*") picker.appendFilters(Ci.nsIFilePicker.filterAudio);
      else if (filter.filter === "video/*") picker.appendFilters(Ci.nsIFilePicker.filterVideo);
    }
    if (details.filters.length && details.mode !== "open_folder") picker.appendFilters(Ci.nsIFilePicker.filterAll);
    if (details.default_name) picker.defaultString = details.default_name;
    // The native sheet cannot be withdrawn; a late result after close is discarded.
    return new Promise(resolve => picker.open(result => {
      resolve();
      if (!this.#live(state, prompt)) return;
      if (result === Ci.nsIFilePicker.returnCancel) { this.#answer(record, state, prompt, ["file_dialog_reply", { paths: [] }]); return; }
      // Only paths the user chose in Firefox's own picker ever reach Chromium.
      const paths = details.mode === "open_multiple" ? [...picker.files].map(file => file.path) : [picker.file?.path].filter(Boolean);
      const reply = ["file_dialog_reply", { paths }];
      try { validateDelegationCommand("file_dialog_reply", { prompt_id: prompt.id, paths }); }
      catch { reply[1] = { paths: [] }; }
      this.#answer(record, state, prompt, reply);
    }));
  }

  // ---- 5. downloads -----------------------------------------------------------------
  async #downloadTarget(name) {
    if (this.#services.downloadTarget) return this.#services.downloadTarget(name);
    const { Downloads } = this.#import("resource://gre/modules/Downloads.sys.mjs");
    const { DownloadPaths } = this.#import("resource://gre/modules/DownloadPaths.sys.mjs");
    const directory = await Downloads.getPreferredDownloadsDirectory();
    const safe = DownloadPaths.sanitize(name) || "download";
    if (!this.#prefBool("browser.download.useDownloadDir", true)) {
      const Ci = this.#Ci;
      const picker = globalThis.Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
      picker.init(this.#win.browsingContext, null, Ci.nsIFilePicker.modeSave);
      picker.defaultString = safe;
      try { picker.displayDirectory = new this.#win.FileUtils.File(directory); } catch {}
      const result = await new Promise(resolve => picker.open(resolve));
      return result === Ci.nsIFilePicker.returnCancel ? "" : picker.file?.path ?? "";
    }
    // Never overwrite: pick "name(1).ext" like Firefox, without creating a placeholder.
    const [base, extension] = DownloadPaths.splitBaseNameAndExtension(safe);
    for (let index = 0; index < 10000; index++) {
      const candidate = this.#win.PathUtils.join(directory, index ? `${base}(${index})${extension}` : safe);
      if (!(await this.#win.IOUtils.exists(candidate))) return candidate;
    }
    return "";
  }
  async #download(record, state, prompt, details) {
    const path = await this.#downloadTarget(details.suggested_name);
    if (!this.#live(state, prompt)) return;
    const accepted = await this.#answer(record, state, prompt, ["download_reply", { path }]);
    if (!accepted || !path) return;
    const control = action => this.command(record, "download_control", { download_id: details.download_id, action });
    const saver = this.#services.registerDownload
      ? await this.#services.registerDownload({ url: details.url, path, contentType: details.mime_type, control })
      : await this.#registerDownload({ url: details.url || (this.hooks.currentURL?.(record) ?? ""), path, contentType: details.mime_type, control });
    if (saver && this.#states.get(record) === state) state.downloads.set(details.download_id, saver);
    else saver?.detach?.();
  }
  /** Shows a Chromium download in Firefox's downloads panel (not persisted across restarts). */
  async #registerDownload({ url, path, contentType, control }) {
    const { Downloads } = this.#import("resource://gre/modules/Downloads.sys.mjs");
    const { Download, DownloadSource, DownloadTarget, DownloadSaver, DownloadError } = this.#import("resource://gre/modules/DownloadCore.sys.mjs");
    const ChromiumSaver = chromiumSaverFactory(DownloadSaver, DownloadError);
    const download = new Download();
    download.source = DownloadSource.fromSerializable({ url: webURL(url, { resource: true }) ? url : "about:blank", isPrivate: false });
    download.target = DownloadTarget.fromSerializable({ path });
    download.saver = new ChromiumSaver(control);
    download.saver.download = download;
    download.contentType = contentType || null;
    download.tryToKeepPartialData = true;
    const list = await Downloads.getList(Downloads.PUBLIC);
    await list.add(download);
    download.start().catch(() => {});
    return download.saver;
  }

  // ---- 6. HTTP authentication -------------------------------------------------------
  async #auth(record, state, prompt, details) {
    const COMMON = "chrome://global/locale/commonDialogs.properties";
    const shown = details.origin || `${details.host}:${details.port}`;
    const realm = details.realm.length > 150 ? details.realm.slice(0, 150) : details.realm;
    const args = {
      promptType: "promptUserAndPass",
      title: this.#bundleString(COMMON, "PromptUsernameAndPassword3", [this.#brandName()], "Authentication Required - %S"),
      text: details.is_proxy ? this.#bundleString(COMMON, "EnterLoginForProxy3", [realm, shown], "The proxy %2$S is requesting a username and password. The site says: “%1$S”")
        : this.#bundleString(COMMON, "EnterCredentials", null, "This site is asking you to sign in."),
      user: "", pass: "", checkLabel: null, checked: false, authOrigin: shown,
      isInsecureAuth: details.origin.startsWith("http:"), modalType: this.#Ci?.nsIPrompt?.MODAL_TYPE_TAB ?? 2,
    };
    // Nothing is read from or saved into Firefox's password manager.
    const result = await this.#openDialog(record, state, prompt, args);
    if (!result) return;
    const accept = !!result.ok;
    await this.#answer(record, state, prompt, ["auth_reply", { accept, username: accept ? String(result.user ?? "").slice(0, 1024) : "",
      password: accept ? String(result.pass ?? "").slice(0, 1024) : "" }]);
  }
  #brandName() {
    try { return this.#Services.strings.createBundle("chrome://branding/locale/brand.properties").GetStringFromName("brandShortName"); }
    catch { return "Zen"; }
  }

  // ---- 7. certificate errors (no bypass) ------------------------------------------------
  #certificateError(record, state, event) {
    const host = this.hooks.contentElement?.(record);
    if (!host) return false;
    const doc = this.#win.document, XHTML = "http://www.w3.org/1999/xhtml";
    try { this.#win.MozXULElement?.insertFTLIfNeeded?.("toolkit/neterror/certError.ftl"); } catch {}
    if (!state.cert) {
      const element = (tag, parent, className) => { const node = doc.createElementNS(XHTML, tag); if (className) node.className = className; parent.appendChild(node); return node; };
      const panel = element("div", host, "axiosozo-cef-panel axiosozo-cef-certerror");
      panel.setAttribute("role", "alert");
      const title = element("h1", panel), intro = element("p", panel), code = element("p", panel), actions = element("div", panel);
      const back = element("button", actions, "primary"), firefox = element("button", actions);
      back.addEventListener("click", () => {
        if (record.loading?.can_go_back) this.hooks.navigate?.(record, "back");
        else this.hooks.openInFirefox?.(record);
      });
      firefox.addEventListener("click", () => this.hooks.openInFirefox?.(record));
      state.cert = { panel, title, intro, code, back, firefox };
    }
    const { panel, title, intro, code, back, firefox } = state.cert;
    let hostname = "";
    try { hostname = new URL(this.hooks.currentURL?.(record) ?? "").hostname; } catch {}
    const name = `NET::${CERT_ERRORS[event.native_code] ?? "ERR_CERT_INVALID"}`;
    const set = (node, id, args, fallback) => {
      node.textContent = fallback;
      if (doc.l10n && id) doc.l10n.setAttributes(node, id, args ?? undefined);
    };
    set(title, "fp-certerror-body-title", null, "Be careful. Something doesn’t look right.");
    set(intro, "fp-certerror-intro", { hostname }, `Chromium could not verify ${hostname || "this site"}'s certificate and did not load it. Someone pretending to be the site could try to steal things like credit card info, passwords, or emails.`);
    set(code, "cert-error-code-prefix", { error: name }, `Error code: ${name}`);
    set(back, "fp-certerror-return-to-previous-page-recommended-button-2", null, "Go back (Recommended)");
    firefox.textContent = "Open in Firefox for details";
    panel.hidden = false;
    return true;
  }
  #hideCertificateError(state) { if (state.cert) state.cert.panel.hidden = true; }

  // ---- 8. blocked pop-ups -------------------------------------------------------------
  #pageOrigin(record) {
    try { const url = new URL(this.hooks.currentURL?.(record) ?? ""); return webOrigin(url.origin) ? url.origin : null; } catch { return null; }
  }
  async #popupBlocked(record, state, url) {
    const origin = this.#pageOrigin(record);
    if (origin && await this.#store().get(origin, "popups") === "allow") { this.hooks.openTab?.(record, url, false); return; }
    if (!this.#prefBool("privacy.popups.showBrowserMessage", true) || this.#states.get(record) !== state) return;
    if (state.blockedPopups.length < 20) state.blockedPopups.push(url);
    const box = this.#win.gBrowser?.getNotificationBox?.(record.browser);
    if (!box) return;
    const label = { "l10n-id": "popup-warning-message", "l10n-args": { popupCount: state.blockedPopups.length } };
    const existing = box.getNotificationWithValue("popup-blocked");
    if (existing) { existing.label = label; return; }
    const openAll = () => { for (const blocked of state.blockedPopups.splice(0)) this.hooks.openTab?.(record, blocked, true); };
    const buttons = [{ label: `Show “${url.length > 60 ? `${url.slice(0, 60)}…` : url}”`, accessKey: "S", callback: openAll }];
    if (origin) buttons.unshift({ label: `Allow pop-ups for ${new URL(origin).host}`, accessKey: "A",
      callback: () => { this.#store().set(origin, "popups", "allow").catch(() => {}); openAll(); } });
    await box.appendNotification("popup-blocked",
      { label, image: "chrome://browser/skin/notification-icons/popup.svg", priority: box.PRIORITY_INFO_MEDIUM }, buttons);
  }
  #removePopupBar(record) {
    try {
      const box = this.#win.gBrowser?.getNotificationBox?.(record.browser);
      const existing = box?.getNotificationWithValue("popup-blocked");
      if (existing) box.removeNotification(existing);
    } catch {}
  }

  // ---- 9. find bar and zoom ---------------------------------------------------------------
  #installFinder(record, state) {
    const browser = record.browser;
    if (!browser || typeof browser !== "object") return;
    const finder = new ChromiumFinder(this, record);
    const gBrowser = this.#win.gBrowser, tab = record.tab;
    let findbar = null;
    try { if (gBrowser?.isFindBarInitialized?.(tab)) findbar = gBrowser.getCachedFindBar(tab); } catch {}
    try { if (findbar) browser.finder?.removeResultListener(findbar); } catch {}
    // An own property shadows MozBrowser's finder getter for this tab only.
    Object.defineProperty(browser, "finder", { configurable: true, get: () => finder });
    if (findbar) finder.addResultListener(findbar);
    state.finder = finder;
    state.restoreFinder = () => {
      const listeners = [...finder.listeners];
      finder.destroy();
      delete browser.finder;
      try { for (const listener of listeners) browser.finder?.addResultListener(listener); } catch {}
    };
  }
  #recordFor(browser) {
    for (const record of this.#records() ?? []) if (record.browser === browser && this.#states.has(record)) return record;
    return null;
  }
  #zoomValues() {
    const values = this.#win.ZoomManager?.zoomValues;
    return Array.isArray(values) && values.length ? values : [0.3, 0.5, 0.67, 0.8, 0.9, 1, 1.1, 1.2, 1.33, 1.5, 1.7, 2, 2.4, 3, 4, 5];
  }
  #setZoom(record, factor) {
    const values = this.#zoomValues();
    const state = this.#state(record);
    state.zoom = Math.min(values.at(-1), Math.max(values[0], factor));
    this.command(record, "zoom", { level: zoomLevel(state.zoom) });
    this.#updateZoomUI();
  }
  #installZoom() {
    const FullZoom = this.#win.FullZoom;
    if (!FullZoom) return;
    const ui = this;
    const wrap = (method, replacement) => {
      const original = FullZoom[method];
      if (typeof original !== "function") return;
      const wrapped = function(...args) {
        const browser = method === "setZoom" ? args[1] : args[0];
        const record = ui.#recordFor(browser ?? ui.#win.gBrowser?.selectedBrowser);
        return record ? replacement(record, args) : original.apply(this, args);
      };
      FullZoom[method] = wrapped;
      this.#restore.push(() => { if (FullZoom[method] === wrapped) FullZoom[method] = original; });
    };
    const step = (record, direction) => {
      const values = this.#zoomValues(), current = this.#state(record).zoom;
      const next = direction > 0 ? values.find(value => value > current + 1e-6) : values.findLast(value => value < current - 1e-6);
      this.#setZoom(record, next ?? current);
    };
    wrap("enlarge", record => step(record, 1));
    wrap("reduce", record => step(record, -1));
    wrap("reset", record => this.#setZoom(record, 1));
    wrap("resetScalingZoom", () => {});
    wrap("setZoom", (record, [value]) => { if (Number.isFinite(value) && value > 0) this.#setZoom(record, value); });
  }
  /** Firefox's URL-bar zoom indicator, following ZoomUI.updateZoomUI for a Chromium tab. */
  #updateZoomUI() {
    const doc = this.#win.document, gBrowser = this.#win.gBrowser;
    const record = this.#recordFor(gBrowser?.selectedBrowser);
    if (!record || !doc?.getElementById) return;
    const percent = Math.round(this.#state(record).zoom * 100);
    const label = this.#string("zoom-button.label", [percent], "%S%");
    const button = doc.getElementById("urlbar-zoom-button");
    if (button) {
      button.hidden = percent === 100;
      button.setAttribute("label", label);
      button.setAttribute("aria-label", this.#string("zoom-button.aria-label", [percent], "%S%, Reset zoom level"));
    }
    doc.getElementById("appMenu-zoomReset-button2")?.setAttribute("label", label);
    doc.getElementById("zoom-reset-button")?.setAttribute("label", label);
  }
}
