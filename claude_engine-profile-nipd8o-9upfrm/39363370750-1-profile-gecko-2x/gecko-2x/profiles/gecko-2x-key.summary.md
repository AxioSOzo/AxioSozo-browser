### gecko-2x key (profile pass)

**parent pid 3089** — 374 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 223 | 5.9 | Layout 49, Idle 47, JavaScript 34, GC / CC 32 | 2 / 37 / 184 | ipc 222, paint_layout 78, poll_wait 68, gc_cc 52 |
| Renderer | 57 | 1.5 | Graphics 33, Idle 25 | 0 / 0 / 57 | ipc 57, webrender_render 33, webrender_sw_raster 28, poll_wait 26 |
| WRRenderBackend#0 | 23 | 0.6 | Other 23 | 0 / 0 / 23 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 21 | 0.6 | Idle 21, Other 0, Profiler 0 | 0 / 0 / 21 | ipc 21, poll_wait 21, paint_layout 0, webrender_scene 0 |
| WRSceneBuilder#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_scene 15, webrender_render 0 |
| SwComposite | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 12, memcpy_memset 3, webrender_sw_raster 3 |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 1 | 0 / 0 / 10 | poll_wait 10, ipc 1, memcpy_memset 0 |
| DOM Worker | 3 | 0.1 | GC / CC 3, Idle 0 | 0 / 0 / 3 | worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2 |

Main thread, top self: `poll [libc.so.6]` 47; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `[unknown]` 6; `mprotect [libc.so.6]` 5; `AnchorResolvedMarginHelper::FromUnresolved(mozilla::StyleGenericMargin` 4; `mozilla::nsDisplayItem::nsDisplayItem(mozilla::nsDisplayListBuilder*, ` 4; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 3; `mozilla::dom::ToJSValue(JSContext*, mozilla::dom::WindowProxyHolder co` 3

**tab pid 3330** — 68 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 60 | 1.6 | Idle 26, Other 11, JavaScript 8, Layout 5 | 0 / 7 / 52 | ipc 57, poll_wait 26, paint_layout 17, gc_cc 3 |
| IPC I/O Child | 8 | 0.2 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 26; `sendmsg [libc.so.6]` 6; `[]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 1; `non-virtual thunk to nsGlobalWindowInner::GetExistingDebuggerNotificat` 1; `webrtc::SampleCounter::NumSamples() const [libxul.so]` 1; `mozilla::dom::FrameRequestCallback::Call(mozilla::dom::BindingCallCont` 1; `nsRect nsLayoutUtils::ScaleThenRoundGfxRectToAppRect<mozilla::gfx::Rec` 1

**tab pid 3188** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 1, JavaScript 1, DOM 0 | 0 / 0 / 7 | ipc 7, poll_wait 6, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `syscall [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 0; `mozilla::dom::MessageListener::ReceiveMessage(mozilla::dom::BindingCal` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0

**tab pid 3233** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsTArray_base<nsTArray_RelocateUsingMemutils>::MoveInit(nsTArray_base<` 0

