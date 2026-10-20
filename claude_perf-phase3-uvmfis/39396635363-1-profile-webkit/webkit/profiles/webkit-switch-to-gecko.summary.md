### webkit switch-to-gecko (profile pass)

**parent pid 7188** — 110 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 69 | 24.6 | JavaScript 35, Layout 11, Other 7, DOM 7 | 3 / 43 / 23 | ipc 68, array_buffer_copy 23, paint_layout 16, harness_diagnostics 12 |
| Renderer | 13 | 4.5 | Graphics 10, Idle 2 | 0 / 0 / 13 | ipc 13, webrender_render 10, webrender_sw_raster 10, poll_wait 2 |
| DOM Worker | 11 | 3.9 | JavaScript 11, Idle 0 | 0 / 0 / 11 | subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10 |
| BgIOThreadPool #4 | 5 | 1.8 | Other 4, Idle 0 | 0 / 0 / 5 | ipc 5, poll_wait 0 |
| Compositor | 3 | 1.0 | Idle 2, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, image_container 0, canvas_2d 0 |
| WRRenderBackend#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 0 |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |

Main thread, top self: `[unknown]` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `__syscall_cancel_arch [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 2; `js::PromiseObject::allocationSite() [libxul.so]` 2; `bool nsTArray_Impl<RefPtr<mozilla::image::IProgressObserver>, nsTArray` 2; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 1

**tab pid 7735** — 30 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 29 | 10.2 | JavaScript 12, Other 6, Idle 4, Layout 2 | 0 / 11 / 17 | ipc 26, gc_cc 9, subprocess_pipe_io 5, poll_wait 4 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `JSScript::lookupScope(unsigned char const*) const [libxul.so]` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(JSContext*` 1; `js::SavedStacks::getOrCreateSavedFrame(JSContext*, JS::Handle<js::Save` 1; `nsPIDOMWindowInner::GetWindowContext() const [libxul.so]` 1; `mozilla::dom::AutoEntryScript::AutoEntryScript(nsIGlobalObject*, char ` 1; `mozilla::net::nsStandardURL::BuildNormalizedSpec(char const*, mozilla:` 1

**tab pid 7278** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.4 | Idle 3, JavaScript 1 | 0 / 0 / 3 | ipc 4, poll_wait 3, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::DoCallFallback(JSContext*, js::jit::BaselineFrame*, js::jit::` 0; `recvRunListener/< (resource://gre/modules/ExtensionChild.sys.mjs:878:1` 0

**tab pid 7875** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_mutex_lock [libglib-2.0.so.0]` 0

