### chromium-2x switch-to-gecko (profile pass)

**parent pid 3314** — 150 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 54 | 0.4 | Idle 20, JavaScript 10, Layout 9, Other 5 | 2 / 18 / 34 | ipc 54, poll_wait 21, paint_layout 14, gc_cc 8 |
| DOM Worker | 50 | 0.3 | GC / CC 27, Other 17, JavaScript 5, Idle 1 | 0 / 0 / 50 | subprocess_pipe_io 50, worker_messaging 50, ipc 50, gc_cc 44 |
| Renderer | 23 | 0.2 | Graphics 22, Idle 1 | 0 / 0 / 23 | ipc 23, webrender_render 22, webrender_sw_raster 19, canvas_2d 3 |
| BgIOThreadPool #1 | 6 | 0.0 | Other 6, Idle 0 | 0 / 0 / 6 | ipc 6, poll_wait 0 |
| IPC I/O Parent | 4 | 0.0 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0 |
| Compositor | 3 | 0.0 | Idle 2, Other 2 | 0 / 0 / 3 | ipc 3, poll_wait 2, memcpy_memset 0 |
| SwComposite | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 21; `madvise [libc.so.6]` 3; `[axiosozo-dev]` 2; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit::CacheIRW` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 1; `nsImageFrame::QueryFrame(nsQueryFrame::FrameIID) const [libxul.so]` 1; `mozilla::ScrollSnapUtils::GetSnapPointForResnap(mozilla::ScrollSnapInf` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 4010** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Layout 1, Other 0, Graphics 0 | 0 / 0 / 4 | ipc 3, poll_wait 3, paint_layout 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedPropMap*>, js::I` 0; `mozilla::dom::Document::CollectDescendantDocuments(nsTArray<RefPtr<moz` 0; `mozilla::PresShell::GetRootScrollContainerFrame() const [libxul.so]` 0; `[]` 0; `nsSHistory::AddRef() [libxul.so]` 0; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0

**tab pid 3459** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.0 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `[]` 0

**tab pid 3498** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.0 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `sendmsg [libc.so.6]` 0

