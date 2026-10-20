### webkit-2x switch-to-gecko (profile pass)

**parent pid 8720** — 138 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 66 | 23.6 | JavaScript 25, DOM 12, Other 10, Layout 8 | 1 / 47 / 18 | ipc 65, gc_cc 19, array_buffer_copy 17, paint_layout 11 |
| Renderer | 40 | 14.3 | Graphics 36, Idle 4 | 0 / 0 / 40 | ipc 40, webrender_render 36, webrender_sw_raster 36, poll_wait 4 |
| DOM Worker | 14 | 4.9 | JavaScript 13, Idle 1 | 0 / 0 / 14 | subprocess_pipe_io 14, worker_messaging 14, ipc 14, poll_wait 13 |
| SwComposite | 6 | 2.3 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 6, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 4 | 1.3 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 0 |
| WRRenderBackend#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 |  |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, memcpy_memset 0, ipc 0 |
| WRSceneBuilder#0 | 2 | 0.6 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 5; `[axiosozo-dev]` 4; `js::jit::X86Encoding::BaseAssembler::X86InstructionFormatter::legacySS` 3; `[unknown]` 2; `AutoPopupStatePusherInternal::~AutoPopupStatePusherInternal() [libxul.` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 2; `__lll_lock_wait [libc.so.6]` 1

**tab pid 9270** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 9.3 | JavaScript 10, Other 8, Idle 4, DOM 1 | 0 / 11 / 15 | ipc 23, paint_layout 10, gc_cc 7, poll_wait 4 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 2; `mozilla::detail::nsTStringRepr<char>::Equals(mozilla::detail::nsTStrin` 2; `nsTHashtable<nsBaseHashtableET<nsCStringHashKey, RefPtr<mozilla::dom::` 1; `js::DefineDataProperty(JSContext*, JS::Handle<JSObject*>, JS::Handle<J` 1; `js::StringEqualsAscii(JSLinearString const*, char const*, unsigned lon` 1; `profiler_active_without_feature(unsigned int) [libxul.so]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, mozilla::U` 1

**tab pid 8810** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 1.6 | Idle 2, JavaScript 1, Other 1 | 0 / 1 / 3 | ipc 4, poll_wait 2, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::BaselineCompilerHandler::line() const [libxul.so]` 1; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS::Value con` 0; `[]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::AllocateBytes(unsigned lon` 0; `get cloneScope (resource://gre/modules/ExtensionPageChild.sys.mjs:173:` 0; `js::jit::CanBaselineCompileScript(JSContext*, JSScript*) [libxul.so]` 0

**tab pid 8882** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

