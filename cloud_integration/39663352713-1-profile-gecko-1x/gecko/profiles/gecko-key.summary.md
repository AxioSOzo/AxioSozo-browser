### gecko key (profile pass)

**parent pid 2911** — 279 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 179 | 4.8 | Idle 45, Layout 34, GC / CC 25, Other 24 | 1 / 25 / 153 | ipc 178, poll_wait 66, paint_layout 57, gc_cc 37 |
| Renderer | 35 | 0.9 | Idle 19, Graphics 16, Other 0 | 0 / 0 / 35 | ipc 35, poll_wait 22, webrender_render 16, webrender_sw_raster 14 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 0 |
| Compositor | 16 | 0.4 | Idle 15, Other 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, webrender_render 0, canvas_2d 0 |
| WRSceneBuilder#0 | 13 | 0.4 | Other 13, Profiler 0 | 0 / 0 / 13 | webrender_scene 13, webrender_render 1, poll_wait 0 |
| IPC I/O Parent | 8 | 0.2 | Idle 7, Other 0, Profiler 0 | 0 / 0 / 8 | poll_wait 7, ipc 0 |
| SwComposite | 6 | 0.2 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 5, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 45; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `syscall [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `[libgdk-3.so.0]` 3; `[axiosozo-dev]` 2; `mozilla::SizeComputationInput::InitOffsets(mozilla::WritingMode, int, ` 2

**tab pid 3176** — 69 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 63 | 1.7 | Idle 25, Layout 10, Other 7, JavaScript 6 | 0 / 6 / 58 | ipc 59, poll_wait 27, paint_layout 18, gc_cc 10 |
| IPC I/O Child | 6 | 0.2 | Idle 6 | 0 / 0 / 6 | poll_wait 6 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 25; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsFrameMessageManager::cycleCollection::TraverseNative(void*, nsCycleC` 1; `style::invalidation::element::relative_selector::RelativeSelectorInval` 1; `mozilla::ScrollContainerFrame::QueryFrame(nsQueryFrame::FrameIID) cons` 1

**tab pid 3013** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 1, DOM 0, Other 0 | 0 / 1 / 5 | ipc 6, poll_wait 5, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `read [libc.so.6]` 0; `js::GetElementsWithAdder(JSContext*, JS::Handle<JSObject*>, JS::Handle` 0; `js::ElementAdder::append(JSContext*, JS::Handle<JS::Value>) [libxul.so` 0; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*, JS::Hand` 0; `js::fun_apply(JSContext*, unsigned int, JS::Value*) [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `mozilla::dom::GetPerInterfaceObjectHandle(JSContext*, unsigned long, v` 0

**tab pid 3110** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

