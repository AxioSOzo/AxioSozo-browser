### chromium-2x raf-nosampler (profile pass)

**parent pid 3331** — 986 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 267 | 8.7 | JavaScript 260, Other 5, Profiler 2 | 0 / 0 / 267 | subprocess_pipe_io 267, worker_messaging 267, ipc 267, js_ctypes 250 |
| GeckoMain | 211 | 6.9 | Idle 116, JavaScript 54, Other 23, DOM 12 | 6 / 56 / 149 | ipc 211, poll_wait 128, gc_cc 69, worker_messaging 40 |
| Renderer | 150 | 4.9 | Idle 85, Graphics 62, Other 3, Profiler 1 | 0 / 0 / 150 | ipc 150, poll_wait 90, webrender_render 63, webrender_sw_raster 52 |
| BackgroundThreadPool #3 | 127 | 4.2 | Idle 95, Other 32, Graphics 0 | 0 / 0 / 127 | ipc 127, poll_wait 95, native_receiver 32, memcpy_memset 32 |
| SwComposite | 110 | 3.6 | Other 110 | 0 / 0 / 110 | webrender_render 110, poll_wait 88, webrender_sw_raster 22, memcpy_memset 20 |
| WRRenderBackend#0 | 52 | 1.7 | Other 52 | 0 / 0 / 52 | webrender_render 1, webrender_scene 0, poll_wait 0 |
| Compositor | 39 | 1.3 | Idle 38, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 39 | ipc 39, poll_wait 38, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 16 | 0.5 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 16, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 118; `[unknown]` 14; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `js::RunScript(JSContext*, js::RunState&) [libxul.so]` 2; `js::InnerViewTable::maybeViewsUnbarriered(js::ArrayBufferObject*) [lib` 1

**tab pid 3494** — 1 ms CPU in the window

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

**tab pid 4218** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 4027** — 1 ms CPU in the window

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

