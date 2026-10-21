### webkit-2x scroll (profile pass)

**parent pid 8784** — 1301 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 585 | 26.8 | Idle 296, JavaScript 133, Other 69, DOM 43 | 13 / 163 / 410 | ipc 585, poll_wait 378, gc_cc 132, engine_stream_read 91 |
| DOM Worker | 276 | 12.6 | JavaScript 256, Profiler 16, Other 4 | 0 / 0 / 276 | subprocess_pipe_io 276, worker_messaging 276, ipc 276, js_ctypes 232 |
| BackgroundThreadPool #3 | 171 | 7.8 | Idle 112, Other 57, Graphics 2 | 0 / 0 / 171 | ipc 171, poll_wait 113, native_receiver 58, memcpy_memset 54 |
| Renderer | 109 | 5.0 | Idle 71, Graphics 38, Other 0 | 0 / 0 / 109 | ipc 109, poll_wait 82, webrender_render 38, webrender_sw_raster 26 |
| SwComposite | 58 | 2.7 | Other 58 | 0 / 0 / 58 | webrender_render 58, poll_wait 55, webrender_sw_raster 3, memcpy_memset 1 |
| WRRenderBackend#0 | 37 | 1.7 | Other 37 | 0 / 0 / 37 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 27 | 1.2 | Idle 27, Other 0, Profiler 0 | 0 / 0 / 27 | ipc 27, poll_wait 27, canvas_2d 0, webrender_render 0 |
| Timer | 18 | 0.8 | Other 18 | 0 / 0 / 18 | ipc 18, poll_wait 17, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 342; `[unknown]` 30; `__lll_lock_wait [libc.so.6]` 7; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 6; `__lll_lock_wake [libc.so.6]` 5; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 5; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4

**tab pid 8920** — 1 ms CPU in the window

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

**tab pid 9485** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8942** — 1 ms CPU in the window

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

