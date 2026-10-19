### gecko key (profile pass)

**parent pid 2948** — 326 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 211 | 5.6 | Idle 44, Layout 42, GC / CC 28, Other 28 | 1 / 32 / 178 | poll_wait 70, paint_layout 61, gc_cc 28, memcpy_memset 3 |
| Renderer | 37 | 1.0 | Idle 22, Graphics 15 | 0 / 0 / 37 | poll_wait 21, webrender_render 15 |
| Compositor | 21 | 0.6 | Idle 18, Other 3, Profiler 0 | 0 / 0 / 21 | poll_wait 18, memcpy_memset 3, webrender_render 0, paint_layout 0 |
| WRRenderBackend#0 | 20 | 0.5 | Other 20 | 0 / 0 / 20 |  |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 |  |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 0 |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 |  |
| DOM Worker | 3 | 0.1 | GC / CC 3, Idle 0 | 0 / 0 / 3 | gc_cc 3, memcpy_memset 2, worker_messaging 0, poll_wait 0 |

Main thread, top self: `[libxul.so]` 131; `poll@@GLIBC_2.2.5 [libc.so.6]` 45; `[libc.so.6]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `[axiosozo-dev]` 3; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 3; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 3201** — 78 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 70 | 1.9 | Idle 27, Other 13, JavaScript 9, GC / CC 9 | 0 / 9 / 61 | poll_wait 28, gc_cc 10, paint_layout 3 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 31; `poll@@GLIBC_2.2.5 [libc.so.6]` 26; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 3; `[]` 2; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `[linux-vdso.so.1]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1

**tab pid 3037** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, GC / CC 0 | 0 / 1 / 6 | poll_wait 6, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 6; `[libxul.so]` 1; `[libc.so.6]` 1

**tab pid 3120** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 0

