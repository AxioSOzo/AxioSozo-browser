### gecko-debian key (profile pass)

**parent pid 8168** — 328 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 219 | 5.8 | Layout 49, Idle 38, GC / CC 38, Other 31 | 4 / 29 / 187 | ipc 218, paint_layout 75, poll_wait 70, gc_cc 50 |
| Renderer | 37 | 1.0 | Idle 23, Graphics 13 | 0 / 0 / 37 | ipc 37, poll_wait 25, webrender_render 13, webrender_sw_raster 12 |
| WRRenderBackend#0 | 21 | 0.5 | Other 21 | 0 / 0 / 21 | webrender_scene 0, memcpy_memset 0, webrender_render 0 |
| Compositor | 19 | 0.5 | Idle 18, Other 2 | 0 / 0 / 19 | ipc 19, poll_wait 18, memcpy_memset 1, paint_layout 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14, Profiler 0 | 0 / 0 / 14 | webrender_scene 14, webrender_render 1, paint_layout 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 1 | 0 / 0 / 10 | poll_wait 9, ipc 1 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 47; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `[axiosozo-dev]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 6; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, mozilla::W` 5; `mprotect [libc.so.6]` 4; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozilla::LayoutF` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 3

**tab pid 8417** — 77 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 69 | 1.8 | Idle 22, Other 11, JavaScript 9, GC / CC 9 | 1 / 8 / 59 | ipc 61, poll_wait 23, paint_layout 15, gc_cc 14 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 25; `[]` 2; `[linux-vdso.so.1]` 2; `js::jit::CheckPrivateFieldIRGenerator::tryAttachStub() [libxul.so]` 1; `void nsPurpleBuffer::VisitEntries<RemoveSkippableVisitor>(RemoveSkippa` 1; `nsWindowRoot::AddRef() [libxul.so]` 1; `js::jit::PerfSpewer::perfEnabled() const [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 8256** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0, DOM 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[linux-vdso.so.1]` 0; `js::gc::StoreBuffer::putSlot(js::NativeObject*, int, unsigned int, uns` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozilla::dom::JS` 0; `[unknown]` 0; `mozilla::dom::AutoJSAPI::Init(nsIGlobalObject*) [libxul.so]` 0; `IPC::ParamTraits<JSStructuredCloneData>::Read(IPC::MessageReader*, JSS` 0

**tab pid 8331** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

