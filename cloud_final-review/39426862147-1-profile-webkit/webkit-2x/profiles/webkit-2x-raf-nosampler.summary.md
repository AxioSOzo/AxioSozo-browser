### webkit-2x raf-nosampler (profile pass)

**parent pid 8838** — 993 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 223 | 7.4 | Idle 109, JavaScript 51, GC / CC 36, Other 16 | 3 / 53 / 168 | ipc 222, poll_wait 117, gc_cc 91, engine_stream_read 44 |
| DOM Worker | 213 | 7.0 | JavaScript 203, Profiler 6, Other 4 | 0 / 0 / 213 | subprocess_pipe_io 213, worker_messaging 213, ipc 213, js_ctypes 197 |
| Renderer | 193 | 6.4 | Idle 107, Graphics 85, Other 2 | 0 / 0 / 193 | ipc 193, poll_wait 122, webrender_render 86, webrender_sw_raster 81 |
| SwComposite | 138 | 4.6 | Other 138 | 0 / 0 / 138 | webrender_render 138, poll_wait 108, webrender_sw_raster 30, memcpy_memset 26 |
| BackgroundThreadPool #2 | 130 | 4.3 | Idle 85, Other 42, Graphics 2, Profiler 1 | 0 / 0 / 130 | ipc 130, poll_wait 86, native_receiver 43, memcpy_memset 40 |
| WRRenderBackend#0 | 42 | 1.4 | Other 42 | 0 / 0 / 42 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 32 | 1.0 | Idle 31, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 13 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 13 | ipc 13, poll_wait 12, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 120; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `JSObject::traceChildren(JSTracer*) [libxul.so]` 8; `[unknown]` 6; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 3; `moz_arena_malloc [axiosozo-dev]` 3

**tab pid 9383** — 1 ms CPU in the window

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

**tab pid 9005** — 1 ms CPU in the window

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

**tab pid 8983** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `XRE_GetAsyncIOEventTarget() [libxul.so]` 0

