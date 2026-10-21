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

## macOS plan (NOT_VERIFIED as a product path)

Target: a **WKWebView-based helper host** speaking the same pipe (engine-stream-v1,
`webkit_port:"wkwebview"`) and delivering frames over the existing engine-neutral
**engine-surface-v1** Mach/IOSurface channel (`surface_service`, CONNECT/FRAME/RELEASE,
ring of `IOSurface`s, dirty rects, begin-frame ticks), so Zen's native presenter shows
WebKit exactly as it shows CEF today.

- Process and sandbox: system WebKit already runs WebContent/Networking/GPU as
  sandboxed XPC services; the helper is the UI process. Per-instance
  `WKWebsiteDataStore` (non-persistent for fixtures; `dataStoreForIdentifier:` for web
  mode) keeps storage separate from Safari, Gecko and CEF.
- Capture, in order of preference: (a) WebKit's remote layer tree hosted through
  `CAContext`/`CALayerHost` and rendered into IOSurfaces (private API, as 003-native
  option (d) already records; Chrome and WebKit use the same SPI); (b) a `CARenderer`
  rendering the WKWebView layer tree into an IOSurface-backed Metal texture each vsync;
  (c) CPU fallback `takeSnapshotWithConfiguration:` into BGRA (no damage, ~tens of ms).
- Input: AppKit `NSEvent`s sent to the WKWebView (keyDown/up, mouse, scrollWheel via
  `CGEventCreateScrollWheelEvent` pixel units) and `NSTextInputClient` for text commit
  and later marked-text IME; device scale via the window's backing scale or
  `_overrideDeviceScaleFactor` (SPI).
- Policies: `WKNavigationDelegate` (main-frame allowlist, GET), `WKUIDelegate` (deny
  pop-ups, dialogs, media capture, open panels), `WKContentRuleListStore` with a store
  inside the private profile, default server-trust handling (fails closed).

**Scaffold in this change** (`native/webkit-host/mac/host_mac.mm`): option (c) behind the
shared core, a WKWebView in an offscreen borderless window that is never ordered on
screen. It is EXPERIMENTAL and exists to validate the core against real WebKit and to
stage the design above. It is not engine-surface-v1 evidence and not a product path.

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

Measured (GitHub-hosted ubuntu-24.04, 4 vCPU, 16 GiB; clang + lld + ninja -j4; Release;
docs, introspection, MiniBrowser, API tests and WebDriver off; bubblewrap sandbox on):

| Release | Tarball sha256 matches official `.sums` | Configure | Cold build (no ccache hits) | Runs |
| --- | --- | --- | --- | --- |
| 2.54.1 | yes | 16-22 s | 79, 123 and 139 min (runner variance) | 39296934153, 39319667952, 39389167585 |
| 2.52.6 | yes | 22-28 s | 128 min; 264 min | 39319667952, 39296934153 |

Both builds installed and the host linked against them; `ready` reported
`runtime_webkit` 2.54.1 / 2.52.6, i.e. the host's API use (legacy libwpe + fdo SHM) still
compiles and initializes on current upstream. 2.54 also installs `wpe-platform-2.0`
(headless/DRM/Wayland), the path to native damage and DMA-BUF later.
**Full host suite PASS on upstream WPE 2.54.1** (run 39389167585; curated in
[upstream-2.54.1-run-39389167585](../evidence/linux/webkit/upstream-2.54.1-run-39389167585/)):
stream (frames, typed text, resize, page 2 without old-document pixels, bfcache back,
exact generations), input (buttons, cursor, drag, XKB keys, wheel 400 CSS px, dpr 2/1),
damage (0 violations), 13 security cases, no orphans, `WPEWebProcess` under bubblewrap.
First frame 1.33 s cold, navigate 0.27 s, back 0.20 s. No host source change was needed
between 2.48.3 and 2.54.1.

Findings while wiring it: Debian 13's `wpewebkit` build-deps lack libhyphen (2.52+
requires it by default); WebKit's installed helpers need an install RPATH under a custom
prefix; ccache gave 0 % hits because the `../ccache` cache path restored an empty
directory (`ccache-before.txt`: 4 KB); the workflow now uses an absolute path. A warm
(ccache) build time is NOT_VERIFIED yet.

**Recommendation.** Keep the Debian 2.48.3 pin for the loopback fixture profile (fast:
the whole Linux job is ~1.5 min). Before any web mode, move the product pin to the current
upstream stable (today 2.54.1) built from the sha256-pinned tarball in CI, with the build
cached as an artifact keyed by the lock entry (a cold build is 1.3-2 h on 4 vCPU and must
not run per test job), and track WebKitGTK/WPE security advisories (WSA) to bump it. Do not
pin 2.52.x: it is older and builds slower.

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
| Real WebKit through the shared core on macOS | EXPERIMENTAL PASS (WKWebView scaffold, earlier session) | `docs/evidence/macos/webkit-scaffold/` |
| Zen E1/E2 with WebKit | NOT_TESTED | No Zen-side integration yet |
