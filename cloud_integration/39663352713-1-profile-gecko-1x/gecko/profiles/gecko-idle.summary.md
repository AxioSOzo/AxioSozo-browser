### gecko idle (profile pass)

**parent pid 2911** — 93 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 43 | 2.1 | GC / CC 24, Idle 7, Other 6, JavaScript 5 | 0 / 5 / 38 | ipc 43, gc_cc 31, poll_wait 8, harness_diagnostics 4 |
| DOM Worker | 41 | 2.0 | Other 37, GC / CC 4, Idle 0 | 0 / 0 / 41 | worker_messaging 41, ipc 41, gc_cc 41, memcpy_memset 19 |
| Compositor | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | ipc 2, memcpy_memset 1, poll_wait 1 |
| DOM Worker | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | worker_messaging 2, ipc 2, poll_wait 1, gc_cc 1 |
| DOM Worker | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Renderer | 1 | 0.0 | Graphics 1, Idle 0 | 0 / 0 / 1 | ipc 1, webrender_render 1, poll_wait 0 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `write [libc.so.6]` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::dom::CallbackObjectBase::MarkForCC() [libxul.so]` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1

**tab pid 3176** — 23 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 18 | 0.9 | Idle 13, JavaScript 2, Other 2, DOM 1 | 0 / 2 / 16 | ipc 17, poll_wait 14, harness_diagnostics 2, array_buffer_copy 2 |
| IPC I/O Child | 5 | 0.2 | Idle 5 | 0 / 0 / 5 | poll_wait 5 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 13; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `[linux-vdso.so.1]` 1; `mozilla::dom::JSActor::QueryHandler::SendReply(JSContext*, mozilla::do` 1; `js::frontend::ScopeStencil::createScope(JSContext*, js::frontend::Comp` 1; `sendmsg [libc.so.6]` 0; `g_mutex_lock [libglib-2.0.so.0]` 0; `read [libc.so.6]` 0

**tab pid 3110** — 1 ms CPU in the window

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

**tab pid 3265** — 1 ms CPU in the window

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

