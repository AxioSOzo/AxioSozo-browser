### chromium-control switch-to-engine (profile pass)

**parent pid 4588** — 166 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 76 | 12.9 | Layout 23, JavaScript 23, Idle 10, Other 9 | 3 / 30 / 43 | ipc 76, paint_layout 31, gc_cc 23, poll_wait 11 |
| DOM Worker | 39 | 6.7 | JavaScript 35, Idle 2, Profiler 2, Other 0 | 0 / 0 / 39 | subprocess_pipe_io 39, worker_messaging 39, ipc 39, poll_wait 29 |
| Renderer | 28 | 4.7 | Idle 15, Graphics 12, Other 0 | 0 / 0 / 28 | ipc 28, poll_wait 15, webrender_render 13, webrender_sw_raster 8 |
| WRRenderBackend#0 | 5 | 0.8 | Other 5 | 0 / 0 / 5 |  |
| BackgroundThreadPool #1 | 4 | 0.8 | Other 3, Idle 2 | 0 / 0 / 4 | ipc 4, native_receiver 3, memcpy_memset 2, poll_wait 2 |
| Compositor | 4 | 0.6 | Idle 4, Profiler 0 | 0 / 0 / 4 | ipc 4, poll_wait 4, webrender_render 0 |
| IPC I/O Parent | 4 | 0.6 | Idle 4 | 0 / 0 / 4 | poll_wait 4 |
| WRSceneBuilder#0 | 3 | 0.5 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |

Main thread, top self: `poll [libc.so.6]` 10; `style::custom_properties::substitute [libxul.so]` 5; `__lll_lock_wait [libc.so.6]` 4; `sendmsg [libc.so.6]` 3; `js::GetProperty(JSContext*, JS::Handle<JS::Value>, JS::Handle<js::Prop` 2; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, nsSize, nsSt` 2; `style::invalidation::element::invalidator::TreeStyleInvalidator<E,P>::` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 5360** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 9.1 | Other 37, Profiler 4, DOM 3, JavaScript 3 | 0 / 4 / 44 | ipc 34, array_buffer_copy 15, gc_cc 14, subprocess_pipe_io 7 |
| IPC I/O Child | 1 | 0.2 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 0, ipc 0, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__lll_lock_wait [libc.so.6]` 4; `close [libc.so.6]` 3; `[libexpat.so.1]` 3; `syscall [libc.so.6]` 2; `poll [libc.so.6]` 2; `SkSurfaceProps::SkSurfaceProps(unsigned int, SkPixelGeometry, float, f` 2; `[]` 2; `js::frontend::ParserAtomsTable::addEntry(js::FrontendContext*, mozilla` 2

**tab pid 5365** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 47 | 8.8 | Other 35, JavaScript 6, DOM 2, Idle 2 | 0 / 5 / 42 | ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 7 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 6; `prctl [libc.so.6]` 2; `[libexpat.so.1]` 2; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, JS::Mutable` 2; `poll [libc.so.6]` 2; `[libfontconfig.so.1]` 2; `js::frontend::BytecodeEmitter::emitDeclarationList(js::frontend::ListN` 2; `__strlen_avx2 [libc.so.6]` 2

**tab pid 5249** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.6 | Idle 2, Profiler 1, Graphics 0, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, paint_layout 1 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `[]` 1; `GetTrimmableWhitespaceCount(mozilla::dom::CharacterDataBuffer const&, ` 0; `mozilla::EventStateManager::GetEventTarget() [libxul.so]` 0

