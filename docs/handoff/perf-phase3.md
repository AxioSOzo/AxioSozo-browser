Status: PARTIAL

# perf-phase3 handoff (cloud session, 20 Oct 2026) — WORK IN PROGRESS

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/20 (draft, `claude/perf-phase3-uvmfis` → `cloud/integration`).
Branch `claude/perf-phase3-uvmfis` (session-designated); mirrored to `cloud/perf-phase3` at the end.

## Confirmed so far (Actions runs)
- Diagnosis, run 39382362542 (TEST-ONLY `zen_profile --wr-promotion-log`): WebRender refused to promote the engine
  image to a compositor surface, "overlay not allowed for prim with mask" — Zen's `.browserSidebarContainer`
  (`overflow: clip` + 5 px radius). Canvas exact (1674x1212 device px, integral origin at 2x): no scaling.
- Direct compositing (`directComposite`, pref `axiosozo.engines.linux.direct_composite`, default on): run 39383407784,
  0 promotion failures; Chromium 2x raf-nosampler parent 17.4 % (Renderer 2.7, SwComposite 1.7).
- Same-job A/B run 39384485852 (control = direct_composite + prewarm off), WebKit (debian:13):
  2x raf-nosampler 54.1 → 25.9 %, 1x 29.9 → 19.2 %; Gecko→WebKit switch 648 → 248 ms (2x), 630 → 213 ms (1x)
  with the warm spare host + WPE warm web process; screen changes (real xwd) in every job.
- Same run, Chromium with features on: BROKEN (spare host from the shared module instance → presenter's
  `instanceof NativeFrame` false → 2D imagedata fallback, 1 frame). Fixed in c22eb86 (brand check); re-run 39385314455.
- linux-webkit-host 39384485896 PASS with the host-side warm web process.

## In flight
- linux-perf-build 39383407870 (native receiver damage-only copies; cold build).
- linux-engine-profile 39385314455 (plain + profile passes, same-job control).
- linux-webkit-zen 39385246366, linux-cef-host 39385246365, linux-cef-zen 39385246381, macOS CI 39385250698.
