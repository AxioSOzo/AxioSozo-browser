### chromium raf (profile pass)

**parent pid 3316** — 3666 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 2209 | 69.8 | JavaScript 1797, Other 237, Profiler 148, GC / CC 27 | 0 / 0 / 2209 | subprocess_pipe_io 2209, poll_wait 530, gc_cc 27, memcpy_memset 15 |
| GeckoMain | 1125 | 35.5 | Idle 506, JavaScript 319, Other 147, GC / CC 65 | 139 / 284 / 701 | poll_wait 568, subprocess_pipe_io 204, engine_stream_read 192, bgra_to_rgba 125 |
| Renderer | 135 | 4.3 | Idle 79, Graphics 54, Profiler 1, Other 0 | 0 / 0 / 135 | poll_wait 81, webrender_render 56 |
| SwComposite | 92 | 2.9 | Other 92 | 0 / 0 / 92 |  |
| WRRenderBackend#0 | 35 | 1.1 | Other 35 | 0 / 0 / 35 | poll_wait 1 |
| Timer | 34 | 1.1 | Other 34 | 0 / 0 / 34 | poll_wait 34 |
| Compositor | 26 | 0.8 | Idle 26, Other 1, Profiler 0 | 0 / 0 / 26 | poll_wait 25, webrender_render 0 |
| WRSceneBuilder#0 | 8 | 0.3 | Other 8 | 0 / 0 / 8 |  |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 514; `[libxul.so]` 207; `[libc.so.6]` 142; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 120; `write@@GLIBC_2.2.5 [libc.so.6]` 27; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 22; `[unknown]` 16; `[axiosozo-dev]` 11

**tab pid 3981** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | GC / CC 4, Idle 2 | 0 / 0 / 7 | gc_cc 4, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 3; `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `[]` 0

**tab pid 4096** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 4091** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

