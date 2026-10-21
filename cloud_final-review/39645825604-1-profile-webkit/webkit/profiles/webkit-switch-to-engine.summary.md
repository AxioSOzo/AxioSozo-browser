### webkit switch-to-engine (profile pass)

**parent pid 7154** — 53 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 28 | 12.1 | Idle 9, DOM 7, Layout 5, JavaScript 4 | 1 / 13 / 14 | ipc 28, poll_wait 10, paint_layout 9, gc_cc 8 |
| DOM Worker | 10 | 4.4 | JavaScript 10 | 0 / 0 / 10 | subprocess_pipe_io 10, worker_messaging 10, ipc 10, js_ctypes 10 |
| Renderer | 6 | 2.7 | Idle 5, Graphics 1 | 0 / 0 / 6 | ipc 6, poll_wait 5, webrender_render 1, webrender_sw_raster 1 |
| IPC I/O Parent | 2 | 0.8 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Compositor | 2 | 0.7 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| BackgroundThreadPool #3 | 2 | 0.7 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 1 | 0.5 | Other 1 | 0 / 0 / 1 |  |
| WRSceneBuilder#0 | 1 | 0.5 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 10; `mozilla::dom::Element::GetScrollRange() [libxul.so]` 3; `nsOverflowContinuationTracker::nsOverflowContinuationTracker(nsContain` 2; `UpdateCurrentHitTestInfo(mozilla::nsDisplayListBuilder*, nsIFrame*) [l` 1; `nsRect::Intersect(nsRect const&) const [libxul.so]` 1; `nsNativeTheme::IsWidgetAlwaysNonNative(nsIFrame*, mozilla::StyleAppear` 1; `TimerThread::RemoveTimerInternal(nsTimerImpl&) [libxul.so]` 1; `geckoprofiler::markers::detail::profiler_get_inner_window_id_from_docs` 1

**tab pid 7860** — 32 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 31 | 38.6 | Other 25, Profiler 2, DOM 2, JavaScript 2 | 1 / 2 / 29 | ipc 25, array_buffer_copy 10, gc_cc 9, subprocess_pipe_io 2 |
| IPC I/O Child | 0 | 0.5 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.2 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `prctl [libc.so.6]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `getdents64 [libc.so.6]` 2; `[]` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `[libexpat.so.1]` 1; `access [libc.so.6]` 1

**tab pid 7855** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 28 | 37.4 | Other 20, DOM 3, Profiler 2, JavaScript 2 | 0 / 1 / 27 | ipc 22, array_buffer_copy 8, gc_cc 8, subprocess_pipe_io 3 |
| IPC I/O Child | 0 | 0.7 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.3 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `__lll_lock_wake [libc.so.6]` 2; `__strlen_evex [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `js::gc::GCRuntime::getOrAllocChunk(js::gc::StallAndRetry, js::AutoLock` 1; `icu_78::LSR::indexForRegion(char const*) [libxul.so]` 1; `PrefsIter::Elem::SkipDuplicates() [libxul.so]` 1

**tab pid 7709** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, gc_cc 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::CycleCollectedJSContext::AfterProcessMicrotasks() [libxul.so]` 0

