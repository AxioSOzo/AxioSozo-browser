### webkit switch-to-engine (profile pass)

**parent pid 7154** — 115 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 12.8 | JavaScript 28, Idle 5, Other 5, Layout 5 | 1 / 34 / 15 | ipc 49, gc_cc 23, harness_diagnostics 15, array_buffer_copy 12 |
| DOM Worker | 29 | 7.5 | JavaScript 29, Profiler 0 | 0 / 0 / 29 | subprocess_pipe_io 29, worker_messaging 29, ipc 29, js_ctypes 29 |
| Renderer | 17 | 4.4 | Graphics 12, Idle 5 | 0 / 0 / 17 | ipc 17, webrender_render 12, webrender_sw_raster 7, poll_wait 5 |
| BackgroundThreadPool #3 | 6 | 1.5 | Other 4, Idle 1 | 0 / 0 / 6 | ipc 6, native_receiver 4, image_container 3, poll_wait 1 |
| Compositor | 4 | 1.1 | Idle 4 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| IPC I/O Parent | 3 | 0.8 | Idle 3, Other 0, Profiler 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| WRRenderBackend#0 | 2 | 0.6 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.4 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `__strlen_avx2 [libc.so.6]` 4; `js::BaseScript::enclosingScope() const [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 3; `js::jit::DoLazyConstantFallback(JSContext*, js::jit::BaselineFrame*, j` 2; `JS::GetDeflatedUTF8StringLength(JSLinearString*) [libxul.so]` 2; `nsIFrame::MarkNeedsDisplayItemRebuild() [libxul.so]` 2; `SystemGlobal::GetGlobalJSObjectPreserveColor() const [libxul.so]` 2

**tab pid 7840** — 56 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 55 | 19.5 | Other 43, Profiler 4, DOM 4, JavaScript 3 | 0 / 5 / 50 | ipc 42, array_buffer_copy 18, gc_cc 11, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 5; `[libexpat.so.1]` 3; `[libfontconfig.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `__strcmp_avx2 [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `syscall [libc.so.6]` 2

**tab pid 7834** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 13.9 | Other 41, DOM 5, JavaScript 2, Idle 0 | 0 / 5 / 44 | ipc 37, array_buffer_copy 15, gc_cc 11, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, image_container 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__memcmp_avx2_movbe [libc.so.6]` 4; `[]` 3; `nsresult mozilla::PreferencesImpl::GetPrefValue<unsigned int*>(char co` 3; `__strncmp_avx2 [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(JSContext*` 2; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2

**tab pid 7692** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.6 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 0; `[]` 0

