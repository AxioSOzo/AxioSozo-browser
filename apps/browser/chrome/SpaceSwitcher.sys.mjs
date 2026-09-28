/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Bottom "smart slider" space switcher for Zen's sidebar foot: the current
// space's icon and name, then one small dot per space. It replaces Zen's space
// icon strip, the foot "+" (Create New) and the space header above the tabs
// (space-switcher.css), and swaps Zen's Library button for Downloads once.
// `axiosozo.ui.spaceSwitcher.enabled = false` returns to stock Zen, live.
//
// Every Zen name (ids, attributes, globals, menus) lives in
// ZenWorkspaceAdapter.sys.mjs; this module only calls the adapter. Zen's own
// space menu stays the context menu, so edit, icon, theme, delete and create
// work unchanged.

import { ZenWorkspaceAdapter, ZEN_SIDEBAR } from "./ZenWorkspaceAdapter.sys.mjs";

export const PREF = "axiosozo.ui.spaceSwitcher.enabled";
// 0 = not yet handled, 1 = we replaced Library with Downloads, 2 = handled, nothing to do.
export const LIBRARY_STATE_PREF = "axiosozo.ui.spaceSwitcher.libraryButton";
export const STYLESHEET = "chrome://browser/content/axiosozo/space-switcher.css";
export const ROOT_ATTRIBUTE = "axiosozo-space-switcher";
export const SWITCHER_ID = "axiosozo-space-switcher";
export const MAX_DOTS = 7;
export const WHEEL_THRESHOLD = 30; // px of horizontal travel for one step
export const WHEEL_IDLE_MS = 220; // a scroll gesture ends after this much quiet
const TAB_DROP_TYPE = "application/x-moz-tabbrowser-tab";
const XHTML = "http://www.w3.org/1999/xhtml";
const UUID_ATTRIBUTE = "space-uuid";

/** Visible dot range [start, end) for `count` spaces: a window of `max` dots
 * that keeps the active one inside (Zen-style compression past `max`). */
export function dotWindow(count, activeIndex, max = MAX_DOTS) {
  if (count <= max) return { start: 0, end: count };
  const active = Math.min(Math.max(activeIndex, 0), count - 1);
  const start = Math.min(Math.max(active - Math.floor(max / 2), 0), count - max);
  return { start, end: start + max };
}

/** "hidden", "small" (window edge with more spaces beyond) or "normal". */
export function dotSize(index, count, activeIndex, max = MAX_DOTS) {
  const { start, end } = dotWindow(count, activeIndex, max);
  if (index < start || index >= end) return "hidden";
  if (index !== activeIndex && ((index === start && start > 0) || (index === end - 1 && end < count))) return "small";
  return "normal";
}

function prefBool(prefs, name, fallback) {
  try { return prefs?.getBoolPref(name, fallback) ?? fallback; } catch { return fallback; }
}
function prefInt(prefs, name, fallback) {
  try { return prefs?.getIntPref(name, fallback) ?? fallback; } catch { return fallback; }
}

// Zen stores either an emoji or a chrome/resource SVG URL as the space icon.
function iconKind(icon) {
  if (!icon) return "none";
  if (/\.svg$/iu.test(icon)) return /^(chrome|resource):\/\//u.test(icon) ? "svg" : "none";
  return "text";
}

