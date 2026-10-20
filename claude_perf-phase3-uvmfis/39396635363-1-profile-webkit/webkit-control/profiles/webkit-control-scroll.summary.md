### webkit-control scroll (profile pass)

**parent pid 9829** — 1136 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 510 | 25.1 | Idle 261, JavaScript 88, GC / CC 67, Other 60 | 9 / 91 / 410 | ipc 509, poll_wait 310, gc_cc 139, engine_stream_read 44 |
| DOM Worker | 223 | 11.0 | JavaScript 211, Profiler 7, Other 5 | 0 / 0 / 223 | subprocess_pipe_io 223, worker_messaging 222, ipc 222, js_ctypes 197 |
| Renderer | 139 | 6.8 | Idle 92, Graphics 46, Profiler 2 | 0 / 0 / 139 | ipc 139, poll_wait 95, webrender_render 48, webrender_sw_raster 42 |
| SwComposite | 106 | 5.2 | Other 106 | 0 / 0 / 106 | webrender_render 106, poll_wait 92, webrender_sw_raster 14, memcpy_memset 1 |
| BackgroundThreadPool #2 | 66 | 3.3 | Idle 53, Other 13, Graphics 1 | 0 / 0 / 66 | ipc 66, poll_wait 53, native_receiver 13, memcpy_memset 11 |
| WRRenderBackend#0 | 32 | 1.6 | Other 32 | 0 / 0 / 32 | webrender_render 1, poll_wait 0, memcpy_memset 0, array_buffer_copy 0 |
| Compositor | 21 | 1.0 | Idle 20, Other 0 | 0 / 0 / 21 | ipc 21, poll_wait 20, canvas_2d 0, webrender_render 0 |
| Timer | 17 | 0.8 | Other 17, Profiler 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 281; `[unknown]` 23; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 21; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 3

**tab pid 9971** — 1 ms CPU in the window

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

**tab pid 10376** — 1 ms CPU in the window

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

**tab pid 9993** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

