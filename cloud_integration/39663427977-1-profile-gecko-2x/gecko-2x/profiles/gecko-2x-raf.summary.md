### gecko-2x raf (profile pass)

**parent pid 2846** — 513 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 236 | 7.7 | Graphics 152, Idle 82, Profiler 1, Other 1 | 0 / 0 / 236 | ipc 236, webrender_render 154, webrender_sw_raster 112, poll_wait 88 |
| SwComposite | 88 | 2.9 | Other 88 | 0 / 0 / 88 | webrender_render 88, poll_wait 71, webrender_sw_raster 16, memcpy_memset 16 |
| WRRenderBackend#0 | 62 | 2.0 | Other 62 | 0 / 0 / 62 | webrender_render 1, poll_wait 1, array_buffer_copy 0 |
| WRSceneBuilder#0 | 46 | 1.5 | Other 46 | 0 / 0 / 46 | webrender_scene 46, webrender_render 1, memcpy_memset 0 |
| Compositor | 39 | 1.3 | Idle 38, Other 1, Profiler 0 | 0 / 0 / 39 | ipc 39, poll_wait 38, webrender_render 0, paint_layout 0 |
| GeckoMain | 26 | 0.9 | Idle 18, JavaScript 4, Layout 2, Other 1 | 0 / 4 / 22 | ipc 26, poll_wait 18, paint_layout 3, harness_diagnostics 3 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 18; `mozilla::RetainedDisplayListBuilder::PreProcessDisplayList(mozilla::Re` 1; `js::jit::GetPropIRGenerator::tryAttachTypedArrayElement(JS::Handle<JSO` 1; `mozilla::ComputedStyle::HasAnchorPosReference() const [libxul.so]` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 1; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<nsFrameList` 1; `js::jit::MacroAssemblerX64::profilerExitFrame() [libxul.so]` 1; `js::jit::InlinableNativeIRGenerator::loadArgument(js::jit::ObjOperandI` 1

**tab pid 3106** — 169 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 155 | 5.1 | Idle 98, Graphics 17, Layout 13, Other 12 | 0 / 5 / 150 | ipc 144, poll_wait 99, paint_layout 38, gc_cc 8 |
| IPC I/O Child | 13 | 0.4 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 13 | poll_wait 13, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 98; `sendmsg [libc.so.6]` 4; `[]` 3; `[linux-vdso.so.1]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3004** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__pthread_enable_asynccancel [libc.so.6]` 0

**tab pid 3145** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

