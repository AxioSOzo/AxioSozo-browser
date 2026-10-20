### webkit key (profile pass)

**parent pid 7188** — 850 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 476 | 13.0 | Idle 215, JavaScript 85, Other 44, Layout 38 | 11 / 152 / 314 | ipc 474, poll_wait 259, gc_cc 111, paint_layout 76 |
| DOM Worker | 236 | 6.4 | JavaScript 232, Other 2, Profiler 2 | 0 / 0 / 236 | subprocess_pipe_io 236, worker_messaging 236, ipc 236, js_ctypes 227 |
| Timer | 37 | 1.0 | Other 37, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 37, memcpy_memset 0 |
| Renderer | 32 | 0.9 | Idle 19, Graphics 13 | 0 / 0 / 32 | ipc 32, poll_wait 19, webrender_render 13, webrender_sw_raster 9 |
| SwComposite | 25 | 0.7 | Other 25 | 0 / 0 / 25 | webrender_render 25, poll_wait 17, webrender_sw_raster 8, memcpy_memset 1 |
| Compositor | 13 | 0.4 | Idle 13, Other 1, Profiler 0 | 0 / 0 / 13 | ipc 13, poll_wait 13, webrender_render 0, canvas_2d 0 |
| WRRenderBackend#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 |  |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | webrender_scene 8, webrender_render 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 231; `[unknown]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `[axiosozo-dev]` 9; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `mozilla::dom::Document::CreateRange(mozilla::ErrorResult&) [libxul.so]` 4; `nsFlexContainerFrame::GenerateFlexItemForChild(nsFlexContainerFrame::F` 4; `mprotect [libc.so.6]` 3

**tab pid 7274** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, Other 1, JavaScript 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `mozilla::CheckIdleMemoryCleanupNeeded(nsITimer*, void*) [libxul.so]` 0; `[unknown]` 0; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::Handle<JSO` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Ini` 0

**tab pid 7369** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7350** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

