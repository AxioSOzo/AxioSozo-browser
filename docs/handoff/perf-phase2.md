Status: PARTIAL

# perf-phase2 handoff (cloud session, 20 Oct 2026) — in progress, updated as runs land

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/14 (draft, `cloud/perf-phase2` → `cloud/integration`).
Branch `cloud/perf-phase2`; mirror `claude/perf-phase2-l5jipx` (the session's designated branch, same commits).

## Done (pushed)
1. memfd pipe fallback (pre-hello `/proc/<pid>/fd` probe; in-band `frame_ack {frame_transport:"pipe"}`;
   session latch) in both hosts + both Zen readers; contracts engine-stream-v1 §6.3 "Fallback"; tests.
2. Soak/multi-tab harness `tools/pixel-path/soak.py` (+ `ci/soak_container.sh`, linux-perf `soak` job):
   run 39349238042 PASS (memfd 30 cycles/10 min, pipe 13 cycles/4 min), numbers in docs/perf/pixel-path.md.
3. memfd frames default ON for Linux (`MEMFD_FRAMES_DEFAULT = true`).
4. zen_bench XTest-paced wheel (scroll fps claimable), parent-process CPU per window.
5. BGRX VideoFrame upload (no JS swizzle), probed once, imagedata fallback.
6. Frame worker (ChromeWorker + OffscreenCanvas + sync IOUtils reads), pref `axiosozo.engines.linux.frame_worker`.
7. Native Linux receiver `apps/browser/native/engine-view/linux` (pref `axiosozo.engines.linux.native_receiver`),
   build workflow `.github/workflows/linux-perf-build.yml` (first build: run 39350827997, cold).

## Runs so far
- linux-perf 39349238042: soak PASS; A/B base vs memfd (XTest wheel) still running at the time of writing.
- linux-webkit-host 39349713944 (32c4110): PASS incl. real-WPE `memfd_fallback`.
- linux-webkit-zen 39349714010 (32c4110): PASS.
- linux-cef-host 39351072238 (ff669a4): every gate PASS except `damage` (test bug in the new memfd
  fallback scenario: `close` sent without a target; the fallback itself passed: frame 9 dropped, next
  frame whole 1800×1300 through the pipe, then 80×80 payloads). Fixed in the next commit.

## Next
- Read the A/B (base / cand / imagedata / worker) and the native build; pin `zen_run_id` in
  tools/pixel-path/ci/plan.json to the linux-perf-build run and A/B `native`.
