### chromium key (profile pass)

**parent pid 3461** — 872 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 455 | 12.3 | Idle 175, JavaScript 83, GC / CC 60, Layout 43 | 13 / 136 / 305 | ipc 455, poll_wait 210, gc_cc 151, paint_layout 88 |
| DOM Worker | 254 | 6.8 | JavaScript 248, Profiler 4, Other 2 | 0 / 0 / 254 | subprocess_pipe_io 254, worker_messaging 254, ipc 254, js_ctypes 238 |
| Renderer | 54 | 1.5 | Graphics 38, Idle 16 | 0 / 0 / 54 | ipc 53, webrender_render 38, webrender_sw_raster 33, poll_wait 16 |
| Timer | 35 | 1.0 | Other 35, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 35 |
| Compositor | 17 | 0.4 | Idle 16, Other 1 | 0 / 0 / 17 | ipc 17, poll_wait 16, memcpy_memset 0, paint_layout 0 |
| SwComposite | 16 | 0.4 | Other 16 | 0 / 0 / 16 | webrender_render 16, poll_wait 12, memcpy_memset 3, webrender_sw_raster 3 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 |  |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 | webrender_scene 9 |

Main thread, top self: `poll [libc.so.6]` 176; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 14; `[axiosozo-dev]` 11; `[unknown]` 10; `write [libc.so.6]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `recvmsg [libc.so.6]` 5; `void js::gc::AtomRefRuntime::recordRef<JSAtom>(JSContext*, JSAtom*) [l` 4

**tab pid 3551** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, JavaScript 1, Other 0, DOM 0 | 0 / 1 / 6 | ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 0; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::Handle<JS::` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0; `__strlen_avx2 [libc.so.6]` 0; `js::StringEqualsAscii(JSLinearString const*, char const*) [libxul.so]` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 0

**tab pid 3600** — 1 ms CPU in the window

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

**tab pid 4150** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

