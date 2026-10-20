### chromium-control scroll (profile pass)

**parent pid 4455** — 1240 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 494 | 23.2 | Idle 288, JavaScript 85, Other 55, DOM 24 | 10 / 93 / 392 | ipc 493, poll_wait 366, gc_cc 86, paint_layout 54 |
| DOM Worker | 293 | 13.8 | JavaScript 280, Profiler 8, Other 5 | 0 / 0 / 293 | subprocess_pipe_io 293, worker_messaging 293, ipc 293, js_ctypes 259 |
| Renderer | 158 | 7.4 | Idle 87, Graphics 71, Other 0 | 0 / 0 / 158 | ipc 158, poll_wait 92, webrender_render 71, webrender_sw_raster 55 |
| SwComposite | 112 | 5.2 | Other 112 | 0 / 0 / 112 | webrender_render 112, poll_wait 99, webrender_sw_raster 11, memcpy_memset 1 |
| BackgroundThreadPool #3 | 64 | 3.0 | Idle 54, Other 10 | 0 / 0 / 64 | ipc 64, poll_wait 54, native_receiver 9, memcpy_memset 8 |
| WRRenderBackend#0 | 47 | 2.2 | Other 47 | 0 / 0 / 47 | memcpy_memset 0, webrender_render 0 |
| Compositor | 28 | 1.3 | Idle 27, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 28, webrender_render 1, canvas_2d 0 |
| Timer | 23 | 1.1 | Other 23, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23 |

Main thread, top self: `poll [libc.so.6]` 292; `[unknown]` 9; `recvmsg [libc.so.6]` 6; `[axiosozo-dev]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 5; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 5; `[linux-vdso.so.1]` 4; `getcontext [libc.so.6]` 4

**tab pid 4636** — 1 ms CPU in the window

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

**tab pid 4610** — 1 ms CPU in the window

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

**tab pid 4891** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0

