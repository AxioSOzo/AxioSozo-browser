### gecko-debian raf (profile pass)

**parent pid 8177** — 460 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 231 | 7.6 | Graphics 143, Idle 88, Other 0, Profiler 0 | 0 / 0 / 231 | ipc 231, webrender_render 143, webrender_sw_raster 129, poll_wait 89 |
| GeckoMain | 69 | 2.3 | GC / CC 37, Idle 20, JavaScript 4, Other 4 | 0 / 2 / 67 | ipc 69, gc_cc 40, poll_wait 23, paint_layout 3 |
| WRRenderBackend#0 | 50 | 1.6 | Other 50 | 0 / 0 / 50 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| Compositor | 36 | 1.2 | Idle 35, Other 2, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 35, webrender_render 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 36 | 1.2 | Other 36, Profiler 0 | 0 / 0 / 36 | webrender_scene 36, webrender_render 1, poll_wait 0, memcpy_memset 0 |
| SwComposite | 21 | 0.7 | Other 21 | 0 / 0 / 21 | webrender_render 21, poll_wait 19, webrender_sw_raster 2, memcpy_memset 2 |
| IPC I/O Parent | 8 | 0.3 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 24; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `void mozilla::WriteULEB128<unsigned int, mozilla::ProfileBufferEntryWr` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 2; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 2; `js::GCMarker::markCurrentColorInParallel(js::gc::ParallelMarkTask*, JS` 2

**tab pid 8424** — 149 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 135 | 4.4 | Idle 91, Layout 13, Graphics 11, GC / CC 6 | 0 / 5 / 131 | ipc 131, poll_wait 91, paint_layout 30, gc_cc 8 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 2 | 0.1 | Other 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 93; `[]` 2; `nsLayoutUtils::GetTransformToAncestorScale(nsIFrame const*) [libxul.so` 1; `gfxFont::Draw(gfxTextRun const*, unsigned int, unsigned int, mozilla::` 1; `[linux-vdso.so.1]` 1; `getcontext [libc.so.6]` 1; `mozilla::DOMEventTargetHelper::~DOMEventTargetHelper() [libxul.so]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1

**tab pid 8361** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0

**tab pid 8513** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

