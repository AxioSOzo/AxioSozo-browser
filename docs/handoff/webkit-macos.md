Status: DONE

# webkit-macos handoff (WebKit as the third engine on macOS)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/12 (draft, into `cloud/integration`)
Branch: `claude/webkit-macos-host-ud7z1k` (this session's designated push branch; the brief's
`cloud/webkit-macos` name was not used, the workflow triggers on both).

DONE = every acceptance item of the brief is green (component runs, ADR, Zen wiring with node
tests). The in-Zen macOS E2E is NOT_VERIFIED, as the brief anticipated (no macOS Zen build
in CI); exact owner steps below. Nothing here is READY or E1/E2 evidence.

## Machine resources

- Cloud session: Linux x86_64, 4 vCPU; compiled nothing for macOS locally (Linux core/fake
  tests and node tests only).
- macOS evidence: GitHub `macos-15` runner, Apple M1 (Virtual), 3 cores, 7 GiB, macOS 15.7.9,
  Xcode clang 17, SDK 15.5, system WebKit 20621.3.11.11.3, 1024x768 1x virtual display,
  logged-in GUI session. Each host job ≈ 6–7 min; capture bench ≈ 2.5 min.
- Linux WPE regression: `ubuntu-24.04` + pinned `debian:13` container (same as linux-webkit-host).

## What changed

Native (my paths, plus additive shared-core changes):
- `native/webkit-host/mac/host_mac.mm` — rewritten from the scaffold into the real host:
  WKWebView in a borderless helper window ordered **off every display** (-30000,-30000),
  `Accessory` app (no Dock/menu bar/app switcher), `nonPersistentDataStore` per view,
  content rule list in the private profile, fixture allowlist + GET via the core, popups /
  downloads (incl. `didBecomeDownload`) / JS alert-confirm-prompt / media capture / file
  panels / HTTP auth denied with explicit codes, default server-trust (fails closed).
  Frames: `takeSnapshotWithConfiguration` on a frame-rate clock (or BEGIN_FRAME), up to 2
  in flight, in-order delivery, idle back-off, zero-conversion copy when WebKit returns sRGB
  BGRA (always, in CI). Surface mode via engine-surface-v1, pipe fallback otherwise. Bounded
  exit watchdog (5 s / parent death 77), SIGTERM + parent-death sources, exception ports
  cleared. Private SPI (exactly two, `ready.private_spi`): `_setWindowOcclusionDetectionEnabled:`
  and `_setOverrideDeviceScaleFactor:`; neither touches the sandbox/process model.
- `native/webkit-host/mac/surface_host.{hpp,mm}` — engine-surface-v1 host side (CONNECT /
  CONNECTED with audit-pid checks, global IOSurface ring of 6 per target, FRAME with
  generations + dirty rect, RELEASE / BEGIN_FRAME drain, fail-closed reasons). Adapted copy
  of `chromium-host/surface_transport.mm` (connect/drain/send), CPU write instead of CEF's
  GPU copy. Uses `chromium-host/engine_surface_v1.h` read-only.
- `native/webkit-host/stream_core.hpp` (shared, additive): `Engine::surfaceSupported()`
  (default false → WPE/fake unchanged), hello `surface_service`/`surface_token`/
  `surface_begin_frames`, `SurfaceSink`, damage-diffed surface flush with ring back-pressure
  (`surfaceSlotFreed`), `surface_failed` + exit 64, JSON `frame_ack` refused in surface mode,
  4096 px/side bound (no 32 MiB cap) in surface mode.
- `native/webkit-host/mac/tests/surface_receiver.mm` (adapted from the CEF receiver: no CEF
  popup case; adds page-2/back with exact generations over Mach, stale-target rejection,
  hidden = 0 frames, CPU of host + attributed WebKit helpers), `mac/surface_test.py` (9
  cases incl. 2 negative), `mac/tests/capture_bench.mm` (candidate measurement tool),
  `mac/build.sh`, `mac/ci/publish.sh`.
- Shared harness (additive, platform-gated): `probe.py` (macOS Seatbelt check via
  `sandbox_check`, helper attribution by launchd responsible pid, normalized build base),
  `stream_test.py` (WKWebView ready checks, Seatbelt assertion, packet-atomic AXCF reads —
  a timed-out wait could previously desync the stream), `input_test.py` (WKWebView wheel and
  DPR checks; only `drag` stays soft).

Zen side (platform branching, launch and surface wiring only):
- `EngineStreamClient.sys.mjs`: additive surface mode (hello surface keys, endpoint listener,
  canvas bind/confirm-after-load/unbind, visibility gating, Mach-only frames,
  `ENGINE_SURFACE_*` codes), mirroring `CEFHostConnection`.
