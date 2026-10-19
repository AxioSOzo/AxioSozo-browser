### gecko raf (profile pass)

**parent pid 2826** — 1616 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 533 | 17.2 | JavaScript 230, GC / CC 134, Idle 84, DOM 50 | 48 / 284 / 201 | worker_messaging 348, gc_cc 134, poll_wait 97, memcpy_memset 28 |
| GeckoMain | 516 | 16.7 | JavaScript 134, DOM 125, Idle 117, Other 63 | 19 / 220 / 278 | poll_wait 150, gc_cc 56, memcpy_memset 26, array_buffer_copy 13 |
| Renderer | 342 | 11.1 | Graphics 219, Idle 119, Profiler 3, Other 1 | 0 / 0 / 342 | webrender_render 222, poll_wait 121, memcpy_memset 7 |
| WRRenderBackend#0 | 78 | 2.5 | Other 78 | 0 / 0 / 78 | poll_wait 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 49 | 1.6 | Other 49 | 0 / 0 / 49 | poll_wait 1, memcpy_memset 1 |
| Compositor | 38 | 1.2 | Idle 38, Other 1, Profiler 0 | 0 / 0 / 38 | poll_wait 37, webrender_render 0 |
| Socket Thread | 21 | 0.7 | Other 21 | 0 / 0 / 21 | poll_wait 18 |
| SwComposite | 14 | 0.5 | Other 14 | 0 / 0 / 14 | memcpy_memset 0 |

Main thread, top self: `[libxul.so]` 254; `poll [libc.so.6]` 126; `[unknown]` 20; `__memmove_avx512_unaligned_erms [libc.so.6]` 16; `[axiosozo-dev]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 12; `mprotect [libc.so.6]` 9; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 7

**tab pid 3067** — 223 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 204 | 6.6 | Idle 100, Layout 41, Graphics 28, Other 16 | 0 / 9 / 195 | poll_wait 102, paint_layout 54, gc_cc 6, memcpy_memset 0 |
| IPC I/O Child | 15 | 0.5 | Idle 14, Other 0 | 0 / 0 / 15 |  |
| Timer | 4 | 0.1 | Other 4 | 0 / 0 / 4 | poll_wait 4 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 99; `[libxul.so]` 82; `sendmsg [libc.so.6]` 8; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `write [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3014** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4, Other 0, Profiler 0 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `write [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**utility pid 3062** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| IPC I/O Child | 3 | 0.1 | Idle 3 | 0 / 0 / 3 |  |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 2; `[libxul.so]` 0

