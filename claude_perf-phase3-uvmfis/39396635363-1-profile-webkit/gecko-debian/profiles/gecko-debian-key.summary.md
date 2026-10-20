### gecko-debian key (profile pass)

**parent pid 8204** — 299 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 195 | 5.2 | Idle 45, Layout 38, GC / CC 31, Other 23 | 3 / 31 / 161 | ipc 195, poll_wait 67, paint_layout 63, gc_cc 42 |
| Renderer | 38 | 1.0 | Idle 20, Graphics 17 | 0 / 0 / 38 | ipc 38, poll_wait 22, webrender_render 17, webrender_sw_raster 14 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 | webrender_render 0, array_buffer_copy 0 |
| Compositor | 17 | 0.5 | Idle 16, Other 1 | 0 / 0 / 17 | ipc 17, poll_wait 16, memcpy_memset 1, webrender_render 0 |
| WRSceneBuilder#0 | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_scene 13, webrender_render 0 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 1 | 0 / 0 / 7 | poll_wait 7, ipc 1, memcpy_memset 0 |
| SwComposite | 6 | 0.2 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 6 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 51; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `[axiosozo-dev]` 4; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `__memset_evex_unaligned_erms [libc.so.6]` 3

**tab pid 8434** — 69 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 63 | 1.7 | Idle 23, Layout 9, Other 9, GC / CC 8 | 0 / 9 / 54 | ipc 57, poll_wait 24, paint_layout 13, gc_cc 10 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 25; `[]` 3; `[unknown]` 2; `js::GetProperty(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS::Valu` 1; `pthread_mutexattr_init@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `mozilla::ResetDirectionSetByTextNode(mozilla::dom::Text*, mozilla::dom` 1; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 1

**tab pid 8293** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 0, Other 0, DOM 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Profiler 0, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libglib-2.0.so.0]` 0; `mozilla::dom::CallSetup::GetActiveGlobalObjectForCall(JS::Handle<JSObj` 0; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 0; `mozilla::dom::JSIPCValueUtils::ToJSVal(JSContext*, mozilla::dom::JSIPC` 0; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 0

**tab pid 8384** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

