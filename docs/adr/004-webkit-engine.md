# ADR 004: WebKit as the third out-of-process engine

Status: **accepted for the fixture profile; Linux runtime PASS as component evidence**
(Actions run 39297810722; never Zen E1/E2). Date: 2026-10-19. Workstream: `cloud/webkit-host`.

Numbering: renumbered from 003 to 004 because
[003-native-multi-engine](003-native-multi-engine.md) already holds 003; that ADR
anticipated WebKit ("Blink now, WebKit later"; its §6 Q3 and phase 5) and this one
refines the plan for Linux and the macOS host.

## Context

AxioSozo is a Zen (Gecko) fork. Zen/Gecko is the application. Other engines run out of
process and are presented inside Zen's own content area: Chromium through CEF OSR
(`native/chromium-host`, [cef-v1](../../contracts/cef-v1.md)), with a zero-copy IOSurface
path on macOS ([engine-surface-v1](../../contracts/engine-surface-v1.md)). The owner asked for
WebKit as a third engine, first on Linux (the cloud build/test platform), without
replacing Zen by a WebKit shell. ADR 001/002's prohibition of a "WebKit shell" stays in
force: no WebKit (or any engine) window may be the browser; an embedded, owned,
out-of-process engine whose pixels and input go through Zen is what this ADR adds.

Requirements carried over from the CEF host: same wire protocol, private inherited pipe
and token, CLOEXEC channel, exact target + generation binding, one-outstanding frame
credit, bounded queues, loopback fixture allowlist with GET only, deny pop-ups,
downloads, permissions and external schemes, isolated per-instance storage, TLS fail
closed, the engine's own sandbox enabled, clean exit without orphan helpers.

## Decision

1. **Linux: WPE WebKit**, the WebKit port built for embedding, using the stable
   `wpe-webkit-2.0` API with **libwpe + WPEBackend-fdo in shared-memory mode**
   (`wpe_fdo_initialize_shm()`, `wpe_view_backend_exportable_fdo` with
   `export_shm_buffer`). WebKit's web process renders (Mesa software rasterizer) into
   `wl_shm` ARGB8888 buffers; the host gets each committed buffer in CPU memory, copies
   it into the AXCF stream as BGRA8 and releases it at once. `frame_complete` is paced
   to the negotiated 60/120 Hz. No GPU, display server, Xvfb or compositor is needed.
2. **Pin: Debian 13 (trixie) packages**, WPE WebKit 2.48.3-1, libwpe 1.16.2-1,
   WPEBackend-fdo 1.16.0-1, bubblewrap, xdg-dbus-proxy and Mesa, with exact versions,
   `.deb` sha256 and the signed index digest in `upstreams.lock.json` (`webkit`). The
   official wpewebkit.org tarball sha256 values are pinned too, for a future source build.
   Rationale: reproducible, no multi-hour WebKit build on every cloud box, binaries built
   by the distribution with the bubblewrap sandbox enabled.
3. **One engine-neutral core** (`native/webkit-host/stream_core.hpp`): the fixture-mode
   state machine of `chromium-host/stream.inc` ported to portable C++ behind a small
   `Engine`/`EngineView` interface. The WPE host, the macOS scaffold and a test-only
   scripted engine all link the same core. The wire protocol is written down
   engine-neutrally in [engine-stream-v1](../../contracts/engine-stream-v1.md); cef-v1 is its
   Chromium profile. Every delta the Zen adapter must handle is listed there (§8.1).
4. **Safety model identical to the CEF fixture host**: decide-policy allows only the
   hello's loopback origin, `GET` and the fixture paths; a WebKit content-blocker list
   allows subresources only from that origin; pop-ups (`create`, new-window actions),
   downloads (`download-started`, unsupported MIME), permission requests, script
   dialogs, file choosers, HTTP auth, notifications and fullscreen are denied with
   explicit error codes; `WEBKIT_TLS_ERRORS_POLICY_FAIL` with no bypass; WebKit error
   pages suppressed. Each host gets a fresh 0700 profile with its own
   `WebKitNetworkSession` data/cache directories and XDG directories: nothing is shared
   with Gecko, CEF or another host.
