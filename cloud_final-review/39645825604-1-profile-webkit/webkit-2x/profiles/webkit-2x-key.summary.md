### webkit-2x key (profile pass)

**parent pid 8817** — 572 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 330 | 9.0 | Idle 162, JavaScript 43, GC / CC 31, Graphics 28 | 5 / 75 / 249 | ipc 328, poll_wait 178, gc_cc 79, paint_layout 56 |
| DOM Worker | 92 | 2.5 | JavaScript 89, Other 3, Profiler 1 | 0 / 0 / 92 | subprocess_pipe_io 92, worker_messaging 92, ipc 92, js_ctypes 88 |
| Renderer | 58 | 1.6 | Graphics 38, Idle 18, Other 2 | 0 / 0 / 58 | ipc 58, webrender_render 38, webrender_sw_raster 35, poll_wait 18 |
| SwComposite | 29 | 0.8 | Other 29 | 0 / 0 / 29 | webrender_render 29, poll_wait 19, memcpy_memset 10, webrender_sw_raster 10 |
| Timer | 19 | 0.5 | Other 19, Profiler 0 | 0 / 0 / 19 | ipc 19, poll_wait 19 |
| WRRenderBackend#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | webrender_scene 0 |
| Compositor | 11 | 0.3 | Idle 11, Other 0 | 0 / 0 / 11 | ipc 11, poll_wait 11, webrender_render 0, canvas_2d 0 |
| WRSceneBuilder#0 | 7 | 0.2 | Other 6, Graphics 1 | 0 / 0 / 7 | webrender_scene 7, webrender_sw_raster 1, poll_wait 1, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 167; `[axiosozo-dev]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `syscall [libc.so.6]` 5; `[unknown]` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 4; `mozilla::GlobalKeyListener::WalkHandlersAndExecute(mozilla::GlobalKeyL` 3; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 2

**tab pid 8908** — 14 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 13 | 0.4 | GC / CC 6, Idle 5, Other 1, JavaScript 1 | 0 / 0 / 12 | ipc 12, gc_cc 7, poll_wait 6, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::jit::ExecutableAllocator::poisonCode(JSRuntime*, mozilla::Vector<j` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `js::gc::TraceExternalEdge(JSTracer*, JS::PropertyKey*, char const*) [l` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `js::Proxy::getElements(JSContext*, JS::Handle<JSObject*>, unsigned int` 0; `[unknown]` 0

**tab pid 9016** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | GC / CC 5, Idle 1, Other 1, Profiler 0 | 0 / 0 / 7 | ipc 7, gc_cc 5, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 0; `void mozilla::ProfileBufferEntryWriter::WriteObjects<mozilla::ProfileB` 0

**tab pid 8967** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | GC / CC 1, Idle 1 | 0 / 0 / 2 | poll_wait 2, ipc 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 0

