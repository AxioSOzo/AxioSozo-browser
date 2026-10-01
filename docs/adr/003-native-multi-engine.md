# ADR 003: Native multi-engine architecture (Blink now, WebKit later)

Date: 2026-09-29. Status: **PROPOSED** (research ADR; needs integration-lead
acceptance). Extends [ADR 002](002-dual-engine.md); every ADR 002 safety gate and
the E1/E2 acceptance rules still apply. Nothing here is READY. This ADR is not
evidence that any engine works inside Zen.

Evidence labels used below:

- **[local]**: observed on this Mac from an actual command or probe (see Appendix A).
- **[source]**: read in pinned or upstream source code (path given).
- **[cited]**: taken from upstream documentation or issue trackers (see Sources).
- **[unverified]**: an estimate, inference or design proposal that has not been tested.

## 1. Context

Zen (Firefox 156, Gecko) is the application and stays the application. The product
goal is per-tab **native** Blink (and later WebKit) engines that behave like Gecko
tabs: GPU-composited, smooth, native input and IME, Zen-owned prompts, menus,
downloads and permissions, accessibility, devtools and crash recovery.

Current Chromium path (ADR 002, `contracts/cef-v1.md`): CEF 154.0.23 Alloy
off-screen rendering (OSR) in a separate host process. `OnPaint` delivers CPU BGRA
frames (up to 32 MiB each), which are copied through a stdout pipe into chrome JS,
converted per pixel and drawn on a `<canvas>` by `CEFPresenter.sys.mjs`. This path
is CPU-bound by design: several full-frame copies per frame, no vsync alignment, no
Retina fidelity above the scale cap. IME, accessibility, devtools, permissions,
downloads and certificate UI are unavailable. Live web mode also stalls on the macOS
Keychain "Chromium Safe Storage" item.

Previously established (not re-verified here unless noted): CEF's UI thread must be
the macOS main thread; `parent_view` forces Alloy style on macOS; windowed CEF gives
native NSAccessibility while OSR gives only a TreeOnly tree.

## 2. Decision drivers

1. **Gecko-parity presentation.** Zero CPU pixel copies, vsync-paced frames, correct
   z-order *under* Zen UI that overlaps content, Zen's rounded content corners,
   transforms and animations, and pixels available for tab previews/snapshots.
2. **Zen owns all browser UI.** Engine callbacks (context menu, JS dialogs,
   permissions, downloads, HTTP auth, certificate errors, file pickers, find,
   fullscreen, zoom) are rendered by Zen's existing Firefox UI.
3. **Native input.** IME composition with a correctly placed candidate window,
   trackpad scroll phases/momentum, pinch, drag and drop, cursors.
4. **Accessibility** that VoiceOver can use, not only a pixel surface.
5. **Security.** Keep Chromium's sandbox; a crashing engine must not kill Zen; no
   shared or silently approved Keychain items; TLS unchanged.
6. **Build and update cost on this machine.** Apple M4, 10 cores, 16 GB RAM [local];
   the project volume reports 137 GiB free but its sparsebundle lives on T9, which
   has 136 GiB physically free [local]. There is no remote build farm.
7. **Engine-agnostic contract.** WebKit (and maybe Servo) must plug into the same
   host/surface/input/UI contract later.
8. **Incremental and measurable.** Every phase must ship behind the existing
   engine-switch gate and produce E1/E2 evidence on real macOS.

## 3. Key findings

