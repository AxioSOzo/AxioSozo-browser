### webkit raf-nosampler (profile pass)

**parent pid 7154** — 720 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 235 | 7.7 | JavaScript 231, Profiler 4, Other 0 | 0 / 0 / 235 | subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 221 |
| GeckoMain | 208 | 6.8 | Idle 116, JavaScript 56, Other 25, DOM 10 | 9 / 55 / 145 | ipc 207, poll_wait 130, gc_cc 67, engine_stream_read 47 |
| Renderer | 79 | 2.6 | Idle 61, Graphics 17, Profiler 1, Other 1 | 0 / 0 / 79 | ipc 79, poll_wait 65, webrender_render 18, webrender_sw_raster 12 |
| WRRenderBackend#0 | 46 | 1.5 | Other 46 | 0 / 0 / 46 | webrender_render 0, memcpy_memset 0 |
| Compositor | 38 | 1.3 | Idle 37, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 38 | ipc 38, poll_wait 37, webrender_render 0, canvas_2d 0 |
| SwComposite | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 37, poll_wait 35, memcpy_memset 2, webrender_sw_raster 2 |
| BackgroundThreadPool #3 | 34 | 1.1 | Idle 32, Other 2, Graphics 1, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 32, native_receiver 2, memcpy_memset 2 |
| ImageBridgeChld | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | ipc 16, poll_wait 16, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 127; `[unknown]` 10; `[axiosozo-dev]` 3; `next (self-hosted:392:27)[28]` 3; `mprotect [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `void js::NativeObject::setFixedSlot<true>(unsigned int, JS::Value cons` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1

**tab pid 7324** — 1 ms CPU in the window

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

**tab pid 7700** — 1 ms CPU in the window

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

**tab pid 7351** — 1 ms CPU in the window

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

