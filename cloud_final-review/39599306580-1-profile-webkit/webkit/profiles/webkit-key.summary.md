### webkit key (profile pass)

**parent pid 7154** — 1011 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 590 | 16.0 | Idle 247, JavaScript 109, GC / CC 71, Layout 47 | 14 / 160 / 416 | ipc 587, poll_wait 296, gc_cc 170, paint_layout 93 |
| DOM Worker | 251 | 6.8 | JavaScript 244, Other 3, Profiler 3, GC / CC 1 | 0 / 0 / 251 | subprocess_pipe_io 251, worker_messaging 251, ipc 251, js_ctypes 241 |
| Renderer | 56 | 1.5 | Graphics 37, Idle 19, Other 0 | 0 / 0 / 56 | ipc 56, webrender_render 37, webrender_sw_raster 33, poll_wait 19 |
| Timer | 35 | 1.0 | Other 35, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 35 |
| SwComposite | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 18, poll_wait 14, memcpy_memset 3, webrender_sw_raster 3 |
| Compositor | 18 | 0.5 | Idle 16, Other 1, Graphics 0 | 0 / 0 / 18 | ipc 18, poll_wait 16, memcpy_memset 1, paint_layout 0 |
| WRRenderBackend#0 | 16 | 0.4 | Other 16 | 0 / 0 / 16 | webrender_render 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 | webrender_scene 9, paint_layout 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 269; `[unknown]` 25; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 13; `[axiosozo-dev]` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4

**tab pid 7239** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Other 0 | 0 / 0 / 7 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `JSStructuredCloneData::AppendBytes(char const*, unsigned long) [libxul` 0; `nsIGlobalObject::CanRunJSMicroTask(JSObject*) const [libxul.so]` 0; `xpc::XrayTraits::resolveOwnProperty(JSContext*, JS::Handle<JSObject*>,` 0; `mozilla::AutoProfilerLabel::AutoProfilerLabel(char const*, char const*` 0

**tab pid 7332** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7313** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

