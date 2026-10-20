### chromium raf-nosampler (profile pass)

**parent pid 3402** — 880 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 351 | 11.5 | JavaScript 291, GC / CC 29, Other 27, Profiler 4 | 0 / 0 / 351 | subprocess_pipe_io 351, worker_messaging 351, ipc 351, js_ctypes 272 |
| GeckoMain | 218 | 7.1 | Idle 113, JavaScript 60, Other 26, DOM 10 | 7 / 59 / 153 | ipc 218, poll_wait 124, gc_cc 72, worker_messaging 43 |
| Renderer | 79 | 2.6 | Idle 56, Graphics 22, Other 1 | 0 / 0 / 79 | ipc 79, poll_wait 58, webrender_render 22, webrender_sw_raster 18 |
| BackgroundThreadPool #3 | 66 | 2.1 | Idle 61, Other 4, Profiler 0 | 0 / 0 / 66 | ipc 66, poll_wait 61, native_receiver 4, memcpy_memset 4 |
| WRRenderBackend#0 | 46 | 1.5 | Other 46 | 0 / 0 / 46 | memcpy_memset 0, webrender_render 0, poll_wait 0, webrender_scene 0 |
| SwComposite | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_render 43, poll_wait 41, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 42 | 1.4 | Idle 40, Other 2, Graphics 0, Profiler 0 | 0 / 0 / 42 | ipc 42, poll_wait 40, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 18 | 0.6 | Idle 18, Other 0, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 18, image_container 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 115; `[unknown]` 12; `write [libc.so.6]` 3; `recvmsg [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `void js::gc::AtomRefRuntime::recordRef<JSAtom>(JSContext*, JSAtom*) [l` 2; `read [libc.so.6]` 1; `[axiosozo-dev]` 1

**tab pid 3867** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0

**tab pid 4048** — 1 ms CPU in the window

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

**tab pid 3604** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

