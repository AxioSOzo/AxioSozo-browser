### webkit-2x switch-to-gecko (profile pass)

**parent pid 8817** — 60 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 27 | 11.3 | JavaScript 8, Idle 7, Other 4, Layout 3 | 0 / 15 / 11 | ipc 27, poll_wait 11, array_buffer_copy 5, harness_diagnostics 4 |
| Renderer | 15 | 6.2 | Graphics 12, Idle 3 | 0 / 0 / 15 | ipc 15, webrender_render 12, webrender_sw_raster 11, poll_wait 3 |
| DOM Worker | 7 | 2.9 | JavaScript 7, Idle 0 | 0 / 0 / 7 | subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 6 |
| BgIOThreadPool #2 | 5 | 2.3 | Other 4, Idle 2 | 0 / 0 / 5 | ipc 5, poll_wait 2 |
| Compositor | 2 | 0.8 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 1 | 0.6 | Other 1 | 0 / 0 / 1 |  |
| WRSceneBuilder#0 | 1 | 0.5 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |
| SwComposite | 1 | 0.3 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `harfbuzz::unicode_funcs::UnicodeFuncsBuilder::set_general_category_fun` 1; `nsIContent::Release() [libxul.so]` 1; `js::jit::CallIRGenerator::tryAttachCallNative(JS::Handle<JSFunction*>)` 1; `style::properties::generated::longhands::padding_top::cascade_property` 1; `js::ToBooleanSlow(JS::Handle<JS::Value>) [libxul.so]` 1

**tab pid 9361** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 2.4 | Idle 3, Other 2, DOM 1, GC / CC 0 | 0 / 2 / 4 | ipc 6, poll_wait 3, gc_cc 1, subprocess_pipe_io 1 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `nscstring_fallible_append_utf16_to_utf8_impl [libxul.so]` 1; `(anonymous namespace)::NameResolver::visit(js::frontend::ParseNode*) [` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `__strlen_evex [libc.so.6]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 0

**tab pid 8908** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.4 | Idle 1, JavaScript 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, array_buffer_copy 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[unknown]` 0

**tab pid 8967** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_thread_self [libglib-2.0.so.0]` 0

