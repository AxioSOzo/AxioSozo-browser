### webkit raf (profile pass)

**parent pid 7188** — 843 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 375 | 12.3 | Idle 259, JavaScript 55, Other 37, DOM 16 | 6 / 62 / 308 | ipc 373, poll_wait 280, gc_cc 51, engine_stream_read 34 |
| DOM Worker | 219 | 7.2 | JavaScript 213, Other 4, Profiler 3 | 0 / 0 / 219 | subprocess_pipe_io 219, worker_messaging 218, ipc 218, js_ctypes 200 |
| Renderer | 68 | 2.2 | Idle 57, Graphics 10, Other 0 | 0 / 0 / 68 | ipc 68, poll_wait 60, webrender_render 10, webrender_sw_raster 7 |
| SwComposite | 35 | 1.1 | Other 35 | 0 / 0 / 35 | webrender_render 35, poll_wait 32, memcpy_memset 2, webrender_sw_raster 2 |
| WRRenderBackend#0 | 34 | 1.1 | Other 34 | 0 / 0 / 34 | webrender_render 1, webrender_scene 0, array_buffer_copy 0 |
| Compositor | 33 | 1.1 | Idle 32, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, webrender_render 0, image_container 0 |
| BackgroundThreadPool #3 | 31 | 1.0 | Idle 28, Other 2, Graphics 0 | 0 / 0 / 31 | ipc 30, poll_wait 28, native_receiver 2, image_container 1 |
| Timer | 25 | 0.8 | Other 25, Profiler 0 | 0 / 0 / 25 | ipc 25, poll_wait 25 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 281; `[unknown]` 14; `[axiosozo-dev]` 3; `__lll_lock_wait [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `[linux-vdso.so.1]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2

**tab pid 7738** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0

**tab pid 7384** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 7357** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 0

