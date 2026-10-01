# Engine view in Gecko: native Chromium (and later WebKit) tabs in Zen

Status: design plus a first implementation. Compiled and linked into XUL, and a
headless registration smoke passes (2026-09-30, see
`docs/evidence/engine-view-build-2026-09-30.log`). No frame has been presented
yet. Nothing here is E1/E2 evidence. Nothing here claims READY.

Owner: Gecko-side engine integration. Sources are in `apps/browser/native/engine-view/`,
mirrored to `src/zen/axiosozo-native/engine-view/`. The wire protocol is
[contracts/engine-surface-v1.md](../../contracts/engine-surface-v1.md). Its C
layout, `engine_surface_v1.h`, is copied byte for byte from
`native/chromium-host/engine_surface_v1.h`.

Citations are `path:line` in the Gecko 156 tree
(`/Volumes/AxioSozoBuild/zen/source/engine`, clean, commit `f10846e9`).

## 1. Decision in one paragraph

A Chromium tab is an HTML `<canvas>` in the browser chrome document, placed where the
tab's `<browser>` stacks today. A small chrome-only hook, `HTMLCanvasElement::
SetAxioExternalImageContainer`, points it at an **asynchronous `ImageContainer`**.
`nsDisplayCanvas` presents that container through the same async image pipeline
WebRender already uses for a worker-driven OffscreenCanvas and for `<video>`.
Frames arrive as IOSurface send rights over Mach. They are received on a private GCD
queue in the parent process. Each is wrapped as a `MacIOSurface`, then a
`MacIOSurfaceImage`, and passed to `ImageContainer::SetCurrentImages`. The main
thread is not involved. The ImageBridge forwards the frame to the compositor, and
WebRender composites it at the next vsync. The canvas sits in the chrome display
list, so every Zen overlay gets correct z-order, clipping, border radius, transforms
and animations for free. WebRender may also promote the frame to its own CALayer
(compositor surface), the way it does for video. The whole Gecko patch is 3
sha256-guarded hunks in 3 files (§9).

## 2. Facts about the Firefox 156 macOS pipeline that drive the design

- **The GPU process is on by default on macOS.** See
  `modules/libpref/init/StaticPrefList.yaml:10374-10383`
  (`layers.gpu-process.enabled`, `XP_MACOSX → true`). WebRender runs there. The
  parent's `NativeLayerRootCA` only hosts the resulting IOSurfaces
  (`gfx/layers/NativeLayerRootRemoteMacParent.h:47`,
  `gfx/layers/ipc/PNativeLayerRemote.ipdl:14,34`).
- **An IOSurface crosses the ImageBridge by global ID, not by Mach port.**
  - `SurfaceDescriptorMacIOSurface { uint32_t surfaceId; … }`
    (`gfx/layers/ipc/LayersSurfaces.ipdlh:73-79`)
  - The client serializes `GetIOSurfaceID()`
    (`gfx/layers/opengl/MacIOSurfaceTextureClientOGL.cpp:54-61`).
  - The GPU process calls `MacIOSurface::LookupSurface(surfaceId)`
    (`gfx/layers/opengl/MacIOSurfaceTextureHostOGL.cpp:17-30`), which uses
    `IOSurfaceLookup` (`gfx/2d/MacIOSurface.cpp:294-306`). It logs
    `"Failed to look up MacIOSurface"` on failure.
  - Gecko therefore creates all of its surfaces with `kIOSurfaceIsGlobal`
    (`gfx/2d/MacIOSurface.cpp:58,208`).
  - Mach-port IOSurface IPC does exist (`gfx/layers/ipc/IOSurfacePort.{h,cpp}`),
    but only in `PNativeLayerRemote`. It is not a `SurfaceDescriptor` variant.
- **`MacIOSurface::LookupSurface` only takes IDs** (`gfx/2d/MacIOSurface.h:70-72`).
  There is no Mach-port lookup helper. The component calls
  `IOSurfaceLookupFromMachPort` directly (Gecko does the same in
  `gfx/layers/ipc/IOSurfacePort.cpp`) and wraps the result with the public
  constructor `MacIOSurface(CFTypeRefPtr<IOSurfaceRef>, …)` (`MacIOSurface.h:77-80`).
  That constructor takes one IOSurface use count, and the destructor drops it
  (`MacIOSurface.cpp:28-45,417-423`).
- **The host's ring surfaces are global since E2 (2026-10-01).** `createSurface` in
  `native/chromium-host/surface_transport.mm` sets `kIOSurfaceIsGlobal` and every FRAME
  carries `AXIO_SURFACE_FLAG_GLOBAL_SURFACE`. Chromium's own pooled IOSurfaces are not
  global and the CEF contract forbids keeping them past `OnAcceleratedPaint`
  (contract "CEF 154 notes"), so the host still blits once into its ring. §4.3.
- **`GpuFence` cannot cross IPC.** `ParamTraits<GpuFence*>` asserts on non-null
  (`gfx/layers/ipc/LayersMessageUtils.h:760-785`). The frame must be complete before
  it is sent. The host already awaits its Metal blit.
- **The window structure.** There is one `ChildView` per window. The
  `PixelHostingView` and its CALayer tree are created in
  `widget/cocoa/nsCocoaWindow.mm:1791-1801`. `NativeLayerRootCA` overwrites the
  root's `sublayers` on every commit (`gfx/layers/NativeLayerCA.mm:417-429`).

## 3. Compositing options evaluated

### (a) Async ImageContainer plus MacIOSurfaceImage, as used by `<video>` and worker OffscreenCanvas. **Chosen, via the canvas display item.**

- `nsDisplayCanvas::CreateWebRenderCommands` already has an async path.
  - For an offscreen canvas it pushes `element->GetImageContainer()` with
    `CommandBuilder().PushImage` and asserts `IsAsync()`
    (`layout/generic/nsHTMLCanvasFrame.cpp:88-119`).
  - The container is created `ASYNCHRONOUS` by `OffscreenCanvasDisplayHelper`
    (`dom/canvas/OffscreenCanvasDisplayHelper.cpp:120-131`).
  - A worker thread feeds it with `SetCurrentImages`
    (`OffscreenCanvasDisplayHelper.cpp:340-348`).
- `PushImage` with an async container does not create an image key. Instead:
  - it calls `WebRenderImageData::CreateAsyncImageWebRenderCommands`
    (`gfx/layers/wr/WebRenderCommandBuilder.cpp:2291-2360`);
  - that registers the container's `CompositableHandle` as an **async image
    pipeline** and pushes an iframe item for it
    (`gfx/layers/wr/WebRenderUserData.cpp:192-231`).
- New frames bypass layout and the main thread entirely.
  - `ImageContainer::SetCurrentImages` "can be called on any thread … schedule a
    task to send the image to the compositor using the PImageBridge protocol
    without using the main thread" (`gfx/layers/ImageContainer.h:370-378,420-445`).
  - `WebRenderImageHost::UseTextureHost` then schedules a composite with
    `RenderReasons::ASYNC_IMAGE` (`gfx/layers/wr/WebRenderImageHost.cpp:60-100`).
  - `AsyncImagePipelineManager::ApplyAsyncImagesOfImageBridge` updates the tiny
    per-pipeline display list (`gfx/layers/wr/AsyncImagePipelineManager.cpp:383-420`).
- Presentation is vsync-aligned: `CompositorVsyncScheduler` composites on the next
  vsync.
- **Z-order, clip, radius and transform are correct** because the item is part of
  the chrome display list.
  - The iframe item inherits the clip chain and stacking context of its ancestors:
    Zen's rounded content corners, split-view panes, glance's transform and
    opacity animation, and OMTA.
  - Anything later in the chrome DOM, or with a higher z-index, paints above it:
    in-document urlbar results, tab-modal dialogs, notifications, drag feedback.
  - `border-radius` on the canvas itself works too
    (`nsHTMLCanvasFrame.cpp:457-471` clips replaced content with radii).
- **Zero-copy where possible.**
  - `MacIOSurfaceTextureHostOGL::PushDisplayItems` pushes BGRA IOSurfaces with
    `prefer_compositor_surface` and `supports_external_compositing = true`
    (`MacIOSurfaceTextureHostOGL.cpp:211-231`).
  - The async pipeline sets `PREFER_COMPOSITOR_SURFACE`
    (`AsyncImagePipelineManager.cpp:486-500`).
  - WebRender can therefore hand the IOSurface directly to a CALayer when nothing
    complex overlaps it. Otherwise it samples the texture once while compositing.
- `<video>` itself (`nsDisplayVideo` plus `VideoFrameContainer`) needs an
  `HTMLMediaElement` and media plumbing (autoplay, audio focus, media controls,
  Picture-in-Picture). The canvas item gives the same pipeline without any of that.

### (b) A chrome-only canvas hook. **Chosen shape of (a).**

- **Variant b1 (chosen):** `SetAxioExternalImageContainer` on `HTMLCanvasElement`,
  plus 12 lines in `nsDisplayCanvas`. This is the smallest contained patch. It
  cannot be reached from content: it is C++ only, `MOZ_RELEASE_ASSERT`s a chrome
  document, and is only called by a `MAIN_PROCESS_ONLY` component.
- **Variant b2 (rejected):** a zero-patch hijack of `transferControlToOffscreen()`.
  It would drive `OffscreenCanvasDisplayHelper::CommitFrameToCompositor` with a
  fake `nsICanvasRenderingContextInternal` whose `PresentFrontBuffer` returns a
  `SurfaceDescriptorMacIOSurface`. That relies on private helper state and needs
  a large abstract context interface. It also exposes a live `OffscreenCanvas` to
  chrome JS that could then call `getContext` and fight us.
- **Variant b3 (rejected):** a new canvas context type, or reuse of
  `ImageBitmapRenderingContext.transferFromImageBitmap` or WebGPU `CanvasContext`
  presentation.
  - ImageBitmap forces a main-thread `transferFromImageBitmap` per frame.
  - A new context type touches `CanvasRenderingContextHelper`, WebIDL and
    `CanvasContextType` in several files.
  - WebGPU presents through `RemoteTextureMap`, whose owners live in the GPU
    process. Our frames arrive in the parent.
- `canvas.captureStream()` is the opposite direction (canvas to stream). Not
  applicable.

### (c) A MediaStream video source feeding `<video>`. **Rejected.**

- Frames would go Mach → `MediaTrackGraph` thread → `VideoOutput` →
  `VideoFrameContainer` → async container.
- That adds a graph-rate hop and timestamp scheduling (the container composites by
  `TimeStamp` for A/V sync, not "latest now").
- It drags in media element policy (autoplay, audio focus, media keys, PiP
  buttons, `HTMLMediaElement` lifecycle) and has no advantage over (a).

### (d) A native CALayer or NSView sibling. **Rejected.**

- A sibling view above `ChildView` breaks `mainChildView`'s "lastObject is
  ChildView" assumption.
- A sublayer of the root CALayer is erased on the next commit
  (`NativeLayerCA.mm:417-429`).
- Even if kept alive, a sibling can only be entirely above or entirely below all
  WebRender content:
  - Above: it covers the urlbar results panel, glance chrome, tab-modal dialogs,
    Zen's floating toolbars and every other in-document overlay.
  - Below: it is hidden by the opaque chrome.
- Rounded corners, split-view clips, glance transforms and animations would all
  need a second, hand-synchronised geometry path. It would tear against WebRender
  transactions during resize and animation.
- (a) already obtains CALayer zero-copy through WebRender's compositor-surface
  logic, with correct z-order.

### (e) Other options, for completeness. **Rejected.**

- `nsDisplayRemote` (the `<browser remote>` layers-id path) would require the engine
  host to speak `PWebRenderBridge`.
- `RemoteTextureMap` only accepts producers inside Gecko's GPU process.
- A Gecko IPDL change carrying `IOSurfacePort` inside `SurfaceDescriptorMacIOSurface`
  would make a `[Comparable]`, copyable union member move-only. That is a large,
  risky cross-process patch; the copy fallback in §4.3 is enough.

## 4. Frame path and lifetime

### 4.1 Receive (endpoint queue, `AxioEngineEndpoint.mm`)

- **Create.** `createEndpoint()` calls `bootstrap_check_in` on
  `dev.axiosozo.surface.<32 hex>`. The randomness comes from
  `GenerateRandomBytesFromOS`. Gecko uses the same mechanism for its own children
  (`ipc/glue/GeckoChildProcessHost.cpp:300,1312-1321`).
- **Queue limit** is set to `MACH_PORT_QLIMIT_LARGE`, as the contract requires
  (at least 97).
- **Token.** A 256-bit token is created, distinct from the pipe token.
- **Queue.** A `DISPATCH_SOURCE_TYPE_MACH_RECV` source runs on a serial
  `QOS_CLASS_USER_INTERACTIVE` queue.
- **Every receive** asks for the audit trailer
  (`MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT)`), as
  `ipc/chromium/src/chrome/common/mach_ipc_mac.cc:246` does. Oversized messages are
  destroyed by the kernel, because the receive does not set `MACH_RCV_LARGE`.
- **CONNECT** is accepted only if all of these hold:
  - the audit pid equals the pid chrome JS registered with `expectHostPid()`;
  - that pid equals `host_pid`;
  - `proc_pidinfo(PROC_PIDTBSDINFO).pbi_ppid == getpid()`;
  - the size, the single `PORT_SEND` descriptor, magic and version are exact;
  - the token matches in constant time.

  Only one CONNECT is ever accepted. Anything else is `mach_msg_destroy`ed and
  ignored. After acceptance the token is wiped. A `MACH_NOTIFY_DEAD_NAME` request
  on the host's reply port detects host death. Then CONNECTED is sent.
- **FRAME** processing:
  1. Check the exact size, the one port descriptor, magic, version and format.
     Check `dirty_count ≤ 8`, 1..4096 px per dimension, and strictly increasing
     `frame_id`.
  2. Call `IOSurfaceLookupFromMachPort`, then **always** `mach_port_deallocate`.
  3. Verify the IOSurface width and height, `'BGRA'`, planes = 0,
     4 bytes/element, row and alloc sizes, and `IOSurfaceGetID == surface_id`.
  4. Match the target id. Compare both generations:
     - **stale** (either generation lower): RELEASE at once and discard;
     - **current**: present;
     - **future**: hold it. It is not shown and not released until chrome JS
       calls `setTargetGenerations()`, then it is shown or dropped. This
       preserves the pipe's ordering guarantee even though Mach overtakes the
       JSON pipe: new-document pixels never appear before chrome has processed
       the navigation and updated the address bar.
- **Unknown or unbound target:** RELEASE at once. The contract allows RELEASE for
  closed targets whose frame id was issued.

### 4.2 Present

- A new `MacIOSurface` is created per frame. It holds one use count.
- It is wrapped in a `MacIOSurfaceImage` (`gfx/layers/MacIOSurfaceImage.h:17-25`)
  and passed to `SetCurrentImages` with a per-binding `ProducerID` and an
  increasing `FrameID`.
- `MacIOSurfaceImage::GetTextureClient` creates `MacIOSurfaceTextureData` on the
  ImageBridge thread (`gfx/layers/MacIOSurfaceImage.cpp:19-30`).
- The container uses `ImageUsageType::OffscreenCanvas`, because `SetCurrentImages`
  asserts Canvas, OffscreenCanvas or VideoFrameContainer
  (`gfx/layers/ImageContainer.cpp:420-425`).

### 4.3 Global-ID constraint: zero-copy vs copy mode

The GPU process looks surfaces up by global ID (§2), so a non-global host surface
fails there. The two modes:

- **Zero-copy mode (contract engine-surface-v1, adopted in E2; default).**
  - The host creates its ring surfaces with `kIOSurfaceIsGlobal: @YES`; Gecko does the same.
  - The host sets FRAME `flags` bit 1 (`AXIO_SURFACE_FLAG_GLOBAL_SURFACE`, value 2).
  - Gecko then presents the host surface directly, after checking the surface's
    recorded creation properties (`IOSurfaceLookup` in the parent succeeds even for
    a non-global surface it holds, so it cannot be the check). Pref
    `axiosozo.engine_view.zero_copy=false` forces copy mode.
  - Gecko keeps a superseded host surface in use ~66 ms (≈4 frames; textures are held
    until a later rendered frame completes), so the host ring is 6 surfaces.
    Measured: 59.9 fps, present-interval p95 19–20 ms (E2 result.json).
  - Trade-off: any local process that can call `IOSurfaceLookup` can read a
    global surface. That is the same exposure Firefox already accepts for every
    video, canvas and WebGL surface.
- **Copy mode (fallback: frames without bit 1, or the pref set to false).**
  - Gecko blits the frame with Metal (`EngineSurfaceCopier`, one
    `copyFromTexture`, awaited on the endpoint queue) into one of up to four
    **Gecko-owned global** surfaces. These come from `MacIOSurface::CreateIOSurface`:
    BGRA, sRGB-tagged when `gfx.color_management.native_srgb` is set
    (`MacIOSurface.cpp:80-105`).
  - Gecko then RELEASEs the host frame immediately.
  - Pool slots are recycled exactly like `MacIOSurfaceRecycleAllocator`, with
    `IOSurfaceIsInUse` (`MacIOSurfaceImage.cpp:244`).
  - Cost: one GPU copy; E2 measured 0.44 ms GPU time (p50, `copyGpuUs`) at
    2072×2048 on an M4, 1–3 ms wall (`lastCopyNs`), 55.6–58.5 fps presented with
    present-interval p95 23–25 ms, and ~60 ms/s more parent CPU than zero-copy.
  - If no pool slot is free, the frame stays held and is retried on the next
    poll. The last frame of an animation is never dropped.
- The host sets the bit on every frame since E2, so copy mode is only the fallback.

### 4.4 RELEASE timing: present-then-release

Superseded frames stay **pinned** by our `MacIOSurface` use count until the current
frame of that binding reports `mComposited`:

- `ImageContainer::GetCurrentImages` → `OwningImage::mComposited`
  (`ImageContainer.h:521-545`);
- this is set by the compositor's image-composite notification
  (`ImageContainer.cpp:528-549`, `WebRenderImageHost.cpp:305-308`).

Before that point, the GPU process may not yet have looked the older surface up.
After it, the pin is dropped and the surface is released once:

- zero-copy: RELEASE is sent when `IOSurfaceIsInUse()` is false (the GPU-process
  wrapper and any CALayer or WindowServer use count it). A 1 s cap forces the
  release and counts it in `forcedReleases`, so a pinned count cannot stall the
  host;
- copy mode: the pool slot becomes reusable.

Other cases:

- Hidden or unbound targets unpin superseded frames immediately.
- Each host frame gets exactly one RELEASE: discard, held-replaced, copied, or
  released after display. RELEASE uses a 100 ms bounded send. Any send failure
  closes the endpoint (`host-died` or `host-unresponsive`).

## 5. Vsync and frame pacing

- **Source.** `gfxPlatform::GetPlatform()->GetGlobalVsyncDispatcher()`
  (`gfx/thebes/gfxPlatform.h:672`). `nsIWidget::GetVsyncDispatcher()` returns null
  on macOS (`widget/nsIWidget.cpp:653-655`).
- **Hardware source.** `OSXVsyncSource` drives the dispatcher from a CVDisplayLink
  (`gfx/thebes/gfxPlatformMac.cpp:744-870`), at 120 Hz on ProMotion.
- **Observer.** `EngineVsyncForwarder` is a `VsyncObserver`
  (`widget/VsyncDispatcher.h:17-31`). It is added and removed from any thread
  (`VsyncDispatcher.h:103-109`), and only while at least one target wants ticks,
  so hardware vsync stops otherwise.
- **`NotifyVsync`** runs on the vsync thread. It converts `VsyncEvent::mTime`
  (`TimeStamp` is mach-time based: `mozglue/misc/TimeStamp.h:462-464`,
  `widget/cocoa/nsCocoaUtils.mm:1163-1177`) to `mach_absolute_time` ticks. It
  reads `GetVsyncRate()` for `interval_ns`, coalesces ticks, and posts one task to
  the endpoint queue.
- **BEGIN_FRAME** `{target, sequence, frame_time, interval_ns}` is sent with a zero
  timeout:
  - only if the endpoint was created with `createEndpoint(true)`, which matches
    the hello key `surface_begin_frames:true`;
  - only to bound targets that are visible **or still awaiting their first
    frame**;
  - `sequence` is strictly increasing per target; gaps from a full host queue are
    allowed.

  CEF's `SendExternalBeginFrame` then produces one frame.
- **`frame_rate` for the hello** comes from
  `nsIAxioEngineSurfaceService.displayRefreshRate`, rounded to 60 or 120.
- **Latency budget.** vsync N → BEGIN_FRAME → CEF raster (host p50
  paint→receive ≈ 1.4 ms, measured by the CEF-host workstream) → our queue
  (copy about 0.2 ms) → ImageBridge → composite at vsync N+1, or N+2 under load.
  This matches Chrome's own pipeline depth.

## 6. Threading model

| Thread | Does |
| --- | --- |
| Main | `createEndpoint`, `expectHostPid`, `takeToken`, `bindElement` (creates the async `ImageContainer`, sets it on the canvas), `setTargetGenerations`, `setTargetVisible`, `unbindTarget`, `close`, listener callbacks (`onConnected`, `onTargetGeometry`, `onClosed`), input helpers |
| Endpoint queue (serial GCD, user-interactive) | All Mach receive and send, validation, `IOSurfaceLookupFromMachPort`, Metal copy, `SetCurrentImages`, composite polling, RELEASE, BEGIN_FRAME. It owns every port right and the target table. It never waits on the main thread. |
| Vsync (CVDisplayLink) | `NotifyVsync` → post one coalesced task to the endpoint queue |
| ImageBridge / compositor (GPU process) | Unchanged Gecko code |

Main → queue is `dispatch_async`. `getTargetStats` is the only `dispatch_sync`, and
the queue never waits on main. Queue → main is `NS_DispatchToMainThread`.

## 7. Input

### 7.1 Principle: Gecko decides the target, native data rides along

- **Routing stays Gecko's.** Gecko's hit testing, pointer capture and focus
  already put Zen overlays above the engine view. Routing native NSEvents by
  element rectangle would steal input from overlays that cover the view (urlbar
  results, glance, dialogs, drag feedback).
- **Transport.** Chrome JS listens on the engine view element and forwards over the
  JSON pipe, which is the contract's control channel. The component adds only what
  DOM events lose:
  - `describeNativeEvent(event)` — native detail while the event is dispatched;
  - `holdKeyEvent` and `finishKeyEvent` — the remote-tab key reply;
  - `setCursor` — keyword-only cursors.

  Moving input to Mach is a later option (§12). It is not needed for correctness.

### 7.2 Keyboard: same reply model as a remote Gecko tab

Gecko behaviour today, for reference:

- Reserved chrome shortcuts are marked during the default-group capture phase
  (`dom/events/GlobalKeyListener.cpp:197-221`, `MarkAsReservedByChrome`).
- XUL `<key>` handlers run in the system-group bubble phase at the window
  (`GlobalKeyListener.cpp:110-141`). They skip default-prevented events
  (`GlobalKeyListener.cpp:90-108`).
- For a real remote tab, the parent stops the event and waits for the child's
  reply (`GlobalKeyListener.cpp:228-253`; `widget/BasicEvents.h:258-303`). The
  reply is re-dispatched to the `<browser>` and then to
  `widget->PostHandleKeyEvent` (`dom/ipc/BrowserParent.cpp:2762-2846`).
- `WillBeSentToRemoteProcess()` is false for our canvas
  (`widget/WidgetEventImpl.cpp:583-597`, `EventStateManager.cpp:2337-2339`).
  Without help, Zen's shortcuts would fire before the page sees the key.

Chrome JS emulates the reply model with a **system-group capture** listener
(`{mozSystemGroup: true, capture: true}`) on the engine view:

1. It calls `holdKeyEvent(event)`. This returns `0` when
   `IsReservedByChrome()` (⌘T, ⌘W, ⌘N, ⌘Q and Zen keys marked `reserved`) or when
   the event is our own reply. The key then proceeds exactly as over a Gecko tab.
2. Otherwise the call returns a ticket. JS calls `event.stopPropagation()`, which
   in the system group stops `GlobalKeyListener` at the window
   (`dom/events/EventDispatcher.cpp:651-693`: the groups reset propagation
   independently). JS does **not** `preventDefault`, so IME and
   `interpretKeyEvents` still run in the widget.
3. JS sends the key to the host. `describeNativeEvent` supplies macOS `keyCode`,
   `characters`, `charactersIgnoringModifiers`, repeat and modifier flags from
   `WidgetKeyboardEvent::mNativeKeyEvent`, which is the NSEvent during dispatch
   (`widget/TextEvents.h:410`, `widget/cocoa/TextInputHandler.mm:1084`). These map
   one-to-one onto CEF `native_key_code`, `character` and `unmodified_character`,
   as in cefclient's macOS OSR.
4. On the host's verdict (CEF `OnPreKeyEvent`/`OnKeyEvent`: not consumed), JS calls
   `finishKeyEvent(ticket, false, view)`. The component re-dispatches a copy
   (`AssignKeyEventData`, `widget/TextEvents.h:786-820`) marked
   `MarkAsHandledInRemoteProcess()` and then calls `PostHandleKeyEvent`, so
   `nsCocoaWindow::PostHandleKeyEvent` (`widget/cocoa/nsCocoaWindow.mm:643-675`)
   finds the NSEvent by `mUniqueId` in ChildView's map
   (`nsCocoaWindow.mm:3386-3393`) for native menu key equivalents.

The result: ⌘L, ⌘F, ⌘R and Zen commands behave exactly as over a Gecko tab. The
page gets first refusal for non-reserved keys, and reserved keys never reach it.
Chrome access keys on the reply path (`BrowserParent.cpp:2819-2831`) are a
follow-up.

### 7.3 IME

- **Why a proxy is needed.** Gecko enables the IME only for a focused editor. The
  mechanism for remote tabs (`ContentCacheInParent`, fed by a `BrowserParent`) is
  not available to us.
- **Proxy editor.** When the host reports a focused editable (text input state,
  caret bounds), chrome JS focuses a transparent, `aria-hidden` `<textarea>` inside
  the engine view.
  - It is positioned at the host caret rectangle, with the host's font size, so
    `firstRectForCharacterRange` / `eQueryTextRect` place the candidate window
    correctly.
  - For password fields it becomes `<input type=password>`, so macOS secure event
    input turns on, as it would for a Gecko password field.
- **Composition flow.** Gecko's `TextInputHandler` drives the real macOS IME
  against it. JS forwards `compositionstart`, `compositionupdate` and
  `compositionend` (text plus clause ranges, from `WidgetCompositionEvent::mRanges`
  if needed through a later helper) to CEF `ImeSetComposition`, `ImeCommitText`
  and `ImeFinishComposingText`. After commit the proxy value is cleared.
- **Plain keys.** Their keypress is stopped by the §7.2 listener, so the proxy stays
  empty; text reaches CEF as CHAR events.
- **Why not the alternative.** Replacing ChildView's `NSTextInputClient` for the
  engine rectangle needs an invasive widget patch and breaks when overlays cover
  the view.

### 7.4 Wheel, trackpad phases, momentum, pinch

- **What the DOM loses.** In ChildView, precise and phased scrolling becomes
  `PanGestureInput` and goes through APZ (`nsCocoaWindow.mm:2806-2923,1499-1560`).
  The chrome document receives `WidgetWheelEvent`s that keep only `mIsMomentum`
  and `mMayHaveMomentum` (`widget/MouseEvents.h:913,915`). Delta multipliers are
  applied, and there is no begin/end phase.
- **What happens to pinch.** It is `PinchGestureInput` → a ctrl+wheel
  `WidgetWheelEvent` (`nsCocoaWindow.mm:2150-2221`,
  `widget/InputData.cpp:676-695`).
- **Side channel.** The service installs an
  `NSEvent addLocalMonitorForEventsMatchingMask:(ScrollWheel|Magnify)`. It is
  observe-only and returns the event unchanged. It records `phase`,
  `momentumPhase`, `scrollingDeltaX/Y`, `hasPreciseScrollingDeltas`,
  `isDirectionInvertedFromDevice` and `magnification`, keyed by
  `nsCocoaUtils::GetEventTimeStamp([event timestamp])`.
- **Correlation.** The DOM wheel event has the identical `mTimeStamp`
  (`InputData.cpp:563,943`, `nsCocoaUtils.mm:1163-1177`).
  `describeNativeEvent(wheelEvent)` returns the native values, so the host can
  build phase-correct Chromium wheel events (rubber-banding, fling) and pinch.
- **Stop Gecko acting on the wheel.** JS `preventDefault`s the wheel event on the
  view. That stops ESM scrolling of ancestors and the history-swipe start
  (`MayStartSwipeForAPZ`, `nsCocoaWindow.mm:1523`). Swipe navigation for
  Chromium tabs is then driven by the host's overscroll result (follow-up).
- **Host-side limitation.** CEF's public `SendMouseWheelEvent` has no phase or
  momentum fields (host workstream risk). We deliver the data regardless.

### 7.5 Mouse, pointer, cursor, drag and drop

- **Mouse and pointer.** Pointer events on the canvas are forwarded in
  element-local CSS pixels. `pointerdown` does `setPointerCapture`, so drags that
  leave the view keep flowing. `describeNativeEvent` gives `clickCount`
  (`MouseEvents.h:508`, the native count), pressure and input source. The
  canvas gets `tabindex=-1` and focus on mousedown; focus and blur go to the host.
- **Cursor.** The contract sends `cursor` as a CSS keyword on the pipe.
  `setCursor(element, keyword)` accepts only CSS keyword cursors, never `url()`,
  and sets the inline style. Gecko's ESM shows it on the next mouse move, which is
  when CEF changes the cursor anyway.
- **Drop into the page.** DOM `dragenter`, `dragover` and `drop` on the canvas are
  converted from `DataTransfer` to CEF drag data (text, URL, HTML, files). The
  last operation reported asynchronously by the host answers `dragover`
  synchronously, which is Chromium's own model.
- **Drag out of the page.** Host `StartDragging` → chrome JS calls
  `nsIDragService.invokeDragSession` while the button is still down. Gecko allows
  this between `mouseDown:` and `mouseUp:` (`widget/cocoa/nsDragService.mm:186-205`,
  `gLastDragView`), then `beginDraggingSessionWithItems` (`nsDragService.mm:289`).

## 8. XPCOM API (`nsIAxioEngineSurfaceService.idl`)

Contract `@axiosozo.nl/engine-surface-service;1`. It is a singleton,
`ProcessSelector.MAIN_PROCESS_ONLY`, and `builtinclass`, so JS cannot implement it.

```
nsIAxioEngineSurfaceService
  nsIAxioEngineEndpoint createEndpoint(in boolean externalBeginFrames);
  readonly attribute double displayRefreshRate;
  void setCursor(in Element element, in ACString cssKeyword);
  jsval describeNativeEvent(in Event event);           // [implicit_jscontext]
  unsigned long holdKeyEvent(in Event keyEvent);        // 0 = chrome owns it
  void finishKeyEvent(in unsigned long ticket, in boolean consumedByEngine,
                      in Element target);               // [can_run_script]
