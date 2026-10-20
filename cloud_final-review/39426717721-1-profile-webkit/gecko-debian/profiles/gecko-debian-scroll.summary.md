### gecko-debian scroll (profile pass)

**parent pid 8212** — 960 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 632 | 30.8 | Graphics 570, Idle 62 | 0 / 0 / 632 | ipc 627, webrender_render 570, webrender_sw_raster 541, poll_wait 65 |
| GeckoMain | 141 | 6.8 | Idle 76, GC / CC 30, Other 16, Graphics 7 | 0 / 7 / 133 | ipc 140, poll_wait 95, gc_cc 36, paint_layout 12 |
| WRRenderBackend#0 | 81 | 3.9 | Other 81 | 0 / 0 / 81 | memcpy_memset 1, webrender_sw_raster 0, array_buffer_copy 0, webrender_render 0 |
| SwComposite | 38 | 1.9 | Other 38 | 0 / 0 / 38 | webrender_render 38, poll_wait 37, memcpy_memset 2, webrender_sw_raster 2 |
| Compositor | 31 | 1.5 | Idle 31, Other 0 | 0 / 0 / 31 | ipc 31, poll_wait 31, webrender_render 0, canvas_2d 0 |
| WRSceneBuilder#0 | 22 | 1.1 | Other 22 | 0 / 0 / 22 | webrender_scene 22, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 81; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `JSObject::traceChildren(JSTracer*) [libxul.so]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `js::gc::TraceEdgeInternal(JSTracer*, JS::Value*, char const*) [libxul.` 2; `js::frontend::CompilationStencil::instantiateStencilAfterPreparation(J` 2; `mozilla::RetainedDisplayList::DeleteAll(mozilla::nsDisplayListBuilder*` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2

**tab pid 8460** — 123 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 107 | 5.2 | Idle 64, Graphics 18, Other 8, GC / CC 7 | 0 / 4 / 103 | ipc 104, poll_wait 64, paint_layout 24, gc_cc 11 |
| IPC I/O Child | 15 | 0.7 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 66; `mozilla::layers::PAPZChild::OnMessageReceived(IPC::Message const&) [li` 2; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 2; `[linux-vdso.so.1]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 1; `js::jit::AssemblerShared::~AssemblerShared() [libxul.so]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1

**tab pid 8554** — 1 ms CPU in the window

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

**tab pid 8398** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

