### chromium switch-to-gecko (profile pass)

**parent pid 3165** — 195 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 117 | 0.7 | GC / CC 74, JavaScript 14, Idle 11, Layout 6 | 0 / 26 / 90 | ipc 117, gc_cc 80, poll_wait 13, paint_layout 11 |
| DOM Worker | 47 | 0.3 | GC / CC 25, Other 13, JavaScript 6, Idle 2 | 0 / 0 / 47 | subprocess_pipe_io 47, worker_messaging 47, ipc 47, gc_cc 41 |
| Renderer | 12 | 0.1 | Graphics 8, Idle 4 | 0 / 0 / 12 | ipc 12, webrender_render 8, webrender_sw_raster 8, poll_wait 4 |
| BgIOThreadPool #1 | 7 | 0.0 | Other 6, Idle 1 | 0 / 0 / 7 | ipc 7, poll_wait 1 |
| IPC I/O Parent | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| Compositor | 3 | 0.0 | Idle 2, Other 1 | 0 / 0 / 3 | ipc 3, poll_wait 2, memcpy_memset 0 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 19; `poll [libc.so.6]` 11; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 5; `XPCNativeSet::FindMember(JS::Handle<JS::PropertyKey>, XPCNativeMember*` 4; `unsigned long js::gc::Arena::finalize<JSObject, (js::gc::FinalizeKind)` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 4

**tab pid 3832** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Layout 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, paint_layout 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::glean::HistogramIdForMetric(unsigned int) [libxul.so]` 0

**tab pid 3356** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.0 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 2 |
| Timer | 1 | 0.0 | Other 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3338** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.0 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2

