### webkit raf (profile pass)

**parent pid 7167** — 3253 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 1931 | 61.9 | JavaScript 1541, Other 211, Profiler 153, GC / CC 25 | 0 / 0 / 1931 | subprocess_pipe_io 1931, poll_wait 501, gc_cc 26, memcpy_memset 24 |
| GeckoMain | 1038 | 33.2 | Idle 468, JavaScript 281, Other 136, DOM 63 | 111 / 274 / 653 | poll_wait 524, engine_stream_read 180, subprocess_pipe_io 167, bgra_to_rgba 103 |
| Renderer | 122 | 3.9 | Idle 71, Graphics 51, Profiler 0 | 0 / 0 / 122 | poll_wait 75, webrender_render 51 |
| SwComposite | 73 | 2.3 | Other 73 | 0 / 0 / 73 |  |
| Timer | 31 | 1.0 | Other 31, Profiler 0 | 0 / 0 / 31 | poll_wait 31 |
| WRRenderBackend#0 | 29 | 0.9 | Other 29 | 0 / 0 / 29 |  |
| Compositor | 22 | 0.7 | Idle 22, Other 0 | 0 / 0 / 22 | poll_wait 22 |
| WRSceneBuilder#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `[libc.so.6]` 662; `[libxul.so]` 203; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 99; `[unknown]` 21; `[axiosozo-dev]` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[linux-vdso.so.1]` 3

**tab pid 7700** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 4, Idle 2, Profiler 1 | 0 / 0 / 6 | gc_cc 4, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 4; `[libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 7332** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

**tab pid 7706** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

