### gecko key (profile pass)

**parent pid 2809** — 256 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 168 | 4.5 | Idle 43, Layout 30, GC / CC 28, Other 22 | 1 / 22 / 145 | poll_wait 59, paint_layout 48, gc_cc 28, array_buffer_copy 3 |
| Renderer | 29 | 0.8 | Idle 20, Graphics 9, Other 0 | 0 / 0 / 29 | poll_wait 19, webrender_render 9 |
| WRRenderBackend#0 | 17 | 0.5 | Other 17, Profiler 0 | 0 / 0 / 17 |  |
| Compositor | 16 | 0.4 | Idle 13, Other 2, Profiler 0 | 0 / 0 / 16 | poll_wait 13, memcpy_memset 2, paint_layout 0 |
| WRSceneBuilder#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | memcpy_memset 0 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 |  |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `[libxul.so]` 93; `poll@@GLIBC_2.2.5 [libc.so.6]` 44; `[axiosozo-dev]` 7; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 3; `[libc.so.6]` 2; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 2; `[unknown]` 2; `write@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 3049** — 62 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 56 | 1.5 | Idle 22, GC / CC 8, Layout 7, Graphics 6 | 0 / 5 / 51 | poll_wait 22, gc_cc 8, paint_layout 8 |
| IPC I/O Child | 5 | 0.1 | Idle 5, Other 0 | 0 / 0 / 5 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 29; `poll@@GLIBC_2.2.5 [libc.so.6]` 22; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 1; `http://127.0.0.1:37345/engine.html:4:29[7]` 0; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 2901** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 0, GC / CC 0 | 0 / 0 / 6 | poll_wait 5, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 5; `[libxul.so]` 0

**tab pid 2988** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

