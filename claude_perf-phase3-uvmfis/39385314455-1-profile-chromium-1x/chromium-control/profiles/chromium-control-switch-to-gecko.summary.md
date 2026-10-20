### chromium-control switch-to-gecko (profile pass)

**parent pid 4455** — 369 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 244 | 1.6 | GC / CC 162, JavaScript 20, Layout 18, Idle 18 | 0 / 38 / 205 | ipc 244, gc_cc 179, poll_wait 27, paint_layout 26 |
| DOM Worker | 67 | 0.4 | GC / CC 30, Other 23, JavaScript 13, Idle 1 | 0 / 0 / 67 | subprocess_pipe_io 67, worker_messaging 67, ipc 67, gc_cc 53 |
| Renderer | 21 | 0.1 | Graphics 18, Idle 3 | 0 / 0 / 21 | ipc 21, webrender_render 18, webrender_sw_raster 16, poll_wait 3 |
| BgIOThreadPool #2 | 12 | 0.1 | Other 12, Idle 0 | 0 / 0 / 12 | ipc 12, poll_wait 0 |
| Compositor | 8 | 0.1 | Other 5, Idle 3 | 0 / 0 / 8 | ipc 8, memcpy_memset 4, poll_wait 3 |
| IPC I/O Parent | 7 | 0.0 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 6, ipc 1 |
| Timer | 3 | 0.0 | Other 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 20; `poll [libc.so.6]` 19; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 8; `write [libc.so.6]` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 7; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 6

**tab pid 4636** — 15 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.1 | GC / CC 6, Idle 4, Other 1, Profiler 1 | 0 / 0 / 12 | ipc 11, gc_cc 8, poll_wait 4, memcpy_memset 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `mozilla::dom::CallbackObject::cycleCollection::Trace(void*, TraceCallb` 1; `sendmsg [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 4540** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.1 | GC / CC 7, Idle 2, Other 1, JavaScript 0 | 0 / 0 / 10 | ipc 9, gc_cc 7, poll_wait 4, array_buffer_copy 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<1u>::markOneColor<(js::gc::MarkColor)2>(JS` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObjectEdge(JSObj` 1; `read [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `JSObject2WrappedJSMap::UpdateWeakPointersAfterGC(JSTracer*) [libxul.so` 1; `nsObserverList::AppendStrongObservers(nsCOMArray<nsIObserver>&) [libxu` 0

**tab pid 5010** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3

