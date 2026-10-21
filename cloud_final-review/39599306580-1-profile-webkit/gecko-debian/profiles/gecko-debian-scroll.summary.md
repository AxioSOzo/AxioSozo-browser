### gecko-debian scroll (profile pass)

**parent pid 8168** — 1050 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 685 | 33.2 | Graphics 622, Idle 62, Other 1 | 0 / 0 / 685 | ipc 675, webrender_render 623, webrender_sw_raster 584, poll_wait 66 |
| GeckoMain | 162 | 7.9 | Idle 78, GC / CC 36, Other 18, Graphics 11 | 1 / 9 / 152 | ipc 158, poll_wait 100, gc_cc 42, paint_layout 15 |
| WRRenderBackend#0 | 85 | 4.1 | Other 85 | 0 / 0 / 85 | webrender_render 2, poll_wait 2 |
| SwComposite | 44 | 2.1 | Other 44 | 0 / 0 / 44 | webrender_render 44, poll_wait 42, memcpy_memset 2, webrender_sw_raster 2 |
| Compositor | 34 | 1.6 | Idle 33, Other 1 | 0 / 0 / 34 | ipc 34, poll_wait 33, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 24 | 1.2 | Other 24, Profiler 0 | 0 / 0 / 24 | webrender_scene 24, webrender_render 2, paint_layout 0 |
| IPC I/O Parent | 10 | 0.5 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 2 | 0.1 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 80; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `nsWindowRoot::cycleCollection::TraceWrapper(void*, TraceCallbacks cons` 5; `[linux-vdso.so.1]` 5; `[axiosozo-dev]` 3; `mozilla::DisplayPortUtils::MaybeCreateDisplayPortInFirstScrollFrameEnc` 3; `js::jit::JitActivation::~JitActivation() [libxul.so]` 2

**tab pid 8417** — 141 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 122 | 5.9 | Idle 72, Graphics 22, Other 11, GC / CC 7 | 0 / 4 / 118 | ipc 116, poll_wait 75, paint_layout 28, gc_cc 9 |
| IPC I/O Child | 17 | 0.8 | Idle 17, Other 0 | 0 / 0 / 17 | poll_wait 17, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 75; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 4; `[]` 2; `webrender_api::display_list::AuGrid::rect [libxul.so]` 1; `wr_dp_push_text [libxul.so]` 1; `nsTimer::Cancel() [libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1; `js::jit::CacheRegisterAllocator::restoreInputState(js::jit::MacroAssem` 1

**tab pid 8358** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

**tab pid 8507** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

