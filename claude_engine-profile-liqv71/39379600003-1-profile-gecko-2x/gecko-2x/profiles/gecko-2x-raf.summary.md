### gecko-2x raf (profile pass)

**parent pid 3036** — 522 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 247 | 8.0 | Graphics 157, Idle 89, Other 1 | 0 / 0 / 247 | ipc 247, webrender_render 158, webrender_sw_raster 141, poll_wait 96 |
| SwComposite | 59 | 1.9 | Other 59 | 0 / 0 / 59 | webrender_render 59, poll_wait 53, memcpy_memset 6, webrender_sw_raster 6 |
| GeckoMain | 56 | 1.8 | GC / CC 26, Idle 18, JavaScript 4, Other 3 | 0 / 4 / 51 | ipc 56, gc_cc 28, poll_wait 19, paint_layout 5 |
| WRRenderBackend#0 | 54 | 1.7 | Other 54 | 0 / 0 / 54 | poll_wait 0, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_scene 43, webrender_render 2, poll_wait 1, memcpy_memset 1 |
| Compositor | 42 | 1.4 | Idle 42, Other 1 | 0 / 0 / 42 | ipc 42, poll_wait 42, webrender_render 0, paint_layout 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 0 | 0 / 0 / 10 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 18; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScriptEdge(js::B` 2; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 2; `MessageLoop::DoDelayedWork(base::TimeTicks*) [libxul.so]` 1; `[axiosozo-dev]` 1

**tab pid 3278** — 156 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 138 | 4.4 | Idle 99, Graphics 16, Layout 9, Profiler 6 | 0 / 4 / 134 | ipc 134, poll_wait 99, paint_layout 32, gc_cc 2 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 99; `[]` 2; `sendmsg [libc.so.6]` 2; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [libxul.so]` 1; `JS::GetFlowIdFromJSMicroTask(JSObject*, unsigned long*) [libxul.so]` 1; `[linux-vdso.so.1]` 1; `mozilla::gfx::Matrix4x4Typed<mozilla::gfx::UnknownUnits, mozilla::gfx:` 1; `mozilla::ScrollContainerFrame::BuildDisplayList(mozilla::nsDisplayList` 1

**tab pid 3201** — 1 ms CPU in the window

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

**tab pid 3219** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `std::_Rb_tree_rebalance_for_erase(std::_Rb_tree_node_base*, std::_Rb_t` 0

