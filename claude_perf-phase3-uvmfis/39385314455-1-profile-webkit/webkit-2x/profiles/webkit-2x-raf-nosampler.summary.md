### webkit-2x raf-nosampler (profile pass)

**parent pid 8674** — 1097 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| BackgroundThreadPool #3 | 258 | 8.5 | Other 147, Idle 107, Graphics 3, Profiler 1 | 0 / 0 / 258 | ipc 258, native_receiver 149, memcpy_memset 143, poll_wait 110 |
| DOM Worker | 233 | 7.7 | JavaScript 227, Profiler 5, Other 1 | 0 / 0 / 233 | subprocess_pipe_io 233, worker_messaging 233, ipc 233, js_ctypes 218 |
| GeckoMain | 198 | 6.6 | Idle 121, JavaScript 42, Other 17, DOM 15 | 6 / 49 / 144 | ipc 198, poll_wait 131, gc_cc 55, engine_stream_read 43 |
| Renderer | 185 | 6.1 | Idle 110, Graphics 74, Other 1 | 0 / 0 / 185 | ipc 185, poll_wait 127, webrender_render 75, webrender_sw_raster 70 |
| SwComposite | 114 | 3.8 | Other 114 | 0 / 0 / 114 | webrender_render 114, poll_wait 95, webrender_sw_raster 17, memcpy_memset 16 |
| WRRenderBackend#0 | 48 | 1.6 | Other 48 | 0 / 0 / 48 | webrender_render 1, memcpy_memset 0, poll_wait 0 |
| Compositor | 36 | 1.2 | Idle 34, Other 1, Graphics 0 | 0 / 0 / 36 | ipc 36, poll_wait 35, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 14 | 0.5 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 14 | ipc 14, poll_wait 14, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 130; `[unknown]` 9; `mozilla::net::nsStandardURL::BuildNormalizedSpec(char const*, mozilla:` 3; `[axiosozo-dev]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `[libX11.so.6]` 2; `js::GenericTracerImpl<js::gc::MinorSweepingTracer>::onStringEdge(JSStr` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 1

**tab pid 8875** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

**tab pid 9085** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[]` 0

**tab pid 8848** — 1 ms CPU in the window

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

