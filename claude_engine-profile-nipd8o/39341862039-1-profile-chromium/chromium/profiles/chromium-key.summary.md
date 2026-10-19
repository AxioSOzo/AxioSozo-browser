### chromium key (profile pass)

**parent pid 3306** — 1343 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 660 | 17.9 | JavaScript 581, Other 42, Profiler 26, GC / CC 11 | 0 / 0 / 660 | subprocess_pipe_io 660, poll_wait 297, memcpy_memset 40, gc_cc 11 |
| GeckoMain | 530 | 14.4 | Idle 240, JavaScript 103, Other 74, Layout 45 | 14 / 152 / 365 | poll_wait 288, paint_layout 64, engine_stream_read 50, subprocess_pipe_io 37 |
| Renderer | 43 | 1.2 | Idle 26, Graphics 17 | 0 / 0 / 43 | poll_wait 27, webrender_render 17, memcpy_memset 1 |
| Timer | 37 | 1.0 | Other 37, Profiler 0 | 0 / 0 / 37 | poll_wait 37 |
| SwComposite | 33 | 0.9 | Other 33 | 0 / 0 / 33 | memcpy_memset 1 |
| Compositor | 16 | 0.4 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 16, webrender_render 0, paint_layout 0 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | poll_wait 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 243; `[libxul.so]` 173; `__memmove_avx_unaligned_erms [libc.so.6]` 22; `[unknown]` 18; `[axiosozo-dev]` 12; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 8; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 5

**tab pid 3408** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, JavaScript 1 | 0 / 1 / 5 | poll_wait 5 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `[libxul.so]` 1; `__strlen_avx2 [libc.so.6]` 0; `[unknown]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[0` 0

**tab pid 3465** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3504** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[]` 0

