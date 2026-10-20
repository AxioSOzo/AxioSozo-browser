Status: PARTIAL

# perf-phase3 handoff (cloud session, 20 Oct 2026)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/20 (draft, `claude/perf-phase3-uvmfis` → `cloud/integration`).
Branch `claude/perf-phase3-uvmfis` (the session's designated branch, all CI ran there); mirror `cloud/perf-phase3`
(same commits, pushed at the end; no workflow triggers on it). Contains origin/cloud/integration up to 15e20bf6
(webkit-feel merge; conflicts resolved, see "Merge").

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU, no Zen app/WPE/CEF locally; Firefox 156 (`FIREFOX_156_0_RELEASE`) and Zen
  (`f0f21cda`) sources read from sparse git clones (public GitHub mirrors) for WebRender/Zen CSS analysis only;
  node suite run locally; all evidence from Actions via `ci-results`.
- GitHub runners: ubuntu-24.04 4 vCPU (AMD EPYC), no GPU (software WebRender), Xvfb; WebKit jobs in the pinned
  debian:13 image; macos-15 arm64 for macOS CI.

## What changed
1. **Direct compositing of the engine canvas** (target 1). Diagnosis with the new TEST-ONLY `zen_profile.py
   --wr-promotion-log` (run 39382362542): WebRender never promoted the opaque engine image to a compositor surface —
   "overlay not allowed for prim with mask" — because Zen clips every tab panel (`.browserSidebarContainer`,
   `overflow: clip` + 5 px radius). The canvas was already exact (device-pixel size, integral origin, BGRX). Fix
   (`EngineFrameSurface.sys.mjs` `directComposite`, pref `axiosozo.engines.linux.direct_composite`, default on,
   Linux native receiver only): while the engine view fills its panel the panel clip is lifted and the four corners are
   drawn by caps (Zen's `#zen-browser-background` via `-moz-element`, the ancestors' colour, the panel's own shadow,
   an arc mask); restored on teardown or when the view stops covering the panel. Pixel check of the corners against
   Zen's clip from real screenshots (run 39385314455) led to adding the shadow (commit a9b40e8).
2. **Native receiver** (target 2, `apps/browser/native/engine-view/linux/AxioFrameReceiver.cpp`): presents copy only
   the union of the damage since the recycled SharedRGBImage last held a frame (TextureClient serial → generation,
   16-frame damage history; whole copy for new/stale textures); counters `partialCopies/wholeCopies/copiedPixels`.
   Hidden-tab re-present on show (`representNativeFrame`, both presenters' `#visibility`).
3. **Wheel/scroll** (target 3): both presenters already coalesced wheel deltas per frame (zen_bench sends one notch
   per 16 ms), so there was nothing more to merge; removed per-message garbage on the hot write path (no
   `TextEncoder` per frame ack/input line in CEFEngineAdapter and EngineStreamClient; string key in CEF wheel
   coalescing). The main thread while scrolling stays 13–18 % in phase 3 and control alike (Gecko's wheel dispatch +
   the per-frame host message): NOT reduced further.
4. **Engine switch** (target 4): `EngineHostSpare.sys.mjs` — one-use warm spare host per engine, started at idle via
   the engine's own launcher (same binary, sandbox, private per-host profile, fixture origin, hello), fixture mode only,
   never macOS, refilled ~1 s after a tab's host closes, dropped on memory-pressure/quit; pref
   `axiosozo.engines.prewarm` (default on). WPE host: a hidden `about:blank` view starts the sandboxed web process
   right after `ready`; the first target's view is created with `related-view` (env `AXIO_WEBKIT_NO_PREWARM=1`
   disables). Cross-module-instance native frames are brand-checked (`isNativeFrame`, Symbol.for) instead of
   `instanceof` (bug found in run 39384485852, fixed c22eb86).
5. **Measurement tooling**: zen_profile `--pref`, `--wr-promotion-log`, engine-canvas ancestor chain, real-screen
   visual check (xwd twice 0.3 s apart), spare-host stats, native receiver copy counters; linux-engine-profile inputs
   `extra` and `control` (same-job control run per engine job, label `<label>-control`) and `ZEN_BUILD_RUN_ID`
   default 39383407870. Workflow defaults restored to `plain,trace,profile`, no extra/control.
6. Docs: docs/perf/pixel-path.md "Phase 3" (method, tables, runs); docs/PERFORMANCE.md one update table.

## Results (same-job A/B, run 39396635363, app linux-perf-build 39383407870; control = direct_composite + prewarm off)
| tab | Zen parent CPU rAF (sampler off) | Renderer+SwComposite | scroll CPU | Gecko→engine switch |
| --- | ---: | ---: | ---: | ---: |
| Chromium 1× | 24.5 → **16.6 %** | 11.0 → 3.5 | 42.6 → 35.2 % | 425 → **122 ms** |
| Chromium 2× | 36.0 → **18.7 %** | 23.3 → 6.0 | 58.9 → 36.5 % | 316 → **166 ms** |
| WebKit 1× | 27.2 → **18.6 %** | 11.7 → 3.2 | 44.0 → 36.7 % | 500 → **227 ms** |
| WebKit 2× | 55.8 → **33.1 %** | 38.0 → 9.9 | 82.4 → 47.8 % | 525 → **237 ms** |
| Gecko 1× / 2× (control tab) | 17.4 / 17.8 % | 9.4 / 11.2 | 42.6 / 76.7 % | — |

Profiler, same job (run 39385314455, 2× rAF, ms/3 s): `blendTextureNearestFast` 153 → 0 (Chromium) / 143 → 0
(WebKit); `draw_quad_spans` 84 → 0 / 49 → 0; `scale_blit` 269 → 20 / 301 → 4. 0 promotion failures in every
phase-3 job; fps unchanged (60 Chromium, 58 WebKit rAF; scroll 60 / 55–57); key → frame unchanged within noise
(host-bound). Native present at 2×: 0.24 ms/frame Chromium, 0.37–0.42 ms WebKit (perf-phase2 0.78 ms), 98 % partial.

## Regressions (all cited runs on this branch)
- linux-webkit-zen E2E PASS: 39385246366, 39387902084, 39396878471 (merged head e9cbf89).
- linux-cef-zen (Chromium-in-Zen E2E + feel) PASS: 39387902076, 39396878388 (merged head).
- linux-webkit-host PASS: 39384485896, 39396878841 (merged head; host-side warm web process).
- linux-cef-host 39387902105: linux x86_64 + arm64 + macOS compile PASS; `zen-gui-chromium` FAIL (see Blockers).
- Soak (linux-perf, 30 cycles / 10 min, three engines): PASS 39385246466, 39387902382 (old app), 39396878697
  (phase-3 app, merged head), 39396635366 attempt 2 (phase-3 app). Attempt 1 of 39396635366 flagged "chromium host
  descriptors 335 → 368": one sample with 10 instead of 9 CEF processes in cycle 3, series flat 340 → 335; the
  re-run passed (333–340). RSS plateaus ~3.55 GB after cycle 7 (growth 3–142 MB, limit 400).
- macOS CI 39399641438 on final code head 0562fbd: success, compare has 0 REGRESSION rows; 10 PRE_EXISTING;
  `webkit:core_test` / `webkit:mac-input` / `webkit:mac-stream` NEW_GATE_NOT_PASSING also on cloud/webkit-feel
  (39387667872), cloud/merge-webkit-macos (39385874200), cloud/macos-ci (39369058080), varying per run; this branch
  changes no macOS WebKit file.
- Linux check and test PASS (39399641424); local node suite 2931 pass / 5 fail = the same 5 pre-existing
  project-reader/runner failures as the base.

## Verified vs NOT_VERIFIED
- PASS: everything above, from the cited runs. TEST-ONLY pieces: Marionette harness, chrome overlay, zen_profile
  prefs/logging, `layout.css.devPixelsPerPx=2`. Sandboxes on (CEF SUID, WebKit bubblewrap); no TLS/isolation change.
- NOT_VERIFIED: GPU machines (all numbers are software WebRender; with a GPU compositor the blend cost was smaller
  anyway); macOS behaviour change (none intended: direct compositing needs the Linux native receiver, spare hosts
  are gated off on macOS, macOS CI shows no regression); web-mode Chromium (spare hosts are fixture-only; direct
  compositing applies to any natively presented canvas, exercised by linux-cef-zen in fixture mode only);
  Zen split view / glance with an engine tab (the clip is lifted only while the view covers its whole panel);
  squircle `corner-shape` variants other than the default round arc; E1/E2 (never claimed); READY (never).

## Blockers / open
- `linux-cef-host` `zen-gui-chromium` fails ("timed out waiting for X11 window title showing the fixture"; the
  Chromium page renders, failure-fixture.png). That job runs the packaged chrome of an older linux-zen-build app
  WITHOUT this branch's chrome overlay, and it had never got past setup on earlier branches (no baseline). Not caused
  by this branch's chrome code; not proven either way — owner: linux-cef / cef-zen-feel (needs the overlay or a
  current app).
