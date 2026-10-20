### gecko raf (profile pass)

**parent pid 3041** — 635 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 348 | 11.2 | Graphics 245, Idle 103, Profiler 1 | 0 / 0 / 348 | ipc 346, webrender_render 246, webrender_sw_raster 221, poll_wait 106 |
| WRRenderBackend#0 | 76 | 2.4 | Other 76 | 0 / 0 / 76 | webrender_render 1, poll_wait 1, webrender_scene 0, webrender_sw_raster 0 |
| GeckoMain | 66 | 2.1 | GC / CC 32, Idle 26, JavaScript 4, Other 2 | 1 / 4 / 61 | ipc 66, gc_cc 37, poll_wait 27, harness_diagnostics 3 |
| WRSceneBuilder#0 | 53 | 1.7 | Other 53 | 0 / 0 / 53 | webrender_scene 53, webrender_render 4, poll_wait 1, memcpy_memset 0 |
| Compositor | 46 | 1.5 | Idle 46, Other 1, Profiler 0 | 0 / 0 / 46 | ipc 46, poll_wait 46, paint_layout 0, webrender_render 0 |
| SwComposite | 20 | 0.6 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 19, memcpy_memset 1, webrender_sw_raster 1 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 2; `recvmsg [libc.so.6]` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1

**tab pid 3294** — 206 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 187 | 6.0 | Idle 105, Graphics 30, Layout 28, Other 10 | 0 / 9 / 178 | ipc 176, poll_wait 107, paint_layout 70, subprocess_pipe_io 4 |
| IPC I/O Child | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 | poll_wait 17, ipc 0 |
| Timer | 3 | 0.1 | Other 3 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 104; `[]` 6; `sendmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `getcontext [libc.so.6]` 2; `mozilla::nsDisplayBackgroundImage::AppendBackgroundItemsToTop(mozilla:` 2; `nsIFrame::ComputeBSizeValueAsPercentageBasis(mozilla::StyleGenericSize` 1

**tab pid 3230** — 1 ms CPU in the window

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

**tab pid 3296** — 1 ms CPU in the window

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

