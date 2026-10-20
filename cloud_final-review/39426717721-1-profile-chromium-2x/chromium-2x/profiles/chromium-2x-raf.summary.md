### chromium-2x raf (profile pass)

**parent pid 3139** — 1215 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 337 | 10.9 | Idle 242, JavaScript 52, Other 25, DOM 12 | 6 / 56 / 274 | ipc 335, poll_wait 252, gc_cc 54, engine_stream_read 28 |
| DOM Worker | 268 | 8.7 | JavaScript 257, Profiler 6, Other 4 | 0 / 0 / 268 | subprocess_pipe_io 268, worker_messaging 267, ipc 267, js_ctypes 247 |
| Renderer | 193 | 6.3 | Idle 107, Graphics 86, Profiler 0, Other 0 | 0 / 0 / 193 | ipc 193, poll_wait 115, webrender_render 86, webrender_sw_raster 79 |
| SwComposite | 157 | 5.1 | Other 157 | 0 / 0 / 157 | webrender_render 157, poll_wait 121, webrender_sw_raster 36, memcpy_memset 34 |
| BackgroundThreadPool #3 | 128 | 4.1 | Idle 96, Other 31, Profiler 0 | 0 / 0 / 128 | ipc 128, poll_wait 96, native_receiver 31, memcpy_memset 29 |
| WRRenderBackend#0 | 47 | 1.5 | Other 47 | 0 / 0 / 47 | webrender_render 1, poll_wait 0, memcpy_memset 0, webrender_scene 0 |
| Compositor | 35 | 1.1 | Idle 33, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 35 | ipc 35, poll_wait 34, webrender_render 1, canvas_2d 0 |
| Timer | 26 | 0.8 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 244; `[unknown]` 9; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 3; `mprotect [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2

**tab pid 4015** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

**tab pid 3294** — 1 ms CPU in the window

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

**tab pid 3335** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0

