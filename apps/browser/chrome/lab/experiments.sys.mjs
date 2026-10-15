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
  // Agent presence (agents-folder/, agents-on-rows/, shared presence/): every agent session,
  // where the eye already goes; only "needs you" interrupts, "done" waits with its result.
  {
    id: "agents-folder",
    title: "Agents as tabs in a folder",
    pitch: "Each space gets a Zen live folder Agents where every agent session of its projects is a tab that says what it does and opens its result.",
    howToTry: [
      "Start a task for one of your projects, such as Harbor, here or in Claude Code in your terminal.",
      "Watch its tab in the Agents folder of that project's space.",
      "Click it when it is done: its page opens with the result.",
    ],
    group: "Agents",
    needs: ["claude-code", "codex", "antigravity"],
    module: "agents-folder/agents-folder.sys.mjs",
    installer: "installAgentsFolder",
  },
  {
    id: "agents-on-rows",
    title: "Agents on the project rows",
    pitch: "Your projects in the sidebar show what their agents do: working, needs you or done, with what waits on you listed above them.",
    howToTry: [
      "Start a task for one of your projects, such as Harbor, here or in Claude Code in your terminal.",
      "Watch the mark at the end of its row in the sidebar.",
      "Click the mark to see the result, or the line under Needs you.",
    ],
    group: "Agents",
    variantOf: "agents-folder",
    needs: ["claude-code", "codex", "antigravity"],
    module: "agents-on-rows/agents-on-rows.sys.mjs",
    installer: "installAgentsOnRows",
  },
  // What's wrong here? (capture-ai/): after a capture, the user's own AI proposes next steps.
  {
    id: "capture-ai-auto",
    title: "What's wrong here: it looks right away",
    pitch: "When you capture an area of one of your projects' pages, your own AI proposes up to three concrete next steps for your agent.",
    howToTry: [
      "Open a page of one of your projects, such as Harbor.",
      "Hold the right mouse button and drag over something that looks wrong.",
      "Pick one of the proposals: it becomes your agent's task.",
    ],
    group: "AI on the page",
    needs: ["claude-code", "codex"],
    module: "capture-ai/capture-ai.sys.mjs",
    installer: "installCaptureAiAuto",
  },
  {
    id: "capture-ai-on-click",
    title: "What's wrong here: only when you ask",
    pitch: "The capture bar gets a What's wrong here? button: your own AI then proposes up to three concrete next steps for your agent.",
    howToTry: [
      "Hold the right mouse button and drag over part of a page.",
      "Click What's wrong here? in the bar.",
      "Pick one of the proposals: it becomes your agent's task.",
    ],
    group: "AI on the page",
    variantOf: "capture-ai-auto",
    needs: ["claude-code", "codex"],
    module: "capture-ai/capture-ai.sys.mjs",
    installer: "installCaptureAiOnClick",
  },
  // Errands (errands/): the non-code to-dos of the signed-in web, kept with their page and space.
  {
    id: "errands",
    title: "Errands",
    pitch: "Right-click any page and choose Remember this… to keep it as a to-do with its space and an optional due date; your own AI can find the date.",
    howToTry: [
      "On a page you must come back to, such as an invoice, right-click and choose Remember this…",
      "Pick a due date, or click Find the date, then Remember.",
      "Click the count beside the space's name to open it, mark it done or snooze it.",
    ],
    group: "Your day",
    needs: ["claude-code", "codex"],
    module: "errands/errands.sys.mjs",
    installer: "installErrands",
  },
  // Proof tab (proof-tab/): when an agent changed a web project, its page waits marked "To verify".
  {
    id: "proof-tab",
    title: "To verify on the real page",
    pitch: "When an agent changed files in a web project, its page waits marked To verify, with what the agent said, the console errors since and a one-line way to send it back.",
    howToTry: [
      "Let an agent change one of your web projects, such as Harbor, from this browser.",
      "Select the project's tab marked To verify.",
      "Click Looks right, or Not right… to tell the agent in one line.",
    ],
    group: "Agents",
    needs: ["claude-code", "codex", "antigravity"],
    module: "proof-tab/proof-tab.sys.mjs",
    installer: "installProofTab",
  },
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
  // Start the task (start-task/): a capture of a project's page becomes real work for the user's agent.
  {
    id: "start-task-here",
    title: "Start the task here",
    pitch: "On your projects' pages the capture bar starts Claude Code, Codex or Antigravity in the project folder and shows what it does and changes.",
    howToTry: [
      "Capture an area of a page of one of your projects, such as Harbor.",
      "Type what should change, or pick a proposal.",
      "Press Start in Claude Code, then Reload this tab when it is done.",
    ],
    group: "Agents",
    needs: ["claude-code", "codex", "antigravity"],
    module: "start-task/start-task.sys.mjs",
    installer: "installStartTaskHere",
  },
  {
    id: "start-task-in-app",
    title: "Open the task in your agent app",
    pitch: "On your projects' pages the capture bar opens Claude Code or Codex with your note filled in and the image on the clipboard; you press Return there.",
    howToTry: [
      "Capture an area of a page of one of your projects, such as Harbor.",
      "Type what should change, or pick a proposal.",
      "Press Open in Claude Code, paste the image there and press Return.",
    ],
    group: "Agents",
    variantOf: "start-task-here",
    needs: ["claude-code", "codex"],
    module: "start-task/start-task.sys.mjs",
    installer: "installStartTaskInApp",
  },
  // Today (today/): what changed and what needs you, once a day or always in view; never a dashboard.
  {
    id: "today-sheet",
    title: "Today: one short sheet a day",
    pitch: "On the first focus after 5:00 a short tab lists what waits for you, what failed or finished since you looked and which errands are due, each line a link.",
    howToTry: [
      "Turn it on, then switch to another app and back: the sheet opens once today.",
      "Or right-click the space name and choose Today.",
      "Click a line to go there; close the tab when you are done.",
    ],
    group: "Your day",
    needs: ["claude-code", "codex"],
    module: "today/today-sheet.sys.mjs",
    installer: "installTodaySheet",
  },
  {
    id: "today-strip",
    title: "Today: a line in the sidebar",
    pitch: "The same facts as one quiet line above your projects, such as 2 need you · 1 failed · 1 errand due, that opens in place and never opens anything by itself.",
    howToTry: [
      "Turn it on and look above Projects in the sidebar.",
      "Click the line to see what is behind it; click a line to go there.",
    ],
    group: "Your day",
    variantOf: "today-sheet",
    needs: ["none"],
    module: "today/today-strip.sys.mjs",
    installer: "installTodayStrip",
  },
]);
