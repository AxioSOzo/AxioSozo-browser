### webkit key (profile pass)

**parent pid 7167** — 1362 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 636 | 17.4 | JavaScript 543, Other 52, Profiler 36, GC / CC 6 | 0 / 0 / 636 | subprocess_pipe_io 636, poll_wait 272, gc_cc 6, memcpy_memset 2 |
| GeckoMain | 574 | 15.7 | Idle 286, JavaScript 106, Other 64, Graphics 37 | 14 / 154 / 406 | poll_wait 338, paint_layout 65, engine_stream_read 58, subprocess_pipe_io 44 |
| Renderer | 45 | 1.2 | Idle 22, Graphics 22, Other 1 | 0 / 0 / 45 | poll_wait 22, webrender_render 22 |
| Timer | 36 | 1.0 | Other 36, Profiler 0 | 0 / 0 / 36 | poll_wait 36 |
| SwComposite | 32 | 0.9 | Other 32 | 0 / 0 / 32 |  |
| Compositor | 14 | 0.4 | Idle 14, Profiler 0, Other 0 | 0 / 0 / 14 | poll_wait 14, paint_layout 0 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 |  |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 |  |

Main thread, top self: `[libc.so.6]` 359; `[libxul.so]` 149; `[unknown]` 18; `[axiosozo-dev]` 10; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[linux-vdso.so.1]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `hasKeys (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:` 2

**tab pid 7251** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 0, Other 0, DOM 0 | 0 / 0 / 6 | poll_wait 5, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 5; `[libxul.so]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[5` 0

**tab pid 7789** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 7351** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

