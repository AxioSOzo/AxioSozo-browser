### gecko-debian raf-nosampler (profile pass)

**parent pid 8162** — 516 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 304 | 10.0 | Graphics 205, Idle 99, Other 0 | 0 / 0 / 304 | ipc 302, webrender_render 205, webrender_sw_raster 187, poll_wait 100 |
| WRRenderBackend#0 | 55 | 1.8 | Other 55, Profiler 0 | 0 / 0 / 55 | webrender_render 1, webrender_scene 0, gc_cc 0, memcpy_memset 0 |
| GeckoMain | 46 | 1.5 | GC / CC 30, Idle 9, Other 4, JavaScript 2 | 0 / 2 / 44 | ipc 46, gc_cc 33, poll_wait 10, harness_diagnostics 2 |
| Compositor | 41 | 1.4 | Idle 40, Other 1 | 0 / 0 / 41 | ipc 41, poll_wait 40, paint_layout 0, webrender_render 0 |
| WRSceneBuilder#0 | 40 | 1.3 | Other 40 | 0 / 0 / 40 | webrender_scene 40, webrender_render 2, poll_wait 1, webrender_sw_raster 0 |
| SwComposite | 12 | 0.4 | Other 12 | 0 / 0 / 12 | webrender_render 12, poll_wait 12, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 10 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onShapeEdge(js::Sh` 5; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 3; `__lll_lock_wait [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `bool js::gc::UnmarkGrayTracer<8u>::onChild<js::BaseScript>(js::BaseScr` 2

**tab pid 8404** — 144 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 128 | 4.2 | Idle 93, Graphics 13, Layout 7, Profiler 7 | 0 / 4 / 124 | ipc 122, poll_wait 93, paint_layout 29, gc_cc 1 |
| IPC I/O Child | 15 | 0.5 | Idle 15, Other 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 97; `[]` 4; `getcontext [libc.so.6]` 1; `WritePadding(mozilla::BufferList<InfallibleAllocPolicy>&, unsigned int` 1; `__lll_lock_wait [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `_ZZN7mozilla20ProfileChunkedBuffer13ReserveAndPutIZNS0_10PutObjectsIJN` 1

**tab pid 8303** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8325** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuffer::PutObj` 0

