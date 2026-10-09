# Daily flow · interaction map

Status: describes the Zen/Gecko frontend on branch `ui/zen-integration`. The
flows below are covered by Node unit tests with synthetic fixtures; the GUI
run on a real build is pending. Nothing here is READY (see
[setup status](SETUP_STATUS.md)).

Zen stays the frontend. AxioSozo adds a few native-looking pieces: a space
switcher at the bottom of the sidebar, the Projects section under the space name,
an environment pill in the address bar, entries in the space menu and one
page, `about:axiosozo`. It takes no keyboard shortcut. The command palette,
`Cmd+T` panel and saved-pages UI of the first experience were retired at the
Zen reset (HANDOFF_3 §3).

## Spaces

- The bottom **space switcher** shows the current space and switches between
  spaces (`axiosozo.ui.spaceSwitcher.enabled=false` returns to stock Zen).
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
   - the name and the **space** (default: the space this window shows; the
     list has every space);
   - the **environments**, grouped per app when there is more than one (for
     example a Tauri app on `localhost:1420` and a web app on
     `localhost:5173`), each with a checkbox and an editable address; values
     that are framework defaults are marked **guessed**; **Add environment**
     adds one by hand;
   - **Production URL (optional)**: hosting files such as `.vercel` only give
     the dashboard, so the live address is typed here;
   - **Links**: *Shown in the sidebar* (repository, package, store) and *More*
     (issues, CI, releases, hosting dashboards…), movable either way;
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
  servers, Remove from space).
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
  their own address.
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
  project spaces) its organization; *Needs attention* when a local server is
  down or a rule limit is reached; the first-run guide when there are no
  projects yet.
- **Site rules**: each rule with its own time today and over 7 days, then the
  most-used sites of the chosen period with **Add rule**; export and delete of
  the screen-time ledger.
- **AI & keys**: which assistants are installed (read from installation
  metadata only; nothing is started and answers are not yet verified), the
  **Jev** card with the key state, a password field with **Store key** and
  **Remove key…** (the field is cleared at once and the key is never shown
  again; storing makes no call to Jev), Jev consent, interval and hourly
  budget, and the experimental engine setting.
