### chromium-2x-control raf-nosampler (profile pass)

**parent pid 4356** — 1258 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 396 | 13.1 | Graphics 261, Idle 135, Other 0 | 0 / 0 / 396 | ipc 396, webrender_render 261, webrender_sw_raster 241, poll_wait 145 |
| SwComposite | 352 | 11.7 | Other 352 | 0 / 0 / 352 | webrender_render 352, webrender_sw_raster 205, poll_wait 147, memcpy_memset 35 |
| DOM Worker | 206 | 6.8 | JavaScript 200, Other 3, Profiler 3 | 0 / 0 / 206 | subprocess_pipe_io 206, worker_messaging 206, ipc 206, js_ctypes 186 |
| GeckoMain | 129 | 4.3 | Idle 86, JavaScript 26, Other 9, DOM 5 | 3 / 25 / 101 | ipc 129, poll_wait 92, gc_cc 34, engine_stream_read 20 |
| BackgroundThreadPool #2 | 90 | 3.0 | Idle 72, Other 18, Profiler 1, Graphics 1 | 0 / 0 / 90 | ipc 90, poll_wait 71, native_receiver 19, memcpy_memset 16 |
| WRRenderBackend#0 | 38 | 1.3 | Other 38 | 0 / 0 / 38 | webrender_render 0 |
| Compositor | 28 | 0.9 | Idle 27, Other 0, Graphics 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, webrender_render 0, canvas_2d 0 |
| ImageBridgeChld | 11 | 0.4 | Idle 11, Other 0 | 0 / 0 / 11 | ipc 11, poll_wait 11, image_container 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 87; `[unknown]` 6; `recvmsg [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MinorSweepingTracer>::onStringEdge(JSStr` 1; `mprotect [libc.so.6]` 1; `Subprocess.call/</stdout.read ([System Principal]:66:32)[0]` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Ini` 1; `write [libc.so.6]` 1

**tab pid 5140** — 1 ms CPU in the window

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

**tab pid 4528** — 1 ms CPU in the window

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

**tab pid 5036** — 1 ms CPU in the window

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

