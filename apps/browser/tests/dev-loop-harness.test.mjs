/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Synthetic browser-chrome model shared by the F4/F5/F6 runtime tests: a small
// fake DOM, a Zen-like window (urlbar, workspaces, browser stacks, notification
// boxes, tabs progress listeners), a fake ZenWorkspaceAdapter, fake
// AxioSozoServices and manual timers. These are unit fixtures, not evidence of a
// real Zen window. Run directly, this file only checks the fixture itself.
import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

export const WORKSPACE_A = "{11111111-1111-4111-8111-111111111111}";
export const WORKSPACE_B = "{22222222-2222-4222-8222-222222222222}";
export const XHTML = "http://www.w3.org/1999/xhtml";
// nsIWebProgressListener.idl: LOCATION_CHANGE_ERROR_PAGE is 0x2 (0x4 is LOCATION_CHANGE_RELOAD).
const STATE_START = 0x1, STATE_STOP = 0x10, STATE_IS_WINDOW = 0x80000, ERROR_PAGE = 0x2, SAME_DOCUMENT = 0x1;
export const NS_ERROR_CONNECTION_REFUSED = 0x804b000d;
export const NS_ERROR_UNKNOWN_HOST = 0x804b001e;

// ---- Fake DOM ----------------------------------------------------------------------
export class FakeNode {
  constructor(document, localName) {
    this.ownerDocument = document; this.localName = localName;
    this.children = []; this.parentNode = null; this.attrs = new Map(); this.listeners = new Map();
    this.style = {}; this.text = ""; this.hidden = false; this.disabled = false;
    this.classList = { contains: c => this.className.split(/\s+/u).includes(c),
      add: c => { if (!this.classList.contains(c)) this.className = `${this.className} ${c}`.trim(); } };
  }
  get id() { return this.attrs.get("id") ?? ""; }
  set id(value) { this.attrs.set("id", value); }
  get className() { return this.attrs.get("class") ?? ""; }
  set className(value) { this.attrs.set("class", value); }
  setAttribute(k, v) { this.attrs.set(k, String(v)); }
  getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }
  hasAttribute(k) { return this.attrs.has(k); }
  removeAttribute(k) { this.attrs.delete(k); }
  toggleAttribute(k, force) { const on = force ?? !this.attrs.has(k); if (on) { if (!this.attrs.has(k)) this.attrs.set(k, ""); } else this.attrs.delete(k); return on; }
  get firstChild() { return this.children[0] ?? null; }
  get previousElementSibling() { const p = this.parentNode; return p ? p.children[p.children.indexOf(this) - 1] ?? null : null; }
  contains(node) { for (let n = node; n; n = n.parentNode) if (n === this) return true; return false; }
  get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n === this.ownerDocument.documentElement; }
  #detach(node) { node.parentNode?.children.splice(node.parentNode.children.indexOf(node), 1); node.parentNode = null; }
  appendChild(node) { this.#detach(node); this.children.push(node); node.parentNode = this; return node; }
  prepend(node) { this.#detach(node); this.children.unshift(node); node.parentNode = this; return node; }
  before(node) { const p = this.parentNode; this.#detach(node); p.children.splice(p.children.indexOf(this), 0, node); node.parentNode = p; }
  after(node) { const p = this.parentNode; this.#detach(node); p.children.splice(p.children.indexOf(this) + 1, 0, node); node.parentNode = p; }
  remove() { if (this.parentNode) this.#detach(this); }
  get textContent() { return this.text + this.children.map(c => c.textContent).join(""); }
  set textContent(value) { for (const c of [...this.children]) c.remove(); this.text = String(value); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  listenerCount() { let n = 0; for (const set of this.listeners.values()) n += set.size; return n; }
  dispatch(type, init = {}) {
    const event = { type, target: this, defaultPrevented: false, stopPropagation() {}, preventDefault() { this.defaultPrevented = true; }, ...init };
    for (const fn of [...(this.listeners.get(type) ?? [])]) fn(event);
    return event;
  }
  click() { if (!this.disabled) this.dispatch("click", { isTrusted: true }); }
  focus() { this.ownerDocument.activeElement = this; }
  matches(selector) {
    if (selector.startsWith("#")) return this.id === selector.slice(1);
    if (selector.startsWith(".")) return this.classList.contains(selector.slice(1));
    const attr = /^\[([^=\]]+)(?:="([^"]*)")?\]$/u.exec(selector);
    if (attr) return this.hasAttribute(attr[1]) && (attr[2] === undefined || this.getAttribute(attr[1]) === attr[2]);
    return this.localName === selector;
  }
  querySelectorAll(selector) {
    const out = [];
    const walk = node => { for (const c of node.children) { if (c.matches(selector)) out.push(c); walk(c); } };
    walk(this);
    return out;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  // XUL popup surface
  openPopup(anchor) { this.openedWith = anchor; this.state = "open"; this.dispatch("popupshowing", { target: this }); }
  hidePopup() { this.state = "closed"; this.dispatch("popuphidden", { target: this }); }
}

export class FakeDocument {
  constructor() {
    this.documentElement = new FakeNode(this, "window");
    this.prolog = []; this.activeElement = null; this.hidden = false; this.focused = true; this.listeners = new Map();
  }
  createElementNS(ns, tag) { assert.equal(ns, XHTML); return new FakeNode(this, tag); }
  createXULElement(tag) { return new FakeNode(this, tag); }
  createProcessingInstruction(target, data) {
    const document = this;
    return { target, data, remove() { const i = document.prolog.indexOf(this); if (i >= 0) document.prolog.splice(i, 1); } };
  }
  insertBefore(node) { this.prolog.push(node); return node; }
  getElementById(id) { return id === this.documentElement.id ? this.documentElement : this.documentElement.querySelector(`#${id}`); }
  querySelector(selector) { return this.documentElement.querySelector(selector); }
  querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
  hasFocus() { return this.focused; }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  dispatch(type) { for (const fn of [...(this.listeners.get(type) ?? [])]) fn({ type }); }
}

// ---- Timers and clock ----------------------------------------------------------------
export function createClock(start = Date.UTC(2026, 8, 27, 10, 0, 0)) {
  const clock = { now: start, timers: new Map(), nextId: 1 };
  clock.fn = () => clock.now;
  const add = (fn, ms, repeat) => { const id = clock.nextId++; clock.timers.set(id, { fn, at: clock.now + Math.max(0, ms), ms, repeat }); return id; };
  clock.timersApi = {
    setTimeout: (fn, ms) => add(fn, ms, false), clearTimeout: id => clock.timers.delete(id),
    setInterval: (fn, ms) => add(fn, ms, true), clearInterval: id => clock.timers.delete(id),
  };
  /** Advances time, running due timers in order; awaits microtasks between them. */
  clock.advance = async ms => {
    const end = clock.now + ms;
    for (;;) {
      let next = null;
      for (const [id, timer] of clock.timers) if (timer.at <= end && (!next || timer.at < next[1].at)) next = [id, timer];
      if (!next) break;
      const [id, timer] = next;
      clock.now = timer.at;
      if (timer.repeat) timer.at += timer.ms; else clock.timers.delete(id);
      timer.fn();
      await flushMicrotasks();
    }
    clock.now = end;
    await flushMicrotasks();
  };
  return clock;
}

export async function flushMicrotasks(rounds = 20) {
  for (let i = 0; i < rounds; i++) await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
}

// ---- Fake Zen window ------------------------------------------------------------------
export function createFakeWindow({ privateWindow = false, prefs = {}, workspaces = [WORKSPACE_A, WORKSPACE_B],
  activeWorkspace = WORKSPACE_A, pageActions = true } = {}) {
  const document = new FakeDocument();
  const root = document.documentElement;
  const el = (tag, id, parent, cls) => { const n = new FakeNode(document, tag); if (id) n.id = id; if (cls) n.className = cls; parent.appendChild(n); return n; };
  const urlbar = el("moz-urlbar", "urlbar", root);
  el("box", "identity-box", urlbar);
  if (pageActions) el("hbox", "page-action-buttons", urlbar);
  el("popupset", "mainPopupSet", root);
  const sidebar = el("vbox", "tabbrowser-tabs", root);
  for (const uuid of workspaces) {
    const workspace = el("zen-workspace", uuid, sidebar);
    el("vbox", null, workspace, "zen-workspace-tabs-section zen-current-workspace-indicator");
    el("arrowscrollbox", null, workspace, "workspace-arrowscrollbox");
  }
  const panels = el("tabpanels", "tabbrowser-tabpanels", root);
  const windowListeners = new Map();
  const progressListeners = new Set();
  const opened = [];
  const notificationBoxes = new Map();
  const tabContainer = new FakeNode(document, "tabs");

  function notificationBox(browser) {
    if (!notificationBoxes.has(browser)) {
      const box = { PRIORITY_INFO_MEDIUM: 2, notifications: [],
        async appendNotification(type, options, buttons = []) {
          const notification = { type, label: options.label, priority: options.priority, buttons, eventCallback: options.eventCallback, persistence: 0,
            clickButton(label) {
              const button = buttons.find(b => b.label === label);
              const keep = button.callback(notification, button, null);
              if (!keep) box.removeNotification(notification);
            },
            dismiss() { options.eventCallback?.("dismissed"); box.removeNotification(notification); } };
          box.notifications.push(notification);
          return notification;
        },
        removeNotification(notification) {
          const i = box.notifications.indexOf(notification);
          if (i < 0) return;
          box.notifications.splice(i, 1);
          notification.eventCallback?.("removed");
        },
        /** Firefox drops non-persistent notifications on location change. */
        locationChanged() {
          for (const n of [...box.notifications]) { if (n.persistence > 0) n.persistence--; else box.removeNotification(n); }
        } };
      notificationBoxes.set(browser, box);
    }
    return notificationBoxes.get(browser);
  }

  const gBrowser = {
    tabs: [], selectedTab: null, tabContainer,
    addTabsProgressListener: l => progressListeners.add(l),
    removeTabsProgressListener: l => progressListeners.delete(l),
    getTabForBrowser: browser => gBrowser.tabs.find(t => t.linkedBrowser === browser) ?? null,
    getNotificationBox: browser => notificationBox(browser),
    removeTab(tab) {
      tab.closing = true;
      tabContainer.dispatch("TabClose", { target: tab });
      gBrowser.tabs.splice(gBrowser.tabs.indexOf(tab), 1);
      tab.linkedBrowser.parentNode.parentNode?.remove();
      if (gBrowser.selectedTab === tab) gBrowser.selectedTab = gBrowser.tabs[0] ?? null;
    },
  };

  const window = {
    document, gBrowser, opened,
    STATE_MINIMIZED: 2, windowState: 1,
    Services: { prefs: { getBoolPref: (name, fallback) => (name in prefs ? prefs[name] : fallback) },
      scriptSecurityManager: {
        createNullPrincipal: attrs => ({ kind: "null", isSystemPrincipal: false, originAttributes: { ...attrs } }),
        getSystemPrincipal: () => ({ kind: "system", isSystemPrincipal: true }) } },
    PrivateBrowsingUtils: { isWindowPrivate: () => privateWindow },
    openTrustedLinkIn: (url, where, options) => opened.push({ url, where, options }),
    // Like Firefox: web links must not carry the system principal.
    openWebLinkIn(url, where, options = {}) {
      if (!options.triggeringPrincipal || options.triggeringPrincipal.isSystemPrincipal) throw new Error("openWebLinkIn needs a non-system principal");
      opened.push({ url, where, options, web: true });
    },
    getComputedStyle: () => ({ position: "static" }),
    addEventListener(type, fn) { if (!windowListeners.has(type)) windowListeners.set(type, new Set()); windowListeners.get(type).add(fn); },
    removeEventListener(type, fn) { windowListeners.get(type)?.delete(fn); },
    dispatch(type) { for (const fn of [...(windowListeners.get(type) ?? [])]) fn({ type }); },
    windowListenerCount() { let n = 0; for (const s of windowListeners.values()) n += s.size; return n; },
  };

  const harness = {
    window, document, gBrowser, progressListeners, opened, notificationBox, prefs,
    addTab({ url = "about:blank", workspace = activeWorkspace, select = true, label = "Page", userContextId = 0 } = {}) {
      const container = el("hbox", null, panels, "browserContainer");
      const stack = el("stack", null, container, "browserStack");
      const browser = new FakeNode(document, "browser");
      Object.assign(browser, { currentURI: { spec: url }, reloads: 0, contentTitle: label,
        reload() { this.reloads++; }, focus() { document.activeElement = this; } });
      stack.appendChild(browser);
      const tab = new FakeNode(document, "tab");
      Object.assign(tab, { linkedBrowser: browser, label, userContextId, closing: false });
      if (workspace) tab.setAttribute("zen-workspace-id", workspace);
      gBrowser.tabs.push(tab);
      if (select || !gBrowser.selectedTab) harness.select(tab);
      return tab;
    },
    select(tab) { gBrowser.selectedTab = tab; tabContainer.dispatch("TabSelect", { target: tab }); },
    stackOf: tab => tab.linkedBrowser.parentNode,
    /** A committed top-level navigation (and, unless `stop` is false, its successful load).
     * `title` sets the new document's contentTitle (the tab label is not changed). */
    commit(tab, url, { stop = true, title } = {}) {
      const browser = tab.linkedBrowser;
      browser.currentURI = { spec: url };
      if (title !== undefined) browser.contentTitle = title;
      notificationBox(browser).locationChanged();
      for (const l of [...progressListeners]) l.onLocationChange?.(browser, { isTopLevel: true }, null, { spec: url }, 0);
      if (stop) for (const l of [...progressListeners]) l.onStateChange?.(browser, { isTopLevel: true }, { URI: { spec: url } }, STATE_STOP | STATE_IS_WINDOW, 0);
    },
    /** The top-level document load of the tab's current document finished (STATE_STOP | STATE_IS_WINDOW). */
    stop(tab, { status = 0 } = {}) {
      const browser = tab.linkedBrowser;
      for (const l of [...progressListeners]) l.onStateChange?.(browser, { isTopLevel: true }, { URI: { spec: browser.currentURI.spec } }, STATE_STOP | STATE_IS_WINDOW, status);
    },
    sameDocument(tab, url) {
      tab.linkedBrowser.currentURI = { spec: url };
      for (const l of [...progressListeners]) l.onLocationChange?.(tab.linkedBrowser, { isTopLevel: true }, null, { spec: url }, SAME_DOCUMENT);
    },
    /** A failed top-level load: Firefox shows neterror with the failed URI as location. */
    /** Order observed in the real app (H3 GUI run): STATE_START, then the refused
     * STATE_STOP while currentURI is still the previous page, then the error
     * page's location change (flag 0x2), which updates currentURI. */
    fail(tab, url, status = NS_ERROR_CONNECTION_REFUSED) {
      const browser = tab.linkedBrowser;
      for (const l of [...progressListeners]) l.onStateChange?.(browser, { isTopLevel: true }, { URI: { spec: url } }, STATE_START | STATE_IS_WINDOW, 0);
      for (const l of [...progressListeners]) l.onStateChange?.(browser, { isTopLevel: true }, { URI: { spec: url } }, STATE_STOP | STATE_IS_WINDOW, status);
      browser.currentURI = { spec: url };
      for (const l of [...progressListeners]) l.onLocationChange?.(browser, { isTopLevel: true }, null, { spec: url }, ERROR_PAGE);
    },
    /** Same as fail(), but the error page's location change arrives only after the caller's awaits. */
    failBeforeLocation(tab, url, status = NS_ERROR_CONNECTION_REFUSED) {
      const browser = tab.linkedBrowser;
      for (const l of [...progressListeners]) l.onStateChange?.(browser, { isTopLevel: true }, { URI: { spec: url } }, STATE_START | STATE_IS_WINDOW, 0);
      for (const l of [...progressListeners]) l.onStateChange?.(browser, { isTopLevel: true }, { URI: { spec: url } }, STATE_STOP | STATE_IS_WINDOW, status);
      return () => {
        browser.currentURI = { spec: url };
        for (const l of [...progressListeners]) l.onLocationChange?.(browser, { isTopLevel: true }, null, { spec: url }, ERROR_PAGE);
      };
    },
  };
  return harness;
}

// ---- Fake adapter ----------------------------------------------------------------------
export function createFakeAdapter({ privateWindow = false, active = WORKSPACE_A, elements = null } = {}) {
  const listeners = new Set();
  const adapter = {
    active,
    isPrivateWindow: () => privateWindow,
    activeWorkspaceUuid: () => (privateWindow ? null : adapter.active),
    workspaceForTab: tab => (privateWindow ? null : tab?.getAttribute?.("zen-workspace-id") ?? null),
    selectedTab: () => null,
    onChange(callback) { listeners.add(callback); return () => listeners.delete(callback); },
    emit(change) { for (const l of [...listeners]) l(change); },
    listenerCount: () => listeners.size,
  };
  if (elements) {
    adapter.workspaceElement = uuid => elements(uuid);
    adapter.workspaceHeader = uuid => elements(uuid)?.querySelector(".zen-current-workspace-indicator") ?? null;
  }
  return adapter;
}

// ---- Fake services ------------------------------------------------------------------------
export function createFakeServices(core, { projects = [], contexts = [], rules = [], jev = null, statuses = {} } = {}) {
  const listeners = new Map();
  const calls = { projectForUrl: 0, listProjects: 0, serviceStatus: 0, updateProject: [], recordForeground: [], usageSummary: 0, listRules: 0 };
  let ledger = core.DEFAULT_LEDGER;
  const services = {
    projects, contexts, rules, statuses, calls,
    jev: jev ?? { consent: false, interval_minutes: 5, hourly_budget: 30 },
    async projectForUrl(url) {
      calls.projectForUrl++;
      for (const project of services.projects) {
        const match = core.matchEnvironment(project.manifest.environments, url);
        if (match) return { project, environment: match.environment };
      }
      return null;
    },
    async listContexts() { return services.contexts; },
    async listProjects() { calls.listProjects++; return services.projects; },
    async updateProject(id, patch) {
      calls.updateProject.push([id, patch]);
      services.projects = services.projects.map(p => (p.id === id ? { ...p, ...patch } : p));
      services.emit("projects");
      return services.projects.find(p => p.id === id) ?? null;
    },
    async getProject(id) { return services.projects.find(p => p.id === id) ?? null; },
    async serviceStatus(projectId) {
      calls.serviceStatus++;
      const value = services.statuses[projectId];
      return typeof value === "function" ? value() : value ?? [];
    },
    async listRules() { calls.listRules++; return services.rules; },
    async getJevSettings() { return services.jev; },
    async recordForeground(record) {
      calls.recordForeground.push(record);
      ledger = core.recordForeground(ledger, record);
    },
    async usageSummary({ days }) {
      calls.usageSummary++;
      return core.summarize(ledger, { today: services.today, days });
    },
    today: "2026-09-27",
    on(name, callback) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
      return () => listeners.get(name).delete(callback);
    },
    emit(name) { for (const cb of [...(listeners.get(name) ?? [])]) cb(); },
    listenerCount() { let n = 0; for (const s of listeners.values()) n += s.size; return n; },
    ledger: () => ledger,
  };
  return services;
}

export function project({ id = "p_webapp", name = "Webapp", environments, services = [], surfaces = [], space = WORKSPACE_A } = {}) {
  return {
    version: 1, id, root: `/synthetic/${id}`, manifest_state: "none", context_uuid: space, trusted: false,
    created_at: 1, updated_at: 1,
    manifest: { version: environments?.some(e => e.app) ? 2 : 1, name, kind: "web", surfaces, services,
      environments: environments ?? [
        { name: "production", base_url: "https://webapp.example" },
        { name: "local", base_url: "http://localhost:5173" },
        { name: "preview", base_url: "https://preview.webapp.example" },
      ] },
  };
}

export function context(uuid, type, extra = {}) {
  return { uuid, name: "Space", icon: "", type, organization_uuid: null, project_id: null, engine_preference: null, container: 0, ...extra };
}

// Run standalone, check the fixture's own invariants.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  test("fake DOM keeps tree operations and selectors consistent", () => {
    const h = createFakeWindow();
    const identity = h.document.getElementById("identity-box");
    const node = h.document.createElementNS(XHTML, "button");
    node.id = "probe";
    identity.after(node);
    assert.equal(h.document.getElementById("probe"), node);
    assert.equal(identity.parentNode.children.indexOf(node), identity.parentNode.children.indexOf(identity) + 1);
    node.remove();
    assert.equal(h.document.getElementById("probe"), null);
    const tab = h.addTab({ url: "https://example.test/" });
    assert.equal(h.stackOf(tab).classList.contains("browserStack"), true);
    assert.equal(h.gBrowser.getTabForBrowser(tab.linkedBrowser), tab);
  });
  test("manual clock runs timers in order", async () => {
    const clock = createClock(0); const seen = [];
    clock.timersApi.setTimeout(() => seen.push("b"), 20);
    clock.timersApi.setTimeout(() => seen.push("a"), 10);
    const id = clock.timersApi.setInterval(() => seen.push("i"), 15);
    await clock.advance(31);
    clock.timersApi.clearInterval(id);
    assert.deepEqual(seen, ["a", "i", "b", "i"]);
  });
}
