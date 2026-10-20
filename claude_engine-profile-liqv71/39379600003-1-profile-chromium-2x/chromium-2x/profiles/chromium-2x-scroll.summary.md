### chromium-2x scroll (profile pass)

**parent pid 3371** — 1931 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 515 | 23.7 | Idle 306, JavaScript 102, Other 57, DOM 20 | 10 / 106 / 399 | ipc 515, poll_wait 365, gc_cc 106, worker_messaging 63 |
| Renderer | 436 | 20.0 | Idle 245, Graphics 191, Other 0 | 0 / 0 / 436 | ipc 436, poll_wait 270, webrender_render 191, webrender_sw_raster 154 |
| SwComposite | 365 | 16.7 | Other 365 | 0 / 0 / 365 | webrender_render 365, poll_wait 239, webrender_sw_raster 121, memcpy_memset 15 |
| DOM Worker | 299 | 13.7 | JavaScript 291, Profiler 5, Other 4 | 0 / 0 / 299 | subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 276 |
| BackgroundThreadPool #1 | 195 | 9.0 | Idle 119, Other 73, Graphics 3 | 0 / 0 / 195 | ipc 195, poll_wait 121, native_receiver 75, memcpy_memset 69 |
| WRRenderBackend#0 | 50 | 2.3 | Other 50 | 0 / 0 / 50 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| Compositor | 28 | 1.3 | Idle 27, Other 0 | 0 / 0 / 28 | ipc 28, poll_wait 28, webrender_render 0, canvas_2d 0 |
| Timer | 22 | 1.0 | Other 22, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 22, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 318; `write [libc.so.6]` 17; `[unknown]` 10; `__lll_lock_wake [libc.so.6]` 7; `js::jit::DoCallFallback(JSContext*, js::jit::BaselineFrame*, js::jit::` 6; `[axiosozo-dev]` 5; `__lll_lock_wait [libc.so.6]` 4; `[libgdk-3.so.0]` 4

**tab pid 4151** — 1 ms CPU in the window

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

**tab pid 4146** — 1 ms CPU in the window

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

**tab pid 3520** — 1 ms CPU in the window

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

