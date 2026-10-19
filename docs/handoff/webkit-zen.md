Status: DONE

# webkit-zen handoff (19 Oct 2026, ~23:05Z)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/7 (draft, `cloud/webkit-zen` → `cloud/integration`).
PR #4 (the earlier webkit-zen PR) was already merged into cloud/integration, so this is a new draft PR.
The branch is also mirrored to `claude/webkit-zen-e2e-kwfrgh`, the session branch. The workflow runs only on `cloud/webkit-zen`.

## Machine resources
- Session: Claude Code cloud container (Ubuntu 24.04, 4 vCPU, ~15 GiB). Used only for node unit tests, git and the REST API.
- Evidence: GitHub Actions `ubuntu-24.04` runners, inside the pinned `debian:trixie-20261005` container, as an unprivileged test user. Xvfb, WebRender software. WPE WebKit 2.48.3 host with bubblewrap. CEF 154.0.23 host with Chromium's namespace sandbox. Neither sandbox was disabled.

## What changed
1. **Three engines in one Zen window** (commit d6b5542).
   - Cause: run 39325934205 reported the three-engine leg as BLOCKED_ENV because `EngineRegistry` marked Chromium "not enabled" whenever `AXIOSOZO_ENGINE_PROBE=1`. Zen's tab menu therefore never offered Chromium, even though the fixture-mode Chromium probe was installed under the WebKit controls.
   - Fix: `WebKitEngineControls` now sets `window[CHROMIUM_FIXTURE_LINEUP]` while it sits over a Chromium probe in `browsingMode: "fixture"`, and removes it on dispose. `EngineRegistry.chromiumAvailability()` then returns `{available: true, fixtureOnly: true}`, but only if the fixture probe env is also set.
   - Unchanged: web mode, the Chromium fixture probe on its own (still toolbar-only) and macOS (no WebKit controls). Engine preferences still never apply in fixture mode (`EngineProbeControls` returns UNAVAILABLE).
   - Files: `apps/browser/chrome/EngineRegistry.sys.mjs`, `apps/browser/chrome/WebKitEngineControls.sys.mjs`, and the tests `engine-registry.test.mjs` and `webkit-engine.test.mjs` (one new three-engine controls test).
2. **E2E, three-engine submenu.** With three engines available, Zen's tab menu shows an "Open in" submenu. `scripts/gui_engines/webkit.py` `submenu_pick` opens it and clicks the entry with real xdotool pointer clicks.
   - If the submenu does not open, it falls back to opening it by script and records `picked: "submenu (opened by script)"`. The fallback was not needed in run 39337226571, where every pick was `"submenu"`.
3. **Evidence and docs.**
   - `docs/evidence/linux/webkit-zen/STATUS.json`.
   - Curated runs, all screenshots inspected: `run-39325934205-e2e/` (7 PNGs, result JSON, steps, overlay record, cef-check.log) and `run-39337226571-e2e/` (6 PNGs, result JSON).
   - `docs/CAPABILITY_MATRIX.md`: new "Inside Zen on Linux" and "Three engines on one tab" rows, plus an evidence note.

## Commands / runs and results
- Local: `node --test` on the nine workflow unit suites → 193 tests, 189 pass, 0 fail (the remaining 4 are skips). The whole `apps/browser/tests/*.test.mjs` suite had the same 5 pre-existing failures before and after my change (project-detection reader ×2, fake Node child ×3). The only difference is +1 passing test.
- **Run 39325934205** (ed6b923; app artifact from run 39319467610, b0baccec, plus the TEST-ONLY chrome overlay):
  - harness launch/chrome/fixture PASS
  - roundtrip PASS
  - host_failure PASS
  - three_engines BLOCKED_ENV (registry, fixed above)
- **Run 39337226571** (d6b5542; app artifact from linux-zen-build run 39325384904, 832ac3e3, plus the TEST-ONLY chrome overlay of d6b5542): unit, adapter and e2e jobs all succeeded.
  - harness launch/chrome/fixture: PASS.
  - roundtrip: PASS, now through the submenu. Gecko → WebKit, typing "webkit", Increment click, fixture link to ?page=2, Zen toolbar Back, wheel scroll, → Gecko.
  - host_failure: PASS. The WebKit host was SIGKILLed while presenting; the same Gecko tab and content process survived and still accepted typing.
  - three_engines: **PASS**. One fixture tab went Gecko → WebKit → Gecko → Chromium → Gecko.
    - Chromium: native-osr-bgra, 2 frames, first frame 452 ms, title from host events, Gecko browser hidden.
    - The Gecko content process stayed the same (pid 8521) throughout.
  - Results: `ci-results:cloud_webkit-zen/39337226571-1-webkit-zen-{e2e,unit,adapter}/`.

