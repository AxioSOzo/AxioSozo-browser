### webkit switch-to-gecko (profile pass)

**parent pid 7154** — 99 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 58 | 21.6 | JavaScript 21, Other 9, DOM 8, Layout 6 | 1 / 34 / 23 | ipc 57, paint_layout 16, gc_cc 15, array_buffer_copy 11 |
| Renderer | 16 | 6.1 | Graphics 13, Idle 3 | 0 / 0 / 16 | ipc 16, webrender_render 13, webrender_sw_raster 13, poll_wait 3 |
| DOM Worker | 9 | 3.4 | JavaScript 8, Idle 1 | 0 / 0 / 9 | subprocess_pipe_io 9, worker_messaging 9, ipc 9, poll_wait 9 |
| BgIOThreadPool #4 | 4 | 1.3 | Other 3, Idle 1 | 0 / 0 / 4 | ipc 4, poll_wait 1 |
| WRRenderBackend#0 | 3 | 1.0 | Other 3 | 0 / 0 / 3 | webrender_render 0 |
| Compositor | 2 | 0.8 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, paint_layout 0 |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |
| IPC I/O Parent | 2 | 0.6 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 3; `JS::GetScriptedCallerGlobal(JSContext*) [libxul.so]` 3; `__lll_lock_wait [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::Handle<JSO` 2; `nsPrefBranch::GetPrefName(nsTSubstring<char> const&) const [libxul.so]` 2; `[unknown]` 2

**tab pid 7698** — 23 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 22 | 8.1 | JavaScript 8, Other 5, Idle 3, Layout 2 | 0 / 9 / 12 | ipc 19, gc_cc 8, subprocess_pipe_io 7, poll_wait 3 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::frontend::TaggedParserAtomIndex js::frontend::WellKnownParserAtoms` 5; `__syscall_cancel_arch [libc.so.6]` 4; `[]` 2; `getcontext [libc.so.6]` 2; `mozilla::cyclecollector::HoldJSObjectsImpl(nsISupports*) [libxul.so]` 1; `js::GlobalOrEvalDeclInstantiation(JSContext*, JS::Handle<JSObject*>, J` 1; `mozilla::detail::HashTable<void* const, mozilla::HashSet<void*, mozill` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 7244** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.1 | Idle 3, Other 0, JavaScript 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `[]` 0; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 0; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, unsigned l` 0

**tab pid 7843** — 0 ms CPU in the window

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

