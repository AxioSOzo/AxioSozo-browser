### webkit raf (profile pass)

**parent pid 7182** — 3263 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 1959 | 62.6 | JavaScript 1577, Other 211, Profiler 142, GC / CC 30 | 0 / 0 / 1959 | subprocess_pipe_io 1959, poll_wait 481, memcpy_memset 118, gc_cc 30 |
| GeckoMain | 1039 | 33.2 | Idle 453, JavaScript 319, Other 127, DOM 60 | 120 / 300 / 619 | poll_wait 497, subprocess_pipe_io 189, engine_stream_read 187, bgra_to_rgba 112 |
| Renderer | 107 | 3.4 | Idle 71, Graphics 35, Other 1 | 0 / 0 / 107 | poll_wait 72, webrender_render 35, memcpy_memset 3 |
| SwComposite | 67 | 2.2 | Other 67 | 0 / 0 / 67 | memcpy_memset 2 |
| Timer | 32 | 1.0 | Other 32 | 0 / 0 / 32 | poll_wait 32, memcpy_memset 0 |
| WRRenderBackend#0 | 29 | 0.9 | Other 29 | 0 / 0 / 29 |  |
| Compositor | 22 | 0.7 | Idle 22, Other 0, Profiler 0 | 0 / 0 / 22 | poll_wait 22, webrender_render 0 |
| WRSceneBuilder#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 527; `[libxul.so]` 203; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 108; `__memmove_avx_unaligned_erms [libc.so.6]` 87; `[unknown]` 16; `[axiosozo-dev]` 15; `__memset_avx2_unaligned_erms [libc.so.6]` 11; `__lll_lock_wait [libc.so.6]` 9

**tab pid 7706** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | GC / CC 3, Idle 2, Other 0 | 0 / 0 / 5 | gc_cc 3, poll_wait 3, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `madvise [libc.so.6]` 0

**tab pid 7712** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 7347** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `read [libc.so.6]` 0; `PR_IntervalNow [libnspr4.so]` 0

