### gecko-debian key (profile pass)

**parent pid 8124** — 303 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 203 | 5.4 | Layout 47, Idle 44, GC / CC 31, Other 26 | 1 / 28 / 174 | ipc 200, paint_layout 71, poll_wait 64, gc_cc 45 |
| Renderer | 35 | 0.9 | Idle 21, Graphics 14 | 0 / 0 / 35 | ipc 35, poll_wait 22, webrender_render 14, webrender_sw_raster 11 |
| Compositor | 17 | 0.5 | Idle 16, Other 1 | 0 / 0 / 17 | ipc 17, poll_wait 16, memcpy_memset 1, webrender_render 0 |
| WRRenderBackend#0 | 17 | 0.4 | Other 17 | 0 / 0 / 17 | memcpy_memset 0, webrender_render 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, webrender_render 2, poll_wait 1, paint_layout 0 |
| IPC I/O Parent | 9 | 0.2 | Idle 9, Other 1 | 0 / 0 / 9 | poll_wait 9, ipc 1 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 51; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `[axiosozo-dev]` 5; `[unknown]` 3; `[linux-vdso.so.1]` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, mozilla::W` 3

**tab pid 8377** — 73 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 66 | 1.8 | Idle 25, Other 8, GC / CC 8, JavaScript 7 | 0 / 7 / 59 | ipc 60, poll_wait 25, paint_layout 16, gc_cc 10 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 7, ipc 0, gc_cc 0 |
| Timer | 1 | 0.0 | Other 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 26; `[]` 5; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisplayListBui` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*, JS::Handl` 1; `js::LifoAlloc::release(js::LifoAlloc::Mark) [libxul.so]` 1; `JS::GetTenuredGCThingZone(JS::GCCellPtr) [libxul.so]` 1; `bool TraversalTracer::onEdge<js::GetterSetter>(js::GetterSetter**, cha` 1

**tab pid 8211** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, JavaScript 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[8]` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 0; `[]` 0; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObject*) [libxu` 0

**tab pid 8293** — 1 ms CPU in the window

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

