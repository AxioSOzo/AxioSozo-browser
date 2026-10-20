### gecko-debian scroll (profile pass)

**parent pid 8213** — 1010 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 661 | 32.2 | Graphics 605, Idle 56 | 0 / 0 / 661 | ipc 651, webrender_render 605, webrender_sw_raster 562, poll_wait 60 |
| GeckoMain | 151 | 7.4 | Idle 75, GC / CC 34, Other 13, JavaScript 9 | 1 / 8 / 142 | ipc 148, poll_wait 98, gc_cc 38, paint_layout 15 |
| WRRenderBackend#0 | 81 | 4.0 | Other 81 | 0 / 0 / 81 | webrender_render 2, poll_wait 1 |
| SwComposite | 45 | 2.2 | Other 45 | 0 / 0 / 45 | webrender_render 45, poll_wait 39, webrender_sw_raster 5, memcpy_memset 5 |
| Compositor | 33 | 1.6 | Idle 32, Other 0, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, webrender_scene 0, canvas_2d 0 |
| WRSceneBuilder#0 | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_scene 23, webrender_render 2 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 82; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `[axiosozo-dev]` 4; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 3; `[linux-vdso.so.1]` 2; `syscall [libc.so.6]` 2; `mozilla::ComputedStyle::IsFixedPosContainingBlock(nsIFrame const*) con` 2

**tab pid 8455** — 130 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 113 | 5.5 | Idle 65, Graphics 19, Other 11, GC / CC 8 | 0 / 5 / 108 | ipc 109, poll_wait 66, paint_layout 24, gc_cc 11 |
| IPC I/O Child | 16 | 0.8 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 67; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 2; `mozilla::layers::HitTestInfoManager::ProcessItem(mozilla::nsDisplayIte` 1; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 1; `zen::ZenMouseTracker::AddRef() [libxul.so]` 1; `XPCJSContext::AfterProcessTask(unsigned int) [libxul.so]` 1; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBarrier(js::` 1

**tab pid 8379** — 1 ms CPU in the window

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

**tab pid 8547** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

