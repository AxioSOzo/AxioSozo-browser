# Projects, servers and connections

Status: design and first implementation (5 October 2026, branch
`ui/projects-ux`). Unit tests cover the sidebar, the panel, the waiting page
and the runner (including real `/bin/sh` process groups). The sidebar and panel
were rendered from the real modules and stylesheet in a headless Gecko harness
in light, dark and collapsed layouts. They have **not** yet been seen inside a
rebuilt Zen window. Nothing here is READY (see [setup status](../SETUP_STATUS.md)).

## 1. What was wrong

The first project sidebar was a list of links dressed as tabs:

- Every project was a folder glyph with one status dot per environment. The
  dots carried little meaning (a ring for "not checked" looked the same as
  "absent"), and the folder glyph ignored the project's own identity.
- Expanding a project listed every environment of every app. Two multi-app
  projects filled half the sidebar, and those rows looked like tabs without
  being tabs.
- Clicking a local server opened a new, separate tab: the row was a link, not
  the server. If the server was down, the waiting page told you to open a
  terminal and start it yourself.
- Compact mode hid projects entirely, and Zen's Clear button sat in the middle
  of the list, one click away from closing every tab of a space.

## 2. The model

A **project** is a folder plus everything around it. It has three kinds of
things, and the UI gives each one a different shape:

| Thing | Examples | Shape in the UI |
| --- | --- | --- |
| **Run targets**: things the project can run | web and API dev servers, an iOS app in the Simulator, a Tauri/macOS app, a Convex or queue worker, "all apps" | Panel rows with state, Start/Stop and output |
| **Links**: places the project lives elsewhere | production and preview URLs, repository, Vercel/Convex dashboards, store pages | Panel rows with the site's favicon |
| **Tabs**: what you look at | `localhost:5173/board`, a PR, a dashboard | Zen's own tab list, in the project's container |

A run target is a declared service of the project (manifest v3, `command` and
`cwd`; `url`/`port` when it serves pages). Its kind (web, API, mobile, desktop,
worker, other) comes from a declared `kind` when present, otherwise from its
name and command (`ProjectRunner.inferKind`). Kind is only presentation;
nothing depends on it for safety.

Each run target shows one state, combining whether this browser runs its
process with whether its port answers:

| State | Meaning |
| --- | --- |
| Starting… | our process runs; its address has not answered or printed yet |
| Running | our process runs (and answers or printed its address) |
| Running, started outside AxioSozo | not ours, but its port answers (Open works, Stop is not offered) |
| Stopping… | stop requested; the group gets SIGTERM, then SIGKILL after 5 s |
| Stopped with an error | our process exited non-zero (exit code shown; output kept) |
| Not running | everything else |

## 3. Sidebar

- Under the space header, a quiet **Projects** heading (click to fold the
  section, `+` on hover adds a project to this space via
  `about:axiosozo#add-project=<space>`).
- **One row per project, always.** The project's own icon (manifest `icon`,
  read through the containment reader) or a monogram tile in its container's
  colour (or a stable hue). No folder glyph, no dots.
- Colour only where it means something: a green count when servers run, amber
  while one starts, a red dot when one failed, and the existing console-error
  count. Hovering a project with a startable main server shows ▶ in place of
  the badges.
- Order is alphabetical and stable. It never jumps when you switch tabs. Past
  six projects the rest fold into "N more", but the current project and any
  running or failed project always stay visible.
- The row of the project whose tab is in front is the **current** project
  (semibold name, `aria-current`), as a chat's project is in ChatGPT.
- When anything AxioSozo started is running, the heading shows **N running**.
  It opens the **Running** panel: every run in every space, with Stop, Stop
  all and failed runs to dismiss. This is the central place for servers across
  projects.
- Compact mode keeps the section (it slides out with the sidebar). Zen's
  collapsed icon sidebar keeps the project icons, ringed green, amber or red
  by state.
- Zen's Clear button is hidden while the AxioSozo sidebar is active; its
  keyboard shortcut and command remain.

## 4. The project panel

A row opens a panel beside the sidebar, the way Arc or Linear show detail
without navigating:

- Header: icon, name, folder (`~/…`), and ⋯ (Project home, Edit project…,
  Stop all servers, Remove from space).
- **Run**: every run target with its kind icon, address or kind, and state.
  - Clicking a web target opens its page. If it is stopped and startable,
    clicking starts it first and opens the page at once; the waiting page then
    shows it starting.
  - Clicking a target without a page (iOS, desktop, worker) starts it or shows
    its output.
  - ▶ and ■ start and stop; ≡ shows the last 60 lines of output, which stay
    pinned to the bottom while new lines arrive.
  - **Add a server or app…** opens the project editor.
- **Links**: remote environments, plus local ones no run target covers, then
  primary surfaces (repository, package, store), then the rest (CI, hosting,
  dashboards). There is no separate "More" menu any more.
- The panel and the sidebar redraw only what changed: rows are keyed and
  updated in place, and an open panel keeps its anchor, focus and log scroll
  while a server prints.

## 5. Starting, stopping and safety

`ProjectRunner.sys.mjs` owns every process. `AxioSozoServices` exposes
`projectRuns`, `startRun`, `stopRun`, `stopRuns`, `runLog`, `dismissRun` and
`listRuns`, plus a name-only `runs` event (at most every 200 ms).

