### gecko idle (profile pass)

**parent pid 3064** — 60 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 53 | 2.5 | GC / CC 34, JavaScript 6, Idle 6, Other 5 | 0 / 7 / 46 | ipc 53, gc_cc 40, poll_wait 11, harness_diagnostics 4 |
| Compositor | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | ipc 2, memcpy_memset 1, poll_wait 1 |
| DOM Worker | 1 | 0.1 | Other 1, Idle 1 | 0 / 0 / 1 | worker_messaging 1, ipc 1, gc_cc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Renderer | 0 | 0.0 | Graphics 0, Idle 0 | 0 / 0 / 0 | ipc 0, canvas_2d 0, webrender_render 0, poll_wait 0 |
| WRRenderBackend#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 |  |

Main thread, top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `poll [libc.so.6]` 7; `mprotect [libc.so.6]` 4; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `recvmsg [libc.so.6]` 2; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `syscall [libc.so.6]` 2

**tab pid 3312** — 35 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 30 | 1.4 | Idle 18, GC / CC 6, JavaScript 4, Other 1 | 0 / 4 / 25 | ipc 29, poll_wait 18, gc_cc 7, harness_diagnostics 4 |
| IPC I/O Child | 5 | 0.2 | Idle 5, Profiler 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 18; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `ProfilingStack::pushSpMarkerFrame(void*) [libxul.so]` 1; `auto JS::MapGCThingTyped<js::gc::MarkingTracerT<1u>::markAndTraversePr` 1

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

**tab pid 3232** — 1 ms CPU in the window

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

