### webkit key (profile pass)

**parent pid 7167** — 1445 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 657 | 17.9 | JavaScript 556, Other 52, Profiler 39, GC / CC 10 | 0 / 0 / 657 | subprocess_pipe_io 657, poll_wait 310, gc_cc 10, memcpy_memset 5 |
| GeckoMain | 630 | 17.1 | Idle 292, JavaScript 105, Other 76, Layout 38 | 12 / 190 / 428 | poll_wait 342, paint_layout 70, subprocess_pipe_io 67, engine_stream_read 60 |
| Renderer | 45 | 1.2 | Graphics 22, Idle 22, Other 1 | 0 / 0 / 45 | poll_wait 23, webrender_render 22 |
| Timer | 39 | 1.1 | Other 39, Profiler 0 | 0 / 0 / 39 | poll_wait 38 |
| SwComposite | 33 | 0.9 | Other 33 | 0 / 0 / 33 |  |
| Compositor | 16 | 0.4 | Idle 15, Other 1 | 0 / 0 / 16 | poll_wait 15, memcpy_memset 1 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | memcpy_memset 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 366; `[libxul.so]` 201; `[axiosozo-dev]` 14; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `syscall@@GLIBC_2.2.5 [libc.so.6]` 2; `[linux-vdso.so.1]` 2

**tab pid 7257** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, Other 1, GC / CC 0, JavaScript 0 | 0 / 0 / 6 | poll_wait 5, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 6; `[libxul.so]` 1; `__tls_get_addr@@GLIBC_2.3 [ld-linux-x86-64.so.2]` 0

**tab pid 7316** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1; `[libxul.so]` 0

**tab pid 7366** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 1

