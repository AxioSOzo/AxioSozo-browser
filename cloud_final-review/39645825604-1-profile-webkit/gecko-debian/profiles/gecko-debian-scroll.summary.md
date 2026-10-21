### gecko-debian scroll (profile pass)

**parent pid 8187** — 480 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 323 | 16.1 | Graphics 266, Idle 58 | 0 / 0 / 323 | ipc 323, webrender_render 266, webrender_sw_raster 252, poll_wait 57 |
| GeckoMain | 71 | 3.6 | Idle 40, GC / CC 19, Other 5, JavaScript 3 | 0 / 4 / 68 | ipc 71, poll_wait 47, gc_cc 22, harness_diagnostics 4 |
| WRRenderBackend#0 | 36 | 1.8 | Other 36 | 0 / 0 / 36 | webrender_render 0, array_buffer_copy 0, memcpy_memset 0 |
| Compositor | 16 | 0.8 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 16, paint_layout 0, webrender_render 0 |
| SwComposite | 14 | 0.7 | Other 14 | 0 / 0 / 14 | webrender_render 14, poll_wait 13, webrender_sw_raster 1, memcpy_memset 1 |
| WRSceneBuilder#0 | 12 | 0.6 | Other 12 | 0 / 0 / 12 | webrender_scene 12, webrender_render 0, webrender_sw_raster 0, paint_layout 0 |
| IPC I/O Parent | 5 | 0.2 | Idle 4, Other 0 | 0 / 0 / 5 | poll_wait 4, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.0 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 44; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `nsIFrame::ShouldApplyOverflowClipping(nsStyleDisplay const*) const [li` 1; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, char const*` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `void js::gc::MarkingTracerT<6u>::markAndTraverse<js::BaseScript>(js::B` 1

**tab pid 8454** — 58 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 50 | 2.5 | Idle 42, Graphics 4, Other 2, JavaScript 2 | 0 / 2 / 48 | ipc 48, poll_wait 42, paint_layout 4, harness_diagnostics 1 |
| IPC I/O Child | 8 | 0.4 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 42; `[]` 1; `nsIFrame::Extend3DContext(nsStyleDisplay const*, nsStyleEffects const*` 1; `floorf [libxul.so]` 1; `mozilla::FlattenedDisplayListIterator::ResolveFlattening() [libxul.so]` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 0; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(unsigned lon` 0; `nsLayoutUtils::GetRootMetadata(mozilla::nsDisplayListBuilder*, mozilla` 0

**tab pid 8532** — 0 ms CPU in the window

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

**tab pid 8528** — 0 ms CPU in the window

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

