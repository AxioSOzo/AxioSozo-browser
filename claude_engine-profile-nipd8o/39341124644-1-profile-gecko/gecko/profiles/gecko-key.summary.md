### gecko key (profile pass)

**parent pid 2826** — 229 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 141 | 3.7 | Idle 41, Layout 31, Graphics 26, Other 21 | 3 / 18 / 120 | poll_wait 55, paint_layout 45, memcpy_memset 1, array_buffer_copy 1 |
| Renderer | 28 | 0.7 | Idle 19, Graphics 8, Other 0 | 0 / 0 / 28 | poll_wait 19, webrender_render 8, memcpy_memset 0 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 |  |
| Compositor | 16 | 0.4 | Idle 14, Other 2 | 0 / 0 / 16 | poll_wait 14, memcpy_memset 2, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 13 | 0.3 | Other 13 | 0 / 0 / 13 | memcpy_memset 0 |
| IPC I/O Parent | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 |  |
| SwComposite | 3 | 0.1 | Other 3 | 0 / 0 / 3 | memcpy_memset 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `[libxul.so]` 75; `poll [libc.so.6]` 42; `[axiosozo-dev]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `recvmsg [libc.so.6]` 2; `[unknown]` 2; `_XrmInternalStringToQuark [libX11.so.6]` 1; `[linux-vdso.so.1]` 1

**tab pid 3067** — 68 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 61 | 1.6 | Idle 25, Layout 12, GC / CC 8, JavaScript 7 | 0 / 9 / 52 | poll_wait 25, gc_cc 9, paint_layout 5, memcpy_memset 1 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 30; `poll [libc.so.6]` 25; `sendmsg [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 1; `write [libc.so.6]` 0

**tab pid 2927** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, DOM 0, GC / CC 0, JavaScript 0 | 0 / 0 / 6 | poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[libxul.so]` 0

**tab pid 3098** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

