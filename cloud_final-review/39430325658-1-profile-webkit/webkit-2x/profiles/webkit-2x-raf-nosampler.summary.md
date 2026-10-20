### webkit-2x raf-nosampler (profile pass)

**parent pid 8823** — 942 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 242 | 7.9 | JavaScript 235, Other 4, Profiler 4 | 0 / 0 / 242 | subprocess_pipe_io 242, worker_messaging 242, ipc 242, js_ctypes 225 |
| GeckoMain | 216 | 7.1 | Idle 136, JavaScript 52, Other 16, DOM 11 | 8 / 51 / 157 | ipc 213, poll_wait 142, gc_cc 66, engine_stream_read 45 |
| Renderer | 175 | 5.7 | Idle 113, Graphics 63, Other 0 | 0 / 0 / 175 | ipc 175, poll_wait 125, webrender_render 63, webrender_sw_raster 53 |
| SwComposite | 100 | 3.3 | Other 100 | 0 / 0 / 100 | webrender_render 99, poll_wait 85, webrender_sw_raster 13, memcpy_memset 12 |
| BackgroundThreadPool #3 | 85 | 2.8 | Idle 68, Other 15, Graphics 1 | 0 / 0 / 85 | ipc 85, poll_wait 69, native_receiver 16, memcpy_memset 14 |
| WRRenderBackend#0 | 53 | 1.7 | Other 53 | 0 / 0 / 53 | memcpy_memset 0, webrender_render 0, webrender_scene 0, array_buffer_copy 0 |
| Compositor | 42 | 1.4 | Idle 40, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 42 | ipc 42, poll_wait 39, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 18 | 0.6 | Idle 17, Other 0 | 0 / 0 / 18 | ipc 18, poll_wait 17, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 141; `[unknown]` 10; `[linux-vdso.so.1]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `mprotect [libc.so.6]` 1; `apply (chrome://browser/content/axiosozo/EngineFrameSurface.sys.mjs:46` 1

**tab pid 8962** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

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

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9387** — 1 ms CPU in the window

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

