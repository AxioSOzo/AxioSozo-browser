### gecko-debian raf-nosampler (profile pass)

**parent pid 8214** — 463 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 251 | 8.3 | Graphics 158, Idle 90, Other 3 | 0 / 0 / 251 | ipc 246, webrender_render 159, webrender_sw_raster 129, poll_wait 91 |
| WRRenderBackend#0 | 56 | 1.8 | Other 56 | 0 / 0 / 56 | memcpy_memset 1, webrender_render 0 |
| GeckoMain | 43 | 1.4 | GC / CC 27, Idle 11, Other 2, JavaScript 1 | 0 / 2 / 41 | ipc 43, gc_cc 30, poll_wait 13, harness_diagnostics 2 |
| WRSceneBuilder#0 | 41 | 1.4 | Other 41 | 0 / 0 / 41 | webrender_scene 41, webrender_render 2, memcpy_memset 0, paint_layout 0 |
| Compositor | 38 | 1.3 | Idle 36, Other 2 | 0 / 0 / 38 | ipc 38, poll_wait 36, paint_layout 1, webrender_scene 0 |
| SwComposite | 16 | 0.5 | Other 16 | 0 / 0 / 16 | webrender_render 16, poll_wait 15, webrender_sw_raster 1, memcpy_memset 1 |
| IPC I/O Parent | 8 | 0.3 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, char const*` 2; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 2; `bool ArrayJoinKernel<js::array_join(JSContext*, unsigned int, JS::Valu` 1; `mprotect [libc.so.6]` 1

**tab pid 8469** — 158 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 144 | 4.8 | Idle 100, Graphics 15, Layout 11, Profiler 7 | 0 / 4 / 140 | ipc 135, poll_wait 101, paint_layout 35, gc_cc 4 |
| IPC I/O Child | 13 | 0.4 | Idle 13, Other 0 | 0 / 0 / 13 | poll_wait 13, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 3; `__lll_lock_wait [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 8400** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0

**tab pid 8552** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `mprotect [libc.so.6]` 0

