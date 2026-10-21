### webkit-2x switch-to-engine (profile pass)

**parent pid 8817** — 81 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 29 | 10.9 | Layout 10, JavaScript 7, Idle 6, DOM 5 | 0 / 19 / 10 | ipc 29, paint_layout 12, gc_cc 10, poll_wait 6 |
| Renderer | 25 | 9.1 | Graphics 23, Idle 2 | 0 / 0 / 25 | ipc 25, webrender_render 23, webrender_sw_raster 22, poll_wait 8 |
| DOM Worker | 12 | 4.3 | JavaScript 9, Profiler 1, GC / CC 1 | 0 / 0 / 12 | subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 9 |
| BackgroundThreadPool #2 | 5 | 1.8 | Idle 3, Other 2 | 0 / 0 / 5 | ipc 5, poll_wait 3, native_receiver 2, memcpy_memset 2 |
| Compositor | 2 | 0.8 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_render 0, poll_wait 0 |
| SwComposite | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |
| IPC I/O Parent | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `nsIFrame* nsCSSFrameConstructor::FindSibling<(nsCSSFrameConstructor::S` 5; `__lll_lock_wake [libc.so.6]` 3; `mozilla::dom::ResizeObserver::GatherActiveObservations(unsigned int) [` 2; `[unknown]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `bool nsTArray_Impl<mozilla::StyleViewTimeline, nsTArrayInfallibleAlloc` 1; `[axiosozo-dev]` 1

**tab pid 9507** — 30 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 29 | 33.5 | Other 23, Profiler 2, JavaScript 2, DOM 1 | 0 / 3 / 26 | ipc 22, array_buffer_copy 9, gc_cc 7, subprocess_pipe_io 2 |
| IPC I/O Child | 1 | 0.9 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.2 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `JSLinearString* JSRope::flattenInternal<(JSRope::UsingBarrier)0, unsig` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 2; `icu_78::UnicodeString::UnicodeString(icu_78::UnicodeString const&) [li` 2; `js::frontend::ParserAtomsTable::markUsedByStencil(js::frontend::Tagged` 1; `l10nregistry_register_parent_process_sources [libxul.so]` 1; `__strcmp_evex [libc.so.6]` 1; `[]` 1

**tab pid 9504** — 20 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 20 | 64.6 | Other 18, Profiler 2 | 0 / 0 / 20 | ipc 12, array_buffer_copy 9, gc_cc 2 |
| IPC I/O Child | 0 | 1.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | None | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `prctl [libc.so.6]` 2; `__read_nocancel [libc.so.6]` 2; `FcConfigGetCurrent [libfontconfig.so.1]` 1; `__strlen_evex [libc.so.6]` 1; `fstatat64 [libc.so.6]` 1

**tab pid 9361** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.5 | Idle 1, Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1, paint_layout 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::layers::ImageBridgeParent::GetContentId() [libxul.so]` 1; `non-virtual thunk to mozilla::PresShell::QueryInterface(nsID const&, v` 0

