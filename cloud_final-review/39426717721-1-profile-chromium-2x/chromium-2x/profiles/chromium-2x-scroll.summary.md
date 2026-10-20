### chromium-2x scroll (profile pass)

**parent pid 3139** — 1186 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 412 | 20.1 | Idle 259, JavaScript 74, Other 39, Graphics 16 | 10 / 73 / 330 | ipc 412, poll_wait 306, gc_cc 68, worker_messaging 40 |
| DOM Worker | 271 | 13.2 | JavaScript 255, Profiler 14, Other 1 | 0 / 0 / 271 | subprocess_pipe_io 271, worker_messaging 271, ipc 271, js_ctypes 242 |
| BackgroundThreadPool #3 | 219 | 10.7 | Other 125, Idle 90, Graphics 3, Profiler 1 | 0 / 0 / 219 | ipc 219, native_receiver 128, memcpy_memset 126, poll_wait 92 |
| Renderer | 111 | 5.4 | Idle 66, Graphics 44, Profiler 1 | 0 / 0 / 111 | ipc 111, poll_wait 82, webrender_render 45, webrender_sw_raster 35 |
| SwComposite | 87 | 4.2 | Other 87 | 0 / 0 / 87 | webrender_render 87, poll_wait 80, webrender_sw_raster 7, memcpy_memset 6 |
| WRRenderBackend#0 | 31 | 1.5 | Other 31 | 0 / 0 / 31 | poll_wait 0, webrender_render 0 |
| Compositor | 22 | 1.1 | Idle 21, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 22 | ipc 22, poll_wait 21, webrender_render 0, image_container 0 |
| Timer | 17 | 0.8 | Other 17, Profiler 0 | 0 / 0 / 17 | ipc 17, poll_wait 17 |

Main thread, top self: `poll [libc.so.6]` 260; `[unknown]` 10; `write [libc.so.6]` 8; `recvmsg [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[linux-vdso.so.1]` 3

**tab pid 4020** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<AddRemoveTim` 0

**tab pid 3294** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3317** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

