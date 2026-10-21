### chromium raf (profile pass)

**parent pid 3367** — 1112 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 468 | 14.8 | Idle 265, JavaScript 95, Other 51, GC / CC 25 | 10 / 98 / 360 | ipc 467, poll_wait 295, gc_cc 122, worker_messaging 49 |
| DOM Worker | 305 | 9.7 | JavaScript 295, Other 7, Profiler 4 | 0 / 0 / 305 | subprocess_pipe_io 305, worker_messaging 305, ipc 305, js_ctypes 283 |
| Renderer | 88 | 2.8 | Idle 67, Graphics 21, Other 1 | 0 / 0 / 88 | ipc 88, poll_wait 72, webrender_render 21, webrender_sw_raster 14 |
| WRRenderBackend#0 | 53 | 1.7 | Other 53 | 0 / 0 / 53 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 46 | 1.5 | Idle 44, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 46 | ipc 46, poll_wait 44, webrender_render 1, canvas_2d 0 |
| SwComposite | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_render 43, poll_wait 42, memcpy_memset 1, webrender_sw_raster 1 |
| BackgroundThreadPool #3 | 39 | 1.2 | Idle 36, Other 2, Graphics 1 | 0 / 0 / 39 | ipc 39, poll_wait 37, native_receiver 3, memcpy_memset 2 |
| Timer | 37 | 1.2 | Other 37, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 36, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 268; `[unknown]` 18; `recvmsg [libc.so.6]` 14; `write [libc.so.6]` 9; `[axiosozo-dev]` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4

**tab pid 3551** — 13 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.4 | GC / CC 9, Idle 3 | 0 / 0 / 12 | ipc 11, gc_cc 9, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, char const*` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 1

**tab pid 3464** — 12 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.4 | GC / CC 10, Idle 2 | 0 / 0 / 12 | ipc 10, gc_cc 10, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `poll [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::GCCellPtr,` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 1; `js::detail::OrderedHashTableImpl<js::OrderedHashMapImpl<js::PreBarrier` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `[]` 1; `RemoveSkippableVisitor::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [` 0

**tab pid 3511** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | GC / CC 2, Idle 2, Other 0 | 0 / 0 / 4 | ipc 4, gc_cc 2, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `void js::gc::GCRuntime::maybeMarkWeaklyHeldAtom<JSAtom>(JSAtom*) [libx` 0; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 0; `mozilla::MemoryTelemetry::Get() [libxul.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[linux-vdso.so.1]` 0

