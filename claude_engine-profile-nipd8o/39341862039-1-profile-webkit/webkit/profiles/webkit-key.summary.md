### webkit key (profile pass)

**parent pid 7182** — 1410 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 644 | 17.5 | JavaScript 549, Other 53, Profiler 37, GC / CC 6 | 0 / 0 / 644 | subprocess_pipe_io 644, poll_wait 293, memcpy_memset 29, gc_cc 6 |
| GeckoMain | 623 | 17.0 | Idle 295, JavaScript 119, Other 64, Layout 39 | 14 / 189 / 419 | poll_wait 344, subprocess_pipe_io 68, engine_stream_read 64, paint_layout 58 |
| Renderer | 40 | 1.1 | Idle 23, Graphics 17 | 0 / 0 / 40 | poll_wait 23, webrender_render 17, memcpy_memset 2 |
| Timer | 36 | 1.0 | Other 36, Profiler 0 | 0 / 0 / 36 | poll_wait 35 |
| SwComposite | 29 | 0.8 | Other 29 | 0 / 0 / 29 | memcpy_memset 0 |
| Compositor | 16 | 0.4 | Idle 14, Other 2, Profiler 0 | 0 / 0 / 16 | poll_wait 14, memcpy_memset 1, paint_layout 0 |
| WRRenderBackend#0 | 13 | 0.4 | Other 13 | 0 / 0 / 13 |  |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 324; `[libxul.so]` 185; `__memmove_avx_unaligned_erms [libc.so.6]` 30; `[unknown]` 13; `[axiosozo-dev]` 11; `__lll_lock_wait [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `mprotect [libc.so.6]` 4

**tab pid 7270** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, Other 1, JavaScript 0, DOM 0 | 0 / 0 / 6 | poll_wait 5 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libxul.so]` 1

**tab pid 7344** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7371** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

