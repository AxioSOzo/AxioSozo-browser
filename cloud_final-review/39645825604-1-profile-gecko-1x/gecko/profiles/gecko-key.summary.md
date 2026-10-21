### gecko key (profile pass)

**parent pid 3126** — 306 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 204 | 5.4 | Layout 44, Idle 43, GC / CC 31, Other 26 | 3 / 29 / 172 | ipc 204, paint_layout 72, poll_wait 65, gc_cc 49 |
| Renderer | 35 | 0.9 | Idle 20, Graphics 16 | 0 / 0 / 35 | ipc 35, poll_wait 22, webrender_render 16, webrender_sw_raster 14 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 0 |
| Compositor | 18 | 0.5 | Idle 18, Other 0, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 18, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, webrender_render 1, poll_wait 1, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.2 | Idle 8, Other 1 | 0 / 0 / 9 | poll_wait 8, ipc 1 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 48; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `recvmsg [libc.so.6]` 5; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozilla::LayoutF` 4; `nsIFrame::GetUsedMargin() const [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3

**tab pid 3359** — 71 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 64 | 1.7 | Idle 27, JavaScript 8, Layout 8, GC / CC 7 | 0 / 6 / 58 | ipc 59, poll_wait 28, paint_layout 14, gc_cc 13 |
| IPC I/O Child | 7 | 0.2 | Idle 6, Profiler 0, Other 0 | 0 / 0 / 7 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 28; `sendmsg [libc.so.6]` 3; `[]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `JS::loader::LoadContextBase::QueryInterface(nsID const&, void**) [libx` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1

**tab pid 3212** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 0, JavaScript 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `write [libc.so.6]` 0; `recvRunListener/< (resource://gre/modules/ExtensionChild.sys.mjs:878:1` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `__lll_lock_wait [libc.so.6]` 0; `JSStructuredCloneReader::JSStructuredCloneReader(js::SCInput&, JS::Str` 0; `nsAppShell::EventProcessorCallback(_GIOChannel*, GIOCondition, void*) ` 0

**tab pid 3284** — 1 ms CPU in the window

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

