### webkit scroll (profile pass)

**parent pid 7182** — 5993 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 3065 | 17.8 | JavaScript 2585, Other 265, Profiler 161, GC / CC 54 | 0 / 0 / 3065 | subprocess_pipe_io 3065, poll_wait 1340, memcpy_memset 154, gc_cc 56 |
| GeckoMain | 2449 | 14.2 | Idle 1203, JavaScript 646, Other 268, GC / CC 153 | 272 / 531 / 1646 | poll_wait 1371, engine_stream_read 408, subprocess_pipe_io 324, bgra_to_rgba 241 |
| Timer | 167 | 1.0 | Other 167, Profiler 0 | 0 / 0 / 167 | poll_wait 166, memcpy_memset 0 |
| Renderer | 132 | 0.8 | Idle 75, Graphics 57, Other 0 | 0 / 0 / 132 | poll_wait 78, webrender_render 57, memcpy_memset 2 |
| SwComposite | 84 | 0.5 | Other 84 | 0 / 0 / 84 | memcpy_memset 1 |
| WRRenderBackend#0 | 36 | 0.2 | Other 36 | 0 / 0 / 36 | poll_wait 1, memcpy_memset 0 |
| Compositor | 33 | 0.2 | Idle 29, Other 4 | 0 / 0 / 33 | poll_wait 29, memcpy_memset 3 |
| DOM Worker | 13 | 0.6 | Other 10, GC / CC 2, Idle 0 | 0 / 0 / 13 | poll_wait 2, gc_cc 2, worker_messaging 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1363; `[libxul.so]` 464; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 238; `__memmove_avx_unaligned_erms [libc.so.6]` 158; `[unknown]` 32; `[axiosozo-dev]` 24; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 17; `__memset_avx2_unaligned_erms [libc.so.6]` 16

**tab pid 7371** — 15 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.1 | GC / CC 8, Idle 4, Other 0, Profiler 0 | 0 / 0 / 12 | gc_cc 8, poll_wait 5, memcpy_memset 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 7; `__syscall_cancel_arch [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0; `g_thread_self [libglib-2.0.so.0]` 0; `__lll_lock_wake [libc.so.6]` 0

**tab pid 7270** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.1 | GC / CC 7, Idle 2 | 0 / 0 / 9 | gc_cc 7, poll_wait 2, memcpy_memset 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 5; `__syscall_cancel_arch [libc.so.6]` 2; `mmap64 [libc.so.6]` 1; `[]` 1

**tab pid 7720** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3

