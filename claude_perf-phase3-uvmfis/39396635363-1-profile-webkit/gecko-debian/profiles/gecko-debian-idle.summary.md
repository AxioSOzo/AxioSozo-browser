### gecko-debian idle (profile pass)

**parent pid 8204** — 98 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 2.4 | GC / CC 31, JavaScript 7, Idle 6, Other 4 | 0 / 7 / 43 | ipc 48, gc_cc 35, poll_wait 8, harness_diagnostics 5 |
| DOM Worker | 40 | 2.0 | Other 36, GC / CC 4, Idle 0 | 0 / 0 / 40 | worker_messaging 39, ipc 39, gc_cc 39, memcpy_memset 14 |
| DOM Worker | 2 | 0.1 | GC / CC 2, Idle 1 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 2, poll_wait 1 |
| Compositor | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | ipc 2, memcpy_memset 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Renderer | 1 | 0.0 | Graphics 0, Idle 0 | 0 / 0 / 1 | ipc 1, memcpy_memset 0, webrender_render 0, webrender_sw_raster 0 |
| SwComposite | 1 | 0.0 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `[axiosozo-dev]` 2; `mprotect [libc.so.6]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2

**tab pid 8434** — 21 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 17 | 0.8 | Idle 12, JavaScript 3, Profiler 1, Other 0 | 0 / 4 / 13 | ipc 16, poll_wait 12, harness_diagnostics 3, gc_cc 2 |
| IPC I/O Child | 4 | 0.2 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 12; `__memset_evex_unaligned_erms [libc.so.6]` 1; `js::ForwardingProxyHandler::get(JSContext*, JS::Handle<JSObject*>, JS:` 1; `js::frontend::BytecodeEmitter::newSrcNote(js::SrcNoteType, unsigned in` 1; `js::jit::CacheIRWriter::loadInt32Constant(unsigned int) [libxul.so]` 1; `bool js::gc::UnmarkGrayTracer<8u>::onChild<JSObject>(JSObject*) [libxu` 0; `[]` 0; `nsTimer::InitWithNamedFuncCallback(void (*)(nsITimer*, void*), void*, ` 0

**tab pid 8522** — 1 ms CPU in the window

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

**tab pid 8526** — 1 ms CPU in the window

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

