/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Capture an area for an agent in one synthetic browser window. The window,
// tabbrowser, browser, window global, snapshot, PNG encoder and clipboard are
// in-memory fakes; events are delivered in Gecko's order (window capture
// listeners, then the context menu's own). Not evidence of native mouse
// handling, drawSnapshot pixels or the system clipboard.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { Document } from "./support/mini-dom.mjs";

const {
  installRegionCapture, selectionRect, snapshotRequest, barPlacement, agentNote, regionRefusalText,
  REGION_MENU_ITEM, DRAG_THRESHOLD, MAX_IMAGE_SIDE,
} = await import("../chrome/RegionCapture.sys.mjs");

const PAGE = "http://localhost:5173/billing";
const flush = async (rounds = 40) => { for (let i = 0; i < rounds; i++) await Promise.resolve(); };

// ---- pure helpers -------------------------------------------------------------------

test("selectionRect normalizes any drag direction and clamps to the browser", () => {
  const bounds = { left: 200, top: 10, right: 1200, bottom: 810 };
  assert.deepEqual(selectionRect({ x: 300, y: 100 }, { x: 500, y: 300 }, bounds), { x: 100, y: 90, width: 200, height: 200 });
  assert.deepEqual(selectionRect({ x: 500, y: 300 }, { x: 300, y: 100 }, bounds), { x: 100, y: 90, width: 200, height: 200 });
  assert.deepEqual(selectionRect({ x: 1100, y: 700 }, { x: 1500, y: 900 }, bounds), { x: 900, y: 690, width: 100, height: 110 });
  assert.deepEqual(selectionRect({ x: 100, y: 0 }, { x: 250, y: 50 }, bounds), { x: 0, y: 0, width: 50, height: 40 });
});

test("snapshotRequest divides out page zoom, rounds outward and asks for device pixels", () => {
  const plain = snapshotRequest({ x: 10, y: 20, width: 300, height: 100 }, { zoom: 1, dpr: 2 });
  assert.deepEqual(plain.rect, { x: 10, y: 20, width: 300, height: 100 });
  assert.equal(plain.scale, 2);
  assert.deepEqual([plain.width, plain.height], [600, 200]);
  const zoomed = snapshotRequest({ x: 15, y: 15, width: 301, height: 99 }, { zoom: 1.5, dpr: 2 });
  assert.deepEqual(zoomed.rect, { x: 10, y: 10, width: 201, height: 66 });
  assert.equal(zoomed.scale, 3);
});

test("snapshotRequest keeps the longest side within the image limit", () => {
  const big = snapshotRequest({ x: 0, y: 0, width: 2000, height: 1000 }, { zoom: 1, dpr: 2 });
  assert.equal(Math.max(big.width, big.height), MAX_IMAGE_SIDE);
  assert.ok(big.scale < 2);
});

test("barPlacement prefers below, then above, then inside, always on screen", () => {
  const stack = { width: 1000, height: 800 }, bar = { width: 420, height: 90 };
  assert.deepEqual(barPlacement({ x: 100, y: 100, width: 600, height: 200 }, stack, bar), { left: 280, top: 310 });
  assert.deepEqual(barPlacement({ x: 100, y: 600, width: 600, height: 150 }, stack, bar), { left: 280, top: 500 });
  const full = barPlacement({ x: 0, y: 0, width: 1000, height: 800 }, stack, bar);
  assert.deepEqual(full, { left: 572, top: 700 });
  assert.equal(barPlacement({ x: 0, y: 10, width: 50, height: 20 }, stack, bar).left, 8);
});

test("agentNote is plain lines: size, page, address, project and the user's note", () => {
  const text = agentNote({ title: "  Harbor ·\n Billing ", url: PAGE, project: { name: "Harbor", environment: "web" },
    note: "  the retry\nbutton does nothing ", width: 640, height: 200 });
  assert.equal(text, [
    "Screenshot of part of a page (640×200 px), captured in AxioSozo.",
    "Page: Harbor · Billing",
    `URL: ${PAGE}`,
    "Project: Harbor (web)",
    "Note: the retry button does nothing",
  ].join("\n"));
  const bare = agentNote({ url: PAGE, width: 10, height: 10 });
  assert.equal(bare.split("\n").length, 2);
  assert.ok(!/Note:|Project:|Page:/.test(bare));
  assert.equal(agentNote({ url: PAGE, note: "x".repeat(900), width: 1, height: 1 }).split("Note: ")[1].length, 500);
});

