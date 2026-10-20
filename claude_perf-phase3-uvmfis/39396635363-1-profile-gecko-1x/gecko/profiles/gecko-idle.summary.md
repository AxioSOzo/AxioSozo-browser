### gecko idle (profile pass)

**parent pid 3048** — 54 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 47 | 2.2 | GC / CC 27, Idle 8, JavaScript 6, Other 6 | 1 / 6 / 40 | ipc 47, gc_cc 32, poll_wait 13, harness_diagnostics 4 |
| Compositor | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, memcpy_memset 0 |
| DOM Worker | 1 | 0.1 | Other 1, Idle 1 | 0 / 0 / 1 | worker_messaging 1, ipc 1, memcpy_memset 1, gc_cc 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Renderer | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| WRRenderBackend#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 |  |

Main thread, top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 2; `recvmsg [libc.so.6]` 1; `mprotect [libc.so.6]` 1

**tab pid 3312** — 29 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 24 | 1.2 | Idle 15, GC / CC 5, JavaScript 2, DOM 1 | 0 / 3 / 21 | ipc 23, poll_wait 15, gc_cc 7, harness_diagnostics 3 |
| IPC I/O Child | 4 | 0.2 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 15; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `webrtc::videocapturemodule::DeviceInfoFake::NumberOfDevices() [libxul.` 1; `mprotect [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `mozilla::dom::AutoNoJSAPI::~AutoNoJSAPI() [libxul.so]` 1

**tab pid 3398** — 1 ms CPU in the window

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

**tab pid 3396** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ipc::MessageChannel::DispatchMessage(mozilla::ipc::ActorLifec` 0

