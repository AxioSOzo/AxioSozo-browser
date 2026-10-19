### gecko-debian key (profile pass)

**parent pid 8094** — 295 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 192 | 5.1 | Idle 43, Layout 40, GC / CC 28, Graphics 24 | 3 / 24 / 165 | poll_wait 60, paint_layout 57, gc_cc 28, memcpy_memset 1 |
| Renderer | 34 | 0.9 | Idle 22, Graphics 13 | 0 / 0 / 34 | poll_wait 22, webrender_render 13, memcpy_memset 0 |
| Compositor | 18 | 0.5 | Idle 16, Other 3, Profiler 0 | 0 / 0 / 18 | poll_wait 16, memcpy_memset 3, webrender_render 0, paint_layout 0 |
| WRRenderBackend#0 | 17 | 0.5 | Other 17 | 0 / 0 / 17 |  |
| WRSceneBuilder#0 | 13 | 0.3 | Other 13 | 0 / 0 / 13 |  |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 0 | 0 / 0 / 10 |  |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | memcpy_memset 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `[libxul.so]` 120; `__syscall_cancel_arch [libc.so.6]` 52; `[unknown]` 2; `[axiosozo-dev]` 2; `__lll_lock_wake [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `mprotect [libc.so.6]` 1

**tab pid 8342** — 72 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 65 | 1.7 | Idle 24, GC / CC 9, DOM 7, JavaScript 6 | 0 / 6 / 59 | poll_wait 24, gc_cc 9, paint_layout 7, memcpy_memset 1 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Profiler 0, Other 0 | 0 / 0 / 6 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 32; `__syscall_cancel_arch [libc.so.6]` 25; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 2; `__lll_lock_wait [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0

**tab pid 8180** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 7, JavaScript 0, Other 0 | 0 / 0 / 7 | poll_wait 7 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `__strlen_avx2 [libc.so.6]` 0; `[libxul.so]` 0; `[]` 0

**tab pid 8267** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

