### chromium scroll (profile pass)

**parent pid 3306** — 3937 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 1969 | 11.5 | JavaScript 1724, Other 139, Profiler 75, GC / CC 31 | 0 / 0 / 1969 | subprocess_pipe_io 1969, poll_wait 1084, memcpy_memset 83, gc_cc 32 |
| GeckoMain | 1645 | 9.6 | Idle 805, JavaScript 428, Other 164, GC / CC 159 | 243 / 271 / 1131 | poll_wait 937, engine_stream_read 281, bgra_to_rgba 236, gc_cc 159 |
| Timer | 167 | 1.0 | Other 167, Profiler 0 | 0 / 0 / 167 | poll_wait 166, memcpy_memset 0 |
| Renderer | 68 | 0.4 | Idle 44, Graphics 22, Profiler 1, Other 0 | 0 / 0 / 68 | poll_wait 46, webrender_render 24 |
| SwComposite | 42 | 0.2 | Other 42 | 0 / 0 / 42 | memcpy_memset 0 |
| WRRenderBackend#0 | 18 | 0.1 | Other 18 | 0 / 0 / 18 |  |
| Compositor | 16 | 0.1 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 15, webrender_render 0 |
| IPC I/O Parent | 6 | 0.0 | Idle 6, Other 1 | 0 / 0 / 6 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 822; `[libxul.so]` 348; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 232; `__memmove_avx_unaligned_erms [libc.so.6]` 56; `recvmsg [libc.so.6]` 33; `write [libc.so.6]` 24; `[unknown]` 19; `[axiosozo-dev]` 12

**tab pid 3504** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 4 | 0 / 0 / 4 | poll_wait 4 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4

**tab pid 3486** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libxul.so]` 0

**tab pid 4119** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `[libglib-2.0.so.0]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

