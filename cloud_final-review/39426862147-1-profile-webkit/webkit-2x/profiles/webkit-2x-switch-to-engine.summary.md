### webkit-2x switch-to-engine (profile pass)

**parent pid 8838** — 89 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 35 | 13.3 | JavaScript 16, Idle 7, Layout 4, Profiler 3 | 1 / 19 / 15 | ipc 35, gc_cc 16, array_buffer_copy 11, engine_stream_read 10 |
| DOM Worker | 16 | 6.0 | JavaScript 16 | 0 / 0 / 16 | subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15 |
| BackgroundThreadPool #2 | 15 | 5.7 | Other 10, Idle 5 | 0 / 0 / 15 | ipc 15, native_receiver 10, memcpy_memset 6, poll_wait 5 |
| Renderer | 11 | 4.2 | Graphics 6, Idle 5 | 0 / 0 / 11 | ipc 11, webrender_render 6, webrender_sw_raster 6, poll_wait 5 |
| SwComposite | 2 | 0.9 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |
| Compositor | 2 | 0.9 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Parent | 2 | 0.8 | Idle 2, Other 1 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| WRSceneBuilder#0 | 2 | 0.6 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 8; `XPCWrappedNative::InitTearOff(JSContext*, XPCWrappedNativeTearOff*, XP` 7; `JSStructuredCloneWriter::startObject(JS::Handle<JSObject*>, bool*) [li` 2; `mozilla::baseprofiler::profiler_current_thread_id() [axiosozo-dev]` 2; `nsIFrame::ComputeAutoSize(mozilla::SizeComputationInput const&, mozill` 2; `js::BaseScript::enclosingScope() const [libxul.so]` 2; `mozilla::EffectCompositor::GetAnimationElementAndPseudoForFrame(nsIFra` 1; `selectors::matching::matches_complex_selector_internal [libxul.so]` 1

**tab pid 9523** — 41 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 40 | 31.9 | Other 28, JavaScript 7, DOM 4, Profiler 1 | 0 / 5 / 35 | ipc 32, array_buffer_copy 13, gc_cc 10, subprocess_pipe_io 3 |
| IPC I/O Child | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.2 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libfontconfig.so.1]` 4; `[]` 3; `__strlen_evex [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `__strncmp_evex [libc.so.6]` 1; `mozilla::dom::PContentChild::OnMessageReceived(IPC::Message const&) [l` 1

**tab pid 9520** — 25 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 24 | 28.9 | Other 20, DOM 2, JavaScript 1, Idle 1 | 0 / 3 / 22 | ipc 20, array_buffer_copy 9, gc_cc 5, subprocess_pipe_io 2 |
| IPC I/O Child | 0 | 0.5 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.3 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `gfxSparseBitSet::SetRange(unsigned int, unsigned int) [libxul.so]` 5; `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 1; `u_UCharsToChars_78 [libxul.so]` 1; `uprv_getDefaultLocaleID_78 [libxul.so]` 1; `js::NewDenseUnallocatedArray(JSContext*, unsigned int, js::NewObjectKi` 1; `__memcmp_evex_movbe [libc.so.6]` 1; `js::frontend::TaggedParserAtomIndex js::frontend::WellKnownParserAtoms` 1

**tab pid 9377** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.4 | Idle 1, Other 1, Layout 0 | 0 / 0 / 1 | ipc 1, gc_cc 1, poll_wait 0, paint_layout 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint(bool) [li` 1; `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `nsPIDOMWindowInner::GetWindowContext() const [libxul.so]` 0

