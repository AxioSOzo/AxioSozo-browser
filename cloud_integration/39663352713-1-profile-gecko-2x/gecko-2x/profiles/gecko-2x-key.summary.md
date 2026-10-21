### gecko-2x key (profile pass)

**parent pid 2872** — 211 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 110 | 2.9 | Idle 36, Graphics 19, Layout 17, Other 16 | 1 / 18 / 91 | ipc 110, poll_wait 46, paint_layout 40, gc_cc 6 |
| Renderer | 43 | 1.1 | Graphics 22, Idle 21 | 0 / 0 / 43 | ipc 43, poll_wait 23, webrender_render 22, webrender_sw_raster 18 |
| SwComposite | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_render 13, poll_wait 8, memcpy_memset 5, webrender_sw_raster 5 |
| Compositor | 13 | 0.4 | Idle 12, Other 1 | 0 / 0 / 13 | ipc 13, poll_wait 12, memcpy_memset 1, webrender_render 0 |
| WRRenderBackend#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | webrender_render 0 |
| WRSceneBuilder#0 | 9 | 0.3 | Other 9 | 0 / 0 / 9 | webrender_scene 9, array_buffer_copy 0, memcpy_memset 0 |
| IPC I/O Parent | 6 | 0.2 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 6 | poll_wait 6, ipc 0, memcpy_memset 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 37; `[axiosozo-dev]` 5; `[unknown]` 5; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisplayListBui` 3; `recvmsg [libc.so.6]` 3; `mozilla::ScrollContainerFrame::BuildDisplayList(mozilla::nsDisplayList` 3; `__lll_lock_wait [libc.so.6]` 2; `nsCSSRendering::FindBackgroundFrame(nsIFrame const*) [libxul.so]` 2

**tab pid 3186** — 54 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 1.3 | Idle 23, GC / CC 8, Other 7, JavaScript 3 | 0 / 4 / 44 | ipc 47, poll_wait 24, gc_cc 10, paint_layout 8 |
| IPC I/O Child | 5 | 0.1 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `ChildFinder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry const*) [lib` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::IndirectBindingMap::trace(JSTracer*) [libxul.so]` 1

**tab pid 3023** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.1 | Idle 4, Other 0, Profiler 0, JavaScript 0 | 0 / 0 / 5 | ipc 5, poll_wait 4, gc_cc 0, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `mojo::core::ports::Node::PrepareToForwardUserMessage(mojo::core::ports` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuffer::PutObj` 0; `[unknown]` 0; `nsWindowRoot::AddRef() [libxul.so]` 0; `[]` 0

**tab pid 3072** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

