### gecko-debian key (profile pass)

**parent pid 8091** — 309 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 203 | 5.4 | Idle 43, Layout 39, Other 35, GC / CC 30 | 2 / 26 / 176 | poll_wait 68, paint_layout 61, gc_cc 30, memcpy_memset 3 |
| Renderer | 34 | 0.9 | Idle 20, Graphics 14, Profiler 0 | 0 / 0 / 34 | poll_wait 20, webrender_render 14, memcpy_memset 1 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | memcpy_memset 0 |
| Compositor | 18 | 0.5 | Idle 17, Other 1 | 0 / 0 / 18 | poll_wait 17, memcpy_memset 1, webrender_render 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | memcpy_memset 0, poll_wait 0 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 0 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | memcpy_memset 0 |
| DOM Worker | 3 | 0.1 | GC / CC 2, Other 1, Idle 0 | 0 / 0 / 3 | memcpy_memset 2, gc_cc 2, worker_messaging 0, poll_wait 0 |

Main thread, top self: `[libxul.so]` 115; `__syscall_cancel_arch [libc.so.6]` 57; `[axiosozo-dev]` 8; `getcontext [libc.so.6]` 3; `mprotect [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `[unknown]` 2; `mozilla::detail::MutexImpl::lock() [axiosozo-dev]` 2

**tab pid 8343** — 61 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 54 | 1.4 | Idle 24, JavaScript 8, Layout 7, Other 5 | 0 / 6 / 48 | poll_wait 23, paint_layout 10 |
| IPC I/O Child | 7 | 0.2 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 7 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 26; `[libxul.so]` 24; `[]` 3; `[linux-vdso.so.1]` 1

**tab pid 8177** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 1, JavaScript 0 | 0 / 0 / 7 | poll_wait 6 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0; `__strlen_avx2 [libc.so.6]` 0

**tab pid 8353** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

