### chromium scroll (profile pass)

**parent pid 3133** — 657 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 359 | 17.5 | Idle 188, GC / CC 56, JavaScript 48, Other 27 | 2 / 61 / 296 | ipc 359, poll_wait 223, gc_cc 116, worker_messaging 38 |
| DOM Worker | 151 | 7.4 | JavaScript 149, Profiler 2, Other 1 | 0 / 0 / 151 | subprocess_pipe_io 151, worker_messaging 151, ipc 151, js_ctypes 139 |
| Renderer | 34 | 1.7 | Idle 30, Graphics 4 | 0 / 0 / 34 | ipc 34, poll_wait 32, webrender_render 4, webrender_sw_raster 3 |
| BackgroundThreadPool #2 | 30 | 1.4 | Idle 29, Other 1 | 0 / 0 / 30 | ipc 30, poll_wait 29, native_receiver 1, memcpy_memset 0 |
| WRRenderBackend#0 | 27 | 1.3 | Other 27 | 0 / 0 / 27 | memcpy_memset 0, webrender_render 0 |
| Compositor | 18 | 0.9 | Idle 18, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 18, webrender_render 0, image_container 0 |
| SwComposite | 13 | 0.6 | Other 13 | 0 / 0 / 13 | webrender_render 13, poll_wait 13, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 12 | 0.6 | Other 12, Profiler 0 | 0 / 0 / 12 | ipc 12, poll_wait 11 |

Main thread, top self: `poll [libc.so.6]` 190; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 13; `write [libc.so.6]` 7; `[unknown]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `[axiosozo-dev]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3

**tab pid 3811** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3994** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3278** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

