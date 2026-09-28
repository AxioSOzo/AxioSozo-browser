/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

/** Privileged browser-chrome only. No actor, DOM event, or website IPC listener. */
// A restored, not yet remote <browser> has no document: its contentPrincipal
// getter then throws (contentDocument is null) instead of returning null.
function principalOrigin(browser) {
  try { return browser?.contentPrincipal?.origin ?? null; } catch { return null; }
}

export class GeckoEngineAdapter {
  constructor(win, { emit = () => {}, uuid = () => win.Services.uuid.generateUUID().toString().replace(/[{}]/g, "") } = {}) {
    this.window = win;
    this.emit = emit;
    this.uuid = uuid;
    this.instance = uuid();
    this.tabs = new Map();
    this.listener = {
      onLocationChange: (browser, progress, request, uri, flags) => {
        if (!progress.isTopLevel) return;
        const record = this.find(browser);
        if (!record) return;
        // Same-document changes update the URL, but do not mint a new document.
        if (!(flags & win.Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT)) record.document++;
        this.send(record, "url");
      },
      onStateChange: (browser, progress, request, flags) => {
        if (!progress.isTopLevel || !(flags & win.Ci.nsIWebProgressListener.STATE_IS_NETWORK)) return;
        const record = this.find(browser);
        if (!record) return;
        if (flags & win.Ci.nsIWebProgressListener.STATE_START) record.navigation++;
        this.send(record, "loading");
      },
    };
    this.tabListener = event => {
      if (event.type === "TabOpen") this.track(event.target);
      const record = [...this.tabs.values()].find(item => item.tab === event.target);
      if (!record) return;
      this.send(record, event.type === "TabClose" ? "closed" : "title");
      if (event.type === "TabClose") this.tabs.delete(record.id);
    };
    for (const tab of win.gBrowser.tabs) this.track(tab);
    win.gBrowser.addTabsProgressListener(this.listener);
    for (const type of ["TabOpen", "TabClose", "TabAttrModified"]) win.gBrowser.tabContainer.addEventListener(type, this.tabListener);
  }

  capabilities() {
    return Object.freeze({ version: 1, engine: "gecko", navigation: true, observation: ["url", "title", "loading"], content_capture: false, developer_tools: "user_gesture_only", engine_switch: false });
  }

  track(tab) {
    let record = this.find(tab.linkedBrowser);
    if (!record) {
      record = { id: this.uuid(), tab, document: 1, navigation: 1,
        // A lazy (not yet inserted) tab has no principal until it first loads.
        principalIdentity: principalOrigin(tab.linkedBrowser) };
      this.tabs.set(record.id, record);
    }
    return record;
  }

  find(browser) { return [...this.tabs.values()].find(item => item.tab.linkedBrowser === browser); }

  /** Restored tabs stay lazy, with no document or principal, until first shown. */
  loaded(record) {
    const browser = record.tab.linkedBrowser;
    return !!(principalOrigin(browser) !== null && browser.browsingContext);
  }

  target(record) {
    if (!this.loaded(record)) throw new Error("TARGET_NOT_LOADED");
    const browser = record.tab.linkedBrowser;
    const identity = browser.contentPrincipal.origin;
    if (identity !== record.principalIdentity) {
      // Gecko can replace the principal with an internal error-page principal
      // before it emits a top-level progress event. Invalidate grants at the
      // first observation of that security boundary, including TLS errors.
      record.principalIdentity = identity;
      record.document++;
      record.navigation++;
    }
    return Object.freeze({ tab_id: record.id, engine: "gecko", engine_instance: this.instance,
      native_target_id: String(browser.browsingContext.id), identity,
      document_generation: record.document, navigation_generation: record.navigation,
      private_mode: this.window.PrivateBrowsingUtils.isBrowserPrivate(browser) });
  }

  resolve(target) {
    const record = this.tabs.get(target?.tab_id);
    if (!record) throw new Error("UNKNOWN_TARGET");
    const current = this.target(record);
    if (Object.keys(target).length !== Object.keys(current).length) throw new Error("INVALID_TARGET");
    for (const key of Object.keys(current)) {
      if (target[key] !== current[key]) throw new Error("STALE_TARGET");
    }
    return record;
  }

  send(record, type) {
    if (!this.loaded(record)) return; // Its first load reports it.
    const browser = record.tab.linkedBrowser;
    const target = this.target(record);
    // Never collect private URLs or titles for the coordinator.
    if (target.private_mode) return;
    this.emit({ version: 1, event_id: this.uuid(), type, target, url: browser.currentURI.spec,
      title: record.tab.label, loading: browser.webProgress.isLoadingDocument });
  }

  validateURL(url) {
    const uri = this.window.Services.io.newURI(url);
    if (!["http", "https"].includes(uri.scheme) && uri.spec !== "about:blank") throw new Error("UNSUPPORTED_SCHEME");
    return uri;
  }

  create(url = "about:blank") {
    const uri = this.validateURL(url);
    const tab = this.window.gBrowser.addTab(uri.spec, { triggeringPrincipal: this.window.Services.scriptSecurityManager.getSystemPrincipal() });
    return { status: "accepted", target: this.target(this.track(tab)) };
  }

  navigate(target, url) {
    const record = this.resolve(target);
    const uri = this.validateURL(url);
    record.navigation++; // Invalidate old grants before synchronous browser callbacks.
    record.tab.linkedBrowser.loadURI(uri, { triggeringPrincipal: this.window.Services.scriptSecurityManager.getSystemPrincipal() });
    return { status: "accepted" };
  }

  back(target) {
    const record = this.resolve(target);
    const browser = record.tab.linkedBrowser;
    if (!browser.canGoBack) return { status: "unsupported", reason: "NO_HISTORY" };
    record.navigation++;
    browser.goBack(); return { status: "accepted" };
  }

  forward(target) {
    const record = this.resolve(target);
    const browser = record.tab.linkedBrowser;
    if (!browser.canGoForward) return { status: "unsupported", reason: "NO_HISTORY" };
    record.navigation++;
    browser.goForward(); return { status: "accepted" };
  }

  reload(target) { const record = this.resolve(target); record.navigation++; record.tab.linkedBrowser.reload(); return { status: "accepted" }; }
  close(target) { this.window.gBrowser.removeTab(this.resolve(target).tab); return { status: "accepted" }; }
  developerTools() { return { status: "unsupported", reason: "USE_BROWSER_DEVTOOLS_COMMAND" }; }
  switchEngine() { return { status: "unsupported", reason: "CEF_EMBEDDING_NOT_BUILT" }; }

  dispose() {
    this.window.gBrowser.removeTabsProgressListener(this.listener);
    for (const type of ["TabOpen", "TabClose", "TabAttrModified"]) this.window.gBrowser.tabContainer.removeEventListener(type, this.tabListener);
    this.tabs.clear();
  }
}
