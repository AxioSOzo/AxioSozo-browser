### chromium switch-to-engine (profile pass)

**parent pid 3367** — 165 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 92 | 32.4 | JavaScript 34, Layout 28, Idle 20, DOM 4 | 1 / 49 / 43 | ipc 92, gc_cc 29, paint_layout 29, array_buffer_copy 23 |
| Renderer | 35 | 12.2 | Graphics 30, Idle 5 | 0 / 0 / 35 | ipc 35, webrender_render 30, webrender_sw_raster 25, poll_wait 5 |
| DOM Worker | 17 | 5.9 | JavaScript 17 | 0 / 0 / 17 | subprocess_pipe_io 17, worker_messaging 17, ipc 17, js_ctypes 16 |
| WRRenderBackend#0 | 5 | 1.6 | Other 5 | 0 / 0 / 5 |  |
| Compositor | 4 | 1.4 | Idle 4 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| WRSceneBuilder#0 | 3 | 1.2 | Other 3 | 0 / 0 / 3 | webrender_scene 3, memcpy_memset 0 |
| IPC I/O Parent | 3 | 1.1 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| BackgroundThreadPool #3 | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, native_receiver 0, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 20; `nsXPCWrappedJS::CallQueryInterfaceOnJSObject(JSContext*, JSObject*, JS` 5; `js::jit::CacheIRCompiler::emitGuardToObject(js::jit::ValOperandId) [li` 5; `[axiosozo-dev]` 3; `style::properties::generated::longhands::border_bottom_left_radius::ca` 3; `mozilla::StyleRect<mozilla::StyleLengthPercentage>::~StyleRect() [libx` 3; `style::parallel::style_trees [libxul.so]` 3; `style::custom_properties::do_substitute_chunk [libxul.so]` 3

**tab pid 4250** — 56 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 55 | 25.6 | Other 43, DOM 4, Profiler 3, JavaScript 3 | 0 / 6 / 49 | ipc 42, array_buffer_copy 18, gc_cc 10, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libexpat.so.1]` 4; `__strlen_avx2 [libc.so.6]` 4; `JSAtom* PermanentlyAtomizeAndCopyCharsNonStaticValidLength<unsigned ch` 4; `__lll_lock_wake [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__strcmp_avx2 [libc.so.6]` 2; `[]` 2; `sendmsg [libc.so.6]` 2

**tab pid 4245** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 17.3 | Other 35, JavaScript 5, DOM 5, Idle 2 | 0 / 7 / 42 | ipc 37, gc_cc 16, array_buffer_copy 15, subprocess_pipe_io 8 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| BackgroundThreadPool #1 | 0 | 0.1 | Other 0, Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 5; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 4; `[libfontconfig.so.1]` 3; `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<Pref> >, Pr` 2; `regex_automata::nfa::thompson::compiler::Compiler::build_many_from_hir` 2; `js::frontend::BytecodeEmitter::emitPropertyListObjLiteral(js::frontend` 1

**tab pid 4034** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.1 | Other 2, Idle 1 | 0 / 0 / 3 | poll_wait 3, ipc 2 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `read [libc.so.6]` 1

