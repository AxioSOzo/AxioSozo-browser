### gecko-2x key (profile pass)

**parent pid 3043** — 324 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 203 | 5.4 | Idle 46, Layout 42, JavaScript 33, GC / CC 31 | 3 / 34 / 165 | ipc 203, poll_wait 67, paint_layout 63, gc_cc 46 |
| Renderer | 46 | 1.2 | Graphics 26, Idle 20, Other 1 | 0 / 0 / 46 | ipc 46, webrender_render 26, poll_wait 24, webrender_sw_raster 20 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 0 |
| Compositor | 17 | 0.5 | Idle 17, Other 1, Profiler 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 13 | 0.3 | Other 13 | 0 / 0 / 13 | webrender_scene 13, webrender_render 0, gc_cc 0, array_buffer_copy 0 |
| SwComposite | 13 | 0.3 | Other 13 | 0 / 0 / 13 | webrender_render 13, poll_wait 10, memcpy_memset 2, webrender_sw_raster 2 |
| IPC I/O Parent | 9 | 0.2 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 48; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `[axiosozo-dev]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `mprotect [libc.so.6]` 4; `mozilla::detail::ConditionVariableImpl::wait_for(mozilla::detail::Mute` 2; `recvmsg [libc.so.6]` 2; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozilla::LayoutF` 2

**tab pid 3285** — 71 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 64 | 1.7 | Idle 20, Other 14, Layout 9, JavaScript 8 | 1 / 7 / 57 | ipc 58, poll_wait 21, paint_layout 15, gc_cc 13 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 20; `[]` 3; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 2; `sendmsg [libc.so.6]` 2; `nsQueryInterfaceISupports::operator()(nsID const&, void**) const [libx` 1; `nsLayoutUtils::GetTransformToAncestorScale(nsIFrame const*) [libxul.so` 1; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::CycleCollec` 1; `nsTextFrame::PropertyProvider::InitTextAutospace() [libxul.so]` 1

**tab pid 3133** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, Other 1, DOM 0, JavaScript 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0; `read [libc.so.6]` 0; `mozilla::ipc::MessageChannel::DispatchAsyncMessage(mozilla::ipc::Actor` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `[unknown]` 0; `nsComponentManagerImpl::GetServiceLocked(mozilla::Maybe<mozilla::Monit` 0

**tab pid 3211** — 1 ms CPU in the window

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

