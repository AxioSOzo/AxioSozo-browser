# To verify on the real page (`proof-tab`)

Lab switch `axiosozo.lab.proof-tab.enabled` (group "Agents"; works on its own
or with either presence take). Code:
`apps/browser/chrome/lab/proof-tab/proof-tab.sys.mjs`, `proof-tab.css`, on the
shared presence parts in `apps/browser/chrome/lab/presence/`. Tests:
`apps/browser/tests/lab-proof-tab.test.mjs`.

## What it is

When an agent run started from this browser finishes **having changed files**
in a **web project** (one with a local page), that project's page waits for
your verdict:

- **The mark**: a quiet "To verify" second line under the tab's title (Zen's
  own tab sublabel), on an open tab of that project (the selected one first,
  else the most recent). It is **never reloaded** on its own. With no tab of
  the project open, its local page opens in a **new background tab** in the
  project's space (never brought to the front).
- **The strip**, when you select that tab, a small card at the top of the
  page:

      To verify                                                    ×
      ✳︎✓ Claude Code · Harbor · fix the retry button
      Changed the Retry payment click handler in index.html to look up the
      button's actual id.
      Changed index.html
      1 console message on Harbor's pages since they loaded, the newest:
      | Stripe: card_declined for invoice INV-2041
      This page was open before the change. Reload it to see it.
                                     Reload   Not right…   [Looks right]

  - the agent's sentence and the files it changed (read by the browser with git);
  - the console: what the console owner holds for this project's pages in
    this window since they loaded (count and the newest errors). When it
    cannot tell, nothing is said about the console;
  - **Reload** only while the tab still shows the page from before the
    change; after a reload (or the dev server's own refresh) the strip comes
    back without it;
  - **Looks right** clears the mark, and the run is dismissed everywhere
    (the presence takes drop it too);
  - **Not right…** turns the strip into one line, "What is not right?", with
    what goes said before sending ("Your note, a picture of the visible page,
    its address and 1 console error go to Claude Code."). Send starts a
    follow-up task with the same agent in the same project: your note first,
    then what it follows ("This follows an earlier task in this project: … /
    Afterwards the agent said: … / Changed index.html. / The user looked at the
    page in the browser and says the result is not right."), a PNG of the
    visible page (Gecko tabs; drawn like area capture), the page address (no
    query or fragment) and those console errors (as data, by the platform's
    envelope). The tab then says "Claude Code is working"; when the follow-up
    changes files it is "To verify" again, on the same tab.
- One window marks a run (the one used last). Off clears every mark and strip;
  tabs it opened stay, as ordinary tabs.

Nothing is reloaded, submitted or sent without your click. Sessions started
elsewhere are not marked: their changed files are unknown to the browser.

## Why it is built this way

- STUDY.md §2, "Show the evidence": "When work lands, the browser shows the
  real page, signed in, with the errors it can see, before you read any
  code." research-landscape §0.4: the agents' own browsers are clean,
  logged-out profiles; the user's real browser is unclaimed territory for
  verification. Direction 8: a proof tab when work lands, opened and not
  reloaded, with what is checkable without AI.
- Users pain #3 ("done is not done"): the verdict happens on the page; Not
  right… is the shortest way back with the context the agent cannot see.
- Pattern 9 and the contract rule "never reload unasked".

## How to try

1. Lab → Agents → "To verify on the real page": on.
2. Let an agent change Harbor from this browser (Start the task here, or the
   console snippet in the track report).
3. Select Harbor's tab marked To verify; click Looks right, or Not right… and
   type one line.

## What to look at

- Is the sublabel "To verify" visible enough, and calm enough?
- The strip on every selection of the tab: helpful, or nagging?
- Not right… with the picture: does the agent fix the right thing more often
  than with the note alone?
- With Vite's own refresh after the agent's edit: the strip comes back
  without Reload; does that read right?

## Open questions

- A new background tab when no tab is open: right for "the proof is waiting",
  or one tab too many? It opens in the space's container, or the project's
  container when containers are on and the project has one (it never creates
  one); a mismatch closes it again.
- The follow-up is a new task, not a resumed session (ctx.agents has no
  "continue this session headless" yet), so it carries its context in words.
- The console line covers the project's pages in this window, not only this
  tab, and counts warnings too ("messages").
- Codex and Antigravity follow-ups work the same, but Antigravity takes minutes.

## Honest expectation

The most distinctive of the three: no agent app can show its result on the
user's signed-in page. Its value depends on the dev server refreshing or the
user reloading; Looks right / Not right… may feel like ceremony for one-line
fixes and earn their place on visual ones. Expect "Not right…" to be the part
people remember.
