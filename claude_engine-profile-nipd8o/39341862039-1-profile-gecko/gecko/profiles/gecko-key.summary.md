### gecko key (profile pass)

**parent pid 3095** — 287 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 188 | 5.0 | Idle 42, Layout 36, Other 29, GC / CC 29 | 0 / 25 / 163 | poll_wait 64, paint_layout 54, gc_cc 29, memcpy_memset 6 |
| Renderer | 33 | 0.9 | Idle 19, Graphics 13, Profiler 1 | 0 / 0 / 33 | poll_wait 19, webrender_render 14, memcpy_memset 0 |
| Compositor | 18 | 0.5 | Idle 16, Other 3 | 0 / 0 / 18 | poll_wait 16, memcpy_memset 2, paint_layout 0 |
| WRRenderBackend#0 | 17 | 0.5 | Other 17 | 0 / 0 / 17 | memcpy_memset 1 |
| WRSceneBuilder#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 |  |
| IPC I/O Parent | 8 | 0.2 | Idle 8, Other 0 | 0 / 0 / 8 |  |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |
| DOM Worker | 2 | 0.1 | GC / CC 2, Idle 0 | 0 / 0 / 2 | gc_cc 2, poll_wait 1, worker_messaging 0 |

Main thread, top self: `[libxul.so]` 110; `poll [libc.so.6]` 45; `[axiosozo-dev]` 4; `read [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 4; `[unknown]` 3; `sendmsg [libc.so.6]` 2; `[libX11.so.6]` 2

**tab pid 3344** — 70 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 63 | 1.7 | Idle 23, GC / CC 10, Other 7, Layout 6 | 0 / 7 / 57 | poll_wait 24, gc_cc 10, paint_layout 9, memcpy_memset 1 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 6 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 31; `poll [libc.so.6]` 23; `[]` 3; `sendmsg [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `__memcmp_avx2_movbe [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3183** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, DOM 0 | 0 / 1 / 6 | poll_wait 6, memcpy_memset 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[libxul.so]` 0; `[unknown]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0; `get (resource://gre/modules/ExtensionUtils.sys.mjs:102:6)[8]` 0

**tab pid 3268** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

