### chromium raf-nosampler (profile pass)

**parent pid 3133** — 608 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 186 | 6.1 | JavaScript 133, GC / CC 27, Other 23, Profiler 3 | 0 / 0 / 186 | subprocess_pipe_io 186, worker_messaging 185, ipc 185, js_ctypes 128 |
| GeckoMain | 178 | 5.9 | Idle 99, JavaScript 37, Other 17, DOM 15 | 6 / 51 / 122 | ipc 178, poll_wait 105, gc_cc 51, worker_messaging 26 |
| Socket Thread | 59 | 1.9 | Other 59 | 0 / 0 / 59 | ipc 59, poll_wait 34, memcpy_memset 0 |
| Renderer | 46 | 1.5 | Idle 41, Graphics 5 | 0 / 0 / 46 | ipc 46, poll_wait 42, webrender_render 5, webrender_sw_raster 3 |
| WRRenderBackend#0 | 36 | 1.2 | Other 36 | 0 / 0 / 36 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 26 | 0.9 | Idle 25, Other 1, Graphics 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, webrender_render 0, canvas_2d 0 |
| BackgroundThreadPool #2 | 26 | 0.9 | Idle 25, Other 1, Graphics 0 | 0 / 0 / 26 | ipc 26, poll_wait 25, native_receiver 1, memcpy_memset 1 |
| SwComposite | 20 | 0.6 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 19, memcpy_memset 1, webrender_sw_raster 1 |

Main thread, top self: `poll [libc.so.6]` 99; `__memset_avx512_unaligned_erms [libc.so.6]` 6; `[unknown]` 6; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 4; `recvmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `mprotect [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2

**tab pid 3317** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3299** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3993** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

