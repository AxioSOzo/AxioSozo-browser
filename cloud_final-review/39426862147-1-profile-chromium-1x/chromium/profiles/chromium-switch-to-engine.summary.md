### chromium switch-to-engine (profile pass)

**parent pid 3278** — 149 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 76 | 30.9 | Layout 27, JavaScript 20, Idle 10, Graphics 7 | 1 / 40 / 36 | ipc 76, paint_layout 35, gc_cc 30, array_buffer_copy 19 |
| Renderer | 34 | 13.8 | Graphics 25, Idle 9 | 0 / 0 / 34 | ipc 33, webrender_render 25, webrender_sw_raster 17, poll_wait 9 |
| DOM Worker | 18 | 7.3 | JavaScript 18, Profiler 0 | 0 / 0 / 18 | subprocess_pipe_io 18, worker_messaging 18, ipc 18, js_ctypes 17 |
| BackgroundThreadPool #2 | 6 | 2.5 | Idle 4, Other 2 | 0 / 0 / 6 | ipc 6, poll_wait 4, native_receiver 2, memcpy_memset 2 |
| WRRenderBackend#0 | 3 | 1.4 | Other 3 | 0 / 0 / 3 | webrender_render 1, poll_wait 0 |
| Compositor | 3 | 1.4 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRSceneBuilder#0 | 3 | 1.2 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |
| SwComposite | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 10; `sendmsg [libc.so.6]` 4; `JS::CurrentGlobalOrNull(JSContext*) [libxul.so]` 4; `[axiosozo-dev]` 4; `mozilla::layers::ClipManager::DefineClipChain(mozilla::DisplayItemClip` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3; `servo_arc::Arc<T>::drop_slow [libxul.so]` 3; `style::custom_properties::do_substitute_chunk [libxul.so]` 3

**tab pid 4175** — 40 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 39 | 15.8 | Other 28, JavaScript 4, DOM 4, Profiler 2 | 0 / 6 / 33 | ipc 37, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 6 |
| IPC I/O Child | 0 | 0.2 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 6; `[libfontconfig.so.1]` 4; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `[libexpat.so.1]` 2; `icu_78::UnicodeString::cloneArrayIfNeeded(int, int, signed char, int**` 2; `(anonymous namespace)::NameResolver::visit(js::frontend::ParseNode*) [` 1; `poll [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1

**tab pid 3950** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 1.0 | Idle 1, Layout 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 2, paint_layout 1 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsBlockFrame::ReflowDirtyLines(mozilla::BlockReflowState&) [libxul.so]` 1; `XPCJSContext::AfterProcessTask(unsigned int) [libxul.so]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0

**tab pid 4170** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

