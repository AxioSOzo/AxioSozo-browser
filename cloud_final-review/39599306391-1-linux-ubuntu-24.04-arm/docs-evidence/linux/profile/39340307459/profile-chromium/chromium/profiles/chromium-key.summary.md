### chromium key (profile pass)

**parent pid 3296** — 1418 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 676 | 18.3 | JavaScript 583, Other 45, Profiler 38, GC / CC 11 | 0 / 0 / 676 | subprocess_pipe_io 676, poll_wait 296, gc_cc 12 |
| GeckoMain | 582 | 15.8 | Idle 233, JavaScript 139, Other 67, Layout 38 | 11 / 202 / 368 | poll_wait 286, subprocess_pipe_io 70, paint_layout 64, engine_stream_read 59 |
| Renderer | 45 | 1.2 | Graphics 23, Idle 22, Profiler 0 | 0 / 0 / 45 | poll_wait 24, webrender_render 23 |
| Timer | 37 | 1.0 | Other 37, Profiler 0 | 0 / 0 / 37 | poll_wait 37 |
| SwComposite | 35 | 0.9 | Other 35 | 0 / 0 / 35 |  |
| Compositor | 17 | 0.5 | Idle 15, Other 2 | 0 / 0 / 17 | poll_wait 15, memcpy_memset 2, webrender_render 0 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 |  |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 238; `[libxul.so]` 205; `[libc.so.6]` 42; `[axiosozo-dev]` 16; `[unknown]` 15; `write@@GLIBC_2.2.5 [libc.so.6]` 11; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 9; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 9

**tab pid 3389** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 1, JavaScript 0, DOM 0 | 0 / 0 / 7 | poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 6; `[libxul.so]` 1; `g_mutex_unlock [libglib-2.0.so.0]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `[]` 0

**tab pid 4105** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `[libxul.so]` 0

**tab pid 3443** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

