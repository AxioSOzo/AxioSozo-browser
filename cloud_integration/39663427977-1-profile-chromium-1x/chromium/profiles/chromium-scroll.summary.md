### chromium scroll (profile pass)

**parent pid 3461** — 1015 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 481 | 22.6 | Idle 278, JavaScript 76, Other 61, GC / CC 21 | 13 / 71 / 396 | ipc 481, poll_wait 349, gc_cc 96, paint_layout 41 |
| DOM Worker | 298 | 14.0 | JavaScript 282, Other 9, Profiler 7 | 0 / 0 / 298 | subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 258 |
| BackgroundThreadPool #3 | 59 | 2.8 | Idle 52, Other 6, Graphics 0 | 0 / 0 / 59 | ipc 59, poll_wait 53, native_receiver 6, memcpy_memset 6 |
| Renderer | 51 | 2.4 | Idle 42, Graphics 9, Other 0 | 0 / 0 / 51 | ipc 51, poll_wait 45, webrender_render 9, webrender_sw_raster 5 |
| WRRenderBackend#0 | 33 | 1.5 | Other 33 | 0 / 0 / 33 | webrender_render 1, poll_wait 1 |
| Compositor | 27 | 1.3 | Idle 26, Other 1 | 0 / 0 / 27 | ipc 27, poll_wait 26, memcpy_memset 0, canvas_2d 0 |
| SwComposite | 24 | 1.2 | Other 24 | 0 / 0 / 24 | webrender_render 24, poll_wait 24, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 22 | 1.1 | Other 22, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 22, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 281; `write [libc.so.6]` 9; `[unknown]` 8; `recvmsg [libc.so.6]` 8; `[axiosozo-dev]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `__lll_lock_wait [libc.so.6]` 3

**tab pid 3640** — 1 ms CPU in the window

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

**tab pid 3600** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0

**tab pid 4150** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

