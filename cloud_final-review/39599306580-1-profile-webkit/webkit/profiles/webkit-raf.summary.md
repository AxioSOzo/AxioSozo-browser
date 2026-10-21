### webkit raf (profile pass)

**parent pid 7154** — 1062 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 485 | 15.5 | Idle 298, JavaScript 87, Other 38, GC / CC 37 | 11 / 86 / 388 | ipc 483, poll_wait 322, gc_cc 112, engine_stream_read 49 |
| DOM Worker | 270 | 8.6 | JavaScript 263, Other 5, Profiler 2 | 0 / 0 / 270 | subprocess_pipe_io 270, worker_messaging 269, ipc 269, js_ctypes 251 |
| Renderer | 84 | 2.7 | Idle 64, Graphics 19, Profiler 0, Other 0 | 0 / 0 / 84 | ipc 84, poll_wait 68, webrender_render 20, webrender_sw_raster 12 |
| WRRenderBackend#0 | 49 | 1.6 | Other 49 | 0 / 0 / 49 |  |
| Compositor | 42 | 1.3 | Idle 41, Other 0, Graphics 0 | 0 / 0 / 42 | ipc 42, poll_wait 41, webrender_render 0, canvas_2d 0 |
| SwComposite | 41 | 1.3 | Other 41 | 0 / 0 / 41 | webrender_render 41, poll_wait 39, memcpy_memset 1, webrender_sw_raster 1 |
| BackgroundThreadPool #3 | 32 | 1.0 | Idle 31, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, native_receiver 1, memcpy_memset 1 |
| Timer | 31 | 1.0 | Other 31, Profiler 0 | 0 / 0 / 31 | ipc 31, poll_wait 30, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 317; `[unknown]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 3

**tab pid 7692** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | Idle 2, GC / CC 2, Other 0, Profiler 0 | 0 / 0 / 5 | ipc 4, gc_cc 2, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 1; `[]` 0; `IID2NativeInterfaceMap::Trace(JSTracer*) [libxul.so]` 0; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0; `getcontext [libc.so.6]` 0

**tab pid 7313** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7698** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::NodeChannel::SendMessage(std::unique_ptr<IPC::Message, s` 0

