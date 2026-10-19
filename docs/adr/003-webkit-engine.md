# ADR 003 (WebKit): WebKit as the third out-of-process engine

Status: **accepted for the fixture profile; Linux runtime NOT_VERIFIED (BLOCKED_ENV)**.
Date: 2026-10-19. Workstream: `cloud/webkit-host`.

Numbering: the file name was set by the program brief. It shares the number 003 with
[003-native-multi-engine](003-native-multi-engine.md), which already anticipated WebKit
("Blink now, WebKit later"; its §6 Q3 and phase 5). This ADR refines that plan for Linux
and for the macOS host; the integration lead may renumber it (e.g. 004) without changing
its content.

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

## Alternatives considered

| Option | Why not (now) |
| --- | --- |
| WPEPlatform API (`wpe-platform-2.0`, headless display, `WPEBufferSHM`/DMA-BUF with damage) | The modern path with native damage rectangles, but experimental in 2.44–2.48 and not built in Debian's 2.48.3 (no `wpe-platform-2.0.pc`). Revisit with a source build or a distribution that ships it; the core's computed damage can then be replaced by native damage. |
| WPEBackend-fdo EGL export + `glReadPixels` in the host | Needs an EGL/GL context in the host and a GPU readback per frame; SHM gives the same CPU bytes with less machinery. |
| WPEBackend-fdo DMA-BUF export | The future zero-copy path on Linux GPUs (counterpart of IOSurface); needs a Gecko-side DMA-BUF importer that does not exist yet. |
| WebKitGTK 6.0 offscreen (`webkit_web_view_get_snapshot`) | Needs a GTK display (Xvfb/Wayland), snapshot API is slow and has no damage; GTK would also own input/IM. Kept as fallback only. |
| Cog (`cog-platform-headless`) | Same fdo SHM technique wrapped in another launcher with its own CLI/D-Bus surface; we need the exact AXCF control surface instead. |
| Build WPE WebKit 2.48.3 (or newer) from the pinned tarball | Required before any web mode (security updates) but hours of build per machine; not measured here because no Linux machine was available. Pinned so it can be done reproducibly. |
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

## Verification status (2026-10-19)

| Claim | Label | Evidence |
| --- | --- | --- |
| Core: strict JSON, AXCF transport, stream/security harness | PASS (macOS arm64; engine-free and scripted engine) | `probe.py test-native` |
| `host_wpe.cpp` uses the pinned WPE 2.48.3 / libwpe 1.16.2 / fdo 1.16.0 / glib 2.84 API correctly | PASS (compile-only, `-Wall -Wextra`, zero diagnostics) | `probe.py syntax-check` against the extracted pinned headers |
| Real WebKit frames, input, navigation/back with exact generations, negative tests through the shared core | EXPERIMENTAL PASS on macOS 27 via the WKWebView scaffold | `docs/evidence/macos/webkit-scaffold/` |
| WPE host builds, renders, sandboxes and cleans up on Linux | **NOT_VERIFIED — BLOCKED_ENV** | No Linux machine was available to this workstream (the session ran on the owner's macOS laptop; the remote-agent environment also resolved to it). Run `probe.py setup --apt && probe.py test` on Debian 13. |
| Zen E1/E2 with WebKit | NOT_TESTED | No Zen-side integration yet |
