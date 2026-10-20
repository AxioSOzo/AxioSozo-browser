### webkit-2x scroll (profile pass)

**parent pid 8838** — 1197 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 439 | 21.2 | Idle 264, JavaScript 74, Other 55, DOM 24 | 8 / 89 / 342 | ipc 435, poll_wait 311, gc_cc 82, engine_stream_read 50 |
| DOM Worker | 277 | 13.4 | JavaScript 206, Other 31, GC / CC 27, Profiler 14 | 0 / 0 / 277 | subprocess_pipe_io 277, worker_messaging 276, ipc 276, js_ctypes 189 |
| BackgroundThreadPool #2 | 214 | 10.3 | Other 109, Idle 98, Graphics 7, Profiler 1 | 0 / 0 / 214 | ipc 213, native_receiver 115, memcpy_memset 108, poll_wait 104 |
| Renderer | 121 | 5.8 | Idle 73, Graphics 48, Other 0 | 0 / 0 / 121 | ipc 121, poll_wait 86, webrender_render 48, webrender_sw_raster 38 |
| SwComposite | 67 | 3.2 | Other 67 | 0 / 0 / 67 | webrender_render 67, poll_wait 60, webrender_sw_raster 6, memcpy_memset 5 |
| WRRenderBackend#0 | 29 | 1.4 | Other 29 | 0 / 0 / 29 | webrender_scene 0, webrender_render 0 |
| Compositor | 20 | 1.0 | Idle 20, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 20 | ipc 20, poll_wait 20, webrender_render 0, image_container 0 |
| Timer | 16 | 0.8 | Other 16 | 0 / 0 / 16 | ipc 16, poll_wait 16 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 292; `[unknown]` 8; `[axiosozo-dev]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[linux-vdso.so.1]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 4; `__lll_lock_wake [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4

**tab pid 9005** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) [libxul.so]` 0

**tab pid 9383** — 1 ms CPU in the window

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

**tab pid 9024** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

