### webkit switch-to-engine (profile pass)

**parent pid 7154** — 86 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 12.4 | JavaScript 22, Other 4, Idle 4, Graphics 3 | 4 / 20 / 14 | ipc 37, gc_cc 16, array_buffer_copy 11, harness_diagnostics 8 |
| DOM Worker | 22 | 7.4 | JavaScript 19, Profiler 3, Other 1 | 0 / 0 / 22 | subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 18 |
| Renderer | 12 | 3.9 | Graphics 9, Idle 3 | 0 / 0 / 12 | ipc 12, webrender_render 9, webrender_sw_raster 8, poll_wait 3 |
| BackgroundThreadPool #3 | 3 | 1.0 | Other 2, Idle 1 | 0 / 0 / 3 | ipc 3, native_receiver 2, poll_wait 1, memcpy_memset 1 |
| Compositor | 3 | 1.0 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRRenderBackend#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 1 | 0.5 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |
| SwComposite | 1 | 0.5 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[unknown]` 4; `goSetCommandEnabled (chrome://global/content/globalOverlay.js:133:29)[` 3; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 3; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 2; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [axiosozo-d` 2; `[axiosozo-dev]` 1; `mozilla::nsDisplayItem::nsDisplayItem(mozilla::nsDisplayListBuilder*, ` 1

**tab pid 7843** — 38 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 12.4 | Other 27, DOM 5, Profiler 4, JavaScript 1 | 0 / 6 / 32 | ipc 36, array_buffer_copy 19, gc_cc 7, memcpy_memset 1 |
| IPC I/O Child | 0 | 0.2 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__lll_lock_wake [libc.so.6]` 4; `[libexpat.so.1]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `access [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::TokenizerBase<char>::Token::Token() [libxul.so]` 2; `[]` 2; `icu_78::LikelySubtagsData::readLSREncodedStrings(icu_78::ResourceTable` 2

**tab pid 7696** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.6 | Idle 1, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, gc_cc 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `nsTString<char>* nsTArray_Impl<nsTString<char>, nsTArrayInfallibleAllo` 0

**tab pid 7849** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| GeckoMain | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `PR_IntervalNow [libnspr4.so]` 0

