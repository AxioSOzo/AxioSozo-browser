### chromium scroll (profile pass)

**parent pid 3316** — 3855 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 1999 | 11.6 | JavaScript 1740, Other 138, Profiler 87, GC / CC 34 | 0 / 0 / 1999 | subprocess_pipe_io 1999, poll_wait 1065, gc_cc 34, memcpy_memset 14 |
| GeckoMain | 1527 | 8.9 | Idle 787, JavaScript 403, Other 157, GC / CC 88 | 235 / 264 / 1029 | poll_wait 912, engine_stream_read 262, bgra_to_rgba 221, subprocess_pipe_io 172 |
| Timer | 166 | 1.0 | Other 165, Profiler 0 | 0 / 0 / 166 | poll_wait 164 |
| Renderer | 72 | 0.4 | Idle 44, Graphics 28, Other 0 | 0 / 0 / 72 | poll_wait 46, webrender_render 28 |
| SwComposite | 43 | 0.2 | Other 43 | 0 / 0 / 43 |  |
| WRRenderBackend#0 | 19 | 0.1 | Other 19 | 0 / 0 / 19 |  |
| Compositor | 17 | 0.1 | Idle 16, Other 1, Profiler 0 | 0 / 0 / 17 | poll_wait 16, memcpy_memset 1, webrender_render 0 |
| IPC I/O Parent | 7 | 0.0 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 799; `[libxul.so]` 283; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 219; `[libc.so.6]` 77; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 30; `write@@GLIBC_2.2.5 [libc.so.6]` 25; `[unknown]` 14; `[axiosozo-dev]` 10

**tab pid 3497** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 5, JavaScript 1, DOM 1, Other 0 | 0 / 2 / 5 | poll_wait 5 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 5; `[libxul.so]` 1; `[libc.so.6]` 1; `[]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3986** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `read@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0

**tab pid 4091** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 0; `[linux-vdso.so.1]` 0; `[libc.so.6]` 0

