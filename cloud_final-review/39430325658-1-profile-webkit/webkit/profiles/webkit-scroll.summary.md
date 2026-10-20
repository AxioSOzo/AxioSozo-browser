### webkit scroll (profile pass)

**parent pid 7188** — 1043 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 547 | 26.0 | Idle 289, JavaScript 113, Other 62, DOM 28 | 13 / 119 / 415 | ipc 544, poll_wait 365, gc_cc 104, engine_stream_read 63 |
| DOM Worker | 255 | 12.1 | JavaScript 244, Profiler 7, Other 4 | 0 / 0 / 255 | subprocess_pipe_io 255, worker_messaging 254, ipc 254, js_ctypes 225 |
| BackgroundThreadPool #2 | 61 | 2.9 | Idle 51, Other 9, Graphics 1 | 0 / 0 / 61 | ipc 61, poll_wait 51, native_receiver 10, memcpy_memset 8 |
| Renderer | 56 | 2.7 | Idle 39, Graphics 16, Other 0 | 0 / 0 / 56 | ipc 56, poll_wait 46, webrender_render 17, webrender_sw_raster 9 |
| WRRenderBackend#0 | 35 | 1.6 | Other 35 | 0 / 0 / 35 | array_buffer_copy 0 |
| Compositor | 27 | 1.3 | Idle 26, Other 0, Graphics 0 | 0 / 0 / 27 | ipc 27, poll_wait 26, webrender_render 0, canvas_2d 0 |
| SwComposite | 24 | 1.1 | Other 24 | 0 / 0 / 24 | webrender_render 24, poll_wait 23, memcpy_memset 1, webrender_sw_raster 1 |
| Timer | 21 | 1.0 | Other 21 | 0 / 0 / 21 | ipc 20, poll_wait 20 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 316; `[unknown]` 21; `[axiosozo-dev]` 9; `mprotect [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 5; `nsOuterWindowProxy::get(JSContext*, JS::Handle<JSObject*>, JS::Handle<` 5; `[linux-vdso.so.1]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 4

**tab pid 7745** — 1 ms CPU in the window

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

**tab pid 7379** — 1 ms CPU in the window

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

**tab pid 7739** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0

