### gecko-2x raf-nosampler (profile pass)

**parent pid 2854** — 518 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 284 | 9.4 | Graphics 198, Idle 85, Profiler 1, Other 0 | 0 / 0 / 284 | ipc 283, webrender_render 199, webrender_sw_raster 166, poll_wait 92 |
| SwComposite | 55 | 1.8 | Other 55 | 0 / 0 / 55 | webrender_render 55, poll_wait 48, memcpy_memset 6, webrender_sw_raster 6 |
| WRRenderBackend#0 | 51 | 1.7 | Other 51 | 0 / 0 / 51 | webrender_render 1, poll_wait 0, memcpy_memset 0, array_buffer_copy 0 |
| GeckoMain | 41 | 1.3 | GC / CC 27, Idle 10, JavaScript 2, DOM 1 | 0 / 3 / 37 | ipc 41, gc_cc 28, poll_wait 10, harness_diagnostics 3 |
| WRSceneBuilder#0 | 38 | 1.3 | Other 38 | 0 / 0 / 38 | webrender_scene 38, webrender_render 2, poll_wait 0, memcpy_memset 0 |
| Compositor | 34 | 1.1 | Idle 33, Other 1, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 33, paint_layout 0, webrender_scene 0 |
| IPC I/O Parent | 8 | 0.3 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 10; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `mozilla::SegmentedVector<nsCOMPtr<nsISupports>, 4096ul, mozilla::Mallo` 1; `mozilla::dom::ProtoAndIfaceCache::~ProtoAndIfaceCache() [libxul.so]` 1; `nsINode::GetExistingListenerManager() const [libxul.so]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1

**tab pid 3126** — 139 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 126 | 4.2 | Idle 86, Graphics 17, Layout 14, Other 4 | 0 / 3 / 123 | ipc 121, poll_wait 87, paint_layout 35, subprocess_pipe_io 2 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 86; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 1; `wr_dp_push_hit_test [libxul.so]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `nsContainerFrame::GetChildList(mozilla::FrameChildListID) const [libxu` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1

**tab pid 3159** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::IdlePeriodState::GetLocalIdleDeadline(bool&, mozilla::detail:` 0

**tab pid 3033** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0

