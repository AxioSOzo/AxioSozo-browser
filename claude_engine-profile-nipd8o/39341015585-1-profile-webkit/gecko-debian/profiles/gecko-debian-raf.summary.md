### gecko-debian raf (profile pass)

**parent pid 8090** — 1525 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 504 | 16.3 | Graphics 391, Idle 113 | 0 / 0 / 504 | webrender_render 391, poll_wait 117, memcpy_memset 0 |
| GeckoMain | 430 | 13.9 | Idle 104, JavaScript 98, Other 72, DOM 68 | 8 / 134 / 288 | poll_wait 136, gc_cc 67, array_buffer_copy 3, memcpy_memset 3 |
| DOM Worker | 318 | 10.3 | JavaScript 151, GC / CC 71, Idle 51, DOM 27 | 49 / 193 / 76 | worker_messaging 262, gc_cc 71, poll_wait 55, array_buffer_copy 1 |
| WRRenderBackend#0 | 93 | 3.0 | Other 93 | 0 / 0 / 93 |  |
| WRSceneBuilder#0 | 58 | 1.9 | Other 58 | 0 / 0 / 58 | poll_wait 2, memcpy_memset 0, gc_cc 0 |
| Compositor | 53 | 1.7 | Idle 52, Other 1, Profiler 0 | 0 / 0 / 53 | poll_wait 52, paint_layout 0, webrender_render 0 |
| SwComposite | 23 | 0.8 | Other 23 | 0 / 0 / 23 |  |
| Socket Thread | 17 | 0.5 | Other 16, Profiler 0 | 0 / 0 / 17 | poll_wait 15 |

Main thread, top self: `[libxul.so]` 215; `[libc.so.6]` 150; `[axiosozo-dev]` 10; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 9; `[unknown]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `syscall@@GLIBC_2.2.5 [libc.so.6]` 4; `[linux-vdso.so.1]` 4

**tab pid 8336** — 267 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 239 | 7.7 | Idle 106, Graphics 48, Layout 38, Other 16 | 0 / 13 / 225 | poll_wait 108, paint_layout 65, gc_cc 11, memcpy_memset 1 |
| IPC I/O Child | 21 | 0.7 | Idle 21, Other 0 | 0 / 0 / 21 |  |
| Timer | 7 | 0.2 | Other 7, Profiler 0 | 0 / 0 / 7 | poll_wait 7 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 120; `[libxul.so]` 102; `[]` 9; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `[libm.so.6]` 1; `[unknown]` 1

**tab pid 8270** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 3 | 0.1 | Idle 3 | 0 / 0 / 3 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 4; `[libglib-2.0.so.0]` 0; `[libxul.so]` 0

**utility pid 8322** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 |  |

Main thread, top self: `[libc.so.6]` 2; `[libxul.so]` 0

