# Daily flow · interaction map

Status: describes the Zen/Gecko frontend on branch `ui/zen-integration`. The
flows below are covered by Node unit tests with synthetic fixtures; the GUI
run on a real build is pending. Nothing here is READY (see
[setup status](SETUP_STATUS.md)).

Zen stays the frontend. AxioSozo adds a few native-looking pieces: a space
switcher at the bottom of the sidebar, the Projects section under the space name,
an environment pill in the address bar, entries in the space menu and one
page, `about:axiosozo`. Apart from ⌥⌘A for **Send to Agent…**, it takes no
keyboard shortcut. The command palette,
`Cmd+T` panel and saved-pages UI of the first experience were retired at the
Zen reset (HANDOFF_3 §3).

## Spaces

- The bottom **space switcher** shows the current space and switches between
  spaces (`axiosozo.ui.spaceSwitcher.enabled=false` returns to stock Zen). A
  tab dragged onto a space's dot and held there for half a second (Zen's own
  delay) moves to that space; passing over the dots does nothing.
- A space has a **type** label: personal, organization or project. The type
  does not decide what a space may hold: **any space can hold projects**,
  several at once, personal spaces included.
- The space menu (right-click a space) has **Space type**, **Projects in this
  space** (tick a project to move it here, untick to take it out) and **Add
  project to this space…**, which opens the add-project review with that space
  chosen. **Spaces in AxioSozo…** opens `about:axiosozo#projects`.

## Adding a project

1. `about:axiosozo` → **Projects** → **Add project…** (or the space menu).
2. Pick the folder in the native folder picker. Detection reads only a fixed
   list of config files, in a monorepo also those of the app folders
   (`apps/*`, `packages/*`, workspace globs, the Tauri frontend folder). It
   never reads `.env*` files, never follows links out of the folder and runs
   nothing.
3. The **review sheet** shows:
   - the name and the **space** (default: the space this window shows, marked
     *current space*; the list names every space by its own name);
   - the **services** with their start commands; nothing runs until you start
     one, and the first start shows the exact command;
   - the **environments**, grouped per app when there is more than one (for
     example a Tauri app on `localhost:1420` and a web app on
     `localhost:5173`), each with a checkbox and an editable address; values
     that are framework defaults are marked **guessed**; **Add environment**
     adds one by hand;
   - **Production URL (optional)**: hosting files such as `.vercel` only give
     the dashboard, so the live address is typed here. It is offered only while
     no ticked address is named `production`, so the two never disagree;
   - **Links**: the project panel lists them all, *shown first* (repository,
     package, store) above *Other links* (issues, CI, releases, hosting
     dashboards…); **Show first** / **Show later** moves one either way;
   - what was read and refused, and an optional `.axiosozo/project.json` write
     (asked again before writing).
