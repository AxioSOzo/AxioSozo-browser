### gecko-2x raf-nosampler (profile pass)

**parent pid 3067** — 599 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 346 | 11.4 | Graphics 247, Idle 98, Other 1, Profiler 1 | 0 / 0 / 346 | ipc 344, webrender_render 249, webrender_sw_raster 217, poll_wait 99 |
| SwComposite | 55 | 1.8 | Other 55 | 0 / 0 / 55 | webrender_render 55, poll_wait 47, webrender_sw_raster 7, memcpy_memset 7 |
| WRRenderBackend#0 | 53 | 1.8 | Other 53 | 0 / 0 / 53 | memcpy_memset 0, webrender_render 0, poll_wait 0, webrender_scene 0 |
| GeckoMain | 42 | 1.4 | GC / CC 27, Idle 10, JavaScript 5, Other 0 | 0 / 4 / 38 | ipc 42, gc_cc 31, poll_wait 12, harness_diagnostics 4 |
| WRSceneBuilder#0 | 42 | 1.4 | Other 42 | 0 / 0 / 42 | webrender_scene 42, webrender_render 1, poll_wait 0, paint_layout 0 |
| Compositor | 41 | 1.4 | Idle 40, Other 1 | 0 / 0 / 41 | ipc 41, poll_wait 40, paint_layout 0, webrender_render 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3; `mprotect [libc.so.6]` 2; `js::gc::TraceCycleCollectorChildren(JSTracer*, js::Shape*) [libxul.so]` 2; `js::ScriptWarmUpData::trace(JSTracer*) [libxul.so]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1

**tab pid 3307** — 150 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 133 | 4.4 | Idle 97, Graphics 15, Layout 10, Other 6 | 0 / 3 / 130 | ipc 128, poll_wait 98, paint_layout 28, subprocess_pipe_io 2 |
| IPC I/O Child | 16 | 0.5 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 97; `[]` 3; `sendmsg [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 1; `__sincos_fma [libm.so.6]` 1

**tab pid 3220** — 1 ms CPU in the window

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

**tab pid 3242** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Profiler 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

