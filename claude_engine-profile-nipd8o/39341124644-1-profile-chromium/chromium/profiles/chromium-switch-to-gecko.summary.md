### chromium switch-to-gecko (profile pass)

**parent pid 3294** — 188 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 124 | 0.8 | GC / CC 53, JavaScript 19, Idle 19, Layout 17 | 0 / 30 / 94 | gc_cc 53, poll_wait 20, memcpy_memset 9, paint_layout 5 |
| DOM Worker | 24 | 0.2 | JavaScript 15, Other 6, Idle 2, GC / CC 1 | 0 / 0 / 24 | subprocess_pipe_io 24, poll_wait 14, worker_messaging 2, gc_cc 1 |
| Renderer | 22 | 0.1 | Graphics 15, Idle 7 | 0 / 0 / 22 | webrender_render 15, poll_wait 7 |
| IPC I/O Parent | 6 | 0.0 | Idle 5, Other 1 | 0 / 0 / 6 | poll_wait 0 |
| Compositor | 4 | 0.0 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, paint_layout 0 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `[libxul.so]` 79; `poll [libc.so.6]` 19; `madvise [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[unknown]` 3; `mprotect [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `TextureChild::ActorDestroy` 2

**tab pid 3962** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 4, Graphics 0 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `[libxul.so]` 0

**tab pid 3460** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0, Profiler 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 0; `[libxul.so]` 0

**tab pid 3479** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3

