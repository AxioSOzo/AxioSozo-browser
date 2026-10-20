### webkit raf-nosampler (profile pass)

**parent pid 7188** — 717 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 216 | 7.2 | JavaScript 205, Profiler 9, Other 3 | 0 / 0 / 216 | subprocess_pipe_io 216, worker_messaging 216, ipc 216, js_ctypes 194 |
| GeckoMain | 210 | 6.9 | Idle 105, JavaScript 46, GC / CC 30, Other 19 | 6 / 45 / 159 | ipc 210, poll_wait 116, gc_cc 79, engine_stream_read 40 |
| Renderer | 77 | 2.6 | Idle 60, Graphics 17 | 0 / 0 / 77 | ipc 77, poll_wait 64, webrender_render 17, webrender_sw_raster 13 |
| BackgroundThreadPool #2 | 76 | 2.5 | Idle 62, Other 14, Graphics 0 | 0 / 0 / 76 | ipc 76, poll_wait 62, native_receiver 13, memcpy_memset 13 |
| SwComposite | 40 | 1.3 | Other 40 | 0 / 0 / 40 | webrender_render 40, poll_wait 38, memcpy_memset 1, webrender_sw_raster 1 |
| WRRenderBackend#0 | 38 | 1.3 | Other 38 | 0 / 0 / 38 | webrender_render 0, poll_wait 0 |
| Compositor | 34 | 1.1 | Idle 33, Other 1, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 32, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 14 | 0.5 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 14 | ipc 14, poll_wait 13, image_container 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::jit::BaselineCacheIRCompiler::compile() [libxul.so]` 3; `syscall [libc.so.6]` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `__lll_lock_wait [libc.so.6]` 2

**tab pid 7339** — 1 ms CPU in the window

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

**tab pid 7599** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7380** — 1 ms CPU in the window

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

