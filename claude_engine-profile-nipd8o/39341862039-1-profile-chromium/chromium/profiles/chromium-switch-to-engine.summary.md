### chromium switch-to-engine (profile pass)

**parent pid 3306** — 254 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 106 | 16.4 | JavaScript 37, Idle 26, Layout 23, DOM 8 | 9 / 43 / 54 | poll_wait 28, engine_stream_read 19, paint_layout 11, bgra_to_rgba 9 |
| DOM Worker | 98 | 15.2 | JavaScript 82, Other 8, Profiler 6, Idle 2 | 0 / 0 / 98 | subprocess_pipe_io 98, poll_wait 38, memcpy_memset 4, worker_messaging 2 |
| Renderer | 32 | 4.9 | Graphics 27, Idle 5 | 0 / 0 / 32 | webrender_render 27, poll_wait 5 |
| WRRenderBackend#0 | 5 | 0.8 | Other 5 | 0 / 0 / 5 |  |
| Compositor | 4 | 0.6 | Idle 3, Other 1 | 0 / 0 / 4 | poll_wait 3, memcpy_memset 0 |
| IPC I/O Parent | 3 | 0.5 | Idle 2, Other 1, Profiler 0 | 0 / 0 / 3 | memcpy_memset 0, poll_wait 0 |
| WRSceneBuilder#0 | 3 | 0.4 | Other 3 | 0 / 0 / 3 |  |
| SwComposite | 2 | 0.4 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `[libxul.so]` 57; `poll [libc.so.6]` 26; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 4; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:161` 4; `write [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2

**tab pid 4119** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 9.3 | Other 39, DOM 4, JavaScript 3, Profiler 2 | 0 / 5 / 44 | memcpy_memset 3, poll_wait 2 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 20; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 6; `[]` 4; `[libfontconfig.so.1]` 2; `__strlen_avx2 [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `poll [libc.so.6]` 2; `prctl [libc.so.6]` 1

**tab pid 4116** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 8.4 | Other 39, DOM 4, JavaScript 2, Profiler 2 | 0 / 6 / 42 | memcpy_memset 4, poll_wait 2 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 20; `__strlen_avx2 [libc.so.6]` 3; `[]` 3; `sysinfo [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `sendmsg [libc.so.6]` 2; `poll [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 3972** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.5 | Idle 2, Other 1 | 0 / 0 / 3 | poll_wait 3 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `[libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0; `read [libc.so.6]` 0

