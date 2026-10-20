### chromium-control scroll (profile pass)

**parent pid 4588** — 1152 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 459 | 21.7 | Idle 257, JavaScript 88, Other 57, GC / CC 18 | 7 / 83 / 368 | ipc 457, poll_wait 324, gc_cc 101, worker_messaging 46 |
| DOM Worker | 278 | 13.1 | JavaScript 269, Other 6, Profiler 3 | 0 / 0 / 278 | subprocess_pipe_io 278, worker_messaging 278, ipc 278, js_ctypes 253 |
| Renderer | 143 | 6.7 | Idle 93, Graphics 50, Other 0 | 0 / 0 / 143 | ipc 143, poll_wait 98, webrender_render 50, webrender_sw_raster 43 |
| SwComposite | 105 | 4.9 | Other 105 | 0 / 0 / 105 | webrender_render 105, poll_wait 91, webrender_sw_raster 14, memcpy_memset 2 |
| BackgroundThreadPool #1 | 59 | 2.8 | Idle 52, Other 6, Graphics 0, Profiler 0 | 0 / 0 / 59 | ipc 59, poll_wait 51, native_receiver 7, memcpy_memset 6 |
| WRRenderBackend#0 | 44 | 2.1 | Other 44 | 0 / 0 / 44 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 25 | 1.2 | Idle 24, Other 1, Graphics 0 | 0 / 0 / 25 | ipc 25, poll_wait 24, webrender_render 0, image_container 0 |
| Timer | 22 | 1.0 | Other 22, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 22 |

Main thread, top self: `poll [libc.so.6]` 263; `[unknown]` 16; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 6; `mprotect [libc.so.6]` 5; `[axiosozo-dev]` 4; `mozilla::JSGCThingParticipant::TraverseNative(void*, nsCycleCollection` 4; `EnqueuePromiseReactionJob(JSContext*, JS::Handle<JSObject*>, JS::Handl` 3

**tab pid 4764** — 1 ms CPU in the window

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

**tab pid 5365** — 1 ms CPU in the window

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

**tab pid 4725** — 1 ms CPU in the window

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

