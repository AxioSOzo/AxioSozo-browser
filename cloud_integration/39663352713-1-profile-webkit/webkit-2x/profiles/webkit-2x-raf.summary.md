### webkit-2x raf (profile pass)

**parent pid 8775** — 1189 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 454 | 14.4 | Idle 307, JavaScript 77, Other 40, DOM 25 | 10 / 87 / 357 | ipc 448, poll_wait 326, gc_cc 65, engine_stream_read 46 |
| DOM Worker | 237 | 7.5 | JavaScript 227, Profiler 6, Other 4 | 0 / 0 / 237 | subprocess_pipe_io 237, worker_messaging 237, ipc 237, js_ctypes 212 |
| Renderer | 170 | 5.4 | Idle 104, Graphics 65, Other 1 | 0 / 0 / 170 | ipc 170, poll_wait 122, webrender_render 65, webrender_sw_raster 57 |
| SwComposite | 88 | 2.8 | Other 88 | 0 / 0 / 88 | webrender_render 88, poll_wait 80, webrender_sw_raster 8, memcpy_memset 7 |
| BackgroundThreadPool #2 | 81 | 2.6 | Idle 69, Other 11, Graphics 1 | 0 / 0 / 81 | ipc 81, poll_wait 70, native_receiver 12, memcpy_memset 10 |
| WRRenderBackend#0 | 54 | 1.7 | Other 54 | 0 / 0 / 54 | webrender_render 1 |
| Compositor | 42 | 1.3 | Idle 40, Other 1, Graphics 0 | 0 / 0 / 42 | ipc 42, poll_wait 41, webrender_render 1, canvas_2d 0 |
| Timer | 33 | 1.0 | Other 33, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 323; `[unknown]` 14; `mprotect [libc.so.6]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `[linux-vdso.so.1]` 5; `[axiosozo-dev]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `mozilla::net::nsStandardURL::Init(unsigned int, int, nsTSubstring<char` 2

**tab pid 9344** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8980** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

