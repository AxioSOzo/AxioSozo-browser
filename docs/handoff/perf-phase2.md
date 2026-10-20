Status: PARTIAL

# perf-phase2 handoff (cloud session, 20 Oct 2026) — work in progress

Branch `cloud/perf-phase2` (mirror: `claude/perf-phase2-l5jipx`, the session's designated branch, same commits).

## Done so far (pushed)
- memfd frames pipe fallback: pre-hello `/proc/<pid>/fd` probe, in-band `frame_ack {frame_transport:"pipe"}`
  fallback on an unreadable slot (both hosts + both Zen readers), session latch; contracts §6.3; tests.
- Soak + multi-tab harness `tools/pixel-path/soak.py` (+ `ci/soak_container.sh`), linux-perf.yml `plan`/`soak` jobs.
- zen_bench: XTest wheel injection with explicit cadence and recorded pacing (`--wheel xtest`, default),
  `usage.parent_cpu_percent`.

## Next
See the task list in the session prompt: soak → flip memfd default; ChromeWorker/OffscreenCanvas; native receiver.
