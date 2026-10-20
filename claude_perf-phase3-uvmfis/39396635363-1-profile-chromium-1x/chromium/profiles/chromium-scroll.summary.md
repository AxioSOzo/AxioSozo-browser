### chromium scroll (profile pass)

**parent pid 3348** — 908 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 420 | 19.9 | Idle 247, JavaScript 68, Other 57, DOM 24 | 7 / 80 / 334 | ipc 420, poll_wait 305, gc_cc 78, worker_messaging 47 |
| DOM Worker | 269 | 12.7 | JavaScript 258, Other 7, Profiler 5 | 0 / 0 / 269 | subprocess_pipe_io 269, worker_messaging 269, ipc 269, js_ctypes 237 |
| BackgroundThreadPool #1 | 51 | 2.4 | Idle 46, Other 3, Graphics 1 | 0 / 0 / 51 | ipc 51, poll_wait 47, native_receiver 5, memcpy_memset 3 |
| Renderer | 50 | 2.4 | Idle 41, Graphics 9, Other 0 | 0 / 0 / 50 | ipc 50, poll_wait 44, webrender_render 9, webrender_sw_raster 6 |
| WRRenderBackend#0 | 31 | 1.5 | Other 31 | 0 / 0 / 31 | webrender_render 0 |
| Compositor | 24 | 1.2 | Idle 24, Other 0, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 24, webrender_render 0, memcpy_memset 0 |
| SwComposite | 24 | 1.1 | Other 24 | 0 / 0 / 24 | webrender_render 24, poll_wait 24 |
| Timer | 22 | 1.0 | Other 22, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 22 |

Main thread, top self: `poll [libc.so.6]` 254; `[unknown]` 11; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 6; `[linux-vdso.so.1]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3

**tab pid 3526** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `nsThreadManager::get() [libxul.so]` 0

**tab pid 4190** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3995** — 1 ms CPU in the window

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

