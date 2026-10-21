### webkit switch-to-gecko (profile pass)

**parent pid 7154** — 52 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 11.0 | JavaScript 9, Other 5, Idle 3, Graphics 3 | 1 / 12 / 13 | ipc 26, paint_layout 7, gc_cc 7, array_buffer_copy 5 |
| BgIOThreadPool #3 | 7 | 2.8 | Other 7, Idle 0 | 0 / 0 / 7 | ipc 7, poll_wait 0 |
| Renderer | 6 | 2.7 | Idle 3, Graphics 3, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 3, webrender_render 3, webrender_sw_raster 3 |
| DOM Worker | 6 | 2.7 | JavaScript 6, Idle 1, Profiler 0 | 0 / 0 / 6 | subprocess_pipe_io 6, worker_messaging 6, ipc 6, poll_wait 5 |
| Compositor | 2 | 0.7 | Idle 1, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 0 |
| WRRenderBackend#0 | 1 | 0.6 | Other 1 | 0 / 0 / 1 |  |
| WRSceneBuilder#0 | 1 | 0.5 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |
| Socket Thread | 1 | 0.3 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 3; `nsIFrame::GetUsedPadding() const [libxul.so]` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 2; `XPCConvert::NativeArray2JS(JSContext*, JS::MutableHandle<JS::Value>, v` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `nsXPCWrappedJS::CallMethod(unsigned short, nsXPTMethodInfo const*, nsX` 1; `mozilla::EventListenerManager::HandleEventInternal(nsPresContext*, moz` 1

**tab pid 7709** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.7 | Idle 2, JavaScript 1, DOM 0, Profiler 0 | 0 / 1 / 3 | ipc 3, poll_wait 2, subprocess_pipe_io 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::LifoAlloc::reset(unsigned long) [libxul.so]` 1; `[]` 1; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13ReserveAndP` 0

**tab pid 7246** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7715** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

