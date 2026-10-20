### webkit switch-to-engine (profile pass)

**parent pid 7188** — 126 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 58 | 9.4 | JavaScript 23, Idle 11, DOM 10, Layout 9 | 5 / 31 / 23 | ipc 58, paint_layout 21, gc_cc 20, worker_messaging 19 |
| DOM Worker | 51 | 8.3 | JavaScript 42, Profiler 6, Other 3, Idle 0 | 0 / 0 / 51 | subprocess_pipe_io 51, worker_messaging 51, ipc 51, js_ctypes 34 |
| Renderer | 7 | 1.2 | Graphics 7, Idle 1 | 0 / 0 / 7 | ipc 7, webrender_render 7, webrender_sw_raster 7, poll_wait 1 |
| IPC I/O Parent | 3 | 0.5 | Idle 2, Other 1 | 0 / 0 / 3 | poll_wait 2, ipc 1 |
| Compositor | 2 | 0.3 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, webrender_render 0 |
| WRSceneBuilder#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 | webrender_scene 1, memcpy_memset 0 |
| WRRenderBackend#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 |  |
| SwComposite | 1 | 0.1 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 12; `ARGBSetRow_X86 [libxul.so]` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 4; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 4; `[unknown]` 3; `nsFlexContainerFrame::DoFlexLayout(mozilla::ReflowInput const&, int, i` 2; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned char const*, ` 2; `__lll_lock_wait [libc.so.6]` 2

**tab pid 7817** — 51 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 50 | 8.7 | Other 40, Profiler 4, JavaScript 3, DOM 2 | 0 / 3 / 46 | ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 6; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 3; `[libexpat.so.1]` 3; `mmap64 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `doLoadFromCommonData(signed char, char const*, char const*, char const` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 7820** — 38 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 6.0 | Other 27, JavaScript 5, DOM 4, Idle 2 | 0 / 4 / 34 | ipc 29, array_buffer_copy 13, gc_cc 7, subprocess_pipe_io 3 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry const*) [lib` 3; `[]` 3; `nsTSubstring<char>::ReplaceLiteral(unsigned long, unsigned long, char ` 3; `array_proto_finish(JSContext*, JS::Handle<JSObject*>, JS::Handle<JSObj` 3; `[libfontconfig.so.1]` 2; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<Pref> >, Pr` 2; `mozilla::dom::ConsoleListener::QueryInterface(nsID const&, void**) [li` 1

**tab pid 7731** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.3 | Idle 1, Profiler 0 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 0, paint_layout 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 0

