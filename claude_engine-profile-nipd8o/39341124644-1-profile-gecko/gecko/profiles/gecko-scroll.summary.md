### gecko scroll (profile pass)

**parent pid 2826** — 806 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 464 | 22.8 | Graphics 410, Idle 52, Other 2, Profiler 1 | 0 / 0 / 464 | webrender_render 411, poll_wait 54, memcpy_memset 0 |
| GeckoMain | 157 | 7.7 | Idle 69, GC / CC 48, Other 20, Graphics 9 | 0 / 6 / 151 | poll_wait 93, gc_cc 48, paint_layout 11, memcpy_memset 2 |
| WRRenderBackend#0 | 74 | 3.6 | Other 74 | 0 / 0 / 74 | poll_wait 1, memcpy_memset 0 |
| DOM Worker | 28 | 1.4 | GC / CC 27, Other 1, Idle 0 | 0 / 0 / 28 | gc_cc 27, memcpy_memset 14, worker_messaging 0, poll_wait 0 |
| Compositor | 26 | 1.3 | Idle 25, Other 0, Profiler 0 | 0 / 0 / 26 | poll_wait 25, paint_layout 0 |
| SwComposite | 25 | 1.2 | Other 25 | 0 / 0 / 25 | memcpy_memset 1 |
| WRSceneBuilder#0 | 20 | 1.0 | Other 20 | 0 / 0 / 20 | memcpy_memset 0 |
| IPC I/O Parent | 7 | 0.3 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 72; `poll [libc.so.6]` 70; `[axiosozo-dev]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `recvmsg [libc.so.6]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `sendmsg [libc.so.6]` 1

**tab pid 3067** — 110 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 97 | 4.8 | Idle 65, Graphics 11, Other 8, Layout 6 | 0 / 5 / 91 | poll_wait 67, paint_layout 11, mozafterpaint_events 1, memcpy_memset 1 |
| IPC I/O Child | 12 | 0.6 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 65; `[libxul.so]` 27; `[]` 1; `[libglib-2.0.so.0]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 2996** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[]` 0

**tab pid 3014** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

