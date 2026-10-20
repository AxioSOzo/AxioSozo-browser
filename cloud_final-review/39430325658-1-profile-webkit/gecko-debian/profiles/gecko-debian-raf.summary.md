### gecko-debian raf (profile pass)

**parent pid 8213** — 671 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 361 | 11.7 | Graphics 262, Idle 98, Other 1 | 0 / 0 / 361 | ipc 359, webrender_render 263, webrender_sw_raster 232, poll_wait 99 |
| WRRenderBackend#0 | 83 | 2.7 | Other 83 | 0 / 0 / 83 | webrender_render 2, memcpy_memset 1, poll_wait 0, array_buffer_copy 0 |
| GeckoMain | 71 | 2.3 | GC / CC 33, Idle 22, JavaScript 7, Layout 3 | 0 / 8 / 63 | ipc 71, gc_cc 41, poll_wait 24, harness_diagnostics 7 |
| WRSceneBuilder#0 | 55 | 1.8 | Other 55 | 0 / 0 / 55 | webrender_scene 55, webrender_render 4, poll_wait 1, array_buffer_copy 0 |
| Compositor | 51 | 1.6 | Idle 49, Other 2 | 0 / 0 / 51 | ipc 51, poll_wait 49, paint_layout 1, webrender_render 0 |
| SwComposite | 24 | 0.8 | Other 24 | 0 / 0 / 24 | webrender_render 24, poll_wait 22, webrender_sw_raster 2, memcpy_memset 2 |
| IPC I/O Parent | 12 | 0.4 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 24; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `mprotect [libc.so.6]` 3; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `getrusage [libc.so.6]` 3; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2

**tab pid 8455** — 242 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 217 | 7.0 | Idle 100, Graphics 46, Layout 32, Other 17 | 0 / 14 / 203 | ipc 199, poll_wait 101, paint_layout 96, gc_cc 5 |
| IPC I/O Child | 19 | 0.6 | Idle 18, Other 0 | 0 / 0 / 19 | poll_wait 18, ipc 0 |
| Timer | 7 | 0.2 | Other 7 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 104; `[]` 8; `[linux-vdso.so.1]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `getcontext [libc.so.6]` 3; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libxul.so]` 3; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2

**tab pid 8478** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0

**tab pid 8379** — 1 ms CPU in the window

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

