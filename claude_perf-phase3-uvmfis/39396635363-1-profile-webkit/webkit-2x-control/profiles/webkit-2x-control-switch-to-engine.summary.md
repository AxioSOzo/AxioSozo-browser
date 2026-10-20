### webkit-2x-control switch-to-engine (profile pass)

**parent pid 10786** — 123 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 44 | 7.4 | JavaScript 19, Idle 9, Other 6, DOM 3 | 2 / 26 / 16 | ipc 44, gc_cc 22, harness_diagnostics 11, poll_wait 10 |
| DOM Worker | 43 | 7.1 | JavaScript 38, Profiler 4, Idle 1 | 0 / 0 / 43 | subprocess_pipe_io 43, worker_messaging 43, ipc 43, poll_wait 36 |
| Renderer | 13 | 2.2 | Graphics 12, Idle 1 | 0 / 0 / 13 | ipc 13, webrender_render 12, webrender_sw_raster 11, poll_wait 1 |
| BackgroundThreadPool #1 | 10 | 1.7 | Idle 5, Other 5 | 0 / 0 / 10 | ipc 10, poll_wait 5, native_receiver 5, memcpy_memset 3 |
| IPC I/O Parent | 3 | 0.4 | Idle 3 | 0 / 0 / 3 | poll_wait 3 |
| Compositor | 3 | 0.4 | Idle 2, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, memcpy_memset 0, webrender_render 0 |
| SwComposite | 2 | 0.4 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |
| WRSceneBuilder#0 | 2 | 0.3 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 11; `mozilla::EventTargetChainItem::HandleEvent(mozilla::EventChainPostVisi` 4; `[axiosozo-dev]` 2; `[unknown]` 2; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js::SharedShape*> cons` 2; `v8::internal::regexp::IrregexpInterpreter::Result v8::internal::regexp` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `js::jit::MaybeEnterJit(JSContext*, js::RunState&) [libxul.so]` 1

**tab pid 11430** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 8.3 | Other 38, Profiler 4, DOM 4, JavaScript 2 | 0 / 5 / 44 | ipc 37, array_buffer_copy 17, gc_cc 10, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 6; `__strcmp_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `_uhash_put(UHashtable*, UElement, UElement, signed char, UErrorCode*) ` 2; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `syscall [libc.so.6]` 2; `mozilla::detail::HashTable<std::unique_ptr<Pref, std::default_delete<P` 2

**tab pid 11436** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 10.9 | Other 40, JavaScript 4, DOM 3, Profiler 1 | 0 / 4 / 44 | ipc 37, array_buffer_copy 17, gc_cc 11, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libexpat.so.1]` 4; `__read_nocancel [libc.so.6]` 3; `syscall [libc.so.6]` 2; `PLDHashTable::MakeEntryHandle(void const*, std::nothrow_t const&) [lib` 2; `__strcmp_evex [libc.so.6]` 2; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `__strlen_evex [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1

**tab pid 11332** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.3 | Idle 2, Profiler 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `[]` 0

