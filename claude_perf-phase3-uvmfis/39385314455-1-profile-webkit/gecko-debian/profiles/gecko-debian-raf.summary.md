### gecko-debian raf (profile pass)

**parent pid 8069** — 536 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 291 | 9.6 | Graphics 190, Idle 101, Profiler 1 | 0 / 0 / 291 | ipc 290, webrender_render 191, webrender_sw_raster 169, poll_wait 102 |
| WRRenderBackend#0 | 63 | 2.1 | Other 63 | 0 / 0 / 63 | webrender_render 1, poll_wait 1, memcpy_memset 0, array_buffer_copy 0 |
| GeckoMain | 56 | 1.8 | GC / CC 26, Idle 18, Other 3, JavaScript 3 | 0 / 3 / 52 | ipc 55, gc_cc 27, poll_wait 19, paint_layout 5 |
| WRSceneBuilder#0 | 46 | 1.5 | Other 46 | 0 / 0 / 46 | webrender_scene 46, poll_wait 0, webrender_render 0, paint_layout 0 |
| Compositor | 41 | 1.4 | Idle 40, Other 1, Profiler 0 | 0 / 0 / 41 | ipc 41, poll_wait 40, paint_layout 0, webrender_scene 0 |
| SwComposite | 23 | 0.7 | Other 23 | 0 / 0 / 23 | webrender_render 23, poll_wait 22, webrender_sw_raster 1, memcpy_memset 1 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 | memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::GCMarker::updateRangesAtStartOfSlice() [libxul.so]` 2; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `mprotect [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1; `mozilla::ReflowInput::InitAbsoluteConstraints(mozilla::ReflowInput con` 1

**tab pid 8325** — 182 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 166 | 5.4 | Idle 108, Graphics 16, Layout 13, Other 10 | 0 / 9 / 157 | ipc 160, poll_wait 109, paint_layout 41, gc_cc 10 |
| IPC I/O Child | 14 | 0.5 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 14 | poll_wait 14, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 112; `[]` 2; `nsPresArena<32768ul, mozilla::DisplayListArenaObjectId, 76ul>::Free(mo` 2; `getcontext [libc.so.6]` 1; `mozilla::ipc::PortLink::SendMessage(std::unique_ptr<IPC::Message, std:` 1; `__lll_lock_wait [libc.so.6]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 1; `mozilla::ScrollContainerFrame::MaybeCreateTopLayerAndWrapRootItems(moz` 1

**tab pid 8262** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 8416** — 1 ms CPU in the window

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

