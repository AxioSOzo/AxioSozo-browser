### webkit switch-to-gecko (profile pass)

**parent pid 7188** — 114 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 66 | 23.7 | JavaScript 24, Layout 11, Other 10, DOM 10 | 5 / 36 / 26 | ipc 66, paint_layout 15, array_buffer_copy 13, harness_diagnostics 13 |
| Renderer | 17 | 6.2 | Graphics 16, Idle 1 | 0 / 0 / 17 | ipc 17, webrender_render 16, webrender_sw_raster 15, poll_wait 1 |
| DOM Worker | 14 | 5.1 | JavaScript 14, Idle 0 | 0 / 0 / 14 | subprocess_pipe_io 14, worker_messaging 14, ipc 14, poll_wait 13 |
| BgIOThreadPool #2 | 6 | 2.0 | Other 6, Idle 0 | 0 / 0 / 6 | ipc 6, poll_wait 0 |
| Compositor | 3 | 1.0 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRSceneBuilder#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_scene 2, memcpy_memset 0, webrender_render 0 |
| WRRenderBackend#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 |  |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 12; `mozilla::TaskController::MaybeInterruptTask(mozilla::Task*, mozilla::d` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `next (self-hosted:392:27)[25]` 3; `mozilla::TimingParams::FromEffectTiming(mozilla::dom::EffectTiming con` 2; `mozilla::ScrollContainerFrame::ComputeScrolledRect(nsIFrame const*) co` 2; `[unknown]` 2; `nsIFrame::ISizeComputationResult nsIFrame::ComputeISizeValue<mozilla::` 2

**tab pid 7593** — 27 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 25 | 9.1 | JavaScript 7, Other 7, Idle 5, Layout 3 | 1 / 8 / 16 | ipc 21, gc_cc 7, poll_wait 5, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 1; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNative::CallMo` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, mozilla::U` 1; `nsBaseCommandController::Release() [libxul.so]` 1; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 1

**tab pid 7285** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.2 | Idle 3, JavaScript 0, Profiler 0, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, array_buffer_copy 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `[]` 0; `js::SavedStacks::getLocation(JSContext*, js::FrameIter const&, JS::Mut` 0; `AddPromiseReaction(JSContext*, JS::Handle<js::PromiseObject*>, JS::Han` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 7735** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

