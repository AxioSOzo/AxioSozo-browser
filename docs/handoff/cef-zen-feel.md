Status: PARTIAL

# Handoff: cef-zen-feel (Chromium tabs inside Zen on Linux)

PR (draft, into `cloud/integration`): https://github.com/AxioSOzo/AxioSozo-browser/pull/8
Branch: `claude/cef-zen-feel-dx16ke` — this session's designated branch, used instead of
`cloud/cef-zen-feel`. The workflow triggers on both names.

Nothing is READY. Here is where things stand:
- E1/E2 for Chromium inside the Linux Zen app are **green**: `linux-cef-zen` runs
  **39359724324** and **39362536705** (on the final code) succeeded, and I inspected its screenshots.
- Most of the native-feel matrix passes.
- PARTIAL because these remain open:
  - dead keys and compose: BLOCKED_ENV under Xvfb;
  - Ctrl+L and Ctrl+T: blocked by the known parent crash that cloud/linux-platform owns;
  - datalist suggestions: EXPERIMENTAL;
  - accessibility, devtools, downloads, permissions and certificate UI on Linux: NOT_VERIFIED.

## Machine resources
- **Session:** Claude Code cloud container: Ubuntu 24.04, 4 vCPU, about 15 GiB.
  - No CEF download here (blocked by the allowlist), so no CEF build and no GUI run.
  - I ran locally only the node suites, the Python unit tests, `test_probe.py` and `py_compile`.
- **Actions:** GitHub-hosted `ubuntu-24.04` (4 vCPU, 16 GiB).
  - The CEF host is built in-job from the pinned CEF 154.0.23 (archive cached).
  - The SUID `chrome-sandbox` is installed (AppArmor blocks user namespaces).
  - The Linux Zen app is the newest `axiosozo-zen-linux-x86_64` artifact. Run 39359724324
    used 39346931130 (`cloud/gecko-linux-feel`, commit 6ea1bde).
  - This branch's chrome JS is overlaid on that artifact. This is TEST-ONLY, recorded as
    `chrome-overlay`, and no Gecko code is compiled.
  - Display: Xvfb 1280×800 / 2560×1600, WebRender software.

## What changed
**Product fixes, each found by the E2E and each with node tests:**
1. **Window title.** `CEFPresenter#setTabLabel` now passes `{isContentTitle}`, so Zen's X11
   window title shows the Chromium page title, as for a Firefox page. Before, it was the brand only.
2. **"Not secure" badge.** It is no longer shown on loopback pages: `loopbackURL()` covers
   127/8, localhost, `*.localhost` and [::1]. This matches Firefox and Chromium.
3. **Ctrl+0.** Firefox disabled `cmd_fullZoomReset` for the hidden 100% Gecko browser, so
   Ctrl+0 did nothing in a zoomed Chromium tab. `ChromiumBrowserUI#updateZoomUI` now drives
   the reset, reduce and enlarge commands from the Chromium tab's own zoom.
4. **F5, Ctrl+R and the reload button.** `Browser:Reload*` were disabled because of the
   hidden about:blank, so these did nothing. `CEFPresenter#syncChrome` now re-enables them
   for the active Chromium tab.
5. **Middle-click paste (Linux PRIMARY).** Windowless Chromium never published its selection.
   - The host (Linux, web mode) implements `on_text_selection_changed` and sends a new
     additive event, `text_selection` (1–16384 UTF-16 units). It is never sent for password
     fields and is deduplicated.
   - The adapter validates it, and only in web mode.
   - The presenter writes the X11 PRIMARY selection only when the user's own pointer or key
     input reached the view in the last second. This is the same rule as Gecko's auto-copy.
   - Pasting PRIMARY into Chromium already worked.
6. **`probe.py check` exit code.** On Linux it exited 1 on PASS, because it `sys.exit`ed a
   dict. That made the Chromium GUI plug-in report BLOCKED_ENV. A passing check now exits 0.

**Tooling and evidence:**
- `.github/workflows/linux-cef-zen.yml` has two jobs:
  - `unit`: the node suites for the CEF adapter, Chromium tabs, UI, a11y and engine UX, plus
    the Python plug-in tests;
  - `e2e`: four GUI runs and a verdict. BLOCKED gates are listed and never counted as
    passes; any FAIL fails the job.
