### webkit-2x scroll (profile pass)

**parent pid 8803** — 1194 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 464 | 22.5 | Idle 266, JavaScript 76, Other 53, DOM 26 | 11 / 90 / 363 | ipc 461, poll_wait 323, gc_cc 90, engine_stream_read 47 |
| DOM Worker | 236 | 11.4 | JavaScript 218, Profiler 16, Other 2 | 0 / 0 / 236 | subprocess_pipe_io 236, worker_messaging 235, ipc 235, js_ctypes 191 |
| BackgroundThreadPool #1 | 219 | 10.6 | Other 110, Idle 103, Graphics 6 | 0 / 0 / 219 | ipc 219, native_receiver 116, memcpy_memset 107, poll_wait 105 |
| Renderer | 117 | 5.7 | Idle 64, Graphics 49, Other 4 | 0 / 0 / 117 | ipc 117, poll_wait 79, webrender_render 50, webrender_sw_raster 41 |
| SwComposite | 79 | 3.8 | Other 79 | 0 / 0 / 79 | webrender_render 79, poll_wait 73, memcpy_memset 5, webrender_sw_raster 5 |
| WRRenderBackend#0 | 30 | 1.5 | Other 30 | 0 / 0 / 30 | webrender_render 0, memcpy_memset 0 |
| Compositor | 20 | 1.0 | Idle 20, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 20 | ipc 20, poll_wait 20, webrender_render 0, canvas_2d 0 |
| Timer | 15 | 0.7 | Other 15, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 15 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 292; `[unknown]` 13; `[axiosozo-dev]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 4; `__lll_lock_wait [libc.so.6]` 4; `nsIFrame::GetOverflowRect(mozilla::OverflowType) const [libxul.so]` 4; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4

**tab pid 8986** — 1 ms CPU in the window

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

**tab pid 9354** — 1 ms CPU in the window

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

**tab pid 8945** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `js::Nursery::wantEagerCollection() const [libxul.so]` 0

