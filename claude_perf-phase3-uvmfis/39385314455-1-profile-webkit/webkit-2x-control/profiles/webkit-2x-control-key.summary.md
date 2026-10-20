### webkit-2x-control key (profile pass)

**parent pid 10383** — 1013 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 453 | 12.4 | Idle 231, JavaScript 85, Other 43, Layout 30 | 12 / 131 / 311 | ipc 453, poll_wait 269, gc_cc 81, paint_layout 72 |
| DOM Worker | 192 | 5.3 | JavaScript 186, Other 3, Profiler 3 | 0 / 0 / 192 | subprocess_pipe_io 192, worker_messaging 192, ipc 192, js_ctypes 180 |
| Renderer | 133 | 3.7 | Graphics 95, Idle 37, Other 1 | 0 / 0 / 133 | ipc 133, webrender_render 96, webrender_sw_raster 88, poll_wait 38 |
| SwComposite | 122 | 3.3 | Other 122 | 0 / 0 / 122 | webrender_render 122, webrender_sw_raster 83, poll_wait 38, memcpy_memset 23 |
| Timer | 29 | 0.8 | Other 29, Profiler 0 | 0 / 0 / 29 | ipc 29, poll_wait 28, memcpy_memset 0 |
| BackgroundThreadPool #5 | 25 | 0.7 | Other 17, Idle 8 | 0 / 0 / 25 | ipc 25, native_receiver 16, memcpy_memset 16, poll_wait 8 |
| WRRenderBackend#0 | 17 | 0.5 | Other 17 | 0 / 0 / 17 | webrender_render 0 |
| Compositor | 16 | 0.4 | Idle 16, Other 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, canvas_2d 0, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 240; `[unknown]` 18; `[axiosozo-dev]` 6; `mprotect [libc.so.6]` 5; `DescendIntoChild(mozilla::nsDisplayListBuilder*, nsIFrame const*, nsRe` 4; `__memset_evex_unaligned_erms [libc.so.6]` 4; `[libgobject-2.0.so.0]` 3; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozilla::LayoutF` 3

**tab pid 10474** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0, Other 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `PerformPromiseThenWithReaction(JSContext*, JS::Handle<js::PromiseObjec` 0; `[unknown]` 0; `mozilla::ipc::MessageChannel::RunMessage(mozilla::ipc::ActorLifecycleP` 0; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul.so]` 0

**tab pid 10566** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 0

**tab pid 10524** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

