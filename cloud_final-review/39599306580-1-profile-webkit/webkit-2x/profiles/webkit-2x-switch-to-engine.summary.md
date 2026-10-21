### webkit-2x switch-to-engine (profile pass)

**parent pid 8784** — 130 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 47 | 12.0 | JavaScript 25, Idle 9, Layout 9, Profiler 2 | 2 / 29 / 16 | ipc 47, gc_cc 27, paint_layout 10, harness_diagnostics 10 |
| DOM Worker | 27 | 7.0 | JavaScript 27, Profiler 1 | 0 / 0 / 27 | subprocess_pipe_io 27, worker_messaging 27, ipc 27, js_ctypes 25 |
| Renderer | 24 | 6.0 | Graphics 22, Idle 1 | 0 / 0 / 24 | ipc 24, webrender_render 22, webrender_sw_raster 17, poll_wait 4 |
| BackgroundThreadPool #3 | 18 | 4.6 | Other 13, Idle 5 | 0 / 0 / 18 | ipc 18, native_receiver 13, image_container 7, memcpy_memset 6 |
| Compositor | 3 | 0.8 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRRenderBackend#0 | 3 | 0.7 | Other 3 | 0 / 0 / 3 |  |
| SwComposite | 2 | 0.6 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |
| WRSceneBuilder#0 | 2 | 0.5 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 9; `nsMenuPopupFrame::IntrinsicISize(mozilla::IntrinsicSizeInput const&, m` 3; `mozilla::dom::EventTarget::NonVirtualRelease() [libxul.so]` 2; `js::EqualChars(JSLinearString const*, JSLinearString const*) [libxul.s` 2; `js::MapIteratorObject::create(JSContext*, JS::Handle<js::MapObject*>, ` 2; `[unknown]` 2; `u_charType_78 [libxul.so]` 2; `js::jit::UnaryArithIRGenerator::tryAttachInt32() [libxul.so]` 2

**tab pid 9491** — 54 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 53 | 14.9 | Other 44, JavaScript 6, DOM 2, Idle 1 | 1 / 5 / 47 | ipc 40, array_buffer_copy 19, gc_cc 13, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[libexpat.so.1]` 4; `PrefsIter::Next() [libxul.so]` 2; `void js::wasm::RecGroup::visitReferencedGroups<js::wasm::RecGroup::fin` 2; `[]` 2; `PrefWrapper::WantValueKind(mozilla::PrefType, mozilla::PrefValueKind) ` 2; `js::StaticStrings::init(JSContext*) [libxul.so]` 1; `mozilla::xpcom::StaticComponents::LookupByContractID(nsTSubstring<char` 1

**tab pid 9346** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.4 | Other 1, Idle 1 | 0 / 0 / 2 | ipc 2, poll_wait 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `nsGetInterface::operator()(nsID const&, void**) const [libxul.so]` 1; `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::IMEStateManager::StopIMEStateManagement() [libxul.so]` 0; `mozilla::dom::danger::GetJSContext() [libxul.so]` 0

**utility pid 9017** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

