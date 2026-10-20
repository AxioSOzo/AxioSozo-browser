### webkit raf-nosampler (profile pass)

**parent pid 7188** — 1013 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 252 | 8.3 | JavaScript 243, Profiler 6, Other 4 | 0 / 0 / 252 | subprocess_pipe_io 252, worker_messaging 252, ipc 252, js_ctypes 232 |
| GeckoMain | 242 | 7.9 | Idle 115, JavaScript 68, GC / CC 31, Other 17 | 6 / 65 / 170 | ipc 242, poll_wait 127, gc_cc 107, engine_stream_read 53 |
| Renderer | 201 | 6.6 | Idle 105, Graphics 94, Profiler 2, Other 0 | 0 / 0 / 201 | ipc 201, poll_wait 110, webrender_render 96, webrender_sw_raster 84 |
| SwComposite | 146 | 4.8 | Other 146 | 0 / 0 / 146 | webrender_render 146, poll_wait 99, webrender_sw_raster 46, memcpy_memset 4 |
| BackgroundThreadPool #3 | 56 | 1.9 | Idle 51, Other 4, Graphics 1, Profiler 0 | 0 / 0 / 56 | ipc 56, poll_wait 52, native_receiver 5, memcpy_memset 4 |
| WRRenderBackend#0 | 52 | 1.7 | Other 52 | 0 / 0 / 52 | webrender_render 1, memcpy_memset 0 |
| Compositor | 37 | 1.2 | Idle 36, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 37 | ipc 37, poll_wait 36, webrender_render 1, memcpy_memset 0 |
| ImageBridgeChld | 16 | 0.5 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 16, image_container 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 126; `[unknown]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 4; `mprotect [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScopeEdge(js::Sc` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3

**tab pid 7712** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | GC / CC 2, Idle 1, Other 1 | 0 / 0 / 4 | ipc 3, poll_wait 3, gc_cc 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `bool TraversalTracer::onEdge<js::Scope>(js::Scope**, char const*) [lib` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `nsCycleCollector::ScanRoots(bool) [libxul.so]` 0; `js::StringPrinter::put(char const*, unsigned long) [libxul.so]` 0

**tab pid 7328** — 1 ms CPU in the window

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

**tab pid 7718** — 1 ms CPU in the window

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

