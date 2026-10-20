### chromium raf (profile pass)

**parent pid 3278** — 906 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 358 | 11.3 | Idle 218, JavaScript 52, Other 36, GC / CC 35 | 2 / 62 / 294 | ipc 358, poll_wait 234, gc_cc 93, engine_stream_read 29 |
| DOM Worker | 282 | 8.9 | JavaScript 276, Profiler 4, Other 2 | 0 / 0 / 282 | subprocess_pipe_io 282, worker_messaging 282, ipc 282, js_ctypes 269 |
| Renderer | 67 | 2.1 | Idle 55, Graphics 12, Other 0 | 0 / 0 / 67 | ipc 67, poll_wait 60, webrender_render 12, webrender_sw_raster 9 |
| WRRenderBackend#0 | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| SwComposite | 36 | 1.1 | Other 36 | 0 / 0 / 36 | webrender_render 36, poll_wait 35, memcpy_memset 0, webrender_sw_raster 0 |
| BackgroundThreadPool #2 | 35 | 1.1 | Idle 32, Other 2, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 32, native_receiver 2, memcpy_memset 2 |
| Compositor | 34 | 1.1 | Idle 33, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 33, webrender_render 1, canvas_2d 0 |
| Timer | 32 | 1.0 | Other 32, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 32, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 222; `[unknown]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 3

**tab pid 3950** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, GC / CC 2, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 2, gc_cc 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 0; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 0; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 0; `fog_custom_distribution_accumulate_single_sample [libxul.so]` 0

**tab pid 3955** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0

**tab pid 3420** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `write [libc.so.6]` 0

