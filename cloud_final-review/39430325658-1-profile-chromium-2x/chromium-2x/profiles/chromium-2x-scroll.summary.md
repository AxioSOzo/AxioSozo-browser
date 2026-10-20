### chromium-2x scroll (profile pass)

**parent pid 3348** — 1211 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 533 | 25.3 | Idle 280, JavaScript 110, Other 67, DOM 30 | 11 / 127 / 396 | ipc 533, poll_wait 368, gc_cc 115, paint_layout 67 |
| DOM Worker | 283 | 13.4 | JavaScript 274, Profiler 5, Other 3 | 0 / 0 / 283 | subprocess_pipe_io 283, worker_messaging 283, ipc 283, js_ctypes 258 |
| BackgroundThreadPool #2 | 135 | 6.4 | Idle 93, Other 41, Graphics 1, Profiler 1 | 0 / 0 / 135 | ipc 135, poll_wait 92, native_receiver 42, memcpy_memset 40 |
| Renderer | 95 | 4.5 | Idle 64, Graphics 30, Other 1 | 0 / 0 / 95 | ipc 95, poll_wait 72, webrender_render 31, webrender_sw_raster 22 |
| SwComposite | 60 | 2.9 | Other 60 | 0 / 0 / 60 | webrender_render 60, poll_wait 57, webrender_sw_raster 3, memcpy_memset 2 |
| WRRenderBackend#0 | 35 | 1.6 | Other 35 | 0 / 0 / 35 | webrender_render 1, memcpy_memset 0, poll_wait 0 |
| Compositor | 28 | 1.3 | Idle 27, Other 1, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, webrender_render 0, canvas_2d 0 |
| Timer | 22 | 1.1 | Other 22, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 22 |

Main thread, top self: `poll [libc.so.6]` 284; `[unknown]` 17; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 10; `[axiosozo-dev]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 6; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 5; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 4

**tab pid 4035** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0

**tab pid 4217** — 1 ms CPU in the window

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

**tab pid 3547** — 1 ms CPU in the window

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

