### chromium-2x-control raf-nosampler (profile pass)

**parent pid 4435** — 2062 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 569 | 18.6 | Graphics 357, Idle 211, Other 1 | 0 / 0 / 569 | ipc 569, webrender_render 358, webrender_sw_raster 325, poll_wait 219 |
| SwComposite | 520 | 16.9 | Other 520 | 0 / 0 / 520 | webrender_render 520, webrender_sw_raster 327, poll_wait 186, memcpy_memset 91 |
| GeckoMain | 333 | 10.9 | Idle 142, GC / CC 82, JavaScript 69, Other 24 | 8 / 70 / 254 | ipc 333, poll_wait 162, gc_cc 161, engine_stream_read 44 |
| DOM Worker | 297 | 9.7 | JavaScript 289, Profiler 5, Other 4 | 0 / 0 / 297 | subprocess_pipe_io 297, worker_messaging 297, ipc 297, js_ctypes 277 |
| BackgroundThreadPool #3 | 197 | 6.4 | Idle 131, Other 65, Graphics 1 | 0 / 0 / 197 | ipc 197, poll_wait 132, native_receiver 66, memcpy_memset 62 |
| WRRenderBackend#0 | 73 | 2.4 | Other 73 | 0 / 0 / 73 | webrender_render 1, memcpy_memset 1, poll_wait 0, array_buffer_copy 0 |
| Compositor | 43 | 1.4 | Idle 42, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 43 | ipc 43, poll_wait 42, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 18 | 0.6 | Idle 17, Other 1 | 0 / 0 / 18 | ipc 18, poll_wait 17, image_container 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 144; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `[unknown]` 9; `[axiosozo-dev]` 7; `recvmsg [libc.so.6]` 7; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 6; `write [libc.so.6]` 6

**tab pid 5054** — 1 ms CPU in the window

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

**tab pid 5049** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 4627** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

