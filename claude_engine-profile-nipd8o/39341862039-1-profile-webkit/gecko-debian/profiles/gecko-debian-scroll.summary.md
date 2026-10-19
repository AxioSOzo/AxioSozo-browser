### gecko-debian scroll (profile pass)

**parent pid 8091** — 1044 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 700 | 34.0 | Graphics 643, Idle 56, Profiler 1, Other 0 | 0 / 0 / 700 | webrender_render 644, poll_wait 56, memcpy_memset 4 |
| GeckoMain | 156 | 7.6 | Idle 78, GC / CC 35, Other 16, Graphics 12 | 0 / 9 / 147 | poll_wait 101, gc_cc 35, paint_layout 13, memcpy_memset 3 |
| WRRenderBackend#0 | 81 | 3.9 | Other 81, Profiler 0 | 0 / 0 / 81 | poll_wait 1, memcpy_memset 1 |
| SwComposite | 39 | 1.9 | Other 39 | 0 / 0 / 39 | memcpy_memset 3 |
| Compositor | 32 | 1.5 | Idle 31, Other 1, Profiler 0 | 0 / 0 / 32 | poll_wait 31, paint_layout 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 | memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 |  |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 86; `[libxul.so]` 57; `[axiosozo-dev]` 6; `mprotect [libc.so.6]` 2; `syscall [libc.so.6]` 1; `madvise [libc.so.6]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1

**tab pid 8343** — 113 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 96 | 4.7 | Idle 64, Graphics 14, Other 9, JavaScript 4 | 0 / 5 / 92 | poll_wait 65, paint_layout 14, memcpy_memset 0, webrender_render 0 |
| IPC I/O Child | 16 | 0.8 | Idle 16, Other 0 | 0 / 0 / 16 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 65; `[libxul.so]` 26; `[]` 1; `__lll_lock_wake [libc.so.6]` 1; `[libglib-2.0.so.0]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0

**tab pid 8262** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libxul.so]` 0

**tab pid 8353** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

