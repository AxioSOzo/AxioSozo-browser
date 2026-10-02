# Plan 4 — the workstation

Date: 2 October 2026. Branch: `product/workstation` (worktree
`/Volumes/T9/Code/AxioSozo-browser-workstation`). This plan replaces the product
direction of [HANDOFF_3](HANDOFF_3.md); what HANDOFF_3 built stays and is reused.
It is written so an agent with sub-agents can execute it **without Wout**. Stop
only at the gates in §7.

## 1. Core

> **AxioSozo is where you work while your agents work.** You hand work off with
> context, the browser knows what is running and what needs you, and it brings
> you back when it is your turn.

Coding agents only see code. The browser is the one app that sees both the
results (localhost, previews, PRs, dashboards) and the rest of the day (mail,
bank, tax office). That is our place.

**Build for Wout first.** The reference users are Wout's own projects:
DomuCortex (`/Volumes/T9/Code/DomuCortex`) and RemoteDraw
(`/Volumes/T9/Code/RemoteDraw`). A feature is done when it is useful on those two.
But every feature is a general mechanism driven by detection or configuration;
nothing is hard-coded for those repos or for specific websites.

What these projects look like (this is what "a project" must handle):

- Bun monorepos with several apps: customer web, admin web, API portal, docs,
  mobile (iOS/Android), a Tauri or native macOS desktop app.
- Several production domains per project (`app.`, `api.`, `docs.`,
  `dashboard.`, `realtime.`), Vercel deployments, a Convex backend, Clerk auth and
  Stripe billing.
- Many agents work in them (`AGENTS.md`, `CLAUDE.md`, `.claude/`, `.codex/`,
  `.agent-worktrees/`).
- Services are logged in with **different accounts per project** (Google,
  Microsoft or GitHub SSO).

## 2. Pillars

Each pillar is a sub-core. They are ordered by priority.

### P1. Projects that understand themselves

A project is a folder plus everything around it: apps, environments, domains,
services, the accounts used for them and the agents working in it. The user
should not have to fill in a form.

- **Arrival without a form.** The current "add project" flow becomes a fallback.
  Primary paths:
  - Opening a `localhost`/`127.0.0.1` URL: the browser finds which of the user's
    processes listens on that port and its working directory (`lsof` with fixed
    arguments via `Subprocess`, no shell, loopback only, own uid only). It then
    offers "This is ~/Code/foo — keep as project?" as one Zen-native notification.
  - Choosing a folder.
  - Matching a GitHub or Vercel URL to a known repo remote.
- **Richer static detection** (still allowlisted, size-capped, no `.env*`, no
  execution):
  - Convex: `convex.json`, `convex/` directory listing.
  - Clerk/Stripe: presence of their packages in `package.json` dependencies,
    never keys.
  - Native and mobile apps: `src-tauri/tauri.conf.json`, Xcode project
    presence, Android `build.gradle(.kts)` presence.
  - Production domains from `vercel.json`, `.vercel/project.json`,
    `wrangler.*`, and documented domains in `docs/**/domains.md`. Documented
    domains are read only if that file is in the allowlist and below the cap;
    they are marked "found in docs, unconfirmed".
  - Agent presence: `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.codex/`,
    `.agent-worktrees/` (names only).
- **Project brief (AI, optional).** If Codex or Claude Code is installed, the
  user can press "Read this project". The browser runs the user's own CLI
  headless in a read-only sandbox, scoped to the folder. Its prompt asks for a
  structured JSON brief:
  - what the product is;
  - its apps and surfaces;
  - its domains and services;
  - how to start it;
  - known risks.

  The brief is validated against a schema, shown as a document (not a chat) and
  stored in the profile. The user can accept it into `.axiosozo/project.json`.
  See §4 for the tier rules.
- **Project home.** This is one calm, well-designed page per project inside
  `about:axiosozo`, reusing the Overview actor. It shows:
  - apps with local/preview/production links and live status;
  - services with their account label (P2);
  - the brief;
  - recent agent activity (P3);
  - console errors (P5).

  It replaces the current slim project list, which Wout finds cryptic and not
  neat. Design quality matters here more than anywhere else: use Zen's tokens,
  type scale and spacing; light and dark; keyboard and screen reader.

### P2. Accounts per project

Two Vercel tabs, one per project, must be able to stay logged in with different
accounts (one Google account, another Google account, a Microsoft account).

- Each project gets its own Gecko container (contextual identity), created
  automatically and named after the project. Links opened from the project home,
  the project block, the environment pill or a project URL match open in that
  container.
- **Shared sites.** Per project, the user marks which sites use the space's
  default container instead, e.g. GitHub with one account everywhere. A sensible
  default is offered and the user confirms.
