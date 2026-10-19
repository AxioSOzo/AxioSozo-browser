### gecko-debian key (profile pass)

**parent pid 8090** — 330 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 212 | 5.6 | Layout 42, Idle 39, Other 36, Graphics 30 | 2 / 32 / 179 | paint_layout 66, poll_wait 65, gc_cc 29, memcpy_memset 2 |
| Renderer | 38 | 1.0 | Idle 23, Graphics 14 | 0 / 0 / 38 | poll_wait 23, webrender_render 14 |
| Compositor | 22 | 0.6 | Idle 19, Other 2, Profiler 0 | 0 / 0 / 22 | poll_wait 19, memcpy_memset 2, webrender_render 0 |
| WRRenderBackend#0 | 21 | 0.6 | Other 21, Profiler 1 | 0 / 0 / 21 |  |
| WRSceneBuilder#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | poll_wait 0, gc_cc 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 |  |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 |  |
| DOM Worker | 3 | 0.1 | GC / CC 3, Idle 0 | 0 / 0 / 3 | gc_cc 3, memcpy_memset 2, worker_messaging 0, poll_wait 0 |

Main thread, top self: `[libxul.so]` 123; `[libc.so.6]` 59; `[unknown]` 5; `[axiosozo-dev]` 4; `syscall@@GLIBC_2.2.5 [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 3; `[linux-vdso.so.1]` 2

**tab pid 8336** — 80 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 72 | 1.9 | Idle 26, Other 13, GC / CC 10, JavaScript 8 | 0 / 7 / 65 | poll_wait 27, gc_cc 10, paint_layout 8, memcpy_memset 0 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 39; `[libc.so.6]` 29; `[]` 2; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1; `g_main_context_iteration [libglib-2.0.so.0]` 0; `madvise@@GLIBC_2.2.5 [libc.so.6]` 0; `getrusage@@GLIBC_2.2.5 [libc.so.6]` 0; `prctl@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 8176** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Profiler 0, Other 0 | 0 / 0 / 7 | poll_wait 5, gc_cc 0, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 6; `[libxul.so]` 1; `[linux-vdso.so.1]` 0

**tab pid 8270** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1; `[libxul.so]` 0

