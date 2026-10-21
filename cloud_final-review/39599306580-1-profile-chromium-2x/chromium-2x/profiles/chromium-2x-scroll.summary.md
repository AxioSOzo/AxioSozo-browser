### chromium-2x scroll (profile pass)

**parent pid 3249** — 1060 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 452 | 21.6 | Idle 262, JavaScript 71, Other 45, DOM 23 | 12 / 80 / 360 | ipc 452, poll_wait 335, gc_cc 82, paint_layout 49 |
| DOM Worker | 229 | 10.9 | JavaScript 219, Profiler 9 | 0 / 0 / 229 | subprocess_pipe_io 229, worker_messaging 229, ipc 229, js_ctypes 211 |
| BackgroundThreadPool #3 | 127 | 6.1 | Idle 90, Other 37, Graphics 1 | 0 / 0 / 127 | ipc 127, poll_wait 91, native_receiver 38, memcpy_memset 36 |
| Renderer | 91 | 4.3 | Idle 54, Graphics 37, Other 0 | 0 / 0 / 91 | ipc 91, poll_wait 65, webrender_render 37, webrender_sw_raster 28 |
| SwComposite | 67 | 3.2 | Other 67 | 0 / 0 / 67 | webrender_render 67, poll_wait 67, memcpy_memset 1, webrender_sw_raster 1 |
| WRRenderBackend#0 | 35 | 1.7 | Other 35 | 0 / 0 / 35 | webrender_render 1 |
| Compositor | 23 | 1.1 | Idle 22, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 22, webrender_render 0, canvas_2d 0 |
| Timer | 17 | 0.8 | Other 17 | 0 / 0 / 17 | ipc 17, poll_wait 17, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 273; `[unknown]` 11; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4; `write [libc.so.6]` 4; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3

**tab pid 3429** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

**tab pid 4108** — 1 ms CPU in the window

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

**tab pid 3411** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