export function installSpaceSwitcher(window, { adapter = null, timers = null } = {}) {
  const document = window.document;
  const prefs = window.Services?.prefs;
  const zen = adapter ?? new ZenWorkspaceAdapter(window);
  const ownAdapter = !adapter;
  const clock = timers ?? {
    setTimeout: (fn, ms) => window.setTimeout(fn, ms), clearTimeout: id => window.clearTimeout(id),
  };
  const diagnostics = { active: false, renders: 0, switches: 0, library: "untouched" };
  let disposed = false;
  let view = null; // { container, name, icon, label, tablist, dots: Map, unsubscribe, sheet }
  let switching = null;
  let focusAfterSwitch = false;
  let wheel = { travel: 0, locked: false, idle: null };

  const xul = tag => document.createXULElement(tag);
  const html = (tag, className) => {
    const node = document.createElementNS(XHTML, tag);
    if (className) node.className = className;
    return node;
  };
  const setFlag = (node, name, on) => { if (on) node.setAttribute(name, "true"); else node.removeAttribute(name); };

  // ── Library button: one-time, reversible, and a later user customization wins.
  function syncLibrary(enabled) {
    const state = prefInt(prefs, LIBRARY_STATE_PREF, 0);
    try {
      if (enabled && state === 0) {
        const replaced = zen.replaceLibraryButton();
        prefs?.setIntPref(LIBRARY_STATE_PREF, replaced ? 1 : 2);
        diagnostics.library = replaced ? "replaced" : "absent";
      } else if (!enabled && state === 1) {
        zen.restoreLibraryButton();
        prefs?.setIntPref(LIBRARY_STATE_PREF, 0);
        diagnostics.library = "restored";
      }
    } catch (error) { console.error("AxioSozo: Library button state", error); }
  }

  async function go(uuid, { focus = false } = {}) {
    if (!uuid || switching || uuid === zen.activeWorkspaceUuid()) return false;
    focusAfterSwitch = focus;
    diagnostics.switches++;
    switching = Promise.resolve().then(() => zen.switchTo(uuid))
      .catch(error => { console.error("AxioSozo: space switch failed", error); return false; });
    try { return await switching; } finally {
      switching = null;
      if (!disposed) render();
      if (focusAfterSwitch) view?.dots.get(zen.activeWorkspaceUuid())?.focus?.();
      focusAfterSwitch = false;
    }
  }

  function renderIcon(space) {
    const { icon } = view;
    const value = space?.icon ?? "";
    const kind = iconKind(value);
    if (icon.getAttribute("icon") === `${kind}:${value}` && (kind !== "svg" || icon.firstChild)) return;
    icon.setAttribute("icon", `${kind}:${value}`);
    while (icon.firstChild) icon.firstChild.remove();
    icon.textContent = "";
    if (kind === "svg") {
      const image = html("img");
      image.setAttribute("src", value);
      image.setAttribute("alt", "");
      icon.appendChild(image);
    } else if (kind === "text") icon.textContent = value;
    setFlag(icon, "hidden", kind === "none");
  }

  function makeDot(uuid) {
    const dot = xul("toolbarbutton");
    dot.className = "axiosozo-space-dot no-squircles";
    dot.setAttribute("role", "tab");
    dot.setAttribute(UUID_ATTRIBUTE, uuid);
    dot.appendChild(html("span", "axiosozo-space-dot-mark no-squircles"));
    zen.markMenuTarget(dot, uuid);
    return dot;
  }

  function render() {
    if (!view || disposed) return;
    diagnostics.renders++;
    const spaces = zen.listWorkspaces();
    const active = zen.activeWorkspaceUuid();
    const activeIndex = spaces.findIndex(space => space.uuid === active);
    const current = activeIndex >= 0 ? spaces[activeIndex] : null;
    const { container, name, icon, label, tablist, dots } = view;

    // Zen's icon picker may clear its anchor's children; rebuild them if so.
    if (icon.parentNode !== name || label.parentNode !== name) {
      while (name.firstChild) name.firstChild.remove();
      name.append(icon, label);
      icon.removeAttribute("icon");
    }
    renderIcon(current);
    label.textContent = current?.name ?? "";
    if (current) {
      zen.markMenuTarget(name, current.uuid);
      name.setAttribute("aria-label", current.name ? `Space: ${current.name}` : "Space");
    }
    setFlag(container, "single", spaces.length < 2);
    setFlag(container, "empty", !current);
    setFlag(tablist, "hidden", spaces.length < 2);

    const wanted = new Set(spaces.map(space => space.uuid));
    for (const [uuid, dot] of dots) if (!wanted.has(uuid)) { dot.remove(); dots.delete(uuid); }
    spaces.forEach((space, index) => {
      let dot = dots.get(space.uuid);
      if (!dot) { dot = makeDot(space.uuid); dots.set(space.uuid, dot); }
      if (!dot.firstChild) dot.appendChild(html("span", "axiosozo-space-dot-mark no-squircles"));
      if (tablist.children[index] !== dot) tablist.insertBefore(dot, tablist.children[index] ?? null);
      const selected = space.uuid === active;
      const title = space.name || `Space ${index + 1}`;
      dot.setAttribute("aria-label", title);
      dot.setAttribute("tooltiptext", title);
      dot.setAttribute("aria-selected", selected ? "true" : "false");
      dot.setAttribute("aria-posinset", String(index + 1));
      dot.setAttribute("aria-setsize", String(spaces.length));
      // Roving tabindex: only the active dot (or the first, if none) is tabbable.
      dot.setAttribute("tabindex", selected || (activeIndex < 0 && index === 0) ? "0" : "-1");
      const size = dotSize(index, spaces.length, activeIndex < 0 ? 0 : activeIndex);
      dot.setAttribute("data-size", size);
      setFlag(dot, "hidden", size === "hidden");
    });
  }

  function dotOf(event) {
    const dot = event.target?.closest?.(".axiosozo-space-dot");
    return dot && view?.tablist.contains?.(dot) ? dot : null;
  }

  const onCommand = event => {
    if (event.isTrusted === false) return;
    if (view && event.target === view.name) { zen.openWorkspaceMenu(view.name, event); return; }
    const dot = dotOf(event);
    if (dot) go(dot.getAttribute(UUID_ATTRIBUTE));
  };

  const onKeyDown = event => {
    if (!dotOf(event)) return;
    const rtl = (() => { try { return !!view.container.matches?.(":dir(rtl)"); } catch { return false; } })();
    const spaces = zen.listWorkspaces();
    let target = null;
    switch (event.key) {
      case "ArrowRight": case "ArrowDown": target = zen.neighbourWorkspace(rtl && event.key === "ArrowRight" ? -1 : 1); break;
      case "ArrowLeft": case "ArrowUp": target = zen.neighbourWorkspace(rtl && event.key === "ArrowLeft" ? 1 : -1); break;
      case "Home": target = spaces[0]?.uuid ?? null; break;
      case "End": target = spaces.at(-1)?.uuid ?? null; break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
    go(target, { focus: true });
  };

  const onWheel = event => {
    const dx = event.deltaX ?? 0;
    if (!dx || Math.abs(dx) <= Math.abs(event.deltaY ?? 0)) return;
    event.preventDefault();
    const px = event.deltaMode === 1 ? dx * 16 : event.deltaMode === 2 ? dx * 400 : dx;
    if (wheel.idle !== null) clock.clearTimeout(wheel.idle);
    wheel.idle = clock.setTimeout(() => { wheel = { travel: 0, locked: false, idle: null }; }, WHEEL_IDLE_MS);
    if (wheel.locked) return; // one step per gesture, inertia included
    wheel.travel += px;
    if (Math.abs(wheel.travel) < WHEEL_THRESHOLD) return;
    wheel.locked = true;
    go(zen.neighbourWorkspace(Math.sign(wheel.travel), { scroll: true }));
  };

  // Like Zen's space icons: dragging a tab over a dot switches to that space.
  const onDragOver = event => {
    const dot = dotOf(event);
    const types = event.dataTransfer?.types;
    if (!dot || !types || !Array.from(types).includes(TAB_DROP_TYPE)) return;
    go(dot.getAttribute(UUID_ATTRIBUTE));
  };

  function activate() {
    if (view || disposed) return;
    const foot = zen.sidebarFoot();
    if (!foot) return;
    const sheet = document.createProcessingInstruction?.("xml-stylesheet", `href="${STYLESHEET}" type="text/css"`) ?? null;
    if (sheet) document.insertBefore(sheet, document.documentElement);

    const container = html("div");
    container.id = SWITCHER_ID;
    // Not a CustomizableUI widget: customization leaves it alone.
    container.setAttribute("skipintoolbarset", "true");
    container.setAttribute("removable", "false");
    const name = xul("toolbarbutton");
    name.className = "axiosozo-space-switcher-name no-squircles";
    name.setAttribute("aria-haspopup", "menu");
    const icon = html("span", "axiosozo-space-switcher-icon");
    icon.setAttribute("aria-hidden", "true");
    const label = html("span", "axiosozo-space-switcher-label");
    name.append(icon, label);
    const tablist = html("div", "axiosozo-space-dots");
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "Spaces");
    container.append(name, tablist);

    const strip = document.getElementById(ZEN_SIDEBAR.spaceIcons);
    if (strip?.parentNode === foot) strip.after(container); else foot.appendChild(container);
    container.addEventListener("command", onCommand);
    container.addEventListener("wheel", onWheel);
    tablist.addEventListener("keydown", onKeyDown);
    tablist.addEventListener("dragover", onDragOver);

    view = { container, name, icon, label, tablist, dots: new Map(), sheet, unsubscribe: zen.onUpdate(() => render()) };
    document.documentElement.setAttribute(ROOT_ATTRIBUTE, "true");
    diagnostics.active = true;
    render();
  }

  function deactivate() {
    if (!view) return;
    const { container, tablist, sheet, unsubscribe } = view;
    view = null;
    unsubscribe();
    container.removeEventListener("command", onCommand);
    container.removeEventListener("wheel", onWheel);
    tablist.removeEventListener("keydown", onKeyDown);
    tablist.removeEventListener("dragover", onDragOver);
    container.remove();
    sheet?.remove();
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    if (wheel.idle !== null) clock.clearTimeout(wheel.idle);
    wheel = { travel: 0, locked: false, idle: null };
    diagnostics.active = false;
  }

  function sync() {
    if (disposed) return;
    // Private, unsynced and workspace-less windows keep stock Zen.
    if (!zen.isAuthoritative()) { deactivate(); return; }
    const enabled = prefBool(prefs, PREF, true);
    syncLibrary(enabled);
    if (enabled) activate(); else deactivate();
  }

  const observer = { observe: () => sync() };
  try { prefs?.addObserver(PREF, observer); } catch {}
  const ready = zen.whenReady().then(sync).catch(error => console.error("AxioSozo: space switcher unavailable", error));

  return {
    ready,
    diagnostics: () => ({ ...diagnostics }),
    dispose() {
      if (disposed) return;
      deactivate();
      disposed = true;
      try { prefs?.removeObserver(PREF, observer); } catch {}
      if (ownAdapter) zen.dispose();
    },
  };
}
