### chromium-2x raf (profile pass)

**parent pid 3371** — 2266 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 596 | 18.7 | Graphics 362, Idle 231, Profiler 3, Other 0 | 0 / 0 / 596 | ipc 596, webrender_render 365, webrender_sw_raster 322, poll_wait 234 |
| SwComposite | 519 | 16.3 | Other 519 | 0 / 0 / 519 | webrender_render 518, webrender_sw_raster 300, poll_wait 217, memcpy_memset 71 |
| GeckoMain | 469 | 14.7 | Idle 263, JavaScript 77, GC / CC 65, Other 40 | 5 / 85 / 379 | ipc 469, poll_wait 286, gc_cc 150, worker_messaging 46 |
| DOM Worker | 309 | 9.7 | JavaScript 299, Profiler 7, Other 3 | 0 / 0 / 309 | subprocess_pipe_io 309, worker_messaging 309, ipc 309, js_ctypes 285 |
| BackgroundThreadPool #1 | 208 | 6.5 | Idle 128, Other 74, Graphics 6 | 0 / 0 / 208 | ipc 208, poll_wait 131, native_receiver 79, memcpy_memset 72 |
| WRRenderBackend#0 | 64 | 2.0 | Other 64 | 0 / 0 / 64 | webrender_render 1, memcpy_memset 1, poll_wait 0, array_buffer_copy 0 |
| Compositor | 41 | 1.3 | Idle 39, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 41 | ipc 41, poll_wait 40, webrender_render 1, canvas_2d 0 |
| Timer | 33 | 1.0 | Other 33, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 33, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 265; `[unknown]` 17; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 16; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 7; `mprotect [libc.so.6]` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `[axiosozo-dev]` 5

**tab pid 4035** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 5, Idle 1, Other 0 | 0 / 0 / 6 | ipc 6, gc_cc 5, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::services::GetObserverService() [libxul.so]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `js::Nursery::collect(JS::GCOptions, JS::GCReason) [libxul.so]` 1; `mozilla::net::HttpChannelChild::Release() [libxul.so]` 1; `__memcmp_avx2_movbe [libc.so.6]` 0

**tab pid 4151** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3520** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

