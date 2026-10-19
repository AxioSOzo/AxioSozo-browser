### chromium raf (profile pass)

**parent pid 3306** — 3638 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 2189 | 69.1 | JavaScript 1785, Other 236, Profiler 149, GC / CC 20 | 0 / 0 / 2189 | subprocess_pipe_io 2189, poll_wait 494, memcpy_memset 146, gc_cc 21 |
| GeckoMain | 1130 | 35.7 | Idle 509, JavaScript 331, Other 142, GC / CC 58 | 129 / 292 / 708 | poll_wait 569, engine_stream_read 196, subprocess_pipe_io 194, bgra_to_rgba 131 |
| Renderer | 127 | 4.0 | Idle 78, Graphics 49 | 0 / 0 / 127 | poll_wait 80, webrender_render 49, memcpy_memset 3 |
| SwComposite | 85 | 2.7 | Other 85 | 0 / 0 / 85 | memcpy_memset 1 |
| Timer | 37 | 1.2 | Other 37, Profiler 0 | 0 / 0 / 37 | poll_wait 36, memcpy_memset 0 |
| WRRenderBackend#0 | 34 | 1.1 | Other 34 | 0 / 0 / 34 | poll_wait 0, memcpy_memset 0 |
| Compositor | 25 | 0.8 | Idle 25, Other 1, Profiler 0 | 0 / 0 / 25 | poll_wait 25, webrender_render 0 |
| WRSceneBuilder#0 | 8 | 0.3 | Other 8 | 0 / 0 / 8 |  |

Main thread, top self: `poll [libc.so.6]` 512; `[libxul.so]` 215; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 122; `__memmove_avx_unaligned_erms [libc.so.6]` 110; `write [libc.so.6]` 35; `recvmsg [libc.so.6]` 24; `[unknown]` 19; `__memset_avx2_unaligned_erms [libc.so.6]` 12

**tab pid 3408** — 12 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.4 | GC / CC 11, Idle 1, Other 0 | 0 / 0 / 12 | gc_cc 11, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 9; `poll [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `[]` 0

**tab pid 3504** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.3 | GC / CC 6, Idle 2, Profiler 2 | 0 / 0 / 10 | gc_cc 7, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 6; `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1; `getrusage [libc.so.6]` 0

**tab pid 3972** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 4, Idle 2, Other 0 | 0 / 0 / 6 | gc_cc 4, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 2; `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `__printf_fp_buffer_1.isra.0 [libc.so.6]` 1; `[]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

