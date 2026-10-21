### webkit scroll (profile pass)

**parent pid 7154** — 766 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 383 | 19.0 | Idle 229, JavaScript 78, Other 37, DOM 17 | 11 / 82 / 290 | ipc 382, poll_wait 263, gc_cc 74, engine_stream_read 45 |
| DOM Worker | 196 | 9.7 | JavaScript 184, Profiler 8, Other 4 | 0 / 0 / 196 | subprocess_pipe_io 196, worker_messaging 195, ipc 195, js_ctypes 169 |
| BackgroundThreadPool #2 | 62 | 3.1 | Idle 51, Other 11, Graphics 1 | 0 / 0 / 62 | ipc 62, poll_wait 51, native_receiver 11, memcpy_memset 11 |
| Renderer | 41 | 2.1 | Idle 35, Graphics 6, Other 1 | 0 / 0 / 41 | ipc 41, poll_wait 37, webrender_render 6, webrender_sw_raster 4 |
| WRRenderBackend#0 | 21 | 1.0 | Other 21 | 0 / 0 / 21 | webrender_render 1, array_buffer_copy 0, poll_wait 0, webrender_scene 0 |
| SwComposite | 18 | 0.9 | Other 18 | 0 / 0 / 18 | webrender_render 18, poll_wait 18, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 18 | 0.9 | Idle 17, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 18 | ipc 18, poll_wait 17, webrender_render 0, canvas_2d 0 |
| Timer | 15 | 0.8 | Other 15 | 0 / 0 / 15 | ipc 15, poll_wait 15, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 247; `[unknown]` 19; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 2; `push ([System Principal]:38:16)[0]` 2

**tab pid 7698** — 1 ms CPU in the window

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

**tab pid 7338** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 7297** — 0 ms CPU in the window

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

