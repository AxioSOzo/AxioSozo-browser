### gecko-debian idle (profile pass)

**parent pid 8069** — 14 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.4 | JavaScript 4, Idle 4, Graphics 1, Other 0 | 0 / 3 / 6 | ipc 9, poll_wait 4, gc_cc 3, harness_diagnostics 3 |
| IPC I/O Parent | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Compositor | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Renderer | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| SwComposite | 0 | 0.0 | Other 0 | 0 / 0 / 0 | webrender_render 0, memcpy_memset 0, webrender_sw_raster 0, poll_wait 0 |
| WRSceneBuilder#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 | webrender_scene 0 |
| WRRenderBackend#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 1; `js::gc::BufferAllocator::bumpAlloc(unsigned long, unsigned long, unsig` 1; `js::jit::ExecutableAllocator::poolForSize(unsigned long) [libxul.so]` 1; `nsINode::GetFlattenedTreeParentNodeForStyle() const [libxul.so]` 1; `mprotect [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 0; `js::jit::AddressIsInExecutableMemory(void const*) [libxul.so]` 0

**tab pid 8325** — 32 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 27 | 1.3 | Idle 15, GC / CC 5, JavaScript 3, Profiler 2 | 0 / 3 / 23 | ipc 24, poll_wait 16, gc_cc 7, harness_diagnostics 3 |
| IPC I/O Child | 4 | 0.2 | Idle 4, Profiler 0, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 15; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `js::gc::AtomRefRuntime::recordRefToId(JSContext*, JS::PropertyKey) [li` 1; `js::ScriptSource::setFilename(js::FrontendContext*, std::unique_ptr<ch` 1; `nsXPConnect::GetRuntimeInstance() [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 8419** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8357** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

