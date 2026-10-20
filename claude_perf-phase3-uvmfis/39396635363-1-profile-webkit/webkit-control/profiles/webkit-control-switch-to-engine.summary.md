### webkit-control switch-to-engine (profile pass)

**parent pid 9829** — 110 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 43 | 7.0 | JavaScript 17, DOM 7, Idle 7, Layout 4 | 1 / 24 / 18 | ipc 41, gc_cc 21, worker_messaging 9, harness_diagnostics 9 |
| DOM Worker | 42 | 6.8 | JavaScript 36, Profiler 4, Other 1, Idle 0 | 0 / 0 / 42 | subprocess_pipe_io 42, worker_messaging 42, ipc 42, js_ctypes 34 |
| Renderer | 8 | 1.4 | Graphics 7, Idle 1, Other 0 | 0 / 0 / 8 | ipc 8, webrender_render 7, webrender_sw_raster 7, poll_wait 1 |
| BackgroundThreadPool #2 | 5 | 0.8 | Other 3, Idle 2 | 0 / 0 / 5 | ipc 5, native_receiver 3, poll_wait 2, image_container 2 |
| IPC I/O Parent | 4 | 0.6 | Idle 3, Other 1 | 0 / 0 / 4 | poll_wait 3, ipc 1, memcpy_memset 0 |
| Compositor | 2 | 0.4 | Idle 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 1, canvas_2d 0, webrender_render 0 |
| SwComposite | 2 | 0.3 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 1, webrender_sw_raster 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `[axiosozo-dev]` 3; `[unknown]` 2; `mozilla::CanAttemptToDrainMoreMicroTasks(mozilla::CycleCollectedJSCont` 2; `mozilla::EventListenerManager::HandleEventInternal(nsPresContext*, moz` 2; `[libxul.so]` 2; `nsContentUtils::RemoveScriptBlocker() [libxul.so]` 2; `mozilla::wr::ToImageRendering(mozilla::StyleImageRendering) [libxul.so` 2

**tab pid 10465** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 8.3 | Other 39, JavaScript 5, DOM 3, Profiler 1 | 0 / 4 / 44 | ipc 34, gc_cc 13, array_buffer_copy 13, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 3; `__read_nocancel [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.so]` 2; `__strlen_evex [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__strcmp_evex [libc.so.6]` 2

**tab pid 10468** — 44 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 43 | 9.7 | Other 31, JavaScript 5, DOM 3, Profiler 3 | 0 / 5 / 38 | ipc 34, array_buffer_copy 14, gc_cc 11, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__strlen_evex [libc.so.6]` 3; `[]` 2; `js::wasm::TypeContext::startRecGroup(unsigned int) [libxul.so]` 2; `[libfontconfig.so.1]` 2; `ustr_hashUCharsN_78 [libxul.so]` 2; `[libexpat.so.1]` 2; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 2; `nsresult mozilla::PreferencesImpl::GetSharedPrefValue<bool>(char const` 2

**tab pid 10372** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.3 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

