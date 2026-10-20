### chromium scroll (profile pass)

**parent pid 3402** — 1018 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 478 | 22.4 | Idle 265, JavaScript 89, Other 63, DOM 23 | 10 / 93 / 375 | ipc 478, poll_wait 346, gc_cc 96, worker_messaging 50 |
| DOM Worker | 291 | 13.7 | JavaScript 274, Other 10, Profiler 7 | 0 / 0 / 291 | subprocess_pipe_io 291, worker_messaging 289, ipc 289, js_ctypes 249 |
| BackgroundThreadPool #3 | 60 | 2.8 | Idle 52, Other 7, Graphics 1 | 0 / 0 / 60 | ipc 60, poll_wait 52, native_receiver 8, memcpy_memset 6 |
| Renderer | 57 | 2.7 | Idle 43, Graphics 14, Other 1, Profiler 0 | 0 / 0 / 57 | ipc 57, poll_wait 46, webrender_render 14, webrender_sw_raster 7 |
| WRRenderBackend#0 | 34 | 1.6 | Other 34 | 0 / 0 / 34 | webrender_render 1, memcpy_memset 0 |
| Compositor | 28 | 1.3 | Idle 27, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, webrender_render 1, canvas_2d 0 |
| SwComposite | 27 | 1.3 | Other 27 | 0 / 0 / 27 | webrender_render 27, poll_wait 27 |
| Timer | 22 | 1.1 | Other 22, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 22, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 274; `[unknown]` 15; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 3; `DescendIntoChild(mozilla::nsDisplayListBuilder*, nsIFrame const*, nsRe` 3

**tab pid 3862** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3586** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3604** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

