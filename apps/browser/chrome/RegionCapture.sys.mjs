/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Capture an area for an agent, in one normal browser window.
//
// Two ways in, both on the page area of a Gecko tab:
//  - hold the right mouse button (or Control and the primary button, as a
//    trackpad without secondary click does) and drag: a plain right-click
//    still opens the normal context menu, unchanged. On macOS Gecko asks for
//    the menu on mousedown, so the menu's popupshowing is held back (its
//    contentData kept) while the button is down; a release without a drag
//    opens it again at the same spot. Every page's menu is held, so a drag
//    over a page that cannot be captured says why in a toast instead of
//    vanishing into the native menu. A page that handles right-click itself
//    never asks for that menu, so its own right-drag is left alone.
//  - "Capture Area for Agent…" in the page context menu: a select mode where a
//    left drag selects and a click takes the visible page.
//
// The selection is drawn in chrome over the tab's browser stack, never inside
// the page, and is never part of the image. The image comes from the tab's
// top window global (drawSnapshot of the visible view, at device resolution)
// and stays in memory. A small bar under the selection offers "Copy for agent"
// (the PNG plus a short note with the page address, project and an optional
// line from the user) and "Copy image". Nothing is sent anywhere: the only
// effect is the user's own clipboard, after their click. Private windows,
// sensitive sites, non-web pages and Chromium tabs are refused from chrome
// facts alone; the page is never asked.
//
// Other chrome code (AxioSozo Lab experiments) can add to the bar without
// forking it: registerCaptureExtension(window, { id, order, render, dispose })
// renders into every later capture of that window, through a small bar API
// (sections between the note and the buttons, actions, the note, the main
// action, Escape, the capture's facts). With nothing registered the bar is
// exactly as described above. See docs/design/region-capture.md.
import * as defaultCore from "./contexts/index.mjs";
import { XHTML, defaultTimers, prefEnabled, webURL } from "./DevLoop.sys.mjs";
import { MAC, currentPlatform } from "./overview/platform-words.mjs";

export const REGION_STYLESHEET = "chrome://browser/content/axiosozo/region-capture.css";
export const REGION_MENU_ITEM = "axiosozo-context-capture-area";
export const REGION_PREFS = Object.freeze({
  enabled: "axiosozo.regionCapture.enabled",
  rightDrag: "axiosozo.regionCapture.rightDrag.enabled",
});
/** CSS px the pointer must travel with the right button down before a drag
 * starts a selection; less is a click and keeps the normal menu. */
export const DRAG_THRESHOLD = 8;
/** Smallest selection side, in CSS px. */
export const MIN_SIDE = 8;
/** Longest image side in device px; larger selections are scaled down. */
export const MAX_IMAGE_SIDE = 2560;
/** How long after a drag a late context-menu request is still swallowed. */
export const LATE_MENU_MS = 1000;
const NOTE_LIMIT = 500;
const INERT = Object.freeze({ dispose() {}, diagnostics: () => ({}) });

/** The normalized selection between two chrome points, clamped to `bounds`
 * (the browser's client rect), relative to its top-left corner. */
export function selectionRect(start, end, bounds) {
  const clamp = (value, low, high) => Math.min(Math.max(value, low), high);
  const x0 = clamp(start.x, bounds.left, bounds.right), x1 = clamp(end.x, bounds.left, bounds.right);
  const y0 = clamp(start.y, bounds.top, bounds.bottom), y1 = clamp(end.y, bounds.top, bounds.bottom);
  return { x: Math.min(x0, x1) - bounds.left, y: Math.min(y0, y1) - bounds.top,
    width: Math.abs(x1 - x0), height: Math.abs(y1 - y0) };
}

/** drawSnapshot arguments for a chrome-px selection: the rect in content CSS
 * px of the visible view (page zoom divided out, rounded outward) and the
 * scale that gives device pixels, reduced so no side exceeds `maxSide`. */
