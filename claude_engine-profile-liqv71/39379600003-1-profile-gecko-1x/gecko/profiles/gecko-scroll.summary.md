### gecko scroll (profile pass)

**parent pid 3041** — 983 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 665 | 32.2 | Graphics 601, Idle 64, Other 1 | 0 / 0 / 665 | ipc 659, webrender_render 601, webrender_sw_raster 569, poll_wait 65 |
| GeckoMain | 136 | 6.6 | Idle 68, GC / CC 30, Other 13, JavaScript 12 | 5 / 9 / 123 | ipc 136, poll_wait 85, gc_cc 36, paint_layout 10 |
| WRRenderBackend#0 | 75 | 3.6 | Other 75 | 0 / 0 / 75 | webrender_render 1, memcpy_memset 1, gc_cc 0, array_buffer_copy 0 |
| SwComposite | 39 | 1.9 | Other 39 | 0 / 0 / 39 | webrender_render 39, poll_wait 36, webrender_sw_raster 2, memcpy_memset 2 |
| Compositor | 30 | 1.4 | Idle 29, Other 1 | 0 / 0 / 30 | ipc 30, poll_wait 29, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 | webrender_scene 22, webrender_render 1, paint_layout 0, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 9, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 2 | 0.1 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 68; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `Response (chrome://remote/content/marionette/message.sys.mjs:230:14)[1` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `nsPresArena<32768ul, mozilla::DisplayListArenaObjectId, 76ul>::Free(mo` 2; `JsGcTracer::Trace(JS::Heap<JSObject*>*, char const*, void*) const [lib` 2; `std::_Rb_tree_increment(std::_Rb_tree_node_base const*)@@GLIBCXX_3.4 [` 2

**tab pid 3294** — 120 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 104 | 5.0 | Idle 64, Graphics 13, Other 9, GC / CC 8 | 0 / 5 / 99 | ipc 101, poll_wait 65, paint_layout 18, gc_cc 10 |
| IPC I/O Child | 15 | 0.7 | Idle 14, Other 0 | 0 / 0 / 15 | poll_wait 14, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 65; `[]` 2; `nsIFrame::Extend3DContext(nsStyleDisplay const*, nsStyleEffects const*` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 2; `mozilla::RunnableTask::Run() [libxul.so]` 1; `NS_HasPendingEvents(nsIThread*) [libxul.so]` 1; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom const*, b` 1

**tab pid 3212** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[]` 0

**tab pid 3296** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `nsCycleCollector_suspectedCount() [libxul.so]` 0

