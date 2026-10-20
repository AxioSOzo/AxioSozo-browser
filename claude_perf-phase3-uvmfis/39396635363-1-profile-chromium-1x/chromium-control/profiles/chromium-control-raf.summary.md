### chromium-control raf (profile pass)

**parent pid 4588** — 1183 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 357 | 11.3 | Idle 224, JavaScript 60, GC / CC 30, Other 30 | 6 / 58 / 294 | ipc 357, poll_wait 243, gc_cc 87, worker_messaging 35 |
| DOM Worker | 273 | 8.7 | JavaScript 266, Other 3, Profiler 3 | 0 / 0 / 273 | subprocess_pipe_io 273, worker_messaging 273, ipc 273, js_ctypes 259 |
| Renderer | 210 | 6.7 | Idle 129, Graphics 80, Other 1 | 0 / 0 / 210 | ipc 210, poll_wait 131, webrender_render 80, webrender_sw_raster 72 |
| SwComposite | 164 | 5.2 | Other 164 | 0 / 0 / 164 | webrender_render 164, poll_wait 114, webrender_sw_raster 50, memcpy_memset 3 |
| WRRenderBackend#0 | 53 | 1.7 | Other 52, Profiler 0 | 0 / 0 / 53 | webrender_render 1, poll_wait 0 |
| Compositor | 35 | 1.1 | Idle 35, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 35 | ipc 35, poll_wait 34, webrender_render 0, canvas_2d 0 |
| Timer | 33 | 1.1 | Other 33, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 33, memcpy_memset 0 |
| BackgroundThreadPool #1 | 32 | 1.0 | Idle 32, Other 0 | 0 / 0 / 32 | ipc 32, poll_wait 32, native_receiver 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 227; `[unknown]` 8; `recvmsg [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::ScriptWarmUpData::trace(JSTracer*) [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 4; `write [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3

**tab pid 4764** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.3 | GC / CC 9, Idle 1 | 0 / 0 / 10 | ipc 10, gc_cc 9, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `poll [libc.so.6]` 1; `js::CyclicModuleFields::trace(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::GCCellPtr,` 1; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [libxul.so]` 1

**tab pid 4678** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.3 | GC / CC 7, Idle 2 | 0 / 0 / 10 | ipc 8, gc_cc 7, poll_wait 4 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(JSObject*) ` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1

**tab pid 4725** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, GC / CC 2 | 0 / 0 / 4 | ipc 4, poll_wait 2, gc_cc 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1

