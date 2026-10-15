# The browser's role, round 2

Branch `ux/lab`, 9 October. Follows [STUDY.md](STUDY.md). Research notes
(local, not in the repo) are in `/Volumes/AxioSozoBuild/ux-overnight/notes/role/`:
research-feasibility.md, research-dashboards.md, the destination findings, and
the concept pages (role.html, and ../marks/concept.html).

## What the owner said about the Marks concept

- The mark gesture is the right direction, but the component isn't loved yet,
  and it should wait until agent management is defined. Users choose where
  agents run: Claude Code, T3 Chat or T3 Code, Codex, Devin… They want the
  conversation in *their* tool.
- Seeing work happen on the component itself: very compelling.
- Before/after on the page: a game-changer, but how?
- New idea: after time away, an agent walks you through what changed in a
  project's frontend, choosing the order and driving the browser.
- The open question they find most interesting: dashboard or not, and what
  could it do?

## 1. What we stand for

**Your product is only real in a browser.** Code lives in the repo,
conversations in the agent apps, data in Stripe and the rest. The rendered
product, signed in, with real data, as customers see it, exists in one place.
AxioSozo owns that place and keeps the round trip between it and wherever the
work happens.

Three rules:

1. **We show the real thing.** The rendered product, signed in, per space.
   Never a clean profile or a transcript.
2. **We keep the link both ways.** Every mark knows its thread, wherever it
   lives; every thread can point back to the exact spot.
3. **We never own the conversation.** No chat, no agent of our own, no agent
   manager. Work stays in the tool the user chose.

## 2. Destinations, not providers

Each project (and each admin space) has a *home for work*, set once:
T3 Code, Claude Code in the folder, Codex, Devin, Cursor, Linear, a colleague,
or "just copy it". A mark goes there and keeps a link to its thread. What comes
back depends on what the destination offers:

| Depth | What comes back | Who offers it (October 2026) |
|---|---|---|
| Two-way | thread link, live status, result, attachments; the agent can point back at the page | T3 Code (MCP endpoint on the user's own environment, pairing code, `t3_thread_launch` with attachments, `t3_thread_wait`); ~40 agents over ACP; Devin and Linear over MCP |
| Run & watch | live steps, needs you, done, files or PR | Claude Code (`claude -p` stream-json, `claude agents --json` for sessions we did not start, hooks passed per launch with `--settings`, including `http` hooks to a loopback URL); Codex (`exec --json`, `app-server` thread status with `waitingOnApproval`); Antigravity (`agy -p`); Copilot (`gh agent-task`); Devin; Jules |
| Opens | prefilled; the user sends it there | `claude-cli://open?q=&cwd=`, `codex://new?prompt=&path=`, `cursor://…/prompt?text=`, `zed://agent?prompt=`, `conductor://prompt=…`, `linear.app/new?title=`; `t3.chat/new?q=` sends at once |
| Any | nothing; the mark stays a reminder | clipboard and drag |

The vocabulary already converges: working / needs you / done / failed appears
in Claude (`claude agents`: working, blocked, done, failed), Codex app-server,
T3 Code, Devin (`waiting_for_user`), Copilot (`waiting_for_user`), Jules
(`AWAITING_USER_FEEDBACK`), Linear (`awaitingInput`), A2A and the MCP tasks
extension. One small state machine covers all of them.

**Sign-in.** The routes that keep our rule (the browser never holds a
credential) are the user's own CLIs (`claude`, `codex`, `agy`, `gh`, the Devin
CLI after `devin auth login`), deep links and the clipboard. The Cursor
Cloud Agents API, the Devin and Jules APIs, Warp cloud runs and OpenAI's
Sign in with ChatGPT tokens all need the browser to keep a key or token.
Anthropic's terms forbid routing a Claude subscription through a third-party
app; running the user's own unmodified `claude` is allowed.

**Link back.** GitHub (and likely other Markdown renderers) strips custom
schemes such as `axiosozo://`. Use a plain web address the browser recognises,
e.g. `http://mark.axiosozo.localhost/<id>` (`*.localhost` is loopback in
Firefox): when AxioSozo is the default browser it opens the spot directly;
otherwise a tiny loopback page hands over to `axiosozo://`.

## 3. The dashboard

**No agent dashboard.** The category is saturated (one site compares 68
agent managers), two closed in 2026 (Terragon, Vibe Kanban), and pushing an
agent view into a familiar surface draws the strongest backlash (GitHub's
Agents tab: "How do I disable this tab?", 90 votes). Separate AI places in
browsers died within 9–17 months (Atlas, Edge Copilot Mode, Mariner).

