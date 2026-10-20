### webkit switch-to-gecko (profile pass)

**parent pid 7188** — 144 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 82 | 27.6 | JavaScript 36, Layout 12, Graphics 9, Other 8 | 3 / 44 / 36 | ipc 82, gc_cc 23, paint_layout 21, array_buffer_copy 16 |
| Renderer | 23 | 7.7 | Graphics 20, Idle 3 | 0 / 0 / 23 | ipc 23, webrender_render 20, webrender_sw_raster 19, poll_wait 3 |
| DOM Worker | 13 | 4.4 | JavaScript 13, Idle 1 | 0 / 0 / 13 | subprocess_pipe_io 13, worker_messaging 13, ipc 13, poll_wait 12 |
| BgIOThreadPool #1 | 11 | 3.6 | Other 10, Idle 1 | 0 / 0 / 11 | ipc 11, poll_wait 1 |
| Compositor | 4 | 1.2 | Other 2, Idle 2 | 0 / 0 / 4 | ipc 4, poll_wait 2, memcpy_memset 1, webrender_render 0 |
| WRRenderBackend#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 | webrender_render 1 |
| IPC I/O Parent | 3 | 0.9 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3 |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 11; `mprotect [libc.so.6]` 6; `round [libxul.so]` 3; `[axiosozo-dev]` 3; `XRE_IsParentProcess() [libxul.so]` 3; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 2; `nsXPConnect::GetRuntimeInstance() [libxul.so]` 2; `js::NativeObject::changeProperty(JSContext*, JS::Handle<js::NativeObje` 2

**tab pid 7712** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 8.6 | Other 10, JavaScript 7, Idle 4, DOM 2 | 0 / 7 / 19 | ipc 23, paint_layout 10, gc_cc 9, subprocess_pipe_io 7 |
| IPC I/O Child | 1 | 0.5 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[]` 2; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(JSContext*` 2; `js::frontend::GeneralParser<js::frontend::SyntaxParseHandler, mozilla:` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, mozilla::U` 1; `nsXPCWrappedJS::CallMethod(unsigned short, nsXPTMethodInfo const*, nsX` 1; `js::frontend::BytecodeEmitter::emitCalleeAndThis(js::frontend::ParseNo` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 1

**tab pid 7274** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.3 | Idle 3, JavaScript 1, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, gc_cc 1, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `FulfillMaybeWrappedPromise(JSContext*, JS::Handle<JSObject*>, JS::Hand` 1; `js::jit::CallIRGenerator::tryAttachCallScripted(JS::Handle<JSFunction*` 0; `mozilla::dom::danger::GetJSContext() [libxul.so]` 0

**tab pid 7806** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