nsIAxioEngineEndpoint
  readonly attribute ACString serviceName;
  ACString takeToken();                 // once
  void expectHostPid(in long pid);      // must be our direct child
  readonly attribute unsigned long state; readonly attribute boolean externalBeginFrames;
  attribute nsIAxioEngineEndpointListener listener;
  void bindElement(in Element canvas, in unsigned long long targetId,
                   in unsigned long long documentGeneration,
                   in unsigned long long navigationGeneration);
  void setTargetGenerations(in unsigned long long targetId, in unsigned long long doc,
                            in unsigned long long nav);
  void unbindTarget(in unsigned long long targetId);
  void setTargetVisible(in unsigned long long targetId, in boolean visible);
  jsval getTargetStats(in unsigned long long targetId);
  void close();
nsIAxioEngineEndpointListener
  void onConnected(in long hostPid);
  void onTargetGeometry(in unsigned long long targetId, in unsigned long width,
                        in unsigned long height, in unsigned long logicalWidth,
                        in unsigned long logicalHeight, in double scale);
  void onClosed(in ACString reason);
```

Chrome JS flow for the `CEFPresenter` successor (Zen workstream):

1. `ep = svc.createEndpoint(beginFrames)`.
2. `proc = await Subprocess.call(...)`.
3. `ep.expectHostPid(proc.pid)`.
4. Write the hello with `surface_service: ep.serviceName`,
   `surface_token: ep.takeToken()`, `surface_begin_frames`, and
   `frame_rate: svc.displayRefreshRate >= 100 ? 120 : 60`.
5. On `created`, call `ep.bindElement(canvas, BigInt(native_target_id), doc, nav)`.
   The canvas has `moz-opaque`, `object-fit: none; object-position: 0 0`, and
   100 % size.
6. On generation changes, call `setTargetGenerations`.
7. On tab selection, split view or glance, call `setTargetVisible`.
8. On `onTargetGeometry`, set `canvas.width` and `canvas.height` to the logical
   size.

Never send a JSON `frame_ack` in surface mode. The ready event must report
`render_path:"native-osr-iosurface"`.

**Subprocess confirmation.** `Subprocess.call` spawns in the Firefox parent process
itself:

- A `ChromeWorker` thread (`toolkit/modules/subprocess/subprocess_common.sys.mjs:32,632-640`)
  calls `IOUtils.launchProcess` (`subprocess_unix.worker.js:398`).
- That calls `base::LaunchApp` (`xpcom/ioutils/IOUtils.cpp:3152`), which calls
  `posix_spawnp` in-process (`ipc/chromium/src/base/process_util_mac.mm:147`).
- The `disclaim` option only changes TCC responsibility
  (`process_util_mac.mm:120-124`), not the parent.

So the host's `getppid()` is the parent process, which is also the sender of
CONNECTED. No fix is needed. Do not wrap the host in a launcher, shell or `open`.

## 9. Gecko patch hunks

These records are in `patches/zen/firefox-native.json` (added 2026-09-30).
`zen.py setup` applies them with `apply_records` after the Zen import; the before
hashes are of the clean pinned tree and were re-verified against the staged
engine, and the after hashes match an exact application.

```json
[
  {
    "path": "dom/html/HTMLCanvasElement.h",
    "before_sha256": "569330173da9cd7dd075574f18902c36a1214b3c5023814829cb0496a6a64424",
    "after_sha256": "0558abb0c6619b5ab4e5974c8880709967c248014c4c7bb42efc68951eb05658",
    "replacements": [
      [
        "  layers::ImageContainer* GetImageContainer() const { return mImageContainer; }\n",
        "  layers::ImageContainer* GetImageContainer() const { return mImageContainer; }\n\n  // AxioSozo engine-view. Parent-process chrome documents only: an async\n  // ImageContainer fed off the main thread by an out-of-process engine. When\n  // set, nsDisplayCanvas presents it instead of any context output.\n  void SetAxioExternalImageContainer(layers::ImageContainer* aContainer);\n  layers::ImageContainer* GetAxioExternalImageContainer() const {\n    return mAxioExternalImageContainer;\n  }\n"
      ],
      [
        "  RefPtr<layers::ImageContainer> mImageContainer;\n",
        "  RefPtr<layers::ImageContainer> mImageContainer;\n  RefPtr<layers::ImageContainer> mAxioExternalImageContainer;\n"
      ]
    ]
  },
  {
    "path": "dom/html/HTMLCanvasElement.cpp",
    "before_sha256": "8f7ecc111e5b3655c6ce252ad01bb6837d80b511051b27d4d0a36a6097ef57cd",
    "after_sha256": "8e35312b979d10e2bc120ecccf8f858504d99f634e219915aac5f8b2cc18cd48",
    "replacements": [
      [
        "void HTMLCanvasElement::FlushOffscreenCanvas() {\n",
        "void HTMLCanvasElement::SetAxioExternalImageContainer(\n    layers::ImageContainer* aContainer) {\n  MOZ_RELEASE_ASSERT(NS_IsMainThread());\n  MOZ_RELEASE_ASSERT(nsContentUtils::IsChromeDoc(OwnerDoc()));\n  MOZ_RELEASE_ASSERT(!aContainer || aContainer->IsAsync());\n  if (mAxioExternalImageContainer == aContainer) {\n    return;\n  }\n  mAxioExternalImageContainer = aContainer;\n  InvalidateCanvas();\n}\n\nvoid HTMLCanvasElement::FlushOffscreenCanvas() {\n"
      ]
    ]
  },
  {
    "path": "layout/generic/nsHTMLCanvasFrame.cpp",
    "before_sha256": "75ea40a6cb7c28bec6c8d906692ad6c47a5c468994364c1999ce6c12436937b8",
    "after_sha256": "cfe5555dfffce174a4705e8826e0737e7632cdbd2d1994ab3cfa8411828840e0",
    "replacements": [
      [
        "    element->HandlePrintCallback(mFrame->PresContext());\n\n    if (element->IsOffscreen()) {\n",
        "    element->HandlePrintCallback(mFrame->PresContext());\n\n    if (RefPtr<ImageContainer> external =\n            element->GetAxioExternalImageContainer()) {\n      // AxioSozo engine-view: frames reach the compositor through the\n      // ImageBridge without the main thread. This only (re)registers the\n      // async image pipeline for the element's current geometry.\n      auto* canvasFrame = static_cast<nsHTMLCanvasFrame*>(mFrame);\n      nsRect dest = canvasFrame->GetDestRect(\n          mFrame->GetContentRectRelativeToSelf() + ToReferenceFrame());\n      LayoutDeviceRect bounds = LayoutDeviceRect::FromAppUnits(\n          dest, mFrame->PresContext()->AppUnitsPerDevPixel());\n      aManager->CommandBuilder().PushImage(this, external, aBuilder,\n                                           aResources, aSc, bounds, bounds);\n      return true;\n    }\n\n    if (element->IsOffscreen()) {\n"
      ]
    ]
  }
]
```

Where the hunks land:

- `HTMLCanvasElement.h:361` (after `GetImageContainer`) and `:376` (member).
- `HTMLCanvasElement.cpp:1281` (before `FlushOffscreenCanvas`).
  `InvalidateCanvas()` (`.h:206`) rebuilds the item once per bind or unbind.
  `ImageContainer` is complete there through `OffscreenCanvasDisplayHelper.h`.
- `nsHTMLCanvasFrame.cpp:95-97`: the external container is checked before the
  offscreen path. `GetOpaqueRegion` keeps using `moz-opaque` through
  `GetIsOpaque()` → `GetOpaqueAttr()` (`HTMLCanvasElement.cpp:1376-1384`).

Deliberately not patched:

- `nsDisplayCanvas::Paint` (`nsHTMLCanvasFrame.cpp:219`). Snapshot and print
  fallback paths (`drawSnapshot`, `PageThumbs`) will show an empty canvas.
- A later optional hunk could return the container's current image from
  `HTMLCanvasElement::GetAsImage` (`HTMLCanvasElement.cpp:1396`) for chrome
  snapshots, using CPU readback.

Build wiring is owned by the mirror-route agent:

- `src/zen/moz.build` `DIRS += ["axiosozo-native"]`;
- `src/zen/axiosozo-native/moz.build` `DIRS += ["engine-view"]`.

libbsm is already linked by `ipc/glue/moz.build:291`. Metal is already linked by
`toolkit/library/moz.build:217`.

## 10. Accessibility (design only)

Two attachment points:

1. **Gecko's accessible tree (long-term, cross-platform).**
   - The engine view becomes an `OuterDoc`-like accessible
     (`accessible/mac/MOXOuterDoc.h`) whose child document is fed from the host's
     AX tree.
   - CEF OSR exposes `CefAccessibilityHandler::OnAccessibilityTreeChange` and
     `OnAccessibilityLocationChange`. Those updates would be translated into
     Gecko's `RemoteAccessible` cache model (`DocAccessibleParent`) without a
     `BrowserParent`.
   - This gives VoiceOver, Windows UIA/IA2 and ATK, and the devtools
     accessibility inspector one tree. Hit testing already flows through
     `ChildAtPoint` (`accessible/mac/mozAccessible.mm:231-258`).
   - Cost: a new accessible class plus a synthetic `DocAccessibleParent`. That is
     a sizeable Gecko patch.
2. **NSAccessibility splice (macOS v1).**
   - The component builds lightweight `NSAccessibilityElement` objects from the
     same CEF AX updates. It owns them on the main thread and positions them in
     screen coordinates from the canvas bounds plus the AX locations.
   - A small hunk in `mozAccessible moxChildren` (`mozAccessible.mm:295-314`) and
     `moxHitTest` (`:231-258`) returns them as children of the canvas's
     accessible when the canvas carries an engine view.
   - Actions (press, focus, set value) go to the host over the pipe.
   - `NSAccessibilityRemoteUIElement` (private, as used by Chromium RemoteCocoa and
     WebKit) is not usable: in OSR mode Chromium has no native
     `BrowserAccessibilityCocoa` tree.

Both options:

- enable renderer accessibility in CEF only while an AT is active. The parent knows
  this from the `a11y-init-or-shutdown` observer topic. It avoids the cost of
  `--force-renderer-accessibility`;
- keep the canvas `role="document"`, with the page title as its label, until the
  tree attaches.

## 11. Security

- **Parent process only.** `MAIN_PROCESS_ONLY` component; `Create()`
  `MOZ_RELEASE_ASSERT`s `XRE_IsParentProcess()`; the canvas hook release-asserts a
  chrome document. No content-reachable API changes.
- **Name and token.**
  - The service name and token go only to chrome JS, which writes them only into
    the authenticated stdin hello.
  - `takeToken()` works once.
  - The 256-bit token comes from the OS CSPRNG, is compared in constant time, is
    single-use, and is wiped after acceptance or close.
- **Peer identity.**
  - The kernel audit-trailer pid must be the registered pid, `host_pid`, and a
    direct child of this process (`proc_pidinfo`).
  - Third-party CONNECTs are destroyed silently, so they cannot close the
    endpoint.
  - FRAMEs from any pid other than the host are destroyed.
- **Port lifetime.**
  - The receive right lives until `close()`, host death (dead-name notification),
    a protocol error or `xpcom-will-shutdown`. The cancel handler then destroys it,
    which kills the bootstrap name.
  - Every IOSurface send right is deallocated on every path.
  - Unknown messages have `mach_msg_destroy` applied. The host reply right is
    deallocated on close.
- **Surface validation.**
  - Exact message size and descriptor shape.
  - 1..4096 px per dimension.
  - `'BGRA'`, 1 plane, 4 bytes/element, row and alloc size, ID equals metadata,
    format 1 (BGRA8 premultiplied sRGB).
  - At most 32 targets. At most 3 host frames per target (host-enforced; ours is
    structurally bounded: 1 held plus 2 pinned).
  - The component never maps host pixels on the CPU. The copy is GPU-to-GPU.
- **Generation hold.** Stale frames are never shown. Future-generation frames
  wait for chrome, so there is no content-before-URL window.
- **Input.** Cursors are keywords only. `finishKeyEvent` targets must be in a
  chrome document. `describeNativeEvent` requires trusted events and only reads
  NSEvent data during dispatch.
- **Unchanged:** sandboxing, TLS, profiles and extensions. Chromium helpers
  cannot reach the port (contract §Security).

## 12. Test plan

### Unit and integration (no build needed to write them; they run once built)

- **Registration smoke (exists, passes).** `apps/browser/native/engine-view/tests/run_smoke.py`
  runs `xpcshell_smoke.js` in the built app's `-xpcshell` mode (parent process, no
  profile, throwaway HOME). It checks: the contract is registered and is a
  singleton; `createEndpoint(false/true)`; the service name and token shape;
  `takeToken` once; `expectHostPid` rejects pid 1 and our own pid and accepts a
  real `Subprocess` child once; `bindElement`/`getTargetStats`/`unbindTarget`
  with a plain JS Number target id on a canvas in a system-principal document;
  `displayRefreshRate`; `close()` reaches CLOSED and calls `onClosed("closed")`.
- **xpcshell, parent** (`apps/browser/native/engine-view/tests/`, still to add):
  - `createEndpoint` returns a `dev.axiosozo.surface.*` name, and `takeToken`
    works once;
  - `expectHostPid` rejects pids that are not children;
  - `setCursor` rejects `url(...)`;
  - `describeNativeEvent` on a synthetic untrusted event → null.
- **Native test receiver.** Run the host's
  `native/chromium-host/tests/surface_receiver.mm` scenarios against Zen's
  endpoint instead, using a tiny test-only host binary that sends:
  - a bad token, a wrong pid, and a second CONNECT → all ignored;
  - a malformed FRAME, a 4097 px surface, and a non-BGRA surface → closed or
    released;
  - a stale generation → released, never presented;
  - a future generation → held until `setTargetGenerations`;
  - host kill → `onClosed("host-died")`.
- **Mochitest-browser (chrome):**
  - bind a canvas, feed frames, assert `getTargetStats`: `presented`, `composited`
    rising, `released == presented - 1` at rest, `forcedReleases == 0`;
  - `setTargetVisible(false)` stops `beginFramesSent`;
  - unbind releases everything.
- **Reftest-like pixel check.** A known solid-colour IOSurface frame appears under
  a rounded `overflow:clip` parent with the corners clipped; a later sibling at
  z-index 1 covers it (`drawSnapshot` of chrome cannot show it, see §9; use
  `screencapture`).
- **Key reply.** Synthesize ⌘T (reserved → new tab, `holdKeyEvent` returns 0);
  ⌘L with the host reporting not consumed (the urlbar focuses after
  `finishKeyEvent`); ⌘L with the host consuming it (no urlbar focus).

### Real macOS E1 checks (required before any READY claim; evidence from actual runs)

1. **120 Hz.** On ProMotion, `displayRefreshRate ≈ 120`, and scrolling a long page
   keeps `composited` increasing at about 120 Hz. Use the profiler
   (`ASYNC_IMAGE` composites) and the `Quartz Debug` frame meter.
2. **60 Hz.** The same on an external 60 Hz display, after dragging the window
   across.
3. **Z-order.** A screenshot for each: urlbar results open over a Chromium tab;
   glance opened from and over a Chromium tab; split view with Gecko and Chromium
   side by side, both with rounded corners; a tab-modal prompt drawn by Zen over a
   Chromium tab; the sidebar and compact-mode hover animation over a Chromium tab.
4. **Copy mode vs zero-copy.** About:support failure log has no
   `"Failed to look up MacIOSurface"`. `lastCopyNs` is under 0.5 ms at 4K. After
   the contract amendment, `copied == 0` and the promoted CALayer is visible in
   `Quartz Debug` (colour flash).
5. **IME.** Japanese Kotoeri and Pinyin in a Chromium `<input>`: candidate window
   at the caret; commit; secure input in a password field (Keychain Access or
   `ioreg` shows secure input on).
6. **Trackpad.** Momentum scroll with rubber-band in a Chromium page; pinch-zoom;
   two-finger back swipe is not stolen by the underlying Gecko browser.
7. **Keyboard parity.** Every Zen shortcut in `zen-keyboard-shortcuts`, run over a
   Gecko tab and over a Chromium tab, with identical outcomes, except page-first
   keys the page consumed.
8. **Lifecycle.** Kill the host with `kill -9`: `onClosed("host-died")`, and the
   canvas is cleared. Terminate the GPU process from about:support: frames resume
   after the compositor restarts.
9. **Security.** A second process connecting with the right name and a wrong
   token, and a non-child process with the right token: both are ignored (logs
   under `MOZ_LOG=AxioEngineView:5`).

## 13. Open risks

- **Compiled, not yet exercised with frames.** The component builds with
  `-Werror` and links into XUL (two include fixes: `<mach/mach_time.h>`,
  `mozilla/dom/DocumentInlines.h`). The Mach frame path, the Metal copier and the
  key reply have not run yet. `[can_run_script]` static analysis on
  `finishKeyEvent` is unchecked: the dev build does not enable the clang plugin.
- **Global IOSurfaces.** Zero-copy is the default since E2 (host sets
  `kIOSurfaceIsGlobal` and flag bit 1). Global surfaces are readable by any
  same-user process that learns or guesses the ID, the same exposure as Firefox's
  own video and canvas; copy mode only moves it to Zen's own global copies.
- **Use-count semantics.** Release timing relies on `IOSurfaceIsInUse` covering
  GPU-process lookups and CALayer use. A 1 s cap (`forcedReleases`) prevents
  stalls. E1 must show `forcedReleases == 0`.
- **GPU-process restart.** `ImageContainer::EnsureImageClient` re-creates the
  client (`ImageContainer.cpp:153-178`). The display item must re-register the
  pipeline after the layer manager is recreated. This needs an E1 check.
- **IME proxy fidelity.** Candidate-window geometry depends on the host's caret
  and font metrics. Clause attributes need a helper that exposes
  `WidgetCompositionEvent::mRanges`.
- **CEF API gaps** (host side): no wheel phases or momentum, no pinch in
  `SendMouseWheelEvent`; accessibility only through `CefAccessibilityHandler`.
- **Snapshots.** Chrome-side snapshots (Zen tab previews, `drawSnapshot`) show an
  empty canvas until the optional `GetAsImage` hunk or host-provided thumbnails
  exist.
- **Dirty rects** are not used. The copy is a full blit and the compositor damage
  covers the whole canvas. This is acceptable at the measured cost; a per-slot
  dirty-region copy is a follow-up.
- **Timestamp correlation** for wheel and pinch assumes APZ keeps the NSEvent
  `TimeStamp` (it does today, `InputData.cpp:563,943`). Coalesced events fall back
  to DOM deltas.

## 14. JS presenter integration

Status: implemented in `apps/browser/chrome/CEFEngineAdapter.sys.mjs` and
`CEFPresenter.sys.mjs`, covered only by Node tests with a fake service and endpoint
(`apps/browser/tests/engine-surface.test.mjs`). It has not run inside Zen. This is
not E1/E2 evidence.

- **Selection.** `launchHost` looks up `@axiosozo.nl/engine-surface-service;1`. If
  the lookup works, it calls `createEndpoint(true)` before spawning the host. If
  there is no component, or `createEndpoint` throws, the host runs the **BGRA pipe
  fallback**. The fallback is logged as `AXIOSOZO_CEF_RENDER_PATH` and reported
  in `diagnostics()` (`renderPath`, `pipeFallback`). Fixture and web hosts both
  prefer surface mode.
- **Hello and ready.** The order is `expectHostPid(proc.pid)`, then
  `takeToken()`, then the hello write. The hello carries `surface_service`,
  `surface_token`, `surface_begin_frames:true` and
  `frame_rate = displayRefreshRate >= 100 ? 120 : 60`.
  - `ready` must report `native-osr-iosurface`, `surface:true`, a matching
    `external_begin_frame` and a matching `frame_rate`. Anything else is
    `UNVERIFIED_CEF_RUNTIME`.
  - In surface mode a kind-2 AXCF packet is `UNEXPECTED_CEF_FRAME` and ends the
    host.
  - `frame_ack` is never written.
- **Target ids.** `native_target_id` is passed to XPCOM as a JS Number. It must be
  a safe integer; BigInt is not used.
- **Binding.** On `created`, the adapter calls `bindElement(canvas, id, doc, nav)`
  with the created generations. `create()` resolves only after two things: the
  first `onTargetGeometry` for the target, and an accepted `load`. This matches the
  pipe path's "loaded and a live frame" rule.
- **Generation confirmation.** `setTargetGenerations` is called after chrome has
  handled a `load` event that makes the current generation presentable (the same
  `#loaded` rule as the pipe). Frames of a newer generation stay held until chrome
  has processed that document's `url` and `load` events. After a failed load they
  are never confirmed.
