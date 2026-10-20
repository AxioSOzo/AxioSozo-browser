### gecko scroll (profile pass)

**parent pid 3045** — 1028 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 679 | 32.6 | Graphics 618, Idle 62, Other 0 | 0 / 0 / 679 | ipc 677, webrender_render 618, webrender_sw_raster 582, poll_wait 66 |
| GeckoMain | 142 | 6.8 | Idle 78, Other 25, GC / CC 11, Graphics 9 | 1 / 10 / 131 | ipc 142, poll_wait 112, paint_layout 15, gc_cc 14 |
| WRRenderBackend#0 | 90 | 4.3 | Other 90 | 0 / 0 / 90 | webrender_render 1, memcpy_memset 1, array_buffer_copy 0 |
| SwComposite | 42 | 2.0 | Other 42 | 0 / 0 / 42 | webrender_render 42, poll_wait 39, memcpy_memset 3, webrender_sw_raster 3 |
| Compositor | 37 | 1.8 | Idle 36, Other 1 | 0 / 0 / 37 | ipc 37, poll_wait 36, memcpy_memset 0, paint_layout 0 |
| WRSceneBuilder#0 | 23 | 1.1 | Other 23, Profiler 0 | 0 / 0 / 23 | webrender_scene 23, webrender_render 1, memcpy_memset 0, array_buffer_copy 0 |
| IPC I/O Parent | 10 | 0.5 | Idle 9, Other 0 | 0 / 0 / 10 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 2 | 0.1 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 80; `recvmsg [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `nsINode::UnoptimizableCCNode() const [libxul.so]` 2; `writev [libc.so.6]` 2; `js::jit::CacheIRWriter::writeOperandId(js::jit::OperandId) [libxul.so]` 2; `[libgdk-3.so.0]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 1

**tab pid 3297** — 146 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 125 | 6.0 | Idle 72, Graphics 21, Other 11, GC / CC 7 | 0 / 5 / 120 | ipc 121, poll_wait 73, paint_layout 31, gc_cc 8 |
| IPC I/O Child | 19 | 0.9 | Idle 19, Other 0 | 0 / 0 / 19 | poll_wait 19, ipc 0 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 72; `[]` 4; `sendmsg [libc.so.6]` 3; `webrender_api::display_list::AuGrid::rect [libxul.so]` 2; `NonZeroCorner(mozilla::StyleLengthPercentage const&) [libxul.so]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `mozilla::RunnableTask::~RunnableTask() [libxul.so]` 1; `mozilla::CycleCollectedJSRuntime::NoteGCThingXPCOMChildren(JSClass con` 1

**tab pid 3190** — 1 ms CPU in the window

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

**tab pid 3387** — 1 ms CPU in the window

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