5. **Sandbox and processes**: WebKit keeps its multi-process model (UI = host,
   `WPEWebProcess`, `WPENetworkProcess`) and its bubblewrap sandbox. The 2.x API cannot
   disable it; the host refuses to start (exit 70) when
   `WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS` is present, and the tests assert the web
   process actually runs under bwrap. Where a container forbids unprivileged user
   namespaces, the result is `BLOCKED_ENV`, never a weaker sandbox. The host is a child
   subreaper with parent-death signal and proves at exit that no helper survived.

6. **Linux findings that shaped the host** (each measured in CI, see the verification table):
   - libwpe drops dispatches made before WebKit registers its backend client, so device
     scale and size are dispatched again once the WebView owns the backend.
   - libwpe pointer and axis coordinates are device pixels (WebKit divides them by the
     scale) and the smooth-axis sign is the opposite of libinput's; the host converts
     cef-v1 CSS-pixel coordinates and deltas.
   - **Paint fence.** After a commit WebKit keeps re-rendering the previous document's
     frozen layer tree: the first buffer after page 2 committed and finished was
     byte-identical to page 1. Presenting it would label old pixels with the new
     generation. The host holds buffers after each commit until the committed document,
     asked through `webkit_web_view_call_async_javascript_function` in an isolated world
     the page cannot see, has rendered three animation frames (2 s fallback for pages
     where that cannot run). A user-script/message-handler variant never delivered in
     WPE 2.48.3 and was replaced.
   - Cache model `web-browser` (in the private profile) keeps WebKit's back/forward cache;
     `document-viewer` disabled it and made `back` re-fetch.

## Alternatives considered

| Option | Why not (now) |
| --- | --- |
| WPEPlatform API (`wpe-platform-2.0`, headless display, `WPEBufferSHM`/DMA-BUF with damage) | The modern path with native damage rectangles, but experimental in 2.44–2.48 and not built in Debian's 2.48.3 (no `wpe-platform-2.0.pc`). Revisit with a source build or a distribution that ships it; the core's computed damage can then be replaced by native damage. |
| WPEBackend-fdo EGL export + `glReadPixels` in the host | Needs an EGL/GL context in the host and a GPU readback per frame; SHM gives the same CPU bytes with less machinery. |
| WPEBackend-fdo DMA-BUF export | The future zero-copy path on Linux GPUs (counterpart of IOSurface); needs a Gecko-side DMA-BUF importer that does not exist yet. |
| WebKitGTK 6.0 offscreen (`webkit_web_view_get_snapshot`) | Needs a GTK display (Xvfb/Wayland), snapshot API is slow and has no damage; GTK would also own input/IM. Kept as fallback only. |
| Cog (`cog-platform-headless`) | Same fdo SHM technique wrapped in another launcher with its own CLI/D-Bus surface; we need the exact AXCF control surface instead. |
| Build WPE WebKit (newer) from the pinned tarball | Required before any web mode (security updates). Evaluated in CI, see "Security posture and upstream pin" below. |
| Ubuntu 24.04 packages | Ubuntu does not ship WPE WebKit in 24.04; Debian 13 (or a `debian:13` container) is the reference platform. |
| In-process WebKit inside Gecko | Breaks process isolation and Gecko's own sandbox; rejected like in-process CEF. |

## macOS (workstream `webkit-macos`; component evidence on macos-15, never Zen E1/E2)

Status: **EXPERIMENTAL, component PASS on a GitHub `macos-15` arm64 runner** (Apple M1
virtual, 3 cores, macOS 15.7.9, system WebKit 20621.3.11.11.3, 1024x768 1x display).
The in-Zen E2E on macOS is **NOT_VERIFIED** (no macOS Zen build in CI).

### Decision

