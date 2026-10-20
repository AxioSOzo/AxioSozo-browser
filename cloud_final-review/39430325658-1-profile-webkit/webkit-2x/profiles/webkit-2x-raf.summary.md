### webkit-2x raf (profile pass)

**parent pid 8823** — 1262 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 490 | 15.3 | Idle 329, JavaScript 93, Other 34, DOM 27 | 15 / 101 / 374 | ipc 489, poll_wait 354, gc_cc 80, engine_stream_read 57 |
| DOM Worker | 248 | 7.8 | JavaScript 232, Profiler 9, Other 7 | 0 / 0 / 248 | subprocess_pipe_io 248, worker_messaging 248, ipc 248, js_ctypes 220 |
| Renderer | 179 | 5.6 | Idle 114, Graphics 65, Profiler 1 | 0 / 0 / 179 | ipc 179, poll_wait 131, webrender_render 66, webrender_sw_raster 53 |
| SwComposite | 99 | 3.1 | Other 99 | 0 / 0 / 99 | webrender_render 99, poll_wait 92, memcpy_memset 7, webrender_sw_raster 7 |
| BackgroundThreadPool #3 | 90 | 2.8 | Idle 73, Other 13, Graphics 4, Profiler 0 | 0 / 0 / 90 | ipc 89, poll_wait 74, native_receiver 16, memcpy_memset 10 |
| WRRenderBackend#0 | 55 | 1.7 | Other 55 | 0 / 0 / 55 | webrender_scene 0, array_buffer_copy 0, webrender_render 0 |
| Compositor | 43 | 1.3 | Idle 42, Other 1, Profiler 0 | 0 / 0 / 43 | ipc 43, poll_wait 42, canvas_2d 0, webrender_render 0 |
| Timer | 29 | 0.9 | Other 29 | 0 / 0 / 29 | ipc 29, poll_wait 29 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 347; `[unknown]` 14; `[axiosozo-dev]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 7; `__lll_lock_wake [libc.so.6]` 3; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 9523** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 8984** — 1 ms CPU in the window

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

**tab pid 9529** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::ipc::MessageChannel::Send(std::unique_ptr<IPC::Message, std::` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `g_source_ref [libglib-2.0.so.0]` 0

