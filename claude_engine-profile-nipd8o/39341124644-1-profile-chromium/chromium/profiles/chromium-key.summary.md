### chromium key (profile pass)

**parent pid 3294** — 1318 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 616 | 16.7 | JavaScript 526, Other 56, Profiler 26, GC / CC 8 | 0 / 0 / 616 | subprocess_pipe_io 616, poll_wait 268, memcpy_memset 39, gc_cc 8 |
| GeckoMain | 545 | 14.8 | Idle 220, JavaScript 123, Other 65, GC / CC 39 | 15 / 182 / 347 | poll_wait 268, subprocess_pipe_io 67, paint_layout 54, engine_stream_read 46 |
| Renderer | 43 | 1.2 | Idle 26, Graphics 16, Other 1 | 0 / 0 / 43 | poll_wait 26, webrender_render 16, memcpy_memset 1 |
| SwComposite | 35 | 0.9 | Other 35 | 0 / 0 / 35 | memcpy_memset 0 |
| Timer | 33 | 0.9 | Other 33, Profiler 0 | 0 / 0 / 33 | poll_wait 33, memcpy_memset 0 |
| Compositor | 19 | 0.5 | Idle 17, Other 1, Profiler 0 | 0 / 0 / 19 | poll_wait 17, memcpy_memset 1, paint_layout 0, webrender_render 0 |
| WRRenderBackend#0 | 16 | 0.4 | Other 16 | 0 / 0 / 16 |  |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 227; `[libxul.so]` 206; `__memmove_avx_unaligned_erms [libc.so.6]` 28; `[unknown]` 14; `[axiosozo-dev]` 9; `write [libc.so.6]` 8; `recvmsg [libc.so.6]` 8; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 6

**tab pid 3389** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0, Other 0 | 0 / 0 / 7 | poll_wait 6 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[libxul.so]` 0; `__strlen_avx2 [libc.so.6]` 0

**tab pid 3479** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3460** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

