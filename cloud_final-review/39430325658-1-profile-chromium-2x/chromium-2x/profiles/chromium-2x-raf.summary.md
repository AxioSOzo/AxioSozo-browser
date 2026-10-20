### chromium-2x raf (profile pass)

**parent pid 3348** — 1142 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 360 | 11.5 | Idle 235, JavaScript 65, Other 44, DOM 12 | 8 / 68 / 285 | ipc 360, poll_wait 256, gc_cc 62, worker_messaging 31 |
| DOM Worker | 268 | 8.5 | JavaScript 257, Other 5, Profiler 5 | 0 / 0 / 268 | subprocess_pipe_io 268, worker_messaging 268, ipc 268, js_ctypes 250 |
| Renderer | 150 | 4.8 | Idle 96, Graphics 52, Other 2, Profiler 0 | 0 / 0 / 150 | ipc 149, poll_wait 106, webrender_render 52, webrender_sw_raster 44 |
| SwComposite | 107 | 3.4 | Other 107 | 0 / 0 / 107 | webrender_render 107, poll_wait 91, webrender_sw_raster 16, memcpy_memset 15 |
| BackgroundThreadPool #2 | 106 | 3.4 | Idle 90, Other 16, Graphics 1 | 0 / 0 / 106 | ipc 106, poll_wait 89, native_receiver 16, memcpy_memset 16 |
| WRRenderBackend#0 | 54 | 1.7 | Other 54 | 0 / 0 / 54 | webrender_render 1, memcpy_memset 1, poll_wait 1, webrender_scene 0 |
| Compositor | 39 | 1.3 | Idle 39, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 39 | ipc 39, poll_wait 39, webrender_render 0, canvas_2d 0 |
| Timer | 30 | 0.9 | Other 30, Profiler 0 | 0 / 0 / 30 | ipc 30, poll_wait 29 |

Main thread, top self: `poll [libc.so.6]` 239; `[unknown]` 11; `recvmsg [libc.so.6]` 9; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*, JS::Hand` 3; `write [libc.so.6]` 3; `mprotect [libc.so.6]` 3; `[linux-vdso.so.1]` 2

**tab pid 3547** — 12 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 11 | 0.4 | GC / CC 8, Idle 3, Profiler 0 | 0 / 0 / 11 | ipc 10, gc_cc 8, poll_wait 4, memcpy_memset 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `CheckParticipatesInCycleCollection(JS::GCCellPtr, char const*, void*) ` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onShapeEdge(js::Sh` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(JSObject*) ` 1

**tab pid 3455** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 10 | 0.3 | GC / CC 8, Idle 2, Other 0 | 0 / 0 / 10 | ipc 9, gc_cc 8, poll_wait 3 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `[]` 0

**tab pid 3508** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | GC / CC 2, Idle 2, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3, gc_cc 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned int, mozilla` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::TypedRootedTraceableBase<js::PersistentRootedTraceableBase, std::u` 0; `__lll_lock_wait [libc.so.6]` 0; `nsTHashtable<nsBaseHashtableET<nsGenericHashKey<mojo::core::ports::Nod` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

