### webkit switch-to-engine (profile pass)

**parent pid 7182** — 181 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 101 | 14.7 | JavaScript 91, Profiler 6, Other 4, GC / CC 1 | 0 / 0 / 101 | subprocess_pipe_io 101, poll_wait 63, memcpy_memset 8, gc_cc 2 |
| GeckoMain | 60 | 8.7 | JavaScript 27, Idle 15, Other 8, DOM 5 | 8 / 27 / 26 | poll_wait 17, engine_stream_read 16, bgra_to_rgba 6, paint_layout 3 |
| Renderer | 12 | 1.7 | Graphics 9, Idle 3 | 0 / 0 / 12 | webrender_render 9, poll_wait 3, memcpy_memset 0 |
| IPC I/O Parent | 2 | 0.4 | Idle 1, Other 1 | 0 / 0 / 2 |  |
| Compositor | 2 | 0.3 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| WRSceneBuilder#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 | poll_wait 0 |
| SwComposite | 1 | 0.2 | Other 1 | 0 / 0 / 1 | memcpy_memset 0 |
| WRRenderBackend#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `[libxul.so]` 26; `__syscall_cancel_arch [libc.so.6]` 17; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 6; `[axiosozo-dev]` 3; `[unknown]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1

**tab pid 7806** — 44 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 43 | 7.5 | Other 33, JavaScript 4, DOM 3, Profiler 2 | 0 / 7 / 36 | memcpy_memset 2, poll_wait 1 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 23; `__lll_lock_wake [libc.so.6]` 3; `__strcmp_avx2 [libc.so.6]` 2; `[libexpat.so.1]` 2; `[]` 2; `__syscall_cancel_arch [libc.so.6]` 1; `fstat64 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1

**tab pid 7714** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.2 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

**tab pid 7804** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.2 | Idle 1, GC / CC 1, Other 0 | 0 / 0 / 1 | poll_wait 1, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mprotect [libc.so.6]` 1

