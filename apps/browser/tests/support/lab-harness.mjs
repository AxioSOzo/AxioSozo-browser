/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Synthetic pieces for testing AxioSozo Lab experiments under Node: a browser
// window with a tab strip and one tab's browser stack (mini-dom), preferences
// with live observers, an AI backend that answers from a script, and the ctx
// an experiment's installer gets. Test-only; not evidence of Gecko behaviour.
//
//   import "./support/chrome-modules.mjs";
//   import { fakeLabWindow, fakePrefs, fakeAi, labContext } from "./support/lab-harness.mjs";
//   const { installMyThing } = await import("../chrome/lab/my-thing.sys.mjs");
//   const h = fakeLabWindow();
//   const ctx = labContext(h.window, { id: "my-thing", ai: fakeAi({ reply: () => ({ text: "Done." }) }) });
//   const handle = installMyThing(h.window, ctx);
//   h.openTab(); … assertions … ; handle.dispose(); ctx.turnOff();
import { Document, Element, makeEvent } from "./mini-dom.mjs";

/** Preferences with getBoolPref/setBoolPref and branch observers (nsPref:changed). */
export function fakePrefs(values = {}) {
  const store = new Map(Object.entries(values));
  const observers = [];
  const writes = [];
  return {
    store, writes, observers,
    getBoolPref(name, fallback) {
      if (!store.has(name)) {
        if (fallback === undefined) throw new Error("NS_ERROR_UNEXPECTED");
        return fallback;
      }
      const value = store.get(name);
      if (typeof value !== "boolean") throw new Error("NS_ERROR_UNEXPECTED");
      return value;
    },
    setBoolPref(name, value) {
      writes.push([name, value]);
      const changed = store.get(name) !== value;
      store.set(name, value);
      if (changed) this.notify(name);
    },
    addObserver(domain, observer) { observers.push({ domain, observer }); },
    removeObserver(domain, observer) {
      const index = observers.findIndex(item => item.domain === domain && item.observer === observer);
      if (index >= 0) observers.splice(index, 1);
    },
    notify(name) {
      for (const { domain, observer } of [...observers]) {
        if (!name.startsWith(domain)) continue;
        if (typeof observer === "function") observer(null, "nsPref:changed", name);
        else observer.observe(null, "nsPref:changed", name);
      }
    },
  };
}

/** A normal browser window: chrome document, gBrowser with one tab and its browser stack. */
export function fakeLabWindow({ privateWindow = false, url = "https://example.com/" } = {}) {
  const document = new Document();
  const listeners = new Map();
  const tabListeners = new Map();
  const progressListeners = [];
  const stack = new Element(document, "stack");
  stack.className = "browserStack";
  const browser = new Element(document, "browser");
  browser.currentURI = { spec: url };
  browser.getBoundingClientRect = () => ({ x: 0, y: 0, width: 1000, height: 700, left: 0, top: 0, right: 1000, bottom: 700 });
  stack.getBoundingClientRect = browser.getBoundingClientRect;
  stack.append(browser);
  document.documentElement.append(stack);
  const tab = { linkedBrowser: browser, label: "Example" };
  const tabs = [tab];
  // Like the DOM: a listener added with { signal } goes away when that signal
  // aborts, and is never added when it already has.
  const listen = (map, type, fn, options) => {
    const signal = options && typeof options === "object" ? options.signal ?? null : null;
    if (signal?.aborted) return;
    if (!map.has(type)) map.set(type, new Set());
    map.get(type).add(fn);
    signal?.addEventListener("abort", () => map.get(type)?.delete(fn), { once: true });
  };
  const window = {
    document, innerWidth: 1200, innerHeight: 800,
    AbortController: globalThis.AbortController,
    setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms), clearTimeout: id => globalThis.clearTimeout(id),
    addEventListener(type, fn, options) { listen(listeners, type, fn, options); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    gBrowser: {
      get tabs() { return tabs; }, selectedTab: tab, selectedBrowser: browser,
      getTabForBrowser: candidate => tabs.find(item => item.linkedBrowser === candidate) ?? null,
      tabContainer: {
        addEventListener(type, fn, options) { listen(tabListeners, type, fn, options); },
        removeEventListener(type, fn) { tabListeners.get(type)?.delete(fn); },
      },
      addTabsProgressListener: listener => progressListeners.push(listener),
      removeTabsProgressListener: listener => { const at = progressListeners.indexOf(listener); if (at >= 0) progressListeners.splice(at, 1); },
    },
  };
  /** Live listener counts per event type (window and tab strip), for leak checks. */
  const listenerCount = () => [...listeners.values(), ...tabListeners.values()].reduce((sum, set) => sum + set.size, 0) + progressListeners.length;
  return {
    window, document, browser, stack, tab, listeners, tabListeners, progressListeners, listenerCount,
    adapter: { isPrivateWindow: () => privateWindow },
    /** A new tab, announced as Firefox does (TabOpen on the tab strip). */
    openTab(spec = "https://example.org/") {
      const linked = new Element(document, "browser");
      linked.currentURI = { spec };
      const opened = { linkedBrowser: linked, label: spec };
      tabs.push(opened);
      for (const fn of [...(tabListeners.get("TabOpen") ?? [])]) fn({ type: "TabOpen", target: opened });
      return opened;
    },
    /** A window-level event (keydown, mousedown, resize, …) in Gecko's capture order, simplified. */
    dispatch(type, init = {}) {
      const event = makeEvent(type, init);
      for (const fn of [...(listeners.get(type) ?? [])]) fn(event);
      return event;
    },
    /** The page in the tab navigated. */
    navigate(spec) {
      browser.currentURI = { spec };
      for (const listener of [...progressListeners]) listener.onLocationChange?.(browser, { isTopLevel: true }, null, { spec }, 0);
    },
  };
}

/**
 * An AI backend for createLabAi({ getBackend }) or a ready facade (fakeAi):
 * reply(turn) returns { text, json? } (or throws); `chunks` are streamed
 * through onText first. Every turn it was asked is in `.turns`.
 */
export function fakeAiBackend({ reply = () => ({ text: "" }), chunks = [] } = {}) {
  const turns = [];
  return {
    turns, connected: true,
    async runTurn(turn) {
      turns.push(turn);
      let text = "";
      for (const chunk of chunks) { text += chunk; turn.onText?.(text); await Promise.resolve(); }
      return reply(turn);
    },
  };
}

/** A ready ctx.ai for an experiment test (the real facade over fakeAiBackend). */
export async function fakeAi(options = {}) {
  const { createLabAi } = await import("../../chrome/lab/ai.sys.mjs");
  const backend = fakeAiBackend(options);
  const ai = createLabAi({ isPrivate: () => false, getBackend: () => backend });
  return Object.assign(Object.create(ai), { runTurn: ai.runTurn, turns: backend.turns });
}

/** The ctx installLab gives an experiment's installer, for testing that installer directly. */
export function labContext(window, { id = "example", services = null, adapter = { isPrivateWindow: () => false }, engineOf = () => "gecko",
  openOverview = null, ai = null, agents = null } = {}) {
  const controller = new AbortController();
  const toasts = [];
  const ctx = Object.freeze({ id, window, document: window.document, services, adapter, engineOf, openOverview,
    toast: message => { toasts.push(message); return { close() {} }; }, ai, agents, signal: controller.signal });
  return Object.assign(Object.create(ctx), { ...ctx, toasts, turnOff: () => controller.abort() });
}
