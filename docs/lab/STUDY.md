# AxioSozo Lab: the study

Branch `ux/lab`. This is the thinking behind the Lab experiments: who the
user is, what role the browser plays in their day, and which ideas we test.
Sources: the user research, landscape and agent launch reports in
`/Volumes/AxioSozoBuild/ux-overnight/notes/lab/` (research-users.md,
research-landscape.md, agents-launch.md; local, not in the repo), and
Wout's own words across earlier threads.

## 1. Who the user is

The anchor is **the founder-dev who runs several agents**: Wout. He owns a small
company, ships several products, runs Claude Code, Codex and Antigravity side by
side, has many Google and Microsoft accounts, and does his own admin (VAT,
invoices, the Belastingdienst). Around him: the solo indie maker who also does
the marketing, the developer in a team of 5-15, and the director who barely codes.

Their day has changed shape. Writing code is no longer the slow part:

1. **Waiting.** An agent run takes 1-10 minutes, many times a day, and the gap
   leaks into the phone and feeds ("while waiting I go to my phone").
2. **Coming back.** An agent waiting on a permission prompt looks exactly like a
   finished one; people miss both, or come back to the wrong one first.
3. **Judging.** "Done" is not done: the result has to be seen in a browser,
   with the real accounts and data, before anyone reads the diff.
4. **Giving context.** The agent can't see the rendered page, the console or
   anything behind a login, so people paste screenshots and errors by hand.
5. **Everything else.** The morning round of dashboards "just to check", wrong
   accounts, ports and localhost confusion, invoices and government portals,
   agents and tools that update and break things.

They are tired of AI bolted onto every product (floating buttons, chat panels
that don't know the context, summaries that state falsehoods). They keep using
AI that lives on something they already have, that they trigger, and that
leaves something they can check.

## 2. The role of the browser

**AxioSozo is the return path.** Agents own the code. Products own their data.
AxioSozo owns *when you look, what you see, and which identity you act as*.

That gives three jobs, and only three:

- **Hand work out with what you see.** One gesture turns the page in front of
  you (an area, the console, the address, the project) into a task for your
  own agent, or an answer from it.
- **Bring you back at the right moment.** One calm place in the sidebar knows
  what every agent is doing, across Claude Code, Codex and Antigravity. Only
  *waiting on you* interrupts; *done* waits quietly with its proof.
- **Show the evidence.** When work lands, the browser shows the real page,
  signed in, with the errors it can see, before you read any code. That is the
  thing agent apps can't do: their browsers are clean, logged-out profiles.

And one supporting promise: **it keeps working when your agents update.**
Detect agents by what they can do, not by an exact version or app name.

### What the browser is not

- Not a seventh agent manager (Claude Code Desktop, Codex, Antigravity, Cursor,
  Conductor and Warp all ship the same shell; each sees only its own agents).
- Not a dashboard page. The landscape is clear: separate AI places die (ChatGPT
  Atlas, Edge Copilot Mode, Notion Mail all closed in 2026). Status lives where
  the eye already goes: the sidebar, a tab, a toast.
- Not a chat. AI produces a choice, a status or a document, and the user's own
  agent does the work.
- Not a replacement for the products around it. It is signed in to them, per
  space, and points at them.

## 3. How it fits together (and stays simple)

One concept carries everything: **the space**. A space is a context (personal,
organization, project), with its identity (container, accounts), its projects
and their environments. Everything new is a property of something the user
already has in Zen:

| Already in Zen | What it gains |
|---|---|
| Sidebar project row | What its agents are doing: working, needs you, done |
| A folder of tabs (Zen live folders) | Agents, as tabs: each run is a tab that opens its result |
| A tab | "To verify" when an agent changed what it shows |
| A toast / notification | Only for "waiting on you", with one button back |
| The context menu, a drag | Hand an area to an agent, or ask it what's wrong |
| The new-tab of the day | One short morning sheet, built from facts with links |

The non-code day fits the same shape: an **organization space** whose folders
watch the signed-in web (a new message in the tax portal, an invoice that is
ready), with the human always signing, submitting and paying.

### How AI is used

Three tiers, cheapest first:

1. **Facts, no model.** Server status, console errors, `git diff --stat`, hook
   events, which agent is waiting. Most of the value is here.
2. **One-shot decisions.** The user's Claude Code (or Codex) answers a single
   structured question in a few seconds: "what is wrong in this area?" returns
   at most three choices, not prose. No tools, no files, an empty folder.
3. **Agent tasks.** The user's own agent works in the project folder, started
   by the user's click, visible while it works, handed over to their terminal
   or app in one click, and never given more than "edit files".

## 4. The experiments

Each one is a switch on the Lab page (about:axiosozo → Lab). Families of
variants test the same idea in different shapes; one of a family is on at a
time.

**Agents**
- **Agent presence**, two variants:
  - *Agents folder*: a Zen folder per space where each agent session is a tab.
  - *On the project row*: the project row shows what its agents are doing, with
    a "Needs you" stack at the top of the sidebar.
- **Start the task here**, two variants:
  - *Run here*: the capture bar and Send to agent can start Claude Code, Codex or
    Antigravity headless in the project folder, with the picture; a result card
    shows the agent's sentence, the files it touched, Reload and Continue in
    Terminal.
  - *Open in the app*: the same, prefilled in the Claude, Codex or terminal
    app, the user presses Enter there.
- **Proof tab**: when an agent finishes on a web project, its preview opens in
  the background marked "to verify", with the console errors since.

**AI on the page**
- **What's wrong here?**: after a capture, the user's AI answers with up to
  three concrete findings, each one click from becoming the agent's task.

**Your day**
- **Morning sheet**: the first new tab of the day lists what finished, what is
  waiting, what broke and what is due, every line a link.
- **Errands**: right-click on any page "Remember this for…": a non-code to-do
  (an invoice, a form) tied to that page and space, shown in the morning sheet.

## 5. How we judge them

Not by how impressive they look, but by:
- missed returns (an agent waited and nobody came),
- time from "agent done" to a verdict on the real page,
- how often the user still reaches for the phone or the clipboard,
- whether turning it off leaves anything behind.

The research suggests one real logged day and five short interviews before any
of this graduates.
