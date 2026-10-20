### gecko-debian scroll (profile pass)

**parent pid 8088** — 1032 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 677 | 33.2 | Graphics 609, Idle 67, Other 1 | 0 / 0 / 677 | webrender_render 609, poll_wait 69, memcpy_memset 0 |
| GeckoMain | 138 | 6.8 | Idle 66, GC / CC 37, Other 18, Graphics 7 | 0 / 5 / 133 | poll_wait 85, gc_cc 37, paint_layout 7, memcpy_memset 2 |
| WRRenderBackend#0 | 73 | 3.6 | Other 73 | 0 / 0 / 73 | memcpy_memset 0 |
| DOM Worker | 45 | 2.2 | GC / CC 44, Idle 1 | 0 / 0 / 45 | gc_cc 44, memcpy_memset 20, poll_wait 2, worker_messaging 1 |
| SwComposite | 34 | 1.7 | Other 34 | 0 / 0 / 34 |  |
| Compositor | 30 | 1.5 | Idle 30, Other 0, Profiler 0 | 0 / 0 / 30 | poll_wait 30, webrender_render 0 |
| WRSceneBuilder#0 | 21 | 1.0 | Other 21 | 0 / 0 / 21 |  |
| IPC I/O Parent | 8 | 0.4 | Idle 8, Other 0 | 0 / 0 / 8 |  |

Main thread, top self: `[libc.so.6]` 76; `[libxul.so]` 52; `getrusage@@GLIBC_2.2.5 [libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall@@GLIBC_2.2.5 [libc.so.6]` 1; `[axiosozo-dev]` 1; `mmap@@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 1

**tab pid 8336** — 101 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 85 | 4.2 | Idle 58, Graphics 12, Other 8, JavaScript 3 | 0 / 4 / 81 | poll_wait 59, paint_layout 14, mozafterpaint_events 0 |
| IPC I/O Child | 15 | 0.7 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 |  |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 64; `[libxul.so]` 18; `[]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `g_main_context_default [libglib-2.0.so.0]` 0; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 0; `PR_IntervalNow [libnspr4.so]` 0; `std::__detail::_Prime_rehash_policy::_M_need_rehash(unsigned long, uns` 0

**tab pid 8374** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 0

**tab pid 8422** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 0

