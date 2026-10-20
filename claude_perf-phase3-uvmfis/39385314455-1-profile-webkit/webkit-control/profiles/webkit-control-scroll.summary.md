### webkit-control scroll (profile pass)

**parent pid 9563** — 1178 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 489 | 24.2 | Idle 273, JavaScript 78, Other 61, GC / CC 26 | 10 / 85 / 394 | ipc 486, poll_wait 328, gc_cc 95, engine_stream_read 44 |
| DOM Worker | 279 | 13.8 | JavaScript 222, GC / CC 29, Other 24, Profiler 4 | 0 / 0 / 279 | subprocess_pipe_io 279, worker_messaging 278, ipc 278, js_ctypes 206 |
| Renderer | 139 | 6.9 | Idle 93, Graphics 46, Other 1 | 0 / 0 / 139 | ipc 139, poll_wait 100, webrender_render 47, webrender_sw_raster 36 |
| SwComposite | 113 | 5.6 | Other 113 | 0 / 0 / 113 | webrender_render 113, poll_wait 86, webrender_sw_raster 25, memcpy_memset 1 |
| BackgroundThreadPool #2 | 68 | 3.3 | Idle 53, Other 14, Graphics 0, Profiler 0 | 0 / 0 / 68 | ipc 68, poll_wait 53, native_receiver 14, memcpy_memset 14 |
| WRRenderBackend#0 | 36 | 1.8 | Other 36 | 0 / 0 / 36 | webrender_render 1 |
| Compositor | 22 | 1.1 | Idle 21, Other 1, Graphics 0 | 0 / 0 / 22 | ipc 22, poll_wait 21, webrender_render 0, canvas_2d 0 |
| Timer | 16 | 0.8 | Other 16 | 0 / 0 / 16 | ipc 16, poll_wait 16, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 299; `[unknown]` 13; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `[axiosozo-dev]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 3

**tab pid 9749** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 9972** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `PR_GetCurrentThread [libnspr4.so]` 0

**tab pid 9730** — 1 ms CPU in the window

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

