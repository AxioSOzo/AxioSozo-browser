### chromium-2x switch-to-engine (profile pass)

**parent pid 3314** — 163 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 65 | 29.3 | JavaScript 12, Other 12, DOM 12, Layout 12 | 0 / 32 / 33 | ipc 65, gc_cc 29, paint_layout 25, poll_wait 12 |
| Renderer | 51 | 22.9 | Graphics 45, Idle 5 | 0 / 0 / 51 | ipc 50, webrender_render 45, webrender_sw_raster 29, poll_wait 5 |
| DOM Worker | 14 | 6.1 | JavaScript 14 | 0 / 0 / 14 | subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 12 |
| BackgroundThreadPool #3 | 13 | 6.0 | Other 9, Idle 4 | 0 / 0 / 13 | ipc 13, native_receiver 9, image_container 5, memcpy_memset 4 |
| Compositor | 5 | 2.2 | Idle 5 | 0 / 0 / 5 | ipc 5, poll_wait 5 |
| WRRenderBackend#0 | 4 | 2.0 | Other 4 | 0 / 0 / 4 | webrender_render 0, poll_wait 0 |
| SwComposite | 4 | 2.0 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4, memcpy_memset 1, webrender_sw_raster 1 |
| WRSceneBuilder#0 | 3 | 1.2 | Other 3 | 0 / 0 / 3 | webrender_scene 3, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 12; `nsNodeSupportsWeakRefTearoff::GetWeakReference(nsIWeakReference**) [li` 8; `JS::NewStringFromKnownLiveTwoByteBuffer(JSContext*, mozilla::StringBuf` 5; `js::EnvironmentIter::settle() [libxul.so]` 5; `mozilla::StyleGenericSize<mozilla::StyleLengthPercentage>::~StyleGener` 4; `__lll_lock_wake [libc.so.6]` 4; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 3; `mozilla::JSHolderMap::Put(void*, nsScriptObjectTracer*, JS::Zone*) [li` 3

**tab pid 4200** — 40 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 39 | 20.4 | Other 27, DOM 4, JavaScript 4, Profiler 2 | 0 / 5 / 34 | ipc 30, array_buffer_copy 13, gc_cc 8, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `access [libc.so.6]` 4; `atp_set_real_time_limit [libxul.so]` 3; `js::XDRStencilDecoder::codeStencil(JS::ReadOnlyDecodeOptions const&, j` 2; `poll [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNative::CallMo` 2; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandle<JS::Valu` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 4205** — 40 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 39 | 22.8 | Other 28, Profiler 4, JavaScript 4, DOM 2 | 0 / 3 / 36 | ipc 29, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 3 |
| IPC I/O Child | 1 | 0.3 | Idle 0, Other 0 | 0 / 0 / 1 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__lll_lock_wake [libc.so.6]` 3; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 3; `[]` 2; `[libexpat.so.1]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `readlink [libc.so.6]` 1; `icu_78::UnicodeString::UnicodeString(icu_78::UnicodeString const&) [li` 1; `net_ExtractURLScheme(nsTSubstring<char> const&, nsTSubstring<char>&) [` 1

**tab pid 4010** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.3 | Idle 2, Graphics 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, paint_layout 0 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `nsIFrame::GetBorderRadii(nsSize const&, nsSize const&, mozilla::Sides,` 0; `nsLayoutUtils::ShouldHandleMetaViewport(mozilla::dom::Document const*)` 0

