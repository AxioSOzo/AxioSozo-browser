### chromium-2x switch-to-engine (profile pass)

**parent pid 3450** — 233 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 89 | 28.2 | Graphics 86, Idle 3 | 0 / 0 / 89 | ipc 89, webrender_render 86, webrender_sw_raster 85, poll_wait 3 |
| GeckoMain | 76 | 24.1 | JavaScript 28, Layout 16, DOM 10, Idle 8 | 1 / 49 / 27 | ipc 76, paint_layout 28, gc_cc 27, array_buffer_copy 17 |
| DOM Worker | 21 | 6.7 | JavaScript 21 | 0 / 0 / 21 | subprocess_pipe_io 21, worker_messaging 21, ipc 21, js_ctypes 18 |
| BackgroundThreadPool #1 | 20 | 6.4 | Other 15, Idle 5 | 0 / 0 / 20 | ipc 20, native_receiver 15, memcpy_memset 13, poll_wait 5 |
| SwComposite | 8 | 2.6 | Other 8 | 0 / 0 / 8 | webrender_render 8, poll_wait 7, webrender_sw_raster 1, memcpy_memset 1 |
| WRRenderBackend#0 | 5 | 1.7 | Other 5 | 0 / 0 / 5 |  |
| Compositor | 5 | 1.6 | Idle 3, Other 2 | 0 / 0 / 5 | ipc 5, poll_wait 3 |
| WRSceneBuilder#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |

Main thread, top self: `poll [libc.so.6]` 11; `__memmove_avx_unaligned_erms [libc.so.6]` 8; `nsStyledElement::SetInlineStyleDeclaration(mozilla::StyleLockedDeclara` 7; `js::GlobalObject::setPrototype(JSProtoKey, JSObject*) [libxul.so]` 7; `[unknown]` 6; `__lll_lock_wake [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `mozilla::dom::InstanceClassHasProtoAtDepth(JSClass const*, unsigned in` 3

**tab pid 4373** — 52 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 51 | 23.1 | Other 40, Profiler 4, JavaScript 3, DOM 2 | 1 / 4 / 47 | ipc 38, array_buffer_copy 18, gc_cc 14, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libfontconfig.so.1]` 8; `__lll_lock_wake [libc.so.6]` 4; `[]` 3; `mozilla::ipc::PBackgroundStarterChild::PBackgroundStarterChild() [libx` 2; `poll [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `[libmozsandbox.so]` 1

**tab pid 4368** — 20 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 19 | 6.1 | Other 14, DOM 3, JavaScript 1, Idle 1 | 0 / 4 / 16 | ipc 19, gc_cc 12, subprocess_pipe_io 6, array_buffer_copy 4 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `js::frontend::PerHandlerParser<js::frontend::FullParseHandler>::newInt` 1; `poll [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `js::frontend::TDZCheckCache::noteTDZCheck(js::frontend::BytecodeEmitte` 1; `js::frontend::NameOpEmitter::NameOpEmitter(js::frontend::BytecodeEmitt` 1; `JSStructuredCloneData::AppendBytes(char const*, unsigned long) [libxul` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1

**tab pid 4231** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.9 | Idle 3, Layout 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, paint_layout 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::SVGObserverUtils::GetAndObserveMasks(nsIFrame*, nsTArray<mozi` 0

