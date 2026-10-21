### webkit-2x switch-to-engine (profile pass)

**parent pid 8803** — 104 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 35 | 13.0 | JavaScript 15, Idle 7, DOM 5, Layout 4 | 1 / 22 / 11 | ipc 35, gc_cc 19, array_buffer_copy 9, harness_diagnostics 7 |
| Renderer | 25 | 9.3 | Graphics 20, Idle 6 | 0 / 0 / 25 | ipc 25, webrender_render 20, webrender_sw_raster 18, poll_wait 7 |
| DOM Worker | 16 | 5.8 | JavaScript 16 | 0 / 0 / 16 | subprocess_pipe_io 16, js_ctypes 16, worker_messaging 16, ipc 16 |
| BackgroundThreadPool #1 | 14 | 5.3 | Other 11, Idle 3 | 0 / 0 / 14 | ipc 14, native_receiver 11, memcpy_memset 6, image_container 5 |
| SwComposite | 4 | 1.3 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 3, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 2 | 0.9 | Idle 2, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Parent | 2 | 0.8 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| WRRenderBackend#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `mozilla::dom::GetOrCreateDOMReflectorHelper<mozilla::dom::NonNull<mozi` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 3; `js::jit::CacheIRStubKey::match(js::jit::CacheIRStubKey const&, js::jit` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 2; `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:45` 1; `mojo::core::ports::Node::PrepareToForwardUserMessage(mojo::core::ports` 1; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*, JS::Handl` 1

**tab pid 9492** — 44 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 43 | 17.0 | Other 35, JavaScript 4, DOM 2, Profiler 1 | 0 / 4 / 39 | ipc 32, array_buffer_copy 14, gc_cc 13, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 6; `__read_nocancel [libc.so.6]` 3; `[libexpat.so.1]` 2; `mmap64 [libc.so.6]` 2; `__strcmp_evex [libc.so.6]` 1; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<Pref> >, Pr` 1; `__syscall_cancel_arch [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1

**tab pid 9497** — 41 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 40 | 26.0 | Other 31, JavaScript 4, DOM 3, Profiler 2 | 0 / 4 / 37 | ipc 29, array_buffer_copy 13, gc_cc 10, memcpy_memset 5 |
| IPC I/O Child | 0 | 0.3 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `__strlen_evex [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `js::frontend::ParserAtomsTable::internLatin1(js::FrontendContext*, uns` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `decltype(auto) mozilla::detail::VariantImplementation<bool, 0ul, Prefs` 1

**tab pid 9348** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.6 | Idle 1, Graphics 0, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, paint_layout 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `<std::sys::sync::once::futex::Once>::call [libxul.so]` 0; `nsQueryInterfaceISupports::operator()(nsID const&, void**) const [libx` 0