- `WebKitEngineAdapter.sys.mjs`: `webkitPlatform("Darwin","aarch64…") = "macos-arm64"`;
  `/Volumes/<vol>[/<root>]` build root; `<root>/webkit/AxioWebKitMacHost`; env exactly PATH +
  TMPDIR; exact WKWebView ready validation (`validateWebKitMacReady`); availability reasons
  (Intel Mac, pref, host, fixture); launch creates `createEndpoint(false)` (internal pacing)
  and falls back to the pipe with a console warning when the engine-view component is absent.
- `WebKitPresenter.sys.mjs`: canvas bound to the endpoint (moz-opaque, object-fit none,
  logical size from `onTargetGeometry`), surface diagnostics; macOS key routing (`MAC_KEYS`
  kVK table, Command shortcuts stay with Zen, Command+C/X/V/A/Z → edit). Linux input code
  paths unchanged (selected by platform).
- `WebKitEngineControls.sys.mjs` / `EngineRegistry.sys.mjs`: comments, version label.
- Tests: `apps/browser/tests/webkit-macos.test.mjs` (9 tests), `engine-registry.test.mjs` updated.

Docs/CI: ADR 004 "macOS" section (decision, candidates table, measurements, input gaps);
`native/webkit-host/README.md`; `.github/workflows/macos-webkit-host.yml` (jobs
`capture-bench`, `host`, `wpe-regression`); evidence in `docs/evidence/macos/webkit/`
(STATUS.json, bench.json, inspected PNGs, result JSON).

## Commands / Actions runs (results)

| What | Run | Result |
| --- | --- | --- |
| Capture bench (candidates) | 39342162006 | done; offscreen ordered window + occlusion SPI + takeSnapshot chosen (ADR table) |
| macOS host: unit (JSON, AXCF transport, core harness), stream, input, security, surface ×8 | 39345979318 | **PASS** (all) |
| same + `surface-zero-copy-inuse-internal-60` (×9) | 39346585739 | **PASS** (all) |
| macOS host, same suite, final head before docs | 39346635281 | **PASS** (all 9 surface cases + unit/stream/input/security) |
| Linux WPE regression of the shared core (pinned debian:13) | 39346635281 | **PASS** (test-native, stream, input, security) |
| Linux check and test (PR) | 39345985444 | success |
| `node --test apps/browser/tests/*.test.mjs` (session) | — | 2892/2918 pass; the 5 failures are identical on `origin/cloud/integration` (detection reader / provider host, environmental) |
| `python3 native/webkit-host/probe.py test-native` (session, Linux) | — | PASS |

Earlier runs 39342825769 / 39344367832 / 39345276654 were iterations (fixed: profile guard
path, helper attribution, AXCF desync on timeout, DPR ordering).

Inspected PNGs (by me): surface frame/page-2/back (1800x1300, crisp SF text, page 2 has
fresh rAF counter), pipe input (typed `WPE` in field and status), pipe back (bfcache restore
keeps `WPEKé` status), 1x resize (800x600), bench: unordered window = frozen page,
renderInContext = blank.

## Verified (EXPERIMENTAL component evidence, never Zen E1/E2)

- Real WKWebView frames over engine-surface-v1 (IOSurface Mach ports, global surfaces,
  cross-process `IOSurfaceLookup` OK, dirty rects on ~98 % of frames, ring never overwrote an
  in-use surface with a 40 ms held use count), internal and external pacing at 60/120 Hz,
  1x/2x/resize incl. 3600x2400 over the pipe cap, page2/back with exact generations, stale
  target rejected, hidden = 0 frames, `negative-no-connected` → 64, `negative-bogus-release`
  → `surface_failed` + 64.
- Pipe stream: 15 checks (typed text in title + pixels, down/char/up once, IME commit,
  resize, Tab, navigate/back/forward generations, bfcache restore, history boundary,
  heartbeat + SIGSTOP), damage scenario 0 violations; input: buttons, click-focus-type, keys,
  wheel (400 CSS px), DPR 2→1→2, hidden; security: 13 negative cases with exact exit codes.
- WebContent and Networking run sandboxed (Seatbelt `sandbox_check`), attributed to the host;
  no helper outlived its host; every private profile removed.
- Measurements (ADR 004 "Host measurements"): surface internal 60 Hz 42–59 fps across three runs, 48–71 % CPU
  (host + WebKit), input→frame p50 12–20 ms; host IOSurface copy+send ≈ 1 ms/frame.

## NOT_VERIFIED / known gaps

- **In-Zen E2E on macOS** (Gecko → WebKit → Gecko with the engine-view endpoint) — not run.
  Owner steps below.
