### chromium key (profile pass)

**parent pid 4064** — 744 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 367 | 10.0 | Idle 154, JavaScript 79, Layout 38, Other 29 | 14 / 129 / 224 | ipc 367, poll_wait 186, gc_cc 90, paint_layout 83 |
| DOM Worker | 233 | 6.3 | JavaScript 220, Other 8, Profiler 2, GC / CC 2 | 0 / 0 / 233 | subprocess_pipe_io 233, worker_messaging 232, ipc 232, js_ctypes 202 |
| Renderer | 42 | 1.1 | Idle 22, Graphics 19 | 0 / 0 / 42 | ipc 42, poll_wait 22, webrender_render 19, webrender_sw_raster 17 |
| Timer | 32 | 0.9 | Other 32, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, memcpy_memset 0 |
| SwComposite | 32 | 0.9 | Other 32 | 0 / 0 / 32 | webrender_render 32, poll_wait 17, webrender_sw_raster 14, memcpy_memset 2 |
| Compositor | 15 | 0.4 | Idle 14, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 14, webrender_render 0, canvas_2d 0 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 |  |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 | webrender_scene 9, memcpy_memset 0, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 157; `[unknown]` 12; `[axiosozo-dev]` 10; `__memmove_avx_unaligned_erms [libc.so.6]` 7; `write [libc.so.6]` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 3

**tab pid 4173** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, JavaScript 1, Other 1 | 0 / 0 / 7 | ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 1; `JS::GetPromiseUserInputEventHandlingState(JSObject*) [libxul.so]` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 0; `[unknown]` 0; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.so]` 0; `JS::IsCallable(JSObject*) [libxul.so]` 0

**tab pid 4746** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4233** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::ProfilerStringV` 0

