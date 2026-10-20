### chromium-2x scroll (profile pass)

**parent pid 3331** — 1210 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 513 | 24.1 | Idle 295, JavaScript 95, Other 67, DOM 21 | 10 / 100 / 402 | ipc 512, poll_wait 388, gc_cc 86, paint_layout 54 |
| DOM Worker | 288 | 13.5 | JavaScript 276, Profiler 8, Other 4 | 0 / 0 / 288 | subprocess_pipe_io 288, worker_messaging 288, ipc 288, js_ctypes 249 |
| BackgroundThreadPool #3 | 133 | 6.3 | Idle 88, Other 42, Graphics 3 | 0 / 0 / 133 | ipc 133, poll_wait 90, native_receiver 45, memcpy_memset 41 |
| Renderer | 101 | 4.8 | Idle 69, Graphics 33 | 0 / 0 / 101 | ipc 101, poll_wait 76, webrender_render 33, webrender_sw_raster 30 |
| SwComposite | 68 | 3.2 | Other 68 | 0 / 0 / 68 | webrender_render 68, poll_wait 64, memcpy_memset 2, webrender_sw_raster 2 |
| WRRenderBackend#0 | 39 | 1.8 | Other 39 | 0 / 0 / 39 | webrender_render 0, webrender_scene 0, array_buffer_copy 0, memcpy_memset 0 |
| Compositor | 28 | 1.3 | Idle 27, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, webrender_render 0, memcpy_memset 0 |
| Timer | 21 | 1.0 | Other 21 | 0 / 0 / 21 | ipc 21, poll_wait 21, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 302; `recvmsg [libc.so.6]` 16; `[unknown]` 13; `write [libc.so.6]` 11; `[axiosozo-dev]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `read [libc.so.6]` 3

**tab pid 4027** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `g_main_context_iteration [libglib-2.0.so.0]` 0

**tab pid 3533** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[]` 0

**tab pid 3515** — 1 ms CPU in the window

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