- The **account label** is free text the user types ("wout@company Google"). The
  browser never reads cookies, tokens or account names from pages to fill it.
- A small, Zen-native indicator shows which project/container a tab belongs to.
  Reuse the container colour; no new chrome.
- Chromium tabs: per-container CEF request context belongs to the CEF
  workstream. Record the requirement in `contracts/` and do not implement it
  here.

### P3. Hand off and come back

- **Send to agent.** One shortcut and one context-menu entry. It collects:
  - URL and title;
  - the selection;
  - optionally a screenshot of the visible tab;
  - recent console errors for the tab;
  - the project folder.

  It hands off to:
  - Claude Code or Codex, as a new terminal session started with the prompt;
  - the desktop app, if a documented URL scheme exists;
  - the clipboard, as a fallback.

  The browser never runs the task itself. Use `Subprocess` with argument arrays;
  never interpolate into a shell string.
- **Knowing what runs.** A small local status endpoint lets agents report
  `started | needs_input | done | failed` with a project path and a short title.
  The browser installs nothing silently. It offers copyable hook config:
  - Claude Code: `Stop` and `Notification` hooks;
  - Codex: the `notify` program.

  These call `axiosozo-notify`, a tiny script shipped in the repo.
- **Coming back.** A calm notification appears: "DomuCortex: agent done". One
  click goes to the result: reload the right localhost route, the preview or the
  PR. Agent state also appears on the project home.

### P4. The browser for agents (plugin)

A local MCP server (`packages/agent-bridge`, stdio) that coding agents add as a
plugin. It talks to the running browser over a per-session, user-approved local
channel.

- **Read tools first:**
  - list tabs;
  - the active tab URL and title;
  - project info and environment URLs;
  - console errors;
  - a screenshot of a tab;
  - open a URL in a new tab in the project container.
- **Act tools** (click, type, navigate an existing tab): each needs a visible
  in-browser confirmation. Never in private windows; never on blocked categories.
- **Under the hood:** WebDriver BiDi for Gecko tabs. CDP for Chromium tabs only
  through the CEF workstream's API. Do not invent an automation protocol.
- Ship config snippets for Claude Code (plugin/`.mcp.json`) and Codex
  (`config.toml`). Building our own MCP server is a product feature. Starting
  third-party MCP servers for discovery remains forbidden.

### P5. Developer surface

- Per-project console error collection for Gecko tabs (count and last messages,
  in memory, cleared on navigation). Show a badge on the project block and the
  project home, plus "Send errors to agent".
- DevTools: keep Firefox DevTools intact. Allowed: theme alignment with Zen and
  a "Send to agent" action from the console. Anything larger goes to `docs/ideas/`.

### P6. Start page (experimental, behind `axiosozo.home.enabled`)

Wout is not yet sure he wants this. Build it last and keep it off by default.
The new tab shows:

- what needs you: agents done or waiting, services down, watches changed;
- your projects with their status;
- watches (§4).

No feed, no news, no shortcuts grid.

### P7. Safety default

At first run, offer "Block adult and malicious sites", checked. It sets Gecko's
DNS-over-HTTPS to a family resolver (Cloudflare `family.cloudflare-dns.com`). It
can be changed in Settings. Do not build a classifier. Blocked categories are
never observed by any AI tier.

## 3. What stays from HANDOFF_3

Keep:

- spaces/contexts on Zen workspaces;
- the manifest;
- the environment pill;
- the waiting page;
- site rules and the ledger;
- the decision contract;
- JSON stores;
- the Zen adapter;
- the release pipeline.

The project list, "add project" flow and Overview layout are **redesigned** under
P1. Site rules stay as they are; their engine is reused by watches.

## 4. Intelligence: three tiers, no chat

Rule: **AI in the browser produces a choice, a status or a document — never a
conversation.** Chat stays in Codex, Claude and ChatGPT.

