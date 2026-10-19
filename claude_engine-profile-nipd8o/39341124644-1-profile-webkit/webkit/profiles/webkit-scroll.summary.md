### webkit scroll (profile pass)

**parent pid 7182** — 5957 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 3071 | 17.9 | JavaScript 2555, Other 282, Profiler 187, GC / CC 46 | 0 / 0 / 3071 | subprocess_pipe_io 3071, poll_wait 1242, memcpy_memset 199, gc_cc 47 |
| GeckoMain | 2390 | 13.9 | Idle 1242, JavaScript 542, Other 270, GC / CC 162 | 262 / 437 / 1690 | poll_wait 1420, engine_stream_read 368, subprocess_pipe_io 260, bgra_to_rgba 235 |
| Timer | 178 | 1.0 | Other 178, Profiler 0 | 0 / 0 / 178 | poll_wait 176, memcpy_memset 0 |
| Renderer | 135 | 0.8 | Idle 81, Graphics 53 | 0 / 0 / 135 | poll_wait 85, webrender_render 53, memcpy_memset 2 |
| SwComposite | 87 | 0.5 | Other 87 | 0 / 0 / 87 | memcpy_memset 2 |
| WRRenderBackend#0 | 38 | 0.2 | Other 38 | 0 / 0 / 38 | poll_wait 0 |
| Compositor | 33 | 0.2 | Idle 30, Other 3, Profiler 0 | 0 / 0 / 33 | poll_wait 30, memcpy_memset 2, webrender_render 0 |
| DOM Worker | 12 | 0.5 | Other 10, GC / CC 2, Idle 0 | 0 / 0 / 12 | gc_cc 2, worker_messaging 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1374; `[libxul.so]` 449; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 233; `__memmove_avx_unaligned_erms [libc.so.6]` 103; `[unknown]` 34; `[axiosozo-dev]` 27; `[linux-vdso.so.1]` 16; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 12

**tab pid 7366** — 14 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 11 | 0.1 | GC / CC 7, Idle 4 | 0 / 0 / 11 | gc_cc 7, poll_wait 4 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 7; `__syscall_cancel_arch [libc.so.6]` 4

**tab pid 7275** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.1 | GC / CC 7, Idle 2 | 0 / 0 / 9 | gc_cc 7, poll_wait 3 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 6; `__syscall_cancel_arch [libc.so.6]` 3

**tab pid 7325** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.0 | Idle 4, GC / CC 2, Other 0 | 0 / 0 / 6 | poll_wait 5, gc_cc 2 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0

