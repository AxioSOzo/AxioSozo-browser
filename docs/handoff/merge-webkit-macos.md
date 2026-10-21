Status: DONE

# merge-webkit-macos handoff

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/13 (draft, `cloud/merge-webkit-macos` → `cloud/integration`).
Verified head: **20653559** (contains cloud/integration up to 1d5a7bb9: perf-phase2, cef-zen-feel,
macos-ci, gecko-linux-feel, engine-profile, webkit-feel, cef-feel-2, perf-phase3). Later commits on the
branch are this handoff only.

Machine: Claude Code cloud session (Ubuntu 24.04, 4 vCPU, 15 GiB RAM, ~29 GiB free disk; `gh` not
authenticated, so GitHub was used through the GitHub MCP tools). Builds and evidence ran on GitHub Actions
(ubuntu-24.04, a pinned debian:13 container, macos-15).

## What changed (this session)

I merged origin/cloud/integration four times: 33f91ee, then be9fc54c (clean), e1646a46 (webkit-feel +
cef-feel-2) and 20653559 (perf-phase3). Each time I resolved the conflicts so that macOS surface mode
and the Linux pipe/browser-UI features stay platform-exclusive:

- `apps/browser/chrome/WebKitEngineAdapter.sys.mjs`
  - Frame transport per platform: macOS is always `"pipe"`. It never probes `/proc`, which would latch the
    process-wide memfd fallback, and never starts a frame worker. Linux keeps memfd by default, the
    `/proc/<pid>/fd` check and the worker.
  - Profile per platform: macOS uses `MAC_READY_FIELDS` and `validateWebKitMacReady`. Linux uses
    `validateWebKitReady` with the §8.2 browser-UI extensions (hello `browser_ui`, UI events and commands).
  - `launchWebKit` asks for `browser_ui` only off macOS. The mac ready validator now also refuses
    `browser_ui:true`, `damage_payload`, memfd and `frame_transport` ≠ pipe.
  - perf-phase3 warm spares: macOS never takes or refills a spare (`prewarmWebKitHost` returns false). A
    surface endpoint belongs to one tab's canvas and is created before the spawn, which matches
    EngineHostSpare's "never on macOS". `startWebKitHost` keeps the platform-aware binary/session checks and
    the endpoint.
  - The adapter keeps `renderPath`/`webkitVersion` and gains `browserUI`.
- `EngineStreamClient.sys.mjs`
  - `#native` (native receiver or worker sinks) sits next to the surface endpoint fields; normal shutdown
    and `fail()` close both.
  - The hello carries profile extensions plus the surface keys.
  - `surface_failed` is handled before profile extension events.
  - Both `streamSurfaceTargetId` and the UTF-8 request-bound helpers are kept.
- `WebKitPresenter.sys.mjs`
  - Surface canvas setup plus `record.browserUI`.
  - Integration's `#keyHandler` (webkit-feel) with macOS routing (`macKeyboardRoute` and `macStreamKey`
    when `this.mac`).
  - Diagnostics carry surface stats/geometry (macOS) and `memfdFallback`/`frameUpload`/`nativeReceiver`
    (Linux). `frameTransport` is null in surface mode.
- `WebKitEngineControls.sys.mjs`: integration's short "WebKit" label; the tooltip shows the running WebKit
  version (system WebKit on macOS).
- `native/webkit-host/stream_core.hpp`
  - Surface fields and sink sit beside browser_ui/prompt state.
  - `frame_ack` is a protocol error in surface mode, checked before the §6.3 fallback key.
- `native/webkit-host/stream_test.py`: on Linux, memfd and memfd-fallback scenarios. Elsewhere, the memfd
  hello must be refused (exit 64).
- `scripts/macos_ci.py`
  - The `webkit:mac-build` gate now builds with `native/webkit-host/mac/build.sh`, which also links
    `surface_host.mm`, IOSurface/CoreGraphics and `-lbsm`.
  - The old single-file compile failed with undefined `axio::wksurface::*` symbols in run 39385874200. It
    stays as the fallback for checkouts without build.sh.
- `contracts/engine-stream-v1.md`
  - §6.4: the §6.3 fallback never applies in surface mode (no memfd is active, and `frame_ack` itself is a
    protocol error there). Zen's surface stream never starts the worker or native receiver and never asks
    `/proc`.
  - The macOS WKWebView host is now **§8.3**, because webkit-feel took §8.2 for browser UI. Its ready
    includes `browser_ui:false`, and the references are updated.
- Workflows `linux-webkit-host.yml` and `linux-webkit-zen.yml`: the push triggers keep every other
  branch (perf-phase2, webkit-feel, perf-phase3) and add `cloud/merge-webkit-macos`.

## Runs on the verified head 20653559

