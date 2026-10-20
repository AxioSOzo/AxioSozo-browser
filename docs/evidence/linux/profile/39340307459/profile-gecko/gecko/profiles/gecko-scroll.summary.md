### gecko scroll (profile pass)

**parent pid 2809** — 846 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 553 | 27.3 | Graphics 497, Idle 56 | 0 / 0 / 553 | webrender_render 497, poll_wait 56 |
| GeckoMain | 95 | 4.7 | Idle 66, Other 11, Graphics 8, JavaScript 4 | 0 / 5 / 90 | poll_wait 83, paint_layout 9, memcpy_memset 1, subprocess_pipe_io 0 |
| WRRenderBackend#0 | 65 | 3.2 | Other 65 | 0 / 0 / 65 |  |
| SwComposite | 39 | 1.9 | Other 39 | 0 / 0 / 39 |  |
| DOM Worker | 39 | 1.9 | GC / CC 37, Other 1, Idle 1 | 0 / 0 / 39 | gc_cc 38, memcpy_memset 11, poll_wait 4, worker_messaging 1 |
| Compositor | 25 | 1.2 | Idle 25, Other 0, Profiler 0 | 0 / 0 / 25 | poll_wait 25 |
| WRSceneBuilder#0 | 19 | 0.9 | Other 19, Profiler 0 | 0 / 0 / 19 |  |
| IPC I/O Parent | 7 | 0.3 | Idle 7, Other 0, Profiler 0 | 0 / 0 / 7 |  |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 68; `[libxul.so]` 21; `[axiosozo-dev]` 1; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[libgobject-2.0.so.0]` 1; `g_free_sized [libglib-2.0.so.0]` 1; `writev@@GLIBC_2.2.5 [libc.so.6]` 1; `g_object_get_data [libgobject-2.0.so.0]` 1

**tab pid 3049** — 96 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 83 | 4.1 | Idle 63, Graphics 11, Other 4, JavaScript 3 | 0 / 3 / 80 | poll_wait 63, paint_layout 11 |
| IPC I/O Child | 12 | 0.6 | Idle 12, Other 0 | 0 / 0 / 12 |  |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 62; `[libxul.so]` 14; `[]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `[libc.so.6]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3131** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3133** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0

