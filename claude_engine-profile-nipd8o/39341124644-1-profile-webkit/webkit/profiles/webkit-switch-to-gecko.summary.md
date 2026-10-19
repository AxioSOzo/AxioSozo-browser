### webkit switch-to-gecko (profile pass)

**parent pid 7182** — 115 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 71 | 24.0 | JavaScript 29, Other 11, Layout 10, Graphics 7 | 2 / 39 / 30 | paint_layout 15, poll_wait 9, engine_stream_read 4, memcpy_memset 2 |
| Renderer | 18 | 6.0 | Graphics 15, Idle 3 | 0 / 0 / 18 | webrender_render 15, poll_wait 3 |
| DOM Worker | 14 | 4.6 | JavaScript 13, Idle 0 | 0 / 0 / 14 | subprocess_pipe_io 14, poll_wait 12, worker_messaging 0 |
| Compositor | 3 | 1.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, paint_layout 0 |
| IPC I/O Parent | 3 | 1.0 | Idle 3 | 0 / 0 / 3 |  |
| WRRenderBackend#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 |  |
| SwComposite | 1 | 0.5 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `[libxul.so]` 47; `__syscall_cancel_arch [libc.so.6]` 8; `[unknown]` 5; `mprotect [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `mozilla::detail::MutexImpl::unlock() [axiosozo-dev]` 1; `g_hash_table_remove [libglib-2.0.so.0]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 7706** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 8.8 | JavaScript 7, Other 7, Idle 4, Layout 3 | 0 / 7 / 19 | poll_wait 4, memcpy_memset 2, gc_cc 1, paint_layout 1 |
| IPC I/O Child | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 15; `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `__lll_lock_wait [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1

**tab pid 7275** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.0 | Idle 2, JavaScript 0, Other 0, DOM 0 | 0 / 1 / 2 | poll_wait 2, array_buffer_copy 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0, Other 0 | 0 / 0 / 0 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 1

**tab pid 7325** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 |  |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libxul.so]` 0

