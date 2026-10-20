### webkit switch-to-engine (profile pass)

**parent pid 7188** — 124 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 60 | 9.0 | JavaScript 58, Profiler 2, Idle 0 | 0 / 0 / 60 | subprocess_pipe_io 60, worker_messaging 60, ipc 60, poll_wait 53 |
| GeckoMain | 41 | 6.2 | Idle 13, JavaScript 12, Layout 7, DOM 3 | 3 / 18 / 21 | ipc 41, poll_wait 15, gc_cc 12, paint_layout 10 |
| Renderer | 9 | 1.3 | Graphics 8, Idle 1 | 0 / 0 / 9 | ipc 9, webrender_render 8, webrender_sw_raster 6, poll_wait 1 |
| Compositor | 3 | 0.4 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Parent | 3 | 0.4 | Idle 2, Other 0 | 0 / 0 / 3 | poll_wait 2, ipc 0 |
| BackgroundThreadPool #3 | 2 | 0.3 | Other 1, Idle 1 | 0 / 0 / 2 | ipc 2, native_receiver 1, memcpy_memset 1, poll_wait 1 |
| WRSceneBuilder#0 | 2 | 0.3 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 0 |
| WRRenderBackend#0 | 1 | 0.2 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 16; `int nsLayoutUtils::ResolveToLength<false>(mozilla::StyleLengthPercenta` 2; `[axiosozo-dev]` 2; `delimitedRead (chrome://remote/content/marionette/stream-utils.sys.mjs` 1; `next (self-hosted:392:27)[5]` 1; `style::bloom::StyleBloom<E>::push_internal [libxul.so]` 1; `js::jit::CacheIRWriter::addStubField(unsigned long, js::jit::StubField` 1; `icu_78::UnicodeSet::applyFilter(signed char (*)(int, void*), void*, ic` 1

**tab pid 7802** — 41 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 40 | 6.8 | Other 26, Profiler 7, JavaScript 3, DOM 2 | 0 / 4 / 36 | ipc 30, array_buffer_copy 12, gc_cc 7, poll_wait 2 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 5; `[libfontconfig.so.1]` 3; `syscall [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 1; `AutoProfilerTextMarker::~AutoProfilerTextMarker() [libxul.so]` 1

**tab pid 7806** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 1.3 | DOM 4, Other 3, JavaScript 1, Idle 1 | 0 / 4 / 4 | ipc 9, gc_cc 6, array_buffer_copy 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `mozilla::extensions::WebExtensionContentScript::WebExtensionContentScr` 2; `__syscall_cancel_arch [libc.so.6]` 1; `[]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 1; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `next (self-hosted:2415:25)[5]` 0

**tab pid 7712** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::dom::Element::DescribeAttribute(unsigned int, nsTSubstring<ch` 0

