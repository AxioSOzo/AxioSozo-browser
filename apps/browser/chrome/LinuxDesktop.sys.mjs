/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Linux desktop defaults: Zen/Gecko on GNOME and KDE should behave like the
// stock Firefox those users know, not like a macOS app ported over.
//
// Only the DEFAULT branch changes, only on Linux, and only for prefs listed
// here; a value the user set in about:config (the user branch) always wins and
// is never touched. macOS and every other platform return at once.
//
// Why at runtime and not in defaults.yaml: Zen's own prefs (for example
// prefs/fastfox/smoothscroll.yaml) already define most of these, and Zen's
// ffprefs generator orders equal names by directory listing order, so a second
// YAML entry for the same name would win or lose by file system. These are all
// live prefs (mirror: always, or read through -moz-pref() in CSS), so the first
// window follows them as soon as it starts.
//
// Kept as Firefox ships them on Linux (checked, not changed, see
// scripts/gui_gecko_feel.py): middlemouse.paste=true, general.autoScroll=false,
// widget.gtk.overlay-scrollbars.enabled=true, apz.gtk.kinetic_scroll.enabled=true,
// widget.use-xdg-desktop-portal.file-picker=2, fontconfig hinting/subpixel,
// the system colour scheme (zen.view.window.scheme=2), WebRender/VA-API/dmabuf.

/** Firefox 156 release defaults (modules/libpref/init/StaticPrefList.yaml, all.js)
 * for the wheel and smooth-scroll prefs Zen retunes off macOS: the scroll
 * animation (no MSD physics, Firefox's durations and weightings) is GNOME/KDE
 * Firefox's. Distance per notch was already the same (measured 114 px either
 * way): Firefox reaches its 2x through mousewheel.system_scroll_override, which
 * only applies at the default multiplier of 100 and steps aside when the user
 * set their own desktop scroll speed; Zen's 200 bypassed that. */
export const FIREFOX_LINUX_SCROLLING = Object.freeze({
  "general.smoothScroll.msdPhysics.enabled": false,
  "general.smoothScroll.currentVelocityWeighting": "0.25",
  "general.smoothScroll.stopDecelerationWeighting": "0.4",
  "general.smoothScroll.mouseWheel.durationMinMS": 50,
  "general.smoothScroll.msdPhysics.continuousMotionMaxDeltaMS": 120,
  "general.smoothScroll.msdPhysics.motionBeginSpringConstant": 1250,
  "general.smoothScroll.msdPhysics.regularSpringConstant": 1000,
  "general.smoothScroll.msdPhysics.slowdownMinDeltaMS": 12,
  "general.smoothScroll.msdPhysics.slowdownSpringConstant": 2000,
  "mousewheel.min_line_scroll_amount": 5,
  "mousewheel.default.delta_multiplier_y": 100,
});

/** Window controls: GNOME and KDE always show close (and the buttons the
 * desktop's decoration layout asks for); Zen hides them until the pointer
 * reaches the top edge. */
export const LINUX_WINDOW = Object.freeze({
  "zen.view.hide-window-controls": false,
});

export const LINUX_DEFAULTS = Object.freeze({ ...FIREFOX_LINUX_SCROLLING, ...LINUX_WINDOW });

const applied = new WeakSet();

function setDefault(branch, prefs, name, value) {
  const type = prefs.getPrefType(name);
  if (typeof value === "boolean" && (type === prefs.PREF_BOOL || type === prefs.PREF_INVALID)) branch.setBoolPref(name, value);
  else if (typeof value === "number" && (type === prefs.PREF_INT || type === prefs.PREF_INVALID)) branch.setIntPref(name, value);
  else if (typeof value === "string" && (type === prefs.PREF_STRING || type === prefs.PREF_INVALID)) branch.setStringPref(name, value);
  // A float pref Zen declared as a number would be PREF_INT: keep its type.
  else if (typeof value === "string" && type === prefs.PREF_INT && /^-?\d+$/u.test(value)) branch.setIntPref(name, Number(value));
  else return "type-mismatch";
  return "set";
}

