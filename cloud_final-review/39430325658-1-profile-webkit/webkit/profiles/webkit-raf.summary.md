### webkit raf (profile pass)

**parent pid 7188** — 1046 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 475 | 15.1 | Idle 276, JavaScript 98, Other 40, GC / CC 32 | 12 / 105 / 358 | ipc 471, poll_wait 292, gc_cc 123, engine_stream_read 63 |
| DOM Worker | 267 | 8.5 | JavaScript 260, Profiler 4, Other 3 | 0 / 0 / 267 | subprocess_pipe_io 267, worker_messaging 267, ipc 267, js_ctypes 246 |
| Renderer | 84 | 2.7 | Idle 63, Graphics 20, Other 1 | 0 / 0 / 84 | ipc 84, poll_wait 65, webrender_render 20, webrender_sw_raster 14 |
| WRRenderBackend#0 | 47 | 1.5 | Other 47, Profiler 0 | 0 / 0 / 47 | webrender_render 1, poll_wait 0, array_buffer_copy 0 |
| SwComposite | 42 | 1.3 | Other 42 | 0 / 0 / 42 | webrender_render 42, poll_wait 41, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 39 | 1.2 | Idle 38, Other 1, Profiler 0 | 0 / 0 / 39 | ipc 39, poll_wait 38, webrender_render 1, canvas_2d 0 |
| BackgroundThreadPool #2 | 33 | 1.1 | Idle 30, Other 3, Graphics 1 | 0 / 0 / 33 | ipc 33, poll_wait 30, native_receiver 3, image_container 2 |
| Timer | 31 | 1.0 | Other 31 | 0 / 0 / 31 | ipc 30, poll_wait 30, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 290; `[unknown]` 23; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `[linux-vdso.so.1]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4; `__lll_lock_wake [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3

**tab pid 7739** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 3, GC / CC 2, Profiler 0 | 0 / 0 / 6 | ipc 4, poll_wait 4, gc_cc 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `__lll_lock_wake [libc.so.6]` 0; `__internal_syscall_cancel [libc.so.6]` 0; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<1u> >::onShapeEdge(js::` 0; `prctl [libc.so.6]` 0

**tab pid 7745** — 1 ms CPU in the window

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

**tab pid 7360** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

