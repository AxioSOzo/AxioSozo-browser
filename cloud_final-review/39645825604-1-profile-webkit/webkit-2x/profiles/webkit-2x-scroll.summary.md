### webkit-2x scroll (profile pass)

**parent pid 8817** — 885 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 413 | 20.1 | Idle 232, JavaScript 70, Other 42, GC / CC 27 | 12 / 79 / 322 | ipc 412, poll_wait 275, gc_cc 96, engine_stream_read 51 |
| DOM Worker | 227 | 11.0 | JavaScript 162, GC / CC 30, Other 24, Profiler 11 | 0 / 0 / 227 | subprocess_pipe_io 227, worker_messaging 227, ipc 227, js_ctypes 148 |
| BackgroundThreadPool #2 | 80 | 3.9 | Idle 53, Other 26, Graphics 1 | 0 / 0 / 80 | ipc 80, poll_wait 54, native_receiver 27, memcpy_memset 24 |
| Renderer | 60 | 2.9 | Idle 33, Graphics 26 | 0 / 0 / 60 | ipc 60, poll_wait 40, webrender_render 26, webrender_sw_raster 17 |
| SwComposite | 33 | 1.6 | Other 33 | 0 / 0 / 33 | webrender_render 33, poll_wait 31, memcpy_memset 2, webrender_sw_raster 2 |
| WRRenderBackend#0 | 27 | 1.3 | Other 27 | 0 / 0 / 27 | webrender_scene 0 |
| Compositor | 18 | 0.9 | Idle 18, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 18 | ipc 18, poll_wait 18, webrender_render 0, memcpy_memset 0 |
| Timer | 12 | 0.6 | Other 12, Profiler 0 | 0 / 0 / 12 | ipc 12, poll_wait 12 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 249; `[unknown]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 5; `mprotect [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2

**tab pid 8967** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8989** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 9367** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