// Firefox's first-window rule (browser/base/content/browser-init.js): 90% of
// the available screen, at most 1280x1040, maximized when both fall short.
const FIREFOX_TARGET = Object.freeze({ width: 1280, height: 1040 });
export function firefoxWindowSize(screen) {
  const width = Math.min(screen.availWidth * 0.9, FIREFOX_TARGET.width);
  const height = Math.min(screen.availHeight * 0.9, FIREFOX_TARGET.height);
  return { width: Math.round(width), height: Math.round(height),
    maximized: width < FIREFOX_TARGET.width && height < FIREFOX_TARGET.height };
}

const WELCOME = "zen-welcome-stage";
const sizing = new WeakMap(); // window → what installLinuxWindowSizing saw and did (GUI evidence)

/** Read-only record of the welcome sizing in `window`, or null. */
export function linuxWindowSizingState(window) {
  const state = sizing.get(window);
  return state ? { ...state, events: [...state.events] } : null;
}

/** Zen's welcome locks the first window to 1200x720, centred, and leaves it
 * that size when it ends. On Linux the window then takes the size stock
 * Firefox gives a first window on this screen: maximized on screens below
 * 1280x1040 (most laptops), otherwise Firefox's default size, centred. Only
 * the welcome's own end triggers it; any later resize is the user's. Returns
 * a disposer, or null when there is nothing to do. */
export function installLinuxWindowSizing(window, { os = globalThis.Services?.appinfo?.OS } = {}) {
  const root = window?.document?.documentElement;
  if (os !== "Linux" || !root || typeof window.MutationObserver !== "function") return null;
  const state = { seenAtInstall: root.hasAttribute(WELCOME), events: [] };
  sizing.set(window, state);
  let seen = state.seenAtInstall;
  const apply = () => {
    state.events.push(`check windowState=${window.windowState}`);
    if (window.closed || window.windowState !== window.STATE_NORMAL) return;
    const size = firefoxWindowSize(window.screen);
    if (size.maximized) { state.events.push("maximize"); window.maximize(); return; }
    state.events.push(`resize ${size.width}x${size.height}`);
    window.resizeTo(size.width, size.height);
    window.moveTo(window.screen.availLeft + (window.screen.availWidth - size.width) / 2,
      window.screen.availTop + (window.screen.availHeight - size.height) / 2);
  };
  const observer = new window.MutationObserver(() => {
    if (root.hasAttribute(WELCOME)) { seen = true; state.events.push("welcome"); return; }
    if (!seen) return;
    state.events.push("welcome ended");
    observer.disconnect();
    // Zen fades the browser back in after unlockWindowSize(); size it once
    // that has settled, then once more in case the fade reset the size.
    window.requestAnimationFrame(apply);
    window.setTimeout?.(apply, 1000);
  });
  observer.observe(root, { attributes: true, attributeFilter: [WELCOME] });
  return () => observer.disconnect();
}

export const LINUX_SHEET = "chrome://browser/content/axiosozo/linux-desktop.css";

/** The Linux chrome sheet (linux-desktop.css) in this window. Returns a disposer, or null off Linux. */
export function installLinuxStyles(window, { os = globalThis.Services?.appinfo?.OS } = {}) {
  const document = window?.document;
  if (os !== "Linux" || typeof document?.createProcessingInstruction !== "function") return null;
  const sheet = document.createProcessingInstruction("xml-stylesheet", `href="${LINUX_SHEET}" type="text/css"`);
  document.insertBefore(sheet, document.documentElement);
  return () => sheet.remove();
}

/** Applies LINUX_DEFAULTS to the default branch on Linux. Idempotent per prefs
 * service; returns { platform, results: { name: "set" | "type-mismatch" | error } }. */
export function applyLinuxDesktopDefaults({ prefs = globalThis.Services?.prefs, os = globalThis.Services?.appinfo?.OS } = {}) {
  if (os !== "Linux" || !prefs) return { platform: os ?? null, results: {} };
  const results = {};
  if (applied.has(prefs)) return { platform: os, results, alreadyApplied: true };
  applied.add(prefs);
  const branch = prefs.getDefaultBranch("");
  for (const [name, value] of Object.entries(LINUX_DEFAULTS)) {
    try { results[name] = setDefault(branch, prefs, name, value); }
    catch (error) { results[name] = String(error?.name ?? error); }
  }
  return { platform: os, results };
}
