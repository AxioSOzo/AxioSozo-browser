### gecko-2x raf-nosampler (profile pass)

**parent pid 2872** — 443 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 235 | 7.8 | Graphics 145, Idle 86, Other 3, Profiler 1 | 0 / 0 / 235 | ipc 234, webrender_render 147, webrender_sw_raster 117, poll_wait 87 |
| SwComposite | 45 | 1.5 | Other 45 | 0 / 0 / 45 | webrender_render 45, poll_wait 41, webrender_sw_raster 4, memcpy_memset 3 |
| WRRenderBackend#0 | 41 | 1.4 | Other 41 | 0 / 0 / 41 | poll_wait 1, webrender_render 0 |
| GeckoMain | 40 | 1.3 | GC / CC 25, Idle 9, Other 3, JavaScript 3 | 0 / 2 / 38 | ipc 40, gc_cc 29, poll_wait 10, harness_diagnostics 2 |
| Compositor | 34 | 1.1 | Idle 33, Other 1, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 33, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 32 | 1.1 | Other 32, Profiler 0 | 0 / 0 / 32 | webrender_scene 32, webrender_render 1, poll_wait 0, paint_layout 0 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `poll [libc.so.6]` 9; `mprotect [libc.so.6]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1; `recvmsg [libc.so.6]` 1

**tab pid 3186** — 124 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 111 | 3.7 | Idle 83, Graphics 8, Other 7, Layout 6 | 0 / 2 / 109 | ipc 108, poll_wait 84, paint_layout 17, gc_cc 6 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 82; `sendmsg [libc.so.6]` 2; `[]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 1; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 1; `bool mozilla::detail::HashTable<char const* const, mozilla::HashSet<ch` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `mozilla::ScrollContainerFrame::GetScrollStyles() const [libxul.so]` 1

**tab pid 3072** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3093** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

