### chromium raf-nosampler (profile pass)

**parent pid 3299** — 455 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 142 | 4.7 | Idle 95, JavaScript 32, Other 9, DOM 6 | 5 / 33 / 105 | ipc 142, poll_wait 100, gc_cc 40, worker_messaging 21 |
| DOM Worker | 136 | 4.5 | JavaScript 130, Other 4, Profiler 2 | 0 / 0 / 136 | subprocess_pipe_io 136, worker_messaging 136, ipc 136, js_ctypes 127 |
| Renderer | 48 | 1.6 | Idle 40, Graphics 7, Profiler 0, Other 0 | 0 / 0 / 48 | ipc 48, poll_wait 41, webrender_render 7, webrender_sw_raster 4 |
| WRRenderBackend#0 | 38 | 1.3 | Other 38 | 0 / 0 / 38 | webrender_render 0, poll_wait 0 |
| Compositor | 26 | 0.9 | Idle 26, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, webrender_render 0, canvas_2d 0 |
| BackgroundThreadPool #2 | 25 | 0.8 | Idle 25, Other 0 | 0 / 0 / 25 | ipc 25, poll_wait 25, native_receiver 0, memcpy_memset 0 |
| SwComposite | 20 | 0.6 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 19, memcpy_memset 0, webrender_sw_raster 0 |
| ImageBridgeChld | 11 | 0.4 | Idle 11, Other 0, Profiler 0 | 0 / 0 / 11 | ipc 11, poll_wait 11, image_container 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 96; `[unknown]` 8; `recvmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `js::jit::UnaryArithIRGenerator::UnaryArithIRGenerator(JSContext*, JS::` 1; `ptrToUint8Array (resource://gre/modules/subprocess/subprocess_unix.sys` 1; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1; `mprotect [libc.so.6]` 1

**tab pid 3973** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 3, GC / CC 1 | 0 / 0 / 3 | ipc 3, poll_wait 3, gc_cc 1, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mmap64 [libc.so.6]` 0; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 0

**tab pid 4163** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3483** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

