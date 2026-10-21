### gecko key (profile pass)

**parent pid 3086** — 312 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 210 | 5.5 | Layout 43, Idle 40, Other 35, GC / CC 30 | 1 / 34 / 174 | ipc 209, paint_layout 76, poll_wait 66, gc_cc 47 |
| Renderer | 34 | 0.9 | Idle 20, Graphics 14 | 0 / 0 / 34 | ipc 34, poll_wait 20, webrender_render 14, webrender_sw_raster 13 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 | webrender_render 0, memcpy_memset 0, poll_wait 0, webrender_sw_raster 0 |
| Compositor | 18 | 0.5 | Idle 18, Other 1 | 0 / 0 / 18 | ipc 18, poll_wait 18, memcpy_memset 1, paint_layout 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, webrender_render 0, poll_wait 0, array_buffer_copy 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 1, Profiler 0 | 0 / 0 / 10 | poll_wait 10, ipc 1 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 44; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `[axiosozo-dev]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `__memset_avx2_unaligned_erms [libc.so.6]` 5; `recvmsg [libc.so.6]` 5; `[unknown]` 3; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 3

**tab pid 3315** — 75 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 67 | 1.8 | Idle 24, Other 10, JavaScript 10, Graphics 8 | 0 / 9 / 58 | ipc 64, poll_wait 26, paint_layout 15, gc_cc 12 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 24; `sendmsg [libc.so.6]` 4; `zen::ZenMouseTracker::AddRef() [libxul.so]` 1; `mozilla::ReflowInput::InitConstraints(nsPresContext*, mozilla::Maybe<m` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `floor [libxul.so]` 1; `ScanBlackVisitor::VisitNode(PtrInfo*) [libxul.so]` 1

**tab pid 3176** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Other 0, Profiler 0 | 0 / 0 / 7 | ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `NS_CycleCollectableHasRefCntZero [libxul.so]` 0; `[unknown]` 0; `NS_IsMainThread [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandle<JS::Valu` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0

**tab pid 3405** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

