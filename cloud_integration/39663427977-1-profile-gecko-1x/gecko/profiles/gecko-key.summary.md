### gecko key (profile pass)

**parent pid 2968** — 323 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 216 | 5.7 | Idle 46, Layout 38, GC / CC 36, Graphics 32 | 3 / 33 / 181 | ipc 216, paint_layout 73, poll_wait 67, gc_cc 54 |
| Renderer | 36 | 1.0 | Idle 23, Graphics 13 | 0 / 0 / 36 | ipc 36, poll_wait 23, webrender_render 13, webrender_sw_raster 12 |
| WRRenderBackend#0 | 20 | 0.5 | Other 20 | 0 / 0 / 20 | webrender_render 0, poll_wait 0 |
| Compositor | 19 | 0.5 | Idle 18, Other 1, Profiler 0 | 0 / 0 / 19 | ipc 19, poll_wait 17, memcpy_memset 1, webrender_render 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, webrender_render 0, poll_wait 0, paint_layout 0 |
| IPC I/O Parent | 9 | 0.2 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0, memcpy_memset 0 |
| SwComposite | 4 | 0.1 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| Timer | 2 | 0.1 | Other 2, Profiler 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 47; `[axiosozo-dev]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 4; `[unknown]` 3; `mozilla::nsDisplayItem::GetClippedBounds(mozilla::nsDisplayListBuilder` 3; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 3

**tab pid 3222** — 77 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 69 | 1.8 | Idle 27, Other 10, GC / CC 8, Profiler 7 | 0 / 6 / 64 | ipc 63, poll_wait 31, paint_layout 19, gc_cc 12 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 28; `sendmsg [libc.so.6]` 3; `[]` 3; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::Value>, js:` 1; `nsLineLayout::ReflowFrame(nsIFrame*, nsReflowStatus&, mozilla::ReflowO` 1; `mozilla::RangeBoundaryBase<nsINode*, nsIContent*>::IsSetAndValid() con` 1; `std::_Hashtable<mozilla::DisplayItemClipChain const*, mozilla::Display` 1

**tab pid 3057** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 0, JavaScript 0, DOM 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, unsigned l` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[1` 0; `mozilla::dom::TimeoutManager::UnmarkGrayTimers() [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:598:12)[5]` 0

**tab pid 3112** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13ReserveAndP` 0

