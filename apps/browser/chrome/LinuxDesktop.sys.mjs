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
 * for the wheel and smooth-scroll prefs Zen retunes off macOS: one wheel notch
 * scrolls as far, and stops as softly, as GNOME/KDE Firefox. */
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
