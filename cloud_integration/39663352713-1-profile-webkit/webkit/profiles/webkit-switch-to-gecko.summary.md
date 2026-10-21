### webkit switch-to-gecko (profile pass)

**parent pid 7154** — 118 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 65 | 22.8 | JavaScript 27, Idle 10, Other 8, Layout 6 | 3 / 35 / 27 | ipc 65, poll_wait 17, array_buffer_copy 16, gc_cc 14 |
| Renderer | 18 | 6.3 | Graphics 14, Idle 4 | 0 / 0 / 18 | ipc 18, webrender_render 14, webrender_sw_raster 14, poll_wait 4 |
| DOM Worker | 13 | 4.4 | JavaScript 12, Idle 0, Profiler 0 | 0 / 0 / 13 | subprocess_pipe_io 13, worker_messaging 13, ipc 13, js_ctypes 12 |
| BgIOThreadPool #1 | 10 | 3.6 | Other 10, Idle 0 | 0 / 0 / 10 | ipc 10, poll_wait 0 |
| Compositor | 3 | 0.9 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRRenderBackend#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_render 0, poll_wait 0 |
| IPC I/O Parent | 2 | 0.8 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `mprotect [libc.so.6]` 4; `mozilla::layers::ClipManager::SwitchItem(mozilla::nsDisplayListBuilder` 3; `nsIFrame::IsTransformed() const [libxul.so]` 3; `__lll_lock_wait [libc.so.6]` 2; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::Value>, js:` 2

**tab pid 7696** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 9.2 | Other 9, JavaScript 7, Idle 5, Layout 4 | 0 / 8 / 18 | ipc 25, paint_layout 13, gc_cc 10, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.5 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libfontconfig.so.1]` 4; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, JS::Handle<` 2; `nsBaseURLParser::ParsePath(char const*, int, unsigned int*, int*, unsi` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `mozilla::net::nsStandardURL::CoalescePath(char*) [libxul.so]` 1; `js::frontend::ParseContext::Scope::propagateAndMarkAnnexBFunctionBoxes` 1; `mozilla::PresShell::GetInProcessEmbedderFrame() const [libxul.so]` 1

**tab pid 7242** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.3 | Idle 3, DOM 1, Other 0 | 0 / 1 / 3 | ipc 3, poll_wait 3, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandle<JS::Valu` 1; `[linux-vdso.so.1]` 0

**tab pid 7843** — 0 ms CPU in the window

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

