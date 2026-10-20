### gecko-2x raf (profile pass)

**parent pid 3043** — 594 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 276 | 8.9 | Graphics 186, Idle 89, Other 1, Profiler 0 | 0 / 0 / 276 | ipc 276, webrender_render 187, webrender_sw_raster 145, poll_wait 97 |
| SwComposite | 72 | 2.3 | Other 72 | 0 / 0 / 72 | webrender_render 72, poll_wait 66, webrender_sw_raster 6, memcpy_memset 5 |
| WRRenderBackend#0 | 67 | 2.2 | Other 67 | 0 / 0 / 67 | webrender_render 1, poll_wait 1, array_buffer_copy 0 |
| GeckoMain | 61 | 2.0 | GC / CC 28, Idle 24, JavaScript 6, Other 2 | 0 / 6 / 56 | ipc 61, gc_cc 31, poll_wait 27, harness_diagnostics 5 |
| WRSceneBuilder#0 | 49 | 1.6 | Other 49 | 0 / 0 / 49 | webrender_scene 49, webrender_render 1, paint_layout 0, memcpy_memset 0 |
| Compositor | 45 | 1.5 | Idle 43, Other 2, Profiler 0 | 0 / 0 / 45 | ipc 45, poll_wait 43, webrender_render 1, paint_layout 0 |
| IPC I/O Parent | 11 | 0.3 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 24; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `syscall [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `[axiosozo-dev]` 1; `recvmsg [libc.so.6]` 1

**tab pid 3285** — 184 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 165 | 5.3 | Idle 104, Graphics 25, Layout 16, Other 8 | 0 / 7 / 157 | ipc 158, poll_wait 105, paint_layout 48, harness_diagnostics 3 |
| IPC I/O Child | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 | poll_wait 17, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 103; `sendmsg [libc.so.6]` 3; `[]` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 2; `[linux-vdso.so.1]` 2; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(unsigned lon` 2; `getcontext [libc.so.6]` 2; `mozilla::dom::EventTarget::HasNonPassiveNonSystemGroupListenersForUntr` 1

**tab pid 3374** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3190** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

