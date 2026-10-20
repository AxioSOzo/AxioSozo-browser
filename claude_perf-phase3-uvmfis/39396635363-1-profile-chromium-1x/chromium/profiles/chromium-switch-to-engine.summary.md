### chromium switch-to-engine (profile pass)

**parent pid 3348** — 127 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 67 | 27.4 | Layout 29, JavaScript 16, Idle 16, Other 2 | 5 / 28 / 34 | ipc 67, paint_layout 25, poll_wait 17, gc_cc 17 |
| Renderer | 27 | 11.0 | Graphics 23, Idle 4 | 0 / 0 / 27 | ipc 27, webrender_render 23, webrender_sw_raster 23, poll_wait 4 |
| DOM Worker | 16 | 6.4 | JavaScript 14, Other 1, Profiler 1 | 0 / 0 / 16 | subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 14 |
| WRRenderBackend#0 | 4 | 1.6 | Other 4 | 0 / 0 / 4 | webrender_render 1 |
| WRSceneBuilder#0 | 3 | 1.2 | Other 3, Graphics 0 | 0 / 0 / 3 | webrender_scene 3, poll_wait 1, webrender_sw_raster 0, webrender_render 0 |
| Compositor | 3 | 1.2 | Idle 2, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2 |
| IPC I/O Parent | 3 | 1.1 | Idle 3 | 0 / 0 / 3 | poll_wait 3 |
| SwComposite | 3 | 1.0 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 2, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `poll [libc.so.6]` 16; `cssparser::parser::Parser::next_including_whitespace_and_comments [lib` 8; `nsContainerFrame::GetChildLists(nsTArray<mozilla::FrameChildList>*) co` 6; `style::invalidation::element::invalidator::TreeStyleInvalidator<E,P>::` 5; `style::custom_properties::do_substitute_chunk [libxul.so]` 4; `pretty (chrome://remote/content/shared/Format.sys.mjs:42:18)[101]` 3; `js::jit::InlineFrameIterator::InlineFrameIterator(JSContext*, js::jit:` 3; `[unknown]` 2

**tab pid 4190** — 53 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 52 | 22.2 | Other 43, DOM 4, JavaScript 3, Profiler 1 | 0 / 5 / 47 | ipc 39, array_buffer_copy 17, gc_cc 14, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `[libexpat.so.1]` 4; `__read_nocancel [libc.so.6]` 2; `icu_78::CharString::append(char, UErrorCode&) [libxul.so]` 2; `__memcmp_avx2_movbe [libc.so.6]` 2; `__strcmp_avx2 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1; `syscall [libc.so.6]` 1

**tab pid 4192** — 51 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 21.8 | Other 39, DOM 4, JavaScript 4, Profiler 2 | 0 / 4 / 46 | ipc 39, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 8 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, memcpy_memset 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libfontconfig.so.1]` 7; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(js::fronte` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `[]` 2; `lut_inverse_interp16 [libxul.so]` 2; `js::frontend::InstantiateMarkedAtoms(JSContext*, js::FrontendContext*,` 2; `_ZN7mozilla5MaybeI9nsTStringIcEEaSIS2_TnNSt9enable_ifIXsr3stdE18is_con` 1; `poll [libc.so.6]` 1

**tab pid 3995** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.5 | Idle 3, Layout 1, Other 0 | 0 / 0 / 4 | ipc 3, poll_wait 3, paint_layout 1 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `nsBlockFrame::TrialReflow(nsPresContext*, mozilla::ReflowOutput&, mozi` 1; `mozilla::EventListenerManager::HandleEventSingleListener(mozilla::Even` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

