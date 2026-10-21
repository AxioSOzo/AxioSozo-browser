### webkit-2x raf-nosampler (profile pass)

**parent pid 8784** — 956 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 248 | 8.1 | JavaScript 241, Profiler 6, Other 2 | 0 / 0 / 248 | subprocess_pipe_io 248, worker_messaging 248, ipc 248, js_ctypes 228 |
| GeckoMain | 221 | 7.2 | Idle 125, JavaScript 54, Other 19, DOM 18 | 5 / 64 / 151 | ipc 220, poll_wait 137, gc_cc 77, engine_stream_read 55 |
| Renderer | 168 | 5.5 | Idle 100, Graphics 68, Other 0, Profiler 0 | 0 / 0 / 168 | ipc 168, poll_wait 120, webrender_render 68, webrender_sw_raster 60 |
| SwComposite | 102 | 3.3 | Other 102 | 0 / 0 / 102 | webrender_render 102, poll_wait 91, webrender_sw_raster 11, memcpy_memset 8 |
| BackgroundThreadPool #3 | 93 | 3.0 | Idle 74, Other 16, Graphics 2 | 0 / 0 / 93 | ipc 92, poll_wait 74, native_receiver 18, memcpy_memset 14 |
| WRRenderBackend#0 | 52 | 1.7 | Other 52 | 0 / 0 / 52 | webrender_render 1, poll_wait 0, array_buffer_copy 0 |
| Compositor | 43 | 1.4 | Idle 42, Other 1, Graphics 0 | 0 / 0 / 43 | ipc 43, poll_wait 42, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 18 | 0.6 | Idle 18, Other 0, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 18, image_container 0, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2; `[axiosozo-dev]` 2; `__lll_lock_wait [libc.so.6]` 1; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAllocPolicy<(` 1

**tab pid 9350** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 9485** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8920** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

