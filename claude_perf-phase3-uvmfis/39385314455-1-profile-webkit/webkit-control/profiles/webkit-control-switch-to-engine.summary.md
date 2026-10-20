### webkit-control switch-to-engine (profile pass)

**parent pid 9563** — 121 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 51 | 7.4 | JavaScript 51, Profiler 1, Idle 0 | 0 / 0 / 51 | subprocess_pipe_io 51, worker_messaging 51, ipc 51, js_ctypes 50 |
| GeckoMain | 42 | 6.0 | JavaScript 17, Idle 10, Layout 5, DOM 4 | 4 / 20 / 18 | ipc 41, gc_cc 20, poll_wait 13, paint_layout 10 |
| Renderer | 11 | 1.5 | Graphics 9, Idle 1, Profiler 0 | 0 / 0 / 11 | ipc 11, webrender_render 9, webrender_sw_raster 9, poll_wait 1 |
| BackgroundThreadPool #2 | 5 | 0.7 | Idle 3, Other 2 | 0 / 0 / 5 | ipc 5, poll_wait 3, native_receiver 2, memcpy_memset 1 |
| IPC I/O Parent | 3 | 0.4 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| Compositor | 2 | 0.3 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| SwComposite | 2 | 0.3 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 1, webrender_sw_raster 1 |
| WRSceneBuilder#0 | 2 | 0.3 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 13; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 1; `js::ProfilingStackFrame::setPC(unsigned char*) [libxul.so]` 1; `xpc::AccessCheck::subsumesConsideringDomain(JS::Realm*, JS::Realm*) [l` 1; `js::frontend::ObjectEmitter::ObjectEmitter(js::frontend::BytecodeEmitt` 1; `forEach (self-hosted:145:22)[2]` 1; `mozilla::AbsoluteContainingBlock::ReflowAbsoluteFrame(nsContainerFrame` 1

**tab pid 10061** — 48 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 47 | 6.9 | Other 37, DOM 4, Profiler 3, Idle 1 | 0 / 5 / 42 | ipc 34, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 10; `[libfontconfig.so.1]` 3; `__strcmp_evex [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13ReserveAndP` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.so]` 1; `NSSUTIL_ArgFetchValue@@NSSUTIL_3.14 [libnssutil3.so]` 1

**tab pid 10058** — 47 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 46 | 7.8 | Other 39, JavaScript 4, DOM 1, Idle 1 | 0 / 2 / 44 | ipc 34, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libexpat.so.1]` 5; `__syscall_cancel_arch [libc.so.6]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 3; `[]` 3; `js::jit::JitCode::copyFrom(js::jit::MacroAssembler&) [libxul.so]` 3; `mozilla::dom::Pref::operator=(mozilla::dom::Pref&&) [libxul.so]` 2; `uhash_geti_78 [libxul.so]` 2; `PLDHashTable::Search(void const*) const [libxul.so]` 2

**tab pid 9966** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.2 | Idle 1, Graphics 0, Layout 0 | 0 / 0 / 2 | ipc 2, poll_wait 1, paint_layout 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::nsDisplayItem::Destroy(mozilla::nsDisplayListBuilder*) [libxu` 0; `mozilla::ServoStyleSet::StyleDocument(mozilla::ServoTraversalFlags) [l` 0

