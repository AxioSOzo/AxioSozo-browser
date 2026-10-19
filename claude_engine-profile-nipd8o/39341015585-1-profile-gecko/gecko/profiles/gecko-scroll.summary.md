### gecko scroll (profile pass)

**parent pid 2948** — 1049 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 699 | 33.7 | Graphics 634, Idle 64, Other 0 | 0 / 0 / 699 | webrender_render 634, poll_wait 66 |
| GeckoMain | 159 | 7.7 | Idle 72, GC / CC 45, Other 22, JavaScript 8 | 2 / 8 / 150 | poll_wait 97, gc_cc 45, paint_layout 6, memcpy_memset 3 |
| WRRenderBackend#0 | 82 | 3.9 | Other 82, Profiler 0 | 0 / 0 / 82 | poll_wait 0 |
| SwComposite | 41 | 2.0 | Other 41 | 0 / 0 / 41 |  |
| Compositor | 33 | 1.6 | Idle 32, Other 0, Profiler 0 | 0 / 0 / 33 | poll_wait 32, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 |  |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 0 |
| DOM Worker | 1 | 0.1 | GC / CC 1, Idle 0 | 0 / 0 / 1 | gc_cc 1, worker_messaging 0, poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 73; `[libxul.so]` 61; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 5; `[libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 2; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 2; `madvise@@GLIBC_2.2.5 [libc.so.6]` 2; `read@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 3201** — 115 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 98 | 4.7 | Idle 64, Graphics 18, Other 8, DOM 3 | 0 / 3 / 95 | poll_wait 65, paint_layout 19, gc_cc 0, webrender_render 0 |
| IPC I/O Child | 16 | 0.8 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 64; `[libxul.so]` 28; `[libc.so.6]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 1; `read@@GLIBC_2.2.5 [libc.so.6]` 1; `[unknown]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3284** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3204** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0

