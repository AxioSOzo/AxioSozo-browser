Status: DONE

# perf-pixel-path handoff (cloud session, 19–20 Oct 2026)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/10 (draft, `cloud/perf-pixel-path` → `cloud/integration`).
Branch `cloud/perf-pixel-path`; mirror `claude/perf-pixel-path-o0cxbu` (the session's designated branch, same commits).
Merged: `origin/cloud/integration` (8e075d1) and `origin/cloud/engine-bench` (for tools/engine-bench; DONE workstream).

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU (Intel Xeon @ 2.80 GHz), ~15 GiB; no Zen app, no Firefox; `gh` token
  invalid here (GitHub MCP tools used for runs/PR); evidence read from the `ci-results` branch.
- GitHub runners: `ubuntu-24.04` 4 vCPU, no GPU (software rendering only); WebKit jobs in pinned debian:13.

## What changed
1. **`apps/browser/chrome/EngineFrameSurface.sys.mjs` (new, engine-neutral)** — the pipe pixel path of both presenters:
   byte-identical u32 BGRA→RGBA swizzle (unpremultiply only 0<α<255); one persistent ImageData per canvas;
   union of damage since the last paint converted and uploaded once per refresh tick (rAF) with
   `putImageData(image, 0, 0, x, y, w, h)`; frames superseded before the tick are never converted; the frame
   credit returns at accept, not after the paint. Also `DamagePayloadAssembler` and the memfd helpers.
2. **`CEFPresenter` / `WebKitPresenter`**: only `#draw`, `bgraToRGBA`/`bgraRegionToRGBA` (thin wrappers),
   record counters, diagnostics (`supersededFrames`, `frameTransport`). No input/UI code touched.
3. **hello `damage_payload`** (additive, needs `frame_damage`; contracts engine-stream-v1 §6.2, cef-v1
   "Frame damage"): AXCF payload = only the damage rectangle's rows; Zen rebuilds the whole frame per
   native target before the presenter. Hosts: `native/chromium-host/transport.hpp` (rows compacted on the
   writer thread after the merge) + `core/host_core.cc`; `native/webkit-host/stream_core.hpp`. Zen:
   `CEFEngineAdapter` / `EngineStreamClient` readers + ready validation. Negotiated on Linux whenever frame
   damage is (macOS/surface mode never).
4. **1 MiB stdout pipe** in both hosts (`F_SETPIPE_SZ`, Linux, best effort; measured 1048576 on runners).
5. **EXPERIMENTAL memfd frames** (engine-stream-v1 §6.3, pref `axiosozo.engines.linux.memfd_frames`,
   default **false**): hosts keep pixels in a sealed `MFD_CLOEXEC` memfd ring (2 slots); AXCF frames carry
   `{slot, payload_bytes}` and no payload; Zen reads the slot with one `IOUtils.read` of
   `/proc/<host pid>/fd/<fd>` before the ack (the slot reuse barrier). No Gecko rebuild. Works in Zen for
   both engines (A/B variant `memfd`, all PASS).
6. **Bench/CI**: `.github/workflows/linux-perf.yml` (reusable engine bench + same-job in-Zen A/B base/cand/memfd
   at 1×/2× for Chromium and WebKit); `tools/pixel-path/` (`ci/zen_ab.sh`, `ci/zen_ab_webkit_container.sh`,
   `ab_table.py`, `shm_proto.cc`); `zen_bench.py --device-scale` / `--pref` (TEST-ONLY, recorded) + presenter
   fields; `bench.py --damage-payload`; summarize key; linux-engine-bench.yml + webkit_container.sh payload pass;
   presenter page measures EngineFrameSurface. linux-cef-host / linux-webkit-host / linux-webkit-zen now also
   run on pushes to `cloud/perf-pixel-path` (one-line trigger additions).
7. **Tests**: `apps/browser/tests/engine-frame-surface.test.mjs` (imported by cef-adapter.test.mjs so `./dev test`
   runs it), CEF damage_payload + memfd adapter tests, WebKit memfd adapter test,
   `native/chromium-host/tests/transport_damage_payload_test.cc` + `transport_memfd_test.cc` (probe.py + CMake),
   WebKit core `damage_payload` + `memfd` scenarios (fake host's typed input now changes only the top quarter).
8. **Docs**: `docs/perf/pixel-path.md` (path, changes, measurements, design of the remaining steps, runs);
   evidence in `docs/perf/evidence/`.

## Results (all from Actions runs, results on ci-results `cloud_perf-pixel-path/`)
In-Zen same-job A/B, **run 39342063334** (base cloud/integration 5f8b1d0 vs cand 9833f88; prebuilt app
linux-zen-build 39337785340 + TEST-ONLY chrome overlay; 2 rounds × 3 reps, both rounds agree; 24/24 PASS):

| | Chromium base → cand → memfd | WebKit base → cand → memfd |
| --- | --- | --- |
| 1× rAF fps | 42.6 → 59.0 → 59.0 | 39.1 → 57.9 → 57.7 |
| 1× rAF p99 interval | 38.5 → 19.0 → 29.1 ms | 42.3 → 22.6 → 24.2 ms |
| 1× rAF CPU (whole browser) | 159 → 75 → 69 % | 201 → 123 → 115 % |
| 1× key → presented frame | 29.1 → 19.9 → 20.3 ms | 32.4 → 24.1 → 24.4 ms |
| 2× rAF fps | 10.5 → 58.0 → 59.0 | 6.0 → 48.7 → 56.6 |
| 2× rAF p99 interval | 125 → 31.1 → 22.0 ms | 220 → 47.3 → 33.0 ms |
| 2× presenter draw/frame | 6.35 → 3.54 → 3.58 ms | 8.91 → 3.73 → 4.07 ms |
| 2× key → presented frame | 90.7 → 21.1 → 18.7 ms | 98.2 → 29.5 → 29.8 ms |
| 2× static navigate → visible | 254 → 77 → 67 ms | 215 → 87 → 67 ms |

- Presenter same-process A/B (Firefox 157, 1800×1300, identical output, run 39342063334): full draw
  12.42 → 7.04 ms; damage-band (10 %) paint 0.90 ms.
- Host component benches (2×): CEF client read 15.6 → 4.4 → 0.43 ms, client CPU 81 → 26 → 4.9 %, key → frame
  17.0 → 2.0 ms (runs 39330954155 vs 39340129366); WPE rAF 46.2 → 58.0 fps on the same CPU model, client read
  17.3 → 1.2 ms (39330954155 vs 39342063334).
- Native transport prototype (session machine): 2× frame 64 KiB pipe 15.5 ms → 1 MiB 6.8 ms → +24 % damage
  payload 1.3 ms; memfd 1.36 ms whole / 0.24 ms damage.

## Regressions (PASS unless noted)
- linux-cef-host 39341140946 (3137181) and 39342063401 (9833f88): x86_64 + arm64 verdict PASS on every gate
  (check, test-native incl. damage-payload + memfd tests, E0, stream, security, input, web, damage, node,
  test-probe); macOS compile-check green. Its `zen-gui-chromium` job fails in setup because `probe.py check`
  exits 1 on Linux although it prints PASS — known cloud/linux-cef issue (also on cloud/integration).
- linux-webkit-host 39341141004 / 39342063286: real WPE 2.48.3 unit, stream, input, security, cleanup PASS;
  damage_payload + memfd scenarios rebuilt frame byte-identical to a forced whole frame.
- linux-webkit-zen 39341141669 / 39342063487: E2E PASS (launch, chrome, Gecko→WebKit→Gecko round trip with
  typing/click/page 2/Back/scroll, host failure, three engines incl. Chromium).
- Linux check and test (PR) 39342499658 green. Node: same 5 pre-existing failures as cloud/integration
  (project-reader/arrival suites, environment-dependent), none in touched suites.
- Post-handoff verification run **39346775829** (linux-perf at defc149: in-place single-array loop, diagnostics
  field) — queued at handoff time; not required for the numbers above.

## Verified vs NOT_VERIFIED
- PASS (Actions): everything in Results/Regressions above.
- EXPERIMENTAL: memfd frames (pref off by default); in-Zen numbers use the TEST-ONLY chrome overlay on a
  prebuilt app and TEST-ONLY prefs (devPixelsPerPx, memfd), all labelled in the results.
- NOT_VERIFIED: wheel-scroll fps in Zen (harness xdotool pacing artefact, docs/PERFORMANCE.md); GPU machines;
  macOS (surface path untouched, damage/payload/memfd never negotiated there); multi-tab; E1/E2 (never
  claimed); READY (never).

## Notes for other workstreams
- cloud/cef-zen-feel, cloud/webkit-zen: presenter edits are confined to `#draw`, the `bgraToRGBA` exports
  and diagnostics; record fields `canvasCurrent` (CEF) is gone (EngineFrameSurface tracks staleness).
  Painting is rAF-paced: a test that inspects `putImageData` must let a rAF tick run; uploads use the
  dirty-rect form `putImageData(image, 0, 0, x, y, w, h)`.
- Hosts and Zen must come from the same tree (strict hello keys): an older host rejects `damage_payload`.
- Integration lead: `apps/browser/tests/engine-frame-surface.test.mjs` runs via cef-adapter.test.mjs; add it to
  `scripts/dev.py` explicitly if preferred. Running `native/webkit-host/tests/core_test.py` locally writes into
  docs/evidence/linux/webkit/runs (gitignore candidate).
- cloud/engine-bench: zen_bench gained `--device-scale`, `--pref`, presenter `supersededFrames`/`surface`/
  `frameTransport`; bench.py `--damage-payload`; the presenter page measures EngineFrameSurface.

## Next steps
1. Flip `axiosozo.engines.linux.memfd_frames` on by default after a soak (it wins at 2× for both engines),
   keeping the pipe as fallback; add a pipe fallback when /proc/<pid>/fd is unreadable instead of failing.
2. Off-main-thread conversion: ChromeWorker + `IOUtils.openFileForSyncReading`/`readBytesInto` +
   `transferControlToOffscreen` (move `captureFixtureFrame` to `convertToBlob` first) — design in docs/perf/pixel-path.md.
3. Native Linux receiver (Gecko rebuild): memfd → `DataSourceSurface` (B8G8R8A8, no swizzle) →
   `SourceSurfaceImage` on an async ImageContainer via the existing `SetAxioExternalImageContainer` hook.
4. Fix the zen_bench wheel pacing (engine-bench) so scroll fps can be claimed; measure with ≥2 engine tabs.
