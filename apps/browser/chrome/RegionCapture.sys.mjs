/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Capture an area for an agent, in one normal browser window.
//
// Two ways in, both on the page area of a Gecko tab:
//  - hold the right mouse button and drag: a plain right-click still opens the
//    normal context menu, unchanged. On macOS Gecko asks for the menu on
//    mousedown, so the menu's popupshowing is held back (its contentData kept)
//    while the button is down; a release without a drag opens it again at the
//    same spot. A page that handles right-click itself never asks for that
//    menu, so its own right-drag is left alone.
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
import * as defaultCore from "./contexts/index.mjs";
import { XHTML, defaultTimers, prefEnabled, webURL } from "./DevLoop.sys.mjs";

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
    refused: 0, cancelled: 0, failed: 0 };
  let disposed = false, lastEnd = null;
  // idle → pending (right button down) → selecting → captured; or select (menu) → selecting → captured.
  let gesture = null, view = null, swallowMenuUntil = 0, replaying = false, menuTab = null;

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
    const { root, browser } = view;
    view = null;
    root.remove();
    if (gBrowser.selectedBrowser === browser && document.activeElement?.closest?.(".axiosozo-region") == null) {
      try { browser.focus(); } catch {}
    }
  }

  // ---- the held-back context menu --------------------------------------------------
  const contextMenu = document.getElementById("contentAreaContextMenu");
  function onPopupShowing(event) {
    if (replaying || event.target !== contextMenu) return;
    const holding = gesture && (gesture.phase === "pending" || gesture.phase === "selecting")
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
    if (event.button !== 2 || !prefEnabled(window, REGION_PREFS.rightDrag, true)) return;
    const browser = browserUnder(event);
    if (!browser || modalOpen() || !sample(browser).ok) return;
    cancel("restart");
    gesture = { phase: "pending", browser, start: point(event), screenX: event.screenX, screenY: event.screenY,
      deferred: null, moved: false, last: point(event) };
  }
  function onMouseMove(event) {
    if (!gesture || !event.isTrusted) return;
    if (gesture.phase === "pending") {
      if (!(event.buttons & 2)) { gesture = null; return; }
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
        if (typeof name === "string" && name) project = { name, environment: match.environment?.name ?? null };
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
    const copyImage = node("button", "axiosozo-region-button", actions, { type: "button" });
    copyImage.textContent = "Copy image";
    const copyForAgent = node("button", "axiosozo-region-button axiosozo-region-primary", actions, { type: "button", title: "Copy for agent (Return)" });
    copyForAgent.textContent = "Copy for agent";
    close.addEventListener("click", () => cancel("dismissed"));
    copyImage.addEventListener("click", event => copy(event, false, noteField.value));
    copyForAgent.addEventListener("click", event => copy(event, true, noteField.value));
    bar.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.isComposing && (event.target === noteField || event.target === bar)) {
        event.preventDefault();
        copy(event, true, noteField.value);
      }
    });
    view.bar = bar;
    const stackRect = view.stack.getBoundingClientRect?.() ?? { width: 0, height: 0 };
    const barRect = bar.getBoundingClientRect?.() ?? { width: 0, height: 0 };
    const place = barPlacement(gesture.selection, { width: stackRect.width, height: stackRect.height },
      { width: barRect.width || 420, height: barRect.height || 84 });
    bar.style.left = `${place.left}px`;
    bar.style.top = `${place.top}px`;
    copyForAgent.focus();
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
