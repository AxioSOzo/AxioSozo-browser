### chromium raf (profile pass)

**parent pid 3294** — 3689 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 2165 | 68.6 | JavaScript 1735, Other 258, Profiler 142, GC / CC 30 | 0 / 0 / 2165 | subprocess_pipe_io 2165, poll_wait 501, memcpy_memset 147, gc_cc 32 |
| GeckoMain | 1181 | 37.5 | Idle 492, JavaScript 354, Other 147, GC / CC 95 | 141 / 333 / 707 | poll_wait 560, subprocess_pipe_io 242, engine_stream_read 203, memcpy_memset 147 |
| Renderer | 136 | 4.3 | Idle 80, Graphics 54, Profiler 1, Other 1 | 0 / 0 / 136 | poll_wait 82, webrender_render 55, memcpy_memset 1 |
| SwComposite | 98 | 3.1 | Other 98 | 0 / 0 / 98 | memcpy_memset 1 |
| WRRenderBackend#0 | 38 | 1.2 | Other 38 | 0 / 0 / 38 | poll_wait 0 |
| Timer | 31 | 1.0 | Other 31 | 0 / 0 / 31 | poll_wait 31, memcpy_memset 0 |
| Compositor | 27 | 0.9 | Idle 27, Other 0 | 0 / 0 / 27 | poll_wait 27, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 9 | 0.3 | Other 9 | 0 / 0 / 9 |  |

Main thread, top self: `poll [libc.so.6]` 505; `[libxul.so]` 245; `__memmove_avx_unaligned_erms [libc.so.6]` 139; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 128; `write [libc.so.6]` 31; `recvmsg [libc.so.6]` 25; `[axiosozo-dev]` 17; `[unknown]` 15

**tab pid 3389** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 11 | 0.3 | GC / CC 9, Idle 2 | 0 / 0 / 11 | gc_cc 9, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 6; `poll [libc.so.6]` 2; `[]` 1; `__lll_lock_wait [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0

**tab pid 3479** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.3 | GC / CC 6, Idle 3, Profiler 0, Other 0 | 0 / 0 / 9 | gc_cc 6, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 6; `poll [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3962** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 4, Idle 2 | 0 / 0 / 6 | gc_cc 4, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 4; `poll [libc.so.6]` 2

