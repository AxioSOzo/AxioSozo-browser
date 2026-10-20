### chromium switch-to-gecko (profile pass)

**parent pid 3133** — 195 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 134 | 0.8 | GC / CC 73, Idle 20, JavaScript 13, Layout 11 | 1 / 23 / 110 | ipc 134, gc_cc 82, poll_wait 23, paint_layout 19 |
| DOM Worker | 31 | 0.2 | Other 13, GC / CC 13, JavaScript 4, Idle 1 | 0 / 0 / 31 | subprocess_pipe_io 31, worker_messaging 31, ipc 31, gc_cc 27 |
| Renderer | 8 | 0.1 | Graphics 7, Idle 1 | 0 / 0 / 8 | ipc 8, webrender_render 7, webrender_sw_raster 7, poll_wait 2 |
| BgIOThreadPool #1 | 6 | 0.0 | Other 6, Idle 1 | 0 / 0 / 6 | ipc 6, poll_wait 1 |
| IPC I/O Parent | 5 | 0.0 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Compositor | 3 | 0.0 | Idle 2, Other 1 | 0 / 0 / 3 | ipc 3, poll_wait 2, memcpy_memset 1 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 20; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 14; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `mozilla::nsDisplayOpacity::CanMerge(mozilla::nsDisplayItem const*) con` 4; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 4; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 3

**tab pid 3317** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.0 | Idle 3, DOM 1, JavaScript 1, Other 0 | 0 / 2 / 3 | ipc 5, poll_wait 3, gc_cc 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `nsGenericHTMLElement::UnbindFromTree(mozilla::dom::UnbindContext&) [li` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 1; `mozilla::dom::Promise::CreateWrapper(mozilla::ErrorResult&, mozilla::d` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::ipc::IdleSchedulerChild::SetActive() [libxul.so]` 0; `mozilla::CCGCScheduler::MaybePokeCC(mozilla::TimeStamp, unsigned int) ` 0

**tab pid 3811** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Other 0, Layout 0, Graphics 0 | 0 / 0 / 4 | ipc 3, poll_wait 3, paint_layout 1, canvas_2d 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `[]` 0; `mozilla::layout::TextDrawTarget::~TextDrawTarget() [libxul.so]` 0; `mozilla::ScrollContainerFrame::HandleScrollbarStyleSwitching() [libxul` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::ViewportUtils::VisualToLayout(nsRect const&, mozilla::PresShe` 0; `mozilla::dom::FontFaceSetImpl::CheckLoadingFinished() [libxul.so]` 0

**tab pid 3299** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.0 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 0

