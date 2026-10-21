### chromium raf-nosampler (profile pass)

**parent pid 3367** — 863 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 348 | 11.4 | JavaScript 286, GC / CC 30, Other 28, Profiler 5 | 0 / 0 / 348 | subprocess_pipe_io 348, worker_messaging 348, ipc 348, js_ctypes 271 |
| GeckoMain | 225 | 7.4 | Idle 123, JavaScript 62, DOM 20, Other 19 | 9 / 70 / 146 | ipc 225, poll_wait 135, gc_cc 78, worker_messaging 48 |
| Renderer | 84 | 2.7 | Idle 63, Graphics 21 | 0 / 0 / 84 | ipc 84, poll_wait 67, webrender_render 21, webrender_sw_raster 14 |
| WRRenderBackend#0 | 49 | 1.6 | Other 49 | 0 / 0 / 49 | memcpy_memset 0, array_buffer_copy 0, webrender_render 0 |
| Compositor | 45 | 1.5 | Idle 43, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 45 | ipc 45, poll_wait 43, webrender_render 1, canvas_2d 0 |
| SwComposite | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_render 43, poll_wait 42, memcpy_memset 1, webrender_sw_raster 1 |
| BackgroundThreadPool #3 | 36 | 1.2 | Idle 34, Other 2, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 33, native_receiver 2, memcpy_memset 1 |
| ImageBridgeChld | 19 | 0.6 | Idle 19, Other 0 | 0 / 0 / 19 | ipc 19, poll_wait 19, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 124; `[unknown]` 11; `write [libc.so.6]` 5; `recvmsg [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 3

**tab pid 4245** — 1 ms CPU in the window

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

**tab pid 4250** — 1 ms CPU in the window

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

**tab pid 3551** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

