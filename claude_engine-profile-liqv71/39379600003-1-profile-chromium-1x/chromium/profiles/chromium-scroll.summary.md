### chromium scroll (profile pass)

**parent pid 3165** — 675 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 285 | 14.0 | Idle 174, JavaScript 42, GC / CC 27, Other 21 | 4 / 43 / 238 | ipc 285, poll_wait 203, gc_cc 66, worker_messaging 26 |
| DOM Worker | 137 | 6.7 | JavaScript 129, Other 4, Profiler 4 | 0 / 0 / 137 | subprocess_pipe_io 137, worker_messaging 137, ipc 137, js_ctypes 123 |
| Renderer | 93 | 4.6 | Idle 55, Graphics 37, Other 1 | 0 / 0 / 93 | ipc 93, poll_wait 61, webrender_render 38, webrender_sw_raster 28 |
| SwComposite | 67 | 3.3 | Other 67 | 0 / 0 / 67 | webrender_render 67, poll_wait 60, webrender_sw_raster 7, memcpy_memset 0 |
| WRRenderBackend#0 | 30 | 1.5 | Other 30 | 0 / 0 / 30 | webrender_render 0 |
| BackgroundThreadPool #2 | 26 | 1.3 | Idle 25, Other 1 | 0 / 0 / 26 | ipc 26, poll_wait 25, native_receiver 1, memcpy_memset 1 |
| Compositor | 16 | 0.8 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, webrender_render 0 |
| Timer | 11 | 0.5 | Other 11 | 0 / 0 / 11 | ipc 11, poll_wait 11 |

Main thread, top self: `poll [libc.so.6]` 175; `[unknown]` 8; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 5; `write [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `recvmsg [libc.so.6]` 4; `mozilla::glean::impl::Labeled<mozilla::glean::impl::TimingDistribution` 3

**tab pid 3338** — 1 ms CPU in the window

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

**tab pid 3832** — 1 ms CPU in the window

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

**tab pid 3317** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `webrtc::internal::WeakReferenceOwner::WeakReferenceOwner() [libxul.so]` 0

