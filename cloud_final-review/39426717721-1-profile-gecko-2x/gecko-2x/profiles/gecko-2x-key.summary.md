### gecko-2x key (profile pass)

**parent pid 3036** — 355 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 218 | 5.8 | Idle 44, Layout 44, GC / CC 31, Graphics 30 | 3 / 36 / 179 | ipc 218, paint_layout 76, poll_wait 68, gc_cc 50 |
| Renderer | 52 | 1.4 | Graphics 31, Idle 20 | 0 / 0 / 52 | ipc 50, webrender_render 31, webrender_sw_raster 26, poll_wait 23 |
| WRRenderBackend#0 | 21 | 0.6 | Other 21 | 0 / 0 / 21 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| Compositor | 20 | 0.5 | Idle 19, Other 1 | 0 / 0 / 20 | ipc 20, poll_wait 19, memcpy_memset 1, webrender_render 0 |
| SwComposite | 16 | 0.4 | Other 16 | 0 / 0 / 16 | webrender_render 16, poll_wait 13, memcpy_memset 3, webrender_sw_raster 3 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, webrender_render 1, memcpy_memset 0, array_buffer_copy 0 |
| IPC I/O Parent | 9 | 0.2 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 46; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `[axiosozo-dev]` 5; `mprotect [libc.so.6]` 4; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, nsPresCont` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `mozilla::dom::Document::IsRenderingSuppressed() const [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3

**tab pid 3304** — 77 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 69 | 1.8 | Idle 23, Other 10, JavaScript 8, GC / CC 8 | 0 / 10 / 59 | ipc 66, poll_wait 23, paint_layout 20, gc_cc 13 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 5; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 2; `getcontext [libc.so.6]` 1; `[]` 1; `nsBlockFrame::DoReflowInlineFrames(mozilla::BlockReflowState&, nsLineL` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1

**tab pid 3130** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, Other 0, JavaScript 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `mozilla::dom::Promise::MaybeResolve(JSContext*, JS::Handle<JS::Value>)` 0; `__strlen_avx2 [libc.so.6]` 0

**tab pid 3203** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsTimer::Cancel() [libxul.so]` 0

