### gecko scroll (profile pass)

**parent pid 3064** — 898 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 624 | 29.8 | Graphics 566, Idle 55, Profiler 2, Other 1 | 0 / 0 / 624 | ipc 612, webrender_render 568, webrender_sw_raster 525, poll_wait 61 |
| GeckoMain | 107 | 5.1 | Idle 65, Other 12, GC / CC 11, JavaScript 10 | 1 / 10 / 96 | ipc 107, poll_wait 78, gc_cc 15, paint_layout 10 |
| WRRenderBackend#0 | 69 | 3.3 | Other 69 | 0 / 0 / 69 | webrender_render 1, memcpy_memset 1, poll_wait 0, gc_cc 0 |
| SwComposite | 33 | 1.6 | Other 33 | 0 / 0 / 33 | webrender_render 33, poll_wait 32, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 30 | 1.4 | Idle 29, Other 1, Profiler 0 | 0 / 0 / 30 | ipc 30, poll_wait 29, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 21 | 1.0 | Other 21 | 0 / 0 / 21 | webrender_scene 21, memcpy_memset 0, webrender_render 0, paint_layout 0 |
| IPC I/O Parent | 8 | 0.4 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 64; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 3; `mojo::core::ports::Node::GetUserData(mojo::core::ports::PortRef const&` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `recvmsg [libc.so.6]` 1; `[axiosozo-dev]` 1

**tab pid 3312** — 109 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 94 | 4.5 | Idle 64, Graphics 11, GC / CC 8, Other 5 | 0 / 5 / 89 | ipc 90, poll_wait 65, paint_layout 14, gc_cc 11 |
| IPC I/O Child | 15 | 0.7 | Idle 14, Other 0 | 0 / 0 / 15 | poll_wait 14, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 64; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `GetTrimmableWhitespaceCount(mozilla::dom::CharacterDataBuffer const&, ` 1; `sendmsg [libc.so.6]` 1; `nsTextFrame::PaintText(nsTextFrame::PaintTextParams const&, int, int, ` 1; `[linux-vdso.so.1]` 1; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [libxul.so]` 1

**tab pid 3211** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAutoLock<mozi` 0; `[linux-vdso.so.1]` 0

**tab pid 3316** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

