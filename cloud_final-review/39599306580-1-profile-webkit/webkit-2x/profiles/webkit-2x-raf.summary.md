### webkit-2x raf (profile pass)

**parent pid 8784** — 1247 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 485 | 15.2 | Idle 332, JavaScript 87, Other 33, DOM 27 | 11 / 97 / 376 | ipc 484, poll_wait 353, gc_cc 76, engine_stream_read 58 |
| DOM Worker | 250 | 7.8 | JavaScript 241, Other 6, Profiler 4 | 0 / 0 / 250 | subprocess_pipe_io 250, worker_messaging 249, ipc 249, js_ctypes 227 |
| Renderer | 171 | 5.3 | Idle 115, Graphics 55, Other 0 | 0 / 0 / 171 | ipc 171, poll_wait 133, webrender_render 55, webrender_sw_raster 45 |
| BackgroundThreadPool #3 | 96 | 3.0 | Idle 81, Other 13, Graphics 2 | 0 / 0 / 96 | ipc 96, poll_wait 82, native_receiver 14, memcpy_memset 13 |
| SwComposite | 91 | 2.9 | Other 91 | 0 / 0 / 91 | webrender_render 91, poll_wait 79, webrender_sw_raster 11, memcpy_memset 7 |
| WRRenderBackend#0 | 54 | 1.7 | Other 54 | 0 / 0 / 54 | poll_wait 0, webrender_scene 0 |
| Compositor | 42 | 1.3 | Idle 41, Other 1, Graphics 0 | 0 / 0 / 42 | ipc 42, poll_wait 41, webrender_render 1, canvas_2d 0 |
| Timer | 29 | 0.9 | Other 29, Profiler 0 | 0 / 0 / 29 | ipc 29, poll_wait 29, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 349; `[unknown]` 17; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 8; `__lll_lock_wake [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 3; `js::jit::CacheIRWriter::guardNonDoubleType(js::jit::ValOperandId, JS::` 3; `js::FindIntrinsicSpec(js::PropertyName*) [libxul.so]` 3

**tab pid 9485** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9491** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0

**tab pid 8961** — 1 ms CPU in the window

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

