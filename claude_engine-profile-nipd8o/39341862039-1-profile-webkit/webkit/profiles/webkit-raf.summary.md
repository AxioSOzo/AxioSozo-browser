### webkit raf (profile pass)

**parent pid 7182** — 3314 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 1904 | 60.4 | JavaScript 1552, Other 198, Profiler 126, GC / CC 29 | 0 / 0 / 1904 | subprocess_pipe_io 1904, poll_wait 507, memcpy_memset 126, gc_cc 30 |
| GeckoMain | 1149 | 36.4 | Idle 426, JavaScript 372, Other 138, GC / CC 122 | 121 / 364 / 664 | poll_wait 487, subprocess_pipe_io 246, engine_stream_read 205, memcpy_memset 127 |
| Renderer | 109 | 3.5 | Idle 74, Graphics 34, Other 1, Profiler 0 | 0 / 0 / 109 | poll_wait 77, webrender_render 34, memcpy_memset 3 |
| SwComposite | 65 | 2.1 | Other 65 | 0 / 0 / 65 | memcpy_memset 0 |
| Timer | 29 | 0.9 | Other 29 | 0 / 0 / 29 | poll_wait 29, memcpy_memset 0 |
| WRRenderBackend#0 | 27 | 0.9 | Other 27 | 0 / 0 / 27 |  |
| Compositor | 22 | 0.7 | Idle 22, Other 0, Profiler 0 | 0 / 0 / 22 | poll_wait 21, webrender_render 0 |
| WRSceneBuilder#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 523; `[libxul.so]` 295; `__memmove_avx_unaligned_erms [libc.so.6]` 114; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 104; `[unknown]` 20; `[axiosozo-dev]` 11; `__memset_avx2_unaligned_erms [libc.so.6]` 9; `[linux-vdso.so.1]` 8

**tab pid 7714** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 4, Idle 2, Other 0 | 0 / 0 / 6 | gc_cc 4, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 4; `__syscall_cancel_arch [libc.so.6]` 2; `[]` 0

**tab pid 7720** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7371** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