test("refusals say plainly why nothing was captured", () => {
  assert.match(regionRefusalText("PRIVATE"), /private windows are never captured/);
  assert.match(regionRefusalText("BLOCKED_CATEGORY"), /sensitive sites/);
  assert.match(regionRefusalText("ENGINE"), /Chromium/);
  assert.match(regionRefusalText("NOT_WEB"), /Only web pages/);
  assert.match(regionRefusalText("anything"), /cannot be captured/);
});

// ---- one synthetic window ---------------------------------------------------------------

function harness({ url = PAGE, engine = "gecko", sensitiveHost = false, privateWindow = false, prefs = {} } = {}) {
  const document = new Document();
  document.createXULElement = tag => document.createElement(tag);
  const menu = document.createElement("menupopup"); menu.id = "contentAreaContextMenu";
  const separator = document.createElement("menuseparator"); separator.id = "context-sep-screenshots";
  menu.append(separator);
  document.documentElement.append(menu);
  const opened = [];
  menu.openPopupAtScreen = (x, y, isContext) => {
    opened.push({ x, y, isContext, data: window.nsContextMenu.contentData });
    dispatchPopup(menu);
  };

  const stack = document.createElement("stack"); stack.className = "browserStack";
  stack.getBoundingClientRect = () => ({ left: 200, top: 10, width: 1000, height: 800, right: 1200, bottom: 810 });
  const browser = document.createElement("browser");
  stack.append(browser);
  document.documentElement.append(stack);
  const snapshots = [];
  const global = { drawSnapshot: (...args) => { snapshots.push(args); return Promise.resolve({ width: 1, height: 1, close() {} }); } };
  Object.assign(browser, {
    currentURI: { spec: url }, fullZoom: 1, focus() {},
    browsingContext: { usePrivateBrowsing: false, currentWindowGlobal: global },
    getBoundingClientRect: () => ({ left: 200, top: 10, width: 1000, height: 800, right: 1200, bottom: 810 }),
  });
  const tab = { label: "Harbor · Billing", linkedBrowser: browser, closing: false };
  const tabListeners = new Map();
  const listeners = new Map();
  const window = {
    document, closed: false, devicePixelRatio: 2, nsContextMenu: { contentData: null }, gContextMenu: null,
    DOMRect: class { constructor(x, y, width, height) { Object.assign(this, { x, y, width, height }); } },
    Services: { prefs: { getBoolPref: (name, fallback) => (name in prefs ? prefs[name] : fallback) } },
    addEventListener(type, fn, capture) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push({ fn, capture }); },
    removeEventListener(type, fn) { listeners.set(type, (listeners.get(type) ?? []).filter(item => item.fn !== fn)); },
    setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: id => clearTimeout(id),
    setInterval: () => 0, clearInterval: () => {},
    gBrowser: {
      selectedTab: tab, selectedBrowser: browser,
      getTabForBrowser: candidate => (candidate === browser ? tab : null),
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

  // Gecko order for chrome: window capture listeners first, then the target's own.
  function dispatchWindow(type, init) {
    const event = { type, isTrusted: true, defaultPrevented: false, stopped: false, button: 0, buttons: 0,
      target: browser, originalTarget: browser, clientX: 0, clientY: 0, screenX: 0, screenY: 0, ...init,
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; },
      stopImmediatePropagation() { this.stopped = true; } };
    for (const { fn } of listeners.get(type) ?? []) { fn(event); if (event.stopped) break; }
    return event;
  }
  function dispatchPopup(target) {
    const event = { type: "popupshowing", target, isTrusted: true, defaultPrevented: false, stopped: false,
      preventDefault() { this.defaultPrevented = true; }, stopImmediatePropagation() { this.stopped = true; } };
    for (const fn of document.listeners.get("popupshowing") ?? []) { fn(event); if (event.stopped) return event; }
    for (const fn of menu.listeners.get("popupshowing") ?? []) fn(event);
    return event;
  }
  // ContextMenuParent: the menu's data for this browser, then openPopupAtScreen.
  function contentAsksForMenu() {
    window.nsContextMenu.contentData = { browser, actor: { manager: { isCurrentGlobal: true } } };
    window.gContextMenu = { browser };
    return dispatchPopup(menu);
  }
  // mini-dom's addEventListener ignores the capture flag; record it per type.
  const docAdd = document.addEventListener.bind(document);
  document.addEventListener = (type, fn) => docAdd(type, fn);
  document.removeEventListener = (type, fn) => document.listeners.get(type)?.delete(fn);

  const clipboard = { writes: [], write(buffer, text) { this.writes.push({ buffer, text }); } };
  const toasts = [];
  const services = { isNormalWindow: () => true,
    projectForUrl: async () => ({ project: { id: "p_harbor", manifest: { name: "Harbor" } }, environment: { name: "web" } }) };
  const adapter = { isPrivateWindow: () => privateWindow, workspaceForTab: () => null };
  const buffer = new ArrayBuffer(8);
  const runtime = installRegionCapture(window, {
    services, adapter, engineOf: () => engine, clipboard,
    core: { isSensitiveHost: () => ({ sensitive: sensitiveHost }) },
    toast: (win, value) => toasts.push(value),
    encode: async () => ({ buffer, canvas: null }),
  });
  return { window, document, menu, stack, browser, tab, runtime, snapshots, clipboard, toasts, opened, buffer,
    dispatchWindow, contentAsksForMenu, tabListeners };
}

