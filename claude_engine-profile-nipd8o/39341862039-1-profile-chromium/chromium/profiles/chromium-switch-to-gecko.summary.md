### chromium switch-to-gecko (profile pass)

**parent pid 3306** — 122 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 59 | 0.4 | Idle 20, Layout 15, JavaScript 13, Other 5 | 0 / 24 / 35 | poll_wait 21, paint_layout 5, engine_stream_read 2, memcpy_memset 2 |
| DOM Worker | 26 | 0.2 | JavaScript 21, Other 2, Idle 1, GC / CC 1 | 0 / 0 / 26 | subprocess_pipe_io 26, poll_wait 18, worker_messaging 1, gc_cc 1 |
| Renderer | 20 | 0.1 | Graphics 17, Idle 4 | 0 / 0 / 20 | webrender_render 17, poll_wait 4, memcpy_memset 0 |
| IPC I/O Parent | 4 | 0.0 | Idle 4, Other 0 | 0 / 0 / 4 |  |
| Compositor | 4 | 0.0 | Idle 4, Other 1 | 0 / 0 / 4 | poll_wait 4, memcpy_memset 1 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |
| SwComposite | 2 | 0.0 | Other 2 | 0 / 0 / 2 | memcpy_memset 0 |

Main thread, top self: `[libxul.so]` 28; `poll [libc.so.6]` 20; `[unknown]` 2; `write [libc.so.6]` 1; `[axiosozo-dev]` 1; `__lll_lock_wait [libc.so.6]` 1; `__memcmp_avx2_movbe [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3972** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `[libxul.so]` 0

**tab pid 3504** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0

**tab pid 3486** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 0; `[libxul.so]` 0

