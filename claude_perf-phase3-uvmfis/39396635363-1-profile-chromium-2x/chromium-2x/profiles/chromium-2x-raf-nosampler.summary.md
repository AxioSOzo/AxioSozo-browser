### chromium-2x raf-nosampler (profile pass)

**parent pid 3115** — 674 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 197 | 6.5 | JavaScript 189, Other 4, Profiler 4 | 0 / 0 / 197 | subprocess_pipe_io 197, worker_messaging 197, ipc 197, js_ctypes 182 |
| GeckoMain | 132 | 4.4 | Idle 90, JavaScript 25, Other 8, DOM 4 | 4 / 24 / 105 | ipc 132, poll_wait 94, gc_cc 33, worker_messaging 19 |
| Renderer | 102 | 3.4 | Idle 66, Graphics 36, Other 0 | 0 / 0 / 102 | ipc 102, poll_wait 71, webrender_render 36, webrender_sw_raster 33 |
| BackgroundThreadPool #1 | 84 | 2.8 | Idle 62, Other 20, Graphics 2 | 0 / 0 / 84 | ipc 84, poll_wait 63, native_receiver 20, memcpy_memset 17 |
| SwComposite | 79 | 2.6 | Other 79 | 0 / 0 / 79 | webrender_render 79, poll_wait 68, webrender_sw_raster 9, memcpy_memset 5 |
| WRRenderBackend#0 | 27 | 0.9 | Other 27 | 0 / 0 / 27 | webrender_render 0, poll_wait 0 |
| Compositor | 26 | 0.9 | Idle 26, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 11 | 0.4 | Idle 11, Other 0 | 0 / 0 / 11 | ipc 11, poll_wait 11, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 90; `[unknown]` 5; `recvmsg [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 1; `readAXCF (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:2` 1; `mprotect [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3275** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3254** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3293** — 1 ms CPU in the window

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

