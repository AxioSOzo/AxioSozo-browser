### webkit-2x-control switch-to-gecko (profile pass)

**parent pid 10786** — 137 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 66 | 23.8 | JavaScript 29, Other 9, Layout 7, Graphics 7 | 3 / 42 / 22 | ipc 66, array_buffer_copy 19, paint_layout 17, gc_cc 12 |
| Renderer | 36 | 12.9 | Graphics 32, Idle 4 | 0 / 0 / 36 | ipc 36, webrender_render 32, webrender_sw_raster 31, poll_wait 4 |
| DOM Worker | 11 | 4.0 | JavaScript 10, Idle 1 | 0 / 0 / 11 | subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10 |
| SwComposite | 7 | 2.7 | Other 7 | 0 / 0 / 7 | webrender_render 7, poll_wait 6, memcpy_memset 2, webrender_sw_raster 2 |
| BgIOThreadPool #1 | 5 | 1.9 | Other 5, Idle 1 | 0 / 0 / 5 | ipc 5, poll_wait 1 |
| WRRenderBackend#0 | 3 | 1.0 | Other 3 | 0 / 0 / 3 |  |
| Compositor | 3 | 0.9 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `mprotect [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3; `mozilla::nsDisplayWrapList::nsDisplayWrapList(mozilla::nsDisplayListBu` 2; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisplayListBui` 2; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [axiosozo-d` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `PLDHashTable::Search(void const*) const [libxul.so]` 2

**tab pid 11332** — 27 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 9.2 | Other 8, JavaScript 8, Idle 5, Layout 2 | 0 / 7 / 19 | ipc 20, gc_cc 7, subprocess_pipe_io 6, poll_wait 5 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 2; `style::values::specified::length::LengthPercentage::parse_internal [li` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsWebBrowser::Release() [libxul.so]` 1; `js::FunctionScope::RuntimeData* js::frontend::ScopeStencil::createSpec` 1; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*> const, mo` 1

**tab pid 10880** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 1.8 | Idle 3, JavaScript 2 | 0 / 1 / 3 | ipc 5, poll_wait 3, array_buffer_copy 2, gc_cc 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 1; `js::LifoAlloc::release(js::LifoAlloc::Mark) [libxul.so]` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[7]` 0

**tab pid 11436** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

