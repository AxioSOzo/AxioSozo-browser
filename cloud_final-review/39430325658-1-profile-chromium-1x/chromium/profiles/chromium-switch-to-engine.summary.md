### chromium switch-to-engine (profile pass)

**parent pid 3144** — 119 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 61 | 32.9 | Idle 14, JavaScript 13, Other 12, Layout 10 | 2 / 26 / 33 | ipc 61, paint_layout 24, gc_cc 19, poll_wait 15 |
| Renderer | 26 | 14.1 | Graphics 23, Idle 4 | 0 / 0 / 26 | ipc 26, webrender_render 23, webrender_sw_raster 16, poll_wait 5 |
| DOM Worker | 11 | 6.0 | JavaScript 11, Other 0, Profiler 0 | 0 / 0 / 11 | subprocess_pipe_io 11, worker_messaging 11, ipc 11, js_ctypes 10 |
| BackgroundThreadPool #2 | 7 | 3.9 | Idle 4, Other 3 | 0 / 0 / 7 | ipc 7, poll_wait 4, native_receiver 3, memcpy_memset 2 |
| WRRenderBackend#0 | 3 | 1.7 | Other 3 | 0 / 0 / 3 |  |
| Compositor | 3 | 1.4 | Idle 2, Other 1 | 0 / 0 / 3 | ipc 3, poll_wait 2 |
| WRSceneBuilder#0 | 2 | 1.2 | Other 2, Graphics 0 | 0 / 0 / 2 | webrender_scene 2, canvas_2d 0, webrender_sw_raster 0 |
| SwComposite | 2 | 1.1 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 14; `__lll_lock_wait [libc.so.6]` 12; `mozilla::ReflowInput::ReflowInput(nsPresContext*, mozilla::ReflowInput` 3; `nsXULCommandDispatcher::Release() [libxul.so]` 3; `handleEvent (resource:///modules/zen/ZenWindowSync.sys.mjs:384:14)[187` 2; `servo_arc::Arc<T>::drop_slow [libxul.so]` 2; `nsIFrame::InkOverflowRectRelativeToSelf() const [libxul.so]` 2; `nsStyleTransformMatrix::MatrixForTransformFunction(mozilla::gfx::Matri` 2

**tab pid 3990** — 39 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 38 | 28.3 | Other 29, JavaScript 3, Idle 2, Profiler 2 | 0 / 4 / 34 | ipc 27, array_buffer_copy 9, gc_cc 9, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.4 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `js::frontend::FunctionBox::copyFunctionFields(js::frontend::ScriptSten` 3; `poll [libc.so.6]` 2; `[libexpat.so.1]` 2; `mozilla::StaticPrefs::InitStaticPrefsFromShared() [libxul.so]` 2; `__memcmp_evex_movbe [libc.so.6]` 2; `__strlen_evex [libc.so.6]` 1; `uhash_geti_78 [libxul.so]` 1; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<Pref> >, Pr` 1

**tab pid 3799** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.4 | Idle 2, Other 1 | 0 / 0 / 3 | poll_wait 3, ipc 2 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `mozilla::dom::BrowsingContext::TouchEventsOverride() const [libxul.so]` 0

**tab pid 3988** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.5 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

