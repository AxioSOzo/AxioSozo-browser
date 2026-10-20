### webkit raf-nosampler (profile pass)

**parent pid 7188** — 709 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 246 | 8.1 | JavaScript 237, Profiler 6, Other 3 | 0 / 0 / 246 | subprocess_pipe_io 246, worker_messaging 246, ipc 246, js_ctypes 230 |
| GeckoMain | 202 | 6.6 | Idle 102, JavaScript 58, Other 23, DOM 13 | 8 / 60 / 133 | ipc 202, poll_wait 113, gc_cc 75, engine_stream_read 43 |
| Renderer | 74 | 2.4 | Idle 59, Graphics 15, Profiler 0, Other 0 | 0 / 0 / 74 | ipc 73, poll_wait 60, webrender_render 15, webrender_sw_raster 11 |
| WRRenderBackend#0 | 42 | 1.4 | Other 42 | 0 / 0 / 42 | poll_wait 0, webrender_render 0, array_buffer_copy 0 |
| SwComposite | 38 | 1.2 | Other 38 | 0 / 0 / 38 | webrender_render 38, poll_wait 36, memcpy_memset 2, webrender_sw_raster 2 |
| Compositor | 35 | 1.2 | Idle 34, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 35, webrender_render 0, canvas_2d 0 |
| BackgroundThreadPool #3 | 32 | 1.1 | Idle 30, Other 2, Graphics 0 | 0 / 0 / 32 | ipc 32, poll_wait 30, native_receiver 2, memcpy_memset 2 |
| ImageBridgeChld | 15 | 0.5 | Idle 15, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 110; `[unknown]` 8; `js::BlockLexicalEnvironmentObject::create(JSContext*, JS::Handle<js::L` 7; `__lll_lock_wait [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 2; `values (self-hosted:440:22)[22]` 1; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*, js::Maybe` 1

**tab pid 7342** — 1 ms CPU in the window

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

**tab pid 7742** — 1 ms CPU in the window

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

**tab pid 7383** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

