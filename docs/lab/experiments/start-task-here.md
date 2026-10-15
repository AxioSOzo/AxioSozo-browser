# Start the task here (`start-task-here`)

Lab switch `axiosozo.lab.start-task-here.enabled` (group "Agents"; one of two
takes on "how a capture becomes real work", with
[`start-task-in-app`](start-task-in-app.md); one of them is on at a time).
Code: `apps/browser/chrome/lab/start-task/start-task.sys.mjs` and
`start-task.css`, drawn into the area-capture bar through its extension point
([region-capture.md](../../design/region-capture.md#adding-to-the-bar-extensions)).
Tests: `apps/browser/tests/lab-start-task.test.mjs`.

## What it is

On a page of one of your projects, the capture bar gets a main action and one
honest line:

    1870 × 870 · Harbor · web
    [ The retry button does nothing                                  ]
    Claude Code may edit files in /Volumes/…/repos/harbor. The image,
    the page address and your note go with the task.
    ×                     Copy image  Copy for agent  [Start in Claude Code|▾]

- The folder is shown **verbatim** (the project's root, in monospace).
- **▾** lists the agents checked on this Mac (Claude Code, Codex, Antigravity;
  versions and options checked without a model call), with why one is not
  available ("Not installed", "Codex needs you to sign in…"). The last one
  used is remembered. Antigravity says what it keeps: "Antigravity keeps all
  its tools, including terminal commands and its own browser: the Lab uses it
  only for agent tasks."
- Focus starts in the note. **Return starts** (the note is the task); an
  empty note starts nothing: "Say what Claude Code should change, then press
  Return." Copy for agent stays, as a plain button, and still copies.
- With [What's wrong here?](capture-ai-auto.md) on, a click on a proposal
  starts the agent with that proposal's task (the row says "Start" on hover).

Start hands the picture, the task, the page address (no query or fragment)
and title to `ctx.agents.startTask` (Claude Code: `--permission-mode
acceptEdits --tools Read,Edit,Write,Glob,Grep --restricted`, the image on
stdin; Codex: `workspace-write` sandbox; Antigravity: `--sandbox`; never a
bypass flag; one task per project; see `docs/lab/README.md`). The capture
ends, and in its place a small card follows the run:

    Claude Code is working                                         ×
    ••• Editing index.html
    “The retry button does nothing.”
                                                                Stop

It stays through reloads (a dev server reloads the page when the agent saves)
and clicks elsewhere; × hides it and the agent carries on. When the run ends
the same card shows the result:

    Claude Code is done                                            ×
    The Retry payment button now responds to clicks: the handler was
    looking up retry-payment while the button's id is retry.
    ┌ index.html ┐
    1 file changed, 2 insertions(+), 2 deletions(-)
    6.3 s · $0.0020
                                 Continue in Terminal  [Reload this tab]

- **Reload this tab** only when the run changed files, and only on the click.
- **Continue in Terminal** resumes the same session in Terminal (`claude
  --resume <id>`), so the browser never becomes the agent's UI.
- Needs you ("Claude Code wanted to go further…"), failed (the platform's
  honest reason: sign-in, rate limit with its reset time, budget) and stopped
  ("Stopped. No changes.") say so in the same card.
- **With agent presence on** (`agents-on-rows` / `agents-folder`, i.e. a
  presence window is registered in `presenceHub`), the finished run opens
  presence's own result card (`presence/result-card.sys.mjs`) in this card's
  place, so Dismiss and "seen" stay in step with the sidebar. The presence
  modules are loaded lazily and optionally: either experiment can be deleted
  without the other.

On any other page the bar keeps Copy for agent as the main action and says
why: "Start is offered on pages of a project you added to AxioSozo. This page
is not one: copy it for your agent instead."

## Why

- Users, pain #4 ("the agent can't see what I see"): today the hand-off is a
  screenshot pasted by hand; here it is one gesture, with the picture.
- Users, pain #3 ("done isn't done"): the result comes back on the page it
  was about, with the files the browser itself read from git and an explicit
  Reload, evidence before the diff.
- agents-launch.md §6(i): "Start" headless with presence, a hand-over always
  one click away; §2: the measured argv per agent.
- The study's role: hand work out with what you see; the user's own agent
  does the work; status where the eye already is.

## Live run

Real `chrome/lab` agents service under Node, the exact request this
experiment sends (a proposal's task, the banner + invoices capture, the page),
Claude Code `haiku`, $0.30 cap, in a private copy of the Harbor repo (not the
lead's):

| Task | Steps seen | Result | Time | Cost |
|---|---|---|---|---|
| "Wire the 'Retry payment' button for invoice INV-2041 so clicking it re-attempts the Stripe charge … and the payment-failed banner with the result." | Searching for “Retry payment\|retry…” → Reading index.html → Reading package.json → Editing index.html | fixed the id (`retry` ↔ `retry-payment`) and added a retry flow with an invented `POST /api/invoices/INV-2041/retry`; 1 file, +24 −4; summary shown: **"The page is served by npm run dev on port 5173, and I only checked the edits by reading them."** | 15.9 s | $0.0046 |
| "Fix the Retry payment button so clicking it retries invoice INV-2041." | Reading → Editing index.html | the minimal fix, +2 −2; summary: "The Retry payment button now responds to clicks: the handler in index.html:38 was looking up retry-payment while the bu…" | 6.3 s | $0.0020 |
| The tuned top proposal: "Fix the retry payment button on the Billing settings page so clicking it re-attempts payment for invoice INV-2041 and shows the result." | Searching → Reading index.html → Editing index.html | id fixed, a status span and an invented retry call; +12 −4; summary: **"I didn't run the page in a browser."** | 13.7 s | $0.0037 |

Two findings:
1. **The summary is often the agent's closing caveat**, not its description
   (2 of 3 runs): the platform takes the last sentence of the last paragraph
   (`streams.sys.mjs lastSentence`). Reported as a platform request; until it
   changes, the card can say "I didn't run the page in a browser." under
   "Claude Code is done".
2. Task wording drives scope: a short, plain task gave the 2-line fix; an
   AI-written task with behaviour in it gave 12–24 lines. One click from an
   AI proposal to a running agent is fast, but it skips the moment where the
   user would have trimmed the task.

## How to try

1. Lab → turn on "Start the task here" (and, for one-click proposals, "What's
   wrong here: it looks right away").
2. Open Harbor (`http://localhost:5173`, Vite running), right-drag over the
   Payment failed banner and the Retry payment row.
3. Type "The retry button does nothing" and press Return (or click a
   proposal). Watch the card; when it says done, press Reload this tab and
   click Retry payment.
4. ▾ → Codex, capture again: the button and the line now say Codex.

## What to look at

- Is "may edit files in <folder>" enough consent for a first run, or does it
  need a one-time confirmation per project?
- Does the card in the bar's place feel like the same object continuing, or
  like a new popup? Where did your eye go while it worked: the card, the page
  (Vite reload), or the sidebar?
- Return starts: did it ever start something you meant to copy?
- Reload this tab after Vite already reloaded: redundant or reassuring?

## Open questions

- Turning the switch off removes the bar section and the card, but **a
  running agent keeps running** (the platform's run is process-wide; agent
  presence still shows it). Stop it on turn-off instead?
- Proposal → Start in one click (as briefed) vs. "click fills, Return starts"
  (one more key, and a chance to edit). The live run suggests the second.
- Console errors on the page (`consoleErrors`) are not sent yet: the capture
  has no access to them; the console owner could offer them as an opt-in
  line ("and 1 console error").

## Honest expectation

This is the variant that makes the browser feel like the return path: drag,
Return, watch the page fix itself, Reload. On a one-line bug Claude Code is
done in 6–16 s for under a cent. The weak spots are honesty of the summary
(platform) and scope creep from AI-written tasks; both are fixable. Expect it
to beat "Open in the app" for small fixes and lose to it for anything that
needs a conversation.
