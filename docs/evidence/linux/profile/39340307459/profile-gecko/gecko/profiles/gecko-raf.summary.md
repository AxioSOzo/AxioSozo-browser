### gecko raf (profile pass)

**parent pid 2809** — 1463 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 452 | 14.7 | JavaScript 166, Idle 97, GC / CC 86, DOM 62 | 39 / 276 / 138 | worker_messaging 333, poll_wait 108, gc_cc 87, memcpy_memset 6 |
| Renderer | 417 | 13.5 | Graphics 292, Idle 123, Other 2, Profiler 0 | 0 / 0 / 417 | webrender_render 292, poll_wait 121, memcpy_memset 0 |
| GeckoMain | 384 | 12.5 | Idle 103, DOM 79, JavaScript 65, GC / CC 59 | 9 / 118 / 257 | poll_wait 129, gc_cc 59, array_buffer_copy 8, memcpy_memset 7 |
| WRRenderBackend#0 | 72 | 2.3 | Other 72 | 0 / 0 / 72 |  |
| WRSceneBuilder#0 | 47 | 1.5 | Other 47 | 0 / 0 / 47 |  |
| Compositor | 38 | 1.2 | Idle 38, Other 1 | 0 / 0 / 38 | poll_wait 38, paint_layout 0, webrender_render 0 |
| SwComposite | 20 | 0.7 | Other 20 | 0 / 0 / 20 |  |
| Socket Thread | 12 | 0.4 | Other 12 | 0 / 0 / 12 | poll_wait 12 |

Main thread, top self: `[libxul.so]` 185; `poll@@GLIBC_2.2.5 [libc.so.6]` 111; `[axiosozo-dev]` 17; `[libc.so.6]` 11; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 9; `write@@GLIBC_2.2.5 [libc.so.6]` 6; `[unknown]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5

**tab pid 3049** — 200 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 183 | 5.9 | Idle 106, Layout 25, Graphics 23, Other 10 | 0 / 9 / 174 | poll_wait 106, paint_layout 33, gc_cc 7, mozafterpaint_events 0 |
| IPC I/O Child | 14 | 0.5 | Idle 14, Other 0 | 0 / 0 / 14 |  |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 106; `[libxul.so]` 59; `[]` 4; `[libc.so.6]` 4; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 3; `write@@GLIBC_2.2.5 [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 2988** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 3, JavaScript 0, Other 0, Profiler 0 | 0 / 0 / 3 | poll_wait 3 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 0

**utility pid 3038** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| IPC I/O Child | 2 | 0.1 | Idle 2 | 0 / 0 / 2 |  |
| GeckoMain | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2

