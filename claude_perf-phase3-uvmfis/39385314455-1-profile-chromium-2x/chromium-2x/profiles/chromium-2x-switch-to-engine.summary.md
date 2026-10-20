### chromium-2x switch-to-engine (profile pass)

**parent pid 3385** — 213 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 89 | 30.5 | Graphics 88, Idle 1 | 0 / 0 / 89 | ipc 89, webrender_render 88, webrender_sw_raster 84, memcpy_memset 1 |
| GeckoMain | 71 | 24.4 | Layout 21, JavaScript 19, Idle 12, Other 7 | 2 / 40 / 29 | ipc 71, paint_layout 26, gc_cc 25, array_buffer_copy 19 |
| BackgroundThreadPool #3 | 15 | 5.3 | Other 11, Idle 4 | 0 / 0 / 15 | ipc 15, native_receiver 11, memcpy_memset 6, image_container 5 |
| DOM Worker | 15 | 5.2 | JavaScript 14, Profiler 1 | 0 / 0 / 15 | subprocess_pipe_io 15, worker_messaging 15, ipc 15, js_ctypes 14 |
| SwComposite | 6 | 2.0 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 5, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 5 | 1.9 | Idle 5 | 0 / 0 / 5 | ipc 5, poll_wait 5 |
| WRRenderBackend#0 | 4 | 1.5 | Other 4 | 0 / 0 / 4 |  |
| WRSceneBuilder#0 | 3 | 1.0 | Other 3 | 0 / 0 / 3 | webrender_scene 3, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 12; `style::properties::cascade::Declarations::note_declaration [libxul.so]` 8; `mozilla::net::nsStandardURL::nsStandardURL(bool, bool) [libxul.so]` 7; `__lll_lock_wake [libc.so.6]` 4; `style::sharing::StyleSharingCache<E>::new [libxul.so]` 4; `js::jit::CacheIRWriter::copyStubData(unsigned char*) const [libxul.so]` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2

**tab pid 3958** — 18 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 18 | 6.2 | Other 10, JavaScript 4, DOM 2, Profiler 1 | 0 / 2 / 16 | ipc 18, gc_cc 11, subprocess_pipe_io 6, memcpy_memset 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `js::LexicalScope::RuntimeData* js::frontend::ScopeStencil::createSpeci` 1; `mmap64 [ld-linux-x86-64.so.2]` 1; `mozilla::CycleCollectedJSContext::Get() [libxul.so]` 1; `non-virtual thunk to mozilla::net::nsStandardURL::TemplatedMutator<moz` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, mozilla::U` 1; `js::SharedImmutableScriptData::shareScriptData(js::FrontendContext*, R` 1; `syscall [libc.so.6]` 1; `txStylesheetSink::AddRef() [libxul.so]` 1

**tab pid 3953** — 17 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 17 | 5.8 | Other 7, JavaScript 3, DOM 3, Profiler 2 | 1 / 5 / 11 | ipc 17, gc_cc 10, subprocess_pipe_io 3, array_buffer_copy 2 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libmozsandbox.so]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `poll [libc.so.6]` 1; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, unsigned l` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `getcontext [libc.so.6]` 1; `mozilla::Vector<js::frontend::ScriptStencilExtra, 0ul, js::SystemAlloc` 1; `prctl [libc.so.6]` 1

**tab pid 3825** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.2 | Idle 2, Layout 1, Profiler 1, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, paint_layout 1 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `Servo_StyleSet_MediumFeaturesChanged [libxul.so]` 1; `profiler_active_without_feature(unsigned int) [libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0

