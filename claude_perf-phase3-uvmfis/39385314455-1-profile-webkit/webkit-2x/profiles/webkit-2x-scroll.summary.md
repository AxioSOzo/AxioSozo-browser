### webkit-2x scroll (profile pass)

**parent pid 8674** — 1186 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 472 | 23.0 | Idle 262, JavaScript 98, Other 46, DOM 34 | 9 / 120 / 344 | ipc 469, poll_wait 323, gc_cc 89, engine_stream_read 73 |
| DOM Worker | 256 | 12.5 | JavaScript 236, Profiler 15, Other 5 | 0 / 0 / 256 | subprocess_pipe_io 256, worker_messaging 256, ipc 256, js_ctypes 207 |
| BackgroundThreadPool #3 | 203 | 9.9 | Idle 112, Other 86, Graphics 6 | 0 / 0 / 203 | ipc 202, poll_wait 114, native_receiver 90, memcpy_memset 80 |
| Renderer | 112 | 5.5 | Idle 68, Graphics 45 | 0 / 0 / 112 | ipc 112, poll_wait 85, webrender_render 45, webrender_sw_raster 35 |
| SwComposite | 59 | 2.9 | Other 59 | 0 / 0 / 59 | webrender_render 59, poll_wait 53, memcpy_memset 6, webrender_sw_raster 6 |
| WRRenderBackend#0 | 30 | 1.5 | Other 30 | 0 / 0 / 30 | webrender_render 2, poll_wait 1 |
| Compositor | 21 | 1.0 | Idle 21, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 21 | ipc 21, poll_wait 21, webrender_render 0, image_container 0 |
| Timer | 18 | 0.9 | Other 17, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 17, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 17; `__lll_lock_wake [libc.so.6]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `__memmove_evex_unaligned_erms [libc.so.6]` 4; `[libgdk-3.so.0]` 4; `[linux-vdso.so.1]` 3

**tab pid 8826** — 1 ms CPU in the window

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

**tab pid 9085** — 1 ms CPU in the window

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

**tab pid 8848** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::ipc::MessageChannel::MessageTask::Run() [libxul.so]` 0

