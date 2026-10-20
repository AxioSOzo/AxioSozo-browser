### chromium scroll (profile pass)

**parent pid 3278** — 933 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 430 | 20.2 | Idle 254, JavaScript 71, Other 48, DOM 17 | 10 / 72 / 348 | ipc 429, poll_wait 316, gc_cc 85, paint_layout 41 |
| DOM Worker | 280 | 13.2 | JavaScript 268, Profiler 7, Other 5 | 0 / 0 / 280 | subprocess_pipe_io 280, worker_messaging 280, ipc 280, js_ctypes 251 |
| BackgroundThreadPool #2 | 61 | 2.9 | Idle 52, Other 8, Profiler 1, Graphics 0 | 0 / 0 / 61 | ipc 61, poll_wait 52, native_receiver 8, memcpy_memset 7 |
| Renderer | 48 | 2.2 | Idle 40, Graphics 7, Other 1 | 0 / 0 / 48 | ipc 48, poll_wait 43, webrender_render 8, webrender_sw_raster 5 |
| WRRenderBackend#0 | 28 | 1.3 | Other 28 | 0 / 0 / 28 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 23 | 1.1 | Idle 23, Other 1 | 0 / 0 / 23 | ipc 23, poll_wait 23, webrender_render 0, canvas_2d 0 |
| SwComposite | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_render 23, poll_wait 23, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 21 | 1.0 | Other 21 | 0 / 0 / 21 | ipc 21, poll_wait 21 |

Main thread, top self: `poll [libc.so.6]` 256; `[unknown]` 14; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 6; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `read [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 3

**tab pid 3420** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 3441** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0

**tab pid 3460** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

