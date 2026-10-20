### webkit-2x switch-to-engine (profile pass)

**parent pid 8720** — 194 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 101 | 14.7 | JavaScript 63, Other 34, GC / CC 3, Profiler 0 | 0 / 0 / 101 | subprocess_pipe_io 101, worker_messaging 101, ipc 101, js_ctypes 44 |
| GeckoMain | 70 | 10.2 | JavaScript 30, DOM 13, Idle 12, Other 7 | 11 / 34 / 25 | ipc 70, gc_cc 24, worker_messaging 24, paint_layout 22 |
| Renderer | 14 | 2.1 | Graphics 13, Idle 1 | 0 / 0 / 14 | ipc 14, webrender_render 13, webrender_sw_raster 10, poll_wait 1 |
| IPC I/O Parent | 3 | 0.4 | Idle 3 | 0 / 0 / 3 | poll_wait 3 |
| Compositor | 2 | 0.2 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, paint_layout 0, canvas_2d 0 |
| SwComposite | 2 | 0.2 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 1, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 |  |
| WRSceneBuilder#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 13; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 9; `__memmove_evex_unaligned_erms [libc.so.6]` 8; `__lll_lock_wake [libc.so.6]` 5; `ARGBSetRow_X86 [libxul.so]` 4; `mozilla::IMEStateManager::SetIMEState(mozilla::widget::IMEState const&` 2; `JSScript::fromStencil(JSContext*, js::frontend::CompilationAtomCache&,` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 2

**tab pid 9364** — 54 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 53 | 8.3 | Other 44, JavaScript 5, DOM 2, Idle 1 | 0 / 4 / 48 | ipc 40, array_buffer_copy 19, gc_cc 14, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 5; `syscall [libc.so.6]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `[libexpat.so.1]` 2; `PrefsIter::Next() [libxul.so]` 2; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 2; `mozilla::StaticPrefs::InitStaticPrefsFromShared() [libxul.so]` 1; `js::jit::CallIRGenerator::tryAttachCallScripted(JS::Handle<JSFunction*` 1

**tab pid 9270** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, paint_layout 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::EventTargetChainItem::GetEventTargetParent(mozilla::EventChai` 0

**tab pid 8810** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0

