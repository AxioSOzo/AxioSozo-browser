### chromium scroll (profile pass)

**parent pid 4064** — 3847 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1914 | 11.1 | Idle 718, JavaScript 565, Other 297, GC / CC 180 | 193 / 515 / 1206 | ipc 1912, poll_wait 872, worker_messaging 559, gc_cc 531 |
| DOM Worker | 1442 | 8.4 | JavaScript 1298, Other 96, GC / CC 29, Profiler 19 | 0 / 0 / 1442 | subprocess_pipe_io 1442, worker_messaging 1441, ipc 1441, js_ctypes 1104 |
| Renderer | 153 | 0.9 | Idle 106, Graphics 47 | 0 / 0 / 153 | ipc 153, poll_wait 109, webrender_render 47, webrender_sw_raster 36 |
| Timer | 146 | 0.9 | Other 146, Profiler 0 | 0 / 0 / 146 | ipc 146, poll_wait 145, memcpy_memset 0 |
| SwComposite | 99 | 0.6 | Other 99 | 0 / 0 / 99 | webrender_render 99, poll_wait 90, webrender_sw_raster 9, memcpy_memset 2 |
| WRRenderBackend#0 | 40 | 0.2 | Other 40 | 0 / 0 / 40 | webrender_render 1, poll_wait 0 |
| Compositor | 29 | 0.2 | Idle 26, Other 3, Profiler 0 | 0 / 0 / 29 | ipc 29, poll_wait 26, memcpy_memset 3, webrender_render 0 |
| WRSceneBuilder#0 | 9 | 0.1 | Other 9 | 0 / 0 / 9 | webrender_scene 9, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 737; `__memmove_avx_unaligned_erms [libc.so.6]` 304; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 180; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 41; `[unknown]` 34; `recvmsg [libc.so.6]` 26; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 19; `write [libc.so.6]` 19

**tab pid 4272** — 14 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.1 | GC / CC 7, Idle 4, Other 0 | 0 / 0 / 12 | ipc 10, gc_cc 7, poll_wait 5, memcpy_memset 1 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `mmap64 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `TraceCallbackFunc::Trace(JS::Heap<JS::Value>*, char const*, void*) con` 1; `[linux-vdso.so.1]` 0; `read [libc.so.6]` 0

**tab pid 4173** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.1 | GC / CC 8, Idle 2 | 0 / 0 / 9 | gc_cc 8, ipc 8, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `poll [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::CycleCollec` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `prctl [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1

**tab pid 4233** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.0 | Idle 4, GC / CC 2, Other 0 | 0 / 0 / 6 | poll_wait 5, ipc 5, gc_cc 2, paint_layout 0 |
| Timer | 2 | 0.0 | Other 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 1; `[]` 0; `gfxPlatform::IsInLayoutAsapMode() [libxul.so]` 0

