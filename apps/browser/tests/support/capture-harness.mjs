/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// One synthetic browser window with area capture installed (RegionCapture),
// for testing what Lab experiments add to the capture bar. The window,
// tabbrowser, browser, window global, snapshot, PNG encoder and clipboard are
// in-memory fakes, delivered in Gecko's order (window capture listeners, then
// the context menu's own), as in region-capture.test.mjs. Test-only; not
// evidence of native mouse handling, pixels or the system clipboard.
//
//   import "./support/chrome-modules.mjs";
//   import { captureWindow } from "./support/capture-harness.mjs";
//   const h = await captureWindow({ project: HARBOR });
//   await h.capture();                       // right-drag over the page; the bar is up
//   h.bar(); h.button("Copy for agent"); …
import { Document } from "./mini-dom.mjs";

export const HARBOR = Object.freeze({ id: "p_harbor", root: "/synthetic/repos/harbor", name: "Harbor", environment: "web" });
export const PNG = Object.freeze([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
export const flush = async (rounds = 60) => { for (let i = 0; i < rounds; i++) await Promise.resolve(); };

/** A trusted click (or any event) as chrome code receives it. */
export const trusted = (type = "click", init = {}) => ({ type, isTrusted: true, bubbles: true, defaultPrevented: false, cancelBubble: false,
  preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.cancelBubble = true; }, ...init });

export async function captureWindow({ url = "http://localhost:5173/billing?session=abc#top", title = "Harbor · Billing settings",
  project = HARBOR, sensitiveHost = false } = {}) {
  const { installRegionCapture } = await import("../../chrome/RegionCapture.sys.mjs");
  const document = new Document();
  document.createXULElement = tag => document.createElement(tag);
  const menu = document.createElement("menupopup");
  menu.id = "contentAreaContextMenu";
  document.documentElement.append(menu);
  const stack = document.createElement("stack");
  stack.className = "browserStack";
  const rect = () => ({ left: 200, top: 10, width: 1000, height: 800, right: 1200, bottom: 810, x: 200, y: 10 });
  stack.getBoundingClientRect = rect;
  const browser = document.createElement("browser");
  stack.append(browser);
  document.documentElement.append(stack);
  const snapshots = [];
  const global = { drawSnapshot: (...args) => { snapshots.push(args); return Promise.resolve({ width: 1, height: 1, close() {} }); } };
  const reloads = [];
  Object.assign(browser, {
    currentURI: { spec: url }, fullZoom: 1, focus() {}, reload() { reloads.push("browser"); },
    browsingContext: { usePrivateBrowsing: false, currentWindowGlobal: global },
    getBoundingClientRect: rect,
  });
  const tab = { label: title, linkedBrowser: browser, closing: false };
  const listeners = new Map();
  const tabListeners = new Map();
  const window = {
    document, closed: false, devicePixelRatio: 2, innerWidth: 1400, innerHeight: 900, nsContextMenu: { contentData: null }, gContextMenu: null,
    DOMRect: class { constructor(x, y, width, height) { Object.assign(this, { x, y, width, height }); } },
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); },
    removeEventListener(type, fn) { listeners.set(type, (listeners.get(type) ?? []).filter(item => item !== fn)); },
    setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: id => clearTimeout(id),
    gBrowser: {
      selectedTab: tab, selectedBrowser: browser,
      getTabForBrowser: candidate => (candidate === browser ? tab : null),
      reloadTab: target => reloads.push(target === tab ? "tab" : "other"),
      tabContainer: {
        addEventListener: (type, fn) => tabListeners.set(type, fn),
        removeEventListener: type => tabListeners.delete(type),
      },
      progressListeners: [],
      addTabsProgressListener(listener) { this.progressListeners.push(listener); },
      removeTabsProgressListener(listener) { this.progressListeners = this.progressListeners.filter(item => item !== listener); },
    },
  };
  browser.documentGlobal = window;
  // mini-dom ignores the capture flag; record listeners per type.
  const docAdd = document.addEventListener.bind(document);
  document.addEventListener = (type, fn) => docAdd(type, fn);
  document.removeEventListener = (type, fn) => document.listeners.get(type)?.delete(fn);

  function dispatchWindow(type, init) {
    const event = { type, isTrusted: true, defaultPrevented: false, stopped: false, button: 0, buttons: 0,
      target: browser, originalTarget: browser, clientX: 0, clientY: 0, screenX: 0, screenY: 0, ...init,
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; },
      stopImmediatePropagation() { this.stopped = true; } };
    for (const fn of [...(listeners.get(type) ?? [])]) { fn(event); if (event.stopped) break; }
    return event;
  }
  function contentAsksForMenu() {
    window.nsContextMenu.contentData = { browser, actor: { manager: { isCurrentGlobal: true } } };
    window.gContextMenu = { browser };
    const event = { type: "popupshowing", target: menu, isTrusted: true, defaultPrevented: false, stopped: false,
      preventDefault() { this.defaultPrevented = true; }, stopImmediatePropagation() { this.stopped = true; } };
    for (const fn of document.listeners.get("popupshowing") ?? []) { fn(event); if (event.stopped) return event; }
    return event;
  }

  const clipboard = { writes: [], write(buffer, text) { this.writes.push({ buffer, text }); } };
  const toasts = [];
  const services = { isNormalWindow: () => true,
    projectForUrl: async () => (project ? { project: { id: project.id, root: project.root, manifest: { name: project.name } },
      environment: { name: project.environment ?? null } } : null) };
  const adapter = { isPrivateWindow: () => false, workspaceForTab: () => null };
  const buffer = new Uint8Array(PNG).buffer;
  const runtime = installRegionCapture(window, {
    services, adapter, clipboard, core: { isSensitiveHost: () => ({ sensitive: sensitiveHost }) },
    toast: (_win, value) => toasts.push(value), encode: async () => ({ buffer, canvas: null }),
  });

  const h = {
    window, document, stack, browser, tab, runtime, clipboard, toasts, snapshots, reloads, buffer, dispatchWindow, tabListeners,
    /** Right-drag over the page (400,200 → 700,400) and wait for the bar. */
    async capture() {
      dispatchWindow("mousedown", { button: 2, buttons: 2, clientX: 400, clientY: 200, screenX: 450, screenY: 260 });
      contentAsksForMenu();
      dispatchWindow("mousemove", { button: 0, buttons: 2, clientX: 700, clientY: 400 });
      dispatchWindow("mouseup", { button: 2, buttons: 0, clientX: 700, clientY: 400 });
      await flush();
      return h.bar();
    },
    overlay: () => stack.querySelector(".axiosozo-region"),
    bar: () => stack.querySelector(".axiosozo-region-bar"),
    note: () => stack.querySelector(".axiosozo-region-note"),
    /** The button whose text is `label` (exactly, or matching a RegExp), anywhere over the page. */
    button(label) {
      return stack.querySelectorAll("button").find(node => (label instanceof RegExp ? label.test(node.textContent) : node.textContent === label)) ?? null;
    },
    click(node, init = {}) { node.dispatchEvent(trusted("click", init)); },
    key(target, key, init = {}) { return target.dispatchEvent(trusted("keydown", { key, ...init })); },
    escape() { return dispatchWindow("keydown", { key: "Escape", target: h.bar() ?? browser }); },
    /** Click somewhere on the page outside the bar. */
    outside() { return dispatchWindow("mousedown", { button: 0, buttons: 1, target: browser, clientX: 50, clientY: 50 }); },
    text: () => h.bar()?.textContent ?? "",
  };
  return h;
}