export function snapshotRequest(selection, { zoom = 1, dpr = 1, maxSide = MAX_IMAGE_SIDE } = {}) {
  const left = Math.floor(selection.x / zoom), top = Math.floor(selection.y / zoom);
  const right = Math.ceil((selection.x + selection.width) / zoom), bottom = Math.ceil((selection.y + selection.height) / zoom);
  const rect = { x: left, y: top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
  let scale = dpr * zoom;
  const longest = Math.max(rect.width, rect.height) * scale;
  if (longest > maxSide) scale *= maxSide / longest;
  return { rect, scale, width: Math.round(rect.width * scale), height: Math.round(rect.height * scale) };
}

/** Where the action bar goes: under the selection when it fits, else above
 * it, else inside its bottom edge; always within the stack. */
export function barPlacement(selection, stack, bar, gap = 10) {
  const left = Math.min(Math.max(selection.x + selection.width - bar.width, 8), Math.max(8, stack.width - bar.width - 8));
  const below = selection.y + selection.height + gap;
  if (below + bar.height <= stack.height - 8) return { left, top: below };
  const above = selection.y - gap - bar.height;
  if (above >= 8) return { left, top: above };
  return { left, top: Math.max(8, selection.y + selection.height - bar.height - gap) };
}

/** The short text that travels with the image. Plain lines, no markup. */
export function agentNote({ title = "", url, project = null, note = "", width, height }) {
  const lines = [`Screenshot of part of a page (${width}×${height} px), captured in AxioSozo.`];
  const cleanTitle = String(title ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  if (cleanTitle) lines.push(`Page: ${cleanTitle}`);
  lines.push(`URL: ${url}`);
  if (project?.name) lines.push(`Project: ${project.name}${project.environment ? ` (${project.environment})` : ""}`);
  const cleanNote = String(note ?? "").replace(/\s+/g, " ").trim().slice(0, NOTE_LIMIT);
  if (cleanNote) lines.push(`Note: ${cleanNote}`);
  return lines.join("\n");
}

/** One calm sentence for why this tab cannot be captured. */
export function regionRefusalText(reason) {
  switch (reason) {
    case "PRIVATE": return "Pages in private windows are never captured for agents.";
    case "BLOCKED_CATEGORY": return "AxioSozo does not capture sensitive sites, such as banking, health or government sign-ins.";
    case "ENGINE": return "Capturing an area is not available for pages shown in Chromium yet.";
    case "NOT_WEB": return "Only web pages can be captured for an agent.";
    default: return "This page cannot be captured right now.";
  }
}

// ---- extensions ----------------------------------------------------------------------

const EXTENSION_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const registries = new WeakMap(); // window → { extensions: Map(id → record), listeners: Set(record → void) }
function registryOf(window) {
  let registry = registries.get(window);
  if (!registry) {
    registry = { extensions: new Map(), listeners: new Set() };
    registries.set(window, registry);
  }
  return registry;
}
/** The extensions of `window`, in the order they render (order, then id). */
function extensionsOf(window) {
  return [...(registries.get(window)?.extensions.values() ?? [])].sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/**
 * Adds to the capture bar of one browser window, from the next capture on.
 *
 *   const unregister = registerCaptureExtension(window, {
 *     id: "capture-ai",          // lowercase words with dashes; registering an id again replaces it
 *     order: 10,                 // lower renders first (default 0)
 *     render(bar, capture) { …; return { dispose() {} } }, // once per capture; dispose (or a returned
 *                                                         // function) runs when that capture ends
 *     dispose() {},              // once, when unregistered
 *   });
 *
 * `capture` (frozen): { png (Uint8Array, PNG bytes in memory), type ("image/png"),
 * width, height (device px), url, title, project ({ id, name, root,
 * environment } or null), note (getter: the note field now), browser, selection
 * ({ x, y, width, height } in CSS px of the browser), signal (aborts when this
 * capture ends or the extension is unregistered) }.
 *
 * `bar` (frozen): document; section({ label }) → an element between the note
 * and the buttons, in extension order; action({ label, title, primary,
 * onClick }) → a button right of Copy for agent (so a main action sits where
 * the main action always is); slot() → an empty inline element there for a
 * composite control; setDefault(onEnter, { button }) → release():
 * the bar's main action (Return in the note runs it, `button` looks primary,
 * Copy for agent becomes a plain button); note / setNote(text) / focusNote();
 * choose(event, text): a proposal became the task (the note is set, then the
 * latest onChoose handler runs; when none takes it, focus goes to the main
 * action); onChoose(handler(event, text) → truthy when taken, { verb }) →
 * release(), chooseVerb (the latest handler's verb or null); holdEscape(fn) →
 * release(): Escape calls fn instead of discarding the capture; stillValid()
 * (the page facts still hold; else the capture ends with the usual refusal);
 * finish() (ends the capture, as after a copy); dismiss(); reposition();
 * signal; isOpen.
 *
 * Unregistering removes everything it added from an open bar. An extension
 * that throws is logged and left out; the bar and Copy for agent keep working.
 */
export function registerCaptureExtension(window, extension) {
  if (!window || typeof window !== "object") throw new TypeError("registerCaptureExtension: a browser window");
  const { id, order = 0, render, dispose = null } = extension ?? {};
  if (typeof id !== "string" || id.length > 40 || !EXTENSION_ID.test(id)) throw new TypeError("registerCaptureExtension: id is lowercase words with dashes");
  if (typeof render !== "function") throw new TypeError("registerCaptureExtension: render(bar, capture) is a function");
  if (typeof order !== "number" || !Number.isFinite(order)) throw new TypeError("registerCaptureExtension: order is a number");
  if (dispose !== null && typeof dispose !== "function") throw new TypeError("registerCaptureExtension: dispose is a function");
  const registry = registryOf(window);
  registry.extensions.get(id)?.unregister();
  let active = true;
  const record = { id, order, render, unregister: null };
  record.unregister = () => {
    if (!active) return;
    active = false;
    if (registry.extensions.get(id) === record) registry.extensions.delete(id);
    for (const listener of [...registry.listeners]) {
      try { listener(record); } catch (error) { console.error("AxioSozo: removing a capture extension failed", error); }
    }
    try { dispose?.(); } catch (error) { console.error(`AxioSozo: capture extension ${id} did not clean up`, error); }
  };
  registry.extensions.set(id, Object.freeze(record));
  return record.unregister;
}

/** The ids registered in `window`, in render order (tests, diagnostics). */
export const captureExtensionIds = window => extensionsOf(window).map(record => record.id);

function nativeClipboard() {
  const { Cc, Ci, Services } = globalThis;
  return {
    /** PNG bytes and, when given, plain text, as one clipboard item. */
    write(buffer, text) {
      const tools = Cc["@mozilla.org/image/tools;1"].getService(Ci.imgITools);
      const image = tools.decodeImageFromArrayBuffer(buffer, "image/png");
      const transferable = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
      transferable.init(null);
      // As BrowserUtils.copyImageToClipboard: the native image flavour makes
      // macOS hand out a real PNG rather than this process's cached container.
      transferable.addDataFlavor("application/x-moz-nativeimage");
      transferable.setTransferData("application/x-moz-nativeimage", image);
      if (typeof text === "string" && text) {
        const string = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
        string.data = text;
        transferable.addDataFlavor("text/plain");
        transferable.setTransferData("text/plain", string);
      }
      Services.clipboard.setData(transferable, null, Services.clipboard.kGlobalClipboard);
    },
  };
}

/** PNG bytes of an ImageBitmap, drawn on a chrome canvas. */
async function encodePng(document, bitmap) {
  const canvas = document.createElementNS(XHTML, "canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => (value ? resolve(value) : reject(new Error("ENCODE"))), "image/png"));
  return { buffer: await blob.arrayBuffer(), canvas };
}

/**
 * Installs area capture for one normal browser window.
 * `services`: AxioSozoServices (isNormalWindow; projectForUrl optional).
 * `adapter`: ZenWorkspaceAdapter. Optional: `engineOf(tab)`, `core`
 * (isSensitiveHost), `timers`, `clipboard` ({ write(buffer, text) }),
 * `toast(window, { title, description })`, `snapshot(browser, request)`
 * (tests; resolves to an ImageBitmap-like) and `encode(document, bitmap)`.
 */
export function installRegionCapture(window, { services, adapter, engineOf = () => "gecko", core = defaultCore,
  timers = defaultTimers(window), clipboard = null, toast = null, snapshot = null, encode = encodePng,
  now = () => Date.now() } = {}) {
  if (typeof services?.isNormalWindow !== "function" || !adapter || !window?.gBrowser || !window.document
    || !prefEnabled(window, REGION_PREFS.enabled, true)) return INERT;
  try { if (adapter.isPrivateWindow() !== false) return INERT; } catch { return INERT; }
  const { document, gBrowser } = window;
  const cleanups = [];
  const diagnostics = { drags: 0, menus_kept: 0, select_modes: 0, captures: 0, copied: 0, copied_images: 0,
    refused: 0, cancelled: 0, failed: 0, extension_failures: 0, handed_off: 0 };
  let disposed = false, lastEnd = null;
  // idle → pending (right button down) → selecting → captured; or select (menu) → selecting → captured.
  let gesture = null, view = null, swallowMenuUntil = 0, replaying = false, menuTab = null;

  // An extension unregistered while its part of a bar is showing: that part goes now.
  const registry = registryOf(window);
  const onUnregistered = record => { if (view?.extensions?.has(record.id)) unmountExtension(view, record.id); };
  registry.listeners.add(onUnregistered);
  cleanups.push(() => registry.listeners.delete(onUnregistered));

  const sheet = document.createProcessingInstruction?.("xml-stylesheet", `href="${REGION_STYLESHEET}" type="text/css"`);
  if (sheet) document.insertBefore(sheet, document.documentElement);
  cleanups.push(() => sheet?.remove());

  const sensitive = host => {
    try { const value = core.isSensitiveHost(host); return typeof value?.sensitive === "boolean" ? value.sensitive : true; }
    catch { return true; }
  };

  /** Chrome facts of `browser` in this window, or why it cannot be captured. */
  function sample(browser) {
    try {
      if (disposed || window.closed) return { ok: false, reason: "UNAVAILABLE" };
      if (services.isNormalWindow(window) !== true || adapter.isPrivateWindow() !== false) return { ok: false, reason: "PRIVATE" };
      const tab = gBrowser.getTabForBrowser(browser);
      if (!tab || tab.closing || browser.documentGlobal !== window) return { ok: false, reason: "UNAVAILABLE" };
      if (engineOf(tab) !== "gecko") return { ok: false, reason: "ENGINE" };
      const context = browser.browsingContext;
      if (!context || context.usePrivateBrowsing !== false) return { ok: false, reason: "PRIVATE" };
      const global = context.currentWindowGlobal;
      if (!global || typeof global.drawSnapshot !== "function") return { ok: false, reason: "UNAVAILABLE" };
      const url = webURL(browser.currentURI?.spec);
      if (!url) return { ok: false, reason: "NOT_WEB" };
      if (sensitive(url.hostname)) return { ok: false, reason: "BLOCKED_CATEGORY" };
      return { ok: true, tab, browser, global, url: url.href, title: tab.label ?? "" };
    } catch { return { ok: false, reason: "UNAVAILABLE" }; }
  }

  const browserUnder = event => {
    const target = event.originalTarget ?? event.target;
    return target?.localName === "browser" && target.documentGlobal === window && gBrowser.getTabForBrowser(target) ? target : null;
  };
  const point = event => ({ x: event.clientX, y: event.clientY });
  // A chrome modal (Ask AI) owns the window until it closes.
  const modalOpen = () => { try { return !!document.querySelector?.('[aria-modal="true"]:not([hidden])'); } catch { return false; } };

  // ---- overlay ----------------------------------------------------------------------
  const node = (tag, className, parent, attrs = {}) => {
    const element = document.createElementNS(XHTML, tag);
    if (className) element.className = className;
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    parent?.append(element);
    return element;
  };

  function openView(browser, mode) {
    closeView();
    const stack = browser.parentNode;
    if (!stack?.classList?.contains("browserStack")) return null;
    const root = node("div", "axiosozo-region", stack, { "data-mode": mode });
    const shade = node("div", "axiosozo-region-shade", root);
    const box = node("div", "axiosozo-region-box", root);
    const size = node("div", "axiosozo-region-size", box, { "aria-hidden": "true" });
    let hint = null;
    if (mode === "select") {
      hint = node("div", "axiosozo-region-hint", root, { role: "status" });
      hint.textContent = "Drag over an area, or click to take the visible page. Esc to cancel.";
    }
    view = { browser, stack, root, shade, box, size, hint, bar: null };
    return view;
  }
  function drawSelection(selection) {
    if (!view) return;
    const { box, size, shade } = view;
    box.style.left = `${selection.x}px`; box.style.top = `${selection.y}px`;
    box.style.width = `${selection.width}px`; box.style.height = `${selection.height}px`;
    box.hidden = false;
    shade.hidden = true;
    size.textContent = `${Math.round(selection.width)} × ${Math.round(selection.height)}`;
    size.toggleAttribute("data-inside", selection.y < 30);
    view.root.setAttribute("data-selecting", "true");
    view.hint?.remove();
    view.hint = null;
  }
  function closeView() {
    if (!view) return;
    const current = view;
    const { root, browser } = current;
    view = null;
    // Every extension's part of this capture ends with it.
    for (const id of [...(current.extensions?.keys() ?? [])]) unmountExtension(current, id);
    root.remove();
    if (gBrowser.selectedBrowser === browser && document.activeElement?.closest?.(".axiosozo-region") == null) {
      try { browser.focus(); } catch {}
    }
  }

  // ---- the held-back context menu --------------------------------------------------
  const contextMenu = document.getElementById("contentAreaContextMenu");
  function onPopupShowing(event) {
    if (replaying || event.target !== contextMenu) return;
    const holding = gesture && ["pending", "selecting", "refused"].includes(gesture.phase)
      && window.nsContextMenu?.contentData?.browser === gesture.browser;
    if (holding) {
      gesture.deferred = window.nsContextMenu.contentData;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (gesture.phase === "pending" && gesture.moved) beginSelecting();
      return;
    }
    if (now() < swallowMenuUntil && window.nsContextMenu?.contentData?.browser === lastBrowser) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  let lastBrowser = null;
  function reopenMenu(saved) {
    const data = saved.deferred;
    try {
      if (!data?.actor?.manager?.isCurrentGlobal || !contextMenu) return;
      window.nsContextMenu.contentData = data;
      replaying = true;
      contextMenu.openPopupAtScreen(saved.screenX, saved.screenY, true);
      diagnostics.menus_kept++;
    } catch (error) { console.error("AxioSozo: context menu replay failed", error); }
    finally { replaying = false; }
  }

  // ---- gesture ---------------------------------------------------------------------
  function onMouseDown(event) {
    if (!event.isTrusted || disposed) return;
    // A click outside the bar ends a finished capture. (event.target, not
    // originalTarget: a text field's inner editor is anonymous content.)
    if (view?.bar && gesture?.phase === "captured" && !view.bar.contains(event.target)) cancel("outside");
    if (gesture?.phase === "select") return; // the select overlay handles its own mouse
    // The secondary button, or Control with the primary one: macOS (and a
    // trackpad without secondary click) sends that as a left press that asks
    // for the context menu. Elsewhere Control-click is an ordinary click
    // (Linux: open the link in a new tab), so only the secondary button counts.
    const secondary = event.button === 2 || (event.button === 0 && event.ctrlKey && !event.metaKey && !event.altKey
      && currentPlatform(window) === MAC);
    if (!secondary || !prefEnabled(window, REGION_PREFS.rightDrag, true)) return;
    const browser = browserUnder(event);
    if (!browser || modalOpen()) return;
    cancel("restart");
    // Every page's menu is held while the button is down, so a drag over a
    // page that cannot be captured says why instead of losing the drag to the
    // native menu. A release without a drag still gets its menu.
    const facts = sample(browser);
    gesture = { phase: "pending", browser, button: event.button, start: point(event), screenX: event.screenX, screenY: event.screenY,
      deferred: null, moved: false, last: point(event), refusal: facts.ok ? null : facts.reason };
  }
  function onMouseMove(event) {
    if (!gesture || !event.isTrusted) return;
    if (gesture.phase === "pending") {
      if (event.buttons === 0) { gesture = null; return; } // released outside this window
      gesture.last = point(event);
      if (Math.hypot(gesture.last.x - gesture.start.x, gesture.last.y - gesture.start.y) < DRAG_THRESHOLD) return;
      gesture.moved = true;
      // Only a drag over a page whose right-click is ours (the menu was asked
      // for) becomes a selection; a page with its own menu keeps its drag.
      if (gesture.deferred) beginSelecting();
    }
    if (gesture?.phase === "selecting") {
      event.preventDefault();
      event.stopPropagation();
      gesture.last = point(event);
      drawSelection(currentSelection());
    }
  }
  function beginSelecting() {
    if (gesture.refusal) {
      const reason = gesture.refusal;
      gesture.phase = "refused";
      lastBrowser = gesture.browser;
      swallowMenuUntil = now() + LATE_MENU_MS;
      refuse(reason);
      return;
    }
    const browser = gesture.browser;
    if (!openView(browser, "drag")) { gesture = null; return; }
    gesture.phase = "selecting";
    diagnostics.drags++;
    drawSelection(currentSelection());
  }
  function currentSelection() {
    return selectionRect(gesture.start, gesture.last, gesture.browser.getBoundingClientRect());
  }
  function onMouseUp(event) {
    if (!gesture || !event.isTrusted) return;
    if (gesture.phase === "refused") { gesture = null; return; }
    if (gesture.phase === "pending" && (event.button === 2 || event.button === 0)) {
      const saved = gesture;
      gesture = null;
      if (saved.deferred) reopenMenu(saved);
      return;
    }
    if (gesture.phase === "selecting") {
      lastBrowser = gesture.browser;
      swallowMenuUntil = now() + LATE_MENU_MS;
      const selection = currentSelection();
      if (selection.width < MIN_SIDE || selection.height < MIN_SIDE) { cancel("small"); return; }
      capture(gesture.browser, selection);
    }
  }

  // Select mode from the context menu: the overlay itself takes the mouse.
  function enterSelectMode(tab) {
    const facts = tab ? sample(tab.linkedBrowser) : { ok: false };
    if (!facts.ok) { refuse(facts.reason); return; }
    cancel("restart");
    const current = openView(facts.browser, "select");
    if (!current) return;
    diagnostics.select_modes++;
    gesture = { phase: "select", browser: facts.browser, start: null, last: null };
    const { root } = current;
    root.tabIndex = -1;
    root.focus();
    root.addEventListener("mousedown", event => {
      if (event.button !== 0 || gesture?.phase !== "select") return;
      event.preventDefault();
      gesture.start = point(event);
      gesture.last = point(event);
      gesture.phase = "dragging";
    });
    root.addEventListener("mousemove", event => {
      if (gesture?.phase !== "dragging") return;
      gesture.last = point(event);
      if (Math.hypot(gesture.last.x - gesture.start.x, gesture.last.y - gesture.start.y) >= 3) drawSelection(currentSelection());
    });
    root.addEventListener("mouseup", event => {
      if (gesture?.phase !== "dragging" || event.button !== 0) return;
      gesture.last = point(event);
      let selection = currentSelection();
      if (selection.width < MIN_SIDE || selection.height < MIN_SIDE) {
        // A click takes the whole visible page.
        const bounds = gesture.browser.getBoundingClientRect();
        selection = { x: 0, y: 0, width: bounds.width, height: bounds.height };
        drawSelection(selection);
      }
      capture(gesture.browser, selection);
    });
  }

  // ---- capture and the action bar ------------------------------------------------------
  async function capture(browser, selection) {
    const facts = sample(browser);
    if (!facts.ok) { cancel("refused"); refuse(facts.reason); return; }
    const token = {};
    gesture = { phase: "capturing", browser, token, selection };
    view?.root.setAttribute("data-busy", "true");
    try {
      const request = snapshotRequest(selection, { zoom: browser.fullZoom || 1, dpr: window.devicePixelRatio || 1 });
      const bitmap = snapshot
        ? await snapshot(browser, request)
        : await facts.global.drawSnapshot(new window.DOMRect(request.rect.x, request.rect.y, request.rect.width, request.rect.height),
          request.scale, "rgb(255,255,255)", { drawView: true });
      if (gesture?.token !== token) { bitmap?.close?.(); return; }
      const { buffer, canvas } = await encode(document, bitmap);
      bitmap?.close?.();
      if (gesture?.token !== token) return;
      // The tab may have changed while drawing; the facts must still hold.
      const again = sample(browser);
      if (!again.ok || again.url !== facts.url) { cancel("changed"); if (!again.ok) refuse(again.reason); return; }
      diagnostics.captures++;
      let project = null;
      try {
        const match = await services.projectForUrl?.(facts.url, adapter.workspaceForTab?.(facts.tab) ?? undefined);
        const name = match?.project?.manifest?.name ?? match?.project?.name;
        if (typeof name === "string" && name) {
          project = { id: typeof match.project.id === "string" ? match.project.id : null, name,
            root: typeof match.project.root === "string" ? match.project.root : null, environment: match.environment?.name ?? null };
        }
      } catch {}
      if (gesture?.token !== token) return;
      gesture = { phase: "captured", browser, token, selection, buffer, url: facts.url, title: facts.title,
        width: request.width, height: request.height, project };
      showBar(canvas);
    } catch (error) {
      if (gesture?.token !== token) return;
      diagnostics.failed++;
      console.error("AxioSozo: area capture failed", error);
      cancel("failed");
      toast?.(window, { title: "Could not capture this area", description: "Nothing was copied." });
    }
  }

  function showBar(canvas) {
    if (!view || gesture?.phase !== "captured") return;
    const { root, box } = view;
    root.removeAttribute("data-busy");
    root.setAttribute("data-captured", "true");
    // What you see is what you copy: the captured pixels replace the live page in the box.
    if (canvas) {
      canvas.className = "axiosozo-region-still";
      canvas.setAttribute("aria-hidden", "true");
      box.prepend(canvas);
    }
    const bar = node("div", "axiosozo-region-bar", root, { role: "dialog", "aria-label": "Captured area" });
    const meta = node("div", "axiosozo-region-meta", bar);
    const where = webURL(gesture.url);
    meta.textContent = [`${gesture.width} × ${gesture.height}`, gesture.project
      ? `${gesture.project.name}${gesture.project.environment ? ` · ${gesture.project.environment}` : ""}` : where?.host]
      .filter(Boolean).join("  ·  ");
    const noteField = node("input", "axiosozo-region-note", bar, { type: "text", maxlength: String(NOTE_LIMIT),
      placeholder: "Add a note for the agent (optional)", "aria-label": "Note for the agent (optional)", spellcheck: "true" });
    const actions = node("div", "axiosozo-region-actions", bar);
    const close = node("button", "axiosozo-region-button axiosozo-region-close", actions, { type: "button", "aria-label": "Discard capture", title: "Discard (Esc)" });
    const copyImage = node("button", "axiosozo-region-button axiosozo-region-copy-image", actions, { type: "button" });
    copyImage.textContent = "Copy image";
    const copyForAgent = node("button", "axiosozo-region-button axiosozo-region-primary", actions, { type: "button", title: "Copy for agent (Return)" });
    copyForAgent.textContent = "Copy for agent";
    close.addEventListener("click", () => cancel("dismissed"));
    copyImage.addEventListener("click", event => copy(event, false, noteField.value));
    copyForAgent.addEventListener("click", event => copy(event, true, noteField.value));
    const current = view;
    bar.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.isComposing && (event.target === noteField || event.target === bar)) {
        event.preventDefault();
        const main = current.defaults?.at(-1);
        if (!main) { copy(event, true, noteField.value); return; }
        try { main.onEnter(event); } catch (error) { console.error(`AxioSozo: capture extension ${main.own.record.id} failed`, error); }
      }
    });
    Object.assign(current, { bar, noteField, actions, copyImage, copyForAgent, selection: gesture.selection, extensions: new Map(),
      defaults: [], choosers: [], escapes: [] });
    placeBar(current);
    for (const record of extensionsOf(window)) mountExtension(current, record);
    // Focus starts on the main action unless an extension moved it (to the note, say).
    if (view === current && !bar.contains(document.activeElement)) (current.defaults.at(-1)?.button ?? copyForAgent).focus();
  }

  /** Puts the bar under (else over, else inside) the selection for its current size. */
  function placeBar(current) {
    if (!current?.bar) return;
    const stackRect = current.stack.getBoundingClientRect?.() ?? { width: 0, height: 0 };
    const barRect = current.bar.getBoundingClientRect?.() ?? { width: 0, height: 0 };
    const place = barPlacement(current.selection, { width: stackRect.width, height: stackRect.height },
      { width: barRect.width || 420, height: barRect.height || 84 });
    current.bar.style.left = `${place.left}px`;
    current.bar.style.top = `${place.top}px`;
  }

  // ---- extensions on this bar ----------------------------------------------------------
  /** Copy for agent looks primary only while no extension holds the main action. */
  function applyDefault(current) {
    const main = current.defaults.at(-1) ?? null;
    current.copyForAgent.classList[main ? "remove" : "add"]("axiosozo-region-primary");
    for (const item of current.defaults) item.button?.classList[item === main ? "add" : "remove"]("axiosozo-region-primary");
  }

  function mountExtension(current, record) {
    const Controller = window.AbortController ?? globalThis.AbortController;
    const own = { record, controller: new Controller(), nodes: new Set(), cleanup: null, rank: current.extensions.size };
    current.extensions.set(record.id, own);
    current.bar.setAttribute("data-extended", "true");
    const live = () => view === current && current.extensions.get(record.id) === own && !own.controller.signal.aborted;
    const keep = element => { own.nodes.add(element); return element; };
    // Each extension's nodes stay together and in extension order.
    const insertOwn = (parent, element, fallback) => {
      const later = [...parent.children].find(child => Number(child.getAttribute?.("data-extension-rank")) > own.rank && child !== element);
      element.setAttribute("data-extension", record.id);
      element.setAttribute("data-extension-rank", String(own.rank));
      parent.insertBefore(element, later ?? fallback);
      keep(element);
      placeBar(current);
      return element;
    };
    const facts = gesture;
    const capture = Object.freeze({
      png: new Uint8Array(facts.buffer), type: "image/png", width: facts.width, height: facts.height, url: facts.url, title: facts.title,
      project: facts.project ? Object.freeze({ ...facts.project }) : null,
      get note() { return current.noteField.value; },
      browser: facts.browser, selection: Object.freeze({ ...facts.selection }), signal: own.controller.signal,
    });
    const release = (list, item) => () => {
      const at = list.indexOf(item);
      if (at < 0) return;
      list.splice(at, 1);
      if (list === current.defaults) {
        item.button?.classList.remove("axiosozo-region-primary");
        applyDefault(current);
      }
    };
    const bar = Object.freeze({
      document,
      signal: own.controller.signal,
      get isOpen() { return live(); },
      get note() { return current.noteField.value; },
      section({ label = null } = {}) {
        if (!live()) return null;
        const element = node("div", "axiosozo-region-section", null, label ? { role: "group", "aria-label": String(label) } : {});
        return insertOwn(current.bar, element, current.actions);
      },
      action({ label, title = null, primary = false, onClick = null } = {}) {
        if (!live()) return null;
        const element = node("button", "axiosozo-region-button", null, { type: "button" });
        element.textContent = String(label ?? "");
        if (title) element.setAttribute("title", String(title));
        if (typeof onClick === "function") {
          element.addEventListener("click", event => {
            if (element.disabled || !live()) return;
            try { onClick(event); } catch (error) { console.error(`AxioSozo: capture extension ${record.id} failed`, error); }
          });
        }
        // Secondary actions sit quietly before Copy for agent; primary ones at the end.
        if (!primary) element.classList.add("axiosozo-region-quiet");
        insertOwn(current.actions, element, primary ? null : current.copyForAgent);
        if (primary && typeof onClick === "function") bar.setDefault(onClick, { button: element });
        return element;
      },
      slot() {
        if (!live()) return null;
        return insertOwn(current.actions, node("span", "axiosozo-region-slot"), null);
      },
      setDefault(onEnter, { button = null } = {}) {
        if (!live() || typeof onEnter !== "function") return () => {};
        const item = { own, onEnter, button };
        current.defaults.push(item);
        applyDefault(current);
        return release(current.defaults, item);
      },
      setNote(text) {
        if (!live()) return;
        current.noteField.value = String(text ?? "").replace(/\s+/gu, " ").trim().slice(0, NOTE_LIMIT);
      },
      focusNote() { if (live()) current.noteField.focus(); },
      // A proposal only fills the task: the user reads (or trims) it and
      // presses Return or the bar's own button. AI suggests; it never starts
      // an agent by itself. (Choosers stay registered for a future "start at
      // once" variant.)
      choose(event, text) {
        if (!live()) return false;
        bar.setNote(text);
        if (view === current) (current.defaults.at(-1)?.button ?? current.copyForAgent).focus();
        return false;
      },
      onChoose(handler, { verb = null } = {}) {
        if (!live() || typeof handler !== "function") return () => {};
        const item = { own, handler, verb: typeof verb === "string" && verb ? verb : null };
        current.choosers.push(item);
        return release(current.choosers, item);
      },
      get chooseVerb() { return current.choosers.at(-1)?.verb ?? null; },
      holdEscape(fn) {
        if (!live() || typeof fn !== "function") return () => {};
        const item = { own, fn };
        current.escapes.push(item);
        return release(current.escapes, item);
      },
      stillValid() {
        if (!live() || gesture?.token !== facts.token) return false;
        const again = sample(facts.browser);
        if (again.ok && again.url === facts.url) return true;
        cancel("changed");
        refuse(again.ok ? "UNAVAILABLE" : again.reason);
        return false;
      },
      finish() { if (view === current) { diagnostics.handed_off++; finish(); } },
      dismiss() { if (view === current) cancel("dismissed"); },
      reposition() { if (live()) placeBar(current); },
    });
    try {
      const handle = record.render(bar, capture);
      own.cleanup = typeof handle === "function" ? handle : typeof handle?.dispose === "function" ? () => handle.dispose() : null;
    } catch (error) {
      diagnostics.extension_failures++;
      console.error(`AxioSozo: capture extension ${record.id} failed`, error);
      unmountExtension(current, record.id);
    }
  }

  /** Removes one extension's part of a bar: its signal aborts, its cleanup runs, its nodes and claims go. */
  function unmountExtension(current, id) {
    const own = current?.extensions?.get(id);
    if (!own) return;
    current.extensions.delete(id);
    try { own.controller.abort(); } catch {}
    try { own.cleanup?.(); } catch (error) { console.error(`AxioSozo: capture extension ${id} did not clean up`, error); }
    for (const element of own.nodes) element.remove();
    for (const list of [current.defaults, current.choosers, current.escapes]) {
      for (let at = list.length - 1; at >= 0; at--) if (list[at].own === own) list.splice(at, 1);
    }
    applyDefault(current);
    if (!current.extensions.size) current.bar?.removeAttribute("data-extended");
    if (view === current) placeBar(current);
  }

  function copy(event, withNote, note) {
    if (!event?.isTrusted || gesture?.phase !== "captured") return;
    const current = gesture;
    const facts = sample(current.browser);
    if (!facts.ok || facts.url !== current.url) { cancel("changed"); refuse(facts.ok ? "UNAVAILABLE" : facts.reason); return; }
    const text = withNote ? agentNote({ title: current.title, url: current.url, project: current.project, note,
      width: current.width, height: current.height }) : null;
    try {
      (clipboard ?? nativeClipboard()).write(current.buffer, text);
    } catch (error) {
      diagnostics.failed++;
      console.error("AxioSozo: copying the capture failed", error);
      toast?.(window, { title: "Could not copy the capture", description: "Nothing was copied." });
      return;
    }
    if (withNote) diagnostics.copied++; else diagnostics.copied_images++;
    finish();
    toast?.(window, withNote
      ? { title: "Copied for your agent", description: "The image and a note with the page address are on the clipboard." }
      : { title: "Image copied" });
  }

  function refuse(reason) {
    diagnostics.refused++;
    toast?.(window, { title: "Can't capture this page", description: regionRefusalText(reason) });
  }
  function finish() {
    gesture = null;
    closeView();
  }
  function cancel(why) {
    if (!gesture && !view) return;
    if (gesture?.phase === "selecting") swallowMenuUntil = now() + LATE_MENU_MS;
    if (why !== "restart" && why !== "small") diagnostics.cancelled++;
    lastEnd = why;
    gesture = null;
    closeView();
  }

  function onKeyDown(event) {
    if (event.key !== "Escape" || !gesture) return;
    event.preventDefault();
    event.stopPropagation();
    // An extension's open menu (say) closes first; the capture stays.
    const held = view?.escapes?.at(-1);
    if (held && gesture.phase === "captured") {
      try { held.fn(event); } catch (error) { console.error(`AxioSozo: capture extension ${held.own.record.id} failed`, error); }
      return;
    }
    cancel("escape");
  }
  const onTabSelect = () => cancel("tab");
  // Losing the window mid-drag loses its mouseup; a waiting selection stays.
  const onBlur = event => {
    if (event.target === window && ["pending", "selecting", "dragging"].includes(gesture?.phase)) cancel("blur");
  };
  const onResize = () => cancel("resize");
  const onLocation = {
    onLocationChange(browser) { if (gesture?.browser === browser || view?.browser === browser) cancel("navigated"); },
  };

  window.addEventListener("mousedown", onMouseDown, true);
  window.addEventListener("mousemove", onMouseMove, true);
  window.addEventListener("mouseup", onMouseUp, true);
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("blur", onBlur, true);
  window.addEventListener("resize", onResize);
  document.addEventListener("popupshowing", onPopupShowing, true);
  gBrowser.tabContainer.addEventListener("TabSelect", onTabSelect);
  gBrowser.addTabsProgressListener(onLocation);
  cleanups.push(() => {
    window.removeEventListener("mousedown", onMouseDown, true);
    window.removeEventListener("mousemove", onMouseMove, true);
    window.removeEventListener("mouseup", onMouseUp, true);
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("blur", onBlur, true);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("popupshowing", onPopupShowing, true);
    gBrowser.tabContainer.removeEventListener("TabSelect", onTabSelect);
    try { gBrowser.removeTabsProgressListener(onLocation); } catch {}
  });

  // ---- the context-menu entry -----------------------------------------------------------
  if (contextMenu) {
    const item = document.createXULElement("menuitem");
    item.id = REGION_MENU_ITEM;
    item.setAttribute("label", "Capture Area for Agent…");
    item.setAttribute("accesskey", "r");
    item.hidden = true;
    // Opening the menu reads nothing from the page: only chrome's own facts.
    const onShowing = event => {
      if (event.target !== contextMenu) return;
      menuTab = null;
      let browser = null;
      try { browser = window.gContextMenu?.browser ?? null; } catch { browser = null; }
      const facts = browser ? sample(browser) : { ok: false };
      menuTab = facts.ok && facts.tab === gBrowser.selectedTab ? facts.tab : null;
      item.hidden = !menuTab;
    };
    const onHidden = event => { if (event.target === contextMenu) timers.setTimeout(() => { menuTab = null; }, 0); };
    const onCommand = event => { if (event.isTrusted) enterSelectMode(menuTab); };
    contextMenu.addEventListener("popupshowing", onShowing);
    contextMenu.addEventListener("popuphidden", onHidden);
    item.addEventListener("command", onCommand);
    const anchor = document.getElementById("context-sep-screenshots");
    if (anchor?.parentNode === contextMenu) contextMenu.insertBefore(item, anchor);
    else contextMenu.append(item);
    cleanups.push(() => {
      contextMenu.removeEventListener("popupshowing", onShowing);
      contextMenu.removeEventListener("popuphidden", onHidden);
      item.removeEventListener("command", onCommand);
      item.remove();
    });
  }

  return Object.freeze({
    /** Counts only; no URLs, titles, notes or pixels. */
    diagnostics: () => ({ ...diagnostics, phase: gesture?.phase ?? null, last_end: lastEnd }),
    /** Starts select mode on the selected tab (tests and future entry points). */
    selectArea: () => enterSelectMode(gBrowser.selectedTab),
    dispose() {
      if (disposed) return;
      cancel("disposed");
      disposed = true;
      for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
    },
  });
}
