### webkit raf (profile pass)

**parent pid 7188** — 1025 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 433 | 14.1 | Idle 275, JavaScript 67, Other 33, GC / CC 26 | 9 / 81 / 342 | ipc 432, poll_wait 289, gc_cc 86, engine_stream_read 45 |
| DOM Worker | 228 | 7.4 | JavaScript 222, Profiler 4, Other 1 | 0 / 0 / 228 | subprocess_pipe_io 228, worker_messaging 228, ipc 228, js_ctypes 211 |
| Renderer | 80 | 2.6 | Idle 64, Graphics 15, Other 1, Profiler 0 | 0 / 0 / 80 | ipc 80, poll_wait 67, webrender_render 16, webrender_sw_raster 12 |
| BackgroundThreadPool #2 | 76 | 2.5 | Idle 67, Other 8, Graphics 1, Profiler 1 | 0 / 0 / 76 | ipc 76, poll_wait 67, native_receiver 9, memcpy_memset 8 |
| SwComposite | 42 | 1.4 | Other 42 | 0 / 0 / 42 | webrender_render 42, poll_wait 39, memcpy_memset 2, webrender_sw_raster 2 |
| DOM Worker | 41 | 1.3 | Other 39, GC / CC 1, Idle 1 | 0 / 0 / 41 | worker_messaging 41, ipc 41, gc_cc 40, memcpy_memset 13 |
| WRRenderBackend#0 | 41 | 1.3 | Other 41 | 0 / 0 / 41 | webrender_render 0, webrender_scene 0, poll_wait 0 |
| Compositor | 34 | 1.1 | Idle 33, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 33, webrender_render 0, canvas_2d 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 285; `[unknown]` 14; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 7; `[axiosozo-dev]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `mozilla::JSHolderMap::Put(void*, nsScriptObjectTracer*, JS::Zone*) [li` 3

**tab pid 7339** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7599** — 1 ms CPU in the window

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

**tab pid 7361** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

