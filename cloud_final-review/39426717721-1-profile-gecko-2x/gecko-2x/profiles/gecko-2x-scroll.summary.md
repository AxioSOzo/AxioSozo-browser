### gecko-2x scroll (profile pass)

**parent pid 3036** — 1942 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 1505 | 72.1 | Graphics 1455, Idle 47, Other 1, Profiler 1 | 0 / 0 / 1505 | ipc 1484, webrender_render 1456, webrender_sw_raster 1374, poll_wait 48 |
| SwComposite | 138 | 6.6 | Other 138 | 0 / 0 / 138 | webrender_render 138, poll_wait 128, webrender_sw_raster 10, memcpy_memset 10 |
| GeckoMain | 133 | 6.4 | Idle 73, Other 18, Graphics 13, JavaScript 11 | 2 / 9 / 122 | ipc 133, poll_wait 103, paint_layout 21, gc_cc 13 |
| WRRenderBackend#0 | 96 | 4.6 | Other 96 | 0 / 0 / 96 | webrender_render 2, poll_wait 1, memcpy_memset 0 |
| Compositor | 34 | 1.6 | Idle 33, Other 1, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 33, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 23 | 1.1 | Other 23 | 0 / 0 / 23 | webrender_scene 23, webrender_render 1, poll_wait 0, paint_layout 0 |
| IPC I/O Parent | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 74; `mozilla::layers::WebRenderCommandBuilder::CreateWebRenderCommandsFromD` 3; `mozilla::dom::BrowserHost::QueryInterface(nsID const&, void**) [libxul` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 3; `recvmsg [libc.so.6]` 2; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIFrame*, nsF` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 2

**tab pid 3304** — 130 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 111 | 5.3 | Idle 74, Graphics 12, Other 9, GC / CC 6 | 0 / 5 / 107 | ipc 109, poll_wait 76, paint_layout 18, gc_cc 8 |
| IPC I/O Child | 17 | 0.8 | Idle 17, Other 0, Profiler 0 | 0 / 0 / 17 | poll_wait 17, ipc 0 |
| Timer | 2 | 0.1 | Other 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 75; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1; `sendmsg [libc.so.6]` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 1

**tab pid 3203** — 1 ms CPU in the window

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

**tab pid 3181** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `TimerThread::RemoveTimerInternal(nsTimerImpl&) [libxul.so]` 0