/** A ctx.ai over a scripted backend, with client statuses (default: Claude Code and Codex ready). */
export async function scriptedAi({ reply = () => ({ text: "{}", json: { choices: [] } }), statuses = null, hold = false } = {}) {
  const { createLabAi } = await import("../../chrome/lab/ai.sys.mjs");
  const turns = [];
  const pending = [];
  const ready = id => ({ id, label: id, state: "ready", available: true, capabilities: ["answer", "image", "schema", "task"], reason: `${id} · checked` });
  const list = statuses ?? [ready("claude-code"), ready("codex"), { id: "antigravity", available: false, capabilities: [], reason: "Not installed" }];
  const backend = {
    connected: true,
    async runTurn(turn) {
      turns.push(turn);
      if (hold) {
        return new Promise((resolve, reject) => {
          pending.push({ resolve: () => resolve(reply(turn)), reject });
          turn.signal?.addEventListener("abort", () => reject(new Error("ABORTED")), { once: true });
        });
      }
      return reply(turn);
    },
  };
  const ai = createLabAi({ isPrivate: () => false, getBackend: () => backend, getStatus: async () => list });
  return { ai, turns, pending, release: () => pending.splice(0).forEach(item => item.resolve()) };
}

/**
 * A ctx.agents that records calls and lets the test drive one session:
 * agents.emit(patch) changes it and tells subscribers; agents.finish(patch)
 * also resolves whenDone.
 */
export function scriptedAgents({ statuses = null, targets = null, refuse = null } = {}) {
  const calls = { startTask: [], stop: [], continueInTerminal: [], openIn: [], handoverTargets: 0, clientStatus: 0 };
  const listeners = new Set();
  let session = null;
  let resolveDone = null;
  const ready = id => ({ id, label: id, state: "ready", available: true, capabilities: ["task", "image", "resume"], reason: `${id} · checked` });
  const agents = {
    calls, listeners,
    get current() { return session; },
    async clientStatus() { calls.clientStatus++; return statuses ?? [ready("claude-code"), ready("codex"), ready("antigravity")]; },
    async handoverTargets() {
      calls.handoverTargets++;
      return targets ?? [{ target: "terminal", available: false }, { target: "claude-cli", available: true },
        { target: "claude-desktop", available: true }, { target: "codex-app", available: false }];
    },
    async startTask(request) {
      calls.startTask.push(request);
      if (refuse) throw refuse;
      session = Object.freeze({ id: "lab-1", origin: "browser", client: request.client,
        clientLabel: { "claude-code": "Claude Code", codex: "Codex", antigravity: "Antigravity" }[request.client],
        sessionId: "11111111-2222-4333-8444-555555555555", projectRoot: request.projectRoot, projectName: "Harbor", title: request.task.slice(0, 60),
        state: "starting", step: null, summary: null, reason: null, stopping: false, files: null, canStop: true, canResume: true,
        costUsd: null, durationMs: null, rateLimit: null });
      return session;
    },
    emit(patch) {
      session = Object.freeze({ ...session, ...patch });
      for (const listener of [...listeners]) listener({ type: "changed", session });
    },
    finish(patch) { agents.emit(patch); resolveDone?.(session); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    get: id => (session?.id === id ? session : null),
    whenDone: () => new Promise(resolve => { resolveDone = resolve; }),
    async stop(id) { calls.stop.push(id); return session; },
    async continueInTerminal(id, options) { calls.continueInTerminal.push({ id, ...options }); return { ok: true, target: "terminal" }; },
    async openIn(target, options) {
      calls.openIn.push({ target, ...options });
      if (refuse) throw refuse;
      return { ok: true, target, imageCopied: !!options.image };
    },
  };
  return agents;
}