| # | Finding | Label |
|---|---|---|
| F1 | Loading the CEF 154 framework with `dlopen` alone, without `cef_initialize`, moves a zone named `PartitionAlloc` into default-zone slot 0 (zones: `[0]PartitionAlloc [1]objc [2]DefaultPurgeableMallocZone [3]DefaultMallocZone`). At that point it still forwards `malloc` to the system zone. The framework imports `malloc_zone_register/unregister` and `malloc_default_zone`. Gecko's `memory/build/zone.c` uses the same unregister/re-register loop to make mozjemalloc the default zone. | [local] |
| F2 | Creating a `WKWebView` and loading a page adds `QuartzCore`, `WebKit Using System Malloc`, `WebKit Malloc` and `LSBindingEvaluator` zones but **does not replace the default zone**: `malloc(64)` is still owned by `DefaultMallocZone` (macOS 27.0.1). libpas registers "WebKit Malloc" only for introspection (`pas_root.c`). | [local], [source] |
| F3 | In this Firefox 156 tree, `layers.gpu-process.enabled` defaults to true on macOS. WebRender runs in the GPU process, which already sends IOSurfaces to the parent as Mach send rights (`IOSurfacePort`, `NativeLayerRootRemoteMacParent`). Video frames enter WebRender as `MacIOSurfaceImage`, and `SurfaceDescriptorMacIOSurface` carries a (global) `surfaceId` plus an optional `GpuFence` (`GpuFenceMTLSharedEvent` exists). | [source] |
| F4 | CEF 154's `OnAcceleratedPaint` hands over a **pooled** IOSurface that "cannot be cached ... should be copied to a texture owned by the client" (`cef_render_handler.h`). Shared-texture OSR has existed since CEF commit 260dd0c (2024-04). On branch 8037 (CEF 154), cefclient's macOS OSR uses Metal to blit that IOSurface, supports external begin frames (fixes #4033), and has an NSAccessibility bridge (`osr_accessibility_node_mac.mm`, #3595), all dated 2026-09-11. The pinned `cef_types_mac.h` comment "only supported on Windows" is stale. | [source] |
| F5 | CEF's IME (`ImeSetComposition/CommitText/...`) and drag-target APIs are documented as windowless-only. `CefMouseEvent` has **no scroll phase, momentum or pinch fields**. | [source] |
| F6 | Windowless always uses Alloy style. Chrome-style features (extensions, autofill/datalist, Chrome permission/device dialogs) are not available to OSR browsers, and DevTools opens as its own browser. Chromium `content/` excludes extensions, spellcheck, autofill, sync, Safe Browsing and translate. | [source], [cited] |
| F7 | Official CEF binaries are built without proprietary codecs (H.264/AAC). CEF #3559 (OS-decoder-only codecs) is still open. | [cited] |
| F8 | CEF commit fa874ac (2026-09-09) adds `cef_settings_t.keychain_service_name/keychain_account_name` behind `CEF_API_ADDED(CEF_NEXT)` on master. It is **absent** from branch 8037, including the newest release 154.0.32 (2026-09-29). CEF has not branched for Chromium 155 yet (Chromium 155 stable is scheduled for 2026-10-06). | [source], [cited] |
| F9 | Chromium's GPU→browser handoff on macOS is `gfx::CALayerParams`: either a `ca_context_id` (private `CAContext`/`CALayerHost`, `ui/base/cocoa/remote_layer_api.h`) or an `io_surface_mach_port`. Chrome app shims use private `NSAccessibilityRemoteUIElement` tokens (`ui/base/cocoa/remote_accessibility_api.h`) to link accessibility trees across processes. WebKit uses both SPIs too (`WebViewImpl.mm`, `WebCoreCALayerExtras.mm`). | [source] |
| F10 | CEF's `tools/gn_args.py` (branch 8037) disables PartitionAlloc-as-malloc **only on Linux** "for improved client app compatibility". CEF notes that fully disabling the allocator shim causes build errors (#3095). A source build needs at least 16 GB RAM (32 GB+ recommended), 150 GB free for Debug, and about 4 h on a 16-core machine. | [source], [cited] |

## 4. Q1: Helium, and what transfers to a Blink engine inside Zen

**How Helium is built** [cited, source]:

- `imputnet/helium` holds the shared patch set. It is "based on ungoogled-chromium,
  but heavily modified", with vendored patches from ungoogled-chromium, Inox, Debian,
  Bromite, Iridium and Brave: 343 patch files in `patches/series` order. It also has
  `flags.gn`, `downloads.ini`, domain-substitution/pruning lists and devutils.
- `imputnet/helium-macos` adds macOS patches, `flags.macos.gn` (e.g.
  `is_official_build=true proprietary_codecs=true ffmpeg_branding="Chrome"
  enable_updater=false use_siso=true`), `build.sh`, `sign_and_package_app.sh`, and a
  `helium-chromium` submodule. It requires macOS 12+ and Xcode 26 plus Homebrew
  Python, Metal toolchain, wget, coreutils and quilt. Build time and disk use are not
  documented. Releases are built on sponsored Depot infrastructure "within hours".
- Cadence: macOS releases roughly twice a week tracking Chromium stable (0.15.4.1 on
  2026-08-12 to 0.18.1.1 on 2026-09-24); arm64 DMG about 114 MB.
- License: Helium-unique code and patches are **GPL-3.0**; unmodified
  ungoogled-chromium material stays **BSD-3-Clause**. AxioSozo is MPL-2.0.

**What does and does not transfer.** Helium is a complete Chrome-layer browser
(tab strip, omnibox, settings WebUI, Sparkle updater, bundled uBlock). It builds
`Chromium.app`, not a framework, so it is not an embedding API.

| Helium asset | Transfers? | Notes |
|---|---|---|
| Keychain name patch (`change-keychain-name.patch`: `"Helium Storage Key"`/`"Helium"`) | **Idea only** | The same effect is a runtime setting in CEF ≥ fa874ac (F8), and Electron does it by setting `KeychainPassword::GetServiceName()`. No GPL import needed. |
| `prevent-reset-on-keychain-unavailability.patch` (retries, fails closed instead of discarding undecryptable data) | **Idea; reimplement or upstream to CEF** | Worth having; GPL-3.0 as written. |
| ungoogled-chromium domain substitution, binary pruning, `flags.gn` philosophy (BSD-3) | **Yes, only if we build from source** | CEF also links chrome-layer code through the Chrome bootstrap (since M128), so many chrome/components patches are relevant. Whether they apply cleanly on top of CEF's own Chromium patches is [unverified]; no maintained "ungoogled CEF" project was found. |
| Disabling component updater/pings, Safe Browsing reporting, Google API key warning | **Partially** | With prebuilt CEF, control is via settings/switches and handlers. We already disable command-line switches, so a small audited allowlist is needed. |
| `spoof-chrome-ua-brand.patch` | **Optional** | UA-CH brand compatibility; decide per site-compat evidence. |
| Build tooling (`build.sh`, signing/notarization scripts) | **Reference only** | Useful for Developer ID signing and notarization of our host app. |
| UI patches (tabs, omnibox, settings, context-menu degoogling, immersive fullscreen) | **No** | Zen owns UI; Alloy/OSR does not run Chrome UI. |
| Updater (Sparkle), onboarding, services, uBlock bundle | **No** | Chrome extensions are not available to OSR browsers (F6). |

Conclusion: take no Helium code. Adopt its ideas (own Keychain item, fail-closed key
access, degoogled defaults). If a source build happens later, use ungoogled-chromium
(BSD-3) as the privacy baseline.

## 5. Q2: Blink embedding options

### (a) CEF Alloy OSR out of process, upgraded to shared textures (current path, rebuilt)

Host process as today. Set `shared_texture_enabled=1` and
`external_begin_frame_enabled=1`. In `OnAcceleratedPaint`, blit the pooled IOSurface
into a host-owned ring of 3 IOSurfaces with Metal (the cefclient 154 pattern, F4) and
send the surface identity plus a completion fence to Zen. A new chrome-only Gecko
component wraps the surface as a `MacIOSurfaceImage` in an `ImageContainer`, the path
video already uses (F3). WebRender composites it with normal z-order, clips and
transforms, and can promote it to a native CALayer when unobstructed.

- Parity: web platform complete. Missing without source changes: Chrome extensions,
  Chrome autofill/password manager, proprietary codecs (F7), scroll phase/pinch
  (F5), native a11y objects (TreeOnly only). DevTools opens as a separate
  CEF browser; embedding it in a Zen pane needs CDP plumbing [unverified]. Widevine
  is compiled in (`enable_widevine`), but CDM delivery and VMP signing on macOS are
  [unverified].
- Cost: host changes plus about 1-2k lines of Gecko C++ patch in `patches/zen` [unverified
  estimate]. No Chromium build.
- Build/update: prebuilt CEF; a security update is a pin bump plus minutes of host
  rebuild. CEF ships several stable builds per week (154.0.23→.26→.28→.32 in 8 days).
- Security: Chromium sandbox intact (already verified in ADR 002); engine crash is
  isolated; IOSurface handoff must be authenticated (see risks).
- macOS risks: capture path adds a GPU blit and about one frame of latency over Chrome
  [unverified]; macOS external begin frame + shared texture was broken until the
  2026-09-11 fix (#4033).

### (b) CEF from source with allocator changes, in-process windowed inside Firefox

Rejected.

- F1 shows the prebuilt framework takes default-zone slot 0 at load time.
  After `cef_initialize` it is expected to serve `malloc` from PartitionAlloc
  [unverified in-process]. Gecko code that calls mozjemalloc directly (e.g.
  usable-size/memory reporting) would then see foreign pointers.
- Turning PA-E off is only a tested configuration on Linux (F10). On macOS the shim
  still intercepts zone functions, and fully removing it breaks the build (#3095).
- Even with allocators fixed: Gecko's `NSApplication` must adopt `CefAppProtocol`,
  CEF must share Gecko's main-thread loop via `external_message_pump`, a Chromium
  browser-process crash kills Zen, and a windowed NSView sits **above** all Gecko
  content, which breaks z-order (§6). Build cost: full Chromium plus CEF on 16 GB RAM
  and about 136 GiB physical free, which is below CEF's recommendation (F10).

### (c) Chromium Content API directly (content_shell/Electron-style host)

Rejected as primary; kept as the long-term escape hatch.

- It gives total control over compositing (`CALayerParams`, F9), input
  (`NSEvent` phases) and accessibility (`BrowserAccessibilityManagerMac` plus
  remote tokens). The same control is reachable with small patches to CEF (option a
  → source phase) without rebuilding everything CEF already provides: 25 handler
  headers in the pinned `include/`, PDF, print, spellcheck, request contexts, OSR
  plumbing.
- Precedent cost: Electron carries **143** Chromium patches plus its own Chrome-layer
  ports (extensions subset, spellcheck, printing). Brave, Vivaldi and Opera
  maintain full Chrome-layer forks with large teams. Content is not a stable API.
- Build/update: the full Chromium build and rebase on every 4-week milestone and
  security respins, as in (b).

### (d) Chromium's own compositor output exported as a remote CALayer (CAContext → CALayerHost)

Prototype-only fallback for presentation, not the primary path.

- This is how Chrome's GPU and browser processes and Chrome app shims share layers
  (F9). With prebuilt CEF it would mean a windowed Alloy browser in an off-screen host
  window whose root layer is published through a private `CAContext`. Zen would
  insert a `CALayerHost` into Gecko's `NativeLayerRootCA` at the z-slot WebRender
  reserves.
- Pros: Chromium's real display output with no capture blit.
- Cons:
  - Private SPI.
  - WebRender cannot sample it (no tab previews, filters, software fallback,
    `drawSnapshot`).
  - Nesting a host context that itself contains a GPU `CALayerHost` is
    [unverified].
  - Chromium throttles occluded windows.
  - IME and drag APIs are OSR-only (F5), so input would require synthesizing
    NSEvents into a background app's view, and IME would not work in the
    background app [unverified but expected].
  - A clean version needs a CEF/Chromium patch that forwards `CALayerParams` instead
    of displaying them, which puts it in the source-build category.

### Comparison

| Criterion | (a) OSR + IOSurface | (b) in-process windowed | (c) Content API host | (d) remote CALayer |
|---|---|---|---|---|
| GPU, zero CPU copy | Yes (1 GPU blit) | Yes | Yes | Yes (0 blit) |
| Correct z-order under Zen UI | Yes (WebRender) | **No** | Yes (if IOSurface) | Partly (native-layer slot only) |
| Pixels for previews/snapshots | Yes | No | Yes | No |
| IME via Zen | Yes (CEF IME APIs) | Native | Yes (own code) | **No/hard** |
| Scroll phases/pinch | No (needs CEF patch) | Native | Yes | Hard |
| Accessibility | TreeOnly → Zen-side bridge | Native | Native + remote tokens | Remote tokens possible |
| Extensions/autofill | No | No (Alloy) | Only what we port | No |
| Crash isolation | Yes | **No** | Yes | Yes |
| Chromium build needed | **No** | Yes | Yes | Yes for a clean version |
| Private macOS API | No | No | Optional | **Yes** |

### How others did it

- **Electron**: Content API plus 143 patches; names the Keychain item
  `<App> Safe Storage` [source].
- **Brave, Vivaldi, Opera**: full Chrome-layer forks [unverified: general knowledge,
  not re-checked for this ADR].
- **Arc**: Chromium-based Swift app on an internal "ADK". Its embedding mechanism
  (CEF vs own fork) is not public; claims that it wraps CEF are community speculation
  [unverified].
- **Orion (Kagi)**: WebKit only, with its own WebExtensions reimplementation (about 70%
  API coverage) [cited].
- **Lunascape**: historically switched Trident/Gecko/WebKit per tab on Windows. It is
  the closest multi-engine precedent, but predates modern sandboxed multi-process
  engines [cited].

## 6. Q3: WebKit through the same contract

- **In-process `WKWebView` NSView in Zen's window.** Allocator-safe (F2). However,
  Firefox/Zen draw several chrome surfaces *over* the content area inside the same
  NSView: the URL bar results view, tab-modal SubDialogs, Zen compact-mode
  sidebar/toolbar flyouts, Glance, and the rounded content corners. A sibling NSView
  would cover all of them. Separate-window popups (menupopup/panel) would still be
  fine. Acceptable only as a developer experiment. It also puts WebKit's UI-process
  side inside Zen's process.
- **Helper-process `WKWebView` exporting frames.** Public APIs offer only
  `takeSnapshot` (CPU/async, not a frame stream). The realistic export is private SPI:
  host `WKWebView` in an off-screen helper window and disable occlusion throttling
  (`windowOcclusionDetectionEnabled` SPI exists in `WKViewPrivate.h`). Then publish
  its root layer through `CAContext` and show it with `CALayerHost` in Zen, which is
  option (d)'s surface kind. Accessibility can be linked with
  `NSAccessibilityRemoteUIElement` tokens, which WebKit already uses between its UI
  and WebContent processes. Nesting that through a third process is [unverified].
  IME would be forwarded as `NSTextInputClient` calls (`setMarkedText`/`insertText`)
  rather than CEF IME APIs [unverified].
- **Contract implication.** The engine-host contract gets two surface kinds:
  `iosurface` (Blink via CEF, composited by WebRender) and `layer_host`
  (`CAContextID`, composited as a native CA layer in the slot WebRender reserves).
  `layer_host` loses snapshots/effects, so WebKit tabs need a separate
  thumbnail path (`takeSnapshot`).
- **Limits unchanged from the idea doc.** No WebExtensions, devtools only via Safari
  Web Inspector (`isInspectable`), profiles via `WKWebsiteDataStore(forIdentifier:)`.

## 7. Q4: The Keychain "Chromium Safe Storage" gate

Chromium's `components/os_crypt/common/keychain_password_mac.mm` hard-codes
`"Chromium Safe Storage"/"Chromium"` (or Chrome's) unless an embedder overrides the
static `KeychainPassword::GetServiceName()/GetAccountName()`.

| Browser | Service / account |
|---|---|
| Helium | `"Helium Storage Key"`/`"Helium"` (patch) |
| Electron apps | `"<App> Safe Storage"` (runtime override) |
| CEF master | Same override from `cef_settings_t` (fa874ac) |

The macOS prompt appears because our ad-hoc host reads a **pre-existing, shared**
item whose ACL does not include it. It also recurs on every rebuild because ad-hoc
code identity is the cdhash. Two things are needed:

1. **Our own item name.** An item the app creates itself is readable by that app
   without a prompt.
2. **A stable designated requirement**, i.e. a stable signing identity, so updates
   stay on the ACL.

Recommendation (cleanest):

- Adopt the first CEF release that contains fa874ac.
  - Set `keychain_service_name="AxioSozo Chromium Safe Storage"` and
    `keychain_account_name="AxioSozo"`.
  - Sign the host with a stable Developer ID.
  - Never reuse the Chrome/Chromium/Helium names.
- Until then, keep live web mode user-gated, as ADR 002 already requires.
  - Allow `--use-mock-keychain` only for synthetic in-memory fixture sessions.
- Patching or cherry-picking fa874ac into a self-built CEF is only worthwhile if Phase
  3 (source build) is approved for other reasons. It is an 80-line change.
- A locally generated self-signed signing identity would stop re-prompts during
  development. It mutates the login Keychain, so it is Wout's decision, not an agent's.

## 8. Q5: Accessibility for an out-of-process OSR engine

- **Near-term realistic path.**
  - Enable `SetAccessibilityState(STATE_ENABLED)` in the host.
  - Stream `CefAccessibilityHandler` tree/location updates (TreeOnly) to Zen.
  - Build `NSAccessibilityElement` objects in the Gecko component as children
    of the engine-surface element's native accessible. That needs a small hook in
    Gecko's `accessible/mac` so a chrome element can expose foreign children
    [unverified].
  - cefclient's `osr_accessibility_helper` and `osr_accessibility_node_mac.mm`
    (BSD, fixed 2026-09-11) is a working reference for roles, values, children and
    positions.
  - Chosen and integrated as described in
    [engine-accessibility.md](../design/engine-accessibility.md) (status in §11).
  - Honest limit: this reimplements a subset of Chromium's
    `BrowserAccessibilityCocoa`. Rich text navigation (AXTextMarker ranges),
    live regions and editing parity would be basic at first.
- **Full-parity path (needs source build).** Let the host create Chromium's real
  `BrowserAccessibilityManagerMac` for the OSR view and export its root with
  `NSAccessibilityRemoteUIElement` tokens. Zen wraps the token and sets
  window/top-level/presenter PID. This is what Chrome does for app shims (F9) and
  what WebKit does across its processes. Coordinates must be mapped to Zen's window.
  Private AppKit SPI; exact embedding in Gecko's a11y tree is [unverified].

## 9. Decision

**Primary Blink path: option (a).** Keep an out-of-process CEF Alloy OSR engine
host on prebuilt official CEF, upgraded to GPU shared textures and composited
**inside WebRender** through a new chrome-only Gecko component. The host renders
IOSurfaces handed over without CPU copies. Zen owns input, IME and all browser UI
through CEF handlers. Accessibility is bridged through `CefAccessibilityHandler`.

Reasons:

- It is the only option meeting drivers 1, 2, 5 and 6 today without a Chromium
  build or private API.
- It uses code paths Gecko already trusts for video (F3).
- It matches Gecko's own multi-process model.
- It keeps security updates cheap.

**Planned upgrade (conditional): CEF built from source** on the same pinned branch with a
small, upstreamable patch set:

- wheel phases/pinch in `CefMouseEvent`
- native-handle SharedImages (CEF PR #4238)
- OS-decoder H.264/AAC (#3559)
- fa874ac if still needed
- optional `CALayerParams`/remote-accessibility export

This is triggered only if Phase 2 measurements show OSR parity gaps that matter.
Content API (c) remains the escape hatch.

**Fallback: option (d)**, remote CALayer export, as a presentation fallback if
IOSurface capture latency or frame pacing cannot meet the Phase 1 budget. It is also
the planned surface kind for WebKit. **Rejected:** (b) in-process CEF.

## 10. Engine-host contract v2 (outline, for the integration lead)

- **Process**: one host per engine per Zen profile (unchanged). The authenticated
  control pipe stays. A Mach channel is added for surfaces and fences. Gecko IPC
  already carries Mach send rights (`IOSurfacePort`), so the host should eventually be
  spawned from C++ rather than `Subprocess.sys.mjs` [unverified design].
- **Surfaces**:
  - `iosurface`: ring of ≥3 host-owned surfaces, `{surface, fence, generation,
    target, dirty_rects, visible_rect, device_scale}`.
  - `layer_host`: `{ca_context_id, fence_port}`.
  - v1 may use Gecko's existing global-ID descriptor. v2 moves to Mach ports (see
    risks).
- **Pacing**: Zen drives `SendExternalBeginFrame` from the window's display link and
  acknowledges presented frames. Hidden tabs stop begin frames (`WasHidden`).
- **Input**: key/mouse/wheel with raw NSEvent fields (phases carried now, honored when
  the engine supports them). IME uses a focused chrome-side composition proxy whose
  `compositionstart/update/end` map to `ImeSetComposition/CommitText/Cancel`.
  `OnImeCompositionRangeChanged` positions the proxy so Gecko's native IME places the
  candidate window [unverified]. Drag and drop uses CEF drag APIs.
- **UI callbacks → Zen**:

  | CEF handler | Zen UI |
  |---|---|
  | `CefContextMenuHandler::RunContextMenu` | XUL `menupopup` |
  | `CefJSDialogHandler` | tab-modal prompts |
  | `CefPermissionHandler` | `PopupNotifications` |
  | `CefDownloadHandler` | downloads panel entry owned by the host |
  | `GetAuthCredentials` | auth prompt |
  | `OnCertificateError` | Zen certificate error page (no bypass unless Firefox's own policy allows) |
  | `CefDialogHandler::OnFileDialog` | `nsIFilePicker` |
  | `Find` | findbar |
  | Fullscreen, zoom and title/favicon handlers | existing Zen UI |

- **Recovery**: renderer termination shows a Zen crashed-tab page; host death
  restarts the host and marks tabs for explicit reload (never replay POST, as in
  ADR 002).

## 11. Phased plan and exit gates

| Phase | Scope | Exit gate (real macOS evidence) |
|---|---|---|
| 0: spikes (days) | (i) Host: shared texture on, blit into own IOSurface ring, report timings. (ii) Gecko: chrome-only element showing an external IOSurface through `MacIOSurfaceImage`/WebRender under a Zen overlay. (iii) Throwaway `CAContext`/`CALayerHost` cross-process test for option (d)/WebKit. | Screen recording plus trace: 120 Hz scroll with no CPU pixel copy; z-order correct under URL bar results and SubDialog; spike (iii) PASS or FAIL recorded |
| 1: presentation | Contract v2 surfaces and pacing; replace BGRA pipe; Retina without scale cap; resize/display changes | Frame-time p95 within 1 frame of Gecko on the same page [target]; input-to-photon measured; E1 presentation rows PASS |
| 2: input and UI | IME proxy, trackpad (without phases), drag and drop, cursors; all UI callbacks mapped to Zen; crash recovery; Keychain via CEF release with fa874ac and stable signing | E1 matrix rows for IME, popups, downloads, permissions, certificates, context menus, crash → PASS; no Keychain prompt on second launch |
| 3: accessibility and devtools | `CefAccessibilityHandler` → NSAccessibility bridge; DevTools in a Zen pane over CDP (fallback: separate DevTools window, dev-only) | VoiceOver can navigate headings/links/forms on fixtures; devtools inspect works |
| 4: source build (decision) | Only if Phase 1-3 gaps are material: pinned CEF source build with the patch set in §9 on dedicated external storage | Reproducible build log, size/time recorded, patch set ≤ ~10 small patches |
| 5: WebKit | Helper-hosted `WKWebView` over `layer_host` surfaces and remote a11y tokens, developer-only first | Same E1 subset for WebKit, with private-API use documented |

**E1 status, 2026-09-30 [local]: EXPERIMENTAL, not READY.** See
[e1-native-2026-09-30/result.json](../evidence/e1-native-2026-09-30/result.json).

- **What ran.** Option (a) ran in the actual Zen window on a 60 Hz 5K display: the
  engine-view component in copy mode, CEF shared textures and external begin frames.
- **Phase 1 (presentation).**
  - Measured: 60.0 fps presented, 60.2 fps composited; key→frame (frame handed to
    the ImageContainer) p50 13.5 ms, p95 39 ms; each copy 1–3 ms at 2072×2048.
  - Z-order: correct under the urlbar results and tab-modal prompts.
  - Other checks: resize, hidden tabs (0 begin frames) and crash recovery work.
  - Not yet measured: 120 Hz, frame-time p95 against Gecko, input-to-photon, and
    zero-copy.
- **Phase 2 (input and UI), partial.** Four bugs were fixed during the run: two host
  crashes/hangs in prompt and context-menu handling, the Zen dialog reply, and page
  focus across navigations. After those fixes these work:
  - typing, ⌘L and ⌘T;
  - `<select>` and the context menu;
  - JS dialogs through Zen prompts;
  - the certificate panel.
- **Still untested:** IME, trackpad phases, pinch, downloads, permissions and
  accessibility.

**E2 perf/robustness status, 2026-10-01 [local]: EXPERIMENTAL, not READY.** See
[e2-perf-2026-09-30/result.json](../evidence/e2-perf-2026-09-30/result.json).

- **Zero-copy adopted** (contract flag `AXIO_SURFACE_FLAG_GLOBAL_SURFACE`). Same
  animated fixture, 60 Hz, 2072×2048 surface:
  - Chromium zero-copy: 59.9 fps presented, present interval p50 16.7 / p95 19.2–19.8 /
    p99 20.8–23.2 ms, no Zen-side copy, key→frame p50 13–16 ms.
  - Chromium copy mode: 55.6–58.5 fps presented, p95 23–25 / p99 33–35 ms, Zen blit
    0.44 ms GPU time (p50), key→frame p50 18–30 ms, about 60 ms/s more Zen parent CPU.
  - Gecko (page rAF, same method): 60 fps, p95 17.2–17.4 ms, p99 17.7 ms.
  - Gecko keeps a directly composited host surface in use ~66 ms, so the host ring grew
    from 3 to 6 surfaces (3 deadlocked to 1.6 fps, 4 gave 34 fps).
- **Crash detection:** E1's "hang instead of exit" was the host inheriting Zen's
  Breakpad exception port. The host now clears it and has a bounded-exit watchdog. Host
  SIGKILL/SIGSEGV: the endpoint fails within ~2 ms (Mach dead-name), the panel shows in
  4–80 ms when Zen is idle (outliers 320/718 ms under load); renderer kill 18–376 ms;
  Reload recovers. A frozen-but-alive host is still not detected.
- **Not measured:** Gecko's own composite GPU time, input-to-photon, 120 Hz.

**Accessibility status (Phase 3, Q5), 2026-10-01 [local]: EXPERIMENTAL, not READY.**
Design: [engine-accessibility.md](../design/engine-accessibility.md) (NSAccessibility
splice, §8 near-term path). Evidence:
[a11y-2026-10-01/result.json](../evidence/a11y-2026-10-01/result.json).

- **Integrated and built:** host `ax_tree_update`/`ax_location`/`ax_action`/`ax_ack`
  (contract "Accessibility"), chrome-JS model, `engine-view/a11y` component and the
  `accessible/mac/mozAccessible.mm` record. Host, Zen and all unit/stream/smoke tests pass.
- **Real AX client, actual Zen window (no VoiceOver speech):** a public-AXUIElement probe
  set `AXEnhancedUserInterface` and found the Chromium tab's tree under the canvas 0.23 s
  after its first `AXChildren` query: web area, h1–h3 with levels, navigation landmark,
  links with URLs, button, text field, secure text field with an empty value, and a list.
  `AXPress` clicked the button, and setting `AXValue` filled the text field. The typed
  synthetic password appeared in no accessibility event. Frames matched the screenshot.
  With no client, nothing was enabled and no `ax_*` event flowed. After the client left,
  the tab was disabled within the 15 s poll.
- **Fixed during the run:** the controller was per window, not per process (Zen preloads
  chrome modules per window).
- **Not yet done:** the VoiceOver plan (design §10, A1–A18). That covers speech, rotor,
  focus following, live regions, OOPIF, scrolling, split view and navigation. Also
  missing: text markers and table semantics.

## 12. Open risks

1. **Global IOSurface IDs.** Gecko's current descriptor uses global IDs (F3). A
   global surface can be looked up by other local processes that learn the ID, which
   is weaker than Mach-port transfer for cross-origin web pixels. Acceptable only
   for Phase 0/1. Since E2 the host's ring surfaces themselves are global (zero-copy);
   copy mode (`axiosozo.engine_view.zero_copy=false`) only moves the same exposure to
   Zen's global copies. Phase 2 should add a Mach-port variant; Gecko already has
   `IOSurfacePort`.
2. **Capture-path limits.** CEF OSR uses viz's video capturer (`video_consumer_osr.cc`),
   so pacing, damage rects (#3730) and latency may lag Chrome's native path. This is
   the Phase 1 measurement that decides whether (d) or a source build is needed.
3. **No scroll phases or pinch in OSR (F5).** Rubber-banding, fling and pinch-zoom
   will not match Gecko until a CEF patch exists. The visible impact is
   [unverified].
4. **Feature gaps vs Gecko** (F6/F7): no extensions, no Chrome autofill/passwords, no
   H.264/AAC in stock CEF, Widevine/VMP unclear. The UI must state these per
   tab; Gecko stays the default for such sites.
5. **Private API** for option (d), WebKit export and remote a11y tokens (`CAContext`,
   `CALayerHost`, `NSAccessibilityRemoteUIElement`). Chrome and WebKit depend on
   them, which lowers breakage risk, but they are unsupported and rule out the Mac App
   Store.
6. **Gecko patch surface.** The new compositing element, a11y hook and C++ host
   spawner are Gecko patches carried in `patches/zen` and rebased on every Zen/Firefox
   update.
7. **Source-build resources.** 16 GB RAM is at CEF's minimum, and about 136 GiB of
   physical free space on T9 is shared with the Zen build. A release CEF build
   plausibly needs about 100 GB and many hours here [unverified estimate]. CEF's
   `automate-git.py`/`gclient` run upstream hooks, which AGENTS.md forbids without
   explicit authorization. Chromium also requires a checkout path without spaces.
8. **Keychain timing.** fa874ac depends on CEF's next branch; the date is unknown.
9. **Frozen host.** A host that is alive but stuck (deadlock, SIGSTOP) is not detected:
   navigation commands are untimed and there is no liveness ping. Needs a cef-v1
   heartbeat or a host main-thread watchdog that tolerates a user-facing Keychain wait.

## 13. Decisions needed from Wout

1. Accept option (a) as primary, (d) as fallback and (b) as rejected. Approve Phase 0
   spikes, which modify Gecko (`patches/zen`) and the CEF host.
2. Signing: obtain a stable Developer ID, or approve a local self-signed identity for
   development. Either is required for a prompt-free own Keychain item.
3. Whether a Chromium/CEF **source build** is ever acceptable on this machine/storage
   (Phase 4), including running upstream `gclient` hooks. This needs a separate storage
   decision, because the current T9 headroom is too tight.
4. Product stance on parity gaps: are Chromium tabs acceptable without extensions,
   autofill and H.264/AAC initially, with Gecko remaining the default for those sites?

## Appendix A: probes run for this ADR

Built with `/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec --
/usr/bin/clang ...`. Sources and binaries are in
`/Volumes/AxioSozoBuild/tmp/adr003/zoneprobe/` (not committed). Neither probe touches
the network beyond an inline HTML string, nor any profile or Keychain.

- `zoneprobe.m` (non-persistent `WKWebView`, `loadHTMLString`), macOS 27.0.1 (26A434):
  `[after-load] default zone=DefaultMallocZone zones=6: [0]DefaultMallocZone
  [1]objc-class_rw_t [2]QuartzCore [3]WebKit Using System Malloc [4]WebKit Malloc
  [5]LSBindingEvaluator | malloc(64) owner=DefaultMallocZone`
- `cefzone.c` (`dlopen` of the pinned CEF 154.0.23 framework, no initialization):
  `[start] zones=2: [0]DefaultMallocZone ...` →
  `[after-dlopen-CEF] zones=4: [0]PartitionAlloc [1]objc-class_rw_t
  [2]DefaultPurgeableMallocZone [3]DefaultMallocZone | malloc(64) owner=DefaultMallocZone`
- `nm -u` on the pinned framework lists `_malloc_zone_register`,
  `_malloc_zone_unregister`, `_malloc_default_zone`, `_malloc_default_purgeable_zone`.

## Sources

Local source (pinned trees):

- Gecko: `/Volumes/AxioSozoBuild/zen/source/engine/`
  - `memory/build/zone.c`
  - `gfx/layers/ipc/IOSurfacePort.h`
  - `gfx/layers/NativeLayerRootRemoteMacParent.mm`
  - `gfx/layers/MacIOSurfaceImage.h`
  - `gfx/layers/ipc/LayersSurfaces.ipdlh`
  - `gfx/layers/GpuFenceMTLSharedEvent.h`
  - `modules/libpref/init/StaticPrefList.yaml` (`layers.gpu-process.enabled`)
- CEF 154.0.23 headers: `include/cef_render_handler.h`, `include/cef_browser.h`,
  `include/internal/cef_types_mac.h`, `include/internal/cef_types_runtime.h`

Helium / ungoogled-chromium:

- https://github.com/imputnet/helium (README, license, `patches/series`,
  `patches/helium/core/change-chromium-branding.patch`)
- https://github.com/imputnet/helium-macos (`docs/building.md`, `flags.macos.gn`,
  `patches/helium/macos/change-keychain-name.patch`,
  `patches/helium/macos/prevent-reset-on-keychain-unavailability.patch`, releases)
- https://github.com/ungoogled-software/ungoogled-chromium

CEF:

- https://github.com/chromiumembedded/cef/commit/fa874acb9dd4a0ebf607245543b2f20d27d04916
  (Keychain names, #2692/#4247)
- https://github.com/chromiumembedded/cef/blob/8037/include/internal/cef_types.h
  (fields absent on 8037)
- https://cef-builds.spotifycdn.com/index.json (newest macOS arm64 builds, 2026-09-29)
- https://chromiumembedded.github.io/cef/api_versioning (`CEF_NEXT`)
- https://github.com/chromiumembedded/cef/blob/master/docs/architecture.md
  (Alloy vs Chrome style)
- https://github.com/chromiumembedded/cef/blob/master/docs/master_build_quick_start.md
  (RAM/disk/time)
- https://github.com/chromiumembedded/cef/blob/8037/tools/gn_args.py
  (PA-E only disabled on Linux; Widevine)
- CEF commit 260dd0c "osr: Implement shared texture support" (2024-04-23); history of
  `libcef/browser/osr/video_consumer_osr.cc`
- https://github.com/chromiumembedded/cef/tree/8037/tests/cefclient/browser
  (`browser_window_osr_mac.mm`)
- https://github.com/chromiumembedded/cef/tree/8037/tests/shared/browser
  (`osr_renderer_metal.mm`, `osr_begin_frame_timer_mac.mm`,
  `osr_accessibility_node_mac.mm`)
- Issues and PRs:
  - https://github.com/chromiumembedded/cef/issues/4033 (mac OSR external begin
    frame)
  - https://github.com/chromiumembedded/cef/issues/3730 (accelerated dirty rects)
  - https://github.com/chromiumembedded/cef/pull/4238 (native-handle SharedImages)
  - https://github.com/chromiumembedded/cef/issues/3559 (OS-decoder codecs)
  - https://github.com/chromiumembedded/cef/issues/3681 (Alloy style split)
  - https://github.com/chromiumembedded/cef/issues/3859 (extensions/Alloy OSR)
- https://groups.google.com/g/cef-announce/c/s1WaovAopFo/m/LV5eiNX1BgAJ
  (Alloy style/extension notes)

Chromium:

- https://github.com/chromium/chromium/blob/main/ui/gfx/ca_layer_params.h
- https://github.com/chromium/chromium/blob/main/ui/base/cocoa/remote_layer_api.h
- https://github.com/chromium/chromium/blob/main/ui/base/cocoa/remote_accessibility_api.h
  (+ `.mm`; users in `components/remote_cocoa/app_shim/application_bridge.mm`,
  `content/app_shim_remote_cocoa/ns_view_bridge_factory_impl.mm`)
- https://github.com/chromium/chromium/blob/main/content/README.md
- https://github.com/chromium/chromium/blob/main/docs/mac_build_instructions.md
- https://chromiumdash.appspot.com/fetch_milestone_schedule?mstone=155

WebKit:

- https://github.com/WebKit/WebKit/blob/main/Source/bmalloc/libpas/src/libpas/pas_root.c
- `Source/WebKit/UIProcess/mac/WebViewImpl.mm` (remote accessibility tokens)
- `Source/WebCore/platform/graphics/cocoa/WebCoreCALayerExtras.mm` (`CALayerHost`)
- `Source/WebKit/UIProcess/API/Cocoa/WKViewPrivate.h` (occlusion SPI)

Electron and others:

- https://github.com/electron/electron/blob/main/patches/chromium/.patches
  (143 entries)
- `shell/browser/electron_browser_main_parts.cc` (`KeychainPassword::GetServiceName()`)
- https://github.com/electron/electron/issues/32406 (PartitionAlloc on macOS in an
  embedder)
- https://news.ycombinator.com/item?id=45128484 (Arc "ADK" letter; embedding
  unspecified)
- https://help.kagi.com/orion/misc/technical.html
- https://blog.kagi.com/orion
- https://en.wikipedia.org/wiki/Lunascape
- https://www.osnews.com/story/20579/switch-seamlessly-between-trident-gecko-webkit/
