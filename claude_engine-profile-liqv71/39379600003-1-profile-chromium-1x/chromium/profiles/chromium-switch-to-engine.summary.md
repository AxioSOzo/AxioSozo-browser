### chromium switch-to-engine (profile pass)

**parent pid 3165** — 126 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 59 | 7.2 | Layout 19, Idle 17, JavaScript 15, Other 5 | 1 / 19 / 40 | ipc 59, paint_layout 23, poll_wait 20, gc_cc 12 |
| DOM Worker | 33 | 4.1 | JavaScript 31, Idle 1, Profiler 1, Other 0 | 0 / 0 / 33 | subprocess_pipe_io 33, worker_messaging 33, ipc 33, poll_wait 23 |
| Renderer | 16 | 1.9 | Graphics 11, Idle 5 | 0 / 0 / 16 | ipc 16, webrender_render 11, webrender_sw_raster 10, poll_wait 5 |
| WRRenderBackend#0 | 4 | 0.4 | Other 4 | 0 / 0 / 4 |  |
| Compositor | 3 | 0.4 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| BackgroundThreadPool #2 | 3 | 0.3 | Idle 1, Other 1 | 0 / 0 / 3 | ipc 3, poll_wait 1, native_receiver 1, image_container 1 |
| IPC I/O Parent | 2 | 0.3 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| WRSceneBuilder#0 | 2 | 0.3 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `poll [libc.so.6]` 17; `style::properties::cascade::iter_declarations [libxul.so]` 6; `style::properties::generated::longhands::color::cascade_property [libx` 3; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, JS::Mutable` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 2; `recvmsg [libc.so.6]` 2; `sendmsg [libc.so.6]` 2

**tab pid 3958** — 33 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 32 | 4.0 | Other 24, JavaScript 4, DOM 2, Profiler 1 | 0 / 4 / 28 | ipc 24, array_buffer_copy 9, gc_cc 8, subprocess_pipe_io 4 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `xpt::detail::InterfaceByIID(nsID const&) [libxul.so]` 3; `[libfontconfig.so.1]` 2; `mozilla::dom::StartupJSEnvironment() [libxul.so]` 1; `[]` 1; `js::frontend::BytecodeEmitter::emitGCIndexOp(JSOp, js::GCThingIndex) [` 1; `do_lookup_x [ld-linux-x86-64.so.2]` 1; `js::FindIntrinsicSpec(js::PropertyName*) [libxul.so]` 1; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.so]` 1

**tab pid 3953** — 31 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 30 | 4.2 | Other 26, Profiler 2, JavaScript 2, Idle 1 | 0 / 2 / 29 | ipc 22, gc_cc 9, array_buffer_copy 8, poll_wait 4 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `poll [libc.so.6]` 2; `[libexpat.so.1]` 2; `gfxPlatformFontList::InitializeCodepointsWithNoFonts() [libxul.so]` 2; `[]` 1; `PrefsIter::Next() [libxul.so]` 1; `js::jit::MoveEmitterX86::emitGeneralMove(js::jit::MoveOperand const&, ` 1; `sendmsg [libc.so.6]` 1

**tab pid 3832** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.3 | Idle 1, Other 1 | 0 / 0 / 2 | poll_wait 2, ipc 2, paint_layout 0 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `mozilla::dom::BrowserChildMessageManager::GetEventTargetParent(mozilla` 0; `mozilla::PointerEventHandler::DispatchPointerFromMouseOrTouch(mozilla:` 0

