### gecko-2x scroll (profile pass)

**parent pid 3036** — 1775 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1371 | 66.0 | Graphics 1311, Idle 61 | 0 / 0 / 1371 | ipc 1359, webrender_render 1311, webrender_sw_raster 1246, poll_wait 64 |
| GeckoMain | 135 | 6.5 | Idle 71, GC / CC 35, Other 10, JavaScript 7 | 1 / 6 / 128 | ipc 135, poll_wait 87, gc_cc 38, paint_layout 11 |
| SwComposite | 119 | 5.7 | Other 119 | 0 / 0 / 119 | webrender_render 119, poll_wait 110, webrender_sw_raster 9, memcpy_memset 8 |
| WRRenderBackend#0 | 84 | 4.0 | Other 84 | 0 / 0 / 84 | webrender_render 1, memcpy_memset 1, webrender_scene 1, array_buffer_copy 0 |
| Compositor | 31 | 1.5 | Idle 30, Other 0, Profiler 0 | 0 / 0 / 31 | ipc 31, poll_wait 30, paint_layout 0, canvas_2d 0 |
| WRSceneBuilder#0 | 22 | 1.0 | Other 22 | 0 / 0 / 22 | webrender_scene 22, webrender_render 1, poll_wait 0, paint_layout 0 |
| IPC I/O Parent | 8 | 0.4 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 71; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObjectEdge(JSO` 2; `[linux-vdso.so.1]` 2; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2

**tab pid 3278** — 114 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 97 | 4.7 | Idle 65, Graphics 14, GC / CC 7, JavaScript 4 | 0 / 4 / 93 | ipc 92, poll_wait 66, paint_layout 19, gc_cc 10 |
| IPC I/O Child | 15 | 0.7 | Idle 14, Other 0 | 0 / 0 / 15 | poll_wait 14, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 65; `[]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `sendmsg [libc.so.6]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned int, mozilla` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `js::ForwardingProxyHandler::get(JSContext*, JS::Handle<JSObject*>, JS:` 1

**tab pid 3219** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0

**tab pid 3367** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