const down = (h, x = 400, y = 200) => h.dispatchWindow("mousedown", { button: 2, buttons: 2, clientX: x, clientY: y, screenX: x + 50, screenY: y + 60 });
const move = (h, x, y) => h.dispatchWindow("mousemove", { button: 0, buttons: 2, clientX: x, clientY: y });
const up = (h, x, y) => h.dispatchWindow("mouseup", { button: 2, buttons: 0, clientX: x, clientY: y });

test("a plain right-click still opens the normal menu at the same spot", () => {
  const h = harness();
  down(h);
  const held = h.contentAsksForMenu();
  assert.equal(held.defaultPrevented, true, "held back while the button is down");
  move(h, 403, 202); // under the drag threshold
  up(h, 403, 202);
  assert.equal(h.opened.length, 1);
  assert.deepEqual([h.opened[0].x, h.opened[0].y, h.opened[0].isContext], [450, 260, true]);
  assert.equal(h.opened[0].data.browser, h.browser, "the held menu data is restored");
  assert.equal(h.stack.querySelector(".axiosozo-region"), null);
  assert.equal(h.runtime.diagnostics().menus_kept, 1);
});

test("right-drag selects an area, captures it and offers Copy for agent", async () => {
  const h = harness();
  down(h);
  h.contentAsksForMenu();
  const moved = move(h, 400 + DRAG_THRESHOLD + 2, 230);
  assert.equal(moved.defaultPrevented, true, "the page gets no hover while selecting");
  move(h, 700, 400);
  const overlay = h.stack.querySelector(".axiosozo-region");
  assert.ok(overlay, "the selection is drawn over the browser, not in the page");
  assert.equal(overlay.querySelector(".axiosozo-region-box").style.width, "300px");
  up(h, 700, 400);
  await flush();
  assert.equal(h.opened.length, 0, "a drag never opens the menu");
  assert.equal(h.snapshots.length, 1);
  const [rect, scale, background, options] = h.snapshots[0];
  assert.deepEqual([rect.x, rect.y, rect.width, rect.height], [200, 190, 300, 200]);
  assert.equal(scale, 2);
  assert.equal(background, "rgb(255,255,255)");
  assert.deepEqual(options, { drawView: true });
  const bar = overlay.querySelector(".axiosozo-region-bar");
  assert.ok(bar);
  assert.equal(bar.getAttribute("role"), "dialog");
  assert.match(overlay.querySelector(".axiosozo-region-meta").textContent, /600 × 400 {2}· {2}Harbor · web/);
  overlay.querySelector(".axiosozo-region-note").value = "Retry does nothing";
  const [, , copyForAgent] = overlay.querySelectorAll("button");
  assert.equal(copyForAgent.textContent, "Copy for agent");
  copyForAgent.dispatchEvent({ type: "click", isTrusted: true });
  assert.equal(h.clipboard.writes.length, 1);
  assert.equal(h.clipboard.writes[0].buffer, h.buffer);
  assert.match(h.clipboard.writes[0].text, /URL: http:\/\/localhost:5173\/billing/);
  assert.match(h.clipboard.writes[0].text, /Note: Retry does nothing/);
  assert.equal(h.stack.querySelector(".axiosozo-region"), null, "done: the overlay is gone");
  assert.equal(h.toasts.at(-1).title, "Copied for your agent");
  // The late menu request of that drag is swallowed too.
  assert.equal(h.contentAsksForMenu().defaultPrevented, true);
});

