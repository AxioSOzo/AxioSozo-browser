/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// LinuxDesktop.sys.mjs: Linux-only default-branch prefs; user values and
// macOS are never touched.
import test from "node:test";
import assert from "node:assert/strict";
import { FIREFOX_LINUX_SCROLLING, LINUX_DEFAULTS, applyLinuxDesktopDefaults, firefoxWindowSize, installLinuxStyles, installLinuxWindowSizing }
  from "../chrome/LinuxDesktop.sys.mjs";

const PREF_INVALID = 0, PREF_STRING = 32, PREF_INT = 64, PREF_BOOL = 128;

function fakePrefs(types = {}) {
  const defaults = {};
  const user = {};
  const branch = {
    setBoolPref: (name, value) => { defaults[name] = value; },
    setIntPref: (name, value) => { defaults[name] = value; },
    setStringPref: (name, value) => { defaults[name] = value; },
  };
  return { PREF_INVALID, PREF_STRING, PREF_INT, PREF_BOOL, defaults, user,
    getPrefType: name => types[name] ?? PREF_INVALID,
    getDefaultBranch: root => { assert.equal(root, ""); return branch; },
    setIntPref: (name, value) => { user[name] = value; } };
}

test("macOS and other platforms: nothing changes", () => {
  for (const os of ["Darwin", "WINNT", undefined]) {
    const prefs = fakePrefs();
    assert.deepEqual(applyLinuxDesktopDefaults({ prefs, os }).results, {});
    assert.deepEqual(prefs.defaults, {});
  }
});

test("Linux: Firefox's own scrolling defaults and visible window controls, default branch only, once", () => {
  const types = { "general.smoothScroll.currentVelocityWeighting": PREF_STRING, "mousewheel.default.delta_multiplier_y": PREF_INT,
    "general.smoothScroll.msdPhysics.enabled": PREF_BOOL, "zen.view.hide-window-controls": PREF_BOOL };
  const prefs = fakePrefs(types);
  const first = applyLinuxDesktopDefaults({ prefs, os: "Linux" });
  assert.deepEqual(prefs.defaults, LINUX_DEFAULTS);
  assert.ok(Object.values(first.results).every(result => result === "set"), JSON.stringify(first.results));
  assert.deepEqual(prefs.user, {}, "the user branch is never written");
  assert.equal(prefs.defaults["mousewheel.default.delta_multiplier_y"], 100);
  assert.equal(prefs.defaults["general.smoothScroll.msdPhysics.enabled"], false);
  assert.equal(prefs.defaults["zen.view.hide-window-controls"], false);
  const again = applyLinuxDesktopDefaults({ prefs, os: "Linux" });
  assert.equal(again.alreadyApplied, true);
});

test("a pref of another type than expected is left alone", () => {
  const prefs = fakePrefs({ "general.smoothScroll.msdPhysics.enabled": PREF_STRING, "mousewheel.min_line_scroll_amount": PREF_BOOL });
  const { results } = applyLinuxDesktopDefaults({ prefs, os: "Linux" });
  assert.equal(results["general.smoothScroll.msdPhysics.enabled"], "type-mismatch");
  assert.equal(results["mousewheel.min_line_scroll_amount"], "type-mismatch");
  assert.ok(!("general.smoothScroll.msdPhysics.enabled" in prefs.defaults));
});

