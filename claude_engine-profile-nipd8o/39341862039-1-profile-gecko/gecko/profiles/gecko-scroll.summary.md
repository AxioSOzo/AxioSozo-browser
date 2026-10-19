### gecko scroll (profile pass)

**parent pid 3095** — 963 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 659 | 32.2 | Graphics 597, Idle 62 | 0 / 0 / 659 | webrender_render 597, poll_wait 63, memcpy_memset 0 |
| GeckoMain | 140 | 6.8 | Idle 66, GC / CC 37, Other 18, JavaScript 8 | 2 / 6 / 131 | poll_wait 86, gc_cc 37, paint_layout 6, memcpy_memset 1 |
| WRRenderBackend#0 | 71 | 3.5 | Other 71 | 0 / 0 / 71 | memcpy_memset 1 |
| SwComposite | 30 | 1.5 | Other 30 | 0 / 0 / 30 | memcpy_memset 1 |
| Compositor | 29 | 1.4 | Idle 28, Other 0 | 0 / 0 / 29 | poll_wait 28, webrender_render 0, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 20 | 1.0 | Other 20 | 0 / 0 / 20 | poll_wait 0, memcpy_memset 0 |
| IPC I/O Parent | 8 | 0.4 | Idle 8, Other 0, Profiler 0 | 0 / 0 / 8 |  |
| DOM Worker | 2 | 0.1 | GC / CC 1, Idle 1 | 0 / 0 / 2 | poll_wait 1, gc_cc 1, worker_messaging 1 |

Main thread, top self: `poll [libc.so.6]` 71; `[libxul.so]` 54; `dispatch (chrome://remote/content/marionette/server.sys.mjs:306:17)[75` 2; `__lll_lock_wait [libc.so.6]` 2; `recvmsg [libc.so.6]` 2; `[libgdk-3.so.0]` 1; `g_mutex_lock [libglib-2.0.so.0]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3344** — 99 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 84 | 4.1 | Idle 60, Graphics 13, Other 5, JavaScript 2 | 0 / 2 / 81 | poll_wait 62, paint_layout 13, memcpy_memset 0 |
| IPC I/O Child | 14 | 0.7 | Idle 14, Other 0 | 0 / 0 / 14 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 61; `[libxul.so]` 19; `[]` 1; `sendmsg [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `g_main_context_default [libglib-2.0.so.0]` 0; `write [libc.so.6]` 0; `mprotect [libc.so.6]` 0

**tab pid 3247** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0

**tab pid 3434** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