**Yes to a dashboard of the product.** The **Atlas**: every page of a project
as a live thumbnail, signed in, with marks pinned on it, what changed since you
last looked (by whom: you, Claude, Codex, Devin), console errors, drift between
local, preview and production, and a time slider back through commits and
deploys. It is summoned, temporary, and ends in decisions. "What changed since
you last looked" is proven for documents and designs (Google Docs, Figma Dev
Mode, the Wikipedia watchlist) but nobody does it for rendered products, and the
nearest tool "cannot capture pages behind a login".

**The walk is the dashboard in motion.** After time away the browser offers a
walk through the changed pages. The user's own agent (in their chosen home)
picks the order and writes one line per step; the browser plays it on the real
pages, only scrolling and highlighting.

## 4. the owner's favourite pieces: how

- **Work happening on the component.** The browser already knows the files an
  agent edits from its stream. Map files to elements with the dev metadata the
  frameworks already expose without config: Svelte 5 and Astro per element,
  Vue 3 per component, React 19 on Vite via `_debugStack`, Angular. Time it
  with Vite's HMR messages (Gecko can watch a tab's WebSocket frames from
  outside the page; unverified from our actor) or a DOM-change observer, then
  diff the pixels of the affected elements. Effort M. **Needs an exception** to
  "never read page script objects", limited to local project origins and plain
  data properties, plus a security review.
- **Before/after.** Now: snapshots anchored to the element (not the
  viewport), held in memory, compared with pixelmatch; anchoring avoids most
  layout-shift noise. Effort S. Later: twin tabs, the previous commit running
  in a worktree next to the current one with scroll and clicks mirrored
  (pnpm's global virtual store makes extra worktrees cheap). Effort M–L.
  Preview-deployment links as a bonus.
- **The walk.** Don't give the agent a browser driver (Firefox removed CDP in
  141; existing browser MCP servers mean full remote control). The agent
  proposes a tour over the existing approved, project-scoped agent channel:
  `{steps: [{url, target, say}]}`; the browser validates every step (same
  project, loopback, one line, no actions) and plays it with Next/Back. Next.js
  16 serves `/_next/mcp` with `get_routes`; other frameworks map files to
  pages by their routing conventions. Effort M.

## 5. Honest about what exists

The loop "pin feedback on a live app, your coding agent fixes it, see the
result on the pin" exists: Pincushion (SaaS, Chrome extension, before + PR +
verified/regressed verdict on the pin), Agentation (dev-time React toolbar),
and point-and-send inside Cursor, Codex and Claude's built-in browsers
(logged out, dev pages only). "Comment and an agent fixes it" alone would be
late.

What is ours: it is engine-level, so it works on any page, including
signed-in production and third-party admin sites, with nothing installed on
them; it is scoped by space and identity; it is neutral across agents and
destinations; work is drawn live at the spot; before/after is drawn in place;
and "since you last looked" spans marks, agents and deploys.

## 6. Ideas to react to

Sketched (see the concept page in the notes folder):
X-ray (hold ⌥: who touched each component last); the walk; same mark, three
agents (keep the best); twin tabs; watchers on the signed-in web; agents leave
marks when unsure; kept marks guard themselves; mark someone else's page, land
on yours.

More, unsketched:
- A walk you can send: record the walk on a preview and share it with a
  co-founder or client instead of a screen recording.
- Release notes from the walk: what you kept becomes the changelog.
- Cost on the spot: "this fix took 13 s and €0.05", and per page in the Atlas.
- Watch a mark in picture-in-picture while the agent works, instead of a
  spinner or the phone.
- Marks know their account: reopening one opens the right Google account.
- See it as a customer: open the same page as another role in a container next
  to yours; marks show who sees what.
- Customer reports become marks on the page they are about.
- The waiting slot: while an agent works, offer the next mark to check rather
  than letting the user drift to a feed.
- Needs-you waits for a natural pause (not while typing in a form or on a
  call).
- Front page: a daily, finite page of what moved, gone at night.
- Empty is success: the new tab shows at most three decisions.

## 7. Decisions for the owner

1. **Exception for local project pages** to read the framework's dev metadata
   (X-ray, live work on components).
2. **Keys for cloud destinations** (Devin, Cursor, Jules): may the browser keep
   a key the user pastes, in the macOS keychain, or only routes that use the
   user's own sign-in?
3. **Agents pointing back at the browser**: may any agent the user runs
   propose tours and leave marks through the agent channel, per project, with
   approval?
4. **ACP**: should the browser speak it, to reach ~40 agents through one
   protocol? Doing so makes it something close to a chat client, which pulls
   against rule 3.
5. **Link back** through `*.localhost` addresses, which work best when
   AxioSozo is the default browser.

## 8. Proposed next experiments

1. A *home for work* per project, with T3 Code as the first two-way
   destination and Claude Code / Codex / copy as the others.
2. Live work drawn on the component, for Vite projects.
3. Element-anchored before/after on the mark.
4. The walk, on one real project (RemoteDraw web).
5. The Atlas, after the walk shows whether the owner wants to *see* their frontends
   after time away or only to know that nothing broke.
