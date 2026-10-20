### chromium-2x-control raf (profile pass)

**parent pid 4435** — 2259 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 597 | 18.8 | Graphics 348, Idle 242, Other 4, Profiler 4 | 0 / 0 / 597 | ipc 597, webrender_render 351, webrender_sw_raster 318, poll_wait 253 |
| SwComposite | 550 | 17.3 | Other 550 | 0 / 0 / 550 | webrender_render 550, webrender_sw_raster 370, poll_wait 179, memcpy_memset 86 |
| GeckoMain | 406 | 12.8 | Idle 276, JavaScript 64, Other 37, DOM 24 | 6 / 74 / 326 | ipc 405, poll_wait 299, gc_cc 76, worker_messaging 38 |
| DOM Worker | 312 | 9.8 | JavaScript 307, Profiler 4, Other 1 | 0 / 0 / 312 | subprocess_pipe_io 312, worker_messaging 312, ipc 312, js_ctypes 293 |
| BackgroundThreadPool #3 | 205 | 6.4 | Idle 131, Other 72, Graphics 2 | 0 / 0 / 205 | ipc 205, poll_wait 131, native_receiver 73, memcpy_memset 70 |
| WRRenderBackend#0 | 76 | 2.4 | Other 76 | 0 / 0 / 76 | memcpy_memset 1, webrender_render 1, poll_wait 0 |
| Compositor | 45 | 1.4 | Idle 44, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 45 | ipc 45, poll_wait 44, webrender_render 1, image_container 0 |
| Timer | 37 | 1.2 | Other 37, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 36, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 278; `[unknown]` 14; `recvmsg [libc.so.6]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `write [libc.so.6]` 4; `[axiosozo-dev]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[libX11.so.6]` 3

**tab pid 4627** — 1 ms CPU in the window

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

**tab pid 4588** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0

**tab pid 5054** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

