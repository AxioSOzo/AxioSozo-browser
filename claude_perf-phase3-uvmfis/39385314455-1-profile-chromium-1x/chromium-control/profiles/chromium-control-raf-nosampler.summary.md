### chromium-control raf-nosampler (profile pass)

**parent pid 4455** — 1123 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 298 | 9.7 | JavaScript 291, Profiler 4, Other 4 | 0 / 0 / 298 | subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 274 |
| Renderer | 224 | 7.3 | Idle 114, Graphics 109, Other 1 | 0 / 0 / 224 | ipc 224, poll_wait 123, webrender_render 110, webrender_sw_raster 93 |
| GeckoMain | 222 | 7.2 | Idle 118, JavaScript 59, Other 27, DOM 15 | 6 / 62 / 153 | ipc 222, poll_wait 134, gc_cc 73, worker_messaging 42 |
| SwComposite | 173 | 5.6 | Other 173 | 0 / 0 / 173 | webrender_render 173, poll_wait 96, webrender_sw_raster 77, memcpy_memset 9 |
| BackgroundThreadPool #3 | 69 | 2.2 | Idle 63, Other 5, Graphics 1 | 0 / 0 / 69 | ipc 69, poll_wait 63, native_receiver 6, memcpy_memset 5 |
| WRRenderBackend#0 | 64 | 2.1 | Other 64 | 0 / 0 / 64 | webrender_render 1, memcpy_memset 0 |
| Compositor | 44 | 1.4 | Idle 42, Other 1, Graphics 0 | 0 / 0 / 44 | ipc 44, poll_wait 42, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 18 | 0.6 | Idle 18, Other 0, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 18, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 123; `[unknown]` 10; `recvmsg [libc.so.6]` 8; `write [libc.so.6]` 5; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeObject*>, JS` 4; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 3; `[axiosozo-dev]` 3; `[linux-vdso.so.1]` 2

**tab pid 4891** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `TimerThread::Init() [libxul.so]` 0

**tab pid 5007** — 1 ms CPU in the window

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

**tab pid 5010** — 1 ms CPU in the window

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

