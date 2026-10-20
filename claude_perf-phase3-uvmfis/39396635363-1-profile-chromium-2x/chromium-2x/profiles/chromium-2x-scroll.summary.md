### chromium-2x scroll (profile pass)

**parent pid 3115** — 967 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 354 | 17.5 | Idle 220, JavaScript 43, Other 33, GC / CC 32 | 6 / 47 / 301 | ipc 354, poll_wait 251, gc_cc 73, worker_messaging 25 |
| DOM Worker | 268 | 13.3 | JavaScript 211, Other 27, GC / CC 22, Profiler 8 | 0 / 0 / 268 | subprocess_pipe_io 268, worker_messaging 268, ipc 268, js_ctypes 196 |
| BackgroundThreadPool #1 | 158 | 7.8 | Idle 88, Other 69, Graphics 2 | 0 / 0 / 158 | ipc 158, poll_wait 88, native_receiver 71, memcpy_memset 67 |
| Renderer | 74 | 3.7 | Idle 43, Graphics 31, Profiler 1 | 0 / 0 / 74 | ipc 74, poll_wait 52, webrender_render 31, webrender_sw_raster 23 |
| SwComposite | 51 | 2.5 | Other 51 | 0 / 0 / 51 | webrender_render 51, poll_wait 49, webrender_sw_raster 1, memcpy_memset 1 |
| WRRenderBackend#0 | 18 | 0.9 | Other 18 | 0 / 0 / 18 | webrender_render 0, memcpy_memset 0 |
| Compositor | 18 | 0.9 | Idle 17, Other 0 | 0 / 0 / 18 | ipc 18, poll_wait 17, webrender_render 0, canvas_2d 0 |
| Timer | 14 | 0.7 | Other 14, Profiler 0 | 0 / 0 / 14 | ipc 14, poll_wait 14 |

Main thread, top self: `poll [libc.so.6]` 225; `[unknown]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `[axiosozo-dev]` 4; `recvmsg [libc.so.6]` 4; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 4; `write [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 3

**tab pid 3275** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0

**tab pid 3293** — 0 ms CPU in the window

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

**tab pid 3254** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Other 0, Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0

