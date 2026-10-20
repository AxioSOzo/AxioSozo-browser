### chromium-2x raf (profile pass)

**parent pid 3385** — 1329 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 380 | 12.0 | Idle 258, JavaScript 59, Other 36, DOM 12 | 6 / 66 / 309 | ipc 380, poll_wait 279, gc_cc 65, engine_stream_read 32 |
| DOM Worker | 299 | 9.4 | JavaScript 292, Profiler 6, Other 1 | 0 / 0 / 299 | subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 282 |
| BackgroundThreadPool #3 | 195 | 6.1 | Idle 135, Other 56, Graphics 3 | 0 / 0 / 195 | ipc 195, poll_wait 135, native_receiver 59, memcpy_memset 56 |
| Renderer | 171 | 5.4 | Idle 106, Graphics 65, Other 1 | 0 / 0 / 171 | ipc 171, poll_wait 117, webrender_render 66, webrender_sw_raster 56 |
| SwComposite | 128 | 4.0 | Other 128 | 0 / 0 / 128 | webrender_render 128, poll_wait 105, webrender_sw_raster 23, memcpy_memset 12 |
| WRRenderBackend#0 | 52 | 1.6 | Other 52 | 0 / 0 / 52 | webrender_render 1, array_buffer_copy 0, memcpy_memset 0, webrender_scene 0 |
| Compositor | 40 | 1.3 | Idle 39, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 39, webrender_render 1, canvas_2d 0 |
| Timer | 35 | 1.1 | Other 35 | 0 / 0 / 35 | ipc 35, poll_wait 35 |

Main thread, top self: `poll [libc.so.6]` 260; `[unknown]` 9; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `read [libc.so.6]` 2

**tab pid 3520** — 1 ms CPU in the window

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

**tab pid 3830** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 3541** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0

