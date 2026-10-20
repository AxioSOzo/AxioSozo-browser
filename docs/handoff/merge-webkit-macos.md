Status: PARTIAL

# merge-webkit-macos handoff

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/13 (draft, `cloud/merge-webkit-macos` → `cloud/integration`)

Machine: Claude Code cloud session (Ubuntu 24.04, 4 vCPU, 15 GiB RAM, ~29 GiB free disk;
`gh` unauthenticated here, GitHub reached through the GitHub MCP tools). All builds and
evidence ran on GitHub Actions (ubuntu-24.04, debian:13 container, macos-15).

## What changed (this session)

Merged origin/cloud/integration (cad019b: perf-phase2, cef-zen-feel, macos-ci, gecko-linux-feel)
as **33f91ee**, then again (be9fc54c: engine-profile; tools/docs/workflow only, clean) on top.
The seven conflicts were resolved so macOS surface mode and the Linux pipe features stay
platform-exclusive:

- `apps/browser/chrome/WebKitEngineAdapter.sys.mjs`: the frame transport is chosen per platform.
  macOS is always `"pipe"` (surface mode, or the labelled BGRA pipe fallback) — it never probes
  `/proc` (`memfdProcReadable` would latch the process-wide memfd fallback) and never starts a
  frame worker. Linux keeps memfd default + `/proc/<pid>/fd` readability check + frame worker.
  macOS still never asks for `damage_payload`; surface mode never asks for `frame_damage`.
- `EngineStreamClient.sys.mjs`: native/worker sinks (`#native`) and the surface endpoint fields
  side by side; normal shutdown closes both. The constructor already refuses surface +
  frame_damage/damage_payload/memfd (`INVALID_ENGINE_BOOTSTRAP`); in surface mode `frameTransport`
  is `"pipe"`, so `#native`, the slot reader and `#memfdFallback` are unreachable, and
  `frame_ack` is rejected before it could carry the fallback key.
- `WebKitPresenter.sys.mjs` diagnostics: surface stats/geometry (macOS) plus
  `memfdFallback`/`frameUpload`/`nativeReceiver` (Linux); `frameTransport` is null in surface mode.
- `native/webkit-host/stream_core.hpp`: `frame_ack` is a protocol error in surface mode, checked
  before the §6.3 fallback key.
- `native/webkit-host/stream_test.py`: Linux runs memfd + memfd-fallback scenarios; elsewhere
  the memfd hello must be refused (exit 64) and no fallback scenario runs.
- Workflows `linux-webkit-host.yml` / `linux-webkit-zen.yml`: push triggers keep both
  `cloud/perf-phase2` and `cloud/merge-webkit-macos`.
- `contracts/engine-stream-v1.md` §6.4: states that the §6.3 fallback never applies in surface
  mode (no memfd active; `frame_ack` itself is a protocol error there) and that Zen's surface
  stream never starts the worker/native receiver nor asks `/proc`. Consistent with §6.3's
  "never on macOS or in surface mode".

## Runs (all on 33f91ee unless noted)

| Workflow | Run | Result |
|---|---|---|
| macos-webkit-host (macos-15) | 39380028752 | PASS — host stream/input/security, all 9 surface cases + aggregate `surface/result.json` PASS, memfd hello refused exit 64, surface+damage_payload/memfd hello negatives PASS, capture-bench, WPE regression job |
| linux-webkit-host (debian:13 WPE 2.48.3) | 39380029025 | PASS — webkit-wpe stream incl. damage, damage_payload, memfd, **memfd_fallback** PASS; input, security, sandbox probe |
| linux-webkit-zen (real Linux Zen app) | 39380028822 | PASS — launch/chrome/roundtrip (Gecko→WebKit→type/click/page2/Back/scroll→Gecko), host kill keeps Gecko tab, three engines Gecko→WebKit→Gecko→Chromium→Gecko; WebKit tab negotiated `frameTransport:"memfd"`, `frameUpload:"native"`, native receiver applied/presented 3/3, failed 0 |
| Linux check and test | 39380054910 (078d89a = 33f91ee + handoff doc) | PASS |
| macOS CI (regression lane vs base) | 39380054971 (078d89a) | cancelled by a later push; its partial compare.md: 0 REGRESSION, `cef:test_probe.py` PASS, `webkit:mac-*` NEW_GATE_NOT_PASSING |
| macOS CI | 39385874200 (a0415774) | FAIL: `webkit:mac-build` link error (undefined `axio::wksurface::*`): `scripts/macos_ci.py` compiled `host_mac.mm` alone, so mac-stream/input/security had no binary. Fixed in 8a3e21ca (lane now uses `native/webkit-host/mac/build.sh`). Also 1 REGRESSION row `cef:test_probe.py` (`test_sigterm_routes_through_owned_cleanup`: `os.killpg(pid, 0)` → EPERM in `probe.py cleanup_group`); this PR does not touch `native/chromium-host` (no diff vs cloud/integration), the same gate PASSed on 39380054971 for identical chromium-host code, and the same row flapped on cloud/webkit-feel 39376249625, so it is intermittent and belongs to the CEF owner |
| macOS CI | (on the head after 8a3e21ca) | see below |

PNGs inspected from ci-results (`cloud_merge-webkit-macos/39380028822-1-webkit-zen-e2e/roundtrip/03-typed.png`,
`23-three-chromium.png`; `39380028752-1-host/runs/webkit-wkwebview-input-*/input-typed.png`): WebKit fixture
rendered inside Zen's content area with "webkit" typed; Chromium tab rendered in the three-engine round trip;
macOS WKWebView host fixture frame rendered (typing verified in DOM as "abc").

Local (cloud session): `node --test` on engine-frame-surface, engine-surface, webkit-engine,
webkit-macos, cef-adapter tests: 131/131 pass. Full `apps/browser/tests`: 2939 pass, 5 fail
(project-reader secure helper / provider fake-runtime tests needing builds absent here; not
touched by this merge). `./dev check`/`./dev test` locally fail only on offline cargo
(no crate cache) and BLOCKED_ENV items; Actions check/test is green.

## Verified vs NOT_VERIFIED

- Verified: as in the table. macOS component level only.
- NOT_VERIFIED: WebKit inside Zen on **macOS** (no macOS Zen app build in this program; E1/E2 on
  real macOS never run — not READY). linux-perf WebKit variants were not re-run (the workflow
  only triggers on `cloud/perf-phase2` and its plan; the merge does not change the Linux pipe
  code paths it measures, and linux-webkit-zen exercised memfd + native receiver in-Zen).
  macOS drag in the WKWebView input scenario stays NOT_OBSERVED (unchanged from PR #12).

## Blockers

None for the merge. macOS in-Zen verification needs a macOS Zen build (owner's Mac or a macOS
build workflow).

## Interface/contract notes

- engine-stream-v1 §6.4: surface mode ⇒ no frame_damage, damage_payload, frame_transport, no
  JSON frame_ack (so no §6.3 fallback). Zen side enforced in `EngineStreamHost` constructor and
  `request()`; host side in `stream_core.hpp` hello validation and `frame_ack` handling.
- `launchWebKit` on macOS ignores a caller-supplied `frameTransport` (always pipe).
- Presenter diagnostics now carry both families of keys; consumers should treat
  `frameTransport === null` as surface mode.

## Next steps

1. Confirm the macOS CI run on the final head shows no REGRESSION rows in ci-results `compare.md`.
2. Orchestrator: merge PR #13 into cloud/integration (mark ready).
3. macOS in-Zen WebKit E2E once a macOS Zen app build exists.
