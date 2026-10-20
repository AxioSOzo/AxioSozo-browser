### gecko-debian idle (profile pass)

**parent pid 8124** — 57 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 50 | 2.4 | GC / CC 29, Idle 7, Other 6, JavaScript 6 | 0 / 7 / 43 | ipc 50, gc_cc 33, poll_wait 12, harness_diagnostics 5 |
| Compositor | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | ipc 2, memcpy_memset 1, poll_wait 1 |
| DOM Worker | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | worker_messaging 2, ipc 2, poll_wait 1, gc_cc 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Renderer | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| WRRenderBackend#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `[axiosozo-dev]` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 2; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObjectEdge(JSO` 1; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onShapeEdge(js::Sh` 1

**tab pid 8377** — 30 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 25 | 1.2 | Idle 15, GC / CC 6, JavaScript 3, Other 1 | 1 / 2 / 22 | ipc 23, poll_wait 15, gc_cc 7, harness_diagnostics 3 |
| IPC I/O Child | 5 | 0.2 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 16; `[]` 2; `PLDHashTable::MakeEntryHandle(void const*) [libxul.so]` 1; `js::gc::TraceEdgeInternal(JSTracer*, js::TaggedProto*, char const*) [l` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(JSObject*) ` 1; `next (self-hosted:392:27)[2]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1

**tab pid 8312** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8468** — 1 ms CPU in the window

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

