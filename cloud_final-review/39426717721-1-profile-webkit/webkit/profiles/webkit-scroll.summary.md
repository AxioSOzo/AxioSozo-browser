### webkit scroll (profile pass)

**parent pid 7188** — 946 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 482 | 23.0 | Idle 258, JavaScript 103, Other 58, DOM 27 | 12 / 112 / 358 | ipc 481, poll_wait 316, gc_cc 97, engine_stream_read 68 |
| DOM Worker | 235 | 11.2 | JavaScript 227, Profiler 6, Other 2 | 0 / 0 / 235 | subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 211 |
| BackgroundThreadPool #3 | 58 | 2.8 | Idle 48, Other 9, Graphics 1 | 0 / 0 / 58 | ipc 58, poll_wait 49, native_receiver 10, memcpy_memset 8 |
| Renderer | 52 | 2.5 | Idle 42, Graphics 10, Other 1 | 0 / 0 / 52 | ipc 52, poll_wait 45, webrender_render 10, webrender_sw_raster 5 |
| WRRenderBackend#0 | 33 | 1.6 | Other 33 | 0 / 0 / 33 | webrender_render 0, poll_wait 0 |
| SwComposite | 25 | 1.2 | Other 25 | 0 / 0 / 25 | webrender_render 25, poll_wait 24, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 24 | 1.2 | Idle 24, Other 1, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 24, webrender_render 0, canvas_2d 0 |
| Timer | 20 | 0.9 | Other 20 | 0 / 0 / 20 | ipc 19, poll_wait 19 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 286; `[unknown]` 20; `[axiosozo-dev]` 6; `ProfilingStack::pushLabelFrame(char const*, char const*, void*, JS::Pr` 4; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `AttrArray::GetAttr(nsAtom const*) const [libxul.so]` 3; `mozilla::ProfileBufferChunkManagerSingle::SetChunkDestroyedCallback(st` 3

**tab pid 7342** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0

**tab pid 7364** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 7742** — 1 ms CPU in the window

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