- Synthetic drags: WebKit reads DOM `buttons` from the global `[NSEvent pressedMouseButtons]`
  → the page does not see drags (soft in input_test). Passive DOM `wheel` listener gets no
  event (scroll itself is exact). No cursor events, no IME composition, no a11y.
- External BEGIN_FRAME pacing is slower (20–35 fps) than internal; Zen uses internal.
- CPU at 2× 60 fps ≈ 0.5–0.7 core; the snapshot path re-paints in WebContent each frame.
  Future zero-copy: host WebKit's remote layer tree (`CALayerHost`/`CAContext` SPI) — not attempted.
- `.github/actions/publish-ci-results` uses GNU `cp --parents` and fails on macOS; my
  workflow uses `native/webkit-host/mac/ci/publish.sh` (tar) instead. Suggest the
  integration lead switch the shared action to `tar --null -T -`.

## Owner steps for the in-Zen macOS E2E (Apple silicon Mac)

1. `./dev setup` (builds Zen with the engine-view component).
2. Build the host into the build root:
   `/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- native/webkit-host/mac/build.sh /Volumes/AxioSozoBuild/webkit`
   (or `AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild native/webkit-host/mac/build.sh`).
   Optional component check: `python3 native/webkit-host/mac/surface_test.py /Volumes/AxioSozoBuild/webkit/AxioWebKitMacHost /tmp/wk-surface`.
3. `export AXIOSOZO_WEBKIT_BINARY=/Volumes/AxioSozoBuild/webkit/AxioWebKitMacHost` and start
   a fixture session: `./dev engine-probe` (it first re-runs the CEF E0 check, then sets
   `AXIOSOZO_ENGINE_FIXTURE_ORIGIN` and the session runtime; WebKit is fixture-only). In that profile set
   `axiosozo.engines.webkit.enabled = true` (about:config), reopen the fixture tab.
4. Tab context menu → Open in → WebKit. Expect the toolbar indicator "WebKit 20621.… · test
   page only", `about:axiosozo` diagnostics `renderPath: wkwebview-snapshot-iosurface`,
   `pipeFallback: false`. Type in the field, Back/Forward, resize the window, switch tabs
   (hidden), then back to Firefox. Screenshot with `screencapture` (surface frames are not
   readable from chrome JS: `captureFixtureFrame` throws `WEBKIT_SURFACE_CAPTURE_UNAVAILABLE`).

## Interface / contract notes for other workstreams

- engine-stream-v1 WebKit profile on macOS (not yet written into `contracts/engine-stream-v1.md`,
  which I did not edit): `ready` fields `engine, webkit_port:"wkwebview", webkit, runtime_webkit
  (system WebKit bundle version, shape-checked, not pinned), platform:"macos-<major>.<minor>-arm64",
  sandbox_configured:true, sandbox:"macos-webkit-xpc", process_model:"multi-process",
  capture:"wkwebview-snapshot", private_spi:[…2], render_path:"wkwebview-snapshot-iosurface" |
  "wkwebview-snapshot-bgra"`; capabilities `surface`/`external_begin_frame` as negotiated,
  `cursor:false`, `wheel_phases:false`. The WebKit host now accepts the engine-surface-v1 hello
  keys on macOS only; `frame_damage` with surface keys is refused.
- engine-surface-v1: the WebKit host follows it unchanged (same header); `native_target_id`
  is the decimal view id.
- `EngineStreamClient` gained an optional `surface` constructor option and `element`/
  `onGeometry` target options; existing callers are unaffected (cloud/webkit-feel owns the
  module's UI/input code: my edits are confined to surface wiring; mac key routing is in new
  exported functions `macKeyboardRoute`/`macStreamKey`/`MAC_KEYS`).
- Integration lead: `scripts/dev.py browser_environment()` does not export
  `AXIOSOZO_WEBKIT_BINARY` on macOS (I did not edit root dev); add
  `<build root>/webkit/AxioWebKitMacHost` when it exists. `docs/CAPABILITY_MATRIX.md` WebKit/macOS
  row can move from "unavailable" to EXPERIMENTAL component PASS.

## Next steps

1. Owner runs the in-Zen macOS E2E above and records it (E1/E2 labels only from that).
2. Integration: export `AXIOSOZO_WEBKIT_BINARY` on macOS in `./dev`; fix publish-ci-results for macOS.
3. Performance: try `CALayerHost` remote-layer hosting (true zero-copy, damage from WebKit)
   behind the same surface protocol, measured with `capture_bench.mm`; or reduce snapshot
   cost (snapshot only on WebKit rendering updates).
4. Input feel (cloud/webkit-feel): drag `buttons` gap, passive wheel delivery, cursor
   (NSCursor observation), IME marked text via `NSTextInputClient setMarkedText`.
