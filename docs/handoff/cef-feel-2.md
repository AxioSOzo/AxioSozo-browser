Status: DONE

# Handoff: cef-feel-2 (Chromium tabs inside Zen on Linux, round 2)

PR (draft, into `cloud/integration`): https://github.com/AxioSOzo/AxioSozo-browser/pull/18
(supersedes #17, which was the first session's branch `claude/cef-feel-2-xrbczc`).
Branch: `claude/cef-feel-2-xrbczc-rgjgez`, merged with `origin/cloud/integration` at 8c2aa118, which had already merged this branch.

**Read this first.** All gates below pass with one TEST-ONLY profile pref,
`axiosozo.engines.linux.memfd_frames=false`. With the product default (memfd frames, perf round 2),
every Chromium screenshot on prebuilt app 39362552105 is 100% black. This happens with the JS
presenter too: `nativeReceiver` null, `frameTransport: memfd`, `frameUpload: imagedata`. The frame
path belongs to cloud/perf-phase2, not this workstream. Details are under "Blockers".

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU, ~15 GiB RAM. It edited files, ran the node/python unit
  tests and `scripts/zen.py check`, and nothing heavy.
- Actions: `ubuntu-24.04` runners (4 CPU), Xvfb 1280×800 and 2560×1600, WebRender software.
  The pinned CEF host is built from the branch per run. Prebuilt Zen comes from run 39362552105
  with the TEST-ONLY chrome overlay. A full linux-cef-zen run takes ~75 min.

## What changed (this workstream, both sessions)
- Linux CEF host (`native/chromium-host/core`, `linux/`; Linux-only files, macOS untouched):
  - Default font families are the fontconfig generics Gecko uses.
  - Overlay scrollbars (`OverlayScrollbar,FluentOverlayScrollbar`).
  - **Permission prompts reach Zen.** CEF passes the requesting origin as `http://h:p/`, which
    `webOrigin()` rejected, so the host denied every request before Zen could ask. Only a bare
    trailing `/` is stripped; anything else still fails closed.
- `ChromiumBrowserUI.sys.mjs`:
  - **Find:** one request at a time. A newer search replaces queued ones, results below the
    request's identifier floor are ignored, and there is a 2.5 s timeout. After a new session
    without an ordinal (Linux CEF reports active 0), the finder takes one find-next step, so the
    findbar reads "1 of 3", "2 of 3", "3 of 3" like Firefox. Highlight All parity: the finder
    stops the session but keeps the selection.
  - `<datalist>`: Zen draws the list (previous session).
  - **Downloads:** updates that arrive before Firefox's Download is registered are kept and
    applied. A finish before `execute()` completes at once. Before this, small downloads stuck
    at 0 bytes.
  - Linux prompts say "your computer"; macOS keeps "your Mac".
- `ChromiumAccessibility.sys.mjs`:
  - Linux AT-SPI DOM mirror (previous session).
  - **The mirror keeps a hidden tab's tree** (`keepWhileHidden`, Linux only). Chromium does not
    resend the tree after accessibility goes off and on, so a tab switch left AT-SPI with only
    the page root.
- `CEFPresenter.sys.mjs`:
  - Developer-tools shortcuts over a Chromium tab show a notice instead of opening Firefox's
    toolbox on the hidden document.
  - The fixture probe chip wraps under the address bar. The rule moved out of
    browser-experience.css because of its AxioSozo-id scoping test.
- `scripts/cef_zen_e2e.py`:
  - New gates: fonts, scrollbars, badge/chip geometry, datalist, find parity with Gecko,
    download, permission, file chooser, certificate error, devtools and AT-SPI.
  - `--pref axiosozo.engines.linux.*=V` adds a TEST-ONLY pref, listed in `test_only_switches`.
  - The view's black fraction is gated in E1.
- `scripts/atspi_probe.py`: the press searches every matching root and clears the client cache
  between retries.
- `.github/workflows/linux-cef-zen.yml`:
  - Runs on this branch.
  - **Step 0 is a frame-path probe.** It tries the product default, then `frame_worker=false`,
    `memfd_frames=false`, and both off. Runs 2–5 use the first variant with pixels;
    `framepath.json` and `verdict.frame_path_probe` record the choice.
- `docs/CAPABILITY_MATRIX.md`: Chromium Linux rows updated, with curated evidence under
  `docs/evidence/linux/cef-zen/39399390970/`.

## Runs (linux-cef-zen unless noted; results in `ci-results:claude_cef-feel-2-xrbczc-rgjgez/`)
| run | commit | result |
| --- | --- | --- |
| 39371098391 (first session) | 729112dd | Ctrl+L, Ctrl+T, fonts, scrollbars, badge PASS. Pixels were already black but not gated yet. |
| 39374652910 | 3437ae48 | E1 view 100% black with the native receiver pref off too, so the native receiver was not the cause. |
| 39382614880 | 781893fb | Probe: default and worker-off black; memfd-off has pixels. Permission (after the origin fix), certificate error, datalist, download and file chooser PASS. Find, devtools and a11y FAIL. |
| 39387935674 | 22b6aed9 | devtools PASS. The find log shows the missing ordinal; the download gets stuck (race). |
| 39393555837 | 72286d26 | Find PASS (1→2→3 of 3) and AT-SPI PASS (press 0→1); download stuck again. |
| **39399390970** | 8893cf18 | **Verdict PASS**: harness, fixture, web, web-2x and a11y. Only `ime_dead_keys_compose` is BLOCKED_ENV, and the Gecko baseline doesn't compose under Xvfb either. |
| **39404959733** | 19168a04 | **Verdict PASS** again (same BLOCKED_ENV only). The devtools shot now shows Zen's notice (`web/38-devtools-chromium.png`, inspected). |

Linux check-and-test (PR): green on 22b6aed9 (39387943035). It had failed on dc253a2d
(39379426485) because of the CSS scoping test, which is fixed.

macOS CI (PR): 39382644091 on 936a411b reports no REGRESSION rows. It shows 8 PRE_EXISTING
failures and two NEW_GATE_NOT_PASSING WebKit gates that came from integration. Final: **39405085368 on 2000081f (head with all code): 0 REGRESSION** (2 NEW_GATE_NOT_PASSING WebKit gates from integration, 10 PRE_EXISTING). Run 39399396226 on 8893cf18 showed one REGRESSION, `cef:test_probe.py`: a `killpg` EPERM in a process-group cleanup test. Neither file differs from integration, the test passed on the other macOS runs of this branch, and it did not recur on the final head, so this was a runner flake.

## Screenshots inspected (run 39399390970 unless noted)
- Fonts: identical in both engines (crop compared); sans and system-ui render in DejaVu Sans.
- Overlay scrollbar: thin, over the page.
- "Not secure" badge: inside the address bar.
- Chip: under the address bar (`harness/fixture-chromium.png`, 39374652910).
- Ctrl+L: Zen's floating address bar over the Chromium page. Ctrl+T: the new-tab address bar.
- Datalist: Zen-drawn "apple" and "apricot" under the field.
- Find: "2 of 3" with only the active match marked; Highlight All marks all three ("3 of 3").
- Certificate error: Zen's "Be careful" panel; nothing loaded.
- Download: Zen's download button shows a finished download.
- File chooser: the file name is on the page.
- Permission: the doorhanger region captures black under Xvfb (Firefox's own popups do too); the
  prompt itself is asserted from PopupNotifications.

## Verified vs NOT_VERIFIED
- PASS (run 39399390970, TEST-ONLY `memfd_frames=false`):
  - E1/E2 fixture and web, 1× and 2×; typing, click, focus, selection, clipboard, wheel, cursors.
  - Select and colour popups, context menu, JS dialogs, beforeunload, zoom, history, shortcuts,
    middle click, host kill.
  - Ctrl+L and Ctrl+T over Chromium and Gecko; fonts; overlay scrollbars; badge and chip.
  - Datalist; find parity and Highlight All.
  - Downloads, permission (deny by default), file chooser, certificate error (fail closed).
  - AT-SPI tree and press; devtools shortcut explained.
- BLOCKED_ENV: dead keys and Ctrl+Shift+U compose. Gecko fails them under Xvfb + xdotool too.
- NOT_VERIFIED:
  - AT-SPI focus tracking of Chromium's focused node: focus stays on Zen's canvas or proxy.
  - Embedded Chromium DevTools: not provided.
  - Portal file chooser: no portal under Xvfb.
  - A visible doorhanger image.
  - Anything with the product-default memfd frame path.

## Blockers / for other workstreams
- **cloud/perf-phase2 (frame path):**
  - Chromium memfd frames draw black on app 39362552105, on the main-thread JS imagedata path.
  - The worker and native receiver were not active (`frameWorker` null, `nativeReceiver` null),
    so no component or worker was in use.
  - Pipe frames are fine.
  - Data: `framepath.json` per run (black fraction 1.0 vs 0.001) and
    `framepath-default/02-chromium.png`.
  - gui_test's early fixture shot shows pixels, so the first frame(s) may come before memfd
    takes over.
  - Once that is fixed, step 0 picks `default` automatically and the matrix runs drop the
    TEST-ONLY pref.
- macOS: the shared JS changes (finder, download race, prompt wording gate) keep macOS behaviour.
  The finder only steps when Chromium reports no ordinal, and the mirror and keep-while-hidden
  changes are Linux-only services.

## Interface/contract notes
- No protocol change.
- The host now sends `permission` prompts with an origin without the root slash. This was always
  the documented form; the Linux host simply never sent any.
- `ChromiumFinder.events` holds a bounded diagnostic log (sent/stop/results, counts only; no
  text).

## Next steps
1. perf-phase2: fix the memfd black frames for Chromium, then confirm that the step 0 probe
   chooses `default` in linux-cef-zen.
2. AT-SPI focus: expose Chromium's focused node as AT-SPI focus. Options are
   `aria-activedescendant` on a focusable mirror root, or moving DOM focus into the mirror
   without stealing Zen's key routing.
3. Doorhanger screenshots: capture via `drawSnapshot` of the panel, since xwd shows popups
   black.
4. When a newer prebuilt app exists, bump `ZEN_RUN` in linux-cef-zen.yml.
