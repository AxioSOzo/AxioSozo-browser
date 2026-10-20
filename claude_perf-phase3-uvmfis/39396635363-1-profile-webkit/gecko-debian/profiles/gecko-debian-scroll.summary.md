### gecko-debian scroll (profile pass)

**parent pid 8204** — 821 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 542 | 27.1 | Graphics 491, Idle 51 | 0 / 0 / 542 | ipc 531, webrender_render 491, webrender_sw_raster 457, poll_wait 55 |
| GeckoMain | 114 | 5.7 | Idle 62, GC / CC 25, Other 13, Graphics 7 | 0 / 4 / 111 | ipc 113, poll_wait 76, gc_cc 28, paint_layout 9 |
| WRRenderBackend#0 | 63 | 3.2 | Other 63 | 0 / 0 / 63 | webrender_render 2, memcpy_memset 1, poll_wait 0 |
| SwComposite | 42 | 2.1 | Other 42 | 0 / 0 / 42 | webrender_render 42, poll_wait 38, memcpy_memset 4, webrender_sw_raster 4 |
| Compositor | 28 | 1.4 | Idle 27, Other 1, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, memcpy_memset 0, paint_layout 0 |
| WRSceneBuilder#0 | 21 | 1.1 | Other 21 | 0 / 0 / 21 | webrender_scene 21, webrender_render 1, paint_layout 0, poll_wait 0 |
| IPC I/O Parent | 7 | 0.3 | Idle 7 | 0 / 0 / 7 | poll_wait 7 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 68; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `bool mozilla::detail::HashTable<char const* const, mozilla::HashSet<ch` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `mozilla::EventListenerManager::MarkForCC() [libxul.so]` 1; `mozilla::nsDisplayItem::nsDisplayItem(mozilla::nsDisplayListBuilder*, ` 1

**tab pid 8434** — 106 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 92 | 4.6 | Idle 62, Graphics 9, GC / CC 9, Other 8 | 0 / 4 / 89 | ipc 90, poll_wait 64, paint_layout 13, gc_cc 9 |
| IPC I/O Child | 12 | 0.6 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 64; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeBarePtr<JSO` 1; `mozilla::nsDisplaySolidColor::GetBounds(mozilla::nsDisplayListBuilder*` 1; `js::Proxy::getOwnPropertyDescriptor(JSContext*, JS::Handle<JSObject*>,` 1

**tab pid 8461** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8384** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