## Verified vs NOT_VERIFIED
- PASS (EXPERIMENTAL, fixture page only, Linux x86_64): WebKit inside Zen, and the three-engine round trip on one Zen tab.
- This is the first verified Chromium-inside-Zen GUI run on Linux, but only in fixture mode under the three-engine lineup.
- NOT_VERIFIED:
  - the harness `input` scenario (address-bar typing; Linux parent SIGSEGV on Return, owned by cloud/linux-platform)
  - Chromium web mode inside Zen on Linux
  - process-group cleanup (only direct children were reaped)
  - macOS (WebKit is unavailable there by design; never READY)
- `three_engines` is still optional in `scripts/webkit_zen_e2e.py`, so it does not count toward the job's exit status. It passed, but a regression would not turn the job red.

## Blockers / notes for other workstreams
- **cloud/linux-cef**: `native/chromium-host/probe.py check` exits 1 on Linux even when it passes (cef-check.log in run 39325934205 has the PASS JSON). `linux_check()` returns the sandbox dict and `main()` calls `sys.exit(commands[...]() or 0)`, so a dict exit value prints to stderr and exits 1. Fix: `linux_check()` should not return the dict, or `main` should exit 0 on a non-int result.
  - Impact: `scripts/gui_engines/chromium.py prepare()` treats a non-zero exit as EngineUnavailable. The webkit-zen three-engine leg does not call it. I did not edit that file because it belongs to another workstream.
- **Contract note**: `EngineRegistry.CHROMIUM_FIXTURE_LINEUP` (`Symbol.for("axiosozo.engines.chromium-fixture-lineup")`) is a window flag that only the three-engine controls set. Engine entries from `engineAvailability("chromium")` can now carry `fixtureOnly: true`, as WebKit's already did.

## Native-feel gaps seen in the screenshots (for the WebKit-feel / engine-feel workstreams)
- **Tab favicon**: WebKit and Chromium tabs show a generic blue square instead of the page's favicon or an engine-marked favicon. The same square also stays on Gecko tabs after returning from another engine.
- **Toolbar chips in Zen's narrow sidebar toolbar** (`browser-experience.css`):
  - `#axiosozo-engine-probe` (the Chromium fixture probe) renders as an empty dashed placeholder next to the URL bar in Gecko and WebKit states.
  - While a tab is in WebKit, the WebKit indicator ("WebKit 2.48.3 · test page only · back to Firefox"; diagnostics say it is not hidden) is not visible. `#axiosozo-webkit-indicator` is missing from the chip styling and has no `flex-shrink: 0`.
  - While switching, "Switching engine…" overlaps the page heading.
  - In Chromium state, the "Return to Gecko" chip spills from the sidebar onto the page content.
- **Scrollbars**: WebKit shows none (no overlay scrollbar). Chromium draws classic scrollbars with arrows. Gecko draws a thin GTK one.
- **Fonts**: the fixture's small-caps header renders serif in Gecko and Chromium but sans in WebKit (fontconfig fallback differs per engine). Form-control focus styles differ per engine (Chromium uses a 2px black focus ring).
- **URL bar**: the narrow sidebar URL bar shows the middle of the URL ("7.0.0.1:33337/engin…").
- **Screenshot capture**: the nested "Open in" submenu came out as a black rectangle in the Xvfb screenshot. The pick still worked through real clicks; this is either a capture-timing issue or popup painting under software WebRender.
- **Performance**: tab-menu switch to WebKit took ≈4.3 s in CI, including host start; first WebKit frame ≈620 ms; first Chromium frame ≈450 ms.

## Next steps
1. Make `three_engines` required in `scripts/webkit_zen_e2e.py` (count it in the exit status) and have it wait for `pending: false` before the final screenshot.
2. cloud/linux-cef: fix the `probe.py check` exit code (above).
3. Engine-feel workstream: the toolbar-chip CSS for `#axiosozo-webkit-indicator` and the narrow-sidebar layout, favicons for out-of-process engine tabs, and scrollbar parity.
4. Once Zen is rebuilt from a commit that contains d6b5542, drop the TEST-ONLY chrome overlay from the evidence (`CHROME_OVERLAY=0`).
