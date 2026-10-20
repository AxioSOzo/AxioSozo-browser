### webkit switch-to-gecko (profile pass)

**parent pid 7188** — 137 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 75 | 24.8 | JavaScript 28, Layout 14, DOM 12, Graphics 8 | 0 / 42 / 33 | ipc 75, paint_layout 21, array_buffer_copy 21, gc_cc 13 |
| Renderer | 22 | 7.4 | Graphics 19, Idle 3 | 0 / 0 / 22 | ipc 22, webrender_render 19, webrender_sw_raster 18, poll_wait 3 |
| DOM Worker | 15 | 5.1 | JavaScript 15, Idle 0 | 0 / 0 / 15 | subprocess_pipe_io 15, worker_messaging 15, ipc 15, js_ctypes 14 |
| BgIOThreadPool #1 | 10 | 3.4 | Other 6, Idle 4 | 0 / 0 / 10 | ipc 10, poll_wait 4 |
| WRRenderBackend#0 | 4 | 1.2 | Other 4 | 0 / 0 / 4 |  |
| Compositor | 3 | 1.1 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRSceneBuilder#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 | webrender_scene 3, poll_wait 0, paint_layout 0 |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `JSAutoRealm::~JSAutoRealm() [libxul.so]` 4; `mozilla::dom::Element::InternalGetAttrNameFromQName(nsTSubstring<char1` 4; `mprotect [libc.so.6]` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom const*, b` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[axiosozo-dev]` 3

**tab pid 7736** — 30 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 28 | 9.4 | Other 9, JavaScript 8, Idle 4, DOM 4 | 0 / 8 / 20 | ipc 24, paint_layout 10, gc_cc 6, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 2; `[]` 2; `profiler_is_locked_on_current_thread() [libxul.so]` 1; `u_terminateChars_78 [libxul.so]` 1; `js::LinkConstructorAndPrototype(JSContext*, JSObject*, JSObject*, unsi` 1; `mozilla::extensions::DocInfo::PrincipalURL() const [libxul.so]` 1; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js::SharedShape*> cons` 1

**tab pid 7280** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.2 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3

**tab pid 7883** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

