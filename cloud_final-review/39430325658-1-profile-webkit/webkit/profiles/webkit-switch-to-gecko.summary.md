### webkit switch-to-gecko (profile pass)

**parent pid 7188** — 170 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 94 | 29.7 | JavaScript 30, Layout 24, DOM 12, Graphics 10 | 3 / 47 / 44 | ipc 94, paint_layout 32, array_buffer_copy 26, gc_cc 16 |
| Renderer | 32 | 9.9 | Graphics 27, Idle 4 | 0 / 0 / 32 | ipc 31, webrender_render 27, webrender_sw_raster 25, poll_wait 4 |
| DOM Worker | 15 | 4.8 | JavaScript 14, Idle 1, Profiler 1, Other 0 | 0 / 0 / 15 | subprocess_pipe_io 15, worker_messaging 15, ipc 15, poll_wait 14 |
| BgIOThreadPool #2 | 12 | 3.7 | Other 11, Idle 0 | 0 / 0 / 12 | ipc 12, poll_wait 0 |
| WRRenderBackend#0 | 4 | 1.2 | Other 4 | 0 / 0 / 4 |  |
| Compositor | 4 | 1.2 | Idle 3, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 3 |
| WRSceneBuilder#0 | 3 | 1.0 | Other 3, Graphics 0 | 0 / 0 / 3 | webrender_scene 3, memcpy_memset 0, webrender_render 0, canvas_2d 0 |
| IPC I/O Parent | 3 | 0.9 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[unknown]` 4; `nsLayoutUtils::ComputeCBDependentValue(int, mozilla::UniqueOrNonOwning` 4; `mozilla::StyleGenericBackgroundSize<mozilla::StyleLengthPercentage>::S` 3; `mozilla::dom::BindingJSObjectCreator<nsWindowRoot>::CreateObject(JSCon` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `nsIFrame::IsReplaced() const [libxul.so]` 2; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 2

**tab pid 7739** — 34 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 32 | 9.9 | JavaScript 12, Other 10, Idle 5, Layout 3 | 0 / 11 / 20 | ipc 28, gc_cc 11, subprocess_pipe_io 8, poll_wait 5 |
| IPC I/O Child | 2 | 0.6 | Idle 2, Profiler 0, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `nsGlobalWindowOuter::GetGlobalJSObject() [libxul.so]` 3; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 2; `[]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `nsStyleUIReset::~nsStyleUIReset() [libxul.so]` 1; `mozInlineSpellChecker::CanEnableInlineSpellChecking() [libxul.so]` 1; `js::gc::BarrieredPtrImpl<JS::Value, 6u>::BarrieredPtrImpl(JS::Value co` 1

**tab pid 7274** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.3 | Idle 3, Other 1, JavaScript 1 | 0 / 0 / 4 | ipc 4, poll_wait 4, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 0; `mozilla::dom::CallSetup::CheckBeforeExecution(nsIGlobalObject*, JSObje` 0; `ResolvePromise(JSContext*, JS::Handle<js::PromiseObject*>, JS::Handle<` 0

**tab pid 7337** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Other 0, Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

