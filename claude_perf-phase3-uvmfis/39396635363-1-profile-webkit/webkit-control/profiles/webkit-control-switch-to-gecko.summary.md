### webkit-control switch-to-gecko (profile pass)

**parent pid 9829** — 118 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 67 | 24.3 | JavaScript 31, Layout 12, Other 10, Graphics 4 | 4 / 39 / 24 | ipc 67, gc_cc 20, paint_layout 17, array_buffer_copy 17 |
| Renderer | 21 | 7.6 | Graphics 18, Idle 3 | 0 / 0 / 21 | ipc 21, webrender_render 18, webrender_sw_raster 18, poll_wait 3 |
| DOM Worker | 11 | 4.1 | JavaScript 11, Idle 1, Profiler 0 | 0 / 0 / 11 | subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10 |
| BgIOThreadPool #2 | 5 | 1.7 | Other 4, Idle 1 | 0 / 0 / 5 | ipc 5, poll_wait 1 |
| WRRenderBackend#0 | 3 | 1.0 | Other 3 | 0 / 0 / 3 |  |
| Compositor | 3 | 0.9 | Idle 2, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2 |
| SwComposite | 2 | 0.9 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2, memcpy_memset 0, webrender_sw_raster 0 |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 9; `mprotect [libc.so.6]` 4; `JSString* js::ConcatStrings<(js::AllowGC)0>(JSContext*, js::MaybeRoote` 3; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<nsFrameList` 3; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::default_del` 3; `[unknown]` 2; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::Value>, js:` 2; `js::jit::CallIRGenerator::tryAttachStub() [libxul.so]` 2

**tab pid 10372** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 9.4 | JavaScript 10, Idle 6, Other 5, Layout 4 | 0 / 9 / 17 | ipc 23, paint_layout 11, gc_cc 9, poll_wait 6 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `JS::GetObjectZone(JSObject*) [libxul.so]` 1; `mmap64 [libc.so.6]` 1; `style::stylist::CascadeData::add_styles [libxul.so]` 1; `js::UnwrapOneCheckedStatic(JSObject*) [libxul.so]` 1; `mozilla::xpcom::CreateInstanceImpl(mozilla::xpcom::ModuleID, nsID cons` 1; `nsRange::SetStartBefore(nsINode&, mozilla::ErrorResult&, mozilla::dom:` 1; `mozilla::TokenizerBase<char>::Token::Token() [libxul.so]` 1

**tab pid 9920** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.4 | Idle 3, DOM 0 | 0 / 0 / 3 | ipc 4, poll_wait 3, array_buffer_copy 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `mozilla::dom::ToJSValue(JSContext*, mozilla::dom::WindowProxyHolder co` 0

**tab pid 10465** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

