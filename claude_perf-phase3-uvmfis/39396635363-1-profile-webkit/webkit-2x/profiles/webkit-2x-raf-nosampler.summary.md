### webkit-2x raf-nosampler (profile pass)

**parent pid 8806** — 961 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 221 | 7.3 | Idle 122, GC / CC 40, JavaScript 36, DOM 14 | 7 / 41 / 172 | ipc 221, poll_wait 128, gc_cc 89, engine_stream_read 39 |
| DOM Worker | 221 | 7.3 | JavaScript 212, Other 5, Profiler 4 | 0 / 0 / 221 | subprocess_pipe_io 221, worker_messaging 221, ipc 221, js_ctypes 200 |
| Renderer | 177 | 5.9 | Idle 100, Graphics 77, Other 1, Profiler 0 | 0 / 0 / 177 | ipc 177, poll_wait 120, webrender_render 77, webrender_sw_raster 73 |
| BackgroundThreadPool #2 | 130 | 4.3 | Idle 90, Other 37, Graphics 2, Profiler 0 | 0 / 0 / 130 | ipc 130, poll_wait 91, native_receiver 39, memcpy_memset 36 |
| SwComposite | 113 | 3.7 | Other 113 | 0 / 0 / 113 | webrender_render 113, poll_wait 90, webrender_sw_raster 23, memcpy_memset 20 |
| WRRenderBackend#0 | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_render 1, poll_wait 0, webrender_scene 0 |
| Compositor | 33 | 1.1 | Idle 32, Other 1, Graphics 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 13 | 0.4 | Idle 13, Other 0 | 0 / 0 / 13 | ipc 13, poll_wait 13, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 127; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `[unknown]` 7; `mmap64 [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 3; `JS::GCThingTraceKind(void*) [libxul.so]` 2; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeBarePt` 2

**tab pid 8975** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libglib-2.0.so.0]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 8953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0

**tab pid 9363** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

