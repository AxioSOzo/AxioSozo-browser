### gecko key (profile pass)

**parent pid 3048** — 267 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 177 | 4.7 | Layout 38, Idle 37, GC / CC 28, Other 24 | 1 / 29 / 147 | ipc 177, paint_layout 59, poll_wait 56, gc_cc 39 |
| Renderer | 32 | 0.8 | Idle 19, Graphics 12, Other 1 | 0 / 0 / 32 | ipc 32, poll_wait 20, webrender_render 12, webrender_sw_raster 9 |
| Compositor | 16 | 0.4 | Idle 14, Other 1, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 14, memcpy_memset 1, webrender_render 0 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 0 |
| WRSceneBuilder#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | webrender_scene 12, webrender_render 1, poll_wait 0, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.2 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 39; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 6; `recvmsg [libc.so.6]` 3; `style::properties::cascade::Declarations::note_declaration [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `[axiosozo-dev]` 2

**tab pid 3312** — 63 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 57 | 1.5 | Idle 22, Other 11, GC / CC 7, JavaScript 5 | 1 / 5 / 51 | ipc 55, poll_wait 22, paint_layout 14, gc_cc 11 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 22; `sendmsg [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `mozilla::EventDispatcher::Dispatch(mozilla::dom::EventTarget*, nsPresC` 1; `mozilla::dom::EventTarget::NonVirtualRelease() [libxul.so]` 1; `[linux-vdso.so.1]` 1; `nsTHashtable<nsBaseHashtableET<nsGenericHashKey<mojo::core::ports::Nod` 1; `mozilla::widget::GfxInfoBase::GetCodecSupportInfo(nsTSubstring<char>&)` 1

**tab pid 3153** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.1 | Idle 5, JavaScript 0, Profiler 0 | 0 / 0 / 5 | ipc 5, poll_wait 5, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `[linux-vdso.so.1]` 0; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<geckoprofile` 0; `js::jit::GetPropIRGenerator::tryAttachStub() [libxul.so]` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*, js::Maybe` 0

**tab pid 3247** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `XPCJSContext::AfterProcessTask(unsigned int) [libxul.so]` 0

