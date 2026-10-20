### webkit raf (profile pass)

**parent pid 7188** — 2000 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 935 | 30.2 | JavaScript 295, Idle 282, DOM 108, GC / CC 99 | 125 / 341 / 469 | ipc 928, poll_wait 305, gc_cc 274, paint_layout 257 |
| DOM Worker | 440 | 14.2 | JavaScript 410, Other 15, Profiler 12, GC / CC 3 | 0 / 0 / 440 | subprocess_pipe_io 440, worker_messaging 439, ipc 439, js_ctypes 348 |
| Renderer | 278 | 9.0 | Idle 163, Graphics 114, Other 1 | 0 / 0 / 278 | ipc 278, poll_wait 172, webrender_render 114, webrender_sw_raster 98 |
| SwComposite | 219 | 7.1 | Other 219 | 0 / 0 / 219 | webrender_render 219, poll_wait 149, webrender_sw_raster 68, memcpy_memset 11 |
| WRRenderBackend#0 | 56 | 1.8 | Other 56 | 0 / 0 / 56 | webrender_render 1, memcpy_memset 1, poll_wait 1, array_buffer_copy 0 |
| Compositor | 37 | 1.2 | Idle 36, Other 1, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 36, webrender_render 0, memcpy_memset 0 |
| Timer | 23 | 0.7 | Other 23, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23 |
| WRSceneBuilder#0 | 11 | 0.4 | Other 11 | 0 / 0 / 11 | webrender_scene 11, webrender_render 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 307; `__memmove_evex_unaligned_erms [libc.so.6]` 118; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 109; `[unknown]` 40; `[axiosozo-dev]` 21; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 20; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned char const*, ` 20; `__memset_evex_unaligned_erms [libc.so.6]` 13

**tab pid 7731** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 3, Idle 2, Other 0 | 0 / 0 / 6 | ipc 6, gc_cc 3, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `js::NestedIterator<js::gc::SweepGroupZonesIter, js::NestedIterator<js:` 1; `js::gc::GCRuntime::collect(bool, JS::SliceBudget const&, JS::GCReason)` 0; `nsTimerImpl::CancelImpl(bool) [libxul.so]` 0

**tab pid 7345** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::TaskController::ExecuteNextTaskOnlyMainThreadInternal(mozilla` 0

**tab pid 7367** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0

