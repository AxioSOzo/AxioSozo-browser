### webkit-2x switch-to-gecko (profile pass)

**parent pid 8750** — 160 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 76 | 25.5 | JavaScript 32, DOM 14, Layout 11, Idle 6 | 3 / 52 / 21 | ipc 74, paint_layout 24, array_buffer_copy 17, gc_cc 15 |
| Renderer | 42 | 14.1 | Graphics 39, Idle 3 | 0 / 0 / 42 | ipc 41, webrender_render 39, webrender_sw_raster 38, poll_wait 3 |
| DOM Worker | 15 | 4.9 | JavaScript 13, Profiler 1, Idle 1 | 0 / 0 / 15 | subprocess_pipe_io 15, worker_messaging 15, ipc 15, poll_wait 13 |
| BgIOThreadPool #2 | 11 | 3.8 | Other 11, Idle 0 | 0 / 0 / 11 | ipc 11, poll_wait 0 |
| SwComposite | 4 | 1.3 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 3 | 1.0 | Other 3 | 0 / 0 / 3 | memcpy_memset 0, webrender_render 0 |
| Compositor | 3 | 0.9 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Parent | 3 | 0.9 | Idle 2, Other 0 | 0 / 0 / 3 | poll_wait 2, ipc 0, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 8; `[axiosozo-dev]` 7; `[unknown]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 4; `AttrArray::GetAttr(nsTSubstring<char16_t> const&, nsCaseTreatment) con` 4; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 3; `[linux-vdso.so.1]` 2; `JSLinearString* js::NewStringCopyNDontDeflateNonStaticValidLength<(js:` 2

**tab pid 9277** — 30 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 28 | 9.3 | JavaScript 8, Other 7, Idle 4, Layout 4 | 0 / 9 / 19 | ipc 23, paint_layout 11, gc_cc 7, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.5 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 3; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*, JS::Handl` 2; `nsIncrementalDownload::GetFinalURI(nsIURI**) [libxul.so]` 2; `js::frontend::BytecodeEmitter::emitTree(js::frontend::ParseNode*, js::` 2; `style::properties::generated::longhands::font_width::cascade_property ` 1; `style::properties::cascade::Cascade::apply_non_prioritary_properties [` 1; `nsTSubstring<char>::Assign(nsTSubstring<char> const&, std::nothrow_t c` 1

**tab pid 8836** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.4 | Idle 3, JavaScript 1, Other 0 | 0 / 1 / 3 | ipc 4, poll_wait 3, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::ForwardingProxyHandler::call(JSContext*, JS::Handle<JSObject*>, JS` 1; `mozilla::ipc::MessageChannel::MessageTask::Run() [libxul.so]` 0; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigned long*) [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:598:12)[2]` 0

**tab pid 8889** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

