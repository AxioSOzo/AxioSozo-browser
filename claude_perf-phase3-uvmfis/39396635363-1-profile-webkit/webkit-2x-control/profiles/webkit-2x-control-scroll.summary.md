### webkit-2x-control scroll (profile pass)

**parent pid 10786** — 1721 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 468 | 22.5 | Idle 286, JavaScript 83, Other 49, DOM 23 | 12 / 93 / 363 | ipc 465, poll_wait 339, gc_cc 79, engine_stream_read 54 |
| Renderer | 374 | 17.9 | Graphics 235, Idle 138 | 0 / 0 / 374 | ipc 374, webrender_render 235, webrender_sw_raster 190, poll_wait 146 |
| SwComposite | 326 | 15.7 | Other 326 | 0 / 0 / 326 | webrender_render 326, webrender_sw_raster 173, poll_wait 153, memcpy_memset 18 |
| DOM Worker | 265 | 12.7 | JavaScript 240, Profiler 19, Other 6 | 0 / 0 / 265 | subprocess_pipe_io 265, worker_messaging 263, ipc 263, js_ctypes 222 |
| BackgroundThreadPool #1 | 197 | 9.5 | Idle 120, Other 75, Graphics 2 | 0 / 0 / 197 | ipc 197, poll_wait 121, native_receiver 70, memcpy_memset 66 |
| WRRenderBackend#0 | 41 | 1.9 | Other 41 | 0 / 0 / 41 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 21 | 1.0 | Idle 20, Other 0, Graphics 0 | 0 / 0 / 21 | ipc 21, poll_wait 20, webrender_render 0, image_container 0 |
| Timer | 17 | 0.8 | Other 17 | 0 / 0 / 17 | ipc 17, poll_wait 17, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 314; `[unknown]` 21; `__lll_lock_wait [libc.so.6]` 10; `[axiosozo-dev]` 6; `__lll_lock_wake [libc.so.6]` 6; `XPCCallContext::XPCCallContext(JSContext*, JS::Handle<JSObject*>, JS::` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3; `[libgobject-2.0.so.0]` 3

**tab pid 11436** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::default_del` 0

**tab pid 10952** — 1 ms CPU in the window

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

**tab pid 10930** — 1 ms CPU in the window

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

