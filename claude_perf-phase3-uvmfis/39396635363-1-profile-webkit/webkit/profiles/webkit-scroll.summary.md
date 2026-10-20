### webkit scroll (profile pass)

**parent pid 7188** — 915 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 496 | 24.6 | Idle 246, JavaScript 84, GC / CC 70, Other 52 | 10 / 93 / 393 | ipc 493, poll_wait 289, gc_cc 144, engine_stream_read 49 |
| DOM Worker | 215 | 10.6 | JavaScript 202, Profiler 10, Other 3 | 0 / 0 / 215 | subprocess_pipe_io 215, worker_messaging 215, ipc 215, js_ctypes 187 |
| BackgroundThreadPool #3 | 60 | 3.0 | Idle 50, Other 10, Profiler 0 | 0 / 0 / 60 | ipc 60, poll_wait 50, native_receiver 10, memcpy_memset 10 |
| Renderer | 43 | 2.1 | Idle 34, Graphics 8, Profiler 1, Other 0 | 0 / 0 / 43 | ipc 43, poll_wait 37, webrender_render 9, webrender_sw_raster 4 |
| WRRenderBackend#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 |  |
| SwComposite | 21 | 1.1 | Other 21 | 0 / 0 / 21 | webrender_render 21, poll_wait 21, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 20 | 1.0 | Idle 19, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 20 | ipc 20, poll_wait 19, webrender_render 0, image_container 0 |
| Timer | 16 | 0.8 | Other 16, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 16, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 263; `[unknown]` 16; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 8; `[axiosozo-dev]` 5; `__lll_lock_wait [libc.so.6]` 4; `__pthread_mutex_unlock_usercnt [libc.so.6]` 4; `__lll_lock_wake [libc.so.6]` 4

**tab pid 7335** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 7384** — 0 ms CPU in the window

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

**tab pid 7357** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

