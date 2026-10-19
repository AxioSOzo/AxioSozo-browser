### gecko-debian raf (profile pass)

**parent pid 8094** — 1575 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 462 | 15.0 | Graphics 324, Idle 134, Profiler 2, Other 2 | 0 / 0 / 462 | webrender_render 326, poll_wait 135, memcpy_memset 6 |
| DOM Worker | 459 | 14.9 | JavaScript 164, Idle 105, GC / CC 92, DOM 66 | 39 / 231 / 189 | worker_messaging 303, poll_wait 105, gc_cc 92, memcpy_memset 32 |
| GeckoMain | 431 | 14.0 | Idle 97, DOM 81, JavaScript 80, Other 77 | 8 / 126 / 297 | poll_wait 136, gc_cc 70, memcpy_memset 19, array_buffer_copy 6 |
| WRRenderBackend#0 | 72 | 2.3 | Other 71, Profiler 0 | 0 / 0 / 72 | memcpy_memset 0 |
| WRSceneBuilder#0 | 47 | 1.5 | Other 47 | 0 / 0 / 47 | poll_wait 0 |
| Compositor | 45 | 1.5 | Idle 44, Other 1, Profiler 0 | 0 / 0 / 45 | poll_wait 44, paint_layout 0, webrender_render 0 |
| SwComposite | 19 | 0.6 | Other 19 | 0 / 0 / 19 | memcpy_memset 0 |
| Socket Thread | 14 | 0.5 | Other 14 | 0 / 0 / 14 | poll_wait 13 |

Main thread, top self: `[libxul.so]` 216; `__syscall_cancel_arch [libc.so.6]` 129; `[axiosozo-dev]` 11; `__memmove_avx_unaligned_erms [libc.so.6]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `__memset_avx2_unaligned_erms [libc.so.6]` 6; `[unknown]` 6; `syscall [libc.so.6]` 4

**tab pid 8342** — 186 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 167 | 5.4 | Idle 100, Graphics 23, Layout 13, Other 12 | 0 / 8 / 160 | poll_wait 100, paint_layout 36, gc_cc 8, memcpy_memset 3 |
| IPC I/O Child | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 |  |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 104; `[libxul.so]` 45; `[]` 3; `[linux-vdso.so.1]` 3; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[libglib-2.0.so.0]` 1

**tab pid 8286** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4, Other 0, Profiler 0 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `[libxul.so]` 0

**utility pid 8334** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Profiler 0 | 0 / 0 / 2 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `[linux-vdso.so.1]` 0; `[libxul.so]` 0