1. **System WebKit through WKWebView** in a helper host (`native/webkit-host/mac/host_mac.mm`)
   behind the same engine-neutral core as WPE (`stream_core.hpp`, engine-stream-v1,
   `webkit_port:"wkwebview"`). Frames leave over **engine-surface-v1** exactly like the CEF
   host's surface mode (CONNECT/CONNECTED handshake before WebKit starts, global IOSurface
   ring of 6 per target, FRAME with generations + one dirty rect, RELEASE, optional
   BEGIN_FRAME, `surface_failed` + exit 64), via `native/webkit-host/mac/surface_host.mm`
   (connect/drain/send adapted from `chromium-host/surface_transport.mm`). Without
   `surface_service` the same host sends AXCF BGRA pipe frames (labelled fallback, tests).
   The core change is additive and opt-in per engine (`Engine::surfaceSupported()`); the
   WPE host and the scripted test engine keep refusing the surface keys.
2. **Capture: `-[WKWebView takeSnapshotWithConfiguration:]`** (public API), one sRGB BGRA
   copy into the ring IOSurface, taken on a `frame_rate` clock (default: internal pacing),
   up to two snapshots in flight with in-order delivery, idle back-off to 4 Hz after 30
   identical frames, identical frames dropped by the core's damage diff. The helper
   window is borderless, ordered **off every display** at (-30000, -30000), ignores the
   mouse, is excluded from the Windows menu, and the app is `Accessory` (no Dock icon,
   menu bar or app-switcher entry). It is never the browser and never visible.
3. **Private SPI, explicitly** (reported in `ready.private_spi`, `respondsToSelector`-guarded,
   neither touches the sandbox or the process model):
   - `-[WKWebView _setWindowOcclusionDetectionEnabled:NO]`: without it the offscreen window
     is "occluded", WebKit reports `visibilityState:"hidden"` and runs rAF at **0 Hz**
     (measured). Zen's `visibility` command is the real visibility.
   - `-[WKWebView _setOverrideDeviceScaleFactor:]`: the page's `devicePixelRatio` and the
     snapshot scale follow the requested `device_scale` (1x/2x) instead of the unknown
     offscreen backing scale; frames are then 1:1 physical pixels (1800x1300 at 2x).
4. **Process and sandbox unchanged**: WebContent and Networking run as Apple's XPC services,
   observed under Seatbelt (`sandbox_check(pid) == 1`) and attributed to the host by
   launchd's responsible pid; none outlived its host (5 s check per case). Per-instance
   `nonPersistentDataStore`, content rule list compiled into the private profile.
5. **Zen side**: WebKit is available on macOS arm64 when `AXIOSOZO_WEBKIT_BINARY` is
   `<build root>/webkit/AxioWebKitMacHost` (build root on the project volume), the pref
   `axiosozo.engines.webkit.enabled` is set and a fixture origin exists; otherwise a reason.
   With the engine-view component the WebKit canvas is bound to an
   `nsIAxioEngineEndpoint` (`createEndpoint(false)`, internal pacing) and frames never pass
   through JS, exactly like Chromium tabs on macOS; without it the pipe presenter is used.

### Capture candidates measured (capture bench, run 39342162006, 900x650 CSS px)

| Candidate | Window | Result |
| --- | --- | --- |
| `takeSnapshot` | not ordered (old scaffold) | 247 fps snapshots, but `hidden`, rAF 0 Hz: 1 distinct frame in 3 s (frozen page) |
| `takeSnapshot` | ordered offscreen, no SPI | `hidden`, rAF 0 Hz, 1 distinct frame |
| `takeSnapshot` | **ordered offscreen + occlusion SPI** | **`visible`, rAF 60 Hz, 137 fps, p50 5.8 ms / p95 14 ms, 179 distinct frames in 3 s; input→pixels p50 8.6 ms** |
| `takeSnapshot` at 2x (scale SPI) | unordered | 1800x1300, 56 fps, p50 16 ms |
| `CALayer renderInContext:` | any | blank (one colour): WebKit's content is a remote layer tree |
| `CARenderer` → IOSurface Metal texture | any | blank: same reason |
| ScreenCaptureKit `SCStream` of the window | on screen, visible (reference) | 57 fps, IOSurfaces with dirty rects, but needs the Screen Recording TCC grant for the browser and a window on screen |
| ScreenCaptureKit | offscreen + SPI / on screen alpha 0 | 16.7 fps / 1 frame: WindowServer does not composite them |

