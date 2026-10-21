### gecko-debian idle (profile pass)

**parent pid 8168** — 62 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 54 | 2.6 | GC / CC 30, Other 8, Idle 7, JavaScript 6 | 1 / 7 / 46 | ipc 53, gc_cc 36, poll_wait 12, harness_diagnostics 5 |
| DOM Worker | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1 |
| Compositor | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Renderer | 0 | 0.0 | Graphics 0, Idle 0 | 0 / 0 / 0 | ipc 0, memcpy_memset 0, webrender_render 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 12; `mprotect [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `__lll_lock_wait [libc.so.6]` 1

**tab pid 8417** — 44 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 1.8 | Idle 25, GC / CC 6, JavaScript 4, Profiler 1 | 0 / 5 / 32 | ipc 35, poll_wait 24, gc_cc 8, harness_diagnostics 4 |
| IPC I/O Child | 7 | 0.3 | Idle 6, Other 0 | 0 / 0 / 7 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 24; `[]` 1; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::CycleCollec` 1; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*>, JS::Han` 1; `js::frontend::ParserAtomsTable::appendTo(js::StringBuilder&, js::front` 1

**tab pid 8507** — 1 ms CPU in the window

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

**tab pid 8461** — 1 ms CPU in the window

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

