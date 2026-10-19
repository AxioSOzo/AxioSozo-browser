### gecko raf (profile pass)

**parent pid 3095** — 1220 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 453 | 14.6 | Graphics 342, Idle 110, Other 0 | 0 / 0 / 453 | webrender_render 342, poll_wait 113, memcpy_memset 9 |
| GeckoMain | 328 | 10.6 | Idle 86, GC / CC 65, Other 62, DOM 51 | 5 / 78 / 245 | poll_wait 118, gc_cc 65, memcpy_memset 11, array_buffer_copy 3 |
| DOM Worker | 237 | 7.7 | JavaScript 132, Idle 46, GC / CC 23, DOM 20 | 33 / 130 / 75 | worker_messaging 184, poll_wait 50, gc_cc 23, array_buffer_copy 6 |
| WRRenderBackend#0 | 68 | 2.2 | Other 68 | 0 / 0 / 68 | memcpy_memset 0 |
| WRSceneBuilder#0 | 45 | 1.4 | Other 45 | 0 / 0 / 45 | memcpy_memset 0, poll_wait 0 |
| Compositor | 41 | 1.3 | Idle 41, Other 0, Profiler 0 | 0 / 0 / 41 | poll_wait 41, paint_layout 0, webrender_render 0 |
| SwComposite | 15 | 0.5 | Other 15 | 0 / 0 / 15 | memcpy_memset 0 |
| Socket Thread | 12 | 0.4 | Other 12 | 0 / 0 / 12 | poll_wait 11, memcpy_memset 0 |

Main thread, top self: `[libxul.so]` 157; `poll [libc.so.6]` 92; `recvmsg [libc.so.6]` 15; `[axiosozo-dev]` 11; `write [libc.so.6]` 10; `__memmove_avx_unaligned_erms [libc.so.6]` 7; `[unknown]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5

**tab pid 3344** — 179 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 161 | 5.2 | Idle 102, Graphics 21, Layout 12, Profiler 7 | 0 / 9 / 152 | poll_wait 102, paint_layout 27, gc_cc 7, memcpy_memset 2 |
| IPC I/O Child | 16 | 0.5 | Idle 15, Other 0 | 0 / 0 / 16 |  |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 102; `[libxul.so]` 46; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `write [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3286** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `read [libc.so.6]` 0

**utility pid 3337** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| IPC I/O Child | 2 | 0.1 | Idle 2 | 0 / 0 / 2 |  |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 2; `g_private_get [libglib-2.0.so.0]` 0; `write [libc.so.6]` 0

