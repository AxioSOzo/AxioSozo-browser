### webkit raf (profile pass)

**parent pid 7188** — 894 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 395 | 12.8 | Idle 256, JavaScript 62, Other 31, GC / CC 26 | 9 / 66 / 319 | ipc 393, poll_wait 274, gc_cc 82, engine_stream_read 40 |
| DOM Worker | 213 | 6.9 | JavaScript 205, Other 4, Profiler 4 | 0 / 0 / 213 | subprocess_pipe_io 213, worker_messaging 212, ipc 212, js_ctypes 195 |
| Renderer | 84 | 2.7 | Idle 63, Graphics 21, Other 1 | 0 / 0 / 84 | ipc 84, poll_wait 67, webrender_render 22, webrender_sw_raster 13 |
| SwComposite | 47 | 1.5 | Other 47 | 0 / 0 / 47 | webrender_render 47, poll_wait 46, memcpy_memset 1, webrender_sw_raster 1 |
| BackgroundThreadPool #1 | 41 | 1.3 | Idle 38, Other 2, Graphics 1, Profiler 0 | 0 / 0 / 41 | ipc 41, poll_wait 38, native_receiver 3, memcpy_memset 2 |
| WRRenderBackend#0 | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 1, poll_wait 0, memcpy_memset 0, array_buffer_copy 0 |
| Compositor | 32 | 1.0 | Idle 31, Other 1, Graphics 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, webrender_render 1, canvas_2d 0 |
| Timer | 24 | 0.8 | Other 24, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 24, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 269; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObjectEdge(JSObj` 5; `__lll_lock_wait [libc.so.6]` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 3; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 3

**tab pid 7740** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 3, Idle 2 | 0 / 0 / 6 | ipc 5, gc_cc 3, poll_wait 3 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `non-virtual thunk to mozilla::dom::SessionStoreChangeListener::QueryIn` 0; `js::gcstats::Statistics::lookupChildPhase(js::gcstats::PhaseKind) cons` 0

**tab pid 7379** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<AddRemoveTim` 0

**tab pid 7746** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