test("the scrolling values are Firefox 156's release defaults (not Zen's fastfox tuning)", () => {
  assert.deepEqual(FIREFOX_LINUX_SCROLLING, {
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
});

test("firefoxWindowSize: browser-init.js's first-window rule", () => {
  assert.deepEqual(firefoxWindowSize({ availWidth: 1280, availHeight: 800 }), { width: 1152, height: 720, maximized: true });
  assert.deepEqual(firefoxWindowSize({ availWidth: 1366, availHeight: 768 }), { width: 1229, height: 691, maximized: true });
  assert.deepEqual(firefoxWindowSize({ availWidth: 1920, availHeight: 1080 }), { width: 1280, height: 972, maximized: false });
  assert.deepEqual(firefoxWindowSize({ availWidth: 2560, availHeight: 1440 }), { width: 1280, height: 1040, maximized: false });
});

function welcomeWindow({ screen, staged = true, state = 1 }) {
  const attributes = new Set(staged ? ["zen-welcome-stage"] : []);
  const calls = [];
  let observer = null;
  const win = {
    STATE_NORMAL: 3, windowState: state, closed: false, screen: { availLeft: 0, availTop: 0, ...screen },
    document: { documentElement: { hasAttribute: name => attributes.has(name) } },
    MutationObserver: class { constructor(callback) { this.callback = callback; observer = this; }
      observe(target, options) { calls.push(["observe", options.attributeFilter]); }
      disconnect() { calls.push(["disconnect"]); } },
    requestAnimationFrame: callback => callback(),
    maximize: () => calls.push(["maximize"]),
    resizeTo: (w, h) => calls.push(["resizeTo", w, h]),
    moveTo: (x, y) => calls.push(["moveTo", x, y]),
  };
  return { win, calls, set: on => { if (on) attributes.add("zen-welcome-stage"); else attributes.delete("zen-welcome-stage"); observer.callback([]); } };
}

test("after Zen's welcome a small screen gets Firefox's maximized window, a large one Firefox's size", () => {
  const small = welcomeWindow({ screen: { availWidth: 1280, availHeight: 800 }, state: 3 });
  const dispose = installLinuxWindowSizing(small.win, { os: "Linux" });
  assert.equal(typeof dispose, "function");
  small.set(false);
  assert.deepEqual(small.calls, [["observe", ["zen-welcome-stage"]], ["disconnect"], ["maximize"]]);

  const large = welcomeWindow({ screen: { availWidth: 1920, availHeight: 1080 }, staged: false, state: 3 });
  installLinuxWindowSizing(large.win, { os: "Linux" });
  large.set(true); large.set(false);
  assert.deepEqual(large.calls.slice(1), [["disconnect"], ["resizeTo", 1280, 972], ["moveTo", 320, 54]]);
});

test("window sizing: no welcome, a window the user already maximized, and macOS are left alone", () => {
  const none = welcomeWindow({ screen: { availWidth: 1280, availHeight: 800 }, staged: false, state: 3 });
  installLinuxWindowSizing(none.win, { os: "Linux" });
  none.set(false);
  assert.deepEqual(none.calls, [["observe", ["zen-welcome-stage"]]]);
  const maximized = welcomeWindow({ screen: { availWidth: 1280, availHeight: 800 }, state: 1 });
  installLinuxWindowSizing(maximized.win, { os: "Linux" });
  maximized.set(false);
  assert.deepEqual(maximized.calls, [["observe", ["zen-welcome-stage"]], ["disconnect"]]);
  const mac = welcomeWindow({ screen: { availWidth: 1280, availHeight: 800 }, state: 3 });
  assert.equal(installLinuxWindowSizing(mac.win, { os: "Darwin" }), null);
  assert.deepEqual(mac.calls, []);
});

test("the Linux sheet is added on Linux only and removed by its disposer", () => {
  const nodes = [];
  const document = { documentElement: {}, createProcessingInstruction: (target, data) => ({ target, data, remove() { nodes.splice(nodes.indexOf(this), 1); } }),
    insertBefore: node => nodes.push(node) };
  assert.equal(installLinuxStyles({ document }, { os: "Darwin" }), null);
  assert.equal(nodes.length, 0);
  const dispose = installLinuxStyles({ document }, { os: "Linux" });
  assert.deepEqual(nodes.map(node => node.data), ['href="chrome://browser/content/axiosozo/linux-desktop.css" type="text/css"']);
  dispose();
  assert.equal(nodes.length, 0);
});
