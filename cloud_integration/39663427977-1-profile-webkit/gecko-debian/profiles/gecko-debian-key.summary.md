### gecko-debian key (profile pass)

**parent pid 8177** — 211 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 126 | 3.4 | Idle 40, Layout 24, Graphics 19, Other 17 | 3 / 19 / 104 | ipc 123, poll_wait 50, paint_layout 44, gc_cc 8 |
| Renderer | 30 | 0.8 | Idle 19, Graphics 11, Other 1 | 0 / 0 / 30 | ipc 30, poll_wait 19, webrender_render 11, webrender_sw_raster 7 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | memcpy_memset 0, webrender_render 0 |
| Compositor | 14 | 0.4 | Idle 13, Other 1 | 0 / 0 / 14 | ipc 14, poll_wait 13, memcpy_memset 1, webrender_render 0 |
| WRSceneBuilder#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 | webrender_scene 11, webrender_render 1, memcpy_memset 0, paint_layout 0 |
| IPC I/O Parent | 6 | 0.2 | Idle 6, Profiler 0, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 5, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 42; `[axiosozo-dev]` 5; `[unknown]` 4; `nsIFrame::DisplayBorderBackgroundOutline(mozilla::nsDisplayListBuilder` 2; `mozilla::nsDisplayContainer::~nsDisplayContainer() [libxul.so]` 2; `[linux-vdso.so.1]` 2; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 2; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<nsFrameList` 2

**tab pid 8424** — 61 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 56 | 1.5 | Idle 24, Layout 9, GC / CC 7, JavaScript 6 | 0 / 7 / 48 | ipc 55, poll_wait 25, paint_layout 13, gc_cc 9 |
| IPC I/O Child | 5 | 0.1 | Idle 5, Other 0, Profiler 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 25; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `mozilla::layers::ClipManager::SwitchItem(mozilla::nsDisplayListBuilder` 1; `mozilla::dom::FragmentOrElement::cycleCollection::TraverseNative(void*` 1; `nsWindowRoot::AddRef() [libxul.so]` 1; `nsINode::DisconnectChild(nsIContent*) [libxul.so]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `mozilla::net::nsStandardURL::GetRef(nsTSubstring<char>&) [libxul.so]` 1

**tab pid 8267** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 1, Other 0, DOM 0 | 0 / 1 / 6 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::PropertyKe` 0; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<mozilla::bas` 0; `js::RunScript(JSContext*, js::RunState&) [libxul.so]` 0; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeBarePt` 0; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 0; `JS_IsExceptionPending(JSContext*) [libxul.so]` 0; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 0

**tab pid 8342** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 1 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

