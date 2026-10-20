### chromium-2x switch-to-engine (profile pass)

**parent pid 3331** — 242 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 103 | 34.4 | Graphics 99, Idle 3, Other 1 | 0 / 0 / 103 | ipc 103, webrender_render 100, webrender_sw_raster 82, poll_wait 3 |
| GeckoMain | 73 | 24.5 | Layout 21, Idle 17, DOM 14, JavaScript 12 | 1 / 35 / 36 | ipc 73, paint_layout 31, gc_cc 21, poll_wait 20 |
| BackgroundThreadPool #3 | 24 | 8.1 | Other 17, Idle 7 | 0 / 0 / 24 | ipc 24, native_receiver 17, image_container 12, poll_wait 6 |
| DOM Worker | 16 | 5.5 | JavaScript 16, Other 1 | 0 / 0 / 16 | subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15 |
| SwComposite | 6 | 2.0 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 5, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 6 | 2.0 | Other 4, Idle 2 | 0 / 0 / 6 | ipc 6, poll_wait 2, paint_layout 0 |
| WRRenderBackend#0 | 5 | 1.7 | Other 5 | 0 / 0 / 5 |  |
| WRSceneBuilder#0 | 3 | 1.1 | Other 3 | 0 / 0 / 3 | webrender_scene 3, paint_layout 0 |

Main thread, top self: `poll [libc.so.6]` 17; `mozilla::EffectCompositor::PreTraverseInSubtree(mozilla::ServoTraversa` 6; `mozilla::dom::Document::EndUpdate() [libxul.so]` 5; `nsIFrame::IsTransformed() const [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 4; `wr_dp_push_image [libxul.so]` 3; `style::rule_tree::core::StrongRuleNode::ensure_child [libxul.so]` 2; `style::stylist::Stylist::push_applicable_declarations [libxul.so]` 2

**tab pid 4213** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 18.4 | Other 38, DOM 4, JavaScript 4, Idle 1 | 0 / 6 / 42 | ipc 36, array_buffer_copy 14, gc_cc 10, memcpy_memset 5 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 8; `[libexpat.so.1]` 3; `mozilla::dom::WebExtensionPolicy_Binding::getByID(JSContext*, unsigned` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__strncmp_avx2 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `[libfontconfig.so.1]` 1; `__strlen_avx2 [libc.so.6]` 1

**tab pid 4218** — 48 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 47 | 20.8 | Other 35, Profiler 5, DOM 4, JavaScript 3 | 0 / 5 / 43 | ipc 34, array_buffer_copy 14, gc_cc 10, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libfontconfig.so.1]` 4; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<Pref> >, Pr` 3; `getcontext [libc.so.6]` 3; `mmap64 [libc.so.6]` 3; `__strlen_avx2 [libc.so.6]` 2; `[]` 2; `icu_78::LikelySubtagsData::load(UErrorCode&) [libxul.so]` 2; `core::ptr::drop_in_place<regex_automata::nfa::thompson::compiler::Comp` 2

**tab pid 4024** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.0 | Idle 2, Layout 1, Other 0, Profiler 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, paint_layout 1 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `mozilla::AutoProfilerStyleMarker::~AutoProfilerStyleMarker() [libxul.s` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `[]` 0

