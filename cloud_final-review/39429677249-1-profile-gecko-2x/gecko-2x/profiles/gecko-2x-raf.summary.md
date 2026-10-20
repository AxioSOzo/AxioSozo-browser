### gecko-2x raf (profile pass)

**parent pid 3067** — 553 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 261 | 8.4 | Graphics 164, Idle 96, Profiler 1 | 0 / 0 / 261 | ipc 260, webrender_render 165, webrender_sw_raster 136, poll_wait 99 |
| SwComposite | 68 | 2.2 | Other 68 | 0 / 0 / 68 | webrender_render 68, poll_wait 61, webrender_sw_raster 7, memcpy_memset 7 |
| WRRenderBackend#0 | 59 | 1.9 | Other 59 | 0 / 0 / 59 | webrender_render 0, poll_wait 0 |
| GeckoMain | 58 | 1.8 | GC / CC 27, Idle 18, JavaScript 6, Other 2 | 0 / 6 / 51 | ipc 58, gc_cc 32, poll_wait 20, harness_diagnostics 5 |
| WRSceneBuilder#0 | 45 | 1.5 | Other 45 | 0 / 0 / 45 | webrender_scene 45, webrender_render 1, poll_wait 1, array_buffer_copy 0 |
| Compositor | 42 | 1.3 | Idle 40, Other 2, Profiler 0 | 0 / 0 / 42 | ipc 42, poll_wait 40, webrender_render 0, paint_layout 0 |
| IPC I/O Parent | 11 | 0.3 | Idle 10, Other 0, Profiler 0 | 0 / 0 / 11 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `TraceCallbackFunc::Trace(JS::TenuredHeap<JSObject*>*, char const*, voi` 2; `recvmsg [libc.so.6]` 1; `mprotect [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1

**tab pid 3307** — 175 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 158 | 5.1 | Idle 102, Graphics 18, Layout 10, GC / CC 8 | 0 / 7 / 150 | ipc 147, poll_wait 104, paint_layout 36, gc_cc 13 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 103; `[]` 8; `sendmsg [libc.so.6]` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const [libxul.so` 1; `read [libc.so.6]` 1; `getcontext [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1

**tab pid 3242** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsTString<char>* nsTArray_Impl<nsTString<char>, nsTArrayInfallibleAllo` 0

**tab pid 3261** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

