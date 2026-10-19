/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// LinuxDesktop.sys.mjs: Linux-only default-branch prefs; user values and
// macOS are never touched.
import test from "node:test";
import assert from "node:assert/strict";
import { FIREFOX_LINUX_SCROLLING, LINUX_DEFAULTS, applyLinuxDesktopDefaults } from "../chrome/LinuxDesktop.sys.mjs";

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
