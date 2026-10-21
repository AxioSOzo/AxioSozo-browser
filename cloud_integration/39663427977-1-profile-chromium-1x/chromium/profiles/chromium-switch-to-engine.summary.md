### chromium switch-to-engine (profile pass)

**parent pid 3461** — 187 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 118 | 43.2 | GC / CC 39, Layout 29, JavaScript 29, DOM 6 | 7 / 40 / 71 | ipc 118, gc_cc 74, paint_layout 39, array_buffer_copy 18 |
| Renderer | 32 | 11.7 | Graphics 26, Idle 6 | 0 / 0 / 32 | ipc 32, webrender_render 26, webrender_sw_raster 24, poll_wait 7 |
| DOM Worker | 16 | 5.9 | JavaScript 16 | 0 / 0 / 16 | subprocess_pipe_io 16, js_ctypes 16, worker_messaging 16, ipc 16 |
| BackgroundThreadPool #3 | 6 | 2.2 | Idle 3, Other 3 | 0 / 0 / 6 | ipc 6, poll_wait 3, native_receiver 3, memcpy_memset 2 |
| WRRenderBackend#0 | 4 | 1.5 | Other 4 | 0 / 0 / 4 |  |
| Compositor | 4 | 1.3 | Idle 4, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4, webrender_render 0 |
| WRSceneBuilder#0 | 3 | 1.1 | Other 3 | 0 / 0 / 3 | webrender_scene 3, webrender_render 0 |
| SwComposite | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |

Main thread, top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `mozilla::layers::AnimationInfo::EnumerateGenerationOnFrame(nsIFrame co` 6; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 6; `style::properties::generated::longhands::height::cascade_property [lib` 5; `poll [libc.so.6]` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4; `nsStylePadding::GetPadding(nsMargin&) const [libxul.so]` 4

**tab pid 4336** — 31 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 31 | 11.3 | Other 24, DOM 5, JavaScript 1, Idle 1 | 0 / 6 / 25 | ipc 30, gc_cc 15, array_buffer_copy 12, subprocess_pipe_io 8 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `js::SharedImmutableScriptData::createWith(js::FrontendContext*, std::u` 3; `icu_78::PropNameData::getPropertyValueName(int, int, int) [libxul.so]` 2; `icu_78::CharString::appendInvariantChars(char16_t const*, int, UErrorC` 2; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::AdvanceAcrossSeg` 2; `poll [libc.so.6]` 2; `u_UCharsToChars_78 [libxul.so]` 1; `(anonymous namespace)::NameResolver::visit(js::frontend::ParseNode*) [` 1

**tab pid 4331** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.6 | Other 3, Idle 1, GC / CC 1 | 0 / 0 / 4 | ipc 4, poll_wait 1, image_container 1, gc_cc 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsTimer::Cancel() [libxul.so]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `sendmsg [libc.so.6]` 1; `encoding_rs::utf_8::convert_utf16_to_utf8_partial_inner [libxul.so]` 1

**tab pid 4148** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.2 | Idle 2, Other 1 | 0 / 0 / 3 | poll_wait 3, ipc 2, paint_layout 0 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

