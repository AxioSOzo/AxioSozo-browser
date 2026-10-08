/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The AxioSozo Lab list: data only, no imports and no code. Lab.sys.mjs checks
// every entry when it loads (a broken entry is left out and reported; it never
// takes the others down) and docs/lab/README.md explains each field.
//
// To add an experiment, add one entry below in id order (that keeps parallel
// additions from touching the same lines), declare
//   - name: axiosozo.lab.<id>.enabled
//     value: false
// in apps/browser/chrome/defaults.yaml, and put its module in chrome/lab/.
//
// Entry fields:
//   id         lowercase words with dashes ("page-tldr"); also the pref name part
//   title      sentence case, a few words
//   pitch      one plain sentence: what it does for you
//   howToTry   1 to 3 short steps
//   group      one of LAB_GROUPS
//   variantOf  optional: the id of the idea this one competes with (one of a
//              family is on at a time, and the Lab page shows them side by side)
//   needs      ["claude-code"], ["codex"], ["claude-code", "codex"],
//              ["antigravity"] or ["none"]: which of the user's own AI clients
//              it uses, and only when the user acts
//   module     its file under chrome/lab/, e.g. "page-tldr.sys.mjs" or
//              "page-tldr/page-tldr.sys.mjs"
//   installer  the export called per normal window: installX(window, ctx)
//   graduated  instead of module/installer, for a feature that already ships
//              outside the Lab: { pref, default, live } (its existing pref, its
//              default and whether flipping it applies to open windows)

/** Sections of the Lab page, in this order. Add one here if none fits. */
export const LAB_GROUPS = Object.freeze(["AI on the page", "Agents", "Your day", "Projects"]);

export const EXPERIMENT_LIST = Object.freeze([
  // Graduated: ships on by default through the startup installers (RegionCapture.sys.mjs).
  // The Lab only lists it and flips its existing pref; it never installs it.
  {
    id: "region-capture",
    title: "Capture an area for an agent",
    pitch: "Drag over part of any page with the right mouse button to copy that area, with the page address, for your coding agent.",
    howToTry: [
      "Hold the right mouse button and drag over part of a page.",
      "Click Copy for agent, then paste into Claude Code or Codex.",
    ],
    group: "AI on the page",
    needs: ["none"],
    graduated: { pref: "axiosozo.regionCapture.enabled", default: true, live: false },
  },
]);
