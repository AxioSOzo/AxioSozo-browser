### gecko key (profile pass)

**parent pid 3064** — 293 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 194 | 5.1 | Idle 43, Layout 40, GC / CC 29, Other 24 | 4 / 28 / 163 | ipc 194, paint_layout 70, poll_wait 58, gc_cc 41 |
| Renderer | 34 | 0.9 | Idle 19, Graphics 15 | 0 / 0 / 34 | ipc 34, poll_wait 19, webrender_render 15, webrender_sw_raster 12 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 0, poll_wait 0 |
| Compositor | 17 | 0.5 | Idle 17, Other 1 | 0 / 0 / 17 | ipc 17, poll_wait 17, memcpy_memset 0, webrender_render 0 |
| WRSceneBuilder#0 | 13 | 0.3 | Other 13 | 0 / 0 / 13 | webrender_scene 13, webrender_render 1, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.2 | Idle 8, Other 0 | 0 / 0 / 9 | poll_wait 8, ipc 0 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 44; `nsFlexContainerFrame::GenerateFlexItemForChild(nsFlexContainerFrame::F` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `array_splice_impl(JSContext*, unsigned int, JS::Value*, bool) [libxul.` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3; `[axiosozo-dev]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 3; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 3

**tab pid 3312** — 70 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 63 | 1.7 | Idle 23, JavaScript 8, Layout 8, GC / CC 8 | 1 / 8 / 54 | ipc 59, poll_wait 23, paint_layout 14, gc_cc 11 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 23; `[]` 3; `sendmsg [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 1; `getcontext [libc.so.6]` 1; `SystemGlobal::GetGlobalJSObject() [libxul.so]` 1; `mozilla::ApplyClip(mozilla::nsDisplayListBuilder*, mozilla::DisplayIte` 1

**tab pid 3158** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Profiler 0, DOM 0, GC / CC 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, gc_cc 0, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `void mozilla::ProfileBufferEntryWriter::WriteObjects<mozilla::ProfileB` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `RemoveSkippableVisitor::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [` 0; `read [libc.so.6]` 0

**tab pid 3316** — 1 ms CPU in the window

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

