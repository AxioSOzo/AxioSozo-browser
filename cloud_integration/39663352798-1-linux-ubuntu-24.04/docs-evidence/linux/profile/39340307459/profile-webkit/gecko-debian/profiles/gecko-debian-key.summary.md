### gecko-debian key (profile pass)

**parent pid 8088** — 298 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 193 | 5.1 | Layout 42, Idle 39, GC / CC 30, Graphics 25 | 4 / 25 / 165 | poll_wait 60, paint_layout 55, gc_cc 31, subprocess_pipe_io 2 |
| Renderer | 34 | 0.9 | Idle 19, Graphics 13, Other 1 | 0 / 0 / 34 | poll_wait 19, webrender_render 13 |
| Compositor | 18 | 0.5 | Idle 17, Other 2 | 0 / 0 / 18 | poll_wait 17, memcpy_memset 2, paint_layout 0 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 |  |
| WRSceneBuilder#0 | 13 | 0.4 | Other 13, Profiler 0 | 0 / 0 / 13 |  |
| IPC I/O Parent | 9 | 0.2 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 0 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |
| DOM Worker | 3 | 0.1 | GC / CC 2, Idle 1 | 0 / 0 / 3 | gc_cc 2, poll_wait 2, memcpy_memset 1, worker_messaging 1 |

Main thread, top self: `[libxul.so]` 125; `[libc.so.6]` 50; `[axiosozo-dev]` 4; `[libgdk-3.so.0]` 2; `[unknown]` 2; `handlePlacesEvents (resource://gre/modules/NewTabUtils.sys.mjs:573:21)` 1; `next (self-hosted:1265:23)[11]` 1; `[libX11.so.6]` 1

**tab pid 8336** — 73 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 66 | 1.8 | Idle 21, GC / CC 11, Other 10, Profiler 7 | 0 / 6 / 60 | poll_wait 22, gc_cc 11, paint_layout 8, memcpy_memset 1 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 33; `[libc.so.6]` 25; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 1; `mmap@@GLIBC_2.2.5 [libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 8182** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, DOM 0, GC / CC 0, JavaScript 0 | 0 / 0 / 6 | poll_wait 6, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 6; `[libxul.so]` 0

**tab pid 8253** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1; `[linux-vdso.so.1]` 0

