### chromium switch-to-engine (profile pass)

**parent pid 3299** — 91 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 53 | 35.1 | JavaScript 17, Layout 16, DOM 7, Graphics 7 | 1 / 27 / 26 | ipc 53, paint_layout 28, gc_cc 19, array_buffer_copy 11 |
| Renderer | 14 | 9.3 | Graphics 9, Idle 5 | 0 / 0 / 14 | ipc 14, webrender_render 9, poll_wait 8, webrender_sw_raster 5 |
| DOM Worker | 9 | 5.6 | JavaScript 9 | 0 / 0 / 9 | subprocess_pipe_io 9, worker_messaging 9, ipc 9, js_ctypes 8 |
| WRRenderBackend#0 | 3 | 2.1 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 2 | 1.4 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |
| Compositor | 2 | 1.4 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| BackgroundThreadPool #2 | 2 | 1.2 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, native_receiver 0 |
| DOM Worker | 1 | 1.0 | Other 1, Idle 0 | 0 / 0 / 1 | worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `mozilla::StyleGenericBorderImageSideWidth<mozilla::StyleLengthPercenta` 5; `js::frontend::TokenStreamSpecific<char16_t, js::frontend::ParserAnyCha` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `nsTArrayInfallibleAllocator::ResultTypeProxy nsTArray_base<nsTArray_Re` 3; `[unknown]` 2; `mozilla::dom::MutationObservers::NotifyAttributeWillChange(mozilla::do` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 4163** — 34 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 33 | 28.9 | Other 25, JavaScript 4, Profiler 2, Idle 1 | 0 / 4 / 29 | ipc 25, gc_cc 11, array_buffer_copy 9, subprocess_pipe_io 5 |
| IPC I/O Child | 0 | 0.4 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.2 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libfontconfig.so.1]` 3; `[libexpat.so.1]` 3; `__powf_fma [libm.so.6]` 3; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<PreferenceMa` 2; `[]` 2; `mozilla::detail::nsTStringRepr<char>::LowerCaseEqualsASCII(char const*` 2; `xpc::OpaqueXrayTraits::enumerateNames(JSContext*, JS::Handle<JSObject*` 2; `GkRust_Init [libxul.so]` 2

**tab pid 3973** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.7 | Idle 2, Graphics 1, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, paint_layout 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `mozilla::GetDisplayPortFromMarginsData(nsIContent*, mozilla::DisplayPo` 1; `mozilla::glean::HistogramIdForMetric(unsigned int) [libxul.so]` 0; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(unsigned int)` 0

**tab pid 4158** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

