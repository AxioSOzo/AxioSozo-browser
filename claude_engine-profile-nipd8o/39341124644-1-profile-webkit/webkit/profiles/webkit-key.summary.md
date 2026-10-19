### webkit key (profile pass)

**parent pid 7182** — 1380 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 641 | 17.5 | JavaScript 553, Other 55, Profiler 23, GC / CC 10 | 0 / 0 / 641 | subprocess_pipe_io 641, poll_wait 305, memcpy_memset 26, gc_cc 10 |
| GeckoMain | 590 | 16.1 | Idle 285, JavaScript 100, Other 70, Layout 48 | 6 / 167 / 417 | poll_wait 321, paint_layout 74, engine_stream_read 53, subprocess_pipe_io 44 |
| Renderer | 41 | 1.1 | Idle 26, Graphics 15 | 0 / 0 / 41 | poll_wait 26, webrender_render 15, memcpy_memset 2 |
| Timer | 39 | 1.1 | Other 39, Profiler 0 | 0 / 0 / 39 | poll_wait 38, memcpy_memset 0 |
| SwComposite | 30 | 0.8 | Other 30 | 0 / 0 / 30 | memcpy_memset 1 |
| Compositor | 15 | 0.4 | Idle 15 | 0 / 0 / 15 | poll_wait 15 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | poll_wait 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 310; `[libxul.so]` 168; `__memmove_avx_unaligned_erms [libc.so.6]` 29; `[unknown]` 18; `[axiosozo-dev]` 9; `__memset_avx2_unaligned_erms [libc.so.6]` 7; `__lll_lock_wait [libc.so.6]` 6; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5

**tab pid 7275** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, Other 1, JavaScript 0 | 0 / 0 / 6 | poll_wait 6 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[libxul.so]` 0; `__memcmp_avx2_movbe [libc.so.6]` 0

**tab pid 7325** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0

**tab pid 7801** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

