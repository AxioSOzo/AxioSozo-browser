### gecko-2x key (profile pass)

**parent pid 3067** — 307 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 196 | 5.2 | Idle 42, Layout 42, JavaScript 31, GC / CC 30 | 2 / 33 / 160 | ipc 196, paint_layout 71, poll_wait 57, gc_cc 49 |
| Renderer | 43 | 1.1 | Idle 22, Graphics 22 | 0 / 0 / 43 | ipc 43, poll_wait 22, webrender_render 22, webrender_sw_raster 18 |
| WRRenderBackend#0 | 16 | 0.4 | Other 16 | 0 / 0 / 16 | webrender_render 0 |
| Compositor | 16 | 0.4 | Idle 16, Other 0 | 0 / 0 / 16 | ipc 16, poll_wait 16, paint_layout 0, webrender_render 0 |
| WRSceneBuilder#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | webrender_scene 12, webrender_render 1, memcpy_memset 0, paint_layout 0 |
| SwComposite | 10 | 0.3 | Other 10 | 0 / 0 / 10 | webrender_render 10, poll_wait 8, webrender_sw_raster 2, memcpy_memset 1 |
| IPC I/O Parent | 9 | 0.2 | Idle 8, Other 1, Profiler 0 | 0 / 0 / 9 | poll_wait 8, ipc 1 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 42; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 5; `[unknown]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `mprotect [libc.so.6]` 4; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozilla::LayoutF` 3; `recvmsg [libc.so.6]` 3

**tab pid 3307** — 68 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 62 | 1.6 | Idle 24, GC / CC 9, JavaScript 8, Other 8 | 0 / 9 / 53 | ipc 60, poll_wait 25, paint_layout 12, gc_cc 12 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 24; `sendmsg [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `[]` 1; `mozilla::dom::NodeInfo::HTMLTag() const [libxul.so]` 1; `nsWindowRoot::AddRef() [libxul.so]` 1; `nsWrapperCache::ReleaseWrapper(void*) [libxul.so]` 1; `nsStyledElement::QueryInterface(nsID const&, void**) [libxul.so]` 1

**tab pid 3165** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 1, JavaScript 0, DOM 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[linux-vdso.so.1]` 0; `XPCJSContext::BeforeProcessTask(bool) [libxul.so]` 0; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 0; `mozilla::dom::WindowGlobalChild::IsCurrentGlobal() [libxul.so]` 0; `PLDHashTable::Iterator::Iterator(PLDHashTable*) [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0

**tab pid 3261** — 1 ms CPU in the window

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

