### chromium raf-nosampler (profile pass)

**parent pid 3461** — 774 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 329 | 10.7 | JavaScript 278, Other 25, GC / CC 22, Profiler 4 | 0 / 0 / 329 | subprocess_pipe_io 329, worker_messaging 329, ipc 329, js_ctypes 264 |
| GeckoMain | 193 | 6.3 | Idle 106, JavaScript 58, Other 12, DOM 12 | 6 / 62 / 125 | ipc 193, poll_wait 116, gc_cc 66, engine_stream_read 42 |
| Renderer | 72 | 2.4 | Idle 57, Graphics 14, Other 1 | 0 / 0 / 72 | ipc 72, poll_wait 59, webrender_render 15, webrender_sw_raster 11 |
| WRRenderBackend#0 | 42 | 1.4 | Other 42 | 0 / 0 / 42 | webrender_render 1, poll_wait 0, gc_cc 0, memcpy_memset 0 |
| SwComposite | 39 | 1.3 | Other 39 | 0 / 0 / 39 | webrender_render 39, poll_wait 37, memcpy_memset 2, webrender_sw_raster 2 |
| Compositor | 37 | 1.2 | Idle 37, Other 1, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 37, webrender_render 0, canvas_2d 0 |
| BackgroundThreadPool #3 | 34 | 1.1 | Idle 31, Other 1, Graphics 1, Profiler 1 | 0 / 0 / 34 | ipc 34, poll_wait 32, native_receiver 3, image_container 2 |
| ImageBridgeChld | 16 | 0.5 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 107; `[unknown]` 8; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `write [libc.so.6]` 3; `recvmsg [libc.so.6]` 3; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 2; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 2

**tab pid 3640** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4331** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4336** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

