### webkit scroll (profile pass)

**parent pid 7154** — 966 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 503 | 24.2 | Idle 268, JavaScript 105, Other 60, DOM 33 | 8 / 129 / 366 | ipc 502, poll_wait 336, gc_cc 108, engine_stream_read 84 |
| DOM Worker | 241 | 11.5 | JavaScript 225, Profiler 10, Other 6 | 0 / 0 / 241 | subprocess_pipe_io 241, worker_messaging 241, ipc 241, js_ctypes 204 |
| BackgroundThreadPool #3 | 53 | 2.5 | Idle 46, Other 7 | 0 / 0 / 53 | ipc 52, poll_wait 46, native_receiver 6, memcpy_memset 6 |
| Renderer | 51 | 2.5 | Idle 37, Graphics 14, Other 0, Profiler 0 | 0 / 0 / 51 | ipc 51, poll_wait 44, webrender_render 14, webrender_sw_raster 8 |
| WRRenderBackend#0 | 33 | 1.6 | Other 33 | 0 / 0 / 33 | webrender_render 0 |
| Compositor | 25 | 1.2 | Idle 24, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 25 | ipc 25, poll_wait 24, webrender_render 1, canvas_2d 0 |
| SwComposite | 22 | 1.0 | Other 22 | 0 / 0 / 22 | webrender_render 22, poll_wait 21, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 20 | 1.0 | Other 20, Profiler 0 | 0 / 0 / 20 | ipc 20, poll_wait 20 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 18; `[axiosozo-dev]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 4; `__lll_lock_wait [libc.so.6]` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 3

**tab pid 7351** — 1 ms CPU in the window

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

**tab pid 7324** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

**tab pid 7700** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0

