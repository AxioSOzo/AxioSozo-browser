### gecko key (profile pass)

**parent pid 3041** — 308 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 205 | 5.4 | Idle 44, GC / CC 33, Layout 33, Graphics 31 | 0 / 34 / 171 | ipc 205, paint_layout 73, poll_wait 67, gc_cc 49 |
| Renderer | 35 | 0.9 | Idle 20, Graphics 16 | 0 / 0 / 35 | ipc 35, poll_wait 20, webrender_render 16, webrender_sw_raster 14 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 | memcpy_memset 0, poll_wait 0 |
| Compositor | 18 | 0.5 | Idle 17, Other 1 | 0 / 0 / 18 | ipc 18, poll_wait 17, memcpy_memset 0, paint_layout 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, webrender_render 1 |
| IPC I/O Parent | 9 | 0.2 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 3, memcpy_memset 1, webrender_sw_raster 1 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 45; `[axiosozo-dev]` 11; `recvmsg [libc.so.6]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `mprotect [libc.so.6]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 3

**tab pid 3294** — 72 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 65 | 1.7 | Idle 24, Other 10, GC / CC 8, JavaScript 7 | 0 / 6 / 59 | ipc 60, poll_wait 24, paint_layout 16, gc_cc 13 |
| IPC I/O Child | 7 | 0.2 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 24; `sendmsg [libc.so.6]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `syscall [libc.so.6]` 2; `[]` 1; `[linux-vdso.so.1]` 1; `nsFont::CalcDifference(nsFont const&) const [libxul.so]` 1; `mozilla::dom::Document::NotifyPossibleTitleChange(bool) [libxul.so]` 1

**tab pid 3130** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, JavaScript 0, DOM 0, Other 0 | 0 / 1 / 6 | ipc 6, poll_wait 6, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `xpc::JSXrayTraits::resolveOwnProperty(JSContext*, JS::Handle<JSObject*` 0; `js::jit::CacheIRWriter::loadArgumentDynamicSlot_(js::jit::Int32Operand` 0; `mozilla::dom::ToJSValue(JSContext*, mozilla::dom::WindowProxyHolder co` 0; `mozilla::dom::MessageListener::ReceiveMessage(mozilla::dom::BindingCal` 0; `[]` 0; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 0

**tab pid 3296** — 1 ms CPU in the window

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

