### chromium switch-to-engine (profile pass)

**parent pid 3296** — 247 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 99 | 17.2 | JavaScript 79, Profiler 10, Other 6, Idle 3 | 0 / 0 / 99 | subprocess_pipe_io 99, poll_wait 37, worker_messaging 3, gc_cc 1 |
| GeckoMain | 98 | 17.0 | Idle 28, JavaScript 25, Layout 20, Other 11 | 10 / 29 / 59 | poll_wait 31, engine_stream_read 13, paint_layout 10, bgra_to_rgba 9 |
| Renderer | 32 | 5.4 | Graphics 21, Idle 10 | 0 / 0 / 32 | webrender_render 21, poll_wait 10 |
| WRRenderBackend#0 | 5 | 0.9 | Other 5 | 0 / 0 / 5 |  |
| Compositor | 4 | 0.7 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4 |
| WRSceneBuilder#0 | 4 | 0.6 | Other 4 | 0 / 0 / 4 |  |
| IPC I/O Parent | 2 | 0.4 | Idle 2, Other 1 | 0 / 0 / 2 | memcpy_memset 1 |
| SwComposite | 2 | 0.3 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `[libxul.so]` 41; `poll@@GLIBC_2.2.5 [libc.so.6]` 30; `[libc.so.6]` 6; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 5; `[axiosozo-dev]` 3; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:161` 3; `close@@GLIBC_2.2.5 [libc.so.6]` 2; `[unknown]` 2

**tab pid 4105** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 9.0 | Other 34, JavaScript 7, Profiler 3, Idle 3 | 0 / 5 / 44 | poll_wait 4, memcpy_memset 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 21; `[libc.so.6]` 7; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 5; `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libexpat.so.1]` 3; `[]` 3; `[linux-vdso.so.1]` 1; `mmap@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3988** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.5 | Idle 2, Other 1, Profiler 0 | 0 / 0 / 3 | poll_wait 3 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `[]` 0; `[linux-vdso.so.1]` 0

**tab pid 3443** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0