test("Copy image copies only the picture; an untrusted click copies nothing", async () => {
  const h = harness();
  down(h); h.contentAsksForMenu(); move(h, 500, 300); up(h, 500, 300);
  await flush();
  const [, copyImage] = h.stack.querySelectorAll("button");
  copyImage.dispatchEvent({ type: "click", isTrusted: false });
  assert.equal(h.clipboard.writes.length, 0);
  copyImage.dispatchEvent({ type: "click", isTrusted: true });
  assert.deepEqual(h.clipboard.writes, [{ buffer: h.buffer, text: null }]);
  assert.equal(h.toasts.at(-1).title, "Image copied");
});

test("a page that handles right-click itself keeps its own drag", () => {
  const h = harness();
  down(h);
  // No menu request: the page called preventDefault on contextmenu.
  const moved = move(h, 600, 400);
  assert.equal(moved.defaultPrevented, false);
  up(h, 600, 400);
  assert.equal(h.stack.querySelector(".axiosozo-region"), null);
  assert.equal(h.opened.length, 0);
});

test("Escape and switching tabs cancel without copying", async () => {
  const h = harness();
  down(h); h.contentAsksForMenu(); move(h, 600, 400);
  const escape = h.dispatchWindow("keydown", { key: "Escape" });
  assert.equal(escape.defaultPrevented, true);
  assert.equal(h.stack.querySelector(".axiosozo-region"), null);
  up(h, 600, 400);
  await flush();
  assert.equal(h.snapshots.length, 0);

  down(h); h.contentAsksForMenu(); move(h, 600, 400); up(h, 600, 400);
  await flush();
  assert.ok(h.stack.querySelector(".axiosozo-region-bar"));
  h.tabListeners.get("TabSelect")();
  assert.equal(h.stack.querySelector(".axiosozo-region"), null);
  assert.equal(h.clipboard.writes.length, 0);
});

test("sensitive sites, Chromium tabs and non-web pages are never captured, and a drag says why", async () => {
  const reasons = [[{ sensitiveHost: true }, /sensitive sites/], [{ engine: "chromium" }, /Chromium/], [{ url: "about:preferences" }, /Only web pages/]];
  for (const [options, why] of reasons) {
    const h = harness(options);
    down(h);
    assert.equal(h.contentAsksForMenu().defaultPrevented, true, "held, so the native menu cannot swallow the drag");
    move(h, 600, 400);
    assert.equal(h.stack.querySelector(".axiosozo-region"), null, "nothing is selected");
    assert.match(h.toasts.at(-1)?.description ?? "", why);
    up(h, 600, 400);
    await flush();
    assert.equal(h.snapshots.length, 0);
    assert.equal(h.opened.length, 0, "the drag does not open the menu either");
    assert.equal(h.contentAsksForMenu().defaultPrevented, true, "nor does its late request");
    // A plain right-click on the same page keeps its normal menu.
    const fresh = harness(options);
    down(fresh); fresh.contentAsksForMenu(); up(fresh, 401, 200);
    assert.equal(fresh.opened.length, 1);
    assert.equal(fresh.toasts.length, 0);
    assert.equal(fresh.menu.querySelector(`#${REGION_MENU_ITEM}`).hidden, true, "and the menu entry is hidden");
  }
});

