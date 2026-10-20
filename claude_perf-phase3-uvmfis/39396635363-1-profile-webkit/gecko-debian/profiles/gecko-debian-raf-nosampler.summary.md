### gecko-debian raf-nosampler (profile pass)

**parent pid 8204** — 510 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 288 | 9.6 | Graphics 200, Idle 86, Profiler 1, Other 1 | 0 / 0 / 288 | ipc 285, webrender_render 202, webrender_sw_raster 177, poll_wait 88 |
| WRRenderBackend#0 | 58 | 1.9 | Other 58 | 0 / 0 / 58 | webrender_render 0, memcpy_memset 0, array_buffer_copy 0 |
| GeckoMain | 45 | 1.5 | GC / CC 29, Idle 12, JavaScript 2, Other 2 | 0 / 2 / 43 | ipc 45, gc_cc 30, poll_wait 14, harness_diagnostics 2 |
| WRSceneBuilder#0 | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_scene 43, webrender_render 2, poll_wait 1, memcpy_memset 0 |
| Compositor | 40 | 1.3 | Idle 39, Other 1, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 39, paint_layout 0, webrender_render 0 |
| SwComposite | 14 | 0.5 | Other 14 | 0 / 0 / 14 | webrender_render 14, poll_wait 14, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `nsWindowRoot::cycleCollection::TraceWrapper(void*, TraceCallbacks cons` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `nsINode::GetExistingListenerManager() const [libxul.so]` 1

**tab pid 8434** — 160 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 145 | 4.8 | Idle 101, Layout 13, Graphics 12, Other 9 | 0 / 3 / 142 | ipc 137, poll_wait 102, paint_layout 30, gc_cc 4 |
| IPC I/O Child | 14 | 0.5 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 14 | poll_wait 14, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 104; `[]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1; `nsFont::CalcDifference(nsFont const&) const [libxul.so]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1; `nsTimerImpl::InitCommon(mozilla::BaseTimeDuration<mozilla::TimeDuratio` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1

**tab pid 8364** — 1 ms CPU in the window

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

**tab pid 8342** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

