### gecko-2x idle (profile pass)

**parent pid 3036** — 47 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 40 | 1.9 | GC / CC 21, Other 7, Idle 6, JavaScript 5 | 0 / 6 / 34 | ipc 40, gc_cc 25, poll_wait 11, harness_diagnostics 4 |
| Compositor | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| DOM Worker | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | worker_messaging 1, ipc 1, poll_wait 1, gc_cc 0 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| SwComposite | 1 | 0.0 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1 |
| Renderer | 1 | 0.0 | Graphics 1, Idle 0 | 0 / 0 / 1 | ipc 1, memcpy_memset 1, webrender_render 1, webrender_sw_raster 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `recvmsg [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<nsIClassInfo*, RefPtr` 1; `non-virtual thunk to nsToolkitProfileService::Release() [libxul.so]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1

**tab pid 3278** — 27 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 23 | 1.1 | Idle 14, GC / CC 5, JavaScript 3, Profiler 0 | 0 / 3 / 20 | ipc 21, poll_wait 14, gc_cc 5, harness_diagnostics 3 |
| IPC I/O Child | 4 | 0.2 | Idle 4 | 0 / 0 / 4 | poll_wait 4 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 14; `nsOuterWindowProxy::getOwnPropertyDescriptor(JSContext*, JS::Handle<JS` 1; `[]` 1; `mozilla::CycleCollectedJSRuntime::NoteGCThingXPCOMChildren(JSClass con` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1; `js::ForwardingProxyHandler::isCallable(JSObject*) const [libxul.so]` 1; `mmap64 [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1

**tab pid 3201** — 1 ms CPU in the window

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

**tab pid 3367** — 1 ms CPU in the window

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

