### gecko key (profile pass)

**parent pid 3045** — 346 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 227 | 6.0 | Idle 47, Layout 41, Graphics 33, GC / CC 33 | 0 / 42 / 185 | ipc 227, paint_layout 79, poll_wait 73, gc_cc 55 |
| Renderer | 40 | 1.0 | Idle 24, Graphics 16, Other 1 | 0 / 0 / 40 | ipc 39, poll_wait 26, webrender_render 16, webrender_sw_raster 11 |
| WRRenderBackend#0 | 23 | 0.6 | Other 23 | 0 / 0 / 23 |  |
| Compositor | 23 | 0.6 | Idle 22, Other 0 | 0 / 0 / 23 | ipc 23, poll_wait 22, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_scene 15, webrender_render 0 |
| IPC I/O Parent | 11 | 0.3 | Idle 10, Other 0, Profiler 0 | 0 / 0 / 11 | poll_wait 10, ipc 0 |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 5, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 47; `[axiosozo-dev]` 10; `recvmsg [libc.so.6]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `mprotect [libc.so.6]` 4; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&, mozilla::` 3

**tab pid 3297** — 82 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 73 | 1.9 | Idle 26, Other 12, GC / CC 10, Layout 9 | 0 / 7 / 67 | ipc 67, poll_wait 27, paint_layout 15, gc_cc 12 |
| IPC I/O Child | 8 | 0.2 | Idle 7, Other 0 | 0 / 0 / 8 | poll_wait 7, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 26; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[]` 2; `sendmsg [libc.so.6]` 2; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [libxul.` 1; `syscall [libc.so.6]` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 1; `mozilla::RunnableTask::~RunnableTask() [libxul.so]` 1

**tab pid 3138** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 0, GC / CC 0, JavaScript 0 | 0 / 0 / 7 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `<firefox_on_glean::private::labeled_timing_distribution::LabeledTiming` 0; `PR_Unlock [libnspr4.so]` 0; `sendmsg [libc.so.6]` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 0; `JSRuntime::getHostDefinedData(JSContext*, JS::MutableHandle<JSObject*>` 0

**tab pid 3190** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

