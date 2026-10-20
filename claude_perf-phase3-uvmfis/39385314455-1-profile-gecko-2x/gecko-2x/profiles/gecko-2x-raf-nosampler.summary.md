### gecko-2x raf-nosampler (profile pass)

**parent pid 2847** — 528 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 244 | 8.1 | Graphics 141, Idle 98, Other 3, Profiler 3 | 0 / 0 / 244 | ipc 244, webrender_render 146, webrender_sw_raster 115, poll_wait 98 |
| WRRenderBackend#0 | 76 | 2.5 | Other 76 | 0 / 0 / 76 | webrender_render 1, array_buffer_copy 0, gc_cc 0 |
| WRSceneBuilder#0 | 54 | 1.8 | Other 54 | 0 / 0 / 54 | webrender_scene 54, webrender_render 3, array_buffer_copy 0, paint_layout 0 |
| GeckoMain | 52 | 1.7 | GC / CC 31, Idle 15, JavaScript 6, Other 0 | 0 / 5 / 47 | ipc 52, gc_cc 34, poll_wait 15, harness_diagnostics 4 |
| Compositor | 44 | 1.4 | Idle 43, Other 1, Profiler 0 | 0 / 0 / 44 | ipc 44, poll_wait 43, webrender_render 0, paint_layout 0 |
| SwComposite | 40 | 1.3 | Other 40 | 0 / 0 / 40 | webrender_render 40, poll_wait 37, webrender_sw_raster 3, memcpy_memset 3 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(JSObject*) ` 2

**tab pid 3114** — 231 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 214 | 7.1 | Idle 92, Graphics 57, Layout 37, Other 15 | 0 / 8 / 206 | ipc 201, paint_layout 110, poll_wait 94, subprocess_pipe_io 5 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 16, ipc 0, memcpy_memset 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 92; `[]` 6; `sendmsg [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 2; `nsLayoutUtils::ComputeScrollMetadata(nsIFrame const*, nsIFrame const*,` 2; `mozilla::nsDisplayListSet::MoveTo(mozilla::nsDisplayListSet const&) co` 2

**tab pid 3000** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3141** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