- `scripts/cef_zen_e2e.py` drives the runs:
  - **Fixture mode:** probe toolbar button, typing, click, page 2, toolbar Back, then a host
    SIGKILL, after which the preserved Gecko document must be back.
  - **Web mode:** Zen's tab menu "Open in Chromium", then the full matrix with real X11 input.
    The same page in a Gecko tab is the baseline.
  - **2× subset.**
- Test-only switches:
  - a throwaway profile;
  - Marionette's `unhandledPromptBehavior: ignore`, so Zen's dialogs stay open for the keyboard;
  - for beforeunload, Marionette's content context points at the Gecko tab;
  - `layout.css.devPixelsPerPx=2` for the 2× run.
- `tests/fixtures/cef-zen-feel.html`: an engine-neutral page with fixed CSS-pixel layout that
  reports its state in its title.
- `docs/CAPABILITY_MATRIX.md`: new section "Chromium (CEF) inside Zen on Linux" with one row
  per gate.
- `docs/evidence/linux/cef-zen/39359724324/`: results and screenshots.
- `contracts/cef-v1.md` (Linux hosts): a `text_selection` paragraph.
- `native/chromium-host/README.md`: a Linux note.

## Actions runs (`linux-cef-zen`, results on `ci-results:claude_cef-zen-feel-dx16ke/<run>-1-cef-zen-e2e/`)

| run | result / what it led to |
| --- | --- |
| 39337721312 | host built; `probe.py check` exited 1 on PASS → fix 6 |
| 39338050255 | fixture E1/E2 PASS; most web gates PASS; window title wrong → fix 1; Marionette dismissed dialogs; parent SIGSEGV after Ctrl+L/Escape |
| 39340092092 | fixture-probe harness, fixture E1/E2, 2× PASS; dialogs open but Marionette refuses scripts → read them via the WebDriver alert API |
| 39342477013 | JS dialogs PASS by keyboard; Ctrl+0 never reset (tests then ran at 110%) |
| 39345299134 | E2 web host kill PASS, toolbar history PASS, **Ctrl+L parity PASS**; dead keys BLOCKED_ENV (Gecko baseline too) |
| 39348385457 | diagnosed Ctrl+0 (command disabled) and PRIMARY (Chromium never publishes) → fixes 3, 5 |
| 39351480361 | Ctrl+0 and middle-click PASS; Zen's Ctrl+T opens its new-tab bar, dismissing it crashed the parent |
| 39354267095 | **beforeunload PASS** (Escape stays, Return leaves); Gecko-baseline Ctrl+L crashed the parent → it is not a Chromium bug |
| 39356851268 | F5/Ctrl+R dead over Chromium (`Browser:Reload` disabled) → fix 4 |
| **39359724324** | **success**: harness PASS, fixture PASS, web PASS with BLOCKED {ime, urlbar_chromium (crash), the three after it}, 2× PASS; reload keys PASS |
| **39362536705** | **success** on the final code commit 02d0870: the same result reproduced (same BLOCKED set) |

The PR's "Linux check and test" runs passed: 39338055127 and later ones on this branch.

## Verified (39359724324 unless noted; screenshots inspected)
- **Rendering and E2:**
  - Chromium pixels in Zen's content area at 1× and 2×.
  - Fixture E1.
  - E2 fixture: SIGKILL, then the same Gecko document (same URL, same content pid) and typing works.
  - E2 web: the "Chromium stopped" panel, other Gecko tabs untouched, and "Open in Firefox"
    reopens the address.
  - Return to Gecko through the tab menu.
- **Window and input:**
  - Window title.
  - Typing, Backspace and Ctrl+Backspace.
  - Clicks, Tab/Shift+Tab focus, focus ring and caret.
  - Drag, double-click and triple-click selection.
- **Clipboard:** Ctrl+C/X/V/Z through Zen's clipboard, Chromium↔Gecko and Zen→Chromium.
- **Wheel:** a notch animates and a precise delta applies at once.
  - Identical to Gecko: notch 12 positions in about 184 ms vs Gecko's 12 in about 179 ms.
  - The precise path was exercised with a widget wheel event, because Xvfb has no
    smooth-scroll device.
