### gecko-2x key (profile pass)

**parent pid 2846** — 308 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 184 | 4.9 | Idle 40, Layout 34, GC / CC 28, Graphics 27 | 3 / 27 / 154 | ipc 182, paint_layout 64, poll_wait 58, gc_cc 34 |
| Renderer | 49 | 1.3 | Idle 25, Graphics 24, Other 0 | 0 / 0 / 49 | ipc 49, poll_wait 29, webrender_render 24, webrender_sw_raster 17 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 | webrender_render 0, memcpy_memset 0, webrender_scene 0 |
| SwComposite | 17 | 0.4 | Other 17 | 0 / 0 / 17 | webrender_render 17, poll_wait 11, memcpy_memset 6, webrender_sw_raster 6 |
| Compositor | 16 | 0.4 | Idle 16, Other 0 | 0 / 0 / 16 | ipc 16, poll_wait 16, webrender_scene 0, paint_layout 0 |
| WRSceneBuilder#0 | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_scene 13, memcpy_memset 0 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 41; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `mozilla::dom::ResizeObservation::IsActive() const [libxul.so]` 3; `gfxFontGroup::GetUnderlineOffset() [libxul.so]` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `getcontext [libc.so.6]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 2

**tab pid 3106** — 70 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 63 | 1.7 | Idle 25, Layout 10, Other 9, JavaScript 8 | 0 / 9 / 55 | ipc 60, poll_wait 25, paint_layout 14, gc_cc 10 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 25; `sendmsg [libc.so.6]` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `[]` 1; `mozilla::dom::FragmentOrElement::cycleCollection::TraverseNative(void*` 1; `mozilla::IMEContentObserver::TryToFlushPendingNotifications(bool) [lib` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 2956** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, Other 1, JavaScript 1, DOM 1 | 0 / 1 / 6 | ipc 7, poll_wait 5, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0; `mozilla::ipc::MessageChannel::DispatchAsyncMessage(mozilla::ipc::Actor` 0; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 0; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `[unknown]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0

**tab pid 3004** — 1 ms CPU in the window

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

