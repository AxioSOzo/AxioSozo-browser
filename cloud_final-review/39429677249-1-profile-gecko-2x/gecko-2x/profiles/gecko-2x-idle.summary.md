### gecko-2x idle (profile pass)

**parent pid 3067** — 58 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 2.3 | GC / CC 29, Idle 7, JavaScript 5, Other 4 | 0 / 7 / 41 | ipc 48, gc_cc 33, poll_wait 11, harness_diagnostics 4 |
| DOM Worker | 3 | 0.1 | Idle 2, Other 1 | 0 / 0 / 3 | worker_messaging 3, ipc 3, poll_wait 3, gc_cc 1 |
| Renderer | 1 | 0.1 | Graphics 1, Idle 0 | 0 / 0 / 1 | ipc 1, webrender_render 1, poll_wait 0 |
| SwComposite | 1 | 0.1 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1 |
| Compositor | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| DOM Worker | 1 | 0.0 | Other 1, Idle 0 | 0 / 0 / 1 | worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0 |
| IPC I/O Parent | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `recvmsg [libc.so.6]` 1; `js::jit::ICScript::initICEntries(JSContext*, JSScript*) [libxul.so]` 1

**tab pid 3307** — 29 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 24 | 1.2 | Idle 15, GC / CC 5, JavaScript 2, Other 1 | 0 / 3 / 21 | ipc 24, poll_wait 15, gc_cc 6, harness_diagnostics 3 |
| IPC I/O Child | 4 | 0.2 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 15; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObjectEdge(JSObj` 1; `mozilla::dom::Element::UnbindFromTree(mozilla::dom::UnbindContext&) [l` 1; `js::jit::CacheIRWriter::loadObject(JSObject*) [libxul.so]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::GenericTracerImpl<TraversalTracer>::onScriptEdge(js::BaseScript**,` 1; `_ZZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13ReserveAnd` 1; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, JS::Mutable` 1

**tab pid 3242** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3316** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