- WebKit 2× remains the costliest tab for the parent (33 %: receiver queue ~6–8 %, main ~7 %) and WPE itself
  ~180 % CPU; scroll main-thread cost unchanged (13–18 %).

## Interface / contract notes for other workstreams
- Prefs: `axiosozo.engines.linux.direct_composite` (default true), `axiosozo.engines.prewarm` (default true;
  `scripts/gui_test.py` TEST_PREFS sets it false so E2Es see one host per tab — benches set it with `--pref`).
- Native frames: test `isNativeFrame(x)` (EngineFrameSurface), never `instanceof NativeFrame`: hosts may come from
  the shared module instance (spare hosts, web mode) while a presenter lives in a window module graph.
- Presenters: natively presented records may carry `record.directComposite` (call `restore()` before removing the
  overlay; done in both presenters) and `record.nativeUnpresented`. The overlay gets four `.axiosozo-engine-corner`
  children while lifted; do not style `.browserSidebarContainer` overflow inline on engine tabs.
- `launchCEF`/`launchWebKit` may return an adapter whose host was pre-started; `adapter.warmHost` says so.
  `cefFixtureSpareStats()` / `webkitSpareStats()` (shared module instance) give launched/taken/refused/dropped.
- nsIAxioFrameSink.statsJSON adds `partialCopies`, `wholeCopies`, `copiedPixels` (no IDL change).
- One-line additions outside my paths: `EngineProbeControls.sys.mjs` and `WebKitEngineControls.sys.mjs` schedule the
  first spare; `scripts/gui_test.py` TEST pref; regression workflows list `claude/perf-phase3-uvmfis`.
