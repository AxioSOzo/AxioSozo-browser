### gecko raf-nosampler (profile pass)

**parent pid 2850** — 414 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 242 | 8.0 | Graphics 158, Idle 82, Profiler 1, Other 1 | 0 / 0 / 242 | ipc 239, webrender_render 160, webrender_sw_raster 140, poll_wait 84 |
| WRRenderBackend#0 | 47 | 1.5 | Other 47 | 0 / 0 / 47 | webrender_render 0, webrender_scene 0, poll_wait 0, memcpy_memset 0 |
| GeckoMain | 40 | 1.3 | GC / CC 25, Idle 10, JavaScript 4, Other 0 | 0 / 4 / 35 | ipc 40, gc_cc 28, poll_wait 10, harness_diagnostics 3 |
| WRSceneBuilder#0 | 33 | 1.1 | Other 33 | 0 / 0 / 33 | webrender_scene 33, webrender_render 1, poll_wait 0, paint_layout 0 |
| Compositor | 31 | 1.0 | Idle 31, Other 1, Profiler 0 | 0 / 0 / 31 | ipc 31, poll_wait 30, webrender_render 0, memcpy_memset 0 |
| SwComposite | 8 | 0.3 | Other 8 | 0 / 0 / 8 | webrender_render 8, poll_wait 8, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `js::gc::GCRuntime::sweepPropMapTree(JS::GCContext*, JS::SliceBudget&) ` 2; `JsGcTracer::Trace(JS::Heap<JSObject*>*, char const*, void*) const [lib` 1; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1

**tab pid 3089** — 126 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 113 | 3.7 | Idle 82, Graphics 8, Other 8, Layout 8 | 0 / 3 / 110 | ipc 110, poll_wait 85, paint_layout 21, gc_cc 2 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 83; `[]` 1; `write [libc.so.6]` 1; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::GCCellPtr,` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1; `__lll_lock_wait [libc.so.6]` 1; `[libglib-2.0.so.0]` 1; `gecko_profiler::marker::add_marker [libxul.so]` 1

**tab pid 3178** — 1 ms CPU in the window

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

**tab pid 2991** — 1 ms CPU in the window

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

