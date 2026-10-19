Status: PARTIAL

# perf-pixel-path handoff (in progress — updated as the session goes)

Branch: `cloud/perf-pixel-path` (mirror: `claude/perf-pixel-path-o0cxbu`). PR: not opened yet.

## State
- Implemented: EngineFrameSurface.sys.mjs (shared pipe pixel path), both presenters on it,
  hello `damage_payload` in both hosts and both adapters, 1 MiB stdout pipes, tests.
- Measurement workflow: `.github/workflows/linux-perf.yml` (first run pending).
