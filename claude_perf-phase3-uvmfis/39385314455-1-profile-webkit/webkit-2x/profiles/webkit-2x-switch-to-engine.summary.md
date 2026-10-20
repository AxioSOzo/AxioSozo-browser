### webkit-2x switch-to-engine (profile pass)

**parent pid 8674** — 91 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 41 | 13.0 | JavaScript 19, Idle 6, DOM 6, Layout 5 | 3 / 26 / 12 | ipc 41, gc_cc 21, paint_layout 12, harness_diagnostics 10 |
| DOM Worker | 24 | 7.4 | JavaScript 23, Other 0 | 0 / 0 / 24 | subprocess_pipe_io 24, worker_messaging 24, ipc 24, js_ctypes 23 |
| BackgroundThreadPool #2 | 10 | 3.1 | Other 7, Idle 2 | 0 / 0 / 10 | ipc 10, native_receiver 7, memcpy_memset 4, image_container 3 |
| Compositor | 4 | 1.1 | Idle 2, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 2, memcpy_memset 1 |
| Renderer | 3 | 1.1 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| SwComposite | 3 | 0.8 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 3 |
| IPC I/O Parent | 2 | 0.7 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| WRSceneBuilder#0 | 1 | 0.5 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGenericInset<m` 3; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 2; `js::GetOwnPropertyDescriptor(JSContext*, JS::Handle<JSObject*>, JS::Ha` 2; `mozilla::dom::ChromeUtils::AddProfilerMarker(mozilla::dom::GlobalObjec` 2; `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:34` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 1; `webkitAvailability (chrome://browser/content/axiosozo/WebKitEngineAdap` 1

**tab pid 9229** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 15.0 | Other 38, JavaScript 4, DOM 3, Idle 1 | 0 / 5 / 43 | ipc 37, array_buffer_copy 15, gc_cc 13, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libexpat.so.1]` 3; `__strlen_evex [libc.so.6]` 2; `[]` 2; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 2; `__syscall_cancel_arch [libc.so.6]` 2; `[libssl3.so]` 2; `qcms::transform_util::compute_precache [libxul.so]` 2; `js::SharedImmutableScriptData::shareScriptData(js::FrontendContext*, R` 1

**tab pid 9235** — 48 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 47 | 14.8 | Other 39, JavaScript 4, DOM 2, Profiler 2 | 1 / 3 / 43 | ipc 35, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__strcmp_evex [libc.so.6]` 3; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `uhash_compareUChars_78 [libxul.so]` 2; `[]` 2; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.so]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `[libfontconfig.so.1]` 2

**tab pid 9079** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.6 | Idle 1, Graphics 1 | 0 / 0 / 2 | ipc 2, poll_wait 1, paint_layout 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsBlockFrame::GetChildList(mozilla::FrameChildListID) const [libxul.so` 1