Rejected for the product: ScreenCaptureKit (user-visible Screen Recording permission and an
on-screen window), `CALayerHost`/`CAContext` remote-layer hosting (private SPI deep in
WebKit's process model; noted as the future zero-copy path, not attempted), CPU
layer rendering (blank).

### Host measurements (runs 39345979318 and 39346585739, 1800x1300 at 2x, rAF-animated fixture)

Standalone receiver (`native/webkit-host/mac/tests/surface_receiver.mm`), 5 s of animation per
case; CPU = host + WebKit WebContent/Networking (percent of one core); input = keydown to
the toggled pixels arriving at the receiver. Two runs on the same runner type, to show the
spread on a shared 3-core VM ([STATUS.json](../evidence/macos/webkit/STATUS.json)).

| Case | fps | frame interval p50 / p95 | CPU total | input→frame p50 |
| --- | --- | --- | --- | --- |
| **surface, internal 60 Hz** (Zen's choice) | 59.4 / 46.2 | 16.9 / 25.5 ms; 21.5 / 34.4 ms | 48 % / 71 % | 19.9 / 11.8 ms |
| surface, internal 120 Hz | 56.8 / 58.8 | 16.8 / 29.1 ms; 17.1 / 25.0 ms | 91 % / 115 % | 11.4 / 22.8 ms |
| surface, external BEGIN_FRAME 60 Hz | 27.2 / 19.6 | 32.6 / 75.6 ms; 46.7 / 131.6 ms | 52 % / 51 % | 45.2 / 47.1 ms |
| surface, external BEGIN_FRAME 120 Hz | 34.4 / 34.6 | 25.1 / 62.4 ms; 22.3 / 61.2 ms | 75 % / 86 % | 19.9 / 41.0 ms |
| zero-copy stand-in (use held 40 ms), internal 60 Hz | – / 54.6 | – ; 16.8 / 30.2 ms | – / 74 % | – / 22.5 ms |
| AXCF pipe fallback, 60 Hz | 59.6 / 60.4 | 15.2 / 27.8 ms; 15.4 / 27.5 ms | 79 % / 86 % | 24.9 / 29.4 ms |

A third run (39346635281) measured surface internal 60 Hz at 42.4 fps / 49 % CPU and the
zero-copy stand-in with internal pacing at 41.2 fps: the 3-core shared VM varies by ±15 %.

Per frame: host copy into the ring IOSurface + Mach send 0.85–1.08 ms (p50), FRAME paint to
receipt ~1 ms; every snapshot took the zero-conversion path (WebKit already returns sRGB
premultiplied BGRA). For comparison, the Linux in-Zen WebKit tab ran 48 fps / 33 ms
key→paint with the Zen parent at 117–151 % CPU (docs/PERFORMANCE.md), and the pipe
fallback here still pays one BGRA→RGBA conversion per frame in chrome JS, which the
surface path removes entirely.

Reading: the IOSurface hop itself costs ~1 ms (host copy+send) and Mach delivery ~1 ms;
the snapshot (WebContent paint into a shareable bitmap) is the cost centre. External
BEGIN_FRAME pacing measured worse than internal pacing, so Zen uses internal pacing for
WebKit. The receiver's zero-copy stand-in (use count held 40 ms past RELEASE) never saw an
in-use ring surface overwritten.

### Input on macOS

AppKit `NSEvent`s are sent to the WKWebView: keys with macOS virtual key codes (Zen maps
`KeyboardEvent.code` to kVK), text through `NSTextInputClient insertText:`, mouse, and
pixel scroll-wheel `CGEvent`s. Measured: buttons, click-to-focus and typing, Escape /
arrows / Tab with DOM key names, page `devicePixelRatio` 2 and 1, hidden = no frames,
wheel scrolls exactly 400 CSS px at 2x. Known gaps (recorded, not failed): WebKit takes DOM
`buttons` from the global `[NSEvent pressedMouseButtons]`, so synthetic drags are not seen
as drags by the page; the scrolled wheel event is not delivered to a passive DOM `wheel`
listener; no cursor events (WKWebView sets `NSCursor` itself); no IME composition.

## Consequences

- Zen needs a `WebKitEngineAdapter` (or a generalized `CEFEngineAdapter`) that accepts
  the WebKit `ready` identity, `target.engine:"webkit"`, absent key verdicts and the
  other deltas of engine-stream-v1 §8.1; `EngineRegistry`/`EngineTabs` gain `webkit`.
  That is a later workstream; this host is standalone and testable on its own.
- Linux presentation copies pixels twice (SHM → host buffer → pipe → Gecko). The
  performance workstream can move to DMA-BUF (Linux) and IOSurface (macOS).
- The trixie pin is fixture-only until a supported WebKit release is pinned.

## Security posture and upstream pin

Debian 13 ships WPE WebKit 2.48.3 without later security releases. That is acceptable only
for the loopback fixture profile (one synthetic page on 127.0.0.1, every other URL and
subresource denied). The current upstream stable releases, read from the official
wpewebkit.org index and `.sums` files by the `discover` job (run 39295390702), are
**2.54.1** (2026-10-06, sha256 `0de8bdfb…3fe9`) and the previous series' **2.52.6**; both are
pinned in `upstreams.lock.json` `webkit.upstream`. `linux-webkit-upstream.yml` builds them
in the same pinned Debian 13 image (clang, lld, ninja, ccache in the Actions cache) and
runs the full host suite against the result (`AXIOSOZO_WEBKIT_UPSTREAM_PREFIX`).

### Upstream build results (Actions run 39296934153, recorded by cloud/webkit-feel)

| Release | Build in pinned debian:13 (4 vCPU, clang + lld, cold ccache) | Host suites against it | Evidence |
| --- | --- | --- | --- |
| 2.54.1 (current stable) | PASS: configure 16 s, `ninja -j4` 4756 s (≈ 79 min, 8916 steps), installed to `/usr/local/wpe-upstream` | NOT_VERIFIED: the suite stage stopped in `probe.py setup --apt` (the build-dep step had installed `xdg-dbus-proxy` 0.1.6-1+deb13u3, the pin was deb13u2, and `apt-get` refused the downgrade). Fixed since in `probe.py` (`--allow-downgrades`, pin now deb13u3); re-run from cloud/webkit-feel, see below | `ci-results:cloud_webkit-host/39296934153-1-build-upstream/` (`build-time.json`, `ninja-tail.log`, `setup-snapshot.log`) |
| 2.52.6 (previous stable series) | PASS: configure 28 s, build 15850 s (≈ 4 h 24 min, 9288 steps; WebCoreTestSupport built too) | NOT_VERIFIED (same setup failure) | `ci-results:cloud_webkit-host/39296934153-1-build-upstream.previous_stable/` |

Both builds used `-DENABLE_WPE_LEGACY_API=ON -DENABLE_BUBBLEWRAP_SANDBOX=ON` (the libwpe +
WPEBackend-fdo path the host uses, sandbox on), Debian 13's own build dependencies plus the
extra `-dev` packages listed in `build-extra-deps.txt`, and the sha256-pinned tarballs of
`webkit.upstream`. ccache started empty (0 % hits), so the times are cold-build times.

**Re-run (Actions run 39352196059, cloud/webkit-feel, 2.54.1 only).** Build PASS again
(`build-time.json`: configure 22 s, build 8580 s with a partly warm ccache), setup PASS with the
deb13u3 pin, `check` PASS, the engine-free suites PASS (unit, fake-engine stream and security).
The real-WPE suites (stream, input, security) FAIL in the first seconds: `WPEWebProcess` and
`WPENetworkProcess` could not load `libWPEWebKit-2.0.so.1` (`runs/webkit-wpe-stream-*/stderr.log`).
The host binary has an RPATH to the prefix, but WebKit's helper processes have none, and
bubblewrap starts them with a clean environment. This is an install-layout issue of the test
image, not a WebKit or sandbox defect. Fix in `upstream/build.sh` (commit c17efbef): register the
prefix with `ldconfig` after the install. The sandbox binds `/etc/ld.so.cache` and `/usr`, so the
sandbox stays on and unchanged. The next `linux-webkit-upstream` run on cloud/webkit-feel
verifies it.

**Second re-run (Actions run 39370679848, commit c17efbef).** Build PASS (6006 s, warm ccache),
the loader cache lists `libWPEWebKit-2.0.so.1` from the prefix, `check` PASS. Against the
upstream 2.54.1 runtime (`ready.runtime_webkit` "2.54.1", bubblewrap sandbox on):
`stream_test.py` PASS, `input_test.py` PASS, `stream_security_test.py` PASS, native unit tests PASS.
`ui_test.py`, the browser-UI suite added by cloud/webkit-feel, FAILs at its double-click step. The
pointer-up script reports WebKit's own selection (`selection via engine`), but no `text_selection`
event reached the harness within 10 s (`runs/webkit-wpe-ui-*/`). The same step passes on 2.48.3
(runs 39376244778, 39375996623). It is not yet diagnosed. It blocks moving the pin, not the
2.48.3 fixture pin.

**Recommendation for a maintained pin.** Move the product pin to the **2.54.x stable series**,
built from the official wpewebkit.org tarball (sha256 from the release's `.sums`, as in
`webkit.upstream`), and track its point releases: WebKitGTK/WPE publish security advisories
(WSA) against the current stable series only, and Debian 13's 2.48.3 had received none of them
on 2026-10-18. Reasons not to stay on 2.52.x: it is the previous series (fixes stop when 2.56
ships) and it builds ~3× slower here. Keep the Debian 13 2.48.3 packages as the **fixture** pin
(component tests, Zen E2E) until a 2.54.x build passes the full host suite and the Zen E2E;
then switch `webkit.version` and the Zen-side identity check together. Status 2026-10-20: 2.54.1 passes
stream, input and security (run 39370679848). Before the switch, the `ui_test.py`
double-click → `text_selection` step must pass, and the Zen E2E must run on 2.54.x. A source build must be
cached (ccache in the Actions cache, ~1.5 GB for 2.54.1) or packaged as a pinned artifact;
a cold build costs ~80 min per change of pin. Web mode stays off regardless until the
gates in docs/CAPABILITY_MATRIX.md pass.

## Verification status (2026-10-19)

| Claim | Label | Evidence |
| --- | --- | --- |
| Core: strict JSON, AXCF transport, stream/security harness | PASS (Linux x86_64 and macOS arm64; engine-free and scripted engine) | `probe.py test-native`; CI run 39297810722 |
| Pinned Debian 13 packages install with matching sha256 | PASS (14 `.deb` checked against the lockfile) | run 39297810722 `setup.log` |
| WPE host builds and links on Linux | PASS (`g++ 14`, hardened flags, 8.8 s) | run 39297810722 `build.json` |
| Real frames at 2x/1x, resize, typed text visible, page 2, back (bfcache), forward with exact generations, stale-target rejection, history boundary, heartbeat | PASS | `stream_test.py`, frame PNGs inspected, [STATUS.json](../evidence/linux/webkit/STATUS.json) |
| No previous-document pixels under a new generation | PASS (paint fence) | stream test region check on page 2; host trace |
| Damage rectangles exact | PASS (computed; 0 violations; typing frame 8.6 % of the area) | damage scenario |
| Input fidelity: buttons, click focus, drag, XKB keycodes, wheel pixel delta (400 CSS px), cursor text/pointer, dpr 2/1, hidden = no frames | PASS | `input_test.py` |
| 13 negative protocol cases with exact exit codes | PASS | `stream_security_test.py` |
| Web process under bubblewrap; no orphan helpers; private profiles removed | PASS (CI-environment settings recorded; sandbox never disabled) | `sandbox-probe` job, run 39293842171; stream result |
| Real WebKit through the shared core on macOS | EXPERIMENTAL PASS (WKWebView host; stream, input, security over the pipe) | `macos-webkit-host.yml`, see "macOS" |
| WKWebView frames over engine-surface-v1 (IOSurface + Mach) | EXPERIMENTAL PASS (standalone receiver, 8 cases) | `macos-webkit-host.yml`, [evidence](../evidence/macos/webkit/) |
| Zen E1/E2 with WebKit | Linux: see docs/handoff/webkit-zen.md; macOS: NOT_VERIFIED | macOS Zen wiring has node tests only (`webkit-macos.test.mjs`) |
