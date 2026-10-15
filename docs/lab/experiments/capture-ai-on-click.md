# What's wrong here: only when you ask (`capture-ai-on-click`)

Lab switch `axiosozo.lab.capture-ai-on-click.enabled` (group "AI on the page";
the other take on "What's wrong here?", with
[`capture-ai-auto`](capture-ai-auto.md); one of them is on at a time). Same
module: `apps/browser/chrome/lab/capture-ai/capture-ai.sys.mjs`
(`installCaptureAiOnClick`).

## What it is

The capture bar gets one quiet button under the note, on every web page:

    [ What's wrong here? ]

Nothing is sent until it is pressed. Then it is exactly the auto variant:
"Looking…" with Stop and the outgoing line, then at most three proposals, each
one click from becoming the agent's task (fills the note; starts or opens it
when a start-task experiment is on), or "Nothing obvious".

One difference: what you typed in the note before pressing it goes along as a
hint ("The developer's note about this area: "the retry button"") and the
outgoing line says so: "Region image, page address and your note go to Claude
Code." On pages that are not one of your projects the prompt says so
("Project: none"), and the proposals can only fill the note for Copy for agent.

Prompt, schema, browser-side checks and live results:
[capture-ai-auto.md](capture-ai-auto.md#how-it-asks). With the note "the
retry button" on the banner + invoices capture: 3.3 s, $0.0009, one proposal
shown ("Retry payment button does nothing", 0.9).

## Why

The same research as the auto variant (users pain #4: the agent can't see
what I see; landscape direction 3: point, say, send), minus the one thing
that might bother: an AI call on every capture. Here the user decides each
time, at the cost of one more click and three seconds of waiting after it
instead of during the drag.

## How to try

1. Lab → turn on "What's wrong here: only when you ask".
2. Right-drag over the Harbor banner. Optionally type a word in the note.
3. Click What's wrong here?, then a proposal.

## What to look at

- Do you press it at all, or does the bar's Copy for agent stay the habit?
- When you press it, is it because you don't know what is wrong, or because
  you want the wording of the task done for you?
- Compare with auto: is the wait worse when you asked for it?

## Honest expectation

Safer and quieter, and likely used less: an extra button is exactly the
"composer asking what you want" Wout wanted to avoid. If the auto variant
does not annoy on project pages, it should win; this one stays useful for
pages outside projects.
