### webkit-2x switch-to-engine (profile pass)

**parent pid 8823** — 126 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 13.3 | JavaScript 16, Idle 9, Layout 7, DOM 7 | 0 / 31 / 18 | ipc 49, gc_cc 23, paint_layout 13, array_buffer_copy 11 |
| Renderer | 24 | 6.6 | Graphics 22, Idle 2 | 0 / 0 / 24 | ipc 24, webrender_render 22, webrender_sw_raster 18, poll_wait 2 |
| DOM Worker | 23 | 6.2 | JavaScript 22, Profiler 1 | 0 / 0 / 23 | subprocess_pipe_io 23, worker_messaging 23, ipc 23, js_ctypes 21 |
| BackgroundThreadPool #3 | 18 | 4.8 | Other 14, Idle 4 | 0 / 0 / 18 | ipc 18, native_receiver 14, image_container 9, poll_wait 4 |
| Compositor | 3 | 0.9 | Other 2, Idle 1, Profiler 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, webrender_render 0, paint_layout 0 |
| WRRenderBackend#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.5 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |
| IPC I/O Parent | 2 | 0.4 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 9; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&, mozilla::` 3; `mozilla::dom::Document::GetTitleElement() [libxul.so]` 3; `mprotect [libc.so.6]` 2; `js::EqualChars(JSLinearString const*, JSLinearString const*) [libxul.s` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `getcontext [libc.so.6]` 2; `[unknown]` 2

**tab pid 9523** — 58 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 56 | 15.8 | Other 44, JavaScript 4, DOM 4, Profiler 3 | 0 / 7 / 50 | ipc 43, array_buffer_copy 21, gc_cc 15, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `[]` 3; `[libexpat.so.1]` 3; `__memcmp_avx2_movbe [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `mozilla::dom::InitScriptSettings() [libxul.so]` 2; `bool v8::internal::regexp::Parser::VerifyRegExpSyntax<char16_t>(v8::in` 2; `__strcmp_avx2 [libc.so.6]` 1

**tab pid 9383** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.3 | Idle 1, Graphics 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, paint_layout 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0

**tab pid 9529** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

