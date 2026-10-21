### webkit-2x switch-to-engine (profile pass)

**parent pid 8775** — 94 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 10.2 | JavaScript 14, Idle 7, Layout 4, DOM 3 | 2 / 17 / 18 | ipc 37, gc_cc 15, poll_wait 11, paint_layout 11 |
| DOM Worker | 22 | 5.9 | JavaScript 21, Profiler 0 | 0 / 0 / 22 | subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 21 |
| Renderer | 17 | 4.8 | Graphics 17, Idle 0 | 0 / 0 / 17 | ipc 17, webrender_render 17, webrender_sw_raster 14, poll_wait 2 |
| BackgroundThreadPool #2 | 7 | 1.9 | Other 5, Idle 2 | 0 / 0 / 7 | ipc 7, native_receiver 5, memcpy_memset 3, image_container 2 |
| IPC I/O Parent | 3 | 0.8 | Idle 2, Other 1 | 0 / 0 / 3 | poll_wait 2, ipc 1 |
| Compositor | 3 | 0.7 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRRenderBackend#0 | 2 | 0.5 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.5 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 8; `bool mozilla::dom::binding_detail::GenericGetter<mozilla::dom::binding` 3; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 2; `mozilla::ReflowInput::Init(nsPresContext*, mozilla::Maybe<mozilla::Log` 2; `mozilla::dom::JSIPCValueUtils::ToJSVal(JSContext*, mozilla::dom::JSIPC` 2; `[libglib-2.0.so.0]` 2; `mozilla::EventListenerManager::HasApzAwareListeners() [libxul.so]` 1; `pref_HashTableLookup(char const*) [libxul.so]` 1

**tab pid 9478** — 58 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 57 | 16.8 | Other 42, JavaScript 7, Profiler 5, DOM 2 | 3 / 2 / 52 | ipc 44, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 6; `__lll_lock_wake [libc.so.6]` 4; `[libfontconfig.so.1]` 4; `[libexpat.so.1]` 3; `initExtensionPolicy (resource://gre/modules/ExtensionProcessScript.sys` 3; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 2; `__strlen_avx2 [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2

**tab pid 9483** — 47 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 46 | 16.5 | Other 36, DOM 4, Profiler 3, JavaScript 2 | 0 / 7 / 40 | ipc 35, array_buffer_copy 13, gc_cc 11, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `<T as alloc::vec::spec_from_elem::SpecFromElem>::from_elem [libxul.so]` 3; `[]` 2; `nsresult mozilla::PreferencesImpl::GetSharedPrefValue<float>(char cons` 2; `JSAtom* js::NewAtomCopyNDontDeflateValidLength<unsigned char>(JSContex` 2; `__strlen_avx2 [libc.so.6]` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 2; `[libexpat.so.1]` 2

**tab pid 9340** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.5 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