- **Cursors:** 9 cursor shapes.
- **Popups:** `<select>` and colour chooser work; Chromium draws them, composited into the frame.
- **Context menu:** drawn by Zen with engine items.
- **Dialogs:** JS alert, confirm and prompt in Zen dialogs, answered by keyboard; beforeunload too.
- **Zen features:** find through Zen's findbar; zoom Ctrl+=/-/0 and the URL-bar indicator.
- **Navigation:** F5 and Ctrl+R; toolbar Back/Forward and Alt+Left.
- **Shortcuts:** Ctrl+W closes a focused Chromium tab; Ctrl+Tab and Ctrl+Shift+Tab.
- **Middle-click paste:** both directions.
- **Ctrl+L:** Ctrl+L, then Escape, then a click returns typing (run 39345299134).

## NOT_VERIFIED / BLOCKED / EXPERIMENTAL
- **BLOCKED_ENV: dead keys and Ctrl+Shift+U compose.** Under Xvfb and xdotool, GTK's simple
  IM doesn't compose in the Gecko baseline either. The proxy editor does take focus (`proxy-textarea`).
  - Needs a real session or an IBus setup.
- **BLOCKED: Ctrl+L / Ctrl+T in run 39359724324.** The known Linux parent WebRender SIGSEGV
  around the address bar hit them. Run 39354267095 shows it on the Gecko tab too, so
  cloud/linux-platform owns it.
  - Ctrl+T opens Zen's new-tab bar over Chromium (run 39351480361).
- **EXPERIMENTAL: `<datalist>`.** Windowless CEF shows no suggestion list.
- **EXPERIMENTAL: find.** The count reads "0 of 3", where Firefox says "1 of 3", and Chromium
  highlights all matches without "Highlight All".
- **Screenshots:** context-menu popups are captured black by xwd here, as Firefox's own menu
  is. Items and placement are asserted through the DOM.
- **NOT_VERIFIED:**
  - AT-SPI accessibility;
  - devtools;
  - downloads, permissions, file pickers and HTTP auth on Linux (implemented in the
    delegation, not exercised here);
  - certificate UI;
  - fullscreen;
  - real-session IME;
  - Wayland;
  - the arm64 Zen app;
  - the macOS runtime. macOS code paths are unchanged: the host callback is `#if
    defined(__linux__)`, PRIMARY is Linux-only, and the zoom and reload command sync is
    platform-neutral and harmless.

## Interface / contract notes
- **Integration lead:**
  - `contracts/cef-v1.md` gains the additive `text_selection` event (Linux web hosts only),
    and the adapter rejects it outside web mode. Please review it as the owner of shared contracts.
  - The workflow uses `scripts/webkit_package.py overlay-chrome`, which is webkit-zen's
    TEST-ONLY overlay and is engine-neutral.
- **cloud/perf-pixel-path:** no frame receive, convert, upload or transport function was
  touched. My CEFPresenter edits are in `#setLabel`, `#setTabLabel`, `#updateBadge`,
  `#syncChrome`, the `#event` dispatch, `#primarySelection` and the pointer/key handlers
  (`userInputAt`).
- **cloud/linux-platform:** the parent crash reproduces in GUI runs after Ctrl+L/Escape and
  after a click dismisses Zen's new-tab address bar, on Gecko tabs too. Evidence: runs
  39338050255, 39354267095, 39356851268, 39359724324.
- **cloud/linux-cef:** `probe.py` `__main__` now treats only int results as exit codes.

## Next steps
1. When cloud/linux-platform fixes the address-bar crash, re-run `linux-cef-zen` by pushing
   any change under its paths. The `urlbar_*` and `ctrl_t_*` gates should then PASS. Their
   Gecko baselines are in the same run.
2. IME: run the compose gate in an environment with IBus/Fcitx, or a real desktop, and
   compare with Gecko first.
3. Find count: map Chromium's active ordinal so the findbar says "1 of 3". Honour
   "Highlight All" (stop_finding/clear highlight).
4. Datalist: Zen-drawn suggestions would need a host event for the datalist options, like a
   `<select>` popup delegation.
5. Exercise downloads, permissions, file pickers, HTTP auth and certificate UI on Linux with
   loopback fixtures in the same workflow. Add AT-SPI checks.
6. Promote the TEST-ONLY chrome overlay to a real Linux Zen build of this branch when Gecko
   code changes (not needed so far).
