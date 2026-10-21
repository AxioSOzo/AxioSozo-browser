### gecko-debian key (profile pass)

**parent pid 8162** — 291 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 196 | 5.2 | Layout 41, Idle 41, GC / CC 33, JavaScript 27 | 4 / 32 / 160 | ipc 196, paint_layout 64, poll_wait 61, gc_cc 51 |
| Renderer | 34 | 0.9 | Idle 19, Graphics 14, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 19, webrender_render 14, webrender_sw_raster 12 |
| WRRenderBackend#0 | 17 | 0.4 | Other 17 | 0 / 0 / 17 | memcpy_memset 0, webrender_render 0 |
| Compositor | 16 | 0.4 | Idle 15, Other 1, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, memcpy_memset 1, webrender_render 0 |
| WRSceneBuilder#0 | 13 | 0.3 | Other 13 | 0 / 0 / 13 | webrender_scene 13, webrender_render 0, poll_wait 0, array_buffer_copy 0 |
| IPC I/O Parent | 9 | 0.2 | Idle 8, Other 0 | 0 / 0 / 9 | poll_wait 8, ipc 0 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 46; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `mprotect [libc.so.6]` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4; `[axiosozo-dev]` 4; `nsFlexContainerFrame::ReflowChildren(mozilla::ReflowInput const&, nsSi` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `[unknown]` 3

**tab pid 8404** — 55 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 50 | 1.3 | Idle 20, Other 10, Layout 8, Graphics 5 | 1 / 3 / 46 | ipc 47, poll_wait 20, paint_layout 15, gc_cc 3 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 22; `[]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `nsGenericHTMLFormControlElement::GetAutocapitalize(nsTSubstring<char16` 1; `getcontext [libc.so.6]` 1; `nsLayoutUtils::GetFramesForArea(mozilla::RelativeTo, nsRect const&, ns` 1; `mozilla::ScrollContainerFrame::ReflowFinished() [libxul.so]` 1; `mozilla::Vector<mozilla::HashMapEntry<std::unique_ptr<char16_t [], JS:` 1

**tab pid 8249** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 1, Other 0, Profiler 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, gc_cc 1, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<mozilla::bas` 0; `js::UnwrapOneCheckedStatic(JSObject*) [libxul.so]` 0; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 0; `mozilla::dom::AutoEntryScript::AutoEntryScript(nsIGlobalObject*, char ` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0

**tab pid 8325** — 1 ms CPU in the window

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

