### chromium switch-to-gecko (profile pass)

**parent pid 3316** — 207 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 137 | 0.9 | GC / CC 57, Idle 27, JavaScript 18, Layout 18 | 2 / 36 / 99 | gc_cc 57, poll_wait 30, paint_layout 7, subprocess_pipe_io 3 |
| DOM Worker | 27 | 0.2 | JavaScript 20, Other 3, Idle 2, GC / CC 1 | 0 / 0 / 27 | subprocess_pipe_io 27, poll_wait 17, worker_messaging 2, gc_cc 1 |
| Renderer | 24 | 0.2 | Graphics 19, Idle 4, Other 1 | 0 / 0 / 24 | webrender_render 19, poll_wait 4 |
| IPC I/O Parent | 7 | 0.0 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 0 |
| Compositor | 4 | 0.0 | Idle 3, Other 1 | 0 / 0 / 4 | poll_wait 3, memcpy_memset 0 |
| Timer | 3 | 0.0 | Other 3 | 0 / 0 / 3 | poll_wait 3 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `[libxul.so]` 88; `poll@@GLIBC_2.2.5 [libc.so.6]` 28; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 6; `[libc.so.6]` 3; `[axiosozo-dev]` 2; `madvise@@GLIBC_2.2.5 [libc.so.6]` 2; `write@@GLIBC_2.2.5 [libc.so.6]` 1; `updateCommands (moz-src:///browser/components/places/PlacesUIUtils.sys` 1

**tab pid 3497** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `std::chrono::_V2::steady_clock::now()@@GLIBCXX_3.4.19 [libstdc++.so.6]` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3981** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 4, Other 0, Profiler 0 | 0 / 0 / 4 | poll_wait 4 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libxul.so]` 0; `[libc.so.6]` 0

**tab pid 3458** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 |  |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 0; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0

