### webkit scroll (profile pass)

**parent pid 7188** — 896 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 460 | 22.7 | Idle 249, JavaScript 86, Other 48, GC / CC 33 | 10 / 91 / 358 | ipc 458, poll_wait 293, gc_cc 113, engine_stream_read 53 |
| DOM Worker | 202 | 10.0 | JavaScript 194, Profiler 7, Other 1 | 0 / 0 / 202 | subprocess_pipe_io 202, worker_messaging 202, ipc 202, js_ctypes 185 |
| BackgroundThreadPool #1 | 76 | 3.8 | Idle 55, Other 18, Graphics 2 | 0 / 0 / 76 | ipc 76, poll_wait 57, native_receiver 21, memcpy_memset 17 |
| Renderer | 53 | 2.6 | Idle 39, Graphics 14 | 0 / 0 / 53 | ipc 53, poll_wait 44, webrender_render 14, webrender_sw_raster 8 |
| SwComposite | 29 | 1.4 | Other 29 | 0 / 0 / 29 | webrender_render 29, poll_wait 28, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 27 | 1.3 | Other 27 | 0 / 0 / 27 | memcpy_memset 0, array_buffer_copy 0, webrender_render 0 |
| Compositor | 20 | 1.0 | Idle 20, Other 0 | 0 / 0 / 20 | ipc 20, poll_wait 20, canvas_2d 0, webrender_render 0 |
| Timer | 16 | 0.8 | Other 16, Profiler 0 | 0 / 0 / 16 | ipc 15, poll_wait 15, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 265; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `__lll_lock_wake [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 4; `js::LookupProperty(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS::P` 3

**tab pid 7360** — 1 ms CPU in the window

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

**tab pid 7740** — 1 ms CPU in the window

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

**tab pid 7746** — 1 ms CPU in the window

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

