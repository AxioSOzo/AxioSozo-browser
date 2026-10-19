### webkit switch-to-gecko (profile pass)

**parent pid 7182** — 135 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 82 | 27.0 | JavaScript 40, Layout 12, Graphics 10, Other 7 | 3 / 49 / 31 | paint_layout 18, engine_stream_read 9, poll_wait 7, gc_cc 3 |
| Renderer | 23 | 7.7 | Graphics 17, Idle 6 | 0 / 0 / 23 | webrender_render 17, poll_wait 6 |
| DOM Worker | 15 | 5.0 | JavaScript 15, Idle 0 | 0 / 0 / 15 | subprocess_pipe_io 15, poll_wait 14, worker_messaging 0, memcpy_memset 0 |
| Compositor | 4 | 1.4 | Idle 4, Profiler 0, Other 0 | 0 / 0 / 4 | poll_wait 4, paint_layout 0 |
| WRRenderBackend#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 | memcpy_memset 0 |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 |  |
| IPC I/O Parent | 2 | 0.7 | Idle 2 | 0 / 0 / 2 |  |
| SwComposite | 1 | 0.4 | Other 1 | 0 / 0 / 1 | memcpy_memset 0 |

Main thread, top self: `[libxul.so]` 60; `__syscall_cancel_arch [libc.so.6]` 8; `__tls_get_addr [ld-linux-x86-64.so.2]` 5; `mprotect [libc.so.6]` 2; `[unknown]` 2; `getTabForBrowser (moz-src:///browser/components/tabbrowser/Tabbrowser.` 1; `[axiosozo-dev]` 1; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 1

**tab pid 7714** — 30 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 28 | 9.2 | Other 13, JavaScript 5, Layout 4, Idle 3 | 0 / 8 / 20 | poll_wait 3, paint_layout 1, gc_cc 1, mozafterpaint_events 0 |
| IPC I/O Child | 2 | 0.5 | Idle 1, Other 0 | 0 / 0 / 2 |  |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 18; `__syscall_cancel_arch [libc.so.6]` 7; `[]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `[unknown]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 7270** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.4 | Idle 3, JavaScript 1, Other 0 | 0 / 1 / 3 | poll_wait 3 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `[libxul.so]` 1

**tab pid 7344** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Other 0, Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

