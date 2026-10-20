Status: PARTIAL

# perf-phase3 handoff (cloud session, 20 Oct 2026) — WORK IN PROGRESS

Branch `claude/perf-phase3-uvmfis` (session-designated; mirrored to `cloud/perf-phase3` at the end).

## So far
- Diagnosis (linux-engine-profile run 39382362542, TEST-ONLY `--wr-promotion-log`): WebRender refuses to
  promote the engine image to a compositor surface: "overlay not allowed for prim with mask" — Zen's
  `.browserSidebarContainer` clips with `overflow: clip` + 5 px `border-radius`. The canvas itself is exact
  (1674x1212 device px at an integral origin at 2x; no scaling).
- Direct compositing (EngineFrameSurface `directComposite`, pref `axiosozo.engines.linux.direct_composite`):
  lift the panel clip while the engine view fills it, draw the 4 corners as caps. Testing in run 39383407784.
- Native receiver: damage-only writes into recycled SharedRGBImages (TextureClient serial -> generation).
  Building in linux-perf-build run 39383407870.
- Hidden-tab re-present on show (`representNativeFrame`).
