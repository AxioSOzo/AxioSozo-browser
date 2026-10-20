### gecko-debian raf-nosampler (profile pass)

**parent pid 8212** — 568 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 329 | 10.9 | Graphics 238, Idle 90, Profiler 1 | 0 / 0 / 329 | ipc 325, webrender_render 239, webrender_sw_raster 213, poll_wait 95 |
| WRRenderBackend#0 | 66 | 2.2 | Other 66 | 0 / 0 / 66 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| GeckoMain | 48 | 1.6 | GC / CC 30, Idle 13, JavaScript 3, Other 1 | 0 / 1 / 47 | ipc 48, gc_cc 33, poll_wait 16, harness_diagnostics 1 |
| WRSceneBuilder#0 | 48 | 1.6 | Other 48 | 0 / 0 / 48 | webrender_scene 48, webrender_render 2, poll_wait 1, memcpy_memset 0 |
| Compositor | 45 | 1.5 | Idle 43, Other 1, Profiler 0 | 0 / 0 / 45 | ipc 44, poll_wait 43, webrender_render 0, memcpy_memset 0 |
| SwComposite | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_render 13, poll_wait 13, webrender_sw_raster 0, memcpy_memset 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 16; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::AbstractGeneratorObject::resume(JSContext*, js::InterpreterActivat` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned int, mozilla` 1

**tab pid 8460** — 184 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 167 | 5.5 | Idle 95, Graphics 28, Layout 16, Other 13 | 0 / 6 / 162 | ipc 155, poll_wait 96, paint_layout 54, gc_cc 7 |
| IPC I/O Child | 15 | 0.5 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 102; `[]` 7; `getcontext [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `mozilla::ipc::MessageChannel::AddProfilerMarker(IPC::Message const&, m` 2; `[linux-vdso.so.1]` 2; `mozilla::layers::FocusTarget::FocusTarget(mozilla::PresShell*, unsigne` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1

**tab pid 8550** — 1 ms CPU in the window

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

**tab pid 8379** — 1 ms CPU in the window

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

