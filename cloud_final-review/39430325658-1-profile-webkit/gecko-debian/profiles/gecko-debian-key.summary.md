### gecko-debian key (profile pass)

**parent pid 8213** — 327 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 218 | 5.8 | Idle 44, Layout 39, GC / CC 34, JavaScript 31 | 2 / 34 / 181 | ipc 218, paint_layout 72, poll_wait 68, gc_cc 55 |
| Renderer | 36 | 1.0 | Idle 22, Graphics 15 | 0 / 0 / 36 | ipc 36, poll_wait 22, webrender_render 15, webrender_sw_raster 11 |
| WRRenderBackend#0 | 20 | 0.5 | Other 20 | 0 / 0 / 20 | webrender_render 0, poll_wait 0 |
| Compositor | 20 | 0.5 | Idle 19, Other 1 | 0 / 0 / 20 | ipc 20, poll_wait 19, memcpy_memset 1, webrender_render 0 |
| WRSceneBuilder#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_scene 15, webrender_render 1, paint_layout 0, memcpy_memset 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 1, Profiler 0 | 0 / 0 / 10 | poll_wait 9, ipc 1 |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 4, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 52; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `[axiosozo-dev]` 5; `[unknown]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit::CacheIRW` 3; `mprotect [libc.so.6]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3

**tab pid 8455** — 77 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 70 | 1.8 | Idle 26, GC / CC 8, JavaScript 8, DOM 6 | 0 / 10 / 60 | ipc 67, poll_wait 26, paint_layout 18, gc_cc 13 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0, Profiler 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 27; `[]` 2; `mozilla::dom::FragmentOrElement::cycleCollection::TraverseNative(void*` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `__strlen_avx2 [libc.so.6]` 2; `PLDHashTable::Search(void const*) const [libxul.so]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `Pickle::Pickle(unsigned int, unsigned long) [libxul.so]` 1

**tab pid 8302** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0, Other 0, DOM 0 | 0 / 0 / 7 | ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `pthread_once@GLIBC_2.2.5 [libc.so.6]` 0; `[]` 0; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*>, JS::Han` 0; `js::Nursery::reallocateBuffer(JS::Zone*, js::gc::Cell*, void*, unsigne` 0; `mozilla::cyclecollector::HoldJSObjectsWithKeyImpl(void*, nsScriptObjec` 0; `mozilla::dom::Promise::Create(nsIGlobalObject*, mozilla::ErrorResult&,` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0

**tab pid 8379** — 1 ms CPU in the window

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

