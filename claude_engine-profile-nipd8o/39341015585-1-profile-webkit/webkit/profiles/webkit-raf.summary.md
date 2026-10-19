### webkit raf (profile pass)

**parent pid 7167** — 3278 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 1907 | 60.9 | JavaScript 1549, Other 180, Profiler 143, GC / CC 35 | 0 / 0 / 1907 | subprocess_pipe_io 1907, poll_wait 495, gc_cc 36, memcpy_memset 10 |
| GeckoMain | 1094 | 34.9 | Idle 452, JavaScript 328, Other 150, DOM 70 | 134 / 307 / 654 | poll_wait 506, engine_stream_read 200, subprocess_pipe_io 198, bgra_to_rgba 116 |
| Renderer | 113 | 3.6 | Idle 72, Graphics 41 | 0 / 0 / 113 | poll_wait 74, webrender_render 41 |
| SwComposite | 70 | 2.2 | Other 70 | 0 / 0 / 70 |  |
| Timer | 34 | 1.1 | Other 34 | 0 / 0 / 34 | poll_wait 34 |
| WRRenderBackend#0 | 28 | 0.9 | Other 28 | 0 / 0 / 28 |  |
| Compositor | 23 | 0.7 | Idle 23, Other 1, Profiler 0 | 0 / 0 / 23 | poll_wait 23, webrender_render 0 |
| WRSceneBuilder#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `[libc.so.6]` 643; `[libxul.so]` 243; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 114; `[unknown]` 27; `[axiosozo-dev]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `syscall@@GLIBC_2.2.5 [libc.so.6]` 4; `[linux-vdso.so.1]` 4

**tab pid 7705** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | GC / CC 4, Idle 2, Other 1 | 0 / 0 / 7 | gc_cc 4, poll_wait 3 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 3; `[libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1

**tab pid 7316** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

**tab pid 7339** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

