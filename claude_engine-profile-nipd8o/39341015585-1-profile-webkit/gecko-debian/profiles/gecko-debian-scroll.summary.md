### gecko-debian scroll (profile pass)

**parent pid 8090** — 1090 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 711 | 34.8 | Graphics 650, Idle 60, Profiler 1, Other 0 | 0 / 0 / 711 | webrender_render 650, poll_wait 58 |
| GeckoMain | 175 | 8.6 | Idle 83, GC / CC 35, Other 22, Graphics 13 | 0 / 9 / 166 | poll_wait 114, gc_cc 35, paint_layout 15, subprocess_pipe_io 2 |
| WRRenderBackend#0 | 89 | 4.4 | Other 89 | 0 / 0 / 89 | poll_wait 1 |
| SwComposite | 42 | 2.1 | Other 42 | 0 / 0 / 42 |  |
| Compositor | 36 | 1.7 | Idle 35, Other 1, Profiler 0 | 0 / 0 / 36 | poll_wait 35, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 23 | 1.1 | Other 23 | 0 / 0 / 23 | poll_wait 0 |
| IPC I/O Parent | 10 | 0.5 | Idle 10, Other 0 | 0 / 0 / 10 |  |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `[libc.so.6]` 90; `[libxul.so]` 71; `[linux-vdso.so.1]` 3; `[axiosozo-dev]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall@@GLIBC_2.2.5 [libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 1; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 8336** — 129 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 109 | 5.3 | Idle 71, Graphics 20, Other 10, Layout 3 | 0 / 2 / 107 | poll_wait 71, paint_layout 23 |
| IPC I/O Child | 18 | 0.9 | Idle 18, Other 0, Profiler 0 | 0 / 0 / 18 |  |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 75; `[libxul.so]` 29; `[]` 2; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `syscall@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 8251** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 0

**tab pid 8229** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libc.so.6]` 0; `[libxul.so]` 0