- **Nothing runs without a button that names it.** The first time a command
  runs, the panel shows the exact command and folder ("Run admin on this Mac?
  `bun run dev:admin` in ~/Code/…") and waits for **Run**. The approval is
  remembered per project, folder and exact command in the profile
  (`run-approvals.json`, at most 512). A changed command asks again. The
  waiting page's **Start** shows the command on the page itself, so pressing it
  is the approval.
- Commands come only from the stored project record, never from page content.
  Private windows never start anything. A project folder that now resolves
  somewhere else, or lies under a denied root, is refused.
- **Process groups.** Each run is a fixed `/bin/sh` supervisor (a constant
  script; the shell and command are positional arguments, never interpolated)
  that starts the command through the user's login shell in its own process
  group. Stop closes the supervisor's stdin; it sends SIGTERM to the whole
  group and SIGKILL after five seconds. This matters because Gecko's
  `Subprocess` kills only the direct child, and `bun → vite` would otherwise
  keep the port.
- **The pipe is the lease.** The same stdin end-of-file fires when the
  browser quits or crashes, so dev servers never outlive the browser that
  started them. Quitting also stops every run through an AsyncShutdown blocker.
  Removing a project stops its runs.
- **Environment.** Only what a terminal needs: `HOME`, `USER`, `SHELL`,
  `LANG`, `TMPDIR`, and a `PATH` with the usual per-user tool folders (Bun,
  Cargo, Deno, Volta, fnm, mise, asdf, Homebrew) ahead of the browser's own.
  `BROWSER=none` stops dev servers from opening another browser, and
  `NO_COLOR=1` keeps output plain. No Mozilla or AxioSozo variables are passed
  on.
- **Output** stays in RAM only: 400 lines per run, ANSI escapes stripped. The
  first local address a server prints (Vite's `Local: http://localhost:5174/`)
  counts as ready before the next port check. It is also used to open a server
  that has no declared address.

## 6. Waiting page

A refused declared local address keeps the waiting page, which now:

- shows **Start web** with the exact command (`bun run dev · in apps/web`)
  when the project declares one;
- while starting, shows "Starting web…" with the newest output line, and loads
  the page once the port answers;
- after a crash, shows the exit code and points to the output in the panel.

## 7. Projects and tabs

**Why a server opened "outside its project".** Rows were links into Zen's
tab list, which knows nothing about projects. The tab got the project's
container, so its sign-ins were right, but nothing in the sidebar tied the
tab back to the project.

What changed now:

- A server or link selects an open tab of that environment in this space that
  already has the right container, and only otherwise opens a routed one. This
  behaviour existed but is kept and tested through the panel.
- The project of the front tab is marked current in the sidebar, and its panel
  shows which of its servers run.
- The address-bar pill still names the environment and container.

**Recommended next step: project folders backed by Zen folders.** The pinned
Zen has real folders (`gZenFolders.createFolder`, custom icons, persisted ids
in session restore). One folder per project in its space, holding its pinned
server tabs, would make "the tab is in its project" literally true. A server
opened from the panel would land in that folder. I did not ship this in the
first pass because it needs real-window iteration. The edge cases are:

- creating folders only after session restore, so they are not duplicated;
- what deleting or renaming a project folder means (likely: replace those
  actions in Zen's folder menu with Remove from space and Edit project);
- folders moved to another space;
- tabs dragged in or out;
- Zen's pinned-tab semantics, since folder tabs are pinned.

**Projects as separate spaces** was considered. A space per project gives full
isolation, an icon and a default container. It also hides every other tab
(mail, calendar) while you work, and multiplies spaces past ten projects. The
model already allows it: any space can hold one project. The sidebar does not
force it.

## 8. Adding servers and connections

- Today: **Add a server or app…** opens the project editor. Manifest v3 stores
  `command` and `cwd`, and a service may have a command without an address
  (an iOS app, a worker). The editor's service rows still need command and
  folder fields; that editor belongs to the add-project and Understand
  workstream (`overview-model.mjs`), which is changing in parallel.
- Detection proposes start commands (`contexts/setup.mjs`: README fences,
  package scripts, Makefile/justfile targets, Procfile) and the project icon.
  The Understand setup document can propose services with a kind, command,
  folder and local address. The review sheet should present those as a "Run"
  list with the same kinds as the panel.
- **Vercel and other links.** Static detection reads `.vercel/project.json`
  and `vercel.json`, but those hold ids, not the team and project slugs. So it
  can only offer the generic `vercel.com/dashboard` link, which is why Vercel
  links are missing today. Production domains come only from documented files. The setup agent should additionally return
  `links`: the Vercel project dashboard, production and preview domains,
  Convex, Clerk and Stripe dashboards, the repository and its Actions, each
  marked found or guessed. Kept links become panel links. That belongs in the
  understand-v1 `setup` document (a contract change for that workstream).

## 9. iOS and other non-web targets

For a monorepo with an iOS app (a RemoteDraw-like layout), the iOS app is a
run target of kind **mobile** whose command builds and launches it (for
example `xcodebuild … -destination 'platform=iOS Simulator,name=iPhone 16'`
followed by `xcrun simctl launch …`, or `bunx expo run:ios`). It starts and
stops like a server, its build output is in the panel, and nothing opens in a
tab. Natural follow-ups:

- **Open in Xcode** (when the folder has an `.xcodeproj` or `.xcworkspace`),
  through `/usr/bin/open` with an argument array;
- **Open Simulator**;
- for desktop apps, focusing the app's window when it runs.

## 10. Next steps

1. Rebuild and verify in a real Zen window: panel placement beside the
   sidebar, keyboard (Tab/Escape), VoiceOver names, light and dark, compact
   and collapsed sidebars.
2. Editor command and folder fields, plus the review sheet's Run list
   (coordinate with the add-project workstream).
3. Project folders backed by Zen folders (§7).
4. Open in Xcode or Simulator for mobile targets; Restart.
5. Show servers on the project home in `about:axiosozo`, sharing this model.
6. DomuCortex specifics, to be discussed.
