### webkit scroll (profile pass)

**parent pid 7188** — 1114 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 518 | 25.0 | Idle 287, JavaScript 85, Other 60, GC / CC 29 | 9 / 98 / 411 | ipc 515, poll_wait 355, gc_cc 104, engine_stream_read 57 |
| DOM Worker | 237 | 11.4 | JavaScript 225, Profiler 7, Other 4 | 0 / 0 / 237 | subprocess_pipe_io 237, worker_messaging 237, ipc 237, js_ctypes 201 |
| Renderer | 130 | 6.3 | Idle 84, Graphics 45, Other 1 | 0 / 0 / 130 | ipc 130, poll_wait 88, webrender_render 45, webrender_sw_raster 33 |
| SwComposite | 85 | 4.1 | Other 85 | 0 / 0 / 85 | webrender_render 85, poll_wait 74, webrender_sw_raster 11, memcpy_memset 2 |
| BackgroundThreadPool #3 | 46 | 2.2 | Idle 43, Other 3 | 0 / 0 / 46 | ipc 46, poll_wait 42, native_receiver 3, memcpy_memset 3 |
| WRRenderBackend#0 | 35 | 1.7 | Other 35 | 0 / 0 / 35 | webrender_render 1 |
| Compositor | 24 | 1.1 | Idle 23, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 24 | ipc 24, poll_wait 23, memcpy_memset 0, webrender_render 0 |
| Timer | 21 | 1.0 | Other 21 | 0 / 0 / 21 | ipc 21, poll_wait 21, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 313; `[unknown]` 19; `[axiosozo-dev]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `mprotect [libc.so.6]` 4; `[linux-vdso.so.1]` 3; `[libgobject-2.0.so.0]` 3

**tab pid 7718** — 1 ms CPU in the window

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

**tab pid 7328** — 1 ms CPU in the window

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

**tab pid 7369** — 1 ms CPU in the window

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

