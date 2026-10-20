### chromium-2x raf (profile pass)

**parent pid 3347** — 3808 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1567 | 49.3 | JavaScript 611, Idle 387, Other 224, DOM 219 | 283 / 618 / 665 | ipc 1567, worker_messaging 534, paint_layout 498, frame_surface_paint 480 |
| DOM Worker | 980 | 30.8 | JavaScript 874, Other 68, Profiler 28, GC / CC 9 | 0 / 0 / 980 | subprocess_pipe_io 980, worker_messaging 980, ipc 980, js_ctypes 609 |
| Renderer | 572 | 18.0 | Graphics 328, Idle 245, Other 0 | 0 / 0 / 572 | ipc 572, webrender_render 328, webrender_sw_raster 288, poll_wait 262 |
| SwComposite | 530 | 16.7 | Other 530 | 0 / 0 / 530 | webrender_render 530, poll_wait 289, webrender_sw_raster 231, memcpy_memset 32 |
| WRRenderBackend#0 | 72 | 2.3 | Other 72 | 0 / 0 / 72 | webrender_render 1 |
| Compositor | 42 | 1.3 | Idle 41, Other 1, Profiler 0 | 0 / 0 / 42 | ipc 41, poll_wait 41, webrender_render 0, webrender_scene 0 |
| Timer | 28 | 0.9 | Other 28 | 0 / 0 / 28 | ipc 28, poll_wait 28 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14 |

Main thread, top self: `poll [libc.so.6]` 394; `__memmove_avx_unaligned_erms [libc.so.6]` 379; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 262; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned char const*, ` 76; `[axiosozo-dev]` 32; `[unknown]` 23; `recvmsg [libc.so.6]` 18; `write [libc.so.6]` 17

**tab pid 3538** — 12 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 11 | 0.4 | GC / CC 9, Idle 2, Other 0 | 0 / 0 / 11 | ipc 10, gc_cc 9, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `poll [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 1; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `__lll_lock_wake [libc.so.6]` 1; `JS::GCCellPtr::outOfLineKind() const [libxul.so]` 1

**tab pid 4001** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 3, Idle 3, Other 0 | 0 / 0 / 6 | ipc 5, gc_cc 4, poll_wait 4 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `JSPurpleBuffer::cycleCollection::Trace(void*, TraceCallbacks const&, v` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObjectEdge(JSObj` 0; `[]` 0; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 3491** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | Idle 3, GC / CC 1, Other 1 | 0 / 0 / 5 | ipc 5, poll_wait 4, gc_cc 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `read [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 0; `mojo::core::ports::SinglePortLocker::SinglePortLocker(mojo::core::port` 0; `[linux-vdso.so.1]` 0

