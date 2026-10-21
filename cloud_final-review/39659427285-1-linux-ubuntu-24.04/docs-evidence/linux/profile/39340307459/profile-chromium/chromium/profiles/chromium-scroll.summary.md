### chromium scroll (profile pass)

**parent pid 3296** — 3876 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 2029 | 11.8 | JavaScript 1771, Other 140, Profiler 78, GC / CC 40 | 0 / 0 / 2029 | subprocess_pipe_io 2029, poll_wait 1085, gc_cc 41, memcpy_memset 18 |
| GeckoMain | 1509 | 8.8 | Idle 784, JavaScript 422, Other 158, DOM 42 | 245 / 236 / 1027 | poll_wait 905, engine_stream_read 276, bgra_to_rgba 230, subprocess_pipe_io 133 |
| Timer | 169 | 1.0 | Other 169, Profiler 0 | 0 / 0 / 169 | poll_wait 166, memcpy_memset 0 |
| Renderer | 76 | 0.4 | Idle 52, Graphics 24 | 0 / 0 / 76 | poll_wait 52, webrender_render 24 |
| SwComposite | 44 | 0.3 | Other 44 | 0 / 0 / 44 |  |
| WRRenderBackend#0 | 19 | 0.1 | Other 19 | 0 / 0 / 19 |  |
| Compositor | 17 | 0.1 | Idle 16, Other 1, Profiler 0 | 0 / 0 / 17 | poll_wait 16, memcpy_memset 1, webrender_render 0 |
| IPC I/O Parent | 7 | 0.0 | Idle 6, Other 0 | 0 / 0 / 7 |  |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 795; `[libxul.so]` 270; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 229; `[libc.so.6]` 70; `write@@GLIBC_2.2.5 [libc.so.6]` 30; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 24; `[unknown]` 18; `[axiosozo-dev]` 10

**tab pid 3482** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 4, DOM 2, JavaScript 1, Profiler 0 | 0 / 3 / 4 | poll_wait 4 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libxul.so]` 3; `[libc.so.6]` 0; `[linux-vdso.so.1]` 0

**tab pid 3464** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 4105** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0; `[]` 0

