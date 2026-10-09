# Today: a line in the sidebar (`today-strip`)

Lab switch `axiosozo.lab.today-strip.enabled` (group "Your day"; the other take
on "today", with [`today-sheet`](today-sheet.md); one of them is on at a time).
Code: `apps/browser/chrome/lab/today/today-strip.sys.mjs` and `today.css`, on
the same data as the sheet (`today-data.sys.mjs`, `today-model.sys.mjs`).

## What it is

No page at all. One quiet line at the top of the sidebar's Projects section:

    ● 2 need you · 1 failed · 1 errand due                 ›

in the section's own small, toned-down type, with one 6 px dot for what most
needs you (amber: waiting, red: failed, Zen's accent: an errand due, an
empty ring: nothing). It says "Nothing needs you" (or "Nothing needs you · 3
finished") on a quiet day.

Click it and it opens in place: the same lines as the sheet (waiting, failed,
finished since you last looked, errands due), each a small two-line row with
its dot. A row opens its project's home, or the errand's page in its space
(the tab that shows it, if one does); an errand row has Done (✓) and Tomorrow
(→|) on hover or focus, both with Undo in a toast. A last quiet line says
"Finished and failed since you last looked (today 08:12). Composed on this
Mac; nothing was sent." Escape or another click closes it. Opening it counts
as looking.

Nothing opens by itself, nothing moves, nothing makes a sound, and there is
no AI in it (`needs: none`). In a space without projects it sits where the
Projects section would be (under the hidden space header). Hidden in Zen's
collapsed (icon) sidebar.

## Why

- Research (landscape §0.6 and the "dashboards vs inboxes" note, pattern 1;
  users principle 6): ambient status in an existing list is the quietest and
  least criticised pattern ("make use of the periphery"). The strip is a
  sentence on the way to the tabs, not a place.
- Pain #7: it replaces the "is everything fine?" round with a glance; pain #2
  and the attention rule: only "waiting on you" is coloured strongly, "done"
  waits quietly in the open list.
- Wout's taste: Zen's sidebar stays Zen; one line added, in its own type.

## How to try

1. about:axiosozo → Lab → Your day → turn on "Today: a line in the sidebar"
   (and "Errands" for due errands).
2. Look above "Projects" in the sidebar. Start a Lab agent task (or have an
   errand due today) and watch the line change.
3. Click the line; click a row; press Done on an errand; press Escape.

## What to look at

- Does it read as part of Zen (type, inset, hover wash), in light and dark,
  with the Projects section present and absent?
- Is one line enough? Is it noticed when something waits, and ignorable when
  nothing does?
- Does the open list stay short, and is "since you last looked" understandable
  without explanation?
- Keyboard: Tab to the line, Enter, Tab through rows (Done/Tomorrow appear on
  focus), Escape returns to the line. VoiceOver reads "Today: 2 need you, 1
  failed, 1 errand due. Show the details".

## Privacy

Local only; nothing is sent. Shares `<profile>/axiosozo/lab/today.json` with
the sheet (when you last looked, agent sessions seen ending; forgotten when
both today switches are off). While on, it follows sessions started elsewhere
(the platform polls `claude agents --json` per project every 15 s, no model
call) so "waiting" is current.

## Open questions

- Should it be per space (only this space's projects and errands) instead of
  the whole day? Today it is the whole day, so a project in another space that
  waits still shows here.
- Would the line alone (without the open list) be enough, with a click going
  straight to the first waiting item?
- Should finished work count in the line at all, or only in the open list?

## Honest expectation

This is the one I expect Wout to keep. It costs one line of sidebar, adds no
place and no tab, and turns the morning round into a glance he already makes.
Its weakness: one line is easy to stop seeing, so a waiting agent still needs
the separate "waiting on you" notification the agents experiments test.