| Workflow | Run | Result |
|---|---|---|
| macos-webkit-host (macos-15) | 39420664321 | PASS: WKWebView stream/input/security, fake-core stream/security, `surface/result.json` aggregate PASS (all surface cases + negatives), capture-bench, WPE regression |
| linux-webkit-host (debian:13, WPE 2.48.3) | 39420664241 | PASS |
| linux-webkit-zen (real Linux Zen app) | 39420664234 | PASS: harness, roundtrip (incl. host kill and the three engines Gecko→WebKit→Gecko→Chromium→Gecko) and webkit-feel's feel suite (23 scenarios) all PASS |
| Linux check and test | 39420670922 | PASS |
| macOS CI (head vs base dev) | 39420670977 | success, compare.md: **0 REGRESSION, 0 NEW_GATE_NOT_PASSING**, FIXED_OR_NEW_PASS 23, OK 198, PRE_EXISTING 10 (same as base); `webkit:mac-build/stream/input/security` PASS |

Same set on e1646a46 (webkit-feel merge): macos-webkit-host 39406477129, linux-webkit-host 39406477209,
linux-webkit-zen 39406477226 (WebKit tab `frameTransport:"memfd"`, `frameUpload:"native"`,
`browserUI:true`), check 39406480877 and macOS CI 39406480853 (0 REGRESSION). All PASS.
Earlier on 33f91ee: 39380028752, 39380029025 (memfd_fallback PASS), 39380028822 and check 39380054910.
All PASS.

macOS CI 39385874200 (a0415774) failed. Its `webkit:mac-build` link error is fixed above. It also showed one
`cef:test_probe.py` REGRESSION row: `test_sigterm_routes_through_owned_cleanup`, where `os.killpg(pid, 0)`
raised EPERM in `native/chromium-host/probe.py cleanup_group`. This PR does not change chromium-host, the
gate passed on 39380054971, 39406480853 and 39420670977, and the same row flapped on cloud/webkit-feel
39376249625. It is intermittent and belongs to the CEF owner.

PNGs I opened from ci-results:
- `39380028822-1-webkit-zen-e2e/roundtrip/03-typed.png` and `23-three-chromium.png`
- `39406477226-1-webkit-zen-e2e/feel/03-favicon-indicator.png` and `11-confirm.png`
- `39380028752-1-host/runs/webkit-wkwebview-input-*/input-typed.png`

They show the WebKit fixture inside Zen's content area with typed text, the Chromium tab in the round trip,
the short "WebKit" indicator, a Zen-drawn confirm dialog over a WebKit tab, and the macOS WKWebView fixture
frame (typing verified in the DOM as "abc").

Local (cloud session):
- `node --test apps/browser/tests/*.test.mjs`: 2963 pass, 5 fail. The failures are project-reader
  secure-helper and provider fake-runtime tests whose helper builds are absent here; they are unrelated and
  fail the same way on integration.
- `fake_host` built with g++ plus `tests/core_test.py`: PASS, including damage_payload, memfd,
  memfd_fallback and the surface hello negatives.
- `./dev check` and `./dev test` fail locally only on offline cargo (no crate cache) and BLOCKED_ENV items.

## Verified vs NOT_VERIFIED

- Verified: everything in the tables. On macOS this is component level only (host plus the CI lane).
- NOT_VERIFIED:
  - WebKit inside Zen on **macOS**: there is no macOS Zen app build in this program, and real macOS E1/E2
    were never run, so this is not READY.
  - The macOS spare-host exclusion and macOS key routing inside the presenter are covered only by code
    review and node tests, not by a running macOS Zen.
  - linux-perf WebKit variants were not re-run. That workflow only triggers on cloud/perf-phase2 and its
    own plan. linux-webkit-zen did exercise memfd and the native receiver in-Zen.
  - macOS drag in the WKWebView input scenario is still NOT_OBSERVED, as in PR #12.

## Blockers

None for this merge. macOS in-Zen verification needs a macOS Zen app build.

## Interface/contract notes for other workstreams

- engine-stream-v1 §6.4: surface mode means no `frame_damage`, `damage_payload`, `frame_transport` or
  JSON `frame_ack`, so the §6.3 fallback cannot happen there. Zen enforces this in the `EngineStreamHost`
  constructor and `request()`; the host enforces it in `stream_core.hpp`.
- §8.2 browser UI is Linux-only for WebKit. The macOS scaffold answers `browser_ui:false`, Zen never asks
  on macOS, and §8.3 describes the macOS host.
- `launchWebKit` on macOS ignores a caller's `frameTransport` and `browserUI`, never uses warm spares and
  passes `element` only when the host is in surface mode.
- Presenter diagnostics: treat `frameTransport === null` as surface mode.
- Anyone changing `native/webkit-host/mac` sources should update `build.sh`; macos-ci uses it now.

## Next steps

1. Orchestrator: mark PR #13 ready and merge it into cloud/integration. If integration moves first, merge it
   again and re-run the five workflows above.
2. CEF owner: harden `probe.py cleanup_group` against EPERM from `killpg(pid, 0)` on macOS (the
   intermittent `cef:test_probe.py` row).
3. macOS in-Zen WebKit E2E once a macOS Zen app build exists. Check surface mode, the key routing and that no
   warm spare is used.
