### webkit-2x raf-nosampler (profile pass)

**parent pid 8803** — 974 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 225 | 7.4 | Idle 114, GC / CC 41, JavaScript 40, Other 18 | 7 / 40 / 178 | ipc 224, poll_wait 126, gc_cc 96, engine_stream_read 38 |
| DOM Worker | 209 | 6.9 | JavaScript 198, Other 6, Profiler 5 | 0 / 0 / 209 | subprocess_pipe_io 209, worker_messaging 209, ipc 209, js_ctypes 190 |
| Renderer | 194 | 6.4 | Idle 108, Graphics 83, Other 3 | 0 / 0 / 194 | ipc 194, poll_wait 129, webrender_render 85, webrender_sw_raster 79 |
| BackgroundThreadPool #1 | 125 | 4.1 | Idle 86, Other 38, Graphics 2 | 0 / 0 / 125 | ipc 125, poll_wait 86, native_receiver 39, memcpy_memset 35 |
| SwComposite | 123 | 4.1 | Other 123 | 0 / 0 / 123 | webrender_render 123, poll_wait 98, webrender_sw_raster 25, memcpy_memset 17 |
| WRRenderBackend#0 | 44 | 1.5 | Other 44 | 0 / 0 / 44 | webrender_render 1, array_buffer_copy 0 |
| Compositor | 33 | 1.1 | Idle 32, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 13 | 0.4 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 13 | ipc 13, poll_wait 13, image_container 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 127; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `[unknown]` 9; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [libxul.` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `mprotect [libc.so.6]` 3; `[axiosozo-dev]` 3

**tab pid 8945** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 8967** — 1 ms CPU in the window

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

**tab pid 8986** — 1 ms CPU in the window

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

