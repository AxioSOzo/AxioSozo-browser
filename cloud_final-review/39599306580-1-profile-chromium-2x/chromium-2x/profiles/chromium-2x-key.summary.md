### chromium-2x key (profile pass)

**parent pid 3249** — 790 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 390 | 10.7 | Idle 146, GC / CC 67, JavaScript 64, Layout 36 | 16 / 105 / 269 | ipc 390, poll_wait 188, gc_cc 142, paint_layout 67 |
| DOM Worker | 179 | 4.9 | JavaScript 173, Other 5, Profiler 1 | 0 / 0 / 179 | subprocess_pipe_io 179, worker_messaging 179, ipc 179, js_ctypes 168 |
| Renderer | 97 | 2.6 | Graphics 84, Idle 13 | 0 / 0 / 97 | ipc 96, webrender_render 84, webrender_sw_raster 78, poll_wait 13 |
| SwComposite | 44 | 1.2 | Other 44 | 0 / 0 / 44 | webrender_render 44, webrender_sw_raster 24, memcpy_memset 23, poll_wait 20 |
| Timer | 25 | 0.7 | Other 25 | 0 / 0 / 25 | ipc 25, poll_wait 25 |
| Compositor | 14 | 0.4 | Idle 13, Other 1 | 0 / 0 / 14 | ipc 14, poll_wait 13, memcpy_memset 1, paint_layout 0 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | poll_wait 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 7, Graphics 1 | 0 / 0 / 8 | webrender_scene 8, webrender_sw_raster 1, poll_wait 1, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 149; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `[unknown]` 11; `recvmsg [libc.so.6]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 6; `[axiosozo-dev]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 3

**tab pid 3343** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, Other 0, JavaScript 0, Profiler 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<mozilla::Prof` 0; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `js::ToBooleanSlow(JS::Handle<JS::Value>) [libxul.so]` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0

**tab pid 3429** — 1 ms CPU in the window

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

**tab pid 4108** — 1 ms CPU in the window

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

