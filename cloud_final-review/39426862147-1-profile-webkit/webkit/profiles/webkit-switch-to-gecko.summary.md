### webkit switch-to-gecko (profile pass)

**parent pid 7188** — 107 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 63 | 23.1 | JavaScript 23, DOM 11, Graphics 9, Other 7 | 1 / 37 / 25 | ipc 63, paint_layout 17, array_buffer_copy 16, gc_cc 14 |
| Renderer | 18 | 6.5 | Graphics 15, Idle 2 | 0 / 0 / 18 | ipc 17, webrender_render 15, webrender_sw_raster 13, poll_wait 2 |
| DOM Worker | 10 | 3.6 | JavaScript 9, Other 0, Idle 0 | 0 / 0 / 10 | subprocess_pipe_io 10, worker_messaging 10, ipc 10, poll_wait 9 |
| BgIOThreadPool #2 | 4 | 1.5 | Other 2, Idle 2 | 0 / 0 / 4 | ipc 4, poll_wait 2 |
| WRRenderBackend#0 | 3 | 1.1 | Other 3 | 0 / 0 / 3 | webrender_render 1, poll_wait 1 |
| WRSceneBuilder#0 | 2 | 0.9 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |
| Compositor | 2 | 0.9 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, webrender_render 0, paint_layout 0 |
| IPC I/O Parent | 2 | 0.6 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[axiosozo-dev]` 6; `nsAtomTable::AtomizeMainThread(nsTSubstring<char16_t> const&) [libxul.` 3; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 3; `AttrArray::GetAttr(nsAtom const*) const [libxul.so]` 3; `getcontext [libc.so.6]` 2; `mozilla::dom::AutoJSAPI::ReportException() [libxul.so]` 2; `mprotect [libc.so.6]` 2

**tab pid 7740** — 24 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 23 | 8.4 | JavaScript 8, Idle 5, Other 4, Layout 3 | 0 / 7 / 16 | ipc 21, gc_cc 9, paint_layout 9, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::frontend::ParserAtomsTable::internLatin1(js::FrontendContext*, uns` 3; `mozilla::PresShell::GetRootWidget() const [libxul.so]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `js::gc::BufferAllocator::allocSmall(unsigned long, bool, bool) [libxul` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::emitCall(J` 1; `js::jit::JitHintsMap::mightHaveEagerBaselineHint(JSScript*) const [lib` 1; `ReservedWordInfo const* FindReservedWord<unsigned char>(unsigned char ` 1

**tab pid 7280** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.3 | Idle 3, JavaScript 1, Other 0 | 0 / 1 / 3 | ipc 3, poll_wait 3, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, JS::CallArg` 0; `js::AsyncFunctionResolve(JSContext*, JS::Handle<js::AsyncFunctionGener` 0

**tab pid 7881** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Other 0, Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `g_poll [libglib-2.0.so.0]` 0; `__syscall_cancel_arch [libc.so.6]` 0

