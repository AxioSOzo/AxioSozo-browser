### gecko-debian raf (profile pass)

**parent pid 8214** — 474 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 237 | 7.7 | Graphics 144, Idle 91, Profiler 1 | 0 / 0 / 237 | ipc 234, webrender_render 145, webrender_sw_raster 123, poll_wait 93 |
| GeckoMain | 63 | 2.1 | GC / CC 30, Idle 18, JavaScript 8, Other 5 | 2 / 6 / 55 | ipc 63, gc_cc 34, poll_wait 25, harness_diagnostics 6 |
| WRRenderBackend#0 | 55 | 1.8 | Other 55 | 0 / 0 / 55 | webrender_render 1, poll_wait 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 40 | 1.3 | Other 40 | 0 / 0 / 40 | webrender_scene 40, webrender_render 2, poll_wait 0, array_buffer_copy 0 |
| Compositor | 38 | 1.2 | Idle 37, Other 1 | 0 / 0 / 38 | ipc 38, poll_wait 37, webrender_render 0, paint_layout 0 |
| SwComposite | 24 | 0.8 | Other 24 | 0 / 0 / 24 | webrender_render 24, poll_wait 21, webrender_sw_raster 2, memcpy_memset 2 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 25; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScopeEdge(js::Sc` 2; `mozilla::ImplCycleCollectionTraverse(nsCycleCollectionTraversalCallbac` 2; `void js::gc::MarkingTracerT<6u>::markAndTraverse<js::BaseScript>(js::B` 2; `nsIContent::GetEventTargetParent(mozilla::EventChainPreVisitor&) [libx` 1; `next (self-hosted:4688:25)[8]` 1

**tab pid 8469** — 164 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 150 | 4.9 | Idle 97, Layout 13, Graphics 13, Other 9 | 0 / 10 / 140 | ipc 143, poll_wait 99, paint_layout 34, gc_cc 8 |
| IPC I/O Child | 13 | 0.4 | Idle 13, Other 0 | 0 / 0 / 13 | poll_wait 13, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 102; `[]` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 2; `mozilla::DisplayItemClip::operator==(mozilla::DisplayItemClip const&) ` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::dom::XrayFindOwnPropertyInfo(JSContext*, mozilla::dom::DOMObj` 1; `RemoveSkippableVisitor::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [` 1; `nsIContent::GetFlattenedTreeParent() const [libxul.so]` 1

**tab pid 8509** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0

**tab pid 8381** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

