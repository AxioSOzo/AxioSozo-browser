### chromium scroll (profile pass)

**parent pid 3294** — 3688 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 1843 | 10.7 | JavaScript 1598, Other 147, Profiler 65, GC / CC 33 | 0 / 0 / 1843 | subprocess_pipe_io 1843, poll_wait 974, memcpy_memset 84, gc_cc 34 |
| GeckoMain | 1517 | 8.8 | Idle 781, JavaScript 432, Other 155, DOM 48 | 269 / 233 / 1015 | poll_wait 901, engine_stream_read 304, bgra_to_rgba 258, subprocess_pipe_io 125 |
| Timer | 152 | 0.9 | Other 152, Profiler 0 | 0 / 0 / 152 | poll_wait 151, memcpy_memset 0 |
| Renderer | 78 | 0.5 | Idle 45, Graphics 33, Other 0 | 0 / 0 / 78 | poll_wait 48, webrender_render 33, memcpy_memset 2 |
| SwComposite | 46 | 0.3 | Other 46 | 0 / 0 / 46 | memcpy_memset 0 |
| WRRenderBackend#0 | 21 | 0.1 | Other 21 | 0 / 0 / 21 |  |
| Compositor | 18 | 0.1 | Idle 18, Profiler 0, Other 0 | 0 / 0 / 18 | poll_wait 17, webrender_render 0 |
| IPC I/O Parent | 6 | 0.0 | Idle 5, Other 0 | 0 / 0 / 6 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 795; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 253; `[libxul.so]` 232; `__memmove_avx_unaligned_erms [libc.so.6]` 56; `[axiosozo-dev]` 24; `write [libc.so.6]` 22; `recvmsg [libc.so.6]` 17; `[unknown]` 17

**tab pid 3479** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 4, JavaScript 1, DOM 1, Profiler 1 | 0 / 2 / 5 | poll_wait 4, memcpy_memset 1 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `[libxul.so]` 1; `__strlen_avx2 [libc.so.6]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `read [libc.so.6]` 0; `write [libc.so.6]` 0

**tab pid 3439** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3460** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `[linux-vdso.so.1]` 0

