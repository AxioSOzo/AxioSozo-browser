### chromium switch-to-engine (profile pass)

**parent pid 3316** — 255 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 108 | 18.4 | JavaScript 85, Profiler 11, Other 9, GC / CC 2 | 0 / 0 / 108 | subprocess_pipe_io 108, poll_wait 43, gc_cc 2, worker_messaging 1 |
| GeckoMain | 103 | 17.5 | JavaScript 35, Idle 26, Layout 20, DOM 9 | 11 / 40 / 53 | poll_wait 28, engine_stream_read 18, bgra_to_rgba 11, subprocess_pipe_io 10 |
| Renderer | 27 | 4.6 | Graphics 20, Idle 7 | 0 / 0 / 27 | webrender_render 20, poll_wait 7 |
| WRRenderBackend#0 | 6 | 0.9 | Other 6 | 0 / 0 / 6 |  |
| Compositor | 4 | 0.6 | Idle 4 | 0 / 0 / 4 | poll_wait 4 |
| WRSceneBuilder#0 | 3 | 0.6 | Other 3 | 0 / 0 / 3 |  |
| SwComposite | 2 | 0.4 | Other 2 | 0 / 0 / 2 |  |
| IPC I/O Parent | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 |  |

Main thread, top self: `[libxul.so]` 49; `poll@@GLIBC_2.2.5 [libc.so.6]` 26; `[libc.so.6]` 5; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.m` 5; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:161` 4; `[axiosozo-dev]` 2; `write@@GLIBC_2.2.5 [libc.so.6]` 2; `[unknown]` 2

**tab pid 4096** — 36 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 35 | 6.0 | Other 27, JavaScript 7, Idle 1, GC / CC 1 | 0 / 4 / 32 | poll_wait 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.1 | Idle 0, Other 0 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `[libxul.so]` 16; `[]` 5; `[libc.so.6]` 3; `[libexpat.so.1]` 3; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `open@@GLIBC_2.2.5 [libc.so.6]` 1; `[libfreeblpriv3.so]` 1

**tab pid 3981** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.6 | Other 2, Idle 2, Graphics 0 | 0 / 0 / 3 | poll_wait 3, paint_layout 0 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libxul.so]` 0; `std::__detail::_Prime_rehash_policy::_M_need_rehash(unsigned long, uns` 0

**tab pid 4091** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0

