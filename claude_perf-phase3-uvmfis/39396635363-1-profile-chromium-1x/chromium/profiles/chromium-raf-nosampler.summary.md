### chromium raf-nosampler (profile pass)

**parent pid 3348** — 669 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 260 | 8.5 | JavaScript 254, Other 3, Profiler 3 | 0 / 0 / 260 | subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 249 |
| GeckoMain | 177 | 5.8 | Idle 109, JavaScript 41, Other 18, DOM 7 | 6 / 38 / 134 | ipc 177, poll_wait 120, gc_cc 49, engine_stream_read 29 |
| Renderer | 66 | 2.2 | Idle 51, Graphics 14, Other 1, Profiler 0 | 0 / 0 / 66 | ipc 66, poll_wait 55, webrender_render 15, webrender_sw_raster 10 |
| WRRenderBackend#0 | 39 | 1.3 | Other 39, Profiler 0 | 0 / 0 / 39 | webrender_render 0 |
| SwComposite | 36 | 1.2 | Other 36 | 0 / 0 / 36 | webrender_render 36, poll_wait 35, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 35 | 1.1 | Idle 34, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 35 | ipc 35, poll_wait 34, webrender_render 0, canvas_2d 0 |
| BackgroundThreadPool #1 | 31 | 1.0 | Idle 30, Other 1 | 0 / 0 / 31 | ipc 31, poll_wait 30, native_receiver 1, memcpy_memset 1 |
| ImageBridgeChld | 15 | 0.5 | Idle 15, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15 |

Main thread, top self: `poll [libc.so.6]` 112; `[unknown]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `recvmsg [libc.so.6]` 2; `write [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `[axiosozo-dev]` 2; `mprotect [libc.so.6]` 2

**tab pid 3526** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

**tab pid 3508** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3487** — 1 ms CPU in the window

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

