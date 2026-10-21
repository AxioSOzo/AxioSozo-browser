### gecko-debian raf-nosampler (profile pass)

**parent pid 8177** — 410 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 225 | 7.5 | Graphics 139, Idle 85 | 0 / 0 / 225 | ipc 223, webrender_render 139, webrender_sw_raster 117, poll_wait 90 |
| WRRenderBackend#0 | 45 | 1.5 | Other 45 | 0 / 0 / 45 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| GeckoMain | 43 | 1.4 | GC / CC 27, Idle 10, JavaScript 3, Other 2 | 0 / 3 / 40 | ipc 43, gc_cc 31, poll_wait 12, harness_diagnostics 3 |
| Compositor | 34 | 1.1 | Idle 33, Other 1, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 33, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 33 | 1.1 | Other 33, Profiler 0 | 0 / 0 / 33 | webrender_scene 32, webrender_render 1, memcpy_memset 0, poll_wait 0 |
| SwComposite | 12 | 0.4 | Other 12 | 0 / 0 / 12 | webrender_render 12, poll_wait 12, webrender_sw_raster 1, memcpy_memset 1 |
| IPC I/O Parent | 8 | 0.3 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::BaseScript::enclosingScope() const [libxul.so]` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `JSObject::allocKindForTenure(js::Nursery const&) const [libxul.so]` 1

**tab pid 8424** — 130 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 117 | 3.9 | Idle 85, Graphics 11, Layout 8, Other 6 | 0 / 2 / 115 | ipc 114, poll_wait 85, paint_layout 23, gc_cc 3 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 86; `[]` 2; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBarrier(js::` 1; `unsigned long js::gc::Arena::finalize<js::BaseScript, (js::gc::Finaliz` 1; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 1; `getcontext [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1

**tab pid 8361** — 1 ms CPU in the window

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

**tab pid 8320** — 1 ms CPU in the window

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