- **Canvas.** It has `moz-opaque`, `object-fit:none` and `object-position:0 0`.
  `onTargetGeometry` sets the canvas `width` and `height` to the logical size. No
  context is ever created. `captureFixtureFrame()` throws
  `CEF_SURFACE_CAPTURE_UNAVAILABLE`; evidence must use screencapture.
- **Visibility.** On tab select, window hide and navigation, the adapter calls
  `setTargetVisible` first and then sends the pipe `visibility`. In fixture
  sessions only `setTargetVisible` is sent.
- **Resize.** There is no 32 MiB cap. The only bound is 4096 px per dimension,
  with the scale stepped down in quarters above that. A `(resolution: Ndppx)`
  media query re-runs resize when the window moves between displays. If the host
  still enforces the pipe cap (`unsupported surface_limit`, which is the pinned
  `fitsSurface`), the presenter retries once with the capped fit and shows the
  existing scale notice.
- **Teardown.**
  - Every host failure (exit, crash, protocol error) and every shutdown calls
    `endpoint.close()`.
  - `onClosed` with any reason other than our own close ends the host as
    `CEF_SURFACE_CLOSED`.
  - A closing target calls `unbindTarget`.
- **Keys (§7.2).** A `{capture, mozSystemGroup}` listener on the engine view
  handles `keydown`, `keypress` and `keyup`.
  - Order: `holdKeyEvent`, then `stopPropagation`, then `preventDefault` (on
    keypress only), then forward the key.
  - Keypress sends a `char` and shares its keydown's verdict. Keyup does the same.
  - Unconsumed keys are handed back with `finishKeyEvent(ticket, false, canvas)`
    after the current dispatch.
  - Consumed keys are released at once.
  - Composition, `Process` and `Dead` keys are left to the widget.
  - The native `keyCode` from `describeNativeEvent` replaces the static table.
  - Full page-first routing needs the host capability `key_verdict`. Without it,
    the old shortcut heuristic decides first and every non-⌘ chord is treated as
    consumed.
