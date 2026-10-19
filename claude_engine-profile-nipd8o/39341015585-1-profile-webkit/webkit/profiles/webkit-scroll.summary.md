### webkit scroll (profile pass)

**parent pid 7167** — 6176 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 3156 | 18.3 | JavaScript 2672, Other 277, Profiler 162, GC / CC 45 | 0 / 0 / 3156 | subprocess_pipe_io 3156, poll_wait 1345, gc_cc 46, memcpy_memset 23 |
| GeckoMain | 2506 | 14.6 | Idle 1315, JavaScript 574, Other 288, GC / CC 166 | 245 / 464 / 1797 | poll_wait 1492, engine_stream_read 362, subprocess_pipe_io 254, bgra_to_rgba 223 |
| Timer | 176 | 1.0 | Other 176, Profiler 0 | 0 / 0 / 176 | poll_wait 174, memcpy_memset 0 |
| Renderer | 146 | 0.8 | Idle 104, Graphics 42, Other 0 | 0 / 0 / 146 | poll_wait 104, webrender_render 42, memcpy_memset 0 |
| SwComposite | 89 | 0.5 | Other 89 | 0 / 0 / 89 |  |
| Compositor | 39 | 0.2 | Idle 32, Other 7 | 0 / 0 / 39 | poll_wait 32, memcpy_memset 7, webrender_render 0 |
| WRRenderBackend#0 | 37 | 0.2 | Other 37 | 0 / 0 / 37 |  |
| DOM Worker | 11 | 0.5 | Other 9, GC / CC 2, Idle 1 | 0 / 0 / 11 | poll_wait 9, gc_cc 2, worker_messaging 0 |

Main thread, top self: `[libc.so.6]` 1605; `[libxul.so]` 500; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 220; `[unknown]` 36; `[axiosozo-dev]` 28; `[linux-vdso.so.1]` 16; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8

**tab pid 7366** — 15 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.1 | GC / CC 8, Idle 4, Other 0 | 0 / 0 / 12 | gc_cc 8, poll_wait 4 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 8; `[libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 7257** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.1 | GC / CC 7, Idle 2, Other 0 | 0 / 0 / 9 | gc_cc 7, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 7; `[libc.so.6]` 2; `prctl@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 7316** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 5, GC / CC 2, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 5, gc_cc 2 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 5; `[libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

