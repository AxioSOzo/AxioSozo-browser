### chromium switch-to-gecko (profile pass)

**parent pid 3296** — 204 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 136 | 0.9 | GC / CC 55, Idle 26, JavaScript 23, Layout 16 | 4 / 30 / 102 | gc_cc 56, poll_wait 30, paint_layout 7, memcpy_memset 3 |
| DOM Worker | 25 | 0.2 | JavaScript 17, Other 5, Idle 1, GC / CC 1 | 0 / 0 / 25 | subprocess_pipe_io 25, poll_wait 14, worker_messaging 1, gc_cc 1 |
| Renderer | 22 | 0.1 | Graphics 13, Idle 8, Other 1 | 0 / 0 / 22 | webrender_render 13, poll_wait 8 |
| IPC I/O Parent | 6 | 0.0 | Idle 6, Other 0 | 0 / 0 / 6 |  |
| Compositor | 4 | 0.0 | Idle 4, Profiler 0 | 0 / 0 / 4 | poll_wait 4, paint_layout 0 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 | poll_wait 1 |
| SwComposite | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `[libxul.so]` 84; `poll@@GLIBC_2.2.5 [libc.so.6]` 26; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 6; `[libc.so.6]` 4; `getTabToAdopt (chrome://browser/content/browser-init.js:83:16)[44]` 4; `madvise@@GLIBC_2.2.5 [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[axiosozo-dev]` 2

**tab pid 3988** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Other 1, Layout 1 | 0 / 0 / 4 | poll_wait 3, paint_layout 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 3482** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 1 | 0.0 | Other 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `PR_IntervalNow [libnspr4.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libxul.so]` 0

**tab pid 3464** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[]` 0

