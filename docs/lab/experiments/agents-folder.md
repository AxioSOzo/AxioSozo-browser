# Agents as tabs in a folder (`agents-folder`)

Lab switch `axiosozo.lab.agents-folder.enabled` (group "Agents"; one of two
takes on agent presence, with [`agents-on-rows`](agents-on-rows.md); one of
them is on at a time). Code: `apps/browser/chrome/lab/agents-folder/`
(`agents-folder.sys.mjs` per window, `live-folder.sys.mjs` the Zen live
folders, `agents-folder.css`) on the shared presence parts in
`apps/browser/chrome/lab/presence/` (model, hub, live view, attention rule,
result card, icons, tabs). Tests: `apps/browser/tests/lab-agents-folder.test.mjs`,
`lab-presence.test.mjs`.

## What it is

Each space gets a Zen live folder **Agents** while its projects have agent
sessions. Every session is a tab in it, Zen's own kind of tab:

    ▾ Agents
      ✳︎ Harbor · fix the retry button
        Claude Code · working: editing index.html
      ⌘• Atlas · tighten the hero copy
        Codex · needs you                                  (amber)
      ✳︎✓ Inkline · sign up typo
        Claude Code · done: Changed the button label in index.html
      ⌒• Northwind · price card
        Antigravity · failed: Antigravity needs you to sign in   (red)

- **Title** "Harbor · fix the retry button"; **second line** (Zen's own tab
  sublabel) "Claude Code · working: editing index.html", "… · needs you",
  "… · done: <the agent's own sentence>", "… · failed: <the honest reason>",
  "… · stopped". Amber only when it needs you, red only when it failed.
- **Icon**: the agent's mark (our own simple glyphs: a spark for Claude Code,
  a prompt for Codex, an arc for Antigravity; no vendor logo is shipped) with
  a small state badge: a ring working, an amber dot needs you, a check done, a
  red dot failed, a square stopped. Until the tab is opened; then it shows
  its page's own icon and the second line carries the state.
- **Clicking an item** opens its page in that tab: the project's local page
  (`http://localhost:5173/` for Harbor), or its project home for a project
  without one. Zen loads a live-folder item only when it is opened, so this
  is a fresh load the user asked for, never a reload. Once the page is there,
  the **result card** sits over it (below).
- **Needs you**: the card's main button is **Continue in Terminal**, the way
  back to the question (the run stopped at it; `claude --resume <id>` /
  `codex resume` / `agy --conversation` in the project folder).
- **Closing an item's tab dismisses it** (Zen's own gesture for live
  folders). A run closed while working comes back when it needs you or when it
  finishes; a closed result stays gone. Finished items leave after a day. A
  folder with nothing left is deleted; it comes back with the next session.
- **The attention rule**: only entering "needs you" interrupts: one calm Zen
  toast, in one window (the one used last): "Claude Code needs you in Harbor",
  the question ("Claude Code wanted to go further (writing note.txt). Continue
  in Terminal to decide."), and one button: Continue in Terminal (a run
  started here) or Show (a session open elsewhere: the card says where to
  answer it). Done, failed and stopped never interrupt.

Sessions are every `ctx.agents` session of a project added to AxioSozo: runs
started from this browser (by any Lab experiment, e.g. Start the task here)
and sessions started elsewhere (`claude agents --json` polled every 15 s while
this is on, plus the axiosozo-notify hooks when installed). Nothing here
starts an agent.

### The result card (shared with agents-on-rows and start-task-here)

A small Zen card (`kit.floatingCard`), never a chat:

    Harbor · fix the retry button                                   ×
    ✳︎✓ Claude Code · done
    Changed the Retry payment click handler in index.html to look up the
    button's actual id retry instead of retry-payment.
    Changed index.html · 1 file changed, 2 insertions(+), 2 deletions(-)
    $0.0017 · 6.8 s
                       Dismiss   Continue in Terminal   [Reload page]

- The agent's closing sentence (or, for needs you / failed / stopped, the
  platform's honest reason; for needs you also what the agent said, quoted).
- Files: what the browser read with git after the run (not what the agent
  claimed), plus "N files were already changed before it started" when so.