test("Control with the primary button (a trackpad's right-click) drags too", async () => {
  const h = harness();
  h.dispatchWindow("mousedown", { button: 0, buttons: 1, ctrlKey: true, clientX: 400, clientY: 200, screenX: 450, screenY: 260 });
  h.contentAsksForMenu();
  h.dispatchWindow("mousemove", { button: 0, buttons: 1, ctrlKey: true, clientX: 650, clientY: 380 });
  assert.ok(h.stack.querySelector(".axiosozo-region"));
  h.dispatchWindow("mouseup", { button: 0, buttons: 0, ctrlKey: true, clientX: 650, clientY: 380 });
  await flush();
  assert.equal(h.snapshots.length, 1);
  assert.ok(h.stack.querySelector(".axiosozo-region-bar"));
  // Without Control a left drag is the page's own.
  const plain = harness();
  plain.dispatchWindow("mousedown", { button: 0, buttons: 1, clientX: 400, clientY: 200 });
  plain.dispatchWindow("mousemove", { button: 0, buttons: 1, clientX: 650, clientY: 380 });
  assert.equal(plain.stack.querySelector(".axiosozo-region"), null);
});

test("private windows and the off pref install nothing", () => {
  for (const options of [{ privateWindow: true }, { prefs: { "axiosozo.regionCapture.enabled": false } }]) {
    const h = harness(options);
    assert.deepEqual(h.runtime.diagnostics(), {});
    assert.equal(h.menu.querySelector(`#${REGION_MENU_ITEM}`), null);
  }
});

test("the right-drag pref off leaves right-click alone; the menu entry still works", async () => {
  const h = harness({ prefs: { "axiosozo.regionCapture.rightDrag.enabled": false } });
  down(h);
  assert.equal(h.contentAsksForMenu().defaultPrevented, false);
  const item = h.menu.querySelector(`#${REGION_MENU_ITEM}`);
  assert.equal(item.hidden, false);
  assert.equal(item.getAttribute("label"), "Capture Area for Agent…");
  item.dispatchEvent({ type: "command", isTrusted: true });
  const overlay = h.stack.querySelector(".axiosozo-region");
  assert.equal(overlay.getAttribute("data-mode"), "select");
  assert.match(overlay.querySelector(".axiosozo-region-hint").textContent, /Drag over an area/);
  // A click without a drag takes the visible page.
  overlay.dispatchEvent({ type: "mousedown", button: 0, clientX: 300, clientY: 300, preventDefault() {} });
  overlay.dispatchEvent({ type: "mouseup", button: 0, clientX: 301, clientY: 300 });
  await flush();
  const [rect] = h.snapshots[0];
  assert.deepEqual([rect.x, rect.y, rect.width, rect.height], [0, 0, 1000, 800]);
});

test("a chrome modal (Ask AI) open over the window keeps right-click stock", () => {
  const h = harness();
  const modal = h.document.createElement("div");
  modal.setAttribute("aria-modal", "true");
  h.document.documentElement.append(modal);
  down(h);
  assert.equal(h.contentAsksForMenu().defaultPrevented, false);
  modal.remove();
  down(h);
  assert.equal(h.contentAsksForMenu().defaultPrevented, true);
});

test("dispose removes the menu entry, the overlay and every listener", async () => {
  const h = harness();
  down(h); h.contentAsksForMenu(); move(h, 600, 400);
  h.runtime.dispose();
  assert.equal(h.stack.querySelector(".axiosozo-region"), null);
  assert.equal(h.menu.querySelector(`#${REGION_MENU_ITEM}`), null);
  assert.equal(h.window.gBrowser.progressListeners.length, 0);
  down(h);
  assert.equal(h.contentAsksForMenu().defaultPrevented, false);
});
