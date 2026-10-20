### chromium-2x raf-nosampler (profile pass)

**parent pid 3385** — 1228 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 330 | 10.7 | Idle 138, GC / CC 88, JavaScript 72, Other 19 | 7 / 71 / 251 | ipc 330, gc_cc 167, poll_wait 151, worker_messaging 52 |
| DOM Worker | 295 | 9.6 | JavaScript 286, Profiler 5, Other 4 | 0 / 0 / 295 | subprocess_pipe_io 295, worker_messaging 295, ipc 295, js_ctypes 275 |
| BackgroundThreadPool #3 | 192 | 6.3 | Idle 114, Other 73, Graphics 4, Profiler 1 | 0 / 0 / 192 | ipc 192, poll_wait 116, native_receiver 78, memcpy_memset 71 |
| Renderer | 164 | 5.3 | Idle 98, Graphics 65, Other 1 | 0 / 0 / 164 | ipc 164, poll_wait 106, webrender_render 65, webrender_sw_raster 60 |
| SwComposite | 125 | 4.1 | Other 125 | 0 / 0 / 125 | webrender_render 125, poll_wait 102, webrender_sw_raster 23, memcpy_memset 14 |
| WRRenderBackend#0 | 51 | 1.7 | Other 51 | 0 / 0 / 51 | webrender_render 1, poll_wait 1 |
| Compositor | 41 | 1.3 | Idle 40, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 41 | ipc 41, poll_wait 40, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 17 | 0.6 | Idle 17, Other 0, Profiler 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 141; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 13; `mprotect [libc.so.6]` 9; `[unknown]` 7; `write [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `recvmsg [libc.so.6]` 5; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 4

**tab pid 3830** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

**tab pid 3953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[libstdc++.so.6]` 0

**tab pid 3559** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0

