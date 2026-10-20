### webkit-2x scroll (profile pass)

**parent pid 8750** — 1591 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 525 | 24.8 | Idle 276, JavaScript 97, Other 80, DOM 31 | 5 / 124 / 395 | ipc 522, poll_wait 356, gc_cc 99, engine_stream_read 63 |
| Renderer | 307 | 14.5 | Graphics 165, Idle 140, Profiler 1 | 0 / 0 / 307 | ipc 307, webrender_render 167, poll_wait 163, webrender_sw_raster 147 |
| DOM Worker | 271 | 12.8 | JavaScript 246, Profiler 18, Other 7 | 0 / 0 / 271 | subprocess_pipe_io 271, worker_messaging 267, ipc 267, js_ctypes 210 |
| SwComposite | 253 | 12.0 | Other 253 | 0 / 0 / 253 | webrender_render 253, poll_wait 150, webrender_sw_raster 102, memcpy_memset 15 |
| BackgroundThreadPool #5 | 134 | 6.4 | Idle 98, Other 24, Graphics 12 | 0 / 0 / 134 | ipc 134, poll_wait 105, native_receiver 36, memcpy_memset 24 |
| WRRenderBackend#0 | 38 | 1.8 | Other 38 | 0 / 0 / 38 | webrender_render 0 |
| Compositor | 25 | 1.2 | Idle 24, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 25 | ipc 25, poll_wait 24, webrender_render 0, image_container 0 |
| Timer | 20 | 1.0 | Other 20 | 0 / 0 / 20 | ipc 20, poll_wait 20, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 320; `__lll_lock_wait [libc.so.6]` 15; `[unknown]` 11; `[axiosozo-dev]` 10; `__lll_lock_wake [libc.so.6]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 8; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 6; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 5

**tab pid 8889** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 9283** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 8911** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

