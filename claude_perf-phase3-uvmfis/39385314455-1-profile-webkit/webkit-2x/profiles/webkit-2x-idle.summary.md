### webkit-2x idle (profile pass)

**parent pid 8674** — 400 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 252 | 12.3 | Idle 127, GC / CC 81, JavaScript 21, Other 14 | 3 / 23 / 226 | ipc 250, poll_wait 133, gc_cc 89, harness_diagnostics 24 |
| DOM Worker | 83 | 4.0 | JavaScript 83 | 0 / 0 / 83 | subprocess_pipe_io 83, js_ctypes 83, worker_messaging 83, ipc 83 |
| DOM Worker | 40 | 1.9 | GC / CC 39, Idle 1 | 0 / 0 / 40 | worker_messaging 40, ipc 40, gc_cc 39, memcpy_memset 15 |
| Timer | 16 | 0.8 | Other 16, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, memcpy_memset 0 |
| Compositor | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 1 |
| DOM Worker | 2 | 0.1 | Other 1, Idle 0 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 1, poll_wait 0 |
| Renderer | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| BackgroundThreadPool #2 | 1 | 0.1 | Other 1, Idle 0 | 0 / 0 / 1 | ipc 1, native_receiver 1, memcpy_memset 1, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 131; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `[unknown]` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 7; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 4; `[axiosozo-dev]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3

**tab pid 8826** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8765** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9079** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Layout 0 | 0 / 0 / 1 | ipc 1, poll_wait 0, paint_layout 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `nsTArray_base<nsTArray_RelocateUsingMemutils>::MoveInit(nsTArray_base<` 0

