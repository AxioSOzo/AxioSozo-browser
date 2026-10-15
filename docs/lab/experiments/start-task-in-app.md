# Open the task in your agent app (`start-task-in-app`)

Lab switch `axiosozo.lab.start-task-in-app.enabled` (group "Agents"; the other
take on "how a capture becomes real work", with
[`start-task-here`](start-task-here.md); one of them is on at a time). Same
module: `apps/browser/chrome/lab/start-task/start-task.sys.mjs`
(`installStartTaskInApp`). Tests: `apps/browser/tests/lab-start-task.test.mjs`.

## What it is

On a page of one of your projects, the capture bar's main action becomes
**Open in Claude Code ▾**, with one line:

    Opens Claude Code in /Volumes/…/repos/harbor, with your note filled in.
    Nothing is sent until you press Return there. The image goes to the clipboard.

▾ offers what is installed on this Mac (by URL scheme; nothing is opened to
find out): **Claude Code in your terminal** (`claude-cli://open?q=&cwd=`),
**Claude app** (`claude://code/new?folder=&q=`; it confirms the folder) and
**Codex app** (`codex://threads/new?path=&prompt=`). Missing ones are listed
as "Not installed" and cannot be picked; the last pick is remembered.

Return (or the button, or a proposal from [What's wrong
here?](capture-ai-auto.md), whose rows then say "Open") calls
`ctx.agents.openIn` with the project's root, the image and this prompt:

    The retry button does nothing.

    Page: http://localhost:5173/ ("Harbor · Billing settings")

    A screenshot of the area is on the clipboard: paste it with ⌘V.

(the last line is added by the platform when the PNG went to the clipboard).
An empty note gets "Look at the area of this page that I marked." The capture
ends and a toast says what to do: "Opened in Claude Code · Your note is filled
in there. Paste the image with ⌘V, then press Return there to start."

Nothing runs from the browser: the app prefills and the user sends. Other
pages keep Copy for agent and say why: "Open in an agent app is offered on
pages of a project you added to AxioSozo. This page is not one: copy it for
your agent instead."

## Why

- agents-launch.md §6(i) "Open in … (hand-off without running)": "the safest
  default for users who don't want the browser to start anything"; variant B
  of the three to compare.
- Users, pain #4: the context travels (folder, page, words, picture) without
  the browser becoming an agent manager (study §2, "not a seventh agent
  manager").

## How to try

1. Lab → turn on "Open the task in your agent app".
2. On Harbor, right-drag over the banner, type a note, press Return.
3. In the app: ⌘V, then Return. Try ▾ → Claude app and Codex app.

## What to look at

- The image needs ⌘V in the app: is that one step too many, compared with
  Start here, which sends the picture itself?
- Does landing in the app (a context switch) feel like handing off, or like
  leaving?
- Claude Code in your terminal opens in the terminal of your last interactive
  `claude`; is that the one you expect?

## Not verified here

The deep links are the platform's (`handover.sys.mjs`, unit-tested); they
were not opened on this Mac from this experiment (no app was launched
during this work). The lead's visual pass is the first real run. A "Codex in
Terminal" target does not exist: `codex "<prompt>"` sends at once, so it
cannot prefill (a platform request in the track report).

## Honest expectation

Trusted and low-risk, and the right answer for bigger tasks that need a
conversation. For the small "this button is broken" fixes the capture is
made for, the clipboard step and the app switch make it slower than Start
here; expect Start here to win those.
