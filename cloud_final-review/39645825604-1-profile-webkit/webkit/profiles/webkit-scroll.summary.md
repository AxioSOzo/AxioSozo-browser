### webkit scroll (profile pass)

**parent pid 7154** — 549 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 293 | 14.4 | Idle 171, JavaScript 68, Other 31, DOM 11 | 9 / 69 / 216 | ipc 292, poll_wait 202, gc_cc 65, engine_stream_read 42 |
| DOM Worker | 123 | 6.1 | JavaScript 114, Profiler 9, Other 0 | 0 / 0 / 123 | subprocess_pipe_io 123, worker_messaging 123, ipc 123, js_ctypes 108 |
| Renderer | 31 | 1.5 | Idle 27, Graphics 4, Other 0 | 0 / 0 / 31 | ipc 31, poll_wait 28, webrender_render 4, canvas_2d 2 |
| BackgroundThreadPool #3 | 26 | 1.3 | Idle 23, Other 2, Graphics 0 | 0 / 0 / 26 | ipc 26, poll_wait 23, native_receiver 3, memcpy_memset 2 |
| WRRenderBackend#0 | 24 | 1.2 | Other 24 | 0 / 0 / 24 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 16 | 0.8 | Idle 15, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, webrender_render 0, canvas_2d 0 |
| SwComposite | 14 | 0.7 | Other 14 | 0 / 0 / 14 | webrender_render 14, poll_wait 14, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 11 | 0.6 | Other 11, Profiler 0 | 0 / 0 / 11 | ipc 11, poll_wait 11 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 184; `[unknown]` 9; `[axiosozo-dev]` 5; `mprotect [libc.so.6]` 4; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `g_list_remove_link [libglib-2.0.so.0]` 2; `js::NewDenseFullyAllocatedArray(JSContext*, unsigned int, js::NewObjec` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 7341** — 1 ms CPU in the window

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

**tab pid 7300** — 1 ms CPU in the window

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

**tab pid 7322** — 0 ms CPU in the window

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

