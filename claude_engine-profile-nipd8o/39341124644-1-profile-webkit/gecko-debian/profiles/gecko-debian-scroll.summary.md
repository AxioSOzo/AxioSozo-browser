### gecko-debian scroll (profile pass)

**parent pid 8094** — 1030 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 684 | 33.6 | Graphics 622, Idle 61 | 0 / 0 / 684 | webrender_render 622, poll_wait 62, memcpy_memset 3 |
| GeckoMain | 142 | 7.0 | Idle 68, GC / CC 42, Other 13, Graphics 6 | 0 / 7 / 135 | poll_wait 82, gc_cc 42, paint_layout 8, memcpy_memset 2 |
| WRRenderBackend#0 | 74 | 3.6 | Other 74 | 0 / 0 / 74 |  |
| SwComposite | 34 | 1.6 | Other 34 | 0 / 0 / 34 | memcpy_memset 1 |
| DOM Worker | 33 | 1.6 | GC / CC 33, Idle 0 | 0 / 0 / 33 | gc_cc 33, memcpy_memset 19, poll_wait 1, worker_messaging 0 |
| Compositor | 30 | 1.5 | Idle 30, Other 0 | 0 / 0 / 30 | poll_wait 30, paint_layout 0 |
| WRSceneBuilder#0 | 21 | 1.0 | Other 21 | 0 / 0 / 21 | poll_wait 1 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 74; `[libxul.so]` 56; `[axiosozo-dev]` 3; `mprotect [libc.so.6]` 2; `syscall [libc.so.6]` 1; `__memcmp_avx2_movbe [libc.so.6]` 1; `gdk_threads_enter [libgdk-3.so.0]` 1; `[libgobject-2.0.so.0]` 1

**tab pid 8342** — 106 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 89 | 4.4 | Idle 65, Graphics 12, Other 5, JavaScript 2 | 0 / 3 / 86 | poll_wait 65, paint_layout 14, memcpy_memset 0, webrender_render 0 |
| IPC I/O Child | 15 | 0.7 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | memcpy_memset 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 66; `[libxul.so]` 19; `[]` 2; `syscall [libc.so.6]` 0; `getcontext [libc.so.6]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 8245** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8345** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

