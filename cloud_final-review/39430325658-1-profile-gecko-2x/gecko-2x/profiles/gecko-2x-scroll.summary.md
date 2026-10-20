### gecko-2x scroll (profile pass)

**parent pid 3043** — 1914 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1471 | 70.5 | Graphics 1423, Idle 47, Profiler 1 | 0 / 0 / 1471 | ipc 1447, webrender_render 1424, webrender_sw_raster 1338, poll_wait 47 |
| GeckoMain | 140 | 6.7 | Idle 71, GC / CC 29, Other 12, Graphics 9 | 0 / 10 / 130 | ipc 140, poll_wait 96, gc_cc 33, paint_layout 14 |
| SwComposite | 138 | 6.6 | Other 138 | 0 / 0 / 138 | webrender_render 138, poll_wait 127, webrender_sw_raster 11, memcpy_memset 11 |
| WRRenderBackend#0 | 95 | 4.6 | Other 95 | 0 / 0 / 95 | memcpy_memset 2, webrender_render 2, poll_wait 1 |
| Compositor | 32 | 1.5 | Idle 31, Other 0, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 | webrender_scene 22, webrender_render 0, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 2 | 0.1 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 72; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 3; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 2; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 2

**tab pid 3285** — 124 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 107 | 5.1 | Idle 69, Graphics 14, GC / CC 9, Other 7 | 0 / 5 / 102 | ipc 104, poll_wait 70, paint_layout 18, gc_cc 12 |
| IPC I/O Child | 15 | 0.7 | Idle 15, Other 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 68; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `sendmsg [libc.so.6]` 2; `ScanBlackVisitor::VisitNode(PtrInfo*) [libxul.so]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `[linux-vdso.so.1]` 1; `read [libc.so.6]` 1; `PLDHashTable::MakeEntryHandle(void const*) [libxul.so]` 1

**tab pid 3211** — 1 ms CPU in the window

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

**tab pid 3374** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

