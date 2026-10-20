### webkit-2x scroll (profile pass)

**parent pid 8823** — 1295 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 559 | 25.6 | Idle 329, JavaScript 107, Other 61, DOM 27 | 11 / 120 / 428 | ipc 559, poll_wait 381, gc_cc 100, engine_stream_read 69 |
| DOM Worker | 278 | 12.7 | JavaScript 266, Profiler 11, Other 1 | 0 / 0 / 278 | subprocess_pipe_io 278, worker_messaging 278, ipc 278, js_ctypes 244 |
| BackgroundThreadPool #3 | 178 | 8.1 | Idle 131, Other 39, Graphics 6, Profiler 1 | 0 / 0 / 178 | ipc 173, poll_wait 133, native_receiver 44, memcpy_memset 34 |
| Renderer | 118 | 5.4 | Idle 72, Graphics 46 | 0 / 0 / 118 | ipc 118, poll_wait 86, webrender_render 46, webrender_sw_raster 40 |
| SwComposite | 62 | 2.8 | Other 62 | 0 / 0 / 62 | webrender_render 61, poll_wait 58, webrender_sw_raster 3, memcpy_memset 2 |
| WRRenderBackend#0 | 38 | 1.7 | Other 38 | 0 / 0 / 38 | webrender_render 1 |
| Compositor | 27 | 1.2 | Idle 26, Other 1, Graphics 0 | 0 / 0 / 27 | ipc 27, poll_wait 27, webrender_render 0, canvas_2d 0 |
| Timer | 17 | 0.8 | Other 17 | 0 / 0 / 17 | ipc 17, poll_wait 17, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 360; `[unknown]` 21; `__lll_lock_wait [libc.so.6]` 9; `__lll_lock_wake [libc.so.6]` 7; `[axiosozo-dev]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNative::CallMo` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3

**tab pid 8984** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 9529** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::ProfilerStringV` 0

**tab pid 8962** — 1 ms CPU in the window

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

