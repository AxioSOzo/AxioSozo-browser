### webkit switch-to-engine (profile pass)

**parent pid 7182** — 174 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 97 | 12.9 | JavaScript 73, Idle 14, Other 5, Profiler 3 | 0 / 0 / 97 | subprocess_pipe_io 97, poll_wait 58, worker_messaging 14, memcpy_memset 4 |
| GeckoMain | 56 | 7.5 | JavaScript 25, Idle 13, Layout 7, Other 4 | 8 / 21 / 27 | poll_wait 15, engine_stream_read 12, bgra_to_rgba 7, subprocess_pipe_io 4 |
| Renderer | 11 | 1.5 | Graphics 10, Idle 1 | 0 / 0 / 11 | webrender_render 10, poll_wait 1 |
| IPC I/O Parent | 3 | 0.4 | Idle 3 | 0 / 0 / 3 |  |
| Compositor | 2 | 0.3 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| SwComposite | 1 | 0.2 | Other 1 | 0 / 0 / 1 |  |
| WRSceneBuilder#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 |  |
| WRRenderBackend#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `[libxul.so]` 24; `__syscall_cancel_arch [libc.so.6]` 16; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:` 6; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `mprotect [libc.so.6]` 1; `setSearchMode (chrome://browser/content/urlbar/UrlbarInputBase.mjs:292` 1; `[unknown]` 1; `std::__detail::_Prime_rehash_policy::_M_need_rehash(unsigned long, uns` 1

**tab pid 7801** — 53 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 52 | 8.6 | Other 37, JavaScript 6, DOM 5, Profiler 2 | 0 / 5 / 46 | memcpy_memset 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 27; `[libexpat.so.1]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `[]` 3; `__strcmp_avx2 [libc.so.6]` 2; `__read_nocancel [libc.so.6]` 2; `syscall [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1

**tab pid 7795** — 45 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 44 | 7.1 | Other 34, JavaScript 5, Profiler 4, DOM 1 | 0 / 2 / 42 | poll_wait 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 19; `[]` 6; `__syscall_cancel_arch [libc.so.6]` 3; `[libfontconfig.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `[libexpat.so.1]` 3; `do_lookup_x [ld-linux-x86-64.so.2]` 2; `readlink [libc.so.6]` 1

**tab pid 7706** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.2 | Idle 1, Profiler 0 | 0 / 0 / 2 | poll_wait 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0

