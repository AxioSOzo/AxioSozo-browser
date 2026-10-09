# Agents on the project rows (`agents-on-rows`)

Lab switch `axiosozo.lab.agents-on-rows.enabled` (group "Agents"; the other
take on agent presence, with [`agents-folder`](agents-folder.md); one of them
is on at a time). Code: `apps/browser/chrome/lab/agents-on-rows/`
(`agents-on-rows.sys.mjs`, `agents-on-rows.css`) on the shared presence parts
in `apps/browser/chrome/lab/presence/`, drawn through a small decoration hook
in `apps/browser/chrome/ProjectSidebar.sys.mjs` (`decorateProjectRows`).
Tests: `apps/browser/tests/lab-agents-on-rows.test.mjs` (the hook on the real
sidebar, then the experiment on it), `lab-presence.test.mjs`.

## What it is

No new place: the Projects rows say what their agents do.

    Projects
    ● Needs you
      ✳︎• Harbor · fix the retry button
          Claude Code wanted to go further (writing note.txt). Continue in…
    [A] Atlas                                     ◌      (a slow ring: working)
    [H] Harbor                                    ●      (amber: needs you)
    [I] Inkline                                   ✓      (done; quieter once seen)
    [N] Northwind                        ● 1      !      (red: an agent failed)

- **A mark at the end of the row** (expanded sidebar): a slowly turning ring
  while an agent works, an amber dot with a soft halo when one needs you, a
  check when one is done (half as strong once its result card was opened), a
  red "!" when one failed (a server that stopped with an error stays the plain
  red dot it was), a small square when one was stopped. It is a button: it
  opens the **result card** beside the sidebar, level with the row. The row
  itself still opens the project panel.
- **In Zen's collapsed (icon) sidebar** the same state is a small badge on the
  corner of the project's mark.
- **"Needs you"**, a small stack above the project list, only while an agent
  of this space waits on you: one line per agent (its mark, "Harbor · fix the
  retry button", the question). Each opens its card. More than four fold into
  "N more". Hidden in the collapsed sidebar, where the amber badges say it.
- **The same attention rule** as the folder take: only entering "needs you"
  raises one toast, in the window used last, with one button back (Continue
  in Terminal for a run started here, Show for one open elsewhere). Done never
  interrupts.
- The **result card** is the same as the folder's (see
  [agents-folder.md](agents-folder.md#the-result-card-shared-with-agents-on-rows-and-start-task-here)):
  the agent's sentence, files from git, cost and time, Reload (only with
  changed files and an open tab of the project), Continue in Terminal, Stop,
  Dismiss.

A row shows its project's most urgent session (needs you, then failed, then
working, then done). Sessions: every `ctx.agents` session of a project added
to AxioSozo, started here or elsewhere (`claude agents --json` every 15 s while
it is on, and the hooks).

### The hook in ProjectSidebar

`decorateProjectRows(window, { mark(project), activate(project, button, event), top })`
returns `{ update(), remove() }`. The sidebar draws `mark(project)` (`{ state,
label, title?, quiet? }`, state one of working, needs_you, done, failed,
stopped) as a span on the row's icon tile plus one button beside the row
(`activate` on click), adds the label to the row's accessible name ("Harbor,
Claude Code needs you. Show project"), and puts `top` between the Projects
heading and the list. A row redraws only when its mark changed. Without a
decorator the sidebar is exactly as before (its tests pin that). It is about
fifty lines, and the experiment never touches the sidebar's DOM.

## Why it is built this way

- research-landscape pattern 1 ("status glyph on an existing row", High fit:
  "Add one 'needs you' mark per project row") and direction 5 ("the sidebar
  is the dashboard"): status where the eye already goes.
- §0.5 / direction 2: waiting is amber and the only interrupt; done is a quiet
  check that fades once seen.
- STUDY.md §3: "Sidebar project row | What its agents are doing: working,
  needs you, done", and a "Needs you" stack at the top of the sidebar.
- agents-launch.md §6(ii): one state machine per session projected onto the
  project; the result card as the way back.

## How to try

1. Lab → Agents → "Agents on the project rows": on.
2. Start a task in one of your projects (Start the task here, or Claude Code
   in a terminal in Harbor's folder).
3. Watch the mark at the end of Harbor's row; click it for the result.

## What to look at

- Legibility at a glance in the expanded sidebar and in compact mode: does
  the ring read as "working", the amber dot as "waiting on you"?
- The Needs you stack: useful, or redundant with the amber mark and the toast?
- The card beside the sidebar in compact mode (the sidebar may slide away
  once the pointer leaves it; the card stays at the content's left edge).
- With today-strip on as well, two quiet things sit above the projects
  (its summary line and this stack). One of them should give way.

## Open questions

- Sessions of another space's projects are not in this space's stack (the
  toast still names them). A dot on the space switcher could say "something
  waits elsewhere".
- Only the most urgent session per project is on its row; several runs in
  one project are reachable only through the card of the most urgent one.
- The card opens beside the sidebar; over the page (as the toast's Show does)
  might be steadier in compact mode.

## Honest expectation

The simpler of the two and, I think, the one that survives: nothing new to
learn, it costs no tabs, and it works in every sidebar mode. Its weakness is
reach: the row only tells you something when you look at the sidebar, so
the toast does the heavy lifting for "needs you", and finished results are
easy to miss until you open the sidebar (which is the point: done waits).
