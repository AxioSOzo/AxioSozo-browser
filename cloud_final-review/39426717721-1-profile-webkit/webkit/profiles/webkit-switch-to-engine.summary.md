### webkit switch-to-engine (profile pass)

**parent pid 7188** — 99 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 38 | 10.7 | JavaScript 15, Idle 11, Layout 6, Graphics 3 | 0 / 20 / 19 | ipc 38, gc_cc 12, poll_wait 12, array_buffer_copy 9 |
| DOM Worker | 25 | 6.9 | JavaScript 22, Profiler 3 | 0 / 0 / 25 | subprocess_pipe_io 25, worker_messaging 25, ipc 25, js_ctypes 22 |
| Renderer | 18 | 4.9 | Graphics 15, Idle 2 | 0 / 0 / 18 | ipc 18, webrender_render 15, webrender_sw_raster 11, poll_wait 2 |
| BackgroundThreadPool #3 | 6 | 1.7 | Idle 3, Other 3 | 0 / 0 / 6 | ipc 6, poll_wait 3, native_receiver 3, memcpy_memset 2 |
| Compositor | 3 | 0.9 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, canvas_2d 0, webrender_render 0 |
| WRRenderBackend#0 | 3 | 0.7 | Other 3 | 0 / 0 / 3 |  |
| IPC I/O Parent | 2 | 0.5 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| WRSceneBuilder#0 | 2 | 0.4 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 12; `JS::AddAssociatedMemory(JSObject*, unsigned long, JS::MemoryUse) [libx` 2; `XPCNativeSet::FindMember(JS::Handle<JS::PropertyKey>, XPCNativeMember*` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2; `mozilla::ReflowInput::InitConstraints(nsPresContext*, mozilla::Maybe<m` 2; `[axiosozo-dev]` 1; `mozilla::ScrollSnapUtils::GetSnapPointForResnap(mozilla::ScrollSnapInf` 1; `js::jit::CacheIRWriter::callScriptedFunction(js::jit::ObjOperandId, js` 1

**tab pid 7878** — 54 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 53 | 14.8 | Other 43, JavaScript 8, GC / CC 1, Idle 1 | 0 / 9 / 45 | ipc 45, array_buffer_copy 18, gc_cc 12, memcpy_memset 2 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `js::jit::CacheIRCompiler::emitCompareInt32Result(JSOp, js::jit::Int32O` 6; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 6; `[libfontconfig.so.1]` 4; `[]` 4; `mozilla::xpcom::StaticModule::GetFactory() const [libxul.so]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `[libexpat.so.1]` 2; `char* mozilla::detail::DuplicateString<char, 4096ul, 1ul>(char const*,` 2

**tab pid 7883** — 41 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 40 | 11.9 | Other 30, DOM 4, Profiler 2, JavaScript 2 | 0 / 5 / 35 | ipc 27, gc_cc 14, subprocess_pipe_io 6, array_buffer_copy 5 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `CallbackTrieNode::GetOrCreateChild(nsTSubstring<char> const&) [libxul.` 3; `__syscall_cancel_arch [libc.so.6]` 3; `js::frontend::BytecodeEmitter::emitStatementList(js::frontend::ListNod` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 2; `alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_handle [libxul` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 1; `[]` 1

**tab pid 7736** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.4 | Idle 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::dom::EventCallbackDebuggerNotificationGuard::DispatchToManage` 1

