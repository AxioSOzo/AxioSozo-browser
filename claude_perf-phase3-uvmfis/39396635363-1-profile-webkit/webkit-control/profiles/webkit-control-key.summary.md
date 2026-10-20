### webkit-control key (profile pass)

**parent pid 9829** — 799 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 462 | 12.7 | Idle 211, JavaScript 90, Other 38, GC / CC 36 | 12 / 142 / 308 | ipc 457, poll_wait 248, gc_cc 129, worker_messaging 69 |
| DOM Worker | 186 | 5.1 | JavaScript 180, Profiler 3, Other 2 | 0 / 0 / 186 | subprocess_pipe_io 186, worker_messaging 186, ipc 186, js_ctypes 172 |
| Renderer | 45 | 1.2 | Graphics 27, Idle 19 | 0 / 0 / 45 | ipc 45, webrender_render 27, poll_wait 21, webrender_sw_raster 20 |
| SwComposite | 37 | 1.0 | Other 37 | 0 / 0 / 37 | webrender_render 37, poll_wait 21, webrender_sw_raster 16, memcpy_memset 3 |
| Timer | 26 | 0.7 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, memcpy_memset 0 |
| Compositor | 15 | 0.4 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, canvas_2d 0, webrender_render 0 |
| WRRenderBackend#0 | 13 | 0.4 | Other 13 | 0 / 0 / 13 |  |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | webrender_scene 8, webrender_render 1, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 221; `[unknown]` 21; `[axiosozo-dev]` 9; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 4; `[linux-vdso.so.1]` 4; `js::jit::CallIRGenerator::tryAttachStub() [libxul.so]` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 3

**tab pid 9920** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Other 1 | 0 / 1 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `JS::GetFunctionRealm(JSContext*, JS::Handle<JSObject*>) [libxul.so]` 0; `XPCWrappedNativeScope::GetExpandoChain(JS::Handle<JSObject*>) [libxul.` 0; `js::AbstractGeneratorObject::createFromFrame(JSContext*, js::AbstractF` 0; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 0; `[]` 0

**tab pid 9993** — 1 ms CPU in the window

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

**tab pid 10012** — 1 ms CPU in the window

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