| Tier | Engine | Used for | Output |
| --- | --- | --- | --- |
| Decide | Jev or OpenAI Decisions API (user's own key, both supported) | site rules, watches, "does this localhost page look broken", routing | one option from a fixed set + confidence |
| Understand | The user's installed Claude Code or Codex CLI, headless, read-only | project brief, explain console errors, summarize what an agent changed | schema-validated JSON rendered as a document |
| Act | The user's agents via P4 | anything that changes code or pages | done by the agent, confirmed in the browser |

- **Decision providers.** Extend `contracts/decision-v1.md` with an optional
  image input (PNG of the visible tab, downscaled, max 1 MiB) and a
  `confidence` field. Add an OpenAI Decisions adapter next to Jev in
  `packages/provider-host`:
  - key entry for both providers in the provider settings, stored in the
    Keychain;
  - per-call provider choice;
  - images only go to a provider that declares image support, and only when the
    rule or watch allows `screen` observation.

  Request and response shapes for the Decisions API must come from its official
  documentation. If the docs are unavailable, implement behind a clearly marked
  `UNVERIFIED_SHAPE` adapter and record it.
- **Understand tier.** Runs the CLI as a child process:
  - with the project folder as cwd;
  - read-only flags;
  - no network tools where the CLI allows that;
  - a timeout;
  - an output cap.

  It never sends `.env*` files; the prompt says so and the sandbox enforces it
  where possible. Requests are queued and cancellable, with a visible indicator
  while running.
- **Watches.** A watch is a page plus a plain-language question plus a fixed
  outcome set. It reuses the site-rule checkpoint engine, budget and observation
  levels, with an added `screen` level. It is checked on a schedule in a hidden
  tab of the right container. A watch is created by the user only.
- **Privacy:**
  - nothing is observed unless the user created the rule or watch;
  - a visible indicator is shown while data leaves the machine;
  - never private windows or password fields;
  - sensitive categories stay capped as today.

## 5. Work order

Each step ends with tests, a GUI check in the real app with screenshots in
`docs/evidence/plan4-<step>/` (git-ignored, as today), an updated
`docs/PLAN_4_STATUS.md`, and a local commit on `product/workstation`. Then go on
to the next step without waiting.

0. **Setup.**
   - Isolated build root: `AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/workstation`.
   - Bring in the Zen upstream for this worktree without modifying the main
     checkout's `upstream/`.
   - Baseline `./dev check` and `./dev test`; record the results.
1. **P1 detection + arrival.** Extend `packages/contexts` detection and
   `contracts/context-v1` (bump to the next version with migration).
   Port-to-folder arrival. Test with synthetic fixtures that mirror the *shape*
   of DomuCortex and RemoteDraw, then a read-only GUI run against the real
   folders.
2. **P2 accounts per project.** Project containers, shared sites, account
   labels, tab indicator. GUI proof: two tabs on the same fixture origin in two
   projects keep separate cookies.
3. **P1 project home** redesign in `about:axiosozo`. Screenshots in light and
   dark for both reference projects.
4. **P3 send to agent + status endpoint + notifications.** Real terminal
   hand-off is tested with a fake agent script, not a real provider.
5. **§4 decision tier:** OpenAI Decisions adapter, image input, key entry for
   both providers. Fakes only (see §7).
6. **§4 understand tier:** CLI runner and project brief. Fake CLI fixtures only
   (see §7).
7. **P5 console errors** + send errors to agent.
8. **P4 agent bridge**, read tools first, then act tools with confirmation.
9. **Watches**, then **P6 start page** (flag off), then **P7** first-run choice.

Use sub-agents for independent parts (pure logic in `packages/`, provider
adapters, the bridge package) while the lead keeps contracts, integration and
the GUI runs. Sub-agents get disjoint paths.

## 6. Rules that still apply

- Everything in `AGENTS.md`. Zen/Gecko is the app; never claim READY; preserve
  TLS, sandboxing, permissions, profiles, accessibility, extensions and
  DevTools.
- **Do not touch the engine workstream's paths:**
  - `native/`;
  - `apps/browser/native/`;
  - `CEF*.sys.mjs`, `Engine*.sys.mjs`, `Chromium*.sys.mjs`;
  - `crates/`.

  That work continues on `engines/native-multi-engine` in the main checkout.
  If P2/P4 need something from it, write the requirement into
  `contracts/` and `docs/PLAN_4_STATUS.md`.
- **Do not build into** `/Volumes/AxioSozoBuild/zen`, which belongs to the
  engine agent.
- **The reference repos are read-only.** Never read their `.env*`, keychains or
  credentials. Never commit any content from them; this repository is public
  and they are private. Fixtures are synthetic, with the same shape and
  invented names.
- Never read personal browser profiles. Use synthetic profiles only.
- Local commits only. No push, tag or release.

## 7. Gates — the only reasons to stop

| Gate | What happens without Wout |
| --- | --- |
| Live provider calls (Jev, OpenAI Decisions, Claude Code/Codex CLI) | Build and test with fakes; mark live paths `NOT_AUTHORIZED` in the status. Continue. |
| macOS Keychain or TCC prompts that need a human click | Skip that check, record `BLOCKED_HUMAN`, continue. |
| A product choice not covered here | Pick the simplest option consistent with §1–§4, record it under "Decisions taken" in the status file, continue. |
| Anything destructive outside the worktree or build root | Do not do it. |

## 8. Open questions for Wout (do not block on these)

1. "Live OS" was not found under `/Volumes/T9/Code`. Where is it?
2. Live AI on the reference projects: allowed, and with which provider?
3. Should the start page (P6) become the main surface, or stay an experiment?
