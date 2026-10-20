### gecko-debian scroll (profile pass)

**parent pid 8124** — 993 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 649 | 31.8 | Graphics 593, Idle 56, Other 0 | 0 / 0 / 649 | ipc 643, webrender_render 593, webrender_sw_raster 549, poll_wait 58 |
| GeckoMain | 153 | 7.5 | Idle 73, GC / CC 36, Other 19, Graphics 9 | 0 / 9 / 144 | ipc 153, poll_wait 101, gc_cc 40, paint_layout 14 |
| WRRenderBackend#0 | 80 | 3.9 | Other 80 | 0 / 0 / 80 | webrender_render 2, poll_wait 2, memcpy_memset 1 |
| SwComposite | 39 | 1.9 | Other 39 | 0 / 0 / 39 | webrender_render 39, poll_wait 36, memcpy_memset 4, webrender_sw_raster 4 |
| Compositor | 33 | 1.6 | Idle 33, Other 0, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 33, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_scene 23, webrender_render 1, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 82; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 5; `[axiosozo-dev]` 3; `mozilla::dom::CallbackObject::cycleCollection::CanSkipReal(void*, bool` 3; `nsLayoutUtils::GetParentOrPlaceholderForCrossDoc(nsIFrame const*) [lib` 2; `__lll_lock_wait [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 1

**tab pid 8377** — 127 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 110 | 5.4 | Idle 65, Graphics 21, Other 9, GC / CC 7 | 0 / 4 / 106 | ipc 106, poll_wait 65, paint_layout 26, gc_cc 12 |
| IPC I/O Child | 16 | 0.8 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 66; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 2; `[]` 1; `peek_poke::poke_into_vec [libxul.so]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `mozilla::ipc::MessageChannel::SendMessageToLink(std::unique_ptr<IPC::M` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1

**tab pid 8384** — 1 ms CPU in the window

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

**tab pid 8271** — 1 ms CPU in the window

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

