### chromium raf (profile pass)

**parent pid 3348** — 903 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 359 | 11.4 | Idle 213, JavaScript 61, GC / CC 34, Other 32 | 12 / 59 / 288 | ipc 358, poll_wait 229, gc_cc 97, engine_stream_read 37 |
| DOM Worker | 273 | 8.7 | JavaScript 265, Profiler 5, Other 4 | 0 / 0 / 273 | subprocess_pipe_io 273, worker_messaging 272, ipc 272, js_ctypes 255 |
| Renderer | 69 | 2.2 | Idle 56, Graphics 13, Profiler 0, Other 0 | 0 / 0 / 69 | ipc 69, poll_wait 59, webrender_render 14, webrender_sw_raster 8 |
| WRRenderBackend#0 | 40 | 1.3 | Other 40 | 0 / 0 / 40 | webrender_render 1, memcpy_memset 1, poll_wait 0, array_buffer_copy 0 |
| SwComposite | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 37, poll_wait 36, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 35 | 1.1 | Idle 34, Other 1, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 34, webrender_render 1, canvas_2d 0 |
| Timer | 33 | 1.1 | Other 33, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 33, memcpy_memset 0 |
| BackgroundThreadPool #1 | 31 | 1.0 | Idle 31, Other 0, Profiler 0 | 0 / 0 / 31 | ipc 31, poll_wait 30, native_receiver 0, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 216; `[unknown]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `write [libc.so.6]` 5; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 5; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 3; `read [libc.so.6]` 3

**tab pid 3526** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.3 | GC / CC 8, Idle 2 | 0 / 0 / 10 | ipc 10, gc_cc 8, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onShapeEdge(js::Sh` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 1

**tab pid 3439** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.3 | GC / CC 8, Idle 2, Other 0 | 0 / 0 / 10 | ipc 10, gc_cc 8, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `poll [libc.so.6]` 2; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 1; `JsGcTracer::Trace(JS::Heap<JSObject*>*, char const*, void*) const [lib` 1; `JSObject2WrappedJSMap::UpdateWeakPointersAfterGC(JSTracer*) [libxul.so` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `mozilla::detail::SprintfAppend::append(char const*, unsigned long) [li` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0

**tab pid 3995** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, GC / CC 2 | 0 / 0 / 4 | ipc 4, poll_wait 3, gc_cc 2 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `JS::RuntimeHeapState() [libxul.so]` 0; `fog_custom_distribution_accumulate_single_sample [libxul.so]` 0

