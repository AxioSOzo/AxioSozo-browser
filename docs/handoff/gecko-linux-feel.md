Status: DONE

# Handoff: Gecko native feel on Linux (`cloud/gecko-linux-feel`)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/6 (draft, into `cloud/integration`).
Branch `cloud/gecko-linux-feel` (mirrored to `claude/gecko-linux-feel-0wl6jn`).
Nothing here is READY; macOS was not run (no Mac in this session).

## Machine resources

Claude Code cloud session: Ubuntu 24.04 x86_64, 4 vCPU, ~15 GiB RAM, no Docker,
no artifact/log downloads (results via the `ci-results` branch). Builds and GUI
runs: GitHub-hosted ubuntu-24.04 runners (4 vCPU, 15.6 GiB).

## What changed

- **Platform wording** — `apps/browser/chrome/overview/platform-words.mjs`
  (`words()`, `shortcutLabel()`, `accelKey()/accelOnly()/accelAria()`,
  `localizeMarked()`). macOS text is byte-identical; on Linux "this Mac" →
  "this computer", "the macOS Keychain" → "the system keyring (Secret
  Service)", `⌘X` → `Ctrl+X`, "press Return" → "press Enter". ~80 authored
  strings wrapped at their source in overview-model, about-axiosozo
  (.mjs/.html), providers (Settings/Status/Panel, providers-settings.xhtml),
  SiteRuleRuntime, ProjectSidebar, Lab (agents, ai, capture-ai, errands,
  handover, start-task, today-strip; experiment pitches at render). User data
  is never rewritten. `platform-words.test.mjs` fails on a new unwrapped Mac-ism.
- **Keyboard** — BrowserExperience and the Ask AI panel use Ctrl on Linux;
  RegionCapture's Control+click-as-right-click is macOS-only.
- **`LinuxDesktop.sys.mjs`** (Linux only; called from AxioSozoStartup after
  Zen's startup promise): default-branch prefs = Firefox 156's wheel/smooth
  scroll defaults (instead of Zen fastfox) and `zen.view.hide-window-controls=false`;
  `installLinuxWindowSizing()` gives the window Firefox's first-window size
  when Zen's welcome ends (welcome locks 1200×720); `installLinuxStyles()`
  loads `linux-desktop.css` (welcome backdrop when the H.264 video cannot play).
  Done at runtime because Zen's ffprefs orders duplicate pref names by
  directory listing order.
- **`scripts/linux_desktop.py`** render/install/uninstall a per-user
  `AxioSozoDev.desktop` + hicolor icons (`StartupWMClass=AxioSozoDev`, matching
  the measured WM_CLASS `Navigator, AxioSozoDev`); never sets default browser.
- **`scripts/gui_gecko_feel.py`** feel harness on top of gui_test.py (window
  manager, XDG_CURRENT_DESKTOP, GTK theme, GDK_SCALE, first run driven through
  the welcome) + `.github/workflows/linux-gecko-feel.yml`,
  `.github/actions/gecko-feel/`, `.github/gecko-feel.json` (baseline/after run ids).
- Tests: `apps/browser/tests/platform-words.test.mjs`, `linux-desktop.test.mjs`,
  `tests/test_linux_desktop.py`. Docs: `docs/LINUX.md` "Native feel",
  `docs/evidence/linux/gecko-feel/`.

## Commands and runs (results)

- Local: full browser node suite 2898 pass / 5 fail — the same 5 fail on the
  untouched base without `storage.py exec` (project-reader integration and
  similar TMPDIR-bound tests); `python3 -m unittest tests/test_linux_desktop.py` OK;
  `apps/browser/tests/test_bootstrap.py` OK.
- PR `linux-ci` (check + test on Linux): 39327782854 success, 39328804114 success.
- `linux-gecko-feel` 39327744049: before matrix (cancelled by the next push).
- 39328797871: first full build (cold, 9146 s) + after cells: found the
  post-welcome sizing not taking effect (2 strict FAILs) — fixed in 6ea1bde.
- **39346931130 (commit 6ea1bde): success** — unit, build (warm, 1154 s),
  7 before + 7 after cells; every after cell PASS with `--strict`.

## Verified (PASS, run 39346931130, real Linux app under Xvfb)

- No Mac wording in about:axiosozo Projects/Site rules/AI & keys/Lab (GNOME, KDE, dark, 2×).
- First window maximized under a window manager (the "not full screen" gap was the WM-less Xvfb).
- After Zen's welcome: maximized at 1× and 2× (baseline: 1200×757).
- Window controls: Zen's GTK min/restore/close visible with CSD (GNOME, KDE);
  WM frame without a desktop session. Baseline CSD: none visible.
- Prefs equal stock Firefox on Linux (middle-click paste on, autoscroll off,
  overlay scrollbars, kinetic scrolling, portal file picker=2, scroll physics).
- GTK dark theme followed by chrome, about:axiosozo and content (before too).
- WM_CLASS `Navigator, AxioSozoDev`; `.desktop` validates; icons 16–128.
- Welcome readable without H.264 (video error 4, `canPlayType(h264)=""` on the runner).
- Perf: no regression (smooth scroll 60 fps p95 17.1 ms; 114 px/notch; tab
  switch and startup within runner noise; one sample per cell).

## NOT_VERIFIED

- macOS (identical text is covered by unit tests only; LinuxDesktop returns at once off Linux).
- A real GNOME (mutter) / KDE (KWin) session, Wayland app-id grouping, real
  GPU paths (dmabuf, VA-API, hardware WebRender), KDE portal file dialog.
- Ctrl shortcuts / Ask AI panel / region capture Ctrl+click on Linux were not
  driven in the GUI (unit-tested only; BrowserExperience is not installed in
  normal startup). No address-bar typing (WebRender crash, cloud/linux-platform).
- `linux_desktop.py install` on a real desktop (tested in a temp XDG_DATA_HOME).

## Blockers

None for this scope.

## Notes for other workstreams

- New authored copy that mentions the Mac, the Keychain, ⌘ or Return must go
  through `words()` / `shortcutLabel()` (or `data-platform-words` in static
  HTML); `platform-words.test.mjs` enforces it. Keyboard handlers should use
  `accelKey()`/`accelOnly()` instead of `metaKey`.
- cloud/linux-platform: `scripts/gui_test.py` runs without a window manager;
  `gui_gecko_feel.py --wm auto` shows how to add metacity, and
  `XDG_CURRENT_DESKTOP` switches Gecko to client-side decorations on X11.
  `./dev package` could ship `linux_desktop.py render`'s output.
- Integration lead: `.github/gecko-feel.json` `after_run_id` lets a
  harness-only push reuse a build.

## Next steps

1. Run on a real GNOME and KDE desktop (Wayland and X11):
   `./dev fetch-build && python3 scripts/linux_desktop.py install --app fetched`,
   check launcher icon grouping, CSD buttons, scroll feel, portal dialogs.
2. Decide whether `./dev package` should include the .desktop file and icons.
3. Add a Linux GUI scenario for the Ctrl shortcuts once BrowserExperience is wired into normal startup.
4. Measure startup/tab-switch with several samples per cell before claiming perf changes.
