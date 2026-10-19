### gecko-debian raf (profile pass)

**parent pid 8091** — 1253 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 490 | 15.8 | Graphics 369, Idle 119, Other 2 | 0 / 0 / 490 | webrender_render 369, poll_wait 123, memcpy_memset 6 |
| GeckoMain | 359 | 11.6 | Idle 99, GC / CC 74, Other 61, JavaScript 57 | 7 / 77 / 274 | poll_wait 137, gc_cc 74, memcpy_memset 5, paint_layout 4 |
| DOM Worker | 163 | 5.3 | JavaScript 64, Idle 49, DOM 32, Other 15 | 16 / 73 / 74 | worker_messaging 108, poll_wait 50, memcpy_memset 3, gc_cc 2 |
| WRRenderBackend#0 | 81 | 2.6 | Other 81 | 0 / 0 / 81 | poll_wait 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 54 | 1.7 | Other 54 | 0 / 0 / 54 | poll_wait 0, memcpy_memset 0 |
| Compositor | 48 | 1.6 | Idle 47, Other 1 | 0 / 0 / 48 | poll_wait 47, paint_layout 0, webrender_render 0 |
| SwComposite | 22 | 0.7 | Other 22 | 0 / 0 / 22 | memcpy_memset 0 |
| Socket Thread | 13 | 0.4 | Other 13 | 0 / 0 / 13 | poll_wait 12 |

Main thread, top self: `[libxul.so]` 171; `__syscall_cancel_arch [libc.so.6]` 130; `[axiosozo-dev]` 8; `getrusage [libc.so.6]` 5; `[unknown]` 4; `syscall [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[linux-vdso.so.1]` 4

**tab pid 8343** — 222 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 202 | 6.5 | Idle 105, Layout 27, Graphics 22, Other 22 | 1 / 15 / 186 | poll_wait 109, paint_layout 38, gc_cc 7, memcpy_memset 3 |
| IPC I/O Child | 18 | 0.6 | Idle 18, Other 0 | 0 / 0 / 18 |  |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 113; `[libxul.so]` 73; `[]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `Update the rendering Paint` 1; `[libglib-2.0.so.0]` 1

**tab pid 8281** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 2 | 0.1 | Idle 2 | 0 / 0 / 2 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4

**utility pid 8338** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

