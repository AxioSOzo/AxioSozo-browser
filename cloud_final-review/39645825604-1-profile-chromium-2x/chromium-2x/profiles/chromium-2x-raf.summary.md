### chromium-2x raf (profile pass)

**parent pid 3512** — 1191 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 373 | 11.8 | Idle 248, JavaScript 64, Other 34, DOM 16 | 8 / 70 / 295 | ipc 373, poll_wait 270, gc_cc 70, worker_messaging 34 |
| DOM Worker | 287 | 9.1 | JavaScript 281, Profiler 5, Other 1 | 0 / 0 / 287 | subprocess_pipe_io 287, worker_messaging 287, ipc 287, js_ctypes 268 |
| Renderer | 144 | 4.6 | Idle 91, Graphics 52, Other 2 | 0 / 0 / 144 | ipc 144, poll_wait 98, webrender_render 53, webrender_sw_raster 43 |
| SwComposite | 105 | 3.3 | Other 105 | 0 / 0 / 105 | webrender_render 105, poll_wait 94, webrender_sw_raster 10, memcpy_memset 9 |
| BackgroundThreadPool #3 | 95 | 3.0 | Idle 83, Other 10, Graphics 2 | 0 / 0 / 95 | ipc 95, poll_wait 83, native_receiver 11, memcpy_memset 8 |
| WRRenderBackend#0 | 52 | 1.6 | Other 52 | 0 / 0 / 52 | webrender_render 1, memcpy_memset 0 |
| Compositor | 40 | 1.3 | Idle 38, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 38, webrender_render 0, image_container 0 |
| BgIOThreadPool #4 | 34 | 1.1 | Other 33, Idle 1 | 0 / 0 / 34 | ipc 34, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 252; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `read [libc.so.6]` 3

**tab pid 3692** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Other 1, Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `poll [libc.so.6]` 1

**tab pid 4318** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4174** — 1 ms CPU in the window

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

