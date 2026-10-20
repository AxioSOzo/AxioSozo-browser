### gecko key (profile pass)

**parent pid 3047** — 341 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 218 | 5.7 | Idle 48, Layout 45, JavaScript 31, GC / CC 29 | 0 / 34 / 183 | ipc 217, paint_layout 78, poll_wait 71, gc_cc 42 |
| Renderer | 40 | 1.1 | Graphics 22, Idle 19 | 0 / 0 / 40 | ipc 40, webrender_render 22, poll_wait 20, webrender_sw_raster 13 |
| Compositor | 22 | 0.6 | Idle 21, Other 1, Profiler 0 | 0 / 0 / 22 | ipc 22, poll_wait 21, memcpy_memset 1, webrender_render 0 |
| WRRenderBackend#0 | 22 | 0.6 | Other 22 | 0 / 0 / 22 | webrender_render 1, poll_wait 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, webrender_render 1, poll_wait 1 |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 1 | 0 / 0 / 10 | poll_wait 9, ipc 1 |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 5, memcpy_memset 0, webrender_sw_raster 0 |
| DOM Worker | 3 | 0.1 | GC / CC 2, Other 1, Idle 0 | 0 / 0 / 3 | worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 1 |

Main thread, top self: `poll [libc.so.6]` 49; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `recvmsg [libc.so.6]` 5; `[axiosozo-dev]` 4; `__tls_get_addr [ld-linux-x86-64.so.2]` 4; `mprotect [libc.so.6]` 3; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, nsPresCont` 3

**tab pid 3287** — 78 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 70 | 1.8 | Idle 28, Other 10, GC / CC 8, Layout 7 | 0 / 7 / 63 | ipc 64, poll_wait 28, paint_layout 15, gc_cc 14 |
| IPC I/O Child | 8 | 0.2 | Idle 7, Other 0 | 0 / 0 / 8 | poll_wait 7, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 28; `sendmsg [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `[]` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 1; `nsTString<char>* nsTArray_Impl<nsTString<char>, nsTArrayInfallibleAllo` 1; `syscall [libc.so.6]` 1

**tab pid 3138** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, JavaScript 1, GC / CC 0, Profiler 0 | 0 / 1 / 6 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `[]` 1; `PerformPromiseThenWithReaction(JSContext*, JS::Handle<js::PromiseObjec` 0; `[unknown]` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0; `xpc::XrayWrapper<js::CrossCompartmentWrapper, xpc::JSXrayTraits>::getO` 0; `mprotect [libc.so.6]` 0; `js::ScopedLexicalEnvironmentObject::initScope(js::Scope*) [libxul.so]` 0

**tab pid 3189** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::TaskController::MaybeDispatchOneThreadableTask(mozilla::detai` 0

