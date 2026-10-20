### gecko-2x raf (profile pass)

**parent pid 3089** — 807 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 346 | 11.1 | Graphics 235, Idle 110, Other 1 | 0 / 0 / 346 | ipc 344, webrender_render 235, webrender_sw_raster 200, poll_wait 118 |
| GeckoMain | 100 | 3.2 | GC / CC 62, Idle 31, Layout 3, Other 2 | 0 / 0 / 99 | ipc 99, gc_cc 62, poll_wait 32, paint_layout 4 |
| SwComposite | 92 | 3.0 | Other 92 | 0 / 0 / 92 | webrender_render 92, poll_wait 87, memcpy_memset 5, webrender_sw_raster 5 |
| WRRenderBackend#0 | 82 | 2.6 | Other 82 | 0 / 0 / 82 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 62 | 2.0 | Other 62 | 0 / 0 / 62 | webrender_scene 62, webrender_render 3, poll_wait 1, paint_layout 0 |
| Compositor | 55 | 1.8 | Idle 53, Other 2, Profiler 0 | 0 / 0 / 55 | ipc 55, poll_wait 53, webrender_render 1, paint_layout 0 |
| DOM Worker | 44 | 1.4 | GC / CC 42, Other 1, Idle 1 | 0 / 0 / 44 | gc_cc 43, worker_messaging 43, ipc 43, memcpy_memset 18 |
| IPC I/O Parent | 14 | 0.4 | Idle 13, Other 0 | 0 / 0 / 14 | poll_wait 13, ipc 0 |

Main thread, top self: `poll [libc.so.6]` 31; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 4; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScriptEdge(js::B` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3

**tab pid 3330** — 261 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 237 | 7.6 | Idle 105, Graphics 50, Layout 35, Profiler 16 | 0 / 17 / 220 | ipc 218, poll_wait 108, paint_layout 102, gc_cc 13 |
| IPC I/O Child | 21 | 0.7 | Idle 21, Other 0, Profiler 0 | 0 / 0 / 21 | poll_wait 21, ipc 0 |
| Timer | 3 | 0.1 | Other 3 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 106; `[]` 14; `sendmsg [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `getcontext [libc.so.6]` 3; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry const*) [lib` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `mozilla::DirectedAcyclicGraph<mozilla::OldListUnits>::DirectedAcyclicG` 2

**tab pid 3233** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3419** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

