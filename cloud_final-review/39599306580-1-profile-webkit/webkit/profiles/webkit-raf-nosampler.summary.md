### webkit raf-nosampler (profile pass)

**parent pid 7154** — 758 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 260 | 8.5 | JavaScript 252, Other 6, Profiler 2 | 0 / 0 / 260 | subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 239 |
| GeckoMain | 211 | 6.9 | Idle 107, JavaScript 62, Other 19, DOM 15 | 6 / 72 / 133 | ipc 210, poll_wait 115, gc_cc 77, engine_stream_read 57 |
| Renderer | 83 | 2.7 | Idle 65, Graphics 18, Other 0 | 0 / 0 / 83 | ipc 83, poll_wait 69, webrender_render 18, webrender_sw_raster 12 |
| WRRenderBackend#0 | 48 | 1.6 | Other 48 | 0 / 0 / 48 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| SwComposite | 41 | 1.4 | Other 41 | 0 / 0 / 41 | webrender_render 41, poll_wait 39, webrender_sw_raster 2, memcpy_memset 2 |
| Compositor | 41 | 1.3 | Idle 40, Other 1, Graphics 0 | 0 / 0 / 41 | ipc 41, poll_wait 40, webrender_render 1, canvas_2d 0 |
| BackgroundThreadPool #3 | 34 | 1.1 | Idle 30, Other 4, Graphics 1, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 31, native_receiver 4, memcpy_memset 3 |
| ImageBridgeChld | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 14; `[axiosozo-dev]` 4; `mprotect [libc.so.6]` 2; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.so]` 1; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*>, JS::Han` 1

**tab pid 7313** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 7332** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, paint_layout 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsRefreshDriver::GetIdleDeadlineHint(mozilla::TimeStamp, nsRefreshDriv` 0

**tab pid 7291** — 1 ms CPU in the window

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

