### chromium raf (profile pass)

**parent pid 3296** — 3681 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 2222 | 70.0 | JavaScript 1821, Other 237, Profiler 139, GC / CC 25 | 0 / 0 / 2222 | subprocess_pipe_io 2222, poll_wait 504, memcpy_memset 26, gc_cc 26 |
| GeckoMain | 1129 | 35.5 | Idle 515, JavaScript 310, Other 143, GC / CC 69 | 133 / 285 / 711 | poll_wait 573, subprocess_pipe_io 206, engine_stream_read 190, bgra_to_rgba 117 |
| Renderer | 135 | 4.2 | Idle 86, Graphics 49 | 0 / 0 / 135 | poll_wait 87, webrender_render 49 |
| SwComposite | 90 | 2.8 | Other 90 | 0 / 0 / 90 |  |
| WRRenderBackend#0 | 35 | 1.1 | Other 35 | 0 / 0 / 35 | poll_wait 1 |
| Timer | 35 | 1.1 | Other 35 | 0 / 0 / 35 | poll_wait 35 |
| Compositor | 26 | 0.8 | Idle 25, Other 0, Profiler 0 | 0 / 0 / 26 | poll_wait 25, webrender_render 0 |
| WRSceneBuilder#0 | 8 | 0.3 | Other 8 | 0 / 0 / 8 |  |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 521; `[libxul.so]` 198; `[libc.so.6]` 135; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 113; `write@@GLIBC_2.2.5 [libc.so.6]` 36; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 26; `[axiosozo-dev]` 21; `[unknown]` 12

**tab pid 3988** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | GC / CC 5, Idle 2, Other 0 | 0 / 0 / 7 | gc_cc 5, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 3; `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 1; `[libc.so.6]` 1

**tab pid 4105** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 4100** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0

