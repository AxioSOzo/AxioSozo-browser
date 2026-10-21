### webkit-2x switch-to-gecko (profile pass)

**parent pid 8784** — 187 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 84 | 27.3 | JavaScript 36, Layout 15, Graphics 9, DOM 8 | 2 / 53 / 30 | ipc 84, paint_layout 28, array_buffer_copy 24, gc_cc 16 |
| Renderer | 55 | 17.9 | Graphics 49, Idle 6 | 0 / 0 / 55 | ipc 54, webrender_render 49, webrender_sw_raster 48, poll_wait 6 |
| DOM Worker | 18 | 5.9 | JavaScript 15, Profiler 2, Idle 1 | 0 / 0 / 18 | subprocess_pipe_io 18, worker_messaging 18, ipc 18, poll_wait 16 |
| BgIOThreadPool #3 | 10 | 3.4 | Other 10, Idle 0 | 0 / 0 / 10 | ipc 10, poll_wait 0 |
| Compositor | 5 | 1.5 | Idle 2, Other 2 | 0 / 0 / 5 | ipc 5, poll_wait 2 |
| WRRenderBackend#0 | 4 | 1.3 | Other 4 | 0 / 0 / 4 |  |
| SwComposite | 4 | 1.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 3, memcpy_memset 0, webrender_sw_raster 0 |
| WRSceneBuilder#0 | 3 | 1.0 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |

Main thread, top self: `js::jit::BytecodeAnalysis::init() [libxul.so]` 9; `__syscall_cancel_arch [libc.so.6]` 6; `[axiosozo-dev]` 5; `mozilla::image::SurfaceCache::LookupBestMatch(mozilla::image::ImageRes` 4; `[unknown]` 4; `mozilla::layers::HitTestInfoManager::ProcessItem(mozilla::nsDisplayIte` 4; `int ToIntegerCommon<char, int>(nsTSubstring<char> const&, nsresult*, u` 4; `nsGridContainerFrame::Tracks::ResolveIntrinsicSizeForNonSpanningItems(` 3

**tab pid 9346** — 32 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 30 | 9.9 | JavaScript 9, Other 6, Profiler 5, Idle 4 | 0 / 8 / 22 | ipc 23, gc_cc 8, subprocess_pipe_io 6, poll_wait 5 |
| IPC I/O Child | 2 | 0.5 | Idle 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 3; `gecko_profiler_current_thread_is_registered [libxul.so]` 2; `profiler_capture_backtrace_into(mozilla::ProfileChunkedBuffer&, mozill` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `js::frontend::PropertyEmitter::emitInit(js::frontend::AccessorType, js` 1; `ulocimp_addLikelySubtags_78(char const*, icu_78::ByteSink&, UErrorCode` 1; `js::NewPlainObject(JSContext*, js::NewObjectOptions const&) [libxul.so` 1

**tab pid 8871** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 1.8 | Idle 3, JavaScript 2, Other 0 | 0 / 2 / 3 | ipc 6, poll_wait 3, array_buffer_copy 3, gc_cc 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `WarpScriptOracle::maybeInlineIC(mozilla::LinkedList<js::jit::WarpOpSna` 2

**tab pid 9491** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

