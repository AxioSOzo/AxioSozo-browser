### chromium scroll (profile pass)

**parent pid 3144** — 784 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 387 | 18.7 | Idle 219, JavaScript 75, Other 43, Graphics 16 | 10 / 78 / 299 | ipc 387, poll_wait 276, gc_cc 77, worker_messaging 42 |
| DOM Worker | 208 | 10.0 | JavaScript 195, Profiler 8, Other 5 | 0 / 0 / 208 | subprocess_pipe_io 208, worker_messaging 208, ipc 208, js_ctypes 178 |
| Renderer | 47 | 2.3 | Idle 37, Graphics 10, Other 0 | 0 / 0 / 47 | ipc 47, poll_wait 40, webrender_render 10, webrender_sw_raster 5 |
| BackgroundThreadPool #2 | 37 | 1.8 | Idle 34, Other 3 | 0 / 0 / 37 | ipc 37, poll_wait 34, native_receiver 3, memcpy_memset 2 |
| WRRenderBackend#0 | 29 | 1.4 | Other 29 | 0 / 0 / 29 | memcpy_memset 0, webrender_render 0 |
| SwComposite | 22 | 1.1 | Other 22 | 0 / 0 / 22 | webrender_render 22, poll_wait 21, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 21 | 1.0 | Idle 21, Other 0, Graphics 0 | 0 / 0 / 21 | ipc 21, poll_wait 21, webrender_render 0, canvas_2d 0 |
| Timer | 16 | 0.8 | Other 16 | 0 / 0 / 16 | ipc 16, poll_wait 16 |

Main thread, top self: `poll [libc.so.6]` 222; `[unknown]` 15; `write [libc.so.6]` 7; `recvmsg [libc.so.6]` 7; `mprotect [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `__lll_lock_wait [libc.so.6]` 3; `read [libc.so.6]` 3

**tab pid 3319** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.2 | Idle 2, DOM 1, JavaScript 1, Other 0 | 0 / 2 / 2 | ipc 3, poll_wait 2, gc_cc 2 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 1; `[unknown]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<TimerMarker,` 0

**tab pid 3301** — 1 ms CPU in the window

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

**tab pid 3804** — 1 ms CPU in the window

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

