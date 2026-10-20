### chromium-control key (profile pass)

**parent pid 4588** — 791 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 434 | 11.8 | Idle 162, JavaScript 65, GC / CC 62, Layout 38 | 11 / 129 / 294 | ipc 434, poll_wait 200, gc_cc 146, paint_layout 75 |
| DOM Worker | 226 | 6.1 | JavaScript 218, Profiler 5, Other 3 | 0 / 0 / 226 | subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 213 |
| Timer | 36 | 1.0 | Other 36 | 0 / 0 / 36 | ipc 36, poll_wait 36, memcpy_memset 0 |
| Renderer | 31 | 0.8 | Idle 17, Graphics 15 | 0 / 0 / 31 | ipc 31, poll_wait 18, webrender_render 15, webrender_sw_raster 12 |
| SwComposite | 24 | 0.6 | Other 24 | 0 / 0 / 24 | webrender_render 24, poll_wait 13, webrender_sw_raster 11, memcpy_memset 1 |
| Compositor | 15 | 0.4 | Idle 15, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, webrender_render 0 |
| WRRenderBackend#0 | 10 | 0.3 | Other 10 | 0 / 0 / 10 | webrender_render 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | webrender_scene 8, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 162; `[axiosozo-dev]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `[unknown]` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `recvmsg [libc.so.6]` 5; `write [libc.so.6]` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4

**tab pid 4678** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[unknown]` 0; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::Handle<JSO` 0; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 0

**tab pid 4725** — 1 ms CPU in the window

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

**tab pid 4764** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0

