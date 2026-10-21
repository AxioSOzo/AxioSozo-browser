### gecko raf (profile pass)

**parent pid 3086** — 615 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 336 | 10.8 | Graphics 233, Idle 100, Profiler 2, Other 1 | 0 / 0 / 336 | ipc 329, webrender_render 235, webrender_sw_raster 201, poll_wait 104 |
| WRRenderBackend#0 | 71 | 2.3 | Other 71 | 0 / 0 / 71 | memcpy_memset 1, webrender_render 0, poll_wait 0 |
| GeckoMain | 67 | 2.2 | GC / CC 32, Idle 25, Graphics 3, Other 3 | 0 / 4 / 63 | ipc 67, gc_cc 34, poll_wait 27, paint_layout 4 |
| WRSceneBuilder#0 | 50 | 1.6 | Other 50 | 0 / 0 / 50 | webrender_scene 50, webrender_render 2, paint_layout 0, poll_wait 0 |
| Compositor | 46 | 1.5 | Idle 45, Other 1 | 0 / 0 / 46 | ipc 46, poll_wait 45, paint_layout 0, webrender_scene 0 |
| SwComposite | 20 | 0.7 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 19, memcpy_memset 2, webrender_sw_raster 2 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0, Profiler 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 25; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `mozilla::ScrollContainerFrame::BuildDisplayList(mozilla::nsDisplayList` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2

**tab pid 3315** — 192 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 173 | 5.6 | Idle 106, Layout 22, Graphics 19, Other 11 | 0 / 8 / 165 | ipc 166, poll_wait 107, paint_layout 53, gc_cc 4 |
| IPC I/O Child | 17 | 0.5 | Idle 17, Other 0 | 0 / 0 / 17 | poll_wait 17, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 106; `sendmsg [libc.so.6]` 3; `[]` 3; `__lll_lock_wait [libc.so.6]` 2; `Pickle::BeginWrite(unsigned int) [libxul.so]` 1; `mozilla::nsDisplayList::HitTest(mozilla::nsDisplayListBuilder*, nsRect` 1; `mozilla::nsDisplayListBuilder::AutoBuildingDisplayList::AutoBuildingDi` 1; `js::jit::OperandLocation::operator==(js::jit::OperandLocation const&) ` 1

**tab pid 3408** — 1 ms CPU in the window

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

**tab pid 3321** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsJSContext::MaybePokeGC() [libxul.so]` 0; `[]` 0

