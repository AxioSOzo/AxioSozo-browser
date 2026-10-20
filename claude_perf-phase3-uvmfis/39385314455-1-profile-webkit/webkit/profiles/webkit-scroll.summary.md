### webkit scroll (profile pass)

**parent pid 7188** — 935 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 461 | 22.9 | Idle 253, JavaScript 78, Other 51, GC / CC 33 | 7 / 89 / 365 | ipc 459, poll_wait 296, gc_cc 111, engine_stream_read 59 |
| DOM Worker | 263 | 13.1 | JavaScript 200, Other 29, GC / CC 21, Profiler 13 | 0 / 0 / 263 | subprocess_pipe_io 263, worker_messaging 262, ipc 262, js_ctypes 180 |
| BackgroundThreadPool #2 | 66 | 3.3 | Idle 54, Other 12 | 0 / 0 / 66 | ipc 66, poll_wait 54, native_receiver 12, memcpy_memset 11 |
| Renderer | 46 | 2.3 | Idle 37, Graphics 8, Other 0 | 0 / 0 / 46 | ipc 46, poll_wait 39, webrender_render 9, webrender_sw_raster 4 |
| WRRenderBackend#0 | 24 | 1.2 | Other 24, Profiler 0 | 0 / 0 / 24 | webrender_render 0 |
| SwComposite | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_render 23, poll_wait 23, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 20 | 1.0 | Idle 19, Other 0, Graphics 0 | 0 / 0 / 20 | ipc 20, poll_wait 19, webrender_render 0, canvas_2d 0 |
| Timer | 17 | 0.8 | Other 17 | 0 / 0 / 17 | ipc 17, poll_wait 17 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 276; `[unknown]` 20; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5; `[axiosozo-dev]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4

**tab pid 7599** — 0 ms CPU in the window

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

**tab pid 7361** — 0 ms CPU in the window

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

**tab pid 7339** — 0 ms CPU in the window

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

