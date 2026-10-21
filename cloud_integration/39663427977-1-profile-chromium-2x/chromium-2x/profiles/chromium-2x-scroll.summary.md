### chromium-2x scroll (profile pass)

**parent pid 3450** — 1194 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 506 | 23.8 | Idle 273, JavaScript 82, Other 76, Graphics 22 | 6 / 103 / 398 | ipc 506, poll_wait 365, gc_cc 88, paint_layout 64 |
| DOM Worker | 265 | 12.4 | JavaScript 253, Other 7, Profiler 4 | 0 / 0 / 265 | subprocess_pipe_io 265, worker_messaging 265, ipc 265, js_ctypes 240 |
| BackgroundThreadPool #1 | 146 | 6.9 | Idle 98, Other 45, Graphics 2 | 0 / 0 / 146 | ipc 146, poll_wait 100, native_receiver 47, memcpy_memset 44 |
| Renderer | 101 | 4.7 | Idle 67, Graphics 34, Other 0 | 0 / 0 / 101 | ipc 101, poll_wait 77, webrender_render 34, webrender_sw_raster 25 |
| SwComposite | 70 | 3.3 | Other 70 | 0 / 0 / 70 | webrender_render 70, poll_wait 67, memcpy_memset 3, webrender_sw_raster 3 |
| WRRenderBackend#0 | 39 | 1.8 | Other 38, Profiler 0 | 0 / 0 / 39 | webrender_render 2, poll_wait 0 |
| Compositor | 26 | 1.2 | Idle 26, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, webrender_render 0, canvas_2d 0 |
| Timer | 22 | 1.0 | Other 22 | 0 / 0 / 22 | ipc 22, poll_wait 21, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 280; `[unknown]` 18; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 7; `[axiosozo-dev]` 5; `JS_IsNativeFunction(JSObject*, bool (*)(JSContext*, unsigned int, JS::` 4; `__lll_lock_wait [libc.so.6]` 4; `mozilla::EventListenerManager::HandleEventInternal(nsPresContext*, moz` 4

**tab pid 3608** — 1 ms CPU in the window

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

**tab pid 4368** — 1 ms CPU in the window

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

**tab pid 4373** — 1 ms CPU in the window

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

