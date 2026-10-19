Status: PARTIAL

# perf-pixel-path handoff (in progress — updated as the session goes)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/10 (draft, `cloud/perf-pixel-path` → `cloud/integration`).
Branch `cloud/perf-pixel-path`; mirror `claude/perf-pixel-path-o0cxbu` (the session's designated branch, same commits).

## Machine resources
- Cloud session: Ubuntu 24.04, 4 vCPU (Intel Xeon @ 2.80 GHz), ~15 GiB; no Zen app, no Firefox;
  `gh` token invalid (GitHub MCP tools used for run status); ci-results branch for evidence.
- Runners: GitHub `ubuntu-24.04`, 4 vCPU, no GPU; WebKit jobs in pinned debian:13.

## What changed (see docs/perf/pixel-path.md)
1. `apps/browser/chrome/EngineFrameSurface.sys.mjs` (new): shared pipe pixel path for both presenters —
   byte-identical u32 BGRA→RGBA swizzle, persistent ImageData, damage union since the last paint,
   one conversion+upload per refresh tick (rAF) with putImageData's dirty-rect form, superseded frames
   never converted, ack no longer waits for the paint. `DamagePayloadAssembler`.
2. `CEFPresenter` / `WebKitPresenter`: only `#draw`, `bgraToRGBA`/`bgraRegionToRGBA` (now thin wrappers),
   record counters and diagnostics (`supersededFrames`). No input/UI code touched.
3. hello `damage_payload` (additive, needs `frame_damage`): contracts engine-stream-v1 §6.2, cef-v1
   "Frame damage". Hosts: `native/chromium-host/transport.hpp` (rows compacted on the writer thread after
   merge), `core/host_core.cc` (hello/capability); `native/webkit-host/stream_core.hpp` (flush cuts rows).
   Zen: `CEFEngineAdapter` / `EngineStreamClient` readers + ready validation; `launchWebKit` option.
4. Both hosts: stdout pipe → 1 MiB (`F_SETPIPE_SZ`, Linux, best effort).
5. Bench/CI: `.github/workflows/linux-perf.yml`; `tools/pixel-path/` (same-job A/B scripts, `ab_table.py`,
   `shm_proto.cc`); `zen_bench.py --device-scale` (TEST-ONLY pref) + presenter fields; `bench.py
   --damage-payload`; `summarize.py` key; linux-engine-bench.yml / webkit_container.sh payload passes.
6. Tests: `apps/browser/tests/engine-frame-surface.test.mjs` (imported by cef-adapter.test.mjs so `./dev test`
   runs it), CEF damage_payload adapter test, `native/chromium-host/tests/transport_damage_payload_test.cc`
   (probe.py native tests + CMake), WebKit core `damage_payload_scenario` (fake host; fake host's typed input
   now only changes the top quarter so damage is partial).

## Results so far
- Presenter same-process A/B, run 39340129366 (Xeon 8573C), 1800×1300, identical output:
  Firefox 157 full draw 8.62 → 6.86 ms (bgraToRGBA 7.62 → 6.12), damage-band draw 0.72 ms;
  Chrome 155 full draw 15.07 → 7.62 ms; V8 bgraToRGBA 11.57 → 4.77 ms.
- Native transport prototype (session machine, docs/perf/evidence/shm_proto-session-20261019.jsonl), 2× frame:
  64 KiB pipe 15.5 ms receive / 143 wakeups; 1 MiB pipe 6.8 ms / 9; 1 MiB + 24 % damage payload 1.3 ms;
  memfd ring 1.36 ms whole, 0.24 ms at 24 % damage.
- Linux check and test on PR: run 39340175745 green.
- In-Zen A/B: run 39340885934 (queued; run 39340129366's A/B failed on harness bugs, fixed in d8c923c).

## Next steps
- Read run 39340885934 (`git show origin/ci-results:cloud_perf-pixel-path/39340885934-1-ab-chromium/ab/ab.md`, `…-ab-webkit/ab/ab.md`).
- Shared-memory transport: design in docs/perf/pixel-path.md; Gecko receiver not built.
