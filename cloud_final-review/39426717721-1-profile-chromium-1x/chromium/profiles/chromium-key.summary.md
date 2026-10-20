### chromium key (profile pass)

**parent pid 3133** — 485 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 277 | 7.6 | Idle 102, JavaScript 51, GC / CC 29, Layout 26 | 7 / 90 / 180 | ipc 277, poll_wait 137, gc_cc 93, paint_layout 56 |
| DOM Worker | 106 | 2.9 | JavaScript 99, Profiler 5, Other 2 | 0 / 0 / 106 | subprocess_pipe_io 106, worker_messaging 106, ipc 106, js_ctypes 94 |
| Renderer | 31 | 0.9 | Graphics 17, Idle 15 | 0 / 0 / 31 | ipc 31, webrender_render 17, poll_wait 15, webrender_sw_raster 14 |
| Timer | 20 | 0.5 | Other 20 | 0 / 0 / 20 | ipc 20, poll_wait 20 |
| WRRenderBackend#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 | array_buffer_copy 0 |
| Compositor | 11 | 0.3 | Idle 10, Other 0, Profiler 0 | 0 / 0 / 11 | ipc 11, poll_wait 10, memcpy_memset 0, paint_layout 0 |
| SwComposite | 9 | 0.2 | Other 9 | 0 / 0 / 9 | webrender_render 9, poll_wait 8, webrender_sw_raster 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 7 | 0.2 | Other 6, Graphics 1 | 0 / 0 / 7 | webrender_scene 7, webrender_sw_raster 1, poll_wait 1, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 102; `[unknown]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `[axiosozo-dev]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 4; `write [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2

**tab pid 3227** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `xpc::JSXrayTraits::createHolder(JSContext*, JSObject*) [libxul.so]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[4` 0; `[unknown]` 0

**tab pid 3299** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0

**tab pid 3278** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0

