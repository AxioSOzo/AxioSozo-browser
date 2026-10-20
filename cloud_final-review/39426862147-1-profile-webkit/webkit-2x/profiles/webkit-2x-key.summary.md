### webkit-2x key (profile pass)

**parent pid 8838** — 896 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 438 | 12.0 | Idle 227, JavaScript 77, Other 38, Graphics 35 | 10 / 117 / 311 | ipc 437, poll_wait 260, gc_cc 79, paint_layout 67 |
| DOM Worker | 182 | 5.0 | JavaScript 176, Profiler 3, Other 3 | 0 / 0 / 182 | subprocess_pipe_io 182, worker_messaging 182, ipc 182, js_ctypes 169 |
| Renderer | 108 | 3.0 | Graphics 79, Idle 29, Other 0 | 0 / 0 / 108 | ipc 108, webrender_render 79, webrender_sw_raster 73, poll_wait 35 |
| SwComposite | 79 | 2.2 | Other 79 | 0 / 0 / 79 | webrender_render 79, webrender_sw_raster 43, memcpy_memset 41, poll_wait 36 |
| Timer | 26 | 0.7 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, memcpy_memset 0 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 0, poll_wait 0 |
| Compositor | 16 | 0.4 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, memcpy_memset 0, paint_layout 0 |
| WRSceneBuilder#0 | 9 | 0.3 | Other 9, Graphics 0 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 235; `[unknown]` 16; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `[axiosozo-dev]` 7; `mozilla::dom::LCPHelpers::FinalizeLCPEntryForImage(mozilla::dom::Eleme` 6; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGenericInset<m` 3; `mprotect [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 3

**tab pid 9024** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.2 | GC / CC 6, Idle 2, Other 0 | 0 / 0 / 8 | ipc 7, gc_cc 6, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `__syscall_cancel_arch [libc.so.6]` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::ScriptWarmUpData::trace(JSTracer*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `getrusage [libc.so.6]` 1; `[]` 1; `__lll_lock_wait [libc.so.6]` 0

**tab pid 8924** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, Other 1, JavaScript 0 | 0 / 0 / 7 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 1; `IPC::Message::~Message() [libxul.so]` 0; `[unknown]` 0; `mozilla::dom::ReceiveMessageArgument::ToObjectInternal(JSContext*, JS:` 0; `mozilla::dom::(anonymous namespace)::StructuredCloneCallbacksRead(JSCo` 0

**tab pid 8983** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 3, GC / CC 1, Other 0 | 0 / 0 / 4 | ipc 3, poll_wait 3, gc_cc 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 1; `NoteWeakMapsTracer::trace(JSObject*, JS::GCCellPtr, JS::GCCellPtr) [li` 1; `nsJSContext::MaybePokeCC() [libxul.so]` 0

