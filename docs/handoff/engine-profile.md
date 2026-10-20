Status: DONE

# engine-profile handoff (cloud session, 20 Oct 2026)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/19 (draft, `claude/engine-profile-liqv71` → `cloud/integration`;
supersedes #11). Branch `claude/engine-profile-liqv71` is this session's designated branch. It continues
`claude/engine-profile-nipd8o-9upfrm` and is merged with origin/cloud/integration cad019b (no newer commits at hand-off).

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU, no Zen app. Evidence was read from `ci-results` (`claude_engine-profile-liqv71/`).
- GitHub runners: ubuntu-24.04, 4 vCPU AMD EPYC, no GPU (software WebRender, Xvfb). WebKit and the Gecko control
  ran in pinned debian:13. App: linux-perf-build 39362552105, which includes the native frame receiver, with the unstripped libxul
  used for symbols.

## What changed (MEASUREMENT ONLY; no product file touched)
- `tools/engine-bench/profile/hooks.js`: the hooks now wrap every reachable EngineFrameSurface module instance (the earlier
  run saw no presenter events because the presenters use another module instance). Added NativeFrameSinks.apply
  call/resolve timing and `AxioSozoNativeApply` profiler markers.
- `zen_profile.py`: per-window deltas of the native receiver counters (`nsIAxioFrameSink.statsJSON` via the presenter
  diagnostics). Native apply and resolve→ack times per frame and in the key breakdown. A new `raf-nosampler` control
  window (zen_bench's 2 ms sampler off). BackgroundThreadPool, BgIOThr and ImageBridgeChld threads are now profiled.
- `gecko_profile.py`: new buckets native_receiver, image_container, json_metadata and harness_diagnostics.
  `report.py`: background-pool group, native columns and a presenter frame-path table.
- `.github/workflows/linux-engine-profile.yml`: default app 39362552105; also runs on this branch.
- `docs/perf/profile-findings.md`: the findings, with ranked costs and recommendations for each workstream.
  `docs/evidence/linux/profile/39379600003/`: the 7 report .md files.

## Runs
- **39379600003** linux-engine-profile on the current defaults (memfd + native receiver): all 7 jobs succeeded.
  It covers Gecko and Chromium at 1× and 2×, WebKit at 1× and 2×, and the Gecko debian:13 control, each in plain/trace/profile passes.
- 39363370750: the same profiles on the EngineFrameSurface path before perf-phase2 (baseline), all jobs succeeded.
- Local: `python3 -m unittest tools/engine-bench/profile/test_gecko_profile.py` OK (5 tests).

## Findings (Zen parent CPU in % of one core; 2× rAF, sampler off, /proc)
- Totals: Chromium 54.8 %, WebKit 55.3 %, Gecko control 21.9 %. Before perf-phase2 it was 118–127 % with the sampler on.
- The extra cost in engine tabs: software WebRender compositing of the engine canvas, ≈32 % (Gecko control ≈13 %;
  `scale_blit`, `blendTextureNearestFast`). The native receiver costs ≈6 % (0.21 ms apply + 0.78 ms whole-frame present copy
  per frame). The Subprocess worker reading metadata costs ≈4 %. The main thread costs ≈7 % (21–22 % during wheel scroll,
  driven by per-event input forwarding).
- The harness sampler adds 2.4–7.3 points of parent CPU.
- Key→frame: the parent's share is < 1 ms. The host takes 7.8 ms (Chromium 2×), 12.8 ms (WebKit 1×) and 22 ms (WebKit 2×).
  zen_bench key→frame: Gecko 9, Chromium 2× 12.1, WebKit 2× 25.3 ms.
- Gecko→engine switch: the parent's share is ~35–60 ms. Host start-up takes 450–550 ms (CEF init up to 240 ms plus the first
  frame; WPE first frame ≈ 490 ms).

## Verified vs NOT_VERIFIED
- PASS: all numbers in docs/perf/profile-findings.md come from runs 39379600003 and 39363370750. TEST-ONLY pieces are
  labelled (Marionette harness, chrome overlay, hooks, devPixelsPerPx=2). Sandboxes stayed on.
- NOT_VERIFIED: GPU machines and macOS. Per-frame native apply hook timing for Chromium: the CEF adapter's module instance is
  unreachable from Marionette, so the receiver counters are used instead. Attribution inside the host processes.
- The hooks' `keydown→MozAfterPaint` is not a latency measure for natively presented canvases; use zen_bench key→frame instead.

## Notes for other workstreams
- perf-pixel-path:
  1. SWGL compositing of the 1:1 engine canvas (try the external image / compositor surface path, no blend or filter,
     damage-only upload).
  2. One damage-only copy, from the ring into a recycled texture, instead of apply + whole-frame present copies.
  3. Native metadata reads, to retire the Subprocess worker hop.
- cef-zen-feel / webkit-feel: coalesce wheel events per refresh tick. Pre-spawn a warm host to hide 450–550 ms of switch time.
- webkit-feel / webkit-host: the WebKit key gap (+7 / +16 ms) sits inside WPE.
- Anyone citing parent CPU: quote `raf-nosampler`.

## Next steps
1. After perf-pixel-path acts on items 1–3, re-run linux-engine-profile with the new app: push to this branch, or call the
   workflow with `zen_build_run_id`.
2. Optional: profile inside WPEWebProcess and the CEF gpu-process (perf, or the engines' own tracing) for host-side attribution.
