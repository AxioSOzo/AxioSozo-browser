### chromium-2x-control scroll (profile pass)

**parent pid 4356** — 1336 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 329 | 16.3 | Idle 231, JavaScript 41, Other 28, DOM 15 | 1 / 54 / 273 | ipc 328, poll_wait 255, gc_cc 46, worker_messaging 29 |
| Renderer | 293 | 14.5 | Idle 150, Graphics 143 | 0 / 0 / 293 | ipc 293, poll_wait 159, webrender_render 143, webrender_sw_raster 125 |
| SwComposite | 250 | 12.4 | Other 250 | 0 / 0 / 250 | webrender_render 250, poll_wait 156, webrender_sw_raster 92, memcpy_memset 9 |
| DOM Worker | 227 | 11.2 | JavaScript 222, Profiler 3, Other 2 | 0 / 0 / 227 | subprocess_pipe_io 227, worker_messaging 226, ipc 226, js_ctypes 213 |
| BackgroundThreadPool #2 | 166 | 8.2 | Other 85, Idle 81, Graphics 1 | 0 / 0 / 166 | ipc 166, native_receiver 85, memcpy_memset 84, poll_wait 81 |
| WRRenderBackend#0 | 27 | 1.3 | Other 27 | 0 / 0 / 27 |  |
| Compositor | 18 | 0.9 | Idle 17, Other 0, Profiler 0, Graphics 0 | 0 / 0 / 18 | ipc 18, poll_wait 17, webrender_render 0, canvas_2d 0 |
| Timer | 15 | 0.7 | Other 15 | 0 / 0 / 15 | ipc 15, poll_wait 15, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 232; `[unknown]` 10; `write [libc.so.6]` 4; `recvmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[libglib-2.0.so.0]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2

**tab pid 4546** — 1 ms CPU in the window

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

**tab pid 5036** — 0 ms CPU in the window

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

**tab pid 5140** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

