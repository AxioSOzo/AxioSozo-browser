### webkit-2x switch-to-gecko (profile pass)

**parent pid 8823** — 192 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 85 | 27.3 | JavaScript 39, Layout 14, Graphics 13, Other 11 | 4 / 41 / 41 | ipc 85, paint_layout 29, array_buffer_copy 23, harness_diagnostics 12 |
| Renderer | 59 | 18.9 | Graphics 52, Idle 7 | 0 / 0 / 59 | ipc 56, webrender_render 52, webrender_sw_raster 49, poll_wait 7 |
| DOM Worker | 16 | 5.2 | JavaScript 15, Profiler 1, Idle 0 | 0 / 0 / 16 | subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15 |
| BgIOThreadPool #3 | 11 | 3.5 | Other 10, Idle 1 | 0 / 0 / 11 | ipc 11, poll_wait 1 |
| SwComposite | 5 | 1.6 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 5 |
| Compositor | 4 | 1.3 | Idle 4 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| WRRenderBackend#0 | 4 | 1.2 | Other 4 | 0 / 0 / 4 |  |
| IPC I/O Parent | 3 | 0.9 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 10; `mozilla::DisplayListClipState::AutoSaveRestore::AutoSaveRestore(mozill` 7; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 7; `[unknown]` 5; `selectors::matching::matches_simple_selector [libxul.so]` 4; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `[axiosozo-dev]` 3; `mozilla::ReflowInput::ComputeMinMaxValues(mozilla::LogicalSize const&)` 3

**tab pid 9383** — 31 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 29 | 9.2 | Other 9, JavaScript 8, Idle 5, DOM 3 | 1 / 7 / 21 | ipc 26, gc_cc 7, poll_wait 5, subprocess_pipe_io 4 |
| IPC I/O Child | 2 | 0.6 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::frontend::GeneralParser<js::frontend::FullParseHandler, mozilla::U` 2; `defineProperty (self-hosted:2717:30)[16]` 1; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 1; `js::NewObjectWithGivenTaggedProto(JSContext*, JSClass const*, JS::Hand` 1

**tab pid 8911** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 1.8 | Idle 5, JavaScript 0, DOM 0, Other 0 | 0 / 0 / 5 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `XPCConvert::NativeInterface2JSObject(JSContext*, JS::MutableHandle<JS:` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[6]` 0; `xpc::JSXrayTraits::resolveOwnProperty(JSContext*, JS::Handle<JSObject*` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 9523** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

