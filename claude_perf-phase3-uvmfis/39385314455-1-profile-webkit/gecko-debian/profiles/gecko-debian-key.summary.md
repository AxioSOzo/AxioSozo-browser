### gecko-debian key (profile pass)

**parent pid 8069** — 551 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 344 | 9.2 | Idle 75, GC / CC 60, JavaScript 59, Other 55 | 9 / 63 / 273 | ipc 342, gc_cc 119, poll_wait 112, paint_layout 69 |
| DOM Worker | 86 | 2.3 | GC / CC 47, Idle 22, DOM 11, Other 4 | 0 / 12 / 74 | worker_messaging 84, ipc 84, gc_cc 59, poll_wait 23 |
| Renderer | 39 | 1.0 | Idle 26, Graphics 13 | 0 / 0 / 39 | ipc 39, poll_wait 26, webrender_render 13, webrender_sw_raster 12 |
| Compositor | 20 | 0.5 | Idle 18, Other 2 | 0 / 0 / 20 | ipc 20, poll_wait 18, memcpy_memset 1, webrender_scene 0 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 | poll_wait 0, webrender_render 0, webrender_scene 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, poll_wait 0 |
| Socket Thread | 9 | 0.2 | Other 9 | 0 / 0 / 9 | ipc 8, poll_wait 8 |
| IPC I/O Parent | 8 | 0.2 | Idle 7, Other 0 | 0 / 0 / 8 | poll_wait 7, ipc 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 99; `[axiosozo-dev]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `[unknown]` 8; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 6; `__memmove_evex_unaligned_erms [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4

**tab pid 8325** — 77 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 70 | 1.9 | Idle 27, Other 12, GC / CC 8, Graphics 8 | 0 / 7 / 63 | ipc 66, poll_wait 28, paint_layout 17, gc_cc 11 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 30; `[]` 2; `non-virtual thunk to nsGlobalWindowInner::Release() [libxul.so]` 1; `js::Proxy::getPrototype(JSContext*, JS::Handle<JSObject*>, JS::Mutable` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1; `mozilla::dom::FragmentOrElement::CanSkipInCC(nsINode*) [libxul.so]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1

**tab pid 8157** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.2 | Idle 8, DOM 0 | 0 / 0 / 8 | ipc 8, poll_wait 8, array_buffer_copy 0 |
| IPC I/O Child | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 8; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0

**tab pid 8262** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

