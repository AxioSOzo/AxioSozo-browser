### chromium key (profile pass)

**parent pid 3316** — 1387 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 679 | 18.4 | JavaScript 584, Other 56, Profiler 31, GC / CC 8 | 0 / 0 / 679 | subprocess_pipe_io 679, poll_wait 272, gc_cc 8, memcpy_memset 2 |
| GeckoMain | 549 | 14.9 | Idle 246, JavaScript 100, Other 56, Layout 43 | 15 / 180 / 354 | poll_wait 288, subprocess_pipe_io 69, paint_layout 67, engine_stream_read 41 |
| Renderer | 45 | 1.2 | Idle 25, Graphics 21 | 0 / 0 / 45 | poll_wait 25, webrender_render 21 |
| Timer | 38 | 1.0 | Other 38 | 0 / 0 / 38 | poll_wait 38 |
| SwComposite | 34 | 0.9 | Other 34 | 0 / 0 / 34 |  |
| Compositor | 16 | 0.4 | Idle 15, Other 1 | 0 / 0 / 16 | poll_wait 15, memcpy_memset 1, webrender_render 0, paint_layout 0 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | poll_wait 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 |  |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 251; `[libxul.so]` 186; `[libc.so.6]` 33; `[unknown]` 18; `[axiosozo-dev]` 10; `write@@GLIBC_2.2.5 [libc.so.6]` 7; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 6; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 6

**tab pid 3409** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0, DOM 0, Other 0 | 0 / 1 / 6 | poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 6; `[libxul.so]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[unknown]` 0; `__tls_get_addr@@GLIBC_2.3 [ld-linux-x86-64.so.2]` 0

**tab pid 4091** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 4096** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

