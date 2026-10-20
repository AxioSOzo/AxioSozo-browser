### webkit-2x-control switch-to-gecko (profile pass)

**parent pid 10383** — 131 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 67 | 24.4 | DOM 37, JavaScript 19, Layout 5, Idle 3 | 2 / 55 / 10 | ipc 67, gc_cc 43, array_buffer_copy 11, harness_diagnostics 9 |
| Renderer | 32 | 11.7 | Graphics 27, Idle 5 | 0 / 0 / 32 | ipc 31, webrender_render 27, webrender_sw_raster 25, poll_wait 5 |
| DOM Worker | 11 | 4.0 | JavaScript 11, Idle 0 | 0 / 0 / 11 | subprocess_pipe_io 11, worker_messaging 11, ipc 11, js_ctypes 11 |
| BgIOThreadPool #1 | 5 | 1.9 | Other 4, Idle 1 | 0 / 0 / 5 | ipc 5, poll_wait 1 |
| SwComposite | 4 | 1.6 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 3 | 1.0 | Other 3 | 0 / 0 / 3 | memcpy_memset 0, webrender_render 0 |
| Compositor | 3 | 0.9 | Idle 2, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2 |
| IPC I/O Parent | 2 | 0.8 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifIXsr3stdE9i` 32; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2; `AutoProfilerUntypedMarker::~AutoProfilerUntypedMarker() [libxul.so]` 2; `mprotect [libc.so.6]` 2; `mozilla::dom::Document::GetUnretargetedFocusedContent(mozilla::dom::Do` 1; `nsIFrame::Combines3DTransformWithAncestors() const [libxul.so]` 1

**tab pid 10778** — 29 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 27 | 9.9 | JavaScript 8, Other 7, Idle 5, Layout 3 | 0 / 10 / 17 | ipc 19, gc_cc 9, poll_wait 5, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.5 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `syscall [libc.so.6]` 2; `[]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `__lll_lock_wake [libc.so.6]` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1; `js::jit::CacheIRWriter::writeOperandId(js::jit::OperandId) [libxul.so]` 1; `js::frontend::BytecodeEmitter::emitAtomOp(JSOp, js::frontend::TaggedPa` 1

**tab pid 10474** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.2 | Idle 3, JavaScript 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, array_buffer_copy 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `[unknown]` 0

**tab pid 10566** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

