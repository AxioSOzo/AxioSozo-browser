### webkit-2x key (profile pass)

**parent pid 8823** — 1436 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 544 | 14.6 | Idle 275, JavaScript 98, Graphics 46, Other 43 | 10 / 149 / 385 | ipc 538, poll_wait 316, gc_cc 108, paint_layout 86 |
| BgIOThreadPool #3 | 363 | 9.8 | Other 363, Idle 0 | 0 / 0 / 363 | ipc 363, poll_wait 0 |
| DOM Worker | 262 | 7.1 | JavaScript 252, Profiler 5, Other 4 | 0 / 0 / 262 | subprocess_pipe_io 262, worker_messaging 262, ipc 262, js_ctypes 245 |
| Renderer | 113 | 3.1 | Graphics 93, Idle 20 | 0 / 0 / 113 | ipc 113, webrender_render 93, webrender_sw_raster 82, poll_wait 20 |
| SwComposite | 53 | 1.4 | Other 53 | 0 / 0 / 53 | webrender_render 53, poll_wait 31, webrender_sw_raster 21, memcpy_memset 20 |
| Timer | 36 | 1.0 | Other 36, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 36 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | memcpy_memset 1, webrender_render 1, poll_wait 1 |
| Compositor | 17 | 0.5 | Idle 17, Other 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 277; `[unknown]` 19; `[axiosozo-dev]` 12; `__internal_syscall_cancel [libc.so.6]` 7; `[linux-vdso.so.1]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `mprotect [libc.so.6]` 6; `mozilla::SizeComputationInput::InitOffsets(mozilla::WritingMode, int, ` 4

**tab pid 8911** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 4, JavaScript 1, Other 0, DOM 0 | 0 / 1 / 5 | ipc 6, poll_wait 4, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::jit::JitHintsMap::getIonThresholdHint(JSScript*, unsigned int&) [l` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JS_WrapObject(JSContext*, JS::MutableHandle<JSObject*>) [libxul.so]` 0; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 0; `mozilla::dom::MessageListener::ReceiveMessage(mozilla::dom::BindingCal` 0; `nsIXPConnect::XPConnect() [libxul.so]` 0

**tab pid 9003** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.1 | Idle 3, DOM 2, JavaScript 1 | 0 / 2 / 3 | ipc 5, poll_wait 3, gc_cc 2, array_buffer_copy 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `nsTHashtable<AtomTableEntry>::s_HashKey(void const*) [libxul.so]` 1; `bool mozilla::HashSet<js::jit::ExecutablePool*, mozilla::DefaultHasher` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::callVMInte` 1; `js::jit::MacroAssembler::Push(js::jit::Register) [libxul.so]` 0

**tab pid 8962** — 1 ms CPU in the window

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