- **IME (§7.3).** This is active only when the host reports `ime:true`. Host
  `text_input {mode, caret_x, caret_y, caret_width, caret_height}` events drive
  the proxy editor:
  - it is a transparent `<textarea>`, or `<input type=password>` for password
    fields;
  - it is placed at the caret, and it takes focus only while the view already has
    it.
  - Composition events map to `ime_set_composition`, `ime_commit_text` and
    `ime_cancel_composition`. Keyless `insertText` input (dictation, the character
    viewer) maps to `ime_commit_text`.
  - Blur during a composition sends `ime_finish_composing`.
- **Wheel and pinch (§7.4).** Wheel deltas, and pinch magnification, are summed
  per animation frame. A change of phase or modifiers flushes the sum first, and
  so do button events.
  - For precise events, native `scrollingDelta` is used instead of the DOM delta.
  - `phase`, `momentum_phase` and `precise` are sent only with the host
    capability `wheel_phases`. `pinch {x, y, modifiers, phase, magnification}` is
    sent only with `pinch`.
  - Pointer moves stay coalesced per frame, because input still crosses the JSON
    pipe.
- **Mouse and cursor.** `describeNativeEvent().clickCount` replaces the derived
  click count. Host `cursor` events go through `setCursor`; JS never writes cursor
  CSS in surface mode.
- **Focus.** Each Chromium tab's `<browser>` gets its own `focus()`, which moves
  focus to the proxy editor or the canvas. This covers
  `gBrowser.selectedBrowser.focus()` from urlbar Escape and close
  (`UrlbarInputBase.mjs`, `UrlbarChildController.mjs`) and from tab switches. It
  is removed when the tab returns to Gecko. `focusin` and `focusout` on the view
  report page focus. Moving between the canvas and the proxy editor is not a blur.
