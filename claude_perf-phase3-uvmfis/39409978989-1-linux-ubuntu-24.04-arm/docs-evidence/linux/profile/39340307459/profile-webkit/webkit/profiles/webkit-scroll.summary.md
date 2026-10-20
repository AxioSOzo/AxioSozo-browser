### webkit scroll (profile pass)

**parent pid 7167** — 6041 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 3081 | 17.9 | JavaScript 2599, Other 267, Profiler 167, GC / CC 49 | 0 / 0 / 3081 | subprocess_pipe_io 3081, poll_wait 1260, gc_cc 50, memcpy_memset 32 |
| GeckoMain | 2446 | 14.2 | Idle 1273, JavaScript 529, Other 275, GC / CC 164 | 255 / 448 / 1743 | poll_wait 1437, engine_stream_read 382, subprocess_pipe_io 249, bgra_to_rgba 226 |
| Timer | 175 | 1.0 | Other 174, Profiler 0 | 0 / 0 / 175 | poll_wait 172 |
| Renderer | 150 | 0.9 | Idle 89, Graphics 58, Other 3 | 0 / 0 / 150 | poll_wait 93, webrender_render 58 |
| SwComposite | 96 | 0.6 | Other 96 | 0 / 0 / 96 |  |
| WRRenderBackend#0 | 37 | 0.2 | Other 37 | 0 / 0 / 37 | poll_wait 0 |
| Compositor | 32 | 0.2 | Idle 30, Other 2, Profiler 0 | 0 / 0 / 32 | poll_wait 30, memcpy_memset 1, webrender_render 0 |
| DOM Worker | 10 | 0.6 | Other 9, GC / CC 1, Idle 0 | 0 / 0 / 10 | gc_cc 1, worker_messaging 0, poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1538; `[libxul.so]` 515; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 222; `[unknown]` 32; `[axiosozo-dev]` 23; `[linux-vdso.so.1]` 9; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 8

**tab pid 7351** — 16 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 13 | 0.1 | GC / CC 8, Idle 5, Other 0 | 0 / 0 / 13 | gc_cc 8, poll_wait 6 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 7; `[libc.so.6]` 6; `[linux-vdso.so.1]` 0

**tab pid 7251** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.1 | GC / CC 8, Idle 2, Other 0 | 0 / 0 / 10 | gc_cc 8, poll_wait 3 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 6; `[libc.so.6]` 3; `[]` 1

**tab pid 7310** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 5, GC / CC 2, Other 0 | 0 / 0 / 7 | poll_wait 5, gc_cc 2 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 5; `[libxul.so]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

