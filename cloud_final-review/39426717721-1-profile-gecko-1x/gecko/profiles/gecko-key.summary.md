### gecko key (profile pass)

**parent pid 2850** — 395 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 261 | 6.9 | Layout 48, Idle 46, Other 45, GC / CC 40 | 5 / 30 / 225 | ipc 261, paint_layout 89, poll_wait 88, gc_cc 60 |
| Renderer | 42 | 1.1 | Idle 22, Graphics 21 | 0 / 0 / 42 | ipc 42, poll_wait 22, webrender_render 21, webrender_sw_raster 15 |
| WRRenderBackend#0 | 29 | 0.8 | Other 28, Profiler 0 | 0 / 0 / 29 | webrender_render 0, memcpy_memset 0 |
| Compositor | 24 | 0.6 | Idle 23, Other 1, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 23, memcpy_memset 1, webrender_render 0 |
| WRSceneBuilder#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_scene 18, webrender_render 1, paint_layout 0, array_buffer_copy 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| SwComposite | 6 | 0.2 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 5, webrender_sw_raster 1, memcpy_memset 1 |
| Timer | 3 | 0.1 | Other 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |

Main thread, top self: `poll [libc.so.6]` 46; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `recvmsg [libc.so.6]` 7; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 7; `[unknown]` 6; `[axiosozo-dev]` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `__memcmp_evex_movbe [libc.so.6]` 3

**tab pid 3112** — 102 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 92 | 2.4 | Idle 30, GC / CC 15, Other 14, JavaScript 11 | 0 / 12 / 81 | ipc 87, poll_wait 30, paint_layout 24, gc_cc 20 |
| IPC I/O Child | 9 | 0.2 | Idle 8, Other 0 | 0 / 0 / 9 | poll_wait 8, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 30; `sendmsg [libc.so.6]` 5; `[]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `mozilla::BlockReflowState::ClearFloats(int, mozilla::UsedClear, nsIFra` 1; `[unknown]` 1; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry const*) [lib` 1; `getcontext [libc.so.6]` 1

**tab pid 2940** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.2 | Idle 8, JavaScript 1, Other 0, Profiler 0 | 0 / 0 / 9 | ipc 9, poll_wait 8, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `mozilla::dom::IsJSAPIActive() [libxul.so]` 0; `xpc::XrayTraits::getExpandoObject(JSContext*, JS::Handle<JSObject*>, J` 0; `js::NewObjectWithGivenTaggedProto(JSContext*, JSClass const*, JS::Hand` 0; `__lll_lock_wait [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<mozilla::Prof` 0

**tab pid 3115** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

