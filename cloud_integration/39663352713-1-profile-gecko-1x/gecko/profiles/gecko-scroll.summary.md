### gecko scroll (profile pass)

**parent pid 2911** — 802 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 520 | 25.7 | Graphics 463, Idle 57, Profiler 1, Other 0 | 0 / 0 / 520 | ipc 517, webrender_render 464, webrender_sw_raster 432, poll_wait 62 |
| GeckoMain | 114 | 5.6 | Idle 58, GC / CC 30, Other 10, Graphics 7 | 0 / 6 / 108 | ipc 114, poll_wait 73, gc_cc 33, paint_layout 10 |
| WRRenderBackend#0 | 64 | 3.1 | Other 64 | 0 / 0 / 64 | memcpy_memset 0, webrender_render 0 |
| SwComposite | 44 | 2.2 | Other 44 | 0 / 0 / 44 | webrender_render 44, poll_wait 39, webrender_sw_raster 4, memcpy_memset 4 |
| Compositor | 28 | 1.4 | Idle 27, Other 1, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 21 | 1.0 | Other 21, Profiler 0 | 0 / 0 / 21 | webrender_scene 21, paint_layout 0, array_buffer_copy 0 |
| IPC I/O Parent | 7 | 0.3 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Socket Thread | 1 | 0.1 | Other 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 59; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3; `recvmsg [libc.so.6]` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2

**tab pid 3176** — 105 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 92 | 4.6 | Idle 60, Graphics 9, Other 8, GC / CC 7 | 0 / 6 / 87 | ipc 90, poll_wait 60, paint_layout 15, gc_cc 10 |
| IPC I/O Child | 12 | 0.6 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 60; `sendmsg [libc.so.6]` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::ObjectWrapperMap::ModIterator::ModIterator(js::ObjectWrapperMap&, ` 1; `js::jit::AttachBaselineCacheIRStub(JSContext*, js::jit::CacheIRWriter ` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1; `JS_TraceShapeCycleCollectorChildren(JSTracer*, js::Shape*) [libxul.so]` 1

**tab pid 3265** — 1 ms CPU in the window

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

**tab pid 3110** — 1 ms CPU in the window

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