- App artifact: linux-perf-build **39383407870** is the newest `axiosozo-zen-linux-x86_64` with the damage-only
  receiver (pinned in tools/pixel-path/ci/plan.json and linux-engine-profile's default).

## Merge
Second merge (cef-feel-2, 8f2b9ce): CEFPresenter `#visibility` keeps both the hidden-frame re-present and the datalist close; linux-cef-zen branch list both. Final regression round on that head IN FLIGHT: linux-cef-host 39409978989, linux-cef-zen 39409979066, linux-webkit-zen 39409979021, soak 39409979017 (this line is updated when they finish).

origin/cloud/integration (webkit-feel) merged in e9cbf89: WebKit adapter keeps `browserUI` (spare used only for
launchWebKit's default options incl. `browserUI: true`), WebKitPresenter imports both, WPE view creation keeps the UI
watch script then relates the view to the warm one, webkit workflow branch lists both. Re-verified by
linux-webkit-host 39396878841, linux-webkit-zen 39396878471, linux-cef-zen 39396878388, soak 39396878697,
macOS CI 39399641438.

## Next steps
1. Review/merge PR #20; rebuild the integration app (or use 39383407870) so every job has the damage-only receiver.
2. Fix or re-baseline `zen-gui-chromium` (overlay the checkout's chrome or use a current app).
3. WebKit 2×: the remaining parent cost is the receiver queue (two copies: ring → frame → texture; copy damage straight
   from the ring into the texture) and main-thread per-frame JS/GC; WPE software paint dominates the machine.
4. Scroll main thread: profile Gecko's wheel dispatch for the non-passive canvas listener (APZ wait) before changing it.
5. A GPU run (macOS or a GPU Linux runner) to confirm promotion with a hardware compositor.