4. After **Add project** the page says where the project now lives ("… was
   added to the space Home. It is in that space's sidebar…") with a **Switch
   to Home** button.

## In the sidebar

Design and rationale: [projects, servers and connections](design/projects.md).

- Under the space name, a quiet **Projects** heading (click to fold; `+` adds
  a project to this space) and **one row per project**: its own icon or a
  monogram in its container's colour, the name, and only meaningful badges
  (a green count of running servers, amber while one starts, red when one
  failed, the console-error count). Order is alphabetical and stable; past six
  projects the rest fold into **N more**, never hiding the current or a
  running project. The project of the front tab is marked current.
- Hovering a project shows ▶: start its main server and open it.
- A row opens the **project panel** beside the sidebar: **Run** (web and API
  servers, mobile and desktop apps, workers: open, start, stop, output; the
  first run of a command shows it and asks), **Links** (environments,
  repository, dashboards), **Project home**, and ⋯ (Edit project…, Stop all
  servers, Remove from space). Actions without a visible result confirm in a
  Zen toast: **Remove from space** (with **Undo**), **Stop all** ("Stopped 3
  servers") and a ▶ that could not start.
- **N running** in the heading opens every run AxioSozo started, in every
  space, with Stop and Stop all. Runs stop when you stop them, when the
  project is removed, and when AxioSozo quits or crashes.
- Kept in Zen's compact mode; the collapsed icon sidebar shows the project
  icons. Zen's Clear button is hidden.

## Tabs and environments

- Any tab whose address falls under a project environment is linked to that
  project, also when the address was typed by hand. `localhost`, `127.0.0.1`
  and `[::1]` count as the same host; projects of the current space win.
- The **environment pill** in the address bar names the environment (`web ·
  local` in multi-app projects). Its menu switches to another environment of
  the same app on the same path, query and fragment; other apps open at
  their own address. It describes only its own environment (a red dot only
  when that server stopped with an error; other servers that are down are in
  its tooltip) and shrinks to its dot in a narrow sidebar address bar.
- A refused connection to a declared local address shows the **waiting page**
  over the tab; it loads once the port answers. When the project declares how
  to start that server, the page offers **Start** with the exact command and
  then shows it starting. Other connection errors keep
  Firefox's error page.
- Editing a project's environments in `about:axiosozo` re-links open tabs at
  once.

## `about:axiosozo`

Three sections, deep links `#projects`, `#rules`, `#ai` (old `#home`, `#time`
and `#settings` redirect):

- **Projects**: every space with its projects, the space type and (for
  project spaces) its organization; *Needs attention* only when something
  needs you: a server AxioSozo started crashed or could not start, an agent
  needs you or failed, or a rule limit is reached. A local server that is
  simply not running is the normal state: the project says *Not running*
  with an empty ring, never red, and the Projects tab count stays neutral
  (red only for a crashed server). The first-run guide when there are no
  projects yet, with the one-time safe-browsing offer above it.
- **Site rules**: each rule with its own time today and over 7 days, then the
  most-used sites of the chosen period with **Add rule**; export and delete of
  the screen-time ledger.
- **AI & keys**: which assistants are installed (read from installation
  metadata only; nothing is started and answers are not yet verified), the
  **Jev** card with the key state, a password field with **Store key** and
  **Remove key…** (the field is cleared at once and the key is never shown
  again; storing makes no call to Jev), Jev consent, interval and hourly
  budget, and the experimental engine setting.

## Ask AI

- **Tools → Ask AI…** (normal windows only) opens one compact modal in the
  material of Zen's floating address bar. It is never a sidebar and never
  docks to a side.
- Header: the provider menu, **Settings** (the *AI & keys* window with
  provider configurations and the Codex sign-in command) and Close. Escape
  closes and returns focus; Tab stays inside; ⌘Enter sends.
- **Share this page's title and address** starts unticked; the line below it
  says exactly what is sent. Nothing is sent until **Send**. The answer is
  plain text; **New conversation** and **Stop** end the provider session.
- No provider is shown as ready; live calls need a signed-in official client
  and are not verified in this build.

## Send to an agent

- **Send to Agent…** in the page context menu or ⌥⌘A, on web pages of normal
  windows only (never private windows, password pages or sensitive sites).
- The doorhanger "Send *page* to an agent" has an optional task, **Include
  the selected text** (unticked by default) and, from a project's console,
  **Include this tab's console errors**. It names the project and says what
  is always included (title and address, without query or fragment).
- **Copy for agent** copies it as text to paste into Claude Code, Codex or
  another agent. A copy that worked is said briefly (**Done**) and leaves by
  itself; anything that did not happen says so and stays until closed.
  Opening an agent directly is not in this build; for a picture, capture an
  area (below).

## Capture an area for an agent

Design: [capture an area](design/region-capture.md).

- **Hold the right mouse button and drag** over a web page (on a trackpad:
  hold Control, press and drag): the area is selected (white frame, size in
  points, the rest of the tab dims). A plain right-click still opens the
  normal menu at the same spot; a page that has its own right-click menu
  keeps its own drag. A drag over a page that cannot be captured (start
  page, settings, sensitive sites) says why in a toast.
- **Capture Area for Agent…** in the page menu does the same with the left
  button or the trackpad: drag over an area, or click once for the visible
  page. Esc cancels.
- On release the area freezes and a small bar shows its size and project,
  an optional note and **Copy for agent** (Return: the picture plus a plain
  note with title, address, project and the note) or **Copy image**. A Zen
  toast says what was copied. Clicking outside, Esc, switching tabs or a
  navigation discards it.
- Never in private windows, on sensitive sites, on non-web pages or (not yet)
  on Chromium tabs; the toast says why. Nothing is saved or sent anywhere:
  only your clipboard, after your click.
  `axiosozo.regionCapture.rightDrag.enabled=false` keeps right-click stock.
