### webkit-2x key (profile pass)

**parent pid 8784** — 1444 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 536 | 14.5 | Idle 237, JavaScript 115, Other 52, Layout 48 | 19 / 167 / 351 | ipc 535, poll_wait 284, gc_cc 113, paint_layout 98 |
| BgIOThreadPool #3 | 373 | 10.1 | Other 373, Idle 0 | 0 / 0 / 373 | ipc 373, poll_wait 0 |
| DOM Worker | 266 | 7.2 | JavaScript 262, Profiler 3, Other 1 | 0 / 0 / 266 | subprocess_pipe_io 266, worker_messaging 266, ipc 266, js_ctypes 253 |
| Renderer | 116 | 3.1 | Graphics 82, Idle 33 | 0 / 0 / 116 | ipc 114, webrender_render 82, webrender_sw_raster 73, poll_wait 36 |
| SwComposite | 49 | 1.3 | Other 49 | 0 / 0 / 49 | webrender_render 49, poll_wait 36, memcpy_memset 13, webrender_sw_raster 13 |
| Timer | 36 | 1.0 | Other 36, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 36 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 | webrender_render 0 |
| Compositor | 17 | 0.5 | Idle 16, Other 1, Graphics 0 | 0 / 0 / 17 | ipc 17, poll_wait 16, memcpy_memset 1, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 261; `[unknown]` 18; `[axiosozo-dev]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `mprotect [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 4; `js::jit::CacheIRWriter::loadDOMExpandoValue(js::jit::ObjOperandId) [li` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4

**tab pid 8871** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 1, DOM 0, Other 0 | 0 / 1 / 5 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `xpc::JSXrayTraits::resolveOwnProperty(JSContext*, JS::Handle<JSObject*` 0; `js::OpaqueCrossCompartmentWrapper::hasOwn(JSContext*, JS::Handle<JSObj` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 0; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheIRStubKey::` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advance(mozilla:` 0; `xpc::PrivilegedJunkScope() [libxul.so]` 0

**tab pid 8961** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, DOM 1, JavaScript 0, Other 0 | 0 / 2 / 2 | ipc 4, poll_wait 2, gc_cc 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::dom::Element::FindAttributeDependence(nsAtom const*, mozilla:` 1; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS::Value con` 1; `js::jit::BytecodeAnalysis::init() [libxul.so]` 0; `js::InterpreterFrame::prologue(JSContext*) [libxul.so]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `TimerThread::AddTimerInternal(nsTimerImpl&) [libxul.so]` 0

**tab pid 8942** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*) [libxul.s` 0