- Cost and time (no "$0.0000" for a run that spent nothing).
- **Reload** only when the run changed files and a tab shows the project's
  local page ("Reload page" over that page, else "Reload Harbor"); only on the
  click. **Continue in Terminal** / **Open in Claude** (the Claude app's
  resume link, when installed and the card has room). **Stop** while a run
  started here works. **Dismiss** hides it in every window and in both takes
  (a finished run started here is also cleared from `ctx.agents`).
- It follows the session live while open (a working run's step, then its
  result). One card per window.

## Why it is built this way

- research-landscape §0.9 and direction 1: "Agents" as a Zen live folder in
  each space is "the most 'not a plugin' form of agent integration available,
  because it reuses Zen's own primitive". §0.3: every agent manager sees only
  its own agents; this folder holds Claude Code, Codex and Antigravity side by
  side, where the day already is.
- §0.5 and direction 2 (one attention rule): a blocked agent must not look
  like a finished one. Needs you is the only amber, the only interrupt.
- Pattern 9 (return to the moment): the click lands on the project's real
  page with the result, never a generic home, never an automatic reload.
- agents-launch.md §6(ii): the state machine per session and the result card
  (sentence, files from git, explicit Reload, Continue in Terminal).

**Real live folders, not a lookalike.** The manager's registry is a public
Map, so the experiment registers its own provider type
(`axiosozo-agents`, a subclass of Zen's `nsZenLiveFolderProvider`) and creates
folders the way the manager does for its own types. Zen then does the native
part itself: lazy pinned tabs with title, sublabel and icon, close-to-dismiss,
sync to other windows, folder menus, compact and collapsed sidebars,
persistence. What it does not do natively, the experiment adds narrowly:
- **push, not poll**: every change calls the provider's `refresh()` (Zen's
  timer is set to a day, as a fallback);
- **items change in place**: Zen only adds and removes items by id, so each
  window writes a shown item's new second line, colour attribute,
  `aria-description` and (while unopened) icon onto its tab;
- **dismissal by phase**: the presence hub decides what is hidden; Zen's own
  record of a closed item is cleared for items the hub shows again;
- **restart**: a folder Zen restored before our type was registered is
  adopted again (`adoptSyncedFolder`) and its stale items replaced; if Zen
  restored it with our type already registered, it is simply kept;
- **off**: every Agents folder is deleted and the type unregistered (a window
  closing, or quitting, deletes nothing).
Every Zen name it relies on is listed in `ZEN_TOUCHPOINTS` and checked against
the pinned Zen source by a test, so a Zen update that renames one fails a test
rather than the browser.

## How to try

1. Lab → Agents → "Agents as tabs in a folder": on.
2. Start a task in one of your projects (Start the task here, or Claude Code
   in a terminal in Harbor's folder).
3. Watch its tab in the Agents folder of Harbor's space; click it when done.

## What to look at

- Does the folder read as Zen's, or as something bolted on? Item height,
  second line, icon, the folder icon (Zen's own "terminal").
- Is the second line enough to tell waiting from finished at a glance,
  including in compact mode where the sidebar only shows on hover?
- The click: is "open its page with the card" the right place, or should a
  needs-you item go straight to Terminal?
- Two copies of the project page (your own Harbor tab and the item's): fine
  as "the proof tab", or confusing?
- One toast per wait, in one window; does it ever come twice?

## Open questions

- Folder placement: Zen adds it at the end of the space's pinned section.
  Top would be more visible; it would move the user's own pinned tabs down.
- A project without a space (`context_uuid` null) has no folder; its
  sessions only show in the other take and the toast.
- Opening an item's page loads it in the item's tab with the space's
  container (Zen's live-folder rule), not necessarily the project's own
  container when containers are on. Worth checking with a project that has one.
- A dragged-out item becomes an ordinary tab; the item reappears in the folder.
- After a restart, browser-run sessions are gone (the agents service is in
  memory); only external sessions come back. The folder rebuilds from them.

## Honest expectation

Most native-feeling of the two: it is Zen's folder, and an agent run as a tab
matches "each run is a tab that opens its result". It is also the more
fragile: it leans on Zen internals that may change (guarded by the touchpoint
test), and a folder of half-finished runs may feel like more tabs to manage.
I expect the needs-you toast and the amber second line to carry most of the
value; whether people keep the folder open is the real test.
