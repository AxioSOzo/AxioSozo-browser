### webkit scroll (profile pass)

**parent pid 7154** — 1047 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 551 | 26.0 | Idle 282, JavaScript 106, Other 64, DOM 38 | 12 / 126 / 413 | ipc 548, poll_wait 360, gc_cc 117, engine_stream_read 64 |
| DOM Worker | 258 | 12.2 | JavaScript 246, Profiler 11, Other 1 | 0 / 0 / 258 | subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 219 |
| BackgroundThreadPool #3 | 59 | 2.8 | Idle 51, Other 7, Graphics 1 | 0 / 0 / 59 | ipc 59, poll_wait 52, native_receiver 8, memcpy_memset 7 |
| Renderer | 55 | 2.6 | Idle 40, Graphics 15, Profiler 0, Other 0 | 0 / 0 / 55 | ipc 55, poll_wait 46, webrender_render 16, webrender_sw_raster 10 |
| WRRenderBackend#0 | 34 | 1.6 | Other 34 | 0 / 0 / 34 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| Compositor | 27 | 1.3 | Idle 26, Other 0, Graphics 0 | 0 / 0 / 27 | ipc 27, poll_wait 26, webrender_render 0, image_container 0 |
| SwComposite | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_render 23, poll_wait 23, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 21 | 1.0 | Other 21, Profiler 0 | 0 / 0 / 21 | ipc 21, poll_wait 20 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 314; `[unknown]` 17; `__lll_lock_wait [libc.so.6]` 6; `[axiosozo-dev]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `__lll_lock_wake [libc.so.6]` 4

**tab pid 7291** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0

**tab pid 7332** — 1 ms CPU in the window

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

**tab pid 7698** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `IPC::AddIPCProfilerMarker(IPC::Message const&, int, mozilla::ipc::Mess` 0

