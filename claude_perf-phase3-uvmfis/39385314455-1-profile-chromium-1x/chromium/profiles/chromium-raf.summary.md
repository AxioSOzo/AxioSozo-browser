### chromium raf (profile pass)

**parent pid 3402** — 1007 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 358 | 11.3 | Idle 229, JavaScript 73, Other 27, DOM 19 | 12 / 79 / 268 | ipc 358, poll_wait 241, gc_cc 85, worker_messaging 47 |
| DOM Worker | 298 | 9.4 | JavaScript 291, Other 5, Profiler 1 | 0 / 0 / 298 | subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 284 |
| Renderer | 85 | 2.7 | Idle 66, Graphics 19, Profiler 1, Other 0 | 0 / 0 / 85 | ipc 85, poll_wait 70, webrender_render 19, webrender_sw_raster 11 |
| BackgroundThreadPool #3 | 69 | 2.2 | Idle 62, Other 6, Profiler 1, Graphics 0 | 0 / 0 / 69 | ipc 69, poll_wait 62, native_receiver 6, memcpy_memset 5 |
| WRRenderBackend#0 | 49 | 1.5 | Other 49 | 0 / 0 / 49 | webrender_render 1, poll_wait 0, webrender_sw_raster 0, memcpy_memset 0 |
| SwComposite | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_render 43, poll_wait 41, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 42 | 1.3 | Idle 40, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 42 | ipc 42, poll_wait 40, webrender_render 1, canvas_2d 0 |
| Timer | 33 | 1.1 | Other 33, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 33, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 230; `[unknown]` 9; `[axiosozo-dev]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 4; `mprotect [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `write [libc.so.6]` 3

**tab pid 3862** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, GC / CC 2 | 0 / 0 / 4 | ipc 4, poll_wait 2, gc_cc 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0; `gecko_profiler_add_marker [libxul.so]` 0

**tab pid 3586** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `MessageLoop::EventTarget::IsOnCurrentThreadInfallible() [libxul.so]` 0

**tab pid 4048** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

