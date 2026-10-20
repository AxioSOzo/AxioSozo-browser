### gecko-2x key (profile pass)

**parent pid 3036** — 272 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 170 | 4.5 | Idle 39, Layout 34, GC / CC 25, JavaScript 25 | 1 / 26 / 143 | ipc 170, paint_layout 58, poll_wait 57, gc_cc 38 |
| Renderer | 40 | 1.1 | Graphics 21, Idle 19 | 0 / 0 / 40 | ipc 40, poll_wait 21, webrender_render 21, webrender_sw_raster 16 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 15 | 0.4 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 14, paint_layout 0, webrender_render 0 |
| WRSceneBuilder#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 | webrender_scene 11, webrender_sw_raster 0 |
| SwComposite | 10 | 0.3 | Other 10 | 0 / 0 / 10 | webrender_render 10, poll_wait 10, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 8 | 0.2 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 41; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `mprotect [libc.so.6]` 5; `[axiosozo-dev]` 4; `__strcmp_avx2 [libc.so.6]` 3; `[unknown]` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisplayListBui` 3; `bool mozilla::FrameProperties::Remove<nsTextFrame>(mozilla::FramePrope` 2

**tab pid 3278** — 60 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 54 | 1.4 | Idle 22, GC / CC 8, Other 8, JavaScript 5 | 0 / 6 / 48 | ipc 49, poll_wait 23, paint_layout 12, gc_cc 10 |
| IPC I/O Child | 6 | 0.1 | Idle 5, Other 0 | 0 / 0 / 6 | poll_wait 5, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 22; `sendmsg [libc.so.6]` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 3; `[]` 2; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*, js::Maybe` 2; `std::io::impls::<impl std::io::Write for &mut W>::write_all [libxul.so` 1; `mozilla::dom::Element::RemoveFromIdTable() [libxul.so]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 1

**tab pid 3126** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.1 | Idle 5, JavaScript 0, Other 0, DOM 0 | 0 / 0 / 5 | ipc 5, poll_wait 5, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `nsThread::DoMainThreadSpecificProcessing() const [libxul.so]` 0; `mozilla::dom::WindowGlobalChild_Binding::get_isCurrentGlobal(JSContext` 0; `js::ForwardingProxyHandler::isCallable(JSObject*) const [libxul.so]` 0; `nsDocShell::EnsureScriptEnvironment() [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3180** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

