### gecko-debian raf-nosampler (profile pass)

**parent pid 8069** — 511 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 295 | 9.8 | Graphics 205, Idle 89, Other 1 | 0 / 0 / 295 | ipc 290, webrender_render 205, webrender_sw_raster 175, poll_wait 91 |
| WRRenderBackend#0 | 58 | 1.9 | Other 58, Profiler 0 | 0 / 0 / 58 | webrender_render 1, memcpy_memset 0, array_buffer_copy 0 |
| WRSceneBuilder#0 | 44 | 1.5 | Other 44 | 0 / 0 / 44 | webrender_scene 44, webrender_render 0, paint_layout 0, memcpy_memset 0 |
| GeckoMain | 44 | 1.4 | GC / CC 26, Idle 11, Other 3, JavaScript 3 | 0 / 3 / 41 | ipc 43, gc_cc 29, poll_wait 11, harness_diagnostics 2 |
| Compositor | 40 | 1.3 | Idle 39, Other 1, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 39, webrender_render 0, webrender_scene 0 |
| SwComposite | 15 | 0.5 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 14, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 9 | 0.3 | Idle 9 | 0 / 0 / 9 | poll_wait 9 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 2; `[linux-vdso.so.1]` 1; `js::jit::IRGenerator::maybeCreateAllocSite() [libxul.so]` 1; `js::GCMarker::markCurrentColorInParallel(js::gc::ParallelMarkTask*, JS` 1

**tab pid 8325** — 161 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 146 | 4.8 | Idle 102, Graphics 14, Layout 10, Other 8 | 0 / 4 / 142 | ipc 139, poll_wait 106, paint_layout 32, gc_cc 5 |
| IPC I/O Child | 14 | 0.5 | Idle 13, Other 0 | 0 / 0 / 14 | poll_wait 13, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 107; `[]` 2; `nsIFrame::IsTransformed() const [libxul.so]` 1; `mozilla::EffectSet::GetForFrame(nsIFrame const*, nsCSSPropertyIDSet co` 1; `__lll_lock_wait [libc.so.6]` 1; `bool TraversalTracer::onEdge<js::Scope>(js::Scope**, char const*) [lib` 1; `PLDHashTable::Iterator::Iterator(PLDHashTable*, PLDHashTable::Iterator` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1

**tab pid 8221** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__strlen_evex [libc.so.6]` 0

**tab pid 8416** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

